"use client";

import { useEffect, useState, type ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import DoelInvoerSheet, { type DoelInvoerInhoud } from "@/components/dashboard/doelen/DoelInvoerSheet";
import GevolgdeStoffenKiezer from "@/components/dashboard/doelen/GevolgdeStoffenKiezer";
import { trackEvent } from "@/lib/ga4";
import {
  isGeldigPercentage,
  isGeldigeCalorieen,
  type MacroDoelen,
} from "@/lib/account-macro-doelen";
import {
  isGeldigEiwitDoel,
  isGeldigGewicht,
  type Voedingsdoelen,
  type VoedingsdoelenWeergave,
} from "@/lib/account-voedingsdoelen";
import { fetchMacroDoelen, postMacroDoelen } from "@/lib/macro-doelen-client";
import { fetchVoedingsdoelen, postVoedingsdoelen } from "@/lib/voedingsdoelen-client";

/**
 * Je doelen als lijst: label links, waarde rechts, tikken opent één veld in
 * een paneel van onderen. Vervangt de drie formulierkaarten met een eigen
 * Opslaan-knop per veld (5 okt 2026, BESLUIT_VOEDING_EN_DOELEN_IN_MEER_2026-10).
 *
 * De regels van die kaarten blijven:
 * - Het eiwitdoel is een overschrijving van een richtlijn (PROT-AGE/ESPEN) die
 *   server-side wordt gerekend; de richtlijn staat er altijd naast.
 * - Calorieën en macro's zijn 100% eigen invoer: leeg is "niet ingesteld",
 *   nooit een vooringevulde verdeling, en − en + beginnen pas als je typt.
 * - Het check-gewicht bereikt de browser niet; zonder eigen gewicht staat er
 *   "uit je check" in plaats van het getal.
 */

const BELASTING_OPTIES: ReadonlyArray<{ waarde: number; label: string; uitleg: string }> = [
  { waarde: 1, label: "Weinig", uitleg: "Nauwelijks kracht- of duurtraining" },
  { waarde: 2, label: "Licht", uitleg: "Af en toe, één of twee keer per week" },
  { waarde: 3, label: "Actief", uitleg: "Regelmatig, drie tot vier keer per week" },
  { waarde: 4, label: "Zwaar", uitleg: "Bijna dagelijks of gericht op opbouw" },
];

type Status =
  | { fase: "laden" }
  | { fase: "klaar"; voeding: VoedingsdoelenWeergave; macro: MacroDoelen }
  | { fase: "fout"; bericht: string };

type OpenSheet = DoelInvoerInhoud | null;

function Sectie({ titel, uitleg, children }: { titel: string; uitleg?: string; children: ReactNode }) {
  return (
    <section className="grid gap-2">
      <div className="grid gap-0.5 px-1">
        <h2 className="m-0 font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
          {titel}
        </h2>
        {uitleg ? (
          <p className="m-0 text-[12.5px] leading-relaxed text-[var(--text-subtle)]">{uitleg}</p>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">{children}</div>
    </section>
  );
}

function Regel({
  label,
  waarde,
  gedempt = false,
  onKies,
}: {
  label: string;
  waarde: string;
  gedempt?: boolean;
  onKies?: () => void;
}) {
  const inhoud = (
    <>
      <span className="text-[15px] text-[var(--text)]">{label}</span>
      <span className="flex items-center gap-1.5">
        <span
          className={`text-right text-[15px] ${
            gedempt ? "text-[var(--text-subtle)]" : onKies ? "text-[#8FC09D]" : "text-[var(--text)]"
          }`}
        >
          {waarde}
        </span>
        {onKies ? (
          <span aria-hidden="true" className="text-[var(--text-subtle)]">
            <Icons.ChevronRight s={16} />
          </span>
        ) : null}
      </span>
    </>
  );
  const klassen =
    "flex min-h-[54px] w-full items-center justify-between gap-3 border-0 border-b border-white/[0.07] bg-transparent px-4 py-3 text-left last:border-b-0";
  return onKies ? (
    <button type="button" onClick={onKies} className={`${klassen} cursor-pointer transition-colors hover:bg-white/[0.04]`}>
      {inhoud}
    </button>
  ) : (
    <div className={klassen}>{inhoud}</div>
  );
}

export default function DoelenLijst() {
  const [status, setStatus] = useState<Status>({ fase: "laden" });
  const [sheet, setSheet] = useState<OpenSheet>(null);

  useEffect(() => {
    let actief = true;
    Promise.all([fetchVoedingsdoelen(), fetchMacroDoelen()])
      .then(([voeding, macro]) => {
        if (actief) setStatus({ fase: "klaar", voeding, macro });
      })
      .catch((error: unknown) => {
        if (!actief) return;
        setStatus({
          fase: "fout",
          bericht: error instanceof Error ? error.message : "Kon je doelen niet laden.",
        });
      });
    return () => {
      actief = false;
    };
  }, []);

  if (status.fase === "laden") {
    return <p className="m-0 px-1 text-[14px] text-[var(--text-muted)]">Je doelen worden geladen…</p>;
  }
  if (status.fase === "fout") {
    return <p className="m-0 px-1 text-[14px] text-[var(--text)]">{status.bericht}</p>;
  }

  const { voeding, macro } = status;
  const { doelen, richtlijn, gewichtBron } = voeding;

  async function bewaarVoeding(patch: Partial<Voedingsdoelen>, setting: string) {
    const bijgewerkt = await postVoedingsdoelen(patch);
    setStatus((huidig) => (huidig.fase === "klaar" ? { ...huidig, voeding: bijgewerkt } : huidig));
    trackEvent("voedingsdoel_aangepast", { setting, surface: "voedingsdoelen" });
  }

  async function bewaarMacro(patch: Partial<MacroDoelen>, setting: string) {
    const bijgewerkt = await postMacroDoelen(patch);
    setStatus((huidig) => (huidig.fase === "klaar" ? { ...huidig, macro: bijgewerkt } : huidig));
    trackEvent("macro_doel_aangepast", { setting, surface: "macro_doelen" });
  }

  function open(setting: string, props: DoelInvoerInhoud) {
    trackEvent("doelen_regel_geopend", { setting });
    setSheet(props);
  }

  const gewichtTekst =
    doelen.gewichtKg !== null
      ? `${String(doelen.gewichtKg).replace(".", ",")} kg`
      : gewichtBron === "check"
        ? "Uit je check"
        : "Niet ingevuld";
  const belasting = BELASTING_OPTIES.find((optie) => optie.waarde === doelen.trainingsbelasting);
  const procent = (waarde: number | null) => (waarde === null ? "Niet ingesteld" : `${waarde}%`);

  const percentageSheet = (titel: string, veld: "koolhydratenPct" | "vetPct" | "eiwitPct", setting: string) =>
    open(setting, {
      soort: "getal",
      titel,
      eenheid: "%",
      waarde: macro[veld],
      stap: 5,
      isGeldig: isGeldigPercentage,
      foutTekst: "Vul een percentage tussen 0 en 100 in.",
      uitleg: "Jouw eigen verdeling — de drie hoeven niet op te tellen tot 100.",
      leegUitleg: "Leeg betekent: niet ingesteld.",
      onBewaar: (waarde) => bewaarMacro({ [veld]: waarde }, setting),
    });

  return (
    <div className="grid gap-7">
      <Sectie titel="Je lichaam" uitleg="Hiermee rekenen we je eiwitrichtlijn uit. Leeg laten betekent: je laatste check.">
        <Regel
          label="Gewicht"
          waarde={gewichtTekst}
          gedempt={doelen.gewichtKg === null}
          onKies={() =>
            open("gewicht", {
              soort: "getal",
              titel: "Gewicht",
              eenheid: "kg",
              waarde: doelen.gewichtKg,
              stap: 0.5,
              decimalen: 1,
              isGeldig: isGeldigGewicht,
              foutTekst: "Vul een gewicht tussen 40 en 250 kg in.",
              leegUitleg:
                gewichtBron === "check"
                  ? "Je rekent nu met het gewicht uit je laatste check."
                  : "Leeg betekent: gebruik je laatste check.",
              onBewaar: (waarde) => bewaarVoeding({ gewichtKg: waarde }, "gewicht"),
            })
          }
        />
        <Regel
          label="Hoe zwaar je traint"
          waarde={belasting?.label ?? "Uit je check"}
          gedempt={!belasting}
          onKies={() =>
            open("trainingsbelasting", {
              soort: "keuze",
              titel: "Hoe zwaar train je?",
              waarde: doelen.trainingsbelasting,
              opties: BELASTING_OPTIES,
              leegLabel: "Uit je check",
              leegUitleg: "Reken met wat je in je laatste check opgaf.",
              onBewaar: (waarde) => bewaarVoeding({ trainingsbelasting: waarde }, "trainingsbelasting"),
            })
          }
        />
      </Sectie>

      <Sectie
        titel="Eiwit"
        uitleg="Een richtlijn op basis van je gewicht, training en leeftijd — geen medisch advies."
      >
        <Regel
          label="Richtlijn voor jou"
          waarde={richtlijn ? `${richtlijn.gramsLow}–${richtlijn.gramsHigh} g` : "Nog geen richtlijn"}
          gedempt={!richtlijn}
        />
        <Regel
          label="Eigen eiwitdoel"
          waarde={doelen.eiwitDoelG !== null ? `${doelen.eiwitDoelG} g` : "Volgt de richtlijn"}
          gedempt={doelen.eiwitDoelG === null}
          onKies={() =>
            open("eiwitdoel", {
              soort: "getal",
              titel: "Eigen eiwitdoel",
              eenheid: "g",
              waarde: doelen.eiwitDoelG,
              stap: 5,
              start: richtlijn?.gramsLow,
              isGeldig: isGeldigEiwitDoel,
              foutTekst: "Vul een eiwitdoel tussen 20 en 400 gram in.",
              uitleg: richtlijn
                ? `Je richtlijn is ${richtlijn.gramsLow}–${richtlijn.gramsHigh} g per dag.`
                : undefined,
              leegUitleg: "Leeg betekent: volg de richtlijn.",
              onBewaar: (waarde) => bewaarVoeding({ eiwitDoelG: waarde }, "eiwitdoel"),
            })
          }
        />
      </Sectie>

      <Sectie titel="Calorieën en macro's" uitleg="Jouw eigen doel — wij rekenen hier niets voor uit.">
        <Regel
          label="Calorieën"
          waarde={macro.calorieenKcal !== null ? `${macro.calorieenKcal} kcal` : "Niet ingesteld"}
          gedempt={macro.calorieenKcal === null}
          onKies={() =>
            open("calorieen", {
              soort: "getal",
              titel: "Calorieën per dag",
              eenheid: "kcal",
              waarde: macro.calorieenKcal,
              stap: 50,
              isGeldig: isGeldigeCalorieen,
              foutTekst: "Vul een getal tussen 500 en 6000 kcal in.",
              leegUitleg: "Leeg betekent: geen richtlijn ingesteld.",
              onBewaar: (waarde) => bewaarMacro({ calorieenKcal: waarde }, "calorieen"),
            })
          }
        />
        <Regel
          label="Koolhydraten"
          waarde={procent(macro.koolhydratenPct)}
          gedempt={macro.koolhydratenPct === null}
          onKies={() => percentageSheet("Koolhydraten", "koolhydratenPct", "koolhydraten")}
        />
        <Regel
          label="Vet"
          waarde={procent(macro.vetPct)}
          gedempt={macro.vetPct === null}
          onKies={() => percentageSheet("Vet", "vetPct", "vet")}
        />
        <Regel
          label="Eiwit"
          waarde={procent(macro.eiwitPct)}
          gedempt={macro.eiwitPct === null}
          onKies={() => percentageSheet("Eiwit", "eiwitPct", "eiwit")}
        />
      </Sectie>

      <section id="volgen" aria-labelledby="volgen-titel" className="grid scroll-mt-6 gap-2">
        <div className="grid gap-0.5 px-1">
          <h2
            id="volgen-titel"
            className="m-0 font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
          >
            Wat je volgt
          </h2>
          <p className="m-0 text-[12.5px] leading-relaxed text-[var(--text-subtle)]">
            Naast magnesium, eiwit, omega-3, zink en vitamine D. Gekozen stoffen staan in Je patroon
            met hun gemiddelde en het deel van de referentie-inname, zonder oordeel.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <GevolgdeStoffenKiezer surface="doelen" />
        </div>
      </section>

      {sheet ? <DoelInvoerSheet {...sheet} onSluit={() => setSheet(null)} /> : null}
    </div>
  );
}
