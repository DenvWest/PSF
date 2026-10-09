"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import * as Icons from "@/components/app/icons";
import GevolgdeStoffenKiezer from "@/components/dashboard/doelen/GevolgdeStoffenKiezer";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { trackEvent } from "@/lib/ga4";
import { zonderBenadering, type NutrientOndergrensGesplitst } from "@/lib/nutrition-dagboek-items";
import { aandeelVanNorm, normVoor, type KernstofNormen } from "@/lib/nutrition-normen";
import { isInformatieveStof, type RijksteStof } from "@/lib/nutrition-rijkste-bronnen";
import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";
import { rijGehaald, rondVoedingswaarde, type VoedingswaardeRij } from "@/lib/nutrition-voedingswaarde";
import type { ProteinTargetRange } from "@/lib/protein-target";
import { useGevolgdeStoffen } from "@/lib/use-gevolgde-stoffen";
import { useKernstofNormen, useKernstofProfiel } from "@/lib/use-kernstof-normen";

/**
 * De krans boven het dagboek: drie lagen in één beeld
 * (`BESLUIT_DAGBOEK_RINGEN_IN_LAGEN_2026-10.md`).
 *
 * 1. **Midden** — de vraag van de dag; daarna standaard een overzicht van de
 *    vijf kernstoffen, of de stof die je aantikt: groot het percentage, eronder
 *    "nog X tot je norm vandaag". Nooit "tekort": één dag is een ondergrens,
 *    het tekortsysteem oordeelt pas over vier vensters.
 * 2. **Binnenring** — de vijf kernstoffen, elk in de eigen kleur. Draagt de
 *    telling en het tekortsysteem; niet aanpasbaar.
 * 3. **Buitenring** — de stoffen die iemand zelf volgt, dunner en in één
 *    neutrale tint, zonder telling en zonder ✓. De "+" aan het einde opent
 *    dezelfde kiezer als Je doelen en Je patroon.
 *
 * ## Kleur is identiteit, geen oordeel
 *
 * Status zit in de vulling en het gestippelde spoor: zink en vitamine D staan
 * in {@link NIET_BEWIJSBAAR}, een stof zonder norm vult niet en krijgt een gestippeld spoor. De buitenring krijgt
 * nooit een stofkleur, zodat de informatielaag niet als tekort leest.
 *
 * ## Telling met namen
 *
 * Onder de krans staat de telling met namen in plaats van een breuk ("Gedekt:
 * omega-3. Open: magnesium."): alleen bewijsbare kernstoffen met een noemer,
 * zoals het tekortsysteem. Gevolgde stoffen tellen nooit mee en krijgen in het
 * midden geen "nog X": dat zou een oordeel zijn.
 *
 * ## Stilstaan
 *
 * De ring draait niet (herziening 8 okt): een tik licht de stof op en dimt de
 * rest, en de regel onder de krans toont de vervolgstappen. De lijst onder de
 * krans is de toetsenbordingang.
 *
 * Een segment zonder vulling tekent niets: met een afgerond lijnuiteinde wordt
 * een boog van lengte nul een stip, en die leest als voortgang.
 */

const KRANS_NUTRIENTEN: readonly NutrientId[] = [
  "magnesium",
  "protein",
  "omega3",
  "zinc",
  "vitamin_d",
];

const MIDDEN = 150;
const BINNEN = { straal: 84, dikte: 16, gat: 7 };
const BUITEN = { straal: 122, dikte: 9, gat: 6 };
/** Vaste ruimte voor de "+" direct achter het laatste segment, in graden. */
const PLUS_PLEK = 26;
const RAAKVLAK = 24;

type Keuze = { ring: "kern"; nutrient: NutrientId } | { ring: "gevolgd"; veld: SupermarktVeld } | null;

function punt(straal: number, hoek: number): { x: number; y: number } {
  const rad = ((hoek - 90) * Math.PI) / 180;
  return { x: MIDDEN + straal * Math.cos(rad), y: MIDDEN + straal * Math.sin(rad) };
}

function boog(straal: number, index: number, span: number, gat: number): string {
  const van = punt(straal, index * span + gat / 2);
  const tot = punt(straal, (index + 1) * span - gat / 2);
  const groot = span - gat > 180 ? 1 : 0;
  return `M ${van.x} ${van.y} A ${straal} ${straal} 0 ${groot} 1 ${tot.x} ${tot.y}`;
}

