package ui

import (
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/kargirwar/golang/utils"
	"github.com/kargirwar/golang/utils/emailer"
	"github.com/kargirwar/prosql-go/db"
	"github.com/kargirwar/prosql-go/models/user"
	//log "github.com/sirupsen/logrus"
	//"github.com/tidwall/gjson"
	"errors"
	"net/http"
	//"encoding/json"
	//"os"
	//"time"
	//"io"
	"bytes"
	"context"
	"encoding/gob"
	"fmt"
	"github.com/Joker/jade"
	"html/template"
	"strconv"
)

const MIN_OTP = 100000
const MAX_OTP = 999999

const OTP = "otp"
const TEMP_USER = "temp-user"
const DEVICE_ID = "device-id"
const VERSION = "version"
const OS = "os"

var store *sessions.CookieStore
var sessionName string

func init() {
	//https://stackoverflow.com/questions/24834480/using-custom-types-with-gorilla-sessions
	gob.Register(user.User{})
}

func SetSessionStore(s *sessions.CookieStore, session string) {
	store = s
	sessionName = session
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	action := mux.Vars(r)["action"]
	switch action {
	case "signin":
		signin(w, r)

	case "set-signin-otp":
		setSigninOtp(w, r)
	}
}

func signin(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, sessionName)
	u, present := session.Values[TEMP_USER]
	if present {
		utils.Dbg(r.Context(), "fn: "+u.(user.User).FirstName)
	}

	utils.SendSuccess(r.Context(), w, nil)
}

func setSigninOtp(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		utils.SendError(r.Context(), w, errors.New("invalid-input"), "invalid-input")
		return
	}

	defer r.Body.Close()

	sqlite, err := db.OpenDb(r.Context(), "data.db")
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	defer sqlite.Close()

	users, err := user.GetByEmail(r.Context(), sqlite, r.FormValue("email"))

	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	if len(*users) == 0 {
		utils.SendError(r.Context(), w, errors.New("Unknown user. Please sign up first"), "invalid-input")
		return
	}

	utils.Dbg(r.Context(), fmt.Sprintf("%v", (*users)[0]))

	session, _ := store.Get(r, sessionName)

	otp := utils.RandInt(MIN_OTP, MAX_OTP)
	session.Values[OTP] = otp
	session.Values[TEMP_USER] = (*users)[0]

	session.Values[DEVICE_ID] = r.FormValue("device-id")
	session.Values[VERSION] = r.FormValue("version")
	session.Values[OS] = r.FormValue("os")

	err = session.Save(r, w)
	if err != nil {
		utils.Dbg(r.Context(), err.Error())
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "interal-server-error")
		return
	}

	if err = sendSigninOtp(r.Context(), (*users)[0], strconv.Itoa(otp)); err != nil {
		utils.Dbg(r.Context(), err.Error())
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "interal-server-error")
		return
	}

	utils.SendSuccess(r.Context(), w, nil)
}

func sendSigninOtp(ctx context.Context, u user.User, otp string) error {
	tmpl, err := jade.Parse("jade", []byte(otpTemplate))

	if err != nil {
		utils.Dbg(ctx, err.Error())
		return err
	}

	goTpl, _ := template.New("html").Parse(tmpl)

	var out bytes.Buffer
	if err := goTpl.Execute(&out, struct {
		Name string
		Otp  string
	}{u.FirstName, otp}); err != nil {
		utils.Dbg(ctx, err.Error())
		return err
	}

	return emailer.Send(ctx, u.Email, "Prosql", "tech@prosql.io", "Otp for signining in", out.String())
}
