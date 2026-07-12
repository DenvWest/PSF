import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * PartnerDesk-tabellen zijn RLS deny-all; toegang loopt uitsluitend via de
 * service-role-client (server-side). Gooit als de server niet geconfigureerd is,
 * zodat de fout zichtbaar wordt in plaats van stil `null` terug te geven.
 */
export function getPartnerDeskDb(): SupabaseClient {
  const admin = createSupabaseAdmin();
  if (!admin) {
    throw new Error(
      "PartnerDesk: Supabase service-role niet geconfigureerd (SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL).",
    );
  }
  return admin;
}

/** Slug uit een partnernaam; botsingen krijgen elders een numerieke suffix. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
