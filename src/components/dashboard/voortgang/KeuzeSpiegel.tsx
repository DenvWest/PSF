"use client";

import Link from "next/link";
import Image from "next/image";
import * as Icons from "@/components/app/icons";
import { getIngredientVisual } from "@/data/supplement-hub/ingredient-visuals";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import type { KeuzeSpiegel as KeuzeSpiegelModel } from "@/lib/keuze-spiegel";
import { SUPPLEMENT_HUB_PATH } from "@/lib/supplement-hub/hub-link";
import { buildVerdictCards } from "@/lib/supplement-verdict-copy";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import type { PillarId } from "@/types/dashboard";
import type { StoredSupplementVerdict } from "@/types/verdict";

type KeuzeSpiegelProps = {
  spiegel: KeuzeSpiegelModel;
  verdicts: StoredSupplementVerdict[];
  /** Naar het leefstijlprofiel van dit domein — daar staat de hele ladder. */
  onOpenLeefstijlprofiel?: (domain: PillarId) => void;
};

/**
 * De telregel is een geloofwaardigheidsregel, geen opsomming: dat wij vaker nee
 * dan ja zeggen is precies wat het schap moet laten zien. Slaap draagt maar één
 * kandidaat, dus enkelvoud moet kloppen.
 */
function telregel(aanraders: number, beoordeeld: number): string {
  const stof = beoordeeld === 1 ? "stof" : "stoffen";
  if (aanraders === 0) {
    return beoordeeld === 1
      ? "We beoordeelden één stof en zeggen nee. Dat scheelt je geld."
      : `We beoordeelden ${beoordeeld} stoffen en zeggen bij alle ${beoordeeld} nee. Dat scheelt je geld.`;
  }
  if (aanraders === beoordeeld) {
    return beoordeeld === 1
      ? "Eén stof beoordeeld, en die krijgt een ja."
      : `Alle ${beoordeeld} beoordeelde stoffen krijgen een ja.`;
  }
  return `${aanraders} van ${beoordeeld} beoordeelde ${stof} ${
    aanraders === 1 ? "krijgt" : "krijgen"
  } een ja. De rest scheelt je geld.`;
}

function KolomKop({
  eyebrow,
  titel,
  toon,
}: {
  eyebrow: string;
  titel: string;
  toon: "leefstijl" | "aanbod";
}) {
  return (
    <div>
      <p
        className={`text-[9.5px] font-bold uppercase tracking-[0.14em] ${
          toon === "leefstijl" ? "text-[#9CC5A9]" : "text-[var(--text-subtle)]"
        }`}
      >
        {eyebrow}
      </p>
      <p className="mt-1 font-[family-name:var(--f-serif)] text-[15px] leading-tight text-[var(--text)]">
        {titel}
      </p>
    </div>
  );
}

/**
 * De spiegel boven de tabs: links wat je zelf kunt doen, rechts wat je kunt
 * kopen, met de volgorde ertussen uitgesproken.
 *
 * **Waarom dit boven het aanbod staat en niet ernaast in een tab.** Het schap
 * is de plek waar wij geld verdienen. Als de gratis kant achter een tab
 * verdwijnt die je moet aanklikken, is "leefstijl eerst" een bewering in copy
 * in plaats van iets wat de pagina zelf doet. Hier zie je de volgorde vóór het
 * aanbod, elke keer.
 *
 * De sterren links en de claimstand rechts zijn bewust géén vergelijkbare
 * schaal: leefstijlbewijs komt uit onderzoek naar het gedrag, de claimstand uit
 * de EU-toelating van een stof. Wat ze wél samen dragen is de rangorde, en die
 * staat er in woorden bij.
 */
