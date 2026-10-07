import sys, os
sys.path.append(os.path.abspath('.'))
from app.ml.anomaly_detector import MLDetector

det = MLDetector()
attack_events = [
    {"source": "PRIVILEGE", "severity": "critical", "event_type": "sudo_escalation"},
    {"source": "FILE", "severity": "critical", "event_type": "shadow_file_access"},
    {"source": "NETWORK", "severity": "high", "event_type": "outbound_c2_connection"}
]
print("Trained?", det.is_trained)
preds = det.model.decision_function(det.extract_features(attack_events))
print("decision_function:", preds)
scores = (0.5 - preds) / 1.0
print("unclipped scores:", scores)
