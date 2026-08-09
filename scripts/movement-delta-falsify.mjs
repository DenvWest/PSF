#!/usr/bin/env node
/**
 * movement-delta-falsify.mjs — R0a: is de per-dimensie delta het waard?
 *
 * De premortem-hypothese bij de R0-brug luidt: "T5 (er veranderde niets) wordt
 * de standaard-ervaring, en dan is een delta-regel geen verbetering maar een
 * bevestiging van stilstand." Dit script falsifieert of bevestigt dat op echte
 * data VOORDAT de UI verbouwd wordt.
 *
 * Vier vragen:
 *   1. Hoeveel sessies hebben überhaupt ≥2 volledige beweegchecks?
 *      (Is het antwoord "bijna geen", dan is T1 de standaard-ervaring en is de
 *       delta-regel per definitie randgeval — dat is een sterker verdict dan T5.)
 *   2. Welk template zou vuren bij elk opeenvolgend paar? (T1-T7-verdeling)
 *   3. Hoe vaak wisselt de focus-dimensie tussen twee checks? (aanname A2)
 *   4. Hoeveel checks missen de MOV2_-velden in raw_inputs? (schema-drift)
 *
 * Read-only. Print UITSLUITEND aggregaten — nooit session-ids, antwoorden,
 * e-mails of losse rijen. Schrijft niets naar de database en niets naar docs/.
 *
 * Gebruik:
 *   node scripts/movement-delta-falsify.mjs
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (uit process.env, of anders uit .env.local — waarden worden nooit geprint).
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();

function loadEnv() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if ((!url || !key) && existsSync(join(ROOT, ".env.local"))) {
    const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const val = m[2].replace(/^["']|["']$/g, "").trim();
      if (m[1] === "NEXT_PUBLIC_SUPABASE_URL" && !url) url = val;
      if (m[1] === "SUPABASE_SERVICE_ROLE_KEY" && !key) key = val;
    }
  }
  return { url, key };
}

// ── Spiegelt src/data/movement-checkin/index.ts ────────────────────────────
const FIELDS = [
  ["MOV2_STR", "kracht"],
  ["MOV2_CARD", "conditie"],
  ["MOV2_VIG", "intensiteit"],
  ["MOV2_SIT", "zitten"],
  ["MOV2_COND", "conditie_ervaren"],
  ["RCV_FEEL", "herstel"],
  ["MOV2_PAIN", "klachten"],
  ["MOV2_MOB", "mobiliteit"],
  ["MOV2_FUNC", "belastbaarheid"],
  ["MOV2_CONSIST", "consistentie"],
  ["MOV2_MOTIV", "motivatie"],
];

const FOCUS_ORDER = ["zitten", "kracht", "conditie", "consistentie", "intensiteit", "mobiliteit"];

const band = (v) => (v <= 2 ? "aandacht" : v === 3 ? "redelijk" : "sterk");

/** Spiegelt buildMovementConclusion(): zwakste stuurbare dimensie + stalled-override. */
function resolveFocus(report) {
  const candidates = [];
  for (const [field, dimension] of FIELDS) {
    const value = report[field];
    if (typeof value !== "number") continue;
    if (!FOCUS_ORDER.includes(dimension)) continue;
    candidates.push({ dimension, value, band: band(value) });
  }
  candidates.sort((a, b) =>
    a.value !== b.value
      ? a.value - b.value
      : FOCUS_ORDER.indexOf(a.dimension) - FOCUS_ORDER.indexOf(b.dimension),
  );

  const stalled =
    typeof report.MOV2_CONSIST === "number" &&
    report.MOV2_CONSIST <= 2 &&
    typeof report.MOV2_MOTIV === "number" &&
    report.MOV2_MOTIV <= 2;
  const override = stalled
    ? candidates.find((c) => c.dimension === "consistentie")
    : undefined;

  const weakest = override ?? candidates[0];
  if (!weakest || weakest.band === "sterk") return null;
  return weakest;
}

