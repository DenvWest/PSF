# Voorbereiding Laag A — macro/calorie-invoerscherm

**Datum:** 27 september 2026
**Status:** voorbereiding, nog niet gebouwd
**Vervolg op:** `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` (§1 Laag A, §6 bouwvolgorde)
**Doel van dit document:** de exacte aansluitpunten in de bestaande code vastleggen vóórdat Laag A gebouwd wordt, plus een concrete restlijst voor wat er ná Laag A nog moet gebeuren (C, B, Meer-menu) — zodat een volgende sessie niet opnieuw hoeft uit te zoeken waar dit op aansluit.

---

## 0. Status van Laag 0 / Laag 0b op het moment van schrijven

- **Laag 0** (`scripts/supermarkt-extract.mjs`): klaar, gecommit. 35.517 producten met calorieën/macro's in `scripts/out/supermarkt-rapport.json` (AH/Jumbo/Lidl/Plus).
- **Laag 0b** (`scripts/supermarkt-usda-verrijk.mjs`): **tweede run loopt (gestart 30 sep 16:20, `--resume`).** De eerste run (27 sep 15:45) stopte op de USDA FDC-rate-limit (HTTP 429 op `/foods/search` vanaf item ~3639/18484, geen retry/backoff, rapport pas aan het eind) en is gekild zonder output. Daarna kreeg het script retry/backoff, tussentijds wegschrijven en `--resume` (commit "fix(scripts): retry/backoff + resume"); de nieuwe run schrijft doorlopend naar `scripts/out/supermarkt-usda-rapport.json` (log: `/tmp/supermarkt-usda-verrijk.log`) en stond op 1 okt 17:00 op item ~10.600/18.484. Automatisch NL→EN-matchen, ~52% dekking (18.484 van 35.383 producten kregen een zoekterm), elke match draagt een `zekerheid`-classificatie (`sterk`/`zwak`/`ongeverifieerd`) — geen enkele match is "geverifieerd" in de zin die `usda-extract.mjs` aan dat woord geeft.
- **Geen van beide is al in `food-catalog.ts` of enige `src/`-databron opgenomen.** Beide blijven rapporten totdat een beoordelingsstap (nog te doen, zie §4) ze overneemt.
- **Bijgewerkt 3 okt:** zie §5 (import + besluiten) en §6 (licentieblokkade, verificatie, meer data). Laag 0b is op 2 okt volledig afgerond (18.484/18.484). Het importscript (stap 3) is gebouwd: `scripts/supermarkt-import.mjs`. Daarbij bleek de Jumbo-energieparser in Laag 0 bij ~79% van de Jumbo-producten geen kcal te vinden; gerepareerd (zie §5.1). Bevindingen en open beslissingen: §5.

---

## 1. De architectuurgrens die Laag A doorbreekt — waar die precies staat

Drie bestanden in `src/` bevatten een **expliciete, huidige** regel die zegt dat calorieën/macro's niet getrackt worden. Dit zijn geen verouderde comments — ze zijn recent (16-23 sep) en golden tot dit besluit (26-27 sep) onverkort:

