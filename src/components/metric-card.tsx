type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: "teal" | "amber" | "rose" | "blue";
};

const accents = {
  teal: "border-teal-200 bg-teal-50 text-teal-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
};

export function MetricCard({ label, value, hint, accent = "teal" }: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-3 ${accents[accent]}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="mt-1 text-xl font-semibold leading-none">{value}</div>
      {hint ? <div className="mt-1 text-xs opacity-70">{hint}</div> : null}
    </div>
  );
}
