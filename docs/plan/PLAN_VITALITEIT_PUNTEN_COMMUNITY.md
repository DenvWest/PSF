# PLAN — Vitaliteit-transparantie · Punten & agenda · Community · Rewards

> **Layer 3 — Plan.** Architectuur- en onderzoeksdocument voor vier samenhangende pijlers die het product interactiever en uitnodigender maken: (1) transparante vitaliteitsuitleg, (2) puntensysteem + agenda/leefstijl-omgeving, (3) community/delen, (4) punten → rewards (gratis + betaald). **Alleen ontwerp — geen code, geen schema-migraties.** Pseudostructuur ter illustratie.
>
> Kruisverwijzingen: [`BRAND_POSITIONING.md`](../core/BRAND_POSITIONING.md) (§4 moat / §5 deel het "waarom") · [`COMPLIANCE.md`](../core/COMPLIANCE.md) · [`DPIA.md`](../core/DPIA.md) · [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) · [`ACCOUNT_DASHBOARD_SYSTEM.md`](../core/ACCOUNT_DASHBOARD_SYSTEM.md) · [`AFFILIATE_SYSTEM.md`](../core/AFFILIATE_SYSTEM.md) · [`PLAN_SOFTPILLAR_SELFEVAL_LOOP.md`](PLAN_SOFTPILLAR_SELFEVAL_LOOP.md) · [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md)

---

## 1. Samenvatting + aanbeveling

Het product heeft een sterke **meet-ruggengraat** (intake → 6 domeinscores → vitaliteit → leefstijlplan → check-ins → hermeting) maar mist de **terugkeer-/beloningslaag** die mensen bindt: er is geen publieke uitleg van de vitaliteitsscore, geen punten/streaks, geen agenda, geen delen, geen rewards (greenfield — bevestigd niet aanwezig). Dit plan ontwerpt die laag bovenop wat er staat, zónder de affiliate-monetisatie, de scoring-engine of de "leefstijl eerst"-positionering te raken.

### Aanbeveling in één tabel

| Pijler | Aanbeveling | Nu / later |
|---|---|---|
| **1. Vitaliteit-transparantie** | **DOEN — nu.** Publieke uitlegpagina `/vitaliteit` (het "waarom" van de 5 leefstijl-facetten + readout-logica), nul engine-internals. **Eerst één modelbeslissing forceren** (zie §2): de index bevat nu 4 interventies **+ herstel (een readout)** maar **niet energie** — dat is niet schoon uitlegbaar. | Nu (pagina); modelbeslissing blokkeert de copy |
| **2. Punten + agenda** | **DOEN — gefaseerd.** Append-only `points_ledger` (account-scoped) gevoed door bestaande events, met idempotentie via `dedupe_key`. Agenda = **afgeleide** tijdlijn uit bestaande tabellen (géén nieuwe tabel voor MVP). | MVP nu; `agenda_entries` (plannen) later |
| **3. Community / delen** | **MVP klein houden.** Alleen niet-gezondheids-artefacten delen (punten, streaks, "fase voltooid") — **nooit scores/labels** (art. 9). Nieuwe `consent_type`. Volledige feed/sociale graaf = later. | MVP later (na pijler 2); volledige community veel later |
| **4a. Rewards — gratis (Spoor A)** | **GO.** Punten ontgrendelen leefstijl-features/verdieping in het plan. Versterkt "leefstijl eerst". | Na pijler 2 |
| **4b. Rewards — betaald (Spoor B)** | **NO-GO voor Daisycon-cashback; NO-GO als hoofdboodschap.** Conditioneel/later alleen denkbaar als **eigen coupon via direct merchant-partnerschap** (Arctic Blue), met zwaar compliance/juridisch voorbehoud. | Niet bouwen nu; herzien bij volume + juridisch advies |

**Kernspanning die het hele plan stuurt:** elke beloningslaag rond *supplementen kopen* botst frontaal met de moat ("we kozen op kwaliteit, niet op commissie", [`BRAND_POSITIONING.md`](../core/BRAND_POSITIONING.md) §3/§7). Daarom: **belonen rond gedrag/leefstijl (Spoor A) is on-brand; belonen rond aankoop (Spoor B) is dat structureel niet.** Het puntensysteem moet de leefstijl-lus versterken, niet de affiliate-funnel.

**Concrete eerste stap (zie §8):** de publieke `/vitaliteit`-pagina (pijler 1) — laagste risico, geen datamodel, geen consent, en het levert meteen de uitlegtaal die pijler 2/4 hergebruiken. Maar éérst de modelbeslissing in §2 nemen.

---

## 2. Huidige-staat analyse per pijler

### Pijler 1 — Vitaliteit & uitleg

| Bestand | Wat het doet | Waarom relevant |
|---|---|---|
| [`src/lib/vitaliteit.ts`](../../src/lib/vitaliteit.ts) (`FACET_KEYS` r. 22–28, `computeVitaliteit` r. 44–61) | Vitaliteit = gewogen gemiddelde van **5 facetten** `sleep, stress, nutrition, movement, recovery`, elk `weight: 1.0`, afgerond 0–100. | **Energie zit NIET in de index; herstel WEL.** Dit is de hele uit-te-leggen kern. |
| [`src/lib/domain-role.ts`](../../src/lib/domain-role.ts) (r. 9–22) | `DOMAIN_ROLE`: `slaap/stress/voeding/beweging = intervention`, `energie/herstel = readout`. `READOUT_DRIVERS`: energie ← slaap/voeding/beweging; herstel ← slaap/beweging/stress. | Levert de *taal* ("stuurdomein" vs "uitkomst") voor de uitleg waarom energie buiten de stuurbare index valt. |
| [`src/lib/score-display.ts`](../../src/lib/score-display.ts) (r. 1–24) | Banden: Sterk ≥80, Voldoende ≥60, Aandacht ≥40, Prioriteit <40. Comment r. 1–4: bewust **geen numerieke totaalscore, geen leeftijds-percentielen** (KOAG/compliance). | Bepaalt wat we publiek tonen (banden, niet de rauwe formule). |
| [`src/lib/vitality-habit-kernel.ts`](../../src/lib/vitality-habit-kernel.ts) | `buildHabitScoreKernel` (confidence 0.42 zonder answers, 0.96 mét — r. 185/216), score → priority-pijler → zwakste vraag → driver-habit. | Bestaande, persoonlijke uitleg-copy in het dashboard; de publieke pagina moet hiernaar dóórverwijzen, niet dupliceren. |
| [`src/lib/vitality-explainer.ts`](../../src/lib/vitality-explainer.ts) | `getVitalityExplainer`: 3-regel uitleg (betekenis + driver-link + next-best-habit). | De ingelogde tegenhanger van de publieke pagina. |
| [`src/data/measurement-config.ts`](../../src/data/measurement-config.ts) (r. 16–25) | `indexFormula = computeVitaliteit(resolveVitaliteitFacets(scores))` — de canonieke formule voor delta-rapporten. | Single source of truth voor "de" vitaliteitsformule; de uitleg moet hiermee 1-op-1 kloppen. |
| [`src/app/methodologie/page.tsx`](../../src/app/methodologie/page.tsx) | Gaat **uitsluitend** over supplement-vergelijkingscriteria (biobeschikbaarheid/dosering/prijs/transparantie). | Bevestigt: **er is nog geen publieke pagina die de vitaliteitsformule uitlegt.** |
| [`src/components/intake/RevealMethodologyPanel.tsx`](../../src/components/intake/RevealMethodologyPanel.tsx) | Inklapbaar paneel in het resultaatscherm met `FoundationPyramid` (gepersonaliseerd). | Bestaande, niet-publieke uitleg-bouwsteen; hergebruikbaar maar ingelogd/post-intake. |

