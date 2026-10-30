import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, type UserRole } from './server/db.ts';
import { generateFitnessPlan } from './server/ai.ts';
import { calculateBMI, calculateBMR, calculateTDEE, calculateMacroTargets } from './src/utils/fitnessCalc.ts';
import { startWorkoutReminderBackgroundJob, executeWorkoutReminderJob } from './server/scheduler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fitpulse-super-secret-jwt-key-2026';

app.use(express.json());

// Extend express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token' });
  }
}

// Role Authorization Middleware
function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role = 'user' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const existing = db.users.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = `usr-${Date.now()}`;

  const newUser = db.users.insertOne({
    id: userId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: role === 'admin' ? 'user' : (role as UserRole), // Security: prevent self-assigning admin directly via public register
    createdAt: new Date().toISOString(),
  });

  // Create default starter profile
  db.userProfiles.insertOne({
    id: `prof-${Date.now()}`,
    userId,
    age: 25,
    gender: 'Male',
    heightCm: 175,
    weightKg: 70,
    targetWeightKg: 70,
    fitnessGoal: 'General Fitness',
    activityLevel: 'Moderately Active',
    dietaryPreference: 'Non-Vegetarian',
    workoutExperience: 'Beginner',
    bmr: 1680,
    tdee: 2604,
    dailyCalories: 2600,
    targetProtein: 140,
    targetCarbs: 325,
    targetFat: 72,
    waterLiters: 2.9,
    updatedAt: new Date().toISOString(),
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const validPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Demo switch login (Instant role switcher for CSE college project grading & preview)
app.post('/api/auth/demo-login', (req: Request, res: Response) => {
  const { role = 'user' } = req.body;

  let user = db.users.findOne({ role: role as UserRole });
  if (!user) {
    user = db.users.findOne({ role: 'user' });
  }

  if (!user) {
    return res.status(404).json({ error: 'Demo account not found' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Get Current Logged-in User
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = db.users.findById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedStaffId: user.assignedStaffId,
      createdAt: user.createdAt,
    },
  });
});

// ==========================================
// 2. USER PROFILE ROUTES
// ==========================================

// Get profile
app.get('/api/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  const targetUserId = req.query.userId ? String(req.query.userId) : req.user!.id;

  // Non-staff/admin cannot view other users' profiles
  if (targetUserId !== req.user!.id && req.user!.role === 'user') {
    return res.status(403).json({ error: 'Access denied to view other profiles' });
  }

  let profile = db.userProfiles.findByUserId(targetUserId);
  if (!profile) {
    // initialize if missing
    profile = db.userProfiles.insertOne({
      id: `prof-${Date.now()}`,
      userId: targetUserId,
      age: 25,
      gender: 'Male',
      heightCm: 175,
      weightKg: 70,
      targetWeightKg: 70,
      fitnessGoal: 'General Fitness',
      activityLevel: 'Moderately Active',
      dietaryPreference: 'Non-Vegetarian',
      workoutExperience: 'Beginner',
      bmr: 1680,
      tdee: 2604,
      dailyCalories: 2600,
      targetProtein: 140,
      targetCarbs: 325,
      targetFat: 72,
      waterLiters: 2.9,
      updatedAt: new Date().toISOString(),
    });
  }

  const bmiInfo = calculateBMI(profile.weightKg, profile.heightCm);

  return res.json({
    profile,
    bmiInfo,
  });
});

// Update profile with automatic BMR/TDEE/Macro recalculation
app.put('/api/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const updates = req.body;

  const currentProfile = db.userProfiles.findByUserId(userId);
  if (!currentProfile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const age = updates.age !== undefined ? Number(updates.age) : currentProfile.age;
  const gender = updates.gender || currentProfile.gender;
  const heightCm = updates.heightCm !== undefined ? Number(updates.heightCm) : currentProfile.heightCm;
  const weightKg = updates.weightKg !== undefined ? Number(updates.weightKg) : currentProfile.weightKg;
  const targetWeightKg = updates.targetWeightKg !== undefined ? Number(updates.targetWeightKg) : currentProfile.targetWeightKg;
  const fitnessGoal = updates.fitnessGoal || currentProfile.fitnessGoal;
  const activityLevel = updates.activityLevel || currentProfile.activityLevel;
  const dietaryPreference = updates.dietaryPreference || currentProfile.dietaryPreference;
  const workoutExperience = updates.workoutExperience || currentProfile.workoutExperience;
  const medicalNotes = updates.medicalNotes !== undefined ? updates.medicalNotes : currentProfile.medicalNotes;

  // Auto calculate metabolic requirements
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const macros = calculateMacroTargets(tdee, weightKg, fitnessGoal, dietaryPreference);

  const updated = db.userProfiles.updateOne(userId, {
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
    bmr,
    tdee,
    dailyCalories: macros.dailyCalories,
    targetProtein: macros.proteinGrams,
    targetCarbs: macros.carbsGrams,
    targetFat: macros.fatGrams,
    waterLiters: macros.waterLiters,
  });

  // Also log weight to progress history if weight changed
  if (weightKg !== currentProfile.weightKg) {
    const today = new Date().toISOString().split('T')[0];
    db.progressHistory.insertOne({
      id: `prog-${Date.now()}`,
      userId,
      date: today,
      weightKg,
      workoutsCompleted: 0,
      notes: 'Profile weight update',
      loggedAt: new Date().toISOString(),
    });
  }

  const bmiInfo = calculateBMI(weightKg, heightCm);

  return res.json({
    profile: updated,
    bmiInfo,
    message: 'Profile updated and metabolic targets recalculated successfully',
  });
});

// ==========================================
// 3. WORKOUT MANAGEMENT ROUTES
// ==========================================

// Get user workout plans
app.get('/api/workouts', authenticateToken, (req: AuthRequest, res: Response) => {
  const targetUserId = req.query.userId ? String(req.query.userId) : req.user!.id;
  const plans = db.workoutPlans.findByUserId(targetUserId);
  return res.json({ plans });
});

// Create a new workout plan
app.post('/api/workouts', authenticateToken, (req: AuthRequest, res: Response) => {
  const { title, goal, experienceLevel, splitType, days, safetyTips } = req.body;

  if (!title || !days || !days.length) {
    return res.status(400).json({ error: 'Workout title and at least one day are required' });
  }

  const newPlan = db.workoutPlans.insertOne({
    id: `plan-${Date.now()}`,
    userId: req.user!.id,
    title,
    goal: goal || 'General Fitness',
    experienceLevel: experienceLevel || 'Beginner',
    splitType: splitType || 'Custom Split',
    days,
    safetyTips: safetyTips || ['Warm up before lifting', 'Stay hydrated'],
    generatedByAI: false,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({ plan: newPlan });
});

// Update workout plan
app.put('/api/workouts/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const plan = db.workoutPlans.findById(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Workout plan not found' });
  }

  // Check authorization
  if (plan.userId !== req.user!.id && req.user!.role === 'user') {
    return res.status(403).json({ error: 'Unauthorized to modify this plan' });
  }

  const updated = db.workoutPlans.updateOne(req.params.id, req.body);
  return res.json({ plan: updated });
});

