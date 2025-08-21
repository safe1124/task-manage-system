from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SQLAlchemy Base 클래스 생성
Base = declarative_base()

# Default to local SQLite for dev. Override with env var DATABASE_URL when needed.
DEFAULT_SQLITE_PATH = os.path.join(os.path.dirname(__file__), "app.db")
DEFAULT_SQLALCHEMY_URL = f"sqlite:///{DEFAULT_SQLITE_PATH}"
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLALCHEMY_URL)

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()