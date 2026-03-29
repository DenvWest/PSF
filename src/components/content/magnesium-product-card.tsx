import Image from "next/image";
import AffiliateLink from "@/components/content/AffiliateLink";
import { DisclosureSmall } from "@/components/ui/Disclosure";
import { formatPrice } from "@/lib/format-price";
import type { MagnesiumProduct } from "@/types/product";

type MagnesiumProductCardProps = {
  product: MagnesiumProduct;
  pageType?: string;
  position?: string;
};

export default function MagnesiumProductCard({
  product,
  pageType,
  position,
}: MagnesiumProductCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
        {product.imageSrc ? (
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[280px] shrink-0 overflow-hidden rounded-2xl bg-stone-50 sm:mx-0 sm:aspect-square sm:max-w-[200px] md:max-w-[220px]">
            <Image
              src={product.imageSrc}
              alt={product.imageAlt ?? product.name}
              fill
              sizes="(max-width: 640px) 100vw, 220px"
              className="object-contain p-3"
              priority={false}
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              {product.category ? (
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  {product.category}
                </p>
              ) : null}
              <h3 className="text-xl font-semibold">{product.name}</h3>
              {product.badge && (
                <p className="mt-1 text-sm font-medium text-stone-800">{product.badge}</p>
              )}
            </div>
            <div className="shrink-0 rounded-xl bg-stone-100 px-3 py-2 text-sm font-semibold">
              {product.score}/10
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-stone-600">{product.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {product.elementMg} mg elementair Mg
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {product.form}
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {product.capsulesPerDay}× per dag
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {formatPrice(product.pricePerDayEur)} / dag
            </span>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold">Pluspunten</h4>
              <ul className="mt-2 space-y-2 text-sm text-stone-600">
                {product.pros.map((pro) => (
                  <li key={pro}>• {pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Aandachtspunten</h4>
              <ul className="mt-2 space-y-2 text-sm text-stone-600">
                {product.cons.map((con) => (
                  <li key={con}>• {con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-100 px-6 pb-6 pt-4">
        <AffiliateLink
          affiliateSlug={product.affiliateSlug}
          pageType={pageType}
          position={position}
          className="inline-flex w-full items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-900 hover:border-stone-300"
        >
          Bekijk actuele prijs bij aanbieder →
        </AffiliateLink>
        <DisclosureSmall />
      </div>
    </article>
  );
}
