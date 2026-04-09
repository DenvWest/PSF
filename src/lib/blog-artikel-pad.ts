export function blogArtikelPad(artikel: { slug: string; pad?: string }): string {
  return artikel.pad ?? `/blog/${artikel.slug}`;
}
