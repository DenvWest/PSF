import Link from "next/link";

type ExitButtonProps = { href?: string; label?: string };

export default function ExitButton({ href = "/", label = "Sluiten" }: ExitButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/60 no-underline transition hover:bg-white/10 hover:text-white"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </svg>
    </Link>
  );
}
