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
      style={style}
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
