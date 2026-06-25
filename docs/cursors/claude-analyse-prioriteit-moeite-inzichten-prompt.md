# Prompt — Prioriteit × moeite in Inzichten, domein-categorieën, wearables & vitaliteit/punten (PerfectSupplement)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude in VS Code. Claude levert **alleen analyse** (A t/m K), geen code. Voeg optioneel toe: `CLAUDE.md`, `docs/core/BRAND_POSITIONING.md`, `docs/plan/PLAN_VITALITEIT_PUNTEN_COMMUNITY.md`, `docs/core/COMPLIANCE.md`.

---

## Waarom deze prompt

Dennis wil de **Aanpak-/Inzichten-ervaring** herontwerpen rond **prioriteit en moeite** — niet rond bewijsniveau/evidence in de UI. Per leefstijldomein (slaap, stress, voeding, beweging, energie, herstel) moet je **prioriteit per categorie** kunnen zien: bv. slaap → biologische klok, HRV, rusthartslag; beweging → krachttraining, cardio/conditie (wandelen, hardlopen, fietsen).

Prioriteit komt uit **twee bronnen**, apart zichtbaar:
1. **Leefstijlcheck** (intake, domein-check-ins, zelfrapportage)
2. **Wearable** (HRV, rustpols, slaapduur — nu shell "binnenkort")

Daarbovenop een **puntenstelsel** gekoppeld aan vitaliteit — met uitleg in dashboard én inzichten: wat is vitaliteit, hoe werken punten, en hoe ondersteunt het product **autonomie, verbinding, competentie** en andere psychologische basisbehoeften (SDT-achtig, zonder therapeutische claims).

| Richting | Staat nu | Gap |
|----------|----------|-----|
| **Prioriteit × moeite (geen evidence-UI)** | Composite scoring in backend (`intervention-scoring.ts`) | Geen matrix/UI; evidence-labels alleen in content (`referenties.ts`) |
| **Categorieën per domein** | Geen unified taxonomie | Intake-vragen per pijler, geen subcategorieën (biologische klok, kracht, cardio) |
| **Prioriteit in /inzichten** | Hub filtert op 6 pijlers + content-type | Geen prioriteitsweergave, geen categorie-filter, geen personalisatie-laag |
| **Wearable-prioriteit** | `SIGNALS` shell (HRV, rustpols, slaapduur) `binnenkort` | Geen OAuth, geen data; `FacetSource = "wearable"` in vitaliteit.ts ongebruikt |
| **Punten + uitleg** | Alleen plan-doc | Geen `points_ledger`, geen publieke `/vitaliteit`-pagina |
| **SDT (autonomie/verbinding/competentie)** | Copy in `about.ts`, connection in pyramid | Niet gemeten, niet in dashboard/inzichten, geen productmechanisme |

---

## Prompt (copy-paste)

