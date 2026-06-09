# ENTITY MODEL — PerfectSupplement

> **Layer 1 — Core.** Source of truth voor database schema en data-structuren.

---

## Supabase tabellen

### intake_sessions

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| created_at | timestamptz | — |
| symptom_profile | text[] | Uit fase 1 (symptoomselectie) |
| answers | jsonb | Ruwe antwoorden per data-tag (zie onder) |
| domain_scores | jsonb | 6 domeinen, score 0-100 (zie onder) |
| urgency_level | text | `critical`, `moderate`, `mild`, `healthy` |
| profile_label | text | `Onrustige Slaper`, `Stressdrager`, `Lage Batterij`, `In Balans` — engine-output via `getProfileLabel()`; **Overtrainer** is een afgeleid antwoordpatroon (`matchesOvertrainerAnswers`), geen persisted label |
| age_range | text | `40-44`, `45-49`, `50-54`, `55+` |
| marketing_email | text, nullable | — |
| first_name | text, nullable | Optionele voornaam voor personalisatie (nurture-mails) |
| rules_version | text, nullable | Advies-engine semver (`RULES_VERSION` in `src/lib/intake-engine.ts`); join-key voor feedback/delta-segmentatie. Geen DB-default — app schrijft expliciet bij insert. Backfill: `'pre-1.0'`. Bron: `supabase/migrations/20260609120000_intake_sessions_rules_version.sql` |
| organization_id | uuid, NOT NULL | Default-tenant via `getDefaultOrganizationId()` (`src/lib/organization.ts`); elke intake-sessie, event en affiliate-click krijgt dit veld. Single-tenant vandaag (`00000000-0000-0000-0000-000000000001`); RLS org-isolatie voorbereid op B2B/JWT. Bron: `supabase/migrations/20260412200000_organization_id.sql` |
| session_kind | text, NOT NULL | `initial` (dag-0) of `remeasure` (herhaalmeting). Default `initial`. Bron: `supabase/migrations/20260610100000_intake_baseline_remeasure.sql` |
| baseline_session_id | uuid, nullable | FK naar dag-0-sessie; alleen gezet bij `session_kind = 'remeasure'` |

### intake_baseline_snapshots

Immutable dag-0 freeze voor delta-analyse. Overleeft `domain_scores`-nulling op de live rij bij consent-revoke; wordt wél verwijderd in `cleanup_intake_session_linked_data()`. Bron: `supabase/migrations/20260610100000_intake_baseline_remeasure.sql`.

| Kolom | Type | Beschrijving |
|---|---|---|
| session_id | uuid, pk | FK naar baseline `intake_sessions` |
| organization_id | uuid, NOT NULL | tenant |
| frozen_at | timestamptz | moment van freeze |
| domain_scores | jsonb, NOT NULL | 6 domeinscores op dag 0 |
| profile_label | text, NOT NULL | |
| urgency_level | text, NOT NULL | |
| rules_version | text, NOT NULL | engine semver op moment van freeze |
| primary_theme | text, nullable | `getPrimaryTheme()` op dag 0 |
| symptom_profile | text[] | symptoomselectie snapshot |
| age_range | text, NOT NULL | |

### intake_reminders

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| created_at | timestamptz | — |
| email | text | — |
| reminder_date | timestamptz | 30 dagen na intake |
| sent | boolean, default false | — |
| reminder_type | text | `welcome`/`day3`/`day7`/`day14`/`day21`/`day30`. Canonieke default `30d` (legacy `day30` op productie — code mapt beide). |
| session_id | uuid, nullable | FK naar intake_sessions, `on delete cascade` |
| organization_id | uuid | FK naar organizations (default-tenant) |

