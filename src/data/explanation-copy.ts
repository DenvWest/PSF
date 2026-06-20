import type { DeficiencySignals, DomainScores, ProfileLabel } from "@/lib/intake-engine";
import type { PillarId } from "@/types/dashboard";

export const DOMAIN_LABELS: Record<keyof DomainScores, string> = {
  sleep_score: "Slaap",
  energy_score: "Energie",
  stress_score: "Stress",
  nutrition_score: "Voeding",
  movement_score: "Beweging",
  recovery_score: "Herstel",
};

export const SIGNAL_COPY: Record<keyof DeficiencySignals, string> = {
  omega3_deficiency: "Je eet zelden vette vis",
  magnesium_signal:
    "Je slaap- of stresspatroon wijst op extra ondersteuning via magnesium",
  cortisol_risk: "Je stress blijft lang aan staan — je lichaam herstelt trager",
  creatine_signal:
    "Je traint regelmatig en herstelt langzamer dan je zou verwachten",
  melatonine_signal:
    "Je valt moeilijk in slaap terwijl je stress hoog blijft",
  protein_gap_signal: "Je eiwitinname blijft waarschijnlijk achter",
  low_recovery_no_load:
    "Je herstel blijft achter zonder duidelijke trainingsbelasting",
  sleep_issue_no_stress:
    "Je slaap hapert terwijl je stress beheersbaar lijkt",
  energy_dip_unexplained:
    "Je energie zakt zonder dat slaap of voeding het verklaart",
};

export function domainBelowTemplate(label: string): string {
  return `Je ${label}-score zit onder de drempel`;
}

export const PROFILE_COPY: Record<ProfileLabel["name"], string> = {
  "Onrustige Slaper": "Je slaappatroon is je zwakste schakel",
  "Lage Batterij": "Je energiecurve zakt sneller dan je lichaam bijhoudt",
  Stressdrager: "Je stress-as blijft langer actief dan nodig",
  "In Balans": "Je profiel wijst op een specifiek aandachtspunt",
};

export const HUB_RULE_COPY: Record<string, string> = {
  sleep_or_stress_below_50:
    "Je slaap- of stressscore zit onder de drempel",
  recovery_below_40_no_magnesium:
    "Je herstelscore zit laag en magnesium past bij dit patroon",
  omega3_answer_low_or_nutrition_below_40:
    "Je eet weinig vette vis of je voedingsscore zit onder de drempel",
  energy_below_40: "Je energiecurve zit onder de drempel",
  vitamin_d_fallback:
    "Je profiel past bij een algemene aanvulling op zonlicht en voeding",
  creatine_custom_matcher:
    "Je beweegt regelmatig en je herstel of energie vraagt om extra ondersteuning",
  fallback_only:
    "Geen specifiek signaal — dit is een brede aanvulling op je profiel",
  nurture_domain_sleep_score:
    "Je slaap is je prioriteit in de opvolging",
  nurture_domain_energy_score:
    "Je energiecurve is je prioriteit in de opvolging",
  nurture_domain_stress_score:
    "Je stresspatroon is je prioriteit in de opvolging",
  nurture_domain_nutrition_score:
    "Je voedingspatroon is je prioriteit in de opvolging",
  nurture_domain_movement_score:
    "Je bewegingspatroon is je prioriteit in de opvolging",
  nurture_domain_recovery_score:
    "Je herstel is je prioriteit in de opvolging",
};

export const PILLAR_CONTEXT_COPY: Record<PillarId, string> = {
  slaap: "Je valt laat in en slaapt onrustig — slaap is je prioriteit",
  energie: "",
  stress: "",
  voeding: "Je eet zelden vette vis — voeding is je prioriteit",
  beweging: "",
  herstel: "",
};

export const LIFESTYLE_FIRST_GENERIC =
  "Leefstijl eerst — dit is een aanvulling op een gemeten gat, geen vervanging.";

export function supplementRationaleTemplate(name: string): string {
  return `${name} is een aanvulling op een gemeten gat — geen vervanging van de leefstijl-stap.`;
}

export const TRUST_LINE = "Wij kozen dit op kwaliteit, niet op commissie.";

export const EFSA_ON_HOLD_NOTE = "Dit is geen goedgekeurde gezondheidsclaim.";

export function getSignalCopy(signal: keyof DeficiencySignals): string {
  return SIGNAL_COPY[signal] ?? "";
}

export function getHubRuleCopy(rule: string): string {
  if (rule in HUB_RULE_COPY) {
    return HUB_RULE_COPY[rule];
  }
  if (rule.startsWith("nurture_domain_")) {
    return HUB_RULE_COPY[rule] ?? "";
  }
  return "";
}
