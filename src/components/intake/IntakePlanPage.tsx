"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LifestylePlan from "@/components/intake/LifestylePlan";
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
      <div className="flex min-h-[50vh] items-center justify-center px-6 py-12">
        <p className="text-sm text-intake-ink-subtle">Plan laden…</p>
      </div>
    );
  }

  const primaryTheme = getPrimaryTheme(scores, answers);
  const secondaryTheme = getSecondaryTheme(scores, answers, primaryTheme);

  return (
    <div className="mx-auto w-full max-w-[480px] px-6 pb-10 pt-4">
      <IntakeResultsReturnBanner />
      <LifestylePlan
        template={template}
        scores={scores}
        answers={answers}
        sessionId={sessionId}
        secondaryTheme={secondaryTheme}
      />
    </div>
  );
}
