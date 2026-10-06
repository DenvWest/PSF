# Besluit: één totaalbeeld in het dagboek

**Datum:** 4 oktober 2026
**Status:** besloten (Dennis, 4 okt: "akkoord met aanbeveling")
**Raakt:** `DagboekKrans`, `DagboekProductDetail`, de tabbladen Voedingsstoffen en Macro's
**Bouwt voort op:** `BESLUIT_NEVO_GEHALTES_DAGBOEK_2026-10.md` (PR #119), PR #118 (NEVO-portiescherm), `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md`

## Aanleiding

Op één dag liet het dagboek drie beelden zien die niet op elkaar aansloten:
- De krans zei "0/2", terwijl er vijf tegels stonden.
- Het productdetail toonde alleen magnesium.
- De tabbladen Voedingsstoffen en Macro's telden alleen supermarktporties, dus geen catalogusproducten.

## Besluit

1. **NEVO vult de kernstoffen aan** bij een catalogusregel zonder FOOD_SOURCES-bron. Dat is de aanbeveling die Dennis heeft geaccepteerd. Gebouwd in #119.
2. **De krans verklaart zijn noemer.**
   - Het midden toont "1 van 2 meetbare stoffen gedekt".
   - Tegels die niet meetellen staan gedempt, en de regel eronder noemt welke stoffen wel meetellen.
   - Eiwit zonder doel toont grammen in plaats van "—".
   - Een segment op 0% tekent niets meer. Een afgerond lijnuiteinde van lengte nul werd een stip die op voortgang leek.
3. **Volledige voedingswaarde als tweede laag, zonder oordeel.** Het gaat om energie, vet (waarvan verzadigd), koolhydraten (waarvan suikers), vezels, eiwit, natrium, kalium, calcium, ijzer, B12 en C.
   - De waarden komen uit `nevo_foods` (catalogusregel) en uit het etiket (supermarktportie).
   - Alleen vitamines en mineralen krijgen een %RI, in één neutrale tint.
   - Zichtbaar in het productdetail en per dag op het tabblad Voedingsstoffen.
4. **Eén gehalte per plek.** Eiwit komt in de tabel uit `bedragVanItem`, dezelfde bron als de krans. Magnesium, zink, vitamine D en omega-3 staan alleen in de krans en worden niet herhaald.
5. **De macro-ring telt catalogusproducten mee**, via dezelfde berekening (`berekenVoedingswaarde`).
6. **Benaderingen tellen nooit mee in een som.** Het productdetail toont dan alleen macro's met het label "benadering". *(Aanvulling 6 okt, `BESLUIT_NUL_SPOOR_BENADERING_2026-10.md`: vrijgegeven benaderingen tonen ook hun kernstoffen, met "≈" en de NEVO-naam; de som blijft ongemoeid.)* De tabel meldt hoeveel producten geen waarden hebben, want het totaal is een ondergrens.

## Afgewezen

- **Supermarktporties laten meetellen in de krans.** Dat raakt het tekortsysteem. De etiketlaag blijft zonder oordeel (§0.1 van het macro-besluit). Gevolg: eiwit in de tabel kan hoger uitvallen dan in de krans zodra er etiketproducten zijn.
- **De weektabel verbergen als die leeg is.** Hij toont ook het ingestelde doel. In plaats daarvan zegt hij nu dat hij alleen etiketproducten telt.

## Open

- ~~De weektabel (Voedingsstoffen en Macro's) telt nog alleen supermarktporties.~~ Gesloten 4 okt: zie `BESLUIT_DOELEN_VERBONDEN_2026-10.md` §5.
