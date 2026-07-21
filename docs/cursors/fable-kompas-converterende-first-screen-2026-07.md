# Fable-prompt — Kompas als converterende first screen (juli 2026)

Eén zelfstandige copy-paste prompt voor één Fable-sessie. Bestandspaden, regelnummers en
API-shapes geverifieerd tegen `main` op **21 juli 2026** (na A3 `ff107a0` en pr.3 `160dc43`).

## Context — waarom deze brok

Uit de re-grounding-pass (SSOT [`ROADMAP_DASHBOARD_COCKPIT.md`](../core/ROADMAP_DASHBOARD_COCKPIT.md)):

- **pr.1 "vandaag-kaart begrijpelijk" is gedaan — maar alleen op tab Mijn Dag** (`AgendaTodayHero`), niet op Kompas, de default-landing.
- **pr.2 intake→account-pijp is technisch compleet** (CTA → login → `claim-sessions` → dashboard); het "lek" is landings-IA, geen auth.
- **pr.3 Prioriteit/Aandacht/Rapport-groepen zijn gebouwd** (`160dc43`), maar de roadmap-§5-IA — *één hero (vandaag-actie) + "Je domeinen"* — is nog niet de default Kompas-landing.

De gebruiker landt dus op domeinbalken zonder "wat doe ik nu?", terwijl de enige
converterende CTA op een andere tab staat. Deze brok verplaatst de conversie naar de
first screen zónder een tweede "wat is vandaag"-logica te bouwen: `day-model.ts` is de
enige bron (A3-contract).

## Vaste besluiten (Dennis, 21 jul — geen A/B in de prompt)

1. **Kompas = first-job**: binnen 3 seconden "dit is je ene ding vandaag" + daaronder de domeingroepen. Mijn Dag blijft de diepte (tijdlijn).
2. **Hero op Kompas = zelfde bron als Mijn Dag**: `day-model.ts` + bestaande vandaag-copy (`getVandaagContextLine` / `buildVandaagFollowUp`). Geen duplicaat-logica.
3. **Domein-klik → first thing to do**: bovenaan elk interventie-domeinscherm één "Stap vandaag"-strip — eigen dagstap (afvinkbaar via `/api/account/daily-log`) óf doorverwijzing naar Mijn Dag. Eén primaire actie; géén zeven parallelle todos.
4. **Readouts**: niet klikbaar als todo; een driver-CTA ("Werk aan je slaap →") mag wél.
5. **Future You**: narratief, nooit een tweede score (SSOT §8.4). Payoff blijft hermeting/Voortgang.
6. **Nurture/weekly/win-back: NIET in deze build.** Verdicts (alleen als DEFER-notitie in de besluitlog):
   - Day-7 mag copy-reframing ("startpunt → lijn") zonder scores/domeinen — geen nieuw week-product.
   - Wekelijkse update-mail: nee pre-traffic (scores-in-mail-verbod, art. 9-risico, P3-discipline).
   - Win-back op `last_seen`: niet nu; bestaande day-30 + nutrition-relog volstaan. B2 e-mail-dagstart (scorevrij én domeinvrij + registercheck) is een aparte sessie.

---

## Prompt — Kompas converterende first screen