| Bestand | Regel |
|---|---|
| `src/lib/nutrition-dagboek-items.ts` (docstring, sectie "Wat dit niet doet") | *"Geen calorieën, geen macro's. Laag 5 blijft dicht voor tellen."* |
| `src/components/dashboard/dagboek/DagboekProductDetail.tsx` (docstring, sectie "Waarom hier geen macro's...") | *"Dit systeem trackt bewust maar vijf stoffen... 'laag 5 blijft dicht voor tellen'... Een volledige voedingswaardetabel zoals op een etiket zou een nieuwe, bredere databron vereisen; die bestaat nog niet."* |
| `supabase/migrations/20260923150000_account_voedingsdoelen.sql` (SQL-comment, "Waarom geen calorieën of macro's") | Zelfde asymmetrie-redenering, toegepast op een doel-tabel. Al genoemd in `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §0. |

**Wat dit betekent voor het bouwen van Laag A:**
- De twee `src/`-docstrings mogen (moeten) worden bijgewerkt zodra Laag A daadwerkelijk gebouwd wordt — ze beschrijven anders een regel die niet meer klopt. Verwijs in de nieuwe tekst naar `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` in plaats van de regel stilzwijgend te laten vervallen.
- De SQL-migratie is immutable (CLAUDE.md-regel: migraties worden nooit achteraf aangepast) — die comment blijft historisch staan. De nieuwe migratie voor het macro-doel (Laag C) moet expliciet verwijzen naar dit besluit, zoals het besluitdocument al vastlegt.
- **Wat níét verandert:** `nutrition-score.ts`, de vijf kernstoffen, `bedragVanItem` voor `NutrientId`-berekeningen. Die blijven ongemoeid — Laag A is een parallelle toevoeging, geen vervanging (zie §3 van het besluit).

---

## 2. Het datamodel — hoe Laag 0 + Laag 0b + `FOOD_CATALOG` samenkomen

### 2.1 Twee aparte productwerelden, één invoerscherm

`FOOD_CATALOG` (in `src/data/nutrition/food-catalog.ts`) is de bestaande, curated lijst van ~371 voedingsmiddelen (generieke termen: "havermout", "zalm-wild") die de vijf kernstoffen dragen via `FOOD_SOURCES`. De supermarktdataset is 35.517 **merkproducten** ("Jumbo Tortilla Sweet Chili Chips 170 g"). Dit zijn en blijven twee verschillende assen:

- `FOOD_CATALOG` blijft de bron voor de vijf kernstoffen (`NutrientId`, `bewijsbaar`-vlag, `/beste/*`-route) — **niet aanraken**.
- De supermarktdata wordt een **nieuw, parallel bestand** met alleen de informatieve velden (calorieën/macro's/brede micro's) — geen `NutrientId`, geen claim (zie besluit §3). Voorstel: `src/data/nutrition/supermarkt-catalog.ts`, met een eigen `SupermarktProduct`-type dat niet van `CatalogEntry` erft (andere as, geen gedeelde velden zoals `groep`/`geenBron` die specifiek voor de kernstoffen-taxonomie zijn).

### 2.2 De 16 `geenBron: "verrijkt"`-regels zijn de brug

Zestien bestaande `FOOD_CATALOG`-regels (melk-halfvol, havermelk, amandeldrink, sojayoghurt, etc. — zie `grep -n 'geenBron: "verrijkt"' src/data/nutrition/food-catalog.ts`) dragen letterlijk het commentaar **"Wacht op de supermarktlaag"**. Dit is geen toeval — de catalogus-architectuur had deze laag al voorzien. Voor deze 16 regels geldt: zodra een supermarktproduct met hoge zekerheid matcht op zo'n regel (bijv. een generiek "AH Halfvolle melk"-record), kan die regel zijn `bron: null` alsnog invullen met een `bron: "supermarkt:<prodId>"`-achtige verwijzing — **maar dat is een aparte, latere beslissing**, niet iets om nu automatisch te doen. Voor Laag A zelf is dit niet blokkerend: Laag A toont macro's per willekeurig gekozen product, ongeacht of dat product ook in `FOOD_CATALOG` voorkomt.

### 2.3 Voorgestelde velddefinitie voor Laag A (aansluitend op wat er al gebouwd is)

```ts
// Nieuw type, naast CatalogEntry — geen NutrientId, geen claim.
export interface SupermarktProduct {
  prodId: string;              // uit de CSV, bijv. "wi138239/activia-yoghurt-naturel"
  naam: string;
  supermarkt: "AH" | "Jumbo" | "Lidl" | "Plus";
  categorie: string | null;
  // Uit Laag 0 — vrijwel altijd aanwezig (98%+ dekking per supermarkt).
  energyKcal: number | null;
  fatG: number | null;
  saturatedFatG: number | null;
  carbohydrateG: number | null;
  sugarsG: number | null;
  fiberG: number | null;
  proteinG: number | null;
  saltG: number | null;
  // Uit Laag 0 (sporadisch) of Laag 0b (USDA-aanvulling, ~52% dekking, lage zekerheid).
  sodiumMg: number | null;
  calciumMg: number | null;
  ironMg: number | null;
  vitaminCMg: number | null;
  vitaminDµg: number | null;
  // Herkomst per veldgroep — nodig omdat Laag 0 en 0b elkaar aanvullen,
  // nooit overschrijven. UI moet kunnen tonen "bron: AH.nl" vs. "bron: USDA
  // (automatische match, ongeverifieerd)" — dat is een ander vertrouwensniveau.
  bron: "supermarkt" | "supermarkt+usda";
  usdaZekerheid?: "sterk" | "zwak" | "ongeverifieerd";
}
```

Alle velden `number | null` — **nooit een verzonnen 0 voor "onbekend"**, zelfde patroon als `bron: null` in `CatalogEntry` en `n.o.` in de bestaande dagboek-UI. Laag A rendert `null` als "n.o." (niet opgehaald), niet als leeg getal.

### 2.4 Wat de beoordelingsstap moet doen vóór Laag A deze data gebruikt

Dit is het stuk werk dat **nog niet gedaan is** en vóór Laag A's databehoefte staat:

1. Wachten tot Laag 0b klaar is (achtergrondproces, ~11-12 uur vanaf 27 sep ochtend).
2. Een importscript (nieuw, nog te bouwen) dat `supermarkt-rapport.json` + `supermarkt-usda-rapport.json` samenvoegt tot `SupermarktProduct[]`, met deze regels:
   - Rijen met `verdacht`-array uit Laag 0 (136 stuks, fysiek onmogelijke waarden) **worden overgeslagen**, niet gecorrigeerd.
   - USDA-aanvulling alleen overnemen bij `zekerheid: "sterk"` of `"zwak"` — `"ongeverifieerd"` wordt genegeerd (dat was expliciet het doel van die classificatie: ruis eruit filteren vóór opname, niet pas in de UI).
   - Output: een gegenereerd databestand (net als `food-catalog.ts` handmatig onderhouden, of een gegenereerd `.json` dat ingeladen wordt — **kies dit pas bij het bouwen**, hangt af van hoeveel producten na filtering overblijven en of Dennis nog handmatig wil bijsturen per rij).
3. Dennis beoordeelt een steekproef (zelfde patroon als `usda-extract.mjs`) voordat het definitief in de dagboek-catalogus komt — dit is een expliciete, niet overslaan-bare stap uit beide voorgaande besluiten ("niets wordt automatisch overgenomen").

---

## 3. Aansluitpunten in de bestaande UI voor Laag A

### 3.1 `DagboekPortieInvoer.tsx` — waar de calorie/macro-ring bij komt

Dit scherm (`src/components/dashboard/dagboek/DagboekPortieInvoer.tsx`, 338 regels) is al precies de "laag over de zoeklijst" die het besluit beschrijft als Laag A: je kiest een hoeveelheid, en ziet live de bijdrage (`bedragVanItem`). Vandaag toont het alleen de vijf kernstoffen via `NUTRIENT_ORDER` (uit `nutrition-food-index.ts`). Laag A voegt hier een **calorie/macro-ring** aan toe wanneer het gekozen item een `SupermarktProduct` is in plaats van een `FOOD_CATALOG`-entry — een nieuwe rendertak naast de bestaande `NUTRIENT_ORDER`-lijst, niet een vervanging.

Nodig: een equivalent van `bedragVanItem` maar voor de informatieve velden — dezelfde `per100g × grams / 100`-rekenregel (zie `nutrition-dagboek-items.ts:192-199`), toegepast op `SupermarktProduct`-velden in plaats van `NutrientId`. **Gebouwd (27 sep, plak 1):** `bedragVanSupermarktveld(product, veld, grams)` in `src/lib/nutrition-supermarkt-items.ts` — een nieuw bestand, niet in `nutrition-dagboek-items.ts` zelf, want dat bestand draagt expliciet de "geen calorieën"-regel in zijn docstring en die twee dingen moeten niet door elkaar lopen in één functie-verzameling.

**Architectuurkeuze (27 sep, na uitzoeken):** `DagboekItemBron` (`"voeding" | "supplement"`) is een gesloten unie die tot in opslag (`sanitizeItems`) en de tekortsom (`bedragVanItem`/`telOp`) doorloopt — een derde bronwaarde toevoegen zou dat kernbestand raken. Een `SupermarktPortieLog` is daarom géén `DagboekItem` en telt niet mee in `sanitizeItems`/de tekortsom. Het is een eigen, parallelle registratie in een eigen tabel `account_supermarkt_portie_logs` — zelfde patroon als `account_dagboek_favorieten` (eigen tabel/lib/API-route naast het dagboek, geen kolom erop, geen derde bron-waarde). Zie `src/lib/nutrition-supermarkt-items.ts`, `src/lib/account-supermarkt-portie-logs.ts`, `src/app/api/account/supermarkt-portie-logs/route.ts` en de migratie `20260927162517_account_supermarkt_portie_logs.sql`.

### 3.2 `DagboekProductDetail.tsx` — waar de docstring-update landt

**Gebouwd (27 sep).** Dit component zelf toont alleen `DagboekItem`s (het tekortsysteem) en is niet uitgebreid met supermarktvelden — dat zou de vijf-kolommen-ADH-balk-vorm verkeerd toepassen op een as zonder oordeel. In plaats daarvan is de docstring herschreven om te verwijzen naar `DagboekSupermarktSectie` als de plek waar supermarktporties wél staan, en is de toelichtende tekst in de kaart zelf ("andere voedingsstoffen... meet dit systeem bewust niet") gecorrigeerd — het systeem meet ze inmiddels wél, alleen niet in dít scherm.

### 3.3 `DagboekCatalogusZoek.tsx` — waar `SupermarktProduct` doorzoekbaar wordt

**Gebouwd (27 sep).** Eén samengevoegde zoekfunctie: `Resultaat` kreeg een derde variant (`{ bron: "supermarkt"; product: SupermarktProduct }`), `searchSupermarktCatalog()` wordt meegenomen in dezelfde `treffers`-berekening als voeding/supplementen, met een eigen renderrij (geen favoriet-ster — een supermarktproduct is geen `DagboekItemBron`, zie §1). Twee bewuste beperkingen: (1) alleen zichtbaar wanneer `nutrient === null` (vanuit een maaltijd, niet vanuit een nutriëntdetail) — een supermarktproduct draagt geen `NutrientId`-bijdrage; (2) een nieuwe `onKiesSupermarkt`-callback naast `onKies`, want de bestaande signature is getypeerd op `DagboekItemBron`. Met een lege `SUPERMARKT_CATALOG` (huidige productiestatus) levert dit gewoon nul resultaten op — geen aparte "leeg"-state nodig. Prestatie bij 35.000+ producten is nog niet getest (de catalogus is nog leeg); `searchSupermarktCatalog` gebruikt dezelfde lineaire substring-scan als `searchCatalog`, dus dat is het eerste om te profilen zodra de import (stap 3-5) landt.

---

## 4. Wat er nog moet gebeuren — volledige restlijst (27 sep 2026)

In volgorde, met wat elke stap concreet oplevert en wat hij nodig heeft van de vorige stap:

| # | Stap | Status | Blokkeert op |
|---|---|---|---|
| 1 | Laag 0 — supermarkt-extractie | **Klaar**, gecommit | — |
| 2 | Laag 0b — USDA-aanvulling | **Klaar** (2 okt, 18.484/18.484) | — |
| 3 | Importscript: rapporten → `SupermarktProduct[]`, met filtering (§2.4) | **Klaar** (3 okt) — `scripts/supermarkt-import.mjs`, zie §5 | — |
| 4 | Dennis beoordeelt een steekproef van het geïmporteerde resultaat | **Klaar** (3 okt) — sectie A akkoord, zonder USDA (§5.4) | Stap 3 |
| 5 | `SupermarktProduct`-type + databestand definitief in `src/data/nutrition/` | **Nog te bouwen** — Supabase-tabel + server-side zoekroute (§5.3, §6.3); live pas na licentiebesluit (§6.1) | §6.1 |
| 6a | Laag A, plak 1 — datamodel + opslag: `SupermarktProduct`-type (`src/data/nutrition/supermarkt-catalog.ts`, leeg tot stap 5), rekenlaag (`src/lib/nutrition-supermarkt-items.ts`), eigen tabel `account_supermarkt_portie_logs` + lib (`src/lib/account-supermarkt-portie-logs.ts`) + API-route (`/api/account/supermarkt-portie-logs`), event `nutrition.dagboek_supermarkt_portie_bevestigd` geregistreerd op de 3 plekken | **Klaar** (27 sep) — migratie staat open in `OPENSTAAND.md`, blokkeert deploy niet | — |
| 6b | Laag A, plak 2 — UI: nieuwe `SupermarktPortieInvoer.tsx` (calorie/macro-ring, analoog aan maar los van `DagboekPortieInvoer.tsx`), zoekuitbreiding in `DagboekCatalogusZoek.tsx` (derde `Resultaat`-variant, alleen zichtbaar vanuit een maaltijd), nieuwe `DagboekSupermarktSectie.tsx` (weergave in het overzicht, geen kolom in `DagboekMaaltijd.tsx`), client-state in `DagboekScherm.tsx` (`supermarktLogs`, parallel aan `items`/`bewerkt`, naar het `favorieten`-patroon), `DagboekProductDetail.tsx`-docstring bijgewerkt | **Klaar** (27 sep) — getest met een tijdelijke fixture (mock van `SUPERMARKT_CATALOG` in de test, niet in productiecode) omdat de echte catalogus nog leeg is; `SupermarktPortieInvoer`/zoekresultaten tonen "n.o." zolang een veld ontbreekt | — |
| 6c | Laag A, plak 2b — `SupermarktPortieInvoer` herbouwd van bottom-sheet naar volledig scherm (naar `DagboekProductDetail`/`DagboekNutrientDetail`-idioom): rijen Maaltijd/Aantal porties/Portiegrootte (editable, geen `1,0 stuk` — die portiedata bestaat niet), ring onderaan. Dennis vroeg dit na screenshots van de MyFitnessPal-referentie (§1 Laag A noemde de screenshot al, maar de eerste bouw koos de bestaande bottom-sheet-vorm van `DagboekPortieInvoer`). `DagboekScherm.tsx`'s `"supermarktPortie"` is nu een eigen exclusieve schermtak (niet meer samen met `DagboekCatalogusZoek` gerenderd). | **Klaar** (27 sep) | — |
| 7 | Docstring-updates: `nutrition-dagboek-items.ts` + `DagboekProductDetail.tsx` ("geen calorieën"-regel herzien, zie §1) | **Nog te doen** | Gelijktijdig met stap 6 |
| 8 | Laag C — instellingen: nieuwe tabel + UI voor het zelf ingevulde macro/calorie-doel (géén kolom op `account_voedingsdoelen`, zie besluit §0.1 en §1) | **Klaar** (27 sep) — `account_macro_doelen`-tabel, `account-macro-doelen.ts` + `macro-doelen-client.ts` + `api/account/macro-doelen/route.ts` (drieweg `leesVeld`-patroon, naar `account-voedingsdoelen.ts`), `MacroDoelenKaart.tsx` naast `VoedingsdoelenKaart` op `/dashboard/doelen`; geen richtlijn/formule zoals bij eiwit, leeg = "nog niet ingesteld", geen som-constraint op de percentages | — |
| 9 | Migratie voor Laag C's doeltabel + `OPENSTAAND.md`-blok (CLAUDE.md-verplichting bij elke nieuwe migratie) | **Klaar** (27 sep) — `20260927171910_account_macro_doelen.sql`, blokkeert deploy niet | — |
| 10 | Laag B — dagboek-tabbladen (Vandaag · Voedingsstoffen · Macro's) op `DagboekScherm.tsx` | **Klaar** (27 sep, herzien 27 sep) — `DagboekSubtabs.tsx` (naar `PatroonSubtabs.tsx`, met a11y-koppeling van `DagboekCatalogusZoek.tsx`), `DagboekSupermarktWeektabel.tsx` (naar `PatroonScherm.tsx`'s `.vd-weekbalk`/`.vd-tabel--los`, hergebruikt bestaande CSS), nieuwe aggregatie `nutrition-supermarkt-weekoverzicht.ts` (hergebruikt `weekStart`/`verschuifWeek`/`weekDatums`/`weekLabel` uit `nutrition-weekoverzicht.ts`, rekent niet via `nutrientenUitItems`). "Vandaag" is de bestaande overzicht-inhoud (hero/balken/weekstrip/eetmomenten/`DagboekSupermarktSectie`), geen nieuwe route. Doel-kolom leest `account_macro_doelen` (stap 8), percentagedoelen (koolhydraten/vet/eiwit) worden alleen naar gram omgerekend als er ook een calorierichtlijn is ingesteld — anders `null`, nooit een berekend "geadviseerd" getal. **Bug gevonden tijdens testen en gefixt**: `grammenDoelUitPercentage` gaf `NaN` i.p.v. `null` bij een ontbrekend percentage/calorieën uit een niet-strikt-`null` bron (bijv. `undefined`) — regressietest toegevoegd in `nutrition-supermarkt-weekoverzicht.test.ts`.<br><br>**Herzien (27 sep, na browser-review):** het losse "Calorieën"-tabblad toonde alleen de weekstrip en niets bruikbaars zonder gelogde producten (geen eigen invoeringang). Op verzoek van Dennis vervangen door: (a) het "Calorieën"-tabblad geschrapt; (b) een nieuwe `DagboekMacroRing.tsx` — een donut met kcal in het midden en koolhydraten/vet/eiwit als kleursegmenten (82/5/13%-vorm uit de MyFitnessPal-referentiescreenshot) — nu op het "Macro's"-tabblad, met de dataviz-skill gevalideerde categoriale kleuren (blauw/oranje/aqua, `validate_palette.js --pairs all` slaagt op `--vd-surface`). Nieuwe gedeelde helper `somVanSupermarktveld()` in `nutrition-supermarkt-items.ts` verving drievoudig gedupliceerde som-logica (`DagboekSupermarktSectie`, de ring, het weekoverzicht). Bevestigd in de browser met een tijdelijke testfixture (niet gecommit): ring toont correct 82%/5%/13% bij 96/2.4/15.6 g, "Doel"-kolom toont "—" zonder ingesteld doel (geen `NaN`), en 250 g-koolhydratendoel bij 2000 kcal + 50% ingesteld. | — |
| 11 | ~~Meer-menu: item "Voeding"/"Dagboek" toevoegen aan `DASHBOARD_MORE_ITEMS`~~ | **Vervallen** (27 sep) — Dagboek is al de eerste hoofdtab (`tab=vandaag`, label "Dagboek"), een extra Meer-menu-item ernaar is dubbelop. Zie `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §1 "Meer-menu — geschrapt". | — |
| 12 | Meetpunten (CLAUDE.md-verplichting): nieuwe interacties in Laag A/B/C (portie-invoer met macro-ring, doel instellen, tabblad-navigatie) hebben elk een event nodig | **Klaar** (27 sep) — `nutrition.dagboek_supermarkt_portie_bevestigd` (domain event + GA4, plak 1), `nutrition_dagboek_subtab_gekozen` + `macro_doel_aangepast` (GA4-only, naar het bestaande patroon van `nutrition_patroon_sectie_gekozen`/`voedingsdoel_aangepast` — geen domain event, die zusterfuncties hebben er ook geen) | — |

### Wat hier bewust nog geen keuze in heeft

- **Of stap 3's output een gegenereerd bestand of een handmatig onderhouden bestand wordt** — dat hangt af van hoeveel rijen na filtering overblijven (weten we pas na stap 2).
- **Of `DagboekCatalogusZoek.tsx` één samengevoegde index krijgt of twee gescheiden zoekingangen** (§3.3) — een bouwkeuze, geen architectuurbesluit dat nu al vastgezet hoeft te worden.
- **Welke van de 16 `geenBron: "verrijkt"`-regels (§2.2) daadwerkelijk een supermarkt-match krijgen** — dat is per-regel werk dat pas na stap 4 zinnig is.

### Wat hier expliciet niet in scope zit (herhaling uit het besluit, voor de volledigheid)

- Het tekortsysteem, de vijf kernstoffen, `nutrition-score.ts` — ongewijzigd.
- Een systeem-voorgesteld dieet-doel — Laag C's doel is 100% door de gebruiker ingevuld.
- Een nieuw ontwerp voor het Meer-menu — het bestaande `CockpitMoreMenu`-patroon volstaat.
- Live prijs-/voorraaddata uit de supermarkt-CSV's — alleen macro/micro-informatie wordt gebruikt, de CSV's prijshistorie wordt genegeerd.

---

## 5. Importstap uitgevoerd — bevindingen (3 oktober 2026)

`node scripts/supermarkt-import.mjs` voegt Laag 0 + Laag 0b samen volgens §2.4 en schrijft `scripts/out/supermarkt-catalog.json` (gitignored) plus een deterministische steekproef naar `docs/plan/STEEKPROEF_SUPERMARKT_IMPORT_2026-10.md`. Er is niets in `src/` gewijzigd. Filterregels zoals §2.4, plus drie die volgen uit "aanvullen, nooit overschrijven": een USDA-waarde vult alleen een `null`-veld, USDA-natrium alleen als het etiket ook geen zout noemt (zout en natrium zijn dezelfde grootheid), en een USDA-waarde met een onverwachte eenheid wordt genegeerd. `bron: "supermarkt+usda"` staat er alleen als er echt een veld uit USDA is ingevuld.

### 5.1 Laag 0-parserfix: Jumbo-calorieën

Bij het tellen bleek dat maar 2.503 van de ~11.400 Jumbo-producten een kcal-waarde hadden (AH/Lidl/Plus: >99%). Jumbo gebruikt minstens zes energienotaties, met kolommen (per 100 g / per portie / %RI) zonder scheiding achter elkaar; de oude regexen vingen er twee, en pakten bij sommige rijen de kJ-waarde als kcal (Bonne Maman confiture: 1023 "kcal" in plaats van 241). Nieuw: `jumboKcal()` in `scripts/supermarkt-extract.mjs`, met een kJ/kcal-controle op hetzelfde etiket (1 kcal = 4,184 kJ, 8% marge): klopt de verhouding niet, dan blijft het veld `null`, geen gok.

| | Vóór | Na |
|---|---|---|
| Jumbo-producten met kcal | 2.503 | 11.703 |
| Laag 0-producten totaal | 35.517 | 36.089 (572 Jumbo-rijen hadden eerst geen enkel geparsed veld) |
| `verdacht` (alle supermarkten) | 134 (niet 136) | 52 — geplakte kolommen worden nu `null` in plaats van een onmogelijke waarde |
| In de catalogus na filtering | — | **36.037** |

Het nieuwe `scripts/out/supermarkt-rapport.json` vervangt het oude; het oude staat als `supermarkt-rapport.2026-09-27.json` ernaast. Laag 0b hoeft niet opnieuw: die matcht op productnaam, niet op macro's (de 572 nieuwe Jumbo-rijen hebben geen USDA-match en krijgen alleen etiketwaarden).

### 5.2 De USDA-aanvulling is grotendeels onbruikbaar

Van de 15.051 bruikbare (sterk/zwak) Laag 0b-matches vullen er 13.308 daadwerkelijk een veld (505 sterk, 12.803 zwak). Bij **8.721 daarvan (65%) spreken de macro's van de USDA-match het etiket van hetzelfde product tegen** (kcal, vet of koolhydraten >25% af) — dan is het vrijwel zeker een ander product. De steekproef (sectie B) laat zien dat ook "sterk" en matches die de macro-check doorstaan vaak fout zijn: Melkunie Volle Melk → *ricotta* (sterk), Activia Yoghurt Mango → *rauwe mango* (168 mg vitamine C per 100 g, 2/2 op de macro-check), PLUS Zoete aardappelfriet → *kersen*, Jumbo Kaas Pesto Dip → *cheddar* (707 mg calcium, 3/3).

Wat het etiket zelf levert, zonder USDA: calcium 1.038 producten, natrium 3.591, ijzer 181, vitamine C 333, vitamine D 219. Mét USDA stijgt calcium naar 13.612 en ijzer naar 13.130 — maar dat zijn grotendeels getallen van een ander product. Dat is precies de val uit `usda-extract.mjs` ("een getal dat er precies zo uitziet als een goed getal"), en de UI kan dat met een "ongeverifieerd"-label niet goedmaken: in een optelling over een dag verdwijnt het label.

Sinds Dennis' besluit (§5.4) draait de import standaard zonder USDA; `--met-usda` reproduceert deze meting.

### 5.3 Bouwkeuze: gegenereerd, en niet als TS-module in `src/`

- **Gegenereerd, niet handmatig onderhouden** — besloten bij het bouwen (de open keuze uit §2.4/§4): 36.037 rijen zijn met de hand niet bij te sturen. Bijsturen gebeurt in de scripts (parser/filter), daarna opnieuw genereren.
- **Niet als `SUPERMARKT_CATALOG`-array in een TS-bestand**: de JSON is 15 MB. `supermarkt-catalog.ts` wordt geïmporteerd door clientcomponenten (`DagboekCatalogusZoek`, `SupermarktPortieInvoer`, `DagboekSupermarktSectie`) — de hele catalogus zou in de JavaScript-bundel van het dagboek belanden. Stap 5 heeft daarom eerst een server-side zoekroute nodig (de client vraagt treffers op, zoals `searchSupermarktCatalog` nu lokaal doet) plus een server-side `supermarktCatalogEntry` voor `sanitizeSupermarktLogs`. Dat is een eigen plak, na Dennis' beoordeling. Dit raakt ook de prestatievraag uit §3.3 (lineaire scan over 36.000 rijen) — server-side is dat geen probleem, in de browser wel.

### 5.4 Beslispunten voor Dennis (stap 4)

**Beantwoord door Dennis (3 okt):**
1. **Steekproef sectie A: akkoord.** (Beoordeeld op de versie in commit `a705d5d6`. Sindsdien trekt sectie A uit de hele catalogus, omdat er geen USDA-rijen meer zijn om uit te sluiten. Het is hetzelfde soort data.)
2. **Zonder USDA.** "Onbetrouwbaar niet doen." Dit wijkt bewust af van §2.4. `scripts/supermarkt-import.mjs` draait nu standaard zonder USDA; `--met-usda` bestaat alleen nog om de afgewezen meting te reproduceren. De aanvul-logica (alleen lege velden, nooit overschrijven) blijft staan voor een toekomstige bron die wél over hetzelfde merkproduct gaat (§6.2).
3. **Akkoord met §5.3** (server-side zoekroute als volgende plak). Let op de blokkade in §6.1 voordat de data live gaat.

Oorspronkelijke vraagstelling:

1. **Steekproef sectie A (alleen etiket)** — kloppen naam en waarden voor deze producten? Dit is de kern van de dataset.
2. **USDA-aanvulling (§5.2)**: advies is helemaal **zonder USDA** te importeren (`--zonder-usda`). Dat wijkt af van §2.4 ("sterk" en "zwak" overnemen), dus het is Dennis' keuze. Alternatieven: alleen "sterk" én een volledige macro-check (226 producten; de macro-check vangt geen product met vergelijkbare macro's maar andere micronutriënten, zoals Activia Mango → rauwe mango), of alles volgens §2.4 met de bekende foutmarge.
3. **Akkoord met §5.3** (server-side zoekroute als volgende plak, vóór de data in `src/` komt).

### 5.5 De 16 `geenBron: "verrijkt"`-regels — geen supermarkt-match voor `bron`

Uitgezocht met de nieuwe catalogus. Conclusie: **geen van de 16 kan zinnig een supermarkt-`bron` krijgen**, om twee redenen.

1. **De stoffen ontbreken.** `bron` in `FOOD_CATALOG` levert `NutrientId`-waarden (protein, omega3, magnesium, vitamin_d, zinc). Een `SupermarktProduct` draagt daarvan alleen eiwit en (zelden) vitamine D. Vitamine D staat op het etiket bij 11 van de 38 margarine/halvarine-treffers (mediaan 7,5 µg/100 g), bij 1 van de 92 halfvolle-melktreffers, en bij een handvol plantaardige dranken. Omega-3, magnesium en zink parseert Laag 0 niet. (B12 — de reden waarom plantaardige dranken en vleesvervangers verrijkt worden — staat in ~1.300 etiketteksten, maar is geen veld in Laag 0 en geen `NutrientId`.)
2. **"Verrijkt" betekent juist: per merk verschillend.** De regels zeggen het zelf: "verrijking is een merkkeuze — het etiket is de bron". Eén merkproduct als `bron` voor de generieke regel "Havermelk" kiest stilzwijgend één merk voor iedereen.

De brug die §2.2 voorzag bestaat wel, maar op een andere plek: wie zijn eigen merk wil registreren, kiest het merkproduct via de supermarkt-zoekfunctie (Laag A) — dáár is het etiket de bron. Advies: de 16 regels laten zoals ze zijn. Mogelijke uitzondering om later te overwegen: eiwit voor `eiwitshake`/`proteinereep`/de vleesvervangers (etiket-eiwit is goed gedekt), maar ook dan blijft het één merk voor een generieke regel.

---

## 6. Vervolg: verificatie en meer data (onderzoek 3 oktober 2026)

Status: **onderzoek en advies, geen besluit.** Elke keuze hieronder is aan Dennis.

### 6.1 Blokkade vóór livegang: de licentie van de basisdataset

Bij het nazoeken van verversmogelijkheden bleek:
- **`github.com/pljwissink/supermarkets` bestaat niet meer** (HTTP 404 op 3 okt). Er komt dus geen nieuwe snapshot van deze bron, en de herkomst is niet meer na te lezen.
- De lokale kopie heeft **geen licentiebestand**. Zonder licentie geldt standaard "alle rechten voorbehouden".
- De README zegt letterlijk: *"Data sourced from checkjebon.nl, boodschaapje.nl, openfoodfacts.org, ah.nl, jumbo.nl, plus.nl and lidl.nl."* Een deel van de etiketwaarden komt dus waarschijnlijk uit **Open Food Facts (ODbL, share-alike)**, en een deel is van **retailersites gehaald** (gebruiksvoorwaarden en databankenrecht van AH/Jumbo/Plus/Lidl).

`BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §5 regelt alleen de bronvermelding ("bron: [supermarkt].nl / checkjebon.nl-dataset volstaat") en toetst de licentie niet. De B2B-audit (`AUDIT_ARCHITECTUUR_SCHAAL_B2B_2026-09.md`, licentietabel) zegt over Open Food Facts: *"Niet mengen met de eigen productdatabase zonder licentiebesluit."* **Advies: eerst een licentiebesluit over de basisdataset, dan pas stap 5 live.** Lokaal bouwen en testen kan gewoon door. Een uitweg is §6.3 optie A: dezelfde soort data rechtstreeks uit Open Food Facts halen, met een bekende licentie in plaats van een onbekende.

### 6.2 Vraag: later wél verifiëren tegen andere bronnen?

Ja, maar alleen tegen bronnen die **over hetzelfde merkproduct** gaan. Daarom faalde USDA: het vertaalt "Activia Mango" naar een generiek "mango". Wat er bestaat:

| Bron | Wat | Licentie | Bruikbaar voor |
|---|---|---|---|
| **Open Food Facts** | ~111.000 producten getagd voor Nederland (API-telling 3 okt; ~3× onze 36k), etiketwaarden per 100 g, **barcode**, en waar het etiket het noemt ook micro's (steekproef Alpro: calcium, jodium) | ODbL (database) + DbCL (inhoud), share-alike op afgeleide databases | **Verificatie van etiketwaarden** (twee onafhankelijke etiketbronnen die het eens zijn = sterk), aanvulling van micro's die op het etiket staan (B12/D bij verrijkte producten), en later barcodescannen. Vereist een licentiebesluit. |
| **NEVO-online 2025/9.0** (RIVM) | 2.328 generieke Nederlandse voedingsmiddelen, ~130 stoffen, **Nederlandse namen** | CC BY 4.0 volgens data.overheid.nl, maar RIVM: "alleen ongewijzigd" (strengste lezing, `BESLUIT_NEVO_BRONVERMELDING.md`) | **Plausibiliteitscheck** voor onverpakte en generieke producten (AGF, vlees, vis): ligt het etiket in de NEVO-band? NEVO-waarden overnemen naar een merkproduct niet: dat is dezelfde fout als met USDA. |
| **USDA FDC** | generiek, Engels | publiek domein | Afgewezen voor supermarktproducten (§5.2). |
| **GS1 Data Source / merkfeeds** | officiële productdata van fabrikanten | contractueel, betaald | Pas bij B2B, volgens de audit-regel "herkomst per rij, feed-ID vastleggen". |

Concreet verificatiemodel als het zover is: per product een veld `verificatie: "1-bron" | "2-bronnen-eens" | "bronnen-oneens"`. Bij "oneens" (bijv. kcal >10% verschil) toont de UI niets of markeert hij het. Dat is dezelfde aanvul-logica als nu in `naarSupermarktProduct`, met een bron die wél over het product gaat.

### 6.3 Vraag: hoe verder met nog meer data?

Het besluit ligt er al: `ARCHITECTUUR_CONVERSATIONELE_VOEDINGSINVOER_2026-09.md` zegt *"Wanneer wél naar Postgres (en een provider-laag): als de catalogus boven een paar duizend regels uitkomt"*. Met 36.037 regels is dat punt bereikt. Advies voor stap 5:

1. **Eigen tabel in Supabase, geen JSON op de server.** Bijvoorbeeld `sm_products` (RLS deny-all, alleen service-role, zoals `pd_*`/`af_*`), met `pg_trgm`-index op de naam voor zoeken op delen van een woord, en per rij `herkomst` (bron, bron-id, snapshot-datum, licentie). De zoekroute vraagt de tabel op; `supermarktCatalogEntry` wordt een server-lookup. Een nieuwe bron is dan een nieuw importscript, geen codewijziging in de UI.
2. **Bronnen als lagen, niet als mengsel.** Elke bron in eigen rijen of een eigen tabel. Dat is nodig voor ODbL (een Open Food Facts-afgeleide moet onder ODbL gedeeld kunnen worden zonder de rest mee te nemen) en voor het latere B2B-verhaal.
3. **Volgorde van bronnen, op waarde per moeite:**
   - **A. Open Food Facts NL-dump** (Parquet op Hugging Face, ~4 GB wereldwijd, filter op Nederland), na het licentiebesluit. Dit vervangt mogelijk de verdwenen pljwissink-bron: meer producten, een bekende licentie, barcodes, en etiket-micro's.
   - **B. Kruisverificatie** pljwissink ↔ Open Food Facts voor de overlap (§6.2).
   - **C. NEVO-plausibiliteitscheck** voor onverpakte producten.
   - **D.** Merk- en GS1-feeds pas bij B2B.

### 6.4 checkjebon-merkmatch (`PROMPT_SUPERMARKT_CHECKJEBON_MERKMATCH_2026-10.md`): gemeten, advies no-go

Snelle meting op de live feed (één download op 3 okt, de prijzen genegeerd), met een exacte naammatch na normalisatie (kleine letters, eenheden eruit) en zonder huismerken:

| Keten | Producten | Huismerk | A-merk | Exact op een etiket |
|---|---|---|---|---|
| Dekamarkt | 10.728 | 1.174 | 9.554 | 1.812 (19%) |
| Dirk | 7.438 | 1.104 | 6.334 | 1.403 (22%) |
| Hoogvliet | 7.410 | 1.552 | 5.858 | 1.662 (28%) |
| Spar | 7.784 | 1.268 | 6.516 | 926 (14%) |
| Poiesz | 1.679 | 69 | 1.610 | 313 (19%) |
| Vomar | 887 | 71 | 816 | 113 (14%) |

**Waarom no-go:** een match betekent per definitie dat het product al onder dezelfde naam in de catalogus staat. Het levert dus **nul extra voedingsdata en nul extra vindbare producten** op, alleen "ook verkrijgbaar bij Dirk". Daar heeft de UI zonder prijzen of winkelkeuze niets aan (BESLUIT_MACRO §7). De ~80% zonder match heeft nergens etiketdata, en die vul je met Open Food Facts (§6.3 A), niet met een naamfeed. Het script uit de prompt is daarom niet gebouwd. De meting staat hier, zodat Dennis de go/no-go op cijfers kan nemen.