**De scherpe bevinding (model-inconsistentie).** De "readout"-uitleg uit `domain-role.ts` is elegant: energie en herstel zijn *uitkomsten* die je afleest, niet *knoppen* waar je aan draait — dus horen ze niet in een **stuurbare** index. Maar de feitelijke index ([`vitaliteit.ts`](../../src/lib/vitaliteit.ts) r. 22–28) bevat **herstel wél** en **energie niet**. Daarmee is de schone zin *"readouts vallen buiten de index"* **feitelijk onjuist**: herstel is óók een readout (`DOMAIN_ROLE.herstel = "readout"`) maar telt mee. Dit is geen detail — het is precies de plek waar een transparante uitleg vastloopt op een tegenstrijdigheid. Zie de afweging in §5 en de open vraag in §9.

### Pijler 2 — Dashboard / agenda / voortgang / punten

| Bestand | Wat het doet | Waarom relevant |
|---|---|---|
| [`src/data/dashboard/index.ts`](../../src/data/dashboard/index.ts) (`DASHBOARD_TABS` r. 281–306, `TAB_SECTIONS` r. 308–312) | 3 tabs: `vandaag` (now/priority/plan), `voortgang` (signals/nutritionIntake/history), `hermeting` (retest/future). | De plek waar een agenda/punten-UI moet landen; geen kalender/agenda aanwezig. |
| [`src/components/dashboard/Dashboard.tsx`](../../src/components/dashboard/Dashboard.tsx) (`identity: () => null` r. 1041) | Sectie-renderers; `identity` is **gedefinieerd maar rendert niets**. Geen agenda-UI. | Bevestigt greenfield voor agenda; `identity` is een dormant slot, geen agenda. |
| [`src/lib/plan-progress.ts`](../../src/lib/plan-progress.ts) (`getCheckinWeekBucket` r. 85–110; `upsertStepState` r. 151–252) | Voortgang per `(session_id, domain)`; `upsertStepState` geeft `phaseCompleted` + `checkinCompleted{weekBucket}` terug, met **idempotentie-guard**: check-in telt alleen als `previousStepState !== "done" && toState === "done"` (r. 237–244). | **Het bestaande idempotentie-patroon** dat het puntensysteem moet kopiëren; week-buckets (1/2/4/6/8/12) zijn de agenda-tijdas. |
| [`src/lib/account-dashboard.ts`](../../src/lib/account-dashboard.ts) (`loadAccountDashboardData` r. 225–472) | Productie-databron: leest `intake_sessions` per `account_id`, merge't `intake_domain_checkin` in de trend, laadt `plan_progress`. | Toont dat het dashboard **account-scoped** is en hoe sessies, check-ins en plan-voortgang al samenkomen — de aggregatiebasis voor punten/agenda. |
| [`src/lib/dashboard-model.ts`](../../src/lib/dashboard-model.ts) (`derivePriority` r. 14–20, `buildModel` r. 22–87) | Bouwt het read-model (ladder, prioriteit, vitaliteit-delta, actieve habit). | Punten/agenda hangen aan ditzelfde model; geen tweede waarheid bouwen. |
| [`supabase/migrations/20260612100000_intake_domain_checkin.sql`](../../supabase/migrations/20260612100000_intake_domain_checkin.sql) | `intake_domain_checkin`: `id` pk, `session_id`, `organization_id` (default-org FK), `domain_key`, `raw_inputs`, `score`, `rules_version`, `created_at`. RLS aan, service_role-only; in `cleanup_intake_session_linked_data()`. | **Append-only check-in-substraat** — geen composite PK, dus meerdere check-ins per sessie/domein → een natuurlijke agenda-bron. |
| [`src/types/lifestyle-plan.ts`](../../src/types/lifestyle-plan.ts) (`PlanStepProgress` r. 130–135) | `steps: Record<stepId, {state, updatedAt}>`; `id`-velden zijn stabiele sleutels in voortgang én events (r. 82–94). | Stap-`updatedAt` = de timestamps voor een afgeleide agenda. |

### Pijler 3 — Community / delen

Greenfield. Relevante randvoorwaarden:

| Bestand | Wat het doet | Waarom relevant |
|---|---|---|
| [`docs/core/DPIA.md`](../core/DPIA.md) (§1.3, R4) | `domain_scores`, `urgency_level`, `profile_label` = **afgeleide gezondheidsgegevens, art. 9**. R4: functie-creep richting medische interpretatie = hoogste restrisico. | Delen mag **nooit** scores/labels lekken; dat zou art. 9-data publiceren. |
| [`src/lib/account-session-cookie.ts`](../../src/lib/account-session-cookie.ts) | `psf_account` HMAC-cookie, 90 dagen; identiteit = e-mail, pseudoniem. | Delen vereist een ingelogde, opt-in identiteit — anonieme sessies hebben geen "thuis" om aan te delen. |
| [`src/lib/consent-texts.ts`](../../src/lib/consent-texts.ts) | Granulaire `consent_type`s per doel (o.a. `account_storage`, `domain_checkin_logging`). | Delen = nieuw verwerkingsdoel → vereist een **nieuwe** `consent_type` (§7). |

