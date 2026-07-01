"use client";

import Link from "next/link";

type IntakeMarketingContinuityNoticeProps = {
  hasActiveAccount: boolean;
  mainNurtureActive: boolean;
  variant: "consent" | "results";
};

export default function IntakeMarketingContinuityNotice({
  hasActiveAccount,
  mainNurtureActive,
  variant,
}: IntakeMarketingContinuityNoticeProps) {
  if (!hasActiveAccount && !mainNurtureActive) {
    return null;
  }

  const isDark = variant === "consent";
  const href = hasActiveAccount ? "/dashboard" : "/account/login";
  const ctaLabel = hasActiveAccount ? "Open je dashboard →" : "Log in voor je overzicht →";

  const bodyCopy = hasActiveAccount
    ? "Je hebt al een account op dit adres. Je laatste overzicht en voortgang staan in je dashboard — we sturen geen tweede welkomstmail."
    : mainNurtureActive
      ? variant === "consent"
        ? "Je ontvangt al vervolgmails op dit adres. We sturen geen tweede welkomstmail; log in voor je persoonlijke overzicht."
        : "Je ontvangt al vervolgmails op dit adres. Je resultaat staat hierboven — voor je voortgang over tijd: dashboard."
      : null;

  if (!bodyCopy) {
    return null;
  }

  return (
    <div
      className="mt-4 rounded-[12px] px-4 py-3"
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(45,74,62,0.08)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid rgba(45,74,62,0.15)",
      }}
    >
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.55,
          color: isDark ? "rgba(255,255,255,0.72)" : "var(--ink-muted, #5a6b62)",
          margin: 0,
        }}
      >
        {bodyCopy}
      </p>
      <Link
        href={href}
        className="mt-2 inline-block text-[13px] font-semibold"
        style={{
          color: isDark ? "#C8956C" : "var(--sage, #2d4a3e)",
          textDecoration: "none",
        }}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
