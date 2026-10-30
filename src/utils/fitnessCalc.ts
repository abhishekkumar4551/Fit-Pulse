/**
 * Core fitness calculations for FitPulse AI
 * Pure mathematical functions for BMI, BMR, TDEE, and macronutrient targets.
 */

export type FitnessGoal = 'Weight Loss' | 'Muscle Gain' | 'General Fitness' | 'Endurance' | 'Strength';
export type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';
export type Gender = 'Male' | 'Female' | 'Other';
export type DietaryPreference = 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Keto' | 'Pescatarian';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface BmiResult {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese';
  color: string;
  healthyWeightRange: { min: number; max: number };
}

export interface MacroTargets {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
}

/**
 * Calculate Body Mass Index (BMI) and category
 * Formula: weight (kg) / [height (m)]^2
 */
export function calculateBMI(weightKg: number, heightCm: number): BmiResult {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 0,
      category: 'Normal weight',
      color: '#10b981',
      healthyWeightRange: { min: 0, max: 0 },
    };
  }

  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  let category: BmiResult['category'] = 'Normal weight';
  let color = '#10b981'; // Emerald

  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#38bdf8'; // Sky blue
  } else if (bmi < 25) {
    category = 'Normal weight';
    color = '#10b981'; // Emerald
  } else if (bmi < 30) {
    category = 'Overweight';
    color = '#f59e0b'; // Amber
  } else {
    category = 'Obese';
    color = '#ef4444'; // Red
  }

  // Healthy BMI range is considered 18.5 - 24.9
  const minHealthyWeight = Math.round(18.5 * (heightM * heightM) * 10) / 10;
  const maxHealthyWeight = Math.round(24.9 * (heightM * heightM) * 10) / 10;

  return {
    bmi,
    category,
    color,
    healthyWeightRange: { min: minHealthyWeight, max: maxHealthyWeight },
  };
}

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation:
 * Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 * Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender = 'Male'
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 1600;

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'Female') {
    return Math.round(base - 161);
  }
  // Default/Male/Other
  return Math.round(base + 5);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * Multiplier based on physical activity level
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    'Extremely Active': 1.9,
  };

  const multiplier = multipliers[activityLevel] || 1.375;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate target calories and macronutrient split (Protein, Carbs, Fats)
 * Based on user's goal:
 * - Weight Loss: 500 kcal deficit (min 1200 kcal), high protein (2.0g/kg) to preserve lean mass
 * - Muscle Gain: 300 kcal surplus, high protein (2.2g/kg)
 * - General Fitness / Endurance: maintenance calories, balanced split
 */
export function calculateMacroTargets(
  tdee: number,
  weightKg: number,
  goal: FitnessGoal,
  dietPreference: DietaryPreference = 'Non-Vegetarian'
): MacroTargets {
  let dailyCalories = tdee;

  if (goal === 'Weight Loss') {
    dailyCalories = Math.max(1200, tdee - 500);
  } else if (goal === 'Muscle Gain') {
    dailyCalories = tdee + 350;
  } else if (goal === 'Strength') {
    dailyCalories = tdee + 200;
  } else if (goal === 'Endurance') {
    dailyCalories = tdee + 150;
  }

  // Protein grams per kg of bodyweight
  let proteinPerKg = 1.6;
  if (goal === 'Muscle Gain' || goal === 'Strength') {
    proteinPerKg = 2.2;
  } else if (goal === 'Weight Loss') {
    proteinPerKg = 2.0; // Higher protein keeps you full and prevents muscle wasting in a cut
  }

  const proteinGrams = Math.round(Math.min(weightKg * proteinPerKg, dailyCalories * 0.35 / 4));
  const proteinCalories = proteinGrams * 4;

  // Fat recommendation: ~25-30% of total calories (9 kcal/g)
  let fatPct = 0.25;
  if (dietPreference === 'Keto') {
    fatPct = 0.65;
  }
  const fatCalories = dailyCalories * fatPct;
  const fatGrams = Math.round(fatCalories / 9);

  // Carbs fill the remaining calories (4 kcal/g)
  const remainingCalories = Math.max(0, dailyCalories - proteinCalories - fatCalories);
  const carbsGrams = Math.round(remainingCalories / 4);

  // Water intake guideline: 35ml per kg + extra for active training
  const waterLiters = Math.round(((weightKg * 35) / 1000 + 0.5) * 10) / 10;

  return {
    dailyCalories: Math.round(dailyCalories),
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterLiters,
  };
}

/**
 * Estimate calorie burn for exercises based on MET (Metabolic Equivalent of Task)
 * Calories = MET * weight(kg) * duration(hours)
 */
export function estimateExerciseCalories(
  met: number,
  weightKg: number,
  durationMinutes: number
): number {
  if (weightKg <= 0 || durationMinutes <= 0) return 0;
  return Math.round((met * 3.5 * weightKg) / 200 * durationMinutes);
}
