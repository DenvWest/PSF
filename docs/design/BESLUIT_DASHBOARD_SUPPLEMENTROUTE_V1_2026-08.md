# Besluit — Dashboard-supplementroute v1

**De deur, het schap en de onderbouwing.** Vijf domeinen, vier surfaces, één afleiding.
15 augustus 2026 · Ontwerpcontract: [`dashboard-supplementroute-prebuild-v1-2026-08.html`](dashboard-supplementroute-prebuild-v1-2026-08.html)

---

## A · De rolverdeling

```
KOMPAS VANDAAG   de handeling van vandaag  +  ÉÉN DEUR
                 nooit een product, prijs, claim of oordeel

MIJN DAG         diezelfde handeling in de tijd  +  dezelfde deur

FAVORIETEN       HET SCHAP — activiteiten én supplementen náást elkaar,
                 één oordeel-schema, per kaart een commissie-regel.
                 De enige plek met aanbod.

VOORTGANG        DE ONDERBOUWING — de ladder legt uit waarom deze volgorde,
(ladder)         waar je winst zit, en waarom de deur open of dicht staat.
                 Draagt zelf geen aanbod en geen vergelijkingslink.

/beste/{slug}    de vergelijking: vorm, dosering, prijs per dag, claimdrempel
```

Keten: **handeling → deur → schap → oordeel → vergelijking.**

Dit is niet nieuw bedacht. Het is de architectuur van beweging v3.5 — scherm E draagt de deur (`bridgeCtaHtml` r.1332), scherm B is het gemengde schap (`CARDS` r.1007) — uitgerold over de andere vier domeinen.

---

## B · Twee herroepingen

### B1 · Product-oordeel op de dagelijkse surfaces

`BESLUIT_SLAAP_PIRAMIDE_V2_2026-08.md` §C.3 zegt: product-oordeel is *"verboden in elke staat"* op VQ, VR, K en MD. §270 zegt over de supplementtegel op Kompas: *"Die tegel moet weg — niet verplaatst, weg."*

**Blijft staan, scherper geformuleerd:**

> Op Kompas Vandaag en Mijn Dag staat **geen oordeel, geen product, geen merk, geen prijs en geen claim** — in geen enkele staat. Wél **één deur**: een label-only brug naar het schap, zonder productnaam erin.

Het verschil tussen *"Voeg iets toe aan je basis"* (mag) en *"Magnesium — Aanrader"* (mag niet) is precies wat §C.3 wilde beschermen. Beweging E hield zich daar al aan; de regel liep achter op zijn eigen prebuild.

### B2 · "Product hoort op laag 6, op VL, achter de poort"

Slaap-besluit §270. **Herroepen.** Het product verhuist naar Favorieten; de poort verhuist mee. Laag 6 op Voortgang blijft bestaan als **uitleg van de poortstand** plus de deur naar het schap — niet als tweede plek met een vergelijkingslink.

Machinaal bevestigd in de prebuild: nul `[data-ev^="schap_vergelijking_click"]` binnen `.pl-body`, over alle 120 combinaties.

Daarmee is de tegenspraak weg die de conversiekaart al had: *"Favorieten — de enige plek in Voortgang waar aanbod mag staan"* is nu waar in plaats van tegengesproken.

---

## C · De afleiding — geen advies, geen speculatie

Dit is de kern van deze versie. Een productkaart toont **hoe we ergens komen**, niet wat je moet doen.

| rij | bron | wat er staat |
|---|---|---|
| **Inname** | voedingscheck | band (onder / rond / op de referentie) + richtwaarde + **zekerheid 1-4** + waaróm die zekerheid |
| **Behoefte** | beweegprofiel | standaard of verhoogd, **kwalitatief**, met de PAL-band als bron |
| **Lagen erboven** | de ladder | staan / staan nog niet |
| **Hardheid** | per stof | maakt een bloedwaarde dit harder? ja / beperkt / nee, met de reden |
| **Wat overblijft** | afgeleid | Aanrader · Alleen als… · Nu niet · Nog geen oordeel |

