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

	s := Response{}
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
	sp.Emailer.Callback = getEmailerCallBack(&otp)

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
	sp.Emailer.Callback = getEmailerCallBack(&otp)
	setupSessionManager(&sp.SessMgr)

	App.SetServiceProvider(sp)

	//updates otp variable.
	getOtp(t)
	utils.Dbg(context.Background(), "Got OTP: "+otp)
	signin(t, otp)
}

func TestMockSm(t *testing.T) {
	sp1 := getServiceProvider(t)
	setupSessionManager(&sp1.SessMgr)
	sp1.SessMgr.Setter("k", "v1")

	sp2 := getServiceProvider(t)
	setupSessionManager(&sp2.SessMgr)
	sp2.SessMgr.Setter("k", "v2")

	v1, _ := sp1.SessMgr.Getter("k")
	v2, _ := sp2.SessMgr.Getter("k")

	utils.Dbg(context.Background(), fmt.Sprintf("v1 %s v2 %s", v1, v2))

	if v1 == v2 {
		t.Errorf("Failed v1 %s v2 %s", v1, v2)
	}
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

	checkResponseCode(t, http.StatusOK, response.Code)

	if s.Status != "ok" {
		t.Errorf("Invalid status: %s", s.Status)
	}
}
