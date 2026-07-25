# Prompt — Analyse Beweging: Vandaag ↔ Reis ↔ Stappenplan (+ notificaties)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus in een nieuw gesprek. Voeg de **screenshots van de beweeg-cockpit en het stappenplan** toe als bijlage.
>
> **Output:** uitsluitend analyse/architectuur — geen code, geen diffs, geen bestandspatches.
>
> **Opgesteld:** 23 juli 2026. De harde context is geverifieerd tegen `main` op die datum (zie "Verificatie-log" onderaan dit bestand).

---

## Waarom deze prompt

De beweeg-cockpit is technisch verder dan de laatste analyse ([`KOMPAS_BEWEGING_NAAR_STAPPENPLAN.md`](../plan/KOMPAS_BEWEGING_NAAR_STAPPENPLAN.md), 22 jul) beschrijft: de fase-lock is weg, de one-way sync daily-log → plan bestaat, de sessie-catalogus wordt gerenderd, en de plan-reader is inmiddels dárk cockpit in plaats van de daar geadviseerde 768px light-kolom. Het resterende probleem is niet techniek maar **betekenis**:

1. **Vandaag** is een tier-picker met één regel tekst — het toont geen staat ("hoe sta ik ervoor?") en geen toekomst ("wat komt eraan?").
2. **Jouw route** heeft twee waypoints die letterlijk hetzelfde tonen (Waarom / Mijn doel), en het waypoint "Vandaag" leest uit het day-model in plaats van uit de tier-keuze die de gebruiker net maakte.
3. **Stappenplan** heeft nu wél een aanbevolen-programma-tegel, maar de relatie met de dag ("advies vanuit vandaag") is eenrichtingsverkeer omhoog, niet omlaag.
4. **Notificaties** bestaan niet als laag, terwijl alle ingrediënten er liggen (`scheduled_time`, `time_bucket`, agenda-blocks, Resend-crons). Zonder terugkeer-trigger blijft elke verbetering aan Vandaag onbenut.

Deze prompt dwingt Opus om die vier tegelijk op te lossen binnen de gelockte SSOT-regels — en om expliciet te kiezen tussen "professionele sessie-kaart" en "tekst-only oefening", omdat dat het verschil is tussen coachplatform en blogfragment.

---

## Gebruiksinstructie

1. Open Claude Opus (nieuw gesprek).
2. Voeg bijlagen toe:
   - **Verplicht:** screenshot beweeg-cockpit op 375px — vóór tier-keuze, ná tier-keuze "Trainen", en ná afvinken.
   - **Verplicht:** screenshot stappenplan (`MovementPlanDeepBody`) — inclusief de tegel "Aanbevolen programma".
   - Optioneel: `CLAUDE.md`, `docs/plan/BLAUWDRUK_BEWEEGSYSTEEM_DASHBOARD_STAPPENPLAN.md`, `docs/plan/KOMPAS_BEWEGING_NAAR_STAPPENPLAN.md`, `docs/core/WRITING_VOICE.md`.
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Verwachte output: vaste secties A t/m J. Geen code, geen copy-decks.
5. Gebruik de output als blauwdruk voor F1-implementatie (aparte sessie).

---

## Prompt (copy-paste)

