# Content-ecosysteem: van losse SEO-pagina's naar één verbonden route

> **Layer 2 — Systems.** Audit van de bestaande content-, voedings- en supplementlagen, het verschil tussen huidige en gewenste architectuur, en het Cursor-codeerplan dat dat gat dicht.
>
> Opgesteld september 2026. Alle bevindingen zijn geverifieerd tegen de code, niet tegen geheugen of tegen eerdere documenten. Waar een eerder besluit (`IA_ECOSYSTEEM.md`, `CONTENT_GAPS.md`) iets anders zegt, staat dat er expliciet bij.

---

## 1. Executive summary

**De kernbevinding is niet dat er iets ontbreekt. Het is dat het bestaat en niet is aangesloten.**

PerfectSupplement heeft drie volwaardige systemen gebouwd die elkaar nauwelijks raken:

1. **De publieke contentlaag** — 76 blogartikelen, 38 kennisbanktermen, 7 pillars, 8 supplementgidsen, 7 vergelijkingen, 25 productpagina's, 4 profielpagina's. Dicht onderling verbonden (gemiddeld 5–6 inkomende links per artikel), goed van metadata voorzien, statisch gerenderd.
2. **De meetlaag** — leefstijlcheck, voedingscheck, voedingsdagboek, ladders per domein, `nutrition-route-status.ts`, `supplement-gate.ts`, `recommendation-engine.ts`. Compleet, compliance-gehard, getest.
3. **De voedingsdatalaag** — `food-catalog.ts`, `food-sources.ts` (79 bronrijen), `food-taxonomy.ts`, `nutrient-routes.ts`, `nutrition-nutrient-index.ts` (omgekeerde index nutriënt → producten, met portie-band en opname-oordeel).

Laag 1 en laag 2 raken elkaar op precies één plek: een generieke CTA-knop. Laag 3 raakt laag 1 **helemaal niet** — de voedingsdatalaag heeft nul consumenten in `src/app/`.

De vier cijfers die dit hard maken:

| Meting | Uitkomst |
|---|---|
| Blogartikelen die naar de **voedingscheck** (`/intake/voeding`) linken | **0 van 76** |
| Blogartikelen die naar **géén enkele check** linken | **25 van 76** |
| Routes in `src/app/` die de voedingsdatalaag gebruiken | **0** |
| Echte weespagina's (nul inkomende links, ook niet via `gerelateerdeSluggen`) | **8** |

**Wat dit betekent voor de strategie.** De winst zit niet in nieuwe content en niet in een nieuwe database. Hij zit in een **resolverlaag**: één plek die per pagina beslist welke check, welk nutriënt, welk supplement en welke vervolgstap erbij horen — gevoed door data die al bestaat (`insight-metadata.ts` draagt per slug al `theme`, `gapSignal`, `planPhase`, `relatedSupplementId`) en bewaakt door poorten die al bestaan (`supplement-gate.ts`, `approved-claims.ts`).

**Wat ik expliciet afraad**, tegen de opdracht in (uitgewerkt in §13 en §26):

- **Geen contenttabellen in Supabase.** Geen `articles`, `content_topics`, `article_nutrients`. Dat is een tweede CMS, breekt statische generatie, en verliest de typecheck-garantie die vandaag build failures oplevert bij een verkeerde affiliate-slug. De graaf hoort in TypeScript, afgeleid uit bestaande data.
- **Geen URL-migratie.** Niet naar `/artikelen/`, niet naar `/voeding/`. De bestaande slugs dragen de SEO-waarde.
- **Geen samenvoeging van `/blog` en `/kennisbank` tot `/inzichten`.** Dat besluit staat in `IA_ECOSYSTEEM.md` §7, is nooit uitgevoerd, en de feiten sindsdien spreken ertegen — `/inzichten` is in augustus uit de top-nav gehaald en in september uit de footer. Zie §9.4.
- **Geen publieke milligram-tabellen** zolang `food-sources.ts` op `verified: false` staat. Dat is geen vertraging maar de enige houdbare lezing van de NEVO-licentie. Zie §7.3.

---

## 2. Huidige architectuur — wat er nu staat

### 2.1 Content-inventaris (geverifieerd)

| Type | Aantal | Bron | Route |
|---|---|---|---|
| Blogartikelen | 76 | `src/data/blog/*.ts` | `/blog/[slug]` (+ 5 met `pad`-override) |
| Kennisbanktermen | 38 | `src/data/kennisbank.ts` | `/kennisbank/[slug]` |
| Pillars | 7 | eigen `src/app/*/page.tsx` | `/slaap-verbeteren-na-40` etc. |
| Supplementgidsen | 8 | `src/data/supplement-guides/` | `/supplementen/[supplement]` |
| Vergelijkingen | 7 | `src/data/supplements/` | `/beste/[supplement]` |
| Productpagina's | 25 | `src/data/supplement-hub/score-inputs.ts` | `/product/[slug]` |
| Profielpagina's | 4 | `src/data/profiles` | `/profiel/[slug]` |
| Gezondheidsgidsen | 7 | `src/data/gids/` | `/gids/[thema]` + `/gidsen` |

Circa 180 indexeerbare URL's. Alle publieke routes hebben een canonical (de artikelpagina's op rootniveau via `buildArticlePageMetadata()` in `src/data/blog-posts.ts`, niet via `canonicalMetadata()` — dat is een tweede pad naar hetzelfde doel, geen gat).

### 2.2 Wat goed werkt

- **Data-in-TypeScript.** Content is getypeerd, versiebeheerd en build-time gevalideerd. De affiliate-slug-regel (`SupplementProduct` ↔ `ChoiceRoute` ↔ `AffiliateLink` moeten matchen, anders build failure) is een sterker garantiemechanisme dan enige CMS-validatie.
- **Statische generatie.** `generateStaticParams` op 9 dynamische routes. Geen client-side content-fetching.
- **Compliance is in de code afgedwongen, niet in een procedure.** `supplement-gate.ts` → `approvedClaims` → `isComparisonAllowed`. Melatonine is `forbidden` en kan daardoor niet per ongeluk in een aanbeveling terechtkomen. Dit is het sterkste onderdeel van de codebase en de reden dat de rest van dit plan eromheen gebouwd wordt in plaats van eroverheen.
- **De meetketen is compleet.** `intake-engine` → `domain_scores` → `nutrition-route-status` → `supplement-gate` → `/beste/*`, met `domain_events` als durable log en een HMAC-attributietoken dat nurture-klik aan affiliate-klik knoopt.
- **De voedingsdatalaag is inhoudelijk uitzonderlijk.** `nutrition-nutrient-index.ts` rangschikt bronnen op de *onderkant* van een spreidingsband omdat dat het enige getal is dat te verdedigen valt, en draagt een apart opname-oordeel omdat fytaat bij magnesium en zink meer bepaalt dan het gehalte. Dit is materiaal dat geen enkele NL-concurrent heeft.
- **`check-lens.ts`** vertaalt een afgeronde check naar één alinea "wat betekent deze pagina voor jou", met tone-logica en tests.

### 2.3 Wat technisch zwak is

| Bevinding | Bestand | Impact |
|---|---|---|
| `/supplementen` is `force-dynamic` | `src/app/supplementen/page.tsx:20` | De belangrijkste commerciële hub rendert per request. Oorzaak: `getIntakeSessionFromCookie()` + `hasNutritionLogForSession()` op paginaniveau. TTFB en crawlbudget lijden eronder. |
| `buildBreadcrumbSchema` op 4 routes | `beste/[supplement]`, `product/[slug]`, `ps-score`, `supplementen` | `SEO_RULES.md` eist breadcrumbs sitewide. Blog heeft de *visuele* breadcrumb (`BlogArticlePage.tsx`) zonder JSON-LD; kennisbank heeft `DefinedTerm` zonder breadcrumb; pillars hebben geen van beide. |
| Blog-`Article` JSON-LD is inline gebouwd | `BlogArticlePage.tsx:88-113` | Naast `buildArticleSchema()` in `structuredData.ts`. Twee implementaties van hetzelfde schema; ze zijn nu gelijk en gaan een keer uit elkaar lopen. |
| Geen `dateModified`-discipline op kennisbank | `src/data/kennisbank.ts` | `laatstBijgewerktOp` is optioneel; zonder waarde geen signaal van actualiteit in schema. |
| Geen linkgraaf-tooling | — | De audits in `docs/cursors/spinnenweb-link-audit.md` zijn *prompts voor een mens/agent*, geen script. Ze draaien niet in CI en vinden weespagina's dus pas als iemand eraan denkt. |

### 2.4 Waar dubbele systemen zitten

Drie, en geen ervan is dringend:

1. **Canonical-helpers.** `canonicalMetadata()` (`lib/seo/canonical.ts`) naast `buildArticlePageMetadata()` (`data/blog-posts.ts`). Beide correct; de tweede doet meer. Samenvoegen is optioneel opruimwerk, geen prioriteit.
2. **Article-schema.** Inline in `BlogArticlePage.tsx` naast `buildArticleSchema()`. Wél opruimen — zie fase 4.
3. **Drie ingangen naar supplementen.** `/supplementen` (hub, PS-Score), `/supplementen/[supplement]` (gids), `/beste/[supplement]` (vergelijking), plus `/product/[slug]`. `IA_ECOSYSTEEM.md` §7 noemt dit "ontdubbelen". **Ik ben het daar niet mee eens**: dit zijn vier verschillende zoekintenties (categorie-overzicht, stofkennis, keuzevergelijking, één product) en ze hebben elk een eigen SERP. Wat wél ontbreekt is dat de vier elkaar consistent in dezelfde volgorde noemen — dat is een linkprobleem, geen structuurprobleem.

---

## 3. Huidige SEO-situatie

### 3.1 Het interne linknetwerk, gemeten

Gemeten over alle `src/**/*.ts(x)`, met `gerelateerdeSluggen` meegeteld als echte link.

