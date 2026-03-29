from __future__ import annotations

import math
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

try:
    from .. import models, schemas
    from ..auth import get_current_user
    from ..database import get_db
except ImportError:  # pragma: no cover - supports running from backend/ directly
    import models
    import schemas
    from auth import get_current_user
    from database import get_db

router = APIRouter(prefix="/photos", tags=["photos"])

UPLOADS_DIR = str(Path(__file__).resolve().parent.parent / "uploads")
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def _ensure_owner(photo: models.Photo, user: models.User) -> None:
    if photo.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


def _safe_filename(original: str) -> str:
    # Prevent path traversal (e.g. "..\\..\\x")
    base = os.path.basename(original)
    return base.replace("\x00", "")


@router.post("", response_model=schemas.ApiResponse)
async def create_photo(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str | None = Form(None),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only jpg/png files are allowed")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only .jpg/.jpeg/.png files are allowed")

    os.makedirs(UPLOADS_DIR, exist_ok=True)

    original = _safe_filename(file.filename or "upload")
    filename = f"{uuid.uuid4().hex}_{original}"
    path = os.path.join(UPLOADS_DIR, filename)

    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)

    photo = models.Photo(
        title=title.strip(),
        description=description.strip() if isinstance(description, str) and description.strip() else None,
        image_url=f"/uploads/{filename}",
        user_id=user.id,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return {"data": schemas.PhotoCreateResponse.model_validate(photo), "message": "ok"}


@router.get("", response_model=schemas.ApiResponse)
def list_photos(
    page: int = 1,
    limit: int = 12,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if page < 1 or limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Invalid pagination params")

    total = db.execute(
        select(func.count()).select_from(models.Photo).where(models.Photo.user_id == user.id)
    ).scalar_one()
    pages = max(1, math.ceil(total / limit)) if total else 1
    offset = (page - 1) * limit

    items = db.execute(
        select(models.Photo)
        .where(models.Photo.user_id == user.id)
        .order_by(desc(models.Photo.uploaded_at), desc(models.Photo.id))
        .offset(offset)
        .limit(limit)
    ).scalars().all()

    data = schemas.PhotoListResponse(
        items=[schemas.PhotoCreateResponse.model_validate(p) for p in items],
        total=total,
        page=page,
        pages=pages,
    )
    return {"data": data, "message": "ok"}


@router.get("/search", response_model=schemas.ApiResponse)
def search_photos(
    q: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    keyword = q.strip()
    if not keyword:
        return {"data": [], "message": "ok"}

    items = db.execute(
        select(models.Photo)
        .where(models.Photo.user_id == user.id)
        .where(models.Photo.title.ilike(f"%{keyword}%"))
        .order_by(desc(models.Photo.uploaded_at), desc(models.Photo.id))
        .limit(100)
    ).scalars().all()

    return {"data": [schemas.PhotoCreateResponse.model_validate(p) for p in items], "message": "ok"}


@router.get("/{photo_id}", response_model=schemas.ApiResponse)
def get_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    photo = db.get(models.Photo, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    _ensure_owner(photo, user)

    return {"data": schemas.PhotoDetailResponse.model_validate(photo), "message": "ok"}


@router.put("/{photo_id}", response_model=schemas.ApiResponse)
def update_photo(
    photo_id: int,
    payload: schemas.PhotoUpdateRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    photo = db.get(models.Photo, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    _ensure_owner(photo, user)

    if "title" in payload.model_fields_set:
        if payload.title is None or not payload.title.strip():
            raise HTTPException(status_code=400, detail="Title is required")
        photo.title = payload.title.strip()
    if "description" in payload.model_fields_set:
        # Allow explicit null to clear the description.
        photo.description = payload.description.strip() if isinstance(payload.description, str) and payload.description.strip() else None

    db.add(photo)
    db.commit()
    db.refresh(photo)

    return {"data": schemas.PhotoDetailResponse.model_validate(photo), "message": "ok"}


@router.delete("/{photo_id}", response_model=schemas.ApiResponse)
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    photo = db.get(models.Photo, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    _ensure_owner(photo, user)

    # Remove file on disk; still delete DB row if missing.
    filename = photo.image_url.replace("/uploads/", "").lstrip("/")
    path = os.path.join(UPLOADS_DIR, filename)
    try:
        os.remove(path)
    except FileNotFoundError:
        pass

    db.delete(photo)
    db.commit()

    return {"data": None, "message": "deleted"}
