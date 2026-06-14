"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SymptomId } from "@/data/intake-questions";
import {
  getPillarById,
  PILLAR_DRAWER_FALLBACKS,
  PILLAR_SCORE_KEYS,
  type PillarDrawerLink,
  type PillarId,
} from "@/data/foundation-pyramid";
import type { DomainScores } from "@/lib/intake-engine";
import {
  getAdvice,
  getDeficiencySignals,
  getProfileLabel,
} from "@/lib/intake-engine";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import SupplementAdviceDisclaimer from "@/components/intake/SupplementAdviceDisclaimer";
import IntakeFeedback from "@/components/intake/IntakeFeedback";
import FoundationStack from "@/components/intake/FoundationStack";
import SupplementRoute from "@/components/intake/SupplementRoute";
import { FOUNDATION_STACK } from "@/data/foundation-stack";
import { getPlanTemplate } from "@/data/lifestyle-plans";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { getSupplementRoute, matchesOvertrainerAnswers } from "@/lib/getSupplementRoute";
import { getPrimaryTheme } from "@/lib/primary-theme";
import type { ThemeSlug } from "@/lib/content/themes";
import { getThemeContentLinks } from "@/data/theme-content-map";
import { getThemePillarHref } from "@/lib/intake-primary-pillar";
import { withIntakeReturn } from "@/lib/intake-return-link";
import { DOMAIN_CHECKIN } from "@/lib/domain-checkin";
import { getLowDomainKennisbankLinks } from "@/lib/intake-kennisbank-links";
import { getProteinEmphasis } from "@/lib/nutrition-protein-emphasis";
import { revokeIntakeConsent, deleteIntakeSession } from "@/lib/intake-storage";
import { getHeroTitle, getMailConfirmation } from "@/lib/intake-greetings";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import { MeasurementReminderOptIn } from "@/components/intake/MeasurementReminderOptIn";
import { buildSummaryRows, focusSecondaryCheckin } from "@/lib/results-summary-rows";
import { getRecognitionLine, getVitalityFraming } from "@/lib/results-framing";
import {
  getDisplayStatusTone,
  STATUS_TONE_CLASS,
} from "@/lib/score-display";
import {
  computeVitaliteit,
  resolveVitaliteitFacets,
  vitaliteitBand,
} from "@/lib/vitaliteit";
import IntakeResultPreviewCard from "@/components/intake/IntakeResultPreviewCard";
import FoundationPyramid, {
  type PillarStatus,
} from "@/components/pyramid/FoundationPyramid";
import PyramidPillarDrawer, {
  type PillarDrawerData,
  type PillarDrawerStatus,
} from "@/components/pyramid/PyramidPillarDrawer";
import IntakeResultsSection from "@/components/intake/IntakeResultsSection";
import PlanContentSection from "@/components/intake/PlanContentSection";
import {
  PLAN_JOURNEY_THEME_SLUGS,
  type PlanContent,
} from "@/lib/content/plan-content";
import {
  getConnectionFraming,
  getDisplayStatus,
  getDisplayStatusFraming,
} from "@/lib/score-display";

function isPlanJourneyTheme(
  theme: PillarId,
): theme is (typeof PLAN_JOURNEY_THEME_SLUGS)[number] {
  return (PLAN_JOURNEY_THEME_SLUGS as readonly string[]).includes(theme);
}

const SUPPLEMENT_PILLAR: Record<string, PillarId> = {
  "magnesium-glycinaat": "sleep",
  melatonine: "sleep",
  "omega-3": "nutrition",
  creatine: "movement",
  zink: "nutrition",
};

const REVOKE_CONFIRM =
  "Weet je het zeker? Je intake-antwoorden worden geanonimiseerd. Een anonieme sessie-id blijft bewaard voor statistiek.";

const DELETE_CONFIRM =
  "Weet je het zeker? Je volledige intake-sessie wordt permanent verwijderd. Dit kan niet ongedaan worden gemaakt.";

const REVOKE_SUCCESS =
  "Je toestemming is ingetrokken en je gegevens zijn geanonimiseerd.";

