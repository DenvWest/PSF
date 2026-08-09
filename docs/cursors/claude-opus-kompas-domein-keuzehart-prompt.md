# Prompt — Kompas-domein: is de keuze-ladder het hart, of blijft het een deur?

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (nieuw gesprek, met repo-toegang).
> **Output:** verdict + contract + slice-volgorde. **Geen code, geen diffs, geen SQL, geen HTML-prebuild.**
> **Opgesteld:** 6 augustus 2026.
> **Aanleiding:** Dennis is het oneens met de richting die het beweging-kompas nu opgaat. Het lopende spoor optimaliseert de dagstap-klik; zijn stelling is dat het domein daarvóór al niet klopt.

## Plaats in de reeks


| Doc                                                                                                                                        | Relatie                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Dit document                                                                                                                               | **Modelvraag** — waar hoort `#b` in de kompas-IA, en geldt dat voor élk domein |
| `[beweging-keuze-consumentenbond-prebuild-v3-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3-2026-08.html)` `#b` / `#e` | Normatieve doel-UI (v3, niet v2)                                               |
| `[claude-opus-beweging-pre-e-audit-prompt.md](claude-opus-beweging-pre-e-audit-prompt.md)`                                                 | Vorige gate; A8 (B-keuzeladder) stond daar op OPEN                             |
| `[claude-opus-beweging-mijn-dag-verdict-2026-08.md](claude-opus-beweging-mijn-dag-verdict-2026-08.md)`                                     | Gelockte agenda-KILL's                                                         |
| `[BESLUIT_BEWEGING_PRODUCT_EN_IA.md](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md)`                                                         | Surface-IA: doe vs advies                                                      |
| `[BESLUIT_FIT_PREFS.md](../design/BESLUIT_FIT_PREFS.md)`                                                                                   | Locks L1–L10: Bond vast, fit sorteert                                          |
| `[beweging-f0-deploy1-status-2026-08.md](beweging-f0-deploy1-status-2026-08.md)`                                                           | Wat live staat en wat geparkeerd is                                            |


## Gebruiksinstructie

1. Open Claude Opus in een **nieuw** gesprek met repo-toegang (niet de chat waarin het preselect-spoor is bedacht — die heeft een sunk cost).
2. Kopieer het volledige blok onder **Prompt (copy-paste)**.
3. Lees eerst sectie **A** (verdict op het lopende spoor) en **H** (tegenspraak). Als A en H elkaar tegenspreken, is het model nog niet af.
4. Pas ná akkoord: aparte implementatie- of prebuild-prompt per slice uit sectie F.

## Wat Dennis vooraf weet (hint, niet als waar aannemen)

- `0afe695` (5 aug) zette voorselectie van de dagkeuze in `MovementTodayHero`; `7d6205b` (6 aug) voegde GA4 `preselected_choice`, `preselect_source` en `accepted_default` toe. Dat meetvenster loopt nú.
- De B-keuzeladder bestaat niet in `src/` — geen catalogus, geen oordeel-UI, geen optie-Favorieten.
- `energie` en `herstel` hebben geen cockpit (`DomainSoonScreen`).
- Premium is dark-launch: `DARK_LAUNCH = true`, `isMember` wordt nergens `true` doorgegeven.

---

## Prompt (copy-paste)

