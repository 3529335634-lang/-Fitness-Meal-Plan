import type {
  AppData,
  DailyTargets,
  EntryMode,
  ExerciseLog,
  FoodDatabaseItem,
  FoodEntry,
  ActivityLevel,
  GoalType,
  MealType,
  Nutrition,
  Sex,
  UserGoal,
} from "./types";

export const goalLabels: Record<GoalType, string> = {
  muscle_gain: "增肌",
  fat_loss: "减脂",
  maintenance: "维持体重",
  habit_control: "控制饮食习惯",
};

export const sexLabels: Record<Sex, string> = {
  male: "男",
  female: "女",
};

export const activityLabels: Record<ActivityLevel, string> = {
  sedentary: "久坐",
  light: "轻度",
  moderate: "中等",
  high: "高",
  very_high: "极高",
};

export const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  very_high: 1.9,
};

export const exerciseTemplates = [
  { name: "力量训练", met: 5 },
  { name: "快走", met: 4.3 },
  { name: "慢跑", met: 7 },
  { name: "骑行", met: 6.8 },
  { name: "游泳", met: 8 },
  { name: "椭圆机", met: 5 },
  { name: "跳绳", met: 10 },
];

export const mealLabels: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

export const modeLabels: Record<EntryMode, string> = {
  plan: "计划饮食",
  actual: "实际摄入",
};

export const emptyNutrition: Nutrition = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  water: 0,
};

export const defaultGoal: UserGoal = {
  sex: "male",
  age: 30,
  heightCm: 175,
  currentWeightKg: 70,
  targetWeightKg: 68,
  goalType: "fat_loss",
  activityLevel: "light",
  updatedAt: new Date().toISOString(),
};

export const defaultActivePlan = {
  id: "cycle-initial",
  goalType: defaultGoal.goalType,
  startWeightKg: defaultGoal.currentWeightKg,
  targetWeightKg: defaultGoal.targetWeightKg,
  start_date: todayKey(),
  foodEntries: [],
  waterLogs: [],
  weightLogs: [{ date: todayKey(), weightKg: defaultGoal.currentWeightKg }],
  exerciseLogs: [],
};

export const initialData: AppData = {
  goal: defaultGoal,
  activePlan: defaultActivePlan,
  planCycles: [],
  foodEntries: [],
  foodTemplates: [],
  waterLogs: [],
  weightLogs: [{ date: todayKey(), weightKg: defaultGoal.currentWeightKg }],
  exerciseLogs: [],
};

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function calculateTargets(goal: UserGoal, exerciseCalories = 0): DailyTargets {
  const weight = Math.max(goal.currentWeightKg, 30);
  const height = Math.max(goal.heightCm, 120);
  const age = Math.max(goal.age, 12);
  const sexAdjustment = goal.sex === "male" ? 5 : -161;
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + sexAdjustment);
  const activityMultiplier = activityMultipliers[goal.activityLevel] ?? activityMultipliers.light;
  const neat = Math.round(bmr * (activityMultiplier - 1));
  const tdee = Math.max(1200, bmr + neat + Math.max(0, exerciseCalories));
  const calorieAdjustments: Record<GoalType, number> = {
    muscle_gain: 300,
    fat_loss: -450,
    maintenance: 0,
    habit_control: -150,
  };
  const calories = Math.max(1200, Math.round(tdee + calorieAdjustments[goal.goalType]));
  const proteinFactor: Record<GoalType, number> = {
    muscle_gain: 2,
    fat_loss: 1.8,
    maintenance: 1.5,
    habit_control: 1.6,
  };
  const protein = Math.round(weight * proteinFactor[goal.goalType]);
  const fat = Math.round(weight * 0.8);
  const carbs = Math.max(80, Math.round((calories - protein * 4 - fat * 9) / 4));
  const water = Math.round(weight * 35);

  return {
    calories,
    protein,
    fat,
    carbs,
    water,
    goalLabel: goalLabels[goal.goalType],
    bmr,
    neat,
    exerciseCalories: Math.round(exerciseCalories),
    tdee,
  };
}

export function sumExerciseCalories(logs: ExerciseLog[], date: string) {
  return logs.filter((log) => log.date === date).reduce((sum, log) => sum + Math.max(0, log.calories), 0);
}

export function estimateExerciseCalories(met: number, weightKg: number, durationMinutes: number) {
  const safeDuration = Math.max(0, durationMinutes);
  const safeWeight = Math.max(30, weightKg);
  return Math.round((met * 3.5 * safeWeight * safeDuration) / 200);
}

export function sumNutrition(entries: FoodEntry[]): Nutrition {
  return entries.reduce(
    (sum, entry) => ({
      calories: sum.calories + entry.nutrition.calories,
      protein: sum.protein + entry.nutrition.protein,
      fat: sum.fat + entry.nutrition.fat,
      carbs: sum.carbs + entry.nutrition.carbs,
      water: sum.water + entry.nutrition.water,
    }),
    emptyNutrition,
  );
}

export function estimateFoodNutrition(food: FoodDatabaseItem, amount: number): Nutrition {
  const ratio = amount / 100;
  return {
    calories: round(food.kcal_per_100g * ratio),
    protein: round(food.protein_per_100g * ratio),
    fat: round(food.fat_per_100g * ratio),
    carbs: round(food.carbs_per_100g * ratio),
    water: 0,
  };
}

export function completionRate(actual: Nutrition, target: Nutrition) {
  const calorieRate = actual.calories / Math.max(target.calories, 1);
  const proteinRate = actual.protein / Math.max(target.protein, 1);
  const waterRate = actual.water / Math.max(target.water, 1);
  return Math.round(((calorieRate + proteinRate + waterRate) / 3) * 100);
}

export function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function nutrientDelta(actual: number, plan: number) {
  const delta = round(actual - plan);
  return delta > 0 ? `+${delta}` : `${delta}`;
}