### nurture_emails

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| created_at | timestamptz | — |
| email | text | — |
| session_id | uuid, nullable | FK naar intake_sessions (alleen intake-flow) |
| source | text | `intake` of `guide_slaap`, `guide_stress`, … |
| thema | text, nullable | Thema-slug bij gids-opt-in (`slaap`, `stress`, …) |
| template_key | text, nullable | Audittrail, bv. `guide_slaap_day0` |
| sequence_day | integer | `0`, `3`, `7`, `14`, `21`, `30` |
| scheduled_at | timestamptz | — |
| status | text | `pending`, `sent`, `failed`, `cancelled` |
| sent_at | timestamptz, nullable | — |
| resend_id | text, nullable | — |
| error_message | text, nullable | — |
| profile_label | text, nullable | Snapshot (intake) |
| primary_domain | text, nullable | Snapshot (intake) |
| domain_scores | jsonb, nullable | Snapshot (intake) |
| urgency_level | text, nullable | Snapshot (intake) |
| first_name | text, nullable | Snapshot |

Intake-nurture: `scheduleNurtureSequence` in `src/lib/nurture.ts`.  
Gids-nurture: `scheduleGuideNurtureSequence` in `src/lib/guide-nurture.ts`.

### guide_opt_ins

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| created_at | timestamptz | — |
| email | text | — |
| thema | text | `slaap`, `stress`, `energie`, `herstel`, `testosteron` |
| consent_type | text | `guide_marketing_email` |
| consent_version | text | — |
| consent_text | text | Exacte checkbox-tekst |
| granted | boolean | — |
| granted_at | timestamptz | — |
| ip_hash | text, nullable | — |
| ua_hash | text, nullable | — |

Juridische administratie voor gids-opt-in (geen FK naar intake_sessions).

### thema_nurture (deprecated)

Legacy tabel voor de oude `/thema/*` flow, **vervangen door nurture_emails** (`source`/`thema`/`template_key`). Geen nieuwe inserts vanuit de app; pending rijen worden geannuleerd in `20260519120000_guide_opt_in.sql`. Niet droppen — historische rijen bewaard voor AVG/audit. Alleen in de `db/`-migratieset (`db/004`), niet in `supabase/`.

### intake_feedback

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| created_at | timestamptz | — |
| session_id | uuid, nullable | FK naar intake_sessions |
| rating | text | `positive` of `negative` |
| comment | text, nullable | — |

### plan_progress

Pseudonieme voortgang per intake-sessie en leefstijldomein (leefstijlplan stap 3a). Bron-migratie: `supabase/migrations/20260602100000_plan_progress.sql`.

| Kolom | Type | Beschrijving |
|---|---|---|
| session_id | uuid, pk (deel) | FK naar intake_sessions, `on delete cascade` |
| organization_id | uuid | FK naar organizations (default-tenant) |
| domain | text, pk (deel) | Leefstijldomein (`sleep`, `stress`, `nutrition`, `movement`, …) |
| template_version | text | Versie van het plantemplate |
| current_phase_id | text | Huidige fase in het stepped-care-plan |
| steps | jsonb | Voortgang per stap (default `{}`) |
| started_at | timestamptz | — |
| updated_at | timestamptz | — |
| completed_at | timestamptz, nullable | — |

Unique constraint: `(session_id, domain)`. Verwijderd bij AVG-revoke/delete via `cleanup_intake_session_linked_data()`.

### affiliate_clicks

Product-klik tabel. **Niet aanraken / wijzigen zonder overleg.**

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| product_id | text | — |
| product_naam | text | — |
| categorie | text, nullable | — |
| pagina | text, nullable | — |
| timestamp | timestamptz | default now() |
| organization_id | uuid | FK naar organizations (default-tenant) |

---

## Multi-tenancy & toestemming

### organizations

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| name | text | — |
| slug | text, unique | `default` = B2C PerfectSupplement |
| created_at | timestamptz | — |
| settings | jsonb | default `{}` |

B2B white-label fundering. Default-tenant `00000000-0000-0000-0000-000000000001`; alle tenant-tabellen hebben `organization_id` met die default.

