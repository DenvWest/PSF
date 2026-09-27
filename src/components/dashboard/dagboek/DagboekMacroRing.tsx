"use client";

/**
 * De macro-ring: calorieën in het midden, koolhydraten/vet/eiwit als
 * kleursegmenten eromheen — de MyFitnessPal-referentievorm (screenshot 1),
 * nu op het "Macro's"-tabblad in plaats van als los "Calorieën"-tabblad.
 *
 * ## Waarom drie vaste kleuren, niet de bestaande `--vd-*`-tinten
 *
 * `--vd-sage`/`--vd-terra`/`--vd-amber` dragen in dit dagboek al een
 * betekenis (gedekt/bron-aanwezig/niet-bewijsbaar, zie `DagboekRingen.tsx`)
 * — hergebruik zou hier een tekort-oordeel suggereren dat deze laag
 * (calorieën/macro's) juist niet mag dragen (zie
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §2). Drie
 * nieuwe, vaste categoriale kleuren (dataviz-skill, slot 1/2/3: blauw/oranje/
 * aqua) zijn gevalideerd op de dagboek-achtergrond (`--vd-surface`) met
 * `validate_palette.js --pairs all` — alle CVD/contrast-checks slagen.
 *
 * ## Waarom altijd een label naast de kleur
 *
 * Kleur draagt hier nooit alleen de identiteit: elke rij heeft de naam
 * ernaast getypt, plus een kleurstip. Zie dataviz-skill: "text wears text
 * tokens, never the series color".
 */

const STRAAL = 42;
const OMTREK = 2 * Math.PI * STRAAL;
const GAP = 2; // px surface-gap tussen segmenten, conform de mark-spec

export type MacroRingSegment = {
  key: string;
  label: string;
  gram: number | null;
  /** kcal per gram voor deze macro — 4 voor koolhydraten/eiwit, 9 voor vet. */
  kcalPerGram: 4 | 9;
  kleur: string;
};

const KLEUREN = {
  koolhydraten: "#3987e5",
  vet: "#d95926",
  eiwit: "#199e70",
} as const;

export { KLEUREN as MACRO_RING_KLEUREN };

export default function DagboekMacroRing({
  kcal,
  segmenten,
}: {
  kcal: number | null;
  segmenten: readonly MacroRingSegment[];
}) {
  // Percentage per segment op basis van calorische bijdrage (kcal = gram ×
  // kcal/g), dezelfde omrekening als `nutrition-supermarkt-weekoverzicht.ts`
  // gebruikt voor het doel — nu toegepast op wat er werkelijk geregistreerd
  // is. Gewichtspercentage (gram/gram) zou vet stelselmatig onderschatten
  // t.o.v. zijn werkelijke aandeel in de calorieën.
  const segmentKcal = segmenten.map((s) => (s.gram ?? 0) * s.kcalPerGram);
  const totaalSegmentKcal = segmentKcal.reduce((som, k) => som + k, 0);
  const heeftData = totaalSegmentKcal > 0;

  let cursor = 0;
  const bogen = segmenten.map((segment, index) => {
    const fractie = heeftData ? segmentKcal[index]! / totaalSegmentKcal : 0;
    const lengte = Math.max(fractie * OMTREK - GAP, 0);
    const boog = { ...segment, offset: cursor, lengte };
    cursor += fractie * OMTREK;
    return boog;
  });

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-5">
      <div className="relative h-[140px] w-[140px]">
        <svg viewBox="0 0 100 100" className="block h-[140px] w-[140px] -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={STRAAL}
            fill="none"
            stroke="var(--vd-track)"
            strokeWidth="12"
          />
          {heeftData
            ? bogen.map((boog) => (
                <circle
                  key={boog.key}
                  cx="50"
                  cy="50"
                  r={STRAAL}
                  fill="none"
                  stroke={boog.kleur}
                  strokeWidth="12"
                  strokeDasharray={`${boog.lengte} ${OMTREK - boog.lengte}`}
                  strokeDashoffset={-boog.offset}
                />
              ))
            : null}
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <b className="font-serif text-[22px] font-normal leading-none text-[var(--vd-ink)]">
            {kcal === null ? "n.o." : Math.round(kcal)}
          </b>
          <span className="mt-1 text-[10px] uppercase tracking-[0.06em] text-[var(--vd-ink-4)]">
            Cal.
          </span>
        </span>
      </div>

      <ul className="m-0 flex w-full list-none flex-wrap justify-center gap-x-5 gap-y-1.5 p-0">
        {segmenten.map((segment, index) => {
          const pct = heeftData
            ? Math.round((segmentKcal[index]! / totaalSegmentKcal) * 100)
            : null;
          return (
            <li key={segment.key} className="flex items-center gap-1.5 text-[12px]">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: segment.kleur }}
              />
              <span className="text-[var(--vd-ink-2)]">
                {pct === null ? "—" : `${pct}%`}{" "}
                <span className="text-[var(--vd-ink-4)]">
                  {segment.gram === null ? "n.o." : `${Math.round(segment.gram)} g`}{" "}
                  {segment.label}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
