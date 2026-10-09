"use client";

import PortieRijenScherm from "@/components/dashboard/dagboek/PortieRijenScherm";
import SupermarktBronRegel from "@/components/dashboard/dagboek/SupermarktBronRegel";
import type { SupermarktProduct } from "@/types/supermarkt-product";
import {
  bedragVanSupermarktveld,
  SUPERMARKT_MACRO_VELDEN,
} from "@/lib/nutrition-supermarkt-items";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * De portie-invoer voor een supermarkt- of NEVO-product (Laag A) — calorie/
 * macro-ring, geen tekort-oordeel. De rijen zelf staan in `PortieRijenScherm`;
 * een `SupermarktProduct` draagt geen portie-definitie (de brondata is per
 * 100 g) en geen `NutrientId`-bijdrage, zie
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §3.
 */
export default function SupermarktPortieInvoer({
  product,
  moment,
  onBevestig,
  onTerug,
  busy = false,
}: {
  /** Het gekozen product, uit het zoekresultaat — het scherm haalt zelf niets op. */
  product: SupermarktProduct;
  moment: EetmomentId;
  onBevestig: (moment: EetmomentId, grams: number) => void;
  onTerug: () => void;
  busy?: boolean;
}) {
  return (
    <PortieRijenScherm
      naam={product.naam}
      moment={moment}
      onBevestig={onBevestig}
      onTerug={onTerug}
      busy={busy}
    >
      {(totaalGram) => (
        <>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="m-0 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--vd-ink-4)]">
              Levert
            </p>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {SUPERMARKT_MACRO_VELDEN.map((veld) => {
                const bedrag = bedragVanSupermarktveld(product, veld.veld, totaalGram);
                return (
                  <li
                    key={veld.veld}
                    className="flex items-center justify-between gap-2 text-[12.5px] text-[var(--vd-ink-2)]"
                  >
                    <span>{veld.label}</span>
                    <span className="font-mono tabular-nums text-[var(--vd-ink)]">
                      {bedrag === null ? "n.o." : `${Math.round(bedrag * 10) / 10} ${veld.unit}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="m-0 text-[10.5px] leading-relaxed text-[var(--vd-ink-4)]">
            Informatief, geen tekort-oordeel — dit telt niet mee in wat je dagboek verder meet.
          </p>

          <SupermarktBronRegel producten={[product]} berekend />
        </>
      )}
    </PortieRijenScherm>
  );
}
