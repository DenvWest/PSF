export const DOSAGE_UNITS = ["mg", "ug", "g"] as const;
export const IMAGE_SOURCES = ["own", "merchant_feed", "manufacturer", "licensed"] as const;
export const SOURCE_KINDS = ["etiket", "fabrikant", "webshop", "onderzoek", "overig"] as const;

export const IMAGE_SOURCE_LABEL: Record<(typeof IMAGE_SOURCES)[number], string> = {
  own: "Eigen foto",
  merchant_feed: "Feed van de winkel",
  manufacturer: "Fabrikant",
  licensed: "Gelicentieerd",
};

export function parseEuroToCents(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

export function validateActiveInput(input: { amount: number; unit: string }): string | null {
  if (!Number.isFinite(input.amount) || input.amount <= 0) return "Hoeveelheid moet groter dan 0 zijn.";
  if (!(DOSAGE_UNITS as readonly string[]).includes(input.unit)) return "Kies mg, ug of g.";
  return null;
}

export function validateImageInput(input: { source: string; licenseNote: string }): string | null {
  if (!(IMAGE_SOURCES as readonly string[]).includes(input.source)) return "Kies een bron voor de afbeelding.";
  if (input.licenseNote.trim() === "") return "Licentie-notitie is verplicht (bijv. 'eigen foto' of waar de toestemming staat).";
  return null;
}

export function validateSourceInput(input: { kind: string; url: string; title: string }): string | null {
  if (input.kind.trim() === "") return "Kies een soort bron.";
  if (input.url.trim() === "" && input.title.trim() === "") return "Vul een URL of titel in.";
  if (input.url.trim() !== "") {
    try {
      const url = new URL(input.url.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") return "Ongeldige URL.";
    } catch {
      return "Ongeldige URL (begin met https://).";
    }
  }
  return null;
}

export function validateOfferPrice(priceCents: number | null): string | null {
  if (priceCents === null) return "Prijs is geen geldig bedrag.";
  if (priceCents <= 0) return "Prijs moet groter dan 0 zijn.";
  return null;
}
