from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime
from models.user import User
from models.chat_log import ChatLog
from schemas.chat import ChatMessage, ChatHistory, MessageRequest
from dependencies import get_db, get_current_user

router = APIRouter()

@router.post("/", response_model=ChatMessage)
def send_message(message_request: MessageRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_message = ChatLog(user_id=current_user.user_id, message=message_request.message)
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return ChatMessage(
        id=new_message.id,
        user_id=new_message.user_id,
        message=new_message.message,
        timestamp=new_message.timestamp
    )

@router.get("/history", response_model=List[ChatHistory])
def get_chat_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat_history = (
        db.query(ChatLog)
        .filter(ChatLog.user_id == current_user.user_id)
        .order_by(desc(ChatLog.timestamp))
        .limit(100)
        .all()
    )
    
    return [
        ChatHistory(
            id=msg.id,
            user_id=msg.user_id,
            user_name=current_user.user_name,
            message=msg.message,
            timestamp=msg.timestamp
        ) for msg in chat_history
    ]