```text
## Rol
Je bent senior product-architect + UX-lead voor PerfectSupplement (perfectsupplement.nl),
de Consumentenbond van leefstijldomeinen voor mannen 40+.

Je levert een VERDICT met een contract en een slice-volgorde. Je schrijft GEEN code,
GEEN JSX, GEEN SQL, GEEN Tailwind, GEEN HTML-prebuild. Output in het Nederlands;
bestandspaden, tabelnamen en event-namen in het Engels.

Je bent hier niet om mee te bewegen. Dennis heeft een stelling; jij toetst die aan de
repo en aan de gelockte besluiten, en je zegt het als hij ongelijk heeft.

## De stelling die je toetst (niet: de opdracht die je uitvoert)

Dennis zegt, letterlijk:

  "Ik ben het niet eens met hoe het nu gaat vanuit kompas-domein (beweging). Wat er nu
  staat ziet er niet uit en het werkt niet. Ik wil scherm #b uit de prebuild juist
  vanuit het kompas-domein sterk hebben. Door de keuze-ladder daar neer te zetten
  krijgen mensen de eerste keuze-aanbeveling van wat ze kunnen gaan doen — nu gratis,
  later premium. Zo kan ik dit met elk domein doen. En de koppeling met Mijn Dag en
  mail moet dagelijkse check-in-vragen en instelbare reminders gaan versterken."

Drie beweringen zitten daarin. Behandel ze apart, want ze kunnen los waar of onwaar zijn:

  S1  De keuze-ladder (#b) hoort het HART van het kompas-domein te zijn, niet een deur
      achteraf.
  S2  Datzelfde model moet domein-agnostisch zijn: slaap, stress, voeding, verbinding
      krijgen hetzelfde patroon, met beweging als pilot.
  S3  Mijn Dag + e-mail zijn geen aparte features maar de versterkingslus onder S1:
      ze voeden de dagelijkse check-in-vraag en instelbare reminders.

## Context — verifieer in de repo, neem niets aan

Docs (lock; heronderhandelen mag alleen met expliciete PIVOT-markering + wat er kapotgaat):
- docs/design/beweging-keuze-consumentenbond-prebuild-v3-2026-08.html
  → v3 is normatief, NIET v2. Secties #s-a (eerste keer), #s-e (elke dag daarna),
    #s-b (maak een keuze), #s-c (gekozen + premium "Sterk na 40"), #s-d (Mijn Dag).
- docs/design/BESLUIT_FIT_PREFS.md — locks L1 t/m L10.
- docs/design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md — doe-surface vs advies-surface,
  stepped care, kill-list, meetplan (sectie H), roadmap F1/F2/F3.
- docs/cursors/claude-opus-beweging-mijn-dag-verdict-2026-08.md — agenda-KILL's.
- docs/cursors/claude-opus-beweging-pre-e-audit-prompt.md — gap-matrix A1..A9;
  A8 (B-keuzeladder live?) stond op OPEN.
- docs/cursors/beweging-f0-deploy1-status-2026-08.md — wat live staat, wat geparkeerd is.
- docs/core/VERWERKINGSREGISTER.md — privacy-gate.

Code (minimaal openen, en citeer bestand:regel als bewijs):
- src/app/dashboard/page.tsx            (kompas is een tab, geen route)
- src/lib/dashboard-url.ts              (buildDashboardVandaagHref, ?tab=vandaag&kompas=)
- src/components/dashboard/Dashboard.tsx (KompasHome, domainView, DomainSoonScreen)
- src/components/dashboard/kompas/KompasHomeCard.tsx
- src/components/dashboard/BewegingScreen.tsx
- src/components/dashboard/beweging/MovementCockpit.tsx
- src/components/dashboard/beweging/MovementTodayHero.tsx
- src/lib/movement-today-choices.ts     (tiers herstel/matig/trainen, aanbevolen-kind)
- src/lib/kompas-domain-actions.ts      (wat een domein nu als actie aanbiedt)
- src/lib/context-rail.ts               (KOMPAS_RAIL_PILLAR_IDS)
- src/lib/domain-role.ts                (interventie vs readout: energie/herstel)
- src/data/dashboard/index.ts           (PILLARS, DASHBOARD_TABS, TAB_SECTIONS,
                                         PILLAR_CHECKIN_ROUTES)
- src/lib/day-model.ts                  (dagstap, actionKey, tijd-resolutie)
- src/lib/daily-action-log.ts + src/app/api/account/daily-log/route.ts
- src/app/api/account/priority-pref/route.ts (set_movement_day_choice, accepted_default)
- src/lib/entitlement-access.ts + src/lib/db/entitlements.ts (DARK_LAUNCH, trends/coach/q2)
- src/lib/events.ts                     (DOMAIN_EVENT_TYPES — de volledige lijst)
- src/lib/intake-events-client.ts, src/lib/account-events-client.ts,
  src/app/api/intake/events/route.ts, src/app/api/account/events/route.ts (allowlists)
- src/lib/nurture.ts, src/lib/nurture-cron.ts, src/lib/intake-reminder-cron.ts,
  src/lib/email-templates/nurture/ (bestaande mailmotor)

Vaststaande situatie die je mag verifiëren maar niet hoeft te herontdekken:
- Kompas = /dashboard?tab=vandaag&kompas=<domein>. Geen eigen route.
- De B-keuzeladder bestaat NIET in src/. Wat er staat is een drie-tier dagkeuze
  (herstel / matig / trainen) met een "Aanbevolen"-badge, plus een programma-sheet.
- Er is GEEN generieke dagelijkse check-in. Wel periodieke domeinchecks
  (/intake/slaap, /intake/stress, /intake/beweging, /intake/voeding) en één
  pulse-variant op beweging (RCV_FEEL).
- daily_action_log is de enige completie-bron. agenda_blocks.status is een apart
  grootboek en telt NIET als dagstap gedaan.
- Reminders vandaag: intake_reminders (dag 30) + nurture-sequence (dag 0/3/7/14/21/30),
  beide via cron + Resend. Een dagelijkse e-mailnudge (F1b) bestaat niet.
- Premium: entitlements trends/coach/q2 bestaan in schema; DARK_LAUNCH=true en
  isMember is nergens true. Alles loopt nu via de premium-waitlist.

## Het lopende spoor waar je een oordeel over MOET geven

Twee commits van de afgelopen 48 uur:
- 0afe695 "voorselectie van dagkeuze op de gekozen dagstap" — MovementTodayHero toont
  één voorgestelde stap in plaats van een lege keuzelijst; overnemen schrijft
  acceptedDefault mee in dashboard.movement_day_choice_set.
- 7d6205b "GA4-meetpunten voor voorselectie-effectiviteit" — preselected_choice,
  preselect_source (checkin|plan), accepted_default.

De voorgestelde vervolgstap was: 7–14 dagen meten, dan een "trefzekerheid-readout"
(wij beoordelen onszelf), dan pas "Meer hulp" met een budget-as als vaste sortering.
De bijbehorende bewakingsvraag was: als accepted_default stijgt maar het aantal regels
in daily_action_log vlak blijft, is er een klik weggehaald en geen gedrag veranderd.

Jij moet zeggen of dat spoor overeind blijft naast S1, of eronder valt, of erbovenop
hoort. Niet allebei laten staan.

## Gevraagde output — exact deze secties, in deze volgorde

### A. Verdict op het lopende preselect-spoor
Eén woord: DOORZETTEN | HERORDENEN | PARKEREN. Daarna max 10 regels onderbouwing met
bewijs uit bestand:regel. Beantwoord expliciet:
- Meet de preselect-metriek iets wat blijft gelden als #b het hart wordt, of meet hij
  een surface die je gaat vervangen?
- Wat gebeurt er met het lopende meetvenster als #b eroverheen landt (attributie)?
- Is de trefzekerheid-readout een gratis-versterker van S1, of een substituut ervoor?
- Leg de bewakingsgrens accepted_default × daily_action_log hard vast, of verwerp hem
  met reden. Geen derde optie.

### B. Surface-model — waar landt #b
Beschrijf het kompas-domein als staten, niet als pagina's. Minimaal:
first-run (net na de check) · doe-staat open · doe-staat klaar · keuze-staat.
Voor elke staat: wat is de ENE vraag in de first viewport op 375px, en wat mag er
absoluut niet in staan.

Kies expliciet tussen deze twee modellen en verdedig de keuze:
  B1  #b is een eigen staat binnen dezelfde kompas-domein-surface (deur, maar rijk)
  B2  #b IS de domein-surface bij eerste bezoek, en de doe-staat is wat je daarna ziet
Zeg wat er kapot gaat bij de andere keuze. Geen "het hangt ervan af".

Toets daarbij BESLUIT_FIT_PREFS L4 (fit hoort op keuzemoment, niet in dag-0-intake)
en de regel dat er geen fit-paneel op de doe-surface komt.

### C. Domein-agnostisch contract (verplicht tabel)
Kolommen: Element | Gedeeld (component/lib) | Per domein (data) | Wie levert de data |
Beweging nu | Slaap/stress/voeding/verbinding straks.

Rijen minimaal: basisadvies · keuze-catalogus · verdict-niveaus (gecheckt/sterk/zwak/niet) ·
fit-lens (Voor jou / Bij jou) · rol van een optie (aanvulling vs vervanging van de basis) ·
Favorieten · koppeling naar Mijn Dag · dagelijkse vraag · meetpad (review / 14d / 30d).

Beantwoord daarna hard:
- Welke domeinen kunnen dit contract dragen zonder catalogus-inhoud, en welke niet?
  (verbinding heeft geen eigen check; energie en herstel zijn readout-domeinen)
- Wat is het MINIMUM aan catalogus-inhoud per domein voordat #b eerlijk is en niet
  een leeg schap? Geef een getal en een ondergrens per verdict-niveau.
- Waar zit het punt waarop dit contract een redactionele bottleneck wordt in plaats
  van een productvoordeel?

### D. Gratis-premium-grens (verplicht tabel)
Kolommen: Element | Gratis nu | Premium later | Nooit premium | Waarom.

Randvoorwaarden die je moet respecteren:
- Het Consumentenbond-oordeel zelf mag nooit achter een betaalmuur. Zeg het als je
  vindt dat dat commercieel niet houdbaar is.
- Bestaande entitlements zijn trends / coach / q2. Stel geen vierde voor tenzij je
  aantoont dat de bestaande drie niet passen.
- DARK_LAUNCH staat aan en isMember is nergens true: elk premium-voorstel moet zeggen
  wat de gratis staat toont zolang niemand toegang heeft.
- Geen dormant of feature-gated component activeren zonder meetpunt in dezelfde slice.

Beantwoord: wat is het ENE ding dat premium waard is als het oordeel gratis blijft?
Eén antwoord, geen menu van vijf.

### E. De versterkingslus — Mijn Dag, dagelijkse vraag, reminders
Beschrijf hoe een gemaakte keuze uit #b doorwerkt in:
1. Mijn Dag (agenda) — binnen de gelockte KILL's:
   · programma-dosis → automatisch agenda_blocks = KILL
   · agenda_block telt als dagstap gedaan = KILL
   · dagstap → automatisch een tijd zonder expliciete gebruikerstijd = KILL
   · step_id op agenda_block als waarheid = KILL
   · tweede completie-bron naast daily_action_log = KILL
2. De dagelijkse check-in-vraag: wat is de vraag, hoe vaak, en wanneer STOPT hij?
   Onderscheid scherp tussen gedragslog (daily_action_log, gedaan ja/nee) en
   ervaringsvraag (merk je er iets van, 1–5). Zeg welke van de twee dagelijks mag
   zijn en welke niet, en waarom.
3. Instelbare reminders: welke as is instelbaar (kanaal, tijd, frequentie, per domein
   of globaal), en wat is de kleinste versie die al waarde heeft. Bestaande haakjes:
   account_priority_pref.scheduled_time, time_bucket, en de nurture/reminder-cron.
   Web-push en agenda-import staan op de parklijst; heropen ze niet zonder PIVOT.

Privacy-gate, expliciet beantwoorden: de review 1–5 staat geparkeerd op
register/art. 9. Is een ervaringsvraag over een leefstijldomein een bijzondere
persoonsgegeven-verwerking of niet, en wat moet er in VERWERKINGSREGISTER.md staan
voordat dit live mag? Als je het niet zeker weet, zeg dat en noem de gate.

### F. Slice-volgorde met attributie (verplicht tabel)
Kolommen: # | Slice | Wat erin zit | Wat er expliciet NIET in zit | Waarom dit niet
samen mag met de vorige/volgende deploy | Losse meetbaarheid.

Regel: geen twee conversie-gevoelige surface-wijzigingen in één deploy zonder dat hun
effect los af te lezen is. Maximaal 5 slices. Slice 1 moet klein genoeg zijn om binnen
één review te landen.

Zeg ook: wat parkeer je dat vandaag al half gebouwd is, en accepteer je daarmee als
weggegooid werk?

### G. Meetplan per slice
Per slice: welk bestaand event-type je hergebruikt (kies uit DOMAIN_EVENT_TYPES in
src/lib/events.ts vóór je iets nieuws verzint), en pas als er echt niets past: welk
nieuw type, en op welke drie plekken het geregistreerd moet worden
(src/lib/events.ts + de client-union + de allowlist in de events-route).
Onderscheid durable domain_events van GA4 trackEvent en Clarity-tags, en zeg per
meetpunt welke laag hem draagt en waarom.

Noem per slice de ENE metriek die zegt of de slice werkte, en de ENE metriek die zegt
of hij schade doet. Geen dashboards van tien getallen.

Let op de consent-bias: client-side durable events worden gedropt zonder
analytics-consent, dus funnel-ratio's gelden alleen binnen het consented cohort.

### H. Tegenspraak (verplicht, geen instemming)
Schrijf het sterkste argument TEGEN S1, S2 en S3 — niet een strawman. Minimaal:
- Waarom zou een keuze-etalage vóór de doe-staat de dagelijkse herhaling kunnen
  ondermijnen die het hele meetpad draagt?
- Wat is de kans dat een domein-agnostisch contract een leeg schap oplevert bij
  slaap, stress en verbinding, en wat kost dat aan geloofwaardigheid?
- Onder welke concreet waarneembare voorwaarde heeft Dennis ongelijk en moet hij
  terug naar het preselect-spoor? Formuleer die als een toetsbare drempel.

Sluit af met één zin: wat is jouw eigen aanbeveling, los van wat Dennis wil.

## Constraints
- Geen code, geen diffs, geen migratie-SQL, geen JSX, geen HTML-prebuild.
- Verzin geen schermstaat en geen bestandsnaam; baseer alles op de repo. Wat je niet
  kon verifiëren label je als AANNAME.
- Locks uit BESLUIT_FIT_PREFS.md (L1–L10) en de agenda-KILL's niet heronderhandelen
  zonder de kop PIVOT + reden + wat er kapotgaat.
- Nooit een samengevoegd fit×bond-cijfer. Bond-oordeel vast, fit sorteert en filtert.
- Geen medische claims, geen diagnose-taal in voorgestelde copy.
- Nederlandse UI-strings in voorbeeldcopy; Engelse identifiers.
- Geen essay vóór sectie A. Begin met het verdict.

## Acceptatiecriterium
- [ ] A begint met één woord: DOORZETTEN | HERORDENEN | PARKEREN
- [ ] A legt de bewakingsgrens accepted_default × daily_action_log vast of verwerpt hem
- [ ] B kiest expliciet B1 of B2 en zegt wat er bij de andere keuze kapotgaat
- [ ] C is een tabel en noemt het minimum aan catalogus-inhoud per domein als getal
- [ ] D noemt precies één ding dat premium waard is
- [ ] E beantwoordt de privacy-gate over de ervaringsvraag
- [ ] F heeft maximaal 5 slices, elk met losse meetbaarheid
- [ ] G noemt per slice één succes- en één schade-metriek
- [ ] H bevat een toetsbare drempel waarop Dennis ongelijk heeft
- [ ] Geen enkele regel code in het antwoord

## Verificatie
Voor je stopt: loop A t/m H terug langs de bestanden die je noemt en controleer dat
elk pad, elk event-type en elke tabelnaam echt in de repo bestaat. Noem geen enkel
event-type dat niet in DOMAIN_EVENT_TYPES staat zonder het expliciet als NIEUW te
markeren met de drie registratieplekken erbij.

Geen git commit. Geen patches. Geen implementatie.
```

---

## Na dit verdict

Pas ná akkoord op A t/m F volgt de vervolgprompt, en dan één per slice:

1. Dit verdict → GO op een model (B1 of B2) en op slice 1
2. Eventuele v4-prebuild — alleen als sectie B een surface voorstelt die visueel niet
  uit v3 af te leiden is
3. Implementatie-prompt slice 1 — nooit samen met de agenda- of mail-lus
4. Privacy/register-update vóór de ervaringsvraag of een nieuwe reminder-as live gaat

**Meetpunt van dit document zelf:** geen. Dit is een besluitstuk, geen codewijziging.
Het meetplan dat eruit komt (sectie G) hoort bij de slices, niet bij deze prompt.