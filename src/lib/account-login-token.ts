import { randomBytes } from "node:crypto";
import { sha256Hex } from "@/lib/consent-hashing";

export const ACCOUNT_LOGIN_TOKEN_TTL_MINUTES = 15;

export function createRawLoginToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashLoginToken(raw: string): string {
  return sha256Hex(raw);
}

export function loginTokenExpiryIso(): string {
  return new Date(
    Date.now() + ACCOUNT_LOGIN_TOKEN_TTL_MINUTES * 60_000,
  ).toISOString();
}
