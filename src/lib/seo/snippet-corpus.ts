import {
  ALL_SUPPLEMENT_SLUGS,
  getSupplementData,
} from "@/data/supplement-guides";
import {
  SUPPLEMENT_SLUGS,
  getSupplementComparisonData,
} from "@/data/supplements";
import type { SnippetPage } from "@/lib/seo/snippet-contract";

/**
 * De pagina's die om dezelfde zoekopdracht concurreren: de zeven
 * vergelijkingen (/beste/*) en de acht supplementgidsen (/supplementen/*).
 * Ze staan samen in één corpus omdat juist het paar over dezelfde stof
 * elkaar kan verdringen.
 */
export function buildSnippetCorpus(): SnippetPage[] {
  const vergelijkingen = SUPPLEMENT_SLUGS.map((slug) => {
    const data = getSupplementComparisonData(slug);
    if (!data) {
      throw new Error(`Geen vergelijkingsdata voor /beste/${slug}`);
    }
    return {
      path: `/beste/${slug}`,
      substance: data.category,
      title: data.seoTitle,
      description: data.seoDescription,
      h1: data.h1,
    };
  });

  const gidsen = ALL_SUPPLEMENT_SLUGS.map((slug) => {
    const data = getSupplementData(slug);
    return {
      path: `/supplementen/${slug}`,
      substance: data.slug,
      title: data.metaTitle,
      description: data.metaDescription,
      h1: data.h1,
    };
  });

  return [...vergelijkingen, ...gidsen];
}
