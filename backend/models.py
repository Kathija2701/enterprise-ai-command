from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="Employee")  # Admin, Manager, Employee
    status = Column(String(20), default="Active")
    avatar = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    head_name = Column(String(100), nullable=True)
    head_email = Column(String(120), nullable=True)
    budget = Column(Float, default=0.0)
    location = Column(String(100), nullable=True)
    color = Column(String(20), default="#3B82F6")
    created_at = Column(DateTime, default=datetime.utcnow)

    employees = relationship("Employee", back_populates="department")
    projects = relationship("Project", back_populates="department")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    role = Column(String(100), nullable=False)
    status = Column(String(30), default="Active")  # Active, On Leave, Remote
    salary = Column(Float, default=0.0)
    join_date = Column(String(20), nullable=True)
    skills = Column(Text, nullable=True)  # Comma-separated or JSON string
    avatar = Column(String(255), nullable=True)
    performance_score = Column(Integer, default=85)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="employees")
    tasks = relationship("Task", back_populates="assigned_to")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(30), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    status = Column(String(30), default="Active")  # Planning, Active, On Hold, Completed, At Risk
    progress = Column(Integer, default=0)
    budget = Column(Float, default=0.0)
    start_date = Column(String(20), nullable=True)
    deadline = Column(String(20), nullable=True)
    risk_level = Column(String(20), default="Low")  # Low, Medium, Critical
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="projects")
    tasks = relationship("Task", back_populates="project")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    priority = Column(String(20), default="Medium")  # Low, Medium, High, Urgent
    status = Column(String(20), default="To Do")  # To Do, In Progress, In Review, Completed
    progress = Column(Integer, default=0)
    due_date = Column(String(20), nullable=True)
    tags = Column(String(200), nullable=True)
    ai_priority_score = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")
    assigned_to = relationship("Employee", back_populates="tasks")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), default="system")  # deadline, task, project, risk, system
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), nullable=False)
    user_role = Column(String(50), nullable=False)
    action = Column(String(150), nullable=False)
    target = Column(String(200), nullable=False)
    module = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    report_type = Column(String(50), nullable=False)
    data_json = Column(Text, nullable=False)
    generated_by = Column(String(100), default="AI Automation Engine")
    created_at = Column(DateTime, default=datetime.utcnow)
