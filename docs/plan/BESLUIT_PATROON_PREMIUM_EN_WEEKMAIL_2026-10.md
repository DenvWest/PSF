# Besluit: wat in Je patroon gratis is en wat premium, en een weekmail zonder gegevens

**Datum:** 7 oktober 2026
**Status:** Besloten (Dennis: "precies mijn gedachte, leg vast"). Nog niet gebouwd.
**Bouwt voort op:** `BESLUIT_PATROON_PER_MAALTIJD_2026-10.md` (herziening 7 okt), `BESLUIT_PATROON_STOF_EN_TREND_2026-10.md`, `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md`, gating-lijn "check-in gratis, verdieping premium" (`PLAN_LEEFSTIJLCHECK_UITVOERING.md`, 11 jul)
**Raakt:** `src/components/dashboard/patroon/`, `src/lib/entitlement-access.ts`, nurture/e-mail (`docs/core/EMAIL_SYSTEM.md`)

## Aanleiding

Dennis' vragen bij Per maaltijd:

1. Per maaltijd laat vooral zien wat je in een paar dagen at. Is dat slim om zo te houden? Laat premium de tekorten over langere tijd zien? En advies over voeding en supplementen?
2. Is een persoonlijke nurture-mail slim, met een rapport over wat iemand in 7 dagen at? Alleen voor premium?

## Besluiten

### 1. "Wat je at" blijft de basis, de slimme laag is het verband over tijd

- **Wat je at blijft staan.** Het maakt de getallen controleerbaar: je ziet waar je eiwit vandaan kwam. Met twee dagen data valt er meer niet eerlijk te zeggen.
- **De slimme laag is een patroon per maaltijd over tijd.** Bijvoorbeeld: "je ontbijt levert op 9 van 12 keer minder dan 10% van je magnesiumnorm; je avondeten draagt het". Die zin bouwt op wat er al is: de bevinding in Per stof en de waarom-regels in Trend (`nutrition-stof-trend.ts`). Wat nog ontbreekt is de koppeling per maaltijd.
- **Een minimum aan data** voordat er een patroonzin verschijnt. Daaronder staat de zin "na 7 dagen met je drie hoofdmaaltijden zie je hier een patroon". Een maaltijd die vaak ontbreekt, levert geen uitspraak (asymmetrie-regel).

### 2. Gratis en premium in Je patroon

| Gratis | Premium |
|---|---|
| Vandaag en 7 dagen | 30 tot 90 dagen, en zelf kiezen |
| Wat je at, de norm per stof, je eigen doel, een tik op een stof of product | Patroon per maaltijd over tijd: welke maaltijd draagt welke stof, met trend |
| De sterkste bijdragen van een maaltijd | Voorstellen in voeding: "met X bij je ontbijt kom je op Y% van je norm" |
| | De vergelijking met eerdere weken |

Dit volgt de bestaande lijn: de check-in (data en registratie) is gratis, de verdieping (betekenis over tijd en een plan) is premium. Registreren en de eigen getallen inzien zijn nooit gegated: iemand moet altijd zien wat hij zelf invoerde.

### 3. Supplementadvies: alleen als tweede stap, binnen de bestaande regels

- Eerst voeding, daarna pas een supplementvergelijking (stappenzorg, `STEPPED_CARE_MODEL.md`).
- Alleen bij een patroon over **minstens 30 dagen** op volledige dagen (ontbijt, lunch en avondeten).
- Alleen voor kernstoffen die een dagboek kan aantonen: **niet zink en vitamine D** (`NIET_BEWIJSBAAR`).
- Nooit "je hebt een tekort" of "je hebt een supplement nodig". Een inname onder de norm is geen tekort; dat stelt een arts vast.
- De uitgang is het stof-detail naar `/beste/*`, met het bestaande meetpunt `nutrition_week_nutrient_clicked`. `/beste/*` is een logisch vervolg, geen verkooppraatje.

### 4. Weekmail: wel, maar zonder voedingsgegevens in de mail

