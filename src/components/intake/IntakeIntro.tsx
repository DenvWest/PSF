"use client";

import { useEffect } from "react";
import Link from "next/link";
import IntakeInBoxExit from "@/components/intake/IntakeInBoxExit";
import IntakeLastSessionLink from "@/components/intake/IntakeLastSessionLink";
import IntakeResultPreviewCard from "@/components/intake/IntakeResultPreviewCard";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { LEEFSTIJL_DISCLAIMER } from "@/data/leefstijl-disclaimer";
import { INTAKE_PRIVACY_DISCLOSURE } from "@/data/intake-privacy-disclosure";

type IntakeIntroProps = {
  onStart: () => void;
  isRemeasure?: boolean;
};

const THRESHOLD_ITEMS = [
  "3 minuten",
  "Geen account",
  "Geen e-mail verplicht",
] as const;

const REFERRAL_COOKIE = "psf_referral_source";
const REFERRAL_MAX_AGE_SEC = 60 * 60 * 24 * 90; // 90 dagen, match intake cookie

export default function IntakeIntro({ onStart, isRemeasure = false }: IntakeIntroProps) {
  useEffect(() => {
    const utm = new URLSearchParams(window.location.search)
      .get("utm_source")
      ?.replace(/\s+/g, " ")
      .trim()
      .slice(0, 200);
    if (!utm) return;
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    document.cookie = `${REFERRAL_COOKIE}=${encodeURIComponent(utm)}; path=/; max-age=${REFERRAL_MAX_AGE_SEC}; SameSite=Lax${secure}`;
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative flex w-full max-w-lg flex-col items-center gap-8 pt-11 md:gap-10">
        <IntakeInBoxExit className="absolute right-0 top-0" />
        <p
          className="text-sm font-semibold uppercase"
          style={{ letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}
        >
          Leefstijlcheck
        </p>

        <div className="flex flex-col gap-4">
          <h1
            className="text-3xl font-normal leading-tight md:text-4xl"
            style={{
              fontFamily: "var(--font-intake-heading), Georgia, serif",
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.01em",
            }}
          >
            {isRemeasure ? (
              <>Tijd voor je herhaalmeting</>
            ) : (
              <>
                Moe, wazig of altijd <em className="italic">aan</em>?
              </>
            )}
          </h1>

          <p
            className="mx-auto max-w-md text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {isRemeasure
              ? "Doe de check opnieuw — we vergelijken met je startpunt van 30 dagen geleden."
              : "In 3 minuten krijg je een helder beeld van waar je leefstijl staat — en wat je deze week kunt doen."}
          </p>
        </div>

        {!isRemeasure ? <IntakeResultPreviewCard /> : null}

        <details
          className="max-w-md text-left text-xs"
          style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}
        >
          <summary
            className="cursor-pointer list-none text-center [&::-webkit-details-marker]:hidden"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Leefstijlcoach, geen arts
          </summary>
          <p className="mt-3 text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
            {LEEFSTIJL_DISCLAIMER}
          </p>
        </details>

        <details
          className="max-w-md text-left text-xs"
          style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}
        >
          <summary
            className="cursor-pointer list-none text-center [&::-webkit-details-marker]:hidden"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Wat doen we met je antwoorden?
          </summary>
          <ul className="mt-3 space-y-2 pl-4">
            {INTAKE_PRIVACY_DISCLOSURE.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
            <li>
              Meer in onze{" "}
              <Link
                href="/privacy"
                style={{
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                {INTAKE_PRIVACY_DISCLOSURE.privacyLinkLabel}
              </Link>
              .
            </li>
          </ul>
        </details>

        <button
          type="button"
          onClick={onStart}
          className="mt-2 min-h-[44px] w-full max-w-sm cursor-pointer rounded-[14px] border border-[#C8956C] px-12 py-4 text-base font-semibold text-white transition-all duration-200 hover:brightness-110"
          style={{ fontFamily: "inherit", background: "#C8956C" }}
        >
          Start de Leefstijlcheck →
        </button>

        <ul
          className="flex flex-col items-center gap-2 text-sm sm:flex-row sm:gap-4"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {THRESHOLD_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span aria-hidden style={{ color: "rgba(255,255,255,0.5)" }}>
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <IntakeLastSessionLink theme="dark" />
        <MedicalDisclaimer variant="intake" theme="dark" />
      </div>
    </div>
  );
}
