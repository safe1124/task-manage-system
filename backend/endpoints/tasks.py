from fastapi import APIRouter, Depends, HTTPException, Query, status, Request, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend.models.task import Task
from backend.schemas.task import TaskCreate, TaskUpdate, TaskOut
from backend.utils.security import get_current_user_optional, SESSION_COOKIE_NAME
from backend.models.user import User
from datetime import datetime


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/ping")
def ping():
    return {"ok": True}


@router.get("/", response_model=List[TaskOut])
def list_tasks(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    status_in: Optional[str] = Query(None, description="comma-separated statuses: todo,in_progress,done"),
    q: Optional[str] = Query(None, description="search in title/description"),
    sort: Optional[str] = Query(
        None, description="created_desc|created_asc|due_desc|due_asc|priority_desc|priority_asc"
    ),
):
    current_user, new_session_id = get_current_user_optional(request, db)
    
    # Set session cookie if this is a new anonymous user
    if new_session_id:
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=new_session_id,
            max_age=24*60*60,
            httponly=True,
            samesite="none",
            secure=True
        )
    query = db.query(Task).filter(Task.user_id == str(current_user.id))
    if status_in:
        statuses = [s.strip() for s in status_in.split(",") if s.strip()]
        if statuses:
            query = query.filter(Task.status.in_(statuses))
    if q:
        like = f"%{q}%"
        query = query.filter((Task.title.ilike(like)) | (Task.description.ilike(like)))

    if sort == "created_asc":
        query = query.order_by(Task.created_at.asc())
    elif sort == "due_desc":
        query = query.order_by(Task.due_date.desc().nullslast())
    elif sort == "due_asc":
        query = query.order_by(Task.due_date.asc().nullsfirst())
    elif sort == "priority_desc":
        query = query.order_by(Task.priority.desc())
    elif sort == "priority_asc":
        query = query.order_by(Task.priority.asc())
    else:
        query = query.order_by(Task.created_at.desc())

    return query.offset(skip).limit(limit).all()


@router.post("/", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, request: Request, response: Response, db: Session = Depends(get_db)):
    current_user, new_session_id = get_current_user_optional(request, db)
    
    # Set session cookie if this is a new anonymous user
    if new_session_id:
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=new_session_id,
            max_age=24*60*60,
            httponly=True,
            samesite="none",
            secure=True
        )
    due = payload.due_date
    if isinstance(due, datetime):
        if due.tzinfo is not None:
            due = due.astimezone(tz=None).replace(tzinfo=None)
    task = Task(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        due_date=due,
        user_id=str(current_user.id),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, request: Request, response: Response, db: Session = Depends(get_db)):
    current_user, new_session_id = get_current_user_optional(request, db)
    
    # Set session cookie if this is a new anonymous user
    if new_session_id:
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=new_session_id,
            max_age=24*60*60,
            httponly=True,
            samesite="none",
            secure=True
        )
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == str(current_user.id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, request: Request, response: Response, db: Session = Depends(get_db)):
    current_user, new_session_id = get_current_user_optional(request, db)
    
    # Set session cookie if this is a new anonymous user
    if new_session_id:
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=new_session_id,
            max_age=24*60*60,
            httponly=True,
            samesite="none",
            secure=True
        )
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == str(current_user.id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    updates = payload.model_dump(exclude_unset=True)
    for field_name, value in updates.items():
        if field_name == 'due_date' and value is not None and getattr(value, 'tzinfo', None) is not None:
            value = value.astimezone(tz=None).replace(tzinfo=None)
        setattr(task, field_name, value)

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, request: Request, response: Response, db: Session = Depends(get_db)):
    current_user, new_session_id = get_current_user_optional(request, db)
    
    # Set session cookie if this is a new anonymous user
    if new_session_id:
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=new_session_id,
            max_age=24*60*60,
            httponly=True,
            samesite="lax"
        )
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == str(current_user.id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return None
