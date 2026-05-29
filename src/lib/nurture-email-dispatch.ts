import { getArtikelBySlug } from "@/data/blog";
import { affiliateLinks } from "@/data/affiliate-links";
import {
  QUESTIONS,
  SYMPTOMS,
  type QuestionId,
  type SymptomId,
} from "@/data/intake-questions";
import {
  day14EmailHtml,
  day14EmailSubject,
  day14SupplementListItem,
} from "@/lib/emails/day14";
import { day21EmailHtml, day21EmailSubject } from "@/lib/emails/day21";
import { day3EmailHtml, day3EmailSubject } from "@/lib/emails/day3";
import { day30EmailHtml, day30EmailSubject } from "@/lib/emails/day30";
import { day7EmailHtml, day7EmailSubject } from "@/lib/emails/day7";
import { welcomeEmailHtml, welcomeEmailSubject } from "@/lib/emails/welcome";
import { escapeHtml } from "@/lib/emails/shared";
import type { InterventionBuckets } from "@/lib/content/match-interventions";
import {
  interventionForNurtureDay,
  nurtureInterventionHighlight,
} from "@/lib/content/nurture-interventions";
import {
  getAdvice,
  getAdvicePrimaryDomain,
  getDeficiencySignals,
  type DomainId,
  type DomainScores,
} from "@/lib/intake-engine";
import { normalizeReminderType } from "@/lib/intake-nurture-reminders";
import { buildIntakeFallbackUrl } from "@/lib/recovery-token";
import { absoluteUrl, getPublicSiteUrl } from "@/lib/public-site-url";

const DOMAIN_KEYS: readonly (keyof DomainScores)[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
] as const;

function isDomainScores(value: unknown): value is DomainScores {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return DOMAIN_KEYS.every(
    (k) => typeof o[k] === "number" && Number.isFinite(o[k] as number),
  );
}

const SYMPTOM_SET = new Set<SymptomId>(SYMPTOMS.map((s) => s.id));

const QUESTION_VALID_VALUES: Record<QuestionId, Set<number>> = {} as Record<
  QuestionId,
  Set<number>
>;

for (const q of QUESTIONS) {
  QUESTION_VALID_VALUES[q.id] = new Set(q.options.map((o) => o.value));
}

function parseAnswers(raw: unknown): Record<QuestionId, number> | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const out: Record<QuestionId, number> = {} as Record<QuestionId, number>;
  for (const q of QUESTIONS) {
    const v = o[q.id];
    if (typeof v !== "number" || !Number.isFinite(v)) {
      if (q.id === "NUT_PROT") {
        out[q.id] = 3;
        continue;
      }
      return null;
    }
    if (!QUESTION_VALID_VALUES[q.id]?.has(v)) {
      return null;
    }
    out[q.id] = v;
  }
  return out;
}

