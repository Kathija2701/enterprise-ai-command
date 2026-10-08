from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
import io
import csv
from ..database import get_db
from ..models import Employee, Project, Department, Task

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("")
def get_reports(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    projects = db.query(Project).all()
    departments = db.query(Department).all()
    tasks = db.query(Task).all()

    emp_data = []
    for emp in employees:
        emp_tasks = [t for t in tasks if t.assigned_to_id == emp.id]
        completed = len([t for t in emp_tasks if t.status == "Completed"])
        emp_data.append({
            "id": emp.id,
            "name": emp.name,
            "department": emp.department.name if emp.department else "N/A",
            "role": emp.role,
            "totalTasks": len(emp_tasks),
            "completedTasks": completed,
            "completionRate": round((completed / len(emp_tasks)) * 100) if emp_tasks else 100,
            "performanceScore": emp.performance_score,
            "salary": emp.salary,
        })

    proj_data = []
    for p in projects:
        p_tasks = [t for t in tasks if t.project_id == p.id]
        proj_data.append({
            "id": p.id,
            "name": p.name,
            "code": p.code,
            "department": p.department.name if p.department else "N/A",
            "progress": p.progress,
            "budget": p.budget,
            "deadline": p.deadline,
            "status": p.status,
            "riskLevel": p.risk_level,
            "tasks": len(p_tasks),
        })

    return {
        "employees": emp_data,
        "projects": proj_data,
        "totalEmployees": len(employees),
        "totalProjects": len(projects),
        "totalTasks": len(tasks),
    }

@router.get("/export/csv")
def export_csv(module: str = "tasks", db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)

    if module == "employees":
        writer.writerow(["ID", "Name", "Email", "Department", "Role", "Status", "Salary", "Score"])
        for e in db.query(Employee).all():
            writer.writerow([e.id, e.name, e.email, e.department.name if e.department else "", e.role, e.status, e.salary, e.performance_score])
    elif module == "projects":
        writer.writerow(["ID", "Name", "Code", "Department", "Progress", "Budget", "Deadline", "Risk"])
        for p in db.query(Project).all():
            writer.writerow([p.id, p.name, p.code, p.department.name if p.department else "", f"{p.progress}%", p.budget, p.deadline, p.risk_level])
    else:
        writer.writerow(["ID", "Title", "Project", "Assignee", "Priority", "Status", "Progress", "Due Date"])
        for t in db.query(Task).all():
            writer.writerow([t.id, t.title, t.project.name if t.project else "", t.assigned_to.name if t.assigned_to else "", t.priority, t.status, f"{t.progress}%", t.due_date])

    content = output.getvalue()
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=enterprise_{module}_report.csv"}
    )
