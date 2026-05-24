"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SymptomId } from "@/data/intake-questions";
import { CATEGORIES, type CategoryId } from "@/data/intake-questions";
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
import FoundationPyramid, {
  type PillarStatus,
} from "@/components/pyramid/FoundationPyramid";
import PyramidPillarDrawer, {
  type PillarDrawerData,
  type PillarDrawerStatus,
} from "@/components/pyramid/PyramidPillarDrawer";
import {
  getConnectionFraming,
  getDisplayStatus,
  getDisplayStatusFraming,
  getDisplayStatusTone,
  STATUS_TONE_CLASS,
  type DisplayStatus,
} from "@/lib/score-display";

const DOMAIN_SCORE_TO_CAT: Record<keyof DomainScores, CategoryId> = {
  sleep_score: "slaap",
  energy_score: "energie",
  stress_score: "stress",
  nutrition_score: "voeding",
  movement_score: "beweging",
  recovery_score: "herstel",
};

const DOMAIN_KEYS: (keyof DomainScores)[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
];

const SUPPLEMENT_PILLAR: Record<string, PillarId> = {
  "magnesium-glycinaat": "sleep",
  melatonine: "sleep",
  "omega-3": "nutrition",
  creatine: "movement",
  zink: "nutrition",
};

const CARD_CLASS =
  "mb-4 rounded-2xl border border-intake-card-border bg-intake-bg-elevated p-6";

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

