import requests
try:
    res = requests.post("http://localhost:8000/api/auth/register", json={"username": "testuser", "password": "password"})
    print(res.status_code)
    print(res.text)
except Exception as e:
    print(f"Error: {e}")
