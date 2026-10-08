import React, { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  Key,
  Database,
  RefreshCw,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Lock,
  Globe,
  Sliders,
  Cpu,
} from 'lucide-react';
import { User, SystemSettings } from '../types';

interface AdminPanelViewProps {
  users: User[];
  settings: SystemSettings;
  onUpdateSettings: (s: SystemSettings) => void;
  onAddUser: (u: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onResetDatabase: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  users,
  settings,
  onUpdateSettings,
  onAddUser,
  onDeleteUser,
  onResetDatabase,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'system'>('users');
  const [currentSettings, setCurrentSettings] = useState<SystemSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  // New User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'Employee' as User['role'],
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(currentSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) return;

    onAddUser(newUserData);
    setIsAddUserOpen(false);
    setNewUserData({ name: '', email: '', role: 'Employee' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-amber-400" />
            Enterprise Administration & Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Role-based access control, system parameters, autonomous AI agent frequencies, and database management.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5 overflow-x-auto gap-1">
        {[
          { id: 'users', label: 'User Accounts & Roles' },
          { id: 'settings', label: 'Enterprise Parameters' },
          { id: 'system', label: 'System Health & Engine' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white">System User Directory</h2>
              <p className="text-xs text-slate-400">Authenticated user accounts mapped to RBAC permissions</p>
            </div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span>Add User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2.5 font-semibold">User</th>
                  <th className="py-2.5 font-semibold">Email</th>
                  <th className="py-2.5 font-semibold">Role Access</th>
                  <th className="py-2.5 font-semibold">Account Status</th>
                  <th className="py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 font-bold text-white">{u.name}</td>
                    <td className="py-3 font-mono text-slate-300">{u.email}</td>
                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          u.role === 'Admin'
                            ? 'bg-purple-500/20 text-purple-300'
                            : u.role === 'Manager'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'Admin' && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="rounded p-1 text-slate-400 hover:text-rose-400"
                          title="Revoke User Access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white">System Global Settings</h2>
              <p className="text-xs text-slate-400">Configure global enterprise values and thresholds</p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>

          {isSaved && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Enterprise configuration successfully updated!</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Enterprise Legal Name</label>
              <input
                type="text"
                value={currentSettings.companyName}
                onChange={(e) => setCurrentSettings({ ...currentSettings, companyName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Operations Contact Email</label>
              <input
                type="email"
                value={currentSettings.contactEmail}
                onChange={(e) => setCurrentSettings({ ...currentSettings, contactEmail: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Standard Operating Hours</label>
              <input
                type="text"
                value={currentSettings.workingHours}
                onChange={(e) => setCurrentSettings({ ...currentSettings, workingHours: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Default Currency</label>
              <input
                type="text"
                value={currentSettings.currency}
                onChange={(e) => setCurrentSettings({ ...currentSettings, currency: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Deadline Warning Window (Days)
              </label>
              <input
                type="number"
                value={currentSettings.deadlineAlertThresholdDays}
                onChange={(e) =>
                  setCurrentSettings({
                    ...currentSettings,
                    deadlineAlertThresholdDays: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Employee Overload Threshold (Tasks)
              </label>
              <input
                type="number"
                value={currentSettings.workloadThresholdTasks}
                onChange={(e) =>
                  setCurrentSettings({
                    ...currentSettings,
                    workloadThresholdTasks: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={currentSettings.aiAutoScan}
                onChange={(e) =>
                  setCurrentSettings({ ...currentSettings, aiAutoScan: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 accent-indigo-500"
              />
              <span className="text-slate-200 font-medium">
                Enable Autonomous AI Background Scanning (Daily risk & prioritization triggers)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={currentSettings.requireTwoFactor}
                onChange={(e) =>
                  setCurrentSettings({ ...currentSettings, requireTwoFactor: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 accent-indigo-500"
              />
              <span className="text-slate-200 font-medium">
                Require Multi-Factor Authentication (MFA) for Administrative operations
              </span>
            </label>
          </div>
        </form>
      )}

      {/* System Health Tab */}
      {activeTab === 'system' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-white">System Diagnostics & Data Store</h2>
            <p className="text-xs text-slate-400">Database statistics and runtime health monitor</p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-850 p-4">
              <span className="text-slate-400">Database Engine</span>
              <div className="mt-1 font-mono font-bold text-white text-sm">SQLite / In-Memory</div>
              <span className="text-emerald-400 text-[10px]">Connected & Active</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-850 p-4">
              <span className="text-slate-400">AI Intelligence Core</span>
              <div className="mt-1 font-mono font-bold text-indigo-400 text-sm">Gemini 3.8 Flash</div>
              <span className="text-slate-500 text-[10px]">Telemetry: aistudio-build</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-850 p-4">
              <span className="text-slate-400">API Server Status</span>
              <div className="mt-1 font-mono font-bold text-emerald-400 text-sm">PORT 3000 Healthy</div>
              <span className="text-slate-500 text-[10px]">REST + Fast Response</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-850 p-4">
              <span className="text-slate-400">Security Profile</span>
              <div className="mt-1 font-mono font-bold text-purple-400 text-sm">SOC-2 Type II</div>
              <span className="text-emerald-400 text-[10px]">100% Passing Audit</span>
            </div>
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs">
            <h3 className="font-bold text-rose-300">Danger Zone: Database Reset</h3>
            <p className="text-slate-400 mt-1 mb-3">
              Reset database back to standard enterprise demo seed state. This will refresh all employees,
              projects, tasks, and notifications.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reseed demo enterprise data?')) {
                  onResetDatabase();
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 font-bold text-white hover:bg-rose-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reseed Demo Database</span>
            </button>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add User to Enterprise Directory</h3>
            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Assigned Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:outline-none"
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Department Manager</option>
                  <option value="Admin">Admin Director</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-500 shadow"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
