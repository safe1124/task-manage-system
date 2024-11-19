from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db
from utils.security import create_access_token, verify_password
from schemas.user import UserLogin
from models.user import User
from models.role import Role
from schemas.user import UserCreate, User as UserSchema
from schemas.user import Token
from utils.security import get_password_hash
from utils.security import verify_password

router = APIRouter()

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.user_mail == email).first()
    if not user:
        return False
    if not verify_password(password, user.user_password):
        return False
    return user

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.user_mail, user_credentials.user_password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token, token_expires = create_access_token(data={"sub": str(user.user_id)})
    
    # トークンと有効期限をデータベースに保存
    user.token = access_token
    user.token_expires = token_expires
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UserSchema)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # メールアドレスの重複チェック
    existing_user = db.query(User).filter(User.user_mail == user.user_mail).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # ユーザーの作成
    hashed_password = get_password_hash(user.user_password)
    db_user = User(
        user_name=user.user_name,
        user_mail=user.user_mail,
        user_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # ロールの設定（デフォルトは通常ユーザー）
    user_role = Role(user_id=db_user.user_id, user_role=1, admin_role=0)
    db.add(user_role)
    db.commit()
    
    access_token, token_expires = create_access_token(data={"sub": str(db_user.user_id)})
    
    # トークンと有効期限をデータベースに保存
    db_user.token = access_token
    db_user.token_expires = token_expires
    db.commit()
    db.refresh(db_user)
    
    return db_user