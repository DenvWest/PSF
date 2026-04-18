import type { ComparisonPageData } from "@/types/supplement";
import { AffiliateLink } from "@/components/supplements/AffiliateLink";

type Props = { data: ComparisonPageData };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ChoiceHero({ data }: Props) {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-10">
      <div className="mb-2 inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-500">
        Laatst bijgewerkt: {formatDate(data.lastUpdated)}
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
        {data.h1}
      </h1>

      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
        {data.intro}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.choiceRoutes.map((route, i) => (
          <div
            key={route.slug}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span className="mb-2 inline-flex self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {route.badgeLabel}
            </span>
            <p className="text-base font-semibold text-slate-900">
              {route.productName}
            </p>
            <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-600">
              {route.teaser}
            </p>
            <AffiliateLink
              affiliateSlug={route.affiliateSlug}
              sourcePage={`beste-${data.category}-supplement`}
              position={i + 1}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Bekijk aanbieder →
            </AffiliateLink>
          </div>
        ))}
      </div>
    </section>
  );
}
