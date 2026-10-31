from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import Response, JSONResponse
from app.services.crypto_service import (
    encrypt_text, decrypt_text, encrypt_file_data, decrypt_file_data,
    hash_text, sign_text, verify_signature, avalanche_effect, get_demo_keys,
    run_crypto_benchmark, calculate_text_security_metrics, get_hash_criteria_analysis
)
import base64

router = APIRouter()

@router.get("/benchmark")
@router.post("/benchmark")
async def api_crypto_benchmark(sample_size_bytes: int = 1024, iterations: int = 20):
    """
    Executes live empirical time-based performance and security analysis across
    all algorithms used in Raksha (AES-256, AES-128, Fernet, SHA-256, HMAC, RSA-PSS, PBKDF2),
    including VM-Host secure channel and intermediate hash traces.
    """
    try:
        results = run_crypto_benchmark(sample_size_bytes=sample_size_bytes, iterations=iterations)
        return JSONResponse(content=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/keys")
async def api_get_keys():
    """Returns demonstration keys for educational purposes."""
    return JSONResponse(content=get_demo_keys())


@router.post("/encrypt/text")
async def api_encrypt_text(text: str = Form(...)):
    """Encrypts a plain text string."""
    try:
        result = encrypt_text(text)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/decrypt/text")
async def api_decrypt_text(encrypted_text: str = Form(...)):
    """Decrypts an encrypted text string."""
    try:
        result = decrypt_text(encrypted_text)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/hash/text")
async def api_hash_text(text: str = Form(...)):
    try:
        result = hash_text(text)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sign/text")
async def api_sign_text(text: str = Form(...)):
    try:
        result = sign_text(text)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify/text")
async def api_verify_text(text: str = Form(...), signature: str = Form(...)):
    try:
        result = verify_signature(text, signature)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/avalanche")
async def api_avalanche(text: str = Form(...)):
    try:
        result = avalanche_effect(text)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/metrics/text")
@router.post("/metrics/text")
async def api_text_security_metrics(text: str = Form("Raksha Cyber Defense Platform 2026")):
    """
    Evaluates Text Security Metrics for ISL Solo Requirements:
    - Confusion (Shannon Entropy)
    - Diffusion (SAC Permutation Dispersion)
    - Avalanche Effect (50% bit-level, 100% char-level)
    - Performance (Enc/Dec time)
    """
    try:
        result = calculate_text_security_metrics(text)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/hash/criteria")
@router.post("/hash/criteria")
async def api_hash_criteria(text: str = Form("Raksha Secure Telemetry Stream")):
    """
    Evaluates Hash Requirements for ISL Solo Requirements:
    - Digest display & Generation Time
    - 3 Criteria: Pre-image, 2nd pre-image, collision resistance
    """
    try:
        result = get_hash_criteria_analysis(text)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/encrypt/file")
async def api_encrypt_file(file: UploadFile = File(...)):
    """Encrypts an uploaded file (e.g., image, audio)."""
    try:
        contents = await file.read()
        encrypted_data = encrypt_file_data(contents)
        # Return the encrypted file as a downloadable attachment
        return Response(
            content=encrypted_data,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename=encrypted_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/decrypt/file")
async def api_decrypt_file(file: UploadFile = File(...)):
    """Decrypts an encrypted file back to its original format."""
    try:
        contents = await file.read()
        decrypted_data = decrypt_file_data(contents)
        
        # Remove 'encrypted_' prefix if it exists to restore original filename
        orig_filename = file.filename
        if orig_filename and orig_filename.startswith("encrypted_"):
            orig_filename = orig_filename.replace("encrypted_", "", 1)
        
        # We try to infer a basic media type, but application/octet-stream is safe
        return Response(
            content=decrypted_data,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={orig_filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/honeytoken/deploy")
async def api_deploy_honeytoken(file: UploadFile = File(...)):
    """Encrypts a file and injects it into the VM as a honeytoken trap."""
    try:
        contents = await file.read()
        encrypted_data = encrypt_file_data(contents)
        
        # We import sim_service here to avoid circular imports if any
        from app.main import sim_service, state
        
        target_filename = f"decoy_{file.filename}.enc"
        success = sim_service.inject_honeytoken(
            vm_id="RAKSHA-01", 
            filename=target_filename, 
            data=encrypted_data
        )
        
        print(f"DEBUG: Honeytoken deploy hit. Success: {success}, Docker: {sim_service.client is not None}")
        
        # In mock mode, we inject the telemetry event directly
        if not sim_service.client or "RAKSHA-01" not in sim_service.active_containers:
            print("DEBUG: Injecting mock telemetry event.")
            import uuid
            from datetime import datetime
            evt = {
                "id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "vm_id": "RAKSHA-01",
                "source": "FILE",
                "event_type": "honeytoken_deployment",
                "severity": "info",
                "anomaly_score": 0.0,
                "user": "system",
                "process": "deploy_api"
            }
            state["telemetry"].append(evt)
            
            # Automatically simulate mock attack
            import threading
            import time
            def delayed_mock_attack():
                time.sleep(3)
                attack_evt = {
                    "id": str(uuid.uuid4()),
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "vm_id": "RAKSHA-01",
                    "source": "FILE",
                    "event_type": "honeytoken_access",
                    "severity": "critical",
                    "anomaly_score": 0.95,
                    "user": "attacker",
                    "process": "exfiltration"
                }
                state["telemetry"].append(attack_evt)
            threading.Thread(target=delayed_mock_attack).start()
        else:
            print("DEBUG: Docker is active, relying on syslog for telemetry.")
            # Automatically simulate an attacker tripping the honeytoken after a short delay
            import threading
            import time
            def delayed_attack():
                time.sleep(3)
                sim_service.execute_honeytoken_attack("RAKSHA-01", target_filename)
            
            threading.Thread(target=delayed_attack).start()
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to deploy honeytoken to VM")
            
        return JSONResponse(content={
            "status": "success", 
            "message": f"Honeytoken '{target_filename}' deployed to VM successfully. An attacker simulation will trip it shortly.",
            "trap_active": True
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
