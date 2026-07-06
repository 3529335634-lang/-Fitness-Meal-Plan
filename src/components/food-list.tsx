import { mealLabels, rawOrCookedLabels, round } from "@/lib/view-model";
import type { FoodEntry } from "@/lib/types";

type FoodListProps = {
  entries: FoodEntry[];
  onRemove?: (id: string) => void;
};

export function FoodList({ entries, onRemove }: FoodListProps) {
  if (!entries.length) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-500">
        今天还没有记录。
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <article key={entry.id} className="rounded-lg border border-zinc-200 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-500">{mealLabels[entry.meal]}</div>
              <div className="font-medium text-zinc-950">{entry.name}</div>
              <div className="mt-1 text-xs text-zinc-500">
                {entry.amount}
                {entry.unit} · {rawOrCookedLabels[entry.raw_or_cooked] ?? ""} · {round(entry.nutrition.calories)} kcal
              </div>
            </div>
            {onRemove ? (
              <button
                type="button"
                onClick={() => onRemove(entry.id)}
                className="h-8 w-8 rounded-lg bg-zinc-100 text-zinc-500"
                aria-label="删除"
              >
                ×
              </button>
            ) : null}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-zinc-600">
            <span>蛋白 {round(entry.nutrition.protein)}g</span>
            <span>脂肪 {round(entry.nutrition.fat)}g</span>
            <span>碳水 {round(entry.nutrition.carbs)}g</span>
          </div>
        </article>
      ))}
    </div>
  );
}
