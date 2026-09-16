# Ecosysteem-architectuur — van losse pagina's naar één contentgraaf

> **Layer 2 — Systems.** Audit van de bestaande codebase + doelarchitectuur + gefaseerd Cursor-codeerplan.
> Opgesteld 15 september 2026. Bouwt voort op het 7-daagse `codeerplan` (conversie op wat er staat),
> `docs/core/IA_ECOSYSTEEM.md`, `docs/core/SEO_RULES.md` en `docs/core/CONTENT_MAP.md`.
>
> **Verhouding tot het 7-dagenplan:** dat plan is een *conversie*-sprint op zeven bestaande pagina's
> en zegt expliciet "geen nieuwe /beste/*- of blogpagina's". Dit document raakt dat niet: het gaat over
> de *verbindingen* tussen wat er al staat. De twee botsen op één punt — taak A5 (omega-3 root-URL's 301)
> en A4 (magnesium H1) zijn hier opnieuw opgenomen als fase 9, omdat ze in een bredere
> cannibalisatie-opruiming horen. Draait het 7-dagenplan eerst, dan vervalt fase 9 grotendeels.

---

## 1. Executive summary

### Wat ik aantrof

PerfectSupplement is **geen verzameling losse artikelen**. De keten die je beschrijft —
artikel → kennis → probleem → leefstijl → voeding → voedingscheck → tekortkoming → supplementroute →
vergelijking → persoonlijke vervolgstap — **bestaat al volledig in code**. Hij is alleen op één plek
gebouwd: **achter de check**, in `/intake/voeding` + `/dashboard`.

Concreet aanwezig en werkend:

| Schakel | Waar | Staat |
|---|---|---|
| PROBLEEM/DOEL → DOMEIN | `intake-engine.ts` (6 domeinscores, profiellabels, `DeficiencySignals`) | ✅ |
| CHECK → TEKORTKOMING | `nutrition-route-status.ts` → `covered / partial / gap / off_route / unmeasured` per nutriënt | ✅ |
| NUTRIENT → VOEDING | `FOOD_SOURCES` (119 rijen, 88 met USDA-gehalte) + `nutrition-nutrient-index.ts` (omgekeerde index) | ✅ |
| VOEDING → PRODUCT | `FOOD_CATALOG` (371 regels, 13 vaste voedselgroepen) | ✅ |
| NUTRIENT → SUPPLEMENT | `intake-reference.ts` → `comparisonPath` per nutriënt | ✅ |
| TEKORTKOMING → SUPPLEMENTROUTE | `recommendation-engine.ts` + `SUPPLEMENT_CATALOG.routeTriggers` + `supplement-gate.ts` | ✅ |
| SUPPLEMENT → VERGELIJKING → PRODUCT | `/supplementen/*` → `/beste/*` → `/product/*` | ✅ |
| **ARTIKEL → alles hierboven** | — | ❌ |

De laatste rij is het hele probleem. **De publieke SEO-laag en het ecosysteem raken elkaar niet.**

### De vier cijfers die het verhaal vertellen

1. **0 van de 78 blogartikelen linkt naar de voedingscheck** (`/intake/voeding`). 52 van de 78 linken wel naar `/intake`.
2. **0 publieke pagina's consumeren de voedingsdatabase.** 371 voedingsmiddelen en 119 gebronde nutriëntregels — waarvan 88 met een USDA-gehalte — produceren vandaag **nul indexeerbare pagina's**.
3. **De 8 supplementgidsen (`/supplementen/*`) staan niet in de sitemap.** De hele educatieve laag tussen artikel en vergelijking is voor Google onvindbaar behalve via interne links.
4. **0 van de 78 artikelen linkt naar een Gezondheidsgids** (`/gids/*`), terwijl die in de top-nav staan.

### Wat ik adviseer — en waar ik van je voorstel afwijk

**Ik adviseer de contentgraaf NIET in Supabase te zetten.** Je vraagt in §15 om tabellen als
`content_topics`, `article_topics`, `article_nutrients`, `cta_rules`. Dat is hier de verkeerde plek:

- De content is **statische TypeScript-data**, statisch gegenereerd, met 300 testbestanden eromheen.
  Relaties in Postgres maken elke contentpagina óf dynamisch óf afhankelijk van een build-time fetch.
  Je ruilt compile-time typeveiligheid in voor runtime-risico, en je verliest de `next build`-garantie
  dat een dode link de build breekt.
- Het zou een **tweede CMS** zijn — precies wat je eigen regel §24 verbiedt.
- **De graaf bestaat al in code**, en hij is compleet: `src/data/insight-metadata.ts` bevat voor
  *alle* 115 contentitems (78 blog + 37 kennisbank) een overlay met `theme`, `planPhase`, `gapSignal`,
  `profile` en `relatedSupplementId` — met een test die 100% dekking afdwingt. Dat is precies de
  entiteitgraaf die je vraagt, minus drie dimensies.

**Mijn voorstel: breid dat ene bestand uit met `nutrients`, `check`, `problems` en `foods`, en bouw
daar één resolver overheen.** Kosten: één type, één datafile, één lib-module, tests. Geen migratie,
geen RLS, geen runtime-risico. Supabase blijft waar hij hoort: **gedrag** (events, sessies, logs),
niet **structuur**.

**Tweede afwijking: bouw geen 371 voedingsmiddelpagina's.** Dat is doorway-page-risico en het levert
bij dit domein vrijwel zeker dunne pagina's op. Bouw **5 nutriëntpagina's** (`/voedingsstoffen/*`).
Dat is precies het ontbrekende scharnier — het is de enige pagina-soort die artikel, voeding, check
én supplement tegelijk raakt — en het is 5 pagina's in plaats van 371. Zie §26 (DO NOT BUILD YET).

### De grootste kans in één zin

> Vijf nutriëntpagina's en één `resolveNextStep()`-functie veranderen 115 doodlopende SEO-pagina's
> in 115 ingangen naar het volledige ecosysteem — zonder één bestaande URL te wijzigen.

---

## 2. Huidige architectuur — wat bestaat

### 2.1 Publieke routes (gemeten, 15 sep 2026)

| Laag | Route | Aantal | Databron | Model |
|---|---|---|---|---|
| Vergelijking (geld) | `/beste/[supplement]` | 7 | `src/data/supplements/*` | `ComparisonPageData` |
| Supplementgids (kennis) | `/supplementen/[supplement]` | 8 | `src/data/supplement-guides/*` | `SupplementData` |
| Producthub | `/supplementen` | 1 | `supplement-hub/catalog.ts` + PS-Score | `CatalogEntry` |
| Productdetail | `/product/[slug]` | n | `lib/supplement-hub/product-catalog` | — |
| Blogartikel | `/blog/[slug]` | 78 | `src/data/blog/*` | `BlogArtikel` |
| Blogcategorie | `/blog/[categorie]` | 4 | `blog/categorieen.ts` | — |
| Kennisbank | `/kennisbank/[slug]` | 37 | `src/data/kennisbank.ts` | `KennisbankTerm` |
| Pillar (leefstijl) | 8 losse routes | 8 | handgeschreven `page.tsx` | — |
| Profiel | `/profiel/[slug]` + 4 statisch | 4+ | `src/data/profiles/*` | `ProfilePageData` |
| Gezondheidsgids (hub) | `/gidsen` | 1 | `src/data/guides.ts` | `Guide` |
| Gezondheidsgids (detail) | `/gidsen/[slug]` | 7 | `src/data/guides.ts` | `Guide` |
| Gids-opt-in | `/gids/[thema]` | 7 | `src/data/gids/*` | `GuideOptInData` |
| Contenthub | `/inzichten` | 1 | `src/data/insights.ts` | `InsightItem` |
| Legacy root-artikelen | 3 losse routes | 3 | `blog-posts.ts` + `page-content/*` | 3e model |
| Checks | `/intake`, `/intake/{voeding,slaap,stress,beweging}` | 5 | `intake-questions.ts` e.a. | — |
| Persoonlijk | `/dashboard`, `/rapport/[sid]` | 2 | Supabase | — |

### 2.2 Wat er echt goed is

1. **De meetlaag is volwassen.** `DOMAIN_EVENT_TYPES` telt ~110 durable event-typen met een
   drieweg-registratie (`events.ts` + `intake-events-client.ts` + allowlist in de API-route).
   Consent-gated, PII-vrij, met n8n-outbox. Dit is beter dan wat de meeste sites van deze omvang hebben.
2. **De nutriëntdata is uitzonderlijk zorgvuldig.** `food-sources.ts` scheidt `nutrientValue`
   (geciteerd, per 100 g, met editie) van `amount` (eigen herberekening naar portie), draagt per rij
   `verified`, `variability`, `bioavailability` en de bijbehorende motivering, en documenteert de
   NEVO-licentiegrens. De harde leesregel — *"deze waarden tellen NIET op tot een dagtotaal"* — is
   een architectuurbeslissing die je overal moet respecteren. Ik doe dat in dit plan.
3. **`CONTENT_METADATA` is al een graaf-overlay met afgedwongen dekking.**
   `src/data/__tests__/insight-metadata.test.ts` faalt als één contentitem geen `theme` heeft, als een
   `relatedSupplementId` niet in `SUPPLEMENT_CATALOG` bestaat, of als een `gapSignal` geen echte
   `DeficiencySignals`-sleutel is. Dat is referentiële integriteit zonder database.
4. **URL-hygiëne.** 33 permanente redirects in `next.config.ts`, netjes onderhouden. Geen slordige
   URL-wissels in de historie.
5. **Personalisatie zonder SEO-schade.** `CheckLensBanner` rendert alleen bij `?from=intake` en
   raakt de sessie niet bij koud verkeer. Daardoor blijven gids- en profielpagina's statisch
   cachebaar terwijl ze voor een terugkerende bezoeker persoonlijk worden. Dit patroon is de
   blauwdruk voor alle personalisatie op de publieke laag — **niet verlaten.**
6. **Testcultuur.** 300 testbestanden. Elke invariant die je in een test vastlegt, blijft staan.

### 2.3 Personalisatie- en aanbevelingslaag (bestaat — niet opnieuw bouwen)

```
intake-engine.ts        → DomainScores (6) · ProfileLabel · DeficiencySignals · urgency
        ↓
recommendation-engine.ts → SUPPLEMENT_CATALOG.routeTriggers (anyOf: deficiencySignal |
                           domainBelow | domainAbove | profileLabel) → RankedRecommendation
        ↓
supplement-gate.ts       → resolveGatedComparisonPath() — claim-status + beschikbaarheid
        ↓
comparison-availability  → /beste/* alleen tonen als de vergelijking mag
```

Parallel, voor voeding:

```
/intake/voeding → nutrition-intake-estimate.ts → band per NutrientId
        ↓
nutrition-route-status.ts → RouteStatus per nutriënt + eerstvolgende handeling + dragende bronnen
        ↓
nutrition-nutrient-index.ts → van nutriënt naar producten uit FOOD_CATALOG, gesorteerd op
                              onderkant van de spreidingsband, met opname-nuance
```

**Dit is de motor die je vraagt. Hij draait. Hij is alleen niet aangesloten op de publieke laag.**

---

## 3. Huidige SEO-situatie

### 3.1 Wat op orde is

- Elke publieke pagina heeft `metadata` + `alternates.canonical` (gecontroleerd over alle 58 publieke `page.tsx`).
- Geen dubbele `<title>` en geen dubbele `<meta description>` over 95 getitelde content-URL's.
- Article/DefinedTerm/Breadcrumb/FAQ/Product/ItemList/HowTo-builders bestaan centraal in
  `src/lib/seo/structuredData.ts`, met tests.
- Inline markdown-links in de artikeltekst (`[label](/pad)`) zijn de dominante interne-linkvorm —
  319 links naar `/blog`, 111 naar `/kennisbank`, 91 naar `/supplementen`, 79 naar `/beste`.
  Dat is een gezond, redactioneel gedreven web.
- `robots.ts` verbiedt `/admin`, `/api`, `/rapport`.

### 3.2 Wat SEO-technisch zwak is (gemeten)

| # | Bevinding | Bewijs | Ernst |
|---|---|---|---|
| S1 | **8 supplementgidsen ontbreken in de sitemap** | `src/app/sitemap.ts` bevat geen `supplement-guides`-import; `STATISCHE_PADEN` heeft alleen `/supplementen` | CRITICAL |
| S2 | **`/rapport` staat in de sitemap én in `robots.disallow`** | `STATISCHE_PADEN` bevat `/rapport`; `robots.ts` disallowt het | HIGH |
| S3 | **`lastModified` is hardcoded `2026-05-01`** voor alle blog- en kennisbankitems | `const LAST_MOD = new Date("2026-05-01")` | HIGH |
| S4 | **Twee gidssystemen concurreren op dezelfde thema's** | `/gids/slaap` "Gratis Slaapgids na 30" vs `/gidsen/slaap` "Gratis Slaapgids" — 6 thema's overlappen, beide indexeerbaar | HIGH |
| S5 | **H1-botsing magnesium** | `/beste/magnesium` H1 "Welke magnesium past bij jou?" vs `/supplementen/magnesium` H1 "Magnesium: welke vorm past bij jou?" | HIGH |
| S6 | **Legacy root-omega-3-pagina's kannibaliseren de gids** | `/wat-is-omega-3` + `/waar-let-je-op-bij-omega-3` naast `/supplementen/omega-3`, met een derde contentmodel | HIGH |
| S7 | **15 van 37 kennisbanktermen tonen crawlers alleen `whatIsIt`** | `insightTier >= 2 && !publicFullContent && !canAccessVerdieping()` — alle 37 staan wel in de sitemap op priority 0.7 | MEDIUM |
| S8 | **Breadcrumbs ontbreken op pillars, `/gids/*`, `/gidsen/*`, `/profiel`, `/inzichten`** | `Breadcrumbs`-component wordt alleen gebruikt in `BlogArticlePage` en `SupplementPage` | MEDIUM |
| S9 | **`/gidsen/[slug]`, `/profiel`, `/faqs`, `/onderbouwing*`, `/hoe-werkt-dashboard` en de juridische pagina's staan niet in de sitemap** | routediff tegen `sitemap.ts`. *Correctie 16 sep: de drie legacy root-artikelen (`/wat-is-omega-3`, `/waar-let-je-op-bij-omega-3`, `/supplement-kiezen-waar-op-letten`) stonden er wél al in — ze dragen een eigen `pad` in `cornerstone-supplementen.ts` en komen via de blog-sectie mee.* | MEDIUM |
| S10 | **Geen entity-linking in JSON-LD** — geen `@id`, geen `about`/`mentions`, geen `@graph` per pagina | `structuredData.ts` levert losse objecten | MEDIUM |
| S11 | **`/blog/[categorie]` is een collision-route** die zowel categorieën als artikelen serveert | `generateStaticParams` mengt `GELDIGE_CATEGORIE_IDS` en artikel-slugs | LOW (werkt, maar fragiel) |
| S12 | **9 weesartikelen** zonder enkele inkomende link vanuit andere artikelen | zie §3.3 | MEDIUM |

### 3.3 Weesartikelen (0 inkomende links vanuit andere artikelen)

```
/blog/eiwit-en-whey-in-de-overgang          (supplementen)
/blog/is-whey-schadelijk                    (supplementen)
/blog/krachtverlies-eiwitbehoefte-na-40     (supplementen)
/blog/magnesium-herstel-mannen-40           (supplementen)
/blog/magnesium-in-de-overgang              (supplementen)
/blog/slaapkwaliteit-testosteron-herstel    (slaap)
/blog/vermoeidheid-bloedwaarden-checken-mannen (energie)
/blog/vitamine-d-botgezondheid-overgang     (supplementen)
```

(`pijler-testosteron-na-40` is geen echte pagina maar een bibliotheek-alias naar `/testosteron-na-40`.)

Opvallend: **acht van de negen zijn de nieuwste artikelen.** Het patroon is duidelijk — nieuwe
artikelen krijgen wel uitgaande links, maar bestaande artikelen worden niet bijgewerkt om naar
ze terug te wijzen. Dat is precies wat een automatische linklaag oplost.

### 3.4 Uitgaande linkverdeling per artikel (78 artikelen)

| Doel | Artikelen die er minstens één link naartoe hebben |
|---|---|
| `/beste/*` (commercieel) | **66 / 78** |
| `/kennisbank/*` | 60 / 78 |
| `/intake` (leefstijlcheck) | 52 / 78 |
| `/supplementen/*` (gids) | 37 / 78 |
| `/profiel/*` | 10 / 78 |
| **`/intake/voeding` (voedingscheck)** | **0 / 78** |
| **`/gids/*` (gezondheidsgidsen)** | **0 / 78** |
| `/dashboard` | 0 / 78 |

Lees dit naast je eigen productfilosofie (§14: *begrijpen → controleren → verbeteren → aanvullen →
vergelijken → eventueel kopen*). Vandaag is de dominante route **artikel → vergelijking** (66/78),
terwijl de stap *controleren* (voedingscheck) en de stap *verbeteren* (leefstijlgids) letterlijk
nul keer wordt aangeboden. De site is in zijn linkgedrag commerciëler dan in zijn zelfbeeld.
Dat is het scherpste argument voor dit hele plan — en het is te repareren zonder één woord copy
te wijzigen.

---

## 4. De grootste gaps

### G1 — De check-laag is onzichtbaar vanuit content (CRITICAL)
Vier checks bestaan (`/intake`, `/intake/voeding`, `/intake/slaap`, `/intake/stress`, `/intake/beweging`).
Alleen de generieke `/intake` wordt vanuit content aangeboden, altijd met dezelfde CTA, ongeacht
het onderwerp. Een magnesium-uit-voeding-artikel stuurt je naar een 15-vragen-leefstijlcheck in
plaats van naar de voedingscheck die precies zijn vraag beantwoordt.

### G2 — De voedingsdatabase heeft nul publieke oppervlakte (CRITICAL kans)
371 voedingsmiddelen, 119 gebronde nutriëntregels, 88 USDA-geverifieerde gehaltes, een omgekeerde
index van nutriënt naar product met opname-nuance en spreidingsbanden — en geen enkele URL.
Elke zoekopdracht van het type *"waar zit veel magnesium in"*, *"hoeveel omega-3 per dag"*,
*"eiwitrijke voeding"* landt vandaag óf op een blogartikel dat het onderwerp aanraakt, óf nergens.

### G3 — De contentgraaf mist de voedingsdimensie (HIGH)
`ContentMetadata` heeft `theme`, `planPhase`, `gapSignal`, `profile`, `relatedSupplementId`.
Er is geen `nutrients`, geen `foods`, geen `check`, geen `problem`, geen `goal`.
Daardoor kan geen enkel systeem afleiden dat *"magnesium-uit-voeding"* over de nutriënt `magnesium`
gaat, dat de voedingscheck die stof meet, en dat `FOOD_SOURCES.magnesium` de bronnen draagt.

### G4 — Geen centrale beslislogica voor de volgende stap (HIGH)
Elk artikel draagt tot vier handmatig ingevulde linkvelden (`supplementCTA`, `cornerstoneLink`,
`vergelijkingExtraLink`, `supplementenHubLink`) plus `gerelateerdeSluggen`. Die worden in
`BlogArticlePage.tsx` bijna allemaal tegelijk gerenderd — tot vier CTA-blokken onder elkaar.
Er is geen functie die zegt: *"gegeven dit artikel, wat is de één juiste volgende stap?"*

### G5 — Dubbele systemen (MEDIUM, maar het kost rankings)
- **Gidsen:** `/gids/[thema]` (7, opt-in-formulier, in sitemap) vs `/gidsen/[slug]` (7, longform
  contentpagina, níet in sitemap). De inhoudelijk sterkere pagina is de onvindbare.
- **Artikelmodellen:** drie — `BlogArtikel`, `KennisbankTerm`, en `blog-posts.ts` + `page-content/*`
  voor de drie legacy root-pagina's.
- **Profielpagina's:** vier statische routes náást `/profiel/[slug]` (bewust, met
  `STATIC_PROFIEL_SLUGS`-guard — geen bug, wel dubbel onderhoud).