### consent_records

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| session_id | uuid, nullable | FK naar intake_sessions, `on delete set null` |
| consent_type | text | — |
| consent_version | text | — |
| granted | boolean | — |
| consent_text | text | Exacte tekst |
| granted_at | timestamptz | — |
| withdrawn_at | timestamptz, nullable | — |
| ip_hash / ua_hash | text, nullable | — |
| organization_id | uuid | FK naar organizations |

AVG Art. 9 audittrail. Helper-functie `has_active_consent(session_id, consent_type)`.

### recovery_tokens

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| session_id | uuid | FK naar intake_sessions, `on delete cascade` |
| token_hash | text, unique | — |
| expires_at | timestamptz | TTL |
| used_at | timestamptz, nullable | one-time-use |
| created_at | timestamptz | — |

Eenmalige recovery-links naar intake-resultaten.

### cron_runs

Bron-migratie: `db/migrations/006_cron_runs.sql` — **niet** in `supabase/migrations/`. Handmatig toepassen op Supabase vóór retention-cron. Verse `supabase db reset` maakt deze tabel **niet** aan.

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| cron_name | text | — |
| started_at | timestamptz | — |
| completed_at | timestamptz, nullable | — |
| status | text | `running`/`success`/`error` |
| result | jsonb, nullable | — |
| error_message | text, nullable | — |

Dead-man's switch / audit trail voor geplande jobs.

---

## Content-laag (HERKENNING → FOCUS → PLAN)

Alle tabellen hieronder hebben `organization_id` (default-tenant), `created_at` en `updated_at`.

### themes

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| slug | text | uniek per org (`stress`, `sleep`, `nutrition`, `movement`, `connection`) |
| label / sublabel | text | UI-labels |
| hefboom_text | text, nullable | FOCUS-scherm uitleg |
| disclaimer_key | text, nullable | verwijst naar disclaimers.key |
| position | int | volgorde |
| is_measured | boolean | of het thema gescoord wordt |

### recognition_lines

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| theme_id | uuid | FK naar themes, `on delete cascade` |
| body_text | text | HERKENNING-regel |
| match_question_id | text | intake-vraag-id (bv. `SLP_ONSET`) |
| match_operator | text | `<=`/`>=`/`=`/`in` |
| match_value | jsonb | drempel/waarde |
| priority | int | lager = eerder |
| is_placeholder | boolean | tot definitieve copy |

### interventions

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| theme_id | uuid | FK naar themes, `on delete cascade` |
| slug / name | text | uniek (org, theme, slug) |
| kind | text | `free_action`/`measurement`/`supplement` |
| description | text | — |
| score_moeite / score_mechanisme / score_onderbouwing / score_veiligheid | int 1-5 | composite-scoring |
| affiliate_url / comparison_path | text, nullable | — |
| goal_phrase | text, nullable | — |
| tier | int 1-5 | 1=gratis quick win, 2=meten, 3=supplement/affiliate, 4-5=betaald |
| is_paid | boolean | triggert disclosure-regel |
| paid_disclosure_key | text, nullable | verwijst naar disclaimers.key |
| external_provider_label / external_provider_url | text, nullable | bij betaalde externe diensten |

PLAN-scherm stepped-care trap. Volgorde wordt door `tier` bepaald, niet door de gebruiker.

### intervention_triggers

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| intervention_id | uuid | FK naar interventions, `on delete cascade` |
| group_id | int | OR tussen groepen, AND binnen één groep |
| kind | text | `domain_below`/`domain_above`/`deficiency_signal`/`profile_label`/`answer` |
| field | text | domein/signaal/vraag-id |
| operator | text, nullable | `<=`/`>=`/`=`/`in` |
| value | jsonb | drempel/waarde |

Bepaalt of een interventie verschijnt (per-symptoom personalisatie, bv. `answer SLP_ONSET <= 2`).

### disclaimers

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| key | text | uniek per org |
| body_text | text | — |
| scope | text | `screen_focus`/`theme`/`profile`/`mail` |

