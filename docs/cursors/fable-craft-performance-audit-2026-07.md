# Verdict — Craft, performance & architectuur-audit dashboard-cockpit (18 juli 2026)

**Type:** Fable kwaliteits-audit (UX-craft · performance · clean code · productkwaliteit). Geen implementatie — brondocument voor bouwprompts.
**Lens:** expliciet de assen die het [`fable-roadmap-vervolg-verdict`](fable-roadmap-vervolg-verdict-2026-07.md) NIET dekt. Dat doc gaat over dáta-model (day-model, TrendPoint) en feature-fasering; dit doc gaat over hoe de app *aanvoelt en gebouwd is*. De twee zijn complementair, niet concurrerend.
**Harde randvoorwaarde (overgenomen, niet heropend):** `Dashboard.tsx` niet big-bang herschrijven — **bevriezen + organisch uitsplitsen** (verdict §4, NIET-NU-lijst §8.8). Alles hieronder respecteert die regel: elke splitsing valt samen met een scherm dat je toch aanraakt.

---

## 0. Verdict in één alinea

De fundering is beter dan de meeste MVP's: server-component route met `Promise.all`, `loading.tsx`-skeleton, URL=state-naad, **0** `onClick`-op-`div` (alles is een echte `<button>`, 217 stuks), en engine-SSOT eronder. Wat het van "goed" naar "top-tier" houdt zijn drie dingen die niets met features te maken hebben: (1) **de default-tab sleept JS mee voor 4 schermen die de gebruiker nog niet opende** — puur bundle-gewicht dat je met `dynamic()` wegneemt, en dat méételtelt als de eerste organische splitsing; (2) **async-acties voelen dood** — logout en hermeting geven nul feedback tot de round-trip klaar is; (3) **twee parallelle stylesystemen** — 111 design tokens + een `@theme`-brug, maar 1.041 inline `style={{}}`-attributen die de tokens omzeilen en subtiele visuele ruis (radius 28 vs 24 vs 11) veroorzaken. Fase 1 is deze drie plus twee dode dependencies opruimen. Alle drie zijn hoog-impact/laag-moeite en breken niets.

---

## 1. Wat al goed is (niet aanraken)

