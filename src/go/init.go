package main

import (
	"os"
	"time"
	"fmt"
	"encoding/json"
	"github.com/kargirwar/golang/utils/emailer"
	"github.com/kargirwar/prosql-go/constants"
	"github.com/kargirwar/prosql-go/db"
	"github.com/kargirwar/prosql-go/types"
	"github.com/kargirwar/prosql-go/ui"
	"github.com/kargirwar/prosql-go/views"
	log "github.com/sirupsen/logrus"
	"gopkg.in/natefinch/lumberjack.v2"
)

const LOG_FILE = "prosql.log"

func init() {
	dir, err := os.Getwd()
	if err != nil {
		log.Fatal(err.Error())
	}

	setupLogger(dir)
	config := parseConfig()

	views.SetConfig(config)
	ui.SetConfig(config)
	emailer.SetKey(config.SendGridKey)

	views.SetSessionStore(store, constants.SESSION_NAME)
	ui.SetSessionStore(store, constants.SESSION_NAME)

	db.SetDbPath(config.DbPath)
}

func parseConfig() *types.Config {
	var config types.Config
	env := os.Getenv("PROSQL_ENV")
	file := "config." + env + ".json"

	configFile, err := os.Open(file)
	if err != nil {
		log.Fatal(err.Error())
	}

	jsonParser := json.NewDecoder(configFile)
	if err = jsonParser.Decode(&config); err != nil {
		log.Fatal(err.Error())
	}

	log.WithFields(log.Fields{
		"config": fmt.Sprintf("%#v", config),
	}).Debug("config")

	return &config
}

func setupLogger(dir string) {
	log.SetFormatter(&log.JSONFormatter{
		TimestampFormat: time.StampMilli,
	})

	logger := &lumberjack.Logger{
		Filename:   dir + "/" + LOG_FILE,
		MaxSize:    10, //megabytes
		MaxBackups: 2,
		MaxAge:     28, //days
		Compress:   true,
	}

	log.SetOutput(logger)
	log.SetLevel(log.DebugLevel)
}