### Pijler 4 — Punten → rewards

| Bestand | Wat het doet | Waarom relevant |
|---|---|---|
| [`src/data/affiliate-links.ts`](../../src/data/affiliate-links.ts) + [`docs/core/AFFILIATE_SYSTEM.md`](../core/AFFILIATE_SYSTEM.md) | Daisycon (Vitaminstore/VitalNutrition) + Arctic Blue (direct via Awin, `sld=dennisvanwestbroek`). Sub-ID `[supplement]-vergelijking`. | We beheren **merchant-prijzen niet** — cruciaal voor de "korting"-analyse (§6). |
| [`docs/core/ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) (`interventions`: `tier 1-5`, `is_paid`, `paid_disclosure_key`) | Stepped-care-trap: tier 1 = gratis quick win … tier 3 = supplement … tier 4-5 = betaald. | Spoor A (gratis unlock) past op `tier`; het bestaande model ondersteunt "toon nu alleen gratis" zonder schemawijziging. |
| [`docs/core/BRAND_POSITIONING.md`](../core/BRAND_POSITIONING.md) §7 | "Geen kortingscodes of exclusieve deals als hoofdboodschap (ondermijnt Consumentenbond-positionering)." | **Expliciet merkverbod** dat Spoor B raakt. |

### Events / meten (basis voor alle pijlers)

- [`src/lib/events.ts`](../../src/lib/events.ts) (`DOMAIN_EVENT_TYPES` r. 8–42, `emitEvent` r. 61–126): append-only `domain_events`-insert + optioneel n8n-webhook via `deliveredTo`. Bestaande, herbruikbare triggers: `measurement.checkin_completed`, `plan.step_state_changed`, `plan.phase_completed`, `plan.checkin_completed`, `remeasure.completed`.
- [`src/lib/intake-events-client.ts`](../../src/lib/intake-events-client.ts) (`ClientEmitType` r. 3–21) + [`src/app/api/intake/events/route.ts`](../../src/app/api/intake/events/route.ts) (allowlist r. 12–28): een nieuw **client-event** vereist registratie op **drie plekken** (union + `DOMAIN_EVENT_TYPES` + route-allowlist) en vereist intake-sessie-cookie + analytics-consent (behalve de twee `dashboard.*`-uitzonderingen r. 93–95).
- [`src/lib/ga4.ts`](../../src/lib/ga4.ts) (`trackEvent`, `GA4_EVENTS`), [`src/lib/clarity.ts`](../../src/lib/clarity.ts) (`clarityTag`): client-side meetlagen, geen PII.

> ⚠️ **Doc-drift om te corrigeren bij implementatie:** [`COMPLIANCE.md`](../core/COMPLIANCE.md) §AVG zegt nog *"Geen account-systeem"*, terwijl het passwordless account-systeem live is ([`ACCOUNT_DASHBOARD_SYSTEM.md`](../core/ACCOUNT_DASHBOARD_SYSTEM.md), [`account-session-cookie.ts`](../../src/lib/account-session-cookie.ts)). Punten/community bouwen verder op dat account; werk COMPLIANCE.md bij wanneer deze laag landt.

---

## 3. Voorgesteld datamodel

**Sjabloon-discipline (uit [`plan_progress.sql`](../../supabase/migrations/20260602100000_plan_progress.sql)):** elke nieuwe tabel krijgt `organization_id uuid not null default '00000000-0000-0000-0000-000000000001' references organizations(id)`, een index op `organization_id`, `enable row level security`, **geen anon/authenticated policies** (alleen service_role via API-routes), en — waar sessie-gekoppeld — opname in `cleanup_intake_session_linked_data()`.

**Scoping-keuze: punten zijn account-scoped, niet sessie-scoped.** `plan_progress` en `intake_domain_checkin` hangen aan `session_id` (pseudoniem). Maar punten horen bij de **persoon over de tijd** — meerdere sessies, één account ([`account-dashboard.ts`](../../src/lib/account-dashboard.ts) leest per `account_id`). Daarom: het ledger hangt aan `account_id`; de herkomst-sessie wordt als **referentie** bewaard (`source_session_id`, `on delete set null`). Gevolg: **punten bestaan alleen voor ingelogde accounts** — anonieme intake-sessies verzamelen niets tot ze geclaimd worden. Dit is een feature, geen bug: het maakt inloggen waardevol (de continuïteit-moat uit [`ACCOUNT_DASHBOARD_SYSTEM.md`](../core/ACCOUNT_DASHBOARD_SYSTEM.md)).

### 3.1 `points_ledger` (nieuw — append-only, account-scoped) — pijler 2

```
points_ledger
  id                uuid pk default gen_random_uuid()
  account_id        uuid not null references accounts(id) on delete cascade
  organization_id   uuid not null default '0000…0001' references organizations(id)
  delta             integer not null         -- + verdiend / − ingewisseld
  reason            text not null            -- 'checkin' | 'plan_step_done' | 'phase_completed'
                                             --  | 'week_streak' | 'remeasure_completed' | 'redeem_reward'
  source_event      text                     -- domain_events.event_type die de toekenning triggerde
  source_session_id uuid references intake_sessions(id) on delete set null
  dedupe_key        text not null            -- idempotentie-sleutel (zie §3.5)
  created_at        timestamptz not null default now()
  unique (account_id, dedupe_key)
  -- indexen: (account_id), (organization_id)
  -- RLS aan, GEEN anon/authenticated policies
```

- **Saldo = afgeleid, geen aparte tabel.** Balans = `SUM(delta) WHERE account_id = … AND delta-window`. Bij lage volumes is een `SUM`-query op read de schoonste single source of truth (zelfde "ruwe bron + afgeleide op read"-filosofie als `intake_intake_log.raw_inputs`/`estimate`). Pas bij schaal een materialized view of `points_balance`-cache toevoegen — niet in MVP.
- **`on delete cascade` op `account_id`:** account verwijderen wist het ledger (AVG-erasure langs de account-lifecycle, zie §3.6).
- **Relatie tot bestaande tabellen:** `accounts` (eigenaar), `intake_sessions` (herkomst, nullable), `domain_events` (`source_event` = audit-koppeling naar het triggerende event).

### 3.2 Agenda — **MVP = afgeleid, geen nieuwe tabel** — pijler 2

De agenda (week/maand: "wat deed ik wanneer") is volledig construeerbaar uit bestaande timestamps:

| Bron | Veld | Wordt agenda-item |
|---|---|---|
| [`intake_sessions`](../core/ENTITY_MODEL.md) | `created_at` | "Volledige check / hermeting" |
| [`plan_progress`](../../src/lib/plan-progress.ts) | `steps[*].updatedAt` + `state=done` | "Plan-stap afgerond" |
| [`intake_domain_checkin`](../../supabase/migrations/20260612100000_intake_domain_checkin.sql) | `created_at` + `domain_key` | "Domein-check-in" |
| [`intake_intake_log`](../core/ENTITY_MODEL.md) | `logged_at` | "Voedingslog" |
| `getCheckinWeekBucket(startedAt)` ([`plan-progress.ts`](../../src/lib/plan-progress.ts) r. 85–110) | week-1/2/4/6/8/12 | De **cadans-as** (week-bucket) waarlangs de agenda groepeert |

→ Een server-side `buildAgendaTimeline(accountId)` (nieuwe `src/lib/`-functie, géén migratie) leest deze rijen voor de account-sessies (zoals `account-dashboard.ts` al doet) en projecteert ze op een week/maand-raster. **Geen nieuwe tabel voor MVP.**

**Later, optioneel — `agenda_entries`** (alleen nodig zodra gebruikers *vooruit plannen*, niet alleen terugkijken):

```
agenda_entries
  id, account_id (fk, cascade), organization_id (default-org),
  domain text, kind text ('checkin'|'plan_step'|'custom'),
  scheduled_for date, completed_at timestamptz null,
  source_session_id uuid (set null), created_at
  -- RLS aan, service_role-only
```

### 3.3 `reward_redemptions` (nieuw) — pijler 4 (Spoor A)

```
reward_redemptions
  id              uuid pk default gen_random_uuid()
  account_id      uuid not null references accounts(id) on delete cascade
  organization_id uuid not null default '0000…0001' references organizations(id)
  reward_key      text not null            -- sleutel in de rewards-catalogus (datafile, §3.7)
  points_spent    integer not null
  status          text not null default 'unlocked'  -- 'unlocked' | 'revoked'
  dedupe_key      text not null            -- voor one-time-rewards: 1× per (account, reward_key)
  created_at      timestamptz not null default now()
  unique (account_id, dedupe_key)
  -- RLS aan, service_role-only
```

- Inwisselen = **transactie**: insert `reward_redemptions` + insert `points_ledger`-rij met negatieve `delta` (`reason='redeem_reward'`, `dedupe_key` gedeeld). Saldo-check server-side vóór insert.
- **Spoor B (betaalde korting) krijgt hier bewust GEEN tabel** — zie go/no-go in §6.

### 3.4 `community_shares` (nieuw) — pijler 3 (MVP)

```
community_shares
  id              uuid pk default gen_random_uuid()
  account_id      uuid not null references accounts(id) on delete cascade
  organization_id uuid not null default '0000…0001' references organizations(id)
  visibility      text not null default 'private'  -- 'private' | 'cohort' | 'public'
  share_kind      text not null            -- 'streak' | 'points_milestone' | 'plan_phase_completed'
  payload         jsonb not null default '{}'  -- ALLEEN niet-gezondheids-artefacten (zie §7)
  status          text not null default 'active'  -- 'active' | 'hidden' | 'removed' (moderatie)
  created_at      timestamptz not null default now()
  updated_at      timestamptz not null default now()
  -- indexen: (account_id), (organization_id), (visibility, status)
  -- RLS aan, service_role-only; lezen via API-route met expliciete veld-allowlist
```

- **Harde regel in de API-laag, niet alleen in copy:** `payload` mag **nooit** `domain_scores`, `vitality`, `profile_label`, `urgency_level` of een afgeleide daarvan bevatten (art. 9). De write-route valideert tegen een allowlist van toegestane velden; een centrale guard (zoals de `FORBIDDEN_PHRASES`-aanpak elders) weert health-keys.
- Moderatie/abuse: `status`-veld + een latere `community_reports`-tabel (MVP: handmatige `status='hidden'` via admin).

### 3.5 Idempotentie — kopieer het bestaande check-in-patroon

Het puntensysteem mag **nooit dubbel toekennen** bij herhaalde of opnieuw-afgevuurde events. Twee lagen:

1. **Bron-guard (bestaat al):** `upsertStepState` ([`plan-progress.ts`](../../src/lib/plan-progress.ts) r. 237–244) emit `checkinCompleted` alléén bij een **echte overgang** naar `done` (`previousStepState !== "done"`). Punten haken op die transitie-signalen, niet op de rauwe state.
2. **Ledger-guard (nieuw):** `unique (account_id, dedupe_key)`. De `dedupe_key` is deterministisch per gebeurtenis:

| Reason | `dedupe_key` (voorbeeld) | Voorkomt |
|---|---|---|
| `checkin` | `checkin:{session_id}:{domain}:{weekBucket}` | Dubbele punten bij meerdere check-ins in dezelfde week-bucket |
| `plan_step_done` | `step:{session_id}:{domain}:{stepId}` | Heen-en-weer togglen `done`→`todo`→`done` |
| `phase_completed` | `phase:{session_id}:{domain}:{phaseId}` | Re-emit van `plan.phase_completed` |
| `week_streak` | `streak:{account_id}:{isoWeek}` | Eén streak-bonus per kalenderweek |
| `remeasure_completed` | `remeasure:{session_id}` | Re-emit van `remeasure.completed` |

→ Een `INSERT … ON CONFLICT (account_id, dedupe_key) DO NOTHING` maakt toekenning idempotent ongeacht hoe vaak het event binnenkomt. **Anti-misbruik:** togglen levert door `dedupe_key` geen extra punten; check-in-spam binnen één week-bucket telt één keer; streak is per ISO-week gegate.

### 3.6 AVG-opruiming

- **Sessie-pad** (`cleanup_intake_session_linked_data()`): `points_ledger.source_session_id` en `agenda_entries.source_session_id` staan op `on delete set null` → het ledger overleeft sessie-verwijdering (punten blijven van de persoon) maar verliest de herleidbare koppeling naar art. 9-data. Geen wijziging aan de cleanup-functie strikt nodig voor punten; **wél** moet `community_shares` mee als die een `source_session_id` zou krijgen (advies: géén session-koppeling op shares — houd ze puur account+artefact).
- **Account-pad** (`revoke`/`delete` uit [`ACCOUNT_DASHBOARD_SYSTEM.md`](../core/ACCOUNT_DASHBOARD_SYSTEM.md)): `delete` → `accounts`-rij weg → `points_ledger`, `reward_redemptions`, `community_shares`, `agenda_entries` cascaderen via `account_id`. **Aanbeveling:** breid de account-revoke/delete-flow (en de bijbehorende RPC's) expliciet uit zodat deze vier tabellen meegaan — net zoals de sessie-cleanup nieuwe tabellen opnam.

### 3.7 Rewards-catalogus = datafile, geen tabel

Net als `approved-claims.ts` het claim-control-point is, hoort de **rewards-definitie** in een getypeerd datafile (bv. `src/data/rewards/catalog.ts`): `reward_key`, `points_cost`, `kind` (`feature_unlock`), `unlocks` (welke plan-feature), NL-copy. TypeScript dwingt consistentie af; alleen de *redemption-staat* leeft in Supabase (`reward_redemptions`). Spoor B (commercieel) staat hier bewust níét in.

---

## 4. Event-taxonomie

### 4.1 Nieuwe `domain_events`-types (server-side geëmit)

Voeg toe aan `DOMAIN_EVENT_TYPES` in [`src/lib/events.ts`](../../src/lib/events.ts). **Voorkeur: punten-events server-side emitten** in dezelfde API-route die het ledger schrijft — autoritatief, geen client-vertrouwen, geen 3-plekken-dans nodig.

| Event | Wanneer | Payload (anoniem; geen PII) | Bron |
|---|---|---|---|
| `points.awarded` | Bij elke ledger-insert met `delta > 0` | `{ reason, delta, balance_after, domain? }` | Server (ledger-route) |
| `points.redeemed` | Bij reward-inwisseling (Spoor A) | `{ reward_key, points_spent, balance_after }` | Server |
| `reward.unlocked` | Feature ontgrendeld (Spoor A) | `{ reward_key }` | Server |
| `streak.milestone_reached` | Week-streak bonus toegekend | `{ weeks, domain? }` | Server |
| `community.share_created` | Nieuwe share (pijler 3) | `{ share_kind, visibility }` — **nooit score/label** | Server |

Deze hangen aan het bestaande funnel-join-mechanisme (`session_id`/`account`-context) en kunnen via `deliveredTo: ["posthog"]` of `["n8n_webhook"]` doorstromen ([`events.ts`](../../src/lib/events.ts) r. 101–125), conform de meet-standaard.

### 4.2 Nieuwe client-events (de DRIE-plekken-registratie)

Alleen **pure UI-interacties** die de server niet ziet, vereisen een client-event. Elk vereist registratie op **drie plekken**:
1. `DOMAIN_EVENT_TYPES` in [`src/lib/events.ts`](../../src/lib/events.ts)
2. de `ClientEmitType`-union in [`src/lib/intake-events-client.ts`](../../src/lib/intake-events-client.ts)
3. de `CLIENT_EMIT_TYPES`-allowlist in [`src/app/api/intake/events/route.ts`](../../src/app/api/intake/events/route.ts)

| Client-event | Doel | Let op |
|---|---|---|
| `agenda.viewed` | Agenda-tab geopend (engagement) | Account-context, mogelijk **zonder** intake-sessie-cookie |
| `points.ledger_viewed` | Saldo/historie bekeken | idem |
| `reward.claim_clicked` | Klik op "inwisselen" vóór server-bevestiging | Server `points.redeemed` blijft de waarheid |
| `community.share_cta_clicked` | Klik op "deel mijn voortgang" | idem |

> ⚠️ **Architectuur-aandachtspunt:** de huidige `/api/intake/events`-route vereist een **intake-sessie-cookie** (behalve de twee `dashboard.*`-events, r. 93–95). Account-dashboard-bezoekers hebben niet gegarandeerd een geldige intake-sessie-cookie. **Twee opties** (besluit voor Dennis, §9): (a) markeer de nieuwe account-context-events als `sessionOptional` in de route (zoals `dashboard.vitality_scored`), óf (b) introduceer een aparte `/api/account/events`-route die op `psf_account` valideert. Optie (b) is schoner voor de scheiding account- vs intake-context, maar meer werk. Voor MVP volstaat (a).

### 4.3 GA4 / Clarity per nieuwe actie/CTA/reward

Conform meet-standaard, geen PII in payloads:

| Actie | GA4 (`trackEvent`) | Clarity (`clarityTag`) |
|---|---|---|
| Punt verdiend (zichtbaar) | `punt_verdiend` `{ reason }` | `tag('points_reason', reason)` |
| Agenda geopend | `agenda_geopend` | `tag('feature', 'agenda')` |
| Reward ingewisseld | `reward_ingewisseld` `{ reward_key }` | `tag('reward', reward_key)` |
| Share aangemaakt | `voortgang_gedeeld` `{ share_kind }` | `tag('share_kind', share_kind)` |
| Vitaliteit-uitleg geopend (pijler 1) | `vitaliteit_uitleg_geopend` | `tag('feature', 'vitaliteit_uitleg')` |

**Meetpunt-belofte per pijler** (af te lezen na livegang):
- Pijler 1: `vitaliteit_uitleg_geopend` (GA4) + `vitaliteit.viewed` desgewenst → *leest engagement op de uitleg af.*
- Pijler 2: `points.awarded` + `agenda.viewed` (domain_events) → *leest of de beloningslaag terugkeer verhoogt.*
- Pijler 3: `community.share_created` → *leest deel-conversie.*
- Pijler 4: `points.redeemed` + `reward.unlocked` → *leest of rewards gedrag sturen.*

---

## 5. UX / IA — interactiever en uitnodigender

### Pijler 1 — publieke `/vitaliteit`-uitlegpagina

**Plek:** een **eigen publieke route `/vitaliteit`** (niet onder `/methodologie`, want dat is supplement-criteria; niet alleen in het dashboard, want het moet voor *iedereen, ook niet-ingelogd* zichtbaar zijn — taakeis). Linkbaar vanuit het resultaatscherm, het dashboard (`getVitalityExplainer`-blok), de homepage en `/methodologie` (kruislink, ≥2 interne links per SEO-standaard).

**Wat WEL tonen (het "waarom"):**
- De 5 leefstijl-facetten (slaap, stress, voeding, beweging, herstel) en dat vitaliteit hun **samenhangend gemiddelde** is — "geen enkele pijler is de hele batterij".
- De **readout-logica** uit [`domain-role.ts`](../../src/lib/domain-role.ts): "energie en herstel zijn *uitkomsten* die je afleest — energie zie je apart, omdat je er niet rechtstreeks aan draait maar via slaap/voeding/beweging." Met `READOUT_DRIVERS` als verhaal: *"voel je weinig energie? Kijk naar je slaap, voeding en beweging."*
- De **4 banden** (Sterk/Voldoende/Aandacht/Prioriteit) en waaróm we geen rapportcijfer of leeftijds-percentiel geven (compliance, [`score-display.ts`](../../src/lib/score-display.ts) r. 1–4) — dit is juist een vertrouwens-argument ("we doen niet aan schijnprecisie").

**Wat NIET tonen (de moat, [`BRAND_POSITIONING.md`](../core/BRAND_POSITIONING.md) §4):** de exacte gewichten, domein-maxima, drempelwaarden, trigger-condities of de mapping vraag→score. Dus **niet** "elke pijler weegt 1.0 en we middelen", **wél** "elke leefstijlpijler telt even zwaar mee". Geen `stress_score < 40 → profiel X`.

**De inconsistentie eerlijk oplossen (model vs. communicatie).** De index bevat herstel (een readout) maar niet energie (óók readout). Twee uitwegen:

| Optie | Wat het inhoudt | Voor / tegen |
|---|---|---|
| **A — Model bijtrekken (aanbevolen op termijn)** | Maak de index puur de **4 interventies** (slaap/stress/voeding/beweging); toon energie **én** herstel als afgelezen uitkomsten ernaast. | + Schoon, exact uitlegbaar ("stuurbare index = de 4 knoppen"). − Wijzigt `computeVitaliteit`/`FACET_KEYS` → **engine-impact, buiten scope van dit doc** (READ-ONLY). Vereist eigen prompt + hermeting-impact-analyse (delta-rapporten verschuiven). |
| **B — Communicatie bijtrekken (MVP-veilig)** | Laat de code ongemoeid; leg uit als *"de index volgt je vier leefstijlknoppen plus hoe je herstelt — energie laten we los, omdat die het sterkst van de rest afhangt."* | + Geen code-risico, nu te doen. − Iets minder schoon ("waarom herstel wel, energie niet?"); herstel is dunste pijler (1 eigen vraag, zie [`PLAN_SOFTPILLAR_SELFEVAL_LOOP.md`](PLAN_SOFTPILLAR_SELFEVAL_LOOP.md)). |

**Aanbeveling:** start met **B** (publieke pagina nu, geen engine-risico), en agendeer **A** als aparte modelbeslissing met hermeting-impact-analyse. Forceer de keuze vóór de copy definitief wordt (§9, open vraag 1). **Hergebruik** bestaande copy-bouwstenen (`getVitalityScoreMeaning`, `READOUT_DRIVERS`, `FoundationPyramid` uit [`RevealMethodologyPanel.tsx`](../../src/components/intake/RevealMethodologyPanel.tsx)) — geen derde, afwijkende uitleg-stem.

### Pijler 2 — punten + agenda in het dashboard

- **Punten** verschijnen als een **rustige** laag bovenop bestaande secties — een saldo-chip op de `vandaag`-tab en een "+X" micro-feedback bij een afgevinkte stap/check-in. **Niet** een luidruchtig gamification-overlay; de doelgroep (man 40+, "geen gezondheidsgekkie") wil herkenning, geen confetti. Toon = bevestiging dat consistentie loont.
- **Agenda** past het beste als **verrijking van de bestaande `voortgang`-tab** (`TAB_SECTIONS.voortgang`, [`dashboard/index.ts`](../../src/data/dashboard/index.ts) r. 308–312): een week/maand-strip die check-ins, plan-stappen en logs op de week-bucket-as (`getCheckinWeekBucket`) toont. Dit sluit aan bij de tab-subtitel *"Je levenslijn — geen losse momentopname."* Een **aparte tab** (de dormante `identity`-slot of een nieuwe `agenda`-tab) is alleen gerechtvaardigd zodra `agenda_entries` (vooruit plannen) er is — voor de afgeleide MVP is een sectie binnen `voortgang` genoeg. **Onderbouwing:** minder navigatie-oppervlak, hergebruik van het bestaande tab-/sectie-framework, en de agenda *is* voortgang.
- Relatie tot plan/account: punten/agenda zijn een **leesbril** op `plan_progress` + `intake_domain_checkin`, niet een nieuw gedragspad — geen tweede CTA naast de stepped-care-trap (consistent met [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) "geen tweede primaire CTA").

### Pijler 3 — delen

- MVP = een **deel-knop** bij een mijlpaal (streak/punten/fase-voltooid) die een vooraf-samengestelde, **gezondheidsdata-vrije** kaart genereert ("4 weken op rij volgehouden"). Zichtbaarheid default `private`; expliciete keuze naar `cohort` (anonieme groep) of `public`.
- **Geen** sociale graaf, volgers of open feed in MVP — dat is een apart, later traject met eigen moderatie-zwaarte (§7).

### Pijler 4 — rewards

- Spoor A: een **"ontgrendeld"-strook** in het plan ("Je hebt verdiepingsstap X vrijgespeeld") — punten openen leefstijl-verdieping, nooit een koop-CTA.
- Spoor B: **niet in UI** tot de juridische/merk-poort open is (§6).

---

## 6. Compliance / affiliate / juridisch (pijler 4) — go/no-go per variant

### Spoor A — gratis: punten ontgrendelen leefstijl-features

| Dimensie | Analyse |
|---|---|
| **Technisch** | Volledig in eigen hand: `reward_redemptions` + `points_ledger` (§3.3). Geen externe partij. Past op het bestaande `tier`/`is_paid`-model ([`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md)). |
| **Compliance/merk** | **Versterkt** "leefstijl eerst": de beloning is méér leefstijl-verdieping, niet een product. Geen EFSA-/claim-raakvlak. |
| **Juridisch** | Minimaal: een gratis feature-unlock is geen geldwaardig tegoed, geen kansspel, geen aanbod. Valt onder bestaande `account_storage`-consent (zelfde doel: persoonlijk voortgangsoverzicht). |

