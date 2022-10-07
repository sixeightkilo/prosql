package views

import (
	"github.com/gorilla/mux"
	"github.com/kargirwar/golang/utils"
	"github.com/kargirwar/prosql-go/constants"
	"github.com/kargirwar/prosql-go/models/user"
	"github.com/kargirwar/prosql-go/types"
	"net/http"
	"regexp"
	"strconv"
)

var service types.ServiceProvider

func SetServiceProvider(sp types.ServiceProvider) {
	service = sp
}

func Page(w http.ResponseWriter, r *http.Request) {
	utils.Dbg(r.Context(), "Index")

	version := getAppVersion(r)
	root, rev := getApplicationRootAndRevision(version)
	page := mux.Vars(r)["page"]
	switch page {
	case "":
		Index(root, rev, w)

	case "connections":
		renderConnections(w, r, root, rev)

	case "signin":
		Signin(root, rev, w)

	case "signup":
		Signup(root, rev, w)

	case "signout":
		signout(w, r)

	case "tables":
		Tables(root, rev, w)
	}
}

func signout(w http.ResponseWriter, r *http.Request) {
	sm := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)
	sm.Kill(r, w)
	http.Redirect(w, r, "/connections", 302)
}

func renderConnections(w http.ResponseWriter, r *http.Request, root, rev string) {
	sm := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)
	v, _ := sm.Get(r, constants.USER)
	if _, ok := v.(user.User); ok {
		//user is signed in
		Connections_User(root, rev, w)
		return
	}

	Connections(root, rev, w)
}

//Each major version of the agent maps to corresponding
//major version of the web app
func getAppVersion(r *http.Request) string {
	utils.Dbg(r.Context(), "getAppVersion")
	sm := service.Get(types.SERVICE_SESSION_MANAGER).(types.SessionManager)
	agentVersion, present := sm.Get(r, constants.AGENT_VERSION)
	if !present {
		config := service.Get(types.SERVICE_CONFIG).(types.Config)
		utils.Dbg(r.Context(), "version: "  + config.Version)
		agentVersion = config.Version
	}

	utils.Dbg(r.Context(), "agentVersion:" + agentVersion.(string))

	re := regexp.MustCompile(`([0-9]+).([0-9]+).*$`)
	version := re.ReplaceAll([]byte(agentVersion.(string)), []byte("$1.$2"))
	return string(version)
}

//for each major version of the app there are going to
//be separate set of static files. These will be stored under:
// build-{ver}
//each set of build-* files will have a revision. We will
//keep track of versions by git tags like so: build-0.6-r20
//This function returns the app root dir: build-{ver} and revision
func getApplicationRootAndRevision(version string) (string, string) {
	root := "build-" + version
	config := service.Get(types.SERVICE_CONFIG).(types.Config)

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
