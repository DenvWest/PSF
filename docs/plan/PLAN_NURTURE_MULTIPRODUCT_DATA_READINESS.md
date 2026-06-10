# PLAN — Nurture multi-product data-readiness (meten → testen → verbeteren)

> **Layer 3 — Plan.** Reconstructie + uitbreiding van de eerdere analyse "is het systeem klaar voor **meerdere producten in nurture** en kan het vanuit **data meten → testen → verbeteren** (toekomstklaar)". Plus twee expliciet gevraagde uitbreidingen: (DEEL 3) **LLM-verbetering onder data-governance/compliance** en (DEEL 4) **B2B / andere producten** (white-label via `organization_id`). **Alleen planning — geen code, geen `src/`-wijziging, geen schema-migratie.** Pseudostructuur ter illustratie.
>
> Kruisverwijzingen: [`PLAN_FUNNEL_DATA_PRIORITY.md`](PLAN_FUNNEL_DATA_PRIORITY.md) · [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) · [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) · [`COMPLIANCE.md`](../core/COMPLIANCE.md) · [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) · [`ARCHITECTURE.md`](../core/ARCHITECTURE.md) · [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) · [`EMAIL_SYSTEM.md`](../core/EMAIL_SYSTEM.md)

---

## Samenvatting

De kernvraag van de eerdere analyse: **kan de nurture-laag meerdere producten per profiel dragen, en is hij toekomstklaar om vanuit data te meten welk product wint, dat te testen en de selectie te verbeteren — zónder dat we nú een optimizer bouwen (YAGNI)?**

Antwoord in één zin: **de mechaniek staat, de meetbaarheid niet.** Het multi-product-mechanisme bestaat al — [`resolve-nurture-cta.ts`](../../src/lib/resolve-nurture-cta.ts) draagt per profiel een `candidates: string[]` en kiest het **eerste kandidaat-middel dat de gate haalt**. Dat is bewust statisch en YAGNI-correct: geen optimizer vóór volume. Maar precies dáárom is de huidige instrumentatie nog **blind**: je kunt achteraf niet zien wélk product een mail aanbood, of die aanbieding tot een klik leidde, of welke variant beter converteerde. Zonder die haakjes is "meten → testen → verbeteren" later niet mogelijk zonder retroactief gat in de data.

**De drie blokkers vóór toekomstklaarheid (geen optimizer — alleen meet-haakjes) — alle drie gedaan (10 jun 2026):**

1. ✅ **`nurture.email_sent` legt het gekozen product/CTA vast (P1).** Payload bevat `cta_kind`, `cta_slug`, `candidate_rank`, `variant`. Dag-0 en cron-pad beide gedekt.
2. ✅ **`affiliate.click` is koppelbaar aan de mail (P2).** Het event verrijkt met `session_id`, `sequence_day`, `profile_label`, `variant` via HMAC-attributietoken. Funnel `mail → klik → conversie` sluitbaar per product.
3. ✅ **Variant-/experiment-dimensie klaargezet (P3).** `variant`-kolom op `nurture_emails` (nullable, fase-0 altijd `null`). A/B-test wordt een config-flag i.p.v. schema-wijziging.

Deze drie zijn **instrumentatie, geen optimalisatie** — ze zijn goedkoop, anonimiserings-veilig, en ze zijn de voorwaarde om de optimizer (échte YAGNI) later te kunnen bouwen zónder data-gat. De rest van dit plan legt de loop, de governance-poort voor LLM-gebruik (DEEL 3) en de B2B-naden (DEEL 4) vast. **Meet-loop fase 1 (DEEL 2) is ontgrendeld.**

---

## DEEL 0 — Wat al staat (niet herbouwen)

