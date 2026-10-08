import React from 'react';
import {
  Users,
  Briefcase,
  CheckSquare,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  Building,
  DollarSign,
  Activity,
  Plus,
} from 'lucide-react';
import { Employee, Project, Task, Department, ActivityLog } from '../types';
import { ProjectProgressChart, DepartmentBudgetChart, TaskDistributionChart } from '../components/Charts';

interface DashboardViewProps {
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
  departments: Department[];
  activityLogs: ActivityLog[];
  onNavigate: (view: string) => void;
  onOpenCreateTask: () => void;
  onOpenCreateEmployee: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  projects,
  tasks,
  departments,
  activityLogs,
  onNavigate,
  onOpenCreateTask,
  onOpenCreateEmployee,
}) => {
  const activeEmployees = employees.filter((e) => e.status !== 'On Leave').length;
  const activeProjects = projects.filter((p) => p.status === 'Active').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const urgentTasks = tasks.filter((t) => t.priority === 'Urgent' && t.status !== 'Completed').length;
  const criticalProjects = projects.filter((p) => p.riskLevel === 'Critical');

  const totalBudget = departments.reduce((acc, d) => acc + d.budget, 0);
  const avgPerformance = Math.round(
    employees.reduce((acc, e) => acc + (e.performanceScore || 0), 0) / (employees.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Enterprise Command Center
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              Live Systems
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time workforce monitoring, milestone tracking, and autonomous AI recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('ai-automation')}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-600/30"
          >
            <Zap className="h-4 w-4 text-indigo-400" />
            <span>Run AI Auto-Audit</span>
          </button>
          <button
            onClick={onOpenCreateTask}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
          <button
            onClick={onOpenCreateEmployee}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* AI Live Insights Alert Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-purple-950/40 to-slate-900 p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                  Autonomous AI Strategic Insight
                </span>
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                  Updated Today
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-200">
                Enterprise throughput is at <strong className="text-white">78% efficiency</strong>. Detected{' '}
                <strong className="text-amber-300">{urgentTasks} urgent tasks</strong> due within 5 days and{' '}
                <strong className="text-rose-300">{criticalProjects.length} project</strong> requiring capacity rebalancing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-100 shadow"
            >
              Consult Copilot
            </button>
            <button
              onClick={() => onNavigate('ai-automation')}
              className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/40"
            >
              Auto-Resolve
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Employees */}
        <div
          onClick={() => onNavigate('employees')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-indigo-500/50 hover:bg-slate-850 hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Workforce</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{employees.length}</span>
            <span className="text-[11px] font-semibold text-emerald-400">{activeEmployees} active</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{departments.length} departments</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
          </div>
        </div>

        {/* Active Projects */}
        <div
          onClick={() => onNavigate('projects')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-amber-500/50 hover:bg-slate-850 hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Projects</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{activeProjects}</span>
            {criticalProjects.length > 0 ? (
              <span className="text-[11px] font-semibold text-rose-400">{criticalProjects.length} at risk</span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-400">All on track</span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{projects.length} total portfolios</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-400 transition" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div
          onClick={() => onNavigate('tasks')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-emerald-500/50 hover:bg-slate-850 hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Tasks</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{pendingTasks}</span>
            <span className="text-[11px] font-semibold text-indigo-400">{completedTasks} completed</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{urgentTasks} urgent priority</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-400 transition" />
          </div>
        </div>

        {/* Department Budget & Efficiency */}
        <div
          onClick={() => onNavigate('departments')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-purple-500/50 hover:bg-slate-850 hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Performance Index</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{avgPerformance}%</span>
            <span className="text-[11px] font-semibold text-emerald-400">+4.2% vs Q3</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>${(totalBudget / 1000000).toFixed(2)}M Allocated</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-purple-400 transition" />
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project Progress Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-400" />
                Strategic Initiative Progress
              </h2>
              <p className="text-[11px] text-slate-400">Live milestone completion and delivery risk</p>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View All ({projects.length})
            </button>
          </div>
          <ProjectProgressChart projects={projects} />
        </div>

        {/* Task Velocity Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                  Task Lifecycle Status
                </h2>
                <p className="text-[11px] text-slate-400">Active distribution across sprint stages</p>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Board
              </button>
            </div>
            <TaskDistributionChart tasks={tasks} />
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Sprint Velocity Target:</span>
              <span className="font-mono text-emerald-400 font-bold">85% complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Department Budget Allocation & Recent Activity Stream */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Department Budget Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-400" />
                Department Capital Budget
              </h2>
              <p className="text-[11px] text-slate-400">Resource allocation across {departments.length} divisions</p>
            </div>
            <button
              onClick={() => onNavigate('departments')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Details
            </button>
          </div>
          <DepartmentBudgetChart departments={departments} />
        </div>

        {/* Recent Enterprise Activities */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-400" />
                Recent System Activity Log
              </h2>
              <p className="text-[11px] text-slate-400">Real-time audit trail of actions across platform</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Audit Enabled</span>
          </div>

          <div className="space-y-2.5">
            {activityLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl bg-slate-850/60 p-3 text-xs transition hover:bg-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-[10px]">
                    {log.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{log.userName}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] text-slate-400">
                        {log.userRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {log.action}: <span className="text-indigo-300 font-medium">{log.target}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
