import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  assignedStaffId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  fitnessGoal: 'Weight Loss' | 'Muscle Gain' | 'General Fitness' | 'Endurance' | 'Strength';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';
  dietaryPreference: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Keto' | 'Pescatarian';
  workoutExperience: 'Beginner' | 'Intermediate' | 'Advanced';
  medicalNotes?: string;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  waterLiters: number;
  updatedAt: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body' | 'Cardio';
  sets: number;
  reps: string; // e.g., "8-12" or "12-15"
  durationSec?: number;
  restSec: number;
  weightRecommendation?: string;
  notes?: string;
}

export interface WorkoutDay {
  dayName: string; // e.g. "Day 1 - Push & Chest Focus"
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
  generatedByAI: boolean;
  assignedBy?: string;
  safetyTips: string[];
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
  guidelines: string[];
  safetyWarnings: string[];
  generatedByAI: boolean;
  assignedBy?: string;
  createdAt: string;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
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
  reminderTime: string; // e.g. "08:00"
  reminderDays: string[];
  lastTriggeredDate?: string;
  includeMotivationalQuote: boolean;
  updatedAt: string;
}

interface DatabaseSchema {
  users: User[];
  userProfiles: UserProfile[];
  workoutPlans: WorkoutPlan[];
  exerciseRecords: ExerciseRecord[];
  dietPlans: DietPlan[];
  progressHistory: ProgressEntry[];
  trainerNotes: TrainerNote[];
  notifications: NotificationItem[];
  notificationSettings: NotificationSettings[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'fitness_db.json');

// Initial seed exercise library
const DEFAULT_EXERCISES: ExerciseRecord[] = [
  {
    id: 'ex-1',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    category: 'Strength',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Lie back on a flat bench. Grip the barbell with hands slightly wider than shoulder-width.',
      'Unrack the bar and hold it straight over your chest with arms locked.',
      'Inhale and lower the bar slowly until it lightly touches your mid-chest.',
      'Drive the bar back up explosively while exhaling, keeping shoulder blades retracted.'
    ],
    tips: 'Keep your feet firmly planted on the floor and maintain a natural arch in your lower back.',
    primaryMuscle: 'Pectoralis Major',
    secondaryMuscles: ['Triceps Brachii', 'Anterior Deltoid']
  },
  {
    id: 'ex-2',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    category: 'Hypertrophy',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: [
      'Set an adjustable bench to an incline of 30-45 degrees.',
      'Hold a dumbbell in each hand resting on your thighs, then kick them up to shoulder height.',
      'Press the dumbbells upwards and together over your upper chest.',
      'Lower with control until elbows reach approximately 90 degrees.'
    ],
    tips: 'Do not bounce at the bottom. Control the eccentric phase for 2-3 seconds.',
    primaryMuscle: 'Clavicular Head (Upper Chest)',
    secondaryMuscles: ['Triceps', 'Front Delts']
  },
  {
    id: 'ex-3',
    name: 'Push-Ups (Strict Form)',
    muscleGroup: 'Chest',
    category: 'Calisthenics',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: [
      'Start in a high plank position with hands slightly outside shoulders.',
      'Keep core braced and body in a straight line from heels to head.',
      'Lower chest until 2 inches from the floor, elbows tracking at a 45-degree angle.',
      'Push back up to the starting position.'
    ],
    tips: 'Avoid flaring your elbows 90 degrees outward to protect your shoulder rotator cuffs.',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Core', 'Triceps']
  },
  {
    id: 'ex-4',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    category: 'Strength',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Position the bar across your upper traps, step back, and set feet shoulder-width apart.',
      'Break at hips and knees simultaneously, lowering hips down and back.',
      'Descend until thighs are parallel or below parallel to the floor.',
      'Drive through your mid-foot and heel to return to standing.'
    ],
    tips: 'Keep chest upright and push knees slightly outward along the line of your toes.',
    primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Gluteus Maximus', 'Hamstrings', 'Core']
  },
  {
    id: 'ex-5',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    category: 'Hypertrophy',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Stand holding barbell at thighs with an overhand grip.',
      'Hinge at hips, pushing your butt back while keeping a slight soft bend in knees.',
      'Lower the bar along your shins until you feel a deep stretch in hamstrings.',
      'Contract glutes and hamstrings to bring hips forward to starting position.'
    ],
    tips: 'Maintain a flat neutral spine. The movement is a pure hip hinge, not a squat.',
    primaryMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Erector Spinae']
  },
  {
    id: 'ex-6',
    name: 'Walking Dumbbell Lunges',
    muscleGroup: 'Legs',
    category: 'Hypertrophy',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: [
      'Stand upright holding dumbbells at your sides.',
      'Step forward with your right leg, landing on heel then forefoot.',
      'Lower hips until both knees form roughly 90-degree angles.',
      'Push off the front foot to step directly into the next stride with the opposite leg.'
    ],
    tips: 'Keep torso upright and do not let the front knee collapse inward.',
    primaryMuscle: 'Quadriceps & Glutes',
    secondaryMuscles: ['Calves', 'Core stabilizers']
  },
  {
    id: 'ex-7',
    name: 'Pull-Ups / Chin-Ups',
    muscleGroup: 'Back',
    category: 'Strength',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    instructions: [
      'Grip the pull-up bar with hands just outside shoulder-width (overhand grip).',
      'Hang with arms fully extended (dead hang).',
      'Engage lats and pull chest toward the bar by driving elbows down to your pockets.',
      'Clear bar with chin, pause, then lower with control.'
    ],
    tips: 'Avoid swinging or kipping. Use a resistance band if building initial strength.',
    primaryMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps', 'Rhomboids', 'Rear Delts']
  },
  {
    id: 'ex-8',
    name: 'Bent-Over Barbell Row',
    muscleGroup: 'Back',
    category: 'Strength',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Hinge at hips until torso is roughly 45 degrees to the floor.',
      'Grip bar with an overhand or underhand grip just wider than shoulder width.',
      'Pull the barbell to your lower ribcage, squeezing shoulder blades together.',
      'Lower the weight smoothly under full control.'
    ],
    tips: 'Do not jerk your upper body up to bounce momentum into the lift.',
    primaryMuscle: 'Upper Back & Lats',
    secondaryMuscles: ['Biceps', 'Trapezius', 'Posterior Deltoids']
  },
  {
    id: 'ex-9',
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    category: 'Hypertrophy',
    equipment: 'Cables',
    difficulty: 'Beginner',
    instructions: [
      'Sit on the bench with feet on footrests and knees slightly bent.',
      'Grasp the V-bar handle with arms outstretched and spine neutral.',
      'Pull the handle toward your abdomen while keeping elbows tucked.',
      'Hold the contraction for 1 second, then slowly release.'
    ],
    tips: 'Do not swing back and forth excessively with your lower back.',
    primaryMuscle: 'Rhomboids & Lats',
    secondaryMuscles: ['Biceps', 'Middle Traps']
  },
  {
    id: 'ex-10',
    name: 'Overhead Barbell Military Press',
    muscleGroup: 'Shoulders',
    category: 'Strength',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Hold the barbell on your front collarbone with hands shoulder-width apart.',
      'Squeeze glutes and brace abs tightly.',
      'Press the bar vertically upwards, moving head slightly back then pushing forward as bar clears crown.',
      'Lock out overhead with bar centered above mid-foot.'
    ],
    tips: 'Do not overarch your lumbar spine. Squeeze glutes to protect your back.',
    primaryMuscle: 'Anterior & Lateral Deltoid',
    secondaryMuscles: ['Triceps', 'Upper Traps', 'Core']
  },
  {
    id: 'ex-11',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    category: 'Hypertrophy',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: [
      'Stand holding light dumbbells at your sides with palms facing inwards.',
      'Raise arms out to sides with slight bend in elbows until parallel to the floor.',
      'Pause for a split second at the peak contraction.',
      'Lower slowly back to starting position.'
    ],
    tips: 'Lead with your elbows and avoid using momentum or shrugging your traps.',
    primaryMuscle: 'Lateral Deltoid',
    secondaryMuscles: ['Supraspinatus']
  },
  {
    id: 'ex-12',
    name: 'Standing Dumbbell Bicep Curls',
    muscleGroup: 'Arms',
    category: 'Hypertrophy',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: [
      'Hold dumbbells by your sides with arms extended and palms facing forward.',
      'Curl the weights upward while keeping upper arms stationary.',
      'Squeeze biceps at the top of the contraction.',
      'Lower under control for a 2-second count.'
    ],
    tips: 'Keep elbows pinned to your ribs; do not swing weights with your torso.',
    primaryMuscle: 'Biceps Brachii',
    secondaryMuscles: ['Brachialis', 'Brachioradialis']
  },
  {
    id: 'ex-13',
    name: 'Triceps Rope Pushdown',
    muscleGroup: 'Arms',
    category: 'Hypertrophy',
    equipment: 'Cables',
    difficulty: 'Beginner',
    instructions: [
      'Attach a rope to high cable pulley. Grasp ends with neutral grip.',
      'Start with forearms at slightly above 90 degrees.',
      'Push rope down and flare rope ends slightly outwards at bottom lockout.',
      'Squeeze triceps hard, then return with control.'
    ],
    tips: 'Keep elbows locked at your sides throughout the entire range of motion.',
    primaryMuscle: 'Triceps Brachii (Lateral & Medial heads)',
    secondaryMuscles: ['Anconeus']
  },
  {
    id: 'ex-14',
    name: 'Hanging Leg Raises',
    muscleGroup: 'Core',
    category: 'Calisthenics',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    instructions: [
      'Hang from a pull-up bar with straight arms and legs together.',
      'Contract abs and tilt pelvis backward.',
      'Raise straight legs (or knees if modifying) until thighs are parallel or higher to ground.',
      'Lower smoothly without swinging back and forth.'
    ],
    tips: 'Initiate the movement by rolling your pelvis up, not just flexing hips.',
    primaryMuscle: 'Rectus Abdominis (Lower)',
    secondaryMuscles: ['Hip Flexors', 'Obliques']
  },
  {
    id: 'ex-15',
    name: 'High Intensity Interval Sprint (HIIT)',
    muscleGroup: 'Cardio',
    category: 'Cardio',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    instructions: [
      'Warm up with 3 minutes of brisk jogging.',
      'Perform all-out maximum sprint for 20 seconds.',
      'Walk or slow jog for 40 seconds recovery.',
      'Repeat for 8 to 10 total rounds, followed by cooldown walk.'
    ],
    tips: 'Ensure proper running footwear and perform dynamic hamstring warmups first.',
    primaryMuscle: 'Cardiovascular System',
    secondaryMuscles: ['Legs', 'Core']
  }
];

