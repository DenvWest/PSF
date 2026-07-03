# Fable-prompts — retentie-backlog (juli 2026)

Drie zelfstandige copy-paste prompts, één per Fable-sessie. Elke prompt bevat de
gedeelde prefix + feature-specifieke F0–F6-spec. Alle bestandspaden, API-shapes en
bugs hieronder zijn geverifieerd tegen de codebase op 3 juli 2026.

**Aanbevolen volgorde:**

1. **Vandaag-kaart** — hoogste retentie-ROI; backend (`daily_action_log`) staat klaar, nul UI-gebruik.
2. **Hermeting-reminder** — sluit de 30-dagen-lus; fixt de kapotte in-app remeasure-start.
3. **Premium-wachtlijst** — monetisatie-intentie; fixt en passant de live 500-bug op de coach-features.

**Verificatie-uitkomsten die van het oorspronkelijke plan afwijken (verwerkt in de prompts):**

- De dag-30 reminder-mail (`intake-reminder-cron.ts`) bouwt de CTA al correct met
  `mode: "remeasure"` (baseline-cookie wordt gezet) en skipt accounts. Het e-mailpad is
  dus af; alleen de opt-in-component is nergens gemount. De bug zit uitsluitend in-app.
- `nurture-cron.ts` heeft géén kruisverwijzing naar `intake_reminders` → dubbele
  dag-30-mail is mogelijk voor anonieme gebruikers met marketing-consent én opt-in.
- De `daily-log` API-route whitelist't zes domeinen — `verbinding` ontbreekt. Als de
  prioriteit verbinding is, faalt de toggle-POST met 400 (beslispoort in prompt 1).
- De `premium_waitlist`-migratie CHECK't op slechts 3 features terwijl de API er 8
  accepteert → **alle 5 coach-wachtlijst-knoppen geven vandaag een 500 in productie.**

---

## Prompt 1 — Vandaag-kaart (retentie-gat #1)

