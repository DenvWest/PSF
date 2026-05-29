"use client";

import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import IntakeCalculating from "@/components/intake/IntakeCalculating";
import IntakeConsent from "@/components/intake/IntakeConsent";
import IntakeIntro from "@/components/intake/IntakeIntro";
import IntakeQuestion from "@/components/intake/IntakeQuestion";
import IntakeFocus from "@/components/intake/IntakeFocus";
import IntakePlan from "@/components/intake/IntakePlan";
import IntakeRecognition from "@/components/intake/IntakeRecognition";
import IntakeResults from "@/components/intake/IntakeResults";
import IntakeSymptoms from "@/components/intake/IntakeSymptoms";
import type { ThemeSlug } from "@/lib/content/themes";
import { getPrimaryTheme, getSecondaryTheme } from "@/lib/primary-theme";
import {
  CATEGORIES,
  QUESTIONS,
  type IntakeAgeRange,
  type SymptomId,
} from "@/data/intake-questions";
import type { DomainScores } from "@/lib/intake-engine";
import { calcDomainScores } from "@/lib/intake-engine";
import {
  normalizeFirstName,
  type IntakeConsentPayload,
} from "@/lib/intake-consent";
import {
  getLastSession,
  saveIntakeSession,
  type IntakeSessionPayload,
} from "@/lib/intake-storage";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-intake-body",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-intake-heading",
  display: "swap",
});

type Phase =
  | "intro"
  | "symptoms"
  | "questions"
  | "consent"
  | "calculating"
  | "results"
  | "recognition"
  | "focus"
  | "plan";

