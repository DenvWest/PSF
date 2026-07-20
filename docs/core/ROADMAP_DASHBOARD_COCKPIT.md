# ROADMAP — Dashboard-Cockpit (definitieve strategische SSOT)

> **Layer 1 — Core. Bron van waarheid voor het Dashboard-Cockpit.**
> Vanaf 20 juli 2026 leidend. Elk nieuw gesprek / elke ontwikkelsessie start hier: waar het product naartoe gaat, waarom, welke prioriteiten leiden, wat bewust níét gebeurt, en wat de eerstvolgende stap is. Geen nieuwe brainstorm — dit consolideert wat al besloten is.

## Herkomst (de vier bronnen, samengevoegd)

| # | Titel | Waar | Rol |
|---|---|---|---|
| **1** | Verdict — Roadmap vervolg dashboard-cockpit: fasering (18 jul, avond) | [`cursors/fable-roadmap-vervolg-verdict-2026-07.md`](../cursors/fable-roadmap-vervolg-verdict-2026-07.md) | Data-model + feature-fasering (A/B/C) |
| **2** | Craft/performance/architectuur-audit dashboard-cockpit (18 jul) | [`cursors/fable-craft-performance-audit-2026-07.md`](../cursors/fable-craft-performance-audit-2026-07.md) | Hoe de app aanvoelt en gebouwd is (C1–C11) |
| **3** | Wat nu écht goed is (dit is je moat — bescherm het) | chat-vastgelegd, hier ingebed (§6 + §3-spanning + P0–P3) | Moat + pre-traffic-reframe + prioriteitsladder |
| **4** | 19 juli misverstaan — cognitieve load — duidelijk pad krijgen | chat-vastgelegd, hier ingebed (§7 + 3 pre-traffic-prioriteiten) | Wat "wachten op traffic" wél/niet betekent |

Docs 1 en 2 staan als bestand in de repo; docs 3 en 4 waren gespreksinhoud en zijn hier verankerd zodat de SSOT compleet is. Onderliggende, niet-heropende besluiten: [`fable-agenda-checkin-verdict`](../cursors/fable-agenda-checkin-verdict-2026-07.md), [`fable-bewegingsanalyse-leefstijllijn-verdict`](../cursors/fable-bewegingsanalyse-leefstijllijn-verdict-2026-07.md), [`fable-beweging-gedaan-log-verdict`](../cursors/fable-beweging-gedaan-log-verdict-2026-07.md).

---

## 1. Executive Summary

**De visie.** Het Dashboard-Cockpit is de vertrouwde retentie- en personalisatielaag *boven* affiliate. De Leefstijlcheck is top-of-funnel; de leading-indicator-lus (check-in → analyse → plan → gedaan → hermeting) is retentie; premium is longitudinale diepte. De affiliate-links blijven de monetisatie; het dashboard is de reden dat mensen terugkomen.

**Het probleem dat het oplost.** Mannen 40+ krijgen generiek advies zonder te weten waar ze staan of wat werkt. Wellness-apps mengen meten, advies en uitvoering door elkaar en glijden in medische claims. Dit product houdt de lagen strikt gescheiden (*analyse = waar sta ik · plan = wat kan ik · agenda = wanneer · evidence = wat deed ik*), meet eerlijk, en claimt niets medisch.

**Waarom het onderscheidend is (de moat).** Een echte scoring-engine (6 domeinen, urgentie, profiellabels) mét onderbouwing en een evidence-audit-cultuur — "de Consumentenbond van supplementen" concreet gemaakt. Vier niet-overlappende laag-contracten. De *discipline zelf* als asset (één scoringswaarheid, geen live gemeten, geen scores in reminders, DEFER elk extern kanaal). Compliance/data-architectuur die klopt (RLS deny-all, service-role-scheiding, geen PII in analytics). Een technisch fundament zonder fundament-schuld. Dit is niet in een weekend na te bouwen.

**Principes die onaantastbaar blijven.**
1. Eén scoringswaarheid — gedrag/minuten worden **nooit** een tweede score (evidence náást de score, niet erin).
2. Uitkomsten + de leading-indicator-lus **gratis**; verdieping/longitudinaal **betaald**.
3. Geen PII in GA4/Clarity; geen scores/domeinen in externe kanalen (art. 9); elk extern kanaal achter de register/DPA/DPIA-poort.
4. `Dashboard.tsx` **bevriezen**, niet herbouwen — organisch uitsplitsen per aangeraakt scherm.
5. Meten meebouwen in dezelfde wijziging; bestaande event-types hergebruiken.

