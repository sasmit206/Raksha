def assess_risk(anomaly_score, severity, confidence):
    """
    Calculate risk score (0-100)
    """
    base = anomaly_score * 40 # Up to 40 pts from anomaly score
    
    sev_map = {"low": 10, "medium": 30, "high": 50, "critical": 60}
    sev_score = sev_map.get(severity, 0)
    
    # Confidence weight
    risk = base + (sev_score * confidence)
    
    # Cap at 100
    return min(100, int(risk))

def get_risk_classification(score: int):
    if score < 25: return "LOW"
    if score < 50: return "MODERATE"
    if score < 75: return "HIGH"
    return "CRITICAL"
