import systemFoodDatabase from "@/data/food-database.json";
import type { FoodDatabaseItem, FoodTemplate, RawOrCooked } from "./types";

export const builtInFoodDatabase = systemFoodDatabase as FoodDatabaseItem[];

export const rawOrCookedLabels: Record<RawOrCooked, string> = {
  raw: "生重",
  cooked: "熟重",
};

export function getAllFoodItems(customFoods: FoodTemplate[] = []): FoodDatabaseItem[] {
  return [...customFoods, ...builtInFoodDatabase];
}

export function searchFoodItems(query: string, state: RawOrCooked, customFoods: FoodTemplate[] = []) {
  const normalized = query.trim().toLowerCase();
  const foods = getAllFoodItems(customFoods);
  if (!normalized) {
    return foods.filter((item) => item.raw_or_cooked === state).slice(0, 12);
  }

  return foods
    .map((item) => {
      const name = item.name.toLowerCase();
      const exact = name === normalized ? 100 : 0;
      const starts = name.startsWith(normalized) ? 60 : 0;
      const includes = name.includes(normalized) ? 30 : 0;
      const chars = [...normalized].filter((char) => name.includes(char)).length;
      const stateBoost = item.raw_or_cooked === state ? 20 : 0;
      return { item, score: exact + starts + includes + chars + stateBoost };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
    .slice(0, 12);
}