class Database {
  private data: DatabaseSchema = {
    users: [],
    userProfiles: [],
    workoutPlans: [],
    exerciseRecords: [],
    dietPlans: [],
    progressHistory: [],
    trainerNotes: [],
    notifications: [],
    notificationSettings: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(content);
        if (!this.data.notifications) this.data.notifications = [];
        if (!this.data.notificationSettings) this.data.notificationSettings = [];
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database, seeding fallback data:', err);
      this.seedInitialData();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to disk:', err);
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);

    // 1. Users with 3 Roles: User, Staff, Admin
    const userUser: User = {
      id: 'usr-1',
      name: 'Alex Mercer',
      email: 'alex@fitpulse.ai',
      passwordHash,
      role: 'user',
      assignedStaffId: 'usr-2',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    };

    const staffUser: User = {
      id: 'usr-2',
      name: 'Coach Sarah Jenkins',
      email: 'coach.sarah@fitpulse.ai',
      passwordHash,
      role: 'staff',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    };

    const adminUser: User = {
      id: 'usr-3',
      name: 'System Admin',
      email: 'admin@fitpulse.ai',
      passwordHash,
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    };

    this.data.users = [userUser, staffUser, adminUser];

    // 2. User Profiles
    this.data.userProfiles = [
      {
        id: 'prof-1',
        userId: 'usr-1',
        age: 26,
        gender: 'Male',
        heightCm: 178,
        weightKg: 75.5,
        targetWeightKg: 80.0,
        fitnessGoal: 'Muscle Gain',
        activityLevel: 'Moderately Active',
        dietaryPreference: 'Non-Vegetarian',
        workoutExperience: 'Intermediate',
        medicalNotes: 'Slight past left shoulder tightness, focus on warmup.',
        bmr: 1740,
        tdee: 2697,
        dailyCalories: 2950,
        targetProtein: 165,
        targetCarbs: 370,
        targetFat: 85,
        waterLiters: 3.2,
        updatedAt: new Date().toISOString(),
      },
    ];

