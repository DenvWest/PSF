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
