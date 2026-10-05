import SupermarktBronRegel from "@/components/dashboard/dagboek/SupermarktBronRegel";
import { isInformatieveStof, type InformatieveStof } from "@/lib/nutrition-rijkste-bronnen";
import { rondVoedingswaarde, type Voedingswaarde } from "@/lib/nutrition-voedingswaarde";
import type { SupermarktProduct } from "@/types/supermarkt-product";

/**
 * Calorieën, macro's en brede micronutriënten als etiket: een getal per regel,
 * %RI alleen bij vitamines en mineralen, in één neutrale tint. Geen vinkje en
 * geen kleur als oordeel; dat blijft voorbehouden aan de vijf stoffen in de
 * krans. Eiwit staat in beide en toont hetzelfde getal (zie
 * `nutrition-voedingswaarde.ts`).
 *
 * Met `onKiesStof` worden de rijen met een rijkste-bronnenlijst (vezels,
 * kalium, calcium, ijzer, B12, C) aantikbaar.
 */
export default function VoedingswaardeTabel({
  titel,
  toelichting,
  voedingswaarde,
  bronProducten,
  onKiesStof,
}: {
  titel: string;
  toelichting?: string;
  voedingswaarde: Voedingswaarde;
  bronProducten: readonly SupermarktProduct[];
  onKiesStof?: (stof: InformatieveStof) => void;
}) {
  const { rijen, zonderWaarde } = voedingswaarde;

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <h3 className="m-0 font-sans text-[13.5px] font-bold text-[var(--vd-ink)]">{titel}</h3>
        {toelichting ? (
          <span className="text-[10.5px] text-[var(--vd-ink-4)]">{toelichting}</span>
        ) : null}
      </header>

      <table className="w-full border-collapse text-[12.5px]">
        <thead className="sr-only">
          <tr>
            <th scope="col">Stof</th>
            <th scope="col">Hoeveelheid</th>
            <th scope="col">Deel van de referentie-inname</th>
          </tr>
        </thead>
        <tbody>
          {rijen.map((rij) => {
            const vulling = rij.aandeel === null ? 0 : Math.min(rij.aandeel, 1) * 100;
            return (
              <tr key={rij.veld} className="border-b border-white/[0.06] last:border-b-0">
                <th
                  scope="row"
                  className={`px-4 py-2 text-left font-normal ${
                    rij.waarvan ? "pl-7 text-[11.5px] text-[var(--vd-ink-3)]" : "text-[var(--vd-ink-2)]"
                  }`}
                >
                  {onKiesStof && isInformatieveStof(rij.veld) ? (
                    <button
                      type="button"
                      onClick={() => onKiesStof(rij.veld as InformatieveStof)}
                      aria-label={`${rij.label}: rijkste bronnen`}
                      className="flex cursor-pointer items-center gap-1 text-left underline decoration-white/20 underline-offset-[3px] transition-colors hover:text-[var(--vd-ink)] hover:decoration-white/50"
                    >
                      {rij.label}
                      <span aria-hidden className="text-[11px] text-[var(--vd-ink-4)]">›</span>
                    </button>
                  ) : (
                    rij.label
                  )}
                </th>
                <td className="whitespace-nowrap px-2 py-2 text-right font-mono tabular-nums text-[var(--vd-ink)]">
                  {rij.waarde === null ? (
                    <span className="italic text-[var(--vd-ink-4)]">n.o.</span>
                  ) : (
                    `${rondVoedingswaarde(rij.waarde)} ${rij.unit}`
                  )}
                </td>
                <td className="w-[38%] py-2 pr-4">
                  {rij.aandeel !== null ? (
                    <span className="flex items-center gap-2">
                      <span className="relative h-[6px] flex-1 overflow-hidden rounded-full bg-[var(--vd-track)]">
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 rounded-full bg-[var(--vd-ink-3)]"
                          style={{ width: `${vulling}%` }}
                        />
                      </span>
                      <span className="w-[52px] text-right font-mono text-[10.5px] tabular-nums text-[var(--vd-ink-3)]">
                        {Math.round(rij.aandeel * 100)}% RI
                      </span>
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <footer className="flex flex-col gap-1 border-t border-white/10 px-4 py-2.5">
        {zonderWaarde > 0 ? (
          <p className="m-0 text-[10.5px] leading-relaxed text-[var(--vd-ink-4)]">
            {zonderWaarde === 1
              ? "1 product heeft hier geen waarden en telt niet mee"
              : `${zonderWaarde} producten hebben hier geen waarden en tellen niet mee`}{" "}
            (supplement, of geen eigen NEVO-record). Dit is dus minstens wat je binnenkreeg.
          </p>
        ) : null}
        <p className="m-0 text-[10.5px] leading-relaxed text-[var(--vd-ink-4)]">
          Magnesium, zink, vitamine D en omega-3 staan in de krans van je dagboek. RI = referentie-inname
          (EU 1169/2011); energie en macro&apos;s krijgen geen percentage.
        </p>
        <SupermarktBronRegel producten={bronProducten} berekend />
      </footer>
    </section>
  );
}
