# Besluit: NEVO als bron voor `food-sources.ts`

**Datum:** 2 september 2026
**Status:** structuur gebouwd, import nog te doen
**Raakt:** `src/data/nutrition/food-sources.ts`, `/beste/*` (supplementbrug)

## De vraag

Mogen we NEVO-waarden overnemen in `food-sources.ts`, zodat `verified: false`
eindelijk `true` kan worden en de supplementbrug op `/beste/*` gebouwd kan
worden?

## Het antwoord

Ja, met bronvermelding — maar niet in de vorm die de tabel toen had.

### Wat de bronnen zeggen

| Bron | Wat er staat |
|---|---|
| [data.overheid.nl](https://data.overheid.nl/dataset/nederlands-voedingsstoffenbestand3) | Licentie: **CC-BY (4.0)** |
| [RIVM copyright & disclaimer](https://www.rivm.nl/en/dutch-food-composition-database/access-nevo-data/nevo-online/copyright-and-disclaimer) | "Using the information from NEVO-online is only allowed **unchanged** and stating the source and version number" |

Die twee lopen niet gelijk: CC BY 4.0 staat afgeleide werken uitdrukkelijk
toe, "only unchanged" doet dat niet. Bij het downloaden ga je bovendien
expliciet akkoord met RIVM's voorwaarden, en dat akkoord staat contractueel
naast de licentie.

**Besluit: we houden de strengste lezing aan.** Dat kost ons niets, want de
scheiding die het afdwingt is inhoudelijk toch al beter.

### Verplichte bronvermelding

Letterlijk, bij elke weergave van NEVO-gegevens:

> NEVO-online versie 2025/9.0, RIVM, Bilthoven

Staat als `NEVO_CITATION` in `food-sources.ts`; een test bewaakt dat hij versie
en plaats noemt.

## Wat "ongewijzigd" voor ons betekende

De tabel vermengde twee dingen in één veld:

```ts
{ key: "makreel", portionNl: "125 g", amount: 16 }   // vitamine D, µg
```

Die 16 is geen NEVO-waarde. Het is een NEVO-waarde per 100 g × 1,25 — dus een
bewerking, en die mag niet als brondcijfer gepresenteerd worden.

Sinds v3 staat dat gescheiden:

- **`nutrientValue`** — het gehalte per 100 g zoals de bron het publiceert.
  Ongewijzigd, met NEVO-code en editie. Dit is het geciteerde deel.
- **`amount`** — datzelfde gehalte omgerekend naar onze portie, via
  `amountForPortion()`. Onze bewerking, herkenbaar als zodanig.

Dat is ook los van de licentie beter: een afgeleid getal is niet tegen een
brondbestand te leggen, dus zonder deze scheiding zou `verified: true`
betekenisloos zijn.

## Wat NIET uit NEVO komt

`bioavailability`, `variability`, `preparationNote` en `qualityNote` staan niet
in NEVO. Dat zijn literatuuroordelen met een eigen verificatiespoor — en juist
die dragen bij magnesium en zink de zwaarste conclusie (fytaat maakt mg uit
brood iets anders dan mg uit vlees).

`verified: true` slaat daarom **alleen op `nutrientValue`**, niet op de rest van
de rij. Een geverifieerde rij heeft een nageslagen gehalte, geen nageslagen
fytaat-oordeel.

## Het importpad

1. Download NEVO 2025/9.0 (vereist akkoord met de voorwaarden — handmatige stap).
2. Zoek de ~40 voedingsmiddelen op die `food-sources.ts` noemt.
3. Vul per rij `nutrientValue` met de waarde per 100 g, NEVO-code als `ref`,
   `edition: "2025/9.0"`, en de NEVO-naam in `sourceNameNl`.
4. Herbereken `amount` via `amountForPortion()` — nooit met de hand.
5. Zet `verified: true` alleen op rijen waarvan het gehalte daadwerkelijk is
   nageslagen.
6. Bronvermelding op elke pagina die de waarden toont.

Een reproduceerbaarheidstest die elke `nutrientValue` tegen het brondbestand
legt is het sluitstuk; die kan pas als het bestand er is.

## Open punten

- **Bevestiging bij RIVM** (`nevo@rivm.nl`) over de "ongewijzigd"-lezing in
  combinatie met CC BY 4.0. Eén mail, en dan staat het vast in plaats van dat
  wij twee bronnen tegen elkaar afwegen. Onze structuur is al op de strengste
  lezing gebouwd, dus een ruimer antwoord verandert niets — een strenger
  antwoord ook niet.
- **NES** (Nederlands Supplementenbestand, ~1.500 supplementen) is een ander
  bestand. Nuttig voor de vraag "wat is gangbaar in Nederlandse supplementen",
  niet voor productspecificaties op `/beste/*` — daar is het productlabel de
  bron.

## Invarianten (getest)

`src/lib/__tests__/food-sources-provenance.test.ts`:

- `verified: true` kan niet zonder `nutrientValue`
- elke brondwaarde draagt `ref` én `edition`
- een NEVO-waarde staat altijd per 100 g
- `amountForPortion()` laat de brondwaarde ongemoeid
- vandaag claimt geen enkele rij verificatie (verandert bewust bij de eerste import)

---

## Aanvulling 3 oktober 2026 — de volledige voorwaarden gelezen, en het bestand is er

Dennis heeft de voorwaarden (`Voorwaarden-voor-gebruik-NEVO-online-2025-databestand.pdf`, RIVM, versie 2025/9.0) gelezen en bij het downloaden geaccepteerd. Het databestand `NEVO2025_v9.0_Details.csv` (88 MB, 2.328 voedingsmiddelen, 137 stoffen) staat lokaal en niet in git. De eerdere open vraag "ongewijzigd of CC BY 4.0" is hiermee beantwoord: de tekst van het contract zelf zegt *"Gebruik van de informatie van NEVO-online is alleen toegestaan in ongewijzigde vorm en met vermelding van bron en versienummer."* De strengste lezing, waarop de code al gebouwd is, was dus de juiste.

### Wat de voorwaarden zeggen dat hierboven nog niet stond

1. **Aanvullingen mogen, wijzigingen niet.** *"Het is toegestaan aanvullingen te maken op NEVO-online versie 2025/9.0, mits […] direct duidelijk is dat het aanvullingen op de originele NEVO gegevens betreft. Het is de gebruiker niet toegestaan wijzigingen aan te brengen."* Gevolg: een NEVO-waarde en een waarde uit een andere bron (Open Food Facts, eigen invoer) mogen naast elkaar staan, maar elke rij moet laten zien waar zij vandaan komt. Een portie-omrekening is een afgeleide waarde en blijft gescheiden van het brongetal, zoals `nutrientValue` en `amount` al doen.
2. **Een tweede bronvermelding voor berekende uitvoer.** *"Voor output van Berekeningsprogrammatuur dient de gebruiker de volgende tekst te vermelden: 'Gebaseerd op gegevens van NEVO-online versie 2025/9.0, RIVM, Bilthoven', c.q. 'Gebaseerd op gegevens van NEVO-online versie 2025/9.0, RIVM, Bilthoven en andere gegevens'."* Een dagboek dat NEVO-waarden per portie en per dag optelt, is berekeningsprogrammatuur. Naast `NEVO_CITATION` (voor de ruwe waarde) hoort er dus een tweede constante voor berekende uitvoer, met de "en andere gegevens"-variant zodra een scherm ook andere bronnen gebruikt. Dat komt in de dagboekintegratie.
3. **Geen kosten voor eindgebruikers.** *"Het is daarom ook niet toegestaan aan (eind)gebruikers om kosten in rekening te brengen voor het gebruik van NEVO-online versie 2025/9.0."* **Dit raakt het verdienmodel.** Het premium-plan en elk toekomstig B2B-aanbod kunnen de NEVO-gegevens niet als betaald onderdeel verkopen. Het dagboek met NEVO-waarden moet voor de gebruiker gratis blijven, en een betaalde API voor partners mag NEVO niet bevatten. Waar de grens ligt (een betaald abonnement met een gratis onderdeel dat NEVO gebruikt) is een vraag voor RIVM: `nevo@rivm.nl`.
4. **Nieuwe versies vervangen de oude.** *"…vragen we aan gebruikers […] om zodra een nieuwe versie van NEVO-online beschikbaar komt de vorige versie te vervangen door de nieuwe."* Daarom draagt elke NEVO-rij de versie (`edition`), en is een nieuwe versie een herhaalbare import, geen handwerk. Aanmelden voor de RIVM-nieuwsbrief Voeding (abonneren.rivm.nl/voeding) zodat we het horen.
5. **Fouten melden.** *"…verzoeken u […] dit aan RIVM te melden via nevo@rivm.nl."* Een afwijking die de reproduceerbaarheidstest vindt, gaat dus ook als melding naar RIVM.

### Wat er nu is

- `scripts/nevo-extract.mjs` leest het bestand, valideert het en schrijft een reviewrapport (`STEEKPROEF_NEVO_IMPORT_2026-10.md`). Het patcht niets, zoals `usda-extract.mjs`. `--zoek=<term>` zoekt snel op wat NEVO voor een term heeft.
- **De reproduceerbaarheidstest uit de sectie "Het importpad" bestaat nu**: `scripts/__tests__/nevo-extract.test.mjs` legt elke `origin: "nevo"`-waarde in `food-sources.ts` tegen het bestand. Alle vijf bestaande NEVO-waarden (sojadrank, makreel, sardines, halvarine, rundvlees) kloppen exact. De test draait alleen waar het bestand lokaal ligt.
- **Het bestand is schoon.** 10.410 regels herhalen dezelfde stof onder een tweede stofgroep (eiwit staat onder "Energie en macronutriënten" én "Eiwitten") met identieke waarden; geen enkele dubbele regel wijkt af. 1.171 waarden zijn spoor (`TR`, waarde 0 als plaatshouder), 933 verrijkt (`+`). Een ontbrekende regel is iets anders dan een 0: dan heeft NEVO de stof niet gemeten.
- **Dekking:** 2.321 van 2.328 voedingsmiddelen hebben kcal, eiwit, vet, koolhydraten én vezels. De micro's zijn vrijwel overal gevuld (magnesium 2.238, zink 2.212, vitamine D 2.276, B12 2.289). Dat is veel beter dan supermarktetiketten, waar calcium bij ruim 1.000 van de 36.000 producten staat.

### Wat nog niet is gedaan

- **Niets is overgenomen.** De kandidaten in het rapport zijn voorstellen op naam; de beoordeling (rauw of bereid, soort, verrijking) is aan Dennis. Dat is de afspraak uit het USDA-traject en blijft gelden.
- **Het opslaan voor het dagboek** (een eigen tabel `nevo_foods`, apart van `sm_products`, omdat NEVO en Open Food Facts niet in één tabel horen: de ODbL eist dat die tabel alleen Open Food Facts-rijen bevat) en de dagboekintegratie zijn de volgende plak.
- **De 16 "verrijkt"-regels.** NEVO heeft er voor de meeste een tegenhanger, alleen onder een andere naam: plantaardige dranken staan als "Drink amandel-/haver-/kokos-/rijst-/soja- … verrijkt m calcium en vitamines", een proteïnereep als "Eiwitreep m pinda", ontbijtgranen als "Ontbijtproduct Cornflakes Kellogg's", en yoghurtalternatieven als "Plantaardig alternatief voor yoghurt obv soja …". Alleen voor de eiwitshake is geen tegenhanger gevonden. Het rapport toont de kandidaten per regel. Of een NEVO-product dat een merk noemt (Kellogg's) past bij een generieke regel als "Ontbijtgranen, verrijkt", is een oordeel per regel: de regel zegt zelf dat verrijking een merkkeuze is.

**Over de kandidaten in het rapport:** de naammatching is een zoekhulp met bekende missers, geen mapping. Bijvoorbeeld "Sojayoghurt" toont als eerste een soja-room en het juiste product ("Plantaardig alternatief voor yoghurt obv soja …") onder "Ook", en "Ontbijtgranen, verrijkt" krijgt geen kandidaat. Gebruik `node scripts/nevo-extract.mjs --zoek=<term>` om een term zelf op te zoeken.

### Tweede ronde, 3 oktober 2026: 73 rijen op NEVO gezet

Dennis keurde de aanpak goed ("zoveel mogelijk NEVO aanhouden"). De beslissingen staan in `BESLISSINGEN_NEVO_KERNSTOFFEN_2026-10.json`, het script `scripts/nevo-toepassen.mjs` past ze toe, en `STEEKPROEF_NEVO_TOEPASSING_2026-10.md` laat per rij zien wat er veranderde.

**De regel:** NEVO wint bij hetzelfde voedingsmiddel en dezelfde bereiding, tot een verschil van 50% met de huidige waarde. Daarboven legt Dennis voor. Tot die keuze staat zo'n rij op USDA.

- **73 rijen omgezet** (eiwit, magnesium, vitamine D en zink), waarvan 71 al geverifieerd waren op USDA en 2 voorheen leeg (seitan en vitamine D bij zalm). Nu zijn 106 rijen geverifieerd (was 104) en 78 daarvan komen uit NEVO. De reproduceerbaarheidstest bevestigt alle 78 exact.
- **12 rijen voorgelegd:** Griekse yoghurt, tahin, snijbiet, diepvriesspinazie, tuinbonen (magnesium), forel (vitamine D), oesters, lamsvlees, kalfsvlees, feta (zink), en haring en leverpastei voor vitamine D. Bij elk staat mijn advies.
- **Omega-3 blijft op USDA.** NEVO geeft EPA en DHA los; onze waarde is hun som, en dat is volgens de RIVM-voorwaarden een bewerking van de brondata. Omega-3 kan pas naar NEVO als het datamodel twee brondwaarden per rij kan dragen.
- **15 rijen blijven zoals ze zijn** omdat NEVO ze niet kent of een andere bereiding heeft (kikkererwten alleen als geroosterde snack, edamame, spliterwten alleen gedroogd, boerenkool alleen als stamppot, e.a.).

**Twee bevindingen**

1. **Haring en vitamine D.** `ONDERZOEK_SPREIDING_EN_USDA_2026-09.md` §2.8 noemt "NEVO ~25 µg" voor haring. Dat staat niet in NEVO 2025/9.0: alle vier de haringrijen geven 6,2 µg, in lijn met NEVO's andere vette vis (makreel 8, gekweekte zalm 7,9). De literatuurwaarde van 25 µg die er nu staat, is dus waarschijnlijk niet uit NEVO afkomstig. Daarom staat haring bij de voorgelegde rijen.
2. **NEVO geeft geen spreiding.** USDA-rijen konden een gemeten `observed`-bandbreedte dragen; NEVO publiceert die niet. Voor de omgezette rijen valt het tekortsysteem daardoor terug op de voorzichtiger klassenband, en `gedekt` wordt dus iets minder snel `true`. Dat past bij de asymmetrie-regel (een ondergrens bewijst "gehaald", nooit "niet gehaald"), maar het is merkbaar: de test "300 g havermout haalt de magnesium-RI" moest naar 500 g, omdat havermout nu op 120 mg per 100 g staat (was 126 mg) zonder spreiding.

- **Bijgewerkt later op 3 okt:** de 12 voorgelegde rijen zijn beslist: 10 gingen naar NEVO (nu 83 omgezet), snijbiet en feta bleven op USDA.

---

## Aanvulling 3 oktober 2026 (avond) — `nevo_foods`, en de koppeling met de catalogus

Besluit van Dennis: NEVO verrijkt én vult aan. Eigen tabel, niet `sm_products` (dat blijft alleen Open Food Facts; zie `ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md` §7).

- **Tabel `nevo_foods`** (migratie `20261003120000_nevo_foods.sql`): alle 2.328 voedingsmiddelen, 16 stoffen (kcal, eiwit, vet, verzadigd, koolhydraten, suikers, vezels, natrium, kalium, calcium, magnesium, ijzer, zink, vitamine D, B12, C), ongewijzigd in NEVO's eenheid, `nevo_versie` per rij. `TR` (spoor) wordt `null` met de kolom in `spoor`, want de 0 in het bestand is een plaatshouder; `+` staat in `verrijkt`. **Geen omega-3-kolommen**: EPA+DHA is een bewerking.
- **Loader** `scripts/nevo-laden.mjs`: droogloop standaard, `--schrijf` laadt. Weigert een stof waarvan de eenheid afwijkt, in plaats van stil om te rekenen. Een nieuwe NEVO-versie is dezelfde import opnieuw.
- **Lookup/zoek** `src/lib/nevo-foods.ts`; het dagboek bereikt beide bronnen via `src/lib/dagboek-producten.ts` (zoeken: NEVO eerst, daarna Open Food Facts, max. 20 samen; ophalen op `prod_id`-voorvoegsel `nevo:`/`off:`). Een bron die faalt maakt de andere niet onbruikbaar. Een dagboeklog verwijst via `nevo:<code>` en bewaart nooit een waarde (zelfde regel als `sm_products`).
- **Bronvermelding** `src/lib/nevo-bron.ts`: `NEVO_CITATION` voor ruwe waarden, `NEVO_BEREKEND_CITATION` (en de "en andere gegevens"-variant) voor berekende uitvoer.
- **Koppeling catalogus** `scripts/nevo-koppel.mjs` → `src/data/nutrition/food-catalog-nevo.ts` (alleen de zekere koppelingen; een code, nooit een waarde) + `STEEKPROEF_NEVO_KOPPELING_2026-10.md` met wat Dennis moet beoordelen. Zeker = de catalogusregel wijst naar een FOOD_SOURCES-rij die al uit NEVO komt, of één sterke naamkandidaat (score ≥ 1,0, hooguit één extra woord in de NEVO-naam, marge ≥ 0,15, bereiding niet in strijd, niet `samengesteld`/`verrijkt`). De eerste versie van de regel (score ≥ 0,9) koppelde "Zuurkool" aan "Sap zuurkool-", "Zuurdesembrood" aan een glutenvrij brood en "Snoep" aan één snoepje; vandaar de strengere regel.
- **Gratis voor de gebruiker blijft gelden**: de route en alles wat erop leunt komt nooit achter de premium-grens.
- **Dagboekintegratie (gebouwd)**: `SupermarktBron = "off" | "nevo"` is de gedeelde weergavevorm in het geheugen; `nevoFoodNaarSupermarktProduct` mapt ongewijzigd (`saltG` blijft `null`: zout uit natrium rekenen is een bewerking; `snapshotDatum` draagt de NEVO-versie). `SupermarktBronRegel` toont bij weergegeven waarden `NEVO_CITATION`, bij berekende uitvoer (portiescherm, dagtotaal, ring, weektabel) de "Gebaseerd op gegevens van…"-tekst, met " en andere gegevens" zodra de lijst ook Open Food Facts bevat. Het bestaande portie-event draagt nu `bron` (`off`/`nevo`).
- **Gratis voor de gebruiker**: het dagboek met NEVO-waarden zit niet achter premium; houd dat zo bij elke wijziging aan de entitlements.
- **Nog niet gedaan**: de "Bronnen en licenties"-pagina, en de loader draaien (wacht op de migratie).

- **Koppeling afgewerkt (3 okt, avond):** Dennis vroeg terecht waarom hij 159 regels zelf zou doornemen. Claude heeft ze beslist met NEVO-zoekopdrachten erbij: `scripts/nevo-koppel-beslissingen.json` (150 `handmatig`, 100 `bewustNiet` met reden; vlees/vis/groente zonder bereiding in het label krijgen de rauwe variant). Resultaat: 270 gekoppeld (71 via bron, 49 via naam, 150 handmatig), 100 bewust niet (niet in NEVO, te generiek, of verrijkt/merk waar het etiket de bron is), 1 open (kapucijners: gekookt, gedroogd of blik). De handmatige en bewuste keuzes staan ter steekproef in `STEEKPROEF_NEVO_KOPPELING_2026-10.md`.
