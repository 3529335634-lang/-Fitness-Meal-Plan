"use client";

import { useMemo, useState } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { NumberInput } from "@/components/number-input";
import { PageHeader } from "@/components/page-header";
import { useAppData } from "@/hooks/use-app-data";
import { builtInFoodDatabase, makeId, rawOrCookedLabels, searchFoodItems } from "@/lib/view-model";
import type { RawOrCooked } from "@/lib/types";

export default function FoodsPage() {
  const { data, setData } = useAppData();
  const [name, setName] = useState("");
  const [rawOrCooked, setRawOrCooked] = useState<RawOrCooked>("cooked");
  const [calories, setCalories] = useState(100);
  const [protein, setProtein] = useState(10);
  const [fat, setFat] = useState(3);
  const [carbs, setCarbs] = useState(10);
  const [query, setQuery] = useState("");

  const matches = useMemo(() => searchFoodItems(query, rawOrCooked, data?.foodTemplates ?? []), [query, rawOrCooked, data?.foodTemplates]);

  if (!data) {
    return <MobileShell><div className="p-5 text-sm text-zinc-500">加载中...</div></MobileShell>;
  }

  function addTemplate() {
    const now = new Date().toISOString();
    const safeNutrition = {
      calories: clamp(calories, 0, 1000),
      protein: clamp(protein, 0, 100),
      fat: clamp(fat, 0, 100),
      carbs: clamp(carbs, 0, 100),
    };
    setData((current) =>
      current && {
        ...current,
        foodTemplates: [
          ...current.foodTemplates,
          {
            id: makeId("custom-food"),
            name: name.trim() || "自定义食物",
            raw_or_cooked: rawOrCooked,
            kcal_per_100g: safeNutrition.calories,
            protein_per_100g: safeNutrition.protein,
            fat_per_100g: safeNutrition.fat,
            carbs_per_100g: safeNutrition.carbs,
            source: "用户自定义",
            createdAt: now,
          },
        ],
      },
    );
    setName("");
  }

  return (
    <MobileShell>
      <PageHeader title="食物数据库" subtitle={`系统库 ${builtInFoodDatabase.length} 条，另支持自定义食物。`} />
      <section className="space-y-4 px-5">
        <div className="rounded-lg border border-zinc-200 p-4">
          <label className="block text-sm text-zinc-600">
            搜索食物库
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例如 鸡胸肉、米饭、香蕉"
              className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
            />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["raw", "cooked"] as const).map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setRawOrCooked(state)}
                className={`h-10 rounded-lg text-sm font-medium ${rawOrCooked === state ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600"}`}
              >
                {rawOrCookedLabels[state]}
              </button>
            ))}
          </div>
          <div className="mt-3 max-h-52 space-y-2 overflow-auto">
            {matches.map((item) => (
              <article key={item.id} className="rounded-lg bg-zinc-50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-950">{item.name}</span>
                  <span className="text-zinc-500">{rawOrCookedLabels[item.raw_or_cooked]}</span>
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {item.kcal_per_100g} kcal · 蛋白 {item.protein_per_100g}g · 脂肪 {item.fat_per_100g}g · 碳水 {item.carbs_per_100g}g
                </div>
                <div className="mt-1 text-xs text-zinc-400">{item.source}</div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="mb-3 text-sm font-medium text-zinc-950">新增自定义食物</div>
          <label className="block text-sm text-zinc-600">
            食物名称
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950" />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-sm text-zinc-600">
              生熟状态
              <select
                value={rawOrCooked}
                onChange={(event) => setRawOrCooked(event.target.value as RawOrCooked)}
                className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-950"
              >
                {Object.entries(rawOrCookedLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {[
              ["热量", calories, setCalories],
              ["蛋白", protein, setProtein],
              ["脂肪", fat, setFat],
              ["碳水", carbs, setCarbs],
            ].map(([label, value, setter]) => (
              <label key={label as string} className="text-sm text-zinc-600">
                {label as string}/100g
                <NumberInput
                  value={value as number}
                  min={0}
                  max={label === "热量" ? 1000 : 100}
                  onValueChange={setter as (value: number) => void}
                  placeholder="0"
                  className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
                />
              </label>
            ))}
          </div>
          <button type="button" onClick={addTemplate} className="mt-4 h-12 w-full rounded-lg bg-zinc-950 text-base font-medium text-white">
            保存自定义食物
          </button>
        </div>

        <div className="space-y-2">
          {data.foodTemplates.map((item) => (
            <article key={item.id} className="rounded-lg border border-zinc-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-zinc-950">
                    {item.name} · {rawOrCookedLabels[item.raw_or_cooked]}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    100g · {item.kcal_per_100g} kcal · 蛋白 {item.protein_per_100g}g
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setData((current) => current && { ...current, foodTemplates: current.foodTemplates.filter((template) => template.id !== item.id) })}
                  className="h-8 w-8 rounded-lg bg-zinc-100 text-zinc-500"
                  aria-label="删除"
                >
                  ×
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </MobileShell>
  );
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
