import uuid
from typing import List

RECOMMENDATION_MAP = {
    "AUTH": [
        "Increase authentication auditing",
        "Enforce stronger authentication controls",
        "Monitor repeated authentication failures"
    ],
    "PROCESS": [
        "Increase process creation auditing",
        "Restrict unexpected execution contexts"
    ],
    "PRIVILEGE": [
        "Review privilege assignments",
        "Tighten administrative access"
    ],
    "FILE": [
        "Restrict access permissions to protected directories",
        "Enable file access auditing"
    ],
    "NETWORK": [
        "Increase outbound network monitoring",
        "Restrict unexpected outbound connections"
    ],
    "P001": [
        "IMMEDIATE ACTION: Isolate affected hosts from the network",
        "IMMEDIATE ACTION: Investigate account/process context for privilege escalation",
        "IMMEDIATE ACTION: Reset compromised credentials"
    ]
}

def generate_recommendations(events: List[dict], patterns: List[dict]):
    """
    Generate defensive recommendations based on isolated anomalies and complex patterns.
    """
    recommendations = []
    seen = set()
    
    # Process patterns first (higher priority)
    for p in patterns:
        name = p.get("name", "")
        # Match new dynamic pattern names
        if "Kill Chain" in name or "Exfiltration" in name or "Privilege Escalation" in name or "High-Frequency" in name:
            recs = RECOMMENDATION_MAP.get("P001", [])
            for r in recs:
                if r not in seen:
                    recommendations.append({
                        "id": str(uuid.uuid4()),
                        "title": r,
                        "description": f"Generated due to detection of critical pattern: {name}",
                        "priority": "CRITICAL",
                        "action_type": "Mitigation",
                        "target_entity": "Multiple Systems",
                        "status": "Pending"
                    })
                    seen.add(r)
    
    # Process high severity events
    for e in events:
        if e.get("severity") in ["high", "critical"] or e.get("anomaly_score", 0) > 0.7:
            source = e.get("source")
            recs = RECOMMENDATION_MAP.get(source, [])
            for r in recs:
                if r not in seen:
                    recommendations.append({
                        "id": str(uuid.uuid4()),
                        "title": r,
                        "description": f"Generated due to {e.get('severity', 'high')} severity {source} anomaly",
                        "priority": "HIGH",
                        "action_type": "Auditing",
                        "target_entity": source,
                        "status": "Pending"
                    })
                    seen.add(r)
                    
    return recommendations