function getAttentionPoints(
  scores: DomainScores,
): { label: string; status: DisplayStatus }[] {
  return DOMAIN_KEYS.map((key) => ({
    label:
      CATEGORIES.find((c) => c.id === DOMAIN_SCORE_TO_CAT[key])?.label ?? key,
    status: getDisplayStatus(scores[key]),
    score: scores[key],
  }))
    .filter(
      (entry) => entry.status === "Aandacht" || entry.status === "Prioriteit",
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map(({ label, status }) => ({ label, status }));
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

function StatusPill({
  label,
  status,
}: {
  label: string;
  status: DisplayStatus | "Niet gemeten";
}) {
  const tone =
    status === "Niet gemeten" ? "neutral" : getDisplayStatusTone(status);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-intake-divider bg-intake-bg/60 px-3.5 py-2.5">
      <span className="text-sm font-medium text-intake-ink">{label}</span>
      <span
        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_TONE_CLASS[tone]}`}
      >
        {status}
      </span>
    </div>
  );
}

export default function IntakeResults({
  scores,
  answers,
  symptoms,
  sessionId,
  firstName,
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
  const lowestDomainKey = [...DOMAIN_KEYS].sort(
    (a, b) => scores[a] - scores[b],
  )[0];
  const zinkSignal =
    scores.recovery_score < 40 ||
    scores.nutrition_score < 40 ||
    lowestDomainKey === "recovery_score";

  const isOvertrainerProfile = matchesOvertrainerAnswers(answers);
  const displayProfileName = isOvertrainerProfile ? "Overtrainer" : profile.name;
  const displayProfileSlug = isOvertrainerProfile
    ? "overtrainer"
    : profile.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
  const displayProfileSlugPath = `/profiel/${displayProfileSlug}`;

  const pillarStatuses = buildPillarStatuses(scores);
  const attentionPoints = getAttentionPoints(scores);
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
        <header className="mb-9 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
            <span className="text-intake-terra">03</span> · Jouw leefstijl-overzicht
          </p>
          <h1 className="mb-2 font-serif text-[30px] font-normal leading-tight text-intake-ink">
            {heroTitle}
          </h1>
          <p className="mb-4 text-sm leading-relaxed text-intake-ink-muted">
            Op basis van je antwoorden — geen medische diagnose.
          </p>

          {displayProfileName !== "In Balans" ? (
            <p className="mb-2 text-sm text-intake-ink-muted">
              Dit profiel zien we vaker:{" "}
              <span className="font-medium text-intake-ink">{displayProfileName}</span>
            </p>
          ) : null}

          {displayProfileName !== "In Balans" ? (
            <Link
              href={displayProfileSlugPath}
              className="inline-block text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
            >
              Lees meer over dit profiel →
            </Link>
          ) : null}

          {isOvertrainerProfile ? (
            <p className="mt-3">
              <Link
                href="/gids/herstel"
                className="text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
              >
                Gratis Herstelgids →
              </Link>
            </p>
          ) : null}
        </header>

        {attentionPoints.length > 0 ? (
          <section className={`${CARD_CLASS} mb-6`}>
            <h2 className="mb-3 text-sm font-semibold text-intake-ink">
              Wat we zien
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-intake-ink-muted">
              Op basis van je antwoorden valt op:
            </p>
            <ul className="space-y-2">
              {attentionPoints.map((point) => (
                <li key={point.label} className="text-sm text-intake-ink-muted">
                  <span className="font-medium text-intake-ink">{point.label}</span>
                  {" — "}
                  {point.status === "Prioriteit" ? "prioriteit" : "aandachtspunt"}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mb-6">
          <FoundationPyramid
            mode="personalized"
            pillarStatuses={pillarStatuses}
            onPillarClick={setActivePillar}
          />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <StatusPill
              label="Energie"
              status={getDisplayStatus(scores.energy_score)}
            />
            <StatusPill
              label="Herstel"
              status={getDisplayStatus(scores.recovery_score)}
            />
          </div>
        </section>

        {kennisbankLinks.length > 0 ? (
          <section className={CARD_CLASS}>
            <p className="m-0 text-sm font-semibold text-intake-ink">
              Wil je meer context?
            </p>
            <ul className="mt-3 space-y-2">
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
          </section>
        ) : null}

        <section className={CARD_CLASS}>
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-intake-sage/15 text-base">
              ⚡
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-intake-ink">Quick Wins</h2>
              <p className="text-xs text-intake-ink-subtle">Week 1 — start hier</p>
            </div>
          </div>
          {quickWins.map((tip, i) => (
            <div
              key={`qw-${i}`}
              className={`flex gap-3 py-3 ${i > 0 ? "border-t border-intake-divider" : ""}`}
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-intake-sage text-xs font-bold text-white">
                {i + 1}
              </div>
              <p className="m-0 text-sm leading-relaxed text-intake-ink-muted">{tip}</p>
            </div>
          ))}
        </section>

        {typeof answers.NUT_PROT === "number" && answers.NUT_PROT <= 2 ? (
          <section className="mb-4 rounded-2xl border border-intake-terra/30 bg-intake-terra/10 p-4">
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

        <section className={CARD_CLASS}>
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-intake-terra/15 text-base">
              💊
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-intake-ink">
                Supplementen om te verkennen
              </h2>
              <p className="text-xs text-intake-ink-subtle">
                Max. 2–3 routes — alleen waar patronen op wijzen
              </p>
            </div>
          </div>
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
        </section>

        {FOUNDATION_STACK.filter((f) => !excludeIds.includes(f.id)).length > 0 ? (
          <FoundationStack excludeIds={excludeIds} />
        ) : null}

        {(deficiencySignals.omega3_deficiency ||
          deficiencySignals.magnesium_signal ||
          deficiencySignals.creatine_signal ||
          deficiencySignals.melatonine_signal ||
          deficiencySignals.protein_gap_signal ||
          zinkSignal) && (
          <section className={CARD_CLASS}>
            <h2 className="mb-3 text-[15px] font-bold text-intake-ink">
              Vergelijkingen om te bekijken
            </h2>
            <SupplementAdviceDisclaimer variant="profile" />
            <div className="space-y-2">
              {deficiencySignals.omega3_deficiency && (
                <Link
                  href="/beste/omega-3-supplement"
                  className="flex items-center justify-between rounded-xl border border-intake-card-border bg-intake-bg px-4 py-3 text-sm text-intake-ink transition hover:border-intake-sage/40"
                >
                  <span className="font-medium">Omega-3 vergelijking</span>
                  <span className="text-intake-ink-subtle">→</span>
                </Link>
              )}
              {deficiencySignals.magnesium_signal && (
                <Link
                  href="/beste/magnesium"
                  className="flex items-center justify-between rounded-xl border border-intake-card-border bg-intake-bg px-4 py-3 text-sm text-intake-ink transition hover:border-intake-sage/40"
                >
                  <span className="font-medium">Magnesium vergelijking</span>
                  <span className="text-intake-ink-subtle">→</span>
                </Link>
              )}
              {deficiencySignals.creatine_signal && (
                <Link
                  href="/beste/creatine"
                  className="flex items-center justify-between rounded-xl border border-intake-card-border bg-intake-bg px-4 py-3 text-sm text-intake-ink transition hover:border-intake-sage/40"
                >
                  <span className="font-medium">Creatine vergelijking</span>
                  <span className="text-intake-ink-subtle">→</span>
                </Link>
              )}
              {deficiencySignals.melatonine_signal && (
                <Link
                  href="/beste/melatonine"
                  className="flex items-center justify-between rounded-xl border border-intake-card-border bg-intake-bg px-4 py-3 text-sm text-intake-ink transition hover:border-intake-sage/40"
                >
                  <span className="font-medium">Melatonine vergelijking</span>
                  <span className="text-intake-ink-subtle">→</span>
                </Link>
              )}
              {deficiencySignals.protein_gap_signal && (
                <Link
                  href="/beste/eiwitpoeder"
                  className="flex items-center justify-between rounded-xl border border-intake-card-border bg-intake-bg px-4 py-3 text-sm text-intake-ink transition hover:border-intake-sage/40"
                >
                  <span className="font-medium">Eiwitpoeder vergelijking</span>
                  <span className="text-intake-ink-subtle">→</span>
                </Link>
              )}
              {zinkSignal && (
                <Link
                  href="/beste/zink"
                  className="flex items-center justify-between rounded-xl border border-intake-card-border bg-intake-bg px-4 py-3 text-sm text-intake-ink transition hover:border-intake-sage/40"
                >
                  <span className="font-medium">Zink vergelijking</span>
                  <span className="text-intake-ink-subtle">→</span>
                </Link>
              )}
            </div>
          </section>
        )}

        <section className={CARD_CLASS}>
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-intake-terra/15 text-base">
              📈
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-intake-ink">
                12-weken richting
              </h2>
              <p className="text-xs text-intake-ink-subtle">
                Week 1: quick wins · week 2–4: leefstijl · week 5–12: gerichte aanvulling
              </p>
            </div>
          </div>
          {longTermTips.map((tip, i) => (
            <div
              key={`lt-${i}`}
              className={`flex gap-3 py-3 ${i > 0 ? "border-t border-intake-divider" : ""}`}
            >
              <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-intake-terra" />
              <p className="m-0 text-sm leading-normal text-intake-ink-muted">{tip}</p>
            </div>
          ))}
        </section>

        <section className="mb-5 rounded-2xl border border-intake-card-border bg-intake-bg px-6 py-7 text-center">
          <h2 className="mb-1 text-[15px] font-semibold text-intake-ink">
            Over 30 dagen opnieuw meten?
          </h2>
          <p className="mb-5 text-[13px] text-intake-ink-subtle">
            Zie wat er is verschoven — zonder totaalscore.
          </p>
          {emailSubmitted ? (
            <div className="flex flex-col items-center gap-2 text-[15px] leading-snug text-intake-ink">
              <span className="text-xl text-intake-sage" aria-hidden>
                ✓
              </span>
              <p className="m-0">
                We sturen je een herinnering op{" "}
                {(reminderConfirmDate ?? new Date()).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                .
              </p>
            </div>
          ) : (
            <>
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
                className={`min-h-[44px] rounded-[10px] border-none bg-intake-terra px-8 py-3.5 text-sm font-bold text-white ${
                  isLooseEmailValid(reminderEmail)
                    ? "cursor-pointer opacity-100"
                    : "cursor-default opacity-50"
                }`}
              >
                Herinnering instellen
              </button>
              <p className="mt-2 text-center text-[11px] text-intake-ink-subtle">
                Alleen voor je herinnering. Geen spam, geen nieuwsbrief.
              </p>
            </>
          )}
        </section>

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
