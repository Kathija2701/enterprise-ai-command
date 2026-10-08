# AI-Powered Integrated Enterprise Management and Automation Platform

A modern, professional enterprise management system that helps organizations manage employees, tasks, projects, departments, reports, notifications, and business workflows from a single unified dashboard, augmented with an autonomous AI copilot and proactive automation engines.

---

## 🌟 Key Features

1. **Executive Command Dashboard**
   - Live metrics: Total Employees, Active Projects, Pending Tasks, Completed Tasks, Efficiency Score, and Annual Budget.
   - Interactive charts for Project Milestones, Department Capital Allocation, and Sprint Task Distribution.
   - Live AI Insights Alert Banner with real-time operational advice.
   - System Activity Log feed.

2. **Workforce & Employee Management**
   - Full CRUD: Add, Edit, Delete, and View Employee Profiles.
   - Department assignment, Role specification, Attendance status (Active, Remote, On Leave).
   - Individual performance scoring and compensation tracking.
   - Search, department filters, and card/table view toggles.

3. **Task & Workflow Management**
   - Kanban Board View (To Do, In Progress, In Review, Completed) and List View.
   - Priority levels: Urgent, High, Medium, Low.
   - Progress sliders (0-100%) and automatic completion updates.
   - AI Re-Prioritizer button for autonomous backlog re-ranking.

4. **Strategic Project Management**
   - Project cards with milestone progress bars, deadlines, and delivery countdowns.
   - Risk classification: Low, Medium, and Critical.
   - Manager assignments, team member rosters, and budget monitoring.

5. **Department Management**
   - Department cards with custom color identifiers, division leads, and capital allocations.
   - Staff count and active project metrics per department.

6. **AI Copilot Assistant**
   - Real-time conversational chatbot with full live access to organizational database entities.
   - Answers business questions such as:
     - *"Show pending tasks and high-priority bottlenecks"*
     - *"Which project has the highest progress?"*
     - *"Give me a summary of today's activities and employee status"*
     - *"Analyze workload balance across departments"*
   - Powered by Gemini 3.8 Flash model on backend with fallback NLP engine.

7. **AI Automation Center**
   - **Task Prioritization Matrix**: Rescores tasks based on deadline proximity and team capacity.
   - **Deadline Sentinel**: Dispatches urgent alerts for tasks due within 5 days.
   - **Workload & Burnout Guard**: Flags overloaded employees (>3 active tasks).
   - **Project Risk Detector**: Warns on trajectory slips and recommends resource reallocations.
   - **Autonomous Executive Report Generator**: Produces C-Suite briefings with 1 click.

8. **Reports & Exports**
   - Tabs for Monthly Executive Summary, Workforce Productivity, Project Milestones, Task Execution, and Department Budgets.
   - 1-click **CSV Export**.
   - **Print / Save as PDF** with styled report header and audit stamps.

9. **Notification & Alert Sentinel**
   - Categorized alerts: Deadlines, AI Risks, Task Assignments, and System Events.
   - Mark as Read, Mark All Read, and Dismiss alert features.

10. **Admin Panel & RBAC**
    - User management: Create accounts and assign roles (**Admin**, **Manager**, **Employee**).
    - Enterprise settings: Company legal name, contact email, operating hours, currency, and AI scan frequencies.
    - Database reseed / reset trigger.

---

## 🔑 Sample Test Login Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin Director** | `admin@enterprise.ai` | `admin123` | Full access to Admin Panel, Settings, All Modules |
| **Department Manager** | `sarah.tech@enterprise.ai` | `manager123` | Management of projects, task assignments, reports |
| **Employee** | `alex.dev@enterprise.ai` | `employee123` | Task execution, personal updates, AI Copilot |

> **Note:** The login interface also includes 1-click fast login buttons for all three roles for effortless evaluation!

---

## 🛠️ Step-by-Step Setup Guide

