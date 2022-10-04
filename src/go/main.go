package main
import (
	"os"
	//"fmt"
	//"context"
	"encoding/json"
	"log"
	"github.com/kargirwar/golang/utils/sm"
	"github.com/kargirwar/prosql-go/app"
	"github.com/kargirwar/prosql-go/sp"
	"github.com/kargirwar/prosql-go/types"
	"github.com/kargirwar/prosql-go/models/user"
)

func init() {
	//this is required so that non primitive types can 
	//be serialzed and saved by session store
	types := make([]interface{}, 0)
	types = append(types, user.User{})
	sm.RegisterTypes(types)
}

var App *app.App
func main() {
	env := os.Getenv("PROSQL_ENV")
	file := "config." + env + ".json"
	config := parseConfig(file)
	App = app.NewApp(config, sp.ServiceProvider{Config: config})
	App.Run()
}

func parseConfig(file string) types.Config {
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
