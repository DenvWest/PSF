# Dashboard-Home & Cockpit-IA — product- en UX-analyse

> **Status (23 jul 2026): product/UX-analyse. Geen code, geen implementatie-stappen (§11 alleen high-level slices).**
> Vierde document in de cockpit-reeks, op de vraag *"wat gebeurt er als iemand vanaf de site op Dashboard klikt, en waar hoort alles?"*
> - [`ROADMAP_DASHBOARD_COCKPIT.md`](../core/ROADMAP_DASHBOARD_COCKPIT.md) — de **koers** (P0–P3, freeze/defer). Leidend; bij tegenstrijdigheid wint dat document.
> - [`ONTWERP_BEWEEGCOCKPIT_COMMANDOCENTRUM.md`](ONTWERP_BEWEEGCOCKPIT_COMMANDOCENTRUM.md) — de **ruimtelijke** laag (header, drie zones, inspector).
> - [`ONTWERP_BEWEEGDASHBOARD_BESTURINGSSYSTEEM.md`](ONTWERP_BEWEEGDASHBOARD_BESTURINGSSYSTEEM.md) — het **conceptuele** (vier vragen, betekenis-motor).
> - **Dit document** — de **home/IA/schaal**-laag: de landingspagina, de driedubbele "Kompas"-knoop, full-width, en het minimale multi-domein-contract.
> **Verankerd tegen `main` (23 jul).** Alle namen verwijzen naar bestaande artefacten. Verandert geen enkele DEFER/FREEZE/KILL-status.

---

## 1. Executive summary

Over 6–12 maanden is het dashboard één **shell** (vaste chrome, één scrollend canvas) waarin je altijd op een **App-home** landt — geen domein, geen lange domeinlijst — die in één blik zegt *waar je staat, wat je ene ding vandaag is, en waar je naartoe werkt*. Van daaruit stap je in een **domein-cockpit** (beweging is de referentie; slaap/stress/voeding erven de structuur, energie/herstel blijven readout). De reis-metafoor (Hier begon je → Future You) leeft als **read-only content binnen "Jouw route" en Voortgang** — niet als header-navigatie. De rechter inspector legt contextueel *waarom deze stap* uit; supplementen zijn hooguit een voeding-hint, nooit een verkoop. De **één beslissing die alles unlockt: stop met "pagina met tabs", commit aan de `CockpitFrame`-shell als container en geef die een echte App-home-surface.** Zodra de shell de container is, is full-width gratis (geen breakout-hack), is de inspector een zone i.p.v. bijzaak, en generaliseert het patroon naar elk domein zonder zes tegels te kopiëren. De inschakelende sub-beslissing: **ontwar het woord "Kompas"** — nu drie dingen tegelijk (tab-shell, domein-switch-knop, reis-metafoor). Je instinct "er moet een landingspagina komen" en "kleiner bewegen" klopt; je instinct "Kompas = reis-nav in de header" corrigeer ik — een gelockt besluit zegt: waypoints horen in Jouw route, niet in de nav. En de scherpste waarschuwing: dit is craft op het referentie-domein, geen North-Star-werk — het mag de "start de klok met 20–50 mannen"-prioriteit (roadmap §1) niet vervangen.

---

## 2. Informatiearchitectuur — drie lagen

```
LAAG A · APP-HOME (landing na "Dashboard"-klik)
┌──────────────────────────────────────────────────────────────────────┐
│ Kompas — oriëntatie                                                    │
│ Doel:   "waar sta ik, wat doe ik nu, waar ga ik heen" in één blik.     │
│ Actie:  het ENE ding van vandaag afvinken (prioriteitsdomein-hero).    │
│ 1e viewport: groet + Future-You-regel · VANDAAG-hero · forward-pointer.│
│              Domeinen als compacte scanstrip eronder (niet dominant).  │
└───────────────┬──────────────────────────────────────────────────────┘
                │ (klik domein-kaart / module-tab)
                ▼
LAAG B · MODULE-NAV (header-tabs — vaste chrome)
┌──────────────────────────────────────────────────────────────────────┐
│ Kompas*   ·   Mijn Dag   ·   Voortgang   ·   Hermeting     [Meer ▾]    │
│ Doel:   wisselen tussen de vier werkmodi zonder te verdwalen.          │
│ Actie:  één tab actief; onderstreping in accent, geen gevulde knop.    │
│ 1e viewport: de actieve module vult het canvas; chrome blijft staan.   │
│                                                                        │
│ Kompas    = App-home (Laag A) — oriëntatie/prioriteit over domeinen.   │
│ Mijn Dag  = dag-executie (agenda-timeline / week) — AgendaScreen.      │
│ Voortgang = leefstijllijn/trend over tijd — VoortgangHub.              │
│ Hermeting = het meetmoment — remeasure.                                │
└───────────────┬──────────────────────────────────────────────────────┘
                │ (open een interventie-domein vanuit Kompas)
                ▼
LAAG C · DOMEIN-COCKPIT (werkstation per domein)
┌──────────────────────────────────────────────────────────────────────┐
│ Beweging (referentie) · Slaap · Stress · Voeding  → intervention       │
│ Energie · Herstel                                 → readout (gereduceerd)│
│ Doel:   dit domein bedienen — stap doen, stand zien, route volgen.     │
│ Actie:  VANDAAG-hero afvinken (de ENIGE check-off) + prioriteit kiezen.│
│ 1e viewport: hero domineert; score/trend/route kaderen; plan = reader. │
│ Reis-content (route, Future You) leeft HIER + in Voortgang, niet in nav.│
└──────────────────────────────────────────────────────────────────────┘
```

