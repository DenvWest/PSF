import type { KennisbankTheme } from "@/data/kennisbank";

const ICON_CLASS = "h-[1.375rem] w-[1.375rem]";

interface KennisbankThemaIconProps {
  theme: KennisbankTheme;
  className?: string;
}

export default function KennisbankThemaIcon({
  theme,
  className = ICON_CLASS,
}: KennisbankThemaIconProps) {
  switch (theme) {
    case "lichaam-veroudering":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
          <path strokeLinecap="round" d="M12 3v2m0 14v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M3 12h2m14 0h2M4.22 19.78l1.42-1.42m12.72-12.72 1.42-1.42" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      );
    case "leefstijl-herstel":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4-3 7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 3 8 7 11z" />
        </svg>
      );
    case "supplementwetenschap":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104A24.301 24.301 0 0 1 12 3c.75 0 1.5.05 2.25.152M14.25 3.104v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104A24.301 24.301 0 0 0 12 3m0 11.5v3.75m-3.75 0h7.5" />
        </svg>
      );
    case "longevity":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3.5 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </svg>
      );
  }
}
