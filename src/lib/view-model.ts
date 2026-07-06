export {
  calculateTargets,
  completionRate,
  emptyNutrition,
  estimateExerciseCalories,
  estimateFoodNutrition,
  activityLabels,
  exerciseTemplates,
  goalLabels,
  makeId,
  mealLabels,
  modeLabels,
  nutrientDelta,
  round,
  sexLabels,
  sumExerciseCalories,
  sumNutrition,
  todayKey,
} from "./nutrition";
export { builtInFoodDatabase, getAllFoodItems, rawOrCookedLabels, searchFoodItems } from "./food-data";
export { buildPlanSummary, createPlanCycle, finishCurrentCycle, getActiveCycleData, getCycleDays } from "./plan-cycles";

import type { EntryMode, FoodEntry, Nutrition } from "./types";
import { sumNutrition, todayKey } from "./nutrition";

export function loadByDateAndMode(entries: FoodEntry[], date: string, mode: EntryMode) {
  return entries.filter((entry) => entry.date === date && entry.mode === mode);
}

export function dailySeries(entries: FoodEntry[], days = 7) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    const key = todayKey(date);
    const actual = sumNutrition(loadByDateAndMode(entries, key, "actual"));
    const plan = sumNutrition(loadByDateAndMode(entries, key, "plan"));
    return { date: key.slice(5), actual, plan };
  });
}

export function nutritionWithWater(nutrition: Nutrition, water: number): Nutrition {
  return { ...nutrition, water };
}
