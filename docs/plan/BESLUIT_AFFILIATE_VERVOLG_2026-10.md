# Besluit: vervolg affiliate (kliktoken en omzet meetbaar)

- **Datum:** 10 oktober 2026
- **Status:** besloten voor B-2 t/m B-8 (akkoord Dennis op de aanbevelingen); B-1 wacht op het Daisycon-portaal
- **Bron:** `AFFILIATE_DASHBOARD_AUDIT_2026-10.md` (Bijlage B) en `PROMPT_VERVOLG_AFFILIATE_KLIKTOKEN_2026-10-09.md`

## Besluiten

| ID | Besluit | Afgewezen |
|---|---|---|
| B-1 | **Open.** (a) tweede subid-parameter als Daisycon die per transactie rapporteert, anders (b) `ws=<token>` met aanpassing van de CLAUDE.md-subid-regel. Dennis verifieert in het portaal en deelt één transactie-export. | (c) geen token voor het netwerk |
| B-2 | Wijziging weigeren voor admin-wijzigingen die de poort breken; 7 dagen termijn + signaal voor tijdsverval (prijs). | Automatisch depubliceren (raakt SEO en omzet zonder menselijke blik) |
| B-3 | De 25 live producten blijven staan; data binnen vaste termijn op orde. Poort is op nieuwe publicaties meteen actief. | Tijdelijk depubliceren |
| B-4 | Upstream-omzetoverzicht in PartnerDesk (`/rapportages` + Vandaag-tegel), conform §G. | Los dashboard |
| B-5 | `sup-backfill`-route verwijderd (zette alle producten op `published` en overschreef adminwerk). `backfillComparisonPage` blijft alleen voor tests. De andere backfill-routes blijven (niet-destructief). | Beperken tot "alleen ontbrekende rijen" |
| B-6 | Alleen PartnerDesk-werk dat omzet meetbaar en correct maakt (audit §18 MUST); rest pas na de bestaande trigger. | Volledige PartnerDesk-uitbouw nu |
| B-7 | Eerst verifiëren bij Vitaminstore of `viridian-bisglycinaat` bij de Solgar-deeplink hoort. | Blind link of product aanpassen |
| B-8 | Herkomst (`sourcePage`) als `source_surface` op `sup_clicks`, samen met de `/go/[offerId]`-redirect. | Kolom op `affiliate_clicks` (niet aanraken); niets doen |

## Volgorde

1. B-5 (gedaan in deze PR), daarna poort als DB-invariant (B-2) en data van de 25 producten (B-3, B-7).
2. Commissie compleet (full-sync-bug, signaal "actieve partner zonder regel", contract + regel voor Vitaminstore en Arctic Blue).
3. Daisycon-transactie-import (eerst een echte export bekijken).
4. `/go/[offerId]` met token (B-1, B-8).
5. Tests en een maand reconciliatie vóór enige omzetclaim richting partners.

## Aanvulling 10 oktober 2026 — scope winkels, directe partners en doorverkoop (B-6)

- **Besloten:** het partnermodel dekt netwerk-winkels (Daisycon e.a.), directe affiliate (`sup_retailers.relationship = 'direct'`) en directe leveranciers die zelf verkopen (als retailer van het type `direct`). Nieuwe winkels zijn data in PartnerDesk, geen code.
- **Afgewezen / buiten scope:** **doorverkoop** (zelf verkopen, orders, voorraad). Ander bedrijfsmodel (NVWA-registratie, productaansprakelijkheid, consumentenrecht, btw) en botst met de onafhankelijke positionering. Heroverwegen alleen met een juridische toets en een eigen besluitdocument.
- **Kanttekening:** een merk als partner zonder winkel past niet in `sup_offers` (elke aanbieding hangt aan een retailer).

## Aanvulling 10 oktober 2026 — "beste winkel voor jouw keuze" (latere fase)

- **Besloten (akkoord Dennis):** een winkelvergelijking op basis van de keuze is slim en past bij de richting in `BESLUIT_KEUZE_VERGELIJKEN_2026-10.md` ("Jouw stack", r.95: we verdienen aan de beslissing, niet aan de informatie). In twee lagen:
  1. **Gratis:** per stof, na de check, de goedkoopste winkel per product op "Prijs en winkels" (productpagina).
  2. **Premium, "Jouw stack":** alle gekozen producten uit Mijn keuzes samen; berekening van de goedkoopste winkel of winkelcombinatie, inclusief verzendkosten en gratis-verzenddrempel.
