package types
	//'version' => 0.6,
	//'db-path' => '/var/lib/sqlite/web/dev/data.db',
	//'download-path' => __DIR__ . '/public/downloads',
	//'sendgrid-key' => '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',
	//web app version for the respective agent version
	//'build-0.6' => [
		//'version' => 2
	//],

type Config struct {
	Env string `json:"env"`
	Version string `json:"version"`
	DbPath string `json:"db-path"`
	SendGridKey string `json:"sendgrid-key"`
	AppVersions map[string]string `json:"app-versions"`
}
