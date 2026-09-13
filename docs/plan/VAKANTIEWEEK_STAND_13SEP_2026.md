# Vakantieweek — stand van het codeerwerk (13 sep 2026)

**Hoort bij:** [VAKANTIEWEEK_CODEERPLAN_7DAGEN_2026-09.md](VAKANTIEWEEK_CODEERPLAN_7DAGEN_2026-09.md)
**Waarom dit doc:** het codeerplan is geschreven vóór de code open lag. Tijdens de uitvoering bleken
drie aannames onjuist en kwam er één echte bug boven. Dit is de feitelijke stand, zodat je maandag
niet hoeft te reconstrueren.

---

## Klaar en gepusht (4 commits op `claude/vacation-week-strategy-rbtr0z`)

| Commit | Taak | Wat |
|---|---|---|
| `ec1d7c0` | **A1** | `affiliate_clicks.categorie` per stof i.p.v. generieke `"vergelijking"` + 2 regressietests |
| `8224ebc` | **A2** | Conversie-readout op `/admin/affiliate`: klikken per stof (30d) + handmatige SC-impressies → live CTR |
| `efee3a1` | **A3** | Snippet-contract-test als zelfopruimend schuldenregister |
| `c537d82` | **B1 (deel)** | Gids-H1 + metaTitle losgetrokken van `/beste` voor 4 risicovrije stoffen |

Klaar-check bij elke commit groen: geen `console.log`, `tsc`, `vitest` (304 bestanden / 3012 tests),
`eslint --max-warnings 0`. Niets gedeployd — dat blijft jouw `deploy.sh`.

---

## De echte bug die A1 opleverde

`[FEIT]` Elke `/beste/*`-klik schreef `categorie: "vergelijking"` — voor alle zeven stoffen dezelfde
waarde, hardcoded in `AffiliateLink.tsx`. In tegenspraak met `ENTITY_MODEL.md:200`, dat `categorie`
beschrijft als *"Supplement-categorie (bv. `magnesium`)"*.

**Gevolg:** `getClicksPerCategory()` — en daarmee de "Clicks per categorie"-grafiek die al op
`/admin/affiliate` stond — kon nooit onderscheid maken tussen stoffen. Alles viel in één emmer.

**Let op bij het aflezen:** de fix werkt vooruit, niet met terugwerkende kracht. Klikken van vóór de
deploy houden `"vergelijking"`. De per-stof-telling begint dus te lopen vanaf het moment dat je deployt.

---

## Drie aannames uit het plan die onjuist bleken

| Plan zei | Werkelijkheid |
|---|---|
| **B1:** "5 resterende generieke `/beste`-snippets" | Onjuist. De `/beste`-titels dragen al onderscheidende elementen (KSM-66, Monohydraat, Whey & Vegan, 3 Merken Getest). Alleen **magnesium** is echt generiek — en die is gated. |
| **B2:** "StickyMobileCta op alle 7 aansluiten" | Al bedraad. Hij staat in de gedeelde `beste/[supplement]/page.tsx`, dus live op alle 7. Rest = visueel verifiëren op je telefoon. |
| **B3:** "blog-snippet magnesium+medicijnen aanscherpen" | Al gedaan — door jou, op 2 sep. `metaTitle` is exact-match, keywords compleet. **Niet aankomen**; het artikel is 11 dagen oud en nog aan het indexeren. |

---

## Wat A3 blootlegde: de kannibalisatie was breder dan het besluit aanpakte

`[FEIT]` Het besluit van 4 sep formuleerde de regel — *"een H1 op `/supplementen/{stof}` mag nooit de
vorm 'welke X past bij jou' hebben"* — maar paste hem alleen toe op omega-3. Zes gidsen droegen die
H1 nog, vijf ook in de `metaTitle`.

**Nu gefixt (4, risicovrij — ~0 impressies volgens de nulmeting):** ashwagandha, creatine,
eiwitpoeder, zink.

**Bewust blijven staan (2, gated):** magnesium en vitamine-d. Zie hieronder.

Ashwagandha kreeg bewust geen effect-formulering in de H1: `approved-claims.ts` zet die op
`status: "on_hold"` zonder goedgekeurde EFSA-claim. De H1 beschrijft extracten en standaardisatie.

---

## Wat op jou wacht — twee Search Console-checks, ±10 minuten

Dit is het enige dat het werk nu blokkeert. Ik kan Search Console niet zien.

### Check 1 — magnesium (deblokkeert A4 + 2 registerregels)
1. Search Console → Prestaties → filter op zoekopdracht **"beste magnesium"** en **"magnesium vergelijken"**.
2. Noteer **welke URL** rankt: `/beste/magnesium` of `/supplementen/magnesium`?
3. Noteer de **huidige CTR** als nulpunt (voor de meting over 2-3 weken).

- Rankt `/beste/magnesium` → dan wisselt zijn H1 naar de commerciële vorm ("Beste magnesium supplement: …")
  en de gids naar de informationele.
- Rankt `/supplementen/magnesium` op de commerciële zoekopdracht → dan alleen de gids aanpassen.

### Check 2 — vitamine-d (deblokkeert 2 registerregels)
Heeft `/supplementen/vitamine-d` eigen impressies? `/beste/vitamine-d` heeft er 190 — dat is je enige
echte verkeer, dus daar wil je niets verstoren zonder te kijken.

### Check 3 — omega-3 (deblokkeert A5)
Hebben `/wat-is-omega-3` en `/waar-let-je-op-bij-omega-3` eigen impressies? Zo nee → 301 naar
`/supplementen/omega-3`.

Geef me de uitkomsten en ik doe A4/A5 plus het opruimen van het register in één pas.

---

## Eén beslissing die ik bewust aan jou laat

`[FEIT]` Elke affiliate-klik vuurt **twee** GA4-events tegelijk: `affiliate_click` (via
`trackAffiliateClick`, rechtstreeks `gtag`) én `affiliate_klik` (via `trackAffiliateKlik` → `trackEvent`).
Zelfde klik, twee namen, Engels naast Nederlands.

Niet stuk — beide komen aan — maar je telt hetzelfde ding dubbel als je ze allebei in een GA4-rapport
gebruikt. Ik heb dit **niet** gefixt: welke van de twee weg mag hangt af van welke je in je GA4-
explorations en dashboards hebt staan, en dat kan ik niet zien. Kies er één, dan ruim ik de andere op.

---

## Wat ik bewust níét heb gedaan

- **Dode scaffolding opruimen (A6).** Je eigen verdict van 30 aug zegt hierover: *"Doe dit opruimwerk in
  stap 4 van Deel B, niet eerder. Het is geen omzetwerk, en het is precies het soort taak dat aanvoelt
  als vooruitgang zonder het te zijn."* Daar houd ik me aan.
- **USDA, Kompas, voeding, nieuwe pagina's.** Stop-lijst.
- **De `affiliate_clicks`-insertvorm.** Kolommen ongemoeid; alleen de runtime-waarde hersteld.