// Delete workout plan
app.delete('/api/workouts/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const plan = db.workoutPlans.findById(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Workout plan not found' });
  }

  if (plan.userId !== req.user!.id && req.user!.role === 'user') {
    return res.status(403).json({ error: 'Unauthorized to delete this plan' });
  }

  db.workoutPlans.deleteOne(req.params.id);
  return res.json({ message: 'Workout plan deleted successfully' });
});

// Log completed workout session
app.post('/api/workouts/:id/complete', authenticateToken, (req: AuthRequest, res: Response) => {
  const plan = db.workoutPlans.findById(req.params.id);
  const { dayName, notes, durationMin = 45 } = req.body;

  const today = new Date().toISOString().split('T')[0];
  const profile = db.userProfiles.findByUserId(req.user!.id);
  const weight = profile ? profile.weightKg : 70;

  const entry = db.progressHistory.insertOne({
    id: `prog-${Date.now()}`,
    userId: req.user!.id,
    date: today,
    weightKg: weight,
    workoutsCompleted: 1,
    completedWorkoutTitle: plan ? `${plan.title} (${dayName || 'Session'})` : 'Workout Completed',
    notes: notes || `Completed ${durationMin} min workout`,
    loggedAt: new Date().toISOString(),
  });

  return res.json({
    message: 'Workout logged successfully to fitness history!',
    entry,
  });
});

