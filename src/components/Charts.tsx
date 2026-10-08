import React from 'react';
import { Project, Department, Task } from '../types';

interface ProjectProgressChartProps {
  projects: Project[];
}

export const ProjectProgressChart: React.FC<ProjectProgressChartProps> = ({ projects }) => {
  return (
    <div className="space-y-3.5">
      {projects.slice(0, 5).map((project) => {
        const isCritical = project.riskLevel === 'Critical';
        const isMed = project.riskLevel === 'Medium';
        const barColor = isCritical ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-indigo-500';

        return (
          <div key={project.id} className="group">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs group-hover:text-indigo-400 transition">
                {project.name}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300'
                      : isMed
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {project.riskLevel} Risk
                </span>
                <span className="font-mono text-slate-300 font-bold">{project.progress}%</span>
              </div>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface DepartmentBudgetChartProps {
  departments: Department[];
}

export const DepartmentBudgetChart: React.FC<DepartmentBudgetChartProps> = ({ departments }) => {
  const totalBudget = departments.reduce((acc, d) => acc + d.budget, 0) || 1;

  return (
    <div className="space-y-4">
      {/* Visual Multi-Segment Bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
        {departments.map((dept) => {
          const pct = Math.round((dept.budget / totalBudget) * 100);
          return (
            <div
              key={dept.id}
              style={{ width: `${pct}%`, backgroundColor: dept.color }}
              title={`${dept.name}: $${dept.budget.toLocaleString()} (${pct}%)`}
              className="h-full transition-all duration-500 hover:opacity-80"
            />
          );
        })}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {departments.map((dept) => {
          const pct = Math.round((dept.budget / totalBudget) * 100);
          return (
            <div key={dept.id} className="flex items-center justify-between rounded-lg bg-slate-800/40 p-2">
              <div className="flex items-center gap-2 truncate">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                <span className="truncate text-slate-300">{dept.name}</span>
              </div>
              <span className="font-mono text-slate-400 text-[11px] font-semibold">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TaskDistributionChartProps {
  tasks: Task[];
}

export const TaskDistributionChart: React.FC<TaskDistributionChartProps> = ({ tasks }) => {
  const total = tasks.length || 1;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const inReview = tasks.filter((t) => t.status === 'In Review').length;
  const toDo = tasks.filter((t) => t.status === 'To Do').length;

  const segments = [
    { label: 'Completed', count: completed, color: '#10B981' },
    { label: 'In Progress', count: inProgress, color: '#3B82F6' },
    { label: 'In Review', count: inReview, color: '#8B5CF6' },
    { label: 'To Do', count: toDo, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-around py-2">
        {segments.map((seg) => (
          <div key={seg.label} className="text-center">
            <div className="text-xl font-extrabold text-white font-mono">{seg.count}</div>
            <div className="flex items-center justify-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
              {seg.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
        {segments.map((seg) => {
          const pct = Math.round((seg.count / total) * 100);
          return (
            <div
              key={seg.label}
              style={{ width: `${pct}%`, backgroundColor: seg.color }}
              className="h-full transition-all duration-500"
              title={`${seg.label}: ${seg.count} (${pct}%)`}
            />
          );
        })}
      </div>
    </div>
  );
};
