# Technische spec — click_token tracking voor directe partners

**Status:** plak 0 van [`ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md`](../plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md) §J — ontwerp, nog niet geïmplementeerd
**Doel:** één pagina, herbruikbaar per partner, die uitlegt hoe PerfectSupplement een kliktoken
uitgeeft en hoe de partner dat token teruggeeft bij een conversie. Dit is de technische kant van
clausule 4 in [`DATA_BIJLAGE_PARTNERCONTRACT.md`](./DATA_BIJLAGE_PARTNERCONTRACT.md).

Let op: dit document beschrijft het ontwerp zoals vastgelegd in
`ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` §C4/§C6. De tabellen (`sup_clicks`, `pd_conversions`)
en het endpoint (`/api/partner/conversion`) bestaan **nog niet** in de codebase — dit document is
de spec die bij implementatie (plak 1 en 4b) gevolgd wordt, niet een beschrijving van iets dat al
draait.

---

## 1. Wat een click_token is

Een kort, url-veilig, uniek kenmerk dat PerfectSupplement uitgeeft op het moment dat een bezoeker
op een affiliate-link klikt. Het token identificeert de klik (product, retailer, pagina, positie,
tijdstip) zonder dat er persoonsgegevens in zitten.

Formaat: `[a-zA-Z0-9]{10-16}`, bijvoorbeeld `k7x9mQ2pLr`. Geen opeenvolgende nummers (voorkomt dat
partners uit tokenreeksen klikvolumes kunnen aflezen).

## 2. Hoe het token wordt meegegeven

Het token gaat mee als queryparameter in de affiliate-URL naar de partner:

```
https://partner-webshop.nl/product/123?[tracking_param]=k7x9mQ2pLr
```

`tracking_param` is de naam van de parameter zoals de partner die verwacht (bijv. `subid`, `ref`,
`utm_content`, `aff_sub`) — vastgelegd per partner in `sup_retailers.tracking_param` zodra die
tabel bestaat. Sommige partners ondersteunen een eigen sub-ID-mechanisme al vanuit hun
webshopplatform (Shopify, Lightspeed, Magento); anderen hebben een custom parameter nodig die zij
zelf moeten doorgeven aan hun ordersysteem.

**Vereiste aan de partner:** het token moet terugkomen bij de orderbevestiging, ofwel in de
postback (§3), ofwel in de periodieke export (§4), ofwel in het ordersysteem zodat het handmatig
kan worden opgezocht (§5).

## 3. Optie 1 — server-to-server postback (voorkeur)

Partner roept bij orderbevestiging een endpoint van PerfectSupplement aan:

```
POST /api/partner/conversion
Content-Type: application/json
Authorization: Bearer [gedeeld geheim, per partner uniek]

{
  "partner_id": "[uuid, door PerfectSupplement uitgegeven bij onboarding]",
  "external_id": "[partner's eigen order-ID, voor idempotentie]",
  "click_token": "k7x9mQ2pLr",
  "type": "sale",
  "occurred_at": "2026-09-26T14:32:00Z",
  "revenue_cents": 2495,
  "currency": "EUR",
  "order_ref": "[optioneel, leesbaar ordernummer voor support]"
}
```

- `Authorization`: gedeeld geheim per partner, nooit hetzelfde geheim voor twee partners.
- `unique (partner_id, external_id)` aan de kant van PerfectSupplement voorkomt dubbele
  verwerking bij een retry van de partner.
- Response: `200` bij acceptatie (ook als `click_token` niet gevonden wordt — dat wordt server-side
  gelogd als afwijking, niet als partnerfout), `401` bij ongeldig geheim, `400` bij een
  onvolledige payload.
- Rate-limiting: hergebruikt de bestaande rate-limiter (in-memory sliding window, zie
  `src/lib/rate-limit.ts`).

Dit is de enige methode die realtime en exact is. Bij implementatie landt dit in
`pd_conversions.ingest_method = 'postback'`.

## 4. Optie 2 — periodieke export

Partner levert een CSV (of vergelijkbaar bestand) aan met minimaal deze kolommen:

```
order_ref, click_token (of eigen sub-ID-kolom), occurred_at, revenue_cents, type (lead|sale)
```

Cadans en aanleverkanaal worden per partner afgesproken in clausule 4 van de data-bijlage.
PerfectSupplement matcht op `click_token` waar aanwezig, anders op `order_ref` indien die ook bij
het klikmoment is vastgelegd. Landt bij implementatie in `pd_conversions.ingest_method = 'import'`.

## 5. Optie 3 — handmatige opgave

Partner deelt periodiek (minimaal maandelijks) conversiedata via portaal of e-mail. PerfectSupplement
voert dit handmatig in. Terugvaloptie, geen automatisering. Landt in
`pd_conversions.ingest_method = 'manual'`.

## 6. Wat er per klik wordt vastgelegd

Bij het uitgeven van een token (bezoeker klikt op een affiliate-link):

```
sup_clicks: click_token, offer_id, product_id, retailer_id, page, position, created_at
```

Geen IP-adres, geen sessie-ID, geen persoonsgegevens — het token is uitsluitend gekoppeld aan
*wat* er is aangeklikt, niet *wie* erop klikte. Dit blijft binnen de bestaande privacy-discipline
van het project (§K8 van het productplatform-ontwerp): klik-tracking blijft achter de bestaande
consent-laag, en `sup_clicks` bevat bewust geen PII-velden.

## 7. Wat er bij een conversie wordt vastgelegd

```
pd_conversions: id, partner_id, contract_id, click_token → sup_clicks.click_token,
                external_id, type ('lead'|'sale'), occurred_at, order_ref,
                revenue_cents, commission_cents, currency,
                status ('pending'|'approved'|'rejected'),
                ingest_method ('postback'|'import'|'manual'),
                raw jsonb, imported_at,
                UNIQUE (partner_id, external_id)
```

`raw jsonb` bewaart de onbewerkte payload zoals ontvangen — nodig om een geschil met een partner
("wij hebben dit bedrag doorgegeven") te kunnen herleiden. `commission_cents` wordt niet door de
partner aangeleverd maar berekend uit `commission-resolution.ts` op basis van
`pd_commission_rules`; het verschil tussen verwacht en ontvangen is het afkeuringssignaal dat in
`pd_signals` terechtkomt.

## 8. Wat een partner met "geen token terug" oplevert

Als een partner het token niet kan doorgeven (bijvoorbeeld: hun ordersysteem ondersteunt geen
custom parameters), degradeert dit naar clausule 4 optie 3 (handmatig, matchend op ordernummer en
datum). Dat is minder exact — een conversie zonder token kan niet automatisch aan een specifiek
product/pagina/positie gekoppeld worden — maar blijft bruikbaar voor omzetregistratie op
partnerniveau. Dit is precies het degradatiepad uit §L1 van het productplatform-ontwerp: de laag
breekt niet, hij levert alleen minder granulariteit.

## 9. Onboarding-checklist per nieuwe directe partner

1. Data-bijlage ondertekend (alle 4 clausules, met gekozen opties ingevuld).
2. `tracking_param` afgesproken en getest (één test-klik, één test-conversie).
3. Gedeeld geheim uitgegeven (bij postback) of aanleverkanaal bevestigd (bij export/handmatig).
4. `pd_contracts.reporting_method` en `reporting_cadence` ingevuld zodra die kolommen bestaan.
5. Eerste conversie in `pd_conversions` handmatig geverifieerd tegen wat de partner meldt, vóór
   het proces als "werkend" wordt gemarkeerd.
