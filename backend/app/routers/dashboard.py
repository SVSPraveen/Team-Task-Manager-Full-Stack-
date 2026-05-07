from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/", response_model=schemas.DashboardOut)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    memberships = db.query(models.ProjectMember).filter_by(user_id=current_user.id).all()
    project_ids = [m.project_id for m in memberships]

    if not project_ids:
        return {
            "total_tasks": 0,
            "overdue_tasks": 0,
            "by_status": [],
            "tasks_by_user": []
        }

    now = datetime.utcnow()
    total = db.query(models.Task).filter(
        models.Task.project_id.in_(project_ids)
    ).count()

    overdue = db.query(models.Task).filter(
        models.Task.project_id.in_(project_ids),
        models.Task.due_date < now,
        models.Task.status != models.StatusEnum.DONE
    ).count()

    by_status_rows = db.query(
        models.Task.status, func.count(models.Task.id)
    ).filter(
        models.Task.project_id.in_(project_ids)
    ).group_by(models.Task.status).all()

    tasks_by_user_rows = db.query(
        models.User.name, func.count(models.Task.id)
    ).join(
        models.Task, models.Task.assignee_id == models.User.id
    ).filter(
        models.Task.project_id.in_(project_ids)
    ).group_by(models.User.name).all()

    return {
        "total_tasks": total,
        "overdue_tasks": overdue,
        "by_status": [{"status": r[0].value, "count": r[1]} for r in by_status_rows],
        "tasks_by_user": [{"user_name": r[0], "count": r[1]} for r in tasks_by_user_rows]
    }
