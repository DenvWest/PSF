import { getArtikelBySlug } from "@/data/blog";
import { domainNamesDutch, quickWinsByDomain } from "@/data/quick-wins";
import {
  escapeHtml,
  nurtureCtaButton,
  nurtureEmailWrap,
} from "@/lib/emails/shared";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { absoluteUrl, getPublicSiteUrl } from "@/lib/public-site-url";
import { signIntakeSessionId } from "@/lib/intake-session-cookie";

const DOMAIN_IDS = [
  "sleep",
  "energy",
  "stress",
  "nutrition",
  "movement",
  "recovery",
] as const;

export function normalizeDomainId(raw: string): (typeof DOMAIN_IDS)[number] {
  const k = raw.trim().toLowerCase();
  if ((DOMAIN_IDS as readonly string[]).includes(k)) {
    return k as (typeof DOMAIN_IDS)[number];
  }
  return "sleep";
}

export function domainLabelNl(domain: string): string {
  const id = normalizeDomainId(domain);
  return domainNamesDutch[id] ?? id;
}

export function quickWinsForDomain(domain: string): string[] {
  const id = normalizeDomainId(domain);
  return quickWinsByDomain[id] ?? quickWinsByDomain.sleep;
}

/** Eerste voorkeur-slug per domein; wordt gecontroleerd met getArtikelBySlug. */
const BLOG_SLUG_BY_DOMAIN: Record<string, string> = {
  sleep: "magnesium-en-slaapkwaliteit",
  stress: "ademhaling-tegen-stress",
  energy: "energie-verhogen-natuurlijk",
  nutrition: "wat-is-omega-3",
  movement: "testosteron-en-energie-na-40",
  recovery: "cortisol-verlagen-natuurlijk",
};

export function resolveBlogForDomain(domain: string): {
  url: string;
  title: string;
  found: boolean;
} {
  const id = normalizeDomainId(domain);
  const preferred = BLOG_SLUG_BY_DOMAIN[id] ?? BLOG_SLUG_BY_DOMAIN.sleep;
  const artikel = getArtikelBySlug(preferred);
  if (artikel) {
    return {
      url: absoluteUrl(blogArtikelPad(artikel)),
      title: artikel.titel,
      found: true,
    };
  }
  return {
    url: absoluteUrl("/blog"),
    title: "",
    found: false,
  };
}

function genericDomainParagraph(domain: string): string {
  const label = domainLabelNl(domain);
  return `Thema ${escapeHtml(label)} draait om kleine, herhaalbare keuzes die je lichaam tijd geven om zich aan te passen — zonder perfectie-eisen.`;
}

export function day7BodyCopy(domain: string): { htmlBlock: string } {
  const { url, title, found } = resolveBlogForDomain(domain);
  const domeinNaam = domainLabelNl(domain);
  if (found && title) {
    return {
      htmlBlock: `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
        Voor veel mannen vanaf 40 speelt ${escapeHtml(domeinNaam)} een grotere rol dan ze dagelijks merken.
        In <a href="${escapeHtml(url)}" style="color:#1a1a1a;">${escapeHtml(title)}</a> lees je er meer over — inhoudelijk en zonder harde beloftes.
      </p>`,
    };
  }
  return {
    htmlBlock: `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
      ${genericDomainParagraph(domain)}
      Meer lezen over dit onderwerp? Start op <a href="${escapeHtml(absoluteUrl("/blog"))}" style="color:#1a1a1a;">het blog</a>.
    </p>`,
  };
}

export function buildIntakeHerstelplanUrl(sessionId: string | null | undefined): string {
  const site = getPublicSiteUrl();
  const signed = sessionId ? signIntakeSessionId(sessionId) : null;
  if (signed) {
    const qs = new URLSearchParams({ sid: signed });
    return `${site}/api/intake/recover?${qs.toString()}`;
  }
  return `${site}/intake`;
}

export function buildUnsubscribeUrl(email: string): string {
  const site = getPublicSiteUrl();
  const unsubQs = new URLSearchParams({ email: email.trim().toLowerCase() });
  return `${site}/api/unsubscribe?${unsubQs.toString()}`;
}

export function wrapNurtureBlock(
  innerRows: string,
  recipientEmail: string,
  affiliateDisclaimer = false,
): string {
  return nurtureEmailWrap(
    innerRows,
    buildUnsubscribeUrl(recipientEmail),
    affiliateDisclaimer,
  );
}

export function nutritionScoreLow(scores: Record<string, number>): boolean {
  const n =
    typeof scores.nutrition_score === "number"
      ? scores.nutrition_score
      : typeof scores.nutrition === "number"
        ? scores.nutrition
        : null;
  return n !== null && Number.isFinite(n) && n <= 40;
}

export function day21SupplementChoice(params: {
  primaryDomain: string;
  domainScores: Record<string, number>;
}): { name: string; comparePath: string; reason: string } {
  const id = normalizeDomainId(params.primaryDomain);
  if (id === "sleep" || id === "stress") {
    return {
      name: "Magnesium",
      comparePath: "/magnesium-vergelijken",
      reason:
        "Bij veel mannen 40+ wordt magnesium genoemd in de context van ontspanning en slaapritme — geen wonderpil, maar een veelbesproken optie om te vergelijken.",
    };
  }
  if (id === "nutrition" || nutritionScoreLow(params.domainScores)) {
    return {
      name: "Omega-3 (EPA/DHA)",
      comparePath: "/omega-3-vergelijken",
      reason:
        "Als voeding of vetzuur-balans aandacht vraagt, is omega-3 vaak het eerste thema om inhoudelijk te vergelijken (EPA/DHA, vorm, zuiverheid).",
    };
  }
  return {
    name: "Magnesium",
    comparePath: "/magnesium-vergelijken",
    reason:
      "Op basis van je profiel past vergelijken op magnesium vaak het beste als startpunt — inhoudelijk, op eigen tempo.",
  };
}

export { escapeHtml, nurtureCtaButton };
