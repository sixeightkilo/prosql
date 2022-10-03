package main
import (
	"os"
	//"fmt"
	//"context"
	"github.com/kargirwar/golang/utils/emailer"
	"github.com/kargirwar/prosql-go/app"
	"github.com/kargirwar/prosql-go/types"
)

type ServiceProvider struct {
}

func (s ServiceProvider) Get(service string) interface{} {
	config := App.GetConfig()
	switch service {
	case types.SERVICE_EMAILER:
		var e emailer.Emailer
		e.SetKey(config.SendGridKey)
		return &e

	default:
		return nil
	}
}
//var store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))
var App *app.App

func main() {
	env := os.Getenv("PROSQL_ENV")
	App = app.NewApp(env, ServiceProvider{})
	App.Run()

	//s := App.GetService(types.SERVICE_EMAILER)

	//test
	//if e, ok := s.(types.Emailer); ok {
		//fmt.Println("Works")
		//e.Send(context.Background(), "kargirwar@gmail.com", "PK", "tech@prosql.io", "Test", "Test")
	//}

	//r := mux.NewRouter()
//
	////static files
	//r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
//
	////api
	//r.HandleFunc("/go-browser-api/login/{action:[a-z-]*?}", ui.LoginHandler).Methods("Post")
//
	////dynamic pages
	//r.HandleFunc("/{page:[a-z-]*?}", views.Page).Methods("Get")
//
	//srv := &http.Server{
		//Handler:      r,
		//Addr:         "127.0.0.1:9200",
		//WriteTimeout: 15 * time.Second,
		//ReadTimeout:  15 * time.Second,
	//}
//
	//log.Fatal(srv.ListenAndServe())
}


