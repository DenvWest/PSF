# Implementatieplan — Fase 3A: affiliate-kern (mono-tenant, app-first)

*Uitvoeringsplan bij `ARCHITECTUUR_AFFILIATE_AUTOMATISERING.md` (v2). Bouwt de interne kern van een zelf-beheerd affiliate-programma: affiliates, commissieafspraken, attributie, grootboek en handmatige uitbetaling. Géén portal, géén n8n-integratie, géén Daisycon.*

Datum: 14 juli 2026 · Status: ter review · Uitvoering: 4 reviewbare plakken (A1–A4), Dennis reviewt en commit per plak.

---

## 0. Aansluiting op de bestaande code (geverifieerd)

Vier realiteiten uit de codebase die dit plan concreet maken:

1. **Attributie-haak bestaat al.** `psf_referral_source`-cookie (90 dgn, `referral-attribution.ts`) → `intake_sessions.referral_source` (gezet in `/api/intake/session/route.ts`). We voegen een **eigen affiliate-`ref`** toe naast dit mechanisme; we vervuilen `referral_source` niet.
2. **n8n-outbox draait al.** `src/lib/n8n-webhook.ts` + `runPendingN8nDomainEvents` + cron `/api/cron/n8n-events` sturen `domain_events` naar `N8N_WEBHOOK_URL`. Onze `af_financial_events`-outbox volgt **exact ditzelfde patroon** — de naad naar boekhouding is al bewezen in dit project.
3. **`affiliate_clicks` is Rol 1 en blijft ongemoeid.** Dat is uitgaande merchant-klik-analytics (`affiliate-analytics.ts`, `/api/affiliate/click`, admin `/admin/affiliate`). CLAUDE.md: "NIET aanraken". Ons nieuwe programma gebruikt de `af_`-prefix en een aparte route — nul overlap.
4. **Premium is nog waitlist, geen live checkout.** `account_entitlements` staat klaar voor Stripe (fase 4), maar er is nog geen live aankoop. Gevolg: **"lead" (intake afgerond) is nu live attribueerbaar; "sale" (premium) is vooruitkijkend** — we ontwerpen de sale-haak, maar hij vuurt pas als premium live gaat. Tot die tijd voer je sales handmatig in via `af_sources='manual'`.

---

## 1. Architectuurbesluiten

1. **Mono-tenant, app-first.** Alle `af_`-toegang server-side via `createSupabaseAdmin()` (service-role); RLS aan zónder policies (deny-all), net als `pd_`. **Geen per-affiliate RLS** in 3A — die komt pas met de portal (fase 5).
2. **`af_`-prefix, aparte tabellaag.** Los van `pd_` (PartnerDesk, upstream) én van `affiliate_clicks` (Rol 1). Drie betekenissen van "affiliate" in dit project — de prefix houdt ze uit elkaar.
3. **UI onder de bestaande admin-shell, aparte route.** Nieuw zijbalk-item in `DeskShell`, **label "Affiliates"** (gekozen). Route **`/admin/programma`** — bewust níet `/admin/affiliates`, want dat botst met de bestaande `/admin/affiliate` (kliks-analytics, Rol 1); enkelvoud/meervoud is te subtiel om op te vertrouwen. Label en route mogen dus verschillen.
4. **Commissie-resolutie: eigen, lichte, pure functie** (`af-commission.ts`), affiliate-gevormd (per affiliate, type lead/sale, validiteit, promo>standaard, recentste). Hergebruikt de geteste datum-helpers uit fase 1 (`dates.ts`), niet de zwaardere `commission-resolution.ts` (die is contract/scope-gebaseerd — meer dan affiliates nodig hebben). **Schaalbaarheid:** de resolver draait op de schríjf-weg (één keer per conversie, op O(paar regels per affiliate)); de lees-/rapportageweg raakt hem nooit (leest rollups + grootboek). Toekomstige complexiteit (staffels, product-/categoriescope, recurring, sub-affiliates) is **additief** op ditzelfde grondvorm — kandidaat-filter → winnaar → bedrag — niet een herbouw (§8.1).
5. **Outbox-patroon voor boekhouding**, gemodelleerd op de bestaande `domain_events` → n8n-runner. In 3A schrijven we alleen de outbox-rijen; de n8n-consumer is fase 3B.
6. **Geld in centen (int), append-only grootboek, tegenboekingen.** Nooit een geboekte regel muteren.
7. **Verificatie per plak:** `tsc --noEmit` + `vitest` + `eslint --max-warnings 0` + console.log-grep + geauthenticeerde render-smoketest (de les uit fase 1). Migraties via Dashboard SQL Editor.