```text
MODEL-CONTEXT: Claude Fable — implementatie met expliciete redeneerstappen.
PROJECT: PerfectSupplement (Next.js 16, TypeScript strict, Supabase).
TAAL: Nederlands in UI-copy; Engelse code-identifiers.
LEES VÓÓR JE BEGINT: CLAUDE.md, docs/core/WRITING_VOICE.md, docs/core/COMPLIANCE.md,
docs/core/IA_ECOSYSTEEM.md §5, .cursor/rules/meten.mdc

WERKWIJZE (verplicht, in volgorde — schrijf elke fase kort uit vóór je code aanraakt):
F0 North star — 1 zin: welk retentie-gat sluit dit?
F1 Verificatie — open de genoemde bestanden; noteer wat WEL/NIET bestaat
F2 Diagnose — as-is vs productdoel; noem bekende schuld
F3 Beslissing — 2 opties + gekozen richting (max 5 regels onderbouwing)
F4 Ontwerp — copy, data-flow, events (geen PII in GA4/Clarity)
F5 Implementatie — minimale diff, bestaande patronen
F6 Handoff — acceptatiecriteria + verificatie-commando's + meetpunt-regel

CONSTRAINTS (altijd):
- Imports @/; server components default
- Geen wijzigingen aan: src/app/intake/, src/data/affiliate-links.ts, src/lib/scoring.ts,
  globals.css, deploy.sh, .env.local
- Geen medische claims — "adviezen, geen diagnoses"
- Copy: "op basis van je laatste check-in", NOOIT "live gemeten"
- Geen git commit — stop na wijzigingen voor review
- Output in twee delen: (A) besluitlog markdown (F0–F4 + F6), (B) uitgevoerde code

════════════════════════════════════════════════════════════════════════

F0 — NORTH STAR
Gebruiker opent het dashboard en ziet binnen 3 seconden één concrete dagactie op
basis van de laatste check-in — een reden om morgen terug te komen.

F1 — VERIFICATIE-TARGETS (open deze bestanden; bij afwijking: melden, niet gokken)

| Bestand | Wat controleren (stand 3 jul, geverifieerd) |
|---|---|
| src/components/dashboard/Dashboard.tsx | NowSection + ActiveHabitCard (dormant voor de vandaag-tab; POST /api/account/plan-patroon). KompasHome (~regel 2885), home-return (~regel 3024). KompasLooseCard (~regel 2368) = de LICHTE kaart (bg-white, #1c1917) — de kompas-surface (.ps-dash-surface-kompas) houdt de CSS-tokens DONKER, dus de donkere `Card`-primitive is hier onbruikbaar. SECTION_RENDERERS (~regel 3081). |
| src/data/dashboard/index.ts | TAB_SECTIONS.vandaag = ["kompasHome"] (regel ~343) — geen now/priority. DASHBOARD_TABS: id "vandaag", label "Kompas". |
| src/types/dashboard.ts | DashboardSectionType-union (regel ~18) — nieuwe sectie vereist union-uitbreiding. DashboardModel: priority, activeHabit, scores, answers, domainScores, vitality. |
| src/lib/dashboard-active-plan.ts | ActivePlanHabit (state/title/detail/planHref/source/domain/phaseId/stepId) + buildPriorityInterventionHref(model). |
| src/lib/daily-action-log.ts | Backend KLAAR, nul UI-gebruik. toggleDailyAction / getDailyActionState → { date, keys, streak }. Tijdzone Europe/Amsterdam. |
| src/app/api/account/daily-log/route.ts | GET ?domain=… → state; POST { domain, actionKey, done } → { ok, date, keys, streak }. LET OP: DOMAINS-whitelist = slaap/energie/stress/voeding/beweging/herstel — "verbinding" ONTBREEKT. actionKey max 120 chars. |
| docs/core/IA_ECOSYSTEEM.md §5 | Productvisie module 1 "Vandaag": laatste check-in + 1 prioriteit; copy-regel "op basis van je laatste check-in". |
| src/lib/vitality-explainer.ts + src/lib/vitality-habit-kernel.ts | getVitalityExplainer / buildHabitScoreKernel — al geïmporteerd in Dashboard.tsx; kopieer de call-signatures uit NowSection. |

F2 — DIAGNOSE (verwacht beeld; toets het)
De vandaag-tab toont alleen de domeinladder + twee soon-placeholders. De dagactie
(activeHabit) leeft verstopt in de dormant NowSection; afvinken schrijft alleen
plan_progress (eenmalig "done"), niet de dagelijkse daily_action_log. Er is dus
geen dagelijks herhaalbare actie en geen streak-signaal → geen reden om morgen
terug te komen. Bekende schuld: dubbele persistentie-paden (plan vs daily-log).

F3 — BESLISSINGSPOORTEN (kies expliciet, max 5 regels onderbouwing per poort)
Poort 1 — plaatsing:
  Optie A (aanbevolen, minste risico): nieuwe sectie "vandaagCard" bovenaan
  TAB_SECTIONS.vandaag → ["vandaagCard", "kompasHome"]; nieuwe lichte component,
  logica hergebruikt uit dormant NowSection/ActiveHabitCard.
  Optie B: daily toggle alleen in de "Activiteiten logboek"-KompasSoonScreen vervangen.
  Kies A tenzij F1 iets tegenstrijdigs toont.
Poort 2 — persistentie van de dag-toggle:
  Optie A (aanbevolen): POST /api/account/daily-log (dagelijks herhaalbaar + streak);
  plan_progress NIET aanraken in deze prompt (minimale diff, geen dubbel schrijven).
  Optie B: beide paden schrijven. Alleen kiezen als je een concreet consistentie-
  probleem aantoont; anders scope-creep.
Poort 3 — het verbinding-gat:
  Als model.priority.id "verbinding" kan zijn (check derivePriority/PILLARS):
  Optie A: voeg "verbinding" toe aan de DOMAINS-whitelist in daily-log/route.ts
  (kleine, veilige uitbreiding). Optie B: fallback-domein. Kies en onderbouw.

F4 — ONTWERP
Kaart-inhoud (licht gestyled via KompasLooseCard-patroon):
- Eyebrow: prioriteit-label in priority.color + "· op basis van je laatste check-in"
- Eén habit-stap: activeHabit.title/detail; fallback priority.quickWin
- CTA-toggle "Gedaan vandaag" → POST /api/account/daily-log; toon persisted state
  via GET bij mount (refresh behoudt state)
- Streak-feedback subtiel (bv. "3 dagen op rij") — géén confetti/gamification
- Empty/geen-habit state: link naar relevante check-in via buildPriorityInterventionHref
Events (meten.mdc — kies de passende laag, geen sprookjesbos):
- Daily toggle: server-side emitEvent in de daily-log route (gebeurt toch al
  server-side → alleen registratie in src/lib/events.ts DOMAIN_EVENT_TYPES nodig,
  géén client-allowlist). Voorstel type: "dashboard.daily_action_toggled" met
  payload { domain, action_key, done, streak }.
- Client: GA4 trackEvent("dashboard_vandaag_card_shown", { has_active_habit, priority })
  éénmalig via useRef-guard + clarityTag("dashboard_vandaag", "shown"); GA4 op toggle-klik.
- Hergebruik bestaande types waar ze passen vóór je nieuwe verzint.

F5 — IMPLEMENTATIE-SCOPE
- src/types/dashboard.ts: DashboardSectionType + "vandaagCard"
- src/data/dashboard/index.ts: TAB_SECTIONS.vandaag = ["vandaagCard", "kompasHome"]
- Dashboard.tsx: VandaagCard-component (licht!) + SECTION_RENDERERS-entry
  (empty → null; EmptyTabState dekt de lege staat al af)
- src/app/api/account/daily-log/route.ts: alleen aanraken voor poort 3 + server-event
- src/lib/events.ts: alleen als F4 een nieuw event-type nodig maakt
NIET: punten-ledger, volledige activiteitenlogboek-UI, tab hernoemen (id blijft
"vandaag", label blijft "Kompas"), NowSection verwijderen, plan-flow wijzigen.

F6 — HANDOFF / ACCEPTATIECRITERIA
- [ ] /dashboard?tab=vandaag toont de dagkaart VÓÓR de domeinlijst (ingelogd, niet-empty)
- [ ] Toggle persisted in daily_action_log; refresh behoudt state; streak zichtbaar
- [ ] Prioriteit "verbinding" breekt de toggle niet (poort 3 opgelost)
- [ ] Copy compliance: "op basis van je laatste check-in", geen "live gemeten"
- [ ] Kaart is licht gestyled op de donkere kompas-surface (geen var(--panel)-donkerkaart)
- [ ] grep -rn "console.log" src/ schoon; npx tsc --noEmit groen; npm test groen;
      npm run build groen (NIET draaien terwijl next dev live is)
- [ ] Besluitlog (deel A) + meetpunt-regel in output:
      "Meetpunt: dashboard.daily_action_toggled + dashboard_vandaag_card_shown —
      hier lees je af of de dagkaart tot dagelijkse terugkeer leidt."
Geen commit. Stop na de wijzigingen voor review.
# Voorgestelde commit: git add -A && git commit -m "feat(dashboard): Vandaag-kaart met dagelijkse actie-toggle en streak op Kompas-tab"
```