- **Geen verkoop, geen order:** alleen doorverwijzen met affiliate-links (zie scope-aanvulling hierboven).
- **Spelregels (juridisch niet getoetst):** commissie altijd transparant (`nofollow sponsored`, consent-gate); "goedkoopste" alleen met prijscontroledatum en de vermelding "onder de winkels die wij vergelijken"; rangschikking nooit op commissie; geen medische claims, fit-taal.
- **Volgorde / trigger voor bouwen:** pas ná (1) poort en data van de 25 producten (B-2/B-3/B-7), (2) meerdere winkels per product in PartnerDesk, (3) betrouwbare verse prijzen (7-dagen-termijn, audit §4.3), (4) `/go/[offerId]` met meting per winkel (B-1/B-8).
- **Afgewezen:** nu bouwen. Met 24 van de 25 producten op één Daisycon-aanbieding en verouderende prijzen is er niets te vergelijken en kan de claim "goedkoopste" onjuist zijn.

## Aanvulling 10 oktober 2026 — Daisycon: portaalbevindingen, rol en voorwaarden

- **B-1 grotendeels beantwoord:** het Daisycon-portaal kent **Sub ID, Sub ID 2 en Sub ID 3** (filters + kolom "Media & Sub ID"). Optie (a) is dus mogelijk: `ws=<categorie>` blijft in subid 1, het kliktoken gaat in subid 2; de CLAUDE.md-subid-regel hoeft niet te wijzigen. Nog te verifiëren in één echte transactie dat subid 2 terugkomt.
- **Transacties (1–10 okt 2026): geen.** Geen reden om te wachten: het omzetscherm moet "nog niets" als geldige toestand tonen. Er is dus nog geen echt formaat; de import wordt gebouwd tegen de Daisycon-documentatie, achter een "onverwacht formaat"-melding, en de eerste echte transactie is de test. Importbouw pas als media/campagne werkt (zie hieronder); datamodel en scherm zijn bron-agnostisch en gaan door.
- **Transactiestatussen:** openstaand, goedgekeurd, afgekeurd. **Types:** regulier, handmatig, gemiste sale, **revshare**. Revshare (deel van lopend abonnement; eigen schermen "Revshare inschrijvingen/commissies", nu leeg) wordt als gewoon type meegenomen (besluit Dennis: handig voor later, bijv. abonnementen bij winkels).
- **Media "Perfectsupplement" (id 408175) is afgekeurd** door Daisycon. Reden: onderwerp/doelgroep voldoet niet aan de wensen van adverteerders; herbeoordeling bij meer content en/of meer unieke bezoekers. Acties (Dennis): mediabeschrijving herschrijven (nu "Affilate marketing rond supplementen"; wordt onafhankelijk vergelijkingsplatform met gidsen en scoremethodiek), mediasoort controleren, onder "Campagnes" nagaan of de aanmeldingen bij Vitaminstore/VitalNutrition zijn goedgekeurd, support-ticket voor herbeoordeling. **Risico:** zolang dit openstaat levert de Daisycon-route mogelijk niets op.
- **Rol van Daisycon:** één bron-adapter naast andere, niet de kern (ARCHITECTUUR_AFFILIATE_AUTOMATISERING.md r.22). Parallel directe deals met winkels zoeken (`relationship = 'direct'`, zoals Arctic Blue). **Afgewezen:** de Daisycon-import nu volledig bouwen vóór duidelijk is dat het kanaal werkt.
- **Daisycon-publishervoorwaarden v15 (27-09-2026) — raakt ons:**
  - 2.7: netwerkdata alleen voor eigen gebruik, niet aan derden doorgeven: check wat het downstream-programma (`af_*`) en n8n/PostHog ontvangen.
  - 2.12/2.14: links maskeren met misleidend doel en de gegenereerde link aanpassen zijn verboden. Een `/go`-redirect die doorstuurt naar de echte link is gebruikelijk maar eerst bevestigen bij Daisycon support (blokkeert stap 4).
  - 3.6: transacties kunnen tot 1 jaar retroactief worden afgekeurd: het grootboek moet reversals aankunnen (append-only past).
  - 5.2: 90 dagen zonder klikken/transacties kan leiden tot verwijdering uit de campagne.
