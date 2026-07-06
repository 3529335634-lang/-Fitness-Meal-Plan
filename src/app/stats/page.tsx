"use client";

import { MetricCard } from "@/components/metric-card";
import { MobileShell } from "@/components/mobile-shell";
import { PageHeader } from "@/components/page-header";
import { SimpleLineChart } from "@/components/simple-line-chart";
import { useAppData } from "@/hooks/use-app-data";
import { completionRate, dailySeries, round, sumNutrition, todayKey } from "@/lib/view-model";

export default function StatsPage() {
  const { data, targets, todayActual } = useAppData();

  if (!data || !targets) {
    return <MobileShell><div className="p-5 text-sm text-zinc-500">加载中...</div></MobileShell>;
  }

  const series = dailySeries(data.foodEntries, 7);
  const todayTotal = sumNutrition(todayActual);
  const water = data.waterLogs.find((item) => item.date === todayKey())?.actualMl ?? 0;
  const rate = completionRate({ ...todayTotal, water }, targets);
  const proteinRate = Math.round((todayTotal.protein / Math.max(targets.protein, 1)) * 100);

  return (
    <MobileShell>
      <PageHeader title="统计" subtitle="第一版先看最近 7 天趋势，后续可以扩展周报、月报和导出。" />
      <section className="grid grid-cols-2 gap-3 px-5">
        <MetricCard label="今日完成率" value={`${rate}%`} />
        <MetricCard label="蛋白达标率" value={`${proteinRate}%`} accent="blue" />
      </section>
      <section className="mt-5 space-y-5 px-5">
        <div>
          <h2 className="mb-2 text-base font-semibold">热量趋势</h2>
          <SimpleLineChart data={series.map((item) => ({ label: item.date, value: item.actual.calories }))} unit="kcal" />
        </div>
        <div>
          <h2 className="mb-2 text-base font-semibold">蛋白质趋势</h2>
          <SimpleLineChart data={series.map((item) => ({ label: item.date, value: item.actual.protein }))} color="#0369a1" unit="g" />
        </div>
        <div>
          <h2 className="mb-2 text-base font-semibold">碳水 / 脂肪摄入</h2>
          <div className="rounded-lg border border-zinc-200 p-3 text-sm">
            {series.map((item) => (
              <div key={item.date} className="flex justify-between border-b border-zinc-100 py-2 last:border-0">
                <span className="text-zinc-500">{item.date}</span>
                <span>碳水 {round(item.actual.carbs)}g · 脂肪 {round(item.actual.fat)}g</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-base font-semibold">体重变化</h2>
          <SimpleLineChart data={data.weightLogs.slice(-7).map((item) => ({ label: item.date.slice(5), value: item.weightKg }))} color="#be123c" unit="kg" />
        </div>
      </section>
    </MobileShell>
  );
}
