"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import SupplementVerdictPanel, {
  type VerdictPanelSurface,
} from "@/components/dashboard/SupplementVerdictPanel";
import { getDomainProductStance, type ProductStanceDomain } from "@/data/domain-product-stance";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";
import type { StoredSupplementVerdict } from "@/types/verdict";

/**
 * De poort op laag 6, generiek per domein — de ladder legt uit, hij draagt zelf
 * geen vergelijkingslink. `getDomainProductStance` bepaalt de vorm:
 *
 * - `lifestyle_first` (stress) → een vaste, altijd zichtbare uitleg waarom er
 *   hier geen schap is. Geen poort om te openen — dat zou suggereren dat hij
 *   ooit opengaat.
 * - `candidates` (slaap, beweging) → een deur die het bestaande
 *   SupplementVerdictPanel opent, gefilterd tot de kandidaten van dit domein.
 *   Poort 2 (voedingscheck) blijft de bestaande regel: zonder voedingscheck
 *   is er nog niets te dichten.
 */
type DomainSupplementStanceProps = {
  domain: ProductStanceDomain;
  verdicts: StoredSupplementVerdict[];
  nutritionLogCompleted: boolean;
  surface: VerdictPanelSurface;
  /**
   * Het leefstijldomein waarvan de ladder de rangorde levert. Zonder deze prop
   * draagt de kaart geen ladderplek — beter niets dan een laag uit het verkeerde
   * domein.
   */
  ladderDomain?: PillarId;
  /** Voor het schap (Schap · Producten-tab): daar ís deze sectie al het
   * aanbod, dus geen toggle-teaser nodig. Standaard false — ongewijzigd
   * gedrag op slaap/stress/voeding. */
  openByDefault?: boolean;
  /** Op domein-schermen (Leefstijlprofiel): alleen poortstand tonen, geen uitklapbaar panel. */
  poortOnly?: boolean;
  onOpenFavorieten?: () => void;
  /** Alleen op het schap: laat elke kandidaat een bewaarknop dragen — N2 vereist dat een aanbeveling nooit stilzwijgend een keuze wordt, dus dit zet 'm alleen naast Mijn keuze, niet erin. */
  showFavoriteSave?: boolean;
  favoriteSource?: "aanbevolen" | "mijn_keuze";
};

/** Eén reden per render — de teller die laat zien hoe vaak de deur dicht
 * blijft, en waarom. Nooit "wij weten het niet" verzamelen onder één label. */
type ClosedReason = "geen_schap" | "geen_voedingscheck" | null;

/**
 * Elke dichte poort in dezelfde vorm: slotje, kop in klein kapitaal, reden.
 * Dat is bewust dezelfde chassis als de open deur en als de productkaart —
 * een gesloten schap hoort er even verzorgd uit te zien als een open schap,
 * anders leest "dicht" als "kapot".
 */
function GeslotenPoort({
  titel,
  children,
}: {
  titel: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--divider)] bg-black/20 px-3.5 py-3.5">
      <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
        <Icons.Lock s={13} />
        {titel}
      </p>
      {children}
    </div>
  );
}

function PoortTekst({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--text-muted)] text-pretty">
      {children}
    </p>
  );
}

