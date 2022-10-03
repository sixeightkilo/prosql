package ui

import (
	"github.com/gorilla/mux"
	"github.com/kargirwar/golang/utils"
	//"github.com/kargirwar/golang/utils/emailer"
	"github.com/kargirwar/prosql-go/constants"
	"github.com/kargirwar/prosql-go/db"
	"github.com/kargirwar/prosql-go/models/user"
	"github.com/kargirwar/prosql-go/models/device"
	"github.com/kargirwar/prosql-go/types"
	//"github.com/kargirwar/prosql-go/app"
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
	//"encoding/gob"
	"fmt"
	"github.com/Joker/jade"
	_ "github.com/Joker/hpp"
	_ "github.com/valyala/bytebufferpool"
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

var service types.ServiceProvider
func SetServiceProvider(sp types.ServiceProvider) {
	service = sp
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
	session := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)
	otp, _ := session.Get(r, OTP)
	utils.Dbg(r.Context(), "otp: "+otp.(string))

	if otp != r.FormValue("otp") {
		utils.SendError(r.Context(), w, errors.New("Invalid otp"), "invalid-input")
		return
	}

	u, present := session.Get(r, TEMP_USER)
	if !present {
		utils.Dbg(r.Context(), "temp user not found")
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "internal-server-error")
		return
	}

	deviceId, present := session.Get(r, DEVICE_ID)
	if !present {
		utils.Dbg(r.Context(), "device id not found")
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "internal-server-error")
		return
	}

	sqlite, err := db.OpenDb(r.Context(), "data.db")
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	err = device.SetUserId(r.Context(), sqlite, deviceId.(string), u.(user.User).Id)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	session.Set(r, TEMP_USER, "")
	session.Set(r, OTP,  "")
	session.Set(r, constants.USER, u)

	err = session.Save(r, w)
	if err != nil {
		utils.Dbg(r.Context(), err.Error())
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "interal-server-error")
		return
	}

	defer sqlite.Close()

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

	session := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)

	otp := utils.RandInt(MIN_OTP, MAX_OTP)
	session.Set(r, OTP, strconv.Itoa(otp))
	session.Set(r, TEMP_USER, (*users)[0])

	session.Set(r, DEVICE_ID, r.FormValue("device-id"))
	session.Set(r, VERSION, r.FormValue("version"))
	session.Set(r, OS, r.FormValue("os"))

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

	config := service.Get(types.SERVICE_CONFIG).(types.Config)
	emailer := service.Get(types.SERVICE_EMAILER).(types.Emailer)
	return emailer.Send(ctx, u.Email,
		config.Email["from-name"], config.Email["from-email"], "Otp for signining in", out.String())
}

//debug
func TestHandler(w http.ResponseWriter, r *http.Request) {
	s := service.Get(types.SERVICE_EMAILER)
	if e, ok := s.(types.Emailer); ok {
		e.Send(r.Context(), "kargirwar@gmail.com", "PK", "tech@prosql.io", "Test", "Test")
	}

	utils.SendSuccess(r.Context(), w, nil)
}
