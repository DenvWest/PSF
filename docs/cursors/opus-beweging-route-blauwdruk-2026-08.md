# Prompt — Beweging als volledige route (blauwdruk voor de vier andere domeinen)

> Plak dit als openingsbericht in een verse sessie. Het is één opdracht in drie poorten;
> je stopt bij elke poort voor review.

---

## 0 · Wat je bouwt

Beweging is het eerste domein waar de **hele route** klopt, van check tot Voortgang.
Als die route staat, is hij de blauwdruk die slaap, voeding, stress en verbinding kopiëren.

De route, in volgorde:

```
Leefstijlcheck (beweging)
   ↓  readout = SSOT, byte-identiek op elke surface waar hij terugkomt
VANDAAG · Beweging      de handeling van vandaag  +  ÉÉN deur
   ↓                    geen product, merk, prijs, claim of oordeel
MIJN DAG                dezelfde handeling in de tijd  +  dezelfde deur
   ↓
SCHAP (maak een keuze)  het aanbod: activiteiten én supplementen naast elkaar,
   ↓                    één oordeel-schema, commissie-regel per kaart
VOORTGANG · Beweging    de onderbouwing: readout → feitrijen → gekozen → ladder
   ↓                    meet en verklaart, draagt zelf geen aanbod
/beste/{slug}           de vergelijking
```

Twee dingen moeten daarin **aantoonbaar** kloppen:

1. **De aanbeveling** (uit de leefstijlcheck) landt op Vandaag als handeling en op de ladder als prioriteit — uit dezelfde bron, zonder dat de twee elkaar kunnen tegenspreken.
2. **De eigen keuze** (wat iemand zelf uit het schap pakt) landt op Mijn Dag als rij en op Voortgang in het gekozen-blok — met de reden waarom het daar hoort.

---

## 1 · Lees dit vóór je één regel schrijft

Niet diagonaal. Je citeert straks regelnummers, dus lees ze echt. De prebuilds zijn de bron,
niet `src/` — waar ze verschillen wint de prebuild, tenzij compliance anders zegt.

**Leidende beelden**
- `docs/design/beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html` — schermen A (eerste keer), E (elke dag daarna), B (schap), C (Voortgang › Beweging), D (Mijn Dag). Let op `renderD()` r.2123, `renderC()` r.2065, `renderLadder()` r.1596, `bridgeCtaHtml`, `REVIEW_STATES` (vijf standen) en `VPNOTE` (de URL-naad per scherm).
- `docs/design/slaap-piramide-v2-prebuild-2026-08.html` — **dit is de vorm die beweging-Vandaag moet krijgen**: `renderK()` r.1475 (kdome + ring + `renderAttnbar` r.1433 + `renderKActies` r.1458 + CTA-stapel + `renderKBridge` r.1450 in de rechter rail), `renderMD()` r.1517 met `renderMDStrip()` r.1508, en Voortgang: `renderV1()` r.1670 + `renderHubRows()` r.1655 + `renderV2()` r.1689.
- `docs/design/dashboard-supplementroute-prebuild-v1-2026-08.html` — `renderFAV()` r.1395 (het schap met keten-strip Check → Onderbouwing → Schap → Vergelijking), `renderVL()` r.1329, `renderVD()` r.1217, `renderMD()` r.1288.

**Besluiten die binden**
- `docs/design/BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md` — surface-model, de brug, de vier ladderstaten, de commissie-tabel per prioriteit.
- `docs/design/BESLUIT_DASHBOARD_SUPPLEMENTROUTE_V1_2026-08.md` — de rolverdeling (§A), de twee herroepingen (§B), de afleiding zonder advies (§C).
- `docs/design/BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md` — vermelding ≠ commissie.
- `docs/design/BESLUIT_BEWEGING_KOPPELNAAD_V1_2026-08.md` — de koppelnaad en §E2 (cafeïne-claim vervallen).
- `docs/design/BESLUIT_SLAAP_PIRAMIDE_V2_2026-08.md` — het contract dat beweging deelt; §C.3 en §270 zijn herroepen door het supplementroute-besluit, lees die herroeping mee.

