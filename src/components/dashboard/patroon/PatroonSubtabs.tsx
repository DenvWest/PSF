"use client";

/**
 * De horizontaal scrollbare sub-tab-balk boven Je patroon.
 *
 * Vorm komt letterlijk uit de MyFitnessPal Voortgang-header: "Samenvatting ·
 * Calorieën · Voedingsstoffen · ..." met een underline op de actieve tab en
 * de rest afgekapt tot je scrollt. Bij ons zijn de secties anders (wij hebben
 * geen calorieën), maar het mechanisme — vier+ secties die niet allemaal
 * tegelijk passen, dus een rij die zijdelings scrollt in plaats van wrapt —
 * is hetzelfde probleem en dezelfde oplossing.
 *
 * Geen `.vd-segment` (dat is de pil-vorm voor Systeem/Licht/Donker): dit is
 * navigatie tussen volwaardige secties, geen instelling met een paar opties.
 */

export type PatroonSectie = "samenvatting" | "week" | "voedingsstoffen" | "trend";

const SECTIES: { id: PatroonSectie; label: string }[] = [
  { id: "samenvatting", label: "Samenvatting" },
  { id: "week", label: "Deze week" },
  { id: "voedingsstoffen", label: "Voedingsstoffen" },
  { id: "trend", label: "Trend" },
];

export default function PatroonSubtabs({
  actief,
  onKies,
}: {
  actief: PatroonSectie;
  onKies: (sectie: PatroonSectie) => void;
}) {
  return (
    <div className="vd-subtabs" role="tablist" aria-label="Onderdelen van Je patroon">
      {SECTIES.map((sectie) => (
        <button
          key={sectie.id}
          type="button"
          role="tab"
          aria-selected={actief === sectie.id}
          onClick={() => onKies(sectie.id)}
        >
          {sectie.label}
        </button>
      ))}
    </div>
  );
}
