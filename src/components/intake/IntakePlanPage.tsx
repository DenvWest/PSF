"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LifestylePlan from "@/components/intake/LifestylePlan";
import IntakeLayoutActions from "@/components/intake/IntakeLayoutActions";
import { IntakeResultsReturnBanner } from "@/components/intake/IntakeResultsReturnBanner";
import {
  getPlanTemplate,
  type PlanTemplateDomain,
} from "@/data/lifestyle-plans";
import type { DomainScores } from "@/lib/intake-engine";
import { getPrimaryTheme, getSecondaryTheme } from "@/lib/primary-theme";

type IntakePlanPageProps = {
  domain: PlanTemplateDomain;
};

const planHeaderActions = <IntakeLayoutActions />;

export default function IntakePlanPage({ domain }: IntakePlanPageProps) {
  const router = useRouter();
  const template = getPlanTemplate(domain);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scores, setScores] = useState<DomainScores | null>(null);
  const [answers, setAnswers] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/intake/session", {
          credentials: "include",
          cache: "no-store",
        });
        const json = (await response.json().catch(() => null)) as {
          session?: {
            sessionId: string;
            scores: DomainScores;
            answers: Record<string, number>;
          } | null;
        } | null;

        if (cancelled) {
          return;
        }

        if (!json?.session) {
          router.replace("/intake");
          return;
        }

        setSessionId(json.session.sessionId);
        setScores(json.session.scores);
        setAnswers(json.session.answers);
      } catch {
        if (!cancelled) {
          router.replace("/intake");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!template) {
    return null;
  }

  if (loading || !scores || !answers) {
    return (
      <div className="mx-auto w-full max-w-[480px] px-6 pb-10 pt-3">
        <header className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-terra">
              Jouw leefstijlplan
            </p>
            <div className="h-7 w-48 animate-pulse rounded bg-white/5" aria-hidden />
          </div>
          <div className="shrink-0 pt-0.5">{planHeaderActions}</div>
        </header>
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-intake-ink-subtle">Plan laden…</p>
        </div>
      </div>
    );
  }

  const primaryTheme = getPrimaryTheme(scores, answers);
  const secondaryTheme = getSecondaryTheme(scores, answers, primaryTheme);

  return (
    <div className="mx-auto w-full max-w-[480px] px-6 pb-10 pt-3">
      <IntakeResultsReturnBanner />
      <LifestylePlan
        template={template}
        scores={scores}
        answers={answers}
        sessionId={sessionId}
        secondaryTheme={secondaryTheme}
        headerActions={planHeaderActions}
      />
    </div>
  );
}
