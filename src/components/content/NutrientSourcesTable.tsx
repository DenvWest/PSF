import type { NutrientBronnenLijst } from "@/lib/nutrition-nutrient-index";

/**
 * Waar zit deze stof in — publiek, en met de onzekerheid erbij.
 *
 * ## De vier regels die deze tabel niet mag breken
 *
 * 1. **Per portie, nooit opgeteld.** `food-sources.ts` zegt het letterlijk:
 *    deze waarden tellen niet op tot een dagtotaal. De lijst staat er om te
 *    kunnen kíezen tussen bronnen, niet om inname te berekenen. Er staat hier
 *    dus ook geen som en geen percentage van een dagbehoefte.
 * 2. **Een band, geen punt.** De rijen zijn gesorteerd op de ónderkant van de
 *    spreidingsband — het enige getal dat we durven claimen. Die ondergrens is
 *    ook wat er staat, met "minstens" ervoor.
 * 3. **De opname telt mee.** Bij magnesium en zink bindt fytaat een deel van
 *    de stof. Dat staat náást het gehalte en niet eronder, want anders leest
 *    een plantaardige bron te hoog.
 * 4. **`verified` is zichtbaar.** Een gehalte dat tegen USDA is gelegd leest
 *    anders dan een indicatieve literatuurwaarde. Dat verschil verstoppen zou
 *    het veld betekenisloos maken.
 *
 * Deze tabel is de eerste plek waar dat werk een publiek bereik krijgt: tot nu
 * toe stonden de gehaltes alleen in het dashboard, achter de inlog.
 */

const TH =
  "px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500";
const TD = "px-3 py-3 align-top text-sm text-stone-700";

export default function NutrientSourcesTable({
  lijst,
  caption,
}: {
  lijst: NutrientBronnenLijst;
  caption: string;
}) {
  if (lijst.regels.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white">
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-stone-50/80">
          <tr className="border-b border-stone-200/90">
            <th scope="col" className={TH}>
              Voedingsmiddel
            </th>
            <th scope="col" className={TH}>
              Portie
            </th>
            <th scope="col" className={TH}>
              Minstens
            </th>
          </tr>
        </thead>
        <tbody>
          {lijst.regels.map((regel) => (
            <tr key={regel.key} className="border-b border-stone-100 last:border-0">
              <th scope="row" className={`${TD} font-medium text-stone-900`}>
                {regel.labelNl}
                {regel.opname.reduced && regel.opname.why ? (
                  <span className="mt-1 block text-[12px] font-normal leading-snug text-amber-800">
                    {regel.opname.why}
                  </span>
                ) : null}
              </th>
              <td className={TD}>{regel.portieLabel}</td>
              <td className={`${TD} tabular-nums`}>
                {regel.band.lo} {regel.unit}
                <span className="mt-0.5 block text-[11px] text-stone-500">
                  {regel.verified
                    ? `${regel.herkomst.naam ?? "Brondataset"}${
                        regel.herkomst.edition ? ` ${regel.herkomst.edition}` : ""
                      }`
                    : "indicatief — nog niet tegen een brondataset gelegd"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-2 border-t border-stone-200/90 bg-stone-50/60 px-3 py-3 text-[12px] leading-relaxed text-stone-600">
        <p>
          De getallen gelden <strong>per portie</strong> en tellen niet op tot een
          dagtotaal. Ze staan er om te kunnen kiezen tussen bronnen. Genoemd is
          steeds de ondergrens van de spreiding — wat je minstens binnenkrijgt.
        </p>
        {lijst.opnameAnnotatie ? <p>{lijst.opnameAnnotatie}</p> : null}
        <p>
          {lijst.geverifieerd === 0
            ? "Geen van deze gehaltes is tegen een brondataset gelegd — ze komen uit de literatuur en zijn indicatief."
            : `${lijst.geverifieerd} van de ${lijst.regels.length} regels dragen een gehalte dat tegen een brondataset is gelegd; de rest is indicatief.`}
        </p>
      </div>
    </div>
  );
}
