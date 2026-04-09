"use client";

import Link from "next/link";
import type { SymptomId } from "@/data/intake-questions";
import { CATEGORIES, type CategoryId } from "@/data/intake-questions";
import type { DomainId, DomainScores } from "@/lib/intake-engine";
import {
  getAdvice,
  getProfileLabel,
  getUrgency,
} from "@/lib/intake-engine";
import ScoreRing from "@/components/intake/ScoreRing";

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

type IntakeResultsProps = {
  scores: DomainScores;
  answers: Record<string, number>;
  symptoms: SymptomId[];
  onRestart?: () => void;
};

export default function IntakeResults({
  scores,
  answers,
  symptoms,
  onRestart,
}: IntakeResultsProps) {
  const urgency = getUrgency(scores);
  const profile = getProfileLabel(scores);
  const advice = getAdvice(scores, answers, symptoms);

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

  const supplementsEmpty = advice.supplements.length === 0;

  return (
    <div className="px-6 pb-10 pt-8">
      <div className="mb-9 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#999]">
          Jouw Herstelplan
        </p>
        <h1
          className="mb-1.5 text-[30px] font-normal text-[#1a1a1a]"
          style={{ fontFamily: "var(--font-intake-heading), Georgia, serif" }}
        >
          {profile.name}
        </h1>
        <p className="mb-5 text-[15px] text-[#777]">
          Je primaire aandachtsgebied is{" "}
          <strong style={{ color: primaryCategory?.color ?? "#1a1a1a" }}>
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
        {advice.quickWins.map((tip, i) => (
          <div
            key={tip}
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
            <div className="text-[15px] font-bold">Supplementroute</div>
            <div className="text-xs text-[#999]">Gericht op jouw profiel</div>
          </div>
        </div>
        {supplementsEmpty ? (
          <div className="rounded-[10px] bg-[#FAFAF7] px-4 py-3.5">
            <div className="mb-1 text-[15px] font-bold text-[#1a1a1a]">
              Geen specifieke supplementaanbeveling
            </div>
            <p className="m-0 text-[13px] leading-relaxed text-[#777]">
              Op basis van je antwoorden is er geen gerichte
              supplementroute nodig. Focus op je leefstijl en herhaal de
              intake later om te zien of dat verandert.
            </p>
          </div>
        ) : (
          advice.supplements.map((sup, i) => (
            <div
              key={`${sup.name}-${i}`}
              className={`rounded-[10px] bg-[#FAFAF7] px-4 py-3.5 ${i < advice.supplements.length - 1 ? "mb-2" : ""}`}
            >
              <div className="mb-1 text-[15px] font-bold text-[#1a1a1a]">
                {sup.name}
              </div>
              <div className="text-[13px] leading-relaxed text-[#777]">
                {sup.reason}
              </div>
              {sup.link ? (
                <Link
                  href={sup.link}
                  className="mt-1.5 inline-block text-xs font-semibold text-[#C4873B]"
                >
                  Bekijk vergelijking →
                </Link>
              ) : null}
            </div>
          ))
        )}
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
        {advice.longTerm.map((tip, i) => (
          <div
            key={tip}
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
        <button
          type="button"
          className="cursor-pointer rounded-[10px] border-none bg-white px-8 py-3.5 text-sm font-bold text-[#1a1a1a]"
        >
          Herinnering instellen
        </button>
      </div>

      {onRestart ? (
        <button
          type="button"
          onClick={onRestart}
          className="mb-5 w-full cursor-pointer rounded-xl border border-[#e0ddd7] bg-transparent py-3.5 text-[13px] font-medium text-[#999]"
        >
          Opnieuw beginnen
        </button>
      ) : null}

      <p className="text-center text-[11px] leading-normal text-[#bbb]">
        Dit is geen medisch advies. Raadpleeg een arts bij klachten.
        <br />
        © 2026 PerfectSupplement
      </p>
    </div>
  );
}
