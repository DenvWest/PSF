export function blogArtikelPad(artikel: { slug: string }): string {
  return `/blog/${artikel.slug}`;
}