**De eerlijke kern-spanning (het waarom van deze roadmap).** Er is een uitstekend "meten-vóór-schaal"-kader gebouwd, maar er is nog niets om te meten (prod N=2). Het risico is niet een ontbrekende feature — het is eindeloos polijsten van half-live oppervlakken zónder ooit één cohort de lus te laten lopen. Geen enkel bronoordeel zei tot nu toe: *"zet dit voor 20 mannen van 45 neer en start de klok."* Deze roadmap is daar de correctie op: **één lus kogelvrij → de klok starten → zien of het domein-cijfer beweegt.** De visie is de beloning daarna, niet het werk van de komende ~6 weken.

---

## 2. Definitieve Productvisie

**North Star.** Het percentage accounts waarbij het domein-cijfer meetbaar beweegt tussen check-in en hermeting (`remeasure.invited → remeasure.completed`, met een eerlijke delta). Dat is tegelijk het bewijs dat de lus werkt én de kern van de belofte.

**Lange termijn (12–24 maanden).** De check als vertrouwde instap → de lus als retentiemotor → premium als longitudinale diepte (30-dagen-weekrapporten, langere historie, export, later begeleiding). Multi-domein groeit uit één herbruikbaar module-contract (§5-blauwdruk uit de verdict): beweging is de referentie-implementatie, slaap/stress/voeding volgen als shells, energie/herstel blijven readout. AI komt daarná en personaliseert op het `DashboardModel` + `domain_events` — **nooit** op UI-state (daarom is de model-grens de architectuur-fundering, niet cosmetica).

**Kernfilosofie.** Meten vóór je groot bouwt — maar meten vereist verkeer, en verkeer vereist een lus die converteert en begrijpelijk is. Discipline die feature-bloat weert, mag geen excuus worden om nooit een echte gebruiker binnen te laten. Eerst de basis kogelvrij op wat er al is, dan beperkt verkeer, dan meten, dan gericht bouwen.

**Bewust NIET gemaakte keuzes (op deze horizon).**
- Geen tweede scoringswaarheid (minuten→score) — verankerd verbod.
- Geen big-bang herbouw van `Dashboard.tsx` of de navigatie.
- Geen extern kanaal (Google-sync, push, ICS, wearable) vóór een concrete lus + privacy-poort.
- Geen agenda-diepte (week/swap/prefs) vóór een retentie-signaal uit echt verkeer.
- Geen Stripe/betaalmuur vóór een prijsband-signaal uit de waitlist.
- Geen state-manager, geen animatiebibliotheek, geen design-system-refactor als los project.

**Hoe de vier bronnen elkaar versterken.** Doc 1 levert het *wat en wanneer* (data-model + feature-fasering). Doc 2 levert het *hoe het aanvoelt en gebouwd is* (craft/perf/architectuur) — complementair, niet concurrerend. Doc 3 levert de *waarom-nu* (de moat + de pre-traffic-reframe die de andere twee een doel geeft). Doc 4 corrigeert het *misverstand* dat "wachten op traffic" = "niets verbeteren". Samen: doc 3 stelt het doel (één lus bewijzen), doc 4 borgt dat de weg ernaartoe begrijpelijk is, doc 1+2 leveren de concrete brokken.

---

## 3. Strategische prioriteiten

Één volgorde, gestuurd door "pre-traffic, één lus bewijzen". De feature-brokken (A/B/C uit doc 1) en craft-brokken (C1–C11 uit doc 2) zijn gereconcilieerd.

