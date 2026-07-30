# Besluit — Beweging: wat het product is, en hoe de surfaces liggen

> **Status: productbesluit + informatiestructuur. Geen code, geen implementatieslices.**
> Opgesteld 30 juli 2026. Geverifieerd tegen `main`: `src/components/dashboard/BewegingScreen.tsx`,
> `src/components/dashboard/beweging/*` (13 componenten, 3.143 regels), `src/lib/movement-*.ts` (23 modules),
> `src/lib/events.ts` (`DOMAIN_EVENT_TYPES`).
> **Aanvulling op** `docs/plan/BLAUWDRUK_ADAPTIEF_BEWEEGSYSTEEM.md` — die beschrijft *waarom de lus niet voelbaar is*.
> Dit document beslist *welke surfaces er overblijven en wat er per surface primair is*.
>
> **Bijlagen die ontbraken.** De drie verplichte screenshots zijn niet aangeleverd. Ik heb de surfaces in plaats
> daarvan uit de code geverifieerd (compositie, blokvolgorde, CTA-labels, tracking). Wat ik daardoor **niet** kan
> beoordelen: exacte pixelhoogtes en of de eerste viewport op 375px vandaag méér of minder toont dan ik aanneem.
> Waar dat het besluit raakt, staat het als open vraag in §I.

---

## A. Executive summary

### A.1 De noordster-zin

> **Wanneer een man 40+ Beweging opent, krijgt hij binnen 5 seconden het antwoord
> *"dit is wat vandaag telt, en dit is waarom juist dit"* en één actie: *dat afvinken*
> (of het in één tik kleiner maken). Alles andere is secondary of elders.**

De sleutel zit in de koppeling. Dennis vraagt twee dingen tegelijk — *wat kan ik doen* én *waar sta ik*. Die
lijken twee primaries, en dat is precies waarom het scherm nu uit elkaar valt in een hero plús een ring plús een
route. De oplossing is niet ze naast elkaar zetten maar **ze in elkaar schuiven**: waar je staat is niet een eigen
blok, het is de *reden* onder de actie. Analyse wordt de rechtvaardiging van het voorstel, geen concurrent ervan.

### A.2 Lagenkaart

| Laag | Vraag | Primaire surface | Mag secondary voorkomen op | Mag nooit |
|---|---|---|---|---|
| **L1 Bewustwording / tiny habit** | Wat is nu de makkelijkste winst, en is dat genoeg? | **Beweging** (de enige doe-surface) | Mijn Dag (cross-domein) · e-mail-alert | Voortgang |
| **L2 Analyse / positie / voortgang** | Waar sta ik, wat betekent dat, beweegt het? | **Voortgang › Beweging** | Eén regel op Beweging, als reden onder de actie | Als tweede score naast de check-score |
| **L3 Advies / vergelijk / product** | Wat past bij mij, wat is prijs-kwaliteit? | **Advies** (bereikbaar vanuit Voortgang) | Eén regel op Beweging **alleen** in de klaar-staat | In de eerste viewport van Beweging, in welke staat dan ook |

**De regel die de drie lagen uit elkaar houdt** — en dit is het structurele antwoord op de commercie-vraag:

> **Analyse en advies mogen pas prominenter worden wanneer de doe-taak van vandaag klaar is.**
> Niet als tijdsregel, maar als toestandsregel in de UI. Zolang er een open stap staat, is de doe-laag de enige
> primary. Is er niets meer te doen — afgevinkt, rustdag, of een andere pijler heeft prioriteit — dan is er
> ruimte, en dan pas verschijnt de deur naar analyse en advies. Stepped care wordt daarmee geen belofte in copy,
> maar een **conditie in de rendering**.

### A.3 Verdict-tabel

| # | Item | Verdict | Onderbouwing in één zin |
|---|---|---|---|
| 1 | Surface **Overzicht** (naam + rol) | **PIVOT** | Wordt de énige Beweging-surface en verliest zijn naam: als er één surface is, heet die gewoon *Beweging*. |
| 2 | Surface **Stappenplan** | **KILL** | Een leesbestemming die eindigt in *"Afvinken doe je in Overzicht"* is per definitie een omweg naar de plek waar je al was. |
| 3 | Surface **Programma** | **PIVOT** | Geen bestemming meer maar één sheet *Jouw programma*, bereikbaar vanuit precies één plek — de oefeningen zijn detail bij het voorstel, geen eigen scherm. |
| 4 | **MovementJourneyRail** / "Jouw route" | **KILL** | Een navigatiemetafoor over een plan met één actieve stap; hij verkoopt een reis die de gebruiker in één regel afgelezen wil hebben. |
| 5 | **MovementSportLens** als eigen blok | **KILL als blok, PIVOT als input** | Interactie die zichzelf aankondigt als effectloos is de duurste UI die er is; de sportkeuze verhuist naar één regel in *Jouw programma* en gaat de weekbalans écht voeden. |
| 6 | Score-ring **"Waar je staat"** op Overzicht | **PIVOT** | De ring is het beste analyse-object dat je hebt en staat op het verkeerde scherm; hij verhuist heel naar Voortgang en laat één regel achter. |
| 7 | **Tier-picker** Herstel/Matig/Trainen | **PIVOT** | Van keuze-vóór-antwoord naar bijstelling-ná-voorstel: een man met matige motivatie moet geen formulier invullen om te weten wat hij kan doen. |
| 8 | **"Open Mijn Dag"** als secondary CTA | **PIVOT** | Blijft bestaan maar verdwijnt uit de eerste viewport — vanaf Beweging is Mijn Dag een zijstap, geen vervolg. |
| 9 | **Uitgebreide beweegcheck-CTA** op Overzicht | **PIVOT** | Meten is geen doen; de CTA verhuist naar Voortgang en komt op Beweging alleen terug als het advies aantoonbaar op oude data draait. |
| 10 | **Voeding/supps-footer** op Overzicht | **PIVOT** | De voedingsregel blijft als leefstijl-eerst-brug, de supplementenlijst verdwijnt van de doe-surface — permanent gestapeld advies is geen advies maar een schap. |
| 11 | **Mobiele 3-tabs** Overzicht/Stappenplan/Programma | **KILL** | Eén surface heeft geen tabs nodig, en het opheffen ervan lost meteen de desktop/mobiel-asymmetrie op. |
| 12 | Ordinaal **"Fase 1 van 3"** | **KILL** | "1 van 3" communiceert *onderaan een ladder die iemand anders bepaalde*; vervangen door een kwalitatieve positieregel. |
| 13 | **Tiny-habit alert (F1)** | **GO, met splitsing** | De in-app "alert" is geen alert maar de hero zelf (ships in F1a); een echt bericht kan zonder push alleen e-mail zijn en gaat als F1b achter een eigen opt-in. |
| 14 | **Commercieel advies** gekoppeld aan beweging | **PIVOT op de oude lock** | Koop-CTA's blijven uit de doe-surface, maar krijgen wél een plek: één vergelijk-deur, achter de analyse, gated op de klaar-staat. |

### A.4 Wat dit product WÉL en NIET is

**WÉL — positionering (8 regels).**
Beweging in het dashboard is een **bewustwordingsengine met één haalbare stap per dag**. Het beantwoordt precies
twee vragen: *wat telt vandaag* en *waarom juist dit voor mij*. Het voorstel is altijd al gemaakt als je het
scherm opent — je kiest niet, je bevestigt of je maakt het kleiner. Het houdt bij wat je deed, in minuten en in
bewegingsvormen, als bewijs en nooit als tweede cijfer. Het legt uit waarom bewegen na 40 anders werkt, in één
regel bij het besluit dat die uitleg verklaart. Het is gratis op het punt waar het telt: wat je vandaag doet.
Het is de blauwdruk voor slaap, stress, energie en herstel — wat hier klopt, schaalt daarheen.
En het weet wanneer het moet zwijgen: geen open taak betekent geen aandacht vragen.

**NIET — vijf concrete ontwerpverboden.**

1. **Geen scherm dat een keuze eist vóór het een antwoord geeft.** Elke picker, tier-selectie of configuratie die
   tussen het openen en het voorstel staat, is verboden. Het voorstel komt eerst; besturing staat eronder.
2. **Geen tweede plek waar je iets afvinkt, telt of aftikt.** Eén afvinkbare eenheid per dag, één bron
   (`daily_action_log`). Geen dagenteller, geen 14-dots-strip, geen checkbox in Voortgang, geen tweede vinklijst
   in *Jouw programma*.
