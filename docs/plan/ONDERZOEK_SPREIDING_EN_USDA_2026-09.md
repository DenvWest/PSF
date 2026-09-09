# Onderzoek: spreidingsmarges en USDA als primaire bron

**Datum:** 9 september 2026
**Status:** etappe 1 afgerond (spreiding), etappe 2 ontworpen maar niet uitgevoerd (USDA-extractie), etappe 3 = overdracht
**Aanleiding:** de twee blokkades onder `BESLUIT_VOEDINGSDAGBOEK_KOMPAS_V1_2026-09.md` §5 — de spreidingsmarges hadden geen bron, en 34 van de 78 rijen wachtten op een NEVO-import die een handmatig akkoord met RIVM vereist.
**Vraag van de opdrachtgever:** kan USDA die rol overnemen, zodat de RIVM-route vervalt?

---

## 0 · De vier uitkomsten die het ontwerp veranderen

1. **USDA publiceert de spreiding zelf.** De tabel `food_nutrient` draagt per voedingsmiddel per nutriënt `min`, `max`, `median`, `standard_error` en `data_points`. De ±10/25/40 %-vuistregel hoeft niet onderbouwd te worden — hij hoort **vervangen** te worden door de waargenomen spreiding uit de bron.
2. **De vuistregel was op twee plekken fout, in tegengestelde richting.** Voor plantaardige mineralen is ±25 % veel te smal (de literatuur laat 2–6× verschil zien tussen cultivars). Voor verrijkte producten is ±10 % te ruim (het niveau ligt wettelijk vast).
3. **Mineralen reizen tussen landen, vitamines niet.** Tussen Europese voedingstabellen verschillen mineralen nauwelijks, terwijl vitamines sterk verschillen. Dat maakt USDA bruikbaar voor magnesium en zink, en onbruikbaar voor vitamine D.
4. **De databasekeuze is zelf een spreidingsbron.** Dezelfde voeding levert 20–45 % verschil in berekende inname afhankelijk van welke tabel je gebruikt. Dat is dezelfde orde als de biologische variatie — en het is precies waarom het ontwerp een band toont en geen punt.

---

## Etappe 1 · De spreidingsmarges

### 1.1 · Wat er nu staat, en waarom het moest wijken

De prebuilds rekenden met een vaste opslag per `variability`-klasse:

```
low: ±10 %   moderate: ±25 %   high: ±40 %
```

Drie getallen zonder bron. Ze stonden er omdat een puntwaarde bij wilde versus gekweekte vis liegt, en een te ruime band minder erg is dan een te precies punt. Het onderzoek laat zien dat ze op twee plekken de verkeerde kant op wijzen.

### 1.2 · Vitamine D in vis — de vuistregel is factor 2 tot 5 te smal

| Bron | Vitamine D3 (µg/100 g) |
|---|---|
| Gekweekte zalm, meerdere studies | **2,3 – 9,5** |
| Wilde zalm, Noordzee | 9,4 ± 1,9 |
| Wilde zalm, Oostzee | 18,5 ± 4,6 |
| Reviewgemiddelde over 109 monsters | 5,8 – 7,6 |

