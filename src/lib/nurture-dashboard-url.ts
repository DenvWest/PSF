import { getPublicSiteUrl } from "@/lib/public-site-url";

export const NURTURE_DAY0_DASHBOARD_REF = "nurture-day0-dashboard";

export function resolveNurtureDashboardUrl(hasAccount: boolean): string {
  const base = getPublicSiteUrl();
  const ref = `ref=${NURTURE_DAY0_DASHBOARD_REF}`;
  return hasAccount
    ? `${base}/dashboard?${ref}`
    : `${base}/account/login?from=intake&${ref}`;
}
