# Gap-analyse: nutrition intelligence, SEO-kennisplatform, voedingsketen

**Datum:** 15 september 2026
**Status:** onderzoeksrapport tegen `origin/main` @ `ad93564c` (merge PR #11 `claude/voedingsdagboek-kompas-po1nua`)
**Doel:** naslag voor Claude Opus als input voor een master-architectuurplan. Geen bouwplan, geen code.
**Methode:** elk van de 11 ideeën is getoetst aan routes, `src/lib`, `src/data`, `supabase/migrations`, types en bestaande docs. Geen brainstorm.

> Lees dit document **na** [`docs/_MASTER_INDEX.md`](../_MASTER_INDEX.md) en [`CLAUDE.md`](../../CLAUDE.md). Waar dit rapport en oudere docs botsen, wint de **code** — enkele Layer-1-docs zijn achterop (zie §8).

---

## 1. Executive summary

Perfectsupplement is **geen** voedingskennisplatform en **geen** programmatic-SEO-fabriek. Het is een leefstijlcheck + dashboard (Kompas / Voortgang / Agenda / Keuze) met een redactioneel spinnenweb (pillars, blogs, kennisbank, gidsen) en een smalle, EFSA-gegate affiliate-vergelijkingsas (`/beste/*`, ~25 producten, berekende PS-Score op `/product/[slug]`). Monetisatie is affiliate; PartnerDesk (`pd_*`) en het eigen affiliate-programma (`af_*`) zijn interne admin-platformen, los van de consumenten-site.

Het geschetste kennisplatform (USDA-engine, knowledge graph, content factory, persoonlijke voedingsdatabase, programmatic pages, site-wide search, data lineage) beschrijft grotendeels **andere producten**. De overlap zit in de **voedingsketen die al gebouwd is** — en die is groter dan de elf ideeën veronderstellen.

### Wat Perfectsupplement NU is (feiten uit de repo)

| Laag | Wat live / in code staat | Pad |
|---|---|---|
| Publieke SEO-site | 7 leefstijl-pillars, 4 profielen, ~79 blogs, 37 kennisbanktermen, 8 supplementgidsen, 7 vergelijkingen, productdetail, `/inzichten`-feed, `/gidsen` | `src/app/*`, `src/data/*` |
| Leefstijlcheck | 7 domeinen, `RULES_VERSION` **1.7.0**, profiellabels, nurture | `src/lib/intake-engine.ts` |
| Voedingscheck | 12 sliders + voorkeur/allergie, 5 nutriënt-banden, leefstijl-eerst + EFSA-gate | `/intake/voeding`, `nutrition-score.ts`, `nutrition-advice.ts` |
| Voedingsdagboek | 2+2-steekproef (porties per groep, eetmomenten, water); **geen** product-items in het schema | `account_nutrition_daybook`, `NutritionDagboekPaneel.tsx` |
| Voedingscatalogus | 371 logbare middelen, 23 zoekcategorieën, 13 voedselgroepen, in-memory `searchCatalog` | `food-catalog.ts` |
| Gehaltetabel | `FOOD_SOURCES` per nutriënt; ~88 `verified: true`, ~35 `verified: false`; USDA-origin zeldzaam; **geen** `observed`-spreiding gevuld | `food-sources.ts` |
| Supplementoordeel | Append-only `supplement_verdicts` (`kopen` / `niet_nodig` / `eerst_leefstijl` / `nooit`) | `src/lib/supplement-verdict*.ts` |
| SEO-techniek | Canonical-helper, JSON-LD-helpers, sitemap, robots, 301's, handmatig GSC | `src/lib/seo/`, `src/app/sitemap.ts`, `next.config.ts` |
| Interne links | Handmatig: `relatedSlugs`, `gerelateerdeSluggen`, CONTENT_MAP, tests, audit-routines | `docs/core/SEO_RULES.md`, `docs/cursors/spinnenweb-link-audit.md` |

### Grootste overlap met het geschetste platform

De **voeding → leefstijl-eerst → EFSA-gegate supplement**-keten bestaat end-to-end. De **gehaltetabel + catalogus + spreidingsmodule + omgekeerde index** bestaan als productkennis (geen persoonsdata). Het **spinnenweb** bestaat als redactioneel proces + types + tests, niet als graafdatabase. De **uitlegbare supplement-rule engine** bestaat als `supplement_verdicts` + `nutrition-advice` + `approved-claims` + `domain-product-stance`. Dat is de moat — niet een USDA-import of een contentfabriek.

### Grootste gaten

1. **Geen knowledge graph, geen content factory, geen programmatic SEO-templates.** Routes `/voedingsstoffen/`, `/voedingsmiddelen/`, `/artikelen/` bestaan niet. `/kennisbank/` en `/supplementen/` en `/blog/` wel.
2. **Geen USDA/NEVO-productdatabase in Postgres.** Alles staat in TypeScript. Importscript schrijft een rapport, patched niets. `observed` min/max/median is ontworpen maar nergens gevuld.
3. **Dagboek slaat geen producten/gerechten op.** Besluit wil `items`; migratie heeft alleen `portions` + `meals` + `water_ml`. Catalogus is klaar, schema niet.
4. **Geen publieke zoekmachine.** Header-zoek is bewust verwijderd. Cataloguszoek is in-memory. FTS bestaat alleen voor `evidence_claims` (chat). Embeddings-kolom is leeg.
5. **Geen lineage-tabel, geen SEO-dashboard, geen GSC-koppeling, geen metadata-log.**
6. **Privacy-register achterop.** `account_nutrition_daybook` en `intake_intake_log` staan niet in `VERWERKINGSREGISTER.md` (laatst bijgewerkt 2026-08-18). DPIA noemt wél “voedingsrapportage” als consent-doel. `ENTITY_MODEL.md` mist daybook, verdicts en favorites.

### Aanbevolen volgorde (afwijking van de voorgestelde top-5)

De voorgestelde top-5 behandelt vijf dingen als nieuwbouw. In de repo zijn nutrition-engine, voeding→supplement-route en delen van de product-DB **al half-tot-ver gebouwd**. Nieuwbouw van een USDA-engine of programmatic factory zou bestaande locks ondermijnen (frequentie vs grammen, “minstens”-ondergrens, leefstijl-eerst, geen dunne pagina’s, geen achtste `/beste/*`).

**Bouw één keten af, leid SEO daaruit af, automatiseer content nooit.** Zie §7.

---

## 2. Systeemkaart

### 2.1 Publieke routes (SEO / content)

| Type | Patroon | Bron |
|---|---|---|
| Home | `/` | `src/app/page.tsx` |
| Pillars | `/slaap-verbeteren-na-40`, `/stress-verminderen-na-40` (CONTENT_MAP noemt nog `/stress-verminderen-man` — check `next.config.ts` redirects), `/energie-na-40`, `/herstel-verbeteren-na-40`, `/voeding-na-40`, `/beweging-na-40`, `/testosteron-na-40`, `/overgang` | `src/app/<slug>/page.tsx` |
| Profielen | `/profiel`, `/profiel/[slug]` | `src/data/profiles/` |
| Blog | `/blog`, `/blog/[categorie]`, artikel via `blogArtikelPad` | `src/data/blog/` (~79 imports in `index.ts`, 81 bestanden) |
| Kennisbank | `/kennisbank`, `/kennisbank/[slug]` | `src/data/kennisbank.ts` (37 termen) |
| Inzichten-hub | `/inzichten` — **niet in top-nav noch footer** (sinds aug/sep 2026); alleen interne content-links | `src/app/inzichten/page.tsx`, `src/data/insights.ts` |
| Gezondheidsgidsen | `/gidsen`, `/gidsen/[slug]`, `/gids/[thema]` | `src/data/gids.ts`, `src/data/guides` |
| Supplementgidsen | `/supplementen`, `/supplementen/[supplement]` | `src/data/supplement-guides/` (8, incl. melatonine) |
| Vergelijking | `/beste/[supplement]` | `src/data/supplements/` (7; geen melatonine) |
| Productdetail | `/product/[slug]` | `src/lib/supplement-hub/product-catalog.ts` (~25 producten, berekende PS-Score) |
| Onderbouwing | `/onderbouwing`, `/onderbouwing/voeding` | `src/data/nutrition/nutrition-question-evidence.ts` |
| Methodologie / PS-Score | `/methodologie`, `/ps-score` | — |
| Overig SEO | `/wat-is-omega-3`, `/waar-let-je-op-bij-omega-3`, `/supplement-kiezen-waar-op-letten`, `/hoe-werkt-dashboard` | `src/data/page-content/` |

**Bestaan niet:** `/voedingsstoffen/*`, `/voedingsmiddelen/*`, `/artikelen/*`, `/leefstijl/{domein}` (IA-doc, nooit gebouwd), `/zoek`, programmatic landings (`/magnesiumrijk`, `/vezelrijk`, `/low-sugar`).

### 2.2 Authenticated / conversie-routes (noindex)

| Route | Functie |
|---|---|
| `/intake` | Leefstijlcheck |
| `/intake/voeding` | Voedingscheck (sliders) |
| `/intake/slaap`, `/intake/stress`, `/intake/beweging` | Domein-check-ins |
| `/intake/plan/[domain]` | Plan-scherm — `robots: noindex` |
| `/dashboard` | Kompas / Agenda / Voortgang / Keuze — `robots: noindex` |
| `/rapport`, `/rapport/[sid]` | noindex |
| `/account/*` | login/verify — noindex |
| `/admin/*` | PartnerDesk-shell — noindex + `robots.ts` disallow |

### 2.3 API (voeding-relevant)

| Route | Functie |
|---|---|
| `POST /api/intake/nutrition-log` | Frequentie-zelfrapport → `intake_intake_log` |
| `GET /api/intake/nutrition-log/latest` | Laatste estimate |
| `POST /api/account/nutrition-daybook` | 2+2-dagboek |
| `POST /api/intake/protein-target` | Eiwitrichtlijn g/kg |
| `POST /api/chat` | Evidence Q&A (FTS op `evidence_claims`) |
| `POST /api/affiliate/click` | Uitgaande merchant-klik (`affiliate_clicks`) — **niet** `pd_*` / `af_*` |

### 2.4 Engines in `src/lib` (niet één engine)

Drie **versies** naast elkaar, plus gates:

| Engine | Versieconstante | Wat hij doet | Mag hij níét |
|---|---|---|---|
| Leefstijlcheck | `RULES_VERSION = "1.7.0"` (`intake-engine.ts`) | 7 domeinscores, profiel, urgentie | Voedings-mg, dagboek voeden |
| Nutriënt-schatting | `ESTIMATE_VERSION = "1.4.0"` (`nutrition-intake-estimate.ts`) | 5 banden (below/around/meets) uit frequenties | Grammen, ADH-%, statusclaim |
| Voedingsscore | `NUTRITION_SCORE_VERSION = "1.1.0"` (`nutrition-score.ts`) | 0–100 uit 12 sliders | Door dagboek verschuiven |
| Eiwitrichtlijn | `PROTEIN_TARGET_VERSION = "1.1.0"` (`protein-target.ts`) | g/dag-range uit gewicht × training × leeftijd | Status, diagnose |
| Advies F2 | `nutrition-advice.ts` | Leefstijl-eerst, dan 4-stappen EFSA-gate | Tweede claimbron |
| Verdicts | `supplement-verdict.ts` | `kopen` / `niet_nodig` / `eerst_leefstijl` / `nooit` | Zonder `based_on`-snapshot |
| PS-Score | `src/lib/supplement-score/compute.ts` | Productkwaliteit 0–100, **zonder prijs** | Affiliate-firewall |
| PLAN-content | `src/lib/content/plan-content.ts` | DB-interventies + `evidence_claims` | Parallel dezelfde claim als `getAdvice()` — zie `PLAN_ENGINE_DECISION.md` |

Locks die Claude niet mag breken:

- Dagboek voedt **nooit** `nutrition-score.ts` (migratiecomment + `BESLUIT_VOEDINGSDAGBOEK`).
- Check meet frequenties; mg uit producten is een **ondergrens** (“minstens”), nooit “je haalde X binnen”.
- Supplement alleen via `approved-claims.ts` + `isComparisonAllowed()` (`comparison-availability.ts`).
- Stress = `lifestyle_first` (`src/data/domain-product-stance.ts`). Verbinding = nooit schap (`COMPLIANCE.md`).
- Melatonine = `forbidden`, geen `/beste/melatonine`. Ashwagandha = `on_hold`, engine beveelt hem niet aan.

### 2.5 Statische voedingsdata (`src/data/nutrition/`)

| Bestand | Rol |
|---|---|
| `intake-reference.ts` | Enige plek met referentiecijfers voor 5 `NutrientId`s; drempels **indicatief** (TODO Gezondheidsraad/EFSA) |
| `food-sources.ts` | Gehaltes per nutriënt × voedingsmiddel; `nutrientValue` (per 100 g, citeerbaar) vs `amount` (portie, eigen bewerking); `verified` + `SourceRef` |
| `food-catalog.ts` | 371 logbare middelen; `bron` wijst naar `FOOD_SOURCES` of `null` (werklijst) |
| `food-taxonomy.ts` | 23 zoekcategorieën + `Bereiding`; **niet** de analyse-as |
| `portion-dictionary.ts` | Portiegroep → gram-equivalent |
| `nutrient-routes.ts` | Drempel in de eenheid van de check (porties/week), niet in mg |
| `lifescore-questions.ts` | Slider-vragen voedingscheck |
| `lifestyle-pyramid.ts` | 6 ladderlagen voeding |
| `nutrition-lifestyle-extras.ts` | Vezel / B12-vegan / suiker — **geen** supplement-gate, **geen** eigen SEO-pagina |
| `nutrition-question-evidence.ts` | Onderbouwing per vraag → `/onderbouwing/voeding` |
| `pesticiden-eetwijzer.ts` | Kwaliteit/eetwijzer, geen nutriëntengine |
| `nutrient-evidence-map.ts` | Evidence-koppeling nutriënten |

### 2.6 Lib-modules voeding (selectie)

`nutrition-intake-estimate.ts`, `nutrition-intake-statements.ts`, `nutrition-advice.ts`, `nutrition-advice-personalization.ts`, `nutrition-delta.ts`, `nutrition-score.ts`, `nutrition-contribution.ts`, `nutrition-sufficiency.ts`, `nutrition-route-status.ts`, `nutrition-route-choice.ts`, `nutrition-ladder.ts`, `nutrition-kompas-samenvatting.ts`, `nutrition-dagboek.ts`, `nutrition-dagboek-slots.ts`, `nutrition-dagboek-selfreport.ts`, `nutrition-eetmomenten.ts`, `nutrition-voedselgroepen.ts`, `nutrition-spread.ts`, `nutrition-nutrient-index.ts`, `nutrition-favorite-source.ts`, `nutrition-categorie-detail.ts`, `nutrition-prioriteiten.ts`, `account-nutrition-daybook.ts`, `nutrition-log-server.ts`, `nutrition-log-consent.ts`.

UI: `src/components/nutrition/` (tabellen) + `src/components/dashboard/voortgang/NutritionDagboekPaneel.tsx`, `NutritionDagInvoer.tsx`, `NutrientLogboekPanel.tsx`, `NutrientRouteChoiceCard.tsx`, `SchapView.tsx`.

### 2.7 Databasetabellen (voeding / oordeel / content-infra)

| Tabel | Migratie | Wat |
|---|---|---|
| `intake_sessions` | baseline + vele alters | Antwoorden, `domain_scores`, `rules_version`, `weight_kg`, `session_kind` |
| `intake_baseline_snapshots` | `20260610100000` | Onveranderlijke dag-0 freeze |
| `intake_intake_log` | `20260610140000` + score/version | Frequentie-zelfrapport; `raw_inputs` / `estimate` / `estimate_version` / `nutrition_score` / `nutrition_score_version` |
| `account_nutrition_daybook` | `20260903130000` + `20260903140000` | 2+2-dagboek: `portions`, `meals`, `water_ml`. **Geen `items`.** RLS deny-all |
| `intake_domain_checkin` | `20260612100000` | Slaap/stress/beweging — **niet** voeding |
| `supplement_verdicts` | `20260728120000` | Append-only oordeel per account × ingrediënt |
| `account_favorites` | `20260818120000` | `kind` ∈ {activiteit, supplement, dienst} — **geen** maaltijd/recept |
| `evidence_claims` | `20260529240000` | FTS `search_vector` + lege `embedding vector(1536)` |
| `interventions` + triggers | `20260529160000` e.v. | PLAN-trap, o.a. `voeding-dagboek` als interventie-slug |
| `domain_events` | `20260529200000` | Durable events; voeding heeft eigen types (zie §2.9) |
| `consent_records` | `20260412100000` | o.a. `nutrition_intake_logging` |
| `affiliate_clicks` | `20260714140000` | Uitgaande merchant-kliks — **niet aanraken** |
| `pd_*` | `20260712120000` | PartnerDesk, service-role-only |
| `af_*` | `20260714120000` | Eigen affiliate-programma, service-role-only |

**Geen tabellen voor:** foods, nutrients, recipes, meals, search_queries, seo_pages, link_graph, import_jobs, lineage, GSC-cache.

### 2.8 Docs die Claude eerst moet lezen (voeding + SEO)

**Core:** `SEO_RULES.md`, `CONTENT_SYSTEM.md`, `CONTENT_MAP.md`, `CONTENT_GAPS.md`, `COMPLIANCE.md`, `WRITING_VOICE.md`, `ENTITY_MODEL.md`, `DOMAIN_MODEL.md`, `INTAKE_SYSTEM.md`, `IA_ECOSYSTEEM.md`, `STEPPED_CARE_MODEL.md`, `ACCOUNT_DASHBOARD_SYSTEM.md`, `VERWERKINGSREGISTER.md`, `DPIA.md`, `EVIDENCE_CHAT.md`, `AFFILIATE_SYSTEM.md`.

**Plan / design / research (voeding):**

- `PLAN_NUTRITION_SELFEVAL_LOOP.md` — F0–F3 live
- `ROADMAP_LEEFSTIJLCHECK_NAAR_DASHBOARD_VOEDING.md` — blauwdruk; statusregel “nog niet gebouwd” is **deels achterhaald**
- `BESLUIT_VOEDINGSDAGBOEK_KOMPAS_V1_2026-09.md` — product-items + dag/week/maand; `items`-kolom **niet** in schema
- `BESLUIT_NEVO_BRONVERMELDING.md` + `SPEC_VOEDINGSBRONNEN_TABEL_V2.md` + `SPEC_VOEDINGSBRONNEN_VERIFICATIE.md`
- `ONDERZOEK_SPREIDING_EN_USDA_2026-09.md` — USDA vs NEVO, spreiding, vitamine D-grens
- `CATALOGUS_GAPS_VOEDING_LEEFSTIJL_SUPPLEMENTEN_2026-09.md` — geen 8e `/beste/*`, B12 nooit vergelijking, ashwagandha-sunset
- `ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` — aug 2026; **`/product/*` en berekende score bestaan inmiddels**
- `ANALYSIS_PILLAR_COVERAGE.md` — scheefheid-risico: alleen voeding heeft harde referentie
- `PLAN_ENGINE_DECISION.md` — `getAdvice` vs `getPlanContent`
- `BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md`

**Cursor-handoffs (niet bouwen, wel lezen):** `docs/cursors/claude-opus-voedingscatalogus-vervolg-prompt.md`, `docs/cursors/claude-opus-voedingsetiketten-api-vervolg-prompt.md`, `docs/cursors/spinnenweb-link-audit.md`, `docs/cursors/seo-structured-data-audit.md`.

**Scripts:** `scripts/usda-extract.mjs` (rapport, geen patch), `scripts/generate-state.mjs` → `docs/PROJECT_STATE.md`.

### 2.9 Meetpunten voeding (al geregistreerd)

In `src/lib/events.ts`: `intake.cta_to_nutrition_log`, `measurement.gap_detected`, `measurement.protein_target_computed`, `nutrition.basis_category_*`, `nutrition.roadmap_step_opened`, `nutrition.sufficiency_viewed`, `nutrition.tijdlaag_viewed`, `nutrition.kompas_priorities_viewed`, `nutrition.kompas_priority_clicked`, `nutrition.reflectie_*`, `nutrition.dagboek_opened` / `_day_saved` / `_completed` / `_kalibratie_shown`, `nutrition.schap_bronnen_getoond` / `_bron_clicked` / `_categorie_gefilterd`, `verdict.changed`.

Nieuwe CTA’s in dit domein hergebruiken deze types; geen parallelle “nutrition_engine_v2”-events.

---

## 3. De 11 ideeën — toets tegen de repo

Statuslegenda: **er is** = werkend in code; **deels** = bouwstenen + bewuste locks + ontbrekende naden; **ontbreekt** = geen route, geen tabel, geen engine.

---

### Idee 1 — Nutrition Intelligence Engine

**Status: deels** (architectuur aanwezig, geen USDA-schaal engine, bewust geen gram-som-tot-ADH)

**Wat er staat**

- Frequentie-engine, 5 nutriënten (`protein`, `omega3`, `magnesium`, `vitamin_d`, `zinc`), banden vs indicatieve drempels: `nutrition-intake-estimate.ts` + `intake-reference.ts`.
- Seizoensdrempels vitamine D: `nutrition-season.ts` + `seasonalThresholds` in de referentietabel.
- Bijdrage/vertrouwen berekend (niet alleen handmatig): `nutrition-contribution.ts`.
- Toereikendheid + blinde vlekken: `nutrition-sufficiency.ts`.
- Gehaltes per 100 g vs portie, bron/editie/`verified`: `food-sources.ts` (`NEVO_CITATION`, `SourceOrigin`).
- Spreiding: `nutrition-spread.ts` — **observed wint van klassenband**; `observed` is nergens in de tabel gevuld (grep leeg).
- Omgekeerde index nutriënt → catalogusproducten, gesorteerd op onderkant van de band: `nutrition-nutrient-index.ts`.
- USDA-extractie: `scripts/usda-extract.mjs` — Foundation Foods voorgaat, schrijft `scripts/out/usda-rapport.json`, **patched niets**.
- Catalogus 371 regels met porties, bereiding, synoniemen: `food-catalog.ts` (`searchCatalog`, `zonderBron()`).
- Onderbouwing van de check: `/onderbouwing/voeding`.

**Wat ontbreekt t.o.v. het idee**

- Geen Postgres-voedingsmiddelentabel, geen USDA/NEVO-bulkimport, geen dag/week/maand-**milligram-aggregatie in de DB** (week/maand is ontworpen in het besluit en de prebuilds, niet als engine over product-items).
- Geen macro-engine (kcal/BMR/TDEE) — `PLAN_MEASUREMENT_PERSONALIZATION.md` plant het; `ANALYSIS_PILLAR_COVERAGE.md` waarschuwt voor scheefheid.
- Referentiewaarden zijn vuistregels, niet gebronde ADH/DRV (`intake-reference.ts` TODO).
- Magnesium/zink-routes zijn `proxy` (`nutrient-routes.ts`) — de check meet niet de stof.
- Dekking vs referentie als “% van de dagbehoefte” is **bewust verboden**.
- `nutrient-routes.ts` comment zegt nog “elke waarde `verified: false`” — dat is **stale**; de tabel heeft ~88 `verified: true`.

**Risico’s**

- USDA als primaire bron voor vitamine D / verrijkte NL-producten is in `ONDERZOEK_SPREIDING_EN_USDA` **afgewezen**.
- NEVO: “unchanged + bronvermelding”; afgeleide portie-mg mag niet als brondcijfer. Licentie/akkoord is Dennis-actie (`BESLUIT_NEVO_BRONVERMELDING.md`).
- Schijnprecisie → statusclaim (art. 9 + Claimsverordening). Bestaande copy-guards: “minstens”, band, fytaat-annotatie.
- Een tweede engine naast estimate/score/check breekt vergelijkbaarheid (`NUTRITION_SCORE_COMPARABLE_FROM`, `estimate_version`).

**Claude kijk hier:** `food-sources.ts` (moduledoc), `food-catalog.ts` (moduledoc), `nutrition-spread.ts`, `nutrition-nutrient-index.ts`, `nutrition-intake-estimate.ts`, `SPEC_VOEDINGSBRONNEN_VERIFICATIE.md` §6.4 NEVO-adapter, `ONDERZOEK_SPREIDING_EN_USDA_2026-09.md`, `scripts/usda-extract.mjs`, `docs/cursors/claude-opus-voedingsetiketten-api-vervolg-prompt.md`.

---

### Idee 2 — SEO Knowledge Graph

**Status: deels** (redactionele graaf in types + docs + tests; geen graafstore, geen auto-linker)

**Wat er staat**

- Paginatypen en hiërarchie: `SEO_RULES.md`, `CONTENT_MAP.md`, `IA_ECOSYSTEEM.md`.
- Handmatige relaties:
  - kennisbank: `relatedSlugs`, `relatedComparisons` (`src/data/kennisbank.ts`)
  - blog: `gerelateerdeSluggen` (`src/types/blog.ts`)
  - profiel: `relatedComparisons`, pillar-links (`src/types/profile-page.ts`)
  - gids: `gerelateerdeSymptomen` (`src/types/supplement-guide.ts`)
- Integriteitstests: o.a. `src/data/__tests__/magnesium-cluster-links.test.ts`, `src/lib/__tests__/supplement-invariant.test.ts` (`no-orphan-affiliate-slugs`).
- Audit-routine (read-only): `docs/cursors/spinnenweb-link-audit.md`.
- Inzichten weeft blog + kennisbank: `src/data/insights.ts`, `src/lib/library/`.
- Kennisbank `insightTier` 1–3 + `publicFullContent` (teaser/gate, geen graaf).

**Wat ontbreekt**

- Geen entiteit `Voedingsstof` / `Voedingsmiddel` als first-class SEO-knoop (alleen 5 `NutrientId`s intern + KB-termen zoals `vitamine-d`, `epa-dha`, `adh`).
- Geen automatische interne links, geen missing-page detector, geen orphan-crawler in CI (wel een menselijke checklist in `CONTENT_GAPS.md`).
- Geen topical-authority-score, geen keyword-knoop in de DB.
- `IA_ECOSYSTEEM.md` tekent `/leefstijl/{domein}` en `/inzichten/{slug}` — die routes bestaan niet; pillars zijn platte slugs.

**Risico’s**

- Auto-linken op keyword-match produceert kannibalisatie (bewust behouden paren in `SEO_RULES.md`: magnesium-slaap vs -slaapkwaliteit; twee melatonine-blogs).
- Dunne “stof-pagina’s” naast bestaande gidsen/blogs.
- `/inzichten` uit de nav halen was een productbesluit; een KG die inzichten weer als hub pusht, vecht met dat besluit.

**Claude kijk hier:** `CONTENT_MAP.md`, `CONTENT_GAPS.md`, `SEO_RULES.md` (spinnenweb + kannibalisatie-beslisboom), `kennisbank.ts` (`KennisbankTerm`), `src/types/blog.ts`, `docs/cursors/spinnenweb-link-audit.md`, `src/app/kennisbank/[slug]/page.tsx` (relatedTerms-render), `scripts/generate-state.mjs`.

---

### Idee 3 — Automatische SEO Content Factory

**Status: ontbreekt** als fabriek; **er is** een menselijke content-kanon

**Wat er staat**

- Blueprints 1–5: vergelijking, pillar, profiel, blog, kennisbank — `CONTENT_SYSTEM.md`.
- Kalender-logica (1 pillar-update, 2–3 clusters, 2–4 KB/maand) — `SEO_RULES.md`.
- Smart Content Module: 11 stappen, turbo-snippets, WIIFM, keuzestress.
- `PAGE_ROADMAP.md` — dun, laatst “juni 2026”; `/supplementen-mannen-40` nog 💡.
- `WRITING_VOICE.md` — toonlock.
- `CATALOGUS_GAPS_...md` is de inhoudelijke backlog (cafeïne-blog, multivitamine-opiniestuk, K2-sectie ín vitamine-D, geen nieuwe `/beste/`).

**Wat ontbreekt**

- Geen keyword/intent-pipeline, geen gap-scanner, geen cannibalization-job, geen interne-linkplanner, geen freshness-queue, geen SEO-quality pipeline.
- Geen templates voor `/voedingsstoffen/`, `/voedingsmiddelen/`, `/kennisbank/`-generatie, `/artikelen/` (artikelen = `/blog`).
- Sitemap `lastModified` is grotendeels hardcoded `2026-05-01` (`src/app/sitemap.ts`) — geen freshness-signaal uit content.

**Risico’s**

- Programmatic thin content vs Consumentenbond-positionering.
- Affiliate-kannibalisatie van `/beste/*` (nulmeting: `docs/research/NULMETING_BESTE_VERGELIJKINGEN_2026-09-02.md`).
- EFSA/claimdrift als copy gegenereerd wordt buiten `approved-claims.ts`.
- `CURRENT_SPRINT.md` telt nog “27 blogs, 24 kennisbank” — factory-metrics uit docs zijn onbetrouwbaar; gebruik `generate-state`.

**Claude kijk hier:** `CONTENT_SYSTEM.md`, `CATALOGUS_GAPS_VOEDING_LEEFSTIJL_SUPPLEMENTEN_2026-09.md` (besluit in 8 regels), `PAGE_ROADMAP.md`, `WRITING_VOICE.md`, `approved-claims.ts`, `docs/research/BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04.md`.

---

### Idee 4 — Voedingsdagboek → Leefstijlcheck → Supplementroute

**Status: deels** (keten loopt; naden open; productinvoer ontworpen maar niet in schema)

**Wat er staat**

1. **Leefstijlcheck** — 2 voedingsvragen (`NUT_O3`, `NUT_PROT`) in de hoofdscheck; `RULES_VERSION` 1.7.0. Roadmap wil trechteren; dat kan nog niet op 2 vragen (`ROADMAP_...VOEDING.md` §2 breuk 3).
2. **Voedingscheck** — `/intake/voeding`, `lifescore-questions.ts`, score 1.1.0, estimate 1.4.0, opslag `intake_intake_log`.
3. **Advies** — `nutrition-advice.ts`: lifestyle priority 1, supplement priority 2 na gate. Personalisatie op voorkeur/allergie: `nutrition-advice-personalization.ts`.
4. **Ladder / Kompas / Voortgang** — `nutrition-ladder.ts`, `lifestyle-pyramid.ts` (6 lagen, aanvullen gated), `nutrition-kompas-samenvatting.ts`, `nutrition-prioriteiten.ts`.
5. **Verdicts** — `supplement_verdicts` + `syncSupplementVerdicts` op dashboard-load; `verdict.changed` event; `based_on` snapshot.
6. **Dagboek** — 2+2, account-scoped, kalibratie-event `nutrition.dagboek_kalibratie_shown`; brug naar zelfrapport: `nutrition-dagboek-selfreport.ts`.
7. **Onboarding** — consent `nutrition_intake_logging` (`nutrition-log-consent.ts` v1.0); account-claim; nurture-relog `nutrition-relog-nurture.ts`.
8. **Historische metingen** — intake-log + baseline-snapshots + remeasure; dagboek overschrijft per dag (geen append-only historie van correcties).

**Wat ontbreekt**

- User profile als voedingsprofiel-versie (referentiewaarden zijn globaal in TS, niet per gebruiker geversionerd behalve de drie engine-semvers op de logrij).
- Rule engine met conditions-DSL — de rules zitten in TypeScript-functies, niet in een versieerbare regel-tabel (PLAN-interventies in DB zijn een tweede pad, zie idee 10).
- Veiligheidsfilters medicatie: **content + disclaimer**, geen engine (`SupplementAdviceDisclaimer.tsx`, blogs zoals `/blog/omega-3-en-medicijnen`, `/blog/magnesium-in-combinatie-met-medicijnen`). `nutrition-lifestyle-extras.ts` TODO: B12 × PPI/metformine zodra de vraag bestaat.
- Agenda-koppeling voeding: roadmap noemt dit de ernstigste breuk — acties in `NUTRITION_PRIORITY_LAYERS` worden nergens als `agenda_blocks` geschreven.
- Product-items in het dagboek (besluit §1) — niet in migratie.
- Dag → week → maand-mg-UI uit de prebuilds — ontwerp, geen volledige implementatie over `items`.

**Risico’s**

- Art. 9: eetpatroon + gekoppelde scores = gezondheidsgegevens. Register noemt daybook/intake_log niet (zie §6).
- Twee substraten (`intake_intake_log` vs `account_nutrition_daybook`) is **bewust** (frequentie vs steekproef). Samenvoegen verboden in roadmap §12.
- Diagnose/interventie-scheiding: Kompas mag geen analyse worden (`ROADMAP` §0).
- Scheefheid voeding-getal → supplement (`ANALYSIS_PILLAR_COVERAGE.md`).

**Claude kijk hier:** `ROADMAP_LEEFSTIJLCHECK_NAAR_DASHBOARD_VOEDING.md`, `PLAN_NUTRITION_SELFEVAL_LOOP.md`, `BESLUIT_VOEDINGSDAGBOEK_KOMPAS_V1_2026-09.md`, `nutrition-advice.ts`, `supplement-verdict.ts`, `supplement-verdict-producer.ts`, `account-nutrition-daybook.ts`, `NutritionDagboekPaneel.tsx`, `src/data/domain-product-stance.ts`, `src/types/verdict.ts`.

---

### Idee 5 — Supermarkt- en productdatabase

**Status: deels** (handmatige TS-catalogus + gehaltetabel; geen import-pipeline, geen admin review)

**Wat er staat**

- Catalogusmodel: `CatalogEntry` met category / groep / bereiding / porties / `bron` / `zoek` (`food-catalog.ts` moduledoc — lees die écht).
- Twee assen: analyse (13 `VoedselgroepId`) ≠ navigatie (23 `FoodCategoryId`). Groei van catalogus mag de meting niet breken.
- Variantregel: rauwe spinazie erft niet van gekookte (`bron: null`, niet hergebruik).
- Gehaltes: NEVO-citatie-split `nutrientValue` vs `amountForPortion()`.
- USDA-script + handoff-prompt voor etiket/API.
- **Supplement**-producten: ~25 in hub-catalogus, score berekend, `/product/[slug]`. Dat is een **andere** database (supplementen, niet supermarkt).
- PartnerDesk heeft `pd_*` productideeën in het implementatieplan (EAN, pg_trgm) — dat is **upstream merchant**, niet NEVO-voeding.

**Wat ontbreekt**

- CSV/JSON-import in de app, duplicaatdetectie, admin review queue, importlogs, wijzigingshistorie (geen audit-tabel op foods).
- Bereiding als data-pipeline (veld bestaat op catalogusrij; geen NEVO-adapter die bereiding mapt).
- Alternatieven/substituties als graaf (wel copy-substitutie in `nutrition-advice-personalization.ts`).
- Per 100 g **en** portie bestaat in `food-sources`; catalogus zelf draagt **geen** milligram (bewust).
- `items` op daybook zodat de catalogus daadwerkelijk gelogd wordt.

Snapshot-tellingen (main, sep 2026, grep — geen runtime):

- Catalogus: **371** `f(`-regels.
- `FOOD_SOURCES`: ~88 `verified: true`, ~35 `verified: false`; `origin: "usda"` **2×**; `origin: "nevo"` ~89×; `observed` **0**.
- Handoff 10 sep: 310/371 `bron: null`; latere commits vulden kaas/melk/ei/orgaanvlees/mosselen/biefstuk — werklijst is `zonderBron()`.

**Risico’s**

- Automatische USDA-match (“whole-wheat bread” ≠ NL volkorenbrood) — daarom patched het script niets.
- NEVO achter paywall verboden (`allowsPaywall: false` in de verificatiespec).
- Food-affiliate is in catalogus-gaps **afgewezen** tenzij de knop bewust omgaat.

**Claude kijk hier:** `food-catalog.ts`, `food-taxonomy.ts`, `food-sources.ts`, `SPEC_VOEDINGSBRONNEN_VERIFICATIE.md`, `scripts/usda-extract.mjs`, `docs/cursors/claude-opus-voedingscatalogus-vervolg-prompt.md`, `src/lib/supplement-hub/product-catalog.ts` (niet verwarren met food).

---

### Idee 6 — Verantwoorde programmatic SEO pages

**Status: ontbreekt** (en deels **bewust afgewezen**)

**Wat er staat**

- Lifestyle-extras `fiber_low_wholegrain`, `b12_vegan`, `sugar_high_signal` — advieszinnen, geen URL’s.
- Redactionele blogs die dezelfde intent raken: o.a. `/blog/magnesium-uit-voeding`, `/blog/eiwit-na-40`, `/blog/omega-3-uit-voeding-of-supplement`, `/blog/zout-kalium-bloeddruk-na-40`.
- `noindex` bestaat voor dashboard/account/admin/rapport/plan — **niet** als “draft programmatic tot review”.
- Unieke intent is een **redactionele** regel (`SEO_RULES.md` kannibalisatie-beslisboom + GSC-export), geen generator.

**Wat ontbreekt**

- Geen `/vezelrijk`, `/magnesiumrijk`, `/low-sugar`, geen vergelijkingsgenerator voedingsmiddelen.
- Geen review-queue + noindex-workflow voor machinepagina’s.

**Risico’s**

- Dunne lijstjes vs bestaande diepte-blogs.
- “Magnesiumrijk”-pagina kannibaliseert `/blog/magnesium-uit-voeding` + `/supplementen/magnesium` + `/beste/magnesium`.
- B12 als `/beste/` is in catalogus-gaps **verboden** (huisarts, statusclaim).

**Claude kijk hier:** `nutrition-lifestyle-extras.ts`, `CATALOGUS_GAPS_...md` §0 + later-lijst, `SEO_RULES.md` §kannibalisatie, `docs/research/NULMETING_BESTE_VERGELIJKINGEN_2026-09-02.md`.

---

### Idee 7 — Persoonlijke voedingsdatabase

**Status: deels** (favorieten-schap voor bronnen/ladder; geen recepten/maaltijdtemplates)

**Wat er staat**

- `account_favorites`: activiteit / supplement / dienst.
- Voedingsbron-favoriet-id `voeding-bron-<nutrient>-<foodSourceKey>`: `nutrition-favorite-source.ts` (contextregel zonder mg).
- Ladder-favorieten: `laag-voeding-p<n>-<slug>`-patroon (beweging-naad als voorbeeld).
- Dagboek: porties + eetmomenten + water; overschrijven per dag.
- Gerechten als **zoekcategorie** `maaltijden` in de catalogus (samengesteld; gehaltes uit componenten, “nooit eigen tabelwaarde”) — geen user-recipes-tabel.

**Wat ontbreekt**

- User-owned recipes, meal templates, substituties, terugkerende maaltijden, doelen (kcal/macro). Portie-aanpassing per gerecht-component staat in het **besluit**, niet in het schema.
- Historie als append-only food-log (daybook is correctie-in-place).

**Risico’s**

- MyFitnessPal-kloon vecht met “geen calorie-tracker / geen schijnprecisie” (`PLAN_NUTRITION_SELFEVAL_LOOP.md` §A1, daybook-migratiecomment).
- Art. 9-volume explodeert bij dagelijks productlog.
- Favorites-`kind` uitbreiden zonder migratie + register.

**Claude kijk hier:** `account_favorites` migratie, `nutrition-favorite-source.ts`, `SchapView.tsx`, `FavoriteSaveButton.tsx`, `BESLUIT_VOEDINGSDAGBOEK` §1 (gerechten als snelheid, niet als tweede invoerspoor).

---

### Idee 8 — SEO technische infrastructuur

**Status: deels** (solide on-page + sitemap + redirects; geen GSC-product, geen orphan-job)

**Wat er staat**

- `src/lib/seo/canonical.ts` — `canonicalMetadata(path)`.
- `src/lib/seo/structuredData.ts` — BreadcrumbList, ItemList, Product, HowTo, FAQ, DefinedTerm, Article. Alias `src/lib/structured-data.ts`.
- `src/app/sitemap.ts` — pillars, profielen, gidsen, kennisbank, blog, `/product/*`, `/inzichten`, `/beste/*`. `lastModified` deels stale.
- `src/app/robots.ts` — allow `/`, disallow `/admin` `/api` `/rapport`, sitemap-URL.
- Per-route `robots: noindex` op dashboard, account, admin, rapport, intake-plan.
- 301’s in `next.config.ts` (legacy `/beste-*`, `/beste/melatonine` → gids, oude profielslugs, `/thema/*`).
- www→non-www is **nginx**, niet Next (`NULMETING_BESTE_...`).
- Breadcrumbs-component + JSON-LD op veel paginatypen.
- Audit-routine: `docs/cursors/seo-structured-data-audit.md`.
- GSC: handmatig (nulmeting, moat-KPI-review, kannibalisatie-export in `SEO_RULES.md`). Geen API-integratie.

**Wat ontbreekt**

- Orphan-detector, indexability-dashboard, metadata-log, GSC-sync, structured-data-validator in CI (wel tests op `structuredData.ts`).
- Geen `noindex tot review` voor nieuwe clusters.
- Open Graph is per pagina, niet centraal afgedwongen.

**Risico’s**

- Stale `lastModified` in sitemap ondermijnt freshness.
- Dubbele JSON-LD (inline op pillars vs helpers) — audit noemt dit expliciet.
- `/inzichten` staat wél in de sitemap, niet in nav — crawlbaar, slecht intern gelinkt.

**Claude kijk hier:** `src/lib/seo/*`, `src/app/sitemap.ts`, `src/app/robots.ts`, `next.config.ts` `redirects()`, `docs/cursors/seo-structured-data-audit.md`, `docs/research/NULMETING_BESTE_VERGELIJKINGEN_2026-09-02.md`.

---

### Idee 9 — Interne zoekmachine

**Status: ontbreekt** publiek; **deels** intern/specifiek

**Wat er staat**

- `searchCatalog()` — in-memory, diakriet-norm, synoniemen, prefix > contains (`food-catalog.ts`). Geen Postgres.
- PartnerDesk ⌘K: `src/lib/partnerdesk/search-actions.ts` (partners/contacten/taken). Plan noemt pg_trgm; dat is admin-scope.
- Evidence-chat: RPC `search_evidence_claims` (FTS) + `ilike`-fallback; embeddings-kolom **leeg**; geen LLM-call (`EVIDENCE_CHAT.md`, `docs/research/VERDICT_MULTITENANT_...`).
- Bibliotheek: client-side filter blog/KB (`LibraryBrowser.tsx`), geen FTS.
- Header-zoek is **bewust verwijderd** (`CURRENT_SPRINT.md`: “zoek eruit”).

**Wat ontbreekt**

- Publieke FTS/trigram, synoniemen-tabel, nutrient-filters op site-search, ranking, search analytics, embeddings-pipeline voor content.

**Risico’s**

- Embeddings van art. 9-data: DPIA + register + DPA. Productkennis-RAG is het enige pad dat `ARCHITECTURE.md` toestaat zonder extra anonimisering.
- Search analytics = persoonsgegeven als query vrije tekst over gezondheid is.

**Claude kijk hier:** `food-catalog.ts` `searchCatalog`, `src/lib/evidence-rag.ts`, `EVIDENCE_CHAT.md`, `partnerdesk/search-actions.ts`, `PLAN_AFFILIATE_PLATFORM_IMPLEMENTATIE.md` F4 (embeddings — PartnerDesk, niet consument).

---

### Idee 10 — Uitlegbare supplement rule engine

**Status: deels** (er is er al één, plus twee oudere paden)

**Wat er staat**

- `deriveSupplementVerdicts` + append-only store + `based_on` (scores, signals, profile, triggers, `nutritionLogCompleted`).
- `nutritionSupplementGate`: comparisonPath → approved status → `isComparisonAllowed` → `getUsableClaims`.
- `DOMAIN_PRODUCT_STANCE`: per domein candidates of `lifestyle_first`.
- `src/types/recommendation-explanation.ts` — factoren, lifestyleFirst, efsaClaim, trustLine.
- `domain-supplement-candidates.ts`, `build-recommendations.ts`, `supplement-eligibility.ts`.
- PLAN-DB: `interventions` + `intervention_triggers` + `evidence_claims.is_efsa_authorized`.
- `getAdvice()` in `intake-engine.ts` nog live voor reveal/nurture — **tweede pad** (`PLAN_ENGINE_DECISION.md`).

**Wat ontbreekt**

- Eén versieerbare conditions-DSL. Rules zijn TypeScript + deels SQL-triggers.
- Onzekerheid als first-class op het verdict (wel `NutrientConfidence` 1–4 op de schatting; magnesium/vit D op 1).
- Medicatie/safety als harde filter in de engine (alleen copy).
- “Bestaande inname” uit product-dagboek (bestaat niet); wel nutrition-log eligibility.

**Risico’s**

- Drie adviespaden (`getAdvice`, PLAN `getPlanContent`, verdicts) → divergente claims. Besluit: niet parallel hetzelfde supplement tonen.
- Ashwagandha on_hold + VWS-traject (`CATALOGUS_GAPS` sunset).
- Uitlegbaarheid vs art. 22: output moet informatief blijven (`DPIA.md` R7).

**Claude kijk hier:** `src/types/verdict.ts`, `src/lib/supplement-verdict.ts`, `nutrition-advice.ts`, `approved-claims.ts`, `comparison-availability.ts`, `domain-product-stance.ts`, `PLAN_ENGINE_DECISION.md`, `src/types/recommendation-explanation.ts`.

---

### Idee 11 — Data lineage & audit

**Status: deels** (velden per laag; geen uniforme lineage)

**Wat er staat**

- Voedingstabel: `SourceRef` (origin, ref, edition), `verified`, split citeerbaar vs afgeleid.
- Logs: `estimate_version`, `nutrition_score_version`, `rules_version` op sessie/verdict.
- Verdicts: `based_on` jsonb snapshot, `superseded_at`, `next_review_at`.
- Consent: type + version + exacte tekst + ip/ua hash.
- Baseline freeze overleeft score-nulling bij revoke.
- NEVO-citatie getest (versie in `NEVO_CITATION`).
- Spreiding: `basis` in `nutrition-spread.ts` zegt observed vs klasse.

**Wat ontbreekt**

- Geen `lineage`-tabel die een UI-getal terugleidt naar (bronbestand, code, portie-aanname, engine-versie).
- Geen importlog, geen diff-historie op `food-sources.ts` behalve git.
- `ENTITY_MODEL.md` documenteert daybook/verdicts/favorites niet.
- `observed` nooit gevuld → spreidingslineage is altijd “klasse”, nooit “labmonsters”.

**Risico’s**

- Een mg in de UI zonder “minstens” + band + fytaat is een compliance-incident, geen UX-detail.
- Register/DPIA-gap: lineage zonder wettelijke grondslag-documentatie dekt art. 30 niet.

**Claude kijk hier:** `food-sources.ts` `SourceRef` / `NEVO_CITATION`, `nutrition-spread.ts`, `supplement_verdicts.based_on`, `intake_intake_log.estimate_version`, `SPEC_VOEDINGSBRONNEN_VERIFICATIE.md`, `VERWERKINGSREGISTER.md` (wat er **niet** in staat).

---

## 4. Bestaande bouwstenen — hergebruiken, niet opnieuw bouwen

| Behoefte in het idee | Hergebruik dit | Niet dit |
|---|---|---|
| Nutriënt-schatting | `estimateNutritionIntake` + `intake-reference.ts` | Nieuwe USDA-inname-engine |
| Gehaltes | `FOOD_SOURCES` + `amountForPortion` + `nutrition-spread` | Tweede tabel in Postgres “omdat USDA een API heeft” |
| Logbare producten | `FOOD_CATALOG` + `searchCatalog` | Open Food Facts-kloon |
| Voeding → supplement | `nutrition-advice.ts` + `nutritionSupplementGate` + `supplement_verdicts` | Nieuwe rule-engine |
| EFSA | `approved-claims.ts` + `getUsableClaims` + `isComparisonAllowed` | Vrije claimcopy |
| Domein × schap | `domain-product-stance.ts` | Supplement op stress/verbinding |
| Interne links | `relatedSlugs` / `gerelateerdeSluggen` / CONTENT_MAP + tests | Neo4j/KG-product |
| Contenttypes | Blueprints in `CONTENT_SYSTEM.md` | `/artikelen/` naast `/blog/` |
| Product-SEO (supplement) | `/product/[slug]` + `computeTrustScore` | Handmatige `score` in oude `ComparisonPageData` als SSOT (hub overschrijft) |
| Uitleg | `recommendation-explanation.ts` + `/onderbouwing/voeding` | LLM-generated “waarom” |
| Search (admin) | PartnerDesk search | Publieke FTS “omdat pg_trgm bestaat in een plan-doc” |
| Search (evidence) | `search_evidence_claims` | Embeddings vullen zonder productbesluit |
| Events | Bestaande `nutrition.*` / `measurement.*` / `verdict.changed` | Parallelle event-taxonomie |
| Favorieten | `account_favorites` + `nutritionSourceFavoriteId` | Nieuwe `user_foods`-tabel vóór `kind`-uitbreiding |
| Check-in zachte pijlers | `intake_domain_checkin` | Voeding in die tabel stoppen |
| Frequentie vs steekproef | twee tabellen houden | Samenvoegen |
| Affiliate uitgaand | `affiliate_clicks` | `pd_*` of `af_*` |

---

## 5. Wat NIET gebouwd moet worden / wat bewust anders is

| Onderwerp | Feit in de repo | Gevolg voor het kennisplatform-idee |
|---|---|---|
| Drie betekenissen van “affiliate” | `affiliate_clicks` ≠ `pd_partners` ≠ `af_affiliates` | Food-SEO mag niet stiekem PartnerDesk-producten of programma-refs gebruiken |
| `/inzichten` uit nav | CLAUDE.md UX juni 2026 | Geen hub-herintroductie via KG |
| Geen Firebase | `ARCHITECTURE.md` | Geen NoSQL food-log |
| Geen localStorage | CLAUDE.md | Dagboek/account via Supabase |
| Geen medische claims | `COMPLIANCE.md` inname vs status | Geen “tekort”-engine, geen bloed-duiding behalve referral-only vitamine D (`20260902120000_vitamine_d_bloedwaarde_measurement.sql`) |
| Geen black-box verkoop | Perfectsupplement verkoopt niet | Programmatic “koop dit voedingsmiddel”-pages + food-affiliate afgewezen |
| Melatonine | `forbidden`, 301 `/beste/melatonine` → gids | Nooit in factory of KG als conversie-knoop |
| Ashwagandha | `on_hold`, niet in engine-catalogus | Sunset, geen contentinvestering |
| Verbinding | nooit schap | KG mag geen supplement-edge op connection zetten |
| Stress | `lifestyle_first` | Idem |
| Header-zoek verwijderd | sprint-notitie | Publieke search is een productbesluit, geen “ontbrekend featuretje” |
| Scoring niet in één frontend-engine | `ARCHITECTURE.md` is hier **stale** (account bestaat; scoring zit in `src/lib`) | Niet de Layer-1-doc napraten zonder de code |
| `/leefstijl/{domein}` | alleen in IA-doc | Niet bouwen; pillars zijn de ingang |
| Achtste `/beste/*` | catalogus-gaps besluit 1 | B12/K2/multivitamine/ longevity-plank: nee of anderszins |
| Calorie-tracker | herhaaldelijk verboden in plan+migratie | Idee 1+7 niet als MyFitnessPal lezen |
| NEVO achter paywall | verificatiespec | Premium-gate mag geen NEVO-getal tonen |
| Embeddings leeg | bewust | Geen stille fill-pipeline |
| `getAdvice` vs PLAN | twee paden, besluit tot migratie | Geen derde advies-engine |

---

## 6. Privacy & compliance-implicaties (niet herschreven)

DPIA (`docs/core/DPIA.md`) noemt granulaire toestemming voor **voedingsrapportage**, gewicht/eiwitrichtlijn, domein-check-in. Dat dekt de intentie van `nutrition_intake_logging`.

`VERWERKINGSREGISTER.md` is bijgewerkt tot **2026-08-18** en noemt:

- §1 Leefstijlcheck (`answers`, scores)
- §2 Account
- niet: `intake_intake_log`
- niet: `account_nutrition_daybook` (migraties 3 sep 2026)
- niet: `supplement_verdicts.based_on` (scores + signalen)

`src/app/privacy/page.tsx` grep: geen daybook/intake_log.

**Gevolg:** uitbreiding van product-dagboek, recepten, of mg-aggregatie is art. 9-verwerking. Zelfde PR vereist register + privacy + eventueel DPIA-herziening (`meten.mdc` privacy-gate). Geen nieuwe verwerker (USDA is public domain; NEVO is RIVM-voorwaarden, geen SaaS-verwerker, wél bronvermelding). Een GSC- of embeddings-API kan wél een nieuwe verwerker zijn.

Bloedwaarde vitamine D is **referral-only**, niets opslaan als status (`20260902120000_...sql`). Dat pad niet verbreden naar een meet-platform.

---

## 7. Aanbevolen master-architectuurvolgorde

Afwijking van de voorgestelde top-5 is inhoudelijk, niet politiek: (2) nutrition engine, (4) voeding→supplement en (5) product-DB bestaan al als TS-systemen. Ze eerst “opnieuw ontwerpen” als KG + factory levert dubbele engines en compliance-gaten. SEO-winst zit in het **afmaken en zichtbaar maken** van wat er is, niet in 10.000 programmatic URL’s.

```
A. Keten dichten (voeding, bestaand)
        │
        ├─► A0 Privacy-gate: register + privacy + ENTITY_MODEL voor daybook/log/verdicts
        │
        ├─► A1 Catalogus-bronnen: zonderBron() ↓ ; USDA-rapport → observed; NEVO-licentie (Dennis)
        │         hangt af van: food-sources model, usda-extract, SPEC verificatie
        │
        ├─► A2 Daybook `items` (product + portie) volgens BESLUIT §1
        │         hangt af van: FOOD_CATALOG, groepen-afleiding, lock “geen tweede score”
        │
        ├─► A3 Kalibratie check ↔ dagboek + ondergrens-UI (minstens, band, fytaat)
        │         hangt af van: A2, nutrition-spread, nutrition-dagboek-selfreport
        │
        └─► A4 Agenda-naad voeding (roadmap breuk 1)
                  hangt af van: bestaande agenda_blocks-patroon (beweging), géén nieuwe tabel

B. SEO als afgeleide graaf (niet als CMS)
        hangt af van: stabiele contenttypes (er zijn ze)
        │
        ├─► B1 Typed relatiebestand of test-afgedwongen graaf
        │         nodes: pillar, profiel, blog, kb, gids, beste, product, food-source, nutrient
        │         edges: bestaande velden (relatedSlugs, gerelateerdeSluggen, comparisonPath, bron)
        │
        ├─► B2 Orphan / missing-link / kannibal-rapport (CI of routine, zoals spinnenweb-audit)
        │
        └─► B3 Sitemap lastmod uit content-data; GSC blijft handmatig tot volume dat rechtvaardigt

C. Nutrition intelligence = upgrade van A1, geen nieuw product
        hangt af van: A1 (zonder gehaltes is aggregatie theater)
        niet: 270k NEVO-rijen, macro-TDEE, %ADH, USDA-first voor vit D/verrijking

D. Rule engine unificeren
        hangt af van: PLAN_ENGINE_DECISION (getAdvice afbouwen), verdicts als SSOT “wat vinden wij nu”
        niet: conditions-DSL, medicatie-module, vierde engine

E. Content (menselijk, KG-gestuurd)
        hangt af van: B2 (weten welke intent ontbreekt) + CATALOGUS_GAPS backlog
        niet: programmatic /voedingsstoffen /voedingsmiddelen
        uitzondering: één URL alleen bij unique intent + noindex tot review + geen /beste-kannibaal

F. Later / niet tenzij productbesluit
        publieke search, embeddings-fill, GSC-dashboard, recepten-DB, food-affiliate, 8e /beste
```

### Waarom niet de voorgestelde (1) KG → (2) nutrition engine → (3) factory

1. **KG zonder afgewerkte voedingsentiteiten** wordt een graaf van blogs en KB-termen — die relaties staan al in TS. De ontbrekende knopen (voedingsmiddel als SEO-URL, stof als hub) vereisen eerst A1+E-beleid, anders genereert de KG missing pages die je niet wilt.
2. **Nutrition engine bestaat.** Het gat is data-kwaliteit (`verified`, `observed`, `bron: null`) en de daybook-naad, niet een ontbrekende architectuur.
3. **Factory op een onvolledige graaf** = thin pages. De catalogus-gaps-memo zegt het scherper: winbaarheid in NL-supplement-SERP is profiel + “nee durven zeggen”, niet nóg een top-10.
4. **Voeding→supplement (4) is de monetisatieplug** en draait al (F2 + verdicts). Die eerst “wacht op KG” is omgekeerde prioriteit.
5. **Product-DB (5)** als Postgres-supermarkt is een licentie- + normalisatieproject; de TS-catalogus is ontworpen om tot duizenden regels te groeien **zonder** schemawijziging, zolang de 13 groepen vastblijven.

### Wat dit wél is (één systeem)

Niet vijf features. Eén pijp:

**catalogus/gehalte (productkennis) → check (frequentie) + dagboek (steekproef) → kalibratie → leefstijl-actie / gated supplementoordeel → redactionele pagina’s die dezelfde stoffen en bronnen uitleggen.**

SEO is de publieke projectie van die pijp. Wie de pijp overslaat en pagina’s genereert, krijgt een tweede product dat de eerste tegenspreekt (mg op de blog, porties in de check, niets in het dagboek).

---

## 8. Open vragen / aannames / stale docs

### Aannames in dit rapport

- `origin/main` @ `ad93564c` is de waarheid; prebuilds in `docs/design/*.html` zijn ontwerp, geen runtime.
- NEVO-licentie is nog Dennis-buiten-repo (`BESLUIT_NEVO` stap 4).
- FDC API was 403 in de cloud-agent-handoff; USDA-`observed` is daardoor 0. Dat kan in een andere omgeving anders zijn — code wacht op data, niet op een module.
- Tellingen blogs/KB/catalogus via grep; voor campagnes `npm run generate-state` draaien.

### Open vragen voor Dennis / Opus

1. Wordt NEVO-licentie aangevraagd, of blijft USDA+WebSearch de vulling voor `bron: null` (met de vitamine-D/verrijking-grens)?
2. Mag daybook `items` (productgrammen) live onder de ondergrens-regel, of blijft 2+2-groepen de productie-invoer?
3. Gaan `getAdvice` en PLAN-content in één UI-pad vallen vóór verdere voedings-SEO?
4. Is publieke search een herroeping van “zoek eruit”, of blijft zoeken catalogus-intern (dagboek)?
5. Food-affiliate: catalogus-gaps vraag 1 — default nee.
6. Ashwagandha-sunset-datum op de kalender (VWS/TRIS) — geen content, wel risico.

### Docs die Opus niet als SSOT moet lezen zonder de code

| Doc | Waarom stale / gevaarlijk |
|---|---|
| `ARCHITECTURE.md` | “Geen account-systeem”, “scoring in frontend”, PM2 i.p.v. systemd |
| `CURRENT_SPRINT.md` | 27 blogs / 24 KB; engine 1.4.0; juli-focus |
| `PAGE_ROADMAP.md` | “juni 2026” |
| `ENTITY_MODEL.md` | mist daybook, verdicts, favorites, nutrition_score-kolommen |
| `VERWERKINGSREGISTER.md` | 2026-08-18; mist voedingslog/dagboek |
| `IA_ECOSYSTEEM.md` | `/leefstijl/{domein}`, inzichten-als-nav-hub |
| `ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` | “geen `/product/*`”, “score is handmatig” — achterhaald |
| `ROADMAP_...VOEDING.md` / `BESLUIT_VOEDINGSDAGBOEK` statusregel | “nog niet gebouwd” — 2+2-dagboek, catalogus, schap, spread **staan** in code; `items` niet |
| `nutrient-routes.ts` kopcomment | “allemaal verified: false” |
| `_MASTER_INDEX.md` “wat is live juli 2026” | engine 1.7.0, product-hub, daybook niet genoemd |

---

## 9. Bijlage — checklist key files per thema

### Nutrition / food diary

- `src/data/nutrition/*`
- `src/lib/nutrition-*.ts`, `src/lib/account-nutrition-daybook.ts`, `src/lib/protein-target.ts`
- `src/components/nutrition/*`
- `src/components/dashboard/voortgang/Nutrition*.tsx`, `Nutrient*.tsx`, `SchapView.tsx`
- `src/app/intake/voeding/page.tsx`
- `src/app/api/intake/nutrition-log/route.ts`, `.../latest/route.ts`
- `src/app/api/account/nutrition-daybook/route.ts`
- `src/app/onderbouwing/voeding/page.tsx`
- `supabase/migrations/20260610140000_intake_intake_log.sql`
- `supabase/migrations/20260903130000_account_nutrition_daybook.sql`
- `supabase/migrations/20260903140000_daybook_meals_water.sql`
- `scripts/usda-extract.mjs`

### SEO / content / KG-substituten

- `docs/core/SEO_RULES.md`, `CONTENT_SYSTEM.md`, `CONTENT_MAP.md`, `CONTENT_GAPS.md`
- `src/lib/seo/canonical.ts`, `src/lib/seo/structuredData.ts`
- `src/app/sitemap.ts`, `src/app/robots.ts`, `next.config.ts`
- `src/data/kennisbank.ts`, `src/data/blog/index.ts`, `src/data/insights.ts`
- `src/data/__tests__/magnesium-cluster-links.test.ts`
- `docs/cursors/spinnenweb-link-audit.md`, `docs/cursors/seo-structured-data-audit.md`
- `scripts/generate-state.mjs`

### Intake / scoring / supplementroute

- `src/lib/intake-engine.ts`
- `src/lib/nutrition-advice.ts`, `src/lib/nutrition-advice-personalization.ts`
- `src/lib/supplement-verdict.ts`, `supplement-verdict-producer.ts`, `supplement-verdict-store.ts`
- `src/data/approved-claims.ts`
- `src/lib/comparison-availability.ts`
- `src/data/domain-product-stance.ts`
- `src/data/domain-supplement-candidates.ts`
- `src/lib/content/plan-content.ts`, `src/lib/content/match-interventions.ts`
- `docs/plan/PLAN_ENGINE_DECISION.md`
- `supabase/migrations/20260728120000_supplement_verdicts.sql`
- `src/types/verdict.ts`, `src/types/recommendation-explanation.ts`

### Supplement catalog / affiliate

- `src/data/supplements/*`, `src/data/supplement-guides/*`, `src/data/supplement-hub/*`
- `src/lib/supplement-hub/product-catalog.ts`
- `src/lib/supplement-score/compute.ts`
- `src/data/affiliate-links.ts`
- `src/app/beste/[supplement]/page.tsx`, `src/app/supplementen/[supplement]/page.tsx`, `src/app/product/[slug]/page.tsx`
- `docs/core/AFFILIATE_SYSTEM.md`
- `docs/research/CATALOGUS_GAPS_VOEDING_LEEFSTIJL_SUPPLEMENTEN_2026-09.md`

### Admin / PartnerDesk / eigen programma (niet mengen)

- `src/lib/partnerdesk/*`, `src/app/admin/(desk)/*`
- `supabase/migrations/20260712120000_partnerdesk_fase1.sql`
- `src/lib/affiliate/*`, `src/app/admin/(desk)/programma/*`
- `supabase/migrations/20260714120000_affiliate_kern_fase3a.sql`

### Events / privacy

- `src/lib/events.ts`
- `src/lib/intake-events-client.ts`, `src/lib/account-events-client.ts`
- `src/app/api/intake/events/route.ts`, `src/app/api/account/events/route.ts`
- `src/lib/nutrition-log-consent.ts`
- `docs/core/VERWERKINGSREGISTER.md`, `docs/core/DPIA.md`, `src/app/privacy/page.tsx`

### Evidence / search-infra

- `src/lib/evidence-rag.ts`
- `docs/core/EVIDENCE_CHAT.md`
- `supabase/migrations/20260529240000_evidence_rag_chat.sql`

---

*Einde rapport. Geen applicatiecode gewijzigd.*
