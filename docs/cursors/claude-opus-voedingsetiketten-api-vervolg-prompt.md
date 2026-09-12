# Vervolgprompt — de API-run en de supermarktlaag

**Voor:** een verse sessie op `claude/voedingsdagboek-kompas-po1nua` (of een nieuwe branch daarvan).
**Model:** Opus 5. Taak 1 en 3 zijn oordeelswerk, en een verkeerd toegekende match
levert een getal op dat er precies zo uitziet als een goede.
**Voorafgaand:** zes commits van 10 september 2026, `091bf7e` t/m `5393863`.

---

## Waar de vorige sessie eindigde

De FDC-API bleef geblokkeerd (403 op CONNECT, voor `curl` én WebFetch), dus de
import liep via WebSearch. Dat leverde de per-100 g-waarde en de fdcId op, maar
**niet** de gestructureerde `min`/`max`/`median`/`dataPoints`.

| | 9 sep | 10 sep |
|---|---|---|
| Catalogusregels met een bron | 61 | **92** van 371 |
| Bronrijen totaal | 78 | **119** |
| Geverifieerd | 44 | **85** |
| Waarvan uit USDA | 0 | **41** |
| Met `observed` | 0 | **0** ← dit is de kern van taak 1 |

Wat er wél staat, en waar je op voortbouwt:

- `src/lib/nutrition-spread.ts` — observed wint van de klassenband, `basis` zegt
  welke van de twee het werd. **De code wacht alleen nog op data.**
- `src/lib/nutrition-nutrient-index.ts` — de omgekeerde index (nutriënt →
  producten), gerangschikt op de ónderkant van de band per portie.
- Het schap (S1) in `voortgang-voedingslogboek-...-prebuild-v1-2026-09.html`
  draagt die lijst, met filter op zoekcategorie.
- 51 tests bewaken de invarianten, waaronder de drie-plekken-regel voor events.

---

## Lees eerst, in deze volgorde

1. `docs/plan/ONDERZOEK_SPREIDING_EN_USDA_2026-09.md` — **§2.5 is het hart van
   taak 2** (supermarktproduct = verwijzing, geen eigen gehalterij), §2.7 zegt
   wat de WebSearch-route wel en niet kon.
2. `docs/design/BESLUIT_VOEDINGSDAGBOEK_KOMPAS_V1_2026-09.md` §5 en §8 — de
   omkering van de tabel en de bouwvolgorde (plak A draagt alles).
3. `src/lib/nutrition-spread.ts` — lees de moduledoc echt; hij legt uit waarom
   `observed` wint en waarom één monster geen spreiding is.
4. `src/lib/nutrition-nutrient-index.ts` — de vier randvoorwaarden staan in de
   moduledoc, niet in een afspraak.
5. `scripts/usda-extract.mjs` — de nutriëntnummers zijn geverifieerd; de
   `ZOEK`-lijst is dat niet (zie taak 1).

---

## De invarianten — vier bestaande, en waar ze nu schuren

**A. DERTIEN VOEDSELGROEPEN, VAST.** `groep` is de analyse-as. Een
supermarktproduct introduceert **nooit** een groep: het erft die van zijn
`foodKey`. Zou een merkproduct zijn eigen groep dragen, dan is elke eerder
geregistreerde dag onvergelijkbaar.

**B. NOOIT EEN VERZONNEN GETAL.** Nieuw scherp randje: een etiketwaarde is pas
een waarde als je hem gelézen hebt. `ref` draagt merk + jaar. Geen etiket
gezien, geen getal — en een "typische" waarde voor een productcategorie is een
verzonnen getal met een nette jas aan.

**C. DE ONDERGRENS-REGEL.** Ongewijzigd. Nieuw randje: het getal onder een
merkproduct is het gehalte van het **voedingsmiddel**, niet van het merk. De
copyregel uit §2.5 staat vast:

> **Amandelen** · 25 g — magnesium 39–110 mg
> *Gehalte van amandelen (USDA), niet van dit merk gemeten.*

En niet "AH Amandelen: 65 mg magnesium". Dat leest als een meting aan dat
product, is dat niet, en zou een samenstellingsuitspraak over een merk zijn die
wij niet hebben gedaan.

**D. DE POORT BLIJFT DICHT WAAR HIJ DICHT IS.** `resolveNutritionGate` hangt aan
de check en de ladderstatus. Nieuw en belangrijk: **merknamen zijn er om te
vínden, nooit om te rangschikken of naar te linken.** Een productcatalogus met
merken staat één stap van een winkel af, en die stap zetten we hier niet.
Affiliate-links horen op de vergelijkingspagina's, niet in het dagboek — dat
staat al in CLAUDE.md en het gaat nu pas echt knellen.

---

## TAAK 1 — De API-run, en een eerlijke audit van wat er staat

