from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class ChatMessage(BaseModel):
    id: int
    user_id: UUID
    message: str
    timestamp: datetime

class ChatHistory(BaseModel):
    id: int
    user_id: UUID
    user_name: str
    message: str
    timestamp: datetime

    class Config:
        orm_mode = True

class MessageRequest(BaseModel):
    message: str