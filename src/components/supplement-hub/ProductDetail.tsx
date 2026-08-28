import Image from "next/image";
import Link from "next/link";
import { AffiliateLink } from "@/components/supplements/AffiliateLink";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { ON_HOLD_DISCLAIMER } from "@/data/approved-claims";
import {
  LABEL_POINTS,
  getQualityMarkers,
} from "@/data/supplement-hub/score-model";
import {
  buildProductSamenvatting,
  formatCents,
  formatScore,
  kostenrangWoord,
  kwaliteitsrangWoord,
  type HubProduct,
} from "@/lib/supplement-hub/product-catalog";
import {
  CLAIM_PRESENTATION,
  getComponentStatus,
  getScoreBand,
} from "@/lib/supplement-hub/score-presentation";
import type { ScoreComponentId } from "@/types/supplement-score";

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 py-1.5 text-sm text-stone-600">
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${ok ? "bg-emerald-600" : "bg-stone-300"}`}
      >
        {ok ? "✓" : "–"}
      </span>
      <span>{children}</span>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
        {label}
      </dt>
      <dd className="mt-1 text-base font-semibold text-stone-900">{value}</dd>
    </div>
  );
}

/** De concrete feiten achter één scoreonderdeel — geen alinea, een aanvinklijst. */
function componentChecklist(product: HubProduct, id: ScoreComponentId) {
  switch (id) {
    case "dosering": {
      if (!product.evidence || product.gemetenDosis === null) {
        return null;
      }
      const eenheid =
        product.evidence.eenheid === "ug" ? "µg" : product.evidence.eenheid;
      return [
        {
          ok: product.gemetenDosis >= product.evidence.onderzoeksdosis,
          text: `Haalt de onderzoeksdosis van ${product.evidence.onderzoeksdosis} ${eenheid}`,
        },
        {
          ok: product.gemetenDosis <= product.evidence.bovengrens,
          text: `Blijft onder de bovengrens van ${product.evidence.bovengrens} ${eenheid}`,
        },
      ];
    }
    case "transparantie":
      return [
        {
          ok: product.labelFeiten.werkzameStofGekwantificeerd,
          text: `Werkzaam gehalte in een getal (${LABEL_POINTS.werkzameStofGekwantificeerd} punten)`,
        },
        {
          ok: product.labelFeiten.dagdoseringVermeld,
          text: `Expliciete dagdosering (${LABEL_POINTS.dagdoseringVermeld} punten)`,
        },
        {
          ok: product.labelFeiten.samenstellingUitgesplitst,
          text: `Samenstelling per vorm uitgesplitst (${LABEL_POINTS.samenstellingUitgesplitst} punten)`,
        },
        {
          ok: !product.labelFeiten.proprietaryBlend,
          text: `Geen proprietary blend (${LABEL_POINTS.geenProprietaryBlend} punten)`,
        },
      ];
    case "toetsing":
      return [
        {
          ok: product.thirdPartyTested,
          text: "Onafhankelijk laboratoriumonderzoek",
        },
        ...(product.certificeringen.length > 0
          ? product.certificeringen.map((keurmerk) => ({
              ok: true,
              text: `Grondstofkeurmerk ${keurmerk}`,
            }))
          : [{ ok: false, text: "Erkend grondstofkeurmerk" }]),
        // Alleen de markers die in deze categorie ergens over gaan.
        ...getQualityMarkers(product.category).map((marker) => ({
          ok: product.kwaliteitsmarkers[marker.key] === true,
          text: marker.label,
        })),
      ];
    default:
      return null;
  }
}

type ProductDetailProps = {
  product: HubProduct;
  peers: HubProduct[];
};

export default function ProductDetail({ product, peers }: ProductDetailProps) {
  const band = getScoreBand(product.score.total);
  const claim = CLAIM_PRESENTATION[product.claimStance];
  const opgeschaald = product.cost.centenPerDag > product.cost.etiketCentenPerDag;
  const isOnHoldBotanical = product.category === "ashwagandha";

  return (
    <div className="space-y-14 md:space-y-16">
      <section aria-label="Product" className="scroll-mt-24">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {product.imageSrc ? (
              <Image
                src={product.imageSrc}
                alt={product.imageAlt}
                width={128}
                height={128}
                className="h-full w-full object-contain p-2"
                priority
              />
            ) : (
              <span aria-hidden="true" className="text-4xl">
                {product.categoryIcon}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <Link
              href={product.guideHref}
              className="text-xs font-medium uppercase tracking-wide text-stone-400 transition-colors hover:text-ps-green"
            >
              {product.brand}
            </Link>
            <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-stone-900 md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">{product.variantTag}</p>
            <span
              className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-lg font-bold leading-none ${band.badge}`}
            >
              {formatScore(product.score.total)}
              <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                {band.label}
              </span>
            </span>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 border-y border-stone-200 py-5 sm:grid-cols-4">
          <Stat label="Per dag" value={product.doseringLabel ?? "Niet vermeld"} />
          <Stat
            label={opgeschaald ? "Prijs / claimdag" : "Prijs / dag"}
            value={formatCents(product.cost.centenPerDag)}
          />
          <Stat label="Vorm" value={product.vormLabel} />
          <Stat
            label="In categorie"
            value={`${product.kwaliteitsrang.position}e van ${product.kwaliteitsrang.total}`}
          />
        </dl>

        <p className="mt-6 max-w-3xl text-base leading-relaxed text-stone-600">
          {buildProductSamenvatting(product)}
        </p>

        <div className="mt-8">
          <p className="text-xs text-stone-500">
            Onafhankelijk beoordeeld — geen sponsoring. We ontvangen mogelijk een
            vergoeding als je via deze link koopt; dat verandert de score niet.{" "}
            <Link
              href="/affiliate-disclosure"
              className="font-medium text-ps-green hover:text-ps-green-hover"
            >
              Hoe dat werkt
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <AffiliateLink
              affiliateSlug={product.affiliateSlug}
              sourcePage="productpagina"
              className="inline-flex items-center justify-center rounded-xl bg-ps-green px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md"
            >
              Bekijk prijs bij de winkel →
            </AffiliateLink>
            {product.comparisonHref ? (
              <Link
                href={product.comparisonHref}
                className="inline-flex items-center justify-center rounded-xl border border-stone-300 px-6 py-3.5 text-sm font-semibold text-stone-700 transition-all hover:border-ps-green hover:text-ps-green"
              >
                Vergelijk met de rest
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-labelledby="ps-score" className="scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="ps-score" className="font-display text-2xl font-bold text-stone-900">
            PS-Score {formatScore(product.score.total)}
          </h2>
          <Link
            href="/ps-score"
            className="text-sm font-medium text-ps-green transition-colors hover:text-ps-green-hover"
          >
            Hoe we scoren →
          </Link>
        </div>

        <div className="mt-5 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="text-sm font-medium text-stone-800">
              EU-claimvoorwaarde
            </span>
            <span
              className={`flex flex-shrink-0 items-center gap-1.5 text-sm font-semibold ${claim.text}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${claim.dot}`}
                aria-hidden="true"
              />
              {claim.short}
            </span>
          </div>

          {product.score.components.map((component) => {
            const status = getComponentStatus(component.points);
            const checklist = componentChecklist(product, component.id);
            return (
              <div key={component.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-stone-800">
                    {component.label}
                  </span>
                  <span
                    className={`flex flex-shrink-0 items-center gap-1.5 text-sm font-semibold ${status.text}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${status.dot}`}
                      aria-hidden="true"
                    />
                    {status.label}
                    {component.points !== null ? (
                      <span className="font-normal tabular-nums text-stone-400">
                        {component.points}/100
                      </span>
                    ) : null}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
                  {component.reden}
                </p>
                {checklist ? (
                  <ul className="mt-2">
                    {checklist.map((item) => (
                      <Check key={item.text} ok={item.ok}>
                        {item.text}
                      </Check>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>

        {product.score.determinedCount < product.score.totalCount ? (
          <p className="mt-3 text-sm leading-relaxed text-stone-500">
            Deze score gaat over {product.score.determinedCount} van de{" "}
            {product.score.totalCount} onderdelen. Wat we niet konden vaststellen
            telt niet mee — een onbekende waarde is geen nul.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="claims" className="scroll-mt-24">
        <h2 id="claims" className="font-display text-2xl font-bold text-stone-900">
          Wat dit product volgens de EU mag beweren
        </h2>

        {product.claims.length > 0 ? (
          <ul className="mt-5 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
            {product.claims.map((c) => (
              <li key={c.text} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${c.gehaald ? "bg-emerald-600" : "bg-stone-300"}`}
                  >
                    {c.gehaald ? "✓" : "–"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-800">{c.text}</p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Voorwaarde: {c.condition}
                      {c.gehaald ? "" : " — deze dosering haalt dat niet"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-600">
            Voor dit ingrediënt staat geen enkele gezondheidsclaim op de Europese
            lijst van goedgekeurde claims. Wat een fabrikant of verkoper erover
            beweert, mag dus geen gezondheidseffect suggereren. Wij vergelijken
            hier op samenstelling, dosering en prijs — niet op een werking.
          </p>
        )}

        {isOnHoldBotanical ? (
          <p className="mt-4 max-w-3xl rounded-xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
            {ON_HOLD_DISCLAIMER}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="etiket" className="scroll-mt-24">
        <h2 id="etiket" className="font-display text-2xl font-bold text-stone-900">
          Op het etiket
        </h2>
        <dl className="mt-5 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
          {product.specs.map((spec) => (
            <div
              key={spec.label}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3.5"
            >
              <dt className="text-sm text-stone-500">{spec.label}</dt>
              <dd className="text-right text-sm font-medium text-stone-900">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-stone-400">
          Prijs gecontroleerd op {product.cost.gecontroleerdOp}. Controleer het
          etiket altijd zelf — samenstellingen wijzigen.
        </p>
      </section>

      <section aria-labelledby="vergelijking" className="scroll-mt-24">
        <h2
          id="vergelijking"
          className="font-display text-2xl font-bold text-stone-900"
        >
          Zo staat dit tussen de andere{" "}
          {product.categoryLabel.toLowerCase()}producten
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
              Kwaliteitsrang
            </p>
            <p className="mt-1.5 font-display text-2xl font-bold text-stone-900">
              {kwaliteitsrangWoord(product)}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
              Hogere PS-Score dan{" "}
              {product.kwaliteitsrang.total - product.kwaliteitsrang.position} van
              de {product.kwaliteitsrang.total - 1} andere producten in deze
              categorie.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
              Kostenrang
            </p>
            <p className="mt-1.5 font-display text-2xl font-bold text-stone-900">
              {kostenrangWoord(product)}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
              {formatCents(product.cost.centenPerDag)}{" "}
              {product.cost.basis === "claim-conforme-dag"
                ? "per claim-conforme dag"
                : "per etiketdag"}
              , goedkoper dan{" "}
              {product.kostenrang.total - product.kostenrang.position} van de{" "}
              {product.kostenrang.total - 1} andere.
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-stone-400">
          We tonen aantallen in plaats van percentages. Bij{" "}
          {product.kwaliteitsrang.total} producten zegt &ldquo;beter dan 97%&rdquo;
          niets — het aantal wel.
        </p>

        {peers.length > 0 ? (
          <ul className="mt-6 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
            {peers.map((peer) => {
              const peerBand = getScoreBand(peer.score.total);
              return (
                <li key={peer.slug}>
                  <Link
                    href={peer.href}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-stone-50"
                  >
                    <span
                      className={`flex-shrink-0 rounded-md px-2 py-1 text-xs font-bold leading-none ${peerBand.badge}`}
                    >
                      {formatScore(peer.score.total)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-stone-900">
                        {peer.volledigeNaam}
                      </span>
                      <span className="block truncate text-xs text-stone-500">
                        {peer.vormLabel} ·{" "}
                        {formatCents(peer.cost.centenPerDag)} per dag
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex-shrink-0 text-stone-300"
                    >
                      ›
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="redactie" className="scroll-mt-24">
        <h2 id="redactie" className="font-display text-2xl font-bold text-stone-900">
          Wat onze redactie opviel
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-500">
          Los van de berekende score — dit weegt een redacteur mee, inclusief
          smaak en gemak, wat de PS-Score bewust niet doet.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-stone-900">Sterk</h3>
            <ul className="mt-3">
              {product.pros.map((pro) => (
                <Check key={pro} ok>
                  {pro}
                </Check>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-stone-900">Let op</h3>
            <ul className="mt-3">
              {product.cons.map((con) => (
                <Check key={con} ok={false}>
                  {con}
                </Check>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-4">
          <Link
            href={product.guideHref}
            className="text-sm font-semibold text-ps-green transition-colors hover:text-ps-green-hover"
          >
            Lees de {product.categoryLabel.toLowerCase()}gids →
          </Link>
          {product.comparisonHref ? (
            <Link
              href={product.comparisonHref}
              className="text-sm font-semibold text-ps-green transition-colors hover:text-ps-green-hover"
            >
              Alle {product.categoryLabel.toLowerCase()} vergeleken →
            </Link>
          ) : null}
        </div>
      </section>

      <MedicalDisclaimer />
    </div>
  );
}
