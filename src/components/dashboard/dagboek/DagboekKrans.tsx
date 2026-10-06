"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GevolgdeStoffenKiezer from "@/components/dashboard/doelen/GevolgdeStoffenKiezer";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { trackEvent } from "@/lib/ga4";
import type { NutrientOndergrensGesplitst } from "@/lib/nutrition-dagboek-items";
import { aandeelVanNorm, normVoor, type KernstofNormen } from "@/lib/nutrition-normen";
import { isInformatieveStof, type InformatieveStof } from "@/lib/nutrition-rijkste-bronnen";
import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";
import { rondVoedingswaarde, type VoedingswaardeRij } from "@/lib/nutrition-voedingswaarde";
import type { ProteinTargetRange } from "@/lib/protein-target";
import { useGevolgdeStoffen } from "@/lib/use-gevolgde-stoffen";
import { useKernstofNormen, useKernstofProfiel } from "@/lib/use-kernstof-normen";

/**
 * De krans boven het dagboek: drie lagen in één beeld
 * (`BESLUIT_DAGBOEK_RINGEN_IN_LAGEN_2026-10.md`).
 *
 * 1. **Midden** — de vraag van de dag; daarna één stof: standaard de meetbare
 *    kernstof met het grootste open stuk, of de stof die je aantikt. Groot het
 *    percentage, eronder "nog X tot je norm vandaag". Nooit "tekort": één dag
 *    is een ondergrens, het tekortsysteem oordeelt pas over vier vensters.
 * 2. **Binnenring** — de vijf kernstoffen, elk in de eigen kleur. Draagt de
 *    telling en het tekortsysteem; niet aanpasbaar.
 * 3. **Buitenring** — de stoffen die iemand zelf volgt, dunner en in één
 *    neutrale tint, zonder telling en zonder ✓. De "+" aan het einde opent
 *    dezelfde kiezer als Je doelen en Je patroon.
 *
 * ## Kleur is identiteit, geen oordeel
 *
 * Status zit in de vulling en het gestippelde spoor: zink en vitamine D staan
 * in {@link NIET_BEWIJSBAAR}, een stof zonder RI vult niet. De buitenring krijgt
 * nooit een stofkleur, zodat de informatielaag niet als tekort leest.
 *
 * ## Telling met namen
 *
 * Onder de krans staat de telling met namen in plaats van een breuk ("Gedekt:
 * omega-3. Open: magnesium."): alleen bewijsbare kernstoffen met een noemer,
 * zoals het tekortsysteem. Gevolgde stoffen tellen nooit mee en krijgen in het
 * midden geen "nog X": dat zou een oordeel zijn.
 *
 * ## Meedraaien
 *
 * Een tik op een segment draait die ring één keer zodat de stof bovenaan staat,
 * en de regel onder de krans toont die stof met de vervolgstap. Geen
 * doorlopende beweging en alles blijft zichtbaar; zonder `motion-safe` springt
 * de ring zonder animatie. De lijst onder de krans is de toetsenbordingang.
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

/** Draait naar `doel` langs de kortste weg, zodat de ring nooit een hele slag maakt. */
function kortsteDraai(huidig: number, doel: number): number {
  const verschil = ((((doel - huidig) % 360) + 540) % 360) - 180;
  return huidig + verschil;
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
        stroke={spoor}
        strokeWidth={dikte}
        strokeLinecap="round"
        strokeDasharray={gestippeld ? "2 7" : undefined}
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

const DRAAI =
  "[transform-box:view-box] [transform-origin:150px_150px] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(.2,.8,.2,1)]";

export default function DagboekKrans({
  stoffen,
  proteinTarget,
  voedingswaarde = [],
  onSelect,
  onKiesStof,
  onBegin,
}: {
  stoffen: readonly NutrientOndergrensGesplitst[];
  proteinTarget: ProteinTargetRange | null;
  voedingswaarde?: readonly VoedingswaardeRij[];
  onSelect: (nutrient: NutrientId) => void;
  onKiesStof: (stof: InformatieveStof) => void;
  onBegin: () => void;
}) {
  const normen = useKernstofNormen();
  const profiel = useKernstofProfiel();
  const { stoffen: gevolgdeVelden, geladen } = useGevolgdeStoffen();
  const [keuze, setKeuze] = useState<Keuze>(null);
  const [draaiBinnen, setDraaiBinnen] = useState(0);
  const [draaiBuiten, setDraaiBuiten] = useState(0);
  const [kiezen, setKiezen] = useState(false);
  const [getekend, setGetekend] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGetekend(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const rijen = KRANS_NUTRIENTEN.map((nutrient) => {
    const stof = stoffen.find((s) => s.nutrient === nutrient);
    const aandeel = aandeelVoor(nutrient, stof, proteinTarget, normen);
    return {
      nutrient,
      minstens: stof?.minstens ?? 0,
      unit: stof?.unit ?? null,
      aandeel,
      vol: aandeel === null ? 0 : Math.min(aandeel, 1),
      gedekt: aandeel !== null && aandeel >= 1,
      telt: !(nutrient in NIET_BEWIJSBAAR) && aandeel !== null,
      nietBewijsbaar: nutrient in NIET_BEWIJSBAAR,
    };
  });

  const gevolgd = geladen
    ? gevolgdeVelden.flatMap((veld) => voedingswaarde.find((rij) => rij.veld === veld) ?? [])
    : [];

  const leeg = stoffen.length === 0;
  const totaal = rijen.filter((r) => r.telt).length;

  const spanBinnen = 360 / rijen.length;
  const spanBuiten = gevolgd.length > 0 ? (360 - PLUS_PLEK) / gevolgd.length : 0;
  const plusHoek = gevolgd.length > 0 ? 360 - PLUS_PLEK / 2 : 0;
  const plus = punt(BUITEN.straal, plusHoek);

  // Zonder eigen keuze staat de meetbare kernstof met het grootste open stuk
  // bovenaan; is alles gedekt, dan geen focus.
  const standaard = leeg
    ? undefined
    : rijen
        .filter((r) => r.telt && !r.gedekt)
        .sort((a, b) => (a.aandeel ?? 0) - (b.aandeel ?? 0))[0];
  const standaardDraai = standaard ? -(rijen.indexOf(standaard) + 0.5) * spanBinnen : 0;
  const draaiBinnenNu = keuze ? draaiBinnen : standaardDraai;

  const gekozenKern =
    keuze?.ring === "kern" ? rijen.find((r) => r.nutrient === keuze.nutrient) : keuze ? undefined : standaard;
  const gekozenGevolgd = keuze?.ring === "gevolgd" ? gevolgd.find((r) => r.veld === keuze.veld) : undefined;

  function kiesKern(index: number) {
    const nutrient = rijen[index].nutrient;
    if (keuze?.ring === "kern" && keuze.nutrient === nutrient) {
      setKeuze(null);
      return;
    }
    setKeuze({ ring: "kern", nutrient });
    setDraaiBinnen(kortsteDraai(draaiBinnenNu, -(index + 0.5) * spanBinnen));
    trackEvent("nutrition_dagboek_krans_gekozen", { ring: "kern", nutrient });
  }

  function kiesGevolgd(index: number) {
    const veld = gevolgd[index].veld;
    if (keuze?.ring === "gevolgd" && keuze.veld === veld) {
      setKeuze(null);
      return;
    }
    setKeuze({ ring: "gevolgd", veld });
    setDraaiBuiten((huidig) => kortsteDraai(huidig, -(index + 0.5) * spanBuiten));
    trackEvent("nutrition_dagboek_krans_gekozen", { ring: "gevolgd", nutrient: veld });
  }

  function wisselKiezer() {
    if (!kiezen) trackEvent("nutrition_dagboek_gevolgd_toevoegen_open", { gevolgd: gevolgd.length });
    setKiezen(!kiezen);
  }

  const kernWaarde = (rij: (typeof rijen)[number]) =>
    rij.aandeel !== null
      ? `${Math.round(rij.aandeel * 100)}%`
      : rij.unit
        ? `${Math.round(rij.minstens)} ${rij.unit}`
        : "—";

  const gevolgdWaarde = (rij: VoedingswaardeRij) =>
    rij.aandeel !== null
      ? `${Math.round(rij.aandeel * 100)}%`
      : rij.waarde !== null
        ? `${rondVoedingswaarde(rij.waarde)} ${rij.unit}`
        : "n.o.";

  function middenRegel(rij: (typeof rijen)[number]): string {
    if (rij.nietBewijsbaar) return "een dagboek kan dit niet aantonen";
    if (rij.nutrient === "protein") {
      if (!proteinTarget || rij.aandeel === null) return "zonder eiwitdoel";
      const rest = proteinTarget.gramsLow - rij.minstens;
      return rest > 0 ? `nog ${hoeveelheid(rest, "g")} tot je doel vandaag` : "je doel gehaald vandaag";
    }
    const norm = normVoor(normen, rij.nutrient);
    if (!norm) return "";
    const rest = norm.waarde - rij.minstens;
    return rest > 0 ? `nog ${hoeveelheid(rest, norm.unit)} tot je norm vandaag` : "je norm gehaald vandaag";
  }

  function streefwaardeRegel(rij: (typeof rijen)[number]): string | null {
    if (rij.nutrient === "protein") return null;
    const eigen = profiel.streefwaarden[rij.nutrient as keyof typeof profiel.streefwaarden];
    const norm = normVoor(normen, rij.nutrient);
    if (eigen === undefined || !norm) return null;
    return `je streefwaarde ${hoeveelheid(eigen, norm.unit)} · ${Math.round((rij.minstens / eigen) * 100)}%`;
  }

  const chip =
    "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] leading-none transition-colors";

  return (
    <section aria-label="Dekking vandaag" className="@container flex w-full flex-col items-center gap-3 py-1">
      <div className="@container/krans relative aspect-square w-full max-w-[300px]">
        <svg viewBox="0 0 300 300" aria-hidden className="block h-full w-full overflow-visible">
          <path
            d={`M ${MIDDEN - 5} 14 L ${MIDDEN + 5} 14 L ${MIDDEN} 21 Z`}
            fill={gekozenKern || gekozenGevolgd ? "var(--vd-ink-2)" : "var(--vd-track)"}
            className="motion-safe:transition-[fill] motion-safe:duration-300"
          />

          {geladen ? (
            <g className={DRAAI} style={{ transform: `rotate(${draaiBuiten}deg)` }}>
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
                  gestippeld={rij.aandeel === null}
                  gedimd={keuze !== null && !(keuze.ring === "gevolgd" && keuze.veld === rij.veld)}
                  dekking={1}
                  getekend={getekend}
                  onClick={() => kiesGevolgd(index)}
                />
              ))}
              <g
                onClick={wisselKiezer}
                className={`cursor-pointer ${DRAAI}`}
                style={{ transformOrigin: `${plus.x}px ${plus.y}px`, transform: `rotate(${-draaiBuiten}deg)` }}
              >
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

          <g className={DRAAI} style={{ transform: `rotate(${draaiBinnenNu}deg)` }}>
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
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[27%] text-center">
          {gekozenKern ? (
            <>
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
            </>
          ) : gekozenGevolgd ? (
            <>
              <span className="text-[clamp(9px,3.6cqw,11.5px)] font-semibold text-[var(--vd-ink-2)]">
                {hoofdletter(gekozenGevolgd.label)}
              </span>
              <b className="mt-0.5 font-serif text-[clamp(22px,11.5cqw,36px)] font-normal leading-none text-[var(--vd-ink)]">
                {gevolgdWaarde(gekozenGevolgd)}
              </b>
              <span className="mt-1 text-[clamp(9px,3.5cqw,11px)] leading-tight text-[var(--vd-ink-3)]">
                {gekozenGevolgd.aandeel !== null && gekozenGevolgd.waarde !== null
                  ? `van je norm · ${rondVoedingswaarde(gekozenGevolgd.waarde)} ${gekozenGevolgd.unit}`
                  : gekozenGevolgd.waarde !== null
                    ? "zonder norm · zonder oordeel"
                    : "niet opgehaald"}
              </span>
            </>
          ) : leeg ? (
            <b className="font-serif text-[clamp(14px,6.4cqw,20px)] font-normal leading-tight text-[var(--vd-ink)]">
              Wat at je vandaag?
            </b>
          ) : (
            <>
              <b className="font-serif text-[clamp(16px,7.5cqw,24px)] font-normal leading-tight text-[var(--vd-ink)]">
                {totaal === 0 ? "Nog niets te tellen" : "Alles wat meetbaar is, is gedekt"}
              </b>
              <span className="mt-1 text-[clamp(9px,3.5cqw,11px)] leading-tight text-[var(--vd-ink-3)]">
                {totaal === 0 ? "voeg toe wat je at" : "vandaag, als ondergrens"}
              </span>
            </>
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
              onClick={() => onKiesStof(gekozenGevolgd.veld as InformatieveStof)}
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
        {!leeg && !keuze ? (
          <p className="m-0 text-[11px] leading-relaxed text-[var(--vd-ink-3)]">{telRegel(rijen)}</p>
        ) : null}
      </div>

      <ul aria-label="Kernstoffen" className="m-0 flex w-full list-none flex-wrap justify-center gap-1.5 p-0">
        {rijen.map((rij, index) => {
          const actief = keuze?.ring === "kern" && keuze.nutrient === rij.nutrient;
          return (
            <li key={rij.nutrient}>
              <button
                type="button"
                onClick={() => kiesKern(index)}
                aria-pressed={actief}
                aria-label={`${nutrientReferences[rij.nutrient].label}${rij.telt ? "" : ", telt niet mee in de telling"}`}
                className={`${chip} ${
                  actief
                    ? "border-white/30 bg-white/[0.08] text-[var(--vd-ink)]"
                    : rij.telt
                      ? "border-white/10 bg-white/[0.03] text-[var(--vd-ink-2)] hover:border-white/20"
                      : "border-dashed border-white/10 text-[var(--vd-ink-3)] hover:border-white/20"
                }`}
              >
                <span
                  aria-hidden
                  className={`block h-2 w-2 rounded-full ${rij.nietBewijsbaar ? "border-[1.5px] border-dashed bg-transparent" : ""}`}
                  style={
                    rij.nietBewijsbaar
                      ? { borderColor: `var(--vd-stof-${rij.nutrient})` }
                      : { background: `var(--vd-stof-${rij.nutrient})` }
                  }
                />
                <span className="font-semibold">{nutrientReferences[rij.nutrient].label}</span>
                <span className="font-mono tabular-nums text-[var(--vd-ink-3)]">
                  {kernWaarde(rij)}
                  {rij.gedekt ? (
                    <span aria-label="gedekt" className="ml-0.5 text-[var(--vd-sage-2)]">
                      ✓
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {geladen ? (
        <div className="flex w-full flex-col items-center gap-1.5">
          <h3 className="m-0 font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--vd-ink-4)]">
            Buitenring · ook gevolgd · zonder oordeel
          </h3>
          <ul aria-label="Ook gevolgd" className="m-0 flex w-full list-none flex-wrap justify-center gap-1.5 p-0">
            {gevolgd.map((rij, index) => {
              const actief = keuze?.ring === "gevolgd" && keuze.veld === rij.veld;
              return (
                <li key={rij.veld}>
                  <button
                    type="button"
                    onClick={() => kiesGevolgd(index)}
                    aria-pressed={actief}
                    className={`${chip} ${
                      actief
                        ? "border-white/30 bg-white/[0.08] text-[var(--vd-ink)]"
                        : "border-white/8 text-[var(--vd-ink-3)] hover:border-white/20"
                    }`}
                  >
                    <span className="font-semibold">{hoofdletter(rij.label)}</span>
                    <span className="font-mono tabular-nums text-[var(--vd-ink-4)]">{gevolgdWaarde(rij)}</span>
                  </button>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={wisselKiezer}
                aria-expanded={kiezen}
                className={`${chip} border-dashed border-white/15 text-[var(--vd-ink-3)] hover:border-white/30 hover:text-[var(--vd-ink)]`}
              >
                <span aria-hidden>{kiezen ? "×" : "+"}</span>
                <span className="font-semibold">
                  {kiezen ? "Klaar" : gevolgd.length > 0 ? "Stoffen kiezen" : "Volg ook vezels, calcium…"}
                </span>
              </button>
            </li>
          </ul>
        </div>
      ) : null}

      {kiezen ? (
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-3 text-[var(--vd-ink-2)]">
          <GevolgdeStoffenKiezer surface="dagboek" />
        </div>
      ) : null}
    </section>
  );
}
