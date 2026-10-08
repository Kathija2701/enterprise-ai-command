from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Department, Employee, Project, ActivityLog
from ..schemas import DepartmentCreate, DepartmentResponse

router = APIRouter(prefix="/api/departments", tags=["Departments"])

@router.get("", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    results = []
    for dept in departments:
        resp = DepartmentResponse.from_orm(dept)
        resp.employee_count = db.query(Employee).filter(Employee.department_id == dept.id).count()
        resp.project_count = db.query(Project).filter(Project.department_id == dept.id).count()
        results.append(resp)
    return results

@router.post("", response_model=DepartmentResponse, status_code=201)
def create_department(dept_in: DepartmentCreate, db: Session = Depends(get_db)):
    dept = Department(**dept_in.dict())
    db.add(dept)
    db.commit()
    db.refresh(dept)

    log = ActivityLog(
        user_name="Admin",
        user_role="Admin",
        action="Created department",
        target=dept.name,
        module="departments",
    )
    db.add(log)
    db.commit()

    return DepartmentResponse.from_orm(dept)

@router.put("/{dept_id}", response_model=DepartmentResponse)
def update_department(dept_id: int, dept_in: DepartmentCreate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    for key, val in dept_in.dict().items():
        setattr(dept, key, val)

    db.commit()
    db.refresh(dept)
    return DepartmentResponse.from_orm(dept)

@router.delete("/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    name = dept.name
    db.delete(dept)
    db.commit()
    return {"success": True, "message": f"Department {name} deleted"}
