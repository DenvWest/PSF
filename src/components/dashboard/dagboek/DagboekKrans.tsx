"use client";

import { useEffect, useState } from "react";
import GevolgdeStoffenKiezer from "@/components/dashboard/doelen/GevolgdeStoffenKiezer";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { trackEvent } from "@/lib/ga4";
import type { NutrientOndergrensGesplitst } from "@/lib/nutrition-dagboek-items";
import { aandeelVanNorm, type KernstofNormen } from "@/lib/nutrition-normen";
import { isInformatieveStof, type InformatieveStof } from "@/lib/nutrition-rijkste-bronnen";
import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";
import { rondVoedingswaarde, type VoedingswaardeRij } from "@/lib/nutrition-voedingswaarde";
import type { ProteinTargetRange } from "@/lib/protein-target";
import { useGevolgdeStoffen } from "@/lib/use-gevolgde-stoffen";
import { useKernstofNormen } from "@/lib/use-kernstof-normen";

/**
 * De krans boven het dagboek: drie lagen in één beeld
 * (`BESLUIT_DAGBOEK_RINGEN_IN_LAGEN_2026-10.md`).
 *
 * 1. **Midden** — de vraag van de dag, daarna "x van y gedekt".
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
 * ## Telling blijft telling
 *
 * "2 van 3 gedekt" telt alleen bewijsbare kernstoffen met een noemer, zoals
 * het tekortsysteem. Gevolgde stoffen tellen nooit mee.
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
const BUITEN = { straal: 122, dikte: 8, gat: 6 };
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

function telRegel(
  rijen: readonly { nutrient: NutrientId; telt: boolean; nietBewijsbaar: boolean }[],
): string {
  const naam = (nutrient: NutrientId) => {
    const label = nutrientReferences[nutrient].label;
    return label.charAt(0).toLowerCase() + label.slice(1);
  };
  const tellend = rijen.filter((r) => r.telt).map((r) => naam(r.nutrient));
  const delen = [
    tellend.length > 0
      ? `Een ondergrens, geen dagtotaal. De telling gaat over ${lijst(tellend)}.`
      : "Een ondergrens, geen dagtotaal.",
  ];
  if (rijen.some((r) => r.nutrient === "protein" && !r.telt)) {
    delen.push("Eiwit telt mee zodra je een eiwitdoel hebt.");
  }
  const gestippeld = rijen.filter((r) => r.nietBewijsbaar).map((r) => naam(r.nutrient));
  if (gestippeld.length > 0) {
    delen.push(`Gestippeld: ${lijst(gestippeld)} laten zich met een dagboek niet meten.`);
  }
  return delen.join(" ");
}

function Segment({
  d,
  dikte,
  kleur,
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
        stroke="var(--vd-track)"
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
  const gedekt = rijen.filter((r) => r.telt && r.gedekt).length;

  const spanBinnen = 360 / rijen.length;
  const plekkenBuiten = gevolgd.length + 1;
  const spanBuiten = 360 / plekkenBuiten;
  const plusHoek = gevolgd.length * spanBuiten + spanBuiten / 2;
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
    setDraaiBinnen((huidig) => kortsteDraai(huidig, -(index + 0.5) * spanBinnen));
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

  const chip =
    "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] leading-none transition-colors";

  return (
    <section aria-label="Dekking vandaag" className="@container flex w-full flex-col items-center gap-3 py-1">
      <div className="@container/krans relative aspect-square w-full max-w-[300px]">
        <svg viewBox="0 0 300 300" aria-hidden className="block h-full w-full overflow-visible">
          <path
            d={`M ${MIDDEN - 5} 14 L ${MIDDEN + 5} 14 L ${MIDDEN} 21 Z`}
            fill={keuze ? "var(--vd-ink-2)" : "var(--vd-track)"}
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
                  kleur="var(--vd-ink-3)"
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

          <g className={DRAAI} style={{ transform: `rotate(${draaiBinnen}deg)` }}>
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

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[29%] text-center">
          {leeg ? (
            <b className="font-serif text-[clamp(14px,6.4cqw,20px)] font-normal leading-tight text-[var(--vd-ink)]">
              Wat at je vandaag?
            </b>
          ) : (
            <>
              <b className="font-serif text-[clamp(20px,10.5cqw,32px)] font-normal leading-none text-[var(--vd-ink)]">
                {totaal === 0 ? "—" : `${gedekt} van ${totaal}`}
              </b>
              <span className="mt-1.5 text-[clamp(9px,3.6cqw,11px)] leading-tight text-[var(--vd-ink-3)]">
                {totaal === 0 ? "nog niets te tellen" : "meetbare stoffen gedekt"}
              </span>
            </>
          )}
        </div>
      </div>

      <div aria-live="polite" className="flex min-h-[44px] w-full max-w-[340px] flex-col items-center gap-2 text-center">
        {gekozenKern ? (
          <>
            <p className="m-0 text-[13px] text-[var(--vd-ink)]">
              <span
                aria-hidden
                className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle"
                style={{ background: `var(--vd-stof-${gekozenKern.nutrient})` }}
              />
              <b className="font-semibold">{nutrientReferences[gekozenKern.nutrient].label}</b>
              <span className="text-[var(--vd-ink-2)]">
                {" · "}
                {kernWaarde(gekozenKern)}
                {gekozenKern.aandeel !== null
                  ? gekozenKern.nutrient === "protein"
                    ? " van je doel"
                    : " van je norm"
                  : ""}
                {gekozenKern.gedekt ? " ✓" : ""}
              </span>
            </p>
            {gekozenKern.nietBewijsbaar ? (
              <p className="m-0 text-[11px] text-[var(--vd-ink-3)]">Laat zich met een dagboek niet meten.</p>
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(gekozenKern.nutrient)}
              className="cursor-pointer text-[12px] font-semibold text-[var(--vd-sage-2)] underline-offset-2 hover:underline"
            >
              Logboek van {nutrientReferences[gekozenKern.nutrient].label.toLowerCase()} →
            </button>
          </>
        ) : gekozenGevolgd ? (
          <>
            <p className="m-0 text-[13px] text-[var(--vd-ink)]">
              <b className="font-semibold">{hoofdletter(gekozenGevolgd.label)}</b>
              <span className="text-[var(--vd-ink-2)]">
                {" · "}
                {gevolgdWaarde(gekozenGevolgd)}
                {gekozenGevolgd.aandeel !== null && gekozenGevolgd.waarde !== null
                  ? ` van de RI · ${rondVoedingswaarde(gekozenGevolgd.waarde)} ${gekozenGevolgd.unit}`
                  : gekozenGevolgd.waarde !== null
                    ? " · geen RI"
                    : ""}
              </span>
            </p>
            {isInformatieveStof(gekozenGevolgd.veld) ? (
              <button
                type="button"
                onClick={() => onKiesStof(gekozenGevolgd.veld as InformatieveStof)}
                className="cursor-pointer text-[12px] font-semibold text-[var(--vd-sage-2)] underline-offset-2 hover:underline"
              >
                Rijkste bronnen →
              </button>
            ) : (
              <p className="m-0 text-[11px] text-[var(--vd-ink-3)]">Zonder oordeel.</p>
            )}
          </>
        ) : leeg ? (
          <button
            type="button"
            onClick={onBegin}
            className="cursor-pointer rounded-full border border-[rgb(var(--vd-sage-rgb)/40%)] bg-[rgb(var(--vd-sage-rgb)/10%)] px-4 py-2 text-[12.5px] font-semibold text-[var(--vd-sage-2)] transition-colors hover:border-[var(--vd-sage)] hover:bg-[rgb(var(--vd-sage-rgb)/20%)]"
          >
            Voeg je ontbijt toe
          </button>
        ) : (
          <p className="m-0 text-[11px] leading-relaxed text-[var(--vd-ink-3)]">{telRegel(rijen)}</p>
        )}
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
