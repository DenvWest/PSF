/**
 * Stable URL-anchor fragment from a heading string (Nederlands).
 */
export function slugifyArticleHeading(raw: string): string {
  const base = raw
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(/\s+/g, " ")
    .trim()
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return slug.length > 0 ? slug : "sectie"
}

export function blogSectionDomId(articleSlug: string, sectionIndex: number, titel: string): string {
  return `${articleSlug}-h2-${sectionIndex}-${slugifyArticleHeading(titel)}`
}

export function blogSubsectionDomId(parentSectionDomId: string, subIndex: number, titel: string): string {
  return `${parentSectionDomId}-h3-${subIndex}-${slugifyArticleHeading(titel)}`
}
