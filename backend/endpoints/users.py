from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.database import get_db
from backend.models.user import User
from backend.utils.security import (
    get_password_hash,
    verify_password,
    create_session_id,
    get_current_user,
    SESSION_COOKIE_NAME,
)


class RegisterPayload(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    mail: EmailStr
    password: str = Field(min_length=6, max_length=128)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        return v.strip()

    # Pydantic v2 calls validators on the raw string input *before* type validation.
    # So we receive a string, clean it, and return a string for Pydantic to validate as EmailStr.
    @field_validator("mail", mode="before")
    @classmethod
    def validate_mail(cls, v: str) -> str:
        return v.strip().lower()


class LoginPayload(BaseModel):
    mail: EmailStr
    password: str

    @field_validator("mail", mode="before")
    @classmethod
    def validate_mail(cls, v: str) -> str:
        return v.strip().lower()


class ProfileOut(BaseModel):
    id: str
    name: str
    mail: EmailStr
    avatar_url: str | None = None

    class Config:
        from_attributes = True


router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=ProfileOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    # The validator has already normalized the mail
    exists = db.query(User).filter(User.mail == payload.mail).first()
    if exists:
        raise HTTPException(status_code=409, detail="既に登録済みのメールアドレスです")
    
    user = User(
        name=payload.name, 
        mail=payload.mail, 
        password=get_password_hash(payload.password)
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="既に登録済みのメールアドレスです")
    
    db.refresh(user)
    # Explicitly convert UUID to string in the response to prevent validation errors
    return user


@router.post("/login", response_model=ProfileOut)
def login(payload: LoginPayload, response: Response, db: Session = Depends(get_db)):
    # The validator has already normalized the mail
    user = db.query(User).filter(User.mail == payload.mail).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="메일または패스워드가 정확하지 않습니다")
    
    # Create session
    session_id = create_session_id()
    user.session_id = session_id
    db.commit()
    
    # Set session cookie (cross-site)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        max_age=24*60*60,  # 24 hours
        httponly=True,
        samesite="none",
        secure=True
    )
    
    return user


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if session_id:
        # Clear session from database
        user = db.query(User).filter(User.session_id == session_id).first()
        if user:
            user.session_id = None
            db.commit()
    
    # Clear session cookie
    response.delete_cookie(key=SESSION_COOKIE_NAME)
    return {"message": "로그아웃 성공"}


@router.get("/me", response_model=ProfileOut)
def get_me(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user(request, db)
    # Return the user object directly, Pydantic's from_attributes handles conversion
    return current_user


class ProfileUpdatePayload(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=50)
    avatar_url: str | None = None


@router.patch("/me", response_model=ProfileOut)
def update_me(
    payload: ProfileUpdatePayload,
    request: Request,
    db: Session = Depends(get_db),
):
    current_user = get_current_user(request, db)
    if payload.name is not None:
        current_user.name = payload.name
    if payload.avatar_url is not None:
        # Basic validation for avatar_url
        if payload.avatar_url.startswith("http://") or payload.avatar_url.startswith("https://"):
            current_user.avatar_url = payload.avatar_url
        else:
            current_user.avatar_url = None

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


class ChangePasswordPayload(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: ChangePasswordPayload,
    request: Request,
    db: Session = Depends(get_db),
):
    current_user = get_current_user(request, db)
    if not verify_password(payload.current_password, current_user.password):
        raise HTTPException(status_code=401, detail="現在のパスワードが正しくありません")
    
    current_user.password = get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()
    return None

