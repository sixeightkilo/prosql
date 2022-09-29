package views

import (
	"github.com/gorilla/sessions"
	"github.com/kargirwar/prosql-agent/utils"
	"net/http"
)

var contentPath string
var store *sessions.CookieStore
var sessionName string

func SetContentPath(path string) {
	contentPath = path
}

func SetSessionStore(s *sessions.CookieStore, session string) {
	store = s
	sessionName = session
}

func Page(w http.ResponseWriter, r *http.Request) {
	utils.Dbg(r.Context(), "Index")

	Index("", "0.6", w)
}
