import {
  CONSENT_VERSION,
  INTAKE_CONSENT_TEXT,
  type ConsentType,
} from "@/lib/consent-texts";

const EMAIL_LOOSE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type IntakeConsentPayload = {
  healthDataProcessing: boolean;
  anonymousAnalytics: boolean;
  marketingEmail: boolean;
  /** Alleen relevant als marketingEmail true; verplicht bij marketing. */
  marketingEmailAddress: string | null;
  /** Optioneel; voor personalisatie in e-mails (max. 60 tekens). */
  firstName: string | null;
};

export function normalizeFirstName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const t = value.replace(/\s+/g, " ").trim();
  if (!t) {
    return null;
  }
  const cleaned = t.replace(/[^a-zA-Zà-ïÀ-ÿĳĲ\s'-]/g, "").trim();
  if (!cleaned || !/[a-zA-ZÀ-ÿ]/.test(cleaned)) {
    return null;
  }
  return cleaned.length > 60 ? cleaned.slice(0, 60) : cleaned;
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const t = value.replace(/\s+/g, " ").trim();
  return t.length > 0 ? t : null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Valideert intake-consent uit de JSON-body. Server gebruikt INTAKE_CONSENT_TEXT voor opslag (niet client-teksten).
 */
export function validateIntakeConsent(body: Record<string, unknown>):
  | { ok: true; value: IntakeConsentPayload }
  | { ok: false; error: string } {
  const raw = body.consent;
  if (!isPlainObject(raw)) {
    return { ok: false, error: "Toestemming ontbreekt of is ongeldig." };
  }

  const health =
    raw.healthDataProcessing === true || raw.healthDataProcessing === false
      ? raw.healthDataProcessing
      : null;
  const analytics =
    raw.anonymousAnalytics === true || raw.anonymousAnalytics === false
      ? raw.anonymousAnalytics
      : null;
  const marketing =
    raw.marketingEmail === true || raw.marketingEmail === false
      ? raw.marketingEmail
      : null;

  if (health !== true) {
    return {
      ok: false,
      error:
        "Zonder toestemming voor gezondheidsgegevens kunnen we de intake niet verwerken.",
    };
  }

  if (analytics === null || marketing === null) {
    return { ok: false, error: "Toestemming is onvolledig." };
  }

  const marketingEmailAddress = normalizeEmail(raw.marketingEmailAddress);
  const firstName = normalizeFirstName(raw.firstName);

  if (marketing === true) {
    if (!marketingEmailAddress || !EMAIL_LOOSE.test(marketingEmailAddress)) {
      return {
        ok: false,
        error: "Vul een geldig e-mailadres in voor e-mailupdates, of schakel die optie uit.",
      };
    }
  }

  return {
    ok: true,
    value: {
      healthDataProcessing: true,
      anonymousAnalytics: analytics,
      marketingEmail: marketing,
      marketingEmailAddress: marketing ? marketingEmailAddress : null,
      firstName,
    },
  };
}

export function intakeConsentRows(options: {
  sessionId: string;
  organizationId: string;
  consent: IntakeConsentPayload;
  ipHash: string;
  uaHash: string;
}): Array<{
  session_id: string;
  organization_id: string;
  consent_type: ConsentType;
  consent_version: string;
  granted: boolean;
  consent_text: string;
  ip_hash: string;
  ua_hash: string;
}> {
  const { sessionId, organizationId, consent, ipHash, uaHash } = options;
  const base = {
    session_id: sessionId,
    organization_id: organizationId,
    ip_hash: ipHash,
    ua_hash: uaHash,
  };

  const rows: Array<{
    session_id: string;
    organization_id: string;
    consent_type: ConsentType;
    consent_version: string;
    granted: boolean;
    consent_text: string;
    ip_hash: string;
    ua_hash: string;
  }> = [
    {
      ...base,
      consent_type: "health_data_processing",
      consent_version: CONSENT_VERSION,
      granted: true,
      consent_text: INTAKE_CONSENT_TEXT.health_data_processing,
    },
    {
      ...base,
      consent_type: "anonymous_analytics",
      consent_version: CONSENT_VERSION,
      granted: consent.anonymousAnalytics,
      consent_text: INTAKE_CONSENT_TEXT.anonymous_analytics,
    },
  ];

  if (consent.marketingEmail && consent.marketingEmailAddress) {
    rows.push({
      ...base,
      consent_type: "marketing_email",
      consent_version: CONSENT_VERSION,
      granted: true,
      consent_text: INTAKE_CONSENT_TEXT.marketing_email,
    });
  }

  return rows;
}
