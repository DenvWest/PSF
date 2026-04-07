import Link from "next/link";

interface CTASectionProps {
  titel: string;
  tekst: string;
  knopLabel: string;
  knopDisabled: boolean;
  secundaireLink: {
    label: string;
    href: string;
  };
}

export default function CTASection({
  titel,
  tekst,
  knopLabel,
  knopDisabled,
  secundaireLink,
}: CTASectionProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white px-8 py-12 text-center">
      <h2 className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
        {titel}
      </h2>
      <p className="mx-auto mt-4 max-w-[560px] text-sm leading-relaxed text-stone-600">
        {tekst}
      </p>

      <div className="mt-8 flex flex-col items-center gap-5">
        {knopDisabled ? (
          <span
            aria-disabled="true"
            className="inline-flex min-h-[44px] cursor-not-allowed items-center gap-2 rounded px-6 py-2.5 text-sm font-medium text-stone-400 ring-1 ring-stone-200"
          >
            {knopLabel}
            <span className="text-xs font-normal">(binnenkort beschikbaar)</span>
          </span>
        ) : (
          <Link
            href="#"
            className="ps-btn-primary inline-flex min-h-[44px] items-center"
          >
            {knopLabel}
          </Link>
        )}

        <Link
          href={secundaireLink.href}
          className="ps-text-link inline-flex min-h-[44px] items-center text-sm"
        >
          {secundaireLink.label}
        </Link>
      </div>
    </section>
  );
}
