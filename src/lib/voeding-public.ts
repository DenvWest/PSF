import { FOOD_CATALOG } from "@/data/nutrition/food-catalog";
import {
  FOOD_SOURCES,
  isSourceBacked,
  type FoodSource,
} from "@/data/nutrition/food-sources";
import {
  NUTRIENT_IDS,
  nutrientReferences,
  type NutrientId,
} from "@/data/nutrition/intake-reference";
import { NUTRIENT_ROUTES } from "@/data/nutrition/nutrient-routes";

export const VOEDING_STOF_SLUGS = [
  "eiwit",
  "omega-3",
  "magnesium",
  "vitamine-d",
  "zink",
] as const;

export type VoedingStofSlug = (typeof VOEDING_STOF_SLUGS)[number];

const SLUG_TO_NUTRIENT: Record<VoedingStofSlug, NutrientId> = {
  eiwit: "protein",
  "omega-3": "omega3",
  magnesium: "magnesium",
  "vitamine-d": "vitamin_d",
  zink: "zinc",
};

const NUTRIENT_TO_SLUG: Record<NutrientId, VoedingStofSlug> = {
  protein: "eiwit",
  omega3: "omega-3",
  magnesium: "magnesium",
  vitamin_d: "vitamine-d",
  zinc: "zink",
};

export interface PublicFoodBron {
  key: string;
  labelNl: string;
  portionNl: string;
  amount: number | null;
  unit: string | null;
  verified: boolean;
  bronNaam: string | null;
  opnameNote: string | null;
  spreidingNote: string | null;
  qualityNote: string | null;
  preparationNote: string | null;
}

export interface PublicNutrientPage {
  slug: VoedingStofSlug;
  nutrient: NutrientId;
  label: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  referenceLabel: string;
  lifestyleAction: string;
  thresholdNl: string;
  thresholdKind: string;
  comparisonPath: string;
  comparisonLabel: string;
  bronnen: readonly PublicFoodBron[];
  verifiedCount: number;
  confidenceWhy: string;
}

function toPublicBron(source: FoodSource): PublicFoodBron {
  return {
    key: source.key,
    labelNl: source.labelNl,
    portionNl: source.portionNl,
    amount: source.amount,
    unit: source.nutrientValue?.unit ?? null,
    verified: isSourceBacked(source),
    bronNaam: source.nutrientValue?.sourceNameNl ?? null,
    opnameNote:
      source.bioavailability === "normal" ? null : (source.bioavailabilityWhy ?? null),
    spreidingNote: source.variability === "low" ? null : (source.variabilityWhy ?? null),
    qualityNote: source.qualityNote ?? null,
    preparationNote: source.preparationNote ?? null,
  };
}

const PAGE_COPY: Record<
  NutrientId,
  Pick<PublicNutrientPage, "intro" | "metaTitle" | "metaDescription" | "comparisonLabel">
> = {
  protein: {
    metaTitle: "Eiwit uit voeding — bronnen per portie",
    metaDescription:
      "Welke voedingsmiddelen leveren het meeste eiwit per portie? Indicatieve gehaltes, geen dagtotaal — eerst je bord, dan pas supplement.",
    intro:
      "Drie eiwitrijke eetmomenten per dag is de vuistregel — niet één grote portie aan het eind van de dag. Hier zie je welke bronnen per portie het meest bijdragen, zodat je kunt kiezen in plaats van optellen.",
    comparisonLabel: "Wanneer eiwitpoeder zinvol is",
  },
  omega3: {
    metaTitle: "Omega-3 uit voeding — bronnen per portie",
    metaDescription:
      "Vette vis, algen en plantaardige bronnen: wat levert één portie EPA/DHA of ALA? Geen dagtotaal, wel concrete keuzes vóór een supplement.",
    intro:
      "De route loopt via vette vis: één tot twee keer per week. Hier staan de sterkste bronnen per portie — naast elkaar, niet opgeteld — zodat je ziet wat je bord kan dragen vóór je naar een supplement kijkt.",
    comparisonLabel: "Wanneer omega-3-supplement zinvol is",
  },
  magnesium: {
    metaTitle: "Magnesium uit voeding — bronnen per portie",
    metaDescription:
      "Noten, peulvruchten, bladgroente en volkoren: indicatieve magnesium per portie, met opname-nuance. Geen ADH-percentage, wel keuzehulp.",
    intro:
      "Magnesium uit je bord komt vooral uit noten, peulvruchten, bladgroente en volkoren. De check meet een proxy (groente en fruit), dus deze lijst is productkennis naast je antwoord — geen berekening van je dagtotaal.",
    comparisonLabel: "Wanneer magnesium-supplement zinvol is",
  },
  vitamin_d: {
    metaTitle: "Vitamine D uit voeding — bronnen per portie",
    metaDescription:
      "Vette vis en eieren dragen bij, maar zonlicht is de hoofdroute. Indicatieve gehaltes per portie, met seizoensnuance vóór supplement.",
    intro:
      "In Nederland komt vitamine D vooral van je huid, niet van je bord. Vette vis is de enige noemenswaardige voedingsbron — hier zie je wat één portie levert, naast de vraag hoe vaak je buiten bent.",
    comparisonLabel: "Wanneer vitamine D-supplement zinvol is",
  },
  zinc: {
    metaTitle: "Zink uit voeding — bronnen per portie",
    metaDescription:
      "Vlees, peulvruchten en zuivel: indicatief zink per portie, met fytaat-nuance. Geen dagtotaal — eerst je bord controleren.",
    intro:
      "Zink uit voeding vraagt regelmaat: vlees, peulvruchten of zuivel een paar keer per week. Fytaat in plantaardige bronnen remt de opname — daarom staan de bronnen naast elkaar, niet onder elkaar opgeteld.",
    comparisonLabel: "Wanneer zink-supplement zinvol is",
  },
};

