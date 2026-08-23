# Opus-verdict — Voortgang, leefstijlprofiel en de domeinen als één reis

> **Datum:** 23 augustus 2026 · besluitronde, geen bouwronde.
> **Getoetst tegen:** `main` + de niet-gecommitte werkboom van 23 augustus (27 gewijzigde bestanden).
> **Bindend gelezen:** [`BEWEEG_COCKPIT_FUTURE_YOU.md`](../plan/BEWEEG_COCKPIT_FUTURE_YOU.md) besluit 4 + §7 ·
> [`PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md`](../plan/PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md) §2/§4 ·
> [`PLAN_FUNCTIONELE_CAPACITEIT_PROGNOSE.md`](../plan/PLAN_FUNCTIONELE_CAPACITEIT_PROGNOSE.md) §1-§3 ·
> [`KOMPAS_SIDEBAR_ROADMAP_2026-08.md`](KOMPAS_SIDEBAR_ROADMAP_2026-08.md) §1/§4/§7 (VAST) ·
> [`claude-opus-kompas-sidebar-keuzehart-verdict-2026-08.md`](claude-opus-kompas-sidebar-keuzehart-verdict-2026-08.md) §C/§D/§E ·
> [`claude-opus-beweging-mijn-dag-verdict-2026-08.md`](claude-opus-beweging-mijn-dag-verdict-2026-08.md) §A1 KILL #7/#8.
> **Geen kop `PIVOT` in dit document.** Alles hieronder past binnen de getekende contracten.

---

## Zes as-built correcties — lees dit vóór je de stellingen leest

De as-built in de prompt is van vóór commit `a0174caa` (22 augustus, 15:24) en vóór de huidige werkboom.
Drie van de zes stellingen leunen op onderdelen die niet meer bestaan. Corrigeer de citaten, niet de richting.

**C-a · `VoortgangRichtingBeat` bestaat niet meer.** Verwijderd in `a0174caa` als "ongebruikt", samen met
`VoortgangOverTijdSection` en `LeefstijllijnSection`. Het drie-anker-narratief staat dus **niet** onder de vouw op
Voortgang — het staat op **Kompas home**, in
[`FocusVoortgangPanel.tsx:143-163`](../../src/components/dashboard/kompas/FocusVoortgangPanel.tsx)
(`Start {baseline}` · score + band · `Doel {target} · {nextBand.label}`), voor het prioriteitsdomein, precies zoals
[`PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md`](../plan/PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md) §2 het voorschreef.
Gevolg voor S1: de tweede helft van de stelling ("VoortgangBewijsband en VoortgangRichtingBeat worden herverdeeld")
heeft geen tweede term.

**C-b · `MetingenCard` staat niet twee keer, maar nul keer.** Hij hangt onder `VitalityScoreSection`
([`Dashboard.tsx:600`](../../src/components/dashboard/Dashboard.tsx)), en die sectie is onbereikbaar: het sectietype
`vitalityScore` staat in `DASHBOARD_SECTIONS` ([`data/dashboard/index.ts:300`](../../src/data/dashboard/index.ts))
maar in géén enkele `TAB_SECTIONS`-lijst ([`:352-357`](../../src/data/dashboard/index.ts) — `voortgang:
["voortgangHub"]`). De lege-tak filtert diezelfde lijst ([`Dashboard.tsx:3134-3137`](../../src/components/dashboard/Dashboard.tsx))
en rendert bovendien `EmptyTabState` ([`:3455`](../../src/components/dashboard/Dashboard.tsx)). De tweede vindplaats
in `LeefstijlprofielKeuzeHub` is in `a0174caa` verwijderd. Dit is dus geen doublure maar dood hout.

**C-c · De leefstijllijn staat nergens meer dubbel.** Beide hosts zijn weg (C-a). Wat leeft is
`buildLeefstijllijnRows` ([`leefstijllijn.ts:66`](../../src/lib/leefstijllijn.ts)), gebruikt voor één sparkline per
domein op het domeinscherm ([`LeefstijlprofielDomeinScherm.tsx:184`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx))
en op Kompas-domein ([`DomainKompasScreen.tsx:77`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)).

**C-d · De derde ladderpresentatie is al gesneuveld — in de werkboom, nog niet gecommit.** De compacte
`DomainLifestyleLadder` in "Je stand" is eruit; `PrioriteitenLadder` staat er nu in `variant="explain"`
([`LeefstijlprofielDomeinScherm.tsx:441-471`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx),
kopcommentaar `:47-67`). Na deze wijziging rendert `DomainLifestyleLadder` nog uitsluitend op Kompas-domein
([`DomainKompasScreen.tsx:130`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)) en `PrioriteitenLadder`
uitsluitend op Voortgang-domein. S5 is dus grotendeels geland vóór deze ronde begon.

**C-e · De domeinrij staat drie keer, niet vier.** Kompas home `DomainMeterBar`
([`KompasHomeCard.tsx:417-520`](../../src/components/dashboard/kompas/KompasHomeCard.tsx), vijf rijen) ·
Voortgang-hub `DomainRow` ([`VoortgangDomeinRing.tsx:54-225`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx),
vijf interventie + twee readout) · Leefstijlprofiel-landing
([`LeefstijlprofielKeuzeHub.tsx:86-127`](../../src/components/dashboard/voortgang/LeefstijlprofielKeuzeHub.tsx), vijf rijen).
De vierde die de prompt telt (Kompas-home én `KompasRings`) is dezelfde surface.

**C-f · Er is een vierde doublure die de prompt niet noemt, en een onbereikbare noemer.** Het eigen ijkpunt staat
drie keer: de hub-rij ([`VoortgangDomeinRing.tsx:186-222`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)),
het domeinscherm voor slaap en beweging
([`LeefstijlprofielDomeinScherm.tsx:428-429`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx))
en elke check-in-uitslag ([`SleepCheckin.tsx:258`](../../src/components/intake/SleepCheckin.tsx) ·
[`StressCheckin.tsx:258`](../../src/components/intake/StressCheckin.tsx) ·
[`NutritionResultView.tsx:340`](../../src/components/intake/NutritionResultView.tsx)). En de dekkingsregel
*"Je hebt N van de 7 domeinen apart gemeten"*
([`VoortgangDomeinRing.tsx:33-51`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)) kan haar maximum
nooit halen: alleen vier domeinen hebben een check-route
([`kompas-domain-check.ts:15-20`](../../src/lib/kompas-domain-check.ts)), en verbinding, energie en herstel krijgen
nooit een `domainCheckDaysAgo`-entry ([`account-dashboard.ts:714-728`](../../src/lib/account-dashboard.ts)). De regel
meldt structureel een tekort dat de gebruiker niet kan wegwerken.

---

## A. Verdict per stelling

> **Totaaloordeel in één regel:** de richting klopt — één vraag per surface, en de kengetallen naar boven — maar drie
> van de zes stellingen leunen op een as-built die op 22 augustus al is opgeruimd; wat er écht ligt is één echte
> doublure (de domeinrij, drie keer), één echt gat (een landing zonder één getal uit de check), en één claim die
> vandaag niet eerlijk te maken is (de 4–6-weken-horizon).

| # | Stelling | Verdict |
|---|---|---|
| S1 | Hero naar drie-anker-narratief | **REFINE** |
| S2 | Horizon van 4–6 weken per domein | **PARKEER** |
| S3 | Landing wordt vierkanten met 2–4 kengetallen | **REFINE** |
| S4 | Eén vraag per surface, doublures sneuvelen | **REFINE** |
| S5 | Domeinscherm lost de tegel in, geen derde ladder | **GO** |
| S6 | Geen nep-diepte waar de check niets meet | **GO** |

### S1 · De hero stapt naar het drie-anker-narratief — **REFINE**

**Wat klopt.** De hero draagt vandaag een dagteller die het verkeerde ding meet voor deze tab. `activeDays` komt uit
`daily_action_log` ([`daily-action-log.ts:141-152`](../../src/lib/daily-action-log.ts)) — dat is de
Mijn Dag-waarheid, en de eyebrow `BEWIJS · DAG {n}` ([`VoortgangHero.tsx:98`](../../src/components/dashboard/voortgang/VoortgangHero.tsx))
zet hem als kop boven een tab die over tijd gaat. Bovendien zegt de geruststellingsregel
([`:28-33`](../../src/components/dashboard/voortgang/VoortgangHero.tsx)) in drie van de vier standen hetzelfde als de
H1 erboven ("Er ligt nog te weinig om iets te lezen" / "Twaalf dagen is kort").

