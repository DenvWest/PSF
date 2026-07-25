# Prompt — Beweging Overzicht & Stappenplan: craft + slices (Opus)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus in een nieuw gesprek. Voeg de screenshots toe (bijlagen-checklist).
>
> **Output:** visuele craft + component-architectuur + implementatieslices. Geen code, geen diffs; props-signaturen in sectie E zijn de enige uitzondering.
>
> **Opgesteld:** 23 juli 2026. Harde context geverifieerd tegen `main` — zie "Verificatie-log".

## Plaats in de reeks

| Doc | Levert | Waar dit doc op voortbouwt |
|---|---|---|
| [`claude-analyse-beweging-vandaag-stappenplan-prompt.md`](claude-analyse-beweging-vandaag-stappenplan-prompt.md) | betekenis + SSOT | de vier gelockte SSOT-regels |
| [`claude-opus-stappenplan-roadmap-supplementen-prompt.md`](claude-opus-stappenplan-roadmap-supplementen-prompt.md) | roadmap-IA + supplementen | de roadmap-metafoor en de sport-lens |
| [`BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md`](../plan/BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md) | 4 locks + slices S0–S7 | de breedte-ladder, de fase-bronbreuk (§1d) |

**Verschil:** de vorige prompts stopten bij architectuur. Deze dwingt drie dingen die daar ontbraken: **visuele craft** (de score+trend is nu vlakker dan een marketing-preview die al in de repo staat), een **semantisch route-model** met een pijn-deel ("wat wil ik maar kan ik nog niet"), en een **vierde oppervlak** voor concrete oefeningen — elk met slices die 1-op-1 naar Cursor gaan.

> **Let op de slice-botsing.** De blauwdruk hierboven definieert al S0–S7 met eigen betekenissen (S0 = breedte-ladder, S3 = programma-kaart, S6 = sport-lens …). Dit traject definieert een ándere reeks. Om verwarring bij het vertalen naar Cursor-prompts te voorkomen, gebruikt dit document het prefix **`OV-`** (Overzicht) voor zijn slices, en de prompt vraagt Opus expliciet om een reconciliatie-tabel met de blauwdruk-slices. Nooit twee dingen "S3" noemen.

---

## Gebruiksinstructie

1. Open Claude Opus (nieuw gesprek).
2. Voeg bijlagen toe (checklist onderaan).
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Verwachte output: secties **A t/m M**.
5. Review sectie **A** (verdicts) en **L** (slices) → per slice een Cursor-prompt via de `cursor-prompt` skill.

---

## Prompt (copy-paste)

