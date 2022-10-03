package main
import (
	"os"
	//"fmt"
	//"context"
	"github.com/kargirwar/golang/utils/emailer"
	"github.com/kargirwar/golang/utils/sm"
	"github.com/kargirwar/prosql-go/app"
	"github.com/kargirwar/prosql-go/types"
	"github.com/kargirwar/prosql-go/models/user"
)

type ServiceProvider struct {
}

func init() {
	//this is required so that non primitive types can 
	//be serialzed and saved by session store
	types := make([]interface{}, 0)
	types = append(types, user.User{})
	sm.RegisterTypes(types)
}

func (s ServiceProvider) Get(service string) interface{} {
	config := App.GetConfig()
	switch service {
	case types.SERVICE_EMAILER:
		var e emailer.Emailer
		e.SetKey(config.SendGridKey)
		return &e

	case types.SERVICE_CONFIG:
		return config

	case types.SERVICE_SESSION_MANAGER:
		return sm.NewSessionManager(config.SessionKey, config.SessionName)

	default:
		return nil
	}
}
var App *app.App

func main() {
	env := os.Getenv("PROSQL_ENV")
	App = app.NewApp(env, ServiceProvider{})
	App.Run()
}
