# Analyse — van supplementengids naar productvergelijkingsplatform

**Datum:** 15 augustus 2026
**Status:** voorstel, nog geen implementatie
**Scope:** `/supplementen`, `/beste/*`, productdatabase, admin-productbeheer, retailerkoppeling, keuzehulp, koppeling Leefstijlcheck

Alles hieronder is gebaseerd op inspectie van de codebase op commit `8b30120`. Wat ik niet
heb kunnen inspecteren staat expliciet als **NIET GEVERIFIEERD** gemarkeerd.

---

## A. Huidige situatie — wat er daadwerkelijk staat

### A1. Routes

| Route | Wat het is | Bron |
|---|---|---|
| `/supplementen` | Hub, server component, `force-dynamic`, personaliseert op intake-cookie | `src/data/supplement-hub/catalog.ts` (8 entries, statisch TS) |
| `/supplementen/[supplement]` | Educatieve gidspagina's, geen affiliate | `src/data/supplement-guides/*.ts` (8 bestanden) |
| `/beste/[supplement]` | Vergelijkingspagina's, wél affiliate | `src/data/supplements/*.ts` (7 bestanden) |

**Er is géén `/product/*`, géén `/vergelijk/*`, géén filterpagina.** Geverifieerd.

### A2. Het productmodel dat nu bestaat

`ComparisonPageData` in [supplement.ts](src/types/supplement.ts) is een **paginamodel**, geen
productmodel. Producten leven ín een pagina-object, niet zelfstandig. Per product:

```
slug, name, brand, affiliateSlug, score, bestFor, variantTag, summary,
specs[], werkzameStof, vorm, doseringPerDagdosis, efsaClaimIds,
voldoetAanClaimConditie, thirdPartyTested, pros[], cons[], breakdown[], imageSrc
```

Harde tellingen:

- **7 categorieën met vergelijking**, 3 producten elk → **21 producten totaal**.
- **1 affiliate-link per product.** `affiliateSlug` is één sleutel naar één URL in
  [affiliate-links.ts](src/data/affiliate-links.ts) (24 links). Multi-retailer bestaat niet.
- **24 productafbeeldingen** in `public/images/producten/`, statische bestanden.
- Melatonine heeft géén vergelijking (`topScore: null`) — terecht, zie §K4.

### A3. De score is niet berekend

Dit is de belangrijkste bevinding. `score` is een handmatig ingetypt getal (schaal 0–10), en
`breakdown[]` is vrije tekst. Een `grep` over alle productdata geeft **13 verschillende
criteriumnamen** voor wat inhoudelijk hetzelfde is:

```
"Transparantie" · "Transparantie (20%)"
"Dosering" · "Dosering/gemak" · "Dosering & eiwitgehalte (30%)"
"Prijs/kwaliteit" · "Prijs-kwaliteit (25%)"
"Biobeschikbaarheid" · "Biobeschikbaarheid (25%)" · "Vormkwaliteit" · "Kwaliteit/vorm"
"EPA/DHA per portie" · "Zuiverheid" · "Extract kwaliteit" · "Gebruiksgemak"
```

Er is **geen scorefunctie in `src/lib/`**. Er is dus ook geen manier om te reproduceren
waarom product X een 8,5 heeft en Y een 8,0. Voor een platform dat zich positioneert als
"de Consumentenbond van supplementen" is dat het grootste geloofwaardigheidsrisico dat er
ligt — en sinds de Omnibus-richtlijn ook een juridisch aandachtspunt (§K2).

### A4. Er is al een rijker productmodel — en het is dood

[supplement-comparison.ts](src/types/supplement-comparison.ts) bevat `SupplementProduct` met
`pricePerContainer`, `pricePerDay`, `priceCategory`, `certifications[]`,
`recommendationProfiles[]`, `overallScore` (0–**100**), `retailer`, `lastVerified`,
`MagnesiumFormDetail[]`. **Geverifieerd: nergens geïmporteerd.** Dood bestand, en het
botst met de gelijknamige type in `supplement.ts` (score 0–10). Dit moet opgeruimd worden,
niet aangevuld met een derde variant.

### A5. Wat er al wél staat en zwaar herbruikbaar is

Dit is waar het project sterker staat dan de opdracht veronderstelt.

**Claim-compliance-motor — `src/data/approved-claims.ts` (419 regels).**
Registry van EFSA-claims met `threshold` (minAmount + unit + nutrient) en
`status: approved | on_hold | forbidden`. Plus `src/lib/claim-condition.ts` en
`withClaimFields()` die per product controleren of de dosering de claimdrempel haalt.
Dit is precies de laag die §14/§25 van de opdracht vraagt, en die bestaat al en werkt.

**PartnerDesk — `pd_*` (17 tabellen).**
`pd_partners` mét `pd_networks`, `pd_contracts` (incl. `cookie_days`, `cancel_by` als
generated column), `pd_commission_rules` (cps_percent/cps_fixed/cpl/cpc/cpa) en
`pd_commission_tiers`. **Dit ís het retailer-model dat §7 van de opdracht vraagt.** De
retailer-entiteit hoeft niet opnieuw gebouwd te worden; er moet één brug naar.

**Admin-shell — `src/components/partnerdesk/` (28 componenten).**
`DeskShell` (collapsible sidebar), `PassportCard`, `InlineField`, `CollapsibleSection`,
`CommandPalette` (⌘K), `StatusBadge`, `EmptyState`, `TimelineSection`. Het professionele
admin-dashboard uit §19 is grotendeels al gebouwd — voor partners in plaats van producten.

**Oordeel-ruggengraat — `supplement_verdicts`.**
Per account per ingrediënt precies één geldig oordeel: `kopen | niet_nodig |
eerst_leefstijl | nooit`, met `based_on` reproduceerbaarheids-snapshot, `rules_version` en
`next_review_at`. Append-only. Dit is de Leefstijlcheck→supplement-brug, en hij bestaat al.

**Aanbevelingsmotor — `src/lib/recommendation-engine.ts` + `src/data/supplement-catalog.ts`.**
Regelgebaseerd, op ingrediëntniveau, met `routeTriggers` (deficiency-signalen, domeindrempels,
profiellabels). Levert een `comparisonPath` op.

**Storage-patroon.** `partner-documents` is een private bucket met signed URLs. Het patroon
staat; een publieke productafbeeldingen-bucket bestaat nog niet.

