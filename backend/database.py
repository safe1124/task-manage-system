from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os


# DATABASE_URL environment variable is required.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///app.db")
# If DATABASE_URL is not set, use SQLite as fallback

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()