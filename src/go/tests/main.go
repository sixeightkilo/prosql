package tests

import (
	"testing"
	"net/http"
	"net/http/httptest"

	"github.com/gorilla/mux"
	"github.com/kargirwar/prosql-go/utils"
	"github.com/kargirwar/prosql-go/types"
)

var config types.Config

func init() {
	env := "test"
	file := "config." + env + ".json"
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
