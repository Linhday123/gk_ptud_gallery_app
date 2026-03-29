from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

try:
    from . import models
    from .database import get_db
except ImportError:  # pragma: no cover - supports running from backend/ directly
    import models
    from database import get_db

JWT_SECRET = "dev-secret-key-change-in-prod"
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def _normalize_password(password: str) -> str:
    # bcrypt only accepts up to 72 bytes, so we hash arbitrary-length input first.
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    return pwd_context.hash(_normalize_password(password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(_normalize_password(plain_password), hashed_password)


def create_access_token(*, user_id: int, username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRES_MINUTES)
    to_encode = {"sub": str(user_id), "username": username, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _unauthorized(detail: str = "Not authenticated") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise _unauthorized("Invalid token")
        user_id = int(sub)
    except (JWTError, ValueError):
        raise _unauthorized("Invalid token")

    user = db.get(models.User, user_id)
    if not user:
        raise _unauthorized("User not found")
    return user
