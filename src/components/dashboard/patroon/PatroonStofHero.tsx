import { periodeLabel, type Periode } from "@/lib/nutrition-periode";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import type { StofDetailGegevens } from "@/components/dashboard/patroon/PatroonStofDetail";

export type StofToon = "sage" | "terra" | "amber" | "neutraal";

export const STOF_TOON_KLEUR: Record<StofToon, string> = {
  sage: "var(--vd-sage-2)",
  terra: "var(--vd-terra)",
  amber: "var(--vd-amber)",
  neutraal: "var(--vd-ink-3)",
};

type Stand = { toon: StofToon; kort: string };

/**
 * De stand van één stof in de periode, in woorden die geen tekort beweren:
 * "onder je norm" is een afstand tot een groepsnorm, geen diagnose.
 */
export function stofStand(
  rij: Pick<StofDetailGegevens, "bewijsbaar" | "gedekt" | "aandeel" | "norm">,
  dagenGeregistreerd: number,
): Stand {
  if (dagenGeregistreerd === 0) return { toon: "neutraal", kort: "Niets geregistreerd" };
  if (!rij.bewijsbaar) return { toon: "amber", kort: "Niet aan te tonen" };
  if (!rij.norm || rij.aandeel === null) return { toon: "neutraal", kort: "Geen vaste norm" };
  if (rij.gedekt === true) return { toon: "sage", kort: "Norm gehaald" };
  if (rij.aandeel >= 1) return { toon: "sage", kort: "Op of boven je norm" };
  return { toon: "terra", kort: "Onder je norm" };
}

/** Eerste blik op één stof: stand, één zin en de balk tegen de norm. */
export default function PatroonStofHero({
  rij,
  periode,
  dagenGeregistreerd,
}: {
  rij: StofDetailGegevens;
  periode: Periode;
  dagenGeregistreerd: number;
}) {
  const stand = stofStand(rij, dagenGeregistreerd);
  const totaalLezing = rij.lezing === "periodetotaal";
  const waarde = totaalLezing ? rij.totaal : rij.gemiddeld;
  const doel = totaalLezing ? rij.normPeriode : (rij.norm?.waarde ?? null);
  const kanBalk = dagenGeregistreerd > 0 && rij.bewijsbaar && doel !== null && doel > 0;
  const schaal = kanBalk ? Math.max(doel * 1.3, waarde * 1.05) : 1;
  const pct = (getal: number) => `${Math.min(100, (getal / schaal) * 100)}%`;
  const kleur = STOF_TOON_KLEUR[stand.toon];

  const zin =
    dagenGeregistreerd === 0 ? (
      "In deze periode staat niets geregistreerd."
    ) : totaalLezing ? (
      <>
        Minstens <b>{hoeveelheid(rij.totaal)} {rij.unit}</b> in deze periode
        {rij.normPeriode !== null ? (
          <>
            {" "}
            — de norm over {periodeLabel(periode)} is {hoeveelheid(rij.normPeriode)} {rij.unit} (
            {percentageADH(rij.aandeel)}).
          </>
        ) : null}
      </>
    ) : (
      <>
        Gemiddeld minstens <b>{hoeveelheid(rij.gemiddeld)} {rij.unit}</b> per geregistreerde dag
        {rij.norm !== null && rij.bewijsbaar ? <> ({percentageADH(rij.aandeel)} van de norm)</> : null}, over{" "}
        {dagenGeregistreerd} {dagenGeregistreerd === 1 ? "dag" : "dagen"}.
      </>
    );

  return (
    <section
      aria-label={`${rij.label}, stand over ${periodeLabel(periode)}`}
      className="@container rounded-[16px] border border-[var(--vd-line)] bg-gradient-to-br from-[var(--vd-surface-2)] to-[var(--vd-surface)] p-4 @[34rem]:p-5"
    >
      <div className={`grid gap-4 ${kanBalk ? "@[34rem]:grid-cols-[1.15fr_1fr] @[34rem]:items-center @[34rem]:gap-6" : ""}`}>
        <div className="min-w-0">
          <p className="vd-eyebrow m-0">{periodeLabel(periode)} · uit je dagboek</p>
          <h3 id="patroon-stof-titel" className="mb-2 mt-1 text-[1.625rem] leading-none text-[var(--vd-ink)]">
            {rij.label}
          </h3>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold"
            style={{ color: kleur, background: "rgba(255,255,255,0.06)" }}
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
            {stand.kort}
          </span>
          <p className="m-0 mt-2.5 max-w-[56ch] text-[0.8125rem] leading-relaxed text-[var(--vd-ink-2)]">{zin}</p>
        </div>

        {kanBalk && doel !== null ? (
          <div>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="font-mono text-[1.75rem] leading-none tabular-nums text-[var(--vd-ink)]">
                {hoeveelheid(waarde)}
                <small className="ml-1 text-[0.75rem] text-[var(--vd-ink-3)]">
                  / {hoeveelheid(doel)} {rij.unit}
                </small>
              </span>
              <span className="vd-eyebrow m-0 text-right">{totaalLezing ? "minstens, totaal" : "minstens, per dag"}</span>
            </div>
            <div
              role="img"
              aria-label={`${rij.label} ${hoeveelheid(waarde)} ${rij.unit}, norm ${hoeveelheid(doel)} ${rij.unit}`}
              className="relative h-4 rounded-full bg-[var(--vd-track)]"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-l-full transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: pct(waarde), background: stand.toon === "terra" ? "var(--vd-terra)" : "var(--vd-sage)" }}
              />
              <div className="absolute -bottom-1.5 -top-1.5 w-0.5 rounded bg-[var(--vd-ink)]" style={{ left: pct(doel) }}>
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[0.5625rem] uppercase tracking-[0.08em] text-[var(--vd-ink-3)]">
                  norm
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
