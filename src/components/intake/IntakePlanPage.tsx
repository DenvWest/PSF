"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MovementPlanConfigurator from "@/components/dashboard/beweging/MovementPlanConfigurator";
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

function IntakePlanPageContent({ domain }: IntakePlanPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromDashboard = searchParams.get("from") === "dashboard";
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

  if (domain === "movement" && fromDashboard) {
    return (
      <MovementPlanConfigurator
        scores={scores}
        answers={answers}
        sessionId={sessionId}
      />
    );
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
        <div className="mx-auto w-full max-w-3xl px-6 pb-10 pt-3">
          <p className="text-sm text-intake-ink-subtle">Plan laden…</p>
        </div>
      }
    >
      <IntakePlanPageContent domain={domain} />
    </Suspense>
  );
}
