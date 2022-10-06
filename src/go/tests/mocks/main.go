package mocks
import (
	"context"
	"testing"
	"github.com/kargirwar/golang/utils"
	"github.com/kargirwar/prosql-go/types"
)

type MockEmailer struct {
	t *testing.T
}

func (e MockEmailer) Send(ctx context.Context, toEmail, fromName, fromEmail, subject, msg string) error {
	utils.Dbg(ctx, "MockEmailer.Send")
	e.t.Log("MockEmailer.Send")
	return nil
}

type ServiceProvider struct {
	T *testing.T
}

func (s ServiceProvider) Get(service string) interface{} {
	switch service {
	case types.SERVICE_EMAILER:
		e := MockEmailer{t: s.T}
		return &e

	default:
		return nil
	}
}
