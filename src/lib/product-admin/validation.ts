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

export function validateProductField(field: EditableProductField, value: string): string | null {
  if (field === "name" && value === "") return "Naam is verplicht.";
  if (field === "product_url" && value !== "") {
    try {
      const url = new URL(value.includes("://") ? value : `https://${value}`);
      if (url.protocol !== "https:" && url.protocol !== "http:") return "Ongeldige URL.";
    } catch {
      return "Ongeldige URL.";
    }
  }
  return null;
}