    // 3. Exercise Records
    this.data.exerciseRecords = [...DEFAULT_EXERCISES];

    // 4. Workout Plans
    this.data.workoutPlans = [
      {
        id: 'plan-1',
        userId: 'usr-1',
        title: 'Hypertrophy Upper/Lower 4-Day Split',
        goal: 'Muscle Gain',
        experienceLevel: 'Intermediate',
        splitType: 'Upper / Lower',
        days: [
          {
            dayName: 'Day 1: Upper Body Strength & Power',
            focus: 'Chest, Back, Delts & Arms',
            estimatedDurationMin: 55,
            exercises: [
              {
                id: 'ex-1',
                name: 'Barbell Bench Press',
                muscleGroup: 'Chest',
                sets: 4,
                reps: '6-8',
                restSec: 120,
                weightRecommendation: '70-80% 1RM',
                notes: 'Control descent for 2 seconds, pause on chest, explode up.',
              },
              {
                id: 'ex-8',
                name: 'Bent-Over Barbell Row',
                muscleGroup: 'Back',
                sets: 4,
                reps: '8-10',
                restSec: 90,
                weightRecommendation: 'Moderate heavy',
                notes: 'Drive elbows toward hips, squeeze scapulae.',
              },
              {
                id: 'ex-10',
                name: 'Overhead Barbell Military Press',
                muscleGroup: 'Shoulders',
                sets: 3,
                reps: '8-10',
                restSec: 90,
                notes: 'Keep core tight, do not lean back.',
              },
              {
                id: 'ex-12',
                name: 'Standing Dumbbell Bicep Curls',
                muscleGroup: 'Arms',
                sets: 3,
                reps: '12',
                restSec: 60,
                notes: 'Supinate wrists at top for maximal contraction.',
              },
            ],
          },
          {
            dayName: 'Day 2: Lower Body Quad & Glute Focus',
            focus: 'Quads, Glutes & Calves',
            estimatedDurationMin: 60,
            exercises: [
              {
                id: 'ex-4',
                name: 'Barbell Back Squat',
                muscleGroup: 'Legs',
                sets: 4,
                reps: '6-8',
                restSec: 150,
                weightRecommendation: 'Heavy working weight',
                notes: 'Maintain neutral spine and full depth.',
              },
              {
                id: 'ex-5',
                name: 'Romanian Deadlift (RDL)',
                muscleGroup: 'Legs',
                sets: 3,
                reps: '8-10',
                restSec: 90,
                notes: 'Feel deep stretch in hamstrings without rounding back.',
              },
              {
                id: 'ex-6',
                name: 'Walking Dumbbell Lunges',
                muscleGroup: 'Legs',
                sets: 3,
                reps: '12 per leg',
                restSec: 75,
                notes: 'Step forward cleanly, keep torso upright.',
              },
              {
                id: 'ex-14',
                name: 'Hanging Leg Raises',
                muscleGroup: 'Core',
                sets: 3,
                reps: '12-15',
                restSec: 60,
                notes: 'Prevent body swing, roll pelvis upward.',
              },
            ],
          },
          {
            dayName: 'Day 3: Active Rest & Recovery',
            focus: 'Mobility, Light Cardio & Core',
            estimatedDurationMin: 30,
            exercises: [
              {
                id: 'ex-3',
                name: 'Push-Ups (Strict Form)',
                muscleGroup: 'Chest',
                sets: 3,
                reps: '15',
                restSec: 60,
                notes: 'Slow controlled tempo for blood flow.',
              },
              {
                id: 'ex-15',
                name: 'High Intensity Interval Sprint (HIIT)',
                muscleGroup: 'Cardio',
                sets: 6,
                reps: '20s sprint / 40s rest',
                restSec: 60,
                notes: 'Moderate-high cardiovascular conditioning.',
              },
            ],
          },
        ],
        generatedByAI: true,
        safetyTips: [
          'Perform a 5-10 minute dynamic warmup before heavy lifts.',
          'Always use safety collars on barbells.',
          'Stop immediately if experiencing sharp joint pain (especially in shoulders or knees).',
          'Stay properly hydrated with at least 500ml water during workouts.',
        ],
        createdAt: new Date().toISOString(),
      },
    ];