**Uitgaande links per blogartikel:**

| Doel | Artikelen die ernaar linken |
|---|---|
| `/beste/*` (vergelijking) | 66 / 76 (86%) |
| `/supplementen*` | 61 / 76 (79%) |
| `/kennisbank/*` | 60 / 76 (78%) |
| Pillar | 60 / 76 (78%) |
| `/intake` (leefstijlcheck) | 52 / 76 (68%) |
| `/profiel/*` | 10 / 76 (13%) |
| **`/intake/voeding` (voedingscheck)** | **0 / 76 (0%)** |

**Inkomende links, top 10:**

```
144  /intake            70  /beste/magnesium       33  /beste/vitamine-d
 78  /supplementen      46  /beste/omega-3-suppl.  30  /stress-verminderen-na-40
 40  /energie-na-40     35  /slaap-verbeteren-na-40
 26  /beste/creatine    25  /beste/ashwagandha
```

**Verdeling inkomende links per blogartikel:** 8 artikelen op 0, 2 op 1, 9 op 2, 10 op 3. De mediaan ligt rond 5. De kop van de verdeling is gezond; de staart is het probleem.

### 3.2 Weespagina's — de exacte lijst

**Blog, nul inkomende links:**

```
eiwit-en-whey-in-de-overgang          magnesium-in-de-overgang
is-whey-schadelijk                    slaapkwaliteit-testosteron-herstel
krachtverlies-eiwitbehoefte-na-40     vermoeidheid-bloedwaarden-checken-mannen
magnesium-herstel-mannen-40           vitamine-d-botgezondheid-overgang
```

**Blog, één inkomende link (fragiel):**

```
buikvet-cortisol-slaap-mannen   ← slaapkwaliteit-testosteron-herstel (zelf een wees)
creatine-voor-vrouwen-na-40     ← overgang-slaapproblemen-opvliegers
```

De eerste is het scherpste geval: een zwak verbonden artikel dat zijn enige inkomende link krijgt van een weespagina. Effectief een cluster van twee dat nergens aan hangt.

**Kennisbank, nul inkomende links:** `healthspan`, `sociale-verbinding`, `ps-score-model`, `leucinedrempel`.

Patroon: **de overgang-/vrouwen-cluster en de eiwit/whey-cluster zijn los aangelegd en nooit ingeweven.** Dat is geen toeval — het zijn de twee jongste contentgolven.

### 3.3 Waar artikelen naar de verkeerde pagina leiden

17 artikelen linken naar geen enkele pillar/cornerstone. Daarvan is de opvallendste groep de creatine-cluster (`creatine-dosering-en-laadfase`, `creatine-vormen-en-keurmerken`, `creatine-water-vasthouden-en-gewicht`, `creatine-en-brein-slaaptekort`, `creatine-bijwerkingen-nieren-haaruitval`) — vijf artikelen die rechtstreeks naar `/beste/creatine` gaan zonder de tussenstap `/supplementen/creatine`. `CONTENT_GAPS.md` noemt die regel expliciet ("nieuwe blogs verplicht eerst `/supplementen/*`") en de creatine-cluster houdt zich er niet aan.

Dat is meer dan een linkregel: het is precies de "voelt als affiliate-site"-val uit de opdracht. Vijf artikelen die naar een affiliate-pagina wijzen zonder de neutrale stofuitleg ertussen.

### 3.4 Wat SEO-technisch sterk is en niet aangeraakt moet worden

- Titel/description/canonical: dekkend op alle publieke routes.
- `Product` + `ItemList` op vergelijkingen, `DefinedTerm` op kennisbank, `FAQPage` waar FAQ's staan.
- Affiliate-hygiëne: `rel="nofollow sponsored"`, nooit in blogposts, altijd via de `/beste/*`-brug.
- Kannibalisatie-bewaking is bewust ingericht (`SEO_RULES.md`, beslisboom op de magnesium- en melatonine-paren).

---

## 4. De grootste gaps

Gerangschikt op verwachte opbrengst per eenheid werk.

### Gap 1 — De voedingscheck heeft geen enkele contentingang (P0)

`/intake/voeding` krijgt 19 interne links, allemaal uit componenten en libs — dus vanuit de app zelf, achter de check. **Nul uit contentdata.** De enige publieke pagina die ernaar linkt is `/voeding-na-40`.

Dat betekent: een bezoeker die via Google op "hoeveel magnesium per dag" of "eiwit na 40" binnenkomt, krijgt nooit de tool aangeboden die precies zijn vraag beantwoordt. Hij krijgt de generieke leefstijlcheck of een vergelijkingspagina.

**43 blogartikelen noemen een `NutrientId` in hun slug** (eiwit/whey, omega-3, magnesium, vitamine-d, zink). Niet alle 43 horen naar de voedingscheck te wijzen — `magnesium-in-combinatie-met-medicijnen` is een veiligheidsartikel, niet een voedingsartikel — maar naar schatting 30 à 35 behandelen de stof inhoudelijk genoeg. Dat is de directe doelgroep van de voedingscheck, en vandaag bereikt geen van hen hem.

### Gap 2 — De CTA is context-blind terwijl de context al vastligt (P0)

`BlogIntakeCTA` kent twee placements (`invite`, `closing`) en vier locaties, en kiest zijn copy uit twee vaste paren in `INTAKE_CTA`. Er is geen enkele afhankelijkheid van waar het artikel over gaat.

Tegelijk draagt `CONTENT_METADATA` in `src/data/insight-metadata.ts` per slug al:

```ts
{ theme: "nutrition", gapSignal: "omega3_deficiency", relatedSupplementId: "omega-3", planPhase: 1 }
```

De routeringsdata bestaat volledig. Hij wordt alleen gebruikt voor `InsightPhaseNote` en voor de herordening van de `/inzichten`-hub. **De CTA leest hem niet.**

### Gap 3 — De voedingsdatalaag heeft nul publieke oppervlakte (P1)

`nutrition-nutrient-index.ts` beantwoordt de vraag "welke producten dragen magnesium, en wat levert één portie" — met band, opname-oordeel en herkomst. Consumenten: `CategorieDetailPaneel.tsx` → `VoedingsstatusTabel.tsx`. Beide achter de check.

Het artikel `/blog/magnesium-uit-voeding` bestaat en beschrijft in proza wat deze index in data heeft.

Dit is de grootste onbenutte asset van het platform. Het is ook de gap met de hardste randvoorwaarde — zie §7.3.

### Gap 4 — `check-lens.ts` draait op 7 pagina's in plaats van 130 (P1)

Het "wat betekent deze pagina voor jou"-blok bestaat, is getest, en staat op `/gids/*` en `/profiel/*`. Niet op blog, kennisbank, `/beste/*` of `/supplementen/*` — de pagina's waar verreweg het meeste verkeer landt en waar een terugkerende bezoeker het vaakst aankomt.

### Gap 5 — 8 weespagina's en een losgeslagen creatine-cluster (P1)

Zie §3.2 en §3.3. Dit is handmatig datawerk, geen engineering — maar het moet één keer goed, en daarna moet een script voorkomen dat het terugkomt.

### Gap 6 — Geen content-health-signalering (P2)

De audits bestaan als prompts (`docs/cursors/spinnenweb-link-audit.md`, `seo-structured-data-audit.md`), draaien niet automatisch, en er is geen plek waar "deze pagina heeft 0 inkomende links" zichtbaar is. Het admin-dashboard (`/admin/site`) toont intake-data, geen contentgezondheid.

### Gap 7 — `/supplementen` is force-dynamic (P2)

Zie §2.3.

---

## 5. Gewenste ecosysteem-architectuur

### 5.1 Eén principe

> **Elke publieke pagina kan één vraag beantwoorden: "wat is mijn volgende logische stap?" — en dat antwoord is afgeleid, niet handmatig ingetikt.**

Dat betekent precies één nieuwe laag, en geen nieuwe opslag:

```
                 ┌──────────────────────────────────────────┐
                 │   BESTAANDE DATA (blijft waar hij staat)  │
                 │  blog/*  kennisbank.ts  supplement-*      │
                 │  insight-metadata.ts  nutrition/*         │
                 └────────────────┬─────────────────────────┘
                                  │ afgeleid, build-time
                 ┌────────────────▼─────────────────────────┐
                 │   src/lib/graph/   — DE NIEUWE LAAG       │
                 │                                           │
                 │  content-graph.ts   entiteiten + relaties │
                 │  resolve-next-step.ts   volgende stap     │
                 │  resolve-related.ts     interne links     │
                 │  content-health.ts      diagnose          │
                 └────────────────┬─────────────────────────┘
                                  │
        ┌─────────────────────────┼──────────────────────────┐
        ▼                         ▼                          ▼
   NextStepBlock            RelatedBlock              /admin/site
   (1 CTA, contextueel)     (interne links)           (health)
        │                         │
        └──────► bestaande poorten: supplement-gate.ts,
                 approved-claims.ts, comparison-availability.ts
```

**De drie harde eigenschappen van deze laag:**

1. **Puur afgeleid.** `content-graph.ts` leest bestaande data en bouwt een index. Hij is de enige plek met kennis van relaties, maar hij *bezit* geen data. Verwijder je een artikel, dan verdwijnt hij uit de graaf zonder migratie.
2. **Build-time.** Geen runtime queries, geen Supabase, geen netwerk. Een module-level index die Next.js tijdens `generateStaticParams`/render één keer opbouwt.
3. **Poort-doorlatend.** Elke supplement-suggestie die de graaf produceert, gaat door `isSupplementSuggestionAllowed()`. De graaf mag nooit een eigen mening over compliance hebben.

### 5.2 Wat er níét bij komt

