import sys, os
sys.path.append(os.path.abspath('.'))
from app.ml.anomaly_detector import MLDetector
from app.main import run_demo_simulation, state
run_demo_simulation()
print("Risk score:", state["risk_score"])