**Waarom Kompas zowel Laag A als een Laag B-tab is:** Kompas *is* de home. De andere drie tabs zijn de andere werkmodi. De gebruiker landt op Kompas (oriëntatie over al zijn domeinen); vanaf daar duikt hij één domein in (Laag C) of wisselt van modus (Laag B). Zo is er precies één landingsplek en nooit een keuze-uit-zeven bij binnenkomst.

---

## 3. Dashboard Home — ontwerpvoorstel

De huidige `KompasHome` (Dashboard.tsx:3180) toont: hermeting-reminder → `AgendaTodayHero` → domeinrijen in drie groepen (Prioriteit / Aandacht / Rapport). De klacht "lange domeinlijst" komt daar vandaan: drie groepen balken concurreren met de ene actie. Doc 4 pr.3 (roadmap) noemt dit al: *"zeven domeinbalken naast één actie = hoge cognitieve last."*

### Optie A — "Eén ding + stille strip" (aanbevolen)
De home leidt met **één** hero (het prioriteitsdomein van vandaag) en degradeert de domeinen tot een **compacte, scanbare strip** onder de vouw.

| Trade-off | A |
|---|---|
| Cognitieve last 1e viewport | Laag — één actie domineert |
| Domein-overzicht | Behouden, maar gedegradeerd tot scanstrip |
| Bouwkosten | Laag — herschikking van bestaande `KompasHome`, geen nieuwe data |
| Risico | Prioriteitsdomein moet altijd kloppen (engine levert dat al) |

### Optie B — "Reis-dashboard" (afgeraden nu)
Home als narratief reis-overzicht: Future-You-beeld groot bovenaan, trendlijn, dan pas de stap.

| Trade-off | B |
|---|---|
| Emotionele hook | Sterker (Future You centraal) |
| Actie-helderheid | Zwakker — de dagstap zakt onder de vouw |
| Bouwkosten | Hoog — nieuwe narratieve componenten, raakt de freeze |
| Risico | Mooi maar traag; verkeerde prioriteit pre-traffic (§10) |

**Aanbeveling: A.** De home moet vertrouwen wekken door *helderheid over de volgende stap*, niet door een narratief dat de actie verstopt. Future You hoort als **teaser-regel** (één zin) op de home en als **volle beleving** in Voortgang/Hermeting — niet als home-hero. B is de verleiding die de roadmap "eindeloos polijsten zonder cohort" noemt.

### Inhoudsblokken home (max 5, op prioriteit)
1. **Groet + Future-You-regel** — persoonlijk, warm (`Greeting` + één anker-zin). *"Dag Dennis — elke week telt mee voor de versie van jou die straks nog gewoon de trap op komt."*
2. **VANDAAG-hero** (prioriteitsdomein) — de enige check-off; hergebruikt `AgendaTodayHero`/day-model. Dít is de actie.
3. **Forward-pointer** — één regel: hermeting-afteller *of* "na Gedaan: morgen kies je opnieuw". Nooit een tweede primaire CTA.
4. **"Je domeinen"** — compacte strip: Prioriteit uitgelicht (accent), Aandacht neutraal, Rapport (energie/herstel) gedimd met "volgt uit je gedrag". Elk → domein-cockpit. Standaard ingeklapt/kort, geen drie volle groepen.
5. **Hermeting-reminder** — alleen als er iets te melden is; anders weg (geen lege kaart).

### Wat verdwijnt vs blijft van huidige `KompasHome`
| Blijft | Verdwijnt / degradeert |
|---|---|
| `AgendaTodayHero` als hero (ongewijzigd, day-model SSOT) | Drie volle domeingroepen boven de vouw → één scanstrip |
| Prioriteit/Aandacht/Rapport-**onderscheid** (semantiek klopt) | De **visuele zwaarte** ervan (van blokken naar regels) |
| Readout-presentatie energie/herstel ("volgt uit je gedrag") | Readout-domeinen als volwaardige "rijen" naast interventies |
| Hermeting-reminder (conditioneel) | Altijd-zichtbare reminder ongeacht relevantie |

