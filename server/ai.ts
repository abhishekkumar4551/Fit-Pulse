import { GoogleGenAI } from '@google/genai';
import { UserProfile, WorkoutPlan, DietPlan, ExerciseRecord } from './db';
import { calculateBMI, calculateBMR, calculateTDEE, calculateMacroTargets } from '../src/utils/fitnessCalc';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface AiPlanGenerationResult {
  workoutPlan: Omit<WorkoutPlan, 'id' | 'userId' | 'createdAt'>;
  dietPlan: Omit<DietPlan, 'id' | 'userId' | 'createdAt'>;
  coachingSummary: string;
  source: 'gemini' | 'algorithmic_engine';
}

/**
 * Generate personalized workout plan, diet plan, and macro targets using Gemini AI
 * with algorithmic fallback.
 */
export async function generateFitnessPlan(
  profile: UserProfile,
  exerciseLibrary: ExerciseRecord[],
  recentProgressNotes?: string
): Promise<AiPlanGenerationResult> {
  const bmiInfo = calculateBMI(profile.weightKg, profile.heightCm);
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const macros = calculateMacroTargets(tdee, profile.weightKg, profile.fitnessGoal, profile.dietPreference);

  const client = getAiClient();

  if (client) {
    try {
      const prompt = `
Generate a personalized fitness recommendation for this user:
- Age: ${profile.age}, Gender: ${profile.gender}
- Height: ${profile.heightCm} cm, Weight: ${profile.weightKg} kg, Target Weight: ${profile.targetWeightKg} kg
- Calculated BMI: ${bmiInfo.bmi} (${bmiInfo.category})
- Fitness Goal: ${profile.fitnessGoal}
- Activity Level: ${profile.activityLevel}
- Dietary Preference: ${profile.dietPreference}
- Workout Experience: ${profile.workoutExperience}
- Medical Notes / Injuries: ${profile.medicalNotes || 'None reported'}
- Calculated TDEE: ${tdee} kcal, Calculated Target Calories: ${macros.dailyCalories} kcal
- Recent Notes: ${recentProgressNotes || 'None'}

Available exercise names to incorporate if suitable:
${exerciseLibrary.map((e) => `- ${e.name} (${e.muscleGroup}, ${e.category})`).join('\n')}

Return JSON conforming STRICTLY to this format:
{
  "workoutPlan": {
    "title": "Short descriptive program title",
    "goal": "${profile.fitnessGoal}",
    "experienceLevel": "${profile.workoutExperience}",
    "splitType": "e.g. Upper / Lower Split or Push / Pull / Legs",
    "days": [
      {
        "dayName": "Day 1 - Push Focus",
        "focus": "Chest, Shoulders & Triceps",
        "estimatedDurationMin": 50,
        "exercises": [
          {
            "id": "ex-1",
            "name": "Barbell Bench Press",
            "muscleGroup": "Chest",
            "sets": 3,
            "reps": "8-10",
            "restSec": 90,
            "weightRecommendation": "Moderate",
            "notes": "Keep shoulders retracted"
          }
        ]
      }
    ],
    "safetyTips": [
      "Warm up dynamically for 5-10 minutes before lifting.",
      "Stay hydrated and avoid locking out knees or elbows.",
      "If you experience acute joint pain, stop immediately."
    ]
  },
  "dietPlan": {
    "title": "Custom Nutrition Plan",
    "goal": "${profile.fitnessGoal}",
    "dietaryPreference": "${profile.dietPreference}",
    "dailyCalories": ${macros.dailyCalories},
    "proteinG": ${macros.proteinGrams},
    "carbsG": ${macros.carbsGrams},
    "fatsG": ${macros.fatGrams},
    "waterLiters": ${macros.waterLiters},
    "meals": [
      {
        "mealType": "Breakfast",
        "name": "Meal Name",
        "calories": 600,
        "protein": 35,
        "carbs": 60,
        "fat": 15,
        "items": [
          { "name": "Item description", "portion": "100g", "calories": 250, "protein": 15, "carbs": 30, "fat": 5 }
        ],
        "tips": "Tip for this meal"
      }
    ],
    "guidelines": [
      "Distribute protein intake evenly across meals.",
      "Drink plenty of water throughout the day."
    ],
    "safetyWarnings": [
      "Diet suggestions are for general guidance and do not replace personalized medical advice.",
      "Check ingredients against any food allergies or medical conditions."
    ]
  },
  "coachingSummary": "A motivational 2-sentence summary of why this specific protocol matches the user's goals."
}
`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a certified professional fitness trainer, strength coach, and sports nutritionist. Provide scientifically grounded, safe, and motivating fitness and diet programming. Avoid medical claims or dangerous extremes.',
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          workoutPlan: {
            ...parsed.workoutPlan,
            generatedByAI: true,
          },
          dietPlan: {
            ...parsed.dietPlan,
            generatedByAI: true,
          },
          coachingSummary: parsed.coachingSummary || 'Custom AI program configured for your unique body metrics and aspirations.',
          source: 'gemini',
        };
      }
    } catch (err) {
      console.warn('Gemini API call returned error or was unavailable, using algorithmic sports science engine:', err);
    }
  }

  // High-fidelity Algorithmic Sports Science Fallback Engine
  return generateAlgorithmicPlan(profile, exerciseLibrary, bmiInfo, tdee, macros);
}

