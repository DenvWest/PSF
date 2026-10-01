# Audit affiliate-dashboard, productbeheer en PartnerDesk

**Datum:** 1 oktober 2026
**Status:** **Nulmeting + voorstellen. Niets hierin is besloten.** §15–§20 zijn voorstellen; Dennis accepteert of verwerpt per punt. Waar dit document een eerder besluit raakt, staat dat in §0. Open beslispunten: bijlage B.
**Opdracht:** diepgaande audit van het affiliate-dashboard, het admin-productbeheer (§F), de PartnerDesk-koppeling en de upstream-omzet (§G), met de keten product → aanbieding → retailer → partner → klik → conversie → commissie → omzet → rapportage. "Eerst audit, geen code wijzigen."
**Repo-stand:** `main` = `origin/main` @ `5c6be8b8` (t/m #91, plak D). Alle relevante PR's staan op `main`: #56 (kliktoken + conversie-inname), #58 (§G omzet), #61–#68 (§F), #87 en #91 (hub en productpagina uit de DB). Of alles gedeployed is, ziet de repo niet. `sup_clicks` heeft pas rijen vanaf 1 okt 2026 02:41 UTC.
**Methode:** code gelezen als bron van waarheid. Relevante testsuites gedraaid (31 bestanden, 261 tests, groen). **Read-only** tellingen op de gekoppelde Supabase-database via `npx supabase db query --linked` (dezelfde route als `npm run check:db-schema`) op 1 okt 2026: alleen aantallen, statussen, datums en bedragen, geen contactpersonen of andere persoonsgegevens (queries in bijlage A). **Er is geen code, schema of data gewijzigd.** Niet ingezien: server-env (o.a. `SENTRY_DSN`), het Daisycon-portaal, cron-job.org en GA4.
**Labels:** `[FEIT]` = geverifieerd in code of database · `[OORDEEL]` = analyse · `[AANNAME]` = niet geverifieerd · `UNKNOWN` = niet vast te stellen vanuit repo/DB.

> **Leeswijzer.** Weinig tijd: §0 (besluiten), §1 (samenvatting + statusmatrix) en §20 (volgende stap). Bewijs per bevinding staat als `pad:regel`.

---

## Begrippen — gebruikt in het hele document

**Drie betekenissen van "affiliate"** (CLAUDE.md), hier strikt gescheiden:

| Term | Betekenis | Tabellen |
|---|---|---|
| **Uitgaande klik** | Bezoeker klikt van perfectsupplement.nl naar een winkel | `affiliate_clicks` (legacy, niet aanraken), `sup_clicks` (nieuw) |
| **Upstream partner** | Merchant/merk dat ons commissie betaalt, direct of via een netwerk | `pd_*` (PartnerDesk) |
| **Downstream affiliate** | Partij die de Leefstijlcheck promoot en die wíj betalen | `af_*` (eigen programma, op de stoplijst) |

**Geldbegrippen.** Deze worden in de code nu deels door elkaar gebruikt (zie §5.5):

| Begrip | Definitie | Waar het nu staat `[FEIT]` |
|---|---|---|
| **Orderwaarde** | Bedrag van de bestelling bij de winkel. Is de omzet van de partner, niet die van ons. | `pd_conversions.revenue_cents` (UI: "Orderbedrag") |
| **Verwachte commissie** | Wat wij volgens onze contractregels zouden moeten krijgen | `pd_conversions.commission_cents`, berekend bij inname |
| **Gerapporteerde commissie** | Wat de partner of het netwerk zegt te betalen | Geen veld. Wordt bij goedkeuren ingetypt als "Ontvangen commissie" |
| **Pending commissie** | Conversie nog niet beoordeeld | `pd_conversions.status = 'pending'` |
| **Goedgekeurde commissie** | Door ons beoordeeld en geboekt | `pd_ledger_entries` (`kind='accrual'`, `state='approved'`) |
| **Afgekeurde commissie** | Partner of wij keuren af | `status='rejected'` + accrual van 0 tegen het verwachte bedrag |
| **Geannuleerde commissie** | Later teruggedraaid (retour, annulering na goedkeuring) | **Bestaat niet** |
| **Ontvangen (uitbetaalde) commissie** | Geld daadwerkelijk op onze rekening | **Bestaat niet.** `payment_received` en `state='paid'` worden upstream nergens geschreven |
| **Netto opbrengst** | Ontvangen commissie minus kosten (netwerkfee, btw-effect) | **Bestaat niet** |
| **Onze affiliate-omzet** | = ontvangen commissie, níet de orderwaarde | — |

---

## 0. Bestaande besluiten die deze audit raakt — lees dit eerst

CLAUDE.md schrijft voor om eerst `docs/plan/` te doorzoeken en conflicten te melden vóór een eigen plan. Doorzocht op affiliate, PartnerDesk, §F/§G, omzet, commissie, publiceerpoort, klik, multitenancy en stoplijst:

| Besluit | Bron | Kern | Gevolg voor deze audit |
|---|---|---|---|
| Upstream-omzet hoort **in PartnerDesk**: partnerdossier + Vandaag, geen nieuw dashboard ernaast | `ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` §G | "Een derde omzetweergave bouwen is precies de fragmentatie waar CLAUDE.md voor waarschuwt" | Het gevraagde "affiliate-dashboard" adviseer ik als PartnerDesk-weergave, de al geplande F3-`/rapportages` uit `PLAN_AFFILIATE_PLATFORM_IMPLEMENTATIE.md` §5.8. **Een losse dashboardpagina zou van dit besluit afwijken.** |
| Publiceerpoort = harde blokkade, geen wegklikbare waarschuwing | `BESLUIT_PRODUCTPLATFORM_ADMIN_2026-09.md` §1 | 6 criteria, server-side opnieuw uit de DB berekend | Behandeld als invariant. Deze audit vindt dat de poort op de live catalogus **niet geldt** (§4.2). |
| Scoredekking: zachte waarschuwing onder 75 % | idem §3 | Publiceren blijft mogelijk | Ongewijzigd overgenomen |
| `relationship` niet bewerkbaar; contract, cookieduur en commissie alleen in PartnerDesk | idem §4 | — | Gerespecteerd |
| Focusfilter met **affiliate-omzet als meetlat**; `af_*` op de stoplijst | Focusfilter toegepast in `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md:48` en `BESLUIT_IJZER_CALCIUM_2026-09.md:92`; stoplijst in `docs/research/VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md` §B3 | Vraag 2 van het focusfilter: "is het effect binnen 30 dagen af te lezen in organische sessies of affiliate-omzet?" | De aanbevelingen gaan alleen over meetbaarheid en integriteit, er zit geen `af_*`-werk in. **Spanning:** de meetlat "affiliate-omzet" bestaat in het systeem niet (§1). |
| PartnerDesk: "niet nu, met trigger" (15 aug) vs. "afmaken" (30 aug) | Verdict 15 aug (artifact; de trigger > €2.000/mnd of > 5 partners staat **niet** in `docs/plan/`); `VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md` §B ("PartnerDesk afmaken") | Twee adviezen die schuren | Omzet meetbaar maken valt onder de focusmetric; verdere PartnerDesk-features niet (beslispunt B-6) |
| Multi-tenancy niet bouwen; `pd_*`/`af_*` bewust mono, geen `org_id` "voor de zekerheid" | `VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md` A1/A5; `ARCHITECTUUR_AFFILIATE_AUTOMATISERING.md` §0.1 | — | §12 adviseert geen `tenant_id` |
| `affiliate_clicks` niet aanraken | CLAUDE.md "Database" | — | Dual-write blijft. Ik adviseer geen index of kolom op deze tabel. |
| Arctic Blue `sld=` niet vervangen; subid-formaat zoals `ashwagandha-vergelijking` | CLAUDE.md "Affiliate links" | — | **Raakt §15/§18.** Klik-attributie via een netwerk vraagt een subid per klik. Dat botst met de huidige conventie (`ws=<categorie>`), tenzij Daisycon een tweede subid-parameter heeft → beslispunt B-1. |
| Kliktoken in de URL bewust uitgesteld tot het parameterformaat per partner bevestigd is | `src/lib/supplement-catalog-db/register-click-client.ts:9-14` | — | Dit is nu de blokkerende open vraag (BLOCKER B2) |
| `/admin/import` niet naar voren halen | Opdracht | — | Bestaat al in basisvorm (#67). Ik adviseer geen uitbreiding. Let op: **conversie-import** (PartnerDesk, nodig) ≠ **productimport** (`/admin/import`, niet uitbreiden). |
| Partnergeheim hashen (N9) | `AUDIT_ARCHITECTUUR_SCHAAL_B2B_2026-09.md` §8 / N9 | #82 deed alleen `timingSafeEqual`; hashen bewust uitgesteld | Staat nog open (§9, S1) |
| Allowlist op raw-payloads en klikretentie 13 maanden vóór fase 3 | `COMPLIANCE_AUDIT_AFFILIATE_PLATFORM.md` (stap 12, D3/R5) | "Retentie is code" | Niet uitgevoerd voor `pd_conversions.raw`, `sup_clicks` en `af_clicks` (§9, §10) |
| Admin-MFA: TOTP gebouwd, actief alleen met `ADMIN_TOTP_SECRET` | `AUDIT_ARCHITECTUUR_SCHAAL_B2B_2026-09.md` N8; `src/lib/admin-auth.ts:13-26` | Activering op de server: `UNKNOWN` (eerdere afspraak: bewust nog niet aan; trigger = 2e admin of meer betalingsrisico) | Met omzetregistratie groeit het betalingsrisico → trigger nadert (§9, S4) |

**Feitelijke correcties op eerdere documenten en op de opdracht** (geen besluiten):

1. `AUDIT_ARCHITECTUUR_SCHAAL_B2B_2026-09.md` r.149 en r.513 beschrijven de keten "kliktoken → partner meldt terug via `/api/partner/conversion`" als bestaand, en noemen het upstream-partnerschap "Nu ✅". **In de code gaat het token nooit mee naar de partner** (§7.1). Dat deel van de keten bestaat dus niet.
2. `docs/partners/SPEC_CLICK_TOKEN_TRACKING.md` zegt nog "nog niet geïmplementeerd" en "200 ook als `click_token` niet gevonden wordt". De code bestaat inmiddels, maar geeft bij een onbekend token een **500** (FK-fout, §5.3).
3. In de opdracht staat dat `/admin/import` nog niet bestaat. Het bestaat (#67: CSV met vaste kolommen, alles als concept).
4. In de opdracht heeft het productdossier een sectie "Tijdlijn". **Die bestaat niet.** Het dossier heeft: Publiceerpoort, Basis, Samenstelling, Etiket, Afbeeldingen, Claims, Score, Aanbiedingen, Bronnen (`src/app/admin/(desk)/producten/[slug]/page.tsx:31-41`).
5. In de opdracht staan "de 3 partners uit de eerdere plak". In productie staan er 5 (`arctic-blue`, `mollers`, `thorne`, `vitalnutrition`, `vitaminstore`). Drie daarvan zijn aan een retailer gekoppeld.
6. "PartnerDesk-ID", "PartnerDesk-conversion" en "PartnerDesk-credentials" bestaan niet. PartnerDesk is onze eigen backoffice, geen trackingnetwerk. Conversies komen van Daisycon (netwerk), van een partner (postback) of van handmatige invoer. De enige "credential" is `pd_partners.webhook_secret` voor de postback.

---

## 1. Executive Summary

### Antwoord op de hoofdvraag

> *Kan ik op basis van de huidige implementatie betrouwbaar zien hoeveel affiliate-omzet er gegenereerd wordt, waar die vandaan komt, bij welke retailer/partner, via welk product/aanbod, via welke klik/conversie, en hoeveel commissie daaruit voortkomt?*

**Nee.** Op geen van die dimensies. Er is één uitzondering: het **aantal uitgaande kliks** per pagina, product en categorie, en dat is een ondergrens omdat er alleen met marketingtoestemming wordt geklikt. `[FEIT]` Waarom niet:

1. **Er staat geen enkele conversie in het systeem.** `pd_conversions` en `pd_ledger_entries` zijn leeg (1 okt). 24 van de 25 aanbiedingen en alle 5 geregistreerde `sup_clicks` lopen via **Daisycon**. Daarvoor bestaat geen inname: geen API, geen import, geen postback. De echte conversies en commissies staan alleen in het Daisycon-portaal.
2. **De koppeling klik → conversie is in de huidige bouw onmogelijk.** Het `click_token` wordt aangemaakt en opgeslagen (`sup_clicks`), maar gaat nooit mee naar de partner. De link is de statische URL uit `src/data/affiliate-links.ts`, en het token wordt via `sendBeacon` alleen server-side bewaard. Bovendien is de Daisycon-subid de *categorie* (`ws=vitamine-d`) en niet de klik.
3. **Het directe pad is niet geconfigureerd.** Arctic Blue (de enige `direct`-retailer) heeft geen contract, geen commissieregel, geen rapportagemethode en geen postback-geheim. Geen enkele partner heeft een `webhook_secret`, dus de postback is voor niemand bruikbaar.
4. **De verwachte commissie is voor de grootste partner niet te berekenen.** Vitaminstore (17 van de 25 aanbiedingen) heeft geen contract en geen regel → `commission_cents = null`. Er is geen signaal dat dit meldt.
5. **De statuslevenscyclus is onvolledig.** Er is geen pad voor annulering of retour na goedkeuring, en "ontvangen/uitbetaald" bestaat niet.
6. **De rapportage is gefragmenteerd en kapt totalen af.** Er zijn drie losse weergaven. Upstream-omzet heeft geen periodefilter en geen productdimensie, en de totalen worden stil afgekapt (200 conversies / 1000 grootboekregels per partner, 1000 rijen in het klikdashboard).

### Waar staan we

| Laag | Kort oordeel |
|---|---|
| **Productbeheer (§F)** | De beheer-UI is breed gebouwd en werkt: lijst, dossier, merken, categorieën, retailers, CSV-import, score-invoer. De publiceerpoort klopt als server-side check bij de statusovergang. **Maar 0 van de 25 live producten voldoet eraan.** 24 missen een licentie-notitie, 24 een bron, 4 een actieve verse aanbieding en 1 heeft 0 mg werkzame stof. De backfill zette ze rechtstreeks op `published`, en die route kan dat opnieuw doen. Na publicatie bewaakt niets de poort. |
| **PartnerDesk / §G** | Er staat een skelet: inname (postback + handmatig), beoordeling met optimistische claim, een grootboek met accruals, een dekkingslabel en twee omzetsignalen. **Nooit met echte data gebruikt.** De dagelijkse signaal-sync zet de omzetsignalen elke dag weer op "opgelost" (bug). |
| **Kliktracking** | Eén klik wordt op 6 plekken vastgelegd (2× GA4, Clarity, `affiliate_clicks`, `domain_events`, `sup_clicks`), zonder gedeelde klik-ID. Het token bereikt de partner niet. |
| **Affiliate-dashboard** | Drie weergaven: `/admin/affiliate` (legacy, alleen kliks), partnerdossier "Omzet" (all-time, per partner) en `/admin/programma/rapportage` (downstream, `af_*`). Er is geen overzicht van upstream-omzet over partners heen. |

### Grootste risico's

1. **De verplichte integriteitslaag geldt niet voor wat live staat.** De poort beschermt alleen de overgang draft→published. Er zijn drie omwegen: de backfill-route, poortverval door latere wijzigingen, en prijzen die met de tijd verouderen.
2. **Er wordt gestuurd op een metric die niet bestaat.** Affiliate-omzet is de meetlat van het focusfilter, maar het systeem kan hem niet meten.
3. **Twee bronnen voor de affiliate-URL.** De site gebruikt `affiliate-links.ts`, de admin beheert `sup_offers.affiliate_url`. Een product dat alleen in de admin is aangemaakt krijgt geen link. Een inactieve aanbieding blijft gelinkt.
4. **Productiedata met concrete fouten.** `viridian-bisglycinaat` (Viridian) linkt naar een Solgar-productpagina en staat op 0 mg. Möller's hangt aan netwerk "Arctic Blue". Drie eiwitpoeders staan live zonder prijs.
5. **Stille rekenfouten zodra er volume komt.** Afgekapte totalen, `.in()`-URL-grenzen, en periodes in UTC terwijl het bedrijf in Europe/Amsterdam zit.

### 1.2 Statusmatrix

Status: ✅ werkt aantoonbaar · 🟡 gedeeltelijk · 🔴 ontbreekt/kapot · ⚪ niet van toepassing.

| Onderdeel | Status | Bewijs | Ontbreekt | Prioriteit |
|---|---|---|---|---|
| Productbeheer | 🟡 | Routes `/admin/producten`, `[slug]`, `nieuw`, merken, categorieën, retailers, import bestaan; acties met `requireAdmin` (`src/lib/product-admin/*-actions.ts`); 261 tests groen | Tijdlijn/auditlog; affiliate-URL niet zichtbaar of bewerkbaar in het dossier; product-score op `/beste/*` komt uit legacy-veld | HIGH |
| Publiceerpoort | 🔴 (live) / ✅ (overgang) | `setProductStatusAction` herberekent de poort uit de DB (`src/lib/product-admin/actions.ts:84-120`); DB: **0/25** gepubliceerde producten halen de 5 DB-criteria | Afdwinging in DB; bypass via `sup-backfill` (`backfill.ts:121`); geen herbeoordeling na wijziging of tijdsverloop; criterium "geldige affiliate-route" | **BLOCKER** |
| Freshness | 🟡 | `productFreshness()` (`publish-gate.ts:144-157`) op `data_checked_at` + `price_checked_at` | `sup_product_images.checked_at` niet gebruikt; publiek geen verbergen van oude prijzen (K7); `hub-loader.ts:73` vult de datum van vandaag in bij `null` | HIGH |
| Retailers | 🟡 | 3 retailers, alle drie gekoppeld aan `pd_partners`; `/admin/retailers` | `tracking_param` nergens gebruikt; `pd_partner_id` optioneel; deactiveren heeft geen effect op de site | HIGH |
| PartnerDesk | 🟡 | Dossier, contracten, regels, resolutie, signalen werken; 5 partners | Contract/regel ontbreekt bij Vitaminstore en Arctic Blue; Möller's-netwerk fout; geen signaal "actieve partner zonder regel" | HIGH |
| Click tracking | 🟡 | `affiliate_clicks` (165 rijen), `sup_clicks` (5 rijen sinds 1 okt) | Token niet in URL; geen gedeelde klik-ID; spoofbare rate-limit; willekeurige offer-keuze bij N>1 | **BLOCKER** (token) |
| Conversion tracking | 🔴 | `pd_conversions` = 0 rijen; `webhook_secret` bij 0 partners | Netwerk-import (Daisycon); statusupdates; onbekend token → 500 | **BLOCKER** |
| Attribution | 🔴 | Geen enkele conversie heeft een `click_token` (kan ook niet) | Token-overdracht, venstercontrole, partner-tokenconsistentie | **BLOCKER** |
| Commissie | 🟡 | Resolutie + bedrag als pure functies, getest (`commission-resolution.ts`, `commission-amount.ts`) | Staffels genegeerd; `rule_snapshot` zonder regel; review niet atomair; geen reversal/cancel | HIGH |
| Upstream omzet | 🔴 | Leeg grootboek; §G-sectie toont "nog geen" | Alles na "klik" | **BLOCKER** |
| Affiliate dashboard | 🟡 | Drie gefragmenteerde weergaven | Overzicht over partners heen, periodes, dimensies | MEDIUM |
| Reporting | 🔴 | Totalen in JS over afgekapte sets (`partnerdesk/queries.ts:446-470`, `affiliate-analytics.ts:64-125`) | Server-side aggregatie, periode in Europe/Amsterdam | HIGH |
| Security | 🟡 | Proxy + `requireAdmin` in alle server actions (statische test); RLS deny-all | Partnergeheim in platte tekst; spoofbare XFF op klik-route; destructieve backfill-route | HIGH |
| Tests | 🟡 | Poort-criteria, commissie, ingest (mock), signalen (puur) getest | Geen route-tests voor postback en `sup`-klik; geen tests voor bypass, poortverval of full-sync; geen DB-/E2E-tests | HIGH |
| Observability | 🔴 | `console.error` in routes; PartnerDesk-tijdlijn voor handmatige acties | Productauditlog; trace voor resolutie; health voor de affiliate-keten; Sentry vangt afgevangen fouten niet | MEDIUM |
| Multitenancy | ⚪ (bewust) | Mono-tenant per besluit; `organization_id` alleen op consumententabellen | Niets nodig nu (§12) | LOW |

---

## 2. Current Architecture

`[FEIT]` Eén Next.js 16-app (App Router) op één Hetzner-VPS. Supabase is alleen via de service-role-client bereikbaar voor `sup_*`/`pd_*`/`af_*` (RLS deny-all, nul policies).

```
BEZOEKER (perfectsupplement.nl)
 /beste/[supplement]  (statisch via generateStaticParams, revalidatePath na admin-acties)
 /supplementen        (force-dynamic, leest DB per request)
 /product/[slug]      (statisch via generateStaticParams)
   └─ <AffiliateLink affiliateSlug=…>            src/components/supplements/AffiliateLink.tsx
        href = affiliateLinks[slug]  ← src/data/affiliate-links.ts (STATISCH, 27 URL's, 25 aan een product gekoppeld)
        onClick (alleen met marketingtoestemming):
          ├─ GA4 'affiliate_click'   (track-affiliate-click.ts)
          ├─ GA4 'affiliate_klik'    (ga4.ts)
          ├─ Clarity tag
          ├─ fetch  POST /api/affiliate/click   → affiliate_clicks + domain_events('affiliate.click' → n8n)
          └─ beacon POST /api/supplements/click → sup_clicks (click_token, offer, product, retailer)
        navigatie: native href → ds1.nl / bdt9.net (Daisycon) of arctic-blue.com (?sld=…)

PARTNER / NETWERK
 Daisycon-portaal ............ conversies + commissie (NIET in ons systeem)
 POST /api/partner/conversion  Bearer <pd_partners.webhook_secret> → ingestConversion → pd_conversions (pending)

ADMIN (/admin, proxy + requireAdmin; één gedeeld wachtwoord, HMAC-cookie 12 u)
 PartnerDesk (DeskShell):
   Vandaag ............ signalen, taken, verloopkalender  (after(syncAllSignals) 1×/dag/proces)
   Partners/[slug] .... dossier + sectie "Omzet" (§G): dekking, kliks 30d, pending/goedgekeurd/afgekeurd, handmatige invoer, beoordelen
   Producten .......... lijst + dossier + publiceerpoort; merken; categorieën; retailers; import (CSV → concept)
   Affiliates ......... /admin/programma (+rapportage) — downstream af_* (stoplijst)
 Site:
   /admin/site ........ intake-dashboard
   /admin/affiliate ... legacy klikdashboard op affiliate_clicks (client-side fetch /api/admin/affiliate)
 Onderhoud (API, admin-cookie): /api/admin/data/sup-backfill | sup-offers-backfill | sup-price-backfill | sup-packaging-backfill | sup-score-inputs-backfill | product-import-template

DOWNSTREAM (af_*, stoplijst)
 GET /r/[ref] → af_clicks + cookie psf_aff_ref (first-click, 90 d)
 proxy.ts: ?ref= op elke pagina → psf_aff_ref (als nog niet gezet)
 IntakeIntro/NutritionCapture: client overschrijft psf_aff_ref met ?ref= (last-click)
 /api/intake/session + nutrition-log → attributeIntakeLead → af_conversions (lead)

CRON (cron-job.org): nurture, retention, account-retention, n8n-events — GEEN affiliate-/prijs-/link-job
MONITORING: /api/health (alleen DB-bereikbaarheid), Sentry (als SENTRY_DSN gezet; geen captureConsole)
```

**Verantwoordelijkheden per laag** `[FEIT]`:

- **Domeinlogica** in `src/lib/partnerdesk/` (resolutie, bedrag, revenue, signalen), `src/lib/product-admin/` (poort, validatie, acties), `src/lib/supplement-catalog-db/` (loaders, backfills, kliktoken) en `src/lib/affiliate/` (downstream).
- **Pure functies** (testbaar): `evaluatePublishGate`, `productFreshness`, `resolveCommissions`, `computeExpectedCommissionCents`, `summarizeRevenue`, `buildReviewOutcome`, `computePartnerSignals`.
- **Geen transacties.** Alle schrijfacties zijn losse PostgREST-calls zonder transactiegrens. Er bestaan geen Postgres-functies of triggers op `sup_*`/`pd_*`/`af_*` (grep over `supabase/migrations/`).

---

## 3. Current Data Model

### 3.1 Inventaris met productieaantallen (1 okt 2026, read-only)

| Tabel | Doel | Rijen | Gebruikt door |
|---|---|---|---|
| `sup_brands` | Merk; optionele brug `pd_partner_id` | 13 | admin, loaders |
| `sup_categories` | Categorie + `ingredient_claim_key` (brug naar `approved-claims.ts`, geen FK) | 7 | admin, loaders |
| `sup_products` | Productanker, `status` draft/published/archived | 25 (alle `published`) | admin, `/beste`, `/supplementen`, `/product`, sitemap |
| `sup_product_actives` | Werkzame stoffen per portie | 29 | poort, score, loaders |
| `sup_product_ingredients` | Ingrediëntenlijst | 0 | dossier |
| `sup_product_certifications` | Keurmerken | 5 | score |
| `sup_product_claims` | EFSA-claim + `meets_condition` (afgeleid) | 60 | poort, loaders |
| `sup_sources` | Bronnen per product/categorie | 1 (productbron) | poort |
| `sup_product_images` | Afbeelding + `source` + `license_note` + `checked_at` | 25 (1 met licentie-notitie; 24 `checked_at` null) | poort, loaders |
| `sup_score_models` | Modelregistratie PS-Score | 1 | **nergens gelezen** |
| `sup_scores` / `sup_badges` | Opgeslagen score / badges | 0 / 0 | **nergens geschreven of gelezen** |
| `sup_retailers` | Verkoper + `relationship` + brug `pd_partner_id` | 3 | admin, klik-route |
| `sup_offers` | Product × retailer, prijs, `affiliate_url`, `active` | 25 (24 actief, max. 1 per product) | poort, hub-prijs, klik-route; **niet** de publieke link |
| `sup_offer_price_history` | Prijshistorie | 1 | admin (alleen schrijven) |
| `sup_clicks` | Uitgegeven kliktokens | 5 (allemaal 1 okt) | partnerdossier "Kliks (30 dgn)" |
| `affiliate_clicks` | Legacy uitgaande kliks (slug-gebaseerd) | 165 (14 in 30 d) | `/admin/affiliate` |
| `domain_events` (`affiliate.click`) | Event-log → n8n | 114 | n8n |
| `pd_networks` | Netwerk/direct | 2 (Daisycon `network`, Arctic Blue `direct`) | PartnerDesk |
| `pd_partners` | Partnerdossier + `webhook_secret` | 5 (0 met geheim) | overal |
| `pd_contracts` | Contract + `reporting_method`/`cadence` + `cookie_days` | 1 (VitalNutrition, `manual`) | resolutie, dekking |
| `pd_commission_rules` / `_tiers` | Commissieregels / staffels | 1 actief (cps %) / 0 | resolutie (staffels **niet**) |
| `pd_conversions` | Upstream-conversies | **0** | §G |
| `pd_ledger_entries` | Upstream-grootboek | **0** | §G |
| `pd_signals` | Signalen | 5 (open: 3× `partner_no_contact`) | Vandaag |
| `pd_timeline_events` | Dossierhistorie | 13 | dossier |
| `af_*` | Downstream-programma | 1 affiliate, 2 conversies, 1 grootboekregel, 0 kliks, 0 payouts | `/admin/programma` (stoplijst) |

### 3.2 Detail van de tabellen in de affiliate-keten

| Tabel | PK | FK's (on delete) | Unique / indexen | Status | Timestamps | Herkomst (provenance) | Soft delete | RLS | Queries / gebruik |
|---|---|---|---|---|---|---|---|---|---|
| `sup_products` | `id` uuid | `brand_id`→brands (restrict), `category_id`→categories (restrict) | `slug` unique; idx brand, category, status, (category, display_order) | `draft/published/archived` | `created_at`, `updated_at` (handmatig gezet, geen trigger), `data_checked_at`, `published_at`, `archived_at` | `raw_legacy_fields` (backfill), `score_inputs` | `archived` als status | deny-all | `loadCategoryProducts` (`loader.ts:118`), `listAdminProducts`, `getProductDossier*`, klik-route via `raw_legacy_fields->>affiliateSlug` (geen index) |
| `sup_offers` | `id` | `product_id` (cascade), `retailer_id` (cascade) | `(product_id, retailer_id)` unique; idx product, retailer | `active` bool | `created_at`, `updated_at`, `price_checked_at` | `source` manual/feed/api (backfill en import schrijven `manual`) | geen (alleen `active`) | deny-all | poort, hub-prijs (`hub-loader.ts:56-77`), klik-route (eerste actieve) |
| `sup_retailers` | `id` | `pd_partner_id`→pd_partners (**set null**) | `slug` unique; idx relationship | `active` | `created_at` | — | `active` | deny-all | `/admin/retailers`, `getPartnerRevenue` (kliks per partner) |
| `sup_clicks` | `id` | `offer_id` (**cascade**), `product_id` (restrict), `retailer_id` (restrict) | `click_token` unique; idx offer, product (**geen** retailer/created_at) | — | `created_at` | geen URL- of partnersnapshot | — | deny-all | insert in `/api/supplements/click`; telling in `getPartnerRevenue` |
| `pd_partners` | `id` | `network_id`→pd_networks (no action) | `slug` unique; idx status, network | `onboarding/active/paused/ended` | `created_at`, `updated_at`, `archived_at` | — | `archived_at` | deny-all | overal; postback-auth |
| `pd_contracts` | `id` | `partner_id` (cascade) | `(partner_id, number)` unique; idx partner, ends_on, cancel_by | via datums | `starts_on`, `ends_on`, `cancel_by` (generated) | — | `archived_at` | deny-all | resolutie, dekking, postback (laatste contract) |
| `pd_commission_rules` | `id` | `contract_id` (cascade) | idx contract; check rate xor amount | `rule_type`, `valid_from/to` | `created_at`, `archived_at` | in-place bewerkbaar; diff in tijdlijn | `archived_at` | deny-all | `resolveCommissions` |
| `pd_conversions` | `id` | `partner_id` (cascade), `contract_id` (set null), `click_token`→`sup_clicks.click_token` (set null) | **`(partner_id, external_id)` unique**; idx (partner, occurred_at desc), click_token | `pending/approved/rejected` | `created_at`, `occurred_at`, `imported_at` | `ingest_method` postback/import/manual; `raw` jsonb | geen | deny-all | §G-sectie, signalen |
| `pd_ledger_entries` | `id` | `partner_id` (cascade), `conversion_id` (set null) | idx (partner, state); **geen unique per conversie** | `kind` accrual/adjustment/reversal/payment_received; `state` pending/approved/paid/rejected | `posted_at`, `period` (YYYY-MM, UTC) | `rule_snapshot` (alleen type + orderwaarde) | geen | deny-all | §G-sectie, signalen |
| `affiliate_clicks` | `id` | `organization_id` | idx organization_id | — | `timestamp` | `product_id` = affiliate-slug (tekst) | — | RLS + org-policy (authenticated) | `/admin/affiliate`, funnel |

Geldtypes `[FEIT]`: alle bedragen zijn `int` in centen (`price_cents`, `revenue_cents`, `commission_cents`, `amount_cents`, `expected_cents`), percentages zijn `numeric(5,2)`. Er zit nergens een float of `money` in de database. Floats komen alleen voor in JS-tussenrekeningen (§10).

### 3.3 Relationeel overzicht (werkelijk)

```
sup_brands ─┐                 sup_categories
            │ (brand_id)          │ (category_id)
            └──────► sup_products ◄┘
                       │  status, data_checked_at, raw_legacy_fields.affiliateSlug ──► src/data/affiliate-links.ts (CODE, live href)
        ┌──────────────┼───────────────┬──────────────┬──────────────┐
  sup_product_actives  sup_product_claims  sup_product_images  sup_sources   sup_offers ──(retailer_id)──► sup_retailers ──(pd_partner_id, nullable)──► pd_partners ──► pd_networks
                                                                              │  affiliate_url (admin)                                                  │
                                                                              ▼                                                                         ├──► pd_contracts ──► pd_commission_rules ──► pd_commission_tiers (ongebruikt)
                                                                        sup_clicks (click_token) ◄──────(FK, nullable)────── pd_conversions ──────────────┤
                                                                                                                             │ (partner_id)               │
                                                                                                                             ▼                            │
                                                                                                                     pd_ledger_entries ◄──────────────────┘

affiliate_clicks (los; product_id = slug-tekst; geen FK naar sup_*)        af_* (los; downstream)
```

**Ontbrekende relaties** `[FEIT]`: `pd_conversions` → offer/product (alleen indirect via een token dat altijd `null` is) · `sup_clicks` → partner-snapshot · `affiliate_clicks` ↔ `sup_clicks` (geen gedeelde ID) · contract ↔ retailer (alleen op partnerniveau).

### 3.4 Bron van waarheid (source of truth)

| Concept | Bron nu | Concurrerende bron(nen) | Inconsistentie `[FEIT]` |
|---|---|---|---|
| Product | `sup_products` (met statische terugval) | `src/data/supplements/*.ts`, `score-inputs.ts`, `raw_legacy_fields` | `/beste/*` toont de **legacy redactiescore** (`ProductCard`: `product.score` = `raw_legacy_fields.score`, `loader.ts:214`). `/supplementen` en `/product` tonen de **PS-Score**. Een product dat alleen in de admin bestaat toont op `/beste` score 0. |
| Aanbieding | `sup_offers` | Impliciet: slug → URL in `affiliate-links.ts` | Deactiveren in de admin verandert niets aan de site |
| **Affiliate-URL** | **`affiliate-links.ts` (live)** | `sup_offers.affiliate_url` (admin, import, backfill) | Twee bronnen, geen consistentiecheck. Het DB-veld wordt alleen gelezen voor weergave in de admin-query. |
| Retailer | `sup_retailers` | `RETAILERS`-constante + domeinmapping in `offers-backfill.ts:28-58` | Mapping op domein (`ds1.nl` → Vitaminstore), niet op Daisycon-`si` |
| Partner | `pd_partners` | `sup_retailers.relationship` vs `pd_networks.kind` | Geen constraint dat ze overeenkomen. **Möller's hangt aan netwerk "Arctic Blue" (`direct`).** |
| Klik | **Geen enkele.** `affiliate_clicks` (165), `domain_events` (114), `sup_clicks` (5), GA4 ×2, Clarity | — | Geen gedeelde klik-ID. Tellingen lopen uiteen (165 vs 114). Matchen kan alleen op seconde + slug. |
| Conversie | `pd_conversions` (leeg) | **Daisycon-portaal**, systeem van Arctic Blue | De echte data staat buiten het systeem |
| Orderwaarde | `pd_conversions.revenue_cents` | Daisycon | — |
| Commissie (verwacht/goedgekeurd) | `pd_conversions.commission_cents` / `pd_ledger_entries` | Daisycon | "Ontvangen" in de UI = goedgekeurd, geen ontvangst |
| Uitbetaling/ontvangst | — | Bank, Daisycon-uitbetaalspecificatie | Ontbreekt |
| Score | Live berekend (`computeTrustScore`) | `sup_scores` (leeg), legacy `score` | Geen opgeslagen score per publicatie |

---

## 4. Product/Admin Status

### 4.1 Wat er staat `[FEIT]`

| Onderdeel | Status | Opmerking |
|---|---|---|
| `/admin/producten` lijst (foto, naam, merk, categorie, score, #aanbiedingen, status, versheid) | ✅ | Statusfilter. Geen kolom "haalt poort". Archived wordt verborgen. |
| `/admin/producten/[slug]` dossier | ✅ (8 secties + poort) | **Geen Tijdlijn.** Affiliate-URL van een aanbieding niet zichtbaar en niet bewerkbaar (`OfferEditor`: alleen prijs en actief, `ProductEditors.tsx:187-215`). |
| `/admin/producten/nieuw` | ✅ | Altijd `draft` |
| `/admin/merken`, `/admin/categorieen` | ✅ | — |
| `/admin/retailers` + koppeling `pd_partners` | ✅ | `relationship` alleen bij aanmaken; `tracking_param`/`base_url`/`disclosure_label` bewerkbaar maar **door geen enkele runtime-code gebruikt** |
| `/admin/import` (CSV, preview, alles concept) | ✅ basis | Zet `price_checked_at = now` bij import, ook als de CSV-prijs oud is (`import-actions.ts:158`) |
| Score-invoer in DB + backfill | ✅ | 25/25 `score_inputs` gevuld |

### 4.2 Publiceerpoort — technische afdwinging

**Wat goed is** `[FEIT]`: `setProductStatusAction` (`src/lib/product-admin/actions.ts:84-120`) herberekent de poort server-side uit de database (`getProductDossierById` → `evaluatePublishGate`) en negeert wat de browser meestuurt. `status` staat niet op de allowlist van `updateProductFieldAction` (`validation.ts:1-16`). Alle server actions roepen `requireAdmin()` aan, wat de statische test `admin-server-actions-auth.test.ts` bewaakt. De zes criteria zijn als pure functie getest (`publish-gate.test.ts`).

**Wat de poort niet afdwingt:**

| # | Gat | Bewijs | Gevolg |
|---|---|---|---|
| P1 | **Bypass via de backfill.** `POST /api/admin/data/sup-backfill` is herhaalbaar ("mag na een wijziging opnieuw gedraaid worden"). De route zet elk van de 25 producten op `status: "published"`, verwijdert afbeeldingen, actives, claims en certificeringen en zet ze opnieuw neer. Afbeeldingen krijgen `source: "own"` zonder `license_note`, `sup_sources` vult ze niet. | `backfill.ts:121`, `:221-238`, `route.ts:15-20` | Zo kwamen de 25 live producten erop, en één klik herhaalt dat. Daarbij wordt admin-werk overschreven: licentie-notities en handmatige actives. "Eigen foto" wordt als herkomst vastgelegd zonder dat dat geverifieerd is (K3). |
| P2 | **Geen afdwinging in de DB.** Geen check, trigger of functie. Elke service-role-call of SQL-editor-update kan publiceren. | `supabase/migrations/2026092606501*_sup_*.sql` | Bypass via SQL en via toekomstige code |
| P3 | **Poortverval.** Wijzigen van een gepubliceerd product toetst de poort niet: laatste afbeelding verwijderen (`edit-actions.ts:428`), laatste werkzame stof (`:321`), laatste bron (`:218`), enige aanbieding deactiveren (`:169`). | — | Product blijft live terwijl het de poort niet meer haalt |
| P4 | **Tijd.** Een prijs die ouder wordt dan 30 dagen depubliceert niets en verbergt niets. | `publish-gate.ts:47-49` alleen bij de overgang | 21 van de 21 nu verse actieve aanbiedingen worden in oktober "oud" |
| P5 | **Race (TOCTOU).** Eerst wordt het dossier gelezen, daarna de status gezet, zonder transactie. | `actions.ts:93-113` | Theoretisch, want er is één admin |
| P6 | **Criterium "actives" is smaller dan de spec.** Er wordt gecontroleerd dat bestaande rijen compleet zijn, niet dat de verplichte nutriënten van de categorie aanwezig zijn (bijv. EPA én DHA). | `publish-gate.ts:60-62` vs `ANALYSE_…` §F | Een omega-3-product met alleen DHA kan door de poort |
| P7 | **Geen criterium "geldige affiliate-route".** Het offercriterium vraagt alleen `active` + verse `price_checked_at`. Niet `affiliate_url`, niet een actieve retailer, niet een gekoppelde of actieve partner, niet een host die bij de retailer hoort. | `publish-gate.ts:64`; `edit-validation.ts:101-114` (affiliate-URL optioneel) | Zie §4.4 |
| P8 | **Score "te berekenen", niet "berekend en vastgelegd".** `sup_scores` blijft leeg, dus er bestaat geen snapshot van de score op het moment van publiceren. | `score.ts:53-90`; `sup_scores` = 0 | Niet te reproduceren wat de lezer op dag X zag |
| P9 | **Een gepubliceerd product zonder actives breekt de hele categorie.** `werkzameStofFor()` gooit een fout. `loadProductsForPage` vangt die af en valt voor **de hele categorie** terug op statische data. | `loader.ts:101-110`, `page-products.ts:48-54` | Een fout van één product verandert stil een hele pagina |

**Stand in productie** (read-only, 1 okt; benadering zonder het scorecriterium):

| Criterium | Faalt bij | Toelichting |
|---|---|---|
| Afbeelding met bron + licentie-notitie | **24/25** | Alleen `vitalnutrition-ashwagandha-ksm66` heeft een licentie-notitie |
| Werkzame stoffen volledig | 1/25 | `viridian-bisglycinaat`: magnesium = **0 mg** |
| Claims halen drempel | 0/25 | — |
| Actieve aanbieding met prijs ≤ 30 dagen | 4/25 | 3 eiwitpoeders zonder prijs; ashwagandha-KSM66: enige aanbieding **inactief** |
| Minstens één bron | **24/25** | 1 productbron in totaal |
| **Alle vijf DB-criteria** | **25/25 falen (0 slaagt)** | Het enige product met licentie en bron faalt op de inactieve aanbieding |

`[OORDEEL]` De poort is goed ontworpen als *overgangscontrole*, maar functioneert niet als *invariant*. Voor de live catalogus is het verlies van de TypeScript-compilecheck dus nog niet vervangen.

### 4.3 Versheid

| Vraag | Antwoord `[FEIT]` |
|---|---|
| Welke query | `listAdminProducts` (`product-admin/queries.ts:60-111`): één geneste select met `sup_offers(active, price_checked_at)`. Daarna `productFreshness()` in JS. |
| Drempels | Prijs ≤ 30 d (`PRICE_MAX_AGE_DAYS`), data ≤ 90 d (`DATA_MAX_AGE_DAYS`) |
| NULL | `price_checked_at = null` telt als oud. `data_checked_at = null` telt als "data >90 dgn". In productie is `data_checked_at` voor **25/25** `null`, dus alles is "verouderd" en de banner zegt "25 producten langer dan 90 dagen niet gecontroleerd". Dat moet zijn: *nooit gecontroleerd*. |
| Afbeeldingen | **`sup_product_images.checked_at` wordt niet gebruikt.** De lijst selecteert alleen `path, position`. 24/25 hebben `checked_at = null`. |
| Weergave | Amber tekst per rij + één banner; geen niveaus |
| Publiek | `/product` en de hubkaart tonen "Prijs gecontroleerd op {datum}" (`ProductDetail.tsx:356`, `ProductCatalogCard.tsx:294`), maar **verbergen een oude prijs niet** (K7 vraagt "prijs controleren bij retailer"). Als `price_checked_at` `null` is, vult `hub-loader.ts:73` **de datum van vandaag** in. Dat is een onware bewering. De hub neemt de eerste aanbieding mét prijs, ook als die **inactief** is (`hub-loader.ts:69`). |
| Verouderde aanbieding blijft gepubliceerd? | **Ja** (P4) |
| Link naar verlopen/ongeldige aanbieding? | **Ja.** De href is statisch. Voorbeeld: `vitalnutrition-ashwagandha-ksm66` heeft alleen een inactieve aanbieding en linkt gewoon door. |

**Voorstel niveaus** `[OORDEEL]`. Dit sluit aan op de bestaande drempels en vervangt ze niet:

| Facet | Fresh | Warning | Stale | Critical |
|---|---|---|---|---|
| Prijs (`price_checked_at`) | ≤ 21 d | 22–30 d (poort ok, admin amber) | > 30 d: poort faalt, **publiek geen bedrag** ("prijs controleren bij retailer") | > 60 d of `null` bij een actieve aanbieding: rood signaal |
| Productdata (`data_checked_at`) | ≤ 60 d | 61–90 d | > 90 d | `null` ("nooit gecontroleerd", apart label) |
| Afbeelding (`checked_at`) | ≤ 180 d | ≤ 365 d | > 365 d | geen licentie-notitie of bestand ontbreekt |
| Link (nieuw: `link_checked_at` op `sup_offers`) | ≤ 7 d | ≤ 14 d | > 14 d | laatste check gaf 4xx/5xx of verkeerde host |

### 4.4 Koppeling product ↔ affiliate

Scenario's waarin **`status = published` maar de affiliate-route ongeldig is**. Elk is in de code mogelijk `[FEIT]`:

1. Een product dat in de admin of via import is aangemaakt, valt buiten `affiliate-links.ts` → `affiliateSlug = row.slug` (type-cast, `loader.ts:213`) → `AffiliateLink` toont "Vergelijking volgt binnenkort" in plaats van een link (`AffiliateLink.tsx:45-53`). Er komt geen buildfout meer zoals vroeger.
2. Een aanbieding zonder `affiliate_url` haalt de poort (`edit-validation.ts:105`: URL optioneel).
3. Aanbieding inactief, retailer inactief of partner gearchiveerd → de site linkt door via de statische URL.
4. `sup_offers.affiliate_url` gewijzigd in de admin → de site gebruikt de oude URL.
5. De deeplink wijst naar een ander product. **Gevonden:** `viridian-bisglycinaat` ("Viridian Magnesium Bisglycinate") linkt naar `…dl=product%2Fsolgar-vitamins-magnesium-bisglycinate-1308886` (`affiliate-links.ts:60-61`). De slug van de bestemming noemt Solgar. **Te verifiëren.**
6. Retailer zonder `pd_partner_id` of partner zonder contract/regel → er wordt doorgelinkt zonder bekende commissieafspraak (Vitaminstore: 17 aanbiedingen, geen contract).

**Voorstel aanvullend poortcriterium "geldige affiliate-route"** (hard, zelfde status als de andere zes). Minstens één aanbieding die tegelijk:

- actief is, met een verse prijs;
- een `affiliate_url` heeft;
- een host heeft die bij de retailer hoort (allowlist per retailer);
- bij een actieve retailer hoort met `pd_partner_id`;
- bij een niet-gearchiveerde partner hoort.

Commissieafspraak aanwezig = **waarschuwing**, geen blokkade. Niet-partnerproducten moeten kunnen meedoen (§K2, norm 1 op 3 à 4). Een product **zonder** commerciële relatie mag dus publiceren met een gewone winkellink, maar dan expliciet gemarkeerd.

### 4.5 `/admin/import`

Bestaat (#67). Vaste kolommen, preview, alles als concept, publiceren blijft achter de poort. **Geen uitbreiding geadviseerd** (opdracht). Eén kleine kanttekening voor later: import zet `price_checked_at = now`, ook als de prijs in de CSV oud is.

---

## 5. PartnerDesk / §G Status

### 5.1 Partners (productie, 1 okt)

| Partner | Status | Netwerk (kind) | Contract | Regels | Rapportage | Geheim | Retailer | Aanbiedingen | `sup_clicks` | Conversies |
|---|---|---|---|---|---|---|---|---|---|---|
| `vitaminstore` | active | Daisycon (network) | **0** | **0** | — | nee | vitaminstore (network) | **17** | 2 | 0 |
| `vitalnutrition` | active | Daisycon (network) | 1 | 1 (cps %) | `manual` | nee | vitalnutrition (network) | 7 | 3 | 0 |
| `arctic-blue` | active | Arctic Blue (direct) | **0** | **0** | — | nee | arctic-blue (direct) | 1 | 0 | 0 |
| `mollers` | onboarding | **Arctic Blue (direct)** ⚠ | 0 | 0 | — | nee | — | 0 | 0 | 0 |
| `thorne` | onboarding | Daisycon (network) | 0 | 0 | — | nee | — | 0 | 0 | 0 |

- **Eén bron van waarheid?** Voor *wie* de partner is wel (`pd_partners`). Voor *hoe gemeten wordt* niet: `sup_retailers.relationship` en `pd_networks.kind` kunnen uiteenlopen zonder constraint.
- **Correct gekoppeld?** Drie retailers → drie juiste partners. Möller's (geen retailer) hangt aan het verkeerde netwerk. Waarschijnlijk is dat een restant van de netwerkhernoeming die in `20260926112517_pd_daisycon_en_retailer_partners.sql` beschreven staat `[AANNAME]`.
- **Signalen dekken dit niet.** `missing_commission` vuurt alleen bij een *actief contract zonder regel* (`partner-signals.ts:153-169`). Een actieve partner met aanbiedingen en **nul contracten** (Vitaminstore, Arctic Blue) krijgt geen signaal. Open signalen nu: alleen 3× `partner_no_contact`.

### 5.2 Tracking

| Vraag | Antwoord `[FEIT]` |
|---|---|
| Hoe wordt een affiliate-link gemaakt? | Niet gegenereerd. Hij komt **hard-coded** uit `affiliateLinks[affiliateSlug]` (`AffiliateLink.tsx:45`). Daisycon-links dragen `si`/`li`/`wi` + `ws=<categorie>` + `dl=<deeplink>`; Arctic Blue draagt `sld=dennisvanwestbroek`. |
| Waar wordt de klik geregistreerd? | Client-side, alleen met marketingtoestemming: `affiliate_clicks` (fetch), `sup_clicks` (sendBeacon), GA4 ×2, Clarity, `domain_events` |
| Klik-ID opgeslagen? | `sup_clicks.click_token`: 12 tekens base64url, 72 bit (`click-token.ts:7-9`), uniek. `affiliate_clicks.id` staat er los van. |
| Externe tracking-ID? | Nee. Daisycon-klik/transactie-ID's komen niet terug. |
| Correlatie-ID over de registraties heen? | **Nee.** Matchen kan alleen op tijd (seconde) + slug. |
| Gaat het token mee naar de partner? | **Nee.** De `sendBeacon`-response wordt niet gelezen; navigatie gaat via de statische href (`register-click-client.ts:9-14`, `:36-41`). `sup_retailers.tracking_param` is voor alle 3 retailers `null` en wordt in de code nergens gebruikt. |
| Welke aanbieding? | `.from("sup_offers")…eq("active", true).limit(1)` zonder `order` (`api/supplements/click/route.ts:91-97`). Bij N>1 aanbiedingen per product is dat willekeurig. Nu is N = 1. |
| Misbruik | Openbaar endpoint; rate-limit op `x-forwarded-for`, die spoofbaar is omdat het domein DNS-only is (`client-ip.ts:3-15` vs `route.ts:31-33`); geen dedupe, geen botfilter, interne testkliks tellen mee |

### 5.3 Conversies

| Vraag | Antwoord `[FEIT]` |
|---|---|
| Hoe komen ze binnen? | (a) `POST /api/partner/conversion` (postback); (b) handmatig in het dossier (`addManualConversionAction`); (c) **import bestaat niet** (`ingest_method='import'` wordt nergens geschreven); (d) **Daisycon: niets** |
| Identifiers | `partner_id` (uuid, in de body), `external_id` (verplicht; handmatig zonder ID wordt `manual-<uuid>`), `order_ref`, `click_token` |
| Conversie ↔ klik | Alleen via `click_token` (FK naar `sup_clicks`). In productie 0 keer, en het kan niet zolang het token de partner niet bereikt. |
| Conversie ↔ partner | `partner_id` direct (goed). Bij een postback is het geheim per partner. |
| Conversie ↔ product/aanbieding | **Geen kolom.** Alleen indirect via het token. |
| Idempotentie | `UNIQUE (partner_id, external_id)` + `upsert … ignoreDuplicates` (`conversion-ingest.ts:65-86`). Een retry geeft 200 + `duplicate: true`. **Maar:** een herhaalde melding met een gewijzigde status (annulering) wordt ook genegeerd. Er is geen update-pad. |
| Onbekend/ongeldig token | De FK-schending geeft een **500** (`route.ts:131-133`). De partner probeert opnieuw en blijft falen → de conversie gaat verloren. De spec zegt 200 + afwijking loggen. |
| Validatie | `revenue_cents` ontbreekt of is ongeldig → stil **0** (`route.ts:76-79`). `currency` wordt genegeerd en altijd EUR (`:126`); het plan zegt A7 "andere valuta = import-fout". `occurred_at` is elke parsebare datum: geen controle tegen kliktijd of `cookie_days`. Geen controle dat het token bij een retailer van dezelfde partner hoort. |
| Contractkeuze | Het nieuwste niet-gearchiveerde contract (`route.ts:108-115`), niet het contract dat gold op `occurred_at`. Met `contractId = null` → `.eq("contract_id", "")` op een uuid-kolom → queryfout wordt ingeslikt → verwachte commissie `null` (`conversion-ingest.ts:48-51`). |
| Neveneffecten | Postback schrijft **geen** tijdlijn-event en herberekent **geen** signalen (handmatige invoer doet dat wel). |

### 5.4 Commissie

| Aspect | Stand `[FEIT]` |
|---|---|
| Bedrag | `commission_cents` = **verwacht**, bij inname berekend (`computeExpectedCommissionCents`). `cps_percent` gaat vóór `cps_fixed`; lead → `cpl`; `cpc`/`cpa` worden niet berekend. |
| Percentage | Uit de winnende regel (`commission-resolution.ts:91-100`: scope > type > valid_from > created_at) |
| Staffels | `pd_commission_tiers` worden bewerkt en opgeslagen, maar **niet gebruikt** in het bedrag (`commission-amount.ts:33-51`) |
| Valuta | Alleen EUR. Kolom `currency` bestaat; `formatMoney` toont altijd EUR. |
| Status | Conversie `pending → approved \| rejected` (eindtoestand). Grootboek: alleen `accrual` met `approved` of `rejected` wordt geschreven. |
| Annulering/retour | **Geen pad.** `reversal`, `adjustment`, `payment_received` en `state='paid'` worden in `src/lib/partnerdesk/` nergens geschreven; ze bestaan alleen in het type (`src/types/partnerdesk.ts:134`). Het downstream-grootboek (`af_*`) kent reversal en paid wel. |
| Correcties | Alleen bij beoordelen ("ontvangen commissie" overschrijven). Daarna niets meer. |
| Timestamps | `occurred_at`, `imported_at`, `posted_at`, `period` (`occurred_at.slice(0,7)` in UTC) |
| Herleidbaarheid | `rule_snapshot = {type, revenue_cents}` (`revenue.ts:174`). **Geen regel-ID, kind, percentage of contract.** Regels zijn in place te bewerken (`contract-actions.ts:227-272`; de diff staat alleen in de tijdlijn). |
| Atomiciteit | Beoordelen = statusclaim (`.eq("status","pending")`, goed tegen dubbel beoordelen) + losse grootboek-insert + best-effort terugdraaien (`conversion-actions.ts:113-132`). Geen transactie, geen unieke index per conversie+accrual. |
| Afwijkingsdefinitie | Elke accrual met `amount ≠ expected`, **inclusief afkeuringen** (0 vs verwacht) (`revenue.ts:96-100`). BR-19 in het plan vraagt een afwijking > 1 % én > €0,50 en "niet controleerbaar" apart. |

### 5.5 Upstream omzet — wat §G in de code betekent

`[FEIT]` §G (#58) = sectie **"Omzet"** op `/admin/partners/[slug]` (`RevenueSection.tsx`):

- **Dekkingslabel**: postback / import / handmatig / "via netwerk — geen omzetregel per klik" / "niet vastgelegd". Nooit "€0" zonder uitleg. **Goed.**
- **Tegels**: Kliks (30 dgn, uit `sup_clicks` via retailer → partner) · Te beoordelen (aantal + verwachte commissie) · Goedgekeurd (som van goedgekeurde accruals) · Afgekeurd (aantal + "gemist")
- Lijst van de nieuwste 25 conversies (datum, type, orderwaarde, verwachte commissie, status, methode). **Geen** product, token, order_ref of external_id in beeld.
- Handmatige invoer, beoordelen (goedkeuren met "ontvangen commissie" of afkeuren), handmatige pending-rij verwijderen
- Signalen `commission_mismatch` (rood) en `conversions_unreviewed` (amber, > 14 d)

**Begrippen door elkaar** `[OORDEEL]`:

- De sectie heet "Omzet" maar toont vooral *commissie*. "Orderbedrag" is de omzet van de partner.
- "Ontvangen commissie" is in werkelijkheid *door de partner bevestigde/goedgekeurde commissie*, niet geld op de rekening.
- "Goedgekeurd" in de tegel = som van `amount_cents`. Dat is wat wij hebben goedgekeurd, niet wat de partner heeft uitbetaald.
- Er is geen onderscheid tussen *afgekeurd door de partner*, *door ons afgekeurd* en *later geannuleerd*.

### 5.6 Signalen — bug

`[FEIT]` `runFullSync()` (`signals.ts:301-311`) roept `computePartnerSignals` aan **zonder** `revenue`. `reconcileScope` zet daarna elk open signaal dat niet in de gewenste set staat op `resolved` (`:98-113`). Gevolg: wie het Vandaag-dashboard opent (`after(syncAllSignals)`, 1× per dag per proces) zet `commission_mismatch` en `conversions_unreviewed` voor **alle partners** op opgelost. Ze komen pas terug bij de volgende mutatie op die partner, met `reopen_count+1`. `conversions_unreviewed` is tijdgedreven (> 14 dagen) en wordt dus in de praktijk nooit gezet zonder handmatige mutatie. De bestaande tests dekken alleen de pure functie, niet de sync.

---

## 6. Affiliate Dashboard Status

Er zijn **drie** weergaven, met drie databronnen en drie tijdlogica's:

| Weergave | Bron | Wat je ziet | Periode | Server-side? | Afkapping |
|---|---|---|---|---|---|
| `/admin/affiliate` (site-sectie, "Affiliate-kliks") | `affiliate_clicks`, `domain_events`, `intake_sessions` | Totaal kliks, kliks 30 d, funnel per vergelijkingspagina (weergaves/kliks/CTR), kliks per pagina/sub-ID/categorie, trend 30 d, intake per bron | Vast: all-time + 30 d | Ja, maar aggregatie in JS | **Ja.** `getClicksPerPage/SubId/Category` en `getClickTrend` halen rijen zonder paginering op → max. 1000 (`supabase/config.toml: max_rows = 1000`). "Totaal kliks" = som over afgekapte rijen. Alleen de funnel gebruikt `count: exact` (correct). Nu 165 rijen, dus nog correct. |
| Partnerdossier → "Omzet" (§G) | `pd_conversions`, `pd_ledger_entries`, `sup_clicks` | Zie §5.5 | All-time (+ kliks 30 d) | Ja, totalen in JS | **Ja.** Conversies `limit(200)`, grootboek `limit(1000)` zonder `order` (`partnerdesk/queries.ts:446-470`) → totalen fout boven die aantallen |
| `/admin/programma/rapportage` (downstream `af_*`) | `af_conversions`, `af_ledger_entries`, `af_clicks` | Per affiliate: kliks, leads, sales, conversie-%, omzet, commissie, EPC; CSV-export | Van–tot (datumvelden) | Ja, filter in de query, grenzen in **UTC** | **Ja.** Geen paginering; `.in("conversion_id", ids)`-URL groeit lineair; fout bij grootboekquery wordt ingeslikt → commissie 0 (`reporting.ts:63-74`) |

**Wat het upstream-dashboard nu laat zien** `[FEIT]`:

| Metric | Beschikbaar? | Waar |
|---|---|---|
| Kliks | 🟡 | `/admin/affiliate` (legacy), dossier (30 d via `sup_clicks`) |
| Unieke kliks | 🔴 | Geen bezoekers-/sessie-ID (bewust, geen PII). Kan ook niet zonder nieuwe identifier. |
| Conversies | 🔴 | Leeg; alleen per partner |
| Conversieratio | 🔴 | — |
| Omzet (orderwaarde) | 🔴 | Alleen per partner, all-time |
| Commissie (verwacht/pending/goedgekeurd/afgekeurd) | 🟡 | Per partner, all-time, afgekapt |
| Geannuleerd | 🔴 | Bestaat niet |
| Payout/ontvangen | 🔴 | Bestaat niet (upstream) |

**Periodefilters**: vandaag, gisteren, 7 d, 30 d, maand, kwartaal, custom → **geen enkele** op upstream-omzet. `/admin/affiliate` heeft vaste vensters. Alleen `af_*`-rapportage heeft van–tot, server-side, maar met UTC-dagen.

**Dimensies** (upstream):

| Dimensie | Kan nu? | Waarom niet |
|---|---|---|
| Product | 🔴 | Geen product op de conversie; token altijd `null` |
| Aanbieding | 🔴 | Idem |
| Retailer | 🟡 | Kliks wel (via `sup_clicks.retailer_id`); conversies alleen via partner |
| PartnerDesk-partner | 🟡 | Alleen per dossier, niet naast elkaar |
| Categorie | 🟡 | Kliks via `affiliate_clicks.categorie`; conversies niet |
| Datum | 🔴 | Geen periode-UI; `period` in het grootboek in UTC |
| Campagne | 🔴 | Upstream bestaat geen campagnebegrip. Daisycon-`ws` = categorie. |
| Klik | 🔴 | Token komt niet terug |
| Conversie | 🟡 | Lijst van de nieuwste 25 per partner |

**Scheiding admin vs dashboard** `[OORDEEL]`: datamanagement (producten, retailers, partners) is netjes gescheiden van prestaties. Maar prestaties zijn versnipperd over een site-pagina (`/admin/affiliate`), een dossiersectie en een downstream-rapport. Er is geen enkele plek die de keten in één beeld laat zien. Het productdossier toont geen prestaties (kliks/conversies per product); dat is verdedigbaar, maar dan moet het in de rapportage zitten, en daar zit het ook niet.

---

## 7. End-to-End Data Flow

### 7.1 Keten met status per stap

```
product          sup_products (published)                          ✅ bestaat — maar 0/25 haalt de poort
 → offer         sup_offers (actief, prijs, affiliate_url)         🟡 bestaat — maar NIET de bron van de live link
 → retailer      sup_retailers (relationship)                      ✅ 3 retailers
 → partner       pd_partners (+ contract + regel)                  🟡 gekoppeld; 2/3 zonder contract/regel
 → link          affiliate-links.ts (statisch)                     ⚠ andere bron dan offer; geen token
 → click         sup_clicks + affiliate_clicks (+GA4/Clarity)      🟡 vastgelegd, geen gedeelde ID
 ✂ token → partner                                                  🔴 BREEKT HIER (token blijft bij ons)
 → conversion    pd_conversions                                    🔴 leeg; netwerk-inname bestaat niet
 → commission    pd_conversions.commission_cents + pd_ledger       🔴 leeg; regels ontbreken voor 2/3 partners
 → omzet         (ontvangen commissie)                             🔴 geen veld/stap
 → reporting     RevenueSection per partner                        🟡 all-time, afgekapt, geen dimensies
 → dashboard     drie losse weergaven                              🟡
```

### 7.2 Attributie — de tien vragen

Upstream = merchantkliks naar Vitaminstore/VitalNutrition/Arctic Blue. Downstream = `af_*` (stoplijst), alleen vermeld waar het verschilt.

| # | Vraag | Upstream nu `[FEIT]` | Downstream (`af_*`) nu |
|---|---|---|---|
| 1 | Wanneer ontstaat een klik? | Bij `onClick` op `AffiliateLink`, **alleen** met marketingtoestemming (anders `preventDefault` + cookie-instellingen) | `GET /r/[ref]` |
| 2 | Unieke identifier? | `sup_clicks.click_token` (12 tekens) en los daarvan `affiliate_clicks.id`. Geen gedeelde ID, token blijft intern. | `af_clicks.id` (niet gekoppeld aan de conversie) |
| 3 | Hoe lang geldig? | Bepaald door de **cookie van het netwerk of de partner**. `pd_contracts.cookie_days` wordt opgeslagen maar **nergens afgedwongen**. | Cookie `psf_aff_ref` 90 dagen |
| 4 | Waar opgeslagen? | Bij Daisycon/Arctic Blue (cookie van derden). Bij ons alleen `sup_clicks` zonder koppeling aan bezoeker/sessie. | First-party cookie |
| 5 | Koppeling conversie? | Alleen als de partner het token teruggeeft, en dat kan nu niet. Anders alleen op partnerniveau. | Cookie-ref bij aanmaken intake-sessie → `af_conversions` (lead, `external_id = intake:<sessie>`) |
| 6 | Meerdere kliks? | Elke klik een nieuw token. Welke klik wint, bepaalt het netwerk (Daisycon werkt doorgaans met last-click `[AANNAME]`). Wij kunnen dat niet reconstrueren. | **Inconsistent.** Server (proxy, `/r/`) = first-click; client op intake-pagina's overschrijft = last-click (`referral-attribution.ts:55-57`) |
| 7 | Meerdere producten? | Eén conversie = één order, geen orderregels. Toewijzing aan het *aangeklikte* product, niet aan de gekochte producten. | n.v.t. |
| 8 | Gebruiker komt terug? | Nieuwe klik → nieuw token; de cookie van de partner wordt (afhankelijk van het netwerk) overschreven | Cookie blijft 90 d; ongeldige `?ref=` die eerst gezet wordt, blokkeert een latere geldige ref via `/r/` |
| 9 | Conversie later gemeld? | Postback accepteert elke `occurred_at`, zonder venstercheck. Een herhaalde melding met nieuwe status wordt genegeerd. | Idem: `UNIQUE(source_id, external_id)` + `ignoreDuplicates` |
| 10 | Dubbele attributie voorkomen? | `UNIQUE(partner_id, external_id)`. **Gat:** dezelfde order eerst via postback en dan handmatig zonder external_id → twee rijen. Handmatig zonder ID → nooit ontdubbeld. | Uniek per bron + check-then-insert voor de accrual (niet atomair) |

**Hoe het zou moeten werken.** Het ontwerp staat in §15. In het kort:

- Klik = server-side redirect `/go/[offerId]`: token aanmaken → `sup_clicks` → token in de partnerparameter (direct) of de netwerk-subid → 302.
- Conversie = inname met `click_token` als primaire match en `order_ref` als terugval.
- Venster = `cookie_days` van het contract dat gold op klikmoment; buiten het venster wordt de conversie wel opgeslagen, maar gemarkeerd als `outside_window`.
- Meerdere kliks: het token dat de partner teruggeeft wint (de partner kent de laatste klik). Wij bewaren alle kliks en tellen er geen bij.
- Status-sync: een herhaalde melding met dezelfde `external_id` **werkt de status bij** (pending → approved/rejected/cancelled) en boekt het verschil als `reversal`/`adjustment`. Ze wordt niet genegeerd.
- Dubbel voorkomen: `UNIQUE(partner_id, external_id)` blijft, `order_ref` wordt verplicht bij handmatige verkoop, en er komt een partiële unieke index op het grootboek.

### 7.3 Getraceerde transactie (echte data, 1 okt 2026)

Gekozen: de klik met token `yK1a…` (verkort). Gegevens uit `sup_clicks` en de gekoppelde tabellen (bijlage A, query 3).

| Stap | Tabel / bron | Record | Waarde | Functie / API | Status |
|---|---|---|---|---|---|
| Product | `sup_products` | `vitalnutrition-d3-k2` | `published`; afbeelding zonder licentie-notitie, 0 bronnen | `loadHubProductsForPage` → `/product/vitalnutrition-d3-k2` | ⚠ haalt de poort niet (afbeelding, bron) |
| Aanbieding | `sup_offers` | 1 rij (actief) | €19,95, `price_checked_at` 2026-09-15, `affiliate_url` host `bdt9.net` | — | 🟡 vers tot 15 okt |
| Retailer | `sup_retailers` | `vitalnutrition` | `network`, `tracking_param` null | — | ✅ |
| Partner | `pd_partners` | `vitalnutrition` | active, Daisycon; 1 contract (`manual`), 1 regel (cps %) | — | ✅ |
| Link | `src/data/affiliate-links.ts` | `vitalnutrition-d3-k2` | `https://bdt9.net/c/?si=18988&li=1816067&wi=407296&ws=vitamine-d&dl=products%2Fvitamine-d3-k2` | `AffiliateLink` (href statisch) | ⚠ subid = categorie, geen token |
| Klik | `sup_clicks` | token `yK1a…` (12 tekens) | 2026-10-01 09:33:00 UTC, pagina `/product/vitalnutrition-d3-k2`, positie `null` | `POST /api/supplements/click` (beacon) | ✅ vastgelegd |
| Klik (legacy) | `affiliate_clicks` | zelfde seconde, `product_id = vitalnutrition-d3-k2` | categorie `vitamine-d` | `POST /api/affiliate/click` | ✅ (geen gedeelde ID) |
| **Token → partner** | — | — | Token zit niet in de URL | — | 🔴 **Keten breekt hier** |
| Conversie | `pd_conversions` | `click_token = yK1a…` | **0 rijen** (partner: 0 conversies totaal) | — | 🔴 |
| Commissie | `pd_ledger_entries` | — | 0 rijen | — | 🔴 |
| Dashboard | Dossier VitalNutrition → Omzet | — | Kliks (30 dgn) = 3; "Nog geen conversies ingevoerd. Dit is geen €0" | `getPartnerRevenue` | 🟡 correct leeg |

Bijvangst: de 4 kliks tussen 09:33 en 09:56 UTC vanaf `/product/*` liggen dicht op elkaar. Dat lijken interne testkliks `[AANNAME]`. Er is geen filter voor intern verkeer.

---

## 8. Critical Gaps

### BLOCKER — zonder dit is betrouwbare affiliate-omzet onmogelijk, of de verplichte poort is feitelijk niet van kracht

| ID | Gat | Bewijs | Wat ontbreekt |
|---|---|---|---|
| **B1** | Geen conversie-inname voor de netwerkrijstrook (Daisycon = 24/25 aanbiedingen, 5/5 kliks) | `pd_conversions` = 0; geen import-/API-code (grep "daisycon") | Import van Daisycon-transacties (CSV eerst) naar `pd_conversions` met statusupdates |
| **B2** | Kliktoken bereikt de partner niet; netwerk-subid = categorie | `AffiliateLink.tsx:45`, `register-click-client.ts:9-14`; `affiliate-links.ts` `ws=<categorie>` | Server-side redirect met token in partnerparameter of netwerk-subid. Beslissing over subid-conventie (B-1). |
| **B3** | Commissieafspraken ontbreken voor 2 van 3 actieve retailerpartners (Vitaminstore 17 aanbiedingen; Arctic Blue) | DB: contracts/rules = 0 | Contract + regel invoeren; signaal "actieve partner met aanbiedingen zonder regel" |
| **B4** | Publiceerpoort geldt niet voor de live catalogus: backfill-bypass, geen DB-afdwinging, poortverval, tijdsverval | §4.2 P1–P4; 0/25 slaagt | Bypass dicht; poort als DB-functie + trigger; nachtelijke herbeoordeling + signaal; dataherstel van de 25 |

### HIGH — belangrijk vóór productie

| ID | Gat | Bewijs |
|---|---|---|
| H1 | Dagelijkse full sync zet omzetsignalen op opgelost; postback herberekent geen signalen | `signals.ts:301-311`; `api/partner/conversion/route.ts` |
| H2 | Afgekapte totalen: 200/1000 per partner, 1000 rijen in het klikdashboard, `af`-rapportage zonder paginering | `partnerdesk/queries.ts:446-470`; `affiliate-analytics.ts:64-158`; `reporting.ts:32-74` |
| H3 | Statuslevenscyclus onvolledig: geen `cancelled`, geen reversal/adjustment/payment_received, "ontvangen" ≠ ontvangen | §5.4 |
| H4 | Postback niet robuust: onbekend token → 500; omzet stil 0; valuta genegeerd; verkeerd contract; geen venster- of partnercheck; `raw` zonder allowlist | §5.3 |
| H5 | Grootboek: beoordelen niet atomair, geen unieke accrual per conversie, `rule_snapshot` zonder regel, staffels genegeerd, afwijking zonder tolerantie en inclusief afkeuringen | §5.4 |
| H6 | Twee bronnen voor de affiliate-URL; product alleen in de admin → geen link; inactieve aanbieding/retailer/partner blijft gelinkt | §3.4, §4.4 |
| H7 | Poort mist criterium "geldige affiliate-route" | §4.2 P7 |
| H8 | Openbare prijs: oude prijzen worden niet verborgen (K7), verzonnen controledatum bij `null`, prijs van inactieve aanbieding op de hub | §4.3 |
| H9 | Productiedata: Viridian → Solgar-deeplink, Viridian 0 mg, Möller's → netwerk "Arctic Blue", 3 eiwitpoeders zonder prijs live, ashwagandha met alleen een inactieve aanbieding live | §4.2, §5.1 |
| H10 | Partnergeheim in platte tekst, geen uitgifte-, rotatie- of intrekkingspad (geen UI; 0 partners met geheim) | §9 S1 |
| H11 | Klik-endpoint: spoofbare rate-limit, geen dedupe/botfilter, willekeurige aanbieding bij N>1 | §5.2 |

### MEDIUM — schaalbaarheid en kwaliteit

| ID | Gat |
|---|---|
| M1 | Geen overzicht over partners heen met periode en dimensies (PartnerDesk F3 `/rapportages`) |
| M2 | Twee kliktabellen zonder gedeelde ID; geen vastgelegde bron van waarheid voor "klik" |
| M3 | Performance: `/supplementen` force-dynamic met ~56 PostgREST-calls per request zonder cache; `.in()`-URL-grenzen; ontbrekende indexen (`sup_clicks` retailer/created_at; `raw_legacy_fields->>affiliateSlug`) |
| M4 | Versheid: afbeeldingen niet meegenomen; `null` = ">90 dgn"-label; geen niveaus |
| M5 | Tijdzone: periodes, `period`, `todayIso()` en dag-sleutels in UTC; `last30DayKeys()` mengt lokale middernacht met UTC (`affiliate-analytics.ts:52-62`) |
| M6 | `sup_scores`/`sup_badges` ongebruikt → geen scoresnapshot bij publicatie |
| M7 | Observability: geen productauditlog (Tijdlijn ontbreekt), health checkt de affiliate-keten niet, afgevangen fouten bereiken Sentry niet |
| M8 | `af_*` (stoplijst): statusovergangen zonder claim (goedkeuren → afkeuren → goedkeuren = goedgekeurd met netto €0), payouts kunnen dezelfde grootboekregel twee keer bevatten, `af_clicks.consent` altijd `false`, ref-cookie op drie plekken met verschillende regels |
| M9 | Retentie: geen termijn voor `sup_clicks`/`af_clicks` (compliance-audit: 13 mnd); `pd_conversions.raw` zonder allowlist |
| M10 | Modelsemantiek: `relationship` vs `network.kind` zonder constraint; `sup_clicks` zonder partnersnapshot (historische telling verschuift als de koppeling wijzigt); `sup_clicks.offer_id ON DELETE CASCADE` wist klikbewijs en zet tokens op conversies op `null` |

### LOW — verbeteringen

| ID | Gat |
|---|---|
| L1 | Euro-invoer: "1.234" (NL voor €1.234) wordt €1,23 (`edit-validation.ts:12-17`, `RevenueSection.tsx:45-50`) |
| L2 | Handmatige conversie zonder external_id/order_ref is niet te ontdubbelen |
| L3 | Elke queryfout in `getPartnerRevenue` toont "omzettabellen bestaan nog niet" |
| L4 | Affiliate-URL niet zichtbaar of bewerkbaar in het productdossier |
| L5 | Prijs per dag via "prijs/dag × porties" teruggerekend (afrondingsruis) en als `source='manual'` vastgelegd |
| L6 | Eén gedeelde admin-identiteit → geen actor in de audit trail |
| L7 | `tracking_param`, `base_url` en `disclosure_label` zijn dode configuratie |
| L8 | Retailer-mapping in de backfill op domein (`ds1.nl`) in plaats van Daisycon-`si` (`offers-backfill.ts:53-58`); fout voor toekomstige Daisycon-campagnes |

---

## 9. Security Findings

| ID | Ernst | Bevinding | Bewijs | Fix |
|---|---|---|---|---|
| S1 | **Hoog** (vóór de eerste postback-partner) | Partnergeheim in platte tekst in `pd_partners.webhook_secret`; geen UI voor uitgifte of rotatie; rate-limit gesleuteld op de eerste 12 tekens van het *aangeboden* geheim → onbeperkt mislukte pogingen met DB-lookup | `route.ts:39-42`, `:86-103`; N9-rest (#82) | Gehashte sleutels (eigen tabel met `partner_id`, `key_hash`, `revoked_at`); uitgifte in het dossier; rate-limit per IP (`getClientIp`) vóór de lookup |
| S2 | Middel | `/api/supplements/click`: rate-limit op spoofbare `x-forwarded-for` → onbeperkt nepkliks die partnerkliktellingen opblazen | `route.ts:31-33` vs `client-ip.ts` | `getClientIp`; in de redirect-architectuur (§15) vervalt het openbare POST-endpoint |
| S3 | Middel | `POST /api/admin/data/sup-backfill` is een destructieve onderhoudsroute (publiceert, overschrijft beheerdata) zonder dry-run of bevestiging | `backfill.ts:121`, `:221-238` | Uitschakelen nu de DB de bron is, of beperken tot "alleen ontbrekende rijen invoegen, nooit status/afbeeldingen" |
| S4 | Middel | Eén gedeeld adminwachtwoord; TOTP alleen actief als `ADMIN_TOTP_SECRET` gezet is (op de server `UNKNOWN`, volgens eerdere afspraak nog uit); met omzetregistratie en straks uitbetalingsgegevens groeit het betalingsrisico | `admin-auth.ts:13-26` | Trigger "meer betalingsrisico" ligt dichtbij → TOTP activeren vóór echte omzetdata |
| S5 | Laag | Een postback kan een token claimen dat bij een andere partner hoort | `conversion-ingest.ts` (geen check) | Token-retailer → partner moet gelijk zijn aan de authenticerende partner |
| S6 | Laag | `pd_conversions.raw` slaat de volledige body op zonder allowlist (mogelijk IP, e-mail van de partner) | `route.ts:128` | Allowlist + strip-job (compliance-audit D3/R5) |
| S7 | Laag ⚖️ | `psf_aff_ref` wordt zonder toestemming gezet (proxy op elke pagina, `/r/`) | `proxy.ts:165-175`, `r/[ref]/route.ts:67-75` | Bij heractivering van `af_*`: consent-afhankelijk maken of als functioneel verantwoorden (juridisch toetsen) |
| S8 | Info (positief) | Proxy bewaakt `/admin/*` en `/api/admin/*`; alle "use server"-acties roepen `requireAdmin()` aan (statische test); HMAC-cookie 12 u, `httpOnly`, `SameSite=strict`; RLS deny-all op `sup_*`/`pd_*`/`af_*`; service-role alleen server-side; `/r/` beschermd tegen open redirect; geen affiliate-portal, dus **geen kruis-affiliate-lek mogelijk** | `proxy.ts:21-36`; `admin-server-actions-auth.test.ts`; `admin-session-cookie.ts:4` | Behouden |
| S9 | Info | `af_affiliates` bevat IBAN, btw, adres in platte tekst (deny-all) | `20260714150000_affiliate_payout_profile.sql` | Acceptabel mono-tenant. Bij een portal: scoped toegang + kolomversleuteling overwegen. |

Secret-management: postback-geheim in de DB (S1); alle andere geheimen in env (niet ingezien). Er staan geen API-sleutels in de code (grep in `src/` op `sb_secret_…`, `sk_live_`, JWT-prefix `eyJhbGciOi` en Resend-sleutels `re_…`: geen treffers).

---

## 10. Data Integrity Findings

| Thema | Bevinding `[FEIT]` | Ernst |
|---|---|---|
| Dubbele conversies | Uniek op `(partner_id, external_id)`. Handmatig zonder ID → `manual-<uuid>` → dubbel mogelijk. Postback + handmatig voor dezelfde order → dubbel. | HIGH |
| Dubbele kliks | Geen dedupe (dubbelklik = 2 tokens, 2 legacy-rijen, 2 GA4-events × 2 namen) | MEDIUM |
| Ontbrekende FK's | `sup_categories.ingredient_claim_key` en `sup_product_claims.efsa_claim_id` → code (bewust, door tests bewaakt); `affiliate_clicks.product_id` = vrije tekst | LOW (bekend) |
| Orphans | `pd_ledger_entries.conversion_id ON DELETE SET NULL`; `sup_clicks` wordt meegewist met de aanbieding (cascade) → `pd_conversions.click_token` wordt `null`: bewijs verdwijnt stil | MEDIUM |
| Verkeerde partnerkoppeling | Möller's → netwerk "Arctic Blue"; `relationship` ↔ `network.kind` zonder constraint | HIGH (data) |
| Verkeerde productkoppeling | Viridian-product → Solgar-deeplink; klik-route kiest een willekeurige actieve aanbieding bij N>1 | HIGH |
| Race conditions | Poort-TOCTOU; beoordelen niet atomair (twee writes + best-effort terugdraaien); `af` payouts zonder unieke `ledger_entry_id` → dubbel uitbetalen mogelijk bij gelijktijdige acties; accrual check-then-insert (`af-ledger.ts:32-65`) | HIGH (geld) |
| Dubbele webhookverwerking | Idempotent op `external_id` ✅; maar statuswijziging via retry onmogelijk (genegeerd) | HIGH |
| Unique constraints ontbreken | `pd_ledger_entries (conversion_id) WHERE kind='accrual'`; `af_payout_items (ledger_entry_id)`; `af_ledger_entries (conversion_id) WHERE kind='accrual'` | HIGH |
| Valuta | Postback negeert `currency` en slaat EUR op | MEDIUM |
| Tijdzones | `period = occurred_at.slice(0,7)` (UTC): een conversie op 1 nov 00:30 Amsterdam valt in oktober. Rapportgrenzen `T00:00:00Z`. `todayIso()` = UTC-datum. | MEDIUM |
| Datumaggregaties | `last30DayKeys()` zet lokale middernacht en neemt dan de ISO-datum. Op een server in CET/CEST verschuift de dag-sleutel en vallen kliks van vandaag buiten de grafiek. Tijdzone van de server: `UNKNOWN`. | MEDIUM |
| Decimal/numeric | DB: overal `int` centen of `numeric(5,2)` ✅. JS: `Math.round(revenueCents * rate / 100)` in float. Dat geeft hooguit 1 cent verschil op `.5`-grenzen; het afrondingsbeleid is niet vastgelegd. | LOW |
| Onmogelijke waarden | DB-checks op ≥ 0 voor prijs, omzet en commissie ✅. Niet gecontroleerd: `discount_percent` (vrij `numeric`), `occurred_at` (toekomst of jaren terug), `amount_per_serving = 0` (toegestaan in DB, poort vangt het af). | LOW |
| Status-transities | Upstream: `pending → approved \| rejected` is eindtoestand; annulering na goedkeuring onmogelijk. Downstream: vrij heen en weer zonder claim → inconsistent grootboek. | HIGH |
| Herkomst | Backfill registreert alle afbeeldingen als `source='own'` zonder verificatie; import en backfill zetten `price_checked_at` op een datum die niet het controlemoment is (paginadatum of `now`) | MEDIUM |

---

## 11. Performance Findings

**Nu** `[FEIT]`:

- `/supplementen` (`force-dynamic`): `loadHubProducts` = 7 categorieën × (6 calls `loadCategoryProducts` + 2 calls `loadInputsForCategory`) ≈ **56 PostgREST-calls per pageview**, zonder cache (`unstable_cache`/`"use cache"` wordt nergens gebruikt; risico L3 uit de analyse is niet gemitigeerd).
- `/product/[slug]`: statisch, maar `loadHubProductBySlugForPage` laadt bij build en revalidatie **alle** hubproducten om er één te vinden.
- Admin-productlijst: 1 + 7 × 7 ≈ 50 calls, en de score per product wordt in JS opnieuw berekend.
- Klik: tot 4 sequentiële calls (lookup via `raw_legacy_fields->>affiliateSlug` zonder index, slug-terugval, aanbieding, insert) **plus** de legacy-route (insert + `domain_events`).
- Omzet per partner: `count` op `sup_clicks` met `retailer_id IN … AND created_at >=`, zonder passende index.
- Hub-loader is hard-coded op 7 categorieën (`COMPARISONS`). Een nieuwe categorie uit de admin komt nooit op de hub. Dat is functioneel, maar raakt schaal.

**Scenario's** `[OORDEEL]` (ontwerpvolume PartnerDesk-plan A13: ≤ 100 partners, ≤ 50k producten, ≤ 100k conversies/jaar):

| Volume | Wat breekt het eerst |
|---|---|
| **25 producten** | Niets. Wel de stille afkapping zodra `affiliate_clicks` > 1000 rijen (nu 165). |
| **1.000 producten** | Admin-lijst kapt af op 1000 rijen; `.in("product_id", …)` per categorie loopt tegen URL-lengtes aan (36 tekens per UUID → enkele honderden ID's ≈ 8–16 KB; exacte grens `UNKNOWN`); `/supplementen` 56 calls met grote payloads per request → latency; scores in JS per request |
| **10.000 producten** | `generateStaticParams` voor alle `/product/*` maakt de build zwaar (build-op-prod op 4 GB); hub laadt de volledige catalogus per request; zoeken in JS (`zoekIndex`); paginering en server-side filter verplicht |
| **100.000+ producten** | Statisch genereren niet haalbaar → on-demand ISR; zoeken via Postgres (pg_trgm/tsvector) of een search-engine; materialized views voor categorie-aggregaten |
| **10k kliks/dag** | ~60k DB-calls/dag: ok. `sup_clicks` groeit 3,6 M/jaar → telling per partner zonder index wordt traag; legacy-dashboard al lang afgekapt. |
| **100k kliks/dag** | 36 M rijen/jaar: index `(retailer_id, created_at)` + dag-rollups + retentie (13 mnd) nodig; in-memory rate-limit per proces is te omzeilen bij meerdere instanties (Redis-backend bestaat, `rate-limit.ts`) |
| **1M kliks/dag** | ~12/s gemiddeld, pieken 50–100/s via één Next-proces met 4–6 HTTPS-calls naar Supabase per klik → bottleneck. Nodig: één insert per klik (offer-ID in de URL), partitionering per maand, asynchrone verwerking/queue, mogelijk edge-redirect. |
| **Conversies** | Ok tot het ontwerpvolume, mits totalen server-side (SQL-view/RPC) en niet in JS over `limit(200)` |

---

## 12. Multitenancy Readiness

**Uitgangspunt (besluit):** multitenancy wordt niet gebouwd; `pd_*` en `af_*` zijn bewust mono; supplementbedrijven zijn upstream partner, geen tenant. Deze sectie respecteert dat.

| Dimensie | Nu | Goed voorbereid? | Technische schuld later | Minimale keuze nu |
|---|---|---|---|---|
| `tenant_id` | `organization_id` op consumententabellen + `affiliate_clicks`; `orgScoped()` voor nieuwe code; `sup_*`/`pd_*`/`af_*` zonder | ✅ conform besluit | — | **Geen** `tenant_id` toevoegen |
| Ownership producten | Catalogus is redactioneel eigendom van het platform | ✅ | Een tenant met eigen producten botst met de onafhankelijkheid (firewall) | Niets |
| Ownership partners | Mono (jouw contracten) | ✅ | — | Niets |
| RLS | Deny-all; isolatie = app-code | 🟡 | Geen tweede muur bij een portal | Bij een partnerportal: scoped laag (`partnerScoped(partnerId)`) analoog aan `orgScoped` |
| Rollen | Eén admin, geen identiteit | 🔴 | Geen audit-actor, geen viewer-rol | Per-user-admin pas bij tweede gebruiker (bestaande trigger) |
| Analytics-isolatie | n.v.t. | — | Partnerrapporten moeten per partner filteren | Kliks en conversies blijven op `retailer_id`/`partner_id` gesleuteld (natuurlijke partitie) + partnersnapshot op de klik |
| Affiliate-isolatie (downstream) | Geen portal → geen lek | ✅ | `af_affiliates.account_id` is de naad | Niets (stoplijst) |
| Machine-toegang | Platte-tekstgeheim per partner | 🔴 | Een API-sleutelmodel is later nodig | **Gehashte sleuteltabel met `revoked_at`** (lost S1 op en is meteen het latere API-sleutelmodel) |

---

## 13. Test Coverage

**Bestaand** (relevant; allemaal groen op 1 okt, 31 bestanden / 261 tests):

| Soort | Wat | Bestand |
|---|---|---|
| Unit | Poort: alle 6 criteria + alles tegelijk; `isFreshPrice`; `productFreshness`; veld-allowlist; scoredekking | `product-admin/__tests__/publish-gate.test.ts` |
| Unit | Validatie product/offer/retailer/import/score-invoer | `product-admin/__tests__/*` |
| Unit | Commissie-resolutie, bedrag | `partnerdesk-commission-resolution.test.ts`, `commission-amount.test.ts` |
| Unit (mock-DB) | Ingest: verwacht bedrag, duplicaat, geen regel, altijd pending | `partnerdesk/__tests__/conversion-ingest.test.ts` |
| Unit | Dekking, review-uitkomst, mismatches, stale pending, omzetsignalen (puur) | `partnerdesk/__tests__/revenue.test.ts`, `partnerdesk-partner-signals.test.ts` |
| Unit | Loaders/backfills (pariteit statisch ↔ DB) | `supplement-catalog-db/__tests__/*` |
| Route | `/api/affiliate/click` (legacy + nurture-token) | `affiliate-click-route.test.ts` |
| Component | Consent-gate op `AffiliateLink`; funnel-dekking | `components/supplements/__tests__/*` |
| Statisch | Elke "use server"-export roept `requireAdmin()` aan | `admin-server-actions-auth.test.ts` |
| Unit | Firewall: score kan geen commissie lezen | `supplement-score/__tests__/firewall.test.ts` |
| Downstream | Attributie, commissie, recompute | `affiliate-*.test.ts` |

**Ontbrekend — kritiek** `[FEIT]`:

| Gebied | Test die ontbreekt |
|---|---|
| Publiceren | `setProductStatusAction` met DB-mock (poort wordt echt uit de DB herberekend); backfill mag niet publiceren; poortverval bij wijzigen van een gepubliceerd product; criterium affiliate-route; DB-trigger (zodra die er is) |
| Klik | `/api/supplements/click`: geen product → `token:null`; inactieve aanbieding; rate-limit-sleutel; dubbelklik |
| Conversie | `/api/partner/conversion`: 401 zonder/met fout geheim, 400-paden, idempotente retry, **onbekend token**, valuta, venster, partner-tokenconsistentie |
| Beoordelen | Gelijktijdig goedkeuren (claim), mislukte grootboek-insert → terugdraaien, afkeuren → 0-accrual |
| Annulering | Bestaat niet → eerst bouwen, dan testen (approved → cancelled → reversal) |
| Signalen | Regressietest: `syncAllSignals(true)` mag `commission_mismatch`/`conversions_unreviewed` **niet** oplossen |
| Rapportage | Totalen boven 200/1000 rijen; periodegrenzen Europe/Amsterdam |
| Security | Proxy op `/api/admin/data/*` en `/admin/*` (route-niveau); cross-partner tokenclaim |
| Cross-tenant | n.v.t. (mono-tenant; niets te testen) |
| DB/E2E | Geen database-integratietests en geen E2E. Minimaal: één E2E klik → `sup_clicks` → (gesimuleerde) inname → grootboek → dossier. |

---

## 14. Observability

| Vraag | Antwoord `[FEIT]` |
|---|---|
| Logging | `console.error` in klik-, postback- en backfillroutes → stdout/journald. Sentry staat aan als `SENTRY_DSN` gezet is (`UNKNOWN` op de server), `tracesSampleRate: 0`, **geen** `captureConsole`: afgevangen fouten (met een 200/500-response) worden geen Sentry-event. |
| Audit trail PartnerDesk | `pd_timeline_events` voor handmatige conversie, goedkeuren/afkeuren, regelwijziging (met diff), statuswijziging partner. **Niet** voor postback-inname. Actor = "user"/"system", zonder identiteit. |
| Audit trail producten | **Geen.** Geen Tijdlijn, geen log van status-, poort- of URL-wijzigingen. Alleen `published_at` en de prijshistorie (1 rij). |
| Health | `/api/health` checkt alleen DB-bereikbaarheid. Geen check op "laatste klik", "laatste inname per partner vs. cadans" of "verouderde prijzen". |
| Dead-man's switch | `cron_runs` alleen voor nurture/retention; er is geen affiliate-cron |

**Kun je reconstrueren "waarom kreeg deze conversie geen commissie?"** Deels:

- **Wel:** `commission_cents = null` betekent "geen regel"; `raw` toont wat de partner stuurde; `contract_id` staat erop; regelwijzigingen staan als diff in de tijdlijn.
- **Niet:**
  - welke regels zijn geëvalueerd en waarom geen enkele won;
  - of `contract_id` het contract was dat gold op `occurred_at` (het is het *nieuwste*);
  - welke regel het verwachte bedrag opleverde (`rule_snapshot` mist regel-ID en percentage);
  - of een eerdere melding met dezelfde `external_id` genegeerd is;
  - welk importbestand of welke run de rij aanleverde.

**Ontbrekende audit trail (minimaal):**

| Wat | Vorm |
|---|---|
| Resolutietrace per conversie | `resolution_trace jsonb`: kandidaatregels + reden + winnaar |
| `matched_by` | `token` / `order_ref` / `subid` / `manual` |
| Inname-log | Per bestand of postback: hash, aantallen ok/dubbel/fout, tijdstip |
| Statusgeschiedenis per conversie | Append-only events |
| Product-events | Status, poortuitslag, URL-wijziging, met tijd en bron |

---

## 15. Recommended Architecture

Uitgangspunt: **bestaande architectuur hergebruiken** (`sup_*`, `pd_*`, `ingestConversion`, `resolveCommissions`, PartnerDesk-UI, signalen). Alleen structurele wijzigingen waar §4–§14 een aantoonbare reden geven. `affiliate_clicks` blijft ongemoeid.

```
PUBLICEREN (integriteit)
  sup_product_gate_failures(product_id) — Postgres-functie (de 5 DB-criteria + affiliate-route + score-snapshot aanwezig)
  ├─ trigger BEFORE UPDATE OF status ON sup_products WHEN NEW.status='published' → weigert bij failures
  ├─ setProductStatusAction: zelfde functie (één definitie; TS-versie blijft voor UI-detail)
  ├─ sup_scores: score vastleggen bij publiceren (model_version + inputs_hash) → hergebruik bestaande tabel
  └─ nachtelijke cron /api/cron/affiliate-integrity: poort opnieuw voor alle published → signaal per product
     (beleid bij falen = beslispunt B-2: blokkeren, automatisch depubliceren of alleen signaleren)

KLIK (één bron: sup_offers)
  <a href="/go/{offerId}?src={surface}&pos={n}" rel="nofollow sponsored" target="_blank">  (consent-gate blijft client-side)
  GET /go/[offerId]  (server)
    1. offer + retailer + partner in één query (actief? host-allowlist?) — anders 302 naar productpagina
    2. sup_clicks insert: token, offer, product, retailer, pd_partner_id-snapshot, page, position, destination_host
    3. URL = affiliate_url + tracking_param=token     (direct, zoals afgesproken in data-bijlage clausule 4)
            of netwerk-subid = token                (Daisycon — beslispunt B-1)
            of ongewijzigd                           (geen afspraak → degradatie volgens §L1)
    4. 302 → partner
  Legacy: client-side trackClick → affiliate_clicks ongewijzigd (dual-write tot de rapportage over is)

CONVERSIE-INNAME (één functie ingestConversion, drie ingangen)
  a. Daisycon-transactie-CSV uit het portaal → PartnerDesk-import (preview, idempotent op transactie-ID, status-sync)
  b. Postback directe partner (gehashte sleutel, partner-tokencheck, venstercheck)
  c. Handmatig (order_ref verplicht bij 'sale')
  matcher: click_token → sup_clicks → offer/product (gedenormaliseerd op de conversie) ; anders order_ref ; anders partnerniveau
  pd_conversions + offer_id, product_id, matched_by, reported_commission_cents, status (+ 'cancelled'), status_changed_at, resolution_trace
  onbekend token → rij opslaan met click_token null + raw.click_token + matched_by='unmatched' (200, geen 500)

GROOTBOEK (append-only, transactioneel via Postgres-RPC)
  accrual (goedkeuren) · reversal (afkeuren/annuleren ná goedkeuren) · adjustment (verschil gerapporteerd vs verwacht) · payment_received (uitbetaling netwerk, met referentie)
  unieke partiële index (conversion_id) WHERE kind='accrual' ; rule_snapshot = {rule_id, contract_id, kind, rate/amount, valid_from}

RAPPORTAGE (in PartnerDesk — §G-besluit)
  SQL-view/RPC pd_revenue_daily(dag in Europe/Amsterdam, partner, retailer, product, categorie, status, metric)
  → PartnerDesk "Omzet"-overzicht (F3 /rapportages): periode (vandaag … custom), dimensies, dekking per partner
  → partnerdossier gebruikt dezelfde RPC (geen limit(200)-sommen meer)

BEWAKING
  signalen: omzetsignalen ook in full sync (fix) ; nieuw: active_partner_without_rule, offer_link_invalid,
            published_product_gate_failed, price_stale, import_overdue (geen inname binnen reporting_cadence)
  health: laatste klik < X uur, laatste inname per partner, aantal poortfouten
```

**Waarom een server-redirect en geen client-side tokeninjectie** `[OORDEEL]`: een link met `target="_blank"` opent het tabblad synchroon bij de klik. Wachten op een token via `fetch` vóór `window.open` loopt tegen popup-blockers aan. Een server-redirect lost in één keer vier dingen op: het token komt in de URL, `sup_offers` wordt de enige URL-bron, de aanbieding is deterministisch (offer-ID in het pad), en het openbare `POST /api/supplements/click` vervalt (S2).

**Bij implementatie:** Next.js 16 wijkt af van wat gangbaar is (AGENTS.md). Controleer route-handler-, redirect- en cache-API's (`"use cache"`/`cacheTag` vs `unstable_cache`) in `node_modules/next/dist/docs/` voordat er code komt.

---

## 16. Implementation Roadmap

Complexiteit: S ≤ 1 dag · M 2–4 dagen · L 1–2 weken. Elke stap = één reviewbare plak (één PR). Migraties volgens CLAUDE.md (`OPENSTAAND.md`, "Blokkeert deploy").

### Fase 1 — noodzakelijk (poort van kracht, omzet meetbaar op partnerniveau)

| # | Wat | Waarom | Afhankelijk van | Compl. | Risico | Bestanden/tabellen |
|---|---|---|---|---|---|---|
| 1.1 | Backfill-bypass dicht: `sup-backfill` uitschakelen of beperken (nooit `status`, afbeeldingen of bronnen overschrijven) | P1/S3: één klik maakt alle poortwerk ongedaan | — | S | Laag | `src/app/api/admin/data/sup-backfill/route.ts`, `src/lib/supplement-catalog-db/backfill.ts` |
| 1.2 | Poort als DB-invariant: functie + trigger + score-snapshot in `sup_scores`; TS-actie gebruikt dezelfde uitslag; criterium "geldige affiliate-route" (§4.4) | B4, P2, P7, P8 | 1.1; beslispunt B-2 | M | Middel (trigger weigert ook terechte SQL-fixes → alleen op de overgang naar `published`) | nieuwe migratie `…_sup_publish_gate.sql`, `publish-gate.ts`, `actions.ts`, `product-admin/queries.ts` |
| 1.3 | Nachtelijke integriteits-cron + signalen (poort, prijsversheid, link-host) | P3/P4: poortverval zichtbaar maken | 1.2 | M | Laag | `src/app/api/cron/affiliate-integrity/route.ts` (nieuw), `cron/README.md`, `pd_signals` (subject_type `product`) |
| 1.4 | **Data herstellen** (geen code): licentie-notities en bronnen voor 24 producten, prijzen voor 3 eiwitpoeders, actieve aanbieding voor ashwagandha-KSM66, Viridian-dosis en -link verifiëren, Möller's-netwerk corrigeren | 0/25 → 25/25 | 1.1 (anders overschreven) | M (redactie) | Laag | admin-UI |
| 1.5 | Signaalbug fixen (omzet in full sync) + postback herberekent signalen + tijdlijn-event; nieuw signaal "actieve partner met aanbiedingen zonder regel" | H1, B3-zichtbaarheid | — | S | Laag | `src/lib/partnerdesk/signals.ts`, `partner-signals.ts`, `api/partner/conversion/route.ts` |
| 1.6 | Commissieafspraken invoeren (Vitaminstore, Arctic Blue): contract + regel + `reporting_method` (geen code) | B3 | 1.5 | S (data) | Laag | PartnerDesk-UI |
| 1.7 | **Netwerk-conversie-import** (Daisycon-CSV uit het portaal): preview, idempotent op transactie-ID, **status-sync** (pending/approved/rejected/cancelled), matcher op subid/token | B1 | 1.8 (status + grootboek) | M–L | Middel (formaat Daisycon-export: `UNKNOWN`, eerst één export bekijken) | `src/lib/partnerdesk/conversion-import.ts` (nieuw), `RevenueSection.tsx`, migratie `pd_conversions` (status `cancelled`, `reported_commission_cents`, `matched_by`, `status_changed_at`) |
| 1.8 | Grootboek atomair + volledig: RPC voor beoordelen/annuleren (accrual/reversal/adjustment), unieke partiële index, volledige `rule_snapshot`, `payment_received` handmatig | H3, H5 | — | M | Middel (geld) | migratie (RPC + index), `conversion-actions.ts`, `revenue.ts` |
| 1.9 | Totalen server-side: SQL-view/RPC per partner met periodefilter in Europe/Amsterdam; dossier gebruikt die i.p.v. `limit(200)`-sommen | H2, M5 | 1.8 | M | Laag | migratie (view/RPC), `partnerdesk/queries.ts`, `RevenueSection.tsx` |

### Fase 2 — productie (attributie tot op klik en product)

| # | Wat | Waarom | Afhankelijk van | Compl. | Risico | Bestanden/tabellen |
|---|---|---|---|---|---|---|
| 2.1 | `/go/[offerId]`-redirect; `sup_offers` = enige URL-bron; `AffiliateLink` krijgt een interne href (consent-gate, `nofollow sponsored`, `_blank` blijven); `affiliate_clicks` dual-write ongewijzigd | B2, H6, H11, S2 | 1.2 (geldige route), beslispunt B-1 | M–L | **Middel-hoog**: raakt alle live affiliate-links; vóór/na vergelijken per slug | `src/app/go/[offerId]/route.ts` (nieuw), `AffiliateLink.tsx` + 5 componenten (9 plekken), `click-token.ts`, migratie `sup_clicks` (+`pd_partner_id`, `destination_host`; FK zonder cascade) |
| 2.2 | Token in partnerparameter/netwerk-subid per retailer (`tracking_param`); matcher in import en postback | B2 | 2.1, B-1 | S–M | Middel (Daisycon-ondersteuning tweede subid: `UNKNOWN`) | `sup_retailers.tracking_param`, `conversion-import.ts`, `conversion-ingest.ts` |
| 2.3 | Postback hardenen: gehashte sleutels + uitgifte/rotatie in het dossier; onbekend token → 200 + `unmatched`; valuta-, venster- en partner-tokencheck; raw-allowlist | H4, H10, S1, S5, S6 | 1.8 | M | Middel | migratie `pd_partner_keys`, `api/partner/conversion/route.ts`, `conversion-ingest.ts`, dossier-UI |
| 2.4 | K7 publiek: prijs > 30 d → geen bedrag; geen verzonnen datum; alleen actieve aanbiedingen; afbeelding-versheid | H8, M4 | — | S–M | Laag | `hub-loader.ts`, `ProductDetail.tsx`, `ProductCatalogCard.tsx`, `publish-gate.ts` |
| 2.5 | Observability: product-events (Tijdlijn), inname-log, resolutietrace, health-uitbreiding, Sentry-capture op klik/inname | M7, §14 | 1.7, 2.1 | M | Laag | nieuwe tabel `sup_product_events`, `api/health/route.ts`, Sentry-config |
| 2.6 | Tests uit §13 (route-tests postback en `/go`, sync-regressie, review-race, periodegrenzen, één E2E) | Borging | per stap | M | Laag | `__tests__/` naast de code |

### Fase 3 — schaalbaarheid

| # | Wat | Waarom | Afh. | Compl. | Risico | Bestanden/tabellen |
|---|---|---|---|---|---|---|
| 3.1 | Indexen (`sup_clicks (retailer_id, created_at)`, `(product_id, created_at)`); dag-rollups; retentie 13 mnd voor `sup_clicks` | M3, M9 | 2.1 | S–M | Laag | migratie, `cron/retention` |
| 3.2 | Caching van publieke loaders (tags + revalidatie bij publiceren); geen `.in()` met grote lijsten (RPC/joins); admin-paginering | M3 | — | M | Middel (cache-invalidatie) | `supplement-catalog-db/*`, `product-admin/queries.ts` |
| 3.3 | Legacy `/admin/affiliate` laten opgaan in de PartnerDesk-rapportage op `sup_clicks` (tabel `affiliate_clicks` blijft ongemoeid) | M2 | 2.1, 1.9 | S | Laag | `src/app/admin/affiliate/*`, `DeskShell.tsx` |
| 3.4 | Optioneel: Daisycon-API-adapter (vervangt handmatige CSV) via cron + inname-log | Minder handwerk | 1.7 | M | Middel (credentials, API-voorwaarden) | `src/lib/partnerdesk/adapters/daisycon.ts` |
| 3.5 | Bij 100k–1M kliks/dag: partitionering per maand, async inname, edge-redirect | §11 | 3.1 | L | Middel | — |

### Fase 4 — commerciële uitbreiding

| # | Wat | Waarom | Voorwaarde |
|---|---|---|---|
| 4.1 | Periodieke partneroverzichten (CSV/PDF: kliks, conversies, commissie, geschillen) per partner | Contractueel relevante rapportage | Fase 1–2 + één maand gereconcilieerde data |
| 4.2 | Geschil- en correctieworkflow (betwiste conversie, status, bewijs = raw + klik) | Onderhandelingspositie | 2.3, 2.5 |
| 4.3 | Niet-partnernorm per categorie (§K2-toevoeging) + per product zichtbare commerciële relatie | Omnibus-transparantie | 1.2 |
| 4.4 | Read-only partnerportal (alleen eigen data, gehashte sleutel/login, `partnerScoped`) | Schaal van partnerrelaties | 2.3; trigger: > 5 directe partners |
| 4.5 | Multi-tenancy | — | Alleen bij een getekende betalende klant (besluit) |

---

## 17. Definition of Done

"Affiliate-dashboard + PartnerDesk-omzet is productieklaar" als **alles** hieronder aantoonbaar waar is:

**Integriteit**
- [ ] 25/25 (en elk nieuw) gepubliceerd product haalt de poort, inclusief het criterium "geldige affiliate-route"; query in bijlage A geeft `pass = published`
- [ ] Publiceren kan langs **geen** pad zonder poort (server action, backfill, SQL) — afgedwongen door een DB-trigger, met een test
- [ ] Poortverval wordt binnen 24 uur gesignaleerd (cron + signaal), en het beleid uit B-2 is uitgevoerd
- [ ] Publiek: geen prijs ouder dan 30 dagen als bedrag, nooit een verzonnen controledatum

**Keten**
- [ ] Elke live affiliate-link komt uit `sup_offers` (één bron); `affiliate-links.ts` is alleen nog een backfillbron of verwijderd
- [ ] Elke klik heeft één `sup_clicks`-rij met offer, product, retailer en partnersnapshot; het token staat in de uitgaande URL bij elke retailer met een afgesproken parameter
- [ ] Netwerkconversies (Daisycon) staan binnen de afgesproken cadans in `pd_conversions`, met statusupdates; de import is idempotent (tweede import van hetzelfde bestand = 0 nieuwe rijen)
- [ ] Een onbekend token geeft nooit dataverlies (200 + `unmatched`)
- [ ] Elke actieve partner met aanbiedingen heeft een contract met regel, of staat expliciet op "geen commissie"

**Geld**
- [ ] Verwachte, gerapporteerde, goedgekeurde, afgekeurde, geannuleerde en ontvangen commissie zijn aparte, benoemde getallen
- [ ] Grootboek append-only, één accrual per conversie (DB-index), annulering = reversal, beoordelen is atomair
- [ ] Reconciliatie: één volledige maand komt tot op de cent overeen met het Daisycon-portaal (verschil = 0 of verklaard per regel)

**Rapportage**
- [ ] PartnerDesk-overzicht over partners heen: periodes vandaag/gisteren/7 d/30 d/maand/kwartaal/custom, server-side, dagen in Europe/Amsterdam
- [ ] Uitsplitsing naar partner, retailer, product, aanbieding, categorie en datum; totalen kloppen boven 1000 rijen (test)
- [ ] Dekking per partner zichtbaar (methode + laatste inname); nooit "€0" zonder dekkingslabel

**Borging**
- [ ] Tests uit §13 aanwezig en groen; één E2E klik → inname → grootboek → dashboard
- [ ] Signalen overleven de dagelijkse sync (regressietest)
- [ ] "Waarom geen commissie?" is per conversie te beantwoorden uit opgeslagen data (resolutietrace, `matched_by`, inname-log)
- [ ] Partnergeheimen gehasht, uitgifte en rotatie in de UI; admin-TOTP actief
- [ ] Health/alert bij: geen kliks > X uur, inname over cadans, poortfouten > 0

---

## 18. Implementatievoorstel — "Wat zou ik nu daadwerkelijk bouwen?"

Beperkt tot wat de huidige affiliate-infrastructuur betrouwbaar maakt. **Geen** `af_*`-werk (stoplijst), **geen** uitbreiding van `/admin/import`, **geen** multitenancy, **geen** los dashboard naast PartnerDesk.

### MUST HAVE — zonder dit is het systeem niet betrouwbaar

1. **Poort van kracht maken.** Backfill-bypass dicht (1.1), DB-functie + trigger + score-snapshot + criterium affiliate-route (1.2), nachtelijke herbeoordeling (1.3), data van de 25 producten op orde (1.4).
2. **Signaalbug + signaal "actieve partner zonder regel"** (1.5), en de ontbrekende commissieafspraken invoeren (1.6).
3. **Daisycon-transactie-import met status-sync** (1.7). Dat is de enige weg naar echte omzetcijfers voor 24 van de 25 aanbiedingen.
4. **Grootboek compleet en atomair** (1.8): reversal bij annulering, unieke accrual, volledige `rule_snapshot`, `payment_received`.
5. **Server-side totalen met periode** (1.9).
6. **Klik-attributie via `/go/[offerId]` + token in de subid/parameter** (2.1, 2.2). Pas dan is "via welk product, welke klik" te beantwoorden. Vereist beslispunt B-1.

### SHOULD HAVE — vóór serieuze commerciële inzet

- Postback hardenen + gehashte partnersleutels (2.3). **Verplicht vóór de eerste directe postback-partner.**
- K7 op publieke pagina's + afbeelding-versheid (2.4).
- Product-Tijdlijn, inname-log, resolutietrace, health/alerts (2.5).
- De tests uit §13 (2.6).
- Admin-TOTP activeren (S4).
- Indexen + retentie `sup_clicks` (3.1); `/admin/affiliate` laten opgaan in PartnerDesk (3.3).

### LATER — niet nodig voor de huidige fase

- Daisycon-API-adapter (3.4) zolang een maandelijkse CSV volstaat.
- Caching en paginering (3.2) tot er > ~200 producten zijn of de hub merkbaar traag wordt.
- Staffels in de verwachte commissie (pas als een contract staffels heeft; nu 0).
- Partnerportal, partneroverzichten, geschilworkflow (fase 4).
- `af_*`-integriteitsfixes (M8) bij heractivering van het programma.
- `/admin/import`-uitbreidingen (feeds, mapping, EAN-ontdubbeling).
- Multitenancy.

---

## 19. Commerciële readiness

> *Wanneer is deze architectuur technisch volwassen genoeg om gesprekken met bedrijven/partners aan te gaan?*

Er zijn geen omzetvoorspellingen. Het oordeel gaat alleen over technische criteria `[OORDEEL]`:

| Soort gesprek | Nu mogelijk? | Voorwaarde |
|---|---|---|
| Verkennend gesprek, data-bijlage voorleggen, **zonder** rapportagebeloftes | ✅ Ja | — |
| Commissie onderhandelen met eigen cijfers ("wij leveren X conversies via jullie") | ❌ | Fase 1 + één maand gereconcilieerd met Daisycon |
| Direct contract met postback en productniveau-rapportage (clausule 4, optie 1) | ❌ | Fase 1 + 2.1–2.3 + testklik/testconversie (SPEC §9) |
| Contractuele rapportageplicht richting partner (maandoverzicht, geschillen) | ❌ | + 4.1/4.2, audit trail (2.5) |

**Checklist** (stand 1 okt 2026):

```text
[ ] Tracking betrouwbaar                       — kliks vastgelegd, maar token bereikt partner niet; geen gedeelde klik-ID
[ ] Conversions betrouwbaar                    — 0 conversies; netwerkinname bestaat niet
[ ] Commissie betrouwbaar                      — regels ontbreken voor 2/3 partners; geen annulering; review niet atomair
[ ] PartnerDesk-koppeling betrouwbaar          — retailers ✓ gekoppeld; Möller's-netwerk fout; geen signaal bij ontbrekende regel
[ ] Rapportage reproduceerbaar                 — afgekapte totalen, geen periode, UTC
[ ] Data-audit trail aanwezig                  — deels (PartnerDesk-tijdlijn); niets voor producten, inname, resolutie
[~] Security gecontroleerd                     — admin-grens ✓; partnergeheim platte tekst, TOTP-status onbekend, spoofbare klik-rate-limit
[ ] Fouten detecteerbaar                       — geen affiliate-health, geen alert, signaalbug
[ ] Productdata publiceerbaar volgens gate     — 0/25
[ ] Affiliate links gecontroleerd              — geen linkcheck; Viridian → Solgar
[ ] Schaalbaarheid getest                      — niet getest; stille afkapping vanaf 200/1000 rijen
[~] Documentatie aanwezig                      — spec + data-bijlage ✓; spec loopt achter op code (500 vs 200)
```

**Concrete technische voorwaarden die nog ontbreken** (in volgorde): poort als invariant · netwerkinname met status-sync · volledige commissieconfiguratie · atomair grootboek met annulering · server-side periodetotalen · token in de uitgaande URL · gehashte partnersleutels · audit trail voor inname en resolutie · reconciliatie van één maand.

---

## 20. Mijn aanbevolen volgende stap

Maximaal vijf acties, in volgorde van afhankelijkheid:

1. **Poort van kracht maken.** `sup-backfill` dicht (S), daarna de poort als DB-functie + trigger met het criterium "geldige affiliate-route" en een nachtelijke herbeoordeling (M). Parallel de data van de 25 producten op orde brengen (licentie-notities, bronnen, 3 prijzen, ashwagandha-aanbieding, Viridian verifiëren). *Eerst, omdat al het latere linkwerk ervan uitgaat dat een gepubliceerd product een geldige aanbieding heeft.*
2. **Commissie compleet + signalen kloppend.** Full-sync-bug fixen, signaal "actieve partner zonder regel", contracten en regels voor Vitaminstore en Arctic Blue invoeren (S + data). *Zonder regels levert elke ingenomen conversie `commission = null` op.*
3. **Daisycon-transactie-import met status-sync en een atomair grootboek** (inclusief `cancelled` → reversal, unieke accrual, volledige `rule_snapshot`), plus server-side totalen met periode in Europe/Amsterdam. *Na deze stap is "hoeveel commissie, bij welke partner, in welke periode" voor het eerst betrouwbaar te beantwoorden. Eerst één echte Daisycon-export bekijken om het formaat vast te stellen.*
4. **Klik-attributie: `/go/[offerId]` met het token in de subid/parameter**, `sup_offers` als enige URL-bron. *Voorwaarde: beslispunt B-1 (subid-conventie). Pas dan worden "via welk product, aanbod en welke klik" beantwoordbaar.*
5. **Borgen:** de tests uit §13 (vooral postback, `/go`, sync-regressie en review-race) en één maand reconciliatie tegen het Daisycon-portaal als acceptatiecriterium vóór welke omzetclaim richting partners dan ook.

---

## Bijlage A — Gebruikte read-only queries (reproduceerbaar)

Uitgevoerd op 1 okt 2026 met `npx supabase db query --linked -o csv` (route van `npm run check:db-schema`). Alleen `select`.

**1. Kerncijfers** (fragment; de volledige versie telt per tabel en status op dezelfde manier):

```sql
select 'sup_products.' || status, count(*)::text from public.sup_products group by status
union all select 'sup_offers.active', count(*)::text from public.sup_offers where active
union all select 'sup_offers.affiliate_url_null', count(*)::text from public.sup_offers where affiliate_url is null
union all select 'sup_offers.price_checked_older_30d', count(*)::text from public.sup_offers where price_checked_at < now() - interval '30 days'
union all select 'sup_product_images.license_note_set', count(*)::text from public.sup_product_images where coalesce(trim(license_note), '') <> ''
union all select 'sup_sources.product_rows', count(*)::text from public.sup_sources where product_id is not null
union all select 'sup_clicks.total', count(*)::text from public.sup_clicks
union all select 'pd_conversions.with_click_token', count(*)::text from public.pd_conversions where click_token is not null
union all select 'pd_partners.webhook_secret_set', count(*)::text from public.pd_partners where webhook_secret is not null
order by 1;
```

**2. Poortbenadering voor gepubliceerde producten** (zonder scorecriterium):

```sql
with p as (
  select sp.id,
    exists (select 1 from public.sup_product_images i where i.product_id = sp.id
            and coalesce(trim(i.source), '') <> '' and coalesce(trim(i.license_note), '') <> '') as img_ok,
    (exists (select 1 from public.sup_product_actives a where a.product_id = sp.id)
     and not exists (select 1 from public.sup_product_actives a where a.product_id = sp.id
                     and (a.amount_per_serving is null or a.amount_per_serving <= 0 or coalesce(trim(a.unit), '') = ''))) as actives_ok,
    not exists (select 1 from public.sup_product_claims c where c.product_id = sp.id and not c.meets_condition) as claims_ok,
    exists (select 1 from public.sup_offers o where o.product_id = sp.id and o.active
            and o.price_checked_at is not null and o.price_checked_at::date >= current_date - 30) as offer_ok,
    exists (select 1 from public.sup_sources s where s.product_id = sp.id) as source_ok
  from public.sup_products sp where sp.status = 'published'
)
select count(*) filter (where img_ok and actives_ok and claims_ok and offer_ok and source_ok) as pass,
       count(*) as published from p;
```

**3. Kliktrace** (`sup_clicks` → aanbieding → retailer → partner → conversies; token verkort weergegeven):

```sql
select left(k.click_token, 4) || '…', k.created_at, k.page, sp.slug, sr.slug, sr.relationship, pp.slug,
       o.active, split_part(o.affiliate_url, '?', 1),
       (select count(*) from public.pd_conversions cv where cv.click_token = k.click_token)
from public.sup_clicks k
join public.sup_products sp on sp.id = k.product_id
join public.sup_retailers sr on sr.id = k.retailer_id
join public.sup_offers o on o.id = k.offer_id
left join public.pd_partners pp on pp.id = sr.pd_partner_id
order by k.created_at;
```

## Bijlage B — Open beslispunten voor Dennis

| ID | Vraag | Opties | Aanbeveling |
|---|---|---|---|
| **B-1** | Hoe gaat het kliktoken mee naar Daisycon? | (a) tweede subid-parameter, als Daisycon die ondersteunt en per transactie rapporteert; (b) `ws=<token>` in plaats van `ws=<categorie>`: botst met de subid-conventie in CLAUDE.md, categorie blijft afleidbaar uit de klik; (c) geen token voor het netwerk: dan geen product-/klikattributie voor 24/25 aanbiedingen | (a) eerst verifiëren in de Daisycon-documentatie of -export; zo niet, (b) met aanpassing van de CLAUDE.md-regel |
| **B-2** | Wat gebeurt er als een gepubliceerd product later de poort niet meer haalt? | (a) wijziging weigeren; (b) automatisch terug naar concept; (c) alleen signaal + termijn | (a) voor admin-wijzigingen, (c) met 7 dagen termijn voor tijdsverval (prijs). Automatisch depubliceren raakt SEO en omzet zonder menselijke blik. |
| **B-3** | De 25 live producten falen nu | (a) tijdelijk depubliceren; (b) laten staan + data binnen een vaste termijn op orde | (b), met trigger op nieuwe publicaties meteen actief |
| **B-4** | Waar komt het upstream-overzicht? | (a) PartnerDesk (`/rapportages` + Vandaag-tegel, conform §G); (b) los dashboard | (a); (b) wijkt af van het §G-besluit |
| **B-5** | `sup-backfill` en de andere backfill-routes | (a) verwijderen; (b) beperken tot "alleen ontbrekende rijen" | (a) voor `sup-backfill` zodra de DB de bron is; de andere zijn niet-destructief (prijs, verpakking, score-invoer slaan bestaande waarden over) |
| **B-6** | Hoe ver gaat PartnerDesk-werk, gezien "niet nu, met trigger" (15 aug, artifact) en "afmaken" (30 aug, §B)? | Er staan nu 5 partners (3 actief); omzet is onbekend | Alleen wat omzet meetbaar en correct maakt (§18 MUST); verdere PartnerDesk-features pas na de trigger. Leg de trigger vast in `docs/plan/` als die blijft gelden. |
| **B-7** | Viridian-product ↔ Solgar-deeplink | Link aanpassen of product herzien | Eerst verifiëren bij Vitaminstore |