Drie grenzen, alle drie machinaal getoetst over 120 combinaties:

1. **Inname, nooit status.** *"Je inname ligt onder de referentie"* mag. *"Je hebt een tekort"* niet — dat is een status en die meten we niet (COMPLIANCE.md, de inname-vs-status-grens). Getoetst: nul treffers op `tekort | gebrek | te weinig | deficiënt`.
2. **Geen advies-taal.** Nul treffers op `wij raden aan | ons advies | aanbeveling`. De uitkomstregel is letterlijk: *"Dat is geen advies — dat is wat er over is."*
3. **Kwalitatief, nooit g/kg.** De behoefte-as is een nuance, geen berekening. Een gram-per-kilo vereist gewicht, en dat vragen we niet. Spiegelt [`nutrition-protein-emphasis.ts`](../../src/lib/nutrition-protein-emphasis.ts), dat dit voor eiwit al zo doet.

**De zekerheid staat altijd in beeld.** Vitamine D is 1 van 4 en dat staat er dan ook, mét de reden: *"Keer-per-week buiten, zonder duur en zonder seizoen, is een zwakke maat voor aanmaak."* Een band zonder zekerheid is een bewering; met zekerheid is het een schatting.

Referentiewaarden komen uit [`intake-reference.ts`](../../src/data/nutrition/intake-reference.ts) (die zichzelf vuistregels noemt, geen norm). Claimteksten komen **woordelijk** uit [`approved-claims.ts`](../../src/data/approved-claims.ts).

Vier claim-situaties, alle vier in de prebuild:

| stof | situatie |
|---|---|
| magnesium · omega-3 · vitamine D · zink | goedgekeurde claim, woordelijk geciteerd |
| creatine | claim geldt **uitsluitend vanaf 55 jaar** — staat als caveat op de kaart |
| eiwitpoeder | `claims: []` — de geen-claim-regel, geen vrije formulering |
| ashwagandha | `status: on_hold` — geen oordeel, geen link, en dat zeggen we |

---

## D · De zes drifts, beslecht

**D1 · Het laaglabel.** Vier conventies in de bronprebuilds: `Laag N` (slaap) · `P N` (stress, verbinding) · `Prioriteit N` (beweging, lock 3 eist het) · geen cijfer (voeding, lock 3 verbiedt het).

> **Besluit: `P1`–`P6`, uitsluitend in de mono-tab, met `aria-hidden`.** Nooit in lopende tekst, nooit in een aria-label, nooit als eyebrow.

Winnaar: voeding's lock 3 en `BESLUIT_VERBINDING_PIRAMIDE_V1` §I. Verliezer: **beweging v3.5 lock 3**, die "Prioriteit N in elke gerenderde string" eist. Reden: het ordinaal suggereert een rangorde die de ladderkop juist ontkent (*"geen ranglijst"*), en de laagnaam is in alle vijf de domeinen zelfdragend. Het cijfer blijft zichtbaar als oriëntatie, niet als betekenis. Beweging v3.5 lock 3 wordt hiermee ingetrokken.

**D2 · De railzijde.** Voortgang `cols--railleft`, Vandaag en Mijn Dag `cols--railright`. Voeding's afwijking (rail rechts op Voortgang) vervalt. Reden: op Voortgang is de rail navigatie door de ladder en hoort hij aan de leeskant; op de dagelijkse surfaces is hij een koppelstrip en hoort hij naast de handeling.

**D3 · De stand-tegel.** Blijft, op Voortgang, in de rail — met één uitzondering: **verbinding krijgt geen ring en geen cijfer**, conform zijn eigen besluit-lock. Beweging en voeding krijgen er alsnog één; zonder stand mist de rail zijn anker.

**D4 · Twee schapoppervlakken.** Beslecht: **Favorieten is het schap.** Zie B2.

**D5 · De poortvorm.** Eén vorm, **zeven redenen**, elk met een eigen tekst per domein:

| reden | wanneer |
|---|---|
| `geen_check` | nog geen check in dit domein |
| `fundament` | onderste laag nog niet op orde |
| `geen_signaal` | lagen staan, geen gemeten gat |
| `geen_oordeel` | signaal, maar te zwakke schatting of geen bereikbare vergelijking |
| `open` | lagen staan, gemeten gat, oordeel mogelijk |
| `geen_claim` | stress — geen EFSA-claim op dit domein, in elke staat |
| `geen_schap` | verbinding — structureel, in elke staat |

Slaap's vier-standen-model met eigen label en icoon wint van voeding's open/dicht en beweging's twee redenen. De `gatepick`-schakelaar uit slaap v2 r.1295 is overgenomen, zodat elke stand zonder omweg te inspecteren is.

**D6 · Beweging's vier eigen blokken.**

| blok | oordeel |
|---|---|
| `renderKeten` | **universeel** — is de keten uit §A, hoort op elk schap |
| `renderOwnFold` | **universeel, mét voorwaarde** — alleen op domeinen mét schap (zie E2) |
| `renderChosen` | **beweging-specifiek** — vraagt een basis-plus-extra-model dat de andere vier niet hebben |
| `renderMeetpad` | **beweging-specifiek voor nu** — hoort thuis bij hermeting, niet per domein |

---

## E · Wat de bouw uitwees

Drie dingen die pas zichtbaar werden tijdens het bouwen. Ze staan hier omdat ze besluiten zijn, geen implementatiedetails.

### E1 · De contrast-tabel staat alleen op domeinen mét schap

"De drie uitkomsten naast elkaar" bevat de woorden *Aanrader* en *vergelijken*. Op stress en verbinding zou dat schap-vocabulaire een surface binnendragen die daar per lock vrij van is. **Besluit:** het contrast staat op slaap, beweging en voeding — je ziet de weigering dus vanaf de kant die iets te verkopen heeft, en dat is precies de kant waar hij iets bewijst.

### E2 · Ook onze eigen dienst staat niet op een domein zonder schap

`renderOwnFold` (PerfectSupplement-begeleiding) is aanbod, ook al is het geen supplement. Op verbinding is *"de ladder gratis houden"* volgens `BESLUIT_VERBINDING_PIRAMIDE_V1` r.335 **de prijs van de Consumentenbond-positionering**. Daar dan wél onze eigen betaalde begeleiding neerzetten haalt precies dat onderuit. **Besluit:** geen schap → geen aanbod, ook niet het onze.

### E3 · De weigering noemt geen stof — behalve in de methodologie-uitklap

`BESLUIT_VERBINDING_PIRAMIDE_V1` §I verbiedt *elk supplement* in gerenderde verbinding-strings. De goedgekeurde verbinding-prebuild noemt in `renderVL` r.1908 tóch magnesium — om uit te leggen welke claim er het dichtst bij komt en waarom hij niet opgaat. **Dat is een tegenspraak in het bestaande materiaal.**

**Besluit — gesplitst naar context:**
- op **het schap**: de weigering zonder één stofnaam. Een weigering die een productnaam nodig heeft, is geen weigering.
- in de **methodologie-uitklap op Voortgang**: de volledige redenering, mét magnesium, want daar is de vraag juist wélke claim er het dichtst bij komt.

Hetzelfde geldt voor stress en ashwagandha.

---

## F · Wat elk domein op Vandaag doet — en drie eerlijke afwijkingen

| domein | de handeling | de terugkoppeling | de deur |
|---|---|---|---|
| slaap | vaste wektijd + licht binnen het uur | *"Hoe werd je wakker?"* 1-5, **'s ochtends** | naar het schap |
| beweging | kracht thuis, 2× per week | *"Merk je er iets van?"* 1-5 | naar het schap |
| voeding | één eetstap uit je onderste open laag | **geen** — zie hieronder | naar het schap |
| stress | de reset van vier minuten | *"Zakte de spanning?"* 1-5 | **geen** — geen schap |
| verbinding | je moment van deze week | **geen** — zie hieronder | **geen** — structureel |

