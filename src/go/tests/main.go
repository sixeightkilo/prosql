package tests

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	//"context"

	"github.com/gorilla/mux"
	"github.com/kargirwar/prosql-go/app"
	"github.com/kargirwar/prosql-go/tests/mocks"
	"github.com/kargirwar/prosql-go/types"
	"github.com/kargirwar/prosql-go/utils"
	//u "github.com/kargirwar/golang/utils"
)

var config types.Config
var App *app.App

type Response struct {
	Status    string `json:"status"`
	Msg       string `json:"msg"`
	ErrorCode string `json:"error-code"`
}

func init() {
	file := "config.test.json"
	config = utils.ParseConfig(file)
}

func executeRequest(router mux.Router, req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	return rr
}

func checkResponseCode(t *testing.T, expected, actual int) {
	if expected != actual {
		t.Errorf("Expected response code %d. Got %d\n", expected, actual)
	}
}

func getServiceProvider(t *testing.T) mocks.ServiceProvider {
	user := os.Getenv("PROSQL_TEST_USER")
	emailer := mocks.Emailer{T: t, ToEmail: user}

	sp := mocks.ServiceProvider{
		T:       t,
		Emailer: emailer,
		SessMgr: mocks.SessionManager{},
		Config:  config,
	}

	return sp
}
