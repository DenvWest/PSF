# Maandelijkse strategiereview — competitor, funnel, SWOT, acties

**Frequentie:** 1× per maand (1e werkdag)
**Type:** read-only strategische review — rapporteert, wijzigt geen code
**Owner:** Dennis
**Complementair aan:** [`weekly-routines-claude-code.md`](weekly-routines-claude-code.md) (technische/compliance-wekelijks)

---

## Scheduling (Cursor)

Dit bestand bevat de prompts; scheduling gebeurt in Cursor UI:

1. Open Cursor → **Schedule** (cloud agent / `/schedule`)
2. Stel in: **1× per maand**, bijv. 1e werkdag 08:00
3. Plak [Prompt A — Fase 1](#prompt-a--fase-1-schedule) in de schedule
4. Na de run: voer [SQL S1–S6](#sql-templates-supabase) uit in Supabase SQL Editor (±5 min) en start [Prompt B — Fase 2](#prompt-b--fase-2-funnel-vervolg) met de resultaten

Geen Supabase MCP of credentials in de scheduled agent — funnel-data komt via handmatige SQL-export (hybride).

---

## Werkmodel (hybride)

De schedule is **trigger + ~80% kant-en-klaar**, geen volledig autonoom rapport. Bewuste keuze: geen DB-credentials in de cloud-agent.

| Fase | Wie | Wat |
|---|---|---|
| **Fase 1** (automatisch) | Scheduled cloud-agent | Blok 1 (competitor/SEO), voorlopig Blok 3+4, Blok 2 = `⏳ wacht op funnel-SQL` |
| **Fase 2** (handmatig) | Dennis + vervolg-chat | SQL S1–S6 in Supabase, tabellen plakken, agent vult Blok 2 en herziet SWOT/acties |

**100% automatisch later?** Upgradepad = read-only Supabase-key in de agent (nooit service-role). Voor 1×/maand is dat de moeite én het risico nu niet waard.

Funnel-bron: `affiliate_clicks` (simpel, schema-correct). `domain_events` (`affiliate.click`) is optioneel rijker voor stap-voor-stap funnel later — niet nodig nu.

---

## Shared execution contract

```text
Execution Contract (verplicht):
- Baseline: vergelijk tegen live site + docs op `main`.
- READ-ONLY: geen bestanden wijzigen, geen commits, geen git push.
- Geen auto-fix in code; alleen strategische bevindingen en acties.
- Bij twijfel: markeer als "Onbekend" met bron/URL.
- Lever alleen markdown-output in dit format:

## Executive summary
- Maand:
- Fase: 1 (voorlopig) | 2 (definitief)
- Scope:
- Resultaat:
- Risiconiveau: 🔴 / 🟡 / 🟢

## Blok 1 — Competitor/SEO
| Term | Positie PSF | Top concurrenten | Opvallende claims | Affiliate-signalen |
|---|---|---|---|---|

## Blok 2 — Funnel (Supabase-data)
Status: ✅ ingevuld | ⏳ wacht op funnel-SQL

| Metric | Deze maand | Vorige maand | Trend |
|---|---|---|---|

## Blok 3 — SWOT (actionable)
### Strengths
### Weaknesses
### Opportunities
### Threats

## Blok 4 — 3 acties deze maand
| # | Actie | Gekoppeld aan roadmap | Eigenaar | Deadline |
|---|---|---|---|---|

## Checklist
- [ ] Web search op alle kerntermen
- [ ] Funnel-SQL uitgevoerd en geïnterpreteerd (Fase 2)
- [ ] SWOT gevoed door blok 1+2 (niet generiek)
- [ ] Acties gekoppeld aan PAGE_ROADMAP / CURRENT_SPRINT

## Known limitations
- ...
```

**Statusregels:**
- Fase 1: Blok 2 altijd `⏳ wacht op funnel-SQL`; label Blok 3+4 als **voorlopig**
- Fase 2: Blok 2 `✅ ingevuld` zodra Dennis SQL-resultaten heeft geplakt; herzie Blok 3+4 met echte cijfers

---

## SQL-templates (Supabase)

Voer **één query per keer** uit in **Supabase SQL Editor**. Geen markdown-headers (`### S2`) in de editor — dat is geen SQL.

**Datums:** ISO-volgorde `'YYYY-MM-DD'` tussen enkele quotes. **Geen** `:maand_start` of `:01-07-2026` — dat werkt niet in de SQL Editor.

| Periode | `>=` (start) | `<` (eind, exclusief) |
|---|---|---|
| Juli 2026 | `'2026-07-01'` | `'2026-08-01'` |
| Juni 2026 (vorige maand, trend) | `'2026-06-01'` | `'2026-07-01'` |

Pas bij elke maand alleen die twee datums aan. Geen PII — alleen aggregaten. Tabellen: [`docs/core/ENTITY_MODEL.md`](../core/ENTITY_MODEL.md).

### S1 — Intake-sessies totaal per maand

```sql
SELECT
  date_trunc('month', created_at AT TIME ZONE 'Europe/Amsterdam') AS maand,
  COUNT(*) AS sessions_totaal
FROM intake_sessions
WHERE session_kind = 'initial'
  AND created_at >= '2026-07-01'::timestamptz
  AND created_at < '2026-08-01'::timestamptz
GROUP BY 1
ORDER BY 1;
```

### S2 — Sessies per profiellabel

```sql
SELECT
  profile_label,
  COUNT(*) AS aantal
FROM intake_sessions
WHERE session_kind = 'initial'
  AND created_at >= '2026-07-01'::timestamptz
  AND created_at < '2026-08-01'::timestamptz
GROUP BY profile_label
ORDER BY aantal DESC;
```

### S3 — Sessies per urgentieniveau

```sql
SELECT
  urgency_level,
  COUNT(*) AS aantal
FROM intake_sessions
WHERE session_kind = 'initial'
  AND created_at >= '2026-07-01'::timestamptz
  AND created_at < '2026-08-01'::timestamptz
GROUP BY urgency_level
ORDER BY aantal DESC;
```

### S4 — Affiliate clicks per categorie/slug

```sql
SELECT
  COALESCE(categorie, 'onbekend') AS categorie,
  COUNT(*) AS clicks
FROM affiliate_clicks
WHERE "timestamp" >= '2026-07-01'::timestamptz
  AND "timestamp" < '2026-08-01'::timestamptz
GROUP BY categorie
ORDER BY clicks DESC;
```

### S5 — Clicks per vergelijkingspagina

```sql
SELECT
  pagina,
  COUNT(*) AS clicks
FROM affiliate_clicks
WHERE "timestamp" >= '2026-07-01'::timestamptz
  AND "timestamp" < '2026-08-01'::timestamptz
  AND pagina IS NOT NULL
GROUP BY pagina
ORDER BY clicks DESC
LIMIT 20;
```

### S6 — Funnel-ratio (clicks / intake-sessies)

```sql
WITH sessions AS (
  SELECT COUNT(*) AS n
  FROM intake_sessions
  WHERE session_kind = 'initial'
    AND created_at >= '2026-07-01'::timestamptz
    AND created_at < '2026-08-01'::timestamptz
),
clicks AS (
  SELECT COUNT(*) AS n
  FROM affiliate_clicks
  WHERE "timestamp" >= '2026-07-01'::timestamptz
    AND "timestamp" < '2026-08-01'::timestamptz
)
SELECT
  sessions.n AS intake_sessions,
  clicks.n AS affiliate_clicks,
  CASE WHEN sessions.n > 0
    THEN ROUND((clicks.n::numeric / sessions.n::numeric), 4)
    ELSE NULL
  END AS clicks_per_session
FROM sessions, clicks;
```

Voor trend in Fase 2: draai S1–S6 opnieuw met juni-datums (`'2026-06-01'` / `'2026-07-01'`). Plak resultaten als markdown-tabellen in de Fase 2-agent-chat.

---

## Prompt A — Fase 1 (schedule)

Plak dit in Cursor **Schedule** (1× per maand):

```text
Je bent strategisch adviseur voor PerfectSupplement (perfectsupplement.nl).

Execution Contract (verplicht):
- Baseline: vergelijk tegen live site + docs op `main`.
- READ-ONLY: geen bestanden wijzigen, geen commits, geen git push.
- Geen auto-fix in code; alleen strategische bevindingen en acties.
- Bij twijfel: markeer als "Onbekend" met bron/URL.
- Lever markdown volgens het format in docs/cursors/monthly-strategy-review.md.
- Fase: 1 (voorlopig) — geen funnel-data beschikbaar.

## Verplichte bronnen — lees vóór je concludeert
- docs/_MASTER_INDEX.md
- docs/core/SEO_RULES.md
- docs/core/PAGE_ROADMAP.md
- docs/core/CURRENT_SPRINT.md
- docs/core/BRAND_POSITIONING.md
- docs/core/AFFILIATE_SYSTEM.md

---

## Blok 1 — Competitor/SEO-scan (web search verplicht)

Zoek actueel (NL) op deze kerntermen en rapporteer wie rankt, welke claims ze maken, en affiliate-signalen:
- beste magnesium supplement
- beste omega 3 supplement
- beste ashwagandha supplement
- supplementen vergelijken man 40

Vergelijk met onze live pagina's (/beste/*, /supplementen/*). Noteer nieuwe spelers, claim-verschuivingen, en content-gaps t.o.v. docs/core/PAGE_ROADMAP.md.

## Blok 2 — Funnel-check

Geen funnel-data beschikbaar. Zet Blok 2 op:
Status: ⏳ wacht op funnel-SQL

Laat de metriek-tabel leeg of met placeholder-kolommen.

## Blok 3 — SWOT (actionable, voorlopig)

Alleen punten die direct voortkomen uit Blok 1 en CURRENT_SPRINT. Label expliciet als **voorlopig** — wordt herzien na funnel-data.

## Blok 4 — 3 concrete acties (voorlopig)

Precies 3 acties voor deze maand, elk gekoppeld aan PAGE_ROADMAP of CURRENT_SPRINT. Label als **voorlopig**. Per actie: eigenaar (Dennis), geschatte deadline, verwachte impact.

Stop na het rapport. Geen code wijzigen.
```

---

## Prompt B — Fase 2 (funnel-vervolg)

Na Fase 1: draai SQL S1–S6, plak resultaten hieronder, start vervolg-chat (zelfde thread of nieuw):

```text
Je bent strategisch adviseur voor PerfectSupplement (perfectsupplement.nl).

Vul aan op basis van het Fase 1-rapport (maandelijkse strategiereview) + onderstaande Supabase-resultaten.

Execution Contract (verplicht):
- READ-ONLY: geen bestanden wijzigen, geen commits, geen git push.
- Lever markdown volgens het format in docs/cursors/monthly-strategy-review.md.
- Fase: 2 (definitief)

## Fase 1-rapport (plak hier)
[Plak het volledige Fase 1-rapport]

## Funnel-data — SQL S1–S6 (plak hier)
[Plak resultaten als markdown-tabellen]

---

## Blok 2 — Funnel-check

Interpreteer de Supabase-aggregaten:
- Intake-volume en profielverdeling
- Affiliate clicks per categorie/pagina
- clicks_per_session trend vs. vorige maand (indien aangeleverd)

Zet Blok 2 op: Status: ✅ ingevuld

Geen diagnoses — alleen funnel-observaties en hypothesen.

## Blok 3 — SWOT (herzien)

Herzie Blok 3 uit Fase 1 met echte funnel-cijfers. Verwijder "voorlopig"-label waar data het ondersteunt.

## Blok 4 — 3 acties (herzien)

Herzie de 3 acties uit Fase 1 op basis van Blok 1+2. Definitieve versie, geen "voorlopig".

Stop na het rapport. Geen code wijzigen.
```

---

## Wat dit document NIET doet

- Vervangt geen wekelijkse compliance/SEO/affiliate-audits (zie weekly routines)
- Haalt geen PII of e-mailadressen op
- Wijzigt geen affiliate-links of content automatisch
- Draait geen funnel-SQL automatisch in de scheduled agent

---

*Laatst bijgewerkt: juni 2026*
