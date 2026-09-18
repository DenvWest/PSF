"use client";

import { catalogEntry } from "@/data/nutrition/food-catalog";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import {
  itemsVanMoment,
  nutrientenUitItems,
  type DagboekItem,
} from "@/lib/nutrition-dagboek-items";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * Eén eetmoment als tabel: de stoffen staan boven de rijen, niet per item.
 *
 * ## Waarom kolomkoppen en geen strookje per product
 *
 * De eerste vorm hiervan zette onder elke productnaam vier gekleurde
 * segmentjes. Dat leest als decoratie: je ziet dát er iets bijdraagt maar niet
 * wat, en om het te weten moet je per item uitklappen.
 *
 * Eén tabel per maaltijd lost dat op. De kolom zegt welke stof, de rij welk
 * product, en het subtotaal onderaan zegt wat de maaltijd als geheel leverde.
 * Dat is de vorm die voedingsrapportages al decennia gebruiken, en hij werkt
 * omdat je verticaal kunt vergelijken.
 *
 * ## `n.o.` is geen nul
 *
 * Een product waarvan de gehaltes nog niet zijn opgehaald, toont `n.o.` en
 * geen streepje of nul. Die regel telt wél mee voor je voedselgroep en je
 * breedte — hij mist alleen zijn milligrammen. Een nul zou beweren dat er
 * niets in zit.
 */

const KOLOMMEN: readonly { id: NutrientId; kop: string }[] = [
  { id: "magnesium", kop: "Magn. mg" },
  { id: "protein", kop: "Eiwit g" },
  { id: "zinc", kop: "Zink mg" },
  { id: "omega3", kop: "Ω-3 mg" },
];

/** Wat één item van één stof levert, of null als het gehalte ontbreekt. */
function bedragVoor(item: DagboekItem, nutrient: NutrientId): number | null {
  const enkel = nutrientenUitItems([item]).find((n) => n.nutrient === nutrient);
  return enkel ? enkel.minstens : null;
}

/** De eenheid staat in de kolomkop, dus hier alleen het getal. */
function toon(waarde: number | null): string {
  if (waarde === null) return "n.o.";
  if (waarde >= 100) return `${Math.round(waarde)}`;
  return `${Math.round(waarde * 10) / 10}`;
}

export default function DagboekMaaltijd({
  moment,
  label,
  items,
  onVerwijder,
  onGram,
  onToevoegen,
  busy = false,
}: {
  moment: EetmomentId;
  label: string;
  items: readonly DagboekItem[];
  onVerwijder: (item: DagboekItem) => void;
  onGram: (item: DagboekItem, grams: number) => void;
  onToevoegen: (moment: EetmomentId) => void;
  busy?: boolean;
}) {
  const eigen = itemsVanMoment(items, moment);
  const totalen = nutrientenUitItems(eigen);

  /** De opvallendste bijdrage, voor de kop. */
  const grootste = [...totalen].sort((a, b) => {
    const rel = (n: typeof a) => (n.unit === "g" ? n.minstens * 10 : n.minstens);
    return rel(b) - rel(a);
  })[0];

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10">
      <header className="flex items-center justify-between gap-2.5 border-b border-white/10 bg-white/[0.03] px-3 py-2.5">
        <h3 className="m-0 font-sans text-[13.5px] font-bold text-[#F1EFE8]">{label}</h3>
        <div className="flex items-center gap-2.5">
          <span className="text-right font-mono text-[10px] leading-tight tabular-nums text-[#6F8177]">
            {grootste ? (
              <>
                <b className="block text-[11px] font-normal text-[#9FB0A6]">
                  {grootste.minstens} {grootste.unit}{" "}
                  {nutrientReferences[grootste.nutrient].label.toLowerCase()}
                </b>
                {eigen.length} {eigen.length === 1 ? "item" : "items"}
              </>
            ) : (
              <b className="block text-[11px] font-normal text-[#6F8177]">Nog leeg</b>
            )}
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => onToevoegen(moment)}
            className="cursor-pointer whitespace-nowrap rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-[#9FB0A6] transition-colors hover:border-[#5A8F6A] hover:text-[#9CC5A9] disabled:opacity-50"
          >
            + Toevoegen
          </button>
        </div>
      </header>

      {eigen.length === 0 ? (
        <p className="m-0 px-3 py-2.5 text-[11.5px] italic leading-relaxed text-[#6F8177]">
          Nog niets geregistreerd voor {label.toLowerCase()}.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-1.5 text-left text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#6F8177]">
                  Product
                </th>
                {KOLOMMEN.map((kolom) => (
                  <th
                    key={kolom.id}
                    className="w-[52px] px-1 py-1.5 text-right text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#6F8177]"
                  >
                    {kolom.kop}
                  </th>
                ))}
                <th className="w-8 px-1 py-1.5">
                  <span className="sr-only">Verwijderen</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {eigen.map((item, index) => {
                const entry = catalogEntry(item.key);
                if (!entry) return null;
                return (
                  <tr
                    key={`${item.key}-${index}`}
                    className="border-b border-white/[0.06] last:border-b-0"
                  >
                    <td className="max-w-0 px-3 py-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <FoodThumbnail entry={entry} size={40} />
                        <span className="block min-w-0 truncate text-[12.5px] font-medium text-[#F1EFE8]">
                          {entry.labelNl}
                        </span>
                      </span>
                      <label className="mt-0.5 flex items-center gap-1">
                        <span className="sr-only">Gram voor {entry.labelNl}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={2000}
                          value={item.grams}
                          disabled={busy}
                          onChange={(event) => onGram(item, Number(event.target.value))}
                          className="w-14 rounded-md border border-white/12 bg-black/25 px-1.5 py-0.5 text-right font-mono text-[10.5px] tabular-nums text-[#9FB0A6] outline-none transition-colors focus:border-white/40"
                        />
                        <span className="font-mono text-[10px] text-[#6F8177]">g</span>
                      </label>
                    </td>
                    {KOLOMMEN.map((kolom) => {
                      const bedrag = bedragVoor(item, kolom.id);
                      return (
                        <td
                          key={kolom.id}
                          className={`px-1 py-2 text-right font-mono text-[11px] tabular-nums ${
                            bedrag === null ? "italic text-[#5D6E62]" : "text-[#9FB0A6]"
                          }`}
                        >
                          {toon(bedrag)}
                        </td>
                      );
                    })}
                    <td className="px-1 py-2 text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onVerwijder(item)}
                        aria-label={`Verwijder ${entry.labelNl}`}
                        className="cursor-pointer rounded px-1 text-[13px] leading-none text-[#6F8177] transition-colors hover:text-[#F1EFE8] disabled:opacity-40"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-white/[0.03]">
                <td className="px-3 py-2 text-[11.5px] font-bold text-[#F1EFE8]">
                  Samen minstens
                </td>
                {KOLOMMEN.map((kolom) => {
                  const totaal = totalen.find((t) => t.nutrient === kolom.id);
                  return (
                    <td
                      key={kolom.id}
                      className="px-1 py-2 text-right font-mono text-[11px] font-bold tabular-nums text-[#F1EFE8]"
                    >
                      {totaal ? toon(totaal.minstens) : "—"}
                    </td>
                  );
                })}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
