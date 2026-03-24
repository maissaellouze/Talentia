import hashlib
import bcrypt

def _prepare_password(password: str) -> bytes:
    # bcrypt in Python typically expects bytes and has a 72-character limit.
    # We'll use SHA-256 to hash the password first to avoid this limit and then encode.
    return hashlib.sha256(password.encode()).hexdigest().encode()

def hash_password(password: str) -> str:
    prepared = _prepare_password(password)
    # gensalt() generates a salt with the default number of rounds (12)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(prepared, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Check if the hashed_password is truly a bcrypt hash
    if not hashed_password or not hashed_password.startswith("$2"):
        return False
    try:
        prepared = _prepare_password(plain_password)
        return bcrypt.checkpw(prepared, hashed_password.encode('utf-8'))
    except Exception:
        return False