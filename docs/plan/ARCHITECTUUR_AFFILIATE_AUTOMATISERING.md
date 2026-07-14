# Architectuur-blueprint — Eigen affiliate-platform (mono-tenant, app-first)

*Toekomstbestendig ontwerp voor een zelf-beheerd affiliate-programma rondom Leefstijlcheck: eigen partners, eigen commissieafspraken, eigen tracking, eigen uitbetalingen. Mono-tenant nu, met naden voor latere partnerlogins en optionele externe koppelingen — zonder die complexiteit nu te bouwen.*

Datum: 14 juli 2026 · Status: **v2 — mono-tenant-first** (vervangt de n8n-hub-framing van v1) · Vervolg: fase-3A-plan in reviewbare plakken.

> Leeswijzer: dit document beantwoordt de architectuurvraag "extreem solide mono-tenant fundament dat later uitbreidbaar is, zonder nu te over-abstraheren". Het begint met de kernbeslissingen, gaat dan naar het datamodel en de naden, en eindigt met een concreet MVP-criterium en de fasering.

---

## 0. Kernbeslissingen

### 0.1 Mono-tenant is de keuze — en dat is twee assen, niet één
Twee assen die vaak worden verward. Ze uit elkaar houden is de sleutel tot een goedkoop, uitbreidbaar fundament:

- **Tenancy-as** — één organisatie/administratie/eigenaar vs. meerdere organisaties die elk hun eigen omgeving beheren (coaches, praktijken, white-label). → **Single-tenant. Nu en voorlopig.** Dit is de dúre as; die slaan we volledig over. Geen `org_id`, geen tenant-scoping, geen organisatiestructuur.
- **Actor-as** — wie kan inloggen. Een affiliate die later inlogt om **alleen zijn eigen cijfers** te zien is **geen multi-tenancy**; het is externe, per-affiliate gescopete leestoegang op één administratie. → **Uitgesteld, maar goedkoop toe te voegen** (§7).

Consequentie: "partnerlogins toevoegen" is later géén her-architectuur, maar een nullable koppeling + een paar RLS-policies + een dashboard. Dat maakt uitstellen veilig.

### 0.2 App-first, niet n8n-first
De applicatie (Next.js + Postgres) is de **enige bron van waarheid** en het fundament. Directe partnerships en eigen attributie zijn de kern. **n8n, externe netwerken (Daisycon), boekhoud-push en de partnerportal zijn ontworpen náden — geen fundament.** We ontwerpen de naad nu (zodat aansluiten later triviaal is), maar bouwen de integratie pas als hij nodig is. Je wilt niet afhankelijk zijn van Daisycon; in dit ontwerp is Daisycon hooguit één optionele bron-adapter, en de MVP draait er niet om.

### 0.3 Twee "partners" — verschillende populaties, gescheiden datamodel
| | **`pd_partners`** (PartnerDesk, fase 1) | **`af_affiliates`** (dit programma, nieuw) |
|---|---|---|
| Wie | Bedrijven waar jij commissie *ontvangt* (upstream) | Partners die jóuw ding promoten en die jíj betaalt (downstream) |
| Geldrichting | Netwerk/merchant → jou | Jou → affiliate |
| Bron | Externe netwerk-data | Jouw eigen site-tracking |

Dit zijn tegengestelde geldrichtingen. **Bouw ze als aparte tabellen** (`af_`-laag naast `pd_`). Niet verenigen "omdat het allebei partners zijn" — dat is de klassieke modelleerval. In de UI mag je beide "partners" noemen; in de data niet.

### 0.4 Eén ledger-kern verbindt alles
Clicks → leads → sales → commissie → uitbetaling zijn dezelfde keten. Ze slaan neer in één **append-only grootboek** (centen, states, tegenboekingen). Rapportages, uitbetalingen, boekhouding én de latere portal zijn allemaal *views* op die kern. Bouw 'm nu goed; alles daarna is een view of adapter.

---

## 1. Architectuur (app-first lagen)

