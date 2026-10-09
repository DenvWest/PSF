# Prompt — vervolg affiliate: kliktoken en omzet meetbaar (9 oktober 2026)

**Voor:** een nieuwe Claude-sessie in `~/psf`. Werk in een eigen worktree vanaf `origin/main` (CLAUDE.md, "Eén worktree per sessie"). **Lees eerst** `docs/plan/AFFILIATE_DASHBOARD_AUDIT_2026-10.md` (audit van 1 okt, 1049 regels; §0, §1, §8, §15, §16, §20 en Bijlage B zijn de kern) en dan pas dit document. Doorzoek `docs/plan/` op `affiliate`, `kliktoken`, `partnerdesk` voor je een plan bouwt (CLAUDE.md, "Bestaande besluiten eerst").

**Status:** de audit is een nulmeting met voorstellen. **Er is nog niets besloten.** Dennis beslist per punt; dit document legt de beslispunten voor, met een aanbeveling, en zegt wat er sinds 1 oktober veranderd is.

## Waarom nu

Keuze (ronde 12, 9 okt) stuurt mensen met een gekozen supplement naar de productpagina en daar naar de winkel. Dat is gebouwd en live op `main`. Wat er nog niet is: het antwoord op **"wat leverde dat op?"**. Klikken zijn te tellen, omzet niet. Dennis maakte zich zorgen om conversie; zonder omzetmeting optimaliseer je blind.

## Wat er sinds de audit veranderd is (relevant voor deze sessie)

- **Keuze → winkel loopt nu via één deur.** Het dashboard bevat geen affiliate-link (cockpit-besluit, ongewijzigd). "Prijs en winkels →" (Mijn keuzes en Vergelijken) gaat naar `/product/<slug>?van=keuze&stof=…`. Daar staat bovenaan `KeuzeKoopKaart` (`src/components/supplement-hub/KeuzeKoopKaart.tsx`) met een `AffiliateLink` met `sourcePage="productpagina-keuze"`. Besluit: `docs/plan/BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`, "conversiestap".
- **Waar die herkomst terechtkomt — corrigeer wat er eerder over gezegd is.** `sourcePage` landt in (1) GA4 `affiliate_click` als `page_type`, en (2) `domain_events` (`affiliate.click`, `payload.surface`; gaat ook naar n8n/PostHog). Het landt **niet** in `affiliate_clicks` (die bewaart alleen `product_id`, `product_naam`, `categorie`, `pagina` = pathname) en **niet** in `sup_clicks` (die krijgt alleen `page` = pathname). Een eerdere versie van het besluitdocument zei ten onrechte `affiliate_clicks.page_type`; dat is gecorrigeerd. Gevolg: de Keuze-klikken zijn nu alleen af te lezen in GA4 en in `domain_events`, niet in het legacy-dashboard `/admin/affiliate` en niet per partner in PartnerDesk.
- **De poort-, signaal- en omzetbevindingen van de audit zijn niet aangeraakt.** Controleer de aantallen opnieuw voor je erop bouwt (Bijlage A van de audit bevat de read-only queries); de audit is van 1 okt en `sup_clicks` had toen pas 5 rijen.
- Zie ook de geheugennotitie `psf-affiliate-audit-okt-2026`.

## Wat de audit zegt over de kliktoken (kort)

- Het `click_token` wordt aangemaakt (`sup_clicks`, 12 tekens, 72 bit) maar **gaat nooit mee naar de partner**: de link is de statische URL uit `src/data/affiliate-links.ts`, het token wordt via `sendBeacon` alleen server-side bewaard (`register-click-client.ts:9-14`). Daisycon-links dragen `ws=<categorie>` als subid, niet de klik.
- 24 van de 25 aanbiedingen (alle `sup_clicks`) lopen via Daisycon; daarvoor bestaat **geen conversie-inname** (geen API, import of postback). `pd_conversions` en `pd_ledger_entries` waren leeg.
- Vitaminstore (17 aanbiedingen) en Arctic Blue hebben **geen contract en geen commissieregel**, dus een ingenomen conversie krijgt `commission = null`.
- Daardoor kan het systeem op **geen enkele dimensie** zeggen hoeveel affiliate-omzet er is: alleen het aantal uitgaande klikken (een ondergrens, want alleen met marketingtoestemming).

## Beslispunten voor Dennis

De ID's zijn die van audit Bijlage B. Per punt: de vraag, de opties, mijn aanbeveling en wat het blokkeert. **Leg elk besluit vast in `docs/plan/`** (datum, status, afgewezen opties) — niet alleen in de chat.

