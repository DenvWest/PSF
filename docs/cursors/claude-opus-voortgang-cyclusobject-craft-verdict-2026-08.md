# Opus — Voortgang-hero: het cyclus-object als flagship

> **Datum:** 23 augustus 2026 · craft-ronde op de hero + de band, geen hub-redesign.
> **Getoetst tegen:** `main` + de werkboom van 23 augustus (o.a. `voortgang-horizon-copy.ts` nieuw,
> `voortgang-bewijs-copy.ts` verwijderd).
> **Prebuild:** [`docs/design/voortgang-cyclusobject-prebuild-2026-08.html`](../design/voortgang-cyclusobject-prebuild-2026-08.html)
> **Voorganger:** [`claude-opus-voortgang-bewijsband-ontwerp-2026-07.md`](claude-opus-voortgang-bewijsband-ontwerp-2026-07.md) (juli, geland) ·
> [`claude-opus-voortgang-leefstijlprofiel-doorstroom-verdict-2026-08.md`](claude-opus-voortgang-leefstijlprofiel-doorstroom-verdict-2026-08.md) §C (hero-herkadering, gisteren geland).

---

## Vooraf — twee dingen die ik moet melden

**1. F1–F3 kan ik niet verdicten.** De kop van de prompt (de architectuurvoorstel-tekst met de bevindingen
F1, F2 en F3) is niet meegeleverd; het plaksel begint bij "MAG NIET zonder PIVOT". Ik ga niet raden welke drie
bevindingen daar stonden. In plaats daarvan levert §A wat de prompt óók vraagt en wat ik wél kan onderbouwen:
de as-built-correcties en een gap-lijst van acht punten uit de live code. Zodra je F1–F3 nastuurt, is het
verdict per punt een aanvulling van twee alinea's — de rest van dit document verandert er niet van.

**2. De as-built in de prompt is één dag oud.** Drie citaten wijzen naar code die vanochtend is verdwenen.
Corrigeer de citaten, niet de richting:

| # | Prompt zegt | Werkelijkheid vandaag |
|---|---|---|
| C-a | "`H1_BY_STATE` en `REASSURANCE_BY_STATE` herschrijven" | Beide bestaan niet meer. `src/lib/voortgang-bewijs-copy.ts` is in de werkboom verwijderd; de hero draait op [`buildVoortgangHorizonRegel()`](../../src/lib/voortgang-horizon-copy.ts), die `eyebrow` + `h1` + `body` in één object teruggeeft. Er is geen aparte reassurance-regel meer om te herschrijven — die is opgegaan in `body`. |
| C-b | vier bewijs-states "wachtend · dun · opbouwend · beantwoord" | De vier live staten heten `wachtend · onderweg · tweede_beeld · hermeting_klaar` ([`voortgang-horizon-copy.ts:12-17`](../../src/lib/voortgang-horizon-copy.ts)). De as is ook een andere: niet activiteit maar tijd. §I mapt ze op elkaar. |
| C-c | "De bewijsregel blijft verbatim — citeer hem, herschrijf hem niet" | De bewijsregel is weg met `voortgang-bewijs-copy.ts`. Wat verbatim blijft staan in dit voorstel is de band-caption van vandaag: *"{activeDays} dagen waarop je iets pakte deze cyclus."* ([`voortgang-bewijsband.ts:120-124`](../../src/lib/voortgang-bewijsband.ts)) plus *"Je hermeting."* + de terugleesregel ([`:128-132`](../../src/lib/voortgang-bewijsband.ts)). |
| C-d | "instrument valt onder de fold op 375px" | Half waar. Hero en band zijn al één sectie: de band staat ín de hero-grid ([`VoortgangHero.tsx:163-168`](../../src/components/dashboard/voortgang/VoortgangHero.tsx)), op ≥1024px in de rechterkolom. Op 375px staat hij ná h1 + body + de CTA-rij. Dat is de fold-fout, en die is een **volgorde**probleem, geen ontbrekend instrument. |

---

## A. ARCHITECTUUR-OVERNAME

### (a) Wat ik overneem

1. **De job hoort in het eerste scherm.** Een tab die "wanneer wordt dit leesbaar" antwoordt, moet die zin
   letterlijk hebben staan. Vandaag staat er nergens dat een cyclus dertig dagen is; het getal zit verstopt in
   `CYCLE_LENGTH` en in de eyebrow als "DAG 12 VAN 30".
2. **Meettypen krijgen een eigen vorm.** Terecht en hard nodig — zie gap G3.
3. **Legenda in beeld, ook op 375px.** Overgenomen, met één aanscherping: de legenda toont alleen de vormen
   die in déze staat op de lijn staan (§E). Een legenda die "Domeincheck" belooft terwijl er geen domeincheck
   is, is dezelfde nep-diepte als een lege ladderrij.
4. **`activeDayNumbers` niet tekenen alsof het live is.** Overgenomen als harde regel; de prebuild zet het
   achter een toggle die UIT staat.
5. **Geen tweede score, geen streak, geen percentage-runway.** Overgenomen zonder voorbehoud.
6. **Golf 0 op bestaande data en bestaande events.** Overgenomen; §L laat zien dat het hele voorstel op
   Golf 0 past behalve één regel loader-code.

### (b) Waar ik afwijk

1. **De hero-body verhuist naar de readout, in plaats van dat er een tweede tekst bij komt.** Vandaag zegt de
   hero-body *"Over 18 dagen doe je je hermeting…"* ([`voortgang-horizon-copy.ts:69-73`](../../src/lib/voortgang-horizon-copy.ts))
   en zegt de band-caption *"Dag 12 · vandaag / 8 dagen waarop je iets pakte"*. Twee blokken lopende tekst
   boven elkaar, allebei over hetzelfde moment. In mijn voorstel is er één tekstvlak onder het instrument: de
   horizon-regel is de **ruststand** van dat vlak, een aangetikt merk vervangt hem. Dat wint ~70px op 375px en
   het maakt het instrument de bron van de tekst in plaats van een illustratie ernaast.
