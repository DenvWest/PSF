import Link from "next/link";
import type { ReactNode } from "react";

type LandingButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: () => void;
};

export default function LandingButton({
  href,
  children,
  variant = "primary",
  className = "",
  onClick,
}: LandingButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium tracking-wide transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ps-accent)]";

  const variants = {
    primary:
      "bg-[var(--ps-ink)] text-[var(--ps-cream)] hover:bg-[var(--ps-charcoal)]",
    secondary:
      "border border-[var(--ps-border)] bg-white/60 text-[var(--ps-ink)] backdrop-blur-sm hover:border-[var(--ps-muted)] hover:bg-white",
    ghost:
      "text-[var(--ps-ink)] underline-offset-4 hover:underline decoration-[var(--ps-muted)]",
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
