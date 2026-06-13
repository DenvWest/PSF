import { domainNamesDutch, quickWinsByDomain } from "@/data/quick-wins";
import {
  SUMMARY_PILLAR_IDS,
  PILLAR_SCORE_KEYS,
} from "@/data/foundation-pyramid";
import { getDisplayStatus } from "@/lib/score-display";
import {
  escapeHtml,
  nurtureCtaButton,
  nurtureEmailWrap,
} from "@/lib/emails/shared";
import { buildNurtureUnsubscribeUrl } from "@/lib/nurture-unsubscribe";
import { absoluteUrl, getPublicSiteUrl } from "@/lib/public-site-url";
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

export function day0OpeningLineForDomain(
  domain: (typeof DOMAIN_IDS)[number],
  firstName?: string | null,
): string {
  const openings: Record<(typeof DOMAIN_IDS)[number], string> = {
    sleep:
      "Je hebt net ingevuld dat slaap je prioriteit is. Dat betekent waarschijnlijk dat je wakker wordt en al moe bent voordat de dag begint.",
    stress:
      "Je hebt net ingevuld dat stress je prioriteit is. Dat betekent waarschijnlijk dat de dag niet echt stopt als je thuis bent.",
    energy:
      "Je hebt net ingevuld dat energie je prioriteit is. Dat betekent waarschijnlijk dat je energie op is lang voordat de dag voorbij is.",
    recovery:
      "Je hebt net ingevuld dat herstel je prioriteit is. Dat betekent waarschijnlijk dat je lichaam meer vraagt dan je het geeft.",
    movement:
      "Je hebt net ingevuld dat beweging je prioriteit is. Dat betekent waarschijnlijk dat je weet dat je meer zou willen bewegen, maar dat de dag het opslokt.",
    nutrition:
      "Je hebt net ingevuld dat voeding je prioriteit is. Dat betekent waarschijnlijk dat het er vaak bij inschiet als de dag druk wordt.",
  };
  const line = openings[domain];
  const raw = typeof firstName === "string" ? firstName.replace(/\s+/g, " ").trim() : "";
  const cleaned = raw.replace(/[^a-zA-Zà-ïÀ-ÿĳĲ\s'-]/g, "").trim();
  if (cleaned) {
    const safe = cleaned.length > 60 ? cleaned.slice(0, 60) : cleaned;
    return `${safe}, ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
  }
  return line;
}

export function renderWeakSpotBlock(primaryDomain: string): string {
  const domainKey = `${normalizeDomainId(primaryDomain)}_score` as DomainKey;
  const { label, statusLine, action } = weakSpotCopyForDomain(domainKey);
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

const COUNT_WORDS: Record<number, string> = {
  1: "één",
  2: "twee",
  3: "drie",
  4: "vier",
};

export function day0AttentionLine(
  domainScores: Record<string, number>,
  primaryDomain: string,
): string {
  let count = 0;
  for (const pillarId of SUMMARY_PILLAR_IDS) {
    const scoreKey = PILLAR_SCORE_KEYS[pillarId] as string | undefined;
    if (!scoreKey) continue;
    const raw = domainScores[scoreKey];
    const score = typeof raw === "number" ? raw : NaN;
    const status = getDisplayStatus(score);
    if (status === "Aandacht" || status === "Prioriteit") {
      count++;
    }
  }

  if (count === 0) return "";

  const domainKey = `${normalizeDomainId(primaryDomain)}_score` as DomainKey;
  const label = weakSpotCopyForDomain(domainKey).label;

  if (count === 1) {
    return `Eén gebied vraagt nu je aandacht: ${label}.`;
  }

  const total = SUMMARY_PILLAR_IDS.length;
  const countWord = COUNT_WORDS[count] ?? String(count);
  const totalWord = COUNT_WORDS[total] ?? String(total);
  const capitalized = countWord.charAt(0).toUpperCase() + countWord.slice(1);
  return `${capitalized} van je ${totalWord} gebieden vragen nu aandacht — ${label} het meest.`;
}

export function day0FurtherAttentionLine(
  domainScores: Record<string, number>,
  primaryDomain: string,
): string {
  const primaryId = normalizeDomainId(primaryDomain);
  const extraLabels: string[] = [];

  for (const domainId of DOMAIN_IDS) {
    if (domainId === primaryId) continue;
    const scoreKey = `${domainId}_score`;
    const raw = domainScores[scoreKey];
    const score = typeof raw === "number" ? raw : NaN;
    const status = getDisplayStatus(score);
    if (status === "Aandacht" || status === "Prioriteit") {
      const domainKey = `${domainId}_score` as DomainKey;
      extraLabels.push(weakSpotCopyForDomain(domainKey).label.toLowerCase());
    }
    if (extraLabels.length >= 2) break;
  }

  if (extraLabels.length === 0) return "";

  const joined =
    extraLabels.length === 1
      ? extraLabels[0]
      : `${extraLabels[0]} en ${extraLabels[1]}`;
  const verb = extraLabels.length === 1 ? "vroeg" : "vroegen";

  return `Je ${joined} ${verb} ook aandacht — daar komen we in de volgende mails op terug.`;
}

export function renderDay0MainRows(params: {
  primaryDomain: string;
  intakeUrl: string;
  firstName?: string | null;
  domainScores: Record<string, number>;
}): string {
  const { primaryDomain, intakeUrl, firstName, domainScores } = params;
  const domain = normalizeDomainId(primaryDomain);
  const opening = day0OpeningLineForDomain(domain, firstName);
  const title = "Dit valt op in jouw resultaten";
  const attentionLine = day0AttentionLine(domainScores, primaryDomain);
  const furtherLine = day0FurtherAttentionLine(domainScores, primaryDomain);

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
            ${attentionLine ? `<p style="margin:0 0 10px 0;font-size:15px;line-height:1.6;color:#555555;">${escapeHtml(attentionLine)}</p>` : ""}
            ${furtherLine ? `<p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:#666666;">${escapeHtml(furtherLine)}</p>` : ""}
          </td>
        </tr>
        ${renderWeakSpotBlock(primaryDomain)}
        <tr>
          <td style="padding:8px 28px 28px 28px;">
            ${nurtureCtaButton(intakeUrl, "Bekijk je resultaten")}
            <p style="margin:12px 0 0 0;font-size:13px;line-height:1.6;color:#888888;text-align:center;">Dit is je startpunt. Over vier weken kijken we samen of het beweegt — geen oordeel, gewoon je eigen lijn.</p>
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
  NurtureProfileKey,
} from "@/data/nurture-content";

export type NurtureInterventionHighlight = {
  title: string;
  body: string;
  kindLabel: string;
  comparePath?: string | null;
};

function appendNurtureToken(path: string, token: string | null | undefined): string {
  if (!token) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}nt=${encodeURIComponent(token)}`;
}

function withNurtureToken(url: string, token: string | null | undefined): string {
  if (!token || !url.startsWith("/beste/")) return url;
  return appendNurtureToken(url, token);
}

export function renderInterventionHighlightHtml(
  highlight: NurtureInterventionHighlight,
  nurtureToken?: string | null,
): string {
  const rawPath = highlight.comparePath?.trim() ?? null;
  const trackedPath = rawPath ? withNurtureToken(rawPath, nurtureToken) : null;
  const compareHtml =
    trackedPath
      ? `<p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:#333333;"><a href="https://www.perfectsupplement.nl${escapeHtml(trackedPath)}" style="color:#2d4a3e;font-weight:600;text-decoration:underline;">Bekijk ${escapeHtml(highlight.title)} →</a></p>`
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
  nurtureToken?: string | null,
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

  const supplementTipUrl = supplementTip
    ? withNurtureToken(supplementTip.supplement.url, nurtureToken)
    : null;

  const supplementHtml = interventionHighlight
    ? renderInterventionHighlightHtml(interventionHighlight, nurtureToken)
    : supplementTip && supplementTipUrl
      ? `
    <div style="margin:18px 0;padding:14px 18px;border:1px solid #e0e0d8;border-radius:4px;background:#fafaf7;">
      <p style="margin:0 0 6px 0;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:.04em;font-weight:600;">Supplement-tip</p>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333333;">${escapeHtml(supplementTip.intro)}</p>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333333;"><strong>${escapeHtml(supplementTip.supplement.name)}</strong> — ${escapeHtml(supplementTip.supplement.reason)}</p>
      <a href="https://www.perfectsupplement.nl${escapeHtml(supplementTipUrl)}" style="font-size:14px;color:#2d4a3e;text-decoration:underline;">Vergelijk ${escapeHtml(supplementTip.supplement.name)} supplementen →</a>
    </div>`
      : "";

  const rawCtaBase =
    block.cta.url === "/intake" ? intakeUrl : block.cta.url;
  const rawCtaTarget = withNurtureToken(rawCtaBase, nurtureToken);
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
