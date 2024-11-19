from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID

class UserBase(BaseModel):
    user_name: str
    user_mail: EmailStr

class UserCreate(UserBase):
    user_password: str

class UserInDB(UserBase):
    user_id: UUID
    token: str | None = None
    token_expires: datetime | None = None

class User(UserInDB):
    class Config:
        orm_mode = True
        json_encoders = {
            UUID: lambda v: str(v)
        }

class UserLogin(BaseModel):
    user_mail: EmailStr
    user_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

