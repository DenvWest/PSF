import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * De af_-tabellen zijn RLS deny-all; toegang loopt uitsluitend via de
 * service-role-client (server-side). Gooit als de server niet geconfigureerd is.
 */
export function getAffiliateDb(): SupabaseClient {
  const admin = createSupabaseAdmin();
  if (!admin) {
    throw new Error(
      "Affiliate: Supabase service-role niet geconfigureerd (SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL).",
    );
  }
  return admin;
}

/** Ref uit een naam: URL-veilige, stabiele tracking-identifier + dossier-slug. */
export function refFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
