import { IMAGE_SOURCES, validateImageInput } from "@/lib/product-admin/edit-validation";

export const BULK_NOTE_MIN_LENGTH = 20;

export interface BulkImageRow {
  id: string;
  source: string | null;
  license_note: string | null;
}

/** Nooit een bestaande licentie-notitie overschrijven. */
export function imagesNeedingLicense<T extends BulkImageRow>(images: T[]): T[] {
  return images.filter((i) => !i.license_note?.trim());
}

export function validateBulkLicense(input: { source: string; licenseNote: string }): string | null {
  if (!(IMAGE_SOURCES as readonly string[]).includes(input.source)) return "Kies een bron voor de afbeeldingen.";
  const base = validateImageInput(input);
  if (base) return base;
  if (input.licenseNote.trim().length < BULK_NOTE_MIN_LENGTH) {
    return `Beschrijf de grondslag in minstens ${BULK_NOTE_MIN_LENGTH} tekens (wie, waarom, wanneer nagegaan).`;
  }
  return null;
}