### MUST DO (P0 + P1 — nu, traffic-onafhankelijk)
| Onderdeel | Bron | Waarom must |
|---|---|---|
| **A2 — TrendPoint + echte baseline** | doc 1 §2.1·§3-A2, doc 3 P0 | Élk toekomstig cijfer ("beweegt de score?") liegt tot dit klopt. Kleinste, hoogst-hefboom brok; traffic-onafhankelijk. Prompt ligt klaar (§8). |
| **A3 — day-model-unificatie** | doc 1 §2.1·§4, doc 2 C9 | Drie losse afleidingen van "wat staat er vandaag" → drift ×5 bij elk nieuw domein. Blokkeert multi-domein. Óók de clean-architecture-zet (business logic uit UI). |
| **Intake → account → Kompas: de lek dichten** | doc 4 pr.2 | Zonder converterende funnel is er geen cohort om ooit te meten; week-0 zou "niemand blijft" lezen terwijl niemand binnenkwam. |
| **Vandaag-kaart begrijpelijk** | doc 4 pr.1 | Van "kaartje" naar "ik snap wat ik nu doe"; verhoogt vertrouwen + 2e-dag-retour met bestaande data. |
| **C1 — lazy-load 5 tab-schermen · C2 — pending-states** | doc 2 §2.1·§2.2 | Grootste snelheidswinst + goedkoopste "premium"-upgrade; voorkomen een "kapot"-gevoel dat de retentiemeting vervuilt. |
| **A1 — beweging gedaan-log flag→live + SoonPills eruit** | doc 1 §3-A1, doc 3 P1 | Voltooit het referentie-domein (0→hermeting); doodt de doodlopers. Eén complete lus > vijf halve. |
| **Dashboard leesbaar: prioriteit vs readout vs actie** | doc 4 pr.3 | Zeven domeinbalken naast één actie voelt zwaar; hiërarchie + copy maken het gratis Kompas sterker. |

### SHOULD DO (P2 — zodra de basis niet "embarrassingly broken" voelt)
| Onderdeel | Bron | Waarom |
|---|---|---|
| **Start de klok: 20–50 echte mannen 40+** | doc 3 P2 | De prioriteit die op geen enkel oordeel stond. Zonder cohort is alles boven P1 giswerk. |
| **B2 — in-app dagstart · B4 — "je eerste 30 dagen"** | doc 1 §3-B2·B4 | De retentie-steiger die de klok waardevol maakt; B4 vereist A2 (eerlijke baseline). |
| **A4 — URL=state afmaken (dag-param + Voortgang-subscherm)** | doc 1 §3-A4·§4 | Deeplinkbare terugkeer; nurture kan naar een concrete dag linken. Klein, na A3. |
| **C3 — dode deps · C4 — micro-interactie-basis** | doc 2 §2.1·§4 | Hygiëne + "voelt levend"; laag risico. |

### NICE TO HAVE (kwaliteitsspoor, organisch)
| Onderdeel | Bron | Voorwaarde |
|---|---|---|
| **C5 — secties uitsplitsen `dashboard/sections/*`** | doc 2 §2.4 | Pure move, per aangeraakt scherm; verlaagt dev-cognitive-load. |
| **C6 — design-token-primitives (`<Panel>/<Card>/<StatTile>`)** | doc 2 §2.3 | Na C4; inline styles per scherm migreren. |
| **C7 — per-tab skeletons · C8 — optimistic UI** | doc 2 §3 | Na C1; perceived speed. |
| **C11 — CI-poort tegen inline-style-regressie** | doc 2 §3 | Na C6. |

### NIET DOEN (P3 — actief bevriezen; de discipline is weerstaan, niet bouwen)
| Onderdeel | Status | Bron |
|---|---|---|
| **Mijn Dag categorie-diepte / herhalende blokken (B1)** | **FREEZE — REFINE-DOWN.** Meest speculatieve oppervlak; categorieën verdienen hun complexiteit pre-traffic niet. Overweeg of ze in v1 überhaupt zichtbaar moeten (één "vandaag"-lijst kan genoeg zijn). | doc 3 §3 (verscherpt doc 1 §3-B1) |
| **Agenda-tweak-MVP (swap, `agenda_preferences`)** | DEFER — gelockt achter retentie-trigger (<30% 2e-dag-retour, N≥30). Alleen handoff-0-query draaien. | doc 1 §7·C2, agenda-verdict |
| **Slaap/stress als modules (B3/C1-feature)** | DEFER tot A2+A3 staan én de blauwdruk bewezen is. Geen nieuwe tabellen (check-in ís de datalaag). | doc 1 §3-B3·§5 |
| **Google-sync · push/ICS · wearable** | DEFER — privacy-poort (DPIA/consent) + concrete lus vereist. Naden liggen klaar. | doc 1 §7·H2·H4 |
| **Verbinding-module/-check-in** | KILL voor deze horizon — quickWin-only, gelockt. | doc 1 §7 |
| **Stripe / betaalmuur · identiteit-sectie (PAL/eiwit)** | DEFER — na prijsband-signaal resp. apart scope-besluit. | doc 1 §6, doc 4 |
| **Nieuwe event-types** | KILL — bestaande set dekt fase P0–P2 volledig. | doc 1 §7, doc 2 §5 |

