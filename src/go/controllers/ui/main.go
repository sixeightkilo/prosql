package ui

import (
	"github.com/kargirwar/prosql-go/types"
)

const MIN_OTP = 100000
const MAX_OTP = 999999

const OTP = "otp"
const TEMP_USER = "temp-user"
const USER = "user"
const DEVICE_ID = "device-id"
const VERSION = "version"
const OS = "os"

var service types.ServiceProvider

func SetServiceProvider(sp types.ServiceProvider) {
	service = sp
}