```
┌─ Applicatie (Next.js) — system of record + business rules + UI ────────────┐
│  • Affiliate-beheer (admin): affiliates, commissieafspraken, links         │
│  • Attributie: eigen referral-hook → conversies (lead/sale)                │
│  • Commissie-engine (bestaand commission-resolution.ts — hergebruik)       │
│  • Ledger-services: accrue → approve → pay + reconciliatie + rollups        │
│  • Rapportage (admin nu; affiliate-portal later)                           │
├────────────────────────────────────────────────────────────────────────────┤
│─ Data (Postgres/Supabase) ── canonieke af_-kern + pd_-dossier ─────────────│
│  RLS: nu deny-all/service-role (mono-tenant); per-affiliate policies later  │
└───────────────┬───────────────────────────────────────────┬────────────────┘
   ONTWORPEN NAAD (nu leeg)                       ONTWORPEN NAAD (nu leeg)
   af_sources: 'manual'/'csv'                     af_financial_events (outbox)
   later: n8n pull-adapter (Daisycon…)            later: n8n push → boekhouding/PSP
```

De stippellijnen zijn **naden**: tabellen/contracten die nu bestaan maar waarvan de externe kant (n8n-workflows) later komt. De app functioneert volledig zonder die integraties — je voert conversies desnoods handmatig of via CSV in via dezelfde idempotente weg.

**Harde regel (blijft gelden, ook als n8n later komt):** *de app is de enige waarheid; n8n houdt nooit onherleidbare state.* Valt een integratie weg, dan blijft de administratie kloppen.

---

## 2. Wat nu in de app, wat later een integratie is

| Taak | Nu | Later |
|---|---|---|
| Affiliates + commissieafspraken beheren | **App (admin)** | — |
| Attributie (ref → lead/sale) | **App** (bestaande referral-hook uitbreiden) | — |
| Commissie berekenen (verwacht bedrag) | **App** (engine-hergebruik) | — |
| Conversies registreren (idempotent) | **App** — handmatig/CSV via `af_sources='manual'` | n8n pull-adapter (Daisycon e.a.) via dezelfde ingest |
| Grootboek + uitbetalingsbatch | **App** | — |
| Uitbetaling markeren | **App** (handmatig) | n8n → PSP |
| Financiële events naar boekhouding | **App** schrijft outbox | n8n leest outbox → boekhoudpakket |
| Rollups/statistiek | **App**, on-demand/gepland | n8n-scheduler triggert |
| Partner ziet eigen cijfers | — (jij rapporteert) | **App** affiliate-portal |
| Alerts bij afwijking | **App** signaal-engine | n8n fan-out naar kanalen |

Vuistregel bij twijfel: moet het overleven als een externe koppeling wegvalt? → **app, nu**. Is het een externe koppeling of tijdschema? → **naad ontwerpen, integratie later**.

---

## 3. De ledger-kern (canoniek datamodel, `af_`)

Alle bedragen in **centen (int)**. Geld-tabellen append-only: een geboekte regel muteer je nooit, je boekt een **tegenregel**.

```
af_sources            -- elke databron/bestemming als rij (modulair; nu: 'manual'/'csv')
  id · kind ('manual'|'csv'|'network'|'bookkeeping'|'psp') · name · config jsonb · is_active

af_affiliates         -- partners in JOUW programma; beheerd door jou
  id · account_id (→ bestaand accounts) NULLABLE   ← de naad naar login (§7)
  · display_name · company · email · status ('active'|'paused'|'ended')
  · default_commission_rule_id · payout_details jsonb · notes · created_at · archived_at

af_links              -- trackbare links per affiliate
  id · affiliate_id · ref (uniek, in URL) · target_url · campaign · created_at

af_clicks             -- ruw, kort bewaard (attributievenster + debug), daarna geaggregeerd
  id · source_id · affiliate_id · link_id · ref · external_id (dedupe)
  · occurred_at · ip_hash · ua_hash · consent boolean · raw jsonb

af_conversions        -- lead of sale; canoniek, idempotent
  id · source_id · affiliate_id · external_id (UNIQUE per source) · type ('lead'|'sale')
  · occurred_at · order_ref · revenue_cents · currency ('EUR')
  · status ('pending'|'approved'|'rejected') · click_id (attributie, nullable)
  · intake_session_id (nullable, koppeling naar bestaande funnel) · raw jsonb · imported_at

af_ledger_entries     -- HET grootboek: append-only, elke geldbeweging één regel
  id · affiliate_id · conversion_id (nullable) · kind
       ('accrual'|'adjustment'|'reversal'|'payout'|'fee')
  · amount_cents · state ('pending'|'approved'|'paid'|'rejected')
  · expected_cents (via engine; voor afwijkingsdetectie) · period (YYYY-MM)
  · posted_at · source_id · note · reverses_entry_id (nullable)

af_payouts            -- uitbetalingsbatch aan een affiliate
  id · affiliate_id · period · total_cents · status
       ('draft'|'approved'|'sent'|'paid'|'failed') · bookkeeping_ref · psp_ref
  · created_at · paid_at

af_payout_items       -- welke ledger-regels in welke payout · PK(payout_id, ledger_entry_id)

af_financial_events   -- boekhouding-AGNOSTISCHE outbox (tabel bestaat nu; consumer later)
  id · kind ('commission_expense'|'payout') · period · gross_cents · vat_cents
  · counterparty · state ('new'|'exported'|'error') · payload jsonb · created_at · exported_at

af_daily_rollups      -- voorberekende statistiek (schaalbaarheid, §8)
  affiliate_id · day · clicks · leads · sales · revenue_cents · commission_cents
  · PK(affiliate_id, day)
```

