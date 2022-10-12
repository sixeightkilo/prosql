package workers

import (
	//"context"
	//"fmt"
	"github.com/kargirwar/golang/utils"
	//"time"
	//"github.com/kargirwar/prosql-go/constants"
	u "github.com/kargirwar/prosql-go/utils"
	"github.com/kargirwar/prosql-go/db"
	"github.com/kargirwar/prosql-go/models/device"
	//"github.com/kargirwar/prosql-go/models/user"
	"github.com/kargirwar/prosql-go/types"
	"errors"
	"net/http"
)

var service types.ServiceProvider

func SetServiceProvider(sp types.ServiceProvider) {
	service = sp
}

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
	req, err := u.SigninRequired(r, service, &d)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}

	if req {
		sm.Kill(r, w)
		utils.SendError(r.Context(), w, errors.New("signin-required"), "")
		return
	}


	u := u.GetLoggedInUser(r, service)
	//Upto MAX_GUEST_DAYS the workers should continue to work even if the user is not signed in (even as guest)
	//This is especially important for connections page. Because user might visit connections
	//page in a different browser, having saved some connections in the current browser.

	//If user is signed in as guest or not signed at all then we use deviceId as the db
	//If user is signed in then we use her email as the db
	db := ""
	if u.Email == "" {
		db = deviceId
	} else {
		db = u.Email
	}

	utils.SendSuccess(r.Context(), w, struct{
		Db string `json:"db"`
	}{Db: db})
}
