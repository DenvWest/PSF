"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { NUTRITION_RELOG_DAYS } from "@/lib/nutrition-relog-eligibility";

type NutritionRelogNudgeProps = {
  surface: string;
  daysSinceLog: number;
  tone?: "light" | "dark";
};

export default function NutritionRelogNudge({
  surface,
  daysSinceLog,
  tone = "dark",
}: NutritionRelogNudgeProps) {
  const shownRef = useRef(false);
  const href = "/intake/voeding?from=dashboard&kompas=voeding";

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("dashboard_voeding_relog_nudge_shown", {
      surface,
      days_since_log: daysSinceLog,
    });
    clarityTag("dashboard_voeding_relog", `${surface}_shown`);
  }, [surface, daysSinceLog]);

  const handleClick = () => {
    trackEvent("dashboard_voeding_relog_nudge_click", {
      surface,
      days_since_log: daysSinceLog,
    });
    clarityTag("dashboard_voeding_relog", surface);
  };

  const isDark = tone === "dark";

  return (
    <div
      className={`rounded-xl border px-4 py-3.5 ${
        isDark
          ? "border-[#C8956C]/35 bg-[#C8956C]/10"
          : "border-[#C8956C]/30 bg-[#C8956C]/[0.08]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
            isDark ? "border-[#C8956C]/30 bg-black/20 text-[#C8956C]" : "border-[#C8956C]/25 bg-white text-[#B07F52]"
          }`}
        >
          <Icons.Refresh s={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`m-0 font-serif text-[17px] leading-snug ${
              isDark ? "text-[#F1EFE8]" : "text-[#1c1917]"
            }`}
          >
            Tijd om opnieuw te loggen
          </p>
          <p
            className={`mt-1.5 mb-0 text-[13px] leading-relaxed text-pretty ${
              isDark ? "text-[#CDD7D0]" : "text-[#57534e]"
            }`}
          >
            Je laatste check is {daysSinceLog} dagen geleden. Log opnieuw in één minuut — dan zie
            je of je weekpatroon de goede kant op beweegt. Geen dagboek, wel delta.
          </p>
          <Link
            href={href}
            onClick={handleClick}
            className={`mt-3 inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold no-underline ${
              isDark ? "text-[#5A8F6A]" : "text-[#5A8F6A]"
            }`}
          >
            Log je voeding opnieuw ({NUTRITION_RELOG_DAYS}d-ritueel)
            <Icons.ArrowRight s={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
