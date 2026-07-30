# Blauwdruk — Van stappenplan naar adaptief beweegsysteem

> **Status (30 jul 2026): productontwerp / UX-blauwdruk. Geen code, geen implementatie.**
> Antwoord op de vraag: herontwerp **Beweging › Stappenplan** zodat het geen voorgeschreven schema is maar een persoonlijk bewegingssysteem dat meebeweegt met doelen, gedrag en voortgang.
> **Verankerd tegen `main`.** Geverifieerd tegen de bestaande componenten (`src/components/dashboard/beweging/`), de lib-laag (`movement-plan-roadmap.ts`, `movement-plan-profile.ts`, `movement-sport-lens.ts`, `movement-nutrient-bridge.ts`) en de bestaande SSOT-docs.
> **Aanvulling op, geen vervanging van** [`BLAUWDRUK_BEWEEGSYSTEEM_DASHBOARD_STAPPENPLAN.md`](BLAUWDRUK_BEWEEGSYSTEEM_DASHBOARD_STAPPENPLAN.md). Waar dat document de *architectuur* van de lus beschrijft, beschrijft dit document waarom de lus **niet voelbaar** is voor de gebruiker en wat daar concreet aan moet veranderen.

---

## 0. Het verdict vooraf

### 0.1 De diagnose is niet wat je denkt

De vraag gaat uit van: *"het systeem is te rigide, bouw adaptiviteit."* Dat is niet wat er aan de hand is. Vrijwel elk stuurmechanisme dat de vraag wenst, **bestaat al in code**:

| Gewenst | Bestaat als | Bestand |
|---|---|---|
| Frequentie aanpasbaar (2×/3×/4×) | `MOVEMENT_FREQUENCY_OPTIONS` + `weeklyFrequency` | `MovementPlanAdjustSheet.tsx:142` |
| Modaliteit aanpasbaar (thuis/sportschool) | `trainingLocation` | `MovementPlanAdjustSheet.tsx:134` |
| Focus aanpasbaar (kracht/conditie/ritme) | `startPattern` + `WEEK_CATEGORY_OPTIONS` | `MovementPlanAdjustSheet.tsx:123` |
| Activiteiten buiten training meetellen | `SPORT_CATALOG` + coverage-lens | `MovementSportLens.tsx` |
| Positie verdiend, niet vast | `computeCurrentPhaseId` uit daily-log | `movement-plan-roadmap.ts` |
| Beweging → voedingsadvies | `buildMovementNutrientBridge` | `movement-nutrient-bridge.ts` |
| Herstel stuurt de dagstap | `buildMovementRecoveryHint` | `movement-recovery-hint.ts` |

Het systeem is dus al adaptief. Het **communiceert zichzelf als een schema.** Twee oorzaken, beide precies aanwijsbaar:

**Oorzaak 1 — readout en besturing zijn ruimtelijk gescheiden.**
`MovementProgramCard` toont "Duur 30 min · Frequentie 2× per week · Intensiteit matig" als drie statische chips (`MovementProgramCard.tsx:39-58`). Niets in die kaart suggereert dat die waarden van jou zijn. De knop die ze wél verandert staat elders, achter een gestippelde rand met de tekst *"Plan aanpassen — spoor, locatie, frequentie"* (`MovementPlanAdjustSheet.tsx:100`). Een gebruiker die de kaart leest, ziet een recept. Hij moet een tweede, onopvallend affordance vinden om te ontdekken dat hij eigenaar is. **Je intuïtie in punt 2 — "maak elk onderdeel klikbaar" — is exact de juiste fix.** Niet omdat de besturing ontbreekt, maar omdat de besturing niet zit waar de waarde staat.

**Oorzaak 2 — de UI verkondigt haar eigen onmacht.**
Drie strings, alle drie live:
- `"ongewijzigd door je sport"` (`MovementProgramCard.tsx:31`)
- `"kleurt alleen de uitleg"` (`MovementSportLens.tsx:62`)
- `"Je sporten kies je in de kaart hierboven. Ze veranderen nooit je programma."` (`MovementPlanAdjustSheet.tsx:155`)

Deze labels zijn geschreven als **interne eerlijkheid** — ze markeren correct dat `buildMovementSportLens` copy beïnvloedt en niet `selectVisibleSteps`. Maar de gebruiker leest ze als: *"wat ik hier invoer doet niets."* Je vraagt om een systeem dat leert van keuzes; het huidige systeem vertelt de gebruiker vier keer per scherm dat het dat niet doet. Dat is het grootste enkele conversie- en vertrouwensverlies op deze surface.

**Conclusie:** dit is een **surfacing- en wiring-probleem**, geen ontbrekend systeem. Dat is goed nieuws — het maakt 70% van je wensenlijst een herordening in plaats van een herbouw.

### 0.2 Waar je vraag botst met vastgelegde besluiten

Drie punten kan ik niet leveren zoals gevraagd. Ik noem ze vooraf, met de reden en met wat ik in plaats daarvan voorstel.

| Jouw vraag | Verdict | Waarom | Wat wél |
|---|---|---|---|
| **§4:** activiteiten koppelen aan verbrande calorieën, energieverbruik, macro's, micronutriënten, eiwitbehoefte, vocht — en *"deze activiteit draagt 18% bij aan jouw wekelijkse conditiedoel"* | ⛔ **Niet in deze vorm** | Drie lagen bezwaar. (a) `BLAUWDRUK_BEWEEGSYSTEEM §0.2` verwerpt calorieën expliciet als fitness-app-signaal. (b) `ANALYSIS_PILLAR_COVERAGE.md:43` documenteert het **scheefheid-risico**: voeding is de énige pijler met een harde referentiewaarde (ADH/DRV/RI) *en* de pijler met de supplement-CTA. Een kwantitatieve laag maakt het pad *meten → getal → gat → supplement* korter en harder dan *zachte score → gewoonte* — precies tegen "leefstijl eerst" in. (c) **Schijnprecisie.** "18%" uit zelf-gerapporteerde minuten zonder wearable is een verzonnen decimaal; `PLAN_NUTRITION_SELFEVAL_LOOP.md:159` weert dit met naam. | Een **relatieve bijdrage-readout** op minuten en modaliteit, in taal zonder valse precisie: *"Deze wandeling dekt je conditieprikkel voor deze week — kracht staat nog open."* Zie §7. Dat levert je intentie (de activiteit betekent iets in het geheel) zonder het cijfer dat je niet kunt onderbouwen. |
| **§7:** *"Gebruiker wandelt veel → route verandert"* | ⚠️ **Deels** | `movement-plan-roadmap.ts:20-25` legt vast: *"Personalisatie is copy, geen programma."* En lock 5: positie is **afgeleid uit de daily-log** — *"je verdient je plek, je zet hem niet."* Zelf-gerapporteerd wandelen mag de fase niet promoveren; anders koop je voortgang met een vinkje. | De route verandert wél op **gelogde uitvoering** en op **expliciete keuze** (spoor/frequentie). Wandelen verschuift de *nadruk en het advies*, niet je positie. Zie §9. |
| **§1:** fases helemaal weg | ⚠️ **Label weg, engine blijft** | De fase-engine is de progressie-motor (`computeCurrentPhaseId`, `selectVisibleSteps`). Slopen betekent geen ontsluiting van zwaardere stappen meer. | Het **ordinale label** ("Fase 1 van 3") vervangen door een gesitueerde positie. Dat is 90% van de klacht en 5% van het werk. Zie §4. |

Alles wat je verder vraagt, omarm ik.

### 0.3 De noordster in één zin

> Het scherm moet niet vertellen wat je moet doen, maar **tonen waar je staat, wat het systeem daarom voorstelt, en dat elk voorstel jouw draaiknop is** — waarna het zichtbaar reageert op wat je draait.

---

## 1. Alles wat er nu niet klopt

Geordend op impact, elk met bewijsplaats.

### Ernstig

**1.1 De programmakaart is een recept met de knoppen ergens anders.**
Drie waarden, nul affordance (`MovementProgramCard.tsx:39-58`). De adjust-sheet is een aparte, gestippelde, ingeklapte ingang (`MovementPlanAdjustSheet.tsx:96-105`). Gevolg: de meeste gebruikers ontdekken nooit dat het plan hun plan is.

