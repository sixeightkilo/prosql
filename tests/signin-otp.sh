curl -X POST http://localhost:5001/browser-api/login/set-signin-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kargirwar@gmail.com",
    "device-id": "45148f818dd7436df8b3a1540c8eb379cd7cba3ba5603b787d0ce5e27635bbb1",
    "version": "0.6.4",
    "os": "linux"
  }'