function parseSymptoms(raw: unknown): SymptomId[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const out: SymptomId[] = [];
  const seen = new Set<SymptomId>();
  for (const item of raw) {
    if (typeof item !== "string" || !SYMPTOM_SET.has(item as SymptomId)) {
      return null;
    }
    const s = item as SymptomId;
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  if (out.length === 0) {
    return null;
  }
  return out;
}

const DOMAIN_LABEL_NL: Record<DomainId, string> = {
  sleep: "slaap",
  energy: "energie en ritme",
  stress: "stress en ontspanning",
  nutrition: "voeding",
  movement: "beweging",
  recovery: "herstel",
};

const DOMAIN_TIP_NL: Record<DomainId, string> = {
  sleep:
    "Houd je opstaan- en bedtijd vandaag binnen een venster van ±30 minuten — ritme helpt vaak meer dan losse losse ‘slaaptips’.",
  energy:
    "Plan vandaag één korte wandeling vóór de middag; lichte beweging kan je energie-rimpelingen zachter maken.",
  stress:
    "Zet twee korte pauzes van 3 minuten in je agenda en gebruik ze bewust zonder scherm — kleine ademruimte telt mee.",
  nutrition:
    "Kies bij één maaltijd extra eiwit en vezels (bijv. peulvrucht, kwark, noten) — dat ondersteunt stabielere energie zonder ingewikkelde regels.",
  movement:
    "Voeg na inspanning een rustmoment toe (wandelen, stretchen): herstel is onderdeel van vooruitgang.",
  recovery:
    "Noteer kort wat je vandaag energie gaf en kostte — zonder oordeel. Inzicht maakt herstel makkelijker te sturen.",
};

const DOMAIN_ARTICLE_SLUG: Record<DomainId, string> = {
  sleep: "magnesium-en-slaapkwaliteit",
  energy: "energie-verhogen-natuurlijk",
  stress: "ashwagandha-werking-mannen",
  nutrition: "wat-is-omega-3",
  movement: "testosteron-en-energie-na-40",
  recovery: "cortisol-verlagen-natuurlijk",
};

type IntakeSessionsJoin = {
  profile_label: string | null;
  domain_scores: unknown;
  urgency_level: string | null;
  answers: unknown;
  symptom_profile: unknown;
};

export type ReminderRowWithSession = {
  id: string;
  email: string;
  reminder_type: string;
  session_id?: string | null;
  intake_sessions: IntakeSessionsJoin | IntakeSessionsJoin[] | null;
};

function normalizeSessionJoin(
  raw: IntakeSessionsJoin | IntakeSessionsJoin[] | null,
): IntakeSessionsJoin | null {
  if (raw === null) {
    return null;
  }
  if (Array.isArray(raw)) {
    return raw[0] ?? null;
  }
  return raw;
}

const FALLBACK_PROFILE = "jouw intakeprofiel";
const FALLBACK_URGENCY = "niet ingevuld";
const FALLBACK_QUICK = "kleine, vaste stappen volhouden";

function buildOmegaPartnerUrl(): string | null {
  const u = affiliateLinks["arctic-blue-visolie"]?.trim();
  return u && u.startsWith("http") ? u : null;
}

export function buildNurtureEmail(
  row: ReminderRowWithSession,
  recoveryUrl?: string,
  interventionBuckets?: InterventionBuckets | null,
): { subject: string; html: string } | null {
  const email = row.email?.trim().toLowerCase();
  if (!email) {
    return null;
  }

  const site = getPublicSiteUrl();
  const intakeUrl = `${site}/intake`;
  const herstelplanUrl =
    typeof recoveryUrl === "string" && recoveryUrl.trim()
      ? recoveryUrl.trim()
      : buildIntakeFallbackUrl();
  const unsubQs = new URLSearchParams({ email });
  const unsubscribeUrl = `${site}/api/unsubscribe?${unsubQs.toString()}`;

  const kind = normalizeReminderType(row.reminder_type);

  const session = normalizeSessionJoin(row.intake_sessions);
  const scores =
    session?.domain_scores && isDomainScores(session.domain_scores)
      ? session.domain_scores
      : null;
  const answers = parseAnswers(session?.answers ?? null);
  const symptoms = parseSymptoms(session?.symptom_profile ?? null);
  const profileLabel =
    typeof session?.profile_label === "string" && session.profile_label.trim()
      ? session.profile_label.trim()
      : FALLBACK_PROFILE;
  const urgencyLabel =
    typeof session?.urgency_level === "string" && session.urgency_level.trim()
      ? session.urgency_level.trim()
      : FALLBACK_URGENCY;

  const advice =
    scores && answers && symptoms
      ? getAdvice(scores, answers, symptoms)
      : null;

  const primaryDomain: DomainId = scores
    ? getAdvicePrimaryDomain(scores)
    : "sleep";
  const day3Intervention =
    interventionBuckets && kind === "day3"
      ? interventionForNurtureDay(interventionBuckets, 3)
      : null;
  const day14Intervention =
    interventionBuckets && kind === "day14"
      ? interventionForNurtureDay(interventionBuckets, 14)
      : null;
  const day21Intervention =
    interventionBuckets && kind === "day21"
      ? interventionForNurtureDay(interventionBuckets, 21)
      : null;

  const quickWin =
    day21Intervention?.goalPhrase?.trim() ||
    day21Intervention?.description.trim() ||
    day3Intervention?.goalPhrase?.trim() ||
    day3Intervention?.description.trim() ||
    advice?.quickWins[0] ||
    FALLBACK_QUICK;

  const primaryDomainLabel = DOMAIN_LABEL_NL[primaryDomain];
  const domainTip =
    day3Intervention?.goalPhrase?.trim() ||
    day3Intervention?.description.trim() ||
    DOMAIN_TIP_NL[primaryDomain];

  const articleSlug = DOMAIN_ARTICLE_SLUG[primaryDomain];
  const article = getArtikelBySlug(articleSlug);
  const articlePath = `/blog/${articleSlug}`;
  const articleUrl = absoluteUrl(articlePath);
  const articleTitle = article?.titel ?? "Aanbevolen artikel";

  switch (kind) {
    case "welcome": {
      return {
        subject: welcomeEmailSubject,
        html: welcomeEmailHtml({
          unsubscribeUrl,
          intakeUrl: herstelplanUrl,
          profileLabel,
          urgencyLabel,
          primaryDomainLabel,
          quickWin,
        }),
      };
    }
    case "day3": {
      const proteinAttention =
        answers != null && answers.NUT_PROT <= 2 ? true : undefined;
      const proteinComparisonLink =
        answers != null && getDeficiencySignals(answers).protein_gap_signal
          ? true
          : undefined;
      return {
        subject: day3EmailSubject(quickWin),
        html: day3EmailHtml({
          unsubscribeUrl,
          quickWin,
          primaryDomainLabel,
          domainTip,
          proteinAttention,
          proteinComparisonLink,
        }),
      };
    }
    case "day7": {
      return {
        subject: day7EmailSubject,
        html: day7EmailHtml({
          unsubscribeUrl,
          profileLabel,
          articleUrl,
          articleTitle,
        }),
      };
    }
    case "day14": {
      if (day14Intervention) {
        const highlight = nurtureInterventionHighlight(day14Intervention);
        const supplementListHtml = `<p style="margin:0;font-size:16px;line-height:1.6;color:#333333;"><strong>${escapeHtml(highlight.title)}</strong> — ${escapeHtml(highlight.body)}</p>`;
        return {
          subject: day14EmailSubject,
          html: day14EmailHtml({
            unsubscribeUrl,
            supplementListHtml,
            hasAffiliateLinks: false,
          }),
        };
      }

      const omegaPartner = buildOmegaPartnerUrl();
      let hasAffiliate = false;
      const items =
        advice?.supplements.map((s) => {
          const sitePageUrl = absoluteUrl(s.link);
          const isOmega = s.name.toLowerCase().includes("omega");
          const partnerUrl = isOmega ? omegaPartner : null;
          if (partnerUrl) {
            hasAffiliate = true;
          }
          return day14SupplementListItem({
            name: s.name,
            siteUrl: sitePageUrl,
            partnerUrl,
          });
        }) ?? [];

      const supplementListHtml =
        items.length > 0
          ? `<ul style="margin:0;padding-left:18px;list-style:disc;">${items.join("")}</ul>`
          : `<p style="margin:0;font-size:16px;line-height:1.6;color:#333333;">Bekijk onze <a href="${absoluteUrl("/supplementen")}" style="color:#1a1a1a;">supplementen-overzichtspagina</a> en de vergelijkers op de site — altijd op eigen tempo en zonder harde beloftes.</p>`;

      return {
        subject: day14EmailSubject,
        html: day14EmailHtml({
          unsubscribeUrl,
          supplementListHtml,
          hasAffiliateLinks: hasAffiliate,
        }),
      };
    }
    case "day21": {
      return {
        subject: day21EmailSubject,
        html: day21EmailHtml({
          unsubscribeUrl,
          quickWin,
        }),
      };
    }
    case "day30":
    default: {
      return {
        subject: day30EmailSubject,
        html: day30EmailHtml({
          unsubscribeUrl,
          intakeUrl,
        }),
      };
    }
  }
}
