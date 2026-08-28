type IconProps = {
  className?: string;
};

function base(className?: string) {
  return {
    className: className ?? "h-6 w-6",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

export function LogoMark({ className }: IconProps) {
  return (
    <svg className={className ?? "h-6 w-6"} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 4.5h6.2c1 0 1.8.8 1.8 1.8V20a1.6 1.6 0 0 0-1.6-1.6H5Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M19 4.5h-6.2c-1 0-1.8.8-1.8 1.8V20a1.6 1.6 0 0 1 1.6-1.6H19Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BooksIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.75 1.75 0 0 0-1.75-1.75H4Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.75 1.75 0 0 1 1.75-1.75H20Z" />
    </svg>
  );
}

export function CirculationIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 9h11.5a4.5 4.5 0 0 1 0 9H9" />
      <path d="M7.5 5.5 4 9l3.5 3.5" />
    </svg>
  );
}

export function InsightsIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  );
}

export function BookmarkIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4-6.5 4V5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.5 12a7.5 7.5 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-2-1.2L14.7 3h-4l-.4 2.7c-.7.3-1.4.7-2 1.2l-2.3-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1c.6.5 1.3.9 2 1.2l.4 2.7h4l.4-2.7c.7-.3 1.4-.7 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </svg>
  );
}
