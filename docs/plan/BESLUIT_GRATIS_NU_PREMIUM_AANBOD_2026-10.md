# Besluit: gratis nu, premium als volgende stap (opbouw per product, premiumactie, meetpunten)

**Datum:** 8 oktober 2026
**Status:** Besloten (Dennis, 8 okt: §1–3 akkoord; §4 akkoord, de prijs mag nog bijgesteld worden; betaalprovider **Stripe**). Plak 1 gebouwd (#186 plaatsing, #187 inhoud van het blok).
**Antwoord op:** `PROMPT_GRATIS_NU_PREMIUM_AANBOD_2026-10.md`
**Bouwt voort op:** `BESLUIT_PATROON_PREMIUM_EN_WEEKMAIL_2026-10.md` (wat gratis en premium is: niet opnieuw besproken), `BESLUIT_GIDS_SLUGS_EN_VOEDING_2026-10.md`, `CORRECTIE_VOEDINGCHECK_NAAMGEVING_2026-09.md` (de check heet "Wat mis je?"), `docs/core/STEPPED_CARE_MODEL.md`, `ARCHITECTUUR_ECOSYSTEEM_CONTENTGRAAF_2026-09.md` (nooit twee checks als gelijkwaardige primaire CTA)

## 1. Waar we de concurrentie voorblijven

| Wie | Wat ze doen | Waar wij anders zijn |
|---|---|---|
| Mijn Eetmeter (Voedingscentrum) | Gratis, officieel, telt wat je eet | Wij tellen niet om te tellen: thema → stof → maaltijd ("je ontbijt draagt je magnesium niet") |
| Cronometer, MyFitnessPal | Veel stoffen, Engelstalig, calorie- en US-norm-gericht | NL-normen per persoon (hoogste officiële), NEVO, en betekenis per thema (slaap, stress, energie) |
| Supplementwinkels en -sites | Verkopen eerst | Voeding eerst; een supplementvergelijking pas na een patroon van 30 dagen. Dat maakt `/beste/*` geloofwaardig |

**Gevolg:** het gratis deel moet Mijn Eetmeter verslaan op *betekenis*, niet op volume. Premium verkoopt het verband over tijd (welke maaltijd draagt welke stof), niet meer telfuncties. Dat verband heeft niemand, en het vraagt data die alleen bij ons ontstaat.

## 2. Eén verhaal over de hele lijn: weten wat er is

Voeding werkt op twee tijdschalen. Elk product benoemt beide en wijst naar de volgende trede.

| Product | Belofte | Vandaag | Over weken | Volgende stap |
|---|---|---|---|---|
| Webgids | "Dit speelt mee, en voeding stuur je zelf" | Timing, cafeïne, eiwit bij ontbijt | Stoffen die zich optellen | De check |
| Check "Wat mis je?" | Een eerste inschatting uit hoe vaak je iets eet | n.v.t. | Een schatting | Een week bijhouden |
| Dagboek (gratis) | Wat je at, vandaag en 7 dagen | **De dagelijkse haak**: iets wat je vandaag kunt doen | Je patroon over 7 dagen | Premium, na 5 van 7 dagen |
| Premium | Je patroon over 30 tot 90 dagen, per maaltijd, met voorstellen | n.v.t. | Weken tot maanden | Pas bij 30 dagen: de supplementvergelijking |

Waarom mensen het dagelijks willen doen: niet om het weekgetal, maar omdat het dagboek vandaag iets teruggeeft (bijvoorbeeld de marge tussen je laatste maaltijd en bedtijd, of eiwit bij je ontbijt). De week is de beloning, de dag is de gewoonte.

## 3. Opbouw per webgids (plak 1, gebouwd)

**Volgorde:** hero → inhoudsopgave → herkenning → **voedingsblok** → wat er verandert (mechanisme) → overige leefstijlsecties → supplementen (`/beste/*`) → aanpak → verder lezen → veelgestelde vragen → bronnen.

**Het voedingsblok (`GuideNutritionZoom`):**

1. Leefstijlfactoren als chips (bestond al).
2. **Vandaag: wat je meteen merkt.** Twee kaarten per gids, alleen dingen die je vandaag doet (op tijd eten rond 18 à 19 uur, cafeïne, eiwit bij je ontbijt, koolhydraten rond inspanning).
3. **Over weken: wat zich optelt.** Eén alinea plus drie stoffen per gids. Alleen stoffen die een dagboek kan aantonen: **geen zink of vitamine D als stof-chip** (`NIET_BEWIJSBAAR`).
4. **De ladder, één knop.** Drie treden zichtbaar (check · een week bijhouden · je patroon over tijd, premium) en één knop: de check. Geen tweede gelijkwaardige CTA, geen prijs in de gids.

**Copy:** "waar je voeding tekortschiet" is "wat er op je bord ontbreekt" geworden. Nooit "tekort".

**Supplementsecties blijven staan**: de affiliate-links zijn de monetisatie. Ze staan nu wel ná voeding, zoals de stappenzorg vraagt.

## 4. De premiumactie

- **Wat:** "Je patroon over tijd", met de inhoud uit `BESLUIT_PATROON_PREMIUM_EN_WEEKMAIL_2026-10.md` §2.
- **Moment:** pas als iemand **5 van de 7 dagen** heeft ingevuld. Niet in de gids, niet op de check-uitslag en niet bij registratie: daar heeft het product zijn waarde nog niet laten zien. De drempel ligt hoger dan de 3 dagen van de weekmail, omdat het aanbod een gewoonte moet bevestigen, geen begin. Plek: Je patroon (bij de periodekiezer boven 7 dagen) en het weekoverzicht achter de login.
- **Proef: 30 dagen premium gratis, zonder betaalgegevens, zonder automatische verlenging.**
  - **Waarom 30 dagen:** het verband per maaltijd en de supplementuitgang vragen 30 dagen data. Aan het einde van de proef staat iemands *eerste eigen 30-dagenpatroon* er. Het betaalmoment valt dan op het moment van de grootste waarde, niet op dag 1.
  - **Na de proef wordt niets weggenomen wat iemand zelf invoerde.** Je ziet weer 7 dagen, met een teaser die zegt wat er in je 30-dagenpatroon klaarstaat (aantal bevindingen, geen inhoud).
- **Prijs (startpunt, bij te stellen op de prijsvraag van plak 6):** **€49 per jaar** (sluit aan op "Plus €49" uit de juli-lijn) of **€5,95 per maand**. Wie tijdens de proef kiest, betaalt het eerste jaar **€39**. De natuurlijke deadline is het einde van de eigen proef; geen afteltimers.
- **Betalen: Stripe** (Dennis, 8 okt). Er is nog geen betaalsysteem (`entitlement-access.ts`, `DARK_LAUNCH`). Stripe Billing levert een proef zonder kaart, een klantportaal (opzeggen en wisselen) en facturen standaard; Mollie zou die zelf bouwen vragen (abonnement via een eerste betaling met SEPA-machtiging). iDEAL gaat op in Wero; dat is een betaalmethode, geen provider. **Tot de bouw van plak 6** eindigt de proef in een prijsvraag via de bestaande route `/api/account/waitlist` (`premium.price_indicated`, `premium.waitlist_joined`). Zo valideren we de prijs voordat we betaling bouwen.

## 5. Meetpunten per stap

| Stap | Event | Laag | Status |
|---|---|---|---|
| Gids → check | `intake_cta_clicked` {locatie `gids-<thema>-voeding-zoom`} | GA4 + Clarity | Bestaat. Effect van plak 1: klikratio per gidspagina vóór en na de deploy |
| Check → dagboek | `nutrition_result_dagboek_click` | GA4 + Clarity | Bestaat |
| Gewoonte | dagen ingevuld in de eerste 7 dagen (afgeleid uit het dagboek) + `weekoverzicht_*` | domain_event | Weekoverzicht gepland (weekmail-besluit) |
| Aanbod | `premium.trial_offered` {dagen_ingevuld} | domain_event | Nieuw, plak 5 |
| Proef | `premium.trial_started`, `premium.trial_ended` {keuze: betaald\|wachtlijst\|niets} | domain_event | Nieuw, plak 5–6 |
| Prijs | `premium.price_indicated`, `premium.waitlist_joined` | domain_event | Bestaan |

**Noordster:** het aandeel check-doeners met ≥5 ingevulde dagen in de eerste 7 dagen (gewoonte), en daarna het aandeel proefnemers dat kiest.

## 6. Plakken

1. **Webgidsen: volgorde, twee tijdschalen, ladder.** Gebouwd: de plaatsing direct na de herkenning in #186, de twee tijdschalen en de ladder in #187.
2. **Check-uitslag: de tweede trede expliciet.** Eén regel "houd het een week bij, dan zie je wat er is" met het bestaande dagboek-meetpunt (nieuwe `surface`).
3. **Weekmail** (ligt vast in het weekmail-besluit, plak 1 daar; vraagt een migratie).
4. **De dagelijkse haak in het dagboek** (bijvoorbeeld de marge tussen laatste maaltijd en bedtijd). Eerst nagaan welke tijden het dagboek vastlegt.
5. **De premiumgrens plus de proef-entitlement** (30 dagen, zonder betaling) op `account_entitlements`, met het aanbod bij 5 van 7 dagen.
6. **Einde van de proef:** prijsvraag/wachtlijst; daarna Mollie (besluit Dennis).

## Afgewezen

- **Een proef bij registratie of direct na de check:** de waarde (een eigen patroon) bestaat dan nog niet, en de proef loopt leeg.
- **Een proef van 7 dagen:** te kort voor een patroon over 30 dagen; je verkoopt iets wat de gebruiker nog niet heeft gezien.
- **Premium of een prijs in de gids of op de check-uitslag:** te vroeg, en het onderbreekt de gratis stap. De gids noemt premium alleen als derde trede.
- **Een tweede knop in de gids naar het dagboek:** het dagboek vraagt een sessie uit de check, en twee gelijkwaardige CTA's zijn uitgesloten (contentgraaf).
- **Een lifetime-deal of afteltimers:** past niet bij de positionering "Consumentenbond van supplementen".
- **Zink en vitamine D als stof die je in een week ziet:** een dagboek kan ze niet aantonen (`NIET_BEWIJSBAAR`).

## Open

- **Stripe inrichten (plak 6):** account, btw en voorwaarden (Dennis), en vóór de bouw de actuele tarieven voor iDEAL/Wero, SEPA en Billing vastleggen. Afgewezen: Mollie, omdat de proef zonder kaart, het portaal en de facturen dan eigen bouw worden.
- **Nurture-hoofdreeks herschrijven op "Wat mis je?"** (Dennis, 8 okt: na dit besluit, niet ervoor). De reeks dag 0–30 (`src/data/nurture-content.ts`, `src/lib/email-templates/nurture/*`) is geschreven voor de brede Leefstijlcheck: profiellabels, domeinscores en "je deed de Leefstijlcheck". Hij wordt alleen ingepland vanuit `/api/intake/session` (de brede check), dus een "Wat mis je?"-gebruiker krijgt hem niet. Er zijn geen actieve ontvangers. Herschrijven als voedingsreeks die past bij de ladder check → week → premium, en vanuit de check zelf inplannen. Daarbij meenemen: de profiel-links in `helpers.ts` (`PROFILE_URLS`, "Herlees je profiel →") en `nurture-content.ts` (Overtrainer dag 0) wijzen naar `/profiel/*`, die sinds PR #190 met een 301 naar de gidsen gaan; de recovery-link "Bekijk je leefstijl-overzicht" landt op `/intake?resultaten=true` (de voedingsuitslag). Zie `BESLUIT_PROFIELEN_NAAR_VOEDINGSGIDSEN_2026-10.md`.
- **Een klachtenanalyse van de concurrenten** (wens van Dennis, 8 okt; in een eigen sessie): zie `PROMPT_CONCURRENTIE_KLACHTEN_2026-10.md`.