---

## 2. Datamodel + SQL (migratie `af_` fase 3A)

Conventies als `pd_`: uuid PK's, `created_at timestamptz default now()`, tekst-enums via CHECK, RLS aan zonder policies.

```sql
create table af_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('manual','csv','network','bookkeeping','psp')),
  name text not null unique,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true
);

create table af_affiliates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  account_id uuid references accounts(id),      -- NULLABLE: de naad naar login (fase 5)
  ref text not null unique,                       -- stabiele tracking-identifier in de URL
  display_name text not null,
  company text,
  email text,
  status text not null default 'active' check (status in ('active','paused','ended')),
  default_commission_rule_id uuid,                -- FK later toegevoegd (na rules-tabel)
  payout_details jsonb not null default '{}'::jsonb,
  notes text,
  archived_at timestamptz
);

create table af_commission_rules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  affiliate_id uuid not null references af_affiliates(id) on delete cascade,
  applies_to text not null default 'both' check (applies_to in ('lead','sale','both')),
  value_type text not null check (value_type in ('percent','fixed')),
  rate_percent numeric(5,2) check (rate_percent between 0 and 100),
  amount_cents int check (amount_cents >= 0),
  rule_type text not null default 'standard' check (rule_type in ('standard','promo')),
  valid_from date,
  valid_to date,
  notes text,
  archived_at timestamptz,
  check ((value_type='percent' and rate_percent is not null and amount_cents is null)
      or (value_type='fixed'   and amount_cents is not null and rate_percent is null))
);

alter table af_affiliates
  add constraint af_affiliates_default_rule_fk
  foreign key (default_commission_rule_id) references af_commission_rules(id) on delete set null;

create table af_links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  affiliate_id uuid not null references af_affiliates(id) on delete cascade,
  ref text not null,                              -- meestal = affiliate.ref; campagne-varianten mogelijk
  target_url text not null,
  campaign text
);

create table af_conversions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_id uuid not null references af_sources(id),
  affiliate_id uuid not null references af_affiliates(id) on delete cascade,
  external_id text not null,                       -- dedupe-sleutel
  type text not null check (type in ('lead','sale')),
  occurred_at timestamptz not null,
  order_ref text,
  revenue_cents int not null default 0 check (revenue_cents >= 0),
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  intake_session_id uuid,                          -- koppeling naar bestaande funnel (lead)
  raw jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  unique (source_id, external_id)
);
create index af_conversions_affiliate_idx on af_conversions (affiliate_id, occurred_at desc);

create table af_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  affiliate_id uuid not null references af_affiliates(id) on delete cascade,
  conversion_id uuid references af_conversions(id) on delete set null,
  kind text not null check (kind in ('accrual','adjustment','reversal','payout','fee')),
  amount_cents int not null,                       -- + = verschuldigd aan affiliate
  state text not null default 'pending' check (state in ('pending','approved','paid','rejected')),
  expected_cents int,
  period text not null,                            -- 'YYYY-MM' uit occurred_at (UTC)
  posted_at timestamptz not null default now(),
  source_id uuid references af_sources(id),
  reverses_entry_id uuid references af_ledger_entries(id),
  rule_snapshot jsonb not null default '{}'::jsonb, -- BEVROREN winnende regel (§5): {rule_id,value_type,rate_percent,amount_cents,rule_type}
  note text
);
create index af_ledger_affiliate_state_idx on af_ledger_entries (affiliate_id, state);

create table af_payouts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  affiliate_id uuid not null references af_affiliates(id) on delete cascade,
  period text not null,
  total_cents int not null,
  status text not null default 'draft' check (status in ('draft','approved','sent','paid','failed')),
  bookkeeping_ref text,
  psp_ref text,
  paid_at timestamptz
);

create table af_payout_items (
  payout_id uuid not null references af_payouts(id) on delete cascade,
  ledger_entry_id uuid not null references af_ledger_entries(id) on delete cascade,
  primary key (payout_id, ledger_entry_id)
);

create table af_financial_events (                 -- boekhouding-agnostische outbox
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('commission_expense','payout')),
  period text not null,
  gross_cents int not null,
  vat_cents int not null default 0,
  counterparty text,
  state text not null default 'new' check (state in ('new','exported','error')),
  payload jsonb not null default '{}'::jsonb,
  exported_at timestamptz
);
create index af_financial_events_state_idx on af_financial_events (state);

create table af_daily_rollups (
  affiliate_id uuid not null references af_affiliates(id) on delete cascade,
  day date not null,
  clicks int not null default 0,
  leads int not null default 0,
  sales int not null default 0,
  revenue_cents int not null default 0,
  commission_cents int not null default 0,
  primary key (affiliate_id, day)
);

-- af_clicks: BEWUST uitgesteld tot 3B (ref-capture op intake volstaat voor de MVP).

alter table af_sources          enable row level security;
alter table af_affiliates       enable row level security;
alter table af_commission_rules enable row level security;
alter table af_links            enable row level security;
alter table af_conversions      enable row level security;
alter table af_ledger_entries   enable row level security;
alter table af_payouts          enable row level security;
alter table af_payout_items     enable row level security;
alter table af_financial_events enable row level security;
alter table af_daily_rollups    enable row level security;

insert into af_sources (kind, name) values ('manual','Handmatig'), ('csv','CSV-import')
on conflict (name) do nothing;
```