```text
ROL: Je bent Senior UX-architect, Product Strategist en Behavioral Scientist voor
PerfectSupplement (perfectsupplement.nl). Je ontwerpt de beweeg-cockpit van het
Leefstijlcheck-dashboard.

Je levert UITSLUITEND analyse en architectuur: informatiemodel, surface-verdeling,
copy-hiërarchie, meetplan, fasering. GEEN code, GEEN diffs, GEEN bestandspatches,
GEEN "ik ga nu bouwen". Output in het Nederlands; identifiers/veldnamen in het Engels.

Lees CLAUDE.md mee als je het hebt.

═══════════════════════════════════════════════════════════════════════════════
BIJLAGEN (door Dennis)
═══════════════════════════════════════════════════════════════════════════════

1. VERPLICHT: screenshots beweeg-cockpit 375px — (a) vóór tier-keuze, (b) na keuze
   "Trainen", (c) na afvinken. Dit is de huidige staat, niet de doelarchitectuur.
2. VERPLICHT: screenshot stappenplan (plan-reader) inclusief tegel "Aanbevolen
   programma".
3. OPTIONEEL: CLAUDE.md, blauwdruk-docs, WRITING_VOICE.md.

═══════════════════════════════════════════════════════════════════════════════
PRODUCTCONTEXT
═══════════════════════════════════════════════════════════════════════════════

PerfectSupplement is een onafhankelijk leefstijlplatform voor mannen 40+ (slaap,
stress, energie, herstel, beweging). Positionering: "de Consumentenbond van
supplementen", doorgegroeid naar leefstijlcoach. Adviezen, geen diagnoses.
Stepped care: leefstijl eerst, supplementen laat.

Na de Leefstijlcheck krijgt de gebruiker een dashboard-cockpit met per domein een
Kompas-scherm. Beweging is het verst ontwikkelde domein en fungeert als blauwdruk
voor de andere vier.

Drie oppervlakken staan centraal in deze analyse:

  VANDAAG (hero)          = executie + staat. Tier-keuze Herstel/Matig/Trainen,
                            dagstap, "Markeer als gedaan" (de ENIGE check-off).
  JOUW ROUTE (reis-rail)  = narratief. Waypoints: Hier begon je · Waarom ·
                            Mijn doel · Vandaag · Mijn groei · Future You.
  STAPPENPLAN (plan-reader) = structuur + configuratie. 3 fasen read-only,
                            aanbevolen programma uit de sessie-catalogus, profiel
                            (startspoor, sport, frequentie).

═══════════════════════════════════════════════════════════════════════════════
HARDE CONTEXT — GEVERIFIEERD TEGEN DE CODEBASE OP 23 JULI 2026
Neem dit als waar aan. Verzin geen alternatieve staat en ga niet uit van eerdere
analysedocumenten waar die hiermee conflicteren.
═══════════════════════════════════════════════════════════════════════════════

WAT AL WERKT (niet opnieuw voorstellen als "gap")

- Tier-keuze laadt direct de bijbehorende dagstap. De resolver is FASE-AWARE:
  hij bepaalt eerst de actieve fase (computeCurrentPhaseId) en valt alleen terug
  op fase 1 als die fase niet resolvet. De oude "tier-picker zit vast op week 1"-
  diagnose is ACHTERHAALD.
- One-way sync bestaat: daily-log is de executie-SSOT en het stappenplan LEEST
  daaruit af (afgeleide step-state todo/done). Handmatige plan-checkboxes zijn
  in account-context uit; anonieme intake-gebruikers houden ze als enige tracker.
- Sessie-catalogus bestaat en wordt gerenderd in het stappenplan als tegel
  "Aanbevolen programma": label, doel, duur, frequentie, intensiteit, globale
  opbouw ("Squat/goblet, push, pull, hip hinge — 2–3 sets × 8–12"). Vijf varianten:
  kracht-thuis, kracht-sportschool (status coming_soon), conditie-wandelen,
  conditie-zone2, dagelijks-ritme. Aanbeveling volgt uit startspoor + kracht-score
  + voorkeurssport.
- Profielvelden preferredSport en weeklyAvailability (1×/2×/3×) persisteren al via
  de movement-prefs-API, naast startPattern en het motivatie-anker.
- Gedaan-log bestaat als aparte tabel: minuten per modaliteit + optionele notitie,
  met week-samenvatting. Gelockte regel: minuten zijn EVIDENCE, nooit een tweede score.
- Recovery-hint, week-ritme-readout, training-gate ("gisteren zwaar getraind?") en
  exertie-microvraag (licht/matig/zwaar) bestaan.
- Het hele dashboard draait op één cockpit-shell. De plan-reader is dus DONKER
  (cockpit-tokens, max-w-5xl) — het eerdere advies "plan-reader wordt light 768px"
  is door de shell-unificatie ACHTERHAALD. Er is geen dark→light-breuk meer.
- Doorway naar het stappenplan zit in de route-ladder ("Bekijk je volledige
  stappenplan"), niet in de hero. Dat is een bewust besluit.

WAT AANTOONBAAR STUK OF LEEG IS (dit is je werkgebied)

- Reis-rail duplicatie: de waypoints "Waarom" en "Mijn doel" renderen exact
  dezelfde bron (het gekozen anker + de anker-motivatie). Twee waypoints, één inhoud.
- Reis-rail ontkoppeling: waypoint "Vandaag" leest uit het day-model (de generieke
  actieve gewoonte), NIET uit de tier-keuze + dagstap die de gebruiker zojuist in
  de hero maakte. Kies je "Trainen", dan blijft de reis iets anders vertellen.
- "Future You" toont dezelfde anker-motivatie als "Waarom" — er is geen eigen
  toekomst-copy.
- Vandaag toont geen toekomst: er is geen "wat komt eraan"-preview (volgende
  logische stap, volgende fase-drempel) in de hero.
- De relatie stappenplan → vandaag is eenrichtingsverkeer: het plan toont een
  aanbevolen programma, maar de dagstap in de hero verwijst daar niet naar terug.
- Er is GEEN notificatielaag. Geen engine, geen in-app inbox, geen dagelijkse nudge.
  Wél liggen de ingrediënten klaar:
    * per-pijler voorkeur met scheduled_time én time_bucket (ochtend/middag/avond)
    * agenda-blocks (tijdvakken per dag, soft delete)
    * Resend + bestaande cron-routes voor nurture en retentie, plus
      intake-reminder- en hermeting-reminder-crons als patroon
    * een dagritme-dataset voor bewegingssnacks / zit-onderbrekingen
- kracht-sportschool staat op coming_soon: één van de vijf varianten heeft geen
  uitgewerkte opbouw.

═══════════════════════════════════════════════════════════════════════════════
GELOCKTE BESLUITEN — respecteer deze, bediscussieer ze niet
═══════════════════════════════════════════════════════════════════════════════

1. De VANDAAG-hero is de ENIGE plek waar iets wordt afgevinkt. Geen tweede
   vinklijst, waar dan ook. Het stappenplan is read-only arc voor account-users.
2. Geen streaks, geen calorieën, geen badges, geen schuld-mechaniek.
3. Minuten uit de gedaan-log zijn evidence, nooit een tweede score naast de
   check-score.
4. De dagstap is en blijft GRATIS. Premium raakt alleen "wanneer & automatisch
   bijgesteld" (tijd-slots, agenda-koppeling, herkalibratie, wearables), nooit
   "wat doe ik vandaag".
5. Geen gezondheidscontext (AVG art. 9) in push, e-mail-onderwerp of preview-tekst.
   Berichten zijn domeinvrij en scorevrij van buitenaf leesbaar.
6. Geen web push en geen SMS in fase 1. Kanalen fase 1: in-app + e-mail.
7. Geen affiliate-links, geen koop-CTA's in het dashboard.
8. Eén canonieke naam: "stappenplan". Niet "leefstijlplan", niet "beweegplan" in UI.
9. Eén doorway naar het stappenplan (route-ladder). Geen tweede ingang in de hero.
10. Nieuwe client-events vereisen registratie op drie plekken (event-definitie,
    client-helper, server-allowlist). Noem dat expliciet bij elk nieuw event.

═══════════════════════════════════════════════════════════════════════════════
HUIDIGE SURFACE-KAART (referentie)
═══════════════════════════════════════════════════════════════════════════════

  VANDAAG (executie + staat)         JOUW ROUTE (narratief)
  ├─ tier: Herstel/Matig/Trainen ──┐ ├─ Hier begon je
  ├─ dagstap + rationale           │ ├─ Waarom ──────┐ duplicaat
  ├─ recovery-hint                 │ ├─ Mijn doel ───┘
  ├─ week-readout                  │ ├─ Vandaag  ← leest day-model, niet de tier
  └─ Markeer als gedaan ──► daily_action_log (SSOT)
                                   │ ├─ Mijn groei
                                   │ └─ Future You ← zelfde copy als Waarom
                                   │        │
                                   │        ▼ doorway (route-ladder)
                                   │ STAPPENPLAN (structuur)
  daily_action_log ────────────────┴─► ├─ 3 fasen (read-only, afgeleide staat)
       (one-way read)                  ├─ Aanbevolen programma (sessie-catalogus)
                                       └─ Profiel: spoor · sport · frequentie

  ONTBREEKT VOLLEDIG: notificatielaag (in-app inbox + e-mail-nudge)

═══════════════════════════════════════════════════════════════════════════════
TAAK A — HERPOSITIONEER "VANDAAG": van picker naar staat + toekomst
═══════════════════════════════════════════════════════════════════════════════

Vandaag is nu een keuzemenu. Het moet worden: "dit is hoe je ervoor staat, dit is
je stap, en dit komt eraan" — zonder de first viewport te overladen.

Beantwoord:
1. Welke informatie hoort in de HERO, welke in de INSPECTOR (zij-/detailpaneel),
   en welke in een REIS-WAYPOINT? Geef een expliciete driedeling met motivatie
   per element: tier-keuze, dagstap, rationale, recovery-readiness, week-ritme,
   "volgende logische stap", fase-positie, gedaan-log/minuten.
2. Hoe toon je recovery-readiness zonder pseudo-medische precisie te suggereren
   (we hebben geen wearable in F1 — alleen zelfrapportage en logs)?
3. Hoe ziet "wat komt eraan" eruit als het GEEN tweede takenlijst mag worden?
   Eén element, maximaal. Motiveer welk.
4. Wireframes in tekst/ASCII voor 375px, drie toestanden: (a) vóór tier-keuze,
   (b) na keuze "Trainen", (c) na afvinken. Benoem per toestand wat er in de
   eerste viewport past en wat eronder valt.
5. Wat verdwijnt er? Noem minstens twee dingen die uit de hero moeten om ruimte
   te maken, en waar ze heen gaan.

═══════════════════════════════════════════════════════════════════════════════
TAAK B — STAPPENPLAN ALS WERKBLAD, NIET ALS TWEEDE TODO-LIJST
═══════════════════════════════════════════════════════════════════════════════

1. Bevestig of weerleg: de doorway blijft uitsluitend de route-ladder-link.
   Als je afwijkt, onderbouw tegen gelockt besluit 9 — dat vraagt een sterk argument.
2. Advies vanuit vandaag, omlaag: hoe voeden recovery-hint + gekozen tier de
   getoonde catalogus-variant in het plan? En omgekeerd: hoe verwijst de dagstap
   in de hero herkenbaar naar het aanbevolen programma zonder het te herhalen?
   Ontwerp die terugkoppeling expliciet — dit is de kern van "één product".
3. Profiel → programma: welke velden mappen op welke catalogus-variant, en welke
   velden ONTBREKEN nog voor een geloofwaardige aanbeveling? (Bekend afwezig in de
   UI: werkactiviteit zittend/staand/fysiek. Beoordeel of dat nodig is en waarom.)
4. Eigen oefeningen toevoegen — GO of NO-GO. Als GO: ontwerp de lichtst mogelijke
   vorm (maximaal N items als aanvulling op het basisschema, geen workout-builder,
   geen sets/reps-logboek) en zeg wat het NIET wordt. Als NO-GO: wat lost het
   onderliggende verlangen ("dit past niet bij mij") anders op?
5. kracht-sportschool staat op coming_soon. Kies: uitwerken, verbergen, of expliciet
   labelen — en zeg wat dat doet met vertrouwen.

═══════════════════════════════════════════════════════════════════════════════
TAAK C — REIS-RAIL HERONTWERP
═══════════════════════════════════════════════════════════════════════════════

1. Los de duplicatie "Waarom" / "Mijn doel" op. Kies: samenvoegen tot één waypoint,
   of ze echt verschillende inhoud geven. Definieer per waypoint de BRON (welk
   gegeven voedt het) en de FUNCTIE (welke vraag beantwoordt het).
2. Koppel waypoint "Vandaag" aan de echte hero-staat (tier + dagstap + gelogd
   ja/nee) in plaats van het generieke day-model. Beschrijf de gewenste toestanden:
   nog niets gekozen · tier gekozen, niet gedaan · gedaan · rustdag · andere pijler
   is vandaag prioriteit.
3. Geef "Future You" eigen inhoud, los van het anker. Wat is de bron? Wat toont het
   als er nog geen hermeting is? Formuleer de toon-regels (geen belofte, geen
   angst, geen diagnose) plus twee copy-voorbeelden.
4. Bepaal de volgorde en het aantal waypoints definitief. Motiveer elke schrapping.

═══════════════════════════════════════════════════════════════════════════════
TAAK D — NOTIFICATIELAAG (in-app + e-mail, fase 1)
═══════════════════════════════════════════════════════════════════════════════

Ontwerp een notificatie-architectuur die past bij een leefstijlplatform voor
mannen 40+ die géén fitness-app willen. Geen alarm, wel ritme.

1. Berichttypen — ontwerp er maximaal vier voor F1. Overweeg minimaal:
   dagstart-nudge, pre-sessie-herinnering, post-sessie-reflectie, zit-onderbreking
   (opt-in), terugkeer-na-stilte. Per type: trigger, kanaal (in-app/e-mail/beide),
   timing-bron, onderdrukkingsregel, en wat er gebeurt als de gebruiker niets doet.
2. Doseringsregels: maximum per dag en per week, samenvoeging van meerdere pijlers,
   stilte-vensters, en wat er gebeurt als drie pijlers tegelijk iets willen zeggen.
   Geef een expliciet prioriteringsprincipe.
3. Suppressie: hoe voorkom je een herinnering voor iets dat al is afgevinkt, of voor
   een dag waarop een ander domein prioriteit is?
4. Consent & privacy: welke opt-in-granulariteit (per kanaal? per type? per pijler?),
   hoe uit te zetten, en hoe je AVG art. 9 buiten de berichtinhoud houdt. Geef vier
   concrete onderwerpregels/preview-teksten die scorevrij en domeinvrij zijn — plus
   twee AFGEKEURDE voorbeelden met uitleg waarom ze lekken.
5. In-app inbox: nodig in F1 of niet? Als ja, waar leeft hij in de cockpit-shell en
   wat is de badge-regel? Als nee, waar landen berichten dan wél?
6. Zit-onderbreking is expliciet een opt-in snack, geen schuld-push. Ontwerp hem zo
   dat hij nooit "je zit al 20 minuten" claimt (we hebben geen activiteitssensor in F1).

═══════════════════════════════════════════════════════════════════════════════
TAAK E — POSITIONERING
═══════════════════════════════════════════════════════════════════════════════

1. Formuleer in maximaal 5 regels wat dit product WÉL is: anker-gedreven, met een
   hermeting als payoff, adaptief zonder schuld.
2. Formuleer wat het NIET wordt (MyFitnessPal, Strava, personal-trainer-app) en
   vertaal dat naar drie concrete ontwerp-verboden.
3. Premium-grens: bevestig of nuanceer dat "wanneer / agenda / herkalibratie"
   premium is en "wat doe ik vandaag" altijd gratis. Wijs aan waar in jouw ontwerp
   die grens zichtbaar wordt, en hoe je hem toont zonder de gratis dagstap te
   devalueren.
4. Beoordeel of de notificatielaag die grens beïnvloedt (is een herinnering gratis?).

═══════════════════════════════════════════════════════════════════════════════
KRITIEKRONDE (verplicht vóór je definitieve versie)
═══════════════════════════════════════════════════════════════════════════════

Beoordeel je eigen ontwerp uit A–E vanuit vier perspectieven. Per perspectief
2–3 scherpe kritiekpunten + 1 concrete verbetering:

1. Gedragswetenschapper (motivatie, self-efficacy, terugkeer-lus, habit-formatie)
2. 45-jarige gebruiker met een drukke week en matige motivatie
3. Privacy officer (AVG art. 9, consent, dataminimalisatie, e-mail-preview)
4. Frontend-ontwikkelaar (haalbaarheid binnen de bestaande cockpit-shell,
   staatsexplosie, 375px, kosten van een notificatie-cron)

Verwerk de kritiek en markeer expliciet wat je hebt gewijzigd t.o.v. versie 1.

═══════════════════════════════════════════════════════════════════════════════
OUTPUTFORMAAT (exact deze secties, in deze volgorde)
═══════════════════════════════════════════════════════════════════════════════

A. Executive summary + aanbeveling per idee (GO / PIVOT / KILL, met één zin
   onderbouwing per verdict). Minimaal beoordelen: hero-herpositionering,
   sessie-kaarten, eigen oefeningen toevoegen, reis-rail-herontwerp,
   notificatielaag, in-app inbox.

B. Diagnose huidige frictie — tabel: probleem | gebruikersimpact | root cause |
   raakt welk oppervlak.

C. Doel-journey Vandaag → Reis → Stappenplan in 7 stappen, met edge cases
   (geen startspoor gekozen · andere pijler is prioriteit · rustdag · geen tijd ·
   terugkeer na 2 weken stilte · anonieme intake-gebruiker zonder account).

D. Surface-architectuur: wat leeft in hero / inspector / reis-rail / plan-reader /
   notificatie. Tabel + ASCII-wireframes 375px voor de drie hero-toestanden.

E. Informatiemodel: daily-log als executie-SSOT, afgeleide fase-staat, gedaan-log
   (minuten = evidence), sessie-catalogus, profielvelden. Benoem per gegeven:
   bron, scope (account of sessie), en wie ervan leest. Markeer expliciet welke
   velden NIEUW zouden zijn.

F. Sessie-presentatie: sessie-kaart vs tekst-only vs eigen oefeningen. Verdict +
   veldindeling van de kaart + wat bewust niet getoond wordt.

G. Notificatie-architectuur F1: berichttypen-tabel (trigger | kanaal | timing-bron |
   suppressie | frequentiecap), consent-model, copy-voorbeelden (4 goed, 2 afgekeurd),
   in-app inbox ja/nee.

H. Copy & button-hiërarchie per oppervlak (primair / secundair / tertiair), met
   concrete NL-labels. Feit-eerst, geen coach-cliché, geen diagnose-taal.

I. Meetplan: per nieuwe CTA/kanaal het event, de payload-velden, hergebruik-of-nieuw,
   en bij nieuw de drievoudige registratie. Geen PII. Sluit af met één regel:
   "Meetpunt: <event(s)> — hier lees je het effect af."

J. Gefaseerde roadmap F1 / F2 / F3 met per fase: user-visible, backend, acceptatie-
   criteria. Daarna: open vragen voor Dennis (genummerd, elk met jouw aanbevolen
   antwoord erbij — geen open vraag zonder voorkeur).

Sluit af met een SELF-SCORECARD (1–10 + één regel motivatie) op vijf dimensies:
SSOT-consistentie · mobiel 375px · retentie-potentie · dev-realisme · privacy.
En een lijst ANTI-PATTERNS die je ontwerp expliciet vermijdt (minimaal: tweede
vinklijst, gezondheidscontext in e-mail/push, tekst-only workout, streaks,
notificatie-spam).

═══════════════════════════════════════════════════════════════════════════════
CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- GEEN code, GEEN diffs, GEEN bestandsnamen met regelnummers als "voorstel-patch".
  Je mag bestaande bestanden noemen om naar te verwijzen; je wijzigt niets.
- GEEN nieuwe routes naast de bestaande dashboard- en plan-route.
- GEEN web push, GEEN SMS in fase 1.
- GEEN medische claims, geen diagnose-taal, geen normwaarden als oordeel.
- GEEN affiliate of koop-CTA in het dashboard.
- Alle voorgestelde events blijven VOORSTELLEN — je registreert niets.
- Als iets onduidelijk is: kies de sterkste optie, documenteer de aanname expliciet
  als "AANNAME: ...", en ga door. Stel geen vragen terug tijdens het uitwerken —
  verzamel ze in sectie J.
- Denk diep. Kies niet de voor de hand liggende indeling. Waar je afwijkt van de
  bestaande architectuur: zeg het hardop en onderbouw het.

BEGIN.
```

