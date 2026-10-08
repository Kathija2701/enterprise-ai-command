export type Role = 'Admin' | 'Manager' | 'Employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  avatar?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headName: string;
  headEmail: string;
  budget: number;
  location: string;
  color: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName?: string;
  role: string; // e.g. Senior Software Engineer
  status: 'Active' | 'On Leave' | 'Remote';
  salary: number;
  joinDate: string;
  skills: string[];
  avatar: string;
  performanceScore: number; // 0-100
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName?: string;
  assignedToId: string;
  assignedToName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0 - 100
  dueDate: string;
  createdAt: string;
  tags?: string[];
  aiPriorityScore?: number;
}

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'At Risk';

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentId: string;
  departmentName?: string;
  managerId: string;
  managerName?: string;
  teamMemberIds: string[];
  status: ProjectStatus;
  progress: number; // 0 - 100
  budget: number;
  startDate: string;
  deadline: string;
  riskLevel: 'Low' | 'Medium' | 'Critical';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'task' | 'project' | 'risk' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  timestamp: string;
  linkUrl?: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  target: string;
  module: 'employees' | 'tasks' | 'projects' | 'departments' | 'reports' | 'auth' | 'ai';
  timestamp: string;
}

export interface SystemSettings {
  companyName: string;
  contactEmail: string;
  workingHours: string;
  currency: string;
  aiAutoScan: boolean;
  aiAutoScanFrequency: string; // "Daily", "Hourly", "Realtime"
  deadlineAlertThresholdDays: number;
  workloadThresholdTasks: number;
  requireTwoFactor: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  dataReference?: any;
}
