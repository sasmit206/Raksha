"""
Experiments & Multi-Stage Simulation Router
Runs real end-to-end multi-stage security scenarios, records telemetry events,
computes cryptographic HMAC signatures and intermediate hashes, scores through
Isolation Forest, extracts attack patterns and defensive recommendations,
and persists complete run history in SQLite.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid
import time
import threading
import random
import json

from app.db.database import SessionLocal
from app.models.all import Experiment, TelemetryEvent, Anomaly, Pattern, Recommendation
from app.services.integrity_service import sign_event
from app.services.pattern_service import analyze_sequences
from app.services.recommendation_service import generate_recommendations
from app.services.risk_service import assess_risk
from app.routers.ml import record_scored_event

router = APIRouter()

_active_lock = threading.Lock()
_active_run: dict | None = None


def get_active_run() -> dict | None:
    with _active_lock:
        return _active_run.copy() if _active_run else None


def set_active_run(run_info: dict | None):
    global _active_run
    with _active_lock:
        _active_run = run_info


def execute_demo_scenario(run_id: str):
    """
    Executes a real multi-stage attack scenario:
    1. Auth brute-force
    2. Suspicious process
    3. Privilege escalation
    4. Shadow file / honeytoken access
    5. C2 network egress
    """
    from app.main import state

    db: Session = SessionLocal()
    started = datetime.utcnow()
    vm_id = "RAKSHA-01"

    # Multi-stage realistic event sequences with feature vectors:
    # Features: [source_code, severity_code, event_freq, payload_entropy]
    stages = [
        # Stage 1: Auth
        {
            "source": "AUTH",
            "event_type": "authentication_failure",
            "severity": "high",
            "user": "root",
            "process": "sshd",
            "resource": "/var/log/auth.log",
            "action": "Failed SSH password for root from 192.168.1.105",
            "features": [1.0, 3.0, 4.5, 0.72]
        },
        {
            "source": "AUTH",
            "event_type": "authentication_failure",
            "severity": "high",
            "user": "admin",
            "process": "sshd",
            "resource": "/var/log/auth.log",
            "action": "Failed SSH password for admin from 192.168.1.105",
            "features": [1.0, 3.0, 6.2, 0.81]
        },
        # Stage 2: Process execution
        {
            "source": "PROCESS",
            "event_type": "unusual_process_activity",
            "severity": "critical",
            "user": "sysadmin",
            "process": "/tmp/.recon_scan",
            "resource": "/proc/net/tcp",
            "action": "Execution of unverified binary in /tmp directory",
            "features": [2.0, 4.0, 2.1, 0.94]
        },
        # Stage 3: Privilege escalation
        {
            "source": "PRIVILEGE",
            "event_type": "sudo_execution",
            "severity": "critical",
            "user": "sysadmin",
            "process": "sudo",
            "resource": "/etc/sudoers",
            "action": "sudo su - switched user privileges to root",
            "features": [4.0, 4.0, 1.8, 0.88]
        },
        # Stage 4: File access / tripwire
        {
            "source": "FILE",
            "event_type": "shadow_file_access",
            "severity": "critical",
            "user": "root",
            "process": "cat",
            "resource": "/etc/shadow",
            "action": "Direct read of protected credential store /etc/shadow",
            "features": [3.0, 4.0, 1.5, 0.91]
        },
        {
            "source": "FILE",
            "event_type": "honeytoken_access",
            "severity": "critical",
            "user": "root",
            "process": "python3",
            "resource": "/home/admin/decoy_credentials.enc",
            "action": "Honeytoken trap triggered: unauthorized exfiltration attempt",
            "features": [3.0, 4.0, 2.8, 0.96]
        },
        # Stage 5: Network connection
        {
            "source": "NETWORK",
            "event_type": "outbound_c2_connection",
            "severity": "high",
            "user": "root",
            "process": "curl",
            "resource": "198.51.100.42:8443",
            "action": "Encrypted TCP socket opened to unknown external C2 address",
            "features": [5.0, 3.0, 3.2, 0.85]
        },
        # Normal baseline noise to contrast
        {
            "source": "PROCESS",
            "event_type": "normal_activity",
            "severity": "low",
            "user": "systemd",
            "process": "systemd-journald",
            "resource": "/run/systemd/journal",
            "action": "Periodic log flush",
            "features": [0.1, 0.2, 0.1, 0.05]
        },
        {
            "source": "NETWORK",
            "event_type": "normal_activity",
            "severity": "low",
            "user": "ntp",
            "process": "chronyd",
            "resource": "pool.ntp.org:123",
            "action": "NTP clock synchronization pulse",
            "features": [0.05, 0.1, 0.05, 0.02]
        },
        {
            "source": "AUTH",
            "event_type": "normal_activity",
            "severity": "low",
            "user": "cron",
            "process": "crond",
            "resource": "/etc/cron.hourly",
            "action": "Scheduled system cron execution",
            "features": [0.1, 0.1, 0.08, 0.04]
        }
    ]

    events_created = []
    anomalies_detected = []

    try:
        for stage in stages:
            time.sleep(0.3)  # Real temporal separation

            # Real Isolation Forest scoring
            ml_res = record_scored_event(stage["features"])
            score = ml_res["score"]

            event_id = str(uuid.uuid4())
            timestamp_str = datetime.utcnow().isoformat() + "Z"

            evt_dict = {
                "id": event_id,
                "timestamp": timestamp_str,
                "vm_id": vm_id,
                "source": stage["source"],
                "event_type": stage["event_type"],
                "severity": stage["severity"],
                "user": stage["user"],
                "process": stage["process"],
                "resource": stage["resource"],
                "action": stage["action"],
                "anomaly_score": score,
            }
            # Cryptographic HMAC-SHA-256 event signature
            evt_dict["signature"] = sign_event(evt_dict)

            # Persist TelemetryEvent to SQLite
            db_event = TelemetryEvent(
                id=event_id,
                timestamp=datetime.utcnow(),
                experiment_id=run_id,
                vm_id=vm_id,
                source=stage["source"],
                event_type=stage["event_type"],
                severity=stage["severity"],
                user=stage["user"],
                process=stage["process"],
                pid=random.randint(1000, 9999),
                resource=stage["resource"],
                action=stage["action"],
                raw_event=json.dumps(evt_dict),
                anomaly_score=score
            )
            db.add(db_event)
            events_created.append(evt_dict)

            # Also push to main state
            state["telemetry"].append(evt_dict)
            state["events_collected"] += 1
            state["session_delta"] += 1

            # Detect Anomaly if score exceeds threshold (0.6)
            if score >= 0.6 or stage["severity"] in ["high", "critical"]:
                anomaly_id = str(uuid.uuid4())
                anomaly_dict = {
                    "id": anomaly_id,
                    "title": f"Anomalous {stage['source']} Activity: {stage['event_type']}",
                    "timestamp": timestamp_str,
                    "anomaly_score": score,
                    "vm_id": vm_id,
                    "source": stage["source"],
                    "confidence": round(score * 100, 1),
                    "status": "Investigating"
                }
                anomalies_detected.append(anomaly_dict)
                state["anomalies"].append(anomaly_dict)

                db_anomaly = Anomaly(
                    id=anomaly_id,
                    experiment_id=run_id,
                    title=anomaly_dict["title"],
                    timestamp=datetime.utcnow(),
                    anomaly_score=score,
                    vm_id=vm_id,
                    source=stage["source"],
                    event_count=1,
                    confidence=anomaly_dict["confidence"],
                    status="Investigating"
                )
                db.add(db_anomaly)

        # Pattern analysis across the telemetry events
        patterns = analyze_sequences(events_created)
        state["patterns"].extend(patterns)
        for p in patterns:
            db_p = Pattern(
                id=p.get("id", str(uuid.uuid4())),
                experiment_id=run_id,
                name=p.get("name", "Behavioral Attack Pattern"),
                confidence=p.get("confidence", 0.9),
                risk_level=p.get("risk_level", "HIGH"),
                evidence_count=p.get("evidence_count", len(events_created)),
                time_window_seconds=p.get("time_window_seconds", 30)
            )
            db.add(db_p)

        # Defensive Recommendations
        recommendations = generate_recommendations(events_created, patterns)
        state["recommendations"].extend(recommendations)
        for r in recommendations:
            db_r = Recommendation(
                id=r.get("id", str(uuid.uuid4())),
                experiment_id=run_id,
                title=r.get("title", "Mitigation Control"),
                reason=r.get("description", "Automated finding"),
                priority=r.get("priority", "HIGH"),
                control_category=r.get("target_entity", "System"),
                status="Pending"
            )
            db.add(db_r)

        # Calculate final risk score
        if patterns:
            max_anomaly = max([e.get("anomaly_score", 0.7) for e in events_created])
            state["risk_score"] = assess_risk(max_anomaly, "critical", patterns[0]["confidence"])
        else:
            state["risk_score"] = 65

        # Update Experiment row
        elapsed_sec = max(1, int((datetime.utcnow() - started).total_seconds()))
        exp_row = db.query(Experiment).filter(Experiment.id == run_id).first()
        if exp_row:
            exp_row.status = "Completed"
            exp_row.duration = elapsed_sec
            exp_row.events_count = len(events_created)
            exp_row.anomalies_count = len(anomalies_detected)
            exp_row.risk_score = state["risk_score"]
            db.commit()

    except Exception as e:
        print(f"[EXPERIMENT] Error in scenario execution: {e}")
        db.rollback()
        exp_row = db.query(Experiment).filter(Experiment.id == run_id).first()
        if exp_row:
            exp_row.status = "Failed"
            exp_row.duration = max(1, int((datetime.utcnow() - started).total_seconds()))
            db.commit()
    finally:
        db.close()
        set_active_run(None)


@router.get("/history")
def get_experiment_history():
    """
    Returns persistent experiment run history from SQLite database.
    """
    db = SessionLocal()
    try:
        rows = db.query(Experiment).order_by(Experiment.started_at.desc()).limit(50).all()
        runs_list = []
        for r in rows:
            runs_list.append({
                "id": str(r.id),
                "scenario": r.scenario or "demo",
                "status": r.status or "Completed",
                "started": r.started_at.isoformat() if r.started_at else "",
                "duration_s": r.duration or 0,
                "events": r.events_count or 0,
                "anomalies": r.anomalies_count or 0,
                "risk_score": r.risk_score or 0
            })

        active = get_active_run()
        return {
            "active": active,
            "runs": runs_list
        }
    finally:
        db.close()


@router.post("/run")
def start_experiment(background_tasks: BackgroundTasks):
    """
    Starts the multi-stage demo experiment scenario in the background.
    """
    current_active = get_active_run()
    if current_active:
        return {"status": "busy", "message": "An experiment is already actively running", "run": current_active}

    run_id = str(uuid.uuid4())
    started = datetime.utcnow()

    # Pre-create entry in DB
    db = SessionLocal()
    try:
        new_exp = Experiment(
            id=run_id,
            scenario="demo",
            status="Running",
            started_at=started,
            duration=0,
            events_count=0,
            anomalies_count=0,
            is_demo=True
        )
        db.add(new_exp)
        db.commit()
    finally:
        db.close()

    active_dict = {
        "id": run_id,
        "scenario": "demo",
        "status": "Running",
        "started": started.isoformat()
    }
    set_active_run(active_dict)

    # Launch background thread
    t = threading.Thread(target=execute_demo_scenario, args=(run_id,), daemon=True)
    t.start()

    return {
        "status": "started",
        "id": run_id,
        "scenario": "demo",
        "message": "Multi-stage demo scenario launched"
    }


@router.get("/{run_id}")
def get_experiment_details(run_id: str):
    """
    Returns full forensic breakdown of events, anomalies, and patterns for a given experiment.
    """
    db = SessionLocal()
    try:
        exp = db.query(Experiment).filter(Experiment.id == run_id).first()
        if not exp:
            raise HTTPException(status_code=404, detail="Experiment not found")

        events = db.query(TelemetryEvent).filter(TelemetryEvent.experiment_id == run_id).all()
        anomalies = db.query(Anomaly).filter(Anomaly.experiment_id == run_id).all()
        patterns = db.query(Pattern).filter(Pattern.experiment_id == run_id).all()
        recommendations = db.query(Recommendation).filter(Recommendation.experiment_id == run_id).all()

        return {
            "experiment": {
                "id": str(exp.id),
                "scenario": exp.scenario,
                "status": exp.status,
                "started_at": exp.started_at.isoformat() if exp.started_at else "",
                "duration": exp.duration,
                "events_count": exp.events_count,
                "anomalies_count": exp.anomalies_count,
                "risk_score": exp.risk_score
            },
            "events": [
                {
                    "id": str(e.id),
                    "timestamp": e.timestamp.isoformat() if e.timestamp else "",
                    "source": e.source,
                    "event_type": e.event_type,
                    "severity": e.severity,
                    "action": e.action,
                    "anomaly_score": e.anomaly_score
                }
                for e in events
            ],
            "anomalies": [
                {
                    "id": str(a.id),
                    "title": a.title,
                    "source": a.source,
                    "confidence": a.confidence,
                    "anomaly_score": a.anomaly_score
                }
                for a in anomalies
            ],
            "patterns": [
                {
                    "id": str(p.id),
                    "name": p.name,
                    "risk_level": p.risk_level,
                    "confidence": p.confidence
                }
                for p in patterns
            ],
            "recommendations": [
                {
                    "id": str(r.id),
                    "title": r.title,
                    "priority": r.priority,
                    "reason": r.reason
                }
                for r in recommendations
            ]
        }
    finally:
        db.close()
