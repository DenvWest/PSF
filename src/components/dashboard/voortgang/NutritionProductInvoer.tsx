"use client";

import { useMemo, useState } from "react";
import { catalogEntry, searchCatalog } from "@/data/nutrition/food-catalog";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import {
  itemsVanMoment,
  nutrientenUitItems,
  type DagboekItem,
} from "@/lib/nutrition-dagboek-items";
import { nutrientReferences } from "@/data/nutrition/intake-reference";

/**
 * Eén dag invullen op productniveau — welk product, welk moment, hoeveel gram.
 *
 * ## Waarom naast de groepenvorm en niet in plaats daarvan
 *
 * `NutritionDagInvoer` vraagt per eetmoment welke voedselgroepen erin zaten.
 * Dat is de snelle vorm en blijft bestaan. Deze vorm is de precieze: hij weet
 * wélk product het was, en dat is het verschil tussen "1 portie vis" en
 * "140 g zalm". Op groepsniveau telt tonijn uit blik even zwaar als makreel,
 * en dat scheelt een factor vijftien in omega-3.
 *
 * Wie niets kiest, verliest niets: een dag zonder items valt terug op de
 * groepenvorm, en beide schrijven naar dezelfde `portions`.
 *
 * ## De ondergrens, in beeld en in woorden
 *
 * Onder de items staat wat ze samen minstens leveren. Drie dingen reizen
 * verplicht mee, en ze staan hier in de opmaak vast in plaats van in een
 * afspraak:
 *
 * 1. **Het woord "minstens".** Nooit weg te laten — niemand noemt alles.
 * 2. **Hoeveel items zwegen.** Het verschil tussen "je at weinig magnesium" en
 *    "van drie dingen weten we het gehalte niet".
 * 3. **Geen richtwaarde en geen percentage.** Dit scherm registreert; het
 *    oordeelt niet. Het percentage van de RI hoort op Je patroon, waar een
 *    venster van meerdere dagen eronder ligt.
 */

const GRAM_VELD =
  "w-16 rounded-lg border border-white/15 bg-white/[0.03] px-2 py-1 text-right text-[12px] tabular-nums text-[#E7EDE8] outline-none transition-colors focus:border-white/40";

const MOMENT_KNOP =
  "inline-flex min-h-8 cursor-pointer items-center rounded-full border px-3 text-[11.5px] font-medium transition-colors";

const ZOEK_VELD =
  "w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 text-[13px] text-[#E7EDE8] outline-none transition-colors placeholder:text-[#6F8177] focus:border-white/40";

export default function NutritionProductInvoer({
  items,
  onChange,
  busy = false,
}: {
  items: readonly DagboekItem[];
  onChange: (volgende: DagboekItem[]) => void;
  busy?: boolean;
}) {
  const [moment, setMoment] = useState<EetmomentId>("ontbijt");
  const [zoek, setZoek] = useState("");

  const treffers = useMemo(() => (zoek.trim() ? searchCatalog(zoek, 8) : []), [zoek]);
  const ondergrens = useMemo(() => nutrientenUitItems(items), [items]);

  function voegToe(key: string) {
    const entry = catalogEntry(key);
    if (!entry) return;
    // De eerste portie is wat mensen het vaakst bedoelen; die staat vooraan in
    // de catalogus. Aanpassen kan daarna in het gramveld.
    const grams = entry.porties[0]?.grams ?? 100;
    onChange([...items, { moment, key, grams }]);
    setZoek("");
  }

  function zetGram(index: number, grams: number) {
    const volgende = [...items];
    const bestaand = volgende[index];
    if (!bestaand) return;
    volgende[index] = { ...bestaand, grams };
    onChange(volgende);
  }

  function verwijder(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {EETMOMENTEN.map((eetmoment) => {
          const actief = eetmoment.id === moment;
          const aantal = itemsVanMoment(items, eetmoment.id).length;
          return (
            <button
              key={eetmoment.id}
              type="button"
              disabled={busy}
              onClick={() => setMoment(eetmoment.id)}
              aria-pressed={actief}
              className={`${MOMENT_KNOP} ${
                actief
                  ? "border-[#5A8F6A] bg-[#5A8F6A]/15 text-[#9CC5A9]"
                  : "border-white/15 bg-white/[0.03] text-[#9FB0A6] hover:border-white/30"
              } disabled:opacity-50`}
            >
              {eetmoment.label}
              {aantal > 0 ? (
                <span className="ml-1.5 tabular-nums text-[10.5px] opacity-70">{aantal}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <input
          type="search"
          value={zoek}
          disabled={busy}
          onChange={(event) => setZoek(event.target.value)}
          placeholder="Zoek een product…"
          aria-label={`Zoek een product voor ${moment}`}
          className={ZOEK_VELD}
        />
        {treffers.length > 0 ? (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-white/15 bg-[#16241a] shadow-xl">
            {treffers.map((entry) => (
              <li key={entry.key}>
                <button
                  type="button"
                  onClick={() => voegToe(entry.key)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FoodThumbnail entry={entry} size={40} />
                    <span className="truncate text-[13px] text-[#E7EDE8]">{entry.labelNl}</span>
                  </span>
                  <span className="text-[10.5px] text-[#6F8177]">
                    {entry.porties[0]?.labelNl ?? ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {items.map((item, index) => {
            const entry = catalogEntry(item.key);
            if (!entry) return null;
            return (
              <li
                key={`${item.moment}-${item.key}-${index}`}
                className="flex items-center gap-2 border-b border-white/[0.06] py-1.5 last:border-b-0"
              >
                <FoodThumbnail entry={entry} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-[#E7EDE8]">
                    {entry.labelNl}
                  </span>
                  <span className="block text-[10.5px] text-[#6F8177]">
                    {EETMOMENTEN.find((m) => m.id === item.moment)?.label}
                  </span>
                </span>
                <label className="flex items-center gap-1">
                  <span className="sr-only">Gram voor {entry.labelNl}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={2000}
                    value={item.grams}
                    disabled={busy}
                    onChange={(event) => zetGram(index, Number(event.target.value))}
                    className={GRAM_VELD}
                  />
                  <span className="text-[11px] text-[#6F8177]">g</span>
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => verwijder(index)}
                  aria-label={`Verwijder ${entry.labelNl}`}
                  className="cursor-pointer rounded-full px-1.5 py-0.5 text-[13px] leading-none text-[#6F8177] transition-colors hover:text-[#E7EDE8] disabled:opacity-40"
                >
                  &times;
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {ondergrens.length > 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
          <p className="text-[10.5px] uppercase tracking-[0.08em] text-[#6F8177]">
            Uit wat je noemde
          </p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {ondergrens.map((stof) => (
              <li
                key={stof.nutrient}
                className="flex items-baseline justify-between gap-3 text-[12px]"
              >
                <span className="text-[#9FB0A6]">{nutrientReferences[stof.nutrient].label}</span>
                <span className="tabular-nums text-[#E7EDE8]">
                  minstens {stof.minstens} {stof.unit}
                </span>
              </li>
            ))}
          </ul>
          {ondergrens.some((stof) => stof.zonderGehalte > 0) ? (
            <p className="mt-2 text-[10.5px] leading-relaxed text-[#6F8177]">
              Van sommige producten kennen we het gehalte nog niet — die tellen hier
              niet mee. Daarom staat er &ldquo;minstens&rdquo;: wat je vergat te noemen
              of wat we nog niet weten, kan er alleen bij komen.
            </p>
          ) : (
            <p className="mt-2 text-[10.5px] leading-relaxed text-[#6F8177]">
              Een som over wat je noemde is een ondergrens — niemand noemt alles.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