Bron: Jakobsen & Smith, *Vitamin D in Wild and Farmed Atlantic Salmon — What Do We Know?*, Nutrients 2019 ([review](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6566758/), [DTU](https://orbit.dtu.dk/en/publications/vitamin-d-in-wild-and-farmed-atlantic-salmon-salmo-salar-what-do-/)). De oudere en veel geciteerde bevinding van Lu & Holick (gekweekt ≈ 200 IE, wild 800–900 IE per 100 g) wijst dezelfde kant op maar overdrijft het verschil ten opzichte van de latere synthese.

**Wat dit betekent.** De totale spreiding over "zalm" is ongeveer **2,3 tot 23 µg/100 g — een factor 10**. Onze prebuild rekende met 9,6 µg/100 g voor gekweekte zalm en ±40 %, dus een band van 5,8–13,4. Die band ligt zowel te hoog als te smal: gekweekte zalm haalt de bovenkant vrijwel nooit en zit vaak onder de onderkant.

**Belangrijker: het onderscheid dat telt is niet een percentage maar een categorie.** Wild versus gekweekt, en bij wild de vangstlocatie, verklaren het grootste deel. Een spreidingsopslag over één rij "zalm" verhult precies de informatie die de gebruiker nodig heeft.

### 1.3 · EPA/DHA in gekweekte zalm — stabiel sinds 2011, maar niet op de waarde die wij gebruikten

Noorse gekweekte zalm, 2005–2020: het EPA+DHA-gehalte daalde scherp tussen 2005 en 2011 door de vervanging van visolie door plantaardige olie in het voer, en ligt sindsdien stabiel op een **mediaan van 1,03–1,30 g/100 g** ([Food Chemistry 2022](https://www.sciencedirect.com/science/article/pii/S0308814621024511); de scherpe daling ook in [Sprague et al., Scientific Reports 2016](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4761991/)).

Onze prebuild rekende met 1.440 mg/100 g — boven de waargenomen mediaanband. Correctie nodig.

**Bijvangst die het ontwerp raakt:** dit gehalte is *jaargebonden*. Een tabelwaarde uit 2008 is voor gekweekte zalm feitelijk onjuist geworden. Elke rij die uit een vetzuurtabel komt hoort daarom een editie-jaar te dragen — dat doet `nutrientValue.source.edition` al.

### 1.4 · Mineralen in planten — ±25 % is veel te smal

| Gewas | Nutriënt | Waargenomen spreiding | Factor |
|---|---|---|---|
| Broodtarwe | magnesium | 600 – 1.400 ppm (modern materiaal) | 2,3× |
| Maïs | zink | 10,7 – 57,8 mg/kg | 5,4× |
| Sorghum | zink | 10,2 – 58,7 mg/kg | 5,7× |
| Kool (cultivars) | zink | — | 2,4× |
| Kool (cultivars) | ijzer | — | 6× |

Bronnen: [Europ. J. Agronomy (tarwe)](https://www.sciencedirect.com/science/article/abs/pii/S1161030106000499), [maïs](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9861485/), [sorghum](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5418227/), [kool](https://www.tandfonline.com/doi/full/10.1080/01904160903391115).

±25 % komt neer op een totale spreiding van 1,67×. De literatuur laat 2,3× tot 5,7× zien. **De vuistregel onderschat de werkelijke spreiding bij plantaardige mineralen met een factor 1,5 tot 3.**

### 1.5 · Verrijkte producten — ±10 % is juist te ruim

In Nederland is de verrijking wettelijk geregeld:

| Product | Vitamine D | Bron |
|---|---|---|
| Margarine en halvarine | **7,5 µg/100 g** | [Voedingscentrum](https://www.voedingscentrum.nl/encyclopedie/vitamine-d.aspx) |
| Margarine/halvarine voor ouderen | 25 µg/100 g (toegestaan) | idem |
| Halfvolle en magere melk (verplicht sinds 2021) | 1,5 µg/100 ml | idem |
| Algemeen maximum bij verrijking | 4,5 µg/100 kcal | [RIVM](https://www.rivm.nl/bibliotheek/rapporten/050421001.pdf) |

Een verrijkt product is een **fabrikantkeuze binnen een wettelijk kader**, geen biologische variatie. De spreiding is de productietolerantie, niet de bodemgesteldheid. Dit is meteen de scherpste grens van de USDA-route: het Amerikaanse verrijkingsniveau is een ander getal, en overnemen zou hier een fout van tientallen procenten inbouwen.

### 1.6 · Eiwit — de vuistregel klopt hier wel

Twee onafhankelijke lijnen bevestigen ±10 %:

- Eiwit is structureel weefsel, geen opnameafhankelijk sporenelement (de bestaande redenering in `SPEC_VOEDINGSBRONNEN_TABEL_V2.md` §2.1).
- Tussen Europese voedingstabellen zijn **macronutriënten consistent** — eiwit in ei en gevogelte verschilt slechts enkele grammen — terwijl micronutriënten fors uiteenlopen ([EuroFIR / Frontiers in Nutrition 2025](https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1552367/full)).

### 1.7 · De vervangende spreidingstabel

Vaste percentages per `variability`-klasse vervallen. In de plaats komt een factorband per **(stof × voedselklasse)**, elk met een bron. De eenheid is een vermenigvuldiger op de tabelwaarde, niet een percentage — dat maakt asymmetrische spreiding uitdrukbaar, en die is bij vis de regel.

| Stof | Voedselklasse | Band | Grond |
|---|---|---|---|
| Eiwit | dierlijk (vlees, vis, ei, zuivel) | ×0,90 – 1,10 | structureel weefsel; macronutriënten consistent tussen tabellen |
| Eiwit | plantaardig | ×0,85 – 1,15 | idem, iets ruimer voor cultivarverschil |
| Magnesium, zink | dierlijk | ×0,85 – 1,15 | geen bodem-/cultivarroute |
| Magnesium, zink | **plantaardig** | **×0,60 – 1,70** | cultivar en bodem; waargenomen 2,3–5,7× totale spreiding |
| EPA/DHA | vette vis, gekweekt | ×0,75 – 1,25 | mediaan stabiel 1,03–1,30 g/100 g sinds 2011 |
| EPA/DHA | vette vis, wild | ×0,60 – 1,50 | soort- en seizoensafhankelijk |
| Vitamine D | vis, gekweekt | ×0,40 – 1,60 | 2,3–9,5 µg/100 g over studies |
| Vitamine D | vis, wild | ×0,50 – 2,00 | 9,4 (Noordzee) tot 18,5 (Oostzee) µg/100 g |
| Vitamine D | **verrijkt product** | **×0,95 – 1,05** | wettelijk vastgelegd niveau; productietolerantie |
| Vitamine D | ei, vlees, paddenstoel | ×0,60 – 1,60 | voer- en UV-afhankelijk |

**Deze tabel is een tussenstap, geen eindstand.** Zodra een rij een USDA-`min`/`max` heeft, wint die: de waargenomen spreiding van de werkelijke monsters slaat elke klasse-vuistregel. De tabel dekt de rijen waar USDA maar één monster had (`data_points = 1`, dan zijn `min` en `max` leeg).

### 1.8 · Opname: van een vinkje naar een getal

Het huidige model kent `bioavailability: "reduced"` — een binair vlaggetje dat in de UI een ◆ oplevert. De literatuur draagt een preciezer antwoord, en het is een **maaltijdeigenschap**, geen producteigenschap.

**Zink** — de fytaat:zink molverhouding van de hele maaltijd bepaalt de opname:

| Fytaat:zink | Opname | Type voeding |
|---|---|---|
| < 5 | 30 – 50 % | veel dierlijk eiwit, geraffineerde granen |
| 5 – 15 | 20 – 30 % | gemengd |
| > 15 | 10 – 15 % | ongeraffineerde granen en peulvruchten, weinig dierlijk |

IZiNCG hanteert twee klassen: gemengd/geraffineerd vegetarisch (ratio 4–18) → 31 % opname; ongeraffineerd graangebaseerd (> 18) → 23 %. Een meta-analyse vond dat maaltijden met ratio > 15 de fractionele zinkopname bijna halveerden (−45 %) ten opzichte van < 15.

**Magnesium** — opname ligt normaal rond **40–60 %**, en fytaat remt dosisafhankelijk. Zuurdesem breekt fytaat af via de eigen fytase van tarwe, wat de opname uit volkorenbrood meetbaar verhoogt.

**Wat dit voor het ontwerp betekent.** De fytaat:zink-ratio is over een *maaltijd* te berekenen, niet over een los product. Dat sluit precies aan op de vorm die er al is: het gerecht en de dag zijn de plekken waar die ratio betekenis heeft. Het ◆ per productregel kan blijven als signaal, maar de uitspraak hoort op gerecht- en dagniveau: *"deze maaltijd heeft een fytaat:zink-verhouding boven 15 — reken op ongeveer de helft van de opname van een vleesmaaltijd."*

**Eén eerlijkheidsnoot:** het bewijs is niet unaniem. Bij zuigelingen en jonge kinderen bleek zinkopname in gepoolde data *niet* gerelateerd aan fytaatinname ([J Nutr / PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4516773/)). Voor de doelgroep (mannen 40+) is de volwassenenliteratuur leidend, maar de claim hoort "naar schatting" te heten en geen vast getal te worden.

---

## Etappe 2 · USDA als primaire bron

### 2.1 · Het antwoord: ja voor drie stoffen, met één harde uitzondering

USDA FoodData Central is **public domain** — geen licentie, geen akkoord, geen bronvermeldingsplicht in de juridische zin (attributie blijft wel netjes). Dat haalt de hele RIVM-route weg. Maar de geschiktheid verschilt sterk per stof.

| Stof | USDA → NL bruikbaar? | Waarom |
|---|---|---|
| **Eiwit** | ✅ ja | macronutriënten zijn consistent tussen nationale tabellen |
| **Magnesium** | ✅ ja | mineralen verschillen nauwelijks tussen Europese tabellen; bodem/cultivar domineert boven land |
| **Zink** | ✅ ja | idem |
| **EPA/DHA** | ✅ ja, mits soort én herkomst matchen | USDA splitst 20:5 n-3 en 22:6 n-3 als aparte velden; NEVO doet dat vaak niet. Dit was al de bestaande keuze. Wild/gekweekt en voerjaar wegen zwaarder dan het land van de tabel |
| **Vitamine D** | ⚠️ **alleen voor onverrijkte producten** | vitamines lopen sterk uiteen tussen tabellen, en verrijking is nationaal geregeld |

De onderbouwing van de middelste kolom staat in twee bevindingen die elkaar aanvullen:

- Berekende inname uit dezelfde voeding verschilt **20–45 %** afhankelijk van de gebruikte database, met de grootste verschillen bij micronutriënten ([Frontiers in Nutrition 2025](https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1552367/full)).
- Maar bij verse groente en fruit specifiek: **"de mineraalsamenstelling verschilde niet tussen productgroepen en landen"**, terwijl vitamine A, C en folaat dat wél sterk deden — Duitsland structureel het hoogst, Nederland het laagst ([Journal of Food Composition and Analysis 2023](https://www.sciencedirect.com/science/article/pii/S0889157523000753)).

Samen: **mineralen reizen, vitamines niet.** Dat is de scheidslijn.

### 2.2 · De uitzonderingslijst — wat nooit uit USDA komt

| Product | Waarde | Bron |
|---|---|---|
| Margarine, halvarine | vitamine D 7,5 µg/100 g | NL-verrijkingskader |
| Halfvolle en magere melk | vitamine D 1,5 µg/100 ml | verplicht sinds 2021 |
| Plantaardige dranken | per merk van het etiket | verrijking is fabrikantkeuze binnen NL-kader |
| Ontbijtgranen, verrijkt | per merk van het etiket | idem |

Een etiketwaarde is een feit dat je mag citeren; daar zit geen licentievraag aan. Dit is dus geen terugkeer naar RIVM — het is de productverpakking als bron, met `source: { origin: "etiket", ref: "<merk + jaar>" }`.

### 2.3 · Wat de nieuwe herkomstlaag moet dragen

Het bestaande `SourceOrigin`-type kent `"nevo" | "usda" | "voedingscentrum" | "literatuur"`. Met deze koers wordt USDA de primaire waarde en verschuift de rest naar aanvulling. Twee velden komen erbij:

```ts
export interface NutrientValue {
  value: number;              // bestaat
  unit: "g" | "mg" | "µg";    // bestaat
  per: "100g";                // bestaat
  source: SourceRef;          // bestaat
  sourceNameNl?: string;      // bestaat

  /** Waargenomen spreiding uit de bron. Slaat de klassenband uit §1.7. */
  observed?: {
    min: number;
    max: number;
    median?: number;
    /** USDA `data_points`. 0 of 1 betekent: geen spreiding beschikbaar. */
    samples: number;
  };
}
```

`observed` invullen betekent dat een rij zijn eigen band draagt en de vuistregel niet meer nodig heeft. Dat is de eindstand; §1.7 is de brug ernaartoe.

### 2.4 · De supermarktproductenlijst

De opdracht is om te groeien naar producten en gerechten die mensen echt in huis hebben. Het onderzoek levert daar één harde constatering bij: **de FDC-datatypes verschillen sterk in bruikbaarheid.**

| FDC-datatype | Wat het is | Spreiding (`min`/`max`) | Bruikbaar voor ons |
|---|---|---|---|
| **Foundation Foods** | basisvoedingsmiddelen, lab-geanalyseerd, met monsteraantal, locatie, datum, cultivar | ✅ ja, dat is het hele punt van dit type | **Primair.** Dit is de bron voor onze generieke rijen |
| **SR Legacy** | de oude standaardreferentie | deels | Aanvulling waar Foundation een gat heeft |
| **Survey (FNDDS)** | samengestelde gerechten voor consumptieonderzoek | nee | Nuttig als **gerechtdefinities**, niet als gehaltebron |
| **Branded** | merkproducten van het etiket | nee — één waarde per product | Alleen macro's; micronutriënten ontbreken vrijwel altijd |

**Dat laatste is dezelfde beperking die OpenFoodFacts diskwalificeerde**, en hij geldt onverkort voor USDA's Branded-tak: een etiket vermeldt wettelijk alleen energie, vet, verzadigd vet, koolhydraten, suikers, eiwit en zout. Magnesium, zink en vitamine D staan er niet op.

**De conclusie voor de productuitbreiding:** merkproducten leveren geen micronutriënten, van geen enkele bron. De uitbreiding moet dus lopen via **generieke voedingsmiddelen uit Foundation Foods**, met merkproducten hooguit als zoekingang die naar het generieke voedingsmiddel wijst ("AH volkorenbrood" → `volkorenbrood`). Dat is ook wat de gebruiker in de praktijk zoekt.

### 2.5 · Supermarktproducten: een verwijzing, geen eigen rij

**Vraag:** als onderzoek een gehalte per voedingsmiddel geeft, mag je dat dan op een supermarktproduct plakken?

**Ja — en het is de enige manier waarop de productuitbreiding kan schalen.** Maar dan wel als *verwijzing*, niet als eigen gehalterij.

#### Waarom het mag

Voor een enkelvoudig product is het merk verpakking, geen samenstelling. "AH ongezouten amandelen" en "Jumbo amandelen" zijn allebei *amandelen*; het verschil tussen die twee is verwaarloosbaar naast het verschil tussen cultivars en groeigebieden — en dat laatste zit al in de band (§1.7: ×0,60–1,70 voor plantaardige mineralen).

Dat is het beslissende argument, en het volgt uit de keuze om banden te tonen in plaats van punten: **de band is al ruimer dan het merkverschil.** Wie een puntwaarde claimt, kan een merkproduct niet verantwoorden. Wie een band toont, kan het wel — het merkverschil valt er binnen.

Hetzelfde geldt voor bewerking waar mensen het tegendeel verwachten:

- **Geroosterde versus rauwe noten.** Mineralen zijn elementen; ze verdwijnen niet bij verhitting. Roosteren onttrekt water, wat het gehalte per 100 g licht *verhoogt* — enkele procenten, ruim binnen de band. (Gezouten noten voegen natrium toe, en dat is een andere vraag.)
- **Peulvruchten uit blik versus zelf gekookt.** Een deel van de mineralen loogt uit in het vocht. Reëel, maar bescheiden, en opnieuw binnen de band.

#### Wanneer het niet mag

Vier gevallen waarin het merk wél de samenstelling bepaalt:

| Geval | Waarom | Wat dan |
|---|---|---|
| **Verrijkte producten** | het gehalte ís een fabrikantkeuze (plantaardige drank, ontbijtgranen, margarine) | etiket is de bron, per merk |
| **Samengestelde producten** | een kant-en-klaarmaaltijd heeft een recept, geen voedingsmiddel-identiteit | als gerecht opnemen, uit componenten |
| **Producten met een samenstellingsclaim** | "extra eiwit", "vezelrijk" — dan wijkt het merk bewust af | etiket |
| **Producten waar de bewerkingsgraad de identiteit is** | volkoren versus wit brood zijn niet hetzelfde voedingsmiddel | apart voedingsmiddel, geen merkvariant |

#### De vorm

Een supermarktproduct krijgt dus **geen `nutrients`-veld**. Het wijst naar een voedingsmiddel en voegt toe wat het wél zelf weet: de verpakking en de portie.

```ts
export interface Product {
  key: string;                 // "ah-amandelen-ongezouten"
  labelNl: string;             // "Amandelen ongezouten"
  merk?: string;               // "AH" — alleen om te vinden, nooit om te rekenen
  /** Waar de gehaltes vandaan komen. Het product heeft er zelf geen. */
  foodKey: string;             // "amandelen"
  /** Wat de verpakking wél toevoegt: een portie die je herkent. */
  porties: readonly { labelNl: string; grams: number }[];  // "handvol (25 g)", "zakje (200 g)"
  /** Alleen bij verrijkte producten: dan wint het etiket van foodKey. */
  etiket?: Partial<Record<NutrientId, { per100g: number; bron: string }>>;
}
```

Drie consequenties, alle drie gunstig:

1. **Een nieuw product is één regel** — sleutel, label, `foodKey`, porties. Geen onderzoek per product. Dát is wat de uitbreiding naar honderden producten haalbaar maakt.
2. **Een verbeterd gehalte verbetert alle producten tegelijk.** Vervang de USDA-waarde voor `amandelen` en elk merk amandelen volgt.
3. **De portie is de echte winst van het merk.** "Een zakje" of "een handvol" is precies wat het generieke voedingsmiddel niet weet, en wat de invoer sneller maakt.

#### De copy-regel die erbij hoort

Het getal blijft van het voedingsmiddel, niet van het merk. Op het scherm dus:

> **Amandelen** · 25 g — magnesium 39–110 mg
> *Gehalte van amandelen (USDA), niet van dit merk gemeten.*

en niet "AH Amandelen: 65 mg magnesium". Dat laatste leest als een meting aan dat product, is dat niet, en zou bovendien een samenstellingsuitspraak over een merk zijn die wij niet hebben gedaan.

---

### 2.5 · Waarom etappe 2 hier stopt

De netwerkpolicy van deze omgeving blokkeert `api.nal.usda.gov` en `fdc.nal.usda.gov` (403 op CONNECT). De extractie kan hier niet draaien. Wat er wel ligt: het script (`scripts/usda-extract.mjs`), de productlijst en het verificatiepad. Zie etappe 3.

---

## Etappe 3 · Overdracht

### 3.1 · Wat er nog moet gebeuren

| # | Taak | Omvang | Blokkade |
|---|---|---|---|
| 1 | FDC-API-sleutel aanvragen (gratis, `api.data.gov`) | 2 minuten | — |
| 2 | `scripts/usda-extract.mjs` draaien over de productlijst | ~1 uur machinetijd | netwerktoegang |
| 3 | Per rij de match beoordelen: is dit hetzelfde voedingsmiddel? | **het echte werk** — ~80 rijen × oordeel | menselijk/modeloordeel |
| 4 | `observed` vullen met `min`/`max`/`samples` | volgt uit 2 | — |
| 5 | Verrijkte producten handmatig op NL-waarden zetten | ~6 rijen | — |
| 6 | `food-sources.ts` omkeren naar de product-eerst index (§5 van het besluit) | middel | — |
| 7 | Spreidingstabel §1.7 in de prebuilds vervangen door `observed` waar aanwezig | klein | 4 |

Stap 3 is de reden dat dit niet één script is. "Almonds, raw" uit Foundation Foods matcht op onze rij `amandelen`, maar "Bread, whole-wheat, commercially prepared" is *niet* hetzelfde als Nederlands volkorenbrood — andere uitmaalgraad, ander zoutgehalte, ander recept. Dat oordeel per rij is het werk.

### 3.2 · De prompt voor het vervolg

```
Werk `docs/plan/ONDERZOEK_SPREIDING_EN_USDA_2026-09.md` etappe 2 af.

Context: USDA FoodData Central wordt de primaire bron voor eiwit, magnesium,
zink en EPA/DHA. Vitamine D komt alleen uit USDA voor onverrijkte producten;
verrijkte producten volgen het NL-kader (zie §2.2). De spreidingstabel in §1.7
is een tussenstap — waar USDA `min`/`max` levert, wint die.

Doe per rij in `src/data/nutrition/food-sources.ts`:
1. Zoek de FDC-match, bij voorkeur in Foundation Foods, anders SR Legacy.
2. Beoordeel of het hetzelfde voedingsmiddel is. Nederlands volkorenbrood is
   niet gelijk aan "Bread, whole-wheat, commercially prepared". Bij twijfel:
   markeer als `verified: false` met een notitie, niet als match.
3. Vul `nutrientValue` met de waarde per 100 g, `fdcId` als `ref`, het
   FDC-datatype en de releaseversie als `edition`.
4. Vul `observed` met `min`, `max`, `median` en `data_points` als het
   FDC-record ze heeft. Ontbreken ze, laat `observed` weg — dan valt de rij
   terug op de klassenband uit §1.7.
5. Zet `verified: true` alleen bij een beoordeelde match.

Werk in blokken van 10 rijen en rapporteer per blok welke matches je afwees
en waarom. Verzin nooit een waarde: een rij zonder match blijft onverified.
```

### 3.3 · Welk model

| Werk | Model | Waarom |
|---|---|---|
| Stap 3 (matchbeoordeling), stap 6 (herstructurering), en dit soort onderzoek | **Claude Opus 5** (`claude-opus-5`) | Het werk is oordeelswerk, geen extractiewerk: herkennen dat een Amerikaans brood een ander product is, dat een verrijkt product buiten de regel valt, dat een spreiding uit één monster geen spreiding is. Dat is precies waar de fouten gemaakt worden, en ze zijn achteraf niet zichtbaar in de data. |
| Stap 2 en 4 (mechanisch ophalen en invullen, zodra de matchregels vastliggen) | Claude Sonnet 5 (`claude-sonnet-5`) | Goedkoper per token en ruim voldoende zodra het oordeel al gemaakt is |

Prijzen per miljoen tokens: Opus 5 $5 in / $25 uit; Sonnet 5 $2 in / $10 uit. Wil je de bulk automatiseren: de Batch API kost de helft en is voor dit soort niet-interactief werk de aangewezen route.

**Mijn advies: doe stap 3 niet goedkoper dan Opus 5.** Een verkeerd toegekende match levert een getal op dat er precies zo uitziet als een goede — het valt pas op als iemand het naslaat, en dat is nou juist wat je aan het automatiseren was.

---

## 4 · Wat dit voor de bestaande besluiten betekent

- **`BESLUIT_NEVO_BRONVERMELDING.md`** blijft geldig als beschrijving van de NEVO-route, maar die route is niet langer het hoofdpad. De structurele winst ervan — de scheiding tussen geciteerde brondwaarde (`nutrientValue`) en onze eigen portieberekening (`amount`) — blijft onverkort staan en is precies wat USDA-import ook nodig heeft.
- **`SPEC_VOEDINGSBRONNEN_TABEL_V2.md` §2.1** (de `variability`-klassen) wordt vervangen door §1.7 hierboven, en uiteindelijk door `observed` per rij.
- **De prebuilds** rekenden met ±10/25/40 %. Die zijn vervangen door de factorbanden uit §1.7.

## 5 · Wat ik niet zou doen

- **Merkproducten als micronutriëntbron gebruiken**, uit welke database dan ook. Het etiket draagt ze niet.
- **Vitamine D uit USDA overnemen voor verrijkte producten.** Dat is een fout van tientallen procenten, en hij is onzichtbaar.
- **De klassenband uit §1.7 als eindstand behandelen.** Hij bestaat om de rijen te dekken waar USDA één monster had.
- **Één getal tonen waar de bron een band heeft.** Bij zalm scheelt wild versus gekweekt een factor 4; een gemiddelde daarvan beschrijft geen enkele vis.
