import { createHmac, timingSafeEqual } from "node:crypto";

export const INTAKE_SESSION_COOKIE_NAME = "psf_intake_sid";
export const INTAKE_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
const CLOCK_SKEW_SECONDS = 300;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSecret(): string | null {
  const s = process.env.COOKIE_SECRET?.trim();
  return s && s.length > 0 ? s : null;
}

function computeSig(secret: string, sessionId: string, issuedAt: number): string {
  return createHmac("sha256", secret).update(`${sessionId}.${issuedAt}`).digest("hex");
}

/** Legacy-signature (pre-expiry): HMAC over alleen sessionId. */
function computeLegacySig(secret: string, sessionId: string): string {
  return createHmac("sha256", secret).update(sessionId).digest("hex");
}

function safeEqualHex(expected: string, actual: string): boolean {
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(actual, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function signIntakeSessionId(
  sessionId: string,
  issuedAtSeconds: number = Math.floor(Date.now() / 1000),
): string | null {
  const secret = getSecret();
  if (!secret || !UUID_RE.test(sessionId) || !Number.isInteger(issuedAtSeconds)) {
    return null;
  }
  const sig = computeSig(secret, sessionId, issuedAtSeconds);
  return `${sessionId}.${issuedAtSeconds}.${sig}`;
}

/**
 * Verifieert HMAC en retourneert session-id of null.
 * - 3-delig (nieuw): sessionId.issuedAt.sig — met klok-skew- en max-age-check.
 * - 2-delig (legacy): sessionId.sig — grandfathered, geen expiry. Kan in een latere
 *   opruiming vervallen zodra alle oude cookies/URLs buiten de 90-dagen-window zijn.
 */
export function verifySignedIntakeSessionCookie(
  raw: string | undefined,
): string | null {
  if (!raw || typeof raw !== "string") {
    return null;
  }
  const secret = getSecret();
  if (!secret) {
    return null;
  }

  const parts = raw.split(".");

  if (parts.length === 3) {
    const [sessionId, issuedAtStr, sigHex] = parts;
    if (
      !UUID_RE.test(sessionId) ||
      !/^\d{1,15}$/.test(issuedAtStr) ||
      sigHex.length !== 64
    ) {
      return null;
    }
    const issuedAt = Number(issuedAtStr);
    if (!Number.isInteger(issuedAt)) {
      return null;
    }
    if (!safeEqualHex(computeSig(secret, sessionId, issuedAt), sigHex)) {
      return null;
    }
    const nowSec = Math.floor(Date.now() / 1000);
    if (issuedAt > nowSec + CLOCK_SKEW_SECONDS) {
      return null;
    }
    if (nowSec - issuedAt > INTAKE_COOKIE_MAX_AGE_SECONDS) {
      return null;
    }
    return sessionId;
  }

  if (parts.length === 2) {
    const [sessionId, sigHex] = parts;
    if (!UUID_RE.test(sessionId) || sigHex.length !== 64) {
      return null;
    }
    if (!safeEqualHex(computeLegacySig(secret, sessionId), sigHex)) {
      return null;
    }
    return sessionId;
  }

  return null;
}
