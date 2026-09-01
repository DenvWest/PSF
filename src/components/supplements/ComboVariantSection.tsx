import type { ComparisonPageData, SupplementProduct } from "@/types/supplement";
import { AffiliateLink } from "@/components/supplements/AffiliateLink";
import { ComparisonTable } from "@/components/supplements/ComparisonTable";
import { ProductCard } from "@/components/supplements/ProductCard";
import {
  buildAffiliateCtaLabel,
  getTableRowPrice,
} from "@/lib/comparison-cta-label";

type Props = {
  data: ComparisonPageData;
  products: SupplementProduct[];
};

export function ComboVariantSection({ data, products }: Props) {
  const combo = data.comboVariant;
  if (!combo) return null;

  const primarySlug = combo.choiceRoutes[0]?.slug;

  return (
    <section
      aria-labelledby="combo-variant-heading"
      className="mx-auto mt-16 w-full max-w-7xl px-6 lg:px-8"
    >
      <h2
        id="combo-variant-heading"
        className="text-2xl font-semibold tracking-tight text-slate-900"
      >
        {combo.heading}
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
        {combo.intro}
      </p>

      <div className="mt-8">
        <ComparisonTable
          rows={combo.tableRows}
          criteria={data.comparisonCriteria}
          doseringColumnLabel={data.tableDoseringColumnLabel}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {combo.choiceRoutes.map((route, i) => {
          const isPrimary = route.slug === primarySlug;
          const price = getTableRowPrice(combo.tableRows, route.slug);
          const ctaLabel = buildAffiliateCtaLabel(route.badgeLabel, price);

          return (
            <div
              key={route.slug}
              className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${
                isPrimary
                  ? "border-emerald-300 ring-2 ring-emerald-100"
                  : "border-slate-200"
              }`}
            >
              <span
                className={`mb-2 inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold ${
                  isPrimary
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {route.badgeLabel}
              </span>
              <p className="text-base font-semibold text-slate-900">
                {route.productName}
              </p>
              <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-600">
                {route.teaser}
              </p>
              {isPrimary ? (
                <AffiliateLink
                  affiliateSlug={route.affiliateSlug}
                  sourcePage="combo-variant"
                  position={i + 1}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  {ctaLabel} →
                </AffiliateLink>
              ) : (
                <AffiliateLink
                  affiliateSlug={route.affiliateSlug}
                  sourcePage="combo-variant"
                  position={i + 1}
                  className="mt-4 inline-flex text-sm font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-800"
                >
                  {ctaLabel} →
                </AffiliateLink>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 space-y-8">
        {products.map((product, i) => (
          <ProductCard
            key={product.slug}
            product={product}
            position={i + 1}
            isPrimary={product.slug === primarySlug}
          />
        ))}
      </div>
    </section>
  );
}
