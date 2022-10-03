package app

import (
	"github.com/gorilla/mux"
	//"github.com/gorilla/sessions"
	"github.com/kargirwar/prosql-go/types"
	"github.com/kargirwar/prosql-go/ui"
	//"github.com/kargirwar/prosql-go/views"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"time"
	"encoding/json"
	//"fmt"
	"path/filepath"
	"gopkg.in/natefinch/lumberjack.v2"
)

const LOG_FILE = "prosql.log"

type Config struct {
	Env string `json:"env"`
	LogDir string `json:"log-dir"`
	Version string `json:"version"`
	DbPath string `json:"db-path"`
	SendGridKey string `json:"sendgrid-key"`
	AppVersions map[string]string `json:"app-versions"`
	Email map[string]string `json:"email"`
}


type App struct {
	config *Config
	serviceProvider types.ServiceProvider
	router *mux.Router
}

var app *App

func NewApp(env string, sp types.ServiceProvider) *App {
	if app == nil {
		app = &App{}
		app.init(env, sp)
		return app
	}

	return app
}

func (a *App) GetRouter() mux.Router {
	return *a.router
}

func (a *App) GetConfig() Config {
	return *a.config
}

//called my main
func (a *App) init(env string, sp types.ServiceProvider) {
	file := "config." + env + ".json"
	a.config = parseConfig(file)
	a.serviceProvider = sp
	setupLogger(a.config.LogDir)
	a.router = setupRoutes()
}

func setupRoutes() *mux.Router {
	ui.SetServiceProvider(app.serviceProvider)

	r := mux.NewRouter()
	r.HandleFunc("/go-browser-api/test", ui.TestHandler).Methods("Get")
	return r
}

//called my main
func (a *App) SetServiceProvider(s types.ServiceProvider) {
	a.serviceProvider = s
}

func parseConfig(file string) *Config {
	f, err := os.Open(file)
	if err != nil {
		log.Fatal(err.Error())
	}

	var config Config
	jsonParser := json.NewDecoder(f)
	if err = jsonParser.Decode(&config); err != nil {
		log.Fatal(err.Error())
	}

	return &config
}

func setupLogger(dir string) {
	err := os.MkdirAll(dir, 0700)
	if err != nil {
		log.Fatal("Unable to create dir: " + dir)
	}

	f := filepath.Join(dir, LOG_FILE)

	log.SetFormatter(&log.JSONFormatter{
		TimestampFormat: time.StampMilli,
	})

	logger := &lumberjack.Logger{
		Filename:   f,
		MaxSize:    10, //megabytes
		MaxBackups: 2,
		MaxAge:     28, //days
		Compress:   true,
	}

	log.SetOutput(logger)
	log.SetLevel(log.DebugLevel)
}

func (a *App) Run() {
	srv := &http.Server{
		Handler:      a.router,
		Addr:         "127.0.0.1:9200",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Fatal(srv.ListenAndServe())
}
