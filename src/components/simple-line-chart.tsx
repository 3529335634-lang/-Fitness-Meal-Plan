type Point = {
  label: string;
  value: number;
};

type SimpleLineChartProps = {
  data: Point[];
  color?: string;
  unit?: string;
};

export function SimpleLineChart({ data, color = "#0f766e", unit = "" }: SimpleLineChartProps) {
  const width = 320;
  const height = 130;
  const padding = 18;
  const max = Math.max(...data.map((point) => point.value), 1);
  const min = Math.min(...data.map((point) => point.value), 0);
  const range = Math.max(max - min, 1);
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const points = data.map((point, index) => {
    const x = padding + index * step;
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
    return { ...point, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full">
        <path d={path} fill="none" stroke={color} strokeLinecap="round" strokeWidth="3" />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4" fill={color} />
            <text x={point.x} y={height - 2} textAnchor="middle" className="fill-zinc-400 text-[10px]">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>
          低 {Math.round(min)}
          {unit}
        </span>
        <span>
          高 {Math.round(max)}
          {unit}
        </span>
      </div>
    </div>
  );
}