**Hergebruik:** `af_affiliates.default_commission_rule_id` + de bestaande `commission-resolution.ts` bepalen het verwachte commissiebedrag per conversie → `af_ledger_entries.expected_cents`. Zelfde engine als fase 1.

**Afgeleide cijfers zijn views, nooit apart bijgehouden:** openstaande commissie = Σ `approved` − Σ `paid`; uitbetaald = Σ `paid`. Dat wat een affiliate later in zijn portal ziet, is een query op grootboek + rollups.

---

## 4. Registratie & synchronisatie (idempotent, bron-agnostisch)

Eén patroon, of data nu handmatig, per CSV of later via n8n binnenkomt:

1. **Idempotentie.** Elke conversie draagt een `external_id`; `UNIQUE(source_id, external_id)`. Her-invoer = update van status/bedrag, nooit een tweede rij. Netwerken (en jijzelf) corrigeren achteraf (pending → approved → rejected) — dat mag veilig.
2. **Bron-agnostisch.** `af_sources` maakt "handmatig", "CSV-upload" en later "Daisycon-adapter" allemaal gewoon een bron. De ledger weet niet wáár het vandaan kwam.
3. **Reconciliatie, niet vertrouwen.** Bij registratie berekent de app `expected_cents`; wijkt gemeten af van verwacht (> drempel), dan een **afwijkingssignaal** (signaal-engine uit fase 1/plak 4). Zo vang je onder- én overbetaling — cruciaal bij directe deals waar jij de cijfers verantwoordt.
4. **Outbox naar boekhouding.** De app schrijft `af_financial_events`; een latere n8n-workflow (of handmatige export) levert ze af en zet `state='exported'`. De app blokkeert nooit op een trage externe API.
5. **Periodes op `occurred_at` in UTC**, niet importmoment — anders schuiven maandcijfers.
6. **De naad naar n8n** (later): één `POST /api/ingest/conversions` met **HMAC-signatuur** + timestamp-replaybescherming. Nu niet gebouwd; het contract (canonieke payload + `schema_version`) leggen we wél vast zodat aansluiten triviaal is.

---

## 5. Modulariteit — adapters, geen vertakkingen

Nieuwe bron/bestemming toevoegen = **nul** app-wijziging:
- **Inkomende bron** (CSV nu; netwerk later) = normaliseren naar het canonieke conversie-contract + een `af_sources`-rij. De app kent alleen `source_id`.
- **Uitgaande bestemming** (boekhouding/PSP) = een adapter (later n8n-workflow) die `af_financial_events` → pakket-API mapt. Boekhouding-agnostisch; pakketkennis zit nooit in de app. (Daarom kon "boekhouding nog niet gekozen" gewoon — Moneybird/e-Boekhouden/Exact zijn allemaal een latere adapter.)

De prijs: het canonieke contract disciplinair bewaken. Dat is de investering die "later toevoegen zonder verbouwen" een eigenschap maakt i.p.v. een belofte.

---

## 6. Attributie & tracking — kern, geen uitstel (maar hergebruik wat er is)

Zonder attributie heeft het grootboek geen data. Goed nieuws: **je hebt de haak al.** Er bestaat `psf_referral_source` (cookie), `referral-attribution.ts` en `referral_source` op `intake_sessions`. We bouwen dus **geen zware nieuwe tracking-infra**; we breiden het bestaande uit:

- **Identifier:** elke affiliate krijgt een stabiele `ref`; links dragen 'm (`?ref=…` of `/r/<ref>`). De ref landt in de bestaande referral-cookie.
- **Lead** = intake/Leefstijlcheck afgerond met een affiliate-`ref` in de cookie → `af_conversions(type='lead')`, gekoppeld via `intake_session_id`.
- **Sale** = premium-aankoop met dezelfde attributie → `af_conversions(type='sale', revenue_cents=…)`.
- **Venster & regel:** last-click binnen een expliciet venster (bijv. 30–90 dgn); self-referral uitgesloten. Regel nu vastleggen, want hij zit in hoe je conversies boekt.
- **Auditbaarheid vanaf dag 1:** clicks/conversies append-only, herleidbaar — want je rapporteert deze cijfers handmatig aan partners en zij zullen disputeren.
- **Consent/AVG vanaf de eerste klik:** first-party, gehashte IP/UA, consent-gate, retentie op ruwe clicks (sluit aan op `COMPLIANCE_AUDIT_AFFILIATE_PLATFORM.md`).

Een expliciete `af_clicks`-tabel + redirect-endpoint is optioneel voor de MVP: je kunt starten met puur ref-capture op intake/aankoop (lichtst), en de klik-laag toevoegen wanneer je klik→conversie-ratio's wilt tonen.

---

## 7. De uitgestelde naad: affiliate-portal (Rol 2)

Bewust nog niet bouwen, maar zó voorbereid dat het later klein is:

- **De naad = `af_affiliates.account_id` (nullable).** Nu leeg (jij beheert alles). Portal toevoegen = dat veld vullen met een bestaand `accounts`-record.
- **Auth = het bestaande `accounts`-systeem** (consumenten-login, `account-session-cookie`). Geen tweede auth-stelsel.
- **Isolatie = per-affiliate RLS** op de `af_`-facing tabellen (affiliate ziet alleen `affiliate_id = zijn eigen`). Die policies schrijf je mét de portal, niet nu.
- **UI** = een nieuw publiek gebied (bijv. `/partner`) dat rollups + grootboek leest. Puur additief.
- **Kosten later:** klein en geïsoleerd — geen wijziging aan de ledger-kern. Dát is waarom uitstellen verantwoord is.

Alles wat de portal ooit toont, produceren we nu al intern. De portal is een raam op bestaande data, geen nieuw systeem.

---

## 8. Schaalbaarheid

Het aantal affiliates (honderden–duizenden) is triviaal voor Postgres. De volumedrijver is **clicks**:
1. **Aggregeer clicks, bewaar ze niet eeuwig.** Ruw binnen attributievenster + debug-retentie; dagelijkse rollup → `af_daily_rollups`; daarna opschonen.
2. **Rapportage op rollups, nooit op live click-scans.**
3. **Idempotentie = horizontaal veilig** (parallelle imports zonder dubbeltelling).
4. **Geen per-request full-sync** — event-driven recompute + geplande rollups.
5. **Rate-limiting** nu in-memory (bestaand); gedeelde store pas bij horizontale schaal (self-hosted Redis, geen Upstash — zie [[psf-prod-infra]]).

Netto: ongevoelig voor affiliate-aantal, click-volume opgevangen met aggregatie — dezelfde keuze als grote netwerken.

---

## 9. Beveiliging

- **Mono-tenant nu:** alle `af_`-toegang server-side via service-role (deny-all RLS), net als `pd_`. Per-affiliate RLS pas mét de portal.
- **Geld-integriteit:** append-only grootboek, centen, tegenboekingen, `reverses_entry_id`.
- **Ingest-naad (later):** HMAC + timestamp + rate-limit; secret roteerbaar, per omgeving.
- **Externe credentials** (netwerk/boekhouding/PSP): in de latere n8n-vault, niet in de app-DB.
- **Fraude/self-referral:** attributieregels + hold-periode vóór goedkeuring + afwijkingssignalen.
- **Portal-isolatie (later):** expliciete test "affiliate A ziet niets van B"; nooit eindklant-PII naar affiliates (alleen geaggregeerd).

---

## 10. Valkuilen en preventie

