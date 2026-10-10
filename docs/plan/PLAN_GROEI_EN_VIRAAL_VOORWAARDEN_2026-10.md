# Plan: wat er staat voordat we groeien (traffic, makers, "viraal")

- **Datum:** 10 oktober 2026
- **Status:** voorstel, nog niet besloten. Dennis beslist per fase.
- **Voor:** Dennis (eigenaar). Dit is een beslis- en stappenplan, geen juridisch of fiscaal advies: alles met ⚖️ eerst laten toetsen.
- **Bouwt voort op:** `BESLUIT_AFFILIATE_VERVOLG_2026-10.md`, `ARCHITECTUUR_AFFILIATE_AUTOMATISERING.md`, `BESLUIT_GRATIS_NU_PREMIUM_AANBOD_2026-10.md`, `WERKLIJST_B3_PRODUCTDATA_2026-10.md`.
- **Legenda:** `[FEIT]` uit repo of portaal, `[AANNAME]` mijn inschatting, `UNKNOWN` vraagt jouw antwoord of een controle.

## 0. Samenvatting

Groei zetten we pas aan als vijf dingen kloppen: (1) wat je aanbeveelt is aantoonbaar betrouwbaar, (2) elke klik en elke euro is traceerbaar, (3) je eigen affiliate-programma kan uitbetalen, (4) zakelijk en juridisch staat het, (5) de site houdt een piek aan. Nu staat (1) voor de helft (poort in de DB, data van 25 producten nog niet), (2) en (3) deels (grootboek en cookie bestaan, uitbetalen en onboarding niet), (4) is `UNKNOWN`, (5) is niet getest.

Aanbeveling: **eerst een nulmeting en de fundering (fase 0–2, ± 6–8 weken), dan een kleine proef met 3–5 makers (fase 4), pas daarna opschalen.** "Viraal" is geen plan, het is een uitkomst; het plan is dat een piek je niet breekt en niets kost dat je niet kunt uitbetalen of verantwoorden.

## 1. Poorten vóór opschalen (go/no-go)

Elke poort heeft een meetbaar criterium. Niet doorgaan naar fase 5 zonder alle groene vinkjes.

| # | Poort | Criterium | Nu |
|---|---|---|---|
| P1 | Productdata klopt | Alle live producten halen de publiceerpoort (`sup_publish_gate_failures` leeg) | 0/25 (werklijst B-3) |
| P2 | Prijzen vers | Geen actieve aanbieding met prijs > 30 dagen; signaal bij 23+ | 8 verouderd |
| P3 | Klik traceerbaar | Elke uitgaande affiliate-klik loopt via `/go/[offerId]` met token en herkomst (B-1/B-8) | niet gebouwd |
| P4 | Omzet meetbaar | Conversies komen binnen (handmatig/CSV of adapter) en één maand reconciliatie met het partnerportaal wijkt < afgesproken marge af | `pd_conversions` leeg |
| P5 | Contracten en regels | Per actieve partner een contract en commissieregel in PartnerDesk; signaal "actieve partner zonder regel" is leeg | Vitaminstore/Arctic Blue zonder regel |
| P6 | Eigen programma kan uitbetalen | Onboarding (IBAN, BTW/KVK, land, voorwaarden-akkoord), uitbetalingsbatch, boekhoud-export getest met een echte testuitbetaling | tabellen bestaan; onboarding en test niet |
| P7 | Zakelijk en fiscaal | Zie §3 | `UNKNOWN` |
| P8 | Juridisch/compliance | Partnervoorwaarden, claims-richtlijn voor makers, reclamecode-melding, privacy (verwerkers, DPIA-status) ⚖️ | deels (DPIA wacht op jurist) |
| P9 | Schaal | Belastingtest van de kernroutes, rate limiter niet alleen in-memory, monitoring en alarmen aan | niet getest |
| P10 | Aanbod | Genoeg producten in de categorieën waar de makers over praten (zie §4) | 7 categorieën, 25 producten |

## 2. Stappenplan