3. **Geen permanent gestapeld advies.** Elk blok onder de vouw dat er altijd staat ongeacht wat de gebruiker deed
   — supplementenlijst, gidsen-links, begeleiding — is een schap, geen advies. Advies verschijnt op een trigger of
   verschijnt niet.
4. **Geen readout die telt wat je niet deed.** Geen "2 van 7 dagen", geen lege balken naast gevulde, geen
   rood/leeg als default-toestand. Een gat mag genoemd worden — maximaal één, als kans, nooit als saldo.
5. **Geen navigatie-item dat op zichzelf niets doet.** Geen tab die alleen naar een leesscherm leidt, geen
   `coming_soon`-variant in een keuzelijst, geen badge die belooft dat er iets klaarstaat. Bestaat het niet, dan
   staat het niet in de navigatie.

---

## B. Diagnose huidige frictie

Gesorteerd op impact. Elk probleem met de plek in de code waar het zit.

| # | Probleem | Gebruikersimpact | Root cause | Raakt |
|---|---|---|---|---|
| 1 | Drie surfaces beantwoorden dezelfde vraag met andere woorden | De gebruiker moet een glossarium leren (route/stappenplan/programma/plan/overzicht) voordat hij één stap kan zetten | Elke nieuwe behoefte kreeg een eigen bestemming in plaats van een plek in de bestaande hiërarchie | `BewegingViewNav`, `MovementCockpit`, `MovementPlanDeepBody`, `MovementProgramView` |
| 2 | Overzicht stapelt 8 blokken onder elkaar | Niets is primair, dus alles wordt gescand en niets gelezen; de afvink-CTA concurreert met zes andere aanknopingspunten | `BewegingScreen` voegt de footer toe aan een cockpit die al drie blokken heeft — twee componenten die niet van elkaars budget weten | `BewegingScreen.tsx:264-335` |
| 3 | De tier-picker staat vóór het antwoord | Wie moe is en matig gemotiveerd, moet eerst een beslissing nemen om te ontdekken wat hij had kunnen doen | `showStartChoice` blokkeert de hero zolang `startPattern == null` | `MovementCockpit.tsx:78-102` |
| 4 | CTA-versnippering over drie surfaces | Afvinken hier, oefeningen daar, dosis in een sheet — er is geen enkel pad dat begint bij "wat doe ik" en eindigt bij "gedaan" | De besturing is verplaatst naar waar ruimte was, niet naar waar de waarde staat | `MovementProgramCard` ↔ `MovementPlanAdjustSheet` |
| 5 | De UI verkondigt haar eigen onmacht | *"verandert nooit je programma"* leest als: wat ik invoer doet niets — schijn-autonomie is erger dan geen keuze | Interne eerlijkheid over een niet-gekoppelde lens werd user-facing copy | `MovementSportLens.tsx:62,132`, `MovementPlanAdjustSheet.tsx:155` |
| 6 | "Fase 1 van 3" als kop | Leest als *onderaan een ladder van iemand anders*; de ervaren 50-jarige krijgt hetzelfde label als de absolute beginner | `positionLabel` is ordinaal afgeleid uit de score, niet uit trainingsachtergrond | `MovementPlanRoadmap.tsx:80` |
| 7 | De score-ring domineert de doe-surface | Een getal van 0–100 met baseline-marker, delta-badge, sparkline en richtlijn-context — vier analyse-objecten boven de vouw op een scherm dat om actie vraagt | "Waar je staat" is als tile in de cockpit gezet in plaats van in Voortgang | `MovementCockpit.tsx:116-277` |
| 8 | Voeding/supps + gidsen + begeleiding permanent in de footer | Vier commerciële en educatieve uitgangen die er altijd staan, ongeacht wat de gebruiker deed of nodig heeft | Geen conditie op rendering; het blok is compositie, geen advies | `BewegingScreen.tsx:295-334` |
| 9 | Desktop mist de mobiele navigatie | Op desktop is *Programma* alleen via een doorway bereikbaar; `onOpenProgramma` wordt op Overzicht niet eens gebruikt | De 3-tabs zijn als mobiele pleister gebouwd, niet als navigatiemodel | `MovementCockpit.tsx:44`, `BewegingViewNav` |
| 10 | `kracht-sportschool` = `coming_soon` | Een keuze die tot een leeg scherm leidt beschadigt het vertrouwen in alle andere keuzes | De catalogus toont varianten die geen inhoud hebben | `MovementProgramView` |

---

## C. Doel-IA Beweging

### C.1 Surface-kaart — drie, waarvan één bestaand

#### Surface 1 — **Beweging** *(de doe-surface, default en enige entry)*

| | |
|---|---|
| **Primaire vraag** | Wat telt vandaag, en waarom juist dit voor mij? |
| **Primary CTA** | **Gedaan** — direct naast **Ik doe de korte** (beide vinken af, beide tellen volledig mee) |
| **SSOT-laag** | **agenda** (wanneer/wat staat er vandaag) + **evidence** (wat deed ik) |
| **Laag** | L1 primair. L2 als één regel. L3 alleen in de klaar-staat. |
| **Mag NIET bevatten** | score-ring · sparkline · baseline-marker · richtlijn-context · fase-as · route-rail · supplementenlijst · tweede vinklijst · oefeningencatalogus · een keuze die het voorstel blokkeert · een blok dat telt wat je niet deed |

#### Surface 2 — **Jouw programma** *(sheet, geen bestemming)*

| | |
|---|---|
| **Primaire vraag** | Wat is mijn programma precies, en wat kan ik eraan verzetten? |
| **Primary CTA** | **Bewaren** (na een wijziging) — er is geen andere primaire actie |
| **SSOT-laag** | **plan** (wat kan ik) |
| **Laag** | L1 secundair — dit is de besturing van de dagstap, geen tweede doe-oppervlak |
| **Bereikbaar via** | precies één plek: de regel *"Je programma · Zone 2, 2× per week"* onder de VANDAAG-kaart |
| **Mag NIET bevatten** | afvinkbare items · een dagenteller · een catalogus om doorheen te bladeren · varianten zonder oefeningen · de zin "afvinken doe je elders" · een score |

#### Surface 3 — **Voortgang › Beweging** *(bestaat al, wordt niet herbouwd)*

| | |
|---|---|
| **Primaire vraag** | Waar sta ik, beweegt het, en wat betekent dat? |
| **Primary CTA** | **Hermeten** wanneer die openstaat; anders geen — dit is een leesscherm |
| **SSOT-laag** | **analyse** (waar sta ik) |
| **Laag** | L2 primair. Draagt als enige de deur naar L3. |
| **Krijgt erbij** | de hele score-ring met baseline en delta · de sparkline · de richtlijn-context · de uitgebreide beweegcheck-CTA · de bouwfase-geschiedenis |
| **Mag NIET bevatten** | afvinken · todo's · dagenteller · vooruitblik op wat je nog moet |

**Waarom geen vierde.** Elke vierde surface moet een vraag beantwoorden die deze drie niet dekken. Die vraag is
er niet. *Stappenplan* beantwoordde "wat komt er nog" — dat is L2 en zit in Voortgang. *Programma* beantwoordde
"welke oefeningen" — dat is detail bij het voorstel en zit in de sheet.

### C.2 Naamgeving — zes canonieke termen

| Term | Betekent precies | Vervangt |
|---|---|---|
| **Beweging** | de pijler én de surface — er is er maar één, dus hij heeft geen bijnaam nodig | Overzicht (als label), beweeg-cockpit, kompas beweging |
| **Vandaag** | de dagstap; de enige eenheid die je kunt afvinken | dagstap, actieve stap, dagelijkse actie, tier |
| **Jouw programma** | wat je doet, hoe vaak, hoe lang, met welke oefeningen | stappenplan, plan, programma, route, sessie-variant, catalogus |
| **Gedaan** | het uitvoeringslogboek — minuten en vormen, als bewijs | session-log, gedaan-log, evidence, wat je deed |
| **Voortgang** | het meetscherm: score, lijn, hermeting | waar je staat, je lijn, statistieken, betekenis |
| **Mijn Dag** | de dag-overstijgende actielijst over alle pijlers | (blijft) |

**Verboden in UI-copy** — zonder uitzondering, ook niet in aria-labels of eyebrows:

