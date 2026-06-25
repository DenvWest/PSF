# Prompt — Voeding-eerst Aanpak-matrix, nutriënten & cross-pijler-koppeling (PerfectSupplement)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude in VS Code. Voeg de **screenshot van de Aanpak-matrix (Voeding)** toe als bijlage. Claude levert **alleen analyse** (A t/m J), geen code. Voeg optioneel toe: `CLAUDE.md`, `docs/core/BRAND_POSITIONING.md`, `docs/core/STEPPED_CARE_MODEL.md`, `docs/plan/ANALYSIS_PILLAR_COVERAGE.md`.

---

## Waarom deze prompt

Dennis heeft een **design mockup** van een "Aanpak"-ervaring: een matrix die leefstijlstappen ordent op **bewijsniveau** (verticaal) en **moeite** (horizontaal), met **punten per stap** en **voortgang per pijler**. Voeding staat centraal; slaap, stress, beweging, energie en herstel blijven bestaan als leefstijlfactoren.

De ambitie: **De Consumentenbond van voeding eerst — supplementen als aanvulling** — met wetenschappelijke onderbouwing en expliciete koppeling tussen voeding/nutriënten en de andere pijlers. Geen medisch advies; wel inname-inschatting en leefstijlcoach-scope.

| Richting | Staat nu | Gap |
|----------|----------|-----|
| **Aanpak-matrix UI** | Mockup (screenshot) | Geen matrix-component in `src/`; scoring bestaat als composite formule |
| **Voeding als primaire pijler** | Voedingscheck + 12-weken plan live | Niet visueel/IA-voorop; `nutrition_score` = 2 vragen; voedingslog niet gekoppeld aan hoofdadvies |
| **Nutriënten-dekking** | 5 stoffen in `intake-reference.ts` | Mockup-stappen (vezels, mediterraan, tijdvenster) ontbreken; geen mg/ADH in productie |
| **Puntenstelsel** | Alleen plan-doc | Geen `points_ledger`; mockup toont "23 pt" en "0/94 voeding" |
| **Cross-pijler** | 11+ engine-kruisregels live | Geen unified matrix/orchestrator; energie/herstel = readout zonder eigen plan |
| **Meetinstrumenten** | Voedingscheck (frequentiebanden) live | BMR/TDEE/macro gepland; geen externe app-koppeling; bloed = referral-only |

**Belangrijk:** de screenshot is **doelvisie**, geen bestaande feature. Analyseer mockup vs. codebase expliciet.

### Verificatie-bronnen (optioneel voor Claude)

| Onderwerp | Pad |
|-----------|-----|
| Dashboard & 6 pijlers | `src/data/dashboard/index.ts`, `src/types/dashboard.ts`, `src/components/dashboard/Dashboard.tsx` |
| Readout vs intervention | `src/lib/domain-role.ts`, `src/lib/dashboard-readout.ts` |
| Intervention scoring | `src/lib/content/intervention-scoring.ts`, `match-interventions.ts`, `plan-content.ts` |
| Stepped-care UI (orphan) | `src/components/intake/PlanContentSection.tsx` |
| Lifestyle plans | `src/data/lifestyle-plans/` (sleep, stress, nutrition, movement) |
| Voeding referentie | `src/data/nutrition/intake-reference.ts` |
| Voedingscheck | `src/lib/nutrition-intake-estimate.ts`, `nutrition-advice.ts`, `NutritionCapture.tsx`, `/api/intake/nutrition-log` |
| Eiwitdoel (g/dag) | `src/lib/protein-target.ts`, `/api/intake/protein-target` |
| Intake engine | `src/lib/intake-engine.ts` (`getAdvice`, `calcDomainScores`, cross-domein-balans) |
| Intervention copy | `docs/copy/interventions/nutrition.md` |
| Stepped-care model | `docs/core/STEPPED_CARE_MODEL.md` |
| Voedings-lus plan | `docs/plan/PLAN_NUTRITION_SELFEVAL_LOOP.md` |
| Meetlaag plan | `docs/plan/PLAN_MEASUREMENT_PERSONALIZATION.md` |
| Punten plan | `docs/plan/PLAN_VITALITEIT_PUNTEN_COMMUNITY.md` (Spoor A GO, Spoor B NO-GO) |
| Scheefheid-analyse | `docs/plan/ANALYSIS_PILLAR_COVERAGE.md` |
| Merk & compliance | `docs/core/BRAND_POSITIONING.md`, `docs/core/COMPLIANCE.md`, `docs/core/AFFILIATE_SYSTEM.md` |
| Evidence labels | `src/types/referenties.ts`, `src/components/content/ArticleEvidenceNiveau.tsx` |
| Approved claims / gate | `src/data/approved-claims.ts` |
| Events / meting | `src/lib/events.ts`, `src/lib/ga4.ts`, `src/lib/clarity.ts` |

