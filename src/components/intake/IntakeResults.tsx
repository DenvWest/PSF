"use client";

import { useEffect, useState } from "react";
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
import { getSupplementRoute, matchesOvertrainerAnswers } from "@/lib/getSupplementRoute";
import { getLowDomainKennisbankLinks } from "@/lib/intake-kennisbank-links";
import { revokeIntakeConsent, saveReminderEmail, deleteIntakeSession } from "@/lib/intake-storage";
import { withIntakeReturn } from "@/lib/intake-return-link";
import FoundationPyramid, {
  type PillarStatus,
} from "@/components/pyramid/FoundationPyramid";
import PyramidPillarDrawer, {
  type PillarDrawerData,
  type PillarDrawerStatus,
} from "@/components/pyramid/PyramidPillarDrawer";
import IntakeResultsSection from "@/components/intake/IntakeResultsSection";
import {
  getConnectionFraming,
  getDisplayStatus,
  getDisplayStatusFraming,
} from "@/lib/score-display";

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

type IntakeResultsProps = {
  scores: DomainScores;
  answers: Record<string, number>;
  symptoms: SymptomId[];
  sessionId: string | null;
  firstName?: string | null;
  hasMarketingEmail?: boolean;
  onRestart?: () => void;
  onConsentRevoked?: () => void;
};

