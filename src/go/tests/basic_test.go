package tests

import (
	"testing"
	"net/http"

	"github.com/kargirwar/prosql-go/app"
	"github.com/kargirwar/prosql-go/tests/mocks"
)

func TestBasic(t *testing.T) {
	sp := mocks.ServiceProvider{T: t}
	App := app.NewApp(config, sp)

	req, _ := http.NewRequest("GET", "/go-browser-api/test", nil)
	response := executeRequest(App.GetRouter(), req)
	checkResponseCode(t, http.StatusOK, response.Code)

	t.Log("Testing")
}
