import { getClaimById } from "@/data/approved-claims";
import { CATALOG, type ThemaTag } from "@/data/supplement-hub/catalog";
import {
  EVIDENCE_DOSE,
  getFormDefinition,
  type EvidenceDose,
} from "@/data/supplement-hub/score-model";
import { PRODUCT_SCORE_INPUTS } from "@/data/supplement-hub/score-inputs";
import { ashwagandhaData } from "@/data/supplements/ashwagandha";
import { creatineData } from "@/data/supplements/creatine";
import { eiwitpoederData } from "@/data/supplements/eiwitpoeder";
import { magnesiumData } from "@/data/supplements/magnesium";
import { omega3Data } from "@/data/supplements/omega-3";
import { vitamineDData } from "@/data/supplements/vitamine-d";
import { zinkData } from "@/data/supplements/zink";
import {
  computeTrustScore,
  measuredDose,
  nutrientAmountFor,
} from "@/lib/supplement-score/compute";
import type { AffiliateSlug } from "@/data/affiliate-links";
import type {
  ComparisonPageData,
  SupplementCategory,
  SupplementProduct,
} from "@/types/supplement";
import type {
  ClaimStance,
  LabelFacts,
  TrustScoreResult,
} from "@/types/supplement-score";

/**
 * Bouwt één productcatalogus over alle vergelijkingen heen: 25 producten uit
 * zeven categorieën, elk met een berekende PS-Score, een EU-claimtoestand en
 * twee rangen binnen de eigen categorie.
 *
 * Prijs leeft hier en niet in `src/lib/supplement-score/` — dat is de
 * affiliate-firewall. De kwaliteitsscore weet niet wat iets kost.
 */

const COMPARISONS: ComparisonPageData[] = [
  magnesiumData,
  omega3Data,
  vitamineDData,
  zinkData,
  creatineData,
  ashwagandhaData,
  eiwitpoederData,
];

export type CostBasis = "claim-conforme-dag" | "etiketdag";

export interface CategoryRank {
  /** 1 = beste van de categorie. Gelijke waarden delen een positie. */
  position: number;
  total: number;
}

export interface ProductCost {
  basis: CostBasis;
  centenPerDag: number;
  /** Prijs op het etiket, vóór opschaling naar de claimvoorwaarde. */
  etiketCentenPerDag: number;
  gecontroleerdOp: string;
}

export interface AllowedClaim {
  text: string;
  condition: string;
  gehaald: boolean;
}

export interface HubProduct {
  key: string;
  slug: string;
  /** Naar /product/[slug]. Slugs zijn uniek over alle categorieen heen. */
  href: string;
  category: SupplementCategory;
  categoryLabel: string;
  categoryIcon: string;
  name: string;
  brand: string;
  /** Merk + naam, maar zonder het merk dubbel te zetten als het al in de naam staat. */
  volledigeNaam: string;
  variantTag: string;
  imageSrc: string | null;
  imageAlt: string;
  themas: ThemaTag[];
  /** Genormaliseerde tekst waarop de catalogus doorzoekbaar is. */
  zoekIndex: string;
  guideHref: string;
  comparisonHref: string | null;
  score: TrustScoreResult;
  claimStance: ClaimStance;
  claims: AllowedClaim[];
  doseringLabel: string | null;
  vormLabel: string;
  thirdPartyTested: boolean;
  /** Alleen voor de koop-CTA op de detailpagina; raakt de score niet. */
  affiliateSlug: AffiliateSlug;
  specs: ReadonlyArray<{ label: string; value: string }>;
  pros: readonly string[];
  cons: readonly string[];
  certificeringen: readonly string[];
  kwaliteitsmarkers: Readonly<Record<string, boolean>>;
  labelFeiten: LabelFacts;
  evidence: EvidenceDose | null;
  gemetenDosis: number | null;
  cost: ProductCost;
  kwaliteitsrang: CategoryRank;
  kostenrang: CategoryRank;
  /** De handmatige 0–10 op /beste/*, uitsluitend ter vergelijking. */
  redactieScore: number;
}

export const CLAIM_STANCE_LABELS: Record<ClaimStance, string> = {
  voldoet: "Voldoet aan de EU-claimvoorwaarde",
  voldoet_deels: "Voldoet deels aan de EU-claimvoorwaarde",
  voldoet_niet: "Onder de EU-claimvoorwaarde",
  geen_erkende_claim: "Geen Europees erkende claim",
  onbepaald: "Dosering niet vast te stellen",
};

