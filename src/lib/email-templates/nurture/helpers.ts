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
import {
  buildLifestyleOverviewRows,
  EMAIL_STATUS_PILL_STYLE,
} from "@/lib/lifestyle-overview-display";
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
  stress: "cortisol-en-testosteron",
  energy: "vitamine-d-en-energie",
  nutrition: "omega-3-en-herstel",
  movement: "testosteron-en-energie-na-40",
  recovery: "creatine-en-herstel",
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

export function resolveIntakeRecoveryUrl(
  ctx: Pick<NurtureEmailDispatchContext, "recoveryUrl">,
): string {
  if (typeof ctx.recoveryUrl === "string" && ctx.recoveryUrl.trim()) {
    return ctx.recoveryUrl.trim();
  }
  return `${getPublicSiteUrl()}/intake`;
}

/** @deprecated Gebruik recoveryUrl in dispatch context (createRecoveryToken). */
export function buildIntakeHerstelplanUrl(_sessionId: string | null | undefined): string {
  return `${getPublicSiteUrl()}/intake`;
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
      comparePath: "/beste/magnesium",
      reason:
        "Bij veel mannen 40+ wordt magnesium genoemd in de context van ontspanning en slaapritme — geen wonderpil, maar een veelbesproken optie om te vergelijken.",
    };
  }
  if (id === "nutrition" || nutritionScoreLow(params.domainScores)) {
    return {
      name: "Omega-3 (EPA/DHA)",
      comparePath: "/beste/omega-3-supplement",
      reason:
        "Als voeding of vetzuur-balans aandacht vraagt, is omega-3 vaak het eerste thema om inhoudelijk te vergelijken (EPA/DHA, vorm, zuiverheid).",
    };
  }
  return {
    name: "Magnesium",
    comparePath: "/beste/magnesium",
    reason:
      "Op basis van je profiel past vergelijken op magnesium vaak het beste als startpunt — inhoudelijk, op eigen tempo.",
  };
}

export { escapeHtml, nurtureCtaButton };

