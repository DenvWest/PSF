"use server";

import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}
export interface SearchGroup {
  key: string;
  label: string;
  items: SearchItem[];
}

const NAV_ACTIONS: SearchItem[] = [
  { id: "nav-vandaag", title: "Ga naar Vandaag", href: "/admin" },
  { id: "nav-partners", title: "Partners — nieuwe toevoegen", href: "/admin/partners" },
  { id: "nav-taken", title: "Ga naar Taken", href: "/admin/taken" },
  { id: "nav-instellingen", title: "Ga naar Instellingen", href: "/admin/instellingen" },
];

function esc(term: string): string {
  return term.replace(/[%_]/g, (m) => `\\${m}`);
}

async function partnerMap(db: SupabaseClient) {
  const { data } = await db.from("pd_partners").select("id, name, slug");
  return new Map(
    (data ?? []).map((p) => [p.id as string, { name: p.name as string, slug: p.slug as string }]),
  );
}

export async function searchPartnerDesk(rawQuery: string): Promise<SearchGroup[]> {
  const db = getPartnerDeskDb();
  const trimmed = rawQuery.trim();

  // Prefixes: p= partners, c= contacten, t= taken, >= acties.
  let scope: "all" | "partners" | "contacts" | "tasks" | "actions" = "all";
  let q = trimmed;
  const m = /^([pct>])\s+(.*)$/.exec(trimmed);
  if (m) {
    scope = m[1] === "p" ? "partners" : m[1] === "c" ? "contacts" : m[1] === "t" ? "tasks" : "actions";
    q = m[2];
  }

  // Lege query of acties-scope: navigatie + recente partners.
  if (q.length < 2 || scope === "actions") {
    const groups: SearchGroup[] = [];
    const actions = q
      ? NAV_ACTIONS.filter((a) => a.title.toLowerCase().includes(q.toLowerCase()))
      : NAV_ACTIONS;
    if (actions.length > 0) groups.push({ key: "actions", label: "Acties", items: actions });
    if (scope !== "actions") {
      const { data } = await db
        .from("pd_partners")
        .select("id, name, slug")
        .is("archived_at", null)
        .order("updated_at", { ascending: false })
        .limit(5);
      const items = (data ?? []).map((p) => ({
        id: p.id as string,
        title: p.name as string,
        href: `/admin/partners/${p.slug}`,
      }));
      if (items.length > 0) groups.push({ key: "recent", label: "Recent", items });
    }
    return groups;
  }

  const like = `%${esc(q)}%`;
  const groups: SearchGroup[] = [];
  const pmap = await partnerMap(db);

  if (scope === "all" || scope === "partners") {
    const { data } = await db
      .from("pd_partners")
      .select("id, name, slug")
      .ilike("name", like)
      .is("archived_at", null)
      .limit(5);
    const items = (data ?? []).map((p) => ({
      id: p.id as string,
      title: p.name as string,
      href: `/admin/partners/${p.slug}`,
    }));
    if (items.length) groups.push({ key: "partners", label: "Partners", items });
  }

  if (scope === "all" || scope === "contacts") {
    const { data } = await db
      .from("pd_contacts")
      .select("id, name, email, partner_id")
      .or(`name.ilike.${like},email.ilike.${like}`)
      .is("archived_at", null)
      .limit(5);
    const items = (data ?? []).map((c) => {
      const p = pmap.get(c.partner_id as string);
      return {
        id: c.id as string,
        title: c.name as string,
        subtitle: (c.email as string | null) ?? p?.name,
        href: `/admin/partners/${p?.slug ?? ""}#contactpersonen`,
      };
    });
    if (items.length) groups.push({ key: "contacts", label: "Contacten", items });
  }

  if (scope === "all") {
    const { data } = await db
      .from("pd_contracts")
      .select("id, number, partner_id")
      .ilike("number", like)
      .is("archived_at", null)
      .limit(5);
    const items = (data ?? []).map((c) => {
      const p = pmap.get(c.partner_id as string);
      return {
        id: c.id as string,
        title: c.number as string,
        subtitle: p?.name,
        href: `/admin/partners/${p?.slug ?? ""}#contracten`,
      };
    });
    if (items.length) groups.push({ key: "contracts", label: "Contracten", items });
  }

  if (scope === "all" || scope === "tasks") {
    const { data } = await db
      .from("pd_tasks")
      .select("id, title, partner_id, status")
      .ilike("title", like)
      .eq("status", "open")
      .limit(5);
    const items = (data ?? []).map((t) => {
      const p = t.partner_id ? pmap.get(t.partner_id as string) : undefined;
      return {
        id: t.id as string,
        title: t.title as string,
        subtitle: p?.name,
        href: p ? `/admin/partners/${p.slug}#taken` : "/admin/taken",
      };
    });
    if (items.length) groups.push({ key: "tasks", label: "Taken", items });
  }

  if (scope === "all") {
    const { data } = await db
      .from("pd_timeline_events")
      .select("id, body, partner_id")
      .eq("kind", "note")
      .ilike("body", like)
      .limit(5);
    const items = (data ?? []).map((n) => {
      const p = pmap.get(n.partner_id as string);
      return {
        id: n.id as string,
        title: (n.body as string).slice(0, 60),
        subtitle: p?.name,
        href: `/admin/partners/${p?.slug ?? ""}#tijdlijn`,
      };
    });
    if (items.length) groups.push({ key: "notes", label: "Notities", items });
  }

  return groups;
}
