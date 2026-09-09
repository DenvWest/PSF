# Besluit: het voedingsdagboek in Kompas — producten, gerechten en het logboek dag → week → maand

**Datum:** 9 september 2026
**Status:** ontwerpvoorstel met prebuilds; nog niet gebouwd
**Herzien:** 9 sep — één invoervorm in plaats van twee sporen (§1), de asymmetrie-regel op het weekscherm (§4), de meebewegende periodeschakelaar (§6), en een datumfout recht
**Prebuilds:**
- [`voedingsdagboek-kompas-prebuild-v1-2026-09.html`](voedingsdagboek-kompas-prebuild-v1-2026-09.html) — K1 Kompas › Voeding · K2 je dag · K3 dagbeeld · K4 Kompas home
- [`voortgang-voedingslogboek-dag-week-maand-prebuild-v1-2026-09.html`](voortgang-voedingslogboek-dag-week-maand-prebuild-v1-2026-09.html) — V1 dag · V2 week (met periodeschakelaar) · V3 maand · A1 agenda · S1 schap

**Aanname op elk scherm:** leefstijlcheck én voedingscheck zijn gedaan.
**Voorafgaand:** [`ROADMAP_LEEFSTIJLCHECK_NAAR_DASHBOARD_VOEDING.md`](../plan/ROADMAP_LEEFSTIJLCHECK_NAAR_DASHBOARD_VOEDING.md) §10.5, §10.7, §12 — dit document werkt plak 7c uit en gaat op één punt bewust verder dan §12.9.

---

## 0 · De vraag, en het korte antwoord

Vier dingen gevraagd:

1. Het voedingsdagboek een plek in Kompas, met sterke logica én interface. Hoort de voedingscheck daar ook — op home en op profiel voeding?
2. Losse producten en hele gerechten kunnen kiezen, met milligrammen per stof.
3. Voortgang als vervolg vanuit Kompas: één totaalbeeld van dag → week → maand.
4. Daarna veel meer producten en gerechten toevoegen.

Het korte antwoord, per punt:

1. **Ja voor het dagboek, nee voor de check.** Het dagboek is een dagelijkse handeling en hoort op een dagscherm; de voedingscheck is een periodieke meting van dertien vragen en hoort dat niet te zijn. Op Kompas home komt alleen een uitnodiging, en alleen als er iets openstaat.
2. **Ja, en het mag — mits het getal zijn juiste naam krijgt.** Een som over gekozen producten is een **ondergrens**, geen inname. Dat ene woord is het verschil tussen een eerlijk instrument en schijnprecisie.
3. **Ja, met één regel die tegen de intuïtie ingaat:** hoe verder je uitzoomt, hoe *minder* precies het getal wordt. Dag = milligrammen, week = patroon, maand = dekking en kalibratie.
4. **Kan pas fatsoenlijk ná een omkering van de tabel.** `FOOD_SOURCES` staat verkeerd om, en die fout kost bij elke nieuwe rij meer. §5.

---

## 1 · Eén invoervorm (herzien, 9 sep)

**v0 stelde twee sporen naast elkaar voor:** snel (porties per voedselgroep, chiprij) en precies (producten en gerechten). Dat is losgelaten. Twee invoervormen met een schakelaar ertussen lezen als een product dat zijn eigen keuze niet heeft gemaakt, en de chiprij met dertien groepen ziet er onaf uit op een scherm dat verder uit echte gegevens bestaat.

**Het dagboek op Kompas kent nog één vorm: producten en gerechten.** Wat de groepenvorm bood was snelheid, en die is opgevangen met gerechten — één tik zet vier componenten neer, met hun porties al ingevuld.

| | Kompas › Voeding › Je dag |
|---|---|
| Je kiest | een product of een heel gerecht, uit een zoekveld |
| Portie | tik op het aantal gram en typ het |
| Opslag | `account_nutrition_daybook`, sleutel `items` naast de bestaande `portions` en `meals` |
| Levert | milligrammen per stof, én je groepen, breedte en variatie (afgeleid) |