- Geen nieuwe Supabase-tabellen voor content (§13).
- Geen tweede recommendation engine — `recommendation-engine.ts` blijft de enige die *aanbeveelt*. De graaf *routeert*.
- Geen tweede SEO-systeem — `lib/seo/structuredData.ts` blijft de enige schemabouwer.
- Geen nieuwe URL-ruimte in fase 0–7. Eén nieuwe route in fase 8, en die is gegate.

---

## 6. De content-graaf

### 6.1 Entiteiten — welke bestaan al, welke zijn nieuw

| Entiteit uit de opdracht | Bestaat al als | Oordeel |
|---|---|---|
| ARTICLE | `BlogArtikel`, `KennisbankTerm` | bestaat |
| TOPIC / SUBTOPIC | `BlogCategorie` (4), `KennisbankTheme` (5) | bestaat, maar twee taxonomieën naast elkaar |
| PROBLEM | `symptom_profile`, `recognition_lines` | bestaat in de meetlaag, niet in content |
| GOAL | `domain_goal`, `goal_phrase` | bestaat |
| LIFESTYLE FACTOR | ladders (`sleep/`, `stress/`, `movement/`) | bestaat |
| FOOD | `CatalogEntry` in `food-catalog.ts` | bestaat |
| NUTRIENT | `NutrientId` (5) in `intake-reference.ts` | bestaat |
| SUPPLEMENT | `SUPPLEMENT_CATALOG`, `SupplementData` | bestaat |
| SUPPLEMENT CATEGORY | `SupplementCategory` | bestaat |
| PRODUCT | `PRODUCT_SCORE_INPUTS` (25) | bestaat |
| CHECK | `/intake`, `/intake/voeding`, domein-check-ins | bestaat als route, **niet als entiteit** |
| USER PROFILE | `ProfileLabel`, `intake_sessions` | bestaat |
| RECOMMENDATION | `RankedRecommendation` | bestaat |
| ROUTE | `NutrientRoute`, `supplement-routes.ts` | bestaat |
| COMPARISON | `ComparisonPageData` | bestaat |
| FAQ | in `ComparisonPageData` / `SupplementData` | bestaat |
| SOURCE / EVIDENCE | `ReferentieItem`, `evidence_claims` | bestaat |
| **PILLAR/DOMEIN** | `PillarId`, `ThemeSlug`, `DomainKey`, `MeasuredPillarId` | **bestaat vier keer** |

**Twee conclusies.**

Ten eerste: van de 20 entiteiten uit de opdracht bestaan er 19. Er is geen entiteitenmodel nodig, er is een **index over bestaande entiteiten** nodig.

Ten tweede, en dit is de belangrijkste architectuurbevinding: **het domeinbegrip bestaat in vier incompatibele vormen.** `PillarId` (NL: `slaap`, `voeding`), `ThemeSlug` (EN: `sleep`, `nutrition`), `DomainKey` (nurture), `MeasuredPillarId` (subset van 4). Er zijn vertaaltabellen (`MEASURED_DOMAIN_TO_PILLAR`, `BLOG_CATEGORIE_TO_PIJLER`, `KENNISBANK_THEME_TO_PIJLER`, `INSIGHT_PIJLER_OVERRIDE` met 66 handmatige overrides).

`IA_ECOSYSTEEM.md` §1 doet hier al een aanbeveling voor ("introduceer één centrale `DOMAINS`-constante"). Die is nooit uitgevoerd. **Dit is fase 0 en het is de voorwaarde voor al het andere** — een graaf die vier domeinbegrippen moet verzoenen, wordt zelf de vijfde.

### 6.2 De relaties die we wél leggen

Niet alle relaties uit de opdracht zijn zinvol. Deze wel, met per relatie de bron:

| Relatie | Afleidbaar uit | Nieuw werk |
|---|---|---|
| ARTICLE → THEME | `CONTENT_METADATA[slug].theme` | nee |
| ARTICLE → NUTRIENT | **nieuw veld** `nutrients?: NutrientId[]` | ja, ~30 artikelen |
| ARTICLE → SUPPLEMENT | `CONTENT_METADATA[slug].relatedSupplementId` | nee |
| ARTICLE → GAPSIGNAL | `CONTENT_METADATA[slug].gapSignal` | nee |
| ARTICLE → CHECK | **afgeleid** uit theme + nutrients | ja, resolver |
| ARTICLE → ARTICLE | `gerelateerdeSluggen`, `relatedSlugs` | nee |
| ARTICLE → PILLAR | `cornerstoneLink`, `THEME_CONTENT_MAP` | nee |
| NUTRIENT → FOOD | `FOOD_SOURCES` + `nutrition-nutrient-index.ts` | nee |
| NUTRIENT → SUPPLEMENT | `approvedClaims[key]`, `SUPPLEMENT_CATALOG` | nee |
| NUTRIENT → ROUTE | `nutrient-routes.ts` | nee |
| SUPPLEMENT → COMPARISON | `comparisonPath` + `supplement-gate.ts` | nee |
| SUPPLEMENT → PRODUCT | `PRODUCT_SCORE_INPUTS` | nee |
| PILLAR → ARTICLE | omgekeerde index | ja, afleiding |
| NUTRIENT → ARTICLE | omgekeerde index | ja, afleiding |

**Eén nieuw dataveld in de hele operatie.** `nutrients?: NutrientId[]` op `ContentMetadata`. Dat is het enige wat de graaf niet kan afleiden, omdat "gaat dit artikel over magnesium" een redactionele beoordeling is en geen tekstmatch. (Tekstmatching afraden: `magnesium-in-combinatie-met-medicijnen` noemt magnesium maar is een veiligheidsartikel, geen voedingsartikel.)

### 6.3 Relaties die ik afraad

- **ARTICLE → FOOD direct.** Loopt altijd via NUTRIENT. Een artikel over magnesium linken aan "amandelen" zonder de nutriënt ertussen levert onnavolgbare links en een onderhoudslast per voedingsmiddel.
- **LIFESTYLE FACTOR → NUTRIENT.** Klinkt logisch ("slecht slapen kost magnesium") maar is fysiologisch niet hard genoeg om een link op te hangen. Precies het soort relatie waar `WRITING_VOICE.md` en `COMPLIANCE.md` tegen beschermen.
- **USER PROFILE → ROUTE in de publieke graaf.** De personalisatie hoort in het dashboard (`IA_ECOSYSTEEM.md` §1, bewust besluit). De publieke graaf mag hoogstens een *lens* tonen (`check-lens.ts`), geen route berekenen.

---

## 7. ARTIKEL → VOEDING → SUPPLEMENT → CHECK

### 7.1 De keten die er al is (achter de check)

```
intake → domain_scores + answers
  → estimateNutritionIntake()          [intake-reference.ts]
  → nutrientRouteStatus()              [nutrition-route-status.ts]
      covered | partial | gap | off_route | unmeasured
  → resolveNutritionGate()             [nutrition-ladder.ts]
  → isSupplementSuggestionAllowed()    [supplement-gate.ts]
  → /beste/[supplement]
```

Deze keten is compleet en compliance-hard. Hij vraagt een afgeronde check.

### 7.2 De keten die ontbreekt (vóór de check)

Voor de SEO-bezoeker is er niets tussen "artikel" en "vergelijking". De gewenste keten:

```
ARTIKEL (bv. /blog/hoeveel-magnesium-per-dag)
  │  CONTENT_METADATA: theme=sleep, nutrients=[magnesium],
  │                    relatedSupplementId=magnesium-glycinaat
  ▼
NutrientBridge — "waar zit het in je eten"
  │  uit nutrientRoute("magnesium").thresholdNl + bronnen
  │  GEEN mg-getallen (zie §7.3)
  ▼
NEXT STEP (contextueel, één CTA)
  │  nutrients.length > 0  →  Voedingscheck
  │  anders theme ∈ {sleep,stress,movement}  →  Leefstijlcheck
  │  anders  →  Leefstijlcheck
  ▼
CHECK → bestaande keten uit §7.1 → /beste/*
```

De brug is geen nieuwe pagina. Het is **één sectie in bestaande artikelpagina's**, die uit de route-data drie dingen haalt: de drempel in de eenheid die de check meet, de bronnen die daaraan bijdragen, en een eerlijk woord over hoe hard die drempel is (`thresholdKind: populatierichtlijn | vuistregel | proxy`).

### 7.3 De randvoorwaarde die niet onderhandelbaar is

`food-sources.ts` — alle 79 rijen staan op `verified: false`. De NEVO-licentie staat hergebruik toe "only unchanged and stating the source and version number"; `amount` is een eigen omrekening naar porties en dus geen brongegeven. De bestandskop legt dit zelf vast en trekt de strengste lezing.

**Daaruit volgt een harde regel voor elke publieke uiting:**

> Geen milligrammen, geen ADH-percentages, geen dagtotalen op een publieke pagina zolang `verified: false`. Wel: de drempel in porties/frequentie, de rangorde van bronnen, en het opname-voorbehoud.

Dat is geen beperking die de brug uitholt. "Twee keer vette vis per week, anders is aanvullen een reële overweging" is een sterkere zin dan "je haalt 210 mg" — en het is de zin die de check ook daadwerkelijk kan onderbouwen. `nutrient-routes.ts` is precies voor dit doel geschreven.

Wat dit blokkeert: publieke voedingsstofpagina's met tabellen (fase 8, gegate).

### 7.4 De beslislogica voor "welke check"

```ts
// src/lib/graph/resolve-next-step.ts — kern
export type NextStepKind = "nutrition_check" | "lifestyle_check" | "domain_checkin";

function resolveCheck(meta: ContentMetadata): NextStepKind {
  // 1. Voedingsstof genoemd? → voedingscheck. Meest specifiek wint.
  if (meta.nutrients?.length) return "nutrition_check";
  // 2. Thema dat de leefstijlcheck meet → leefstijlcheck.
  if (meta.theme && MEASURED_THEMES.has(meta.theme)) return "lifestyle_check";
  // 3. Rest → leefstijlcheck (de brede ingang).
  return "lifestyle_check";
}
```

