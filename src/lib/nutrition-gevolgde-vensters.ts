import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import { VENSTERS, type VensterLengte } from "@/lib/nutrition-tekortsysteem";
import {
  VOEDINGSWAARDE_VELDEN,
  type Voedingswaarde,
  type VoedingswaardeVeld,
} from "@/lib/nutrition-voedingswaarde";

/**
 * De gevolgde stoffen in dezelfde vier vensters als de kernstoffen, voor de
 * rijen "Ook gevolgd" in Je patroon (`BESLUIT_DOELEN_VERBONDEN_2026-10.md`,
 * "Herziening").
 *
 * Per dag rekent de aanroeper `berekenVoedingswaarde` uit — dezelfde som als
 * de dagtabel in het dagboek, over catalogusproducten en etiketproducten. Hier
 * worden die dagen per venster gemiddeld.
 *
 * Zelfde noemer als het tekortsysteem: de dagen waarop je iets registreerde,
 * niet de kalenderdagen. Een dag zonder registratie is geen nul.
 *
 * Informatief: geen `gedekt`, geen richting. Het aandeel van de RI staat er
 * alleen bij waar een RI bestaat, zoals op het etiket.
 */

export type GevolgdVenster = {
  dagen_terug: VensterLengte;
  /** Gemiddelde per geregistreerde dag, of null als geen product een waarde had. */
  gemiddeld: number | null;
  aandeel: number | null;
  dagen: number;
};

export type GevolgdeReeks = VoedingswaardeVeld & { vensters: GevolgdVenster[] };

function datumTerug(vandaag: string, dagen: number): string {
  const datum = new Date(`${vandaag}T00:00:00Z`);
  datum.setUTCDate(datum.getUTCDate() - dagen);
  return datum.toISOString().slice(0, 10);
}

function geregistreerd(waarde: Voedingswaarde): boolean {
  return waarde.metWaarde + waarde.zonderWaarde > 0;
}

export function bouwGevolgdeVensters(
  perDag: ReadonlyMap<string, Voedingswaarde>,
  stoffen: readonly SupermarktVeld[],
  vandaag: string,
): GevolgdeReeks[] {
  return stoffen.flatMap((stof) => {
    const veld = VOEDINGSWAARDE_VELDEN.find((v) => v.veld === stof);
    if (!veld) return [];

    const vensters = VENSTERS.map((lengte): GevolgdVenster => {
      const grens = datumTerug(vandaag, lengte - 1);
      let som = 0;
      let heeftWaarde = false;
      let dagen = 0;
      for (const [datum, waarde] of perDag) {
        if (datum < grens || datum > vandaag || !geregistreerd(waarde)) continue;
        dagen += 1;
        const bedrag = waarde.rijen.find((rij) => rij.veld === stof)?.waarde;
        if (bedrag === null || bedrag === undefined) continue;
        som += bedrag;
        heeftWaarde = true;
      }
      const gemiddeld = heeftWaarde && dagen > 0 ? som / dagen : null;
      return {
        dagen_terug: lengte,
        gemiddeld,
        aandeel: gemiddeld !== null && veld.ri !== null ? gemiddeld / veld.ri : null,
        dagen,
      };
    });

    return [{ ...veld, vensters }];
  });
}