**Elk product draagt zijn voedselgroep**, dus `portions` wordt bij het opslaan uit `items` afgeleid. Alles wat vandaag op `portions` rekent — `berekenBreedte`, `berekenVariatie`, de weekendvergelijking, `selfReportUitDagboek` — blijft werken zonder één regel wijziging.

**Wat niet verdwijnt.** Het bestaande 2+2-paneel op Voortgang (P5, Meten & timing) blijft zoals het is. Oude dagen die met groepen zijn ingevuld blijven leesbaar: ze missen alleen `items`, en dat leest als "niet op productniveau ingevuld", niet als nul — dezelfde soort versiegrens die `gevraagdeGroepen()` al hanteert.

**De portie is de knop.** Geen plus en min: de zinnige stapgrootte verschilt per product (5 g bij noten, 50 g bij aardappelen), en een stepper die dat probeert te raden kost bij een moot zalm acht tikken. Tikken opent een invoerveld, Enter of wegklikken legt vast, Escape laat staan.

Bij een gerecht past dat **alleen die ene component** aan; het item houdt zijn naam en draagt de aantekening *aangepast*. Dat is eerlijker dan het gerecht als geheel schalen: wie een grotere moot zalm nam, nam niet ook meer spinazie.

## 2 · De ondergrens-regel

`food-sources.ts` draagt een harde leesregel:

> Deze waarden tellen **NIET** op tot een dagtotaal. De band per nutriënt komt uit frequentievragen, niet uit grammen.

Die regel is geschreven voor de **check** en klopt daar volledig: frequenties tellen niet op tot milligrammen. Voor de productinvoer geldt hij niet op dezelfde manier — daar staat een concreet product met een concrete portie, en dat is precies de invoer waarvoor `amountForPortion()` bestaat. De drie redenen in de kop van `nutrient-routes.ts` staan er ook verschillend voor dan bij het schrijven:

| Reden | Stand nu |
|---|---|
| "De check meet frequenties, geen grammen" | Geldt voor de check. Geldt **niet** voor de productinvoer. |
| "Elke waarde staat op `verified: false`" | **Achterhaald.** 44 van de 78 rijen zijn NEVO-geverifieerd. |
| "Bij magnesium en zink bepaalt fytaat de opname méér dan het gehalte" | **Geldt onverkort.** Dit is de reden die blijft, en hij vraagt om annotatie, niet om verzwijgen. |

Wat de regel blijvend afdwingt is de **naam** van het getal. Een dagboek registreert wat je noemt, en niemand noemt alles — de koffie, de olijfolie, het broodje dat je vergat. De som is dus per definitie een ondergrens. Concreet:

- ✅ *"Minstens 350–530 mg magnesium uit de bronnen die je noemde."*
- ❌ *"Je haalde 440 mg magnesium binnen."*
- ❌ *"Je zit op 126 % van je dagbehoefte."*

Drie dingen reizen verplicht mee met elk mg-getal:

1. **Het woord "minstens".** Nooit weg te laten, ook niet in een compacte weergave.
2. **Een band, geen punt.** Wilde en gekweekte zalm schelen een factor; een puntwaarde liegt daar.
3. **De opname-annotatie.** Komt meer dan de helft uit fytaatrijke bronnen, dan staat dat erbij. Een som zonder die annotatie is misleidender dan geen som.

En de richtwaarde staat als **marker** op de balk, nooit als percentage. Een marker toont een positie; een percentage nodigt uit tot optellen naar honderd. Dat is het verschil tussen weten waar je staat en een dagdoel najagen — en dat laatste is precies wat dit product niet wil zijn.

**Wat dit níét raakt:** de voedingsscore. Die komt uit de check en verandert hier niet door. Zelfde lock als bij beweging (minuten = evidence, nooit een tweede score). Wat het dagboek wél doet is de check *kalibreren* — §4.

---

## 3 · Waar het in Kompas landt

