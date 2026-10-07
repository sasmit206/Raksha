from cryptography.fernet import Fernet
import os
import base64

# Generate a key if one doesn't exist in the environment
SECRET_KEY = os.getenv("APP_SECRET_KEY")
if not SECRET_KEY:
    # In production, this key MUST be persisted securely and loaded from env
    # Generating it dynamically here for demonstration purposes
    _key = Fernet.generate_key()
    os.environ["APP_SECRET_KEY"] = _key.decode('utf-8')
    SECRET_KEY = os.environ["APP_SECRET_KEY"]

cipher_suite = Fernet(SECRET_KEY.encode('utf-8'))

def encrypt_text(plain_text: str) -> str:
    encrypted_bytes = cipher_suite.encrypt(plain_text.encode('utf-8'))
    return base64.b64encode(encrypted_bytes).decode('utf-8')

def decrypt_text(cipher_text_b64: str) -> str:
    encrypted_bytes = base64.b64decode(cipher_text_b64.encode('utf-8'))
    return cipher_suite.decrypt(encrypted_bytes).decode('utf-8')

def encrypt_file_data(data: bytes) -> bytes:
    return cipher_suite.encrypt(data)

def decrypt_file_data(data: bytes) -> bytes:
    return cipher_suite.decrypt(data)
