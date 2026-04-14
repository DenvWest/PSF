"use client";

import { useEffect, useState } from "react";
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
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        {/* 1. Label */}
        <p
          className="text-sm font-semibold uppercase"
          style={{ letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}
        >
          Leefstijlcheck
        </p>

        {/* 2. Titel */}
        <h1
          className="text-3xl font-normal leading-tight md:text-4xl"
          style={{
            fontFamily: "var(--font-intake-heading), Georgia, serif",
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "-0.01em",
          }}
        >
          Ontdek waar je staat
        </h1>

        {/* 3. Subtitel */}
        <p
          className="max-w-md text-lg leading-relaxed"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          We analyseren jouw leefstijl op zes domeinen — slaap, energie,
          stress, voeding, beweging en herstel — en geven je een persoonlijk
          plan om te verbeteren.
        </p>

        {/* 4. Stats-rij */}
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <span>12 vragen</span>
          <span aria-hidden>·</span>
          <span>3 minuten</span>
          <span aria-hidden>·</span>
          <span>geen account nodig</span>
        </div>

        {/* 5. CTA */}
        <button
          type="button"
          onClick={onStart}
          className="mt-8 cursor-pointer rounded-[14px] border border-white/30 bg-transparent px-12 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10"
          style={{ fontFamily: "inherit" }}
        >
          Start de intake →
        </button>

        {/* 6. Laatste-meting link */}
        {lastSession && onResumeLastResults ? (
          <button
            type="button"
            onClick={onResumeLastResults}
            style={{
              background: "none",
              border: "none",
              fontSize: 13,
              color: "rgba(255,255,255,0.35)",
              cursor: "pointer",
              textDecoration: "underline",
              textDecorationColor: "rgba(255,255,255,0.15)",
              textUnderlineOffset: 3,
              fontFamily: "inherit",
            }}
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

        {/* 7. Disclaimer */}
        <p
          className="mt-6 max-w-sm text-xs"
          style={{ color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}
        >
          Geen medisch advies. Geeft inzicht in leefstijlpatronen. Raadpleeg
          een arts bij klachten.
        </p>
      </div>
    </div>
  );
}