function categoryEntry(category: SupplementCategory) {
  const bySlug = CATALOG.find((entry) => entry.slug === category);
  return {
    label: bySlug?.name ?? category,
    icon: bySlug?.icon ?? "•",
    themas: bySlug?.themas ?? [],
    guideHref: bySlug?.guideHref ?? `/supplementen/${category}`,
    comparisonHref: bySlug?.comparisonHref ?? null,
  };
}

/**
 * Kleine letters, accenten en koppeltekens weg. Zo vindt "omega 3" ook
 * "Omega-3" en "vitamine d" ook "Vitamine D3".
 */
export function normalizeZoek(waarde: string): string {
  return waarde
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Elk woord uit de zoekterm moet ergens in de index voorkomen. */
export function matchesZoek(product: HubProduct, zoekterm: string): boolean {
  const genormaliseerd = normalizeZoek(zoekterm);
  if (genormaliseerd === "") return true;
  return genormaliseerd
    .split(" ")
    .every((woord) => product.zoekIndex.includes(woord));
}

function volledigeNaam(brand: string, name: string): string {
  const eersteMerkwoord = brand.split(" ")[0]?.toLowerCase() ?? "";
  if (eersteMerkwoord && name.toLowerCase().startsWith(eersteMerkwoord)) {
    return name;
  }
  return `${brand} ${name}`;
}

function formatAmount(value: number, eenheid: string): string {
  const unit = eenheid === "ug" ? "µg" : eenheid;
  const rendered = Number.isInteger(value)
    ? String(value)
    : String(Math.round(value * 10) / 10).replace(".", ",");
  return `${rendered} ${unit}`;
}

function buildDoseringLabel(
  product: SupplementProduct,
  category: SupplementCategory,
  dosisOnzeker: boolean,
): string | null {
  if (dosisOnzeker) {
    return null;
  }
  const evidence = EVIDENCE_DOSE[category];
  if (!evidence) {
    return null;
  }
  const amount = measuredDose(product.doseringPerDagdosis, evidence);
  if (amount == null) {
    return null;
  }
  return `${formatAmount(amount, evidence.eenheid)} ${evidence.omschrijving}`;
}

function buildClaims(product: SupplementProduct): AllowedClaim[] {
  return product.efsaClaimIds.flatMap((claimId) => {
    const claim = getClaimById(claimId);
    if (!claim || claim.status !== "approved") {
      return [];
    }
    const amount = nutrientAmountFor(
      product.doseringPerDagdosis,
      claim.threshold.nutrient,
    );
    return [
      {
        text: claim.text,
        condition: claim.condition,
        gehaald: amount != null && amount >= claim.threshold.minAmount,
      },
    ];
  });
}

/**
 * Prijs per claim-conforme dag: wat een dag kost bij de dosering waarop de
 * EFSA-claim daadwerkelijk geldt. Doseert een product onder de drempel, dan
 * schaalt de prijs mee omhoog — een goedkoop potje dat te laag doseert is niet
 * goedkoop. Bestaat er geen erkende claim, dan rekenen we per etiketdag en
 * zegt het label dat ook.
 */
function buildCost(
  product: SupplementProduct,
  etiketCentenPerDag: number,
  gecontroleerdOp: string,
  claimStance: ClaimStance,
): ProductCost {
  const base: Omit<ProductCost, "basis" | "centenPerDag"> = {
    etiketCentenPerDag,
    gecontroleerdOp,
  };

  if (claimStance === "geen_erkende_claim" || claimStance === "onbepaald") {
    return { ...base, basis: "etiketdag", centenPerDag: etiketCentenPerDag };
  }

  let factor = 1;
  for (const claimId of product.efsaClaimIds) {
    const claim = getClaimById(claimId);
    if (!claim || claim.status !== "approved") {
      continue;
    }
    const amount = nutrientAmountFor(
      product.doseringPerDagdosis,
      claim.threshold.nutrient,
    );
    if (amount == null || amount <= 0) {
      continue;
    }
    if (amount < claim.threshold.minAmount) {
      factor = Math.max(factor, claim.threshold.minAmount / amount);
    }
  }

  return {
    ...base,
    basis: "claim-conforme-dag",
    centenPerDag: Math.round(etiketCentenPerDag * factor),
  };
}

function rankWithin<T>(
  items: T[],
  valueOf: (item: T) => number,
  direction: "hoog-is-beter" | "laag-is-beter",
): Map<T, CategoryRank> {
  const sorted = [...items].sort((a, b) =>
    direction === "hoog-is-beter"
      ? valueOf(b) - valueOf(a)
      : valueOf(a) - valueOf(b),
  );

  const ranks = new Map<T, CategoryRank>();
  sorted.forEach((item, index) => {
    const previous = index > 0 ? sorted[index - 1] : null;
    const sharesWithPrevious =
      previous !== null && valueOf(previous) === valueOf(item);
    const position = sharesWithPrevious
      ? ranks.get(previous)!.position
      : index + 1;
    ranks.set(item, { position, total: items.length });
  });

  return ranks;
}

function buildCategory(data: ComparisonPageData): HubProduct[] {
  const meta = categoryEntry(data.category);
  const inputsByCategory = PRODUCT_SCORE_INPUTS[data.category] ?? {};

  const partials = data.products.map((product) => {
    const inputs = inputsByCategory[product.slug];
    if (!inputs) {
      throw new Error(
        `Score-invoer ontbreekt voor ${data.category}/${product.slug} — vul src/data/supplement-hub/score-inputs.ts aan.`,
      );
    }

    const score = computeTrustScore({
      category: data.category,
      werkzameStof: product.werkzameStof,
      doseringPerDagdosis: product.doseringPerDagdosis,
      efsaClaimIds: product.efsaClaimIds,
      thirdPartyTested: product.thirdPartyTested,
      formKey: inputs.formKey,
      label: inputs.label,
      certificeringen: inputs.certificeringen,
      kwaliteitsmarkers: inputs.kwaliteitsmarkers,
      dosisOnzekerReden: inputs.dosisOnzekerReden,
    });

    const form = getFormDefinition(data.category, inputs.formKey);

    const evidence = EVIDENCE_DOSE[data.category];

    return {
      key: `${data.category}/${product.slug}`,
      slug: product.slug,
      href: `/product/${product.slug}`,
      category: data.category,
      categoryLabel: meta.label,
      categoryIcon: meta.icon,
      name: product.name,
      brand: product.brand,
      volledigeNaam: volledigeNaam(product.brand, product.name),
      variantTag: product.variantTag,
      imageSrc: product.imageSrc ?? null,
      imageAlt: product.imageAlt ?? `${product.brand} ${product.name}`,
      themas: [...meta.themas],
      zoekIndex: normalizeZoek(
        [
          product.name,
          product.brand,
          meta.label,
          data.category,
          product.werkzameStof,
          form?.label ?? product.vorm,
          product.variantTag,
          ...meta.themas,
        ].join(" "),
      ),
      guideHref: meta.guideHref,
      comparisonHref: meta.comparisonHref,
      score,
      claimStance: score.claimStance,
      claims: buildClaims(product),
      doseringLabel: buildDoseringLabel(
        product,
        data.category,
        inputs.dosisOnzekerReden !== null,
      ),
      vormLabel: form?.label ?? product.vorm,
      thirdPartyTested: product.thirdPartyTested,
      affiliateSlug: product.affiliateSlug,
      specs: product.specs,
      pros: product.pros,
      cons: product.cons,
      certificeringen: inputs.certificeringen,
      kwaliteitsmarkers: inputs.kwaliteitsmarkers,
      labelFeiten: inputs.label,
      evidence,
      gemetenDosis:
        evidence && inputs.dosisOnzekerReden === null
          ? measuredDose(product.doseringPerDagdosis, evidence)
          : null,
      cost: buildCost(
        product,
        inputs.prijsPerEtiketdagCent,
        inputs.prijsGecontroleerdOp,
        score.claimStance,
      ),
      redactieScore: product.score,
    };
  });

  const qualityRanks = rankWithin(
    partials,
    (item) => item.score.total,
    "hoog-is-beter",
  );
  const costRanks = rankWithin(
    partials,
    (item) => item.cost.centenPerDag,
    "laag-is-beter",
  );

  return partials.map((item) => ({
    ...item,
    kwaliteitsrang: qualityRanks.get(item)!,
    kostenrang: costRanks.get(item)!,
  }));
}

let cached: HubProduct[] | null = null;

export function getHubProducts(): HubProduct[] {
  if (!cached) {
    cached = COMPARISONS.flatMap(buildCategory).sort(
      (a, b) => b.score.total - a.score.total,
    );
  }
  return cached;
}

export function formatCents(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

/** Nederlandse decimale komma; 93.4 wordt 93,4. */
export function formatScore(total: number): string {
  return total.toFixed(1).replace(".", ",");
}

let bySlug: Map<string, HubProduct> | null = null;

function slugIndex(): Map<string, HubProduct> {
  if (!bySlug) {
    bySlug = new Map(getHubProducts().map((product) => [product.slug, product]));
  }
  return bySlug;
}

export function getHubProductSlugs(): string[] {
  return getHubProducts().map((product) => product.slug);
}

export function getHubProductBySlug(slug: string): HubProduct | null {
  return slugIndex().get(slug) ?? null;
}

/** Andere producten in dezelfde categorie, beste PS-Score eerst. */
export function getCategoryPeers(product: HubProduct): HubProduct[] {
  return getHubProducts()
    .filter(
      (other) =>
        other.category === product.category && other.slug !== product.slug,
    )
    .sort((a, b) => a.kwaliteitsrang.position - b.kwaliteitsrang.position);
}

function rankWoord(
  rank: CategoryRank,
): "Hoog" | "Bovengemiddeld" | "Gemiddeld" | "Laag" {
  if (rank.total <= 1) return "Gemiddeld";
  const aandeel = (rank.total - rank.position) / (rank.total - 1);
  if (aandeel >= 0.99) return "Hoog";
  if (aandeel >= 0.5) return "Bovengemiddeld";
  if (aandeel > 0) return "Gemiddeld";
  return "Laag";
}

export function kwaliteitsrangWoord(product: HubProduct): string {
  return rankWoord(product.kwaliteitsrang);
}

export function kostenrangWoord(product: HubProduct): string {
  const woord = rankWoord(product.kostenrang);
  if (woord === "Hoog") return "Goedkoopst";
  if (woord === "Bovengemiddeld") return "Betaalbaar";
  if (woord === "Gemiddeld") return "Gemiddeld";
  return "Duurst";
}

/**
 * Eén samenvattende alinea, opgebouwd uit dezelfde velden die de kaart toont.
 * Bewust gegenereerd en niet geschreven: dan kan hij nooit méér beweren dan
 * er in de data staat, en blijft hij kloppen als de data verandert.
 */
export function buildProductSamenvatting(product: HubProduct): string {
  const zinnen: string[] = [];

  const dosering = product.doseringLabel
    ? `met ${product.doseringLabel}`
    : "met een dagdosering die niet uit het etiket volgt";
  zinnen.push(
    `${product.volledigeNaam} is ${product.vormLabel.toLowerCase()} uit de categorie ${product.categoryLabel.toLowerCase()}, ${dosering}. De PS-Score komt uit op ${formatScore(product.score.total)} van de 100.`,
  );

  const basis =
    product.cost.basis === "claim-conforme-dag"
      ? "per claim-conforme dag"
      : "per etiketdag";
  zinnen.push(
    `Een dag kost ${formatCents(product.cost.centenPerDag)} ${basis}; op kosten staat het ${product.kostenrang.position}e van ${product.kostenrang.total} binnen deze categorie.`,
  );

  const gehaald = product.claims.filter((claim) => claim.gehaald).length;
  switch (product.claimStance) {
    case "voldoet":
      zinnen.push(
        gehaald === 1
          ? "Bij deze dosering mag het product de Europees goedgekeurde gezondheidsclaim voeren die eraan gekoppeld is."
          : `Bij deze dosering mag het product alle ${gehaald} Europees goedgekeurde gezondheidsclaims voeren die eraan gekoppeld zijn.`,
      );
      break;
    case "voldoet_deels":
      zinnen.push(
        `Bij deze dosering geldt ${gehaald} van de ${product.claims.length} gekoppelde EU-claims.`,
      );
      break;
    case "voldoet_niet":
      zinnen.push(
        "Bij deze dosering geldt geen van de gekoppelde EU-claims; daarvoor is een hogere dagdosering nodig.",
      );
      break;
    case "geen_erkende_claim":
      zinnen.push(
        "Voor dit ingrediënt bestaat geen Europees erkende gezondheidsclaim, dus vergelijken we op samenstelling en dosering.",
      );
      break;
    case "onbepaald":
      zinnen.push(
        "De werkzame dagdosis is niet uit het etiket vast te stellen; dosering en claimvoorwaarde blijven daarom buiten de score.",
      );
      break;
  }

  const toetsing = product.score.components.find(
    (component) => component.id === "toetsing",
  );
  if (toetsing) {
    zinnen.push(toetsing.reden);
  }

  return zinnen.join(" ");
}
