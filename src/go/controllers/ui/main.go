package ui

import (
	"github.com/kargirwar/prosql-go/types"
)

const MIN_OTP = 100000
const MAX_OTP = 999999

var service types.ServiceProvider

func SetServiceProvider(sp types.ServiceProvider) {
	service = sp
}
