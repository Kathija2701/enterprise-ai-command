from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Employee, Department, ActivityLog
from ..schemas import EmployeeCreate, EmployeeResponse

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.get("", response_model=List[EmployeeResponse])
def get_employees(
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Employee)
    if department_id:
        query = query.filter(Employee.department_id == department_id)
    if status and status != "all":
        query = query.filter(Employee.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter((Employee.name.ilike(s)) | (Employee.email.ilike(s)) | (Employee.role.ilike(s)))
    
    employees = query.all()
    results = []
    for emp in employees:
        resp = EmployeeResponse.from_orm(emp)
        resp.department_name = emp.department.name if emp.department else "General"
        results.append(resp)
    return results

@router.post("", response_model=EmployeeResponse, status_code=201)
def create_employee(emp_in: EmployeeCreate, db: Session = Depends(get_db)):
    emp = Employee(**emp_in.dict())
    db.add(emp)
    db.commit()
    db.refresh(emp)

    log = ActivityLog(
        user_name="Admin",
        user_role="Admin",
        action="Created employee profile",
        target=emp.name,
        module="employees",
    )
    db.add(log)
    db.commit()

    resp = EmployeeResponse.from_orm(emp)
    resp.department_name = emp.department.name if emp.department else "General"
    return resp

@router.put("/{emp_id}", response_model=EmployeeResponse)
def update_employee(emp_id: int, emp_in: EmployeeCreate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    for key, val in emp_in.dict().items():
        setattr(emp, key, val)

    db.commit()
    db.refresh(emp)

    resp = EmployeeResponse.from_orm(emp)
    resp.department_name = emp.department.name if emp.department else "General"
    return resp

@router.delete("/{emp_id}")
def delete_employee(emp_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    name = emp.name
    db.delete(emp)
    db.commit()

    log = ActivityLog(
        user_name="Admin",
        user_role="Admin",
        action="Deleted employee profile",
        target=name,
        module="employees",
    )
    db.add(log)
    db.commit()

    return {"success": True, "message": f"Employee {name} deleted"}
