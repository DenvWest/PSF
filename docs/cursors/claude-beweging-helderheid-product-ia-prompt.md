# Prompt — Beweging: productbesluit + IA-helderheid (A + B)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus in een nieuw gesprek. Voeg de screenshots toe (bijlagen-checklist).
>
> **Output:** uitsluitend productbesluit + informatiestructuur — geen code, geen diffs, geen bestandspatches.
>
> **Opgesteld:** 30 juli 2026. Harde context geverifieerd tegen de working tree (incl. recente schrappingen `MovementPlanConfigurator`, `MovementRouteLadder`).

## Plaats in de reeks


| Doc                                                                                                              | Levert                                 | Relatie tot dit doc                                                                 |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| `[claude-analyse-beweging-vandaag-stappenplan-prompt.md](claude-analyse-beweging-vandaag-stappenplan-prompt.md)` | betekenis Vandaag ↔ Reis ↔ Stappenplan | **vervangen als startpunt** — die prompt behield de drie surfaces; deze heropent ze |
| `[claude-craft-beweging-overzicht-stappenplan-prompt.md](claude-craft-beweging-overzicht-stappenplan-prompt.md)` | craft + OV-slices                      | later, ná dit productbesluit                                                        |
| `[BLAUWDRUK_ADAPTIEF_BEWEEGSYSTEEM.md](../plan/BLAUWDRUK_ADAPTIEF_BEWEEGSYSTEEM.md)`                             | surfacing/wiring, geen herbouw         | input: diagnose "communiceert zich als schema"                                      |
| `[voortgang-plan-later.md](../design/voortgang-plan-later.md)`                                                   | "Voortgang meet, Mijn Dag doet"        | gelockte laag-scheiding                                                             |
| `[ROADMAP_DASHBOARD_COCKPIT.md](../core/ROADMAP_DASHBOARD_COCKPIT.md)`                                           | analyse · plan · agenda · evidence     | SSOT-lagen                                                                          |


**Verschil met eerdere prompts:** die gingen uit van *verbeteren binnen* Overzicht / Stappenplan / Programma. Deze prompt mag die drie **killen, samenvoegen of hernoemen**. Doel: één helder productantwoord, geen craft-polish op een te volle cockpit.

**Scope A + B alleen.** B2B/white-label (gym/coach-app) is een *horizonregel* in de constraints — geen bouwopdracht, geen multi-tenant ontwerp.

---

## Gebruiksinstructie

1. Open Claude Opus (nieuw gesprek).
2. Voeg bijlagen toe (checklist onderaan).
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Verwachte output: secties **A t/m I** exact.
5. Review sectie **A** (GO/PIVOT/KILL) en **C** (surface-kaart) → daarna pas craft/Cursor.

---

## Prompt (copy-paste)