| ID | Vraag | Opties | Aanbeveling | Blokkeert |
|---|---|---|---|---|
| **B-1** | Hoe gaat het kliktoken mee naar Daisycon? | (a) tweede subid-parameter, als Daisycon die ondersteunt en per transactie rapporteert; (b) `ws=<token>` in plaats van `ws=<categorie>` (botst met de subid-conventie in CLAUDE.md; categorie blijft afleidbaar uit de klik); (c) geen token voor het netwerk: dan geen klik- of productattributie voor 24/25 aanbiedingen | **(a)**, eerst verifiëren in de Daisycon-documentatie en in één echte transactie-export; zo niet, **(b)** met aanpassing van de CLAUDE.md-regel. Dit is het enige punt waar Dennis zelf in het Daisycon-portaal moet kijken. | Alles in fase 2 (attributie tot op klik/product) |
| **B-2** | Wat gebeurt er als een gepubliceerd product later de poort niet meer haalt? | (a) wijziging weigeren; (b) automatisch terug naar concept; (c) alleen signaal + termijn | (a) voor admin-wijzigingen, (c) met 7 dagen termijn voor tijdsverval (prijs). Automatisch depubliceren raakt SEO en omzet zonder menselijke blik. | De poort als DB-invariant (audit 1.2) |
| **B-3** | De 25 live producten falen nu de poort (0/25) | (a) tijdelijk depubliceren; (b) laten staan en de data binnen een vaste termijn op orde brengen | **(b)**, met een poort die op nieuwe publicaties meteen actief is | Dataherstel (audit 1.4) |
| **B-4** | Waar komt het upstream-omzetoverzicht? | (a) PartnerDesk (`/rapportages` + Vandaag-tegel, conform het §G-besluit); (b) los dashboard | **(a)**; (b) wijkt af van het §G-besluit | Rapportage (audit 1.9) |
| **B-5** | De backfill-routes (`sup-backfill` e.a.) | (a) verwijderen; (b) beperken tot "alleen ontbrekende rijen" | (a) voor `sup-backfill` (die zet alle producten rechtstreeks op `published` en overschrijft adminwerk); de andere zijn niet-destructief | Audit 1.1 — klein en veilig, kan als eerste |
| **B-6** | Hoe ver gaat PartnerDesk-werk, gezien "niet nu, met trigger" (15 aug) en "afmaken" (30 aug)? | Er staan 5 partners (3 actief); omzet is onbekend | Alleen wat omzet meetbaar en correct maakt (audit §18 MUST); verdere PartnerDesk-features pas na de trigger. Leg de trigger vast in `docs/plan/` als die blijft gelden. | Scope van de hele reeks |
| **B-7** | Viridian-product ↔ Solgar-deeplink (`viridian-bisglycinaat` linkt naar een Solgar-pagina en staat op 0 mg) | Link aanpassen of product herzien | Eerst verifiëren bij Vitaminstore | Poortdata |
| **B-8** *(nieuw)* | Moet de herkomst (`sourcePage`) ook in `sup_clicks` en/of `affiliate_clicks` komen, zodat Keuze-klikken per partner in PartnerDesk zichtbaar zijn? | (a) niets doen: GA4 + `domain_events` volstaan; (b) `source_surface`-kolom op `sup_clicks` (additieve migratie, past in audit 2.1 `/go/[offerId]`); (c) kolom op `affiliate_clicks` | **(b)**, samen met de `/go`-redirect; **niet (c)** (CLAUDE.md: `affiliate_clicks` niet aanraken) | Per-partner-trechter Keuze → klik |

## Aanbevolen volgorde (uit audit §20, aangevuld)

1. **Backfill-bypass dicht** (B-5, S) en daarna de poort als DB-invariant (B-2); parallel de data van de 25 producten (B-3, B-7). Elke latere linkstap gaat ervan uit dat een gepubliceerd product een geldige aanbieding heeft.
2. **Commissie compleet:** de full-sync-bug (omzetsignalen elke dag onterecht "opgelost"), het signaal "actieve partner zonder regel", en contract + regel voor Vitaminstore en Arctic Blue (data, door Dennis in PartnerDesk).
3. **Daisycon-transactie-import** met status-sync en een atomair grootboek, plus server-side totalen met periode in Europe/Amsterdam. **Eerst één echte Daisycon-export bekijken** voor je het formaat vastlegt (`UNKNOWN`).
4. **Klik-attributie:** `/go/[offerId]` met het token in de subid/parameter, `sup_offers` als enige URL-bron (B-1, B-8). Raakt alle live affiliate-links (9 plekken): vóór en na vergelijken per slug.
5. **Borgen:** tests uit audit §13 en één maand reconciliatie tegen het Daisycon-portaal vóór welke omzetclaim richting partners dan ook.

## Regels die steeds terugkomen (dit project)

- **Geen affiliate-link in het dashboard.** Koopknoppen horen op `/product/<slug>` en `/beste/*`.
- Daisycon voor Vitaminstore.nl en VitalNutrition.nl; **Arctic Blue** heeft een eigen mechanisme (`sld=dennisvanwestbroek`) — niet vervangen door Daisycon. Subid-formaat zoals `ashwagandha-vergelijking` (raakt B-1).
- `rel="nofollow sponsored"`, `target="_blank"`; consent-gate op partnerlinks (`cookie_marketing_gate`).
- **`affiliate_clicks` niet aanraken** (geen index, geen kolom).
- Migraties via de Supabase Dashboard SQL Editor, nooit `supabase db push`; elke migratie krijgt in dezelfde commit een blok in `supabase/migrations/OPENSTAAND.md` met **Blokkeert deploy**; additieve migraties gaan als eigen kleine PR vooruit naar `main` (`BESLUIT_MIGRATIE_EERST_NAAR_MAIN_2026-10.md`).
- Next.js 16 wijkt af: lees `node_modules/next/dist/docs/` (route handlers, redirects, cache-API's) voor je de `/go`-route bouwt.
- Meetpunt bij elke wijziging in dezelfde PR; meld "Meetpunt: … — hier lees je het effect af."
- Lokaal laten zien met poort, `deploy.sh` draait Dennis zelf, merge pas na zijn akkoord en groene CI.

## Eerste vragen aan Dennis in de nieuwe sessie

1. Akkoord op de aanbevelingen bij B-2 t/m B-7 (één antwoord volstaat; dan loopt stap 1 en 2 zonder verdere vragen)?
2. B-1 vraagt jouw ogen: welke subid-/parametermogelijkheden toont het Daisycon-portaal voor een deeplink-campagne, en kun je één transactie-export (CSV) delen met alleen aantallen en datums? Zonder dat blijft stap 3 en 4 `UNKNOWN`.
3. Mag de sessie beginnen met stap 1 (klein, laag risico, geen migratie) terwijl B-1 nog loopt?
