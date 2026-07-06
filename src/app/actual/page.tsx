"use client";

import { useState } from "react";
import { FoodEntryForm } from "@/components/food-entry-form";
import { FoodList } from "@/components/food-list";
import { MetricCard } from "@/components/metric-card";
import { MobileShell } from "@/components/mobile-shell";
import { NumberInput } from "@/components/number-input";
import { PageHeader } from "@/components/page-header";
import { useAppData } from "@/hooks/use-app-data";
import { estimateExerciseCalories, exerciseTemplates, makeId, round, sumNutrition, todayKey } from "@/lib/view-model";

export default function ActualPage() {
  const { data, setData, todayActual, targets } = useAppData();
  const [exerciseName, setExerciseName] = useState(exerciseTemplates[0].name);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [deviceCalories, setDeviceCalories] = useState(0);

  if (!data || !targets) {
    return <MobileShell><div className="p-5 text-sm text-zinc-500">加载中...</div></MobileShell>;
  }

  const total = sumNutrition(todayActual);
  const today = todayKey();
  const waterLog = data.waterLogs.find((item) => item.date === today);
  const waterTarget = targets.water;
  const todayExercises = data.exerciseLogs.filter((item) => item.date === today);
  const selectedExercise = exerciseTemplates.find((item) => item.name === exerciseName) ?? exerciseTemplates[0];
  const safeDurationMinutes = Math.max(1, durationMinutes);
  const estimatedCalories = estimateExerciseCalories(selectedExercise.met, data.goal.currentWeightKg, safeDurationMinutes);

  function updateWater(actualMl: number) {
    const safeWater = Math.max(0, Math.min(10000, Math.round(actualMl)));
    setData((current) => {
      if (!current) return current;
      return {
        ...current,
        waterLogs: [
          ...current.waterLogs.filter((item) => item.date !== today),
          { date: today, planMl: waterTarget, actualMl: safeWater },
        ],
      };
    });
  }

  function addEstimatedExercise() {
    if (safeDurationMinutes <= 0 || estimatedCalories <= 0) return;
    const now = new Date().toISOString();
    setData((current) =>
      current && {
        ...current,
        exerciseLogs: [
          ...current.exerciseLogs,
          {
            id: makeId("exercise"),
            date: today,
            name: exerciseName,
            durationMinutes: safeDurationMinutes,
            calories: estimatedCalories,
            source: "estimated",
            createdAt: now,
          },
        ],
      },
    );
  }

  function addDeviceExercise() {
    const safeDeviceCalories = Math.max(0, Math.min(3000, Math.round(deviceCalories)));
    if (safeDeviceCalories <= 0) return;
    const now = new Date().toISOString();
    setData((current) =>
      current && {
        ...current,
        exerciseLogs: [
          ...current.exerciseLogs,
          {
            id: makeId("device-exercise"),
            date: today,
            name: "运动设备",
            durationMinutes: 0,
            calories: safeDeviceCalories,
            source: "device",
            createdAt: now,
          },
        ],
      },
    );
    setDeviceCalories(0);
  }

  return (
    <MobileShell>
      <PageHeader title="实际摄入" subtitle="记录真正吃进去的食物和饮水，今天完成情况会自动更新。" />
      <section className="grid grid-cols-2 gap-3 px-5">
        <MetricCard label="实际热量" value={`${round(total.calories)} kcal`} hint={`目标 ${targets.calories} kcal`} />
        <MetricCard label="运动消耗" value={`${targets.exerciseCalories} kcal`} hint={`TDEE ${targets.tdee} kcal`} accent="amber" />
        <MetricCard label="饮水" value={`${waterLog?.actualMl ?? 0} ml`} hint={`目标 ${targets.water} ml`} accent="blue" />
        <MetricCard label="今日建议" value={`${targets.calories} kcal`} hint="随运动动态变化" />
      </section>
      <section className="mt-4 space-y-4 px-5">
        <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium text-zinc-950">今日运动消耗</div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-zinc-600">
              运动项目
              <select
                value={exerciseName}
                onChange={(event) => setExerciseName(event.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-950"
              >
                {exerciseTemplates.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-zinc-600">
              时长 分钟
              <NumberInput
                value={durationMinutes}
                min={1}
                max={600}
                onValueChange={setDurationMinutes}
                placeholder="45"
                className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={addEstimatedExercise}
            className="h-11 w-full rounded-lg bg-zinc-950 text-base font-medium text-white"
          >
            添加估算消耗 {estimatedCalories} kcal
          </button>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <label className="text-sm text-zinc-600">
              设备运动消耗 kcal
              <NumberInput
                value={deviceCalories}
                min={0}
                max={3000}
                onValueChange={setDeviceCalories}
                placeholder="例如 320"
                className="mt-1 h-11 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
              />
            </label>
            <button
              type="button"
              onClick={addDeviceExercise}
              className="mt-6 h-11 rounded-lg bg-teal-600 px-4 text-base font-medium text-white"
            >
              添加
            </button>
          </div>
          {todayExercises.length ? (
            <div className="space-y-2 border-t border-zinc-100 pt-2">
              {todayExercises.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600">
                    {item.name}
                    {item.durationMinutes ? ` · ${item.durationMinutes}分钟` : ""} · {item.source === "device" ? "设备" : "估算"}
                  </span>
                  <span className="flex items-center gap-2 font-medium text-zinc-950">
                    {item.calories} kcal
                    <button
                      type="button"
                      onClick={() =>
                        setData((current) =>
                          current && { ...current, exerciseLogs: current.exerciseLogs.filter((log) => log.id !== item.id) },
                        )
                      }
                      className="h-7 w-7 rounded-lg bg-zinc-100 text-zinc-500"
                      aria-label="删除运动记录"
                    >
                      ×
                    </button>
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
        <label className="block rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
          今日饮水 ml
          <NumberInput
            value={waterLog?.actualMl ?? 0}
            min={0}
            max={10000}
            onValueChange={updateWater}
            placeholder="例如 2000"
            className="mt-1 h-12 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
          />
        </label>
        <FoodEntryForm
          mode="actual"
          customFoods={data.foodTemplates}
          onAdd={(entry) => setData((current) => current && { ...current, foodEntries: [...current.foodEntries, entry] })}
          onSaveCustomFood={(food) => setData((current) => current && { ...current, foodTemplates: [...current.foodTemplates, food] })}
        />
        <FoodList
          entries={todayActual}
          onRemove={(id) => setData((current) => current && { ...current, foodEntries: current.foodEntries.filter((entry) => entry.id !== id) })}
        />
      </section>
    </MobileShell>
  );
}