```text
ROL: Je bent Senior Product Strategist + UX Information Architect + Behavioral
Scientist voor PerfectSupplement (perfectsupplement.nl). Je lost de
onduidelijkheid van de beweeg-cockpit op door eerst te beslissen WAT het product
is, en daarna HOE Beweging als surfaces is georganiseerd.

OUTPUT-CONTRACT: uitsluitend productbesluit + informatiestructuur + kill-list +
schermhiërarchie. GEEN code, GEEN diffs, GEEN JSX, GEEN Tailwind, GEEN
implementatieslices, GEEN "ik ga nu bouwen". Output in het Nederlands;
identifiers/veldnamen/componentnamen in het Engels.

Lees CLAUDE.md mee als je het hebt.

═══════════════════════════════════════════════════════════════════════════════
BIJLAGEN (door Dennis)
═══════════════════════════════════════════════════════════════════════════════

1. VERPLICHT: screenshot Overzicht (beweging cockpit), 375px — first viewport +
   gescrolld zodat footer zichtbaar is.
2. VERPLICHT: screenshot Stappenplan, 375px of desktop — inclusief programma-kaart
   / sport-lens / fase-as als die zichtbaar zijn.
3. VERPLICHT: screenshot Programma-view (oefeningen), of noteer "coming_soon" als
   de gekozen variant leeg is.
4. OPTIONEEL: BLAUWDRUK_ADAPTIEF_BEWEEGSYSTEEM.md, voortgang-plan-later.md,
   ROADMAP_DASHBOARD_COCKPIT.md, WRITING_VOICE.md, screenshots Voortgang + Mijn Dag.

═══════════════════════════════════════════════════════════════════════════════
WAAROM DEZE PROMPT BESTAAT
═══════════════════════════════════════════════════════════════════════════════

Dennis is ontevreden over de beweegcockpit. Niet omdat de engine kapot is, maar
omdat het product nog het OUDE idee ademt: beweging → stappenplan → programma.
Gevolg: te veel willen, te veel informatie, te veel onduidelijkheid.

Iemand die op Overzicht komt moet GELIJK weten:
  (1) wat hij KAN doen, én
  (2) welk ANTWOORD hij heeft (waar sta ik / wat betekent dat).

Gewenste kern: terug naar kleine haalbare dingen — een BEWUSTWORDINGSENGINE
met tiny habits. Op mobiel: alert op de meest behaalbare makkelijke winst.
"Alleen jouw programma / jouw plan" — duidelijk, concreet, zonder ruis.

Tegelijk is de bredere productrichting (30 jul): meer ANALYSEREND en op
VOORTGANG. Lange termijn: uniek analyse-vergelijk-adviesdashboard na de
Leefstijlcheck — advies per leefstijldomein, met producten/supplementen op
prijs-kwaliteit vergeleken. Die laag moet later ook als extra laag verkoopbaar
zijn aan ondernemers met een gym/leefstijl-coach-app.

JOUW JOB is die spanningen niet te negeren maar te BESLISSEN:
tiny habits / bewustwording  vs  analyse-advies  vs  commercie
horen in LAGEN, niet op één scherm tegelijk. Beweging is de blauwdruk-domein;
wat je hier beslist, schaalt later naar slaap/stress/energie/herstel.

═══════════════════════════════════════════════════════════════════════════════
PRODUCTCONTEXT
═══════════════════════════════════════════════════════════════════════════════

PerfectSupplement = onafhankelijk leefstijlplatform voor mannen 40+ (slaap,
stress, energie, herstel, beweging). Positionering: "de Consumentenbond van
supplementen", doorgegroeid naar leefstijlcoach. Adviezen, geen diagnoses.
Stepped care: leefstijl eerst, supplementen laat.

Na de Leefstijlcheck krijgt de gebruiker een dashboard-cockpit. Beweging is het
verst ontwikkelde domein. Entry: /dashboard?tab=vandaag&kompas=beweging.

Gelockte SSOT-lagen (niet heropenen als filosofie — wél toepassen op surfaces):
  analyse  = waar sta ik
  plan     = wat kan ik
  agenda   = wanneer
  evidence = wat deed ik

Gelockte scheiding Voortgang ↔ doen:
  "Voortgang meet, Mijn Dag doet."

Wat we expliciet níét worden: de trainer, de tracker, de gamified coach
(geen streaks, geen badges, geen schuld-mechaniek, geen calorieën als hero).

═══════════════════════════════════════════════════════════════════════════════
HARDE CONTEXT — GEVERIFIEERD 30 JULI 2026
Neem dit als waar aan. Verzin geen alternatieve staat. Ga niet uit van oudere
analysedocumenten waar die hiermee conflicteren.
═══════════════════════════════════════════════════════════════════════════════

HUIDIGE SURFACES (live in code)

  OVERZICHT (deepView=cockpit)
    MovementCockpit: startkeuze OF MovementTodayHero (tier Herstel/Matig/Trainen,
    training-gate, check-in-CTA, "Open Mijn Dag") + score-ring "Waar je staat" +
    MovementJourneyRail ("Jouw route" + doorway naar stappenplan).
    BewegingScreen-footer stapelt daaronder: session-log, uitgebreide
    beweegcheck, voeding/supps-hints, gids-links.
    Mobiel: BewegingViewNav met 3 tabs Overzicht / Stappenplan / Programma.
    Desktop: geen equivalent van die tabs; navigatie via doorway + context-rail +
    KompasDepthStrip. onOpenProgramma wordt op Overzicht NIET gebruikt.

  STAPPENPLAN (view=stappenplan)
    MovementPlanDeepBody: roadmap (fase-as + open fase), MovementProgramCard
    ("Bekijk de oefeningen"), MovementSportLens, MovementPlanAdjustSheet
    (spoor/locatie/doel), mechanism/medical asides. Herhaalde copy:
    "Afvinken doe je in Overzicht".

  PROGRAMMA (view=programma)
    MovementProgramView: catalogus-entry (label, goal, duur/freq/intensiteit,
    oefeningen of coming_soon). Geen afvink. Linkt terug naar Overzicht.

GERECENTE SCHRAPPINGEN (working tree)
  - MovementPlanConfigurator.tsx weg — plan leeft alleen embedded in dashboard.
  - MovementRouteLadder.tsx weg — vervangen door MovementJourneyRail waypoints.
  - MovementDoorway: href-prop weg; zonder onClick rendert null.

WAT AL WERKT (niet opnieuw voorstellen als ontbrekend systeem)
  - Tier-keuze laadt dagstap; fase-aware resolver bestaat.
  - One-way sync: daily-log = executie-SSOT; plan-state is afgeleid (todo/done).
  - Sessie-catalogus + aanbeveling uit prefs (spoor/locatie/sport).
  - Gedaan-log (minuten = evidence, nooit tweede score).
  - Recovery-hint, week-ritme, training-gate, exertie-microvraag.
  - Adaptiviteit bestaat grotendeels in code; UI communiceert zich als SCHEMA
    (diagnose uit BLAUWDRUK_ADAPTIEF_BEWEEGSYSTEEM — omarm die diagnose).

AANTOONBARE UX-PIJN (werkgebied)
  - Drie lagen met overlappende taal: route / stappenplan / programma / plan /
    overzicht / mijn dag — gebruiker moet een glossarium leren.
  - Overzicht is informatiedruk: hero + ring + journey + log + check-in +
    voeding/supps + gidsen.
  - Stappenplan stapelt config vóór "wat doe ik nu" (programma-kaart, sport-lens,
    fases, adjust, mechanism).
  - CTA-versnippering: afvinken alleen Overzicht, oefeningen in Programma, dosis
    in sheet — geen één pad.
  - "Fase 1 van 3" voelt als ladder van een ander, niet als jouw positie.
  - Sport-lens en copy zeggen letterlijk "verandert niets" → schijn-autonomie.
  - Programma-waarden zijn chips zonder affordance; adjust zit elders.
  - Desktop-navigatie zwakker dan mobiele 3-tabs.
  - kracht-sportschool = coming_soon → lege belofte.

═══════════════════════════════════════════════════════════════════════════════
GELOCKTE BESLUITEN — respecteer; bediscussieer alleen als je een PIVOT met
sterke onderbouwing voorstelt (en dan in sectie A als PIVOT markeren)
═══════════════════════════════════════════════════════════════════════════════

1. De enige plek waar iets wordt AFGEVINKT is de dagelijkse executie-surface
   (nu: Overzicht-hero / Mijn Dag-pad). Geen tweede vinklijst.
2. Geen streaks, geen calorieën-als-hero, geen badges, geen schuld-mechaniek.
3. Minuten uit gedaan-log = evidence, nooit een tweede score naast check-score.
4. Dagstap blijft GRATIS. Premium raakt "wanneer / automatisch bijgesteld",
   nooit "wat doe ik vandaag".
5. Geen gezondheidscontext (AVG art. 9) in push/e-mail-onderwerp/preview.
6. Geen web push, geen SMS in F1. Kanalen F1 voor tiny-habit alerts: in-app
   en/of e-mail — ontwerp mag kiezen, maar geen derde kanaal.
7. Geen medische claims / diagnose-taal. "Adviezen, geen diagnoses."
8. Voortgang meet; doen gebeurt elders. Stop geen afvink/todo in Voortgang.
9. B2B/white-label is HORIZON: bouw geen surface die later niet als analyse-laag
   te isoleren is — maar ontwerp géén multi-tenant, géén coach-portal, géén
   organisatie-UI in deze output.
10. Nieuwe client-events: registratie op drie plekken noemen bij elk nieuw event.

OPEN TEGENSTELLING DIE JIJ MAG BESLISSEN (dit is kernwerk)
  - Oude lock "geen affiliate / geen koop-CTA in dashboard" botst met de nieuwe
    richting "analyse → advies → prijs-kwaliteit producten/supplementen".
    Beslis WAAR commercieel advies mag leven (welke surface, welke diepte, welke
    CTA-vorm) zonder de cockpit opnieuw tot winkel te maken. Motiveer tegen
    stepped care (leefstijl eerst).

═══════════════════════════════════════════════════════════════════════════════
NOORDSTER — dwing tot één zin, dan lagen
═══════════════════════════════════════════════════════════════════════════════

Formulier eerst (sectie A) één noordster-zin voor Beweging in het dashboard,
in dit format:

  "Wanneer een man 40+ Beweging opent, krijgt hij binnen 5 seconden
   [ANTWOORD] en één [ACTIE]; alles andere is secondary of elders."

Daarna splits je de drie productintenties in lagen (niet in één viewport):

  L1 Bewustwording / tiny habit   → makkelijkste winst, alert, afvinken
  L2 Analyse / positie / voortgang → waar sta ik, wat betekent het, trend
  L3 Advies / vergelijk / product  → wat past, prijs-kwaliteit, doorverwijs

Elke surface die je voorstelt mag PRIMAIR maar één laag bedienen.
Secondary mag; primary niet twee lagen tegelijk.

═══════════════════════════════════════════════════════════════════════════════
TAAK A — PRODUCTBESLUIT: wat Beweging WÉL is / NIET is + kill-list
═══════════════════════════════════════════════════════════════════════════════

1. Positionering (max 8 regels): wat Beweging in het dashboard WÉL is.
2. Anti-positionering: wat het NIET wordt — vertaal naar 5 concrete
   ontwerpverboden (niet alleen "geen Strava").
3. Verdict-tabel GO / PIVOT / KILL met één zin onderbouwing, minimaal voor:
   - Surface "Overzicht" (naam + rol)
   - Surface "Stappenplan" (naam + rol)
   - Surface "Programma" (naam + rol)
   - MovementJourneyRail / "Jouw route"
   - MovementSportLens als eigen blok
   - Score-ring "Waar je staat" op Overzicht
   - Tier-picker Herstel/Matig/Trainen
   - "Open Mijn Dag" als secondary CTA
   - Uitgebreide beweegcheck-CTA op Overzicht
   - Voeding/supps-footer op Overzicht
   - Mobiele 3-tabs Overzicht/Stappenplan/Programma
   - Ordinaal "Fase 1 van 3"
   - Tiny-habit mobile alert (F1)
   - Commercieel advies (supplement/product) gekoppeld aan beweegdomein
4. Kill-list: alles wat uit de first viewport / uit Beweging weg moet, met
   bestemming (Voortgang | Mijn Dag | Inzichten | Gids | Vergelijkingspagina |
   Parkeren | Verwijderen).
5. Naamgeving: kies één canonieke woordenset (max 6 UI-termen) en verbied de
   rest. Los "plan / stappenplan / programma / route / overzicht / mijn dag"
   definitief op.
6. Generieke regel voor andere domeinen (1 alinea): wat van dit besluit
   herbruikbaar is voor slaap/stress/energie/herstel — zonder die domeinen
   uit te werken.

═══════════════════════════════════════════════════════════════════════════════
TAAK B — IA + SCHERMHIËRARCHIE BEWEGING
═══════════════════════════════════════════════════════════════════════════════

1. Doel-surface-kaart ná jouw verdicts: max 3 surfaces voor Beweging (mag
   minder). Per surface: primaire vraag die hij beantwoordt, primary CTA,
   wat er expliciet NIET in mag, en welke SSOT-laag (analyse/plan/agenda/
   evidence) hij bedient.
2. First-viewport contract Overzicht (of jouw vervanger) op 375px:
   - Exact welke blokken in de eerste viewport staan (max 4).
   - Wat de gebruiker in ≤5 seconden moet snappen.
   - Wat eronder mag scrollen.
   - ASCII-wireframe 375px voor drie toestanden:
     (a) eerste bezoek / geen prefs
     (b) terugkerend, tiny habit nog niet gedaan
     (c) gedaan / rustdag / andere pijler is prioriteit
3. "Jouw plan / jouw programma zonder ruis": waar leeft het concrete plan?
   Eén plek. Hoe ziet "alleen het jouwe" eruit als de gebruiker GEEN catalogus
   hoeft te browsen? Wat gebeurt met coming_soon-varianten?
4. Analyse zonder ruis: welke één readout toont "waar sta ik"? Welke readout
   mag NIET meer op de doe-surface staan (hoort bij Voortgang)?
5. Tiny habit + alert:
   - Definieer tiny habit hier als: bestaande stap uit committed dose / dagstap,
     niet een parallelle habit-engine. Bevestig of weerleg — als je weerlegt,
     onderbouw waarom een nieuwe engine nodig is.
   - Ontwerp F1 alert: trigger, kanaal, timing-bron, suppressie als al gedaan,
     max 1 bericht/dag voor beweging, copy-regels (scorevrij, domeinvrij van
     buitenaf leesbaar), en waar de tap landt.
6. Advies/product-laag: waar zit de deur naar vergelijking/supplementadvies
   ZONDER de first viewport te vervuilen? Eén secondary pad, met meetpunt.
7. Navigatie desktop vs mobiel: één model. Als 3-tabs doodgaan, wat vervangt
   ze — en hoe vindt iemand oefeningen/details nog?
8. Edge cases (kort, per case 2–4 regels): geen startspoor · terugkeer na 2
   weken stilte · anonieme intake zonder account · programma coming_soon ·
   herstel-dag na zware training.

═══════════════════════════════════════════════════════════════════════════════
KRITIEKRONDE (verplicht vóór definitieve versie)
═══════════════════════════════════════════════════════════════════════════════

Beoordeel je eigen A+B vanuit vier perspectieven. Per perspectief 2 scherpe
kritiekpunten + 1 verbetering; verwerk en markeer wat je wijzigde:

1. Gedragswetenschapper (self-efficacy, tiny habits, cognitieve last)
2. 45-jarige man, drukke week, matige motivatie, opent op telefoon
3. Privacy officer (alerts, art. 9, dataminimalisatie)
4. Product-eigenaar PerfectSupplement (attributie: tiny-habit vs analyse vs
   commercie mogen niet in één deploy onmeetbaar door elkaar lopen)

═══════════════════════════════════════════════════════════════════════════════
OUTPUTFORMAAT (exact deze secties, in deze volgorde)
═══════════════════════════════════════════════════════════════════════════════

A. Executive summary
   - Noordster-zin (het 5-seconden format hierboven)
   - Lagenkaart L1/L2/L3 met primary surface per laag
   - Verdict-tabel GO/PIVOT/KILL (alle items uit Taak A.3)
   - Wat dit product WÉL / NIET is (kort)

B. Diagnose huidige frictie
   Tabel: probleem | gebruikersimpact | root cause | raakt welk oppervlak
   Max 10 rijen, gesorteerd op impact.

C. Doel-IA Beweging
   Surface-kaart (max 3) + naamgeving (canonieke termen + verboden termen) +
   kill-list met bestemming.

D. First-viewport contract + ASCII-wireframes 375px
   Drie toestanden (a)(b)(c). Per toestand: wat in viewport / wat eronder /
   primary CTA-label (NL).

E. Plan-zonder-ruis + analyse-readout
   Waar het plan leeft, hoe "alleen het jouwe" werkt, welke ene analyse-readout
   op de doe-surface blijft, wat naar Voortgang verhuist.

F. Tiny-habit alert F1
   Trigger | kanaal | timing | suppressie | landingspunt | 2 goede copy-
   voorbeelden | 1 afgekeurd voorbeeld met reden.

G. Advies/product-deur
   Waar, hoe diep, welke CTA, hoe stepped care intact blijft, meetpunt.

H. Meetplan
   Per nieuwe of herpositioneerde CTA/alert: event, payload (geen PII),
   hergebruik-of-nieuw, bij nieuw: drie registratieplekken noemen.
   Sluit af met: "Meetpunt: <event(s)> — hier lees je het effect af."
   Eis: tiny-habit effect, analyse-engagement en advies-CTR zijn APART
   meetbaar — niet één blended event.

I. Roadmap + open vragen
   F1 / F2 / F3: per fase user-visible + acceptatiecriteria (geen
   implementatietaken-lijst). Daarna open vragen voor Dennis — genummerd,
   elk met JOUW aanbevolen antwoord (geen open vraag zonder voorkeur).
   Horizonregel B2B: 5 regels max — wat je niét bouwt nu, wat je wél
   vermijdt te verankeren in B2C-UI.

Sluit af met SELF-SCORECARD (1–10 + één regel) op:
  helderheid 5-seconden · tiny-habit realisme · analyse zonder ruis ·
  commercie-discipline · dev-realisme binnen bestaande engine.

En ANTI-PATTERNS die je ontwerp vermijdt (minimaal: drie surfaces die hetzelfde
zeggen, second vinklijst, first-viewport winkel, fase-ladder als oordeel,
alert met gezondheidscontext, nieuwe habit-engine naast bestaande dagstap).

═══════════════════════════════════════════════════════════════════════════════
CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- GEEN code, GEEN diffs, GEEN patches.
- GEEN multi-tenant / coach-portal / organisatie-UI.
- GEEN herbouw van de movement-engine "vanaf nul" — surfacing, wiring,
  herordenen, hernoemen, killen van surfaces mag; greenfield engine niet.
- GEEN streaks/badges/calorieën-hero/schuld.
- GEEN web push / SMS in F1.
- GEEN medische claims.
- Houd Voortgang en doen gescheiden.
- Als je een gelockt besluit PIVOTt, markeer het expliciet en geef het
  sterkste tegenargument dat je hebt — anders respecteer de lock.
- Schrijf alsof Dennis de output morgen als productbesluit vastzet.
```

