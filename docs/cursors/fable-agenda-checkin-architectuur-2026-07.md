# Opus-prompt — check-in → 7-dagenagenda (alle domeinen) (juli 2026)

Eén zelfstandige copy-paste prompt voor **Claude Opus**. Draai hem als **aparte sessie** —
architectuur/product-oordeel, geen implementatie.

**Achtergrond.** Het Kompas-dashboard toont vandaag één prioriteit + één habit op basis van
de laatste check-in (screenshot: "VERBINDING · OP BASIS VAN JE LAATSTE CHECK-IN", "Gedaan
vandaag", domeinbalken incl. energie/herstel als rapport). Dennis wil weten of het technisch
schaalbaar en product-slim is om daar een **7-dagenagenda** bovenop te bouwen die **interactief**
is met **alle interventiedomeinen** — startend met **beweging**, later uitbreidbaar naar
slaap, stress, voeding en verbinding — met domein-reminders over de dag, doorloop naar
**30-dagen hermeting**, en **energie/herstel-inzicht** via readout-delta (niet als
eigen agenda-slots). Later koppeling met Google Agenda of andere slimme opties.

**Bindende lens:** dit is geen feature-ontwerp maar een **architectuurverdict**: KEEP / REFINE /
KILL / DEFER — met concrete fasering, één gekozen architectuur, en expliciete NIET-lijst.

**Sessie-volgorde (optioneel):**
1. Roadmap-evaluatie (`docs/cursors/fable-roadmap-evaluatie-vervolg-2026-07.md`) als technische waarheid al gedraaid
2. Deze prompt (agenda-architectuur)
3. Handoff-prompts pas ná akkoord op het Opus-verdict

**Scope-besluit:** geen code, geen commits — output is een rapport. Geen volledige
roadmap-scorecard herhalen; wel 1 zin relatie tot "gratis Kompas sterker vóór betaald" als relevant.

---

## Prompt — check-in → 7-dagenagenda (alle domeinen)

```text
MODEL-CONTEXT: Claude Opus — architectuur- en productoordeel "7-dagenagenda uit check-in",
geen code wijzigen.
PROJECT: PerfectSupplement (perfectsupplement.nl) — Next.js 16 App Router, TypeScript strict,
Supabase (RLS), systemd-deploy op Hetzner. Onafhankelijk supplementen-vergelijkingsplatform
voor mannen 40+, positionering "Consumentenbond van supplementen".
TAAL: Nederlands in output; bestandspaden en code in Engels.
CONSTRAINTS: geen code-edits, geen commits, geen migraties, geen `next build`; alleen lezen + rapporteren.

## Waarom deze sessie

Het Kompas-dashboard heeft een sterke meet-ruggengraat (intake → domeinscores → prioriteit →
habit → check-ins → hermeting) maar toont vandaag **één** actie per dag (`activeHabit` /
vandaag-kaart). Dennis wil weten of het technisch schaalbaar en product-slim is om vanuit
de laatste check-in een **7-dagenagenda** te genereren die:

1. **Interactief** is met **alle 5 interventiedomeinen** (slaap, stress, voeding, beweging,
   verbinding) — niet 7× dezelfde prioriteitspijler, maar een **mix over de week** gewogen
   op scores en prioriteit.
2. **Modulair uitrolt**: fase 1 = **beweging** (bestaande Lifestyle Planner-blauwdruk);
   fase 2–5 = slaap, stress, voeding, verbinding via hetzelfde module-patroon.
3. **Domein-reminders** over de dag kan sturen (in-app, later e-mail/ICS/push).
4. Doorloopt naar **30-dagen hermeting** (bestaande substraten: intake_reminders, remeasure cron,
   delta-rapport).
5. **Energie en herstel** inzicht geeft via readout-delta en drivers — **zonder** eigen
   agenda-slots (DOMAIN_MODEL: readouts sturen niet).
6. Later koppelbaar is aan **Google Agenda** of andere calendar-opties — maar dat is **niet MVP**.

BINDENDE LENS (niet heronderhandelen): beantwoord "is dit schaalbaar en slim?" — geen
implementatieplan, geen UI-mockups, geen pseudo-code. Kies één architectuur; geen "overweeg A of B".

## Dennis-hypothesen (stress-testen, niet gehoorzamen)

H1. Een 7-dagenagenda verhoogt terugkeer en adherence beter dan de huidige "1 habit vandaag"-kaart.
H2. Beweging is het juiste startpunt voor de agenda-engine (Lifestyle Planner-blauwdruk);
    de andere vier interventiedomeinen kunnen later op hetzelfde `LifestyleModule`-patroon.
H3. Energie/herstel-inzicht hoort in de weekagenda als **readout-feedback** (drivers + delta),
    niet als zesde/sevende interventie-slot.
H4. Google Agenda-koppeling is fase ≥2; MVP = in-product week + bestaande reminder-substraten.

Per hypothese: expliciet oordeel — bevestigen, aanscherpen of verwerpen mag, maar kies.

## Harde regels (verankerd — niet heronderhandelen)

### Domeinmodel
- **5 interventiedomeinen** sturen agenda en prioriteit: slaap, stress, voeding, beweging,
  verbinding (docs/core/DOMAIN_MODEL.md, src/lib/domain-role.ts).
- **Energie en herstel = readout**: tonen met "Rapport"-label, drivers via READOUT_DRIVERS,
  CTA naar sterkste driver — **geen** LifestylePlan-routing, **geen** agenda-item per readout.
- Copy: "op basis van je laatste check-in" — geen live-gemeten claims; geen scores in
  shareable/calendar-artefacts (art. 9 AVG).

### Pre-traffic sprint
Uit docs/core/CURRENT_SPRINT.md (16 jul): geen S4/S6, geen Stripe, geen drempel-tuning op
N<100 — vóór week-0 aflezing van echt verkeer. Elke aanbeveling die hiermee botst label je
expliciet als "ná verkeer", met concrete trigger (metric + drempel). Alles vóór week-0 =
meet-/afleeswerk of kleinste MVP-slice — geen calendar-OAuth, geen push, geen lp_*-schema
tenzij je het expliciet DEFER't met trigger.

### Privacy / register-gate
Calendar-OAuth (Google/Outlook) = nieuwe verwerker + doorgifte → VERWERKINGSREGISTER,
DPA, DPIA herzien vóór productie. Noem dit expliciet in je fasering; blokkeer OAuth in MVP.

### Meet-standaard
Hergebruik bestaande events vóór je nieuwe verzint: measurement.checkin_completed,
plan.checkin_completed, dashboard.daily_action_toggled, remeasure.invited, remeasure.completed.
Nieuwe agenda-CTA's vereisen meetpunt-advies (welk event, welke GA4-param) — geen implementatie,
wel expliciet in F5.

### Architectuurkeuze (Opus MOET kiezen — geen open opties)
Kies **één** primaire architectuur en onderbouw t.o.v. de twee bestaande blauwdrukken:

A. **Afgeleide terugkijk-timeline** — buildAgendaTimeline() uit bestaande timestamps
   (PLAN_VITALITEIT_PUNTEN_COMMUNITY.md §3.2): geen vooruit plannen, alleen "wat deed ik wanneer".

B. **Vooruit-gegenereerde 7-dagen schedule** — buildWeekSchedule() uit check-in scores +
   LifestylePlanTemplate-stappen + prioriteit: 7 dagen met mix van domeinen, reminders per dag.

C. **Hybride (verwachting te valideren)** — vooruit week-schedule (interactie, reminders) +
   terugkijk-timeline (Voortgang-tab) als complement; module-first rollout via LifestyleModule
   registry (ARCHITECTUUR_LIFESTYLE_PLANNER.md).

Google Agenda / ICS = **fase ≥2**, nooit MVP. MVP = in-product week + daily_action_log /
plan_progress als completion-substraat.

WERKWIJZE (verplicht, in volgorde — alleen analyse):
F0 Fit-check — formuleer in max 5 regels welk productgat de 7-dagenagenda oplost t.o.v.
   "1 habit vandaag"; relateer in 1 zin aan "gratis Kompas sterker vóór betaald"
F1 Domein-dekking — per domein (tabel): rol | bestaande hooks (pad:regel) | agenda-interactie-doel |
   fase-nummer | gap
   Verplichte rijen: beweging, slaap, stress, voeding, verbinding, energie (readout), herstel (readout)
F2 Module-architectuur — LifestyleModule registry (planner-blauwdruk) vs simpele week-generator
   zonder lp_*-tabellen; kies één + onderbouwing; expliciet: hoe past verbinding (geen
   lifestyle-plan template, geen check-in API) in de registry?
F3 Interactie-model — hoe mix je 5 interventies over 7 dagen: prioriteit-gewogen vs round-robin
   vs dag-thema vs andere; max 1 gekozen model + 3 regels onderbouwing
F4 Verdict — KEEP / REFINE / KILL / DEFER voor het geheel + per fase (beweging-MVP vs multi-domein)
F5 Fasering — concrete lagen: MVP in-product week → domein-module 2–5 → ICS export → OAuth Google;
   per fase: scope, risico, privacy-gate, meetpunt-advies
F6 Sequentie pre-traffic vs ná verkeer + expliciete NIET-lijst + Dennis-checklist +
   max 3 handoff-prompts (titel + 1 zin elk, geen uitwerking)

## Verplichte bronnen

Domeinmodel & dashboard:
- docs/core/DOMAIN_MODEL.md — interventie vs readout, prioriteit, vitaliteit
- docs/core/ACCOUNT_DASHBOARD_SYSTEM.md — account-scoped aggregatie, check-in merge
- docs/core/IA_ECOSYSTEEM.md — Kompas-tab modules (Vandaag, tegels, hermeting)
- docs/core/ENTITY_MODEL.md — tabellen SSOT
- docs/core/INTAKE_SYSTEM.md — 30-dagen hermeting in productlus
- docs/core/STEPPED_CARE_MODEL.md — tier-trap; geen tweede primaire CTA

Agenda / planner blauwdrukken (ontwerp only — status expliciet verifiëren):
- docs/plan/ARCHITECTUUR_LIFESTYLE_PLANNER.md — LifestyleModule, movement first, lp_*,
  CalendarService, NotificationEngine, beweegsnacks
- docs/plan/PLAN_VITALITEIT_PUNTEN_COMMUNITY.md — afgeleide agenda MVP, buildAgendaTimeline(),
  agenda_entries later, punten-ledger
- docs/plan/PLAN_NUTRITION_SELFEVAL_LOOP.md — voeding verder dan andere domeinen
- docs/analyse/sdt-energie-herstel-conceptueel-model.md — energie/herstel conceptueel

Sprint & retentie:
- docs/core/CURRENT_SPRINT.md — pre-traffic regels
- docs/cursors/fable-prompts-retentie-backlog-2026-07.md — hermeting-reminder status; push expliciet out-of-scope
- docs/cursors/claude-platform-audit-report.md — calendar/push absent

Code-spotchecks (minimaal deze; breid uit waar een claim erom vraagt):
- src/lib/dashboard-model.ts — buildModel, activeHabit, derivePriority
- src/lib/dashboard-active-plan.ts — buildActivePlanHabit
- src/lib/vitality-habit-kernel.ts — fallback habit wanneer plan progress ontbreekt
- src/lib/account-dashboard.ts — loadAccountDashboardData, remeasure due +30d, trends merge
- src/lib/plan-progress.ts — getCheckinWeekBucket (1/2/4/6/8/12), upsertStepState idempotentie
- src/lib/daily-action-log.ts + src/app/api/account/daily-log/route.ts — dag-toggle, streak
- src/data/dashboard/index.ts — PILLARS (7), PILLAR_CHECKIN_ROUTES (4 domeinen, géén verbinding),
  DASHBOARD_TABS (kompas/voortgang/hermeting)
- src/data/lifestyle-plans/ — movement.ts, sleep.ts, stress.ts, nutrition.ts (géén connection.ts)
- src/lib/domain-role.ts — DOMAIN_ROLE, READOUT_DRIVERS
- src/lib/domain-checkin.ts + src/app/api/intake/*-checkin/route.ts — domain check-ins
- src/lib/delta-report.ts + src/app/api/account/remeasure/start/route.ts — hermeting + delta
- src/lib/remeasure-reminder-cron.ts + src/lib/intake-reminder-cron.ts — +30d e-mail
- src/lib/events.ts — bestaande event-types
- src/components/dashboard/Dashboard.tsx — vandaagCard, kompasHome, hermeting-tab
- src/components/dashboard/BewegingScreen.tsx — beweging deep screen (planner-consumer in blauwdruk)

## Bekende feiten om te verifiëren (niet blind overnemen)

- Live: 1 prioriteit + 1 habit per dag; "Gedaan vandaag" via daily_action_log;
  plan_progress week-buckets; hermeting due +30 UTC days; e-mail + in-app remeasure paths;
  trends/sparklines incl. energie/herstel (readout labels in UI)
- Ontwerp only: volledige Lifestyle Planner (src/lib/planner/, lp_* tabellen),
  CalendarService adapters, NotificationEngine, buildAgendaTimeline()
- Geen: Google Calendar OAuth, ICS export, push/service worker, agenda_entries tabel,
  buildWeekSchedule(), verbinding lifestyle-plan template, verbinding check-in API
- Schuld: plan_progress (session-scoped, stap done) vs daily_action_log (account-scoped,
  dag-toggle) — agenda moet één completion-bron kiezen of merge-regel definiëren
- Planner-doc noemt modules "energy, recovery" — botst met DOMAIN_MODEL (readouts);
  Opus moet expliciet corrigeren: agenda-modules = 5 interventies; readouts = insight-laag
- Hermeting-tab icon = Calendar maar inhoud = retest/future, geen weekagenda
- Composiet-KPI (context, niet herhalen): intake.completed → binnen 30d affiliate.click
  OF premium.waitlist_joined per cohort

## Domein-dekking — verwachte analysekader (Opus vult aan met bewijs)

| Domein | Rol | Agenda-interactie (doel) | Verwachte fase |
|--------|-----|--------------------------|----------------|
| beweging | interventie | Hoofdactiviteiten + beweegsnacks, tijdslots | 1 |
| slaap | interventie | Avondritme-reminders | 2 |
| stress | interventie | Pauze/micro-interventies overdag | 3 |
| voeding | interventie | Maaltijd/proteïne-momenten (compliance-safe) | 4 |
| verbinding | interventie | Sociale micro-acties — grootste greenfield | 5 |
| energie | readout | Insight-kaart "aangedreven door X" — géén slot | insight-laag |
| herstel | readout | Idem + hermeting-delta op dag 30 | insight-laag |

## Outputstructuur (verplicht)

1. **Executive summary** — max 10 regels incl. bindend verdict (KEEP/REFINE/KILL/DEFER)
2. **Hypothese-oordelen** — H1–H4 elk: bevestigd / aangescherpt / verworpen + 2 regels bewijs
3. **Domein-scorecard** — tabel: Domein | Rol | Hooks (pad:regel) | Agenda-doel | Fase | Gap | Advies
4. **Architectuurkeuze** — gekozen model (A/B/C) + waarom de andere twee afvallen; diagram in tekst
5. **Interactie-model** — gekozen mix-strategie over 7 dagen + voorbeeld week (dag 1–7, welke domeinen)
6. **Data & schaal** — account vs session scoping, completion-bron, lp_* ja/nee, schaalrisico's
7. **Fasering** — MVP → module-uitrol → ICS → Google OAuth; privacy-gate per fase
8. **Pre-traffic sequentie** — wat mag vóór week-0 vs ná verkeer (met triggers)
9. **Meetpunten** — per fase: welk bestaand/nieuw event + waar aflezen
10. **Expliciete NIET-lijst** — min 5 items met reden
11. **Dennis-checklist** + max 3 handoff-prompts (titel + 1 zin)

## Regels

- Geen code, geen commits, geen migraties — alleen rapport
- Elke status-claim met bewijs (pad:regel of grep); "niet verifieerbaar vanuit repo" → Dennis-checklist
- Geen vage "overweeg"-taal — kies, met onderbouwing
- Energie/herstel nooit als zesde/sevende interventie-module in de agenda — readout only
- Google Agenda nooit in MVP-fase — expliciet fase ≥2
- Planner-doc drift (energy/recovery als modules) expliciet corrigeren naar DOMAIN_MODEL
- Hergebruik bestaande event-types vóór je nieuwe verzint
```

---

## Na uitvoering

1. **Verdict + domein-scorecard reviewen** — vooral: klopt de gekozen architectuur (hybride vs
   alleen timeline vs alleen week-schedule) en is beweging inderdaad fase 1?
2. **Pre-traffic-besluit** — bouwen vóór week-0 (kleinste slice) of defer tot N-verkeer;
   noteer de trigger die Opus noemt
3. **Verbinding-gap** — als Opus fase 5 als groot greenfield markeert: apart besluit of
   verbinding-plan template + check-in API nodig zijn vóór agenda-module
4. **Doc-drift** — als Opus planner-doc vs DOMAIN_MODEL conflict vindt: noteer welk doc
   bijgewerkt moet worden (energy/recovery als modules → readout insight)
5. **Handoffs** — max 3 Opus-handoff-prompts pas laten uitwerken in aparte sessies, ná akkoord
   op verdict en fasering (verwacht: beweging-MVP, multi-domein module-registry, ICS/calendar-fase)
