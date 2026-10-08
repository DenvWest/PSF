# Besluit: eetpatroon in Je doelen + "niet gegeten" per maaltijd in het dagboek

- **Datum:** 7 oktober 2026
- **Status:** besloten (akkoord Dennis), gebouwd op `feat/eetpatroon`
- **Bouwt voort op:** `BESLUIT_PATROON_STOF_EN_TREND_2026-10.md` (open punt "wie structureel geen ontbijt eet, krijgt nooit een volledige dag")

## Aanleiding

Patroon en Trend noemen een dag pas volledig met ontbijt, lunch én avondeten. Wie periodiek vast en twee keer per dag eet, krijgt daardoor nooit een volledige dag, dus nooit een dagoordeel. En wie één dag de lunch overslaat, ziet die dag als "onvolledig", terwijl er niets ontbreekt.

## Besluiten

1. **Standaard plus uitzondering, allebei.**
   - **Eetpatroon** in Je doelen: "Welke maaltijden eet je meestal?" Vaste combinaties (lunch + avondeten · ontbijt + avondeten · ontbijt + lunch · alleen avondeten), standaard alle drie. Eén keer instellen. Een dag is volledig als al je gewone maaltijden erin staan (2/2).
   - **"Niet gegeten"** per lege hoofdmaaltijd in het dagboek, per dag. Voor de uitzondering. Alleen dit, zonder standaard, zou wie periodiek vast elke dag laten tikken.
2. **Niet gegeten = geregistreerd met 0.** Wat je niet at, is een feit, geen gat. De dag kan daardoor volledig worden en een oordeel krijgen. Er wordt niets bij geschat.
3. **Niet in "je gebruikelijke maaltijd".** Het gemiddelde voor de schatting van een ontbrekende maaltijd telt alleen de keren dat je hem wél at. Een overgeslagen lunch is geen lunch van 0 mg.
4. **Items winnen.** Staat er iets op een maaltijd, dan vervalt "niet gegeten" voor die maaltijd (server én client).
5. **Tussendoor** is geen hoofdmaaltijd: geen "niet gegeten" en niet in het eetpatroon.

## Opslag

Migratie `20261007120000_eetpatroon_overgeslagen.sql` (additief):
- `account_voedingsdoelen.gewone_maaltijden text[]`: null = alle drie (alle drie gekozen wordt ook als null bewaard).
- `account_nutrition_daybook.overgeslagen text[] not null default '{}'`.

Validatie in `src/lib/nutrition-eetpatroon.ts`; geen check-constraints.

## Meting

- `nutrition.dagboek_maaltijd_overgeslagen` (domain event) + GA4 `nutrition_dagboek_maaltijd_overgeslagen` {moment, aan}: hoe vaak en welke maaltijd.
- Eetpatroon: bestaand GA4 `voedingsdoel_aangepast` met `setting: "gewone_maaltijden"`.

## Volgende stap (apart, nog niet gebouwd)

`NUT_DOEL` ("Waar wil je met je voeding naartoe?") en het voedingswijze-/periodiek-vasten-deel van `NUT_CONTEXT` naar **Je doelen** in plaats van de leefstijlcheck. **Wijkt af van** `ROADMAP_LEEFSTIJLCHECK_NAAR_DASHBOARD_VOEDING.md` §10 (3 sep), dat beide in de check zette. Reden: nieuwe check-items vragen een `RULES_VERSION`-ophoging en een andere schaal voor de voedingsscore, de duurste stap uit die roadmap; als doel in Je doelen raakt het de score niet en kiest het alleen volgorde en copy. **Blijft in de check:** de medicatie-optie van `NUT_CONTEXT`, omdat die een doorverwijzing triggert.

## Aanvulling 8 oktober 2026: eetpatroon stuurt dagboek en Patroon

Akkoord Dennis. Tot nu toe telde het eetpatroon alleen mee voor "volledige dag"; het dagboek toonde altijd alle vier de momenten en Patroon liet een maaltijd zonder registratie stil weg uit "Hoe rijk is elke maaltijd".

1. **Dagboek:** gewone maaltijden en tussendoor als volle kaart. Een maaltijd buiten je patroon is, zolang hij leeg is, één regel "+ Ontbijt toevoegen · niet in je eetpatroon" (geen "Niet gegeten", die telt toch niet mee). Staat er iets op, dan is het weer een volle kaart (items winnen).
2. **Patroon per maaltijd:** de segmentrij toont je gewone maaltijden, tussendoor en elke maaltijd die in de periode iets droeg.
3. **Hoe rijk is elke maaltijd:** een gewone maaltijd zonder registratie blijft als rij staan met "nog niets geregistreerd" in plaats van weg te vallen; een maaltijd met alleen producten zonder kcal toont "geen voedingswaarde bekend" in plaats van streepjes. Lege tussendoor staat er niet in.
4. Helper `inEetpatroon` in `src/lib/nutrition-eetpatroon.ts`. Geen migratie.

**Meting:** bestaand GA4 `nutrition_dagboek_maaltijd_geopend` krijgt `buiten_patroon` (boolean): hoe vaak iemand toch een maaltijd buiten het patroon invult. Hoog = het patroon klopt niet of mensen wisselen; dan de compacte regel heroverwegen.

**Afgewezen:** de maaltijd buiten je patroon helemaal verbergen in het dagboek. Dan kun je een uitzonderingsontbijt niet meer kwijt.

## Afgewezen

- **Alleen "niet gegeten" per dag**: flexibel, maar wie periodiek vast moet dan elke dag tikken.
- **Drie losse vinkjes** in Je doelen: de bestaande keuzesheet kent één keuze; vaste combinaties zijn één tik en dekken de praktijk.
