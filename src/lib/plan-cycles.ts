import type { AppData, PlanCycle, PlanSummary, UserGoal } from "./types";
import { completionRate, makeId, sumNutrition, todayKey } from "./nutrition";

export function createPlanCycle(goal: UserGoal, startDate = todayKey()): PlanCycle {
  return {
    id: makeId("cycle"),
    goalType: goal.goalType,
    startWeightKg: goal.currentWeightKg,
    targetWeightKg: goal.targetWeightKg,
    start_date: startDate,
    foodEntries: [],
    waterLogs: [],
    weightLogs: [{ date: startDate, weightKg: goal.currentWeightKg }],
    exerciseLogs: [],
  };
}

export function getActiveCycleData(data: AppData) {
  const start = data.activePlan.start_date;
  const end = data.activePlan.end_date;
  return {
    foodEntries: filterByRange(data.foodEntries, start, end),
    waterLogs: filterByRange(data.waterLogs, start, end),
    weightLogs: filterByRange(data.weightLogs, start, end),
    exerciseLogs: filterByRange(data.exerciseLogs, start, end),
  };
}

export function finishCurrentCycle(data: AppData, endDate = todayKey()): AppData {
  const cycleData = getActiveCycleData(data);
  const archivedCycle: PlanCycle = {
    ...data.activePlan,
    goalType: data.goal.goalType,
    targetWeightKg: data.goal.targetWeightKg,
    end_date: endDate,
    ...cycleData,
    summary: buildPlanSummary({
      ...data.activePlan,
      end_date: endDate,
      ...cycleData,
    }),
  };
  const nextPlan = createPlanCycle(data.goal, endDate);

  return {
    ...data,
    activePlan: nextPlan,
    planCycles: [...data.planCycles, archivedCycle],
    foodEntries: [],
    waterLogs: [],
    weightLogs: nextPlan.weightLogs,
    exerciseLogs: [],
  };
}

export function buildPlanSummary(cycle: PlanCycle): PlanSummary {
  const actualEntries = cycle.foodEntries.filter((entry) => entry.mode === "actual");
  const planEntries = cycle.foodEntries.filter((entry) => entry.mode === "plan");
  const actualNutrition = sumNutrition(actualEntries);
  const planNutrition = sumNutrition(planEntries);
  const days = Math.max(1, getCycleDays(cycle));
  const firstWeight = cycle.weightLogs[0]?.weightKg ?? cycle.startWeightKg;
  const lastWeight = cycle.weightLogs.at(-1)?.weightKg ?? firstWeight;
  const actualWater = cycle.waterLogs.reduce((sum, log) => sum + log.actualMl, 0);
  const planWater = cycle.waterLogs.reduce((sum, log) => sum + log.planMl, 0);
  const waterCompletionRate = planWater > 0 ? Math.round((actualWater / planWater) * 100) : 0;
  const macroCompletion = planNutrition.calories > 0 ? completionRate(actualNutrition, planNutrition) : 0;

  return {
    weightChangeKg: round(lastWeight - firstWeight),
    averageCalories: round(actualNutrition.calories / days),
    averageProtein: round(actualNutrition.protein / days),
    averageFat: round(actualNutrition.fat / days),
    averageCarbs: round(actualNutrition.carbs / days),
    waterCompletionRate,
    planCompletionRate: macroCompletion,
    positives: makePositives(actualNutrition, planNutrition, waterCompletionRate),
    improvements: makeImprovements(actualNutrition, planNutrition, waterCompletionRate),
    nextSuggestions: makeSuggestions(cycle, actualNutrition, planNutrition, waterCompletionRate),
  };
}

export function getCycleDays(cycle: PlanCycle) {
  const start = new Date(cycle.start_date).getTime();
  const end = new Date(cycle.end_date ?? todayKey()).getTime();
  return Math.max(1, Math.floor((end - start) / 86400000) + 1);
}

function filterByRange<T extends { date: string }>(items: T[], start: string, end?: string) {
  return items.filter((item) => item.date >= start && (!end || item.date <= end));
}

function makePositives(actual: ReturnType<typeof sumNutrition>, plan: ReturnType<typeof sumNutrition>, waterRate: number) {
  const positives = [];
  if (actual.protein > 0) positives.push("已经建立了蛋白质摄入记录习惯。");
  if (waterRate >= 80) positives.push("饮水完成情况比较稳定。");
  if (plan.calories > 0) positives.push("周期内保留了计划与实际对照数据。");
  return positives.length ? positives : ["完成了一个可追溯的饮食计划周期。"];
}

function makeImprovements(actual: ReturnType<typeof sumNutrition>, plan: ReturnType<typeof sumNutrition>, waterRate: number) {
  const improvements = [];
  if (plan.calories === 0) improvements.push("计划饮食记录偏少，后续可提前录入每日计划。");
  if (plan.protein > 0 && actual.protein < plan.protein * 0.8) improvements.push("蛋白质摄入距离计划仍有差距。");
  if (waterRate > 0 && waterRate < 80) improvements.push("饮水完成率偏低，可以分餐次提醒自己补水。");
  return improvements.length ? improvements : ["继续保持当前记录节奏，下一周期可关注稳定性。"];
}

function makeSuggestions(
  cycle: PlanCycle,
  actual: ReturnType<typeof sumNutrition>,
  plan: ReturnType<typeof sumNutrition>,
  waterRate: number,
) {
  const suggestions = [];
  if (cycle.goalType === "fat_loss") {
    suggestions.push("下一周期继续用 TDEE 动态热量，优先保证蛋白质和饮水。");
  }
  if (plan.calories > 0 && actual.calories > plan.calories * 1.1) {
    suggestions.push("下一周期可把高热量食物提前计划，减少临时加餐。");
  }
  if (waterRate < 90) suggestions.push("下一周期设置一个更容易完成的饮水节奏。");
  suggestions.push("每周至少记录 2 次体重，便于判断趋势。");
  return suggestions;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
