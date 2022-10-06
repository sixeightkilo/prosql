package utils
import (
	"log"
	"encoding/json"
	"os"
	"github.com/kargirwar/prosql-go/types"
)

func ParseConfig(file string) types.Config {
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