---

## 3. Attributie-spec

- **Identifier.** Elke affiliate heeft een `ref`. Links: `https://…/?ref=<ref>` (of `/r/<ref>` in 3B). De landing-pagina zet een cookie **`psf_aff_ref`** (apart van `psf_referral_source`, 90 dgn, SameSite=Lax) — via een kleine uitbreiding van de bestaande referral-cookie-logica.
- **Lead (nu live).** Bij het aanmaken van een intake-sessie (`/api/intake/session`) lezen we `psf_aff_ref`; als die matcht met een bestaande `af_affiliates.ref`, schrijven we `af_conversions(type='lead', affiliate_id, intake_session_id, external_id='intake:'||session_id, occurred_at=now, source='manual'→ later 'tracking')`. Idempotent op `(source_id, external_id)`.
- **Sale (vooruitkijkend).** De sale-haak is een functie `recordAffiliateSale({ accountOrSession, revenue_cents, order_ref })` die een `af_conversions(type='sale')` schrijft. Die haak wordt **aangeroepen vanuit de entitlement-grant/aankoopflow zodra premium live gaat** (Stripe-webhook fase 4). Tot die tijd: handmatige sale-invoer in de admin.
- **Attributieregel.** Last-click binnen het cookievenster (90 dgn, sluit aan op bestaande `REFERRAL_MAX_AGE_SEC`); self-referral uitgesloten (ref van een gearchiveerde/inactieve affiliate telt niet). Regel puur en getest.
- **Consent/AVG.** `psf_aff_ref` is functioneel-attributie; volg dezelfde consent-lijn als de bestaande referral-cookies (compliance-audit). Geen PII in de ref.

---

## 4. Commissie-resolutie-spec (`af-commission.ts`, puur)

Input: de commissieregels van één affiliate + een conversie (type, datum, revenue). Output: het verwachte bedrag + de winnende regel + herleiding.

- **Kandidaten:** niet-gearchiveerde regels waarvan `applies_to` de conversie-`type` dekt (`'both'` dekt beide) én die geldig zijn op `occurred_at` (`valid_from`/`valid_to` nullable = altijd).
- **Winnaar:** `promo` > `standard`; daarna recentste `valid_from` (null = oudste); daarna nieuwste `created_at`.
- **Bedrag:** `percent` → `round(revenue_cents * rate/100)`; `fixed` → `amount_cents`. (Lead heeft doorgaans revenue 0 → in de praktijk `fixed` per lead.)
- **Geen regel:** null → geen accrual + afwijkingssignaal "affiliate zonder commissieafspraak".
- **Tests (≥10):** geen regel · alleen standaard · promo wint · promo verlopen → terug naar standaard · applies_to filtert lead/sale · percent-berekening · fixed-berekening · twee promo's (recentste wint) · gearchiveerde regel uitgesloten · validiteitsgrenzen.

