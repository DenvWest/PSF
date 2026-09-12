# Vervolgprompt — voedingscatalogus afmaken en aan supplementen koppelen

**Voor:** een nieuwe Claude Code-sessie op `denvwest/psf`
**Aanbevolen model:** Claude Opus 5 (`claude-opus-5`), effort `high` of `xhigh`
**Branch:** `claude/voedingsdagboek-kompas-po1nua`
**Geschreven:** 10 september 2026, aan het eind van de sessie die de catalogus bouwde

---

## Hoe je deze prompt gebruikt

Plak het blok onder **"De prompt"** in een verse sessie. De rest van dit document is achtergrond voor jou (Dennis) — de sessie heeft het niet nodig, want de prompt verwijst naar de documenten in de repo.

---

## Waar het gebleven is

Vijf commits op de branch, alles gepusht, werkboom schoon:

| Commit | Wat |
|---|---|
| `6e369ff` | Prebuilds: dagboek in Kompas, logboek dag → week → maand |
| `acf5044` | Eén invoervorm, weeksamenvatting per stof, schap beweegt mee |
| `bf7b54b` | Gebronde spreidingsbanden; USDA als primaire bron |
| `5e3e427` | Supermarktproduct wijst naar een voedingsmiddel |
| `bbbf727` | Productcatalogus: 371 regels, twee assen, bereidingsvarianten |

**De stand van de catalogus:** 371 regels, 61 met gehaltes, **310 op `bron: null`**, 23 zoekcategorieën, 13 voedselgroepen, 17 tests.

---

## De prompt