| Bouwsteen | Status | Waar |
|---|---|---|
| Multi-product-mechanisme per profiel | ✅ aanwezig | `SUPPLEMENT_BY_PROFILE[profile].candidates[]` in [`resolve-nurture-cta.ts`](../../src/lib/resolve-nurture-cta.ts); kiest eerste kandidaat die de gate haalt |
| Deterministische selectie-gate | ✅ aanwezig | `resolveGatedComparisonPath` ([`supplement-gate.ts`](../../src/lib/supplement-gate.ts)): `approvedClaims[key].status==='approved'` && `comparisonPath!=null` && `isComparisonAllowed(slug)` |
| Tier-/plan-gate vóór supplement-CTA | ✅ aanwezig | `resolveNurtureCta` → `visibleTiers.includes(3)`, supplement-CTA alleen dag 14/21 |
| Leefstijl-guard (geen kale supplement-CTA vroeg) | ✅ aanwezig | dag ≤3 leefstijl, dag 7 pillar, dag 30 hermeting |
| Funnel-events in de type-lijst | ✅ aanwezig | `nurture.email_sent`, `affiliate.click`, `remeasure.invited`, `remeasure.completed` in `DOMAIN_EVENT_TYPES` ([`events.ts`](../../src/lib/events.ts)) |
| Atomaire cron-claim (dubbelzend-risico dicht) | ✅ aanwezig | `update … status='sending' WHERE status='pending'` + 15-min crash-recovery in [`nurture-cron.ts`](../../src/lib/nurture-cron.ts) |
| Twee gescheiden datastromen (product vs persoon) | ✅ regel | [`ARCHITECTURE.md`](../core/ARCHITECTURE.md) |
| `organization_id` op events én sessies | ✅ aanwezig | `emitEvent` zet `organization_id`; B2B-naad ligt er al |

> **Niet opnieuw doen.** Het mechanisme om meerdere producten te dragen bestaat. Dit plan voegt **meetbaarheid + governance + multi-tenant-naden** toe, niet een tweede selectie-mechaniek.

---

# DEEL 1 — Readiness voor meerdere producten in nurture

## 1A. Hoe de selectie nu werkt (waarneming)

`supplementCtaForProfile` itereert over `entry.candidates` en retourneert de **eerste** die `resolveGatedComparisonPath` doorlaat. Concreet (uit de code):

```
Onrustige Slaper : ["magnesium"]
Lage Batterij    : ["omega3"]
Overtrainer      : ["magnesium", "omega3", "whey"]
In Balans        : ["melatonine", "omega3"]
Stressdrager     : ["ashwagandha", "magnesium"]
```

De volgorde in `candidates[]` ís de prioriteit. `melatonine` (`forbidden`) en `ashwagandha` (`on_hold`) vallen automatisch weg door de gate, dus "In Balans" levert feitelijk `omega3` en "Stressdrager" feitelijk `magnesium`. **Dat is correct en compliance-veilig** — maar het is een **handmatige, statische prioriteit**, geen datagedreven keuze. Niets meet of `omega3` voor "Lage Batterij" beter converteert dan een alternatief.

**Dit is de juiste YAGNI-stand.** Bij <500 intakes is een optimizer schijnwerk. Het probleem is niet de statische selectie — het is dat de **uitkomst van die selectie nergens wordt vastgelegd**, waardoor je later niet kunt overstappen op data zonder eerst maanden blind te draaien.

## 1B. De meet-gaten (wat toekomstklaarheid blokkeert)

| Wat je later wil meten | Kan het nu? | Waarom niet |
|---|---|---|
| Welk product bood mail X aan? | ❌ | `nurture.email_sent`-payload mist `cta_kind` + `comparison_slug` |
| Leidde die aanbieding tot een klik? | ✅ (P2) | `affiliate.click`-event verrijkt met `session_id`/`sequence_day`/`profile_label`/`variant` via HMAC-attributietoken |
| Welke kandidaat-volgorde wint? | ❌ | geen variant-/experiment-id; één vaste volgorde |
| Welk profiel klikt het meest door op welk middel? | ⚠️ deels | profiel zit in `nurture.email_sent`, maar zonder klik-join niet af te maken |
| Leidde de mail-reeks tot hermeting (delta)? | ⚠️ deels | `remeasure.completed` bestaat, maar zonder mail→remeasure-join geen attributie |

## 1C. De punten die vóór YAGNI eerst moeten (foundational, low-cost)