function generateAlgorithmicPlan(
  profile: UserProfile,
  exerciseLibrary: ExerciseRecord[],
  bmiInfo: ReturnType<typeof calculateBMI>,
  tdee: number,
  macros: ReturnType<typeof calculateMacroTargets>
): AiPlanGenerationResult {
  const isLoss = profile.fitnessGoal === 'Weight Loss';
  const isMuscle = profile.fitnessGoal === 'Muscle Gain';
  const isStrength = profile.fitnessGoal === 'Strength';

  const splitType =
    profile.workoutExperience === 'Beginner'
      ? '3-Day Full Body Foundation Split'
      : '4-Day Upper / Lower Athletic Split';

  // Build Day 1
  const day1Exercises = [
    {
      id: 'ex-1',
      name: 'Barbell Bench Press',
      muscleGroup: 'Chest' as const,
      sets: isStrength ? 5 : 3,
      reps: isStrength ? '5' : isLoss ? '12-15' : '8-10',
      restSec: isStrength ? 120 : 90,
      notes: 'Touch mid-chest, drive up explosively.',
    },
    {
      id: 'ex-8',
      name: 'Bent-Over Barbell Row',
      muscleGroup: 'Back' as const,
      sets: 3,
      reps: isLoss ? '12-15' : '8-10',
      restSec: 90,
      notes: 'Neutral spine, pull toward hip crease.',
    },
    {
      id: 'ex-10',
      name: 'Overhead Barbell Military Press',
      muscleGroup: 'Shoulders' as const,
      sets: 3,
      reps: '8-10',
      restSec: 90,
      notes: 'Lock out overhead with tight glutes and braced core.',
    },
    {
      id: 'ex-12',
      name: 'Standing Dumbbell Bicep Curls',
      muscleGroup: 'Arms' as const,
      sets: 3,
      reps: '12',
      restSec: 60,
      notes: 'Controlled tempo on the eccentric lowering.',
    },
  ];

  // Build Day 2
  const day2Exercises = [
    {
      id: 'ex-4',
      name: 'Barbell Back Squat',
      muscleGroup: 'Legs' as const,
      sets: isStrength ? 5 : 4,
      reps: isStrength ? '5' : isLoss ? '10-12' : '6-8',
      restSec: 120,
      notes: 'Depth to parallel, keep knees tracking toes.',
    },
    {
      id: 'ex-5',
      name: 'Romanian Deadlift (RDL)',
      muscleGroup: 'Legs' as const,
      sets: 3,
      reps: '10',
      restSec: 90,
      notes: 'Hinge back at the hips to load the posterior chain.',
    },
    {
      id: 'ex-6',
      name: 'Walking Dumbbell Lunges',
      muscleGroup: 'Legs' as const,
      sets: 3,
      reps: '10 per leg',
      restSec: 75,
      notes: 'Upright posture, 90-degree knee bend.',
    },
    {
      id: 'ex-14',
      name: 'Hanging Leg Raises',
      muscleGroup: 'Core' as const,
      sets: 3,
      reps: '12-15',
      restSec: 60,
      notes: 'Controlled abdominal contraction without swinging.',
    },
  ];

  // Build Day 3
  const day3Exercises = [
    {
      id: 'ex-7',
      name: 'Pull-Ups / Chin-Ups',
      muscleGroup: 'Back' as const,
      sets: 3,
      reps: '6-10',
      restSec: 90,
      notes: 'Full range of motion from dead hang to chin over bar.',
    },
    {
      id: 'ex-2',
      name: 'Incline Dumbbell Press',
      muscleGroup: 'Chest' as const,
      sets: 3,
      reps: '10-12',
      restSec: 90,
      notes: 'Upper chest development with smooth tempo.',
    },
    {
      id: 'ex-11',
      name: 'Dumbbell Lateral Raise',
      muscleGroup: 'Shoulders' as const,
      sets: 4,
      reps: '12-15',
      restSec: 60,
      notes: 'Lead with elbows to isolate side delts.',
    },
    {
      id: 'ex-15',
      name: 'High Intensity Interval Sprint (HIIT)',
      muscleGroup: 'Cardio' as const,
      sets: isLoss ? 8 : 5,
      reps: '20s burst / 40s rest',
      restSec: 60,
      notes: 'Cardiovascular conditioning and metabolic conditioning.',
    },
  ];

  const days = [
    {
      dayName: 'Day 1: Upper Body Push & Pull',
      focus: 'Chest, Upper Back, Shoulders & Biceps',
      estimatedDurationMin: 50,
      exercises: day1Exercises,
    },
    {
      dayName: 'Day 2: Lower Body Power & Core',
      focus: 'Quads, Hamstrings, Glutes & Abs',
      estimatedDurationMin: 55,
      exercises: day2Exercises,
    },
    {
      dayName: 'Day 3: Hypertrophy & Conditioning',
      focus: 'Lats, Upper Chest, Delts & Cardio',
      estimatedDurationMin: 45,
      exercises: day3Exercises,
    },
  ];

  const isVeg = profile.dietPreference === 'Vegetarian' || profile.dietPreference === 'Vegan';

  const breakfastItem = isVeg
    ? { name: 'Tofu Scramble with Spinach & Oats Bowl', portion: '1 bowl + 80g oats', calories: Math.round(macros.dailyCalories * 0.28), protein: Math.round(macros.proteinGrams * 0.25), carbs: Math.round(macros.carbsGrams * 0.3), fat: Math.round(macros.fatGrams * 0.25) }
    : { name: 'Whole Eggs, Whites & Berry Oatmeal', portion: '3 eggs + 80g oats', calories: Math.round(macros.dailyCalories * 0.28), protein: Math.round(macros.proteinGrams * 0.28), carbs: Math.round(macros.carbsGrams * 0.3), fat: Math.round(macros.fatGrams * 0.25) };

  const lunchItem = isVeg
    ? { name: 'Lentil Dal & Paneer/Tempeh Quinoa Bowl', portion: '250g cooked', calories: Math.round(macros.dailyCalories * 0.33), protein: Math.round(macros.proteinGrams * 0.32), carbs: Math.round(macros.carbsGrams * 0.35), fat: Math.round(macros.fatGrams * 0.3) }
    : { name: 'Grilled Herb Chicken & Roasted Sweet Potato', portion: '200g chicken + 250g potato', calories: Math.round(macros.dailyCalories * 0.33), protein: Math.round(macros.proteinGrams * 0.35), carbs: Math.round(macros.carbsGrams * 0.35), fat: Math.round(macros.fatGrams * 0.28) };

  const snackItem = {
    name: isVeg ? 'Plant Protein Shake with Banana & Almonds' : 'Whey Protein Shake with Banana & Peanut Butter',
    portion: '1 shake + 1 fruit',
    calories: Math.round(macros.dailyCalories * 0.15),
    protein: Math.round(macros.proteinGrams * 0.18),
    carbs: Math.round(macros.carbsGrams * 0.15),
    fat: Math.round(macros.fatGrams * 0.18),
  };

  const dinnerItem = isVeg
    ? { name: 'Grilled Edamame & Chickpea Salad Bowl with Tahini', portion: '300g plate', calories: Math.round(macros.dailyCalories * 0.24), protein: Math.round(macros.proteinGrams * 0.25), carbs: Math.round(macros.carbsGrams * 0.2), fat: Math.round(macros.fatGrams * 0.27) }
    : { name: 'Baked Salmon with Steamed Greens & Brown Rice', portion: '180g salmon + veggies', calories: Math.round(macros.dailyCalories * 0.24), protein: Math.round(macros.proteinGrams * 0.27), carbs: Math.round(macros.carbsGrams * 0.2), fat: Math.round(macros.fatGrams * 0.29) };

  return {
    workoutPlan: {
      title: `${profile.fitnessGoal} - Optimized Protocol (${splitType})`,
      goal: profile.fitnessGoal,
      experienceLevel: profile.workoutExperience,
      splitType,
      days,
      generatedByAI: true,
      safetyTips: [
        'Always dedicate 5-8 minutes to dynamic hip and thoracic spine warmups before lifting.',
        'Prioritize technical form over the amount of weight loaded on the bar.',
        'Stay thoroughly hydrated with at least 500ml water before and during exercise.',
        'Stop exercise immediately if you experience dizziness, sharp joint pain, or shortness of breath.',
      ],
    },
    dietPlan: {
      title: `${profile.dietPreference} ${profile.fitnessGoal} Nutrition Plan`,
      goal: profile.fitnessGoal,
      dietaryPreference: profile.dietPreference,
      dailyCalories: macros.dailyCalories,
      proteinG: macros.proteinGrams,
      carbsG: macros.carbsGrams,
      fatsG: macros.fatGrams,
      waterLiters: macros.waterLiters,
      meals: [
        {
          mealType: 'Breakfast',
          name: 'Energizing Morning Fuel',
          calories: breakfastItem.calories,
          protein: breakfastItem.protein,
          carbs: breakfastItem.carbs,
          fat: breakfastItem.fat,
          items: [breakfastItem],
          tips: 'Pair with 500ml water and black coffee or green tea if desired.',
        },
        {
          mealType: 'Lunch',
          name: 'Mid-Day Nutrient Dense Fuel',
          calories: lunchItem.calories,
          protein: lunchItem.protein,
          carbs: lunchItem.carbs,
          fat: lunchItem.fat,
          items: [lunchItem],
          tips: 'Rich in complex carbs to replenish glycogen stores.',
        },
        {
          mealType: 'Evening Snack',
          name: 'Pre/Post-Workout Protein Boost',
          calories: snackItem.calories,
          protein: snackItem.protein,
          carbs: snackItem.carbs,
          fat: snackItem.fat,
          items: [snackItem],
          tips: 'Consume 45 minutes prior to your training session.',
        },
        {
          mealType: 'Dinner',
          name: 'Recovery & Protein Synthesis Dinner',
          calories: dinnerItem.calories,
          protein: dinnerItem.protein,
          carbs: dinnerItem.carbs,
          fat: dinnerItem.fat,
          items: [dinnerItem],
          tips: 'High in quality amino acids and micronutrients for overnight tissue recovery.',
        },
      ],
      guidelines: [
        `Aim for approximately ${macros.proteinGrams}g of protein daily to support muscle protein synthesis.`,
        `Maintain daily caloric intake near ${macros.dailyCalories} kcal to reach your target weight of ${profile.targetWeightKg} kg.`,
        `Drink at least ${macros.waterLiters} Liters of water daily for optimal hydration and metabolic performance.`,
      ],
      safetyWarnings: [
        'Safety Notice: Nutritional suggestions are calculated based on standard sports nutrition formulas for educational and fitness purposes.',
        'This program is not intended to treat, diagnose, or manage medical conditions or eating disorders.',
        'If you take prescription medication, are pregnant, or have metabolic conditions, consult your physician before altering caloric intake.',
      ],
      generatedByAI: true,
    },
    coachingSummary: `Based on your current weight of ${profile.weightKg}kg and target of ${profile.targetWeightKg}kg, your daily energy expenditure is ${tdee} kcal with a target of ${macros.dailyCalories} kcal. This balanced program optimizes progressive overload while protecting joint health.`,
    source: 'algorithmic_engine',
  };
}