**→ GO.** Dit is de veilige eerste laag en de aanbevolen kern van het puntensysteem.

### Spoor B — betaald: korting met punten op supplementen/voeding

**(a) Technisch — werkt een korting überhaupt met Daisycon en Arctic Blue?**

We **beheren de merchant-prijzen niet** ([`AFFILIATE_SYSTEM.md`](../core/AFFILIATE_SYSTEM.md)). Een "korting" kan dus alleen langs drie wegen, elk met een blokkade:

| Mechanisme | Hoe het zou werken | Blokkade |
|---|---|---|
| **Eigen kortingscode op merchant-checkout** | Wij geven een code; merchant verrekent. | Wij hebben **geen** merchant-relatie bij Vitaminstore/VitalNutrition (dat loopt via Daisycon-netwerk) — we kunnen daar geen codes uitgeven. |
| **Cashback uit eigen affiliate-commissie** | Wij rebaten een deel van onze Daisycon/Awin-commissie aan de gebruiker, getriggerd door punten. | **Cashback/incentivering is bij de meeste affiliate-programma's contractueel verboden** zonder expliciete programma-toestemming; het kan tot uitsluiting uit het netwerk leiden. Vereist per-merchant schriftelijke goedkeuring. Bovendien attributie-fragiel (token in `nt`-param, [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md)). |
| **Direct merchant-partnerschap (Arctic Blue)** | Arctic Blue loopt al *direct* (Awin, `sld=dennisvanwestbroek`) — hier zou een echte coupon onderhandelbaar zijn. | Vereist een commerciële deal + couponadministratie; bindt ons aan één merchant en creëert precies de "exclusieve deal" die §7 verbiedt als hoofdboodschap. |

