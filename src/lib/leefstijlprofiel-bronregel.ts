import { CHECK_NAME } from "@/lib/kompas-domain-check";
import type { PillarId } from "@/types/dashboard";

/**
 * Eén bronregel boven de ladder: wanneer is dit gemeten, wanneer verandert het.
 * Geen tweede score, geen balk.
 */
export function buildLeefstijlprofielBronregel(input: {
  domain: PillarId;
  daysAgo: number | undefined;
  dueDate: string | null;
  hasReadout: boolean;
}): string {
  const checkNaam = CHECK_NAME[input.domain];
  const parts: string[] = [];

  if (checkNaam && input.daysAgo != null) {
    const when =
      input.daysAgo === 0
        ? "vandaag"
        : input.daysAgo === 1
          ? "gisteren"
          : `${input.daysAgo} dagen geleden`;
    parts.push(`Zoals je ${checkNaam} van ${when} ze achterliet.`);
  } else if (checkNaam) {
    parts.push(`Je ${checkNaam} heeft deze delen nog niet apart beoordeeld.`);
  }

  if (checkNaam && !input.hasReadout) {
    parts.push("Wat hier staat is je keuze en de datum.");
  }

  if (input.dueDate) {
    parts.push(`Je hermeting staat op ${input.dueDate} — dan verandert dit.`);
  }

  return parts.join(" ");
}
