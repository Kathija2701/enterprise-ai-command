from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "Employee"
    status: Optional[str] = "Active"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    avatar: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = ""
    head_name: Optional[str] = ""
    head_email: Optional[str] = ""
    budget: Optional[float] = 0.0
    location: Optional[str] = ""
    color: Optional[str] = "#3B82F6"

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    created_at: Optional[datetime] = None
    employee_count: Optional[int] = 0
    project_count: Optional[int] = 0

    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    department_id: Optional[int] = None
    role: str
    status: Optional[str] = "Active"
    salary: Optional[float] = 0.0
    join_date: Optional[str] = None
    skills: Optional[str] = None
    avatar: Optional[str] = None
    performance_score: Optional[int] = 85

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: int
    department_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = ""
    department_id: int
    manager_id: Optional[int] = None
    status: Optional[str] = "Active"
    progress: Optional[int] = 0
    budget: Optional[float] = 0.0
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    risk_level: Optional[str] = "Low"

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    department_name: Optional[str] = None
    manager_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    project_id: int
    assigned_to_id: Optional[int] = None
    priority: Optional[str] = "Medium"
    status: Optional[str] = "To Do"
    progress: Optional[int] = 0
    due_date: Optional[str] = None
    tags: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    project_name: Optional[str] = None
    assigned_to_name: Optional[str] = None
    ai_priority_score: Optional[int] = 50
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    priority: str
    read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AIChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

class AIChatResponse(BaseModel):
    reply: str
    timestamp: str

class AIAutomateRequest(BaseModel):
    action: str  # prioritize_tasks, workload_audit, risk_detection, generate_report, scan_deadlines
