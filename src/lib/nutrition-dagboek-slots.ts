import {
  DAGBOEK_LABELS,
  DAGEN_PER_SOORT,
  type DagboekDag,
  type DagSoort,
} from "@/lib/nutrition-dagboek";

/**
 * De vier plekken van het 2+2-dagboek, als rijen.
 *
 * ## Waarom dit bestaat
 *
 * Het dagboekpaneel toonde zijn stand als losse zinnen onder elkaar: een
 * teller ("2 / 4"), een dekkingsregel, een breedteregel, een variatieregel, een
 * samenvatting en een kalibratieregel — zes alinea's die je moest lezen om te
 * weten wat je had ingevuld en wat er nog miste. Wat er níét stond was het
 * eenvoudigste antwoord: welke vier dagen dit dagboek zoekt, welke daarvan je
 * hebt, en wat er op die dagen stond.
 *
 * Deze module maakt daar rijen van. Twee doordeweekse plekken en twee
 * weekendplekken, elk gevuld of leeg — de vorm van het dagboek is de vorm van
 * de tabel, en een lege plek is een rij met een knop in plaats van een zin die
 * uitlegt dat er nog iets moet gebeuren.
 *
 * ## Waarom een slot en niet gewoon de lijst dagen
 *
 * Het dagboek vraagt om 2+2, niet om vier willekeurige dagen. Een platte lijst
 * van wat je invulde kan drie weekenddagen tonen zonder dat er iets zegt dat de
 * vierde plek een doordeweekse dag moet zijn. De slots dragen die eis in hun
 * vorm: er zijn er altijd precies vier, twee per soort.
 */

export type DagboekSlot = {
  /** Stabiel binnen een render: soort plus volgnummer. */
  id: string;
  soort: DagSoort;
  /** De dag die deze plek vult, of null zolang hij open staat. */
  dag: DagboekDag | null;
};

/**
 * Wat er op één dag stond, als korte opsomming.
 *
 * Hoogstens `maxGroepen` groepen, meeste porties eerst, met een telling voor de
 * rest. De hele dag uitschrijven maakt de rij twee regels hoog en zegt niet
 * meer: waar het om gaat is of de dag gevuld is en waar het zwaartepunt lag.
 */
export function dagSamenvatting(dag: DagboekDag, maxGroepen = 3): string {
  const gevuld = Object.entries(dag.porties)
    .filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === "number" && entry[1] > 0,
    )
    .sort((a, b) => b[1] - a[1]);

  if (gevuld.length === 0) {
    return "Niets geregistreerd";
  }

  const namen = gevuld
    .slice(0, maxGroepen)
    .map(
      ([groep]) =>
        DAGBOEK_LABELS[groep as keyof typeof DAGBOEK_LABELS] ?? groep,
    );
  const rest = gevuld.length - namen.length;

  return rest > 0 ? `${namen.join(" · ")} +${rest}` : namen.join(" · ");
}

/** Hoeveel voedselgroepen deze dag droeg. */
export function dagGroepenTelling(dag: DagboekDag): number {
  return Object.values(dag.porties).filter(
    (waarde) => typeof waarde === "number" && waarde > 0,
  ).length;
}

/**
 * De vier slots, doordeweeks eerst.
 *
 * Binnen een soort staat de nieuwste dag boven: dat is de dag waar je het
 * meest aan hebt als je hem wilt nakijken. Extra dagen boven de twee per soort
 * vallen weg uit de tabel — ze tellen wél mee in de analyse, want daar is meer
 * invoer altijd beter, maar de tabel toont de vorm van het dagboek en die is
 * 2+2.
 */
export function bouwDagboekSlots(dagen: readonly DagboekDag[]): DagboekSlot[] {
  const slots: DagboekSlot[] = [];

  for (const soort of ["doordeweeks", "weekend"] as const) {
    const vanSoort = dagen
      .filter((dag) => dag.soort === soort)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));

    for (let index = 0; index < DAGEN_PER_SOORT; index += 1) {
      slots.push({
        id: `${soort}-${index}`,
        soort,
        dag: vanSoort[index] ?? null,
      });
    }
  }

  return slots;
}
