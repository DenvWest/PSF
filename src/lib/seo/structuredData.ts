import type { SupplementProduct } from "@/types/supplement";

const SITE_URL = "https://perfectsupplement.nl";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

function resolveSiteUrl(url: string): string {
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: resolveSiteUrl(item.url),
    })),
  };
}

export function buildNamedItemListSchema(
  listName: string,
  entries: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      url: resolveSiteUrl(entry.url),
    })),
  };
}

export function buildItemListSchema(
  products: SupplementProduct[],
  pageUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: pageUrl,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: `${pageUrl}#${product.slug}`,
    })),
  };
}

export function buildHowToSchema(params: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: params.name,
    description: params.description,
    step: params.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function buildFaqSchema(
  questions: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function buildArticleSchema(params: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}) {
  const modified = params.dateModified ?? params.datePublished;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.headline,
    description: params.description,
    author: {
      "@type": "Organization",
      name: "PerfectSupplement",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "PerfectSupplement",
      url: SITE_URL,
    },
    datePublished: params.datePublished,
    dateModified: modified,
    mainEntityOfPage: resolveSiteUrl(params.path),
  };
}

export function buildDefinedTermSchema(params: {
  term: string;
  description: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: params.term,
    description: params.description,
    url: `https://perfectsupplement.nl/kennisbank/${params.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "PerfectSupplement Kennisbank",
      url: "https://perfectsupplement.nl/kennisbank",
    },
  };
}
