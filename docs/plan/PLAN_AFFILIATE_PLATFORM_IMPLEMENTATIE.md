# Implementatieplan — PartnerDesk

*PRD-niveau uitwerking van `PRODUCTVISIE_AFFILIATE_PLATFORM.md`. Een ontwikkelaar of AI-coding-agent moet hiermee zonder twijfel kunnen bouwen.*

Datum: 12 juli 2026 · Status: implementatieplan, wacht op review · **Herzien 12 jul: inbedding in psf (zie blok hieronder)**

**Leeswijzer / structuurkeuze**: de opdracht vraagt "werk elke fase volledig uit". Database, domeinmodel, componenten, zoek, UX, validaties en edge cases zijn echter *systeem*-eigenschappen die over fases heen gelden — die vier keer herhalen levert een inconsistent document op. Daarom: **één volledig systeemontwerp met per onderdeel een fase-markering [F1]–[F4]**, en per fase een eigen hoofdstuk met doel, acceptatiecriteria en bouwvolgorde (§16–§19).

---

## Herziening 12 juli — inbedding in PerfectSupplement (vervangt A1/A3/A4/A10/A15)

Besluit Dennis (12 jul): PartnerDesk wordt **géén losse applicatie** maar wordt ingebouwd in de bestaande psf-app onder `/admin`. De PartnerDesk-navigatie wordt de nieuwe admin-shell; de bestaande admin-pagina's (intake-dashboard, affiliate-kliks) hangen als "Site"-groep onderin de zijbalk. Gevolgen voor dit document:

- **Routes**: alle routes lezen met `/admin`-prefix (`/` → `/admin`, `/partners/[slug]` → `/admin/partners/[slug]`, enz.). `/login` vervalt — de bestaande `/admin/login` + proxy-guard (`src/proxy.ts`) regelt de toegang.
- **Auth (vervangt A4)**: geen Supabase Auth. Bestaande admin-cookie via de proxy. RLS: aan op alle PartnerDesk-tabellen, **géén policies** (deny-all); toegang uitsluitend server-side via `createSupabaseAdmin()` — nooit via de anon-client.
- **Database (vervangt A3)**: zelfde Supabase-project als psf. Alle PartnerDesk-tabellen krijgen het voorvoegsel **`pd_`** (`pd_partners`, `pd_contracts`, …); tabelnamen elders in dit document lezen zonder prefix voor de leesbaarheid. Storage: private bucket `partner-documents`, downloads via kortlevende signed URLs, server-side. Migraties: bestanden in `supabase/migrations/`, uitvoeren via de Dashboard SQL Editor (nooit `supabase db push`).
- **Cron (nuanceert A10)**: fase 1 heeft geen timer nodig — signalen worden herberekend direct na elke mutatie én bij het laden van `/admin` (Vandaag). De systemd-tick-timer komt pas in fase 2 (feeds).
- **Deploy (vervangt A15)**: geen aparte deploy; mee met psf (systemd `perfectsupplement`).
- **Mappen**: zie herziene §2.
- **Onder voorbehoud — bevestigen bij review van plak 1**: (a) shadcn/ui-componenten, uitsluitend binnen `src/components/partnerdesk/ui/` (radix-dependencies erbij) — aanbevolen voor snelheid, raakt de consumer-site niet; (b) Playwright wordt **niet** toegevoegd — smoke-tests per oplevering via handmatige checklist, verificatie met `tsc --noEmit` + `vitest run` (psf-standaard).
- **Oplevering in 5 reviewbare plakken** (i.p.v. 20 bouwstappen ineens): **P1** = stappen 1–8 (shell, migratie, partners, dossier-skelet) · **P2** = 9, 13, 14 (contacten, tijdlijn, taken) · **P3** = 10–12 (contracten, commissies, documenten; paspoort gevuld) · **P4** = 15–16 (signalen + Vandaag) · **P5** = 17–20 (⌘K, instellingen, keyboard/sticky, seed). Dennis reviewt en commit per plak; Claude commit nooit zelf.

---

## 0. Aannames & kernkeuzes

Expliciet benoemd, zoals gevraagd. Elke keuze met reden.

| # | Keuze | Waarom |
|---|---|---|
| A1 | **Nieuwe repo `partnerdesk`**, los van psf | Ander product, andere lifecycle; geen vervuiling van perfectsupplement. |
| A2 | **Next.js (App Router) + TypeScript strict + Tailwind + shadcn/ui** | Bekende stack (= snelheid); shadcn levert Drawer, Dialog, cmdk-palette, Popover kant-en-klaar. |
| A3 | **Supabase (nieuw project): Postgres + Storage + Auth + pgvector** | Storage lost document/banner-opslag op; pgvector maakt het schema RAG-klaar (§20); bekende workflow. Migraties via SQL-bestanden in repo, uitgevoerd via Dashboard SQL Editor (zelfde werkwijze als psf). |
| A4 | **Eén gebruiker**: Supabase Auth met e-mail-allowlist van 1 adres; RLS simpel (authenticated = alles) | Geen rollenmodel. Auth bestaat alleen omdat de app op internet staat. |
| A5 | **Lezen via Server Components, muteren via Server Actions die altijd door een service-laag gaan** (`src/lib/services/`) | Eén mutatie-pad ⇒ tijdlijn-events en signaal-herberekening kunnen nooit vergeten worden; AI krijgt later dezelfde functies als tools (§20). |
| A6 | **Geldbedragen in centen (int), percentages `numeric(5,2)`, datums `date`, momenten `timestamptz` (UTC)** | Geen float-geld; contract- en geldigheidslogica is dag-granulair. |
| A7 | **Alleen EUR** | Alle huidige partners zijn EUR. Andere valuta = import-fout, geen half multi-currency. |
| A8 | **IDs: `uuid` (gen_random_uuid), overal, stabiel, nooit hergebruikt** | AI-first-eis: stabiele verwijzingen vanuit events, embeddings en documenten. |
| A9 | **Archiveren i.p.v. verwijderen** voor partner, contact, contract, commissieregel, product, campagne (`archived_at`). Hard delete alleen voor taken, saved views, labels | Historie (tijdlijn, conversies, AI-context) mag nooit dangling raken. |
| A10 | **Cron = systemd-timer op de VPS** die elke 5 min `POST /api/jobs/tick` aanroept met secret-header; de tick-handler bepaalt zelf wat er moet draaien (signalen elk kwartier, feeds per schema, checks nachtelijks) | Eén simpel mechanisme, logs op de server, geen vendor lock-in, geen queue-infra. |
| A11 | **API-credentials versleuteld op applicatieniveau** (AES-256-GCM, key in env), nooit in zoekindex/exports/logs | Simpel en afdoende voor single-tenant. |
| A12 | **Desktop-first; mobiel = raadplegen + notitie/taak** | Backoffice-tool. Feed-mapping en bulk-acties zijn desktop-only. |
| A13 | Volumes waarop ontworpen wordt: ≤ 100 partners, ≤ 50k producten, ≤ 100k conversies/jaar | Bepaalt: geen zoek-infra (pg_trgm volstaat), geen queue, geen caching-laag. |
| A14 | **Wachtwoorden van netwerk-logins blijven in de wachtwoordmanager**; app slaat alleen login-URL + gebruikersnaam op | Geen secrets-beheer bouwen dat elders beter bestaat. |
| A15 | Deploy: Hetzner VPS, systemd, Nginx — zelfde patroon als psf | Bekende operatie. |
| A16 | UI-taal Nederlands, code Engels | Consistent met bestaande werkwijze. |

---

## 1. Roadmap (uit de productvisie)

- **Fase 1 — MVP: het dossier.** Partner CRUD + lijst, volledig dossier (paspoort, contacten, contracten, commissies + resolutie, documenten, tijdlijn, taken), dashboard met 6 signalen, ⌘K v1, instellingen.
- **Fase 2 — Producten & feeds.** Feed-import + runs + anomalie-blokkade, productenregister + effectieve commissie, campagnes, product-signalen, kwaliteits-/compleetheidsscores.
- **Fase 3 — Data & rapportages.** Netwerk-API's (Daisycon eerst), clicks/conversies, rapportages, afwijkingsdetectie, health score, dead-link-checker, BCC-logging.
- **Fase 4 — AI-laag.** PDF-extractie + bevestigingsflow, samenvattingen, tegenspraak-detectie, suggesties, "vraag het dossier", dossier-review.

---

## 2. Technische fundering

```
partnerdesk/
├── src/
│   ├── app/                  # routes: /, /partners, /partners/[id], /producten, /campagnes,
│   │   │                     # /rapportages, /taken, /instellingen, /login, /api/jobs/tick
│   ├── components/           # ui/ (shadcn), dossier/, dashboard/, tables/, search/
│   ├── lib/
│   │   ├── services/         # partner.ts, contract.ts, commission.ts, feed.ts, task.ts,
│   │   │   │                 # signal.ts, timeline.ts, document.ts, search.ts, importer/
│   │   ├── db/               # supabase client (server), generated types
│   │   ├── validation/       # zod-schema's, gedeeld client/server
│   │   └── jobs/             # tick-dispatcher, signal-engine, feed-sync, checks
│   └── types/
├── supabase/migrations/      # genummerde .sql, uitgevoerd via Dashboard
└── tests/                    # vitest (services), playwright (smoke per fase)
```

- **Mutatie-contract**: elke service-mutatie doet in één transactie: (1) validatie (zod), (2) schrijf, (3) tijdlijn-event indien relevant (§10), (4) `recomputeSignalsFor(subject)` (§11). UI-code raakt nooit rechtstreeks tabellen aan.
- **Tests**: vitest verplicht op `commission.resolve()`, signal-engine, feed-diff en cancel-by-berekening (dit is de business-kern); Playwright-smoke per fase-oplevering.
- **Verificatie-standaard**: `tsc --noEmit` + `vitest run` groen vóór elke oplevering.

---

## 3. Database

Notatie: `veld type [constraints]`. Alle tabellen hebben impliciet `id uuid PK default gen_random_uuid()` en `created_at timestamptz default now()` tenzij anders vermeld. FK's krijgen altijd een index (niet telkens herhaald).

### [F1] `networks` — affiliatenetwerken en directe relaties
```
name        text NOT NULL UNIQUE
kind        text NOT NULL CHECK (kind IN ('network','direct'))   -- Daisycon vs. Arctic Blue-direct
login_url   text
notes       text
```
Relaties: 1─n partners, 1─n api_connections. Verwijderen: RESTRICT zolang partners bestaan.

