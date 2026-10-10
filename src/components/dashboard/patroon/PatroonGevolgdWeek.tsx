"use client";

import PatroonStofRij from "@/components/dashboard/patroon/PatroonStofRij";
import { isStreefStof } from "@/lib/account-kernstof-profiel";
import type { GevolgdeWeekReeks } from "@/lib/nutrition-gevolgde-weken";
import { normLabel, normVoorVeld } from "@/lib/nutrition-normen";
import type { PatroonStof } from "@/lib/nutrition-stof-meting";
import { percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { rondVoedingswaarde, stofNaam } from "@/lib/nutrition-voedingswaarde";
import { useGevolgdeNormen, useKernstofProfiel } from "@/lib/use-kernstof-normen";

/**
 * De gevolgde stoffen over de gekozen periode, onder de kernstoffentabel in
 * Per stof. Zelfde vorm als de kernstoffen: stof · norm · bron, gemiddelde,
 * deel van de norm. Een tik opent hetzelfde stof-detail (jouw bronnen, per
 * maaltijd, rijkste bronnen), zodat een gevolgde stof dezelfde route naar
 * voeding krijgt (`BESLUIT_PATROON_STOF_EN_TREND_2026-10.md` §3).
 *
 * Informatief: de balk blijft neutraal, geen "gehaald"-pil. Een eigen
 * streefwaarde (Je doelen) staat als tweede regel.
 */

function hoofdletter(label: string): string {
  return stofNaam(label);
}

export default function PatroonGevolgdWeek({
  reeksen,
  onOpen,
}: {
  reeksen: readonly GevolgdeWeekReeks[];
  onOpen?: (stof: PatroonStof) => void;
}) {
  const { streefwaarden } = useKernstofProfiel();
  const normen = useGevolgdeNormen();
  if (reeksen.length === 0) return null;

  return (
    <section aria-label="Ook gevolgd">
      <p className="vd-eyebrow m-0 mb-2">Ook gevolgd · tik voor bronnen en norm</p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {reeksen.map((reeks) => {
          const punt = reeks.punten[0];
          const streef = isStreefStof(reeks.veld) ? (streefwaarden[reeks.veld] ?? null) : null;
          const norm = normen ? normVoorVeld(normen, reeks.veld) : null;
          const heeftMeting = punt !== undefined && punt.dagen > 0 && punt.aandeel !== null;
          const regels = [
            punt === undefined || punt.dagen === 0
              ? "nog niets geregistreerd"
              : norm
                ? `${normLabel(norm)} · ${norm.geldtVoor} · ${norm.bron}`
                : reeks.norm !== null
                  ? `norm ${rondVoedingswaarde(reeks.norm)} ${reeks.unit}`
                  : "geen norm · gem. per geregistreerde dag",
            ...(streef !== null
              ? [
                  `eigen streefwaarde ${rondVoedingswaarde(streef)} ${reeks.unit}/dag${punt?.gemiddeld != null && punt.dagen > 0 ? ` · ${percentageADH(punt.gemiddeld / streef)}` : ""}`,
                ]
              : []),
          ];
          return (
            <PatroonStofRij
              key={reeks.veld}
              naam={hoofdletter(reeks.label)}
              waarde={punt?.gemiddeld == null ? "n.o." : `${rondVoedingswaarde(punt.gemiddeld)} ${reeks.unit}`}
              aandeelTekst={punt?.aandeel == null ? "—" : percentageADH(punt.aandeel)}
              aandeel={heeftMeting ? punt.aandeel : null}
              toon="neutraal"
              balkLabel={`${hoofdletter(reeks.label)}, ${punt?.aandeel == null ? "" : percentageADH(punt.aandeel)} van de norm`}
              regels={regels}
              onOpen={() => onOpen?.(reeks.veld)}
            />
          );
        })}
      </ul>
    </section>
  );
}