### A6. Klik-tracking

`affiliate_clicks` (baseline-migratie): `product_id, product_naam, categorie, pagina,
timestamp`. Geen prijs, geen retailer, geen omzet, geen conversie. Fire-and-forget.
CLAUDE.md markeert deze tabel als *niet aanraken*.

---

## B. Gap-analyse

| # | Nodig voor het platform | Status |
|---|---|---|
| 1 | Product als zelfstandige entiteit | **ONTBREEKT** — product leeft in een pagina-object |
| 2 | Berekende, reproduceerbare score | **ONTBREEKT** — handmatig getypt, 13 criteriumnamen |
| 3 | Meerdere retailers per product | **ONTBREEKT** — 1:1 via `affiliateSlug` |
| 4 | Prijs als data (prijs/serving, prijs/effectieve dosis) | **ONTBREEKT** — prijs staat in vrije tekst in `specs[]` |
| 5 | Productdetailpagina | **ONTBREEKT** — geen `/product/*` route |
| 6 | Filters, sortering, vergelijk-selectie | **ONTBREEKT** |
| 7 | Admin-productbeheer | **ONTBREEKT** — `/admin/site` = intake, `/admin/affiliate` = kliklijst |
| 8 | Afbeeldingsbeheer + herkomstregistratie | **ONTBREEKT** — 24 losse bestanden, geen licentieveld |
| 9 | Versheidsbewaking (`last_checked` per facet) | **ONTBREEKT** |
| 10 | Persoonlijke shortlist / stack | **ONTBREEKT** |
| 11 | Keuzehulp per categorie | **ONTBREEKT** |
| 12 | Retailer-entiteit | **BESTAAT** als `pd_partners` — alleen brug nodig |
| 13 | Commissieregels per retailer | **BESTAAT** als `pd_commission_rules` |
| 14 | Claim-compliance per product | **BESTAAT** — moet afdwingbaar worden bij publiceren |
| 15 | Profiel → ingrediënt | **BESTAAT** — `supplement_verdicts` |
| 16 | Ingrediënt → concreet product | **ONTBREEKT** — dít is de ontbrekende schakel |
| 17 | Admin-UI-bouwstenen | **BESTAAT** — `src/components/partnerdesk/` |

Gat 16 is de kern. De hele keten profiel→categorie bestaat; alleen de laatste stap naar
een concreet product ontbreekt. Dat is een kortere afstand dan de opdracht aanneemt.

---

## C. Architectuur — databaseontwerp

### C1. Naamruimte

Vierde `sup_*`-familie naast `pd_*` (upstream partnerbeheer), `af_*` (eigen programma) en
`affiliate_clicks` (legacy, niet aanraken). CLAUDE.md waarschuwt al voor de drie
betekenissen van "affiliate"; `sup_*` is de productcatalogus en raakt die verwarring niet.

RLS **deny-all**, uitsluitend `createSupabaseAdmin()` server-side — hetzelfde patroon als
`pd_*`, `af_*` en `cprofile_*`. Zie §L3 voor het cache-gevolg.

### C2. Productlaag

```sql
sup_brands          (id, slug, name, manufacturer, country, website, logo_path,
                     transparency_note, created_at)

sup_categories      (id, slug, name, parent_id, ingredient_claim_key, description,
                     comparison_path, created_at)
  -- ingredient_claim_key = de brug naar approved-claims.ts en supplement_verdicts

sup_products        (id, slug UNIQUE, brand_id, category_id, name, variant, form,
                     flavour, container_size, container_unit, servings_per_container,
                     serving_size, serving_unit, usage_advice, description,
                     target_audience, country_of_origin, product_url,
                     status ('draft'|'published'|'archived'),
                     data_checked_at, published_at, archived_at, created_at, updated_at)

sup_product_actives (product_id, nutrient_key, form_key, amount_per_serving, unit,
                     is_elemental)
  -- meerdere rijen: EPA + DHA apart; magnesiumvormen apart met percentage
  -- dit is de enige bron voor claimtoetsing én voor prijs-per-effectieve-dosis

sup_product_ingredients (product_id, position, name, is_active, is_additive, is_allergen)
sup_product_certifications (product_id, certification_key)  -- ifos, creapure, ksm66, vegan, gmp
sup_product_claims  (product_id, efsa_claim_id, meets_condition)
sup_sources         (id, product_id, category_id, kind, url, title, checked_at)

sup_product_images  (id, product_id, path, alt, position,
                     source ('own'|'merchant_feed'|'manufacturer'|'licensed'),
                     license_note, checked_at)
  -- source is NOT NULL: geen afbeelding zonder vastgelegde herkomst (§K3)
```

### C3. Scorelaag — bewust gescheiden

```sql
sup_score_models (id, version, weights jsonb, active_from, changelog, notes)
sup_scores       (id, product_id, model_version, total_0_100, subscores jsonb,
                  inputs_hash, computed_at)
sup_badges       (product_id, category_id, badge_key, rank, computed_at)
```

Drie eigenschappen die dit anders maken dan nu:

1. **Berekend, niet ingevoerd.** De admin voert *inputs* in (mg elementair, servings,
   prijs, additieven, third-party test). `computeScore()` in `src/lib/supplement-score/`
   is een pure functie. "Waarom deze score" is dan gratis: de subscores zíjn de uitleg.
2. **Geversioneerd**, zoals `RULES_VERSION` bij de Leefstijlcheck. Een modelwijziging
   herberekent alles en is publiek na te lezen.
3. **Structurele affiliate-firewall.** Het inputtype van `computeScore()` bevat geen
   `retailer_id`, geen `commission`, geen `affiliate_url` — die velden zijn niet
   *bereikbaar* vanuit de functie. Afdwingen met een test naar het model van
   `src/lib/connection-profile/__tests__/firewall.test.ts`, die daar al hetzelfde doet
   voor gezondheidsdata. Dat is §21 van de opdracht als code in plaats van als belofte.

**Schaal wordt 0–100.** De huidige 0–10 met halve punten suggereert precisie die er niet
is; 0–100 is de schaal die het dode type al aannam en die badges beter draagt. Eenmalige
conversie bij backfill.

Voorstel gewichten v1 (`sup_score_models.weights`):

