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
| profile_label | text | `Onrustige Slaper`, `Stressdrager`, `Lage Batterij`, `Overtrainer`, `In Balans` |
| age_range | text | `40-44`, `45-49`, `50-54`, `55+` |
| marketing_email | text, nullable | — |
| first_name | text, nullable | Optionele voornaam voor personalisatie (nurture-mails) |
| organization_id | uuid, nullable | Voorbereid voor B2B white-label, niet in gebruik |

### intake_reminders

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| created_at | timestamptz | — |
| email | text | — |
| reminder_date | timestamptz | 30 dagen na intake |
| sent | boolean, default false | — |

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

Legacy tabel voor oude `/thema/*` flow. Geen nieuwe inserts. Pending rijen geannuleerd bij migratie.

### intake_feedback

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| created_at | timestamptz | — |
| session_id | uuid, nullable | FK naar intake_sessions |
| rating | text | `positive` of `negative` |
| comment | text, nullable | — |

### affiliate_clicks

Bestaande tabel voor click tracking. **Niet aanraken / wijzigen zonder overleg.**

---

## RLS policies

- RLS aan op alle tabellen
- Anon: inserts op intake_sessions, intake_reminders, nurture_emails, intake_feedback, guide_opt_ins
- Anon: reads op intake_sessions, intake_feedback
- Admin dashboard: service_role key (bypasses RLS)

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

---

*Laatst bijgewerkt: mei 2026*
