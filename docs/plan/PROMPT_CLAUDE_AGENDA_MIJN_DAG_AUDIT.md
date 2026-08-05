# Claude Opus — audit + architectuur "Mijn dag" (agenda)

> Gebruik: plak de inhoud onder **Prompt (copy-paste)** in Claude Opus met de repo als context.
> Voeg optioneel toe: een screenshot van de referentie-agenda (breedte/indeling van de balk), en een
> screenshot van `/dashboard?tab=agenda` op 375px waar de sticky balken het probleem tonen.
>
> Opus levert **analyse + architectuurvoorstel, geen code**. Daarna beslis jij wat er gebouwd wordt.

---

## Prompt (copy-paste)

```text
## Rol

Je bent tegelijkertijd:
- senior Next.js 16 / TypeScript-architect (App Router, RSC, Tailwind, Supabase)
- calendar/agenda-UX-ontwerper met ervaring in mobile-first tijdlijnen
- kritisch code-reviewer die dubbele bronnen van waarheid en stille faalpaden opspoort
- datamodel-architect die vooruit denkt: automatisering (n8n) en voortgangsmotor moeten later
  in hetzelfde model kunnen schrijven

Je schrijft in deze opdracht GEEN code en wijzigt GEEN bestanden. Je levert een audit met
bewijs, gevolgd door een architectuurvoorstel met één expliciete aanbeveling.

Wees streng. Als iets half werkt, noem het kapot. Als je iets niet kunt verifiëren, schrijf
"aanname:" ervoor. Verzin nooit een bestandspad, functienaam of kolomnaam — lees het bestand.

---

## Context — product

PerfectSupplement (perfectsupplement.nl) is een leefstijlplatform voor mannen 40+. In het
ingelogde dashboard zit een agenda-tab "Mijn dag": een dagtijdlijn met dag/week/maand-views,
waarin twee soorten momenten samenkomen.

Belangrijk: er lopen DRIE verschillende assen door elkaar in de UI. Houd ze in je analyse
strikt uit elkaar en benoem waar de code ze verwart:
1. HERKOMST — "basis" (uit het plan gegenereerd) vs "aanvulling" (zelf toegevoegd) vs extern.
   Zie resolveBlockRole() in src/lib/agenda-timeline.ts:225.
2. DOMEIN — PillarId: slaap, energie, stress, voeding, beweging, herstel, verbinding.
3. BEWEGING-TIER — belastingsniveau binnen het domein beweging: "herstel" | "matig" | "trainen"
   (src/lib/movement-today-choices.ts:19). In gebruikerstaal heet dit rust / conditie / kracht.

De gebruiker denkt in "ik wil dinsdag rust in plaats van kracht" — dat is as 3 op een specifieke
dag. De code kent dat concept per dag niet.

---

## Context — geverifieerde ankers in de codebase

Deze feiten zijn gecontroleerd op de huidige working tree. Verifieer ze zelf opnieuw voor je
erop bouwt (er staan uncommitted wijzigingen in AgendaScreen, AgendaToolbar, AgendaDayTimeline;
AgendaProvenanceStrip.tsx is verwijderd).

### Scroll- en sticky-architectuur (pijnpunt 1)

- Alles is PAGINA-scroll. Er is geen inner scrollcontainer voor de agenda: het <main>-element in
  src/components/dashboard/cockpit/CockpitFrame.tsx:282 heeft geen overflow-y.
- Sticky laag 1: CockpitHeader — "sticky top-0 z-20" (CockpitHeader.tsx:127).
- Sticky laag 2: AgendaToolbar — "sticky z-10" met dynamische top uit useStickyHeaderOffset()
  (AgendaToolbar.tsx:173-176, src/lib/use-sticky-header-offset.ts meet [data-cockpit-header]).
- Fixed onderaan: CockpitBottomNav — "fixed inset-x-0 bottom-0 z-20 ... sm:hidden"
  (CockpitBottomNav.tsx:22).
- Onder 640px valt de toolbar uiteen in DRIE rijen: PeriodNav, dan ViewSwitcher, dan ActionGroup
  (AgendaToolbar.tsx:177-194 — de actiegroep wordt tweemaal gerenderd: "hidden sm:block" naast de
  switcher en "sm:hidden" als eigen rij).
- Wat WEL wegscrollt: DashTabHeader, focus-panel, plan-step strip, week-strip (7 dagcellen,
  min-h 64px), de tijdlijn zelf, footer.
- De tijdlijn-rail heeft een VASTE pixelhoogte met absoluut gepositioneerde blokken en
  overflow-hidden: TIMELINE_START_HOUR 6 tot TIMELINE_END_HOUR 24 (agenda-timeline.ts:13-15)
  × HOUR_HEIGHT_PX 58 (AgendaDayTimeline.tsx:42) = 1044px, hard gezet als height, minHeight én
  maxHeight (AgendaDayTimeline.tsx:384-389). De rail kan dus niet meebewegen met de viewport.

### Toolbar (pijnpunt 2)

- src/components/dashboard/agenda/AgendaToolbar.tsx is nieuw en nog untracked in git.
- De balk is full-bleed via negatieve margins (-mx-3 sm:-mx-4 min-[1440px]:-mx-6), heeft geen
  eigen max-w, en is mobiel flex-col / vanaf sm flex-row.
- Inhoud: PeriodNav (chevron vorige/volgende + midden ofwel periodLabel ofwel knop "Vandaag"),
  AgendaViewSwitcher (Dag/Week/Maand, embedded), en ActionGroup met Plan / Focus / Kalender.
- ActionGroup wordt alleen meegegeven bij view === "dag" (AgendaScreen.tsx:717-731).
- View- en datum-state liggen NIET in de agenda maar in Dashboard.tsx (useState + URL-params
  ?tab=agenda&view=&dag=, helpers in src/lib/dashboard-url.ts). Er is geen agenda-context.
- Week-view rendert AgendaWeekOverview onder lg en AgendaWeekTimeGrid vanaf lg
  (AgendaScreen.tsx:788-800).

### Twee parallelle systemen voor blokken (pijnpunt 3 + prebuild)

Dit is de kern. Er bestaan twee soorten momenten met totaal verschillende opslag:

A. PLAN-STAP ("basis") — VIRTUEEL, bestaat niet in de database.
   - Opgebouwd per render door buildWeekSchedulePreview() in src/lib/agenda-week-preview.ts:102.
   - Het domein per dag komt uit een hardcoded rotatiepatroon:
     DOMAIN_SLOT_PATTERN = [0, 0, 1, 2, 0, 1, 2] (agenda-week-preview.ts:16) gecombineerd met
     model.priority.id en de top-3 domeinen uit de ladder (domainForDayIndex(), regel 88-100).
   - Krijgt de synthetische id `analysis:${slot.date}`.
   - isEditable: slot.isToday (src/lib/agenda-timeline.ts:280) — dus alleen vandaag bewerkbaar.
   - De tijd van vandaag wordt opgeslagen in account_priority_pref.scheduled_time via
     postScheduledTime() (src/lib/priority-pref-client.ts), NIET in agenda_blocks.
   - De tijd van andere dagen is een afgeleide default die elke page load opnieuw wordt berekend
     en nergens wordt bewaard: resolveScheduledTime() in src/lib/day-model.ts:176-187.
   - Zonder scheduledTime staat de plan-stap in de "tray" in plaats van in het uurraster:
     resolvePlanStepPlacement() in src/lib/agenda-timeline.ts:306.

B. ROUTINE-BLOK ("aanvulling") — echte row in tabel agenda_blocks
   (supabase/migrations/20260718160000_agenda_blocks.sql, soft delete in 20260718170000).
   - Kolommen: id, account_id, organization_id, date, category_id, title, start_time, end_time,
     source (default 'routine'), status (default 'open'), external_provider, external_ref,
     created_at, updated_at, deleted_at. GEEN check constraint op category_id — enum-validatie
     gebeurt app-side.
   - isEditable: kind === "routine" (agenda-timeline.ts:327).

Gerelateerde prefs die nu de rol van "opslag" vervullen, allemaal in account_priority_pref
(UNIQUE op account_id, dus één rij per account — géén per-dag granulariteit):
- scheduled_time (20260718150000)
- plan_step_dismissed_date (20260718180000)
- plan_steps_hidden (20260718190000)
- movement_day_choice + movement_day_choice_date (20260801120000)

### Concrete defecten die je moet narekenen en uitbreiden

- categoryId (= domein) is NIET wijzigbaar op een bestaand blok. Het ontbreekt in
  UpdateAgendaBlockInput (src/types/agenda.ts:79-86) EN in de PATCH-allowlist
  (src/app/api/account/agenda-blocks/[id]/route.ts:84-106). Zelfs als de UI het zou aanbieden,
  slikt de API het stil in zonder foutmelding.
- handleRetimeSubmit() in AgendaBlockDetailSheet.tsx:104-137 roept onRetime() aan zonder await,
  vuurt daarna trackAgendaBlockUpdated() en clarityTag(), en sluit de sheet — dus tracking meldt
  succes voordat de server heeft geantwoord, en een fout is voor de gebruiker onzichtbaar.
- Eindtijd is read-only en altijd afgeleid uit start + duur (AgendaScheduleFields.tsx:226-230).
- Drag op een plan-stap schrijft de pref (commitPlanStepDrag op AgendaDayTimeline.tsx:222 →
  postScheduledTime), drag op een routine-blok schrijft agenda_blocks. Twee paden, één gebaar
  (de vertakking staat op AgendaDayTimeline.tsx:245-249 en 283-286).
- Datum van een plan-stap kan überhaupt niet worden gewijzigd: slot.date is vast aan de
  kalenderweek en er is geen API voor "verplaats plan-stap naar andere dag".

### Meetpunten die al bestaan

- domain_events (server, emitEvent, geregistreerd in src/lib/events.ts:20-28):
  dashboard.time_bucket_set, agenda.block_created, agenda.block_toggled, agenda.block_updated,
  agenda.block_deleted, agenda.block_restored, agenda.plan_step_dismissed,
  agenda.plan_step_restored.
- GA4 via src/lib/ga4.ts: agenda_block_created/updated/toggled/deleted, agenda_plan_step_*,
  dashboard_agenda_* (view, day select), dashboard_time_bucket_set.
- Clarity-tags: agenda_block, agenda_plan_step, dashboard_agenda, dashboard_time_bucket.
- Er zijn GEEN client-side account-events voor agenda.

### Testdekking

Alleen lib-tests in src/lib/__tests__/: agenda-blocks, agenda-timeline, agenda-timeline-drag,
agenda-time-picker, agenda-week-preview, agenda-day-context, agenda-plan-duration, agenda-month.
Er zijn GEEN component- of API-route-tests voor de sheets, de toolbar of de PATCH-route.

---

## Taak

Lever zes onderdelen, in deze volgorde.

### A. Functionele audit van "Mijn dag"

Loop elk gebruikerspad end-to-end na en geef per pad een oordeel: WERKT / HALF / KAPOT, met
bestand:regel als bewijs en een reproductiestap in gewone taal.

Paden die je in elk geval moet dekken:
1. Moment toevoegen (categorie, titel, starttijd, duur) — inclusief: wat gebeurt er bij een
   netwerkfout, en klopt de datum als je het toevoegt terwijl je op een andere dag staat?
2. Moment afvinken en weer openzetten.
3. Moment verplaatsen via de detail-sheet (datum + tijd) en via drag op de tijdlijn.
4. Moment verwijderen, herstellen, definitief verwijderen.
5. Plan-stap: tijd zetten, verbergen, herstellen, alle plan-stappen verbergen.
6. Wisselen tussen dag / week / maand, en navigeren naar vorige/volgende periode.
7. Terug naar vandaag, en de deeplink ?tab=agenda&view=...&dag=... (ook bij hard refresh en
   browser back).
8. Een dag buiten de adviesweek ("orphan"-pad).

Let daarbij specifiek op:
- Mutaties zonder await of zonder foutpad (fire-and-forget), en tracking die vóór succes vuurt.
- Optimistic UI zonder rollback bij een 4xx/5xx.
- Dubbele bron van waarheid (pref vs DB vs afgeleide berekening) en waar die kunnen divergeren.
- Tijdzone Europe/Amsterdam: gedrag rond middernacht en rond de DST-omschakeling; blokken die
  over middernacht heen zouden lopen.
- Dode code na de recente refactor: props die nergens meer landen, componenten die niet meer
  gerenderd worden, resten van de verwijderde AgendaProvenanceStrip.
- Toegankelijkheid: focus-trap en focus-restore in de sheets, toetsenbord-alternatief voor drag,
  aria-live bij periodewissel, tapdoelen ≥ 44px op 375px.
- Rate limiting: de agenda-routes gebruiken de "intake_session"-limiter — beoordeel of dat de
  juiste bucket is voor snelle opeenvolgende agenda-mutaties.

Sorteer de bevindingen op severity: BLOCKER (dataverlies of stil falen), HOOG (gebruiker raakt
vertrouwen kwijt), MIDDEN, LAAG.

### B. Pijnpunt 1 — de sticky balken vreten het mobiele scherm op

Probleem in Dennis' woorden: "in mobiel als ik naar beneden scrol in mijn dag, blijven de balken
daarboven lelijk in beeld."

Doe dit:
1. Kwantificeer op 375×667 (iPhone SE) en 390×844 hoeveel verticale ruimte permanent bezet is:
   CockpitHeader + AgendaToolbar bovenaan, CockpitBottomNav onderaan. Reken het uit op basis van
   de daadwerkelijke padding- en min-height-klassen en geef de rekensom. Zeg hoeveel procent van
   de viewport overblijft voor de tijdlijn.
2. Geef minimaal drie oplossingsrichtingen met trade-offs, o.a.:
   - één samengevoegde compacte balk (periode + view + acties in één rij, acties achter overflow)
   - collapse-on-scroll: bij scroll omlaag krimpt de balk naar alleen de datum, bij scroll omhoog
     komt hij terug (let op: dit patroon bestaat nog nergens in het dashboard — beoordeel of het
     de complexiteit waard is)
   - toolbar niet sticky maken, maar wel een dunne datum-indicator laten plakken
   - de tijdlijn een eigen scrollcontainer geven in plaats van pagina-scroll (beoordeel de
     gevolgen voor de vaste rail-hoogte en voor de bottom nav)
3. Beoordeel of de bottom nav en de toolbar samen niet dubbelop zijn op mobiel.
4. Kies één aanbeveling en zeg wat je bewust NIET doet.

### C. Pijnpunt 2 — breedte en architectuur van de balk

Probleem in Dennis' woorden: "denk na over de breedte van de balk vandaag - dag/week/maand -
plan focus kalender". Hij verwijst naar een bestaande agenda-app als voorbeeld; een andere,
betere indeling mag ook.

Ontwerp de balk als één herbruikbare primitief die alle views bedient — nu dag/week/maand, later
ook nieuwe views (bijvoorbeeld voortgang of een geïmporteerde externe agenda) zonder dat de balk
omvalt.

Beantwoord expliciet:
1. Wat is de juiste visuele hiërarchie: is de periode-navigatie primair en de view-schakelaar
   secundair, of andersom? Onderbouw vanuit hoe vaak elk gebruikt wordt.
2. Waar horen Plan, Focus en Kalender? Nu verschijnen ze alleen in de dag-view, waardoor de balk
   van hoogte verspringt bij het wisselen van view — is dat gewenst of storend?
3. Hoe schaalt het naar 4 of 5 views? Wat gaat er op mobiel achter een overflow-menu?
4. Moet de balk full-bleed blijven of een max-breedte krijgen die met de content meeloopt?
5. Datum-selectie: er zijn nu drie ingangen (chevrons, week-strip, kalender-sheet). Is dat er één
   te veel? Wat is het minimale consistente model?
6. State-architectuur: view en datum liggen nu in Dashboard.tsx met losse URL-helpers. Stel voor
   hoe je dat naar één expliciete bron van waarheid brengt (URL-first, eventueel met een
   AgendaViewContext), zodat een nieuwe view geen prop-drilling door Dashboard.tsx vereist.
   Beschrijf de component-grens: welk deel is server-component, welk deel client.
7. Geef de voorgestelde componenthiërarchie als boom, met per component de verantwoordelijkheid
   en de props-vorm (namen en types, geen implementatie).

### D. Pijnpunt 3 — basis/beweging is niet aanpasbaar

Probleem in Dennis' woorden: "als iemand bijvoorbeeld een andere dag rust-kracht-conditie-slaap
uit domein wil aanpassen kan dat nu niet goed. Ook werkt de tijd-datum veranderen niet goed."

Doe dit:
1. Leg per symptoom de code-oorzaak uit met bestand:regel. Onderscheid daarbij expliciet:
   het domein van een dag (as 2), de beweging-tier van een dag (as 3), en de tijd/datum.
2. Beschrijf het gewenste gedrag als user stories, minimaal:
   - "Ik wil op donderdag rust in plaats van kracht, zonder mijn hoofdfocus te veranderen."
   - "Ik wil mijn basisstap van dinsdag naar woensdag verplaatsen."
   - "Ik wil de tijd van mijn basisstap op elke dag zetten, niet alleen vandaag."
   - "Als ik iets aanpas en het lukt niet, wil ik dat zien."
3. Beantwoord de conceptuele kernvraag: als een gebruiker een gegenereerde basisstap aanpast,
   wordt die dag dan een override op het plan, of wordt het een gewoon eigen moment dat de
   koppeling met het plan verliest? Geef je oordeel en de consequenties voor voortgangsmeting
   (blijft de dag meetellen als "plan gevolgd"?).
4. Ontwerp één consistente edit-surface voor beide bloktypes, zodat de gebruiker geen verschil
   merkt tussen "basis" en "aanvulling" behalve waar dat betekenisvol is.

### E. Prebuild — plan-blokken materialiseren (het architectuurstuk)

Kernvraag: wat is er nodig om virtuele plan-stappen als ECHTE rows te laten bestaan, vooruit
gegenereerd, zodat n8n en de voortgangsmotor er later in kunnen schrijven en de gebruiker ze
echt kan aanpassen?

Vergelijk minimaal drie opties:
1. agenda_blocks uitbreiden: source = 'analysis', plus kolommen als plan_step_id, domain,
   movement_tier, generated_at, user_modified.
2. Een aparte tabel agenda_plan_blocks naast agenda_blocks, met een gedeelde view of een
   samenvoeging in de applicatielaag.
3. Alleen een override-tabel bovenop de huidige berekening (agenda_plan_overrides per
   account_id + date), waarbij de generatie virtueel blijft.

Beoordeel elke optie op:
- Idempotente (re)generatie: draaien zonder gebruikers-aanpassingen te overschrijven. Wat is de
  conflictregel als de gebruiker een dag heeft aangepast en de focus daarna verandert?
- Horizon: hoeveel dagen vooruit materialiseer je, wie triggert dat (page load, cron, n8n), en
  wat gebeurt er met dagen die nooit bezocht worden?
- Migratiepad voor de bestaande prefs: scheduled_time, plan_step_dismissed_date,
  plan_steps_hidden, movement_day_choice + movement_day_choice_date staan nu allemaal in
  account_priority_pref met UNIQUE(account_id) — dus één waarde voor het hele account. Beschrijf
  hoe die per dag worden, en hoe je bestaande gebruikersdata meeneemt zonder verlies.
- Beveiliging: agenda_blocks heeft RLS. Beschrijf welke policies of welk service-role-pad nodig
  is als n8n schrijft, in lijn met het projectpatroon dat interne tabellen deny-all zijn en
  alleen via createSupabaseAdmin() benaderbaar.
- Contract voor n8n: idempotency key, upsert versus append-only, versienummer of generatie-id,
  en wat er gebeurt bij een dubbele levering.
- Kosten: hoeveel rows per gebruiker per jaar, en hoe ruim je op.
- Backwards compatibility: de synthetische id `analysis:${date}` zit nu in de UI en in de
  tracking. Wat breekt er en hoe vang je dat op?

Geef daarna ÉÉN aanbeveling met een gefaseerd migratiepad, waarbij elke fase op zichzelf
deploybaar is en de app blijft werken als een latere fase nooit komt.

Teken de doelarchitectuur als mermaid-diagram: van bron (leefstijlcheck/model, n8n, gebruiker)
naar opslag naar view-model naar UI.

### F. Meetplan

Per voorstel uit B, C, D en E:
- Welk BESTAAND event volstaat (hergebruik gaat voor nieuw)?
- Welk nieuw event is echt nodig, en op welke laag: domain_events (durable, PostHog + n8n),
  GA4 trackEvent (aggregatie/funnel), of Clarity clarityTag (recordings filteren)?
- Voor een nieuw client-event: benoem de drie registratieplekken die anders een 403 geven
  (src/lib/events.ts, de client-emit-union, en de allowlist in de betreffende API-route).
- Geen PII in GA4/Clarity-payloads.
- Voor de mobiele scroll-fix (B): welk concreet getal toont aan dat het beter is geworden?
  Denk aan scrolldiepte, interactie met blokken onder de vouw, of het aandeel sessies waarin een
  moment wordt aangepast.

---

## Constraints

- Wijzig GEEN bestanden. Geen git-commando's, geen commit, geen migratie uitvoeren.
- Elke bewering over de code onderbouw je met bestand:regel. Geen verzonnen paden, functienamen
  of kolomnamen — open het bestand en lees het.
- Wat je niet kon verifiëren, label je expliciet als "aanname:".
- Blijf binnen de projectconventies: imports via @/, Nederlandse UI-strings en Engelse
  variabelen/functies, server components default en "use client" alleen waar nodig, semantic
  HTML, Tailwind in JSX zonder losse CSS-bestanden, geen localStorage (alles via Supabase),
  layout via de Container met max-w-7xl px-6 lg:px-8.
- Kom niet met voorstellen die raken aan: src/app/intake/, src/data/affiliate-links.ts,
  src/lib/scoring.ts, globals.css, deploy.sh, .env.local.
- Migraties in dit project gaan als SQL-bestand in supabase/migrations/ en worden met de hand
  uitgevoerd via de Supabase Dashboard SQL Editor. `supabase db push` bestaat hier niet — stel
  het niet voor.
- Geen medische claims in voorgestelde UI-teksten: adviezen, geen diagnoses.
- Antwoord in het Nederlands. Code-identifiers in het Engels.

---

## Acceptatiecriterium

- [ ] Audit (A) dekt alle acht paden, elk met oordeel, bestand:regel en reproductiestap
- [ ] Bevindingen gesorteerd op severity, met bovenaan de blockers
- [ ] Elk pijnpunt (B, C, D) heeft minimaal drie afgewogen richtingen én één aanbeveling, met
      benoemd wat je bewust afwijst en waarom
- [ ] B bevat een concrete rekensom van de bezette viewport-hoogte op 375px
- [ ] C bevat een componentboom met verantwoordelijkheden en props-vorm
- [ ] E vergelijkt drie datamodel-opties op alle genoemde criteria, met kolomnamen, constraints,
      indexen en een migratieschets voor de aanbevolen optie
- [ ] E bevat een mermaid-diagram van de doelarchitectuur
- [ ] Er is een risicoparagraaf: wat breekt er voor bestaande gebruikers, en hoe vang je dat op
- [ ] De implementatie is opgeknipt in reviewbare plakken die elk los deploybaar zijn, elk met
      een eigen verificatiegate (tsc + vitest + eslint) en een eigen meetpunt
- [ ] Er is een expliciete lijst "NIET bouwen" met wat buiten scope blijft en waarom
- [ ] Elk voorstel benoemt welke test er ontbreekt en welke test er bij hoort — met name voor de
      PATCH-route en de sheets, waar nu geen enkele test op zit

---

## Verificatie

Je mag deze read-only checks draaien om je audit te staven (ze wijzigen niets):

1. npx tsc --noEmit
2. npx vitest run src/lib/__tests__/agenda-blocks.test.ts src/lib/__tests__/agenda-timeline.test.ts src/lib/__tests__/agenda-timeline-drag.test.ts src/lib/__tests__/agenda-week-preview.test.ts
3. npx eslint src/components/dashboard/agenda src/lib/agenda-*.ts --max-warnings 0
4. grep -rn "console.log" src/

Draai GEEN `next build` en verwijder .next niet — er draait een dev-server die daarop crasht.

Benoem in je rapport expliciet welke van de acht gebruikerspaden door geen enkele test worden
geraakt.

Stop na je rapport. Schrijf geen code en wijzig geen bestanden.
```