> Dit waren de "punten die nog aangepast moesten worden vóór YAGNI" uit de eerdere analyse. Het zijn **instrumentatie-haakjes**, geen optimizer. Elk is anonimiserings-veilig (alleen categorie/dag/slug/profiel, geen vrije tekst, geen lichaamsmaat).

| # | Status | Omschrijving |
|---|---|---|
| P1 | ✅ gedaan (10 jun 2026) | `nurture.email_sent` payload uitgebreid met `cta_kind`, `cta_slug`, `candidate_rank`, `variant` — zie commit `4ff2c34` |
| P2 | ✅ gedaan (10 jun 2026) | HMAC-attributietoken (`nt`) op `/beste/*`-CTA's → `affiliate.click` verrijkt met `session_id`, `sequence_day`, `profile_label`, `variant`. Token gestript uit URL na load. |
| P3 | ✅ gedaan (10 jun 2026) | `variant`-kolom (nullable) op `nurture_emails` + migratie `20260610130000_nurture_variant.sql` |
| P4 | ✅ gedaan (10 jun 2026) | `session_id` loopt ononderbroken door `intake.completed → nurture.email_sent → remeasure.completed` — geen nieuwe identifier geïntroduceerd |

- **P1 ✅ — Verrijk `nurture.email_sent`-payload met de gekozen CTA.**
  ```
  payload: { sequence_day, profile_label, primary_domain, status,
             cta_kind,            // 'lifestyle'|'pillar'|'supplement'|'remeasure'
             cta_slug,            // bv. 'magnesium' | null bij niet-supplement
             candidate_rank,      // index in candidates[] die won | null
             variant }            // altijd null in fase-0
  ```
  `ResolvedNurtureCta` uitgebreid met `candidateRank`; `getNurtureEmailContent` retourneert `resolvedCta` als single source of truth — niet opnieuw berekend. Dag-0 en cron-pad beide gedekt. Tests: `src/lib/__tests__/nurture-cron.test.ts` + `src/lib/__tests__/nurture-schedule.test.ts`.

- **P2 ✅ — Spiegel mail-context in `affiliate.click`.** Nurture-e-mails bevatten een HMAC-gesigneerde `?nt=`-parameter op `/beste/*`-CTA-links (`NURTURE_ATTRIBUTION_SECRET`, fallback `COOKIE_SECRET`, TTL 60 dagen). De client strip `nt` éénmalig uit de URL via `history.replaceState` (lekt niet naar affiliate-partners). `/api/affiliate/click` valideert het token server-side en verrijkt het `affiliate.click`-spiegel-event in `domain_events` met `session_id`, `sequence_day`, `profile_label`, `variant`. De `affiliate_clicks`-tabel blijft ongemoeid. Funnel `nurture.email_sent → affiliate.click` is nu sluitbaar via `session_id`. Implementatie: `src/lib/nurture-attribution-token.ts`, `src/lib/nurture-click-attribution.ts`, `src/app/api/affiliate/click/route.ts`. Tests: `src/lib/__tests__/nurture-attribution-token.test.ts`, `src/lib/__tests__/nurture-click-attribution.test.ts`, `src/lib/__tests__/affiliate-click-route.test.ts`.

- **P3 ✅ — Variant-dimensie (nullable, ongebruikt).** `variant text` kolom op `nurture_emails`; alle inserts zetten `variant: null`. Migratie `20260610130000_nurture_variant.sql` — idempotent, apply vóór deploy via `supabase db push`. Fase-1 A/B-test wordt een config-flag i.p.v. schema-wijziging.

- **P4 ✅ — Eén join-key door de funnel.** `session_id` (pseudoniem) loopt door `intake.completed → nurture.email_sent → remeasure.completed`. `affiliate.click` koppeling wacht op P2. Geen nieuwe identifier geïntroduceerd.

**Volgorde-argument:** P1–P4 zijn de enige dingen die nú moeten, en alleen omdat ze **retroactief niet in te halen zijn** — een klik die vandaag niet aan een mail gekoppeld wordt, is morgen verloren. De optimizer eromheen is terecht uitgesteld.

## 1D. Wat bewust NIET nu (échte YAGNI)