| Component | Gewicht | Bron in data |
|---|---|---|
| Dosering t.o.v. onderbouwde drempel | 30% | `sup_product_actives` × `approved-claims` threshold |
| Vorm/biobeschikbaarheid | 20% | `form_key` per categorie-tabel |
| Transparantie etiket | 20% | volledigheid `sup_product_ingredients`, geen proprietary blend |
| Prijs per effectieve dosis | 20% | `sup_offers` (goedkoopste actieve) ÷ actives |
| Onafhankelijke toetsing | 10% | `sup_product_certifications` |

Gebruiksgemak is bewust **geen scorecomponent** maar een filter — het is een voorkeur, geen
kwaliteit, en het hoort in de keuzehulp (§H), niet in een objectieve ranglijst.

### C4. Retail- en prijslaag

**Uitgangspunt (besluit 15 aug): direct contracteren is de hoofdweg.** PerfectSupplement
sluit zelf contracten met supplementbedrijven. Daisycon en Awin blijven bestaan als
tweede rijstrook voor partijen die nog niet kunnen of willen overstappen. Dat is geen
detail in de datamodellering — het bepaalt wie de conversiedata bezit (§C6).

Geverifieerd: PartnerDesk is hier al op gebouwd. `pd_networks.kind` kent
`'network' | 'direct'`, en **Arctic Blue staat al geseed als `direct`**. De directe
relatie is dus geen uitbreiding maar een bestaande, ondersteunde vorm.

```sql
sup_retailers (id, slug, name, pd_partner_id → pd_partners(id),
               relationship ('direct'|'network'),
               base_url, tracking_param, disclosure_label, active)
  -- pd_partner_id is DE brug: contract, cookieduur en commissieregels blijven in PartnerDesk
  -- relationship stuurt het meetpad: direct = eigen click_token, network = netwerk-subid

sup_offers    (id, product_id, retailer_id, external_sku, product_url, affiliate_url,
               price_cents, list_price_cents, currency, availability,
               discount_code, discount_percent,
               price_checked_at, source ('manual'|'feed'|'api'), active,
               created_at, updated_at,
               UNIQUE (product_id, retailer_id))

sup_offer_price_history (offer_id, price_cents, observed_at)

sup_clicks    (id, click_token UNIQUE, offer_id, product_id, retailer_id,
               page, position, created_at)
  -- click_token is kort en url-safe, gaat mee als subid in de affiliate_url en
  -- komt terug bij de conversie. Dit is wat direct contracteren mogelijk maakt.
```

**De merk-is-ook-verkoper-situatie.** Als je met supplementbedrijven contracteert in plaats
van met webshops, is de verkoper vaak het merk zelf (Arctic Blue verkoopt Arctic Blue).
Model daarom `pd_partners` als *de organisatie* — de juridische wederpartij — en laat zowel
`sup_brands.pd_partner_id` als `sup_retailers.pd_partner_id` daarnaar wijzen. Eén partner,
twee rollen. Vitaminstore is dan alleen retailer, Arctic Blue is merk én retailer.

**Gevolg dat je moet meewegen.** Een merk verkoopt alleen zijn eigen product. Bij een
portfolio van directe merkcontracten is er dus meestal één verkoper per product, en dan
levert het "Waar te koop"-blok met drie prijzen naast elkaar weinig op. De vergelijking
verschuift van *tussen verkopers van hetzelfde product* naar *tussen producten* — en dat is
precies wat het scoremodel al doet. `sup_offers` blijft N-op-1 zodat retailers met
overlappend assortiment het wél kunnen, maar reken in plak 4 op N=1 als normaalgeval.
Dat maakt plak 4 aanzienlijk kleiner dan in de oorspronkelijke opzet.

Afgeleide waarden worden **niet opgeslagen** maar berekend:
`prijs_per_serving = price_cents / servings_per_container`, en
`prijs_per_effectieve_dosis` via `sup_product_actives`. Dat laatste is het getal dat de
vergelijking echt maakt — "€0,18 per 1000 mg EPA+DHA" zegt iets, "€24,95" niet.

`sup_clicks` is nieuw; `affiliate_clicks` blijft ongemoeid en wordt tijdens de overgang
dubbel geschreven.

### C5. Persoonlijke laag — expliciet klein houden

```sql
sup_shortlist (account_id, product_id, category_id, note (≤140), custom_price_cents,
               added_at, chosen_at)
```

**Eén tabel, geen dosering, geen schema, geen timing.** Reden: dosering en timing wonen al
in `agenda_blocks` / `daily_action_log` / het leefstijlplan. Een tweede plek voor "wat neem
ik en wanneer" levert twee waarheden op en breekt de cockpit. De shortlist is een
*keuzelijst*, geen innameregistratie.

Semantisch hangt de shortlist aan `supplement_verdicts`: een verdict `kopen` op een
ingrediënt + een gekozen product uit die categorie = een shortlist-item. Daarmee is de
stack iets dat je *verdient* via de check, in plaats van een losse lijstfunctie. Dat is
tegelijk het sterkste funnelargument.

### C6. Conversie-inname upstream — het echte gevolg van direct contracteren

Geverifieerd: PartnerDesk heeft **geen omzet- of conversietabel**. `grep` op
`revenue|omzet|conversion` in `src/lib/partnerdesk/` geeft nul treffers. Er zijn contracten
en commissieregels, maar niets dat vastlegt wat er daadwerkelijk verdiend is. Bij
netwerkbemiddeling was dat te billijken — je las het af in het netwerkportaal. Bij directe
contracten is het de kern van de relatie, en dus het echte gat.

De vorm ligt al klaar: `af_conversions` + `af_ledger_entries` doen precies dit voor het
eigen programma (geld eruit). Upstream is de spiegel (geld erin), met dezelfde beproefde
eigenschappen: `unique (source, external_id)` voor idempotente import, `raw jsonb` voor de
onbewerkte payload, status `pending|approved|rejected`, en een grootboek met
`rule_snapshot` zodat "waarom dit bedrag" herleidbaar blijft.

