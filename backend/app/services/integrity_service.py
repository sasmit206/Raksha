import hmac
import hashlib
import json
import os
from typing import Dict, Any

# In production, use a secure vault.
SIGNING_SECRET = os.getenv("SIGNING_SECRET", "super-secret-integrity-key").encode('utf-8')

def sign_event(event: Dict[str, Any]) -> str:
    """Generates an HMAC SHA-256 signature for a telemetry event payload."""
    # Create a copy of the event without the signature field (if it exists)
    payload = {k: v for k, v in event.items() if k != "signature"}
    
    # Sort keys to ensure deterministic JSON serialization
    serialized_payload = json.dumps(payload, sort_keys=True, separators=(',', ':')).encode('utf-8')
    
    signature = hmac.new(SIGNING_SECRET, serialized_payload, hashlib.sha256).hexdigest()
    return signature

def verify_event(event: Dict[str, Any]) -> bool:
    """Verifies that the event has not been tampered with since creation."""
    if "signature" not in event:
        return False
        
    expected_signature = sign_event(event)
    # Use compare_digest to prevent timing attacks
    return hmac.compare_digest(event["signature"], expected_signature)
