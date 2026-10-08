import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Users,
  Briefcase,
  CheckSquare,
  Building,
  TrendingUp,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';
import { Employee, Project, Task, Department } from '../types';

interface ReportsViewProps {
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
  departments: Department[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  employees,
  projects,
  tasks,
  departments,
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'projects' | 'tasks' | 'departments' | 'monthly'>('monthly');

  // CSV Exporter helper
  const handleExportCSV = (type: string) => {
    let headers = '';
    let rows: string[] = [];

    if (type === 'employees') {
      headers = 'ID,Name,Email,Department,Role,Status,Salary,PerformanceScore,JoinDate';
      rows = employees.map(
        (e) =>
          `"${e.id}","${e.name}","${e.email}","${e.departmentName || ''}","${e.role}","${e.status}","${e.salary}","${e.performanceScore}","${e.joinDate}"`
      );
    } else if (type === 'projects') {
      headers = 'ID,Name,Code,Department,Manager,Status,Progress,Budget,Deadline,RiskLevel';
      rows = projects.map(
        (p) =>
          `"${p.id}","${p.name}","${p.code}","${p.departmentName || ''}","${p.managerName || ''}","${p.status}","${p.progress}%","${p.budget}","${p.deadline}","${p.riskLevel}"`
      );
    } else if (type === 'departments') {
      headers = 'ID,Name,Code,HeadName,Budget,Location';
      rows = departments.map(
        (d) => `"${d.id}","${d.name}","${d.code}","${d.headName}","${d.budget}","${d.location}"`
      );
    } else {
      headers = 'ID,Title,Project,Assignee,Priority,Status,Progress,DueDate';
      rows = tasks.map(
        (t) =>
          `"${t.id}","${t.title.replace(/"/g, '""')}","${t.projectName || ''}","${t.assignedToName || ''}","${t.priority}","${t.status}","${t.progress}%","${t.dueDate}"`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `enterprise_${type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-cyan-400" />
            Executive Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit logs, performance metrics, and compliance exports in CSV & printable PDF format.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExportCSV(activeTab === 'monthly' ? 'tasks' : activeTab)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg transition hover:brightness-110"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5 overflow-x-auto gap-1">
        {[
          { id: 'monthly', label: 'Monthly Executive Summary' },
          { id: 'employees', label: 'Workforce Productivity' },
          { id: 'projects', label: 'Project Milestones' },
          { id: 'tasks', label: 'Task Execution' },
          { id: 'departments', label: 'Department Budgets' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        {/* Monthly Summary Tab */}
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Official Executive Briefing
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">
                    Enterprise Operations & Performance Report (Q4 2026)
                  </h2>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div className="font-mono">Generated: October 2026</div>
                  <span className="text-emerald-400 font-semibold">Status: Audit Verified</span>
                </div>
              </div>
            </div>

            {/* Core KPI metrics summary cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-850 p-4">
                <span className="text-xs text-slate-400">Revenue Yield Target</span>
                <div className="mt-1 text-xl font-extrabold font-mono text-emerald-400">$14.2M</div>
                <span className="text-[10px] text-slate-500">Tracked in Sales pipeline</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-850 p-4">
                <span className="text-xs text-slate-400">Workforce Utilization</span>
                <div className="mt-1 text-xl font-extrabold font-mono text-white">88.4%</div>
                <span className="text-[10px] text-emerald-400">Across 6 divisions</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-850 p-4">
                <span className="text-xs text-slate-400">Task Completion Rate</span>
                <div className="mt-1 text-xl font-extrabold font-mono text-cyan-400">
                  {Math.round((tasks.filter((t) => t.status === 'Completed').length / tasks.length) * 100)}%
                </div>
                <span className="text-[10px] text-slate-500">Velocity on target</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-850 p-4">
                <span className="text-xs text-slate-400">Compliance Readiness</span>
                <div className="mt-1 text-xl font-extrabold font-mono text-purple-400">96 / 100</div>
                <span className="text-[10px] text-slate-500">SOC-2 Type II Certified</span>
              </div>
            </div>

            {/* Executive Highlights & AI Analysis */}
            <div className="space-y-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs text-slate-200">
              <h3 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                Autonomous AI Strategic Findings
              </h3>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
                <li>
                  <strong>Engineering Delivery:</strong> Core cloud infrastructure migration is 74%
                  complete. Zero critical downtime incidents recorded during sprint operations.
                </li>
                <li>
                  <strong>AI Copilot Integration:</strong> Assistant API response latency averaged 240ms,
                  handling employee status, resource queries, and project audits autonomously.
                </li>
                <li>
                  <strong>Resource Recommendations:</strong> Reallocate 1 frontend engineer from Design System
                  to Global Enterprise Expansion to mitigate the Oct 31 critical deadline.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Workforce Productivity Tab */}
        {activeTab === 'employees' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2.5 font-semibold">Staff Member</th>
                  <th className="py-2.5 font-semibold">Department</th>
                  <th className="py-2.5 font-semibold">Role</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Performance Rating</th>
                  <th className="py-2.5 font-semibold">Compensation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td className="py-3 font-bold text-white">{e.name}</td>
                    <td className="py-3 text-indigo-300">{e.departmentName}</td>
                    <td className="py-3">{e.role}</td>
                    <td className="py-3">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold">
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-400">
                      {e.performanceScore} / 100
                    </td>
                    <td className="py-3 font-mono text-slate-300">${e.salary.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2.5 font-semibold">Code</th>
                  <th className="py-2.5 font-semibold">Project Name</th>
                  <th className="py-2.5 font-semibold">Department</th>
                  <th className="py-2.5 font-semibold">Progress</th>
                  <th className="py-2.5 font-semibold">Budget</th>
                  <th className="py-2.5 font-semibold">Deadline</th>
                  <th className="py-2.5 font-semibold">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 font-mono font-bold text-amber-400">{p.code}</td>
                    <td className="py-3 font-bold text-white">{p.name}</td>
                    <td className="py-3 text-indigo-300">{p.departmentName}</td>
                    <td className="py-3 font-mono font-bold text-slate-100">{p.progress}%</td>
                    <td className="py-3 font-mono">${p.budget.toLocaleString()}</td>
                    <td className="py-3 font-mono">{p.deadline}</td>
                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          p.riskLevel === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300'
                            : p.riskLevel === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {p.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2.5 font-semibold">Task Title</th>
                  <th className="py-2.5 font-semibold">Project</th>
                  <th className="py-2.5 font-semibold">Assignee</th>
                  <th className="py-2.5 font-semibold">Priority</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td className="py-3 font-bold text-white max-w-xs">{t.title}</td>
                    <td className="py-3 text-indigo-300">{t.projectName}</td>
                    <td className="py-3 font-medium text-slate-300">{t.assignedToName}</td>
                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          t.priority === 'Urgent'
                            ? 'bg-rose-500/20 text-rose-300'
                            : t.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3">{t.status}</td>
                    <td className="py-3 font-mono text-slate-400">{t.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2.5 font-semibold">Code</th>
                  <th className="py-2.5 font-semibold">Department</th>
                  <th className="py-2.5 font-semibold">Division Head</th>
                  <th className="py-2.5 font-semibold">Quarterly Budget</th>
                  <th className="py-2.5 font-semibold">Staff Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td className="py-3 font-mono font-bold text-purple-400">{d.code}</td>
                    <td className="py-3 font-bold text-white">{d.name}</td>
                    <td className="py-3 text-slate-300">{d.headName}</td>
                    <td className="py-3 font-mono text-emerald-400 font-bold">
                      ${d.budget.toLocaleString()}
                    </td>
                    <td className="py-3">
                      {employees.filter((e) => e.departmentId === d.id).length} Personnel
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
