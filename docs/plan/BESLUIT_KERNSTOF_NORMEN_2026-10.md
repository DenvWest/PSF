# Besluit: kernstoffen rekenen met de Nederlandse norm per persoon, niet met de etiket-RI

**Datum:** 4 oktober 2026
**Status:** besloten (Dennis, 4 okt: "Akkoord" na voorlegging van het onderzoek)
**Raakt:** het tekortsysteem (`nutrition-tekortsysteem.ts`), weekoverzicht en trend in Patroon, agenda-voorstellen, de krans in het dagboek
**Bouwt voort op:** `BESLUIT_DOELEN_VERBONDEN_2026-10.md` (plak 2: één bron voor doelen)

## Aanleiding

Dennis vroeg waar de percentages in de krans op gebaseerd zijn (omega-3 378%, zink 9%, vitamine D 60%). Antwoord: op de RI uit EU 1169/2011 bijlage XIII, en voor omega-3 op de EFSA-claimvoorwaarde. De RI is een etiketwaarde om producten te vergelijken, geen persoonlijke norm. Voor vitamine D is hij 5 µg, de helft van wat de Gezondheidsraad iedere volwassene aanbeveelt.

## Onderzoek

| Stof | Was (noemer) | Nederlandse norm | Bron |
|---|---|---|---|
| Magnesium | 375 mg (RI) | 350 mg man · 300 mg vrouw (AI) | Gezondheidsraad 2018, *Voedingsnormen vitamines en mineralen voor volwassenen* |
| Zink | 10 mg (RI) | 9 mg man · 7 mg vrouw | Gezondheidsraad 2018 (via Voedingscentrum) |
| Vitamine D | 5 µg (RI) | 10 µg; 20 µg vanaf 70 | Gezondheidsraad 2012 / Voedingscentrum |
| Omega-3 (EPA+DHA) | 250 mg (EFSA AI, claimvoorwaarde) | 200 mg (≈ 1× per week vette vis) | Gezondheidsraad 2001, *Voedingsnormen: energie, eiwitten, vetten en verteerbare koolhydraten* |

## Besluit

1. **Het dekkingsoordeel rekent met de Nederlandse norm voor deze persoon.** Bron: `src/data/nutrition/voedingsnormen.ts`, uitgelezen via `src/lib/nutrition-normen.ts`. Elk scherm met een dekkings-% of ✓ gebruikt die ene bron.
2. **Geslacht uit de check bepaalt magnesium en zink.** De server leidt de norm af (`laadVoedingsdoelenWeergave`); het geslacht zelf gaat niet naar de client. Geen geslacht of "anders" → de hogere waarde. Een hogere norm geeft minder vinkjes, en het vinkje is het enige wat het tekortsysteem mag bewijzen (asymmetrie-regel).
3. **Leeftijd telt (nog) niet mee.** De check vraagt leeftijd tot "55+", dus 70+ (vitamine D 20 µg) is niet te herkennen. Iedereen rekent met 10 µg.
4. **De etiketvermelding blijft %RI.** Productdetail en de voedingswaardetabel tonen %RI, want daar is het een samenstellingsvermelding en is de RI wettelijk voorgeschreven (art. 32 1169/2011). `reference-intake.ts` blijft daarvoor bestaan.
5. **De norm van de kernstoffen is niet zelf bij te stellen.** Een zelf verlaagd doel zou een ✓ geven die het systeem niet kan onderbouwen, en dat ✓ voedt de route naar `/beste/*`. Eiwit blijft de uitzondering (eigen doel naast de PROT-AGE-richtlijn). Het Doelen-scherm toont per kernstof de norm en de bron, zonder invoerveld.
6. **De EFSA-claimdrempel voor omega-3 (250 mg) blijft voor claims.** Wat een product op `/beste/*` mag claimen, rekent tegen de claimvoorwaarde in `approved-claims.ts`, niet tegen deze norm.

## Afgewezen

- **De RI als persoonlijke norm houden.** Wettelijk juist op een etiket, inhoudelijk onjuist voor een persoon; bij vitamine D een factor 2 te laag.
- **Kernstof-normen vrij instelbaar op Je doelen.** Zie punt 5.
- **Bij onbekend geslacht de vrouwennorm of een gemiddelde.** Geeft vinkjes die voor een deel van de groep niet kloppen.

## Gevolgen

- Dekkingspercentages verschuiven: vitamine D halveert, magnesium en zink stijgen licht, omega-3 stijgt met 25%.
- `gender` in `intake_sessions` was "content-personalisatie, geen scoring-input" (migratie 20260905090000). Het wordt nu ook gebruikt voor de norm van het dekkingsoordeel. Dat is geen scoring: de domeinscores van de check veranderen niet.

## Open

- **Weekweergave voor omega-3 en vitamine D in de krans** (plak 2b van `BESLUIT_DOELEN_VERBONDEN_2026-10.md`): één visdag geeft een dag-% van honderden procenten.
- **Leeftijd 70+** herkennen vraagt een fijnere leeftijdsband in de check.
