import { publicJpgForSlug } from "@/lib/public-jpg";

export interface ArticleBodyImage {
  src: string;
  alt: string;
  caption: string;
}

function captionFor(titel: string, alt: string): string {
  const base = `${titel} — ${alt}`;
  return base.length > 40 ? base : `${base}. Toelichting bij de tekst.`;
}

function bodyImage(
  dir: string,
  slug: string,
  alt: string,
  titel: string,
): ArticleBodyImage | undefined {
  const src = publicJpgForSlug(dir, slug);
  if (!src) {
    return undefined;
  }
  return {
    src,
    alt,
    caption: captionFor(titel, alt),
  };
}

export function blogBodyImage(
  slug: string,
  alt: string,
  titel: string,
): ArticleBodyImage | undefined {
  return bodyImage("/images/blog/inline", slug, alt, titel);
}

export function kennisbankBodyImage(
  slug: string,
  alt: string,
  titel: string,
): ArticleBodyImage | undefined {
  return bodyImage("/images/kennisbank/inline", slug, alt, titel);
}
