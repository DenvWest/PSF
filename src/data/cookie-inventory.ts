export type CookieCategory = "necessary" | "preferences" | "statistics" | "marketing";

export type CookieEntry = {
  name: string;
  provider: string;
  purpose: string;
  expiry: string;
  category: CookieCategory;
};

export type CookieProviderGroup = {
  provider: string;
  infoUrl?: string;
  cookies: CookieEntry[];
};

export const COOKIE_CATEGORY_LABELS: Record<CookieCategory, string> = {
  necessary: "Noodzakelijk",
  preferences: "Voorkeuren",
  statistics: "Statistieken",
  marketing: "Marketing",
};

export const COOKIE_CATEGORY_DESCRIPTIONS: Record<CookieCategory, string> = {
  necessary:
    "Noodzakelijke cookies helpen een website bruikbaarder te maken, door basisfuncties als paginanavigatie, sessiebeheer en toegang tot beveiligde gedeelten van de website mogelijk te maken. Zonder deze cookies kan de website niet naar behoren werken.",
  preferences:
    "Voorkeurscookies zorgen ervoor dat een website informatie kan onthouden die van invloed is op het gedrag en de vormgeving van de website, zoals je cookievoorkeuren.",
  statistics:
    "Statistische cookies helpen website-eigenaren begrijpen hoe bezoekers hun website gebruiken, door anoniem gegevens te verzamelen en te rapporteren. We plaatsen ze pas na toestemming.",
  marketing:
    "Deze cookies registreren verwijzingen via affiliate links. Ze worden pas geplaatst wanneer je op een partnerlink klikt — er is geen pre-tracking.",
};

const PROVIDER_INFO_URLS: Record<string, string> = {
  PerfectSupplement: "https://perfectsupplement.nl/privacy",
  "Google Analytics": "https://policies.google.com/privacy",
  "Microsoft Clarity": "https://privacy.microsoft.com/",
  Cloudflare: "https://www.cloudflare.com/privacypolicy/",
  "Daisycon / partnerwinkels": "https://www.daisycon.com/nl/privacy/",
};

export const COOKIE_INVENTORY: CookieEntry[] = [
  {
    name: "psf_intake_sid",
    provider: "PerfectSupplement",
    purpose: "Functionele sessie voor de leefstijlcheck",
    expiry: "90 dagen",
    category: "necessary",
  },
  {
    name: "psf_account",
    provider: "PerfectSupplement",
    purpose: "Ingelogde account-sessie",
    expiry: "90 dagen",
    category: "necessary",
  },
  {
    name: "psf_sleep_focus",
    provider: "PerfectSupplement",
    purpose: "Onthoudt je gekozen slaapfocus na de gids-analyse (door login heen)",
    expiry: "30 dagen",
    category: "necessary",
  },
  {
    name: "psf_analytics_consent",
    provider: "PerfectSupplement",
    purpose: "Server-side verificatie van je analytische cookiekeuze (httpOnly)",
    expiry: "90 dagen",
    category: "necessary",
  },
  {
    name: "cf-turnstile / __cf_bm",
    provider: "Cloudflare",
    purpose: "Bescherming tegen misbruik (Turnstile) — geen advertentietracking",
    expiry: "Sessie tot 30 minuten",
    category: "necessary",
  },
  {
    name: "psf_analytics_state",
    provider: "PerfectSupplement",
    purpose: "Onthoudt je cookiekeuze voor analytische cookies",
    expiry: "90 dagen",
    category: "preferences",
  },
  {
    name: "psf_analytics_consent_meta",
    provider: "PerfectSupplement",
    purpose: "Consent-ID en datum voor auditdoeleinden",
    expiry: "90 dagen",
    category: "preferences",
  },
  {
    name: "_ga / _ga_*",
    provider: "Google Analytics",
    purpose: "Anonieme statistieken over websitegebruik",
    expiry: "14 maanden",
    category: "statistics",
  },
  {
    name: "_clck",
    provider: "Microsoft Clarity",
    purpose: "Unieke gebruikers-ID voor sessie-analyse",
    expiry: "1 jaar",
    category: "statistics",
  },
  {
    name: "_clsk",
    provider: "Microsoft Clarity",
    purpose: "Sessie-ID voor paginaweergaven",
    expiry: "1 dag",
    category: "statistics",
  },
  {
    name: "Affiliate tracking cookies",
    provider: "Daisycon / partnerwinkels",
    purpose: "Registratie van een aankoop via affiliate link (alleen na klik)",
    expiry: "Varieert per partner",
    category: "marketing",
  },
];

export function cookiesByCategory(category: CookieCategory): CookieEntry[] {
  return COOKIE_INVENTORY.filter((entry) => entry.category === category);
}

export function cookieCountByCategory(category: CookieCategory): number {
  return cookiesByCategory(category).length;
}

export function providersByCategory(category: CookieCategory): CookieProviderGroup[] {
  const groups = new Map<string, CookieEntry[]>();

  for (const entry of cookiesByCategory(category)) {
    const existing = groups.get(entry.provider) ?? [];
    existing.push(entry);
    groups.set(entry.provider, existing);
  }

  return Array.from(groups.entries()).map(([provider, cookies]) => ({
    provider,
    infoUrl: PROVIDER_INFO_URLS[provider],
    cookies,
  }));
}

export function categoryToggleState(
  category: CookieCategory,
  preferences: { statistics: boolean; marketing: boolean },
): { checked: boolean; locked: boolean; editable: boolean } {
  if (category === "statistics") {
    return {
      checked: preferences.statistics,
      locked: false,
      editable: true,
    };
  }
  if (category === "marketing") {
    return {
      checked: preferences.marketing,
      locked: false,
      editable: true,
    };
  }
  return { checked: true, locked: true, editable: false };
}