**1.2 De UI ontkracht de eigen input.** Zie §0.1, oorzaak 2. Vier strings die zeggen "dit doet niets".

**1.3 "Fase 1 van 3" is een rangschikking, geen positie.**
`positionLabel` (`movement-plan-roadmap.ts`) rendert als `{positionLabel} — {headline}` in de h2 (`MovementPlanRoadmap.tsx:80`). "1 van 3" communiceert *onderaan een ladder die iemand anders bepaalde*. Het is bovendien onwaar in gevoel: de ervaren 50-jarige die al 3× per week traint krijgt hetzelfde "Fase 1" als de absolute beginner, omdat de fase uit de score volgt en niet uit trainingsachtergrond.

**1.4 Startpunt-blindheid.** Geen enkel veld legt vast: beschikbare tijd, trainingsachtergrond, belastbaarheid. `BLAUWDRUK §2.5` markeert `weeklyAvailability` en `workActivity` als **openstaande gaten (F2)**. Zonder die twee kan het systeem geen verschillende instappunten bieden — en is "Fase 1 voor iedereen" een noodzakelijk gevolg, geen ontwerpkeuze.

**1.5 Drie surfaces, drie mentale modellen.** Overzicht (afvinken), Stappenplan (lezen), Programma (oefeningen), Voortgang (statistiek). De lus die `BLAUWDRUK §6` beschrijft is architectonisch dicht maar **nergens als één ding zichtbaar**. De enige verbinding die de gebruiker ziet is de regel *"Afvinken doe je in Overzicht"* (`MovementPlanRoadmap.tsx:98`) — een verwijzing weg van het scherm, niet een lus.

### Storend

**1.6 De sport-lens is een doodlopende weg.** Je kiest tot 3 sporten, ziet dekkingsbalken, en krijgt te horen dat het niets verandert (`MovementSportLens.tsx:132-135`). Interactie zonder gevolg is de duurste soort UI: het kost aandacht en levert wantrouwen op.

**1.7 De fase-lock is een bekend, onopgelost gat.** `KOMPAS §181`: wie in week 6 "Trainen" kiest, krijgt de week-1-krachtprikkel, omdat de tier-resolver alleen uit `mov-phase-deze-week` trekt. Dit is de meest concrete "het systeem beweegt niet mee"-ervaring die er is, en er staat al **"Beslissing nodig"** bij. Zie §9.4.

**1.8 Het kennisblok is één statische tekst voor alle gebruikers.**
`src/data/lifestyle-plans/movement.ts:16` — "Waarom beweging na 40 anders werkt" bevat drie alinea's die *alle* gevallen tegelijk adresseren: *"Waar begin je? … als je net start … Train je al regelmatig? …"*. De tekst doet zelf de segmentatie die het systeem al kan doen. Elke gebruiker leest dus ~60% niet-toepasselijke tekst.

**1.9 Herstel-uitspraken zonder verse bron.** De recovery-hint is correct gemodelleerd op `RCV_FEEL`, maar copy over herstel kan renderen wanneer dat signaal oud of afwezig is. Zie §10.

**1.10 "Deze week: kies je focus"** (`movement.ts` phase-title) staat als **fase-titel** in de data, waardoor de focuskeuze voelt als een stap in het plan in plaats van een besturingselement van het plan.

---

## 2. Welke UX-principes worden overtreden

| Principe | Overtreding | Waar |
|---|---|---|
| **Perceived affordance** (Norman) | Aanpasbare waarden gerenderd als statische `<span>`-chips. De aanpasbaarheid is echt maar onzichtbaar. | `MovementProgramCard.tsx:39-58` |
| **Proximity / Gestalt** | De besturing staat niet bij het object dat het bestuurt — een eigen sectie lager. | Adjust-sheet vs. programmakaart |
| **Feedback & agency** (SDT-autonomie) | De gebruiker maakt een keuze en het systeem antwoordt letterlijk "dit verandert niets". Autonomie zonder effect is schijn-autonomie — erger dan geen keuze. | `MovementSportLens.tsx:62,132` |
| **Recognition over recall** | "Fase 1 van 3" vraagt de gebruiker te onthouden wat fase 1 was en hoeveel er nog komt. Een gesitueerd label ("je bouwt basis, ~week 2") vraagt niets. | `MovementPlanRoadmap.tsx:80` |
| **Progressive disclosure** | Verkeerd toegepast: de *besturing* is verborgen (moet zichtbaar) en de *kennistekst* is volledig uitgeklapt (mag verborgen). Precies omgekeerd. | Adjust-sheet vs. mechanism-block |
| **Match tussen systeem en echte wereld** | Trainingsachtergrond en beschikbare tijd — de twee dingen die elke sporter als eerste noemt — komen in het model niet voor. | `BLAUWDRUK §2.5` gaten |
| **Consistentie** | "spoor" (adjust-sheet), "focus" (fase-titel), "startpatroon" (`movement-prefs`), "categorie" (`WEEK_CATEGORY_OPTIONS`) zijn **vier namen voor één concept**. | codebase-breed |
| **Eerlijkheid / kalibratie van vertrouwen** | Dekkingsbalken op 100%/55%/12% (`MovementSportLens.tsx:113-120`) suggereren meting; de disclaimer eronder zegt dat het een gemiddeld sportprofiel is. Het beeld belooft meer dan de tekst waarmaakt. | `MovementSportLens.tsx:110-135` |

---

## 3. Welke mentale modellen beter passen

**Nu impliciet: "het schema."** Een autoriteit schrijft voor, jij volgt, afwijken = falen. Dat model verklaart alle symptomen: fases als rangorde, waarden als voorschrift, aanpassen als achterdeur.

**Voorgesteld: drie modellen in lagen.**

**3.1 Het instrumentenpaneel (voor de programmakaart).**
Elke waarde is een **stand van een knop**, niet een instructie. Een thermostaat op 20° vertelt je niet dat je 20° *moet* hebben — hij toont de stand, en je pakt hem vast. Consequentie voor de UI: dezelfde typografie, andere chrome. De waarde blijft prominent; eronder komt de reden dat hij daar staat (*"advies op je herstel"*) en de mogelijkheid hem te verzetten. **De stand-plus-herkomst is de kern**: een knop waarvan je ziet wie hem gezet heeft, voelt anders dan een voorschrift.

**3.2 Het logboek met een vooruitzicht (voor de surface-eenheid).**
Niet drie kaarten die elkaar niet kennen, maar **één verticale tijd-as**: verleden (wat je deed, feitelijk) → nu (wat er open staat) → vooruit (wat dat betekent). Dit is het model van een scheepsjournaal: je schrijft op wat gebeurde, en de koers volgt eruit. Het lost §1.5 op zonder een nieuw scherm te bouwen — het is een **herordening van bestaande blokken op één as**.

**3.3 Het onderhandelende systeem (voor de coaching-toon).**
Het systeem heeft een mening, geeft die, en legt zich bij jouw keuze neer — maar zegt eerlijk wat het verwacht. *"Je zet frequentie op 4×. Met je huidige herstelsignaal is 3× wat ik zou voorstellen; ik houd de vierde sessie licht en je ziet in week 3 of dat klopte."* Dat is geen waarschuwing en geen capitulatie: het is **een voorspelling die naderhand getoetst wordt**. Dat is de enige coaching-vorm die vertrouwen opbouwt in plaats van gehoorzaamheid.

**Wat we expliciet níét worden:** de trainer (autoriteit), de tracker (cijferverzamelaar), de gamified coach (streaks/badges — `BLAUWDRUK §0.2`).

---

## 4. Herontwerp van de bovenkant — van "Fase 1 van 3" naar een gesitueerde positie

### 4.1 Het probleem preciezer

"Fase 1 van 3" bevat drie boodschappen, waarvan er twee schadelijk zijn:
- ✅ *je bent ergens in een traject* — nuttig
- ⛔ *je bent bij de eerste* — leest als onderaan
- ⛔ *er zijn er precies drie* — een aftelling die iemand anders bepaalde

### 4.2 De vervanging: positie op vier assen, niet één

Vervang het ordinale label door een **positieregel** die zegt *wat je nu bouwt* en *sinds wanneer*:

```
BOUWFASE · basis leggen                       week 2 · sinds 14 juli
Je legt de basis: techniek en ritme vóór volume.
```

- **Wat** (`basis leggen` / `opbouwen` / `onderhouden` / `terugkomen`) — kwalitatief, geen rangnummer.
- **Sinds** — verankert het in *jouw* tijd, niet in een generiek schema.
- **Geen "van 3".** De as blijft zichtbaar als navigatie (`MovementPlanRoadmap.tsx:117-169` doet dit al), maar zonder totaal-aftelling in de kop.

De vierde bouwfase — **`terugkomen`** — is nieuw en belangrijk: het is de enige fase-naam die een gebruiker na een gat van drie weken niet als straf leest. Het huidige model kan alleen omhoog of stilstaan.

### 4.3 Verschillende instappunten: het startprofiel

Je vraagt om instappen vanuit conditie / spiermassa / fitter / energie / afvallen / gezondheid / herstellen / weinig tijd / al ervaren. Die negen zijn **geen negen instappunten** — het zijn twee verschillende soorten antwoord die nu op één hoop liggen:

| Soort | Voorbeelden uit je lijst | Bestaat als | Rol |
|---|---|---|---|
| **Doel/waarom** | energie, gezondheid, spiermassa behouden, afvallen, fitter | `movementAnchor` (4 opties) | kleurt de *waarom*-copy |
| **Vertrekpunt/capaciteit** | weinig tijd, al ervaren sporter, herstellen | ⚠️ **bestaat niet** | bepaalt de *dosis en het instapniveau* |

Dat is de kern van §1.4: het anker is er, het **vertrekpunt** niet. Voorstel — drie velden, gevraagd ná de eerste dagstap (progressive onboarding, conform `BLAUWDRUK §2.5`):

```
STARTPROFIEL  (3 vragen, ~40 sec, elk overslaanbaar)

1. Hoeveel tijd heb je per week realistisch?          → weeklyAvailability
   ○ < 60 min   ○ 1–2 uur   ○ 2–4 uur   ○ > 4 uur

2. Wat doe je nu al?                                   → trainingBackground
   ○ vrijwel niets   ○ wandelen/dagelijks actief
   ○ 1–2× per week iets   ○ regelmatig sport/training

3. Is er iets dat de belasting begrenst?               → loadConstraint
   ○ nee   ○ klachten/blessure   ○ vermoeidheid/herstel   ○ ander advies gekregen
```

**Wat dit oplost:** `trainingBackground = regelmatig` start niet in `basis leggen` maar in `onderhouden` — de ervaren gebruiker wordt niet meer als beginner behandeld. `weeklyAvailability = <60 min` verlaagt de voorgestelde frequentie vóórdat de gebruiker hem hoeft te corrigeren. `loadConstraint` voedt `loadLevel: conservative` (al ontworpen, `BLAUWDRUK §7.2`).

**Belangrijk:** dit zet de *startpositie*, en dat is legitiem — het is een expliciete zelfrapportage over het verleden, geen geclaimde voortgang. Vanaf dat startpunt geldt lock 5 onverkort: **verder komen doe je door te loggen.** Zo bewaakt het systeem het verschil tussen *waar je begint* (jij weet dat) en *waar je komt* (dat verdien je).

### 4.4 Progressie zichtbaar zonder rigide fases

Vier signalen die samen "ik kom vooruit" dragen, zonder aftelling:

1. **Bouwfase-naam** die verandert (`basis leggen` → `opbouwen`).
2. **Wat er opengaat.** Bij promotie: *"Zone 2 en full-body 2× staan nu open."* Ontsluiting is de eerlijkste vooruitgangsmarkering die er is — het is een feit, geen cijfer.
3. **De lijn** (`buildDomainTrendRow`) — traag, eerlijk, bij de hermeting.
4. **Cumulatief volgehouden ritme**, als constatering: *"11 weken bewogen, gemiddeld 2× per week."* Geen streak (geen "op rij", geen breekbaarheid — conform `BLAUWDRUK §0.2`), maar een optelsom die niet stuk kan.

---

## 5. De programmakaart wordt een instrumentenpaneel

### 5.1 Het ontwerp

Elke waarde wordt een **knop met stand, herkomst en bereik**. Herkomst is het nieuwe element: de gebruiker ziet per waarde of die van het systeem of van hemzelf komt.

```
┌ JOUW PROGRAMMA ────────────────────────── aangepast door jou ──┐
│                                                                 │
│  Zone 2                                              [ wijzig ] │
│  Aerobe basis voor langdurige energie                           │
│                                                                 │
│  ┌───────────────┬───────────────┬───────────────┐              │
│  │ DUUR          │ FREQUENTIE    │ INTENSITEIT   │              │
│  │ 30 min     ▾  │ 2× p/week  ▾  │ matig      ▾  │              │
│  │ advies        │ jouw keuze    │ volgt duur    │              │
│  └───────────────┴───────────────┴───────────────┘              │
│                                                                 │
│  Waarom deze stand: 2× past bij je herstelsignaal van deze week.│
│  ▸ Wat verandert er als ik dit verzet?                          │
└─────────────────────────────────────────────────────────────────┘
```

Openklappen van `FREQUENTIE ▾` (popover, geen modal, geen navigatie):

```
   Hoe vaak per week?
   ○ 1×    ● 2×  ← advies    ○ 3×    ○ 4×

   Bij 3×: je weekprikkel stijgt ~50%. Met je huidige
   herstelsignaal houdt het systeem één sessie licht.
   [ Zet op 3× ]      [ Laat op advies ]
```

### 5.2 Drie regels die dit ontwerp dragen

**Regel 1 — herkomst is altijd zichtbaar.** `advies` · `jouw keuze` · `volgt uit …`. Dit is de goedkoopste manier om "het systeem adviseert, jij beslist" waar te maken: de gebruiker ziet per waarde wie aan het roer stond. En het maakt de terugweg gratis: *"Laat op advies"* is altijd een optie, dus experimenteren voelt niet als een verbintenis.

**Regel 2 — afhankelijkheden zijn getoond, niet verborgen.** Intensiteit is geen vrije knop: hij volgt uit duur × modaliteit × herstel. `volgt duur` maakt dat expliciet. Vier onafhankelijke knoppen die elkaar stil beïnvloeden is de snelste weg naar een gebruiker die het systeem niet meer vertrouwt.

**Regel 3 — voorspel vóór de wijziging, toets erna.** Elke popover zegt wat er gebeurt (*"weekprikkel +50%"*) — relatief, nooit in kcal (§7). En bij de volgende weekterugblik komt de toets: *"Je zette frequentie op 3×. Je haalde 2 van 3. Terug naar 2×, of houden?"* Dat is de onderhandeling van §3.3, en het is het punt waarop het systeem **aantoonbaar van je keuzes leert** in plaats van dat te beweren.

### 5.3 Wat mag de gebruiker verzetten, en wat gebeurt er dan

| Knop | Bereik | Herberekent | Bestaat als |
|---|---|---|---|
| **Modaliteit** (Zone 2 / wandelen / kracht thuis / sportschool) | `MovementSessionVariantId` (5 varianten) | oefeningen, duur-default, intensiteit | ✅ `session-catalog.ts` |
| **Frequentie** | 1–4× | weekprikkel, herstelruimte, geadviseerde intensiteit | ✅ `MOVEMENT_FREQUENCY_OPTIONS` |
| **Duur** | 20/30/45 min per variant | weekminuten, intensiteitsadvies | ⚠️ nu een string (`"20–45 min"`) → moet gestructureerd |
| **Spoor/focus** | kracht / conditie / dagelijks ritme | welke stappen zichtbaar, dagstap-resolutie | ✅ `startPattern` |
| **Locatie** | thuis / sportschool | oefeningenset | ✅ `trainingLocation` |
| **Intensiteit** | ⛔ **niet vrij** | — | volgt uit de rest + herstel |

Intensiteit bewust niet vrij instelbaar: het is de enige waarde waarbij een gebruikerskeuze de veiligheidsmarge kan overschrijden, en `BLAUWDRUK §13` legt vast dat **herstel de limiterende factor is en motivatie de toestaande**. Het systeem schroeft nooit automatisch op; de gebruiker mag dat hier ook niet in één tik.

