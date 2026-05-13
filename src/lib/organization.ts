import { DEFAULT_ORG_ID, getOrgConfig, type OrgConfig } from "@/config/org";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getDefaultOrganizationId(): string {
  const fromEnv = process.env.ORGANIZATION_ID?.trim();
  if (fromEnv && UUID_RE.test(fromEnv)) {
    return fromEnv;
  }
  return DEFAULT_ORG_ID;
}

export function getOrganizationConfig(orgId?: string): OrgConfig {
  const id = orgId ?? getDefaultOrganizationId();
  return getOrgConfig(id);
}
