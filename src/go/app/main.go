package app

import (
	"github.com/gorilla/mux"
	//"github.com/gorilla/sessions"
	"github.com/kargirwar/prosql-go/db"
	"github.com/kargirwar/prosql-go/types"
	"github.com/kargirwar/prosql-go/controllers/ui"
	"github.com/kargirwar/prosql-go/views"
	"github.com/kargirwar/prosql-go/models/user"
	"github.com/kargirwar/golang/utils/sm"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"time"
	//"fmt"
	"path/filepath"
	"gopkg.in/natefinch/lumberjack.v2"
)

const LOG_FILE = "prosql.log"

type App struct {
	serviceProvider types.ServiceProvider
	router *mux.Router
}

var app *App

func init() {
	//this is required so that non primitive types can 
	//be serialzed and saved by session store
	types := make([]interface{}, 0)
	types = append(types, user.User{})
	sm.RegisterTypes(types)
}

func NewApp(config types.Config, sp types.ServiceProvider) *App {
	if app == nil {
		app = &App{}
		app.init(config, sp)
		return app
	}

	return app
}

//sometimes it is necessary to switch ServiceProvider , especially 
//during testing
func (a *App) SetServiceProvider(sp types.ServiceProvider) {
	a.serviceProvider = sp
	ui.SetServiceProvider(a.serviceProvider)
	views.SetServiceProvider(a.serviceProvider)
}

func (a *App) GetRouter() mux.Router {
	return *a.router
}

func (a *App) init(config types.Config, sp types.ServiceProvider) {
	a.serviceProvider = sp
	setupLogger(config.LogDir)
	a.router = setupRoutes()

	db.SetDbPath(config.DbPath)
}

func setupRoutes() *mux.Router {
	ui.SetServiceProvider(app.serviceProvider)
	views.SetServiceProvider(app.serviceProvider)

	r := mux.NewRouter()
	//static files
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	//api
	r.HandleFunc("/go-browser-api/test", ui.TestHandler).Methods("Get")
	r.HandleFunc("/go-browser-api/login/captcha/{action:[a-z-]*?}", ui.CaptchaHandler).Methods("Get")
	r.HandleFunc("/go-browser-api/login/{action:[a-z-]*?}", ui.LoginHandler).Methods("Post")
	r.HandleFunc("/go-browser-api/devices/{action:[a-z-]*?}", ui.DevicesController).Methods("Post")

	//dynamic pages
	r.HandleFunc("/{page:[a-z-]*?}", views.Page).Methods("Get")

	return r
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