### Method A: Running the Integrated Full-Stack App (AI Studio / Node + Vite)

The app includes an Express + Vite full-stack server running directly on port 3000.

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key (optional for basic NLP fallback):
   ```ini
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the Application:**
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000`.

---

### Method B: Running with Python FastAPI & SQLite Backend

1. **Install Python Dependencies:**
   ```bash
   cd enterprise-management
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Set Environment Variables:**
   ```bash
   export DATABASE_URL="sqlite:///./enterprise.db"
   export SECRET_KEY="super-secret-jwt-key-for-enterprise-auth-2026"
   export GEMINI_API_KEY="your_api_key_here"  # Optional
   ```
   On Windows PowerShell:
   ```powershell
   $env:DATABASE_URL="sqlite:///./enterprise.db"
   $env:SECRET_KEY="super-secret-jwt-key-for-enterprise-auth-2026"
   ```

3. **Start the FastAPI Backend:**
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   The database tables (`users`, `employees`, `departments`, `projects`, `tasks`, `notifications`, `activity_logs`) are automatically created and seeded on initial run!

4. **Explore Interactive API Documentation:**
   Open Swagger UI at `http://127.0.0.1:8000/docs` or ReDoc at `http://127.0.0.1:8000/redoc`.

5. **Open Frontend:**
   Open `frontend/index.html` or `frontend/dashboard.html` in any modern web browser or serve via:
   ```bash
   python -m http.server 3000 --directory frontend
   ```

---

## 🧪 Testing the REST APIs

### 1. Health Check
```bash
curl -X GET http://localhost:8000/api/health
```

### 2. User Authentication
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@enterprise.ai", "password":"admin123"}'
```

### 3. Retrieve Employees
```bash
curl -X GET http://localhost:8000/api/employees
```

### 4. Ask Enterprise AI Copilot
```bash
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Show pending tasks and high-priority bottlenecks"}'
```

### 5. Trigger AI Task Prioritization
```bash
curl -X POST http://localhost:8000/api/ai/automate \
  -H "Content-Type: application/json" \
  -d '{"action":"prioritize_tasks"}'
```

---

## 📁 Project Directory Structure

```
enterprise-management/
│
├── backend/
│   ├── main.py              # FastAPI server & route registration
│   ├── database.py          # SQLAlchemy SQLite connection & session
│   ├── models.py            # Database tables (Users, Employees, Tasks, etc.)
│   ├── schemas.py           # Pydantic validation schemas
│   ├── auth.py              # JWT tokens, password hashing, and RBAC
│   └── routers/
│       ├── auth.py          # Authentication endpoints
│       ├── employees.py     # Employee management CRUD
│       ├── departments.py   # Department management CRUD
│       ├── projects.py      # Project management CRUD
│       ├── tasks.py         # Task management & statuses
│       ├── reports.py       # Aggregate reports & CSV export
│       ├── notifications.py # Notification dispatch & reading
│       └── ai.py            # AI assistant & automation workflows
│
├── frontend/
│   ├── index.html           # Enterprise portal entrypoint
│   ├── login.html           # Authentication page
│   ├── dashboard.html       # Main metrics & project cards
│   ├── employees.html       # Workforce directory
│   ├── projects.html        # Strategic initiative tracker
│   ├── tasks.html           # Kanban & list workflow views
│   ├── reports.html         # Executive reports & print preview
│   └── css/
│       └── style.css        # Responsive dashboard styling
│
├── src/                     # React + Vite full-stack components
│   ├── App.tsx              # Main application controller
│   ├── types.ts             # TypeScript entity interfaces
│   ├── components/          # Navbar, Sidebar, and SVG Charts
│   └── views/               # Complete modules (Dashboard, AI, etc.)
│
├── server.ts                # Full-stack Node/Express REST & Vite server
├── requirements.txt         # Python package dependencies
├── .env.example             # Configuration template
└── README.md                # Documentation & instructions
```
