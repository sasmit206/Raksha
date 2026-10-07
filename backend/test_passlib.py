from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
hash = pwd_context.hash("my_password")
print("Hash:", hash)
print("Verify:", pwd_context.verify("my_password", hash))
