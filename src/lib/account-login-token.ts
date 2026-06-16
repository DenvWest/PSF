import { randomInt } from "node:crypto";
import { sha256Hex } from "@/lib/consent-hashing";

export const ACCOUNT_LOGIN_TOKEN_TTL_MINUTES = 15;

export function createLoginCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashLoginCode(accountId: string, code: string): string {
  return sha256Hex(`${accountId}.${code}`);
}

export function loginTokenExpiryIso(): string {
  return new Date(
    Date.now() + ACCOUNT_LOGIN_TOKEN_TTL_MINUTES * 60_000,
  ).toISOString();
}
