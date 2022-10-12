package types

import (
	"context"
	"time"
	"net/http"
)

const SERVICE_CONFIG = "service-config"
const SERVICE_EMAILER = "service-emailer"
const SERVICE_SESSION_MANAGER = "service-session-manager"
const SERVICE_CAPTCHA = "service-captcha"
const SERVICE_CLOCK = "service-clock"

type Config struct {
	Env string `json:"env"`
	SessionKey string `json:"session-key"`
	SessionName string `json:"session-name"`
	LogDir string `json:"log-dir"`
	Version string `json:"version"`
	WebDbPath string `json:"web-db-path"`
	ClientDbPath string `json:"client-db-path"`
	SendGridKey string `json:"sendgrid-key"`
	AppVersions map[string]string `json:"app-versions"`
	Email map[string]string `json:"email"`
}

type ServiceProvider interface {
	Get(s string) interface{}
}

type CaptchService interface {
	Get() (string, string, error)
	IsValid(id, value string) (bool, error)
}

type Emailer interface {
	Send(ctx context.Context, toEmail, fromName, fromEmail, subject, msg string) error
}

type SessionManager interface {
	Set(r *http.Request, k string, v interface{})
	Get(r *http.Request, k string) (interface{}, bool)
	Save(r *http.Request, w http.ResponseWriter) error
	Kill(r *http.Request, w http.ResponseWriter) error
}

type Clock interface {
	Now() time.Time
}
