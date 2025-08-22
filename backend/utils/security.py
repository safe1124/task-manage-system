from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session

from database import get_db
from models.user import User


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Simple session-based auth using cookies
SESSION_COOKIE_NAME = "session_id"


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_session_id() -> str:
    return str(uuid.uuid4())


def get_current_user_from_session(
    request: Request, db: Session = Depends(get_db)
) -> Optional[User]:
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if not session_id:
        return None
    
    user = db.query(User).filter(User.session_id == session_id).first()
    return user


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user = get_current_user_from_session(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="로그인이 필요합니다",
        )
    return user


def get_current_user_optional(
    request: Request, db: Session = Depends(get_db)
) -> tuple[User, str | None]:
    user = get_current_user_from_session(request, db)
    new_session_id = None
    
    if not user:
        # Create anonymous user for this session
        session_id = create_session_id()
        user = User(
            name=f"익명사용자_{session_id[:8]}",
            mail=f"anon_{session_id[:8]}@local",
            password=get_password_hash("anonymous"),
            session_id=session_id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        new_session_id = session_id
    
    return user, new_session_id


