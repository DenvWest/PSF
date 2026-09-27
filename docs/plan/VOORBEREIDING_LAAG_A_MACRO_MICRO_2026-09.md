# Voorbereiding Laag A — macro/calorie-invoerscherm

**Datum:** 27 september 2026
**Status:** voorbereiding, nog niet gebouwd
**Vervolg op:** `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` (§1 Laag A, §6 bouwvolgorde)
**Doel van dit document:** de exacte aansluitpunten in de bestaande code vastleggen vóórdat Laag A gebouwd wordt, plus een concrete restlijst voor wat er ná Laag A nog moet gebeuren (C, B, Meer-menu) — zodat een volgende sessie niet opnieuw hoeft uit te zoeken waar dit op aansluit.

---

## 0. Status van Laag 0 / Laag 0b op het moment van schrijven

- **Laag 0** (`scripts/supermarkt-extract.mjs`): klaar, gecommit. 35.517 producten met calorieën/macro's in `scripts/out/supermarkt-rapport.json` (AH/Jumbo/Lidl/Plus).
- **Laag 0b** (`scripts/supermarkt-usda-verrijk.mjs`): draait op de achtergrond (gestart 27 sep, ~11-12 uur doorlooptijd verwacht). Automatisch NL→EN-matchen, ~52% dekking (18.484 van 35.383 producten kregen een zoekterm), elke match draagt een `zekerheid`-classificatie (`sterk`/`zwak`/`ongeverifieerd`) — geen enkele match is "geverifieerd" in de zin die `usda-extract.mjs` aan dat woord geeft. Rapport landt in `scripts/out/supermarkt-usda-rapport.json`.
- **Geen van beide is al in `food-catalog.ts` of enige `src/`-databron opgenomen.** Beide blijven rapporten totdat een beoordelingsstap (nog te doen, zie §4) ze overneemt.

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
| 2 | Laag 0b — USDA-aanvulling | **Draait** (achtergrond, ~11-12u) | — |
| 3 | Importscript: rapporten → `SupermarktProduct[]`, met filtering (§2.4) | **Nog te bouwen** | Laag 0b klaar |
| 4 | Dennis beoordeelt een steekproef van het geïmporteerde resultaat | **Nog te doen** | Stap 3 |
| 5 | `SupermarktProduct`-type + databestand definitief in `src/data/nutrition/` | **Nog te bouwen** | Stap 4 (beoordeeld) |
| 6a | Laag A, plak 1 — datamodel + opslag: `SupermarktProduct`-type (`src/data/nutrition/supermarkt-catalog.ts`, leeg tot stap 5), rekenlaag (`src/lib/nutrition-supermarkt-items.ts`), eigen tabel `account_supermarkt_portie_logs` + lib (`src/lib/account-supermarkt-portie-logs.ts`) + API-route (`/api/account/supermarkt-portie-logs`), event `nutrition.dagboek_supermarkt_portie_bevestigd` geregistreerd op de 3 plekken | **Klaar** (27 sep) — migratie staat open in `OPENSTAAND.md`, blokkeert deploy niet | — |
| 6b | Laag A, plak 2 — UI: nieuwe `SupermarktPortieInvoer.tsx` (calorie/macro-ring, analoog aan maar los van `DagboekPortieInvoer.tsx`), zoekuitbreiding in `DagboekCatalogusZoek.tsx` (derde `Resultaat`-variant, alleen zichtbaar vanuit een maaltijd), nieuwe `DagboekSupermarktSectie.tsx` (weergave in het overzicht, geen kolom in `DagboekMaaltijd.tsx`), client-state in `DagboekScherm.tsx` (`supermarktLogs`, parallel aan `items`/`bewerkt`, naar het `favorieten`-patroon), `DagboekProductDetail.tsx`-docstring bijgewerkt | **Klaar** (27 sep) — getest met een tijdelijke fixture (mock van `SUPERMARKT_CATALOG` in de test, niet in productiecode) omdat de echte catalogus nog leeg is; `SupermarktPortieInvoer`/zoekresultaten tonen "n.o." zolang een veld ontbreekt | — |
| 6c | Laag A, plak 2b — `SupermarktPortieInvoer` herbouwd van bottom-sheet naar volledig scherm (naar `DagboekProductDetail`/`DagboekNutrientDetail`-idioom): rijen Maaltijd/Aantal porties/Portiegrootte (editable, geen `1,0 stuk` — die portiedata bestaat niet), ring onderaan. Dennis vroeg dit na screenshots van de MyFitnessPal-referentie (§1 Laag A noemde de screenshot al, maar de eerste bouw koos de bestaande bottom-sheet-vorm van `DagboekPortieInvoer`). `DagboekScherm.tsx`'s `"supermarktPortie"` is nu een eigen exclusieve schermtak (niet meer samen met `DagboekCatalogusZoek` gerenderd). | **Klaar** (27 sep) | — |
| 7 | Docstring-updates: `nutrition-dagboek-items.ts` + `DagboekProductDetail.tsx` ("geen calorieën"-regel herzien, zie §1) | **Nog te doen** | Gelijktijdig met stap 6 |
| 8 | Laag C — instellingen: nieuwe tabel + UI voor het zelf ingevulde macro/calorie-doel (géén kolom op `account_voedingsdoelen`, zie besluit §0.1 en §1) | **Nog te bouwen** | Onafhankelijk van 3-7, kan parallel |
| 9 | Migratie voor Laag C's doeltabel + `OPENSTAAND.md`-blok (CLAUDE.md-verplichting bij elke nieuwe migratie) | **Nog te bouwen** | Samen met stap 8 |
| 10 | Laag B — dagboek-tabbladen (Calorieën · Voedingsstoffen · Macro's) op `DagboekScherm.tsx` | **Nog te bouwen** | Stap 6 (Laag A) en stap 8 (Laag C, voor het instelbare doel in de Macro's-tab) |
| 11 | ~~Meer-menu: item "Voeding"/"Dagboek" toevoegen aan `DASHBOARD_MORE_ITEMS`~~ | **Vervallen** (27 sep) — Dagboek is al de eerste hoofdtab (`tab=vandaag`, label "Dagboek"), een extra Meer-menu-item ernaar is dubbelop. Zie `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §1 "Meer-menu — geschrapt". | — |
| 12 | Meetpunten (CLAUDE.md-verplichting): nieuwe interacties in Laag A/B/C (portie-invoer met macro-ring, doel instellen) hebben elk een `domain_events`/GA4-event nodig, geregistreerd op de drie plekken (`src/lib/events.ts`, `src/lib/intake-events-client.ts`, allowlist in `src/app/api/intake/events/route.ts`) | **Nog te doen** | Gelijktijdig met stap 6, 8, 10 — niet achteraf |

### Wat hier bewust nog geen keuze in heeft

- **Of stap 3's output een gegenereerd bestand of een handmatig onderhouden bestand wordt** — dat hangt af van hoeveel rijen na filtering overblijven (weten we pas na stap 2).
- **Of `DagboekCatalogusZoek.tsx` één samengevoegde index krijgt of twee gescheiden zoekingangen** (§3.3) — een bouwkeuze, geen architectuurbesluit dat nu al vastgezet hoeft te worden.
- **Welke van de 16 `geenBron: "verrijkt"`-regels (§2.2) daadwerkelijk een supermarkt-match krijgen** — dat is per-regel werk dat pas na stap 4 zinnig is.

### Wat hier expliciet niet in scope zit (herhaling uit het besluit, voor de volledigheid)

- Het tekortsysteem, de vijf kernstoffen, `nutrition-score.ts` — ongewijzigd.
- Een systeem-voorgesteld dieet-doel — Laag C's doel is 100% door de gebruiker ingevuld.
- Een nieuw ontwerp voor het Meer-menu — het bestaande `CockpitMoreMenu`-patroon volstaat.
- Live prijs-/voorraaddata uit de supermarkt-CSV's — alleen macro/micro-informatie wordt gebruikt, de CSV's prijshistorie wordt genegeerd.
