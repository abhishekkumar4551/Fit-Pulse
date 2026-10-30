import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateMacroTargets,
  estimateExerciseCalories,
} from './fitnessCalc';

test('BMI calculation and categorization works accurately', () => {
  // 70kg, 175cm -> BMI ~ 22.9 (Normal weight)
  const result1 = calculateBMI(70, 175);
  assert.equal(result1.bmi, 22.9);
  assert.equal(result1.category, 'Normal weight');
  assert.equal(result1.healthyWeightRange.min, 56.7);
  assert.equal(result1.healthyWeightRange.max, 76.3);

  // 95kg, 175cm -> BMI ~ 31.0 (Obese)
  const result2 = calculateBMI(95, 175);
  assert.equal(result2.bmi, 31);
  assert.equal(result2.category, 'Obese');

  // 50kg, 175cm -> BMI ~ 16.3 (Underweight)
  const result3 = calculateBMI(50, 175);
  assert.equal(result3.bmi, 16.3);
  assert.equal(result3.category, 'Underweight');

  // 80kg, 175cm -> BMI ~ 26.1 (Overweight)
  const result4 = calculateBMI(80, 175);
  assert.equal(result4.bmi, 26.1);
  assert.equal(result4.category, 'Overweight');
});

test('BMR Mifflin-St Jeor calculation behaves correctly for male and female', () => {
  // Male: 10 * 75 + 6.25 * 180 - 5 * 25 + 5 = 750 + 1125 - 125 + 5 = 1755
  const bmrMale = calculateBMR(75, 180, 25, 'Male');
  assert.equal(bmrMale, 1755);

  // Female: 10 * 60 + 6.25 * 165 - 5 * 28 - 161 = 600 + 1031.25 - 140 - 161 = 1330
  const bmrFemale = calculateBMR(60, 165, 28, 'Female');
  assert.equal(bmrFemale, 1330);
});

test('TDEE correctly applies activity level multipliers', () => {
  const bmr = 1600;
  // Sedentary (1.2) -> 1920
  assert.equal(calculateTDEE(bmr, 'Sedentary'), 1920);
  // Moderately Active (1.55) -> 2480
  assert.equal(calculateTDEE(bmr, 'Moderately Active'), 2480);
  // Very Active (1.725) -> 2760
  assert.equal(calculateTDEE(bmr, 'Very Active'), 2760);
});

test('Macro targets adjust according to fitness goals and preferences', () => {
  const tdee = 2500;
  const weightKg = 75;

  // Weight loss goal creates deficit
  const cut = calculateMacroTargets(tdee, weightKg, 'Weight Loss', 'Non-Vegetarian');
  assert.equal(cut.dailyCalories, 2000);
  assert.equal(cut.proteinGrams, 150); // 75 * 2.0g
  assert.ok(cut.carbsGrams > 0);
  assert.ok(cut.fatGrams > 0);
  assert.ok(cut.waterLiters >= 3.0);

  // Muscle gain goal creates surplus
  const bulk = calculateMacroTargets(tdee, weightKg, 'Muscle Gain', 'Non-Vegetarian');
  assert.equal(bulk.dailyCalories, 2850);
  assert.equal(bulk.proteinGrams, 165); // 75 * 2.2g
});

test('Exercise calorie burn calculation is consistent with MET formula', () => {
  // Running (MET ~ 9.8), 70kg person, 30 minutes
  const calories = estimateExerciseCalories(9.8, 70, 30);
  assert.ok(calories > 300 && calories < 400);
});
