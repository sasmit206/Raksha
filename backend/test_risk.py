import sys
import os
sys.path.append(os.path.abspath('.'))
from app.main import run_demo_simulation, state
for i in range(5):
    run_demo_simulation()
    print("Risk score:", state["risk_score"])
