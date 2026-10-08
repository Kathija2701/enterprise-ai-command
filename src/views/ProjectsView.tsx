import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  DollarSign,
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  Eye,
  Building,
  Target,
} from 'lucide-react';
import { Project, Department, Employee, Task } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  departments: Department[];
  employees: Employee[];
  tasks: Task[];
  onAddProject: (proj: Partial<Project>) => void;
  onUpdateProject: (id: string, proj: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  departments,
  employees,
  tasks,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    departmentId: '',
    managerId: '',
    budget: 200000,
    deadline: '',
    riskLevel: 'Low' as Project['riskLevel'],
    status: 'Active' as Project['status'],
    progress: 0,
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      code: `PRJ-${Math.floor(Math.random() * 800 + 200)}`,
      description: '',
      departmentId: departments[0]?.id || '',
      managerId: employees[0]?.id || '',
      budget: 250000,
      deadline: '2026-12-31',
      riskLevel: 'Low',
      status: 'Active',
      progress: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name,
      code: proj.code,
      description: proj.description,
      departmentId: proj.departmentId,
      managerId: proj.managerId,
      budget: proj.budget,
      deadline: proj.deadline,
      riskLevel: proj.riskLevel,
      status: proj.status,
      progress: proj.progress,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.departmentId) return;

    if (editingProject) {
      onUpdateProject(editingProject.id, formData);
    } else {
      onAddProject(formData);
    }
    setIsModalOpen(false);
  };

  // Filter Projects
  const filteredProjects = projects.filter((p) => {
    const matchesDept = selectedDept === 'all' || p.departmentId === selectedDept;
    const matchesStat = selectedStatus === 'all' || p.status === selectedStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.managerName && p.managerName.toLowerCase().includes(q));

    return matchesDept && matchesStat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-amber-400" />
            Strategic Project Portfolios
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitor initiative roadmaps, milestones, resource utilization, and delivery risk factors.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/30 transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, code, manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="At Risk">At Risk</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((proj) => {
          const projTasks = tasks.filter((t) => t.projectId === proj.id);
          const completedCount = projTasks.filter((t) => t.status === 'Completed').length;
          const isCritical = proj.riskLevel === 'Critical';
          const isMed = proj.riskLevel === 'Medium';

          return (
            <div
              key={proj.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg transition hover:border-amber-500/50 hover:bg-slate-850 hover:shadow-xl"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {proj.code}
                    </span>
                    <h2 className="mt-2 text-sm font-bold text-white group-hover:text-amber-300 transition">
                      {proj.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{proj.departmentName}</p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300'
                        : isMed
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {proj.riskLevel} Risk
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-300 line-clamp-2">{proj.description}</p>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">Milestone Progress</span>
                    <span className="font-mono font-bold text-white">{proj.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isCritical ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    <span>${proj.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{proj.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                    <span className="truncate">Manager: <strong className="text-slate-200">{proj.managerName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  {completedCount} of {projTasks.length} tasks complete
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingProject(proj)}
                    className="rounded p-1.5 text-slate-400 hover:text-white"
                    title="View Project Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(proj)}
                    className="rounded p-1.5 text-amber-400 hover:text-amber-300"
                    title="Edit Project"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete project "${proj.name}"?`)) onDeleteProject(proj.id);
                    }}
                    className="rounded p-1.5 text-rose-400 hover:text-rose-300"
                    title="Delete Project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingProject ? 'Edit Project Scope' : 'Initiate New Enterprise Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Project Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Scope & Objectives</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Lead Manager</label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Risk Level</label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Milestone Progress:</span>
                  <span className="font-mono text-white font-bold">{formData.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-500 shadow-lg shadow-amber-600/30"
                >
                  {editingProject ? 'Save Project' : 'Initiate Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-amber-400">{viewingProject.code}</span>
                <h3 className="text-lg font-bold text-white">{viewingProject.name}</h3>
                <p className="text-xs text-indigo-400">{viewingProject.departmentName}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  viewingProject.riskLevel === 'Critical'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {viewingProject.riskLevel} Risk
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">{viewingProject.description}</p>

            <div className="space-y-2 text-xs border-y border-slate-800 py-3 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Project Manager:</span>
                <span className="text-white font-medium">{viewingProject.managerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Budget:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ${viewingProject.budget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deadline:</span>
                <span className="font-mono text-slate-200">{viewingProject.deadline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Linked Tasks:</span>
                <span className="text-slate-200">
                  {tasks.filter((t) => t.projectId === viewingProject.id).length} Active Tasks
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingProject(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
