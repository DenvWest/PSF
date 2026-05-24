import type { ReactNode } from "react";

type IntakeResultsSectionProps = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

export default function IntakeResultsSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
  className = "",
}: IntakeResultsSectionProps) {
  return (
    <details
      open={defaultOpen || undefined}
      className={`group mb-4 overflow-hidden rounded-2xl border border-intake-card-border bg-intake-bg-elevated ${className}`}
    >
      <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="text-left">
            <h2 className="text-[15px] font-bold text-intake-ink">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-intake-ink-subtle">{subtitle}</p>
            ) : null}
          </div>
          <span
            className="mt-0.5 shrink-0 text-intake-ink-subtle transition-transform group-open:rotate-180"
            aria-hidden
          >
            ▾
          </span>
        </div>
      </summary>
      <div className="border-t border-intake-divider px-5 pb-5 pt-4">{children}</div>
    </details>
  );
}
