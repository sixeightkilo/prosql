package types

import (
	"context"
	"net/http"
)

const SERVICE_CONFIG = "service-config"
const SERVICE_EMAILER = "service-emailer"
const SERVICE_SESSION_MANAGER = "service-session-manager"

type Config struct {
	Env string `json:"env"`
	SessionKey string `json:"session-key"`
	SessionName string `json:"session-name"`
	LogDir string `json:"log-dir"`
	Version string `json:"version"`
	DbPath string `json:"db-path"`
	SendGridKey string `json:"sendgrid-key"`
	AppVersions map[string]string `json:"app-versions"`
	Email map[string]string `json:"email"`
}

type ServiceProvider interface {
	Get(s string) interface{}
}

type Emailer interface {
	Send(ctx context.Context, toEmail, fromName, fromEmail, subject, msg string) error
}

type SessionManager interface {
	Set(r *http.Request, k string, v interface{})
	Get(r *http.Request, k string) (interface{}, bool)
	Save(r *http.Request, w http.ResponseWriter) error
}
