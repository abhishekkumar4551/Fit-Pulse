import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Save,
  Flame,
  Target,
  Scale,
  Sparkles,
  Heart,
  Droplets,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, BmiInfo, FitnessGoal, ActivityLevel, Gender, DietaryPreference, ExperienceLevel } from '../types';
import { calculateBMI, calculateBMR, calculateTDEE, calculateMacroTargets } from '../utils/fitnessCalc';

interface ProfileViewProps {
  profile: UserProfile | null;
  bmiInfo: BmiInfo | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  bmiInfo,
  onUpdateProfile,
}) => {
  const [age, setAge] = useState(profile?.age || 25);
  const [gender, setGender] = useState<Gender>(profile?.gender || 'Male');
  const [heightCm, setHeightCm] = useState(profile?.heightCm || 175);
  const [weightKg, setWeightKg] = useState(profile?.weightKg || 70);
  const [targetWeightKg, setTargetWeightKg] = useState(profile?.targetWeightKg || 70);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile?.fitnessGoal || 'General Fitness');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel || 'Moderately Active');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(profile?.dietaryPreference || 'Non-Vegetarian');
  const [workoutExperience, setWorkoutExperience] = useState<ExperienceLevel>(profile?.workoutExperience || 'Intermediate');
  const [medicalNotes, setMedicalNotes] = useState(profile?.medicalNotes || '');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if profile prop updates
  useEffect(() => {
    if (profile) {
      setAge(profile.age);
      setGender(profile.gender);
      setHeightCm(profile.heightCm);
      setWeightKg(profile.weightKg);
      setTargetWeightKg(profile.targetWeightKg);
      setFitnessGoal(profile.fitnessGoal);
      setActivityLevel(profile.activityLevel);
      setDietaryPreference(profile.dietaryPreference);
      setWorkoutExperience(profile.workoutExperience);
      setMedicalNotes(profile.medicalNotes || '');
    }
  }, [profile]);

  // Live real-time calculations as user tweaks form
  const liveBmi = calculateBMI(weightKg, heightCm);
  const liveBmr = calculateBMR(weightKg, heightCm, age, gender);
  const liveTdee = calculateTDEE(liveBmr, activityLevel);
  const liveMacros = calculateMacroTargets(liveTdee, weightKg, fitnessGoal, dietaryPreference);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdateProfile({
        age,
        gender,
        heightCm,
        weightKg,
        targetWeightKg,
        fitnessGoal,
        activityLevel,
        dietaryPreference,
        workoutExperience,
        medicalNotes,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-emerald-400" />
          <span>User Profile & Metabolic Calibration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust your personal biometric metrics, goals, and training experience. The AI recalculates your BMR, TDEE, and macro targets in real-time.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile biometrics and metabolic parameters saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Editing Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Biometric & Health Baseline
            </h2>

            {/* Basic Biometrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="14"
                  max="100"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  required
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 pt-2">
              Fitness Strategy & Lifestyle
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Primary Fitness Goal</label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Weight Loss">Weight Loss (Caloric Deficit)</option>
                  <option value="Muscle Gain">Muscle Gain (Hypertrophy Surplus)</option>
                  <option value="General Fitness">General Fitness (Maintenance)</option>
                  <option value="Strength">Strength & Power</option>
                  <option value="Endurance">Cardiovascular Endurance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Daily Physical Activity</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Sedentary">Sedentary (Desk job, little exercise)</option>
                  <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
                  <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                  <option value="Very Active">Very Active (6-7 days/week intense)</option>
                  <option value="Extremely Active">Extremely Active (Athletic training)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dietary Preference</label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Non-Vegetarian">Non-Vegetarian (Chicken, fish, beef, eggs)</option>
                  <option value="Vegetarian">Vegetarian (Dairy, eggs, plant proteins)</option>
                  <option value="Vegan">Vegan (100% Plant based, legumes, tofu)</option>
                  <option value="Keto">Ketogenic (High fat, ultra-low carb)</option>
                  <option value="Pescatarian">Pescatarian (Fish & plant sources)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Workout Experience</label>
                <select
                  value={workoutExperience}
                  onChange={(e) => setWorkoutExperience(e.target.value as ExperienceLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Beginner">Beginner (&lt; 1 year of consistent lifting)</option>
                  <option value="Intermediate">Intermediate (1 - 3 years experience)</option>
                  <option value="Advanced">Advanced (3+ years structured training)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Medical Notes / Injury Precautions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Mild lower back sensitivity during heavy deadlifts; tight left shoulder."
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Recalibrating...' : 'Save & Update Biometrics'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Metabolic Engine Preview Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Live Metabolic Analysis</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Updates in real-time as you tweak biometrics above.
            </p>
          </div>

          <div className="space-y-4">
            {/* BMI Display */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Calculated BMI</span>
                <span
                  className="font-bold text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${liveBmi.color}20`, color: liveBmi.color }}
                >
                  {liveBmi.category}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white">{liveBmi.bmi}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Healthy weight: {liveBmi.healthyWeightRange.min} - {liveBmi.healthyWeightRange.max} kg
              </div>
            </div>

            {/* BMR & TDEE */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  BMR (Basal)
                </span>
                <span className="text-xl font-extrabold text-white">{liveBmr}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">kcal at complete rest</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  TDEE (Expenditure)
                </span>
                <span className="text-xl font-extrabold text-cyan-400">{liveTdee}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">kcal burn per day</span>
              </div>
            </div>

            {/* Target Daily Calorie & Macro Distribution */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Recommended Daily Intake:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {liveMacros.dailyCalories} kcal
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-emerald-400 font-semibold">Protein</div>
                  <div className="font-bold text-white mt-0.5">{liveMacros.proteinGrams}g</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-cyan-400 font-semibold">Carbs</div>
                  <div className="font-bold text-white mt-0.5">{liveMacros.carbsGrams}g</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-purple-400 font-semibold">Fats</div>
                  <div className="font-bold text-white mt-0.5">{liveMacros.fatGrams}g</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-sky-400 pt-1">
                <Droplets className="w-3.5 h-3.5" />
                <span>Water recommendation: {liveMacros.waterLiters} Liters/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
