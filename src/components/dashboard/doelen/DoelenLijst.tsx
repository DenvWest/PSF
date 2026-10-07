"use client";

import { useEffect, useState, type ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import DoelInvoerSheet, { type DoelInvoerInhoud } from "@/components/dashboard/doelen/DoelInvoerSheet";
import GevolgdeStoffenKiezer from "@/components/dashboard/doelen/GevolgdeStoffenKiezer";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { onderzoekKort, onderzoekLang } from "@/data/nutrition/onderzoek-per-stof";
import type { Activiteit, KernstofMetNorm } from "@/data/nutrition/voedingsnormen";
import { trackEvent } from "@/lib/ga4";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";
import {
  isGeldigeLeeftijd,
  isGeldigeStreefwaarde,
  isStreefStof,
  LEEG_KERNSTOF_PROFIEL,
  STREEFWAARDE_GRENS,
  type KernstofProfiel,
} from "@/lib/account-kernstof-profiel";
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
import { normLabel, normVoorVeld, STANDAARD_GEVOLGDE_NORMEN, STANDAARD_NORMEN } from "@/lib/nutrition-normen";
import { VOEDINGSWAARDE_VELDEN } from "@/lib/nutrition-voedingswaarde";
import { useGevolgdeStoffen } from "@/lib/use-gevolgde-stoffen";
import { zetKernstofWeergave } from "@/lib/use-kernstof-normen";
import {
  fetchVoedingsdoelen,
  postKernstofProfiel,
  postVoedingsdoelen,
} from "@/lib/voedingsdoelen-client";

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

const GEVOLGD_STAP: Record<string, { stap: number; decimalen: 0 | 1 }> = {
  potassiumMg: { stap: 50, decimalen: 0 },
  calciumMg: { stap: 50, decimalen: 0 },
  ironMg: { stap: 0.5, decimalen: 1 },
  vitaminB12µg: { stap: 0.5, decimalen: 1 },
  vitaminCMg: { stap: 5, decimalen: 0 },
};

const BELASTING_OPTIES: ReadonlyArray<{ waarde: number; label: string; uitleg: string }> = [
  { waarde: 1, label: "Weinig", uitleg: "Nauwelijks kracht- of duurtraining" },
  { waarde: 2, label: "Licht", uitleg: "Af en toe, één of twee keer per week" },
  { waarde: 3, label: "Actief", uitleg: "Regelmatig, drie tot vier keer per week" },
  { waarde: 4, label: "Zwaar", uitleg: "Bijna dagelijks of gericht op opbouw" },
];

/** Eetpatroon als vaste combinaties: één tik in plaats van drie vinkjes. Leeg = alle drie. */
const EETPATROON_OPTIES: ReadonlyArray<{ waarde: number; label: string; uitleg: string; maaltijden: EetmomentId[] }> = [
  { waarde: 1, label: "Lunch en avondeten", uitleg: "Je slaat ontbijt meestal over, bijvoorbeeld bij periodiek vasten", maaltijden: ["lunch", "avondeten"] },
  { waarde: 2, label: "Ontbijt en avondeten", uitleg: "Je slaat lunch meestal over", maaltijden: ["ontbijt", "avondeten"] },
  { waarde: 3, label: "Ontbijt en lunch", uitleg: "Je slaat avondeten meestal over", maaltijden: ["ontbijt", "lunch"] },
  { waarde: 4, label: "Eén maaltijd: avondeten", uitleg: "Je eet één keer per dag", maaltijden: ["avondeten"] },
];

function eetpatroonCode(gewone: readonly EetmomentId[] | null): number | null {
  if (!gewone) return null;
  return EETPATROON_OPTIES.find((optie) => optie.maaltijden.join() === gewone.join())?.waarde ?? null;
}

function eetpatroonLabel(gewone: readonly EetmomentId[] | null): string {
  if (!gewone) return "Ontbijt, lunch en avondeten";
  const namen = [...gewone];
  const tekst = namen.length === 1 ? namen[0]! : `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

const GESLACHT_OPTIES = [
  { waarde: 1, label: "Man", uitleg: "Magnesium 350 mg, zink 13 mg, ijzer 11 mg per dag" },
  { waarde: 2, label: "Vrouw", uitleg: "Magnesium 300 mg, zink 10 mg, ijzer 16 mg per dag" },
] as const;

const ACTIVITEIT_OPTIES = [
  { waarde: 1, label: "Zittend", uitleg: "Het grootste deel van de dag zittend, bijvoorbeeld kantoorwerk" },
  { waarde: 2, label: "Licht actief", uitleg: "Een groot deel van de dag staand, bijvoorbeeld leerkracht of winkel" },
  { waarde: 3, label: "Actief", uitleg: "Een groot deel van de dag licht fysiek bezig, bijvoorbeeld horeca of postbode" },
  { waarde: 4, label: "Zeer actief", uitleg: "Een groot deel van de dag zwaar fysiek werk, bijvoorbeeld bouw of fietskoerier" },
] as const;

const VOEDINGSWIJZE_OPTIES = [
  { waarde: 1, label: "Vegetarisch", uitleg: "Zink 14 / 11 mg (meer fytaat); geen vlees of vis bij de bronnen" },
  { waarde: 2, label: "Veganistisch", uitleg: "Zink 16,3 / 12,7 mg (veel fytaat); ook geen zuivel of eieren" },
] as const;

const MENSTRUATIE_OPTIES = [
  { waarde: 1, label: "Ja", uitleg: "IJzer 16 mg per dag" },
  { waarde: 2, label: "Onregelmatig", uitleg: "IJzer 16 mg per dag: zolang er menstruaties zijn, geldt de hogere norm" },
  { waarde: 3, label: "Nee, niet meer", uitleg: "IJzer 11 mg per dag" },
] as const;

const KERNSTOFFEN_MET_NORM: ReadonlyArray<{ stof: KernstofMetNorm; stap: number }> = [
  { stof: "magnesium", stap: 10 },
  { stof: "zinc", stap: 1 },
  { stof: "omega3", stap: 50 },
  { stof: "vitamin_d", stap: 5 },
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
  onder,
  gedempt = false,
  onKies,
}: {
  label: string;
  waarde: string;
  /** Tweede regel onder het label: onderzochte zone en bovengrens. */
  onder?: string | null;
  gedempt?: boolean;
  onKies?: () => void;
}) {
  const inhoud = (
    <>
      <span className="grid gap-0.5">
        <span className="text-[15px] text-[var(--text)]">{label}</span>
        {onder ? <span className="text-[12px] leading-snug text-[var(--text-subtle)]">{onder}</span> : null}
      </span>
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
  const { stoffen: gevolgdeVelden } = useGevolgdeStoffen();

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
  const kernstofNormen = voeding.kernstofNormen ?? STANDAARD_NORMEN;
  const gevolgdeNormen = voeding.gevolgdeNormen ?? STANDAARD_GEVOLGDE_NORMEN;
  const profiel: KernstofProfiel = voeding.kernstofProfiel ?? LEEG_KERNSTOF_PROFIEL;
  const geslachtCode = profiel.geslacht === "man" ? 1 : profiel.geslacht === "vrouw" ? 2 : null;
  const voedingswijzeCode =
    profiel.voedingswijze === "vegetarisch" ? 1 : profiel.voedingswijze === "veganistisch" ? 2 : null;
  const menstruatieCode =
    profiel.menstruatie === "ja" ? 1 : profiel.menstruatie === "onregelmatig" ? 2 : profiel.menstruatie === "nee" ? 3 : null;

  async function bewaarVoeding(patch: Partial<Voedingsdoelen>, setting: string) {
    const bijgewerkt = await postVoedingsdoelen(patch);
    setStatus((huidig) => (huidig.fase === "klaar" ? { ...huidig, voeding: bijgewerkt } : huidig));
    zetKernstofWeergave(bijgewerkt);
    trackEvent("voedingsdoel_aangepast", { setting, surface: "voedingsdoelen" });
  }

  async function bewaarKernstof(patch: Parameters<typeof postKernstofProfiel>[0], setting: string) {
    const bijgewerkt = await postKernstofProfiel(patch);
    setStatus((huidig) => (huidig.fase === "klaar" ? { ...huidig, voeding: bijgewerkt } : huidig));
    zetKernstofWeergave(bijgewerkt);
    trackEvent("kernstof_profiel_aangepast", { setting, surface: "doelen" });
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
        <Regel
          label="Leeftijd"
          waarde={
            profiel.leeftijd !== null
              ? `${profiel.leeftijd} jaar`
              : profiel.zeventigPlus
                ? "70 of ouder"
                : voeding.checkLeeftijdsband
                  ? `Uit je check: ${voeding.checkLeeftijdsband}`
                  : "Niet ingevuld"
          }
          gedempt={profiel.leeftijd === null}
          onKies={() =>
            open("leeftijd", {
              soort: "getal",
              titel: "Leeftijd",
              eenheid: "jaar",
              waarde: profiel.leeftijd,
              stap: 1,
              decimalen: 0,
              start: 40,
              isGeldig: (waarde) => waarde === null || isGeldigeLeeftijd(waarde),
              foutTekst: "Vul een leeftijd tussen 18 en 110 jaar in.",
              uitleg:
                "Leeftijd verandert calcium (1000 mg tot 25, 1100 mg voor vrouwen vanaf 51, 1200 mg vanaf 70), vitamine D (20 µg vanaf 70), de eiwitondergrens (1,2 g/kg vanaf 65) en je vezelnorm.",
              leegUitleg: voeding.checkLeeftijdsband
                ? `Leeg betekent: je leeftijdsband uit de check (${voeding.checkLeeftijdsband}).`
                : "Leeg betekent: zonder leeftijd rekenen we met de hogere waarden.",
              onBewaar: (waarde) => bewaarKernstof({ leeftijd: waarde }, "leeftijd"),
            })
          }
        />
        <Regel
          label="Hoe actief je dag is"
          waarde={ACTIVITEIT_OPTIES.find((optie) => optie.waarde === profiel.activiteit)?.label ?? "Niet ingevuld"}
          gedempt={profiel.activiteit === null}
          onKies={() =>
            open("activiteit", {
              soort: "keuze",
              titel: "Hoe actief is je dag?",
              waarde: profiel.activiteit,
              opties: ACTIVITEIT_OPTIES,
              leegLabel: "Niet ingevuld",
              leegUitleg: "We rekenen met licht actief. Dit bepaalt je vezelnorm (per MJ energie); sport zelf staat hierboven.",
              onBewaar: (waarde) => bewaarKernstof({ activiteit: (waarde ?? null) as Activiteit | null }, "activiteit"),
            })
          }
        />
      </Sectie>

      <Sectie
        titel="Eetpatroon"
        uitleg="Bepaalt wanneer een dag in Je patroon volledig is. Een losse dag zonder lunch zet je in het dagboek op 'Niet gegeten'."
      >
        <Regel
          label="Je eet meestal"
          waarde={eetpatroonLabel(doelen.gewoneMaaltijden)}
          gedempt={doelen.gewoneMaaltijden === null}
          onKies={() =>
            open("gewone_maaltijden", {
              soort: "keuze",
              titel: "Welke maaltijden eet je meestal?",
              waarde: eetpatroonCode(doelen.gewoneMaaltijden),
              opties: EETPATROON_OPTIES,
              leegLabel: "Ontbijt, lunch en avondeten",
              leegUitleg: "De standaard: een dag is volledig met alle drie.",
              onBewaar: (waarde) =>
                bewaarVoeding(
                  { gewoneMaaltijden: EETPATROON_OPTIES.find((optie) => optie.waarde === waarde)?.maaltijden ?? null },
                  "gewone_maaltijden",
                ),
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
          onder={onderzoekKort("protein")}
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

      <Sectie
        titel="Kernstoffen"
        uitleg="De norm komt van de Gezondheidsraad, EFSA of de Noordse aanbevelingen (bij verschil de hoogste) en hangt af van wie je bent. Een eigen streefwaarde staat er in Je patroon naast; 'gehaald' blijft tegen de norm rekenen."
      >
        <Regel
          label="Norm voor"
          waarde={geslachtCode === 1 ? "Man" : geslachtCode === 2 ? "Vrouw" : "Uit je check"}
          gedempt={geslachtCode === null}
          onKies={() =>
            open("norm_geslacht", {
              soort: "keuze",
              titel: "Voor wie geldt de norm?",
              waarde: geslachtCode,
              opties: GESLACHT_OPTIES,
              leegLabel: "Uit je check",
              leegUitleg: "Reken met wat je in je laatste check opgaf. Zonder geslacht: de hogere norm.",
              onBewaar: (waarde) =>
                bewaarKernstof({ geslacht: waarde === 1 ? "man" : waarde === 2 ? "vrouw" : null }, "norm_geslacht"),
            })
          }
        />
        <Regel
          label="Voedingswijze"
          waarde={voedingswijzeCode === 1 ? "Vegetarisch" : voedingswijzeCode === 2 ? "Veganistisch" : "Alles"}
          gedempt={voedingswijzeCode === null}
          onKies={() =>
            open("voedingswijze", {
              soort: "keuze",
              titel: "Hoe eet je?",
              waarde: voedingswijzeCode,
              opties: VOEDINGSWIJZE_OPTIES,
              leegLabel: "Alles",
              leegUitleg: "Zink 13 / 10 mg (NNR 2023). Plantaardig eten bevat meer fytaat, dat zink minder opneembaar maakt.",
              onBewaar: (waarde) =>
                bewaarKernstof(
                  { voedingswijze: waarde === 1 ? "vegetarisch" : waarde === 2 ? "veganistisch" : null },
                  "voedingswijze",
                ),
            })
          }
        />
        {voeding.vraagtMenstruatie ? (
          <Regel
            label="Menstruatie"
            waarde={menstruatieCode === 1 ? "Ja" : menstruatieCode === 2 ? "Onregelmatig" : menstruatieCode === 3 ? "Nee" : "Niet ingevuld"}
            gedempt={menstruatieCode === null}
            onKies={() =>
              open("menstruatie", {
                soort: "keuze",
                titel: "Menstrueer je?",
                waarde: menstruatieCode,
                opties: MENSTRUATIE_OPTIES,
                leegLabel: "Liever niet zeggen",
                leegUitleg:
                  "Alleen voor je ijzernorm (Gezondheidsraad 2018). We bewaren het bij je account, niet in de check, en delen het met niemand. Zonder antwoord: 16 mg.",
                onBewaar: (waarde) =>
                  bewaarKernstof(
                    { menstruatie: waarde === 1 ? "ja" : waarde === 2 ? "onregelmatig" : waarde === 3 ? "nee" : null },
                    "menstruatie",
                  ),
              })
            }
          />
        ) : null}
        {KERNSTOFFEN_MET_NORM.map(({ stof, stap }) => {
          const norm = kernstofNormen[stof];
          const eigen = profiel.streefwaarden[stof] ?? null;
          const label = nutrientReferences[stof].label;
          return (
            <Regel
              key={stof}
              label={label}
              onder={onderzoekKort(stof)}
              waarde={eigen !== null ? `${String(eigen).replace(".", ",")} ${norm.unit} eigen` : `norm ${normLabel(norm)}`}
              gedempt={eigen === null}
              onKies={() =>
                open(`streefwaarde_${stof}`, {
                  soort: "getal",
                  titel: `Eigen streefwaarde ${label.toLowerCase()}`,
                  eenheid: norm.unit,
                  waarde: eigen,
                  stap,
                  decimalen: stof === "vitamin_d" ? 1 : 0,
                  start: norm.waarde,
                  isGeldig: (waarde) => waarde === null || isGeldigeStreefwaarde(stof, waarde),
                  foutTekst: `Vul een waarde tussen 0 en ${STREEFWAARDE_GRENS[stof].max} ${norm.unit} in. ${STREEFWAARDE_GRENS[stof].uitleg}`,
                  uitleg: `Norm: ${normLabel(norm)} per dag voor ${norm.geldtVoor} (${norm.bron}). ${onderzoekLang(stof) ?? ""} Je streefwaarde staat ernaast; 'gehaald' blijft tegen de norm.`,
                  leegUitleg: "Leeg betekent: alleen de norm.",
                  onBewaar: (waarde) => bewaarKernstof({ streefwaarden: { [stof]: waarde } }, `streefwaarde_${stof}`),
                })
              }
            />
          );
        })}
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
            met hun gemiddelde en het deel van je norm, zonder oordeel.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <GevolgdeStoffenKiezer surface="doelen" />
        </div>
        {gevolgdeVelden.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {gevolgdeVelden.map((veld) => {
              const definitie = VOEDINGSWAARDE_VELDEN.find((v) => v.veld === veld);
              if (!definitie) return null;
              const norm = normVoorVeld(gevolgdeNormen, veld);
              const naam = definitie.label.charAt(0).toUpperCase() + definitie.label.slice(1);
              const streefStof = norm && isStreefStof(veld) ? veld : null;
              const eigen = streefStof ? (profiel.streefwaarden[streefStof] ?? null) : null;
              const stap = GEVOLGD_STAP[veld] ?? { stap: 1, decimalen: 0 as const };
              return (
                <Regel
                  key={veld}
                  label={naam}
                  onder={onderzoekKort(veld)}
                  waarde={
                    eigen !== null && norm
                      ? `${String(eigen).replace(".", ",")} ${norm.unit} eigen`
                      : norm
                        ? `norm ${normLabel(norm)}`
                        : veld === "fiberG"
                          ? "vul je gewicht in"
                          : "geen norm"
                  }
                  gedempt={!norm || eigen === null}
                  onKies={
                    streefStof && norm
                      ? () =>
                          open(`streefwaarde_${streefStof}`, {
                            soort: "getal",
                            titel: `Eigen streefwaarde ${definitie.label.toLowerCase()}`,
                            eenheid: norm.unit,
                            waarde: eigen,
                            stap: stap.stap,
                            decimalen: stap.decimalen,
                            start: norm.waarde,
                            isGeldig: (waarde) => waarde === null || isGeldigeStreefwaarde(streefStof, waarde),
                            foutTekst: `Vul een waarde tussen 0 en ${STREEFWAARDE_GRENS[streefStof].max.toLocaleString("nl-NL")} ${norm.unit} in. ${STREEFWAARDE_GRENS[streefStof].uitleg}`,
                            uitleg: `Norm: ${normLabel(norm)} per dag voor ${norm.geldtVoor} (${norm.bron}). ${onderzoekLang(veld) ?? ""} Je streefwaarde staat ernaast in Je patroon, zonder oordeel.`,
                            leegUitleg: "Leeg betekent: alleen de norm.",
                            onBewaar: (waarde) =>
                              bewaarKernstof({ streefwaarden: { [streefStof]: waarde } }, `streefwaarde_${streefStof}`),
                          })
                      : undefined
                  }
                />
              );
            })}
          </div>
        ) : null}
      </section>

      {sheet ? <DoelInvoerSheet {...sheet} onSluit={() => setSheet(null)} /> : null}
    </div>
  );
}