/** Korte naam langs de boog van een kernsegment; de volledige naam staat in het midden en in de lijst. */
const RINGLABEL: Record<NutrientId, string> = {
  magnesium: "Mg",
  protein: "Eiwit",
  omega3: "Ω-3",
  zinc: "Zn",
  vitamin_d: "Vit. D",
};

/**
 * Het pad waar een ringlabel langs loopt. Op de onderste helft loopt het pad
 * tegen de klok in, zodat de tekst rechtop blijft staan.
 */
function tekstBoog(straal: number, index: number, span: number): string {
  const midden = (index + 0.5) * span;
  const omgekeerd = midden > 90 && midden < 270;
  const van = punt(straal, index * span);
  const tot = punt(straal, (index + 1) * span);
  return omgekeerd
    ? `M ${tot.x} ${tot.y} A ${straal} ${straal} 0 0 0 ${van.x} ${van.y}`
    : `M ${van.x} ${van.y} A ${straal} ${straal} 0 0 1 ${tot.x} ${tot.y}`;
}

function aandeelVoor(
  nutrient: NutrientId,
  stof: NutrientOndergrensGesplitst | undefined,
  proteinTarget: ProteinTargetRange | null,
  normen: KernstofNormen,
): number | null {
  if (nutrient !== "protein") return aandeelVanNorm(normen, nutrient, stof?.minstens ?? 0);
  if (!proteinTarget || proteinTarget.gramsLow <= 0) return null;
  return stof ? stof.minstens / proteinTarget.gramsLow : 0;
}