```sql
pd_conversions   (id, partner_id, contract_id, click_token → sup_clicks.click_token,
                  external_id, type ('lead'|'sale'), occurred_at, order_ref,
                  revenue_cents, commission_cents, currency,
                  status ('pending'|'approved'|'rejected'),
                  ingest_method ('postback'|'import'|'manual'),
                  raw jsonb, imported_at,
                  UNIQUE (partner_id, external_id))

pd_ledger_entries (id, partner_id, conversion_id, kind ('accrual'|'adjustment'|
                   'reversal'|'payment_received'), amount_cents, expected_cents,
                   state, period 'YYYY-MM', rule_snapshot jsonb, posted_at, note)
```

`click_token` is de winst. Omdat je hem zelf uitgeeft en meestuurt, koppelt een conversie
terug aan de exacte klik — en dus aan product, retailer, pagina en positie. Dat is
attributie op productniveau, wat een netwerk je in deze granulariteit niet geeft.
`expected_cents` komt uit `commission-resolution.ts` (bestaat al, pure functie met volledige
herleiding); het verschil tussen verwacht en ontvangen is meteen je afkeuringssignaal en
past in de bestaande `pd_signals`-laag.

**Innamemethode per contract, in volgorde van voorkeur.** Onderhandel er één, en leg vast
welke: nieuwe kolommen `pd_contracts.reporting_method` en `reporting_cadence`.

1. **Server-to-server postback** — de merchant roept jouw endpoint aan bij orderbevestiging,
   met `click_token` en orderwaarde. Realtime, exact, geen handwerk.
2. **Periodieke export** — maandelijkse CSV, gematcht op `click_token` of `order_ref`.
   Goed genoeg, en veruit het makkelijkst te vragen.
3. **Handmatige invoer** — je typt het maandelijks over uit hun portaal. Terugvaloptie.

Endpoint: `POST /api/partner/conversion` met per partner een gedeeld geheim en
`unique (partner_id, external_id)` als idempotentiegarantie. Er bestaat al een
`src/app/api/partner/`-route en een rate-limiter; het patroon is niet nieuw.

---

## D. `/supplementen` vernieuwd

**BESTAAT AL:** `HubHero`, `SupplementCatalog`, `ThemaGrid`, `RecommendedForYou`,
`NutritionCheckGateCard`, `MedicalDisclaimer`, `Container`.
**AANPASSEN:** categoriekaart toont voortaan productaantal + prijsvork + topscore uit de DB.
**NIEUW:** categoriepagina, filters, vergelijkbalk.

```
/supplementen                       hub — categorieën, thema's, persoonlijke aanbeveling
/supplementen/[categorie]           gids + productlijst + filters   ← wordt de werkpaard-pagina
/beste/[categorie]                  redactionele top-3, blijft bestaan (SEO-equity)
/product/[merk-product]             NIEUW — productdetail, indexeerbaar
/vergelijk/[categorie]?ids=a,b,c    NIEUW — vergelijktabel, noindex
```

Belangrijk: `/beste/*` **niet** vervangen. Die URL's hebben verkeer en autoriteit. Ze worden
de redactionele laag ("onze drie keuzes, met argument"), `/supplementen/[categorie]` wordt
de volledige laag ("alle producten, filterbaar"). Canonical van `/vergelijk/*` en van elke
gefilterde staat wijst naar de categoriepagina.

Let op: `/supplementen` staat nu op `force-dynamic` vanwege de intake-cookie. De nieuwe
categoriepagina's mogen dat **niet** overnemen — die moeten statisch/ISR blijven en de
personalisatie in een gestreamde client-island zetten. Anders verliest de SEO-kant zijn
snelheid precies op de pagina's die verkeer moeten trekken.

Productkaart toont: foto · merk · naam · score/100 · badge · vorm · dosering per dag ·
laagste prijs · **prijs per effectieve dosis** · `[Bekijk]` `[Vergelijk]`.
Op mobiel (375px, de doelgroep) is dat één kolom met de score rechtsboven en de prijs
onderaan vast; filters gaan in een bottom-sheet, niet in een sidebar.

---

## E. Productdetail — pagina, niet modal