**Kompas › Voeding** krijgt één kaart erbij: *Je dagboek · deze week*, met de vier plekken als vier knoppen (de vorm die `NutritionDagboekPaneel` sinds 5 september al heeft). Het invullen opent als **sheet over het scherm**, niet als nieuw scherm. Kompas blijft waar je leest waar je staat.

De kaart komt **onder** de prioriteiten en **boven** het tweeluik. Volgorde van vragen: *waarheen* (prioriteiten) → *wat doe ik nu* (dagboek) → *hoever ben ik* (tellingen).

**Kompas home** krijgt géén voedingscheck. Wel een dagboekkaart, en alleen als er iets openstaat — hij verdwijnt zodra de ronde vol is en komt terug bij de volgende. Een vaste tegel die "4 van de 4" meldt is meubilair.

### Waarom de voedingscheck niet op Kompas komt

De vraag was expliciet, dus hier het volledige antwoord.

- **De check is een meting, geen handeling.** Dertien sliders op een thuisscherm maken van Kompas een intake. De rechterkolom van de vierlagen-tabel in de roadmap zegt het al: Kompas mag geen analyse tonen.
- **De uitkomst zit er al wél in** — de ring, de statusregel, de prioriteiten, het tweeluik. Dat is de check op Kompas, in de vorm die er hoort.
- **Opnieuw meten hoort bij je hertest**, en die woont op Voortgang. Een tweede startpunt zou twee plekken maken waar een meting begint, met twee verschillende opgebouwde contexten.
- **Op profiel voeding (Voortgang › Voeding) hoort hij wél**, en daar staat hij ook. Dat is het scherm dat je opent om te meten, niet om te doen.

**Uitzondering die ik wél zou bouwen:** een uitnodiging op Kompas wanneer de check zichzelf niet vertrouwt — bij `own`-rijen, bij tegenstrijdige antwoorden, of wanneer de kalibratie uit het dagboek structureel afwijkt. Dan is "je check opnieuw doen" een antwoord op een vraag die het scherm zelf stelt, en geen vragenlijst die om aandacht bedelt.

---

## 4 · Voortgang: dag → week → maand

De drie zoomniveaus delen één grammatica — dezelfde stofvolgorde, dezelfde kleuren, dezelfde leesrichting. Wat verandert is de vraag, en met de vraag de precisie:

| Niveau | Vraag | Toont | Toont **niet** |
|---|---|---|---|
| **Dag** | Wat stond er op mijn bord? | mg-ondergrens per stof, bronnen, opname-annotatie | een oordeel — één dag zegt niets over je patroon |
| **Week** | Wat is mijn patroon? | de dagen als rijen, stoffen als kolommen, mg per dag náást elkaar | **geen weektotaal** — een som van ondergrenzen is een zwakkere ondergrens |
| **Maand** | Klopt mijn check? | dekking over alle dagboekdagen, kalibratie, de cyclusband | **geen mg, geen gemiddelde** |

**De zoomregel gaat bewust tegen de intuïtie in.** De gebruikelijke opbouw is: dag = ruw, maand = precies, want meer data. Hier is het omgekeerd, en dat volgt uit het instrument. Een maand bestaat uit dagen die ongelijk volledig zijn ingevuld; daarover middelen voegt geen zekerheid toe, het verbergt alleen dat de onderliggende dagen niet hetzelfde meten. Wat een langere periode wél beter maakt is **dekking**.

### De asymmetrie — de regel die het weekscherm draagt (9 sep)

Uit de ondergrens-regel volgt iets dat v0 nog niet had uitgewerkt:

> **Een ondergrens kan "gehaald" bewijzen, en "niet gehaald" nooit.**

Haalt de ondergrens uit de bronnen die je noemde de richtwaarde, dan sta je erboven — wat je vergat te noemen kan er alleen bij komen. Haalt hij hem niet, dan volgt er niets uit.

