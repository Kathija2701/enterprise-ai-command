import React, { useState } from 'react';
import {
  Bell,
  Search,
  Sparkles,
  User,
  Shield,
  Briefcase,
  UserCheck,
  ChevronDown,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Clock,
  Menu,
} from 'lucide-react';
import { User as UserType, NotificationItem, Role } from '../types';

interface NavbarProps {
  currentUser: UserType;
  notifications: NotificationItem[];
  onRoleChange: (newRole: Role) => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onToggleSidebar?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  notifications,
  onRoleChange,
  onLogout,
  onNavigate,
  onMarkNotificationRead,
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left section: mobile hamburger & search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden w-64 md:block lg:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, projects, employees, departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700/60 bg-slate-800/80 py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Right section: AI copilot status, notification bell, user profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Copilot shortcut badge */}
        <button
          onClick={() => onNavigate('ai-assistant')}
          className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:border-indigo-500/60 hover:text-white"
        >
          <Sparkles className="h-4 w-4 animate-pulse text-indigo-400" />
          <span className="hidden sm:inline">AI Copilot</span>
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl border border-slate-700/60 bg-slate-800/70 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">System Notifications</span>
                </div>
                <button
                  onClick={() => onNavigate('notifications')}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  View All ({notifications.length})
                </button>
              </div>

              <div className="mt-2 max-h-72 space-overflow-y-auto divide-y divide-slate-800/60 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onMarkNotificationRead(n.id);
                    }}
                    className={`flex cursor-pointer items-start gap-3 p-2.5 text-xs transition rounded-lg hover:bg-slate-800/60 ${
                      !n.read ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'deadline' ? (
                        <Clock className="h-4 w-4 text-amber-400" />
                      ) : n.type === 'risk' ? (
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Role & Profile Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-700/60 bg-slate-800/80 p-1.5 pr-3 text-left transition hover:border-slate-600 hover:bg-slate-800"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'}
              alt={currentUser.name}
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-indigo-500/50"
            />
            <div className="hidden text-left sm:block">
              <div className="text-xs font-bold text-slate-100">{currentUser.name}</div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                  currentUser.role === 'Admin' ? 'bg-purple-400' : currentUser.role === 'Manager' ? 'bg-blue-400' : 'bg-emerald-400'
                }`}></span>
                <span>{currentUser.role}</span>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* User Menu & Role Switcher Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50">
              <div className="border-b border-slate-800 px-3 py-2">
                <p className="text-xs font-bold text-white">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-indigo-950/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  <Shield className="h-3 w-3 text-indigo-400" /> Role: {currentUser.role}
                </div>
              </div>

              <div className="px-2 py-2">
                <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Active Role (Demo)
                </p>
                <div className="mt-1 space-y-1">
                  <button
                    onClick={() => {
                      onRoleChange('Admin');
                      setShowUserMenu(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition ${
                      currentUser.role === 'Admin'
                        ? 'bg-purple-500/20 text-purple-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5 text-purple-400" /> Admin Director
                  </button>
                  <button
                    onClick={() => {
                      onRoleChange('Manager');
                      setShowUserMenu(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition ${
                      currentUser.role === 'Manager'
                        ? 'bg-blue-500/20 text-blue-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Briefcase className="h-3.5 w-3.5 text-blue-400" /> Department Manager
                  </button>
                  <button
                    onClick={() => {
                      onRoleChange('Employee');
                      setShowUserMenu(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition ${
                      currentUser.role === 'Employee'
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> Staff Employee
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-800 px-2 pt-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 transition hover:bg-rose-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