De opdracht vraagt om een SuppCo-achtige modal. Mijn advies: **bouw de pagina, niet de
modal.** Een modal is niet indexeerbaar, en de productdetailpagina is juist de grootste
SEO-winst in dit hele plan (21 → N indexeerbare pagina's met unieke inhoud). Een
quick-view-modal kan later als *extra* bovenop dezelfde data, maar de pagina is de bron.

Opbouw van `/product/[merk-product]`:

1. **Kop** — foto's, merk, naam, variant, score/100 met badge, laagste prijs + prijs per
   effectieve dosis, primaire CTA naar de goedkoopste actieve aanbieding.
2. **Waarom deze score** — de vijf subscores met per component één zin die uit de *data*
   volgt ("400 mg elementair magnesium per dagdosering — boven de drempel waarop de
   EFSA-claim geldt"). Geen los geschreven marketingtekst.
3. **Etiket** — actieve stoffen per portie, volledige ingrediëntenlijst, additieven en
   allergenen apart gemarkeerd, gebruiksadvies.
4. **Toegestane claims** — alleen uit `sup_product_claims` waar `meets_condition = true`,
   letterlijk uit `approved-claims.ts`. Bij `on_hold` botanicals (ashwagandha): expliciet
   "hiervoor bestaat geen Europees erkende gezondheidsclaim".
5. **Waar te koop** — tabel per retailer: prijs, prijs/serving, voorraad, `[Bekijk prijs]`,
   plus `Prijs gecontroleerd op <datum>`. Affiliate-disclosure **direct boven de tabel**,
   niet alleen in de footer (§K5).
6. **Bronnen** — `sup_sources` met `checked_at`.
7. **Alternatieven** — 3 producten uit dezelfde categorie, en de link naar de gids.

---

## F. Admin-productbeheer

**NIEUW** als route, **BESTAAT AL** als bouwstenen. Alles binnen `DeskShell`, met
`PassportCard`, `InlineField`, `CollapsibleSection`, `StatusBadge` en `CommandPalette`.

```
/admin/producten              lijst: foto, naam, merk, score, #aanbiedingen, status, versheid
/admin/producten/[slug]       dossier — zelfde vorm als /admin/partners/[slug]
/admin/merken
/admin/categorieen
/admin/retailers              koppelt aan pd_partners
/admin/import                 CSV/feed → mapping → validatie → preview → dubbeldetectie → draft
```

Het productdossier is één pagina met inklapbare secties: Basis · Samenstelling · Etiket ·
Afbeeldingen · Claims (read-only, berekend) · Score (read-only, berekend) · Aanbiedingen ·
Bronnen · Tijdlijn.

**Publiceerpoort.** Dit is het mechanisme dat de type-veiligheid vervangt die we verliezen
door van TS naar DB te gaan. `status → 'published'` is alleen toegestaan als:

- ≥1 afbeelding mét `source` en `license_note`
- alle `sup_product_actives` ingevuld voor de nutriënten van de categorie
- elke gekoppelde `efsa_claim_id` haalt zijn drempel (`meets_condition = true`)
- ≥1 actieve aanbieding met `price_checked_at` < 30 dagen
- ≥1 bron
- score berekend onder het actieve model

Faalt er één, dan toont de admin welke — publiceren kan niet. Dit is geen luxe: het is de
enige structurele garantie dat er geen product live gaat met een claim die het niet waarmaakt.

**Versheidsdashboard** op `/admin/producten`: "⚠️ 14 producten langer dan 90 dagen niet
gecontroleerd", "⚠️ 6 prijzen ouder dan 30 dagen". Query over `data_checked_at`,
`price_checked_at`, `sup_product_images.checked_at`.

---

## G. Affiliate-beheer — in PartnerDesk, niet ernaast

De opdracht vraagt een affiliate-dashboard met kliks, conversies, omzet en commissie per
retailer (§20). Met directe contracten is dat **wél bouwbaar**, en dat is een wezenlijk
andere uitkomst dan bij netwerkbemiddeling. Je bent niet afhankelijk van de vraag of
Daisycon een rapportage-API openstelt; je onderhandelt de rapportageplicht zelf in het
contract (§C6). De data is van jou.

Twee dingen blijven wel staan.

**Het hoort in PartnerDesk, niet in een nieuw dashboard.** Contracten, commissieregels en
resolutie leven daar al. `/admin/programma` is bezet door het eigen programma (downstream).
Upstream omzet hoort op `/admin/partners/[slug]` en op het Vandaag-dashboard, met
`pd_conversions` en `pd_ledger_entries` als bron. Een derde omzetweergave bouwen is precies
de fragmentatie waar CLAUDE.md voor waarschuwt.

**Dekking moet zichtbaar zijn.** Niet elk contract krijgt een postback; sommige worden een
maandelijkse CSV, sommige handwerk. Een dashboard dat €0 toont voor een partner zonder
rapportage is misleidend. Toon daarom per partner de innamemethode en de laatste
inname-datum naast het bedrag — "3 van 7 partners rapporteren automatisch" is een eerlijk en
bruikbaar getal, een totaal zonder dekkingsinformatie niet.

Wat per plak:

- **Plak 1:** `sup_retailers.pd_partner_id` → commissie uit `pd_commission_rules`, één bron.
- **Plak 4:** `sup_clicks` met `click_token` → kliks en doorklikratio per product en
  retailer. Eigen data, direct betrouwbaar, geen externe afhankelijkheid.
- **Plak 4b:** `pd_conversions` + postback-endpoint + `expected_cents` uit
  `commission-resolution.ts`. Verschil verwacht/ontvangen als `pd_signals`-signaal.
- **Later:** uitbetalingsafstemming en boekhoudkoppeling — het `af_financial_events`-patroon
  is er al, maar dat is pas zinvol bij meerdere lopende directe contracten.

Voor de netwerk-rijstrook (`relationship = 'network'`) blijft gelden wat er stond: geen
`click_token`-attributie, grovere data, en **NIET GEVERIFIEERD** of Daisycon/Awin op dit
account rapportage-API's bieden. Die partners krijgen kliks maar geen omzetregel, en dat
verschil moet in de UI zichtbaar zijn in plaats van weggemiddeld.

---

## H. Keuzehulp

**NIEUW.** Regelgebaseerd, per categorie, 3–4 vragen. Geen ML, geen scoring-op-scoring.

```
vorm            poeder | capsule | vloeibaar | geen voorkeur      → filter (hard)
belangrijkst    laagste prijs | transparantie | eenvoud | gemak   → herweging (zacht)
budget          <€15 | €15–25 | €25+                              → filter (hard)
```

Mechanisme: harde antwoorden filteren de kandidaatlijst, zachte antwoorden herwegen
*binnen* het bestaande scoremodel (bijv. "laagste prijs" tilt de prijscomponent van 20%
naar 35%, de rest schaalt evenredig mee). De uitkomst is dus altijd een herordening van
dezelfde objectieve score — nooit een aparte "match-score" die los van de kwaliteit staat.

Dat is bewust: een percentage van 94% dat niets meetbaars uitdrukt ondermijnt de
Consumentenbond-positionering. Toon in plaats daarvan de score én de reden van de
herordening: "Op jouw voorkeur *laagste prijs* komt dit product bovenaan — score 84/100,
€0,14 per dagdosering."

Commissie speelt geen rol; dat volgt automatisch uit de firewall in §C3.

---

## I. Koppeling Leefstijlcheck

De keten bestaat al tot en met de categorie. Alleen de laatste stap is nieuw:

```
Leefstijlcheck  →  intake-engine (domain_scores, deficiency signals, profile label)   BESTAAT
                →  recommendation-engine + SUPPLEMENT_CATALOG (routeTriggers)         BESTAAT
                →  supplement_verdicts (kopen | eerst_leefstijl | niet_nodig | nooit) BESTAAT
                →  sup_categories via ingredient_claim_key                            NIEUW (1 join)
                →  sup_products, gerangschikt op sup_scores                           NIEUW
                →  sup_offers → affiliate                                             NIEUW
```

Twee harde randvoorwaarden.

1. **Alleen bij verdict `kopen`.** Bij `eerst_leefstijl` blijft de bestaande poort staan:
   geen producten tonen, wél de leefstijlactie. Dat is de positionering — "eerst grip op de
   basis" — en die mag niet verwateren zodra er een productdatabase achter hangt. De
   bestaande `supplement-gate.ts` en `supplement-eligibility.ts` blijven de poortwachter.

2. **Geen koop- of affiliate-oppervlak in het dashboard.** Vastgelegd besluit van 23 juli
   (`ANALYSE_DASHBOARD_HOME_EN_COCKPIT_IA.md`). De persoonlijke productaanbeveling leeft op
   `/supplementen` en op de categoriepagina's, niet in de cockpit. Het dashboard mag hooguit
   linken.

Claim-taal blijft lopen via `approved-claims.ts`. De verdict-motor levert geen diagnose en
mag dat ook niet gaan doen zodra er producten aan hangen.

---

## J. Roadmap — verticaal per plak

De opdracht stelt zes horizontale fasen voor (DB → admin → frontend → affiliate →
personalisatie → integratie). Mijn advies is dat níet te doen: dan is er pas na vijf lagen
iets zichtbaar, en fase 3 kan niets tonen tot fase 2 gevuld is. Voor één bouwer is dat een
half jaar zonder verifieerbaar tussenresultaat.

In plaats daarvan: elke plak is los reviewbaar en levert werkende waarde.

**Plak 0 — Contract-bijlage ontwerpen, geen code (~1 dag).**
Niet langer een go/no-go op een externe feed, maar iets dat je zelf in de hand hebt: één
standaard **data-bijlage** bij het partnercontract, die je bij elke onderhandeling
meeneemt. Vier clausules:

1. **Productdata** — toestemming om naam, EAN, etiket, ingrediënten en dosering te gebruiken
   in vergelijkingen, plus een afgesproken kanaal (feed, API of periodieke export).
2. **Beeldrecht** — expliciete licentie op productafbeeldingen voor redactioneel en
   vergelijkend gebruik. Dit vervangt de onzekerheid van §K3 door een handtekening.
3. **Prijsactualiteit** — hoe je prijswijzigingen doorkrijgt en binnen welke termijn.
   Dit is de mitigatie voor het prijsverval-risico (§L2) aan de bron.
4. **Conversierapportage** — postback, periodieke export of handmatig, plus cadans.
   Landt in `pd_contracts.reporting_method` (§C6).

Daarnaast de technische spec voor de directe partner: hoe `click_token` in de URL wordt
meegegeven en teruggestuurd. Eén pagina, hergebruikbaar per partner.

Dit is geen blokkade meer maar een voorbereiding — en dat is de belangrijkste winst van het
besluit om zelf te contracteren: het pad hangt niet meer af van wat een netwerk toevallig
toestaat.

**Plak 1 — Schema + scoremotor + backfill.**
`sup_*`-migratie, `computeScore()` als pure functie met tests, firewall-test, script dat de
21 bestaande producten uit `src/data/supplements/*.ts` naar de DB schrijft. `/beste/*` gaat
lezen uit een DB-loader met identieke output. Dode `supplement-comparison.ts` opruimen.
Nul zichtbare verandering — dat is precies wat het verifieerbaar maakt.

**Plak 2 — Admin-productbeheer.** CRUD + publiceerpoort + versheidsoverzicht in `DeskShell`.
Vanaf hier kun je producten toevoegen zonder code te schrijven. Dit is het moment waarop
het platform schaalbaar wordt.

**Plak 3 — Productdetailpagina + afbeeldingspijplijn.** Supabase Storage bucket,
`next/image`, herkomstregistratie. De SEO-unlock.

**Plak 4 — Retailers + aanbiedingen + "Waar te koop" + `click_token`.** Prijs per
effectieve dosis, versheidsbewaking, `sup_clicks` met uitgegeven token. Kleiner dan
oorspronkelijk begroot: bij directe merkcontracten is N=1 verkoper per product het
normaalgeval (§C4), dus de multi-retailer-UI mag minimaal blijven tot er retailers met
overlappend assortiment bij komen.

**Plak 4b — Conversie-inname.** `pd_conversions` + `pd_ledger_entries` +
`POST /api/partner/conversion` + verwacht-versus-ontvangen als `pd_signals`. Direct na
plak 4 omdat het token dan al loopt; zonder deze plak blijft de directe relatie half.

**Plak 5 — Categoriepagina, filters, vergelijken (2–4 producten).**

**Plak 6 — Keuzehulp.**

**Plak 7 — Shortlist op verdicts.**

MVP = plak 0 t/m 4b. Dan heb je: echte productdata, berekende scores, beheer zonder code,
indexeerbare productpagina's, én — dankzij het eigen contract — conversie-attributie tot op
productniveau. V2 = plak 5–6. V3 = plak 7.

**Uitgesteld, met reden:** uitbetalingsafstemming en boekhoudkoppeling (pas zinvol bij
meerdere lopende contracten), quick-view-modal (de pagina eerst), gebruikersreviews (§K6),
en uitbreiding voorbij ~80 producten (§L5).

---

## K. Juridische aandachtspunten — als ontwikkelrichtlijn

Geen juridisch advies; dit zijn bouwregels.

**K1 — SuppCo als bron.**
Toegestaan: dezelfde producten zélf onderzoeken, publieke productinformatie (etiket, EAN,
fabrikantdata) verzamelen, eigen score, eigen tekst, eigen ranglijst.
Niet doen: teksten of beschrijvingen overnemen, hun ranglijst of scores kopiëren, hun
afbeeldingen gebruiken, hun UI 1-op-1 nabouwen.
De scherpste grens is het **databankenrecht** (Databankenwet / richtlijn 96/9/EG): het
systematisch opvragen van een substantieel deel van hun database is inbreuk, óók als je
alle teksten herschrijft. Een top-10 gebruiken als startpunt voor wat je zelf gaat
onderzoeken is dat niet. Praktische toets bij elk product: *zou ik dit product ook hebben
opgenomen als ik SuppCo nooit had gezien?* Leg per product de eigen bron vast in
`sup_sources` — dat is meteen het bewijs.

**K2 — Rangschikkingstransparantie, en waarom die nu zwaarder weegt.** Sinds de
Omnibus-richtlijn (art. 6:193b BW) moet je bij een ranglijst de belangrijkste
rangschikkingsparameters bekendmaken, en betaalde plaatsing die de rangschikking beïnvloedt
expliciet vermelden. Concreet: op elke lijstpagina een zichtbare link naar `/methodologie`
met de gewichten en de modelversie — niet in de footer. De huidige `/methodologie` is 57
regels en noemt geen gewichten; die moet mee met plak 1.

Direct contracteren maakt deze verplichting **scherper, niet losser**. Je gaat een
rechtstreekse commerciële relatie aan met bedrijven wier producten je beoordeelt. Dat is
toegestaan en gebruikelijk, maar het verhoogt de bewijslast dat de beoordeling onafhankelijk
is. Drie consequenties voor de bouw:

- Per product zichtbaar maken dát er een commerciële relatie is, waar die er is — niet
  alleen generiek in `/affiliate-disclosure`.
- De firewall-test uit §C3 is hier het bewijsmiddel: hij toont aan dat het scoremodel
  commissiegegevens niet kan lezen. Die test is nu geen nettigheid meer maar documentatie.
- Producten van niet-partners moeten kunnen meedoen en kunnen winnen. Een lijst die
  toevallig alleen uit partners bestaat is juridisch verdedigbaar maar redactioneel
  onhoudbaar voor "de Consumentenbond van supplementen". Leg per categorie vast hoeveel
  niet-partnerproducten er in de vergelijking zitten, en bewaak dat als redactionele norm.

**K3 — Afbeeldingen.** `sup_product_images.source` is verplicht. Eigen foto's en
fabrikant-assets met toestemming zijn veilig; feed-afbeeldingen mogen doorgaans alleen ter
promotie van díe merchant — vastleggen in `license_note`. Scrapen en herpubliceren: nooit.
Merknamen en logo's mogen beschrijvend gebruikt worden (refererend merkgebruik), niet op een
manier die een band met het merk suggereert.

Bij directe contracten wordt dit grotendeels een opgelost probleem: clausule 2 van de
data-bijlage (plak 0) regelt de beeldlicentie expliciet. Voor de netwerk-rijstrook blijft de
oude onzekerheid gelden, dus `source` en `license_note` blijven verplichte velden — het
verschil tussen de twee rijstroken moet in de data zichtbaar zijn, niet in iemands geheugen.

**K4 — Gezondheidsclaims (Vo. 1924/2006).** Loopt al goed via `approved-claims.ts`. Twee
punten die de productdatabase erbij haalt: (a) een productnaam of -beschrijving mag zelf
geen niet-toegestane claim bevatten — check bij publiceren, niet achteraf; (b) botanicals
met `on_hold` status (ashwagandha) krijgen géén claim, ook geen omschreven variant.
Melatonine verdient aparte behandeling: boven een bepaalde dagdosering valt het niet meer
onder de warenwetgeving maar onder de geneesmiddelenwetgeving. Dat is waarschijnlijk de
reden dat er geen melatonine-vergelijking is — houd dat zo, en leg de grens vast als
categorie-eigenschap in plaats van als impliciete afwezigheid.

**K5 — Affiliate-disclosure.** Direct bij of boven de links, niet uitsluitend op
`/affiliate-disclosure`. `SupplementDisclosure` bestaat al en moet mee naar elke nieuwe
plek: productdetail, "Waar te koop", categoriepagina, keuzehulpuitkomst.

**K6 — Reviews en structured data.** `Product`-schema mag. `AggregateRating` op basis van je
eigen redactionele score is riskant — gebruik `Review` met `author` = Organization
PerfectSupplement, en verzin nooit gebruikersbeoordelingen. Gebruikersreviews toevoegen
brengt moderatieplichten onder de DSA met zich mee en de verplichting te melden hoe je
verifieert dat reviews echt zijn (art. 6:193c lid 2 BW) — daarom uitgesteld tot na V3.

**K7 — Prijzen.** Een getoonde prijs die niet klopt is een misleidende omissie. Daarom:
`price_checked_at` altijd zichtbaar, en aanbiedingen ouder dan een drempel tonen geen
bedrag maar "prijs controleren bij retailer". Dat is één `if`, en het dekt het hele risico.

**K8 — Privacy.** `sup_shortlist` is accountgebonden en valt onder de bestaande
AVG-opruimroutines; opnemen in `cleanup_intake_session_linked_data()` of het
account-equivalent. Geen PII in `sup_clicks`. Klik-tracking blijft achter de bestaande
consent-laag.

---

## L. Technische risico's

**L1 — Onderhandelingsafhankelijkheid (vervangt de feedafhankelijkheid).** Het risico is
niet weg, het is verplaatst — en het is nu een risico dat je kunt beïnvloeden in plaats van
ondergaan. Data, beeldrecht en conversierapportage komen uit contractclausules, en een
partner kan die weigeren. Mitigatie: de data-bijlage is standaard en gaat mee vanaf het
eerste gesprek, niet als naheffing. Bouw daarnaast elke laag zo dat hij degradeert in plaats
van breekt: geen conversierapportage → alleen kliks; geen prijsfeed → handmatige prijs met
zichtbare `price_checked_at`; geen beeldlicentie → geen afbeelding en dus geen publicatie
(de poort uit §F vangt dat af).

Tweede orde: directe contracten kosten *jouw tijd* per partner, waar een netwerk er tien
tegelijk ontsluit. Bij 8 categorieën en een portfolio van 60–80 producten is dat een
overzichtelijk aantal wederpartijen — maar het is de reden om de breedte begrensd te houden
(§L5), niet alleen het onderhoud van de data.

**L2 — Prijsverval.** Handmatig onderhouden prijzen verouderen binnen weken en dat raakt
precies de geloofwaardigheid die het hele merk draagt. Mitigatie in twee lagen: clausule 3
van de data-bijlage regelt het aan de bron, en `price_checked_at` + automatisch verbergen +
versheidsdashboard vangen op wat daar doorheen glipt. De tweede laag moet er ook zijn als de
eerste geregeld is — een contractafspraak is geen technische garantie.

**L3 — Service-role reads op SEO-pagina's.** `sup_*` is deny-all, dus elke productpagina
leest via de admin-client. Zonder cache betekent dat een Postgres-hit per pageview op
precies de pagina's die verkeer moeten dragen. Geverifieerd: `unstable_cache` en
`revalidateTag` worden nu **nergens** in `src/` gebruikt. Mitigatie: gecachte loaders met
tags, `revalidateTag` bij publiceren vanuit de admin. Dit hoort in plak 1, niet later —
achteraf cachen bovenop bestaande loaders is veel duurder.

**L4 — Verlies van compile-time veiligheid.** Nu geeft een verkeerde `affiliateSlug` een
build failure. In de DB niet. De publiceerpoort (§F) is de vervanging; die moet in dezelfde
plak als de migratie, niet erna.

**L5 — Contentschuld.** Dit is het onderschatte risico. Elk product is doorlopend onderhoud:
prijs, formule, beschikbaarheid, afbeelding. 500 producten met één beheerder verrotten
binnen een kwartaal, en een verrotte database ondermijnt de Consumentenbond-positionering
harder dan een kleine database dat ooit zou doen. **Advies: 21 → 60 à 80 producten over 8
categorieën, en dat expliciet als redactionele keuze presenteren** — "wij nemen alleen
producten op die de toets doorstaan" is een sterker onafhankelijkheidsverhaal dan "wij
hebben alles", én het is houdbaar. Breedte is hier geen moat; de Leefstijlcheck is dat.

**L6 — Typebotsing.** Twee `SupplementProduct`-types, waarvan één dood. Opruimen in plak 1,
geen derde toevoegen.

**L7 — Scoremodelwijziging = ranglijstwijziging.** Elke gewichtsaanpassing verandert alle
ranglijsten, met SEO-volatiliteit en vertrouwensschade tot gevolg. Daarom
`sup_score_models.version` + publieke changelog op `/methodologie`, hetzelfde patroon als
`RULES_VERSION`.

**L8 — `force-dynamic` besmetting.** Zie §D.

---

## M. Concreet — wat waar verandert

### Nieuwe migraties
```
supabase/migrations/2026xxxx_sup_catalog.sql     brands, categories, products, actives,
                                                 ingredients, certifications, claims,
                                                 sources, images
supabase/migrations/2026xxxx_sup_scoring.sql     score_models, scores, badges
supabase/migrations/2026xxxx_sup_retail.sql      retailers, offers, price_history,
                                                 clicks (incl. click_token)
supabase/migrations/2026xxxx_pd_conversions.sql  pd_conversions, pd_ledger_entries,
                                                 pd_contracts.reporting_method/-cadence
supabase/migrations/2026xxxx_sup_shortlist.sql   shortlist (pas bij plak 7)
```
Uitvoeren via Supabase Dashboard SQL Editor, nooit `supabase db push`.

### Nieuwe lib
```
src/lib/supplement-score/compute.ts              pure functie, kent geen affiliate-velden
src/lib/supplement-score/weights.ts              modelversies
src/lib/supplement-score/__tests__/firewall.test.ts
src/lib/supplement-catalog-db/queries.ts         gecachte loaders (unstable_cache + tags)
src/lib/supplement-catalog-db/actions.ts         admin-mutaties + publiceerpoort
src/lib/supplement-catalog-db/publish-guard.ts
src/lib/supplement-offers/price.ts               prijs/serving, prijs/effectieve dosis, versheid
src/lib/supplement-offers/click-token.ts         token uitgeven + in affiliate_url injecteren
src/lib/partnerdesk/conversion-ingest.ts         postback/import → pd_conversions (idempotent)
src/lib/partnerdesk/upstream-ledger.ts           accrual uit commission-resolution.ts
```

### Nieuwe routes
```
src/app/supplementen/[categorie]/page.tsx        (let op: bestaande [supplement] herzien)
src/app/product/[slug]/page.tsx
src/app/vergelijk/[categorie]/page.tsx           noindex
src/app/admin/(desk)/producten/page.tsx
src/app/admin/(desk)/producten/[slug]/page.tsx
src/app/admin/(desk)/merken/page.tsx
src/app/admin/(desk)/retailers/page.tsx
src/app/admin/(desk)/import/page.tsx
src/app/api/partner/conversion/route.ts          postback-endpoint, gedeeld geheim per partner
```

### Aanpassen
```
src/components/partnerdesk/DeskShell.tsx         nav: Producten, Merken, Retailers
src/app/methodologie/page.tsx                    gewichten + modelversie publiceren (K2)
src/data/supplement-hub/catalog.ts               topScore uit DB i.p.v. uit statische data
src/components/supplements/ProductCard.tsx       score 0–100, prijs/effectieve dosis
src/components/supplements/AffiliateLink.tsx     offer_id meegeven aan sup_clicks
src/lib/supplement-verdict.ts                    verdict → categorie → producten
```

### Verwijderen
```
src/types/supplement-comparison.ts               dood, botst met supplement.ts
```

### Ongemoeid
```
affiliate_clicks                                 CLAUDE.md-lock
pd_*, af_*, cprofile_*                           andere domeinen
src/data/approved-claims.ts                      blijft de claim-bron
src/lib/recommendation-engine.ts                 blijft op ingrediëntniveau
```

### Meetpunten (meet-standaard)
Nieuwe events, te registreren in `src/lib/events.ts` +
`src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`:
`product_view`, `product_compare_add`, `offer_click`, `keuzehulp_start`,
`keuzehulp_complete`, `shortlist_add`. Hergebruik bestaande affiliate-klik-events waar
mogelijk in plaats van nieuwe te verzinnen.

---

## Openstaande beslissingen

1. **Wederpartij** — contracteer je met *merken* (Arctic Blue-model: verkoopt alleen eigen
   producten, hoge commissie, geen prijsvergelijking) of met *webshops* (Vitaminstore-model:
   breed assortiment, prijsvergelijking mogelijk, lagere commissie)? Dit bepaalt hoeveel
   `sup_offers` en de "Waar te koop"-module waard zijn. Zie §C4.
2. **Breedte** — akkoord met 60–80 producten in plaats van een open catalogus? (§L5)
3. **Scoreschaal 0–100** — akkoord met de conversie van de huidige 0–10?
4. **Detailpagina vóór modal** — akkoord dat de modal V2 wordt? (§E)
5. **Niet-partnernorm** — hoeveel producten zonder commerciële relatie moeten er minimaal in
   elke categorievergelijking staan? Redactionele keuze met juridische weerslag. (§K2)

---

## Wijzigingslog

**15 aug 2026** — Besluit Dennis: PerfectSupplement sluit zélf contracten met
supplementbedrijven; Daisycon/Awin worden de tweede rijstrook voor partijen die (nog) niet
kunnen overstappen. Herzien: §C4 (relationship + merk-als-verkoper), nieuw §C6
(conversie-inname upstream), §G (omzetdashboard wél bouwbaar, in PartnerDesk), plak 0
(contract-bijlage i.p.v. feed-go/no-go), nieuw plak 4b, §K2/§K3 (scherpere disclosure,
beeldrecht via contract), §L1 (onderhandelings- i.p.v. feedafhankelijkheid).
