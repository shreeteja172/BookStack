const PALETTES = [
  ["#017b7b", "#26b1b1"],
  ["#e3703a", "#ffb066"],
  ["#0d3b3c", "#017b7b"],
  ["#26b1b1", "#ffe0ad"],
  ["#8a4b2a", "#e3703a"],
  ["#014f57", "#26b1b1"],
];

function hash(value: string) {
  let total = 0;

  for (let index = 0; index < value.length; index += 1) {
    total = (total * 31 + value.charCodeAt(index)) % 100000;
  }

  return total;
}

function initials(title: string) {
  return title
    .split(/\s+/)
    .filter((word) => /[a-zA-Z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

type BookCoverProps = {
  title: string;
  author: string;
  seed: string;
  className?: string;
};

export function BookCover({ title, author, seed, className }: BookCoverProps) {
  const index = hash(seed) % PALETTES.length;
  const [from, to] = PALETTES[index];
  const gradientId = `cover-${hash(seed)}-${index}`;

  return (
    <svg
      viewBox="0 0 120 170"
      className={className ?? "h-full w-full"}
      role="img"
      aria-label={`${title} by ${author}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="120" height="170" rx="6" fill={`url(#${gradientId})`} />
      <rect x="10" y="0" width="3" height="170" fill="#000" opacity="0.18" />
      <circle cx="96" cy="34" r="26" fill="#fff" opacity="0.12" />
      <circle cx="30" cy="140" r="34" fill="#000" opacity="0.08" />
      <text
        x="62"
        y="96"
        textAnchor="middle"
        fontSize="34"
        fontWeight="700"
        fill="#fff"
        fillOpacity="0.9"
        fontFamily="system-ui, sans-serif"
      >
        {initials(title)}
      </text>
    </svg>
  );
}
