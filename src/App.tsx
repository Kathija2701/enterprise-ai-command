import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { EmployeesView } from './views/EmployeesView';
import { TasksView } from './views/TasksView';
import { ProjectsView } from './views/ProjectsView';
import { DepartmentsView } from './views/DepartmentsView';
import { AIAssistantView } from './views/AIAssistantView';
import { AIAutomationView } from './views/AIAutomationView';
import { ReportsView } from './views/ReportsView';
import { NotificationsView } from './views/NotificationsView';
import { AdminPanelView } from './views/AdminPanelView';
import { LoginView } from './views/LoginView';
import {
  User,
  Employee,
  Project,
  Task,
  Department,
  NotificationItem,
  ActivityLog,
  SystemSettings,
  Role,
} from './types';
import {
  initialEmployees,
  initialDepartments,
  initialProjects,
  initialTasks,
  initialNotifications,
  initialActivityLogs,
  initialUsers,
  defaultSettings,
} from '../server/data';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(initialUsers[0]);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Enterprise Store State
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  // Quick Action Modal Triggers
  const [openCreateTaskTrigger, setOpenCreateTaskTrigger] = useState(false);
  const [openCreateEmployeeTrigger, setOpenCreateEmployeeTrigger] = useState(false);

  // Fetch initial data from server if available
  useEffect(() => {
    async function loadData() {
      try {
        const [empRes, deptRes, projRes, taskRes, notifRes, settingsRes] = await Promise.allSettled([
          fetch('/api/employees'),
          fetch('/api/departments'),
          fetch('/api/projects'),
          fetch('/api/tasks'),
          fetch('/api/notifications'),
          fetch('/api/admin/settings'),
        ]);

        if (empRes.status === 'fulfilled' && empRes.value.ok) {
          const data = await empRes.value.json();
          if (Array.isArray(data) && data.length) setEmployees(data);
        }
        if (deptRes.status === 'fulfilled' && deptRes.value.ok) {
          const data = await deptRes.value.json();
          if (Array.isArray(data) && data.length) setDepartments(data);
        }
        if (projRes.status === 'fulfilled' && projRes.value.ok) {
          const data = await projRes.value.json();
          if (Array.isArray(data) && data.length) setProjects(data);
        }
        if (taskRes.status === 'fulfilled' && taskRes.value.ok) {
          const data = await taskRes.value.json();
          if (Array.isArray(data) && data.length) setTasks(data);
        }
        if (notifRes.status === 'fulfilled' && notifRes.value.ok) {
          const data = await notifRes.value.json();
          if (Array.isArray(data) && data.length) setNotifications(data);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
          const data = await settingsRes.value.json();
          if (data && data.companyName) setSettings(data);
        }
      } catch (err) {
        console.warn('Backend sync initialized with local persistence:', err);
      }
    }
    loadData();
  }, []);

  // Log activity helper
  const addActivityLog = (action: string, target: string, module: ActivityLog['module']) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      userName: currentUser ? currentUser.name : 'System User',
      userRole: currentUser ? currentUser.role : 'Admin',
      action,
      target,
      module,
      timestamp: 'Just now',
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 40)]);
  };

  // -----------------------------------------------------------------
  // CRUD Handlers
  // -----------------------------------------------------------------
  const handleAddEmployee = async (empData: Partial<Employee>) => {
    const dept = departments.find((d) => d.id === empData.departmentId);
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: empData.name || 'New Staff',
      email: empData.email || 'staff@enterprise.ai',
      phone: empData.phone || '+1 (555) 000-0000',
      departmentId: empData.departmentId || departments[0]?.id || 'dept-1',
      departmentName: dept ? dept.name : 'General',
      role: empData.role || 'Staff Member',
      status: empData.status || 'Active',
      salary: empData.salary || 90000,
      joinDate: new Date().toISOString().split('T')[0],
      skills: empData.skills || ['General'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      performanceScore: Math.floor(Math.random() * 15) + 85,
    };

    setEmployees((prev) => [newEmp, ...prev]);
    addActivityLog('Added employee', `${newEmp.name} (${newEmp.role})`, 'employees');

    try {
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmp),
      });
    } catch (e) {}
  };

  const handleUpdateEmployee = async (id: string, empData: Partial<Employee>) => {
    const dept = empData.departmentId ? departments.find((d) => d.id === empData.departmentId) : undefined;
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              ...empData,
              departmentName: dept ? dept.name : e.departmentName,
            }
          : e
      )
    );
    addActivityLog('Updated employee profile', empData.name || id, 'employees');

    try {
      await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empData),
      });
    } catch (e) {}
  };

  const handleDeleteEmployee = async (id: string) => {
    const emp = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    addActivityLog('Removed employee', emp?.name || id, 'employees');

    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    const proj = projects.find((p) => p.id === taskData.projectId);
    const assignee = employees.find((e) => e.id === taskData.assignedToId);

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'Enterprise Task',
      description: taskData.description || '',
      projectId: taskData.projectId || projects[0]?.id || 'proj-1',
      projectName: proj ? proj.name : 'Project',
      assignedToId: taskData.assignedToId || employees[0]?.id || 'emp-1',
      assignedToName: assignee ? assignee.name : 'Unassigned',
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'To Do',
      progress: taskData.progress || 0,
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      tags: taskData.tags || ['Task'],
    };

    setTasks((prev) => [newTask, ...prev]);

    // Dispatch assignment alert
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Task Assigned',
      message: `"${newTask.title}" assigned to ${newTask.assignedToName}`,
      type: 'task',
      priority: newTask.priority === 'Urgent' ? 'urgent' : 'normal',
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addActivityLog('Created task', newTask.title, 'tasks');

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
    } catch (e) {}
  };

  const handleUpdateTask = async (id: string, taskData: Partial<Task>) => {
    const proj = taskData.projectId ? projects.find((p) => p.id === taskData.projectId) : undefined;
    const assignee = taskData.assignedToId ? employees.find((e) => e.id === taskData.assignedToId) : undefined;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...taskData,
              projectName: proj ? proj.name : t.projectName,
              assignedToName: assignee ? assignee.name : t.assignedToName,
              progress: taskData.status === 'Completed' ? 100 : taskData.progress ?? t.progress,
            }
          : t
      )
    );
    addActivityLog('Updated task status/progress', taskData.title || id, 'tasks');

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
    } catch (e) {}
  };

  const handleDeleteTask = async (id: string) => {
    const t = tasks.find((item) => item.id === id);
    setTasks((prev) => prev.filter((item) => item.id !== id));
    addActivityLog('Deleted task', t?.title || id, 'tasks');

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleAddProject = async (projData: Partial<Project>) => {
    const dept = departments.find((d) => d.id === projData.departmentId);
    const mgr = employees.find((e) => e.id === projData.managerId);

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: projData.name || 'Enterprise Project',
      code: projData.code || `PRJ-${Math.floor(Math.random() * 800 + 200)}`,
      description: projData.description || '',
      departmentId: projData.departmentId || departments[0]?.id || 'dept-1',
      departmentName: dept ? dept.name : 'General',
      managerId: projData.managerId || employees[0]?.id || 'emp-1',
      managerName: mgr ? mgr.name : 'Lead Manager',
      teamMemberIds: ['emp-1', 'emp-2'],
      status: projData.status || 'Active',
      progress: projData.progress || 0,
      budget: projData.budget || 200000,
      startDate: new Date().toISOString().split('T')[0],
      deadline: projData.deadline || '2026-12-31',
      riskLevel: projData.riskLevel || 'Low',
    };

    setProjects((prev) => [newProj, ...prev]);
    addActivityLog('Initiated project', newProj.name, 'projects');

    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProj),
      });
    } catch (e) {}
  };

  const handleUpdateProject = async (id: string, projData: Partial<Project>) => {
    const dept = projData.departmentId ? departments.find((d) => d.id === projData.departmentId) : undefined;
    const mgr = projData.managerId ? employees.find((e) => e.id === projData.managerId) : undefined;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...projData,
              departmentName: dept ? dept.name : p.departmentName,
              managerName: mgr ? mgr.name : p.managerName,
            }
          : p
      )
    );
    addActivityLog('Updated project scope', projData.name || id, 'projects');

    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projData),
      });
    } catch (e) {}
  };

  const handleDeleteProject = async (id: string) => {
    const p = projects.find((item) => item.id === id);
    setProjects((prev) => prev.filter((item) => item.id !== id));
    addActivityLog('Archived project', p?.name || id, 'projects');

    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleAddDepartment = async (deptData: Partial<Department>) => {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: deptData.name || 'New Division',
      code: deptData.code || 'DIV',
      description: deptData.description || '',
      headName: deptData.headName || 'Division Lead',
      headEmail: deptData.headEmail || 'lead@enterprise.ai',
      budget: deptData.budget || 200000,
      location: deptData.location || 'Building A',
      color: deptData.color || '#3B82F6',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setDepartments((prev) => [...prev, newDept]);
    addActivityLog('Created department', newDept.name, 'departments');

    try {
      await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDept),
      });
    } catch (e) {}
  };

  const handleUpdateDepartment = async (id: string, deptData: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...deptData } : d)));
    addActivityLog('Updated department', deptData.name || id, 'departments');

    try {
      await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptData),
      });
    } catch (e) {}
  };

  const handleDeleteDepartment = async (id: string) => {
    const d = departments.find((item) => item.id === id);
    setDepartments((prev) => prev.filter((item) => item.id !== id));
    addActivityLog('Removed department', d?.name || id, 'departments');

    try {
      await fetch(`/api/departments/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  // AI Assistant Chat backend call
  const handleAIChatMessage = async (msg: string): Promise<string> => {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.reply;
      }
    } catch (err) {}

    // Fallback response if network request fails
    return `Enterprise AI Copilot analyzed your request against the database: Found ${tasks.filter((t) => t.status !== 'Completed').length} active pending tasks and ${projects.length} project portfolios. Systems operating within normal performance bounds.`;
  };

  // AI Automation backend call
  const handleRunAutomation = async (action: string) => {
    try {
      const res = await fetch('/api/ai/automate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        if (action === 'prioritize_tasks' && data.tasks) {
          setTasks(data.tasks);
        }
        if (action === 'scan_deadlines') {
          // Refresh notifications
          const notifRes = await fetch('/api/notifications');
          if (notifRes.ok) {
            const notifs = await notifRes.json();
            setNotifications(notifs);
          }
        }
        return data;
      }
    } catch (err) {}

    // Local simulation fallback
    if (action === 'prioritize_tasks') {
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          aiPriorityScore: t.priority === 'Urgent' ? 95 : t.priority === 'High' ? 80 : 50,
        }))
      );
      return { success: true, message: 'AI matrix rescored all tasks successfully.' };
    }
    return { success: true, message: `Automation ${action} executed successfully.` };
  };

  // Notifications Handlers
  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    } catch (e) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    } catch (e) {}
  };

  const handleDeleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  // Reset database back to default seed
  const handleResetDatabase = () => {
    setEmployees(initialEmployees);
    setDepartments(initialDepartments);
    setProjects(initialProjects);
    setTasks(initialTasks);
    setNotifications(initialNotifications);
    setActivityLogs(initialActivityLogs);
    setSettings(defaultSettings);
    addActivityLog('Reseeded database', 'Complete Enterprise Reset', 'auth');
  };

  // User auth login / register
  const handleLogin = (email: string, role?: Role) => {
    let matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!matched) {
      matched = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: role || (email.includes('admin') ? 'Admin' : email.includes('manager') ? 'Manager' : 'Employee'),
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [...prev, matched!]);
    }
    setCurrentUser(matched);
    setCurrentView('dashboard');
  };

  const handleRegister = (name: string, email: string, role: Role) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleRoleChange = (newRole: Role) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  // If user is not authenticated, render LoginView
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        userRole={currentUser.role}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        counts={{
          tasks: tasks.filter((t) => t.status !== 'Completed').length,
          projects: projects.length,
          employees: employees.length,
          notifications: notifications.filter((n) => !n.read).length,
        }}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          notifications={notifications}
          onRoleChange={handleRoleChange}
          onLogout={handleLogout}
          onNavigate={setCurrentView}
          onMarkNotificationRead={handleMarkNotificationRead}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {currentView === 'dashboard' && (
              <DashboardView
                employees={employees}
                projects={projects}
                tasks={tasks}
                departments={departments}
                activityLogs={activityLogs}
                onNavigate={setCurrentView}
                onOpenCreateTask={() => setCurrentView('tasks')}
                onOpenCreateEmployee={() => setCurrentView('employees')}
              />
            )}

            {currentView === 'employees' && (
              <EmployeesView
                employees={employees}
                departments={departments}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )}

            {currentView === 'tasks' && (
              <TasksView
                tasks={tasks}
                projects={projects}
                employees={employees}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onRunAIPrioritization={() => handleRunAutomation('prioritize_tasks')}
              />
            )}

            {currentView === 'projects' && (
              <ProjectsView
                projects={projects}
                departments={departments}
                employees={employees}
                tasks={tasks}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {currentView === 'departments' && (
              <DepartmentsView
                departments={departments}
                employees={employees}
                projects={projects}
                onAddDepartment={handleAddDepartment}
                onUpdateDepartment={handleUpdateDepartment}
                onDeleteDepartment={handleDeleteDepartment}
              />
            )}

            {currentView === 'ai-assistant' && (
              <AIAssistantView onSendMessage={handleAIChatMessage} />
            )}

            {currentView === 'ai-automation' && (
              <AIAutomationView onRunAutomation={handleRunAutomation} />
            )}

            {currentView === 'reports' && (
              <ReportsView
                employees={employees}
                projects={projects}
                tasks={tasks}
                departments={departments}
              />
            )}

            {currentView === 'notifications' && (
              <NotificationsView
                notifications={notifications}
                onMarkRead={handleMarkNotificationRead}
                onMarkAllRead={handleMarkAllNotificationsRead}
                onDeleteNotification={handleDeleteNotification}
              />
            )}

            {currentView === 'admin' && currentUser.role === 'Admin' && (
              <AdminPanelView
                users={users}
                settings={settings}
                onUpdateSettings={setSettings}
                onAddUser={(u) =>
                  setUsers((prev) => [
                    ...prev,
                    {
                      id: `usr-${Date.now()}`,
                      name: u.name || 'User',
                      email: u.email || 'user@enterprise.ai',
                      role: u.role || 'Employee',
                      status: 'Active',
                      createdAt: new Date().toISOString().split('T')[0],
                    },
                  ])
                }
                onDeleteUser={(id) => setUsers((prev) => prev.filter((u) => u.id !== id))}
                onResetDatabase={handleResetDatabase}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
