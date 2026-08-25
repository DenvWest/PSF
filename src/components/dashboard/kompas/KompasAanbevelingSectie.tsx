"use client";

import { useEffect, useRef } from "react";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import {
  resolveDomainLadderReadout,
  resolveLadderLayerReason,
} from "@/lib/domain-ladder-readout";
import { trackEvent } from "@/lib/ga4";
import { CHECK_NAME } from "@/lib/kompas-domain-check";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import type { DashboardData, PillarId } from "@/types/dashboard";

/** Dezelfde toon als de winst-laag in de ladder — één kleur voor één betekenis. */
const WINST = "#C8956C";

type KompasAanbevelingSectieProps = {
  domain: PillarId;
  data?: DashboardData;
  onOpenDomain: (domain: PillarId) => void;
};

function herkomstLine(domain: PillarId, daysAgo: number | undefined): string {
  const check = CHECK_NAME[domain] ?? "check";
  if (daysAgo == null) {
    return `Uit je ${check}.`;
  }
  if (daysAgo === 0) {
    return `Uit je ${check} van vandaag.`;
  }
  if (daysAgo === 1) {
    return `Uit je ${check} van gisteren.`;
  }
  return `Uit je ${check} van ${daysAgo} dagen geleden.`;
}

/**
 * Waar je winst nu zit — één aanbeveling, alleen op je focusdomein.
 *
 * De ringenrij hierboven draagt alle vijf de domeinen mét hun check-chip; vijf
 * aanbevelingen eronder zouden vijf prioriteiten zijn, en dus geen. Bovendien
 * kunnen maar drie van de vijf domeinen er vandaag eerlijk één leveren:
 * `resolveDomainLadderReadout` geeft beweging, slaap en stress een winst-laag,
 * voeding en verbinding `null`. Zonder readout rendert dit blok niets — de
 * uitgelichte check-strip in de ringenrij vraagt dan al om de check, en een
 * tweede "doe je check"-kaart eronder is ruis.
 *
 * **Lezen, niet bewaren.** Er staat geen hart op deze kaart. Kiezen woont op de
 * ladder (Kompas › domein) en op het schap; `KompasKeuzeSectie` eronder is de
 * spiegel van wat je daar koos. Een save-knop hier maakt de home een derde
 * schrijfplek en zet een aanbeveling stilzwijgend om in een keuze (N2).
 *
 * De redenregel komt letterlijk uit `resolveLadderLayerReason` en wordt hier
 * net zo opgemaakt als in `DomainLadderContextPanel` — zelfde bron, zelfde
 * vorm, dus home en zijbalk kunnen niet uiteenlopen. Geen reden uit de check
 * betekent geen redenblok; nooit een reden verzinnen.
 */
export default function KompasAanbevelingSectie({
  domain,
  data,
  onOpenDomain,
}: KompasAanbevelingSectieProps) {
  const readout = resolveDomainLadderReadout(domain, data);
  const ladder = getLeefstijlLadder(domain);
  const layer = ladder?.layers.find((row) => row.id === readout?.focusLayer) ?? null;
  const reason = resolveLadderLayerReason(readout, layer?.id ?? -1);
  const action = layer?.actions[0] ?? null;

  const shownRef = useRef<string | null>(null);
  const impressionKey = layer ? `${domain}:${layer.id}` : null;
  useEffect(() => {
    if (!impressionKey || shownRef.current === impressionKey) {
      return;
    }
    shownRef.current = impressionKey;
    const [shownDomain, shownLayer] = impressionKey.split(":");
    trackEvent("dashboard_kompas_aanbeveling_shown", {
      surface: "kompas_home",
      domain: shownDomain,
      layer: Number(shownLayer),
      has_reason: reason != null,
    });
  }, [impressionKey, reason]);

  if (!readout || !layer) {
    return null;
  }

  const pillar = PILLAR[domain];
  // Alleen de staat die de check écht aflevert. Geen staat betekent geen
  // woord ernaast — nooit "Grootste winst" op een laag die dat niet zei.
  const state = readout.layerStates[layer.id] ?? null;
  const stateLabel = state ? readout.stateLabels[state] : null;

  const handleOpen = () => {
    trackEvent("dashboard_kompas_aanbeveling_click", {
      surface: "kompas_home",
      domain,
      layer: layer.id,
      has_reason: reason != null,
    });
    clarityTag("dashboard_kompas_home", `aanbeveling_${domain}`);
    onOpenDomain(domain);
  };

  return (
    <section
      aria-label="Aanbevolen"
      className="mt-5 border-t border-white/10 pt-4"
      style={{ fontFamily: "var(--f-sans)" }}
    >
      <div className="min-w-0">
        <h3 className="m-0 font-serif text-[17px] leading-snug text-[#F1EFE8]">Aanbevolen</h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-[#7E8C82] text-pretty">
          {herkomstLine(domain, data?.domainCheckDaysAgo?.[domain])} Je focus ligt op{" "}
          {pillar.label.toLowerCase()} — daar kijken we hier naar.
        </p>
      </div>

      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Open ${pillar.label} op prioriteit ${layer.id}`}
        className="group mt-3.5 block w-full cursor-pointer rounded-xl border border-[rgba(200,149,108,0.4)] bg-[rgba(200,149,108,0.06)] p-3.5 text-left transition hover:border-[rgba(200,149,108,0.65)] hover:bg-[rgba(200,149,108,0.1)]"
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: pillar.color }}
          />
          <span className="min-w-0 flex-1 truncate text-[11.5px] text-[#9FB0A6]">
            {pillar.label}
          </span>
          <span
            className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em]"
            style={{ color: WINST }}
          >
            {stateLabel ? `Prioriteit ${layer.id} · ${stateLabel}` : `Prioriteit ${layer.id}`}
          </span>
        </span>

        <span className="mt-1.5 block font-serif text-[16px] leading-tight text-[#F1EFE8]">
          {layer.name}
        </span>

        {reason ? (
          <span className="mt-2.5 block border-l border-white/10 pl-2.5">
            {reason.kind === "bewijs" ? (
              <>
                <span className="block text-[11px] leading-snug text-[#CDD7D0]">
                  <span className="font-semibold">{reason.label}:</span> {reason.answerLabel}
                  {reason.benchmarkLabel ? (
                    <span className="text-[#7E8C82]"> · {reason.benchmarkLabel}</span>
                  ) : null}
                </span>
                <span className="mt-1 block text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                  {reason.whyLine}
                </span>
              </>
            ) : (
              <span className="block text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                {reason.line}
              </span>
            )}
          </span>
        ) : null}

        {action ? (
          <span className="mt-3 block rounded-lg border border-white/[0.07] bg-black/20 px-3 py-2.5">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
              Wat hier klaarstaat · gratis
            </span>
            <span className="mt-1 block text-[13px] leading-snug text-[#F1EFE8] text-pretty">
              {action}
            </span>
          </span>
        ) : null}

        <span className="mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#9CC5A9]">
          Open op je ladder
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            <Icons.ChevronRight s={14} />
          </span>
        </span>
      </button>
    </section>
  );
}
