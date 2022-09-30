package types
type Config struct {
	Env string `json:"env"`
	Version string `json:"version"`
	DbPath string `json:"db-path"`
	SendGridKey string `json:"sendgrid-key"`
	AppVersions map[string]string `json:"app-versions"`
}
