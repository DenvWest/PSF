import Link from "next/link";

type ExitButtonProps = {
  href?: string;
  label?: string;
  variant?: "on-dark" | "on-light";
};

export default function ExitButton({
  href = "/",
  label = "Sluiten",
  variant = "on-dark",
}: ExitButtonProps) {
  const surfaceClass =
    variant === "on-light"
      ? "border-stone-200/90 bg-stone-50/95 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
      : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white";

  return (
    <Link
      href={href}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border no-underline transition ${surfaceClass}`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </svg>
    </Link>
  );
}