| # | Valkuil | Preventie |
|---|---|---|
| 1 | Twee partner-populaties verenigen (`pd_` ↔ `af_`) | Aparte tabellaag; tegengestelde geldrichting expliciet (§0.3). |
| 2 | Terugkruipende over-abstractie (`org_id` "voor de zekerheid") | Bewust géén tenancy-scaffolding; single-tenant = geen org_id (§0.1). |
| 3 | Identiteit als anker verkeerd (naam/account i.p.v. stabiele id) | Alles hangt aan `affiliate_id` (UUID); `account_id` is los en nullable. |
| 4 | Attributie te laat → geen/foute grootboekdata | Attributiemodel nu vast; hergebruik referral-hook (§6). |
| 5 | Dubbeltelling bij her-import/CSV/retry | `UNIQUE(source_id, external_id)` + upsert overal. |
| 6 | Geld dat "niet klopt" door mutaties | Append-only + tegenboekingen; nooit een geboekte regel wijzigen. |
| 7 | Geen MVP-bewezen-trigger → portal-uitstel zonder einde | Concreet criterium (§11). |
| 8 | Consent/AVG bij klik-tracking overslaan | First-party + consent + gehashte identifiers vanaf dag 1. |
| 9 | Boekhoud-lock-in | Agnostische outbox; pakketkennis alleen in de adapter. |
| 10 | Afhankelijk worden van Daisycon/n8n | App-first; netwerken/n8n zijn optionele, uitgestelde adapters. |
| 11 | Click-volume verstopt de DB | Aggregeren + retentie + rollups (§8). |
| 12 | Periodeverschuiving in maandcijfers | Periode op `occurred_at` (UTC). |

---

## 11. MVP-bewezen-criterium (voorstel)

"Portal pas als de MVP bewezen is" heeft alleen betekenis met een trigger. Voorstel — bouw de affiliate-portal (Rol 2) pas als **alle vier** waar zijn:

1. **Deelname:** ≥ 3 actieve affiliates met een vastgelegde commissieafspraak.
2. **Attributie werkt end-to-end:** een affiliate-`ref` leidt aantoonbaar tot ≥ 1 gemeten *lead* én ≥ 1 gemeten *sale* in het grootboek.
3. **Eén volledige uitbetalingscyclus** handmatig doorlopen: accrual → approve → paid → `af_financial_events` → verwerkt in je boekhouding.
4. **Reconciliatie klopt:** de cijfers die je aan een affiliate zou rapporteren komen overeen met een handmatige steekproef (geen afwijking > drempel).

Staan die vier? Dan is het model bewezen en is de portal een klein, veilig additief project (§7). Zo niet, dan verbeter je eerst het interne model — nooit de portal als pleister.

---

## 12. Fasering

### Fase 3A — Affiliate-kern, mono-tenant, app-first (NU)
1. `af_`-schema (§3): affiliates (account_id **nullable**), commissieregels (engine-hergebruik), conversions, ledger, payouts, financial_events (outbox, ongebruikt), daily_rollups, sources.
2. **Affiliate-beheer in /admin:** affiliates aanmaken, commissieafspraken vastleggen, `ref`-links genereren. (Nieuwe sectie in de bestaande admin-shell; los van `pd_partners`.)
3. **Attributie** via de bestaande referral-hook uitbreiden → `af_conversions` (lead=intake, sale=premium).
4. **Commissie-accrual:** conversie → verwacht bedrag via engine → `af_ledger_entries` (pending) + afwijkingssignaal.
5. **Interne rapportage + handmatige uitbetaalflow:** goedkeuren → payout-batch → "betaald" → `af_financial_events`-rij.
6. **Bewust niet:** n8n, boekhoud-push, Daisycon, portal, per-affiliate RLS, PSP. Naden ontworpen, integraties uitgesteld.

### Fase 3B — Robuustheid & optionele adapters
Rollups + retentie-jobs, reconciliatie-dashboard, CSV-import, en — indien gewenst — de eerste optionele netwerk-adapter en boekhoud-push via n8n. Pas hier komt n8n in beeld, en dan optioneel.

### Fase 5 — Affiliate-portal (Rol 2) — ná het MVP-criterium (§11)
`account_id` vullen + per-affiliate RLS + publiek dashboard + materiaal/links-selfservice. Additief op de bestaande kern.

### Fase 2 (producten) & Fase 4 (AI) — uitgesteld zoals eerder besloten.

---

## 13. Wat dit betekent voor de productvisie

De oorspronkelijke productvisie (single-tenant, geen multi-user) **blijft leidend** — met één toevoeging: een affiliate-portal (actor-as, per-affiliate scope) is nu erkend als *toekomstige additieve laag*, expliciet ná een MVP-criterium, op een aparte `af_`-laag met eigen RLS. We breken het single-tenant `pd_`-fundament daar niet voor open, en we introduceren geen tenancy. Daarmee blijft de belofte overeind: *een extreem solide mono-tenant kern die later uitbreidbaar is, zonder her-architectuur.*

---

*Vervolg bij akkoord: fase-3A uitwerken in reviewbare plakken (schema → affiliate-beheer → attributie → ledger/accrual → rapportage/uitbetaling), net als fase 1.*
