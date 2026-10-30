import React, { useState } from 'react';
import { Scale, X, CheckCircle2, Calendar, FileText } from 'lucide-react';

interface LogWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight: number;
  onLog: (data: {
    date?: string;
    weightKg: number;
    workoutsCompleted?: number;
    completedWorkoutTitle?: string;
    notes?: string;
  }) => Promise<void>;
}

export const LogWeightModal: React.FC<LogWeightModalProps> = ({
  isOpen,
  onClose,
  currentWeight,
  onLog,
}) => {
  const [weightKg, setWeightKg] = useState<number>(currentWeight || 70);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [completedWorkout, setCompletedWorkout] = useState(true);
  const [workoutTitle, setWorkoutTitle] = useState('Daily Training Session');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;

    setSubmitting(true);
    try {
      await onLog({
        date,
        weightKg: Number(weightKg),
        workoutsCompleted: completedWorkout ? 1 : 0,
        completedWorkoutTitle: completedWorkout ? workoutTitle : undefined,
        notes,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to record entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <span>Record Daily Fitness Check-in</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Current Body Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="250"
              required
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm font-bold"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={completedWorkout}
                onChange={(e) => setCompletedWorkout(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0 focus:outline-none bg-slate-900 border-slate-700"
              />
              <span className="font-semibold text-slate-200">Completed training session today</span>
            </label>

            {completedWorkout && (
              <input
                type="text"
                placeholder="Workout session name (e.g. Upper Body Strength)"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Personal Notes / Energy Level
            </label>
            <input
              type="text"
              placeholder="e.g. Felt well rested, hit bench press targets easily."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
