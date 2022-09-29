package main

import (
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/kargirwar/prosql-go/views"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"time"
)

var store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))

func main() {

	r := mux.NewRouter()

	//static files
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	//dynamic pages
	r.HandleFunc("/{page:[a-z-]*?}", views.Page).Methods("Get")

	srv := &http.Server{
		Handler:      r,
		Addr:         "127.0.0.1:9200",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Fatal(srv.ListenAndServe())
}