// ==========================================
// 4. EXERCISE LIBRARY ROUTES
// ==========================================

// Get exercises with search & filter
app.get('/api/exercises', (req: Request, res: Response) => {
  const { search, muscleGroup, category, equipment, difficulty } = req.query;

  let exercises = db.exerciseRecords.find();

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    exercises = exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(s) ||
        e.primaryMuscle.toLowerCase().includes(s) ||
        e.secondaryMuscles.some((m) => m.toLowerCase().includes(s))
    );
  }

  if (muscleGroup && typeof muscleGroup === 'string') {
    exercises = exercises.filter((e) => e.muscleGroup === muscleGroup);
  }

  if (category && typeof category === 'string') {
    exercises = exercises.filter((e) => e.category === category);
  }

  if (equipment && typeof equipment === 'string') {
    exercises = exercises.filter((e) => e.equipment === equipment);
  }

  if (difficulty && typeof difficulty === 'string') {
    exercises = exercises.filter((e) => e.difficulty === difficulty);
  }

  return res.json({ exercises, count: exercises.length });
});

// Add exercise (Staff & Admin only)
app.post(
  '/api/exercises',
  authenticateToken,
  requireRole(['staff', 'admin']),
  (req: AuthRequest, res: Response) => {
    const {
      name,
      muscleGroup,
      category = 'Strength',
      equipment = 'Bodyweight',
      difficulty = 'Beginner',
      instructions = [],
      tips = '',
      primaryMuscle,
      secondaryMuscles = [],
    } = req.body;

    if (!name || !muscleGroup || !primaryMuscle) {
      return res.status(400).json({ error: 'Name, muscle group, and primary muscle are required' });
    }

    const newEx = db.exerciseRecords.insertOne({
      id: `ex-${Date.now()}`,
      name,
      muscleGroup,
      category,
      equipment,
      difficulty,
      instructions: Array.isArray(instructions) ? instructions : [instructions],
      tips,
      primaryMuscle,
      secondaryMuscles: Array.isArray(secondaryMuscles) ? secondaryMuscles : [secondaryMuscles],
    });

    return res.status(201).json({ exercise: newEx });
  }
);

