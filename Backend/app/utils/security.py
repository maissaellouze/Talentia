import hashlib
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _prepare_password(password: str) -> str:
    """
    bcrypt refuse les mots de passe > 72 bytes.
    On pré-hache avec SHA-256 pour accepter n'importe quelle longueur,
    tout en gardant une entropie maximale.
    """
    return hashlib.sha256(password.encode()).hexdigest()


def hash_password(password: str) -> str:
    return pwd_context.hash(_prepare_password(password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(_prepare_password(plain_password), hashed_password)