"use client";

import { surfaceStyles } from "@/lib/dashboard-surface";
import type { WerkbankPrioriteit } from "@/lib/domein-werkbank";
import type { LeefstijlLayerState } from "@/lib/leefstijl-ladder";

/**
 * De prioriteiten als horizontale strip.
 *
 * **Waarom horizontaal.** De knoppen zijn een volgorde van aanpakken: op
 * voeding eerst invullen, dan zien wat er staat, dan kiezen wat je aanvult.
 * Dat is een route, en een route lees je van links naar rechts.
 *
 * **Waarom er geen sorteerkeuze meer naast staat (3 sep).** Die bood "meeste
 * ruimte eerst" en "meest gemeten eerst" naast de vaste volgorde. Bij zes
 * knoppen was dat al twijfelachtig — de volgorde ís de boodschap, en hem
 * omgooien haalt precies dat weg. Bij drie knoppen is het zinloos: je overziet
 * ze in één blik, en er valt niets te zoeken. `WERKBANK_SORTERING_LABELS` en
 * `sorteerPrioriteiten` blijven in `domein-werkbank.ts` staan voor de
 * domeinen die later wél een lange lijst krijgen.
 */

const STAAT_KLEUR: Record<LeefstijlLayerState, string> = {
  winst: "#C8956C",
  ok: "#5A8F6A",
  watch: "#C99A3C",
  wacht: "rgba(255,255,255,0.16)",
};

export default function PrioriteitStrip({
  prioriteiten,
  actief,
  onKies,
  stateLabels,
}: {
  /** Al in leesvolgorde — de strip bepaalt de volgorde niet zelf. */
  prioriteiten: readonly WerkbankPrioriteit[];
  actief: number | null;
  onKies: (id: number) => void;
  stateLabels?: Record<LeefstijlLayerState, string>;
}) {
  const s = surfaceStyles("dashboard");

  if (prioriteiten.length === 0) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label="Kies een prioriteit"
      className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5"
    >
        {prioriteiten.map((rij) => {
          const aan = actief === rij.id;
          const woord = rij.staat && stateLabels ? stateLabels[rij.staat] : null;
          return (
            <button
              key={rij.id}
              type="button"
              onClick={() => onKies(rij.id)}
              aria-pressed={aan}
              title={woord ? `${rij.naam} — ${woord}` : rij.naam}
              className={`flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] transition-colors ${
                aan ? `${s.chipAan} font-semibold` : s.chipUit
              }`}
            >
              <span
                aria-hidden
                className="inline-block h-[7px] w-[7px] shrink-0 rounded-full border"
                style={{
                  backgroundColor: rij.staat ? STAAT_KLEUR[rij.staat] : "transparent",
                  borderColor: rij.staat
                    ? STAAT_KLEUR[rij.staat]
                    : "rgba(255,255,255,0.22)",
                }}
              />
              <span className="whitespace-nowrap">{rij.naam}</span>
              {rij.isWinst ? (
                <span
                  aria-hidden
                  className="ml-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#C8956C]"
                >
                  winst
                </span>
              ) : null}
            </button>
        );
      })}
    </div>
  );
}
