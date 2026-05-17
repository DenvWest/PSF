import Link from "next/link";

interface BlogIntakeCTAProps {
  className?: string;
}

export default function BlogIntakeCTA({ className = "" }: BlogIntakeCTAProps) {
  return (
    <div
      className={`rounded-2xl border border-stone-200/80 bg-white px-6 py-10 text-center shadow-sm shadow-stone-900/[0.03] md:px-10 md:py-12 ${className}`}
    >
      <p className="ps-eyebrow">Persoonlijk inzicht</p>
      <p className="mt-3 font-display text-xl font-semibold text-stone-900 md:text-2xl">
        Ontdek waar jouw lichaam waarschijnlijk om herstel vraagt
      </p>
      <p className="mt-2 text-sm text-stone-500">
        12 vragen, 3 minuten — direct een persoonlijk herstelplan.
      </p>
      <Link
        href="/intake"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#3C7A56] px-6 py-3 text-base font-medium text-white transition hover:bg-[#2E5F43]"
      >
        Start de gratis intake →
      </Link>
    </div>
  );
}