### G6 — De contentlaag is vrijwel ongemeten (HIGH)
~110 durable events, maar vrijwel allemaal ín de app (dashboard, intake, plan, voedingstools).
Op de contentlaag bestaan alleen `affiliate.click`, `artikel_supplementen_hub_click`,
`inzichten_premium_kennisbank_click` en `comparison_ladder_cta_click`. **Er is geen enkel event dat
artikel → check, artikel → nutriënt of artikel → gids meet.** Je kunt vandaag niet aflezen of een
artikel bezoekers verder brengt of doodloopt.

### G7 — Bestaande relaties die onvoldoende benut worden
| Relatie | Waar hij al bestaat | Wat er niet mee gebeurt |
|---|---|---|
| `NutrientReference.comparisonPath` | `intake-reference.ts` | nutriënt → vergelijking wordt alleen in de check gebruikt |
| `FOOD_SOURCES[nutrient]` | `food-sources.ts` | nooit publiek getoond |
| `KennisbankTerm.relatedComparisons` | `kennisbank.ts` | wel gerenderd, maar niet omgekeerd (vergelijking → term ontbreekt) |
| `CONTENT_METADATA.gapSignal` | `insight-metadata.ts` | alleen voor herordening op `/inzichten` |
| `SUPPLEMENT_CATALOG.routeTriggers` | `supplement-catalog.ts` | alleen achter de check |
| `THEME_CONTENT_MAP` | `theme-content-map.ts` | thema → pillar/profiel/kennisbank bestaat, maar wordt niet vanuit artikelen gebruikt |

### G8 — Technisch zwak
- `/supplementen` is `force-dynamic` — de belangrijkste commerciële hub rendert per request.
- `/kennisbank/[slug]` leest `cookies()` in de page body (`canAccessVerdieping`) en is daarmee
  dynamisch, ondanks `generateStaticParams`. 37 pagina's zonder statische HTML.
- `sitemap.ts` importeert ~12 datamodules; bij groei van de catalogus loopt dit vast op één bestand
  zonder sitemap-index.
- `docs/cursors/seo-structured-data-audit.md` verwijst naar `src/lib/structured-data.ts` — dat
  bestand bestaat niet meer. Auditdocs zijn deels verouderd.

---

## 5. Gewenste ecosysteem-architectuur

### 5.1 Eén principe

> **De graaf woont in code. Supabase meet gedrag. Pagina's blijven statisch.**

Drie lagen, strikt gescheiden:

