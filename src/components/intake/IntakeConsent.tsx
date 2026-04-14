"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { INTAKE_CONSENT_TEXT } from "@/lib/consent-texts";
import type { IntakeConsentPayload } from "@/lib/intake-consent";

type IntakeConsentProps = {
  onContinue: (payload: IntakeConsentPayload) => void;
  onBack: () => void;
};

function emailLooseOk(value: string): boolean {
  const t = value.trim();
  return t.includes("@") && t.includes(".");
}

export default function IntakeConsent({ onContinue, onBack }: IntakeConsentProps) {
  const [health, setHealth] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [optionalEmail, setOptionalEmail] = useState("");
  const [marketing, setMarketing] = useState(false);

  // Take over full screen: hide the layout header.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".intake-layout-header");
    if (header) header.style.display = "none";
    return () => {
      if (header) header.style.display = "";
    };
  }, []);

  const showMarketing = emailLooseOk(optionalEmail);
  const marketingBlocked =
    showMarketing && marketing && !emailLooseOk(optionalEmail.trim());
  const canProceed = health && !marketingBlocked;

  function handleContinue() {
    if (!canProceed) return;
    const addr = optionalEmail.trim();
    const payload: IntakeConsentPayload = {
      healthDataProcessing: true,
      anonymousAnalytics: analytics,
      marketingEmail: showMarketing && marketing,
      marketingEmailAddress:
        showMarketing && marketing && emailLooseOk(addr) ? addr : null,
    };
    onContinue(payload);
  }

  const cardStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "16px",
    cursor: "pointer",
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    width: "100%",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      {/* Fixed progress bar at 100% — all questions answered */}
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
      <div className="w-full max-w-lg px-6 py-16">
        {/* Back + label */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            ← Terug
          </button>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Toestemming
          </span>
        </div>

        <h2
          className="mb-2 font-normal"
          style={{
            fontFamily: "var(--font-intake-heading), Georgia, serif",
            fontSize: 26,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          Gegevens &amp; privacy
        </h2>

        <p
          className="mb-8"
          style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}
        >
          Voor persoonlijk advies hebben we je antwoorden nodig. Dat zijn
          gezondheidsgegevens: je kiest hier wat we mogen doen.
        </p>

        {/* Health consent */}
        <div className="mb-4">
          <label style={cardStyle}>
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ accentColor: "#C8956C" }}
              checked={health}
              onChange={(e) => setHealth(e.target.checked)}
            />
            <span style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
              {INTAKE_CONSENT_TEXT.health_data_processing}
            </span>
          </label>
          <p className="mt-1.5 pl-7" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
              Privacyverklaring
            </Link>
          </p>
        </div>

        {/* Analytics consent */}
        <div className="mb-4">
          <label style={cardStyle}>
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ accentColor: "#C8956C" }}
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
            <span style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
              {INTAKE_CONSENT_TEXT.anonymous_analytics}
            </span>
          </label>
          <p className="mt-1.5 pl-7" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
              Privacyverklaring
            </Link>
          </p>
        </div>

        {/* Optional email */}
        <div className="mb-4">
          <label
            className="mb-2 block text-[13px] font-medium"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            E-mail (optioneel — alleen nodig voor updates over je herstelplan)
          </label>
          <input
            type="email"
            name="consent-optional-email"
            autoComplete="email"
            placeholder="je@emailadres.nl"
            value={optionalEmail}
            onChange={(e) => {
              setOptionalEmail(e.target.value);
              if (!emailLooseOk(e.target.value)) {
                setMarketing(false);
              }
            }}
            className="box-border w-full max-w-full rounded-[12px] px-4 py-3 text-[15px] outline-none"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.85)",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Marketing consent (conditional) */}
        {showMarketing ? (
          <div className="mb-8">
            <label style={cardStyle}>
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ accentColor: "#C8956C" }}
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
              <span style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                {INTAKE_CONSENT_TEXT.marketing_email}
              </span>
            </label>
            <p className="mt-1.5 pl-7" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
              <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                Privacyverklaring
              </Link>
            </p>
          </div>
        ) : (
          <div className="mb-8" />
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canProceed}
          className="w-full rounded-[14px] border-none py-[18px] text-base font-semibold transition-all duration-300"
          style={{
            background: canProceed ? "#C8956C" : "rgba(255,255,255,0.08)",
            color: canProceed ? "white" : "rgba(255,255,255,0.3)",
            cursor: canProceed ? "pointer" : "default",
            boxShadow: canProceed ? "0 4px 20px rgba(200,149,108,0.25)" : "none",
            fontFamily: "inherit",
          }}
        >
          {marketingBlocked
            ? "Vul een geldig e-mailadres in of zet e-mailupdates uit"
            : canProceed
              ? "Verder naar berekening →"
              : "Vink toestemming gezondheidsgegevens aan"}
        </button>
      </div>
    </div>
  );
}
