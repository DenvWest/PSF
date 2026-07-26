# Ship-gate — Kompas-home coherentie (26 jul 2026)

> **Status: alle 8 stappen klaar, klaar-check groen.** SSOT-volgorde voor branch `s0-s1-stappenplan-ontdichten`. Werk = ship-gate **coherentie** (naden dichten, geen dead-ends, tracking compleet) — NIET beweging-diepte, NIET nieuwe features.
> Freeze in acht genomen: [`ROADMAP_DASHBOARD_COCKPIT.md`](../core/ROADMAP_DASHBOARD_COCKPIT.md) P3 (geen MovementCockpit/waypoints/S2-S4/agenda-diepte). IA-referentie: [`ANALYSE_DASHBOARD_HOME_EN_COCKPIT_IA.md`](ANALYSE_DASHBOARD_HOME_EN_COCKPIT_IA.md) — 4 tabs: Kompas · Mijn Dag · Voortgang · Hermeting.
>
> **Scope-noot voor review**: de branch bevat naast dit ship-gate-werk ook ander, parallel lopend werk (o.a. `cycleEvidence`, agenda-weekstrip-uitbreidingen) dat niet door deze pas is gebouwd of geverifieerd. Dit document dekt alleen de coherentie-stappen hieronder; het brede diffoverzicht bij Stap 8 laat zien welke bestanden wél/niet uit deze pas komen.

## Gaps (geverifieerd 25 jul, bevestigd 26 jul tegen code)

1. Rail hermeting-knop (`CockpitContextRail.tsx`) + inspector meet-kaart (`CockpitInspector.tsx`) delen dezelfde `remeasureAction.onClick` — geen `trackEvent`.
2. Compliance-disclaimer (`dashboardInfoCard` in `Dashboard.tsx`) leeft alleen in het Context-paneel (`inspectorExtra`) — niet altijd zichtbaar, zeker niet op mobiel zonder Context-tap.
3. `kompas-domain-actions.ts`: stress/verbinding hebben geen post-check-state (in tegenstelling tot slaap-patroon).
4. Empty-state `onCheck` routeert naar `/intake` zonder `from=dashboard` — return-pad breekt.
5. VerbindingScreen is dun — risico op dead-end.
6. Mobiel 375px: linker rail is verborgen (rail is `md:flex` only); hermeting alleen bereikbaar via home Voortgang-sectie.

## Stappen (elk stopt voor review)

| # | Onderdeel | Status |
|---|---|---|
| 1 | Eigen schuld: trackEvent+clarityTag op rail/inspector hermeting-klik; altijd-zichtbare disclaimer | ✅ klaar |
| 2 | Check→home naad: stress/verbinding post-check labels + tests | ✅ klaar |
| 3 | URL + dead-end audit: `from=dashboard`, empty onCheck, 5 domeinen open→terug | ✅ klaar |
| 4 | First-run empty states op 4 tabs | ✅ klaar |
| 5 | Mobiel 375px audit + fixes | ✅ klaar |
| 6 | Tab-coherentie (Mijn Dag/Voortgang/Hermeting) | ✅ klaar |
| 7 | Domein-entry polish (Verbinding dead-end dicht) | ✅ klaar |
| 8 | Klaar-check (console.log/tsc/vitest/lint) + afronden | ✅ klaar |

## Stap 3 — auditbevindingen (26 jul)

