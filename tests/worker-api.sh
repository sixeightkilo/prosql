curl -v -X POST http://localhost:5001/worker-api/devices/register \
  -H "Content-Type: application/json" \
  -d '{
        "device-id": "test-device-456",
        "platform": "linux",
        "version": "0.6"
      }'

