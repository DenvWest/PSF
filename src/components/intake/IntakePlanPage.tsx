"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LifestylePlan from "@/components/intake/LifestylePlan";
import IntakeLayoutActions from "@/components/intake/IntakeLayoutActions";
import { IntakeResultsReturnBanner } from "@/components/intake/IntakeResultsReturnBanner";
import {
  getPlanTemplate,
  type PlanTemplateDomain,
} from "@/data/lifestyle-plans";
import type { DomainScores } from "@/lib/intake-engine";
import { getLastSession } from "@/lib/intake-storage";
import { getPrimaryTheme, getSecondaryTheme } from "@/lib/primary-theme";

type IntakePlanPageProps = {
  domain: PlanTemplateDomain;
};

const planHeaderActions = (
  <Suspense fallback={null}>
    <IntakeLayoutActions />
  </Suspense>
);

function DashboardPlanLoadingSkeleton() {
  return (
    <div className="ps-dark mx-auto w-full max-w-5xl px-4 pb-12 pt-2 sm:px-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
            Jouw stappenplan · beweging
          </p>
          <div className="h-8 w-56 animate-pulse rounded bg-white/10" aria-hidden />
        </div>
      </header>
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-[#9FB0A6]">Plan laden…</p>
      </div>
    </div>
  );
}

function IntakePlanLoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-10 pt-3">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-terra">
            Jouw stappenplan
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

function IntakePlanPageContent({ domain }: IntakePlanPageProps) {
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
        const loaded = await getLastSession();
        const session = loaded?.session;

        if (cancelled) {
          return;
        }

        if (!session) {
          router.replace("/intake");
          return;
        }

        setSessionId(session.sessionId);
        setScores(session.scores);
        setAnswers(session.answers);
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
    return domain === "movement" ? <DashboardPlanLoadingSkeleton /> : <IntakePlanLoadingSkeleton />;
  }

  const secondaryTheme = getSecondaryTheme(
    scores,
    answers,
    getPrimaryTheme(scores, answers),
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-10 pt-3">
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

export default function IntakePlanPage({ domain }: IntakePlanPageProps) {
  return (
    <Suspense
      fallback={
        domain === "movement" ? (
          <DashboardPlanLoadingSkeleton />
        ) : (
          <IntakePlanLoadingSkeleton />
        )
      }
    >
      <IntakePlanPageContent domain={domain} />
    </Suspense>
  );
}
