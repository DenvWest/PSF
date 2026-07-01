import { useEffect, useRef, type MutableRefObject } from "react";
import type { IntakeAgeRange, SymptomId } from "@/data/intake-questions";
import type { IntakeConsentPayload } from "@/lib/intake-consent";
import { calcDomainScores, type DomainScores } from "@/lib/intake-engine";
import { saveIntakeSession } from "@/lib/intake-storage";
import type { MeasuredPillarId } from "@/lib/primary-theme";

const CALCULATING_MIN_MS = 2000;

export type IntakeSubmitResult = {
  scores: DomainScores;
  sessionTimestamp: number;
  sessionId: string | null;
  rapportUrl: string | null;
  primaryTheme: MeasuredPillarId | null;
  /** null = preview-pad (geen persistentie); boolean = uit de opgeslagen consent. */
  marketingEmailActive: boolean | null;
  mainNurtureSkipped: boolean;
};

type UseIntakeSubmitParams = {
  active: boolean;
  answers: Record<string, number>;
  symptoms: SymptomId[];
  ageRange: IntakeAgeRange | null;
  turnstileToken: string;
  honeypotWebsite: string;
  consent: IntakeConsentPayload | null;
  calculatingStartedAtRef: MutableRefObject<number>;
  onComplete: (result: IntakeSubmitResult) => void;
};

/**
 * Orkestreert de intake-submit tijdens de "calculating"-fase: minimaal 2s laadanimatie,
 * preview-paden zonder persistentie (geen leeftijd / geen turnstile-config), en het echte
 * opslaan via saveIntakeSession. Levert het resultaat aan `onComplete`; de component bezit
 * de state. Geëxtraheerd uit IntakeClient (F-008), gedrag identiek.
 */
export function useIntakeSubmit({
  active,
  answers,
  symptoms,
  ageRange,
  turnstileToken,
  honeypotWebsite,
  consent,
  calculatingStartedAtRef,
  onComplete,
}: UseIntakeSubmitParams): void {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const computed = calcDomainScores(answers);
    const ts = Date.now();
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

    // Preview: geen leeftijd of geen turnstile-config → tonen zonder persistentie.
    if (ageRange === null || !turnstileSiteKey) {
      const timer = window.setTimeout(() => {
        onCompleteRef.current({
          scores: computed,
          sessionTimestamp: ts,
          sessionId: null,
          rapportUrl: null,
          primaryTheme: null,
          marketingEmailActive: null,
          mainNurtureSkipped: false,
        });
      }, CALCULATING_MIN_MS);
      return () => window.clearTimeout(timer);
    }

    if (!turnstileToken) {
      return;
    }
    if (!consent) {
      return;
    }

    let cancelled = false;
    const start = calculatingStartedAtRef.current;

    void (async () => {
      const wait = Math.max(0, CALCULATING_MIN_MS - (Date.now() - start));
      if (wait > 0) {
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
      if (cancelled) {
        return;
      }

      const saved = await saveIntakeSession({
        symptoms,
        answers,
        ageRange,
        turnstileToken,
        website: honeypotWebsite,
        consent,
      });
      if (cancelled) {
        return;
      }

      const savedEmail = consent.marketingEmailAddress;
      if (savedEmail) {
        try {
          sessionStorage.setItem("ps_contact_email", savedEmail);
        } catch {
          // sessionStorage niet beschikbaar
        }
      }

      onCompleteRef.current({
        scores: saved?.scores ?? computed,
        sessionTimestamp: ts,
        sessionId: saved?.sessionId ?? null,
        rapportUrl: saved?.rapportUrl ?? null,
        primaryTheme: saved?.primaryTheme ?? null,
        marketingEmailActive: consent.marketingEmail,
        mainNurtureSkipped: saved?.mainNurtureSkipped === true,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [
    active,
    answers,
    symptoms,
    ageRange,
    turnstileToken,
    honeypotWebsite,
    consent,
    calculatingStartedAtRef,
  ]);
}