**Fase 0, nulmeting (week 1–2).**
- GA4: sessies, bronnen, toppagina's, intake-start→afronding laatste 30 dagen (Dennis levert, `UNKNOWN`). Zonder dit weet je niet wat een maker moet oplossen.
- Daisycon: media-beschrijving herschrijven en herbeoordeling vragen; campagneaanmeldingen controleren.
- Bank en bedrijf: stand van zaken inventariseren (§3).

**Fase 1, fundering van het aanbod (week 1–4).** Afmaken wat open staat:
- B-2 prijsverval (7 dagen termijn + signaal), B-3 data van de 25 producten (afbeelding-notitie, bron, 8 prijzen, 2 losse producten).
- Bulkstap afbeeldingen (#254) en kolom "Poort" in de productlijst.
- Commissie compleet: regel voor Vitaminstore en Arctic Blue, full-sync-bug (omzetsignalen), signaal "actieve partner zonder regel".

**Fase 2, traceerbaar maken (week 3–8).**
- `/go/[offerId]` met token en `source_surface`, `sup_offers` als enige URL-bron (B-1/B-8); eerst bevestigen bij Daisycon dat een doorstuurroute is toegestaan (art. 2.12/2.14).
- Conversie-inname (handmatig/CSV; Daisycon-adapter pas als het kanaal werkt; Arctic Blue uit het dashboard).
- Omzetscherm in PartnerDesk (B-4), met revshare als type.
- Reconciliatie: één maand tegen het partnerportaal.

**Fase 3, eigen affiliate-programma uitbetalingsklaar (week 5–10).**
- Onboardingvelden (IBAN, BTW/KVK, land, adres) en `terms_accepted_at`/`terms_version` (zie analyse §9–10).
- Partnervoorwaarden (checklist uit het Daisycon-voorwaardenonderzoek) ⚖️.
- Uitbetalingsbatch en `af_financial_events`-outbox naar boekhouding; test met één echte uitbetaling.
- Fraude- en kwaliteitscontrole (zelfklikken, dubbele leads, geblokkeerde bronnen).

**Fase 4, pilot met makers/clipping (week 8–14).** 3–5 makers, eigen link in de bio, betaald per afgeronde intake, handmatige uitbetaling. Vooraf: goedgekeurd materiaal en claims-richtlijn (volgt `WRITING_VOICE.md`), vermelding samenwerking, budgetplafond, beëindigingsrecht. Meetpunt: kosten per afgeronde intake, aandeel dat doorgaat naar dagboek/premium.

**Fase 5, opschalen.** Pas bij alle poorten groen, na de pilot. Dan pas budget omhoog, meer makers, een partnerportaal. Besluit via een eigen document.

## 3. Zakelijk, bank en betalingen ("denk breed")

Dit is waar `UNKNOWN` het grootst is. Per punt de vraag en de aanbeveling; fiscale details ⚖️ met een boekhouder.

| Onderwerp | Wat eerst | Aanbeveling |
|---|---|---|
| Rechtsvorm en KVK | Welke vorm heb je nu (eenmanszaak, BV)? `UNKNOWN` | Bij uitbetalingen aan derden, premium en aansprakelijkheid: laat toetsen of een BV of aanvullende verzekering past |
| Zakelijke rekening | Staat er een aparte zakelijke rekening, los van privé? `UNKNOWN` | Ja, vóór de eerste commissie of uitbetaling. Alle affiliate-ontvangsten en -uitbetalingen via dezelfde rekening |
| Boekhouding | Pakket met bankkoppeling; `af_financial_events`-outbox als bron | Koppel pas na de handmatige testuitbetaling; eerst export, geen live bankkoppeling vanuit de app (risico, eigen beheer van sleutels) |
| Btw | Regime (KOR of niet), btw bij commissiefacturen aan netwerken/winkels, btw op premium (Stripe, EU-consumenten) | Boekhouder bevestigt vóór premium live gaat ⚖️ |
| Facturen | Commissiefactuur aan Daisycon/winkels; zelffacturering of factuur van partners voor de uitbetaling | Eén duidelijke regel in de partnervoorwaarden |
| Uitbetalen aan makers | IBAN, BTW/KVK-status per partner, drempel, vaste datum | Handmatige SEPA-batch eerst; geen automatische bankkoppeling in fase 3 |
| Betalingen premium | Stripe (besloten 8 okt) | Account, btw en voorwaarden vóór plak 6; `BESLUIT_GRATIS_NU_PREMIUM_AANBOD_2026-10.md` r.76 noemt nog Mollie, dat is achterhaald: opruimen |
| Verzekering | Beroepsaansprakelijkheid / bedrijfsaansprakelijkheid | Afsluiten vóór makers meerdere duizenden bereiken ⚖️ |
| Voorwaarden en privacy | Algemene voorwaarden, partnervoorwaarden, verwerkers (Supabase, Resend, PostHog, n8n), DPIA-status | Jurist: partnervoorwaarden, claims-richtlijn, DPIA ⚖️ |
| Reclame en claims | Reclamecode social media, KOAG/KAG, EU-claimverordening | Claims-richtlijn voor makers; vermelding samenwerking verplicht |
| NVWA | Alleen relevant bij doorverkoop (buiten scope, zie besluit) | Niets doen zolang je doorverwijst |

## 4. Producten: genoeg, en wat erbij?

**Nu `[FEIT]`:** 7 vergelijkingscategorieën, 25 producten: ashwagandha (3), creatine (3), eiwitpoeder (3), magnesium (3), omega-3 (4), vitamine D (6, incl. D3-K2), zink (3). Daarnaast een supplementgids voor melatonine (geen vergelijking).

**Advies:** niet nu verbreden zolang 24 van de 25 producten de poort niet halen. Dat is dezelfde data-inspanning die elke nieuwe categorie ook kost. Eerst P1/P2, dan per categorie een pilot.

**Kandidaten, op volgorde van waarde `[AANNAME]`, alles eerst toetsen aan EFSA-register en bewijs:**

| Prioriteit | Kandidaat | Waarom | Let op |
|---|---|---|---|
| 1 | **Collageen** | Veel gezocht, hoge commerciële waarde | Volgens mijn kennis geen toegestane EFSA-gezondheidsclaim voor collageen: toetsen. Vergelijk dan op dosis, vorm, derde-partijtest en prijs per dagdosis, met een expliciet "bewijs: beperkt/gemengd" in de stijl van de Consumentenbond. Dat past bij je positionering. |
| 1 | **Melatonine** (slaap) | Past bij je kern (slaap), gids staat er al | Regels voor melatonine in Nederland zijn strikt: eerst verifiëren wat verkocht mag worden voordat je producten vergelijkt ⚖️ |
| 2 | **Vitamine B12 / B-complex**, **ijzer**, **vitamine C**, **foliumzuur** | Micro-nutriënten met duidelijke EFSA-claims en bekende tekorten in sommige groepen | Voeding eerst: de gids moet zeggen wanneer voeding volstaat; ijzer niet zonder reden aanraden |
| 2 | **Selenium, jodium, kalium, calcium** | Aanvullend op de dagboek/nutriëntenlaag | Bovengrenzen en wisselwerking tonen (bestaand principe "bovengrens over alle bronnen") |
| 3 | **Probiotica, curcuma, L-theanine, glycine** | Zoekvolume en aansluiting op slaap/stress | Bewijs per product/stam uiteenlopend: eerst een bewijsbeoordeling |

**Voeding en supplement samen:** ja, en dat is je sterkste lijn: "voeding eerst, supplement als gap-dichter" (bestaand principe in de nurture-/engine-invariant). Elke nieuwe stof krijgt eerst een voedingsroute (NEVO, dagboek), dan pas een supplementvergelijking. Dat onderscheidt je van pure affiliate-sites én helpt bij de Daisycon-eis "meer content".

## 5. Onderzoek: groter en beter onderbouwd

Stap voor stap, niet alles tegelijk:
1. **Publiceer de scoremethodiek** (is al het uitgangspunt van het verdict): hoe score, weging, bronnen, wat niet meetelt (prijs niet in de score). Reproduceerbaar en citeerbaar.
2. **Bewijsbeoordeling per stof** (EFSA, Gezondheidsraad, NNR, Cochrane/meta-analyses), met datum en niveau; zichtbaar op de gids. Dit is je inhoudelijke gracht en bron voor backlinks en pers.
3. **Externe toetsing:** de huisarts (en een diëtist/apotheker) als inhoudelijke reviewer van de gidsen ("inhoudelijk getoetst door"), niet als productaanbeveler of ontvanger van commissie ⚖️ (beroepsregels).
4. **Eigen data (later, AVG-proof):** geaggregeerde, anonieme inzichten uit de Leefstijlcheck (bijv. "wat missen mensen van 30+ het vaakst") als terugkerend rapport. Alleen met een goede DPIA en minimale celgroottes ⚖️.
5. **Geen eigen labtests nu** (staat al als bewuste lijn); eventueel samenwerking met een extern lab later, pas als de omzet het draagt.

## 6. Merkcontacten en pitch: wanneer

Twee sporen met verschillende timing:

- **Nu starten (lange doorlooptijd): winkels voor directe afspraken** (Vitaminstore, VitalNutrition, overige met eigen programma) en **Arctic Blue** (dashboard, materiaal). Doel: eigen tracking, commissie, materiaal, los van Daisycon. Pitch kort: onafhankelijk vergelijkingsplatform, doelgroep 30+, gepubliceerde methodiek, verkeer en klikcijfers (zodra de nulmeting er is), wat jij biedt (eerlijk gerangschikt verkeer naar winkels). Nog zonder grote claims over groei.
- **Pas na 60–90 dagen cijfers: merken/leveranciers** (Solgar, Viridian, Bonusan, Möller's, Minami, enz.). Wat je kunt bieden: vermelding in de vergelijking volgens de methodiek, eerlijke review, geen betaalde positie. Verkoop nooit score of volgorde.

**Spelregels voor elke pitch:** score en volgorde zijn niet te koop; commissie beïnvloedt de rangschikking niet; transparant over affiliate. Dit is ook je kapitaal richting lezers.

**Pitch-onderdelen** (later uitwerken in een eigen document): wie ben je, voor wie, methodiek, bereik (cijfers), wat het merk krijgt, wat het merk níét krijgt, voorgestelde afspraak (tracking, commissie, materiaal), contactpersoon.

## 7. Open vragen voor Dennis

1. Rechtsvorm en stand van de zakelijke rekening, boekhouding en btw-regime (`UNKNOWN`).
2. GA4-cijfers laatste 30 dagen: sessies, bronnen, toppagina's, intake-start/afronding.
3. Is er videomateriaal voor de makers-pilot, of moet dat eerst gemaakt worden?
4. Budget voor jurist/fiscalist (voorwaarden, claims-richtlijn, DPIA, btw).
5. Welke categorie wil je als eerste erbij: collageen, melatonine of een micro-nutriënt?
6. Akkoord om de huisarts als inhoudelijk reviewer te benaderen (niet als aanbeveler)?

## 8. Meetpunten per fase

| Fase | Meetpunt | Waar te lezen |
|---|---|---|
| 0 | Sessies, bronnen, intake-conversie | GA4, `domain_events` |
| 1–2 | Aantal producten dat de poort haalt; klikken via `/go` met herkomst; omzet per partner | `sup_publish_gate_failures`, `sup_clicks`, PartnerDesk-omzet |
| 3 | Testuitbetaling geslaagd; aantal onboardte partners | `af_payouts`, `af_financial_events` |
| 4 | Kosten per afgeronde intake per maker; doorstroom naar dagboek/premium | `af_*`-grootboek, `domain_events` |
| 5 | Piekbelasting, foutpercentage, supportdruk | monitoring, Sentry |
