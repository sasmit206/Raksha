import subprocess
import time
import requests
p = subprocess.Popen(["python", "-m", "uvicorn", "app.main:app", "--port", "8005"])
time.sleep(3)
res = requests.post("http://127.0.0.1:8005/api/auth/register", json={"username": "test99", "password": "123"})
print(res.status_code)
print(res.text)
p.terminate()
