"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import {
  CONNECTION_PRIORITY_LAYERS,
  CONNECTION_SAFETY_NET_LINE,
  type ConnectionPriorityId,
} from "@/data/connection/lifestyle-priorities";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

/**
 * Zelfselectie in plaats van inferentie: zolang er geen verbinding-check is,
 * kiest de gebruiker zélf waar het vastloopt en krijgt hij daar de concrete
 * acties bij. Dat geeft dezelfde personalisatie als een ladderfocus, zonder
 * dat wij iets afleiden of opslaan — agency-first, zie
 * BESLUIT_VERBINDING_SOCIAAL_PRODUCT_V1_2026-08.md §S8.
 */
export default function ConnectionPriorityOverview() {
  const [openLayer, setOpenLayer] = useState<ConnectionPriorityId | null>(null);

  function handleToggle(id: ConnectionPriorityId) {
    setOpenLayer((current) => {
      const next = current === id ? null : id;
      if (next != null) {
        trackEvent("verbinding_ladder_layer_open", {
          layer: id,
          surface: "kompas_verbinding",
        });
        clarityTag("verbinding_ladder_layer", `p${id}`);
      }
      return next;
    });
  }

  return (
    <CockpitTile ariaLabel="Waar loopt het bij jou vast" eyebrow="Kies wat herkenbaar is">
      <p className="mb-3.5 mt-2.5 max-w-[58ch] text-[13px] leading-relaxed text-[#CDD7D0]">
        Zes vlakken waarop contact verbetert, van goedkoop naar duur. Wat
        bovenaan staat kost het minst en draagt het meest. Tik aan wat bij jou
        vastloopt.
      </p>

      <div className="flex flex-col gap-2">
        {CONNECTION_PRIORITY_LAYERS.map((layer) => {
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
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-[16px] leading-tight text-[#F1EFE8]">
                    {layer.name}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-snug text-[#9FB0A6]">
                    {layer.subtitle}
                  </span>
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
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <p className="mt-4 max-w-[62ch] border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-[#7E8C82]">
        {CONNECTION_SAFETY_NET_LINE}
      </p>
    </CockpitTile>
  );
}