**Test eerst, en meld het voordat je verder gaat:**

```
curl -sS --max-time 20 "https://api.nal.usda.gov/fdc/v1/foods/search?query=almonds&api_key=DEMO_KEY"
```

Werkt het niet, dan is het nog steeds beleid en niet iets om omheen te werken:
meld het, en vraag Dennis het script lokaal te draaien en `scripts/out/usda-rapport.json`
aan te leveren. De rest van deze taak werkt daar net zo goed op.

Werkt het wél, dan in deze volgorde:

1. **Herzie de `ZOEK`-lijst in het script.** Hij staat hardgecodeerd op ~54
   rijen uit een tijd dat de catalogus 61 gevulde regels had. Genereer hem uit
   `zonderBron()` plus de al gevulde rijen, zodat de run de hele catalogus dekt
   in plaats van een momentopname ervan.

2. **Vul `observed`.** Dit is de kern. Nul van de 119 bronrijen draagt hem,
   terwijl `nutrition-spread.ts` hem al laat winnen. Elke rij die er een krijgt,
   ruilt een klassenband van ×0,60–1,70 in voor de spreiding van echte monsters.
   Bij plantaardige mineralen scheelt dat het meest — daar is de vuistregel het
   grofst.

3. **Audit de 41 WebSearch-rijen.** Leg elke `usda(fdcId, …)` naast het echte
   record: klopt de waarde bij dat id, en is het datatype wat er staat? Een
   mismatch is een vondst, geen verlegenheid — het is precies waarom de vorige
   sessie SR Legacy verkoos en bij twijfel afwees. Wat niet klopt, corrigeer je;
   wat je niet kunt bevestigen, zet je terug op `verified: false`.

4. **Haal de afgewezen rijen alsnog op.** Ze staan met reden in §2.7:
   boerenkool (Foundation 25 vs SR 47 mg), pijnboompitten (pinyon vs dried),
   amarant/gierst/teff (cooked-fdcId, of droog/gekookt-portiemismatch), vette
   vis buiten forel (EPA/DHA en vitamine D), rauw-gewicht zink voor rood vlees,
   en de smeersels (met/zonder zout en de commodity-variant lopen uiteen). Het
   FDC-record beslecht al die twijfels in één keer.

**Let op bij vis:** USDA splitst 20:5 n-3 en 22:6 n-3 als aparte velden en het
script telt ze op. Dat is de reden dat USDA hier vóór NEVO gaat. Wild en
gekweekt blijven aparte rijen — een gemiddelde daarvan beschrijft geen enkele vis.

---

## TAAK 2 — De supermarktlaag: een product wijst, het draagt niet

Dit is §2.5 van het onderzoek, ontworpen en niet gebouwd. Het is de enige manier
waarop de catalogus naar honderden producten kan groeien zonder onderzoek per
product.

### De vorm

```ts
// src/data/nutrition/food-products.ts
export interface Product {
  key: string;                 // "ah-amandelen-ongezouten"
  labelNl: string;             // "Amandelen ongezouten"
  merk?: string;               // "AH" — alleen om te vinden, nooit om te rekenen
  /** Waar de gehaltes vandaan komen. Het product heeft er zelf geen. */
  foodKey: string;             // verwijst naar een CatalogEntry.key
  /** Wat de verpakking wél zelf weet: een portie die je herkent. */
  porties: readonly { labelNl: string; grams: number }[];
  /** Alleen bij verrijkte producten: dan wint het etiket van foodKey. */
  etiket?: Partial<Record<NutrientId, { per100g: number; bron: string; jaar: number }>>;
}
```

Een `Product` heeft **geen `nutrients`-veld**. Drie gevolgen, alle drie gunstig:
een nieuw product is één regel; een verbeterd gehalte verbetert alle merken
tegelijk; en de portie is de echte winst van het merk — "een zakje" of "een
handvol" is precies wat het generieke voedingsmiddel niet weet.

### De grens die je moet kennen vóór je begint

**Een etiket draagt wettelijk alleen energie, vet, verzadigd vet, koolhydraten,
suikers, eiwit en zout** (EU 1169/2011). Magnesium, zink en vitamine D staan er
alleen op als het product verrijkt is of er een claim over voert — dán is
vermelding verplicht.

Dat is geen tegenvaller maar de reden dat de etiketroute bestaat en waarom hij
smal is:

- **Eiwit** komt van vrijwel elk etiket → dit verbreedt de eiwitroute echt.
- **Vitamine D, magnesium, zink** komen alleen van verrijkte producten.
- **Omega-3** alleen bij een claim.

Precies dit diskwalificeerde de Branded-tak van USDA (§2.4) en OpenFoodFacts.
Verwacht dus geen micronutriënten uit merkproducten, en bouw de UI daar niet op.