**Wat er al in `src/` staat** (inventariseer, bouw geen paralleluniversum)
- `src/components/dashboard/` — `BewegingScreen.tsx`, `kompas/`, `agenda/`, `voortgang/`, `beweging/`, `VoortgangHub.tsx`, `DomainTodayStrip.tsx`.
- `src/lib/` — `movement-*.ts` (ruim twintig bestanden, o.a. `movement-plan-profile`, `movement-today-choices`, `movement-route-progress`, `movement-week-roadmap`), `beweging-advies-treden.ts`, `dashboard-readout.ts`, `dashboard-priority-selection.ts`, `dashboard-url.ts`, `kompas-home.ts`.

---

## 2 · Vastgelegd — drie naden, gesloten (16 augustus 2026)

Deze zijn beslist. Niet heropenen, wel navolgen. Neem ze woordelijk over in het v3.6-besluitdoc.

**N1 · Drie woorden, drie rollen.** Ze verwijzen naar hetzelfde spoor, maar zijn niet
inwisselbaar:

| woord | rol | waar |
|---|---|---|
| **Maak een keuze** | de handeling: de deur naar het schap | brug op Vandaag en Mijn Dag → scherm B |
| **Mijn keuze** | het resultaat: wat de klant koos | als rij op Vandaag en Mijn Dag, als sectie in Favorieten |
| **Favorieten** | het nav-item op Voortgang dat beide secties draagt | Voortgang › Favorieten |

**N2 · Twee bronnen, twee secties.** Favorieten toont ze náást elkaar, altijd in deze volgorde
en altijd met de bron in beeld:

1. **Aanbevolen** — komt uit de leefstijlcheck en de beweegcheck. Alleen leefstijl-activiteiten. Dit is wat het systeem afleidt.
2. **Mijn keuze** — komt van de klant. Activiteit, supplement, dienst, begeleiding — alles wat in het schap staat. Dit is wat de klant wil.

Twee secties, geen twee staten van dezelfde kaart. Een aanbeveling wordt nooit stilzwijgend
een keuze: de klant zet hem er zelf naast.

**N3 · Kompas/home en Vandaag/Mijn Dag zijn synoniem in spraakgebruik.** Er verandert
**niets** in de UI, de labels of de nav. Geen rename-werk, geen zoek-en-vervang. Nav blijft
Vandaag · Agenda · Voortgang · Hermeting; Vandaag (tab 1) en Mijn Dag (Agenda, tab 2) blijven
twee aparte surfaces met hetzelfde contract.

**N4 · Afgeleide grens — "Mijn keuze" op Vandaag zonder het schap mee te slepen.**
N1 en N2 samen zetten een gekozen supplement of dienst op Vandaag. Lock 1 verbiedt aanbod
daar. Die twee botsen niet als je de gekozen staat als handeling behandelt:

> **Mag** op Vandaag en Mijn Dag: stofnaam of activiteit + tijdstip + afvinkactie —
> *"Magnesium · voor het slapen"*, *"Krachttraining thuis · 19:00"*.
> **Mag niet**, in geen enkele staat: merk, prijs, oordeelslabel ("Aanrader"), claimtekst,
> vergelijkingslink, affiliate-link.

Dezelfde scheiding als deur/schap, doorgetrokken naar wat je al gekozen hebt. Wil de klant
het oordeel of de prijs terugzien, dan is dat één tik verderop via de koppelstrip.

---

## 3 · Poort 1 — beweging-prebuild v3.6

Twee gaten dichten. Beide zijn overname-werk uit bestaande prebuilds — je bedenkt geen
nieuwe vorm.

### 3a · Vandaag · Beweging krijgt de slaap-v2-layout

Neem de vorm over uit slaap v2 `renderK()` (r.1475), in beweegstijl en met beweeg-inhoud:

