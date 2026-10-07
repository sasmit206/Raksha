import uuid
from typing import List

# Predefined pattern configurations
PATTERNS = [
    {
        "pattern_id": "P001",
        "name": "Multi-stage privilege and protected access",
        "sequence": ["AUTH", "PROCESS", "PRIVILEGE", "FILE", "NETWORK"],
        "time_window_seconds": 60,
        "risk_level": "CRITICAL"
    },
    {
        "pattern_id": "P002",
        "name": "Suspicious Authentication and Execution",
        "sequence": ["AUTH", "PROCESS"],
        "time_window_seconds": 30,
        "risk_level": "HIGH"
    }
]

def analyze_sequences(events: List[dict]):
    """
    Looks for matching temporal sequences in the provided events.
    Events should be sorted by timestamp.
    """
    detected_patterns = []
    
    # Sort events by timestamp just in case
    events.sort(key=lambda x: x.get('timestamp', ''))

    for pattern_config in PATTERNS:
        seq = pattern_config["sequence"]
        seq_idx = 0
        matching_events = []
        
        for event in events:
            # Only consider events that are somewhat anomalous to avoid matching baseline events
            if event.get("anomaly_score", 0) > 0.1 and event.get("source") == seq[seq_idx]:
                matching_events.append(event)
                seq_idx += 1
                
                if seq_idx == len(seq):
                    # Pattern matched!
                    # Calculate confidence based on anomaly scores of events
                    avg_anomaly = sum(e.get("anomaly_score", 0) for e in matching_events) / len(matching_events)
                    confidence = min(0.99, avg_anomaly + (len(matching_events) * 0.1))
                    
                    detected_patterns.append({
                        "id": str(uuid.uuid4()),
                        "name": pattern_config["name"],
                        "confidence": confidence,
                        "risk_level": pattern_config["risk_level"],
                        "evidence_count": len(matching_events),
                        "time_window_seconds": pattern_config["time_window_seconds"],
                        "evidence_events": matching_events
                    })
                    break # Break out for this pattern, move to next
    
    return detected_patterns