- **Geen multi-armed-bandit / scoring-optimizer** voor productkeuze.
- **Geen per-user product-ranking model.**
- **Geen dynamische herordening van `candidates[]`** op basis van live cijfers.
- **Geen tweede supplement-CTA per mail** — één conversiedoel blijft (leefstijl-guard).
- Alles hierboven start pas ná volume (500+/2000+ — [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) §F) én een doorlopen anonimiseringspad.

---

# DEEL 2 — De meet → test → verbeter-loop (toekomstklaarheid)

## 2A. De loop, expliciet

```
1. METEN     nurture.email_sent{cta_slug} + affiliate.click{session_id} + remeasure.completed
             → per (profiel, dag, product): aanbiedingen, kliks, CTR, hermeting-delta
2. TESTEN    variant-dimensie (P3): kandidaat-volgorde A vs B, of copy A vs B,
             uitsluitend bóven de claim-/tier-gate (selectie verandert, gate niet)
3. VERBETEREN  bij significant verschil → handmatig de candidates-volgorde aanpassen
             (fase 2: mens beslist op cijfers) → later model-suggestie (fase 3, DEEL 3)
```

## 2B. Drempels (gekoppeld aan de bestaande roadmap)

Onveranderd t.o.v. [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) §F en [`PLAN_FUNNEL_DATA_PRIORITY.md`](PLAN_FUNNEL_DATA_PRIORITY.md) DEEL 4:

| Fase | Drempel | Wat mag |
|---|---|---|
| **0 (nu)** | — | Instrumentatie (P1–P4). Statische selectie. **Geen** test, **geen** model. ✅ Alle haakjes live (10 jun 2026). |
| **1** | meet-haakjes live + eerste volume | Handmatige A/B via variant-flag; mens leest CTR/delta en past `candidates[]` aan. |
| **2** | 500+ intakes + anonimiseringspad | Statistische patroonherkenning op k-anon-set → suggesties voor volgorde. |
| **3** | 2000+ | Voorspellend model stelt **volgorde/triggers** bij — nooit claims, nooit selectie buiten de gate. |

**Harde regel door alle fases:** de selectie (wélk middel, wélke claim) mag van *positie* veranderen, maar **nooit van poort** — `approvedClaims` + `comparisonPath` + `isComparisonAllowed` + tier-gate blijven deterministisch en mens-geverifieerd. Een experiment dat melatonine of ashwagandha zou tonen is per constructie onmogelijk.

---

# DEEL 3 — LLM-verbetering onder data-governance & compliance

> **Nieuw t.o.v. de eerdere analyse.** Expliciet gevraagd: hoe verbeteren we de nurture/selectie later **met een LLM**, zonder de AVG-/EFSA-grenzen te schenden — en zó dat het ook naar B2B/andere producten generaliseert.

## 3A. Twee LLM-sporen, strikt gescheiden (herhaling van de kernregel)

| Spoor | Bevat persoonsdata? | Wanneer | Governance-pad |
|---|---|---|---|
| **Productkennis-RAG** (welk middel, welke vorm, welke EFSA-claim, prijs/dag) | **Nee** | Vroeg, los van volume | Geen art. 9-pad; alleen feit-corpus + `getUsableClaims()` |
| **Persoonsdata-engine** (selectie/trigger-verbetering op intake-uitkomsten) | **Ja (art. 9)** | Pas ná volume + anonimisering | Volledig k-anon-pad (3C) |

