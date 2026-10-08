import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  DollarSign,
  Award,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Employee, Department } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  departments: Department[];
  onAddEmployee: (emp: Partial<Employee>) => void;
  onUpdateEmployee: (id: string, emp: Partial<Employee>) => void;
  onDeleteEmployee: (id: string) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  departments,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    role: '',
    status: 'Active' as Employee['status'],
    salary: 95000,
    skills: '',
  });

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      departmentId: departments[0]?.id || '',
      role: '',
      status: 'Active',
      salary: 110000,
      skills: 'React, TypeScript, Cloud, Collaboration',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      departmentId: emp.departmentId,
      role: emp.role,
      status: emp.status,
      salary: emp.salary,
      skills: emp.skills.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.departmentId) return;

    const payload = {
      ...formData,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (editingEmployee) {
      onUpdateEmployee(editingEmployee.id, payload);
    } else {
      onAddEmployee(payload);
    }
    setIsModalOpen(false);
  };

  // Filter Employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept === 'all' || emp.departmentId === selectedDept;
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      (emp.departmentName && emp.departmentName.toLowerCase().includes(q));

    return matchesDept && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            Enterprise Workforce Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage employees, performance indices, department assignments, and attendance status.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Remote">Remote</option>
            <option value="On Leave">On Leave</option>
          </select>

          {/* Grid / Table Toggle */}
          <div className="flex rounded-xl border border-slate-700 bg-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg transition hover:border-indigo-500/50 hover:bg-slate-850 hover:shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="h-12 w-12 rounded-xl object-cover ring-2 ring-indigo-500/30"
                    />
                    <div>
                      <h2 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                        {emp.name}
                      </h2>
                      <p className="text-xs text-slate-400">{emp.role}</p>
                      <span className="inline-block mt-0.5 text-[11px] font-semibold text-indigo-400">
                        {emp.departmentName}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      emp.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : emp.status === 'Remote'
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                {/* Skills tags */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {emp.skills.slice(0, 3).map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {emp.skills.length > 3 && (
                    <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                      +{emp.skills.length - 3}
                    </span>
                  )}
                </div>

                {/* Contact and Performance */}
                <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]">Performance Score</span>
                    <span className="font-mono font-bold text-emerald-400">{emp.performanceScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3">
                <button
                  onClick={() => setViewingEmployee(emp)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                  title="View Profile Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(emp)}
                  className="rounded-lg p-1.5 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
                  title="Edit Employee"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove ${emp.name}?`)) {
                      onDeleteEmployee(emp.id);
                    }
                  }}
                  className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                  title="Remove Employee"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-850 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Employee</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Performance</th>
                  <th className="px-4 py-3 font-semibold">Salary</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.name} className="h-8 w-8 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-white">{emp.name}</div>
                          <div className="text-[11px] text-slate-400">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-indigo-300">{emp.departmentName}</td>
                    <td className="px-4 py-3 font-medium">{emp.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : emp.status === 'Remote'
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                      {emp.performanceScore}/100
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      ${emp.salary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingEmployee(emp)}
                          className="rounded p-1 text-slate-400 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="rounded p-1 text-indigo-400 hover:text-indigo-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${emp.name}?`)) onDeleteEmployee(emp.id);
                          }}
                          className="rounded p-1 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingEmployee ? 'Edit Employee Details' : 'Add New Enterprise Employee'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Role / Position *</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Annual Salary ($)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Attendance / Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Active">Active (On-Site)</option>
                    <option value="Remote">Remote</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Core Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Python, Cloud, Architecture, Leadership"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
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
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  {editingEmployee ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Details Drawer */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={viewingEmployee.avatar}
                  alt={viewingEmployee.name}
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-indigo-500"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{viewingEmployee.name}</h3>
                  <p className="text-xs text-slate-400">{viewingEmployee.role}</p>
                  <p className="text-xs text-indigo-400">{viewingEmployee.departmentName}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  viewingEmployee.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {viewingEmployee.status}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Email:</span>
                <span className="text-white font-medium">{viewingEmployee.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Phone:</span>
                <span className="text-white font-medium">{viewingEmployee.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Annual Compensation:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ${viewingEmployee.salary.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Joined Organization:</span>
                <span className="text-slate-200">{viewingEmployee.joinDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Performance Index:</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {viewingEmployee.performanceScore} / 100
                </span>
              </div>

              <div>
                <span className="block text-slate-400 mb-1.5">Expertise & Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {viewingEmployee.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 text-[10px] text-indigo-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingEmployee(null)}
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