```
Je werkt op branch claude/voedingsdagboek-kompas-po1nua in denvwest/psf.
Lees eerst, in deze volgorde:

  1. docs/plan/ONDERZOEK_SPREIDING_EN_USDA_2026-09.md   (het onderzoek en de besluiten)
  2. docs/design/BESLUIT_VOEDINGSDAGBOEK_KOMPAS_V1_2026-09.md   (het productontwerp)
  3. src/data/nutrition/food-taxonomy.ts   (de twee assen — lees de moduledoc echt)
  4. src/data/nutrition/food-catalog.ts    (371 regels, waarvan 310 zonder gehaltes)
  5. scripts/usda-extract.mjs              (het extractiescript, nog nooit gedraaid)

Er staat een volledig ontwerp met vier vastgelegde invarianten. Die zijn niet
onderhandelbaar en niemand mag ze omzeilen om sneller klaar te zijn:

  A. DERTIEN VOEDSELGROEPEN, VAST. `groep` op een catalogusregel is de
     analyse-as waar berekenBreedte, berekenVariatie en de weekendvergelijking
     op draaien. Een groep erbij maakt elke eerder geregistreerde dag
     onvergelijkbaar. De zoekcategorieën (`category`) mogen wél vrij groeien.

  B. NOOIT EEN VERZONNEN GETAL. Een regel zonder geverifieerde bron houdt
     `bron: null` en `verified: false`. Dat is een werkbare toestand: zo'n
     regel is gewoon te loggen, vult zijn voedselgroep en telt mee voor
     breedte en variatie — alleen de milligrammen zeggen "nog niet opgehaald".
     Een plausibel ogende waarde is erger dan geen waarde, want hij is
     achteraf niet van een goede te onderscheiden.

  C. DE ONDERGRENS-REGEL. Elke som over gekozen producten heet "minstens X
     uit de bronnen die je noemde", nooit "je haalde X binnen". Een ondergrens
     kan "gehaald" bewijzen en "niet gehaald" nooit. Geen percentages van een
     ADH, nergens.

  D. DE POORT BLIJFT DICHT WAAR HIJ DICHT IS. resolveNutritionGate hangt aan
     de check en de ladderstatus, niet aan de catalogus. Geen enkele nieuwe
     functie mag hem openen of omzeilen.

Werk deze vier taken af, in deze volgorde, en commit per taak.

──────────────────────────────────────────────────────────────────────
TAAK 1 — Bepaal eerst hoe je aan USDA-data komt, en meld het
──────────────────────────────────────────────────────────────────────
De vorige sessie kon api.nal.usda.gov en fdc.nal.usda.gov niet bereiken:
het netwerkbeleid van de sandbox geeft 403 op CONNECT. WebSearch werkte wél,
en WebFetch werkte op raw.githubusercontent.com.

Test dit als eerste, want het bepaalt de hele aanpak:

  curl -sS --max-time 20 "https://api.nal.usda.gov/fdc/v1/foods/search?query=almonds&api_key=DEMO_KEY"

Werkt het:  draai `npm run extract:usda` met een echte sleutel en werk uit het
            rapport in scripts/out/usda-rapport.json.
Werkt het niet:  gebruik WebSearch per voedingsmiddel. Trager, maar bruikbaar —
            en zeg dat expliciet in je eerste bericht, zodat Dennis kan kiezen
            of hij het script liever lokaal draait en het rapport aanlevert.

Meld de uitkomst voordat je verder gaat. Ga niet in stilte over op een
tragere route.

──────────────────────────────────────────────────────────────────────
TAAK 2 — Vul de 310 lege regels, in blokken van tien
──────────────────────────────────────────────────────────────────────
Voor elke regel met `bron: null` in food-catalog.ts:

  1. Zoek de USDA-match. Foundation Foods gaat vóór SR Legacy: alleen dat
     datatype draagt per nutriënt een waargenomen min, max, median en
     dataPoints, en dat is precies wat de klassenband uit ONDERZOEK §1.7
     moet vervangen. Branded overslaan — een etiket draagt wettelijk geen
     magnesium, zink of vitamine D.

  2. BEOORDEEL DE MATCH. Dit is het werk, niet het ophalen. Nederlands
     volkorenbrood is niet "Bread, whole-wheat, commercially prepared":
     andere uitmaalgraad, ander recept, ander zout. Kwark bestaat niet in de
     VS. Skyr is geen Griekse yoghurt. Bij twijfel: laat `bron: null` staan
     en noteer waarom. Een afgewezen match is een goed resultaat.

  3. Voeg de rij toe aan src/data/nutrition/food-sources.ts volgens de
     bestaande vorm: `nutrientValue` met de waarde per 100 g, fdcId als `ref`,
     datatype + release als `edition`, en `verified: true` alleen bij een
     beoordeelde match. Zet daarna `bron` in de catalogus op die sleutel.

  4. Waar het FDC-record min/max/median/dataPoints heeft: neem ze mee. Het
     type `NutrientValue` moet daarvoor een `observed`-veld krijgen — de
     voorgestelde vorm staat in ONDERZOEK §2.3. Dat is de eindstand; de
     klassenband uit §1.7 dekt alleen nog de rijen met één monster.

  5. Verrijkte producten NOOIT uit USDA. Margarine en halvarine volgen het
     NL-kader (7,5 µg vitamine D per 100 g), halfvolle en magere melk zijn
     sinds 2021 verplicht verrijkt met 1,5 µg per 100 ml, en plantaardige
     dranken volgen het etiket per merk. Zie ONDERZOEK §2.2.

Rapporteer per blok van tien: welke matches je aannam, welke je afwees en
waarom. Commit per twee tot drie blokken, niet per regel.

──────────────────────────────────────────────────────────────────────
TAAK 3 — Onderbouw wat er nog op een vuistregel rust
──────────────────────────────────────────────────────────────────────
Twee dingen in het ontwerp zijn nog niet hard:

  a. De spreidingsbanden in ONDERZOEK §1.7 zijn gebronde klassenbanden, geen
     waargenomen spreiding. Elke rij die uit taak 2 een `observed` krijgt,
     hoort die band niet meer te gebruiken. Bouw dat: `observed` wint, de
     klassenband is de terugval. Werk daarna beide prebuilds bij
     (docs/design/voedingsdagboek-kompas-prebuild-v1-2026-09.html en
     docs/design/voortgang-voedingslogboek-dag-week-maand-prebuild-v1-2026-09.html
     dragen allebei een SPREAD-tabel die dit spiegelt).

  b. De USDA-nutriëntnummers in scripts/usda-extract.mjs zijn op naam én
     nummer gematcht, maar alleen 328 (vitamine D) is geverifieerd tegen
     USDA-documentatie. Controleer de rest bij de eerste run — het script
     logt welke sleutel aansloeg.

Onderzoek daarnaast of USDA de rijen kan dragen die nu nog op literatuur
staan: bioavailability, variability, preparationNote en qualityNote komen NIET
uit een voedingstabel. Die houden een eigen verificatiespoor, en `verified`
slaat alleen op `nutrientValue`. Verwijder ze niet — bij magnesium en zink
dragen ze de zwaarste conclusie (fytaat maakt magnesium uit brood iets anders
dan magnesium uit vlees).

──────────────────────────────────────────────────────────────────────
TAAK 4 — Zet de catalogus tegenover de supplementvraag
──────────────────────────────────────────────────────────────────────
Dit is de nieuwe functionaliteit, en het is de reden dat de catalogus bestaat.

Bouw de omgekeerde index: van nutriënt naar producten. Voor elk van de vijf
stoffen (eiwit, magnesium, zink, omega-3, vitamine D) een gerangschikte lijst
van catalogusregels die hem dragen, met de bijdrage per realistische portie,
filterbaar op zoekcategorie.

Waar dat landt: het schap (S1 in de Voortgang-prebuild). De vraag "uit mijn
eten of uit een supplement" wordt daarmee concreet — niet "eet meer noten"
maar "deze elf producten uit jouw categorieën dragen magnesium, dit is wat een
portie bijdraagt".

Vier harde randvoorwaarden:

  - Sorteer op bijdrage per PORTIE, niet per 100 g. Niemand eet 100 g tahin.
  - Toon de band, niet een punt. Zelfde ondergrens-regel als overal.
  - Neem de opname mee. Bij magnesium en zink bepaalt fytaat de opname méér
    dan het gehalte; een lijst die daar niet op annoteert, zet plantaardige
    bronnen te hoog. De fytaat:zink-verhouding is een MAALTIJD-eigenschap
    (ONDERZOEK §1.8) — die uitspraak hoort op gerecht- en dagniveau, niet
    per product.
  - Geen gezondheidsclaim. "Dit product levert X mg magnesium per portie" mag.
    "Hiermee heb je geen supplement nodig" mag niet, en de poort blijft
    onafhankelijk van deze lijst.

Nieuwe client-events registreren op drie plekken: src/lib/events.ts,
src/lib/intake-events-client.ts en de allowlist in de events-route.

──────────────────────────────────────────────────────────────────────
WERKWIJZE
──────────────────────────────────────────────────────────────────────
- Klaar-check vóór elke commit, volledig:
      grep -rn "console.log" src/   (moet 0 zijn)
      npx tsc --noEmit
      npx vitest run
      npx eslint --max-warnings 0
  Faalt er iets: niet committen, eerst melden en fixen.
  Draait node_modules niet: `npm ci` werkt in deze omgeving.

- Committen, en pushen naar claude/voedingsdagboek-kompas-po1nua. Dennis
  vraagt expliciet om git add + commit + push, dus laat werk niet ongepusht
  staan.

- Nieuwe invarianten die je vastlegt: als test, niet als comment. De bestaande
  suite src/data/__tests__/food-catalog.test.ts is het voorbeeld — die ving bij
  het schrijven 23 varianten die zonder verantwoording waren toegevoegd.

- Meld bij elke afronding het meetpunt: "Meetpunt: <event(s)> — hier lees je
  het effect af."

- Antwoord in het Nederlands, code en variabelen in het Engels.
```

