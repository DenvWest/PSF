import {
  approvedClaims,
  getClaimById,
  getUsableClaims,
} from "@/data/approved-claims";
import {
  EVIDENCE_DOSE,
  LABEL_POINTS,
  PS_SCORE_MODEL_VERSION,
  SCORE_COMPONENT_LABELS,
  SCORE_WEIGHTS,
  TIER_LABELS,
  TIER_POINTS,
  TOETSING_POINTS,
  getFormDefinition,
  getQualityMarkers,
  type EvidenceDose,
} from "@/data/supplement-hub/score-model";
import type { DoseringPerDagdosis } from "@/types/supplement";
import type {
  ClaimStance,
  ScoreComponentId,
  ScoreComponentResult,
  TrustScoreInput,
  TrustScoreResult,
} from "@/types/supplement-score";

/**
 * DE PS-SCORE-MOTOR — pure functie, geen I/O, geen prijs, geen affiliate.
 *
 * Zie src/data/supplement-hub/score-model.ts voor het model zelf. Deze module
 * rekent het alleen uit. De firewall-test in __tests__/firewall.test.ts bewaakt
 * dat hier nooit prijs- of partnerdata binnenkomt: een score die meebeweegt met
 * wat een product oplevert, is geen score.
 */

const COMPONENT_ORDER: ScoreComponentId[] = [
  "claimdekking",
  "dosering",
  "vorm",
  "transparantie",
  "toetsing",
];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** De hoeveelheid waartegen het onderzoeksvenster meet, of null als die niet uit het etiket volgt. */
export function measuredDose(
  dosering: DoseringPerDagdosis,
  evidence: EvidenceDose,
): number | null {
  if (evidence.meet === "epa_dha") {
    if (dosering.epaMg == null || dosering.dhaMg == null) {
      return null;
    }
    const total = dosering.epaMg + dosering.dhaMg;
    return total > 0 ? total : null;
  }

  if (dosering.eenheid !== evidence.eenheid) {
    return null;
  }
  if (evidence.meet === "dagdosis-elementair" && !dosering.elementair) {
    return null;
  }
  return dosering.hoeveelheid > 0 ? dosering.hoeveelheid : null;
}

function formatAmount(value: number, eenheid: string): string {
  const unit = eenheid === "ug" ? "µg" : eenheid;
  const rendered = Number.isInteger(value)
    ? String(value)
    : String(round1(value)).replace(".", ",");
  return `${rendered} ${unit}`;
}

/**
 * Hoeveel van de erkende EU-claims die voor deze stof bestaan, ontsluit deze
 * dagdosering? Anders dan `claimStance` gaat dit niet over de claims die het
 * product voert, maar over wat de stof te bieden heeft. Bij een stof met een
 * enkele drempel haalt elk serieus product alles; bij omega-3, met een aparte
 * DHA-drempel van 250 mg naast de 250 mg EPA+DHA, scheelt het echt.
 */
function claimCoverageComponent(input: TrustScoreInput): ScoreComponentResult {
  const base = {
    id: "claimdekking" as const,
    label: SCORE_COMPONENT_LABELS.claimdekking,
    weight: SCORE_WEIGHTS.claimdekking,
  };

  if (input.dosisOnzekerReden) {
    return { ...base, points: null, reden: input.dosisOnzekerReden };
  }

  const beschikbaar = getUsableClaims(input.werkzameStof);
  const ingredient = approvedClaims[input.werkzameStof].ingredient;

  if (beschikbaar.length === 0) {
    return {
      ...base,
      points: null,
      reden: `Voor ${ingredient.toLowerCase()} staat geen enkele gezondheidsclaim op de Europese lijst, dus valt er niets te dekken.`,
    };
  }

  const gehaald = beschikbaar.filter((claim) => {
    const amount = nutrientAmountFor(
      input.doseringPerDagdosis,
      claim.threshold.nutrient,
    );
    return amount != null && amount >= claim.threshold.minAmount;
  });

  const points = round1((gehaald.length / beschikbaar.length) * 100);

  if (gehaald.length === beschikbaar.length) {
    return {
      ...base,
      points,
      reden: `Ontsluit alle ${beschikbaar.length} erkende EU-claims voor ${ingredient.toLowerCase()}.`,
    };
  }

  const gemist = [
    ...new Set(
      beschikbaar
        .filter((claim) => !gehaald.includes(claim))
        .map((claim) => claim.condition),
    ),
  ];

  return {
    ...base,
    points,
    reden: `Ontsluit ${gehaald.length} van de ${beschikbaar.length} erkende EU-claims voor ${ingredient.toLowerCase()}. De rest vraagt een hogere dosering: ${gemist.join("; ")}.`,
  };
}

