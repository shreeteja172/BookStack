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

export function ActivityHeatmap({
  days,
  weeks = 26,
}: {
  days: { date: string; value: number }[];
  weeks?: number;
}) {
  const counts = new Map(days.map((day) => [day.date, day.value]));
  const max = Math.max(...days.map((day) => day.value), 1);
  const cell = 14;
  const gap = 3;
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (weeks * 7 - 1) - today.getDay());
  const total = days.reduce((sum, day) => sum + day.value, 0);
  const busiest = [...days].sort((a, b) => b.value - a.value)[0];
  const monthFormat = new Intl.DateTimeFormat("en-IN", { month: "short" });
  const labels: { x: number; text: string }[] = [];

  const cells = Array.from({ length: (weeks + 1) * 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    if (date > today) {
      return null;
    }

    const week = Math.floor(index / 7);
    const key = date.toLocaleDateString("en-CA");
    const value = counts.get(key) ?? 0;

    if (date.getDate() === 1) {
      labels.push({ x: 28 + week * (cell + gap), text: monthFormat.format(date) });
    }

    return { key, value, x: 28 + week * (cell + gap), y: 18 + date.getDay() * (cell + gap) };
  });

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${28 + (weeks + 1) * (cell + gap)} ${18 + 7 * (cell + gap)}`}
          className="h-auto w-full min-w-[34rem]"
          role="img"
          aria-label="Loans issued per day"
        >
          {labels.map((label) => (
            <text key={label.x} x={label.x} y="10" fontSize="10" fill="var(--color-muted)">
              {label.text}
            </text>
          ))}
          {["Mon", "Wed", "Fri"].map((day, index) => (
            <text key={day} x="0" y={18 + (index * 2 + 1) * (cell + gap) + 11} fontSize="9" fill="var(--color-muted)">
              {day}
            </text>
          ))}
          {cells.map((item) =>
            item ? (
              <rect
                key={item.key}
                x={item.x}
                y={item.y}
                width={cell}
                height={cell}
                rx="3"
                fill={item.value === 0 ? "var(--color-line)" : "var(--color-brand)"}
                fillOpacity={item.value === 0 ? 1 : 0.25 + 0.75 * (item.value / max)}
              >
                <title>{`${item.key}: ${item.value} loan${item.value === 1 ? "" : "s"}`}</title>
              </rect>
            ) : null,
          )}
        </svg>
      </div>
      <p className="mt-3 text-sm text-muted">
        {total} loans in the last {weeks} weeks
        {busiest ? ` · busiest day ${busiest.date} with ${busiest.value}` : ""}
      </p>
    </div>
  );
}
