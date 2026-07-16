#!/usr/bin/env node
/**
 * item-analyse.mjs — psychometrische baseline op bestaande intake-sessies.
 *
 * Doel (S2 uit PLAN_LEEFSTIJLCHECK_UITVOERING.md): leg de nulmeting vast vóór
 * de S3-engine-bump (1.4.0), zodat een vóór/ná-vergelijking mogelijk is.
 *
 * Draait tegen Supabase (service-role) en berekent UITSLUITEND aggregaten:
 * antwoordverdeling, spreiding, vloer/plafond, item-rest-correlaties,
 * inter-item-correlaties (slaap), domeinscore- en vitaliteitspercentielen,
 * urgentie- en bandverdeling. Nooit losse sessies, e-mails of namen.
 *
 * Scores worden HERBEREKEND uit `answers` met de HUIDIGE engine-formules
 * (normalizeScore = round(sum/max*100); vitaliteit = gemiddelde 5 domeinen),
 * en vergeleken met de opgeslagen `domain_scores` om drift te detecteren.
 *
 * Gebruik:
 *   node scripts/item-analyse.mjs           # of: npm run analyse:items
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (uit process.env, of anders uit .env.local — waarden worden nooit geprint).
 *
 * De DUIDING-sectie in het rapport wordt NIET door dit script geschreven;
 * die vult Claude/Dennis handmatig in na een run. Her-draaien overschrijft
 * de tabellen (en dus de duiding-placeholder) — daarna opnieuw duiden.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const OUT_PATH = join(ROOT, "docs/research/ITEM_ANALYSE_BASELINE.md");
const LOW_N_THRESHOLD = 100;

// ── Env laden zonder waarden te lekken ─────────────────────────────────────
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

// ── Vraag-metadata (spiegelt src/data/intake-questions.ts) ─────────────────
// domain = interventiedomein; min/max = optie-waardebereik voor vloer/plafond.
const QUESTIONS = [
  { id: "SLP_QUAL", domain: "sleep", min: 1, max: 4 },
  { id: "SLP_CONS", domain: "sleep", min: 1, max: 3 },
  { id: "SLP_ONSET", domain: "sleep", min: 1, max: 4 },
  { id: "SLP_WAKE", domain: "sleep", min: 1, max: 4 },
  { id: "NRG_PATN", domain: "energy", min: 1, max: 4 },
  { id: "NRG_DEP", domain: "energy", min: 1, max: 4 },
  { id: "STR_FREQ", domain: "stress", min: 1, max: 4 },
  { id: "STR_RCV", domain: "stress", min: 1, max: 4 },
  { id: "CON_SOC", domain: "connection", min: 1, max: 4 },
  { id: "NUT_O3", domain: "nutrition", min: 1, max: 3 },
  { id: "NUT_PROT", domain: "nutrition", min: 1, max: 4 },
  { id: "MOV_STR", domain: "movement", min: 1, max: 4 },
  { id: "MOV_CARD", domain: "movement", min: 1, max: 4 },
  { id: "RCV_PHYS", domain: "recovery", min: 1, max: 3 },
  { id: "LIF_ALC", domain: "lifestyle", min: 1, max: 4 },
  { id: "LIF_SUN", domain: "lifestyle", min: 1, max: 4 },
];

const DOMAIN_ITEMS = {
  sleep: ["SLP_QUAL", "SLP_CONS", "SLP_ONSET", "SLP_WAKE"],
  energy: ["NRG_PATN", "NRG_DEP"],
  stress: ["STR_FREQ", "STR_RCV"],
  nutrition: ["NUT_O3", "NUT_PROT"],
  movement: ["MOV_STR", "MOV_CARD"],
  recovery: ["RCV_PHYS"],
  connection: ["CON_SOC"],
};

// Domein-max = som van optie-maxima (spiegelt calcDomainScores). Recovery/connection
// enkel-item. Energie/herstel zijn readouts, tellen niet mee in vitaliteit.
const DOMAIN_MAX = { sleep: 15, energy: 8, stress: 8, nutrition: 7, movement: 8, recovery: 3, connection: 4 };
const INTERVENTION_DOMAINS = ["sleep", "stress", "nutrition", "movement", "connection"];

// STR_RCV legacy-aliassen (spiegelt getStressRecoveryAnswer).
function stressRecovery(a) {
  if (a.STR_RCV != null) return num(a.STR_RCV);
  if (a.STR_RECV != null) return num(a.STR_RECV);
  if (a.RCV_MENT != null) return num(a.RCV_MENT);
  return 0;
}
function num(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}
function normalizeScore(total, max) {
  return Math.round((total / max) * 100);
}

// Herbereken domeinscores + vitaliteit uit answers (huidige engine-math).
function computeScores(a) {
  const sleep = normalizeScore(num(a.SLP_QUAL) + num(a.SLP_CONS) + num(a.SLP_ONSET) + num(a.SLP_WAKE), 15);
  const energy = normalizeScore(num(a.NRG_PATN) + num(a.NRG_DEP), 8);
  const stress = normalizeScore(num(a.STR_FREQ) + stressRecovery(a), 8);
  const nutrition = normalizeScore(num(a.NUT_O3) + num(a.NUT_PROT), 7);
  const movement = normalizeScore(num(a.MOV_STR) + num(a.MOV_CARD), 8);
  const recovery = normalizeScore(num(a.RCV_PHYS), 3);
  const connection = normalizeScore(num(a.CON_SOC), 4);
  const vitality = Math.round((sleep + stress + nutrition + movement + connection) / 5);
  return { sleep, energy, stress, nutrition, movement, recovery, connection, vitality };
}
function displayBand(score) {
  if (!Number.isFinite(score)) return "Voldoende";
  if (score >= 80) return "Sterk";
  if (score >= 60) return "Voldoende";
  if (score >= 40) return "Aandacht";
  return "Prioriteit";
}
// getUrgency (1.3.x) — herberekend uit de 5 interventiescores.
function urgency(s) {
  const v = INTERVENTION_DOMAINS.map((d) => s[d]);
  const u30 = v.filter((x) => x < 30).length;
  const u50 = v.filter((x) => x < 50).length;
  const u60 = v.filter((x) => x < 60).length;
  if (u30 >= 2) return "critical";
  if (u30 >= 1 || u50 >= 3) return "moderate";
  if (v.every((x) => x > 60)) return "healthy";
  if (v.every((x) => x > 30) && u60 >= 2) return "mild";
  return "mild";
}

// ── Statistiek-helpers ─────────────────────────────────────────────────────
function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
}
function sd(xs) {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
}
function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}
function percentile(sorted, p) {
  if (!sorted.length) return NaN;
  if (sorted.length === 1) return sorted[0];
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}
function fmt(x, d = 2) {
  return Number.isFinite(x) ? x.toFixed(d) : "—";
}
function pct(part, total) {
  return total ? `${((part / total) * 100).toFixed(1)}%` : "—";
}

// ── Data ophalen (gepagineerd) ─────────────────────────────────────────────
async function fetchAllSessions(client) {
  const page = 1000;
  let from = 0;
  const rows = [];
  for (;;) {
    const { data, error } = await client
      .from("intake_sessions")
      .select("answers, domain_scores, urgency_level, profile_label, rules_version, age_range, created_at")
      .order("created_at", { ascending: true })
      .range(from, from + page - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < page) break;
    from += page;
  }
  return rows;
}

// ── Analyse per groep sessies ──────────────────────────────────────────────
function analyseGroup(rows) {
  const answers = rows.map((r) => (r.answers && typeof r.answers === "object" ? r.answers : {}));
  const n = rows.length;

  // Per-item statistiek (alleen sessies die het item beantwoord hebben).
  const items = QUESTIONS.map((q) => {
    const vals = [];
    const dist = {};
    for (const a of answers) {
      const raw = a[q.id];
      if (typeof raw === "number" && Number.isFinite(raw)) {
        vals.push(raw);
        dist[raw] = (dist[raw] || 0) + 1;
      }
    }
    const floor = vals.filter((v) => v === q.min).length;
    const ceil = vals.filter((v) => v === q.max).length;
    return {
      id: q.id,
      domain: q.domain,
      n: vals.length,
      mean: mean(vals),
      sd: sd(vals),
      floorPct: vals.length ? floor / vals.length : NaN,
      ceilPct: vals.length ? ceil / vals.length : NaN,
      dist,
      vals,
    };
  });
  const itemById = Object.fromEntries(items.map((it) => [it.id, it]));

  // Item-rest-correlatie binnen domein (domeinen ≥2 items). Complete-case:
  // sessie telt alleen mee als álle items van het domein numeriek beantwoord zijn.
  const isNum = (v) => typeof v === "number" && Number.isFinite(v);
  const itemRest = [];
  for (const [domain, ids] of Object.entries(DOMAIN_ITEMS)) {
    if (ids.length < 2) continue;
    for (const id of ids) {
      const otherIds = ids.filter((o) => o !== id);
      const xs = [];
      const rest = [];
      for (const a of answers) {
        if (!ids.every((qid) => isNum(a[qid]))) continue;
        xs.push(a[id]);
        rest.push(otherIds.reduce((s, o) => s + a[o], 0));
      }
      itemRest.push({ domain, id, n: xs.length, r: pearson(xs, rest) });
    }
  }

  // Inter-item-correlaties binnen slaap.
  const sleepIds = DOMAIN_ITEMS.sleep;
  const sleepPairs = [];
  for (let i = 0; i < sleepIds.length; i++) {
    for (let j = i + 1; j < sleepIds.length; j++) {
      const a1 = sleepIds[i];
      const a2 = sleepIds[j];
      const xs = [];
      const ys = [];
      for (const a of answers) {
        if (typeof a[a1] === "number" && typeof a[a2] === "number") {
          xs.push(a[a1]);
          ys.push(a[a2]);
        }
      }
      sleepPairs.push({ a: a1, b: a2, n: xs.length, r: pearson(xs, ys) });
    }
  }

  // Domeinscore- + vitaliteitsverdeling (herberekend) + drift vs opgeslagen.
  const domainVals = { sleep: [], energy: [], stress: [], nutrition: [], movement: [], recovery: [], connection: [] };
  const vitalityVals = [];
  const urgencyCount = { critical: 0, moderate: 0, mild: 0, healthy: 0 };
  const bandCount = { Sterk: 0, Voldoende: 0, Aandacht: 0, Prioriteit: 0 };
  const storedUrgencyCount = {};
  let driftCount = 0;
  let driftComparable = 0;

  for (let k = 0; k < answers.length; k++) {
    const s = computeScores(answers[k]);
    for (const d of Object.keys(domainVals)) domainVals[d].push(s[d]);
    vitalityVals.push(s.vitality);
    urgencyCount[urgency(s)]++;
    bandCount[displayBand(s.vitality)]++;

    const storedU = rows[k].urgency_level;
    if (typeof storedU === "string") storedUrgencyCount[storedU] = (storedUrgencyCount[storedU] || 0) + 1;

    const stored = rows[k].domain_scores;
    if (stored && typeof stored === "object") {
      driftComparable++;
      const keys = ["sleep_score", "stress_score", "nutrition_score", "movement_score", "connection_score"];
      const map = { sleep_score: s.sleep, stress_score: s.stress, nutrition_score: s.nutrition, movement_score: s.movement, connection_score: s.connection };
      let drift = false;
      for (const key of keys) {
        if (typeof stored[key] === "number" && Math.abs(stored[key] - map[key]) > 1) drift = true;
      }
      if (drift) driftCount++;
    }
  }

  function distSummary(vals) {
    const sorted = [...vals].sort((a, b) => a - b);
    return {
      n: vals.length,
      mean: mean(vals),
      sd: sd(vals),
      min: sorted[0],
      p10: percentile(sorted, 10),
      p25: percentile(sorted, 25),
      p50: percentile(sorted, 50),
      p75: percentile(sorted, 75),
      p90: percentile(sorted, 90),
      max: sorted[sorted.length - 1],
    };
  }

  return {
    n,
    items,
    itemById,
    itemRest,
    sleepPairs,
    domainDist: Object.fromEntries(Object.entries(domainVals).map(([d, v]) => [d, distSummary(v)])),
    vitalityDist: distSummary(vitalityVals),
    urgencyCount,
    storedUrgencyCount,
    bandCount,
    driftCount,
    driftComparable,
  };
}

// ── Rapport renderen ───────────────────────────────────────────────────────
function renderReport(byVersion, totalN, generatedAt) {
  const L = [];
  L.push("# Item-analyse — psychometrische baseline Leefstijlcheck");
  L.push("");
  L.push(`*Automatisch gegenereerd door \`scripts/item-analyse.mjs\` op ${generatedAt}. Alleen aggregaten — geen individuele sessies, e-mails of namen. Scores zijn HERBEREKEND uit \`answers\` met de engine-formules van RULES_VERSION 1.3.x (pre-S3-bump); dit is de nulmeting voor de vóór/ná-vergelijking bij 1.4.0.*`);
  L.push("");
  L.push("> **Duiding staat onderaan** en wordt handmatig geschreven (niet door het script). Her-draaien overschrijft dit bestand inclusief de duiding-sectie — daarna opnieuw duiden.");
  L.push("");
  L.push(`**Totaal sessies:** ${totalN}`);
  L.push("");

  // N per generatie.
  L.push("## N per rules_version-generatie");
  L.push("");
  L.push("| rules_version | N | aandeel |");
  L.push("|---|---|---|");
  for (const [ver, g] of byVersion) L.push(`| \`${ver}\` | ${g.n} | ${pct(g.n, totalN)} |`);
  L.push("");

  for (const [ver, g] of byVersion) {
    L.push(`---`);
    L.push("");
    L.push(`## Generatie \`${ver}\` — N = ${g.n}`);
    L.push("");
    if (g.n < LOW_N_THRESHOLD) {
      L.push(`> ⚠️ **Lage N (< ${LOW_N_THRESHOLD}).** Verdeling- en correlatiecijfers zijn indicatief, niet conclusief. Trek geen harde psychometrische conclusies; gebruik als richting, niet als bewijs.`);
      L.push("");
    }

    // Item-statistiek.
    L.push("### Item-statistiek (antwoordverdeling, spreiding, vloer/plafond)");
    L.push("");
    L.push("| item | domein | N | gem. | SD | vloer% | plafond% | 1 | 2 | 3 | 4 |");
    L.push("|---|---|---|---|---|---|---|---|---|---|---|");
    for (const it of g.items) {
      const d = it.dist;
      L.push(
        `| ${it.id} | ${it.domain} | ${it.n} | ${fmt(it.mean)} | ${fmt(it.sd)} | ${fmt(it.floorPct * 100, 1)}% | ${fmt(it.ceilPct * 100, 1)}% | ${d[1] || 0} | ${d[2] || 0} | ${d[3] || 0} | ${d[4] || 0} |`,
      );
    }
    L.push("");
    L.push("*Vloer% = aandeel op laagste optie; plafond% = aandeel op hoogste optie. SD dicht bij 0 of hoge vloer/plafond = zwak discriminerend item.*");
    L.push("");

    // Item-rest.
    L.push("### Item-rest-correlatie (item vs. som overige domein-items)");
    L.push("");
    L.push("| domein | item | N | r(item, rest) |");
    L.push("|---|---|---|---|");
    for (const ir of g.itemRest) L.push(`| ${ir.domain} | ${ir.id} | ${ir.n} | ${ir.r == null ? "—" : fmt(ir.r)} |`);
    L.push("");
    L.push("*Vuistregel: r < 0,30 = item meet iets anders dan de rest van het domein; zeer hoge r (> 0,80) bij 2-item-domeinen kan redundantie zijn.*");
    L.push("");

    // Slaap inter-item.
    L.push("### Inter-item-correlaties binnen slaap (SLP_QUAL↔SLP_WAKE-overlap)");
    L.push("");
    L.push("| paar | N | r |");
    L.push("|---|---|---|");
    for (const p of g.sleepPairs) L.push(`| ${p.a} ↔ ${p.b} | ${p.n} | ${p.r == null ? "—" : fmt(p.r)} |`);
    L.push("");

    // Domeinverdeling.
    L.push("### Domeinscore-verdeling (herberekend, 0–100)");
    L.push("");
    L.push("| domein | N | gem. | SD | min | p10 | p25 | p50 | p75 | p90 | max |");
    L.push("|---|---|---|---|---|---|---|---|---|---|---|");
    for (const d of Object.keys(g.domainDist)) {
      const s = g.domainDist[d];
      const readout = d === "energy" || d === "recovery" ? " *(readout)*" : "";
      L.push(
        `| ${d}${readout} | ${s.n} | ${fmt(s.mean, 1)} | ${fmt(s.sd, 1)} | ${fmt(s.min, 0)} | ${fmt(s.p10, 0)} | ${fmt(s.p25, 0)} | ${fmt(s.p50, 0)} | ${fmt(s.p75, 0)} | ${fmt(s.p90, 0)} | ${fmt(s.max, 0)} |`,
      );
    }
    L.push("");
    L.push(`*Effectieve vloer per domein = normalizeScore(aantal_items, max) — bij optie-min 1 ligt de laagst mogelijke score dus boven 0. Sleep-min ≈ ${normalizeScore(4, 15)}, energy/stress/movement-min ≈ ${normalizeScore(2, 8)}, nutrition-min ≈ ${normalizeScore(2, 7)}, recovery-min ≈ ${normalizeScore(1, 3)}, connection-min ≈ ${normalizeScore(1, 4)}. Dit is het kern-artefact dat S3 herschaalt.*`);
    L.push("");

    // Vitaliteit.
    const v = g.vitalityDist;
    L.push("### Vitaliteitsscore-verdeling (gemiddelde 5 interventiedomeinen)");
    L.push("");
    L.push("| N | gem. | SD | min | p10 | p25 | p50 | p75 | p90 | max |");
    L.push("|---|---|---|---|---|---|---|---|---|---|");
    L.push(`| ${v.n} | ${fmt(v.mean, 1)} | ${fmt(v.sd, 1)} | ${fmt(v.min, 0)} | ${fmt(v.p10, 0)} | ${fmt(v.p25, 0)} | ${fmt(v.p50, 0)} | ${fmt(v.p75, 0)} | ${fmt(v.p90, 0)} | ${fmt(v.max, 0)} |`);
    L.push("");

    // Urgentie + band.
    L.push("### Urgentie- en bandverdeling (herberekend)");
    L.push("");
    L.push("| urgentieniveau | N | aandeel |");
    L.push("|---|---|---|");
    for (const lvl of ["critical", "moderate", "mild", "healthy"]) L.push(`| ${lvl} | ${g.urgencyCount[lvl]} | ${pct(g.urgencyCount[lvl], g.n)} |`);
    L.push("");
    L.push("| vitaliteitsband | N | aandeel |");
    L.push("|---|---|---|");
    for (const b of ["Sterk", "Voldoende", "Aandacht", "Prioriteit"]) L.push(`| ${b} | ${g.bandCount[b]} | ${pct(g.bandCount[b], g.n)} |`);
    L.push("");

    // Drift + stored urgency.
    L.push("### Integriteit: herberekend vs. opgeslagen");
    L.push("");
    L.push(`- Sessies met vergelijkbare opgeslagen \`domain_scores\`: ${g.driftComparable}`);
    L.push(`- Waarvan een interventiedomein > 1 punt afwijkt van de herberekening: **${g.driftCount}** (${pct(g.driftCount, g.driftComparable)})`);
    const storedKeys = Object.keys(g.storedUrgencyCount);
    if (storedKeys.length) {
      L.push(`- Opgeslagen \`urgency_level\`-verdeling: ${storedKeys.map((k) => `${k}=${g.storedUrgencyCount[k]}`).join(", ")}`);
    }
    L.push("");
    L.push("*Drift > 0 duidt op sessies gescoord onder een andere regelset dan hun `rules_version` suggereert, of op opslag onder een oudere engine. Relevant voor legacy-vergelijking bij hermeting.*");
    L.push("");
  }

  L.push("---");
  L.push("");
  L.push("## Duiding (handmatig — niet door het script gegenereerd)");
  L.push("");
  L.push("<!-- DUIDING_PLACEHOLDER -->");
  L.push("_Nog in te vullen na deze run._");
  L.push("");
  return L.join("\n");
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const { url, key } = loadEnv();
  if (!url || !key) {
    console.error("FOUT: NEXT_PUBLIC_SUPABASE_URL en/of SUPABASE_SERVICE_ROLE_KEY ontbreken (env of .env.local).");
    process.exit(1);
  }
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  console.log("Sessies ophalen…");
  const rows = await fetchAllSessions(client);
  console.log(`Opgehaald: ${rows.length} sessies.`);
  if (rows.length === 0) {
    console.error("Geen sessies gevonden — rapport niet geschreven.");
    process.exit(1);
  }

  // Groeperen per rules_version (null → 'onbekend').
  const groups = new Map();
  for (const r of rows) {
    const ver = typeof r.rules_version === "string" && r.rules_version.trim() ? r.rules_version.trim() : "onbekend";
    if (!groups.has(ver)) groups.set(ver, []);
    groups.get(ver).push(r);
  }
  // Sorteer versies aflopend (nieuwste eerst), 'onbekend' achteraan.
  const byVersion = [...groups.entries()]
    .sort((a, b) => (a[0] === "onbekend" ? 1 : b[0] === "onbekend" ? -1 : b[0].localeCompare(a[0], undefined, { numeric: true })))
    .map(([ver, rs]) => [ver, analyseGroup(rs)]);

  const report = renderReport(byVersion, rows.length, new Date().toISOString().slice(0, 10));
  writeFileSync(OUT_PATH, report, "utf8");
  console.log(`Rapport geschreven: ${OUT_PATH}`);

  // Beknopte console-samenvatting.
  for (const [ver, g] of byVersion) {
    console.log(`  ${ver}: N=${g.n}, vitaliteit p50=${fmt(g.vitalityDist.p50, 0)}, drift=${g.driftCount}/${g.driftComparable}`);
  }
}

main().catch((err) => {
  console.error("FOUT tijdens analyse:", err.message);
  process.exit(1);
});