function doseComponent(input: TrustScoreInput): ScoreComponentResult {
  const base = {
    id: "dosering" as const,
    label: SCORE_COMPONENT_LABELS.dosering,
    weight: SCORE_WEIGHTS.dosering,
  };

  if (input.dosisOnzekerReden) {
    return { ...base, points: null, reden: input.dosisOnzekerReden };
  }

  const evidence = EVIDENCE_DOSE[input.category];
  if (!evidence) {
    return {
      ...base,
      points: null,
      reden: "Voor deze categorie hanteren we geen onderzoeksdosis.",
    };
  }

  const amount = measuredDose(input.doseringPerDagdosis, evidence);
  if (amount == null) {
    return {
      ...base,
      points: null,
      reden: `Het etiket geeft geen ${evidence.omschrijving} in een vergelijkbare eenheid.`,
    };
  }

  const doel = formatAmount(evidence.onderzoeksdosis, evidence.eenheid);
  const geleverd = formatAmount(amount, evidence.eenheid);

  if (amount < evidence.onderzoeksdosis) {
    const points = round1((amount / evidence.onderzoeksdosis) * 100);
    return {
      ...base,
      points,
      reden: `${geleverd} ${evidence.omschrijving} — onder de onderzoeksdosis van ${doel}.`,
    };
  }

  if (amount > evidence.bovengrens) {
    const overshoot = (amount - evidence.bovengrens) / evidence.bovengrens;
    const points = round1(100 - 40 * Math.min(1, overshoot));
    return {
      ...base,
      points,
      reden: `${geleverd} ${evidence.omschrijving} — boven de bovengrens van ${formatAmount(evidence.bovengrens, evidence.eenheid)}; hoger is hier niet beter.`,
    };
  }

  return {
    ...base,
    points: 100,
    reden: `${geleverd} ${evidence.omschrijving} — op of boven de onderzoeksdosis van ${doel}.`,
  };
}

function formComponent(input: TrustScoreInput): ScoreComponentResult {
  const base = {
    id: "vorm" as const,
    label: SCORE_COMPONENT_LABELS.vorm,
    weight: SCORE_WEIGHTS.vorm,
  };

  const form = getFormDefinition(input.category, input.formKey);
  if (!form) {
    return {
      ...base,
      points: null,
      reden: "De vorm op het etiket staat niet in onze vormregistratie.",
    };
  }

  return {
    ...base,
    points: TIER_POINTS[form.tier],
    reden: `${form.label} — ${TIER_LABELS[form.tier].toLowerCase()}. ${form.onderbouwing}`,
  };
}

function labelComponent(input: TrustScoreInput): ScoreComponentResult {
  const { label } = input;
  const ontbreekt: string[] = [];
  let points = 0;

  if (label.werkzameStofGekwantificeerd) {
    points += LABEL_POINTS.werkzameStofGekwantificeerd;
  } else {
    ontbreekt.push("het werkzame gehalte staat niet in een getal");
  }

  if (label.dagdoseringVermeld) {
    points += LABEL_POINTS.dagdoseringVermeld;
  } else {
    ontbreekt.push("er staat geen expliciete dagdosering");
  }

  if (label.samenstellingUitgesplitst) {
    points += LABEL_POINTS.samenstellingUitgesplitst;
  } else {
    ontbreekt.push("de samenstelling is niet per vorm uitgesplitst");
  }

  if (label.proprietaryBlend) {
    ontbreekt.push("de verdeling gaat schuil in een proprietary blend");
  } else {
    points += LABEL_POINTS.geenProprietaryBlend;
  }

  return {
    id: "transparantie",
    label: SCORE_COMPONENT_LABELS.transparantie,
    weight: SCORE_WEIGHTS.transparantie,
    points,
    reden:
      ontbreekt.length === 0
        ? "Werkzaam gehalte, dagdosering en samenstelling staan volledig op het etiket."
        : `Op het etiket ${ontbreekt.join("; ")}.`,
  };
}