---

## 4. Roadmap in fasen

### Fase P0 — Waarheid + instap (deze week, traffic-onafhankelijk)
- **Doel:** de meetlaag eerlijk maken en de funnel laten converteren, zodat er straks iets échts te meten valt.
- **Deliverables:** A2 (TrendPoint/echte baseline + bron-label + RULES_VERSION-grens) · A3 (`day-model.ts`, één builder) · intake→account→Kompas-lek gedicht · vandaag-kaart begrijpelijk · C1 (lazy-load) + C2 (pending-states) interleaved.
- **Waarom nu:** dit is het enige werk dat niets van verkeer nodig heeft en alles erna waarheidsgetrouw maakt (doc 3). A3 is hard blokkerend vóór multi-domein (doc 1 §8 risico 1).
- **Afhankelijkheden:** A2 en A3 onafhankelijk van elkaar; A3 vóór elke domein-uitbreiding. C2 vóór de eerste externe klik.
- **Definition of Done:** baseline komt bij >6 punten uit `trendBaselines` (niet `trend[0]`); delta eerlijk over de RULES_VERSION-grens; week-strip ↔ timeline ↔ hero pariteit-vitest groen; intake→account→eerste `dashboard_vandaag_card_shown` loopt end-to-end op mobiel (375px); vandaag-tab laadt zonder de JS van 4 ongeopende schermen; logout/hermeting tonen een pending-state.

### Fase P1 — Eén lus kogelvrij (aansluitend)
- **Doel:** beweging is het enige domein zónder doodlopers — check-in → analyse → plan → gedaan → hermeting, compleet.
- **Deliverables:** A1 (`NEXT_PUBLIC_MOVEMENT_LOG_ENABLED=true` na dev-verificatie, register/DPIA al bij) · SoonPill-modaliteiten weg of werkend · dashboard-leesbaarheid (prioriteit/aandacht/rapport-hiërarchie).
- **Waarom nu:** een half-live oppervlak naast een werkend ding leest als "onaf" en kost vertrouwen (doc 3 §3). Compleetheid is een vertrouwens-vraag, geen evidence-vraag — dus kan pre-traffic.
- **Afhankelijkheden:** gedaan-log is gebouwd (flag-flip). Leesbaarheid raakt `Dashboard.tsx` (`kompasHome`, domeinbalken) — organisch, geen herbouw.
- **Definition of Done:** modaliteit kiezen → minuten loggen → volume náást de score bij hermeting werkt end-to-end; `movement.session_logged`-rijen in `domain_events`; geen "Binnenkort" naast een werkend element; één hero + duidelijk gescheiden readouts (energie/herstel = "volgt uit je gedrag").

### Fase P2 — De klok starten (zodra P0/P1 acceptabel voelen)
- **Doel:** 20–50 echte mannen 40+ door de éne lus, en de 2e-dag-retour meten.
- **Deliverables:** beperkt verkeer (pillar/YT/SEO) · B2 (in-app dagstart) · B4 ("je eerste 30 dagen"-verhaal) · A4 (URL=state af).
- **Waarom nu:** zonder gebruikers is alles boven P1 giswerk; dit is de ontbrekende prioriteit uit alle oordelen (doc 3 §2).
- **Afhankelijkheden:** B4 vereist A2 (eerlijke baseline); B2 leest het day-model (A3). Verkeer pas na P0/P1.
- **Definition of Done:** week-0-funnel afleesbaar in PostHog/GA4 op intake→account→vandaag (niet op agenda); een eerste 2e-dag-retour-cijfer bestaat; `remeasure.invited → completed`-ratio meetbaar.

