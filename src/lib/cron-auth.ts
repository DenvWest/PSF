import { createHmac, timingSafeEqual } from "crypto";

export interface CronAuthResult {
  authorized: boolean;
  error?: string;
}

function getClientIp(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}

function isIpAllowed(ip: string | null): boolean {
  const allowlist = process.env.CRON_ALLOWED_IPS?.trim();
  if (!allowlist) return true;
  if (!ip) return false;
  const allowed = allowlist.split(",").map((s) => s.trim());
  return allowed.includes(ip);
}

function verifyBearerToken(request: Request, secret: string): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;
  const trimmed = authHeader.trim();
  const token = trimmed.toLowerCase().startsWith("bearer ")
    ? trimmed.slice(7).trim()
    : trimmed;
  return token === secret;
}

function verifyHmacSignature(request: Request, secret: string): boolean {
  const signature = request.headers.get("x-cron-signature");
  const timestamp = request.headers.get("x-cron-timestamp");
  if (!signature || !timestamp) return false;

  const timestampMs = parseInt(timestamp, 10);
  if (isNaN(timestampMs)) return false;

  const fiveMinutes = 5 * 60 * 1000;
  if (Math.abs(Date.now() - timestampMs) > fiveMinutes) return false;

  const expected = createHmac("sha256", secret)
    .update(timestamp)
    .digest("hex");

  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (sigBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(sigBuffer, expectedBuffer);
}

/**
 * Verifies a cron request using either:
 * 1. Bearer token (existing method)
 * 2. HMAC signature with timestamp (preferred, replay-safe)
 *
 * Additionally checks optional IP allowlist via CRON_ALLOWED_IPS env var.
 */
export function verifyCronRequest(request: Request): CronAuthResult {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return { authorized: false, error: "CRON_SECRET ontbreekt" };
  }

  const clientIp = getClientIp(request);
  if (!isIpAllowed(clientIp)) {
    return { authorized: false, error: "IP niet toegestaan" };
  }

  const hasHmac = request.headers.has("x-cron-signature");
  if (hasHmac) {
    if (verifyHmacSignature(request, secret)) {
      return { authorized: true };
    }
    return { authorized: false, error: "Ongeldige HMAC signature" };
  }

  if (verifyBearerToken(request, secret)) {
    return { authorized: true };
  }

  return { authorized: false, error: "Niet geautoriseerd" };
}