function lijst(namen: string[]): string {
  if (namen.length <= 1) return namen.join("");
  return `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;
}

function hoofdletter(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function naamKlein(nutrient: NutrientId): string {
  const label = nutrientReferences[nutrient].label;
  return label.charAt(0).toLowerCase() + label.slice(1);
}

function telRegel(
  rijen: readonly { nutrient: NutrientId; telt: boolean; gedekt: boolean; nietBewijsbaar: boolean }[],
): string {
  const gedekt = rijen.filter((r) => r.telt && r.gedekt).map((r) => naamKlein(r.nutrient));
  const open = rijen.filter((r) => r.telt && !r.gedekt).map((r) => naamKlein(r.nutrient));
  const delen: string[] = [];
  if (gedekt.length > 0) delen.push(`Gedekt: ${lijst(gedekt)}.`);
  if (open.length > 0) delen.push(`Open: ${lijst(open)}.`);
  const gestippeld = rijen.filter((r) => r.nietBewijsbaar).map((r) => naamKlein(r.nutrient));
  if (gestippeld.length > 0) delen.push(`Niet meetbaar met een dagboek: ${lijst(gestippeld)}.`);
  if (rijen.some((r) => r.nutrient === "protein" && !r.telt)) delen.push("Eiwit telt mee met een eiwitdoel.");
  delen.push("Een ondergrens, geen dagtotaal.");
  return delen.join(" ");
}

function hoeveelheid(waarde: number, unit: string): string {
  const afgerond = unit === "µg" ? Math.round(waarde * 10) / 10 : Math.round(waarde);
  return `${afgerond.toLocaleString("nl-NL")} ${unit}`;
}

function Segment({
  d,
  dikte,
  kleur,
  spoor = "var(--vd-track)",
  vol,
  gestippeld,
  gedimd,
  dekking,
  getekend,
  onClick,
}: {
  d: string;
  dikte: number;
  kleur: string;
  spoor?: string;
  vol: number;
  gestippeld: boolean;
  gedimd: boolean;
  dekking: number;
  getekend: boolean;
  onClick: () => void;
}) {
  return (
    <g
      onClick={onClick}
      className="cursor-pointer motion-safe:transition-opacity motion-safe:duration-300"
      opacity={gedimd ? 0.4 : 1}
    >
      <path d={d} fill="none" stroke="transparent" strokeWidth={RAAKVLAK} />
      <path
        d={d}
        fill="none"
        stroke={gestippeld ? "rgba(255,255,255,0.22)" : spoor}
        strokeWidth={gestippeld ? 2.5 : dikte}
        strokeLinecap="round"
        strokeDasharray={gestippeld ? "0.1 6" : undefined}
      />
      {vol > 0 ? (
        <path
          d={d}
          pathLength={100}
          fill="none"
          stroke={kleur}
          strokeWidth={dikte}
          strokeLinecap="round"
          strokeDasharray={`${getekend ? vol * 100 : 0} 100`}
          opacity={dekking}
          className="motion-safe:transition-[stroke-dasharray] motion-safe:duration-700 motion-safe:ease-out"
        />
      ) : null}
    </g>
  );
}

export default function DagboekKrans({
  stoffen,
  proteinTarget,
  voedingswaarde = [],
  onSelect,
  onKiesStof,
  onBegin,
  inklapbaar = false,
  bronnenOpen = false,
}: {
  stoffen: readonly NutrientOndergrensGesplitst[];
  proteinTarget: ProteinTargetRange | null;
  voedingswaarde?: readonly VoedingswaardeRij[];
  onSelect: (nutrient: NutrientId) => void;
  onKiesStof: (stof: RijksteStof) => void;
  onBegin: () => void;
  inklapbaar?: boolean;
  /** Staat de rijkste-bronnenlijst naast de krans open, dan volgt die de gekozen stof. */
  bronnenOpen?: boolean;
}) {
  const normen = useKernstofNormen();
  const profiel = useKernstofProfiel();
  const { stoffen: gevolgdeVelden, geladen } = useGevolgdeStoffen();
  const padId = useId();
  const [keuze, setKeuze] = useState<Keuze>(null);
  const [kiezen, setKiezen] = useState(false);
  const [uitleg, setUitleg] = useState(false);
  const [getekend, setGetekend] = useState(false);
  const [lijstOpen, setLijstOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGetekend(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const rijen = KRANS_NUTRIENTEN.map((nutrient) => {
    const stof = stoffen.find((s) => s.nutrient === nutrient);
    const aandeel = aandeelVoor(nutrient, stof, proteinTarget, normen);
    const benaderd = (stof?.uitBenadering ?? 0) > 0;
    const aandeelStreng =
      benaderd && stof ? aandeelVoor(nutrient, { ...stof, minstens: zonderBenadering(stof) }, proteinTarget, normen) : aandeel;
    return {
      nutrient,
      minstens: stof?.minstens ?? 0,
      unit: stof?.unit ?? null,
      aandeel,
      benaderd,
      vol: aandeel === null ? 0 : Math.min(aandeel, 1),
      gedekt: aandeelStreng !== null && aandeelStreng >= 1,
      telt: !(nutrient in NIET_BEWIJSBAAR) && aandeel !== null,
      nietBewijsbaar: nutrient in NIET_BEWIJSBAAR,
    };
  });

  const gevolgd = geladen
    ? gevolgdeVelden.flatMap((veld) => voedingswaarde.find((rij) => rij.veld === veld) ?? [])
    : [];

  const leeg = stoffen.length === 0;

  const spanBinnen = 360 / rijen.length;
  const spanBuiten = gevolgd.length > 0 ? (360 - PLUS_PLEK) / gevolgd.length : 0;
  const plusHoek = gevolgd.length > 0 ? 360 - PLUS_PLEK / 2 : 0;
  const plus = punt(BUITEN.straal, plusHoek);

  const gekozenKern = keuze?.ring === "kern" ? rijen.find((r) => r.nutrient === keuze.nutrient) : undefined;
  const gekozenGevolgd = keuze?.ring === "gevolgd" ? gevolgd.find((r) => r.veld === keuze.veld) : undefined;

  function kiesKern(index: number) {
    const nutrient = rijen[index].nutrient;
    if (keuze?.ring === "kern" && keuze.nutrient === nutrient) {
      setKeuze(null);
      return;
    }
    setKeuze({ ring: "kern", nutrient });
    trackEvent("nutrition_dagboek_krans_gekozen", { ring: "kern", nutrient });
    if (bronnenOpen) onKiesStof(nutrient);
  }

  function kiesGevolgd(index: number) {
    const veld = gevolgd[index].veld;
    if (keuze?.ring === "gevolgd" && keuze.veld === veld) {
      setKeuze(null);
      return;
    }
    setKeuze({ ring: "gevolgd", veld });
    trackEvent("nutrition_dagboek_krans_gekozen", { ring: "gevolgd", nutrient: veld });
    if (bronnenOpen && isInformatieveStof(veld)) onKiesStof(veld);
  }

  function wisselLijst() {
    if (!lijstOpen) trackEvent("nutrition_dagboek_krans_lijst_open", { gevolgd: gevolgd.length });
    setLijstOpen(!lijstOpen);
  }

  function wisselKiezer() {
    if (!kiezen) trackEvent("nutrition_dagboek_gevolgd_toevoegen_open", { gevolgd: gevolgd.length });
    setKiezen(!kiezen);
  }

  // Boven 100% een hoeveelheid in plaats van "378%": dat leest niemand.
  const kernWaarde = (rij: (typeof rijen)[number]) => {
    const ca = rij.benaderd ? "≈ " : "";
    return rij.aandeel !== null && rij.aandeel < 1
      ? `${ca}${Math.round(rij.aandeel * 100)}%`
      : rij.unit
        ? `${ca}${hoeveelheid(rij.minstens, rij.unit)}`
        : "—";
  };

  const gevolgdWaarde = (rij: VoedingswaardeRij) => {
    const ca = rij.benaderd ? "≈ " : "";
    return rij.aandeel !== null && rij.aandeel < 1
      ? `${ca}${Math.round(rij.aandeel * 100)}%`
      : rij.waarde !== null
        ? `${ca}${rondVoedingswaarde(rij.waarde)} ${rij.unit}`
        : "n.o.";
  };

  function middenRegel(rij: (typeof rijen)[number]): string {
    if (rij.nietBewijsbaar) return "een dagboek kan dit niet aantonen";
    if (rij.nutrient === "protein") {
      if (!proteinTarget || rij.aandeel === null) return "zonder eiwitdoel";
      const rest = proteinTarget.gramsLow - rij.minstens;
      if (rest > 0) return `nog ${rij.benaderd ? "≈ " : ""}${hoeveelheid(rest, "g")} tot je doel vandaag`;
      if (!rij.gedekt) return `≈ je doel van ${hoeveelheid(proteinTarget.gramsLow, "g")} · deels uit een benadering`;
      return `je doel van ${hoeveelheid(proteinTarget.gramsLow, "g")} gehaald`;
    }
    const norm = normVoor(normen, rij.nutrient);
    if (!norm) return "";
    const rest = norm.waarde - rij.minstens;
    if (rest > 0) return `nog ${rij.benaderd ? "≈ " : ""}${hoeveelheid(rest, norm.unit)} tot je norm vandaag`;
    if (!rij.gedekt) return `≈ je norm van ${hoeveelheid(norm.waarde, norm.unit)} · deels uit een benadering`;
    return rij.nutrient === "omega3"
      ? `norm ${hoeveelheid(norm.waarde, norm.unit)} gehaald · omega-3 telt per week`
      : `norm ${hoeveelheid(norm.waarde, norm.unit)} gehaald vandaag`;
  }

  function streefwaardeRegel(rij: (typeof rijen)[number]): string | null {
    if (rij.nutrient === "protein") return null;
    const eigen = profiel.streefwaarden[rij.nutrient as keyof typeof profiel.streefwaarden];
    const norm = normVoor(normen, rij.nutrient);
    if (eigen === undefined || !norm) return null;
    return `je streefwaarde ${hoeveelheid(eigen, norm.unit)} · ${Math.round((rij.minstens / eigen) * 100)}%`;
  }


  return (
    <section aria-label="Dekking vandaag" className="@container flex w-full flex-col items-center gap-3 py-1">
      <div className="@container/krans relative aspect-square w-full max-w-[300px]">
        <button
          type="button"
          onClick={() => {
            if (!uitleg) trackEvent("nutrition_dagboek_krans_uitleg", { surface: "krans" });
            setUitleg(!uitleg);
          }}
          aria-expanded={uitleg}
          aria-controls="krans-uitleg"
          aria-label="Wat laat de krans zien?"
          className="absolute right-0 top-0 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[var(--vd-bg)] font-serif text-[13px] italic text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
        >
          i
        </button>
        <svg viewBox="0 0 300 300" aria-hidden className="block h-full w-full overflow-visible">
          {geladen ? (
            <g>
              {gevolgd.length === 0 ? (
                <circle
                  cx={MIDDEN}
                  cy={MIDDEN}
                  r={BUITEN.straal}
                  fill="none"
                  stroke="var(--vd-track)"
                  strokeWidth={2}
                  strokeDasharray="2 6"
                />
              ) : null}
              {gevolgd.map((rij, index) => (
                <Segment
                  key={rij.veld}
                  d={boog(BUITEN.straal, index, spanBuiten, BUITEN.gat)}
                  dikte={BUITEN.dikte}
                  kleur="var(--vd-ink-2)"
                  spoor="rgba(255,255,255,0.12)"
                  vol={rij.aandeel === null ? 0 : Math.min(rij.aandeel, 1)}
                  gestippeld={rij.norm === null}
                  gedimd={keuze !== null && !(keuze.ring === "gevolgd" && keuze.veld === rij.veld)}
                  dekking={1}
                  getekend={getekend}
                  onClick={() => kiesGevolgd(index)}
                />
              ))}
              <g onClick={wisselKiezer} className="cursor-pointer">
                <circle
                  cx={plus.x}
                  cy={plus.y}
                  r={12}
                  fill="var(--vd-bg)"
                  stroke={kiezen ? "var(--vd-ink-2)" : "rgba(255,255,255,0.22)"}
                  strokeWidth={1.5}
                  strokeDasharray={kiezen ? undefined : "3 3"}
                />
                <path
                  d={
                    kiezen
                      ? `M ${plus.x - 4} ${plus.y - 4} L ${plus.x + 4} ${plus.y + 4} M ${plus.x + 4} ${plus.y - 4} L ${plus.x - 4} ${plus.y + 4}`
                      : `M ${plus.x - 5} ${plus.y} L ${plus.x + 5} ${plus.y} M ${plus.x} ${plus.y - 5} L ${plus.x} ${plus.y + 5}`
                  }
                  stroke="var(--vd-ink-2)"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                />
              </g>
            </g>
          ) : null}

          <g>
            {rijen.map((rij, index) => (
              <path key={`pad-${rij.nutrient}`} id={`${padId}-ringlabel-${rij.nutrient}`} d={tekstBoog(BINNEN.straal, index, spanBinnen)} fill="none" />
            ))}
            {rijen.map((rij, index) => (
              <Segment
                key={rij.nutrient}
                d={boog(BINNEN.straal, index, spanBinnen, BINNEN.gat)}
                dikte={BINNEN.dikte}
                kleur={`var(--vd-stof-${rij.nutrient})`}
                vol={rij.vol}
                gestippeld={rij.nietBewijsbaar}
                gedimd={keuze !== null && !(keuze.ring === "kern" && keuze.nutrient === rij.nutrient)}
                dekking={rij.nietBewijsbaar ? 0.6 : 1}
                getekend={getekend}
                onClick={() => kiesKern(index)}
              />
            ))}
            {rijen.map((rij) => (
              <text
                key={`label-${rij.nutrient}`}
                className="pointer-events-none select-none motion-safe:transition-opacity motion-safe:duration-300"
                fontSize={8.5}
                fontWeight={600}
                letterSpacing={0.3}
                dominantBaseline="central"
                fill="var(--vd-ink)"
                opacity={keuze !== null && !(keuze.ring === "kern" && keuze.nutrient === rij.nutrient) ? 0.35 : 0.9}
              >
                <textPath href={`#${padId}-ringlabel-${rij.nutrient}`} startOffset="50%" textAnchor="middle">
                  {RINGLABEL[rij.nutrient]}
                </textPath>
              </text>
            ))}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[27%] text-center">
          {gekozenKern ? (
            <button
              type="button"
              onClick={() => setKeuze(null)}
              aria-label="Terug naar het overzicht"
              className="pointer-events-auto flex cursor-pointer flex-col items-center border-0 bg-transparent p-0 text-center"
            >
              <span className="flex items-center gap-1 text-[clamp(9px,3.6cqw,11.5px)] font-semibold text-[var(--vd-ink-2)]">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: `var(--vd-stof-${gekozenKern.nutrient})` }}
                />
                {nutrientReferences[gekozenKern.nutrient].label}
              </span>
              <b className="mt-0.5 font-serif text-[clamp(22px,11.5cqw,36px)] font-normal leading-none text-[var(--vd-ink)]">
                {kernWaarde(gekozenKern)}
              </b>
              <span className="mt-1 text-[clamp(9px,3.5cqw,11px)] leading-tight text-[var(--vd-ink-3)]">
                {middenRegel(gekozenKern)}
              </span>
              {streefwaardeRegel(gekozenKern) ? (
                <span className="mt-0.5 text-[clamp(8.5px,3.2cqw,10px)] leading-tight text-[var(--vd-ink-4)]">
                  {streefwaardeRegel(gekozenKern)}
                </span>
              ) : null}
            </button>
          ) : gekozenGevolgd ? (
            <button
              type="button"
              onClick={() => setKeuze(null)}
              aria-label="Terug naar het overzicht"
              className="pointer-events-auto flex cursor-pointer flex-col items-center border-0 bg-transparent p-0 text-center"
            >
              <span className="text-[clamp(9px,3.6cqw,11.5px)] font-semibold text-[var(--vd-ink-2)]">
                {hoofdletter(gekozenGevolgd.label)}
              </span>
              <b className="mt-0.5 font-serif text-[clamp(22px,11.5cqw,36px)] font-normal leading-none text-[var(--vd-ink)]">
                {gevolgdWaarde(gekozenGevolgd)}
              </b>
              <span className="mt-1 text-[clamp(9px,3.5cqw,11px)] leading-tight text-[var(--vd-ink-3)]">
                {gekozenGevolgd.aandeel !== null && gekozenGevolgd.waarde !== null
                  ? gekozenGevolgd.aandeel < 1
                    ? `van je norm · ${gekozenGevolgd.benaderd ? "≈ " : ""}${rondVoedingswaarde(gekozenGevolgd.waarde)} ${gekozenGevolgd.unit}`
                    : rijGehaald(gekozenGevolgd)
                      ? `norm ${rondVoedingswaarde(gekozenGevolgd.norm ?? 0)} ${gekozenGevolgd.unit} gehaald · zonder oordeel`
                      : `≈ norm ${rondVoedingswaarde(gekozenGevolgd.norm ?? 0)} ${gekozenGevolgd.unit} · deels uit een benadering`
                  : gekozenGevolgd.waarde !== null
                    ? "zonder norm · zonder oordeel"
                    : "niet opgehaald"}
              </span>
            </button>
          ) : leeg ? (
            <b className="font-serif text-[clamp(14px,6.4cqw,20px)] font-normal leading-tight text-[var(--vd-ink)]">
              Wat at je vandaag?
            </b>
          ) : (
            <ul aria-label="Overzicht kernstoffen" className="pointer-events-auto m-0 grid w-full list-none gap-0 p-0 text-[clamp(9px,4cqw,12.5px)]">
              {rijen.map((rij, index) => (
                <li key={rij.nutrient}>
                  <button
                    type="button"
                    onClick={() => kiesKern(index)}
                    aria-label={`Toon ${nutrientReferences[rij.nutrient].label}`}
                    className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border-0 bg-transparent px-1 py-[0.2em] leading-none transition-colors hover:bg-white/[0.06]"
                  >
                  <span className="flex min-w-0 items-center gap-1.5 text-[var(--vd-ink-2)]">
                    <span
                      aria-hidden
                      className={`inline-block h-2 w-2 shrink-0 rounded-full ${rij.nietBewijsbaar ? "border border-dashed bg-transparent" : ""}`}
                      style={
                        rij.nietBewijsbaar
                          ? { borderColor: `var(--vd-stof-${rij.nutrient})` }
                          : { background: `var(--vd-stof-${rij.nutrient})` }
                      }
                    />
                    <span className="truncate">{nutrientReferences[rij.nutrient].label}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--vd-ink)]">
                    {rij.nietBewijsbaar && rij.minstens === 0 ? "—" : kernWaarde(rij)}
                    {rij.gedekt ? <span className="ml-0.5 text-[var(--vd-sage-2)]">✓</span> : null}
                  </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div aria-live="polite" className="flex min-h-[44px] w-full max-w-[340px] flex-col items-center gap-1.5 text-center">
        {gekozenKern ? (
          <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => onSelect(gekozenKern.nutrient)}
              className="cursor-pointer text-[12px] font-semibold text-[var(--vd-sage-2)] underline-offset-2 hover:underline"
            >
              Logboek van {naamKlein(gekozenKern.nutrient)} →
            </button>
            <button
              type="button"
              onClick={() => onKiesStof(gekozenKern.nutrient)}
              className="cursor-pointer text-[12px] font-semibold text-[var(--vd-sage-2)] underline-offset-2 hover:underline"
            >
              Rijkste bronnen →
            </button>
            {gekozenKern.nutrient === "protein" && gekozenKern.aandeel === null ? (
              <Link
                href="/dashboard/doelen"
                onClick={() => trackEvent("nutrition_dagboek_eiwitdoel_cta", { surface: "krans" })}
                className="text-[12px] font-semibold text-[var(--vd-sage-2)] underline-offset-2 hover:underline"
              >
                Stel een eiwitdoel in →
              </Link>
            ) : null}
          </span>
        ) : gekozenGevolgd ? (
          isInformatieveStof(gekozenGevolgd.veld) ? (
            <button
              type="button"
              onClick={() => onKiesStof(gekozenGevolgd.veld as RijksteStof)}
              className="cursor-pointer text-[12px] font-semibold text-[var(--vd-sage-2)] underline-offset-2 hover:underline"
            >
              Rijkste bronnen →
            </button>
          ) : (
            <p className="m-0 text-[11px] text-[var(--vd-ink-3)]">Zonder oordeel.</p>
          )
        ) : leeg ? (
          <button
            type="button"
            onClick={onBegin}
            className="cursor-pointer rounded-full border border-[rgb(var(--vd-sage-rgb)/40%)] bg-[rgb(var(--vd-sage-rgb)/10%)] px-4 py-2 text-[12.5px] font-semibold text-[var(--vd-sage-2)] transition-colors hover:border-[var(--vd-sage)] hover:bg-[rgb(var(--vd-sage-rgb)/20%)]"
          >
            Voeg je ontbijt toe
          </button>
        ) : null}
        {!leeg && !keuze && !inklapbaar ? (
          <p className="m-0 text-[11px] leading-relaxed text-[var(--vd-ink-3)]">{telRegel(rijen)}</p>
        ) : null}
      </div>

      {uitleg ? (
        <div
          id="krans-uitleg"
          className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[12.5px] leading-relaxed text-[var(--vd-ink-2)]"
        >
          <ul className="m-0 grid list-none gap-1.5 p-0">
            <li>
              <b className="text-[var(--vd-ink)]">Binnenring</b> · de vijf kernstoffen, elk in een eigen kleur. Vol = je
              norm voor vandaag gehaald.
            </li>
            <li>
              <b className="text-[var(--vd-ink)]">Buitenring</b> · de stoffen die jij volgt, in één tint en zonder oordeel.
              Met + kies je er meer.
            </li>
            <li>
              <b className="text-[var(--vd-ink)]">Midden</b> · een overzicht van de vijf kernstoffen; tik een stof aan
              voor de details en de rijkste bronnen, en tik het midden weer aan voor het overzicht.
            </li>
            <li>
              <b className="text-[var(--vd-ink)]">Gestippeld</b> · zink en vitamine D kan een dagboek niet aantonen; een
              stof zonder norm vult niet.
            </li>
          </ul>
          {!leeg ? <p className="m-0 mt-2 text-[11.5px] text-[var(--vd-ink-2)]">{telRegel(rijen)}</p> : null}
          <p className="m-0 mt-2 text-[11.5px] text-[var(--vd-ink-3)]">
            Alles is een ondergrens van wat je registreerde, geen dagtotaal. De normen en waar ze vandaan komen staan in
            Je doelen.
          </p>
        </div>
      ) : null}

      {inklapbaar ? (
        <button
          type="button"
          onClick={wisselLijst}
          aria-expanded={lijstOpen}
          aria-controls="krans-stoffenlijst"
          className="flex w-full max-w-[420px] cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-[12.5px] font-semibold text-[var(--vd-ink-2)] transition-colors hover:border-white/20 hover:text-[var(--vd-ink)]"
        >
          <span>{lijstOpen ? "Verberg stoffen" : `Alle stoffen (${rijen.length + gevolgd.length})`}</span>
          <span aria-hidden className={`flex transition-transform ${lijstOpen ? "rotate-180" : ""}`}>
            <Icons.ChevronDown s={16} />
          </span>
        </button>
      ) : null}

      {!inklapbaar || lijstOpen ? (
      <div id="krans-stoffenlijst" className="flex w-full flex-col items-center gap-3">
      <ul aria-label="Kernstoffen" className="m-0 grid w-full max-w-[420px] list-none grid-cols-1 gap-x-5 gap-y-0.5 p-0 @[400px]:grid-cols-2">
        {rijen.map((rij, index) => {
          const actief = gekozenKern?.nutrient === rij.nutrient;
          return (
            <li key={rij.nutrient}>
              <button
                type="button"
                onClick={() => kiesKern(index)}
                aria-pressed={actief}
                aria-label={`${nutrientReferences[rij.nutrient].label}${rij.telt ? "" : ", telt niet mee in de telling"}`}
                className={`grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-2 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                  actief ? "" : "border-transparent hover:bg-white/[0.04]"
                }`}
                style={
                  actief
                    ? {
                        borderColor: `var(--vd-stof-${rij.nutrient})`,
                        background: `color-mix(in srgb, var(--vd-stof-${rij.nutrient}) 14%, transparent)`,
                      }
                    : undefined
                }
              >
                <span
                  aria-hidden
                  className={`block h-2.5 w-2.5 rounded-full ${rij.nietBewijsbaar ? "border-[1.5px] border-dashed bg-transparent" : ""}`}
                  style={
                    rij.nietBewijsbaar
                      ? { borderColor: `var(--vd-stof-${rij.nutrient})` }
                      : { background: `var(--vd-stof-${rij.nutrient})` }
                  }
                />
                <span className={`text-[13px] ${rij.telt ? "text-[var(--vd-ink)]" : "text-[var(--vd-ink-2)]"}`}>
                  {nutrientReferences[rij.nutrient].label}
                </span>
                <span className="text-[13px] tabular-nums text-[var(--vd-ink-2)]">
                  {kernWaarde(rij)}
                  {rij.gedekt ? (
                    <span aria-label="gedekt" className="ml-1 text-[var(--vd-sage-2)]">
                      ✓
                    </span>
                  ) : null}
                </span>
                <span aria-hidden className="col-span-3 mt-1 block h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.round(rij.vol * 100)}%`,
                      background: `var(--vd-stof-${rij.nutrient})`,
                      opacity: rij.nietBewijsbaar ? 0.55 : 1,
                    }}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {geladen ? (
        <div className="flex w-full max-w-[420px] flex-col gap-1">
          <div className="flex items-baseline justify-between px-2">
            <h3 className="m-0 font-sans text-[11.5px] font-semibold text-[var(--vd-ink-2)]">Ook gevolgd</h3>
            <span className="text-[10.5px] text-[var(--vd-ink-4)]">buitenring · zonder oordeel</span>
          </div>
          <ul aria-label="Ook gevolgd" className="m-0 grid list-none grid-cols-1 gap-x-5 gap-y-0.5 p-0 @[400px]:grid-cols-2">
            {gevolgd.map((rij) => {
              const index = gevolgd.indexOf(rij);
              const actief = gekozenGevolgd?.veld === rij.veld;
              return (
                <li key={rij.veld}>
                  <button
                    type="button"
                    onClick={() => kiesGevolgd(index)}
                    aria-pressed={actief}
                    className={`grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-x-2 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                      actief ? "border-[var(--vd-ink-2)] bg-white/[0.08]" : "border-transparent hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-[13px] text-[var(--vd-ink-2)]">{hoofdletter(rij.label)}</span>
                    <span className="text-[13px] tabular-nums text-[var(--vd-ink-3)]">{gevolgdWaarde(rij)}</span>
                    <span aria-hidden className="col-span-2 mt-1 block h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
                      <span
                        className="block h-full rounded-full bg-[var(--vd-ink-3)]"
                        style={{ width: `${Math.round(Math.min(rij.aandeel ?? 0, 1) * 100)}%` }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center gap-3 px-2">
            <button
              type="button"
              onClick={wisselKiezer}
              aria-expanded={kiezen}
              className="cursor-pointer text-[12px] font-semibold text-[var(--vd-sage-2)] underline-offset-2 hover:underline"
            >
              {kiezen ? "Klaar" : gevolgd.length > 0 ? "+ Stoffen kiezen" : "+ Volg ook vezels, calcium…"}
            </button>
          </div>
        </div>
      ) : null}

      {kiezen ? (
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-3 text-[var(--vd-ink-2)]">
          <GevolgdeStoffenKiezer surface="dagboek" />
        </div>
      ) : null}
      </div>
      ) : null}
    </section>
  );
}