| Signaal | Bewijs | Waarom het telt |
|---|---|---|
| Server-first data-fetch | [`dashboard/page.tsx:110`](../../src/app/dashboard/page.tsx#L110) — `Promise.all([loadAccountDashboardData, hasFeature])` | Eén server-round-trip, geen client-waterfall. |
| Route-skeleton aanwezig | [`dashboard/loading.tsx`](../../src/app/dashboard/loading.tsx) | Geen witte flash bij navigatie. |
| Lazy zwaarste scherm | `VoortgangHub` via `dynamic(..., { ssr: false, loading: skeleton })` ([`Dashboard.tsx:62`](../../src/components/dashboard/Dashboard.tsx#L62)) | Bewijst dat het patroon al in huis is — we breiden het alleen uit. |
| Echte klik-semantiek | **0** `onClick` op `div/span/li` in heel `src/components`; 217 `<button>` | Toetsenbord + screenreader werken out-of-the-box; zeldzaam op dit niveau. |
| URL = state-naad | `tab`/`kompas` in `searchParams` via `replaceState` ([`dashboard-url.ts`](../../src/lib/dashboard-url.ts)) | Deeplinks + back/forward werken al gedeeltelijk. |
| Conditionele tab-render | `sectionTypes.map(renderDashboardSection)` — alleen de actieve tab rendert ([`Dashboard.tsx:3700`](../../src/components/dashboard/Dashboard.tsx#L3700)) | Geen verborgen-tab-renders; het probleem is bundel, niet render. |

Dit is de reden dat de audit "chirurgisch" mag zijn: er is geen fundament-probleem, er is afwerking-schuld.

---

## 2. Concrete bevindingen (geverifieerd in code)

### 2.1 Performance

1. **De default-tab bundelt 4 ongeopende schermen (P0-perf, laag-moeite).** `Dashboard.tsx` importeert statisch `BewegingScreen`, `SleepScreen`, `StressScreen`, `VerbindingScreen`, `AgendaScreen` + `DomainDeepTool` ([`Dashboard.tsx:22-33`](../../src/components/dashboard/Dashboard.tsx#L22-L33)). Alleen `VoortgangHub` is lazy. De schermen renderen al conditioneel per tab — dus ze zijn **ideale `dynamic()`-kandidaten**: de "vandaag"-tab hoeft de JS van beweging/slaap/stress/verbinding/agenda niet te downloaden vóór de gebruiker die tab kiest. Grootste enkele TTI-winst in de hele app, en het ís de organische eerste splitsing die het verdict §4 wil.
2. **Twee dode/dubbele dependencies (P1, triviaal).** `framer-motion` (^12.38) staat in `package.json` maar wordt **nergens** in de repo geïmporteerd (0 hits buiten `node_modules`) → pure install-/lockfile-ballast. En `@upstash/redis` staat naast `ioredis` terwijl het besluit "rate limiting in-memory, bij schaal self-hosted (geen Upstash)" is ([[psf-prod-infra]]); het wordt alleen door [`rate-limit-redis.ts`](../../src/lib/rate-limit-redis.ts) aangeraakt. Beide reconciliëren. (`recharts` is oké: alleen in `/admin/*`, niet in de consumer-bundle — het dashboard gebruikt een eigen `Sparkline`-primitive.)
3. **`0` `useCallback` bij 37 in-file componenten (P2, cosmetisch tenzij P1 landt).** Handlers worden elke render opnieuw gemaakt. Nu onschadelijk (weinig gememoïseerde kinderen), maar zodra de schermen `dynamic()`+`memo` worden (P1) willen hun props stabiel zijn. Los dit pas op sámen met P1.

### 2.2 Async-acties voelen dood (P0-UX, laag-moeite)

- **Logout geeft nul feedback.** `onLogout = async () => { await fetch(...); router.push(...) }` ([`Dashboard.tsx:3633`](../../src/components/dashboard/Dashboard.tsx#L3633)) hangt aan een kale icoon-knop ([`:192`](../../src/components/dashboard/Dashboard.tsx#L192)) zonder `disabled`/spinner. Tik → schijnbaar niets → 300-800ms later spring je weg. Op een trage 4G-verbinding (je doelgroep, mobiel) leest dat als "kapot".
- **Hermeting is een harde full-reload.** `onRemeasure = () => window.location.assign("/api/account/remeasure/start")` ([`:3645`](../../src/components/dashboard/Dashboard.tsx#L3645)) — witte flash, geen tussenstand. De knop "Doe je hermeting nu" ([`:1486`](../../src/components/dashboard/Dashboard.tsx#L1486)) zou minstens naar een pending-state moeten.
- Er is al een goed patroon in huis (`ActiveHabitCard` heeft `busy`-state, [`:324`](../../src/components/dashboard/Dashboard.tsx#L324)) — het is niet systematisch toegepast. **Slechts 1 `disabled=` in het hele bestand.**

### 2.3 Twee parallelle stylesystemen (P1-craft, mid-moeite, incrementeel)

- **1.041 inline `style={{}}`-attributen over 94 bestanden** (255 alleen in `Dashboard.tsx`) — terwijl er **111 CSS custom properties** + een `@theme inline`-brug naar Tailwind-tokens bestaan ([`globals.css:60`](../../src/app/globals.css#L60)). CLAUDE.md verbiedt inline styles expliciet ("Tailwind classes in JSX, geen inline styles"); de code doet structureel het tegenovergestelde.
- Gevolg is niet "lelijk" maar **inconsistent**: `borderRadius: 28` (card in loading), `24` (VoortgangHub-skeleton), `11` (header-knop) — dezelfde rol, drie waarden, want elke plek hardcodeert los i.p.v. één token. Dat is precies het detail dat "amateuristisch vs. Apple" scheidt.
- Big-bang omzetten van 1.041 attributen is onverantwoord (hoog risico, breekt visueel). De juiste zet: **kapsel de herhaalde patronen in 2-3 primitives** (`<Panel>`, `<Card>`, `<StatTile>`) die de tokens binden, en migreer per scherm dat je tóch aanraakt (zelfde organische regel als de splitsing). Nieuwe code hardcodeert dan niet opnieuw.

### 2.4 Dashboard.tsx als bestand (P1-architectuur, valt samen met P1-perf)

- 3.758 regels, **37 componenten in één bestand** ([`Dashboard.tsx`](../../src/components/dashboard/Dashboard.tsx), van `DashHeader` t/m `DashTabBar`). Dit is geen render-monoliet (de tabs renderen conditioneel) maar een **bestand-organisatie-monoliet**: elke nieuwe developer moet 117KB scrollen, en fijnmazige code-splitting is onmogelijk zolang alles in één module zit.
- De sectie-dispatch (`renderDashboardSection`) is een net patroon — het probleem is puur dat de 37 secties/schermen fysiek in één `"use client"`-bestand wonen. Uitsplitsen naar `src/components/dashboard/sections/*` is laag-risico (pure move) en levert de code-splitting-grens die P1 nodig heeft.

---

## 3. FASE-PLAN (impact × moeite)

Gekoppeld aan de bestaande verdict-fasering (A/B/C) zodat ze niet botsen. Deze audit voegt een **craft-spoor** toe dat parallel loopt aan het feature-spoor.

### Fase 1 — Nu verbeteren (hoog impact, laag-mid moeite, breekt niets)

| # | Brok | Impact | Moeite | Meetpunt |
|---|---|---|---|---|
| **C1** | **Lazy-load de 5 tab-schermen** via `dynamic()` + per-scherm-skeleton (ze zijn al tab-gated). Eerste organische splitsing. | Hoog (TTI vandaag-tab) | Laag | Bestaand `dashboard_tab_selected`; Lighthouse TBT vandaag-tab vóór/ná. |
| **C2** | **Pending-states systematisch**: gedeelde `Button loading`-prop; toepassen op logout, hermeting, elke fetch-knop. Hermeting: pending vóór de `location.assign`. | Hoog (premium-gevoel, mobiel) | Laag | Geen nieuw event; kwalitatief (Clarity rage-clicks op logout ↓). |
| **C3** | **Dode deps prunen**: `framer-motion` weg; `@upstash/redis` vs in-memory-besluit reconciliëren. Lockfile met `npx npm@10.8.2 install`. | Mid (hygiëne, install-tijd) | Triviaal | `npm ls` schoon; server `npm ci` blijft groen. |
| **C4** | **Micro-interactie-basis**: `hover`/`active`/`focus-visible` in de gedeelde `<Button>`/`<Card>`-primitive i.p.v. ad-hoc (nu 5 transitions in 3.758 r.). Eén plek, geen animatie-bibliotheek. | Mid (voelt "levend") | Laag-mid | Kwalitatief. |

**Waarom eerst:** C1 is de grootste enkele snelheidswinst én de eerste stap van de door het verdict gewenste splitsing — twee vliegen. C2 is de goedkoopste "premium"-upgrade die er is. C3/C4 zijn opruim-hygiëne die de rest sneller maakt.

### Fase 2 — Product versterken (fundering voor multi-domein)

| # | Brok | Afhankelijkheid | Meetpunt |
|---|---|---|---|
| **C5** | **Secties uitsplitsen** naar `dashboard/sections/*` (pure move, per scherm dat je aanraakt). Maakt C1 fijnmaziger + verlaagt cognitive load. | Organisch, na C1 | Geen; codereview-snelheid. |
| **C6** | **Design-token-primitives** (`<Panel>`/`<Card>`/`<StatTile>`) die de tokens binden; inline styles per aangeraakt scherm migreren. | Na C4 (primitive-laag bestaat) | Aantal inline `style={{}}` daalt meetbaar per scherm. |
| **C7** | **Per-tab skeletons** die de echte layout spiegelen (nu 1 generieke). Elke `dynamic()`-tab krijgt zijn eigen loading-shape → 0 layout-shift. | Na C1 | CLS/perceived-speed. |
| **C8** | **Optimistic UI** op habit-/check-completie (breid `ActiveHabitCard.busy` uit naar optimistic + rollback). | Onafhankelijk | Voltooiings-latency-perceptie. |

### Fase 3 — Toekomstvisie (schaalbare + AI-klare fundering)

| # | Brok | Rationale |
|---|---|---|
| **C9** | **Model-boundary hard houden.** De day-model-unificatie (verdict A3) ís óók de clean-architecture-zet: business logic uit UI. Steun het als de architectuur-fundering, niet alleen als data-fix. | Multi-domein + AI consumeren straks het `DashboardModel` + `domain_events`, nooit UI-state. |
| **C10** | **AI-personalisatie op de bestaande naad.** Geen nieuwe infra: engine-SSOT + gestructureerde `domain_events` zijn de contract-laag. Toekomstige AI-suggesties (agenda-hints, recovery→plan) hangen aan het model, niet aan componenten. | Voorkomt dat AI-features UI-gekoppeld raken en later onverplaatsbaar zijn. |
| **C11** | **CI-poort tegen stijl-regressie.** Zodra C6 een primitive-laag heeft: lint-regel die nieuwe inline `style={{}}` in `dashboard/*` blokkeert (behalve dynamisch-berekende waarden). Handhaaft de CLAUDE.md-regel automatisch. | Schuld keert niet terug; nieuwe developers krijgen de regel afgedwongen i.p.v. gedocumenteerd. |

---

## 4. Productkwaliteit — "wat scheidt goed van uitzonderlijk"

Kleine dingen, grote perceptuele impact (allemaal in Fase 1/2):

1. **Logout die reageert** (C2) — nu de duidelijkste "voelt kapot"-plek.
2. **Geen full-reload op hermeting** (C2) — witte flash → soepele transitie.
3. **Consistente radii/spacing** (C6) — de 28/24/11-ruis wegnemen leest onbewust als "gebouwd door één hand".
4. **`focus-visible`-ringen** (C4) — toetsenbord-gebruikers en screenshot-reviewers zien direct kwaliteit; nu grotendeels afwezig ondanks correcte `<button>`-semantiek.
5. **Skeletons die de echte vorm spiegelen** (C7) — het verschil tussen "laadt" en "is er al bijna".

## 5. NIET-NU-LIJST (om scope te bewaken)

1. **`Dashboard.tsx` big-bang herschrijven** — verboden (verdict §8.8). Alleen organisch uitsplitsen (C5).
2. **Animatie-bibliotheek toevoegen** — `framer-motion` gaat er juist uit (C3); micro-interacties via CSS/tokens (C4).
3. **State-manager (Redux/Zustand) introduceren** — 14 `useState` in de root is prima; het probleem is bundel en styling, niet state-architectuur.
4. **Design-system-refactor als los project** — geen big-bang token-migratie; alleen per aangeraakt scherm (C6).
5. **Nieuwe events** — deze audit is puur craft/perf; `dashboard_tab_selected` en Clarity dekken het meten. Geen nieuwe event-types.

---

**Eerstvolgende brok: C1 — de 5 tab-schermen naar `dynamic()` met per-scherm-skeleton.** Het is de grootste snelheidswinst, de eerste door-het-verdict-gewenste splitsing, en volledig omkeerbaar. Bewijs dat het werkt: Lighthouse TBT/JS-payload van de vandaag-tab vóór/ná, afgelezen zonder dat één feature verandert.
