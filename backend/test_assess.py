import sys, os
sys.path.append(os.path.abspath('.'))
from app.services.risk_service import assess_risk
print("Assess risk:", assess_risk(0.9, "critical", 0.8))
