package main
import (
	"os"
	"github.com/kargirwar/prosql-go/utils"
	"github.com/kargirwar/prosql-go/app"
	"github.com/kargirwar/prosql-go/sp"
)

func main() {
	env := os.Getenv("PROSQL_ENV")
	file := "config." + env + ".json"
	config := utils.ParseConfig(file)
	App := app.NewApp(config, sp.ServiceProvider{Config: config})
	App.Run()
}
