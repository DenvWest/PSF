import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Icoon en naam per voedselgroep, voor de tegel die een voedingsmiddel zonder
 * foto toont. Client-veilig, geen database. Een product zonder foto krijgt zo
 * een tegel in dezelfde grootte en stijl als een foto, in plaats van een
 * willekeurige letter.
 */
export const VOEDSELGROEP_TEGEL: Record<VoedselgroepId, { icoon: string; label: string }> = {
  groente: { icoon: "🥦", label: "Groente" },
  fruit: { icoon: "🍎", label: "Fruit" },
  "vlees-vis": { icoon: "🥩", label: "Vlees en vis" },
  vlees: { icoon: "🥩", label: "Vlees" },
  vis: { icoon: "🐟", label: "Vis" },
  eieren: { icoon: "🥚", label: "Eieren" },
  zuivel: { icoon: "🥛", label: "Zuivel" },
  granen: { icoon: "🌾", label: "Granen" },
  zetmeel: { icoon: "🥔", label: "Aardappel en zetmeel" },
  peulvruchten: { icoon: "🫘", label: "Peulvruchten" },
  noten: { icoon: "🥜", label: "Noten en zaden" },
  vetten: { icoon: "🫒", label: "Vetten en oliën" },
  dranken: { icoon: "🥤", label: "Dranken" },
  suiker: { icoon: "🍫", label: "Zoet en snacks" },
};

/** Tegel voor een product dat geen NEVO-groep heeft, bijvoorbeeld een verpakt product. */
export const VERPAKT_TEGEL = { icoon: "📦", label: "Verpakt product" } as const;

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

/** De tegel voor een NEVO-groep, of de neutrale tegel als de groep geen eigen icoon heeft (kruiden, sauzen, gerechten). */
export function tegelVoorNevoGroep(groep: string): { icoon: string; label: string } {
  const id = NEVO_GROEP_NAAR_VOEDSELGROEP[groep];
  return id ? VOEDSELGROEP_TEGEL[id] : { icoon: "🍽️", label: "Voedingsmiddel" };
}
