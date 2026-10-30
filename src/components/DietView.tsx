import React from 'react';
import {
  Apple,
  Flame,
  Sparkles,
  Droplets,
  AlertTriangle,
  RotateCw,
  Clock,
  Utensils,
  ShieldCheck,
  ChefHat,
} from 'lucide-react';
import { DietPlan, UserProfile } from '../types';

interface DietViewProps {
  dietPlans: DietPlan[];
  profile: UserProfile | null;
  onGenerateAiPlan: () => Promise<void>;
  isGeneratingAi: boolean;
}

export const DietView: React.FC<DietViewProps> = ({
  dietPlans,
  profile,
  onGenerateAiPlan,
  isGeneratingAi,
}) => {
  const currentDiet = dietPlans[0];

  const dailyCalories = currentDiet?.dailyCalories || profile?.dailyCalories || 2400;
  const proteinG = currentDiet?.proteinG || profile?.targetProtein || 150;
  const carbsG = currentDiet?.carbsG || profile?.targetCarbs || 250;
  const fatsG = currentDiet?.fatsG || profile?.targetFat || 65;
  const waterLiters = currentDiet?.waterLiters || profile?.waterLiters || 3.0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Apple className="w-6 h-6 text-emerald-400" />
            <span>Personalized Nutrition & Diet Architecture</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Science-grounded macronutrient distribution, nutrient timing windows, and personalized meal plans.
          </p>
        </div>

        <button
          onClick={onGenerateAiPlan}
          disabled={isGeneratingAi}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          {isGeneratingAi ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Optimizing Diet with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Adapt Diet Protocol</span>
            </>
          )}
        </button>
      </div>

      {/* Safety & Medical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-300">Safety & Medical Disclaimer</div>
          <p className="leading-relaxed text-[11px] text-amber-200/90">
            These caloric targets and meal suggestions are algorithmic nutritional guidelines designed for healthy athletic adults. They do not constitute clinical nutritional therapy or medical diagnosis. Please consult a registered dietitian or medical practitioner before undertaking radical caloric changes, particularly if you have metabolic conditions, allergies, or are pregnant.
          </p>
        </div>
      </div>

      {/* Macro Target Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Calories Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Daily Energy</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{dailyCalories}</div>
          <div className="text-xs text-slate-400 mt-1">kcal / 24 hours</div>
          <div className="mt-2 text-[10px] text-amber-400 font-semibold">
            Based on {profile?.fitnessGoal || 'General Fitness'}
          </div>
        </div>

        {/* Protein Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Protein Target</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{proteinG}g</div>
          <div className="text-xs text-slate-400 mt-1">{proteinG * 4} kcal (~30%)</div>
          <div className="mt-2 text-[10px] text-emerald-400 font-semibold">
            ~2.0g per kg bodyweight
          </div>
        </div>

        {/* Carbs Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Carbohydrates</span>
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{carbsG}g</div>
          <div className="text-xs text-slate-400 mt-1">{carbsG * 4} kcal (~45%)</div>
          <div className="mt-2 text-[10px] text-cyan-400 font-semibold">Glycogen Replenishment</div>
        </div>

        {/* Fats Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Healthy Fats</span>
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{fatsG}g</div>
          <div className="text-xs text-slate-400 mt-1">{fatsG * 9} kcal (~25%)</div>
          <div className="mt-2 text-[10px] text-purple-400 font-semibold">Hormone Optimization</div>
        </div>

        {/* Hydration Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Hydration</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{waterLiters}L</div>
          <div className="text-xs text-slate-400 mt-1">Daily water quota</div>
          <div className="mt-2 text-[10px] text-sky-400 font-semibold">+500ml on workout days</div>
        </div>
      </div>

      {/* Plan Details & Meal Timing Slots */}
      {currentDiet ? (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{currentDiet.title}</h2>
                  {currentDiet.generatedByAI && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="w-3 h-3" />
                      AI Calibrated
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Preference: <strong className="text-emerald-400">{currentDiet.dietaryPreference}</strong> • Goal: <strong className="text-slate-200">{currentDiet.goal}</strong>
                </div>
              </div>
            </div>

            {/* Meals Accordion List */}
            <div className="space-y-4">
              {currentDiet.meals.map((meal, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {meal.mealType}
                        </span>
                        <h3 className="font-bold text-sm text-white">{meal.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="font-bold text-amber-400">{meal.calories} kcal</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-emerald-400">{meal.protein}g P</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-cyan-400">{meal.carbs}g C</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-purple-400">{meal.fat}g F</span>
                    </div>
                  </div>

                  {/* Meal Food Items */}
                  <div className="space-y-2">
                    {meal.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/60 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-200">{item.name}</span>
                          <span className="text-[11px] text-slate-400 ml-2">({item.portion})</span>
                        </div>
                        <div className="font-mono text-slate-400 flex items-center gap-3 text-[11px]">
                          <span>{item.calories} kcal</span>
                          <span className="text-emerald-400">{item.protein}g protein</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {meal.tips && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                      💡 <span className="font-medium text-slate-300">Nutrient Window Note:</span> {meal.tips}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* General Guidelines */}
            {currentDiet.guidelines && currentDiet.guidelines.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5 mt-4">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sports Nutrition Best Practices:</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                  {currentDiet.guidelines.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <ChefHat className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No Diet Plan Configured</h3>
          <p className="text-xs text-slate-400">
            Generate an AI personalized diet plan aligned with your daily calories and preferences.
          </p>
          <button
            onClick={onGenerateAiPlan}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
          >
            Generate AI Nutrition Protocol
          </button>
        </div>
      )}
    </div>
  );
};
