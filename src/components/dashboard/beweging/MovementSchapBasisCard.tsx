"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import type { SchapBasisCard } from "@/data/movement/schap-basis-cards";
import { trackEvent } from "@/lib/ga4";

type MovementSchapBasisCardProps = {
  card: SchapBasisCard;
};

/**
 * Eén kaart uit het schap — vorm uit v3.6 `cardHtml()` r.1891: badge,
 * titel, waarom-tekst, kwaliteitsregel, rol, "Bewaar in Favorieten" +
 * "Bekijk ons oordeel". Sessie-lokale bewaar-staat, zelfde reden als
 * MovementFreeActionsTile (P2): geen schap-brede persistentie-beslissing
 * hier stilzwijgend nemen.
 */
export default function MovementSchapBasisCard({ card }: MovementSchapBasisCardProps) {
  const [saved, setSaved] = useState(false);
  const [verdictOpen, setVerdictOpen] = useState(false);

  function handleSave() {
    setSaved(true);
    trackEvent("beweging_schap_kaart_bewaard", { kaart: card.id, surface: "favorieten_beweging" });
  }

  function handleToggleVerdict() {
    const next = !verdictOpen;
    setVerdictOpen(next);
    if (next) {
      trackEvent("beweging_schap_oordeel_open", {
        kaart: card.id,
        surface: "favorieten_beweging",
      });
    }
  }

  return (
    <CockpitTile>
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-md border border-[#5A8F6A]/38 bg-[#5A8F6A]/15 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.09em] text-[#9CC5A9]">
          {card.badge}
        </span>
        <span className="shrink-0 rounded-full border border-[#5A8F6A]/45 bg-[#5A8F6A]/15 px-2.5 py-1 text-[11.5px] font-medium text-[#9CC5A9]">
          Aanrader
        </span>
      </div>
      <h3 className="mt-2.5 font-serif text-[16.5px] leading-tight text-[#F1EFE8]">
        {card.title}
      </h3>
      <p className="mt-1.5 max-w-[52ch] text-[13.5px] leading-relaxed text-[#CDD7D0]">
        {card.why}
      </p>
      <p className="mt-2.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-[#9FB0A6]">
        <Icons.Shield s={13} style={{ color: "#9CC5A9", flexShrink: 0, marginTop: 2 }} />
        {card.quality}
      </p>
      <p className="mt-1 text-[11.5px] text-[#7E8C82]">{card.role}</p>

      <div className="mt-3.5 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-3">
        {saved ? (
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#9CC5A9]">
            <Icons.Check s={14} /> Staat in Favorieten
          </span>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#5A8F6A]/40 bg-[#5A8F6A]/[0.14] px-3 py-1.5 text-[13px] font-semibold text-[#9CC5A9]"
          >
            Bewaar in Favorieten
          </button>
        )}
        <button
          type="button"
          onClick={handleToggleVerdict}
          aria-expanded={verdictOpen}
          className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-medium text-[#9FB0A6]"
        >
          {verdictOpen ? "Verberg ons oordeel" : "Bekijk ons oordeel"}
        </button>
      </div>

      {verdictOpen ? (
        <dl className="mt-3 flex flex-col gap-2.5 rounded-[10px] bg-black/20 px-3.5 py-3">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7E8C82]">
              Gecheckt
            </dt>
            <dd className="m-0 mt-0.5 text-[12.5px] leading-relaxed text-[#9FB0A6]">
              {card.verdict.gecheckt}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7E8C82]">Sterk</dt>
            <dd className="m-0 mt-0.5 text-[12.5px] leading-relaxed text-[#9FB0A6]">
              {card.verdict.sterk}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7E8C82]">Zwak</dt>
            <dd className="m-0 mt-0.5 text-[12.5px] leading-relaxed text-[#9FB0A6]">
              {card.verdict.zwak}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7E8C82]">
              Oordeel
            </dt>
            <dd className="m-0 mt-0.5 text-[12.5px] leading-relaxed text-[#F1EFE8]">
              {card.verdict.oordeel}
            </dd>
          </div>
          <p className="m-0 border-t border-white/[0.07] pt-2 text-[11px] leading-relaxed text-[#7E8C82]">
            {card.verdict.micro}
          </p>
        </dl>
      ) : null}
    </CockpitTile>
  );
}
