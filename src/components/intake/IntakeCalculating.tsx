"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type IntakeCalculatingProps = {
  needsHumanVerification: boolean;
  onTurnstileToken: (token: string) => void;
};

export default function IntakeCalculating({
  needsHumanVerification,
  onTurnstileToken,
}: IntakeCalculatingProps) {
  const turnstileRef = useRef<TurnstileInstance>(undefined);

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-10 text-center"
      style={{ maxWidth: 480, margin: "0 auto", boxSizing: "border-box", width: "100%" }}
    >
      <div
        className="mb-7 h-14 w-14 animate-spin rounded-full"
        style={{
          border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "#C8956C",
        }}
        aria-hidden
      />
      <h2
        className="mb-2 font-normal"
        style={{
          fontFamily: "var(--font-intake-heading), Georgia, serif",
          fontSize: 22,
          color: "rgba(255,255,255,0.88)",
        }}
      >
        Je profiel wordt berekend...
      </h2>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
        Scores, signalen en advies op maat
      </p>

      {needsHumanVerification && turnstileSiteKey ? (
        <div className="mt-8 flex min-h-[65px] justify-center">
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onSuccess={(token) => {
              onTurnstileToken(token);
            }}
            onExpire={() => {
              onTurnstileToken("");
              turnstileRef.current?.reset();
            }}
            onError={() => {
              onTurnstileToken("");
            }}
            options={{
              action: "intake_submit",
            }}
          />
        </div>
      ) : null}
      {needsHumanVerification && !turnstileSiteKey ? (
        <p
          className="mt-6 max-w-[300px] text-sm"
          style={{ color: "rgba(200,149,108,0.8)" }}
        >
          Human verification is niet geconfigureerd. Je resultaten worden lokaal
          getoond; opslaan op de server is uitgeschakeld.
        </p>
      ) : null}
    </div>
  );
}
