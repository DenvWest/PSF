"use client";

import { useState } from "react";
import type { SymptomId } from "@/data/intake-questions";
import { CATEGORIES, type CategoryId } from "@/data/intake-questions";
import type { DomainId, DomainScores } from "@/lib/intake-engine";
import {
  getAdvice,
  getDeficiencySignals,
  getProfileLabel,
  getUrgency,
} from "@/lib/intake-engine";
import IntakeDisclaimer from "@/components/intake/IntakeDisclaimer";
import IntakeFeedback from "@/components/intake/IntakeFeedback";
import SupplementRoute from "@/components/intake/SupplementRoute";
import ScoreRing from "@/components/intake/ScoreRing";
import { getSupplementRoute } from "@/lib/getSupplementRoute";
import { revokeIntakeConsent, saveReminderEmail } from "@/lib/intake-storage";

const DOMAIN_SCORE_TO_CAT: Record<keyof DomainScores, CategoryId> = {
  sleep_score: "slaap",
  energy_score: "energie",
  stress_score: "stress",
  nutrition_score: "voeding",
  movement_score: "beweging",
  recovery_score: "herstel",
};

const PROFILE_DOMAIN_TO_CAT: Record<DomainId, CategoryId> = {
  sleep: "slaap",
  energy: "energie",
  stress: "stress",
  nutrition: "voeding",
  movement: "beweging",
  recovery: "herstel",
};

const DOMAIN_KEYS: (keyof DomainScores)[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
];

const REVOKE_CONFIRM =
  "Weet je het zeker? Je intake-antwoorden worden geanonimiseerd en kunnen niet worden hersteld.";

const REVOKE_SUCCESS =
  "Je toestemming is ingetrokken en je gegevens zijn geanonimiseerd.";

type IntakeResultsProps = {
  scores: DomainScores;
  answers: Record<string, number>;
  symptoms: SymptomId[];
  sessionId: string | null;
  onRestart?: () => void;
  /** Na succesvol intrekken van toestemming (serverdata geanonimiseerd). */
  onConsentRevoked?: () => void;
};

function isLooseEmailValid(value: string): boolean {
  const t = value.trim();
  return t.includes("@") && t.includes(".");
}

