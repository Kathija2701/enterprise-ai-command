import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Info,
  Filter,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-rose-400" />
            Enterprise Alert & Dispatch Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time deadline warnings, task delegations, autonomous risk notices, and governance events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <CheckCheck className="h-4 w-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5 overflow-x-auto gap-1">
        {[
          { id: 'all', label: `All Alerts (${notifications.length})` },
          { id: 'unread', label: `Unread (${notifications.filter((n) => !n.read).length})` },
          { id: 'deadline', label: 'Deadlines' },
          { id: 'risk', label: 'AI Risk Warnings' },
          { id: 'task', label: 'Task Assignments' },
          { id: 'system', label: 'System & Compliance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((n) => {
          const isUrgent = n.priority === 'urgent';
          const isHigh = n.priority === 'high';

          return (
            <div
              key={n.id}
              className={`flex items-start justify-between rounded-2xl border p-4.5 transition ${
                !n.read
                  ? 'border-indigo-500/40 bg-indigo-950/20'
                  : 'border-slate-800 bg-slate-900/80 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md ${
                    n.type === 'deadline'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : n.type === 'risk'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : n.type === 'task'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {n.type === 'deadline' ? (
                    <Clock className="h-5 w-5" />
                  ) : n.type === 'risk' ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : n.type === 'task' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <ShieldAlert className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${!n.read ? 'text-white' : 'text-slate-200'}`}>
                      {n.title}
                    </h3>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                        isUrgent
                          ? 'bg-rose-500/20 text-rose-300'
                          : isHigh
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {n.priority}
                    </span>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-3xl">{n.message}</p>
                  <span className="mt-2 block text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 ml-4">
                {!n.read && (
                  <button
                    onClick={() => onMarkRead(n.id)}
                    className="rounded-lg bg-indigo-600/30 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-600/50"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => onDeleteNotification(n.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  title="Dismiss Alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-xs text-slate-500">
            No notifications found under this category
          </div>
        )}
      </div>
    </div>
  );
};