- **Gefixt**: `onCheck` in `Dashboard.tsx` (empty-dashboard CTA) ging naar `/intake` zonder `from=dashboard` en zonder event — bij exit uit de intake landde je op de marketing-homepage (`IntakeExit.tsx` valt terug op `siteHref="/"` zonder `from=dashboard`). Nu: `router.push("/intake?from=dashboard")` + `emitIntakeClientEvent("dashboard.first_checkin_started", ...)`, zelfde patroon als de bestaande `onDashboardCheckin`.
- **Gecontroleerd, geen actie nodig**: alle overige `/intake*`-hrefs vanuit domeinschermen (slaap/stress/beweging/voeding) hebben al `from=dashboard&kompas=<domein>`. Twee generieke hrefs (`KompasOndersteuningTile.tsx`, `Dashboard.tsx` "Jouw aanraders") missen bewust `kompas=` — ze zijn niet vanuit een specifiek domeinscherm geopend, en `IntakeExit`'s pathname-fallback (`/intake/voeding` → "voeding") dekt de terugknop al zonder de query-param.
- **Gecontroleerd, geen actie nodig**: "5 domeinen open→terug" loopt via één gedeeld mechanisme (`openDomain`/`handleDomainBack` in `Dashboard.tsx` + `DomainTopNav`/`CockpitContextRail`'s Kompas-knop) — domein-agnostisch, werkt al voor alle 7 pillars inclusief readouts (energie/herstel via `DomainSoonScreen`) en zowel desktop als mobiel (`hideDomainTopNav` is alleen actief als de desktop-rail al een Kompas-knop toont). Geen per-domein dead-end gevonden.
- **Verbinding**: exit/terug-nav loopt via hetzelfde gedeelde mechanisme — al werkend, geen feature-diepte toegevoegd (blijft binnen de KILL van roadmap §3).

## Stap 4 — auditbevindingen (26 jul)

- **Gefixt**: Hermeting-tab `emptyHint` ("Over 30 dagen meet je opnieuw...") suggereerde een lopende klok terwijl er nog geen check is gedaan — brak met het "Doe je eerste check — dan..."-patroon van de andere 3 tabs. Nu: "Doe eerst je check — daarna meten we na 30 dagen opnieuw of je leefstijl-stappen werken." (`src/data/dashboard/index.ts`).
- **Gecontroleerd, geen actie nodig — "Kompas-tab i.p.v. null render"**: de `if (!currentModel) return null` in `KompasHome` (Dashboard.tsx:2954) is onbereikbaar in de empty-flow — `sectionsNode`'s top-level check (`empty && tab !== "voortgang"`) toont voor tab "vandaag" altijd al de generieke `EmptyTabState` (icoon, titel, hint, "Doe je eerste check"-knop) vóórdat `KompasHome` ooit gerenderd wordt. Geen null-render-pad gevonden.
- **Gecontroleerd, geen actie nodig — Voortgang**: gebruikt bewust géén `EmptyTabState` maar een eigen "locked" `VitalityScoreCard` (`getVitalityScoreHeading`/`Body` in `vitality-score-copy.ts`) — sterkere hook-copy ("Weet precies waar je staat.") dan de generieke kaart, CTA "Doe de check" consistent met de rest. De `emptyHint`-string in `DASHBOARD_TABS` voor "voortgang" is hierdoor ongebruikte dode tekst (nooit gerenderd) — laten staan, geen risico.
- **Verklaring eerste landing**: een leeg account start standaard op tab "voortgang" (niet "vandaag") — `Dashboard.tsx`: `initialTab ?? (empty ? "voortgang" : "vandaag")`. Dat is de bewust rijkere hook-empty-state; Kompas-tab is nog steeds correct als je er handmatig naartoe navigeert.

## Stap 5 — 375px-audit (26 jul, echte browser-verificatie)

Getest met headless Chromium (Playwright) op de live dev-server, geauthenticeerd met een echte sessie-cookie (door Dennis aangeleverd), viewport 375×812. Geen visuele fixes nodig — audit bevestigt dat de bestaande responsive opzet + de Stap 1-disclaimer al kloppen op mobiel:

- **Disclaimer**: op alle 4 tabs zichtbaar direct bij laden, geen scroll of Context-tap nodig (bevestigt Stap 1).
- **Kompas-tab**: ring + domeinmeters (Slaap/Beweging/Voeding/Stress/Verbinding) + "Vandaag"-rij met de Stap 2-labels ("Bekijk je verbinding", "Doe stresscheck") + Voortgang-paneel + Logboek — alles leesbaar, geen horizontale overflow, geen afgekapte tekst.
- **Bottom nav**: alle 4 tabs (Kompas/Mijn Dag/Voortgang/Hermeting) altijd zichtbaar en aanklikbaar.
- **Hermeting bereikbaar op mobiel**: twee paden bevestigd — direct via de bottom-nav-tab, én via het context-bell-icoon → bottom-sheet ("Context bij vandaag") met de "meet"-kaart en "Zo werkt je hermeting →"-link. De linker rail is inderdaad verborgen (`md:hidden`), maar dat is geen dead-end: beide vervangende paden werken.
- **Mijn Dag / Voortgang / Hermeting tabs**: agenda-timeline, vitaliteitsgauge en hermeting-kaart renderen allemaal correct op 375px, knoppen wrappen netjes (bv. "Zet me op de wachtlijst voor Premium" op 2 regels), geen overlap.
- **document.documentElement.scrollWidth === clientWidth** op alle 4 routes → bevestigd geen horizontale overflow.
- **Console**: geen errors op geen van de 4 tabs.
- Eén onschuldige bijvangst: een klein zwart rondje met "N" linksonder in sommige screenshots — dat is de ingebouwde Next.js dev-mode-indicator (alleen zichtbaar in `next dev`, niet in productie), geen product-issue.

## Stap 6 — tab-coherentie (26 jul)

- **Gefixt — Hermeting due/empty-copy inconsistent**: de "niet-due" secundaire actie in zowel `CockpitInspector.tsx` ("meet"-kaart) als `CockpitContextRail.tsx` (rail-knop) triggerde exact dezelfde `onRemeasure()` (→ `/api/account/remeasure/start`, direct redirect naar `/intake?hermeting=1`, geen tussenpagina) maar met misleidend label: inspector zei **"Zo werkt je hermeting →"** (klinkt als uitleg/info-link) en de rail zei **"Nieuwe check maken"** (ander vocabulaire dan "hermeting" overal elders). Er bestaat geen uitleg-pagina om naar te linken (`/hoe-werkt-dashboard` noemt hermeting niet). Beide labels nu consistent en eerlijk over wat de klik doet: **"Alvast je hermeting doen"**. Geen wijziging aan de intake-route zelf (buiten scope).
- **Gecontroleerd, geen actie nodig — Mijn Dag SoonPills**: volledige grep door `agenda/*.tsx` + `AgendaScreen.tsx` levert geen enkele `SoonPill`/"Binnenkort"-treffer op — geen dead-ends aanwezig. (Historische SoonPill-modaliteiten uit de roadmap-notitie zijn kennelijk al opgeruimd.)
- **Gecontroleerd, geen actie nodig — Voortgang 1-meting state**: `LeefstijllijnSection`/`Sparkline`/`DeltaBadge` hebben expliciete `hasTrend`/`empty`-guards (dashed placeholder-lijn resp. "–") voor <2 metingen, met eigen vitest-dekking (`leefstijllijn.test.ts`: "returns null delta when fewer than two points"). Bovendien: het test-account uit de Stap 5-screenshots heeft zelf maar 1 check ("1 check · trends met Premium") en rendert daar al zichtbaar correct — live bevestigd, niet alleen in code.

## Stap 7 — Verbinding domein-entry (26 jul, echte browser-verificatie)

Opnieuw met een live headless-sessie getest (`/dashboard?tab=vandaag&kompas=verbinding`, 390×844): definitief bevestigd geen dead-end, geen code-wijziging nodig.

- **Navigatie**: "Kompas"-terugknop in de domain-topnav werkt — klik navigeert naar `/dashboard?tab=vandaag`, geen console-errors, geen overflow. Zelfde gedeelde mechanisme als de andere 4 domeinen (Stap 3).
- **SoonPills niet de enige CTA**: het scherm heeft 3 échte werkende CTA's rond de "Daarna verdiepen"-sectie — "Start leefstijlcheck (1 min)", "Bekijk leefstijl & inzichten →" en "Meer over begeleiding →". De twee "Binnenkort"-kaarten ("Verdiep je in je patroon", "Zie je sociale ritme") zijn duidelijk gelabeld als toekomstig in hun eigen kaarttekst, staan onder een sectiekop mét `Binnenkort`-pill, en zijn dus geen silent-dead-end — klikken erop triggert alleen interesse-tracking (geen crash, geverifieerd live), de omliggende échte CTA's houden de gebruiker nooit vast. Geen "feature-diepte" toegevoegd — blijft binnen de roadmap-KILL op een eigen verbinding-module.
- Kleine cosmetische kanttekening (geen fix): de laatste kaart "Jouw eerstvolgende stap" wrapt op 390px naar 3 regels door de icoon+pill ernaast — blijft leesbaar, geen actie ondernomen (buiten scope van "dead-end", hoort eerder bij algemene copy-polish).

## Bewust NIET gedaan (documenteren, niet oplossen)

- **Beweging-supplementen na `nutritionLogCompleted`**: geen post-check state toegevoegd — buiten scope van deze ship-gate-pas (zie Stap 2). Reden: geen bestaand model-veld dat dit zonder nieuwe state zuiver dekt; apart besluit nodig, geen ship-gate-blocker.

## Constraints (uit opdracht)

- Geen wijzigingen aan intake-flow-logica, `scoring.ts`, `affiliate-links.ts`, `deploy.sh`, `.env.local`.
- Geen MovementCockpit, waypoints, stappenplan-diepte, agenda week/swap.
- Geen nieuwe domain_event-types — hergebruik bestaande + GA4 surface-params.
- Minimale diff — geen refactor van `Dashboard.tsx` tenzij noodzakelijk voor de stap.
- Geen git commit/push/deploy — Dennis beslist merge.

## Stap 8 — klaar-check (26 jul)

- `grep -rn "console.log" src/` → leeg.
- `npx tsc --noEmit` → groen (dekt ook affiliate-slug-mismatches; niet geraakt deze pas).
- `npx vitest run` → 165/165 bestanden, 1426/1426 tests groen.
- `npx eslint --max-warnings 0 src/` → groen.
- Affiliate-/SEO-checks uit de klaar-check-skill niet van toepassing: geen wijziging aan producten/affiliate-links of nieuwe/gewijzigde marketingpagina's deze pas.
- **Diff-scope**: `git status` toont 25 gewijzigde bestanden op de branch. Bestanden die uit déze ship-gate-pas komen: `CockpitContextRail.tsx`, `CockpitFrame.tsx`, `CockpitHeader.tsx`, `CockpitInspector.tsx`, `Dashboard.tsx` (gedeeltelijk — onRemeasure/onCheck/remeasureAction-secties), `kompas-domain-actions.ts` + test, `data/dashboard/index.ts`, `account-dashboard.ts`/`dashboard-dev-data.ts`/`types/dashboard.ts` (het `hasStressCheckin`-veld), `inzichten-visitor-context.test.ts` (fixture-update), `KompasHomeCard.tsx`/`KompasVandaagPanel.tsx` (de `hasStressCheckin`-prop-doorgifte). De overige bestanden in de diff (o.a. `agenda/AgendaWeekStrip.tsx`, `agenda/AgendaTimeBucketPicker.tsx`, `dashboard-url.ts`, `daily-action-log.ts`, `ga4.ts`, `kompas-home.ts`, `rapport/[sid]/page.tsx`, `api/account/daily-log/route.ts`) komen uit ander, parallel werk op dezelfde branch — niet gebouwd of inhoudelijk geverifieerd door deze ship-gate-pas.
- Geen git commit/push/deploy uitgevoerd — Dennis beslist.

## Acceptatiecriterium

- [x] Rail + inspector hermeting-klik getrackt met surface-param
- [x] Disclaimer zichtbaar op 375px zonder Context-tap
- [x] Stress + verbinding post-check labels kloppen in Vandaag-panel
- [x] Empty first check behoudt from=dashboard return-pad
- [x] 5 domeinen: open → terug zonder dead-end
- [x] 4 tabs coherent op desktop + 375px
- [x] klaar-check groen
- [ ] Branch klaar voor merge (Dennis beslist merge/deploy — let op scope-noot hierboven)
