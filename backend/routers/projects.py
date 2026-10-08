from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Project, Employee, Department, ActivityLog
from ..schemas import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Project)
    if department_id:
        query = query.filter(Project.department_id == department_id)
    if status and status != "all":
        query = query.filter(Project.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter((Project.name.ilike(s)) | (Project.code.ilike(s)))

    projects = query.all()
    results = []
    for p in projects:
        resp = ProjectResponse.from_orm(p)
        resp.department_name = p.department.name if p.department else "General"
        mgr = db.query(Employee).filter(Employee.id == p.manager_id).first() if p.manager_id else None
        resp.manager_name = mgr.name if mgr else "Unassigned"
        results.append(resp)
    return results

@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(proj_in: ProjectCreate, db: Session = Depends(get_db)):
    proj = Project(**proj_in.dict())
    db.add(proj)
    db.commit()
    db.refresh(proj)

    log = ActivityLog(
        user_name="Admin",
        user_role="Admin",
        action="Initiated project",
        target=proj.name,
        module="projects",
    )
    db.add(log)
    db.commit()

    resp = ProjectResponse.from_orm(proj)
    resp.department_name = proj.department.name if proj.department else "General"
    mgr = db.query(Employee).filter(Employee.id == proj.manager_id).first() if proj.manager_id else None
    resp.manager_name = mgr.name if mgr else "Unassigned"
    return resp

@router.put("/{proj_id}", response_model=ProjectResponse)
def update_project(proj_id: int, proj_in: ProjectCreate, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == proj_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, val in proj_in.dict().items():
        setattr(proj, key, val)

    db.commit()
    db.refresh(proj)

    resp = ProjectResponse.from_orm(proj)
    resp.department_name = proj.department.name if proj.department else "General"
    mgr = db.query(Employee).filter(Employee.id == proj.manager_id).first() if proj.manager_id else None
    resp.manager_name = mgr.name if mgr else "Unassigned"
    return resp

@router.delete("/{proj_id}")
def delete_project(proj_id: int, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == proj_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    name = proj.name
    db.delete(proj)
    db.commit()
    return {"success": True, "message": f"Project {name} deleted"}
