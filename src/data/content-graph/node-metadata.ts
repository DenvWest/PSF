import type { GraphNode } from "@/lib/content-graph/node";
import { CONTENT_METADATA, type ContentMetadata } from "@/data/insight-metadata";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { ThemeSlug } from "@/lib/content/themes";

/**
 * Metadata voor de knopen die geen `CONTENT_METADATA` hebben.
 *
 * ## Waarom dit bestand nodig bleek
 *
 * `CONTENT_METADATA` dekt blog en kennisbank — 119 items, met een test die
 * volledigheid afdwingt. Maar de graaf telt 151 knopen: er zijn ook 8 pillars,
 * 4 profielpagina's, 7 gezondheidsgidsen, 8 supplementgidsen en 7
 * vergelijkingen.
 *
 * Die 32 vielen buiten elke check-analyse. Dat vertekende de eerste meting
 * flink: "de leefstijlcheck wordt maar door één pagina aangeboden" gold alleen
 * voor blog en kennisbank, en sloeg net de pagina's over waar die check
 * thuishoort. Een pillar en een profielpagina stellen namelijk precies de vraag
 * die de brede check beantwoordt.
 *
 * ## Waarom afgeleid en niet opgeschreven
 *
 * Deze 32 knopen dragen hun onderwerp al in hun pad en hun data: de gids
 * `/supplementen/magnesium` gaat over magnesium, de pillar
 * `/slaap-verbeteren-na-40` over slaap. Dat nog eens in een tabel herhalen
 * levert een tweede waarheid op. Alleen waar het pad het onderwerp niet
 * verraadt, staat het hier expliciet.
 */

/** Supplement-slug → de stof die de check meet. Niet elke stof is een nutriënt. */
const SLUG_TO_NUTRIENT: Record<string, NutrientId> = {
  magnesium: "magnesium",
  "omega-3": "omega3",
  "omega-3-supplement": "omega3",
  "vitamine-d": "vitamin_d",
  zink: "zinc",
  eiwitpoeder: "protein",
  // ashwagandha, creatine en melatonine bewust niet: geen NutrientId, en de
  // voedingscheck meet ze niet.
};

/** Pillar- en gidspad → het gemeten thema, waar dat bestaat. */
const SLUG_TO_THEME: Record<string, ThemeSlug> = {
  "slaap-verbeteren-na-40": "sleep",
  "stress-verminderen-na-40": "stress",
  "voeding-na-40": "nutrition",
  "beweging-na-40": "movement",
  slaap: "sleep",
  stress: "stress",
  voeding: "nutrition",
  beweging: "movement",
  // energie, herstel, testosteron en overgang hebben geen eigen ThemeSlug —
  // ze zijn uitkomst van meerdere domeinen, niet één gemeten domein.
};

/**
 * De metadata van een knoop, ongeacht zijn type.
 *
 * Voor blog en kennisbank is dat de bestaande overlay. Voor de rest wordt hij
 * hier afgeleid — met één inhoudelijke keuze: **pillars en profielpagina's
 * krijgen `checkOverride: "leefstijl"`.**
 *
 * Dat is geen uitzondering maar de kern van de zaak. Een pillar zegt zelf dat
 * een klacht meerdere oorzaken heeft, en een profielpagina ís de uitkomst van
 * de brede check. Ze naar een micro-check van één minuut sturen zou hun eigen
 * boodschap tegenspreken. Ze linken er vandaag ook al naartoe; dit legt vast
 * waarom.
 */
export function metadataForNode(node: GraphNode): ContentMetadata {
  switch (node.type) {
    case "blog":
    case "kennisbank":
      return CONTENT_METADATA[node.slug] ?? {};

    case "pillar":
      return {
        ...(SLUG_TO_THEME[node.slug] ? { theme: SLUG_TO_THEME[node.slug] } : {}),
        checkOverride: "leefstijl",
      };

    case "profiel":
      return { checkOverride: "leefstijl" };

    case "supplementgids":
    case "vergelijking": {
      const nutrient = SLUG_TO_NUTRIENT[node.slug];
      return nutrient ? { nutrients: [nutrient] } : {};
    }

    case "gezondheidsgids": {
      const theme = SLUG_TO_THEME[node.slug];
      return theme ? { theme } : {};
    }
  }
}
