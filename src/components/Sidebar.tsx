import React from 'react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Briefcase,
  Building2,
  Bot,
  Zap,
  FileBarChart,
  Bell,
  Settings,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: Role;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  counts?: {
    tasks?: number;
    projects?: number;
    employees?: number;
    notifications?: number;
  };
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string | null;
  highlight?: boolean;
  color: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  userRole,
  isOpenMobile,
  onCloseMobile,
  counts,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      color: 'text-sky-400',
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      badge: counts?.employees || null,
      color: 'text-indigo-400',
    },
    {
      id: 'tasks',
      label: 'Task Management',
      icon: CheckSquare,
      badge: counts?.tasks || null,
      color: 'text-emerald-400',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Briefcase,
      badge: counts?.projects || null,
      color: 'text-amber-400',
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      badge: null,
      color: 'text-purple-400',
    },
    {
      id: 'ai-assistant',
      label: 'AI Copilot Assistant',
      icon: Bot,
      highlight: true,
      badge: 'Live',
      color: 'text-fuchsia-400',
    },
    {
      id: 'ai-automation',
      label: 'AI Automation Center',
      icon: Zap,
      highlight: true,
      badge: 'Auto',
      color: 'text-pink-400',
    },
    {
      id: 'reports',
      label: 'Executive Reports',
      icon: FileBarChart,
      badge: null,
      color: 'text-cyan-400',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: counts?.notifications || null,
      color: 'text-rose-400',
    },
  ];

  // Admin-only module
  if (userRole === 'Admin') {
    navItems.push({
      id: 'admin',
      label: 'Admin Control Panel',
      icon: Settings,
      badge: 'Admin',
      color: 'text-amber-400',
    });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-900/95 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                ApexEnterprise
                <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] font-bold text-indigo-400">
                  AI v4
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Integrated Automation</div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Enterprise Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.color
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : typeof item.badge === 'number'
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/70" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom System Banner */}
        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>SOC-2 & ISO Secured</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              RBAC active. Real-time Gemini inference running securely on server.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
