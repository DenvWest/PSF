import type { BlogArtikel } from "@/types/blog";

const LONG_ARTICLE_MINUTES = 8;

export function parseBlogLeestijdMinuten(leestijd: string): number | null {
  const match = /^(\d+)/.exec(leestijd.trim());
  if (!match) return null;
  const n = Number.parseInt(match[1]!, 10);
  return Number.isFinite(n) ? n : null;
}

export function isLongBlogArticle(artikel: BlogArtikel): boolean {
  const minutes = parseBlogLeestijdMinuten(artikel.leestijd);
  return minutes !== null && minutes >= LONG_ARTICLE_MINUTES;
}
