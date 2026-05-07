from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("/", response_model=schemas.TaskOut)
def create_task(
    data: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    m = db.query(models.ProjectMember).filter_by(
        user_id=current_user.id, project_id=data.project_id
    ).first()
    if not m or m.role != models.RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create tasks")
    task = models.Task(
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        priority=data.priority,
        project_id=data.project_id,
        assignee_id=data.assignee_id,
        creator_id=current_user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/project/{project_id}", response_model=List[schemas.TaskOut])
def get_tasks(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not db.query(models.ProjectMember).filter_by(
        user_id=current_user.id, project_id=project_id
    ).first():
        raise HTTPException(status_code=403, detail="Not a project member")
    return db.query(models.Task).filter_by(project_id=project_id).all()


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: str,
    data: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter_by(id=task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    m = db.query(models.ProjectMember).filter_by(
        user_id=current_user.id, project_id=task.project_id
    ).first()
    if not m:
        raise HTTPException(status_code=403, detail="Not a project member")
    is_admin = m.role == models.RoleEnum.ADMIN
    is_assignee = task.assignee_id == current_user.id
    if not is_admin and not is_assignee:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
    if data.status is not None:
        task.status = data.status
    if is_admin:
        if data.title is not None:
            task.title = data.title
        if data.description is not None:
            task.description = data.description
        if data.due_date is not None:
            task.due_date = data.due_date
        if data.priority is not None:
            task.priority = data.priority
        if data.assignee_id is not None:
            task.assignee_id = data.assignee_id
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter_by(id=task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    m = db.query(models.ProjectMember).filter_by(
        user_id=current_user.id, project_id=task.project_id
    ).first()
    if not m or m.role != models.RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can delete tasks")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
