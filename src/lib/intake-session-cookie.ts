import { createHmac, timingSafeEqual } from "node:crypto";

export const INTAKE_SESSION_COOKIE_NAME = "psf_intake_sid";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSecret(): string | null {
  const s = process.env.COOKIE_SECRET?.trim();
  return s && s.length > 0 ? s : null;
}

export function signIntakeSessionId(sessionId: string): string | null {
  const secret = getSecret();
  if (!secret || !UUID_RE.test(sessionId)) {
    return null;
  }

  const sig = createHmac("sha256", secret).update(sessionId).digest("hex");
  return `${sessionId}.${sig}`;
}

/**
 * Verifieert HMAC en retourneert session-id of null.
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

  const dot = raw.lastIndexOf(".");
  if (dot <= 0) {
    return null;
  }

  const sessionId = raw.slice(0, dot);
  const sigHex = raw.slice(dot + 1);

  if (!UUID_RE.test(sessionId) || sigHex.length !== 64) {
    return null;
  }

  const expected = createHmac("sha256", secret).update(sessionId).digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(sigHex, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null;
    }
  } catch {
    return null;
  }

  return sessionId;
}