    // 5. Diet Plans
    this.data.dietPlans = [
      {
        id: 'diet-1',
        userId: 'usr-1',
        title: 'High-Protein Clean Hypertrophy Fuel',
        goal: 'Muscle Gain',
        dietaryPreference: 'Non-Vegetarian',
        dailyCalories: 2950,
        proteinG: 165,
        carbsG: 370,
        fatsG: 85,
        waterLiters: 3.2,
        meals: [
          {
            mealType: 'Breakfast',
            name: 'Power Protein Oats & Scramble',
            calories: 720,
            protein: 48,
            carbs: 85,
            fat: 20,
            items: [
              { name: 'Rolled Oats with Almond Milk', portion: '100g dry', calories: 380, protein: 12, carbs: 68, fat: 6 },
              { name: 'Whole Eggs & Egg Whites Scramble', portion: '3 eggs + 2 whites', calories: 240, protein: 26, carbs: 2, fat: 14 },
              { name: 'Fresh Blueberries & Honey', portion: '1 cup', calories: 100, protein: 1, carbs: 25, fat: 0 },
            ],
            tips: 'Drink 500ml cold water alongside breakfast.',
          },
          {
            mealType: 'Lunch',
            name: 'Grilled Herb Chicken & Sweet Potato Bowl',
            calories: 820,
            protein: 55,
            carbs: 95,
            fat: 22,
            items: [
              { name: 'Grilled Chicken Breast', portion: '200g', calories: 330, protein: 46, carbs: 0, fat: 7 },
              { name: 'Baked Sweet Potato', portion: '300g', calories: 270, protein: 4, carbs: 62, fat: 0 },
              { name: 'Steamed Broccoli with Olive Oil', portion: '1.5 cups + 1 tbsp oil', calories: 160, protein: 4, carbs: 10, fat: 14 },
            ],
            tips: 'Rich in potassium and micronutrients to fuel afternoon workouts.',
          },
          {
            mealType: 'Evening Snack',
            name: 'Whey Protein Shake with Banana & Peanut Butter',
            calories: 460,
            protein: 35,
            carbs: 45,
            fat: 14,
            items: [
              { name: 'Whey Isolate Protein Powder', portion: '1 scoop (30g)', calories: 120, protein: 25, carbs: 2, fat: 1 },
              { name: 'Ripe Banana', portion: '1 medium', calories: 110, protein: 1, carbs: 28, fat: 0 },
              { name: 'Natural Peanut Butter', portion: '1.5 tbsp', calories: 140, protein: 6, carbs: 5, fat: 12 },
              { name: 'Low-fat Milk / Soy Milk', portion: '250ml', calories: 90, protein: 8, carbs: 10, fat: 2 },
            ],
            tips: 'Consume 45-60 minutes before training for glycogen top-up.',
          },
          {
            mealType: 'Dinner',
            name: 'Salmon Fillet with Quinoa & Asparagus',
            calories: 780,
            protein: 42,
            carbs: 75,
            fat: 28,
            items: [
              { name: 'Pan-seared Atlantic Salmon', portion: '180g', calories: 370, protein: 36, carbs: 0, fat: 22 },
              { name: 'Cooked Quinoa', portion: '200g', calories: 240, protein: 8, carbs: 42, fat: 4 },
              { name: 'Charred Asparagus Spears', portion: '150g with lemon', calories: 50, protein: 3, carbs: 6, fat: 1 },
            ],
            tips: 'Rich in Omega-3 fatty acids for muscle protein synthesis and joint recovery.',
          },
        ],
        guidelines: [
          'Spread protein evenly across 4 meals (approx 35-50g per meal).',
          'Prioritize whole carbohydrate sources (sweet potato, oats, quinoa, fruit) for sustained energy.',
          'Consume 500ml water upon waking and before each major meal.',
        ],
        safetyWarnings: [
          'Diet recommendations are intended for general fitness and performance, not clinical treatment.',
          'Consult a licensed dietitian or physician before making radical caloric or dietary changes.',
          'Verify meal selections against any known food allergies or medical restrictions.',
        ],
        generatedByAI: true,
        createdAt: new Date().toISOString(),
      },
    ];

