import type { SupplementProduct, TableRow } from "@/types/supplement";

export function getProductPricePerDay(product: SupplementProduct): string | undefined {
  const priceSpec = product.specs.find(
    (s) => s.label === "Prijs / dag" || s.label === "Prijs per maand" || s.label === "Prijs indicatie",
  );
  return priceSpec?.value;
}

export function getTableRowPrice(tableRows: TableRow[], slug: string): string | undefined {
  return tableRows.find((row) => row.slug === slug)?.prijs;
}

export function buildAffiliateCtaLabel(badgeLabel: string, price?: string): string {
  if (price) {
    return `Kies ${badgeLabel} — vanaf ${price.replace(/\s+/g, " ").trim()}`;
  }
  return `Kies ${badgeLabel}`;
}
