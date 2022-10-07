package tests

import (
	"context"
	"net/http"
	//"os"
	"testing"

	"bytes"
	"encoding/json"
	"fmt"
	"github.com/kargirwar/golang/utils"
	"github.com/kargirwar/prosql-go/app"
	"net/url"
	//"github.com/kargirwar/prosql-go/types"
	//"github.com/kargirwar/prosql-go/tests/mocks"
	"github.com/benbjohnson/clock"
	"github.com/kargirwar/prosql-go/models/user"
	"github.com/kargirwar/prosql-go/constants"
	"time"
)

func TestNewDevice(t *testing.T) {
	sp := getServiceProvider(t)
	App = app.NewApp(config, sp)

	setupSessionManager(&sp.SessMgr)
	sp.GetClock = func() clock.Clock {
		mock := clock.NewMock()
		return mock
	}

	App.SetServiceProvider(sp)

	//https://gist.github.com/17twenty/2fb30a22141d84e52446
	data := url.Values{}
	data.Set("device-id", "1234")
	data.Set("version", "0.6.2")
	data.Set("os", "linux")

	req, _ := http.NewRequest("POST",
		"/go-browser-api/devices/register", bytes.NewBufferString(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; param=value")
	response := executeRequest(App.GetRouter(), req)

	s := Response{}
	json.NewDecoder(response.Body).Decode(&s)
	fmt.Printf("%+v", s)

	checkResponseCode(t, http.StatusOK, response.Code)

	if s.Status == "error" {
		t.Errorf("Invalid status: %s", s.Status)
	}

	u, present := sp.SessMgr.Getter("user")
	if !present {
		t.Errorf("User session not created")
	}

	var usr user.User
	usr, ok := u.(user.User)
	if !ok {
		t.Errorf("User not logged in")
	}

	utils.Dbg(context.Background(), fmt.Sprintf("%+v", usr))

	if usr.Email != user.GUEST_EMAIL {
		t.Errorf("Guest session not created")
	}
}

func TestMaxGuestLogin(t *testing.T) {
	sp := getServiceProvider(t)
	App = app.NewApp(config, sp)

	setupSessionManager(&sp.SessMgr)
	sp.GetClock = func() clock.Clock {
		mock := clock.NewMock()

		t, _ := time.Parse(constants.SQLITE_TIMESTAMP_FORMAT, "2022-12-31 00:00:00")
		mock.Set(t)
		return mock
	}

	App.SetServiceProvider(sp)

	//https://gist.github.com/17twenty/2fb30a22141d84e52446
	data := url.Values{}
	data.Set("device-id", "1234")
	data.Set("version", "0.6.2")
	data.Set("os", "linux")

	req, _ := http.NewRequest("POST",
		"/go-browser-api/devices/register", bytes.NewBufferString(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; param=value")
	response := executeRequest(App.GetRouter(), req)

	s := Response{}
	json.NewDecoder(response.Body).Decode(&s)
	fmt.Printf("%+v", s)

	checkResponseCode(t, http.StatusOK, response.Code)

	if s.Status == "ok" {
		t.Errorf("Invalid status: %s", s.Status)
	}

	if s.Msg != "signin-required" {
		t.Errorf("Invalid error message: %s", s.Msg)
	}
}
