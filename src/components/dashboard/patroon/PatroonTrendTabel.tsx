"use client";

import { gearceerd, getint, stofKleur } from "@/components/dashboard/patroon/PatroonTrendGrafiek";
import type { PatroonStof } from "@/lib/nutrition-stof-meting";
import type { StofTrend, StofTrendPunt } from "@/lib/nutrition-stof-trend";
import { percentageADH } from "@/lib/nutrition-tekortsysteem-copy";

/**
 * Alle stoffen van Trend in één tabel: per stof een rij, per dag (of week,
 * of maaltijd) een kolom. Hier komt alles samen; de grafieken eronder blijven
 * per stof, want vijf tot zeven lijnen over twee weken op 375 px is een kluwen.
 *
 * - In de cel het percentage van de lat (norm, of je eiwitdoel). Zonder lat
 *   de hoeveelheid in de eenheid.
 * - Stoffen zonder norm (natrium, calorieën, vet, …) staan in een eigen tabel
 *   met de eenheid achter de naam: twee soorten getallen in één tabel
 *   (procenten en duizenden mg) las als een fout.
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

function getalNL(waarde: number): string {
  return Math.round(waarde * 10) % 10 === 0
    ? Math.round(waarde).toLocaleString("nl-NL")
    : waarde.toLocaleString("nl-NL", { maximumFractionDigits: 1 });
}

function celTekst(punt: StofTrendPunt): string {
  if (punt.waarde === null) return "—";
  const getal = punt.aandeel !== null ? percentageADH(punt.aandeel).replace("%", "") : getalNL(punt.waarde);
  return `${punt.normGehaald ? "✓" : ""}${getal}`;
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
    return trend.norm !== null ? percentageADH(som) : `${getalNL(gemeten.reduce((s, p) => s + p.waarde!, 0))} ${trend.unit}`;
  }
  if (trend.norm === null) {
    return getalNL(gemeten.reduce((s, p) => s + p.waarde!, 0) / gemeten.length);
  }
  return `${gemeten.filter((p) => p.normGehaald).length} van ${gemeten.length}`;
}

function Rij({ trend, onKies }: { trend: StofTrend; onKies: (stof: PatroonStof) => void }) {
  const zonderNorm = trend.norm === null;
  const naam = (
    <th scope="row" className="sticky left-0 z-10 bg-[var(--vd-surface)] py-1.5 pr-3 text-left font-normal">
      <button
        type="button"
        onClick={() => onKies(trend.stof)}
        className="cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] text-[var(--vd-ink)]"
      >
        <span aria-hidden className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: stofKleur(trend) }} />
        {hoofdletter(trend.label)}
        {zonderNorm ? <span className="ml-1 text-[var(--vd-ink-4)]">({trend.unit})</span> : null}
      </button>
    </th>
  );

  // Omega-3 telt over de hele periode: één keer vette vis dekt dagen, een percentage per dag zou liegen.
  if (trend.periodetotaal && trend.bewijsbaar && trend.punten.some((p) => p.waarde !== null)) {
    return (
      <tr className="border-t border-[var(--vd-line)]">
        {naam}
        <td colSpan={trend.punten.length + 1} className="py-1.5 text-[var(--vd-ink-2)]">
          Telt over alle dagen samen, niet per dag: {trend.gehaald ? "doel gehaald · " : ""}
          {trend.kop}
        </td>
      </tr>
    );
  }

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

function kopSlot(schaal: StofTrend["schaal"], zonderNorm: boolean): string {
  if (zonderNorm) return schaal === "maaltijd" ? "samen" : "gemiddeld";
  return schaal === "maaltijd" ? "hele dag" : "doel gehaald";
}

function Tabel({
  id,
  titel,
  trends,
  onKies,
  uitleg,
}: {
  id: string;
  titel: string;
  trends: readonly StofTrend[];
  onKies: (stof: PatroonStof) => void;
  uitleg: string;
}) {
  const kolommen = trends.find((t) => t.bewijsbaar)?.punten ?? trends[0]?.punten ?? [];
  if (trends.length === 0 || kolommen.length === 0) return null;
  const schaal = trends[0]!.schaal;
  const zonderNorm = trends[0]!.norm === null;

  return (
    <section aria-labelledby={id} className="vd-tabel" style={{ padding: "0.875rem" }}>
      <p id={id} className="vd-eyebrow" style={{ margin: "0 0 0.5rem" }}>
        {titel}
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
                {kopSlot(schaal, zonderNorm)}
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
      <p className="m-0 mt-2 text-[11px] leading-snug text-[var(--vd-ink-3)]">{uitleg}</p>
    </section>
  );
}

export default function PatroonTrendTabel({
  trends,
  onKies,
}: {
  trends: readonly StofTrend[];
  onKies: (stof: PatroonStof) => void;
}) {
  const metNorm = trends.filter((t) => t.norm !== null);
  const zonderNorm = trends.filter((t) => t.norm === null);

  return (
    <>
      <Tabel
        id="patroon-trend-samen"
        titel="Alles samen · hoe dicht je bij je doel zat"
        trends={metNorm}
        onKies={onKies}
        uitleg="Zie elke stof als een glas. 100% = het glas is precies vol, dat is je doel voor die dag. ✓ = vol. Een gestreept vakje = je schreef die dag niet alles op, dus er kan nog meer bij zijn. — = niets opgeschreven. Bij 'doel gehaald' tellen we streng: alleen dagen waarop zeker is dat het glas vol was."
      />
      <Tabel
        id="patroon-trend-hoeveelheden"
        titel="Ook gevolgd · hoeveel je per dag binnenkreeg"
        trends={zonderNorm}
        onKies={onKies}
        uitleg="Voor deze stoffen is er geen doel, dus geen glas en geen ✓: je ziet alleen hoeveel je binnenkreeg, in de eenheid achter de naam. Een gestreept vakje = je schreef die dag niet alles op, dus het was eigenlijk meer. De laatste kolom is je gemiddelde per dag."
      />
    </>
  );
}
