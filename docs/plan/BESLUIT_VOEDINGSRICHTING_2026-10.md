# Besluit: richting van je voeding (NUT_DOEL) in Je doelen, naast het concrete doel

- **Datum:** 7 oktober 2026
- **Status:** besloten (Dennis: "twee lagen, één plek"), gebouwd op `feat/voedingsrichting`
- **Wijkt af van:** `ROADMAP_LEEFSTIJLCHECK_NAAR_DASHBOARD_VOEDING.md` §10.1 (3 sep), dat `NUT_DOEL` als vraag in de leefstijlcheck zette

## Aanleiding

Dennis wilde weten waarom iemand het dashboard gebruikt ("behoefte van het dashboard, ook goed voor feedback en data"). `NUT_DOEL` beantwoordt dat, maar stond gepland als nieuwe vraag in de leefstijlcheck. Nieuwe check-vragen betekenen een `RULES_VERSION`-ophoging en een andere schaal voor de voedingsscore; volgens de roadmap is dat de duurste stap.

Er bestaat al een concreet voedingsdoel: het ijkpunt uit de voedingscheck (`domain_goal`, situatie + 0–10, bv. "Elke maaltijd iets stevigs binnenkrijgen"). Twee losse "voedingsdoelen" op twee plekken zou verwarren.

## Besluiten

1. **Twee lagen op één plek: Je doelen → Voeding.**
   - **Richting** (`NUT_DOEL`): energie overdag · gewicht omlaag · spier en kracht behouden · algemeen gezonder · klachten verminderen · weet ik nog niet. Nieuw, in Je doelen.
   - **Concreet doel**: het bestaande ijkpunt uit de check, hier zichtbaar en bewerkbaar met dezelfde editor als op Kompas (`useDomainGoalEditor`, surface `doelen`). Geen tweede ijkpunt-structuur.
   - **Eetpatroon** (bestond al) staat in dezelfde sectie.
2. **De richting kadert, meet niet.** Alleen de volgorde van de kernstoffen in Patroon (Per stof, Trend, Alles samen) en één zin waarom. Nooit de meting, de norm of "gehaald".
3. **Alleen voorrang met een EU-claim** (Verordening 432/2012):
   - spier → eiwit, vitamine D ("behoud van spiermassa", "normale spierfunctie");
   - gewicht → eiwit ("behoud van spiermassa");
   - energie → magnesium ("vermindering van vermoeidheid en moeheid");
   - gezonder / weet ik nog niet → neutrale volgorde.
4. **Klachten = doorverwijs-uitgang** (zoals §10.2): neutrale volgorde en de zin "Dit dashboard beoordeelt geen klachten. Bespreek ze met je huisarts of een diëtist."
5. **Niet in de leefstijlcheck.** Geen `RULES_VERSION`-wijziging, geen nieuwe domeinschaal. De medicatie-optie van `NUT_CONTEXT` blijft gepland in de check, omdat die een doorverwijzing triggert. Voedingswijze staat al in Je doelen (kernstofprofiel); periodiek vasten is het eetpatroon (`BESLUIT_EETPATROON_OVERGESLAGEN_2026-10.md`).

## Opslag

`account_voedingsdoelen.voedingsrichting text` (migratie `20261007150000_voedingsrichting.sql`, migratie-eerst naar main). Enum, nooit vrije tekst.

## Meting

- Domain event `nutrition.voedingsrichting_gekozen` {richting, surface}, de durable bron voor "waarom gebruikt iemand dit".
- GA4 `voedingsdoel_aangepast` met `setting: "voedingsrichting"` (bestaand).
- Concreet doel: bestaande `dashboard_kompas_doel_click` met `surface: "doelen"`.

## Afgewezen

- **De zes concrete situaties vervangen door de NUT_DOEL-opties**: verliest de concrete gedragsdoelen die met 0–10 gemeten worden.
- **Alleen het bestaande concrete doel de volgorde laten kiezen**: "gewicht omlaag" en "spier behouden" bestaan dan niet.
- **NUT_DOEL in de leefstijlcheck** (oorspronkelijk plan): duurste stap, raakt de score-schaal.
