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
