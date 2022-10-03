package app_test

import (
	"testing"
	//"fmt"
	"net/http"
	"net/http/httptest"

	"github.com/kargirwar/prosql-go/app"
	"github.com/kargirwar/prosql-go/mocks"
	//"github.com/kargirwar/prosql-go/types"
)

var App *app.App
func TestApp(t *testing.T) {
	sp := mocks.ServiceProvider{T: t}
	App = app.NewApp("dev", sp)
	req, _ := http.NewRequest("GET", "/go-browser-api/test", nil)
	response := executeRequest(req)
	checkResponseCode(t, http.StatusOK, response.Code)
}

func executeRequest(req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	router := App.GetRouter()
	router.ServeHTTP(rr, req)

	return rr
}

func checkResponseCode(t *testing.T, expected, actual int) {
	if expected != actual {
		t.Errorf("Expected response code %d. Got %d\n", expected, actual)
	}
}
