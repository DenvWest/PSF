# Besluit — Doelen als lijst, Vergelijk naar het zoekscherm (en waarom Voeding géén eigen pagina werd)

**Datum:** 5 oktober 2026
**Status:** besloten (Dennis, 5 okt: "Akkoord met A en B", daarna bijgesteld: "voedingsstoffen en macro's naast vandaag vind ik eigenlijk wel mooi")
**Raakt:** het dagboek (tabrij, zoekscherm), `/dashboard/doelen`
**Bouwt voort op:** `BESLUIT_ONDERBALK_DRIE_TABS_2026-10.md`, `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` (Laag B, §1, §4), `BESLUIT_DOELEN_VERBONDEN_2026-10.md`

## Aanleiding

In het dagboek stond één rij met drie tabs (Vandaag · Voedingsstoffen · Macro's) en rechts de knop "Vergelijk producten". Op mobiel was dat druk. Het Doelen-scherm was een lang formulier met zes losse Opslaan-knoppen. Dennis stuurde Yazio als voorbeeld: Doelen als lijst (label links, waarde rechts), aanpassen in een klein venster.

## Besluit

1. **De tabs Vandaag · Voedingsstoffen · Macro's blijven in het dagboek.** Laag B van het macro-besluit blijft dus ongewijzigd, en daarmee ook "geen Voeding-item in Meer" (§1).
2. **"Vergelijk producten" verhuist naar het zoekscherm** (het scherm achter "+ Toevoegen"), rechts naast de titel. Je vergelijkt op het moment dat je kiest wat je toevoegt. Terug brengt je naar hetzelfde zoekscherm, met hetzelfde eetmoment. De ingang vanuit "Rijkste bronnen" blijft.
3. **Je doelen wordt een lijst**: Je lichaam (gewicht, training) · Eiwit (richtlijn + eigen doel) · Calorieën en macro's · Wat je volgt. Tikken op een regel opent een paneel van onderen met één getalveld (− en +) of een keuzelijst, en één Opslaan-knop. Opslag, validatie en de regels uit het macro-besluit (§4: niets vooringevuld) blijven gelijk.

## Overwogen en teruggedraaid

- **Voedingsstoffen en Macro's als eigen pagina `/dashboard/voeding` onder Meer** (gebouwd als PR #137, niet gemerged). Het dagboek zou dan alleen invullen zijn. Dennis vond de tabs naast Vandaag bij nader inzien mooier: je ziet je dag en de cijfers op één plek. Met de tabs in het dagboek zou een Voeding-item in Meer dubbelop zijn (macro-besluit §1), dus dat vervalt ook.

## Afgewezen

- **Een draaiwiel voor getallen** (zoals in Yazio). Werkt stroef in een browser. Een getalveld opent het numerieke toetsenbord; − en + doen de kleine stappen.
- **Een venster midden op het scherm.** Een paneel van onderen bestaat al in het dashboard en zit dichter bij je duim.
- **Vergelijk onder Meer of in Keuze.** Meer is voor plekken, niet voor een actie halverwege het invullen. Keuze gaat over supplementen; de vergelijking gaat over wat je eet.

## Meetpunten

- `nutrition_dagboek_vergelijk_geopend` met `surface: "zoekscherm"`: hoe vaak er vanuit het zoekscherm wordt vergeleken.
- `doelen_regel_geopend` (per setting), `voedingsdoel_aangepast`, `macro_doel_aangepast`.
