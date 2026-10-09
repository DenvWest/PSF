"use client";

import { useEffect, useMemo } from "react";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { trackEvent } from "@/lib/ga4";
import { buildDoelStand, DAGBOEKREGEL_VENSTER_DAGEN } from "@/lib/kompas-winst-dagboek";
import { useDagboekDagen } from "@/lib/use-dagboek-dagen";
import { useEiwitDoel, useGewoneMaaltijden, useKernstofNormen, useVoedingsrichting } from "@/lib/use-kernstof-normen";

function kleineLetter(tekst: string): string {
  return tekst.charAt(0).toLowerCase() + tekst.slice(1);
}

/**
 * De stand van het doel op voeding, onder het ijkpunt: waar je nu staat op de
 * stof die bij je richting hoort (anders de stof met de meeste ruimte), en één
 * voedingsstap voor vandaag. Alleen voeding, alleen vanaf 5 volle dagen —
 * daaronder zegt de winstkaart al hoeveel dagen er staan, dus dit blok zwijgt.
 *
 * Geen supplement hier: de uitgang naar `/beste/*` blijft aan het
 * 30-dagenpatroon gebonden (`BESLUIT_DOEL_IN_ZIJBALK_NAMETING_2026-10.md`).
 */
export default function KompasDoelStand() {
  const normen = useKernstofNormen();
  const richting = useVoedingsrichting();
  const eiwitDoelG = useEiwitDoel();
  const gewone = useGewoneMaaltijden();
  const dagen = useDagboekDagen();
  const vandaag = todayInAgendaTimezone();

  const stand = useMemo(
    () => (dagen ? buildDoelStand(dagen, vandaag, normen, { gewone, richting, eiwitDoelG }) : null),
    [dagen, vandaag, normen, gewone, richting, eiwitDoelG],
  );

  const nutrient = stand?.kind === "stof" ? stand.nutrient : null;
  useEffect(() => {
    if (!nutrient) return;
    trackEvent("dashboard_kompas_context_view", { zone: "doel_stand", staat: "stof", nutrient });
  }, [nutrient]);

  if (stand?.kind !== "stof") return null;

  return (
    <div className="mt-3 border-t border-white/10 pt-2.5" data-testid="kompas-doel-stand">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7E8C82]">
        Je stand · {DAGBOEKREGEL_VENSTER_DAGEN} dagen
      </span>
      <p className="m-0 mt-1 text-[12px] leading-snug text-[#C9D4CC] text-pretty">
        <span className="font-semibold">{stand.label}:</span>{" "}
        {stand.gedekt
          ? `op of boven ${stand.doelLabel}`
          : `minstens ${stand.benaderd ? "≈ " : ""}${stand.aandeelPct}% van ${stand.doelLabel}`}
      </p>
      {stand.richtingKort ? (
        <p className="m-0 mt-1 text-[11.5px] leading-snug text-[#9FB0A6] text-pretty">
          Daarom staat {kleineLetter(stand.label)} voorop.
        </p>
      ) : null}
      {stand.ruimteMoment ? (
        <p className="m-0 mt-1 text-[11.5px] leading-snug text-[#9FB0A6] text-pretty">
          Je {stand.ruimteMoment} levert er weinig van.
        </p>
      ) : null}
      {stand.voorstel ? (
        <p className="m-0 mt-1 text-[11.5px] leading-snug text-[#C9D4CC] text-pretty">
          <span className="font-semibold">Vandaag helpt:</span> {kleineLetter(stand.voorstel)}.
        </p>
      ) : null}
    </div>
  );
}