export default function DomainSupplementStance({
  domain,
  verdicts,
  nutritionLogCompleted,
  surface,
  ladderDomain,
  openByDefault = false,
  poortOnly = false,
  onOpenFavorieten,
  showFavoriteSave = false,
  favoriteSource = "aanbevolen",
}: DomainSupplementStanceProps) {
  const [open, setOpen] = useState(openByDefault);
  const stance = getDomainProductStance(domain);
  const domainVerdicts =
    stance.kind === "candidates"
      ? verdicts.filter((row) => stance.slugs.has(row.ingredientKey))
      : [];

  const closedReason: ClosedReason =
    stance.kind === "lifestyle_first"
      ? "geen_schap"
      : domainVerdicts.length > 0 && !nutritionLogCompleted
        ? "geen_voedingscheck"
        : null;

  const trackedReasonRef = useRef<ClosedReason>(null);
  useEffect(() => {
    if (!closedReason || trackedReasonRef.current === closedReason) {
      return;
    }
    trackedReasonRef.current = closedReason;
    trackEvent("dashboard_supplement_deur_dicht", { domain, reason: closedReason, surface });
    clarityTag("dashboard_supplement_deur_dicht", `${domain}:${closedReason}`);
  }, [closedReason, domain, surface]);

  if (stance.kind === "lifestyle_first") {
    return (
      <GeslotenPoort titel="Geen schap op dit domein">
        <PoortTekst>{stance.reason}</PoortTekst>
      </GeslotenPoort>
    );
  }

  if (domainVerdicts.length === 0) {
    return null;
  }

  if (poortOnly) {
    const dichtCopy =
      domain === "sleep"
        ? "Eerst gelegenheid, ritme en avondgedrag — en vul je voeding in. Zonder die basis kunnen we niet zeggen of magnesium iets toevoegt."
        : "Vul eerst je voeding in — zonder dat kunnen we niet zeggen of aanvullen iets toevoegt.";
    const openCopy =
      domain === "sleep"
        ? "Magnesium hoort bij aanvullen, niet bij de basis. Het oordeel en het aanbod staan op Keuze — hier leggen we alleen uit waarom de volgorde zo is."
        : "Het oordeel en het aanbod staan op Keuze — hier leggen we alleen uit waarom de volgorde zo is.";

    return (
      <GeslotenPoort
        titel={!nutritionLogCompleted ? "De deur is dicht" : "Supplementen in je profiel"}
      >
        <PoortTekst>{!nutritionLogCompleted ? dichtCopy : openCopy}</PoortTekst>
        {onOpenFavorieten ? (
          <button
            type="button"
            onClick={() => {
              trackEvent("dashboard_keuzes_poort_click", { domain, surface });
              clarityTag("dashboard_keuzes_poort", domain);
              onOpenFavorieten();
            }}
            className="mt-3 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-semibold text-[var(--sage)]"
          >
            Naar Favorieten
            <Icons.ChevronRight s={13} />
          </button>
        ) : null}
      </GeslotenPoort>
    );
  }

  if (!nutritionLogCompleted) {
    return (
      <GeslotenPoort titel="De deur is dicht">
        <PoortTekst>
          {domain === "sleep"
            ? "Eerst gelegenheid, ritme en avondgedrag — en vul je voeding in. Zonder die basis kunnen we niet zeggen of magnesium iets toevoegt."
            : "Vul eerst je voeding in — zonder dat kunnen we niet zeggen of aanvullen iets toevoegt."}
        </PoortTekst>
      </GeslotenPoort>
    );
  }

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      trackEvent("dashboard_supplement_deur_open", { domain, surface });
      clarityTag("dashboard_supplement_deur", domain);
    }
  };

  return (
    <div
      // Open blijft het veld donker en neutraal: de kaarten erin zijn lichter
      // en moeten er los op liggen, net als de witte productkaarten op de
      // stone-achtergrond van /supplementen. Een groene waas over het hele
      // paneel trekt dat verschil juist dicht — de open-stand zit daarom in de
      // rand en de kop, niet in het vlak.
      className={`overflow-hidden rounded-2xl border bg-black/25 transition-colors duration-150 ${
        open ? "border-[rgba(90,143,106,0.42)]" : "border-[var(--divider)]"
      }`}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={`supplement-deur-${domain}`}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-3.5 py-3.5 text-left"
      >
        <span
          className={`flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] ${
            open ? "text-[var(--sage,#5A8F6A)]" : "text-[var(--text-subtle)]"
          }`}
        >
          <Icons.Lock s={13} />
          Wat een supplement hier wél en niet doet
        </span>
        <Icons.ChevronRight
          s={16}
          style={{
            color: open ? "var(--sage, #5A8F6A)" : "var(--text-subtle)",
            flexShrink: 0,
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        />
      </button>
      {open ? (
        <div id={`supplement-deur-${domain}`} className="px-3.5 pb-3.5">
          <SupplementVerdictPanel
            verdicts={domainVerdicts}
            variant="full"
            surface={surface}
            ladderDomain={ladderDomain}
            hideHeader
            showFavoriteSave={showFavoriteSave}
            favoriteSource={favoriteSource}
          />
        </div>
      ) : null}
    </div>
  );
}
