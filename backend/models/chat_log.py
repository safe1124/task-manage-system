from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class ChatLog(Base):
    __tablename__ = "chat_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_table.user_id"))
    message = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())