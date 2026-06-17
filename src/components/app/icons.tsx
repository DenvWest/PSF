import type { CSSProperties, ReactNode } from "react";

export type IconProps = {
  s?: number;
  sw?: number;
  style?: CSSProperties;
};

type BaseIconProps = IconProps & {
  children: ReactNode;
};

function I({ s = 20, sw = 1.75, style, children }: BaseIconProps) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function Mail(props: IconProps) {
  return (
    <I {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </I>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <I {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </I>
  );
}

export function Lock(props: IconProps) {
  return (
    <I {...props}>
      <rect x="4" y="10" width="16" height="10" rx="3" />
      <path d="M8 10V7.8A4 4 0 0 1 12 4a4 4 0 0 1 4 3.8V10" />
    </I>
  );
}

export function Shield(props: IconProps) {
  return (
    <I {...props}>
      <path d="M12 3 5.5 6v6c0 4.3 2.8 7.6 6.5 9 3.7-1.4 6.5-4.7 6.5-9V6L12 3Z" />
      <path d="m9.2 12 2 2 3.8-4.2" />
    </I>
  );
}

export function MailOpen(props: IconProps) {
  return (
    <I {...props}>
      <path d="M3 9.5 12 4l9 5.5" />
      <path d="M4 10v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="m4 11 8 5 8-5" />
    </I>
  );
}

export function Refresh(props: IconProps) {
  return (
    <I {...props}>
      <path d="M20 11a8 8 0 1 0 2 5.3" />
      <path d="M20 4v6h-6" />
    </I>
  );
}

export function Clock(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </I>
  );
}

export function Check(props: IconProps) {
  return (
    <I {...props}>
      <path d="M5 12.5 10 17l9-10" />
    </I>
  );
}

export function Moon(props: IconProps) {
  return (
    <I {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </I>
  );
}

export function Bolt(props: IconProps) {
  return (
    <I {...props}>
      <path d="M13 2 4.5 13.5H11l-1 8.5L18.5 10.5H12l1-8.5z" />
    </I>
  );
}

export function Wind(props: IconProps) {
  return (
    <I {...props}>
      <path d="M3 8h11a3 3 0 1 0-3-3" />
      <path d="M3 12h15a3 3 0 1 1-3 3" />
      <path d="M3 16h8a2.5 2.5 0 1 1-2.5 2.5" />
    </I>
  );
}

export function Footprints(props: IconProps) {
  return (
    <I {...props}>
      <path d="M4 16v-2.5a3 3 0 0 1 6 0c0 2-1 3-1 5.5a2 2 0 1 1-4 0c0-1.5-1-1.5-1-3z" />
      <path d="M20 18v-2.5a3 3 0 0 0-6 0c0 2 1 3 1 5.5" />
      <path d="M14 9V6a3 3 0 0 1 6 0c0 2-1 2.5-1 4" />
    </I>
  );
}

export function Utensils(props: IconProps) {
  return (
    <I {...props}>
      <path d="M5 3v7a2 2 0 0 0 4 0V3" />
      <path d="M7 10v11" />
      <path d="M17 3c-1.5 0-3 1.8-3 5 0 2.5 1 3.5 2 3.8V21" />
    </I>
  );
}

export function Heart(props: IconProps) {
  return (
    <I {...props}>
      <path d="M19 5.5a4.2 4.2 0 0 0-6 0L12 6.5l-1-1a4.2 4.2 0 0 0-6 6L12 19l7-7.5a4.2 4.2 0 0 0 0-6z" />
    </I>
  );
}

export function Settings(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z" />
    </I>
  );
}

export function LogOut(props: IconProps) {
  return (
    <I {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </I>
  );
}

export function Plus(props: IconProps) {
  return (
    <I {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </I>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <I {...props}>
      <path d="m6 9 6 6 6-6" />
    </I>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <I {...props}>
      <path d="m9 6 6 6-6 6" />
    </I>
  );
}

export function User(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </I>
  );
}

export function Watch(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 9v3l2 1.5" />
      <path d="M9 4.5 9.5 2h5l.5 2.5" />
      <path d="M9 19.5 9.5 22h5l.5-2.5" />
    </I>
  );
}

export function Scale(props: IconProps) {
  return (
    <I {...props}>
      <path d="M12 3v18" />
      <path d="M7 7h10" />
      <path d="m5 7-2.5 6a3 3 0 0 0 6 0L6 7z" />
      <path d="m18 7-2.5 6a3 3 0 0 0 6 0L19 7z" />
      <path d="M8 21h8" />
    </I>
  );
}

export function Ruler(props: IconProps) {
  return (
    <I {...props}>
      <rect x="2.5" y="8.5" width="19" height="7" rx="1.5" transform="rotate(-45 12 12)" />
      <path d="M9.5 7 11 8.5M7 9.5 8.5 11M12 4.5 13.5 6M14.5 7 16 8.5" />
    </I>
  );
}

export function Briefcase(props: IconProps) {
  return (
    <I {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </I>
  );
}

export function Spark(props: IconProps) {
  return (
    <I {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </I>
  );
}

export function TrendUp(props: IconProps) {
  return (
    <I {...props}>
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M16 4h5v5" />
    </I>
  );
}

export function Target(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </I>
  );
}

export function Leaf(props: IconProps) {
  return (
    <I {...props}>
      <path d="M4 20s2-9 8-13c3-2 8-2 8-2s0 5-2 8c-4 6-13 8-13 8z" />
      <path d="M5 19c4-3 7-6 9-10" />
    </I>
  );
}

export function Pill(props: IconProps) {
  return (
    <I {...props}>
      <rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(45 12 12)" />
      <path d="m8.5 8.5 7 7" />
    </I>
  );
}

export function Activity(props: IconProps) {
  return (
    <I {...props}>
      <path d="M3 12h4l2.5-7 5 14L17 12h4" />
    </I>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <I {...props}>
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </I>
  );
}

export function Dot(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    </I>
  );
}

export function Home(props: IconProps) {
  return (
    <I {...props}>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </I>
  );
}

export function RouteMap(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="6" cy="5.5" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="M8.5 5.5H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5" />
    </I>
  );
}

export function BarChart(props: IconProps) {
  return (
    <I {...props}>
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="12" y1="20" x2="12" y2="9" />
      <line x1="18" y1="20" x2="18" y2="4" />
    </I>
  );
}

export function Calendar(props: IconProps) {
  return (
    <I {...props}>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" />
      <line x1="8" y1="2.5" x2="8" y2="6" />
      <line x1="16" y1="2.5" x2="16" y2="6" />
    </I>
  );
}

export function BookOpen(props: IconProps) {
  return (
    <I {...props}>
      <path d="M12 6.5C10.5 5 8.5 4.5 4 4.5V18c4.5 0 6.5.5 8 2 1.5-1.5 3.5-2 8-2V4.5c-4.5 0-6.5.5-8 2z" />
      <line x1="12" y1="6.5" x2="12" y2="20" />
    </I>
  );
}