Daarom staat er op het weekscherm **geen "132 g onder"** (zoals in de app waar de vorm vandaan komt), geen rood kruis en geen weektotaal. Alleen een ✓ waar dekking bewezen is, en verder het getal zelf. De kolomvoet telt twee dingen: op hoeveel dagen er een bron was, en op hoeveel dagen dekking bewezen kon worden.

### Niet elke stof is bewijsbaar — en dat hoort het scherm te zeggen

Bij het doorrekenen van dertien echte dagen (met de gehaltes uit `food-sources.ts`) kwam dit eruit:

| Stof | Bron aanwezig | Dekking bewezen |
|---|---|---|
| Magnesium | 13 van 13 dagen | **1** |
| Omega-3 | 4 van 13 dagen | **3** |
| Zink | 13 van 13 dagen | **0** |
| Vitamine D | 4 van 13 dagen | **1** |

Zink en vitamine D komen er structureel niet aan, en dat is geen eigenschap van deze gebruiker:

- **Zink** — bronnen leveren 1–4 mg per portie tegen een richtwaarde van 9–11 mg. Alleen oesters halen dat in één portie. Een dagboek dat niet alles vangt, komt er nooit.
- **Vitamine D** — komt bij vrijwel iedereen uit zonlicht en uit verrijking, niet uit voeding. Alleen vette vis tilt een dag erboven.

Een kolom die nooit een vinkje kan geven, leest als falen terwijl hij een eigenschap van de méétmethode toont. Daarom draagt elke stof een `bewijsbaar`-vlag: staat die op false, dan toont het scherm géén dekkingsoordeel maar alleen de bronnentelling, met de reden erbij. Dezelfde soort eerlijkheid als de `own`-status in `nutrition-ladder.ts` — *nooit een badge die suggereert dat er een grens was die je miste.*

### Wat er uit de bestaande app-vorm is overgenomen

De weekvorm komt uit een screenshot van een bestaande calorie-app: dagen als rijen met dag-afkorting en datum, stoffen als kolommen, een samenvattingsrij eronder, een voetnoot, en periodetabs bovenaan. Die vorm is goed en overgenomen. Wat níét is overgenomen: `"132 g onder"`, het weektotaal, het dagbudget en de export-sheet (die hoort in de AVG-route, niet in een voedingsscherm).

### Een vondst uit het bouwen van de prebuild

Dekking op **groepsniveau** werkt voor magnesium, zink en eiwit. Voor **vitamine D werkt hij niet** en voor **omega-3 maar half**:

- Verrijkte margarine is een echte vitamine-D-bron, olijfolie niet. Op groepsniveau ("oliën & vetten") zijn die twee niet te scheiden — een teller die de groep meerekent meldt bij iedereen die olijfolie gebruikt volledige dekking.
- "Vis" telt tonijn uit blik (200 mg EPA/DHA) even zwaar als makreel (3.000 mg).

Dat is meteen het scherpste argument voor de productvorm: alleen daar staat wélke bron het was.

### Datumfout in v0

De prebuilds lieten je zaterdag 12 september invullen terwijl vandaag woensdag 9 september is. Een dagboek dat een dag in de toekomst registreert, is geen dagboek. De tijdlijn staat nu vast: cyclus dag 1 = maandag 17 augustus, vandaag = dag 24, hertest op dag 30 = 23 september, en de dag die je invult is **zondag 6 september** — de laatste vrije weekenddag.

## 5 · Wat er aan de data moet gebeuren (en dit is punt 4 van de opdracht)

**De tabel staat verkeerd om.** `FOOD_SOURCES` is `nutriënt → bronnen`. Een productkiezer heeft `product → nutriënten` nodig. Havermout staat vandaag in drie lijsten (eiwit, magnesium, zink) als drie losse rijen; wie hem kiest moet die drie zelf bij elkaar zoeken.

**Dat levert nu al twee echte fouten op**, verifieerbaar in de repo:

| Fout | Waar |
|---|---|
| `belegen-kaas` heeft portie **"50 g (2 sneden)"** in `PROTEIN_SOURCES` en **"30 g (1 snee)"** in `ZINC_SOURCES` — zelfde sleutel, twee porties | `food-sources.ts:633`-blok vs. `:1353`-blok |
| Zalm heet `zalm-wild` / `zalm-gekweekt` bij omega-3, maar gewoon `zalm` bij vitamine D | `OMEGA3_SOURCES` vs. `VITAMIN_D_SOURCES` |

En één die eruit rolde bij het omrekenen naar per-100 g voor de prebuild:

| Vermoedelijk verkeerd getal | Waar |
|---|---|
| `belegen-kaas` eiwit: **18 g per 50 g** impliceert 36 g eiwit per 100 g. Belegen kaas zit rond 25 g. De zinkrij van hetzelfde product (1,2 mg per 30 g → 4,0 mg/100 g) is wél plausibel. De rij staat op `source: UNVERIFIED`, dus formeel is er niets gebroken — maar hij is nu niet als afwijkend te zien, en in een productkiezer wordt hij zichtbaar opgeteld | `food-sources.ts:338`-blok |

Zolang de tabel per nutriënt is ingedeeld, is zo'n getal alleen te vinden door twee lijsten naast elkaar te leggen. Zodra één product zijn stoffen bij elkaar draagt, valt het meteen op — en dat is de derde reden voor de omkering hieronder, naast onderhoudbaarheid en de twee fouten erboven.

De bestaande test bewaakt sleutel-uniciteit alleen *binnen* een nutriënt (`food-sources-provenance.test.ts`, "elke rij heeft een unieke sleutel binnen zijn nutriënt"), dus geen van beide valt op. Bij 78 rijen is dat te overzien. Bij 300 producten en 80 gerechten is het onhoudbaar — en de opdracht is expliciet om díé kant op te gaan.

### Voorgestelde vorm

```ts
// src/data/nutrition/foods.ts — de nieuwe bron van waarheid
export interface Food {
  key: string;                    // stabiel, kebab-case, uniek over de héle index
  labelNl: string;
  groep: VoedselgroepId;          // de brug naar het dagboek: dit vult `portions`
  defaultPortion: { labelNl: string; grams: number };
  nutrients: Partial<Record<NutrientId, {
    per100g: NutrientValue;       // ongewijzigd geciteerd — NEVO waar beschikbaar
    variability: Variability;
    bioavailability: Bioavailability;
    bioavailabilityWhy?: string;
    omega3Kind?: Omega3Kind;
  }>>;
  preparationNote?: string;
  qualityNote?: string;
}

// src/data/nutrition/dishes.ts — samenstellingen, nooit eigen gehaltes
export interface Dish {
  key: string;
  labelNl: string;
  components: readonly { foodKey: string; grams: number }[];
}
```

En dan:

```ts
// FOOD_SOURCES wordt afgeleid, niet meer met de hand onderhouden
export const FOOD_SOURCES: Record<NutrientId, readonly FoodSource[]> =
  buildFoodSourcesIndex(FOODS);
```

Wat dat oplevert:

- **Een nieuw product is één rij, geen vijf.** Dat is de voorwaarde om punt 4 van de opdracht überhaupt te kunnen doen.
- **De twee fouten hierboven worden per constructie onmogelijk**: één product, één portie, één sleutel.
- **Alle bestaande consumenten blijven werken.** `NutrientLogboekPanel`, `CategorieDetailPaneel`, `nutrient-rail.ts`, `nutrition-contribution.ts` — die lezen `FOOD_SOURCES` en merken niets.
- **De licentiescheiding blijft intact.** `per100g` is het geciteerde deel (NEVO 2025/9.0), de omrekening naar een portie blijft onze bewerking via `amountForPortion()`. `verified` slaat nog steeds alleen op de brondwaarde, niet op de literatuuroordelen.