### 5.4 Wanneer waarschuwt het systeem, wanneer beweegt het mee

| Situatie | Gedrag | Toon |
|---|---|---|
| Binnen advies | Stil meebewegen, geen bevestigingsdialoog | — |
| Boven advies, herstel oké | Meebewegen + voorspelling | *"Kan. Ik houd één sessie licht."* |
| Boven advies, zwak herstelsignaal | Meebewegen + expliciete verwachting | *"Je kunt dit zetten. Op je huidige herstel verwacht ik dat je 2 van de 4 haalt — ik vraag het je in week 3."* |
| `loadConstraint = klachten` + sprong ≥2 stappen | Meebewegen + medische grens | *"Bij klachten is opbouwen in stappen verstandiger. Overleg met je fysio als het pijn doet."* Nooit blokkeren. |
| Onder advies | **Stil meebewegen, nul commentaar** | Omlaag bijstellen is zelfregulatie, niet falen. Hier één woord te veel zeggen is de duurste fout op dit scherm. |

Er is **geen enkel geval waarin het systeem een wijziging tegenhoudt.** Dat is de operationele betekenis van "de gebruiker blijft eigenaar".

---

## 6. Van drie surfaces naar één doorlopend systeem

### 6.1 De lus

```
        STARTPROFIEL  (tijd · achtergrond · begrenzing)  ── eenmalig, aanpasbaar
                              │
                              ▼
        ANKER  (waarom)  ──────────────► kleurt alle waarom-copy
                              │
                              ▼
        ADVIES  (spoor · modaliteit · dosis)          ◄──┐
                              │                          │
                              ▼                          │
        JOUW AANPASSINGEN  (§5 — herkomst: jouw keuze)   │
                              │                          │
                              ▼                          │
        UITGEVOERD  (daily_action_log — de enige waarheid)│
                              │                          │
                              ▼                          │
        WEEKTERUGBLIK  ── toetst de voorspelling ────────┤
                              │                          │
                              ▼                          │
        POSITIE  (computeCurrentPhaseId — verdiend)      │
                              │                          │
                              ▼                          │
        NIEUW ADVIES  ───────────────────────────────────┘
```

**Twee invarianten die deze lus bij elkaar houden** (beide bestaand, beide te behouden):
- **Uitvoering heeft één bron:** `daily_action_log`. Eén afvink-oppervlak (de VANDAAG-hero). Een tweede vinklijst maakt de lus onbetrouwbaar — dat is al eens gebeurd en bewust teruggedraaid (`BLAUWDRUK §5.2`).
- **Positie is afgeleid, nooit gezet.** Aanpassingen veranderen de *dosis*; loggen verandert je *plek*.

### 6.2 Het logboek als scherm

Vervang de kaartenverzameling door één verticale as. Geen nieuw scherm — een herordening van bestaande blokken:

```
┌ BEWEGING ─────────────────────────── Overzicht · Programma · Voortgang ┐
│                                                                        │
│  BOUWFASE · basis leggen                    week 2 · sinds 14 juli     │
│  voor: zelf blijven doen wat je wilt                        [ wijzig ] │
│                                                                        │
│ ── NU ───────────────────────────────────────────────────────────────  │
│  Vandaag                                                               │
│  Zone 2 · 30 min                        [ Markeer als gedaan ✓ ]       │
│  Geen tijd vandaag?                                                    │
│                                                                        │
│  Deze week: conditie 1× · kracht 0× · wandelen 3×                      │
│  Kracht staat nog open — dat is waar je nu het meest wint.             │
│                                                                        │
│ ── JOUW PROGRAMMA ─────────────────────────────────────────────────────│
│  [ instrumentenpaneel uit §5 ]                                         │
│                                                                        │
│ ── WAT JE DEED ────────────────────────────────────────────────────────│
│  ma 28  wandelen 25 min          licht                                 │
│  wo 30  Zone 2 30 min            matig     ← dekte je conditieprikkel  │
│  ▸ Alle 34 momenten                                                    │
│                                                                        │
│ ── WAT DAT BETEKENT ───────────────────────────────────────────────────│
│  Je lijn: begin 55 · nu 58 ▲+3                                         │
│  Hermeting: over 6 dagen                                               │
│  ▸ Waarom beweging na 40 anders werkt   (§11 — adaptief)               │
└────────────────────────────────────────────────────────────────────────┘
```

Vier zones op één as: **NU → JOUW PROGRAMMA → WAT JE DEED → WAT DAT BETEKENT.** Dat is het logboekmodel van §3.2: heden, besturing, verleden, betekenis. De bestaande tabs blijven als *diepte-ingangen* (Programma = oefeningen, Voortgang = statistiek), maar het **overzicht is nu zelf de lus** in plaats van een portaal ernaartoe.

---

## 7. Activiteiten meetbaar maken — zonder de calorie-val

### 7.1 Wat ik niet lever, en waarom (samengevat uit §0.2)

Geen kcal, geen energieverbruik, geen macro's/micro's/vocht als beweeg-output, en **geen "18%"**. De reden in één zin: uit zelf-gerapporteerde minuten zonder wearable is elk van die getallen verzonnen precisie, en de kwantitatieve laag trekt het advies structureel naar supplementen (`ANALYSIS_PILLAR_COVERAGE.md:43`) — precies tegen de merkbelofte in.

### 7.2 Wat wél: de bewegingsvormen-balans

Je onderliggende intentie is juist en waardevol: **alles wat je doet moet ergens toe bijdragen, en dat moet je zien.** De eerlijke eenheid daarvoor bestaat al — `MOVEMENT_FORMS` + `buildMovementSportLens` — hij is alleen ontkoppeld (§1.6). Koppel hem, en meet in **vormen en minuten** in plaats van energie:

```
DEZE WEEK — wat je prikkelde

  Kracht        ▓▓░░░░░░░░   1 van 2 sessies
  Conditie      ▓▓▓▓▓▓▓▓▓▓   gedekt (Zone 2 + 3× wandelen)
  Mobiliteit    ░░░░░░░░░░   nog niets
  Dagelijks     ▓▓▓▓▓▓▓░░░   5 van 7 dagen bewogen

  Kracht is waar je nu het meest wint. Eén sessie is genoeg.
```

Waarom dit werkt waar percentages falen:
- **Elke activiteit telt mee.** Wandelen, traplopen, tuinieren, huishouden, fysiek werk — alles landt in een vorm. Dat is exact je wens, alleen zonder de energie-eenheid.
- **De eenheid is verdedigbaar.** "1 van 2 sessies" en "5 van 7 dagen" zijn tellingen, geen schattingen. Er valt niets te betwisten.
- **Het is actionable.** Een gat in een vorm leidt tot één concrete suggestie. Een percentage van een conditiedoel leidt tot niets.
- **`workActivity` krijgt betekenis.** Wie fysiek werk heeft, heeft `Dagelijks` al gedekt en hoort een ander advies dan de kantoorwerker.

### 7.3 De bijdrage-regel per activiteit

Dit is de directe vervanging van je *"draagt 18% bij"*:

```
wo 30 juli · Zone 2, 30 min · matig
→ Dit dekte je conditieprikkel voor deze week.
```

en bij een gat:

```
→ Telt mee als dagelijks bewegen. Je krachtprikkel staat nog open.
```

Zelfde psychologische functie (deze activiteit betekent iets in het geheel), nul schijnprecisie. **Regel:** een bijdrage-regel verschijnt alleen als de activiteit een vorm daadwerkelijk verschuift. Anders zwijgen — "je hebt 25 min gewandeld" is genoeg.

### 7.4 De koppeling naar voeding, herstel en slaap

Ook hier: bestaat al, maar ontkoppeld. `buildMovementNutrientBridge` geeft al een eiwit-CTA die scherper wordt bij `protein_gap_signal` (`movement-nutrient-bridge.ts:31-38`). Wat mist is dat de gebruiker de **oorzakelijke lijn** ziet:

