"use client";

/**
 * De macro-ring: calorieën in het midden, koolhydraten/vet/eiwit als
 * kleursegmenten eromheen, in dezelfde vorm als de krans op Voedingsstoffen:
 * ring, legenda in rijen met een dun balkje, en daaronder per maaltijd wat er
 * in zat (`BESLUIT_DAGBOEK_RINGEN_IN_LAGEN_2026-10.md`, aanvulling 4).
 *
 * ## Waarom drie vaste kleuren, niet de bestaande `--vd-*`-tinten
 *
 * `--vd-sage`/`--vd-terra`/`--vd-amber` dragen in dit dagboek al een
 * betekenis (gedekt/bron-aanwezig/niet-bewijsbaar, zie `DagboekRingen.tsx`)
 * — hergebruik zou hier een tekort-oordeel suggereren dat deze laag
 * (calorieën/macro's) juist niet mag dragen (zie
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §2). Drie
 * vaste categoriale kleuren (dataviz-skill, slot 1/2/3: blauw/oranje/aqua),
 * gevalideerd op `--vd-surface` met `validate_palette.js --pairs all`.
 *
 * ## Per maaltijd: zonder oordeel
 *
 * Per maaltijd staan calorieën en grammen, plus welk deel van de dag die
 * maaltijd droeg. Geen advies over wanneer je wat "hoort" te eten: voor een
 * vaste verdeling (de meeste eiwitten bij het ontbijt, de grootste maaltijd
 * bij de lunch) is het bewijs bij gezonde mensen niet sterk genoeg.
 */

const MIDDEN = 150;
const STRAAL = 104;
const DIKTE = 20;
const GAT_GRADEN = 4;

export type MacroRingSegment = {
  key: string;
  label: string;
  gram: number | null;
  /** kcal per gram voor deze macro — 4 voor koolhydraten/eiwit, 9 voor vet. */
  kcalPerGram: 4 | 9;
  kleur: string;
};

export type MacroMaaltijd = {
  id: string;
  label: string;
  kcal: number | null;
  /** Grammen in dezelfde volgorde als de segmenten. */
  grammen: readonly (number | null)[];
};

const KLEUREN = {
  koolhydraten: "#3987e5",
  vet: "#d95926",
  eiwit: "#199e70",
} as const;

export { KLEUREN as MACRO_RING_KLEUREN };

function punt(hoek: number): { x: number; y: number } {
  const rad = ((hoek - 90) * Math.PI) / 180;
  return { x: MIDDEN + STRAAL * Math.cos(rad), y: MIDDEN + STRAAL * Math.sin(rad) };
}