    // 6. Progress History (14 days of realistic logs)
    const baseDate = new Date();
    this.data.progressHistory = [
      {
        id: 'prog-1',
        userId: 'usr-1',
        date: new Date(baseDate.getTime() - 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
        weightKg: 74.2,
        workoutsCompleted: 1,
        completedWorkoutTitle: 'Upper Body Strength',
        caloriesConsumed: 2850,
        notes: 'Felt strong, solid bench press sets.',
        loggedAt: new Date(baseDate.getTime() - 14 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'prog-2',
        userId: 'usr-1',
        date: new Date(baseDate.getTime() - 12 * 24 * 3600 * 1000).toISOString().split('T')[0],
        weightKg: 74.5,
        workoutsCompleted: 1,
        completedWorkoutTitle: 'Lower Body Quads',
        caloriesConsumed: 2900,
        notes: 'Hit squat depth, good quad pump.',
        loggedAt: new Date(baseDate.getTime() - 12 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'prog-3',
        userId: 'usr-1',
        date: new Date(baseDate.getTime() - 9 * 24 * 3600 * 1000).toISOString().split('T')[0],
        weightKg: 74.8,
        workoutsCompleted: 1,
        completedWorkoutTitle: 'Upper Body Strength',
        caloriesConsumed: 2920,
        notes: 'Moved bench up 2.5kg.',
        loggedAt: new Date(baseDate.getTime() - 9 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'prog-4',
        userId: 'usr-1',
        date: new Date(baseDate.getTime() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
        weightKg: 75.0,
        workoutsCompleted: 1,
        completedWorkoutTitle: 'Lower Body Quads',
        caloriesConsumed: 3000,
        notes: 'Hamstring stretch felt great on RDLs.',
        loggedAt: new Date(baseDate.getTime() - 7 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'prog-5',
        userId: 'usr-1',
        date: new Date(baseDate.getTime() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
        weightKg: 75.2,
        workoutsCompleted: 1,
        completedWorkoutTitle: 'Upper Body Hypertrophy',
        caloriesConsumed: 2950,
        notes: 'Excellent arm pump, energy was high.',
        loggedAt: new Date(baseDate.getTime() - 4 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'prog-6',
        userId: 'usr-1',
        date: new Date(baseDate.getTime() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
        weightKg: 75.5,
        workoutsCompleted: 1,
        completedWorkoutTitle: 'Lower Body & Core',
        caloriesConsumed: 2980,
        notes: 'Progressing nicely towards target 80kg weight goal!',
        loggedAt: new Date(baseDate.getTime() - 1 * 24 * 3600 * 1000).toISOString(),
      },
    ];

    // 7. Trainer Notes
    this.data.trainerNotes = [
      {
        id: 'note-1',
        staffId: 'usr-2',
        staffName: 'Coach Sarah Jenkins',
        userId: 'usr-1',
        clientName: 'Alex Mercer',
        note: 'Alex has shown consistent 4-day attendance. Bench press form looks stable with retracted scapula. Recommend progressive overload of +1kg on squats next week.',
        recommendation: 'Increase pre-workout carbohydrate intake by 25g on lower body days.',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      },
    ];
  }

  // Collection Accessors with MongoDB-like semantics
  public get users() {
    return {
      find: (filter?: Partial<User>) => {
        if (!filter) return [...this.data.users];
        return this.data.users.filter((u) =>
          Object.entries(filter).every(([k, v]) => (u as any)[k] === v)
        );
      },
      findOne: (filter: Partial<User>) => {
        return (
          this.data.users.find((u) =>
            Object.entries(filter).every(([k, v]) => (u as any)[k] === v)
          ) || null
        );
      },
      findById: (id: string) => this.data.users.find((u) => u.id === id) || null,
      insertOne: (user: User) => {
        this.data.users.push(user);
        this.save();
        return user;
      },
      updateOne: (id: string, updates: Partial<User>) => {
        const index = this.data.users.findIndex((u) => u.id === id);
        if (index === -1) return null;
        this.data.users[index] = { ...this.data.users[index], ...updates };
        this.save();
        return this.data.users[index];
      },
      deleteOne: (id: string) => {
        const initial = this.data.users.length;
        this.data.users = this.data.users.filter((u) => u.id !== id);
        this.save();
        return this.data.users.length < initial;
      },
      countDocuments: () => this.data.users.length,
    };
  }

  public get userProfiles() {
    return {
      findOne: (filter: Partial<UserProfile>) => {
        return (
          this.data.userProfiles.find((p) =>
            Object.entries(filter).every(([k, v]) => (p as any)[k] === v)
          ) || null
        );
      },
      findByUserId: (userId: string) =>
        this.data.userProfiles.find((p) => p.userId === userId) || null,
      insertOne: (profile: UserProfile) => {
        this.data.userProfiles.push(profile);
        this.save();
        return profile;
      },
      updateOne: (userId: string, updates: Partial<UserProfile>) => {
        const index = this.data.userProfiles.findIndex((p) => p.userId === userId);
        if (index === -1) return null;
        this.data.userProfiles[index] = {
          ...this.data.userProfiles[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.save();
        return this.data.userProfiles[index];
      },
      countDocuments: () => this.data.userProfiles.length,
    };
  }

  public get workoutPlans() {
    return {
      find: (filter?: Partial<WorkoutPlan>) => {
        if (!filter) return [...this.data.workoutPlans];
        return this.data.workoutPlans.filter((w) =>
          Object.entries(filter).every(([k, v]) => (w as any)[k] === v)
        );
      },
      findByUserId: (userId: string) =>
        this.data.workoutPlans.filter((w) => w.userId === userId),
      findById: (id: string) => this.data.workoutPlans.find((w) => w.id === id) || null,
      insertOne: (plan: WorkoutPlan) => {
        this.data.workoutPlans.unshift(plan);
        this.save();
        return plan;
      },
      updateOne: (id: string, updates: Partial<WorkoutPlan>) => {
        const index = this.data.workoutPlans.findIndex((w) => w.id === id);
        if (index === -1) return null;
        this.data.workoutPlans[index] = { ...this.data.workoutPlans[index], ...updates };
        this.save();
        return this.data.workoutPlans[index];
      },
      deleteOne: (id: string) => {
        const len = this.data.workoutPlans.length;
        this.data.workoutPlans = this.data.workoutPlans.filter((w) => w.id !== id);
        this.save();
        return this.data.workoutPlans.length < len;
      },
      countDocuments: () => this.data.workoutPlans.length,
    };
  }

  public get exerciseRecords() {
    return {
      find: (filter?: Partial<ExerciseRecord>) => {
        if (!filter) return [...this.data.exerciseRecords];
        return this.data.exerciseRecords.filter((e) =>
          Object.entries(filter).every(([k, v]) => (e as any)[k] === v)
        );
      },
      findById: (id: string) =>
        this.data.exerciseRecords.find((e) => e.id === id) || null,
      insertOne: (ex: ExerciseRecord) => {
        this.data.exerciseRecords.push(ex);
        this.save();
        return ex;
      },
      updateOne: (id: string, updates: Partial<ExerciseRecord>) => {
        const idx = this.data.exerciseRecords.findIndex((e) => e.id === id);
        if (idx === -1) return null;
        this.data.exerciseRecords[idx] = { ...this.data.exerciseRecords[idx], ...updates };
        this.save();
        return this.data.exerciseRecords[idx];
      },
      deleteOne: (id: string) => {
        const len = this.data.exerciseRecords.length;
        this.data.exerciseRecords = this.data.exerciseRecords.filter((e) => e.id !== id);
        this.save();
        return this.data.exerciseRecords.length < len;
      },
      countDocuments: () => this.data.exerciseRecords.length,
    };
  }

  public get dietPlans() {
    return {
      find: (filter?: Partial<DietPlan>) => {
        if (!filter) return [...this.data.dietPlans];
        return this.data.dietPlans.filter((d) =>
          Object.entries(filter).every(([k, v]) => (d as any)[k] === v)
        );
      },
      findByUserId: (userId: string) =>
        this.data.dietPlans.filter((d) => d.userId === userId),
      findById: (id: string) => this.data.dietPlans.find((d) => d.id === id) || null,
      insertOne: (plan: DietPlan) => {
        this.data.dietPlans.unshift(plan);
        this.save();
        return plan;
      },
      updateOne: (id: string, updates: Partial<DietPlan>) => {
        const idx = this.data.dietPlans.findIndex((d) => d.id === id);
        if (idx === -1) return null;
        this.data.dietPlans[idx] = { ...this.data.dietPlans[idx], ...updates };
        this.save();
        return this.data.dietPlans[idx];
      },
      deleteOne: (id: string) => {
        const len = this.data.dietPlans.length;
        this.data.dietPlans = this.data.dietPlans.filter((d) => d.id !== id);
        this.save();
        return this.data.dietPlans.length < len;
      },
      countDocuments: () => this.data.dietPlans.length,
    };
  }

  public get progressHistory() {
    return {
      findByUserId: (userId: string) =>
        this.data.progressHistory
          .filter((p) => p.userId === userId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      insertOne: (entry: ProgressEntry) => {
        this.data.progressHistory.push(entry);
        this.save();
        return entry;
      },
      deleteOne: (id: string) => {
        const len = this.data.progressHistory.length;
        this.data.progressHistory = this.data.progressHistory.filter((p) => p.id !== id);
        this.save();
        return this.data.progressHistory.length < len;
      },
      countDocuments: () => this.data.progressHistory.length,
    };
  }

  public get trainerNotes() {
    return {
      findByUserId: (userId: string) =>
        this.data.trainerNotes
          .filter((n) => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      findByStaffId: (staffId: string) =>
        this.data.trainerNotes
          .filter((n) => n.staffId === staffId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      insertOne: (note: TrainerNote) => {
        this.data.trainerNotes.unshift(note);
        this.save();
        return note;
      },
      countDocuments: () => this.data.trainerNotes.length,
    };
  }

  public get notifications() {
    return {
      findByUserId: (userId: string) =>
        (this.data.notifications || [])
          .filter((n) => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      findById: (id: string) =>
        (this.data.notifications || []).find((n) => n.id === id) || null,
      insertOne: (item: NotificationItem) => {
        if (!this.data.notifications) this.data.notifications = [];
        this.data.notifications.unshift(item);
        this.save();
        return item;
      },
      markRead: (id: string) => {
        if (!this.data.notifications) return null;
        const item = this.data.notifications.find((n) => n.id === id);
        if (item) {
          item.status = 'read';
          item.readAt = new Date().toISOString();
          this.save();
        }
        return item;
      },
      markAllRead: (userId: string) => {
        if (!this.data.notifications) return 0;
        let count = 0;
        const now = new Date().toISOString();
        this.data.notifications.forEach((n) => {
          if (n.userId === userId && n.status !== 'read') {
            n.status = 'read';
            n.readAt = now;
            count++;
          }
        });
        if (count > 0) this.save();
        return count;
      },
      countDocuments: () => (this.data.notifications || []).length,
    };
  }

  public get notificationSettings() {
    return {
      findByUserId: (userId: string): NotificationSettings => {
        if (!this.data.notificationSettings) this.data.notificationSettings = [];
        let settings = this.data.notificationSettings.find((s) => s.userId === userId);
        if (!settings) {
          settings = {
            userId,
            pushEnabled: true,
            emailEnabled: true,
            reminderTime: '08:00',
            reminderDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            includeMotivationalQuote: true,
            updatedAt: new Date().toISOString(),
          };
          this.data.notificationSettings.push(settings);
          this.save();
        }
        return settings;
      },
      upsert: (userId: string, updates: Partial<NotificationSettings>) => {
        if (!this.data.notificationSettings) this.data.notificationSettings = [];
        const index = this.data.notificationSettings.findIndex((s) => s.userId === userId);
        const now = new Date().toISOString();
        if (index === -1) {
          const newSettings: NotificationSettings = {
            userId,
            pushEnabled: updates.pushEnabled ?? true,
            emailEnabled: updates.emailEnabled ?? true,
            reminderTime: updates.reminderTime || '08:00',
            reminderDays: updates.reminderDays || [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            includeMotivationalQuote: updates.includeMotivationalQuote ?? true,
            lastTriggeredDate: updates.lastTriggeredDate,
            updatedAt: now,
          };
          this.data.notificationSettings.push(newSettings);
          this.save();
          return newSettings;
        } else {
          this.data.notificationSettings[index] = {
            ...this.data.notificationSettings[index],
            ...updates,
            updatedAt: now,
          };
          this.save();
          return this.data.notificationSettings[index];
        }
      },
    };
  }
}

export const db = new Database();
