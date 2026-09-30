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

export const IMAGE_PATH_PREFIX = "/images/producten/";

/** Naamconventie uit CLAUDE.md: Merk-Product.jpg, geen spaties of speciale tekens; pad moet in public/images/producten/ liggen. */
export function validateImagePath(path: string): string | null {
  if (!path.startsWith(IMAGE_PATH_PREFIX)) return `Pad moet beginnen met ${IMAGE_PATH_PREFIX}`;
  const file = path.slice(IMAGE_PATH_PREFIX.length);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\.(jpg|jpeg|png|webp)$/.test(file)) {
    return "Bestandsnaam: alleen letters, cijfers, punt, streepje; eindigt op .jpg, .png of .webp (geen spaties).";
  }
  return null;
}

export function validateNewProduct(input: { name: string; brandId: string; categoryId: string }): string | null {
  if (input.name.trim() === "") return "Naam is verplicht.";
  if (input.name.trim().length > 120) return "Naam is te lang (max 120 tekens).";
  if (!input.brandId) return "Kies een merk.";
  if (!input.categoryId) return "Kies een categorie.";
  return null;
}

export function validateNewActive(input: {
  nutrientKey: string;
  allowedKeys: readonly string[];
  amount: number;
  unit: string;
}): string | null {
  if (!input.allowedKeys.includes(input.nutrientKey)) return "Kies een werkzame stof uit de lijst.";
  return validateActiveInput({ amount: input.amount, unit: input.unit });
}

export function validateCertificationKey(key: string): string | null {
  if (!/^[a-z0-9_]{2,40}$/.test(key)) return "Gebruik kleine letters, cijfers en underscores (2-40 tekens).";
  return null;
}

export function validateNewOffer(input: { retailerId: string; priceCents: number | null; affiliateUrl: string }): string | null {
  if (!input.retailerId) return "Kies een retailer.";
  const priceError = validateOfferPrice(input.priceCents);
  if (priceError) return priceError;
  if (input.affiliateUrl.trim() !== "") {
    try {
      const url = new URL(input.affiliateUrl.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") return "Ongeldige affiliate-URL.";
    } catch {
      return "Ongeldige affiliate-URL (begin met https://).";
    }
  }
  return null;
}