### [F1] `partners` — het dossier-anker
```
network_id      uuid NOT NULL FK→networks
name            text NOT NULL
slug            text NOT NULL UNIQUE                -- URL; bij botsing suffix -2
status          text NOT NULL DEFAULT 'onboarding'
                CHECK (status IN ('onboarding','active','paused','ended'))
website         text
login_url       text
login_username  text
account_manager text                                 -- naam accountmanager bij het netwerk
category        text                                 -- vrije hoofdcategorie van de partner
description     text
logo_path       text                                 -- Supabase Storage
archived_at     timestamptz
updated_at      timestamptz NOT NULL DEFAULT now()   -- trigger: on update
```
Indexes: `(status)`, pg_trgm GIN op `name`. Automatisch bij aanmaken: timeline_event `partner_created`.

### [F1] `labels` + `partner_labels`
```
labels:         name text NOT NULL UNIQUE · color text NOT NULL DEFAULT 'gray'
partner_labels: partner_id FK→partners · label_id FK→labels · PK (partner_id,label_id)
```

### [F1] `categories` — eigen product-taxonomie (niet die van het netwerk)
```
name       text NOT NULL
parent_id  uuid FK→categories NULL          -- max 2 niveaus diep (validatie in service)
UNIQUE (parent_id, name)
```

### [F1] `contacts`
```
partner_id      uuid NOT NULL FK→partners
name            text NOT NULL
role            text
email           text            -- NULL toegestaan; format-check in zod
phone           text
linkedin_url    text            -- moet linkedin.com bevatten
responsibility  text            -- "commissies", "techniek", ...
is_primary      boolean NOT NULL DEFAULT false
notes           text
last_contact_at timestamptz     -- denormalisatie; bijgewerkt door timeline-service
archived_at     timestamptz
UNIQUE (partner_id, email) WHERE email IS NOT NULL AND archived_at IS NULL
```
Max één `is_primary=true` per partner (partial unique index).

### [F1] `contracts`
```
partner_id           uuid NOT NULL FK→partners
number               text NOT NULL                -- UNIQUE (partner_id, number)
starts_on            date NOT NULL
ends_on              date                          -- NULL = onbepaalde tijd
notice_period_days   int CHECK (>= 0)
cancel_by            date GENERATED ALWAYS AS (ends_on - notice_period_days) STORED
cookie_days          int CHECK (>= 0)
approval_terms       text
exclusivity          text                          -- NULL = geen; anders omschrijving/categorie
auto_renews          boolean NOT NULL DEFAULT false
notes                text
archived_at          timestamptz
updated_at           timestamptz NOT NULL DEFAULT now()
```
**Status is berekend, geen kolom** (BR-01): concept (starts_on > vandaag) / actief / verlopen. Indexes: `(ends_on)`, `(cancel_by)`. Automatisch: timeline_event bij create/update (met diff), taak op `cancel_by − 14` (BR-04).

### [F1] `commission_rules`
```
contract_id   uuid NOT NULL FK→contracts
kind          text NOT NULL CHECK (kind IN ('cps_percent','cps_fixed','cpl','cpc','cpa'))
rate_percent  numeric(5,2) CHECK (rate_percent BETWEEN 0 AND 100)   -- bij cps_percent
amount_cents  int CHECK (amount_cents >= 0)                          -- bij de rest
scope         text NOT NULL DEFAULT 'all' CHECK (scope IN ('all','category','product'))
category_id   uuid FK→categories NULL     -- verplicht ALS scope='category'
product_id    uuid FK→products NULL       -- verplicht ALS scope='product' [vanaf F2]
rule_type     text NOT NULL DEFAULT 'standard'
              CHECK (rule_type IN ('standard','exception','promo','bonus'))
valid_from    date
valid_to      date                         -- verplicht ALS rule_type='promo' (BR-09)
bonus_terms   text                         -- omschrijving bonusvoorwaarde
notes         text
archived_at   timestamptz
```
CHECK: precies één van rate_percent/amount_cents gevuld, passend bij kind. **Waarde-wijziging na 24 u = archiveren + nieuwe regel** (BR-11) ⇒ immutabele historie. Automatisch: timeline_event `commission_changed` met diff.

### [F1] `commission_tiers` — staffels
```
commission_rule_id  uuid NOT NULL FK→commission_rules ON DELETE CASCADE
threshold_cents     int NOT NULL CHECK (>= 0)    -- omzetgrens vanaf
rate_percent        numeric(5,2)                  -- zelfde één-van-twee-check
amount_cents        int
UNIQUE (commission_rule_id, threshold_cents)
```

### [F1] `documents`
```
partner_id         uuid NOT NULL FK→partners
contract_id        uuid FK→contracts NULL
timeline_event_id  uuid FK→timeline_events NULL
kind               text NOT NULL CHECK (kind IN ('contract','terms','manual','rate_card',
                    'banner','logo','screenshot','other'))
title              text NOT NULL
storage_path       text NOT NULL
mime_type          text NOT NULL
file_size          int NOT NULL
version            int NOT NULL DEFAULT 1        -- zelfde titel opnieuw = +1
```
Bewuste keuze: **expliciete nullable FK's i.p.v. generiek `subject_type/subject_id`** — documenten horen altijd bij een partner, soms extra bij contract of event; dit houdt joins en integriteit simpel. Automatisch: timeline_event `document_uploaded`.

### [F1] `timeline_events` — append-only, tevens event-log voor AI (§20)
```
partner_id   uuid NOT NULL FK→partners
occurred_at  timestamptz NOT NULL DEFAULT now()
actor        text NOT NULL CHECK (actor IN ('user','system','ai'))
kind         text NOT NULL      -- zie catalogus §10
body         text               -- vrije tekst (notitie/mail-inhoud)
metadata     jsonb NOT NULL DEFAULT '{}'   -- diffs, verwijzingen, snapshots (naam contact e.d.)
contact_id   uuid FK→contacts NULL
contract_id  uuid FK→contracts NULL
```
Geen UPDATE/DELETE (revoke; correctie = nieuw event kind `correction` met verwijzing). Index: `(partner_id, occurred_at DESC)`. Trigger/service: kind ∈ {note-met-contact, email, call, meeting} ⇒ update `contacts.last_contact_at`.

### [F1] `tasks`
```
partner_id   uuid FK→partners NULL      -- NULL = algemene taak
contract_id  uuid FK→contracts NULL
feed_id      uuid FK→feeds NULL          [F2]
title        text NOT NULL
due_on       date
status       text NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','dismissed'))
source       text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','system','signal'))
dedupe_key   text UNIQUE                 -- bv 'cancel_by:<contract_id>' (BR-04)
completed_at timestamptz
```

### [F1] `signals` — gematerialiseerde uitkomst van checks
```
type           text NOT NULL             -- catalogus §11
severity       text NOT NULL CHECK (severity IN ('red','amber'))
subject_type   text NOT NULL             -- 'partner'|'contract'|'feed'|'product'|'api_connection'
subject_id     uuid NOT NULL
partner_id     uuid FK→partners NULL     -- denormalisatie voor dossier-weergave
status         text NOT NULL DEFAULT 'open' CHECK (status IN ('open','snoozed','resolved'))
snoozed_until  date
snooze_reason  text                      -- verplicht bij snooze (service-validatie)
reopen_count   int NOT NULL DEFAULT 0
dedupe_key     text NOT NULL UNIQUE      -- '<type>:<subject_id>' ⇒ upsert, nooit duplicaten
first_seen_at  timestamptz NOT NULL DEFAULT now()
resolved_at    timestamptz
```

### [F1] `saved_views` + `user_prefs` + `settings` + `recent_visits`
```
saved_views:   module text · name text · filters jsonb
user_prefs:    key text PK · value jsonb        -- ingeklapte secties, tabelkolommen
settings:      key text PK · value jsonb        -- bcc-adres, drempelwaarden-overrides
recent_visits: subject_type · subject_id · visited_at   -- voedt ⌘K bij lege query
```

### [F2] `feeds`
```
partner_id       uuid NOT NULL FK→partners
name             text NOT NULL
url              text NOT NULL
format           text NOT NULL CHECK (format IN ('xml','csv','json'))
schedule         text NOT NULL DEFAULT 'daily' CHECK (schedule IN ('hourly','daily','manual'))
is_active        boolean NOT NULL DEFAULT true
field_mapping    jsonb NOT NULL DEFAULT '{}'   -- feedveld → productveld
category_mapping jsonb NOT NULL DEFAULT '{}'   -- feedcategorie → categories.id
UNIQUE (partner_id, url)
```

### [F2] `feed_runs`
```
feed_id        uuid NOT NULL FK→feeds
started_at     timestamptz NOT NULL DEFAULT now()
finished_at    timestamptz
status         text NOT NULL CHECK (status IN ('running','ok','error','blocked'))
products_seen  int · added int · removed int · price_changed int
errors         jsonb NOT NULL DEFAULT '[]'    -- [{code,message,field?,line?}]
```
Automatisch: timeline_event `feed_synced` alléén bij diff ≠ 0 of status ≠ ok (anti-ruis).

### [F2] `products`
```
partner_id    uuid NOT NULL FK→partners
feed_id       uuid FK→feeds NULL             -- NULL = handmatig
external_id   text                            -- UNIQUE (feed_id, external_id)
ean           text
name          text NOT NULL
url           text NOT NULL                   -- affiliate-/product-URL
image_url     text
price_cents   int CHECK (>= 0)
category_id   uuid FK→categories NULL
feed_status   text NOT NULL DEFAULT 'manual'
              CHECK (feed_status IN ('mapped','new','missing','manual'))
missing_since date
manual_fields text[] NOT NULL DEFAULT '{}'    -- veld-level lock: handmatige override wint van feed
contract_id_override uuid FK→contracts NULL   -- alleen uitzonderingen (BR-14)
archived_at   timestamptz
updated_at    timestamptz NOT NULL DEFAULT now()
```
Indexes: `(partner_id)`, `(ean)`, pg_trgm op `name`.

### [F2] `campaigns` + `campaign_products`
```
campaigns:         name text NOT NULL · channel text · starts_on date · ends_on date
                   · notes text · archived_at timestamptz     -- status berekend uit datums
campaign_products: campaign_id FK · product_id FK · PK (campaign_id, product_id)
```

