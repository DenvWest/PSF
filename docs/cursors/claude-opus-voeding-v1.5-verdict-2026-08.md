# Voeding v1.5 — verdict bij de eetbasis-rail-prebuild

**Datum:** 12 augustus 2026 · **Prebuild:** `docs/design/voeding-piramide-prebuild-v1.5-2026-08.html`
**Bij:** `BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md` · **Repo-stand:** V1a+V1b geland (81beb48)

Noordster ongewijzigd: *eerst structureel goed eten, daarna pas perfect eten.*

---

## A · Diagnose — waarom v1 niet mocht blijven staan

Drie dingen braken tegelijk aan v1, en geen ervan zat in de inhoud.

**A1 · De rail was een stapel, geen hiërarchie.** Zes `.layer`-blokken, allemaal open, allemaal even zwaar. Op 375px kostte dat ruim 1100px scrollhoogte waarin niets de blik stuurde. De hiërarchie zat in de *volgorde*, en volgorde is het zwakste signaal dat er is zodra alles even luid staat. De `.pl-row`-shell uit slaap v2 lost dat op met twee middelen die v1 miste: een 4px statusbalk die de toestand codeert vóór je leest, en een accordeon waarin precies één rij open is. De gesloten rij draagt daardoor één regel — *waarom hij daar staat* — en dát is de eigenlijke inhoud van een piramide zonder cijfers.

**A2 · Twee disclosures naast elkaar.** v1 rendert dezelfde help-disclosure twee keer, met een uitlegregel ertussen ("Hieronder staat dezelfde disclosure open…"), zodat de review beide toestanden zag. Dat is reviewer-gereedschap dat in het ontwerpcontract lekte: een implementator die dit één-op-één vertaalt bouwt twee `<details>` in `NutritionCapture`. Weg, vervangen door één disclosure plus een chrome-schakelaar.

**A3 · De prompt-teller loog.** "Vraag 4 van 11" beschreef een flow waarin vier vragen optioneel waren — precies de vier met een gepubliceerde populatierichtlijn (§A5 van het besluit). Dat is inmiddels gerepareerd in de repo: elf sliders plus twee meta-vragen is dertien verplichte stappen. De prebuild moest mee, en `breadth_skipped` verdwijnt daarmee als normale toestand — hij bestaat nog uitsluitend als legacy-note in de ontwerpnotities, voor logs van vóór V1a.

Wat *niet* brak en dus ongewijzigd is overgenomen: de zes F-toestanden, elke regel readout-copy, de delta-templates, de gate-redenen en de reconcile-zinnen.

---

## B · Surface-model

| | VQ | VR | VL |
| --- | --- | --- | --- |
| Rol | meten | begrijpen | oriënteren + doen |
| h1 | de vraag | de conclusie | "Je voedingsbeeld" |
| Readout | — | primair, conclusie = h1 | primair, conclusie = h2 onder de pagina-h1 |
| Clusterrijen | — | max 4 + toon alles | alles uit eetbasis + voedingskwaliteit, open |
| Rail | — | verboden | primair |
| Poort | — | **verboden, ook in F5** | alleen hier, alleen open bij drie voorwaarden |

De scheiding is het product: VR mag nooit iets verkopen, ook niet als de meting het rechtvaardigt. Wie op VR een vergelijk-link zet, verplaatst de poort naar het moment van maximale ontvankelijkheid — en dan is de gate cosmetiek.

---

## C · Visueel — de `.pl-row`-rail

Zes rijen, elk met: 4px statusbalk links · een niet-numeriek statusglyph (gevulde stip, ring, holle ring, streepring, slot dicht, slot open) · naam · toestandwoord · één wacht-regel. Open rij toont kern-copy, acties en — op de aanvullen-rij — de poort.

Toestand → kleur: `nu` terra · `staat` sage · `wacht` gedempt · `dicht` gedempt + streepkader + slot · `ghost` geen accentbalk, streepkader, opacity .72 · `info` neutrale balk.

Toestand → woord: *hier ligt je winst · staat · straks · dicht · nog niet · ter info · open*.

Twee dingen die de slaap-shell hier níet mocht meebrengen: de `pl-tab` met het laagnummer (vervangen door het glyph — zie §I) en de zone-switcher. Wat wél mee moest: `variant: 'full' | 'rail'`, waarbij de rail-variant op ≥860px containerbreedte als sticky leesrail naast de inhoud staat en dezelfde `openRow` deelt. Dat is geen navigatie in de zin van "ergens heen"; het is een index die zegt hoeveel er nog is.

