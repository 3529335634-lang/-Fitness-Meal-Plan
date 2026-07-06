"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateTargets, loadByDateAndMode, sumExerciseCalories, todayKey } from "@/lib/view-model";
import { loadAppData, saveAppData } from "@/lib/storage";
import type { AppData } from "@/lib/types";

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const date = todayKey();

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  return useMemo(() => {
    return {
      data,
      setData,
      date,
      targets: calculateTargets(data.goal, sumExerciseCalories(data.exerciseLogs, date)),
      todayPlan: loadByDateAndMode(data.foodEntries, date, "plan"),
      todayActual: loadByDateAndMode(data.foodEntries, date, "actual"),
    };
  }, [data, date]);
}