export default function IntakeResults({
  scores,
  answers,
  symptoms,
  sessionId,
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

  const urgency = getUrgency(scores);
  const profile = getProfileLabel(scores);
  const advice = getAdvice(scores, answers, symptoms);
  const quickWins = advice.quickWins.slice(0, 3);
  const longTermTips = advice.longTerm.slice(0, 3);
  const deficiencySignals = getDeficiencySignals(answers);
  const supplementRoute = getSupplementRoute(scores, deficiencySignals, profile);

  const primaryCatId = PROFILE_DOMAIN_TO_CAT[profile.domain];
  const primaryCategory = CATEGORIES.find((c) => c.id === primaryCatId);

  const sortedDomainEntries = [...DOMAIN_KEYS]
    .map((key) => ({
      key,
      score: scores[key],
      catId: DOMAIN_SCORE_TO_CAT[key],
    }))
    .sort((a, b) => a.score - b.score);

  const overall = Math.round(
    DOMAIN_KEYS.reduce((sum, k) => sum + scores[k], 0) / DOMAIN_KEYS.length,
  );

  return (
    <div
      className="px-6 pb-10 pt-8"
      style={{ maxWidth: 480, margin: "0 auto", boxSizing: "border-box", width: "100%" }}
    >
      <div className="mb-9 text-center">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[1.5px]"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Jouw Herstelplan
        </p>
        <h1
          className="mb-1.5 text-[30px] font-normal"
          style={{
            fontFamily: "var(--font-intake-heading), Georgia, serif",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {profile.name}
        </h1>
        <p className="mb-5 text-[15px]" style={{ color: "rgba(255,255,255,0.55)" }}>
          Je primaire aandachtsgebied is{" "}
          <strong style={{ color: primaryCategory?.color ?? "#C8956C" }}>
            {primaryCategory?.label ?? profile.domain}
          </strong>{" "}
          met een score van {profile.score}/100.
        </p>
        <div
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2"
          style={{
            background: `${urgency.color}15`,
            borderColor: `${urgency.color}30`,
          }}
        >
          <div
            className="h-2 w-2 rounded"
            style={{ background: urgency.color }}
          />
          <span
            className="text-[13px] font-semibold"
            style={{ color: urgency.color }}
          >
            {urgency.label}
          </span>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-[#e8e6e1] bg-white px-6 py-7 text-center">
        <div className="flex justify-center">
          <ScoreRing score={overall} size={96} stroke={6} color="#1a1a1a" />
        </div>
        <div className="mt-3 text-[13px] font-semibold tracking-wide text-[#999]">
          TOTAALSCORE
        </div>
      </div>

      <div className="mb-7 grid grid-cols-3 gap-2.5">
        {sortedDomainEntries.map(({ key, score, catId }) => {
          const cat = CATEGORIES.find((c) => c.id === catId);
          if (!cat) {
            return null;
          }
          return (
            <div
              key={key}
              className="rounded-[14px] bg-white px-3 py-5 text-center"
              style={{
                border: "1px solid #e8e6e1",
                borderLeft: `3px solid ${cat.color}`,
              }}
            >
              <div className="flex justify-center">
                <ScoreRing score={score} size={52} stroke={4} color={cat.color} />
              </div>
              <div className="mt-2 text-[11px] font-semibold tracking-wide text-[#888]">
                {cat.icon} {cat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-4 rounded-2xl border border-[#e8e6e1] bg-white p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5A8F6A18] text-base">
            ⚡
          </div>
          <div>
            <div className="text-[15px] font-bold">Quick Wins</div>
            <div className="text-xs text-[#999]">Start hier — deze week nog</div>
          </div>
        </div>
        {quickWins.map((tip, i) => (
          <div
            key={`qw-${i}`}
            className={`flex gap-3 py-3 ${i > 0 ? "border-t border-[#f0ede8]" : ""}`}
          >
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5A8F6A] text-xs font-bold text-white">
              {i + 1}
            </div>
            <p className="m-0 text-sm leading-normal text-[#444]">{tip}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-2xl border border-[#e8e6e1] bg-white p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C4873B18] text-base">
            💊
          </div>
          <div>
            <div className="text-[15px] font-bold">Jouw Supplementroute</div>
            <div className="text-xs text-[#999]">Gericht op jouw profiel</div>
          </div>
        </div>
        <SupplementRoute recommendations={supplementRoute} />
      </div>

      <div className="mb-7 rounded-2xl border border-[#e8e6e1] bg-white p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B6EAE18] text-base">
            📈
          </div>
          <div>
            <div className="text-[15px] font-bold">Langetermijnstrategie</div>
            <div className="text-xs text-[#999]">Maand 2 en verder</div>
          </div>
        </div>
        {longTermTips.map((tip, i) => (
          <div
            key={`lt-${i}`}
            className={`flex gap-3 py-3 ${i > 0 ? "border-t border-[#f0ede8]" : ""}`}
          >
            <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5B6EAE]" />
            <p className="m-0 text-sm leading-normal text-[#444]">{tip}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 rounded-2xl bg-[#1a1a1a] px-6 py-7 text-center">
        <div className="mb-1 text-[15px] font-semibold text-white">
          Over 30 dagen opnieuw meten?
        </div>
        <div className="mb-5 text-[13px] text-[#999]">
          Vergelijk je scores en zie wat er verbeterd is.
        </div>
        {emailSubmitted ? (
          <div className="flex flex-col items-center gap-2 text-[15px] leading-snug text-white">
            <span className="text-xl text-[#5A8F6A]" aria-hidden>
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
              className="box-border w-full max-w-full outline-none"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 10,
                border: "none",
                fontSize: 15,
                fontFamily: "inherit",
                background: "rgba(255,255,255,0.95)",
                color: "#1a1a1a",
                marginBottom: 12,
              }}
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
              className={`rounded-[10px] border-none bg-white px-8 py-3.5 text-sm font-bold text-[#1a1a1a] ${
                isLooseEmailValid(reminderEmail)
                  ? "cursor-pointer opacity-100"
                  : "cursor-default opacity-50"
              }`}
            >
              Herinnering instellen
            </button>
            <p className="mt-2 text-center text-[11px] text-[rgba(255,255,255,0.4)]">
              Alleen voor je herinnering. Geen spam, geen nieuwsbrief.
            </p>
          </>
        )}
      </div>

      <IntakeFeedback sessionId={sessionId} />

      <div className="mb-5">
        <IntakeDisclaimer />
        {sessionId ? (
          <div className="mt-5">
            {revokeFeedback ? (
              <p
                className={`mb-3 rounded-xl px-4 py-3 text-[13px] leading-snug ${
                  revokeFeedback.kind === "success"
                    ? "border border-[#c6e7d0] bg-[#f0fdf4] text-[#166534]"
                    : "border border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                }`}
                role={revokeFeedback.kind === "error" ? "alert" : "status"}
              >
                {revokeFeedback.text}
              </p>
            ) : null}
            {revokeFeedback?.kind !== "success" ? (
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
                className="w-full cursor-pointer rounded-xl py-3.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "inherit",
                }}
              >
                {revokeBusy ? "Bezig…" : "Toestemming intrekken"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {onRestart ? (
        <button
          type="button"
          onClick={onRestart}
          className="mb-5 w-full cursor-pointer rounded-xl py-3.5 text-[13px] font-medium"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "inherit",
          }}
        >
          Opnieuw beginnen
        </button>
      ) : null}

      <p className="text-center text-[11px] leading-normal text-[#bbb]">
        © 2026 PerfectSupplement
      </p>
    </div>
  );
}
