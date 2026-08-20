import { SCHAP_DIENST_CARDS } from "@/data/movement/schap-diensten";
import { hasSchap, toProductStanceDomain } from "@/lib/schap-availability";
import type { PillarId, SchapTabId } from "@/types/dashboard";

/**
 * Welke sub-oppervlakken een schap draagt.
 *
 * Een tab zonder inhoud rendert niet — `BESLUIT_BEWEGING_PRODUCT_EN_IA.md`
 * §A.4, ontwerpverbod 5: geen navigatie-item dat op zichzelf niets doet. Een
 * lege Diensten-tab op slaap belooft aanbod dat er niet is, en dat is precies
 * het soort belofte dat het schap moet weerleggen.
 */
export type SchapTabDescriptor = { id: SchapTabId; label: string };

export function resolveSchapTabs(domain: PillarId): SchapTabDescriptor[] {
  if (!hasSchap(domain)) {
    return [];
  }

  const tabs: SchapTabDescriptor[] = [
    // Altijd, op elk domein mét schap. De spiegel: wat je op de ladder koos,
    // geteld per laag. Draagt zelf geen aanbod, dus hij kan nooit leeg zijn.
    { id: "leefstijl", label: "Leefstijl" },
  ];

  // Alleen waar domain-product-stance kandidaten kent. Stress staat daar op
  // `lifestyle_first` en heeft daarom sowieso geen schap; verbinding komt er
  // niet in voor.
  if (toProductStanceDomain(domain) !== null) {
    tabs.push({ id: "producten", label: "Producten" });
  }

  // Vandaag uitsluitend beweging: SCHAP_DIENST_CARDS is de enige dienstdata
  // die bestaat. Slaap en voeding krijgen deze tab zodra er redactionele
  // kaarten mét oordeel én herzieningsdatum zijn, niet eerder.
  if (domain === "beweging" && SCHAP_DIENST_CARDS.length > 0) {
    tabs.push({ id: "diensten", label: "Diensten" });
  }

  // "begeleiding" rendert nooit vandaag: er is geen product om op te wachten
  // (docs/design/voortgang-plan-later.md §8). De tab komt terug samen met dat
  // product — een deur naar een leeg magazijn is geen deur.

  return tabs;
}

export function resolveDefaultSchapTab(domain: PillarId): SchapTabId {
  return toProductStanceDomain(domain) !== null ? "producten" : "leefstijl";
}