---

## Achtergrond die de sessie niet nodig heeft, maar jij misschien wel

### Waarom Opus 5 en niet iets anders

Taak 2 is 310 keer een oordeel: *is dit Amerikaanse voedingsmiddel hetzelfde als het Nederlandse?* Een verkeerd toegekende match levert een getal op dat er precies zo uitziet als een goed getal. Het valt pas op als iemand het naslaat — en dat was nou juist wat je aan het automatiseren was.

De actuele modellen zijn Claude Fable 5.1, Claude Opus 5, Claude Sonnet 5 en Claude Haiku 4.5. **"Opus ultra" bestaat niet** — wat je waarschijnlijk bedoelt is `effort: max`, een instelling waarmee je Opus 5 dieper laat nadenken, of Fable 5.1, dat erboven zit.

Mijn advies: **Opus 5 op effort `high` of `xhigh`**. Fable 5.1 is capabeler maar kost het dubbele per token ($10/$50 tegen $5/$25 per miljoen), en het knelpunt hier is niet redeneerdiepte maar volume × zorgvuldigheid. Zet Sonnet 5 alleen in voor het mechanische invullen ná taak 1, als de matchregels al vastliggen.

### De val waar een nieuwe sessie in gaat lopen

Het verleidelijke pad is: 310 regels, dat vraagt om automatisering, dus schrijf een script dat de eerste zoektreffer overneemt. Dat levert binnen een uur een volle catalogus op waarin niemand nog kan zien welke waarden kloppen. De prompt is er expliciet op geschreven om dat te voorkomen — blokken van tien, rapporteren welke matches zijn afgewezen, en afwijzen als een goed resultaat behandelen.

### Wat er ná deze vier taken nog ligt

- De merkproductenlaag (§2.5 van het onderzoek): supermarktproducten die naar een catalogusregel wijzen en alleen hun eigen portie meebrengen. Pas zinnig als de catalogus gevuld is.
- De product-eerst herstructurering van `food-sources.ts` (§5 van het besluit): één `FOODS`-index als bron van waarheid waar `FOOD_SOURCES` uit wordt afgeleid. Lost drie bestaande datafouten per constructie op.
- Implementatie van de prebuilds in het echte dashboard. Alles tot nu toe is ontwerp plus data; er staat nog geen scherm live.
