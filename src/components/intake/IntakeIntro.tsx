"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FoundationPyramid from "@/components/pyramid/FoundationPyramid";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import {
  getLastSession,
  type IntakeSessionPayload,
} from "@/lib/intake-storage";

type IntakeIntroProps = {
  onStart: () => void;
  onResumeLastResults?: () => void;
};

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

        <h1
          className="font-serif text-3xl font-normal leading-tight text-intake-ink md:text-4xl"
          style={{ letterSpacing: "-0.01em" }}
        >
          Ontdek <em className="italic">waar</em> je staat
        </h1>

        <p className="max-w-md text-lg leading-relaxed text-intake-ink-muted">
          We analyseren jouw leefstijl op zes domeinen — slaap, energie,
          stress, voeding, beweging en herstel — en geven je een persoonlijk
          plan om te verbeteren.
        </p>

        <div className="my-4 w-full md:my-6">
          <FoundationPyramid mode="static" />
        </div>

        <div className="flex items-center gap-2 text-sm text-intake-ink-subtle">
          <span>15 vragen</span>
          <span aria-hidden>·</span>
          <span>3 minuten</span>
          <span aria-hidden>·</span>
          <span>geen account nodig</span>
        </div>

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
          className="mt-4 min-h-[44px] cursor-pointer rounded-[14px] bg-intake-terra px-12 py-4 text-base font-semibold text-intake-ink transition-all duration-200 hover:brightness-110"
        >
          Start de Leefstijlcheck →
        </button>

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
