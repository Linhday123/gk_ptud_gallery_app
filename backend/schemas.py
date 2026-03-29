from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ApiResponse(BaseModel):
    data: object | None = None
    message: str


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=5, max_length=1000)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=1000)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PhotoBase(BaseModel):
    title: str
    description: str | None = None


class PhotoCreateResponse(PhotoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    uploaded_at: datetime
    user_id: int


class PhotoDetailResponse(PhotoCreateResponse):
    pass


class PhotoUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None


class PhotoListResponse(BaseModel):
    items: list[PhotoCreateResponse]
    total: int
    page: int
    pages: int