```
LAAG 1 — DE GRAAF (statisch, TypeScript, compile-time gevalideerd)
  src/data/insight-metadata.ts   ← uitgebreid, blijft de enige overlay
  src/data/content-graph/*.ts    ← registries: TOPIC, PROBLEM, GOAL (afgeleid, niet nieuw bedacht)
  src/lib/content-graph/*.ts     ← resolvers: relatedContent(), resolveNextStep(), graphEdges()

LAAG 2 — DE PRESENTATIE (server components, statisch gerenderd)
  <NextStepBlock>      één contextuele vervolgstap
  <RelatedContentRail> automatisch afgeleide interne links
  <NutrientSourcesTable> voedingsbronnen uit FOOD_SOURCES
  <Breadcrumbs>        overal (bestaat al)

LAAG 3 — HET GEDRAG (Supabase + GA4 + Clarity)
  domain_events: content.next_step_* · content.related_clicked · content.nutrient_source_clicked
  affiliate_clicks (bestaand, niet aanraken)
```

### 5.2 Wat er NIET komt

- Geen `content_relations`-tabel, geen `article_nutrients`, geen `cta_rules` in Postgres.
- Geen tweede recommendation engine — `recommendation-engine.ts` blijft de enige.
- Geen tweede SEO-systeem — `structuredData.ts` blijft de enige builder.
- Geen nieuw contentmodel — `BlogArtikel` en `KennisbankTerm` blijven.
- Geen URL-wijzigingen behalve de drie gemotiveerde 301's in fase 9.

---

## 6. De contentgraaf

### 6.1 Entiteiten — welke bestaan al, welke komen erbij

| Entiteit | Bestaat als | Actie |
|---|---|---|
| ARTICLE | `BlogArtikel` (78) | hergebruiken |
| BEGRIP / SUBTOPIC | `KennisbankTerm` (37) | hergebruiken |
| TOPIC | `PillarId` (7, waarvan 6 zichtbaar — `verbinding` staat in `VERBORGEN_DOMEINEN`) + `ThemeSlug` (5) — **twee vocabulaires voor hetzelfde** | **normaliseren**: `PillarId` wordt canoniek, `ThemeSlug` blijft als alias |
| PROBLEM | `DeficiencySignals`-sleutels + `ProfileLabel` | promoveren tot expliciete registry |
| GOAL | impliciet in pillar-copy | **nieuw, klein** — max 6, afgeleid van `zichtbareDomeinen()` |
| LIFESTYLE FACTOR | `lifestyle-pyramid.ts` + `lifestyle-priorities.ts` per domein | hergebruiken |
| NUTRIENT | `NutrientId` (5) + `NutrientReference` | hergebruiken, **publiek maken** |
| FOOD | `FOOD_CATALOG` (371) + `FOOD_SOURCES` (119) | hergebruiken, **deels publiek maken** |
| SUPPLEMENT | `SupplementCatalogEntry` (7) + `SupplementSlug` (8) | hergebruiken |
| SUPPLEMENT CATEGORY | `SupplementCategory` | hergebruiken |
| PRODUCT | supplement-hub product-catalog | hergebruiken |
| COMPARISON | `ComparisonPageData` (7) | hergebruiken |
| CHECK | 5 routes, geen registry | **nieuw, klein** — `CHECKS` registry met 5 entries |
| USER PROFILE | `intake_sessions` + `accounts` | hergebruiken |
| RECOMMENDATION / ROUTE | `RankedRecommendation` + lifestyle-plans | hergebruiken |
| FAQ | per pagina inline | laten staan |
| SOURCE / EVIDENCE | `ReferentieItem` + `nutrient-evidence-map.ts` | hergebruiken |

**Drie nieuwe registries, samen ~120 regels.** De rest is hergebruik.

### 6.2 De relaties die ik wél adviseer

```
ARTICLE ──topic──────────▶ TOPIC (PillarId)                 [bestaat: CONTENT_METADATA.theme]
ARTICLE ──problem────────▶ PROBLEM (gapSignal|profile)      [bestaat: CONTENT_METADATA]
ARTICLE ──supplement─────▶ SUPPLEMENT                       [bestaat: relatedSupplementId]
ARTICLE ──nutrient───────▶ NUTRIENT                         ★ NIEUW
ARTICLE ──check──────────▶ CHECK                            ★ AFGELEID (niet handmatig)
NUTRIENT ──food──────────▶ FOOD                             [bestaat: FOOD_SOURCES]
NUTRIENT ──supplement────▶ SUPPLEMENT/COMPARISON            [bestaat: comparisonPath]
NUTRIENT ──check─────────▶ CHECK                            [bestaat: nutritionSliderQuestion]
CHECK ──▶ NUTRIENT STATUS ──▶ SUPPLEMENT ROUTE              [bestaat: nutrition-route-status]
SUPPLEMENT ──▶ COMPARISON ──▶ PRODUCT                       [bestaat]
TOPIC ──▶ PILLAR PAGE · PROFILE · KENNISBANK                [bestaat: THEME_CONTENT_MAP]
```

### 6.3 De relaties die ik afraad — en waarom

| Voorgestelde relatie | Advies | Reden |
|---|---|---|
| `ARTICLE → FOOD` (direct) | **niet doen** | Altijd via NUTRIENT. Een artikel over magnesium hoort naar de stof te wijzen, niet naar 40 losse voedingsmiddelen. Directe koppeling geeft willekeurige links en dubbel onderhoud. |
| `LIFESTYLE FACTOR → NUTRIENT` | **niet doen (nu)** | De enige eerlijke koppeling is zon → vitamine D, en die staat al in `nutrition-season.ts`. De rest zou een fysiologische claim zijn die we niet kunnen dragen. |
| `GOAL → SUPPLEMENT` | **niet doen** | Doel → supplement zonder tussenkomst van een gemeten tekort is precies de affiliate-kortsluiting die je positionering ondermijnt. Altijd via PROBLEM of NUTRIENT. |
| `PRODUCT → CATEGORY` als graafrelatie | overbodig | Bestaat al in de hub-catalogus. |
| `ARTICLE → ROUTE` | **niet doen** | Een route is persoonlijk (komt uit een check). Een statisch artikel kan er niet naar linken zonder te doen alsof het de persoon kent. |

### 6.4 De uitbreiding in code

```ts
// src/types/insight.ts — uitbreiding van ContentMetadata
export interface ContentMetadata {
  theme?: ThemeSlug;                    // bestaat
  planPhase?: 1 | 2 | 3;                // bestaat
  gapSignal?: keyof DeficiencySignals;  // bestaat
  profile?: ProfileLabel["name"] | "Overtrainer";  // bestaat
  relatedSupplementId?: string;         // bestaat

  /** ★ NIEUW — de stof(fen) waar dit stuk over gaat. Max 2; meer betekent dat het
   *  artikel geen onderwerp heeft. Sleutel in `NUTRIENT_IDS`. */
  nutrients?: readonly NutrientId[];

  /** ★ NIEUW — het probleem in gebruikerstaal, als expliciete graafknoop.
   *  Sleutel in `PROBLEMS` (afgeleid van DeficiencySignals + profiellabels). */
  problem?: ProblemId;

  /** ★ NIEUW — alleen invullen om de afgeleide check te OVERRULEN.
   *  Normaal bepaalt `resolveCheck()` dit uit theme + nutrients. */
  checkOverride?: ContentCheckId;
}
```

De `check`-relatie is **afgeleid, niet handmatig** — dat is een bewuste keuze. 115 handmatige
check-toewijzingen lopen uit de pas; een functie niet.

---

## 7. ARTICLE → NUTRITION → SUPPLEMENT → CHECK

### 7.1 De keten, concreet, met bestaande modules

Neem `/blog/magnesium-uit-voeding`:

```
ARTIKEL  magnesium-uit-voeding
  ↓ CONTENT_METADATA.theme = "nutrition" · nutrients = ["magnesium"] · gapSignal = "magnesium_signal"
TOPIC    voeding  (PillarId)             → /voeding-na-40
PROBLEM  magnesium_signal                → "je haalt magnesium mogelijk niet uit je eten"
NUTRIENT magnesium
  ↓ nutrientRoute("magnesium")           → thresholdKind: "proxy" — eerlijk: de check meet dit
  │                                        niet in mg, maar via een groente-en-fruit-telling
  ↓ FOOD_SOURCES.magnesium               → 20+ bronnen met USDA-gehalte, portie, opname-nuance
FOOD     pompoenpitten · amandelen · spinazie · zilvervliesrijst · pure chocolade
  ↓
CHECK    /intake/voeding                 ← want theme = nutrition én nutrients ≠ leeg
  ↓ nutrition-route-status.ts            → RouteStatus: covered | partial | gap | off_route
TEKORT   alleen bij "gap"                → supplement-gate.ts opent de deur
  ↓ nutrientReferences.magnesium.comparisonPath
VERGELIJK /beste/magnesium
  ↓
PRODUCT  /product/<slug>  →  affiliate
```

**Elke pijl in dit diagram bestaat al als functie.** Wat ontbreekt is `nutrients: ["magnesium"]`
op regel 2 en een component die de keten toont.

### 7.2 De volgorde-garantie (je §14, als code)

De belangrijkste inhoudelijke regel is dat de supplementstap **nooit** de eerste aanbieding is.
Dat moet een invariant zijn, geen richtlijn:

```ts
// src/lib/content-graph/next-step.ts
export function resolveNextStep(node: GraphNode): NextStep {
  // Harde regel: een contentpagina biedt nooit VERGELIJKING als primaire stap
  // zolang de bezoeker niets gemeten heeft. Dat is de volgorde
  // begrijpen → controleren → verbeteren → aanvullen → vergelijken.
  // De vergelijking blijft altijd bereikbaar als secundaire link — dat is de
  // monetisatie, en die blijft intact.
}
```

Met een test:

```ts
it("geen enkel contentknooppunt biedt een /beste/-pad als primaire vervolgstap", () => {
  for (const node of allGraphNodes()) {
    expect(resolveNextStep(node).primary.href).not.toMatch(/^\/beste\//);
  }
});
```

Uitzondering, expliciet: `/beste/*` zelf en `/product/*` — daar ís vergelijken de pagina.

---

## 8. User journeys — en waar ze vandaag breken

### Journey A — Google → artikel → voedingscheck → supplementroute
```
Google "waar zit magnesium in"
  → /blog/magnesium-uit-voeding
  → [BREEKT] geen link naar de voedingscheck (0/78)
```
**Fix:** fase 4. Conversiemoment: `content.next_step_clicked{check:"voeding"}`.

### Journey B — Google → supplementpagina → voeding → check → vergelijking
```
Google "magnesium supplement"
  → /supplementen/magnesium  (gids)
  → [BREEKT] gids noemt voeding niet; geen nutriëntpagina; geen check-CTA
  → /beste/magnesium
```
**Fix:** fase 3 + 5. De gids krijgt een "eerst uit je eten"-blok dat naar `/voedingsstoffen/magnesium` wijst.

### Journey C — Google → voedingsmiddel → voedingsstof → check
```
Google "eiwitrijke voeding" / "hoeveel omega-3 per dag"
  → [BREEKT VOLLEDIG] deze landingspagina bestaat niet
```
**Fix:** fase 5. Dit is de journey met de grootste onbenutte zoekvraag.

### Journey D — Google → leefstijlartikel → leefstijlcheck → voedingscheck → supplementroute
```
Google "beter slapen na 40"
  → /slaap-verbeteren-na-40
  → /intake  ✅ werkt
  → [BREEKT] resultaten sturen naar dashboard; de voedingscheck is een tweede,
     losse actie die alleen in het dashboard wordt aangeboden
```
**Fix:** fase 4 (check-keten) — de leefstijlcheck-uitslag biedt de voedingscheck aan als
*eerstvolgende meting* wanneer `nutrition_score` laag is. Dit bestaat al deels
(`intake.cta_to_nutrition_log`) maar niet als expliciete keten.

