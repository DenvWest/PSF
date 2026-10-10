"use client";

import SchapView from "@/components/dashboard/voortgang/SchapView";
import { trackEvent } from "@/lib/ga4";
import { hasSchap } from "@/lib/schap-availability";
import { resolveSchapTabForDomain } from "@/lib/schap-tabs";
import type { DashboardData, DashboardModel, PillarId, SchapTabId } from "@/types/dashboard";

/**
 * De Keuze-tab: het aanbod van één domein plus wat je daaruit koos.
 *
 * **Waarom domein-gescoped en niet één lijst over alle domeinen.** Een
 * domein-overstijgend "wat koos ik"-scherm heeft hier tot 22 augustus gestaan
 * (`screen=favorieten`) en is toen opgeheven: er stonden twee deuren met
 * hetzelfde label naar twee verschillende schermen. Die splitsing komt niet
 * terug. De tab landt daarom direct op het schap van het domein dat er nu toe
 * doet — je prioriteit — en de domeinschakelaar (rail op md+, balk in de
 * header daaronder) is de enige plek waar je van domein wisselt.
 */

type KeuzeSchermProps = {
  model: DashboardModel;
  data?: DashboardData;
  domain: PillarId;
  deel: SchapTabId | null;
  onDeelChange: (domain: PillarId, deel: SchapTabId) => void;
  onSwitchDomain: (domain: PillarId, deel: SchapTabId) => void;
};

export default function KeuzeScherm({
  model,
  data,
  domain,
  deel,
  onDeelChange,
  onSwitchDomain,
}: KeuzeSchermProps) {
  // Het onderdeel komt uit het dashboard, dat het bij klik én bij terug/vooruit
  // uit de URL bijwerkt — hier geen eigen kopie, anders wint die van de terug-knop.
  const handleDeelChange = (next: SchapTabId) => {
    onDeelChange(domain, next);
  };

  /**
   * Van schap naar schap, met je onderdeel mee. Anders wisselt de
   * domeinschakelaar stilletjes ook je onderdeel, en dat leest als een fout:
   * je klikte op een domein, niet op Producten.
   */
  const handleSwitchDomain = (target: PillarId) => {
    if (target === domain || !hasSchap(target)) {
      return;
    }
    const next = resolveSchapTabForDomain(target, deel);
    // `choice.shelf_opened` (durable) en de Clarity-tag vuren al in SchapView
    // zelf, met herkomst `from_state: "schap"`; hier alleen de GA4-reeks, zodat
    // te zien is hoe vaak iemand binnen de Keuze-tab van domein wisselt in
    // plaats van via de hoofdnavigatie opnieuw binnen te komen.
    trackEvent("dashboard_keuze_domein_wissel", { from: domain, to: target });
    onSwitchDomain(target, next);
  };

  return (
    <SchapView
      model={model}
      data={data}
      domain={domain}
      activeTab={deel}
      onTabChange={handleDeelChange}
      onSwitchDomain={handleSwitchDomain}
    />
  );
}