### Wanneer het merk wél de samenstelling bepaalt

Vier gevallen, uit §2.5 — alleen hier hoort een `etiket`:

| Geval | Wat dan |
|---|---|
| Verrijkte producten | etiket per merk |
| Samengestelde producten | als gerecht opnemen, uit componenten |
| Producten met een samenstellingsclaim ("extra eiwit") | etiket |
| Bewerkingsgraad ís de identiteit (volkoren vs wit) | apart voedingsmiddel, geen merkvariant |

### Wat er als eerste in moet

De rijen die nu leegstaan omdat ze op het etiket wachten, niet op USDA:

- margarine en halvarine — 7,5 µg vitamine D per 100 g (NL-kader; 25 µg voor
  ouderenvarianten)
- halfvolle en magere melk — 1,5 µg per 100 ml, verplicht sinds 2021
- plantaardige dranken — per merk, en biologisch is vaak níét verrijkt
- verrijkte ontbijtgranen — per merk
- eiwitshakes en proteïnerepen — per merk

Deze vijf zijn geen USDA-werk en zullen dat nooit worden: het Amerikaanse
verrijkingsniveau is een ánder getal, en overnemen bouwt een fout van tientallen
procenten in die achteraf onzichtbaar is.

### Houdbaarheid

Een recept verandert, een verrijkingsniveau verandert per batch. Draag daarom
`jaar` op elke etiketwaarde, en leg als test vast wat er gebeurt als hij oud
wordt — een etiket uit 2021 mag geen stille waarheid blijven.

---

## TAAK 3 — Sorteer de 279 lege regels eerlijk

`bron: null` betekent nu twee heel verschillende dingen door elkaar: *"nog niet
opgehaald"* en *"krijgt er nooit een"*. Daardoor leest de catalogus als een
achterstand van 279 terwijl het grootste deel gewoon af is.

Voorstel — beslis er zelf over, maar beslis bewust:

```ts
/** Waarom deze regel geen gehalterij heeft. Null = wél op te halen. */
geenBron?: "samengesteld" | "verrijkt" | "verwaarloosbaar";
```

- **samengesteld** — pizza, lasagne, soepen, stamppot. Gehaltes komen uit
  componenten; dit wacht op `dishes.ts` (plak A), niet op een tabel.
- **verrijkt** — wacht op het etiket, niet op USDA. Taak 2 dus.
- **verwaarloosbaar** — water, koffie, thee, frisdrank, snoep, de meeste sauzen
  en het meeste fruit. Voor déze vijf stoffen dragen ze niets, en dat is een
  eigenschap van het product, geen gat in ons werk.

Dan zegt `zonderBron()` eindelijk wat hij belooft: de werklijst, en niets anders.
Zet er een test op die afdwingt dat een regel met `geenBron` ook echt `bron:
null` heeft, en andersom dat de werklijst krimpt in plaats van te verschuiven.

---

## TAAK 4 — Breedte, gestuurd door wat mensen echt loggen

Pas ná taak 2 en 3, want anders moet elke rij die je nu toevoegt straks alsnog om.

De maat waarop je prioriteert bestaat al: **`nutrition.dagboek_item_added`,
gegroepeerd op `key`.** Dat is letterlijk de lijst die zegt welke producten er
als volgende bij moeten — niet een aanname over wat mensen eten, maar wat ze
invoerden. Hetzelfde geldt voor `nutrition.schap_bron_clicked`: welke bronnen
mensen aanklikken zegt welke rijen een geverifieerd gehalte verdienen.

Doel is niet "alle supermarktproducten". Doel is dat iemand die zijn dag invult
niet vastloopt op een product dat er niet in staat. Meet dat, in plaats van het
te schatten.

---

## WERKWIJZE

- **Klaar-check vóór elke commit, volledig:**
  ```
  grep -rn "console.log" src/    (moet 0 zijn)
  npx tsc --noEmit
  npx vitest run
  npx eslint --max-warnings 0
  ```
  Faalt er iets: niet committen, eerst melden en fixen. Draait `node_modules`
  niet: `npm ci` werkt in deze omgeving.

- **Committen en pushen** naar de branch. Laat werk niet ongepusht staan.

- **Nieuwe invarianten leg je vast als test, niet als comment.** De bestaande
  suite is het voorbeeld: `food-catalog.test.ts` ving 23 varianten die zonder
  verantwoording waren toegevoegd, en `client-event-registration.test.ts` ving
  een event dat stil werd geweigerd.

- **Rapporteer per blok** welke matches je aannam, welke je afwees en waarom.
  Een afgewezen match is een goed resultaat.

- **Meld bij elke afronding het meetpunt:** "Meetpunt: <event(s)> — hier lees je
  het effect af."

- Antwoord in het Nederlands, code en variabelen in het Engels.