function testingComponent(input: TrustScoreInput): ScoreComponentResult {
  const keurmerken = input.certificeringen;
  const markers = getQualityMarkers(input.category);

  const universeleNoemer =
    TOETSING_POINTS.thirdPartyTested + TOETSING_POINTS.perKeurmerk;
  const markerNoemer = markers.reduce((sum, marker) => sum + marker.punten, 0);
  const noemer = universeleNoemer + markerNoemer;

  const behaaldeMarkers = markers.filter(
    (marker) => input.kwaliteitsmarkers[marker.key] === true,
  );

  const teller =
    (input.thirdPartyTested ? TOETSING_POINTS.thirdPartyTested : 0) +
    Math.min(
      TOETSING_POINTS.perKeurmerk,
      keurmerken.length * TOETSING_POINTS.perKeurmerk,
    ) +
    behaaldeMarkers.reduce((sum, marker) => sum + marker.punten, 0);

  const points = noemer === 0 ? 0 : round1((teller / noemer) * 100);

  const behaald: string[] = [];
  if (input.thirdPartyTested) behaald.push("een onafhankelijk labrapport");
  if (keurmerken.length > 0) behaald.push(keurmerken.join(" en "));
  for (const marker of behaaldeMarkers) {
    behaald.push(marker.label.toLowerCase());
  }

  const ontbreekt = markers
    .filter((marker) => input.kwaliteitsmarkers[marker.key] !== true)
    .map((marker) => marker.label.toLowerCase());
  if (!input.thirdPartyTested) ontbreekt.unshift("een onafhankelijk labrapport");
  if (keurmerken.length === 0) ontbreekt.push("een erkend keurmerk");

  let reden: string;
  if (behaald.length === 0) {
    reden = `Geen enkele externe toets: ${ontbreekt.join(", ")} ontbreekt. Je vaart op wat de fabrikant zelf zegt.`;
  } else if (ontbreekt.length === 0) {
    reden = `Volledig extern getoetst: ${behaald.join(", ")}.`;
  } else {
    reden = `Wel ${behaald.join(" en ")}; niet ${ontbreekt.join(", ")}.`;
  }

  return {
    id: "toetsing",
    label: SCORE_COMPONENT_LABELS.toetsing,
    weight: SCORE_WEIGHTS.toetsing,
    points,
    reden,
  };
}

export function resolveClaimStance(input: TrustScoreInput): ClaimStance {
  if (input.dosisOnzekerReden) {
    return "onbepaald";
  }

  const entry = approvedClaims[input.werkzameStof];
  const ingredientHasApprovedClaims =
    entry.status === "approved" &&
    entry.claims.some((claim) => claim.status === "approved");

  if (!ingredientHasApprovedClaims) {
    return "geen_erkende_claim";
  }

  const linked = input.efsaClaimIds
    .map((claimId) => getClaimById(claimId))
    .filter(
      (claim): claim is NonNullable<ReturnType<typeof getClaimById>> =>
        claim !== null && claim.status === "approved",
    );

  if (linked.length === 0) {
    return "onbepaald";
  }

  const met = linked.filter((claim) => {
    const amount = nutrientAmountFor(
      input.doseringPerDagdosis,
      claim.threshold.nutrient,
    );
    return amount != null && amount >= claim.threshold.minAmount;
  });

  if (met.length === linked.length) {
    return "voldoet";
  }
  if (met.length === 0) {
    return "voldoet_niet";
  }
  return "voldoet_deels";
}

/**
 * Hoeveelheid van de nutriënt waarop de claimdrempel is gedefinieerd. Bewust
 * een eigen implementatie naast `claim-condition.ts`: die geeft een boolean,
 * hier is het getal zelf nodig om "voldoet deels" te kunnen onderscheiden.
 */
export function nutrientAmountFor(
  dosering: DoseringPerDagdosis,
  nutrient: string,
): number | null {
  switch (nutrient) {
    case "magnesium":
    case "zink":
      return dosering.elementair && dosering.eenheid === "mg"
        ? dosering.hoeveelheid
        : null;
    case "epa_dha":
      return dosering.epaMg != null && dosering.dhaMg != null
        ? dosering.epaMg + dosering.dhaMg
        : null;
    case "dha":
      return dosering.dhaMg ?? null;
    case "vitamine_d":
    case "vitamine_k":
      return dosering.eenheid === "ug" ? dosering.hoeveelheid : null;
    case "creatine":
      return dosering.eenheid === "g" ? dosering.hoeveelheid : null;
    default:
      return null;
  }
}

export function computeTrustScore(input: TrustScoreInput): TrustScoreResult {
  const raw: ScoreComponentResult[] = [
    claimCoverageComponent(input),
    doseComponent(input),
    formComponent(input),
    labelComponent(input),
    testingComponent(input),
  ];

  const determined = raw.filter((component) => component.points !== null);
  const weightSum = determined.reduce(
    (sum, component) => sum + SCORE_WEIGHTS[component.id],
    0,
  );

  const components = COMPONENT_ORDER.map((id) => {
    const component = raw.find((item) => item.id === id)!;
    return {
      ...component,
      weight:
        component.points === null || weightSum === 0
          ? 0
          : Math.round((SCORE_WEIGHTS[component.id] / weightSum) * 1000) / 1000,
    };
  });

  const total =
    weightSum === 0
      ? 0
      : determined.reduce(
          (sum, component) =>
            sum + (component.points ?? 0) * (SCORE_WEIGHTS[component.id] / weightSum),
          0,
        );

  return {
    modelVersion: PS_SCORE_MODEL_VERSION,
    total: round1(total),
    components,
    determinedCount: determined.length,
    totalCount: COMPONENT_ORDER.length,
    claimStance: resolveClaimStance(input),
  };
}
