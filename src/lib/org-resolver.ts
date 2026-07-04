import { DEFAULT_ORG_ID } from "@/config/org";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  orgId: string;
  expiresAt: number;
};

const slugCache = new Map<string, CacheEntry>();

type OrgSlugRow = { id: string };

export function extractSubdomainFromHost(host: string): string | null {
  const parts = host.split(".");
  if (parts.length < 3) {
    return null;
  }

  const subdomain = parts[0]?.trim().toLowerCase() ?? "";
  if (!subdomain || subdomain === "www" || subdomain === "perfectsupplement") {
    return null;
  }

  return subdomain;
}

export async function resolveOrgIdFromSubdomain(subdomain: string): Promise<string> {
  const normalized = subdomain.trim().toLowerCase();
  if (!normalized) {
    return DEFAULT_ORG_ID;
  }

  const cached = slugCache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.orgId;
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return DEFAULT_ORG_ID;
  }

  const { data, error } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", normalized)
    .maybeSingle<OrgSlugRow>();

  if (error || !data?.id) {
    slugCache.set(normalized, {
      orgId: DEFAULT_ORG_ID,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return DEFAULT_ORG_ID;
  }

  slugCache.set(normalized, {
    orgId: data.id,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
  return data.id;
}

export async function resolveOrgIdFromHost(
  host: string,
  _spoofedOrgHeader?: string | null,
): Promise<string> {
  const subdomain = extractSubdomainFromHost(host);
  if (!subdomain) {
    return DEFAULT_ORG_ID;
  }
  return resolveOrgIdFromSubdomain(subdomain);
}

export function clearOrgResolverCache(): void {
  slugCache.clear();
}
