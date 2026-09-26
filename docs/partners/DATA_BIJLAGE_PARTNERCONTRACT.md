# Data-bijlage bij het partnercontract — standaardtekst

**Status:** plak 0 van [`ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md`](../plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md) §J
**Doel:** één herbruikbare bijlage die je bij elk direct partnercontract meeneemt, zodat productdata,
beeldrecht, prijsactualiteit en conversierapportage vooraf zijn afgesproken — niet als naheffing
achteraf. Vervangt de afhankelijkheid van wat een affiliate-netwerk toevallig toestaat (§L1).

Dit is een sjabloon voor eigen gebruik bij onderhandeling, geen juridisch bindend document totdat
het (met een jurist, waar nodig) is omgezet in een ondertekende bijlage.

---

## Hoe te gebruiken

1. Kopieer de vier clausules hieronder in het partnercontract, of voeg ze toe als losse bijlage.
2. Vul per partner de vierkante haken `[…]` in.
3. Leg de ondertekende versie vast in `pd_documents` (`kind = 'contract'`, gekoppeld aan
   `pd_contracts.id`), net als de rest van het partnerdossier.
4. Zodra `pd_contracts.reporting_method` bestaat (zie §4 hieronder, nog niet gemigreerd — zie
   `ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` §M), vul die kolom in op basis van wat hier is
   afgesproken.

---

## Clausule 1 — Productdata

> Partner verleent PerfectSupplement toestemming om productnaam, EAN/artikelcode, etiketinformatie
> (ingrediënten, dosering, actieve stoffen per portie), verpakkingsinhoud en gebruiksadvies te
> gebruiken voor productvergelijkingen op perfectsupplement.nl, inclusief eigen berekende
> kwaliteitsscores op basis van deze gegevens.
>
> Aanlevering via: **[feed / API / periodieke export — kies er één]**, cadans: **[realtime /
> wekelijks / maandelijks]**, contactpersoon voor datavragen: **[naam + e-mail]**.
>
> PerfectSupplement onderzoekt en beoordeelt producten zelfstandig; deze bijlage regelt uitsluitend
> het gebruiksrecht op de brondata, niet de inhoud van de beoordeling (zie de scheiding tussen
> productdata en scoremodel in §C3 van het productplatform-ontwerp).

**Waarom dit moet:** zonder expliciete toestemming is elk gebruik van etiketdata een aanname.
Dit is ook de plek om vast te leggen dát PerfectSupplement een onafhankelijke score voert — dat
voorkomt latere discussie over "waarom staat ons product niet bovenaan".

## Clausule 2 — Beeldrecht

> Partner verleent PerfectSupplement een niet-exclusieve licentie om door partner aangeleverde
> productafbeeldingen te gebruiken voor redactionele en vergelijkende doeleinden op
> perfectsupplement.nl (productkaarten, productdetailpagina's, vergelijkingstabellen). Deze
> licentie geldt zolang het product is opgenomen in de vergelijking en vervalt bij verwijdering
> van het product of beëindiging van dit contract.
>
> Aanlevering: **[eigen fotografie door PerfectSupplement / door partner aangeleverde bestanden /
> merchant feed]**. Bij aangeleverde bestanden: bronvermelding conform partnerwens: **[ja/nee,
> vorm]**.

**Waarom dit moet:** dit is de directe oplossing voor het beeldrecht-risico dat bij netwerkfeeds
altijd onzeker blijft (feed-afbeeldingen mogen doorgaans alleen ter promotie van díe merchant).
Bij een direct contract wordt dit vooraf geregeld in plaats van achteraf gegokt. Vastleggen in
`sup_product_images.source` + `license_note` zodra de productlaag bestaat — deze clausule is de
brontekst die dat veld moet bevestigen.

## Clausule 3 — Prijsactualiteit

> Partner informeert PerfectSupplement over prijswijzigingen op de aangeboden producten binnen
> **[24 uur / 3 werkdagen / bij wekelijkse export]** na wijziging, via **[hetzelfde kanaal als
> clausule 1 / apart prijskanaal]**.
>
> Bij het uitblijven van tijdige prijsinformatie behoudt PerfectSupplement zich het recht voor om
> de weergegeven prijs te vervangen door een verwijzing "prijs controleren bij retailer" totdat
> een actuele prijs bevestigd is.

**Waarom dit moet:** dit is de contractuele laag van het prijsverval-risico (§L2). De technische
laag (`price_checked_at` + automatisch verbergen bij veroudering) blijft sowieso bestaan als
vangnet — deze clausule regelt de bron, niet de code.

## Clausule 4 — Conversierapportage

> Partner rapporteert conversies (leads en/of verkopen die via PerfectSupplement tot stand zijn
> gekomen) via één van de volgende methoden, in volgorde van voorkeur:
>
> 1. **Server-to-server postback** naar een door PerfectSupplement aangeleverd endpoint, bij
>    orderbevestiging, met het meegegeven trackingkenmerk (`click_token`) en de ordwaarde.
> 2. **Periodieke export** (CSV of vergelijkbaar), minimaal **[maandelijks / wekelijks]**,
>    gematcht op `click_token` of eigen ordernummer.
> 3. **Handmatige opgave**, minimaal maandelijks, via **[portaal / e-mail]**.
>
> Gekozen methode voor dit contract: **[1 / 2 / 3]**, cadans: **[…]**.
>
> PerfectSupplement geeft per klik een uniek trackingkenmerk (`click_token`) mee in de
> doorverwijzings-URL. Partner retourneert dit kenmerk bij het rapporteren van de conversie. Zie
> de technische spec ([`SPEC_CLICK_TOKEN_TRACKING.md`](./SPEC_CLICK_TOKEN_TRACKING.md)) voor het
> exacte formaat en de implementatiedetails.

**Waarom dit moet:** dit is het kernverschil met netwerkbemiddeling (§C6). Bij een netwerk lees je
omzet af in hún portaal; hier onderhandel je de rapportageplicht zelf, en de gekozen methode
bepaalt welk stuk van `ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` §C6 (`pd_conversions.ingest_method`)
van toepassing wordt zodra die tabel gebouwd wordt.

---

## Degradatiepad — als een partner een clausule niet accepteert

Vastgelegd in §L1: elke laag degradeert in plaats van breekt.

| Ontbrekende toezegging | Gevolg |
|---|---|
| Geen conversierapportage (clausule 4) | Alleen kliks zichtbaar, geen omzet — dashboard toont dit expliciet, nooit €0 gepresenteerd als "geen omzet" |
| Geen prijsfeed (clausule 3) | Handmatige prijs met zichtbare `price_checked_at`, verloopt naar "prijs controleren bij retailer" |
| Geen beeldlicentie (clausule 2) | Geen afbeelding → geen publicatie (publiceerpoort in §F van het productplatform-ontwerp) |
| Geen productdata-toestemming (clausule 1) | Partner kan niet worden opgenomen als product-bron; kan eventueel nog als netwerk-rijstrook (`relationship = 'network'`, indien via Daisycon/Awin) |

Dit betekent: een partner die alleen clausule 4 optie 3 (handmatig) accepteert is nog steeds
bruikbaar — alleen met minder automatisering. Een partner die clausule 1 of 2 weigert, kan niet
als directe productbron worden opgenomen.
