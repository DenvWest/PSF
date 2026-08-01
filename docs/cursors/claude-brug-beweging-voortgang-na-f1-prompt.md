# Prompt — De brug Beweging ↔ Voortgang na F1 (A + B + C)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus in een nieuw gesprek. Voeg de screenshots toe (bijlagen-checklist).
>
> **Output:** uitsluitend IA + wireframes + meetplan + slice-indeling — geen code, geen diffs, geen bestandspatches.
>
> **Opgesteld:** 30 juli 2026, ná F1a. Harde context geverifieerd tegen `main` (commit `9777d5d`, working tree schoon).

## Plaats in de reeks

| Doc | Levert | Relatie tot dit doc |
| --- | --- | --- |
| [`claude-beweging-helderheid-product-ia-prompt.md`](claude-beweging-helderheid-product-ia-prompt.md) | de prompt die het besluit uitlokte | voorganger — **niet heropenen** |
| [`BESLUIT_BEWEGING_PRODUCT_EN_IA.md`](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md) | product + IA Beweging, F1/F1b/F2/F3 | **de lock** — dit doc voert §C.1 surface 3, §E.3 en §G uit |
| [`voortgang-plan-later.md`](../design/voortgang-plan-later.md) | "Voortgang meet, Mijn Dag doet" + v1-voorkeur | gelockte laag-scheiding + compositie-referentie |
| [`claude-opus-voortgang-verdunning-conversiekaart-2026-07.md`](claude-opus-voortgang-verdunning-conversiekaart-2026-07.md) | v1-compositiemodel Voortgang | referentie voor de ontvangende kant |
| [`ROADMAP_DASHBOARD_COCKPIT.md`](../core/ROADMAP_DASHBOARD_COCKPIT.md) | analyse · plan · agenda · evidence | SSOT-lagen |

**Verschil met de vorige prompt.** Die mocht de drie Beweging-surfaces killen. Deze mag dat níet — F1a is
geland en is DONE. Deze prompt gaat over de éne naad die F1a bewust open liet: de ring, de lijn en de
beweegcheck zijn van Beweging *verwijderd* maar nergens *ontvangen*.

**Scope: één brug.** Niet alle domeinen tegelijk het F1-patroon opdrukken — zie de KILL in de prompt.

---

## Gebruiksinstructie

1. Open Claude Opus (nieuw gesprek).
2. Voeg bijlagen toe (checklist onderaan) — **zonder screenshots geen wireframe-oordeel**, dat was de fout van de vorige ronde.
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Verwachte output: secties **A t/m H** exact.
5. Review **A** (verdicts) en **C** (ontvangst-IA) → daarna pas de Cursor-prompt voor de brug-slice.

---

## Prompt (copy-paste)

