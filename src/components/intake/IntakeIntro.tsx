"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/data/intake-questions";
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
    <div className="px-6 pt-14 pb-10 text-center">
      <p className="mb-4 text-[13px] font-semibold uppercase tracking-[2px] text-[#999]">
        PerfectSupplement
      </p>
      <h1
        className="mb-4 text-[32px] font-normal leading-tight text-[#1a1a1a]"
        style={{ fontFamily: "var(--font-intake-heading), Georgia, serif" }}
      >
        Ontdek waar je staat
      </h1>
      <p className="mx-auto mb-10 max-w-[340px] text-base leading-relaxed text-[#666]">
        Beantwoord 12 korte vragen over je leefstijl. Na 3 minuten weet je
        precies waar je kunt verbeteren — en hoe.
      </p>
      <div className="mb-12 flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-1.5 rounded-[10px] border border-[#e8e6e1] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#555]"
          >
            <span>{c.icon}</span>
            {c.label}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onStart}
        className="cursor-pointer rounded-[14px] border-none bg-[#1a1a1a] px-12 py-[18px] text-base font-semibold text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(0,0,0,0.2)]"
      >
        Start de intake →
      </button>
      {lastSession && onResumeLastResults ? (
        <button
          type="button"
          onClick={onResumeLastResults}
          className="mt-5 text-[13px] font-medium text-[#888] underline decoration-[#d8d4cd] underline-offset-2 transition-colors hover:text-[#666]"
        >
          Je laatste meting was op{" "}
          {new Date(lastSession.timestamp).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          . Bekijk resultaten →
        </button>
      ) : null}
      <p className="mt-4 text-xs text-[#aaa]">
        Duurt ± 3 minuten · geen account nodig
      </p>
    </div>
  );
}