2. **De scrubber gaat niet weg maar omlaag (DEGRADE).** De prompt liet KEEP/KILL/DEGRADE open. Reden in §E.
3. **CTA's komen ná het instrument op 375px**, niet ervoor. De prompt vraagt "instrument in de eerste 600px";
   dat lukt alleen door de knoppenrij te laten zakken. In de prebuild zit het instrument op ~y=370 en de CTA's
   op ~y=690.
4. **Ik voeg één nieuw GA4-event toe** (`dashboard_voortgang_band_mark`) in plaats van het merk-tikken op
   `dashboard_voortgang_band_scrub` te enten. Reden in §G: anders kun je de twee interacties niet uit elkaar
   trekken, en de hele DEGRADE-beslissing hangt op die vergelijking.
5. **Domeinkleuren blijven staan naast de vormen.** De prompt verbiedt "kleur als enige onderscheid" — dat is
   iets anders dan kleur verbieden. Vorm draagt het *type*, kleur draagt het *domein*, en de aria-label draagt
   allebei in woorden.

### (c) Gap-lijst — acht punten uit de live code

| # | Gat | Bewijs |
|---|---|---|
| **G1** | De job van de cyclus staat nergens. "DAG 12 VAN 30" is een teller, geen uitleg van waarvan 30 het einde is. | [`voortgang-horizon-copy.ts:66`](../../src/lib/voortgang-horizon-copy.ts) |
| **G2** | Geen legenda. De ruit is onverklaard; de gebruiker moet tikken om te weten wat hij ziet. | [`VoortgangBewijsband.tsx:100-141`](../../src/components/dashboard/voortgang/VoortgangBewijsband.tsx) |
| **G3** | **Alle** meetmomenten zijn dezelfde ruit; alleen de fill verschilt (`PILLAR[id].color`, of `#E7EDE8` voor de leefstijlcheck). Kleur is dus het enige onderscheid tussen "je startcheck" en "je slaapcheck" — precies wat de eigen a11y-lat verbiedt. | [`:102`](../../src/components/dashboard/voortgang/VoortgangBewijsband.tsx) en [`:120-133`](../../src/components/dashboard/voortgang/VoortgangBewijsband.tsx) |
| **G4** | De merken zijn **niet aantikbaar**. Er is één interactie: een `<input type="range">` over 30 dagen. Je kunt een meting alleen bereiken door er toevallig op te landen. | [`:415-432`](../../src/components/dashboard/voortgang/VoortgangBewijsband.tsx) |
| **G5** | Op dag 12 met twee checks antwoordt **22 van de 30** scrubposities *"Nog geen bijzonderheid gelogd op deze dag."* De dominante uitkomst van de enige interactie is leegte. | [`voortgang-bewijsband.ts:114-117`](../../src/lib/voortgang-bewijsband.ts) |
| **G6** | `activeDays` bestaat wel maar staat nergens op de as — alleen in de caption van één dag (vandaag). Je "8 actieve dagen" zijn onzichtbaar tot je precies op vandaag staat. | [`:120-124`](../../src/lib/voortgang-bewijsband.ts) |
| **G7** | Dubbeling hero ↔ band: `daysUntilRemeasure` staat in de hero-body én de hermetingsdatum staat op de band; op 375px lees je twee keer hetzelfde wachten. | [`voortgang-horizon-copy.ts:69-73`](../../src/lib/voortgang-horizon-copy.ts) vs [`VoortgangBewijsband.tsx:164-179`](../../src/components/dashboard/voortgang/VoortgangBewijsband.tsx) |
| **G8** | De hele SVG heeft één `aria-label` van 20 woorden en `role="img"`; screenreader-gebruikers krijgen de merken niet los. De range-input is het enige focusbare element. | [`:71-76`](../../src/components/dashboard/voortgang/VoortgangBewijsband.tsx) |

### (d) Open spanningen

- **Beweging is terracotta.** `PILLAR.beweging.color = #C26E4B` ([`data/dashboard/index.ts:92`](../../src/data/dashboard/index.ts)).
  Zodra iemand een beweegcheck doet, staat er een terracotta ruit op een hero waar terracotta verboden is. Mijn
  lezing: het verbod geldt het **pagina-accent** (knoppen, lijnen, koppen), niet de domeinlegenda — daar is
  kleur data. Als jij dat anders leest, is de enige eerlijke uitweg de domeinkleur van de band halen en het
  domein alleen in vorm+tekst te dragen; dan verliest de band zijn snelste leesbaarheid.
- **Voeding is `#5A8F6A` — exact `--sage`.** Een voedingscheck-ruit heeft dezelfde kleur als "vandaag" en
  "hermeting". Dit is de scherpste illustratie waarom G3 opgelost moet worden: zonder vormverschil zijn die
  drie dingen op 375px letterlijk niet te onderscheiden. Opgelost in het voorstel; niet opgelost in live.
- **De Golf 1-stokjes lijken op adherence-stokjes.** De prompt verbiedt "nep-adherence-stokjes". Mijn tekens
  zijn echt (gelogde dagen), maar de vorm is dezelfde. Regel: ze mogen alleen mee als de loader echte
  datums teruggeeft, nooit als afgeleide van `activeDays`.

---

## B. JOB EN INVARIANT

> **Dit object toont waar je staat tussen je leefstijlcheck en je hermeting, en welke metingen daar tot nu toe
> op zijn gevallen — zodat "nog niets te zien" een datum krijgt in plaats van een gevoel.**

