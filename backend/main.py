import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base, SessionLocal
from .models import User, Department, Employee, Project, Task, Notification, ActivityLog
from .auth import get_password_hash
from .routers import auth, employees, departments, projects, tasks, reports, notifications, ai

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Integrated Enterprise Management and Automation Platform",
    description="Enterprise REST APIs for Employees, Projects, Tasks, Departments, Reports, Notifications, and AI Copilot",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed initial database if empty
def seed_data():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin_user = User(
                name="Admin Director",
                email="admin@enterprise.ai",
                hashed_password=get_password_hash("admin123"),
                role="Admin",
            )
            manager_user = User(
                name="Sarah Jenkins",
                email="sarah.tech@enterprise.ai",
                hashed_password=get_password_hash("manager123"),
                role="Manager",
            )
            employee_user = User(
                name="Alex Developer",
                email="alex.dev@enterprise.ai",
                hashed_password=get_password_hash("employee123"),
                role="Employee",
            )
            db.add_all([admin_user, manager_user, employee_user])

            d1 = Department(name="Engineering & Technology", code="ENG", budget=450000, head_name="Dr. Marcus Vance")
            d2 = Department(name="Product & Design", code="PROD", budget=280000, head_name="Elena Rostova")
            db.add_all([d1, d2])
            db.commit()

            e1 = Employee(name="Alexander Wright", email="alexander.wright@enterprise.ai", department_id=d1.id, role="Principal Cloud Architect", salary=165000)
            e2 = Employee(name="Sarah Jenkins", email="sarah.jenkins@enterprise.ai", department_id=d1.id, role="Lead AI Engineer", salary=155000)
            db.add_all([e1, e2])
            db.commit()

            p1 = Project(name="Enterprise Cloud Migration v4", code="ECM-2026", department_id=d1.id, manager_id=e1.id, progress=74, budget=350000, deadline="2026-11-30")
            db.add(p1)
            db.commit()

            t1 = Task(title="Migrate Redis session cache to distributed Valkey cluster", project_id=p1.id, assigned_to_id=e1.id, priority="High", status="In Progress", progress=65, due_date="2026-10-18")
            db.add(t1)

            n1 = Notification(title="System Online", message="AI-Powered Enterprise Platform initialized successfully.", type="system", priority="normal")
            db.add(n1)
            db.commit()
    finally:
        db.close()

seed_data()

# Include Routers
app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(departments.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(ai.router)

@app.get("/api/health")
def health_check():
    return {"status": "online", "app": "Enterprise Management Platform v1.0", "ai_status": "ready"}