> stappenplan · route · fase · spoor · startpatroon · categorie · cockpit · kompas · journey ·
> deep view · overzicht (als navigatielabel) · programma-catalogus · oefeningenbibliotheek · coming soon

De code-namen mogen blijven (`startPattern`, `KompasDeepView`, `MovementJourneyRail` tot hij weg is) — dit is een
copy-regel, geen refactor-opdracht. **"Fase" verdwijnt als woord, niet als engine:** `computeCurrentPhaseId` blijft
de progressiemotor, maar de gebruiker leest *"Je bouwt basis"*, nooit *"Fase 1"*.

**De vier-namen-bug expliciet opgelost.** *spoor* / *focus* / *startpatroon* / *categorie* → allemaal **"Jouw
programma"**, want dat is wat de gebruiker denkt dat hij instelt. Er is geen apart concept "focus" meer in de UI;
kracht/conditie/dagelijks ritme is gewoon een eigenschap van je programma.

### C.3 Kill-list met bestemming

| Wat | Waar het nu staat | Bestemming |
|---|---|---|
| Score-ring 128px + baseline-marker + delta-badge | Overzicht, blok 2 | **Voortgang** — ongewijzigd overzetten, dit is een goed object op het verkeerde scherm |
| Sparkline + "Begin 55 · nu 58" + `baselineSourceLabel` | Overzicht, blok 2 | **Voortgang** |
| "Ter context: de beweegrichtlijn is 150–300 min" | Overzicht, blok 2 | **Voortgang** — normreferentie hoort bij de meting, niet bij de stap |
| "verandert bij je hermeting" + `formatLastMeasured` | Overzicht, blok 2 | **Voortgang** |
| MovementJourneyRail (het hele component) | Overzicht, blok 3 | **Verwijderen** — de positieregel neemt de enige boodschap over |
| Fase-as + open fase-paneel | Stappenplan | **Voortgang** — als bouwfase-geschiedenis, één regel per fase |
| MovementProgramCard (3 chips zonder affordance) | Stappenplan | **Jouw programma** — samengevoegd met de adjust-sheet tot één blok met knoppen |
| MovementPlanAdjustSheet | Stappenplan | **Jouw programma** — idem; de merge is de kern-ingreep |
| MovementSportLens als blok + dekkingsbalken | Stappenplan | **Jouw programma** als één regel *"Wat je verder doet"*; de dekking voedt de weekbalans op Beweging |
| De vier onmacht-strings | Stappenplan / sport-lens | **Verwijderen** |
| "Afvinken doe je in Overzicht" (herhaald) | Stappenplan | **Verwijderen** — er is geen elders meer |
| mechanism-blok (3 alinea's, iedereen dezelfde) | Stappenplan | **Beweging**, onder de vouw, achter één disclosure — en op termijn variant-gekozen |
| medical aside | Stappenplan | **Beweging**, onder de vouw bij dezelfde disclosure |
| MovementProgramView als route | `?view=programma` | **Jouw programma** (sheet) |
| `coming_soon`-varianten | Programma | **Verwijderen uit de keuzelijst** — zie §E.4 |
| Uitgebreide beweegcheck-CTA (`md:hidden`) | Overzicht-footer | **Voortgang** als vaste CTA; op Beweging alleen conditioneel (§E.3) |
| Supplementen-lijst + "Vergelijk"-links | Overzicht-footer | **Advies** (§G) |
| Voedingscheck-hint | Overzicht-footer | **Beweging**, maar getriggerd: alleen na een gelogde krachtsessie, als één regel |
| `KompasBegeleidingLink` | Overzicht-footer | **Parkeren** — een wachtlijst mag terug zodra er een product ís (zelfde regel als `voortgang-plan-later.md` §8) |
| FooterLink "Gratis Bewegingsgids" | Overzicht-footer | **Beweging**, klaar-staat only |
| FooterLink "Leefstijl & inzichten" | Overzicht-footer | **Beweging**, klaar-staat only |
| BewegingViewNav (3 tabs) | mobiel, sticky | **Verwijderen** |
| MovementDoorway | Overzicht | **Verwijderen** — rendert al `null` zonder `onClick`; er is geen doorway meer nodig |

**Wat er expliciet blijft staan en niet aangeraakt wordt:** `MovementTodayHero` als enige afvink-oppervlak,
de training-gate, de exertie-microvraag, de recovery-hint, `MovementWeekRhythm` (wordt de weekbalans),
`MovementLogPanel` (wordt *Gedaan*, onder de vouw).

### C.4 Generieke regel voor de andere domeinen

Wat hier besloten wordt is **niet** "beweging krijgt één surface" maar een sjabloon: **elk leefstijldomein krijgt
precies één doe-surface, één besturings-sheet en een gedeeld meetscherm.** De doe-surface bedient altijd L1 en
opent altijd met een voorstel, nooit met een keuze; de analyse verschijnt daar uitsluitend als de één-regel-reden
onder dat voorstel; de besturing van het domein leeft in één sheet die vanaf precies één plek bereikbaar is; en
alle "waar sta ik"-objecten van alle domeinen komen samen in Voortgang, dat daarmee de enige plek wordt waar
vergelijking tussen domeinen überhaupt mogelijk is — en daarmee ook de enige logische drager van de advieslaag.
De klaar-staat-regel is domeinbreed: zolang een domein een open stap heeft, is dat domein een doe-surface en
niets anders. Slaap, stress, energie en herstel erven dit sjabloon zonder dat er per domein een IA-besluit nodig
is; alleen de inhoud van het voorstel en de eenheid van het bewijs verschillen.

---

## D. First-viewport contract + ASCII-wireframes 375px

### D.1 Het contract

**Maximaal drie contentblokken boven de vouw**, in deze volgorde — en de volgorde is een besluit, geen smaak:

1. **VANDAAG** — het voorstel, de waarom-regel, twee knoppen.
2. **Positieregel** — één regel, direct onder de kaart: waar je staat, als bevestiging achteraf.
3. **DEZE WEEK** — wat er staat + maximaal één open vorm als kans. *In staat (b) mag dit onder de vouw.*

**Waarom de positieregel ónder de kaart staat en niet erboven** — dit is gewijzigd na de kritiekronde (§K.2).
Om 21:40 op de bank is "Je bouwt basis · week 3" de minst dringende informatie op het scherm. Boven de kaart
kost hij de eerste blik; eronder is hij nog steeds binnen 5 seconden zichtbaar en werkt hij als wat hij is: de
rechtvaardiging van het voorstel dat je net gelezen hebt.

**Wat de gebruiker in ≤5 seconden moet snappen** — drie dingen, in deze volgorde:
*(1)* er staat één ding voor mij klaar en het is kleiner dan ik vreesde;
*(2)* het is voor mij gekozen, om een reden die ik in één regel begrijp;
*(3)* ik kan het nu afvinken, of in één tik nog kleiner maken zonder dat het minder telt.

**Wat eronder mag scrollen:** *Gedaan* (de laatste 3 momenten, uitklap naar alles) · de disclosure "Waarom dit
werkt na 40" met het mechanisme en de medische aside · de link naar Voortgang · de link naar Mijn Dag.

**Wat er onder geen enkele omstandigheid boven de vouw komt:** de score-ring, de sparkline, de fase-as, een
supplementenlijst, een gids-link, een tweede navigatiebalk.

### D.2 Wireframe (a) — eerste bezoek, geen prefs

Het huidige gedrag is: `MovementStartChoice` blokkeert de hero tot er een `startPattern` staat. Dat draait om.
Het systeem heeft scores uit de intake en kan altijd al iets voorstellen — dus stelt het voor, en vraagt pas
daarna of dat klopt.

```
┌──────────────────────────────────────┐  ← 375px
│ ‹ Beweging                           │
├──────────────────────────────────────┤
│ VANDAAG                              │
│                                      │
│ Wandelen · 15 minuten                │
│ Buiten, in je eigen tempo.           │
│                                      │
│ Dit is je eerste stap. Klein begint  │
│ niet voor niets klein — je bouwt     │
│ hiermee het ritme waar de rest op    │
│ staat.                               │
│                                      │
│ ┌──────────────┐ ┌─────────────────┐ │
│ │   Gedaan  ✓  │ │ Ik doe de korte │ │
│ └──────────────┘ └─────────────────┘ │
│                        (5 min, telt) │
│                                      │
│ Je programma · nog niet ingesteld  › │
├──────────────────────────────────────┤
│ Je begint hier. Vanaf je eerste      │
│ afvink telt het mee.                 │
├──────────────────────────────────────┤
│ ─────────────── vouw ─────────────── │
│                                      │
│ Klopt dit voor jou?                  │
│ We stelden wandelen voor op je       │
│ beweegscore. Zeg wat je wil en het   │
│ voorstel past zich aan.              │
│ ┌──────────────────────────────────┐ │
│ │ Stel je programma in (30 sec)  › │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ▸ Waarom bewegen na 40 anders werkt  │
└──────────────────────────────────────┘
```

**Primary CTA-label:** `Gedaan` · **naaststaand:** `Ik doe de korte`
**Geen** "Deze week"-blok in deze staat — er is nog niets om te tonen en een lege balkenrij als eerste indruk is
precies het tekortsignaal dat we verbieden.
**Geen** blokkerende picker. Het instellen staat onder de vouw, als aanbod, na de waarde.

### D.3 Wireframe (b) — terugkerend, stap nog niet gedaan

De hoofdstaat. Dit is het scherm dat het vaakst gezien wordt en waar alles op geoptimaliseerd is.

```
┌──────────────────────────────────────┐
│ ‹ Beweging                           │
├──────────────────────────────────────┤
│ VANDAAG                              │
│                                      │
│ Zone 2 · 30 minuten                  │
│ Aeroob tempo — je kunt nog praten.   │
│                                      │
│ Je gaf gisteren aan moe te zijn, dus │
│ staat er vandaag niets zwaars.       │
│                                      │
│ ┌──────────────┐ ┌─────────────────┐ │
│ │   Gedaan  ✓  │ │ Ik doe de korte │ │
│ └──────────────┘ └─────────────────┘ │
│                       (15 min, telt) │
│                                      │
│ Je programma · Zone 2, 2× p/week   › │
├──────────────────────────────────────┤
│ Je bouwt basis · week 3 · sinds      │
│ 14 juli                              │
├──────────────────────────────────────┤
│ DEZE WEEK                            │
│ Conditie en dagelijks bewegen staan. │
│ Kracht is nu je grootste winst —     │
│ één sessie is genoeg.                │
│ ─────────────── vouw ─────────────── │
│                                      │
│ GEDAAN                               │
│ ma 28   wandelen 25 min      licht   │
│ wo 30   Zone 2 30 min        matig   │
│ ▸ Alles                              │
│                                      │
│ ▸ Waarom bewegen na 40 anders werkt  │
│                                      │
│ Je voortgang en je lijn            › │
│ Al je acties van vandaag           › │
└──────────────────────────────────────┘
```

**Primary CTA-label:** `Gedaan` · **naaststaand:** `Ik doe de korte`
**De waarom-regel is conditioneel.** Is er geen vers herstelsignaal (≤7 dagen), dan staat er geen
herstel-uitspraak maar de programmareden: *"Dit past bij je programma van 2× per week."* Zwijgen over herstel
zonder verse bron is een harde regel (`BLAUWDRUK §10.3`).
**"Deze week" toont nooit een saldo.** Geen "1 van 2", geen "2 van 7 dagen". Wat gedekt is wordt in één zin
bevestigd, en er wordt maximaal één open vorm genoemd, als kans. Dit is gewijzigd na de kritiekronde (§K.1).

### D.4 Wireframe (c) — gedaan · rustdag · andere pijler is prioriteit

De klaar-staat. **Dit is de enige staat waarin analyse en advies prominenter mogen worden** (§A.2).

```
┌──────────────────────────────────────┐
│ ‹ Beweging                           │
├──────────────────────────────────────┤
│ VANDAAG ✓                            │
│                                      │
│ Zone 2 · 30 minuten — gedaan         │
│                                      │
│ Dat dekt je conditieprikkel voor     │
│ deze week.                           │
│                                      │
│ Hoe voelde het?                      │
│ [ licht ]  [ matig ]  [ zwaar ]      │
│ overslaan mag                        │
├──────────────────────────────────────┤
│ Je bouwt basis · week 3 · sinds      │
│ 14 juli                              │
├──────────────────────────────────────┤
│ NU JE TOCH HIER BENT                 │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Je voortgang                     │ │
│ │ Beweging staat op 58, begonnen   │ │
│ │ op 55. Hermeting over 6 dagen. › │ │
│ └──────────────────────────────────┘ │
│ ─────────────── vouw ─────────────── │
│                                      │
│ Kracht zonder eiwit levert minder    │
│ op. Bekijk wat dat praktisch         │
│ betekent →                           │
│      (alleen na een krachtsessie)    │
│                                      │
│ GEDAAN                               │
│ ma 28   wandelen 25 min      licht   │
│ wo 30   Zone 2 30 min        matig   │
│ ▸ Alles                              │
│                                      │
│ ▸ Waarom bewegen na 40 anders werkt  │
│ Gratis Bewegingsgids               › │
│ Leefstijl & inzichten              › │
└──────────────────────────────────────┘
```

**Primary CTA-label:** geen. Dat is het punt — de taak is klaar en het scherm vraagt niets meer.
De exertie-microvraag is de enige interactie, en die is overslaanbaar.
**Rustdag / andere pijler prioriteit:** zelfde layout, andere kop — *"Vandaag staat beweging niet voorop"* met
één regel waarom (*"Slaap heeft deze week prioriteit"*) en dezelfde klaar-staat eronder. Geen inhaalvoorstel,
geen "je kunt alsnog".

---

## E. Plan-zonder-ruis + analyse-readout

### E.1 Waar het plan leeft: één sheet

**Jouw programma** is de enige plek waar het concrete plan bestaat. Bereikbaar vanuit precies één regel op
Beweging: `Je programma · Zone 2, 2× p/week ›`. Die regel is meteen de readout — je ziet je programma zonder de
sheet te openen, en je opent hem alleen om te veranderen of om de oefeningen te zien.

De sheet is de **merge van `MovementProgramCard` + `MovementPlanAdjustSheet`** (de kern-ingreep uit
`BLAUWDRUK §5`): de waarden staan er als knoppen mét herkomst, niet als chips met de besturing elders.

```
┌─ JOUW PROGRAMMA ─────────────────────┐
│                                  ✕   │
│ Zone 2                               │
│ Aerobe basis voor langdurige energie │
│                                      │
│ Duur          30 min          ▾      │
│                        advies        │
│ Hoe vaak      2× per week     ▾      │
│                        jouw keuze    │
│ Waar          thuis / buiten  ▾      │
│                        jouw keuze    │
│ Zwaarte       matig                  │
│                        volgt duur    │
│                                      │
│ 2× past bij je herstelsignaal van    │
│ deze week.                           │
│                                      │
│ WAT JE DOET                          │
│ 1. 5 min rustig inlopen              │
│ 2. 20 min in tempo waarbij je nog    │
│    kunt praten                       │
│ 3. 5 min uitlopen                    │
│                                      │
│ WAT JE VERDER DOET                   │
│ Fietsen naar werk, tuinieren  ▾      │
│ Dit telt mee in je week.             │
│                                      │
│ ▸ Een andere vorm proberen           │
└──────────────────────────────────────┘
```

### E.2 Hoe "alleen het jouwe" werkt zonder catalogus

**De gebruiker bladert nooit.** De variant is al gekozen — uit `startPattern`, `trainingLocation` en de
sessie-aanbeveling die al bestaat. De sheet opent op *jouw* variant met *jouw* oefeningen. Er is geen lijst,
geen grid, geen "kies een programma".

Andere varianten bestaan wél, maar als **secundaire disclosure onderaan** (`▸ Een andere vorm proberen`), niet
als entry. Dat is het verschil tussen een programma hebben en een programma moeten uitzoeken.

**Wat je verder doet** is de sport-lens, gerehabiliteerd: geen dekkingsbalken die meting suggereren, geen
disclaimer dat het niets doet. Eén regel, en die regel is waar: wat je invult telt mee in de weekbalans op
Beweging. Voedt de nadruk en het advies — nooit je positie (lock: positie is verdiend).

### E.3 De ene analyse-readout die op de doe-surface blijft

**Precies één: de positieregel.**

```
Je bouwt basis · week 3 · sinds 14 juli
```

Drie elementen, alle drie feitelijk: *wat je bouwt* (kwalitatief, geen rangnummer), *hoe lang* (jouw tijd),
*sinds wanneer* (verankerd, niet generiek). Vier bouwfase-namen: `basis leggen` · `opbouwen` · `onderhouden` ·
`terugkomen`.

**Wat er van de doe-surface af moet, naar Voortgang** — dit is de complete lijst:

| Readout | Waarom het daar hoort |
|---|---|
| Score-ring 0–100 + baseline-marker | Een getal dat alleen bij de hermeting beweegt, hoort bij het scherm dat metingen toont |
| Delta-badge "▲ +3 sinds de start" | Idem — dit is de kernvraag van Voortgang, niet van vandaag |
| Sparkline + "Begin 55 · nu 58" | Trend is per definitie L2 |
| `baselineSourceLabel` | Herkomstverantwoording bij een meting |
| "Ter context: 150–300 min per week" | Normreferentie hoort bij de meting; op de doe-surface is het een maatlat naast een stap van 15 minuten |
| `formatLastMeasured` + "verandert bij je hermeting" | Meta-informatie over de meting |
| Fase-as met alle fases | Positie-geschiedenis |
| Uitgebreide beweegcheck-CTA | Meten is geen doen |

**De ene uitzondering.** De beweegcheck-CTA mag terugkomen op Beweging, maar alleen conditioneel: is er geen
beweegcheck of is die ouder dan de laatste hermeting, dan staat er onder de vouw één regel — *"Je voorstel
draait nog op je intake. Een korte beweegcheck maakt het scherper."* Geen permanente CTA-tegel.

### E.4 `coming_soon` — het besluit

> **Een variant zonder oefeningen bestaat niet in de keuzelijst.**

`kracht-sportschool` verdwijnt uit `▸ Een andere vorm proberen` tot er inhoud is. Resolveren de prefs van een
bestaande gebruiker er wél naartoe, dan valt het systeem terug op `kracht-thuis` met één eerlijke regel:

> *"De sportschool-oefeningen staan er nog niet in. Je krijgt de thuisvariant — dezelfde prikkel, ander
> materiaal."*

Geen badge, geen "binnenkort", geen leeg scherm, geen stemknop. Dezelfde regel als in
`voortgang-plan-later.md` §8: een badge in de navigatie belooft dat er iets klaarstaat, en dat maakt de hele
navigatie onbetrouwbaar.

---

## F. Tiny-habit alert F1

### F.1 Eerst: de definitie bevestigd, met één correctie

**Bevestigd:** de tiny habit is de **bestaande dagstap** uit de committed dose. Geen parallelle habit-engine.
Een tweede engine zou een tweede afvink-oppervlak vereisen, en dat is de kern-invariant die al eens gebroken en
bewust teruggedraaid is (`BLAUWDRUK §5.2`). Elke wens die "een tiny habit ernaast" heet, is in werkelijkheid een
wens om de dagstap kleiner te kunnen maken — en die wens los ik op in de UI, niet in een nieuw systeem.

**Eén correctie op de definitie** — gewijzigd na de kritiekronde (§K.1). De dagstap kan 30 minuten Zone 2 zijn.
Dat is geen tiny habit; dat is een training. Een tiny habit is per definitie zo klein dat weigeren onlogisch
wordt. Daarom is **"Ik doe de korte" een knop naast de primary, niet een link eronder** — de kleinste haalbare
variant van diezelfde stap is altijd zichtbaar, telt volledig mee, en is nooit een tweede klasse. Dat is de
"meest behaalbare makkelijke winst" als ontwerp, niet als bericht.

### F.2 De alert zelf — en waarom het e-mail moet zijn

Web push en SMS zijn gelockt uit F1. Dan blijven er twee kanalen over, en die doen niet hetzelfde:

- **In-app** bereikt de gebruiker alleen als hij al opent. Dat is geen alert — dat is de hero. Die is
  ontworpen in §D en heeft geen extra kanaal nodig.
- **E-mail** is het enige kanaal dat iemand bereikt die vandaag *niet* uit zichzelf opent. Dat is de hele
  functie van een nudge.

**Besluit: F1 = e-mail. De in-app "alert" bestaat niet als apart object.** En de fasering is niet vrijblijvend —
zie §K.4: de e-mail gaat pas aan nadat de surface-consolidatie een meetvenster heeft gehad, anders stuur je
verkeer naar een scherm waarvan je niet weet of het werkt, en kun je achteraf niet zien wat wat deed.

| | |
|---|---|
| **Trigger** | Er staat vandaag een beweeg-dagstap open (`slot.isToday && slot.domain === "beweging" && !isPlanStepHidden`) **én** die is nog niet afgevinkt **én** de gebruiker heeft een actieve opt-in voor dagherinneringen. |
| **Kanaal** | E-mail via Resend. Eén kanaal. Geen in-app tegenhanger, geen push, geen SMS. |
| **Timing-bron** | De bestaande `time_bucket` (`dashboard.time_bucket_set` staat al in `DOMAIN_EVENT_TYPES`). Ochtend → 07:30, middag → 12:30, avond → 18:00. Geen bucket gezet → **niet sturen**. Een gok op het tijdstip is een gok op irritatie. |
| **Suppressie** | Stap al afgevinkt · vandaag al een beweeg-bericht gestuurd · rustdag actief · een andere pijler is als prioriteit gezet · geen verse dagstap · afgemeld. **Maximaal 1 beweeg-bericht per dag, en de suppressie wordt gecontroleerd op het verzendmoment, niet bij het plannen.** |
| **Landingspunt** | `/dashboard?tab=vandaag&kompas=beweging` — de VANDAAG-kaart. Geen deeplink naar de sheet, geen Voortgang, geen vergelijkingspagina. De mail brengt je naar de knop, nergens anders heen. |

### F.3 Copy-regels

1. **Onderwerp en preheader zijn domeinvrij én scorevrij.** Geen "beweging", "training", "wandelen",
   "herstel", "score", geen getal dat een gezondheidstoestand kan verraden. Van buitenaf gelezen — op een
   vergrendeld scherm, over iemands schouder — mag er geen bijzondere persoonsgegeven uit af te leiden zijn
   (AVG art. 9).
2. **De body mag de pijler wél noemen**, want de opt-in was domeinspecifiek en de mail is geopend. De body mag
   nooit de score noemen — dat is de bestaande lock "geen scores in reminders".
3. **Geen gebiedende wijs.** Niet *"pak je krachtsessie op"* maar *"hij staat klaar"*. Het verschil tussen een
   coach en een baas zit in de werkwoordsvorm.
4. **Nooit tweemaal.** Genegeerd = geaccepteerd. Geen herinnering aan de herinnering.
5. **Afmelden in één tik**, in elke mail, los van de nurture-sequence.

### F.4 Twee goede voorbeelden

**Voorbeeld 1**

> **Onderwerp:** Je stap van vandaag staat klaar
> **Preheader:** Eén ding, kort. Je kunt 'm ook kleiner doen.
>
> Er staat één ding voor je klaar vandaag: 30 minuten in een tempo waarbij je nog kunt praten.
> Weinig tijd? Er staat een variant van 15 minuten naast, en die telt volledig mee.
>
> **[ Open je stap ]**
>
> *Liever geen dagelijkse mail? Afmelden kan hier.*

**Voorbeeld 2**

> **Onderwerp:** Vijftien minuten is genoeg vandaag
> **Preheader:** Hij staat voor je klaar.
>
> Je hoeft vandaag niks groots te doen. Er staat één korte stap voor je klaar — en klaar is klaar.
> Afvinken kost je één tik.
>
> **[ Open je stap ]**
>
> *Liever geen dagelijkse mail? Afmelden kan hier.*

### F.5 Eén afgekeurd voorbeeld

> ⛔ **Onderwerp:** Je beweegscore staat op 58 — pak vandaag je krachtsessie
> **Preheader:** Je hebt deze week nog 0 van je 2 krachtsessies gedaan.

**Drie afzonderlijke overtredingen, elk genoeg om af te keuren:**
*(a)* **Score in het onderwerp.** Een gezondheidsscore in een van buitenaf leesbare regel is een bijzonder
persoonsgegeven op een vergrendeld scherm (art. 9) én breekt de lock "geen scores in reminders".
*(b)* **Gebiedende wijs op een gemiste taak.** *"pak"* + *"0 van je 2"* is schuld-mechaniek: het telt wat je
niet deed en beveelt een correctie. Precies de mechaniek die het product niet wordt.
*(c)* **Domein in onderwerp en preheader.** "beweegscore" en "krachtsessie" maken de gezondheidscontext van
buitenaf afleidbaar, wat de art. 9-lock expliciet verbiedt.

---

## G. Advies/product-deur

### G.1 Het besluit op de open tegenstelling

De oude lock — *geen affiliate, geen koop-CTA in het dashboard* — en de nieuwe richting — *analyse → advies →
prijs-kwaliteit* — zijn verzoenbaar, maar alleen als je ophoudt de vraag als "waar mag de knop staan" te lezen.
De echte vraag is **wanneer een advies een advies is en wanneer het een schap is.**

> **Besluit: commercieel advies verdwijnt volledig van de doe-surface en krijgt één eigen bestemming —
> *Advies* — bereikbaar vanuit Voortgang, gated op twee condities.**

**Waarom vanuit Voortgang en niet vanuit Beweging.** Stepped care zegt: leefstijl eerst. Het moment waarop een
man van 45 legitiem openstaat voor productadvies is het moment waarop hij naar zijn eigen gemeten positie over
tijd kijkt — niet het moment waarop hij op het punt staat 15 minuten te gaan wandelen. Voortgang beantwoordt
"waar sta ik en wat betekent dat"; de eerlijke vervolgvraag daar is "wat kan ik nog meer doen", en dáár hoort
"en dit is wat een product wél en niet toevoegt". Op de doe-surface is diezelfde zin een onderbreking van de
enige taak die telt.

**De twee condities (poorten).**
1. **Basis staat.** De voedingscheck is gedaan én er is minstens één gemeten signaal dat een tekort suggereert.
   Zonder die twee toont Advies geen producten maar de reden waarom niet — precies zoals de bestaande copy nu al
   doet (*"eerst tafel, dan potje"*).
2. **De doe-taak is klaar.** De deur naar Advies is nooit prominenter dan de open stap van vandaag (§A.2).

### G.2 De vorm van de CTA

| Wel | Niet |
|---|---|
| **"Vergelijk op prijs en kwaliteit →"** naar de bestaande vergelijkingspagina | Een koopknop |
| Eén regel wat het middel wél en niet doet, vóór de link | Een productkaart met foto en prijs in het dashboard |
| `rel="nofollow sponsored"` op de vergelijkingspagina, waar de affiliate-links al staan | Een affiliate-link direct vanuit het dashboard |
| Maximaal **twee** signalen tegelijk | Een lijst van vijf |
| Een expliciete "waarom je dit misschien niet nodig hebt"-regel | Een aanbeveling zonder tegenargument |

**Op Beweging blijft precies één commercieel-aangrenzende regel over, en die is educatief, niet commercieel:**
de nutrient-bridge ná een gelogde krachtsessie — *"Kracht zonder eiwit levert minder op. Bekijk wat dat
praktisch betekent →"* — die naar de **gids** linkt, niet naar een vergelijkingspagina. Getriggerd op bewijs
(een gelogde sessie), niet permanent gestapeld. Dat is het verschil tussen advies en schap.

### G.3 Waarom dit de B2B-horizon dient

Advies als **eigen surface die leest uit de analyse-output** is precies de vorm die later als laag te isoleren
is. Was het advies verweven in de doe-surface geweest, dan was het onlosmakelijk verbonden met de
executie-engine en niet als losse laag te verkopen. Dit is geen multi-tenant-ontwerp — het is één B2C-scherm dat
toevallig een schone naad heeft. Meer moet er nu niet gebeuren.

### G.4 Meetpunt

`dashboard_beweging_supplement_click` (bestaand) — met `surface: "advies_voortgang"` in plaats van
`"kompas_beweging"`, plus een GA4-annotatie op het moment dat de footer-variant stopt. Zie §H.

---

## H. Meetplan

**Uitgangspunt: hergebruik vóór nieuw.** `ROADMAP_DASHBOARD_COCKPIT.md §3` zet *"Nieuwe event-types — KILL"*
voor fase P0–P2. Ik respecteer die lock voor de **durable `DOMAIN_EVENT_TYPES`**: er komt er precies één bij, en
alleen omdat er een nieuw kanaal ontstaat waarvan de levering anders onmeetbaar is. Alle overige metingen zijn
GA4/Clarity, waar de lock niet op ziet, en hergebruiken bestaande event-namen met een andere payload-waarde.

| # | CTA / alert | Event | Payload (geen PII) | Hergebruik of nieuw |
|---|---|---|---|---|
| 1 | Primary **Gedaan** | `dashboard_vandaag_action_toggled` | `{ surface: "kompas_beweging", state }` | **Hergebruik** — dit is de regressiewacht; hij mag na de consolidatie niet dalen |
| 2 | **Ik doe de korte** | `dashboard_vandaag_step_alternative` | `{ choice: "kort", surface: "kompas_beweging" }` | **Hergebruik** — het event bestaat al met een `choice`-parameter (`MovementTodayHero.tsx:63`); alleen een nieuwe waarde |
| 3 | Regel **"Je programma · …"** → sheet opent | `dashboard_beweging_programma_open` | `{ surface: "kompas_beweging", variant }` | **Hergebruik** — bestaat al als durable event `dashboard.beweging_programma_open` |
| 4 | Een knop in de sheet verzet | `movement_week_category` | `{ dial, from, to }` | **Hergebruik** — bestaat al in `MovementStartChoice.tsx:81`; uitbreiden naar de andere knoppen i.p.v. een nieuw event per knop |
| 5 | **"Een andere vorm proberen"** | `movement_week_category` | `{ dial: "variant", from, to }` | **Hergebruik** |
| 6 | Doorway **"Je voortgang"** | `dashboard_beweging_voortgang_click` | `{ surface: "kompas_beweging", state: "klaar" \| "open" }` | **Hergebruik** van het bestaande GA4-patroon `dashboard_beweging_*_click`; de `state`-waarde is wat de klaar-staat-regel toetsbaar maakt |
| 7 | **Advies → vergelijk** | `dashboard_beweging_supplement_click` | `{ slug, target, surface: "advies_voortgang" }` | **Hergebruik** — alleen de `surface`-waarde verandert; GA4-annotatie op de verhuisdatum |
| 8 | Nutrient-bridge-regel (na krachtsessie) | `dashboard_beweging_voeding_click` | `{ surface: "kompas_beweging", trigger: "kracht_gelogd" }` | **Hergebruik** — `trigger` scheidt de getriggerde regel van de oude permanente footer |
| 9 | Beweegcheck-prompt (conditioneel) | `dashboard_beweging_checkin_click` | `{ mode: "full", surface }` | **Hergebruik** |
| 10 | **E-mail verzonden** | `movement.nudge_sent` | `{ time_bucket, suppressed_reason \| null }` | 🆕 **Nieuw durable event** |
| 11 | **E-mail geklikt** | `dashboard_vandaag_card_shown` | `{ surface: "kompas_beweging", ref: "nudge" }` | **Hergebruik** — het bestaande shown-event (`MovementTodayHero.tsx:268`) met een `ref`-parameter uit de landings-URL |

**De ene nieuwe durable event — registratie op drie plekken:**

`movement.nudge_sent` moet worden geregistreerd in:
1. `src/lib/events.ts` — toevoegen aan `DOMAIN_EVENT_TYPES`
2. `src/lib/intake-events-client.ts` — client-zijde type
3. `src/app/api/intake/events/route.ts` — allowlist

**Waarom dit er één mag zijn ondanks de KILL.** Een verzendkanaal zonder verzendevent is niet te debuggen en niet
te verantwoorden: je kunt niet aantonen dat de suppressie werkte, niet aantonen dat er maximaal één per dag ging,
en niet reconstrueren wat er verstuurd is als iemand daarnaar vraagt. Dat is geen productmeting maar een
operationele en AVG-verantwoordingsvereiste. Als Dennis de lock strikt wil houden, is het alternatief een
server-side log zonder domain event — dat werkt, maar dan verlies je de n8n/PostHog-koppeling. **Mijn advies:
maak de uitzondering, hij is er precies één.**

### H.1 De drie effecten apart meetbaar — de attributie-eis

Dit is de eis waar het meetplan op staat of valt (§K.4). Drie effecten, drie vensters, **drie deploys**:

| Effect | Leidend event | Venster | Wat er in dat venster níét mag veranderen |
|---|---|---|---|
| **Tiny-habit** | `dashboard_vandaag_action_toggled` + ratio `dashboard_vandaag_step_alternative{choice:"kort"}` | F1a — surface-consolidatie | de alert (staat uit), de advies-deur (bestaat niet) |
| **Analyse-engagement** | `dashboard_beweging_voortgang_click` gesplitst op `state` | F1a, tweede helft | — |
| **Advies-CTR** | `dashboard_beweging_supplement_click{surface:"advies_voortgang"}` | F2 — na de advies-deur | de surfaces (bevroren), de alert-frequentie |
| **Alert-effect** | `movement.nudge_sent` → `dashboard_vandaag_card_shown{ref:"nudge"}` → `dashboard_vandaag_action_toggled` | F1b, eigen venster | de surfaces (bevroren) |

**Zonder deze scheiding is elk effect een blended cijfer.** Als de surface-consolidatie, de omgedraaide
tier-picker en de e-mail in één deploy gaan, kun je nooit vaststellen welke van de drie de hero-conversie
bewoog — en dat is precies het cijfer waar alles op hangt.

**Meetpunt: `dashboard_vandaag_action_toggled` (regressiewacht) · `dashboard_vandaag_step_alternative{choice:"kort"}`
(tiny-habit-effect) · `dashboard_beweging_voortgang_click{state}` (analyse-engagement) ·
`movement.nudge_sent` → `dashboard_vandaag_card_shown{ref:"nudge"}` (alert-effect) ·
`dashboard_beweging_supplement_click{surface:"advies_voortgang"}` (advies-CTR) — hier lees je het effect af.**

---

## I. Roadmap + open vragen

### I.1 F1 — één surface, één antwoord, één stap

**User-visible.** Beweging is één scherm. De tabbalk is weg. Je opent en ziet meteen wat er vandaag staat, met
twee knoppen: doen of kleiner doen. Onder de kaart één regel over waar je staat. Je programma is één regel die
je kunt aantikken, en daarachter staan je oefeningen en je knoppen bij elkaar. De ring, de lijn en de
beweegcheck zijn verhuisd naar Voortgang.

**Acceptatiecriteria.**
- Op 375px staan er maximaal drie contentblokken boven de vouw, in alle drie de toestanden (a)(b)(c).
- Er is geen scherm, sheet of blok waarop een tweede keer afgevinkt kan worden.
- De vier onmacht-strings zijn verdwenen; er staat nergens meer dat een keuze niets verandert.
- Het woord "fase" komt niet voor in user-facing copy; "1 van 3" bestaat niet meer.
- `dashboard_vandaag_action_toggled` is minstens gelijk aan de nulmeting over een venster van dezelfde lengte.
- Er is geen route `?view=stappenplan` en geen route `?view=programma` meer.
- Geen enkele variant in de keuzelijst leidt tot een leeg scherm.

**F1b — de e-mail** *(apart deploy, apart venster)*
**User-visible.** Eén korte mail per dag, alleen als je hem aan hebt gezet, alleen als er een stap open staat,
alleen op het dagdeel dat je zelf koos. Afmelden met één tik.
**Acceptatiecriteria.** Onderwerp en preheader bevatten geen domein, geen score, geen getal. Nooit meer dan één
beweeg-mail per dag per gebruiker. Suppressie wordt op het verzendmoment gecontroleerd. Elke verzending laat een
`movement.nudge_sent` achter, ook een onderdrukte (met `suppressed_reason`). De landing is de VANDAAG-kaart.

### I.2 F2 — het programma wordt voelbaar van jou

**User-visible.** In *Jouw programma* zie je per waarde of hij van het systeem komt of van jou, en wat er gebeurt
als je hem verzet — vóór je hem verzet. Wat je verder doet (fietsen, tuinieren) telt zichtbaar mee in je week.
Eén keer per week een korte terugblik die je eigen keuze naast je eigen uitkomst legt. En de deur naar advies
gaat open, achter de analyse.

**Acceptatiecriteria.** Elke instelbare waarde toont herkomst (`advies` / `jouw keuze` / `volgt uit …`) en heeft
"laat op advies" als altijd beschikbare uitweg. Geen enkele wijziging wordt geblokkeerd. De weekterugblik toont
nooit een saldo als aanklacht. Advies toont geen producten zolang de voedingscheck ontbreekt. De advies-deur is
in de open-staat nooit prominenter dan de VANDAAG-kaart.

### I.3 F3 — het systeem beweegt aantoonbaar mee

**User-visible.** Wie al traint, begint niet meer als beginner. Wie zes weken logt, krijgt niet meer de stap van
week één. Wie twee weken weg was, komt terug op *"terugkomen"* zonder verlies. En de uitleg over waarom bewegen
na 40 anders werkt, gaat over jouw geval in plaats van over alle gevallen.

**Acceptatiecriteria.** Een gebruiker met `trainingBackground = regelmatig` start niet in `basis leggen`. De
dagstap-resolver is fase-aware. Na ≥10 dagen zonder log daalt de dosis één stap en blijft de positie staan. Het
mechanisme-blok toont één variant, gekozen op condities die al bestaan.

### I.4 Open vragen — met mijn aanbevolen antwoord

1. **Gaat de fase-aware dagstap-resolver mee in F3, of eerder?**
   *Mijn advies: F3, zoals hier gepland.* Het is de enige echte engine-wijziging in dit hele document en hij is
   pas zichtbaar bij gebruikers die weken loggen — die heb je nu nog niet. Eerder bouwen is werk zonder publiek.

2. **Mag `movement.nudge_sent` als nieuw durable event, ondanks de KILL in de roadmap?**
   *Mijn advies: ja, en alleen deze.* Zonder verzendlog kun je de suppressie en de frequentiegrens niet
   aantonen — dat is een verantwoordingsvereiste, geen productmeting.

3. **Blijft "Open Mijn Dag" bestaan, nu Beweging zelf de afvink-plek is?**
   *Mijn advies: ja, maar als stille regel onder de vouw.* Iemand die op Beweging binnenkomt via de mail wil
   soms toch zijn hele dag zien. Boven de vouw concurreert hij met de primary; eronder kost hij niets.

4. **Verdwijnt `KompasBegeleidingLink` helemaal of alleen van Beweging?**
   *Mijn advies: parkeren tot er een product is.* Zelfde regel als `voortgang-plan-later.md` §8 — een wachtlijst
   mag terug zodra er iets ís om op te wachten. Nu is het een knop die stemmen telt die nergens heen gaan.

5. **Wordt Advies een eigen route, of een sectie op Voortgang?**
   *Mijn advies: een sectie op Voortgang in F2, een eigen route pas als er meer dan één domein advies levert.*
   Een lege route is duurder dan een sectie die meegroeit — en de naad blijft schoon voor de B2B-horizon.

6. **Mag de e-mail-opt-in in de bestaande nurture-flow, of moet hij apart?**
   *Mijn advies: apart.* Een dagelijkse gedragsnudge is een ander doel dan een nurture-sequence; ze samenvoegen
   maakt afmelden onduidelijk en de grondslag rommelig. Twee vinkjes, twee afmeldpaden.

7. **Blijft de exertie-microvraag na het afvinken staan?**
   *Mijn advies: ja, ongewijzigd.* Hij is één tik, overslaanbaar, en levert het enige verse herstelsignaal dat
   de waarom-regel van morgen mag dragen. Zonder hem moet het systeem vaker zwijgen over herstel.

8. **Is er iets in de eerste viewport dat ik niet gezien heb, omdat de screenshots ontbraken?**
   *Mijn advies: toets dit vóór de lock.* Meet de daadwerkelijke blokhoogtes op 375px in de drie toestanden. Als
   de VANDAAG-kaart alleen al meer dan ~340px is, moet "Deze week" ook in toestand (b) onder de vouw.

### I.5 Horizonregel B2B — vijf regels

Er komt nu geen multi-tenant, geen coach-portal, geen organisatie-UI en geen rolmodel — niet in de code en niet
in het ontwerp. Wat we wél vermijden te verankeren in de B2C-UI: advieslogica die alleen bestaat als onderdeel
van de doe-surface, productdata die vastzit aan `movement-*`-modules, en copy die één merk veronderstelt in de
adviesregels. De enige structurele investering die de horizon dient is de scheiding zelf — analyse en advies
lezen uit de analyse-output en schrijven niets terug naar de executie-engine. Zolang die naad schoon blijft, is
de advieslaag later te lichten zonder de doe-surface aan te raken. Meer voorbereiden is speculatief werk.

---

## K. Kritiekronde — en wat ik veranderde

*(Uitgevoerd vóór de definitieve versie. Wijzigingen zijn hierboven verwerkt en gemarkeerd.)*

### K.1 Gedragswetenschapper

- **Kritiek 1.** De weekbalans met vier balken waarvan er twee leeg zijn is een *gap display*: hij toont
  primair wat je niet deed. Voor iemand met lage self-efficacy is dat een tekortsignaal op de eerste
  viewport — precies de schuld-mechaniek die het product zegt te vermijden.
- **Kritiek 2.** "De tiny habit is de bestaande dagstap" klopt architectonisch maar niet gedragsmatig. Een
  dagstap van 30 minuten Zone 2 is geen tiny habit. Als de kleinste variant een link ónder de knop is, is de
  makkelijkste winst niet de makkelijkste keuze — hij is de tweede keuze.
- **Verbetering, verwerkt.** *(a)* "Deze week" toont geen saldo en geen lege balken meer: één zin over wat
  gedekt is, plus maximaal één open vorm als kans (§D.3). *(b)* **"Ik doe de korte" is een knop naast de
  primary geworden**, met "telt volledig mee" eronder (§D.2–D.4, §F.1). Dat laatste is de belangrijkste
  wijziging in dit document.

### K.2 45-jarige man, drukke week, matige motivatie, op zijn telefoon

- **Kritiek 1.** "Je bouwt basis · week 3" als eerste regel is de minst dringende informatie op het scherm.
  Om 21:40 op de bank wil ik weten of ik nog iets moet, niet in welke bouwfase ik zit.
- **Kritiek 2.** Als ik het gisteren niet gedaan heb, wil ik niet dat het scherm dat weet. Elke teller die
  begint bij nul leest als een aanklacht en kost me de zin om nog te openen.
- **Verbetering, verwerkt.** De **positieregel staat nu ónder de VANDAAG-kaart** in plaats van erboven (§D.1) —
  nog steeds binnen 5 seconden, maar als bevestiging achteraf in plaats van als drempel vooraf. En de
  klaar-staat vraagt niets meer: geen primary CTA, alleen de overslaanbare exertie-vraag (§D.4).

### K.3 Privacy officer

- **Kritiek 1.** "Domeinvrij onderwerp" is niet genoeg als de afzender PerfectSupplement is en de mail
  dagelijks komt. De combinatie afzender + frequentie + landingspagina maakt afleidbaar dat het om gezondheid
  gaat. En "max 1 per dag" is een frequentieregel, geen grondslag.
- **Kritiek 2.** Waar staat de grondslag, hoe trek je die met één tik in, en hoe lang bewaar je het verzendlog?
  Een nudge-systeem zonder bewaartermijn is een dataminimalisatie-probleem dat vanzelf groeit.
- **Verbetering, verwerkt.** *(a)* De opt-in wordt **apart van de nurture-sequence** met een eigen afmeldpad
  (§I.4 vraag 6), zodat de grondslag specifiek en intrekbaar is. *(b)* Suppressie wordt **op het verzendmoment**
  gecontroleerd, niet bij het plannen (§F.2) — anders verstuur je een herinnering voor iets dat al gedaan is.
  *(c)* Het verzendlog krijgt een expliciete bewaartermijn als open punt bij implementatie; `movement.nudge_sent`
  bevat geen inhoud, alleen `time_bucket` en `suppressed_reason`.
- **Nog open, bewust.** Of dagelijkse frequentie vanuit privacy-oogpunt wenselijk is bij een gezondheidsproduct
  is een beleidskeuze, geen ontwerpkeuze. Ik houd max 1/dag aan omdat dat de opdracht is; wekelijks zou
  verdedigbaarder zijn.

### K.4 Product-eigenaar PerfectSupplement

- **Kritiek 1.** Als de surface-consolidatie, de omgedraaide tier-picker en de alert in één deploy gaan, is de
  hero-conversie een blended cijfer en kun je nooit zien welke van de drie hem bewoog. Dat maakt het hele
  meetplan waardeloos op precies het punt waar het moet werken.
- **Kritiek 2.** De advies-CTR meten op een surface die nog niet bestaat is een lege belofte. En
  `dashboard_beweging_supplement_click` verdwijnt uit de footer — dat breekt de historische lijn zonder dat
  iemand later weet waarom het cijfer op een datum inzakt.
- **Verbetering, verwerkt.** *(a)* **Drie deploys, drie vensters** — F1a surface, F1b alert, F2 advies — met per
  venster expliciet wat er níét mag veranderen (§H.1). *(b)* De alert is verplaatst naar **F1b, ná** een
  meetvenster op de geconsolideerde surface (§F.2). *(c)* Een **GA4-annotatie** op de datum waarop de
  supplement-link van `kompas_beweging` naar `advies_voortgang` verhuist (§G.4, §H rij 7).

---

## SELF-SCORECARD

| Criterium | Score | Toelichting |
|---|---|---|
| **Helderheid 5-seconden** | **9/10** | Drie blokken, één primary, analyse als reden onder de actie — dat is zo strak als het kan zonder de screenshots waarmee ik de blokhoogtes had kunnen toetsen. |
| **Tiny-habit realisme** | **8/10** | "Ik doe de korte" als volwaardige tweede knop is de juiste ingreep; het risico blijft dat de kleinste variant per sessietype nog niet klein genoeg gedefinieerd is in de catalogus. |
| **Analyse zonder ruis** | **9/10** | Precies één readout op de doe-surface, acht objecten met naam en toenaam verhuisd naar Voortgang, en een expliciete uitzonderingsregel voor de beweegcheck. |
| **Commercie-discipline** | **9/10** | De klaar-staat-regel maakt stepped care een renderconditie in plaats van een belofte; de enige regel die op Beweging blijft linkt naar een gids, niet naar een schap. |
| **Dev-realisme binnen bestaande engine** | **8/10** | F1 is verwijderen, verplaatsen en hernoemen — geen engine-werk. F3 bevat één echte engine-wijziging (fase-aware resolver) die als zodanig gemarkeerd en uitgesteld is. |

---

## ANTI-PATTERNS die dit ontwerp vermijdt

| Anti-pattern | Hoe dit ontwerp het uitsluit |
|---|---|
| **Drie surfaces die hetzelfde zeggen** | Eén doe-surface, één sheet, één meetscherm. Stappenplan gekild, Programma gedegradeerd tot detail, tabbalk weg. |
| **Tweede vinklijst** | Eén afvinkbare eenheid (`VANDAAG`), één bron (`daily_action_log`). *Jouw programma* en *Gedaan* hebben geen enkel aanvinkbaar element. |
| **First-viewport winkel** | Nul commerciële elementen boven de vouw in elke toestand; advies bestaat alleen achter twee poorten waarvan er één "de taak is klaar" is. |
| **Fase-ladder als oordeel** | "1 van 3" gekild; het woord "fase" verboden in copy; vervangen door *wat je bouwt · hoe lang · sinds wanneer*. |
| **Alert met gezondheidscontext** | Onderwerp en preheader domeinvrij en scorevrij; het afgekeurde voorbeeld staat er expliciet bij met drie benoemde overtredingen. |
| **Nieuwe habit-engine naast de dagstap** | Expliciet bevestigd: de tiny habit *is* de dagstap. De wens om iets kleiners te doen wordt opgelost met een knop, niet met een systeem. |
| **Interactie die zichzelf effectloos verklaart** | De vier onmacht-strings staan op de kill-list; de sport-lens gaat de weekbalans écht voeden of hij bestaat niet. |
| **Navigatie die belooft wat er niet is** | Geen `coming_soon` in keuzelijsten, geen badges, geen wachtlijstknoppen zonder product. |
| **Gap display als default** | Geen saldo's, geen "x van y", geen lege balken naast gevulde; maximaal één open vorm, geformuleerd als kans. |
| **Blended attributie** | Drie effecten, drie deploys, drie vensters, met per venster wat er bevroren blijft. |

---

*Opgesteld 30 juli 2026. Geverifieerd tegen `main`. Geen code, geen diffs, geen implementatieslices.
Eén gelockt besluit wordt gePIVOT: het affiliate-/koop-CTA-verbod in het dashboard (§A.3 rij 14, §G) — het
sterkste tegenargument daarop staat in §G.1 en is verwerkt in de twee poorten.*
