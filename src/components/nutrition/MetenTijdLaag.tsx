"use client";

import { useEffect } from "react";
import { clarityTag } from "@/lib/clarity";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { trackEvent } from "@/lib/ga4";
import {
  buildNutritionTijdlaag,
  type TijdlaagRichting,
} from "@/lib/nutrition-tijdlaag";
import type { Meetreeks } from "@/lib/voortgang-meetreeks";
import { surfaceStyles } from "@/lib/dashboard-surface";

const RICHTING: Record<TijdlaagRichting, { teken: string; label: string; className: string }> = {
  vooruit: { teken: "↑", label: "vooruit", className: "text-[#9CC5A9]" },
  achteruit: { teken: "↓", label: "terug", className: "text-[#C8956C]" },
  gelijk: { teken: "→", label: "gelijk", className: "text-[#9FB0A6]" },
  nieuw: { teken: "·", label: "nieuw gemeten", className: "text-[#7E8C82]" },
};

/**
 * P5 Meten & timing — wat er sinds je vorige check bewoog.
 *
 * De laag blijft dicht voor calorieën tellen en eetvensters (§D2: gereedschap,
 * geen fundament). Wat hij wél draagt is de andere betekenis van meten: je
 * eigen reeks. Die stond tot nu toe verstopt achter "Over tijd" per losse rij
 * op P1-P3, terwijl de laag die *Meten* heet leeg was.
 *
 * Bij ≥2 meetmomenten begint het scherm direct bij de rijen — geen eyebrow,
 * samenvatting of datumregel erboven. De kop (kruimelpad + titel) draagt
 * `MetenTijdKop` in het domeinscherm.
 */
export default function MetenTijdLaag({
  meetreeks,
  surface,
}: {
  meetreeks: Meetreeks | null;
  surface: string;
}) {
  const tijdlaag = buildNutritionTijdlaag(meetreeks);
  const { momenten, rijen, laatsteDatum } = tijdlaag;

  useEffect(() => {
    trackEvent("nutrition_tijdlaag_view", {
      surface,
      moments: momenten,
      rows: rijen.length,
    });
    emitAccountClientEvent("nutrition.tijdlaag_viewed", {
      surface,
      moments: momenten,
      rows: rijen.length,
    });
    clarityTag("nutrition_tijdlaag", String(momenten));
  }, [surface, momenten, rijen.length]);

  if (momenten === 0) {
    return (
      <div className={`mt-4 ${surfaceStyles("dashboard").kaart} px-4 py-3.5`}>
        <p className="m-0 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
          Zodra je je eerste voedingscheck hebt gedaan, staat hier je nulpunt. Na de
          tweede zie je wat er bewoog.
        </p>
      </div>
    );
  }

  if (momenten === 1) {
    return (
      <div className={`mt-4 ${surfaceStyles("dashboard").kaart} px-4 py-3.5`}>
        <p className="m-0 text-[13px] font-medium leading-snug text-[#E7EDE8] text-pretty">
          Dit is je nulpunt{laatsteDatum ? ` van ${laatsteDatum}` : ""}.
        </p>
        <p className="mb-0 mt-1.5 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Eén meting laat zien waar je staat, niet welke kant je op gaat. Bij je
          volgende check zetten we ze hier naast elkaar.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {rijen.map((rij) => {
          const richting = RICHTING[rij.richting];
          return (
            <li
              key={rij.key}
              className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-[13px] font-semibold leading-snug text-[#E7EDE8]">
                  {rij.label}
                </span>
                <span className={`text-[11.5px] font-semibold ${richting.className}`}>
                  <span aria-hidden>{richting.teken}</span>{" "}
                  {richting.label}
                </span>
              </div>
              <p className="mb-0 mt-1 text-[12px] leading-relaxed text-[#9FB0A6]">
                {rij.eerder ? (
                  <>
                    <span className="text-[#7E8C82]">{rij.eerder}</span>
                    {" → "}
                    <span className="text-[#CDD7D0]">{rij.nu}</span>
                  </>
                ) : (
                  <>
                    Nu: <span className="text-[#CDD7D0]">{rij.nu}</span> — dit vroegen we
                    de vorige keer nog niet.
                  </>
                )}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="mb-0 mt-3 max-w-[58ch] text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
        Calorieën tellen en eten binnen een tijdvenster blijven hier dicht. Dat zijn
        gereedschappen die pas iets doen als je voedingsbasis en verhoudingen staan.
      </p>
    </div>
  );
}
