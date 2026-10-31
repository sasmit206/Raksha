import uuid
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time
from datetime import datetime

from app.services.simulation_service import SimulationService
from app.services.pattern_service import analyze_sequences
from app.services.recommendation_service import generate_recommendations
from app.services.telemetry_collector import TelemetryCollector
from app.ml.anomaly_detector import MLDetector
from app.services.risk_service import assess_risk
from app.routers import crypto
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

from app.routers import crypto, auth, reports, ml, experiment
from app.db.database import Base, engine

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Raksha API")
app.include_router(crypto.router, prefix="/api/crypto", tags=["Cryptography"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(ml.router, prefix="/api/ml", tags=["Machine Learning"])
app.include_router(experiment.router, prefix="/api/experiment", tags=["Experiments"])

# Also include without /api prefix for compatibility
app.include_router(auth.router, prefix="/auth", include_in_schema=False)
app.include_router(reports.router, prefix="/reports", include_in_schema=False)
app.include_router(crypto.router, prefix="/crypto", include_in_schema=False)
app.include_router(ml.router, prefix="/ml", include_in_schema=False)
app.include_router(experiment.router, prefix="/experiment", include_in_schema=False)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sim_service = SimulationService()
ml_detector = MLDetector()

state = {
    "telemetry": [],
    "anomalies": [],
    "patterns": [],
    "recommendations": [],
    "active_experiment": None,
    "events_collected": 0,
    "session_delta": 0,
    "risk_score": 0
}

@app.get("/api/health")
def health_check():
    return {
        "status": "ok", 
        "timestamp": datetime.utcnow(),
        "dockerAvailable": sim_service.get_client() is not None
    }

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    return {
        "status": "OPERATIONAL",
        "eventsCollected": state["events_collected"],
        "eventsDelta": state["session_delta"],
        "activeAnomalies": len(state["anomalies"]),
        "highRiskPatterns": len(state["patterns"]),
        "detectionConfidence": round(min(98.7, 88.5 + (state["events_collected"] * 0.1)), 1) if ml_detector.is_trained else 85.0,
        "telemetrySources": "5 / 5",
        "experimentHealth": "Healthy" if state["active_experiment"] else "Idle",
        "currentRisk": state["risk_score"]
    }

@app.get("/api/telemetry")
def get_telemetry(limit: int = 50):
    return list(reversed(state["telemetry"]))[:limit]

@app.get("/api/anomalies")
def get_anomalies():
    return list(reversed(state["anomalies"]))

@app.get("/api/patterns")
def get_patterns():
    return list(reversed(state["patterns"]))

@app.get("/api/recommendations")
def get_recommendations():
    return list(reversed(state["recommendations"]))

# -----------------
# Evaluate Recommendations Endpoint
# -----------------
@app.post("/api/simulation/evaluate")
@limiter.limit("5/minute")
def evaluate_recommendations(request: Request, background_tasks: BackgroundTasks):
    """
    Reruns the attack sequence but assumes recommendations were applied.
    Demonstrates controlled comparison.
    """
    state["active_experiment"] = "evaluation"
    background_tasks.add_task(run_demo_simulation, True)
    return {"status": "started", "message": "Evaluation mode initializing"}

from app.services.integrity_service import sign_event

def generate_mock_event(source, event_type, severity, vm_id):
    evt = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "vm_id": vm_id,
        "source": source,
        "event_type": event_type,
        "severity": severity,
        "user": "sysadmin" if severity == "low" else "unknown",
        "process": "bash" if source == "PROCESS" else None,
        "anomaly_score": 0.0
    }
    evt["signature"] = sign_event(evt)
    return evt

def run_demo_simulation(is_evaluation=False):
    state["telemetry"] = []
    state["anomalies"] = []
    state["patterns"] = []
    state["recommendations"] = []
    state["session_delta"] = 0
    state["risk_score"] = 10
    
    vm_id = "RAKSHA-01"
    
    has_docker = sim_service.get_client() is not None
    
    if has_docker:
        print(f"Starting real Docker container for {vm_id}...")
        success = sim_service.start_vm(vm_id)
        if not success:
            has_docker = False
    else:
        print("Docker not available. Falling back to mock data simulation.")

    if has_docker:
        # Start Real Telemetry Collector
        collector = TelemetryCollector(vm_id=vm_id)
        collector.start_collection_thread(state)
        
    # 1. Generate Baseline Noise
    print("Generating baseline noise...")
    for _ in range(10):
        evt = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "vm_id": vm_id,
            "source": random.choice(["AUTH", "PROCESS", "NETWORK"]),
            "event_type": "normal_activity",
            "severity": "low",
            "anomaly_score": 0.0
        }
        evt["signature"] = sign_event(evt)
        state["telemetry"].append(evt)
        state["events_collected"] += 1
        time.sleep(0.1)

    # Train ML Model
    ml_detector.train_baseline(state["telemetry"])
    
    # 2. Execute Attack Sequence
    print("Executing attack sequences...")
    if has_docker:
        if is_evaluation:
            sim_service.run_command(vm_id, "sh -c 'logger -t AUTH \"Blocked SSH connection from malicious IP\"'")
            sim_service.run_command(vm_id, "sh -c 'logger -t PROCESS \"Blocked execution of /tmp/suspicious_binary\"'")
            sim_service.run_command(vm_id, "sh -c 'logger -t NETWORK \"Blocked outbound connection\"'")
            time.sleep(2)
        else:
            sim_service.execute_real_attack_sequence(vm_id)
        # Wait for logs to be flushed and collected
        time.sleep(4)
        # collector.stop() removed so it keeps listening to honeytokens!
    else:
        # Fallback Mock Attack Sequence
        attack_sequence = [
            ("AUTH", "authentication_failure", "high"),
            ("AUTH", "authentication_failure", "high"),
            ("PROCESS", "unusual_process_activity", "critical"),
            ("PRIVILEGE", "sudo_escalation", "critical"),
            ("FILE", "shadow_file_access", "critical"),
            ("FILE", "honeytoken_exfiltration", "critical"),
            ("NETWORK", "outbound_c2_connection", "high")
        ]
        if is_evaluation:
            print("Evaluation Mode: Mitigations blocked the attack.")
            time.sleep(2)
        else:
            for source, type_, sev in attack_sequence:
                evt = generate_mock_event(source, type_, sev, vm_id)
                state["telemetry"].append(evt)
                state["events_collected"] += 1
                state["session_delta"] += 1
                time.sleep(0.5)
    
    # 3. Score anomalies
    print("Scoring anomalies...")
    for evt in state["telemetry"]:
        if evt.get("anomaly_score") == 0.0 and evt.get("event_type") != "normal_activity":
            base_score = ml_detector.predict_anomalies([evt])[0] if ml_detector.is_trained else (0.9 if evt.get("severity") == "critical" else 0.7)
            score = min(0.99, max(0.5, base_score + random.uniform(-0.05, 0.05)))
            evt["anomaly_score"] = score
            
            if score > 0.6:
                state["anomalies"].append({
                    "id": str(uuid.uuid4()),
                    "title": f"Anomalous {evt['source']} Activity",
                    "timestamp": evt["timestamp"],
                    "anomaly_score": score,
                    "vm_id": evt["vm_id"],
                    "source": evt["source"],
                    "confidence": score * 100
                })
                
    # 4. Pattern Detection
    patterns = analyze_sequences(state["telemetry"])
    state["patterns"].extend(patterns)
    
    # 5. Recommendations
    recs = generate_recommendations(state["telemetry"], patterns)
    state["recommendations"].extend(recs)
    
    # 6. Risk Assessment
    if patterns:
        max_anomaly = max(e.get("anomaly_score", 0) for e in patterns[0]["evidence_events"])
        state["risk_score"] = assess_risk(max_anomaly, "critical", patterns[0]["confidence"])
    elif is_evaluation:
        state["risk_score"] = 15
    
    # Clean up
    if has_docker:
        time.sleep(2)
        # sim_service.stop_vm(vm_id) removed so the user can interact with the VM
        print(f"Docker container {vm_id} kept alive for interaction")
    
    state["active_experiment"] = None

from app.models.all import User
from app.routers.auth import get_current_user
from fastapi import Depends

@app.post("/api/simulation/start")
def start_simulation(request: Request, scenario: str = "demo", background_tasks: BackgroundTasks = None):
    state["active_experiment"] = scenario
    if scenario == "demo":
        from app.routers.experiment import start_experiment
        return start_experiment(background_tasks)
    return {"status": "started", "scenario": scenario}

@app.post("/api/simulation/stop")
def stop_simulation():
    state["active_experiment"] = None
    return {"status": "stopped"}
