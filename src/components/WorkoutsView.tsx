import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  Check,
  Pause,
  AlertCircle,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WorkoutPlan, ExerciseItem } from '../types';

interface WorkoutsViewProps {
  workoutPlans: WorkoutPlan[];
  onRefreshPlans: () => Promise<void>;
  onCreatePlan: (plan: Partial<WorkoutPlan>) => Promise<void>;
  onDeletePlan: (id: string) => Promise<void>;
  onCompleteWorkout: (planId: string, dayName: string, durationMin: number, notes: string) => Promise<void>;
  onGenerateAiPlan: () => Promise<void>;
  isGeneratingAi: boolean;
}

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  workoutPlans,
  onRefreshPlans,
  onCreatePlan,
  onDeletePlan,
  onCompleteWorkout,
  onGenerateAiPlan,
  isGeneratingAi,
}) => {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Active workout session runner state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionDurationSec, setSessionDurationSec] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

  // Rest Timer state
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Create Plan Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanGoal, setNewPlanGoal] = useState('General Fitness');
  const [newPlanSplit, setNewPlanSplit] = useState('Upper / Lower');

  const currentPlan = workoutPlans[selectedPlanIndex] || workoutPlans[0];
  const currentDay = currentPlan?.days[selectedDayIndex] || currentPlan?.days[0];

  // Workout stopwatch
  useEffect(() => {
    let interval: any;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionDurationSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Rest timer countdown
  useEffect(() => {
    let timer: any;
    if (isTimerRunning && restSecondsLeft !== null && restSecondsLeft > 0) {
      timer = setInterval(() => {
        setRestSecondsLeft((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (restSecondsLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, restSecondsLeft]);

  const startRestTimer = (seconds: number) => {
    setRestSecondsLeft(seconds);
    setIsTimerRunning(true);
  };

  const toggleSetComplete = (setKey: string) => {
    setCompletedSets((prev) => ({
      ...prev,
      [setKey]: !prev[setKey],
    }));
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    setSessionDurationSec(0);
    setCompletedSets({});
  };

  const handleFinishSession = async () => {
    if (!currentPlan || !currentDay) return;
    const durationMin = Math.max(1, Math.round(sessionDurationSec / 60));
    await onCompleteWorkout(
      currentPlan.id,
      currentDay.dayName,
      durationMin,
      `Finished workout session in ${durationMin} minutes.`
    );
    setIsSessionActive(false);
    setSessionStartTime(null);
  };

  const handleCreatePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle) return;

    await onCreatePlan({
      title: newPlanTitle,
      goal: newPlanGoal,
      splitType: newPlanSplit,
      experienceLevel: 'Intermediate',
      days: [
        {
          dayName: 'Day 1: Full Body Foundation',
          focus: 'Compound Strength',
          estimatedDurationMin: 45,
          exercises: [
            {
              id: 'ex-1',
              name: 'Barbell Bench Press',
              muscleGroup: 'Chest',
              sets: 3,
              reps: '8-10',
              restSec: 90,
              notes: 'Focus on full range of motion.',
            },
            {
              id: 'ex-4',
              name: 'Barbell Back Squat',
              muscleGroup: 'Legs',
              sets: 3,
              reps: '8-10',
              restSec: 90,
              notes: 'Ensure proper depth and knee alignment.',
            },
          ],
        },
      ],
      safetyTips: ['Warm up dynamically before lifting', 'Keep core engaged'],
    });

    setShowCreateModal(false);
    setNewPlanTitle('');
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-emerald-400" />
            <span>Workout Management & Schedules</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse daily and weekly workout routines, execute live sessions with rest timers, and track completed sets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onGenerateAiPlan}
            disabled={isGeneratingAi}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-300 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingAi ? 'Synthesizing...' : 'AI Generate Plan'}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Custom Plan</span>
          </button>
        </div>
      </div>

      {/* Active Workout Session Floating Bar (If session in progress) */}
      {isSessionActive && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 shadow-xl shadow-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Active Workout Session
              </div>
              <div className="text-sm font-extrabold text-white">
                {currentDay?.dayName} • {formatTime(sessionDurationSec)}
              </div>
            </div>
          </div>

          {/* Quick Rest Timer Controls */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-300 font-medium">Rest Timer:</span>
            {restSecondsLeft !== null && restSecondsLeft > 0 ? (
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {restSecondsLeft}s
              </span>
            ) : (
              <div className="flex gap-1.5">
                {[30, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => startRestTimer(sec)}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            )}
            {restSecondsLeft !== null && restSecondsLeft > 0 && (
              <button
                onClick={() => setRestSecondsLeft(null)}
                className="text-[11px] text-red-400 hover:underline ml-1"
              >
                Reset
              </button>
            )}
          </div>

          <button
            onClick={handleFinishSession}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finish Workout & Log</span>
          </button>
        </div>
      )}

      {/* Program Selector Tabs */}
      {workoutPlans.length > 0 ? (
        <div className="space-y-6">
          {/* Plan Meta Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{currentPlan.title}</h2>
                  {currentPlan.generatedByAI && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="w-3 h-3" />
                      AI Synthesized
                    </span>
                  )}
                  {currentPlan.assignedBy && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Assigned by {currentPlan.assignedBy}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Goal: <strong className="text-slate-200">{currentPlan.goal}</strong></span>
                  <span>•</span>
                  <span>Split: <strong className="text-slate-200">{currentPlan.splitType}</strong></span>
                  <span>•</span>
                  <span>Experience: <strong className="text-slate-200">{currentPlan.experienceLevel}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isSessionActive && (
                  <button
                    onClick={handleStartSession}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Start This Day's Workout</span>
                  </button>
                )}
                {workoutPlans.length > 1 && (
                  <button
                    onClick={() => onDeletePlan(currentPlan.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Days Tabs */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
              {currentPlan.days.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedDayIndex === idx
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{day.dayName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Day Schedule & Exercises */}
          {currentDay && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{currentDay.dayName}</h3>
                  <p className="text-xs text-emerald-400 font-medium">Focus: {currentDay.focus}</p>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Estimated: {currentDay.estimatedDurationMin} minutes</span>
                </div>
              </div>

              {/* Exercise Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentDay.exercises.map((ex, exIdx) => {
                  const setKeys = Array.from({ length: ex.sets }, (_, sIdx) => `${ex.id}-set-${sIdx}`);
                  return (
                    <div
                      key={ex.id || exIdx}
                      className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center">
                              {exIdx + 1}
                            </span>
                            <h4 className="font-bold text-sm text-white">{ex.name}</h4>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium ml-8">
                            Muscle Target: <strong className="text-slate-300">{ex.muscleGroup}</strong>
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {ex.sets} × {ex.reps}
                        </span>
                      </div>

                      {/* Technique & Form Notes */}
                      {ex.notes && (
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                          💡 <span className="font-semibold text-slate-200">Form Cue:</span> {ex.notes}
                        </p>
                      )}

                      {/* Interactive Set Tracking & Rest Timer launcher */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[11px]">Sets:</span>
                          <div className="flex items-center gap-1">
                            {setKeys.map((sKey, sIdx) => {
                              const isDone = !!completedSets[sKey];
                              return (
                                <button
                                  key={sKey}
                                  onClick={() => {
                                    toggleSetComplete(sKey);
                                    if (!isDone) startRestTimer(ex.restSec || 60);
                                  }}
                                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                                    isDone
                                      ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                  }`}
                                  title={`Mark Set ${sIdx + 1} as completed`}
                                >
                                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : sIdx + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          onClick={() => startRestTimer(ex.restSec || 90)}
                          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/50"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Rest {ex.restSec || 90}s</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Safety Tips Banner */}
              {currentPlan.safetyTips && currentPlan.safetyTips.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Workout Safety Guidelines:</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {currentPlan.safetyTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <Dumbbell className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-lg font-bold text-white">No Workout Plans Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You don't have an active training plan yet. Generate a personalized plan using our AI engine or create a custom workout routine.
          </p>
          <button
            onClick={onGenerateAiPlan}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Generate AI Workout Routine
          </button>
        </div>
      )}

      {/* Create Custom Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Create Custom Workout Routine</span>
            </h3>

            <form onSubmit={handleCreatePlanSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Workout Plan Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4-Day Push/Pull/Legs Hypertrophy"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fitness Goal</label>
                  <select
                    value={newPlanGoal}
                    onChange={(e) => setNewPlanGoal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="General Fitness">General Fitness</option>
                    <option value="Strength">Strength</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Split Type</label>
                  <select
                    value={newPlanSplit}
                    onChange={(e) => setNewPlanSplit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Upper / Lower">Upper / Lower</option>
                    <option value="Push / Pull / Legs">Push / Pull / Legs</option>
                    <option value="Full Body">Full Body</option>
                    <option value="Bro Split">Body Part Split</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                A starter template with compound exercises will be automatically populated, which you can customize further.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
