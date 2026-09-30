import { validateOptionalUrl } from "@/lib/product-admin/validation";

export const EDITABLE_RETAILER_FIELDS = ["name", "base_url", "tracking_param", "disclosure_label", "pd_partner_id"] as const;
export type EditableRetailerField = (typeof EDITABLE_RETAILER_FIELDS)[number];

export const RETAILER_RELATIONSHIPS = ["direct", "network"] as const;
export type RetailerRelationship = (typeof RETAILER_RELATIONSHIPS)[number];

export function isEditableRetailerField(field: string): field is EditableRetailerField {
  return (EDITABLE_RETAILER_FIELDS as readonly string[]).includes(field);
}

export function validateRetailerField(field: EditableRetailerField, value: string): string | null {
  if (field === "name" && value === "") return "Naam is verplicht.";
  if (field === "base_url") return validateOptionalUrl(value);
  if (field === "tracking_param" && value !== "" && !/^[A-Za-z0-9_.-]{1,40}$/.test(value)) {
    return "Parameternaam: letters, cijfers, punt, streepje of underscore (max 40).";
  }
  return null;
}

export function validateNewRetailer(input: { name: string; relationship: string }): string | null {
  if (input.name.trim() === "") return "Naam is verplicht.";
  if (input.name.trim().length > 80) return "Naam is te lang (max 80 tekens).";
  if (!(RETAILER_RELATIONSHIPS as readonly string[]).includes(input.relationship)) return "Kies direct of netwerk.";
  return null;
}
