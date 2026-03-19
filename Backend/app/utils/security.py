import hashlib
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _prepare_password(password: str) -> str:
    # Use the same SHA-256 pre-hash you used during registration
    return hashlib.sha256(password.encode()).hexdigest()

def hash_password(password: str) -> str:
    return pwd_context.hash(_prepare_password(password))
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # This version handles the SHA-256 pre-hash
    prepared = _prepare_password(plain_password)
    return pwd_context.verify(prepared, hashed_password)