**Gerechten zijn samenstellingen, geen voedingsmiddelen.** De milligrammen komen altijd uit de componenten. Een gerecht met eigen gehaltes zou een tweede tabel zijn die van de eerste kan gaan afwijken — precies de fout die we hierboven aan het opruimen zijn. Een gerecht schaalt als geheel (½, 1, 1½ portie); losse componenten aanpassen zou het gerecht een samenstelling geven die van zijn definitie afwijkt, en dan is het geen gerecht meer maar een verzameling losse producten (die vorm bestaat al).

### Openstaande verificatie

> **Correctie op de roadmap.** `ROADMAP_LEEFSTIJLCHECK_NAAR_DASHBOARD_VOEDING.md` §10.9 en §12.1 noemen "79 bronnen, 47 NEVO-geverifieerd". De stand in de repo is **78 rijen, 44 geverifieerd, 34 nog niet** (geteld op `^    key:` en `^    verified:`; de test asserteert `toBeGreaterThanOrEqual(44)`). De getallen hieronder volgen de code, niet de roadmap.


- **34 van de 78 rijen** hebben nog een indicatieve literatuurwaarde zonder NEVO-verificatie. Die moeten af vóórdat mg-getallen op een keuzescherm staan. In de UI dragen ze tot die tijd een merkteken (`○` in de prebuild).
- **De spreidingsmarges (±10 / 25 / 40 % naar `variability`) zijn plaatshouders zonder bron.** Ze staan er omdat een puntwaarde bij wilde versus gekweekte vis liegt. Vóór livegang: vervangen door een per stof gebronde spreiding, of laten vallen ten gunste van een expliciete "hangt sterk af van de bron"-annotatie. **Dit is het zwakste punt van het voorstel en het hoort als eerste opgelost.**

---

## 6 · De keuze: voeding ↔ supplement

Het blok bestaat (`NutrientRouteChoiceCard`). Wat het dagboek toevoegt is **bewijs uit eigen dagen** naast het antwoord uit de check:

> **Je check:** omega-3 op aandacht — de drempel is 2× vette vis per week.
> **Je dagboek:** 2 visdagen over 9 geregistreerde dagen, waarvan één in het weekend.

Dezelfde keuze, maar nu met iets waar je het niet mee oneens kunt zijn. Dat is het verschil tussen een advies en een constatering.

**Harde grenzen die blijven:**

- **Het dagboek opent de poort nooit zelf.** `resolveNutritionGate` houdt laag 6 dicht zolang laag 1–2 een `below` heeft én er geen restsignaal is. Het dagboek maakt dat restsignaal alleen harder of zachter.
- **Spreken check en dagboek elkaar tegen, dan staat dat er als vraag** — nooit als correctie. Geen van beide is de waarheid; samen zijn ze eerlijker dan elk apart.
- **Bij een dichte poort blijven de supplementknoppen zichtbaar maar onklikbaar**, met de reden ernaast. Verbergen laat de vraag verdwijnen in plaats van hem te beantwoorden, en dan leest de poort als "je supplement is fout".

**Wat het conversiemiddel is.** Niet de poort en niet een betere knop: het is dat het logboek elke dag iets nieuws te zeggen heeft, en dat de keuze scherper wordt naarmate je hem uitstelt. De enige eerlijke maat daarvoor is het verschil tussen `nutrition.agenda_action_planned` en `nutrition.agenda_action_completed`, plus het percentage dat binnen 7 dagen terugkeert na een geplande actie.

---

### Het schap beweegt mee met je logboek (9 sep)

Het schap draagt **dezelfde periodeschakelaar** als het logboek, en beide delen één stand. Wissel je op Voortgang naar "2 weken geleden", dan toont het schap het bewijs van díé weken onder dezelfde keuze.

Dat is meer dan gemak: een keuze die je in augustus maakte, hoort tegen het bewijs van augustus gelegd te kunnen worden, niet tegen dat van vandaag. Daarom krijgt `nutrition.route_choice_saved` een veld `periode` — dan is achteraf afleesbaar op welk bewijs een keuze rustte.

**Wat niet meebeweegt is de poort.** Die hangt aan je check en aan je ladderstatus, niet aan een week logboek — anders zou een goede week hem openen en een slechte hem sluiten, en dan is het geen poort meer.