**Waarom "meest specifiek wint" en niet "beide tonen":** `SEO_RULES.md` schrijft één primaire CTA per pagina voor, en `CONTENT_SYSTEM.md` waarschuwt voor de keuzeparadox. De gecombineerde route uit de opdracht (§5, "als beide relevant zijn → gecombineerde route") komt er wél, maar **ná** de check, niet ervoor: de voedingscheck kent al een doorstroom naar de leefstijlcheck. Twee checks naast elkaar aanbieden aan een koude bezoeker verlaagt de conversie op allebei.

---

## 8. User journeys

De vijf journeys uit de opdracht, met per journey het werkelijke breekpunt van vandaag.

### Journey A — Google → artikel → voedingscheck → supplementroute

```
/blog/hoeveel-magnesium-per-dag
  → NutrientBridge: "magnesium uit je eten"     ← ONTBREEKT
  → /intake/voeding                             ← ONTBREEKT (0/76 links)
  → route-status: gap
  → /supplementen/magnesium → /beste/magnesium
```

**Breekpunt: stap 2.** Dit is de belangrijkste journey van het hele plan en hij bestaat vandaag niet.

### Journey B — Google → supplementpagina → leefstijl → check → vergelijking

```
/supplementen/magnesium
  → PrePurchaseLadderCta (gate open/closed)     ← BESTAAT
  → /intake → /beste/magnesium                  ← BESTAAT
```

**Breekpunt: geen.** Deze journey werkt. Wat ontbreekt is de voedingsstap ertussen ("voordat je aanvult: waar zit het in je eten").

### Journey C — Google → voedingsmiddel → voedingsstof → onderwerp → check

**Breekpunt: de hele journey.** Er is geen publieke ingang op voedingsmiddel of voedingsstof. Dit is fase 8 en het is gegate op NEVO.

### Journey D — Google → leefstijlartikel → leefstijlcheck → voedingscheck → supplementroute

```
/blog/slaaphygiene-mannen-40-plus
  → géén check-CTA                              ← ONTBREEKT (staat in de 25)
  → /intake ...
```

**Breekpunt: stap 2.** 25 artikelen bieden geen check aan.

### Journey E — Direct → leefstijlcheck → voedingscheck → route → vergelijking

**Breekpunt: geen.** Dit is de best gebouwde journey van het platform.

### 8.1 Waar bezoekers nu uit de funnel vallen — en wat eraan te doen is

| Val | Omvang | Oplossing | Fase |
|---|---|---|---|
| Artikel zonder check-CTA | 25 artikelen | `NextStepBlock` overal | 1 |
| Artikel met de verkeerde check | ~30–35 voedingsartikelen | resolver op `nutrients` | 1 |
| Weespagina: geen inkomend verkeer, geen doorstroom | 8 + 2 | datafix + CI-gate | 2 |
| Terugkerende bezoeker zonder herkenning | alle 130 contentpagina's | `CheckLens` uitbreiden | 3 |
| Creatine-cluster springt gids over | 5 artikelen | tussenlink invoegen | 2 |

---

## 9. SEO-strategie

### 9.1 Wat we níét doen

**Geen nieuwe contentkalender in dit document.** `CATALOGUS_GAPS_VOEDING_LEEFSTIJL_SUPPLEMENTEN_2026-09.md` heeft die analyse drie weken geleden gedaan, met evidence-bar, SERP-scan en scoreformule. De conclusie daar — "bouw geen achtste `/beste/*`, het gat is de kwaliteit van de check die je hebt" — geldt onverkort en dit plan werkt hem uit in plaats van hem over te doen.

### 9.2 Topical authority: versterken wat er is

De clusterstructuur staat. Wat hem verzwakt is de staart van de linkverdeling, niet de kop. Concreet, in volgorde:

1. **8 weespagina's inweven** — elk minimaal 2 inkomende links uit semantisch verwante artikelen. De overgang-cluster (`magnesium-in-de-overgang`, `eiwit-en-whey-in-de-overgang`, `vitamine-d-botgezondheid-overgang`, `overgang-buikvet-gewichtstoename`) heeft een natuurlijke hub in `/overgang`; die pillar linkt er nu niet naartoe.
2. **De creatine-cluster over de gids laten lopen** — 5 artikelen, `/supplementen/creatine` invoegen vóór `/beste/creatine`.
3. **De nutriënt-as als tweede clusterlaag** — de 43 artikelen die over dezelfde `NutrientId` gaan, kunnen elkaar via de graaf vinden zonder handmatige `gerelateerdeSluggen`. Dit is de enige plek waar automatisch gegenereerde links verdedigbaar zijn, omdat de relatie een redactioneel gezet veld is en geen tekstmatch.

### 9.3 Intent-mapping per paginatype

| Intent | Landingspagina | Volgende stap | Meting |
|---|---|---|---|
| Informational — stof | `/kennisbank/*`, `/blog/*` | voedingscheck bij een `NutrientId`, anders leefstijlcheck | `content.next_step_clicked` |
| Informational — klacht | pillar, `/profiel/*` | leefstijlcheck | idem |
| Commercial investigation | `/supplementen/*` | ladder-gate → vergelijking | bestaand `comparison_ladder_cta_click` |
| Transactional | `/beste/*`, `/product/*` | affiliate | bestaand `affiliate.click` |

### 9.4 Standpunt over de `/inzichten`-feed

`IA_ECOSYSTEEM.md` §7 besluit om `/blog` en `/kennisbank` samen te voegen tot één `/inzichten`-feed met canonical vanaf de oude URL's. **Ik adviseer dat besluit terug te draaien.**

Drie redenen:

1. **De feiten sinds juni spreken ertegen.** `/inzichten` is 28 augustus uit de top-nav gehaald en 1 september uit de footer. Een hub die geen enkele navigatielink meer verdient, is geen kandidaat om 114 goed presterende URL's onder te hangen.
2. **Canonical van `/blog/x` naar `/inzichten/x` is geen gratis verhuizing.** Het is een URL-migratie van 114 pagina's met alle bijbehorende ranking-volatiliteit, voor een structuurwinst die geen gemeten probleem oplost.
3. **De twee merken hebben verschillende schema's en verschillende intent.** `DefinedTerm` op kennisbank tegen `Article` op blog is precies het signaal dat Google gebruikt om een definitie van een artikel te onderscheiden. Samenvoegen gooit dat weg.

**Wat `/inzichten` wel moet zijn:** het interne personalisatie-oppervlak. Het leest al `visitor-personalization` en herordent op `gapSignal`. Dat is waardevol voor terugkerende bezoekers en heeft geen SEO-rol nodig.

Dit is een afwijking van een vastgelegd besluit en hoort als zodanig in `IA_ECOSYSTEEM.md` te worden bijgewerkt, niet stilletjes genegeerd.

### 9.5 URL-architectuur

**Geen wijzigingen in fase 0–7. Nul redirects.**

De opdracht noemt `/artikelen/`, `/voeding/`, `/voedingsstoffen/`, `/leefstijl/`. Daar is geen aanleiding voor: de bestaande slugs zijn Nederlands, beschrijvend, en dragen de rankings.

De enige nieuwe URL-ruimte in het hele plan is `/voedingsstof/[slug]` (fase 8), en die:
- vervangt niets,
- vereist `verified: true` op de betrokken `food-sources`-rijen,
- krijgt minimaal 800 woorden eigen redactie per pagina (anders is het thin content op een tabel).

De alias `/leefstijl/{domein}` uit `IA_ECOSYSTEEM.md` §6: **niet bouwen.** Een tweede URL voor dezelfde pagina met canonical terug is netto negatief — het kost crawlbudget en levert alleen interne netheid op.

---

## 10. AI search / semantische strategie

### 10.1 Wat werkelijk helpt

AI-zoeksystemen halen uit een pagina wat ze aan feiten kunnen isoleren en attribueren. Drie dingen doen daar meer voor dan welke schema-uitbreiding ook, en alledrie bestaan al half:

1. **Expliciete drempels met hun status.** `nutrient-routes.ts` draagt `thresholdKind` (`populatierichtlijn` / `vuistregel` / `proxy`) en `sourceNl`. Een pagina die zegt "twee keer vette vis per week (Gezondheidsraad)" in plaats van "eet vaker vis" is precies wat een AI-antwoord kan citeren. Dit staat nu alleen achter de check.
2. **Claims met hun autorisatiestatus.** `approved-claims.ts` weet per stof of een claim EFSA-geautoriseerd is. Op `/beste/*` en `/supplementen/*` staat de claim; de *status* van de claim staat er niet altijd expliciet bij. "Magnesium draagt bij tot normale werking van het zenuwstelsel — EU-geautoriseerde claim" is sterker attribueerbaar dan dezelfde zin zonder bronvermelding.
3. **Vraag-antwoordparen met echte antwoorden.** De FAQ's bestaan. Ze horen op meer paginatypen — met name op de nutriëntbrug ("kan ik magnesium uit voeding halen?").

### 10.2 Structured data: wat erbij mag en wat niet

| Schema | Waar | Status |
|---|---|---|
| `BreadcrumbList` | **alle** publieke routes | uitbreiden — nu 4 routes |
| `Article` | blog, pillars | consolideren op `buildArticleSchema()` |
| `DefinedTerm` | kennisbank | staat, laten staan |
| `FAQPage` | waar zichtbare FAQ staat | staat |
| `Product` + `ItemList` | `/beste/*`, `/product/*` | staat |
| `ItemList` | nutriëntbrug (bronnenlijst) | **nieuw, fase 5** — alleen als de lijst zichtbaar is |
| `Organization` | sitewide, één keer | **nieuw, fase 4** — ontbreekt volledig |
| `MedicalWebPage` | — | **niet doen.** Vereist medische review-attributie die we niet leveren, en botst frontaal met "adviezen, geen diagnoses" |
| `Review` / `AggregateRating` | — | **niet doen.** We hebben geen gebruikersreviews; PS-Score is een eigen berekening en als `Review` markeren is een feitelijke onjuistheid |
| `Person` (auteur) | — | pas als er een genoemde auteur met profiel is. `REDACTIE_VERANTWOORDELIJKE_STANDARD` is nu een organisatie |

