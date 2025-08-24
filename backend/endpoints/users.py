from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import uuid
import time

from database import get_db
from models.user import User
from utils.security import (
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


@router.post("/login")
def login(payload: LoginPayload, response: Response, db: Session = Depends(get_db)):
    print(f"🔍 Login attempt - Email: {payload.mail}")
    
    # The validator has already normalized the mail
    user = db.query(User).filter(User.mail == payload.mail).first()
    print(f"🔍 User found: {user is not None}")
    
    if not user:
        print("❌ User not found")
        raise HTTPException(status_code=401, detail="メールまたはパスワードが正しくありません")
    
    password_valid = verify_password(payload.password, user.password)
    print(f"🔍 Password valid: {password_valid}")
    
    if not password_valid:
        print("❌ Invalid password")
        raise HTTPException(status_code=401, detail="メールまたはパスワードが正しくありません")
    
    # Create session
    session_id = create_session_id()
    user.session_id = session_id
    db.commit()
    
    # Set session cookie (for cross-origin requests)
    import os
    is_production = os.getenv("ENVIRONMENT") == "production"
    print(f"🔍 Environment: {os.getenv('ENVIRONMENT')}, is_production: {is_production}")
    
    cookie_settings = {
        "key": SESSION_COOKIE_NAME,
        "value": session_id,
        "max_age": 24*60*60,  # 24 hours
        "httponly": False,  # Allow JS access for manual setting
        "samesite": "none" if is_production else "lax",  # None for CORS, lax for local
        "secure": is_production,  # Secure for HTTPS in production
        "path": "/",
        "domain": None  # Don't set domain for cross-origin
    }
    print(f"🔍 Cookie settings: {cookie_settings}")
    
    response.set_cookie(**cookie_settings)
    
    return {"message": "로그인 성공", "session_id": session_id}


@router.post("/guest")
def guest_login(response: Response, db: Session = Depends(get_db)):
    """게스트 계정을 생성하고 로그인"""
    print("🔍 Guest login attempt")
    
    # 숫자 4자리 ID 생성 (1000-9999)
    import random
    guest_id = str(random.randint(1000, 9999))
    guest_email = f"{guest_id}@tcu.ac.jp"
    guest_name = f"체험사용자_{guest_id}"
    
    # 숫자 6자리 비밀번호 생성 (100000-999999)
    guest_password = str(random.randint(100000, 999999))
    
    print(f"🔍 Creating guest user: {guest_email}")
    
    # 게스트 사용자 생성
    user = User(
        name=guest_name,
        mail=guest_email,
        password=get_password_hash(guest_password)
    )
    db.add(user)
    
    try:
        db.commit()
        db.refresh(user)
        print(f"🔍 Guest user created successfully: {user.id}")
    except IntegrityError:
        db.rollback()
        print("❌ Failed to create guest user")
        raise HTTPException(status_code=500, detail="체험 계정 생성에 실패했습니다")
    
    # 세션 생성
    session_id = create_session_id()
    user.session_id = session_id
    db.commit()
    
    # 쿠키 설정
    import os
    is_production = os.getenv("ENVIRONMENT") == "production"
    print(f"🔍 Environment: {os.getenv('ENVIRONMENT')}, is_production: {is_production}")
    
    cookie_settings = {
        "key": SESSION_COOKIE_NAME,
        "value": session_id,
        "max_age": 24*60*60,  # 24 hours
        "httponly": False,  # Allow JS access for manual setting
        "samesite": "none" if is_production else "lax",  # None for CORS, lax for local
        "secure": is_production,  # Secure for HTTPS in production
        "path": "/",
        "domain": None  # Don't set domain for cross-origin
    }
    print(f"🔍 Cookie settings: {cookie_settings}")
    
    response.set_cookie(**cookie_settings)
    
    print(f"✅ Guest login successful: {session_id}")
    return {
        "message": "체험 계정이 생성되었습니다", 
        "session_id": session_id,
        "account_info": {
            "id": guest_email,
            "password": guest_password
        }
    }


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    # 세션 ID를 헤더 또는 쿠키에서 가져오기
    session_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        session_id = auth_header.replace("Bearer ", "")
    else:
        session_id = request.cookies.get(SESSION_COOKIE_NAME)
    
    if session_id:
        # Clear session from database
        user = db.query(User).filter(User.session_id == session_id).first()
        if user:
            user.session_id = None
            db.commit()
    
    # Clear session cookie
    import os
    is_production = os.getenv("ENVIRONMENT") == "production"
    
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        samesite="none" if is_production else "lax",
        secure=is_production
    )
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

