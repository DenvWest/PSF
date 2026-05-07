import type { ArticleTocItem } from "@/types/article-reading"
import type { BlogSectie } from "@/types/blog"
import { blogSectionDomId, blogSubsectionDomId } from "@/lib/article-heading-id"
import type { KennisbankTerm } from "@/data/kennisbank"

export function buildBlogTocItems(articleSlug: string, secties: BlogSectie[]): ArticleTocItem[] {
  const out: ArticleTocItem[] = []
  let visibleIndex = 0
  for (let i = 0; i < secties.length; i++) {
    const s = secties[i]!
    if (s.titel === "Disclaimer") continue
    const id = blogSectionDomId(articleSlug, visibleIndex, s.titel)
    out.push({ id, label: s.titel, depth: 2 })
    const subs = s.subkoppen
    if (subs?.length) {
      subs.forEach((sub, j) => {
        out.push({
          id: blogSubsectionDomId(id, j, sub.titel),
          label: sub.titel,
          depth: 3,
        })
      })
    }
    visibleIndex++
  }
  return out
}

export function buildKennisbankTocItems(term: KennisbankTerm): ArticleTocItem[] {
  return [
    { id: "wat-is-het", label: `Wat is ${term.term}?`, depth: 2 },
    { id: "hoe-werkt-het", label: "Hoe werkt het?", depth: 2 },
    { id: "waarom-dit-ertoe-doet", label: "Waarom dit ertoe doet voor jouw keuze", depth: 2 },
  ]
}
