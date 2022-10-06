package sp

import (
	"github.com/kargirwar/golang/utils/sm"
	"github.com/kargirwar/golang/utils/emailer"
	"github.com/kargirwar/golang/utils/captcha"
	"github.com/kargirwar/prosql-go/types"
	"github.com/benbjohnson/clock"
)

var Clock clock.Clock

type ServiceProvider struct {
	Config types.Config
}

func init() {
	Clock = clock.New()
}


func (s ServiceProvider) Get(service string) interface{} {
	switch service {
	case types.SERVICE_EMAILER:
		var e emailer.Emailer
		e.SetKey(s.Config.SendGridKey)
		return &e

	case types.SERVICE_CONFIG:
		return s.Config

	case types.SERVICE_SESSION_MANAGER:
		return sm.NewSessionManager(s.Config.SessionKey, s.Config.SessionName)

	case types.SERVICE_CAPTCHA:
		c := &captcha.CaptchaService{}
		return c

	case types.SERVICE_CLOCK:
		return Clock

	default:
		return nil
	}
}