```text
ROL: Je bent senior product architect + gedrags-/leefstijlstrateg op PerfectSupplement
(Next.js 16 App Router, TS strict, Supabase + RLS).
Lees CLAUDE.md mee. Lever UITSLUITEND een ANALYSE. Geen code, geen diffs,
geen edits, geen "ik ga nu bouwen".

DOEL: Brede analyse en gefaseerd plan voor een Inzichten-/Aanpak-ervaring gebaseerd op
PRIORITEIT × MOEITE (niet bewijsniveau/evidence in de UI). Per leefstijldomein moeten
categorieën zichtbaar zijn met hun prioriteit. Prioriteit uit leefstijlcheck en wearable
moeten apart zichtbaar zijn. Een puntenstelsel op vitaliteit moet worden ontworpen én
uitgelegd (dashboard + inzichten). Inclusief: wat vitaliteit betekent, en hoe het product
autonomie, verbinding, competentie en psychologische basisbehoeften ondersteunt — zonder
therapeutische of medische claims.

STRATEGISCHE INTENTIE VAN DENNIS (input, niet vaststaand besluit):
- GEEN evidence/bewijsniveau als primaire as in Inzichten (geen "Sterk bewijs",
  "Gerandomiseerd" etc. in de gebruikers-UI). Evidence blijft achter de schermen /
  in content waar het hoort.
- WEL: prioriteit (wat nu het meest aandacht vraagt) × moeite (hoe zwaar de stap is).
- Per domein subcategorieën — voorbeelden:
  · Slaap: biologische klok, HRV, rusthartslag, slaapduur, inslaap/doorslapen
  · Beweging: krachttraining, cardio/conditie (wandelen, hardlopen, fietsen), dagelijkse activiteit
  · Stress: herstelmomenten, ademhaling, mentale belasting
  · Voeding: eiwit, vetzuren, vezels, ritme — gekoppeld aan voeding-eerst
  · Energie/herstel: als readout-pijlers, niet als losse "pillen-first"-route
- Twee prioriteitsbronnen, apart tonen:
  (A) Leefstijlcheck + check-ins + zelfrapportage
  (B) Wearable-signalen (HRV, rustpols, slaapduur) — bevestiging/trend, geen diagnose
- Punten: consistentie-signaal gekoppeld aan vitaliteit — uitlegbaar, geen game,
  geen supplement-korting (Consumentenbond-positionering).
- Psychologische basis: autonomie, verbinding, competentie (+ relevante SDT-principes)
  moeten productmatig worden ondersteund — niet alleen als copy op /over-ons.

CODEBASE-REALITEIT (geverifieerd, neem dit als waar aan):

1) /inzichten vandaag (src/app/inzichten/page.tsx):
   - Content-hub: blog + kennisbank in één feed.
   - Filters: 6 pijlers (slaap/energie/stress/voeding/beweging/herstel) + type
     (artikel/deepdive/begrip). Geen prioriteit, geen moeite, geen categorie-filter.
   - FocusAreaCard: 1 link per kaart → ?pijler=; highlight = prioriteitspijler uit
     bezoeker-context (inzichten-visitor-context.ts).
   - InsightItem heeft metadata (theme, planPhase, gapSignal) — niet zichtbaar in UI.
   - GEEN Aanpak-tab, GEEN matrix, GEEN punten.

2) Prioriteit vandaag — waar het wél leeft:
   - Dashboard tab "Vandaag": prioriteitspijler, VitalityRing, getVitalityExplainer
     (vitality-explainer.ts → 3 regels).
   - vitality-habit-kernel.ts: prioriteitspijler → zwakste intake-vraag → driver-habit.
   - primary-theme.ts / reveal-model: laagste gemeten pijler = prioriteit.
   - domain-role.ts: intervention (slaap/stress/voeding/beweging) vs readout
     (energie/herstel met READOUT_DRIVERS).
   - Prioriteit is NU één getal per pijler (0–100), geen prioriteit per subcategorie.

3) Moeite vandaag:
   - intervention-scoring.ts: score_moeite 1–5 in DB/composite formule.
   - Niet zichtbaar in inzichten of dashboard voor eindgebruiker.
   - Lifestyle-plan stappen hebben tags (eiwit, ritme) maar geen moeite-label in UI.

4) Evidence (bewust NIET de UI-as die Dennis wil):
   - referenties.ts + ArticleEvidenceNiveau.tsx: evidence voor artikelen.
   - intervention-scoring.ts: score_onderbouwing = evidence in backend.
   - Dennis wil dit NIET als primaire Inzichten-as — analyseer hoe evidence intern
     blijft (ranking, content) terwijl de UI prioriteit×moeite toont.

5) Categorie-/subcategorie-structuur — ontbreekt unified:
   - Intake: 7 categorieën in intake-questions.ts (incl. leefstijl LIF_*).
   - Dashboard: 6 pijlers, geen subcategorieën.
   - Pyramid: 5 lifestyle incl. connection — niet gescoord, niet in inzichten.
   - Lifestyle plans: 4 domeinen, stappen met tags, geen formele taxonomie.
   - SIGNALS (dashboard/index.ts): hrv, rustpols, slaapduur — wearable, binnenkort.
   - Geen mapping: biologische klok ↔ SLP_CONS/SLP_ONSET; kracht ↔ MOV_STR;
     cardio ↔ MOV_CARD — wel impliciet in vragen, niet als categorie-entiteit.

6) Wearables:
   - Dashboard SignalsSection: UI-shell, badges "binnenkort", geen data/API.
   - vitaliteit.ts: FacetSource "wearable" + biometrics placeholder (void).
   - Geen vendor-koppeling (Oura/Garmin/Apple Health).
   - Copy: "bevestiging van trends", geen klinische normen.

7) Vitaliteit:
   - computeVitaliteit: gemiddelde van 5 facetten (slaap, stress, voeding, beweging,
     herstel) — energie NIET in index; herstel WEL (model-inconsistentie vs domain-role).
   - Geen publieke /vitaliteit-uitlegpagina (PLAN_VITALITEIT_PUNTEN_COMMUNITY P0).
   - score-display.ts: banden Sterk/Voldoende/Aandacht/Prioriteit — geen percentielen.

8) Punten (alleen ontwerp — PLAN_VITALITEIT_PUNTEN_COMMUNITY.md):
   - points_ledger: niet gebouwd.
   - Spoor A: punten → leefstijl-unlock = GO.
   - Spoor B: punten → supplementkorting = NO-GO.
   - Anti-gamification: consistentie-signaal, doelgroep 40+.

9) SDT / psychologische basis:
   - about.ts noemt autonomie, verbinding, competentie in één alinea.
   - foundation-pyramid.ts: connection-pijler — niet gemeten, geen inzichten-pijler.
   - Geen productmechanisme dat autonomie/competentie/verbinding meet of versterkt.

10) Compliance:
    - Geen medische claims, geen diagnose, geen status-taal bij wearables.
    - art. 9 AVG: domain_scores/profile_label niet delen in community/punten.
    - KOAG: geen leeftijds-percentielen in publieke vitaliteitsuitleg.

LEVER DEZE ANALYSE (en niets anders):

A. Paradigmaverschuiving — van evidence naar prioriteit × moeite:
   - Waarom is prioriteit×moeite beter passend bij Inzichten dan evidence×moeite?
   - Hoe map je bestaande score_moeite (1–5) naar gebruikers-taal (LAAG/GEMIDDELD/HOOG)?
   - Hoe bepaal je prioriteit per categorie (niet alleen per pijler)?
     Bronnen: laagste intake-antwoord, gap-signalen, wearable-afwijking van baseline,
     readout-drivers, cross-pijler-regels.
   - Hoe blijft evidence intern bruikbaar zonder de UI te domineren?
   - Risico's: verwarring met bestaande content-evidence-labels; oversimplificatie.

B. Taxonomie — domein × categorie:
   - Stel per leefstijldomein een categorielijst voor (minimaal 3–5 per domein).
     Gebruik Dennis' voorbeelden + wat uit intake-vragen/logisch volgt.
   - Welke categorieën zijn meetbaar via leefstijlcheck, welke via wearable, welke beide?
   - Energie en herstel: categorieën als readout of als eigen domein?
   - Connection/verbinding: aparte categorie-as of onderdeel van stress/slaap?
   - Datamodel-voorstel (conceptueel): Domain → Category → Step/Insight, met
     priorityScore, effortLevel, source (self_report | wearable | blended).

C. Inzichten — nieuwe informatiearchitectuur:
   - Hoe ziet de hub eruit met prioriteit per domein én categorie?
   - Filters: pijler + categorie + prioriteit-band + moeite — wat is MVP vs. later?
   - Hoe relateren content-items (artikel/begrip) aan categorieën zonder overload?
   - Twee prioriteitsbronnen apart tonen: "uit je check" vs. "uit wearable" —
     UI-patroon, copy, wanneer ze divergeren.
   - Relatie Inzichten (content + prioriteitsoverzicht) vs. Dashboard (actie/habit)
     vs. Aanpak (stappenplan) — wie doet wat?
   - Één IA-aanbeveling.

D. Wearable-prioriteit — scope en integratie:
   - Minimale wearable-set voor MVP: HRV, rustpols, slaapduur — volstaat dat?
   - Hoe vertaal je wearable-data naar categorie-prioriteit zonder klinische normen?
     (trend t.o.v. eigen baseline, niet "te laag/te hoog".)
   - Integratiepaden: OAuth vendor, Apple Health export, handmatige invoer — voor/tegen.
   - Gewicht wearable vs. zelfrapportage in blended prioriteit — voorstel.
   - Compliance/DPIA-randvoorwaarden.

E. Vitaliteit — wat het is en hoe het uit te leggen:
   - Modelbeslissing: 4-facet (excl. readouts) vs. 5-facet (huidig) vs. 6-facet —
     aanbeveling met onderbouwing voor uitlegbaarheid.
   - Publieke uitleg (/vitaliteit) + ingelogde variant (dashboard ring): wat staat waar?
   - Copy-richting: wat vitaliteit WEL en NIET betekent (geen diagnose, geen percentiel).
   - Hoe koppelt vitaliteit aan categorie-prioriteiten en aan punten?
   - Hoe leg je readout-pijlers (energie/herstel) uit zonder het model te breken?

F. Puntenstelsel — ontwerp en uitleg:
   - Formule-voorstel: punten verdienen (check-in, stap voltooid, hermeting, consistentie)
     vs. punten als gewicht per stap (mockup "23 pt" — past dat nog bij dit model?).
   - Relatie punten ↔ vitaliteit ↔ prioriteit — één verhaal, geen drie waarheden.
   - Waar leg je het uit: dashboard-widget, /vitaliteit, inzichten-sectie "Hoe werken punten?"
   - Spoor A unlocks vs. Spoor B — GO/NO-GO.
   - Anti-gamification en doelgroep 40+.

G. Psychologische basisbehoeften — autonomie, verbinding, competentie:
   - Vertaal SDT-principes naar productmechanismen (niet therapie):
     · Autonomie: keuze in stappen, geen opgelegd supplement-first pad
     · Competentie: zichtbare voortgang, delta, "je leert je lichaam lezen"
     · Verbinding: connection-pijler, cohort ("mannen zoals jij"), delen zonder health-data
   - Welke bestaande features dragen dit al (check-ins, delta-rapport, nurture)?
   - Wat ontbreekt productmatig?
   - Hoe meet je of het werkt zonder art. 9-data te exposen?
   - Grens: leefstijlcoach vs. psycholoog — wat doe je bewust NIET?

H. Cross-pijler — prioriteit niet isoleren:
   - Hoe toon je dat lage HRV (slaap-categorie) prioriteit geeft aan stress-herstel?
   - Bestaande engine-kruisregels (intake-engine.ts) — hoe in categorie-prioriteit gieten?
   - Voeding-eerst + cross-domein-balansregel — blijft die gelden in het nieuwe model?

I. Content & SEO — inzichten als evidence-laag zonder evidence-UI:
   - Hoe blijven artikelen (biologische klok, HRV, krachttraining) gekoppeld aan
     categorie-prioriteit zonder evidence als UI-as?
   - Turbo-snippet: categorie met hoge prioriteit → relevant artikel → actie/check-in.
   - Affiliate-scheiding: geen commercie in prioriteits-overzicht.

J. Fasering, risico's & meetpunten:
   - Roadmap Fase 0..n: taxonomie → inzichten-IA → dashboard-uitleg → punten MVP →
     wearable-fase.
   - Blokkeerders en afhankelijkheden.
   - Top 5 risico's.
   - Meetpunten (hergebruik focus_area_click, dashboard.vitality_scored,
     measurement.checkin_completed; nieuwe events met 3-registratieplekken;
     GA4 + Clarity, geen PII).

K. Visie-synthese:
   - Hoe voelt Inzichten over 12 maanden voor een ingelogde gebruiker?
   - Wat maakt dit meer dan een content-feed met scores?
   - Scope-afbakening: wat bouw je bewust niet?

FORMAAT: beknopt, kopjes + bullets, geen tabellen langer dan nodig. Nederlands.
Geen code. Sluit af met: "Aanbeveling: <de ene volgende stap die ik zou nemen>".
```

---

## Na de analyse

1. Bewaar Claude's output (bijv. `docs/analyse/prioriteit-moeite-inzichten-analyse.md`).
2. Blokkeerders: taxonomie (sectie B) en vitaliteit-modelbeslissing (sectie E) vóór punten-UI.
3. Kies één fase als implementatie-opdracht (Cursor-prompt).

*Prompt versie: juni 2026 — prioriteit × moeite, domein-categorieën, wearables, vitaliteit & punten.*
