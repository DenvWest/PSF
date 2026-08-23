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

  const tabs: SchapTabDescriptor[] = [];

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

  // Favorieten van dit domein — snelle beheer.
  tabs.push({ id: "favorieten", label: "Favorieten" });

  // "begeleiding" rendert nooit vandaag: er is geen product om op te wachten
  // (docs/design/voortgang-plan-later.md §8). De tab komt terug samen met dat
  // product — een deur naar een leeg magazijn is geen deur.

  return tabs;
}

/**
 * Een schap bestaat exact waar `domain-product-stance` kandidaten kent
 * (`SCHAP_DOMAINS` === de domeinen met een stance), dus Producten is er altijd
 * en is altijd de opening. Sinds W4a is er geen Leefstijl-tab meer om op terug
 * te vallen — het schap gaat over aanbod, en dat is wat je als eerste ziet.
 */
export function resolveDefaultSchapTab(_domain: PillarId): SchapTabId {
  return "producten";
}

/**
 * Welke tab je krijgt als je vanaf het ene schap naar het andere springt.
 *
 * Sta je op Favorieten van slaap en klik je door naar voeding, dan wil je daar
 * ook Favorieten zien — je vergelijkt hetzelfde onderdeel over domeinen heen,
 * dat is de hele reden dat de domeinschakelaar bestaat. Alleen: Diensten
 * bestaat alleen op beweging, dus een tab die het doeldomein niet draagt valt
 * terug op zijn default in plaats van op een leeg paneel.
 */
export function resolveSchapTabForDomain(
  domain: PillarId,
  wanted: SchapTabId | null,
): SchapTabId {
  const tabs = resolveSchapTabs(domain);
  return wanted && tabs.some((tab) => tab.id === wanted)
    ? wanted
    : resolveDefaultSchapTab(domain);
}