Hergebruik de `daysBetween`/ISO-vergelijkingen uit `dates.ts`; herschrijf die logica niet.

---

## 5. Grootboek & uitbetaling-spec

- **Accrual:** bij een `af_conversions`-registratie → resolveer commissie → `af_ledger_entries(kind='accrual', state='pending', amount_cents=expected, expected_cents=expected, period=YYYY-MM(occurred_at))`. Idempotent: één accrual per conversie (upsert op conversion_id + kind).
- **Bevroren herleiding (toekomstbestendigheid).** Elke accrual slaat een **snapshot van de winnende regel** op in `rule_snapshot` (rule_id + waardetype + bedrag/percentage + rule_type). Zo is geboekt geld immuun voor latere wijzigingen aan de resolver of aan de regels: je muteert nooit een geboekte regel, en elke historische accrual blijft zelf-verklarend, ook als de commissie-logica jaren later complexer wordt. Dit ontkoppelt "hoe we vandaag rekenen" van "wat er al geboekt is" — dezelfde append-only-discipline als de tijdlijn-snapshots in fase 1.
- **Statusspoor:** `pending` (net geboekt, hold-periode) → `approved` (jij keurt goed) → `paid` (in een payout). Afgekeurde conversie → **reversal-entry** (tegenboeking), nooit de originele muteren.
- **Uitbetaling (handmatig):** kies per affiliate per periode de `approved`-onbetaalde accruals → `af_payouts(draft, total_cents)` + `af_payout_items` → jij markeert `paid` → items-ledger `state='paid'` + één `af_financial_events(kind='payout', state='new')`-rij (outbox; n8n-consumer = 3B).
- **Afwijkingsdetectie:** verschilt gemeten commissie van `expected_cents` (> drempel) bij een geïmporteerde/gecorrigeerde conversie → afwijkingssignaal in de admin. In 3A lichte variant (vlag in rapportage); volwaardige signaal-engine-koppeling optioneel.

---

## 6. De vier plakken

Elke plak eindigt groen op tsc + vitest + eslint + console.log-grep + render-smoketest. Dennis reviewt en commit.

