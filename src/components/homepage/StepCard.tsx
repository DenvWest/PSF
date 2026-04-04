import Link from "next/link";

export type StepCardProps = {
  step: number;
  title: string;
  description: string;
  href: string;
  /** Stap 1: verplicht; andere stappen optioneel */
  ctaLabel?: string;
};

/**
 * Klikbare stap in het step-care pad. Modulair voor uitbreiding (andere doelgroepen).
 */
export default function StepCard({
  step,
  title,
  description,
  href,
  ctaLabel,
}: StepCardProps) {
  return (
    <Link
      href={href}
      className="step-card group flex min-h-[12rem] flex-col rounded-xl border border-stone-200/90 bg-white p-[2em] shadow-[0_1px_3px_rgba(28,25,23,0.04)] ring-1 ring-stone-900/[0.03] transition-all duration-200 hover:border-stone-300 hover:bg-stone-50/50 hover:shadow-[0_10px_32px_-12px_rgba(28,25,23,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/45 focus-visible:ring-offset-2"
    >
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-stone-400">
        Stap {step}
      </span>
      <h3 className="mt-3 text-[clamp(1.0625rem,2.5vw,1.25rem)] font-semibold leading-snug tracking-[-0.015em] text-stone-900">
        {title}
      </h3>
      <p className="mt-3 flex-1 text-[0.9375rem] leading-[1.7] text-stone-600">{description}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-stone-600 transition group-hover:text-stone-900">
        <span className="border-b border-stone-300/80 pb-px transition group-hover:border-stone-600">
          {ctaLabel ?? "Verder lezen"}
        </span>
        <span className="text-stone-400 transition group-hover:translate-x-0.5" aria-hidden>
          →
        </span>
      </span>
    </Link>
  );
}