**De regel die boven alle schema's staat:** JSON-LD beschrijft wat zichtbaar op de pagina staat. Een `ItemList` met voedingsbronnen mag alleen als die bronnen ook gerenderd worden.

---

## 11. Interne-linkstrategie

### 11.1 Drie soorten links, drie regimes

| Soort | Wie bepaalt | Voorbeeld | Automatiseerbaar |
|---|---|---|---|
| **Redactioneel inline** | de schrijver | `[magnesiumvorm](/kennisbank/magnesiumvormen)` in de lopende tekst | **nee, nooit** |
| **Structureel** | het paginatype | cornerstone, gids-brug, breadcrumb | ja, bestaat al |
| **Afgeleid** | de graaf | "andere artikelen over magnesium", "waar zit het in" | ja, nieuw |

**Waarom inline links nooit automatisch mogen.** De ankertekst staat middenin een zin en moet grammaticaal en inhoudelijk kloppen. Een generator die "magnesium" overal naar `/kennisbank/magnesiumvormen` linkt, linkt het ook in `magnesium-in-combinatie-met-medicijnen` waar de context een waarschuwing is. Dat is precies de fout die de "Consumentenbond"-positionering ondermijnt.

### 11.2 De afgeleide linklaag

```ts
// src/lib/graph/resolve-related.ts
export type RelatedBlock = {
  kind: "nutrient" | "theme" | "supplement";
  heading: string;        // "Meer over magnesium"
  turbo: string;          // 1-2 zinnen, verplicht per CONTENT_SYSTEM.md
  items: { href: string; title: string; reason: string }[];
};
```

Regels:

- **Maximaal 6 afgeleide links per pagina**, bovenop de redactionele. Meer verdunt de PageRank-doorgifte en leest als een linkfarm.
- **Rangorde:** zelfde nutriënt > zelfde thema > zelfde supplement. Binnen elke groep: artikelen met de minste inkomende links eerst. Dat is de enige plek waar het systeem zichzelf repareert — zwakke pagina's krijgen automatisch meer interne autoriteit.
- **Nooit naar zichzelf, nooit dubbel** met een link die al redactioneel in de tekst staat.
- **Turbo-snippet verplicht** boven elk blok (`CONTENT_SYSTEM.md`).
- **Ankertekst = de paginatitel**, niet een gegenereerde zin. Geen keyword-variatie-generator.

### 11.3 Weespagina-preventie

Een script (`scripts/content-health.mjs`) dat de graaf bouwt en faalt op:

- een blogartikel of kennisbankterm met **0 inkomende links**;
- een `href` in `src/data/**` die naar een niet-bestaande route wijst.

Draait in de pre-push hook naast `tsc` en `vitest`. Dat is de enige manier waarop dit niet over zes maanden terugkomt.

---

## 12. Contextuele-CTA-strategie

### 12.1 Eén component, één resolver

```ts
// src/lib/graph/resolve-next-step.ts
export type NextStep = {
  kind: "nutrition_check" | "lifestyle_check" | "comparison" | "guide" | "pillar";
  href: string;
  headline: string;
  subline: string;
  eventName: DomainEventType;
  /** Waarom deze stap — voor debugging en voor het admin-dashboard. */
  reason: string;
};

export function resolveNextStep(ctx: NextStepContext): NextStep;
```

`NextStepContext` bevat: slug, `ContentMetadata`, paginatype, en optioneel de check-status uit de cookie. Geen `any`, geen Supabase, geen netwerk.

### 12.2 De beslistabel

| Situatie | Stap | Copy-richting |
|---|---|---|
| Artikel noemt een `NutrientId`, geen check gedaan | voedingscheck | "Haal jij dit uit je eten?" |
| Artikel over gemeten thema, geen check | leefstijlcheck | bestaande `INTAKE_CTA.blogHeadline` |
| Artikel zonder thema/nutriënt | leefstijlcheck | idem |
| Check gedaan, voedingsroute `gap` op dit nutriënt | gids → vergelijking | via `supplement-gate.ts` |
| Check gedaan, route `covered` | pillar / verdieping | **geen supplement-CTA** |
| Supplement `forbidden` of `on_hold` | gids, nooit vergelijking | via `isComparisonAllowed()` |

De laatste twee rijen zijn het verschil tussen een adviesplatform en een affiliate-site. Een bezoeker die zijn magnesium aantoonbaar uit voeding haalt, hoort géén vergelijkingslink te zien. Dat is de regel uit de opdracht (§14, "begrijpen → controleren → verbeteren → aanvullen") in code.

### 12.3 Hergebruik boven nieuwbouw

`BlogIntakeCTA`, `KennisbankIntakeCTA`, `ComparisonIntakeFallbackCta`, `HubSluitCta`, `MethodologyIntakeCta`, `InzichtenCheckCta` — zes componenten die hetzelfde doen met andere copy. De resolver vervangt hun *beslissing*, niet hun *vormgeving*: elk component blijft bestaan en krijgt zijn `headline`/`subline`/`href` uit `resolveNextStep()`.

Dat houdt de diff klein en de visuele regressie nul.

---

## 13. Databaseplan

### 13.1 Aanbeveling: geen contenttabellen in Supabase

De opdracht (§15) stelt `content_topics`, `articles`, `article_topics`, `article_nutrients`, `foods`, `nutrients`, `cta_rules`, `seo_entities` voor. **Ik raad alle acht af.** Vijf redenen, in volgorde van zwaarte:

1. **Statische generatie gaat eraan.** Alle contentroutes draaien nu op `generateStaticParams`. Content uit Supabase betekent ISR of `force-dynamic` op ~180 pagina's. `/supplementen` laat al zien wat dat kost.
2. **De typecheck-garantie verdwijnt.** Vandaag is een verkeerde affiliate-slug een build failure (`CLAUDE.md`: "mismatch = TypeScript build failure"). In een database is het een lege pagina in productie.
3. **Het is een tweede CMS.** De opdracht verbiedt dat zelf (§24) en heeft daar gelijk in.
4. **RLS-complexiteit op publieke pagina's.** Alle bestaande contentdata is publiek en ongevoelig. Hem in Supabase zetten betekent service-role-toegang vanuit publieke routes, voor data die geen enkele bescherming nodig heeft.
5. **Er is geen redacteur die het nodig heeft.** Eén persoon schrijft de content, in de editor, met Cursor ernaast. Een admin-UI om artikelen te koppelen lost een probleem op dat niet bestaat.

### 13.2 Wat wél naar de database gaat

Alleen **metingen**, en de tabel bestaat al:

```sql
-- domain_events, bestaande tabel, geen migratie nodig
-- nieuwe event_types (allowlist in src/lib/events.ts):
'content.next_step_shown'     -- welke stap kreeg deze pagina
'content.next_step_clicked'   -- is hij gevolgd
'content.related_clicked'     -- werkt de afgeleide linklaag
'content.nutrient_bridge_shown'
```

Payload: `{ slug, page_type, step_kind, nutrient?, theme? }`. Geen PII, geen vrije tekst. Join-key blijft `session_id`.

### 13.3 De enige migratie die dit plan voorstelt

**Geen.** Fase 0–7 raakt het schema niet.

Fase 9 (content-health in admin) leest `domain_events` met bestaande queries. Als daar een aggregatie-view voor nodig blijkt, is dat één `create view` — en dan pas, op basis van echte querytijden, niet vooraf.

---

## 14. Supabase-relaties

Onveranderd. Ter referentie de drie families die dit plan aanraakt:

| Familie | Rol in dit plan |
|---|---|
| `intake_sessions`, `intake_intake_log`, `intake_domain_checkin` | leesbron voor `CheckLens` (via cookie → server) |
| `domain_events` | 4 nieuwe event-types, geen schemawijziging |
| `affiliate_clicks` | **niet aanraken** |
| `pd_*`, `af_*` | buiten scope |

De cookie-route (`getIntakeSessionFromCookie`) is de enige aanraking met de database vanuit contentpagina's, en die moet **buiten de statische render blijven** — zie fase 6.

---

## 15. Next.js-architectuur

### 15.1 Renderstrategie per paginatype

| Type | Nu | Doel |
|---|---|---|
| `/blog/*`, `/kennisbank/*`, pillars | statisch | statisch blijven |
| `/beste/*`, `/supplementen/*`, `/product/*` | statisch | statisch blijven |
| `/supplementen` (hub) | **force-dynamic** | statisch + dynamisch eiland |
| `/dashboard`, `/intake/*` | dynamisch | ongewijzigd |

### 15.2 Het personalisatie-eiland

Het patroon dat `CheckLens` op contentpagina's mogelijk maakt zonder de statische render op te geven:

```
page.tsx                    ← statisch, generateStaticParams, geen cookies
  └─ <NextStepBlock/>       ← server component, puur uit de graaf, statisch
  └─ <CheckLensSlot/>       ← client component
        └─ fetch /api/account/status (bestaat al)
        └─ rendert niets tot de status binnen is → geen CLS, geen flash
```

**Waarom client-fetch en niet een dynamische server-render:** een cookie lezen in een server component maakt de héle route dynamisch. Voor 130 contentpagina's is dat onacceptabel. De lens is aanvullend — een bezoeker zonder check mist niets.

**CLS-voorkoming:** het slot reserveert geen hoogte en rendert alleen bij een bevestigde check. Geen skeleton, geen placeholder.

### 15.3 De graafindex

