from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

try:
    from .. import models, schemas
    from ..auth import create_access_token, hash_password, verify_password
    from ..database import get_db
except ImportError:  # pragma: no cover - supports running from backend/ directly
    import models
    import schemas
    from auth import create_access_token, hash_password, verify_password
    from database import get_db

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=schemas.ApiResponse)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing_username = db.execute(
        select(models.User).where(models.User.username == payload.username)
    ).scalar_one_or_none()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")

    existing_email = db.execute(select(models.User).where(models.User.email == payload.email)).scalar_one_or_none()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = models.User(
        username=payload.username,
        email=str(payload.email),
        password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()

    return {"data": None, "message": "registered"}


@router.post("/login", response_model=schemas.ApiResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(select(models.User).where(models.User.email == payload.email)).scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user_id=user.id, username=user.username)
    return {"data": {"access_token": token, "token_type": "bearer"}, "message": "ok"}
