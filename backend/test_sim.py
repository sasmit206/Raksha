import requests
import time
import json

def test():
    print("Starting simulation...")
    requests.post("http://localhost:8000/api/simulation/start?scenario=demo")
    
    for i in range(15):
        time.sleep(2)
        try:
            res = requests.get("http://localhost:8000/api/dashboard/summary").json()
            print(f"[{i*2}s] Summary:", res)
        except:
            pass

test()