const DELETE_SUCCESS = "Je intake-sessie is volledig verwijderd.";

const PRIMARY_REASON = {
  nutrition:
    "Zonder een stevige voedingsbasis (genoeg eiwit en micronutrienten) werkt elke andere stap minder goed.",
  stress:
    "Bij aanhoudende stress is eerst rust en herstel zinvoller dan er beweging of supplementen bovenop.",
  sleep:
    "Slaap is het herstelvenster waar al je andere stappen op leunen — daarom eerst hier.",
  movement:
    "Meer bewegen zonder slaap en eiwitten op orde werkt averechts. Begin hier.",
};

const THEME_BACKLINK_COPY: Record<ThemeSlug, { pillar: string; profile: string }> = {
  sleep: {
    pillar: "Slecht slapen na 40? Complete gids van oorzaak tot oplossing →",
    profile: "Wakker om 3 uur? Herken je dit patroon →",
  },
  stress: {
    pillar: "Altijd 'aan' staan? Zo kom je structureel tot rust →",
    profile: "Draag jij stress de hele dag mee? Herken het patroon →",
  },
  nutrition: {
    pillar: "Voeding en herstel na 40 — wat mannen vaak missen →",
    profile: "",
  },
  movement: {
    pillar: "Hard trainen, traag herstellen? Lees verder over herstel na 40 →",
    profile: "Train je veel maar voel je je leeg? Herken de overtrainer →",
  },
  connection: {
    pillar: "",
    profile: "",
  },
};

type IntakeResultsProps = {
  scores: DomainScores;
  answers: Record<string, number>;
  symptoms: SymptomId[];
  sessionId: string | null;
  rapportUrl?: string | null;
  firstName?: string | null;
  hasActiveMarketingEmailConsent?: boolean;
  hideLegacyPlanSections?: boolean;
  secondaryTheme?: PillarId | null;
  onRestart?: () => void;
  onConsentRevoked?: () => void;
};

function buildPillarStatuses(
  scores: DomainScores,
): Partial<Record<PillarId, PillarStatus>> {
  return {
    stress: getDisplayStatus(scores.stress_score),
    sleep: getDisplayStatus(scores.sleep_score),
    nutrition: getDisplayStatus(scores.nutrition_score),
    movement: getDisplayStatus(scores.movement_score),
    connection: "Niet gemeten",
  };
}

function buildPillarDrawerData(options: {
  pillarId: PillarId;
  scores: DomainScores;
  profileSlug: string;
  profileName: string;
  supplementLinks: PillarDrawerLink[];
}): PillarDrawerData | null {
  const pillar = getPillarById(options.pillarId);
  if (!pillar) {
    return null;
  }

  const fallback = PILLAR_DRAWER_FALLBACKS[options.pillarId];
  const scoreKey = PILLAR_SCORE_KEYS[options.pillarId];

  let status: PillarDrawerStatus = "Niet gemeten";
  let explanation = getConnectionFraming();

  if (scoreKey) {
    status = getDisplayStatus(options.scores[scoreKey]);
    explanation = getDisplayStatusFraming(pillar.label, status);
  }

  const links: PillarDrawerLink[] = [];

  if (
    fallback.profileSlugs?.some((slug) => options.profileSlug.includes(slug))
  ) {
    links.push({
      label: `Profiel: ${options.profileName}`,
      href: `/profiel/${options.profileSlug}`,
    });
  }

  if (fallback.guideHref) {
    links.push({
      label: "Gratis gids",
      href: fallback.guideHref,
    });
  }

  for (const link of options.supplementLinks) {
    if (links.length >= 4) {
      break;
    }
    if (!links.some((existing) => existing.href === link.href)) {
      links.push(link);
    }
  }

  return {
    pillarLabel: pillar.label,
    pillarSublabel: pillar.sublabel,
    status,
    explanation,
    quickWins: [...fallback.quickWins].slice(0, 3),
    links,
  };
}