### Journey E — Direct → leefstijlcheck → voedingscheck → route → vergelijking
```
✅ Werkt al volledig. Dit is de enige complete journey op de site.
```

### De conversiemomenten, op volgorde van waarde

| # | Moment | Vandaag meetbaar? | Event (na fase 8) |
|---|---|---|---|
| 1 | artikel → check gestart | ❌ | `content.next_step_clicked` → `intake.started` |
| 2 | check → tekort gedetecteerd | ✅ (`measurement.gap_detected`) | bestaat |
| 3 | tekort → vergelijking geopend | ⚠️ deels | `dashboard.schap_vergelijking_click` |
| 4 | vergelijking → affiliate-klik | ✅ | `affiliate.click` + `affiliate_clicks` |
| 5 | artikel → nutriëntpagina | ❌ (bestaat niet) | `content.nutrient_opened` |
| 6 | nutriëntpagina → check | ❌ | `content.next_step_clicked` |

---

## 9. SEO-strategie

### 9.1 De clusterstructuur die er al ligt (en de gaten erin)

| Cluster | Pillar | Artikelen | Kennisbank | Gids | Vergelijking | Nutriëntpagina | Status |
|---|---|---|---|---|---|---|---|
| Magnesium | via slaap/stress | 10 | magnesiumvormen, biobeschikbaarheid | — | `/beste/magnesium` | ❌ | sterkste cluster; mist de voedingsschakel |
| Omega-3 | voeding | 7 | epa-dha | — | `/beste/omega-3-supplement` | ❌ | 3 concurrerende root-URL's |
| Vitamine D | voeding | 8 | vitamine-d, vitamine-k2 | — | `/beste/vitamine-d` | ❌ | goed gevuld, seizoenslogica bestaat al ongebruikt |
| Creatine | beweging | 7 | — | — | `/beste/creatine` | n.v.t. (geen nutriënt) | compleet |
| Whey / eiwit | voeding | 8+ | wei-eiwit, leucinedrempel, eiwitbehoefte-na-40 | — | `/beste/eiwitpoeder` | ❌ | sterk cluster, **eiwit is de best meetbare stof** |
| Zink | — | 1 | — | — | `/beste/zink` | ❌ | dunste cluster met een geldpagina |
| Slaap | `/slaap-verbeteren-na-40` | 10 | 6+ | `/gids/slaap` + `/gidsen/slaap` | — | — | dubbele gids |
| Stress | `/stress-verminderen-na-40` | 7 | cortisol, hpa-as, nervus-vagus | 2 | — | — | dubbele gids |
| Energie | `/energie-na-40` | 19 | atp, mitochondriën | 2 | — | — | grootste cluster |
| Voeding | `/voeding-na-40` | — | insulineresistentie | 2 | — | ❌❌ | **pillar zonder cluster-artikelen op voeding zelf** |
| Beweging | `/beweging-na-40` | 2 | overtrainingssyndroom | 2 | — | — | dun |

**De twee scherpste bevindingen uit deze tabel:**

1. **`/voeding-na-40` is een pillar zonder cluster.** Er is geen enkel artikel met categorie
   "voeding" (de vier categorieën zijn stress/slaap/energie/supplementen). Voedingsartikelen zitten
   verstopt onder "supplementen" — wat de commerciële kant van de site nog verder overweegt.
   **De nutriëntpagina's uit fase 5 zijn meteen het ontbrekende cluster onder deze pillar.**
2. **Zink heeft een geldpagina en één artikel.** Dat is een vergelijkingspagina zonder informational
   support — precies het patroon dat Google afstraft. Ofwel het cluster vullen, ofwel `/beste/zink`
   accepteren als low-priority.

### 9.2 Intentie-architectuur per paginatype

| Intentie | Landingspagina | Primaire volgende stap | Secundair |
|---|---|---|---|
| Informational — "wat is X" | `/kennisbank/*` | gerelateerd artikel | nutriëntpagina |
| Informational — "hoe verbeter ik X" | pillar, `/gids/*` | leefstijlcheck | artikel |
| Informational — "waar zit X in" | **`/voedingsstoffen/*` (nieuw)** | **voedingscheck** | voedingsbronnen |
| Informational — "hoeveel X per dag" | artikel + nutriëntpagina | **voedingscheck** | gids |
| Commercial investigation — "welke X is goed" | `/supplementen/*` | nutriëntpagina ("eerst uit je eten") | vergelijking |
| Transactional — "beste X kopen" | `/beste/*` | vergelijking zelf | gids + check |

### 9.3 AI-search en semantische SEO

Wat AI-zoeksystemen nodig hebben en wat hier ontbreekt:

1. **Eenduidige entiteiten met stabiele identifiers.** Vandaag heeft niets een `@id`. Advies:
   `https://perfectsupplement.nl/voedingsstoffen/magnesium#nutrient` als canonieke entiteit-id,
   en laat artikelen er via `about` naar wijzen. Eén nieuwe functie in `structuredData.ts`.
2. **Antwoord-eerst-structuur.** `kernpunten` bestaat al op `BlogArtikel` en wordt "render-when-present"
   getoond. Gebruik het consequent op de nutriëntpagina's: de eerste 40 woorden beantwoorden de vraag.
3. **Expliciete onzekerheid.** Dit is je onderscheidende voordeel en het is al gebouwd:
   `RouteThresholdKind` (`populatierichtlijn | vuistregel | proxy`), `verified`, `variability`,
   `bioavailability`. AI-systemen citeren bronnen die hun eigen grenzen benoemen. **Toon die
   velden publiek** — niet als kleine lettertjes, maar als kolom in de bronnentabel.
4. **Geen `MedicalWebPage`.** Ik adviseer dit expliciet níet. De vereisten (medisch reviewer,
   `lastReviewed`, `reviewedBy` met verifieerbare credentials) kun je vandaag niet waarmaken, en
   je positionering is uitdrukkelijk *"adviezen, geen diagnoses"*. `Article` + `DefinedTerm` +
   `FAQPage` + `BreadcrumbList` + `ItemList` dekt alles, en klopt.

---

## 10. Interne linking-strategie

### 10.1 Wat automatisch mag, en wat handmatig blijft

| Linksoort | Bron | Automatisch? | Waarom |
|---|---|---|---|
| Inline contextlink in lopende tekst | markdown in `tekst` | **nee, blijft handmatig** | De ankertekst is onderdeel van de zin. Automatiseren levert onnatuurlijke copy. Dit is vandaag de sterkste linklaag — niet aanraken. |
| "Gerelateerde artikelen" onderaan | `gerelateerdeSluggen` | **ja, met handmatige override** | Afleidbaar uit `theme` + `nutrients` + `problem`. Handmatige waarde wint altijd. |
| Vervolgstap-blok | nu 4 losse velden | **ja** | `resolveNextStep()` |
| Nutriëntlink | — | **ja** | uit `CONTENT_METADATA.nutrients` |
| Check-CTA | `BlogIntakeCTA` | **ja** | afgeleid |
| Cross-cluster (pillar ↔ artikel) | handmatig | **half** | pillar → artikel automatisch; artikel → pillar blijft `cornerstoneLink` |

### 10.2 De regels die de resolver afdwingt

1. **Maximaal 6 automatisch gegenereerde links per pagina**, boven op de redactionele inline-links.
   Meer maakt de pagina een linkfarm en verdunt de PageRank-doorgifte.
2. **Ankertekst komt van de doelpagina**, nooit van de bron. Één veld (`linkLabel`) per entiteit,
   op één plek onderhouden. Voorkomt de klassieke drift waarbij 12 artikelen de vergelijking met
   12 verschillende namen aanduiden.
3. **Nooit naar zichzelf, nooit dubbel** binnen één blok.
4. **Relevantiedrempel:** een automatische link vereist minstens twee gedeelde graafdimensies
   (bijv. zelfde `theme` én zelfde `nutrient`), of een expliciete relatie. Eén gedeeld thema is te weinig —
   dat zou alle 19 energie-artikelen aan elkaar knopen.
5. **Wees-preventie is een test, geen dashboardtaak.** De build faalt als een contentitem 0
   inkomende interne links heeft.

### 10.3 De weesreparatie

De 9 weesartikelen hebben geen handwerk nodig: zodra `relatedContent()` bidirectioneel afleidt,
krijgt elk artikel inkomende links van zijn cluster. De test in fase 0 bewaakt dat het zo blijft.

---

## 11. Contextuele CTA-strategie

### 11.1 De beslisboom (jouw §5, uitgewerkt en bestand-klaar)

```ts
// LET OP: `CheckId` en `CHECKS` BESTAAN AL in src/types/dashboard.ts resp.
// src/data/dashboard/index.ts, met een andere betekenis ("check1" | "check2",
// de check-in-slots van het dashboard). Daarom hier expliciet andere namen —
// dit is precies het soort botsing dat een tweede systeem zou verraden.
type ContentCheckId = "leefstijl" | "voeding" | "slaap" | "stress" | "beweging";

function resolveCheck(meta: ContentMetadata): ContentCheckId {
  if (meta.checkOverride) return meta.checkOverride;

  // 1. Draagt het stuk een nutriënt? Dan meet de voedingscheck de vraag die
  //    het stuk oproept — ongeacht het thema.
  if (meta.nutrients?.length) return "voeding";

  // 2. Anders: het gemeten domein bepaalt de check, mits die bestaat.
  switch (meta.theme) {
    case "nutrition": return "voeding";
    case "sleep":     return "slaap";
    case "stress":    return "stress";
    case "movement":  return "beweging";
    default:          return "leefstijl";   // connection + alles zonder eigen check
  }
}
```

**Waarom nutriënt vóór thema gaat.** `/blog/magnesium-en-slaap` heeft `theme: "sleep"`, maar de
vraag die de lezer overhoudt is *"haal ik genoeg magnesium uit mijn eten?"* — en dat meet de
voedingscheck, niet de slaapcheck. De stof is specifieker dan het domein, dus de stof wint.

### 11.2 De gecombineerde route

Wanneer een stuk zowel een nutriënt als een niet-voedingsdomein draagt (magnesium × slaap), toont
het blok **één primaire CTA (voedingscheck) en één secundaire regel** naar de domeincheck.
Niet twee gelijkwaardige knoppen — dat is de keuzeparalyse die je nu al hebt met vier gestapelde
CTA-blokken.

### 11.3 De vervolgstap per funnelfase

| Fase | Situatie | Primaire CTA | Copy-richting |
|---|---|---|---|
| Koud, informational | geen check gedaan | de afgeleide check | "Ontdek wat hierbij bij jou meespeelt" |
| Koud, commercial | `/supplementen/*` | nutriëntpagina | "Kijk eerst wat je eten al levert" |
| Koud, transactional | `/beste/*` | de vergelijking zelf | bestaand |
| Warm (`?from=intake`) | check gedaan | `CheckLensBanner` (bestaat) | "Dit is wat jouw uitslag hierover zei" |
| Terugkerend (account-cookie) | ingelogd | "Ga verder met jouw route" → `/dashboard` | bestaand |

De warme en terugkerende varianten **bestaan al** (`CheckLensBanner`, `IntakeResultsReturnBanner`,
`VoortgangReturnBanner`). Fase 3 sluit ze alleen aan op de contentlaag, met hetzelfde
query-param-patroon zodat de pagina statisch blijft.

### 11.4 Wat er met de bestaande CTA-velden gebeurt

