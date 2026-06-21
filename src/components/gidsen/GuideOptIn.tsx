"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

type GuideOptInVariant = "hero" | "dark";

type GuideOptInContextValue = {
  guideTitle: string;
  accent: string;
  email: string;
  consent: boolean;
  submitted: boolean;
  error: string;
  setEmail: (value: string) => void;
  setConsent: (value: boolean) => void;
  handleSubmit: (event: FormEvent) => void;
};

const GuideOptInContext = createContext<GuideOptInContextValue | null>(null);

function useGuideOptInContext(): GuideOptInContextValue {
  const context = useContext(GuideOptInContext);
  if (!context) {
    throw new Error("GuideOptIn must be used within GuideOptInRoot");
  }
  return context;
}

type GuideOptInRootProps = {
  guideTitle: string;
  accent: string;
  children: ReactNode;
};

export function GuideOptInRoot({
  guideTitle,
  accent,
  children,
}: GuideOptInRootProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const trimmedEmail = email.trim();
      const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail);

      if (!emailValid) {
        setError("Vul een geldig e-mailadres in.");
        return;
      }

      if (!consent) {
        setError("Vink de toestemming aan om de gids te ontvangen.");
        return;
      }

      // TODO: koppel aan nurture_emails
      setSubmitted(true);
      setError("");
      trackEvent(GA4_EVENTS.EMAIL_INGESCHREVEN, { guide: guideTitle });
    },
    [consent, email, guideTitle],
  );

  const value = useMemo(
    () => ({
      guideTitle,
      accent,
      email,
      consent,
      submitted,
      error,
      setEmail: (nextEmail: string) => {
        setEmail(nextEmail);
        setError("");
      },
      setConsent: (nextConsent: boolean) => {
        setConsent(nextConsent);
        setError("");
      },
      handleSubmit,
    }),
    [
      guideTitle,
      accent,
      email,
      consent,
      submitted,
      error,
      handleSubmit,
    ],
  );

  return (
    <GuideOptInContext.Provider value={value}>{children}</GuideOptInContext.Provider>
  );
}

type GuideOptInProps = {
  variant: GuideOptInVariant;
};

export default function GuideOptIn({ variant }: GuideOptInProps) {
  const {
    guideTitle,
    accent,
    email,
    consent,
    submitted,
    error,
    setEmail,
    setConsent,
    handleSubmit,
  } = useGuideOptInContext();

  const accentStyle = {
    "--ac": accent,
  } as CSSProperties;

  if (variant === "hero") {
    return (
      <div
        className="mt-9 rounded-[20px] border border-[#ECE8DD] bg-white p-7 shadow-[0_12px_32px_-22px_rgba(30,40,34,.4)]"
        style={accentStyle}
      >
        {submitted ? (
          <div className="px-1 py-2 text-center">
            <div
              className="mx-auto flex h-[54px] w-[54px] items-center justify-center rounded-full"
              style={{
                background: "color-mix(in srgb, var(--ac) 16%, #fff)",
              }}
            >
              <span
                aria-hidden
                className="block h-5 w-[11px] rotate-45 border-b-[3px] border-r-[3px] border-[var(--ac)]"
                style={{ transform: "rotate(45deg) translate(-1px, -2px)" }}
              />
            </div>
            <h3 className="mt-[18px] font-serif text-[26px] font-normal text-[#1B2620]">
              Check je inbox
            </h3>
            <p className="mt-2.5 text-[15px] leading-[1.55] text-[#5A6560]">
              We hebben de gids{" "}
              <strong className="text-[#1B2620]">{guideTitle}</strong> onderweg
              gezet. Geen mail binnen een paar minuten? Kijk even in je spam.
            </p>
            <div className="mt-[18px] border-t border-[#F0ECE2] pt-[18px] text-[13.5px] text-[#8A9189]">
              Volgende stap: de gratis Leefstijlcheck — meet je startpunt in 3
              minuten.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[#8A9189]">
                Stap 1 van 2 — bijna klaar
              </span>
              <span className="text-xs text-[#8A9189]">≈ 20 min leeswerk</span>
            </div>
            <div className="mb-5 h-[5px] overflow-hidden rounded-full bg-[#EEEBE1]">
              <div
                className="h-full w-[62%] rounded-full bg-[var(--ac)]"
                aria-hidden
              />
            </div>
            <label
              htmlFor={`guide-email-${variant}`}
              className="mb-2 block text-sm font-semibold text-[#1B2620]"
            >
              E-mailadres
            </label>
            <input
              id={`guide-email-${variant}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jij@voorbeeld.nl"
              className="min-h-11 w-full rounded-xl border-[1.5px] border-[#DFDACE] bg-[#FBFAF6] px-4 py-3.5 text-base outline-none transition-colors focus:border-[var(--ac)] focus:bg-white"
              autoComplete="email"
            />

            <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-[11px]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#5A8F6A]"
              />
              <span className="text-[13.5px] leading-normal text-[#5A6560]">
                Ja, stuur mij de gids en af en toe een mail met leefstijltips. Ik
                kan me altijd weer afmelden.
              </span>
            </label>

            {error ? (
              <div className="mt-3.5 rounded-[10px] border border-[#F0D6CD] bg-[#FBEEEA] px-[13px] py-2.5 text-[13.5px] text-[#B5503B]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="mt-[18px] min-h-11 w-full rounded-xl border-none bg-[#102018] px-4 py-4 text-base font-bold text-white transition-[background,transform] duration-150 hover:-translate-y-px hover:bg-[#1B3326]"
            >
              Stuur mij de gratis gids
            </button>
            <div className="mt-3 text-center text-[12.5px] text-[#9AA39C]">
              Je e-mail gebruiken we alleen voor de nieuwsbrief — los van je
              gezondheidsgegevens.
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="text-center" style={accentStyle}>
      {submitted ? (
        <div className="mx-auto mt-8 max-w-[440px] rounded-[18px] border border-white/10 bg-white/[0.06] p-7">
          <div className="font-serif text-2xl text-[#E7EDE8]">
            Check je inbox ✓
          </div>
          <p className="mt-2.5 text-[14.5px] leading-[1.55] text-[#9FB0A6]">
            De gids is onderweg. Tot bij de volgende stap.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-[480px] flex-wrap justify-center gap-3"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jij@voorbeeld.nl"
            className="min-h-11 min-w-[200px] flex-[1_1_240px] rounded-xl border-[1.5px] border-white/20 bg-white/5 px-[18px] py-[15px] text-base text-white outline-none transition-colors focus:border-[var(--ac)] focus:bg-white/[0.09]"
            autoComplete="email"
          />
          <button
            type="submit"
            className="min-h-11 shrink-0 rounded-xl border-none px-[26px] py-[15px] text-base font-bold text-[#102018]"
            style={{ background: "var(--ac)" }}
          >
            Ontvang de gids
          </button>
          <label className="mt-1 flex min-h-11 w-full cursor-pointer items-start gap-2.5 text-left">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#5A8F6A]"
            />
            <span className="text-[13px] leading-normal text-[#9FB0A6]">
              Ja, ik ontvang de gids en af en toe leefstijltips. Afmelden kan
              altijd.
            </span>
          </label>
          {error ? (
            <div className="w-full text-left text-[13.5px] text-[#E8A99A]">
              {error}
            </div>
          ) : null}
        </form>
      )}
    </div>
  );
}
