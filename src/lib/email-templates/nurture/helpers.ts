import { getArtikelBySlug } from "@/data/blog";
import { domainNamesDutch, quickWinsByDomain } from "@/data/quick-wins";
import {
  escapeHtml,
  nurtureCtaButton,
  nurtureEmailWrap,
} from "@/lib/emails/shared";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { buildNurtureUnsubscribeUrl } from "@/lib/nurture-unsubscribe";
import { absoluteUrl, getPublicSiteUrl } from "@/lib/public-site-url";
import { signIntakeSessionId } from "@/lib/intake-session-cookie";
import type { NurtureEmailDispatchContext } from "./types";

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

export function wrapNurtureBlock(
  innerRows: string,
  ctx: Pick<NurtureEmailDispatchContext, "recipientEmail" | "sessionId">,
  affiliateDisclaimer = false,
): string {
  const unsubscribeUrl = buildNurtureUnsubscribeUrl(
    ctx.recipientEmail,
    ctx.sessionId,
    getPublicSiteUrl(),
  );
  return nurtureEmailWrap(innerRows, unsubscribeUrl, affiliateDisclaimer);
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

// ============================================================
// Gepersonaliseerde HTML-blokken voor profielgestuurde mails
// ============================================================

import type { NurtureBlock, DomainSupplementTip } from "@/data/nurture-content";

export function renderPersonalizedRows(
  block: NurtureBlock,
  supplementTip: DomainSupplementTip | null,
  intakeUrl: string,
): string {
  const bodyHtml = block.bodyParagraphs
    .map(
      (p) =>
        `<p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">${escapeHtml(p)}</p>`,
    )
    .join("\n");

  const tipHtml = `
    <div style="background:#f5f5f0;border-left:3px solid #2d4a3e;padding:14px 18px;margin:18px 0;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;">${escapeHtml(block.tip)}</p>
    </div>`;

  const supplementHtml = supplementTip
    ? `
    <div style="margin:18px 0;padding:14px 18px;border:1px solid #e0e0d8;border-radius:4px;background:#fafaf7;">
      <p style="margin:0 0 6px 0;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">Supplement-tip</p>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333333;">${escapeHtml(supplementTip.intro)}</p>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333333;"><strong>${escapeHtml(supplementTip.supplement.name)}</strong> — ${escapeHtml(supplementTip.supplement.reason)}</p>
      <a href="https://www.perfectsupplement.nl${escapeHtml(supplementTip.supplement.url)}" style="font-size:14px;color:#2d4a3e;text-decoration:underline;">Vergelijk ${escapeHtml(supplementTip.supplement.name)} supplementen →</a>
    </div>`
    : "";

  const ctaUrl = block.cta.url.startsWith("http")
    ? block.cta.url
    : `https://www.perfectsupplement.nl${block.cta.url}`;

  return `
        <tr>
          <td style="padding:8px 28px 16px 28px;">
            <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:22px;line-height:1.25;color:#1a1a1a;font-weight:400;">
              ${escapeHtml(block.subject)}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 10px 28px;">
            <p style="margin:0 0 4px 0;font-size:16px;line-height:1.6;color:#333333;">${escapeHtml(block.greeting)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 28px 28px;">
            ${bodyHtml}
            ${tipHtml}
            ${supplementHtml}
            ${nurtureCtaButton(ctaUrl, block.cta.text)}
          </td>
        </tr>`;
}
