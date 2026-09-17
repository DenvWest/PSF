import type { Metadata } from "next";
import {
  ARTICLE_FIGURE_HEIGHT,
  ARTICLE_FIGURE_WIDTH,
} from "@/components/article/ArticleFigure";
import { getKennisbankImageSeo } from "@/data/kennisbank-image-seo";
import type { KennisbankCover } from "@/lib/kennisbank-cover";
import type { ArticleBodyImage } from "@/data/article-body-images";
import type { ArticleImageRef } from "@/lib/seo/structuredData";
import { absoluteUrl } from "@/lib/public-site-url";

export const KENNISBANK_IMAGE_WIDTH = ARTICLE_FIGURE_WIDTH;
export const KENNISBANK_IMAGE_HEIGHT = ARTICLE_FIGURE_HEIGHT;

export interface KennisbankResolvedCover extends KennisbankCover {
  caption: string;
  title: string;
}

export function resolveKennisbankCover(
  slug: string,
  cover: KennisbankCover,
): KennisbankResolvedCover {
  const seo = getKennisbankImageSeo(slug);
  return {
    src: cover.src,
    alt: seo?.coverAlt ?? cover.alt,
    caption: seo?.coverCaption ?? cover.alt,
    title: seo?.coverTitle ?? cover.alt,
  };
}

export function resolveKennisbankBodyImage(
  slug: string,
  image: ArticleBodyImage,
): ArticleBodyImage {
  const seo = getKennisbankImageSeo(slug);
  if (!seo?.inlineAlt) return image;
  return {
    src: image.src,
    alt: seo.inlineAlt,
    caption: seo.inlineCaption || image.caption,
  };
}

export function kennisbankImageKeywords(slug: string): string[] {
  return getKennisbankImageSeo(slug)?.searchPhrases ?? [];
}

function socialImageEntry(src: string, alt: string) {
  const url = absoluteUrl(src);
  return {
    url,
    secureUrl: url,
    width: KENNISBANK_IMAGE_WIDTH,
    height: KENNISBANK_IMAGE_HEIGHT,
    alt,
    type: "image/jpeg",
  };
}

export function buildKennisbankOpenGraphImages(
  cover: KennisbankResolvedCover,
  bodyImage?: ArticleBodyImage,
): NonNullable<Metadata["openGraph"]>["images"] {
  const images = [socialImageEntry(cover.src, cover.alt)];
  if (bodyImage) {
    images.push(socialImageEntry(bodyImage.src, bodyImage.alt));
  }
  return images;
}

export function buildKennisbankTwitterImages(
  cover: KennisbankResolvedCover,
  bodyImage?: ArticleBodyImage,
): string[] {
  const urls = [absoluteUrl(cover.src)];
  if (bodyImage) urls.push(absoluteUrl(bodyImage.src));
  return urls;
}

export function buildKennisbankSchemaImages(
  cover: KennisbankResolvedCover,
  bodyImage?: ArticleBodyImage,
): ArticleImageRef[] {
  const images: ArticleImageRef[] = [
    {
      src: cover.src,
      alt: cover.alt,
      caption: cover.caption,
      title: cover.title,
      representativeOfPage: true,
    },
  ];
  if (bodyImage) {
    images.push({
      src: bodyImage.src,
      alt: bodyImage.alt,
      caption: bodyImage.caption,
      title: bodyImage.alt,
      representativeOfPage: false,
    });
  }
  return images;
}
