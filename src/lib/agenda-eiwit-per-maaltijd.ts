import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  itemsVanMoment,
  nutrientenUitItems,
  sanitizeItems,
  zonderBenadering,
} from "@/lib/nutrition-dagboek-items";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";

export const EIWIT_STAP_ID = "nut-eiwit-per-maaltijd";
export const EIWIT_ONDERGRENS_GRAM = 20;

export const EIWIT_MAALTIJDEN: readonly { id: EetmomentId; label: string }[] = [
  { id: "ontbijt", label: "Ontbijt" },
  { id: "lunch", label: "Lunch" },
  { id: "avondeten", label: "Avondeten" },
];

export type EiwitMaaltijdStand = "gehaald" | "open" | "leeg";

export type EiwitMaaltijd = {
  id: EetmomentId;
  label: string;
  stand: EiwitMaaltijdStand;
  gram: number | null;
};

/**
 * "gehaald" bewijst dat de maaltijd het minimum haalde; "open" bewijst niets
 * (een dagboek is een ondergrens, zie de asymmetrie-regel) en "leeg" betekent
 * dat er voor dit moment niets is ingevuld.
 */
export function eiwitPerMaaltijd(dag: DagboekDag | null | undefined): EiwitMaaltijd[] {
  const items = sanitizeItems(dag?.items ?? []);
  return EIWIT_MAALTIJDEN.map(({ id, label }) => {
    const vanMoment = itemsVanMoment(items, id);
    if (vanMoment.length === 0) {
      return { id, label, stand: "leeg", gram: null };
    }
    const stof = nutrientenUitItems(vanMoment).find((entry) => entry.nutrient === "protein");
    const gram = Math.round(zonderBenadering(stof));
    return {
      id,
      label,
      stand: gram >= EIWIT_ONDERGRENS_GRAM ? "gehaald" : "open",
      gram,
    };
  });
}
