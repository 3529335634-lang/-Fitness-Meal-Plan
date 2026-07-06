"use client";

import { initialData } from "./nutrition";
import { createPlanCycle } from "./plan-cycles";
import type { AppData, FoodEntry, FoodTemplate } from "./types";

const STORAGE_KEY = "fit-diet-mvp-data-v1";

export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return initialData;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialData;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const migratedTemplates = (parsed.foodTemplates ?? []).map((item) => migrateFoodTemplate(item as Partial<FoodTemplate> & {
      nutritionPer100g?: { calories: number; protein: number; fat: number; carbs: number };
      defaultAmount?: number;
      unit?: string;
    }));

    const foodEntries = (parsed.foodEntries ?? []).map((entry) => sanitizeFoodEntry(entry));
    const waterLogs = (parsed.waterLogs ?? []).map((log) => ({
      ...log,
      planMl: Math.max(0, log.planMl),
      actualMl: Math.max(0, log.actualMl),
    }));
    const weightLogs = parsed.weightLogs ?? initialData.weightLogs;
    const exerciseLogs = (parsed.exerciseLogs ?? []).map((log) => ({
      ...log,
      durationMinutes: Math.max(0, log.durationMinutes),
      calories: Math.max(0, log.calories),
    }));
    const goal = { ...initialData.goal, ...parsed.goal };
    const activePlan = parsed.activePlan ?? {
      ...createPlanCycle(goal),
      foodEntries,
      waterLogs,
      weightLogs,
      exerciseLogs,
    };

    return {
      ...initialData,
      ...parsed,
      goal,
      activePlan,
      planCycles: parsed.planCycles ?? [],
      foodEntries,
      foodTemplates: migratedTemplates,
      waterLogs,
      weightLogs,
      exerciseLogs,
    };
  } catch {
    return initialData;
  }
}

function sanitizeFoodEntry(entry: FoodEntry): FoodEntry {
  return {
    ...entry,
    raw_or_cooked: entry.raw_or_cooked ?? "cooked",
    amount: Math.max(0, entry.amount),
    nutrition: {
      calories: Math.max(0, entry.nutrition.calories),
      protein: Math.max(0, entry.nutrition.protein),
      fat: Math.max(0, entry.nutrition.fat),
      carbs: Math.max(0, entry.nutrition.carbs),
      water: Math.max(0, entry.nutrition.water),
    },
  };
}

function migrateFoodTemplate(item: Partial<FoodTemplate> & {
  nutritionPer100g?: { calories: number; protein: number; fat: number; carbs: number };
}): FoodTemplate {
  if (item.kcal_per_100g !== undefined) {
    return item as FoodTemplate;
  }

  return {
    id: item.id ?? `custom-${Date.now()}`,
    name: item.name ?? "自定义食物",
    raw_or_cooked: item.raw_or_cooked ?? "cooked",
    kcal_per_100g: item.nutritionPer100g?.calories ?? 0,
    protein_per_100g: item.nutritionPer100g?.protein ?? 0,
    fat_per_100g: item.nutritionPer100g?.fat ?? 0,
    carbs_per_100g: item.nutritionPer100g?.carbs ?? 0,
    source: item.source ?? "用户自定义",
    createdAt: item.createdAt ?? new Date().toISOString(),
  };
}

export function saveAppData(data: AppData) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
