import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { verifyAdminCookie } from "@/lib/admin-session-cookie";

export const ADMIN_TOKEN_COOKIE_NAME = "admin_token";

const PASSWORD_VERIFY_KEY = "admin-password-verify";

export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET?.trim();
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
