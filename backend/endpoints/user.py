from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.user import UserCreate, User as UserSchema
from utils.security import get_password_hash

router = APIRouter()

@router.post("/user", response_model=UserSchema)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(
        user_name=user.user_name,
        user_mail=user.user_mail,
        user_password=get_password_hash(user.user_password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/user/{user_id}", response_model=UserSchema)
def read_user(user_id: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