**Het oordeel per stof kent vier vormen**, en ze mogen niet door elkaar lopen:

| Patroon | Oordeel | Wat het zegt |
|---|---|---|
| Bewezen op elke dag | *Uit je eten* | geen aanleiding om aan te vullen |
| Bron op sommige dagen, bewezen als hij er is | *Wisselend* | de bron werkt — je eet hem te weinig. Frequentievraag. |
| Bron elke dag, zelden of nooit bewezen | *Hoeveelheid* | de bron ontbreekt niet; de hoeveelheid per dag (en bij fytaat de opname) is de beperking |
| Niet bewijsbaar uit een dagboek | *Niet aan te tonen* | zegt iets over de meting, niet over jou |

Eiwit valt buiten die vier: dat is een **verdelingsvraag**, geen aanvulvraag, en krijgt zijn eigen formulering.

## 7 · Agenda: drie soorten regels

Op één dag kunnen drie voedingsregels staan, en ze zijn nadrukkelijk niet hetzelfde:

| Soort | Komt van | Vinkje betekent |
|---|---|---|
| **Actie** | je prioriteit op Kompas | gedaan |
| **Registratie** | het dagboek, zolang de ronde niet vol is | ingevuld — niet "goed gedaan" |
| **Reflectie** | verschijnt ná een geplande actie | beantwoord |

Ze delen de bestaande naad: favoriet-id `laag-voeding-p<n>-<slug>`, match op categorie + titel, datum en tijd **zonder herhaling**. Een herhalend blok dat je vijf dagen niet afvinkt is een schuldgenerator.

**Wat er nooit in de agenda komt: een productlink.** "Kies volkorenbrood bij de boodschappen" mag — dat is een aandachtspunt-actie zonder merk en zonder link. Een blok dat naar een product linkt omzeilt `resolveNutritionGate` volledig; dan zit de poort nog maar op één scherm dicht. De juiste weg is de deur naar het **schap**, waar de poort al hangt.

## 8 · Bouwvolgorde

| Plak | Wat | Kosten | Hangt af van |
|---|---|---|---|
| **A** | `foods.ts` + `dishes.ts` als bron van waarheid; `FOOD_SOURCES` afgeleid; test op sleutel- en portie-uniciteit over de héle index | middel | — |
| **B** | Het dagboek op Kompas: zoekveld, productkiezer, gerechtkiezer, tikbare portie, `items` in de JSONB-kolom, `portions` afgeleid bij opslaan | middel | A |
| **C** | Dagbeeld (K4): ondergrens per stof met band, richtwaarde-marker en opname-annotatie | klein | B |
| **D** | Dagboekkaart op Kompas › Voeding + voorwaardelijke kaart op Kompas home | klein | — |
| **E** | Logboek dag → week → maand op Voortgang; kalibratie verhuist naar maandniveau | middel | B |
| **F** | Agenda: registratie- en reflectieregel naast de bestaande actie-naad | klein | D |
| **G** | Dagboekbewijs in `NutrientRouteChoiceCard` | klein | E |
| **—** | NEVO-import afmaken (34 rijen) | handmatig | vóór C |
| **—** | Spreidingsmarges vervangen door een gebronde spreiding | onderzoek | vóór C |

**A is de plak die alles draagt.** Hem overslaan om sneller bij B te zijn betekent dat elk nieuw product in vijf lijsten moet, en dat de twee bestaande fouten er twintig worden. Punt 4 van de opdracht — veel meer producten en gerechten — is zonder A niet uitvoerbaar.

**D kan los.** De dagboekkaart op Kompas is de vier plekken plus één knop; die werkt op wat er vandaag al ligt en heeft B niet nodig. Goedkoopste zichtbare verbetering in de lijst.

---

## 9 · Meetpunten

Nieuwe client-events vereisen registratie op drie plekken: `src/lib/events.ts`, `src/lib/intake-events-client.ts` en de allowlist in `src/app/api/intake/events/route.ts` (voor account-events: `src/app/api/account/events/route.ts`).

