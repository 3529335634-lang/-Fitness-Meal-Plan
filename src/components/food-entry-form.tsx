"use client";

import { useMemo, useState } from "react";
import { NumberInput } from "@/components/number-input";
import { estimateFoodNutrition, makeId, mealLabels, rawOrCookedLabels, searchFoodItems } from "@/lib/view-model";
import type { EntryMode, FoodDatabaseItem, FoodEntry, FoodTemplate, MealType, Nutrition, RawOrCooked } from "@/lib/types";

type FoodEntryFormProps = {
  mode: EntryMode;
  customFoods: FoodTemplate[];
  onAdd: (entry: FoodEntry) => void;
  onSaveCustomFood: (food: FoodTemplate) => void;
};

export function FoodEntryForm({ mode, customFoods, onAdd, onSaveCustomFood }: FoodEntryFormProps) {
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState(100);
  const [rawOrCooked, setRawOrCooked] = useState<RawOrCooked>("cooked");
  const [meal, setMeal] = useState<MealType>("breakfast");
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(null);
  const [manualPer100g, setManualPer100g] = useState({
    calories: 100,
    protein: 10,
    fat: 3,
    carbs: 10,
  });

  const matches = useMemo(() => searchFoodItems(query, rawOrCooked, customFoods), [query, rawOrCooked, customFoods]);
  const safeAmount = Math.max(1, Math.min(5000, amount));
  const safeManualPer100g = {
    calories: clamp(manualPer100g.calories, 0, 1000),
    protein: clamp(manualPer100g.protein, 0, 100),
    fat: clamp(manualPer100g.fat, 0, 100),
    carbs: clamp(manualPer100g.carbs, 0, 100),
  };
  const nutrition = selectedFood ? estimateFoodNutrition(selectedFood, safeAmount) : scaleManualNutrition(safeManualPer100g, safeAmount);
  const hasExactMatch = matches.some((item) => item.name === query.trim() && item.raw_or_cooked === rawOrCooked);

  function chooseFood(food: FoodDatabaseItem) {
    setSelectedFood(food);
    setQuery(food.name);
    setRawOrCooked(food.raw_or_cooked);
  }

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
    if (selectedFood?.name !== nextQuery) {
      setSelectedFood(null);
    }
  }

  function submit() {
    const now = new Date().toISOString();
    onAdd({
      id: makeId(mode),
      date: now.slice(0, 10),
      mode,
      meal,
      name: selectedFood?.name ?? (query.trim() || "未命名食物"),
      raw_or_cooked: rawOrCooked,
      amount: safeAmount,
      unit: "g",
      nutrition,
      createdAt: now,
    });
  }

  function saveCustomFood() {
    const now = new Date().toISOString();
    const food: FoodTemplate = {
      id: makeId("custom-food"),
      name: query.trim() || "自定义食物",
      raw_or_cooked: rawOrCooked,
      kcal_per_100g: safeManualPer100g.calories,
      protein_per_100g: safeManualPer100g.protein,
      fat_per_100g: safeManualPer100g.fat,
      carbs_per_100g: safeManualPer100g.carbs,
      source: "用户自定义",
      createdAt: now,
    };
    onSaveCustomFood(food);
    setSelectedFood(food);
  }

  return (
    <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-zinc-600">
          食物名称
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="例如 鸡胸肉"
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
          />
        </label>
        <label className="text-sm text-zinc-600">
          生重/熟重
          <select
            value={rawOrCooked}
            onChange={(event) => {
              setRawOrCooked(event.target.value as RawOrCooked);
              setSelectedFood(null);
            }}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-950"
          >
            {Object.entries(rawOrCookedLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {matches.length ? (
        <div className="max-h-44 space-y-2 overflow-auto rounded-lg border border-zinc-200 p-2">
          {matches.map((item) => {
            const active = selectedFood?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseFood(item)}
                className={`w-full rounded-lg p-2 text-left text-sm ${active ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-700"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{item.name}</span>
                  <span>{rawOrCookedLabels[item.raw_or_cooked]}</span>
                </div>
                <div className={`mt-1 text-xs ${active ? "text-zinc-200" : "text-zinc-500"}`}>
                  {item.kcal_per_100g} kcal · 蛋白 {item.protein_per_100g}g · {item.source}
                </div>
              </button>
            );
          })}
        </div>
      ) : query.trim() ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
          没找到这个食物，可以先手动填写每 100g 营养并保存。
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-zinc-600">
          重量 g
          <NumberInput
            value={amount}
            min={1}
            max={5000}
            onValueChange={setAmount}
            placeholder="100"
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
          />
        </label>
        <label className="text-sm text-zinc-600">
          餐次
          <select
            value={meal}
            onChange={(event) => setMeal(event.target.value as MealType)}
            className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-950"
          >
            {Object.entries(mealLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!selectedFood ? (
        <div className="grid grid-cols-2 gap-3">
          {([
            ["热量", "calories"],
            ["蛋白", "protein"],
            ["脂肪", "fat"],
            ["碳水", "carbs"],
          ] as const).map(([label, key]) => (
            <label key={key} className="text-sm text-zinc-600">
              {label}/100g
              <NumberInput
                min={0}
                max={key === "calories" ? 1000 : 100}
                value={manualPer100g[key]}
                onValueChange={(value) => setManualPer100g({ ...manualPer100g, [key]: value })}
                placeholder="0"
                className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
              />
            </label>
          ))}
        </div>
      ) : null}

      <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
        本次估算：{nutrition.calories} kcal · 蛋白 {nutrition.protein}g · 脂肪 {nutrition.fat}g · 碳水 {nutrition.carbs}g
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={saveCustomFood}
          disabled={!!selectedFood || hasExactMatch}
          className="h-12 rounded-lg border border-zinc-200 text-base font-medium text-zinc-700 disabled:opacity-40"
        >
          保存自定义
        </button>
        <button type="button" onClick={submit} className="h-12 rounded-lg bg-zinc-950 text-base font-medium text-white">
          添加到{mode === "plan" ? "计划" : "实际"}
        </button>
      </div>
    </section>
  );
}

function scaleManualNutrition(per100g: { calories: number; protein: number; fat: number; carbs: number }, amount: number): Nutrition {
  const ratio = amount / 100;
  return {
    calories: round(per100g.calories * ratio),
    protein: round(per100g.protein * ratio),
    fat: round(per100g.fat * ratio),
    carbs: round(per100g.carbs * ratio),
    water: 0,
  };
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
