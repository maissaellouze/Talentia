import hashlib
import bcrypt

def get_correct_hash(password: str):
    # C'est exactement votre logique dans le code fourni
    prepared = hashlib.sha256(password.encode()).hexdigest().encode()
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(prepared, salt).decode('utf-8')

print(get_correct_hash("test1234"))