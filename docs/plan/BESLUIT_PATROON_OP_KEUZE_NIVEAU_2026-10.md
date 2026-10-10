# Besluit: Je patroon krijgt de opbouw van Keuze (stofchips, hero, kaarten)

**Datum:** 10 oktober 2026
**Status:** Besloten (Dennis: "akkoord, ik vertrouw jou"). Plak 1 gebouwd.
**Bouwt voort op:** `BESLUIT_PATROON_STOF_EN_TREND_2026-10.md`, `BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`, `BESLUIT_PATROON_PREMIUM_EN_WEEKMAIL_2026-10.md` (gratis 7 dagen, premium 30–90: ongewijzigd), `BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`

## Aanleiding

Dennis: Keuze is mooier en gebruiksvriendelijker dan Patroon, en bij eiwit wil je alle micro's met balken kunnen zien en zelf kunnen kiezen welke er staan, ook als er stoffen bijkomen.

## Besluiten

1. **Eén stof tegelijk, zoals Keuze.** Per stof begint met stofchips (Overzicht · kernstoffen · gevolgde stoffen) met een stip voor de stand (sage gehaald, terra onder de norm, grijs niet te meten). "+ Stoffen kiezen" opent de bestaande `GevolgdeStoffenKiezer`: dezelfde opslag, geen tweede kiezer.
2. **Hero per stof** (`PatroonStofHero`): stand in woorden, één zin, balk met normstreep. "Onder je norm", nooit "tekort".
3. **De hero is een eigen component, geen uittreksel uit Keuze.** `StofHero` in Keuze hangt aan de Keuze-stand (supplement erbij, bovengrens). Patroon deelt de visuele taal (`--vd-*`, dezelfde vormen), niet de code.
4. **De tabel blijft** als Overzicht. De losse "+ Stof toevoegen"-knop onderaan is vervallen; de kiezer zit in de chiprij. De terugknop in het detail is vervangen door de chip Overzicht.
5. **Gratis blijft 7 dagen.** Een voorstel van 14 dagen gratis is afgewezen: premium verkoopt het verband over tijd (30–90 dagen).

## Volgorde

1. Per stof (gebouwd). 2. Per maaltijd en Trend in dezelfde kaartstijl. 3. Knop "Bekijk <stof> in je patroon" op de stofkaart in Keuze, die naar Patroon › Per stof met die stof opent (`leesPatroonUrl` kent `stof=` al).

## Niet gedaan

- Het verbergen van kernstoffen (voorkeur van de Trend-tab) is niet gekoppeld aan de chips; alle kernstoffen staan als chip.

**Meting:** ongewijzigd: `nutrition_patroon_stof_geopend`, `nutrition_patroon_gevolgd_toevoegen_open`, `nutrition_patroon_nutrient_toggle`. Een chiptik is dezelfde actie als een tik op een rij.
