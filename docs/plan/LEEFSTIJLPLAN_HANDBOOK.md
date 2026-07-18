# Leefstijlplan — architectuur- & doorontwikkel-handboek

> Levend document. Werk dit bij bij elke structurele wijziging aan het
> leefstijlplan. Bedoeld als naslag én als inspiratie voor uitbreidingen
> (nieuwe domeinen, B2B-coaches, n8n-automatisering).

## 1. Mentaal model: het plan is data, geen PDF

Eén bron, vier verschijningsvormen:

```
LifestylePlanTemplate (content, data)  +  PlanProgress (pseudonieme staat)
   ├── → web (afvinkbaar plan op de resultatenpagina)
   ├── → PDF (genereerbaar uit hetzelfde object)
   ├── → e-mail / n8n-nurture (blokken + events)
   └── → B2B-coach-dashboard (leest dezelfde PlanProgress)
```

Schrijf inhoud dus nooit in Word/PDF, maar in het getypte template. Weergave
(Tailwind/JSX) hoort in het component, niet in de data.

### Content-laag vs planning-laag

Het leefstijlplan heeft **twee complementaire lagen**:

| Laag | Vraag | SSOT |
|------|-------|------|
| **Content / checklist** (dit handboek) | *Wat* doe je in week 1–12? | `LifestylePlanTemplate` + `PlanProgress` |
| **Planning / uitvoering** (Kompas) | *Wanneer* en *met welke prioriteit*? | Lifestyle Planning Engine — zie [`ARCHITECTUUR_LIFESTYLE_PLANNER.md`](ARCHITECTUUR_LIFESTYLE_PLANNER.md) |

De checklist-laag blijft session-scoped (`plan_progress`); de planning-laag is
account-scoped (`lp_*`-tabellen) en dekt scheduling, beweegsnacks, agenda,
wearables en notificaties. **Beweegplan** is de eerste module (`movement`).

## 2. Personalisatie-ladder (begin met advies, word persoonlijker)

| Laag | Bron | Waar het leeft |
|---|---|---|
| **L0 generiek advies** | geen | `recognition`, `mechanism`, default-stappen |
| **L1 profiel-personalisatie** | intake-scores/-signals | `PlanCondition` op stappen (`showWhen`) |
| **L2 gedrags-personalisatie** | afvink-/voortgangsdata | `PlanProgress` + `plan.*`-events → n8n |
| **L3 coach-personalisatie** | mens | `PlanCoachOverlay` (nog niet bedraad) |

Regel: voeg waarde toe op de laagst mogelijke laag. Een nieuwe tip is meestal L0
of L1, geen nieuwe infrastructuur.

### UX-patroon: thin movement + thick bridge (movement v1.2+)

Bewegingsplan gebruikt een **licht spoor** (track-banner uit `MOV_STR`/`MOV_CARD`,
1–2 weekacties, mechanism ingeklapt) plus een vaste **nutriëntbrug** onder de actieve
fase (`buildMovementNutrientBridge` in `src/lib/movement-nutrient-bridge.ts`):

1. Weekacties eerst (checkbox) — geen supplement-first viewport.
2. Brug altijd met eiwit/macro → `/intake/voeding`; creatine/Mg conditioneel via
   bestaande `showWhen`/signalen.
3. Stappen met tag `nutrient-bridge` blijven in het template (PDF/n8n) maar worden
   niet dubbel in de checklist gerenderd.
4. Cross-domein chips via `getPlanCrossDomainChips` — leefstijl-wins uit andere
   Kompas-domeinen (herstel, energie voor movement).
5. Meet: `plan.step_link_clicked` met `surface: "nutrient_bridge"` + GA4
   `movement_nutrient_bridge`.

Shell-wijzigingen (collapsed rationale, klikbare fase-accordeon) gelden voor alle
domein-plannen in `LifestylePlan.tsx`.

### UX-patroon: dagelijks ritme (movement v1.3+)

**v1.4:** dagelijks ritme zit **in** Deze week als categorieknop (Kracht · Conditie · Dagelijks ritme),
niet meer als losse strip boven de fases. SSOT: `src/lib/movement-week-categories.ts`,
UI: `MovementWeekCategoryPanel.tsx`, embedded rhythm: `MovementDailyRhythmContent.tsx`.

Boven de weekfasen stond eerder een vaste **Dagelijks ritme**-strip (`MovementDailyRhythmStrip`,
SSOT `src/data/movement/daily-rhythm.ts`, builder `src/lib/movement-daily-rhythm.ts`):

1. **Beweegsnack** — onderbreek zitten elke 20–30 min (WHO sedentary behaviour); 3–4
   gepersonaliseerde micro-opties (`mov-snack-*`, aligned met planner-doc §14.2).
2. **Stappen** — haalbare richting per PAL-band (`derivePAL`), geen diagnose.
3. Onderbouwing via `#MOV_SED` op `/onderbouwing` (`MOV_SED_EVIDENCE`).
4. Scheiding `main` (weekfases) vs `micro` (dagelijks ritmo) — snacks tellen niet mee
   in week-kracht/conditie-checklist.
