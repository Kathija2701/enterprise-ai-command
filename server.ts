import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  initialDepartments,
  initialEmployees,
  initialProjects,
  initialTasks,
  initialUsers,
  initialNotifications,
  initialActivityLogs,
  defaultSettings,
} from './server/data';
import { Department, Employee, Project, Task, User, NotificationItem, ActivityLog, SystemSettings } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database Store (Simulating SQLite with full CRUD persistence)
let departments: Department[] = [...initialDepartments];
let employees: Employee[] = [...initialEmployees];
let projects: Project[] = [...initialProjects];
let tasks: Task[] = [...initialTasks];
let users: User[] = [...initialUsers];
let notifications: NotificationItem[] = [...initialNotifications];
let activityLogs: ActivityLog[] = [...initialActivityLogs];
let settings: SystemSettings = { ...defaultSettings };

// Helper to log activities
function logActivity(userName: string, userRole: string, action: string, target: string, module: ActivityLog['module']) {
  const newLog: ActivityLog = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userName,
    userRole,
    action,
    target,
    module,
    timestamp: 'Just now',
  };
  activityLogs.unshift(newLog);
  if (activityLogs.length > 50) activityLogs.pop();
}

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // ----------------------------------------------------
  // AUTHENTICATION APIS
  // ----------------------------------------------------
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Match existing demo users or create session
    let matchedUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!matchedUser) {
      // Auto-login fallback for testing if user enters custom email
      const role = email.includes('admin') ? 'Admin' : email.includes('manager') ? 'Manager' : 'Employee';
      matchedUser = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: role as any,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      users.push(matchedUser);
    }

    logActivity(matchedUser.name, matchedUser.role, 'User signed in', 'System Authentication', 'auth');

    // Return JWT-like mock token + user profile
    const token = `token_jwt_${matchedUser.id}_${Date.now()}`;
    return res.json({
      token,
      user: matchedUser,
      message: 'Login successful',
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, role, departmentId } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: role || 'Employee',
      departmentId: departmentId || 'dept-1',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    users.push(newUser);
    logActivity(newUser.name, newUser.role, 'New account registered', 'Self Registration', 'auth');

    return res.status(201).json({
      token: `token_jwt_${newUser.id}_${Date.now()}`,
      user: newUser,
      message: 'Registration successful',
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    // Return first admin or active user for demo session
    res.json(users[0] || null);
  });

  // ----------------------------------------------------
  // OVERVIEW & DASHBOARD METRICS
  // ----------------------------------------------------
  app.get('/api/overview', (req: Request, res: Response) => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === 'Active' || e.status === 'Remote').length;
    const onLeaveEmployees = employees.filter((e) => e.status === 'On Leave').length;

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'Active').length;
    const atRiskProjects = projects.filter((p) => p.riskLevel === 'Critical' || p.riskLevel === 'Medium').length;

    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const urgentTasks = tasks.filter((t) => t.priority === 'Urgent' && t.status !== 'Completed').length;

    const avgPerformance = Math.round(
      employees.reduce((acc, e) => acc + (e.performanceScore || 0), 0) / (totalEmployees || 1)
    );

    const totalBudget = departments.reduce((acc, d) => acc + d.budget, 0);

    // Department Stats
    const departmentStats = departments.map((dept) => {
      const deptEmployees = employees.filter((e) => e.departmentId === dept.id);
      const deptProjects = projects.filter((p) => p.departmentId === dept.id);
      const deptTasks = tasks.filter((t) => {
        const proj = projects.find((p) => p.id === t.projectId);
        return proj && proj.departmentId === dept.id;
      });
      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        color: dept.color,
        employeeCount: deptEmployees.length,
        projectCount: deptProjects.length,
        taskCount: deptTasks.length,
        budget: dept.budget,
        performanceScore: deptEmployees.length
          ? Math.round(deptEmployees.reduce((acc, e) => acc + e.performanceScore, 0) / deptEmployees.length)
          : 85,
      };
    });

    // Project progress breakdown
    const projectProgress = projects.map((p) => ({
      id: p.id,
      name: p.name,
      progress: p.progress,
      deadline: p.deadline,
      status: p.status,
      riskLevel: p.riskLevel,
    }));

    // Task status counts
    const taskStatusCounts = {
      toDo: tasks.filter((t) => t.status === 'To Do').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      inReview: tasks.filter((t) => t.status === 'In Review').length,
      completed: completedTasks,
    };

    // AI dynamic insights
    const aiInsights = [
      `Overall enterprise completion efficiency is at 78% this sprint, with ${urgentTasks} urgent tasks needing allocation.`,
      `Project "${projects.find((p) => p.riskLevel === 'Critical')?.name || 'Global Enterprise Expansion'}" requires additional engineering headcount to hit Oct 31 milestones.`,
      `Engineering & Technology is operating at highest velocity with 94% average performance index.`,
      `Resource load is evenly balanced across 5 of 6 departments; Sales has 2 open enterprise pipeline audits pending.`,
    ];

    res.json({
      metrics: {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        totalProjects,
        activeProjects,
        atRiskProjects,
        totalTasks,
        pendingTasks,
        completedTasks,
        urgentTasks,
        avgPerformance,
        totalBudget,
      },
      departmentStats,
      projectProgress,
      taskStatusCounts,
      aiInsights,
      recentActivities: activityLogs.slice(0, 8),
    });
  });

  // ----------------------------------------------------
  // EMPLOYEE MANAGEMENT APIS
  // ----------------------------------------------------
  app.get('/api/employees', (req: Request, res: Response) => {
    const { departmentId, status, search } = req.query;
    let filtered = [...employees];

    if (departmentId && departmentId !== 'all') {
      filtered = filtered.filter((e) => e.departmentId === departmentId);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((e) => e.status === status);
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          (e.departmentName && e.departmentName.toLowerCase().includes(q))
      );
    }

    res.json(filtered);
  });

  app.post('/api/employees', (req: Request, res: Response) => {
    const { name, email, phone, departmentId, role, status, salary, skills } = req.body;
    if (!name || !email || !departmentId) {
      return res.status(400).json({ error: 'Name, email, and department are required' });
    }

    const dept = departments.find((d) => d.id === departmentId);
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name,
      email,
      phone: phone || '+1 (555) 000-0000',
      departmentId,
      departmentName: dept ? dept.name : 'General',
      role: role || 'Enterprise Specialist',
      status: status || 'Active',
      salary: Number(salary) || 95000,
      joinDate: new Date().toISOString().split('T')[0],
      skills: Array.isArray(skills) ? skills : (skills || 'General, Management').split(',').map((s: string) => s.trim()),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80`,
      performanceScore: Math.floor(Math.random() * 15) + 85,
    };

    employees.unshift(newEmp);
    logActivity('Admin', 'Admin', 'Added new employee', `${newEmp.name} (${newEmp.role})`, 'employees');

    res.status(201).json(newEmp);
  });

  app.put('/api/employees/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const dept = req.body.departmentId ? departments.find((d) => d.id === req.body.departmentId) : undefined;
    const updated: Employee = {
      ...employees[index],
      ...req.body,
      departmentName: dept ? dept.name : employees[index].departmentName,
    };

    employees[index] = updated;
    logActivity('Admin', 'Admin', 'Updated employee details', updated.name, 'employees');

    res.json(updated);
  });

  app.delete('/api/employees/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const emp = employees.find((e) => e.id === id);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    employees = employees.filter((e) => e.id !== id);
    logActivity('Admin', 'Admin', 'Removed employee', emp.name, 'employees');

    res.json({ success: true, message: `Employee ${emp.name} removed successfully` });
  });

  // ----------------------------------------------------
  // DEPARTMENT MANAGEMENT APIS
  // ----------------------------------------------------
  app.get('/api/departments', (req: Request, res: Response) => {
    // Return departments augmented with live counts
    const withCounts = departments.map((dept) => ({
      ...dept,
      employeeCount: employees.filter((e) => e.departmentId === dept.id).length,
      projectCount: projects.filter((p) => p.departmentId === dept.id).length,
    }));
    res.json(withCounts);
  });

  app.post('/api/departments', (req: Request, res: Response) => {
    const { name, code, description, headName, headEmail, budget, location, color } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and code are required' });
    }

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      description: description || '',
      headName: headName || 'Unassigned',
      headEmail: headEmail || 'head@enterprise.ai',
      budget: Number(budget) || 200000,
      location: location || 'Main Headquarters',
      color: color || '#3B82F6',
      createdAt: new Date().toISOString().split('T')[0],
    };

    departments.push(newDept);
    logActivity('Admin', 'Admin', 'Created department', newDept.name, 'departments');

    res.status(201).json(newDept);
  });

  app.put('/api/departments/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = departments.findIndex((d) => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Department not found' });
    }

    departments[index] = { ...departments[index], ...req.body };
    logActivity('Admin', 'Admin', 'Updated department info', departments[index].name, 'departments');

    res.json(departments[index]);
  });

  app.delete('/api/departments/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const dept = departments.find((d) => d.id === id);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    departments = departments.filter((d) => d.id !== id);
    logActivity('Admin', 'Admin', 'Deleted department', dept.name, 'departments');

    res.json({ success: true, message: `Department ${dept.name} removed successfully` });
  });

  // ----------------------------------------------------
  // PROJECT MANAGEMENT APIS
  // ----------------------------------------------------
  app.get('/api/projects', (req: Request, res: Response) => {
    const { departmentId, status, search } = req.query;
    let filtered = [...projects];

    if (departmentId && departmentId !== 'all') {
      filtered = filtered.filter((p) => p.departmentId === departmentId);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((p) => p.status === status);
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  });

  app.post('/api/projects', (req: Request, res: Response) => {
    const { name, code, description, departmentId, managerId, budget, deadline, riskLevel } = req.body;
    if (!name || !departmentId) {
      return res.status(400).json({ error: 'Project name and department are required' });
    }

    const dept = departments.find((d) => d.id === departmentId);
    const mgr = employees.find((e) => e.id === managerId);

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      code: code ? code.toUpperCase() : `PRJ-${Math.floor(Math.random() * 900 + 100)}`,
      description: description || '',
      departmentId,
      departmentName: dept ? dept.name : 'General',
      managerId: managerId || (employees[0] ? employees[0].id : 'emp-1'),
      managerName: mgr ? mgr.name : 'Sarah Jenkins',
      teamMemberIds: req.body.teamMemberIds || ['emp-1', 'emp-2'],
      status: 'Active',
      progress: 0,
      budget: Number(budget) || 150000,
      startDate: new Date().toISOString().split('T')[0],
      deadline: deadline || '2026-12-31',
      riskLevel: riskLevel || 'Low',
    };

    projects.unshift(newProj);
    logActivity('Admin', 'Admin', 'Initiated new project', newProj.name, 'projects');

    res.status(201).json(newProj);
  });

  app.put('/api/projects/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const dept = req.body.departmentId ? departments.find((d) => d.id === req.body.departmentId) : undefined;
    const mgr = req.body.managerId ? employees.find((e) => e.id === req.body.managerId) : undefined;

    projects[index] = {
      ...projects[index],
      ...req.body,
      departmentName: dept ? dept.name : projects[index].departmentName,
      managerName: mgr ? mgr.name : projects[index].managerName,
    };

    logActivity('Admin', 'Admin', 'Updated project status/scope', projects[index].name, 'projects');

    res.json(projects[index]);
  });

  app.delete('/api/projects/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const proj = projects.find((p) => p.id === id);
    if (!proj) {
      return res.status(404).json({ error: 'Project not found' });
    }

    projects = projects.filter((p) => p.id !== id);
    logActivity('Admin', 'Admin', 'Archived/deleted project', proj.name, 'projects');

    res.json({ success: true, message: `Project ${proj.name} removed successfully` });
  });

  // ----------------------------------------------------
  // TASK MANAGEMENT APIS
  // ----------------------------------------------------
  app.get('/api/tasks', (req: Request, res: Response) => {
    const { status, priority, projectId, assignedToId, search } = req.query;
    let filtered = [...tasks];

    if (status && status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (priority && priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === priority);
    }
    if (projectId && projectId !== 'all') {
      filtered = filtered.filter((t) => t.projectId === projectId);
    }
    if (assignedToId && assignedToId !== 'all') {
      filtered = filtered.filter((t) => t.assignedToId === assignedToId);
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.assignedToName && t.assignedToName.toLowerCase().includes(q))
      );
    }

    res.json(filtered);
  });

  app.post('/api/tasks', (req: Request, res: Response) => {
    const { title, description, projectId, assignedToId, priority, dueDate, progress, status, tags } = req.body;
    if (!title || !projectId) {
      return res.status(400).json({ error: 'Title and project are required' });
    }

    const proj = projects.find((p) => p.id === projectId);
    const assignee = employees.find((e) => e.id === assignedToId);

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: description || '',
      projectId,
      projectName: proj ? proj.name : 'Enterprise Project',
      assignedToId: assignedToId || (employees[0] ? employees[0].id : 'emp-1'),
      assignedToName: assignee ? assignee.name : 'Alexander Wright',
      priority: priority || 'Medium',
      status: status || 'To Do',
      progress: Number(progress) || 0,
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    };

    tasks.unshift(newTask);

    // Create notification for assignee
    if (assignee) {
      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'New Task Assigned',
        message: `You were assigned: "${newTask.title}" (${newTask.priority} priority).`,
        type: 'task',
        priority: newTask.priority === 'Urgent' ? 'urgent' : 'normal',
        read: false,
        timestamp: 'Just now',
      });
    }

    logActivity('Admin', 'Admin', 'Assigned new enterprise task', newTask.title, 'tasks');

    res.status(201).json(newTask);
  });

  app.put('/api/tasks/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const proj = req.body.projectId ? projects.find((p) => p.id === req.body.projectId) : undefined;
    const assignee = req.body.assignedToId ? employees.find((e) => e.id === req.body.assignedToId) : undefined;

    const previousStatus = tasks[index].status;
    const updated: Task = {
      ...tasks[index],
      ...req.body,
      projectName: proj ? proj.name : tasks[index].projectName,
      assignedToName: assignee ? assignee.name : tasks[index].assignedToName,
    };

    // Auto-update progress if status changed to Completed
    if (req.body.status === 'Completed' && previousStatus !== 'Completed') {
      updated.progress = 100;
    }

    tasks[index] = updated;
    logActivity('Sarah Jenkins', 'Manager', `Updated task [${updated.status}]`, updated.title, 'tasks');

    res.json(updated);
  });

  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks = tasks.filter((t) => t.id !== id);
    logActivity('Admin', 'Admin', 'Removed task', task.title, 'tasks');

    res.json({ success: true, message: `Task ${task.title} deleted successfully` });
  });

  // ----------------------------------------------------
  // NOTIFICATIONS APIS
  // ----------------------------------------------------
  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json(notifications);
  });

  app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    const notif = notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
    res.json({ success: true });
  });

  app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
    notifications.forEach((n) => (n.read = true));
    res.json({ success: true });
  });

  app.delete('/api/notifications/:id', (req: Request, res: Response) => {
    notifications = notifications.filter((n) => n.id !== req.params.id);
    res.json({ success: true });
  });

  // ----------------------------------------------------
  // REPORTS & EXPORT APIS
  // ----------------------------------------------------
  app.get('/api/reports', (req: Request, res: Response) => {
    const { type } = req.query;

    const employeeReports = employees.map((emp) => {
      const empTasks = tasks.filter((t) => t.assignedToId === emp.id);
      const completed = empTasks.filter((t) => t.status === 'Completed').length;
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        department: emp.departmentName,
        totalTasks: empTasks.length,
        completedTasks: completed,
        completionRate: empTasks.length ? Math.round((completed / empTasks.length) * 100) : 100,
        performanceScore: emp.performanceScore,
        salary: emp.salary,
        status: emp.status,
      };
    });

    const projectReports = projects.map((p) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id);
      const completed = pTasks.filter((t) => t.status === 'Completed').length;
      return {
        id: p.id,
        name: p.name,
        code: p.code,
        department: p.departmentName,
        manager: p.managerName,
        progress: p.progress,
        budget: p.budget,
        deadline: p.deadline,
        status: p.status,
        riskLevel: p.riskLevel,
        taskCount: pTasks.length,
        completedTaskCount: completed,
      };
    });

    const departmentReports = departments.map((d) => {
      const dEmps = employees.filter((e) => e.departmentId === d.id);
      const dProjects = projects.filter((p) => p.departmentId === d.id);
      return {
        id: d.id,
        name: d.name,
        code: d.code,
        head: d.headName,
        budget: d.budget,
        employees: dEmps.length,
        projects: dProjects.length,
        avgPerformance: dEmps.length
          ? Math.round(dEmps.reduce((acc, e) => acc + e.performanceScore, 0) / dEmps.length)
          : 0,
      };
    });

    res.json({
      generatedAt: new Date().toISOString(),
      employeeReports,
      projectReports,
      departmentReports,
      summary: {
        totalRevenueYield: '$14.2M (Projected Q4)',
        workforceUtilization: '88.4%',
        activeMilestonesOnSchedule: '91.2%',
        complianceReadinessScore: '96/100',
      },
    });
  });

  app.get('/api/reports/export/csv', (req: Request, res: Response) => {
    const { module = 'tasks' } = req.query;

    let headers = '';
    let rows: string[] = [];

    if (module === 'employees') {
      headers = 'ID,Name,Email,Department,Role,Status,Salary,PerformanceScore,JoinDate';
      rows = employees.map(
        (e) =>
          `"${e.id}","${e.name}","${e.email}","${e.departmentName || ''}","${e.role}","${e.status}","${e.salary}","${e.performanceScore}","${e.joinDate}"`
      );
    } else if (module === 'projects') {
      headers = 'ID,Name,Code,Department,Manager,Status,Progress,Budget,Deadline,RiskLevel';
      rows = projects.map(
        (p) =>
          `"${p.id}","${p.name}","${p.code}","${p.departmentName || ''}","${p.managerName || ''}","${p.status}","${p.progress}%","${p.budget}","${p.deadline}","${p.riskLevel}"`
      );
    } else {
      // tasks
      headers = 'ID,Title,Project,Assignee,Priority,Status,Progress,DueDate';
      rows = tasks.map(
        (t) =>
          `"${t.id}","${t.title.replace(/"/g, '""')}","${t.projectName || ''}","${t.assignedToName || ''}","${t.priority}","${t.status}","${t.progress}%","${t.dueDate}"`
      );
    }

    const csvContent = [headers, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="enterprise_${module}_report.csv"`);
    res.send(csvContent);
  });

  // ----------------------------------------------------
  // ADMIN PANEL APIS
  // ----------------------------------------------------
  app.get('/api/admin/users', (req: Request, res: Response) => {
    res.json(users);
  });

  app.post('/api/admin/users', (req: Request, res: Response) => {
    const { name, email, role, status } = req.body;
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name || 'Enterprise User',
      email: email || `user_${Date.now()}@enterprise.ai`,
      role: role || 'Employee',
      status: status || 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    users.push(newUser);
    logActivity('Admin', 'Admin', 'Created system user', newUser.name, 'auth');
    res.status(201).json(newUser);
  });

  app.put('/api/admin/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
  });

  app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
    users = users.filter((u) => u.id !== req.params.id);
    res.json({ success: true });
  });

  app.get('/api/admin/settings', (req: Request, res: Response) => {
    res.json(settings);
  });

  app.put('/api/admin/settings', (req: Request, res: Response) => {
    settings = { ...settings, ...req.body };
    logActivity('Admin', 'Admin', 'Updated enterprise settings', 'System Configuration', 'auth');
    res.json(settings);
  });

  // ----------------------------------------------------
  // AI ASSISTANT API (Chatbot on live enterprise data)
  // ----------------------------------------------------
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const { message, conversationHistory = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message query is required' });
    }

    // Build real-time database summary for context
    const enterpriseSnapshot = {
      totalEmployees: employees.length,
      employees: employees.map((e) => ({
        name: e.name,
        role: e.role,
        department: e.departmentName,
        status: e.status,
        performanceScore: e.performanceScore,
      })),
      projects: projects.map((p) => ({
        name: p.name,
        progress: `${p.progress}%`,
        status: p.status,
        deadline: p.deadline,
        riskLevel: p.riskLevel,
        manager: p.managerName,
      })),
      tasks: tasks.map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        assignedTo: t.assignedToName,
        project: t.projectName,
        dueDate: t.dueDate,
        progress: `${t.progress}%`,
      })),
      departments: departments.map((d) => ({
        name: d.name,
        code: d.code,
        head: d.headName,
        budget: `$${d.budget.toLocaleString()}`,
      })),
      urgentPendingTasks: tasks.filter((t) => t.status !== 'Completed' && (t.priority === 'Urgent' || t.priority === 'High')),
      atRiskProjects: projects.filter((p) => p.riskLevel === 'Critical' || p.riskLevel === 'Medium'),
    };

    let reply = '';

    // If Gemini client is available, leverage gemini-3.8-flash
    if (aiClient) {
      try {
        const systemInstruction = `You are the executive AI Copilot for the "AI-Powered Integrated Enterprise Management and Automation Platform".
You have direct, real-time read access to the organization's enterprise database.
Here is the current live enterprise database snapshot in JSON:
${JSON.stringify(enterpriseSnapshot, null, 2)}

Provide concise, highly accurate, professional, and actionable business answers.
Use markdown formatting with bolding, bullet points, and clean tables if appropriate.
Address specific queries about employees, tasks, projects, deadlines, workloads, and department metrics directly from the data.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        reply = response.text || '';
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to intelligent enterprise engine:', err?.message || err);
      }
    }

    // Intelligent heuristic fallback if Gemini is offline or API key is unset
    if (!reply) {
      const q = message.toLowerCase();

      if (q.includes('pending task') || q.includes('pending work') || q.includes('unfinished task')) {
        const pending = tasks.filter((t) => t.status !== 'Completed');
        const urgent = pending.filter((t) => t.priority === 'Urgent' || t.priority === 'High');
        reply = `📋 **Pending Enterprise Tasks Summary**\n\nThere are currently **${pending.length} pending tasks** across all active projects:\n\n` +
          `**High Priority & Urgent Tasks (${urgent.length}):**\n` +
          urgent
            .map(
              (t) =>
                `• **[${t.priority.toUpperCase()}]** *${t.title}*\n  ↳ Assignee: **${t.assignedToName}** | Project: *${t.projectName}* | Due: **${t.dueDate}** (${t.progress}% complete)`
            )
            .join('\n\n') +
          `\n\n💡 *Recommendation:* Focus resources on tasks due this week to avoid milestone slippage.`;
      } else if (q.includes('highest progress') || q.includes('top project') || q.includes('best project')) {
        const sorted = [...projects].sort((a, b) => b.progress - a.progress);
        const top = sorted[0];
        reply = `🚀 **Project Progress Leader**\n\nThe project with the highest completion progress is **${top.name}** at **${top.progress}% completion**.\n\n` +
          `• **Manager:** ${top.managerName}\n` +
          `• **Department:** ${top.departmentName}\n` +
          `• **Status:** ${top.status} (Risk Level: **${top.riskLevel}**)\n` +
          `• **Target Deadline:** ${top.deadline}\n\n` +
          `*Runner-ups:* ` +
          sorted.slice(1, 3).map((p) => `**${p.name}** (${p.progress}%)`).join(', ');
      } else if (q.includes('today') || q.includes('summary of today') || q.includes('recent activit')) {
        reply = `📅 **Executive Operations Summary for Today**\n\n` +
          `• **Active Workforce:** ${employees.filter((e) => e.status === 'Active' || e.status === 'Remote').length} of ${employees.length} employees checked in (1 on leave).\n` +
          `• **Active Initiatives:** ${projects.filter((p) => p.status === 'Active').length} enterprise projects underway.\n` +
          `• **Recent Key Milestone:** Sarah Jenkins advanced the *Gemini 3.8 Flash model integration* to 85% completion.\n` +
          `• **SOC-2 Audit Status:** Penetration testing verified at 100% completion with zero unresolved CVEs.\n` +
          `• **Attention Required:** *Global Enterprise Expansion Q4* is marked at **Critical Risk** with deadline on Oct 31.`;
      } else if (q.includes('employee') || q.includes('who is') || q.includes('workload')) {
        const activeCount = employees.filter((e) => e.status === 'Active').length;
        const remoteCount = employees.filter((e) => e.status === 'Remote').length;
        reply = `👥 **Enterprise Workforce Overview**\n\n` +
          `• **Total Headcount:** ${employees.length} staff members across ${departments.length} departments.\n` +
          `• **Status Distribution:** ${activeCount} On-Site Active, ${remoteCount} Remote, 1 On Leave.\n` +
          `• **Top Performing Engineers:**\n` +
          employees
            .filter((e) => e.performanceScore >= 94)
            .map((e) => `  - **${e.name}** (${e.role}) — ${e.performanceScore}/100 Index`)
            .join('\n') +
          `\n\n💡 Use the **AI Automation Center** to run an automated Employee Workload Audit.`;
      } else if (q.includes('risk') || q.includes('bottleneck') || q.includes('danger')) {
        const criticalProjects = projects.filter((p) => p.riskLevel === 'Critical' || p.riskLevel === 'Medium');
        reply = `⚠️ **AI Risk & Bottleneck Analysis**\n\n` +
          `Identified **${criticalProjects.length} projects** requiring executive oversight:\n\n` +
          criticalProjects
            .map(
              (p) =>
                `• **${p.name}** [${p.riskLevel.toUpperCase()} RISK]\n  ↳ Progress: **${p.progress}%** | Deadline: **${p.deadline}** | Manager: **${p.managerName}**\n  ↳ *Issue:* Velocity is currently lagging the scheduled burn-down timeline.`
            )
            .join('\n\n') +
          `\n\n💡 *Action Suggestion:* Reallocate 1 frontend developer and 1 sales specialist from completed initiatives.`;
      } else {
        reply = `🤖 **Enterprise AI Copilot**\n\nI have analyzed your query against the active organizational database:\n\n` +
          `• **Active Projects:** ${projects.length} initiatives ($${(departments.reduce((a, b) => a + b.budget, 0) / 1000000).toFixed(1)}M total budget)\n` +
          `• **Pending Tasks:** ${tasks.filter((t) => t.status !== 'Completed').length} total (${tasks.filter((t) => t.priority === 'Urgent').length} urgent)\n` +
          `• **Total Headcount:** ${employees.length} employees across ${departments.length} departments\n\n` +
          `You can ask me specific questions such as:\n` +
          `• *"Show pending tasks"* or *"Who is working on the cloud migration?"*\n` +
          `• *"Which project has the highest progress?"*\n` +
          `• *"Give me a summary of today's activities."*\n` +
          `• *"Detect upcoming project risks and deadlines."*`;
      }
    }

    logActivity('Admin', 'Admin', 'Consulted AI Copilot', `Query: "${message.slice(0, 30)}..."`, 'ai');

    return res.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  });

  // ----------------------------------------------------
  // AI AUTOMATION WORKFLOWS API
  // ----------------------------------------------------
  app.post('/api/ai/automate', (req: Request, res: Response) => {
    const { action } = req.body;

    if (action === 'prioritize_tasks') {
      // Re-rank and score tasks based on deadline proximity and priority
      const now = new Date();
      tasks.forEach((task) => {
        const due = new Date(task.dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));

        let score = 50;
        if (diffDays <= 3) score += 35;
        else if (diffDays <= 7) score += 20;

        if (task.priority === 'Urgent') score += 25;
        else if (task.priority === 'High') score += 15;

        if (task.progress < 30) score += 10;
        task.aiPriorityScore = Math.min(100, score);

        // Auto-elevate priority if due in <= 3 days and still To Do
        if (diffDays <= 3 && task.status === 'To Do' && task.priority !== 'Urgent') {
          task.priority = 'Urgent';
        }
      });

      logActivity('AI Engine', 'Autonomous Agent', 'Executed Task Prioritization Matrix', 'All Active Tasks', 'ai');

      return res.json({
        success: true,
        message: 'AI Task Prioritization Matrix completed. Tasks rescored based on deadline urgency and progress.',
        tasks,
      });
    }

    if (action === 'workload_audit') {
      // Scan employee task distribution
      const employeeLoads = employees.map((emp) => {
        const assignedTasks = tasks.filter((t) => t.assignedToId === emp.id && t.status !== 'Completed');
        const urgentCount = assignedTasks.filter((t) => t.priority === 'Urgent' || t.priority === 'High').length;
        let loadLevel: 'Balanced' | 'High' | 'Overloaded' = 'Balanced';
        if (assignedTasks.length >= 4 || urgentCount >= 2) loadLevel = 'Overloaded';
        else if (assignedTasks.length >= 3) loadLevel = 'High';

        return {
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.departmentName,
          activeTasks: assignedTasks.length,
          urgentTasks: urgentCount,
          loadLevel,
          recommendation:
            loadLevel === 'Overloaded'
              ? 'Reassign at least 1 high-priority task to available team members.'
              : loadLevel === 'High'
              ? 'Monitor sprint capacity before assigning additional epics.'
              : 'Available for new task assignment.',
        };
      });

      logActivity('AI Engine', 'Autonomous Agent', 'Executed Employee Workload Audit', 'HR & Resource Allocation', 'ai');

      return res.json({
        success: true,
        auditDate: new Date().toISOString(),
        employeeLoads,
        overloadedCount: employeeLoads.filter((l) => l.loadLevel === 'Overloaded').length,
      });
    }

    if (action === 'risk_detection') {
      // Identify projects with high danger of deadline overrun
      const risks = projects.map((p) => {
        const pTasks = tasks.filter((t) => t.projectId === p.id);
        const pendingCount = pTasks.filter((t) => t.status !== 'Completed').length;
        const daysLeft = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 3600 * 24));

        let riskScore = 20;
        if (p.progress < 50 && daysLeft <= 25) riskScore += 50;
        if (p.status === 'At Risk') riskScore += 30;

        return {
          projectId: p.id,
          projectName: p.name,
          currentProgress: p.progress,
          daysRemaining: daysLeft,
          pendingTasks: pendingCount,
          calculatedRisk: riskScore > 65 ? 'Critical' : riskScore > 40 ? 'Moderate' : 'Low',
          aiMitigation:
            riskScore > 65
              ? 'Urgent: Schedule scope refinement triage; inject 2 cross-functional engineers.'
              : riskScore > 40
              ? 'Moderate: Daily standups recommended to unblock external dependencies.'
              : 'Project trajectory is healthy.',
        };
      });

      return res.json({
        success: true,
        risks,
        criticalCount: risks.filter((r) => r.calculatedRisk === 'Critical').length,
      });
    }

    if (action === 'generate_report') {
      // Generate autonomous monthly executive report
      const execSummary = {
        title: 'Enterprise Monthly Performance & AI Automation Audit',
        period: 'Current Fiscal Period (Q4 2026)',
        keyMetrics: {
          revenueEfficiency: '$14.2M Pipeline Tracked',
          totalHeadcount: employees.length,
          activeProjects: projects.length,
          taskVelocity: `${Math.round((tasks.filter((t) => t.status === 'Completed').length / tasks.length) * 100)}% Completed`,
        },
        highlights: [
          'Engineering team achieved 100% penetration test compliance for SOC-2 Type II audit.',
          'Autonomous AI Assistant deployed across cloud infrastructure with sub-second response times.',
          'Unified Design System 3.0 successfully merged 14 accessible core components.',
        ],
        criticalAlerts: [
          'Global Enterprise Expansion Q4 requires additional localized ad copy resources before Oct 14.',
        ],
        generatedBy: 'AI Enterprise Intelligence Engine v4.0',
        timestamp: new Date().toISOString(),
      };

      return res.json({
        success: true,
        report: execSummary,
      });
    }

    if (action === 'scan_deadlines') {
      // Generate alerts for tasks due within 3 days
      const imminent = tasks.filter((t) => {
        if (t.status === 'Completed') return false;
        const diff = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24));
        return diff <= 5 && diff >= 0;
      });

      imminent.forEach((task) => {
        notifications.unshift({
          id: `notif-auto-${Date.now()}-${task.id}`,
          title: `Deadline Alert: ${task.title}`,
          message: `Due on ${task.dueDate} (${task.assignedToName})`,
          type: 'deadline',
          priority: 'urgent',
          read: false,
          timestamp: 'Just now',
        });
      });

      return res.json({
        success: true,
        alertsCreated: imminent.length,
        tasks: imminent,
      });
    }

    return res.status(400).json({ error: 'Unknown automation action' });
  });

  // ----------------------------------------------------
  // VITE DEV SERVER INTEGRATION
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Enterprise Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start enterprise server:', err);
  process.exit(1);
});
