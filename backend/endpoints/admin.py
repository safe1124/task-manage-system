from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.role import Role
from schemas.user import User as UserSchema
from schemas.role import Role as RoleSchema
from utils.security import get_admin_user

router = APIRouter()

@router.get("/users", response_model=list[UserSchema])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    users = db.query(User).all()
    return users

@router.get("/roles", response_model=list[RoleSchema])
def list_roles(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    roles = db.query(Role).all()
    return roles
