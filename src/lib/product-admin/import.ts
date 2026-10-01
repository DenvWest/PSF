import { parseEuroToCents } from "@/lib/product-admin/edit-validation";
import { buildProductSlug } from "@/lib/product-admin/slug";
import { validateOptionalUrl } from "@/lib/product-admin/validation";

export const IMPORT_COLUMNS = [
  "merk",
  "naam",
  "categorie",
  "variant",
  "vorm",
  "product_url",
  "retailer",
  "prijs",
  "affiliate_url",
] as const;

export const IMPORT_MAX_ROWS = 200;
export const IMPORT_MAX_CHARS = 500_000;

export const IMPORT_TEMPLATE = [
  IMPORT_COLUMNS.join(";"),
  "Vital Nutrition;Magnesium Bisglycinaat;magnesium;Capsules 120 stuks;capsule;https://www.vitalnutrition.nl/magnesium;vitalnutrition;24,95;",
].join("\n");

export interface CsvParseResult {
  rows: Record<string, string>[];
  error: string | null;
}

function splitLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

/** Leest CSV met komma of puntkomma (Nederlandse Excel), optionele aanhalingstekens en BOM. Geen meerregelige cellen. */
export function parseCsv(text: string): CsvParseResult {
  if (text.length > IMPORT_MAX_CHARS) return { rows: [], error: "Bestand is te groot (max 500 KB)." };
  const lines = text
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");
  if (lines.length === 0) return { rows: [], error: "Het bestand is leeg." };

  const delimiter = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const header = splitLine(lines[0], delimiter).map((h) => h.toLowerCase());
  const missing = ["merk", "naam", "categorie"].filter((c) => !header.includes(c));
  if (missing.length > 0) return { rows: [], error: `Kolom(men) ontbreken in de kopregel: ${missing.join(", ")}.` };
  if (lines.length - 1 > IMPORT_MAX_ROWS) return { rows: [], error: `Te veel regels (max ${IMPORT_MAX_ROWS} per import).` };

  const rows = lines.slice(1).map((line, index) => {
    const cells = splitLine(line, delimiter);
    const row: Record<string, string> = { __line: String(index + 2) };
    header.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
  return { rows, error: null };
}

export interface NamedRef {
  id: string;
  name: string;
  slug: string;
}

export interface ImportContext {
  brands: NamedRef[];
  categories: NamedRef[];
  retailers: NamedRef[];
  existingSlugs: ReadonlySet<string>;
  allowNewBrands: boolean;
}

export type RowStatus = "ok" | "duplicate" | "error";

export interface PlannedOffer {
  retailerId: string;
  priceCents: number;
  affiliateUrl: string | null;
}

export interface PlannedRow {
  line: number;
  status: RowStatus;
  messages: string[];
  brandName: string;
  brandId: string | null;
  newBrand: boolean;
  categoryId: string | null;
  categoryName: string;
  name: string;
  variant: string;
  form: string;
  productUrl: string;
  slug: string;
  offer: PlannedOffer | null;
}

function findRef(refs: NamedRef[], value: string): NamedRef | null {
  const needle = value.trim().toLowerCase();
  if (needle === "") return null;
  return refs.find((r) => r.slug.toLowerCase() === needle || r.name.trim().toLowerCase() === needle) ?? null;
}

/** Pure planning: valideert elke regel en herkent dubbelen (in de database én binnen het bestand). Schrijft niets. */
export function planImport(rows: Record<string, string>[], context: ImportContext): PlannedRow[] {
  const seenInFile = new Set<string>();
  const newBrandKeys = new Set<string>();

  return rows.map((row) => {
    const messages: string[] = [];
    const brandName = (row.merk ?? "").trim();
    const name = (row.naam ?? "").trim();
    const category = findRef(context.categories, row.categorie ?? "");
    const brand = findRef(context.brands, brandName);
    const variant = (row.variant ?? "").trim();
    const form = (row.vorm ?? "").trim();
    const productUrl = (row.product_url ?? "").trim();

    if (name === "") messages.push("Naam ontbreekt.");
    else if (name.length > 120) messages.push("Naam is te lang (max 120 tekens).");
    if (brandName === "") messages.push("Merk ontbreekt.");
    else if (!brand && !context.allowNewBrands) messages.push(`Merk '${brandName}' bestaat niet (vink 'nieuwe merken aanmaken' aan of maak het eerst aan).`);
    if (!category) messages.push(`Categorie '${(row.categorie ?? "").trim()}' onbekend (gebruik de slug of naam uit Categorieën).`);
    const urlError = validateOptionalUrl(productUrl);
    if (urlError) messages.push(`product_url: ${urlError}`);

    let offer: PlannedOffer | null = null;
    const retailerValue = (row.retailer ?? "").trim();
    const priceValue = (row.prijs ?? "").trim();
    const affiliateUrl = (row.affiliate_url ?? "").trim();
    if (retailerValue !== "" || priceValue !== "" || affiliateUrl !== "") {
      const retailer = findRef(context.retailers, retailerValue);
      const priceCents = parseEuroToCents(priceValue);
      if (!retailer) messages.push(`Retailer '${retailerValue}' onbekend.`);
      if (priceCents === null || priceCents <= 0) messages.push("Prijs ontbreekt of is ongeldig (bijv. 24,95).");
      const affiliateError = affiliateUrl === "" ? null : validateOptionalUrl(affiliateUrl);
      if (affiliateError) messages.push(`affiliate_url: ${affiliateError}`);
      if (retailer && priceCents !== null && priceCents > 0 && !affiliateError) {
        offer = { retailerId: retailer.id, priceCents, affiliateUrl: affiliateUrl || null };
      }
    }

    const canonicalBrand = brand?.name ?? brandName;
    const slug = name !== "" && canonicalBrand !== "" ? buildProductSlug(canonicalBrand, name, new Set()) : "";
    let status: RowStatus = messages.length > 0 ? "error" : "ok";
    if (status === "ok") {
      if (context.existingSlugs.has(slug)) {
        status = "duplicate";
        messages.push("Bestaat al in de catalogus.");
      } else if (seenInFile.has(slug)) {
        status = "duplicate";
        messages.push("Komt dubbel voor in dit bestand.");
      } else {
        seenInFile.add(slug);
      }
    }

    const isNewBrand = !brand && brandName !== "" && context.allowNewBrands;
    if (status === "ok" && isNewBrand) newBrandKeys.add(brandName.toLowerCase());

    return {
      line: Number(row.__line ?? 0),
      status,
      messages,
      brandName: canonicalBrand,
      brandId: brand?.id ?? null,
      newBrand: isNewBrand,
      categoryId: category?.id ?? null,
      categoryName: category?.name ?? "",
      name,
      variant,
      form,
      productUrl,
      slug,
      offer,
    };
  });
}

export function summarizePlan(plan: PlannedRow[]) {
  return {
    total: plan.length,
    ok: plan.filter((p) => p.status === "ok").length,
    duplicates: plan.filter((p) => p.status === "duplicate").length,
    errors: plan.filter((p) => p.status === "error").length,
    newBrands: [...new Set(plan.filter((p) => p.status === "ok" && p.newBrand).map((p) => p.brandName.toLowerCase()))].length,
  };
}