### [F3] `api_connections`
```
network_id     uuid NOT NULL FK→networks
partner_id     uuid FK→partners NULL     -- NULL = netwerk-breed (Daisycon), anders partner-specifiek
name           text NOT NULL
base_url       text NOT NULL
auth_kind      text NOT NULL CHECK (auth_kind IN ('api_key','oauth2','basic'))
credentials    text NOT NULL             -- AES-256-GCM-blob (A11)
rate_limit     text                      -- documentatief
is_active      boolean NOT NULL DEFAULT true
last_success_at timestamptz
UNIQUE (network_id, name)
```

### [F3] `api_logs`
```
api_connection_id uuid NOT NULL FK→api_connections
called_at timestamptz NOT NULL DEFAULT now() · endpoint text · status_code int
ok boolean NOT NULL · duration_ms int · error text
```
Retentie: nachtelijke job verwijdert > 90 dagen (bewuste uitzondering op append-only; operationeel log, geen historie).

### [F3] `clicks` + `conversions`
```
clicks: partner_id FK NOT NULL · api_connection_id FK · external_id text
        · clicked_at timestamptz NOT NULL · product_id FK NULL · campaign_id FK NULL
        · sub_id text · raw jsonb · UNIQUE (api_connection_id, external_id)

conversions: partner_id FK NOT NULL · api_connection_id FK · external_id text NOT NULL
        · click_id FK→clicks NULL · occurred_at timestamptz NOT NULL
        · revenue_cents int NOT NULL · commission_cents int NOT NULL   -- negatief = correctie
        · status text NOT NULL CHECK (status IN ('open','approved','rejected'))
        · expected_commission_cents int NULL   -- ingevuld door afwijkingscheck (BR-19)
        · raw jsonb · imported_at timestamptz NOT NULL DEFAULT now()
        · UNIQUE (partner_id, external_id)     -- her-import = status-update, geen duplicaat
```
Indexes: `conversions (occurred_at)`, `(partner_id, occurred_at)`.

### [F4] `embeddings` + `ai_extractions`
```
embeddings: subject_type text · subject_id uuid · chunk_index int · content text
            · content_hash text · embedding vector(1536)
            · UNIQUE (subject_type, subject_id, chunk_index)

ai_extractions: document_id FK NOT NULL · field text NOT NULL   -- 'commission','cookie_days',...
            · value text · source_quote text · source_page int
            · status text CHECK (status IN ('suggested','confirmed','rejected'))
```

### Automatisch aangemaakte records (overzicht)
| Trigger | Wat ontstaat |
|---|---|
| Partner aangemaakt | timeline_event `partner_created` |
| Contract aangemaakt/gewijzigd | timeline_event met diff; taak `cancel_by −14` (upsert op dedupe_key); signaal-herberekening |
| Commissieregel gewijzigd | archief + nieuw record (na 24 u), timeline_event `commission_changed` met oud→nieuw |
| Feed-run klaar | feed_run-record; timeline_event bij diff/fout; signaal bij error/blocked |
| Promo verlopen (nachtcheck) | timeline_event `promo_expired` |
| Document geüpload | timeline_event `document_uploaded` |
| Signal-engine (elk kwartier) | signals-upserts + auto-resolve; taken vanuit signaal waar gedefinieerd |
| Conversie-import | conversions-upsert; afwijkings-signaal (BR-19) |

---

## 4. Domeinmodel

```
Network ──1:n── Partner ──1:n── Contact
                   │
                   ├─1:n── Contract ──1:n── CommissionRule ──1:n── CommissionTier
                   │            ▲                  │ scope
                   │            │ override         ├──> alle producten van de partner
                   │            │                  ├──> Category (eigen taxonomie)
                   ├─1:n── Product ────────────────┴──> specifiek Product
                   │            │
                   │            └──n:m── Campaign        (via campaign_products)
                   ├─1:n── Feed ──1:n── FeedRun
                   ├─1:n── Document ──0..1──> Contract | TimelineEvent
                   ├─1:n── TimelineEvent ──0..1──> Contact, Contract
                   ├─1:n── Task ──0..1──> Contract, Feed
                   ├─1:n── Click ──0..1── Conversion
                   └─1:n── Signal (ook op Contract/Feed/Product/ApiConnection; partner_id denorm)
Network ──1:n── ApiConnection ──1:n── ApiLog
Category ──zelf-referentie (parent, max 2 niveaus)
Label ──n:m── Partner
```

**Many-to-many**: partner↔label, campaign↔product. **Bewust géén m:n product↔contract**: het actieve contract dekt standaard alle producten; alleen de uitzondering is een expliciete verwijzing (`contract_id_override`). Dit is de kern van "intuïtief in plaats van koppeltabellen".

**Afgeleide begrippen** (nooit opgeslagen, wel gecachet in memory per request):
- `contractStatus(contract, today)` → concept | active | expired (+ auto_renews-variant)
- `effectiveCommission(product | partner, today)` → winnende regel(s) per kind + herleiding (BR-08)
- `healthScore(partner)` → 0–100 met componentenlijst (BR-22) [F3]
- `completenessScore(partner)` → ontbrekende-veldenlijst (BR-21) [F2]

---

## 5. Pagina's

Per pagina: doel · onderdelen · tabellen/kaarten · filters/sortering · badges/waarschuwingen · lege/loading/fout-staat · desktop/mobiel. Loading-principe overal: server-rendered, paginawissel < 200 ms; suspense-skeleton alléén op tabellen met > 1 query; actieknoppen tonen inline spinner na 300 ms. Fout-principe overal: mutatie-fout = toast met herleesbare melding + "opnieuw"; page-fout = foutkader met details-uitklap, nooit een witte pagina.

### 5.1 [F1] `/login`
Doel: toegang. E-mail + wachtwoord (Supabase Auth), allowlist van 1 adres. Fout: "Onjuiste inlog". Geen registratie, geen wachtwoord-vergeten-flow in F1 (reset via Supabase dashboard — bewuste schuld, §15).

### 5.2 [F1] `/` — Vandaag
- **Doel**: in één oogopslag zien wat aandacht vraagt; alles ≤ 1 klik van de oplossing.
- **Onderdelen** (volgorde vast): ① Signalen (rood-groep, dan amber; > 5 per type ⇒ gegroepeerde regel "6 producten zonder commissieregel" met uitklap) ② Taken (te laat → vandaag → deze week ingeklapt) ③ Verloopkalender-strip 90 dgn ④ Recent (5 nieuwste partners, 5 laatst gewijzigde dossiers).
- **Acties per signaalregel**: klik = deep-link naar exacte sectie; hover-acties "＋ taak" en "⏰ snooze" (snooze opent popover: duur 7/30/90 dgn + verplichte reden).
- **Badges**: ● rood / ● amber; taken te laat rood. **Filters**: geen (het dashboard ís het filter — bewuste keuze).
- **Leeg**: "Alles rustig. 0 signalen, 0 taken vandaag." met vinkje-illustratie. **Mobiel**: zelfde volgorde, kalender-strip horizontaal scrollend.

### 5.3 [F1] `/partners`
- **Doel**: vinden + vergelijken van partners.
- **Tabel**: naam+logo · netwerk · status · health (— tot F3) · commissie nu (samengevat: hoogste CPS-regel) · contract t/m · laatste contact · signaal-stip. Rij-klik = dossier.
- **Filters**: status, netwerk, categorie, label, "met open signalen". **Sortering**: naam (default), contract t/m, laatste contact. Opgeslagen weergaven als tabs boven de tabel.
- **Acties**: "+ Partner" (naam + netwerk, meer niet — de rest vul je in het dossier in, BR-24); rechtsklik-rij: openen, archiveren, label toewijzen.
- **Leeg**: "Nog geen partners" + knop. **Mobiel**: kaartenlijst (naam, status, contract t/m, signaal-stip).

### 5.4 [F1] `/partners/[slug]` — het dossier (belangrijkste scherm)
- **Opbouw**: sticky kop (§visie 2.1) → paspoort-kaart → secties met sticky anker-nav links: Algemeen · Contactpersonen · Contracten · Commissies · Producten [F2] · Feeds [F2] · API [F3] · Materiaal & documenten · Tijdlijn · Taken. Sectie-inklapstatus onthouden (user_prefs).
- **Paspoort**: 8 regels (visie §2.2); regels waarvan de bron leeg is tonen "— nog invullen →" (deep-link). Feed/API-regels verschijnen pas in F2/F3.
- **Waarschuwingen in het dossier**: banner boven paspoort bij rode signalen van deze partner; gearchiveerde partner = grijze banner met "herstel"-knop; contract-kaarten en contactkaarten dragen hun eigen badges (§visie).
- **Tijdlijn**: composer bovenaan (één regel; type-selector notitie/mail/meeting/telefoontje; `@` koppelt contactpersoon; datum aanpasbaar voor invoer-met-terugwerkende-kracht). Filter-chips: Alles / Notities / Contact / Systeem. Paginering: 50 events, "ouder laden".
- **Leeg per sectie**: elke lege sectie = één zin + één knop ("Nog geen contracten. + Contract").
- **Mobiel**: anker-nav wordt horizontale chip-balk onder de kop; paspoort 1-koloms; inline-edit werkt, tabellen scrollen horizontaal.

### 5.5 [F2] `/producten`
- **Doel**: catalogus over partners heen; dé effectieve-commissie-vergelijker.
- **Tabel**: naam+foto · partner · categorie · prijs · **effectieve commissie** (sorteerbaar; tooltip met herleiding) · campagnes · feed-status. Rij-klik = zijpaneel (product-detail: alle velden, herleiding, "＋ uitzonderings-commissie", campagne-koppeling, feed-herkomst).
- **Filters**: partner, categorie, campagne, feed-status, "zonder commissie", "zonder categorie", "verdwenen uit feed", "nieuw". **Sortering**: naam, prijs, effectieve commissie, laatst gewijzigd.
- **Bulk**: checkbox-selectie ⇒ sticky actiebalk onderaan: "Voeg toe aan campagne" · "Wijzig categorie" · "Archiveer".
- **Badges**: feed-status (gemapt groen-stil / nieuw blauw / verdwenen amber / handmatig grijs), "geen commissie" amber. **Leeg**: "Nog geen producten — koppel een feed of voeg handmatig toe."
- **Mobiel**: read-only lijst, geen bulk.

### 5.6 [F2] `/campagnes` + `/campagnes/[id]`
Kaart-grid: naam, kanaal, periode, status (gepland/actief/afgelopen — berekend), #producten, (omzet vanaf F3). Detail: kop met inline-edit + producttabel (subset van §5.5 met "verwijder uit campagne"). Waarschuwing op kaart: "0 producten". Leeg: "+ Campagne".

