# Cron endpoints (`/api/cron/`)

Geplande taken worden **niet** door de server zelf getriggerd. [cron-job.org](https://cron-job.org) roept de endpoints aan met `CRON_SECRET` (Bearer of HMAC).

Auth-logica: [`src/lib/cron-auth.ts`](../../../lib/cron-auth.ts).

## Overzicht

| Cron | Endpoint | Schedule (cron-job.org) | Doel | Extra env | Response (200) |
|------|----------|-------------------------|------|-----------|----------------|
| **Nurture** | `GET`/`POST` `/api/cron/nurture` | Dagelijks (typisch ochtend) | Verstuurt pending `nurture_emails` (intake + gids) | `RESEND_API_KEY`, `CRON_SECRET` | `{ "sent": number, "errors": number }` |
| **Retention** | `GET`/`POST` `/api/cron/retention` | Dagelijks | Verwijdert oude `intake_sessions` (24m) en `nurture_emails` (12m / verweesde pending) | `CRON_SECRET`, Supabase admin | `{ "deletedSessions": number, "deletedNurture": number, "deletedOrphanPending": number }` |
| **n8n events** | `GET`/`POST` `/api/cron/n8n-events` | Elke 5–15 min (optioneel) | Stuurt onbezorgde `domain_events` naar n8n webhook | `CRON_SECRET`, `N8N_WEBHOOK_URL`, Supabase admin | `{ "forwarded": number, "errors": number }` |

### Gerelateerd (niet onder `/api/cron/`)

| Job | Endpoint | Schedule | Doel | Auth |
|-----|----------|----------|------|------|
| **30-dagen reminders** | `GET`/`POST` `/api/send-reminders` | Dagelijks | `intake_reminders` day-30 + triggert ook nurture-batch | Bearer `CRON_SECRET` alleen (geen HMAC) |

Exacte cron-job.org schedules staan in het cron-job.org dashboard (niet in repo).

## Authenticatie

| Variabele | Verplicht | Gebruik |
|-----------|-----------|---------|
| `CRON_SECRET` | Ja | Bearer token of HMAC secret |
| `CRON_ALLOWED_IPS` | Nee | Comma-separated IP-allowlist (leeg = uit) |

**Voorkeur:** HMAC headers `x-cron-signature` + `x-cron-timestamp` (max 5 min skew).  
**Fallback:** `Authorization: Bearer <CRON_SECRET>`.

## Dead-man's switch (`cron_runs`)

Retention schrijft elke run naar `cron_runs` (migratie [`db/migrations/006_cron_runs.sql`](../../../../db/migrations/006_cron_runs.sql)).

| Kolom | Betekenis |
|-------|-----------|
| `cron_name` | Bijv. `retention` |
| `started_at` / `completed_at` | Start en einde |
| `status` | `running` → `success` \| `error` |
| `result` | JSON met delete-counts bij success |
| `error_message` | Tekst bij error |

Fouten in healthcheck-write breken de cron **niet** (best-effort logging).

**Nurture:** nog geen `cron_runs`-integratie — vereist wijziging aan `nurture/route.ts` (aparte PR).

### Verificatie-queries (Supabase SQL)

Laatste succesvolle retention-run:

```sql
select cron_name, started_at, completed_at, result
from cron_runs
where cron_name = 'retention' and status = 'success'
order by completed_at desc
limit 1;
```

Runs laatste 7 dagen:

```sql
select cron_name, status, started_at, completed_at, result, error_message
from cron_runs
where started_at > now() - interval '7 days'
order by started_at desc;
```

Hangende runs (mogelijk crash mid-run):

```sql
select *
from cron_runs
where status = 'running' and started_at < now() - interval '1 hour';
```

## Nieuwe cron toevoegen

1. **Route** — `src/app/api/cron/<naam>/route.ts` met `export const dynamic = "force-dynamic"`.
2. **Auth** — roep `verifyCronRequest(request)` aan op `GET` en `POST`; return 401/503 zoals bestaande routes.
3. **Logica** — business logic in `src/lib/`, route blijft dun.
4. **Healthcheck** — insert/update `cron_runs` (zie `runRetentionCronJob` in [`src/lib/intake-retention.ts`](../../../lib/intake-retention.ts)).
5. **cron-job.org** — nieuwe job met production URL, `CRON_SECRET`, gewenste schedule.
6. **Documenteer** — voeg een rij toe aan de tabel in dit bestand.

## Deploy-checklist

- Migratie `006_cron_runs.sql` toepassen op Supabase vóór eerste retention-run met healthcheck.
- Na deploy: handmatig één retention-trigger en check `cron_runs` (query hierboven).
