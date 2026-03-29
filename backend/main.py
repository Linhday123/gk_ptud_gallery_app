from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

try:
    from . import models
    from .database import engine
    from .routers import auth as auth_router
    from .routers import photos as photos_router
except ImportError:  # pragma: no cover - supports running from backend/ directly
    import models
    from database import engine
    from routers import auth as auth_router
    from routers import photos as photos_router

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = str(BASE_DIR / "uploads")

app = FastAPI(title="Photo Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    models.Base.metadata.create_all(bind=engine)


# `StaticFiles` checks directory existence at import time by default.
# We create the folder on startup, so disable the check here.
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR, check_dir=False), name="uploads")

app.include_router(auth_router.router)
app.include_router(photos_router.router)


@app.get("/", tags=["meta"])
def root():
    return {"data": {"status": "ok"}, "message": "ok"}
