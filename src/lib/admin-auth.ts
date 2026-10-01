import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { verifyAdminCookie } from "@/lib/admin-session-cookie";

export const ADMIN_TOKEN_COOKIE_NAME = "admin_token";

const PASSWORD_VERIFY_KEY = "admin-password-verify";

export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET?.trim();
}

/**
 * MFA is optioneel-maar-aan-te-raden (audit N8, C2: één gedeeld wachtwoord
 * zonder MFA). Leeg/ontbrekend ADMIN_TOTP_SECRET = TOTP-stap overgeslagen,
 * zodat dit geen breaking change is totdat een secret is ingesteld en
 * gekoppeld aan een authenticator-app.
 */
export function getAdminTotpSecret(): string | undefined {
  const secret = process.env.ADMIN_TOTP_SECRET?.trim();
  return secret && secret.length > 0 ? secret : undefined;
}

export function isAdminTotpEnabled(): boolean {
  return getAdminTotpSecret() !== undefined;
}

function hashAdminPassword(password: string): string {
  return createHmac("sha256", PASSWORD_VERIFY_KEY).update(password).digest("hex");
}

export function verifyAdminPassword(input: string, expectedPlain: string): boolean {
  const a = Buffer.from(hashAdminPassword(input), "utf8");
  const b = Buffer.from(hashAdminPassword(expectedPlain), "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function isValidAdminSessionCookie(token: string | undefined): boolean {
  return verifyAdminCookie(token) !== null;
}

export async function requireAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE_NAME)?.value;
  if (!isValidAdminSessionCookie(token)) {
    throw new Error("Niet geautoriseerd.");
  }
}