De RAG-laag haalt **alleen op** uit het genormaliseerde productschema + `approvedClaims`; hij **genereert nooit claims**. Dit spoor kan vandaag al, want het raakt geen persoonsgegeven ([`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) §C3).

## 3B. Wat een LLM mag verbeteren — en wat niet

| LLM mag (onder governance) | LLM mag NOOIT |
|---|---|
| Volgorde van `candidates[]` voorstellen op geaggregeerde, anonieme CTR/delta | Een EFSA-claim formuleren of herschrijven (alleen `getUsableClaims()` letterlijk) |
| Copy-varianten genereren vóór menselijke review (test-input) | Een statusoordeel/diagnose afleiden ("je hebt tekort X") |
| Productfeiten ophalen (RAG) voor onderbouwing | Een middel buiten de gate (`status≠approved`, `comparisonPath=null`) tonen |
| Patronen in anonieme antwoordcombinaties duiden | Ruwe antwoorden, e-mail, naam, `session_id` of lichaamsmaten in prompt/training krijgen |

**Architectuurregel:** de LLM zit **buiten** de gate, nooit erin. Hij beïnvloedt hooguit de *volgorde of framing*; de poort (`resolveGatedComparisonPath`, tier-gate, `FORBIDDEN_PHRASES_GLOBAL`) blijft deterministische code die zijn output naderhand filtert.

## 3C. Data-governance-poort (checklist vóór élke LLM-/aggregatie-stap)

Geen persoonsdata raakt een prompt, embedding of training vóór alle onderstaande punten groen zijn:

```
G1  Rechtsgrond + doelbinding   verwerkingsdoel 'modelverbetering' expliciet,
                                eigen consent_type + consent_version (intake-consent.ts);
                                has_active_consent() als gate
G2  Anonimisering vóór gebruik  k-anon-set (k ≥ drempel, bv. 20); strip email/first_name/
                                session_id/recovery_tokens/ip-ua; banden i.p.v. exacte waarden
G3  Service_role-grens          ruwe art. 9-tabel verlaat de service_role-grens NOOIT;
                                alleen de afgeleide anon-view gaat naar de LLM-laag
G4  Geen claim-generatie        LLM-output passeert de bestaande forbidden-phrases +
                                claim-gate; EFSA-tekst uitsluitend via getUsableClaims()
G5  Dataminimalisatie naar derden  bij externe LLM-API: geen PII in de payload (dezelfde
                                regel als de n8n-webhook-payloads — categorie/dag/slug/band)
G6  Logging & herleidbaarheid   leg vast wélke dataset (versie, k, datum) een model/prompt
                                voedde; reproduceerbaar en aantoonbaar voor een AVG-audit
G7  Bewaartermijn + intrekking   consent.revoked / anonimisering van de bronsessie werkt
                                door; getrainde aggregaten bevatten per constructie geen
                                herleidbare persoon (k-anon), dus geen "vergeten" nodig
```

**Let op de externe-LLM-nuance (G5):** zodra een prompt naar een externe API gaat, is dat een doorgifte aan een verwerker. Voor de **productkennis-RAG** is dat onproblematisch (geen PII). Voor het **persoonsdata-spoor** mag alleen de **al-geanonimiseerde** afgeleide naar buiten — nooit de ruwe intake. Dit is dezelfde minimalisatie-regel die de bestaande `n8n_webhook`-payloads al volgen (alleen gebande signalen).

## 3D. Compliance-eigenschappen die behouden moeten blijven

- **Claimgrens = systeemeigenschap, niet reviewtaak.** Eén testset borgt dat geen enkele LLM-output (ongeacht invoer) een statusclaim of niet-goedgekeurde claim kan vormen — uitbreiding op de bestaande `FORBIDDEN_PHRASES_GLOBAL`-aanpak ([`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) §B3).
- **Affiliate-disclosure blijft deterministisch** (dag-21 zet die al aan bij een compare-pad) — een LLM mag de disclosure nooit weglaten of herformuleren.
- **DPIA-trigger:** zodra het persoonsdata-spoor (geautomatiseerde profilering op art. 9-data) in beeld komt, is een DPIA vereist. Documenteer dat als voorwaarde vóór fase 2/3, niet achteraf.

---

# DEEL 4 — B2B / andere producten (white-label via `organization_id`)

> **Nieuw t.o.v. de eerdere analyse.** De vraag: is dit fundament ook bruikbaar als de aanpak naar een **B2B-kanaal** (coaches/agencies) of **andere productcategorieën** wordt uitgebreid? De naden liggen er deels al; de invulling is horizon.

## 4A. Naden die er al liggen

- **`organization_id`** zit op `domain_events` (via `emitEvent`) én op `intake_sessions` (CLAUDE.md → DB-schema). De multi-tenant-as bestaat dus al in de datalaag.
- **`getDefaultOrganizationId()`** is het enige wat nu één tenant veronderstelt — de seam om naar meerdere te gaan is geïsoleerd.
- **RLS staat aan**; service_role-only voor de gevoelige stromen.

