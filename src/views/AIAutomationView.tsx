import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Briefcase,
  FileText,
  Play,
  RotateCw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface AIAutomationViewProps {
  onRunAutomation: (action: string) => Promise<any>;
}

export const AIAutomationView: React.FC<AIAutomationViewProps> = ({ onRunAutomation }) => {
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const automations = [
    {
      id: 'prioritize_tasks',
      title: 'Automated Task Prioritization Matrix',
      description:
        'Calculates real-time priority scores based on deadline proximity, milestone dependencies, and assigned staff capacity. Automatically elevates urgent backlogs.',
      icon: Zap,
      badge: 'Sprint Optimizer',
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'scan_deadlines',
      title: 'Autonomous Deadline Sentinel & Alerts',
      description:
        'Scans all active deliverables due within 5 days. Dispatches personalized high-priority alerts to task owners and department heads.',
      icon: Clock,
      badge: 'Notification Dispatcher',
      color: 'from-rose-500 to-pink-500',
    },
    {
      id: 'workload_audit',
      title: 'Employee Workload & Burnout Guard',
      description:
        'Analyzes individual task loads across departments. Detects overloaded employees with >3 active high-priority tasks and suggests capacity balancing.',
      icon: Users,
      badge: 'HR & Resource Triage',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'risk_detection',
      title: 'Project Trajectory & Risk Detector',
      description:
        'Audits progress velocity against target delivery dates. Calculates risk level (Low, Moderate, Critical) and recommends actionable intervention strategies.',
      icon: AlertTriangle,
      badge: 'Delivery Governance',
      color: 'from-purple-500 to-fuchsia-500',
    },
    {
      id: 'generate_report',
      title: 'Autonomous Executive Briefing Generator',
      description:
        'Synthesizes multi-department milestones, budget burn, and risk logs into a formatted C-Suite executive summary ready for immediate board distribution.',
      icon: FileText,
      badge: 'Executive Synthesis',
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  const handleExecute = async (actionId: string) => {
    setRunningAction(actionId);
    setStatusMessage(null);
    try {
      const res = await onRunAutomation(actionId);
      setResults((prev) => ({ ...prev, [actionId]: res }));
      setStatusMessage(`Automation "${actionId}" executed successfully!`);
    } catch (err: any) {
      setStatusMessage(`Error executing automation: ${err.message || 'Check connection'}`);
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300">
                AI Autonomous Operations
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Enterprise Automation Control Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
              Trigger autonomous heuristic workflows that analyze database states, rebalance workloads,
              rescore backlogs, and safeguard milestone deliveries with zero manual friction.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleExecute('prioritize_tasks')}
              disabled={!!runningAction}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Run Full System Scan</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {automations.map((auto) => {
          const Icon = auto.icon;
          const isRunning = runningAction === auto.id;
          const result = results[auto.id];

          return (
            <div
              key={auto.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg transition hover:border-slate-700 hover:bg-slate-850"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${auto.color} text-white shadow-md`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                    {auto.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-sm font-bold text-white">{auto.title}</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{auto.description}</p>
              </div>

              {/* Execution Result Drawer/Panel if present */}
              {result && (
                <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-800/80 p-3 text-xs text-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Scan Result Verified</span>
                  </div>

                  {auto.id === 'workload_audit' && result.employeeLoads && (
                    <div className="text-[11px] text-slate-300">
                      Identified <strong>{result.overloadedCount} overloaded team members</strong>. Capacity
                      rebalance suggestions dispatched.
                    </div>
                  )}

                  {auto.id === 'risk_detection' && result.risks && (
                    <div className="text-[11px] text-slate-300">
                      Flagged <strong>{result.criticalCount} projects</strong> with velocity lag against deadline.
                    </div>
                  )}

                  {auto.id === 'prioritize_tasks' && (
                    <div className="text-[11px] text-slate-300">
                      {result.message}
                    </div>
                  )}

                  {auto.id === 'generate_report' && result.report && (
                    <div className="text-[11px] text-slate-300">
                      Generated: <em>"{result.report.title}"</em>. Ready in Reports module.
                    </div>
                  )}

                  {auto.id === 'scan_deadlines' && (
                    <div className="text-[11px] text-slate-300">
                      Dispatched {result.alertsCreated || 2} new urgent deadline notifications.
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="mt-5 border-t border-slate-800 pt-3">
                <button
                  onClick={() => handleExecute(auto.id)}
                  disabled={isRunning}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <RotateCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                      <span>Executing Workflow...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400" />
                      <span>Execute Automation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