---

## Prompt (copy-paste)

```text
ROL: Je bent senior product architect + voedings-/leefstijlstrateg op PerfectSupplement
(Next.js 16 App Router, TS strict, Supabase + RLS, affiliate-monetisatie).
Lees CLAUDE.md mee. Lever UITSLUITEND een ANALYSE. Geen code, geen diffs,
geen edits, geen "ik ga nu bouwen". Als je twijfelt of iets analyse of bouwen is:
het is analyse.

BIJLAGE: Dennis voegt een screenshot toe van een design mockup — tab "Aanpak",
pijlerfilter "Voeding", matrix met assen bewijsniveau (Sterk bewijs → Richtlijn)
en moeite (LAAG → HOOG), kaarten met punten ("23 pt", "BEGIN HIER"),
sidebar "Voortgang per pijler" (0/103 slaap, 0/94 voeding, etc.).
Dit is DOELVISIE — nog niet gebouwd. Behandel mockup en codebase apart.

DOEL: Brede analyse en gefaseerd plan voor een voeding-eerst "Aanpak"-ervaring:
matrix van leefstijlstappen (evidence × moeite) voor alle pijlers, met voeding
als primaire en sterkste pijler. Koppel voeding/nutriënten/wetenschap expliciet
aan slaap, stress, beweging, energie en herstel. Behoud stepped-care (makkelijkst
+ sterk bewijs eerst; moeilijker/zwakker bewijs later). Positionering: De
Consumentenbond van voeding eerst — supplementen als aanvulling. Geen medisch
advies; alleen inname-inschatting en leefstijlcoach-scope.

STRATEGISCHE INTENTIE VAN DENNIS (input, niet vaststaand besluit):
- Voeding moet in de Aanpak-ervaring het sterkst en het meest uitgewerkt staan.
- Alle leefstijlfactoren (slaap, stress, voeding, beweging, energie, herstel)
  behouden hetzelfde matrix/stappenplan-principe — niet alleen voeding.
- Wetenschap en nutriënten zijn de brug tussen pijlers (bv. eiwit → herstel;
  magnesium → slaap/stress; vezels → bloedsuiker → energie).
- Punten zijn een consistentie-signaal (geen game, geen supplement-korting).
- Meetinstrumenten voor dagelijkse geschatte voedingswaarde: welke middelen passen
  binnen scope (zelfrapport, geen diagnose), en hoe koppelen aan voeding→supplement-pad?
- Mockup = richting; jij bepaalt wat realistisch is gegeven de codebase.

CODEBASE-REALITEIT (geverifieerd, neem dit als waar aan):

1) Mockup vs. wat er is:
   - GEEN matrix-UI, GEEN tab "Aanpak", GEEN punten-currency in productie.
   - /inzichten = content-hub (artikelen/kennisbank), geen interventiematrix.
   - Dashboard tabs: vandaag / voortgang / hermeting (src/components/dashboard/Dashboard.tsx).
   - Scoring-logica WEL: composite = (mechanisme × onderbouwing × veiligheid) / moeite
     (src/lib/content/intervention-scoring.ts). Ranking, geen 2D-visualisatie.
   - PlanContentSection.tsx (stepped-care tier-lijst) bestaat maar is nergens geïmporteerd.
   - "Begin hier"-patroon bestaat in FocusAreaCard.tsx, niet op matrix-kaarten.

2) Zes pijlers — twee rollen (src/lib/domain-role.ts):
   - Intervention (stuurbare): slaap, stress, voeding, beweging.
   - Readout (uitkomst): energie ← slaap/voeding/beweging; herstel ← slaap/beweging/stress.
   - Dashboard toont 6 pijlers; vitaliteit-index = 5 facetten (slaap, stress, voeding,
     beweging, herstel) — energie zit NIET in vitaliteit (model-inconsistentie, zie
     PLAN_VITALITEIT_PUNTEN_COMMUNITY.md §2).

3) Voeding — wat live is:
   - nutrition_score uit 2 intake-vragen (NUT_O3, NUT_PROT) — grof.
   - Voedingscheck /intake/voeding: 6 frequentievragen → bands below/around/meets per
     nutriënt → buildNutritionAdvice (lifestyle eerst, dan gegate supplement).
   - intake-reference.ts: 5 nutriënten (eiwit, omega-3, magnesium, vit D, zink) met
     lifestyleAction + comparisonPath; drempels indicatief/TODO.
   - intake_intake_log + delta (PLAN_NUTRITION_SELFEVAL_LOOP.md F0–F3 live).
   - protein-target.ts: g/dag eiwit op gewicht + training (aparte consent).
   - 12-weken voedingsplan: src/data/lifestyle-plans/nutrition.ts.
   - KRITIEKE GAP: buildNutritionAdvice is NIET gekoppeld aan getAdvice() —
     twee parallelle adviesketens. Voedingslog werkt niet terug naar nutrition_score.

4) Mockup-stappen vs. data:
   - Mockup toont o.a.: "Meer vezels (30 g/dag)", "Minder sterk bewerkte voeding",
     "Mediterraan eetpatroon", "Eiwitten op peil (1,6 g/kg)", "Groente bij elke maaltijd",
     "Tijdvenster eten (12:12)", "Bewust kauwen & langzaam eten".
   - In codebase: eiwit-per-maaltijd, vette vis, voedingslog in nutrition plan +
     intervention seeds (docs/copy/interventions/nutrition.md). Vezels, mediterraan,
     tijdvenster, kauwen: NIET in intake-reference of lifestyle-plan.

5) Stepped-care backend (STEPPED_CARE_MODEL.md):
   - Tier 1 gratis actie → tier 2 meten → tier 3 supplement → tier 4-5 betaald/referral.
   - match-interventions.ts + evidence_claims in DB; seeds voor sleep/stress/nutrition/movement.
   - Tier 2 scope: self-report inname (PAL/BMR/TDEE) — gepland, niet gebouwd.
   - Tier 4-5 bloedwaarden: referral-only, geen opslag.

6) Cross-pijler (intake-engine.ts):
   - 11+ kruisregels live (magnesium↔slaap/stress, protein_gap↔beweging/herstel, etc.).
   - enforceCrossDomainBalance: supplement-advies vereist quick-win uit ander domein.
   - K1–K6 uit ANALYSIS_PILLAR_COVERAGE.md deels nog niet als engine-regels.

7) Punten (alleen ontwerp — PLAN_VITALITEIT_PUNTEN_COMMUNITY.md):
   - Spoor A: punten → leefstijl-unlock/verdieping = GO (on-brand).
   - Spoor B: punten → supplementkorting/cashback = NO-GO (botst met Consumentenbond).
   - points_ledger: niet gebouwd. Mockup-punten ("23 pt", "0/94") = nieuw concept.

8) Meetlaag (PLAN_MEASUREMENT_PERSONALIZATION.md — ontwerp):
   - PAL via bewegingsvragen; BMR Mifflin-St Jeor; TDEE; macro g/kg; micro vs ADH/DRV.
   - Output altijd inname-inschatting, nooit status/tekort (COMPLIANCE.md).
   - Geen grammen-dagboek in productie; geen externe app-integratie.

9) Affiliate & content-scheiding:
   - /beste/* = aparte commerciële as; affiliate NOOIT in content/matrix-uitleg.
   - Alleen stoffen met approved-claims + comparisonPath krijgen supplement-pad.
   - Arctic Blue direct (sld=dennisvanwestbroek); niet vervangen door Daisycon.

10) Scheefheid-risico (ANALYSIS_PILLAR_COVERAGE.md):
    - Alleen voeding heeft harde referentiewaarde → trekt advies naar supplement-CTA.
    - Tegenmaatregel: cross-domein-balansregel (deels live in getAdvice).
    - Matrix mag dit versterken (transparantie) of verergeren (visuele nadruk op punten
      bij voeding) — analyseer beide kanten.

LEVER DEZE ANALYSE (en niets anders):

A. Mockup vs. codebase — eerlijke inventarisatie:
   - Wat uit de screenshot conceptueel al bestaat (scoring, plans, voedingscheck)?
   - Wat is volledig nieuw (matrix-UI, punten, pijler-voortgangsbalken)?
   - Waar verliest de gebruiker nu het pad (twee adviesketens, orphan PlanContentSection)?
   - Score de mockup-visie op: merkfit, compliance-risico, implementatiehaalbaarheid,
     differentiatie t.o.v. concurrenten (1-5 elk).

B. Voeding als primaire pijler — positionering & IA:
   - Waar hoort "Aanpak" thuis: dashboard-tab, /inzichten-subtab, /intake/plan/*,
     of nieuwe route? Varianten met voor/tegen.
   - Hoe maakt voeding visueel en inhoudelijk de lead zonder andere pijlers te demoten?
   - Relatie matrix (overzicht/exploratie) vs. LifestylePlan (weekplan/afvinken) vs.
     stepped-care trap (tier 1→2→3).
   - Één IA-aanbeveling met onderbouwing.

C. Nutriënten-gap-analyse — wat mist nu:
   - Huidige 5 nutriënten vs. mockup-stappen: wat ontbreekt, wat is bewust buiten scope?
   - Welke mockup-stappen zijn leefstijl-patroon (vezels, mediterraan) vs. nutriënt-specifiek?
   - nutrition_score (2 vragen) vs. voedingscheck (6 vragen) vs. geplande tier-2 (mg/ADH):
     waar zit de waarheid, waar ontstaat verwarring?
   - Prioriteitenlijst: welke stoffen/stappen eerst toevoegen — gekoppeld aan approved-claims
     en /beste/*-dekking. Creatine, B12, ijzer: wel/niet en waarom?
   - Welke referentiebronnen (Gezondheidsraad ADH, EFSA DRV) zijn nodig vóór live getallen?

D. Puntenstelsel — koppeling aan voeding & matrix:
   - Hoe vertaal je mockup-punten ("23 pt") naar intervention-scoring of een nieuw model?
   - Formule-voorstel: punten per stap = f(mechanisme, onderbouwing, moeite) — concreet.
   - Pijler-voortgang "0/94 voeding": max punten, earned vs. available, unlock-logica.
   - Spoor A (gedrag belonen) vs. Spoor B (aankoop belonen): GO/NO-GO per mechanisme.
   - Anti-gamification: copy en UX die "consistentie-signaal" communiceren, geen leaderboard.
   - Hoe voorkom je dat punten de scheefheid naar supplementen versterken?

E. Meetinstrumenten — dagelijkse geschatte voedingswaarde (niet-medisch):
   Vergelijk minimaal drie lagen:
   (1) PSF-native: voedingscheck (frequentiebanden) — live.
   (2) PSF-gepland: PAL/BMR/TDEE + macro/micro vs RI — tier 2 ontwerp.
   (3) Extern: voedingsapps (MyFitnessPal, Cronometer, Lifesum), wearables, papieren dagboek.
   Per instrument: nauwkeurigheid vs. inspanning, privacy/AVG, compliance-risico (status-taal),
   integratiepad (API/import/handmatig/geen koppeling — aanbeveling).
   Bloedwaarden: expliciet referral-only; wanneer vermelden als optie zonder medische claim?
   Eiwitdoel (protein-target, g/dag): hoe past dit in de meet-stack?
   Aanbeveling: minimale meet-stack voor MVP + uitbreidingspad.

F. Cross-pijler-koppeling — voeding als hub:
   - Map concrete voedingsinterventies naar sibling-pijlers en readouts (energie, herstel).
   - Welke bestaande engine-kruisregels versterken de matrix; welke ontbreken (K1–K6)?
   - Conceptueel datamodel: crossPillarLinks / tags op matrix-kaarten — voorbeelden.
   - Hoe toon je in de UI dat slaap/stress/beweging voeding beïnvloeden en omgekeerd,
     zonder overweldigende complexiteit?
   - Hoe handhaaf je de cross-domein-balansregel in een matrix-context?

G. Matrix-UX voor alle pijlers — evidence × moeite:
   - Mapping evidence-niveaus (Sterk/Gerandomiseerd/Observationeel/Richtlijn) naar
     score_onderbouwing 1–5 en bestaande referentie-types (src/types/referenties.ts).
   - Mapping moeite (LAAG 1-2 / GEMIDDELD 3 / HOOG 4-5) naar score_moeite.
   - "BEGIN HIER"-logica: welke stap krijgt de tag (composite, personalisatie, laagste moeite)?
   - Fasering: voeding-matrix eerst (volledige content); andere pijlers; energie/herstel
     als readout-overlay ("binnenkort" in mockup — verdedigbaar ja/nee).
   - Mobiel-eerst (375px): wat ziet de gebruiker eerst op de matrix?

H. Food-first → supplement-bridge:
   - End-to-end pad per matrix-stap: lifestyle actie → meten/voedingscheck → delta →
     wanneer /beste/* (tier 3)?
   - EFSA-gate, isComparisonAllowed, nutritionSupplementGate — waar in de flow?
   - Turbo-snippet: matrix-kaart → /inzichten-artikel → vergelijking (geen affiliate in content).
   - Decision tool "voeding-eerst" (horizon CURRENT_SPRINT.md): past dit in de matrix?
   - Hoe blijft "Consumentenbond van supplementen" geloofwaardig als voeding het sterkst is?

I. Fasering, risico's & meetpunten:
   - Geordende roadmap Fase 0..n: doel, afhankelijkheid, definition of done.
   - Blokkeerders: vitaliteit/energie-modelbeslissing, voedingslog→getAdvice-merge,
     referentiecijfers review, content voor niet-voedings-matrix.
   - Top 5 risico's + open vragen voor Dennis.
   - Meetpunt per nieuwe CTA/verbinding (hergebruik vóór nieuw):
     measurement.gap_detected, plan.step_state_changed, intake.cta_to_nutrition_log,
     affiliate.click; GA4 trackEvent + Clarity clarityTag (geen PII);
     nieuw client-event alleen met 3 registratieplekken (events.ts +
     intake-events-client.ts + /api/intake/events/route.ts allowlist).

J. Visie-synthese — waar kan dit heen?
   - Beschrijf het eindbeeld in 2-3 alinea's: hoe voelt de Aanpak-ervaring over 12 maanden?
   - Wat maakt dit de "Consumentenbond van voeding + leefstijl" i.p.v. een supplement-quiz?
   - Wat bouw je bewust NIET (scope-afbakening)?

FORMAAT: beknopt, kopjes + bullets, geen tabellen langer dan nodig. Nederlands.
Geen code. Sluit af met: "Aanbeveling: <de ene volgende stap die ik zou nemen>".
```

---

## Na de analyse

1. Bewaar Claude's output (bijv. `docs/analyse/voeding-aanpak-matrix-analyse.md`).
2. Kies één fase uit sectie I als aparte implementatie-opdracht (Cursor-prompt).
3. Blokkeerders: IA-keuze (sectie B), nutriënten-prioriteit (sectie C) en meet-stack (sectie E) vóór matrix-UI bouwen.

*Prompt versie: juni 2026 — voeding-eerst Aanpak-matrix, nutriënten, punten & cross-pijler-koppeling.*
