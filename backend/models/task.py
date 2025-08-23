# backend/models/task.py
from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey
from datetime import datetime
from .base import Base
import enum

# 문자열 기반의 상태 Enum (FastAPI/Pydantic과 호환이 쉬움)
class TaskStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    # SQLite 호환을 위해 문자열로 저장
    status = Column(String(20), nullable=False, default=TaskStatus.todo)
    priority = Column(Integer, nullable=False, default=3)
    due_date = Column(DateTime, nullable=True)
    
    # ForeignKey to link to the user who owns the task
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    # 서버(데이터베이스)에서 자동으로 현재시각을 채움
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    # 업데이트될 때마다 자동으로 현재시각으로 갱신
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
