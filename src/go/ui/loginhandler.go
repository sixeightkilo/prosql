package ui
import (
	"github.com/gorilla/mux"
	"github.com/kargirwar/golang/utils"
	"github.com/kargirwar/prosql-sqlite/dbutils"
	//"github.com/gorilla/sessions"
	//log "github.com/sirupsen/logrus"
	"net/http"
	"errors"
	"encoding/json"
	//"os"
	//"time"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	action := mux.Vars(r)["action"]
	switch action {
	case "signin":
		signin(w , r)

	case "set-signin-otp":
		setSigninOtp(w , r)
	}
}

func signin(w http.ResponseWriter, r *http.Request) {
	utils.SendSuccess(r.Context(), w, nil)
}

func setSigninOtp(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		utils.SendError(r.Context(), w, errors.New("invalid-input"), "invalid-input")
		return
	}

	sqlite, err := dbutils.OpenDb(r.Context(), db)
	if err != nil {
		utils.SendError(r.Context(), w, err, "db-error")
		return
	}
	//defer sqlite.Close()
	defer r.Body.Close()

	var ids []int
	err = json.NewDecoder(r.Body).Decode(&ids)
	if err != nil {
		utils.SendError(r.Context(), w, err, "json-error")
		return
	}
}