---

## Verwachte output (checklist)

- [ ] **A** — Executive summary + GO/PIVOT/KILL per idee
- [ ] **B** — Frictie-diagnose (tabel)
- [ ] **C** — Doel-journey 7 stappen + 6 edge cases
- [ ] **D** — Surface-architectuur + 3 wireframes 375px
- [ ] **E** — Informatiemodel (SSOT, scope, nieuwe velden gemarkeerd)
- [ ] **F** — Sessie-presentatie: kaart vs tekst vs eigen oefeningen
- [ ] **G** — Notificatie-architectuur F1 (in-app + e-mail)
- [ ] **H** — Copy & button-hiërarchie per oppervlak
- [ ] **I** — Meetplan met drievoudige registratie
- [ ] **J** — Roadmap F1/F2/F3 + open vragen mét aanbevolen antwoord
- [ ] Self-scorecard (5 dimensies) + anti-patterns-lijst

Geen code. Geen implementatie. Wel een blauwdruk die direct om te zetten is in bouwslices.

---

## Verificatie-log (23 juli 2026, tegen `main`)

Twee premissen uit de oorspronkelijke opdracht bleken achterhaald en zijn in de prompt gecorrigeerd:

| Aanname in opdracht | Werkelijke staat | Bron |
|---|---|---|
| "Tier-picker vast op fase 1 — resolver scoped op fase-1-id" | **Achterhaald.** De resolver bepaalt eerst de actieve fase en gebruikt fase 1 alleen als fallback | [movement-prefs.ts:148-157](../../src/lib/movement-prefs.ts#L148-L157) |
| "Catalogus bestaat maar is read-only / niet gebruikt" | **Achterhaald.** De catalogus wordt gerenderd als tegel "Aanbevolen programma" met doel/duur/frequentie/intensiteit/opbouw | [MovementPlanDeepBody.tsx:453-473](../../src/components/dashboard/beweging/MovementPlanDeepBody.tsx#L453-L473) |
| "Dubbele voltooiing: daily-log vs plan_progress" | **Deels opgelost.** One-way afleiding bestaat; plan-checkboxes zijn in account-context uit | [movement-plan-execution.ts](../../src/lib/movement-plan-execution.ts) |
| "Plan-reader = 480px light intake-kolom" | **Achterhaald.** Alles draait op de cockpit-shell; de plan-reader is donker, max-w-5xl | [MovementPlanConfigurator.tsx:27-31](../../src/components/dashboard/beweging/MovementPlanConfigurator.tsx#L27-L31) |
| "Journey 'Vandaag' ≠ hero-keuze" | **Bevestigd.** Waypoint leest `model.activeHabit` | [MovementJourneyRail.tsx:188](../../src/components/dashboard/beweging/MovementJourneyRail.tsx#L188) |
| "Geen NotificationEngine, wél scheduled_time / agenda-blocks / Resend-cron" | **Bevestigd.** Geen notificatielaag; wel `scheduled_time`, `time_bucket`, `agenda_blocks`, crons voor nurture/retentie | [account-priority-pref.ts](../../src/lib/account-priority-pref.ts), [api/cron/](../../src/app/api/cron/) |
| — (nieuw gevonden) | **Duplicatie in reis-rail:** waypoints "Waarom" en "Mijn doel" renderen dezelfde anker-bron; "Future You" ook | [movement-journey.ts:61-105](../../src/lib/movement-journey.ts#L61-L105) |
| — (nieuw gevonden) | **Profielvelden bestaan al:** `preferredSport` + `weeklyAvailability` persisteren via de movement-prefs-API | [movement-plan-profile.ts](../../src/lib/movement-plan-profile.ts) |

---

## Volgende stap na Opus-output

1. Dennis reviewt sectie **A** (verdicts) en **J** (roadmap + open vragen).
2. F1-implementatie in een aparte sessie: reis-rail-ontkoppeling + Vandaag-herpositionering.
3. F2: sessie-kaart-verdieping + resterende profielvelden.
4. F3: notificatielaag (cron + Resend-templates + in-app inbox).

Meetpunt: geen — dit document activeert niets. Het meetplan wordt in sectie I van de Opus-output gespecificeerd en pas bij implementatie geregistreerd.