**Bestaand, krijgt velden erbij:**
- `nutrition.dagboek_opened` — `surface`, `date`
- `nutrition.dagboek_day_saved` — `items`, `gerechten`, `aangepast`
- `nutrition.dagboek_kalibratie_shown` — verhuist mee naar het maandscherm

**Nieuw:**
- `nutrition.dagboek_portie_aangepast` — zegt of de standaardporties kloppen: een product dat structureel wordt bijgesteld, hoort een andere standaardportie te krijgen
- `nutrition.logboek_periode_changed` — zegt of mensen daadwerkelijk terugkijken, en hoe ver
- `nutrition.dagboek_item_added` — `kind` (los/gerecht), `key`; dit is de lijst die bepaalt wélke producten er in plak 4 bij moeten
- `nutrition.dagboek_dagbeeld_viewed` — is de mg-readout de bestemming?
- `nutrition.dagboek_bron_detail_opened` — leeft de bronvraag ("waar zát die magnesium in")?
- `nutrition.logboek_zoom_changed` — dag, week of maand: waar kijken mensen?
- `nutrition.logboek_naar_keuze` / `nutrition.keuze_naar_logboek` — loopt de brug tussen bewijs en keuze in beide richtingen?

**De twee getallen die het antwoord dragen:** `agenda_action_planned` versus `agenda_action_completed`, en `dagboek_item_added` gegroepeerd op `key`. Het eerste zegt of de keten gedrag oplevert; het tweede zegt precies welke producten en gerechten er als volgende bij moeten.

---

## 10 · Wat ik niet zou doen

- **Milligrammen op Kompas home.** Home is een tien-secondenscherm; een mg-balk vraagt om context die daar niet past.
- **De voedingscheck op Kompas.** Zie §3.
- **Een maandgemiddelde in milligrammen.** Ongelijk volledige dagen middelen is een vormfout, geen meting.
- **Percentages van een ADH, waar dan ook.** Een marker toont een positie; een percentage maakt er een doel van.
- **Het 2+2-paneel op Voortgang weghalen.** De groepenvorm is van Kompas af, niet uit het product: oude dagen moeten leesbaar blijven en niet iedereen wil op productniveau invullen.
- **Een dag in de toekomst laten registreren.** v0 deed dat; zie §4.
- **Een streak of een 7/7-doel.** Vier dagen blijft de norm; extra dagen tellen mee zonder van vier een halve prestatie te maken.
- **Producten toevoegen vóór plak A.** Elke rij die nu bijkomt, moet straks alsnog om.
- **Een tweede voedingsscore uit het dagboek.** Eén getal per domein, en dat komt uit de check.

---

## 11 · Afwijking van eerdere besluiten — expliciet

Twee plekken waar dit voorstel verder gaat dan wat er staat. Ze zijn hier genoemd zodat ze een besluit zijn en geen slordigheid.

1. **Roadmap §12.9 zegt: geen macro's in grammen tonen.** Dit voorstel toont eiwit in grammen op het dagbeeld. Reden: uit concrete porties is eiwit af te leiden, en de eiwitverdeling over de dag is een van de twee prioriteiten die het Kompas zelf noemt. Zonder grammen is die prioriteit niet af te lezen. De grens die blijft: geen koolhydraten, geen vet, geen calorieën — die dragen geen enkele route en zetten het dagboek om in een boekhouding.

2. **Roadmap §10.7 zegt: de uitbreiding zit niet in méér voedingsmiddelen.** Dat klopte toen de vraag was "helpt rij 80 de drie assen". Bij een productkiezer verandert de vraag: de index is dan geen naslagtabel meer maar de invoerwoordenlijst, en dáár telt dekking wél. Wat onveranderd blijft is dat meer rijen de *uitvoer* niet beter maken — de gebruiker ziet nog steeds vijf stoffen en begrijpelijke conclusies, geen dashboard met dertig nutriënten.
