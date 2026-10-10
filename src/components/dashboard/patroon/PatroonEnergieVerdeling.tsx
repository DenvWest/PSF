import type { EnergieVerdeling, VetVerdeling } from "@/lib/nutrition-energie-verdeling";
import { hoeveelheid } from "@/lib/nutrition-tekortsysteem-copy";

const DEEL_KLEUR = {
  proteinG: "var(--vd-sage)",
  carbohydrateG: "var(--vd-accent-2)",
  fatG: "var(--vd-amber)",
} as const;

function procent(aandeel: number): string {
  return `${Math.round(aandeel * 100)}%`;
}

/**
 * De samenstelling achter energie of vet, als feit. Geen oordeel: een calorie
 * of een vet is hier niet "goed" of "slecht", het scherm laat zien waaruit je
 * dagboek bestaat.
 */
export default function PatroonEnergieVerdeling({
  stof,
  energie,
  vet,
}: {
  stof: "energyKcal" | "fatG";
  energie: EnergieVerdeling | null;
  vet: VetVerdeling | null;
}) {
  if (stof === "energyKcal") {
    if (!energie) return null;
    return (
      <section
        aria-label="Waar je calorieën vandaan komen"
        className="rounded-[16px] border border-[var(--vd-line)] bg-[var(--vd-surface)] p-4"
      >
        <p className="vd-eyebrow m-0">Waar je calorieën vandaan komen</p>
        <div
          role="img"
          aria-label={energie.delen.map((d) => `${d.label} ${procent(d.aandeel)}`).join(", ")}
          className="mt-3 flex h-4 overflow-hidden rounded-full bg-[var(--vd-track)]"
        >
          {energie.delen.map((deel) => (
            <div key={deel.sleutel} style={{ width: `${deel.aandeel * 100}%`, background: DEEL_KLEUR[deel.sleutel] }} />
          ))}
        </div>
        <ul className="m-0 mt-3 grid list-none grid-cols-3 gap-2 p-0">
          {energie.delen.map((deel) => (
            <li key={deel.sleutel} className="min-w-0">
              <span className="flex items-center gap-1.5 text-[0.6875rem] text-[var(--vd-ink-3)]">
                <span aria-hidden className="h-2 w-2 rounded-[3px]" style={{ background: DEEL_KLEUR[deel.sleutel] }} />
                {deel.label}
              </span>
              <b className="block font-mono text-[1.0625rem] text-[var(--vd-ink)]">{procent(deel.aandeel)}</b>
              <span className="block text-[0.6875rem] text-[var(--vd-ink-3)]">{hoeveelheid(deel.gram)} g</span>
            </li>
          ))}
        </ul>
        <p className="m-0 mt-3 text-[0.71875rem] leading-relaxed text-[var(--vd-ink-3)]">
          Van de calorieën uit eiwit, koolhydraten en vet die je dagboek kent (4 kcal per gram eiwit en koolhydraten,
          9 per gram vet). Een verdeling, geen oordeel: er is geen &ldquo;goede&rdquo; of &ldquo;slechte&rdquo; calorie.
        </p>
      </section>
    );
  }

  if (!vet) return null;
  const overig = 1 - vet.aandeelVerzadigd;
  return (
    <section
      aria-label="Waaruit je vet bestaat"
      className="rounded-[16px] border border-[var(--vd-line)] bg-[var(--vd-surface)] p-4"
    >
      <p className="vd-eyebrow m-0">Waaruit je vet bestaat</p>
      <div
        role="img"
        aria-label={`Verzadigd ${procent(vet.aandeelVerzadigd)}, overig vet ${procent(overig)}`}
        className="mt-3 flex h-4 overflow-hidden rounded-full bg-[var(--vd-track)]"
      >
        <div style={{ width: `${vet.aandeelVerzadigd * 100}%`, background: "var(--vd-terra)" }} />
        <div style={{ width: `${overig * 100}%`, background: "var(--vd-amber)" }} />
      </div>
      <p className="m-0 mt-3 text-[0.8125rem] text-[var(--vd-ink)]">
        <b>{procent(vet.aandeelVerzadigd)}</b> van je vet is verzadigd ({hoeveelheid(vet.verzadigdG)} van{" "}
        {hoeveelheid(vet.vetG)} g).
      </p>
      <p className="m-0 mt-2 text-[0.71875rem] leading-relaxed text-[var(--vd-ink-3)]">
        Over de dagen waarop je iets registreerde, voor producten met een gehalte. Het overige vet is
        enkel- en meervoudig onverzadigd vet en een beetje transvet; die uitsplitsing hebben we nog niet.
      </p>
    </section>
  );
}
