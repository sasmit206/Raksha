import sys, os
sys.path.append(os.path.abspath('.'))
from app.main import run_demo_simulation, state
run_demo_simulation()
print("Risk score:", state["risk_score"])
print("First pattern confidence:", state["patterns"][0]["confidence"])
print("First pattern name:", state["patterns"][0]["name"])