---

## D · Inhoud

**Readout = SSOT.** Eén `renderReadout(ro, variant)`. VR krijgt `variant:'checkin'` (h1 + terra-CTA), VL krijgt `variant:'voortgang'` (h2, stille herhaal-link, plus de vlag *"Zelfde blok als op je check-in resultaat"*). Verifieerbaar: alle vier de tekstdragers — headline, statement, implicatie, delta-regel — komen in beide frames byte-identiek voor. Als readout en rail ooit uiteenlopen is dat een bug, geen nuance.

**Clusterrijen.** VR toont vier, met "toon alles" voor de rest. VL toont alles wat onder de eetbasis en de voedingskwaliteit valt, open, zonder cap — en laat expliciet weg wat hoger ligt, met één regel die naar de rail wijst. Dat voorkomt dat dezelfde meting twee keer op één scherm staat met twee verschillende omlijstingen.

**Poort, drie voorwaarden.** Check gedaan · minstens één gemeten signaal · geen enkel `below` meer in de eetbasis. De derde is de hele truc: zonder die eis zou F1 — eerste check, twee antwoorden onder hun richtlijn — de vergelijk-deur openen op het moment dat de eetbasis nog wankelt. De vijf dichte redenen zijn aantoonbaar verschillend (getest, zie §K).

---

## E · Journeys

**J1 · Eerste check (F1).** VQ 4/13 met disclosure dicht → VR: conclusie, nulpunt-delta N1, vier rijen waarvan twee `below`, één CTA → VL: dezelfde conclusie plus de rail met de eetbasis op `nu` en drie acties → poort dicht met de reden *twee antwoorden onder de populatierichtlijn* → nergens een supplement.

**J2 · Vooruitgang (F2).** VR toont N3 met letterlijke antwoordlabels ("van 1× per dag naar 3× per dag") plus alsoLine → VL houdt de eetbasis op `nu` → poort dicht, nu om een andere reden: *geen enkel antwoord onder een richtlijn, dus niets aan te vullen.*

**J3 · Terugval (F3).** Empathie-opening, N4 met feit vóór duiding → VL krimpt naar **één** actie plus de regel dat de volgende pas komt als deze twee weken staat → geen tweede stap, geen supplement, geen verwijzing naar hoe goed het vorige keer ging.

**J4 · Onderhoud (F4).** Conclusie "volhouden" → `nu` verschuift naar de verhoudingen, eetbasis en kwaliteit staan → poort dicht wegens *geen signaal*.

**J5 · Poort open (F5).** VR ongewijzigd — nul vergelijk-links, geverifieerd → VL: aanvullen-rij open, slot-open-glyph, twee label-only links met elk een reden van maximaal acht woorden, geen prijs, geen merk, geen aanbeveling.

**J6 · Geen check (F6).** VR bestaat niet → VL: CTA naar de check, hele rail in wachtstand, en precies één beweging-koppelregel.

---

## F · De Consumentenbond-keten

Je eetbasis → Voedingskwaliteit → Verhoudingen → Op jouw situatie → Meten & timing → Aanvullen & vergelijken.

De keten doet één ding dat trackers en coaching-apps niet doen: hij **weigert**. De meten-rij zegt letterlijk dat calorieën tellen gereedschap is en geen fundament, zonder knop en zonder "binnenkort". De aanvullen-rij kan meetbaar dicht blijven. Dat is geen bescheidenheid maar de differentiatie: een advies dat je kunt controleren, en een vergelijk-link die je verdient in plaats van voorgeschoteld krijgt.

---

## G · Implementatie-hints voor `src/`

