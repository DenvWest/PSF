# BESLUIT — Slaap v2: geïntegreerde prioriteitenladder (zone S · B · V)

> **Status.** Ontwerpbesluit, augustus 2026. Nog niet gebouwd. Vervangt de v2 die verloren ging vóór review; v1 blijft de inhoudelijke canon.
> **Prebuild.** [`slaap-piramide-v2-prebuild-2026-08.html`](slaap-piramide-v2-prebuild-2026-08.html) — 3 zones, 9 frames, 6 staten, 2 breedtes.
> **Canon.** [`BESLUIT_SLAAP_PIRAMIDE_V1_2026-08.md`](BESLUIT_SLAAP_PIRAMIDE_V1_2026-08.md) (inhoud) · [`slaap-piramide-v1-prebuild-2026-08.html`](slaap-piramide-v1-prebuild-2026-08.html) (LAYERS + STATES) · [`beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html`](beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html) (surface-contract, zone B) · [`claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md`](../cursors/claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md) §C–§F (governance, slices).

**Noordster (ongewijzigd).** Eerst gelegenheid → ritme → gedrag → omgeving → gerichte interventie → meten/aanvullen. Data en gedrag eerst; product pas laag 6, gegate.

---

## A · Diagnose — v1, de verloren v2, en het hub-dubbel

### A.1 Waarom de v1-rail onprofessioneel oogt

De v1-ladder zet `width: 100/92/84/74/74/58%` op zes losse `.layer`-kaarten met `align-self:center` en 7px tussenruimte ([`slaap-piramide-v1-prebuild-2026-08.html:178-180`](slaap-piramide-v1-prebuild-2026-08.html)). Dat kopieert het *idee* van beweging v3.4 zonder de *techniek*, en betaalt daardoor alleen de kosten:

| Probleem | Mechanisme |
|---|---|
| **Geen silhouet** | Zes afgeronde, omrande dozen mét tussenruimte kunnen per definitie geen piramide vormen. v3.4 gebruikt `clip-path: polygon(var(--k) 0, calc(100% - var(--k)) 0, 100% 100%, 0 100%)` per trede plus een `.pyr-apex`-driehoek: dáár ontstaat de vorm ([`…v3.4…:669-676`](beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html)). v1 heeft alleen de breedtes. Het leest als een ongelijk uitgelijnde lijst. |
| **Kapotte regellengte** | Laag 6 op 58% van 347px = ~200px content. Bij 13,5px tekst zijn dat regels van 3–4 woorden. De smalste laag krijgt zo de slechtste leesbaarheid, terwijl daar juist de gate-copy staat. |
| **Mock in een koker** | v1 rendert de evidence-matrix (4 kolommen) binnen dezelfde 200px. Een tabel in een taps toelopende kolom is niet te redden. |
| **Omgekeerde leesvolgorde** | `flex-direction: column-reverse` zet laag 6 bovenaan. Mét silhouet is dat logisch (brede basis onder). Zónder silhouet scant een lezer eerst "Laag 6 · Meten, gadgets & aanvullen" — precies de laag die het minst mag trekken. |
| **Accent-stapeling** | Elke rij draagt tegelijk een pill, tot vier chips, een border, een breedte én een kleur. Vijf codes voor één status. |

Daarbij één compliance-punt: v1 kleurt `status: below` met `--warn #C26E4B`, wat als rood leest. §Compliance van v1 verbiedt expliciet "geen rode kleur op de duur-rij". De statuskleur en de regel spraken elkaar tegen.

### A.2 Waarom "full ladder alleen op VL" incompleet is

v1 kent drie surfaces (VQ · VR · VL). De ladder bestaat alleen op VL, onderaan een lange scroll. Gevolg: het ordeningsmodel — het enige echt onderscheidende ding aan dit product — heeft geen vaste plek in de dagelijkse omloop. Beweging v3.4 lost dat op met één component in drie varianten: `pyramid--mini` (brug), `pyramid--rail` (compacte aside), `pyramid--full` (scherm C). De gebruiker komt de ordening drie keer tegen op drie diepten. Slaap kreeg alleen de diepste.

Concreet ontbrak: een **mini-brug** op de dagelijkse surface, en een **koppelstrip** die vanuit de doe-surface terugwijst naar het waarom. Zonder die twee is de check-in een eenmalige leeservaring.

### A.3 Wat wél werkt en overgenomen is

