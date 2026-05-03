import type { MetadataRoute } from "next";

const BASE_URL = "https://perfectsupplement.nl";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, lastModified: new Date() },
    { url: `${BASE_URL}/intake`, lastModified: new Date() },
    { url: `${BASE_URL}/beste-omega-3-supplement`, lastModified: new Date() },
    { url: `${BASE_URL}/beste-magnesium`, lastModified: new Date() },
    { url: `${BASE_URL}/beste-eiwitpoeder`, lastModified: new Date() },
    { url: `${BASE_URL}/beste-ashwagandha`, lastModified: new Date() },
    { url: `${BASE_URL}/profiel`, lastModified: new Date() },
    { url: `${BASE_URL}/profiel/stressdrager`, lastModified: new Date() },
    { url: `${BASE_URL}/profiel/lage-batterij`, lastModified: new Date() },
    { url: `${BASE_URL}/profiel/onrustige-slaper`, lastModified: new Date() },
    { url: `${BASE_URL}/profiel/stille-slijter`, lastModified: new Date() },
    { url: `${BASE_URL}/profiel/stille-tekorten`, lastModified: new Date() },
    { url: `${BASE_URL}/profiel/overtrainer`, lastModified: new Date() },
  ];
}
