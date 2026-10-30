from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import uuid
import json
import hashlib
from datetime import datetime
from app.services.crypto_service import private_key, public_key, avalanche_effect_aes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization

router = APIRouter()

@router.post("/finalize")
async def api_finalize_report():
    from app.main import state
    # 1. Create a snapshot of the current session state
    session_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    # Extract important findings
    snapshot = {
        "session_id": session_id,
        "timestamp": timestamp,
        "anomalies_count": len(state.get("anomalies", [])),
        "patterns_count": len(state.get("patterns", [])),
        "risk_score": state.get("risk_score", 0),
        "recommendations": state.get("recommendations", [])
    }
    
    # 2. Canonical JSON for hashing
    canonical_payload = json.dumps(snapshot, sort_keys=True, separators=(',', ':'))
    
    # 3. Hash the payload
    payload_bytes = canonical_payload.encode('utf-8')
    session_hash = hashlib.sha256(payload_bytes).hexdigest()
    print(f"[HASH-CALC] [Report Finalize] Session {session_id[:8]} | Canonical Payload SHA-256: {session_hash}")
    
    # Intermediate SHA-512 for high-entropy forensic archiving
    intermediate_sha512 = hashlib.sha512(payload_bytes).hexdigest()
    print(f"[HASH-CALC] [Report Finalize] Intermediate High-Entropy Forensic Hash (SHA-512): {intermediate_sha512}")

    # 4. Sign the hash (or payload)
    signature = private_key.sign(
        payload_bytes,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    signature_hex = signature.hex()
    sig_hash = hashlib.sha256(signature).hexdigest()
    print(f"[HASH-CALC] [Report Finalize] Signature Block SHA-256 Digest: {sig_hash}")
    
    # Extract public key for verification info
    pub_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    # Run a fresh AES avalanche effect demo explicitly for this report
    avalanche_data = avalanche_effect_aes("Raksha Session " + session_id[:8])

    return {
        "status": "success",
        "report_metadata": snapshot,
        "cryptographic_integrity": {
            "canonical_payload": canonical_payload,
            "hash_algorithm": "SHA-256",
            "session_hash": session_hash,
            "intermediate_sha512": intermediate_sha512,
            "signature_algorithm": "RSA-PSS",
            "signature_hex": signature_hex,
            "signature_hash": sig_hash,
            "public_key_pem": pub_pem,
            "signing_timestamp": timestamp
        },
        "avalanche_analysis": avalanche_data
    }

@router.post("/verify")
async def api_verify_report(payload: Dict[str, Any]):
    canonical_payload = payload.get("canonical_payload")
    signature_hex = payload.get("signature_hex")
    
    if not canonical_payload or not signature_hex:
        raise HTTPException(status_code=400, detail="Missing payload or signature")
        
    try:
        signature_bytes = bytes.fromhex(signature_hex)
        public_key.verify(
            signature_bytes,
            canonical_payload.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        # also calculate hash
        computed_hash = hashlib.sha256(canonical_payload.encode('utf-8')).hexdigest()
        print(f"[HASH-CALC] [Report Verify] Verified Canonical Payload SHA-256: {computed_hash}")
        return {
            "is_valid": True, 
            "reason": "Signature successfully verified.",
            "computed_hash": computed_hash
        }
    except Exception as e:
        return {"is_valid": False, "reason": str(e) or "Signature verification failed."}
