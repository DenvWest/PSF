import Link from "next/link";
import type { OplossingsNiveau } from "@/types/symptomen";
import { renderInlineMarkdownLinks } from "@/components/blog/inlineMarkdownLinks";

interface OplossingNiveauBlokProps {
  niveau: OplossingsNiveau;
}

export default function OplossingNiveauBlok({ niveau }: OplossingNiveauBlokProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
        {niveau.titel}
      </h2>

      <p className="mt-2 max-w-[720px] text-sm font-semibold text-stone-700">
        {renderInlineMarkdownLinks(niveau.kernboodschap)}
      </p>

      {/* Oplossingen — geen bullets/nummering */}
      <div className="mt-6 space-y-5">
        {niveau.oplossingen.map((oplossing, i) => (
          <div key={i} className="max-w-[720px]">
            <p className="text-sm font-semibold text-stone-900">{oplossing.titel}</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              {renderInlineMarkdownLinks(oplossing.uitleg)}
            </p>
          </div>
        ))}
      </div>

      {/* Blog-links: Verdieping */}
      {niveau.blogLinks.length > 0 && (
        <div className="mt-6 text-sm text-stone-600">
          <span className="font-semibold text-stone-700">Verdieping: </span>
          {niveau.blogLinks.map((link, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1.5 text-stone-300">·</span>}
              <Link href={link.href} className="ps-text-link">
                {link.titel}
              </Link>
            </span>
          ))}
        </div>
      )}

      {/* Supplement — secundair blok, nooit als primaire CTA */}
      {niveau.supplement && (
        <div className="ps-supplement-block mt-6 max-w-[720px]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ps-green)]">
            Supplement ondersteuning
          </p>
          <p className="mt-1.5 text-sm text-stone-700">
            <span className="font-semibold">{niveau.supplement.naam}</span>
            {" — "}
            {niveau.supplement.uitleg}
          </p>
          <Link
            href={niveau.supplement.href}
            className="mt-3 inline-flex min-h-[44px] items-center text-xs font-medium text-[var(--ps-green)] underline decoration-[var(--ps-green-light)] underline-offset-4 transition hover:text-[var(--ps-green-hover)]"
          >
            Meer over {niveau.supplement.naam} →
          </Link>
        </div>
      )}
    </section>
  );
}
