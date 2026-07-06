"use client";

type ProgressRingProps = {
  value: number;
  label: string;
};

export function ProgressRing({ value, label }: ProgressRingProps) {
  const safeValue = Math.max(0, Math.min(value, 160));
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (Math.min(safeValue, 100) / 100) * circumference;

  return (
    <div className="relative grid h-32 w-32 place-items-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="progressGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#progressGradient)"
          strokeLinecap="round"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-semibold text-zinc-950">{value}%</div>
        <div className="text-xs text-zinc-500">{label}</div>
      </div>
    </div>
  );
}