Drie dingen die de hero daardoor **niet** doet:

1. **Geen oordeel over de gebruiker.** Geen "goed bezig", geen dagteller als prestatie, geen streak. De as is
   tijd, niet gedrag. `activeDays` is een feit in een caption, geen kop.
2. **Geen score en geen richting.** Waar je staat (score, band, delta) is van Kompas home
   ([`FocusVoortgangPanel.tsx:143-163`](../../src/components/dashboard/kompas/FocusVoortgangPanel.tsx)) en van
   "Je stand" op het domeinscherm. De hero mag het verschil noemen zodra er twee metingen zijn — in woorden,
   niet als tweede getal-object.
3. **Geen actieplanning.** Wat je vandaag doet is Mijn Dag. De hero linkt erheen, hij toont het niet.

---

## C. DATA-INVENTARISMATRIX

### LIVE — staat al op de hub en wordt gebruikt

| Veld | Bron | Wat het draagt |
|---|---|---|
| `cycleEvidence.cycleDay` | [`daily-action-log.ts:158-161`](../../src/lib/daily-action-log.ts) | positie van "vandaag" op de as, eyebrow |
| `cycleEvidence.cycleStartDate` / `cycleEndDate` | [`types/dashboard.ts:277-278`](../../src/types/dashboard.ts) | begin- en einddatum onder de as |
| `cycleEvidence.daysUntilRemeasure` | [`daily-action-log.ts:162-165`](../../src/lib/daily-action-log.ts) | horizon-body |
| `cycleEvidence.activeDays` | [`daily-action-log.ts:148-152`](../../src/lib/daily-action-log.ts) | caption op "vandaag" (verbatim) |
| `remeasure.dueDate` / `daysUntil` | [`types/dashboard.ts:272`](../../src/types/dashboard.ts) | hermetingsmerk, CTA-schakelaar (`<= 14`) |
| `domainCheckDaysAgo` | [`types/dashboard.ts:296`](../../src/types/dashboard.ts) | de domeinmerken; `cycleDay - daysAgo` |
| `model.priority` | `DashboardModel` | terugleesregel, "Bekijk je {domein}" |
| `model.trend[..].length` + `model.deltaOf()` | `DashboardModel` | staat `tweede_beeld` |

### ONDERBENUT — bestaat, wordt hier niet gebruikt

| Veld | Wat het visueel kan dragen | Zonder loader? |
|---|---|---|
| het **type** van een meting | Vandaag afgeleid uit `pillarId == null`; kan `kind: "start" \| "domein"` worden in `measurementsOf()` | ja — puur afleiding |
| `remeasure.daysUntil <= 0` | de "hermeting klaar"-staat van het object (as volledig massief, ring gevuld) | ja |
| `PILLAR[id].label` | aria + caption per merk, in plaats van één zin over de hele svg | ja |

### ELDERS EIGENAAR — niet stelen

`deltaReport` ([`types/dashboard.ts:280`](../../src/types/dashboard.ts)) hoort bij de hermetingsuitslag ·
domeinscore/band/sparkline horen bij Kompas home en "Je stand" · het eigen ijkpunt hoort bij de hub-rij en de
check-uitslag (doorstroom-verdict §B) · `planProgress` hoort bij Mijn Dag.

### TOEKOMSTSLOT — bestaat als idee, niet als data

Pulse-meting tussen twee checks · wearable-punten (`hrv`, `rustpols` staan op `status: "binnenkort"` met
`data: []`, [`data/dashboard/index.ts:170-186`](../../src/data/dashboard/index.ts)). Beide krijgen **geen**
vorm in de legenda tot er een rij in zit. Een lege legenda-regel is een belofte.

### VEREIST NIEUW

Eén veld, één regel loader: **`cycleEvidence.activeDayNumbers: number[]`**.
`getDailyActionCycleEvidence()` ([`daily-action-log.ts:131-167`](../../src/lib/daily-action-log.ts)) haalt de rijen al op en gooit ze weg:

```ts
// daily-action-log.ts:148-152 — de datums bestaan al, alleen .size overleeft
const activeDays = new Set((data ?? []).map((row) => row.log_date as string)…).size;
```

Golf 1 = die Set omzetten naar dagnummers t.o.v. `startDate` en meesturen. **Geen migratie, geen extra query,
geen nieuwe tabel.** Tot dat er is: niet tekenen. In de prebuild staat het achter een toggle die uit staat.

---

## D. FIRST VIEWPORT

**Scenario:** man, dag 12 van 30, één leefstijlcheck (dag 1), slaapcheck 4 dagen geleden (dag 8),
voedingscheck 9 dagen geleden (dag 3), `activeDays: 8`, `daysUntilRemeasure: 18`, staat `onderweg`,
prioriteit slaap.

### 375px — element voor element (y vanaf de bovenkant van het hero-vlak)

| y | Element | Copy-intentie |
|---|---|---|
| 26 | eyebrow `JE CYCLUS · DAG 12 VAN 30` | plaatsbepaling, geen kop |
| 44 | **h1** (serif, 2 regels) — *"Dag 12 van je cyclus."* | rustig feit; geen belofte, geen compliment |
| 118 | **job-zin** (2–3 regels, muted) — *"Dit vlak telt af van je leefstijlcheck naar je hermeting: **dertig dagen**. Wat je daartussen meet, staat hier als merk op de lijn."* | G1 gedicht: waarvan is 30 het einde, en wat betekenen die merken |
| 196 | sectiekopje *Je cyclus* + `12 aug → 10 sep` | het object krijgt een naam en een bereik |
| 226 | **het instrument** (aspect 340×120, ~124px hoog) | zie §E |
| 356 | **legenda** (2 regels op 375px, alleen de vormen die nú op de lijn staan) | G2 gedicht |
| 400 | **readout** — ruststand = de horizon-regel; na een tik = de caption van dat merk | één tekstvlak i.p.v. twee |
| 500 | `＋ Loop dag voor dag door je cyclus` (44px, dicht) | de scrub gedegradeerd, niet gesloopt |
| 546 | CTA-rij: primair *Wat staat er voor vandaag* + tekstlink *Bekijk je slaap* | de deur uit dit scherm |
| 600 | (einde hero-vlak) | |

