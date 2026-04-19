import Image from "next/image";
import type { SupplementProduct } from "@/types/supplement";
import { AffiliateLink } from "@/components/supplements/AffiliateLink";
import { getAffiliateShopLabel } from "@/lib/affiliate-shop-labels";

type Props = { product: SupplementProduct; position: number };

export function ProductCard({ product, position }: Props) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left column */}
        <div className="flex shrink-0 flex-col items-center gap-4 md:w-1/3">
          <div
            className="relative aspect-square w-36 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
            style={{ aspectRatio: "1/1" }}
          >
            {product.imageSrc ? (
              <Image
                src={product.imageSrc}
                alt={product.imageAlt ?? product.name}
                fill
                sizes="144px"
                className="object-contain p-2"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-300 text-4xl">
                💊
              </div>
            )}
          </div>

          {/* Score circle */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-500 bg-white text-xl font-bold text-emerald-700">
              {product.score}
            </div>
            <span className="text-xs text-slate-500">Totaalscore / 10</span>
          </div>
        </div>

        {/* Right column */}
        <div className="flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <h2 className="text-xl font-semibold text-slate-900">
              {product.name}
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {product.variantTag}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {product.summary}
          </p>

          {/* Specs */}
          <ul className="mt-4 flex flex-wrap gap-3">
            {product.specs.map((s) => (
              <li key={s.label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm">
                <span className="font-medium text-slate-700">{s.label}: </span>
                <span className="text-slate-600">{s.value}</span>
              </li>
            ))}
          </ul>

          {/* Pros / Cons */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Voordelen
              </p>
              <ul className="space-y-1">
                {product.pros.map((pro) => (
                  <li key={pro} className="flex gap-2 text-sm text-slate-700">
                    <span className="mt-0.5 shrink-0 text-emerald-500">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Aandachtspunten
              </p>
              <ul className="space-y-1">
                {product.cons.map((con) => (
                  <li key={con} className="flex gap-2 text-sm text-slate-600">
                    <span className="mt-0.5 shrink-0 text-slate-400">−</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Score breakdown bars */}
          <div className="mt-5 space-y-2">
            {product.breakdown.map((item) => (
              <div key={item.criterium} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-xs text-slate-500">
                  {item.criterium}
                </span>
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${item.score * 10}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-medium text-slate-600">
                  {item.score}
                </span>
              </div>
            ))}
          </div>

          <AffiliateLink
            affiliateSlug={product.affiliateSlug}
            sourcePage="product-card"
            position={position}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
          >
            Bekijk bij {getAffiliateShopLabel(product.affiliateSlug)} →
          </AffiliateLink>
        </div>
      </div>
    </article>
  );
}