**Niets wordt verwijderd.** `supplementCTA`, `cornerstoneLink`, `vergelijkingExtraLink` en
`supplementenHubLink` blijven bestaan en blijven gevuld. `resolveNextStep()` **kiest** welke
gerenderd worden en in welke volgorde, in plaats van alle vier te stapelen. Dat is een
presentatiewijziging, geen datamigratie — en volledig terug te draaien met één feature-flag.

---

## 12. Databaseplan

### 12.1 Advies per voorgestelde tabel

| Tabel die je noemt | Advies | Onderbouwing |
|---|---|---|
| `content_topics`, `article_topics` | **niet bouwen** | `CONTENT_METADATA.theme` + `PILLAR` dekken dit, compile-time gevalideerd |
| `content_relations` | **niet bouwen** | `relatedContent()` leidt dit af; een tabel zou een tweede waarheid zijn |
| `articles` | **niet bouwen** | `src/data/blog/*` is de bron; dupliceren geeft drift |
| `article_supplements` | **niet bouwen** | `relatedSupplementId` bestaat |
| `article_nutrients` | **niet bouwen** | wordt `CONTENT_METADATA.nutrients` |
| `article_foods` | **niet bouwen** | relatie loopt via nutriënt (§6.3) |
| `article_checks` | **niet bouwen** | afgeleid, niet opgeslagen |
| `supplements`, `supplement_nutrients` | **niet bouwen** | `SUPPLEMENT_CATALOG` + `approved-claims` |
| `foods`, `food_nutrients`, `nutrients` | **niet bouwen** | `FOOD_CATALOG` + `FOOD_SOURCES` + `intake-reference` — en ze dragen licentie-metadata die je in code wilt houden |
| `lifestyle_factors` | **niet bouwen** | `lifestyle-pyramid.ts` per domein |
| `problems`, `goals` | **niet bouwen** | registry in code, ~40 regels |
| `checks` | **niet bouwen** | registry in code, 5 entries (`CONTENT_CHECKS` — `CHECKS` is bezet) |
| `recommendation_rules` | **niet bouwen** | `routeTriggers` in `SUPPLEMENT_CATALOG` |
| `routes`, `route_steps` | **bestaat al** | `plan_progress`, `lp_*`, agenda-tabellen |
| `cta_rules` | **niet bouwen** | pure functie; een tabel maakt CTA-logica onzichtbaar voor de typechecker |
| `seo_entities` | **niet bouwen** | JSON-LD `@id` is de identifier |

### 12.2 De enige databasewijziging die ik wél adviseer

Eén tabel, en pas in fase 8:

```sql
-- supabase/migrations/2026xxxx_content_health_snapshots.sql
create table content_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  captured_at timestamptz not null default now(),
  -- De hele gezondheidsrapportage als één blob. Bewust geen genormaliseerde
  -- kolommen: dit is een momentopname voor trendweergave, geen queryable model.
  report jsonb not null,
  -- Snelle samenvatting voor de Vandaag-kaart zonder de blob te lezen.
  critical_count int not null default 0,
  high_count int not null default 0
);
alter table content_health_snapshots enable row level security;
-- Geen policies: service-role only, zelfde patroon als pd_* en af_*.
```

| Aspect | Beoordeling |
|---|---|
| **Waarom** | Alleen om *verloop over tijd* te tonen ("14 weespagina's → 3"). De actuele stand komt uit code. |
| **Relatie** | `organization_id` → `organizations`, zelfde tenant-patroon als de rest |
| **Impact** | Nihil op de publieke site; alleen `/admin` |
| **Schaalbaarheid** | 1 rij per wekelijkse run = 52/jaar |
| **Migratiecomplexiteit** | Laag — één `create table`, geen backfill |
| **Risico** | Laag. Wordt de tabel nooit gevuld, dan werkt de rest gewoon. |

**Als je hem niet wilt: bouw hem niet.** Het contentgezondheidsdashboard werkt zonder trendlijn.

### 12.3 Bestaande Supabase-structuren — niet aanraken

`affiliate_clicks` (expliciet in CLAUDE.md), `intake_sessions`, `pd_*`, `af_*`, `domain_events`.
De nieuwe content-events gaan in `domain_events` via `emitEvent()` — geen nieuwe tabel.

---

## 13. Next.js-architectuur

### 13.1 Nieuwe bestanden

```
src/data/content-graph/
  checks.ts            CONTENT_CHECKS registry (5) — id, href, label, domein, duur
                       (NIET `CHECKS` — die naam is bezet in src/data/dashboard/index.ts)
  problems.ts          PROBLEMS registry — afgeleid van DeficiencySignals + ProfileLabel
  goals.ts             GOALS registry (max 6, 1:1 met `zichtbareDomeinen()` — niet met alle 7 PillarIds)
  nutrient-content.ts  NUTRIENT → { pillar, artikelen, kennisbank, gids, vergelijking }

src/lib/content-graph/
  node.ts              GraphNode — union van artikel | begrip | gids | vergelijking | nutriënt | pillar
  resolve-check.ts     resolveCheck(meta) → CheckId
  next-step.ts         resolveNextStep(node) → NextStep { primary, secondary?, tertiary? }
  related-content.ts   relatedContent(node, limit) → RelatedLink[]
  edges.ts             graphEdges() → alle relaties, voor tests + health-rapport
  health.ts            contentHealth() → Finding[] met severity

src/components/content/
  NextStepBlock.tsx        één contextuele vervolgstap (server component)
  RelatedContentRail.tsx   afgeleide interne links
  NutrientSourcesTable.tsx voedingsbronnen uit FOOD_SOURCES, met verified/opname-kolom

src/app/voedingsstoffen/
  page.tsx             hub — 5 stoffen
  [nutrient]/page.tsx  detail
```

### 13.2 Renderstrategie

| Route | Vandaag | Doel | Hoe |
|---|---|---|---|
| `/voedingsstoffen/*` | — | **statisch** | `generateStaticParams`, geen cookies |
| `/blog/*`, `/kennisbank/*` | deels dynamisch | statisch | gate in fase 10 naar client component |
| `/supplementen` | `force-dynamic` | statisch + client-personalisatie | fase 10 |
| `/beste/*` | statisch | ongewijzigd | — |

**Regel voor alle nieuwe pagina's:** geen `cookies()` in een server component op de publieke laag.
Personalisatie via `?from=`-param (het `CheckLensBanner`-patroon) of via een client component
die na hydratie een API-route bevraagt.

### 13.3 Sitemap-schaalbaarheid

`sitemap.ts` blijft één bestand tot ~5.000 URL's (de Google-limiet is 50.000 per bestand, maar
de buildtijd van één module met 15 imports wordt eerder het probleem). Bij de huidige ~180 URL's
plus 5 nutriëntpagina's is er geen probleem. **Advies:** herstructureer `sitemap.ts` in fase 2
naar één `SITEMAP_SECTIONS: SitemapSection[]`-array zodat een vergeten sectie een typefout wordt
in plaats van een stille omissie. Dat is precies de bug die S1 veroorzaakte.

---

## 14. Admin & contentgezondheid

### 14.1 Waar het komt

`/admin/site` (het bestaande intake-dashboard) krijgt een tab **"Content"**. Niet in PartnerDesk —
dat gaat over partnerrelaties, niet over content.

### 14.2 Wat het toont

**A. Signalenlijst, gesorteerd op ernst**

| Severity | Signaal | Detectie |
|---|---|---|
| CRITICAL | contentitem ontbreekt in sitemap | routediff |
| CRITICAL | dode interne link | alle `href` resolven tegen echte routes |
| CRITICAL | pagina zonder canonical | AST-scan van `page.tsx` |
| HIGH | weespagina (0 inkomende interne links) | `graphEdges()` |
| HIGH | contentitem zonder `theme` | bestaande test |
| HIGH | vergelijkingspagina met < 3 informationele inkomende links | `graphEdges()` |
| HIGH | nutriënt zonder artikelen | `CONTENT_METADATA.nutrients` |
| MEDIUM | artikel met < 2 interne links | tel |
| MEDIUM | pagina zonder breadcrumbs | componentscan |
| MEDIUM | pagina zonder JSON-LD | componentscan |
| MEDIUM | check die nergens vanuit content wordt aangeboden | `resolveNextStep()` over alle knopen |
| MEDIUM | titel > 60 tekens (7 vandaag) / description buiten 110–160 (28 vandaag) | tel |
| LOW | `laatstBijgewerktOp` > 12 maanden oud | datum |
| LOW | topic zonder pillarpagina | registry-diff |

**B. Per-contentitem-inspecteur.** Eén artikel opzoeken en zien: topics, nutriënten, probleem,
afgeleide check, uitgaande links, inkomende links, CTA-resolutie, schema-typen, referenties, status.

**C. De drie vragen die je expliciet noemde**
- *"Deze supplementpagina wordt door 14 artikelen gelinkt"* → inkomende telling per knoop
- *"Dit topic heeft nog geen pillar page"* → registry-diff
- *"Deze voedingsstof heeft geen voedingsartikelen"* → `nutrients`-dekking

### 14.3 Hoe het draait

`contentHealth()` is een **pure functie over statische data**. De admin-route importeert hem
direct — geen API, geen database, geen cronjob. Dezelfde functie draait in vitest, waar de
CRITICAL-bevindingen de build laten falen. **Eén implementatie, twee consumenten.**

---

## 15. Analytics

### 15.1 De nieuwe events (minimaal, herbruikbaar)

