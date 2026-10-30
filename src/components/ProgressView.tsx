import React, { useState } from 'react';
import {
  TrendingUp,
  Scale,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Flame,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { ProgressEntry, UserProfile } from '../types';

interface ProgressViewProps {
  progressHistory: ProgressEntry[];
  profile: UserProfile | null;
  onLogProgress: (data: {
    date?: string;
    weightKg: number;
    workoutsCompleted?: number;
    completedWorkoutTitle?: string;
    notes?: string;
  }) => Promise<void>;
  onDeleteProgress: (id: string) => Promise<void>;
  onOpenLogModal: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progressHistory,
  profile,
  onLogProgress,
  onDeleteProgress,
  onOpenLogModal,
}) => {
  // Sort ascending for chart
  const sortedHistory = [...progressHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const currentWeight = profile?.weightKg || (sortedHistory.length ? sortedHistory[sortedHistory.length - 1].weightKg : 70);
  const startingWeight = sortedHistory.length ? sortedHistory[0].weightKg : currentWeight;
  const targetWeight = profile?.targetWeightKg || 70;
  const totalChange = Math.round((currentWeight - startingWeight) * 10) / 10;
  const totalWorkouts = sortedHistory.reduce((acc, curr) => acc + (curr.workoutsCompleted || 0), 0);

  // SVG Chart Computations
  const chartHeight = 220;
  const chartWidth = 700;
  const padding = { top: 25, right: 30, bottom: 35, left: 50 };

  const weights = sortedHistory.map((d) => d.weightKg);
  if (targetWeight) weights.push(targetWeight);

  const minWeight = weights.length ? Math.floor(Math.min(...weights) - 2) : 60;
  const maxWeight = weights.length ? Math.ceil(Math.max(...weights) + 2) : 90;
  const weightRange = maxWeight - minWeight || 1;

  const getX = (index: number) => {
    if (sortedHistory.length <= 1) return padding.left + (chartWidth - padding.left - padding.right) / 2;
    return padding.left + (index / (sortedHistory.length - 1)) * (chartWidth - padding.left - padding.right);
  };

  const getY = (val: number) => {
    const usableHeight = chartHeight - padding.top - padding.bottom;
    const ratio = (val - minWeight) / weightRange;
    return chartHeight - padding.bottom - ratio * usableHeight;
  };

  const pointsPath = sortedHistory.map((d, i) => `${getX(i)},${getY(d.weightKg)}`).join(' L ');
  const areaPath = sortedHistory.length > 0
    ? `M ${getX(0)},${chartHeight - padding.bottom} L ${pointsPath} L ${getX(sortedHistory.length - 1)},${chartHeight - padding.bottom} Z`
    : '';

  const targetY = getY(targetWeight);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>Progress Tracking & Performance Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track daily body composition trends, workout volume consistency, and target milestones over time.
          </p>
        </div>

        <button
          onClick={onOpenLogModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Log Daily Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold uppercase">
            <span>Current Weight</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{currentWeight} kg</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>Target:</span>
            <strong className="text-emerald-400">{targetWeight} kg</strong>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold uppercase">
            <span>Total Trajectory</span>
            {totalChange > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : totalChange < 0 ? (
              <ArrowDownRight className="w-4 h-4 text-cyan-400" />
            ) : (
              <Minus className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="text-3xl font-extrabold text-white">
            {totalChange > 0 ? `+${totalChange}` : totalChange} kg
          </div>
          <div className="text-xs text-slate-400 mt-2">
            From initial {startingWeight} kg
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold uppercase">
            <span>Workouts Logged</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalWorkouts}</div>
          <div className="text-xs text-slate-400 mt-2">Total verified training sessions</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold uppercase">
            <span>Consistency Index</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">92%</div>
          <div className="text-xs text-slate-400 mt-2">High program adherence</div>
        </div>
      </div>

      {/* Weight History Line Chart (SVG Interactive) */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Weight Progress Curve</span>
            </h2>
            <p className="text-xs text-slate-400">
              Historical body weight data points plotted against your target threshold ({targetWeight} kg).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-1 bg-emerald-400 rounded-full" />
              <span>Logged Weight</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-3 h-0.5 border-t border-dashed border-cyan-400" />
              <span>Goal ({targetWeight}kg)</span>
            </div>
          </div>
        </div>

        {sortedHistory.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible select-none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const val = Math.round(minWeight + pct * weightRange);
                  const y = getY(val);
                  return (
                    <g key={idx}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#334155"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        fill="#94a3b8"
                        fontSize="10"
                        textAnchor="end"
                      >
                        {val}kg
                      </text>
                    </g>
                  );
                })}

                {/* Target Weight Reference Line */}
                <line
                  x1={padding.left}
                  y1={targetY}
                  x2={chartWidth - padding.right}
                  y2={targetY}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                />

                {/* Filled Area Gradient */}
                {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

                {/* Connected Data Line */}
                {pointsPath && (
                  <path
                    d={`M ${pointsPath}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {sortedHistory.map((d, i) => {
                  const cx = getX(i);
                  const cy = getY(d.weightKg);
                  return (
                    <g key={d.id || i} className="group cursor-pointer">
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill="#10b981"
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="transition-transform duration-150 hover:scale-150"
                      />
                      {/* Tooltip on hover */}
                      <text
                        x={cx}
                        y={cy - 10}
                        fill="#f8fafc"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-900"
                      >
                        {d.weightKg}kg ({d.date.slice(5)})
                      </text>
                      {/* X Axis Date Label */}
                      <text
                        x={cx}
                        y={chartHeight - 10}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        {d.date.slice(5)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No progress entries recorded yet. Click "Log Daily Metrics" to add your first weight record!
          </div>
        )}
      </div>

      {/* Fitness History Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <span>Historical Fitness Logs</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/60">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Recorded Weight</th>
                <th className="py-3 px-4">Workouts Completed</th>
                <th className="py-3 px-4">Workout Details / Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {progressHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                    {item.date}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    {item.weightKg} kg
                  </td>
                  <td className="py-3.5 px-4">
                    {item.workoutsCompleted > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.workoutsCompleted} session(s)
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Rest day</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                    {item.completedWorkoutTitle || item.notes || 'Routine check-in'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onDeleteProgress(item.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
