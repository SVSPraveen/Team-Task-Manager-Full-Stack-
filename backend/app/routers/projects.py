from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/api/projects", tags=["projects"])


def get_member(db, user_id, project_id):
    return db.query(models.ProjectMember).filter_by(
        user_id=user_id, project_id=project_id
    ).first()


def require_admin(db, user_id, project_id):
    m = get_member(db, user_id, project_id)
    if not m or m.role != models.RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return m


@router.post("/", response_model=schemas.ProjectDetailOut)
def create_project(
    data: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = models.Project(name=data.name, description=data.description)
    db.add(project)
    db.flush()
    db.add(models.ProjectMember(
        user_id=current_user.id,
        project_id=project.id,
        role=models.RoleEnum.ADMIN
    ))
    db.commit()
    db.refresh(project)
    return project


@router.get("/", response_model=List[schemas.ProjectOut])
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    memberships = db.query(models.ProjectMember).filter_by(user_id=current_user.id).all()
    result = []
    for m in memberships:
        p = m.project
        p.task_count = len(p.tasks)
        result.append(p)
    return result


@router.get("/{project_id}", response_model=schemas.ProjectDetailOut)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    m = get_member(db, current_user.id, project_id)
    if not m:
        raise HTTPException(status_code=404, detail="Project not found")
    return m.project


@router.post("/{project_id}/members", response_model=schemas.MemberOut)
def add_member(
    project_id: str,
    data: schemas.AddMemberRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    require_admin(db, current_user.id, project_id)
    user = db.query(models.User).filter_by(email=data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. They must sign up first.")
    if get_member(db, user.id, project_id):
        raise HTTPException(status_code=409, detail="User already in project")
    member = models.ProjectMember(user_id=user.id, project_id=project_id, role=data.role)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.delete("/{project_id}/members/{user_id}")
def remove_member(
    project_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    require_admin(db, current_user.id, project_id)
    m = get_member(db, user_id, project_id)
    if not m:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(m)
    db.commit()
    return {"message": "Member removed"}