---

## Prompt 2 — Hermeting-reminder (e-mail + in-app)

```text
MODEL-CONTEXT: Claude Fable — implementatie met expliciete redeneerstappen.
PROJECT: PerfectSupplement (Next.js 16, TypeScript strict, Supabase).
TAAL: Nederlands in UI-copy; Engelse code-identifiers.
LEES VÓÓR JE BEGINT: CLAUDE.md, docs/core/WRITING_VOICE.md, docs/core/COMPLIANCE.md,
docs/core/IA_ECOSYSTEEM.md §5, .cursor/rules/meten.mdc

WERKWIJZE (verplicht, in volgorde — schrijf elke fase kort uit vóór je code aanraakt):
F0 North star — 1 zin: welk retentie-gat sluit dit?
F1 Verificatie — open de genoemde bestanden; noteer wat WEL/NIET bestaat
F2 Diagnose — as-is vs productdoel; noem bekende schuld
F3 Beslissing — 2 opties + gekozen richting (max 5 regels onderbouwing)
F4 Ontwerp — copy, data-flow, events (geen PII in GA4/Clarity)
F5 Implementatie — minimale diff, bestaande patronen
F6 Handoff — acceptatiecriteria + verificatie-commando's + meetpunt-regel

CONSTRAINTS (altijd):
- Imports @/; server components default
- Geen wijzigingen aan: src/data/affiliate-links.ts, src/lib/scoring.ts,
  globals.css, deploy.sh, .env.local
- src/app/intake/ (de flow-pagina's) niet aanraken; de UITZONDERING voor deze taak:
  het mounten van MeasurementReminderOptIn in de results-reveal-COMPONENTEN
  (src/components/intake/) is expliciet toegestaan en de kern van deel A
- Geen medische claims — "adviezen, geen diagnoses"
- Copy: "op basis van je laatste check-in", NOOIT "live gemeten"
- Supabase-migraties NOOIT via CLI/db push — alleen migratiebestand schrijven;
  Dennis draait de SQL handmatig in de Dashboard SQL Editor
- Geen git commit — stop na wijzigingen voor review
- Output in twee delen: (A) besluitlog markdown (F0–F4 + F6), (B) uitgevoerde code

════════════════════════════════════════════════════════════════════════

F0 — NORTH STAR
Na ~30 dagen start de gebruiker een GEKOPPELDE hermeting (baseline → delta), via
mail én in-app — zonder dubbele of kapotte paden.

F1 — VERIFICATIE-TARGETS (open deze bestanden; bij afwijking: melden, niet gokken)

| Bestand | Wat controleren (stand 3 jul, geverifieerd) |
|---|---|
| src/components/intake/MeasurementReminderOptIn.tsx | Gebouwd, props { sessionId }, POST /api/intake/reminder met { email, sessionId } — NERGENS gemount (grep bevestigt 0 usages). |
| src/app/api/intake/reminder/route.ts | Werkt: rate-limit, honeypot, consent-row (measurementReminderConsentRow), insert intake_reminders met reminder_date = +30d, reminder_type "day30", emitEvent "remeasure.invited". |
| src/lib/intake-reminder-cron.ts | Dag-30 mail WERKT AL GOED: skipt e-mails met actief account (markeert sent), CTA = buildIntakeRecoveryUrlForSession(sessionId, { mode: "remeasure" }) → zet baseline-cookie. Gebruikt getNurtureEmailContent(sequenceDay: 30). |
| src/lib/nurture-cron.ts | Aparte dag-30 nurture-mail; GEEN kruisverwijzing naar intake_reminders → dubbele dag-30-mail mogelijk (anonieme user met marketing-consent + opt-in). |
| src/components/dashboard/Dashboard.tsx | RemeasureStrip (~regel 1324; heeft al een due-variant met CTA) leeft ALLEEN op de hermeting-tab. BUG: onRemeasure (~regel 3353) = router.push("/intake?from=dashboard") — platte nieuwe intake ZONDER baseline-cookie → session_kind wordt "initial", remeasure.completed vuurt niet, /rapport/[sid] werkt niet. |
| src/lib/intake-remeasure-cookie.ts | psf_intake_remeasure, HMAC-signed (COOKIE_SECRET), max-age 24h; sign/verify-helpers. |
| src/app/api/intake/recover/route.ts | ?token=X&mode=remeasure → setRemeasureCookie(sessionId) → redirect /intake?hermeting=1. Werkt alleen met recovery-TOKEN, niet met account-sessie. |
| src/app/api/intake/session/route.ts (~regel 263) | Leest de baseline-cookie → session_kind "remeasure" + baseline_session_id + remeasure.completed-event. Dit is het contract dat de fix moet voeden. |
| src/lib/account-server.ts + src/lib/account-dashboard.ts | getAccountFromCookie(); intake_sessions per account_id (oudste = baseline van het dashboard-delta). |

F2 — DIAGNOSE (verwacht beeld; toets het)
Drie gaten: (1) de opt-in bestaat maar niemand kan hem invullen → intake_reminders
blijft leeg → de werkende cron heeft niets te versturen; (2) de in-app CTA start een
verkeerde flow (initial i.p.v. remeasure); (3) dag-30 nurture en dag-30 reminder
kunnen dezelfde anonieme gebruiker dubbel mailen. Schuld om te noteren, niet fixen:
twee mailkanalen delen hetzelfde dag-30 template.

F3 — BESLISSINGSPOORTEN
Poort 1 — mount-plek opt-in (anonieme flow; accounts worden door de cron geskipt):
  Optie A (aanbevolen): in de results-reveal-flow (IntakeResults.tsx rendert al
  IntakeFeedback met sessionId — mount MeasurementReminderOptIn op een logische
  plek in diezelfde reveal, ná de kerninhoud, vóór/naast de footer).
  Optie B: IntakeExit/IntakeInBoxExit. Kies op basis van waar sessionId beschikbaar
  is en waar de gebruiker het resultaat al gezien heeft.
Poort 2 — in-app remeasure-start voor accounts:
  Optie A (aanbevolen): nieuwe route GET /api/account/remeasure/start —
  getAccountFromCookie → pak de relevante intake_sessions-rij van het account →
  signRemeasureBaselineSessionId → zet psf_intake_remeasure-cookie → redirect
  /intake?hermeting=1 (spiegel setRemeasureCookie uit recover/route.ts exact).
  onRemeasure wordt window.location.assign("/api/account/remeasure/start").
  Optie B: recovery-token genereren en via bestaand recover-pad sturen (meer
  indirectie, zelfde effect). Kies A tenzij F1 anders uitwijst.
  Subkeuze expliciet maken: baseline = EERSTE of LAATSTE sessie van het account?
  Het dashboard-delta gebruikt de eerste; het rapport vergelijkt remeasure vs
  baseline-snapshot. Kies, onderbouw in max 5 regels, en wees consistent.
Poort 3 — dubbele dag-30-mail:
  Minimale fix (aanbevolen): in intake-reminder-cron vóór verzenden checken of
  nurture_emails voor dit e-mailadres al een dag-30 verstuurde (of omgekeerd in
  nurture-cron) — één richting is genoeg; kies de kant met de kleinste diff en
  documenteer de andere als vervolg. GEEN volledige nurture-consolidatie.

F4 — ONTWERP
In-app: versterk de bestaande RemeasureStrip-duevariant en toon hem óók op de
Kompas-home wanneer data.remeasure.daysUntil <= 0 (KompasHome krijgt alle
SharedSectionProps — destructureer data + onRemeasure). Lichte styling
(KompasLooseCard-patroon; de kompas-surface houdt donkere tokens).
Copy opt-in: begrip → urgentie → actie (WRITING_VOICE.md); geen druk, één belofte:
"Over 30 dagen meet je opnieuw — wij herinneren je eraan." E-mailveld + versturen.
Events: remeasure.invited consistent houden (bestaat, wordt al server-side
geëmit door de reminder-route). Nieuw client-meetpunt alleen GA4 + Clarity:
trackEvent("dashboard_hermeting_reminder_click", { surface: "kompas_home" }) op de
in-app CTA en trackEvent("remeasure_optin_shown") éénmalig bij mount van de opt-in.
Geen nieuw domain-event nodig.

F5 — IMPLEMENTATIE-SCOPE
- UI: MeasurementReminderOptIn mounten (poort 1) + Kompas-home reminder + onRemeasure-fix
- Backend: /api/account/remeasure/start (poort 2) + dedup-check (poort 3)
NIET in deze prompt: volledige nurture-consolidatie, push notifications,
unsubscribe-refactor, template-splitsing dag-30 (allemaal noteren als vervolg in F6).

F6 — HANDOFF / ACCEPTATIECRITERIA
- [ ] Opt-in zichtbaar na eerste intake (anonieme flow); POST werkt; consent-row opgeslagen
- [ ] Dashboard "Doe je hermeting nu" start een remeasure-flow: nieuwe sessie krijgt
      session_kind "remeasure" + baseline_session_id (verifieer in code-pad, en zo
      mogelijk lokaal met een testaccount)
- [ ] Kompas-home toont de reminder alleen bij daysUntil <= 0
- [ ] Geen dubbele dag-30-mail voorzover in code afdwingbaar (dedup-check aanwezig)
- [ ] Meetpunten: remeasure.invited (bestaand), remeasure.completed (bestaand, vuurt
      nu ook via in-app pad), GA4 op CTA-klik en opt-in-show
- [ ] grep -rn "console.log" src/ schoon; npx tsc --noEmit groen; npm test groen;
      npm run build groen (NIET draaien terwijl next dev live is)
- [ ] Besluitlog (deel A) + meetpunt-regel in output:
      "Meetpunt: remeasure.invited → remeasure.completed + dashboard_hermeting_reminder_click —
      hier lees je af of de 30-dagen-lus zich sluit."
Geen commit. Stop na de wijzigingen voor review.
# Voorgestelde commit: git add -A && git commit -m "feat(retentie): hermeting-lus gesloten — opt-in gemount, in-app remeasure-start gefixt, dag-30 dedup"
```

