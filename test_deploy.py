from fastapi.testclient import TestClient
from backend.app.main import app, state

client = TestClient(app)
with open('frontend/src/assets/react.svg', 'rb') as f:
    response = client.post('/api/crypto/honeytoken/deploy', files={'file': f})
    
print("Status Code:", response.status_code)
print("Response:", response.json())
print("Telemetry State Length:", len(state["telemetry"]))
if len(state["telemetry"]) > 0:
    print("Latest Event:", state["telemetry"][-1])