### 5.7 [F2] Feed-mapping (subscherm dossier: `/partners/[slug]/feeds/[feedId]`)
Wizard-loze mapping-pagina: links voorbeeldrecords uit de feed (eerste 20), rechts veld-mapping (selects: feedveld → productveld) en categorie-mapping-tabel (feedcategorie → eigen categorie, met "maak nieuwe categorie"-inline-optie). Sticky onderbalk: "Test met 20 records" → diff-preview → "Activeer feed". Desktop-only (A12).

### 5.8 [F3] `/rapportages`
- KPI-tegels boven: omzet · commissie · conversies · afkeur-% (periode-selector: 7/30/90 dgn/jaar/custom).
- Tabel 1: per partner (omzet, commissie, conversies, afkeur-%, trend-sparkline). Tabel 2 (drill-down na klik): conversies (datum, product, campagne, omzet, commissie, verwacht, status). Afwijkings-rijen amber gemarkeerd.
- Filters: periode, partner, campagne, product, status. Export: CSV-knop op elke tabel (server-side generatie).
- Leeg: "Nog geen conversiedata — koppel een API onder Instellingen → Netwerken."

### 5.9 [F1] `/taken`
Tabel: titel · partner (link) · deadline · bron · status. Afvinken inline (checkbox, optimistic). Filters: status, partner, bron. Sortering: deadline (default), aanmaakdatum. Snelle invoer bovenaan ("titel @partner !12jul"). Te laat = rode datum. Mobiel: volwaardig (taken afvinken is dé mobiele use-case).

### 5.10 [F1] `/instellingen`
Secties: Netwerken (CRUD-tabel) · Categorieën (boom, 2 niveaus, inline) · Labels (chips + kleur) · E-mail-logging [F3]: BCC-adres tonen + uitleg · API-verbindingen [F3]: per netwerk, credentials-formulier, test-knop, log-tail · Data: export alles als JSON-dump (1 knop).

---

## 6. Componenten

`ui/` = shadcn-basis (Button, Input, Select, Popover, Dialog, Drawer, Command, Toast, Tooltip, Checkbox, DatePicker). Daarbovenop:

| Component | Spec |
|---|---|
| `AppShell` | Sticky sidebar (inklapbaar tot iconen, state in user_prefs), content-area, ⌘K-mount, toaster. |
| `SidebarNav` | 7 items + badge-counts (Vandaag = open rode+amber signalen, Taken = te laat + vandaag). |
| `CommandPalette` | cmdk; §12. Globale mount, overal `⌘K`/`ctrl+K`. |
| `PageHeader` | Titel, primaire actie rechts, optionele filter-rij eronder. |
| `PartnerHeader` | Sticky dossier-kop: logo, naam, StatusBadge, HealthScore, labels, quick actions. Krimpt bij scroll (logo klein, acties blijven). |
| `PassportCard` | 8 `PassportRow`s: label, berekende waarde, deep-link; "— nog invullen →"-variant. |
| `SectionAnchorNav` | Sticky links; scroll-spy markeert actieve sectie; klik = smooth scroll; mobiel: horizontale chips. |
| `CollapsibleSection` | Kop (titel + count + "+ nieuw"), persist ingeklapt-state per sectie-key. |
| `InlineEdit` | Varianten: text, textarea, select, date, money, percent. Klik → veld; Enter/blur = opslaan, Esc = annuleren; save = server action + UndoToast; conflictdetectie op `updated_at` (EC-110). |
| `DataTable` | Kolomconfig, sortering, selectie + `StickyActionBar`, rij-klik, rechtsklik-`ContextMenu`, `j/k`-navigatie, lege-staat-slot. |
| `StatusBadge` | Semantische kleuren: groen/blauw/amber/rood/grijs; nooit decoratief. |
| `CountdownBadge` | "Verloopt over N dgn" / "nog N dgn": amber < 60, rood < 30 (contract) resp. < 14 (opzeg). |
| `HealthScore` [F3] | Getal + ring; popover met componentenlijst, elk klikbaar. Zonder data: "—". |
| `CompletenessHint` [F2] | "Dossier 70% compleet — ontbreekt: cookieduur, logo" met invul-links. |
| `ContactCard` | Velden + ★-primair-toggle + laatste-contact-badge; mail-knop logt event (BR-16). |
| `ContractCard` | Kop met nummer + badges; feitengrid; `TierTable`; regels-count; documentchips; opzegdeadline-regel met ⏰. |
| `CommissionNowCard` | "Nu geldig"-blok: winnende regels per kind, elk met "waarom?"-tooltip (herleiding). |
| `CommissionRuleTable` | Alle regels; toggle "toon historie" (archived + verlopen); geneste tiers; promo-countdown; gepland-badge. |
| `FeedCard` [F2] | Status-stip, meta, laatste-run-diff, foutlog-uitklap, knoppen: sync nu (disabled tijdens run), mapping, pauzeer. |
| `FeedRunLog` [F2] | Laatste 20 runs: tijd, duur, status, diff, fouten-uitklap. |
| `ApiStatusCard` [F3] | Verbinding, laatste succes, fouten-24u, test-knop, log-tail. |
| `DocumentGrid` / `DocumentList` | Grid met preview (pdf/afbeelding) resp. lijst met versie + verouderd-vlag; `UploadDropzone` (drag & drop, allowlist, 25 MB). |
| `Timeline` + `TimelineComposer` | §5.4; event-rendering volgens catalogus §10. |
| `TaskRow` + `TaskQuickAdd` | Checkbox optimistic; quick-add parseert `@partner` en `!datum`. |
| `SignalRow` / `SignalGroup` | Ernst-stip, tekst, subject-link, hover-acties (taak/snooze); groep met count + uitklap. |
| `ExpiryCalendarStrip` | 90 dgn horizontaal; stippen (contract-einde ●, opzegdeadline ⏰); hover-popover; klik = dossier. |
| `SidePanel` | Drawer rechts, 480 px, URL-gekoppeld (`?panel=product:<id>`) zodat deep-linkbaar; Esc sluit. |
| `ConfirmDialog` | Alleen destructief; benoemt cascade-gevolgen expliciet ("3 regels en 2 documenten worden mee gearchiveerd"). |
| `EmptyState` | Eén zin + één primaire actie. |
| `UndoToast` | 8 s; voert inverse mutatie uit; niet bij archiveren-met-cascade (daar ConfirmDialog). |
| `SearchResultRow` | Icoon per type, titel, context-regel (partner), sneltoets-hint. |
| `KpiTile` [F3] | Waarde, delta t.o.v. vorige periode, sparkline. |

---

## 7. CRUD-flows

**Nieuwe partner** [F1]: "+ Partner" → mini-form (naam, netwerk) → create → redirect dossier → systeem: timeline `partner_created`, signaal `partner_no_contact` (na eerstvolgende engine-run), CompletenessHint toont wat ontbreekt → gebruiker vult inline: algemeen → contactpersoon (kaart "+") → contract ("+ Contract": nummer, looptijd, opzegtermijn, cookieduur → save ⇒ cancel_by + taak) → commissieregel(s) ("+ Regel": kind, waarde, scope, geldigheid; tiers optioneel) → document-upload (drag op sectie) → paspoort is nu gevuld; dashboard-signalen verdwijnen bij volgende engine-run (≤ 15 min) of direct via `recomputeSignalsFor` na elke mutatie (gekozen: **direct**, engine is vangnet).

**Contract toevoegen/wijzigen** [F1]: kaart-form in sectie (geen aparte pagina) → validaties §13 → save ⇒ diff-event, taak-upsert, signalen-recompute. Verlengen = `ends_on` aanpassen op bestaand contract (EC-23); nieuwe periode met andere voorwaarden = nieuw contract + oude laten verlopen.

**Commissieregel wijzigen** [F1]: waarde-edit < 24 u na aanmaak = in-place (typo-window); daarna forceert de service archive-and-replace met diff-event (BR-11). UI verbergt dit onderscheid: gebruiker "wijzigt" gewoon.

**Feed toevoegen** [F2]: dossier → "+ Feed" (naam, URL, formaat, schema) → service haalt eerste 20 records → mapping-scherm (§5.7) → veld- + categorie-mapping → testrun-preview (wat zou er ontstaan) → "Activeer" → eerste echte run → producten ontstaan met feed_status `new` → gebruiker bevestigt in register (bulk "markeer gemapt") of past categorie aan.

**Campagne** [F2]: "+ Campagne" (naam, kanaal, periode) → producten toevoegen via register-selectie → actiebalk → klaar.

**Notitie/mail/meeting** [F1]: composer → type + tekst + optioneel @contact + datum → event; `last_contact_at` bijgewerkt; contact-gebonden signalen recompute.

**Taak** [F1]: quick-add of vanuit signaal ("＋ taak" prefilt titel + koppeling). Afvinken → `task_completed`-event (alleen bij partner-gebonden taken).

**Document** [F1]: drop op sectie → upload naar Storage → record + event; zelfde titel = versie +1. [F4]: na upload van kind `contract` start extractie-job → suggesties in ContractCard ("AI vond: cookieduur 30 dgn — overnemen?").

**API-verbinding** [F3]: instellingen → netwerk → "+ Verbinding" → credentials → "Test" (verplicht groen vóór activeren) → nachtelijke + 4-uurlijkse import-job clicks/conversies.

---

## 8. Business rules (normatief)

