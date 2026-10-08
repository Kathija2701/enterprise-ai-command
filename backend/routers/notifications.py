from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Notification
from ..schemas import NotificationResponse

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).all()

@router.put("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if notif:
        notif.read = True
        db.commit()
    return {"success": True}

@router.post("/mark-all-read")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).update({Notification.read: True})
    db.commit()
    return {"success": True}

@router.delete("/{notif_id}")
def delete_notification(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if notif:
        db.delete(notif)
        db.commit()
    return {"success": True}
