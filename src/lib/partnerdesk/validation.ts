// Handgeschreven validatie (geen zod in dit project). Gedeeld door client (inline
// feedback) en server (bron van waarheid). Retourneert een foutregel of null.

import type { PartnerStatus } from "@/types/partnerdesk";

export const PARTNER_STATUSES: PartnerStatus[] = [
  "onboarding",
  "active",
  "paused",
  "ended",
];

/** Velden van pd_partners die via inline edit bewerkbaar zijn (allowlist). */
export const EDITABLE_PARTNER_FIELDS = [
  "name",
  "status",
  "network_id",
  "category_id",
  "website",
  "login_url",
  "login_username",
  "account_manager",
  "description",
] as const;

export type EditablePartnerField = (typeof EDITABLE_PARTNER_FIELDS)[number];

export function isEditablePartnerField(
  field: string,
): field is EditablePartnerField {
  return (EDITABLE_PARTNER_FIELDS as readonly string[]).includes(field);
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return Boolean(url.hostname) && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function validatePartnerName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Naam is verplicht.";
  if (trimmed.length > 120) return "Naam mag maximaal 120 tekens zijn.";
  return null;
}

export function validateOptionalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!isValidUrl(trimmed)) return "Geen geldige URL.";
  return null;
}

export function validatePartnerStatus(value: string): string | null {
  return PARTNER_STATUSES.includes(value as PartnerStatus)
    ? null
    : "Onbekende status.";
}

/**
 * Valideert een enkele inline-editwijziging op een partnerveld. Lege waarde is
 * toegestaan (wordt null) behalve voor verplichte/keuzevelden.
 */
export function validatePartnerFieldValue(
  field: EditablePartnerField,
  value: string,
): string | null {
  switch (field) {
    case "name":
      return validatePartnerName(value);
    case "status":
      return validatePartnerStatus(value);
    case "website":
    case "login_url":
      return validateOptionalUrl(value);
    default:
      return null;
  }
}
