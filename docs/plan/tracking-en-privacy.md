# Leefstijlplan — tracking & privacy (contract voor stap 3)

Normatieve specificatie voor render, persistentie en event-emits. Stap 2 levert content + dit contract; implementatie volgt in stap 3.

## Identiteit

- Pseudonieme sleutel = ondertekende intake-sessie (`httpOnly`-cookie), dezelfde als bestaande intake-events.
- Geen naam, e-mail of vrije-tekstantwoorden in `plan.*`-payloads.

## Twee gescheiden bronnen

| Bron | Rol | Mutatie |
|------|-----|---------|
| `PlanProgress` (Supabase) | Source of truth voor voortgang per sessie/domein | Upsert per stapstatus |
| `domain_events` | Append-only analytics-stream | Alleen inserts |

Niet vermengen: voortgang lezen/schrijven gaat via `PlanProgress`; analytics via events. Events mogen afgeleid worden uit voortgang, maar vervangen `PlanProgress` nooit.

## 0-meting (t0)

- **Event:** `plan.viewed`
- **Moment:** eerste render van het leefstijlplan voor deze sessie + domein (client).
- **Payload (categorisch):** `domain`, `template_version`
- t0 = startpunt voor funnel-/retentie-analyse; niet hetzelfde als `PlanProgress.startedAt` (server-timestamp bij eerste upsert).

## Consent-gate

`plan.*`-tracking (inclusief `plan.viewed`) **alleen** wanneer `anonymous_analytics = true` in de intake-toestemming.

- Functionele sessie-cookie: geen aparte analytics-toestemming nodig (noodzakelijk voor het plan).
- Analytics naar PostHog/n8n: vereist expliciete toestemming (`anonymous_analytics`). Zonder die toestemming: geen client-emits, geen server-afgeleide plan-events naar derden.
- Rechtsgrond: bestaande intake-toestemming; geen nieuwe verwerking buiten de gegeven scopes.

## Event-taxonomie

### Client-emits (via `/api/intake/events`, allowlist)

| Event | Trigger | Payload |
|-------|---------|---------|
| `plan.viewed` | Eerste plan-render (t0) | `domain`, `template_version` |
| `plan.step_state_changed` | Gebruiker wijzigt stapstatus (todo/doing/done/skipped) | `domain`, `phase_id`, `step_id`, `from`, `to`, `template_version` |
| `plan.step_link_clicked` | Klik op `PlanStepLink` | `domain`, `step_id`, `link_kind` |

`from` / `to` = `PlanStepState`-enum (`todo` \| `doing` \| `done` \| `skipped`).  
`link_kind` = `PlanStepLinkKind` (`guide` \| `comparison` \| `article` \| `kennisbank`).

### Server-afgeleid (niet in client-allowlist)

| Event | Trigger | Payload |
|-------|---------|---------|
| `plan.phase_completed` | Alle zichtbare stappen in fase `done` of `skipped` | `domain`, `phase_id`, `template_version` |
| `plan.checkin_completed` | Gebruiker voltooit check-in-stap (bijv. `slp-weekelijkse-check-in`) | `domain`, `week_bucket` |

`week_bucket` = categorisch bucket-label (bijv. `"week-4"`, `"week-8"`), geen exacte datum/timestamp in payload.

Server-afgeleide events worden geëmit na succesvolle `PlanProgress`-upsert, alleen bij `anonymous_analytics = true`.

## Payload-minimalisatie

Toegestaan in payloads:

- Enums en vaste ids (`domain`, `phase_id`, `step_id`, `template_version`, `link_kind`, `from`, `to`, `week_bucket`)
- Pseudonieme `session_id` (kolom op `domain_events`, niet in JSON-payload)

**Niet** in payloads:

- Vrije tekst, ruwe antwoordwaarden, scores, profielnamen
- E-mail, naam, IP
- Exacte timestamps (ISO) — gebruik server `occurred_at` op de rij

## ID-stabiliteit

- `step_id` en `phase_id` in templates zijn contractuele sleutels.
- Gebruikt in `PlanProgress.steps`, events en B2B-coach-filters.
- **Nooit hernoemen** na livegang; deprecate via nieuwe id + template-version bump.

Voorbeelden slaapplan: `slp-vast-bedtijd-venster`, `slp-phase-deze-week` (zie `src/data/lifestyle-plans/sleep.ts`).

## Revoke-keten

Bij intrekken/anonimiseren (bestaande `revoke_intake_session_consent`-flow):

1. `PlanProgress` voor de sessie: anonimiseren of koppeling verbreken (zelfde beleid als `intake_sessions`).
2. `domain_events` met die `session_id`: anonimiseren of pseudoniem loskoppelen — consistent met intake-events.
3. Emit `consent.revoked` (bestaand); geen nieuwe plan-events na revoke.

Recht op intrekken (art. 7.3) en recht op verwijdering (art. 17) lopen via dezelfde UI/API als intake (`PrivacyRevokeConsent`, `revokeIntakeConsent`).

## Opslagbeperking (art. 5.1e)

- `PlanProgress` en `domain_events` volgen het bestaande retentie-/anonimiseringsbeleid; geen onbeperkte bewaring.
- Anonimiseringsbeleid na revoke: antwoorden/scores gewist; pseudonieme sessie-id kan voor aggregate statistiek blijven (zoals gedocumenteerd in de privacy-UI).

## AVG / cookiewet — samenvatting

| Principe | Toepassing |
|----------|------------|
| Dataminimalisatie (5.1c) | Alleen ids/enums in events; voortgang per stap, geen vrije tekst |
| Doelbinding (5.1b) | Plan-tracking uitsluitend voor productverbetering/analytics binnen gegeven toestemming |
| Pseudonimisering | Sessie-cookie, geen PII in plan-payloads |
| Toestemming analytics | `anonymous_analytics` gate voor alle `plan.*` naar PostHog/n8n |
| Intrekken/verwijderen | Zelfde revoke-keten als intake |

## Niet-medisch

- Copy in templates: adviezen, geen diagnoses (zie `medicalBoundary` per template).
- Supplement-claims: EFSA-conforme bewoording in template-data; geen nieuwe gezondheidsclaims in events of payloads.

## Referenties (stap 2)

- Template-schema: `src/types/lifestyle-plan.ts`
- Slaap-template: `src/data/lifestyle-plans/sleep.ts`
- Registry: `src/data/lifestyle-plans/index.ts`
- Event-types: `src/lib/events.ts` (`DOMAIN_EVENT_TYPES`)
- Client allowlist: `src/lib/intake-events-client.ts`, `src/app/api/intake/events/route.ts` (`CLIENT_EMIT_TYPES`)
