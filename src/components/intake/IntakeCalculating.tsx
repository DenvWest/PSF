"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import Link from "next/link";
import { useEffect, useRef } from "react";

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

  // Take over full screen: hide the layout header.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".intake-layout-header");
    if (header) header.style.display = "none";
    return () => {
      if (header) header.style.display = "";
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center text-center">
      {/* Fixed progress bar — complete */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,255,255,0.1)",
          zIndex: 50,
        }}
      >
        <div style={{ height: "100%", width: "100%", background: "#C8956C" }} />
      </div>

      {/* Fixed close button */}
      <Link
        href="/"
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 50,
          color: "rgba(255,255,255,0.35)",
          fontSize: 18,
          lineHeight: 1,
          textDecoration: "none",
          padding: "4px 8px",
        }}
        aria-label="Sluiten"
      >
        ✕
      </Link>

      {/* Centered content block */}
      <div className="flex w-full max-w-lg flex-col items-center px-6 py-12">
        <div
          className="mb-8 h-14 w-14 animate-spin rounded-full"
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
            fontSize: 24,
            color: "rgba(255,255,255,0.88)",
          }}
        >
          Je profiel wordt berekend...
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
          Scores, signalen en advies op maat
        </p>

        {needsHumanVerification && turnstileSiteKey ? (
          <div className="mt-10 flex min-h-[65px] justify-center">
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
              options={{ action: "intake_submit" }}
            />
          </div>
        ) : null}

        {needsHumanVerification && !turnstileSiteKey ? (
          <p
            className="mt-8 max-w-[300px] text-sm"
            style={{ color: "rgba(200,149,108,0.8)" }}
          >
            Human verification is niet geconfigureerd. Je resultaten worden
            lokaal getoond; opslaan op de server is uitgeschakeld.
          </p>
        ) : null}
      </div>
    </div>
  );
}
