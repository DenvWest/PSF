export const EDITABLE_PRODUCT_FIELDS = [
  "name",
  "variant",
  "form",
  "flavour",
  "usage_advice",
  "description",
  "target_audience",
  "country_of_origin",
  "product_url",
] as const;

export type EditableProductField = (typeof EDITABLE_PRODUCT_FIELDS)[number];

export function isEditableProductField(field: string): field is EditableProductField {
  return (EDITABLE_PRODUCT_FIELDS as readonly string[]).includes(field);
}

/** Lege waarde is toegestaan; anders alleen http(s), ook zonder schema getypt (bijv. "shop.nl/x"). */
export function validateOptionalUrl(value: string): string | null {
  if (value === "") return null;
  const scheme = value.includes("://") ? null : /^([a-z][a-z0-9+.-]*):/i.exec(value);
  if (scheme && !scheme[1].includes(".") && scheme[1].toLowerCase() !== "localhost") return "Ongeldige URL.";
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? null : "Ongeldige URL.";
  } catch {
    return "Ongeldige URL.";
  }
}

export function validateProductField(field: EditableProductField, value: string): string | null {
  if (field === "name" && value === "") return "Naam is verplicht.";
  if (field === "product_url") return validateOptionalUrl(value);
  return null;
}

export const EDITABLE_BRAND_FIELDS = ["name", "manufacturer", "country", "website", "transparency_note"] as const;
export const EDITABLE_CATEGORY_FIELDS = ["name", "description"] as const;

export type EditableBrandField = (typeof EDITABLE_BRAND_FIELDS)[number];
export type EditableCategoryField = (typeof EDITABLE_CATEGORY_FIELDS)[number];

export function isEditableBrandField(field: string): field is EditableBrandField {
  return (EDITABLE_BRAND_FIELDS as readonly string[]).includes(field);
}

export function isEditableCategoryField(field: string): field is EditableCategoryField {
  return (EDITABLE_CATEGORY_FIELDS as readonly string[]).includes(field);
}

export function validateBrandField(field: EditableBrandField, value: string): string | null {
  if (field === "name" && value === "") return "Naam is verplicht.";
  if (field === "website") return validateOptionalUrl(value);
  return null;
}

export function validateCategoryField(field: EditableCategoryField, value: string): string | null {
  if (field === "name" && value === "") return "Naam is verplicht.";
  return null;
}

export function validateNewBrandName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed === "") return "Naam is verplicht.";
  if (trimmed.length > 80) return "Naam is te lang (max 80 tekens).";
  return null;
}
