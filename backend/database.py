from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from contextlib import contextmanager

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class DatabaseManager:
    @staticmethod
    def create(db, model):
        db.add(model)
        db.commit()
        db.refresh(model)
        return model

    @staticmethod
    def read(db, model, id):
        return db.query(model).filter(model.id == id).first()

    @staticmethod
    def update(db, model, id, update_data):
        db_obj = db.query(model).filter(model.id == id).first()
        if db_obj:
            for key, value in update_data.items():
                setattr(db_obj, key, value)
            db.commit()
            db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete(db, model, id):
        db_obj = db.query(model).filter(model.id == id).first()
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj

def create_user(db, user_data):
    return DatabaseManager.create(db, user_data)

def get_user(db, user_id):
    return DatabaseManager.read(db, User, user_id)

def update_user(db, user_id, update_data):
    return DatabaseManager.update(db, User, user_id, update_data)

def delete_user(db, user_id):
    return DatabaseManager.delete(db, User, user_id)
