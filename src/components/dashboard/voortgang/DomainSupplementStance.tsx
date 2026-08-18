"use client";

import { useEffect, useRef, useState } from "react";
import * as Icons from "@/components/app/icons";
import SupplementVerdictPanel, {
  type VerdictPanelSurface,
} from "@/components/dashboard/SupplementVerdictPanel";
import { getDomainProductStance, type ProductStanceDomain } from "@/data/domain-product-stance";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
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
  /** Voor het schap (Leefstijlprofiel · domein): daar ís deze sectie al het
   * aanbod, dus geen toggle-teaser nodig. Standaard false — ongewijzigd
   * gedrag op slaap/stress/voeding. */
  openByDefault?: boolean;
  /** Op domein-schermen: alleen poortstand tonen, geen uitklapbaar panel. */
  poortOnly?: boolean;
  onOpenLeefstijlprofiel?: () => void;
};

/** Eén reden per render — de teller die laat zien hoe vaak de deur dicht
 * blijft, en waarom. Nooit "wij weten het niet" verzamelen onder één label. */
type ClosedReason = "geen_schap" | "geen_voedingscheck" | null;

export default function DomainSupplementStance({
  domain,
  verdicts,
  nutritionLogCompleted,
  surface,
  openByDefault = false,
  poortOnly = false,
  onOpenLeefstijlprofiel,
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
      <div
        className="rounded-2xl px-3.5 py-3.5"
        style={{ border: "1px solid var(--divider)", background: "rgba(0,0,0,0.22)" }}
      >
        <p
          className="flex items-center gap-1.5"
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-subtle)",
          }}
        >
          <Icons.Lock s={13} />
          Geen schap op dit domein
        </p>
        <p
          className="text-pretty"
          style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.6, color: "var(--text-muted)" }}
        >
          {stance.reason}
        </p>
      </div>
    );
  }

  if (domainVerdicts.length === 0) {
    return null;
  }

  if (poortOnly) {
    return (
      <div
        className="rounded-2xl px-3.5 py-3.5"
        style={{ border: "1px solid var(--divider)", background: "rgba(0,0,0,0.22)" }}
      >
        <p
          className="flex items-center gap-1.5"
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-subtle)",
          }}
        >
          <Icons.Lock s={13} />
          {!nutritionLogCompleted ? "De deur is dicht" : "Supplementen in je profiel"}
        </p>
        <p
          className="text-pretty"
          style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.6, color: "var(--text-muted)" }}
        >
          {!nutritionLogCompleted
            ? "Vul eerst je voeding in — zonder dat kunnen we niet zeggen of aanvullen iets toevoegt."
            : "Het oordeel en het schap staan in je leefstijlprofiel — hier leggen we alleen uit waarom de volgorde zo is."}
        </p>
        {onOpenLeefstijlprofiel ? (
          <button
            type="button"
            onClick={() => {
              trackEvent("dashboard_keuzes_poort_click", { domain, surface });
              clarityTag("dashboard_keuzes_poort", domain);
              onOpenLeefstijlprofiel();
            }}
            className="mt-3 cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-[var(--sage)]"
          >
            Naar je leefstijlprofiel →
          </button>
        ) : null}
      </div>
    );
  }

  if (!nutritionLogCompleted) {
    return (
      <div
        className="rounded-2xl px-3.5 py-3.5"
        style={{ border: "1px solid var(--divider)", background: "rgba(0,0,0,0.22)" }}
      >
        <p
          className="flex items-center gap-1.5"
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-subtle)",
          }}
        >
          <Icons.Lock s={13} />
          De deur is dicht
        </p>
        <p
          className="text-pretty"
          style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.6, color: "var(--text-muted)" }}
        >
          Vul eerst je voeding in — zonder dat kunnen we niet zeggen of aanvullen iets
          toevoegt.
        </p>
      </div>
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
      className="rounded-2xl px-3.5 py-3.5"
      style={{
        border: open ? "1px solid rgba(90, 143, 106, 0.42)" : "1px solid var(--divider)",
        background: open ? "rgba(90, 143, 106, 0.09)" : "rgba(0,0,0,0.22)",
        transition: "border-color 0.15s ease, background 0.15s ease",
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={`supplement-deur-${domain}`}
        className="flex w-full cursor-pointer items-center justify-between gap-2 text-left"
      >
        <span
          className="flex items-center gap-1.5"
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: open ? "var(--sage, #5A8F6A)" : "var(--text-subtle)",
          }}
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
        <div id={`supplement-deur-${domain}`} style={{ marginTop: 12 }}>
          <SupplementVerdictPanel
            verdicts={domainVerdicts}
            variant="full"
            surface={surface}
            hideHeader
          />
        </div>
      ) : null}
    </div>
  );
}
