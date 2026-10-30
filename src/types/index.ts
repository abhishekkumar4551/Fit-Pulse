export type UserRole = 'user' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedStaffId?: string;
  createdAt?: string;
}

export type FitnessGoal = 'Weight Loss' | 'Muscle Gain' | 'General Fitness' | 'Endurance' | 'Strength';
export type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';
export type Gender = 'Male' | 'Female' | 'Other';
export type DietaryPreference = 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Keto' | 'Pescatarian';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserProfile {
  id: string;
  userId: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  workoutExperience: ExperienceLevel;
  medicalNotes?: string;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  waterLiters: number;
  updatedAt?: string;
}

export interface BmiInfo {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese';
  color: string;
  healthyWeightRange: { min: number; max: number };
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body' | 'Cardio';
  sets: number;
  reps: string;
  durationSec?: number;
  restSec: number;
  weightRecommendation?: string;
  notes?: string;
}

export interface WorkoutDay {
  dayName: string;
  focus: string;
  estimatedDurationMin: number;
  exercises: ExerciseItem[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  title: string;
  goal: string;
  experienceLevel: string;
  splitType: string;
  days: WorkoutDay[];
  generatedByAI?: boolean;
  assignedBy?: string;
  safetyTips?: string[];
  createdAt: string;
}

export interface ExerciseRecord {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body' | 'Cardio';
  category: 'Strength' | 'Hypertrophy' | 'Cardio' | 'Mobility' | 'Calisthenics';
  equipment: 'Barbell' | 'Dumbbells' | 'Cables' | 'Machine' | 'Bodyweight' | 'Kettlebell' | 'Resistance Band';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string[];
  tips: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
}

export interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealSlot {
  mealType: 'Breakfast' | 'Morning Snack' | 'Lunch' | 'Evening Snack' | 'Dinner';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: MealItem[];
  tips?: string;
}

export interface DietPlan {
  id: string;
  userId: string;
  title: string;
  goal: string;
  dietaryPreference: string;
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  waterLiters: number;
  meals: MealSlot[];
  guidelines?: string[];
  safetyWarnings?: string[];
  generatedByAI?: boolean;
  assignedBy?: string;
  createdAt: string;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  workoutsCompleted: number;
  completedWorkoutTitle?: string;
  caloriesConsumed?: number;
  notes?: string;
  loggedAt: string;
}

export interface TrainerNote {
  id: string;
  staffId: string;
  staffName: string;
  userId: string;
  clientName: string;
  note: string;
  recommendation?: string;
  createdAt: string;
}

export interface ClientOverview {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  profile: UserProfile | null;
  workoutCount: number;
  progressCount: number;
  latestWeight?: number;
  trainerNotes: TrainerNote[];
}

export interface SystemStats {
  totalUsers: number;
  regularUsers: number;
  staffMembers: number;
  admins: number;
  totalWorkouts: number;
  totalExercises: number;
  totalDietPlans: number;
  totalProgressLogs: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  workoutDayName?: string;
  exerciseCount?: number;
  channel: 'push' | 'email' | 'in_app';
  status: 'sent' | 'delivered' | 'read';
  emailDetails?: {
    to: string;
    subject: string;
    htmlBody: string;
    sentAt: string;
  };
  createdAt: string;
  readAt?: string;
}

export interface NotificationSettings {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  reminderTime: string;
  reminderDays: string[];
  lastTriggeredDate?: string;
  includeMotivationalQuote: boolean;
  updatedAt: string;
}

