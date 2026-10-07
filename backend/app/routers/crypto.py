from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import Response, JSONResponse
from app.services.crypto_service import encrypt_text, decrypt_text, encrypt_file_data, decrypt_file_data
import base64

router = APIRouter()

@router.post("/encrypt/text")
async def api_encrypt_text(text: str = Form(...)):
    """Encrypts a plain text string."""
    try:
        encrypted = encrypt_text(text)
        return JSONResponse(content={"encrypted_text": encrypted})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/decrypt/text")
async def api_decrypt_text(encrypted_text: str = Form(...)):
    """Decrypts an encrypted text string."""
    try:
        decrypted = decrypt_text(encrypted_text)
        return JSONResponse(content={"decrypted_text": decrypted})
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
        from app.main import sim_service
        
        target_filename = f"decoy_{file.filename}.enc"
        success = sim_service.inject_honeytoken(
            vm_id="RAKSHA-01", 
            filename=target_filename, 
            data=encrypted_data
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to deploy honeytoken to VM")
            
        return JSONResponse(content={
            "status": "success", 
            "message": f"Honeytoken '{target_filename}' deployed to VM successfully.",
            "trap_active": True
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