function boog(van: number, tot: number): string {
  const a = punt(van);
  const b = punt(tot);
  return `M ${a.x} ${a.y} A ${STRAAL} ${STRAAL} 0 ${tot - van > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

function gram(waarde: number | null): string {
  return waarde === null ? "—" : `${Math.round(waarde)} g`;
}

export default function DagboekMacroRing({
  kcal,
  kcalDoel = null,
  segmenten,
  maaltijden = [],
  onBegin,
}: {
  kcal: number | null;
  kcalDoel?: number | null;
  segmenten: readonly MacroRingSegment[];
  maaltijden?: readonly MacroMaaltijd[];
  onBegin?: () => void;
}) {
  // Percentage per segment op basis van calorische bijdrage (kcal = gram ×
  // kcal/g): gewichtspercentage zou vet stelselmatig onderschatten.
  const segmentKcal = segmenten.map((s) => (s.gram ?? 0) * s.kcalPerGram);
  const totaalSegmentKcal = segmentKcal.reduce((som, k) => som + k, 0);
  const heeftData = totaalSegmentKcal > 0;

  const graden = segmentKcal.map((k) => (heeftData ? (k / totaalSegmentKcal) * 360 : 0));
  const starts = graden.map((_, index) => graden.slice(0, index).reduce((som, g) => som + g, 0));
  const bogen = segmenten.flatMap((segment, index) => {
    const van = starts[index]!;
    const g = graden[index]!;
    if (g <= GAT_GRADEN) return [];
    return [{ ...segment, d: boog(van + GAT_GRADEN / 2, van + g - GAT_GRADEN / 2) }];
  });

  const gevuldeMaaltijden = maaltijden.filter((m) => (m.kcal ?? 0) > 0 || m.grammen.some((g) => (g ?? 0) > 0));
  const dagKcal = maaltijden.reduce((som, m) => som + (m.kcal ?? 0), 0);

  return (
    <section aria-label="Calorieën en macro's vandaag" className="@container flex w-full flex-col items-center gap-3 py-1">
      <div className="@container/krans relative aspect-square w-full max-w-[300px]">
        <svg viewBox="0 0 300 300" aria-hidden className="block h-full w-full">
          <circle cx={MIDDEN} cy={MIDDEN} r={STRAAL} fill="none" stroke="var(--vd-track)" strokeWidth={DIKTE} />
          {bogen.map((b) => (
            <path key={b.key} d={b.d} fill="none" stroke={b.kleur} strokeWidth={DIKTE} strokeLinecap="round" />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[27%] text-center">
          {heeftData ? (
            <>
              <b className="font-serif text-[clamp(26px,13cqw,40px)] font-normal leading-none text-[var(--vd-ink)]">
                {kcal === null ? "n.o." : Math.round(kcal).toLocaleString("nl-NL")}
              </b>
              <span className="mt-1 text-[clamp(9px,3.6cqw,11px)] uppercase tracking-[0.08em] text-[var(--vd-ink-3)]">
                kcal
              </span>
              {kcalDoel !== null && kcal !== null ? (
                <span className="mt-1 text-[clamp(9px,3.5cqw,11px)] leading-tight text-[var(--vd-ink-3)]">
                  van je doel {kcalDoel.toLocaleString("nl-NL")}
                </span>
              ) : null}
            </>
          ) : (
            <b className="font-serif text-[clamp(14px,6.4cqw,20px)] font-normal leading-tight text-[var(--vd-ink)]">
              Wat at je vandaag?
            </b>
          )}
        </div>
      </div>

      {!heeftData && onBegin ? (
        <button
          type="button"
          onClick={onBegin}
          className="cursor-pointer rounded-full border border-[rgb(var(--vd-sage-rgb)/40%)] bg-[rgb(var(--vd-sage-rgb)/10%)] px-4 py-2 text-[12.5px] font-semibold text-[var(--vd-sage-2)] transition-colors hover:border-[var(--vd-sage)] hover:bg-[rgb(var(--vd-sage-rgb)/20%)]"
        >
          Voeg je ontbijt toe
        </button>
      ) : null}

      <ul aria-label="Macro's" className="m-0 grid w-full max-w-[420px] list-none grid-cols-1 gap-x-5 gap-y-0.5 p-0">
        {segmenten.map((segment, index) => {
          const aandeel = heeftData ? segmentKcal[index]! / totaalSegmentKcal : 0;
          return (
            <li key={segment.key} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 px-2 py-1.5">
              <span aria-hidden className="block h-2.5 w-2.5 rounded-full" style={{ background: segment.kleur }} />
              <span className="text-[13px] text-[var(--vd-ink)]">{segment.label}</span>
              <span className="text-[13px] tabular-nums text-[var(--vd-ink-2)]">
                {gram(segment.gram)}
                <span className="ml-2 text-[var(--vd-ink-4)]">{heeftData ? `${Math.round(aandeel * 100)}%` : "—"}</span>
              </span>
              <span aria-hidden className="col-span-3 mt-1 block h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
                <span className="block h-full rounded-full" style={{ width: `${aandeel * 100}%`, background: segment.kleur }} />
              </span>
            </li>
          );
        })}
      </ul>

      {maaltijden.length > 0 ? (
        <div className="w-full max-w-[420px]">
          <div className="flex items-baseline justify-between px-2 pb-1">
            <h3 className="m-0 font-sans text-[11.5px] font-semibold text-[var(--vd-ink-2)]">Per maaltijd</h3>
            <span className="text-[10.5px] text-[var(--vd-ink-4)]">zonder oordeel</span>
          </div>
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[var(--vd-ink-4)]">
                <th scope="col" className="px-2 py-1 text-left font-semibold">
                  <span className="sr-only">Maaltijd</span>
                </th>
                <th scope="col" className="px-1 py-1 text-right font-semibold">kcal</th>
                {segmenten.map((segment) => (
                  <th key={segment.key} scope="col" className="px-1 py-1 text-right font-semibold">
                    <span aria-hidden className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: segment.kleur }} />
                    {segment.label.slice(0, 1)}
                    <span className="sr-only">{segment.label.slice(1)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maaltijden.map((maaltijd) => {
                const leeg = !gevuldeMaaltijden.includes(maaltijd);
                return (
                  <tr key={maaltijd.id} className={`border-t border-white/[0.06] ${leeg ? "text-[var(--vd-ink-4)]" : "text-[var(--vd-ink-2)]"}`}>
                    <th scope="row" className="px-2 py-1.5 text-left font-normal text-[var(--vd-ink)]">
                      {maaltijd.label}
                      {!leeg && dagKcal > 0 && maaltijd.kcal !== null ? (
                        <span className="ml-1.5 text-[11px] tabular-nums text-[var(--vd-ink-4)]">
                          {Math.round((maaltijd.kcal / dagKcal) * 100)}%
                        </span>
                      ) : null}
                    </th>
                    <td className="px-1 py-1.5 text-right tabular-nums">{leeg ? "—" : Math.round(maaltijd.kcal ?? 0)}</td>
                    {maaltijd.grammen.map((g, index) => (
                      <td key={segmenten[index]?.key ?? index} className="px-1 py-1.5 text-right tabular-nums">
                        {leeg ? "—" : gram(g)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="m-0 mt-1 px-2 text-[10.5px] leading-relaxed text-[var(--vd-ink-4)]">
            Het percentage achter een maaltijd is het deel van je calorieën van vandaag.
          </p>
        </div>
      ) : null}
    </section>
  );
}