function isLooseEmailValid(value: string): boolean {
  const t = value.trim();
  return t.includes("@") && t.includes(".");
}

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
    { pillar: "sleep", label: "Vergelijk melatonine", href: "/beste/melatonine" },
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
  firstName,
  hasMarketingEmail = false,
  onRestart,
  onConsentRevoked,
}: IntakeResultsProps) {
  const [reminderEmail, setReminderEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [reminderConfirmDate, setReminderConfirmDate] = useState<Date | null>(
    null,
  );
  const [revokeBusy, setRevokeBusy] = useState(false);
  const [revokeFeedback, setRevokeFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [activePillar, setActivePillar] = useState<PillarId | null>(null);

  const profile = getProfileLabel(scores);
  const advice = getAdvice(scores, answers, symptoms);
  const quickWins = advice.quickWins.slice(0, 3);
  const longTermTips = advice.longTerm.slice(0, 3);
  const deficiencySignals = getDeficiencySignals(answers);
  const supplementRoute = getSupplementRoute(
    scores,
    deficiencySignals,
    profile,
    answers,
  );
  const excludeIds = supplementRoute.map((r) => r.id);
  const kennisbankLinks = getLowDomainKennisbankLinks(scores);
  const pillarStatuses = buildPillarStatuses(scores);

  const isOvertrainerProfile = matchesOvertrainerAnswers(answers);
  const displayProfileName = isOvertrainerProfile ? "Overtrainer" : profile.name;
  const displayProfileSlug = isOvertrainerProfile
    ? "overtrainer"
    : profile.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
  const displayProfileSlugPath = `/profiel/${displayProfileSlug}`;

  const pillarSupplementLinks = buildPillarSupplementLinks(
    supplementRoute,
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

  const hasExploreContent =
    supplementRoute.length > 0 ||
    FOUNDATION_STACK.filter((f) => !excludeIds.includes(f.id)).length > 0 ||
    kennisbankLinks.length > 0 ||
    (typeof answers.NUT_PROT === "number" && answers.NUT_PROT <= 2);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".intake-layout-header");
    if (header) header.style.display = "none";
    return () => {
      if (header) header.style.display = "";
    };
  }, []);

  const heroTitle = firstName
    ? `Jouw vitaliteitsprofiel, ${firstName}`
    : "Jouw vitaliteitsprofiel";

  const primaryQuickWin = quickWins[0];
  const extraQuickWins = quickWins.slice(1);
  const primaryLongTermTip = longTermTips[0];
  const extraLongTermTips = longTermTips.slice(1);

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

          {displayProfileName !== "In Balans" ? (
            <p className="text-sm text-intake-ink-muted">
              Profiel:{" "}
              <Link
                href={withIntakeReturn(displayProfileSlugPath)}
                className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
              >
                {displayProfileName}
              </Link>
            </p>
          ) : null}

          {isOvertrainerProfile ? (
            <p className="mt-2">
              <Link
                href={withIntakeReturn("/gids/herstel")}
                className="text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
              >
                Gratis Herstelgids →
              </Link>
            </p>
          ) : null}
        </header>

        <section className="mb-6" aria-label="Jouw leefstijlpiramide">
          <FoundationPyramid
            mode="personalized"
            pillarStatuses={pillarStatuses}
            onPillarClick={setActivePillar}
          />

          {hasMarketingEmail ? (
            <p className="mt-5 text-center text-sm text-intake-ink-muted">
              {firstName
                ? `${firstName}, je ontvangt je leefstijl-overzicht ook per mail.`
                : "Je ontvangt je leefstijl-overzicht ook per mail."}
            </p>
          ) : emailSubmitted ? (
            <div className="mt-5 flex flex-col items-center gap-2 rounded-2xl border border-intake-sage/30 bg-intake-sage/10 px-5 py-4 text-center text-sm text-intake-ink">
              <span className="text-lg text-intake-sage" aria-hidden>
                ✓
              </span>
              <p className="m-0">
                Herinnering gepland op{" "}
                {(reminderConfirmDate ?? new Date()).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                .
              </p>
            </div>
          ) : (
            <section className="mt-5 rounded-2xl border border-intake-card-border bg-intake-bg px-5 py-5 text-center">
              <h2 className="mb-1 text-[15px] font-semibold text-intake-ink">
                Bewaar je leefstijlkaart
              </h2>
              <p className="mb-4 text-[13px] text-intake-ink-subtle">
                Geen spam — alleen een herinnering over 30 dagen om opnieuw te meten.
              </p>
              <input
                type="email"
                name="reminder-email"
                autoComplete="email"
                placeholder="je@emailadres.nl"
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                className="mb-3 box-border w-full rounded-[10px] border border-intake-card-border bg-intake-bg-elevated px-4 py-3.5 text-[15px] text-intake-ink outline-none"
              />
              <button
                type="button"
                disabled={!isLooseEmailValid(reminderEmail)}
                onClick={() => {
                  void (async () => {
                    if (!isLooseEmailValid(reminderEmail)) {
                      return;
                    }
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    setReminderConfirmDate(d);
                    await saveReminderEmail(reminderEmail.trim());
                    setEmailSubmitted(true);
                  })();
                }}
                className={`min-h-[44px] w-full rounded-[10px] border-none px-6 py-3.5 text-sm font-bold text-white ${
                  isLooseEmailValid(reminderEmail)
                    ? "cursor-pointer opacity-100"
                    : "cursor-default opacity-50"
                }`}
                style={{ background: "#C8956C" }}
              >
                Stuur me een herinnering
              </button>
            </section>
          )}
        </section>

        {(primaryQuickWin || extraQuickWins.length > 0 || primaryLongTermTip) ? (
          <IntakeResultsSection
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

        {/* Tier 3 — supplementen & verdieping */}
        {hasExploreContent ? (
          <IntakeResultsSection
            title="Verder verkennen"
            subtitle="Supplementen, kennisbank en vergelijkingen"
          >
            {supplementRoute.length > 0 ? (
              <div className="mb-5">
                <h3 className="mb-3 text-sm font-semibold text-intake-ink">
                  Supplementen om te verkennen
                </h3>
                <SupplementAdviceDisclaimer variant="profile" />
                <SupplementRoute recommendations={supplementRoute} scores={scores} />
                <p className="mt-4 text-sm text-intake-ink-muted">
                  Vragen?{" "}
                  <Link
                    href="/contact"
                    className="font-medium text-intake-sage underline-offset-2 hover:underline"
                  >
                    Stel ze →
                  </Link>
                </p>
              </div>
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
                  {((typeof answers.MOV_CARD === "number" && answers.MOV_CARD >= 3) ||
                    (typeof answers.MOV_STR === "number" && answers.MOV_STR >= 4)) ? (
                    <>
                      {" "}
                      Bij actief bewegen helpt eiwitrijke voeding extra bij herstel en
                      spieronderhoud.
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
