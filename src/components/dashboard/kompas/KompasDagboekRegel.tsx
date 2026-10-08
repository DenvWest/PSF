"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { clarityTag } from "@/lib/clarity";
import { gaNaarDashboard } from "@/lib/dagboek-deeplink";
import { trackEvent } from "@/lib/ga4";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import {
  buildDagboekWinstRegel,
  DAGBOEKREGEL_MIN_DAGEN,
  DAGBOEKREGEL_VENSTER_DAGEN,
} from "@/lib/kompas-winst-dagboek";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { useKernstofNormen } from "@/lib/use-kernstof-normen";

const PATROON_HREF = "/dashboard?tab=voortgang&sectie=stof&periode=7";
const DAGBOEK_HREF = "/dashboard?tab=vandaag";

/**
 * "Uit je dagboek" onder de winst-laag van voeding: wat je dagboek de laatste
 * zeven dagen aantoonde, tegen je eigen norm. Eigen label naast "Grootste
 * winst" — dat blijft de uitkomst van de check
 * (`src/lib/kompas-winst-dagboek.ts`).
 *
 * Zonder antwoord van het dagboek (niet ingelogd, netwerkfout) toont dit niets:
 * "0 van 7 dagen" zou een uitspraak zijn over iemand wiens data we niet kennen.
 */
export default function KompasDagboekRegel() {
  const normen = useKernstofNormen();
  const [dagen, setDagen] = useState<DagboekDag[] | null>(null);
  const vandaag = todayInAgendaTimezone();

  useEffect(() => {
    let afgebroken = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/nutrition-daybook", { credentials: "include" });
        if (!response.ok) return;
        const body = (await response.json()) as { days?: DagboekDag[] };
        if (!afgebroken) setDagen(body.days ?? []);
      } catch {
        /* zonder dagboek blijft de regel weg */
      }
    })();
    return () => {
      afgebroken = true;
    };
  }, []);

  const regel = useMemo(
    () => (dagen ? buildDagboekWinstRegel(dagen, vandaag, normen) : null),
    [dagen, vandaag, normen],
  );

  useEffect(() => {
    if (!regel) return;
    trackEvent("dashboard_kompas_context_view", { zone: "dagboek", staat: regel.kind });
  }, [regel]);

  if (!regel) return null;

  const naarDagboek = regel.kind === "te_weinig";
  const href = naarDagboek ? DAGBOEK_HREF : PATROON_HREF;

  return (
    <div className="mt-2.5 border-t border-white/10 pt-2" data-testid="kompas-dagboekregel">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7E8C82]">
        Uit je dagboek · {DAGBOEKREGEL_VENSTER_DAGEN} dagen
      </span>

      {regel.kind === "stoffen" ? (
        <ul className="m-0 mt-1 flex list-none flex-col gap-0.5 p-0">
          {regel.stoffen.map((stof) => (
            <li key={stof.nutrient} className="text-[11.5px] leading-snug text-[#C9D4CC] text-pretty">
              <span className="font-semibold">{stof.label}:</span> minstens {stof.benaderd ? "≈ " : ""}
              {stof.aandeelPct}% van je norm{" "}
              <span className="text-[#7E8C82]">({stof.normLabel})</span>
            </li>
          ))}
        </ul>
      ) : null}

      {regel.kind === "op_norm" ? (
        <p className="m-0 mt-1 text-[11.5px] leading-snug text-[#C9D4CC] text-pretty">
          De stoffen die je dagboek kan aantonen zitten op of boven je norm.
        </p>
      ) : null}

      {regel.kind === "te_weinig" ? (
        <p className="m-0 mt-1 text-[11.5px] leading-snug text-[#9FB0A6] text-pretty">
          {regel.dagen} van {DAGBOEKREGEL_VENSTER_DAGEN} dagen ingevuld. Vanaf{" "}
          {DAGBOEKREGEL_MIN_DAGEN} dagen laat dit zien wat je at.
        </p>
      ) : null}

      <Link
        href={href}
        onClick={(event) => {
          event.preventDefault();
          trackEvent("dashboard_kompas_context_click", {
            zone: "dagboek",
            domain: "voeding",
            staat: regel.kind,
          });
          clarityTag("dashboard_kompas_context", `dagboek_${regel.kind}`);
          gaNaarDashboard(href);
        }}
        className="mt-1.5 inline-flex min-h-9 items-center text-[12px] font-semibold text-[#5A8F6A] no-underline"
      >
        {naarDagboek ? "Vul je dagboek aan →" : "Bekijk in Je patroon →"}
      </Link>
    </div>
  );
}