### Fase P3 — Gericht bouwen ná signaal (gated)
- **Doel:** alleen bouwen wat de data vraagt.
- **Deliverables:** handoff-0 opnieuw draaien (N≥30?) → **alleen bij <30% 2e-dag-retour**: agenda-MVP. Slaap als tweede module (bewijst de §5-blauwdruk, <~2 dagen werk). C3/C5/C6-kwaliteitsspoor organisch. C10 (AI op de model-naad) als horizon.
- **Waarom later:** de agenda is een retentie-*weddenschap*; die test je pas zinnig met verkeer én een laag retour-cijfer.
- **Afhankelijkheden:** P2-cohort + retentie-signaal.
- **Definition of Done:** per brok een eigen poort gehaald (retentie-trigger / prijsband-signaal / DPIA) vóór er code komt.

---

## 5. Vertaling van de audit (doc 2 + doc 1 §4) → concrete acties

| As | Bevinding | Roadmap-actie |
|---|---|---|
| **Navigatie** | `tab`/`kompas` al in URL; mist agenda-dag + Voortgang-subscherm. `Dashboard.tsx`-monoliet niet herbouwen. | **A4** (P2): dag-param + subscherm-param, zelfde `replaceState`-patroon. Monoliet bevriezen. |
| **Informatiearchitectuur** | Zeven domeinbalken naast één actie = hoge cognitieve last; prioriteit/readout/actie lopen door elkaar. | **doc 4 pr.3** (P1): één hero (vandaag-actie) + "Je domeinen" met visueel onderscheid Prioriteit/Aandacht/Rapport; readouts zonder actieknop; "energie/herstel volgen uit je gedrag". |
| **Code-health** | Default-tab bundelt 4 ongeopende schermen; async-acties dood (logout/hermeting); 2 dode deps (`framer-motion`, `@upstash/redis`). | **C1** (P0) lazy-load · **C2** (P0) pending-states · **C3** (P2) deps prunen, lockfile met `npx npm@10.8.2 install`. |
| **Onderhoudbaarheid** | 3.758 r., 37 componenten in één bestand; 1.041 inline `style={{}}` naast 111 tokens; radius 28/24/11-ruis. | **C5** secties → `dashboard/sections/*` (pure move, organisch) · **C6** token-primitives · **C11** CI-poort tegen nieuwe inline styles. |
| **Schaalbaarheid** | Elk nieuw domein kopieert de drievoudige dag-merge; AI-features dreigen UI-gekoppeld te raken. | **A3/C9** day-model als harde model-grens (business logic uit UI) · **C10** AI-personalisatie op `DashboardModel` + `domain_events`, nooit UI-state · §5-blauwdruk (6-slot module-contract) als uitrol-patroon. |

**Regel voor het hele craft-spoor:** elke splitsing/migratie valt samen met een scherm dat je tóch aanraakt — nooit een big-bang refactor als los project (doc 1 §8.8, doc 2 §5.1).

---

## 6. Bescherm de moat (doc 3 §1 + doc 1 §6 + Ring-model)

**Wat onaantastbaar is — en waarom het concurrentievoordeel is:**
1. **De engine als één waarheid, mét onderbouwing.** Geen wellness-vibes maar echte scoring + kennisbank + evidence-audit-cultuur. Dít maakt "de Consumentenbond van supplementen" concreet. Niet in een weekend na te bouwen.
2. **De leading-indicator-lus, architectonisch schoon.** Vier niet-overlappende laag-contracten (analyse/plan/agenda/evidence). De meeste apps mushen die door elkaar; de scheiding is zeldzame helderheid — en AI-resistent, want het hangt aan jouw data/engine.
3. **De discipline zelf.** "Één scoringswaarheid", "geen live gemeten", "geen scores in reminders", "DEFER elk extern kanaal", "evidence náást de score". Het proces is waarom het product vertrouwd *blijft* terwijl het groeit — moeilijker te kopiëren dan features.
4. **Compliance/data-architectuur die klopt.** RLS deny-all, `pd_`/`af_`-service-role-scheiding, geen PII in analytics, register/DPIA-poorten vóór activatie.
5. **Een technisch fundament zonder fundament-schuld.** Server-first, echte `<button>`-semantiek, engine-SSOT-grens, URL=state.

