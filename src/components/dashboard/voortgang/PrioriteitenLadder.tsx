"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

export type PrioriteitLayer = {
  id: number;
  name: string;
  subtitle?: string;
  summary: string;
  actions: readonly string[];
};

type PrioriteitenLadderProps = {
  layers: readonly PrioriteitLayer[];
  intro: string;
  /** Standaard "Kies wat herkenbaar is" — past niet bij elk domein (voeding
   * heeft een volgorde, geen vrije keuze), dus overschrijfbaar per domein. */
  eyebrow?: string;
  /** Alleen doorgeven waar hij expliciet is vastgelegd — nooit hergebruiken tussen domeinen. */
  safetyNetLine?: string;
  domain: string;
  surface: string;
};

/**
 * Zelfselectie in plaats van inferentie, gegeneraliseerd uit
 * ConnectionPriorityOverview (BESLUIT_VERBINDING_SOCIAAL_PRODUCT_V1_2026-08.md
 * §S8): zes prioriteiten, geen afgeleide status. Voor domeinen zonder eigen
 * scoring-engine (stress, verbinding) is dit de eerlijke vorm — winst/ok/
 * watch/wacht-badges zouden een oordeel suggereren dat we niet kunnen
 * onderbouwen. `ConnectionPriorityOverview` zelf blijft ongewijzigd op
 * Kompas staan; dit component is de Voortgang-kant van hetzelfde idee.
 */
export default function PrioriteitenLadder({
  layers,
  intro,
  eyebrow = "Kies wat herkenbaar is",
  safetyNetLine,
  domain,
  surface,
}: PrioriteitenLadderProps) {
  const [openLayer, setOpenLayer] = useState<number | null>(null);

  function handleToggle(id: number) {
    setOpenLayer((current) => {
      const next = current === id ? null : id;
      if (next != null) {
        trackEvent(`${domain}_ladder_layer_open`, { layer: id, surface });
        clarityTag(`${domain}_ladder_layer`, `p${id}`);
      }
      return next;
    });
  }

  return (
    <CockpitTile ariaLabel="Je prioriteiten" eyebrow={eyebrow}>
      <p className="mb-3.5 mt-2.5 max-w-[58ch] text-[13px] leading-relaxed text-[#CDD7D0]">
        {intro}
      </p>

      <div className="flex flex-col gap-2">
        {layers.map((layer) => {
          const isOpen = openLayer === layer.id;
          return (
            <article
              key={layer.id}
              data-layer={layer.id}
              data-open={isOpen ? "true" : undefined}
              className={`relative overflow-hidden rounded-[14px] border bg-black/20 transition-colors ${
                isOpen ? "border-[#5A8F6A]/45 bg-[#5A8F6A]/[0.07]" : "border-white/10"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute bottom-0 left-0 top-0 w-1 ${
                  isOpen ? "bg-[#5A8F6A]" : "bg-white/[0.14]"
                }`}
              />
              <button
                type="button"
                onClick={() => handleToggle(layer.id)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-start gap-3 border-none bg-transparent px-3.5 py-3 pl-5 text-left font-[inherit]"
              >
                <span
                  aria-hidden="true"
                  className="min-w-[34px] shrink-0 pt-[3px] text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#7E8C82]"
                  style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                >
                  P{layer.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-[16px] leading-tight text-[#F1EFE8]">
                    {layer.name}
                  </span>
                  {layer.subtitle ? (
                    <span className="mt-1 block text-[12.5px] leading-snug text-[#9FB0A6]">
                      {layer.subtitle}
                    </span>
                  ) : null}
                </span>
                <span
                  aria-hidden="true"
                  className={`shrink-0 pt-1 text-[13px] text-[#7E8C82] transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                >
                  <Icons.ChevronRight s={15} />
                </span>
              </button>

              {isOpen ? (
                <div className="border-t border-white/[0.06] px-3.5 pb-3.5 pl-5">
                  <p className="mt-3 max-w-[60ch] text-[12.5px] leading-relaxed text-[#CDD7D0]">
                    {layer.summary}
                  </p>
                  {layer.actions.length > 0 ? (
                    <>
                      <p className="mb-2 mt-3.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
                        Wat je kunt doen
                      </p>
                      <ul className="m-0 flex list-none flex-col gap-2 p-0">
                        {layer.actions.map((action) => (
                          <li
                            key={action}
                            className="max-w-[58ch] border-l border-[#5A8F6A]/40 pl-2.5 text-[12.5px] leading-relaxed text-[#9FB0A6]"
                          >
                            {action}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {safetyNetLine ? (
        <p className="mt-4 max-w-[62ch] border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-[#7E8C82]">
          {safetyNetLine}
        </p>
      ) : null}
    </CockpitTile>
  );
}