export default function KeuzeSpiegel({
  spiegel,
  verdicts,
  onOpenLeefstijlprofiel,
}: KeuzeSpiegelProps) {
  const { leefstijl, aanbod, domain, totalLayers } = spiegel;
  // Geen slice: het aantal hier moet kloppen met de telregel eronder. Vijf
  // kandidaten is het maximum dat een domein draagt (voeding), dus dit blijft
  // kort vanzelf.
  const kaarten = buildVerdictCards(verdicts);

  function handleCatalogus() {
    trackEvent("dashboard_spiegel_catalogus_click", { domain });
    clarityTag("keuze_spiegel_catalogus", domain);
    emitIntakeClientEvent("dashboard.cta_to_hub", {
      pillar: domain,
      destination: "supplementen",
    });
  }

  function handleLeefstijl() {
    trackEvent("dashboard_spiegel_leefstijl_click", { domain });
    clarityTag("keuze_spiegel_leefstijl", domain);
    onOpenLeefstijlprofiel?.(domain);
  }

  return (
    <section
      aria-label="Wat eerst komt, en wat je kunt kopen"
      className="@container mb-4 overflow-hidden rounded-2xl border border-[var(--divider)] bg-black/25"
    >
      <div className="grid grid-cols-1 divide-y divide-white/[0.07] @[36rem]:grid-cols-2 @[36rem]:divide-x @[36rem]:divide-y-0">
        {/* Links: gratis, en het draagt het meest. */}
        <div className="flex flex-col gap-3 p-3.5 @[22rem]:p-4">
          <KolomKop
            toon="leefstijl"
            eyebrow={`Gratis · laag 1–${leefstijl.layers.length + leefstijl.restLayers}`}
            titel="Wat er eerst komt"
          />

          <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
            {leefstijl.layers.map((laag) => (
              <li key={laag.id} className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-[3px] flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(90,143,106,0.2)] text-[10px] font-bold text-[#9CC5A9]"
                >
                  {laag.id}
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-semibold leading-snug text-[var(--text)]">
                    {laag.name}
                  </span>
                  {laag.firstAction ? (
                    <span className="mt-0.5 block text-[11.5px] leading-relaxed text-[var(--text-muted)] text-pretty">
                      {laag.firstAction}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>

          {leefstijl.restLayers > 0 ? (
            <p className="m-0 text-[11px] text-[var(--text-subtle)]">
              En nog {leefstijl.restLayers}{" "}
              {leefstijl.restLayers === 1 ? "laag" : "lagen"} vóór je bij aanvullen
              komt.
            </p>
          ) : null}

          {leefstijl.evidence ? (
            <p className="m-0 text-[11.5px] text-[var(--text-muted)]">
              <span aria-hidden>
                {"★".repeat(leefstijl.evidence.stars)}
                {"☆".repeat(5 - leefstijl.evidence.stars)}
              </span>{" "}
              <span className="font-semibold">{leefstijl.evidence.label}</span> voor
              de vragen waar dit domein op rust
            </p>
          ) : null}

          {onOpenLeefstijlprofiel ? (
            <button
              type="button"
              onClick={handleLeefstijl}
              className="mt-auto inline-flex cursor-pointer items-center gap-1 self-start border-none bg-transparent p-0 text-left text-[12.5px] font-semibold text-[var(--sage)]"
            >
              Alle {totalLayers} lagen in je leefstijlprofiel
              <Icons.ChevronRight s={13} />
            </button>
          ) : null}
        </div>

        {/* Rechts: betaald, en het komt als laatste. */}
        <div className="flex flex-col gap-3 p-3.5 @[22rem]:p-4">
          <KolomKop
            toon="aanbod"
            eyebrow={`Betaald · laag ${aanbod.layerId} van ${totalLayers}`}
            titel="Wat je kunt kopen"
          />

          {aanbod.open && kaarten.length > 0 ? (
            <>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {kaarten.map((kaart) => {
                  const visual = getIngredientVisual(kaart.ingredientKey);
                  const isJa = kaart.tone === "ja";
                  return (
                    <li
                      key={kaart.ingredientKey}
                      className="flex items-center gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2 py-1.5"
                    >
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-black/30">
                        {visual ? (
                          <Image
                            src={visual.imageSrc}
                            alt=""
                            width={64}
                            height={64}
                            className={`h-full w-full object-contain p-0.5 ${
                              isJa ? "" : "opacity-40 grayscale"
                            }`}
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12.5px] text-[var(--text)]">
                        {kaart.name}
                      </span>
                      <span
                        className={`flex-shrink-0 text-[9.5px] font-bold uppercase tracking-[0.08em] ${
                          isJa ? "text-[#9CC5A9]" : "text-[var(--text-subtle)]"
                        }`}
                      >
                        {kaart.label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <p className="m-0 text-[11.5px] leading-relaxed text-[var(--text-muted)] text-pretty">
                {telregel(aanbod.aanraders, aanbod.beoordeeld)}
              </p>
            </>
          ) : (
            <p className="m-0 text-[12px] leading-relaxed text-[var(--text-muted)] text-pretty">
              {aanbod.layerSummary}
            </p>
          )}

          <p className="m-0 text-[11px] leading-relaxed text-[var(--text-subtle)] text-pretty">
            Deze laag komt als laatste. Niet omdat een supplement niets doet, maar
            omdat we de lagen hierboven eerst onderbouwd hebben.
          </p>

          <Link
            href={withVoortgangReturn(SUPPLEMENT_HUB_PATH)}
            onClick={handleCatalogus}
            className="mt-auto inline-flex items-center gap-1 self-start text-[12.5px] font-semibold text-[var(--sage)] no-underline"
          >
            Open de supplementengids
            <Icons.ChevronRight s={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
