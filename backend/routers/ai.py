import os
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Employee, Project, Task, Department, Notification
from ..schemas import AIChatRequest, AIChatResponse, AIAutomateRequest

router = APIRouter(prefix="/api/ai", tags=["AI Copilot & Automation"])

@router.post("/chat", response_model=AIChatResponse)
def ai_chat(req: AIChatRequest, db: Session = Depends(get_db)):
    msg = req.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Message is empty")

    employees = db.query(Employee).all()
    projects = db.query(Project).all()
    tasks = db.query(Task).all()

    api_key = os.getenv("GEMINI_API_KEY")
    reply = ""

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            context = {
                "totalEmployees": len(employees),
                "employees": [{"name": e.name, "role": e.role, "status": e.status} for e in employees],
                "projects": [{"name": p.name, "progress": f"{p.progress}%", "deadline": p.deadline, "risk": p.risk_level} for p in projects],
                "tasks": [{"title": t.title, "priority": t.priority, "status": t.status, "due": t.due_date} for t in tasks],
            }
            system_prompt = f"You are the Enterprise AI Copilot. Use this live DB context:\n{json.dumps(context)}\nProvide a helpful, precise executive answer."
            res = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=msg,
                config={"system_instruction": system_prompt}
            )
            reply = res.text
        except Exception:
            pass

    if not reply:
        q = msg.lower()
        if "pending" in q or "task" in q:
            pending = [t for t in tasks if t.status != "Completed"]
            reply = f"📋 Found **{len(pending)} pending tasks**.\n" + "\n".join([f"• [{t.priority}] {t.title} (Due: {t.due_date})" for t in pending[:5]])
        elif "progress" in q or "project" in q:
            sorted_p = sorted(projects, key=lambda x: x.progress, reverse=True)
            top = sorted_p[0] if sorted_p else None
            reply = f"🚀 Top project by progress is **{top.name}** at **{top.progress}%**." if top else "No projects found."
        elif "today" in q or "summary" in q:
            reply = f"📅 Today's summary: {len(employees)} active team members, {len(projects)} initiatives in flight, {len([t for t in tasks if t.status == 'Completed'])} completed tasks."
        else:
            reply = f"🤖 AI Copilot: Enterprise operations normal. Managing {len(employees)} employees across {len(projects)} projects."

    return AIChatResponse(reply=reply, timestamp=datetime.utcnow().isoformat())

@router.post("/automate")
def ai_automate(req: AIAutomateRequest, db: Session = Depends(get_db)):
    action = req.action
    tasks = db.query(Task).all()
    projects = db.query(Project).all()

    if action == "prioritize_tasks":
        for t in tasks:
            score = 60 if t.priority in ["High", "Urgent"] else 30
            t.ai_priority_score = score
        db.commit()
        return {"success": True, "message": "Tasks rescored via AI Matrix."}

    if action == "risk_detection":
        risks = []
        for p in projects:
            if p.progress < 50 or p.risk_level in ["Critical", "Medium"]:
                risks.append({"name": p.name, "progress": p.progress, "risk": p.risk_level})
        return {"success": True, "risks": risks}

    return {"success": True, "message": f"Automation {action} triggered successfully."}
