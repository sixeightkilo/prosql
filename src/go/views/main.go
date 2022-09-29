package views

import (
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/kargirwar/golang/utils"
	"github.com/kargirwar/prosql-go/constants"
	"github.com/kargirwar/prosql-go/types"
	"net/http"
	"regexp"
	"strconv"
)

var store *sessions.CookieStore
var sessionName string
var config *types.Config

func SetSessionStore(s *sessions.CookieStore, session string) {
	store = s
	sessionName = session
}

func SetConfig(c *types.Config) {
	config = c
}

func Page(w http.ResponseWriter, r *http.Request) {
	utils.Dbg(r.Context(), "Index")

	root, rev := getApplicationRootAndRevision(r)
	page := mux.Vars(r)["page"]
	switch page {
	case "":
		Index(root, rev, w)

	case "connections":
		Connections(root, rev, w)
	}
}

//for each major version of the app there are going to 
//be separate set of static files. These will be stored under:
// build-{ver}
//each set of build-* files will have a revision. We will 
//keep track of versions by git tags like so: build-0.6-r20
//This function returns the app root dir: build-{ver} and revision
func getApplicationRootAndRevision(r *http.Request) (string, string) {
	session, _ := store.Get(r, sessionName)

	agentVersion, present := session.Values[constants.AGENT_VERSION]
	if !present {
		agentVersion = config.Version
	}

	re := regexp.MustCompile(`([0-9]+).([0-9]+).*$`)
	version := re.ReplaceAll([]byte(agentVersion.(string)), []byte("$1.$2"))
	root := "build-" + string(version)

	if config.Env == "dev" {
		rev := strconv.Itoa(utils.RandInt(1, 1000))
		return root, rev
	}

	for k, v := range config.AppVersions {
		if k == root {
			return root, v
		}
	}

	//we should never reach here
	return "build-0.6", "1"
}