```text
ROL: Je bent Senior Product Designer + Frontend Systems Thinker voor
PerfectSupplement (perfectsupplement.nl). Je tilt het beweegdomein van het
Leefstijlcheck-dashboard naar cockpit-craft, herstructureert het route-narratief,
ontdicht het stappenplan, en ontwerpt een apart oppervlak voor concrete oefeningen.

OUTPUT-CONTRACT: uitsluitend visuele craft, component-architectuur en
implementatieslices. GEEN code, GEEN diffs, GEEN JSX, GEEN Tailwind-klassenlijsten.
Props-signaturen in sectie E zijn de enige uitzondering — types, geen implementatie.
Taal: Nederlands. Identifiers, componentnamen en veldnamen: Engels.

Lees CLAUDE.md mee als je het hebt.

═══════════════════════════════════════════════════════════════════════════════
BIJLAGEN (door Dennis)
═══════════════════════════════════════════════════════════════════════════════

1. VERPLICHT: screenshot Overzicht (de huidige Vandaag-view), 375px + desktop.
2. VERPLICHT: screenshot stappenplan, desktop + ingeklapt contextpaneel.
3. OPTIONEEL: BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md, BEWEEG_COCKPIT_FUTURE_YOU.md,
   WRITING_VOICE.md.

═══════════════════════════════════════════════════════════════════════════════
PRODUCTCONTEXT
═══════════════════════════════════════════════════════════════════════════════

Leefstijlplatform voor mannen 40+ (slaap, stress, energie, herstel, beweging).
"De Consumentenbond van supplementen", doorgegroeid naar leefstijlcoach. Adviezen,
geen diagnoses. Stepped care: leefstijl eerst, supplementen laat.

Beweging is het verst ontwikkelde domein en de blauwdruk voor de andere vier. Het
draait op één donkere cockpit-shell (--ac accentvariabele, serif koppen, 2xl-radii).

Vier oppervlakken na dit traject:

  OVERZICHT (view=cockpit)    = executie + staat. Tier-keuze, dagstap, "Markeer als
                                gedaan" (de ENIGE check-off), score+trend, route.
  STAPPENPLAN (view=stappenplan) = structuur. Fase-as, sport-lens, planprofiel.
  PROGRAMMA (view=programma)  = uitvoering. NIEUW. Concrete sessie-opbouw en
                                oefeningen. Geen afvink-oppervlak.
  CONTEXT-RAIL (md+)          = navigatie tussen die drie + check/gids/inzichten.

═══════════════════════════════════════════════════════════════════════════════
HARDE CONTEXT — GEVERIFIEERD TEGEN DE CODEBASE OP 23 JULI 2026
Neem dit als waar aan. Verzin geen alternatieve staat.
═══════════════════════════════════════════════════════════════════════════════

WAT AL WERKT (niet opnieuw voorstellen als gap)

- Tier-keuze is fase-aware en laadt de bijbehorende dagstap. Daily-log is de
  executie-SSOT; het stappenplan leest daaruit af.
- De sessie-catalogus bestaat (5 varianten, één op coming_soon) met label, doel,
  duur, frequentie, intensiteit en globale opbouw — maar GEEN oefening-per-oefening.
- Er bestaat al een craftier ring elders: een marketing-preview-component gebruikt
  een grotere viewBox (160 i.p.v. 128), een accent-glow (blur, opacity) en een
  gradient-grond. De cockpit-ring is de kalere 92px-variant zonder die lagen.
- De trend-data draagt AL een bron-label ("op basis van je intake" / "je check-ins" /
  "wat je noteerde"). Dat veld bestaat in de data-laag maar wordt in de cockpit NIET
  gerenderd. Er is dus geen nieuwe score-bron nodig om attributie te tonen.
- Er is een beweeg-check-in-route en een assessment-laag: bruikbare bron voor een
  "wat lukt nog niet"-afleiding, zonder nieuwe vragenlijst.
- De deep-view-parameter kent nu precies twee waarden: cockpit | stappenplan. De
  URL-parsing, de "ondersteunt deze view"-check en de sync-helper hardcoden dat
  tweetal op meerdere plekken.

WAT VLAKKER, DENSER OF SEMANTISCH LEEG IS (je werkgebied)

- SCORE + TREND: één tegel met een flex-rij — 92px-ring links, platte sparkline
  rechts. Geen craft-lagen (geen glow, geen baseline-marker, geen delta-accent), en
  het bestaande bron-label wordt niet getoond. De ring is kaler dan de marketing-
  preview die de gebruiker elders al ziet.
- ROUTE: zes waypoints waarvan "waarom", "doel" en "future" dezelfde ankerbron
  renderen. "Groei" is een kale score-delta. Er is geen semantisch model:
  nergens staat "wat wil ik bereiken maar kan ik nog niet". Het waypoint "vandaag"
  leest de generieke actieve gewoonte, niet de tier-keuze uit de hero.
- STAPPENPLAN: alles gestapeld in één component van ~607 regels — profiel-chips,
  programma-tegel, fase-tabstrip, mechanisme-asides. De score-ring uit de cockpit-
  laag blijft óók op deze view zichtbaar (dubbel). Instellingen staan vóór inhoud;
  de breedte is onbegrensd (proza rekt mee tot ~1600px bij ingeklapt contextpaneel).
- FASE-BRON: Overzicht en stappenplan berekenen dezelfde fase uit twee verschillende
  bronnen (hero uit plan_progress, plan uit de daily-log-afgeleide staat). Voor
  account-users is plan_progress leeg → de hero blijft op fase 1 terwijl het plan
  verder staat. Dit is de grootste vertrouwensbreuk; los hem op als bron-unificatie,
  niet als fase-logica-wijziging.

═══════════════════════════════════════════════════════════════════════════════
GELOCKTE BESLUITEN — respecteer, bediscussieer niet
═══════════════════════════════════════════════════════════════════════════════

1. De Overzicht-hero is de ENIGE plek waar iets wordt afgevinkt. Geen tweede
   vinklijst, ook niet op programma.
2. UI-label wordt "Overzicht"; de URL blijft tab=vandaag. Cosmetische rename in de
   rail en breadcrumbs, geen route-wijziging.
3. Concrete oefeningen leven op view=programma, NIET in de eerste viewport van
   Overzicht. Stappenplan = structuur/roadmap; programma = uitvoering.
4. Eén canonieke naam "stappenplan" in de UI (niet "beweegplan").
5. Daily-log = executie-SSOT. Fase wordt geünificeerd tussen hero en stappenplan.
6. Geen streaks, geen tweede score, geen badges, geen schuld-mechaniek.
7. Het pijn-deel ("nog niet: …") is herkenning, GEEN medische claim, geen diagnose,
   geen voorspelling van klachten.
8. Score is een proxy voor voortgang, nooit een normwaarde als oordeel. Een
   richtlijn (bijv. beweegrichtlijn-minuten) mag als CONTEXT verschijnen, nooit als
   cijfer waartegen de gebruiker "zakt" of "slaagt".
9. Geen affiliate of koop-CTA in het dashboard.
10. Nieuwe client-events: registratie op drie plekken. Noem dat bij elk nieuw event.

═══════════════════════════════════════════════════════════════════════════════
KWALITEITSLAT — ontwerp hiertegen
═══════════════════════════════════════════════════════════════════════════════

1. COCKPIT-CRAFT. De score+trend moet minstens het niveau halen van de bestaande
   marketing-preview-ring: grotere viewBox, accent-glow, een baseline-marker op de
   trend, een delta-accent op het eindpunt. Geen platte SVG naast platte lijn.
2. SEMANTIEK BOVEN DECORATIE. Elk waypoint beantwoordt één vraag en heeft één bron.
   Twee waypoints met dezelfde bron is een bug, geen ritme.
3. PROGRESSIVE DISCLOSURE. Op het stappenplan is maximaal één fase-paneel tegelijk
   open. Configuratie zit achter een drawer. De eerste viewport toont positie, geen
   instellingen.
4. BREEDTE IS MAAT. Lees ~68 tekens / werk ~1040px / as 100%, via een container
   query op de midden-zone (niet op het viewport). Proza rekt nooit mee.
5. ÉÉN INGANG PER OPPERVLAK. Programma is een nieuw oppervlak — definieer precies
   hoeveel doorways het heeft en verdedig elke extra ingang. Fragmentatie is de
   prijs van een vierde surface; houd hem laag.
6. 375px-FIRST. Nul horizontaal scrollende elementen. Tik-doelen ≥ 44px. Alle tekst
   leesbaar zonder zoom, ook de langere tier-uitleg.

═══════════════════════════════════════════════════════════════════════════════
SEMANTISCH ROUTE-MODEL (vertrekpunt — je mag verfijnen, motiveer afwijkingen)
═══════════════════════════════════════════════════════════════════════════════

Vijf waypoints in plaats van zes. "Waarom" vervalt (duplicaat van doel).

  Hier begon je  — 0-punt / baseline.        bron: trend-baseline
  Jouw doel      — anker + concrete capability. bron: anker + NIEUW capabilityStatement
  Vandaag        — actuele stap + tier.        bron: tier-keuze + daily-log + fase
  Mijn groei     — PIJN-DEEL: wat nog niet lukt. bron: NIEUW, afgeleid uit anker +
                                                check-in-gaps. Herkenning, geen schuld.
  Future You     — maatstaf richting doel.     bron: score-delta + NIEUW goalProgress

Pijn-deel-logica (concept): per anker-type een capability-map (zelfstandigheid →
trap/tillen/knieën; meedoen → intensiteit/meerdere dagen achter elkaar; …) gekoppeld
aan de bestaande check-in-antwoorden. Uitkomst is een herkenningszin ("Nog niet:
de trap op zonder steun"), nooit een klacht-voorspelling.

═══════════════════════════════════════════════════════════════════════════════
TAAK A — SCORE + TREND CRAFT
═══════════════════════════════════════════════════════════════════════════════

1. Ontwerp MovementScorePanel: tweekoloms op lg (ring links, trend rechts), gestapeld
   op 375px. Benoem de craft-lagen die de kale cockpit-ring nu mist en de preview
   wel heeft.
2. Trend: sparkline + baseline-marker + delta + eindpunt-accent. Beschrijf elke laag.
3. Attributie: toon het BESTAANDE bron-label ("op basis van je intake" e.d.). Scheid
   dit expliciet van een eventuele richtlijn-context — bron-attributie zegt WAAR de
   score vandaan komt; een beweegrichtlijn zegt iets over gedrag en is een aparte,
   voorzichtiger regel (gelockt besluit 8). Geef beide copy-varianten en zeg welke
   waar staat. Eén richtlijn-link (naar de gids of pijler-pagina), niet meer.
4. Waar leeft dit paneel: Overzicht-only, of ook elders? Motiveer, en bevestig dat de
   score van het stappenplan verdwijnt.

═══════════════════════════════════════════════════════════════════════════════
TAAK B — ROUTE HERINRICHTEN (5 waypoints + pijn-deel)
═══════════════════════════════════════════════════════════════════════════════

1. Werk het vijf-waypoint-model uit: per waypoint bron, functie, en toestanden
   (leeg / begonnen / gehaald). Motiveer het schrappen van "waarom".
2. Ontwerp het pijn-deel: hoe leidt een anker + check-in-gap tot een herkenningszin
   zonder medische claim? Geef de capability-map-structuur en drie copy-voorbeelden +
   twee afgekeurde (die als diagnose of schuld lezen).
3. Koppel het waypoint "Vandaag" aan de echte tier-keuze + de geünificeerde fase,
   niet aan de generieke gewoonte. Beschrijf de toestanden: niets gekozen · gekozen,
   niet gedaan · gedaan · rustdag · andere pijler is prioriteit.
4. Hero doel-brug: één regel die de tier-keuze aan het anker koppelt ("Past bij: zelf
   de trap op blijven komen"). Waar staat die, en hoe voorkom je dat hij bij elke
   tier hetzelfde zegt?

═══════════════════════════════════════════════════════════════════════════════
TAAK C — PROGRAMMA DEEP VIEW (nieuw oppervlak)
═══════════════════════════════════════════════════════════════════════════════

1. IA van view=programma: sessie-kaart (duur/frequentie/opbouw) + concrete
   oefeningen. Wat toont een oefening wél (naam, doel, sets/reps-richting, cue) en
   bewust NIET (geen logboek, geen gewichten-tracker, geen workout-builder)?
2. Doorways: hoeveel, en welke? De brief noemt er twee (vanuit de hero na tier-keuze
   én vanuit de programma-kaart op het stappenplan). Beoordeel of twee ingangen
   verdedigbaar zijn tegen kwaliteitseis 5, of dat er één moet vervallen.
3. Relatie tot het stappenplan: de programma-kaart op het stappenplan is een SAMEN-
   VATTING; programma is de VOLLEDIGE uitvoering. Trek die grens zodat ze niet
   overlappen.
4. coming_soon-variant: wat toont programma als de gekozen sessie nog geen uitgewerkte
   opbouw heeft?
5. Bevestig: geen afvinken op programma. Waar landt de intentie "ik ga dit doen" dan?

═══════════════════════════════════════════════════════════════════════════════
TAAK D — STAPPENPLAN ONTDICHTEN
═══════════════════════════════════════════════════════════════════════════════

1. Volgorde na ontdichting: positie-header → fase-as → programma-kaart (compact, met
   link naar programma) → sport-lens → fase-detail (collapsible, max 1 open) →
   mechanisme/grens. Bevestig of herorden, motiveer.
2. Wat verdwijnt: score-ring, lege intro-tegel, losse afvink-banner. Zeg per element
   waar het heen gaat.
3. Profiel (spoor/locatie/frequentie/sport) → drawer/sheet, niet als primaire chip-
   rijen. Beschrijf de leesstaat apart van de bewerkstaat.
4. Breedte-ladder toepassen: welk element krijgt welke maat, en wat doet het
   tweekoloms-regime bij ingeklapt contextpaneel?

═══════════════════════════════════════════════════════════════════════════════
TAAK E — DOELMAATSTAF OP DE ROUTE
═══════════════════════════════════════════════════════════════════════════════

1. Ontwerp de goalProgress-readout voor "Mijn groei" en "Future You". Score als proxy
   voor capability-voortgang, gecombineerd met de hermeting-countdown — nooit een
   tweede score, nooit een normwaarde-oordeel (besluit 8).
2. Copy: "Begin 51 · nu 58 · richting {anker-label}" zonder belofte en zonder
   normwaarde. Geef drie varianten en zeg welke bij welke trend-richting past
   (omhoog / vlak / omlaag — juist bij vlak/omlaag geen schuld).

═══════════════════════════════════════════════════════════════════════════════
TAAK F — IMPLEMENTATIESLICES
═══════════════════════════════════════════════════════════════════════════════

Lever slices met prefix OV- (OV-S0 … OV-S8), elk klein genoeg voor één PR. Per slice:

  Slice-ID | Naam | User-visible | Componenten (nieuw/hergebruik/vervangen) |
  Lib & data | Acceptatiecriteria (checkbox) | Raakt model? | Risico

Verplicht daarbij:
- Een RECONCILIATIE-TABEL met de blauwdruk-slices S0–S7: welke OV-slice hetzelfde
  werk doet, welke nieuw is, welke een blauwdruk-slice vervangt. Nooit twee slices
  dezelfde naam geven.
- Markeer per slice: puur visueel (goedkoop terug te draaien) vs model-rakend.
- Benoem expliciet dat OV-S7 (programma-view) de deep-view-parameter van twee naar
  drie waarden brengt en dus de URL-parsing, de ondersteunings-check en de sync-helper
  raakt — niet alleen een nieuw component.
- Dependency-grafiek + welke slice de eerste PR is en waarom.

Vertrekpunt (herorden mag, motiveer):
  OV-S0 rename Vandaag → Overzicht (rail + breadcrumbs)
  OV-S1 MovementScorePanel: craft-ring + trend-attributie
  OV-S2 fase-unificatie hero ↔ stappenplan (daily-log als bron)
  OV-S3 route: 5 waypoints + pijn-deel + goalProgress
  OV-S4 hero doel-brug (tier ↔ anker)
  OV-S5 stappenplan ontdichten (score weg, collapsible fases, profiel-sheet)
  OV-S6 sport-lens
  OV-S7 programma deep view + rail-tool + URL-parsing (3e view)
  OV-S8 meetpunten + tests (journey + url)

═══════════════════════════════════════════════════════════════════════════════
KRITIEKRONDE (verplicht vóór je definitieve versie)
═══════════════════════════════════════════════════════════════════════════════

Vier perspectieven, elk 2–3 kritiekpunten + 1 verbetering:
1. Product Designer (craft, ritme, 375px, gedrag op 27 inch)
2. 45-jarige gebruiker met een matige week — leest het pijn-deel als motivatie of
   als verwijt?
3. Frontend-ontwikkelaar (deep-view van 2 → 3 waarden, splitsen van 607 regels,
   regressie op daily-log-sync, staatsexplosie)
4. Compliance (geen diagnose op pijn-deel, geen normwaarde-oordeel, stepped care)

Markeer wat je wijzigde t.o.v. versie 1.

═══════════════════════════════════════════════════════════════════════════════
OUTPUTFORMAAT (exact deze secties)
═══════════════════════════════════════════════════════════════════════════════

A. Executive summary + GO/PIVOT/KILL per idee (score-panel, 5-waypoint-model,
   pijn-deel, programma-view, stappenplan-ontdichting, fase-unificatie).
B. Frictie-diagnose — tabel: element | huidige staat | root cause | fix-principe.
C. Doel-journey Overzicht → Route → Stappenplan → Programma in stappen, met edge
   cases (geen anker · andere pijler prioriteit · rustdag · vlakke trend · terugkeer
   na stilte · anonieme intake-user).
D. Wireframes 375px: score/trend, route, stappenplan (vóór/na ontdichting), programma.
   Plus één breed-scherm-wireframe (ingeklapt contextpaneel).
E. Component-architectuur + props-signaturen (types only).
F. Waypoint + pijn-deel informatiemodel: per gegeven bron, scope, wie leest. Nieuwe
   velden expliciet gemarkeerd (capabilityStatement, goalProgress).
G. Programma deep view IA + doorway-besluit.
H. Stappenplan density-strategie: wat blijft, wat schuift, wat verdwijnt.
I. Trend-attributie + richtlijn-copy (bron-label vs richtlijn-context gescheiden).
J. Copy & button-hiërarchie per oppervlak (Overzicht / Stappenplan / Programma).
K. Meetplan: events + payload + hergebruik-of-nieuw + drievoudige registratie. Geen
   PII. Sluit af: "Meetpunt: <event(s)> — hier lees je het effect af."
L. Slices OV-S0…OV-S8 + reconciliatie-tabel met blauwdruk-S0–S7 + dependency-grafiek.
M. Open vragen, genummerd, elk met JOUW aanbevolen antwoord.

Sluit af met SELF-SCORECARD (1–10) op zeven dimensies: visuele craft · SSOT-
consistentie · mobiel 375px · gedrag groot scherm · semantische helderheid route ·
dev-realisme · stepped-care/compliance. En ANTI-PATTERNS die je vermijdt (minimaal:
dubbele score-widget, waypoint-duplicatie, pijn-deel-als-diagnose, normwaarde-als-
oordeel, tweede vinklijst, programma als tweede afvink-oppervlak, proza tot 1600px).

═══════════════════════════════════════════════════════════════════════════════
CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- GEEN code/diffs/JSX/Tailwind. Props-signaturen (sectie E) zijn types, geen impl.
- GEEN nieuwe route; programma is een view-parameter binnen de dashboard-route.
- Alle events blijven VOORSTELLEN — registreer niets.
- Onduidelijk? Kies de sterkste optie, noteer "AANNAME: …", ga door. Vragen naar
  sectie M, niet tussendoor.
- Denk diep. Wijk je af van de bestaande architectuur, zeg het hardop en onderbouw.

BEGIN.
```

