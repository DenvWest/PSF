import { headers } from "next/headers";
import { getOrgConfig, DEFAULT_ORG_ID, type OrgConfig } from "@/config/org";

export async function getRequestOrgId(): Promise<string> {
  const headerStore = await headers();
  return headerStore.get("x-org-id") ?? DEFAULT_ORG_ID;
}

export async function getRequestOrgConfig(): Promise<OrgConfig> {
  const orgId = await getRequestOrgId();
  return getOrgConfig(orgId);
}
