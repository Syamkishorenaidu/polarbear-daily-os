import { format, subDays } from 'date-fns';
import { uid } from '@/types/polarbear';
import type { WorkEntry, MealData, FoodItem, Expense, LearningSession, DayGymData, Exercise } from '@/types/polarbear';

function dateKey(daysAgo: number): string {
  return format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
}

function food(name: string, cal: number, p: number, c: number, f: number, qty: string): FoodItem {
  return { id: uid(), name, calories: cal, protein: p, carbs: c, fat: f, quantity: qty };
}

function exercise(name: string, sets: number, reps: number, weight: number): Exercise {
  return { id: uid(), name, sets, reps, weight };
}

export function seedIfEmpty() {
  if (localStorage.getItem('pb_seeded') === 'true') return;

  for (let d = 0; d < 7; d++) {
    const dk = dateKey(d);

    // Work
    const workEntries: WorkEntry[] = [
      { id: uid(), title: 'API Integration', notes: 'Connected payment gateway', category: 'Development', duration: 120 + d * 10, priority: 'high' },
      { id: uid(), title: 'Team Standup', notes: 'Sprint planning', category: 'Meetings', duration: 30, priority: 'medium' },
    ];
    if (d % 2 === 0) workEntries.push({ id: uid(), title: 'Code Review', notes: 'PR #' + (340 + d), category: 'Development', duration: 45, priority: 'medium' });
    localStorage.setItem(`pb_work_${dk}`, JSON.stringify(workEntries));

    // Water
    localStorage.setItem(`pb_water_${dk}`, JSON.stringify(2000 + d * 200 + Math.floor(Math.random() * 500)));

    // Meals
    const meals: MealData = {
      breakfast: [food('Oats with banana', 350, 12, 55, 8, '1 bowl'), food('Black coffee', 5, 0, 1, 0, '1 cup')],
      lunch: [food('Chicken rice bowl', 550, 40, 60, 12, '1 plate'), food('Dal', 180, 12, 22, 4, '1 bowl')],
      dinner: [food('Grilled paneer salad', 380, 28, 15, 22, '1 plate')],
      snacks: d % 2 === 0 ? [food('Protein shake', 180, 30, 8, 3, '1 scoop')] : [food('Almonds', 160, 6, 6, 14, '10 pcs')],
    };
    localStorage.setItem(`pb_meals_${dk}`, JSON.stringify(meals));

    // Checklist
    const checklist: Record<string, boolean> = {
      no_sugar: d !== 3,
      no_junk: d !== 5,
      protein_goal: d < 5,
      water_goal: d < 4,
      steps_goal: d % 2 === 0,
      sleep_7: d !== 2,
    };
    localStorage.setItem(`pb_checklist_${dk}`, JSON.stringify(checklist));

    // Gym
    const gymData: DayGymData = {
      workouts: d % 7 !== 6 ? [{
        id: uid(),
        name: ['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'HIIT', 'Cardio'][d % 6],
        muscleGroup: ['Chest', 'Back', 'Legs', 'Shoulders', 'Full Body', 'Cardio'][d % 6],
        duration: 50 + d * 5,
        exercises: [
          exercise('Bench Press', 4, 10, 60 + d * 2),
          exercise('Dumbbell Flyes', 3, 12, 14),
          exercise('Overhead Press', 3, 10, 30 + d),
        ],
        notes: 'Good session',
      }] : [],
      steps: 6000 + d * 1200 + Math.floor(Math.random() * 2000),
      weight: 75.5 - d * 0.1,
    };
    localStorage.setItem(`pb_gym_${dk}`, JSON.stringify(gymData));

    // Learning
    const sessions: LearningSession[] = [
      { id: uid(), title: 'System Design Patterns', notes: 'Microservices chapter', duration: 45 + d * 5, difficulty: 3, section: 'general', tags: ['architecture'] },
    ];
    if (d % 2 === 0) sessions.push({ id: uid(), title: 'Two Sum / Sliding Window', notes: 'LC Medium', duration: 40, difficulty: 4, section: 'dsa', tags: ['arrays', 'two-pointers'] });
    if (d % 3 === 0) sessions.push({ id: uid(), title: 'AWS Solutions Architect', notes: 'VPC & Networking', duration: 30, difficulty: 2, section: 'cert', tags: ['aws'] });
    localStorage.setItem(`pb_learning_${dk}`, JSON.stringify(sessions));

    // Expenses
    const expenses: Expense[] = [
      { id: uid(), amount: 150 + d * 20, category: 'Food', description: 'Lunch', paymentType: 'upi' },
      { id: uid(), amount: 50 + d * 10, category: 'Transport', description: 'Metro', paymentType: 'card' },
    ];
    if (d % 2 === 0) expenses.push({ id: uid(), amount: 500 + d * 50, category: 'Shopping', description: 'Amazon order', paymentType: 'card' });
    localStorage.setItem(`pb_expenses_${dk}`, JSON.stringify(expenses));
  }

  localStorage.setItem('pb_seeded', 'true');
}