// Delete exercise (Admin only)
app.delete(
  '/api/exercises/:id',
  authenticateToken,
  requireRole(['admin']),
  (req: AuthRequest, res: Response) => {
    const success = db.exerciseRecords.deleteOne(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    return res.json({ message: 'Exercise removed from library' });
  }
);

// ==========================================
// 5. DIET & NUTRITION ROUTES
// ==========================================

// Get user diet plans
app.get('/api/diet', authenticateToken, (req: AuthRequest, res: Response) => {
  const targetUserId = req.query.userId ? String(req.query.userId) : req.user!.id;
  const plans = db.dietPlans.findByUserId(targetUserId);
  return res.json({ plans });
});

// Save or update diet plan
app.post('/api/diet', authenticateToken, (req: AuthRequest, res: Response) => {
  const { title, goal, dietaryPreference, dailyCalories, proteinG, carbsG, fatsG, meals, guidelines } =
    req.body;

  const newDiet = db.dietPlans.insertOne({
    id: `diet-${Date.now()}`,
    userId: req.user!.id,
    title: title || 'Custom Diet Protocol',
    goal: goal || 'General Fitness',
    dietaryPreference: dietaryPreference || 'Non-Vegetarian',
    dailyCalories: dailyCalories || 2000,
    proteinG: proteinG || 140,
    carbsG: carbsG || 200,
    fatsG: fatsG || 60,
    waterLiters: 3.0,
    meals: meals || [],
    guidelines: guidelines || [],
    safetyWarnings: [
      'Nutritional plans are for guidance and do not replace professional medical advice.',
    ],
    generatedByAI: false,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({ plan: newDiet });
});

// ==========================================
// 6. PROGRESS TRACKING ROUTES
// ==========================================

// Get progress history
app.get('/api/progress', authenticateToken, (req: AuthRequest, res: Response) => {
  const targetUserId = req.query.userId ? String(req.query.userId) : req.user!.id;
  const history = db.progressHistory.findByUserId(targetUserId);
  return res.json({ history });
});

// Log daily weight and completion
app.post('/api/progress', authenticateToken, (req: AuthRequest, res: Response) => {
  const { date, weightKg, workoutsCompleted = 1, completedWorkoutTitle, notes } = req.body;

  if (!weightKg) {
    return res.status(400).json({ error: 'Weight in kg is required' });
  }

  const logDate = date || new Date().toISOString().split('T')[0];

  const entry = db.progressHistory.insertOne({
    id: `prog-${Date.now()}`,
    userId: req.user!.id,
    date: logDate,
    weightKg: Number(weightKg),
    workoutsCompleted: Number(workoutsCompleted),
    completedWorkoutTitle,
    notes,
    loggedAt: new Date().toISOString(),
  });

  // Update current weight in profile too
  db.userProfiles.updateOne(req.user!.id, {
    weightKg: Number(weightKg),
  });

  return res.status(201).json({ entry, message: 'Progress recorded successfully' });
});

// Delete progress log
app.delete('/api/progress/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  db.progressHistory.deleteOne(req.params.id);
  return res.json({ message: 'Progress entry removed' });
});

// ==========================================
// 7. AI RECOMMENDATIONS ROUTE
// ==========================================

app.post('/api/ai/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const profile = db.userProfiles.findByUserId(req.user!.id);
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found. Please fill your profile first.' });
    }

    const exerciseLibrary = db.exerciseRecords.find();
    const recentLogs = db.progressHistory.findByUserId(req.user!.id);
    const recentNotes = recentLogs
      .slice(-3)
      .map((l) => `${l.date}: ${l.weightKg}kg, ${l.notes || 'No notes'}`)
      .join('; ');

    const result = await generateFitnessPlan(profile, exerciseLibrary, recentNotes);

    // Save newly generated AI workout plan to DB
    const savedWorkoutPlan = db.workoutPlans.insertOne({
      id: `plan-${Date.now()}`,
      userId: req.user!.id,
      ...result.workoutPlan,
      createdAt: new Date().toISOString(),
    });

    // Save newly generated AI diet plan to DB
    const savedDietPlan = db.dietPlans.insertOne({
      id: `diet-${Date.now()}`,
      userId: req.user!.id,
      ...result.dietPlan,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      workoutPlan: savedWorkoutPlan,
      dietPlan: savedDietPlan,
      coachingSummary: result.coachingSummary,
      source: result.source,
      message: 'AI personalized fitness and nutrition protocol generated successfully!',
    });
  } catch (err: any) {
    console.error('Error generating AI plan:', err);
    return res.status(500).json({ error: 'Failed to generate recommendations: ' + err.message });
  }
});

// ==========================================
// 8. ROLE-BASED ACCESS CONTROL (STAFF & ADMIN)
// ==========================================

