from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Task, Project, Employee, Notification, ActivityLog
from ..schemas import TaskCreate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    project_id: Optional[int] = None,
    assigned_to_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Task)
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if assigned_to_id:
        query = query.filter(Task.assigned_to_id == assigned_to_id)
    if status and status != "all":
        query = query.filter(Task.status == status)
    if priority and priority != "all":
        query = query.filter(Task.priority == priority)
    if search:
        s = f"%{search}%"
        query = query.filter((Task.title.ilike(s)) | (Task.description.ilike(s)))

    tasks = query.all()
    results = []
    for t in tasks:
        resp = TaskResponse.from_orm(t)
        resp.project_name = t.project.name if t.project else "Unassigned"
        resp.assigned_to_name = t.assigned_to.name if t.assigned_to else "Unassigned"
        results.append(resp)
    return results

@router.post("", response_model=TaskResponse, status_code=201)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    task = Task(**task_in.dict())
    db.add(task)
    db.commit()
    db.refresh(task)

    # Trigger notification
    if task.assigned_to_id:
        notif = Notification(
            title="New Task Assigned",
            message=f"You have been assigned: {task.title}",
            type="task",
            priority="normal" if task.priority != "Urgent" else "urgent",
        )
        db.add(notif)
        db.commit()

    log = ActivityLog(
        user_name="Admin",
        user_role="Admin",
        action="Created task",
        target=task.title,
        module="tasks",
    )
    db.add(log)
    db.commit()

    resp = TaskResponse.from_orm(task)
    resp.project_name = task.project.name if task.project else "Unassigned"
    resp.assigned_to_name = task.assigned_to.name if task.assigned_to else "Unassigned"
    return resp

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_in: TaskCreate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, val in task_in.dict().items():
        setattr(task, key, val)

    if task_in.status == "Completed":
        task.progress = 100

    db.commit()
    db.refresh(task)

    resp = TaskResponse.from_orm(task)
    resp.project_name = task.project.name if task.project else "Unassigned"
    resp.assigned_to_name = task.assigned_to.name if task.assigned_to else "Unassigned"
    return resp

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    title = task.title
    db.delete(task)
    db.commit()
    return {"success": True, "message": f"Task {title} deleted"}