**Eerst één correctie op V1b, vóór V1c begint.** `NutritionCluster.layer` is één waarde per cluster ([lifestyle-pyramid.ts:27](../../src/data/nutrition/lifestyle-pyramid.ts#L27)), maar §D2 verdeelt de rijen ván één cluster over meerdere lagen: C3 levert Eiwitbronnen (laag 1), Visbron (laag 2) én Eiwitritme (laag 3); C4 levert Plantbasis en Vezelbasis, allebei laag 1 maar als twee rijen. **Cluster ≠ rij.** `layer` hoort op de *rij*, niet op het cluster; het cluster blijft de thematische bundel. Zonder die splitsing kan `buildNutritionFactRows` de VL-filter (alleen eetbasis + kwaliteit) niet bouwen en komt Eiwitritme op de verkeerde plek terecht.

**Tweede open punt uit V1a.** De `vegetables`-prompt is nog niet herschreven: [lifescore-questions.ts:173](../../src/data/nutrition/lifescore-questions.ts#L173) zegt nog *"Hoeveel porties magnesiumrijke voeding eet je op een gewone dag?"*. Het `help`-object is wél geland. De herformulering is copy, geen engine-wijziging — `vegFruitPerDay` blijft de magnesium-proxy voeden. Hoort bij V1e.

| Slice | Concreet |
| --- | --- |
| **V1c** | `src/lib/nutrition-conclusion.ts`: `buildNutritionFactRows` met rij-niveau `layer`, plant-equivalentie D3 en opt-out-status. `nutrition-delta.ts` → N1–N7. **Let op:** `nutrition-delta.test.ts` assert letterlijk `"bewoog de goede kant op"` en `"liep iets terug"` — die assertions veranderen mee, ze worden niet omzeild. |
| **V1d** | `NutritionCheckinReadout.tsx` met `variant: "checkin" \| "voortgang"`, spiegel van `MovementCheckinReadout`. `NutritionResultView`: score-h1, supplement-`<details>`, `otherGaps` en `ProteinTargetCard` eruit. Acceptatie: `grep -n "Vergelijk" NutritionResultView.tsx` → nul. |
| **V1e** | Eén `<details>` in `NutritionCapture`, ónder de slider en bóven de nav-rij. Trigger vast: "Waarom vragen we dit?". `helpTitle` staat ín het lichaam, niet in de trigger. `helper` blijft ongewijzigd gerenderd. Neem de vegetables-copyfix mee. |
| **V1f** | `VoedingEetbasisRail.tsx`, voeding-tak naast `isMovement` in `VoortgangDomeinScreen`. **Breedte-val:** de midden-zone is ~744px bij open contextkolom — binnen tegels `@container`/`@[Npx]:`, nooit `lg:`/`xl:`. |
| **V1g** | Poort: `nutritionLogCompleted` **én** ≥1 `below` **én** geen `below` in de eetbasis. Test in het patroon van `statistieken-advies-model.test.ts`. |
| **V1h** | Meetpunten §H. Elk nieuw client-event op drie registratieplekken. |

---

## H · Meetpunten

| Event | Status | Payload | Hier lees je aan af |
| --- | --- | --- | --- |
| `nutrition_log_completed` | hergebruik + 2 params | `has_delta`, `focus_cluster` | Of de clusterindeling de gap-indeling vervangt zonder de afronding te raken. |
| `nutrition_checkin_routing_click` | **nieuw**, vervangt twee | `{ target, surface }` | Welke uitgang op VR wint. `nutrition_result_agenda_cta_click` en `nutrition_result_dashboard_return` gaan hierin op — nu zijn het losse events en dus geen funnel. |
| `nutrition_question_help_opened` | **nieuw** | `{ slider_id }` | De vraag met de meeste opens is de vraag die het slechtst geformuleerd is. |
| `nutrition_layer_action_click` | **nieuw** | `{ layer, action_id }` | Of de rail werkt of alleen mooi is. Blijft dit ~0 terwijl de routing-click wél loopt, dan is VL een leesscherm. |
| `nutrition_supplement_revealed` | **verhuist** | ongewijzigd | Hoe vaak de poort feitelijk opengaat. Vuurt op VL, niet meer op VR. |
| `domain_tool.snapshot_viewed` | hergebruik | `{ domain:"voeding" }` | Terugkeer naar VL los van de check. Regressiewacht. |

Geen PII, geen antwoordlabels in payloads, geen nieuw durable `domain_event`. **Meetpunt bij oplevering:** `nutrition_layer_action_click` tegenover `nutrition_checkin_routing_click{voortgang_voeding}` — daar lees je af of de rail iets doet.

---

## I · Governance — laagnaam versus data-contract

De canon schrijft *"LAAG 1 · Je eetbasis"*; lock L2 verbiedt ordinalen in UI. Beslecht: **de UI toont uitsluitend de naam.** `layer: 1..6` en `NutritionLayerId` blijven bestaan in data en JS — dat is het contract waarop de poort en de filters draaien. De grens loopt exact bij de render: alles wat een gebruiker kan lezen of een screenreader kan voorlezen draagt de naam, nooit het cijfer. Daarom draagt de `pl-tab` een glyph in plaats van het nummer dat slaap v2 daar zet.

---

## J · Copy-lock

**Verboden in gerenderde tekst, aria-labels en eyebrows:** stappenplan · route · fase · spoor · categorie · cockpit · biohack · score op VR · "Laag N" · "Prioriteit N" · "N van 6" · voortgangsbalk over de rail · band · niveau · trede · "bewoog de goede kant op" · "liep iets terug" · tekort · achterstand · pijl als richtingsteken · eindelijk/gelukkig/helaas.

**Toegestaan:** de zes laagnamen · "je eetbasis" · "hier ligt je winst" · letterlijke antwoordlabels · populatierichtlijn / vuistregel / geen norm, nooit door elkaar.

Geverifieerd over 108 render-combinaties (6 toestanden × 6 open rijen × 3 frames): nul treffers.

---

## K · Acceptatiematrix

| | VR bestaat | Delta | `nu` op | Acties | Poort | Gate-reden |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | ja | N1 | eetbasis | 3 | dicht | twee antwoorden onder de richtlijn |
| F2 | ja | N3 + also | eetbasis | 3 | dicht | geen antwoord onder een richtlijn |
| F3 | ja | N4 + also | eetbasis | **1** | dicht | deze check teruggelopen |
| F4 | ja | N5 | verhoudingen | 3 | dicht | geen signaal |
| F5 | ja | N5 + also | verhoudingen | 3 | **open** | bord dekt dit punt niet |
| F6 | **nee** | — | wachtstand | 0 | dicht | geen check |

Machinaal bevestigd: één `<h1>` per frame in alle 108 combinaties · F3 rendert precies één actie, F1 drie · de poort is uitsluitend in F5 open en levert daar exact twee links, elders nul · nul `Vergelijk`/prijs/supplement op VR in elke toestand · vijf unieke gate-redenen · readout-fragmenten identiek op VR en VL · conclusie is `h1` op VR en `h2` op VL.

---

## L · Prebuild-notities

Eén bestand, 145 KB, geen enkel extern verzoek: DM Sans en DM Serif Display staan inline als base64 (patroon uit beweging v3.5). Dubbelklikken werkt offline. Eén state-object `ui` + één `paint()`; alle interactie schrijft naar `ui` en herschildert, zodat de open rij, de facts-toggle en de help-toestand een frame- of toestandswissel overleven. Reviewer-chrome: Frame · Toestand · Breedte (375/1280) · Help VQ, met `aria-pressed` en een statenote per toestand. Responsiviteit uitsluitend via `@container app`; op 1280 verschijnt de sticky leesrail. Geen emoji, geen mock-tracking, geen `.layer` meer in DOM of CSS. Markup-balans van zowel de statische als de gegenereerde HTML gecontroleerd.

---

## M · Open vragen — drie

**M1 · De sectiekop verwijst naar een beeld dat we hebben gesloopt.** "Je eetbasis, van onder naar boven" is letterlijk aangehouden, maar de piramide-geometrie is weg en de eetbasis staat bovenaan. Voor wie de rail voor het eerst ziet klopt de zin niet met wat hij ziet. Voorstel: *"Je eetbasis eerst, de rest daarna"* — zelfde belofte, geen verwijzing naar een verdwenen vorm. Beslissing vóór V1f, want de kop staat in het component.

**M2 · Wat gebeurt er met de eiwitdoel-calculator?** §E zet hem op de verhoudingen-rij achter "meer uitleg" en §B haalt hem van VR af. In deze prebuild is hij één actieregel zonder achterliggend scherm. Wordt dat een disclosure in de rij, of verhuist `ProteinTargetCard` daarheen? Dat verschil raakt V1d (wat er uit `NutritionResultView` sloopt) en V1f (wat erin komt).

**M3 · Is de vraagteller de flow-positie of een label?** `vegetables` staat op positie 1 in `NUTRITION_FLOW`, de prebuild toont 4 van 13. Als de teller de echte positie wordt, valt de eerste vraag samen met de eerste indruk van de check — en dat is de vraag waarvan de formulering nog openstaat (§G). Overweeg de volgorde bij V1e opnieuw te bekijken in plaats van hem als gegeven te nemen.