```text
ROL: Je bent Senior Product Strategist + UX Information Architect voor
PerfectSupplement (perfectsupplement.nl). Je sluit één specifieke naad: de
analyse die in F1 van Beweging is weggehaald, is nergens ontvangen. Je ontwerpt
de brug Beweging ↔ Voortgang, en je ontwerpt (nog niet bouwt) de advies-deur
erachter.

OUTPUT-CONTRACT: uitsluitend informatiestructuur + wireframes + meetplan +
slice-indeling. GEEN code, GEEN diffs, GEEN JSX, GEEN Tailwind, GEEN
bestandspatches, GEEN "ik ga nu bouwen". Output in het Nederlands;
identifiers/veldnamen/componentnamen in het Engels.

Lees CLAUDE.md mee als je het hebt.

═══════════════════════════════════════════════════════════════════════════════
BIJLAGEN (door Dennis)
═══════════════════════════════════════════════════════════════════════════════

1. VERPLICHT: screenshot Beweging 375px — OPEN-staat (stap nog niet gedaan),
   first viewport + gescrolld tot onderaan.
2. VERPLICHT: screenshot Beweging 375px — KLAAR-staat (na afvinken), gescrolld
   tot onderaan, zodat de beweegcheck-CTA en het voeding/supplementen-blok
   zichtbaar zijn.
3. VERPLICHT: screenshot Voortgang hub 375px — hero + de meetlat-tegel
   ("Wat je van jezelf weet") + wat eronder staat.
4. VERPLICHT ALS BESCHIKBAAR: screenshot Statistieken — alle drie de blikken
   (Stand / Advies / Over tijd), of noteer welke leeg of onbereikbaar is.
5. OPTIONEEL: screenshot van de sheet "Jouw programma"; BESLUIT_BEWEGING_
   PRODUCT_EN_IA.md; voortgang-plan-later.md.

Als een verplichte bijlage ontbreekt: benoem dat expliciet in sectie A en label
elk oordeel dat erop steunt als AANNAME. Verzin geen schermstaat.

═══════════════════════════════════════════════════════════════════════════════
WAAROM DEZE PROMPT BESTAAT
═══════════════════════════════════════════════════════════════════════════════

F1a is gedeployd: Beweging is één doe-surface met één sheet en één positieregel.
De drie surfaces, de tabbalk en de routes zijn weg. Dat deel werkt.

Maar het besluit beloofde meer dan verwijderen. §C.1 (surface 3), §C.3 en §E.3
zeggen dat de score-ring, de sparkline, de richtlijn-context, de bouwfase-
geschiedenis en de uitgebreide beweegcheck naar Voortgang VERHUIZEN. Ze zijn
alleen verwijderd. Voortgang ontvangt niets, en er is geen deur terug: klikken
op de pijler "beweging" in Voortgang stuurt je naar de DOE-surface, niet naar
een analysescherm. De L2-laag van Beweging bestaat op dit moment nergens.

Dat is niet alleen een gat in het ontwerp, het blokkeert de meting: §H.1 wil
analyse-engagement apart aflezen via `dashboard_beweging_voortgang_click`, en
dat event bestaat niet in de code omdat de deur niet bestaat.

Tegelijk is er een tweede, commerciële naad: de advieslaag op Voortgang bestaat
al (Statistieken › Advies), maar wordt uitsluitend door de voedingscheck gevoed.
Beweging levert er geen signaal aan en heeft er geen ingang in — terwijl de
supplementenlijst nog gewoon op de Beweging-footer staat, precies waar de
kill-list hem weg wilde hebben.

JOUW JOB: ontwerp de ontvangst en de deur (taak A), ontwerp de ladder waarlangs
het persoonlijker wordt inclusief waar het commerciële advies aansluit (taak B),
en parkeer de rest expliciet zodat hij geen scope wordt (taak C).

═══════════════════════════════════════════════════════════════════════════════
WAT AL BESLOTEN EN GELAND IS — F1a IS DONE, NIET HEROPENEN
═══════════════════════════════════════════════════════════════════════════════

Deze punten staan vast. Ze zijn gebouwd, ze zitten in productie-code, en ze zijn
GEEN onderwerp van deze ronde. Voorstellen die ze terugdraaien worden afgewezen,
hoe goed ook onderbouwd:

  - Beweging is ÉÉN surface. Geen Overzicht / Stappenplan / Programma, geen
    3-tabbalk, geen `?view=`-routes, geen doorway, geen journey-rail.
  - "Jouw programma" is één sheet, bereikbaar vanaf precies één regel.
  - De positieregel ("Je bouwt basis · week 3 · sinds 14 juli") vervangt
    "Fase 1 van 3" en blijft op de doe-surface.
  - MovementTodayHero is het enige afvink-oppervlak. Geen tweede vinklijst.
  - De engine wordt niet herbouwd: geen wijziging aan de scoring, de sessie-
    catalogus, de aanbevelingsresolver of de committed dose.
  - De zes canonieke termen en de verbodslijst uit §C.2 gelden onverkort.

Wat je WÉL mag doen: bepalen waar de weggehaalde analyse landt, hoe je er komt,
hoe je terugkomt, en wat daar dan precies staat.

═══════════════════════════════════════════════════════════════════════════════
HARDE CONTEXT — GEVERIFIEERD 30 JULI 2026, NÁ F1a (commit 9777d5d)
Neem dit als waar aan. Verzin geen alternatieve staat. Oudere analysedocumenten
die hiermee conflicteren zijn verouderd.
═══════════════════════════════════════════════════════════════════════════════

BEWEGING — wat er nu staat

  BewegingScreen.tsx (279 regels)
    → MovementCockpit
    → footer: MovementLogPanel (achter isMovementLogEnabled()) · disclosure
      "Waarom bewegen na 40 anders werkt" (mechanism + medical aside)
    → en ALLEEN in de klaar-staat (done-boolean komt omhoog uit de cockpit):
      • beweegcheck-CTA "Doe de uitgebreide beweegcheck (3 min)" — md:hidden
      • blok "Voeding & supplementen": voedingscheck-hint + de supplementen-
        lijst met "Vergelijk"-links (dashboard_beweging_supplement_click,
        surface: "kompas_beweging")
      • FooterLinks "Gratis Bewegingsgids" en "Leefstijl & inzichten" — md:hidden

  MovementCockpit.tsx (172 regels), in deze volgorde
    1. MovementTodayHero (voorstel + Gedaan + Ik doe de korte)
    2. regel "Je programma · {label}, {frequency} ›" → opent MovementProgramSheet
    3. positieregel (buildMovementPositionLine)
    4. MovementWeekRhythm (alleen als startPattern gezet is)
    5. conditioneel: "Klopt dit voor jou?" → MovementStartChoice inline
    Geen ring. Geen sparkline. Geen rail. Geen richtlijn-context.

  MovementProgramSheet.tsx (570 regels) — vuurt dashboard.beweging_programma_open

  Navigatie: `?view=stappenplan` en `?view=programma` bestaan niet meer;
  KompasDeepView is uit dashboard-url.ts verwijderd. De desktop-rail
  (buildBewegingRailTools) heeft nog: checkin · supplementen · gids · inzichten.

  ⚠ ER IS GEEN ENKELE LINK VAN BEWEGING NAAR VOORTGANG.
    `dashboard_beweging_voortgang_click` komt nergens in de codebase voor.

VOORTGANG — wat er nu staat (door F1a niet inhoudelijk gewijzigd)

  VoortgangHub.tsx (704 regels) kent vijf schermen:
    hub · statistieken · favorieten · inzichten · lichaamssamenstelling
    Er is GEEN domein-scherm. Voor geen enkele pijler.

  hub = VoortgangHubScroll.tsx, in deze volgorde:
    1. VoortgangHero — bewijsband + bewijsregel in vier staten
       (beantwoord / opbouwend / dun / wachtend), CTA's agenda + hermeting
    2. VoortgangDomeinRing — tegel "Je metingen · Wat je van jezelf weet"
    3. VoortgangRichtingBeat — → Statistieken (blik "advies")
    4. VoortgangRouteList — statistieken · favorieten · inzichten ·
       lichaamssamenstelling · begeleiding

  VoortgangDomeinRing.tsx (327 regels) — de meetlat. Per pijler één rij:
    kleurstip · label · sparkline 72×24 · bandlabel · DeltaBadge ·
    meta-regel "N metingen · X dagen geleden | nog niet apart gemeten"
    Interventiedomeinen boven, scheiding "VOLGT UIT DE REST", readout-domeinen
    onder. Per doel-domein een tweede regel: "Zet je eigen doel" / "Bijwerken".
    Klik op de rij → dashboard_voortgang_domein_click {domain}
                  → router.push(buildDashboardVandaagHref(domain))
                  → de DOE-surface. Er is geen L2-bestemming per domein.
    Wat de rij NIET toont: score-ring 0–100, baseline-marker, richtlijn-context
    (150–300 min), baselineSourceLabel, formatLastMeasured, bouwfase-historie.

  Statistieken = StatistiekenBlikNav + StatistiekenBlikPanels (426 regels),
  drie blikken:
    • stand  : WaarStaJeCard + LeefstijllijnSection (compact, focus-pijler) +
               cross-links + kaart Lichaamssamenstelling ("Binnenkort")
    • advies : EvidenceLadderCard → "Eerst je bord. Daarna pas een potje." →
               EerstJeBordCard → OnsOordeelCard (supplementVerdicts) →
               WelkPotjeCard → Favorieten (vergelijkingspagina's)
    • tijd   : LeefstijllijnSection (vol) + PremiumWaitlistCard

  ⚠ ER BESTAAT DUS AL EEN ADVIESLAAG OP VOORTGANG. Hij wordt gevoed door de
    voedingscheck en de nutriënt-verdicts. Beweging heeft er geen ingang in en
    levert er geen signaal aan — maar de supplementenlijst staat wél nog op de
    Beweging-footer. De F2-deur is dus geen nieuwe surface, maar een
    AANSLUITING plus een verhuizing.

  Voorkeur Dennis (voortgang-plan-later.md, 30 jul): het v1-compositiemodel
  (conversiekaart: hero, stage-model, rail-inventaris) bevalt beter dan de
  v2-niveau/kruimelpad-herbouw van Statistieken. v2's kruimelpad is NIET
  automatisch de volgende stap. Als je hem tóch wilt, moet je dat verdedigen.

EVENTS DIE BESTAAN (GA4 tenzij anders vermeld)
  Beweging   : dashboard_vandaag_action_toggled · dashboard_vandaag_step_
               alternative · dashboard_vandaag_card_shown · movement_week_
               category · movement_sport_selected · movement_gap_shown ·
               dashboard_beweging_checkin_click · dashboard_beweging_voeding_
               click · dashboard_beweging_supplement_click · dashboard_beweging_
               gids_click · dashboard_beweging_leefstijl_click
  Voortgang  : dashboard_voortgang_domein_click · dashboard_voortgang_doel_click
               · dashboard_voortgang_hub_click · dashboard_voortgang_bewijs_
               state · dashboard_voortgang_terug · dashboard_statistieken_blik ·
               dashboard_statistieken_blik_switch · dashboard_advies_blok_
               getoond · dashboard_aanrader_click · dashboard_verdict_click
  Durable    : dashboard.beweging_programma_open · dashboard.advies_gate_passed
  ONTBREEKT  : dashboard_beweging_voortgang_click (§H #6) · movement.nudge_sent
               (F1b) — beide nog niet gebouwd

═══════════════════════════════════════════════════════════════════════════════
GELOCKTE BESLUITEN — respecteer; alleen als PIVOT met sterke onderbouwing
bediscussieerbaar, en dan expliciet gemarkeerd in sectie A
═══════════════════════════════════════════════════════════════════════════════

1.  Voortgang meet, Mijn Dag doet. Geen afvinken, geen todo's, geen dagenteller
    en geen vooruitblik op wat je nog moet in Voortgang.
2.  Eén afvink-oppervlak in het hele product: de dagstap op de doe-surface.
3.  Minuten uit het gedaan-log zijn evidence, nooit een tweede score.
4.  Dagstap blijft gratis. Premium raakt "wanneer / automatisch bijgesteld".
5.  Geen streaks, badges, calorieën-als-hero of schuld-mechaniek.
6.  Geen medische claims of diagnose-taal.
7.  Geen gezondheidscontext (AVG art. 9) in e-mailonderwerp of preview.
8.  Geen affiliate-link direct vanuit het dashboard; de vergelijkingspagina is
    de bestemming, daar staan de gemarkeerde links al.
9.  Advies toont geen producten zolang de voedingscheck ontbreekt, en is nooit
    prominenter dan de open stap van vandaag.
10. B2B/white-label is horizon: geen multi-tenant, geen coach-portal, geen
    organisatie-UI. Alleen de naad schoon houden.
11. Nieuw client-event = registratie op drie plekken benoemen (events.ts,
    intake-events-client.ts, allowlist in api/intake/events/route.ts).
12. Verboden UI-woorden blijven verboden: stappenplan · route · fase · spoor ·
    startpatroon · categorie · cockpit · kompas · journey · deep view ·
    overzicht (als navigatielabel) · coming soon.

CASHFLOW-PRIORITEIT (hard, gebruik dit om te wegen bij elk verdict)
  L3 vergelijken/affiliate = de omzet-as — eerste prioriteit ná de brug.
  Oefeningen/programma-inhoud = retentie — belangrijk, geen omzet.
  Data/wearable/B2B = horizon — geen bouwscope in deze ronde.
  Als een voorstel geen van deze drie dient, hoort het op de parklijst.

═══════════════════════════════════════════════════════════════════════════════
DE ENE VRAAG VAN DEZE RONDE
═══════════════════════════════════════════════════════════════════════════════

  "Waar landt de analyse van Beweging, hoe kom je erheen vanaf de doe-surface,
   hoe kom je terug — en wat mag daar nog meer aan hangen zonder dat het
   scherm weer een cockpit wordt?"

Alles wat die vraag niet beantwoordt, hoort in sectie H (parklijst).

═══════════════════════════════════════════════════════════════════════════════
TAAK A — DE BRUG (primaire deliverable)
═══════════════════════════════════════════════════════════════════════════════

A1. DE ROUTERINGSKEUZE. Kies er precies één en verdedig hem tegen de andere
    drie. Dit is de kernbeslissing van dit document.

    Optie 1 — nieuw scherm "Voortgang › Beweging" als zesde VoortgangHub-scherm.
              Pijlerrij → dat scherm. Doe-surface bereikbaar via een CTA daar.
    Optie 2 — Statistieken wordt object-gestuurd: pijlerrij → Statistieken met
              het domein als onderwerp, binnen de bestaande drie blikken.
              (Let op: dit leunt richting het v2-niveau-model dat Dennis niet
              automatisch wil — verdedig het expliciet als je hier kiest.)
    Optie 3 — de meetlat-rij klapt in de hub zelf open (accordeon, één open rij),
              geen nieuw scherm.
    Optie 4 — de klik blijft naar de doe-surface gaan; de analyse landt
              uitsluitend in Statistieken, zonder domein-ingang vanaf de rij.

    Beoordeel elk op: kosten (nieuw scherm vs. bestaand), of de belofte uit
    §C.1 surface 3 ("bestaat al, wordt niet herbouwd") waar blijft, wat het doet
    met de 7 pijlers die straks hetzelfde willen, en of de advies-deur er later
    schoon aan hangt.

A2. WAT ER PRECIES ONTVANGEN WORDT. Neem de complete verhuislijst uit §E.3 en
    plaats elk item: score-ring 0–100 + baseline-marker · delta-badge · sparkline
    + "Begin 55 · nu 58" · baselineSourceLabel · richtlijn-context 150–300 min ·
    formatLastMeasured + "verandert bij je hermeting" · bouwfase-geschiedenis ·
    uitgebreide beweegcheck-CTA.
    Per item: WAAR het landt, of het één-op-één overgaat of van vorm verandert,
    en wat er gebeurt als de onderliggende data ontbreekt (nooit gemeten, één
    meting, geen beweegcheck). Items die je niet wilt ontvangen: KILL met reden.

A3. DE DEUR VANAF BEWEGING. Ontwerp de terugweg: label, plaats (boven/onder de
    vouw), gedrag in de open-staat vs. de klaar-staat, en waarom hij in de
    open-staat niet met de primary concurreert. Eén deur, niet twee.

A4. WAAR DE BEWEEGCHECK LEEFT. Nu: klaar-staat-CTA op Beweging (md:hidden) +
    een rail-item op desktop. §E.3 zegt: primair naar Voortgang, op Beweging
    alleen conditioneel ("je voorstel draait nog op je intake"). Maak dat
    concreet: welke conditie, welke copy, welk gedrag op desktop, en wat er met
    het rail-item gebeurt.

A5. DE ZEVEN-PIJLER-TOETS. Beschrijf in max 8 regels wat er gebeurt als slaap,
    stress, energie, herstel, voeding en verbinding morgen dezelfde ontvangst
    willen. Als jouw keuze uit A1 dan zes keer hetzelfde werk vraagt, is het de
    verkeerde keuze — laat zien dat het niet zo is, of kies anders.

A6. EDGE CASES (2–4 regels per case): nooit een beweegcheck gedaan · precies
    één meting (geen lijn) · hermeting openstaand · gebruiker zonder account ·
    domein dat "volgt uit de rest" is (energie/herstel) en dus geen eigen
    doe-surface heeft.

═══════════════════════════════════════════════════════════════════════════════
TAAK B — PERSONALISATIE-LADDER + DE L3-DEUR (ontwerp, geen bouwopdracht)
═══════════════════════════════════════════════════════════════════════════════

B1. DE LADDER. Beschrijf hoe Beweging persoonlijker wordt zonder workout-builder
    en zonder tweede engine, in vier treden met een expliciete volgorde:
      nu   — analyse woont op Voortgang, Beweging blijft tiny habit
      F2   — herkomst van elke instelbare waarde in de sheet ("advies" /
             "jouw keuze" / "volgt uit …"); sport telt zichtbaar mee in de week
      F3   — trainingBackground / fase-aware dosis (de enige echte engine-stap)
      later— wearable-signalen uitsluitend als evidence-input naar Voortgang
    Per trede: wat de gebruiker merkt, wat het vereist, en wat het NIET wordt.
    Bevestig of weerleg deze volgorde — als je hem omgooit, onderbouw waarom.

B2. DE ADVIES-DEUR (L3). Ontwerp de aansluiting op de BESTAANDE Statistieken ›
    Advies, niet een nieuwe surface. Beantwoord:
      - Wat is het beweeg-signaal dat Advies binnenkomt, en is dat sterk genoeg
        om een supplement-verdict te rechtvaardigen? (Wees streng: als het
        antwoord "nee" is, zeg dat — dan is de deur alleen een verhuizing.)
      - Waar in de advies-ladder landt de supplementenlijst die nu op de
        Beweging-footer staat, en welke copy vervangt hem op Beweging?
      - Blijft de nutrient-bridge na een gelogde krachtsessie op Beweging staan
        (§G.2: educatief, naar de gids, getriggerd op bewijs)? Ja/nee + reden.
      - Hoe blijft stepped care intact als de twee poorten (basis staat,
        doe-taak klaar) niet gehaald worden — wat ziet de gebruiker dan?
      - Waar zit de grens tussen advies en schap, in één toetsbare regel.

B3. WAT DE FIRST VIEWPORT VAN BEWEGING NOOIT MAG ZIEN. Herbevestig in max 5
    regels, en toets je eigen B2-ontwerp daar hardop tegen.

═══════════════════════════════════════════════════════════════════════════════
TAAK C — PARKLIJST (kort, expliciet, niet uitwerken)
═══════════════════════════════════════════════════════════════════════════════

Per item: 3–5 regels. WAT er geparkeerd is · WAAROM nu niet · WAT er eerst moet
bestaan voordat het terug mag (dezelfde vorm als voortgang-plan-later.md) · in
welke slice het op zijn vroegst terugkomt. Geen ontwerp, geen wireframe.

  C1. F1b — de dagelijkse e-mailnudge (Resend). Waarom een eigen deploy en een
      eigen meetvenster, en waarom hij ná de brug komt en niet ervoor.
  C2. Wearable-signalen als evidence-input.
  C3. n8n als trigger-laag voor nudges/alerts.
  C4. Community / wachtlijst (zelfde regel als de begeleiding-ghost: pas als er
      een product ís om op te wachten).
  C5. De andere zes domeinen het F1-patroon geven.

═══════════════════════════════════════════════════════════════════════════════
EXPLICIETE KILL — dit is GEEN opdracht in deze ronde
═══════════════════════════════════════════════════════════════════════════════

  ✗ Slaap / stress / energie / herstel / voeding / verbinding nu hetzelfde
    één-surface-patroon opdrukken. Beweging had een engine en een catalogus;
    die domeinen hebben dat niet. Kopiëren levert lege schillen of opnieuw drie
    surfaces. Besteed hier maximaal ÉÉN alinea aan (de herbruikregel uit A5) en
    geen wireframe, geen surface-kaart, geen kill-list per domein.
  ✗ De movement-engine herbouwen, de scoring wijzigen, of een tweede
    habit-engine introduceren.
  ✗ Multi-tenant, coach-portal, organisatie-UI, rolmodel.
  ✗ NLP/medische interpretatie van vrije tekst.
  ✗ Producten of koop-CTA's in de first viewport van de doe-surface.
  ✗ Een vierde Beweging-surface, onder welke naam dan ook.

═══════════════════════════════════════════════════════════════════════════════
KRITIEKRONDE (verplicht vóór de definitieve versie)
═══════════════════════════════════════════════════════════════════════════════

Beoordeel je eigen A+B vanuit vier perspectieven. Per perspectief 2 scherpe
kritiekpunten + 1 verbetering; verwerk ze en markeer wat je wijzigde:

1. 45-jarige man, drukke week, opent Voortgang op zijn telefoon en wil in vijf
   seconden weten of het werkt — niet of hij iets moet.
2. Gedragswetenschapper: wat doet het zien van een score met iemand die net
   niets gedaan heeft? Wanneer is analyse demotiverend?
3. Front-end realist: hoeveel nieuw oppervlak is dit echt, en welke van de vier
   routeringsopties is het goedkoopst om te bouwen én terug te draaien?
4. Product-eigenaar: brug-effect, advies-effect en alert-effect mogen niet in
   één blended cijfer eindigen (§H.1). Toets je eigen meetplan hardop.

═══════════════════════════════════════════════════════════════════════════════
OUTPUTFORMAAT (exact deze secties, in deze volgorde)
═══════════════════════════════════════════════════════════════════════════════

A. Executive summary
   - Eén zin: waar de analyse van Beweging landt en hoe je er komt.
   - De routeringskeuze (1/2/3/4) met de kern-onderbouwing in 3 regels.
   - Verdict-tabel GO / PIVOT / KILL, één zin per rij, minimaal voor:
     score-ring op Voortgang · sparkline/lijn per pijler · richtlijn-context ·
     bouwfase-geschiedenis · beweegcheck-CTA op Voortgang · beweegcheck-CTA op
     Beweging (conditioneel) · rail-item Beweegcheck · deur Beweging→Voortgang ·
     klikgedrag meetlat-rij (nu naar doe-surface) · nieuw scherm
     "Voortgang › Beweging" · supplementenlijst op Beweging-footer ·
     nutrient-bridge na krachtsessie · advies-deur als sectie in Statistieken ·
     v2-kruimelpad/niveau-model · zeven-pijler-uitrol nu.
   - Ontbrekende bijlagen + welke oordelen daardoor AANNAME zijn.

B. Diagnose van de naad
   Tabel: probleem | gebruikersimpact | root cause | raakt welk oppervlak.
   Max 8 rijen, gesorteerd op impact. Alleen de Beweging↔Voortgang-naad.

C. Ontvangst-IA
   De gekozen routering uitgewerkt: welk scherm/onderdeel, welke primaire vraag,
   welke primary CTA, welke SSOT-laag, wat er expliciet NIET in mag. Plus de
   complete plaatsingstabel uit A2 (item | bestemming | vorm | leeg-staat).
   Plus: waar de beweegcheck leeft, in beide richtingen.

D. Wireframes 375px (ASCII, exact 375px-kader zoals in het besluit-document)
   1. De ontvangende weergave in drie staten:
      (a) nooit apart gemeten  (b) één meting, geen lijn  (c) meerdere metingen
   2. De deur op Beweging, in de open-staat én de klaar-staat — toon genoeg
      context eromheen om te zien dat de first-viewport-regel niet breekt.
   Per wireframe: wat in de viewport staat, wat eronder, en het CTA-label (NL).

E. Personalisatie-ladder + advies-deur
   De vier treden uit B1 als tabel (trede | wat de gebruiker merkt | vereist |
   wordt het NIET). Daaronder de advies-deur uit B2, inclusief de eerlijke
   conclusie over de sterkte van het beweeg-signaal en de verhuizing van de
   supplementenlijst.

F. Meetplan
   Per nieuwe of herpositioneerde CTA: event, payload (geen PII), hergebruik of
   nieuw, en bij nieuw de drie registratieplekken. Harde eis: het BRUG-effect en
   het ADVIES-effect zijn met verschillende events in verschillende vensters af
   te lezen, en geen van beide vervuilt de regressiewacht
   `dashboard_vandaag_action_toggled`. Benoem expliciet wat er in het brugvenster
   NIET mag veranderen. Sluit af met:
   "Meetpunt: <event(s)> — hier lees je het effect af."

G. Slice-indeling
   Genummerde slices die één-op-één naar een Cursor-prompt kunnen. Per slice:
   naam, user-visible resultaat, acceptatiecriteria (toetsbaar, geen
   implementatietaken), wat er NIET in zit, en welk meetvenster hij opent of
   sluit. Minimaal: de brug-slice, de advies-slice. Geef de deploy-volgorde
   t.o.v. F1b (e-mail) met reden.

H. Parklijst + open vragen
   De vijf items uit taak C in het "wat er eerst moet bestaan"-format. Daarna
   genummerde open vragen voor Dennis — elk met JOUW aanbevolen antwoord. Geen
   open vraag zonder voorkeur.

Sluit af met SELF-SCORECARD (1–10 + één regel) op:
  helderheid van de routeringskeuze · trouw aan de F1a-lock · realisme van de
  bouwlast · commercie-discipline · meetbaarheid van brug vs. advies.

En ANTI-PATTERNS die je ontwerp vermijdt (minimaal: een vierde Beweging-surface,
analyse die als oordeel leest, een tweede vinklijst in Voortgang, een deur die
met de primary concurreert, een advieslaag die een schap wordt, zes domeinen
tegelijk verbouwen).

═══════════════════════════════════════════════════════════════════════════════
CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- GEEN code, GEEN diffs, GEEN patches, GEEN bestandsnamen als opdracht.
- GEEN heropening van F1a.
- GEEN uitwerking van de andere zes domeinen (max één alinea herbruikregel).
- GEEN multi-tenant / coach-portal / organisatie-UI.
- GEEN nieuwe engine, GEEN scoring-wijziging, GEEN tweede habit-engine.
- GEEN medische claims, GEEN NLP-interpretatie van vrije tekst.
- GEEN producten in de first viewport van de doe-surface.
- Houd Voortgang en doen gescheiden — ook in de deur die je ontwerpt.
- Als je een gelockt besluit PIVOTt: markeer het expliciet in sectie A en geef
  het sterkste tegenargument dat je hebt. Anders respecteer de lock.
- Schrijf alsof Dennis morgen op basis hiervan een Cursor-prompt schrijft.
```

