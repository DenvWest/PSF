import {
  CONSENT_VERSION,
  CONTACT_CONSENT_TEXT,
  type ConsentType,
} from "@/lib/consent-texts";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type ContactConsentPayload = {
  healthDataProcessing: boolean;
  anonymousAnalytics: boolean;
  marketingEmail: boolean;
};

export function validateContactConsent(body: Record<string, unknown>):
  | { ok: true; value: ContactConsentPayload }
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
        "Zonder toestemming voor verwerking van je gegevens (inclusief eventuele gezondheidsgegevens) kunnen we je bericht niet verwerken.",
    };
  }

  if (analytics === null || marketing === null) {
    return { ok: false, error: "Toestemming is onvolledig." };
  }

  return {
    ok: true,
    value: {
      healthDataProcessing: true,
      anonymousAnalytics: analytics,
      marketingEmail: marketing,
    },
  };
}

export function contactConsentRows(options: {
  consent: ContactConsentPayload;
  ipHash: string;
  uaHash: string;
}): Array<{
  session_id: null;
  consent_type: ConsentType;
  consent_version: string;
  granted: boolean;
  consent_text: string;
  ip_hash: string;
  ua_hash: string;
}> {
  const { consent, ipHash, uaHash } = options;
  const base = {
    session_id: null as null,
    ip_hash: ipHash,
    ua_hash: uaHash,
  };

  return [
    {
      ...base,
      consent_type: "health_data_processing",
      consent_version: CONSENT_VERSION,
      granted: true,
      consent_text: CONTACT_CONSENT_TEXT.health_data_processing,
    },
    {
      ...base,
      consent_type: "anonymous_analytics",
      consent_version: CONSENT_VERSION,
      granted: consent.anonymousAnalytics,
      consent_text: CONTACT_CONSENT_TEXT.anonymous_analytics,
    },
    {
      ...base,
      consent_type: "marketing_email",
      consent_version: CONSENT_VERSION,
      granted: consent.marketingEmail,
      consent_text: CONTACT_CONSENT_TEXT.marketing_email,
    },
  ];
}
