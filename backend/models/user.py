from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class User(Base):
    __tablename__ = "user_table"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_name = Column(String, nullable=False)
    user_mail = Column(String, unique=True, nullable=False)
    user_password = Column(String, nullable=False)
    token = Column(String)
    token_expires = Column(DateTime)
