from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ActivityLog
from ..schemas import UserCreate, UserLogin, UserResponse, Token
from ..auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists with this email")

    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role or "Employee",
        status="Active",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log = ActivityLog(
        user_name=user.name,
        user_role=user.role,
        action="Registered account",
        target=user.email,
        module="auth"
    )
    db.add(log)
    db.commit()

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    log = ActivityLog(
        user_name=user.name,
        user_role=user.role,
        action="Signed in",
        target="Portal session",
        module="auth"
    )
    db.add(log)
    db.commit()

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