### Besloten (23 jul, iteratie): één "Vandaag-home" + aparte Agenda

Na afstemming met Dennis is de home-structuur vastgesteld. Dit vervangt de eerdere §2-formulering van een aparte "Kompas"- én "Mijn Dag"-tab: er is **één home** ("Vandaag"), en de agenda blijft een **eigen surface** ernaast.

**Nav = `Vandaag* · Agenda · Voortgang · Hermeting`** (herstelt de gelockte 4-tab-structuur [[psf-cockpit-herontwerp]]; "Vandaag" ≈ Kompas-home, "Agenda" ≈ Mijn Dag/-Week).

```
VANDAAG-home
├ Groet + Future-You-regel (1 zin)
├ VANDAAG-hero  — prioriteitsdomein · de ENIGE check-off · startpunt→Future You ALLÉÉN hier
├ Je domeinen (review) — gedegradeerde scanstrip: prioriteit rijk, rest 1 regel, readout gedimd
├ Agenda-sub-review — vandaag + volgend blok, READ-ONLY (glimp)
└ Bekijk je week →  ──────────────────────────────►  Agenda-tab (volle planning)
```

**Waarom Agenda apart blijft (coaching-native surface).** Planning is de coaching-primitief: een coach vormt de *week/het plan*, niet "het ene ding vandaag". De Agenda is dus de surface die later multi-tenant/coach-deelbaar wordt (ONTWERP §15). Als eigen module kan hij eigen diepte krijgen (week → swap → plan) zónder de home te verzwaren. Vandaag-home = "wat is nu het ene ding + waar sta ik"; Agenda = "hoe is mijn week/plan gebouwd" — twee jobs, niet samenvoegen.

**Grens: apart houden ≠ nu bouwen.** Agenda-diepte (week/swap/`agenda_preferences`) blijft **DEFER, gelockt achter de retentie-trigger** (<30% 2e-dag-retour, N≥30, roadmap §3 + [[psf-agenda-checkin-verdict]]); coach-planning is een toekomst-tenant-module. Nu: de tab **reserveren + lean houden**, diepte ná de klok.

**Koppeling home ↔ Agenda (invariant).** De agenda-sub-review in de home en de volle Agenda lezen **dezelfde `day-model`** (A3). De home toont een read-only glimp; de check-off leeft uitsluitend in de Vandaag-hero (één dag-waarheid, geen tweede todo-lijst). "Bekijk je week →" deeplinkt. Zelfde data, twee zoomniveaus — geen parallel schema.