**De lat is gehaald:** instrument volledig binnen de eerste 600px, mét legenda en de eerste regel van de
readout. Gemeten in de prebuild op een 375×812-emulatie: instrument y≈370 inclusief de reviewer-balk
(≈144px) die in productie niet bestaat.

### Desktop (≥1024px)

Twee kolommen, zoals live ([`VoortgangHero.tsx:106`](../../src/components/dashboard/voortgang/VoortgangHero.tsx)):
links eyebrow + h1 + job-zin; rechts het instrument in het paneel (`rounded-[20px] border bg-black/22 p-[22px]`),
mét legenda en readout eronder — en de CTA-rij **onder het paneel**, niet onder de h1. Afwijking van live
(daar hangen de CTA's links). Reden: de knop moet volgen op de conclusie die je net las, en die conclusie
staat rechts.

---

## E. FLAGSHIP-VISUAL — het cyclus-object

### De keuze

**Blijf bij de horizontale 30-daagse as. Verander wat erop staat, niet de vorm van de as.**

### Meet-semantiek — type → vorm → label

| Type | Vorm | Positie | Legenda-label | Caption bij tik |
|---|---|---|---|---|
| Startcheck | **gevulde cirkel** `#E7EDE8`, r=5 | laan boven de as | Startcheck | *"Dag 1 · 12 aug — Je leefstijlcheck. Hier begint de vergelijking."* |
| Domeincheck | **ruit** in `PILLAR[id].color` | laan boven de as | Domeincheck | *"Dag 8 · 19 aug — Je mat je slaap."* (verbatim uit [`voortgang-bewijsband.ts:108-112`](../../src/lib/voortgang-bewijsband.ts)) |
| Vandaag | **driehoek** + korte lijn, `--sage` | op de as | Vandaag | *"Dag 12 · vandaag — 8 dagen waarop je iets pakte deze cyclus."* (verbatim) |
| Hermeting | **open ring**, `--sage` | op de as, rechts | Hermeting | *"Dag 30 · 10 sep — Je hermeting."* + terugleesregel (verbatim) |
| *(Golf 1)* actieve dag | **staafje onder de as**, 1,8×7 | onder de as | Dag waarop je iets pakte | geen — niet aantikbaar |
| *(toekomstslot)* pulse / wearable | — | — | **geen legenda-regel tot er data is** | — |

Vier vormen, vier lagen betekenis, en kleur is nergens het enige verschil. De legenda toont alleen wat er
staat: in `wachtend` blijft alleen "Hermeting" over.

### Twee interacties, één botsingsregel

- **Tik op een merk.** Elk merk krijgt een echte `<button>` van 44×44 boven de svg (geen `<g role="button">`),
  met `aria-label` in woorden: *"Je slaap gemeten op dag 8"*. Dat dicht G4 én G8 in één keer.
- **Botsing.** Dag 1 en dag 3 staan 21 user-units uit elkaar op een as van 308 — dat is ~21px op 375px, en dus
  onbruikbaar naast elkaar. Regel: merken worden links→rechts gelegd met een minimum van 34 units; wie te dicht
  komt schuift op, en het steeltje loopt schuin naar de **echte** dag op de as. De datum in de caption blijft de
  echte dag. Zichtbaar in de prebuild bij de voedingscheck van dag 3.

### Twee alternatieven, afgewogen

| Alternatief | Waarom niet |
|---|---|
| **Verticale tijdlijn-lijst** (merk per rij, datum links, tekst rechts) | Leest perfect op 375px en heeft geen botsingsprobleem. Maar hij toont de **afstand** niet: 22 lege dagen tussen twee checks zien er hetzelfde uit als 2. En de kern van deze tab is precies dat "er zit nog tijd tussen". Bovendien wordt het een derde lijst op een tab die al twee lijsten heeft. |
| **Kalenderstrip van 30 vakjes** (5×6 of 30×1) | Maakt `activeDayNumbers` prachtig zichtbaar en de afstand klopt. Maar hij is pas eerlijk als Golf 1 er is; zonder dagdata zijn 22 van de 30 vakjes leeg en lees je een adherence-raster dat je nooit kunt vullen. Precies de "nep-adherence" uit het verbod. Kandidaat voor Golf 2, niet nu. |
| **Gekozen: as met getypeerde merken** | Behoudt afstand én tijd, werkt met 1 meting net zo goed als met 5, en heeft geen enkel vak dat om vulling vraagt. |

### Scrubber: **DEGRADE**

Niet KILL (hij is de enige manier om de toekomst te bevragen, en de `toekomst`-caption *"Wat je tussen nu en
dan neerzet, lees je op 10 sep terug"* is het enige echte antwoord dat deze tab heeft op ongeduld). Niet KEEP
als primaire interactie, want G5: 22 van de 30 posities antwoorden met leegte, en dat is nu de startstand van
elke interactie.

**Nieuwe rol:** de merken zijn de eerste interactie; de scrub zit onder een 44px-knop *"＋ Loop dag voor dag
door je cyclus"* die dicht staat. Wie hem opent krijgt exact de bestaande `buildBandCaption()`-logica,
inclusief `scrubZone` en het bestaande event. Zo meet je in één cyclus of iemand hem nog opent — en dat is de
input voor KILL in een volgende ronde.

### Waarom dit geen tweede score is

De as is een **kalender**, geen schaal: de x-positie is een datum, niet een waarde. Er is geen y-as, geen
aggregatie, geen kleur die "beter" betekent, geen getal dat optelt. De enige getallen in beeld zijn twee
datums en een dagnummer. Een meting die "goed" ging en een die "slecht" ging krijgen exact hetzelfde merk.

---

## F. PLAATS IN DE HUB-SCROLL

Geen hub-redesign. Onder het hero-vlak blijft staan wat er staat:

1. **De regel *"Je werkt aan slaap. Naar Vandaag →"*** ([`VoortgangHubScroll.tsx:80-92`](../../src/components/dashboard/voortgang/VoortgangHubScroll.tsx)) — **blijft**, ongewijzigd. Hij is de enige regel die de brug naar Kompas legt en hij is één zin.
2. Daaronder `VoortgangDomeinRing` — **blijft**, buiten scope (zie §J).

**Contrast-zin.** Het hero-vlak stopt zichtbaar: `#132414` met afgeronde onderhoeken, daarna het gewone
dashboard-oppervlak. De hero gaat over **tijd** en heeft geen enkel domein-detail; alles vanaf de "Je werkt
aan"-regel gaat over **domeinen** en heeft geen datum. Zodra iemand een datum onder de vouw ziet staan, is de
grens lek.

---

## G. CONVERSIEKAART + MEETPUNTEN

### CTA-hiërarchie per staat

| Staat | Primair | Secundair | Soft |
|---|---|---|---|
| `wachtend` | *Wat staat er voor vandaag* → Mijn Dag | — | *Bekijk je slaap* (tekstlink) |
| `onderweg` | *Wat staat er voor vandaag* | — | *Bekijk je slaap* |
| `tweede_beeld` | *Wat staat er voor vandaag* | *Bekijk je slaap* (knop) | tik op een merk |
| `hermeting_klaar` | *Naar je hermeting* | *Wat staat er voor vandaag* | *Bekijk je slaap* |

De schakelaar is de bestaande `remeasure.daysUntil <= 14`
([`VoortgangHero.tsx:56-57`](../../src/components/dashboard/voortgang/VoortgangHero.tsx)) — niet aanpassen.

### Hergebruik (geen registratie nodig, GA4-only zoals nu)

- `dashboard_voortgang_hub_click` — `{ destination: "agenda" | "hermeting", surface: "cyclus_hero" }`
  (`surface` gaat van `"bewijs_hero"` naar `"cyclus_hero"`; het is een vrije parameter, geen enum in code)
- `dashboard_voortgang_domein_click` — `{ domain }`
- `dashboard_voortgang_horizon_state` — `{ state, cycle_day, days_until_remeasure }`, ongewijzigd
- `dashboard_voortgang_band_scrub` — `{ zone }`, ongewijzigd; hij meet nu alleen nog de **gedegradeerde** scrub

### Nieuw (apart gehouden)

**`dashboard_voortgang_band_mark`** — `{ kind: "start" | "domein" | "vandaag" | "hermeting", domain?: PillarId, day: number }`.
GA4 + `clarityTag("dashboard_voortgang", "band_mark")`. **Geen durable `domain_events`-rij**: dit is
UI-nieuwsgierigheid, geen gedragsfeit, en het hoort niet in PostHog naast echte lifecycle-events. Geen PII —
`day` is een cyclusdagnummer, geen datum, en `domain` is een enum.

Het is één event met een `kind`-parameter en niet vier events, zodat je met één GA4-rapport de vraag kunt
beantwoorden die deze ronde stelt: *wordt er getikt in plaats van gescrubd?*

**Meetpunt: `dashboard_voortgang_band_mark` (nieuw) tegenover `dashboard_voortgang_band_scrub` (bestaand),
met `dashboard_voortgang_horizon_state` als noemer — hier lees je het effect af.** Concreet: het aandeel
sessies met minstens één `band_mark` is de winst van G4; blijft `band_scrub` daarnaast dominant, dan was
DEGRADE te voorzichtig en mag KILL van tafel.

---

## H. COPY-RICHTING

**Job-zin (nieuw, onder de h1):**
> Dit vlak telt af van je leefstijlcheck naar je hermeting: **dertig dagen**. Wat je daartussen meet, staat
> hier als merk op de lijn.

In `wachtend`: tweede zin wordt *"Je lijn begint zodra je eerste dag is gelogd."*

**H1 per staat** — ongewijzigd overgenomen uit [`voortgang-horizon-copy.ts`](../../src/lib/voortgang-horizon-copy.ts).
Ze zijn gisteren geschreven, ze staan goed, en de prompt vroeg om herschrijven van een bestand dat niet meer
bestaat. Voor de volledigheid:

| Staat | H1 |
|---|---|
| `wachtend` | *Je eerste beeld staat. Het tweede is waar het leesbaar wordt.* |
| `onderweg` | *Dag {n} van je cyclus.* |
| `tweede_beeld` | *Er staat nu meer dan één meting.* |
| `hermeting_klaar` | *Je hermeting staat klaar.* |

**Legenda-labels:** Startcheck · Domeincheck · Vandaag · Hermeting · *(Golf 1)* Dag waarop je iets pakte.
Geen "meting 1/2/3", geen afkortingen.

**Captions bij tik** — verbatim waar ze bestaan, één nieuwe:

- startcheck (nieuw): *"Dag 1 · 12 aug — Je leefstijlcheck. Hier begint de vergelijking."*
- domeincheck: *"Je mat je slaap."* — verbatim [`voortgang-bewijsband.ts:111`](../../src/lib/voortgang-bewijsband.ts)
- vandaag: *"{activeDays} dagen waarop je iets pakte deze cyclus."* — verbatim [`:123`](../../src/lib/voortgang-bewijsband.ts)
- hermeting: *"Je hermeting."* + *"Hier lees je terug of er beweging in je slaap zit."* — verbatim [`:130-131`](../../src/lib/voortgang-bewijsband.ts)

**Lege staat (scrub op een dag zonder meting):** *"Geen meting op deze dag."* — korter dan het huidige
*"Nog geen bijzonderheid gelogd op deze dag."*, dat suggereert dat er iets te loggen viel en dat je dat hebt
nagelaten. WRITING_VOICE: geen schuld waar geen norm is.

**Verboden formuleringen op dit vlak:** "je bent goed bezig", "dankzij", "daardoor", "je hebt X% gehaald",
elk woord dat een oorzaak legt tussen een gelogde dag en een score.

---

## I. LEGE EN DUNNE STATES

De prompt noemt vier bewijs-states; de code kent er vier andere. Mapping:

| Prompt | Live | Wat het instrument toont |
|---|---|---|
| wachtend | `wachtend` (`cycleEvidence == null`) | Gestippelde as over de volle breedte, startpunt en **hermetingsring met datum**. Geen vandaag-driehoek, geen merken. Legenda: alleen "Hermeting". Readout = de horizon-regel met de datum. **De hermetingsdatum blijft altijd staan** — dat is het enige harde feit in deze staat. |
| dun | `onderweg`, `cycleDay <= 3` | Massief lijnstuk van 1–3 dagen, startcheck-cirkel, vandaag-driehoek er vlak naast. Geen triomf: de h1 is *"Dag 2 van je cyclus."* en niets meer. Botsingsregel duwt de driehoek weg van de cirkel. |
| opbouwend | `onderweg` | De blauwdruk uit §D. |
| beantwoord | `tweede_beeld` / `hermeting_klaar` | `tweede_beeld`: meer merken, as bijna vol, readout noemt het verschil in woorden. `hermeting_klaar`: as volledig massief, **vandaag-driehoek verdwijnt** (hij valt samen met de hermeting), ring wordt gevuld, halo sterker. Dat is het enige moment waarop het object "af" oogt. |

Alle vier veranderen het **instrument**, niet alleen de kop — schakelbaar in de prebuild.

---

## J. WAT BUITEN SCOPE BLIJFT

`VoortgangDomeinRing` · het leefstijlprofiel (landing + domeinscherm) · `PrioriteitenLadder` ·
het eigen ijkpunt · de dekkingsregel. `VoortgangRichtingBeat`, `VoortgangOverTijdSection` en
`LeefstijllijnSection` staan in de prompt maar **bestaan niet meer** (verwijderd in `a0174caa`).

De nieuwe hero maakt de domeinrij niet overbodig en dupliceert hem niet: de hero heeft geen enkel domeincijfer
en de domeinrij heeft geen enkele datum-op-een-as. Waar ze elkaar raken is `domainCheckDaysAgo` — de hero
gebruikt het als **positie in de tijd** ("dag 8"), de rij als **versheid** ("4 dagen geleden gemeten"). Dat is
hetzelfde veld in twee talen, en dat is precies wat je wil: de hero zegt wanneer, de rij zegt hoe vers.

---

## K. HTML-PREBUILD

**Bestand:** [`docs/design/voortgang-cyclusobject-prebuild-2026-08.html`](../design/voortgang-cyclusobject-prebuild-2026-08.html)
· standalone, geen build, DM Serif Display + DM Sans via Google Fonts met system-fallback.

**Volgorde in de HTML:** reviewer-balk (staten + Golf 1-toggle, géén product) → hero-vlak: eyebrow · h1 ·
job-zin · `Je cyclus` + bereik · svg-instrument met knoppenlaag · legenda · readout (`aria-live`) ·
scrub-toggle + range · CTA-rij · event-toast → onder de hero: de echte "Je werkt aan slaap"-regel + één
gestippelde placeholder, **geen nep-DomeinRing**.

**Mockvelden** (echte namen, man op dag 12): `cycleEvidence.activeDays: 8` · `cycleEvidence.cycleDay: 12` ·
`cycleEvidence.daysUntilRemeasure: 18` · `cycleEvidence.cycleStartDate: "2026-08-12"` · `cycleEndDate` ·
`remeasure.dueDate: "2026-09-10"` · `remeasure.daysUntil: 18` · `domainCheckDaysAgo: { slaap: 4, voeding: 9 }` ·
`model.priority: { id: "slaap", label: "Slaap" }` · `model.trendLength` · `model.focusDelta` ·
`golf1.activeDayNumbers` (apart object, alleen achter de toggle). `measurementsOf()` en `buildBandCaption()`
zijn 1:1 overgezet uit `voortgang-bewijsband.ts`; `PILLAR`-kleuren 1:1 uit `data/dashboard/index.ts`.

**Drie bewuste afwijkingen t.o.v. de code van vandaag:**

1. **`kind` op `BandMeasurement`.** De prebuild geeft elk merk een type en tekent er een eigen vorm bij; live
   is alles een ruit met een andere fill. Dit is het hart van het voorstel en het vraagt één veld in
   `measurementsOf()`.
2. **De hero-body is weg als los blok.** In de prebuild is de horizon-regel de ruststand van de readout onder
   het instrument. Live staan het twee gescheiden tekstblokken (hero links, caption rechts/onder).
3. **De scrub staat dicht en de merken zijn knoppen.** Live is de range de enige interactie en staat hij open;
   in de prebuild is hij een secundair uitklapje en zijn er vijf `<button>`s van 44×44 over de svg.

**Geverifieerd in Chrome** op 375×812 (device-emulatie) en 1280×900: geen horizontale scroll in geen enkele
staat, geen console-fouten, alle tikdoelen exact 44×44, legenda volgt de getekende vormen, instrument volledig
binnen de eerste 600px van het hero-vlak.

---

## L. BOUWGOLVEN

**Golf 0 — bestaande data, bestaande events, geen schema, geen loader.**
`kind` op de merken + vier vormen + legenda + merk-knoppen + job-zin + readout-samenvoeging + scrub-degrade +
`dashboard_voortgang_band_mark`. Alles rekent op `cycleEvidence` en `domainCheckDaysAgo` zoals ze vandaag
binnenkomen. Dit is de hele §D-blauwdruk.

**Golf 1 — loader-only.**
`activeDayNumbers` uit `getDailyActionCycleEvidence()` (de datums worden nu weggegooid), plus de staafjes
onder de as en één legenda-regel. Eén bestand, één type-uitbreiding, geen migratie. Pas bouwen als iemand
vraagt "welke dagen dan" — het is een antwoord, geen decoratie.

**Golf 2 — niet nu.** De kalendervariant uit §E wordt pas eerlijk als Golf 1 er is. Niet plannen.

**Waarom deze craft-ronde nu en niet ná het cohort.** Omdat Golf 0 geen enkele aanname over gedrag maakt: hij
repareert drie dingen die *fout* zijn ongeacht wat een cohort laat zien — kleur als enig onderscheid (a11y),
merken die je niet kunt aantikken (interactie), en een instrument dat op 375px onder de knoppen ligt (fold).
Dat zijn defecten, geen hypotheses. Wat wél op het cohort moet wachten is de KILL van de scrubber; daarom
DEGRADE en een meetpunt in plaats van een besluit.

---

## M. CURSOR-BOUWPAKKET

**Bestanden, in deze volgorde:**

1. **`src/lib/voortgang-bewijsband.ts`**
   - `BandMeasurement` krijgt `kind: "start" | "domein"`.
   - `measurementsOf()` zet `kind: "start"` op dag 1 en `kind: "domein"` op de rest.
   - `buildBandCaption()`: nieuwe tak voor de startcheck (*"Je leefstijlcheck. Hier begint de vergelijking."*);
     `"Nog geen bijzonderheid gelogd op deze dag."` → `"Geen meting op deze dag."`. De overige teksten
     **ongewijzigd**.
   - Nieuw: `buildMarkAriaLabel(m: BandMeasurement): string`.

2. **`src/lib/__tests__/voortgang-bewijsband.test.ts`**
   - `measurementsOf` → `kind` per rij; bestaande asserties uitbreiden, niet vervangen.
   - `buildBandCaption` → de twee gewijzigde takken; de vier bestaande takken moeten letterlijk gelijk blijven.

3. **`src/components/dashboard/voortgang/VoortgangBewijsband.tsx`**
   - Vier vormen (`renderMark(kind)`); botsingslayout met `MIN_GAP = 34` en schuine steel.
   - `<svg aria-hidden>` + een absoluut gepositioneerde laag `<button className="mark">` per merk (44×44,
     `aria-label`, `aria-pressed`).
   - Legenda als `<ul>` onder de svg, items alleen tonen wat in deze staat getekend is.
   - Readout: `selected` state; ruststand = de horizon-regel via een nieuwe prop `restCaption`.
   - Scrub achter een `aria-expanded`-knop, default dicht; `dashboard_voortgang_band_scrub` ongewijzigd.
   - Nieuw event `dashboard_voortgang_band_mark` + `clarityTag`.

4. **`src/components/dashboard/voortgang/VoortgangHero.tsx`**
   - Job-zin onder de h1 (twee varianten: met/zonder `cycleEvidence`).
   - De `regel.body`-`<p>` verdwijnt; `regel.body` gaat als `restCaption` naar de band.
   - Mobiele volgorde: instrument vóór de CTA-rij (op `lg` blijft de grid zoals hij is; CTA's verhuizen naar
     de rechterkolom onder het paneel).
   - `surface: "bewijs_hero"` → `"cyclus_hero"` in beide `hub_click`-aanroepen.

5. **`src/components/dashboard/voortgang/__tests__/VoortgangBewijsband.test.tsx`** *(nieuw)*
   - vier merk-knoppen aanwezig met de juiste `aria-label`; tik zet de readout; legenda-items volgen de staat.

**Vijf acceptatiecriteria**

1. Op 375px staat het instrument volledig boven de CTA-rij en binnen de eerste 600px van het hero-vlak; niets
   scrollt horizontaal, in alle vier de staten.
2. Elk meetmoment is een `<button>` van minimaal 44×44 met een `aria-label` in woorden; tabben loopt
   chronologisch en de readout volgt (`aria-live="polite"`).
3. De vier typen zijn zonder kleur uit elkaar te houden (cirkel / ruit / driehoek / open ring) en de legenda
   toont uitsluitend typen die in deze staat getekend zijn.
4. De vier bestaande caption-teksten uit `voortgang-bewijsband.ts` staan letterlijk ongewijzigd in de output;
   `vitest` op het bestaande testbestand blijft groen op die vier takken.
5. `dashboard_voortgang_band_mark` vuurt één keer per tik met `kind` en (bij een domeincheck) `domain`; er komt
   geen tweede score, percentage of streak op het vlak, en `activeDayNumbers` wordt nergens getekend.

**Niet aanraken:** `Dashboard.tsx` · `VoortgangDomeinRing.tsx` · `LeefstijlprofielKeuzeHub.tsx` ·
`LeefstijlprofielDomeinScherm.tsx` · `PrioriteitenLadder.tsx` · `DomainKompasScreen.tsx` ·
`FocusVoortgangPanel.tsx` · `voortgang-horizon-copy.ts` (de vier H1's blijven zoals ze zijn) ·
`daily-action-log.ts` (pas in Golf 1) · alle schap- en favorietenlogica.

---

## N. BEWUST NIET

- **Geen cirkel / "true cycle".** Een ronde 30-dagenklok suggereert dat je terugkomt waar je begon; de
  hermeting is juist een ander punt dan de start. Bovendien kost een cirkel op 375px de helft van de breedte.
- **Geen radar / spinnenweb.** Dat is een domeinvergelijking, en domeinen zijn hier niet het onderwerp.
- **Geen percentagebalk "60% van je cyclus".** Verkapte score, en hij beloont wachten.
- **Geen streak, vlam, badge of afvinkcirkel.**
- **Geen tweede bewijsband.** Eén tijdobject per app.
- **Geen `activeDayNumbers` in Golf 0.** Het veld bestaat niet in de loader-output; tekenen zou verzinnen zijn.
- **Geen sparkline in de hero.** `buildLeefstijllijnRows` hoort op het domeinscherm en op Kompas-domein.
- **Geen live React uit deze ronde.** De prebuild is het reviewbare artefact; §M is wat er daarna gebouwd wordt.
- **Geen KILL van de scrubber.** Verdedigbaar, maar niet zonder één cyclus meetdata — daarom DEGRADE + meetpunt.

---

## Kritiekronde

**1 · Gedragswetenschapper.**
(a) Een aantikbaar merk beloont *terugkijken*, en op dag 12 valt er weinig terug te kijken — het risico is een
leuk speeltje dat leegte etaleert. (b) De job-zin "dertig dagen" kan als straf landen bij iemand op dag 3.
(c) `hermeting_klaar` is de enige staat met een gevoel van afronding; 29 van de 30 dagen voelt het object
onaf. → **Doorgevoerd:** de readout heeft altijd een ruststand met een *datum* in plaats van een aansporing,
en de lege-dagtekst is ontdaan van verwijt (*"Geen meting op deze dag."*).

**2 · Man 45, dag 12, drukke week, één meting. Drie seconden.**
Hij ziet: *Dag 12 van je cyclus* · een lijn met drie merkjes en een driehoek in het midden · rechts *10 sep* ·
eronder *"Over 18 dagen doe je je hermeting."* Conclusie in drie seconden: **het loopt, ik hoef nu niets, over
18 dagen weet ik meer.** Dat is de bedoeling. Kritiek: hij weet niet wat de gekleurde ruitjes betekenen tot
zijn oog de legenda vindt. → **Doorgevoerd:** legenda direct onder de svg, niet onder de readout, en beperkt
tot de vormen die er staan (in `onderweg` vier items over twee regels).

**3 · Compliance (KOAG / AVG art. 9).**
(a) Geen verkapte totaalscore: geen y-as, geen aggregatie, geen kleurschaal — akkoord. (b) Causaliteit: de
combinatie van dagstaafjes (Golf 1) en meetmerken op één as kán als "mijn dagen veroorzaakten mijn score"
lezen. → **Doorgevoerd:** de staafjes staan aan de **andere kant** van de as dan de metingen, ze zijn niet
aantikbaar, en er is geen enkele copy die de twee verbindt. (c) PII: `dashboard_voortgang_band_mark` bevat
`day` (een cyclusdagnummer, geen datum) en `domain` (enum). Geen datums, geen e-mail, geen sessie-id in GA4.
(d) Geen medische claim in de nieuwe copy — "Je mat je slaap" is een handeling, geen bevinding.

**4 · Frontend.**
(a) De botsingsregel moet in de **layout**functie zitten en niet in de render, anders is hij niet te testen. →
**Doorgevoerd:** `layout()` is in de prebuild een pure functie en gaat als zodanig naar `voortgang-bewijsband.ts`.
(b) De knoppenlaag boven de svg werkt alleen als de svg `width:100%; height:auto` houdt met dezelfde viewBox-
ratio als de container (`aspect-ratio: 340/120`); anders lopen knop en vorm uit elkaar bij een breedtewissel.
Vastgelegd als eis. (c) `Dashboard.tsx` blijft bevroren — geen van de vier bestanden in §M raakt eraan.
(d) Realisme Golf 0: het enige echte werk is de knoppenlaag; de rest is copy en vormen. Schatting: één
zitting.

**Gewijzigd t.o.v. mijn eerste versie:** de legenda is state-afhankelijk geworden (was: altijd vier items) ·
de startdatum verdwijnt in `wachtend` in plaats van als "—" te blijven staan · de aria-labels zijn grammaticaal
Nederlands (*"Je slaap gemeten op dag 8"* i.p.v. *"Je slaapcheck, dag 8"*) · de lege-toast is weg.

---

## Aanbeveling in één alinea

Bouw Golf 0 en niets anders. Het instrument dat er staat is goed bedacht maar half afgemaakt: het draagt vier
soorten betekenis in één vorm, het laat zich alleen bedienen via een schuif die in 22 van de 30 posities
"niets" antwoordt, en op 375px ligt het onder de knoppen. Dat zijn drie defecten, geen smaakkwesties, en ze
kosten samen één zitting omdat alle data er al ligt. Laat de scrubber leven maar zet hem dicht, meet één
cyclus lang of er getikt wordt in plaats van geschoven, en beslis daarna pas over KILL. `activeDayNumbers` is
verleidelijk — het is één regel loader-werk — maar het is het antwoord op een vraag die nog niemand heeft
gesteld; parkeer het tot de eerste gebruiker "welke dagen dan?" vraagt.

**Meetpunt: `dashboard_voortgang_band_mark` (nieuw), afgezet tegen `dashboard_voortgang_band_scrub`, met
`dashboard_voortgang_horizon_state` als noemer — hier lees je het effect af.**
