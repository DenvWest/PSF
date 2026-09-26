"use client";

/**
 * Fire-and-forget registratie van een supplement-klik voor plak 4
 * (click_token-attributie). Blokkeert de navigatie NIET — het href-attribuut
 * op AffiliateLink blijft de kale affiliate-URL; dit registreert alleen de
 * klik in sup_clicks voor latere conversie-koppeling (pd_conversions).
 *
 * URL-injectie van het token in de affiliate-link zelf is bewust nog niet
 * gebouwd: Daisycon (ws=<categorie>) en Arctic Blue (sld=dennisvanwestbroek)
 * hebben hun querystring al bezet met iets anders dan een per-klik sub-ID, en
 * het exacte extra parameter-format per partner is nog niet bevestigd. Zodra
 * dat bekend is, vult sup_retailers.tracking_param dat in en kan de URL-
 * opbouw in AffiliateLink het token gaan meesturen.
 *
 * sendBeacon voorkomt dat de call wordt afgebroken zodra de browser naar de
 * partnersite navigeert (fetch met keepalive is het alternatief, maar
 * sendBeacon is hier bewust gekozen: geen response nodig, geen reden om op
 * een antwoord te wachten).
 */
export function registerSupplementClick(input: {
  affiliateSlug: string;
  page: string;
  position?: number;
}): void {
  if (typeof navigator === "undefined" || !("sendBeacon" in navigator)) {
    return;
  }

  const payload = JSON.stringify({
    affiliateSlug: input.affiliateSlug,
    page: input.page,
    position: input.position ?? null,
  });

  try {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/supplements/click", blob);
  } catch {
    // Best effort — een mislukte registratie mag de klik zelf nooit blokkeren.
  }
}
