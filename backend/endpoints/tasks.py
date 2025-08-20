from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.database import get_db
from backend.models import Task, TaskStatus
from backend.schemas.task import TaskCreate, TaskUpdate, TaskOut


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskOut, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(
        title=payload.title,
        description=payload.description,
        status=TaskStatus(payload.status),
        priority=payload.priority,
        due_date=payload.due_date,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("", response_model=List[TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="title/description 검색"),
    status: Optional[str] = Query(None, pattern="^(todo|in_progress|done)$"),
    min_priority: Optional[int] = Query(None, ge=1, le=5),
    max_priority: Optional[int] = Query(None, ge=1, le=5),
    due_from: Optional[datetime] = None,
    due_to: Optional[datetime] = None,
    sort_by: Optional[str] = Query(None, description="id|priority|due_date|created_at|updated_at"),
    order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = db.query(Task)

    if q:
        like = f"%{q}%"
        query = query.filter((Task.title.ilike(like)) | (Task.description.ilike(like)))
    if status:
        query = query.filter(Task.status == TaskStatus(status))
    if min_priority is not None:
        query = query.filter(Task.priority >= min_priority)
    if max_priority is not None:
        query = query.filter(Task.priority <= max_priority)
    if due_from:
        query = query.filter(Task.due_date >= due_from)
    if due_to:
        query = query.filter(Task.due_date <= due_to)

    sort_map = {
        "id": Task.id,
        "priority": Task.priority,
        "due_date": Task.due_date,
        "created_at": Task.created_at,
        "updated_at": Task.updated_at,
    }
    if sort_by in sort_map:
        col = sort_map[sort_by]
        query = query.order_by(col.asc() if order == "asc" else col.desc())
    else:
        query = query.order_by(Task.id.desc())

    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    return items


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        if k == "status" and v is not None:
            v = TaskStatus(v)
        setattr(task, k, v)

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return

# backend/endpoints/tasks.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.database import get_db  # 프로젝트에 이미 존재한다고 가정
from backend.models import Task, TaskStatus
from backend.schemas.task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("", response_model=TaskOut, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(
        title=payload.title,
        description=payload.description,
        status=TaskStatus(payload.status),
        priority=payload.priority,
        due_date=payload.due_date,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("", response_model=List[TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="title/description 검색"),
    status: Optional[str] = Query(None, pattern="^(todo|in_progress|done)$"),
    min_priority: Optional[int] = Query(None, ge=1, le=5),
    max_priority: Optional[int] = Query(None, ge=1, le=5),
    due_from: Optional[datetime] = None,
    due_to: Optional[datetime] = None,
    sort_by: Optional[str] = Query(None, description="id|priority|due_date|created_at|updated_at"),
    order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = db.query(Task)

    if q:
        like = f"%{q}%"
        query = query.filter((Task.title.ilike(like)) | (Task.description.ilike(like)))
    if status:
        query = query.filter(Task.status == TaskStatus(status))
    if min_priority is not None:
        query = query.filter(Task.priority >= min_priority)
    if max_priority is not None:
        query = query.filter(Task.priority <= max_priority)
    if due_from:
        query = query.filter(Task.due_date >= due_from)
    if due_to:
        query = query.filter(Task.due_date <= due_to)

    sort_map = {
        "id": Task.id,
        "priority": Task.priority,
        "due_date": Task.due_date,
        "created_at": Task.created_at,
        "updated_at": Task.updated_at,
    }
    if sort_by in sort_map:
        col = sort_map[sort_by]
        query = query.order_by(col.asc() if order == "asc" else col.desc())
    else:
        query = query.order_by(Task.id.desc())

    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    return items

@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        if k == "status" and v is not None:
            v = TaskStatus(v)
        setattr(task, k, v)

    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return