**Hoe elke roadmapkeuze de moat versterkt:**
- A2/A3 beschermen moat-punt 1+2: een eerlijke meetlaag is de kern van "de Consumentenbond"; een gedrifte baseline ondermijnt precies de hermeting-belofte.
- Het gratis houden van uitkomsten + lus, en betaald maken van diepte (doc 1 §6), houdt de moat een *ervaring*, geen te downloaden PDF.
- De model-grens (C9/C10) borgt dat toekomstige AI op de data/engine hangt (kopieerbaar-resistent), niet op UI.
- Elke DEFER (extern kanaal, agenda-diepte, Stripe) beschermt de discipline-asset (moat-punt 3) tegen verwatering.

**Toets:** geen enkele roadmapbeslissing mag een tweede scoringswaarheid introduceren, PII/score naar buiten lekken, of de vier laag-contracten vermengen. Botst iets hiermee → het gaat niet door.

---

## 7. Cognitieve load — de roadmap getoetst (doc 4)

**Het misverstand dat gecorrigeerd is.** "Wachten op traffic" (handoff-0's agenda-DEFER) betekent **niet** "laat de rest lelijk / doe geen productwerk". Het betekent alleen: *codeer de grote agenda-weddenschap nog niet met 2 testaccounts.* Twee verschillende dingen:

| | Agenda-MVP (handoffs 1–2) | UI / conversie / Kompas sterker |
|---|---|---|
| Grootte | Grote nieuwe feature (week, prefs, swap) | Verbeteren wat er al is |
| Bewijs nodig? | Ja — anders bouw je iets dat niemand vraagt | Nee — een kapotte funnel fix je vóór schaal |
| Besluit nu | DEFER tot N≥30 + retentie <30% | Mag wél (hoort vaak vóór traffic) |

**Toets van de hele roadmap op eenvoud/focus/flow/minimale load/navigatie/IA:**
- **Eenvoud & focus:** P0–P1 bevatten geen enkele nieuwe grote feature — alleen waarheid, instap en het kogelvrij maken van bestaande dingen. Elke grote weddenschap staat in P3-freeze. ✔
- **Duidelijke gebruikersflow:** de vandaag-kaart wordt van "kaartje" naar "ik snap wat ik nu doe" (kop in mensentaal, WIIFM, "Waarom?"-link, ná Gedaan één vervolg — geen tweede primaire CTA). ✔
- **Minimale cognitieve belasting:** dashboard-hiërarchie scheidt Prioriteit/Aandacht/Rapport; "energie/herstel = geen aparte todo"; domein-deep alleen via "Meer over […] →", niet als parallelle todo-lijst. ✔
- **Logische navigatie & consistente IA:** URL=state afmaken (A4) + monoliet bevriezen + organisch uitsplitsen; geen concurrerende navigatiestructuren. ✔

**Conflict gesignaleerd + opgelost:** doc 1 plaatst herhalende agenda-blokken (B1) in fase B (2–4 weken); doc 3+4 zeggen dat categorie-diepte pre-traffic cognitieve last toevoegt zonder bewijs. **Sterkste keuze: B1 verhuist naar P3-freeze** (REFINE-DOWN) — Mijn Dag doet in v1 één ding kogelvrij ("dit is je dag, dit is het ene ding"), categorieën verdienen hun complexiteit pas met een retour-cijfer.

---

## 8. Masterprioriteiten voor morgen

**1. Wat morgen als eerste gebeurt.** **A2 — TrendPoint + echte baseline.** De kleinste, hoogst-hefboom P0-brok; traffic-onafhankelijk; maakt élk cijfer erna eerlijk. De implementatieprompt is al uitgeschreven (doc 3, embedded): baseline verhuist naar de bron (`account-dashboard.ts`, waar timestamps + bron bestaan en `slice(-6)` nu de echte baseline weggooit), `leefstijllijn.ts` consumeert; `trendBaselines` optioneel met `trend[0]`-fallback → blast radius 5 bronbestanden + 1 test. Verificatie: `grep console.log` · `tsc --noEmit` · `vitest leefstijllijn` · `eslint --max-warnings 0`.

**2. Wat daarna volgt (P0→P1, in volgorde).**
1. A3 — day-model-unificatie (blokkeert multi-domein).
2. Intake→account→Kompas-lek dichten + vandaag-kaart begrijpelijk (doc 4 pr.1+2).
3. C1 (lazy-load) + C2 (pending-states) interleaved.
4. A1 — gedaan-log flag→live + SoonPills eruit (voltooit beweging-lus).
5. Dashboard-leesbaarheid (doc 4 pr.3).
Daarna P2: de klok starten met 20–50 echte mannen 40+.

**3. Wat expliciet geparkeerd blijft.** Mijn Dag categorie-diepte/herhalende blokken (B1, REFINE-DOWN), agenda-tweak-MVP, slaap/stress-modules, Google-sync/push/ICS/wearable, verbinding-module, Stripe/premium-gates, identiteit-sectie (PAL/eiwit), nieuwe event-types. Zie §3-NIET-DOEN.

**4. Besluiten die eerst genomen moeten worden vóór er (verder) gebouwd wordt.**
- **RULES_VERSION-grens — BESLOTEN 20 jul: onderdrukken.** Bij een baseline van vóór een meetmethode-update wordt de delta `null` + label "meetmethode bijgewerkt" (niet: getal tonen met annotatie, zoals doc 1 §115 opperde). Reden: voorkomt precies de deltabug-klasse die eerder al beet ([[psf-leefstijlcheck-herziening]]); "verkeerd getal met sterretje" weegt op een vertrouwens-product zwaarder dan "geen getal". De `crossesRulesVersion`-flag ligt klaar; omzetten naar annotatie is later één regel. → Verwerken in de A2-prompt.
- **Categorieën in Mijn Dag — BESLOTEN 20 jul: keuzemenu verbergen, interne koppeling behouden, `medicatie` eruit.** Zelf-toegevoegd blok = titel + tijd (default `persoonlijke_routine`), géén 11-item picker; de 5 pijler-categorieën (slaap/stress/voeding/beweging/verbinding) blijven intern plan-stap-blokken per domein kleuren. `medicatie` verwijderd uit `AgendaCategoryId` + [`categories.ts`](../../src/data/agenda/categories.ts) (enige medisch-geladen categorie; botst met "adviezen, geen diagnoses") — gedaan 20 jul, tsc groen, resterende 5 routine-categorieën: supplementen/water/werk/ontspanning/persoonlijke_routine. Picker-hide zelf landt bij P1-leesbaarheidswerk; omkeerbaar.
- **Agenda ↔ Future You-koppeling — BESLOTEN 20 jul: ja narratief, nee als tweede score.** De agenda mag de "toekomstige ik"-lijn voeden als *input* — elk afgevinkt blok = een investering in je toekomst — maar **nooit** als een eigen bewegend cijfer (geen bio-age/live-gemeten). De eerlijke keten volgt de bestaande laag-contracten (§5): agenda-blok → evidence-log (slot 6) → hermeting → domeinscore (slot 1, de éne waarheid) → levenslijn/Future You. De future-you-payoff landt bij de **hermeting**, niet per blok. Terminologie: **"Future You Score"** (0–100, beïnvloedbaar, algemeen — zoals al in [`MovementDashboardPreview`](../../src/components/content/MovementDashboardPreview.tsx) / [`MovementLifeline`](../../src/components/content/MovementLifeline.tsx)), **niet** "biologische leeftijd" (zwaardere quasi-medische claim; de gids-Levenslijn is bewust een algemeen beeld, geen persoonlijke voorspelling — beweeggids §16). Bouw zit achter de FREEZE + ná het shippen van beweeggids/Voortgang; dit is een koppel-principe, géén trigger om agenda-diepte naar voren te halen.

**5. Welke documenten "bron van waarheid" zijn na deze analyse.**
- **Dit document** (`docs/core/ROADMAP_DASHBOARD_COCKPIT.md`) is de leidende strategische SSOT voor het Dashboard-Cockpit.
- Het **verankert** doc 3 (moat) en doc 4 (cognitieve load), die niet als los bestand bestonden.
- De bestaande bronoordelen (`fable-roadmap-vervolg-verdict`, `fable-craft-performance-audit`) blijven de gedetailleerde onderbouwing per brok — dit document is de bovenliggende koers; bij tegenstrijdigheid wint dit document (het reconcilieert ze expliciet: eerstvolgende brok = **A2**, niet A1 (verdict §120) of C1 (audit §111); B1 = freeze).

---

*Opgesteld 20 juli 2026. Consolideert vier bronnen tot één koers — geen nieuwe richting. Onder voorbehoud van Dennis' bevestiging op de twee open besluiten (§8.4).*
