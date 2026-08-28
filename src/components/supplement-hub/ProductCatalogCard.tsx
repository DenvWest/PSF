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
      <dd className="mt-0.5 text-sm font-semibold leading-snug text-stone-900">
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

/**
 * Eén product als compacte rij: merk, naam, oordeel en de vier cijfers die je
 * naast elkaar wilt kunnen leggen. De rekenkundige onderbouwing zit achter één
 * uitklap, zodat een lijst van 22 producten te overzien blijft.
 */
export default function ProductCatalogCard({
  product,
  tieCount,
  persoonlijkeReden = null,
}: ProductCatalogCardProps) {
  const band = getScoreBand(product.score.total);
  const claim = CLAIM_PRESENTATION[product.claimStance];
  const opgeschaald =
    product.cost.centenPerDag > product.cost.etiketCentenPerDag;
  const gedeeldEerste = tieCount > 1 && product.kwaliteitsrang.position === 1;
  const rang = gedeeldEerste
    ? `Gedeeld 1e van ${product.kwaliteitsrang.total}`
    : `${product.kwaliteitsrang.position}e van ${product.kwaliteitsrang.total}`;

  return (
    <article
      className={`@container overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:shadow-md ${
        persoonlijkeReden
          ? "border-[#5A8F6A]/40 ring-1 ring-[#5A8F6A]/15"
          : "border-stone-200 hover:border-ps-green/40"
      }`}
    >
      <div className="flex flex-col gap-3 p-3 @[16rem]:flex-row @[16rem]:gap-4 @[16rem]:p-4 @[26rem]:p-5">
        <div className="flex h-36 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-50 @[16rem]:h-24 @[16rem]:w-24 @[26rem]:h-28 @[26rem]:w-28">
          {product.imageSrc ? (
            <Image
              src={product.imageSrc}
              alt={product.imageAlt}
              width={224}
              height={224}
              className="h-full w-full object-contain p-2"
              loading="lazy"
            />
          ) : (
            <span aria-hidden="true" className="text-4xl @[16rem]:text-3xl">
              {product.categoryIcon}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
                {product.brand}
              </p>
              <h3 className="mt-0.5 text-[0.95rem] font-semibold leading-snug text-stone-900 @[26rem]:text-base">
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
            </div>
            <span
              className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold leading-none ${band.badge}`}
            >
              {formatScore(product.score.total)}
              <span className="hidden text-[10px] font-semibold uppercase tracking-wide opacity-90 @[16rem]:inline">
                {band.label}
              </span>
            </span>
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 font-semibold ${claim.text}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${claim.dot}`}
                aria-hidden="true"
              />
              {claim.short}
            </span>
            <span className="text-stone-500">{product.categoryLabel}</span>
            {product.thirdPartyTested ? (
              <span className="text-stone-500">Onafhankelijk getest</span>
            ) : null}
          </p>

          {persoonlijkeReden ? (
            <div className="mt-2.5 rounded-lg bg-[#F0FAF3] px-3 py-2 text-[11px] leading-relaxed text-[#3D6B4F]">
              <p>
                <span className="font-semibold">
                  {product.categoryLabel} past bij jouw check
                </span>{" "}
                — {persoonlijkeReden}
              </p>
              {product.claimStance !== "voldoet" ? (
                <p className="mt-1 text-[#3D6B4F]/75">
                  Let op: dít product blijft onder de dagdosering waarvoor die
                  EU-claim geldt.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 border-t border-stone-100 bg-stone-50/70 px-3 py-3 @[16rem]:grid-cols-2 @[16rem]:px-4 @[26rem]:px-5 @[30rem]:grid-cols-4">
        <Stat label="Per dag" value={product.doseringLabel ?? "Niet vermeld"} />
        <Stat
          label={opgeschaald ? "Claimdag" : "Prijs/dag"}
          value={formatCents(product.cost.centenPerDag)}
        />
        <Stat label="Vorm" value={product.vormLabel} />
        <Stat label="In categorie" value={rang} />
      </dl>

      <details
        className="group border-t border-stone-100"
        onToggle={(event) => {
          if (event.currentTarget.open) {
            trackEvent(GA4_EVENTS.SUPPLEMENTEN_PRODUCT_ONDERBOUWING, {
              product: product.key,
              onderdeel: "paneel",
            });
          }
        }}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 @[16rem]:px-4 text-xs font-semibold text-stone-700 marker:hidden hover:text-ps-green @[26rem]:px-5 [&::-webkit-details-marker]:hidden">
          Onderbouwing PS-Score
          <span
            className="text-stone-400 transition-transform group-open:rotate-90"
            aria-hidden="true"
          >
            ›
          </span>
        </summary>

        <div className="border-t border-stone-100 px-3 pb-4 pt-1 @[16rem]:px-4 @[26rem]:px-5">
          <ul className="divide-y divide-stone-100" role="list">
            {product.score.components.map((component) => {
              const status = getComponentStatus(component.points);
              return (
                <li key={component.id} className="py-2.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 text-xs font-medium text-stone-700">
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
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
                    {component.reden}{" "}
                    {component.points !== null ? (
                      <span className="text-stone-400">
                        {component.points}/100 · weegt{" "}
                        {Math.round(component.weight * 100)}% mee
                      </span>
                    ) : (
                      <span className="text-stone-400">
                        Telt niet mee; het gewicht gaat naar de andere
                        onderdelen.
                      </span>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>

          {opgeschaald ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
              Etiket {formatCents(product.cost.etiketCentenPerDag)}/dag, maar
              onder de claimdrempel. Om die te halen kost een dag{" "}
              {formatCents(product.cost.centenPerDag)}.
            </p>
          ) : null}

          <Link
            href="/ps-score"
            className="mt-3 inline-block text-xs font-medium text-ps-green transition-colors hover:text-ps-green-hover"
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
      </details>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-100 px-3 py-3 @[16rem]:px-4 @[26rem]:px-5">
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