// Staff: View assigned clients and their fitness records
app.get(
  '/api/staff/clients',
  authenticateToken,
  requireRole(['staff', 'admin']),
  (req: AuthRequest, res: Response) => {
    // Staff sees assigned users or all regular users
    const allUsers = db.users.find({ role: 'user' });

    const clientData = allUsers.map((u) => {
      const profile = db.userProfiles.findByUserId(u.id);
      const workouts = db.workoutPlans.findByUserId(u.id);
      const progress = db.progressHistory.findByUserId(u.id);
      const notes = db.trainerNotes.findByUserId(u.id);
      return {
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt,
        },
        profile,
        workoutCount: workouts.length,
        progressCount: progress.length,
        latestWeight: progress.length ? progress[progress.length - 1].weightKg : profile?.weightKg,
        trainerNotes: notes,
      };
    });

    return res.json({ clients: clientData });
  }
);

// Staff: Leave coach note / recommendation for a user
app.post(
  '/api/staff/notes',
  authenticateToken,
  requireRole(['staff', 'admin']),
  (req: AuthRequest, res: Response) => {
    const { userId, note, recommendation } = req.body;
    if (!userId || !note) {
      return res.status(400).json({ error: 'Client userId and note text are required' });
    }

    const client = db.users.findById(userId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const newNote = db.trainerNotes.insertOne({
      id: `note-${Date.now()}`,
      staffId: req.user!.id,
      staffName: req.user!.name,
      userId,
      clientName: client.name,
      note,
      recommendation,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ note: newNote, message: 'Coach feedback logged for client' });
  }
);

// Staff: Assign workout or diet plan to a client
app.post(
  '/api/staff/assign-plan',
  authenticateToken,
  requireRole(['staff', 'admin']),
  (req: AuthRequest, res: Response) => {
    const { userId, type, planData } = req.body;
    if (!userId || !type || !planData) {
      return res.status(400).json({ error: 'User ID, plan type, and plan data are required' });
    }

    if (type === 'workout') {
      const assigned = db.workoutPlans.insertOne({
        id: `plan-${Date.now()}`,
        userId,
        ...planData,
        assignedBy: `Coach ${req.user!.name}`,
        createdAt: new Date().toISOString(),
      });
      return res.json({ message: 'Workout plan assigned to client', plan: assigned });
    } else {
      const assigned = db.dietPlans.insertOne({
        id: `diet-${Date.now()}`,
        userId,
        ...planData,
        assignedBy: `Coach ${req.user!.name}`,
        createdAt: new Date().toISOString(),
      });
      return res.json({ message: 'Diet plan assigned to client', plan: assigned });
    }
  }
);

// Admin: Get all users & system statistics
app.get(
  '/api/admin/users',
  authenticateToken,
  requireRole(['admin']),
  (_req: AuthRequest, res: Response) => {
    const users = db.users.find().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      assignedStaffId: u.assignedStaffId,
      createdAt: u.createdAt,
    }));
    return res.json({ users });
  }
);

