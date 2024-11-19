import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from uuid import UUID

from database import get_db
from models.user import User
from models.role import Role

# OAuth2スキームの設定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# パスワードハッシュ化のための設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

load_dotenv("/workspace/backend/.env")

# JWTトークン生成のための設定
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """平文パスワードとハッシュ化されたパスワードを比較検証する"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """パスワードをハッシュ化する"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> Tuple[str, datetime]:
    to_encode = data.copy()
    
    for key, value in to_encode.items():
        if isinstance(value, UUID):
            to_encode[key] = str(value)
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, expire


def decode_access_token(token: str) -> Optional[dict]:
    """JWTアクセストークンをデコードする"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None or user.token != token or user.token_expires < datetime.utcnow():
        raise credentials_exception
    return user

def get_admin_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.user_id == current_user.user_id).first()
    if not role or role.admin_role != 1:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user