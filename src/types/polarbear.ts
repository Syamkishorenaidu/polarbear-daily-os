export interface WorkEntry {
  id: string;
  title: string;
  notes: string;
  category: string;
  duration: number; // minutes
  priority: 'low' | 'medium' | 'high';
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: string;
}

export interface MealData {
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  snacks: FoodItem[];
}

export interface GymEntry {
  id: string;
  name: string;
  muscleGroup: string;
  duration: number;
  exercises: Exercise[];
  notes: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface LearningSession {
  id: string;
  title: string;
  notes: string;
  duration: number;
  difficulty: number;
  section: 'general' | 'dsa' | 'cert';
  tags: string[];
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  paymentType: 'cash' | 'card' | 'upi';
}

export interface DayGymData {
  workouts: GymEntry[];
  steps: number;
  weight: number;
}

export interface Goals {
  waterGoal: number;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  stepsGoal: number;
  gymDaysGoal: number;
  monthlyBudget: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
}

export const DEFAULT_GOALS: Goals = {
  waterGoal: 3000,
  calorieTarget: 2200,
  proteinTarget: 150,
  carbsTarget: 220,
  fatTarget: 70,
  stepsGoal: 10000,
  gymDaysGoal: 5,
  monthlyBudget: 30000,
};

export const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'no_sugar', label: 'No sugar' },
  { id: 'no_junk', label: 'No junk/processed food' },
  { id: 'protein_goal', label: 'Hit protein goal' },
  { id: 'water_goal', label: 'Water goal met' },
  { id: 'steps_goal', label: 'Steps goal met' },
  { id: 'sleep_7', label: 'Sleep 7+ hours' },
];

export const EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other',
];

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body', 'Cardio',
];

export const WORK_CATEGORIES = [
  'Development', 'Design', 'Meetings', 'Research', 'Admin', 'Other',
];

export type MealType = keyof MealData;

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
