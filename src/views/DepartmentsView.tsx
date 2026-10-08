import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  MapPin,
  Mail,
  Edit2,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { Department, Employee, Project } from '../types';

interface DepartmentsViewProps {
  departments: Department[];
  employees: Employee[];
  projects: Project[];
  onAddDepartment: (dept: Partial<Department>) => void;
  onUpdateDepartment: (id: string, dept: Partial<Department>) => void;
  onDeleteDepartment: (id: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
  employees,
  projects,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headName: '',
    headEmail: '',
    budget: 250000,
    location: '',
    color: '#3B82F6',
  });

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      headName: '',
      headEmail: '',
      budget: 250000,
      location: 'Building A, Floor 2',
      color: '#8B5CF6',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      headName: dept.headName,
      headEmail: dept.headEmail,
      budget: dept.budget,
      location: dept.location,
      color: dept.color,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    if (editingDept) {
      onUpdateDepartment(editingDept.id, formData);
    } else {
      onAddDepartment(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-400" />
            Organizational Departments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Structure divisions, manage capital budgets, leadership rosters, and performance ratings.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          <span>New Department</span>
        </button>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => {
          const deptEmps = employees.filter((e) => e.departmentId === dept.id);
          const deptProjects = projects.filter((p) => p.departmentId === dept.id);
          const avgScore = deptEmps.length
            ? Math.round(deptEmps.reduce((acc, e) => acc + e.performanceScore, 0) / deptEmps.length)
            : 85;

          return (
            <div
              key={dept.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg transition hover:border-purple-500/50 hover:bg-slate-850 hover:shadow-xl"
            >
              <div>
                {/* Header with color indicator */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl font-bold font-mono text-xs text-white shadow"
                      style={{ backgroundColor: dept.color }}
                    >
                      {dept.code}
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                        {dept.name}
                      </h2>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span>{dept.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="rounded p-1 text-slate-400 hover:text-purple-300"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete department "${dept.name}"?`)) onDeleteDepartment(dept.id);
                      }}
                      className="rounded p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-300 line-clamp-2">{dept.description}</p>

                {/* Head of department */}
                <div className="mt-4 rounded-xl bg-slate-800/60 p-2.5 text-xs text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Department Lead</span>
                  <div className="font-semibold text-white mt-0.5">{dept.headName}</div>
                  <div className="text-[11px] text-indigo-400 flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" /> {dept.headEmail}
                  </div>
                </div>

                {/* Metric Badges */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-center">
                  <div className="rounded-lg bg-slate-800/40 p-2">
                    <span className="block text-base font-extrabold font-mono text-white">
                      {deptEmps.length}
                    </span>
                    <span className="text-[10px] text-slate-400">Staff</span>
                  </div>
                  <div className="rounded-lg bg-slate-800/40 p-2">
                    <span className="block text-base font-extrabold font-mono text-amber-400">
                      {deptProjects.length}
                    </span>
                    <span className="text-[10px] text-slate-400">Projects</span>
                  </div>
                  <div className="rounded-lg bg-slate-800/40 p-2">
                    <span className="block text-base font-extrabold font-mono text-emerald-400">
                      {avgScore}%
                    </span>
                    <span className="text-[10px] text-slate-400">Rating</span>
                  </div>
                </div>
              </div>

              {/* Budget meter footer */}
              <div className="mt-4 border-t border-slate-800/80 pt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Quarterly Budget:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${dept.budget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingDept ? 'Edit Department Specifications' : 'Establish New Department'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Code (2-4 chars) *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Charter & Responsibilities</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department Head Name</label>
                  <input
                    type="text"
                    value={formData.headName}
                    onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Lead Email</label>
                  <input
                    type="email"
                    value={formData.headEmail}
                    onChange={(e) => setFormData({ ...formData, headEmail: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  />
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
                  <label className="block text-slate-400 mb-1">Location / Office</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Theme Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-700 bg-slate-800 p-1 cursor-pointer"
                  />
                </div>
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
                  className="rounded-xl bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                >
                  {editingDept ? 'Save Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
