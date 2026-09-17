/** Aantal kaarten per bibliotheekpagina (blog + kennisbank). */
export const LIBRARY_PAGE_SIZE = 10;

export type PageToken = number | "ellipsis";

export function libraryPageCount(
  total: number,
  size: number = LIBRARY_PAGE_SIZE,
): number {
  if (total <= 0) return 1;
  return Math.ceil(total / size);
}

export function sliceLibraryPage<T>(
  items: readonly T[],
  page: number,
  size: number = LIBRARY_PAGE_SIZE,
): T[] {
  const start = (Math.max(1, page) - 1) * size;
  return items.slice(start, start + size);
}

/**
 * Compacte paginanummers: `1 … 4 5 6 … 9`. Bij hoogstens 7 pagina's alles tonen.
 */
export function libraryPageTokens(
  current: number,
  total: number,
): PageToken[] {
  if (total <= 1) return [1];
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const clamped = Math.min(Math.max(1, current), total);
  const visible = new Set<number>([1, total, clamped, clamped - 1, clamped + 1]);
  if (clamped <= 3) {
    visible.add(2);
    visible.add(3);
  }
  if (clamped >= total - 2) {
    visible.add(total - 1);
    visible.add(total - 2);
  }

  const sorted = [...visible]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const tokens: PageToken[] = [];
  for (const page of sorted) {
    const previous = tokens[tokens.length - 1];
    if (typeof previous === "number" && page - previous > 1) {
      tokens.push("ellipsis");
    }
    tokens.push(page);
  }
  return tokens;
}
