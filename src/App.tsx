import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { WorkoutsView } from './components/WorkoutsView';
import { ExercisesView } from './components/ExercisesView';
import { DietView } from './components/DietView';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';
import { StaffPortal } from './components/StaffPortal';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { LogWeightModal } from './components/LogWeightModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { api } from './services/api';
import {
  UserProfile,
  BmiInfo,
  WorkoutPlan,
  DietPlan,
  ProgressEntry,
  NotificationItem,
  NotificationSettings,
} from './types';
import { Sparkles, Shield, Database, Cpu, CheckCircle } from 'lucide-react';

function AppContent() {
  const { user, loading: authLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [logWeightModalOpen, setLogWeightModalOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // App data state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bmiInfo, setBmiInfo] = useState<BmiInfo | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notification state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [isTriggeringReminder, setIsTriggeringReminder] = useState(false);

  // Load user profile & fitness data
  const loadUserData = async () => {
    if (!user) return;
    try {
      const [profRes, workRes, dietRes, progRes, notifRes, setRes] = await Promise.all([
        api.getProfile(),
        api.getWorkouts(),
        api.getDietPlans(),
        api.getProgress(),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
        api.getNotificationSettings().catch(() => ({ settings: null })),
      ]);
      setProfile(profRes.profile);
      setBmiInfo(profRes.bmiInfo);
      setWorkoutPlans(workRes.plans);
      setDietPlans(dietRes.plans);
      setProgressHistory(progRes.history);
      setNotifications(notifRes.notifications);
      setUnreadNotificationCount(notifRes.unreadCount);
      if (setRes.settings) {
        setNotificationSettings(setRes.settings);
      }
    } catch (err) {
      console.error('Failed to load user fitness data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Dark/Light mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Notification Handlers
  const handleTriggerReminderJob = async () => {
    setIsTriggeringReminder(true);
    try {
      const res = await api.triggerWorkoutReminderJob();
      setNotifications(res.notifications);
      setUnreadNotificationCount(res.unreadCount);
      showToast(res.message || 'Workout reminder job completed!');

      // If browser permission is granted, pop native desktop push notification
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted' &&
        res.notifications.length > 0
      ) {
        const latest = res.notifications[0];
        try {
          new Notification(latest.title, {
            body: latest.message,
            icon: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=64&auto=format&fit=crop&q=80',
          });
        } catch (e) {
          console.log('Native notification suppressed by browser settings');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to trigger reminder job');
    } finally {
      setIsTriggeringReminder(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
    );
    setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    setUnreadNotificationCount(0);
    showToast('All reminders marked as read');
  };

  const handleUpdateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    const res = await api.updateNotificationSettings(settings);
    setNotificationSettings(res.settings);
    showToast('Reminder settings saved');
  };

  // AI Generation Trigger
  const handleGenerateAiPlan = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await api.generateAiPlan();
      await loadUserData();
      showToast(res.message || 'Personalized AI Workout & Nutrition plan generated!');
    } catch (err: any) {
      alert(err.message || 'Failed to generate plan');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Profile Update
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    const res = await api.updateProfile(updates);
    setProfile(res.profile);
    setBmiInfo(res.bmiInfo);
    const progRes = await api.getProgress();
    setProgressHistory(progRes.history);
    showToast('Profile and metabolic targets updated');
  };

  // Workout Actions
  const handleCreatePlan = async (plan: Partial<WorkoutPlan>) => {
    await api.createWorkout(plan);
    await loadUserData();
    showToast('Custom workout plan created!');
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to remove this workout plan?')) return;
    await api.deleteWorkout(id);
    await loadUserData();
    showToast('Workout plan deleted');
  };

  const handleCompleteWorkout = async (
    planId: string,
    dayName: string,
    durationMin: number,
    notes: string
  ) => {
    await api.completeWorkout(planId, { dayName, durationMin, notes });
    await loadUserData();
    showToast('Workout logged to fitness history!');
  };

  // Progress Logging
  const handleLogProgress = async (data: {
    date?: string;
    weightKg: number;
    workoutsCompleted?: number;
    completedWorkoutTitle?: string;
    notes?: string;
  }) => {
    await api.logProgress(data);
    await loadUserData();
    showToast('Check-in saved to fitness records');
  };

  const handleDeleteProgress = async (id: string) => {
    if (!confirm('Delete this progress record?')) return;
    await api.deleteProgress(id);
    await loadUserData();
    showToast('Progress record removed');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-slate-400">INITIALIZING FITPULSE AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenNotifications={() => setNotificationCenterOpen(true)}
        unreadNotificationCount={unreadNotificationCount}
      />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-4 h-4 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            bmiInfo={bmiInfo}
            workoutPlans={workoutPlans}
            dietPlans={dietPlans}
            progressHistory={progressHistory}
            onNavigate={setCurrentTab}
            onGenerateAiPlan={handleGenerateAiPlan}
            isGeneratingAi={isGeneratingAi}
            onOpenLogWeightModal={() => setLogWeightModalOpen(true)}
            onQuickCompleteWorkout={() => {
              if (workoutPlans[0]) {
                handleCompleteWorkout(workoutPlans[0].id, 'Scheduled Day', 45, 'Completed daily workout');
              }
            }}
            onOpenNotifications={() => setNotificationCenterOpen(true)}
          />
        )}

        {currentTab === 'workouts' && (
          <WorkoutsView
            workoutPlans={workoutPlans}
            onRefreshPlans={loadUserData}
            onCreatePlan={handleCreatePlan}
            onDeletePlan={handleDeletePlan}
            onCompleteWorkout={handleCompleteWorkout}
            onGenerateAiPlan={handleGenerateAiPlan}
            isGeneratingAi={isGeneratingAi}
          />
        )}

        {currentTab === 'exercises' && (
          <ExercisesView userRole={user?.role} />
        )}

        {currentTab === 'diet' && (
          <DietView
            dietPlans={dietPlans}
            profile={profile}
            onGenerateAiPlan={handleGenerateAiPlan}
            isGeneratingAi={isGeneratingAi}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            progressHistory={progressHistory}
            profile={profile}
            onLogProgress={handleLogProgress}
            onDeleteProgress={handleDeleteProgress}
            onOpenLogModal={() => setLogWeightModalOpen(true)}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={profile}
            bmiInfo={bmiInfo}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {currentTab === 'staff' && (
          <StaffPortal />
        )}

        {currentTab === 'admin' && (
          <AdminPortal />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <LogWeightModal
        isOpen={logWeightModalOpen}
        onClose={() => setLogWeightModalOpen(false)}
        currentWeight={profile?.weightKg || 70}
        onLog={handleLogProgress}
      />

      <NotificationCenterModal
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={notifications}
        unreadCount={unreadNotificationCount}
        settings={notificationSettings}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onUpdateSettings={handleUpdateNotificationSettings}
        onTriggerJob={handleTriggerReminderJob}
        isTriggering={isTriggeringReminder}
        onStartWorkout={() => setCurrentTab('workouts')}
      />

      {/* Technical Architecture Footer for B.Tech CSE Project Evaluation */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">FitPulse AI</span>
            <span>• Full-Stack Personalized Fitness & Nutrition System</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Model: Gemini 3.8 Flash</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Database: MongoDB Collections</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Security: JWT + bcrypt + RBAC</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