| ID | Regel |
|---|---|
| BR-01 | Contractstatus: `concept` als starts_on > vandaag; `expired` als ends_on < vandaag; anders `active`. Geen statuskolom — altijd berekend. |
| BR-02 | Signaal `contract_expiring`: amber bij ends_on ≤ 60 dgn, rood bij ≤ 30 dgn. Niet bij auto_renews=true (daar geldt BR-03). Auto-resolve zodra verlengd/verlopen-en-vervangen. |
| BR-03 | Signaal `cancel_deadline`: amber bij cancel_by ≤ 30 dgn, rood bij ≤ 14 dgn; bij auto_renews jaarlijks herberekend voor de lopende periode. cancel_by in verleden ⇒ rood "verlengt automatisch per <datum>". |
| BR-04 | Taak "Beslis over opzegging contract <nr>" wordt ge-upsert (dedupe_key `cancel_by:<contract_id>`) op cancel_by − 14 dgn. Verlenging herberekent de taak zolang status open. |
| BR-05 | Signaal `partner_no_contact` (amber): partner actief én geen niet-gearchiveerde contactpersoon. |
| BR-06 | Signaal `stale_contact` (amber): actieve partner met `max(last_contact_at) > 90 dgn` (of nooit contact en partner > 30 dgn oud). |
| BR-07 | Signaal `contract_no_commission` (amber): actief contract zonder geldige commissieregel. Signaal `missing_commission` per product [F2]: actief product zonder matchende regel. |
| BR-08 | **Commissie-resolutie**: neem alle niet-gearchiveerde regels van niet-gearchiveerde contracten van de partner waarvan de geldigheid vandaag omvat (NULL = altijd) en het contract actief is; groepeer per `kind`; winnaar = hoogste op (scope-specificiteit: product 3 > category 2 > all 1) → (rule_type: exception 3 > promo 2 > standard 1) → (recentste valid_from, dan created_at). Bonus-regels doen niet mee aan resolutie (apart getoond). Herleiding (winnaar + verliezers) altijd beschikbaar voor de tooltip. |
| BR-09 | rule_type `promo` vereist valid_to. Nachtcheck: promo verlopen ⇒ timeline_event `promo_expired`. |
| BR-10 | Tiers: drempels strikt oplopend, eerste drempel = 0 toegestaan; toepasselijke tier = hoogste drempel ≤ omzet-deze-periode [F3; tot dan toont UI de tier-tabel zonder "huidige"]. |
| BR-11 | Commissiewaarde-wijziging > 24 u na aanmaak ⇒ archive-and-replace met diff-event. Binnen 24 u: in-place (typo-window). |
| BR-12 | Exclusiviteits-conflict: bij opslaan van contract met exclusivity gevuld → check andere actieve contracten met exclusivity in zelfde partner-category ⇒ blokkerende waarschuwing met override-knop (waarschuwen, niet verbieden — jij kent de deal). |
| BR-13 | Feed-anomalie [F2]: run met 0 producten óf ≥ 60 % minder dan vorige succesvolle run ⇒ status `blocked`, géén product-mutaties, rood signaal `feed_anomaly` met "toch toepassen"-actie. |
| BR-14 | Effectief contract van een product = `contract_id_override` indien gezet en dat contract actief is; anders het (enige) actieve contract; anders geen ⇒ telt mee in `missing_commission`. |
| BR-15 | Product niet meer in feed ⇒ feed_status `missing` + missing_since; na 30 dgn amber-suggestie archiveren; terug in feed ⇒ `mapped`, missing_since NULL. Nooit automatisch verwijderen. |
| BR-16 | Klik op mail-knop bij contact ⇒ `mailto:` + direct timeline_event kind `email` ("Mail gestuurd aan <naam>") — bewust optimistisch; corrigeerbaar via correction-event. |
| BR-17 | Snooze vereist reden; snooze schrijft timeline_event; verlopen snooze + conditie bestaat nog ⇒ status open, reopen_count +1, dashboard toont "2e keer". |
| BR-18 | Signalen zijn idempotent: engine upsert op dedupe_key; conditie weg ⇒ auto-resolve (ook tijdens snooze). |
| BR-19 | Afwijkingsdetectie [F3]: bij import bereken expected_commission via BR-08 op occurred_at-datum; afwijking > 1 % én > €0,50 ⇒ amber signaal `commission_mismatch` per partner (gegroepeerd). Geen regel herleidbaar ⇒ overslaan, teller "niet controleerbaar". |
| BR-20 | Dead-link-check [F3]: wekelijks HEAD-request op product-URL's van campagne-producten; 404/410 ⇒ amber signaal. |
| BR-21 | Compleetheidsscore [F2]: checklist — website, logo, login-URL, ≥ 1 contact, ≥ 1 actief contract, cookieduur, ≥ 1 commissieregel, categorie. Score = ingevuld/totaal. |
| BR-22 | Health score [F3] = gewogen som: contractstatus 25 (actief zonder rood signaal = vol) · feed-gezondheid 20 (laatste 7 runs ok) · contactrecentheid 20 (< 30 dgn vol, lineair naar 0 bij 120) · compleetheid 20 · omzettrend 15 (30 dgn vs vorige 30). Gewichten hardcoded (§15). Ontbrekende component ⇒ herwegen over rest. |
| BR-23 | Document ouder dan 12 mnd met kind `terms`/`rate_card` ⇒ "verouderd"-vlag (geen signaal — te veel ruis). |
| BR-24 | Aanmaken is altijd minimaal (naam + 1 verplicht veld); verrijken gebeurt in het dossier. Nooit lange formulieren. |
| BR-25 | Partner archiveren ⇒ open taken dismissed, signalen resolved, feeds gepauzeerd, timeline_event; alles omkeerbaar behalve taak-status. |

---

## 9. Tijdlijn-events (catalogus)

| kind | Actor | Icoon | Kleur | Metadata | Trigger |
|---|---|---|---|---|---|
| note | user | 📝 | grijs | — | composer |
| email | user | ✉️ | blauw | contact_snapshot {name,email} | composer of mail-knop (BR-16) |
| call / meeting | user | 📞 / 🤝 | blauw | contact_snapshot | composer |
| partner_created | system | ✦ | grijs | — | service |
| partner_archived / restored | system | 🗄 | grijs | — | service |
| contract_created | system | 📄 | grijs | {number} | service |
| contract_updated | system | 📄 | amber | {diff: {ends_on:[oud,nieuw],…}} | service |
| contract_expired | system | 📄 | rood | {number} | nachtcheck |
| commission_changed | system | 💶 | amber | {rule_id, diff:[oud,nieuw], scope} | archive-and-replace |
| promo_expired | system | ⏳ | grijs | {rule_id} | nachtcheck |
| feed_synced | system | 🔄 | grijs | {added,removed,price_changed} | run met diff ≠ 0 |
| feed_error / feed_blocked | system | 🔄 | rood | {errors[] / reden} | run |
| api_error | system | ⚡ | rood | {connection, error} | import-job (max 1/dag/verbinding — anti-ruis) |
| document_uploaded | system | 📎 | grijs | {document_id, title, kind} | upload |
| task_completed | system | ✓ | groen | {task_id, title} | afvinken |
| signal_snoozed | system | ⏰ | amber | {signal_type, until, reason} | snooze |
| correction | user | ↩︎ | grijs | {corrects: event_id} | correctie-flow (append-only-herstel) |
| ai_suggestion_applied [F4] | ai | ✨ | paars | {extraction_id, field, value} | bevestigingsflow |

Weergave: icoon + relatieve tijd (absolute in tooltip) + één regel; metadata-diff als "8% → 6%". Systeemevents visueel lichter dan user-events.

---

## 10. Dashboardblokken (berekening per blok)

Alle blokken lezen uit `signals` (de engine rekent, het dashboard toont — dashboard is dom en dus snel). Engine-checks in `lib/jobs/signal-engine.ts`, elk kwartier + na elke relevante mutatie.

| Blok / signaaltype | Conditie (pseudo-query) | Ernst | CTA (deep-link) | Acties |
|---|---|---|---|---|
| contract_expiring | contracts: active ∧ ends_on − today ≤ 60/30 ∧ ¬auto_renews | amber/rood | dossier#contracten | taak, snooze |
| cancel_deadline | cancel_by − today ≤ 30/14 | amber/rood | dossier#contracten | taak (prefab), snooze |
| partner_no_contact | partner active ∧ ∄ contact | amber | dossier#contacten | snooze |
| stale_contact | max(last_contact_at) > 90 dgn | amber | dossier#tijdlijn | taak "check-in", snooze |
| contract_no_commission | contract active ∧ ∄ geldige regel | amber | dossier#commissies | snooze |
| missing_commission [F2] | product active ∧ resolutie leeg | amber (groep) | producten?filter=zonder-commissie | bulk-fix |
| feed_error [F2] | laatste 3 runs status error | rood | dossier#feeds | sync nu, snooze |
| feed_stale [F2] | is_active ∧ laatste ok-run > 24 u (schema hourly/daily) | amber | dossier#feeds | sync nu |
| feed_anomaly [F2] | laatste run blocked (BR-13) | rood | run-detail | toepassen/verwerpen |
| campaign_empty [F2] | campagne actief > 7 dgn ∧ 0 producten | amber | campagne | — |
| duplicate_ean [F2] | 2 producten zelfde partner+ean | amber | producten?filter=duplicaat | — |
| api_error [F3] | verbinding actief ∧ > 24 u geen succes | rood | instellingen#api | test |
| commission_mismatch [F3] | BR-19 | amber (groep) | rapportages?filter=afwijking | — |
| dead_link [F3] | BR-20 | amber | product-paneel | — |
| tasks_overdue | tasks open ∧ due_on < today | rood | /taken | afvinken inline |

Taken-blok en Recent-blok lezen rechtstreeks (geen signalen). Verloopkalender: `contracts where ends_on of cancel_by binnen 90 dgn`. Dashboard is een server component; na inline-actie revalidate — "werkt zonder refresh" via router refresh, geen websockets (single user, §15).

---

## 11. Zoekfunctie (⌘K)

- **Bronnen + type-gewicht**: partners 10 · contacten 8 (naam, e-mail) · contracten 8 (nummer) · producten 6 (naam, EAN) · campagnes 6 · taken 5 · commissieregels 4 (notes/bonus_terms) · feeds 4 · documenten 4 (titel) · notities 3 (body) · acties 10 bij `>`-prefix.
- **Implementatie**: één server action `search(q)`; per bron een query met `similarity()` (pg_trgm) of exact-match op nummer/EAN/e-mail (exact ⇒ score 1.0); UNION, ranking = type-gewicht × tekstscore + recency-bonus (recent_visits); max 3 per groep, "meer…" klapt uit. Debounce 150 ms; < 2 tekens ⇒ recente items + acties.
- **Groepering** in vaste volgorde: Acties · Partners · Contacten · Contracten · Producten · Taken · Overig.
- **Deep links**: elk resultaat weet zijn anker (contract → `/partners/x#contracten`, product → `/producten?panel=product:id`).
- **Prefixes**: `p ` `c ` `# ` `t ` beperken tot één bron; `> ` acties ("nieuwe notitie bij …", "sync feed …", "ga naar …") met entiteit-herkenning op partnernaam.
- **Sneltoetsen**: ⌘K openen · ↑↓ navigeren · Enter openen · ⌘Enter in nieuw tabblad · Tab accepteert prefix-suggestie · Esc sluiten.
- **Nooit geïndexeerd**: credentials, login_username, storage-paden.

