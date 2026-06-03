import {
  CONSENT_VERSION,
  GUIDE_CONSENT_TEXT,
  type GuideConsentType,
} from "@/lib/consent-texts";
import type { GuideThema } from "@/types/guide-opt-in";

const EMAIL_LOOSE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type GuideOptInPayload = {
  email: string;
  thema: GuideThema;
  marketingConsent: boolean;
};

export function validateGuideOptIn(
  body: Record<string, unknown>,
  isValidThema: (value: string) => value is GuideThema,
):
  | { ok: true; value: GuideOptInPayload }
  | { ok: false; error: string } {
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const thema =
    typeof body.thema === "string" ? body.thema.trim().toLowerCase() : "";
  const marketingConsent = body.marketingConsent === true;

  if (!email || !EMAIL_LOOSE.test(email) || email.length > 254) {
    return { ok: false, error: "Vul een geldig e-mailadres in." };
  }

  if (!isValidThema(thema)) {
    return { ok: false, error: "Onbekend thema." };
  }

  if (!marketingConsent) {
    return {
      ok: false,
      error: "Geef toestemming om de gids en tips per e-mail te ontvangen.",
    };
  }

  return {
    ok: true,
    value: { email, thema, marketingConsent },
  };
}

export function guideOptInConsentRow(options: {
  email: string;
  thema: GuideThema;
  ipHash: string;
  uaHash: string;
  marketingConsent: boolean;
}): {
  email: string;
  thema: string;
  consent_type: GuideConsentType;
  consent_version: string;
  granted: boolean;
  consent_text: string;
  ip_hash: string;
  ua_hash: string;
} {
  return {
    email: options.email,
    thema: options.thema,
    consent_type: "guide_marketing_email",
    consent_version: CONSENT_VERSION,
    granted: options.marketingConsent,
    consent_text: GUIDE_CONSENT_TEXT.guide_marketing_email,
    ip_hash: options.ipHash,
    ua_hash: options.uaHash,
  };
}

export function guideTemplateKey(thema: GuideThema, sequenceDay: number): string {
  return `guide_${thema}_day${sequenceDay}`;
}
