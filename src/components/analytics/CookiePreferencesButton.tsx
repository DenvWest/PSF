"use client";

import { dispatchCookiePreferences } from "@/lib/analytics-consent-client";

type CookiePreferencesButtonProps = {
  className?: string;
  label?: string;
};

export default function CookiePreferencesButton({
  className,
  label = "Cookievoorkeuren",
}: CookiePreferencesButtonProps) {
  return (
    <button
      type="button"
      onClick={() => dispatchCookiePreferences({ openSettings: true })}
      className={className}
    >
      {label}
    </button>
  );
}
