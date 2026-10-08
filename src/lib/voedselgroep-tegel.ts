import type { FoodMotif } from "@/components/dashboard/voortgang/FoodIllustration";
import type { FoodCategoryId } from "@/data/nutrition/food-taxonomy";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

export interface VoedselTegel {
  motief: FoodMotif;
  label: string;
}

/**
 * Illustratie en naam per voedselgroep, voor de tegel die een voedingsmiddel zonder
 * foto toont. Client-veilig, geen database. Een product zonder foto krijgt zo
 * een tegel in dezelfde grootte en stijl als een foto, in plaats van een
 * willekeurige letter.
 */
export const VOEDSELGROEP_TEGEL: Record<VoedselgroepId, VoedselTegel> = {
  groente: { motief: "groenten", label: "Groente" },
  fruit: { motief: "fruit", label: "Fruit" },
  "vlees-vis": { motief: "vlees", label: "Vlees en vis" },
  vlees: { motief: "vlees", label: "Vlees" },
  vis: { motief: "vis", label: "Vis" },
  eieren: { motief: "eieren", label: "Eieren" },
  zuivel: { motief: "zuivel", label: "Zuivel" },
  granen: { motief: "granen", label: "Granen" },
  zetmeel: { motief: "aardappel", label: "Aardappel en zetmeel" },
  peulvruchten: { motief: "peulvruchten", label: "Peulvruchten" },
  noten: { motief: "noten", label: "Noten en zaden" },
  vetten: { motief: "vetten", label: "Vetten en oliën" },
  dranken: { motief: "dranken", label: "Dranken" },
  suiker: { motief: "snoep", label: "Zoet en snacks" },
};

/** Tegel voor een product dat geen NEVO-groep heeft, bijvoorbeeld een verpakt product. */
export const VERPAKT_TEGEL = { motief: "verpakt", label: "Verpakt product" } as const;

/** NEVO-voedingsmiddelgroep (de 26 groepen uit het brondbestand) → onze voedselgroep. */
const NEVO_GROEP_NAAR_VOEDSELGROEP: Readonly<Record<string, VoedselgroepId>> = {
  "Aardappelen en knolgewassen": "zetmeel",
  "Graanproducten en meelsoorten": "granen",
  Groente: "groente",
  Fruit: "fruit",
  Eieren: "eieren",
  "Vlees en gevogelte": "vlees",
  "Vis, schaal- en schelpdieren": "vis",
  Peulvruchten: "peulvruchten",
  "Hartige snacks en zoutjes": "suiker",
  "Noten en zaden": "noten",
  Brood: "granen",
  "Gebak en koek": "suiker",
  "Melk en melkproducten": "zuivel",
  "Vleesvervangers en zuivelvervangers": "peulvruchten",
  Kaas: "zuivel",
  "Vetten en oliën": "vetten",
  Vleeswaren: "vlees",
  "Suiker, snoep, zoet beleg en zoete sauzen": "suiker",
  "Alcoholische dranken": "dranken",
  "Niet-alcoholische dranken": "dranken",
  "Hartig broodbeleg": "vlees",
};

/** Fijner dan de voedselgroep: een NEVO-groep met een eigen motief (brood, kaas, snacks). */
const NEVO_GROEP_NAAR_MOTIEF: Readonly<Record<string, FoodMotif>> = {
  Brood: "brood",
  Kaas: "kaas",
  "Hartige snacks en zoutjes": "snacks",
  "Gebak en koek": "snacks",
  Vleeswaren: "vlees",
  "Hartig broodbeleg": "sauzen",
  "Vleesvervangers en zuivelvervangers": "plantaardig",
};

/** Motief per zoekcategorie van de catalogus. */
export const CATEGORIE_MOTIEF: Readonly<Record<FoodCategoryId, FoodMotif>> = {
  groenten: "groenten",
  fruit: "fruit",
  granen: "granen",
  brood: "brood",
  pasta: "pasta",
  peulvruchten: "peulvruchten",
  noten: "noten",
  zaden: "zaden",
  vlees: "vlees",
  orgaanvlees: "vlees",
  vis: "vis",
  zeevruchten: "vis",
  eieren: "eieren",
  zuivel: "zuivel",
  kaas: "kaas",
  plantaardig: "plantaardig",
  vetten: "vetten",
  sauzen: "sauzen",
  ontbijt: "ontbijt",
  snacks: "snacks",
  soepen: "soepen",
  maaltijden: "maaltijden",
  dranken: "dranken",
};

/** De tegel voor een NEVO-groep, of de neutrale tegel als de groep geen eigen motief heeft (kruiden, sauzen, gerechten). */
export function tegelVoorNevoGroep(groep: string): VoedselTegel {
  const id = NEVO_GROEP_NAAR_VOEDSELGROEP[groep];
  if (!id) return { motief: "maaltijden", label: "Voedingsmiddel" };
  const motief = NEVO_GROEP_NAAR_MOTIEF[groep];
  return motief ? { motief, label: VOEDSELGROEP_TEGEL[id].label } : VOEDSELGROEP_TEGEL[id];
}
