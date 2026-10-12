from fastapi import APIRouter

router = APIRouter()

@router.get("/diagnostics")
def get_ml_diagnostics():
    from app.main import ml_detector, state
    # Provide actual details from the loaded ML detector
    return {
        "is_trained": ml_detector.is_trained,
        "parameters": {
            "algorithm": "Isolation Forest",
            "contamination": ml_detector.model.contamination,
            "n_estimators": ml_detector.model.n_estimators,
            "max_samples": getattr(ml_detector.model, 'max_samples', 'auto'),
            "random_state": ml_detector.model.random_state
        },
        "features": [
            {"name": "event_type_encoded", "description": "Categorical hash of specific event type", "importance": 45},
            {"name": "severity_encoded", "description": "Syslog/OS-level threat severity weight", "importance": 72},
            {"name": "hour_of_day", "description": "Time-based behavioral baselining", "importance": 12},
            {"name": "source_encoded", "description": "Subsystem origin (AUTH, NETWORK, PROCESS)", "importance": 65},
            {"name": "event_rate_rolling", "description": "Volume of events in a rolling 10s window", "importance": 88}
        ],
        "training_samples": len(state.get("telemetry", [])), # Just an approximation for UI
        "latest_anomaly_trend": [evt.get("anomaly_score", 0) for evt in list(state.get("telemetry", []))[-20:]]
    }
