# Besluit — nl-supermarkt-mcp als bron afgewezen; boodschappenlijst "voeding eerst, supplement daarna" gaat door

**Datum:** 3 oktober 2026
**Status:** BESLIST (Dennis, "akkoord" na voorlegging in sessie van 3 okt)
**Raakt:** `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` (§5 databron, §7), `ANALYSE_NUTRITION_SEO_KENNISPPLATFORM.md` (blok F "Later / niet tenzij productbesluit"), het focusverdict van 15 aug (dashboardwerk alleen als snoei richting de supplementroute).
**Vervangt:** niets. Dit is het productbesluit dat blok F vraagt voor één afgebakend stuk (de boodschappenlijst). Recepten-DB en food-affiliate blijven in blok F.

---

## 1. Onderzocht: `github.com/Samvox1/nl-supermarkt-mcp`

Python-MCP-server, MIT, laatste commit 11 dec 2025. Een wrapper om drie bronnen:

| Bron | Wat het levert | Hoe |
|---|---|---|
| `checkjebon.nl/data/supermarkets.json` | per product **alleen** `n` (naam), `l` (link), `p` (prijs), `s` (eenheid) | publieke JSON, dagelijks |
| folderz.nl | aanbiedingen supermarkten + drogisten | HTML-scraping |
| TheMealDB | recepten (Engels, zonder voedingswaarden) | API |

Live feed op 3 okt opgehaald: AH 16,2k · Jumbo 17,2k · Lidl 22,1k · Plus 16,1k · Dekamarkt 10,7k · Dirk 7,4k · Hoogvliet 7,4k · Spar 7,8k · Poiesz 1,7k · Vomar 0,9k · Aldi 0 · Ekoplaza 0.

Kwaliteit van de code: zoeken via `ILIKE '%x%'`, `test_server.py` importeert klassen die niet bestaan, `supermarket_locations` wordt door niets gevuld (de routeplanner is leeg), geen user-id op lijsten, alerts of budget (één gebruiker), een standaard databasewachtwoord.

## 2. Besluit A — afgewezen als databron voor Laag 0/0b

- **Geen nutriëntvelden.** De feed levert geen kcal, macro's of micro's. De zes extra ketens geven dus geen bijdrage aan Laag 0 (macro's uit het etiket).
- **Licentie.** De MIT-licentie geldt voor de code, niet voor checkjebon-data of folderz. Folderz-scraping valt af (gebruiksvoorwaarden, en het is onverenigbaar met een later B2B-aanbod).
- **Het echte gat zit elders.** In de steekproef van de supermarkt-import spreken 8.721 van de 15.051 bruikbare USDA-matches het etiket tegen (>25% op kcal/vet/koolhydraten). Dat oplossen, en de onafgemaakte worktree `supermarkt-import` afmaken, gaat voor extra ketens.

**Wél toegestaan, als afgebakend onderzoek:** checkjebon-live gebruiken om te meten of merkproducten (A-merken, bijv. Alpro of Bertolli) uit de zes extra ketens te koppelen zijn aan bestaande etiketregels uit AH/Jumbo/Lidl/Plus. Alleen namen en ketenbeschikbaarheid. **Geen prijzen in de UI**: BESLUIT_MACRO §7 ("geen live prijs- of voorraadfeed") blijft staan. Uitvoering via `PROMPT_SUPERMARKT_CHECKJEBON_MERKMATCH_2026-10.md`. Het resultaat is een rapport met een go/no-go, geen automatische opname in de catalogus.

## 3. Besluit B — boodschappenlijst "voeding eerst, supplement daarna" (smalle v1)

**Wat:** voor een kernstof die in het tekortsysteem op "te gaan" staat, toont het dashboard welke voedingsmiddelen per portie het meest bijdragen. Pas daarna volgt, als het gat blijft, de bestaande uitgang naar `/beste/*`.

**Harde grenzen:**
1. **Alleen de kernstoffen uit het tekortsysteem.** De brede micronutriënten uit de macro/micro-laag zijn informatief, zonder oordeel (BESLUIT_MACRO §0.1), dus daar komt geen alert en geen lijst op.
2. **De asymmetrie-regel geldt.** Nooit "tekort", nooit ✗. De copy is "staat nog op 'te gaan'", volgens `WRITING_VOICE.md`.
3. **Bron = `FOOD_SOURCES` (NEVO, `verified`).** Niet de supermarktcatalogus: etiketten noemen magnesium, omega-3 en B12 vrijwel nooit, en vitamine D staat maar bij 219 van de ~36k producten. Een concreet supermarktproduct mag later als voorbeeld naast een generiek item ("makreel 125 g") staan, maar draagt het getal niet.
4. **Geen affiliate-links in de lijst.** De supplementstap linkt naar de bestaande `/beste/*`-uitgang (besluit 23 jul: geen koop of affiliate in het dashboard).
5. **v1 zonder prijzen, voor één stof.** De keuze tussen magnesium en omega-3 maakt Dennis bij de start van de bouw.
6. **Privacy-gate (art. 9).** Een opgeslagen lijst die uit voedingsdata is afgeleid, is gezondheidsdata. In dezelfde PR: update van het verwerkingsregister en de privacyverklaring, en een DPIA-check (`ANALYSE_NUTRITION_SEO_KENNISPPLATFORM.md` §privacy). Een lijst die alleen wordt berekend en niet opgeslagen, vermijdt een nieuwe tabel. Dat is de voorkeur voor v1.
7. **Meetpunt in dezelfde wijziging** (CLAUDE.md meet-standaarden): tonen, klik op de voedingsbron, klik door naar `/beste/*`.

**Waarom dit door het focusverdict van 15 aug heen mag:** de lijst eindigt op de supplementroute (`/beste/*`) en volgt de regel dat een supplement het gat dicht dat voeding laat. Het is geen losse dashboardfeature zonder uitgang.

## 4. Afgewezen features uit de repo (met reden)

| Feature | Reden |
|---|---|
| Prijsvergelijking supermarkten | buiten de positionering; geen koop in het dashboard |
| Folder-aanbiedingen | scraping, wekelijks veranderende data |
| Recepten / weekmenu | TheMealDB is Engels en zonder voedingswaarden; recepten-DB blijft in blok F |
| Routeplanner / budget | andere doelgroep; werkt in de repo zelf niet |

**Uitgesteld (goed idee, andere bron):**
- **Prijsalerts en "laagste prijs in 90 dagen" op supplementen.** Alleen via affiliate-productfeeds (Daisycon e.d.), nooit via scraping.
- **Drogisterij-aanbiedingen op vitamines.** Alleen met een affiliate-link, anders lekt er omzet weg.

## 5. Eigen idee, vastgelegd als richting (niet gepland)

**PS als MCP-server** (kennis, geen persoonsdata): PS-Score, supplementbeoordelingen, voedingsbronnen per stof en het advies "voeding eerst, dan supplement", te raadplegen door AI-assistenten en B2B-partners. Dat sluit aan op de open "kennischat zonder persoonsdata" (sessie-architectuur, 25 sep). Er wordt pas een eigen besluit voor gemaakt als B2B concreet wordt.

## 6. Volgorde

1. Supermarkt-import afmaken: de worktree, plus het probleem dat de helft van de USDA-matches het etiket tegenspreekt.
2. (Parallel, alleen onderzoek) checkjebon-merkmatch volgens de prompt → rapport → go/no-go door Dennis.
3. Boodschappenlijst v1: één stof, berekend, zonder prijzen, met meetpunt.
4. Pas daarna prijzen of alerts, met supplementprijzen uit affiliate-feeds.