**(b) Compliance/merk — ondermijnt het de positionering?**

**Ja, structureel.** [`BRAND_POSITIONING.md`](../core/BRAND_POSITIONING.md) §7 verbiedt expliciet *"kortingscodes of exclusieve deals als hoofdboodschap (ondermijnt Consumentenbond-positionering)"*. Een punten-voor-supplementkorting:
- creëert een **financiële prikkel om te kopen**, wat botst met "onze keuze volgt kwaliteit, niet commissie" (§3 differentiatiematrix, §9 concurrentie-respons);
- maakt het advies **verdacht**: zodra punten korting geven op het aanbevolen supplement, is "objectief" niet meer geloofwaardig (de moat is juist dat de affiliate-link de redactionele keuze *volgt*, niet stuurt);
- doorbreekt "leefstijl eerst" door supplement-aankoop te belonen i.p.v. gedrag.

**(c) Juridisch.**

| Aspect | Risico |
|---|---|
| **AVG (art. 9)** | Een spaartegoed dat korting geeft op het *aanbevolen* supplement koppelt **koopgedrag aan een gezondheidsprofiel** → nieuwe, gevoelige verwerking + nieuw consent-doel; verhoogt DPIA-risico R4/R7 (profilering met commercieel gevolg). |
| **Loyaliteits-/spaarregels & prijstransparantie (Omnibus/Prijzenwet)** | Een "korting" t.o.v. een referentieprijs die wij niet beheren is moeilijk waarheidsgetrouw te tonen; risico op misleidende-korting-claims. |
| **Kansspel** | Punten met willekeurige/variabele beloning kan richting kansspelwetgeving schuiven; vermijd loterij-mechaniek. |
| **Fiscaal** | Een geldwaardig spaartegoed is een **verplichting op de balans** en kan btw-/fiscale gevolgen hebben (voucher-regels). Vereist boekhoudkundige inrichting. |

