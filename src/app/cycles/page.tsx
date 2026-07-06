"use client";

import { useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { MobileShell } from "@/components/mobile-shell";
import { PageHeader } from "@/components/page-header";
import { useAppData } from "@/hooks/use-app-data";
import { getActiveCycleData, getCycleDays, goalLabels, round, sumNutrition } from "@/lib/view-model";
import type { PlanCycle } from "@/lib/types";

export default function CyclesPage() {
  const { data } = useAppData();
  const [openId, setOpenId] = useState<string | null>(null);

  if (!data) {
    return <MobileShell><div className="p-5 text-sm text-zinc-500">加载中...</div></MobileShell>;
  }

  const activeCycleData = getActiveCycleData(data);
  const activeCycle = { ...data.activePlan, ...activeCycleData };
  const activeNutrition = sumNutrition(activeCycle.foodEntries.filter((entry) => entry.mode === "actual"));

  return (
    <MobileShell>
      <PageHeader title="计划周期" subtitle="当前计划单独显示，已结束周期可查看详情和总结。" />
      <section className="space-y-4 px-5">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm text-zinc-500">当前进行中</div>
          <div className="mt-1 text-lg font-semibold text-zinc-950">
            {goalLabels[activeCycle.goalType]} · 第 {getCycleDays(activeCycle)} 天
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {activeCycle.start_date} 开始 · {activeCycle.startWeightKg}kg → {activeCycle.targetWeightKg}kg
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <MetricCard label="实际热量" value={`${round(activeNutrition.calories)} kcal`} />
            <MetricCard label="蛋白质" value={`${round(activeNutrition.protein)} g`} accent="blue" />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-zinc-950">历史计划周期</h2>
          {data.planCycles.length ? (
            <div className="space-y-3">
              {[...data.planCycles].reverse().map((cycle) => (
                <CycleCard
                  key={cycle.id}
                  cycle={cycle}
                  open={openId === cycle.id}
                  onToggle={() => setOpenId(openId === cycle.id ? null : cycle.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-500">
              还没有结束的计划周期。
            </div>
          )}
        </div>
      </section>
    </MobileShell>
  );
}

function CycleCard({ cycle, open, onToggle }: { cycle: PlanCycle; open: boolean; onToggle: () => void }) {
  const summary = cycle.summary;

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4">
      <button type="button" onClick={onToggle} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-zinc-950">{goalLabels[cycle.goalType]}周期</div>
            <div className="mt-1 text-xs text-zinc-500">
              {cycle.start_date} 至 {cycle.end_date} · {cycle.startWeightKg}kg → {cycle.targetWeightKg}kg
            </div>
          </div>
          <span className="text-sm text-zinc-500">{open ? "收起" : "查看"}</span>
        </div>
      </button>

      {open && summary ? (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="体重变化" value={`${summary.weightChangeKg} kg`} />
            <MetricCard label="计划完成率" value={`${summary.planCompletionRate}%`} accent="blue" />
            <MetricCard label="平均热量" value={`${summary.averageCalories} kcal`} accent="amber" />
            <MetricCard label="饮水完成率" value={`${summary.waterCompletionRate}%`} />
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
            平均：蛋白 {summary.averageProtein}g · 脂肪 {summary.averageFat}g · 碳水 {summary.averageCarbs}g
          </div>
          <SummaryList title="做得好的地方" items={summary.positives} />
          <SummaryList title="不足的地方" items={summary.improvements} />
          <SummaryList title="下一周期建议" items={summary.nextSuggestions} />
        </div>
      ) : null}
    </article>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-zinc-950">{title}</div>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
