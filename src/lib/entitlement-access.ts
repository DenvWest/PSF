/**
 * Client-safe entitlement gate helpers (no DB imports).
 * DB reads live in src/lib/db/entitlements.ts (server-only).
 */

export const DARK_LAUNCH = true;

export function resolveTrendsAccess(
  hasEntitlement: boolean,
  isMember: boolean,
): boolean {
  if (DARK_LAUNCH) {
    return isMember;
  }
  return hasEntitlement;
}