**Go/no-go per variant:**

- **Spoor B via Daisycon-cashback → NO-GO.** Contractueel risico (netwerk-uitsluiting) + merk-ondermijning + juridische last. Niet bouwen.
- **Spoor B als hoofdboodschap/UI-prikkel → NO-GO.** Direct in strijd met §7.
- **Spoor B via direct Arctic Blue-coupon → CONDITIONEEL / LATER.** Technisch denkbaar (eigen merchant-relatie), maar alleen na: (1) expliciet juridisch advies (prijstransparantie + fiscaal + AVG-consent), (2) een merk-besluit dat dit de Consumentenbond-positionering niet beschadigt, en (3) strikte scheiding van het *advies* (punten mogen nooit de aanbevolen keuze beïnvloeden). **Niet in de eerste 2–3 fasen.**

**Aanbeveling pijler 4:** bouw **alleen Spoor A**. Houd Spoor B uit het product tot er een aparte, juridisch begeleide business-case ligt; tot dan blijft "punten = meer leefstijl, geen korting" de schone lijn.

---

## 7. Privacy / DPIA (pijler 3 — delen)

Koppeling aan bestaande [`DPIA.md`](../core/DPIA.md)-risico's en consent-doelen:

- **Art. 9-grens (R4).** `domain_scores`, `vitality`, `profile_label`, `urgency_level` zijn afgeleide gezondheidsgegevens. **Delen daarvan = publicatie van bijzondere persoonsgegevens.** Daarom: de deel-payload bevat **uitsluitend** niet-gezondheids-artefacten (punten-aantal, streak-lengte, "fase voltooid"), afgedwongen via een veld-allowlist in de write-route (§3.4), niet alleen via copy. Een vitaliteitsgetal of bandlabel mag nooit in een share.
- **Nieuw verwerkingsdoel → nieuwe granulaire consent.** Conform DPIA §2 (granulair per doel) en het patroon in [`consent-texts.ts`](../../src/lib/consent-texts.ts): een **`community_sharing`** `consent_type` met `consent_version`, default uit, intrekbaar, met de vaste formule *"geen medisch advies en geen diagnose; ik kan dit altijd intrekken."* Geen impliciete consent uit account_storage.
- **Zichtbaarheidsniveaus by-design:** default `private`; `cohort` toont alleen geaggregeerd/anoniem (sluit aan op het k-anon-pad uit [`PLAN_SOFTPILLAR_SELFEVAL_LOOP.md`](PLAN_SOFTPILLAR_SELFEVAL_LOOP.md) §Laag 5 en [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) §D2 — k ≥ drempel, volume-gated); `public` alleen na expliciete keuze + de health-data-vrije payload.
- **Re-identificatie (R6).** Een publieke share met genoeg artefacten + timing kan herleidbaar worden. Mitigatie: geen vrije tekst in MVP-shares (alleen voorgevormde kaarten), geen exacte timestamps, geen leeftijd/locatie.
- **Moderatie/abuse.** `status`-veld (`active`/`hidden`/`removed`); MVP = admin-`hidden` + geen user-generated vrije tekst (laagste moderatielast). Een `community_reports`-tabel + meld-flow is een latere uitbreiding, vóór open feeds.
- **Intrekken = verwijderen.** Bij intrekken van `community_sharing` of account-revoke: shares op `removed`/cascade (§3.6). Werk de DPIA-tabel §1.3 bij met de share-categorie en §1.5 met een bewaartermijn.

