import { db, type NotificationItem, type User } from './db.ts';
import { shouldTriggerReminder, generateReminderContent } from '../src/utils/schedulerUtils.ts';

export interface BackgroundJobResult {
  timestamp: string;
  usersScanned: number;
  remindersDispatched: number;
  skippedCompleted: number;
  skippedDisabled: number;
  details: Array<{
    userId: string;
    userName: string;
    workoutDayName: string;
    channel: string;
    title: string;
  }>;
}

let backgroundTimer: NodeJS.Timeout | null = null;

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Execute a single round of the workout reminder background job
 */
export async function executeWorkoutReminderJob(
  targetUserId?: string,
  forceRun: boolean = false
): Promise<BackgroundJobResult> {
  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];
  const currentDayName = DAYS_OF_WEEK[now.getDay()];
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTimeStr = `${currentHour}:${currentMinute}`;

  let usersToProcess: User[] = targetUserId
    ? db.users.find().filter((u) => u.id === targetUserId)
    : db.users.find({ role: 'user' });

  const result: BackgroundJobResult = {
    timestamp: now.toISOString(),
    usersScanned: usersToProcess.length,
    remindersDispatched: 0,
    skippedCompleted: 0,
    skippedDisabled: 0,
    details: [],
  };

  for (const user of usersToProcess) {
    const settings = db.notificationSettings.findByUserId(user.id);
    const profile = db.userProfiles.findByUserId(user.id);
    const workoutPlans = db.workoutPlans.findByUserId(user.id);
    const progressHistory = db.progressHistory.findByUserId(user.id);

    // Check if workout already completed today
    const hasCompletedWorkoutToday = progressHistory.some(
      (p) => p.date === todayDate && p.workoutsCompleted > 0
    );

    if (hasCompletedWorkoutToday && !forceRun) {
      result.skippedCompleted++;
      continue;
    }

    const isEligible = forceRun || shouldTriggerReminder({
      pushEnabled: settings.pushEnabled,
      emailEnabled: settings.emailEnabled,
      reminderDays: settings.reminderDays,
      lastTriggeredDate: settings.lastTriggeredDate,
      currentDayName,
      todayDate,
      hasCompletedWorkoutToday,
    });

    if (!isEligible) {
      result.skippedDisabled++;
      continue;
    }

    // Determine current workout day
    const primaryPlan = workoutPlans[0];
    const workoutDay = primaryPlan && primaryPlan.days && primaryPlan.days.length > 0
      ? primaryPlan.days[0]
      : null;

    const content = generateReminderContent(
      user.name,
      user.email,
      workoutDay,
      profile?.fitnessGoal || 'General Fitness',
      profile?.dailyCalories || 2500,
      profile?.targetProtein || 150
    );

    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Create Notification Document
    const notification: NotificationItem = {
      id: notificationId,
      userId: user.id,
      title: content.title,
      message: content.message,
      workoutDayName: content.workoutDayName,
      exerciseCount: content.exerciseCount,
      channel: settings.emailEnabled && settings.pushEnabled ? 'push' : settings.emailEnabled ? 'email' : 'push',
      status: 'delivered',
      emailDetails: settings.emailEnabled
        ? {
            to: user.email,
            subject: content.emailSubject,
            htmlBody: content.emailHtml,
            sentAt: now.toISOString(),
          }
        : undefined,
      createdAt: now.toISOString(),
    };

    db.notifications.insertOne(notification);

    // Update lastTriggeredDate
    db.notificationSettings.upsert(user.id, {
      lastTriggeredDate: todayDate,
    });

    result.remindersDispatched++;
    result.details.push({
      userId: user.id,
      userName: user.name,
      workoutDayName: content.workoutDayName,
      channel: notification.channel,
      title: content.title,
    });
  }

  return result;
}

/**
 * Start the recurring background worker in Node.js
 */
export function startWorkoutReminderBackgroundJob(intervalMs: number = 60 * 1000) {
  if (backgroundTimer) {
    clearInterval(backgroundTimer);
  }

  console.log(`[FitPulse Background Job] Workout reminder scheduler started. Polling every ${intervalMs / 1000}s`);

  // Run initial scan in 5 seconds
  setTimeout(async () => {
    try {
      const res = await executeWorkoutReminderJob();
      if (res.remindersDispatched > 0) {
        console.log(`[FitPulse Background Job] Initial check dispatched ${res.remindersDispatched} workout reminder(s).`);
      }
    } catch (err) {
      console.error('[FitPulse Background Job] Error in initial run:', err);
    }
  }, 5000);

  backgroundTimer = setInterval(async () => {
    try {
      const now = new Date();
      // Only execute automatically at the top of the minute
      const res = await executeWorkoutReminderJob();
      if (res.remindersDispatched > 0) {
        console.log(`[FitPulse Background Job] Dispatched ${res.remindersDispatched} scheduled workout reminder(s) at ${now.toLocaleTimeString()}`);
      }
    } catch (err) {
      console.error('[FitPulse Background Job] Error in scheduled run:', err);
    }
  }, intervalMs);
}
