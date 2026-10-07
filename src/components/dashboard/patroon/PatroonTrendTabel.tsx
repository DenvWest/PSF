"use client";

import { gearceerd, getint, stofKleur } from "@/components/dashboard/patroon/PatroonTrendGrafiek";
import type { PatroonStof } from "@/lib/nutrition-stof-meting";
import type { StofTrend, StofTrendPunt } from "@/lib/nutrition-stof-trend";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";

/**
 * Alle stoffen van Trend in één tabel: per stof een rij, per dag (of week,
 * of maaltijd) een kolom. Hier komt alles samen; de grafieken eronder blijven
 * per stof, want vijf tot zeven lijnen over twee weken op 375 px is een kluwen.
 *
 * - In de cel het percentage van de lat (norm, of je eiwitdoel). Zonder lat
 *   de hoeveelheid in de eenheid.
 * - ✓ alleen waar de lat aantoonbaar gehaald is (zonder benaderingen). Een
 *   kernstof krijgt dan sage, een gevolgde stof een neutrale tint
 *   (`BESLUIT_DOELEN_VERBONDEN_2026-10.md` §1). Nooit een ✗.
 * - Elke kernstof in zijn eigen kleur (bolletje + gehaald-tint), net als in
 *   de grafiek en de krans; gevolgde stoffen neutraal.
 * - Onvolledig is gearceerd, net als in de grafiek; "—" is niets geregistreerd.
 * - De laatste kolom telt op hoeveel gemeten punten de lat gehaald is.
 *
 * Op een telefoon blijft de stofnaam staan en scrollen de kolommen mee.
 */

function hoofdletter(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function celTekst(punt: StofTrendPunt): string {
  if (punt.waarde === null) return "—";
  const getal =
    punt.aandeel !== null ? percentageADH(punt.aandeel).replace("%", "") : hoeveelheid(punt.waarde);
  return `${punt.normGehaald ? "✓" : ""}${punt.staat === "onvolledig" && !punt.normGehaald ? "≥" : ""}${getal}`;
}

function celStijl(trend: StofTrend, punt: StofTrendPunt): { className: string; background?: string } {
  if (punt.waarde === null) return { className: "text-[var(--vd-ink-4)]" };
  const kleur = stofKleur(trend);
  if (punt.normGehaald) return { className: "font-medium text-[var(--vd-ink)]", background: getint(kleur, 28) };
  if (punt.staat === "onvolledig") return { className: "text-[var(--vd-ink-3)]", background: gearceerd(getint(kleur, 30)) };
  return { className: "text-[var(--vd-ink-2)]" };
}

function slotTekst(trend: StofTrend): string {
  const gemeten = trend.punten.filter((p) => p.waarde !== null);
  if (gemeten.length === 0) return "—";
  if (trend.schaal === "maaltijd") {
    const som = gemeten.reduce((s, p) => s + (p.aandeel ?? 0), 0);
    return trend.norm !== null ? percentageADH(som) : `${hoeveelheid(gemeten.reduce((s, p) => s + p.waarde!, 0))} ${trend.unit}`;
  }
  if (trend.norm === null) return "geen lat";
  if (trend.periodetotaal) return trend.gehaald ? "✓ periode" : "periode";
  return `${gemeten.filter((p) => p.normGehaald).length}/${gemeten.length}`;
}

function Rij({ trend, onKies }: { trend: StofTrend; onKies: (stof: PatroonStof) => void }) {
  const naam = (
    <th scope="row" className="sticky left-0 z-10 bg-[var(--vd-surface)] py-1.5 pr-3 text-left font-normal">
      <button
        type="button"
        onClick={() => onKies(trend.stof)}
        className="cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] text-[var(--vd-ink)]"
      >
        <span aria-hidden className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: stofKleur(trend) }} />
        {hoofdletter(trend.label)}
        {trend.soort === "gevolgd" ? <span className="ml-1 text-[var(--vd-ink-4)]">gev.</span> : null}
      </button>
    </th>
  );

  // Zonder bewijs (zink, vitamine D) of zonder enige registratie: de kop zegt het.
  if (!trend.bewijsbaar || trend.punten.every((p) => p.waarde === null)) {
    return (
      <tr className="border-t border-[var(--vd-line)]">
        {naam}
        <td colSpan={trend.punten.length + 1} className="py-1.5 text-[var(--vd-ink-3)]">
          {trend.kop}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-[var(--vd-line)]">
      {naam}
      {trend.punten.map((punt) => {
        const stijl = celStijl(trend, punt);
        return (
          <td
            key={punt.sleutel}
            title={punt.uitleg}
            data-gehaald={punt.normGehaald || undefined}
            className={`px-0.5 py-1.5 text-center tabular-nums ${stijl.className}`}
            style={stijl.background ? { background: stijl.background } : undefined}
          >
            {celTekst(punt)}
          </td>
        );
      })}
      <td className="pl-3 text-right whitespace-nowrap text-[var(--vd-ink-2)] tabular-nums">
        {slotTekst(trend)}
      </td>
    </tr>
  );
}

export default function PatroonTrendTabel({
  trends,
  onKies,
}: {
  trends: readonly StofTrend[];
  onKies: (stof: PatroonStof) => void;
}) {
  const kolommen = trends.find((t) => t.bewijsbaar)?.punten ?? trends[0]?.punten ?? [];
  if (trends.length === 0 || kolommen.length === 0) return null;
  const schaal = trends[0]!.schaal;

  return (
    <section aria-labelledby="patroon-trend-samen" className="vd-tabel" style={{ padding: "0.875rem" }}>
      <p id="patroon-trend-samen" className="vd-eyebrow" style={{ margin: "0 0 0.5rem" }}>
        Alles samen · % van je norm of doel
      </p>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-max border-collapse text-[11.5px] leading-tight">
          <thead>
            <tr className="text-[10px] text-[var(--vd-ink-4)]">
              <th scope="col" className="sticky left-0 z-10 bg-[var(--vd-surface)] pr-3 pb-1 text-left font-normal">
                Stof
              </th>
              {kolommen.map((punt) => (
                <th key={punt.sleutel} scope="col" className="min-w-[2.25rem] px-0.5 pb-1 text-center font-normal">
                  {punt.label}
                </th>
              ))}
              <th scope="col" className="pb-1 pl-3 text-right font-normal">
                {schaal === "maaltijd" ? "dag" : "gehaald"}
              </th>
            </tr>
          </thead>
          <tbody>
            {trends.map((trend) => (
              <Rij key={trend.stof} trend={trend} onKies={onKies} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="m-0 mt-2 text-[10.5px] leading-snug text-[var(--vd-ink-4)]">
        ✓ = aantoonbaar gehaald · gearceerd en ≥ = onvolledige dag, ondergrens · — = niets geregistreerd
      </p>
    </section>
  );
}
