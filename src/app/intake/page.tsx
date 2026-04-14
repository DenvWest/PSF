"use client";

import { DM_Sans, DM_Serif_Display } from "next/font/google";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import IntakeCalculating from "@/components/intake/IntakeCalculating";
import IntakeConsent from "@/components/intake/IntakeConsent";
import IntakeIntro from "@/components/intake/IntakeIntro";
import IntakeQuestion from "@/components/intake/IntakeQuestion";
import IntakeResults from "@/components/intake/IntakeResults";
import IntakeSymptoms from "@/components/intake/IntakeSymptoms";
import {
  CATEGORIES,
  QUESTIONS,
  type IntakeAgeRange,
  type SymptomId,
} from "@/data/intake-questions";
import type { DomainScores } from "@/lib/intake-engine";
import { calcDomainScores } from "@/lib/intake-engine";
import type { IntakeConsentPayload } from "@/lib/intake-consent";
import { getLastSession, saveIntakeSession } from "@/lib/intake-storage";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-intake-body",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-intake-heading",
  display: "swap",
});

type Phase =
  | "intro"
  | "symptoms"
  | "questions"
  | "consent"
  | "calculating"
  | "results";

export default function IntakePage() {
  const [phase, setPhase] = useState<Phase>("intro");
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
  const [fadeIn, setFadeIn] = useState(true);
  const skipFadeOnMount = useRef(true);
  const calculatingStartedAtRef = useRef(0);
  const [intakeTurnstileToken, setIntakeTurnstileToken] = useState("");
  const [honeypotWebsite, setHoneypotWebsite] = useState("");
  const [intakeConsent, setIntakeConsent] = useState<IntakeConsentPayload | null>(
    null,
  );

  useEffect(() => {
    if (skipFadeOnMount.current) {
      skipFadeOnMount.current = false;
      return;
    }

    const fadeOut = window.setTimeout(() => setFadeIn(false), 0);
    const fadeInTimer = window.setTimeout(() => setFadeIn(true), 50);
    return () => {
      window.clearTimeout(fadeOut);
      window.clearTimeout(fadeInTimer);
    };
  }, [phase, currentQ]);

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

  function handleConsentContinue(payload: IntakeConsentPayload) {
    setIntakeConsent(payload);
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
  }

  async function resumeLastResults() {
    const session = await getLastSession();
    if (!session) {
      return;
    }
    setSymptoms(session.symptoms as SymptomId[]);
    setAgeRange(session.ageRange);
    setAnswers(session.answers);
    setScores(session.scores);
    setSessionTimestamp(session.timestamp);
    setSessionId(session.sessionId);
    setAnsweredIndices({});
    setPhase("results");
  }

  const currentQuestion = QUESTIONS[currentQ];
  const currentCategory = currentQuestion
    ? CATEGORIES.find((c) => c.id === currentQuestion.category)
    : undefined;

  const contentStyle: CSSProperties = {
    opacity: fadeIn ? 1 : 0,
    transform: fadeIn ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 400ms ease, transform 400ms ease",
  };

  const shellClass = `${dmSans.variable} ${dmSerifDisplay.variable} mx-auto w-full max-w-[480px]`;

  const shellStyle: CSSProperties = {
    fontFamily: "var(--font-intake-body), system-ui, sans-serif",
    color: "rgba(255,255,255,0.9)",
  };

  return (
    <div className={shellClass} style={shellStyle}>
      {phase === "intro" && (
        <div style={contentStyle}>
          <IntakeIntro
            onStart={() => setPhase("symptoms")}
            onResumeLastResults={resumeLastResults}
          />
        </div>
      )}

      {phase === "symptoms" && (
        <div style={contentStyle}>
          <IntakeSymptoms
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
        <div style={contentStyle}>
          <IntakeConsent
            onContinue={handleConsentContinue}
            onBack={handleBack}
          />
        </div>
      )}

      {phase === "questions" && currentQuestion && currentCategory && (
        <div style={contentStyle} key={currentQ}>
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
        <div style={contentStyle}>
          <IntakeCalculating
            needsHumanVerification={ageRange !== null}
            onTurnstileToken={setIntakeTurnstileToken}
          />
        </div>
      )}

      {phase === "results" && scores && sessionTimestamp !== null && (
        <div style={contentStyle}>
          <IntakeResults
            scores={scores}
            answers={answers}
            symptoms={symptoms}
            sessionId={sessionId}
            onRestart={restart}
            onConsentRevoked={restart}
          />
        </div>
      )}
    </div>
  );
}