**Afwijking 1 — voeding heeft geen terugkoppelvraag.** Het effect is traag en niet aan één maaltijd toe te schrijven; een 1-5-schaal zou precisie suggereren die er niet is. De hercheck is daar de meting. Dat staat ook zo in de copy.

**Afwijking 2 — de voedingsstap is niet dagelijks.** *"Ruil je brood naar volkoren bij je volgende boodschappen"* is een weekhandeling. De surface zegt dat: *"hij telt op de dag dat je boodschappen doet"*, en op de dagen ertussen staat er niets te doen. Er is bewust geen korte variant; een halve boodschappenstap bestaat niet.

**Afwijking 3 — verbinding heeft één knop en geen schaal.** Een contactmoment is er wel of niet. Een cijfer geven aan een gesprek met iemand die je kent beschadigt precies wat dit domein opbouwt.

Materiaal voor de voedingsstap: `LAYER_ACTIONS` r.647 van voeding v1.5, met `railSingleAction` die al naar één stap knipt.

---

## G · Meetpunten

**Consolidatie eerst.** Vier GA4-namen voor één handeling vandaag:
`dashboard_verdict_click` · `dashboard_voeding_supplement_click` · `dashboard_beweging_supplement_click` · `supplements_route_click`

→ **één naam** `schap_vergelijking_click` met `{ domain, surface, slug, verdict }`. De vier oude namen vervallen na migratie.

De keten is vier schakels; elk krijgt zijn meetpunt:

| schakel | event | bestaat al? |
|---|---|---|
| handeling gezien / gedaan | `dashboard.daily_action_toggled` | ja |
| **deur geopend** | `choice.shelf_opened` + `{surface, domain}` | **ja** — dit is de deur |
| schap gezien, per kaartstand | `dashboard.advies_gate_passed` + `{reason, open}` | ja, uit te breiden met `reason` |
| vergelijking geklikt | `schap_vergelijking_click` | nieuw (vervangt vier) |

**Twee tellers die niemand vraagt maar die het hardst nodig zijn:**

1. **De dichte deur, per reden.** Altijd dicht = dode route; altijd open = neppe poort. Zeven redenen, zeven tellers.
2. **Het negatieve oordeel.** Hoe vaak een kaart als *Nu niet* of *Nog geen oordeel* wordt getoond. Zakt dat naar nul, dan is het schap een schappenplan geworden. Dit is de belangrijkste geloofwaardigheidsmetriek die het platform heeft.

Nieuw client-event = drie registratieplekken: `src/lib/events.ts` + `src/lib/intake-events-client.ts` + `CLIENT_EMIT_TYPES` in `src/app/api/intake/events/route.ts` r.12.

**Meetpunt: `choice.shelf_opened` → `dashboard.advies_gate_passed` → `schap_vergelijking_click` — hier lees je af of het dashboard `/beste/*` daadwerkelijk voedt.**

---

## H · Bouwvolgorde — zes verticale plakken

Elke plak is los reviewbaar en levert werkende waarde.

