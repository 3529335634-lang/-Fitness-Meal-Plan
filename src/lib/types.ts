export type GoalType = "muscle_gain" | "fat_loss" | "maintenance" | "habit_control";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type EntryMode = "plan" | "actual";
export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "high" | "very_high";
export type ExerciseSource = "estimated" | "device";
export type RawOrCooked = "raw" | "cooked";

export type Nutrition = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  water: number;
};

export type UserGoal = {
  sex: Sex;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  goalType: GoalType;
  activityLevel: ActivityLevel;
  updatedAt: string;
};

export type FoodEntry = {
  id: string;
  date: string;
  mode: EntryMode;
  meal: MealType;
  name: string;
  raw_or_cooked: RawOrCooked;
  amount: number;
  unit: string;
  nutrition: Nutrition;
  createdAt: string;
};

export type FoodDatabaseItem = {
  id: string;
  name: string;
  raw_or_cooked: RawOrCooked;
  kcal_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  source: string;
};

export type FoodTemplate = FoodDatabaseItem & {
  createdAt: string;
};

export type DailyWaterLog = {
  date: string;
  planMl: number;
  actualMl: number;
};

export type WeightLog = {
  date: string;
  weightKg: number;
};

export type ExerciseLog = {
  id: string;
  date: string;
  name: string;
  durationMinutes: number;
  calories: number;
  source: ExerciseSource;
  createdAt: string;
};

export type PlanSummary = {
  weightChangeKg: number;
  averageCalories: number;
  averageProtein: number;
  averageFat: number;
  averageCarbs: number;
  waterCompletionRate: number;
  planCompletionRate: number;
  positives: string[];
  improvements: string[];
  nextSuggestions: string[];
};

export type PlanCycle = {
  id: string;
  goalType: GoalType;
  startWeightKg: number;
  targetWeightKg: number;
  start_date: string;
  end_date?: string;
  foodEntries: FoodEntry[];
  waterLogs: DailyWaterLog[];
  weightLogs: WeightLog[];
  exerciseLogs: ExerciseLog[];
  summary?: PlanSummary;
};

export type AppData = {
  goal: UserGoal;
  activePlan: PlanCycle;
  planCycles: PlanCycle[];
  foodEntries: FoodEntry[];
  foodTemplates: FoodTemplate[];
  waterLogs: DailyWaterLog[];
  weightLogs: WeightLog[];
  exerciseLogs: ExerciseLog[];
};

export type DailyTargets = Nutrition & {
  goalLabel: string;
  bmr: number;
  neat: number;
  exerciseCalories: number;
  tdee: number;
};
