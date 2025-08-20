from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)


class RegisterPayload(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    mail: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginPayload(BaseModel):
    mail: EmailStr
    password: str


class ProfileOut(BaseModel):
    id: str
    name: str
    mail: EmailStr

    class Config:
        from_attributes = True


router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=ProfileOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.mail == payload.mail).first()
    if exists:
        raise HTTPException(status_code=400, detail="既に登録済みのメールアドレスです")
    user = User(name=payload.name, mail=payload.mail, password=get_password_hash(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.mail == payload.mail).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="メールまたはパスワードが正しくありません")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}