**Startpunt → Future You: alléén op het prioriteitsdomein (nu).** Per-domein doel + startpunt → Future You is de juiste 12-maanden-visie, maar het anker-systeem bestaat vandaag alléén voor beweging ([Dashboard.tsx:4153](../../src/components/dashboard/Dashboard.tsx#L4153)). Vijf domeinen elk met doel+startpunt+bestemming = de muur terug. Dus nu: rijk op het prioriteitsdomein in de hero, één-regel-status voor de rest; de volledige per-domein-Future You generaliseert wanneer slaap module 2 wordt (P3, ná verkeer).

**Afgeraden — ook in de toekomst: koop-/affiliate-opties in de home.** Botst met "geen affiliate in het dashboard" (CLAUDE.md) én de positionering (*"jij bent de cockpit, niet de supplementenboer"*). Commerce leeft op content-/vergelijkingspagina's. Het compliant patroon: de cockpit **hint contextueel** ("een eiwitrijk ontbijt helpt hier →") en **linkt naar een gids/vergelijkingspagina**; de koop gebeurt daar, niet in de home. Premium (longitudinale diepte) is een aparte as — geen betaalmuur vóór een prijsband-signaal.

---

## 4. Kompas — herpositionering

### Is "Kompas" nog de juiste term?
**Ja — mits ontward.** "Kompas" is nu drievoudig bezet: (1) de tab-shell `Kompas/Voortgang/Hermeting`, (2) de terugknop/switch in `DomainTopNav`, (3) de reis-metafoor uit de ONTWERP-doc (§4, de journey-stepper). Die stapeling is de echte verwarring, niet het woord.

**Aanbeveling:** geef Kompas **één** betekenis: *de oriëntatie-home* — waar sta ik, wat is mijn prioriteit, wat is het ene ding vandaag. Een kompas oriënteert; dat is precies wat de home doet. Dan:
- De **domein-switch** (slaap/beweging/…) wordt een aparte, kleinere control (segmented control in de domein-context, niet "Kompas").
- De **reis** (Hier begon je → Future You) wordt **géén header-nav**. Dit honoreert het gelockte besluit *"waypoints = Jouw route, geen nav"* ([[psf-cockpit-herontwerp]]). De waypoints leven read-only in `MovementJourneyRail` ("Jouw route") en in Voortgang.

> **Correctie op je instinct.** Je prompt oppert *"Mijn Dag als home, Kompas als reis-nav"*. De ONTWERP-doc §4.3 stelde die journey-rail-in-de-header ook voor — maar het **latere lock** draaide dat terug: de reis is content in Jouw route, niet navigatie. Dus: **Kompas blijft de home** (niet de reis-nav), en **Mijn Dag wordt de dag/agenda-executie-tab** (niet de home). Dat is het tegenovergestelde van de prompt-formulering, en het is de sterkere keuze — een reis-stepper als primaire nav is zes klikbare bestemmingen die met de dagstap concurreren; precies de cognitieve last die de roadmap weert.

### Relatie home ↔ Kompas ↔ domein-cockpit
- **Kompas = home** (Laag A/B). Oriëntatie over álle domeinen.
- **Domein-cockpit** (Laag C) = inzoomen op één domein. Bereikbaar vanuit de Kompas-scanstrip.
- De reis-metafoor verbindt beide **narratief, niet structureel**: elke domein-cockpit heeft z'n eigen "Jouw route"; Voortgang aggregeert ze tot de lijn richting Future You.

### Hoe komt de "reis" terug zonder overload?
Drie ankerpunten, elk op één plek — nooit alle drie tegelijk prominent:
1. **Future You-regel** (één zin) op de home — de bestemming, licht aangestipt.
2. **"Jouw route"** in de domein-cockpit — de fases (● NU / ○ toekomst / ✓ gedaan), read-only.
3. **De lijn** in Voortgang/Hermeting — de payoff, bewust niet dagelijks (day-model levert geen dagscore; de score beweegt bij hermeting).

---

## 5. Navigatiemodel & logo

### Logo-destinatie ingelogd
**Aanbeveling: de Wordmark linkt ingelogd naar de App-home (Kompas), niet naar `/`.** Nu verlaat een klik op het logo de app naar de publieke homepage — dat breekt het app-gevoel ("ik val uit mijn cockpit"). De publieke site is een aparte surface; de uitgang ernaartoe hoort **expliciet in het profielmenu** ("Naar perfectsupplement.nl"), niet als per ongeluk-klik op het logo.

> **Nuance die je moet wegen (open vraag §12):** de publieke site (`/inzichten`, `/supplementen`) is óók je content-funnel en affiliate-monetisatie. Je wilt ingelogde gebruikers soms *bewust* naar content kunnen sturen. Oplossing: logo → app-home; content-uitstapjes lopen via inhoudelijke links ("Lees de gids →"), niet via het logo. De uitgang is een keuze, geen sluiproute.

### Breadcrumb-structuur
Geen klassieke breadcrumb-trail; de **twee-rijige header is de breadcrumb**: rij 1 (module) = waar in de app, rij 2/context = welk domein. Diepe views (stappenplan, plan-reader) krijgen één "← terug naar Beweging"-anker, geen keten. Houd het plat — de shell heeft nooit meer dan drie niveaus (home → domein → deep-view).

### Publieke site vs app-surface scheiden zonder gevangenschap
| Surface | Chrome | Uitgang |
|---|---|---|
| Publiek (`/`, `/supplementen`, `/inzichten`) | Publieke `Header` | "Naar je dashboard" (ingelogd) |
| App (`/dashboard/*`) | Cockpit-shell, geen publieke Header | Profielmenu → "Naar perfectsupplement.nl" + inhoudelijke content-links |

Geen gevangenschap: de uitgang bestaat, maar is *een besluit* (menu/inhoudelijke link), niet de default-logoklik. Dat is de balans tussen "app-gevoel" en "funnel open houden".

### Future-proof slot voor coach/logboek (concept, niet bouwen)
De multi-module-toekomst (coach: notities, logboek) landt in **twee gereserveerde plekken** zonder de kern te verzwaren:
- **"Meer ▾"** in de modulenav — overflow-slot waar een toekomstige module ("Logboek", "Coach") bijkomt.
- **Inspector-kaart-type** — een `CoachCard`/`NoteCard` is een nieuw kaart-type in de bestaande inspector-zone, geen nieuwe pagina.

Beide zijn **conceptuele naden**, geen bouw. De shell verandert niet als ze komen; alleen de inhoud van bestaande zones groeit (ONTWERP §15).

---

## 6. Beweging-cockpit — herschalen

Je instinct "het beweeg-beeld is te groot/dominant" **klopt**. Zes gelijkwaardige tegels in een smalle kolom lezen als een muur. De diagnose is niet "te veel tegels" maar "te weinig hiërarchie + te smalle container" (§8).

### 6-tegel inventaris: behouden / verkleinen / verplaatsen / schrappen
| Tegel (MovementCockpit.tsx) | Nu | Advies |
|---|---|---|
| **VANDAAG-hero** (`MovementTodayHero`) | full-width, gevulde knop | **Behouden, groot.** De ster. Enige check-off. |
| **Waar je staat** (score-ring) | 2-up met trend | **Verkleinen.** Ring kleiner, naar readout-strip; geen eigen halve breedte. |
| **Je trend** (sparkline) | 2-up met score | **Verkleinen + samenvoegen** met score tot één "waar je staat"-readout-rij. |
| **Jouw route** (`MovementJourneyRail`) | full-width | **Behouden**, maar compacter; dit draagt de reis-metafoor (§4). |
| **Deze week** (`MovementWeekRhythm`) | 2-up | **Verplaatsen** — kandidaat voor de inspector/rechterzone (context, geen kern). |
| **Je volgende meetmoment** | 2-up | **Verplaatsen naar inspector** (het is letterlijk een `meet`-inspectorkaart, §7). Op de home als forward-pointer-regel. |

Netto: van zes gelijkwaardige tegels → **één hero + één "waar je staat"-readout-rij + Jouw route**, met "Deze week" en "meetmoment" naar de rechterzone. Dat is de "kleiner"-die je zoekt: minder tegels in het midden, meer als context.

### Doel-first-viewport

**375px (mobiel):**
```
[Wordmark]                 🔔  ◐≡
Kompas · Mijn Dag · Voortgang     (scroll-chips)
┌ VANDAAG · trainen ───────────┐
│ Eén krachtsessie: squat/push  │
│ voor: sterk blijven · ⏱30–45  │
│ [ Markeer als gedaan ✓ ]      │
│ Geen tijd?   Waarom? ⌃        │   ⌃ = bottom sheet (inspector)
└───────────────────────────────┘
◔58 Beweging · begin55→nu58       (score+trend, één rij, compact)
Jouw route  ● F1 · ○ ○ ○
Bekijk je volledige stappenplan →
🚶Dag 📅Week 📈Voortg 🎯Doel        (bottom-nav)
```

**1280px (desktop, drie zones):**
```
┌ HEADER: Kompas* · Mijn Dag · Voortgang · Hermeting        🔔 ◐ ⚙ ┐
├───────────┬───────────────────────────────────┬─────────────────┤
│ PROFIEL   │ ┌ VANDAAG · trainen ────────────┐ │ INSPECTOR       │
│ 250px     │ │ Eén krachtsessie …            │ │ 330px           │
│           │ │ [ Markeer als gedaan ✓ ]      │ │ ┌ Waarom deze ─┐ │
│ Wie ben ik│ └───────────────────────────────┘ │ │ stap …        │ │
│ · naam    │ ◔58 Beweging · begin55→nu58       │ └───────────────┘ │
│ · Vandaag │ (score+trend, één readout-rij)    │ ┌ Deze week ────┐ │
│   ✓/○     │ ┌ Jouw route ─────────────────┐   │ │ kracht 1×     │ │
│ Hoe voel  │ │ ● F1 NU · ○ ○ ○  plan →      │   │ └───────────────┘ │
│ je je? →  │ └─────────────────────────────┘   │                 │
└───────────┴───────────────────────────────────┴─────────────────┘
```

### Waar past beweegplan/stappenplan?
Het plan hoort **niet als zesde tegel** en **niet verstopt** in een deep-view-only. Het hoort op **twee niveaus**:
1. **In de cockpit: "Jouw route"** — de read-only fase-ladder (● NU / ○ / ✓) mét één doorway "Bekijk je volledige stappenplan →". Dit is het plan-*als-oriëntatie*.
2. **De deep-view: plan-reader** (`MovementPlanConfigurator`/stappenplan) — het plan-*als-detail*, waar je spoor/doel/fases instelt. Read-only t.o.v. afvinken; de check-off blijft in VANDAAG.

Zo verbind je plan ↔ vandaag zonder dubbele todo's: het plan *toont* de stappen, VANDAAG *is* de enige plek waar je afvinkt (invariant). De route-ladder licht op welke fase NU is — dat is de brug, geen tweede vinklijst.

---

## 7. Context-sidebar — content-matrix

De huidige `buildInspectorCards` (cockpit-inspector.ts) is generiek: vier kaart-types (`why`/`tip`/`meet`/`doel`) uit drie inputs (`activeHabit.done`, `remeasure.daysUntil`, `anchorWhy`). Ze weet **niet** in welke context ze staat (home vs cockpit-vóór vs cockpit-ná vs stappenplan). Dat is de zwakte: dezelfde kaarten op elk scherm.

**Voorstel: geef `buildInspectorCards` een `context`-parameter** en laat de regel de kaartkeuze sturen. WRITING_VOICE: begrip → mechanisme → actie, geen diagnose.

| Context | Kaart-type | Voorbeeld-copy (NL) |
|---|---|---|
| **(a) Kompas / home** | `why` (prioriteit) | *"Beweging staat vandaag bovenaan — dat is waar je nu de meeste winst pakt. Eén sessie telt al mee."* |
| | `meet` (indien <14d) | *"Over ~3 weken zie je je lijn bewegen. Niet elke dag een cijfer — dat is bewust."* |
| **(b) beweging vóór afvinken** | `why` (mechanisme + anker) | *"Opstaan zonder handen traint de beenkracht die na 40 het snelst daalt — precies wat je wilt vasthouden om zelf de trap op te blijven komen."* |
| **(c) beweging ná afvinken** | `tip` (bekrachtiging, geen 2e CTA) | *"Gedaan. Ritme boven perfectie — één moment telt al. Morgen kies je opnieuw."* |
| **(d) stappenplan-view** | `doel` (fase-context) | *"Je staat in fase 1: de basis. Als dit een paar weken staat, opent fase 2 vanzelf — geen haast, wel richting."* |
| **elk (override)** | `warning` (recovery=rust/medisch) | *"Je gaf 'uitgeput' aan. Vandaag licht of rust is verstandig — geen achterstand, wel goed luisteren."* (nooit weg te drukken, altijd bovenaan) |

### Regels
- **Max 2 kaarten.** Één primaire + hooguit één context-kaart. Nooit een muur.
- **Prioriteit:** `warning` > `why` (default) > `tip`/`doel` > `meet`. De hoogste wint de bovenste plek.
- **Wanneer leeg → verbergen**, niet vullen. Beter een lege/verborgen zone dan filler-copy. (Op mobiel: bottom-sheet blijft dicht.)
- **Persistent vs drawer:** ≥`xl` persistent 330px; onder `xl` een drawer/bottom-sheet (al gebouwd in `CockpitFrame`). Op tablet standaard dicht.

### Wat hoort NÍET in de sidebar
- **De check-off** — leeft uitsluitend in de hero (invariant).
- **Affiliate/supplement-links** — nooit in het dashboard (CLAUDE.md). Hoogstens een voeding-*hint* die naar een gids linkt, geen shop.
- **Een tweede score of tweede todo-lijst.**
- **Alles wat scroll-om-te-handelen vereist** — de inspector is lezen/context, niet werken.

---

## 8. Layout & full-width — één model

### Root cause (geverifieerd tegen `main`)
Er zijn **twee render-paden** in `Dashboard.tsx`, en "full width lukt niet" komt doordat je het **legacy-pad** ziet (shell-flag uit):

1. **Legacy-pad** (flag `NEXT_PUBLIC_COCKPIT_SHELL_ENABLED` uit, Dashboard.tsx:4221): álles zit in `<main style={{ maxWidth: 600 }}>`. Een 600px-kolom. Blokken die breder willen (de beweeg-cockpit) ontsnappen via `.ps-cockpit-breakout` (globals.css:132) — negatieve marges t.o.v. een `100%`(=600px)-ouder, alléén ≥1024px, `min(80rem, 100vw-3rem)`. Dat is een **hack**: desktop-only, fragiele marge-rekensom, en elk kind dat *niet* opt-in doet blijft 600px → inconsistente breedtes. Op mobiel geen effect.
2. **Shell-pad** (flag aan, Dashboard.tsx:4147): `CockpitFrame` = `max-w-[1600px]` + CSS-grid `[250px_1fr_330px]`, center `min-w-0`. Dit lost het al **goed** op — geen breakout nodig. De center wordt daarbinnen opnieuw gecapt (`max-w-5xl` voor beweging, `max-w-[720px]` anders) — bewust, voor leesbreedte.

**Conclusie:** het breedte-probleem is geen CSS-raadsel maar een **flag-toestand**. De juiste oplossing bestaat al, achter de vlag.

### Aanbevolen grid (één model)
```
Shell (max-w-[1600px], gecentreerd)
├─ PROFIEL   250px   (sticky, md+; onder md → header-strip)
├─ CENTER    minmax(0, 1fr)   (scrollt; per-surface max-leesbreedte:)
│              · home/agenda  → max-w-[720–760px], gecentreerd
│              · domein-cockpit → max-w-5xl (~1024px) — werkstation, geen proza
├─ INSPECTOR 330px   (sticky, xl+; onder xl → drawer/bottom-sheet)
```
Richtlijnen: profiel 240–260px, inspector 320–360px (versmalt eerst), center altijd `min-w-0` (voorkomt grid-overflow). De extra breedte op groot scherm gaat naar witruimte + zijpanelen, niet naar bredere tekstregels.

### Wanneer breakout vs native fluid grid
**Retireer `.ps-cockpit-breakout` zodra de shell default is.** Breakout was de pleister voor de 600px-kolom; met de grid-shell is hij overbodig en schadelijk (twee breedte-systemen naast elkaar = drift). Native fluid grid overal; de center-kolom regelt leesbreedte per surface, niet per opt-in-hack.

> **Aanbeveling:** zet `NEXT_PUBLIC_COCKPIT_SHELL_ENABLED=true` (na dev-verificatie), verwijder het legacy 600px-pad en de breakout-CSS in de wijziging die dat scherm tóch aanraakt (roadmap §5: nooit big-bang, wel bij aanraking). Dit is de kleinste ingreep met de grootste breedte-winst — en het is 90% gebouwd.

---

## 9. Multi-domein contract

Beweging is de referentie. Om slaap/stress/voeding te laten volgen zónder zes tegels te kopiëren, is het contract een **datavorm + rol**, geen componentenkopie. `isReadoutDomain`/`isInterventionDomain` bestaan al (domain-role.ts) — dat is de scheidslijn.

```ts
// Conceptueel — wat élke domein-cockpit van de shell krijgt:
type DomainCockpitInput = {
  domain: PillarId;                 // "beweging" | "slaap" | ...
  role: "intervention" | "readout"; // bepaalt welk contract rendert
  accent: string;                   // domein-kleur (shell levert var(--ac))
  model: DashboardModel;            // GEDEELD: score, trend, activeHabit, ladder
  slot: WeekDaySlot | null;         // GEDEELD: day-model "wat is vandaag"
  remeasure: { daysUntil: number } | null;
  // Domein-specifiek (data + copy, GEEN nieuwe tegels):
  copy: {
    heroMechanism: string;          // "waarom deze stap" (betekenis-motor-input)
    scoreNarrative: string;         // "Waar je staat"-regel
    routePhases: RoutePhase[];      // Jouw route (leeg voor readout)
  };
};
```

**Shell levert (domein-agnostisch):** header, profiel-rail, inspector-zone, drie-zone-grid, score-ring, trend-sparkline, kaart-primitieven (`CockpitTile`, `Sparkline`, `Button`). Deze zijn generiek gegeven `model` + `accent`.

**Domein levert:** de copy (mechanisme, narratief) + route-fases + de check-off-koppeling. Een nieuw interventie-domein = een **config + copy-object**, niet zes handgebouwde tegels.

**Readout-domeinen (energie/herstel) renderen een gereduceerd contract:** géén hero, géén check-off, géén plan — alleen score + "volgt uit je gedrag" + trend. Dat is het **minimale domein-cockpit-contract**: interventie = vol contract (hero + route + check-off), readout = readout-strip. Dit sluit aan op roadmap §5 (6-slot module-blauwdruk) en op de bestaande readout-presentatie.

---

## 10. Roadmap-alignment

### Wat past in de volgende slice (1–2 weken, pre-traffic)
Aligned, want het is **craft op het referentie-domein + leesbaarheid** (roadmap P1: "Dashboard leesbaar" + "freeze OK achter flag"):
- **Full-width fixen** door de shell-flag te flippen + legacy 600px-pad en breakout retireren (§8). Kleinste ingreep, grootste winst, 90% gebouwd.
- **Home-reshape** (Optie A, §3) — dit *ís* doc 4 pr.3 ("prioriteit vs readout vs actie") in cockpit-vorm.
- **Inspector context-parameter** (§7) — deterministisch, ≤2 kaarten, hergebruikt bestaande data.

### Wat is DEFER/FREEZE (roadmap)
- **6-waypoint journey-header** → **niet doen** (gelockt uit: waypoints = Jouw route).
- **Slaap/stress als volwaardige cockpits** → **DEFER** tot ná de klok; roadmap plaatst "slaap als 2e module" in P3 (bewijst de §5-blauwdruk mét verkeer). Het contract (§9) mag je *ontwerpen*, niet uitrollen.
- **Coach/logboek-module** → concept-slot (§5), geen bouw.
- **Nieuwe event-types** → KILL; hergebruik bestaande (`dashboard_vandaag_action_toggled` etc.). Meet de inspector met een bestaand surface-veld, verzin geen `inspector_card_shown` als het niet moet.
- **Nieuwe tabellen** → geen; check-in is de datalaag.

### Risico's als we het verkeerd doen
1. **Het grootste risico: cockpit-craft verwart zich met North-Star-werk.** De roadmap-North-Star is *"start de klok met 20–50 mannen"* (§1). Een prachtige multi-domein-shell bouwen voor N=2 is exact het anti-patroon dat §1 waarschuwt ("eindeloos polijsten zonder cohort"). Deze slice is **alleen** te rechtvaardigen als *"maak de ene referentie-lus leesbaar en niet-kapot zodat de eerste cohort niet bounced"* — begrensd tot beweging + shell + home + full-width. Alles multi-domein wacht op de klok.
2. **Dashboard.tsx herbouwen** i.p.v. organisch uitsplitsen (verboden, §1 principe 4). De home-reshape is een *herschikking*, geen rewrite.
3. **Een tweede check-off of tweede score** introduceren via home/inspector (breekt invariant). De inspector leest, de hero werkt.
4. **Twee breedte-systemen** (shell-grid + breakout) laten co-existeren → drift. Retireer breakout in dezelfde slice.

---

## 11. Implementatie-slices voor Cursor (high-level, geen code)

| # | Doel | Geraakte bestanden (paden) | Acceptatie (1 zin) |
|---|---|---|---|
| **1** | Shell wordt de container; legacy 600px + breakout eruit | `src/lib/feature-flags.ts` (of env), `src/components/dashboard/Dashboard.tsx` (legacy-tak weg), `src/app/globals.css` (`.ps-cockpit-breakout` retireren), `src/components/dashboard/cockpit/CockpitFrame.tsx` | Dashboard rendert in de drie-zone-shell op 1280px zonder 600px-kolom; beweging-center vult tot `max-w-5xl`; mobiel 1-koloms met bottom-sheet inspector. |
| **2** | App-home = Kompas als oriëntatie (Optie A) | `src/components/dashboard/Dashboard.tsx` (`KompasHome`), evt. `src/components/dashboard/home/*` | Home leidt met groet + één VANDAAG-hero + Future-You-regel; domeinen als compacte scanstrip (Prioriteit uitgelicht, Rapport gedimd); één forward-pointer. |
| **3** | Inspector reageert per context | `src/lib/cockpit-inspector.ts` (`context`-param), `src/components/dashboard/Dashboard.tsx` (context doorgeven), `src/lib/__tests__/cockpit-inspector.test.ts` | Home / beweging-vóór / beweging-ná / stappenplan geven elk de juiste ≤2 kaarten; `warning` wint; leeg = verborgen. |
| **4** | Beweging-cockpit herschalen (§6) | `src/components/dashboard/beweging/MovementCockpit.tsx` | Center = hero + één "waar je staat"-readout-rij + Jouw route; "Deze week" + meetmoment verhuizen naar de inspector-zone. |
| **5** (DEFER) | Logo→app-home + multi-domein-contract extractie | `src/components/dashboard/cockpit/CockpitHeader.tsx`, `src/lib/domain-role.ts`, nieuw `DomainCockpitInput`-type | Wordmark linkt ingelogd naar Kompas-home; beweging rendert via het contract; readout-domein = gereduceerde variant. **Gate: pas ná de klok / als 2e-module-proof.** |

---

## 12. Open vragen aan Dennis

1. ~~**Kompas vs Mijn Dag — rol-split.**~~ **BESLIST (23 jul):** één **Vandaag-home** (oriëntatie + het ene ding + review) + een **aparte Agenda**-surface (coaching-native, lean nu, diepte DEFER). Nav = `Vandaag · Agenda · Voortgang · Hermeting`. De reis leeft read-only in Jouw route/Voortgang, niet in de nav. Zie §3 "Besloten (23 jul, iteratie)". *Rest-vraag: label — "Vandaag" of "Kompas" voor de home, en "Agenda" of "Mijn Week" voor de planning-tab? (cosmetisch, niet blokkerend).*
2. **Flag-flip: nu of ná de klok?** Mag `NEXT_PUBLIC_COCKPIT_SHELL_ENABLED=true` de **default** worden vóór de eerste cohort (dan is de shell de baseline die je meet, en verdwijnt het legacy-pad), of wil je eerst het legacy-dashboard meten en de shell als experiment houden? Dit raakt wat je meet én of slice 1 het legacy-pad mag verwijderen.
3. **Logo-uitgang vs content-funnel.** Akkoord dat de Wordmark ingelogd naar de app-home linkt (niet `/`), met de publieke-site-uitgang alleen in het profielmenu? De spanning: `/inzichten` en `/supplementen` zijn óók je funnel/monetisatie — wil je ingelogde gebruikers juist *makkelijk* naar content kunnen sturen, of bewust in de app houden?

---

*Opgesteld 23 juli 2026, verankerd tegen `main` + de drie cockpit-docs + `ROADMAP_DASHBOARD_COCKPIT.md`. Geen code, geen implementatie. Verandert geen enkele DEFER/FREEZE/KILL-status.*
