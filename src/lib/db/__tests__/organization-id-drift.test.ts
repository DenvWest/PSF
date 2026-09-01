import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Bewaakt A3's "geen goed voornemen maar een mechanisme": elke nieuwe consumenten-tabel
 * moet organization_id dragen, ook als hij pas in een latere migratie via
 * `alter table ... add column` verschijnt. Faalt op de dag dat tabel 63 het vergeet,
 * niet drie maanden later.
 *
 * pd_* en af_* zijn BEWUST mono — dat zijn jouw administratieve domeinen (PartnerDesk,
 * eigen affiliate-programma), geen tenants. Zie A3 in
 * docs/research/VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md.
 */

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

// Tabellen die bewust GEEN organization_id dragen. Nieuwe entries hier zijn een
// zichtbare keuze in code review, geen stilzwijgen.
const MONO_TABLE_ALLOWLIST = new Set([
  // De tenant-tabel zelf kan niet naar zichzelf verwijzen.
  "organizations",
  // Kortlevend en/of hangt aan een tabel die al scoped is (accounts, cprofile_profile) —
  // org volgt uit de relatie, een eigen kolom voegt een tweede plek toe waar het fout kan.
  "recovery_tokens",
  "account_login_tokens",
  "cprofile_tag",
  // A3: dit is een geldnaad (wie premium heeft); ontbreken van de kolom is bekend risico,
  // maar de kolom + backfill is een schema-migratie buiten de scope van het deur-open-werk.
  "account_entitlements",
  // 18 aug 2026: pure drift, geen keuze — zie psf-supplementen-zijbalk-suppco memory.
  "account_favorites",
  // A3: dragen eindgebruikers-e-mailadressen, horen bij een merk. Bekende drift,
  // kolom + backfill is een schema-migratie buiten de scope van het deur-open-werk.
  "premium_waitlist",
  "guide_opt_ins",
  "nurture_emails",
]);

function readMigrationFiles(): { name: string; sql: string }[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((name) => ({
      name,
      sql: readFileSync(path.join(MIGRATIONS_DIR, name), "utf8"),
    }));
}

function stripComments(sql: string): string {
  return sql.replace(/--.*$/gm, "");
}

/**
 * Reconstrueert per tabel of hij ooit organization_id kreeg, over alle migraties heen —
 * hetzij inline in `create table`, hetzij later via `alter table ... add column`.
 */
function buildOrganizationIdCoverage(): Map<string, boolean> {
  const coverage = new Map<string, boolean>();
  const createTableRe = /create\s+table\s+if\s+not\s+exists\s+public\.(\w+)\s*\(([\s\S]*?)\n\);/gi;
  const alterAddColumnRe =
    /alter\s+table\s+public\.(\w+)\s*\n?\s*add\s+column\s+if\s+not\s+exists\s+organization_id\b/gi;

  for (const { sql } of readMigrationFiles()) {
    const clean = stripComments(sql);

    for (const match of clean.matchAll(createTableRe)) {
      const [, table, body] = match;
      if (!coverage.has(table)) {
        coverage.set(table, /\borganization_id\b/.test(body));
      }
    }

    for (const match of clean.matchAll(alterAddColumnRe)) {
      const [, table] = match;
      coverage.set(table, true);
    }
  }

  return coverage;
}

describe("organization_id drift", () => {
  it("elke nieuwe consumenten-tabel draagt organization_id, tenzij bewust mono", () => {
    const coverage = buildOrganizationIdCoverage();
    const missing: string[] = [];

    for (const [table, hasOrgId] of coverage) {
      if (hasOrgId) continue;
      if (MONO_TABLE_ALLOWLIST.has(table)) continue;
      if (table.startsWith("pd_") || table.startsWith("af_")) continue;
      missing.push(table);
    }

    expect(
      missing,
      `Tabellen zonder organization_id en niet op de mono-allowlist: ${missing.join(", ")}. ` +
        `Voeg de kolom toe, of zet de tabel bewust op MONO_TABLE_ALLOWLIST in dit testbestand ` +
        `(alleen als hij écht mono moet blijven, zoals pd_*/af_*).`,
    ).toEqual([]);
  });

  it("MONO_TABLE_ALLOWLIST bevat geen tabellen die inmiddels wél organization_id dragen", () => {
    const coverage = buildOrganizationIdCoverage();
    const stale = [...MONO_TABLE_ALLOWLIST].filter((table) => coverage.get(table) === true);

    expect(
      stale,
      `Deze tabellen dragen al organization_id maar staan nog op de mono-allowlist: ${stale.join(", ")}. Haal ze eraf.`,
    ).toEqual([]);
  });
});
