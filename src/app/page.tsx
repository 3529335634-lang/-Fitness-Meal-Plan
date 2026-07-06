"use client";

import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { MobileShell } from "@/components/mobile-shell";
import { PageHeader } from "@/components/page-header";
import { ProgressRing } from "@/components/progress-ring";
import { useAppData } from "@/hooks/use-app-data";
import { completionRate, nutritionWithWater, nutrientDelta, round, sumNutrition } from "@/lib/view-model";

export default function HomePage() {
  const { data, targets, todayActual } = useAppData();

  if (!data || !targets) {
    return <MobileShell><div className="p-5 text-sm text-zinc-500">加载中...</div></MobileShell>;
  }

  const waterLog = data.waterLogs.find((item) => item.date === new Date().toISOString().slice(0, 10));
  const plan = nutritionWithWater(targets, waterLog?.planMl ?? targets.water);
  const actual = nutritionWithWater(sumNutrition(todayActual), waterLog?.actualMl ?? 0);
  const rate = completionRate(actual, targets);

  return (
    <MobileShell>
      <PageHeader title="今日概览" subtitle={`${targets.goalLabel} · 当前 ${data.goal.currentWeightKg}kg → 目标 ${data.goal.targetWeightKg}kg`} />
      <section className="px-5">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-zinc-500">今日完成率</div>
              <div className="mt-2 text-3xl font-semibold text-zinc-950">{rate}%</div>
              <p className="mt-2 text-sm leading-6 text-zinc-500">按热量、蛋白质和饮水综合估算。</p>
            </div>
            <ProgressRing value={rate} label="完成" />
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 px-5">
        <MetricCard label="目标热量" value={`${targets.calories} kcal`} hint={`实际 ${round(actual.calories)} kcal`} />
        <MetricCard label="蛋白质" value={`${targets.protein} g`} hint={`实际 ${round(actual.protein)} g`} accent="blue" />
        <MetricCard label="脂肪" value={`${targets.fat} g`} hint={`实际 ${round(actual.fat)} g`} accent="amber" />
        <MetricCard label="碳水" value={`${targets.carbs} g`} hint={`实际 ${round(actual.carbs)} g`} accent="rose" />
      </section>

      <section className="mt-5 px-5">
        <h2 className="mb-3 text-base font-semibold text-zinc-950">动态目标 vs 实际</h2>
        <div className="space-y-2 rounded-lg border border-zinc-200 p-3">
          {[
            ["热量", nutrientDelta(actual.calories, plan.calories), "kcal"],
            ["蛋白质", nutrientDelta(actual.protein, plan.protein), "g"],
            ["脂肪", nutrientDelta(actual.fat, plan.fat), "g"],
            ["碳水", nutrientDelta(actual.carbs, plan.carbs), "g"],
            ["饮水", nutrientDelta(actual.water, plan.water), "ml"],
          ].map(([label, value, unit]) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">{label}</span>
              <span className="font-medium text-zinc-950">
                {value} {unit}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 px-5">
        <Link href="/plan" className="h-12 rounded-lg bg-zinc-950 px-4 py-3 text-center font-medium text-white">
          记录计划
        </Link>
        <Link href="/actual" className="h-12 rounded-lg bg-teal-600 px-4 py-3 text-center font-medium text-white">
          记录实际
        </Link>
      </section>
    </MobileShell>
  );
}
