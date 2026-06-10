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
2. `scheduleNurtureSequence` in `src/lib/nurture.ts`
3. Dag-0 direct via Resend; dagen 3–30 `pending` in `nurture_emails`

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

*Laatst bijgewerkt: juni 2026*