---

## Bijlagen-checklist (voor Dennis)

- [ ] Beweging 375px — open-staat, first viewport
- [ ] Beweging 375px — open-staat, gescrolld tot onderaan
- [ ] Beweging 375px — klaar-staat, gescrolld (beweegcheck + voeding/supplementen zichtbaar)
- [ ] Voortgang hub 375px — hero + meetlat-tegel
- [ ] Statistieken — Stand / Advies / Over tijd (of noteer welke leeg is)
- [ ] Optioneel: sheet "Jouw programma", [`BESLUIT_BEWEGING_PRODUCT_EN_IA.md`](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md), [`voortgang-plan-later.md`](../design/voortgang-plan-later.md)

## Wat je daarna doet met de output

1. Sectie **A** (routeringskeuze + verdicts) en **C** (ontvangst-IA) reviewen — dat is het besluit.
2. Bij akkoord: Cursor-prompt voor **de brug-slice** uit sectie G. Niet de advies-slice tegelijk — dan is het
   brugvenster onbruikbaar (§H.1 van het besluit-document).
3. Meetplan uit **F** meenemen in dezelfde wijziging als de UI.
4. Pas ná een leesbaar brugvenster: de advies-slice, dan F1b (e-mail).

## Verificatie-log (30 jul 2026, ná F1a)

