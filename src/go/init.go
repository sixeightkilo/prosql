package main

import (
	"github.com/kargirwar/prosql-go/views"
	log "github.com/sirupsen/logrus"
	"gopkg.in/natefinch/lumberjack.v2"
	"os"
	"time"
)

const LOG_FILE = "meedee.log"

var logger *lumberjack.Logger

func init() {
	log.SetFormatter(&log.JSONFormatter{
		TimestampFormat: time.StampMilli,
	})

	dir, err := os.Getwd()
	if err != nil {
		log.Fatal(err.Error())
	}

	logger = &lumberjack.Logger{
		Filename:   dir + "/" + LOG_FILE,
		MaxSize:    10, //megabytes
		MaxBackups: 2,
		MaxAge:     28, //days
		Compress:   true,
	}
	log.SetOutput(logger)

	log.SetLevel(log.DebugLevel)

	views.SetContentPath(dir + "/static")
	//views.SetSessionStore(store, constants.SESSION_NAME)
}
