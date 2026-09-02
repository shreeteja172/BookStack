type Row = {
  label: string;
  value: number;
};

export function BarList({ rows, unit = "loans" }: { rows: Row[]; unit?: string }) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="truncate font-medium">{row.label}</span>
            <span className="shrink-0 text-muted">
              {row.value} {unit}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-brand/10">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.max((row.value / max) * 100, 3)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ColumnChart({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">Not enough data yet.</p>;
  }

  const max = Math.max(...rows.map((row) => row.value), 1);
  const width = 640;
  const height = 200;
  const gap = 10;
  const barWidth = (width - gap * (rows.length - 1)) / rows.length;

  return (
    <svg viewBox={`0 0 ${width} ${height + 28}`} className="w-full" role="img" aria-label="Loans per month">
      {rows.map((row, index) => {
        const barHeight = Math.max((row.value / max) * height, 2);
        const x = index * (barWidth + gap);
        const y = height - barHeight;

        return (
          <g key={`${row.label}-${index}`}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill="#017b7b" />
            <text
              x={x + barWidth / 2}
              y={height + 18}
              textAnchor="middle"
              fontSize="12"
              fill="#55706f"
            >
              {row.label}
            </text>
            <text
              x={x + barWidth / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize="11"
              fill="#0d3b3c"
            >
              {row.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DonutStat({
  percent,
  label,
  caption,
}: {
  percent: number;
  label: string;
  caption: string;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(Math.max(percent, 0), 100) / 100) * circumference;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 110 110" className="h-28 w-28 shrink-0" role="img" aria-label={label}>
        <circle cx="55" cy="55" r={radius} fill="none" stroke="#dceae7" strokeWidth="12" />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke={percent > 25 ? "#e3703a" : "#017b7b"}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(-90 55 55)"
        />
        <text x="55" y="61" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0d3b3c">
          {percent}%
        </text>
      </svg>
      <div>
        <p className="font-bold">{label}</p>
        <p className="mt-1 text-sm text-muted">{caption}</p>
      </div>
    </div>
  );
}
