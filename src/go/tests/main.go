package tests

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/benbjohnson/clock"
	"github.com/gorilla/mux"
	u "github.com/kargirwar/golang/utils"
	"github.com/kargirwar/prosql-go/app"
	"github.com/kargirwar/prosql-go/constants"
	"github.com/kargirwar/prosql-go/tests/mocks"
	"github.com/kargirwar/prosql-go/types"
	"github.com/kargirwar/prosql-go/utils"
	"time"
)

var config types.Config
var App *app.App
var deviceId string

type Response struct {
	Status    string `json:"status"`
	Msg       string `json:"msg"`
	ErrorCode string `json:"error-code"`
}

func init() {
	file := "config.test.json"
	config = utils.ParseConfig(file)
	deviceId = u.RandomString(10)
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

func setupSessionManager(sm *mocks.SessionManager) {
	session := make(map[string]interface{})
	sm.Setter = func(k string, v interface{}) {
		u.Dbg(context.Background(), "Saving :"+k)
		session[k] = v
	}

	sm.Getter = func(k string) (interface{}, bool) {
		u.Dbg(context.Background(), "Getting :"+k)
		v, present := session[k]
		return v, present
	}

	sm.Killer = func() {
		for k, _ := range session {
			delete(session, k)
		}
	}
}

func getEmailerCallBack(otp *string) func(s string) {
	f := func(s string) {
		u.Dbg(context.Background(), "Callback")
		*otp = s
	}

	return f
}

func setupClock(sp *mocks.ServiceProvider, ts string) {
	sp.GetClock = func() clock.Clock {
		mock := clock.NewMock()

		t, _ := time.Parse(constants.SQLITE_TIMESTAMP_FORMAT, ts)
		mock.Set(t)
		return mock
	}
}
