import Link from "next/link";

export type StepCardProps = {
  step: number;
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
};

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
      className="group flex min-h-[11rem] flex-col rounded-2xl border border-stone-200/70 bg-stone-50/40 p-6 shadow-sm transition duration-200 hover:border-stone-300/80 hover:bg-white hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-emerald-600/35 focus-visible:ring-offset-2"
    >
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        Stap {step}
      </span>
      <h3 className="mt-3 text-lg font-semibold tracking-tight text-stone-900">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
        {description}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 transition group-hover:text-emerald-900">
        <span>{ctaLabel ?? "Verder lezen"}</span>
        <span aria-hidden className="transition group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
