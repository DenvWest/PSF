"use client";

import type { NutrientId } from "@/data/nutrition/intake-reference";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  itemMomentId,
  itemMomentIdsVoor,
  itemMomentVoor,
  momentKeuzeId,
  momentKeuzeIdsVoorStof,
  momentVoorStof,
} from "@/lib/keuze-product-keuze";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";

/**
 * Wanneer neem of eet je dit: de vier momenten van het dagboek, als chips.
 * Dezelfde kiezer in Vergelijken (direct na "Kies") en in Mijn keuzes ("Je
 * dag"). Een tweede tik op het gekozen moment wist het weer.
 */

const ACTIEF = {
  eten: "!border-[var(--vd-sage)] !bg-[var(--vd-sage-fill)] !text-[var(--vd-sage-2)]",
  supplement: "!border-[var(--vd-accent-2)] !bg-[var(--vd-accent-2-fill)] !text-[var(--vd-accent-2)]",
} as const;

export default function MomentChips({
  moment,
  kant,
  vraag,
  onKies,
}: {
  moment: EetmomentId | null;
  kant: "eten" | "supplement";
  vraag: string;
  onKies: (moment: EetmomentId) => void;
}) {
  return (
    <fieldset className="m-0 mt-2 min-w-0 border-0 p-0">
      <legend className="mb-1 p-0 text-[0.6875rem] text-[var(--vd-ink-3)]">{vraag}</legend>
      <div className="flex flex-wrap gap-1.5">
        {EETMOMENTEN.map((optie) => (
          <button
            key={optie.id}
            type="button"
            aria-pressed={moment === optie.id}
            onClick={() => onKies(optie.id)}
            className={`vd-chip !min-h-[40px] ${moment === optie.id ? ACTIEF[kant] : ""}`}
          >
            {optie.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Het moment opslaan: per voedingsmiddel bij een stof, of per stof voor het supplement. */
export function useMomentOpslag(surface: string) {
  const { items, save, remove } = useVoortgangFavorites();

  const zetEten = (nutrient: NutrientId, key: string, naam: string, moment: EetmomentId) => {
    const wissen = itemMomentVoor(nutrient, key, items) === moment;
    for (const id of itemMomentIdsVoor(nutrient, key, items)) remove(id);
    if (!wissen) {
      save(
        {
          id: itemMomentId(nutrient, key, moment),
          title: `${naam}: bij ${EETMOMENTEN.find((m) => m.id === moment)?.label.toLowerCase() ?? moment}`,
          kind: "activiteit",
          domain: "voeding",
          source: "mijn_keuze",
        },
        surface,
      );
    }
    meld(nutrient, "eten", wissen ? "geen" : moment);
  };

  const zetSupplement = (nutrient: NutrientId, naam: string, moment: EetmomentId) => {
    const wissen = momentVoorStof(nutrient, items, "supplement") === moment;
    for (const id of momentKeuzeIdsVoorStof(nutrient, items, "supplement")) remove(id);
    if (!wissen) {
      save(
        {
          id: momentKeuzeId(nutrient, moment, "supplement"),
          title: `${naam}: bij ${EETMOMENTEN.find((m) => m.id === moment)?.label.toLowerCase() ?? moment}`,
          kind: "supplement",
          domain: "voeding",
          source: "mijn_keuze",
        },
        surface,
      );
    }
    meld(nutrient, "supplement", wissen ? "geen" : moment);
  };

  const meld = (nutrient: NutrientId, kant: "eten" | "supplement", moment: string) => {
    trackEvent("mijn_keuzes_moment", { nutrient, kant, moment, surface });
    clarityTag("mijn_keuzes_moment", `${nutrient}_${kant}_${moment}`);
  };

  return { zetEten, zetSupplement };
}