| Van | Naar | Regel | Voorwaarde |
|---|---|---|---|
| Krachtsessie gelogd | eiwit | *"Kracht zonder eiwit levert minder op."* | ✅ bestaat |
| 2 zware sessies in 3 dagen | herstel | *"Twee zware sessies kort op elkaar — morgen staat licht voorgesteld."* | ✅ `recovery-hint` |
| Weekritme gehaald | slaap | *"Op actieve dagen was je slaapscore hoger."* | ⚠️ genoeg datapunten; hoort in `/inzichten` (`BLAUWDRUK §4.8`) |
| Leeftijd + spoor=kracht | spierbehoud | *"Na 40 is dit de prikkel die spierverlies remt."* | ✅ statisch, mag adaptief (§11) |

**Wat expliciet buiten beeld blijft:** vocht, micronutriënten en macroverdeling als *beweeg-output*. Die horen in de voedings-pijler met zijn eigen referentiewaarden en zijn eigen inname-vs-status-grens (`PLAN_MEASUREMENT_PERSONALIZATION.md`), niet als afgeleide van een wandeling.

---

## 8. Focus wordt adaptief

### 8.1 Eerst: één naam

"spoor" / "focus" / "startpatroon" / "categorie" → **kies "focus"** in alle UI-copy (`startPattern` blijft de code-naam). Vier namen voor één concept is de goedkoopste bug op dit scherm.

### 8.2 Het gedrag dat je vraagt

Je wil: advies → gebruiker wijkt af → systeem legt uit wat dat betekent → systeem leert. Dat is drie dingen, waarvan er twee nieuw zijn.

```
JOUW FOCUS                                          advies: conditie
[ Kracht ]  [ ● Conditie ]  [ Dagelijks ritme ]

Waarom conditie: je conditiescore blijft achter op je kracht.
```

Na wijziging naar Kracht:

```
JOUW FOCUS                                        jouw keuze: kracht
[ ● Kracht ]  [ Conditie ]  [ Dagelijks ritme ]

Je koos kracht. Je week verschuift naar 2 krachtprikkels;
Zone 2 zakt naar 1×. Conditie blijft daarmee op peil,
maar bouwt niet verder.

Toch conditie als advies volgen?
```

Drie dingen die dit doet en het huidige scherm niet:
1. **De consequentie is expliciet** — inclusief de trade-off (*"blijft op peil, bouwt niet verder"*). Geen verkooppraatje voor de eigen keuze, geen straf.
2. **De weg terug is één tik** — waardoor afwijken een experiment is, geen breuk.
3. **De herkomst wisselt** van `advies` naar `jouw keuze`, zichtbaar. Consistent met §5.2.

### 8.3 Waar het "leren" echt zit

"Het systeem leert" is makkelijk beweerd en zelden waar. Drie plekken waar het **deterministisch en aantoonbaar** kan, zonder ML:

| Signaal | Wat het systeem doet | Zichtbaar als |
|---|---|---|
| Gebruiker corrigeert focus 2× naar dezelfde waarde | Die focus wordt de nieuwe default; het advies stopt met tegenspreken | *"Kracht is nu je standaard."* |
| Gebruiker verlaagt frequentie 3 weken op rij | Adviesdosis daalt structureel | *"Ik stel 2× voor in plaats van 3× — dat past beter bij je weken."* |
| Voorspelling klopte niet (4× gezet, 2× gehaald) | Weekterugblik toetst en stelt bij | *"Je haalde 2 van 4. Terug naar 2×?"* |

Dit is het verschil tussen *"het systeem past zich aan"* als claim en als **observeerbaar gedrag**. Alle drie zijn regelgebaseerd, uitlegbaar en te testen. AI is hier niet nodig — zie §16.

---

## 9. De route wordt dynamisch

### 9.1 Vier motoren, elk met een eigen mandaat

De route mag niet door alles bewegen, anders is hij geen route meer. Precies vier bronnen:

| Bron | Verandert | Verandert **niet** | Grondslag |
|---|---|---|---|
| **Gelogde uitvoering** | positie/bouwfase, ontsluiting | dosis | lock 5 — verdiend |
| **Expliciete keuze** (focus/dosis/modaliteit) | welke stappen, dosis, nadruk | positie | eigenaarschap |
| **Herstelsignaal** | de dagstap van vandaag/morgen | positie, dosis | `recovery-hint` |
| **Startprofiel** (§4.3) | startpositie, adviesdosis, `loadLevel` | verdiende positie | eenmalig + aanpasbaar |

Wat **geen** motor is: zelf-gerapporteerde sporten. Die kleuren de nadruk en het advies (§7.2) maar promoveren niet. Zo blijft "je verdient je plek" waar.

### 9.2 Jouw drie scenario's, concreet

**"Gebruiker mist drie trainingen."**
Geen daling, geen schuld. De bouwfase wordt `terugkomen` (§4.2) en de dosis zakt één stap:
> *"Je was er even niet. Je route staat nog waar hij stond — ik stel één lichte sessie voor om weer in te stappen."*
De **positie blijft**, want positie is verdiend en verdiend blijft verdiend. Dit is het scenario waar de meeste beweegapps mensen verliezen; hier is het een zachte herstart.

**"Gebruiker wandelt veel."**
`Conditie` en `Dagelijks` kleuren gedekt (§7.2), het advies verschuift naar het gat:
> *"Je conditie loopt goed via wandelen. Kracht is nu je grootste winst."*
Geen fase-promotie — wandelen is niet de prikkel waar de arc op gebouwd is.

**"Gebruiker kiest kracht."**
Zichtbare stappen filteren (`filterStepsForCategory` doet dit al), dosis herberekent, consequentie uitgelegd (§8.2).

### 9.3 Leeftijd en tijd

- **Leeftijd** → `loadLevel` (bestaand ontwerp, `BLAUWDRUK §7.2`) en de mechanisme-copy (§11). Nooit als aftrekpost of "biologische leeftijd".
- **Beschikbare tijd** → `weeklyAvailability` begrenst de *adviesdosis*, niet de keuzevrijheid. Wie 45 minuten per week heeft, krijgt geen 3×45 min voorgesteld — maar mag het wel zetten.

### 9.4 De fase-lock: een besluit

`KOMPAS §181` en `§270` laten dit openstaan, en het is het meest voelbare "systeem beweegt niet mee"-gat dat er is (§1.7): wie in week 6 "Trainen" kiest, krijgt de week-1-stap.

**Aanbeveling: maak de tier-resolver fase-aware (optie a).** Reden: alles in dit document staat of valt bij de belofte *"wat je doet verandert wat je krijgt."* Een gebruiker die zes weken loggen investeert en dan nog steeds de eerste kniebuiging voorgeschoteld krijgt, heeft het tegenbewijs in handen. Optie (b) — bewust op fase 1 houden en progressie alleen via de route-ladder tonen — is verdedigbaar als scope-besluit, maar dan moet §4.4 (ontsluiting als vooruitgangsmarkering) uit dit ontwerp, en dan verliest de hele lus zijn meest tastbare payoff. Dit is de enige plek in dit document waar ik een **echte engine-wijziging** aanraad in plaats van een herordening.

---

## 10. Herstel betrouwbaar communiceren

### 10.1 De grens

Herstel is de enige plek op dit scherm waar we tegen een medische grens aanzitten (`CLAUDE.md`: "geen medische claims — adviezen, geen diagnoses"). De regel:

> **Het systeem doet nooit een uitspraak over je herstel*toestand*. Het doet uitspraken over wat het weet, en wat het daarom voorstelt.**

### 10.2 Nooit zeggen

| ⛔ | Waarom |
|---|---|
| *"Je herstel is niet optimaal"* | Toestandsclaim zonder meting. Dit is de formulering die het dichtst bij een diagnose komt. |
| *"Je bent onvoldoende hersteld"* | Idem, plus normatief. |
| *"Je herstel is 68%"* | Verzonnen getal uit één zelfrapportage. |
| *"Je cortisol/HRV is verhoogd"* | Fysiologische claim zonder sensor. Ook mét sensor: `BLAUWDRUK §15` zet wearables achter een AVG art. 9-gate en verbiedt sensor-raw in een stap. |
| *"Je hebt 2 rustdagen nodig"* | Voorschrift als medische noodzaak. |

### 10.3 Wel zeggen — signaal, dan voorstel