### evidence_sources

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| vancouver | text | citatie |
| url / pmid / doi | text, nullable | — |
| evidence_type | text | `meta_analysis`/`rct`/`observational`/`efsa_regulation`/`guideline`/`textbook`/`narrative_review` |

### evidence_claims

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| claim_text | text | — |
| domain_label | text | — |
| intervention_id | uuid, nullable | FK naar interventions, `on delete set null` |
| source_id | uuid | FK naar evidence_sources |
| is_efsa_authorized | boolean | EFSA-goedgekeurde claim; **afgedwongen** in plan-gating sinds `15009fc` (`src/lib/content/plan-content.ts`: `.eq('is_efsa_authorized', true)`) |
| status | text | `draft`/`published`/`retired` |
| search_vector | tsvector | FTS (generated) |
| embedding | vector(1536), nullable | pgvector RAG |

Onderbouwing per interventie. PLAN-trap tier 1-3 vereist **beide**: `status = 'published'` **en** `is_efsa_authorized = true`. Zoeken via `search_evidence_claims()` (FTS + semantisch).

### domain_events

Bron-migratie: `supabase/migrations/20260529200000_domain_events.sql`

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| organization_id | uuid, NOT NULL | FK naar organizations (default-tenant) |
| occurred_at | timestamptz | — |
| event_type | text | — |
| session_id | uuid, nullable | FK naar intake_sessions, `on delete set null` |
| email | text, nullable | — |
| payload | jsonb | default `{}` |
| delivered_to | text[] | default `{}` |

Append-only event log voor nurture, n8n en analytics.

---

## RLS policies

- RLS staat aan op alle tabellen als verdedigingslaag, maar **alle data-toegang loopt via de service_role-client** (`src/lib/supabase-admin.ts`), die RLS bypasst. Er is **geen anon-client** in gebruik (de oude `src/lib/supabase.ts` is verwijderd).
- **Anon-policies** bestaan alleen op `guide_opt_ins` en `thema_nurture` (insert) — historisch; de app gebruikt ze niet meer.
- **Authenticated org-isolatie** (tenant-scope via `auth.jwt() -> app_metadata -> organization_id`) op: intake_sessions, intake_feedback, intake_reminders, affiliate_clicks, organizations, themes, recognition_lines, interventions, intervention_triggers, disclaimers, evidence_sources, evidence_claims, domain_events. Voorbereid op toekomstige JWT/B2B-toegang; anon heeft geen toegang.
- **Alleen service_role** (geen anon/authenticated policies): consent_records, recovery_tokens, cron_runs, plan_progress, intake_baseline_snapshots, en de productdatabase (products/ingredienten/evaluaties/doelgroep_match/conversies).
- Admin dashboard gebruikt de service_role key.

---

## Domain scores structuur

Opgeslagen in `intake_sessions.domain_scores` (jsonb):

```json
{
  "sleep_score": 57,
  "energy_score": 38,
  "stress_score": 50,
  "nutrition_score": 43,
  "movement_score": 71,
  "recovery_score": 33
}
```

**Engine vs. pijler/thema-routing:** De scoring-engine berekent **6 domeinscores** (`energy_score` en `recovery_score` incl.). Intake-routing (primary theme, gids-opt-in, drawer) gebruikt **4 gemeten pijlers**: `sleep`, `stress`, `nutrition`, `movement` (`MeasuredPillarId`). `energy` en `recovery` hebben geen eigen `PillarId`, primary theme of `PILLAR_TO_GUIDE_THEMA`-key; ze sturen wel advies en secundaire links (bv. energiegids bij lage `energy_score`).

**Profielpagina's vs. labels:** Live profielpagina's: `onrustige-slaper`, `stressdrager`, `lage-batterij`, `overtrainer`. `In Balans` heeft een engine-label maar geen profielpagina; `Overtrainer` heeft een profielpagina maar geen engine-label.

---

*Laatst bijgewerkt: juni 2026*