### Plak A1 — Schema + affiliate-beheer
- Migratie `af_`-fase-3A (§2), via Dashboard SQL Editor.
- `src/types/affiliate.ts`, `src/lib/affiliate/{db,queries,actions,validation}.ts`.
- Zijbalk-item + route `/admin/programma`: affiliatelijst (naam, ref, status, #regels) + "+ Affiliate" (naam, e-mail → auto-`ref`).
- Affiliate-dossier: algemene gegevens (inline edit, hergebruik `InlineField`-patroon), commissieregels-CRUD (form zoals `RuleForm`), links-lijst met genereer-knop.
- **Acceptatie:** affiliate aanmaken → ref gegenereerd → commissieregel toevoegen → link genereren → herladen toont alles.

### Plak A2 — Attributie + conversie-registratie
- `psf_aff_ref`-cookie-capture (uitbreiding referral-logica) + lead-attributie in `/api/intake/session`.
- `af-attribution.ts` (puur: matcht ref → affiliate, past regel/venster/self-referral toe) + tests.
- Idempotente `recordConversion`-service (dedupe) voor lead (live) en sale (haak, nu handmatig).
- Admin: handmatige conversie-invoer + CSV-import (source='manual'/'csv') + conversielijst per affiliate.
- **Acceptatie:** bezoek met `?ref=<x>` → intake afronden → lead-conversie verschijnt bij de affiliate; dubbele import telt niet dubbel.

### Plak A3 — Commissie-resolutie + grootboek-accrual
- `af-commission.ts` (§4) + volledige testsuite.
- Accrual-service: conversie → expected → `af_ledger_entries`; reversal bij afkeuring; afwijkingsvlag.
- Admin: grootboek per affiliate (pending/approved/paid), goedkeur-actie.
- **Acceptatie:** conversie met een promo-regel → correcte accrual + herleiding; promo-einddatum in verleden → standaard-bedrag; conversie afkeuren → reversal, saldo klopt.

### Plak A4 — Rapportage + handmatige uitbetaling + outbox
- Daily-rollups-berekening (on-demand/gepland) + `af_daily_rollups`.
- Admin-rapportage: per affiliate clicks/leads/sales/conversie%/omzet/commissie, periode-filter, drill-down, CSV-export.
- Uitbetaalflow: payout-batch samenstellen → goedkeuren → betaald markeren → `af_financial_events`-rij.
- **Acceptatie:** rapportage klopt met handmatige steekproef (reconciliatie); volledige uitbetaalcyclus doorlopen → outbox-rij `new`; dit dekt het MVP-criterium (blueprint §11) op één affiliate na volume.

---

## 7. Bewust NIET in fase 3A

- Partner-**portal** + per-affiliate RLS (fase 5, na MVP-criterium).
- **n8n-integraties** live: Daisycon-pull, boekhoud-push, PSP-payout (fase 3B; outbox + contract wél ontworpen).
- **Geautomatiseerde** uitbetaling (3A = handmatig markeren).
- **`af_clicks`-tabel** + redirect-endpoint (3B; ref-capture volstaat nu).
- **Staffels/tiered** commissie (3B; 3A = standaard + promo).
- **Sale-attributie live** (wacht op premium-checkout; haak is klaar).
- Multi-tenancy / `org_id` (nooit in deze lijn).

---

## 8. Risico's & keuzes

### 8.1 Schaalbaarheid & toekomstbestendigheid van de lichte resolver
- **Performance:** uitstekend en volume-ongevoelig. De resolver draait op de schrijfweg (één keer per conversie, O(paar regels)), nooit op de leesweg. Dashboards lezen `af_daily_rollups` + grootboek — geen resolver, geen scans over alle conversies. Duizenden conversies/dag = duizenden triviale berekeningen; het knelpunt is nooit de resolver.
- **Model-groei is additief, geen herbouw**, dankzij twee ankers: het **append-only grootboek** (generiek: elke accrual, elke periode, tegenboekingen) en de resolver-grondvorm **kandidaat-filter → winnaar → bedrag**. Concreet:
  - *Staffels* → `af_commission_tiers`-tabel + een tier-lookup in de "bedrag"-stap. Additief.
  - *Product-/categoriescope* → scope-kolommen op de regel + specificiteit in de "winnaar"-stap. Dat is precies wat de `pd`-engine al doet — de af-resolver convergeert er hooguit naartoe (bekend, getest pad), geen rewrite.
  - *Recurring/abonnementscommissie* → een geplande accrual-generator die per periode grootboekregels maakt. Het grootboek verandert niet; alleen wát accruals genereert.
  - *Sub-affiliates/override* → nullable `parent_affiliate_id` + override-accruals (extra grootboekregels). Additief; bewust niet nu bouwen (YAGNI).
  - *Andere attributiemodellen* (first-click/multi-touch) → dat zit in de attributielaag, niet in de resolver; geïsoleerd te wijzigen.
- **De garantie:** het grootboek is het toekomstbestendige anker en is generiek genoeg; de resolver is een uitwisselbare/uitbreidbare berekening erbovenop. Plus de bevroren `rule_snapshot` (§5) zorgt dat geboekt geld nooit hoeft te worden herrekend als de logica later verandert. Enige echt grotere stap zou een fundamenteel ander geldmodel zijn (bijv. revenue-share-pools) — en zelfs dán blijft het append-only grootboek staan; alleen de accrual-generator verandert.

### 8.2 Overige
- **Naamverwarring "affiliate" (3×).** Mitigatie: `af_`-prefix + route `/admin/programma` + duidelijke UI-labels. Bevestigen bij A1-review.
- **Sale nog niet live.** Mitigatie: haak ontworpen + handmatige invoer; geen blokkade voor de MVP (leads + handmatige sales volstaan om het model te bewijzen).
- **Attributie-betrouwbaarheid bij directe deals.** Mitigatie: append-only conversies, expliciete last-click-regel, self-referral-uitsluiting, reconciliatie in A4.
- **Commissie-engine: hergebruik vs. eigen.** Keuze: eigen lichte resolver (affiliates zijn simpeler dan partners), wél hergebruik van geteste datum-helpers. Onderbouwd in §1.4.
- **Outbox zonder consumer.** Bewust: de naad bestaat en volgt het bewezen `domain_events`-patroon; de n8n-kant is 3B — geen dode code, wel toekomstvast.

---

*Bij akkoord start ik met plak A1 (migratie + affiliate-beheer), net als fase 1: eerst de migratie ter review, dan de code.*