| Bron | Formulering |
|---|---|
| Verse `RCV_FEEL` (≤7d) | *"Je gaf gisteren aan moe te zijn — ik stel iets lichts voor."* |
| Trainingspatroon (feit) | *"Twee zware sessies in drie dagen. Vandaag staat licht voorgesteld."* |
| Zelfrapport exertie | *"Je noemde je laatste drie sessies zwaar."* |
| Geen verse data | **Zwijgen over herstel.** Toon de dagkeuze neutraal. |
| Hermeting-datum | *"Hermeting: over 6 dagen."* — een datumberekening, geen voorspelling. Deze mag blijven. |

### 10.4 Wat er nu concreet moet gebeuren

1. **Signaal-leeftijd tonen bij elke herstel-uitspraak.** *"op basis van je check van gisteren"*. Zonder verse bron: geen herstel-copy renderen (§1.9).
2. **`RCV_FEEL` verouderen op 7 dagen.** Ouder dan dat is geen signaal meer.
3. **Eén herstel-vraag, laagfrequent** — niet dagelijks (`BLAUWDRUK §0.2` houdt de dagelijkse check-in bewust op één vraag).
4. **HRV/rusthartslag/slaap:** pas ná de art. 9-gate, en dan als *soft hint op de analyse-laag* — nooit als tweede score, nooit als reden in een stap.

---

## 11. Het kennisblok wordt adaptief

### 11.1 Nu

`src/data/lifestyle-plans/movement.ts:16` — één `mechanism`-blok, drie alinea's, voor iedereen gelijk. De tekst segmenteert zelf (*"als je net start … Train je al regelmatig?"*), dus elke gebruiker leest instructies voor een situatie die niet de zijne is (§1.8).

### 11.2 De omkering

Van **één blok dat alles zegt** naar **één regel die jouw geval zegt, met diepte op verzoek.** Twee ingrepen:

**Ingreep 1 — splits `mechanism` in varianten op de assen die er al zijn.**

```ts
mechanism: {
  heading: "Waarom dit werkt voor jou",
  variants: [
    {
      when: { background: "vrijwel_niets", pattern: "kracht" },
      body: "Vanaf je 40e verlies je spiermassa zonder krachtprikkel. Begin met
             één echte prikkel thuis — niet met een perfect schema.",
    },
    {
      when: { background: "regelmatig", pattern: "kracht" },
      body: "Je geeft de prikkel al. Na 40 zit je winst in herstel en ritme,
             niet in meer volume.",
    },
    {
      when: { pattern: "conditie", ageBand: "50plus" },
      body: "Conditie houdt je aeroob systeem op peil, maar remt spierverlies
             niet. Kracht blijft de prikkel die dat doet.",
    },
  ],
}
```

Dit hergebruikt het bestaande conditie-mechanisme (`evaluatePlanCondition`, `PlanIntakeContext`) dat al door `movement-nutrient-bridge.ts` gebruikt wordt. **Geen nieuwe engine.**

**Ingreep 2 — koppel uitleg aan het besluit dat hij verklaart.** De sterkste plek voor mechanisme-copy is niet onderaan het scherm, maar **in de popover waar de gebruiker een knop verzet** (§5.1). Daar is de vraag "waarom?" actief in het hoofd. Onderaan is hij dat niet.

### 11.3 Drie lagen

| Laag | Vorm | Waar |
|---|---|---|
| **Waarom deze stand** | 1 regel, altijd zichtbaar | bij de knop (§5.1) |
| **Waarom dit werkt** | 2–4 regels, variant-gekozen | uitklap "WAT DAT BETEKENT" |
| **Onderbouwing** | bron/richtlijn, op verzoek | `▸ Waar komt dit vandaan?` |

De derde laag is een **vertrouwensinvestering**: wie erop klikt is precies de sceptische 45-plusser die de Consumentenbond-positionering moet geloven. Eén regel volstaat: *"Gebaseerd op de Nederlandse beweegrichtlijnen en je beweeg- en herstelscores — patronen, geen diagnose."* Dat is de bestaande `source`-string (`movement.ts`), alleen verplaatst naar de plek waar hij gevraagd wordt.

---

## 12. Wireframes

### 12.1 Mobiel, 375px — het logboek

```
┌──────────────────────────────────────┐
│ ‹ Beweging                      ⋯    │
│ Overzicht · Programma · Voortgang    │
├──────────────────────────────────────┤
│ BOUWFASE · basis leggen              │
│ week 2 · sinds 14 juli               │
│ voor: zelf blijven doen wat je wilt  │
├──────────────────────────────────────┤
│ NU                                   │
│ ┌──────────────────────────────────┐ │
│ │ VANDAAG                          │ │
│ │ Zone 2 · 30 min                  │ │
│ │ Aerobe basis — voor energie die  │ │
│ │ de dag doorkomt.                 │ │
│ │                                  │ │
│ │ [  Markeer als gedaan  ✓  ]      │ │
│ │ Geen tijd vandaag?               │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Deze week                            │
│ Kracht      ▓▓░░░░░░  1 van 2        │
│ Conditie    ▓▓▓▓▓▓▓▓  gedekt         │
│ Mobiliteit  ░░░░░░░░  nog niets      │
│ Dagelijks   ▓▓▓▓▓▓▓░  5 van 7        │
│ → Kracht is nu je grootste winst.    │
├──────────────────────────────────────┤
│ JOUW PROGRAMMA        aangepast door │
│                              jou     │
│ Zone 2                     [wijzig]  │
│ ┌────────┬────────┬────────┐         │
│ │ DUUR   │ FREQ   │ INTENS │         │
│ │ 30 m ▾ │ 2× ▾   │ matig▾ │         │
│ │ advies │ jouw   │ volgt  │         │
│ │        │ keuze  │ duur   │         │
│ └────────┴────────┴────────┘         │
│ 2× past bij je herstelsignaal.       │
│ ▸ Wat verandert er als ik dit verzet?│
│                                      │
│ JOUW FOCUS         advies: conditie  │
│ [Kracht] [●Conditie] [Ritme]         │
├──────────────────────────────────────┤
│ WAT JE DEED                          │
│ ma 28  wandelen 25 min      licht    │
│ wo 30  Zone 2 30 min        matig    │
│        → dekte je conditieprikkel    │
│ ▸ Alle 34 momenten                   │
├──────────────────────────────────────┤
│ WAT DAT BETEKENT                     │
│ Je lijn   begin 55 · nu 58  ▲+3      │
│ Hermeting over 6 dagen               │
│ ▸ Waarom dit werkt voor jou          │
│ ▸ Waar komt dit vandaan?             │
└──────────────────────────────────────┘
```

### 12.2 Popover — frequentie verzetten

```
┌────────────────────────────────────┐
│ Hoe vaak per week?            ✕    │
│                                    │
│ ○ 1×   ● 2× ← advies   ○ 3×   ○ 4× │
│                                    │
│ Bij 3×: je weekprikkel stijgt      │
│ ongeveer de helft. Met je huidige  │
│ herstelsignaal houdt het systeem   │
│ één sessie licht.                  │
│                                    │
│ Waarom 2× het advies is: je gaf    │
│ gisteren aan moe te zijn.          │
│                                    │
│ [  Zet op 3×  ]  [ Laat op advies ]│
└────────────────────────────────────┘
```

### 12.3 Weekterugblik — de voorspelling getoetst

```
┌────────────────────────────────────┐
│ WEEK 2 · terugblik                 │
│                                    │
│ Je zette frequentie op 3×.         │
│ Je haalde 2 van 3.                 │
│                                    │
│ Dat is geen mislukking — 2× per    │
│ week is een prikkel die telt.      │
│                                    │
│ [ Houd 3× ]      [ Zet op 2× ]     │
│                                    │
│ Kracht 1× · Conditie 1× · wandelen │
│ 3×. Mobiliteit bleef open.         │
└────────────────────────────────────┘
```

Dit blok is **het bewijs van de hele blauwdruk**: hier ziet de gebruiker één keer per week dat zijn keuzes geregistreerd zijn, getoetst worden, en tot een voorstel leiden dat hij mag weigeren. Als er één ding gebouwd wordt uit dit document, is het dit.

