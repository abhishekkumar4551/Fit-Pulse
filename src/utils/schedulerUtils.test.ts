import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldTriggerReminder, generateReminderContent } from './schedulerUtils';

test('shouldTriggerReminder evaluates enabled preferences and skip rules correctly', () => {
  // Case 1: Both push and email disabled -> false
  assert.equal(
    shouldTriggerReminder({
      pushEnabled: false,
      emailEnabled: false,
      reminderDays: ['Friday'],
      currentDayName: 'Friday',
      todayDate: '2026-10-30',
      hasCompletedWorkoutToday: false,
    }),
    false
  );

  // Case 2: Already triggered today -> false (no duplicate spam)
  assert.equal(
    shouldTriggerReminder({
      pushEnabled: true,
      emailEnabled: true,
      lastTriggeredDate: '2026-10-30',
      reminderDays: ['Friday'],
      currentDayName: 'Friday',
      todayDate: '2026-10-30',
      hasCompletedWorkoutToday: false,
    }),
    false
  );

  // Case 3: Workout already completed today -> false
  assert.equal(
    shouldTriggerReminder({
      pushEnabled: true,
      emailEnabled: true,
      reminderDays: ['Friday'],
      currentDayName: 'Friday',
      todayDate: '2026-10-30',
      hasCompletedWorkoutToday: true,
    }),
    false
  );

  // Case 4: Day not in reminder days list -> false
  assert.equal(
    shouldTriggerReminder({
      pushEnabled: true,
      emailEnabled: false,
      reminderDays: ['Monday', 'Wednesday'],
      currentDayName: 'Friday',
      todayDate: '2026-10-30',
      hasCompletedWorkoutToday: false,
    }),
    false
  );

  // Case 5: Valid uncompleted day with push enabled -> true
  assert.equal(
    shouldTriggerReminder({
      pushEnabled: true,
      emailEnabled: false,
      reminderDays: ['Monday', 'Friday'],
      currentDayName: 'Friday',
      todayDate: '2026-10-30',
      hasCompletedWorkoutToday: false,
    }),
    true
  );
});

test('generateReminderContent formats push and email message accurately', () => {
  const workoutDay = {
    dayName: 'Day 1: Upper Body Strength & Power',
    focus: 'Chest, Back & Shoulders',
    estimatedDurationMin: 55,
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: '6-8', muscleGroup: 'Chest' },
      { name: 'Bent-Over Row', sets: 4, reps: '8-10', muscleGroup: 'Back' },
    ],
  };

  const content = generateReminderContent(
    'Alex Mercer',
    'alex@fitpulse.ai',
    workoutDay,
    'Muscle Gain',
    2950,
    165
  );

  assert.ok(content.title.includes('Day 1: Upper Body Strength & Power'));
  assert.ok(content.message.includes('Alex Mercer'));
  assert.ok(content.message.includes('Chest, Back & Shoulders'));
  assert.equal(content.exerciseCount, 2);
  assert.ok(content.emailSubject.includes('Day 1: Upper Body Strength & Power'));
  assert.ok(content.emailHtml.includes('Barbell Bench Press'));
  assert.ok(content.emailHtml.includes('2950 kcal'));
  assert.ok(content.emailHtml.includes('alex@fitpulse.ai'));
});
