import {
  User,
  UserProfile,
  BmiInfo,
  WorkoutPlan,
  ExerciseRecord,
  DietPlan,
  ProgressEntry,
  TrainerNote,
  ClientOverview,
  SystemStats,
  NotificationItem,
  NotificationSettings,
} from '../types';

const TOKEN_KEY = 'fitpulse_auth_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP error! status: ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string; role?: string }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  demoLogin: (role: string) =>
    request<{ token: string; user: User }>('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  // Profile
  getProfile: (userId?: string) =>
    request<{ profile: UserProfile; bmiInfo: BmiInfo }>(
      userId ? `/api/profile?userId=${encodeURIComponent(userId)}` : '/api/profile'
    ),

  updateProfile: (updates: Partial<UserProfile>) =>
    request<{ profile: UserProfile; bmiInfo: BmiInfo; message: string }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Workouts
  getWorkouts: (userId?: string) =>
    request<{ plans: WorkoutPlan[] }>(
      userId ? `/api/workouts?userId=${encodeURIComponent(userId)}` : '/api/workouts'
    ),

  createWorkout: (plan: Partial<WorkoutPlan>) =>
    request<{ plan: WorkoutPlan }>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(plan),
    }),

  updateWorkout: (id: string, plan: Partial<WorkoutPlan>) =>
    request<{ plan: WorkoutPlan }>(`/api/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan),
    }),

  deleteWorkout: (id: string) =>
    request<{ message: string }>(`/api/workouts/${id}`, {
      method: 'DELETE',
    }),

  completeWorkout: (id: string, data: { dayName: string; notes?: string; durationMin?: number }) =>
    request<{ message: string; entry: ProgressEntry }>(`/api/workouts/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Exercises Library
  getExercises: (params?: {
    search?: string;
    muscleGroup?: string;
    category?: string;
    equipment?: string;
    difficulty?: string;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.set(key, val);
      });
    }
    const qStr = query.toString();
    return request<{ exercises: ExerciseRecord[]; count: number }>(
      qStr ? `/api/exercises?${qStr}` : '/api/exercises'
    );
  },

  createExercise: (exercise: Partial<ExerciseRecord>) =>
    request<{ exercise: ExerciseRecord }>('/api/exercises', {
      method: 'POST',
      body: JSON.stringify(exercise),
    }),

  deleteExercise: (id: string) =>
    request<{ message: string }>(`/api/exercises/${id}`, {
      method: 'DELETE',
    }),

  // Diet
  getDietPlans: (userId?: string) =>
    request<{ plans: DietPlan[] }>(
      userId ? `/api/diet?userId=${encodeURIComponent(userId)}` : '/api/diet'
    ),

  createDietPlan: (plan: Partial<DietPlan>) =>
    request<{ plan: DietPlan }>('/api/diet', {
      method: 'POST',
      body: JSON.stringify(plan),
    }),

  // Progress
  getProgress: (userId?: string) =>
    request<{ history: ProgressEntry[] }>(
      userId ? `/api/progress?userId=${encodeURIComponent(userId)}` : '/api/progress'
    ),

  logProgress: (data: {
    date?: string;
    weightKg: number;
    workoutsCompleted?: number;
    completedWorkoutTitle?: string;
    notes?: string;
  }) =>
    request<{ entry: ProgressEntry; message: string }>('/api/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteProgress: (id: string) =>
    request<{ message: string }>(`/api/progress/${id}`, {
      method: 'DELETE',
    }),

  // AI Generation
  generateAiPlan: () =>
    request<{
      workoutPlan: WorkoutPlan;
      dietPlan: DietPlan;
      coachingSummary: string;
      source: string;
      message: string;
    }>('/api/ai/generate', {
      method: 'POST',
    }),

  // Staff Portal
  getStaffClients: () => request<{ clients: ClientOverview[] }>('/api/staff/clients'),

  addTrainerNote: (data: { userId: string; note: string; recommendation?: string }) =>
    request<{ note: TrainerNote; message: string }>('/api/staff/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  assignPlanToClient: (data: { userId: string; type: 'workout' | 'diet'; planData: any }) =>
    request<{ message: string; plan: any }>('/api/staff/assign-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin Portal
  getAdminUsers: () => request<{ users: User[] }>('/api/admin/users'),

  updateUserRole: (id: string, role: string) =>
    request<{ message: string; user: User }>(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  getAdminStats: () => request<{ stats: SystemStats }>('/api/admin/stats'),

  // Notifications & Reminders
  getNotifications: () =>
    request<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications'),

  markNotificationRead: (id: string) =>
    request<{ notification: NotificationItem }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request<{ message: string }>('/api/notifications/mark-all-read', {
      method: 'POST',
    }),

  getNotificationSettings: () =>
    request<{ settings: NotificationSettings }>('/api/notifications/settings'),

  updateNotificationSettings: (settings: Partial<NotificationSettings>) =>
    request<{ settings: NotificationSettings; message: string }>('/api/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  triggerWorkoutReminderJob: () =>
    request<{
      message: string;
      jobResult: any;
      notifications: NotificationItem[];
      unreadCount: number;
    }>('/api/notifications/test-trigger', {
      method: 'POST',
    }),
};
