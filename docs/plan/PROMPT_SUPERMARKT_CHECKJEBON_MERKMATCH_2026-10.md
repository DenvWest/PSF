# Prompt — checkjebon-merkmatch: extra ketens aan bestaande etiketregels koppelen (onderzoek)

Plak onderstaande in de sessie die aan de supermarkt-import werkt (worktree `supermarkt-import`).

---

Lees eerst `docs/plan/BESLUIT_SUPERMARKT_MCP_EN_BOODSCHAPPENLIJST_2026-10.md` (§2) en `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` (§5, §7). Die zijn leidend.

**Context.** De supermarkt-import (Laag 0/0b) draait op de `pljwissink/supermarkets`-snapshot van 14 maart 2026 met vier ketens (AH, Jumbo, Lidl, Plus) en etiketgegevens. De live feed `https://www.checkjebon.nl/data/supermarkets.json` (de bron achter github.com/Samvox1/nl-supermarkt-mcp) heeft zes extra ketens (Dekamarkt, Dirk, Hoogvliet, Spar, Poiesz, Vomar), maar levert per product alleen `n` (naam), `l` (link), `p` (prijs) en `s` (eenheid). Geen voedingswaarden.

**Vraag.** Meet hoeveel producten uit die zes ketens een betrouwbare koppeling hebben met een bestaande etiketregel uit de vier ketens. Een koppeling geldt alleen bij **hetzelfde merkproduct**: zelfde merk, zelfde productnaam, zelfde of vergelijkbare verpakkingseenheid. Huismerken (Dirk, Spar, Hoogvliet, Deka, Vomar, Poiesz, AH, Jumbo, Plus, Lidl-eigen merken) koppelen nooit aan elkaar.

**Doen:**
1. Eerst de bestaande stand afmaken of veiligstellen: deze worktree heeft niet-gecommitte wijzigingen (`scripts/supermarkt-extract.mjs`, `scripts/supermarkt-import.mjs`, test, steekproef-doc). Commit die eerst als eigen taak volgens de klaar-check, of meld waarom niet.
2. Nieuw script `scripts/supermarkt-checkjebon-merkmatch.mjs`, zelfde stijl als `supermarkt-extract.mjs`:
   - downloadt de feed één keer naar `scripts/out/checkjebon-<datum>.json`, met een duidelijke User-Agent en zonder herhaald pollen;
   - normaliseert namen (kleine letters, eenheden eruit en apart, merk als eerste token(s));
   - matcht tegen de producten uit `scripts/out/supermarkt-rapport.json` met een classificatie `exact` / `waarschijnlijk` / `geen`. Geen fuzzy match onder een strikte drempel; liever een gemiste match dan een foute;
   - schrijft `scripts/out/checkjebon-merkmatch-rapport.json` + `docs/plan/STEEKPROEF_CHECKJEBON_MERKMATCH_2026-10.md` met: tellingen per keten, verdeling per classificatie, een steekproef van 40 `exact`- en 40 `waarschijnlijk`-matches naast elkaar, en een lijst met twijfelgevallen.
3. Tests in `scripts/__tests__/` voor de normalisatie en de huismerk-uitsluiting.

**Niet doen:**
- Niets opnemen in `src/data/nutrition/supermarkt-catalog.ts` of de UI. Dit is alleen onderzoek, de go/no-go is aan Dennis.
- Geen prijzen gebruiken of opslaan voor weergave (BESLUIT_MACRO §7). De prijs mag alleen in het ruwe downloadbestand blijven staan.
- Niets van folderz.nl en geen code uit nl-supermarkt-mcp overnemen. Alleen de publieke JSON-feed.
- Geen nieuwe `SupermarktSupermarkt`-waarden of migraties. Die komen pas na een "go".

**Oplevering.** Rapport en steekproef ter beoordeling, plus een advies met onderbouwing: is het de moeite waard? Hoeveel extra vindbare producten levert het op, en hoeveel daarvan staan nog niet onder dezelfde naam in de vier ketens? Volg daarna de normale klaar-check (tsc + vitest + eslint + console.log-grep) en lever een PR op een eigen feature-branch.
