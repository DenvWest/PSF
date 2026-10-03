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
