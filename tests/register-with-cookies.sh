curl -v \
  -c cookies.txt \
  -b cookies.txt \
  -X POST http://localhost:5001/browser-api/devices/register \
  -H "Content-Type: application/json" \
  -d '{
        "device-id": "dev-123",
        "version": "0.6",
        "os": "linux"
      }'