| # | plak | raakt | acceptatie | hangt af van |
|---|---|---|---|---|
| **P1** | **Ladder generiek maken.** `DomainLifestyleLadder` van 2 naar 5 domeinen; `P{id}` uit lopende tekst (D1); data-attribuut hernoemen weg van `data-state` | `domain/DomainLifestyleLadder.tsx` · `data/{stress,connection,nutrition}/*` | vijf domeinen renderen een ladder op Voortgang; nul ordinalen buiten de tab | — |
| **P2** | **Laag 6 wordt uitleg.** Poort met zeven redenen; vergelijkingslinks eruit; deur naar het schap erin | `voortgang/VoortgangDomeinScreen.tsx` | nul vergelijkingslinks in de ladder; zeven redenen renderen | P1 |
| **P3** | **Het schap.** `BewegingAdviesTreden` → generiek `SchapView` met gemengde kaarten en het volledige `verdict`-schema; vervangt `SupplementVerdictPanel` (2×) en `DomainSupplementList` | nieuw `voortgang/Schap*.tsx` · **verwijdert** `SupplementVerdictPanel.tsx`, `domain/DomainSupplementList.tsx`, `voortgang/BewegingAdviesTreden.tsx` | elke kaart heeft `quality` + 4 verdict-velden + `micro`; uitgangen = aantal positieve oordelen | P2 |
| **P4** | **De afleiding.** Inname × behoefte × lagen × hardheid, gevoed uit `intake-reference.ts` en `nutrition-protein-emphasis.ts` | nieuw `src/lib/supplement-afleiding.ts` | nul status-woorden; zekerheid altijd zichtbaar; claim woordelijk | P3 |
| **P5** | **Vandaag + Mijn Dag naar het beweging-skelet.** Vier domeinschermen naar één skelet; deur erin; tools-grids en dubbele readouts eruit | `SleepScreen` · `StressScreen` · `VerbindingScreen` · voedingsscherm uit `Dashboard.tsx` | ≤4 secties per scherm; nul productstrings; één deur | P3 |
| **P6** | **Meetketen.** Consolidatie van vier events naar één; de twee tellers uit §G | `lib/events.ts` · `intake-events-client.ts` · `api/intake/events/route.ts` | vier oude namen weg; poortreden en negatief oordeel meetbaar | P5 |

---

## I · De balans

| | vóór | ná |
|---|---|---|
| supplement-oppervlakken | 4 (`SupplementVerdictPanel` 2×, `DomainSupplementList`, `BewegingAdviesTreden`) | **1** (het schap) |
| ladder-implementaties | 1 van 5 domeinen | 1 component, 5 domeinen |
| laaglabel-conventies | 4 | **1** |
| GA4-namen voor "vergelijking geklikt" | 4 | **1** |
| secties op een domeinscherm | 6-8 | **≤4** |
| uitgangen op Vandaag | 5-7 | **4** |
| uitgangen op Voortgang-domein | 6-8 | **3** |

Te verwijderen bestanden bij P3 en P5, met pad:

- `src/components/dashboard/SupplementVerdictPanel.tsx` (218 r.) — vervangen door het schap
- `src/components/dashboard/domain/DomainSupplementList.tsx` (57 r.) — staat op Kompas, botst met B1
- `src/components/dashboard/voortgang/BewegingAdviesTreden.tsx` (234 r.) — gaat op in het schap
- `Dashboard.tsx` r.2840-2866 — sectie *"Supplementen voor jou"*
- `StressScreen.tsx` r.140-174 — sectie *"Voeding & supplementen"*
- `SleepScreen.tsx` r.176-227 — vier hardgecodeerde "Ritme-hefbomen"-kaarten
- `StatistiekenBlikPanels.tsx` r.367 — tweede `SupplementVerdictPanel`
- `DomainToolsGrid` + `DomainSoonPill` in al hun voorkomens — dormant, geen meetpunt

**Netto: minder componenten, minder uitgangen, minder events, één nieuwe surface die er drie vervangt.**

---

## J · Wat er niet in zit

Bewust buiten deze versie: de intake-frames (VQ/VR), Hermeting, de Voortgang-hub met meetlat en cyclusliniaal (die staat in de conversiekaart en verandert niet), de agenda-timeline in detail, en de per-domein mocks uit de bronprebuilds (slaapkamer-scan, resetsheet, momentsheet, programmaplanner). Die blijven staan zoals ze zijn.

De bandwaarden per staat in de prebuild zijn ontworpen om de acht uitkomsten te tonen. Ze zijn niet ontleend aan een echte gebruiker — er zijn er twee.

**Volgende opdracht:** de brug naar buiten. `src/data/supplements/pre-purchase-ladder.ts` voedt zich uit `sleepPlanTemplate` terwijl de dashboardladder uit `SLEEP_PRIORITY_LAYERS` komt — twee bronnen voor dezelfde drie stappen. Die moeten één worden vóór homepage → SEO → `/beste/*` begint.
