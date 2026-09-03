/**
 * orgScoped() — verplichte deur voor NIEUWE code die org-gedragen tabellen leest/schrijft.
 *
 * Waarom dit bestaat: service-role omzeilt RLS volledig, dus tenant-isolatie hangt
 * vandaag 100% af van of de app-code `.eq("organization_id", …)` niet vergeet.
 * Van de 77 bestaande call-sites op createSupabaseAdmin() doet ~5% dat filter.
 * Dat is bij één org onschadelijk (DEFAULT_ORG_ID is altijd het juiste antwoord),
 * maar bij een tweede tenant is elke vergeten filter een datalek.
 *
 * Wat dit NIET is: een migratie van de 77 bestaande call-sites. Die blijven ongemoeid —
 * dat is een refactor die pas loont zodra er een tweede tenant is (zie A5 in
 * docs/research/VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md). Dit is alleen de deur
 * die je nu al openhoudt voor nieuwe code, zodat die refactor bij tenant 2 kleiner is.
 *
 * Gebruik: `orgScoped(orgId).from("intake_sessions")` filtert select/update/delete
 * automatisch op organization_id en injecteert het bij insert/upsert. Tabellen die
 * bewust mono blijven (pd_*, af_*, recovery_tokens, …) gaan via `unscoped()` — dat
 * maakt "geen filter" een zichtbare keuze in plaats van een vergeten regel.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

type Row = Record<string, unknown>;

export interface ScopedQueryBuilder {
  select(columns?: string, options?: Record<string, unknown>): unknown;
  insert(values: Row | Row[]): unknown;
  upsert(values: Row | Row[], options?: Record<string, unknown>): unknown;
  update(values: Row): unknown;
  delete(): unknown;
}

function withOrgId<T extends Row>(values: T, orgId: string): T {
  return { ...values, organization_id: orgId };
}

/**
 * Client waarvan elke `.from(table)` het organization_id-filter/injectie automatisch
 * toepast. Alleen bedoeld voor tabellen die een `organization_id`-kolom dragen.
 */
/** Het type dat `orgScoped()` teruggeeft — voor server-lagen die hem aannemen. */
export type OrgScopedClient = ReturnType<typeof orgScoped>;

export function orgScoped(orgId: string) {
  const admin = createSupabaseAdmin();

  return {
    raw: admin,
    from(table: string) {
      if (!admin) {
        throw new Error(`orgScoped(${table}): Supabase admin client unavailable`);
      }

      const base = admin.from(table);

      return {
        select(...args: Parameters<typeof base.select>) {
          return base.select(...args).eq("organization_id", orgId);
        },
        insert(values: Row | Row[]) {
          const scoped = Array.isArray(values)
            ? values.map((v) => withOrgId(v, orgId))
            : withOrgId(values, orgId);
          return base.insert(scoped as never);
        },
        upsert(values: Row | Row[], options?: Record<string, unknown>) {
          const scoped = Array.isArray(values)
            ? values.map((v) => withOrgId(v, orgId))
            : withOrgId(values, orgId);
          return base.upsert(scoped as never, options as never);
        },
        update(values: Row) {
          return base.update(values as never).eq("organization_id", orgId);
        },
        delete() {
          return base.delete().eq("organization_id", orgId);
        },
      } satisfies ScopedQueryBuilder;
    },
  };
}

/**
 * Expliciete uitgang voor tabellen die bewust mono blijven (pd_*, af_*, recovery_tokens, …).
 * Bestaat zodat "geen org-filter" een zichtbare keuze is in code review, niet stilte.
 */
export function unscoped(): SupabaseClient | null {
  return createSupabaseAdmin();
}
