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
