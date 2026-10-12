import uuid
from typing import List
from collections import defaultdict
from datetime import datetime

def analyze_sequences(events: List[dict]):
    """
    Dynamically identifies behavioral patterns based on temporal clustering,
    frequency, and specific transition anomalies in telemetry data.
    """
    detected_patterns = []
    
    # Filter for anomalous events (score > 0.4) to build attack graphs
    anomalies = [e for e in events if e.get("anomaly_score", 0) > 0.4]
    
    if not anomalies:
        return detected_patterns

    # 1. Detect High-Frequency Anomalous Bursts (DoS / Automated Scripts)
    # Group by 10-second windows
    time_windows = defaultdict(list)
    for evt in anomalies:
        try:
            # Parse ISO timestamp to group into 10s buckets
            ts = datetime.fromisoformat(evt["timestamp"].replace("Z", "+00:00"))
            bucket = ts.replace(second=(ts.second // 10) * 10, microsecond=0)
            time_windows[bucket].append(evt)
        except Exception:
            pass

    for bucket, window_events in time_windows.items():
        if len(window_events) >= 3:
            avg_score = sum(e.get("anomaly_score", 0) for e in window_events) / len(window_events)
            sources = list(set(e.get("source") for e in window_events))
            name = f"High-Frequency Attack Burst ({len(window_events)} events)"
            if "AUTH" in sources and len(sources) == 1:
                name = "Credential Brute-Force Campaign"
                
            detected_patterns.append({
                "id": str(uuid.uuid4()),
                "name": name,
                "confidence": min(0.99, avg_score + 0.2),
                "risk_level": "CRITICAL" if len(window_events) >= 5 else "HIGH",
                "evidence_count": len(window_events),
                "time_window_seconds": 10,
                "evidence_events": window_events
            })

    # 2. Sequence transitions (Lateral Movement, Exfiltration, Privilege Escalation)
    # Track the sequence of sources for the last N anomalies
    seq = [e.get("source") for e in anomalies]
    
    # Check for Exfiltration (FILE -> NETWORK)
    for i in range(len(anomalies) - 1):
        if seq[i] == "FILE" and seq[i+1] == "NETWORK":
            evt_pair = anomalies[i:i+2]
            avg_score = sum(e.get("anomaly_score", 0) for e in evt_pair) / 2
            detected_patterns.append({
                "id": str(uuid.uuid4()),
                "name": "Data Exfiltration Sequence (File Access -> Outbound Network)",
                "confidence": min(0.99, avg_score + 0.15),
                "risk_level": "CRITICAL",
                "evidence_count": 2,
                "time_window_seconds": 30,
                "evidence_events": evt_pair
            })
            
    # Check for Privilege Escalation Execution (PROCESS -> PRIVILEGE)
    for i in range(len(anomalies) - 1):
        if seq[i] == "PROCESS" and seq[i+1] == "PRIVILEGE":
            evt_pair = anomalies[i:i+2]
            avg_score = sum(e.get("anomaly_score", 0) for e in evt_pair) / 2
            detected_patterns.append({
                "id": str(uuid.uuid4()),
                "name": "Privilege Escalation Execution (Process -> Root)",
                "confidence": min(0.99, avg_score + 0.1),
                "risk_level": "CRITICAL",
                "evidence_count": 2,
                "time_window_seconds": 30,
                "evidence_events": evt_pair
            })

    # Check for Multi-Stage Kill Chain (AUTH -> PROCESS -> ... -> NETWORK)
    if "AUTH" in seq and "PROCESS" in seq and "NETWORK" in seq:
        auth_idx = seq.index("AUTH")
        try:
            proc_idx = seq.index("PROCESS", auth_idx)
            net_idx = seq.index("NETWORK", proc_idx)
            
            chain_events = [anomalies[auth_idx], anomalies[proc_idx], anomalies[net_idx]]
            avg_score = sum(e.get("anomaly_score", 0) for e in chain_events) / 3
            
            detected_patterns.append({
                "id": str(uuid.uuid4()),
                "name": "Complete Multi-Stage Kill Chain (Auth -> Exec -> C2)",
                "confidence": min(0.99, avg_score + 0.25),
                "risk_level": "CRITICAL",
                "evidence_count": 3,
                "time_window_seconds": 120,
                "evidence_events": chain_events
            })
        except ValueError:
            pass

    # Deduplicate patterns with the same name, keeping highest confidence
    dedup = {}
    for p in detected_patterns:
        if p["name"] not in dedup or p["confidence"] > dedup[p["name"]]["confidence"]:
            dedup[p["name"]] = p
            
    return list(dedup.values())