Gecontroleerd tegen `main` @ `9777d5d`, working tree schoon:

- Beweging-surface: [`BewegingScreen.tsx`](../../src/components/dashboard/BewegingScreen.tsx) · [`MovementCockpit.tsx`](../../src/components/dashboard/beweging/MovementCockpit.tsx) · [`MovementProgramSheet.tsx`](../../src/components/dashboard/beweging/MovementProgramSheet.tsx)
- Voortgang-hub: [`VoortgangHub.tsx`](../../src/components/dashboard/VoortgangHub.tsx) · [`VoortgangHubScroll.tsx`](../../src/components/dashboard/voortgang/VoortgangHubScroll.tsx) · [`VoortgangDomeinRing.tsx`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)
- Statistieken + bestaande advieslaag: [`StatistiekenBlikNav.tsx`](../../src/components/dashboard/voortgang/StatistiekenBlikNav.tsx) · [`StatistiekenBlikPanels.tsx`](../../src/components/dashboard/voortgang/StatistiekenBlikPanels.tsx)
- Routering pijlerrij → doe-surface: `VoortgangHub.tsx` regel 693–695 (`buildDashboardVandaagHref`)
- Ontbrekend event bevestigd: `grep -rn "dashboard_beweging_voortgang_click" src/` → 0 treffers
- Rail na F1a: [`context-rail.ts`](../../src/lib/context-rail.ts) `buildBewegingRailTools()` → checkin · supplementen · gids · inzichten
- Voorkeur v1 boven v2: [`voortgang-plan-later.md`](../design/voortgang-plan-later.md) kop "Voorkeur (30 jul 2026)"