---

## Bijlagen-checklist (voor Dennis)

- Overzicht 375px — first viewport
- Overzicht 375px — gescrolld (footer zichtbaar)
- Stappenplan — met programma-kaart / sport-lens zichtbaar
- Programma-view of notitie "coming_soon"
- Optioneel: Voortgang + Mijn Dag screenshots
- Optioneel: `BLAUWDRUK_ADAPTIEF_BEWEEGSYSTEEM.md`, `voortgang-plan-later.md`

## Wat je daarna doet met de output

1. Sectie **A** (verdicts) en **C** (IA) reviewen — dat is het productbesluit.
2. Alleen bij akkoord: craft/Cursor-prompt voor F1 (first-viewport + kill-list), niet eerder.
3. Meetplan uit **H** meenemen in dezelfde wijziging als de UI — geen meting achteraf.

## Verificatie-log (30 jul 2026)

Gecontroleerd tegen working tree:

- Surfaces & wiring: `BewegingScreen.tsx`, `MovementCockpit.tsx`, `MovementPlanDeepBody.tsx`, `MovementProgramView.tsx`, `BewegingViewNav.tsx`
- Doorway-regressie (geen href): `MovementDoorway.tsx`
- Deleted: `MovementPlanConfigurator.tsx`, `MovementRouteLadder.tsx`
- SSOT-lagen: `docs/core/ROADMAP_DASHBOARD_COCKPIT.md`
- Voortgang-regel: `docs/design/voortgang-plan-later.md`
- Schema-vs-surfacing diagnose: `docs/plan/BLAUWDRUK_ADAPTIEF_BEWEEGSYSTEEM.md` §0.1–0.3