---

## 12. UX-details

- **Hover**: rijen lichte achtergrond + hover-acties rechts (opacity 0→1); links onderstrepen; badges tooltips.
- **Focus**: zichtbare focus-ring overal (toetsenbord-gebruiker is dé gebruiker); focus-trap in Drawer/Dialog.
- **Inline edit**: klik of `e` op gefocust veld; Enter/blur = opslaan, Esc = annuleren; multiline: ⌘Enter = opslaan. Opslaan = **autosave met UndoToast (8 s)**; geen "opslaan"-knoppen behalve in create-forms en mapping.
- **Undo**: inverse mutatie via service (die schrijft óók een event); niet beschikbaar bij cascade-archiveringen (daar ConfirmDialog vooraf).
- **Conflict**: server action krijgt `expected_updated_at` mee; mismatch ⇒ toast "Elders gewijzigd — herladen?" (EC-110).
- **Keyboard-map**: ⌘K zoek · `n` notitie (in dossier: prefilt partner) · `t` taak · `g d` Vandaag · `g p` Partners · `g r` Producten · `g t` Taken · `j/k` rijen · `x` selecteer rij · `e` edit · `Esc` sluit paneel. Cheatsheet op `?`.
- **Drag & drop**: alleen bestanden → DocumentGrid/secties (hele dossier-pagina is droptarget met sectie-keuze-overlay). Geen drag-reorder (sortering is altijd logisch bepaald — bewuste keuze).
- **Bulk**: checkbox + shift-klik-range; StickyActionBar onderaan met count + acties + Esc = deselecteer.
- **Contextmenu**: rechtsklik op tabelrijen (openen / nieuw tabblad / archiveer / label / kopieer link); niet op kaarten (daar zijn acties zichtbaar).
- **Sticky**: sidebar, PartnerHeader + paspoort (paspoort klapt bij scroll tot één samenvattingsregel), anker-nav, actiebalk, tabel-headers.
- **Expand/collapse**: sectie-chevrons, state per sectie in user_prefs; `⌥`-klik = alles in-/uitklappen.
- **Command palette**: §11; ook contextuele acties ("archiveer deze partner" wanneer in dossier).

---

## 13. Validaties

Alle validaties in zod (`lib/validation/`), gedeeld client (inline feedback) + server (bron van waarheid). DB-constraints als laatste vangnet.

- **Partner**: naam verplicht (≤ 120); netwerk verplicht; website/login-URL geldig URL-formaat; logo: png/jpg/svg/webp ≤ 2 MB.
- **Contact**: naam verplicht; e-mail RFC-formaat indien gevuld; uniek per partner (actief); linkedin_url bevat `linkedin.com`; telefoon vrij formaat (geen dwang).
- **Contract**: nummer verplicht + uniek per partner; starts_on verplicht; ends_on ≥ starts_on; notice_period_days 0–365; cookie_days 0–3650 (waarschuwing bij 0: "sessie-cookie?"); overlappende actieve contracten toegestaan mét niet-blokkerende waarschuwing (EC-21); exclusiviteit-conflict ⇒ BR-12.
- **Commissieregel**: kind verplicht; precies één waarde-veld, passend bij kind; 0 ≤ percent ≤ 100 (waarschuwing > 50: "weet je het zeker?"); scope-doel verplicht bij category/product-scope; product moet bij de partner van het contract horen; promo vereist valid_to; valid_to ≥ valid_from; duplicaat-waarschuwing bij identieke (kind, scope, doel, overlappende periode).
- **Tiers**: ≥ 1 rij indien gebruikt; drempels uniek en oplopend; waarden > 0.
- **Feed**: URL geldig + uniek per partner; format verplicht; activeren kan pas na geslaagde test-fetch; mapping moet minimaal name + url + price bevatten.
- **Product (handmatig)**: naam + url verplicht; price ≥ 0; EAN 8/13 cijfers indien gevuld; duplicaat-EAN binnen partner ⇒ waarschuwing (EC-56).
- **Campagne**: naam verplicht; ends_on ≥ starts_on.
- **Document**: allowlist pdf/docx/xlsx/png/jpg/svg/webp/zip; ≤ 25 MB; > 0 bytes; titel verplicht (default bestandsnaam).
- **Taak**: titel verplicht; due_on mag in verleden (direct te-laat).
- **API-verbinding**: base_url https; credentials verplicht; activeren pas na geslaagde test.
- **Signalen**: snooze-reden verplicht, ≥ 5 tekens.

---

## 14. Edge cases (118) — situatie → systeemreactie

### Partners
| EC | Situatie → reactie |
|---|---|
| 1 | Partner zonder contract → paspoort "geen contract — toevoegen →"; geen verloop-signalen; telt in compleetheid. |
| 2 | Partner zonder contactpersoon → amber signaal (BR-05). |
| 3 | Partner archiveren met open taken/signalen/feeds → ConfirmDialog benoemt cascade; BR-25. |
| 4 | Partner archiveren met actieve feed → feed gepauzeerd, expliciet genoemd in dialog. |
| 5 | Tweede partner met zelfde naam → toegestaan; slug krijgt `-2`; niet-blokkerende hint "bestaat al — bedoelde je …?". |
| 6 | Netwerk verwijderen met partners → geblokkeerd (RESTRICT) met melding "3 partners gekoppeld". |
| 7 | Logo verkeerd type/te groot → inline validatiefout, upload geweigerd. |
| 8 | Status 'ended' terwijl contract nog actief → toegestaan met waarschuwing; contractstatus blijft eigen berekening. |
| 9 | Health score zonder data → "—", nooit 0 (0 suggereert slecht). |
| 10 | Un-archiveren → alles zichtbaar terug; feeds blijven gepauzeerd (bewust handmatig heractiveren); event. |

### Contactpersonen
| 11 | Laatste contact verwijderen → toegestaan; signaal verschijnt direct (recompute). |
| 12 | Primair contact archiveren → geen auto-promotie; paspoort toont "kies primair contact →". |
| 13 | Duplicaat e-mail binnen partner → geblokkeerd. |
| 14 | Zelfde e-mail bij andere partner → toegestaan; info-hint "ook contact bij X". |
| 15 | Contact zonder e-mail → mail-knop disabled met tooltip. |
| 16 | Contact-events met datum in verleden → composer-datum aanpasbaar; last_contact_at = max(events). |
| 17 | Contact gearchiveerd die in events voorkomt → events tonen naam-snapshot uit metadata, geen dode link. |
| 18 | Ongeldige LinkedIn-URL → validatiefout. |

### Contracten
| 19 | Contract onbepaalde tijd (ends_on NULL) → status actief; geen verloop-signaal; cancel_by niet berekenbaar → veld-hint. |
| 20 | Contract zonder commissieregels → amber signaal (BR-07). |
| 21 | Twee overlappende actieve contracten → toegestaan + waarschuwing; resolutie werkt over beide (BR-08). |
| 22 | ends_on < starts_on → geblokkeerd. |
| 23 | Contract verlengd → verloop-signalen auto-resolved; opzegtaak herberekend (mits open); diff-event. |
| 24 | auto_renews + opzegtermijn → cancel_by per lopende periode; signaal keert jaarlijks terug. |
| 25 | Contract archiveren met regels/documenten → ConfirmDialog met aantallen; cascade-archief. |
| 26 | Product-override wijst naar verlopen contract → override genegeerd (BR-14), val terug op actief; hint op productrij. |
| 27 | PDF bij verkeerd contract geüpload → "verplaats naar…"-actie op documentrij. |
| 28 | cancel_by al verstreken bij invoer → rood signaal "verlengt automatisch per <ends_on>". |
| 29 | starts_on in de toekomst → status concept; regels tellen niet mee in resolutie. |
| 30 | Duplicaat contractnummer bij partner → geblokkeerd (unique). |
| 31 | Opzegtermijn zonder einddatum → cancel_by NULL; uitleg-hint bij veld. |
| 32 | Gearchiveerd contract → uit resolutie; zichtbaar via "toon historie". |
| 33 | Cookieduur 0 → toegestaan + waarschuwing. |

### Commissies
| 34 | Identieke regel opnieuw → duplicaat-waarschuwing, opslaan mag (soms bewust). |
| 35 | Promo zonder einddatum → geblokkeerd (BR-09). |
| 36 | Promo verloopt → uit "Nu geldig"; event `promo_expired`; regel in historie. |
| 37 | Percentage > 100 → geblokkeerd; > 50 → bevestigingsvraag. |
| 38 | Negatieve waarde → geblokkeerd. |
| 39 | Tier-drempels overlappen/gelijk → geblokkeerd (unique + oplopend). |
| 40 | Tiers niet-oplopend in waarde → toegestaan (degressieve staffels bestaan) — alleen drempels moeten oplopen. |
| 41 | Product-scope naar product van andere partner → geblokkeerd. |
| 42 | Categorie-scope op lege categorie → toegestaan; info-hint "0 producten". |
| 43 | Bonusregel zonder meetbare voorwaarde → toegestaan als tekst; geen voortgang. |
| 44 | Resolutie-gelijkspel → recentste valid_from wint; tooltip toont ook de verliezer ("overschrijft: 6% uit #2025-01"). |
| 45 | CPL + CPS tegelijk geldig → beide in "Nu geldig" (hybride; winnaar per kind). |
| 46 | valid_from in toekomst → badge "gepland"; niet in resolutie. |
| 47 | Waarde-correctie binnen 24 u → in-place; daarna archive-and-replace (BR-11). |
| 48 | Regel verwijderen die conversies verklaarde → archiveren, nooit hard delete (expected_commission blijft herleidbaar). |

