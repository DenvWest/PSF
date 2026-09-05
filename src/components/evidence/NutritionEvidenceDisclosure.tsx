"use client";

import Link from "next/link";
import { useRef } from "react";
import type {
  NutritionQuestionEvidence,
  NutritionQuestionId,
} from "@/data/nutrition/nutrition-question-evidence";
import { NUTRITION_EVIDENCE_BY_ID } from "@/data/nutrition/nutrition-question-evidence";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { withNutritionReturn } from "@/lib/nutrition-return-link";

interface NutritionEvidenceDisclosureProps {
  evidence: NutritionQuestionEvidence;
  secondaryQuestionIds?: NutritionQuestionId[];
  surface: "result" | "onderbouwing";
  contextId: string;
  from?: string;
  summaryLabel?: string;
  className?: string;
}

export default function NutritionEvidenceDisclosure({
  evidence,
  secondaryQuestionIds = [],
  surface,
  contextId,
  from = "direct",
  summaryLabel = "Waarom dit telt",
  className = "group mt-3 rounded-[12px] border border-white/10 bg-black/20",
}: NutritionEvidenceDisclosureProps) {
  const tracked = useRef(false);

  function handleToggle(event: React.SyntheticEvent<HTMLDetailsElement>) {
    const open = (event.currentTarget as HTMLDetailsElement).open;
    if (!open || tracked.current) {
      return;
    }
    tracked.current = true;
    trackEvent(GA4_EVENTS.NUTRITION_EVIDENCE_EXPANDED, {
      surface,
      context_id: contextId,
      from,
    });
    clarityTag("nutrition_depth", "expanded");
    clarityTag("nutrition_evidence", contextId);
  }

  const rationalePreview = evidence.scientificRationale.slice(0, 3);

  return (
    <details className={className} onToggle={handleToggle}>
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-[#9CC5A9] [&::-webkit-details-marker]:hidden">
        {summaryLabel}
      </summary>
      <div className="space-y-3 border-t border-white/10 px-4 pb-4 pt-3">
        <p className="text-sm leading-relaxed text-[#C6D1C9]">
          {evidence.whyThisQuestion}
        </p>
        <ul className="space-y-1 text-sm leading-relaxed text-[#C6D1C9]">
          {rationalePreview.map((line) => (
            <li key={line}>- {line}</li>
          ))}
        </ul>
        {secondaryQuestionIds.length > 0 ? (
          <p className="text-xs leading-relaxed text-[#7E8C82]">
            Ook relevant:{" "}
            {secondaryQuestionIds
              .map((id) => NUTRITION_EVIDENCE_BY_ID[id].title)
              .join(", ")}
          </p>
        ) : null}
        <Link
          href={withNutritionReturn(
            `/onderbouwing/voeding#${evidence.questionId}`,
            from === "dashboard" ? "dashboard" : undefined,
          )}
          className="inline-block text-xs font-medium text-[#9CC5A9] underline decoration-[#9CC5A9]/35 underline-offset-[3px] hover:decoration-[#9CC5A9]"
        >
          Volledige onderbouwing →
        </Link>
      </div>
    </details>
  );
}