function buildPillarSupplementLinks(
  supplementRoute: ReturnType<typeof getSupplementRoute>,
  deficiencySignals: ReturnType<typeof getDeficiencySignals>,
): Partial<Record<PillarId, PillarDrawerLink[]>> {
  const links: Partial<Record<PillarId, PillarDrawerLink[]>> = {};

  for (const route of supplementRoute) {
    const pillar = SUPPLEMENT_PILLAR[route.id];
    if (!pillar) {
      continue;
    }
    const entry = links[pillar] ?? [];
    entry.push({
      label: `Vergelijk ${route.name}`,
      href: route.affiliateUrl,
    });
    links[pillar] = entry;
  }

  const signalLinks: Array<{ pillar: PillarId; label: string; href: string }> = [
    { pillar: "nutrition", label: "Vergelijk omega-3", href: "/beste/omega-3-supplement" },
    { pillar: "sleep", label: "Vergelijk magnesium", href: "/beste/magnesium" },
    { pillar: "movement", label: "Vergelijk creatine", href: "/beste/creatine" },
    {
      pillar: "sleep",
      label: "Melatonine — wanneer wel en niet",
      href: "/supplementen/melatonine",
    },
    { pillar: "nutrition", label: "Vergelijk eiwitpoeder", href: "/beste/eiwitpoeder" },
  ];

  const appendLink = (pillar: PillarId, link: PillarDrawerLink) => {
    const entry = links[pillar] ?? [];
    if (!entry.some((existing) => existing.href === link.href)) {
      entry.push(link);
    }
    links[pillar] = entry;
  };

  if (deficiencySignals.omega3_deficiency) {
    appendLink(signalLinks[0].pillar, signalLinks[0]);
  }
  if (deficiencySignals.magnesium_signal) {
    appendLink(signalLinks[1].pillar, signalLinks[1]);
  }
  if (deficiencySignals.creatine_signal) {
    appendLink(signalLinks[2].pillar, signalLinks[2]);
  }
  if (deficiencySignals.melatonine_signal) {
    appendLink(signalLinks[3].pillar, signalLinks[3]);
  }
  if (deficiencySignals.protein_gap_signal) {
    appendLink(signalLinks[4].pillar, signalLinks[4]);
  }

  return links;
}