export function isVoedingStofSlug(value: string): value is VoedingStofSlug {
  return (VOEDING_STOF_SLUGS as readonly string[]).includes(value);
}

export function nutrientFromVoedingSlug(slug: VoedingStofSlug): NutrientId {
  return SLUG_TO_NUTRIENT[slug];
}

export function voedingSlugFromNutrient(nutrient: NutrientId): VoedingStofSlug {
  return NUTRIENT_TO_SLUG[nutrient];
}

export function getPublicNutrientPage(slug: VoedingStofSlug): PublicNutrientPage {
  const nutrient = nutrientFromVoedingSlug(slug);
  const ref = nutrientReferences[nutrient];
  const route = NUTRIENT_ROUTES[nutrient];
  const copy = PAGE_COPY[nutrient];
  const bronnen = FOOD_SOURCES[nutrient].slice(0, 6).map(toPublicBron);

  return {
    slug,
    nutrient,
    label: ref.label,
    metaTitle: copy.metaTitle,
    metaDescription: copy.metaDescription,
    intro: copy.intro,
    referenceLabel: ref.referenceLabel,
    lifestyleAction: ref.lifestyleAction,
    thresholdNl: route.thresholdNl,
    thresholdKind: route.thresholdKind,
    comparisonPath: ref.comparisonPath,
    comparisonLabel: copy.comparisonLabel,
    bronnen,
    verifiedCount: bronnen.filter((b) => b.verified).length,
    confidenceWhy: ref.confidenceWhy,
  };
}

export function getAllPublicNutrientPages(): PublicNutrientPage[] {
  return VOEDING_STOF_SLUGS.map((slug) => getPublicNutrientPage(slug));
}

export const VOEDING_HUB_META = {
  title: "Voeding per stof — bronnen en routes",
  description:
    "Vijf stoffen met een interventiepad: eiwit, omega-3, magnesium, vitamine D en zink. Per portie uit onze voedingsdatabase — controleer eerst je bord, verbeter daarna.",
} as const;

export function voedingDatabaseStats(): { catalogCount: number; verifiedCount: number } {
  const allSources = NUTRIENT_IDS.flatMap((id) => FOOD_SOURCES[id]);
  return {
    catalogCount: FOOD_CATALOG.length,
    verifiedCount: allSources.filter(isSourceBacked).length,
  };
}

export function voedingHubCards(): Array<{
  slug: VoedingStofSlug;
  label: string;
  teaser: string;
  verifiedCount: number;
  bronCount: number;
}> {
  return NUTRIENT_IDS.map((nutrient) => {
    const slug = voedingSlugFromNutrient(nutrient);
    const ref = nutrientReferences[nutrient];
    const bronnen = FOOD_SOURCES[nutrient];
    return {
      slug,
      label: ref.label,
      teaser: ref.referenceLabel,
      verifiedCount: bronnen.filter(isSourceBacked).length,
      bronCount: bronnen.length,
    };
  });
}
