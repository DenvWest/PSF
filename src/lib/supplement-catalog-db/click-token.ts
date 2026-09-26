import { randomBytes } from "node:crypto";

/**
 * Kort, url-veilig kliktoken — zie docs/partners/SPEC_CLICK_TOKEN_TRACKING.md §1.
 * 9 ruwe bytes -> 12 base64url-tekens, binnen de gevraagde 10-16 range.
 */
export function generateClickToken(): string {
  return randomBytes(9).toString("base64url");
}
