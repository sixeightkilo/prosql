package sp

import (
	"github.com/kargirwar/golang/utils/sm"
	"github.com/kargirwar/golang/utils/emailer"
	"github.com/kargirwar/golang/utils/captcha"
	"github.com/kargirwar/prosql-go/types"
)

type ServiceProvider struct {
	Config types.Config
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

	default:
		return nil
	}
}
