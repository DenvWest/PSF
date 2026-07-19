"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import EvidenceStars from "@/components/evidence/EvidenceStars";
import type { QuestionId } from "@/data/intake-questions";
import {
  LEEFSTIJLCHECK_EVIDENCE_BY_ID,
  type QuestionEvidence,
} from "@/data/leefstijlcheck-evidence";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

export function useIntakeEvidence(questionId: QuestionId) {
  const [open, setOpen] = useState(false);
  const tracked = useRef(false);
  const evidence = LEEFSTIJLCHECK_EVIDENCE_BY_ID[questionId];

  function toggle() {
    setOpen((current) => {
      const next = !current;
      if (next && !tracked.current) {
        tracked.current = true;
        trackEvent(GA4_EVENTS.INTAKE_EVIDENCE_EXPANDED, {
          question_id: questionId,
          surface: "intake",
        });
        clarityTag("intake_evidence", questionId);
      }
      return next;
    });
  }

  return { open, toggle, evidence };
}

type IntakeEvidenceTriggerProps = {
  open: boolean;
  onToggle: () => void;
  className?: string;
};

export function IntakeEvidenceTrigger({
  open,
  onToggle,
  className = "absolute right-0 top-0.5",
}: IntakeEvidenceTriggerProps) {
  return (
    <button
      type="button"
      aria-label="Waarom stellen we deze vraag?"
      aria-expanded={open}
      onClick={onToggle}
      className={[
        className,
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
        open
          ? "border-intake-terra/35 bg-intake-terra/8 text-intake-terra"
          : "border-intake-card-border/70 bg-intake-bg-elevated/50 font-serif text-[13px] text-intake-ink-subtle/65 hover:border-intake-terra/25 hover:text-intake-terra",
      ].join(" ")}
    >
      <span aria-hidden className="mt-px font-serif text-[15px] leading-none">
        ?
      </span>
    </button>
  );
}

type IntakeEvidencePanelProps = {
  evidence: QuestionEvidence;
  questionId: QuestionId;
  className?: string;
};

export function IntakeEvidencePanel({
  evidence,
  questionId,
  className = "mt-4 border-l-2 border-intake-terra/35 py-1 pl-4",
}: IntakeEvidencePanelProps) {
  return (
    <div className={className}>
      <p className="text-sm leading-relaxed text-intake-ink-muted">
        {evidence.whyThisQuestion}
      </p>
      <EvidenceStars
        stars={evidence.strength.stars}
        label={evidence.strength.label}
        className="mt-3 text-xs font-medium text-intake-ink-muted"
      />
      <Link
        href={`/onderbouwing#${questionId}`}
        className="mt-3 inline-block text-xs font-medium text-intake-terra underline decoration-intake-terra/35 underline-offset-[3px] hover:decoration-intake-terra"
      >
        Volledige onderbouwing →
      </Link>
    </div>
  );
}
