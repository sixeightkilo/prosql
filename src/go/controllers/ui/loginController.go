package ui

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	_ "github.com/Joker/hpp"
	"github.com/Joker/jade"
	"github.com/go-ozzo/ozzo-validation"
	"github.com/go-ozzo/ozzo-validation/is"
	"github.com/gorilla/mux"
	"github.com/kargirwar/golang/utils"
	//"github.com/kargirwar/prosql-go/constants"
	"github.com/kargirwar/prosql-go/db"
	"github.com/kargirwar/prosql-go/models/device"
	"github.com/kargirwar/prosql-go/models/user"
	"github.com/kargirwar/prosql-go/types"
	_ "github.com/valyala/bytebufferpool"
	"html/template"
	"net/http"
	"strconv"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	action := mux.Vars(r)["action"]
	switch action {
	case "signin":
		signin(w, r)

	case "set-signin-otp":
		setSigninOtp(w, r)

	case "set-signup-otp":
		setSignupOtp(w, r)

	case "signup":
		signup(w, r)
	}
}

func signup(w http.ResponseWriter, r *http.Request) {
	sm := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)
	otp, _ := sm.Get(r, OTP)
	utils.Dbg(r.Context(), "otp: "+otp.(string))

	if otp != r.FormValue("otp") {
		utils.SendError(r.Context(), w, errors.New("Invalid otp"), "invalid-input")
		return
	}

	u, present := sm.Get(r, TEMP_USER)
	if !present {
		utils.Dbg(r.Context(), "temp user not found")
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "internal-server-error")
		return
	}

	usr := u.(user.User)

	sqlite, err := db.OpenDb(r.Context(), "data.db")
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	//save user to web DB
	id, err := user.Save(r.Context(), sqlite, usr)
	if err != nil {
		utils.Dbg(r.Context(), err.Error())
		utils.SendError(r.Context(), w, err, "internal-server-error")
		return
	}

	usr.Id = id

	deviceId, present := sm.Get(r, DEVICE_ID)
	if !present {
		utils.Dbg(r.Context(), "device id not found")
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "internal-server-error")
		return
	}

	err = device.SetUserId(r.Context(), sqlite, deviceId.(string), usr.Id)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	sm.Set(r, TEMP_USER, "")
	sm.Set(r, OTP, "")
	sm.Set(r, USER, usr)

	err = sm.Save(r, w)
	if err != nil {
		utils.Dbg(r.Context(), err.Error())
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "interal-server-error")
		return
	}

	defer sqlite.Close()

	utils.SendSuccess(r.Context(), w, nil)
}

func CaptchaHandler(w http.ResponseWriter, r *http.Request) {
	captchaService := service.Get(types.SERVICE_CAPTCHA).(types.CaptchService)

	action := mux.Vars(r)["action"]
	switch action {
	case "get":
		id, img, err := captchaService.Get()
		if err != nil {
			utils.Dbg(r.Context(), err.Error())
			utils.SendError(r.Context(), w,
				errors.New("unable to get captcha"), "internal-server-error")
			return
		}

		utils.SendSuccess(r.Context(), w, struct {
			Id  string `json:"id"`
			Img string `json:"image"`
		}{Id: id, Img: img})
		return
	}
}

func signin(w http.ResponseWriter, r *http.Request) {
	sm := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)
	otp, present := sm.Get(r, OTP)
	if !present {
		utils.Dbg(r.Context(), "otp not found")
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "internal-server-error")
		return
	}
	//utils.Dbg(r.Context(), "otp: "+otp.(string))

	if otp != r.FormValue("otp") {
		utils.SendError(r.Context(), w, errors.New("Invalid otp"), "invalid-input")
		return
	}

	u, present := sm.Get(r, TEMP_USER)
	if !present {
		utils.Dbg(r.Context(), "temp user not found")
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "internal-server-error")
		return
	}

	deviceId, present := sm.Get(r, DEVICE_ID)
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

	sm.Set(r, TEMP_USER, "")
	sm.Set(r, OTP, "")
	sm.Set(r, USER, u)

	err = sm.Save(r, w)
	if err != nil {
		utils.Dbg(r.Context(), err.Error())
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "interal-server-error")
		return
	}

	defer sqlite.Close()

	utils.SendSuccess(r.Context(), w, nil)
}