**Waarom niet GO.** Het drie-anker-narratief is **per domein** geschreven (doelnarratief §2: `row.score - row.delta`
→ `row.score` → `getNextVitalityBand(row.score)`) en is in §5 van datzelfde plan expliciet aan **Kompas home**
toegewezen. Het staat daar ook gebouwd (C-a). Een hero met vijf ankerregels is de domeinrij voor de vierde keer; een
hero met één ankerregel is `FocusVoortgangPanel` voor de tweede keer.

**De refine.** De hero draagt op Voortgang alleen anker 3 — *wanneer wordt dit leesbaar* — en niets van anker 1 en 2.
Die twee wonen waar de getallen al staan: op de Kompas-rij en in "Je stand" op het domeinscherm. De dagteller
verhuist naar de band, waar hij al staat
([`voortgang-bewijsband.ts:120-124`](../../src/lib/voortgang-bewijsband.ts): *"{activeDays} dagen waarop je iets
pakte deze cyclus"*). Uitwerking in §C.

### S2 · Horizon van 4–6 weken per domein — **PARKEER**

**Bewijs dat het vandaag niet kan.** Er staat nergens in `src/` een effectgrootte per actie of per laag. De enige
getallen met een bron zijn richtlijnen op *inname/frequentie*, niet op *verandering*:
[`movement-checkin/index.ts:584-608`](../../src/data/movement-checkin/index.ts) (WHO 2020, twee van acht rijen) en
[`sleep-checkin-readout.ts:48`](../../src/lib/sleep-checkin-readout.ts) (één van acht rijen, zonder `source`-veld).
Een regel *"wat je keuze in 4–6 weken kan verschuiven"* is daarmee ofwel verzonnen ofwel een geïndividualiseerde
prognose — de claim-klasse die
[`PLAN_FUNCTIONELE_CAPACITEIT_PROGNOSE.md`](../plan/PLAN_FUNCTIONELE_CAPACITEIT_PROGNOSE.md) §2 achter een
evidence-audit heeft gezet.

**En het ritme klopt ook niet.** "4–6 weken" is 28–42 dagen. De app kent 30 (`CYCLE_LENGTH`,
[`voortgang-bewijsband.ts:4`](../../src/lib/voortgang-bewijsband.ts); de hermetingsdatum is `+30` dagen,
[`account-dashboard.ts:762-765`](../../src/lib/account-dashboard.ts)) en 14
([`kompas-domain-check.ts:9`](../../src/lib/kompas-domain-check.ts)). Beide zijn **gedateerd voor deze gebruiker**;
"4–6 weken" is een venster dat geen enkele surface op een datum kan zetten.

**Toetsbare drempel waarop S2 terugkomt.** Twee voorwaarden, allebei nodig:
1. Elke laag van het domein in kwestie draagt minstens één `LadderEvidenceRow` met een gevulde `benchmarkSource`
   ([`domain-ladder-readout.ts:44-52`](../../src/lib/domain-ladder-readout.ts)). Vandaag: beweging 2 van 6 lagen,
   slaap 0 van 6 (labels zonder bron), stress 0 ([`:233`](../../src/lib/domain-ladder-readout.ts)), voeding en
   verbinding niet van toepassing ([`:240`](../../src/lib/domain-ladder-readout.ts)).
2. De evidence-audit uit `PLAN_FUNCTIONELE_CAPACITEIT_PROGNOSE.md` §2 is afgerond voor de claims die de regel draagt.

De kleinste versie die vandaag wél kan, staat in §D.

### S3 · De landing wordt vierkanten met 2–4 kengetallen — **REFINE**

**Wat klopt, hard.** De landing toont vandaag geen enkel getal uit een domeincheck. Wat er staat is een scorebolletje
([`LeefstijlprofielKeuzeHub.tsx:102-110`](../../src/components/dashboard/voortgang/LeefstijlprofielKeuzeHub.tsx)),
één statuszin die over de roadmap gaat in plaats van over de gebruiker (*"Leefstijlkeuze volgt — beweging is de
blauwdruk"*, [`:113-117`](../../src/components/dashboard/voortgang/LeefstijlprofielKeuzeHub.tsx)) en een chevron.
De kengetallen liggen berekend en ongebruikt: `factRows` op `sleepCheckinSnapshot` en `movementCheckinSnapshot`
([`types/dashboard.ts:291-292`](../../src/types/dashboard.ts)), `nutritionIntake.items` met band per nutriënt
([`account-dashboard.ts:445-463`](../../src/lib/account-dashboard.ts)), `stressCheckinReport`
([`types/dashboard.ts:295`](../../src/types/dashboard.ts)).

**Waarom niet GO.** "Één vierkant per domein met 2–4 kengetallen" is onwaar voor twee van de vijf: verbinding heeft
één intake-vraag die tegelijk de hele domeinscore is, en energie/herstel hebben per definitie geen eigen check
([`domain-role.ts:20-23`](../../src/lib/domain-role.ts)). Vier of vijf gelijke vierkanten waarvan er twee met copy
gevuld zijn, is precies de nep-diepte die S6 verbiedt.

**De refine.** De landing wordt een gemengd raster: gemeten domeinen krijgen het kengetal-blok, ongemeten domeinen
krijgen een blok van dezelfde maat met een andere inhoud — geen kengetal, wel de check als enige actie. Contract in
§E. En het is geen vierkant maar een blok over de volle breedte; zie §H.

### S4 · Eén vraag per surface, en de doublures sneuvelen — **REFINE**

**De richting is juist.** De rollen-tabel in [roadmap §1](KOMPAS_SIDEBAR_ROADMAP_2026-08.md) heeft geen rij voor de
Voortgang-**hub** — alleen voor "Voortgang profiel". Dat gat is de reden dat de hub vandaag alles doet: hero, band,
domeinrijen, dekking en het eigen ijkpunt. §B vult die rij in.

**De lijst klopt niet meer.** `MetingenCard` staat nul keer (C-b), de leefstijllijn nul keer (C-c). Wat overblijft is
de domeinrij drie keer (C-e) plus twee die de prompt niet noemt: het eigen ijkpunt drie keer en de onbereikbare
dekkingsnoemer (C-f). Sanering in §F.

### S5 · Het domeinscherm is de derde laag, zonder derde ladder — **GO**

Al geland in de werkboom (C-d). Na commit rendert elke ladder-presentatie op precies één surface, met een rol die in
één zin uit te leggen is (§G). Wat nog ontbreekt is het contract *wat het scherm toevoegt bovenop de tegel* — dat is
§G, en het is copy plus volgorde, geen nieuwe component.

Eén restgat: de terugweg naar de winst-laag ("Terug daarheen") bestaat nog op Kompas
([`DomainKompasScreen.tsx:147-159`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)) maar niet meer op
Voortgang, terwijl de ladder daar wél van de focus-laag kan afdwalen via `pickedLayer`
([`LeefstijlprofielDomeinScherm.tsx:225-226`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)).

### S6 · Geen nep-diepte waar de check niets meet — **GO**

Dit is al de huisregel, machinaal geformuleerd: `resolveLadderLayerReason` geeft `null` waar er geen reden is
([`domain-ladder-readout.ts:69-88,99-126`](../../src/lib/domain-ladder-readout.ts)), en het zijbalk-verdict §D legt
de eerlijke lege plek vast. Eén correctie op de prompt: **stress hoort niet in het lege rijtje.** `evidenceByLayer`
is leeg *per laag*, maar de twee antwoorden zelf staan er wel — `STR_FREQ` en `STR_RCV` met hun labels
([`data/stress-checkin/index.ts:19-41`](../../src/data/stress-checkin/index.ts)). Stress krijgt dus twee kengetallen zonder
richtlijn; verbinding, energie en herstel krijgen geen kengetal. Uitwerking in §E.

---

## B. Surface-contract

Vijf surfaces, elk één vraag. Rij 2, 4 en 5 zijn ongewijzigd t.o.v. [roadmap §1](KOMPAS_SIDEBAR_ROADMAP_2026-08.md);
rij 1 wordt aangescherpt en rij 3 wordt **toegevoegd** — die rij ontbrak. Geen `PIVOT`.

| Surface | De ene vraag | Wat blijft | Wat eraf gaat | Waar het naartoe verhuist |
|---|---|---|---|---|
| **Kompas home** | *Waar sta ik vandaag, en waar werk ik aan?* | Ringen · vijf `DomainMeterBar`-rijen mét score, delta en startmarkering ([`KompasHomeCard.tsx:417-520`](../../src/components/dashboard/kompas/KompasHomeCard.tsx)) · het focusblok met start→nu→doel ([`FocusVoortgangPanel.tsx:143-163`](../../src/components/dashboard/kompas/FocusVoortgangPanel.tsx)) · milestone · `KompasKeuzeSectie` | Niets deze ronde | — (dit is de enige plek waar het drie-anker-narratief hoort, doelnarratief §5) |
| **Kompas domein** | *Wat past op déze laag?* | `DomainKompasHead` + `DomainLifestyleLadder` als navigator + `DomainFreeActionsTile` + CTA-stapel | Niets deze ronde | — |
| **Voortgang hub** *(nieuwe rij)* | *Waar loopt dit heen — wanneer weet ik meer?* | Hero met het meetmoment (§C) · `VoortgangBewijsband` als tijd-as · dekking · één regel per domein met **meetversheid en je eigen ijkpunt** | Score, sparkline, bandlabel en `DeltaBadge` uit de domeinrij ([`VoortgangDomeinRing.tsx:148-171`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)) · de dagteller uit de eyebrow ([`VoortgangHero.tsx:98`](../../src/components/dashboard/voortgang/VoortgangHero.tsx)) | Score/delta staan al op Kompas home en in "Je stand"; de dagteller staat al in de band-caption ([`voortgang-bewijsband.ts:122`](../../src/lib/voortgang-bewijsband.ts)) |
| **Leefstijlprofiel landing** | *Wat weet ik van mezelf, per domein?* | Terugknop · sectiekop · vijf domeinblokken | De scorebubbel ([`LeefstijlprofielKeuzeHub.tsx:102-110`](../../src/components/dashboard/voortgang/LeefstijlprofielKeuzeHub.tsx)) · de roadmap-statuszin ([`:113-117`](../../src/components/dashboard/voortgang/LeefstijlprofielKeuzeHub.tsx)) · de chevron als enige inhoud | Score → Kompas home + "Je stand"; de statuszin verdwijnt zonder vervanging (hij zegt niets over de gebruiker) |
| **Leefstijlprofiel domein** | *Waarom staat dat er zo bij?* | "Je stand" (gauge, band, sparkline, meetdatum) · conclusiezin · álle feitenrijen · `PrioriteitenLadder` in `explain` · dekking · route-strip · `MijnKeuzeSectie` | De tweede `DomeinIjkpuntCheckPrompt` ([`:428-429`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)) | IJkpunt woont op de hub-rij (cross-domein) en op de check-uitslag (zetmoment) |

**De leesvolgorde die hieruit valt:** hub zegt *wanneer*, landing zegt *wat*, domeinscherm zegt *waarom*, Kompas zegt
*wat nu*. Vier vragen, vier surfaces, geen enkele twee keer.

---

## C. Hero-herkadering

### Welke standen overleven

Geen van de vier. Niet omdat ze fout zijn, maar omdat hun **as** verandert: `buildVoortgangBewijsRegel`
([`voortgang-bewijs-copy.ts:19-72`](../../src/lib/voortgang-bewijs-copy.ts)) sorteert op *hoeveel je deed*
(`activeDays` t.o.v. een drempel van `cycleDay / 3`, `:54`). De nieuwe hero sorteert op *hoeveel je gemeten hebt*.
Dat is een andere vraag met andere randgevallen, dus een andere staten-set — en daarmee een nieuw event (§I).

| Nieuw | Conditie (uit bestaande velden) | Vervangt |
|---|---|---|
| `wachtend` | `cycleEvidence == null` en `remeasure != null` | `wachtend` |
| `onderweg` | `cycleEvidence != null`, `daysUntilRemeasure > 0`, `model.trend[priority].length < 2` | `dun` + `opbouwend` |
| `tweede_beeld` | `trend[priority].length >= 2` en `deltaOf(priority) != null` | `beantwoord` |
| `hermeting_klaar` | `remeasure.daysUntil <= 0` | — (nieuw; bestond alleen als CTA-tak, [`VoortgangHero.tsx:70-71`](../../src/components/dashboard/voortgang/VoortgangHero.tsx)) |

`dun` en `opbouwend` verdwijnen als aparte standen: het verschil ertussen is een oordeel over hoeveel je deed, en dat
oordeel hoort niet in een kop. Wat je deed blijft leesbaar — in de band, per dag, als constatering.

### De copy per staat

Toon: [`WRITING_VOICE.md`](../core/WRITING_VOICE.md) §2-3. Geen uitroeptekens, geen "goed bezig", geen tweede cijfer,
geen causaal voegwoord ([`voortgang-bewijs-copy.ts:1-9`](../../src/lib/voortgang-bewijs-copy.ts) — die regels blijven
gelden voor de nieuwe bouwer).

**`wachtend`** — de lege staat.
- Eyebrow: `JE CYCLUS`
- H1: *"Je eerste beeld staat. Het tweede is waar het leesbaar wordt."*
- Body: *"Je hermeting staat op {dueDate}. Wat je tot dan neerzet, lees je op die dag terug — niet vandaag, en dat is bewust."*
- CTA: `Wat staat er voor vandaag` (Mijn Dag) · secundair `Bekijk je {prioriteit}`

**`onderweg`**
- Eyebrow: `JE CYCLUS · DAG {cycleDay} VAN 30`
- H1: *"Dag {cycleDay} van je cyclus."*
- Body: *"Over {daysUntilRemeasure} dagen doe je je hermeting. Dan staat er naast je eerste beeld een tweede — pas dan is er een verschil om te lezen."*
- CTA: `Wat staat er voor vandaag` · secundair `Bekijk je {prioriteit}`

**`tweede_beeld`**
- Eyebrow: `JE CYCLUS · DAG {cycleDay} VAN 30`
- H1: *"Er staat nu meer dan één meting."*
- Body: *"Je {prioriteit} is sinds je start {|delta|} punten {hoger|lager}. Eén verschil is nog geen lijn — je volgende meting zegt of het richting is."*
- CTA: `Wat staat er voor vandaag` · secundair `Bekijk je {prioriteit}`

**`hermeting_klaar`**
- Eyebrow: `JE CYCLUS · KLAAR`
- H1: *"Je hermeting staat klaar."*
- Body: *"Dertig dagen sinds je start. Dit is het moment waarop de vergelijking iets betekent."*
- CTA: `Naar je hermeting` · secundair `Wat staat er voor vandaag`

De geruststellingsregel ([`VoortgangHero.tsx:28-33,178-180`](../../src/components/dashboard/voortgang/VoortgangHero.tsx))
vervalt in alle standen: in de nieuwe copy zit de geruststelling in de body zelf ("dat is bewust", "nog geen lijn"),
en een vierde tekstregel onder de CTA's herhaalde 'm.

### Wat de hero zegt, wat de band zegt

**De hero zegt wanneer het leesbaar wordt; de band zegt wat er op welke dag gebeurde.** Dat is geen herhaling omdat
de hero één datum in de toekomst noemt en de band een schuifbare as over dertig dagen is, met per dag een andere
caption — meetmomenten per domein ([`voortgang-bewijsband.ts:100-118`](../../src/lib/voortgang-bewijsband.ts)),
vandaag met de dagteller ([`:120-124`](../../src/lib/voortgang-bewijsband.ts)), de toekomst als "nog te gaan"
([`:135-140`](../../src/lib/voortgang-bewijsband.ts)).

`VoortgangBewijsband` zelf blijft ongewijzigd — component, scrub-event en captions. Alleen zijn kop ("Je cyclus",
[`VoortgangBewijsband.tsx:399-404`](../../src/components/dashboard/voortgang/VoortgangBewijsband.tsx)) staat nu naast
een hero die dezelfde taal spreekt in plaats van naast een bewijs-kop die een andere as claimde.

---

## D. Horizon-contract

### De gekozen claim-klasse

**Klasse 3: een meet-uitspraak, niet een effect-uitspraak.** De regel zegt *wanneer je het terugziet en waaraan*,
nooit *hoeveel het gaat schelen*.

Verdedigd tegen [`PLAN_FUNCTIONELE_CAPACITEIT_PROGNOSE.md`](../plan/PLAN_FUNCTIONELE_CAPACITEIT_PROGNOSE.md) §2: die
tabel zet *persoonlijke prognose* ✗ tegenover *bevolkingsniveau-feit + actie* ✓. Klasse 3 zit onder allebei — hij doet
geen enkele uitspraak over uitkomst, ook geen bevolkingsniveau-uitspraak, en heeft dus geen evidence-audit nodig.
Klasse 2 (bevolkingsniveau-mechanisme) blijft **toegestaan waar hij al gepubliceerd is**: de `whyLine`-teksten die
vandaag al onder de feitenrijen staan
([`movement-checkin/index.ts:614-631`](../../src/data/movement-checkin/index.ts) ·
[`sleep-checkin-readout.ts:98-101`](../../src/lib/sleep-checkin-readout.ts)) zijn precies dat, en die zijn al door de
copy-lijn gegaan. Nieuwe mechanisme-zinnen schrijven we deze ronde niet.

### (1) Welk ritme "4–6 weken" mag heten

**Geen.** Vervang het door twee ritmes die de app kan dateren:

| Ritme | Bron | Wat de regel mag zeggen |
|---|---|---|
| **Je hermeting** — 30 dagen, met datum | `CYCLE_LENGTH` ([`voortgang-bewijsband.ts:4`](../../src/lib/voortgang-bewijsband.ts)) · `remeasure.dueDate` ([`account-dashboard.ts:762-770`](../../src/lib/account-dashboard.ts)) | *"Op {dueDate} staat je hele beeld naast dat van je start."* |
| **Je volgende domeincheck** — 14 dagen | `DOMAIN_CHECK_INTERVAL_DAYS` ([`kompas-domain-check.ts:9`](../../src/lib/kompas-domain-check.ts)) | *"Over {n} dagen kun je je {checkNaam} opnieuw doen — dan staat deze regel er met een nieuw antwoord."* |

Het commentaar bij `DOMAIN_CHECK_INTERVAL_DAYS` zegt het al: veertien dagen is "de kortste periode waarin een
domeinscore betekenisvol kan bewegen" en geeft "precies één verdieping binnen de 30-daagse hermetingscyclus". Dat is
de enige onderbouwing van een tijdsvenster die in de codebase staat — gebruik hem, en verzin er geen derde naast.

### (2) Per domein: welke bron draagt de regel

| Domein | Bron met een gepubliceerde richtlijn | Dekking | Wat de regel dus wordt |
|---|---|---|---|
| **beweging** | `MOVEMENT_BENCHMARKS` ([`movement-checkin/index.ts:584-608`](../../src/data/movement-checkin/index.ts)): kracht (WHO 2020) · aeroob (WHO 2020 · Beweegrichtlijnen 2017) · zitten (kwalitatief, expliciet géén getalsnorm) | 3 van 8 rijen, 2 met een getal | Meet-uitspraak + de bestaande `whyLine` van de rij die onder de richtlijn zit |
| **slaap** | `FACT_ORDER` ([`sleep-checkin-readout.ts:47-56`](../../src/lib/sleep-checkin-readout.ts)): alleen `duur` draagt *"Populatierichtlijn: 7+ uur"*, zonder `source`-veld | 1 van 8 rijen | Alleen meet-uitspraak; de duur-rij mag zijn richtlijn tonen zoals nu |
| **voeding** | `nutrientReferences[*].referenceLabel` ([`intake-reference.ts:89,115,141,170,198`](../../src/data/nutrition/intake-reference.ts)) | 5 van 5 nutriënten | Meet-uitspraak + het referentielabel, nooit een getal (de engine is expliciet frequentie-gebaseerd, [`nutrition-intake-estimate.ts:6`](../../src/lib/nutrition-intake-estimate.ts)) |
| **stress** | Geen. `evidenceByLayer: {}` ([`domain-ladder-readout.ts:233`](../../src/lib/domain-ladder-readout.ts)) | 0 | Alleen meet-uitspraak, plus expliciet *"Geen richtlijn — je eigen antwoord is de meetlat"* |
| **verbinding** | Geen readout ([`domain-ladder-readout.ts:240`](../../src/lib/domain-ladder-readout.ts)), geen check-route ([`kompas-domain-check.ts:15-20`](../../src/lib/kompas-domain-check.ts)) | 0 | Geen regel. Alleen: *"Verbinding meet mee in je leefstijlcheck, niet apart."* |
| **energie · herstel** | Geen, per constructie (`READOUT_DRIVERS`, [`domain-role.ts:20-23`](../../src/lib/domain-role.ts)) | 0 | Geen regel. Wel de driver-zin die er al is |

### (3) Verboden ✗ naast toegestaan ✓

| ✗ Niet | ✓ Wel |
|---|---|
| *"Deze laag levert je in 4–6 weken zichtbaar meer energie op."* | *"Over 14 dagen kun je je beweegcheck opnieuw doen — dan staat 'Kracht' er met een nieuw antwoord."* |
| *"Met 2× kracht per week zit je over zes weken op de richtlijn."* | *"Richtlijn: 2× per week krachttraining. Jij gaf 1× per week op."* |
| *"Je slaapscore stijgt naar verwachting met 8 punten."* | *"Op 19 september staat je slaapbeeld naast dat van je start."* |
| *"Mensen die dit kozen sliepen na een maand beter."* | *"Spierbehoud na 40 hangt aan frequentie, niet aan zwaarte."* (bestaande `whyLine`, [`movement-checkin/index.ts:622-623`](../../src/data/movement-checkin/index.ts)) |
| *"Nog drie weken en je zit in 'Sterk'."* | *"Je eigen ijkpunt stond bij je start op 4 en nu op 6."* (ruw verschil, geen drempelwoord — [`PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md`](../plan/PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md) §11) |
| *"Dit voorkomt dat je over tien jaar de trap niet meer op komt."* | *"Traplopen voorspelt dagelijks functioneren beter dan één sportgetal."* (bestaande `whyLine`, [`movement-checkin/index.ts:629`](../../src/data/movement-checkin/index.ts)) |

### (4) Zonder tweede meting

De regel noemt alleen de datum en het feit dat er dan een tweede beeld is. Geen richting, geen "op weg naar", geen
band-doel. Dit is dezelfde randgeval-regel als doelnarratief §4 (*"Dit wordt je startpunt"* bij ontbrekende baseline)
en als `LeefstijllijnRow.delta`, die `null` blijft zolang `trend.length < 2` of de baseline een `RULES_VERSION`-grens
kruist ([`leefstijllijn.ts:52-55`](../../src/lib/leefstijllijn.ts)). Neem die guard letterlijk over: **geen enkele
horizon-regel rendert een richting waar `delta === null`.**

---

## E. Tegelcontract per domein

### Eerst: waarom een kengetal géén tweede score is

[`BEWEEG_COCKPIT_FUTURE_YOU.md`](../plan/BEWEEG_COCKPIT_FUTURE_YOU.md) besluit 4 verbiedt een tweede, bewegend cijfer
naast de engine-score, en §7 verbiedt **sub-scores per capaciteit** ("Kracht ▲ · Conditie ▲" als losse cijfers). Een
kengetal is geen van beide:

| | Engine-score | Kengetal |
|---|---|---|
| Herkomst | Gewogen aggregaat van meerdere items | Het antwoord dat de gebruiker zelf gaf, teruggespeeld |
| Schaal | 0–100, vergelijkbaar tussen domeinen | De schaal van de vraag ("6 tot 7 uur", "1x per week") |
| Beweging | Verandert bij hermeting | Verandert bij de check waar hij vandaan komt |
| Optelbaar | Ja, dat is het punt | Nee — nooit |

**Drie machinaal toetsbare regels die het onderscheid bewaken.** Een kengetal (a) wordt nooit gerenderd als `/100`,
(b) draagt nooit een `DeltaBadge`, (c) wordt nooit opgeteld of gemiddeld met een ander kengetal. Wie een van de drie
overtreedt heeft een sub-score gebouwd, en dan geldt besluit 4 wél.

Dit is geen nieuwe uitvinding: precies deze vorm staat al live op het check-in-resultaat, met een kop die het zelf
zegt — *"Wat je antwoordde, en waar dat staat"* / *"Waar een richtlijn bestaat, staat hij erbij. De rest meet je
tegen jezelf"* ([`movement-checkin/index.ts:634-636`](../../src/data/movement-checkin/index.ts)) en *"Eerst je
antwoord, daarna wat dat betekent — geen score als kop"*
([`SleepFactReadout.tsx:45-47`](../../src/components/intake/SleepFactReadout.tsx)).

### De tabel

| Domein | Kengetal | Exact veld | NL-label | Bron `pad:regel` | Ontbreekt → |
|---|---|---|---|---|---|
| **Slaap** | Slaapduur | `duur` | "Slaapduur" | [`sleep-checkin-readout.ts:48`](../../src/lib/sleep-checkin-readout.ts); antwoordlabels [`data/sleep-checkin/index.ts:73-83`](../../src/data/sleep-checkin/index.ts) | rij wordt niet gebouwd ([`sleep-checkin-readout.ts:86-87`](../../src/lib/sleep-checkin-readout.ts)) |
| | Regelmaat | `SLP_CONS` | "Regelmaat" | [`sleep-checkin-readout.ts:49`](../../src/lib/sleep-checkin-readout.ts); [`data/sleep-checkin/index.ts:44-56`](../../src/data/sleep-checkin/index.ts) | idem |
| | Uitgerust wakker | `SLP_QUAL` | "Uitgerust wakker" | [`sleep-checkin-readout.ts:54`](../../src/lib/sleep-checkin-readout.ts); [`data/sleep-checkin/index.ts:57-70`](../../src/data/sleep-checkin/index.ts) | idem |
| **Beweging** | Cardio en intensief samen | `MOV2_CARD` + `MOV2_VIG` | "Cardio en intensief samen" | [`movement-checkin/index.ts:566`](../../src/data/movement-checkin/index.ts); samenstelling [`movement-assessment.ts:609-619`](../../src/lib/movement-assessment.ts) | rij wordt niet gebouwd ([`:662-663`](../../src/lib/movement-assessment.ts)) |
| | Kracht | `MOV2_STR` | "Kracht" | [`movement-checkin/index.ts:567`](../../src/data/movement-checkin/index.ts); opties [`:64-70`](../../src/data/movement-checkin/index.ts) | idem |
| | Zitten | `MOV2_SIT` | "Zitten" | [`movement-checkin/index.ts:568`](../../src/data/movement-checkin/index.ts); suffix "per dag" [`movement-assessment.ts:629`](../../src/lib/movement-assessment.ts) | idem |
| **Voeding** | Band per nutriënt (max 3 van 5) | `nutritionIntake.items[].band` | "Eiwit" · "Omega-3" · "Magnesium" · "Vitamine D" · "Zink" | [`account-dashboard.ts:445-463`](../../src/lib/account-dashboard.ts); labels [`intake-reference.ts:88,114,140,169,197`](../../src/data/nutrition/intake-reference.ts) | `nutritionIntake == null` → S6-vorm |
| **Stress** | Spanning | `STR_FREQ` | "Spanning" | [`types/dashboard.ts:295`](../../src/types/dashboard.ts) → [`data/stress-checkin/index.ts:20-30`](../../src/data/stress-checkin/index.ts) | `stressCheckinReport == null` → S6-vorm |
| | Herstel | `STR_RCV` | "Herstel" | [`data/stress-checkin/index.ts:31-41`](../../src/data/stress-checkin/index.ts) | idem |
| **Verbinding** | — | — | — | Geen readout ([`domain-ladder-readout.ts:240`](../../src/lib/domain-ladder-readout.ts)), geen check-route ([`kompas-domain-check.ts:15-20`](../../src/lib/kompas-domain-check.ts)) | altijd |
| **Energie · herstel** | — | — | — | `READOUT_DRIVERS` ([`domain-role.ts:20-23`](../../src/lib/domain-role.ts)) | altijd |

### Anatomie van het blok

**Kop-waarde = de focus-rij, niet een vaste rij.** Dat is geen nieuwe logica: `buildSleepFactRows`
([`sleep-checkin-readout.ts:105-118`](../../src/lib/sleep-checkin-readout.ts)) en `buildMovementFactRows`
([`movement-assessment.ts:681-686`](../../src/lib/movement-assessment.ts)) zetten de focus-rij al vooraan. Neem de
eerste drie rijen zoals ze aankomen. Voor voeding: sorteer `below` → `around` → `meets` en neem er drie.

| Onderdeel | Inhoud | Voorbeeld (slaap) |
|---|---|---|
| Kop-waarde | `label` + `answerLabel` van de eerste rij, `answerLabel` in de grootste graad | **Slaapduur** — *6 tot 7 uur* |
| Benchmark-regel | `benchmarkLabel` van diezelfde rij, of het eerlijke alternatief | *Populatierichtlijn: 7+ uur* |
| Twee vervolgrijen | `label` + `answerLabel`, zonder benchmark | Regelmaat — *Meestal wel, soms niet* · Uitgerust wakker — *Wisselend, verschilt per dag* |
| Meetregel | `domainCheckDaysAgo[domain]` | *Gemeten 6 dagen geleden* |
| De klik | Het hele blok → `openLeefstijlprofielDomein(domain)` ([`VoortgangHub.tsx:105-112`](../../src/components/dashboard/VoortgangHub.tsx)) | *Waarom dit zo staat →* |

**Waar geen benchmark bestaat**, staat er geen lege regel maar de zin die de app al gebruikt voor precies dat geval:
*"Geen richtlijn — je eigen antwoord is de meetlat."* Vergelijk `MOVEMENT_FACT_STATUS_LABELS.own = "Jouw ijkpunt"`
([`movement-checkin/index.ts:642`](../../src/data/movement-checkin/index.ts)) en `MOVEMENT_FACT_INTRO`
([`:635-636`](../../src/data/movement-checkin/index.ts)).

### Biologische klok — uit welke velden, of niet

**Niet.** Er bestaat geen veld voor de biologische klok, en de drie kandidaten mogen niet tot één regel worden
samengevoegd:

| Kandidaat | Vraag | Bron | Waarom niet |
|---|---|---|---|
| `morninglight` | *"Hoe vaak zie je binnen een uur na opstaan daglicht buiten?"* | [`data/sleep-checkin/index.ts:131-140`](../../src/data/sleep-checkin/index.ts), label "Ochtendlicht" ([`sleep-checkin-readout.ts:50`](../../src/lib/sleep-checkin-readout.ts)) | Op zichzelf prima — als "Ochtendlicht", niet als klok |
| `SLP_CONS` | *"Houd je een vast slaap-waakritme aan?"* | [`data/sleep-checkin/index.ts:44-56`](../../src/data/sleep-checkin/index.ts), label "Regelmaat" | Idem — als "Regelmaat" |
| `LIF_SUN` | *"Hoeveel buitenlicht krijg je gemiddeld?"* | [`intake-questions.ts:298-311`](../../src/data/intake-questions.ts) | **Intake-only**: kan maanden oud zijn terwijl de andere twee check-vers zijn |

Drie redenen om er geen kengetal van te maken: het zou een **afgeleide** waarde zijn uit drie velden op twee schalen —
precies de sub-score die besluit 4 verbiedt; twee van de drie komen uit verschillende flows met verschillende
meetdata, dus de regel is nergens op te dateren; en de twee check-velden hebben al eerlijke labels die zeggen wat er
gevraagd is.

**Waar de klok wél mag staan:** als mechanisme-woord in proza, nooit als waarde. De intake-vraag doet dat zelf al in
haar subtitle — *"Buitenlicht zet je biologische klok"*
([`intake-questions.ts:303-304`](../../src/data/intake-questions.ts)). Dezelfde register-keuze op de tegel:
*"Ochtendlicht en vaste tijden zijn wat je klok zet"* als why-regel onder de twee rijen, zonder getal erachter.

### De eerlijke andere vorm

| Domein | Vorm | Copy |
|---|---|---|
| **Stress** | Blok met twee kengetallen, **zonder** benchmark-regel | Kop-waarde *Spanning — Regelmatig*; regel eronder: *"Geen richtlijn — je eigen antwoord is de meetlat."* Twee rijen, geen derde, en geen dekkingsmeter (`evidenceByLayer` is leeg, [`domain-ladder-readout.ts:233`](../../src/lib/domain-ladder-readout.ts)) |
| **Voeding** | Blok met **banden**, geen getallen | *"Omega-3 — onder de richtlijn"* · *"2× vette vis per week"* · *"Gelogd op {date}"*. Nooit grammen, nooit porties als getal |
| **Verbinding** | **Geen blok.** Eén regel | *"Verbinding meet mee in je leefstijlcheck, niet apart. Je volgende hermeting brengt 'm mee."* Geen check-CTA — die route bestaat niet |
| **Energie · herstel** | **Geen blok.** Onder een eigen kop, zoals de hub al doet ([`VoortgangDomeinRing.tsx:293-313`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)) | Kop `VOLGT UIT DE REST` · *"Energie volgt uit je slaap, voeding en beweging."* De drie drivers zijn de links; geen chevron naar een eigen scherm |
| **Elk domein zonder check** (slaap/beweging/voeding/stress vóór hun eerste check) | Blok van dezelfde maat, andere inhoud | *"Je hebt je {checkNaam} nog niet gedaan. Drie minuten, en dan staat hier wat je zelf opgaf."* + de check als enige actie ([`PILLAR_CHECKIN_ROUTES`](../../src/data/dashboard/index.ts) `:292-297`) |

---

## F. Doublure-sanering

| Wat | Vindplaatsen vandaag | Wat er gebeurt | Wat de gebruiker kwijt is | Waar hij het terugvindt |
|---|---|---|---|---|
| **`MetingenCard`** | **Nul.** Onbereikbaar via `TAB_SECTIONS` ([`data/dashboard/index.ts:352-357`](../../src/data/dashboard/index.ts)); tweede vindplaats verwijderd in `a0174caa` | Verwijderen: `MetingenCard.tsx`, `VitalityScoreSection` ([`Dashboard.tsx:505-601`](../../src/components/dashboard/Dashboard.tsx)), `EMPTY_SECTIONS` ([`:2820`](../../src/components/dashboard/Dashboard.tsx)), de `vitaalscore`-entry ([`data/dashboard/index.ts:300`](../../src/data/dashboard/index.ts)) en het `vitalityScore`-lid ([`types/dashboard.ts:50`](../../src/types/dashboard.ts)) | Niets — hij ziet het vandaag al niet | De twee getallen die erin stonden: "domeinen op peil" is de dekkingsregel op de hub; "check-ritme" wordt de meetregel per domeinblok |
| **`LeefstijllijnSection` / `VoortgangOverTijdSection`** | **Nul.** Beide verwijderd in `a0174caa` | Niets te doen in code. Wél: [`PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md`](../plan/PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md) §10.1 slice C noemt `VoortgangRichtingBeat` als host van het doelblok — die host bestaat niet meer; corrigeer het doc in dezelfde plak als het doelblok | Niets | `buildLeefstijllijnRows` leeft door als sparkline per domein ([`LeefstijlprofielDomeinScherm.tsx:184`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)) |
| **De domeinrij — Kompas home** | [`KompasHomeCard.tsx:417-520`](../../src/components/dashboard/kompas/KompasHomeCard.tsx) | **Blijft ongewijzigd.** Dit is roadmap §1's "één regel per ander domein" | — | — |
| **De domeinrij — Voortgang hub** | [`VoortgangDomeinRing.tsx:54-225`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx) | Verliest sparkline ([`:148-150`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)), bandlabel en `DeltaBadge` ([`:161-171`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)). Houdt naam, `metaLine` ([`:75-78`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)) en de ijkpunt-rij ([`:186-222`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)) | Score, trend en delta per domein op deze plek | Kompas home (volle rij) en het domeinscherm "Je stand" ([`LeefstijlprofielDomeinScherm.tsx:317-352`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)) |
| **De domeinrij — Leefstijlprofiel landing** | [`LeefstijlprofielKeuzeHub.tsx:86-127`](../../src/components/dashboard/voortgang/LeefstijlprofielKeuzeHub.tsx) | **Verdwijnt volledig**, vervangen door de blokken uit §E | De scorebubbel; de statuszin *"Leefstijlkeuze volgt — beweging is de blauwdruk"* | De score: zie hierboven. De statuszin: nergens — hij ging over de roadmap, niet over de gebruiker |
| **Het eigen ijkpunt ×3** | Hub-rij · domeinscherm slaap/beweging ([`:428-429`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)) · check-uitslag ×3 | Hub-rij **blijft** (cross-domein, plan §7). Check-uitslag **blijft** (zetmoment, plan §10.1 slice D). Domeinscherm **eruit** | Het zetmoment op twee van de vijf domeinschermen | De hub-rij, waar alle vijf domeinen hem hebben |
| **Dekkingsnoemer 7** | [`VoortgangDomeinRing.tsx:33-51`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx) | Noemer wordt `DOMAIN_CHECK_PILLAR_IDS.length` = 4 ([`kompas-domain-check.ts:15-20`](../../src/lib/kompas-domain-check.ts)) | Een tekort dat hij niet kon wegwerken | De readout-domeinen staan al onder "Volgt uit de rest" ([`:293-313`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)); verbinding krijgt de regel uit §E |

**Eén ding verdwijnt niet zonder vervanging.** De enige verwijdering waar de gebruiker écht iets kwijtraakt is de
score/trend/delta op de hub. Die staat na de sanering nog op precies twee surfaces — Kompas home (overzicht) en het
domeinscherm (detail) — wat exact de twee vragen zijn waar hij bij hoort.

---

## G. Domeinscherm-contract

### Wat het scherm toevoegt bovenop het blok

| Laag | Blok op de landing | Domeinscherm |
|---|---|---|
| Conclusie | — | `headline` uit de check ([`domain-ladder-readout.ts:56-57`](../../src/lib/domain-ladder-readout.ts)), via `MovementCheckinReadout` / `SleepCheckinReadout` |
| Feiten | 3 rijen, kop-waarde + benchmark | **Alle** rijen (8 bij slaap en beweging) mét `whyLine` per rij en de "toon alle metingen"-vouw ([`SleepFactReadout.tsx:74-88`](../../src/components/intake/SleepFactReadout.tsx)) |
| Stand | Meetregel | Gauge + bandlabel + sparkline + baselinebron + meetdatum ([`LeefstijlprofielDomeinScherm.tsx:317-352`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)) |
| Verklaring | — | `PrioriteitenLadder` in `explain`: zes lagen, staten, `whyWait` per laag |
| Dekking | — | `LadderCoverageMeter` ([`:360-367`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)) — hoeveel van de ladder de check kán beoordelen |
| Keuze | — | `MijnKeuzeSectie` ([`:103-163`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)) — archief, geen werkplek |
| Route | De klik zelf | `DomainRouteStrip` ([`:473`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)) — check · Voortgang · Kompas · Mijn Dag |

**De belofte van het blok is: "hier staat waarom dit er zo bij staat."** Het scherm lost dat in door de rij die op
het blok de kop-waarde was, terug te laten komen als de rij die de winst-laag verklaart — dat is precies wat
`resolveLadderLayerReason` al doet ([`domain-ladder-readout.ts:99-126`](../../src/lib/domain-ladder-readout.ts)):
op de winst-laag de feitenrij, daarboven `whyWait`, daaronder niets.

### De twee ladderpresentaties

**Allebei blijven, op verschillende surfaces, met een rol van één zin.**

- `DomainLifestyleLadder` — **Kompas domein, kiest.** Het is de navigator van de werkplek: hij voedt
  `DomainFreeActionsTile` en publiceert de laag naar de contextkolom
  ([`DomainKompasScreen.tsx:83-85,130-141`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)).
- `PrioriteitenLadder` in `variant="explain"` — **Voortgang domein, verklaart.** Zes lagen met staat, samenvatting en
  `whyWait`, en als enige actie *"Kies dit op Kompas"*
  ([`PrioriteitenLadder.tsx:70-79`](../../src/components/dashboard/voortgang/PrioriteitenLadder.tsx)).

Niet samenvoegen: één component met beide rollen zou op Voortgang een save-knop moeten dragen, en dat is de derde
werkplek die de werkboom net heeft opgeruimd (C-d, en het kopcommentaar op
[`LeefstijlprofielDomeinScherm.tsx:47-67`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)
zegt dat zelf).

**Eén reparatie hoort in dezelfde plak.** Op Voortgang kan `pickedLayer`
([`:225-226`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)) van de winst-laag afdwalen
zonder terugweg; op Kompas bestaat die terugweg wel
([`DomainKompasScreen.tsx:147-159`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)). Neem dezelfde
regel over — *"Je kijkt naar prioriteit N. Jouw grootste winst zit op prioriteit M. Terug daarheen"* — of laat de
`explain`-ladder altijd op de focus-laag openen. Kies er één; twee ladders met verschillend afdwaalgedrag is een
verschil dat niemand kan uitleggen.

---

## H. 375px — lijst, geen 2×2-raster

**Gekozen: een lijst van volle-breedte-blokken, één per domein.** Niet vier vierkanten.

**Het rekenwerk.** Op 375px is de tab-inhoud ongeveer 351px breed (de hero hangt op `-mx-3`/`px-3`,
[`VoortgangHero.tsx:103,123`](../../src/components/dashboard/voortgang/VoortgangHero.tsx)). Een 2×2-raster met 10px
tussenruimte geeft ~170px per vierkant. Daarin moet passen:

| Regel | Voorbeeld (beweging) | Tekens |
|---|---|---|
| Label | *Cardio en intensief samen* | 25 |
| Antwoord | *150-299 minuten matig · 30-74 minuten intensief* | 47 |
| Richtlijn | *Richtlijn: 150–300 minuten matig per week, of 75–150 minuten intensief* | 70 |

Bij de typegrootten die de bestaande readout gebruikt (12,5px label · 13,5px antwoord · 11,5px richtlijn,
[`SleepFactReadout.tsx:54,61,65`](../../src/components/intake/SleepFactReadout.tsx)) past er in 170px ongeveer 22–24
tekens per regel. De richtlijn alleen al wordt drie tot vier regels; het antwoord twee. Vier zulke vierkanten is een
eerste viewport die volledig uit afgebroken richtlijntekst bestaat. Op 351px is het 45–48 tekens per regel: het
antwoord past op één regel, de richtlijn op twee.

**En de vorm bestaat al.** `SleepFactReadout` is precies dit: een volle-breedte-lijst met `VISIBLE_ROWS = 4` en een
"toon alle metingen"-vouw ([`SleepFactReadout.tsx:7,35,74-88`](../../src/components/intake/SleepFactReadout.tsx)). Hergebruik hem
voor de landing in plaats van een tweede leesvorm te bouwen.

**Wat er op de eerste viewport past** (375 × ~650 zichtbaar): de sub-nav-chips
([`VoortgangMobileNav.tsx:42`](../../src/components/dashboard/voortgang/VoortgangMobileNav.tsx), ~40px), de
schermkop ([`LeefstijlprofielKeuzeHub.tsx:24-64`](../../src/components/dashboard/voortgang/LeefstijlprofielKeuzeHub.tsx),
~62px), de sectiekop (~70px), dan ~2,5 domeinblok van ~180px. Dus:

> **De mobiele vorm: het prioriteitsdomein uitgeklapt met drie kengetallen, de andere vier ingeklapt tot één regel
> (naam + meetregel).** Tikken klapt uit; het blok blijft de klik naar het domeinscherm houden op zijn kop.

**Breder dan 375px.** Twee kolommen mag vanaf ~560px containerbreedte, met `@container`/`@[560px]` zoals
[`KompasHomeCard.tsx:789`](../../src/components/dashboard/kompas/KompasHomeCard.tsx) — **nooit** `lg:`/`xl:`. De
midden-zone van de cockpit krimpt mee met de contextkolom, dus viewport-breakpoints liegen daar
([`cockpit-context-layout.ts:2-3`](../../src/lib/cockpit-context-layout.ts)).

Noem het gerust een "vak"; het is een blok over de volle breedte.

---

## I. Meetpunten

| Voorstel | Event | Nieuw of hergebruikt | Registratiepad |
|---|---|---|---|
| Hero-herkadering (§C) | `dashboard_voortgang_horizon_state` — params `state`, `cycle_day`, `days_until_remeasure` | **Nieuw** | GA4-only. `trackEvent` kent geen allowlist ([`ga4.ts:27-34`](../../src/lib/ga4.ts)), dus één regel in de hero. **In dezelfde commit** vervalt `dashboard_voortgang_bewijs_state` ([`VoortgangHero.tsx:62-66`](../../src/components/dashboard/voortgang/VoortgangHero.tsx)) + GA4-datum-annotatie |
| Waarom niet hergebruiken | — | — | De staten-set verandert van betekenis (activiteit → meting). Een nieuwe waarde op `state` zou de historische reeks stilzwijgend onvergelijkbaar maken — dat is precies de G′-grens uit het zijbalk-verdict §E |
| Klik op een domeinblok | `dashboard_voortgang_hub_click` met `destination: "leefstijlprofiel"`, `domain` | **Hergebruikt** | Bestaat ([`VoortgangHub.tsx:105-112`](../../src/components/dashboard/VoortgangHub.tsx)). Het blok vervangt de rij: dezelfde klik, dezelfde bestemming |
| Uitklappen van een blok / "toon alle metingen" | `sleep_checkin_fact_readout_expanded` ([`SleepFactReadout.tsx:79`](../../src/components/intake/SleepFactReadout.tsx)) · `movement_checkin_fact_readout_expanded` ([`MovementFactReadout.tsx:49`](../../src/components/intake/MovementFactReadout.tsx)), met `surface: "leefstijlprofiel_landing"` | **Hergebruikt** | Dezelfde gebeurtenis (rijen opengevouwen) op een andere plek — de uitzondering die de G′-grens toestaat |
| Dekkingslijst op de hub | — | Geen event | Read-only |
| Eigen ijkpunt | `dashboard_voortgang_doel_click` ([`VoortgangDomeinRing.tsx:94-97`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)) + durable `goal.benchmark_set` / `goal.benchmark_rescored` ([`events.ts:86-87`](../../src/lib/events.ts)) | **Hergebruikt** | Server-emitted, al geregistreerd |
| Domeinscherm-bezoek | `domain_tool.snapshot_viewed` ([`LeefstijlprofielDomeinScherm.tsx:232-236`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)) | **Hergebruikt** | Draagt al `surface` en `has_conclusion` |

**Geen durable event in dit hele plan.** Aan geen enkel getal hier hangt geld; dezelfde afweging als het
zijbalk-verdict §E maakt voor de save-knop. Zodra de landing een betaalde kaart zou dragen, verandert dat — maar dat
is W4-werk, niet dit.

> **Meetpunt: `dashboard_voortgang_horizon_state` — hier lees je af of de hero mensen in de goede staat aantreft.
> `dashboard_voortgang_hub_click{destination:"leefstijlprofiel"}` per Voortgang-sessie — hier lees je af of het blok
> een betere deur is dan de rij. `sleep_checkin_fact_readout_expanded{surface:"leefstijlprofiel_landing"}` — hier
> lees je af of de diepte gelezen wordt.**

---

## J. Slice-volgorde — vijf, slaap eerst

**Slaap eerst, niet beweging.** Drie redenen:

1. **De koppeling tegel → laag is bij slaap gratis.** `SleepFactRow` draagt zijn laag zelf
   ([`sleep-checkin-readout.ts:20`](../../src/lib/sleep-checkin-readout.ts)), dus groeperen volstaat
   ([`domain-ladder-readout.ts:177-190`](../../src/lib/domain-ladder-readout.ts)). Beweging heeft daarvoor een
   handmatige mapping die maar drie van de zes lagen dekt
   ([`domain-ladder-readout.ts:128-132`](../../src/lib/domain-ladder-readout.ts)).
2. **Slaap is klaar, beweging beweegt.** Beweging is het pilot-domein voor het keuzehart
   ([roadmap §4](KOMPAS_SIDEBAR_ROADMAP_2026-08.md)) en dus het domein dat de komende plakken nog verandert. De
   landing heeft een domein nodig dat stilstaat.
3. **Slice 2 is een verplaatsing, geen bouw.** `SleepFactReadout` staat al gemount op het domeinscherm
   ([`LeefstijlprofielDomeinScherm.tsx:424`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx)).

*Noot bij roadmap §4.* Die regel gaat over de keuzehart-lijn (save in de zijbalk, kaarten op de laag), niet over de
leesvorm van het leefstijlprofiel. Leest Dennis 'm tóch als bindend over alle lijnen: wissel slice 2 en 3 om, dat
kost niets — de blok-bouwer is domein-agnostisch en beide readouts bestaan al.

| # | Slice | Wat erin zit | Wat er niet in zit | Geslaagd als |
|---|---|---|---|---|
| **1** | **Hero op de tijd-as** | Vier nieuwe standen (§C), copy per staat, dagteller uit de eyebrow, geruststellingsregel eruit, `dashboard_voortgang_horizon_state` erin en `dashboard_voortgang_bewijs_state` eruit | De domeinlijst · de blokken · de band (ongewijzigd) | Het nieuwe event vuurt met minstens twee gevulde standen, en `dashboard_voortgang_hub_click{destination:"agenda"}` per sessie zakt niet |
| **2** | **Het blok, op slaap** | Eén blok-bouwer op de landing, gevoed uit `sleepCheckinSnapshot.factRows`; slaap uitgeklapt, de andere vier houden hun huidige rij; de ingeklapte/uitgeklapte vorm van §H | Beweging · voeding · stress · verbinding · energie/herstel | `dashboard_voortgang_hub_click{destination:"leefstijlprofiel",domain:"slaap"}` per Voortgang-sessie ligt boven de rij-nulmeting uit slice 1 |
| **3** | **Beweging, voeding en stress in dezelfde bouwer** | `movementCheckinSnapshot.factRows` · `nutritionIntake.items` als banden · `stressCheckinReport` als twee kengetallen zonder richtlijn | Verbinding · energie · herstel | Een unittest houdt stand die eist dat elke gerenderde kengetal-rij een `key` uit een check-bron heeft — geen enkele rij zonder veld erachter |
| **4** | **De eerlijke lege plekken** | Verbinding-regel · energie/herstel onder "Volgt uit de rest" · dekkingsnoemer naar 4 ([`VoortgangDomeinRing.tsx:33-51`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)) · de roadmap-statuszin eruit · de "nog geen check"-vorm per domein | Alles wat een claim toevoegt | Een testaccount met vier domeinchecks leest *"Je hebt 4 van de 4 domeinen apart gemeten"* — de noemer is haalbaar |
| **5** | **Ontdubbelen en dood hout** | Hub-rij verliest sparkline/band/delta · `MetingenCard` + `VitalityScoreSection` + `vitalityScore`-sectietype weg · de tweede `DomeinIjkpuntCheckPrompt` van het domeinscherm · de "Terug daarheen"-reparatie uit §G | Kompas home (blijft ongewijzigd) | `grep -rn "MetingenCard" src/` geeft niets, en score + `DeltaBadge` renderen op precies twee surfaces |

**Wat níét in deze vijf zit:** de 4–6-weken-horizon (§A S2, PARKEER) en het herbouwde doelblok (§K4). Beide hebben
een drempel, geen plek in de volgorde.

---

## K. Tegenspraak

### K1 · De doublure is geen bug maar een navigatie-affordance *(verplicht)*

Dezelfde rij op drie surfaces is hoe iemand weet dat hij op de goede plek is. Kompas, hub en landing tonen nu
allemaal "vijf domeinen, klikbaar" — dat is een consistent mentaal model, en het is precies wat een tabbladen-app
moet doen om niet als drie losse apps te voelen. Een landing waarvan de rijen niet meer lijken op de rijen ervoor,
kan lezen als een ander product.

**Drempel waarop Dennis ongelijk heeft.** Na slice 2: als het aandeel Voortgang-sessies dat vanaf de landing een
domeinscherm bereikt (`dashboard_voortgang_hub_click{destination:"leefstijlprofiel",domain:*}` per sessie) **niet
daalt**, deed de rij geen navigatiewerk dat het blok niet ook doet. Daalt het wél — dan was de herkenbare rij de
deur, en moet het blok een expliciete "Waarom dit zo staat →"-regel krijgen in plaats van alleen een klikbare kop.

### K2 · Blokken met kengetallen maken de landing zwaarder dan de scan die hij nu is *(verplicht)*

Vandaag is de landing vijf rijen van ~64px: één viewport, één blik, klaar. Met drie kengetallen per domein wordt het
~180px per domein, ofwel ~2,7 viewports op 375px. Dat is geen scan meer maar een leesscherm — en de doelgroep zit op
mobiel ([`CLAUDE.md`](../../CLAUDE.md)).

**Drempel waarop Dennis ongelijk heeft.** Als na slice 2 de mediane scrolldiepte op de landing (Clarity) níét onder
het eerste domeinblok blijft steken, én de "toon alle metingen"-vouw in ≥5% van de sessies wordt geopend, wordt de
diepte gelezen. Blijft de scroll boven het eerste blok hangen of blijft de vouw onder 5%: klap alles in tot één regel
en zet de kengetallen achter de klik — dan had de rij de juiste dichtheid en zat het probleem alleen in de copy.

### K3 · Een Voortgang zonder score is een Voortgang zonder onderwerp

Score, sparkline en delta van de hub halen laat een tab genaamd "Voortgang" achter waarvan het eerste scherm geen
enkel voortgangsgetal bevat — alleen data, dekking en een eigen ijkpunt dat de meeste accounts niet hebben gezet.
De tab-subtitel zegt letterlijk *"Wat zich opstapelt sinds je check"*
([`data/dashboard/index.ts:339`](../../src/data/dashboard/index.ts)).

**Drempel.** Als na slice 5 het aantal Voortgang-tab-sessies of de sessieduur op die tab meetbaar zakt, wáren de
getallen de reden om de tab te openen. Dan komt de score terug op de hub — maar dan als *één* regel voor het
prioriteitsdomein, niet als vijf rijen, en verhuist het overzicht van alle vijf definitief naar Kompas home.

### K4 · Het drie-anker-narratief is één dag geleden weggegooid

`VoortgangRichtingBeat` is op 22 augustus verwijderd als ongebruikt (`a0174caa`). Het opnieuw opbouwen — ook in de
kleinere vorm van een doelblok — is werk terugdraaien dat net gedaan is, en het doelblok hangt aan een veld
(`domain_goal`) dat opt-in is en waarvan we de vulgraad niet kennen.

**Drempel.** Het doelblok is het bouwen waard zodra minstens één op de vier accounts met een domeincheck ook een
eigen ijkpunt heeft gezet — af te lezen aan `goal.benchmark_set` ([`events.ts:86`](../../src/lib/events.ts)) tegen
het aantal accounts met een `intake_domain_checkin`. Daaronder is het een blok over een veld dat vrijwel niemand
invulde, en volstaat de ene regel per domein die de hub al draagt
([`VoortgangDomeinRing.tsx:204-209`](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)).

### Mijn aanbeveling

**Doe slice 1, 4 en 5 hoe dan ook.** Alle drie halen onwaarheden of dood hout weg — een hero die de verkeerde as
claimt, een dekkingsnoemer die niet te halen is, een statuszin over de roadmap, een sectie die niemand kan bereiken,
een ijkpunt dat twee keer om hetzelfde vraagt. Ze kosten weinig, ze kunnen de surface niet slechter maken, en ze
maken de rest leesbaar.

**Doe slice 2 als een echt experiment**, met de drempel uit K2 opgeschreven vóór hij live gaat. Eén domein, één
leesvorm, twee weken.

**Houd slice 3 vast tot de cijfers van slice 2 binnen zijn.** Drie domeinen tegelijk omzetten vóór je weet of de
vorm gelezen wordt, is de duurste manier om erachter te komen dat de rij goed genoeg was.

**Bouw de horizon niet.** Niet in deze vijf, niet als kleine versie, niet als "mechanisme-zin". Wat er vandaag over
de toekomst te zeggen valt is één zin — *wanneer je het terugziet* — en die staat na slice 1 in de hero.

---

**Meetpunt van dit document:** geen product-events — besluitstuk. Af te lezen aan het aantal PARKEER-items in §A
(nu: één) en aan de tijd tot slice 1 start.

*Opgesteld 23 augustus 2026, geverifieerd tegen `main` + de niet-gecommitte werkboom van diezelfde dag. Verandert geen
enkele getekende DEFER/FREEZE/KILL-status.*
