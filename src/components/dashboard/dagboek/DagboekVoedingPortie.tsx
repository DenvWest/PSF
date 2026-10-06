"use client";

import { catalogEntry } from "@/data/nutrition/food-catalog";
import DagboekProductLevert from "@/components/dashboard/dagboek/DagboekProductLevert";
import PortieRijenScherm from "@/components/dashboard/dagboek/PortieRijenScherm";
import * as Icons from "@/components/app/icons";
import type { DagboekFavoriet } from "@/lib/account-dagboek-favorieten";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * De portie-invoer voor een voedingsmiddel uit de catalogus: dezelfde rijen als
 * een NEVO-product (`PortieRijenScherm`), met daaronder precies wat het
 * productdetail na het toevoegen toont (`DagboekProductLevert`): de vijf
 * kernstoffen en het etiket, meeschalend met de portie.
 * Supplementen houden `DagboekPortieInvoer` (telt in hele porties).
 */
export default function DagboekVoedingPortie({
  itemKey,
  moment,
  favorieten,
  onBevestig,
  onBewaarFavoriet,
  onVerwijderFavoriet,
  onTerug,
  busy = false,
  busyFavoriet = false,
}: {
  itemKey: string;
  moment: EetmomentId;
  favorieten: readonly DagboekFavoriet[];
  onBevestig: (moment: EetmomentId, grams: number) => void;
  onBewaarFavoriet: (bron: "voeding", key: string) => void;
  onVerwijderFavoriet: (bron: "voeding", key: string) => void;
  onTerug: () => void;
  busy?: boolean;
  busyFavoriet?: boolean;
}) {
  const entry = catalogEntry(itemKey);

  if (!entry) {
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0 text-[12px] text-[var(--vd-ink-3)]">Dit product bestaat niet (meer).</p>
        <button
          type="button"
          onClick={onTerug}
          className="w-fit cursor-pointer rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[12px] text-[var(--vd-ink-2)]"
        >
          Terug
        </button>
      </div>
    );
  }

  const bewaard = favorieten.some((f) => f.bron === "voeding" && f.key === itemKey);

  return (
    <PortieRijenScherm
      naam={entry.labelNl}
      moment={moment}
      startGram={entry.porties[0]?.grams ?? 100}
      snelkeuzes={entry.porties}
      busy={busy}
      onBevestig={onBevestig}
      onTerug={onTerug}
      kopActie={
        <button
          type="button"
          disabled={busyFavoriet}
          onClick={() => (bewaard ? onVerwijderFavoriet("voeding", itemKey) : onBewaarFavoriet("voeding", itemKey))}
          aria-label={bewaard ? `Verwijder ${entry.labelNl} uit favorieten` : `Bewaar ${entry.labelNl} als favoriet`}
          aria-pressed={bewaard}
          className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
            bewaard ? "text-[var(--vd-amber)]" : "text-[var(--vd-ink-4)] hover:text-[var(--vd-amber)]"
          }`}
        >
          <Icons.Star s={18} filled={bewaard} />
        </button>
      }
    >
      {(totaalGram) => <DagboekProductLevert item={{ moment, bron: "voeding", key: itemKey, grams: totaalGram }} />}
    </PortieRijenScherm>
  );
}
