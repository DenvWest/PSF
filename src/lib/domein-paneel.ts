import type { Meetreeks } from "@/lib/voortgang-meetreeks";

/**
 * Het domeinpaneel — micro, meso en macro-anker in één vaste vorm, voor elk
 * domein hetzelfde.
 *
 * **Het probleem dat dit oplost.** Voeding heeft zes gevulde lagen; slaap,
 * stress, beweging en verbinding hebben er één (de supplement-poort op P6).
 * Daardoor voelde voeding niet als "hetzelfde patroon met meer data" maar als
 * een apart product. Dit paneel legt de vorm vast die elk domein deelt, zodat
 * het verschil tussen domeinen alleen nog in de *inhoud* zit — niet in de
 * opbouw van het scherm.
 *
 * **De twee zones.**
 * - `meso` — de reeks sinds je check. Beweegt het de goede kant op?
 * - `macro` — een *verwijzing* naar je domeinscore, nooit een tweede berekening.
 *
 * **Waarom macro alleen een anker is.** De score komt uit de leefstijlcheck en
 * hoort op Voortgang-home; die blijft de macro-laag. Als dit paneel een eigen
 * getal zou tonen, heb je twee cijfers over hetzelfde domein die op verschillende
 * momenten verschillende dingen zeggen. Het anker toont daarom de score die de
 * check gaf, met de datum erbij, en linkt terug — het herhaalt de bron in plaats
 * van hem te beconcurreren.
 *
 * **Waarom er geen "laatst bijgehouden"-zone meer is.** Die toonde je laatste
 * dagboekdag, maar alleen voeding heeft een dagboek — bij de andere vier stond
 * er een regel die uitlegde waaróm er niets stond. Vier van de vijf domeinen
 * openden dus met een alinea over een ontbrekende bron, vóór het antwoord dat
 * er wél was. De dagboekdag zelf staat op P5, waar hij hoort.
 */

export type MesoZone =
  | { staat: "reeks"; meetreeks: Meetreeks; momenten: number }
  | { staat: "nulpunt"; datumLabel: string | null }
  | { staat: "leeg" };

export type MacroAnker = {
  score: number | null;
  /** Hoe lang geleden de check was, in dagen. Null als er geen check is. */
  daysAgo: number | null;
  /** Wanneer de eerstvolgende hermeting staat, als weergavetekst. */
  hermetingLabel: string | null;
};

export type DomeinPaneel = {
  meso: MesoZone;
  macro: MacroAnker;
};

export function buildMesoZone(meetreeks: Meetreeks | null): MesoZone {
  const momenten = meetreeks?.moments.length ?? 0;
  if (!meetreeks || momenten === 0) {
    return { staat: "leeg" };
  }
  if (momenten === 1) {
    return { staat: "nulpunt", datumLabel: meetreeks.moments[0]?.dateLabel ?? null };
  }
  return { staat: "reeks", meetreeks, momenten };
}

export function buildDomeinPaneel({
  meetreeks,
  score,
  daysAgo,
  hermetingLabel,
}: {
  meetreeks: Meetreeks | null;
  score: number | null;
  daysAgo: number | null;
  hermetingLabel: string | null;
}): DomeinPaneel {
  return {
    meso: buildMesoZone(meetreeks),
    macro: { score, daysAgo, hermetingLabel },
  };
}

/**
 * De regel onder het macro-anker. Zegt waar het getal vandaan komt en wanneer
 * het weer beweegt — nooit of het goed of slecht is; dat oordeel hoort bij de
 * check zelf.
 */
export function macroBronregel(macro: MacroAnker): string {
  if (macro.score == null) {
    return "Je hebt dit domein nog niet gemeten.";
  }
  const wanneer =
    macro.daysAgo == null
      ? "uit je leefstijlcheck"
      : macro.daysAgo === 0
        ? "uit je check van vandaag"
        : macro.daysAgo === 1
          ? "uit je check van gisteren"
          : `uit je check van ${macro.daysAgo} dagen geleden`;
  const volgende = macro.hermetingLabel
    ? ` Bijgewerkt bij je hermeting op ${macro.hermetingLabel}.`
    : "";
  return `Dit cijfer komt ${wanneer}.${volgende}`;
}
