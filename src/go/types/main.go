package types

import (
	"context"
)

const SERVICE_EMAILER = "service-emailer"

//type ServiceProvider func(string) interface{}

type ServiceProvider interface {
	Get(s string) interface{}
}

type Emailer interface {
	Send(ctx context.Context, toEmail, fromName, fromEmail, subject, msg string) error
}