5. Meet: `plan.daily_rhythm_clicked`, `plan.week_category_selected`, GA4
   `movement_daily_rhythm` / `movement_week_category`.

### Hobby overlay (L1.5) — DEFER

Sport-hobby koppelen aan automatische kracht/conditie-oefeningen (`MOV_HOBBY` intake,
`src/data/movement/hobby-prescriptions.ts`, merge via overlay) — **niet in v1**.
Fallback zonder hobby: longevity-baseline (`movement-plan-track.ts`). Zie
`ARCHITECTUUR_LIFESTYLE_PLANNER.md` §14.1 `mov-sport-session`.

## 3. Bestandskaart (waar zit wat)

| Verantwoordelijkheid | Bestand |
|---|---|
| Datacontracten (types) | `src/types/lifestyle-plan.ts` |
| Content per domein | `src/data/lifestyle-plans/<domain>.ts` |
| Template-registry | `src/data/lifestyle-plans/index.ts` (`getPlanTemplate`) |
| Conditie-evaluator + context | `src/lib/lifestyle-plan-eval.ts` |
| Voortgang (server, Supabase) | `src/lib/plan-progress.ts` |
| API (laden/opslaan + server-events) | `src/app/api/intake/plan/route.ts` |
| Render (client, afvinkbaar) | `src/components/intake/LifestylePlan.tsx` |
| Inhaakpunt | `src/components/intake/IntakeResults.tsx` |
| Event-taxonomie | `src/lib/events.ts` + `intake-events-client.ts` |
| Client-event-poort + gate | `src/app/api/intake/events/route.ts` |
| Analytics-consent-cookie | `src/lib/analytics-consent.ts` |
| DB-schema + revoke-RPC's | `supabase/migrations/*_plan_progress.sql` |
| Tracking-/privacy-contract | `docs/plan/tracking-en-privacy.md` |
| Planning-engine (Kompas) | `docs/plan/ARCHITECTUUR_LIFESTYLE_PLANNER.md` |

## 4. Harde regels (niet zonder reden breken)

1. **`id` is een contract.** `step.id`, `phase.id`, `template.version` zijn
   sleutels in `PlanProgress` én in events. **Nooit hernoemen.** Deprecaten en
   nieuwe toevoegen wél. (Let op: `slp-weekelijkse-check-in` bevat een
   spelfout maar is nu bevroren — corrigeer alleen de zichtbare titel, niet de id.)
2. **Server is autoriteit.** De API herberekent de `PlanIntakeContext` uit de
   opgeslagen sessie (`loadIntakeSessionPayloadBySessionId`), vertrouwt nooit
   client-scores. Een stap die niet in `selectVisibleSteps` zit, wordt geweigerd.
3. **Functioneel vs analytics scheiden.** Voortgang bewaren (`/api/intake/plan`)
   is de dienst zelf → **niet** gegate. Gedrags-events (`plan.*` vanaf de client)
   zijn analytics → **wél** gegate op `anonymous_analytics`.
4. **Payload-minimalisatie.** Events bevatten alleen enums/ids/categorische
   velden. Nooit vrije tekst, ruwe antwoorden, e-mail, naam of exacte timestamps.
5. **Eén stap = één gedrag.** Imperatief, concreet, vanavond uitvoerbaar.
6. **Niet-medisch.** "Adviezen, geen diagnoses." Supplementuitspraken alleen in
   EFSA-toegestane bewoording ("draagt bij tot ..."). `medicalBoundary` verplicht.

## 5. Tracking & privacy (samengevat — detail in tracking-en-privacy.md)

- **t0 / 0-meting** = `plan.viewed` bij eerste render.
- **Funnel**: `plan.viewed → plan.step_state_changed → plan.phase_completed → plan.checkin_completed`.
- **Gate**: `src/app/api/intake/events/route.ts` dropt álle client-events als de
  ondertekende `psf_analytics_consent`-cookie ontbreekt/`0` is (default-deny).
- **Bronnen gescheiden**: `plan_progress` = source of truth (mag herstellen,
  coach leest het); `domain_events` = append-only analytics-stream.
- **Revoke-keten**: intrekken/verwijderen ruimt `plan_progress` op via zowel de
  code (`PREFLIGHT_TABLES` + `cleanupIntakeSessionLinkedData`) als de DB-RPC
  (`cleanup_intake_session_linked_data`), met `to_regclass`-guard.

## 6. Uitbreid-recepten

### Nieuw domein toevoegen (bv. stress)
1. `src/data/lifestyle-plans/stress.ts`: `LifestylePlanTemplate` met `domain:"stress"`.
2. Registreer in `index.ts` zodat `getPlanTemplate("stress")` het teruggeeft.
3. Klaar — `IntakeResults` rendert het automatisch zodra `getPrimaryTheme` "stress"
   teruggeeft. Geen route-/component-wijziging nodig.
4. Heeft het domein een check-in-stap met eigen event? Voeg een domein-bewuste
   `CHECKIN_STEP_ID` toe (nu hardgecodeerd op slaap — zie §8).

### Nieuwe stap of fase
- Voeg toe aan het template met een **nieuwe, stabiele** `id`. Personaliseer met
  `showWhen`. Geen migratie nodig (steps leven in jsonb).

