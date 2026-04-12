"use client";

import Link from "next/link";
import { useState } from "react";
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

  const showMarketing = emailLooseOk(optionalEmail);
  const marketingBlocked =
    showMarketing && marketing && !emailLooseOk(optionalEmail.trim());
  const canProceed = health && !marketingBlocked;

  function handleContinue() {
    if (!canProceed) {
      return;
    }
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

  return (
    <div className="relative px-6 pb-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 p-0 text-left"
        style={{
          background: "none",
          border: "none",
          color: "#999",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        ← Terug
      </button>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#999]">
        Toestemming
      </p>
      <h2
        className="mb-2 text-[26px] font-normal text-[#1a1a1a]"
        style={{ fontFamily: "var(--font-intake-heading), Georgia, serif" }}
      >
        Gegevens & privacy
      </h2>
      <p className="mb-6 text-[15px] leading-normal text-[#777]">
        Voor persoonlijk advies hebben we je antwoorden nodig. Dat zijn gezondheidsgegevens:
        je kiest hier wat we mogen doen.
      </p>

      <div className="mb-4">
        <label className="flex cursor-pointer gap-3 rounded-[14px] border-2 border-[#e8e6e1] bg-white px-4 py-4">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-[#1a1a1a]"
            checked={health}
            onChange={(e) => setHealth(e.target.checked)}
          />
          <span className="text-[15px] leading-snug text-[#1a1a1a]">
            {INTAKE_CONSENT_TEXT.health_data_processing}
          </span>
        </label>
        <p className="mt-1.5 pl-7 text-[13px] text-[#999]">
          <Link href="/privacy" className="font-semibold text-[#666] underline">
            Privacyverklaring
          </Link>
        </p>
      </div>

      <div className="mb-4">
        <label className="flex cursor-pointer gap-3 rounded-[14px] border-2 border-[#e8e6e1] bg-white px-4 py-4">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-[#1a1a1a]"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
          />
          <span className="text-[15px] leading-snug text-[#1a1a1a]">
            {INTAKE_CONSENT_TEXT.anonymous_analytics}
          </span>
        </label>
        <p className="mt-1.5 pl-7 text-[13px] text-[#999]">
          <Link href="/privacy" className="font-semibold text-[#666] underline">
            Privacyverklaring
          </Link>
        </p>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-[13px] font-medium text-[#555]">
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
          className="box-border w-full max-w-full rounded-[12px] border-2 border-[#e8e6e1] px-4 py-3 text-[15px] outline-none"
          style={{ fontFamily: "inherit" }}
        />
      </div>

      {showMarketing ? (
        <div className="mb-8">
          <label className="flex cursor-pointer gap-3 rounded-[14px] border-2 border-[#e8e6e1] bg-white px-4 py-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 accent-[#1a1a1a]"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />
            <span className="text-[15px] leading-snug text-[#1a1a1a]">
              {INTAKE_CONSENT_TEXT.marketing_email}
            </span>
          </label>
          <p className="mt-1.5 pl-7 text-[13px] text-[#999]">
            <Link href="/privacy" className="font-semibold text-[#666] underline">
              Privacyverklaring
            </Link>
          </p>
        </div>
      ) : (
        <div className="mb-8" />
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={!canProceed}
        className="w-full rounded-[14px] border-none py-[18px] text-base font-semibold transition-all duration-300"
        style={{
          background: canProceed ? "#1a1a1a" : "#ddd",
          color: canProceed ? "white" : "#999",
          cursor: canProceed ? "pointer" : "default",
        }}
      >
        {marketingBlocked
          ? "Vul een geldig e-mailadres in of zet e-mailupdates uit"
          : canProceed
            ? "Verder naar berekening →"
            : "Vink toestemming gezondheidsgegevens aan"}
      </button>
    </div>
  );
}