### Feeds & producten
| 49 | Feed-URL timeout → run error; retry 3× met backoff; signaal na 3 mislukte rúns (niet retries). |
| 50 | Feed levert 0 producten → blocked, geen mutaties, rood signaal (BR-13). |
| 51 | Feed −60 % → idem; "toch toepassen"-knop voert diff alsnog uit + event. |
| 52 | Dubbele external_id in één run → eerste wint; fout in run-log. |
| 53 | Product uit feed verdwenen → missing (BR-15); nooit auto-delete. |
| 54 | Product komt terug → mapped; geen tijdlijn-event (ruis); zichtbaar in run-diff. |
| 55 | Prijs 0 in feed → import mét vlag; telt in kwaliteitsscore. |
| 56 | Duplicaat EAN binnen partner → tweede gevlagd; amber signaal (groep). |
| 57 | Zelfde EAN bij twee partners → toegestaan én waardevol (zelfde product, 2 leveranciers); koppel-hint in product-paneel. |
| 58 | Feed antwoordt met ander formaat dan geconfigureerd → parse-fout, run error met duidelijke melding. |
| 59 | Gemapt veld ontbreekt plots in feed → run error benoemt veldnaam; geen halve imports. |
| 60 | Encoding-rommel → UTF-8-normalisatie; vlag in run-log. |
| 61 | Feed met 50k items → streaming parse, upserts in batches van 500, harde limiet 10 min → anders error. |
| 62 | Twee feeds van één partner met overlap → dedupe op EAN binnen partner; tweede voorkomen wordt overgeslagen + gelogd. |
| 63 | "Sync nu" tijdens lopende run → knop disabled ("bezig sinds 14:02"). |
| 64 | Feed verwijderen → producten blijven (feed_id NULL, status manual); ConfirmDialog legt dit uit. |
| 65 | Handmatige edit van feed-veld → veld in manual_fields; feed overschrijft niet meer; badge "handmatig" + reset-knop. |
| 66 | Afbeelding-URL 404 → placeholder; kwaliteitsscore. |
| 67 | Product zonder categorie na mapping → bucket "Niet gemapt" + filter-chip. |
| 68 | Categorie verwijderen met producten → verplicht verplaats-flow naar doelcategorie. |
| 69 | Campagneproduct wordt missing → apart amber signaal (prioriteit boven gewone missing). |

### Campagnes
| 70 | Campagne 7 dgn actief zonder producten → amber signaal. |
| 71 | Campagne afgelopen → status berekend; koppelingen blijven (historie/rapportage). |
| 72 | Campagne verwijderen met conversie-data → alleen archiveren mogelijk; zonder data: hard delete toegestaan. |
| 73 | Product in meerdere campagnes → toegestaan. |
| 74 | Campagne over meerdere partners → by design toegestaan. |
| 75 | Campagne zonder einddatum → doorlopend actief. |

### Documenten
| 76 | 0-byte/beschadigde PDF → upload geweigerd ("bestand lijkt beschadigd"). |
| 77 | > 25 MB → geweigerd met limiet in melding. |
| 78 | Zelfde titel opnieuw → versie +1; beide downloadbaar; nieuwste in preview. |
| 79 | Niet-toegestaan type (.exe) → geweigerd (allowlist §13). |
| 80 | Document verwijderen dat AI-extractie voedde → extracties blijven met vlag "bron verwijderd". |
| 81 | Upload faalt halverwege → geen DB-record (record pas ná geslaagde storage-write); toast + retry. |
| 82 | docx-preview → geen inline preview; alleen download (alleen pdf/afbeeldingen inline). |
| 83 | Logo als document geüpload → hint "instellen als partnerlogo?". |

### Taken & signalen
| 84 | Taak uit signaal afgevinkt maar conditie bestaat nog → taak done; signaal blijft tot conditie weg is (waarheid > administratie). |
| 85 | Snooze zonder reden → geblokkeerd. |
| 86 | Snooze verlopen, conditie nog waar → open, reopen_count +1, "2e keer"-label. |
| 87 | Conditie lost op tijdens snooze → auto-resolved; snooze vervalt. |
| 88 | Zelfde signaal opnieuw gedetecteerd → upsert op dedupe_key; first_seen_at blijft. |
| 89 | Taak zonder partner → toegestaan (algemeen). |
| 90 | Due date in verleden → toegestaan; direct rood. |
| 91 | Automatische opzegtaak terwijl er al één is → dedupe_key voorkomt tweede. |
| 92 | > 5 signalen van zelfde type → gegroepeerde regel met count + uitklap (dashboard blijft rustig). |
| 93 | Taak aanmaken bij gearchiveerde partner → geblokkeerd met melding. |

### API & conversies
| 94 | API-key ongeldig → test faalt; verbinding niet activeerbaar; bij bestaande verbinding: rood signaal. |
| 95 | Rate limit → exponentiële backoff; log; signaal pas na > 24 u zonder succes. |
| 96 | Conversie zonder click-match → import met click_id NULL; match-ratio in rapportage. |
| 97 | Duplicaat external_id → upsert: status/bedrag-update, geen tweede rij. |
| 98 | Goedgekeurd → afgekeurd → status-update; afkeur-% in rapportage. |
| 99 | Negatieve commissie (correctie) → toegestaan; aparte weergave in drill-down. |
| 100 | Valuta ≠ EUR → rij overgeslagen + import-fout gelogd (A7). |
| 101 | Import-run overlapt vorige → advisory lock per verbinding; tweede run skipt stil. |
| 102 | Netwerk wijzigt API-schema → parse-fout gelogd; signaal na 3 opeenvolgende foutruns. |
| 103 | Conversie van gearchiveerde partner → import ok (historie telt door). |
| 104 | Click zonder sub_id → import ok. |
| 105 | Expected commission niet berekenbaar (geen regel op die datum) → check overgeslagen; teller "niet controleerbaar" in rapportage. |

### Zoeken & UI
| 106 | Query < 2 tekens → recente items + acties. |
| 107 | 0 resultaten → lege staat + actie "maak partner '<q>' aan". |
| 108 | Trage zoekquery → resultaten per groep streamen; invoer blijft responsief. |
| 109 | ⌘K tijdens inline-edit → eerst blur-save, dan palette. |
| 110 | Twee tabs bewerken zelfde veld → expected_updated_at-check ⇒ toast "elders gewijzigd — herladen?". |
| 111 | Netwerkfout bij autosave → rode veldrand + retry-knop; waarde blijft in het veld staan. |
| 112 | Deep-link naar gearchiveerd object → pagina met gearchiveerd-banner + herstel-knop, geen 404. |
| 113 | Sessie verlopen tijdens bewerking → redirect login met return-URL; niet-opgeslagen veldwaarde gaat verloren (geaccepteerd, gemeld). |

### AI [F4]
| 114 | Extractie met lage confidence → nooit auto-invullen; alleen suggestie-lijst. |
| 115 | Gescande PDF zonder tekstlaag → OCR-poging; faalt → "document niet leesbaar voor AI". |
| 116 | Tegenspraak false positive → "klopt al"-knop; dismissal opgeslagen (niet opnieuw melden voor zelfde bron+veld). |
| 117 | Document gewijzigd na embedding → content_hash-check ⇒ re-embed. |
| 118 | AI-antwoord zonder bronverwijzing → niet getoond; "geen betrouwbaar antwoord gevonden". |

---

## 15. Technische schuld — bewust simpel vs. direct goed

**Direct goed (fundament, niet later in te halen):**
- Append-only `timeline_events` met diffs in metadata — dit ís de AI-context en de audit-trail.
- Alle mutaties via de service-laag (A5) — retrofitten is onbegonnen werk.
- Geld in centen, stabiele UUID's, archiveren i.p.v. verwijderen (A6/A8/A9).
- Commissie-resolutie als pure, geteste functie (`resolve(rules, date)`) — de kern van het product.
- Signaal-idempotentie via dedupe_keys.

**Bewust simpel / hardcoded (prima tot het knelt):**
- Drempelwaarden (60/30/14 dgn, 90 dgn contact, 60 % anomalie) als constants in `lib/config.ts`; override via `settings` pas als ooit nodig.
- Health-score-gewichten hardcoded.
- Netwerkenlijst: gewoon CRUD, geen integratie-registry.
- Cron: systemd-timer + tick-route; geen queue. Feed-sync sequentieel.
- Zoek: pg_trgm; geen aparte zoekinfra.
- Dashboard-refresh: router revalidate; geen realtime.
- Geen wachtwoord-reset-flow (Supabase dashboard); geen 2FA in-app (staat op Supabase Auth-niveau).
- Rapportage-queries direct op conversions; materialized views pas > 100k rijen.

**Schaalbaar ontworpen (goedkoop nu, waardevol later):** embeddings/ai_extractions-schema vanaf F1 in migraties (leeg tot F4) · `raw jsonb` op clicks/conversions (her-interpreteerbaar bij API-wijzigingen) · importer per netwerk achter één interface (`NetworkImporter`) zodat Awin/TradeTracker later één bestand is.

---

## 16. Fase 1 — MVP: het dossier

**Doel**: het zoeken stopt. Alle partnerkennis (nu verspreid over netwerk-dashboards, mail en hoofd) staat in één dossier; het dashboard bewaakt contracten en relaties. **Na deze fase kan ik**: elke partnervraag in ≤ 2 klikken beantwoorden, contracten/commissies/contacten/documenten/notities vastleggen, en vertrouwen dat opzegdeadlines mij vinden. **Af = af**: dossier compleet (excl. feeds/API), 6 signalen, ⌘K, taken.