| Bron | Patroon | Overgenomen als |
|---|---|---|
| beweging v3.4 | Eén component, drie varianten via een class (`host.className = "pyramid pyramid--" + variant`, [`:3317`](beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html)) | `renderLadder(s, 'mini'\|'rail'\|'full')` |
| beweging v3.4 | Paneel **onder** de vorm, niet tussen de rijen | Bij een vlakke ladder vervalt de reden; het paneel zit ín de rij (§C.1) |
| beweging v3.4 | Statuswoord als kleine uppercase regel (`STATE_WORD`) | `STATE_WORD` per laag, in tekst naast de kleur |
| beweging v3.4 | Gesloten laag alleen leesbaar in `full` (`readLocked = variant === "full"`) | `mini`/`rail` tonen status, geen paneel |
| beweging v3.4 | `MovementFollowupStrip`: tekstlinks met label + hint, geen knoppenstapel ([`MovementFollowupStrip.tsx:74-97`](../../src/components/intake/MovementFollowupStrip.tsx#L74-L97)) | VR-strip én MD-koppelstrip, identiek patroon |
| `FoundationPyramid` | Lagen als data (`PyramidLayer` met `eyebrow`/`summary`/`details`, [`foundation-pyramid.ts:26-37`](../../src/data/foundation-pyramid.ts#L26-L37)) | `LAYERS` blijft pure data; geen logica in de rij |
| v1 slaap | `renderReadout(s, variant)` — één functie, twee aanroepers | Ongewijzigd overgenomen (lock L2) |

### A.4 Cognitieve overload op VL

v1 rendert per staat: 6 lagen × (kern + 4 chips + 3 acties) + 5 interactieve mocks + evidence-matrix + zelf-inschatting + ASCII-assendiagram + 2 footnotes. De mocks zitten in de markup van élke laag (`renderLayer` roept `renderMock(L.mock)` onvoorwaardelijk aan, [`:914`](slaap-piramide-v1-prebuild-2026-08.html)) — verborgen, maar aanwezig, en één tik verwijderd.

Twee blokken zeggen bovendien hetzelfde: de evidence-matrix in laag 6 en het assendiagram onderaan zijn allebei "de tweede as". Twee vormen, één idee.

### A.5 De verloren v2 — wat hij lockte

De v2 die vóór review verdween lockte vijf dingen die v1 niet had. Ze zijn hier hersteld en staan verspreid in §C en §E:

1. `pyramid--mini` op de dagelijkse surface: focus-laag + één zin + aandachtsbalk over de top-3 lagen.
2. Max drie gratis acties op die surface, elk met één knop naar Mijn Dag.
3. Score-ring in de domeinkop, met de expliciete regel dat de ladder de score *verklaart* en niet vervangt.
4. Koppelstrip op Mijn Dag met drie vaste terug-links.
5. Geen supplement-tegel op de dagelijkse surface.

Punt 5 is vandaag een echte afwijking: [`SleepScreen.tsx:208`](../../src/components/dashboard/SleepScreen.tsx#L208) rendert `DomainSupplementList` op de Kompas-surface, gevoed door `buildSleepRecommendations()`. Dat is product op een surface die alleen data en gedrag mag tonen.

### A.6 Het hub-dubbel

De Voortgang-hub en Hermeting vertellen vandaag hetzelfde verhaal met andere woorden: allebei een aggregaat met een richting sinds de vorige meting. De hub is daarmee een tweede lezing van een conclusie die de gebruiker al kreeg.

**Besluit.** De hub toont **stand per domein** (meetlat-rij: score, richting, sparkline) en niets aggregaats. Wat Hermeting zegt krimpt tot **één nudge-regel** met een link. De hub-vraag is "waar sta ik per domein en waar klik ik door", niet "hoe ging het".

Dat maakt ook ruimte voor de statistieken-blik **Over tijd**, die iets toont wat nergens anders staat: je *antwoorden* per onderdeel, vorige check naast nu, in je eigen antwoordlabels. Geen scores, geen bandtaal.

---

## B · Surface-model — 3 zones, 9 frames, 2 viewports

### B.1 Zones

| Zone | Wat | Waarom in dezelfde prebuild |
|---|---|---|
| **S · Slaap** | Vijf surfaces, het ontwerp | Het eigenlijke werk |
| **B · Beweging** | Twee schermen uit v3.4, inhoud ongewijzigd (lock L8) | Aantoonbaar maken dat slaap en beweging hetzelfde *contract* dragen met een andere *vorm*. Zonder die vergelijking naast elkaar is "parity" een bewering |
| **V · Voortgang** | Hub-slice + statistieken-blik | De hub is waar slaap en beweging elkaar tegenkomen; het dubbel met Hermeting is alleen zichtbaar als je de hub erbij zet |

### B.2 Frames zone S

| ID | Naam | Simuleert | Href (geverifieerd) | Primair doel |
|----|------|-----------|---------------------|--------------|
| VQ | Vraag | `/intake/slaap` | — | Meten |
| VR | Check-in resultaat | intake resultaat | — | Begrijpen — **geen ladder** |
| K | Vandaag › Slaap | Kompas-surface | `buildDashboardVandaagHref("slaap")` → `?tab=vandaag&kompas=slaap` ([`dashboard-url.ts:97`](../../src/lib/dashboard-url.ts#L97)) | Oriënteren — `pyramid--mini` |
| MD | Mijn Dag | agenda-dagblik | `buildDashboardAgendaHref(dag,"dag")` → `?tab=agenda&dag=…&view=dag` ([`:254`](../../src/lib/dashboard-url.ts#L254)) | Uitvoeren — avondblok + koppelstrip |
| VL | Voortgang › Slaap | domeinscherm | `buildDashboardVoortgangHref("domein",null,"slaap")` → `?tab=voortgang&screen=domein&domein=slaap` ([`:171`](../../src/lib/dashboard-url.ts#L171)) | Bewijs — `pyramid--full` |

Frames zone B: **B1** ladder scherm C · **B2** brug-treden laag 1–3.
Frames zone V: **V1** hub-slice (`?tab=voortgang`) · **V2** statistieken › Over tijd (`?tab=voortgang&screen=statistieken&blik=overtijd`).

> **Naamgeving.** De surface heet intern Kompas (`kompas=slaap` in de URL) maar in gebruikerscopy staat overal **Vandaag** — "kompas" is een verboden woord (lock L3). De prebuild-chrome volgt de gebruikerscopy.

### B.3 Viewports

Twee breedtes, verplicht (lock L7). **Alle** responsiviteit loopt via `@container app (min-width:860px)`, niet via `@media`. Reden: de surface is een element van 375 of 1024px binnen een breed reviewvenster; media queries zouden op het venster meten en niets doen. Dit is dezelfde val als bij de cockpit-tegels, waar de middenzone ~744px is bij een open contextkolom.

| Frame | 375 | 1024 |
|---|---|---|
| VQ | één kolom, `max-width:560px` gecentreerd | idem, ruimere padding |
| VR | readout → feiten → profiel → experiment → strip | **split**: readout sticky links, feiten/profiel/experiment/strip rechts |
| K | kop → acties → CTA's → mini-brug | **contextkolom rechts**: mini-brug; hoofdkolom kop + acties + CTA's |
| MD | kop → timeline → koppelstrip | **contextkolom rechts**: koppelstrip; hoofdkolom timeline |
| VL | stand → readout → ladder → advies → over tijd | **split**: stand + `pyramid--rail` sticky links, readout + `pyramid--full` rechts |
| V1/V2 | één kolom | V2 splitst tabel en stand-tegel |

**Correctie op de opdracht.** De opdracht schreef "VR/VL split (readout + pyramid--rail)". Op VR kán dat niet: VR draagt geen ladder (§D). De split op VR is readout | rest. `pyramid--rail` bestaat uitsluitend op VL-desktop, als sticky navigatiekolom naast de volle ladder — dat is de rol die v3.4 zelf aan `rail` geeft ("compact, altijd zichtbaar op desktop").

---

## C · Visueel systeem — Tier A (ship-ready)

### C.1 PriorityLadder vervangt de taper

| # | Regel | Uitvoering |
|---|---|---|
| 1 | Geen taper-breedtes | Volle-breedte rijen, 4px statusbalk links (`.pl-bar`, absoluut gepositioneerd, volle rijhoogte). Laagnummer in een monospace tab van 48px. Serif **alleen** voor het readout-feit — de laagtitel is 14px sans/600 |
| 2 | Alleen de winst-laag open | `ui.open` initialiseert op `focusLayerOf(s)`; overige rijen tonen één regel "waarom wachten" uit `STATES.Fn.why` |
| 3 | Mocks alleen in de winst-laag | `if (L.mock && st === 'winst')`. Zie C.2 voor de twee gevolgen |
| 4 | Max 3 accenten | terra (winst · near · primaire CTA) · sage (op orde · meets) · amber (houd in de gaten · below). "Nog niet nu" is muted en dus géén accent. De pill is geschrapt; de vier chips zijn één `·`-gescheiden regel geworden |
| 5 | 8px-grid | `--s1…--s5` = 8/16/24/32/40. Card-padding 16, sectie-gap 24 |
| 6 | Geen device-frame | `.surface` is een kale kolom met 1px rand; de breedte-schakelaar ís de viewport |
| 7 | Statusdots hergebruiken het VR-feitpatroon | `below/near/meets` → amber/terra/sage, dezelfde tokens als de ladderstatus |
| 8 | L6 als deur | Dicht = slot-SVG + gevulde donkere kaart. Open = deur-SVG + outline, geen vulling, plus de label-only link |

**Kleurcorrectie.** `below` gaat van `#C26E4B` (leest rood) naar `--amber #C99A3C`. Dat lost het v1-compliancepunt op — een feitelijke constatering onder een populatierichtlijn mag geen alarmkleur dragen — en het maakt "below" en "watch" één betekenis in één kleur, waardoor het accent-budget op drie blijft.

**Leesrichting omgedraaid: laag 1 staat bovenaan.** Zonder silhouet moet 1 → 6 van boven naar beneden lezen. Dit is de enige gedwongen copywijziging (§J.2).

**Kleur is nooit het enige signaal.** Elke statusbalk gaat vergezeld van het statuswoord in tekst. Ook de aandachtsbalk op K draagt het woord onder de stip: terra en amber zijn op 7px niet betrouwbaar te onderscheiden, en bij kleurenblindheid verdwijnt het onderscheid volledig.

### C.2 Twee gevolgen van regel 3, expliciet

Regel 3 zegt: mocks alleen in de winst-laag. Twee mocks raken daardoor onbereikbaar, want hun laag kan nooit winst zijn.

| Mock | Waarom onbereikbaar | Oplossing |
|---|---|---|
| **Omgeving-scan** (laag 4) | §E.1 v1 verbiedt laag 4 hard als winst-laag: er is geen check-in-veld | De scan staat achter één expliciete knop in het laag 4-paneel ("Doe de slaapkamer-scan"). In rust nul mocks buiten de winst-laag; de scan blijft bereikbaar. Nodig, want de scan is volgens v1 §M de **enige** databron voor de v2-omgevingsvelden — hem laten vervallen kost dat veld |
| **Evidence-matrix** (laag 6) | Laag 6 is nooit winst | Verhuisd naar het collapsed blok "Achtergrond bij de indeling" onderaan VL, samen met het assendiagram. Dat lost tegelijk de dubbeling uit §A.4 op: één plek voor de tweede as |

### C.3 Tokens

```css
--sage:#5A8F6A;  --sage-lt:#9CC5A9;   /* op orde · meets */
--terra:#C8956C;                      /* winst · near · primaire CTA */
--amber:#C99A3C;                      /* houd in de gaten · below */
--move:#C26E4B;                       /* uitsluitend zone B (referentie) */
.surf-intake{ --bg:#1A2E1A; }         /* globals.css --intake-bg */
.surf-dash  { --bg:#132414; }         /* globals.css --dash-bg */
```

---

## D · Inhoud en hiërarchie

### D.1 Score en ladder naast elkaar

De ring en de ladder beantwoorden verschillende vragen, en dat moet op het scherm te zien zijn.

| | Score-ring | Ladder |
|---|---|---|
| Vraag | Waar sta ik, in één getal | Waar begin ik, en waarom niet ergens anders |
| Verandert bij | een nieuwe check | een nieuwe check |
| Rol | samenvatting | verklaring |
| Waar | K-kop (64px) · VL stand-tegel (70px) · V1-rij · V2 | K mini · VL rail + full |

Op K staat onder de ring en de aandachtsbalk letterlijk: *"Het getal is een samenvatting, geen oordeel. De lagen hieronder leggen uit waar het vandaan komt."* Zonder die regel concurreren twee readouts om dezelfde vraag.

Geen voortgangsbalk over de ladder, geen "X van 6", geen ordinaal (lock L4). De ladder heeft geen richting waarin je "vordert".

### D.2 Per frame

| Frame | Volgorde | Verdwijnt bewust |
|---|---|---|
| **VQ** | balk → nummer → vraag (h1, serif) → benchmark (alleen `duur`) → opties → "Waarom vragen we dit?" dicht | "Vraag X van 10" |
| **VR** | readout → 4 feiten (+ toon alles) → profiel → experiment → koppelstrip → footnote | ladder, supplement, actielijst, keuzeknoppen |
| **K** | kop (ring + status + aandachtsbalk) → 3 gratis acties → CTA's → mini-brug | supplement-tegels, volle ladder, tweede readout |
| **MD** | kop (+ domein-badge) → timeline met één blok uit de winst-laag → koppelstrip | tweede readout, tweede conclusie |
| **VL** | stand → SSOT-readout → ladderkop → volle ladder → gratis vormen → Over tijd → zelf-inschatting (dicht) → achtergrond (dicht) → footnote | checkboxes (lock L5) |
| **V1** | titel → nudge-regel → meetlat-rijen → blik-nav | aggregaat-hero |
| **V2** | blik-nav → Over tijd-tabel → stand-tegel | — |

### D.3 Crossover 4 ↔ 5

Behouden, visueel subtieler: geen oranje alert-box meer, maar een gestippelde linkerlijn met een swap-pictogram en muted tekst. De inhoud is canon en ongewijzigd. Het was een callout die harder schreeuwde dan de winst-laag eronder.

---

## E · User journeys

### E.1 Per frame, max 5 stappen

**VQ — meten.** (1) Leest de vraag. (2) Ziet bij `duur` de populatierichtlijn ernaast, nooit als doel. (3) Opent desgewenst "Waarom vragen we dit?" en leest bij welke laag de vraag hoort. (4) Kiest een antwoord. (5) Volgende vraag.
→ **Nooit een supplement.**

**VR — begrijpen.** (1) Leest het feit in serif. (2) Ziet zijn eigen antwoordlabel als chip. (3) Leest de delta ("Je nulpunt" of "Sinds je vorige meting"). (4) Scant vier feitrijen, klapt desgewenst alle negen open. (5) Kiest één van vier uitgangen: de terra-CTA **"Bekijk je slaapbeeld →"**, of een van de drie striplinks.
→ **Nooit een supplement.** Wel het experiment.

**K — oriënteren.** (1) Ziet ring + bandlabel + één statuszin. (2) Scant de aandachtsbalk: drie lagen, elk met stip én statuswoord. (3) Leest in de mini-brug welke laag zijn winst is en waarom (één canon-zin). (4) Zet maximaal drie gratis acties op Mijn Dag — de knop wordt "Staat op Mijn Dag ›". (5) Gaat door via **"Open je slaapbeeld →"** (primair) of **"Mijn Dag › vanavond"** (secundair).
→ **Nooit een supplement.**

**MD — uitvoeren.** (1) Ziet zijn dag met domein-badge "Slaap · Laag N" in de kop. (2) Ziet één gemarkeerd blok uit de winst-laag met één snackregel. (3) Voert uit. (4) Twijfelt en gebruikt de koppelstrip. (5) Komt terug op K of VL.

**VL — bewijs.** (1) Ziet zijn stand. (2) Herkent hetzelfde readout-blok als op VR (SSOT-vlag zegt het letterlijk). (3) Leest de ladderkop: geen ranglijst. (4) Klapt de winst-laag open (staat al open) en gebruikt de mock. (5) Leest per gesloten laag één regel waarom die kan wachten; bekijkt desgewenst Over tijd.

### E.2 Terugwegen — exacte labels

| Van | Naar | Label | Type |
|---|---|---|---|
| VR | VL | **Bekijk je slaapbeeld →** | terra-knop (enige knop op VR) |
| VR | VL | **Je slaapbeeld** | striplink |
| VR | K | **Vandaag › Slaap** | striplink |
| VR | MD | **Mijn Dag** | striplink |
| K | VL | **Open je slaapbeeld →** | terra-knop + stille link in de mini-brug |
| K | MD | **Mijn Dag › vanavond** | ghost-knop |
| K | MD | **Zet op Mijn Dag › avond** | per actie, max 3 |
| **MD** | **K** | **Waarom dit?** | striplink — *De laag waar je winst nu zit, in één blik.* |
| **MD** | **VL** | **Bekijk bewijs** | striplink — *Je slaapbeeld met alle zes de lagen en de onderbouwing.* |
| **MD** | Hermeting | **Check-in aanpassen** | striplink — *Klopt dit niet meer? Doe je slaapcheck opnieuw.* |
| VL | MD | **Zet dit op Mijn Dag ›** | sectie-footer onder "Gratis vormen" |
| V1 | VL | meetlat-rij Slaap | hele rij is de knop |

De MD-koppelstrip spiegelt `MovementFollowupStrip`: kop, dan tekstlinks met label + hint, geen knoppenstapel.

### E.3 Boven de vouw op MD — gemeten, niet geschat

Eis: minimaal twee terug-links zichtbaar boven de vouw. Gemeten in de prebuild op 375px, alle zes staten: link 1 eindigt op **489px**, link 2 op **549px**, link 3 op 610px. Twee links vallen dus binnen 560px — een conservatieve vouw voor 375×667 mét browserchrome.

Dat lukte niet vanzelf. Drie dingen moesten wijken: het derde contextblok in de timeline (12:30 Lunch), de domein-badge als eigen rij (zit nu ín de kop), en de merknaam in de appbalk op smal (die kostte een hele regel). Wie later een rij toevoegt aan MD, duwt link 2 onder de vouw — dat is de begroting.

### E.4 Toegankelijkheid

- `aria-expanded` + `aria-controls` op elke laagknop, de help-expander, de feitentoggle en beide collapsed blokken; het paneel is een `role="region"` met `aria-labelledby` naar zijn knop.
- Focusbeheer: na openen van een laag (ook via de rail) gaat focus naar de bijbehorende `#pl-btn-N`.
- Raakvlakken ≥44px voor élke knop — geverifieerd over 9 frames × 6 staten × 2 breedtes, nul overtredingen. Inline tekstlinks binnen een lopende zin houden de WCAG 2.5.8-uitzondering.
- Eén `<h1>` per frame — geverifieerd over alle combinaties.
- Kleur nooit als enig signaal (§C.1).
- `prefers-reduced-motion` schakelt alle transities uit.
- Mock-uitvoer staat in `role="status"`, zodat een schermlezer de reflectieregel hoort.
- Geen horizontale pagina-scroll op 375 of 1024; brede tabellen scrollen in hun eigen `.tablewrap`.

---

## F · Consumentenbond-keten — data → gedrag → dienst → product

| Laag | Type | Zichtbaar op | Monetisatie |
|---|---|---|---|
| **1 · Slaapgelegenheid** | data (`duur`) → gedrag | VQ · VR · K · MD · VL | Nooit |
| **2 · Ritme & slaapgewoonten** | data (`SLP_CONS`, `grip`) → gedrag | VQ · VR · K · MD · VL | Nooit |
| **3 · Gedrag & timing** | data (`winddown`, `nightload`, `morninglight`) → gedrag | VQ · VR · K · MD · VL | Nooit |
| **4 · Slaapomgeving** | gedrag; nog geen veld (scan = v2-bron) | VL (achter knop) | Nooit |
| **5 · Gerichte interventies** | **dienst**, extern (huisarts, slaaptherapeut, CGT-i) | VR (als winst) · VL | **Nooit** — verwijzing is geen product; geen aanbieder, geen link |
| **6 · Meten, gadgets & aanvullen** | **product** | **Alleen VL**, gegate, label-only | Alleen bij `layer6GateOpen` |

**De poort (v1 §E.6, ongewijzigd).**

```
layer6GateOpen = checkinCompleted
              && heeftConcreteKlacht(laag 1..4)   // relevantie
              && !laag1_open && !laag2_open       // fundament staat
              && !clinicalSignals                 // geen klinisch patroon
```

Vier standen, alle vier in de prebuild te bekijken via een reviewer-schakelaar in het laag 6-paneel: `open` · `fundament` · `klinisch` · `geen_klacht`. Bij `klinisch` (F5) is de deur juist dícht — de gate opent níét wijder naarmate de klachten ernstiger zijn. Dat is stepped care en het is ook juridisch de enige verdedigbare kant op.

**Wat `focusLayer` als SSOT verbindt.** Eén afgeleide waarde stuurt vijf surfaces: het profiel op VR, de mini-brug én de drie acties op K, het avondblok op MD, en de open laag op VL. Daardoor kan er per definitie geen tweede slaapconclusie ontstaan. Dat is precies wat vandaag wél gebeurt: [`SleepScreen.tsx:208`](../../src/components/dashboard/SleepScreen.tsx#L208) rendert een eigen `DomainSupplementList` uit `buildSleepRecommendations()`, los van elke check-in-laag. Die tegel moet weg — niet verplaatst, weg. Product hoort op laag 6, op VL, achter de poort.

Referenties: [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) tier 1–3 (tier 3 = supplement, `comparison_path`) · [`PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md`](PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md) §4 (waar commissie al loopt moet het oordeel haar kunnen intrekken).

---

## G · Implementatie-slices

Volgorde is bindend. Slaap wacht **niet** op beweging-R2-code, wél op design-lock v2.

| Slice | Bestanden (geverifieerd) | Inhoud |
|---|---|---|
| **S-R0** | `src/data/sleep/lifestyle-pyramid.ts` **(nieuw)** · [`src/lib/sleep-assessment.ts`](../../src/lib/sleep-assessment.ts) · [`src/lib/sleep-delta.ts`](../../src/lib/sleep-delta.ts) · `src/components/intake/SleepCheckinReadout.tsx` **(nieuw)** · [`src/components/intake/SleepCheckin.tsx`](../../src/components/intake/SleepCheckin.tsx) | `SLEEP_LAYERS` + `CLINICAL_SIGNALS` + `EVIDENCE_MATRIX` + `SLEEP_QUESTION_HELP` als pure data. `resolveSleepLayer()`, `detectClinicalSignals()`, `buildSleepFactRows()`, `buildPriorityProfile()`, `buildSleepDimensionDeltas()`. `SleepCheckinSnapshot` als returntype van `buildSleepConclusion` — signatuur behouden voor bestaande consumers (`parseSleepCheckinFocus` voedt `account-dashboard.ts`). Resultaat-tak herschreven: readout + feitrijen + profiel + experiment + strip. `SLEEP_CHOICES`/`MAINTENANCE_ACTIONS` uit de VR-tak; `magnesiumGate()` uit `assessSleep`. Spiegel van [`MovementCheckinReadout.tsx`](../../src/components/intake/MovementCheckinReadout.tsx) |
| **S-R2** | `src/data/sleep/lifestyle-pyramid.ts` · `src/components/dashboard/voortgang/SleepPriorityLadder.tsx` **(nieuw)** · [`VoortgangDomeinScreen.tsx`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx) | PriorityLadder in drie varianten. **`isSleep`-tak naast de bestaande `isMovement`-tak op [`:85`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L85)** — geen nieuw domeinscherm. Winst-laag default open, crossover tussen rij 4 en 5, gate met vier standen. Patroon: [`BewegingAdviesTreden.tsx`](../../src/components/dashboard/voortgang/BewegingAdviesTreden.tsx) |
| **S-R2b** | [`src/components/dashboard/SleepScreen.tsx`](../../src/components/dashboard/SleepScreen.tsx) | Mini-brug + aandachtsbalk + drie gratis acties. `buildDashboardVoortgangHref("domein", null, "slaap")` als primaire CTA. **`DomainSupplementList` eruit** ([`:208`](../../src/components/dashboard/SleepScreen.tsx#L208)) — SleepScreen toont na deze slice geen eigen conclusie en geen product meer |
| **S-R5** | [`AgendaDayTimeline.tsx`](../../src/components/dashboard/agenda/AgendaDayTimeline.tsx) · `src/components/intake/SleepFollowupStrip.tsx` **(nieuw)** | Avondblok uit `focusLayer` (één regel) + koppelstrip onder de timeline. Loopt **parallel aan beweging R5**; de strip is één component met een `domain`-parameter, niet twee kopieën |
| **Golf 3 · hub** | `src/lib/domain-analyse-shell.ts` **(nieuw)** · `VoortgangHub.tsx` · statistieken-blik | Aggregaat-hero eruit, meetlat-rij per domein erin, hermeting krimpt tot één nudge-regel. Blik "Over tijd" = antwoord-delta's uit `dimensionDeltas`. Dit is R4 uit het beweging-verdict, generiek gemaakt |

**Parity-lock.** Slaap erft van beweging het **contract** (C.1 analyse-shell, C.4 klaar-staat-gate) en de **componentvorm** (mini/rail/full, followup-strip). Slaap erft **niet** de zes beweging-rungs: die ordenen trainingsbelasting en hebben geen slaap-equivalent. Slaap heeft zijn eigen zes lagen. Wie de rungs generaliseert, exporteert een beweging-metafoor naar een domein dat er niet op past.

**Volgordebeperking.** S-R2 zonder S-R0 is niet testbaar (de ladder verzint dan zijn eigen samenvatting → twee conclusiebronnen). S-R2b zonder S-R2 zet een brug naar een scherm dat nog niet bestaat.

---

## H · Meetpunten

Drieplek-registratie is verplicht voor élk nieuw client-event: [`src/lib/events.ts`](../../src/lib/events.ts) + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`.

| Event | Payload | Slice | Waarom het bestaat |
|---|---|---|---|
| `sleep_checkin_completed` | `{ surface }` | S-R0 | Bestaat al (GA4). Noemer voor alles hieronder |
| `sleep_checkin_routing_click` | `{ target: 'slaap_beeld' \| 'mijn_dag' \| 'kompas' }` | S-R0 | De kernhypothese: werkt de brug van check-in naar de rest? Drie targets, want er zijn drie uitgangen |
| `domain_tool.snapshot_viewed` | `{ domain:'slaap', has_conclusion }` | S-R2 | **Bestaat al** ([`events.ts:29`](../../src/lib/events.ts#L29)), emit op [`VoortgangDomeinScreen.tsx:121`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L121). `has_conclusion` is vandaag voor slaap altijd `false` omdat `movementReadout` de enige bron is — dat kantelt met S-R2. **Geen registratiewerk** |
| `dashboard.slaap_beeld_open` | `{ from: 'vandaag' }` | S-R2b | Meet of de mini-brug de doorklik levert die de volle ladder rechtvaardigt |
| `sleep.self_calibration_set` | `{ layer }` | S-R2 | Enige echt nieuwe durable event. Zelf-inschatting versus gemeten laag |
| `agenda.sleep_winddown_scheduled` | `{ layer, action_index }` | S-R2b/S-R5 | De "Zet op Mijn Dag › avond"-knop. Dit is de meetbare gedragsstap die v1 verloor toen de keuzeknoppen van VR verdwenen |
| `dashboard.agenda_domain_link_click` | `{ domain:'slaap', to: 'kompas' \| 'voortgang' \| 'hermeting' }` | S-R5 | De MD-koppelstrip. Zonder dit weet je niet of de terugweg gelopen wordt |

**Consent-bias.** `sleep_question_help_opened` vuurt op VQ, vóór de check-in-consent. Dat event mag daarom uitsluitend GA4/Clarity zijn, nooit `domain_events`. Help-openen is daardoor structureel ondergerapporteerd bij consentweigeraars — meld dat bij interpretatie.

**Geen event op** de signalen-checklist (laag 5) en de zelf-inschatting-afwijking. Aankruisgedrag bij gezondheidsklachten is bijzondere-persoonsgegevens-terrein, en de checklist is expliciet geen meetinstrument.

**Verplichte pre-meting (v1 §H, kraak 4).** Vóór livegang: welk aandeel van de slaapcheck-afronders klikt vandaag de magnesium-kaart, en wat is de duurverdeling daarbinnen? Zonder dat nulpunt is de omzetkost van de poort niet af te lezen. Niet uitrollen zonder.

**Meetpunt:** `sleep_checkin_routing_click` afgezet tegen `sleep_checkin_completed`, en `dashboard.agenda_domain_link_click` — hier lees je af of de keten check-in → oriënteren → doen → bewijs daadwerkelijk gelopen wordt.

---

## I · Governance — drie laagmodellen uit elkaar houden

| Model | As | Vraag |
|---|---|---|
| **Product-IA L1–L3** | surface | *Waar staat het op het scherm?* |
| **Domeincontract C.1–C.4** | functie | *Welk soort ding is het?* |
| **Slaap-lagen 1–6** | inhoud | *Waar in de leefstijl-hiërarchie hoort het?* |

| | L1 · doe (K, MD) | L2 · Voortgang › Slaap (VL) | L3 · advies-deur |
|---|---|---|---|
| **C.1 analyse-shell** | één statuszin als *reden*, nooit een blok | **primair**: stand, readout, ladder, Over tijd | — |
| **C.2 advies-ladder** | de mini-brug (3 rijen, read-only, max 3 acties) | **primair**: laag 1–6 met "Wat kun je hier doen?" | — |
| **C.3 product-oordeel** | **verboden in elke staat** | de deur ernaartoe, gegate | **primair**: vergelijkingspagina |
| **C.4 klaar-staat-gate** | de gate zelf leeft hier | consument van de gate | consument + tweede poort |

**Twee naamsverwarringen om te vermijden.**

1. **"Laag N" (inhoud) ≠ "L1/L2/L3" (surface).** In gebruikerscopy bestaat alleen "laag 1 t/m 6". De L-nummers zijn interne surface-rollen en verschijnen nooit op het scherm.
2. **"Trede" is van beweging, "laag" is van slaap.** [`BewegingAdviesTreden`](../../src/lib/beweging-advies-treden.ts) kent drie treden (interventie → meten → aanvullen) binnen C.3. Dat zijn geen lagen. Wie op `rung` grept vindt het verkeerde ding. Slaap gebruikt uitsluitend "laag".

---

## J · Copy-lock

### J.1 Canon, niet herschrijven (lock L1)

`LAYERS` (naam, sub, kern, chips, doing, mockNote) · `STATES.Fn.readout` · `.facts` · `.profile` · `.exp` · `.gate.body` · `.stand` · `MATRIX` · `SIGNALEN` · `TIJDCHIPS` · `SCANROWS`. Alles 1:1 uit v1.

`renderReadout(s, variant)` produceert op VR en VL dezelfde strings; `variant` raakt uitsluitend het gewicht van de vervolg-affordance (terra-knop versus stille link). Lock L2.

### J.2 De ene gedwongen wijziging

De v1-ladderkop luidt: *"Prioriteitenladder — niet omhoog klimmen / Geen ranglijst en geen niveaus. **Breder betekent: draagt meer.** Begin waar de winst het grootst is; de rest mag wachten."*

"Breder" verwijst naar de taper-breedtes. Die zijn weg (§C.1), dus de zin is onwaar geworden, en met laag 1 bovenaan klopt "niet omhoog klimmen" ook niet meer. Nieuw:

> **Prioriteitenladder — geen ranglijst**
> Zes lagen, van fundament naar finetunen. Wat bovenaan staat draagt het meest; wat eronder staat werkt pas mee als de lagen erboven staan. Begin waar de winst het grootst is — de rest mag wachten.

### J.3 Nieuwe copy in v2 — ter goedkeuring

| Waar | Wat | Omvang |
|---|---|---|
| `STATES.Fn.why[layer]` | Eén regel "waarom wachten" per gesloten laag | 5 regels × 6 staten = 30 |
| `STATES.Fn.kompas.status` | Eén statuszin op K | 6 |
| `STATES.Fn.md` | Bloktitel + snackregel op Mijn Dag | 12 |
| `STATES.Fn.overtijdLead` | Eén leidende regel boven de Over tijd-tabel | 6 |
| MD-koppelstrip | 3 labels + 3 hints | 6 |
| VR-strip | kop + intro + 3 labels + 3 hints | 8 |
| K | ring-disclaimer, sectiekoppen, actieknoplabel | 5 |
| VL | "Gratis vormen op je open lagen" + voetregel | 3 |
| L6 gate | `geen_klacht`-copy (de vierde stand had er nog geen) | 1 |

De `md`-bloktitels zijn ingekorte varianten van de canon `exp.title` — een timelineblok van 90 tekens leest niet. De volledige canonzin blijft op VR en VL staan.

### J.4 Delta-templates D1–D8 (v1 §D, ongewijzigd)

| # | Situatie | Template |
|---|---|---|
| D1 | eerste check | `Dit is je eerste slaapcheck. {label} staat op "{answerLabel}" — daar meet je vanaf nu tegenaf.` |
| D2 | vooruit | `{label} ging van "{prev}" naar "{answerLabel}".` |
| D3 | terug | `{label} ging van "{prev}" terug naar "{answerLabel}".` |
| D4 | gelijk | `{label} staat op hetzelfde punt als bij je vorige slaapcheck: "{answerLabel}".` |
| D5 | nevenverandering | `{otherLabel} ging van "{prevOther}" naar "{nowOther}".` |
| D6 | nevenstabiel | `{labelA} en {labelB} bleven gelijk.` |
| D7 | totaalregel | `Sinds je start: {sleepStartStatement(direction)}` — hergebruikt [`sleep-delta.ts`](../../src/lib/sleep-delta.ts) ongewijzigd |
| D8 | alles gelijk | `Alle delen die we meten staan op hetzelfde punt als bij je vorige slaapcheck.` |

De Over tijd-tabel gebruikt dezelfde antwoordlabels, letterlijk. Richting = `Vooruit / Terug / Gelijk / Nulpunt`. Nooit het woord "band", nooit een getal dat niet in de vraag stond.

### J.5 Verboden woorden (lock L3)

stappenplan · route · fase · cockpit · kompas · level · "trede X van Y" · biohack · sleep score · deep sleep · perfecte slaap. **Geverifieerd op nul treffers** in de gerenderde tekst van alle 9 frames × 6 staten × 2 breedtes. Geen emoji: alle pictogrammen zijn inline SVG.

---

## K · States F1–F6 — acceptatiematrix

| | Situatie | Winst | Ring | Gate | Mock zichtbaar | K-acties uit | MD-blok | Over tijd |
|---|---|---|---|---|---|---|---|---|
| **F1** | Eerste check, duur 5–6u | Laag 1 | 38 · Basis | dicht · fundament | tijdchips | laag 1 | 22:15 bedtijd | D1 · 4 rijen nulpunt |
| **F2** | Hercheck vooruit | Laag 3 | 64 · Op orde | **open** · label-only | — (laag 3 heeft geen mock) | laag 3 | 07:10 naar buiten | D2 × 2 + D6 |
| **F3** | Hercheck terug | Laag 2 | 47 · Wisselend | dicht · fundament | opstaweek | laag 2 | 06:45 opsta-anker | D3 × 3 + D6 |
| **F4** | Duur ok, ritme onregelmatig | Laag 2 | 52 · Wisselend | dicht · fundament | opstaweek | laag 2 | 07:00 opsta-anker | **D8** |
| **F5** | Klinische signalen | Laag 5 | 34 · Klachten | dicht · **klinisch** | signalen | laag 5 | 07:30 één regel | D1 · 4 rijen nulpunt |
| **F6** | Basis staat, avond open | Laag 3 | 71 · Op orde | **open** · label-only | — | laag 3 | 22:30 vaste volgorde | **D8** |

**Acceptatie per staat.** (1) Precies één laag draagt "Grootste winst". (2) Die laag is default open op VL; alle andere zijn dicht met één why-regel. (3) De mini-brug op K toont de winst-laag plus de directe buren. (4) Het MD-blok komt uit dezelfde laag. (5) De readout is byte-identiek op VR en VL. (6) De gate-stand komt overeen met de tabel. (7) Geen supplement op VQ, VR, K of MD.

**Twee dingen die opvallen en kloppen.** F2 en F6 hebben geen mock, want laag 3 heeft er geen — dat is canon en geen omissie. F4 en F6 leveren beide D8 ("alles gelijk"), maar met tegengestelde betekenis: F4 staat stil op een onregelmatig ritme, F6 houdt een goede lijn vast. De `overtijdLead` is identiek; de readout eromheen maakt het verschil. Dat is aanvaardbaar maar het is de zwakste plek in de delta-copy.

**"Avondblok" is niet altijd een avond.** F2 t/m F5 leveren een ochtendanker (07:10, 06:45, 07:00, 07:30). De regel is: het blok staat op het tijdstip dat de winst-laag impliceert. Een ritme-laag geeft een ochtendanker, een gedrag-laag een avondblok. De opdrachtterm "avondblok" beschrijft de meest voorkomende, niet de enige vorm.

---

## L · HTML-prebuild

[`slaap-piramide-v2-prebuild-2026-08.html`](slaap-piramide-v2-prebuild-2026-08.html) — self-contained, vanilla JS, inline CSS, alleen Google Fonts extern (DM Sans + DM Serif Display).

**Schakelaars.** Zone S/B/V · surface (frames wisselen mee per zone) · staat F1–F6 (verborgen in zone B) · breedte 375/1024.

**Bevat.** VQ met help-expander en benchmark · VR met gedeelde readout, 4+5 feitrijen, profiel, experiment, koppelstrip · K met score-ring, aandachtsbalk, mini-brug, drie acties met Mijn Dag-knop, twee CTA's · MD met dagtimeline, domein-badge in de kop, één blok uit de winst-laag, koppelstrip · VL met stand, SSOT-readout, volle ladder, gratis vormen, Over tijd, zelf-inschatting en achtergrond (beide dicht) · V1 hub-slice met nudge-regel en meetlat-rijen (Slaap klikt door naar VL) · V2 statistieken-blik · B1/B2 beweging-excerpt met de originele trapezium-geometrie.

**Interactief.** Laag openen/sluiten met focusbeheer · rail als sprongnavigatie · tijdchips, opstaweek, omgeving-scan (achter knop), signalen-checklist, zelf-inschatting · gate-standen-schakelaar · "Zet op Mijn Dag" · hub-rij → VL.

**Geverifieerd in Chrome**, alle 9 frames × 6 staten × 2 breedtes:

| Controle | Uitkomst |
|---|---|
| JS-runtimefouten | 0 |
| Horizontale overflow | 0 |
| Raakvlakken < 44px (knoppen) | 0 |
| `<h1>` per frame | precies 1, overal |
| Verboden woorden in gerenderde tekst | 0 |
| MD-terug-links binnen 560px | 2 van 3, in alle zes staten |

Vier defecten die deze controle opleverde en die zijn verholpen: een click-listener die per hertekening stapelde (één tik zou uiteindelijk zesmaal vuren), twee koppen op K, geen kop op B2, en een appbalk die op 375 26px buiten de surface liep.

---

## M · Tier B — drie richtingen, niet in v2

Documentatie voor een latere fine-tune. Geen van drieën is nu gekozen; Tier A is ship-ready en Tier B is smaak bovenop een werkend systeem.

| # | Richting | Wat het is | Wint | Kost |
|---|---|---|---|---|
| **1** | **Editorial ladder** | Geen piramidevorm. Redactionele typografie: laagnummer als groot serif-cijfer in de marge, ruime witruimte, haarlijnen in plaats van kaarten. Leest als een Consumentenbond-rapport | Past exact bij de positionering; oogt duur zonder effecten; schaalt perfect naar desktop | Statusdifferentiatie wordt subtieler — "grootste winst" moet het van typografie hebben. Op 375 kost het veel verticale ruimte |
| **2** | **Soft organic stack** | Volle-breedte banden met een zachte verticale gradient per status, geen randen, geen taper-truc. De ladder leest als een doorlopend veld met accenten | Rustig; geen doosjesgevoel; werkt goed in donkere UI | Gradients in donkergroen worden snel vuil; vier statussen in gradient-vorm is lastig toegankelijk te houden |
| **3** | **SVG-silhouet** | Eén `<svg>` met zes echte trapeziumvlakken, `FoundationPyramid`-geometrie, domeinspecifiek. Paneel eronder, zoals v3.4 | Het silhouet dat v1 wilde en niet kreeg; sterkste herkenning; deelt geometrie met een bestaand component | Herintroduceert het regellengte-probleem in de smalle vlakken. Werkt alleen als de tekst uít de vorm gaat en het paneel al het werk doet |

**Als er ooit gekozen moet worden:** richting 1. Ze sluit aan op de merkbelofte, is het goedkoopst toegankelijk te houden, en is de enige die op 1024 beter wordt in plaats van alleen groter.

---

## N · Open vragen

1. **Blijft `/intake/plan/sleep` bestaan?** Die pagina verliest met S-R0 zijn inkomende link vanaf VR. Ofwel hij hangt onder laag 1–3 op VL als "acties bijhouden", ofwel hij gaat uit. Een weespagina met afvinkbare acties ondermijnt de hele ordening — en botst met lock L5 (Voortgang meet, Mijn Dag doet).

2. **Wat gebeurt er met iemand die al jaren magnesium slikt en de deur dicht vindt?** De poort is bewust streng (§F). Voor een bestaande gebruiker met een gesloten deur leest dat als betutteling, niet als zorgvuldigheid. Er is nu geen copy voor "je gebruikt dit al" — alleen voor "nog niet". Dat is een gat dat pas zichtbaar wordt in productie.

3. **Is D8 op F4 en F6 acceptabel?** Dezelfde zin voor stilstand-op-een-probleem en lijn-vasthouden-op-orde. De readout eromheen maakt het verschil, maar in de Over tijd-tabel staat de zin kaal. Ofwel D8 splitsen naar richting van de stand, ofwel accepteren dat de tabel neutraal is en de duiding elders staat.
