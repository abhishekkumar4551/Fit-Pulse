/**
 * Pure functions for workout reminder scheduling and content generation
 */

export interface ReminderCheckParams {
  pushEnabled: boolean;
  emailEnabled: boolean;
  reminderDays: string[];
  lastTriggeredDate?: string;
  currentDayName: string; // e.g. "Friday"
  todayDate: string; // e.g. "2026-10-30"
  hasCompletedWorkoutToday: boolean;
}

export interface ReminderContentResult {
  title: string;
  message: string;
  workoutDayName: string;
  exerciseCount: number;
  motivationalQuote: string;
  emailSubject: string;
  emailHtml: string;
}

const MOTIVATIONAL_QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "The body achieves what the mind believes. Crush today's training session!",
  "Consistency is the catalyst of greatness. Your future self will thank you for today's effort.",
  "Small daily improvements over time lead to stunning results. Let's make today count!",
  "Action cures fatigue and builds unstoppable momentum. Step up to the bar!",
];

/**
 * Determine if a user should receive a workout reminder today
 */
export function shouldTriggerReminder(params: ReminderCheckParams): boolean {
  // If neither push nor email is enabled, skip
  if (!params.pushEnabled && !params.emailEnabled) {
    return false;
  }

  // If already triggered for today, skip duplicate notification
  if (params.lastTriggeredDate === params.todayDate) {
    return false;
  }

  // If workout for today is already completed, no reminder needed
  if (params.hasCompletedWorkoutToday) {
    return false;
  }

  // Check if today is an active reminder day
  if (params.reminderDays && !params.reminderDays.includes(params.currentDayName)) {
    return false;
  }

  return true;
}

/**
 * Generate rich push notification and email reminder content
 */
export function generateReminderContent(
  userName: string,
  userEmail: string,
  workoutDay: { dayName: string; focus: string; estimatedDurationMin: number; exercises: Array<{ name: string; sets: number; reps: string; muscleGroup: string }> } | null,
  fitnessGoal: string,
  dailyCalories: number,
  proteinG: number
): ReminderContentResult {
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  const dayName = workoutDay ? workoutDay.dayName : 'Daily Fitness Protocol';
  const exerciseCount = workoutDay ? workoutDay.exercises.length : 3;
  const duration = workoutDay ? workoutDay.estimatedDurationMin : 45;
  const focus = workoutDay ? workoutDay.focus : 'Full Body Conditioning';

  const title = `⚡ Workout Scheduled: ${dayName}`;
  const message = `Hey ${userName}, your ${focus} session is waiting! ${exerciseCount} exercises (${duration} mins). Keep your consistency streak alive!`;
  const emailSubject = `🏋️ Ready for today's workout? - ${dayName} (${userName})`;

  const exercisesListHtml = workoutDay && workoutDay.exercises.length > 0
    ? workoutDay.exercises.map((ex, idx) => `
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 10px 12px; color: #10b981; font-weight: bold;">#${idx + 1}</td>
          <td style="padding: 10px 12px; color: #f8fafc; font-weight: 600;">${ex.name}</td>
          <td style="padding: 10px 12px; color: #94a3b8;">${ex.muscleGroup}</td>
          <td style="padding: 10px 12px; color: #38bdf8; font-family: monospace; font-weight: bold; text-align: right;">${ex.sets} × ${ex.reps}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" style="padding: 12px; color: #94a3b8;">Full body athletic session</td></tr>';

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); padding: 30px 24px; border-bottom: 1px solid #10b98133;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: -0.5px;">FitPulse</span>
        <span style="font-size: 11px; font-weight: bold; background: #10b98122; color: #10b981; padding: 2px 8px; border-radius: 6px; border: 1px solid #10b98144;">AI REMINDER</span>
      </div>
      <h1 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: 800;">Time to Train, ${userName}!</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Your scheduled workout is ready on your personalized dashboard.</p>
    </div>

    <!-- Body -->
    <div style="padding: 24px;">
      <!-- Workout Card -->
      <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 11px; font-weight: bold; color: #10b981; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Today's Session</div>
        <div style="font-size: 17px; font-weight: bold; color: #ffffff; margin-bottom: 6px;">${dayName}</div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 14px;">Focus: <strong style="color: #cbd5e1;">${focus}</strong> • Estimated: <strong style="color: #cbd5e1;">${duration} mins</strong></div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid #334155; color: #64748b; font-size: 10px; text-transform: uppercase;">
              <th style="padding: 6px 12px;">#</th>
              <th style="padding: 6px 12px;">Exercise</th>
              <th style="padding: 6px 12px;">Muscle</th>
              <th style="padding: 6px 12px; text-align: right;">Prescription</th>
            </tr>
          </thead>
          <tbody>
            ${exercisesListHtml}
          </tbody>
        </table>
      </div>

      <!-- Quick Nutrition Reminder -->
      <div style="display: flex; gap: 12px; background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
        <div style="flex: 1; text-align: center; border-right: 1px solid #1e293b; padding-right: 10px;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Goal</div>
          <div style="font-size: 13px; font-weight: bold; color: #10b981; margin-top: 2px;">${fitnessGoal}</div>
        </div>
        <div style="flex: 1; text-align: center; border-right: 1px solid #1e293b; padding-right: 10px;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Calorie Target</div>
          <div style="font-size: 13px; font-weight: bold; color: #f59e0b; margin-top: 2px;">${dailyCalories} kcal</div>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Protein Target</div>
          <div style="font-size: 13px; font-weight: bold; color: #38bdf8; margin-top: 2px;">${proteinG}g</div>
        </div>
      </div>

      <!-- Motivational Callout -->
      <div style="background-color: #064e3b15; border-left: 3px solid #10b981; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-style: italic; font-size: 12px; color: #a7f3d0;">
        "${quote}"
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 10px;">
        <a href="http://localhost:3000" style="display: inline-block; background: #10b981; color: #020617; font-weight: 800; font-size: 14px; text-decoration: none; padding: 12px 32px; border-radius: 10px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
          Start Live Workout Session →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 24px; background: #020617; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b;">
      FitPulse AI Notification Engine • Sent to ${userEmail} according to your scheduled preferences.
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    title,
    message,
    workoutDayName: dayName,
    exerciseCount,
    motivationalQuote: quote,
    emailSubject,
    emailHtml,
  };
}