/** Spiegelt buildMovementFocusDelta(): welk template zou vuren? */
function resolveTemplate(current, previous) {
  const focus = resolveFocus(current);
  const previousFocus = previous ? resolveFocus(previous) : null;

  if (focus === null) {
    return previousFocus ? "T7" : "T6";
  }

  const field = FIELDS.find(([, dim]) => dim === focus.dimension)?.[0];
  const value = current[field];
  const previousValue = previous?.[field];

  if (typeof previousValue !== "number") return "T1";
  if (value === previousValue) return "T5";
  if (band(value) !== band(previousValue)) return value > previousValue ? "T2" : "T3";
  return "T4";
}

function extractReport(rawInputs) {
  if (!rawInputs || typeof rawInputs !== "object" || Array.isArray(rawInputs)) return null;
  const report = {};
  let found = 0;
  for (const [field] of FIELDS) {
    const v = rawInputs[field];
    if (typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5) {
      report[field] = v;
      found += 1;
    }
  }
  return found === 0 ? null : { report, fieldCount: found };
}

function pct(n, total) {
  return total === 0 ? "—" : `${((n / total) * 100).toFixed(1)}%`;
}

async function main() {
  const { url, key } = loadEnv();
  if (!url || !key) {
    console.error(
      "Ontbrekende env: NEXT_PUBLIC_SUPABASE_URL en/of SUPABASE_SERVICE_ROLE_KEY.",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const rows = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("intake_domain_checkin")
      .select("session_id, created_at, raw_inputs, rules_version")
      .eq("domain_key", "movement_score")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);

    if (error) {
      console.error("Query mislukt:", error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }

  // ── Groeperen per sessie, alleen volledige checks tellen mee ─────────────
  const bySession = new Map();
  let pulseOrPartial = 0;
  let unparsable = 0;

  for (const row of rows) {
    const parsed = extractReport(row.raw_inputs);
    if (!parsed) {
      unparsable += 1;
      continue;
    }
    if (parsed.fieldCount < FIELDS.length) {
      pulseOrPartial += 1;
      continue;
    }
    if (!bySession.has(row.session_id)) bySession.set(row.session_id, []);
    bySession.get(row.session_id).push({
      report: parsed.report,
      createdAt: row.created_at,
      rulesVersion: row.rules_version,
    });
  }

  const sessions = [...bySession.values()];
  const withOne = sessions.filter((s) => s.length === 1).length;
  const withTwoPlus = sessions.filter((s) => s.length >= 2).length;

  // ── Templates over opeenvolgende paren ──────────────────────────────────
  const templates = { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0, T7: 0 };
  let pairs = 0;
  let focusSwitches = 0;
  let anyDimensionMoved = 0;
  let rulesVersionCrossings = 0;
  const gapDays = [];

  for (const checks of sessions) {
    checks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    // Eerste check van elke sessie is per definitie T1.
    templates.T1 += 1;

    for (let i = 1; i < checks.length; i += 1) {
      const previous = checks[i - 1];
      const current = checks[i];
      pairs += 1;

      templates[resolveTemplate(current.report, previous.report)] += 1;

      const focusNow = resolveFocus(current.report)?.dimension ?? null;
      const focusBefore = resolveFocus(previous.report)?.dimension ?? null;
      if (focusNow !== focusBefore) focusSwitches += 1;

      const moved = FIELDS.some(
        ([field]) =>
          typeof current.report[field] === "number" &&
          typeof previous.report[field] === "number" &&
          band(current.report[field]) !== band(previous.report[field]),
      );
      if (moved) anyDimensionMoved += 1;

      if (current.rulesVersion !== previous.rulesVersion) rulesVersionCrossings += 1;

      const days =
        (new Date(current.createdAt) - new Date(previous.createdAt)) / 86400000;
      gapDays.push(days);
    }
  }

  const medianGap =
    gapDays.length === 0
      ? null
      : [...gapDays].sort((a, b) => a - b)[Math.floor(gapDays.length / 2)];

  const totalTemplates = Object.values(templates).reduce((a, b) => a + b, 0);

  // ── Rapport ─────────────────────────────────────────────────────────────
  console.log("\n=== R0a — falsificatie per-dimensie delta ===\n");

  console.log("VRAAG 1 — is er überhaupt een tweede meting?");
  console.log(`  rijen movement_score          ${rows.length}`);
  console.log(`  ├─ onleesbaar/leeg            ${unparsable}`);
  console.log(`  ├─ pulse of onvolledig        ${pulseOrPartial}`);
  console.log(`  └─ volledige checks           ${rows.length - unparsable - pulseOrPartial}`);
  console.log(`  sessies met een check         ${sessions.length}`);
  console.log(`  ├─ precies 1 check            ${withOne}  (${pct(withOne, sessions.length)})`);
  console.log(`  └─ 2 of meer checks           ${withTwoPlus}  (${pct(withTwoPlus, sessions.length)})`);
  console.log(`  opeenvolgende paren           ${pairs}`);
  console.log(
    `  mediane tussentijd            ${medianGap === null ? "—" : `${medianGap.toFixed(1)} dagen`}`,
  );

  console.log("\nVRAAG 2 — welk template vuurt? (T1 = elke eerste check)");
  const LABELS = {
    T1: "T1 nulpunt (eerste check)",
    T2: "T2 focus een band omhoog",
    T3: "T3 focus een band lager",
    T4: "T4 binnen dezelfde band",
    T5: "T5 exact hetzelfde punt",
    T6: "T6 alles op orde, was al zo",
    T7: "T7 vorige focus opgelost",
  };
  for (const key of ["T1", "T2", "T3", "T4", "T5", "T6", "T7"]) {
    const bar = "#".repeat(Math.round((templates[key] / Math.max(totalTemplates, 1)) * 40));
    console.log(
      `  ${LABELS[key].padEnd(30)} ${String(templates[key]).padStart(5)}  ${pct(
        templates[key],
        totalTemplates,
      ).padStart(6)}  ${bar}`,
    );
  }

  console.log("\nVRAAG 3 — is de focus stabiel genoeg voor een delta?");
  console.log(
    `  focus wisselde van dimensie   ${focusSwitches} van ${pairs}  (${pct(focusSwitches, pairs)})`,
  );
  console.log(
    `  minstens 1 dimensie bewoog    ${anyDimensionMoved} van ${pairs}  (${pct(anyDimensionMoved, pairs)})`,
  );

  console.log("\nVRAAG 4 — schema-drift");
  console.log(`  paren over een rules_version-grens  ${rulesVersionCrossings}`);
  console.log(
    `  checks zonder MOV2_-velden         ${unparsable} (delta valt daar terug op T1)`,
  );

  // ── Verdict ─────────────────────────────────────────────────────────────
  const t5Share = pairs === 0 ? 0 : templates.T5 / pairs;
  const movedShare = pairs === 0 ? 0 : anyDimensionMoved / pairs;

  console.log("\n=== VERDICT ===");
  if (pairs < 10) {
    console.log(
      `  ONBESLIST — ${pairs} paren is te weinig. De delta-regel is vandaag een\n` +
        "  randgeval: bijna iedereen ziet T1. Bouw de readout, maar laat het\n" +
        "  zwaartepunt bij feit + implicatie liggen, niet bij de delta.",
    );
  } else if (t5Share >= 0.5) {
    console.log(
      `  PREMORTEM BEVESTIGD — ${pct(templates.T5, pairs)} van de paren is T5.\n` +
        "  Stilstand is de standaard-ervaring. Delta visueel ondergeschikt maken\n" +
        "  en de implicatie het gewicht geven, zoals afgesproken in §H.",
    );
  } else if (movedShare >= 0.5) {
    console.log(
      `  PREMORTEM WEERLEGD — bij ${pct(anyDimensionMoved, pairs)} van de paren\n` +
        "  bewoog minstens één dimensie van band. De delta draagt echte informatie;\n" +
        "  primaire positie is terecht.",
    );
  } else {
    console.log(
      `  GEMENGD — T5 ${pct(templates.T5, pairs)}, beweging ${pct(anyDimensionMoved, pairs)}.\n` +
        "  Delta houden, maar de alsoLine wordt de dragende regel: de focus zelf\n" +
        "  beweegt minder vaak dan de dimensies eromheen.",
    );
  }
  console.log("");
}

main().catch((err) => {
  console.error("Onverwachte fout:", err.message);
  process.exit(1);
});
