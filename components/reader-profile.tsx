import type { Badge } from "@/lib/reader-profile";

type Genre = { label: string; value: number };

export function GenreRadar({ genres }: { genres: Genre[] }) {
  const axes = genres.slice(0, 6);

  if (axes.length < 3) {
    return (
      <p className="text-sm text-muted">
        Borrow from at least three categories to see your reading shape.
      </p>
    );
  }

  const size = 260;
  const center = size / 2;
  const radius = 90;
  const max = Math.max(...axes.map((axis) => axis.value), 1);
  const point = (index: number, scale: number) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    return [center + Math.cos(angle) * radius * scale, center + Math.sin(angle) * radius * scale];
  };
  const shape = axes.map((axis, index) => point(index, Math.max(axis.value / max, 0.08)).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-xs" role="img" aria-label="Reading profile by category">
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <polygon
          key={ring}
          points={axes.map((_, index) => point(index, ring).join(",")).join(" ")}
          fill="none"
          stroke="var(--color-line)"
        />
      ))}
      {axes.map((_, index) => {
        const [x, y] = point(index, 1);
        return <line key={index} x1={center} y1={center} x2={x} y2={y} stroke="var(--color-line)" />;
      })}
      <polygon points={shape} fill="var(--color-brand)" fillOpacity="0.25" stroke="var(--color-brand)" strokeWidth="2" />
      {axes.map((axis, index) => {
        const [x, y] = point(index, Math.max(axis.value / max, 0.08));
        const [lx, ly] = point(index, 1.22);
        return (
          <g key={axis.label}>
            <circle cx={x} cy={y} r="3.5" fill="var(--color-brand)" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="600" fill="var(--color-muted)">
              {axis.label.length > 14 ? `${axis.label.slice(0, 13)}.` : axis.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function BadgeIcon({ name, earned }: { name: string; earned: boolean }) {
  const stroke = earned ? "var(--color-brand)" : "var(--color-muted)";
  const paths: Record<string, React.ReactNode> = {
    first: <path d="M12 4v16M8 8l4-4 4 4" />,
    worm: <path d="M5 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H5ZM19 5h-4a2 2 0 0 0-2 2" />,
    explorer: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5Z" />,
    punctual: <path d="M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />,
    critic: <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4 7.2 18.9l.9-5.4L4.2 9.7l5.4-.8Z" />,
    streak: <path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8Z" />,
  };

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke={stroke} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[name]}
    </svg>
  );
}

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {badges.map((badge) => (
        <li
          key={badge.key}
          className={`rounded-xl border p-3 ${
            badge.earned ? "border-brand-light bg-brand/5" : "border-line opacity-70"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                badge.earned ? "bg-brand/15" : "bg-line"
              }`}
            >
              <BadgeIcon name={badge.key} earned={badge.earned} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{badge.name}</p>
              <p className="truncate text-xs text-muted">{badge.detail}</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full rounded-full ${badge.earned ? "bg-brand" : "bg-brand-light"}`}
              style={{ width: `${Math.round(badge.progress * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
