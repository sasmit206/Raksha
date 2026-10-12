import os
import base64
import time
import hashlib
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization

SECRET_KEY = os.getenv("APP_SECRET_KEY")
if not SECRET_KEY:
    _key = Fernet.generate_key()
    os.environ["APP_SECRET_KEY"] = _key.decode('utf-8')
    SECRET_KEY = os.environ["APP_SECRET_KEY"]

cipher_suite = Fernet(SECRET_KEY.encode('utf-8'))

# Generate an RSA keypair for demonstration
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

def get_demo_keys():
    pub_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    return {
        "symmetric_key": SECRET_KEY,
        "public_key": pub_pem
    }

def encrypt_text(plain_text: str):
    start = time.perf_counter()
    original_bytes = plain_text.encode('utf-8')
    encrypted_bytes = cipher_suite.encrypt(original_bytes)
    end = time.perf_counter()
    
    return {
        "original_text": plain_text,
        "original_hex": original_bytes.hex(),
        "encrypted_base64": base64.b64encode(encrypted_bytes).decode('utf-8'),
        "key_used": SECRET_KEY[:8] + "..." + SECRET_KEY[-8:],
        "execution_time_ms": (end - start) * 1000
    }

def decrypt_text(cipher_text_b64: str):
    start = time.perf_counter()
    encrypted_bytes = base64.b64decode(cipher_text_b64.encode('utf-8'))
    decrypted_bytes = cipher_suite.decrypt(encrypted_bytes)
    end = time.perf_counter()
    return {
        "decrypted_text": decrypted_bytes.decode('utf-8'),
        "decrypted_hex": decrypted_bytes.hex(),
        "key_used": SECRET_KEY[:8] + "..." + SECRET_KEY[-8:],
        "execution_time_ms": (end - start) * 1000
    }

def encrypt_file_data(data: bytes) -> bytes:
    return cipher_suite.encrypt(data)

def decrypt_file_data(data: bytes) -> bytes:
    return cipher_suite.decrypt(data)

def hash_text(plain_text: str):
    start = time.perf_counter()
    digest = hashlib.sha256(plain_text.encode('utf-8')).hexdigest()
    end = time.perf_counter()
    return {
        "algorithm": "SHA-256",
        "digest": digest,
        "digest_bits": 256,
        "execution_time_ms": (end - start) * 1000
    }

def sign_text(plain_text: str):
    start = time.perf_counter()
    signature = private_key.sign(
        plain_text.encode('utf-8'),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    end = time.perf_counter()
    
    return {
        "original_text": plain_text,
        "hash_algorithm": "SHA-256",
        "signature_algorithm": "RSA-PSS",
        "signature_hex": signature.hex(),
        "execution_time_ms": (end - start) * 1000
    }

def verify_signature(plain_text: str, signature_hex: str):
    start = time.perf_counter()
    try:
        signature = bytes.fromhex(signature_hex)
        public_key.verify(
            signature,
            plain_text.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        is_valid = True
        reason = "Verification successful"
    except Exception as e:
        is_valid = False
        reason = str(e) or "Signature mismatch or tampered text"
    end = time.perf_counter()
    
    return {
        "is_valid": is_valid,
        "reason": reason,
        "execution_time_ms": (end - start) * 1000
    }

def count_set_bits(b: bytes):
    return sum(bin(byte).count('1') for byte in b)

def byte_xor(b1: bytes, b2: bytes):
    return bytes(a ^ b for a, b in zip(b1, b2))

def avalanche_effect(plain_text: str):
    # Base text
    b_orig = bytearray(plain_text.encode('utf-8'))
    if len(b_orig) == 0:
        b_orig = bytearray(b" ")
    
    # Flip 1st bit of 1st byte
    b_mod = bytearray(b_orig)
    b_mod[0] ^= 1 
    
    h_orig = hashlib.sha256(b_orig).digest()
    h_mod = hashlib.sha256(b_mod).digest()
    
    diff_bits = count_set_bits(byte_xor(h_orig, h_mod))
    total_bits = 256
    
    return {
        "original_text": b_orig.decode('utf-8', errors='ignore'),
        "modified_text": b_mod.decode('utf-8', errors='ignore'),
        "original_hex": b_orig.hex(),
        "modified_hex": b_mod.hex(),
        "original_hash": h_orig.hex(),
        "modified_hash": h_mod.hex(),
        "differing_bits": diff_bits,
        "total_bits": total_bits,
        "percentage_changed": (diff_bits / total_bits) * 100
    }
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

def avalanche_effect_aes(plain_text: str):
    key = b'0123456789abcdef'
    iv = b'fedcba9876543210'
    backend = default_backend()

    b_orig = bytearray(plain_text.encode('utf-8'))
    if len(b_orig) == 0:
        b_orig = bytearray(b"RakshaDemo")
    pad_len = 16 - (len(b_orig) % 16)
    b_orig.extend([pad_len] * pad_len)

    cipher_orig = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
    encryptor_orig = cipher_orig.encryptor()
    c_orig = encryptor_orig.update(bytes(b_orig)) + encryptor_orig.finalize()

    results = []
    bits_to_flip = min(len(b_orig) * 8, 10)
    for bit_idx in range(bits_to_flip):
        b_mod = bytearray(b_orig)
        byte_idx = bit_idx // 8
        bit_offset = bit_idx % 8
        b_mod[byte_idx] ^= (1 << bit_offset)

        cipher_mod = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
        encryptor_mod = cipher_mod.encryptor()
        c_mod = encryptor_mod.update(bytes(b_mod)) + encryptor_mod.finalize()

        diff_bits = count_set_bits(byte_xor(c_orig, c_mod))
        total_bits = len(c_orig) * 8

        results.append({
            "bit_flipped": bit_idx,
            "original_hex": b_orig.hex(),
            "modified_hex": b_mod.hex(),
            "original_ciphertext": c_orig.hex(),
            "modified_ciphertext": c_mod.hex(),
            "differing_bits": diff_bits,
            "total_bits": total_bits,
            "percentage_changed": (diff_bits / total_bits) * 100
        })

    return {
        "algorithm": "AES-128-CBC",
        "fixed_key_preview": "0123456789abcdef",
        "fixed_iv_preview": "fedcba9876543210",
        "experiments": results
    }