**Scope MVP vs. volledige community:** MVP = *delen van eigen mijlpalen* (één-richting, geen interactie, geen feed). Volledige community (feeds, reacties, volgers, groepen) = apart traject met zwaardere moderatie-, abuse- en DPIA-implicaties; **niet** in dit MVP.

---

## 8. Gefaseerde roadmap

> Volgorde = afhankelijkheden, geen kalenderdata. Niets hiervan is geïmplementeerd.

| Fase | Inhoud | Afhankelijk van | Compliance-anker |
|---|---|---|---|
| **P0 — Modelbeslissing** | Beslis: index = 4 interventies (model A) of communicatie-only (B)? (§5, §9-vraag 1) | — | Bepaalt de uitleg-copy; raakt hermeting-deltas |
| **P1 — Publieke `/vitaliteit`-pagina (pijler 1)** | Uitleg "waarom" + readout-logica + banden; hergebruik bestaande copy; ≥2 interne links, canonical, metadata. **Geen datamodel, geen consent.** | P0 | Moat: geen gewichten/triggers; KOAG: geen percentiel |
| **P2 — `points_ledger` + server-side toekenning (pijler 2)** | Tabel + idempotente toekenning op bestaande events (`measurement.checkin_completed`, `plan.step_state_changed`, `plan.phase_completed`, `plan.checkin_completed`, `remeasure.completed`); saldo-chip in dashboard. | account-systeem (bestaat) | Account-scoped; AVG via account-lifecycle |
| **P3 — Afgeleide agenda (pijler 2)** | `buildAgendaTimeline()` + week/maand-strip in `voortgang`-tab; geen nieuwe tabel. | P2 (timestamps) | Leesbril, geen nieuwe verwerking |
| **P4 — Rewards Spoor A (pijler 4a)** | `reward_redemptions` + rewards-datafile; punten ontgrendelen leefstijl-verdieping. | P2 | GO; valt onder account_storage |
| **P5 — Community MVP (pijler 3)** | `community_shares` + `community_sharing`-consent + health-data-vrije deel-kaarten; default private. | P2, nieuwe consent | Art. 9-allowlist; k-anon voor cohort |
| **P6 — `agenda_entries` (vooruit plannen)** | Optionele tabel zodra gebruikers acties inplannen i.p.v. terugkijken. | P3 | service_role-only |
| **— Spoor B (pijler 4b)** | **Niet ingepland.** Alleen na juridisch advies + merk-besluit (§6). | extern advies | NO-GO tot poort open |

