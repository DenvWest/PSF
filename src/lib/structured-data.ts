const SITE_URL = "https://perfectsupplement.nl";

type BreadcrumbItem = {
  name: string;
  /** Full URL or path (will be resolved against SITE_URL if relative). */
  url: string;
};

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${SITE_URL}${item.url}`,
    })),
  };
}

type ItemListEntry = {
  name: string;
  url: string;
};

export function buildItemListSchema(
  listName: string,
  entries: ItemListEntry[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      url: entry.url.startsWith("http")
        ? entry.url
        : `${SITE_URL}${entry.url}`,
    })),
  };
}
