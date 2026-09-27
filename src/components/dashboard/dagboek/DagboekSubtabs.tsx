"use client";

/**
 * De horizontaal scrollbare sub-tab-balk boven het dagboek-overzicht — Laag B
 * (calorieën/macro/voedingsstoffen-tabbladen naast de bestaande eetmomenten).
 *
 * Naar `PatroonSubtabs.tsx`, met de a11y-koppeling (`id`/`aria-labelledby`
 * tussen tab en panel) geleend van `DagboekCatalogusZoek.tsx` — die koppeling
 * mist `PatroonSubtabs` nog.
 *
 * "Vandaag" is de bestaande inhoud (hero, nutriëntbalken, weekstrip,
 * eetmomenten, `DagboekSupermarktSectie`) — geen nieuw label ervoor nodig,
 * het is gewoon de eerste tab.
 */

export type DagboekSectie = "vandaag" | "calorieen" | "voedingsstoffen" | "macros";

const SECTIES: { id: DagboekSectie; label: string }[] = [
  { id: "vandaag", label: "Vandaag" },
  { id: "calorieen", label: "Calorieën" },
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
