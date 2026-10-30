import React, { useState } from 'react';
import {
  Flame,
  Target,
  Scale,
  Sparkles,
  Dumbbell,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Droplets,
  AlertTriangle,
  Play,
  RotateCw,
  Plus,
  Bell,
} from 'lucide-react';
import { UserProfile, BmiInfo, WorkoutPlan, DietPlan, ProgressEntry } from '../types';

interface DashboardProps {
  profile: UserProfile | null;
  bmiInfo: BmiInfo | null;
  workoutPlans: WorkoutPlan[];
  dietPlans: DietPlan[];
  progressHistory: ProgressEntry[];
  onNavigate: (tab: string) => void;
  onGenerateAiPlan: () => Promise<void>;
  isGeneratingAi: boolean;
  onOpenLogWeightModal: () => void;
  onQuickCompleteWorkout: () => void;
  onOpenNotifications: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  bmiInfo,
  workoutPlans,
  dietPlans,
  progressHistory,
  onNavigate,
  onGenerateAiPlan,
  isGeneratingAi,
  onOpenLogWeightModal,
  onQuickCompleteWorkout,
  onOpenNotifications,
}) => {
  const currentPlan = workoutPlans[0];
  const currentDiet = dietPlans[0];

  const currentWeight = profile?.weightKg || 70;
  const targetWeight = profile?.targetWeightKg || 70;
  const weightDiff = Math.round((currentWeight - targetWeight) * 10) / 10;
  const isLossGoal = profile?.fitnessGoal === 'Weight Loss';

  // Calculate workout completion rate over last 7 days
  const recentDays = 7;
  const workoutsLast7Days = progressHistory.filter((p) => {
    const diff = (Date.now() - new Date(p.date).getTime()) / (1000 * 3600 * 24);
    return diff <= recentDays && p.workoutsCompleted > 0;
  }).length;
  const weeklyTargetWorkouts = 4;
  const weeklyConsistencyPct = Math.min(100, Math.round((workoutsLast7Days / weeklyTargetWorkouts) * 100));

  // Determine current day's workout
  const todayWorkoutDay = currentPlan?.days[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Welcome & AI Quick Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/40 border border-emerald-500/30 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Engine: Gemini 3.8 Flash Active</span>
              </div>
              <button
                onClick={onOpenNotifications}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:border-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Manage scheduled workout notifications & dispatch test"
              >
                <Bell className="w-3 h-3 text-emerald-400" />
                <span>Daily Workout Reminders • Push & Email Active</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Elevate Your Fitness Journey,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {profile?.fitnessGoal || 'Fitness Achiever'}
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your personalized fitness AI continuously monitors your weight trajectory, adapts workout splits, and calibrates your daily macro intake to maximize results safely.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onGenerateAiPlan}
              disabled={isGeneratingAi}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Regenerate AI Protocol</span>
                </>
              )}
            </button>
            <button
              onClick={onOpenLogWeightModal}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Log Today's Weight</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice & Medical Disclaimer */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
        <p>
          <span className="font-bold">Fitness & Safety Notice:</span> AI recommendations are optimized for training and sports performance. Always warm up properly and consult a physician before undertaking high-intensity exercise or strict dietary modifications.
        </p>
      </div>

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weight Tracker Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Weight Goal</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{currentWeight}</span>
            <span className="text-xs text-slate-400">kg current</span>
          </div>
          <div className="mt-3 text-xs flex items-center justify-between text-slate-400">
            <span>Target: <strong className="text-emerald-400">{targetWeight} kg</strong></span>
            <span className={weightDiff === 0 ? 'text-emerald-400' : 'text-cyan-400'}>
              {weightDiff > 0 ? `+${weightDiff} kg` : `${weightDiff} kg`} to goal
            </span>
          </div>
          <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(15, 100 - Math.abs(weightDiff) * 8))}%`,
              }}
            />
          </div>
        </div>

        {/* BMI & Health Category Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Body Mass Index</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{bmiInfo?.bmi || 22.5}</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${bmiInfo?.color || '#10b981'}20`,
                color: bmiInfo?.color || '#10b981',
              }}
            >
              {bmiInfo?.category || 'Normal'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
            <span>Healthy Range:</span>
            <span className="font-semibold text-slate-300">
              {bmiInfo?.healthyWeightRange.min} - {bmiInfo?.healthyWeightRange.max} kg
            </span>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-400">
            Height: {profile?.heightCm || 175} cm • Age: {profile?.age || 25}
          </div>
        </div>

        {/* Daily Caloric Target Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Daily Calorie Target</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {profile?.dailyCalories || currentDiet?.dailyCalories || 2500}
            </span>
            <span className="text-xs text-slate-400">kcal / day</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
            <span>Protein Target:</span>
            <span className="font-bold text-emerald-400">
              {profile?.targetProtein || currentDiet?.proteinG || 150}g
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>Water: {profile?.waterLiters || 3.0} Liters daily</span>
          </div>
        </div>

        {/* Workout Consistency & Streak */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Weekly Consistency</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{weeklyConsistencyPct}%</span>
            <span className="text-xs text-slate-400">
              {workoutsLast7Days} of {weeklyTargetWorkouts} sessions
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
            <span>Streak:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {workoutsLast7Days} days active
            </span>
          </div>
          <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${weeklyConsistencyPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Workout & Nutrition Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Workout Focus */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Active Workout Program</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentPlan?.title || 'Personalized AI Fitness Split'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('workouts')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              <span>View Full Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayWorkoutDay ? (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{todayWorkoutDay.dayName}</h3>
                  <p className="text-xs text-emerald-400 font-medium">Focus: {todayWorkoutDay.focus}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>~{todayWorkoutDay.estimatedDurationMin} mins</span>
                </div>
              </div>

              {/* Exercise Items List */}
              <div className="space-y-2.5">
                {todayWorkoutDay.exercises.slice(0, 4).map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-200">{ex.name}</span>
                        <div className="text-[10px] text-slate-400">Target: {ex.muscleGroup}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-400">
                        {ex.sets} sets × {ex.reps}
                      </span>
                      <div className="text-[10px] text-slate-400">{ex.restSec}s rest</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <button
                  onClick={() => onNavigate('workouts')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Start Live Workout Session</span>
                </button>
                <button
                  onClick={onQuickCompleteWorkout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark Completed</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800">
              <Dumbbell className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No workout plan loaded yet</p>
              <button
                onClick={onGenerateAiPlan}
                className="mt-3 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                Generate AI Workout Split
              </button>
            </div>
          )}
        </div>

        {/* Nutrition & Macro Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Daily Macro Plan</h2>
            </div>
            <button
              onClick={() => onNavigate('diet')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Details
            </button>
          </div>

          <div className="space-y-4">
            {/* Calories Gauge Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Calories</span>
                <span className="font-bold text-white">
                  {profile?.dailyCalories || 2500} kcal
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-2 rounded-full w-4/5" />
              </div>
            </div>

            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Protein
                </span>
                <span className="font-bold text-white">
                  {profile?.targetProtein || 150}g
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-2 rounded-full w-3/4" />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Carbohydrates
                </span>
                <span className="font-bold text-white">
                  {profile?.targetCarbs || 300}g
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-2 rounded-full w-3/5" />
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Healthy Fats
                </span>
                <span className="font-bold text-white">
                  {profile?.targetFat || 70}g
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-2 rounded-full w-1/2" />
              </div>
            </div>
          </div>

          {/* Dietary Preference Tag */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
            <div className="text-slate-400">Dietary Preference:</div>
            <div className="font-bold text-emerald-400">
              {profile?.dietaryPreference || 'Non-Vegetarian'} • {profile?.fitnessGoal || 'General Fitness'}
            </div>
            <p className="text-[11px] text-slate-400">
              Meal distribution optimized into 4-5 high satiety nutrient windows.
            </p>
          </div>
        </div>
      </div>

      {/* AI Coach Insights & Adaptive Recommendations Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/70 border border-emerald-500/20 shadow-md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Personalized AI Fitness Intelligence</h3>
              <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Adaptive
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on your logged weight ({currentWeight}kg) and target ({targetWeight}kg), progressive overload should prioritize +1 to +2 reps on compound lifts before increasing weight. Keep protein synthesis high with post-workout amino acids within 45 minutes of training.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
                💡 Rest: 7-8 hours nightly for CNS recovery
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
                💧 Hydration: {profile?.waterLiters || 3.0}L daily minimum
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
                🎯 Target Caloric Shift: {isLossGoal ? '500 kcal deficit' : '350 kcal surplus'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
