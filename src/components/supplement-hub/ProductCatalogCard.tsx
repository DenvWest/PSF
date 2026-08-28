"use client";

import Image from "next/image";
import Link from "next/link";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import {
  formatCents,
  formatScore,
  type HubProduct,
} from "@/lib/supplement-hub/product-catalog";
import {
  CLAIM_PRESENTATION,
  getComponentStatus,
  getScoreBand,
} from "@/lib/supplement-hub/score-presentation";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-stone-900">
        {value}
      </dd>
    </div>
  );
}

type ProductCatalogCardProps = {
  product: HubProduct;
  tieCount: number;
  /** Reden uit de check waarom deze categorie bij deze bezoeker past. */
  persoonlijkeReden?: string | null;
};

export default function ProductCatalogCard({
  product,
  tieCount,
  persoonlijkeReden = null,
}: ProductCatalogCardProps) {
  const band = getScoreBand(product.score.total);
  const claim = CLAIM_PRESENTATION[product.claimStance];
  const opgeschaald = product.cost.centenPerDag > product.cost.etiketCentenPerDag;
  const gedeeldEerste = tieCount > 1 && product.kwaliteitsrang.position === 1;

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-white p-5 transition-all duration-200 hover:shadow-md ${
        persoonlijkeReden
          ? "border-[#5A8F6A]/40 ring-1 ring-[#5A8F6A]/15"
          : "border-stone-200 hover:border-ps-green/40"
      }`}
    >
      <div className="flex gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-50">
          {product.imageSrc ? (
            <Image
              src={product.imageSrc}
              alt={product.imageAlt}
              width={64}
              height={64}
              className="h-full w-full object-contain p-1"
              loading="lazy"
            />
          ) : (
            <span aria-hidden="true" className="text-2xl">
              {product.categoryIcon}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
            {product.brand}
          </p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug text-stone-900">
            <Link
              href={product.href}
              className="transition-colors hover:text-ps-green"
              onClick={() =>
                trackEvent(GA4_EVENTS.SUPPLEMENTEN_PRODUCT_UITGAAND, {
                  product: product.key,
                  bestemming: "productpagina",
                })
              }
            >
              {product.name}
            </Link>
          </h3>
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold leading-none ${band.badge}`}
          >
            {formatScore(product.score.total)}
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
              {band.label}
            </span>
          </span>
        </div>
      </div>

      {persoonlijkeReden ? (
        <p className="mt-4 rounded-lg bg-[#F0FAF3] px-3 py-2 text-[11px] leading-relaxed text-[#3D6B4F]">
          <span className="font-semibold">Past bij jou</span> — {persoonlijkeReden}
        </p>
      ) : null}

      <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-stone-100 pt-4 sm:grid-cols-4">
        <Stat
          label="Per dag"
          value={product.doseringLabel ?? "Niet vermeld"}
        />
        <Stat
          label={opgeschaald ? "Claimdag" : "Prijs/dag"}
          value={formatCents(product.cost.centenPerDag)}
        />
        <Stat label="Vorm" value={product.vormLabel} />
        <Stat
          label="In categorie"
          value={
            gedeeldEerste
              ? `Gedeeld 1e/${product.kwaliteitsrang.total}`
              : `${product.kwaliteitsrang.position}e van ${product.kwaliteitsrang.total}`
          }
        />
      </dl>

      <div className="mt-5 border-t border-stone-100 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h4 className="text-sm font-semibold text-stone-900">PS-Score</h4>
          <Link
            href="/ps-score"
            className="flex-shrink-0 text-xs font-medium text-ps-green transition-colors hover:text-ps-green-hover"
            onClick={() =>
              trackEvent(GA4_EVENTS.SUPPLEMENTEN_METHODIEK_GEOPEND, {
                bron: "productkaart",
                product: product.key,
              })
            }
          >
            Hoe we scoren →
          </Link>
        </div>

        <ul className="mt-3 divide-y divide-stone-100">
          <li className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-xs text-stone-600">EU-claimvoorwaarde</span>
            <span
              className={`flex flex-shrink-0 items-center gap-1.5 text-xs font-semibold ${claim.text}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${claim.dot}`}
                aria-hidden="true"
              />
              {claim.short}
            </span>
          </li>

          {product.score.components.map((component) => {
            const status = getComponentStatus(component.points);
            return (
              <li key={component.id}>
                <details
                  className="group"
                  onToggle={(event) => {
                    if (event.currentTarget.open) {
                      trackEvent(GA4_EVENTS.SUPPLEMENTEN_PRODUCT_ONDERBOUWING, {
                        product: product.key,
                        onderdeel: component.id,
                      });
                    }
                  }}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2.5 marker:hidden">
                    <span className="min-w-0 truncate text-xs text-stone-600">
                      {component.label}
                    </span>
                    <span
                      className={`flex flex-shrink-0 items-center gap-1.5 text-xs font-semibold ${status.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        aria-hidden="true"
                      />
                      {status.label}
                      <span
                        className="text-stone-300 transition-transform group-open:rotate-90"
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    </span>
                  </summary>
                  <p className="pb-3 pr-6 text-[11px] leading-relaxed text-stone-500">
                    {component.reden}
                    {component.points !== null ? (
                      <span className="mt-1 block text-stone-400">
                        {component.points}/100 · weegt{" "}
                        {Math.round(component.weight * 100)}% mee
                      </span>
                    ) : (
                      <span className="mt-1 block text-stone-400">
                        Telt niet mee; het gewicht gaat naar de andere onderdelen.
                      </span>
                    )}
                  </p>
                </details>
              </li>
            );
          })}
        </ul>

        {opgeschaald ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
            Etiket {formatCents(product.cost.etiketCentenPerDag)}/dag, maar onder
            de claimdrempel. Om die te halen kost een dag{" "}
            {formatCents(product.cost.centenPerDag)}.
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-stone-100 pt-4">
        <Link
          href={product.href}
          className="text-xs font-semibold text-ps-green transition-colors hover:text-ps-green-hover"
          onClick={() =>
            trackEvent(GA4_EVENTS.SUPPLEMENTEN_PRODUCT_UITGAAND, {
              product: product.key,
              bestemming: "productpagina",
            })
          }
        >
          Bekijk product →
        </Link>
        <Link
          href={product.guideHref}
          className="text-xs font-medium text-stone-500 transition-colors hover:text-ps-green"
          onClick={() =>
            trackEvent(GA4_EVENTS.SUPPLEMENTEN_PRODUCT_UITGAAND, {
              product: product.key,
              bestemming: "gids",
            })
          }
        >
          Gids
        </Link>
        {product.comparisonHref ? (
          <Link
            href={product.comparisonHref}
            className="text-xs font-medium text-stone-500 transition-colors hover:text-ps-green"
            onClick={() =>
              trackEvent(GA4_EVENTS.SUPPLEMENTEN_PRODUCT_UITGAAND, {
                product: product.key,
                bestemming: "vergelijking",
              })
            }
          >
            Vergelijk
          </Link>
        ) : null}
        <span className="ml-auto text-[10px] text-stone-400">
          Prijs {product.cost.gecontroleerdOp}
        </span>
      </div>
    </article>
  );
}
