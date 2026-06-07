import { approvedClaims } from "@/data/approved-claims";
import { DOMAIN_SUPPLEMENT_CANDIDATES } from "@/data/domain-supplement-candidates";
import type {
  DomainKey,
  DomainSupplementTip,
} from "@/data/nurture-content";
import type { NurturePlanGate } from "@/lib/content/nurture-interventions";
import { resolveGatedComparisonPath } from "@/lib/supplement-gate";

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

export function resolveDomainSupplementTip(
  domain: DomainKey,
  _planGate: NurturePlanGate | null,
): DomainSupplementTip {
  const candidates = DOMAIN_SUPPLEMENT_CANDIDATES[domain];

  for (const ingredientKey of candidates) {
    const comparisonPath = resolveGatedComparisonPath(ingredientKey);
    if (!comparisonPath) {
      continue;
    }

    const entry = approvedClaims[ingredientKey];
    const copy = TIP_COPY_BY_INGREDIENT[ingredientKey];
    if (!entry || !copy) {
      continue;
    }

    return {
      intro: TIP_INTRO_BY_DOMAIN[domain],
      supplement: {
        name: copy.name,
        reason: copy.reason,
        url: comparisonPath,
      },
    };
  }

  return LIFESTYLE_FALLBACK_BY_DOMAIN[domain];
}