func setSignupOtp(w http.ResponseWriter, r *http.Request) {
	err := validate(r)
	if err != nil {
		utils.SendError(r.Context(), w, err, "invalid-input")
		return
	}

	//check existing user
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

	if len(*users) != 0 {
		utils.SendError(r.Context(), w, errors.New("Already registered. Please sign in"), "invalid-input")
		return
	}

	sm := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)

	otp := utils.RandInt(MIN_OTP, MAX_OTP)
	sm.Set(r, OTP, strconv.Itoa(otp))
	u := user.User{
		FirstName: r.FormValue("first-name"),
		LastName:  r.FormValue("last-name"),
		Email:     r.FormValue("email"),
	}
	sm.Set(r, TEMP_USER, u)

	sm.Set(r, DEVICE_ID, r.FormValue("device-id"))
	sm.Set(r, VERSION, r.FormValue("version"))
	sm.Set(r, OS, r.FormValue("os"))

	err = sm.Save(r, w)
	if err != nil {
		utils.Dbg(r.Context(), err.Error())
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "interal-server-error")
		return
	}

	if err = sendOtp(r.Context(), u,
		strconv.Itoa(otp), "Otp for signing up!"); err != nil {
		utils.Dbg(r.Context(), err.Error())
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "interal-server-error")
		return
	}

	utils.SendSuccess(r.Context(), w, nil)
}

func validate(r *http.Request) error {
	//validate captcha
	err := validateCaptcha(r)
	if err != nil {
		return err
	}

	//validate rest of form
	err = validation.Errors{
		"First name": validation.Validate(r.FormValue("first-name"), validation.Required),
		"Last name":  validation.Validate(r.FormValue("last-name"), validation.Required),
		"Email":      validation.Validate(r.FormValue("email"), validation.Required, is.Email),
	}.Filter()

	return err
}

func validateCaptcha(r *http.Request) error {
	captchaId := r.FormValue("captcha-id")
	captchaValue := r.FormValue("captcha-value")

	utils.Dbg(r.Context(), "id: "+captchaId)
	utils.Dbg(r.Context(), "value: "+captchaValue)

	captchaService := service.Get(types.SERVICE_CAPTCHA).(types.CaptchService)
	valid, err := captchaService.IsValid(captchaId, captchaValue)
	if err != nil {
		utils.Dbg(r.Context(), err.Error())
		return err
	}

	if !valid {
		err := errors.New("Invalid captcha")
		return err
	}

	return nil
}

func setSigninOtp(w http.ResponseWriter, r *http.Request) {
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

	sm := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)

	otp := utils.RandInt(MIN_OTP, MAX_OTP)
	sm.Set(r, OTP, strconv.Itoa(otp))
	sm.Set(r, TEMP_USER, (*users)[0])

	sm.Set(r, DEVICE_ID, r.FormValue("device-id"))
	sm.Set(r, VERSION, r.FormValue("version"))
	sm.Set(r, OS, r.FormValue("os"))

	err = sm.Save(r, w)
	if err != nil {
		utils.Dbg(r.Context(), err.Error())
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "interal-server-error")
		return
	}

	if err = sendOtp(r.Context(), (*users)[0],
		strconv.Itoa(otp), "Otp for signing in"); err != nil {
		utils.Dbg(r.Context(), err.Error())
		utils.SendError(r.Context(), w, errors.New("Unable to process"), "interal-server-error")
		return
	}

	utils.SendSuccess(r.Context(), w, nil)
}

func sendOtp(ctx context.Context, u user.User, otp, subject string) error {
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
		config.Email["from-name"], config.Email["from-email"], subject, out.String())
}

//debug
func TestHandler(w http.ResponseWriter, r *http.Request) {
	s := service.Get(types.SERVICE_EMAILER)
	if e, ok := s.(types.Emailer); ok {
		e.Send(r.Context(), "kargirwar@gmail.com", "PK", "tech@prosql.io", "Test", "Test")
	}

	utils.SendSuccess(r.Context(), w, nil)
}
