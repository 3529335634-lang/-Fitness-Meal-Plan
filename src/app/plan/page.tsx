"use client";

import { MetricCard } from "@/components/metric-card";
import { MobileShell } from "@/components/mobile-shell";
import { PageHeader } from "@/components/page-header";
import { useAppData } from "@/hooks/use-app-data";
import { finishCurrentCycle, getActiveCycleData, getCycleDays, goalLabels } from "@/lib/view-model";

export default function PlanPage() {
  const { data, setData, targets } = useAppData();

  if (!data || !targets) {
    return <MobileShell><div className="p-5 text-sm text-zinc-500">加载中...</div></MobileShell>;
  }
  const activeCycleData = getActiveCycleData(data);
  const activeCycleDays = getCycleDays({ ...data.activePlan, ...activeCycleData });

  function endCurrentPlan() {
    if (!window.confirm("结束当前计划后会生成周期总结并归档，然后开启下一周期。确认结束吗？")) {
      return;
    }
    setData((current) => current && finishCurrentCycle(current));
  }

  return (
    <MobileShell>
      <PageHeader
        title="计划饮食"
        subtitle={`按 BMR + NEAT + 今日运动消耗，结合${goalLabels[data.goal.goalType]}目标动态估算。`}
      />
      <section className="mb-4 px-5">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-500">当前计划周期</div>
              <div className="mt-1 text-lg font-semibold text-zinc-950">
                {goalLabels[data.activePlan.goalType]} · 第 {activeCycleDays} 天
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {data.activePlan.start_date} 开始 · {data.activePlan.startWeightKg}kg → {data.activePlan.targetWeightKg}kg
              </div>
            </div>
            <button
              type="button"
              onClick={endCurrentPlan}
              className="h-10 shrink-0 rounded-lg bg-zinc-950 px-3 text-sm font-medium text-white"
            >
              结束
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-zinc-500">
            <span className="rounded-lg bg-zinc-50 p-2">饮食 {activeCycleData.foodEntries.length}</span>
            <span className="rounded-lg bg-zinc-50 p-2">体重 {activeCycleData.weightLogs.length}</span>
            <span className="rounded-lg bg-zinc-50 p-2">饮水 {activeCycleData.waterLogs.length}</span>
          </div>
        </div>
      </section>
      <section className="px-5">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm text-zinc-500">今日建议总热量</div>
          <div className="mt-2 text-4xl font-semibold text-zinc-950">{targets.calories}</div>
          <div className="mt-1 text-sm text-zinc-500">kcal / day</div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-zinc-500">
            <span>BMR {targets.bmr}</span>
            <span>NEAT {targets.neat}</span>
            <span>运动 {targets.exerciseCalories}</span>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 px-5">
        <MetricCard label="蛋白质" value={`${targets.protein} g`} hint="每日需要摄入" accent="blue" />
        <MetricCard label="脂肪" value={`${targets.fat} g`} hint="每日需要摄入" accent="amber" />
        <MetricCard label="碳水" value={`${targets.carbs} g`} hint="每日需要摄入" accent="rose" />
        <MetricCard label="饮水" value={`${targets.water} ml`} hint="每日目标" />
      </section>

      <section className="mt-5 px-5">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
          这个页面只展示目标摄入量。实际吃了什么、喝了多少水，可以在“实际摄入”页记录。
        </div>
      </section>
    </MobileShell>
  );
}