- **De mail meldt alleen dat het overzicht klaarstaat:** "Je weekoverzicht staat klaar · 5 van 7 dagen ingevuld", met een link naar het rapport achter de login. **Geen stoffen, geen producten, geen percentages, geen maaltijden** in de mail of de onderwerpregel.
  - **Waarom:** voedingsgegevens zijn art. 9-gegevens (`ARCHITECTUUR_CONVERSATIONELE_VOEDINGSINVOER_2026-09.md` C1, `PLAN_FUNNEL_DATA_PRIORITY.md`). Een rapport in de mail laat ze het platform verlaten, via Resend en via inboxen die gedeeld of doorgestuurd worden. Het aantal ingevulde dagen gaat over gebruik, niet over gezondheid.
- **Gratis.** De mail is er voor retentie: hij moet mensen terugbrengen naar het dagboek. Het rapport achter de link volgt de verdeling van §2: 7 dagen gratis, de vergelijking en het verband per maaltijd premium.
- **Een eigen opt-in** ("weekoverzicht per mail"), los van `marketing_email` en los van de hoofd-nurture (één hoofd-nurture per adres, `EMAIL_SYSTEM.md`). Afmelden met één klik. De voorkeur staat bij het account.
- **Pas sturen vanaf minstens 3 ingevulde dagen** in de week. Anders lees je ruis als patroon. Zonder 3 dagen gaat er geen mail; een "je hebt niets ingevuld"-mail is er niet.
- **Geen LLM** in de mail of het rapport. Het rapport is regelgebaseerd en hergebruikt de bestaande rekenpaden (`nutrition-stof-meting.ts`, `nutrition-maaltijd-patroon.ts`).

## Afgewezen

- **Het rapport in de mail zelf** (stoffen, percentages, maaltijden): art. 9-gegevens buiten het platform. Zie §4.
- **De weekmail alleen voor premium:** de mail is het retentie-instrument dat juist gratis gebruikers terugbrengt. Wat premium is, is de diepte van het rapport, niet de herinnering.
- **Een supplementadvies op basis van 7 dagen:** te weinig data, en het botst met de asymmetrie-regel en met voeding eerst.
- **Een weekscore of een cijfer voor de week:** een tweede score is verboden (lock "minuten = evidence, nooit een tweede score"; `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md`, geen weekscore als percentage).

## Volgorde van bouwen

1. **Weekmail.** De opt-in, een mail zonder gegevens, de cron met een drempel van 3 dagen, en de link naar het bestaande Je patroon (7 dagen). Het kleinst, met het meeste effect op retentie. Vraagt een migratie voor de opt-invoorkeur (blok in `OPENSTAAND.md`).
2. **De premium-grens in Je patroon.** De periodekiezer boven 7 dagen en de vergelijking met eerdere weken achter `entitlement-access.ts`. Met een teaser, geen lege pagina.
3. **Het patroon per maaltijd over tijd**, met de zin uit §1 en de voedingsvoorstellen.
4. **De supplementuitgang bij een 30-dagenpatroon** (§3). Die bestaat grotendeels al in het stof-detail; het gaat om de voorwaarde van 30 dagen.

## Meting

- `weekoverzicht_optin` {aan|uit, surface}: domain_event.
- `weekoverzicht_mail_verstuurd` {dagen_ingevuld}: domain_event, zonder inhoud.
- `weekoverzicht_geopend` {bron: mail|app}: openen vanuit de mail.
- **Retentiemaat:** opnieuw in het dagboek invullen binnen 7 dagen na `weekoverzicht_geopend`.
- **Premium-grens:** `nutrition_patroon_periode_gekozen` met `periode` boven 7 dagen bij een gratis account, plus een teaser-klik naar premium.

## Open

- De naam en de prijs van premium voor voeding ("Plus €49 = meting-verdieping" stond in de juli-lijn). Die keuze valt bij plak 2.
- De verzenddag en het tijdstip van de weekmail (voorstel: maandagochtend, over de week van maandag tot en met zondag).
