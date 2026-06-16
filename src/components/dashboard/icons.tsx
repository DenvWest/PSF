import type { CSSProperties, ReactNode } from "react";

export type IconProps = { s?: number; sw?: number; style?: CSSProperties };

type IconWrapperProps = IconProps & { children: ReactNode };

const I = ({ s = 20, sw = 1.75, children, style }: IconWrapperProps) => (
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
  >
    {children}
  </svg>
);

export const Moon = (p: IconProps) => <I {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></I>;
export const Bolt = (p: IconProps) => <I {...p}><path d="M13 2 4.5 13.5H11l-1 8.5L18.5 10.5H12l1-8.5z" /></I>;
export const Wind = (p: IconProps) => <I {...p}><path d="M3 8h11a3 3 0 1 0-3-3" /><path d="M3 12h15a3 3 0 1 1-3 3" /><path d="M3 16h8a2.5 2.5 0 1 1-2.5 2.5" /></I>;
export const Footprints = (p: IconProps) => <I {...p}><path d="M4 16v-2.5a3 3 0 0 1 6 0c0 2-1 3-1 5.5a2 2 0 1 1-4 0c0-1.5-1-1.5-1-3z" /><path d="M20 18v-2.5a3 3 0 0 0-6 0c0 2 1 3 1 5.5" /><path d="M14 9V6a3 3 0 0 1 6 0c0 2-1 2.5-1 4" /></I>;
export const Utensils = (p: IconProps) => <I {...p}><path d="M5 3v7a2 2 0 0 0 4 0V3" /><path d="M7 10v11" /><path d="M17 3c-1.5 0-3 1.8-3 5 0 2.5 1 3.5 2 3.8V21" /></I>;
export const Heart = (p: IconProps) => <I {...p}><path d="M19 5.5a4.2 4.2 0 0 0-6 0L12 6.5l-1-1a4.2 4.2 0 0 0-6 6L12 19l7-7.5a4.2 4.2 0 0 0 0-6z" /></I>;
export const Settings = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z" /></I>;
export const LogOut = (p: IconProps) => <I {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></I>;
export const Mail = (p: IconProps) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></I>;
export const MailOpen = (p: IconProps) => <I {...p}><path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8.5a2 2 0 0 1 .9-1.7l8-5.3 8 5.3a2 2 0 0 1 .9 1.7z" /><path d="m3 10.5 9 6 9-6" /></I>;
export const ArrowRight = (p: IconProps) => <I {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></I>;
export const Check = (p: IconProps) => <I {...p}><path d="M5 12.5 10 17l9-10" /></I>;
export const Lock = (p: IconProps) => <I {...p}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></I>;
export const Plus = (p: IconProps) => <I {...p}><path d="M12 5v14" /><path d="M5 12h14" /></I>;
export const ChevronDown = (p: IconProps) => <I {...p}><path d="m6 9 6 6 6-6" /></I>;
export const ChevronRight = (p: IconProps) => <I {...p}><path d="m9 6 6 6-6 6" /></I>;
export const User = (p: IconProps) => <I {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></I>;
export const Watch = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="6" /><path d="M12 9v3l2 1.5" /><path d="M9 4.5 9.5 2h5l.5 2.5" /><path d="M9 19.5 9.5 22h5l.5-2.5" /></I>;
export const Shield = (p: IconProps) => <I {...p}><path d="M12 3 5 6v6c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6z" /></I>;
export const Refresh = (p: IconProps) => <I {...p}><path d="M21 12a9 9 0 1 1-2.6-6.3" /><path d="M21 4v5h-5" /></I>;
export const Scale = (p: IconProps) => <I {...p}><path d="M12 3v18" /><path d="M7 7h10" /><path d="m5 7-2.5 6a3 3 0 0 0 6 0L6 7z" /><path d="m18 7-2.5 6a3 3 0 0 0 6 0L19 7z" /><path d="M8 21h8" /></I>;
export const Ruler = (p: IconProps) => <I {...p}><rect x="2.5" y="8.5" width="19" height="7" rx="1.5" transform="rotate(-45 12 12)" /><path d="M9.5 7 11 8.5M7 9.5 8.5 11M12 4.5 13.5 6M14.5 7 16 8.5" /></I>;
export const Briefcase = (p: IconProps) => <I {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /></I>;
export const Spark = (p: IconProps) => <I {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></I>;
export const TrendUp = (p: IconProps) => <I {...p}><path d="M3 17 9 11l4 4 8-8" /><path d="M16 4h5v5" /></I>;
export const Clock = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></I>;
export const Target = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /></I>;
export const Leaf = (p: IconProps) => <I {...p}><path d="M4 20s2-9 8-13c3-2 8-2 8-2s0 5-2 8c-4 6-13 8-13 8z" /><path d="M5 19c4-3 7-6 9-10" /></I>;
export const Pill = (p: IconProps) => <I {...p}><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(45 12 12)" /><path d="m8.5 8.5 7 7" /></I>;
export const Activity = (p: IconProps) => <I {...p}><path d="M3 12h4l2.5-7 5 14L17 12h4" /></I>;
export const ArrowDown = (p: IconProps) => <I {...p}><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></I>;
export const Dot = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /></I>;
