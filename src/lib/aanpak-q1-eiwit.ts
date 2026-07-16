/** Q1 eiwit-hero: toon wanneer NUT_PROT laag is (2 op schaal 1–4; 0 = onbekend). */
export function shouldShowAanpakQ1EiwitHero(
  answers: Record<string, number> | null | undefined,
): boolean {
  if (!answers) return false;
  const nutProt = answers.NUT_PROT;
  return typeof nutProt === "number" && nutProt >= 1 && nutProt <= 2;
}
