package ui
import (
	"github.com/gorilla/mux"
	"github.com/kargirwar/golang/utils"
	"github.com/kargirwar/prosql-go/db"
	"github.com/kargirwar/prosql-go/models/user"
	//"github.com/gorilla/sessions"
	//log "github.com/sirupsen/logrus"
	//"github.com/tidwall/gjson"
	"net/http"
	"errors"
	//"encoding/json"
	//"os"
	//"time"
	//"io"
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
		utils.SendError(r.Context(), w, errors.New("User not found"), "invalid-input")
		return
	}

	utils.SendSuccess(r.Context(), w, nil)
}
