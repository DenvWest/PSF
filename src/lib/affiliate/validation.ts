// Handgeschreven validatie voor het affiliate-programma (geen zod).

import type {
  AfAppliesTo,
  AffiliateStatus,
  AfRuleType,
  AfValueType,
} from "@/types/affiliate";

export const AFFILIATE_STATUSES: AffiliateStatus[] = ["active", "paused", "ended"];
export const AF_APPLIES_TO: AfAppliesTo[] = ["lead", "sale", "both"];
export const AF_RULE_TYPES: AfRuleType[] = ["standard", "promo"];
export const AF_VALUE_TYPES: AfValueType[] = ["percent", "fixed"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAffiliateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Naam is verplicht.";
  if (trimmed.length > 120) return "Naam mag maximaal 120 tekens zijn.";
  return null;
}

export function validateOptionalEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return EMAIL_RE.test(trimmed) ? null : "Geen geldig e-mailadres.";
}

export interface AffiliateInput {
  displayName: string;
  company: string | null;
  email: string | null;
  status: AffiliateStatus;
  notes: string | null;
}

export function validateAffiliate(input: AffiliateInput): string | null {
  const nameError = validateAffiliateName(input.displayName);
  if (nameError) return nameError;
  if (!AFFILIATE_STATUSES.includes(input.status)) return "Onbekende status.";
  return validateOptionalEmail(input.email ?? "");
}

export interface AfRuleInput {
  appliesTo: AfAppliesTo;
  valueType: AfValueType;
  ratePercent: number | null;
  amountCents: number | null;
  ruleType: AfRuleType;
  validFrom: string | null;
  validTo: string | null;
}

export function validateAfRule(input: AfRuleInput): string | null {
  if (!AF_APPLIES_TO.includes(input.appliesTo)) return "Onbekend bereik.";
  if (input.valueType === "percent") {
    if (input.ratePercent === null) return "Percentage is verplicht.";
    if (input.ratePercent < 0 || input.ratePercent > 100) {
      return "Percentage moet tussen 0 en 100 liggen.";
    }
  } else {
    if (input.amountCents === null) return "Bedrag is verplicht.";
    if (input.amountCents < 0) return "Bedrag kan niet negatief zijn.";
  }
  if (input.ruleType === "promo" && !input.validTo) {
    return "Een tijdelijke actie heeft een einddatum nodig.";
  }
  if (input.validFrom && input.validTo && input.validTo < input.validFrom) {
    return "Einddatum ligt vóór de startdatum.";
  }
  return null;
}
