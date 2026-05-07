from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from app.models import RoleEnum, PriorityEnum, StatusEnum


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or len(v) < 2:
            raise ValueError('Name must be at least 2 characters')
        if len(v) > 100:
            raise ValueError('Name must not exceed 100 characters')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v or len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if len(v) > 72:
            raise ValueError('Password must not exceed 72 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    token: str
    user: UserOut


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or len(v) < 2:
            raise ValueError('Project name must be at least 2 characters')
        if len(v) > 200:
            raise ValueError('Project name must not exceed 200 characters')
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if v and len(v) > 5000:
            raise ValueError('Description must not exceed 5000 characters')
        return v


class MemberOut(BaseModel):
    id: str
    role: RoleEnum
    user: UserOut

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    members: List[MemberOut] = []
    task_count: Optional[int] = 0

    class Config:
        from_attributes = True


class AddMemberRequest(BaseModel):
    email: EmailStr
    role: RoleEnum = RoleEnum.MEMBER


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: PriorityEnum = PriorityEnum.MEDIUM
    assignee_id: Optional[str] = None
    project_id: str

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if not v or len(v) < 2:
            raise ValueError('Task title must be at least 2 characters')
        if len(v) > 500:
            raise ValueError('Task title must not exceed 500 characters')
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if v and len(v) > 5000:
            raise ValueError('Description must not exceed 5000 characters')
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[PriorityEnum] = None
    status: Optional[StatusEnum] = None
    assignee_id: Optional[str] = None

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if v and len(v) < 2:
            raise ValueError('Task title must be at least 2 characters')
        if v and len(v) > 500:
            raise ValueError('Task title must not exceed 500 characters')
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if v and len(v) > 5000:
            raise ValueError('Description must not exceed 5000 characters')
        return v


class TaskUserOut(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True


class TaskOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    priority: PriorityEnum
    status: StatusEnum
    created_at: datetime
    project_id: str
    assignee: Optional[TaskUserOut]
    creator: TaskUserOut

    class Config:
        from_attributes = True


class ProjectDetailOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    members: List[MemberOut] = []
    tasks: List[TaskOut] = []

    class Config:
        from_attributes = True


class StatusCount(BaseModel):
    status: str
    count: int


class UserTaskCount(BaseModel):
    user_name: str
    count: int


class DashboardOut(BaseModel):
    total_tasks: int
    overdue_tasks: int
    by_status: List[StatusCount]
    tasks_by_user: List[UserTaskCount]