**Acceptatiecriteria:**
- ✓ Nieuwe partner aangemaakt in ≤ 30 s (naam + netwerk); dossier direct bruikbaar.
- ✓ Paspoort toont alle 8 regels; lege bronnen tonen invul-link; elke regel deep-linkt correct.
- ✓ Contract met opzegtermijn ⇒ cancel_by zichtbaar op kaart én paspoort; taak verschijnt op −14 dgn; signaal amber/rood op 30/14 dgn (getest met gemanipuleerde datums).
- ✓ Commissieregel wijzigen na 24 u ⇒ historie behouden + diff-event in tijdlijn; "Nu geldig" klopt met BR-08 (vitest-suite met ≥ 12 resolutie-scenario's, incl. EC-44/45/46).
- ✓ Tijdlijn ontvangt automatisch: partner_created, contract_updated (diff), commission_changed, document_uploaded, task_completed.
- ✓ Dashboard-signalen verschijnen ≤ 15 min na conditie (engine) én direct na mutatie (recompute); snooze vereist reden; auto-resolve werkt.
- ✓ ⌘K vindt partner, contact (op e-mail), contractnummer, notitie-tekst; Enter deep-linkt naar sectie.
- ✓ Inline edit overal in dossier: Enter/Esc/blur-gedrag + UndoToast + conflict-toast (EC-110).
- ✓ `tsc --noEmit` + `vitest run` groen; Playwright-smoke: login → partner aanmaken → contract + regel → paspoort klopt → signaal zichtbaar.

**Bouwvolgorde** (elke taak zelfstandig opleverbaar):
1. Repo-scaffold: Next.js + TS strict + Tailwind + shadcn/ui + vitest + Playwright; CI-script (tsc, vitest).
2. Supabase-project; migratie 001: networks, partners, labels, partner_labels, categories, contacts, contracts, commission_rules, commission_tiers, documents, timeline_events, tasks, signals, saved_views, user_prefs, settings, recent_visits + indexes + RLS (authenticated-all) + revoke update/delete op timeline_events.
3. Auth: Supabase Auth, allowlist-check in middleware, /login, sessie-guard.
4. `lib/db` + type-generatie; `lib/validation` zod-schema's (§13).
5. AppShell + SidebarNav + routes-skeleton + EmptyState/Toast/ConfirmDialog.
6. Service-laag-fundament: transactie-helper, `timeline.record()`, `recomputeSignalsFor()` (no-op checks), mutatie-contract (A5).
7. Partners: service + lijstpagina (DataTable, filters, saved views) + "+ Partner"-flow.
8. Dossier-skeleton: PartnerHeader, PassportCard (met lege-bron-varianten), SectionAnchorNav, CollapsibleSection, sectie Algemeen met InlineEdit (alle varianten).
9. Contacten: service + kaarten + primair-logica + validaties.
10. Contracten: service + ContractCard + TierTable + cancel_by + taak-upsert + diff-events.
11. Commissies: `resolve()` puur + vitest-suite; CommissionNowCard + CommissionRuleTable + archive-and-replace.
12. Documenten: Storage-bucket, UploadDropzone, DocumentGrid/List, versies.
13. Tijdlijn: Timeline + TimelineComposer + last_contact_at-bijwerking + correction-flow.
14. Taken: service + /taken + TaskQuickAdd + dossier-sectie.
15. Signal-engine: 6 checks (BR-02/03/05/06/07 + tasks_overdue), tick-route + systemd-timer, snooze/resolve-flows.
16. Dashboard: SignalRow/Group, taken-blok, ExpiryCalendarStrip, Recent, lege staat.
17. ⌘K: search-service + CommandPalette + recent_visits + deep-link-ankers.
18. Instellingen: netwerken, categorieën, labels; JSON-export.
19. Keyboard-map + sticky-gedrag + mobiele pass (dossier, taken, dashboard).
20. Seed met echte partners (Daisycon-programma's, Arctic Blue); Playwright-smoke; oplevering.

---

## 17. Fase 2 — Producten & feeds

**Doel**: de catalogus stroomt binnen en koppelt zichzelf; de effectieve-commissie-vraag ("wat verdien ik op dit product?") is beantwoord. **Na deze fase kan ik**: feeds koppelen en vertrouwen (anomalie-blokkade), producten over partners heen vergelijken op effectieve commissie, campagnes samenstellen. **Af = af**: feed-pipeline, register, campagnes, product-signalen, scores.

**Acceptatiecriteria:**
- ✓ Feed toevoegen → mapping → testrun → activeren, volledig zonder documentatie te raadplegen.
- ✓ Run met 0 of −60 % producten muteert niets en toont rood signaal met toepas/verwerp (EC-50/51).
- ✓ Productregister sorteert op effectieve commissie; tooltip toont herleiding incl. winnende regel + contract.
- ✓ Uitzonderings-commissie aan te maken vanaf de productrij; resolutie past zich direct aan.
- ✓ Verdwenen product wordt missing, nooit verwijderd; terugkeer herstelt mapped (EC-53/54).
- ✓ Handmatige veld-override overleeft de volgende sync (EC-65).
- ✓ Bulk: 20 producten in één handeling aan campagne koppelen.
- ✓ Feed-kwaliteits- en compleetheidsscores zichtbaar met klikbare ontbrekende punten.
- ✓ Vitest: feed-diff, anomalie-detectie, dedupe (EC-52/62), resolutie-met-productscope.

**Bouwvolgorde**: 1 migratie 002 (feeds, feed_runs, products, campaigns, campaign_products + product-FK in commission_rules) · 2 importer-interface + parsers (xml/csv/json, streaming) · 3 feed-service: fetch, diff, upsert-batches, anomalie-blokkade, runs · 4 scheduler in tick-route · 5 mapping-scherm (§5.7) + testrun-preview · 6 FeedCard + FeedRunLog in dossier + paspoort-feedregel · 7 productenregister + zijpaneel + filters + bulk-actiebalk · 8 effectieve-commissie-kolom (resolve met productscope) + "＋ uitzondering"-flow · 9 campagnes (pagina's + koppeling) · 10 product-signalen (missing_commission, duplicate_ean, feed_*, campaign_empty) in engine · 11 kwaliteits-/compleetheidsscores · 12 ⌘K-uitbreiding (producten, acties) · 13 dossier-productsectie · 14 tests + smoke + oplevering.

---

## 18. Fase 3 — Data & rapportages

**Doel**: het systeem meet en controleert zichzelf — conversies stromen binnen en worden getoetst aan de contracten. **Na deze fase kan ik**: zien wat elke partner/campagne/product oplevert, afwijkingen tussen belofte en uitbetaling vangen, en de gezondheid van elke relatie in één getal zien. **Af = af**: Daisycon-import, rapportages, afwijkingsdetectie, health score.

**Acceptatiecriteria:**
- ✓ Daisycon-verbinding: credentials → test → activeren; clicks + conversies importeren idempotent (her-run = geen duplicaten, EC-97).
- ✓ Rapportages: KPI's + per-partner-tabel + drill-down kloppen met een handmatig geverifieerde steekproef van 20 conversies.
- ✓ Afwijkende conversie (> 1 % én > €0,50) levert amber signaal met beide bedragen naast elkaar (BR-19).
- ✓ Staffel-voortgang zichtbaar op regel met tiers ("€ 3.400 tot staffel 3").
- ✓ Health score met klikbare componenten; partner zonder data toont "—" (EC-9).
- ✓ Dead-link-check en BCC-logging werkend (mail naar log-adres verschijnt ≤ 5 min in juiste tijdlijn).
- ✓ API-log-retentie (90 dgn) draait nachtelijks.
- ✓ Vitest: importer-idempotentie, afwijkingsberekening, health-componenten, CSV-export.

**Bouwvolgorde**: 1 migratie 003 (api_connections, api_logs, clicks, conversions) · 2 credential-encryptie (AES-GCM helper) + verbinding-CRUD + test-knop · 3 `NetworkImporter`-interface + Daisycon-implementatie (clicks, conversies; advisory lock) · 4 import-jobs in tick + api_error-signaal · 5 afwijkingscheck (expected via resolve-op-datum) + signaal · 6 rapportages-pagina (KPI's, tabellen, drill-down, filters, CSV) · 7 staffel-voortgang · 8 health score (BR-22) in lijst + dossier · 9 dead-link-checker (wekelijks) · 10 BCC-inbound (Resend inbound webhook → domein-match → timeline-event; geen match → "onverwerkt"-bakje in instellingen) · 11 ApiStatusCard + paspoort-API-regel · 12 log-retentie-job · 13 tests + smoke + oplevering.

---

## 19. Fase 4 — AI-laag

**Doel**: het dossier onderhoudt zichzelf. **Na deze fase kan ik**: een contract-PDF droppen en bevestigde velden terugkrijgen, tegenspraak tussen mail en dossier gemeld krijgen, en het dossier vragen stellen. **Af = af**: extractie + bevestigingsflow, samenvattingen, tegenspraak-detectie, suggesties, "vraag het dossier", maandreview.

**Acceptatiecriteria:**
- ✓ Contract-PDF upload → suggesties (commissie, cookieduur, opzegtermijn, looptijd) met bron-quote; overnemen per veld; nooit auto-toegepast (EC-114); toegepast = event `ai_suggestion_applied`.
- ✓ Samenvatting (3 zinnen) op elke contract-kaart met PDF.
- ✓ Tegenspraak: gelogde mail met "10%" terwijl dossier 8% zegt ⇒ melding met beide bronnen; "klopt al" onderdrukt herhaling (EC-116).
- ✓ "Vraag het dossier" beantwoordt met bronvermelding of zegt dat het antwoord er niet is (EC-118).
- ✓ Embeddings automatisch bij document/notitie-wijziging (hash-check, EC-117).
- ✓ Maandreview verschijnt als taak met bevindingenlijst.

**Bouwvolgorde**: 1 migratie 004 (pgvector aan, embeddings, ai_extractions) · 2 chunk + embed-pipeline (documenten met tekstlaag; OCR-fallback) in tick · 3 extractie-service (Claude API, function-calling naar gestructureerde velden + quotes) + bevestigings-UI in ContractCard · 4 samenvattingen (cache op content_hash) · 5 tegenspraak-check over nieuwe timeline-events/documenten vs. dossierfeiten + dismissals · 6 "vraag het dossier": RAG scoped op partner_id, antwoorden alleen mét bron · 7 suggestie-engine (categorie/campagne o.b.v. eerdere mappings) · 8 maandreview-job · 9 tests + oplevering.

---

## 20. AI-first architectuur (fundament vanaf dag 1)

1. **Events als grondstof**: `timeline_events` is append-only, met machine-leesbare `metadata` (diffs, snapshots, verwijzingen). AI-context per partner = events + entiteiten, chronologisch — geen aparte event-store nodig.
2. **Stabiele identiteit**: UUID's, nooit hergebruikt; archiveren i.p.v. verwijderen ⇒ verwijzingen vanuit embeddings/extracties/events blijven altijd resolvebaar.
3. **Semantisch doorzoekbaar**: `embeddings`-tabel (pgvector) met `subject_type/subject_id/chunk_index/content_hash` — werkt voor documenten, notities én gelogde mails; re-embed alleen bij hash-wijziging.
4. **RAG-klaar**: retrieval altijd gescoped (`partner_id`), antwoorden verplicht met bronverwijzing naar subject_id (afdwingbaar omdat elke chunk zijn herkomst kent).
5. **AI als gebruiker van de service-laag**: dezelfde service-functies (A5) worden later Claude-tools; AI-mutaties krijgen `actor='ai'` en zijn dus altijd herkenbaar en auditbaar in de tijdlijn.
6. **Suggestie ≠ mutatie**: AI schrijft naar suggestie-tabellen (`ai_extractions`); alleen expliciete bevestiging muteert het dossier.

---

*Definition of done voor het hele plan: elke vraag uit de oorspronkelijke frustratie-lijst ("welke commissie geldt, wie is mijn contactpersoon, waar log ik in, …") is beantwoordbaar vanaf het paspoort, en het dashboard vangt alles wat jij anders had moeten onthouden.*
