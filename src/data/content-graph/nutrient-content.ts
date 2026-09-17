import { CONTENT_METADATA } from "@/data/insight-metadata";
import { allInsights } from "@/data/insights";
import {
  nutrientReferences,
  type NutrientId,
} from "@/data/nutrition/intake-reference";
import { NUTRIENT_GROEP } from "@/lib/nutrient-rail";
import type { InsightItem } from "@/types/insight";

/**
 * Wat er bij een voedingsstof hoort: de artikelen, de gids, de vergelijking en
 * de pillar.
 *
 * ## Waarom dit afgeleid is en niet opgeschreven
 *
 * Elke relatie hier bestaat al ergens anders. De artikelen komen uit
 * `CONTENT_METADATA.nutrients` (fase 1), het vergelijkingspad uit
 * `nutrientReferences[].comparisonPath`, de gids uit dezelfde slug. Ze in een
 * tabel herhalen levert een tweede waarheid op die uit de pas gaat lopen zodra
 * er een artikel bij komt.
 *
 * Wat hier wél staat is de pillar per stof, want die volgt nergens uit: de vijf
 * stoffen hangen allemaal onder voeding, behalve eiwit — dat leest in de
 * praktijk als beweging, want de vraag komt vrijwel altijd uit training en
 * spierbehoud.
 */

/** De supplementgids per stof. Dezelfde slug als de vergelijking, op één na. */
const GUIDE_SLUG: Record<NutrientId, string> = {
  protein: "eiwitpoeder",
  omega3: "omega-3",
  magnesium: "magnesium",
  vitamin_d: "vitamine-d",
  zinc: "zink",
};

/** De leefstijl-pillar waar deze stof onder hangt. */
const PILLAR_PATH: Record<NutrientId, string> = {
  protein: "/voeding-na-40",
  omega3: "/voeding-na-40",
  magnesium: "/voeding-na-40",
  vitamin_d: "/voeding-na-40",
  zinc: "/voeding-na-40",
};

export interface NutrientContent {
  nutrient: NutrientId;
  label: string;
  /** Macro of micro — zegt wat voor soort grootheid je leest. */
  groep: "macro" | "micro";
  /** `/beste/...` — bestaat voor alle vijf. */
  comparisonPath: string;
  /** `/supplementen/...` — de educatieve gids. */
  guidePath: string;
  pillarPath: string;
  /** Alles uit blog en kennisbank dat deze stof draagt, nieuwste eerst. */
  insights: InsightItem[];
}

export function nutrientContent(nutrient: NutrientId): NutrientContent {
  const reference = nutrientReferences[nutrient];
  const insights = allInsights.filter((item) =>
    (CONTENT_METADATA[item.slug]?.nutrients ?? []).includes(nutrient),
  );

  return {
    nutrient,
    label: reference.label,
    groep: NUTRIENT_GROEP[nutrient],
    comparisonPath: reference.comparisonPath,
    guidePath: `/supplementen/${GUIDE_SLUG[nutrient]}`,
    pillarPath: PILLAR_PATH[nutrient],
    insights,
  };
}
