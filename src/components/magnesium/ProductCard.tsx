import AffiliateLink from "@/components/content/AffiliateLink";
import { DisclosureSmall } from "@/components/ui/Disclosure";
import type { MagnesiumProduct } from "@/types/product";

export type ProductCardProps = {
  product: MagnesiumProduct;
  /** Korte titel boven de productnaam, bijv. "Beste overall" */
  pickTitle: string;
  pageType: string;
  position: string;
  /** Optionele CTA-tekst */
  ctaLabel?: string;
  /** Eerste kaart krijgt visuele nadruk */
  featured?: boolean;
};

export default function ProductCard({
  product,
  pickTitle,
  pageType,
  position,
  ctaLabel = "Bekijk aanbieder →",
  featured = false,
}: ProductCardProps) {
  const dosageLine = `${product.elementMg} mg elementair Mg · ${product.capsulesPerDay}× per dag`;

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
        featured ? "border-stone-300 ring-1 ring-stone-200/80" : "border-stone-200"
      }`}
    >
      {featured ? (
        <div className="bg-stone-900 px-5 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white">
          Topkeuze
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{pickTitle}</p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-stone-900">{product.name}</h3>
        <p className="mt-1 text-sm text-stone-500">{product.form}</p>

        <p className="mt-4 rounded-xl bg-stone-50 px-3 py-2 text-sm font-medium text-stone-800">{dosageLine}</p>

        <p className="mt-4 text-sm leading-relaxed text-stone-600">{product.description}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Voordelen</p>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-700">
              {product.pros.map((pro) => (
                <li key={pro} className="flex gap-2">
                  <span aria-hidden className="shrink-0">
                    ✅
                  </span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">Aandachtspunten</p>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-700">
              {product.cons.map((con) => (
                <li key={con} className="flex gap-2">
                  <span aria-hidden className="shrink-0">
                    ❌
                  </span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-1 flex-col justify-end border-t border-stone-100 pt-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs text-stone-500">Score</span>
            <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-sm font-semibold text-stone-900">
              {product.score}/10
            </span>
          </div>
          <AffiliateLink
            affiliateSlug={product.affiliateSlug}
            pageType={pageType}
            position={position}
            className="inline-flex w-full items-center justify-center rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >
            {ctaLabel}
          </AffiliateLink>
          <DisclosureSmall />
        </div>
      </div>
    </article>
  );
}
