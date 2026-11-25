from datetime import datetime, timezone
from functools import lru_cache
import hashlib
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError


password_hasher = PasswordHasher()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


@lru_cache
def dummy_password_hash() -> str:
    return hash_password(secrets.token_urlsafe(32))


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        return password_hasher.verify(stored_hash, password)
    except (VerificationError, InvalidHashError):
        return False
