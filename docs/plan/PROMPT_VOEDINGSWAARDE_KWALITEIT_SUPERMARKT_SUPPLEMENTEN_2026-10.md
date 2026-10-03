# Prompt — voedingswaarden kloppend maken: supermarktproducten + supplementen

Plak onderstaande in de sessie die aan de supermarkt-import werkt (worktree `supermarkt-import`). Spoor b kan ook in een eigen sessie en worktree.

---

Lees eerst deze documenten; ze zijn leidend:
- `docs/plan/BESLUIT_SUPERMARKT_MCP_EN_BOODSCHAPPENLIJST_2026-10.md` §0: nu alleen de kwaliteit van de voedingswaarden; prijzen, vergelijken en boodschappenlijst later.
- `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md`: twee lagen. Het tekortsysteem kent alleen de kernstoffen met `/beste/*`-uitgang; macro's en brede micro's zijn informatief, zonder oordeel.
- `docs/plan/VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md`: actuele stand van Laag 0/0b.

**Doel.** Elk getal dat het dagboek toont, is herleidbaar en klopt. Liever `n.o.` dan een fout getal. Geen nieuwe features, geen prijzen, geen UI-uitbreiding.

## Stap 0 — losse eindjes

Deze worktree heeft niet-gecommitte wijzigingen (`scripts/supermarkt-extract.mjs`, `scripts/supermarkt-import.mjs`, `scripts/__tests__/supermarkt-import.test.mjs`, `docs/plan/STEEKPROEF_SUPERMARKT_IMPORT_2026-10.md`). Rond die af als eigen taak (klaar-check, commit, PR), of meld waarom niet. Check met `git log origin/main..HEAD` dat de branch niets van anderen meeneemt.

## Spoor a — supermarktproducten (Laag 0/0b)

Uit de steekproef: van 15.051 bruikbare USDA-matches spreken er 8.721 het etiket tegen (≥1 van kcal/vet/koolhydraten >25% af). Zwak 12.803 tegenover sterk 505.

1. **Diagnose eerst, niet repareren.** Classificeer de tegenstrijdige matches naar oorzaak, met per oorzaak aantallen en 10 voorbeelden:
   - verkeerde zoekterm (bijv. "chips" → USDA "potato, raw");
   - bereid of onbereid (droge pasta tegenover gekookte);
   - samengesteld product tegenover enkelvoudig voedingsmiddel;
   - eenheid- of per-100-fout (ml/g, kJ/kcal);
   - parserfout in Laag 0 (het etiket zelf verkeerd uitgelezen).
2. **Regel die hieruit volgt (voorstel, Dennis beslist):** een USDA-aanvulling mag alleen micronutriënten aanvullen als de macro's van die match het etiket binnen een tolerantie bevestigen (de kcal/vet/koolhydraten van de match als controle). Spreekt de match het etiket tegen, dan wordt hij verworpen en blijft het veld `n.o.`. **Het etiket wint altijd** voor de velden die het zelf noemt.
3. Zwakke matches (`zwak`) vullen standaard niets aan, tenzij de controle uit punt 2 slaagt. Rapporteer wat er dan aan dekking overblijft per veld (calcium, ijzer, vitamine C, vitamine D, natrium enz.).
4. Laag 0-parserfouten die uit de diagnose komen: fixen in `supermarkt-extract.mjs`, met een test per gevonden patroon.
5. Lever een nieuw steekproefrapport (zelfde vorm als `STEEKPROEF_SUPERMARKT_IMPORT_2026-10.md`) met tellingen vóór en na, ter beoordeling. **Nog niets naar `src/data/nutrition/supermarkt-catalog.ts`** tot Dennis het rapport heeft goedgekeurd.

Grenzen: brede micro's krijgen geen oordeel, geen `NutrientId`, geen `verified`. Geen nieuwe ketens, geen checkjebon, geen prijzen.

## Spoor b — supplementen in het dagboek

Stand: `src/data/nutrition/supplement-catalog.ts` heeft 9 generieke regels (magnesium ×3, eiwit ×2, zink, omega-3). Het tekortsysteem kent omega-3, magnesium, vitamine D, B12 en ijzer. De `/beste/*`-producten (`src/data/supplements/*.ts`, type in `src/types/supplement.ts`: `perServing`, `epaMg`, `dhaMg`, `elementair`) dragen al echte etiketdoseringen, maar het dagboek kent ze niet.

1. **Inventariseer** (rapport, nog geen code):
   - welke kernstoffen geen supplementregel in het dagboek hebben;
   - per `/beste/*`-product: staat de dosering per portie erin, is die elementair (bij magnesium het elementaire Mg, niet het zoutgewicht), en welke bron staat erbij;
   - of de database (admin-productbeheer, `score_inputs`) en de statische `src/data/supplements/*.ts` het over de dosering eens zijn. Verschillen apart opsommen.
2. **Voorstel ter beoordeling:**
   - ontbrekende generieke regels (vitamine D3 in µg, B12 in µg, omega-3 als EPA+DHA in mg; ijzer alleen als dat past binnen `BESLUIT_IJZER_CALCIUM_2026-09.md`);
   - de dagboekregels koppelen aan de `/beste/*`-producten, zodat de gelogde mg uit hetzelfde etiketgetal komt als op de vergelijkingspagina. Eén bron van waarheid, geen tweede kopie van doseringen;
   - de opmerking "één nutriënt per regel" in `supplement-catalog.ts` blijft staan; multivitaminen zijn buiten scope.
3. Na akkoord: implementeren met tests. Geen affiliate-links in het dagboek (besluit 23 jul); de koppeling met `/beste/*` gaat over data, niet over een koopknop.

## Oplevering

- Per spoor eerst een rapport in `docs/plan/` ter beoordeling, pas daarna code.
- Daarna de normale klaar-check (`grep -rn "console.log" src/` + `npx tsc --noEmit` + `vitest` + `eslint --max-warnings 0`), één commit per afgeronde taak, PR op een eigen feature-branch vanaf `origin/main`.
- Raakt een stap het schema: migratie plus een blok in `supabase/migrations/OPENSTAAND.md` in dezelfde commit.
- Meetpunt: alleen als er iets aan de UI verandert. Hergebruik dan bestaande dagboek-events.