CLAUDE.md eist: elke nieuwe CTA krijgt zijn meting in dezelfde wijziging, geregistreerd op drie
plekken (`src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in
`src/app/api/intake/events/route.ts`).

| Event | Payload | Beantwoordt |
|---|---|---|
| `content.next_step_shown` | `{ node, nodeType, stepKind, target }` | welke vervolgstap wordt aangeboden en hoe vaak |
| `content.next_step_clicked` | `{ node, nodeType, stepKind, target }` | **de kernmetriek: brengt content mensen verder?** |
| `content.related_clicked` | `{ from, to, relation }` | werkt de automatische linklaag? |
| `content.nutrient_source_clicked` | `{ nutrient, foodKey }` | welke voedingsbronnen mensen kiezen — en welke catalogusregel als volgende een gehalte verdient |

Vier events. **Geen meer.** `content.next_step_shown`/`clicked` vervangt de behoefte aan aparte
`article_to_check`, `article_to_supplement`, `article_to_nutrition`-events: `stepKind` is de dimensie.

`nutrition.schap_bron_clicked` bestaat al met exact dezelfde bedoeling in het dashboard-schap —
**hergebruik dat event op de publieke nutriëntpagina** in plaats van een nieuwe te verzinnen.
Dan is één query het antwoord op "welke bron wordt gekozen", ongeacht waar.

### 15.2 KPI's

**SEO**
- Geïndexeerde pagina's (GSC) — nulmeting vóór fase 2, daarna maandelijks
- Impressies/klikken op `/supplementen/*` — vandaag structureel onderschat (niet in sitemap)
- Impressies op `/voedingsstoffen/*` — nieuw, nulmeting = 0
- Interne-linkdekking: % contentitems met ≥ 2 inkomende links (nu meetbaar via `graphEdges()`)
- Weespagina's: 9 → 0

**Engagement**
- `content.next_step_clicked / content.next_step_shown` per `stepKind` — de vervolgstap-CTR
- Artikel → check-conversie: `next_step_clicked{stepKind:"check"}` → `intake.started`
- Voedingscheck-starts vanuit content: vandaag 0 per definitie

**Conversie**
- Check → supplementroute: bestaat (`measurement.gap_detected` → `dashboard.schap_vergelijking_click`)
- Vergelijking → affiliate: bestaat (`affiliate_clicks.pagina`)
- **Nieuw en belangrijk:** aandeel affiliate-klikken met een check in de sessie-historie.
  Dat toetst of de "leefstijl eerst"-route *beter* converteert dan de directe route — de
  kernaanname onder je hele positionering. Vandaag onbeantwoordbaar.

---

## 16. Performance

| Maatregel | Waarom | Fase |
|---|---|---|
| `/supplementen` van `force-dynamic` naar statisch | Belangrijkste commerciële hub rendert per request; personalisatie kan client-side | 10 |
| `/kennisbank/[slug]` gate naar client component | `cookies()` in de page body maakt 37 pagina's dynamisch | 10 |
| Nutriëntpagina's statisch | 5 pagina's die `FOOD_SOURCES` filteren — puur build-time werk | 5 |
| `relatedContent()` memoïseren per build | Wordt op elke pagina aangeroepen; de graaf is onveranderlijk binnen een build | 5 |
| Geen N+1 | Alle graafdata is in-memory TypeScript. Geen query per pagina. | — |
| `lastModified` uit echte data | Nu één constante voor 115 items — Google negeert zo'n sitemap-signaal | 2 |
| Sitemap-index | Pas nodig boven ~5.000 URL's | later |

**De belangrijkste performance-eigenschap van dit plan: het voegt geen enkele runtime-query toe.**
De contentgraaf is compile-time data. Het zwaarste dat erbij komt is een `Map`-opbouw tijdens de build.

---

## 17. Security & privacy

| Aspect | Beoordeling |
|---|---|
| Nieuwe persoonsdata | **geen** |
| Nieuwe events | `content.*` — alleen slugs, nutriënt-id's en link-targets. Geen PII, geen gezondheidsdata. |
| Consent | De nieuwe events lopen via de bestaande consent-gate in `/api/intake/events` — analytics-consent vereist, exact zoals nu |
| Nutriëntpagina's | Publiek, geen sessie, geen cookie. Dat is bewust: ze moeten statisch cachebaar blijven |
| DPIA/verwerkingsregister | Geen wijziging nodig; geen nieuwe verwerkingsdoelen |
| Content-health-tabel | RLS deny-all, service-role only, zelfde patroon als `pd_*`/`af_*` |
| Medische claims | De nutriëntpagina's zijn het grootste claimrisico van dit plan. Regel: elke uitspraak over een stof komt uit `approved-claims.ts` (EFSA-geautoriseerd) of wordt als onderzoeksbevinding met bron gemarkeerd. `KOAG-COMPLIANCE-AUDIT.md` moet fase 5 afdekken vóór deploy. |

---

## 18. Current state vs. target state

| Dimensie | Vandaag | Doel |
|---|---|---|
| Artikelen met een contextuele vervolgstap | 0 (wel 4 gestapelde generieke CTA's) | 115 / 115 |
| Artikelen die naar de voedingscheck linken | 0 / 78 | ~45 / 78 (elk stuk met een nutriënt of voedingsthema) |
| Publieke pagina's op de voedingsdatabase | 0 | 6 (1 hub + 5 stoffen) |
| Supplementgidsen in de sitemap | 0 / 8 | 8 / 8 |
| Weespagina's | 9 | 0, afgedwongen door een test |
| Contentitems met nutriëntrelatie | 0 | ~60 |
| Content-events | 4 losse | 4 systematische + 2 hergebruikt |
| Concurrerende gids-URL's | 13 (6 thema's dubbel) | 7 |
| Dynamische publieke routes | 38 (`/supplementen` + 37 kennisbank) | 1 |
| Contentgezondheid meetbaar | nee (handmatige auditprompts) | ja (functie + test + admintab) |
| Automatisch gevalideerde graafrelaties | 4 (insight-metadata-test) | ~12 |

---

## 19. Migratiestrategie

**Geen big bang. Geen URL-wijzigingen behalve drie gemotiveerde 301's.**

1. **Fases 0–2 raken geen enkele bezoekerservaring.** Tests, sitemap, datamodel. Volledig veilig.
2. **Fases 3–4 wijzigen wat onder een artikel staat**, achter een feature-flag
   (`src/lib/feature-flags.ts` bestaat al). Aan/uit per contenttype.
3. **Fase 5 voegt 6 nieuwe URL's toe.** Puur additief.
4. **Fase 9 is de enige fase met redirects**, en elke redirect is gated op Search Console-data.

### De redirects van fase 9 (allemaal gated)

| OLD URL | NEW URL | Type | Gate |
|---|---|---|---|
| `/wat-is-omega-3` | `/supplementen/omega-3` | 301 | pas als GSC ≈ 0 impressies over 90 dagen |
| `/waar-let-je-op-bij-omega-3` | `/supplementen/omega-3` | 301 | idem |
| `/gidsen/{thema}` **of** `/gids/{thema}` | de winnende variant | 301 | GSC-vergelijking per thema; de kant met impressies wint |

`/supplement-kiezen-waar-op-letten` **blijft** — die heeft een eigen, generiek onderwerp
(supplementkeuze in het algemeen) en concurreert niet met een stofgids.

---

## 20. Cursor-codeerplan per fase

### Afwijkingen van jouw fasering, en waarom

1. **Analytics is geen fase 10.** CLAUDE.md eist meting in dezelfde wijziging als de CTA.
   Elke fase draagt daarom zijn eigen meetpunt. Ik heb "FASE 10 — ANALYTICS" opgeheven in de fases.
2. **Testing is geen fase 11.** Fase 0 legt de invarianten vast *voordat* er iets verandert;
   daarna faalt elke regressie meteen. Testen achteraf is hier waardeloos.
3. **SEO-reparatie schuift naar voren (fase 2).** Acht onvindbare gidspagina's repareren is een
   halve dag werk met de hoogste verwachte opbrengst van het hele plan. Dat hoort niet op plek 8.
4. **"NUTRITION GRAPH" splitst.** De graafdimensie zit in fase 1; de publieke nutriëntpagina's
   zijn fase 5. Anders zit de belangrijkste kans achter vijf andere fases.

---

### FASE 0 — Invarianten vastleggen (P0 · ~1 dag · geen zichtbare wijziging)

**Doel** — de huidige stand machinaal controleerbaar maken, zodat geen enkele latere fase iets sloopt.

**Onderzoeken**
`src/app/sitemap.ts` · `src/data/__tests__/insight-metadata.test.ts` · `src/data/__tests__/magnesium-cluster-links.test.ts` · `src/app/__tests__/sitemap.test.ts`

**Nieuw**
- `src/lib/content-graph/node.ts` — `GraphNode` + `allGraphNodes()`: één union over blog, kennisbank, supplementgids, vergelijking, pillar, profiel, gids
- `src/lib/content-graph/edges.ts` — `graphEdges()`: verzamelt alle interne links uit data (markdown in `tekst`/`inleiding`/`items`/`callouts`, alle `href`-velden, `gerelateerdeSluggen`, `relatedSlugs`, `relatedComparisons`, `blogLinks`)
- `src/lib/content-graph/__tests__/edges.test.ts`
- `src/app/__tests__/route-coverage.test.ts`

**Tests (acceptatiecriteria)**
- [ ] Elke interne link uit `graphEdges()` resolvet naar een bestaande route of een bestaand redirect-source
- [ ] Elke indexeerbare route komt voor in `sitemap()`, of staat op een expliciete `SITEMAP_EXCLUDED`-lijst mét reden
- [ ] Geen URL staat tegelijk in `sitemap()` en in `robots.disallow`
- [ ] Snapshot: exact 9 weespagina's, 0 dode links (de snapshot is het startpunt, niet de norm)

**Risico** — laag. Verwacht: de test faalt meteen op S1 en S2. Dat is de bedoeling; fase 2 repareert.

---

### FASE 1 — Graafdimensie toevoegen (P0 · ~2 dagen)

**Doel** — `nutrients`, `problem` en de afgeleide `check` in het bestaande overlay-model.

**Wijzigen**
- `src/types/insight.ts` — `ContentMetadata` uitbreiden (zie §6.4)
- `src/data/insight-metadata.ts` — `nutrients` invullen voor de ~60 items die een stof dragen
- `src/data/__tests__/insight-metadata.test.ts` — validatie op `nutrients ⊆ NUTRIENT_IDS`

**Nieuw**
- `src/data/content-graph/checks.ts` — `CONTENT_CHECKS`, 5 entries met `id`, `href`, `label`, `duurLabel`, `pillarId`.
  **Naamcheck vooraf:** `CheckId` en `CHECKS` bestaan al met een andere betekenis (dashboard-check-in-slots). Gebruik `ContentCheckId` / `CONTENT_CHECKS`.
- `src/data/content-graph/problems.ts` — afgeleid van `DeficiencySignals` + `ProfileLabel`, niet nieuw bedacht
- `src/lib/content-graph/resolve-check.ts` + test

**Databasewijzigingen** — geen.

**SEO-impact** — geen (nog niets gerenderd). **UX-impact** — geen. **Performance** — geen.

**Acceptatiecriteria**
- [ ] `npx tsc --noEmit` groen
- [ ] Elk item met `relatedSupplementId` in {omega-3, magnesium-glycinaat, zink, vitamine-d3, eiwitpoeder} heeft ook `nutrients`
- [ ] `resolveCheck()` geeft voor alle 115 items een `ContentCheckId`; snapshot-test op de verdeling
- [ ] Elke `CONTENT_CHECKS`-entry wijst naar een bestaande route

**Risico** — het invullen van `nutrients` op 60 items is redactioneel werk, geen techniek.
Mitigatie: begin met de vijf clusters die al een `relatedSupplementId` dragen — dat is ~80% automatisch afleidbaar.

---

### FASE 2 — SEO-reparatie (P0 · ~0,5 dag · hoogste opbrengst/kosten-ratio)

**Doel** — repareer wat aantoonbaar kapot is.

**Status: uitgevoerd op 16 september 2026** — commit op `claude/perfectsupplement-ecosystem-audit-p20dfl`.
Resultaat: **184 → 202 URL's** (+19 toegevoegd, −1 verwijderd), 17 verschillende `lastModified`-datums
in plaats van één gedeelde constante, 9 sitemap-tests groen, volledige klaar-check groen
(`tsc` 0 · 300 testbestanden / 2971 tests · `eslint --max-warnings 0`).

**Gewijzigd** — `src/app/sitemap.ts` (herstructureerd naar `SITEMAP_SECTIONS` + `SITEMAP_EXCLUDED`),
`src/app/__tests__/sitemap.test.ts`. `robots.ts` bleek geen wijziging nodig te hebben: het conflict
zat aan de sitemap-kant (`/rapport`).

**Concreet**
1. `/supplementen/{slug}` toevoegen (8 pagina's) — priority 0.8
2. `/rapport` verwijderen (staat in `robots.disallow`)
3. `/profiel`, `/faqs`, `/onderbouwing`, `/onderbouwing/voeding`, `/hoe-werkt-dashboard` toevoegen.
   **Niet** `/supplement-kiezen-waar-op-letten`, `/wat-is-omega-3` en `/waar-let-je-op-bij-omega-3`:
   die dragen een eigen `pad` in `cornerstone-supplementen.ts` en komen al uit de blog-sectie.
   Ze alsnog toevoegen gaf een dubbele URL.
4. `/gidsen/{slug}` toevoegen (7) — **maar pas ná de gids-beslissing in fase 9**; tot die tijd op de `SITEMAP_EXCLUDED`-lijst met reden `"duplicate-intent-pending-decision"`
5. `lastModified` per item uit echte data: `laatstBijgewerktOp ?? gepubliceerdOp` voor blog, `laatstBijgewerktOp` voor kennisbank, `lastUpdated` voor vergelijkingen (bestaat al)
6. Juridische pagina's toevoegen op priority 0.3 (E-E-A-T-signaal)

**SEO-impact** — **de grootste enkele wijziging in dit plan.** Acht educatieve pagina's die vandaag
alleen via interne links vindbaar zijn, worden expliciet aangeboden.

**Acceptatiecriteria**
- [ ] `sitemap()` bevat alle 8 `/supplementen/*`-paden
- [ ] Geen sitemap-URL staat in `robots.disallow`
- [ ] `lastModified` is voor geen enkel item meer de gedeelde constante
- [ ] Fase-0-routecoverage-test groen
- [ ] Meetpunt: GSC "Pagina's" — nulmeting vastleggen op de dag van deploy

---

### FASE 3 — Vervolgstap-resolver + component (P0 · ~2 dagen)

**Doel** — één contextuele vervolgstap per pagina, in plaats van vier gestapelde CTA's.

**Onderzoeken** — `BlogArticlePage.tsx` (regels 209–286) · `BlogIntakeCTA` · `BlogSupplementCTA` · `BlogCornerstoneLink` · `BlogSupplementenHubLink` · `CheckLensBanner` · `feature-flags.ts`

**Nieuw**
- `src/lib/content-graph/next-step.ts` — `resolveNextStep(node): NextStep`
- `src/components/content/NextStepBlock.tsx` — server component
- tests voor beide

**Wijzigen**
- `BlogArticlePage.tsx` — achter flag `contentNextStep`: `<NextStepBlock>` in plaats van de gestapelde blokken
- `src/lib/events.ts` + `intake-events-client.ts` + `api/intake/events/route.ts` — `content.next_step_shown` / `content.next_step_clicked`

**UX-impact** — de grootste zichtbare wijziging. Van vier keuzes naar één duidelijke, met de rest
als secundaire regel. Verwacht: hogere doorklik, lagere bounce. **Meet dit voordat je het overal uitrolt.**

**Acceptatiecriteria**
- [ ] `resolveNextStep()` geeft voor elk van de 115 knopen een primaire stap
- [ ] **Geen enkel contentknooppunt heeft `/beste/` als primaire stap** (invariant-test, §7.2)
- [ ] Elke `NextStep.primary.href` resolvet naar een bestaande route
- [ ] `NextStepBlock` rendert exact één primaire CTA
- [ ] Flag `contentNextStep=false` levert byte-identieke HTML aan vandaag
- [ ] Meetpunt: `content.next_step_shown` / `content.next_step_clicked` — hier lees je af of content mensen verder brengt.

---

### FASE 4 — Artikel → check (P0 · ~1 dag)

**Doel** — 0/78 → alle relevante stukken bieden de juiste check.

**Wijzigen** — `NextStepBlock` copy per `ContentCheckId`; `SupplementPage.tsx` en `/beste/[supplement]/page.tsx` krijgen hetzelfde blok (secundair, onder de vergelijking); pillars krijgen het.

**Copy per check** (volgt `docs/core/WRITING_VOICE.md` — begrip → urgentie → actie):

| ContentCheckId | Aanleiding | Primaire regel |
|---|---|---|
| `voeding` | stuk draagt een nutriënt | "Kijk in één minuut of je dit uit je eten haalt" |
| `slaap` | theme sleep, geen nutriënt | "Meet waar je nacht nu staat" |
| `stress` | theme stress | "Kijk hoe je spanning zich opbouwt" |
| `beweging` | theme movement | "Meet je beweegpatroon in een minuut" |
| `leefstijl` | rest | "Zie in drie minuten waar je staat op zes domeinen" |

**Acceptatiecriteria**
- [ ] Elk contentitem met `nutrients ≠ []` biedt `/intake/voeding` als primaire of secundaire stap
- [ ] Geen enkel item biedt twee checks als gelijkwaardige primaire CTA
- [ ] Elke `CONTENT_CHECKS`-entry wordt door minstens één contentitem aangeboden (anders: CRITICAL-bevinding)
- [ ] Meetpunt: `content.next_step_clicked{stepKind:"check"}` per `target` — hier lees je af welke check waar werkt.

---

### FASE 5 — Nutriëntpagina's (P1 · ~4 dagen · de grootste kans)

**Doel** — het ontbrekende scharnier tussen artikel, voeding, check en supplement.

**Nieuw**
- `src/app/voedingsstoffen/page.tsx` — hub, 5 stoffen
- `src/app/voedingsstoffen/[nutrient]/page.tsx` — `generateStaticParams` over `NUTRIENT_IDS`
- `src/components/content/NutrientSourcesTable.tsx`
- `src/data/content-graph/nutrient-content.ts` — per stof: pillar, artikelen (afgeleid uit `CONTENT_METADATA.nutrients`), kennisbanktermen, vergelijking (bestaat al via `comparisonPath`), gids
- `src/data/nutrition/nutrient-pages.ts` — redactionele copy per stof: H1, intro, "waarom na 40", FAQ

**Hergebruiken (niet herbouwen)**
`FOOD_SOURCES` · `nutrientReferences` · `nutrientRoute()` · `nutrition-spread.ts` (spreidingsbanden) · `nutrition-nutrient-index.ts` · `approved-claims.ts` · `NUTRIENT_GROEP` uit `nutrient-rail.ts`

**Paginastructuur** (dezelfde voor alle 5)
```
H1            Magnesium: wat het doet en waar het in zit
Kernpunten    3–4 regels, antwoord-eerst (AI-search)
H2            Wat magnesium doet          ← alleen EFSA-geautoriseerde claims
H2            Waar magnesium in zit       ← NutrientSourcesTable, USDA-geverifieerde rijen eerst
H2            Hoeveel je nodig hebt       ← referenceLabel + thresholdKind, eerlijk over "proxy"
H2            Wanneer voeding niet genoeg is  ← nutrientRoute + de opname-nuance (fytaat)
              → CTA: voedingscheck                         ★ de primaire vervolgstap
H2            Wanneer een supplement logisch kan zijn      ← gegate tekst, geen productclaim
              → secundair: /supplementen/magnesium en /beste/magnesium
H2            Veelgestelde vragen         ← FAQPage-schema
H2            Meer lezen                  ← RelatedContentRail: artikelen met deze nutriënt
Bronnen       ReferentieItem + NEVO/USDA-citatie
```

**De harde grenzen** (letterlijk uit `nutrient-routes.ts` en `nutrient-rail.ts`, niet onderhandelbaar)
- Geen milligram-som, geen dagtotaal, geen percentage van een ADH
- De `verified`-kolom is zichtbaar, niet verstopt
- De opname-nuance (fytaat bij magnesium en zink) staat naast het gehalte, niet eronder
- Sorteren op de **onderkant** van de spreidingsband — het enige getal dat we durven claimen

**Structured data** — `Article` + `FAQPage` + `BreadcrumbList` + `ItemList` (voedingsbronnen).
**Geen** `NutritionInformation` (dat hoort bij recepten en zou hier een dagtotaal suggereren).
**Geen** `MedicalWebPage` (§9.3).

**SEO-impact** — 6 nieuwe URL's op long-tail met echte zoekvraag ("waar zit magnesium in",
"hoeveel omega-3 per dag", "eiwitrijke voeding"). Tegelijk het ontbrekende cluster onder
`/voeding-na-40`.

**Performance** — statisch. `FOOD_SOURCES` filteren gebeurt tijdens de build.

**Risico** — **claimrisico is hier het hoogst van het hele plan.**
Mitigatie: elke uitspraak uit `approved-claims.ts` of met bron; `KOAG-COMPLIANCE-AUDIT.md`
afvinken vóór deploy; medische disclaimer verplicht.

**Acceptatiecriteria**
- [ ] 5 nutriëntpagina's + hub, statisch gegenereerd, in de sitemap
- [ ] Geen enkele pagina toont een opgeteld mg-getal of een ADH-percentage (test op de gerenderde tekst)
- [ ] Elke pagina toont minstens 8 voedingsbronnen, USDA-geverifieerde eerst
- [ ] Elke pagina linkt naar: de voedingscheck (primair), ≥ 3 artikelen, de supplementgids, de pillar
- [ ] Elke claim herleidbaar naar `approved-claims.ts` of een `ReferentieItem`
- [ ] Meetpunt: `content.next_step_clicked{stepKind:"check", from:"nutrient"}` + hergebruikt `nutrition.schap_bron_clicked` — hier lees je af of de stofpagina naar de check leidt en welke bronnen mensen kiezen.

---

### FASE 6 — Automatische interne linking (P1 · ~2 dagen)

**Doel** — weespagina's structureel onmogelijk maken.

**Nieuw** — `src/lib/content-graph/related-content.ts` + `src/components/content/RelatedContentRail.tsx`

**Algoritme**
```
score(a, b) = 3·(zelfde nutrient) + 2·(zelfde theme) + 2·(zelfde problem)
            + 1·(zelfde relatedSupplementId) + 1·(zelfde planPhase)
drempel: score >= 4    (twee dimensies minimaal — zie §10.2 regel 4)
sorteer: score desc, dan minst-gelinkt eerst   ← dit is wat wezen opheft
limiet: 4
handmatige `gerelateerdeSluggen` komen altijd eerst en tellen mee in de limiet
```

De tiebreak **"minst-gelinkt eerst"** is het mechanisme dat nieuwe artikelen automatisch inkomende
links geeft. Zonder die regel blijven de populaire artikelen elkaar linken.

**Acceptatiecriteria**
- [ ] 0 weespagina's — als test, niet als rapport
- [ ] Geen pagina toont meer dan 6 automatisch gegenereerde links
- [ ] Ankertekst komt van de doelpagina
- [ ] Handmatige `gerelateerdeSluggen` blijven leidend
- [ ] Meetpunt: `content.related_clicked{from,to,relation}`

---

### FASE 7 — Structured data harmoniseren (P1 · ~1,5 dag)

**Doel** — één `@graph` per pagina, entiteiten met `@id`, breadcrumbs overal.

**Wijzigen**
- `src/lib/seo/structuredData.ts` — `buildPageGraph(nodes)` die losse objecten samenvoegt tot één `@graph` met `@id`-referenties; `buildAboutRef(entity)` voor `about`/`mentions`
- Pillars, `/gids/*`, `/gidsen/*`, `/profiel/*`, `/inzichten` — `Breadcrumbs`-component toevoegen (bestaat al)
- `/supplementen/[supplement]` — `Article`-schema toevoegen (heeft nu alleen Breadcrumb + FAQ)
- Inline JSON-LD op pillars vervangen door de helpers

**De regel die je zelf stelde en die ik onderschrijf** — schema beschrijft alleen wat zichtbaar is.
Concrete consequentie: de 15 gegate kennisbanktermen mogen in `DefinedTerm` alleen `shortDefinition`
dragen (wat ze doen), nooit `howItWorks`/`whyItMatters` (wat crawlers niet zien).

**Acceptatiecriteria**
- [ ] Elke indexeerbare pagina heeft `BreadcrumbList`
- [ ] Elke pagina levert exact één `<script type="application/ld+json">` met een `@graph`
- [ ] Nutriëntpagina's dragen een stabiele `@id`; artikelen met die nutriënt verwijzen er via `about` naar
- [ ] Geen `MedicalWebPage`, geen `Review` zonder echte review, geen `aggregateRating` zonder echte ratings
- [ ] Test: geen schema-veld bevat tekst die niet in de gerenderde pagina voorkomt

---

### FASE 8 — Contentgezondheid in admin (P1 · ~2 dagen)

**Nieuw** — `src/lib/content-graph/health.ts` · `src/components/admin/ContentHealthPanel.tsx` · optioneel de migratie uit §12.2

**Wijzigen** — `src/app/admin/site/page.tsx` (tab "Content")

**Acceptatiecriteria**
- [ ] `contentHealth()` levert `Finding[]` met `severity`, `nodeId`, `message`, `fixHint`
- [ ] Dezelfde functie draait in vitest; CRITICAL-bevindingen laten de test falen
- [ ] Admin toont signalen gesorteerd op ernst + de per-item-inspecteur
- [ ] Geen extra Supabase-query op de publieke laag
- [ ] `docs/cursors/spinnenweb-link-audit.md` en `seo-structured-data-audit.md` bijwerken: verwijzen naar de functie in plaats van handmatige methodiek

---

### FASE 9 — Cannibalisatie opruimen (P2 · gated op Search Console)

**Doel** — één canonieke URL per zoekintentie.

| Actie | Gate | Risico |
|---|---|---|
| Magnesium-H1's differentiëren: `/supplementen/magnesium` = "welke vorm", `/beste/magnesium` = "welk product" | geen — copy-only | laag |
| `/wat-is-omega-3` + `/waar-let-je-op-bij-omega-3` → 301 `/supplementen/omega-3` | GSC ≈ 0 impressies over 90 dagen | **middel — eerst meten** |
| Gids-beslissing: `/gids/{thema}` vs `/gidsen/{thema}` | GSC-vergelijking per thema | **middel** |
| `/gidsen/{slug}` in sitemap of canonical → `/gids/{slug}` | volgt uit de beslissing | — |

**Mijn aanbeveling voor de gids-beslissing, als de GSC-data geen duidelijke winnaar toont:**
maak `/gidsen/{slug}` canoniek. Die pagina heeft longform-content, `benefits`, `recognition`,
`verdieping`-links en `pullquote` — inhoudelijk een echte pagina. `/gids/{thema}` is een
opt-in-formulier. **Uitzondering: `/gids/slaap`** heeft een eigen slaapanalyse-tool en blijft
zelfstandig. Geef de overige `/gids/{thema}` een canonical naar `/gidsen/{thema}` in plaats van
een 301 — dan blijft de opt-in-flow intact en verdwijnt de dubbele indexering.

**Acceptatiecriteria**
- [ ] Nulmeting GSC vastgelegd vóór elke redirect
- [ ] Elke redirect in `next.config.ts` met `permanent: true`
- [ ] `docs/core/CONTENT_MAP.md` bijgewerkt
- [ ] 30 dagen na deploy: impressie-vergelijking per betrokken URL

---

### FASE 10 — Performance (P2 · ~1 dag)

- `/supplementen`: `force-dynamic` weg; `buildHubPersonalization` naar een client component die `/api/account/status` bevraagt na hydratie
- `/kennisbank/[slug]`: `canAccessVerdieping()` uit de server-page; de gate wordt een client component
- `relatedContent()` memoïseren

**Acceptatiecriteria**
- [ ] Geen publieke route leest `cookies()` in een server component
- [ ] `/supplementen` en alle 37 kennisbankpagina's statisch gegenereerd
- [ ] Personalisatie werkt nog (test met en zonder cookie)
- [ ] LCP op `/supplementen` gemeten vóór en ná

---

### FASE 11 — Rollout

| Week | Fases | Deploy |
|---|---|---|
| 1 | 0, 1, 2 | ja — fase 2 is de eerste zichtbare SEO-winst |
| 2 | 3, 4 (flag aan op 10 artikelen) | ja, beperkt |
| 3 | meten; flag uitrollen naar alle content | ja |
| 4–5 | 5 (nutriëntpagina's) | ja |
| 6 | 6, 7 | ja |
| 7 | 8 | ja |
| 8+ | 9, 10 | gated |

**Rollback per fase:** fases 3–6 zitten achter feature-flags. Fase 2 is één bestand. Fase 5 is
additief (nieuwe URL's verwijderen kan, al kost het de nieuwe rankings). Fase 9 is de enige met
een echte rollbackprijs — daarom gated.

---

## 21. Testplan

| Niveau | Wat | Waar |
|---|---|---|
| Invariant | dode links, sitemapdekking, robots-conflict, weespagina's | `src/lib/content-graph/__tests__/` |
| Invariant | geen `/beste/` als primaire vervolgstap | `next-step.test.ts` |
| Invariant | elke check wordt vanuit content aangeboden | `resolve-check.test.ts` |
| Invariant | geen mg-som of ADH-% op nutriëntpagina's | render-test met testing-library |
| Unit | `resolveCheck`, `resolveNextStep`, `relatedContent`, `contentHealth` | per module |
| Component | `NextStepBlock` rendert exact één primaire CTA | testing-library |
| Data | `nutrients ⊆ NUTRIENT_IDS`, `problem ∈ PROBLEMS` | uitbreiding `insight-metadata.test.ts` |
| Schema | geen schema-veld zonder zichtbare tegenhanger | `structuredData.test.ts` |
| Regressie | flag uit = identieke HTML | snapshot |

**Klaar-check per fase** (CLAUDE.md): `grep -rn "console.log" src/` + `npx tsc --noEmit` + `vitest` + `eslint --max-warnings 0`. Alles groen → committen. Nooit pushen.

---

## 22. Prioriteiten

### P0 — absoluut noodzakelijk
- **FASE 2** — sitemapreparatie. Halve dag, grootste opbrengst. Doe dit deze week.
- **FASE 0** — invarianten. Zonder dit verslechtert alles wat je hierna bouwt weer stilletjes.
- **FASE 1** — nutriëntdimensie in `CONTENT_METADATA`. Alles daarna hangt eraan.
- **FASE 3 + 4** — vervolgstap-resolver en artikel → check. Dit dicht de 0/78.

### P1 — zeer belangrijk
- **FASE 5** — nutriëntpagina's. De grootste kans, maar pas nadat 0–4 staan.
- **FASE 6** — automatische linking + weesreparatie
- **FASE 7** — structured data harmoniseren
- **FASE 8** — contentgezondheid in admin

### P2 — later
- **FASE 9** — cannibalisatie (gated op GSC)
- **FASE 10** — performance
- Zink-cluster vullen of `/beste/zink` accepteren als low-priority
- `/voeding-na-40` een echte categorie geven in `BlogCategorie`

### P3 — toekomst
- Voedingsmiddelpagina's voor de ~30 sterkste USDA-geverifieerde bronnen (alleen als fase 5 impressies oplevert)
- Vergelijkingen tussen voedingsmiddelen ("amandelen vs. pompoenpitten")
- Contentgezondheid-trendlijn (de tabel uit §12.2)
- Derde artikelmodel (`blog-posts.ts`) opheffen door de 3 legacy-pagina's te migreren naar `BlogArtikel`

---

## 23. DO NOT BUILD YET

Interessant, maar nu expliciet **niet** bouwen:

1. **371 voedingsmiddelpagina's.** Doorway-page-risico, dunne content, 279 van de 371 hebben nog
   geen gehalte (`bron: null`). Bouw 5 nutriëntpagina's, meet, en beslis daarna.
2. **De contentgraaf in Supabase.** §12.1. De kosten zijn reëel, de baten hypothetisch.
3. **Een tweede recommendation engine voor content.** `recommendation-engine.ts` bestaat; content-
   aanbevelingen zijn een score-functie over de graaf, geen engine.
4. **`MedicalWebPage`-schema.** §9.3 — je kunt de vereisten niet waarmaken en je positionering
   verzet zich ertegen.
5. **Een zoekfunctie over de hele site.** `/inzichten` heeft filters, `/supplementen` heeft zoeken.
   Een globale zoekbalk is een groot project met onduidelijke opbrengst bij 180 pagina's.
6. **Gepersonaliseerde contentvolgorde voor anonieme bezoekers.** Dat maakt pagina's dynamisch
   en breekt de statische architectuur. Het `?from=intake`-patroon is het juiste compromis.
7. **`/leefstijl/{domein}`-aliassen** uit `IA_ECOSYSTEEM.md` §6. Acht extra URL's die canonical
   naar bestaande pagina's wijzen, puur voor interne netheid. Dat is SEO-ruis zonder opbrengst.
8. **Een topic-taxonomie los van de 6 domeinen.** Die domeinen zijn de single source of truth
   (`IA_ECOSYSTEEM.md` §1 noemt er zes; de code kent er zeven, waarvan `verbinding` via
   `VERBORGEN_DOMEINEN` uit de interface is gehaald — werk dat document bij in fase 1). Een tweede as introduceren is exact de fout die dat document corrigeerde.
9. **De `/blog/[categorie]`-collision-route ontvlechten.** Het werkt, het is getest, en ontvlechten
   kost URL-wijzigingen. Pas aanpakken als er ooit een artikel-slug botst met een categorie-id —
   en leg dát vast als test in fase 0.
10. **Automatische ankertekst-generatie uit paginatitels.** Levert onnatuurlijke links.
    Eén handmatig `linkLabel` per entiteit is beter en is 20 regels data.

---

## 24. De vijf beslissingen die ik van jou nodig heb

1. **Graaf in code of in Supabase?** Mijn advies: code. Dit bepaalt fase 1 volledig.
2. **Nutriëntpagina's: gaan we daarheen?** Mijn advies: ja, 5 pagina's, na fase 4.
   URL: `/voedingsstoffen/[nutrient]` — Nederlands, beschrijvend, geen conflict met bestaande routes.
3. **Gids-beslissing** (`/gids` vs `/gidsen`): ik heb je Search Console-data nodig per thema.
   Tot die tijd blijft `/gidsen/{slug}` uit de sitemap.
4. **Omega-3 root-URL's**: bevestig 0 impressies over 90 dagen, dan 301. (Dit is taak A5 uit je 7-dagenplan.)
5. **Mag de vervolgstap-wijziging (fase 3) de huidige CTA-stapel vervangen?** Het is de grootste
   zichtbare UX-wijziging in dit plan. Achter een flag, dus terugdraaibaar — maar het raakt
   115 pagina's tegelijk.

---

## 25. Wat ik zou doen als ik één week had

1. **Fase 2** (halve dag) — sitemap. 8 onvindbare gidspagina's worden vindbaar.
2. **Fase 0** (1 dag) — invarianten. De vangrails.
3. **Fase 1** (2 dagen) — `nutrients` op 60 items.
4. **Fase 3+4, beperkt** (2 dagen) — vervolgstap-resolver, flag aan op de 10 magnesium-artikelen.
5. **Meten.** `content.next_step_clicked` op 10 artikelen, twee weken. Dan pas uitrollen.

Dat is 5,5 dag, het raakt geen enkele bestaande URL, en aan het eind weet je met data of de
vervolgstap-hypothese klopt vóór je aan de nutriëntpagina's begint.

---

## 26. Bronnen in deze audit

Alle cijfers komen uit statische analyse van de codebase op commit `ad93564` (15 sep 2026):
`src/data/blog/*` (78 artikelen), `src/data/kennisbank.ts` (37 termen),
`src/data/insight-metadata.ts` (115 overlay-entries), `src/data/nutrition/food-catalog.ts` (371 regels),
`src/data/nutrition/food-sources.ts` (119 rijen, 88 met `nutrientValue`),
`src/app/sitemap.ts`, `src/app/robots.ts`, `next.config.ts` (33 redirects), en een routediff
over alle 58 publieke `page.tsx`-bestanden.