```ts
// src/lib/graph/content-graph.ts
let cached: ContentGraph | null = null;

export function contentGraph(): ContentGraph {
  return (cached ??= buildContentGraph());
}
```

Module-level memoisatie, gebouwd uit statische imports. Geen I/O, geen async. In een serverless-omgeving wordt hij per instance één keer opgebouwd; bij 180 pagina's en ~500 relaties is dat verwaarloosbaar.

**Prestatiegrens die we bewaken:** bouwtijd van de graaf < 50 ms, gemeten in een test. Wordt die overschreden, dan gaat de graaf naar een build-time gegenereerd JSON-bestand in plaats van runtime-opbouw.

---

## 16. Admin / content health

### 16.1 Waar het komt

`/admin/site` — het bestaande intake-dashboard. **Niet** in de PartnerDesk-shell (`/admin/(desk)`): dat gaat over partnerrelaties, dit over content. Twee verschillende systemen, `CLAUDE.md` scheidt ze expliciet.

### 16.2 Wat het toont

Eén tabel, gesorteerd op ernst, gevoed door `content-health.ts` (dezelfde module als het CI-script — één implementatie, twee consumenten):

| Ernst | Signaal | Bron |
|---|---|---|
| CRITICAL | interne link naar niet-bestaande route | graaf |
| CRITICAL | pagina met 0 inkomende links | graaf |
| HIGH | pagina zonder check-CTA | graaf |
| HIGH | artikel over een `NutrientId` zonder `nutrients`-veld | graaf + heuristiek |
| HIGH | vergelijkingslink naar een `forbidden`/`on_hold` stof | `approved-claims.ts` |
| MEDIUM | < 2 inkomende links | graaf |
| MEDIUM | ontbrekende `laatstBijgewerktOp` ouder dan 12 maanden | data |
| MEDIUM | blogartikel dat `/beste/*` linkt zonder `/supplementen/*` ertussen | graaf |
| LOW | ontbrekend `BreadcrumbList`-schema | routeconfig |
| LOW | pagina met > 6 afgeleide links | graaf |

Plus drie kengetallen bovenaan: aantal weespagina's, mediaan inkomende links, percentage pagina's met een contextuele volgende stap.

### 16.3 Wat het níét wordt

Geen editor. Geen "koppel dit artikel aan dat nutriënt"-UI. De data staat in TypeScript en wordt daar bewerkt. Het dashboard **diagnosticeert**, Cursor **repareert**.

---

## 17. Analytics

### 17.1 Nieuwe events (4)

Registratie op de drie verplichte plekken (`CLAUDE.md`): `src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`.

| Event | Wanneer | Payload |
|---|---|---|
| `content.next_step_shown` | `NextStepBlock` rendert | `{ slug, page_type, step_kind, reason }` |
| `content.next_step_clicked` | klik erop | idem |
| `content.related_clicked` | klik in afgeleid linkblok | `{ from_slug, to_slug, relation }` |
| `content.nutrient_bridge_shown` | nutriëntbrug rendert | `{ slug, nutrient, threshold_kind }` |

Naast GA4 `trackEvent` voor de klikken en `clarityTag` voor de step_kind (segmentatie in sessieopnames).

### 17.2 Hergebruik boven nieuw

Voor de rest van de keten bestaan de events al: `intake.started`, `intake.cta_to_nutrition_log`, `intake.cta_to_comparison`, `nutrition.schap_bron_clicked`, `affiliate.click`, `dashboard.schap_vergelijking_click`. Niets daarvan wordt vervangen.

### 17.3 De vier vragen die dit moet beantwoorden

1. **Kiest de resolver goed?** `content.next_step_clicked / content.next_step_shown` per `step_kind`. Als voedingscheck-CTA's structureel lager converteren dan leefstijlcheck-CTA's op vergelijkbare pagina's, klopt de beslistabel niet.
2. **Doet de nutriëntbrug iets?** `content.nutrient_bridge_shown → intake.started{source:nutrition}`.
3. **Werkt de afgeleide linklaag?** `content.related_clicked` per `relation`. Als `nutrient`-relaties nauwelijks geklikt worden, is de ordening fout.
4. **Verzwakt dit de affiliate-funnel?** `affiliate.click` per week, vóór en na. Dit is de tegenmeting — het plan zet bewust een stap tússen artikel en vergelijking, en die mag de monetisatie niet verslechteren.

> **Meetpunt:** `content.next_step_shown` / `content.next_step_clicked` / `content.related_clicked` / `content.nutrient_bridge_shown` — hier lees je het effect af.

---

## 18. Performance

| Risico | Mitigatie | Grens |
|---|---|---|
| Graafopbouw kost render-tijd | module-memoisatie, meet in test | < 50 ms |
| `NextStepBlock` maakt pagina's dynamisch | puur uit statische data, geen cookies | 0 nieuwe dynamische routes |
| `CheckLens` veroorzaakt CLS | client island, geen gereserveerde hoogte | CLS ongewijzigd |
| Afgeleide links vergroten de HTML | max 6 per pagina | < 2 KB extra |
| Meer JSON-LD | schema's zijn klein, server-gerenderd | < 3 KB per pagina |
| `/supplementen` force-dynamic | statische shell + island | TTFB naar statisch niveau |

**Expliciete niet-doen:** geen client-side graafopbouw, geen `useEffect`-linkgeneratie, geen extra API-call per contentpagina. Wat statisch kan, blijft statisch.

---

## 19. Security & privacy

Dit plan verandert de privacypositie op één punt: `CheckLens` toont checkresultaten op publieke pagina's.

| Aspect | Regel |
|---|---|
| Databron | bestaande cookie (`psf_intake_session` / `psf_account`), geen nieuwe opslag |
| Transport | bestaande `/api/account/status`, same-origin, bestaande rate-limiting |
| Weergave | score + domein. **Nooit** symptomen, antwoorden of e-mail |
| Consent | valt onder bestaande intake-consent; geen nieuwe grondslag |
| Events | geen PII in payload — `slug`, `page_type`, `step_kind`, `nutrient` zijn productkennis |
| Verwerkingsregister | geen nieuwe verwerking; wel een regel over "tonen van checkresultaat op contentpagina's" |
| AVG-revoke | ongewijzigd: cookie weg = lens weg |

**Eén aandachtspunt:** een gedeelde link naar een contentpagina toont bij de ontvanger niets — de lens hangt aan diens eigen cookie. Dat is correct gedrag en moet zo blijven; geen sessie-id in URL's.

---

## 20. Migratiestrategie

**Er is geen migratie.** Geen schemawijziging, geen URL-wijziging, geen redirects, geen dataconversie.

Wat er wel gebeurt, in volgorde van omkeerbaarheid:

| Stap | Omkeerbaar | Hoe |
|---|---|---|
| Graafmodule toevoegen | volledig | bestand verwijderen |
| `nutrients`-veld op `ContentMetadata` | volledig | optioneel veld, geen consument breekt |
| `NextStepBlock` vervangt vaste CTA's | per component | feature flag `src/lib/feature-flags.ts` |
| Weespagina's inweven | volledig | dataregels |
| Schema-uitbreiding | volledig | per route |
| `/supplementen` destatiseren | volledig | één regel terug |
| `/voedingsstof/[slug]` | **niet** | nieuwe URL's; alleen na §7.3 |

Fase 1 gaat achter `feature-flags.ts` live op één paginatype (blog), wordt gemeten, en pas daarna uitgerold. Dat is de enige stap met echt conversierisico.

---

## 21. Cursor-codeerplan per fase

Elke fase is één Cursor-sessie en één commit. Geen fase begint voordat de vorige groen is (`tsc --noEmit` + `vitest` + `eslint --max-warnings 0`).

---

### FASE 0 — Domeintaal verenigen + graafskelet (P0)

**Doel.** Eén domeinbegrip, en een graaf die niets doet behalve zichzelf bouwen en beschrijven.

**Onderzoeken.** `src/types/dashboard.ts` (`PillarId`), `src/lib/content/themes.ts` (`ThemeSlug`), `src/data/nurture-content.ts` (`DomainKey`), `src/lib/measured-pillar-map.ts`, `src/data/insights.ts` (`BLOG_CATEGORIE_TO_PIJLER`, `KENNISBANK_THEME_TO_PIJLER`, `INSIGHT_PIJLER_OVERRIDE`).

**Nieuw.**
- `src/data/domains.ts` — `DOMAINS`: één array met `{ pillarId, themeSlug, domainKey, scoreKey, label, slug, colorToken, isMeasured }`, plus bidirectionele lookups.
- `src/lib/graph/content-graph.ts` — `buildContentGraph()`, `contentGraph()`.
- `src/lib/graph/types.ts`.
- `src/lib/graph/__tests__/content-graph.test.ts`.

**Wijzigen.** Niets functioneels. De bestaande vertaaltabellen blijven, maar worden *afgeleid* uit `DOMAINS` in plaats van handmatig — zodat de vier begrippen niet meer uit elkaar kunnen lopen. `INSIGHT_PIJLER_OVERRIDE` blijft als handmatige override bestaan; die codeert redactionele keuzes.

**Database.** Geen.

**SEO-impact.** Geen (niets gerenderd).

**Risico's.** Laag, mits `DOMAINS` exact de bestaande mappings reproduceert. **Verplichte test:** voor elke bestaande vertaaltabel een test die bewijst dat de afgeleide versie identiek is aan de handmatige.

**Acceptatiecriteria.**
- [ ] `DOMAINS` dekt alle 6 gemeten domeinen + `verbinding`
- [ ] Test bewijst gelijkheid met alle bestaande mappings
- [ ] `contentGraph()` bouwt zonder fout en bevat ≥ 76 artikelen, ≥ 38 termen, 7 vergelijkingen, 8 gidsen, 5 nutriënten
- [ ] Bouwtijd < 50 ms (test met `performance.now()`)
- [ ] `tsc` + `vitest` + `eslint` groen

