package ui

import (
	"context"
	"fmt"
	"github.com/kargirwar/golang/utils"
	"time"
	"github.com/kargirwar/prosql-go/constants"
	"github.com/kargirwar/prosql-go/db"
	"github.com/kargirwar/prosql-go/models/device"
	"github.com/kargirwar/prosql-go/models/user"
	"github.com/kargirwar/prosql-go/types"
	"errors"
	"net/http"
)

func DevicesController(w http.ResponseWriter, r *http.Request) {
	deviceId := r.FormValue("device-id")
	version := r.FormValue("version")
	os := r.FormValue("os")

	sqlite, err := db.OpenDb(r.Context(), "data.db")
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	_, err = device.Save(r.Context(), sqlite,
		device.Device{DeviceId: deviceId, Version: version, Os: os})

	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	devices, err := device.GetByDeviceId(r.Context(), sqlite, deviceId)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	d := (*devices)[0]

	sm := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)
	req, err := signinRequired(r.Context(), r, &d)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	if req {
		sm.Kill(r, w)
		utils.SendError(r.Context(), w, errors.New("signin-required"), "")
		return
	}

	sm.Set(r, DEVICE_ID, deviceId)
	sm.Set(r, VERSION, version)
	sm.Set(r, OS, os)

	u := getLoggedInUser(r)
	if u.Email != "" {
		//already logged in
		sm.Save(r, w)
		return
	}

	sm.Set(r, USER, user.User{
		FirstName: user.GUEST_FIRST_NAME,
		LastName: user.GUEST_LAST_NAME,
		Email: user.GUEST_EMAIL,
	})

	sm.Save(r, w)
	utils.SendSuccess(r.Context(), w, nil)
}

func getLoggedInUser(r *http.Request) *user.User {
	sm := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)
	u, _ := sm.Get(r, USER)
	usr, ok := u.(user.User); if ok {
		return &usr
	}

	return &user.User{}
}

func signinRequired(ctx context.Context, r *http.Request, d *device.Device) (bool, error) {
	//the user can continue as guest for MAX_GUEST_DAYS. But if she has signed up
	//before that she must be signed in to use the app
	registeredAt, err := time.Parse(constants.SQLITE_TIMESTAMP_FORMAT, d.CreatedAt)
	if err != nil {
		utils.Dbg(ctx, err.Error())
		return false, err
	}

	now := time.Now()
	diff := now.Sub(registeredAt)
	days := diff.Hours() / 24

	userEmail := getLoggedInUser(r).Email
	signinRequired := false
	if (days > user.MAX_GUEST_DAYS) {
		//Not logged in or logged in as guest, must sign in
		if userEmail == "" || userEmail == user.GUEST_EMAIL {
			signinRequired = true
		}
	} else {
		//signed in and then got logged out
		//userId will have a valid value only if the user has signed up
		//TODO: why do we need condition for guest email?
		if d.UserId > 0 && (userEmail == "" || userEmail == user.GUEST_EMAIL) {
			signinRequired = true
		}
	}

	utils.Dbg(ctx,
	fmt.Sprintf("userid: %d email %s days %d signinRequired %v", 
	d.UserId, userEmail, days, signinRequired))

	return signinRequired, nil
}
