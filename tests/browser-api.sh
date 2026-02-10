curl -v \
  -X POST http://localhost:5001/browser-api/devices/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "device-id=dev-456&version=0.6.4&os=mac"