## 4B. Wat per-tenant moet worden vóór B2B echt kan (gaten)

| Component | Nu | Voor B2B nodig |
|---|---|---|
| `approvedClaims` (claim-control) | **Globaal** (één set) | Per-org claim-/productset, of expliciet gedeeld + per-org override |
| `SUPPLEMENT_BY_PROFILE.candidates` | **Globaal** | Per-org candidates (andere catalogus/affiliate-partner) |
| Affiliate-slugs / partners | **Globaal** (Daisycon/Arctic Blue) | Per-org affiliate-mechanisme + disclosure |
| Meet-aggregaten (DEEL 1/2) | impliciet één tenant | Per-`organization_id` gepartitioneerd; geen cross-tenant lek |
| Consent / verwerkersrol | één verwerkingsverantwoordelijke | **Per org een eigen verwerkersverhouding** (DPA), eigen consent-versies |

## 4C. Governance-implicatie van B2B (cruciaal)

Bij white-label verschuift de **AVG-rol**: per coach/agency kan een aparte verwerkingsverantwoordelijke ontstaan, met PerfectSupplement als **verwerker**. Dat vraagt:

- **Strikte data-isolatie per `organization_id`** — geen aggregatie of LLM-training **over tenants heen** zonder aparte grondslag. De k-anon-set (3C) moet **per tenant** k halen, niet globaal (anders lekt een kleine tenant via de aggregatie).
- **Verwerkersovereenkomst (DPA) per org** + per-org consent-versionering.
- **Compliance-grens reist mee:** de EFSA-/inname-vs-status-regels gelden onverkort per tenant; een B2B-partner mag de claimgrens niet kunnen verruimen via eigen productdata.

## 4D. Wat bewust NIET nu

- **Geen multi-tenant-uitrol** zolang de B2C-funnel niet bewezen converteert (drempels uit [`PLAN_FUNNEL_DATA_PRIORITY.md`](PLAN_FUNNEL_DATA_PRIORITY.md) DEEL 4).
- **Geen per-org `approvedClaims`/candidates** bouwen vooruitlopend — alleen de **naad** (`organization_id`) bewust intact houden en niet wegoptimaliseren.
- **Geen cross-tenant LLM-training.** Isolatie is de default.
- **Home scan / klinische meting** blijven een apart product/entiteit ([`PLAN_FUNNEL_DATA_PRIORITY.md`](PLAN_FUNNEL_DATA_PRIORITY.md) DEEL 4), niet deze funnel.

---

## Gefaseerde implementatie-volgorde (afhankelijkheden, geen kalenderdata)

1. **P1 ✅ — `nurture.email_sent` met `cta_kind`+`cta_slug`+`candidate_rank`.** Gedaan 10 jun 2026. Kritieke, retroactief-niet-inhaalbare schakel.
2. **P2 ✅ — `affiliate.click` mail-herkomst (spiegel-event).** Gedaan 10 jun 2026. HMAC-attributietoken op `/beste/*`-CTA's; `affiliate.click`-event verrijkt met `session_id`/`sequence_day`/`profile_label`/`variant`. `affiliate_clicks`-tabel ongemoeid.
3. **P4 ✅ — join-key door de funnel borgen.** Gedaan 10 jun 2026. Ruggengraat van de loop.
4. **P3 ✅ — variant-dimensie nullable klaarzetten.** Gedaan 10 jun 2026. Migratie `20260610130000_nurture_variant.sql` (⚠ apply vóór deploy via `supabase db push`).
5. **Meet-loop fase 1** — handmatige A/B + cijfers lezen (DEEL 2). **Ontgrendeld** — alle meet-haakjes (P1–P4) zijn live.
6. **Productkennis-RAG-spoor (DEEL 3A/3B).** Parallel, niet-blokkerend, geen persoonsdata.
7. **Anonimiseringspad + governance-poort (3C).** Bij nadering 500-drempel; blokkeert het persoonsdata-LLM-spoor.
8. **LLM-volgorde-/triggersuggestie (3, fase 2/3).** Alleen ná 7 + volume; output blijft achter de gate.
9. **B2B-naden invullen (DEEL 4).** Alleen ná bewezen B2C-conversie; isolatie + DPA + per-org governance eerst.

