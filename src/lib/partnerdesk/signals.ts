import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Herberekent de signalen voor één partner. Onderdeel van het mutatie-contract:
 * elke relevante mutatie roept dit aan zodat het dashboard direct klopt.
 *
 * Plak 1: no-op — de zes checks (contract verloopt, opzegdeadline, geen
 * contactpersoon, ontbrekende commissie, contact stil, taak te laat) landen in
 * plak 4 samen met het "Vandaag"-dashboard. De aanroepen staan er nu al zodat
 * plak 4 alleen deze functie hoeft in te vullen.
 */
export async function recomputeSignalsForPartner(
  _db: SupabaseClient,
  _partnerId: string,
): Promise<void> {
  // Bewust leeg tot plak 4.
}
