import { NEVO_CITATION } from "@/data/nutrition/food-sources";
import type { NevoFood } from "@/types/nevo-food";

/**
 * Bronvermelding voor NEVO-gegevens, zoals de RIVM-voorwaarden (versie 2025/9.0)
 * die voorschrijven. Client-veilig: geen database-import.
 *
 * - Bij elke weergave van een NEVO-waarde: {@link NEVO_CITATION}.
 * - Bij berekende uitvoer (dagtotaal, ring, portie-omrekening): {@link NEVO_BEREKEND_CITATION},
 *   en de "en andere gegevens"-variant zodra hetzelfde scherm ook andere bronnen
 *   (Open Food Facts, eigen invoer) optelt.
 */
export { NEVO_CITATION };

export const NEVO_BEREKEND_CITATION = "Gebaseerd op gegevens van NEVO-online versie 2025/9.0, RIVM, Bilthoven";

export const NEVO_BEREKEND_ANDERE_CITATION = `${NEVO_BEREKEND_CITATION} en andere gegevens`;

export const NEVO_URL = "https://www.rivm.nl/nevo";

/** De bronregel bij een weergegeven NEVO-voedingsmiddel, met de versie van die rij. */
export function nevoBronRegel(voedingsmiddel: Pick<NevoFood, "nevoVersie">): string {
  return NEVO_CITATION.replace("2025/9.0", voedingsmiddel.nevoVersie);
}

/** Bronlabel voor in een zoeklijst: "NEVO 2025/9.0 (RIVM)". */
export function nevoBronLabel(voedingsmiddel: Pick<NevoFood, "nevoVersie">): string {
  return `NEVO ${voedingsmiddel.nevoVersie} (RIVM)`;
}

/** Bronregel voor berekende uitvoer; `metAndereBronnen` kiest de "en andere gegevens"-variant. */
export function nevoBerekendeBronRegel(metAndereBronnen: boolean): string {
  return metAndereBronnen ? NEVO_BEREKEND_ANDERE_CITATION : NEVO_BEREKEND_CITATION;
}