---

## Verwachte output (checklist)

- [ ] **A** — Summary + GO/PIVOT/KILL
- [ ] **B** — Frictie-diagnose (tabel)
- [ ] **C** — Doel-journey met edge cases
- [ ] **D** — Wireframes 375px + breed-scherm
- [ ] **E** — Component-architectuur + props
- [ ] **F** — Waypoint + pijn-deel informatiemodel (nieuwe velden gemarkeerd)
- [ ] **G** — Programma deep view IA + doorway-besluit
- [ ] **H** — Stappenplan density-strategie
- [ ] **I** — Trend-attributie + richtlijn-copy (gescheiden)
- [ ] **J** — Copy & button-hiërarchie (3 oppervlakken)
- [ ] **K** — Meetplan met drievoudige registratie
- [ ] **L** — Slices OV-S0…OV-S8 + reconciliatie met blauwdruk + dependency-grafiek
- [ ] **M** — Open vragen mét aanbevolen antwoord
- [ ] Self-scorecard (7 dimensies) + anti-patterns

---

## Verificatie-log (23 juli 2026, tegen `main`)

| Claim in de prompt | Werkelijke staat | Bron |
|---|---|---|
| Score+trend = één tegel, 92px-ring + platte sparkline | **Bevestigd.** viewBox 128, ring-radius 54, geen glow/gradient; sparkline zonder marker | [MovementCockpit.tsx:120-207](../../src/components/dashboard/beweging/MovementCockpit.tsx#L120-L207) |
| Craftier ring bestaat elders (grotere viewBox, glow, gradient) | **Bevestigd.** viewBox 160, `blur-2xl opacity-30`-glow, gradient-grond | [MovementDashboardPreview.tsx:43-50](../../src/components/content/MovementDashboardPreview.tsx#L43-L50) |
| Trend draagt een bron-label dat de cockpit niet toont | **Bevestigd.** `baselineSourceLabel` bestaat met drie waarden ("op basis van je intake/check-ins/wat je noteerde") en wordt in de cockpit niet gerenderd | [leefstijllijn.ts:20-33](../../src/lib/leefstijllijn.ts#L20-L33) |
| Zes waypoints, "waarom"/"doel"/"future" delen de ankerbron | **Bevestigd.** ids: begin · waarom · doel · vandaag · groei · future | [movement-journey.ts:53-100](../../src/lib/movement-journey.ts#L53-L100) |
| Deep-view kent nu twee waarden; toevoegen raakt parsing + sync | **Bevestigd.** `type KompasDeepView = "cockpit" \| "stappenplan"`; het tweetal is hardcoded in de parse-, ondersteunings- en sync-helpers | [dashboard-url.ts:13](../../src/lib/dashboard-url.ts#L13), [dashboard-url.ts:31-39](../../src/lib/dashboard-url.ts#L31-L39) |
| Score-ring blijft zichtbaar op stappenplan-view | **Bevestigd.** Bij `isPlanView` verbergt de cockpit-laag de hero maar rendert de tegel "Waar je staat" | [MovementCockpit.tsx:103-207](../../src/components/dashboard/beweging/MovementCockpit.tsx#L103-L207) |
| Fase-bronbreuk hero (plan_progress) vs plan (daily-log) | **Bevestigd.** Zie blauwdruk §1d | [account-dashboard.ts:630-639](../../src/lib/account-dashboard.ts#L630-L639) |
| Check-in/assessment-laag bestaat als bron voor het pijn-deel | **Bevestigd.** `capabilityStatement` bestaat nog NIET (nieuw veld); de bron wel | [api/intake/movement-checkin/route.ts](../../src/app/api/intake/movement-checkin/route.ts), [movement-assessment.ts](../../src/lib/movement-assessment.ts) |

---

## Twee waarschuwingen die de prompt al verwerkt

1. **De "beweegrichtlijn 150–300 min/week"-benchmark is een normwaarde-risico.** Het bestaande `baselineSourceLabel` zegt wáár de score vandaan komt ("uit je vragenlijst") — dat is veilig en bestaat. Een minuten-richtlijn ernaast zetten leest al snel als een lat waar je onder zakt, en dat botst met het gelockte besluit "geen normwaarde als oordeel". De prompt scheidt die twee daarom expliciet in taak A.3 en besluit 8: bron-attributie mag altijd, richtlijn alleen als context, nooit als score-oordeel.

2. **De slice-nummering botst met de blauwdruk.** `BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md` heeft al S0–S7 met andere betekenissen. De prompt gebruikt daarom het prefix `OV-` en eist een reconciliatie-tabel, zodat een Cursor-sessie nooit twee verschillende dingen "S3" hoort noemen.

---

## Bijlagen-checklist voor het Opus-gesprek

- [ ] Screenshot Overzicht (huidige Vandaag) — 375px + desktop
- [ ] Screenshot stappenplan — desktop + ingeklapt contextpaneel
- [ ] Optioneel: [`BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md`](../plan/BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md), [`BEWEEG_COCKPIT_FUTURE_YOU.md`](../plan/BEWEEG_COCKPIT_FUTURE_YOU.md), [`WRITING_VOICE.md`](../core/WRITING_VOICE.md)

---

Meetpunt: geen — dit document activeert niets. Het meetplan komt uit sectie K van de Opus-output en wordt per slice geregistreerd.