export function nurtureNamePrefixHtml(firstName?: string | null): string {
  const raw = typeof firstName === "string" ? firstName.replace(/\s+/g, " ").trim() : "";
  if (!raw) {
    return "";
  }
  const cleaned = raw.replace(/[^a-zA-Zà-ïÀ-ÿĳĲ\s'-]/g, "").trim();
  if (!cleaned) {
    return "";
  }
  const safe = cleaned.length > 60 ? cleaned.slice(0, 60) : cleaned;
  return `<p style="margin:0 0 4px 0;font-size:16px;line-height:1.6;color:#333333;">Hoi ${escapeHtml(safe)},</p>`;
}

function lifestyleOverviewIntroHtml(firstName?: string | null): string {
  const raw = typeof firstName === "string" ? firstName.replace(/\s+/g, " ").trim() : "";
  const cleaned = raw.replace(/[^a-zA-Zà-ïÀ-ÿĳĲ\s'-]/g, "").trim();
  const safe = cleaned.length > 60 ? cleaned.slice(0, 60) : cleaned;
  if (safe) {
    return `<p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#404040;">${escapeHtml(safe)}, dit is wat we zien in je leefstijlgebieden:</p>`;
  }
  return `<p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#404040;">Dit is wat we zien in je leefstijlgebieden:</p>`;
}

export type Day0ProfileVoice = ProfileLabelName | "Overtrainer";

const PROFILE_URLS: Partial<Record<NurtureProfileKey, string>> = {
  "Onrustige Slaper": "/profiel/onrustige-slaper",
  Stressdrager: "/profiel/stressdrager",
  "Lage Batterij": "/profiel/lage-batterij",
  Overtrainer: "/profiel/overtrainer",
};

export function profileUrlForLabel(label: NurtureProfileKey): string | null {
  return PROFILE_URLS[label] ?? null;
}

export function renderProfileAnchorFooter(
  profileKey: NurtureProfileKey,
  recoveryUrl: string,
): string {
  const profilePath = profileUrlForLabel(profileKey);
  if (!profilePath) {
    return `
        <tr>
          <td style="padding:0 28px 24px 28px;border-top:1px solid #E7E5E4;">
            <p style="margin:16px 0 0 0;font-size:14px;line-height:1.6;color:#555555;">
              <a href="${escapeHtml(recoveryUrl)}" style="color:#2d4a3e;font-weight:600;text-decoration:underline;">
                Herlees je leefstijl-overzicht →
              </a>
            </p>
          </td>
        </tr>`;
  }
  const profileUrl = absoluteUrl(profilePath);
  return `
        <tr>
          <td style="padding:0 28px 24px 28px;border-top:1px solid #E7E5E4;">
            <p style="margin:16px 0 0 0;font-size:14px;line-height:1.6;color:#555555;">
              <a href="${escapeHtml(profileUrl)}" style="color:#2d4a3e;font-weight:600;text-decoration:underline;">
                Herlees je profiel →
              </a>
            </p>
          </td>
        </tr>`;
}

export function weakSpotCopyForDomain(domain: DomainKey): {
  label: string;
  statusLine: string;
  action: string;
} {
  const map: Record<
    DomainKey,
    { label: string; statusLine: string; action: string }
  > = {
    stress_score: {
      label: "Stress",
      statusLine: "Stress vraagt nu je aandacht",
      action: "5 min ademhaling vóór je telefoon pakt",
    },
    sleep_score: {
      label: "Slaap",
      statusLine: "Slaap is je duidelijkste signaal",
      action: "Vaste bedtijd, 3 nachten aanhouden",
    },
    energy_score: {
      label: "Energie",
      statusLine: "Energie staat onder druk",
      action: "Eiwitrijk eerste moment na opstaan",
    },
    recovery_score: {
      label: "Herstel",
      statusLine: "Herstel loopt achter",
      action: "Plan 2 lichte dagen deze week",
    },
    movement_score: {
      label: "Beweging",
      statusLine: "Beweging heeft ruimte",
      action: "10 min daglicht vóór 10:00",
    },
    nutrition_score: {
      label: "Voeding",
      statusLine: "Voeding is je zwakste pijler",
      action: "2× deze week vette vis of eiwitrijke lunch",
    },
  };
  return map[domain];
}

export function day0OpeningLineForProfile(
  profile: Day0ProfileVoice,
  firstName?: string | null,
): string {
  const openings: Record<Day0ProfileVoice, string> = {
    Stressdrager:
      "Je zenuwstelsel staat langer aan dan je zelf merkt. Vandaag: 5 minuten ademhaling vóór je telefoon pakt — dat is het enige.",
    "Onrustige Slaper":
      "Je slaap was het duidelijkste signaal. Vandaag: kies een vaste bedtijd en houd hem drie nachten aan.",
    "Lage Batterij":
      "Energie begint bij eiwit bij je eerste maaltijd. Niet de derde kop koffie.",
    Overtrainer:
      "Meer trainen is niet de oplossing — je lichaam heeft twee lichte dagen nodig. Plan ze nu.",
    "In Balans":
      "Je basis staat goed. Vandaag: kies één domein om te verfijnen en doe daar één concrete stap.",
  };
  const line = openings[profile] ?? openings["In Balans"];
  const raw = typeof firstName === "string" ? firstName.replace(/\s+/g, " ").trim() : "";
  const cleaned = raw.replace(/[^a-zA-Zà-ïÀ-ÿĳĲ\s'-]/g, "").trim();
  if (cleaned) {
    const safe = cleaned.length > 60 ? cleaned.slice(0, 60) : cleaned;
    return `${safe}, ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
  }
  return line;
}

export function resolveDay0PrimaryCta(profile: Day0ProfileVoice): {
  text: string;
  url: string;
} {
  const profilePath = profileUrlForLabel(profile);
  if (profilePath) {
    return { text: "Bekijk je profiel", url: profilePath };
  }
  if (profile === "In Balans") {
    return { text: "Bekijk je leefstijl-overzicht", url: "/intake" };
  }
  return { text: "Doe je eerste stap vandaag", url: "/intake" };
}

export function renderWeakSpotBlock(
  domainScores: Record<string, number>,
  firstName?: string | null,
): string {
  const weakest = getWeakestDomain(domainScores);
  const { label, statusLine, action } = weakSpotCopyForDomain(weakest);
  void firstName;
  return `
        <tr>
          <td style="padding:20px 28px 8px 28px;border-top:1px solid #E7E5E4;">
            <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#666666;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(label)} — ${escapeHtml(statusLine)}</p>
            <div style="background:#f5f5f0;border-left:3px solid #2d4a3e;padding:14px 18px;margin:0;border-radius:0 4px 4px 0;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;"><strong>Vandaag:</strong> ${escapeHtml(action)}</p>
            </div>
          </td>
        </tr>`;
}

export function renderDay0MainRows(params: {
  profile: Day0ProfileVoice;
  domainScores: Record<string, number>;
  intakeUrl: string;
  firstName?: string | null;
  headline?: string;
}): string {
  const { profile, domainScores, intakeUrl, firstName, headline } = params;
  const opening = day0OpeningLineForProfile(profile, firstName);
  const cta = resolveDay0PrimaryCta(profile);
  const ctaUrl = cta.url === "/intake" ? intakeUrl : absoluteUrl(cta.url);
  const title =
    headline ??
    (profile === "Stressdrager"
      ? "Dit valt op in jouw resultaten"
      : profile === "Overtrainer"
        ? "Je recovery vraagt nu je aandacht"
        : "Je eerste stap na de Leefstijlcheck");

  const prefix = nurtureNamePrefixHtml(firstName);
  const nameAlreadyInOpening =
    typeof firstName === "string" && firstName.trim().length > 0;

  return `
        <tr>
          <td style="padding:8px 28px 16px 28px;">
            <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:22px;line-height:1.25;color:#1a1a1a;font-weight:400;">
              ${escapeHtml(title)}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 10px 28px;">
            ${nameAlreadyInOpening ? "" : prefix}
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">${escapeHtml(opening)}</p>
          </td>
        </tr>
        ${renderWeakSpotBlock(domainScores, firstName)}
        <tr>
          <td style="padding:8px 28px 28px 28px;">
            ${nurtureCtaButton(ctaUrl, cta.text)}
          </td>
        </tr>`;
}

export function renderLifestyleOverviewBlock(
  domainScores: Record<string, number>,
  firstName?: string | null,
): string {
  const rows = buildLifestyleOverviewRows(domainScores);
  const rowHtml = rows
    .map((row) => {
      const pill = EMAIL_STATUS_PILL_STYLE[row.status];
      return `<tr>
                <td style="padding:10px 14px;font-size:14px;color:#333333;border-bottom:1px solid #e7e5e4;">${escapeHtml(row.label)}</td>
                <td style="padding:10px 14px;text-align:right;border-bottom:1px solid #e7e5e4;">
                  <span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;background-color:${pill.background};color:${pill.color};border:1px solid ${pill.border};">${escapeHtml(row.status)}</span>
                </td>
              </tr>`;
    })
    .join("\n");

  return `
        <tr>
          <td style="padding:20px 28px 8px 28px;border-top:1px solid #E7E5E4;">
            <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#666666;text-transform:uppercase;letter-spacing:0.05em;">Jouw leefstijlgebieden</p>
            ${lifestyleOverviewIntroHtml(firstName)}
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 12px 0;border:1px solid #e7e5e4;border-radius:8px;border-collapse:separate;">
              ${rowHtml}
            </table>
            <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#555555;">Leefstijl is het fundament — supplementen vullen aan waar dit niet rond komt.</p>
          </td>
        </tr>`;
}

// ============================================================
// Gepersonaliseerde HTML-blokken voor profielgestuurde mails
// ============================================================

import type {
  DomainKey,
  NurtureBlock,
  DomainSupplementTip,
  ProfileLabelName,
  NurtureProfileKey,
} from "@/data/nurture-content";
import { getWeakestDomain } from "@/data/nurture-content";

export type NurtureInterventionHighlight = {
  title: string;
  body: string;
  kindLabel: string;
  comparePath?: string | null;
};

export function renderInterventionHighlightHtml(
  highlight: NurtureInterventionHighlight,
): string {
  const compareHtml =
    highlight.comparePath && highlight.comparePath.trim()
      ? `<p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:#333333;"><a href="https://www.perfectsupplement.nl${escapeHtml(highlight.comparePath.trim())}" style="color:#2d4a3e;font-weight:600;text-decoration:underline;">Bekijk ${escapeHtml(highlight.title)} →</a></p>`
      : "";
  return `
    <div style="margin:18px 0;padding:14px 18px;border:1px solid #e0e0d8;border-radius:4px;background:#fafaf7;">
      <p style="margin:0 0 6px 0;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">${escapeHtml(highlight.kindLabel)}</p>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333333;"><strong>${escapeHtml(highlight.title)}</strong></p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#333333;">${escapeHtml(highlight.body)}</p>
      ${compareHtml}
    </div>`;
}

export function renderPersonalizedRows(
  block: NurtureBlock,
  supplementTip: DomainSupplementTip | null,
  intakeUrl: string,
  firstName?: string | null,
  interventionHighlight?: NurtureInterventionHighlight | null,
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

  const supplementHtml = interventionHighlight
    ? renderInterventionHighlightHtml(interventionHighlight)
    : supplementTip
      ? `
    <div style="margin:18px 0;padding:14px 18px;border:1px solid #e0e0d8;border-radius:4px;background:#fafaf7;">
      <p style="margin:0 0 6px 0;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">Supplement-tip</p>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333333;">${escapeHtml(supplementTip.intro)}</p>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333333;"><strong>${escapeHtml(supplementTip.supplement.name)}</strong> — ${escapeHtml(supplementTip.supplement.reason)}</p>
      <a href="https://www.perfectsupplement.nl${escapeHtml(supplementTip.supplement.url)}" style="font-size:14px;color:#2d4a3e;text-decoration:underline;">Vergelijk ${escapeHtml(supplementTip.supplement.name)} supplementen →</a>
    </div>`
      : "";

  const rawCtaTarget =
    block.cta.url === "/intake" ? intakeUrl : block.cta.url;
  const ctaUrl = rawCtaTarget.startsWith("http")
    ? rawCtaTarget
    : `https://www.perfectsupplement.nl${rawCtaTarget}`;

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
            ${nurtureNamePrefixHtml(firstName)}
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
