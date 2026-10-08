import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Briefcase,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Columns3,
  List as ListIcon,
  Tag,
} from 'lucide-react';
import { Task, Project, Employee, TaskPriority, TaskStatus } from '../types';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  employees: Employee[];
  onAddTask: (task: Partial<Task>) => void;
  onUpdateTask: (id: string, task: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onRunAIPrioritization: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  projects,
  employees,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onRunAIPrioritization,
}) => {
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedToId: '',
    priority: 'Medium' as TaskPriority,
    status: 'To Do' as TaskStatus,
    progress: 0,
    dueDate: '',
    tags: '',
  });

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      projectId: projects[0]?.id || '',
      assignedToId: employees[0]?.id || '',
      priority: 'Medium',
      status: 'To Do',
      progress: 0,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      tags: 'Feature, Sprint',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assignedToId: task.assignedToId,
      priority: task.priority,
      status: task.status,
      progress: task.progress,
      dueDate: task.dueDate,
      tags: task.tags?.join(', ') || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) return;

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    if (editingTask) {
      onUpdateTask(editingTask.id, payload);
    } else {
      onAddTask(payload);
    }
    setIsModalOpen(false);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    onUpdateTask(taskId, {
      status: newStatus,
      progress: newStatus === 'Completed' ? 100 : undefined,
    });
  };

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    const matchesProj = selectedProject === 'all' || t.projectId === selectedProject;
    const matchesPri = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchesStat = selectedStatus === 'all' || t.status === selectedStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.assignedToName && t.assignedToName.toLowerCase().includes(q)) ||
      (t.projectName && t.projectName.toLowerCase().includes(q));

    return matchesProj && matchesPri && matchesStat && matchesSearch;
  });

  const kanbanColumns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'To Do', label: 'To Do', color: 'border-amber-500/50 text-amber-400' },
    { id: 'In Progress', label: 'In Progress', color: 'border-blue-500/50 text-blue-400' },
    { id: 'In Review', label: 'In Review', color: 'border-purple-500/50 text-purple-400' },
    { id: 'Completed', label: 'Completed', color: 'border-emerald-500/50 text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-emerald-400" />
            Task Management & Workflow Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Track execution, assign deliverables, manage sprint backlogs, and run AI automated prioritization.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRunAIPrioritization}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3.5 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-600/30"
          >
            <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span>AI Re-Prioritize</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and View Toggle */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, assignees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Kanban / List Toggle */}
          <div className="flex rounded-xl border border-slate-700 bg-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div key={col.id} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                {/* Column Header */}
                <div className={`flex items-center justify-between border-b pb-3 mb-3 ${col.color}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">{col.label}</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] pr-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group rounded-xl border border-slate-800 bg-slate-850 p-3.5 shadow transition hover:border-indigo-500/50 hover:bg-slate-800"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            task.priority === 'Urgent'
                              ? 'bg-rose-500/20 text-rose-300'
                              : task.priority === 'High'
                              ? 'bg-amber-500/20 text-amber-300'
                              : task.priority === 'Medium'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="rounded p-1 text-slate-400 hover:text-indigo-300"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this task?')) onDeleteTask(task.id);
                            }}
                            className="rounded p-1 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <h3 className="mt-2 text-xs font-bold text-white group-hover:text-indigo-300 transition">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{task.description}</p>

                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-indigo-400 truncate max-w-[120px]">
                          {task.projectName}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500 font-mono">
                          <Clock className="h-3 w-3" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Progress</span>
                          <span className="font-mono font-bold text-slate-200">{task.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              task.status === 'Completed'
                                ? 'bg-emerald-500'
                                : task.progress > 60
                                ? 'bg-indigo-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer: Assignee & Quick Status Shift */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                        <span className="text-[11px] font-medium text-slate-300 truncate max-w-[110px]">
                          👤 {task.assignedToName}
                        </span>

                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 font-medium focus:outline-none"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="In Review">Review</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                      No tasks in this lane
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-850 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Task</th>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Assignee</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Progress</th>
                  <th className="px-4 py-3 font-semibold">Due Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white max-w-xs">{t.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{t.description}</div>
                    </td>
                    <td className="px-4 py-3 text-indigo-300">{t.projectName}</td>
                    <td className="px-4 py-3 font-medium text-slate-300">{t.assignedToName}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
                        className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="In Review">In Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-300">{t.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{t.dueDate}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="rounded p-1 text-indigo-400 hover:text-indigo-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete task "${t.title}"?`)) onDeleteTask(t.id);
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

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingTask ? 'Edit Task Specifications' : 'Create New Enterprise Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct architecture review of microservices"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed criteria, deliverables, dependencies..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Associated Project *</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Assignee</label>
                  <select
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.departmentName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Current Progress:</span>
                  <span className="font-mono text-white font-bold">{formData.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
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
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
                >
                  {editingTask ? 'Save Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