**Kritiek pad voor toekomstklaarheid:** **P1 → P2 → P3 → P4** (de meet-haakjes). Alle vier gedaan 10 jun 2026. Meet-loop fase 1 (DEEL 2) is ontgrendeld.

---

## Wat bewust NIET nu (samengevat)

- Geen optimizer / bandit / ranking-model voor productkeuze (échte YAGNI tot volume).
- Geen dynamische herordening van `candidates[]` op live cijfers.
- Geen LLM op persoonsdata vóór 500+ én vóór doorlopen anonimiserings-/governance-poort (3C).
- Geen LLM-gegenereerde claims — claimgrens blijft deterministisch, EFSA-tekst alleen via `getUsableClaims()`.
- Geen aanraking van de `affiliate_clicks`-tabel of de basis-15-vragen-intake.
- Geen multi-tenant-uitrol of cross-tenant aggregatie vóór bewezen B2C-conversie.
- Geen tweede primaire CTA per mail; leefstijl-guard blijft.
- Geen herbouw van bestaand werk (resolver, gate, tier-gate, atomaire cron-claim).

---

## Open beslispunten voor Dennis

1. **P1-payload-omvang:** alleen `cta_kind`+`cta_slug`, of meteen ook `candidate_rank` (welke positie in `candidates[]` won) meegeven? *Aanbeveling: alle drie — `candidate_rank` is gratis bij P1 en maakt later "wint positie 1 altijd?" meetbaar.*
2. **P2 mail→klik-join:** via `session_id` als query-param op de affiliate-link, of via een apart nurture-klik-token? *Aanbeveling: nurture-token — houdt `session_id` uit de URL/affiliate-partner (dataminimalisatie).*
3. **Variant-dimensie (P3):** nu al nullable klaarzetten, of pas bij de eerste test? *Aanbeveling: nu klaarzetten — anders is fase-1-test een schema-wijziging.*
4. **Externe vs eigen LLM** voor het productkennis-spoor: eigen embedding-stack (`evidence_claims.embedding` bestaat al) uitbreiden, of externe API? Bepaalt de zwaarte van G5 (doorgifte aan verwerker).
5. **B2B-tijdlijn:** is white-label een reële horizon (dan `organization_id`-naad streng bewaken) of voorlopig puur theoretisch (dan minimaal investeren)?

---

## Kruisverwijzingen

| Document | Relevantie |
|---|---|
| [`PLAN_FUNNEL_DATA_PRIORITY.md`](PLAN_FUNNEL_DATA_PRIORITY.md) | Funnel-events, dag-0-scharnier, CTA-resolver, horizon-drempels (DEEL 4) — dit plan verdiept de meet-/multi-product-laag |
| [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) | LLM-roadmap §F, productkennis-RAG §C, anonimiseringspad §D, groei-eerst §E |
| [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) | Cross-domein-balansregel, scheefheid-risico |
| [`COMPLIANCE.md`](../core/COMPLIANCE.md) | EFSA-claimgrens, inname-vs-status, affiliate-disclosure, forbidden phrases |
| [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) | `domain_events`, `nurture_emails`, `consent_records`, `organization_id`, `evidence_claims.embedding` |
| [`ARCHITECTURE.md`](../core/ARCHITECTURE.md) | Twee gescheiden datastromen; service_role-grens |
| [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) | Tier-gate, `is_paid`/`tier`, referral-only voor klinische meting |
| [`EMAIL_SYSTEM.md`](../core/EMAIL_SYSTEM.md) | Nurture-sequence, Resend, cron |

---

*Opgesteld: 10 juni 2026. Bijgewerkt: 10 juni 2026 (P1–P4 alle ✅; meet-loop fase 1 ontgrendeld). Planning-document — geen code, geen `src/`-wijziging, geen schema-migratie. Reconstructie + uitbreiding van de eerdere multi-product-/data-readiness-analyse. Pseudostructuur ter illustratie.*
