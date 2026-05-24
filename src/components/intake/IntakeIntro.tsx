"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import IntakeResultPreviewCard from "@/components/intake/IntakeResultPreviewCard";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import {
  getLastSession,
  type IntakeSessionPayload,
} from "@/lib/intake-storage";

type IntakeIntroProps = {
  onStart: () => void;
  onResumeLastResults?: () => void;
};

const THRESHOLD_ITEMS = [
  "3 minuten",
  "Geen account",
  "Geen e-mail verplicht",
] as const;

export default function IntakeIntro({
  onStart,
  onResumeLastResults,
}: IntakeIntroProps) {
  const [lastSession, setLastSession] = useState<IntakeSessionPayload | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void getLastSession().then((session) => {
      if (!cancelled) {
        setLastSession(session);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex w-full max-w-lg flex-col items-center gap-8 md:gap-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-intake-ink-subtle">
          <span className="text-intake-terra">01</span> · Leefstijlcheck
        </p>

        <div className="flex flex-col gap-4">
          <h1
            className="font-serif text-3xl font-normal leading-tight text-intake-ink md:text-4xl"
            style={{ letterSpacing: "-0.01em" }}
          >
            Moe, wazig of altijd <em className="italic">aan</em>?
          </h1>

          <p className="mx-auto max-w-md text-lg leading-relaxed text-intake-ink-muted">
            In 3 minuten krijg je een helder beeld van waar je leefstijl staat —
            en wat je deze week kunt doen.
          </p>
        </div>

        <IntakeResultPreviewCard />

        <details className="max-w-md text-left text-xs leading-relaxed text-intake-ink-subtle">
          <summary className="cursor-pointer list-none text-center text-intake-ink-muted [&::-webkit-details-marker]:hidden">
            Wat doen we met je antwoorden?
          </summary>
          <ul className="mt-3 space-y-2 pl-4">
            <li>Je antwoorden zijn gezondheidsgegevens (AVG art. 9).</li>
            <li>
              We slaan ze pas op nadat je aan het einde expliciet toestemming
              geeft.
            </li>
            <li>Je kunt je toestemming op elk moment intrekken.</li>
            <li>
              Meer in onze{" "}
              <Link
                href="/privacy"
                className="text-intake-ink-muted underline underline-offset-[3px] hover:text-intake-ink"
              >
                privacyverklaring
              </Link>
              .
            </li>
          </ul>
        </details>

        <button
          type="button"
          onClick={onStart}
          className="min-h-[44px] w-full max-w-sm cursor-pointer rounded-[14px] bg-intake-terra px-12 py-4 text-base font-semibold text-intake-ink transition-all duration-200 hover:brightness-110"
        >
          Start de Leefstijlcheck →
        </button>

        <ul className="flex flex-col items-center gap-2 text-sm text-intake-ink-subtle sm:flex-row sm:gap-4">
          {THRESHOLD_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span
                className="text-intake-sage"
                aria-hidden
              >
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {lastSession && onResumeLastResults ? (
          <button
            type="button"
            onClick={onResumeLastResults}
            className="cursor-pointer border-none bg-transparent text-[13px] text-intake-ink-subtle underline underline-offset-[3px] decoration-intake-divider hover:text-intake-ink-muted"
          >
            Laatste meting:{" "}
            {new Date(lastSession.timestamp).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            — bekijk resultaten →
          </button>
        ) : null}

        <MedicalDisclaimer variant="intake" theme="dark" />
      </div>
    </div>
  );
}
