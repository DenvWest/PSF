import { approvedClaims } from "@/data/approved-claims";
import type {
  DomainKey,
  DomainSupplementTip,
} from "@/data/nurture-content";
import type { NurturePlanGate } from "@/lib/content/nurture-interventions";
import { RULES_VERSION } from "@/lib/intake-engine";
import { getRecommendations } from "@/lib/recommendation-engine";
import type { RecommendationInput } from "@/types/recommendation";

const TIP_INTRO_BY_DOMAIN: Record<DomainKey, string> = {
  sleep_score:
    "Je slaap kwam uit de Leefstijlcheck als je grootste aandachtspunt.",
  energy_score: "Je energieniveau was je laagste score in de Leefstijlcheck.",
  stress_score: "Stress kwam naar voren als je grootste aandachtspunt.",
  nutrition_score:
    "Je voeding — en met name je omega-3 inname — scoorde het laagst.",
  movement_score: "Je bewegingspatroon heeft ruimte voor verbetering.",
  recovery_score:
    "Je herstel scoorde het laagst — je lichaam krijgt niet genoeg rust.",
};

const TIP_COPY_BY_INGREDIENT: Record<
  string,
  { name: string; reason: string }
> = {
  magnesium: {
    name: "Magnesium",
    reason:
      "Magnesium draagt bij tot een normale psychologische functie en tot vermindering van vermoeidheid (plus zenuwstelsel en spieren onder EU‑claims). Glycinaat is praktisch in een rustige avondroutine — naast vaste slapen-/lichtgewoonten.",
  },
  omega3: {
    name: "Omega-3",
    reason:
      "De meeste mannen krijgen te weinig EPA en DHA binnen via voeding. Een goed omega-3 supplement is vaak de makkelijkste eerste stap.",
  },
};

const LIFESTYLE_FALLBACK_BY_DOMAIN: Record<DomainKey, DomainSupplementTip> = {
  sleep_score: {
    intro: TIP_INTRO_BY_DOMAIN.sleep_score,
    supplement: {
      name: "Leefstijlstappen",
      reason:
        "Slaap vraagt eerst aandacht voor vast ritme, licht en rustmomenten — dat zijn de hefbomen met het meeste bewijs vóór je aan supplementen denkt.",
      url: "/slaap-verbeteren-na-40",
    },
  },
  energy_score: {
    intro: TIP_INTRO_BY_DOMAIN.energy_score,
    supplement: {
      name: "Leefstijlstappen",
      reason:
        "Energie na 40 vraagt eerst aandacht voor slaap, voeding en beweging — geen supplementclaim op ‘direct meer energie’.",
      url: "/energie-na-40",
    },
  },
  stress_score: {
    intro: TIP_INTRO_BY_DOMAIN.stress_score,
    supplement: {
      name: "Leefstijlstappen",
      reason:
        "Chronische stress vraagt eerst aandacht voor slaapritme, voorspelbare routines en korte herstelmomenten — dat zijn de hefbomen met het meeste bewijs vóór je aan supplementen denkt.",
      url: "/stress-verminderen-man",
    },
  },
  nutrition_score: {
    intro: TIP_INTRO_BY_DOMAIN.nutrition_score,
    supplement: {
      name: "Leefstijlstappen",
      reason:
        "Voeding na 40 begint met structurele maaltijden en voldoende eiwit en vetzuren via voeding — supplementen zijn aanvulling, geen vervanging.",
      url: "/voeding-na-40",
    },
  },
  movement_score: {
    intro: TIP_INTRO_BY_DOMAIN.movement_score,
    supplement: {
      name: "Leefstijlstappen",
      reason:
        "Beweging opbouwen begint met haalbare stappen en herstel — supplementen zijn context, geen vervanging voor consistente activiteit.",
      url: "/beweging-na-40",
    },
  },
  recovery_score: {
    intro: TIP_INTRO_BY_DOMAIN.recovery_score,
    supplement: {
      name: "Leefstijlstappen",
      reason:
        "Herstel vraagt eerst vaste rustmomenten, slaap en voeding — dat zijn de hefbomen met het meeste bewijs vóór je aan supplementen denkt.",
      url: "/gids/herstel",
    },
  },
};

const NURTURE_ENGINE_STUB: RecommendationInput = {
  scores: {
    sleep_score: 0,
    energy_score: 0,
    stress_score: 0,
    nutrition_score: 0,
    movement_score: 0,
    recovery_score: 0,
  },
  signals: {
    omega3_deficiency: false,
    magnesium_signal: false,
    cortisol_risk: false,
    creatine_signal: false,
    melatonine_signal: false,
    protein_gap_signal: false,
    low_recovery_no_load: false,
    sleep_issue_no_stress: false,
    energy_dip_unexplained: false,
  },
  profileLabel: { name: "In Balans", domain: "nutrition", score: 0 },
  answers: {},
  rulesVersion: RULES_VERSION,
};

export function resolveDomainSupplementTip(
  domain: DomainKey,
  _planGate: NurturePlanGate | null,
): DomainSupplementTip {
  const [recommendation] = getRecommendations(NURTURE_ENGINE_STUB, {
    source: "nurture",
    domain,
  });

  if (recommendation?.available && recommendation.comparisonPath) {
    const claimKey = recommendation.supplementId === "magnesium-glycinaat"
      ? "magnesium"
      : recommendation.supplementId === "omega-3"
        ? "omega3"
        : null;
    const copy = claimKey ? TIP_COPY_BY_INGREDIENT[claimKey] : null;
    const entry = claimKey ? approvedClaims[claimKey] : null;

    if (copy && entry) {
      return {
        intro: TIP_INTRO_BY_DOMAIN[domain],
        supplement: {
          name: copy.name,
          reason: copy.reason,
          url: recommendation.comparisonPath,
        },
      };
    }
  }

  return LIFESTYLE_FALLBACK_BY_DOMAIN[domain];
}