---

### FASE 1 — Contextuele volgende stap (P0)

**Doel.** Elke contentpagina biedt de juiste check aan. Dit is de fase met de hoogste verwachte opbrengst.

**Onderzoeken.** `src/data/insight-metadata.ts`, `src/lib/intake-product-copy.ts`, `BlogIntakeCTA.tsx`, `KennisbankIntakeCTA.tsx`, `ComparisonIntakeFallbackCta`, `src/lib/feature-flags.ts`.

**Nieuw.**
- `src/lib/graph/resolve-next-step.ts`
- `src/components/content/NextStepBlock.tsx`
- `src/lib/graph/__tests__/resolve-next-step.test.ts`
- `src/lib/graph/next-step-copy.ts` — copy per `step_kind`, volgens `WRITING_VOICE.md`

**Wijzigen.**
- `src/types/insight.ts` — `nutrients?: NutrientId[]` op `ContentMetadata`
- `src/data/insight-metadata.ts` — `nutrients` invullen op de nutriëntartikelen (43 kandidaten, ~30–35 verwacht na redactionele schifting)
- `BlogIntakeCTA.tsx` — copy/href uit de resolver i.p.v. `INTAKE_CTA` (achter flag)
- `src/lib/events.ts` + `intake-events-client.ts` + `api/intake/events/route.ts` — 2 events
- `src/lib/feature-flags.ts` — `contextualNextStep`

**Database.** Geen (bestaande `domain_events`).

**SEO-impact.** Positief: 25 artikelen krijgen een conversiepad, 30 krijgen het juiste.

**UX-impact.** De kern van het plan. Risico: voedingscheck-CTA op een slaapartikel voelt verkeerd als het `nutrients`-veld te breed is ingevuld. Daarom: **`nutrients` alleen als het artikel de stof inhoudelijk behandelt**, niet als hij hem noemt.

**Risico's.** Conversiedaling als de voedingscheck slechter converteert dan de leefstijlcheck. Mitigatie: flag, blog eerst, twee weken meten.

**Tests.** Resolver-unit per beslisrij; snapshot dat elke van de 76 slugs precies één stap krijgt; test dat een `forbidden` stof nooit een vergelijking oplevert.

**Acceptatiecriteria.**
- [ ] 76/76 blogartikelen hebben een `NextStep` (0 zonder)
- [ ] 30–35 nutriëntartikelen wijzen naar `/intake/voeding` (van 43 kandidaten; de schifting is vastgelegd)
- [ ] 0 artikelen wijzen naar een `forbidden`/`on_hold` vergelijking
- [ ] Events op drie plekken geregistreerd
- [ ] Flag uit = byte-identieke HTML aan vandaag

---

### FASE 2 — Weespagina's en clusterreparatie (P0)

**Doel.** Nul weespagina's, en een script dat voorkomt dat ze terugkomen.

**Onderzoeken.** De 8 + 2 uit §3.2; `src/app/overgang/page.tsx`; de 5 creatine-artikelen.

**Nieuw.**
- `src/lib/graph/content-health.ts`
- `scripts/content-health.mjs` (CLI, faalt op CRITICAL)
- `src/lib/graph/__tests__/content-health.test.ts`

**Wijzigen.**
- 8 weesartikelen: elk ≥ 2 inkomende links vanuit semantisch verwante artikelen (`gerelateerdeSluggen` + waar passend een redactionele inline link)
- `/overgang` pillar: links naar de 4 overgang-artikelen
- 5 creatine-artikelen: `/supplementen/creatine` invoegen vóór `/beste/creatine`
- 4 kennisbank-wezen inweven
- `.githooks/pre-push` + `package.json`: `check:content-health`

**Database.** Geen. **SEO-impact.** Hoog en direct: 12 pagina's van nul naar minimaal twee inkomende links.

**Risico's.** Verleiding om links te forceren waar ze inhoudelijk niet passen. **Regel: liever één goede link dan twee slechte** — bij twijfel het artikel als CRITICAL laten staan en redactioneel oplossen.

**Acceptatiecriteria.**
- [ ] `npm run check:content-health` → 0 CRITICAL
- [ ] 8 + 4 wezen hebben ≥ 2 inkomende links
- [ ] 5 creatine-artikelen lopen via de gids
- [ ] Pre-push hook faalt op een kunstmatig ingevoerde dode link

---

### FASE 3 — CheckLens op contentpagina's (P1)

**Doel.** Terugkerende bezoekers zien op elke contentpagina wat die pagina voor hén betekent.

**Onderzoeken.** `src/lib/check-lens.ts`, `CheckLens.tsx`, `CheckLensBanner.tsx`, `/api/account/status`, `src/app/gids/[thema]/page.tsx` (referentie-implementatie).

**Nieuw.**
- `src/components/personalization/CheckLensSlot.tsx` — client island
- uitbreiding `CheckLensTarget` met `{ kind: "article"; theme; nutrients }`

**Wijzigen.** `BlogArticlePage.tsx`, `kennisbank/[slug]/page.tsx`, `SupplementPage.tsx`, `beste/[supplement]/page.tsx` — slot toevoegen.

**SEO-impact.** Neutraal (client-side, na hydratatie). **Performance:** 0 nieuwe dynamische routes — dat is de acceptatiecriterium.

**Risico's.** CLS. Mitigatie: geen gereserveerde hoogte, geen skeleton.

