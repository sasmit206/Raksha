import sys, os
sys.path.append(os.path.abspath('.'))
from app.main import run_demo_simulation, state
from app.services.risk_service import assess_risk

run_demo_simulation()
patterns = state["patterns"]
conf = patterns[0]["confidence"]
val = assess_risk(0.9, "critical", conf)
print("Computed val:", val)
print("State val:", state["risk_score"])
