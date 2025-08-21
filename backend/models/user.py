from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from backend.database import Base

class User(Base):
    __tablename__ = "user_table"

    # Use UUID for postgres, but string for sqlite.
    # The default lambda ensures a string-based UUID is generated.
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    mail = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    
    # Session-based authentication
    session_id = Column(String, nullable=True, unique=True, index=True)