### Nieuwe personalisatie-conditie (PlanCondition-soort)
1. Breid de union in `src/types/lifestyle-plan.ts` uit.
2. Voeg een `case` toe in `evaluatePlanCondition` (de `never`-check dwingt dit af).
3. Houd 'm **serialiseerbaar** (data, geen functie) zodat PDF/e-mail/n8n blijven werken.

### Nieuw event
1. Voeg toe aan `DOMAIN_EVENT_TYPES` (events.ts).
2. Client-event? Ook in `ClientEmitType` (intake-events-client.ts) én
   `CLIENT_EMIT_TYPES` (events/route.ts) — anders weigert de poort het (403).
3. Server-afgeleid/operationeel? Emit via `emitEvent` in de plan-route, **niet**
   in de client-allowlist, en kies `deliveredTo` bewust (`n8n_webhook` vs `posthog`).

### Gids/PDF koppelen
- Zet `guideThema` op het template; PDF-pad staat in `src/data/gids/<thema>.ts`.
  Een stap met `kind:"guide"` of een download-stap kan ernaar linken.

### B2B-coach-laag activeren (L3)
- `PlanCoachOverlay` bestaat al als type maar is niet bedraad. Activeren =
  (a) tabel `plan_coach_overlay` (org-scoped, RLS op `organization_id`),
  (b) merge-laag in `selectVisibleSteps`/render (disabled + added steps),
  (c) de plan-route `organization_id` uit de **sessie** halen i.p.v.
  `getDefaultOrganizationId()` (zie §8).

### n8n-routing
- Events met `deliveredTo:["n8n_webhook"]` gaan via `publishDomainEventToN8n`.
  Laat n8n op gedrag reageren i.p.v. de kalender: `plan.phase_completed` →
  "fase ontgrendeld"-mail; geen activiteit → herinnering; `plan.checkin_completed`
  → her-intake-uitnodiging.

## 7. Compliance-checklist (langs elke wijziging houden)

- [ ] Geen nieuw persoonsgegeven verzameld zonder grondslag/doelbinding.
- [ ] Nieuwe gedrags-events lopen door de gate (geen tracking zonder consent).
- [ ] Geen PII in event-payloads of richting PostHog/n8n.
- [ ] Nieuwe sessie-gekoppelde tabel? Opnemen in de revoke-/delete-keten.
- [ ] Geen diagnose-/behandel-/garantietaal; medische grens zichtbaar.
- [ ] DB-migratie wordt handmatig door Dennis toegepast, niet door de tool.

## 8. Bekende aandachtspunten / backlog

- **Org-scoping niet bedraad**: de plan-route gebruikt `getDefaultOrganizationId()`;
  voor B2B moet dit de `organization_id` van de sessie worden.
- **`CHECKIN_STEP_ID` is slaap-specifiek** en hardgecodeerd in `plan-progress.ts`.
  Voor meerdere domeinen: per template een check-in-stap markeren (bv. via `tags`)
  i.p.v. één globale constante.
- **Skip is in de UI niet terug te draaien** (checkbox disabled bij `skipped`);
  server staat het wél toe. Overweeg een "ongedaan maken".
- **Rate-limit-bucket gedeeld** met `intake_session`; veel afvinkacties kunnen die
  bucket raken. Overweeg een eigen bucket voor de plan-route.
- **Spelfout in step-id** `slp-weekelijkse-check-in` (bevroren); controleer de
  zichtbare titel op dezelfde slip.
- **Bestaande sessies** (van vóór de gate) hebben geen consent-cookie → tijdelijk
  geen tracking tot her-consent. Bewust, verklaart een dip in event-volume.
- **Default-org `maxTier` (B1):** vóór PLAN live controleren op Supabase dat migratie
  `20260604120000_default_org_max_tier.sql` is toegepast (`settings.maxTier = 3` voor
  `00000000-0000-0000-0000-000000000001`). Zie [`PLAN_ENGINE_DECISION.md`](PLAN_ENGINE_DECISION.md).
- **`getVisibleTiers` caching (B5):** per `getPlanContent`-call een
  `organizations`-select zonder cache (anders dan `disclosureCache` in plan-content).
  Lage impact zolang PLAN niet live is; bij live-gang org-scoped in-memory cache met TTL
  of meeliften in org-context-laag overwegen.

## 9. Roadmap-status

- [x] Stap 1 — schema (`lifestyle-plan.ts`).
- [x] Stap 2 — slaap-template + tracking-contract (gecommit).
- [x] Stap 3 — render + voortgang + events + gate (in review).
- [ ] Verificatie: funnel-check + privacy-check (geen emit zonder consent).
- [ ] Tweede domein (stress) als bevestiging van de blauwdruk.
- [ ] n8n event-routing (gedrag i.p.v. kalender).
- [ ] B2B-coach-laag (L3).
- [ ] Lifestyle Planning Engine — Fase 1 (Beweegplan): zie [`ARCHITECTUUR_LIFESTYLE_PLANNER.md`](ARCHITECTUUR_LIFESTYLE_PLANNER.md).
