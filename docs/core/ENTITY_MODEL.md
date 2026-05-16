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
| first_name | text, nullable | Snapshot voornaam bij scheduling |
| template_key | text | `day0_welcome`, `day3_quickwins`, etc. |
| scheduled_at | timestamptz | — |
| sent | boolean, default false | — |
| sent_at | timestamptz, nullable | — |

Aparte tabel van intake_reminders. `scheduleNurtureSequence` is geïmporteerd in `src/app/api/intake/session/route.ts`.

### intake_feedback

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid, pk | — |
| created_at | timestamptz | — |
| session_id | uuid, nullable | FK naar intake_sessions |
| rating | text | `positive` of `negative` |
| comment | text, nullable | — |

### affiliate_clicks

Bestaande tabel voor click tracking. **Niet aanraken / wijzigen zonder overleg.** Gebruikt door AffiliateLink component.

---

## RLS policies

- RLS aan op alle tabellen
- Anon: inserts op intake_sessions, intake_reminders, nurture_emails, intake_feedback
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

### Berekening

| Score | Formule | Max ruwe score |
|---|---|---|
| sleep_score | (sleep_quality + sleep_consistency) / 7 × 100 | 7 |
| energy_score | (energy_pattern + energy_dependency) / 8 × 100 | 8 |
| stress_score | (stress_frequency + stress_recovery) / 8 × 100 | 8 |
| nutrition_score | (nutrition_quality + omega3_intake) / 7 × 100 | 7 |
| movement_score | (movement_frequency + daily_activity) / 7 × 100 | 7 |
| recovery_score | (physical_recovery + mental_recovery) / 6 × 100 | 6 |

**Let op:** cookie key is `psf_intake_sid` en domain score keys zijn Engels (niet Nederlands).

---

## Answers structuur

Opgeslagen in `intake_sessions.answers` (jsonb):

```json
{
  "SLP_QUAL": 3,
  "SLP_CONS": 2,
  "NRG_PATN": 2,
  "NRG_DEP": 1,
  "STR_FREQ": 3,
  "STR_RCV": 2,
  "NUT_O3": 1,
  "NUT_PROT": 3,
  "MOV_STR": 3,
  "MOV_CARD": 2,
  "RCV_PHYS": 1
}
```

### Variabelenlijst

| Data-tag | Variabele | Type | Bereik | Categorie |
|---|---|---|---|---|
| SLP_QUAL | sleep_quality | int | 1-4 | Slaap |
| SLP_CONS | sleep_consistency | int | 1-3 | Slaap |
| NRG_PATN | energy_pattern | int | 1-4 | Energie |
| NRG_DEP | energy_dependency | int | 1-4 | Energie |
| STR_FREQ | stress_frequency | int | 1-4 | Stress |
| STR_RCV | stress_recovery | int | 1-4 | Stress (+ recovery_score) |
| NUT_O3 | omega3_intake | int | 1-3 | Voeding |
| NUT_PROT | protein_intake | int | 1-4 | Voeding |
| MOV_STR | strength_training | int | 1-4 | Beweging |
| MOV_CARD | cardio_frequency | int | 1-4 | Beweging |
| RCV_PHYS | physical_recovery | int | 1-3 | Herstel |

---

*Laatst bijgewerkt: mei 2026*
