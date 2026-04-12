const DEFAULT_ORGANIZATION_ID = "00000000-0000-0000-0000-000000000001";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Organisatie voor deze request/tenant. Nu vast default; later o.a. subdomain / JWT.
 */
export function getDefaultOrganizationId(): string {
  const fromEnv = process.env.ORGANIZATION_ID?.trim();
  if (fromEnv && UUID_RE.test(fromEnv)) {
    return fromEnv;
  }
  return DEFAULT_ORGANIZATION_ID;
}