export default function IntakeResults({
  scores,
  answers,
  symptoms,
  sessionId,
  rapportUrl = null,
  firstName,
  hasActiveMarketingEmailConsent = false,
  hideLegacyPlanSections = false,
  secondaryTheme = null,
  onRestart,
  onConsentRevoked,
}: IntakeResultsProps) {
  const [revokeBusy, setRevokeBusy] = useState(false);
  const [revokeFeedback, setRevokeFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [activePillar, setActivePillar] = useState<PillarId | null>(null);
  const [planContent, setPlanContent] = useState<PlanContent | null>(null);

  const profile = getProfileLabel(scores);
  const advice = getAdvice(scores, answers, symptoms);
  const quickWins = advice.quickWins.slice(0, 3);
  const longTermTips = advice.longTerm.slice(0, 3);
  const deficiencySignals = getDeficiencySignals(answers);
  const proteinEmphasis = getProteinEmphasis(
    { MOV_STR: answers.MOV_STR, MOV_CARD: answers.MOV_CARD },
    "below",
  );
  const supplementRoute = getSupplementRoute(
    scores,
    deficiencySignals,
    profile,
    answers,
  );
  const primaryTheme = getPrimaryTheme(scores, answers);
  const activePlanContent =
    isPlanJourneyTheme(primaryTheme) &&
    planContent?.themeSlug === primaryTheme
      ? planContent
      : null;
  const suppressLegacySupplements =
    activePlanContent?.ready === true && activePlanContent.actions.length > 0;
  const displaySupplementRoute = suppressLegacySupplements ? [] : supplementRoute;
  const excludeIds = displaySupplementRoute.map((r) => r.id);
  const kennisbankLinks = getLowDomainKennisbankLinks(scores);
  const pillarStatuses = buildPillarStatuses(scores);
  const planTemplate = getPlanTemplate(primaryTheme);

  const isOvertrainerProfile = matchesOvertrainerAnswers(answers);
  const displayProfileName = isOvertrainerProfile ? "Overtrainer" : profile.name;
  const displayProfileSlug = isOvertrainerProfile
    ? "overtrainer"
    : profile.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

  const pillarSupplementLinks = buildPillarSupplementLinks(
    displaySupplementRoute,
    deficiencySignals,
  );
  const activeDrawerData = activePillar
    ? buildPillarDrawerData({
        pillarId: activePillar,
        scores,
        profileSlug: displayProfileSlug,
        profileName: displayProfileName,
        supplementLinks: pillarSupplementLinks[activePillar] ?? [],
      })
    : null;

  const themeLinks = getThemeContentLinks(primaryTheme);
  const themeLabel = getPillarById(primaryTheme)?.label ?? "";
  const hasThemeBacklink = Boolean(themeLinks.pillarHref || themeLinks.profileSlug);
  const showEnergyGuideLink = scores.energy_score < 40;
  const primaryCheckin = DOMAIN_CHECKIN[primaryTheme];

  const hasExploreContent =
    FOUNDATION_STACK.filter((f) => !excludeIds.includes(f.id)).length > 0 ||
    kennisbankLinks.length > 0 ||
    (typeof answers.NUT_PROT === "number" && answers.NUT_PROT <= 2) ||
    hasThemeBacklink ||
    showEnergyGuideLink;

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".intake-layout-header");
    if (header) header.style.display = "none";
    return () => {
      if (header) header.style.display = "";
    };
  }, []);

  const themeRevealedEmittedRef = useRef(false);

  useEffect(() => {
    if (!isPlanJourneyTheme(primaryTheme)) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/intake/plan-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            themeSlug: primaryTheme,
            scores,
            answers,
          }),
        });
        if (!response.ok || cancelled) {
          return;
        }
        const data = (await response.json()) as PlanContent;
        if (!cancelled && data.themeSlug === primaryTheme) {
          setPlanContent(data);
        }
      } catch {
        // Behoud vorige planContent; activePlanContent filtert op themeSlug.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [primaryTheme, scores, answers]);

  useEffect(() => {
    trackEvent("intake_results_viewed", { theme_slug: primaryTheme });
    if (themeRevealedEmittedRef.current) {
      return;
    }
    themeRevealedEmittedRef.current = true;
    emitIntakeClientEvent("intake.theme_revealed", {
      theme_slug: primaryTheme,
      session_id: sessionId,
    });
  }, [primaryTheme, sessionId]);

  const heroTitle = getHeroTitle(firstName);
  const { rows: summaryRows, primaryLabel } = buildSummaryRows(
    scores,
    primaryTheme,
  );
  const vitaliteitIndex = computeVitaliteit(resolveVitaliteitFacets(scores));
  const vitaliteitStatus = vitaliteitBand(vitaliteitIndex);
  const vitaliteitTone = getDisplayStatusTone(vitaliteitStatus);

  const compactRows = focusSecondaryCheckin(
    summaryRows.filter((row) => row.label !== primaryLabel),
  );
  const recognitionLine = getRecognitionLine(symptoms);
  const vitalityFraming = getVitalityFraming(scores);

  const primaryQuickWin = quickWins[0];
  const extraQuickWins = quickWins.slice(1);
  const primaryLongTermTip = longTermTips[0];
  const extraLongTermTips = longTermTips.slice(1);
  const hasTipsContent =
    Boolean(primaryQuickWin) ||
    extraQuickWins.length > 0 ||
    Boolean(primaryLongTermTip);
  const showLegacyBackground =
    !hideLegacyPlanSections && (hasTipsContent || hasExploreContent);

  return (
    <>
      <Link
        href="/"
        className="fixed right-4 top-4 z-50 px-1 py-1 text-[13px] text-intake-ink-subtle no-underline transition-colors hover:text-intake-ink"
        aria-label="Sluiten"
      >
        ✕ Sluiten
      </Link>

      <div className="mx-auto box-border w-full max-w-[480px] px-6 pb-10 pt-8">
        <header className="mb-5 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
            <span className="text-intake-terra">03</span> · Meer over je leefstijl
          </p>
          <h1 className="mb-2 font-serif text-[28px] font-normal leading-tight text-intake-ink">
            {heroTitle}
          </h1>
          {recognitionLine ? (
            <p className="mx-auto max-w-[34ch] text-sm leading-relaxed text-intake-ink-muted">
              {recognitionLine}
            </p>
          ) : null}
        </header>

        {rapportUrl && (
          <Link
            href={rapportUrl}
            className="mb-6 block rounded-2xl border border-intake-sage/40 bg-intake-sage/10 px-5 py-4 no-underline transition-colors hover:bg-intake-sage/15"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-intake-sage">
              30-dagen hermeting
            </p>
            <p className="mt-1 text-sm font-medium text-intake-ink">
              Bekijk je 30-dagen rapport — zo veranderde je beeld sinds de
              startmeting →
            </p>
          </Link>
        )}

        <section className="mb-6" aria-label="Jouw leefstijl-overzicht">
          <div className="mb-3 rounded-xl border border-intake-card-border bg-intake-bg-elevated px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-intake-ink">
                Jouw vitaliteit
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_TONE_CLASS[vitaliteitTone]}`}
              >
                {vitaliteitStatus}
              </span>
            </div>
            {vitalityFraming.driverLine || vitalityFraming.strengthLine ? (
              <p className="mt-2 text-xs leading-relaxed text-intake-ink-subtle">
                {[vitalityFraming.driverLine, vitalityFraming.strengthLine]
                  .filter(Boolean)
                  .join(" ")}
              </p>
            ) : null}
          </div>

          <section className="mb-3 rounded-2xl border border-intake-card-border bg-intake-bg-elevated px-5 py-4">
            <h2 className="mb-2 text-base font-semibold leading-snug text-intake-ink">
              {themeLabel} is jouw grootste prioriteit
            </h2>
            <p className="m-0 mb-4 text-sm leading-relaxed text-intake-ink-muted">
              {PRIMARY_REASON[primaryTheme]}
            </p>
            <Link
              href={primaryCheckin.href}
              onClick={() => {
                trackEvent("intake_cta_to_primary_checkin", {
                  domain: primaryTheme,
                });
                emitIntakeClientEvent("intake.cta_to_primary_checkin", {
                  domain: primaryTheme,
                  session_id: sessionId,
                });
              }}
              className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-[10px] border-none bg-intake-terra px-6 py-3.5 text-sm font-bold text-white no-underline transition-opacity hover:opacity-90"
            >
              Doe de {primaryCheckin.label}-check (1 min) →
            </Link>
          </section>

          {planTemplate || secondaryTheme ? (
            <div className="mb-3">
              {planTemplate ? (
                <p className="text-center text-xs leading-relaxed text-intake-ink-muted">
                  <Link
                    href={`/intake/plan/${primaryTheme}`}
                    className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
                  >
                    Bekijk afvinkbaar stappenplan →
                  </Link>
                </p>
              ) : null}

              {secondaryTheme ? (
                <Link
                  href={withIntakeReturn(getThemePillarHref(secondaryTheme))}
                  onClick={() => {
                    emitIntakeClientEvent("intake.cta_to_pillar", {
                      theme_slug: secondaryTheme,
                      session_id: sessionId,
                    });
                  }}
                  className="mt-3 block cursor-pointer text-[13px] font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
                >
                  Ook prioriteit: {getPillarById(secondaryTheme)?.label ?? "tweede gebied"} →
                </Link>
              ) : null}
            </div>
          ) : null}

          <IntakeResultPreviewCard
            variant="live"
            rows={compactRows}
            hideContextFooter
          />

          <p className="mt-4 text-center text-xs leading-relaxed text-intake-ink-subtle">
            {REVEAL_COPY.contextLine}
          </p>

          {hasActiveMarketingEmailConsent ? (
            <p className="mt-4 text-center text-sm text-intake-ink-muted">
              {getMailConfirmation(firstName)}
            </p>
          ) : null}
        </section>

        {displaySupplementRoute.length > 0 ? (
          <details className="group mb-6 rounded-2xl border border-intake-card-border bg-intake-bg-elevated/40">
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-intake-sage [&::-webkit-details-marker]:hidden">
              {REVEAL_COPY.supplementOptInSummary}
            </summary>
            <div className="space-y-4 border-t border-intake-divider px-5 pb-5 pt-4">
              <SupplementAdviceDisclaimer variant="profile" />
              <SupplementRoute
                recommendations={displaySupplementRoute}
                scores={scores}
              />
              <p className="text-sm text-intake-ink-muted">
                Vragen?{" "}
                <Link
                  href="/contact"
                  className="font-medium text-intake-sage underline-offset-2 hover:underline"
                >
                  Stel ze →
                </Link>
              </p>
            </div>
          </details>
        ) : null}

        {sessionId ? (
          <div className="mb-6">
            <MeasurementReminderOptIn sessionId={sessionId} />
          </div>
        ) : null}

        {activePlanContent && activePlanContent.actions.length > 0 ? (
          planTemplate ? (
            <details className="group mb-6 rounded-2xl border border-intake-card-border bg-intake-bg-elevated/40">
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-intake-sage [&::-webkit-details-marker]:hidden">
                Supplementen en meetstappen (optioneel)
              </summary>
              <div className="border-t border-intake-divider px-2 pb-4 pt-2">
                <PlanContentSection
                  actions={activePlanContent.actions}
                  ready={activePlanContent.ready}
                />
              </div>
            </details>
          ) : (
            <PlanContentSection
              actions={activePlanContent.actions}
              ready={activePlanContent.ready}
            />
          )
        ) : null}

        <details className="group mb-6 rounded-2xl border border-intake-card-border bg-intake-bg-elevated/40">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-intake-sage [&::-webkit-details-marker]:hidden">
            {REVEAL_COPY.pyramidDetailsSummary}
          </summary>
          <div className="border-t border-intake-divider px-2 pb-4 pt-2">
            <FoundationPyramid
              mode="personalized"
              pillarStatuses={pillarStatuses}
              primaryPillar={primaryTheme}
              onPillarClick={setActivePillar}
            />
          </div>
        </details>

        {showLegacyBackground ? (
          <details className="group mb-6 rounded-2xl border border-intake-card-border bg-intake-bg-elevated/40">
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-intake-sage [&::-webkit-details-marker]:hidden">
              {REVEAL_COPY.moreBackgroundSummary}
            </summary>
            <div className="space-y-4 border-t border-intake-divider px-2 pb-4 pt-2">
              {hasTipsContent ? (
                <IntakeResultsSection
                  id="tips"
                  title="Tips & actieplan"
                  subtitle="Quick wins en 12-weken richting"
                >
                  {primaryQuickWin ? (
                    <section className="mb-5 rounded-xl border border-intake-card-border bg-intake-bg px-4 py-4">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-ink-subtle">
                        Start deze week
                      </p>
                      <p className="m-0 text-sm leading-relaxed text-intake-ink-muted">
                        {primaryQuickWin}
                      </p>
                    </section>
                  ) : null}

                  {extraQuickWins.length > 0 ? (
                    <div className="mb-5">
                      <h3 className="mb-3 text-sm font-semibold text-intake-ink">
                        Meer quick wins
                      </h3>
                      <ul className="space-y-3">
                        {extraQuickWins.map((tip, i) => (
                          <li
                            key={`qw-extra-${i}`}
                            className="flex gap-3 text-sm leading-relaxed text-intake-ink-muted"
                          >
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-intake-sage text-xs font-bold text-white">
                              {i + 2}
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {primaryLongTermTip ? (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-intake-ink">
                        12-weken richting
                      </h3>
                      <p className="mb-3 text-sm leading-relaxed text-intake-ink-muted">
                        {primaryLongTermTip}
                      </p>
                      {extraLongTermTips.length > 0 ? (
                        <details className="group">
                          <summary className="cursor-pointer list-none text-sm font-medium text-intake-sage [&::-webkit-details-marker]:hidden">
                            Volledig 12-weken plan ▾
                          </summary>
                          <ul className="mt-3 space-y-2 border-t border-intake-divider pt-3">
                            {extraLongTermTips.map((tip, i) => (
                              <li
                                key={`lt-extra-${i}`}
                                className="text-sm leading-relaxed text-intake-ink-muted"
                              >
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </div>
                  ) : null}
                </IntakeResultsSection>
              ) : null}

              {hasExploreContent ? (
                <IntakeResultsSection
                  title="Verder verkennen"
                  subtitle="Supplementen, kennisbank en vergelijkingen"
                >
                  {hasThemeBacklink ? (
                    <div className="mb-5">
                      <h3 className="mb-3 text-sm font-semibold text-intake-ink">
                        Lees verder over je {themeLabel.toLowerCase()}
                      </h3>
                      <ul className="space-y-2">
                        {themeLinks.pillarHref ? (
                          <li className="text-sm">
                            <Link
                              href={themeLinks.pillarHref}
                              className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
                            >
                              {THEME_BACKLINK_COPY[primaryTheme].pillar}
                            </Link>
                          </li>
                        ) : null}
                        {themeLinks.profileSlug ? (
                          <li className="text-sm">
                            <Link
                              href={`/profiel/${themeLinks.profileSlug}`}
                              className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
                            >
                              {THEME_BACKLINK_COPY[primaryTheme].profile}
                            </Link>
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  ) : null}

                  {showEnergyGuideLink ? (
                    <p className="mb-5 text-sm text-intake-ink-muted">
                      Energie staat onder druk in je profiel.{" "}
                      <Link
                        href="/gids/energie"
                        className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
                      >
                        Gratis energiegids downloaden →
                      </Link>
                    </p>
                  ) : null}

                  {FOUNDATION_STACK.filter((f) => !excludeIds.includes(f.id)).length > 0 ? (
                    <div className="mb-5">
                      <FoundationStack excludeIds={excludeIds} />
                    </div>
                  ) : null}

                  {kennisbankLinks.length > 0 ? (
                    <div className="mb-5">
                      <h3 className="mb-3 text-sm font-semibold text-intake-ink">
                        Wil je meer context?
                      </h3>
                      <ul className="space-y-2">
                        {kennisbankLinks.map((link) => (
                          <li key={link.href} className="text-sm text-intake-ink-muted">
                            <span className="text-intake-ink-subtle">{link.domainLabel}: </span>
                            <Link
                              href={link.href}
                              className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {typeof answers.NUT_PROT === "number" && answers.NUT_PROT <= 2 ? (
                    <section className="rounded-2xl border border-intake-terra/30 bg-intake-terra/10 p-4">
                      <h3 className="font-semibold text-intake-ink">Eiwit als aandachtspunt</h3>
                      <p className="mt-1 text-sm leading-relaxed text-intake-ink-muted">
                        Veel mannen 40+ halen onder de 1,2 g eiwit per kg lichaamsgewicht per
                        dag, wat het onderhouden van spiermassa lastiger maakt.
                        {proteinEmphasis.note ? (
                          <>
                            {" "}
                            {proteinEmphasis.note}
                          </>
                        ) : null}
                      </p>
                      <p className="mt-2 text-sm text-intake-ink-muted">
                        <Link
                          href="/blog/eiwit-na-40"
                          className="font-medium text-intake-sage underline underline-offset-2"
                        >
                          Lees: eiwit na 40
                        </Link>
                        {" · "}
                        <Link
                          href="/kennisbank/eiwitbehoefte-na-40"
                          className="font-medium text-intake-sage underline underline-offset-2"
                        >
                          Kennisbank
                        </Link>
                      </p>
                      {deficiencySignals.protein_gap_signal ? (
                        <p className="mt-3 text-sm text-intake-ink-muted">
                          <Link
                            href="/beste/eiwitpoeder"
                            className="font-medium text-intake-sage underline underline-offset-2"
                          >
                            Vergelijk eiwitpoeders →
                          </Link>
                        </p>
                      ) : null}
                    </section>
                  ) : null}
                </IntakeResultsSection>
              ) : null}
            </div>
          </details>
        ) : null}

        {/* Footer */}
        <IntakeFeedback sessionId={sessionId} />

        <div className="mb-5">
          <MedicalDisclaimer variant="intake" theme="dark" className="mt-0" />
          {sessionId ? (
            <div className="mt-5">
              {revokeFeedback ? (
                <p
                  className={`mb-3 rounded-xl px-4 py-3 text-[13px] leading-snug ${
                    revokeFeedback.kind === "success"
                      ? "border border-intake-sage/30 bg-intake-sage/10 text-intake-ink"
                      : "border border-red-400/30 bg-red-950/20 text-red-200"
                  }`}
                  role={revokeFeedback.kind === "error" ? "alert" : "status"}
                >
                  {revokeFeedback.text}
                </p>
              ) : null}
              {revokeFeedback?.kind !== "success" ? (
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    disabled={revokeBusy}
                    onClick={() => {
                      if (!window.confirm(REVOKE_CONFIRM)) {
                        return;
                      }
                      void (async () => {
                        setRevokeBusy(true);
                        setRevokeFeedback(null);
                        const result = await revokeIntakeConsent();
                        setRevokeBusy(false);
                        if (result.ok) {
                          setRevokeFeedback({
                            kind: "success",
                            text: REVOKE_SUCCESS,
                          });
                          window.setTimeout(() => {
                            onConsentRevoked?.();
                          }, 2800);
                          return;
                        }
                        setRevokeFeedback({ kind: "error", text: result.error });
                      })();
                    }}
                    className="w-full cursor-pointer rounded-xl border border-intake-card-border bg-intake-bg/60 py-3.5 text-[13px] font-medium text-intake-ink-subtle disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {revokeBusy ? "Bezig…" : "Toestemming intrekken & anonimiseren"}
                  </button>
                  <button
                    type="button"
                    disabled={revokeBusy}
                    onClick={() => {
                      if (!window.confirm(DELETE_CONFIRM)) {
                        return;
                      }
                      void (async () => {
                        setRevokeBusy(true);
                        setRevokeFeedback(null);
                        const result = await deleteIntakeSession();
                        setRevokeBusy(false);
                        if (result.ok) {
                          setRevokeFeedback({
                            kind: "success",
                            text: DELETE_SUCCESS,
                          });
                          window.setTimeout(() => {
                            onConsentRevoked?.();
                          }, 2800);
                          return;
                        }
                        setRevokeFeedback({ kind: "error", text: result.error });
                      })();
                    }}
                    className="w-full cursor-pointer rounded-xl border border-red-400/25 bg-red-950/10 py-3.5 text-[13px] font-medium text-red-200/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {revokeBusy ? "Bezig…" : "Alles verwijderen"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {onRestart ? (
          <button
            type="button"
            onClick={onRestart}
            className="mb-5 w-full cursor-pointer rounded-xl border border-intake-card-border bg-intake-bg/60 py-3.5 text-[13px] font-medium text-intake-ink-subtle"
          >
            Opnieuw beginnen
          </button>
        ) : null}

        <p className="text-center text-[11px] leading-normal text-intake-ink-subtle">
          <Link href="/privacy" className="underline underline-offset-2 hover:text-intake-ink-muted">
            Privacy
          </Link>
          {" · "}
          <Link href="/disclaimer" className="underline underline-offset-2 hover:text-intake-ink-muted">
            Disclaimer
          </Link>
          {" · "}
          © 2026 PerfectSupplement
        </p>
      </div>

      <PyramidPillarDrawer
        data={activeDrawerData}
        onClose={() => setActivePillar(null)}
      />
    </>
  );
}
