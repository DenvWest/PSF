"use client";

/**
 * De horizontaal scrollbare sub-tab-balk boven het dagboek-overzicht — Laag B
 * (macro/voedingsstoffen-tabbladen naast de bestaande eetmomenten).
 *
 * Naar `PatroonSubtabs.tsx`, met de a11y-koppeling (`id`/`aria-labelledby`
 * tussen tab en panel) geleend van `DagboekCatalogusZoek.tsx` — die koppeling
 * mist `PatroonSubtabs` nog.
 *
 * "Vandaag" is de bestaande inhoud (hero, nutriëntbalken, weekstrip,
 * eetmomenten, `DagboekSupermarktSectie`) — geen nieuw label ervoor nodig,
 * het is gewoon de eerste tab.
 *
 * Geen los "Calorieën"-tabblad (27 sep, herzien): de calorie-ring
 * (`DagboekMacroRing`) staat op "Macro's" — kcal in het midden, macro's als
 * segmenten eromheen, zoals de MyFitnessPal-referentie. Een apart tabblad
 * zonder eigen invoeringang toonde alleen de weekstrip en niets bruikbaars.
 */

export type DagboekSectie = "vandaag" | "voedingsstoffen" | "macros";

const SECTIES: { id: DagboekSectie; label: string }[] = [
  { id: "vandaag", label: "Vandaag" },
  { id: "voedingsstoffen", label: "Voedingsstoffen" },
  { id: "macros", label: "Macro's" },
];

export default function DagboekSubtabs({
  actief,
  onKies,
}: {
  actief: DagboekSectie;
  onKies: (sectie: DagboekSectie) => void;
}) {
  return (
    <div
      className="vd-subtabs"
      role="tablist"
      aria-label="Onderdelen van je dagboek"
    >
      {SECTIES.map((sectie) => (
        <button
          key={sectie.id}
          type="button"
          role="tab"
          id={`dagboek-subtab-${sectie.id}`}
          aria-selected={actief === sectie.id}
          aria-controls={`dagboek-subtab-paneel-${sectie.id}`}
          onClick={() => onKies(sectie.id)}
        >
          {sectie.label}
        </button>
      ))}
    </div>
  );
}
