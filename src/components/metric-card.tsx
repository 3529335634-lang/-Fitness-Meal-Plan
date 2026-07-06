type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: "teal" | "amber" | "rose" | "blue";
};

const accents = {
  teal: "border-teal-100 bg-teal-50 text-teal-800",
  amber: "border-amber-100 bg-amber-50 text-amber-800",
  rose: "border-rose-100 bg-rose-50 text-rose-800",
  blue: "border-sky-100 bg-sky-50 text-sky-800",
};

export function MetricCard({ label, value, hint, accent = "teal" }: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-3 shadow-sm ${accents[accent]}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="mt-1 text-xl font-semibold leading-none">{value}</div>
      {hint ? <div className="mt-1 text-xs opacity-70">{hint}</div> : null}
    </div>
  );
}