**Concrete eerste stap:** **P0 → P1.** Neem de modelbeslissing (§9-vraag 1), bouw daarna de publieke `/vitaliteit`-pagina. Het is read-only qua data, levert direct merkwaarde (transparantie = onderscheidend, [`BRAND_POSITIONING.md`](../core/BRAND_POSITIONING.md) §5), en de uitlegtaal die hier ontstaat wordt hergebruikt in punten/rewards-copy.

---

## 9. Top-risico's + open vragen voor Dennis

**Top-risico's**

1. **Index-inconsistentie (energie uit, herstel in).** De readout-uitleg klopt niet 1-op-1 met de code. Publiek uitleggen vergroot het risico dat de tegenstrijdigheid opvalt. → Los op via P0 vóór P1.
2. **Gamification botst met doelgroep-toon.** Man 40+, "geen gezondheidsgekkie": te luide punten/badges kan afstoten i.p.v. binden. → Rustige, bevestigende UX; punten als consistentie-signaal, geen confetti.
3. **Spoor B trekt de moat onderuit.** Elke koop-gerelateerde beloning ondermijnt "objectief, kwaliteit boven commissie". → Spoor B buiten product houden (§6).
4. **Community = art. 9-lek.** Eén verkeerd veld in een share publiceert gezondheidsdata. → Allowlist-guard in de write-route, niet alleen copy.
5. **Account-context client-events passen niet in de huidige intake-events-route.** → Besluit (a) sessionOptional vs (b) eigen `/api/account/events` (§4.2).
6. **Doc-drift.** COMPLIANCE.md zegt nog "geen account-systeem". → Bijwerken bij implementatie.

**Open vragen**

1. **Modelbeslissing (blokkeert P1):** trekken we de index recht naar **4 interventies** (model A, engine-wijziging + hermeting-impact, aparte prompt), of leggen we het **communicatief** uit met herstel erin (model B, nu)? *Aanbeveling: B nu, A op de roadmap.*
2. **Punten alleen voor ingelogde accounts** — akkoord dat anonieme sessies niets sparen tot ze geclaimd worden (versterkt de login-moat)? *Aanbeveling: ja.*
3. **Agenda als sectie in `voortgang`** (MVP) of een **eigen tab** (vult de dormante `identity`-slot)? *Aanbeveling: sectie in `voortgang` tot `agenda_entries` er is.*
4. **Punten-economie:** welke waarden per actie (check-in / stap / fase / streak / hermeting), en is er een vervaltermijn op punten (fiscaal/AVG relevanter zodra Spoor B ooit speelt)? *Te bepalen in de rewards-datafile.*
5. **Community-zichtbaarheid:** starten we met alleen `private`+`cohort` (anoniem) en stellen we `public` uit tot moderatie staat? *Aanbeveling: ja.*
6. **Spoor B ooit?** Wil je het Arctic Blue-direct-couponpad als business-case laten onderzoeken, of definitief van tafel? *Aanbeveling: parkeren tot na P4.*

---

*Opgesteld: 24 juni 2026. Planning-/onderzoeksdocument — geen code, geen schema-migraties. Belonen rond leefstijl (Spoor A) is on-brand; belonen rond aankoop (Spoor B) is dat structureel niet — dat onderscheid draagt het hele plan.*