### 12.4 Desktop, ≥1080px

Twee kolommen. Links (sticky, 260px): bouwfase, fase-as, focus. Rechts: NU → programma → logboek → betekenis. De bestaande grid (`MovementPlanRoadmap.tsx:109`) heeft dit al: `@[1080px]:grid-cols-[minmax(220px,260px)_minmax(0,1fr)]`.

---

## 13. Informatiearchitectuur

```
/dashboard?kompas=beweging
│
├── OVERZICHT  (default — de lus, §6.2)
│   ├── positie-header      bouwfase · week · sinds · anker
│   ├── NU                  vandaag-hero [enige check-off] · weekbalans
│   ├── JOUW PROGRAMMA      instrumentenpaneel · focus
│   ├── WAT JE DEED         logboek (uitklap: alles)
│   └── WAT DAT BETEKENT    lijn · hermeting · mechanisme · bron
│
├── PROGRAMMA               oefeningen per variant, read-only
├── VOORTGANG               statistiek, hermeting-delta
└── STARTPROFIEL            tijd · achtergrond · begrenzing · anker  (instellingen)
```

**Wat verdwijnt:** het aparte "Stappenplan" als vierde bestemming. De fase-as en het fase-paneel worden de positie-header + `WAT DAT BETEKENT` op Overzicht. Eén surface minder om te synchroniseren.

**Datalagen en hun eigenaar:**

| Laag | Bron | Wie schrijft | Wat het bepaalt |
|---|---|---|---|
| Startprofiel | `answers` jsonb | gebruiker, eenmalig+ | startpositie, adviesdosis, `loadLevel` |
| Anker | `movementAnchor` | gebruiker | waarom-copy |
| Programmakeuze | `MovementPlanProfile` | gebruiker | zichtbare stappen, dosis |
| Advies | derived | systeem | de default-standen |
| Uitvoering | `daily_action_log` | gebruiker via hero | positie, weekbalans, lijn |
| Positie | `computeCurrentPhaseId` | derived, nooit gezet | bouwfase, ontsluiting |
| Herstelsignaal | `RCV_FEEL` + exertie | gebruiker, laagfrequent | dagstap-override |

**Lege staten:**

| Situatie | Gedrag |
|---|---|
| Geen check | Score verborgen, *"Dit wordt je startpunt"*, geen dagstap forceren |
| Geen startprofiel | Advies op scores; startprofiel-prompt ná de eerste dagstap, nooit als muur |
| Geen focus | Focus-picker eerst |
| Lege week | *"Nog niets deze week — je eerste moment telt al mee"* |
| <2 punten voor de lijn | *"Nog te vroeg voor een lijn"* |
| Geen verse herstel-data | Geen herstel-copy (§10.3) |
| `RULES_VERSION`-grens | Delta `null` + *"meetmethode bijgewerkt"* |

---

## 14. Gebruikersflow

### 14.1 Nieuw

```
intake (scores + anker)
   → eerste dagstap  ← waarde vóór vragen
   → afvinken
   → "Nog 3 korte vragen zodat ik je dosis beter kan zetten" (overslaanbaar)
   → startprofiel → positie en dosis herberekenen
   → advies met zichtbare herkomst
```

De aanpasbaarheid wordt **niet uitgelegd** — ze wordt zichtbaar gemaakt (`▾` + herkomstlabel). Een onboarding-tour die vertelt dat je dingen kunt aanpassen, is het bewijs dat het ontwerp het niet zelf zegt.

### 14.2 Terugkerend

```
open → positie + vandaag
   ├─ afvinken → exertie (1 tik) → bijdrage-regel → "morgen kies je opnieuw"
   ├─ geen tijd → lichtere variant, telt volledig mee
   └─ knop verzetten → voorspelling → bevestigen → dosis herberekent
```

### 14.3 Wekelijks

```
maandag → weekterugblik (§12.3)
   → voorspelling getoetst → voorstel → [houden] of [bijstellen]
   → dosis en/of default-focus bij (§8.3)
```

### 14.4 Herstart na een gat

```
≥10 dagen niets → bouwfase = "terugkomen"
   → positie blijft staan
   → dosis −1 stap
   → "Je was er even niet. Je route staat nog waar hij stond."
   → één lichte instapsessie
```

Geen inhaalschema, geen verontschuldiging gevraagd, geen verloren voortgang.

---

## 15. Componentenstructuur

### Nieuw

| Component | Verantwoordelijkheid |
|---|---|
| `MovementProgramPanel` | Instrumentenpaneel (§5): waarden + herkomst + popovers. **Vervangt** `MovementProgramCard` + `MovementPlanAdjustSheet` — de merge van readout en besturing is de kern-ingreep. |
| `MovementValueDial` | Eén waarde: stand, herkomst, bereik, voorspelling. Generiek over duur/frequentie/modaliteit. |
| `MovementWeekBalance` | Weekbalans in vormen (§7.2). Bouwt op `MOVEMENT_FORMS` + daily-log i.p.v. sport-profielen. |
| `MovementPositionHeader` | Bouwfase + week + sinds + anker (§4.2). **Vervangt** `positionLabel` in de h2. |
| `MovementWeekReview` | Weekterugblik (§12.3). Het bewijs van de lus. |
| `MovementActivityLog` | Logboek met bijdrage-regels (§7.3). |
| `MovementStartProfile` | De 3 startvragen (§4.3). |

### Wijzigen

| Component | Wijziging |
|---|---|
| `MovementPlanRoadmap` | Fase-as blijft als navigatie; ordinale kop → `MovementPositionHeader`. |
| `MovementSportLens` | *"kleurt de uitleg"* / *"veranderen nooit je programma"* eruit. Sporten voeden de weekbalans en het advies (niet de positie). |
| `MovementTodayHero` | Ongewijzigd in gedrag. Enige check-off. **Niet aanraken.** |
| `MovementPlanDeepBody` | Wordt de compositie-laag van de logboek-as i.p.v. plan-reader. |

### Lib

| Module | Verantwoordelijkheid |
|---|---|
| `movement-plan-profile.ts` | ⬆️ `duration` toevoegen; herkomst per veld (`advice` \| `user`) — dat laatste is wat §5.2 mogelijk maakt |
| `movement-dose.ts` | 🆕 dosis-resolutie + voorspelling ("weekprikkel +50%") |
| `movement-week-balance.ts` | 🆕 daily-log + sporten → vorm-dekking |
| `movement-week-review.ts` | 🆕 voorspelling vs. uitkomst → voorstel |
| `movement-start-profile.ts` | 🆕 startprofiel → startpositie + `loadLevel` |
| `movement-plan-roadmap.ts` | ⬆️ bouwfase-namen incl. `terugkomen`; ordinaal label eruit |
| `movement-recovery-hint.ts` | ⬆️ signaal-leeftijd meegeven; zwijgen zonder verse data |
| `movement-nutrient-bridge.ts` | ⬆️ trigger op gelogde krachtsessie i.p.v. alleen intake-signaal |

### Data

| Bestand | Wijziging |
|---|---|
| `session-catalog.ts` | `durationMin: string` → gestructureerd bereik + opties |
| `lifestyle-plans/movement.ts` | `mechanism` → `mechanism.variants[]` met `when`-condities (§11.2) |
| `movement-forms.ts` | Ongewijzigd — wordt de meeteenheid van §7.2 |

---

## 16. Hoe AI hier continu coacht zonder dwingend te worden

### 16.1 Eerst: AI is hier grotendeels niet nodig

Alles in §8.3 (focus leren), §5.4 (waarschuwen), §12.3 (weekterugblik) is **regelgebaseerd** haalbaar. Dat is een voordeel, niet een beperking: regels zijn uitlegbaar, testbaar, reproduceerbaar en veroorzaken geen medische claim per ongeluk. Voor een product dat "adviezen, geen diagnoses" moet waarmaken, is determinisme een feature.

### 16.2 Waar AI wél waarde toevoegt