export default function IntakeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasResultsParam = searchParams.get("resultaten") === "true";

  const [phase, setPhase] = useState<Phase>("intro");
  const [firstName, setFirstName] = useState("");
  const [ageRange, setAgeRange] = useState<IntakeAgeRange | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomId[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [answeredIndices, setAnsweredIndices] = useState<
    Record<string, number>
  >({});
  const [scores, setScores] = useState<DomainScores | null>(null);
  const [sessionTimestamp, setSessionTimestamp] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const calculatingStartedAtRef = useRef(0);
  const [intakeTurnstileToken, setIntakeTurnstileToken] = useState("");
  const [honeypotWebsite, setHoneypotWebsite] = useState("");
  const [intakeConsent, setIntakeConsent] = useState<IntakeConsentPayload | null>(
    null,
  );
  // Toon een laadscherm alleen als de gebruiker via de mail-link (?resultaten=true) binnenkomt.
  // Zonder die param: intro direct zichtbaar, sessie wordt stil op de achtergrond gecheckt.
  const [isCheckingSession, setIsCheckingSession] = useState(hasResultsParam);
  const [resultsDeepLinkMissing, setResultsDeepLinkMissing] = useState(false);
  const pendingScrollToTipsRef = useRef(false);
  const pendingScrollToCommitmentRef = useRef(false);
  const [planJourneyReady, setPlanJourneyReady] = useState(false);
  // Override voor de stepped-care template wanneer de gebruiker een secundair
  // thema kiest op REVEAL. null => primair thema uit getPrimaryTheme.
  const [themeOverride, setThemeOverride] = useState<ThemeSlug | null>(null);

  function hydrateFromSession(session: IntakeSessionPayload) {
    setSymptoms(session.symptoms as SymptomId[]);
    setAgeRange(session.ageRange);
    setAnswers(session.answers);
    setScores(session.scores);
    setSessionTimestamp(session.timestamp);
    setSessionId(session.sessionId);
    setFirstName(session.firstName ?? "");
    setAnsweredIndices({});
    setPhase("results");
    setResultsDeepLinkMissing(false);
  }

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (hasResultsParam) {
        setIsCheckingSession(true);
        setResultsDeepLinkMissing(false);
      } else {
        setResultsDeepLinkMissing(false);
      }

      try {
        const session = await getLastSession();
        if (cancelled) return;

        if (session && hasResultsParam) {
          hydrateFromSession(session);
        } else if (!session && hasResultsParam) {
          setResultsDeepLinkMissing(true);
        }
      } catch {
        if (hasResultsParam) {
          setResultsDeepLinkMissing(true);
        }
      } finally {
        if (!cancelled && hasResultsParam) {
          setIsCheckingSession(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasResultsParam]);

  useEffect(() => {
    if (
      (phase === "results" ||
        phase === "recognition" ||
        phase === "focus" ||
        phase === "plan") &&
      !hasResultsParam
    ) {
      router.replace("/intake?resultaten=true", { scroll: false });
    }
  }, [phase, hasResultsParam, router]);

  useEffect(() => {
    if (!scores) {
      return;
    }

    const themeSlug = themeOverride ?? getPrimaryTheme(scores, answers);
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(
          `/api/intake/journey-ready?theme_slug=${encodeURIComponent(themeSlug)}`,
        );
        if (!response.ok || cancelled) {
          if (!cancelled) {
            setPlanJourneyReady(false);
          }
          return;
        }
        const payload = (await response.json()) as { ready?: boolean };
        if (!cancelled) {
          setPlanJourneyReady(payload.ready === true);
        }
      } catch {
        if (!cancelled) {
          setPlanJourneyReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scores, answers, themeOverride]);

  useEffect(() => {
    if (phase !== "results") {
      return;
    }
    if (pendingScrollToCommitmentRef.current) {
      pendingScrollToCommitmentRef.current = false;
      const timer = window.setTimeout(() => {
        document.getElementById("commitment")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
      return () => window.clearTimeout(timer);
    }
    if (!pendingScrollToTipsRef.current) {
      return;
    }
    pendingScrollToTipsRef.current = false;
    const timer = window.setTimeout(() => {
      document.getElementById("tips")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "calculating") {
      return;
    }

    const computed = calcDomainScores(answers);
    const ts = Date.now();
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

    if (ageRange === null) {
      const timer = window.setTimeout(() => {
        setScores(computed);
        setSessionTimestamp(ts);
        setSessionId(null);
        setPhase("results");
      }, 2000);
      return () => window.clearTimeout(timer);
    }

    if (!turnstileSiteKey) {
      const timer = window.setTimeout(() => {
        setScores(computed);
        setSessionTimestamp(ts);
        setSessionId(null);
        setPhase("results");
      }, 2000);
      return () => window.clearTimeout(timer);
    }

    if (!intakeTurnstileToken) {
      return;
    }

    if (!intakeConsent) {
      return;
    }

    let cancelled = false;
    const start = calculatingStartedAtRef.current;

    void (async () => {
      const wait = Math.max(0, 2000 - (Date.now() - start));
      if (wait > 0) {
        await new Promise((r) => setTimeout(r, wait));
      }
      if (cancelled) {
        return;
      }
      const id = await saveIntakeSession({
        symptoms,
        answers,
        ageRange,
        turnstileToken: intakeTurnstileToken,
        website: honeypotWebsite,
        consent: intakeConsent,
      });
      if (cancelled) {
        return;
      }

      const savedEmail = intakeConsent.marketingEmailAddress;
      if (savedEmail) {
        try {
          sessionStorage.setItem("ps_contact_email", savedEmail);
        } catch {
          // sessionStorage niet beschikbaar
        }
      }

      setScores(computed);
      setSessionTimestamp(ts);
      setSessionId(id);
      setPhase("results");
    })();

    return () => {
      cancelled = true;
    };
  }, [
    phase,
    answers,
    symptoms,
    ageRange,
    intakeTurnstileToken,
    honeypotWebsite,
    intakeConsent,
  ]);

  function toggleSymptom(id: SymptomId) {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function handleAnswer(value: number, optionIndex: number) {
    const q = QUESTIONS[currentQ];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    setAnsweredIndices((prev) => ({ ...prev, [q.id]: optionIndex }));
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      setPhase("consent");
    }
  }

  function handleConsentContinue(
    payload: Omit<IntakeConsentPayload, "firstName">,
  ) {
    setIntakeConsent({
      ...payload,
      firstName: normalizeFirstName(firstName),
    });
    calculatingStartedAtRef.current = Date.now();
    setIntakeTurnstileToken("");
    setPhase("calculating");
  }

  function goToQuestions() {
    setCurrentQ(0);
    setAnswers({});
    setAnsweredIndices({});
    setIntakeConsent(null);
    setPhase("questions");
  }

  function handleBack() {
    if (phase === "consent") {
      setCurrentQ(QUESTIONS.length - 1);
      setPhase("questions");
      return;
    }
    if (phase === "questions") {
      if (currentQ > 0) {
        setCurrentQ((c) => c - 1);
      } else {
        setPhase("symptoms");
      }
      return;
    }
    if (phase === "symptoms") {
      setPhase("intro");
    }
  }

  function restart() {
    setPhase("intro");
    setFirstName("");
    setAgeRange(null);
    setSymptoms([]);
    setCurrentQ(0);
    setAnswers({});
    setAnsweredIndices({});
    setScores(null);
    setSessionTimestamp(null);
    setSessionId(null);
    setHoneypotWebsite("");
    setIntakeTurnstileToken("");
    setIntakeConsent(null);
    setResultsDeepLinkMissing(false);
    setPlanJourneyReady(false);
    setThemeOverride(null);
    router.replace("/intake");
  }

  function exitResultsDeepLinkFallback() {
    setResultsDeepLinkMissing(false);
    restart();
    router.replace("/intake");
  }

  const currentQuestion = QUESTIONS[currentQ];
  const currentCategory = currentQuestion
    ? CATEGORIES.find((c) => c.id === currentQuestion.category)
    : undefined;

  const primaryTheme = scores ? getPrimaryTheme(scores, answers) : null;
  const resolvedTheme: ThemeSlug | null = themeOverride ?? primaryTheme;

  const shellClass = `${dmSans.variable} ${dmSerifDisplay.variable} mx-auto w-full max-w-[480px]`;

  const showResultsDeepLinkFallback =
    !isCheckingSession && hasResultsParam && resultsDeepLinkMissing;

  const shellStyle: CSSProperties = {
    fontFamily: "var(--font-intake-body), system-ui, sans-serif",
    color: "rgba(255,255,255,0.9)",
  };

  return (
    <div className={shellClass} style={shellStyle}>
      {isCheckingSession && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80"
            role="status"
            aria-label="Laden"
          />
          <span className="text-sm text-white/60">Laden&hellip;</span>
        </div>
      )}

      {showResultsDeepLinkFallback && (
        <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 py-12 text-center animate-[fadeIn_300ms_ease-out]">
          <div className="flex w-full max-w-lg flex-col items-center gap-6">
            <h1
              className="text-2xl font-normal leading-tight md:text-3xl"
              style={{
                fontFamily: "var(--font-intake-heading), Georgia, serif",
                color: "rgba(255,255,255,0.95)",
              }}
            >
              Resultaten niet beschikbaar
            </h1>
            <p
              className="max-w-md text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Sessie verlopen of niet gevonden — vul de intake opnieuw in.
            </p>
            <button
              type="button"
              onClick={exitResultsDeepLinkFallback}
              className="mt-2 cursor-pointer rounded-[14px] border border-white/30 bg-transparent px-10 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10"
              style={{ fontFamily: "inherit" }}
            >
              Naar de intake
            </button>
          </div>
        </div>
      )}

      {!isCheckingSession &&
        phase === "intro" &&
        !showResultsDeepLinkFallback && (
        <div className="animate-[fadeIn_300ms_ease-out]">
          <IntakeIntro
            onStart={() => setPhase("symptoms")}
          />
        </div>
      )}

      {phase === "symptoms" && (
        <div className="animate-[fadeIn_300ms_ease-out]">
          <IntakeSymptoms
            firstName={firstName}
            onFirstNameChange={setFirstName}
            ageRange={ageRange}
            onAgeRangeChange={setAgeRange}
            symptoms={symptoms}
            onToggle={toggleSymptom}
            onNext={goToQuestions}
            onBack={handleBack}
            honeypotWebsite={honeypotWebsite}
            onHoneypotWebsiteChange={setHoneypotWebsite}
          />
        </div>
      )}

      {phase === "consent" && (
        <div className="animate-[fadeIn_300ms_ease-out]">
          <IntakeConsent
            onContinue={handleConsentContinue}
            onBack={handleBack}
          />
        </div>
      )}

      {phase === "questions" && currentQuestion && currentCategory && (
        <div className="animate-[fadeIn_300ms_ease-out]">
          <IntakeQuestion
            question={currentQuestion}
            category={currentCategory}
            currentIndex={currentQ}
            total={QUESTIONS.length}
            savedOptionIndex={answeredIndices[currentQuestion.id]}
            onAnswer={handleAnswer}
            onBack={handleBack}
          />
        </div>
      )}

      {phase === "calculating" && (
        <div className="animate-[fadeIn_300ms_ease-out]">
          <IntakeCalculating
            needsHumanVerification={ageRange !== null}
            onTurnstileToken={setIntakeTurnstileToken}
          />
        </div>
      )}

      {phase === "results" && scores && sessionTimestamp !== null && (
        <div className="animate-[fadeIn_300ms_ease-out]">
          <IntakeResults
            scores={scores}
            answers={answers}
            symptoms={symptoms}
            sessionId={sessionId}
            firstName={normalizeFirstName(firstName)}
            hasMarketingEmail={Boolean(
              intakeConsent?.marketingEmail && intakeConsent?.marketingEmailAddress,
            )}
            hideLegacyPlanSections={Boolean(scores && planJourneyReady)}
            secondaryTheme={
              scores && primaryTheme
                ? getSecondaryTheme(scores, answers, primaryTheme)
                : null
            }
            onSelectSecondaryTheme={(theme) => {
              setThemeOverride(theme as ThemeSlug);
              setPhase("recognition");
            }}
            onContinueToRecognition={() => {
              setThemeOverride(null);
              setPhase("recognition");
            }}
            onRestart={restart}
            onConsentRevoked={restart}
          />
        </div>
      )}

      {phase === "recognition" && scores && resolvedTheme && (
        <div className="animate-[fadeIn_300ms_ease-out]">
          <IntakeRecognition
            themeSlug={resolvedTheme}
            answers={answers}
            onBack={() => setPhase("results")}
            onContinue={() => setPhase("focus")}
          />
        </div>
      )}

      {phase === "focus" && scores && resolvedTheme && (
        <div className="animate-[fadeIn_300ms_ease-out]">
          <IntakeFocus
            themeSlug={resolvedTheme}
            onBack={() => setPhase("recognition")}
            onContinue={() => {
              if (scores && planJourneyReady) {
                setPhase("plan");
                return;
              }
              pendingScrollToTipsRef.current = true;
              setPhase("results");
            }}
          />
        </div>
      )}

      {phase === "plan" && scores && resolvedTheme && (
        <div className="animate-[fadeIn_300ms_ease-out]">
          <IntakePlan
            themeSlug={resolvedTheme}
            answers={answers}
            onBack={() => setPhase("focus")}
            onCommitment={() => {
              pendingScrollToCommitmentRef.current = true;
              setPhase("results");
            }}
          />
        </div>
      )}
    </div>
  );
}
