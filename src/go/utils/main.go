package utils
import (
	"log"
	"encoding/json"
	"os"
	"fmt"
	"github.com/kargirwar/prosql-go/types"
	"github.com/kargirwar/prosql-go/constants"
	"github.com/kargirwar/prosql-go/models/user"
	"github.com/kargirwar/prosql-go/models/device"
	"github.com/kargirwar/golang/utils"
	"net/http"
	"time"
)

func ParseConfig(file string) types.Config {
	f, err := os.Open(file)
	if err != nil {
		log.Fatal(err.Error())
	}

	var config types.Config
	jsonParser := json.NewDecoder(f)
	if err = jsonParser.Decode(&config); err != nil {
		log.Fatal(err.Error())
	}

	return config
}

func SigninRequired(r *http.Request, service types.ServiceProvider, d *device.Device) (bool, error) {
	//the user can continue as guest for MAX_GUEST_DAYS. But if she has signed up
	//before that she must be signed in to use the app
	ctx := r.Context()
	registeredAt, err := time.Parse(constants.SQLITE_TIMESTAMP_FORMAT, d.CreatedAt)
	if err != nil {
		utils.Dbg(ctx, err.Error())
		return false, err
	}

	clock := service.Get(types.SERVICE_CLOCK).(types.Clock)

	now := clock.Now()
	diff := now.Sub(registeredAt)
	days := diff.Hours() / 24

	userEmail := GetLoggedInUser(r, service).Email
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

func GetLoggedInUser(r *http.Request, service types.ServiceProvider) *user.User {
	sm := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)
	u, _ := sm.Get(r, constants.USER)
	usr, ok := u.(user.User); if ok {
		return &usr
	}

	return &user.User{}
}