- kop met ring + score + band + "gemeten {datum}" (`kdome`), statusregel eronder;
- de aandachtsbalk (`renderAttnbar` r.1433): top-3 prioriteiten, kleur **én** statuswoord in tekst;
- drie gratis acties op de winst-prioriteit, elk met "Zet op Mijn Dag ›"-knop of "Staat op Mijn Dag";
- **de "Mijn keuze"-rij**, overgenomen uit v3.5 scherm E ("Vandaag ook") met dezelfde acties — afvinken, verplaatsen, niet vandaag, pas aan — en onder de grens van N4: geen merk, prijs, oordeel of claim;
- CTA-stapel: primaire actie + ghost naar Mijn Dag + footnote "zelfrapportage, geen diagnose";
- rechter rail met de brug-tegel (`kbridge` r.1450) — bij beweging is dat de bestaande `bridgeCtaHtml`-brug ("Maak een keuze"), niet een tweede ladder;
- desktop `cols cols--railright`, mobiel 375px eerst.

De ladder die de aandachtsbalk voedt komt uit de **leefstijlcheck + beweegcheck**. Eén bron
voor de prioriteitstatus op Vandaag en de volle ladder op Voortgang; als die twee kunnen
uiteenlopen, is dat de eerste bug om te sluiten (lock 4).

Randvoorwaarden: geen tweede `<h1>`, geen mini-ladder op Vandaag, alle vijf `REVIEW_STATES`
blijven werken, self-contained bestand (fonts inline, geen CDN).

### 3b · Voortgang › Favorieten krijgt twee secties

Neem `renderFAV()` uit de supplementroute-prebuild (r.1395) over naar beweging, met de
keten-strip Check → Onderbouwing → Schap → Vergelijking, en splits hem volgens N2:

- **Aanbevolen** — leefstijl-activiteiten, afgeleid uit check + beweegcheck, met de bron in beeld;
- **Mijn keuze** — wat de klant zelf koos: activiteit, supplement, dienst of begeleiding, elk met het oordeel-schema en de commissie-regel per kaart;
- lege staten voor beide secties (nog geen check · check binnen maar niets aanbevolen · niets gekozen);
- prioriteit 6 blijft gegate, met de poortstand in gewone taal.

Lever op als **nieuw bestand** `docs/design/beweging-keuze-consumentenbond-prebuild-v3.6-2026-08.html`
(v3.5 blijft staan), plus een amendement-sectie in `BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md`
of een kort v3.6-besluitdoc. **Stop hier voor review.**

---

## 4 · Poort 2 — gat-analyse src/ tegenover v3.6

Geen code. Eén tabel, per surface (Vandaag · Mijn Dag · Schap · Voortgang):

| surface | prebuild zegt | src/ doet nu (bestand:regel) | gat | omvang |
|---|---|---|---|---|

Plus expliciet: welke `movement-*.ts` de bron van de aanbeveling is, waar de readout vandaan
komt (`dashboard-readout.ts`?), en of prioriteit-status en readout vandaag al uit één bron
komen. Als ze dat niet doen, is dát de eerste bouwslice — de rest is cosmetiek zolang die
twee kunnen uiteenlopen.

Sluit af met een voorgestelde plak-volgorde (max 6 plakken, elk ≤ ~400 gewijzigde regels).
**Stop hier voor review.**

---

## 5 · Poort 3 — bouwen, één plak per beurt

Per plak: wat je wijzigde, waarom, welke bestanden, welk meetpunt, en wat er nog open staat.
Daarna stoppen. Niet doorpakken naar de volgende plak zonder akkoord.

---

## 6 · Locks — niet onderhandelbaar, ook niet "even voor de demo"

