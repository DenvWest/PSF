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