---

## Prompt 3 — Premium-wachtlijst versimpelen

```text
MODEL-CONTEXT: Claude Fable — implementatie met expliciete redeneerstappen.
PROJECT: PerfectSupplement (Next.js 16, TypeScript strict, Supabase).
TAAL: Nederlands in UI-copy; Engelse code-identifiers.
LEES VÓÓR JE BEGINT: CLAUDE.md, docs/core/WRITING_VOICE.md, docs/core/COMPLIANCE.md,
docs/core/IA_ECOSYSTEEM.md §5, .cursor/rules/meten.mdc

WERKWIJZE (verplicht, in volgorde — schrijf elke fase kort uit vóór je code aanraakt):
F0 North star — 1 zin: welk retentie-gat sluit dit?
F1 Verificatie — open de genoemde bestanden; noteer wat WEL/NIET bestaat
F2 Diagnose — as-is vs productdoel; noem bekende schuld
F3 Beslissing — 2 opties + gekozen richting (max 5 regels onderbouwing)
F4 Ontwerp — copy, data-flow, events (geen PII in GA4/Clarity)
F5 Implementatie — minimale diff, bestaande patronen
F6 Handoff — acceptatiecriteria + verificatie-commando's + meetpunt-regel

CONSTRAINTS (altijd):
- Imports @/; server components default
- Geen wijzigingen aan: src/app/intake/, src/data/affiliate-links.ts, src/lib/scoring.ts,
  globals.css, deploy.sh, .env.local
- Geen medische claims — "adviezen, geen diagnoses"
- Copy: "op basis van je laatste check-in", NOOIT "live gemeten"
- Supabase-migraties NOOIT via CLI/db push — schrijf het migratiebestand in
  supabase/migrations/ en zet de exacte SQL óók in de besluitlog; Dennis draait
  hem handmatig in de Dashboard SQL Editor
- Geen git commit — stop na wijzigingen voor review
- Output in twee delen: (A) besluitlog markdown (F0–F4 + F6 + SQL), (B) uitgevoerde code

════════════════════════════════════════════════════════════════════════

F0 — NORTH STAR
Eén helder premium-verhaal, één meetbare conversie-actie, plus prijsintentie voor
de latere pricing-beslissing.

F1 — VERIFICATIE-TARGETS (open deze bestanden; bij afwijking: melden, niet gokken)

| Bestand | Wat controleren (stand 3 jul, geverifieerd) |
|---|---|
| supabase/migrations/20260628120000_premium_waitlist.sql | LIVE BUG: check (feature in ('inzichten','statistieken','lichaamssamenstelling')) — maar de API accepteert 8 features. Elke coach-join (5 knoppen) faalt met DB-constraint-error → route logt en returnt 500 → gebruiker ziet foutmelding. |
| src/app/api/account/waitlist/route.ts | FEATURES-array (8 keys), upsert onConflict account_id,feature, emitEvent "premium.waitlist_joined" { feature, surface }. Geen prijsveld. |
| src/components/dashboard/WaitlistButton.tsx | 8-key WaitlistFeature-union, generieke copy, states idle/loading/joined/error, trackEvent("premium_waitlist_join") + clarityTag. |
| 8 plaatsingen | SleepScreen.tsx:478 (slaap-coach), StressScreen.tsx:~635 (stress-coach), BewegingScreen.tsx:~570 (beweging-coach), VerbindingScreen.tsx:~297 (verbinding-coach), Dashboard.tsx:~2859 (voeding-coach), VoortgangHub.tsx:~584 (inzichten), ~665 (statistieken), ~907 (lichaamssamenstelling). |
| 4 "Premium · app" soon-kaarten | SleepScreen:~485, StressScreen:~656, BewegingScreen:~591, VerbindingScreen:~307 — dubbele premium-boodschap naast de coach-knop. VoortgangHub heeft daarnaast een premium-HubCard (lichaamssamenstelling-entry, ~678). |
| src/lib/events.ts | DOMAIN_EVENT_TYPES bevat "premium.waitlist_joined"; nieuw server-side event vereist ALLEEN registratie hier (geen client-allowlist — de emit gebeurt in de API-route). |

F2 — DIAGNOSE (verwacht beeld; toets het)
Acht losse fake-door-features versnipperen het intentie-signaal, vijf ervan zijn
functioneel kapot (500), en vier soon-kaarten dupliceren de premium-boodschap op
dezelfde schermen. Er is geen prijsintentie-meting. Het wachtlijst-instrument kan
in deze staat de premium-beslissing niet informeren.

F3 — BESLISSINGSPOORT
Optie A (aanbevolen): één PremiumWaitlistCard op de Voortgang-hub (primaire plek);
Kompas-schermen: WaitlistButton + dubbele "Premium · app" soon-kaart verwijderen,
optioneel één rustige tekstlink "Meer over begeleiding →" naar de hub-plek.
Optie B: kaart op elke huidige plek behouden met feature-collapse.
Kies A tenzij F1 iets tegenstrijdigs toont. Onderbouw of de tekstlink erin gaat.

Het verhaal is VAST (niet onderhandelbaar; kop mag typografisch variëren):
  "Elke week kijkt er iemand met je mee — onafhankelijk, zonder merkverkoop."
Ondersteunende regel in dezelfde geest: gratis meet je waar je staat; premium is
wekelijkse persoonlijke terugkoppeling op je eigen cijfers.

Prijsvraag (inline of na succesvolle join — kies en onderbouw):
  "Wat zou je per maand redelijk vinden?" — banden: <€10 / €10–20 / €20–35 / >€35 /
  "Weet ik nog niet". Optioneel veld; join mag zonder antwoord.

F4 — ONTWERP
Data:
- Nieuwe migratie (bestand + SQL in besluitlog, handmatig draaien):
  1) CHECK-constraint fixen: drop de oude constraint; nieuwe check die de oude
     8 features PLUS de nieuwe geconsolideerde waarde toestaat (bestaande rijen
     mogen niet invalideren), bv. feature in ('inzichten','statistieken',
     'lichaamssamenstelling','voeding-coach','beweging-coach','stress-coach',
     'slaap-coach','verbinding-coach','premium-coaching');
  2) kolom price_indication text null + check op de 5 banden (of null).
- API: body wordt { feature, surface, priceIndication? }; priceIndication
  server-side whitelisten; opslaan in de rij; feature "premium-coaching" toevoegen
  aan FEATURES (oude keys behouden — er kunnen rijen bestaan).
Events (max 3 signalen, vervang het sprookjesbos):
- GA4 premium_waitlist_shown { surface } — éénmalig via useRef
- premium.waitlist_joined (bestaand; payload: { feature: "premium-coaching",
  surface, price_band }) — server-side in de route
- premium.price_indicated (nieuw domain-event in events.ts; alleen emitten als
  er een band gekozen is) — server-side in de route
Component: PremiumWaitlistCard ("use client", src/components/dashboard/) —
hergebruik de fetch/state-machine uit WaitlistButton.tsx; één knop; joined-state
identiek aan bestaand patroon ("Je staat op de wachtlijst — …").

F5 — IMPLEMENTATIE-SCOPE
- Nieuw component + migratiebestand + API-uitbreiding + events.ts-registratie
- Verwijder WaitlistButton uit de 5 Kompas-schermen; collapse de 4 "Premium · app"
  soon-kaarten (verwijderen of vervangen door de optionele tekstlink)
- Reduceer VoortgangHub tot 1 premium-entry (PremiumWaitlistCard op de hub;
  statistieken/lichaamssamenstelling-upsells verwijzen naar of vervangen door
  diezelfde ene kaart — geen 3 losse joins meer)
- WaitlistButton.tsx: mag blijven bestaan als de nieuwe kaart hem hergebruikt;
  anders opruimen — kies in F3 en onderbouw
NIET: checkout, Stripe, isMember-logica activeren, e-mails sturen.

F6 — HANDOFF / ACCEPTATIECRITERIA
- [ ] Precies 1 wachtlijst-verhaal + 1 primaire join-knop in het product (Voortgang-hub)
- [ ] Kompas-schermen: geen WaitlistButtons en geen dubbele "Premium · app"-kaarten meer
- [ ] Prijsindicatie opgeslagen (kolom) en gemeten (premium.price_indicated)
- [ ] Migratiebestand aanwezig; exacte SQL in de besluitlog; DB-constraint dekt
      alle bestaande én nieuwe feature-waardes (coach-features inserten niet meer 500
      zodra de SQL gedraaid is)
- [ ] Oude premium_waitlist-rijen blijven geldig
- [ ] grep -rn "console.log" src/ schoon; npx tsc --noEmit groen; npm test groen;
      npm run build groen (NIET draaien terwijl next dev live is)
- [ ] Besluitlog (deel A) + meetpunt-regel in output:
      "Meetpunt: premium_waitlist_shown → premium.waitlist_joined (+ premium.price_indicated) —
      hier lees je premium-vraag én betalingsbereidheid af."
Geen commit. Stop na de wijzigingen voor review.
# Voorgestelde commit: git add -A && git commit -m "feat(premium): één wachtlijst-verhaal met prijsindicatie; fix waitlist-constraint-bug"
```

---

## Na uitvoering (per sessie)

1. Dennis reviewt de diff + besluitlog.
2. Bij prompt 3: eerst de SQL uit de besluitlog in de Supabase Dashboard SQL
   Editor draaien, dán pas deployen (prompt 1 en 2 hebben geen schemawijziging).
3. Deploy per prompt apart (nooit twee conversie-gevoelige wijzigingen in één
   deploy — meten.mdc).
4. Effect aflezen op de meetpunt-regel uit de besluitlog.
