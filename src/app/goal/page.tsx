"use client";

import { MobileShell } from "@/components/mobile-shell";
import { NumberInput } from "@/components/number-input";
import { PageHeader } from "@/components/page-header";
import { useAppData } from "@/hooks/use-app-data";
import { activityLabels, calculateTargets, goalLabels, sexLabels, todayKey } from "@/lib/view-model";
import type { ActivityLevel, GoalType, Sex } from "@/lib/types";

export default function GoalPage() {
  const { data, setData } = useAppData();

  if (!data) {
    return <MobileShell><div className="p-5 text-sm text-zinc-500">加载中...</div></MobileShell>;
  }

  const targets = calculateTargets(data.goal);

  function updateGoal(
    field: "sex" | "age" | "heightCm" | "currentWeightKg" | "targetWeightKg" | "goalType" | "activityLevel",
    value: number | GoalType | Sex | ActivityLevel,
  ) {
    setData((current) => {
      if (!current) return current;
      const safeValue = typeof value === "number" ? clampGoalValue(field, value) : value;
      const nextGoal = { ...current.goal, [field]: safeValue, updatedAt: new Date().toISOString() };
      const today = todayKey();
      const weightLogs = current.weightLogs.filter((item) => item.date !== today);
      return {
        ...current,
        goal: nextGoal,
        activePlan: {
          ...current.activePlan,
          goalType: nextGoal.goalType,
          targetWeightKg: nextGoal.targetWeightKg,
        },
        weightLogs: [...weightLogs, { date: today, weightKg: nextGoal.currentWeightKg }],
      };
    });
  }

  return (
    <MobileShell>
      <PageHeader title="目标设置" subtitle="输入基础信息和日常活动等级，用 BMR + NEAT 生成每日目标。" />
      <section className="space-y-4 px-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-zinc-600">
            性别
            <select
              value={data.goal.sex}
              onChange={(event) => updateGoal("sex", event.target.value as Sex)}
              className="mt-1 h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-950"
            >
              {Object.entries(sexLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-zinc-600">
            年龄
            <NumberInput
              value={data.goal.age}
              min={12}
              max={100}
              onValueChange={(value) => updateGoal("age", value)}
              placeholder="30"
              className="mt-1 h-12 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
            />
          </label>
        </div>
        <label className="block text-sm text-zinc-600">
          身高 cm
          <NumberInput
            value={data.goal.heightCm}
            min={120}
            max={230}
            onValueChange={(value) => updateGoal("heightCm", value)}
            placeholder="175"
            className="mt-1 h-12 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-zinc-600">
            当前体重 kg
            <NumberInput
              value={data.goal.currentWeightKg}
              min={30}
              max={250}
              onValueChange={(value) => updateGoal("currentWeightKg", value)}
              placeholder="70"
              className="mt-1 h-12 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
            />
          </label>
          <label className="text-sm text-zinc-600">
            目标体重 kg
            <NumberInput
              value={data.goal.targetWeightKg}
              min={30}
              max={250}
              onValueChange={(value) => updateGoal("targetWeightKg", value)}
              placeholder="68"
              className="mt-1 h-12 w-full rounded-lg border border-zinc-200 px-3 text-base text-zinc-950"
            />
          </label>
        </div>
        <label className="block text-sm text-zinc-600">
          目标类型
          <select
            value={data.goal.goalType}
            onChange={(event) => updateGoal("goalType", event.target.value as GoalType)}
            className="mt-1 h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-950"
          >
            {Object.entries(goalLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-zinc-600">
          NEAT（日常活动）
          <select
            value={data.goal.activityLevel}
            onChange={(event) => updateGoal("activityLevel", event.target.value as ActivityLevel)}
            className="mt-1 h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-950"
          >
            {Object.entries(activityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="text-sm text-zinc-500">每日目标</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <span>BMR {targets.bmr} kcal</span>
            <span>NEAT {targets.neat} kcal</span>
            <span>热量 {targets.calories} kcal</span>
            <span>蛋白 {targets.protein} g</span>
            <span>脂肪 {targets.fat} g</span>
            <span>碳水 {targets.carbs} g</span>
            <span>饮水 {targets.water} ml</span>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}

function clampGoalValue(field: string, value: number) {
  const ranges: Record<string, [number, number]> = {
    age: [12, 100],
    heightCm: [120, 230],
    currentWeightKg: [30, 250],
    targetWeightKg: [30, 250],
  };
  const [min, max] = ranges[field] ?? [0, Number.MAX_SAFE_INTEGER];
  return Math.min(max, Math.max(min, value));
}
