package tests

import (
	"context"
	"net/http"
	"os"
	"testing"

	"bytes"
	"encoding/json"
	"fmt"
	"github.com/kargirwar/golang/utils"
	"github.com/kargirwar/prosql-go/app"
	"net/url"
	//"github.com/kargirwar/prosql-go/types"
	//"github.com/kargirwar/prosql-go/tests/mocks"
)

func TestSigninInvalidUser(t *testing.T) {
	App = app.NewApp(config, getServiceProvider(t))

	//https://gist.github.com/17twenty/2fb30a22141d84e52446
	data := url.Values{}
	data.Set("email", "unknown@unknown.com")

	req, _ := http.NewRequest("POST",
		"/go-browser-api/login/set-signin-otp", bytes.NewBufferString(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; param=value")
	response := executeRequest(App.GetRouter(), req)

	var s struct {
		Status    string `json:"status"`
		Msg       string `json:"msg"`
		ErrorCode string `json:"error-code"`
	}

	json.NewDecoder(response.Body).Decode(&s)
	fmt.Printf("%+v", s)

	checkResponseCode(t, http.StatusOK, response.Code)

	if s.Status != "error" {
		t.Errorf("Invalid status: %s", s.Status)
	}
}

func TestSignInOtp(t *testing.T) {
	sp := getServiceProvider(t)

	otp := ""
	sp.Emailer.Callback = func(s string) {
		utils.Dbg(context.Background(), "Callback")
		otp = s
	}

	App.SetServiceProvider(sp)

	//https://gist.github.com/17twenty/2fb30a22141d84e52446
	user := os.Getenv("PROSQL_TEST_USER")
	data := url.Values{}
	data.Set("email", user)

	req, _ := http.NewRequest("POST",
		"/go-browser-api/login/set-signin-otp", bytes.NewBufferString(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; param=value")
	response := executeRequest(App.GetRouter(), req)

	s := Response{}
	json.NewDecoder(response.Body).Decode(&s)
	fmt.Printf("%+v", s)

	checkResponseCode(t, http.StatusOK, response.Code)

	if s.Status != "ok" {
		t.Errorf("Invalid status: %s", s.Status)
	}

	utils.Dbg(context.Background(), "Sent OTP:"+otp)
}

func TestSignIn(t *testing.T) {
	sp := getServiceProvider(t)

	otp := ""
	sp.Emailer.Callback = func(s string) {
		utils.Dbg(context.Background(), "Callback")
		otp = s
	}

	session := make(map[string]interface{})
	sp.SessMgr.Setter = func(k string, v interface{}) {
		utils.Dbg(context.Background(), "Saving :"+k)
		session[k] = v
	}

	sp.SessMgr.Getter = func(k string) (interface{}, bool) {
		utils.Dbg(context.Background(), "Getting :"+k)
		v, present := session[k]
		return v, present
	}

	sp.SessMgr.Killer = func() {
		for k, _ := range session {
			delete(session, k)
		}
	}

	App.SetServiceProvider(sp)

	//updates otp variable.
	getOtp(t)
	utils.Dbg(context.Background(), "Got OTP: "+otp)
	signin(t, otp)
}

func getOtp(t *testing.T) {
	//https://gist.github.com/17twenty/2fb30a22141d84e52446
	//First get the OTP
	user := os.Getenv("PROSQL_TEST_USER")
	data := url.Values{}
	data.Set("email", user)

	req, _ := http.NewRequest("POST",
		"/go-browser-api/login/set-signin-otp", bytes.NewBufferString(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; param=value")
	response := executeRequest(App.GetRouter(), req)

	s := Response{}
	json.NewDecoder(response.Body).Decode(&s)
	fmt.Printf("%+v", s)

	checkResponseCode(t, http.StatusOK, response.Code)

	if s.Status != "ok" {
		t.Errorf("Invalid status: %s", s.Status)
	}
}

func signin(t *testing.T, otp string) {
	data := url.Values{}
	data.Set("otp", otp)

	req, _ := http.NewRequest("POST",
		"/go-browser-api/login/signin", bytes.NewBufferString(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; param=value")
	response := executeRequest(App.GetRouter(), req)

	s := Response{}
	json.NewDecoder(response.Body).Decode(&s)
	fmt.Printf("%+v", s)

	checkResponseCode(t, http.StatusOK, response.Code)

	if s.Status != "ok" {
		t.Errorf("Invalid status: %s", s.Status)
	}
}
