package mocks
import (
	"context"
	"testing"
	"fmt"
	"net/http"
	"github.com/kargirwar/golang/utils"
	"github.com/kargirwar/prosql-go/types"
	"regexp"
	"github.com/benbjohnson/clock"
)

type Emailer struct {
	T *testing.T
	ToEmail string
	Callback func(s string)
}

func (e Emailer) Send(ctx context.Context, toEmail, fromName, fromEmail, subject, msg string) error {
	if (toEmail != e.ToEmail) {
		e.T.Errorf("Invalid to address: %s", toEmail)
	}

	//parse and recover otp
	re := regexp.MustCompile(`^.*Your OTP is: ([0-9]{6}).*$`)
	otp := re.ReplaceAll([]byte(msg), []byte("$1"))
	utils.Dbg(ctx, fmt.Sprintf("%+v", e))

	if e.Callback != nil {
		e.Callback(string(otp))
	}

	return nil
}

type SessionManager struct {
	Setter func(k string, v interface{})
	Getter func(k string) (interface{}, bool)
	Killer func()
}

func (s SessionManager) Set(r *http.Request, k string, v interface{}) {
	if s.Setter != nil {
		s.Setter(k, v)
	}
}

func (s SessionManager) Get(r *http.Request, k string) (interface{}, bool) {
	if s.Getter != nil {
		return s.Getter(k)
	}
	return nil, false
}

func (s SessionManager) Save(r *http.Request, w http.ResponseWriter) error {
	return nil
}

func (s SessionManager) Kill(r *http.Request, w http.ResponseWriter) error {
	if s.Killer != nil {
		s.Killer()
	}
	return nil
}

type ServiceProvider struct {
	T *testing.T
	Emailer Emailer
	SessMgr SessionManager
	Config types.Config
	GetClock func() clock.Clock
}

func (s ServiceProvider) Get(service string) interface{} {
	switch service {
	case types.SERVICE_EMAILER:
		return s.Emailer

	case types.SERVICE_SESSION_MANAGER:
		return s.SessMgr

	case types.SERVICE_CONFIG:
		return s.Config

	case types.SERVICE_CLOCK:
		return s.GetClock()

	default:
		return nil
	}
}