- **Eigen partnervoorwaarden (downstream):** Daisycons voorwaarden gelden als **checklist voor structuur en onderwerpen**, niet als tekst om te kopiëren (hun art. 2.5 verbiedt kopiëren; auteursrecht). Onderwerpen: registratie/goedkeuring (18+, weigerrecht), toegestaan/verboden gedrag, commissie pas na goedkeuring en afkeur bij retour, terugdraaien tot een jaar, uitbetalingsdrempel en -datum, verrekening, vervaltermijn inactiviteit, beëindiging, aansprakelijkheid, geheimhouding, Nederlands recht en mediation. Tekst door een jurist laten toetsen. **Afgewezen:** letterlijk overnemen.

## Uitvoering B-2, stap 1 (10 oktober 2026)

- Admin-wijzigingen aan een **gepubliceerd** product worden geweigerd als ze een criterium van de publiceerpoort laten falen dat nu slaagt (laatste afbeelding/licentie-notitie, laatste werkzame stof of claimdrempel, laatste bron, enige actieve aanbieding): `src/lib/product-admin/gate-regression.ts`, aangeroepen in `edit-actions.ts`. Alleen criteria die nu slagen worden bewaakt, zodat de 25 falende live producten wel verbeterd kunnen worden (B-3).
- **Stap 2 (gedaan):** zevende poortcriterium "Aanbieding met geldige affiliate-link (https)" (P7): minstens één actieve aanbieding met een geldige https-`affiliate_url`. Geldt bij nieuwe publicaties meteen; live producten die het niet halen blijven staan (B-3). Host-tot-retailer-controle en een actieve partner volgen met de `/go`-redirect.
- **Nog open binnen B-2:** DB-trigger op `status → published` (migratie, additief) en tijdsverval met 7 dagen termijn + signaal (P4).

## Aanvulling 10 oktober 2026 — vrij komen van Daisycon (richting Dennis)

- **Besloten (Dennis):** het doel is onafhankelijk van Daisycon worden, en daar nu al actief aan werken. De voorwaarden-checks (afbeeldingen) blijven "meenemen"; tot er directe afspraken zijn is de licentie-notitie bij Daisycon-winkels een **aanname van de eigenaar** met datum.
- **Uitkomst webonderzoek (10 okt, te bevestigen in het portaal/bij de partij):**
  - **Vitaminstore** (17 van de 25 producten): programma loopt volgens de zoekresultaten alleen via Daisycon (campagne 5676; vermeld: tot 11%, 30 dagen cookie). Geen eigen programma gevonden.
  - **VitalNutrition** (7 producten): idem via Daisycon (campagne 18988; vermeld: 20%, 30 dagen cookie). Geen eigen programma gevonden.
  - **Arctic Blue** (1 product): eigen programma (arctic-blue.com/en/affiliate-worden): 10% op eenmalige aankoop en eerste abonnement, 5% op verlengingen, 30 dagen venster, dashboard met klikken/verkopen, **promotiemateriaal te downloaden in het dashboard** (daarmee is de afbeeldingstoestemming voor dit product op te lossen), uitbetaling per kwartaal.
  - **Merken** (Solgar, Viridian, Bonusan, Möller's, Minami, Mattisson, Orangefit, Royal Green, Vitals): geen programma gevonden; ze worden via Vitaminstore verkocht. Niet uitgesloten; per merk navragen.
- **Gevolg:** 24 van de 25 producten hangen nu aan Daisycon. Vrij komen betekent directe afspraken met Vitaminstore en VitalNutrition (of andere winkels met een eigen programma die dezelfde producten verkopen), niet alleen techniek.
- **Aanpak:**
  1. Techniek blijft ontworpen op `relationship = 'direct'` naast `'network'` (al zo): eigen `/go`-route, PartnerDesk-contract en commissieregel per winkel, handmatige/CSV-conversie-inname, Daisycon alleen als adapter.
  2. Dennis benadert Vitaminstore en VitalNutrition voor een directe afspraak (eigen tracking, commissie, materiaal), en zoekt aanvullende winkels met eigen programma's. Kanttekening: onderhandelingspositie hangt af van aantoonbaar verkeer; de Daisycon-media is juist afgekeurd op te weinig bezoekers/content.
  3. Arctic Blue: dashboard-materiaal gebruiken voor afbeeldingen en conversies; bevestigen dat het programma actief is voor perfectsupplement.nl.
  4. Daisycon blijft een terugvaloptie zolang er geen directe afspraken zijn; geen extra investering in de Daisycon-import buiten de bron-agnostische adapter (zie aanvulling Daisycon).
- **Afgewezen:** Daisycon nu loslaten zonder directe afspraken (24/25 aanbiedingen zouden geen commissie meer opleveren).