```text
MODEL-CONTEXT: Claude Fable — implementatie met expliciete redeneerstappen.
PROJECT: PerfectSupplement (Next.js 16, TypeScript strict, Supabase).
TAAL: Nederlands in UI-copy; Engelse code-identifiers.
LEES VÓÓR JE BEGINT: CLAUDE.md, docs/core/WRITING_VOICE.md, docs/core/COMPLIANCE.md,
docs/core/ROADMAP_DASHBOARD_COCKPIT.md (§5-IA, §8.4, status-correctie + re-grounding).

WERKWIJZE (verplicht, in volgorde — schrijf elke fase kort uit vóór je code aanraakt):
F0 North star — 1 zin: welk conversie-gat sluit dit?
F1 Verificatie — open de genoemde bestanden; noteer wat WEL/NIET bestaat
F2 Diagnose — as-is vs productdoel; noem bekende schuld
F3 Beslissingspoorten — expliciet kiezen (max 5 regels onderbouwing per poort)
F4 Ontwerp — copy, data-flow, events (geen PII in GA4/Clarity)
F5 Implementatie — minimale diff, bestaande patronen
F6 Handoff — acceptatiecriteria + verificatie-commando's + meetpunt-regel

CONSTRAINTS (altijd):
- Imports @/; "use client" alleen waar nodig; Tailwind in JSX, geen inline styles in
  nieuwe code (bestaand patroon in Dashboard.tsx niet big-bang migreren)
- day-model.ts is de ENIGE "wat is vandaag"-bron (A3-contract) — geen tweede afleiding
- Geen tweede scoringswaarheid; Future You alleen narratief (SSOT §8.4)
- Geen medische claims — "adviezen, geen diagnoses"; copy "op basis van je laatste
  check-in", NOOIT "live gemeten"
- Geen nurture-/weekly-/win-back-code — uitsluitend een DEFER-notitie in de besluitlog
- Geen wijzigingen aan: src/app/intake/, src/lib/scoring.ts, src/lib/intake-engine.ts,
  agenda_blocks/daily_action_log-tabellen, deploy.sh, .env.local
- Dashboard.tsx niet big-bang herschrijven — alleen de schermen aanraken die deze brok
  toch raakt; uitsplitsen naar losse bestanden mag alleen voor NIEUWE componenten
- Geen git commit — stop na wijzigingen voor review (git-guardrails Dennis: elke
  commit/push/deploy vereist expliciet "GA DOOR")
- Output in twee delen: (A) besluitlog markdown (F0–F4 + F6, incl. DEFER-notitie
  nurture), (B) uitgevoerde code

════════════════════════════════════════════════════════════════════════

F0 — NORTH STAR
Wie vanuit de intake op het dashboard landt ziet binnen 3 seconden zijn ene dagactie
op Kompas — en elke domein-klik levert een first thing to do, geen dead-end analyse.

F1 — VERIFICATIE-TARGETS (open deze bestanden; bij afwijking: melden, niet gokken)

| Bestand | Wat controleren (stand 21 jul, geverifieerd) |
|---|---|
| src/components/dashboard/Dashboard.tsx | `const KompasHome` (zoek; ná pr.3-edits): rendert hermeting-reminder-kaart + "Je domeinen"-KompasLooseCard met drie groepen (priorityRow / aandachtRows / rapportRows). GEEN hero. KompasDomainRow (~r2584), KompasGroupLabel (~r2647), KompasReadoutRow direct erna (geen CTA in de readout-rij). DomainSoonScreen-fallback blijft. Domain-branches → BewegingScreen/StressScreen/SleepScreen/VoedingScreen/VerbindingScreen. |
| src/data/dashboard/index.ts | TAB_SECTIONS (r352): vandaag = ["kompasHome"], agenda = ["agendaHome"]. Sectie-id "kompas-home" (r305). |
| src/components/dashboard/agenda/AgendaTodayHero.tsx | Props: model, slot, prefBusy?, variant "default"/"detail", actionSurface "agenda_today"|"agenda_block_detail" (r33 — union moet uitgebreid), onCompletionChange?, onScheduledTimeChange?. "Verplaats"-picker rendert alleen als onScheduledTimeChange is meegegeven. Emit: dashboard_vandaag_card_shown + dashboard_vandaag_action_toggled met surface=actionSurface; daily-log fetch/toggle via daily-log-client-cache (gedeeld → toggles syncen tussen surfaces). |
| src/lib/day-model.ts | resolveDayContent / resolveScheduledTime / isPlanStepHidden / resolveActionKey / buildDaySlot. Vandaag-slot komt uit buildWeekSchedulePreview(model).find(isToday) (patroon: AgendaScreen.tsx r52). |
| src/lib/vandaag-card-links.ts | getVandaagContextLine / buildVandaagFollowUp / buildVandaagOnderbouwingHref — de bestaande vandaag-copy. |
| src/lib/dashboard-readout.ts + src/lib/domain-role.ts | getReadoutPresentation(pillarId) → driverLabels + primaryCta {pillarId,label,route}; isReadoutDomain/isInterventionDomain. |
| src/components/dashboard/DomainDeepTool.tsx | Snapshot → Meten (soft-paywall) → Begeleiding; DeepToolSoonPill "Binnenkort in premium" (~r624). Analyse/upsell, geen "doe dit nu". |
| src/app/api/account/daily-log/route.ts | GET ?domain=… → {keys,streak}; POST {domain,actionKey,done}. Whitelist-check: bevat "verbinding" inmiddels wel/niet? Melden. |
| src/lib/dashboard-url.ts | syncDashboardTabParam (r53) + kompas-param. LET OP: agenda-dag-param (A4) bestaat NIET — deep-link naar Mijn Dag is alleen ?tab=agenda. |
| src/lib/events.ts + src/lib/intake-events-client.ts + src/app/api/intake/events/route.ts | Drie-plekken-registratie, alléén nodig als poort 3 een nieuw event-type afdwingt. |

F2 — DIAGNOSE (verwacht beeld; toets het)
Kompas (default-tab) opent op de hermeting-reminder (soms) + domeingroepen — status
zonder handeling. De enige dagactie-kaart (AgendaTodayHero) leeft op tab agenda.
Domein-klik → DomainDeepTool of domeinscherm = analyse + soft-paywall, geen first
todo. Bekende schuld: Dashboard.tsx-monoliet (bevroren, organisch uitsplitsen),
SoonPills in domeinschermen (aparte A1-brok — hier NIET opruimen).

F3 — BESLISSINGSPOORTEN (kies expliciet, max 5 regels onderbouwing per poort)
Poort 1 — hero-hergebruik:
  Optie A (aanbevolen): AgendaTodayHero direct op Kompas mounten met
  actionSurface="kompas_home" (union uitbreiden) en ZONDER onScheduledTimeChange
  (geen "Verplaats"-picker op Kompas; tijd-beheer blijft Mijn Dag).
  Optie B: gedeelde leaf-component extraheren als A props/gedrag oplevert die op
  Kompas niet kloppen. Kies A tenzij F1 een concreet bezwaar toont.
Poort 2 — plaatsing in de sectie-structuur:
  Optie A (aanbevolen): hero ín KompasHome renderen boven de domeinlijst (minste
  diff; geen union-/TAB_SECTIONS-wijziging).
  Optie B: aparte sectie "vandaagCard" + TAB_SECTIONS.vandaag = ["vandaagCard",
  "kompasHome"] (schoner gescheiden, meer plumbing). Kies en onderbouw.
Poort 3 — meetpunt-hergebruik (verplichte uitkomst tenzij aantoonbaar onmogelijk):
  dashboard_vandaag_card_shown / dashboard_vandaag_action_toggled met surface=
  "kompas_home" hergebruiken; dashboard_kompas_domain_open blijft. Alleen als
  hergebruik echt niet past: nieuw type via de drie-plekken-registratie.
Poort 4 — "Stap vandaag"-strip op het domeinscherm:
  Als vandaag-stap.domain === dit domein: strip toont titel + 1 zin WIIFM
  (day-model/plan-stap) + afvink-CTA (zelfde daily-log + cache als de hero —
  states blijven synchroon). Anders: strip toont doorverwijzing "Open Mijn Dag"
  (?tab=agenda via bestaande URL-state). Eén primaire actie per scherm; kies of
  de strip op alle 5 interventie-schermen of eerst op beweging (referentie) landt
  — onderbouw.
Poort 5 — readout driver-CTA (pr.3 afronden):
  KompasReadoutRow krijgt de primaryCta uit getReadoutPresentation als kleine
  tekst-link ("Werk aan je slaap →", patroon bestaat in de signals-sectie).
  De rij zelf blijft niet-klikbaar als todo.

F4 — ONTWERP
Kompas-hero:
- Zelfde kaart als Mijn Dag (titel uit day-model, WIIFM-regel, "Waarom?"-link,
  afvink-CTA, streak, ná Gedaan één vervolg) — copy ongewijzigd hergebruiken.
- Empty/geen-slot: bestaand fallback-gedrag van de hero; niets nieuws verzinnen.
- Volgorde KompasHome: [hero] → [hermeting-reminder indien due] → [Je domeinen].
  Overweeg reminder bóven hero alleen als hermeting due is — kies en onderbouw kort.
Domein-strip:
- Kop "Stap vandaag" + titel + 1 zin; secundair niets. Onder de strip blijft het
  bestaande scherm (Snapshot/analyse; Meten/Begeleiding secundair) ongewijzigd.
- "Volgende stappen"-sectie (bestaand lifestyle-plan-data, beweging = referentie)
  mag als lichte lijst onder de strip die naar Mijn Dag wijst — GEEN nieuw
  multi-week-UI, geen big-bang redesign van de plannen.
Events (hergebruik eerst):
- Hero op Kompas: bestaande events met surface="kompas_home" (poort 3).
- Strip: bestaand dashboard_vandaag_action_toggled met surface="domain_screen_<id>"
  of hergebruik van de bestaande surface-systematiek — onderbouw de keuze; durable
  dashboard.daily_action_toggled blijft server-side ongewijzigd.
Future You: uitsluitend narratieve copy waar passend ("elke afgevinkte stap is een
investering") — geen score, geen teller, geen nieuw visueel element.

F5 — IMPLEMENTATIE-SCOPE
- src/components/dashboard/Dashboard.tsx: KompasHome — hero mounten + evt.
  reminder-volgorde; KompasReadoutRow — driver-CTA (poort 5). Geen andere regio's.
- src/components/dashboard/agenda/AgendaTodayHero.tsx: actionSurface-union +
  "kompas_home" (en de surface-doorvoer in de twee trackEvent-calls + de
  onderbouwing-tag-ternary r288-297 netjes afhandelen).
- Domein-schermen (poort 4-keuze): "Stap vandaag"-strip als NIEUWE gedeelde
  component (bv. src/components/dashboard/DomainTodayStrip.tsx) — niet 5×
  copy-pasten in de schermen.
- src/lib/events.ts c.s.: alleen bij poort-3-uitzondering.
NIET: nurture/weekly/win-back, SoonPill-opruiming (A1), agenda-dag-param (A4),
TAB_SECTIONS/tab-labels wijzigen (tenzij poort 2 optie B — dan minimaal),
DomainDeepTool-flows herbouwen, punten/gamification.

F6 — HANDOFF / ACCEPTATIECRITERIA
- [ ] /dashboard (default Kompas, ingelogd, niet-empty) toont de vandaag-hero VÓÓR
      de domeinlijst; afvinken werkt en sync't met Mijn Dag (gedeelde cache)
- [ ] dashboard_vandaag_card_shown vuurt op Kompas met surface="kompas_home";
      geen dubbel-vuren per tab-switch (useRef-guard per mount is acceptabel —
      benoem het gedrag)
- [ ] Interventie-domeinscherm: "Stap vandaag"-strip = eigen stap (afvinkbaar) óf
      doorverwijzing ?tab=agenda; nooit allebei, nooit leeg
- [ ] KompasReadoutRow: driver-CTA aanwezig; rij zelf geen todo-klik
- [ ] Copy compliance: "op basis van je laatste check-in"; geen scores in nieuwe
      surface-payloads; Future You alleen narratief
- [ ] Besluitlog bevat de DEFER-notitie nurture/weekly/win-back (besluiten 21 jul)
- [ ] 375px: hero + groepen + strip zonder horizontale scroll
- [ ] grep -rn "console.log" src/ schoon; npx tsc --noEmit groen; npx vitest run
      groen; eslint --max-warnings 0 op geraakte bestanden (GEEN next build bij
      draaiende dev-server)
- [ ] Meetpunt-regel in output: "Meetpunt: dashboard_vandaag_card_shown
      (surface=kompas_home) + dashboard_vandaag_action_toggled +
      dashboard_kompas_domain_open — hier lees je de funnel intake→account→eerste
      vandaag-impressie→domein-verdieping af."
Geen commit. Stop na de wijzigingen voor review.
# Voorgestelde commit: git add -A && git commit -m "feat(dashboard): Kompas converterende first screen — vandaag-hero + Stap-vandaag-strip"
```