| Toepassing | Vorm | Poort |
|---|---|---|
| **Variant-selectie mechanisme-copy** | Kiest uit een **vaste set** varianten (§11.2). Genereert niets. | Nu haalbaar |
| **Herformuleren naar toon** | Bestaande copy naar begrijpelijker Nederlands, binnen `WRITING_VOICE.md` | Redactioneel, offline, mens reviewt |
| **Patroonherkenning in de log** | *"Je logt vaker op woensdag"* — voorstel voor timing | Genoeg datapunten; deterministisch te verifiëren |
| **Reranking van kandidaat-stappen** | `ModelRecommendationStrategy` op pseudonieme features | `BLAUWDRUK §15`: fase 6+, guardrails |

### 16.3 De vijf guardrails

1. **AI kiest, genereert niet.** Elke uitspraak over gezondheid komt uit een door mensen geschreven, KOAG-getoetste set. Vrije generatie over gezondheid gaat niet naar de gebruiker.
2. **Geen enkele automatische wijziging.** AI mag voorstellen; alleen de gebruiker verzet knoppen. Dit is niet-negotiabel — het is de hele belofte.
3. **Herkomst zichtbaar.** Een AI-voorstel is gelabeld als voorstel, met een weiger-optie ernaast.
4. **Nooit opschroeven boven herstel.** `BLAUWDRUK §13`: herstel limiteert, motivatie staat toe. Geldt voor AI zonder uitzondering.
5. **Geen vrije-tekst gezondheidsdata in features.** `BLAUWDRUK §15`; pseudonieme, gecategoriseerde features.

### 16.4 De toon

Drie regels die de grens tussen coachen en dwingen bewaken:

- **Constateer, adviseer, laat.** *"Kracht staat nog open. Eén sessie is genoeg. Of pak conditie — ook goed."*
- **Nooit tweemaal hetzelfde vragen.** Eén keer voorstellen. Genegeerd = geaccepteerd, geen herhaling.
- **Geen tweede persoon in de gebiedende wijs bij afwijkingen.** Niet *"pak die krachtsessie op"* maar *"kracht staat nog open"*. Het verschil tussen een coach en een baas zit in de werkwoordsvorm.

---

## 17. Standaard, optioneel of volledig aanpasbaar

| Onderdeel | Status | Waarom |
|---|---|---|
| **Anker (waarom)** | verplicht, altijd wijzigbaar | motor van volhouden; zonder anker geen betekenis |
| **Focus** | advies-default, vrij wijzigbaar | kernuiting van eigenaarschap |
| **Modaliteit** | advies-default, vrij wijzigbaar | 5 varianten bestaan al |
| **Frequentie** | advies-default, vrij wijzigbaar | met voorspelling, nooit blokkerend |
| **Duur** | advies-default, vrij wijzigbaar | per variant begrensd |
| **Sporten** | optioneel, max 3 | voedt weekbalans + advies |
| **Startprofiel** | optioneel, aanbevolen | overslaanbaar; verbetert de dosis |
| **Herstel-check** | optioneel, laagfrequent | zonder data zwijgt het systeem |
| **Exertie na afvinken** | optioneel, 1 tik | overslaan mag; geen blokkade |
| **Intensiteit** | ⛔ derived | veiligheidsmarge (§5.3) |
| **Positie/bouwfase** | ⛔ derived | verdiend, niet gezet (lock 5) |
| **Score** | ⛔ derived | engine-SSOT, geen tweede cijfer |
| **Wearable-koppeling** | optioneel, art. 9-gate | expliciete toestemming |
| **Aantal check-off-oppervlakken** | ⛔ exact één | kern-invariant |

**De regel achter de tabel:** alles wat een *voorkeur* is, is aanpasbaar. Alles wat een *uitkomst* is, is afgeleid. Alles wat een *veiligheidsgrens* is, is vast. Als een gebruiker zich beklaagt dat hij iets niet kan aanpassen, hoort daar altijd één van die drie antwoorden bij — en het derde antwoord komt met een fysio-verwijzing, niet met een nee.

---

## 18. Fasering

Op impact-per-inspanning, niet op technische afhankelijkheid.

### Slice 1 — de illusie van rigiditeit breken *(alleen UI + copy)*
1. **Verwijder de vier onmacht-strings** (§0.1). Geen enkele codewijziging in logica.
2. **Merge programmakaart + adjust-sheet** → `MovementProgramPanel` met `▾`-affordances en herkomstlabels (§5.1).
3. **Ordinaal label eruit** → `MovementPositionHeader` (§4.2).
4. **Eén naam voor focus** (§8.1).

> Hoogste rendement in het document. Geen engine-werk, geen migratie, geen nieuwe data. Punten 1 en 3 zijn samen een middag werk en halen het grootste deel van de klacht "dit voelt als een voorgeschreven schema" weg.

### Slice 2 — de lus voelbaar maken
5. Weekbalans in vormen (§7.2) + bijdrage-regels (§7.3).
6. Logboek-as op Overzicht (§6.2).
7. Weekterugblik (§12.3).

### Slice 3 — echt adaptief
8. Startprofiel (§4.3) + `loadLevel`.
9. Dosis-resolutie met voorspelling (§5.4).
10. Focus-leren (§8.3).
11. `terugkomen` als bouwfase (§14.4).

### Slice 4 — de engine-beslissing
12. **Fase-lock oplossen** (§9.4) — tier-resolver fase-aware. Enige echte engine-wijziging; besluit vereist.
13. `mechanism.variants` (§11.2).

### Meetpunten

Bij elke geactiveerde control hoort een meetpunt in dezelfde wijziging (`CLAUDE.md` meet-standaarden). Hergebruik bestaande types waar mogelijk (`movement_sport_selected`, `movement_gap_shown` bestaan al).

| Event | Leest af |
|---|---|
| `movement_dial_opened` (`dial`, `surface`) | Wordt de aanpasbaarheid nu wél gezien? **De hoofdmeting van slice 1.** |
| `movement_dial_changed` (`dial`, `from`, `to`, `direction`) | Verzetten mensen daadwerkelijk, en welke kant op? |
| `movement_dial_reverted` | Is "laat op advies" een gebruikte uitweg? |
| `movement_week_review_shown` / `_action` (`kept` \| `adjusted`) | Landt de onderhandeling van §3.3? |
| `movement_start_profile_completed` (`skipped_count`) | Is 3 vragen ná de dagstap acceptabel? |
| `dashboard_vandaag_action_toggled` | Bestaand — hero-conversie mag niet dalen. **De regressiewacht.** |

Registratie op drie plekken: `src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`. Geen PII in GA4/Clarity.

---

## 19. De aanbeveling in één alinea

Bouw geen nieuw systeem. Het adaptieve systeem dat je vraagt, staat er grotendeels al — het presenteert zich alleen als een voorschrift, omdat de besturing ergens anders staat dan de waarden en omdat de UI op vier plaatsen letterlijk zegt dat de input van de gebruiker niets verandert. **Slice 1 — vier strings schrappen, de programmakaart en de adjust-sheet samenvoegen tot knoppen met een zichtbare herkomst, en "Fase 1 van 3" vervangen door "basis leggen · week 2 · sinds 14 juli" — verandert de ervaren aard van het scherm zonder één regel engine-logica aan te raken.** Daarna maakt slice 2 de lus voelbaar met een weekbalans in bewegingsvormen (niet in calorieën: dat is schijnprecisie én het kantelt het advies structureel naar supplementen) en een weekterugblik die je eigen keuze tegen je eigen uitkomst legt — dát is het moment waarop een gebruiker ziet dat het systeem van hem leert, en geen enkele hoeveelheid copy kan dat vervangen. Slice 3 en 4 voegen de echte nieuwe intelligentie toe: een startprofiel zodat de ervaren veertiger niet meer als beginner begint, en de fase-aware tier-resolver zodat zes weken loggen ook zes weken vooruitgang oplevert. Houd bij alles drie grenzen: uitvoering heeft één bron, positie is verdiend en nooit gezet, en herstel spreekt alleen wanneer er een vers signaal is — dat zijn niet de rem op de adaptiviteit, dat is precies waarom je adaptiviteit te vertrouwen valt.

---

*Opgesteld 30 juli 2026, geverifieerd tegen `main` + de bestaande beweeg-componenten en SSOT-docs. Geen implementatie, geen code. Verandert geen DEFER/FREEZE/KILL-status; §9.4 vraagt één expliciet besluit.*
