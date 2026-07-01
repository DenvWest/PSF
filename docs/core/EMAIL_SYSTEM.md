# EMAIL SYSTEM — PerfectSupplement

> **Layer 2 — Systems.** Nurture sequence, Resend, reminders, PDF-gidsen.

---

## Twee nurture-stromen in `nurture_emails`

| Stroom | `source` | Trigger | Templates |
|---|---|---|---|
| Intake | `intake` | Marketing consent bij `/intake` | `src/lib/email-templates/nurture/` |
| Gids-opt-in | `guide_slaap`, `guide_stress`, … | `/gids/[thema]` + checkbox | `src/lib/email-templates/guide-nurture/` |

Beide gebruiken dezelfde sequentiedagen: **0, 3, 7, 14, 21, 30**. Cron: `src/lib/nurture-cron.ts` (route `/api/cron/nurture`).

---

## Intake nurture (6 emails, dag 0-30)

| Dag | Inhoud | Personalisatie |
|---|---|---|
| 0 | Welkom + profiel intro | Profielnaam, profiel-tip, conditionele PDF-link |
| 3 | Quick wins | Afgestemd op zwakste domein |
| 7 | Verdieping | Link naar profiel-relevante pillar page |
| 14 | Supplement intro | Profiel-relevante vergelijkingspagina |
| 21 | Motivatie | Herkenningsmoment herhalen |
| 30 | Herhaalmeting CTA | "Meet je voortgang" → /intake |

### Dag-0 flow

1. Intake completion → `src/app/api/intake/session/route.ts`
2. `scheduleMainNurtureIfInactive` in `src/lib/nurture.ts` (dedup op **e-mailniveau**: skip alleen als dag-0 al `sent` is voor dat adres)
3. `scheduleNurtureSequence` → dag-0 direct via Resend; dagen 3–30 `pending` in `nurture_emails`

**Dedup (F-002):** her-intake met hetzelfde marketing-adres stuurt **geen** tweede welkomstmail zolang dag-0 al `sent` is. Na mislukte dag-0 (`failed`) worden verweesde `pending`-rijen opgeruimd en wordt opnieuw geprobeerd. Serverlog: `[api/intake/session] main nurture skipped (active day-0)`.

### Her-intake vs hermeting vs dev-testen

| Pad | Trigger | Welkomstmail (dag-0)? | Alternatief voor gebruiker |
|---|---|---|---|
| Eerste intake | `session_kind = initial`, nieuw marketing-adres | Ja — direct via Resend + pending 3–30 | Recovery-link in mail |
| Her-intake zelfde e-mail | Nieuwe `initial` sessie, zelfde adres, dag-0 al `sent` | **Nee** — F-002 skip | Dashboard (`/account/login` → `/dashboard`); bestaande nurture-sequence loopt door |
| Hermeting | `?hermeting=1` + baseline-cookie, `session_kind = remeasure` | Nee — marketing-blok wordt overgeslagen | Rapport/delta; uitnodiging via dag-30-mail |

**Productregel:** één hoofd-nurture per marketing-e-mailadres. `marketing_email` staat per sessie in `intake_sessions`; dedup en sequence-lifecycle werken op **e-mailniveau** in `nurture_emails`.

**Dev-testen:** hergebruik van hetzelfde testadres triggert F-002 (geen tweede welkomstmail). Gebruik een vers e-mailadres, of verwijder testrijen: `delete from nurture_emails where email = '...' and source = 'intake'`.

**Meetpunten:** `nurture.email_sent` (sequence_day 0) = mail verstuurd · `nurture.skipped` (reason `active_day0`) = her-intake dedup · `email.opted_in` alleen bij daadwerkelijke sequence-start.

---

## Gids-opt-in nurture

| Route | API | Consent |
|---|---|---|
| `/gids/slaap` … `/gids/testosteron` | `POST /api/gids/opt-in` | `guide_opt_ins` (marketing-only) |

1. Gebruiker vinkt expliciet marketing-checkbox aan (niet voorgevinkt)
2. Consent → `guide_opt_ins`
3. `scheduleGuideNurtureSequence` → dag-0 PDF-mail + pending rijen met `source = guide_{thema}`
4. Unsubscribe: token-prefix `guide:` → annuleert alleen pending rijen voor dat e-mail + thema

### PDF-gidsen (gids-flow)

| Thema | PDF | Pillar |
|---|---|---|
| slaap | `public/downloads/slaapgids-perfectsupplement.pdf` | `/slaap-verbeteren-na-40` |
| stress | `public/downloads/stressgids-perfectsupplement.pdf` | `/stress-verminderen-man` |
| energie | `public/downloads/energiegids-perfectsupplement.pdf` | `/energie-na-40` |
| herstel | `public/downloads/herstelgids-perfectsupplement.pdf` | `/herstel-verbeteren-na-40` |
| testosteron | — (dag-0 linkt naar pillar) | `/testosteron-na-40` |

Legacy `/thema/*` redirect naar `/gids/*`. Oude `thema_nurture`-tabel is uitgefaseerd.

---

## Technische implementatie

| Onderdeel | Details |
|---|---|
| E-mail provider | Resend |
| Database | `nurture_emails`, `guide_opt_ins` |
| Cron | `/api/cron/nurture` → `runPendingNurtureEmails()` |
| Unsubscribe | `/api/unsubscribe` (intake-, guide- en legacy thema-tokens) |

### Deploy-vereiste: `variant`-kolom op `nurture_emails`

`src/lib/nurture.ts` en `src/lib/nurture-cron.ts` zetten bij elke insert `variant: null`. Bestaat de kolom niet op de live DB, dan falen **alle** nurture-inserts.

**Apply vóór deploy** (Supabase dashboard → SQL Editor, of via CLI):

```sql
-- Aanbevolen: pas alle pending migraties tegelijk toe
supabase db push
```

**Verificatie na apply:**

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name  = 'nurture_emails'
  and column_name = 'variant';
-- Verwachte output: variant | text | YES
```

Migratie: `supabase/migrations/20260610130000_nurture_variant.sql` — idempotent (`add column if not exists`), veilig bij herhaling.

## 30-dagen reminder

Aparte tabel `intake_reminders`. Trigger via cron-job.org.

---

*Laatst bijgewerkt: juli 2026*