// Admin: Change user role
app.put(
  '/api/admin/users/:id/role',
  authenticateToken,
  requireRole(['admin']),
  (req: AuthRequest, res: Response) => {
    const { role } = req.body;
    if (!['user', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const updated = db.users.updateOne(req.params.id, { role: role as UserRole });
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: `User role updated to ${role}`,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  }
);

// Admin: System Analytics
app.get(
  '/api/admin/stats',
  authenticateToken,
  requireRole(['admin']),
  (_req: AuthRequest, res: Response) => {
    const totalUsers = db.users.countDocuments();
    const regularUsers = db.users.find({ role: 'user' }).length;
    const staffMembers = db.users.find({ role: 'staff' }).length;
    const admins = db.users.find({ role: 'admin' }).length;
    const totalWorkouts = db.workoutPlans.countDocuments();
    const totalExercises = db.exerciseRecords.countDocuments();
    const totalDietPlans = db.dietPlans.countDocuments();
    const totalProgressLogs = db.progressHistory.countDocuments();

    return res.json({
      stats: {
        totalUsers,
        regularUsers,
        staffMembers,
        admins,
        totalWorkouts,
        totalExercises,
        totalDietPlans,
        totalProgressLogs,
      },
    });
  }
);

// ==========================================
// 9. NOTIFICATION & REMINDER BACKGROUND JOB ROUTES
// ==========================================

// Get user notifications and unread count
app.get('/api/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
  const notifications = db.notifications.findByUserId(req.user!.id);
  const unreadCount = notifications.filter((n) => n.status !== 'read').length;
  return res.json({ notifications, unreadCount });
});

// Mark single notification as read
app.put('/api/notifications/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  const notification = db.notifications.findById(req.params.id);
  if (!notification || notification.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  const updated = db.notifications.markRead(req.params.id);
  return res.json({ notification: updated });
});

// Mark all notifications as read
app.post('/api/notifications/mark-all-read', authenticateToken, (req: AuthRequest, res: Response) => {
  const count = db.notifications.markAllRead(req.user!.id);
  return res.json({ message: `Marked ${count} notifications as read` });
});

// Get user notification settings
app.get('/api/notifications/settings', authenticateToken, (req: AuthRequest, res: Response) => {
  const settings = db.notificationSettings.findByUserId(req.user!.id);
  return res.json({ settings });
});

// Update user notification settings
app.put('/api/notifications/settings', authenticateToken, (req: AuthRequest, res: Response) => {
  const { pushEnabled, emailEnabled, reminderTime, reminderDays, includeMotivationalQuote } = req.body;
  const updated = db.notificationSettings.upsert(req.user!.id, {
    pushEnabled,
    emailEnabled,
    reminderTime,
    reminderDays,
    includeMotivationalQuote,
  });
  return res.json({ settings: updated, message: 'Reminder settings updated successfully' });
});

// Trigger background reminder job on-demand (Manual trigger for evaluation/testing)
app.post('/api/notifications/test-trigger', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const jobResult = await executeWorkoutReminderJob(req.user!.id, true);
    const notifications = db.notifications.findByUserId(req.user!.id);
    const unreadCount = notifications.filter((n) => n.status !== 'read').length;

    return res.json({
      message: 'Workout reminder background job triggered successfully!',
      jobResult,
      notifications,
      unreadCount,
    });
  } catch (err: any) {
    console.error('Error triggering workout reminder job:', err);
    return res.status(500).json({ error: 'Failed to run reminder job: ' + err.message });
  }
});

// ==========================================
// HEALTH CHECK & CRON ROUTES
// ==========================================

// Health check endpoint (for Vercel, Render, and uptime monitors)
app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    environment: process.env.VERCEL ? 'vercel-serverless' : (process.env.NODE_ENV || 'development'),
    timestamp: new Date().toISOString(),
  });
});

// Cron job endpoint for Vercel Cron or external scheduled runners
app.get('/api/cron/reminders', async (_req: Request, res: Response) => {
  try {
    const jobResult = await executeWorkoutReminderJob();
    return res.json({
      success: true,
      message: 'Workout reminder cron job executed successfully',
      jobResult,
    });
  } catch (err: any) {
    console.error('Cron job error:', err);
    return res.status(500).json({ error: 'Failed to execute cron job: ' + err.message });
  }
});

// ==========================================
// VITE SPA INTEGRATION & STATIC SERVING
// ==========================================

export async function startServer() {
  // Start background worker job for workout reminders
  startWorkoutReminderBackgroundJob(60 * 1000);

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Mount Vite dev server middlewares
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitPulse AI server is running on http://0.0.0.0:${PORT}`);
  });
}

// In standard Node environments (Render, Cloud Run, local), start the server directly.
// On Vercel, the app is imported and served via the serverless function in api/index.ts.
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });
}

export default app;

