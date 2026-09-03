import { VOEDSELGROEPEN, type VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Het 2+2-dagboek: twee doordeweekse dagen, twee weekenddagen.
 *
 * ## Waarom vier dagen en niet één, en niet dertig
 *
 * De elf sliders van de voedingscheck vragen naar een gemiddelde ("hoe vaak
 * meestal"). Daar antwoorden mensen met hun beste dag of met hun bedoeling —
 * niet uit oneerlijkheid, maar omdat een gemiddelde over weken nu eenmaal
 * niet uit het hoofd op te halen is.
 *
 * Eén geregistreerde dag lost dat niet op: dan meet je die ene dag. Wat
 * voedingsonderzoek met meerdaagse registraties wél oplevert, is het patroon —
 * en het best gedocumenteerde patroon in dat onderzoek is dat weekenddagen
 * systematisch afwijken van doordeweekse dagen. Twee van elk is het kleinste
 * aantal dat dat verschil zichtbaar maakt.
 *
 * Dertig dagen zou nauwkeuriger zijn en wordt niet ingevuld. Vier dagen is de
 * afruil die daadwerkelijk data oplevert.
 *
 * ## Wat het oplevert dat de check niet kan
 *
 * 1. **Het niveauverschil** — hoe ver ligt je weekend van je week af. Dat is
 *    een eigen bevinding: een vlak matig patroon vraagt iets anders dan een
 *    prima week met een ontspoord weekend.
 * 2. **Kalibratie** — het verschil tussen wat je in de check zei en wat je
 *    registreerde. Dat is een *dekkingsmaat*, geen fout: het maakt de check
 *    eerlijker over zijn eigen onzekerheid.
 *
 * ## Wat het nadrukkelijk niet is
 *
 * **Geen tweede score.** Zelfde lock als bij beweging (minuten = evidence,
 * nooit een tweede score). Dit verrijkt de readout van laag 5; het vervangt
 * `nutrition-score.ts` niet en voedt hem niet.
 *
 * **Geen calorieën, geen macro's, geen grammen.** Laag 5 is bewust dicht voor
 * tellen. Een dagboek dat per groep vraagt "hoeveel porties" is een steekproef
 * van je patroon, geen boekhouding van je inname — en dat onderscheid is
 * precies waarom deze laag hem wél mag dragen.
 */

/** Welke soort dag een registratie beschrijft. */
export type DagSoort = "doordeweeks" | "weekend";

/** Het streefaantal per soort. Twee van elk — zie de moduledoc. */
export const DAGEN_PER_SOORT = 2;

/** Samen vier: het volledige dagboek. */
export const DAGBOEK_TOTAAL = DAGEN_PER_SOORT * 2;

/**
 * De groepen die je per dag invult.
 *
 * Dezelfde zeven als de categorietabel op laag 1, en met opzet: het dagboek
 * moet tegen je check te leggen zijn, en dat kan alleen als beide over
 * dezelfde groepen praten. Een dagboek met een eigen indeling levert twee
 * beelden op die niemand op elkaar kan leggen.
 */
export const DAGBOEK_GROEPEN: readonly VoedselgroepId[] = VOEDSELGROEPEN.map(
  (groep) => groep.id,
);

/** Eén ingevulde dag: per groep het aantal porties. */
export type DagboekDag = {
  /** ISO-datum van de geregistreerde dag. */
  date: string;
  soort: DagSoort;
  /** Porties per voedselgroep. Ontbrekende groep = niet ingevuld, niet nul. */
  porties: Partial<Record<VoedselgroepId, number>>;
};

export type DagboekVoortgang = {
  doordeweeks: number;
  weekend: number;
  /** Compleet zodra beide soorten hun twee dagen hebben. */
  compleet: boolean;
  /** Wat er nu gevraagd wordt, of null als het dagboek vol is. */
  volgende: DagSoort | null;
};

/**
 * Zaterdag en zondag zijn weekend; de rest niet.
 *
 * Bewust geen instelbaarheid voor ploegendiensten. Dat lijkt zorgvuldiger maar
 * maakt het dagboek onvergelijkbaar tussen mensen én tussen eigen metingen —
 * en het verschil dat we willen zien is "de dagen waarop je anders eet", wat
 * voor vrijwel iedereen samenvalt met het kalenderweekend.
 */
export function dagSoortVoor(isoDate: string): DagSoort {
  const dag = new Date(`${isoDate}T12:00:00.000Z`).getUTCDay();
  return dag === 0 || dag === 6 ? "weekend" : "doordeweeks";
}

export function dagboekVoortgang(dagen: readonly DagboekDag[]): DagboekVoortgang {
  const doordeweeks = dagen.filter((dag) => dag.soort === "doordeweeks").length;
  const weekend = dagen.filter((dag) => dag.soort === "weekend").length;
  const compleet = doordeweeks >= DAGEN_PER_SOORT && weekend >= DAGEN_PER_SOORT;

  // Vraag door op wat het verst achterloopt; bij gelijkspel eerst een
  // doordeweekse dag, omdat die er vijf van de zeven zijn en dus sneller komt.
  let volgende: DagSoort | null = null;
  if (!compleet) {
    if (doordeweeks >= DAGEN_PER_SOORT) {
      volgende = "weekend";
    } else if (weekend >= DAGEN_PER_SOORT) {
      volgende = "doordeweeks";
    } else {
      volgende = doordeweeks <= weekend ? "doordeweeks" : "weekend";
    }
  }

  return { doordeweeks, weekend, compleet, volgende };
}

/** Gemiddeld aantal porties per groep, over een set dagen. */
function gemiddeldePorties(
  dagen: readonly DagboekDag[],
  groep: VoedselgroepId,
): number | null {
  const waarden = dagen
    .map((dag) => dag.porties[groep])
    .filter((waarde): waarde is number => typeof waarde === "number");
  if (waarden.length === 0) {
    return null;
  }
  return waarden.reduce((som, waarde) => som + waarde, 0) / waarden.length;
}

export type WeekendVerschilRij = {
  groep: VoedselgroepId;
  label: string;
  doordeweeks: number;
  weekend: number;
  /** Positief = meer in het weekend. */
  verschil: number;
};

/**
 * Hoe breed je bord staat: uit hoeveel van de zeven groepen je op een dag iets
 * eet.
 *
 * Dit is nadrukkelijk **breedte**, geen diversiteit. Wie vier dagen dezelfde
 * broccoli eet haalt hier een volle groentegroep — het dagboek registreert
 * porties per groep, niet welke bronnen erin zaten, en een maat die zich
 * anders voordoet dan hij is, is erger dan geen maat.
 *
 * Waarom hij er toch is: de weekendvergelijking ziet alleen groepen die je in
 * béide soorten dagen invulde. Een groep die je nooit eet valt daar stil weg —
 * geen verschil, dus geen rij. Precies dat gat vult deze telling.
 */
export type BreedteRij = {
  groep: VoedselgroepId;
  label: string;
  /** Op hoeveel geregistreerde dagen deze groep voorkwam. */
  dagen: number;
};

export type DagboekBreedte = {
  /** Gemiddeld aantal groepen per dag, over alle geregistreerde dagen. */
  gemiddeldPerDag: number;
  /** Groepen die op geen enkele dag voorkwamen. */
  ontbrekend: BreedteRij[];
  /** Eén regel; null zolang er nog niets te zeggen valt. */
  regel: string | null;
};

export type DagboekUitkomst = {
  voortgang: DagboekVoortgang;
  /**
   * Groepen waar week en weekend meetbaar uiteenlopen, grootste verschil
   * eerst. Leeg zolang het dagboek niet compleet is — een verschil op één dag
   * per soort is ruis, geen patroon.
   */
  verschillen: WeekendVerschilRij[];
  /**
   * Hoe breed je bord staat. Anders dan `verschillen` telt dit al vanaf één
   * dag: "je at vandaag uit drie groepen" is meteen waar, terwijl een
   * weekendpatroon vier dagen nodig heeft.
   */
  breedte: DagboekBreedte;
  /** Eén regel over het patroon; null zolang er niets te zeggen valt. */
  samenvatting: string | null;
};

/**
 * Vanaf welk verschil we het een verschil noemen.
 *
 * Een halve portie per dag valt binnen wat iemand zich verkeerd herinnert.
 * Eén hele portie is de kleinste eenheid die het dagboek zelf kent, en dus de
 * eerlijkste drempel: alles daaronder claimt precisie die de invoer niet heeft.
 */
const VERSCHIL_DREMPEL = 1;

function groepLabel(groep: VoedselgroepId): string {
  return VOEDSELGROEPEN.find((entry) => entry.id === groep)?.label ?? groep;
}

/**
 * Een groep telt mee op een dag zodra er minstens één portie staat.
 *
 * Nul is bewust géén "gegeten": wie invult dat hij die dag geen vis at, heeft
 * die groep niet op zijn bord gehad. Een ontbrekende sleutel en een nul zijn
 * hier dus hetzelfde — het verschil tussen "niet ingevuld" en "niks van
 * gegeten" doet er voor breedte niet toe.
 */
function groepenOpDag(dag: DagboekDag): VoedselgroepId[] {
  return DAGBOEK_GROEPEN.filter((groep) => (dag.porties[groep] ?? 0) > 0);
}

export function berekenBreedte(dagen: readonly DagboekDag[]): DagboekBreedte {
  if (dagen.length === 0) {
    return { gemiddeldPerDag: 0, ontbrekend: [], regel: null };
  }

  const dagenPerGroep = new Map<VoedselgroepId, number>();
  let totaal = 0;

  for (const dag of dagen) {
    const groepen = groepenOpDag(dag);
    totaal += groepen.length;
    for (const groep of groepen) {
      dagenPerGroep.set(groep, (dagenPerGroep.get(groep) ?? 0) + 1);
    }
  }

  const gemiddeldPerDag = totaal / dagen.length;

  const ontbrekend: BreedteRij[] = DAGBOEK_GROEPEN.filter(
    (groep) => (dagenPerGroep.get(groep) ?? 0) === 0,
  ).map((groep) => ({ groep, label: groepLabel(groep), dagen: 0 }));

  return {
    gemiddeldPerDag,
    ontbrekend,
    regel: bouwBreedteRegel(gemiddeldPerDag, ontbrekend, dagen.length),
  };
}

/**
 * De regel onder de breedte.
 *
 * Zonder oordeel over het getal: er is geen norm voor "aantal voedselgroepen
 * per dag", dus er staat nergens dat vier beter is dan drie. Wat er wél staat
 * is wat je registreerde, en welke groepen op geen enkele dag voorkwamen —
 * dat laatste is de bevinding die de weekendvergelijking niet kan geven.
 */
function bouwBreedteRegel(
  gemiddeld: number,
  ontbrekend: readonly BreedteRij[],
  aantalDagen: number,
): string {
  const afgerond = gemiddeld.toFixed(1).replace(".", ",");
  const dagWoord = aantalDagen === 1 ? "dag" : "dagen";
  const basis = `Over ${aantalDagen} ${dagWoord} at je uit gemiddeld ${afgerond} van de ${DAGBOEK_GROEPEN.length} groepen per dag.`;

  if (ontbrekend.length === 0) {
    return `${basis} Elke groep kwam minstens één keer voorbij.`;
  }
  if (ontbrekend.length === 1) {
    return `${basis} ${ontbrekend[0].label} kwam op geen enkele dag voor.`;
  }
  const namen = ontbrekend.map((rij) => rij.label.toLowerCase());
  const laatste = namen.pop();
  return `${basis} ${namen.join(", ")} en ${laatste} kwamen op geen enkele dag voor.`;
}

export function analyseerDagboek(dagen: readonly DagboekDag[]): DagboekUitkomst {
  const voortgang = dagboekVoortgang(dagen);
  const breedte = berekenBreedte(dagen);

  if (!voortgang.compleet) {
    return { voortgang, verschillen: [], breedte, samenvatting: null };
  }

  const doordeweekse = dagen.filter((dag) => dag.soort === "doordeweeks");
  const weekenddagen = dagen.filter((dag) => dag.soort === "weekend");

  const verschillen: WeekendVerschilRij[] = [];
  for (const groep of DAGBOEK_GROEPEN) {
    const week = gemiddeldePorties(doordeweekse, groep);
    const weekend = gemiddeldePorties(weekenddagen, groep);
    if (week == null || weekend == null) {
      continue;
    }
    const verschil = weekend - week;
    if (Math.abs(verschil) < VERSCHIL_DREMPEL) {
      continue;
    }
    verschillen.push({
      groep,
      label: groepLabel(groep),
      doordeweeks: week,
      weekend,
      verschil,
    });
  }

  verschillen.sort((a, b) => Math.abs(b.verschil) - Math.abs(a.verschil));

  return {
    voortgang,
    verschillen,
    breedte,
    samenvatting: bouwSamenvatting(verschillen),
  };
}

/**
 * De regel boven de verschillen.
 *
 * Geen oordeel over het weekend — een weekend dat anders loopt is normaal, en
 * er staat nergens dat het niet mag. Wat er staat is of het verschil er is en
 * waar het het grootst is, zodat je zelf kunt bepalen of je er iets mee wilt.
 */
function bouwSamenvatting(verschillen: readonly WeekendVerschilRij[]): string {
  if (verschillen.length === 0) {
    return "Je weekend eet als je week. Dat maakt je check-antwoorden makkelijker te vertrouwen: er is geen tweede patroon dat eronder wegvalt.";
  }

  const grootste = verschillen[0];
  const richting = grootste.verschil > 0 ? "meer" : "minder";
  const rest =
    verschillen.length > 1
      ? ` Ook op ${verschillen.length - 1} andere ${verschillen.length === 2 ? "groep" : "groepen"} loopt het uiteen.`
      : "";

  return `In het weekend eet je ${richting} ${grootste.label.toLowerCase()} dan doordeweeks.${rest} Je check vraagt naar een gemiddelde — dit laat zien wat daaronder zit.`;
}

/**
 * Wat het dagboek zegt over de betrouwbaarheid van de check.
 *
 * Uitdrukkelijk geen correctie op de check: de check blijft staan zoals hij is.
 * Dit is een uitspraak over hoe zeker we van dat antwoord mogen zijn, en die
 * hoort bij de meting te staan in plaats van erin verwerkt te worden.
 */
export function dekkingsRegel(uitkomst: DagboekUitkomst): string | null {
  if (!uitkomst.voortgang.compleet) {
    const { doordeweeks, weekend } = uitkomst.voortgang;
    const gedaan = doordeweeks + weekend;
    if (gedaan === 0) {
      return null;
    }
    return `${gedaan} van ${DAGBOEK_TOTAAL} dagen ingevuld. Vanaf vier dagen zien we het verschil tussen je week en je weekend.`;
  }

  return uitkomst.verschillen.length === 0
    ? "Vier dagen ingevuld, geen weekendafwijking gevonden."
    : `Vier dagen ingevuld; op ${uitkomst.verschillen.length} ${uitkomst.verschillen.length === 1 ? "groep" : "groepen"} wijkt je weekend af.`;
}