1. **Vandaag en Mijn Dag dragen geen aanbod.** Geen merk, prijs, claim, oordeelslabel, vergelijkingslink of affiliate-link, in geen enkele staat. Wél twee dingen: één label-only deur ("Maak een keuze") en de al-gekozen items als handeling — stofnaam of activiteit + tijdstip + afvinken. Zie N4 in §2 voor de grens.
2. **Eén predikaat stuurt label én bestemming van die brug.** Zoals `bridgeFirst()` in v3.5. Ze kunnen niet uit elkaar lopen omdat ze niet twee dingen zijn.
3. **De ladder is blokken, geen piramide-silhouet.** Prioriteit 1 bovenaan, 4px statusbalk links, statuswoord altijd óók in tekst. Varianten `full` en `rail`. Geen mini-variant.
4. **De readout is SSOT.** Op Voortgang staat hij byte-identiek met het check-in resultaat, met de SSOT-vlag erboven. Ladder en readout komen uit dezelfde bron; lopen ze uiteen, dan is dat een bug, geen nuance.
5. **Voortgang meet, doet niet.** Geen dag-knop op prioriteit 4–6, geen vergelijkingslink in de ladder-body.
6. **Commissie loopt alleen op prioriteit 4.** P2 en P3 mogen aanbieders tonen mét oordeel en zónder commissie. P6 is gegate achter voedingscheck én hertest, en is nooit een CTA op Vandaag, Mijn Dag of Agenda.
7. **Inname, nooit status.** "Onder de referentie" mag; "tekort", "gebrek", "te weinig" niet. Geen advies-taal ("wij raden aan", "ons advies"). Kwalitatief, nooit g/kg.
8. **Binnen tegels `@container` / `@[Npx]:`, nooit `lg:`/`xl:`.** De midden-zone is ~744px bij een open contextkolom.
9. **Geen localStorage.** Alles via Supabase. Vrije tekst nooit in events.
10. **Statusafleiding hoort in `src/lib/`, niet in de component.** De check bepaalt de staat, de UI leest hem uit.

---

## 7 · Werkregels die de kwaliteit bewaken

- **Bron vóór bewering.** Citeer `bestand:regel` als je zegt wat iets doet. Geen "waarschijnlijk" over code die je kunt openen.
- **Verzin geen concepten.** Elke naam, staat en surface bestaat al in een prebuild of besluitdoc. Heb je er een nodig die er niet is, leg hem voor — bouw hem niet stilletjes.
- **Prebuild ≠ src? Meld het, kies niet een derde vorm.**
- **Eén ding tegelijk.** Wordt een plak groter dan ~400 regels, splits hem en zeg dat.
- **Max drie vragen vooraf.** Daarna doorbouwen onder een expliciet genoemde aanname.
- **Nooit committen, nooit branchen, nooit resetten.** Ook niet als het werk af is. Toon de staat en de commando's, Dennis drukt zelf af.
- **Draai geen `next build` of `rm -rf .next`** — de dev-server draait.

---

## 8 · Klaar is pas klaar met

```
grep -rn "console.log" src/
npx tsc --noEmit
npx vitest run
npx eslint . --max-warnings 0
```

En: affiliate-slug-keys consistent in `src/data/affiliate-links.ts` ↔ `SupplementProduct` ↔ `ChoiceRoute`.
Mobiel 375px is de primaire breedte, niet de controle achteraf.

**Meetpunt meeleveren in dezelfde wijziging.** Elke nieuwe of geactiveerde CTA, brug, keuze-vertakking
of afvink-actie krijgt zijn event mee — geregistreerd op alle drie de plekken (`src/lib/events.ts`,
`src/lib/intake-events-client.ts`, allowlist in `src/app/api/intake/events/route.ts`). Hergebruik een
bestaand event-type vóór je een nieuw verzint. Sluit elke plak af met de regel:
"Meetpunt: `<event>` — hier lees je het effect af."

---

## 9 · Wat je níét doet

- Geen andere domeinen aanraken voor beweging staat. Blauwdruk eerst, uitrol later.
- Geen affiliate- of koop-elementen in Vandaag, Mijn Dag of Agenda.
- Geen `af_*`/PartnerDesk-werk, geen nieuwe tabellen zonder dat de gat-analyse ze eist.
- Geen refactor "omdat het toch open ligt".

---

## 10 · Eerste antwoord in de sessie

Begin met, in deze volgorde en verder niets:

1. Wat je gelezen hebt (bestand + waar je op lette), max 8 regels.
2. Elk conflict dat je in de bronnen vindt met N1–N4 uit §2 — bestand + regel, geen oplossing erbij. Vind je er geen, zeg dat in één regel.
3. Je voorstel voor poort 1: wat er precies verandert aan Vandaag (3a) en aan Favorieten (3b), in max 12 bullets samen.

Dan wachten.
