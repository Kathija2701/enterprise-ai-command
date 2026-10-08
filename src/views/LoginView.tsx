import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  Briefcase,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { Role } from '../types';

interface LoginViewProps {
  onLogin: (email: string, role?: Role) => void;
  onRegister: (name: string, email: string, role: Role) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegister }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Employee');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide a valid email address');
      return;
    }

    if (isRegister) {
      if (!name) {
        setError('Please provide your full name');
        return;
      }
      onRegister(name, email, role);
    } else {
      onLogin(email);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoRole: Role) => {
    setEmail(demoEmail);
    setPassword('••••••••');
    onLogin(demoEmail, demoRole);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-indigo-500/25">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-white tracking-tight">
            Apex Enterprise AI
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Integrated Enterprise Management & Automation Platform
          </p>
        </div>

        {/* Demo Fast-Login Pills */}
        <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/30 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 text-center mb-2">
            Instant Demo Evaluation Logins
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@enterprise.ai', 'Admin')}
              className="flex flex-col items-center justify-center rounded-xl border border-purple-500/30 bg-purple-950/40 p-2 text-center transition hover:bg-purple-900/60"
            >
              <Shield className="h-4 w-4 text-purple-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Admin</span>
              <span className="text-[9px] text-purple-300">Director</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('sarah.tech@enterprise.ai', 'Manager')}
              className="flex flex-col items-center justify-center rounded-xl border border-blue-500/30 bg-blue-950/40 p-2 text-center transition hover:bg-blue-900/60"
            >
              <Briefcase className="h-4 w-4 text-blue-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Manager</span>
              <span className="text-[9px] text-blue-300">Department</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('alex.dev@enterprise.ai', 'Employee')}
              className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-2 text-center transition hover:bg-emerald-900/60"
            >
              <UserCheck className="h-4 w-4 text-emerald-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Employee</span>
              <span className="text-[9px] text-emerald-300">Staff Dev</span>
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 pl-9 pr-4 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Corporate Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@enterprise.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 pl-9 pr-4 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 pl-9 pr-4 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Role Level</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 px-3 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Employee">Employee (Staff Member)</option>
                <option value="Manager">Department Manager</option>
                <option value="Admin">Admin Director</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:brightness-110"
          >
            <span>{isRegister ? 'Create Account' : 'Sign In to Portal'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {isRegister ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="font-bold text-indigo-400 hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a new enterprise account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="font-bold text-indigo-400 hover:underline"
              >
                Register Here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