**Acceptatiecriteria.**
- [ ] Lens op 4 paginatypen
- [ ] `generateStaticParams` intact, 0 routes dynamisch geworden
- [ ] CLS gemeten gelijk (Lighthouse voor/na op 3 pagina's)
- [ ] Zonder cookie: geen DOM-node, geen fetch-fout in console
- [ ] Geen symptomen/antwoorden/e-mail in de DOM

---

### FASE 4 — Schema- en breadcrumbdekking (P1)

**Doel.** `SEO_RULES.md` waarmaken: breadcrumbs sitewide, één `Article`-implementatie, `Organization` één keer.

**Nieuw.**
- `src/lib/seo/breadcrumb-trail.ts` — pad → trail, afgeleid uit de graaf
- `buildOrganizationSchema()` in `structuredData.ts`

**Wijzigen.** `BlogArticlePage.tsx` (inline `Article` → `buildArticleSchema()` + breadcrumb), `kennisbank/[slug]`, 7 pillars, `/gidsen`, `/inzichten`, `src/app/layout.tsx` (Organization).

**Risico's.** Laag. **Verplichte regel:** breadcrumb-JSON-LD alleen waar ook een zichtbare breadcrumb staat — anders is het een schema voor iets dat er niet is.

**Acceptatiecriteria.**
- [ ] Elke publieke route: `BreadcrumbList` + zichtbare breadcrumb
- [ ] Eén `Article`-implementatie in de codebase (grep bewijst het)
- [ ] `Organization` precies één keer sitewide
- [ ] Rich Results Test groen op 5 steekproefroutes
- [ ] Geen `MedicalWebPage`, geen `Review`

---

### FASE 5 — Nutriëntbrug (P1)

**Doel.** De voedingsdatalaag krijgt zijn eerste publieke oppervlak — zonder één milligram.

**Onderzoeken.** `nutrient-routes.ts`, `nutrition-nutrient-index.ts`, `intake-reference.ts`, `CategorieDetailPaneel.tsx`, `nutrition-spread.ts`.

**Nieuw.**
- `src/lib/graph/nutrient-bridge.ts` — publieke, getal-loze projectie van de route
- `src/components/content/NutrientBridge.tsx`
- tests, waaronder een **regressietest die faalt zodra er een cijfer met eenheid in de output staat**

**Wijzigen.** `BlogArticlePage.tsx` + `kennisbank/[slug]` (brug bij `nutrients`), `SupplementPage.tsx` (brug vóór de vergelijkings-CTA), events.

**SEO-impact.** Elke nutriëntpagina krijgt inhoudelijk unieke, citeerbare content met een gebronde drempel. Dit is het materiaal waarop AI-antwoorden citeren.

**Risico's.** **Het grootste inhoudelijke risico van het plan.** Twee harde grenzen:
1. Geen mg, geen %ADH, geen dagtotaal (§7.3) — afgedwongen door de regressietest.
2. Geen impliciete gezondheidsclaim. De brug zegt wat een portie bijdraagt, nooit wat het voor je gezondheid doet.

**Acceptatiecriteria.**
- [ ] Brug op alle artikelen met `nutrients`
- [ ] 0 voorkomens van mg/µg/g/%ADH in de gerenderde brug (test)
- [ ] `thresholdKind` zichtbaar in de copy (vuistregel ≠ richtlijn ≠ proxy)
- [ ] Bronvermelding waar `sourceNl` bestaat
- [ ] `ItemList`-schema alleen als de bronnenlijst zichtbaar is
- [ ] `content.nutrient_bridge_shown` geregistreerd

---

### FASE 6 — Afgeleide interne links + `/supplementen` destatiseren (P2)

**Doel.** De linklaag die zichzelf onderhoudt, en de commerciële hub terug naar statisch.

**Nieuw.** `src/lib/graph/resolve-related.ts`, `src/components/content/RelatedBlock.tsx`, `src/components/supplement-hub/HubPersonalizationSlot.tsx`.

**Wijzigen.** `BlogArticlePage.tsx` (naast `BlogGerelateerd`, niet in plaats van), `kennisbank/[slug]`, `src/app/supplementen/page.tsx` (`force-dynamic` weg, cookie-logica naar island), events.

**Risico's.** Linkverdunning bij te veel afgeleide links (grens: 6). Bij `/supplementen`: de personalisatiebanners (`VoortgangReturnBanner`, `IntakeResultsReturnBanner`) mogen niet verdwijnen — ze verhuizen naar het island.

**Acceptatiecriteria.**
- [ ] Mediaan inkomende links per artikel stijgt meetbaar
- [ ] Max 6 afgeleide links per pagina
- [ ] 0 duplicaten met redactionele links
- [ ] Turbo-snippet boven elk blok
- [ ] `/supplementen` is statisch; banners werken nog
- [ ] Lighthouse TTFB op `/supplementen` meetbaar beter

---

### FASE 7 — Content-health-dashboard (P2)

**Doel.** Contentgezondheid zichtbaar zonder een agent te hoeven vragen.

**Nieuw.** `src/app/admin/site/content-health/page.tsx`, `src/components/admin/ContentHealthTable.tsx`.

**Wijzigen.** `content-health.ts` uitbreiden met de MEDIUM/LOW-regels uit §16.2; admin-nav.

**Risico's.** Laag. Leest alleen build-time data + `domain_events`.

**Acceptatiecriteria.**
- [ ] 4 ernstniveaus, gesorteerd
- [ ] 3 kengetallen bovenaan
- [ ] Achter bestaande admin-auth
- [ ] Deelt exact één implementatie met het CI-script

---

### FASE 8 — `/voedingsstof/[slug]` — GEGATE (P3)

**Niet starten** voordat alledrie waar is:

1. NEVO-licentie rond, óf voldoende `verified: true`-rijen uit een bron die publicatie toestaat.
2. Vitamine D en magnesium boven `confidence: 1` (zie `CATALOGUS_GAPS` §3.1 — dit gaat vóór).
3. Per stof ≥ 800 woorden eigen redactie naast de tabel.

Zonder alledrie is dit thin content op ongeverifieerde data — het scherpste reputatierisico van het hele plan, op precies het punt waar de positionering ligt.

---

### FASE 9 — Meten en terugkoppelen (P1, loopt continu)

**Doel.** Bewijzen dat de keten werkt, en de beslistabel bijstellen op data.

**Wijzigen.** `/admin/site` — funnel `content.next_step_shown → clicked → intake.started → intake.completed → affiliate.click`, gesegmenteerd op `step_kind`.

**Acceptatiecriteria.**
- [ ] Funnel per `step_kind` zichtbaar
- [ ] Tegenmeting `affiliate.click` week-over-week
- [ ] Beslistabel §12.2 heeft na 4 weken minstens één datagedreven bijstelling (of een vastgelegde conclusie dat hij klopt)

---

## 22. Acceptatiecriteria — de vijf die over het geheel gaan

Los van de fasen, dit moet aan het eind waar zijn:

1. **Elke publieke contentpagina biedt precies één volgende stap, en die is afgeleid.** Meetbaar: `content.next_step_shown` op 100% van de contentpaginaviews.
2. **Nul weespagina's, afgedwongen in de pre-push hook.** Meetbaar: `check:content-health` → 0 CRITICAL.
3. **Nul nieuwe dynamische routes; `/supplementen` is statisch geworden.** Meetbaar: `next build`-output.
4. **Geen enkele publieke milligramwaarde uit `food-sources.ts` zolang `verified: false`.** Meetbaar: regressietest.
5. **Geen enkele automatisch gegenereerde link naar een `forbidden` of `on_hold` stof.** Meetbaar: test over de hele graaf.

---

## 23. Testplan

| Laag | Wat | Waar |
|---|---|---|
| Unit | domeinmapping-gelijkheid (fase 0) | `graph/__tests__/domains.test.ts` |
| Unit | resolver per beslisrij | `resolve-next-step.test.ts` |
| Unit | brug bevat geen eenheden | `nutrient-bridge.test.ts` |
| Unit | gate: `forbidden`/`on_hold` nooit vergelijking | `resolve-next-step.test.ts` |
| Integratie | graaf over echte data: 0 dode links, 0 wezen | `content-health.test.ts` |
| Integratie | elk van 76 slugs krijgt precies 1 stap | snapshot |
| Component | `NextStepBlock` rendert per `step_kind` | Testing Library |
| Component | `CheckLensSlot` rendert niets zonder cookie | Testing Library |
| Performance | graafopbouw < 50 ms | `content-graph.test.ts` |
| Handmatig | mobiel 375px op 3 paginatypen | per fase |
| Handmatig | Rich Results Test op 5 routes | fase 4 |

**Snapshot-discipline:** de "elke slug krijgt één stap"-snapshot is bewust bros. Een nieuw artikel zonder metadata moet die test breken — dat is het mechanisme dat voorkomt dat de volgende contentgolf opnieuw losgekoppeld raakt.

---

## 24. Rolloutplan

| Week | Fase | Poort |
|---|---|---|
| 1 | 0 | mappings identiek, graaf bouwt |
| 2 | 1 (flag uit) | tests groen |
| 2 | 1 **aan op blog** | conversie 2 weken meten |
| 3 | 2 | 0 CRITICAL |
| 4 | 1 aan op kennisbank + gidsen | alleen als blog niet verslechterde |
| 5 | 3 | 0 nieuwe dynamische routes |
| 6 | 4 | Rich Results groen |
| 7–8 | 5 | regressietest + redactionele review van de brugcopy |
| 9 | 6 | mediaan links omhoog, `/supplementen` statisch |
| 10 | 7 | — |
| doorlopend | 9 | — |

**Terugrolpunt.** Fase 1 is het enige echte conversierisico. Blijft de klik-ratio op de nieuwe CTA's twee weken onder de oude, dan gaat de flag uit en wordt de beslistabel herzien — niet het hele plan.

**Deploy.** Per fase één commit, `bash deploy.sh`, geen big-bang.

---

## 25. Prioriteiten

**P0 — absoluut noodzakelijk**
- Fase 0: domeintaal verenigen (voorwaarde voor al het andere)
- Fase 1: contextuele volgende stap (grootste opbrengst)
- Fase 2: weespagina's + CI-gate (grootste directe SEO-winst)

**P1 — zeer belangrijk**
- Fase 3: CheckLens op contentpagina's
- Fase 4: schema- en breadcrumbdekking
- Fase 5: nutriëntbrug
- Fase 9: meten

**P2 — later**
- Fase 6: afgeleide links + `/supplementen` statisch
- Fase 7: content-health-dashboard

**P3 — toekomst, gegate**
- Fase 8: `/voedingsstof/[slug]` (na NEVO én na de confidence-fix)

---

## 26. DO NOT BUILD YET

Interessante ideeën die nu juist níét gebouwd moeten worden, met de reden.

| Idee | Waarom niet nu |
|---|---|
| **Contenttabellen in Supabase** (`articles`, `content_topics`, `article_nutrients`) | Breekt statische generatie, verliest de typecheck-garantie, is een tweede CMS voor één redacteur. Zie §13.1. **Niet "later" — niet.** |
| **`/blog` + `/kennisbank` → `/inzichten`** | URL-migratie van 114 pagina's zonder gemeten probleem; de hub is net uit de nav gehaald. Zie §9.4. |
| **Alias `/leefstijl/{domein}`** | Tweede URL met canonical terug: kost crawlbudget, levert alleen interne netheid. |
| **Automatische ankertekst-generatie** | De ene plek waar een generator echte schade doet: een verkeerde inline link in een veiligheidsartikel. Zie §11.1. |
| **Embeddings / semantische interne links** | `pgvector` staat er al voor evidence-RAG. Voor 180 pagina's is redactionele metadata preciezer en goedkoper. Herover bij > 500 pagina's. |
| **`MedicalWebPage`-schema** | Vereist medische review-attributie die we niet leveren; botst met "adviezen, geen diagnoses". |
| **`Review` / `AggregateRating` op PS-Score** | We hebben geen gebruikersreviews. PS-Score als `Review` markeren is een feitelijke onjuistheid over een echt merk. |
| **Publieke voedingsmiddelpagina's** (`/voeding/amandelen`) | Zelfde NEVO-grens als fase 8, plus: voedingsmiddelen zijn geen zoekintentie van deze doelgroep. Nutriënt wel, voedingsmiddel niet. |
| **Food-affiliate / maaltijdbox-affiliate** | `CATALOGUS_GAPS` §9 zet dit als bewuste vraag open. Zolang het antwoord niet gegeven is, geen infrastructuur bouwen. |
| **AI-chat over de content-graaf** | `/api/chat` bestaat voor evidence. Een tweede chat-oppervlak vóór de basisketen werkt, is de klassieke afleiding. |
| **Achtste `/beste/*`-vergelijking** | `CATALOGUS_GAPS` §0.1: het gat is de kwaliteit van de check, niet een ontbrekend supplement. |
| **Gecombineerde "doe beide checks"-CTA** | Twee checks aan een koude bezoeker verlaagt de conversie op allebei. Wél ná de eerste check. Zie §7.4. |
| **Content-health als blokkerende CI op MEDIUM/LOW** | Alleen CRITICAL blokkeert. Een pre-push hook die faalt op een ontbrekende `laatstBijgewerktOp` wordt binnen een week omzeild. |

---

## 27. Wat dit document niet doet

- **Geen contentkalender.** Die staat in `CATALOGUS_GAPS_VOEDING_LEEFSTIJL_SUPPLEMENTEN_2026-09.md` en is recenter dan wat ik hier zou kunnen toevoegen.
- **Geen keyword-volumes.** Geen Keyword Planner-toegang; een verzonnen getal is erger dan geen getal (zelfde lijn als `CATALOGUS_GAPS` §2).
- **Geen Search Console-data.** De uitspraken over kannibalisatie en ranking-risico zijn structureel onderbouwd, niet met verkeerscijfers. De eerste die dit plan moet toetsen aan GSC is fase 9.
- **Geen oordeel over de check-inhoud.** Dat `vitamin_d` en `magnesium` op `confidence: 1` staan is de belangrijkste productzwakte van het platform, maar het is een ander project — en het gaat vóór fase 8.

---

*Opgesteld september 2026. Alle cijfers geverifieerd tegen de codebase op commit `94bbc1b`.*
