"use client";

import { useState } from "react";
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
  onOpenLeefstijlprofiel: (domain: PillarId) => void;
};

export default function KeuzeScherm({
  model,
  data,
  domain,
  deel,
  onDeelChange,
  onSwitchDomain,
  onOpenLeefstijlprofiel,
}: KeuzeSchermProps) {
  // De URL is de bron bij binnenkomst; daarna wint de klik. `pushState` uit
  // het sync-pad werkt `useSearchParams` niet bij, dus het gekozen onderdeel
  // leeft hier — met zijn domein erbij, zodat het bij een domeinwissel vanzelf
  // vervalt in plaats van mee te reizen.
  const [deelOverride, setDeelOverride] = useState<
    { domain: PillarId; deel: SchapTabId } | null
  >(null);

  const activeDeel = deelOverride && deelOverride.domain === domain ? deelOverride.deel : deel;

  const handleDeelChange = (next: SchapTabId) => {
    setDeelOverride({ domain, deel: next });
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
    const next = resolveSchapTabForDomain(target, activeDeel);
    setDeelOverride({ domain: target, deel: next });
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
      activeTab={activeDeel}
      onTabChange={handleDeelChange}
      onSwitchDomain={handleSwitchDomain}
      onOpenLeefstijlprofiel={onOpenLeefstijlprofiel}
    />
  );
}
