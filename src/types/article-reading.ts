/** Items voor automatische inhoudsopgave (H2/H3). */

export interface ArticleTocItem {
  /** Moet gelijk zijn aan het `id`-attribuut van de kop in de DOM */
  id: string
  label: string
  depth: 2 | 3
}
