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
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-10 text-center">
      <div
        className="mb-7 h-14 w-14 animate-spin rounded-full border-[3px] border-[#eee] border-t-[#1a1a1a]"
        aria-hidden
      />
      <h2
        className="mb-2 text-[22px] font-normal text-[#1a1a1a]"
        style={{ fontFamily: "var(--font-intake-heading), Georgia, serif" }}
      >
        Je profiel wordt berekend...
      </h2>
      <p className="text-sm text-[#999]">Scores, signalen en advies op maat</p>

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
        <p className="mt-6 max-w-[300px] text-sm text-[#a85]">
          Human verification is niet geconfigureerd. Je resultaten worden lokaal
          getoond; opslaan op de server is uitgeschakeld.
        </p>
      ) : null}
    </div>
  );
}
