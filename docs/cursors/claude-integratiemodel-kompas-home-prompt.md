# Prompt — Integratiemodel op de Kompas App-home (Pătru et al., Nutrients 2026 → PSF)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus in een nieuw gesprek. Voeg **Fig. 3, 4 en 5 uit de studie** als screenshots toe (het virtuous/vicious-loop-diagram en de padmodellen). Optioneel: `CLAUDE.md`, `docs/core/WRITING_VOICE.md`.
>
> **Output:** uitsluitend analyse/architectuur — geen code, geen diffs, geen bestandspatches. De output voedt géén directe implementatie; hij is input voor de wekelijkse leefstijllog, de App-home-reshape en de leefstijllijn-uitbreiding.
>
> **Opgesteld:** 23 juli 2026. De harde context is geverifieerd tegen `main` op die datum (zie "Verificatie-log" onderaan dit bestand).

---

## Waarom deze prompt

De studie van Pătru et al. (*Nutrients* 2026) modelleert gezondheid als een **integratief systeem**: slaapkwaliteit, fysieke activiteit, voeding en psychologische gezondheid voeden elkaar wederzijds in een *virtuous loop* (of, negatief, een *vicious loop*), met subjectieve levensverwachting (SLE) als psychologische brug tussen huidig gedrag en toekomstig welzijn. Dat is precies de mentale kaart die de Kompas App-home mist.

Vandaag toont de App-home ([`ANALYSE_DASHBOARD_HOME_EN_COCKPIT_IA.md`](../plan/ANALYSE_DASHBOARD_HOME_EN_COCKPIT_IA.md) Laag A) losse domeinbalken naast één Vandaag-hero. De domeinen staan **náást** elkaar, niet **in verband** met elkaar. En er is een tweede, dieper gat, gedocumenteerd in [`PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md`](../plan/PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md): we loggen **gedrag** (adherence) en we meten **beleving** (check-ins), maar die twee meetlatten komen nergens zichtbaar samen — en de leefstijllijn beweegt vandaag alléén op beleving, nooit op gedrag.

Deze prompt dwingt Opus om beide op te lossen op één scherm: (1) toon dat de pijlers elkaar voeden — een niet-medisch systeemdiagram — en (2) toon per verbinding *wat iemand doet* naast *hoe iemand zich voelt*, zonder ze te mengen tot één nep-score. Het theoretische kader is de studie; de productvertaling is streng niet-medisch (geen biomarkers, geen mortaliteitstaal, geen diagnose).

De harde eis: de Vandaag-hero blijft de enige actie en de enige check-off. Het diagram is een **leeslaag**, geen tweede takenlijst.

---

## Gebruiksinstructie

1. Open Claude Opus (nieuw gesprek).
2. Voeg bijlagen toe:
   - **Verplicht:** screenshots van Fig. 3 (virtuous/vicious loop), Fig. 4 en Fig. 5 (padmodellen) uit Pătru et al., *Nutrients* 2026.
   - Optioneel: `CLAUDE.md`, `docs/core/WRITING_VOICE.md`, [`ANALYSE_DASHBOARD_HOME_EN_COCKPIT_IA.md`](../plan/ANALYSE_DASHBOARD_HOME_EN_COCKPIT_IA.md), [`PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md`](../plan/PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md).
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Verwachte output: vaste secties A t/m J. Geen code, geen copy-decks.
5. Gebruik de output als blauwdruk-input voor de fasering onderaan dit bestand (`buildIntegrativeLoopStatus` → `IntegrativeLoopDiagram` → SLE-proxy). Elke fase is een aparte sessie.

**Belangrijk over de domeinmapping en het diagram in de prompt.** Die staan er als **input-hint**, expliciet gemarkeerd als *ruw voorstel om kritisch te beoordelen* — niet als een antwoord dat Opus moet herhalen. Opus mag de mapping verfijnen, de diagram-topologie herzien en de meetbaarheid aanscherpen. Wat vaststaat, zijn de *harde vertaalregels* en de *invarianten*; het diagramvoorstel zelf is bespreekbaar.

---

## Prompt (copy-paste)

```text
ROL: Je bent Senior UX-architect en Behavioral Scientist voor PerfectSupplement
(perfectsupplement.nl). Je vertaalt een wetenschappelijk integratiemodel naar de
Kompas App-home van het Leefstijlcheck-dashboard.

Je levert UITSLUITEND analyse en architectuur: domeinmapping, informatiemodel,
systeemdiagram (wireframe), meetcontract, copy-hiërarchie, meetplan, fasering,
risico's. GEEN code, GEEN diffs, GEEN bestandspatches, GEEN "ik ga nu bouwen".
Output in het Nederlands; identifiers/veldnamen in het Engels.

Lees CLAUDE.md en WRITING_VOICE.md mee als je ze hebt.

═══════════════════════════════════════════════════════════════════════════════
BIJLAGEN (door Dennis)
═══════════════════════════════════════════════════════════════════════════════

1. VERPLICHT: screenshots Fig. 3 (virtuous/vicious loop), Fig. 4 en Fig. 5
   (padmodellen) uit Pătru et al., Nutrients 2026. Dit is het THEORETISCHE KADER,
   niet de doelarchitectuur.
2. OPTIONEEL: CLAUDE.md, WRITING_VOICE.md, de App-home-analyse en de
   wekelijkse-leefstijllog-plandocumenten.

═══════════════════════════════════════════════════════════════════════════════
PRODUCTCONTEXT
═══════════════════════════════════════════════════════════════════════════════

PerfectSupplement is een onafhankelijk leefstijlplatform voor mannen 40+ (slaap,
stress, energie, herstel, beweging, voeding, verbinding). Positionering: "de
Consumentenbond van supplementen", doorgegroeid naar leefstijlcoach. Adviezen,
geen diagnoses. Stepped care: leefstijl eerst, supplementen laat.

Na de Leefstijlcheck landt de gebruiker op een dashboard dat draait op één
cockpit-shell. De App-home ("Kompas" / "Vandaag") is de landingspagina ná een
klik op "Dashboard": in één blik "waar sta ik, wat is mijn ene ding vandaag,
waar werk ik naartoe". De reis-metafoor (Hier begon je → Future You) leeft als
read-only content, niet als navigatie.

Het theoretische kader dat je vertaalt: een integratief model waarin slaap,
beweging, voeding en psychologische gezondheid elkaar WEDERZIJDS voeden — een
zichzelf versterkende lus (virtuous) of afglijdende lus (vicious) — met
subjectieve levensverwachting (SLE) als psychologische brug tussen huidig gedrag
en toekomstbeeld. Jouw taak is die kaart niet-medisch en niet-alarmerend te
vertalen naar één App-home-scherm.

═══════════════════════════════════════════════════════════════════════════════
HARDE CONTEXT — GEVERIFIEERD TEGEN DE CODEBASE OP 23 JULI 2026
Neem dit als waar aan. Verzin geen alternatieve staat en ga niet uit van eerdere
analysedocumenten waar die hiermee conflicteren.
═══════════════════════════════════════════════════════════════════════════════

DOMEINEN EN ROLLEN (bestaand)

- Er zijn 5 INTERVENTIE-domeinen (je stuurt erop, ze hebben een leefstijlplan):
  slaap, stress, voeding, beweging, verbinding.
- Er zijn 2 READOUT-domeinen (uitkomsten die je afleest, geen eigen plan):
  energie, herstel. Een readout verwijst naar zijn drivers, hij wordt niet zelf
  "gedaan".
- De driver-mapping bestaat al en is editoriaal (verfijnbaar):
    energie wordt gevoed door slaap + voeding + beweging.
    herstel wordt gevoed door slaap + beweging + stress.
- Voeding is in dit model een INTERVENTIE-domein, maar functioneel gedraagt het
  zich transversaal: het is vooral een driver van de readouts (energie), minder
  een domein met een eigen dagelijkse hero. Behandel het als "versterker", niet
  als een zesde gelijkwaardige as in het diagram.
- Verbinding is PSF-specifiek en zit NIET in de studie. Positioneer het als
  moderator op stress/motivatie, niet als biologisch mechanisme in het diagram.

STATUS-BANDEN (bestaand, compliance-keuze)

- Domeinstatus wordt getoond in vier banden: Sterk / Voldoende / Aandacht /
  Prioriteit. Dit is een BEWUSTE KOAG-keuze: GEEN numerieke totaalscore in
  UI-copy, geen leeftijdspercentielen. De banden zijn de enige toegestane
  aggregatie.
- Readouts (energie/herstel) worden compact getoond met een driver-hint
  ("wordt vooral gevoed door slaap"), nooit als eigen check-off.

TWEE MEETLATTEN (bestaand, mag NIET gemengd worden)

- ADHERENCE = gedrag: dagen met ≥1 actie t.o.v. je plandoel. Bron: het dagelijkse
  actie-log (account-scoped, executie-SSOT). Adherence is GEEN score en mag er
  ook niet als score uitzien.
- BELEVING = hoe je je voelt op een domein. Bron: de domein-check-in. Dit is een
  episodische meting, geen dagelijkse waarde.
- EVIDENCE (alleen beweging): minuten/sessies uit het bewegingssessie-log.
  Gelockte regel: minuten zijn EVIDENCE, nooit een tweede score.
- De leefstijllijn (trend over tijd) beweegt VANDAAG uitsluitend op beleving +
  voedingslog. Hij importeert op dit moment GEEN enkele gedragsbron. "Gedrag
  loggen ≠ je lijn zien bewegen" is precies het gat.
- Een afgeleide weekfunctie die adherence + beleving + evidence samenbrengt
  (buildWeeklyLifestyleLog) is VOORGESTELD maar NOG NIET GEBOUWD. Ga er niet van
  uit dat hij bestaat; je ontwerp mag hem als geplande datalaag aannemen.

FUTURE YOU (bestaand, gelockt)

- Future You is een RICHTING, geen tegel en geen percentage. Er is bewust GÉÉN
  "Future You Score 62→78" — dat zou een verzonnen tweede cijfer zijn.
- Future You leeft in copy en richting, gevoed door het motivatie-anker (er zijn
  vier ankers). Op de home is Future You hooguit één zin.

WEARABLES (bestaand, niet actief)

- HRV, rustpols en slaapduur bestaan als signaal-placeholders met status
  "binnenkort" en lege data. Ze zijn NIET geactiveerd. Biomarkers zijn geen
  user-facing metric; hooguit een toekomst-placeholder.

APP-HOME IA (bestaand besluit)

- De nav is: Vandaag* · Agenda · Voortgang · Hermeting. De reis (waypoints) leeft
  read-only in Jouw route/Voortgang, niet in de nav.
- De Vandaag-hero (prioriteitsdomein) is DOMINANT en is de ENIGE check-off.
  Domeinen staan eronder als compacte, gedegradeerde scanstrip.
- GEEN koop/affiliate/supplement-verkoop in het dashboard. Hoogstens een
  contextuele voeding-hint die naar een gids linkt.
- De diepere leefstijllijn/trend leeft in de Voortgang-tab, niet op de home.

═══════════════════════════════════════════════════════════════════════════════
HARDE VERTAALREGELS — studie → PSF (respecteer deze, bediscussieer ze niet)
═══════════════════════════════════════════════════════════════════════════════

1. SLE (subjectieve levensverwachting) ≠ medische levensverwachting. Vertaal het
   naar "toekomstbeeld" / "Future You-richting". NOOIT een leeftijdsgetal
   ("word ik 85?"), nooit een levensverwachting-score.
2. Biomarkers (HRV, IL-6, telomeren, VO2max, cortisol) zijn NOOIT een user-facing
   metric. Hooguit achtergrondlogica in copy ("meer rust in je lichaam") of een
   wearables-placeholder die op "binnenkort" staat.
3. Geen mortaliteits- of ziektetaal. Geen "risico op...", geen "dit verkort je
   leven". De toon is de rust van een gids, niet de urgentie van een fitness-app.
4. Voeding is transversaal: geen zesde hoofd-as in het diagram, wél zichtbare
   verbindingen naar de readouts (vooral energie).
5. Verbinding is een moderator op stress/motivatie, geen biologisch mechanisme.
   Forceer het niet in het diagram alsof het een fysiologisch pad is.
6. Geen diagnose, geen normwaarde als oordeel, geen medische claim.

═══════════════════════════════════════════════════════════════════════════════
GELOCKTE INVARIANTEN — het diagram mag deze NIET breken
═══════════════════════════════════════════════════════════════════════════════

1. Eén check-off: uitsluitend de Vandaag-hero. Het diagram vinkt niets af en is
   nergens een tweede takenlijst.
2. Geen streaks, badges, vlammetjes, calorieën of schuld-mechaniek.
3. Adherence is geen score en ziet er niet als score uit.
4. Future You leeft in copy/richting, nooit als percentage of tweede cijfer.
5. KOAG: geen numerieke totaalscore in UI-copy. Alleen de vier banden.
6. Geen nieuw invoerscherm. Alles wordt AFGELEID uit bestaande logs; de enige
   uitzondering die je mag voorstellen is één lichte SLE-proxy-vraag, en dan
   alleen bij de hermeting (niet dagelijks op de home).
7. Geen affiliate of koop-CTA in het dashboard.
8. Nieuwe client-events vereisen registratie op drie plekken (event-definitie,
   client-helper, server-allowlist). De roadmap is bovendien reuse-first: verzin
   een nieuw event alleen als geen bestaand surface-event het meetdoel dekt, en
   verantwoord die keuze expliciet.

═══════════════════════════════════════════════════════════════════════════════
INPUT-HINT 1 — DOMEINMAPPING studie → PSF (RUW VOORSTEL, beoordeel kritisch)
Dit is materiaal om te verfijnen of te verwerpen, GEEN antwoord dat je herhaalt.
═══════════════════════════════════════════════════════════════════════════════

  Studie-concept                 → PSF-equivalent          Rol in UI
  ─────────────────────────────────────────────────────────────────────────────
  Sleep Quality (SQ)             → Slaap                   interventie-pijler
  Physical Activity (PA)         → Beweging                interventie-pijler
  Dietary behavior / nutrition   → Voeding                 transversale versterker
  Psychological health           → Stress + Verbinding     interventie-pijlers
  (optimism, mood, control)
  Circadian / energy regulation  → Slaap-subsignaal +      mechanisme → readout
                                   Energie-readout
  Autonomic/metabolic/inflam.    → Herstel-readout         synthese, geen labwaarde
  Health perception              → Vitaalscore-band        aggregaat zonder cijfer
                                   (Sterk/…/Prioriteit)
  Subjective Life Expectancy     → Future You +            psychologische brug,
                                   toekomstbeeld-vraag        geen levensverwachting
  Motivation / adherence         → Weekritme + Vandaag     gedrag, geen gamification
  Virtuous/vicious loop (Fig.3)  → systeemdiagram App-home visuele kern

Beoordeel: klopt deze mapping? Waar wringt het (bv. voeding als "pijler" vs
"versterker", verbinding zonder studie-anker, energie als sub-signaal én readout)?
Herzie waar nodig en maak in sectie B expliciet wat je NIET overneemt en waarom.

═══════════════════════════════════════════════════════════════════════════════
INPUT-HINT 2 — DIAGRAM-VOORSTEL (RUW, beoordeel kritisch en herteken indien beter)
Dit is een startschets, GEEN eindontwerp. Kies desnoods een andere topologie.
═══════════════════════════════════════════════════════════════════════════════

Gedrag (interventies)        Hoe je je voelt (readouts)     Richting
  Slaap                        Energie                        Future You
  Beweging                     Herstel
  Voeding (versterker)
  Stress
  Verbinding

Voorgestelde verbindingen (verfijn):
  Slaap      ── ritme stabiel? ──▶ Energie
  Beweging   ── actief genoeg? ──▶ Herstel
  Voeding    ┈┈ versterkt ┈┈┈┈┈▶ Energie
  Stress     ── ontladen? ──────▶ Herstel
  Verbinding ┈┈ steun? ┈┈┈┈┈┈┈┈▶ Stress
  Slaap    ◀── wederzijds ──▶ Beweging
  Energie ─▶ Future You ◀─ Herstel
  Future You ── motivatie ──▶ Beweging   (de lus sluit zich)

Voorgestelde meetbaarheid per verbinding/knoop — TWEE signalen, VISUEEL GESCHEIDEN:
  ADHERENCE (bron: dagelijks actie-log) → dunne lijn / dot-intensiteit op de pijl.
      vb. "4/7 dagen slaapstap gedaan".
  BELEVING (bron: domein-check-in)      → trendpijl ↑→↓ naast de domeinknoop.
      vb. "Slaap: Aandacht → Voldoende".
  EVIDENCE (bron: bewegingssessie-log)  → alleen beweging, secundair, nooit score.
      vb. "45 min deze week".
Per knoop een statuskleur uit de vier banden. Readouts compact, met driver-hint.

Loop-indicator (afgeleide read-only badge, GEEN score):
  virtuous : ≥3 interventiedomeinen met adherence ≥60% ÉN ≥1 readout-trend ↑
  neutraal : gemengd
  vicious  : slaap ÉN beweging adherence laag ÉN readout-trend ↓
  copy: "Je lus draait de goede kant op" — NOOIT "je leeft langer".

Beoordeel dit voorstel scherp: is de topologie leesbaar op 375px? Zijn drie
signaalsoorten op één diagram niet te druk? Klopt de loop-drempel, of is die
willekeurig? Herteken vrij.

═══════════════════════════════════════════════════════════════════════════════
KERNOPDRACHT
═══════════════════════════════════════════════════════════════════════════════

Ontwerp een Kompas App-home die:
1. alle PSF-domeinen verbindt in één NIET-MEDISCH systeemdiagram dat toont dat de
   pijlers elkaar wederzijds voeden (virtuous/vicious-idee, niet-alarmerend);
2. per verbinding GEDRAG (adherence) en BELEVING (check-in-trend) NAAST elkaar
   toont, visueel gescheiden, nooit gemengd tot één cijfer;
3. de readouts (energie/herstel) als synthese positioneert, met driver-hints;
4. Future You als psychologische brug (SLE-equivalent) inzet zonder enige
   levensverwachting-claim;
5. voeding transversaal behandelt (versterker, geen zesde as);
6. de Vandaag-actie de enige, dominante CTA en enige check-off laat blijven;
7. binnen de bestaande App-home-viewport past (375px-first): groet +
   Future-You-regel → Vandaag-hero → diagram (compact, secundair) → scanstrip →
   forward-pointer naar Voortgang.

═══════════════════════════════════════════════════════════════════════════════
KRITIEKRONDE (verplicht vóór je definitieve versie)
═══════════════════════════════════════════════════════════════════════════════

Beoordeel je eigen ontwerp vanuit vier perspectieven. Per perspectief 2–3 scherpe
kritiekpunten + 1 concrete verbetering:
1. Gedragswetenschapper (self-efficacy, terugkeer-lus, motiveert een systeemkaart
   of overweldigt hij?)
2. 45-jarige gebruiker met een drukke week en matige motivatie (snap ik dit
   diagram in 3 seconden, of is het een grafiek waar ik langs scroll?)
3. Compliance/privacy-officer (KOAG, AVG art. 9, geen medisch-worden, geen
   mortaliteitstaal, geen totaalscore die stiekem terugkomt via het diagram)
4. Frontend-ontwikkelaar (haalbaar op 375px binnen de cockpit-shell? staats-
   explosie? kost een afgeleide loop-status extra queries?)

Verwerk de kritiek en markeer expliciet wat je hebt gewijzigd t.o.v. versie 1.

═══════════════════════════════════════════════════════════════════════════════
OUTPUTFORMAAT (exact deze secties A–J, in deze volgorde)
═══════════════════════════════════════════════════════════════════════════════

A. EXECUTIVE SUMMARY (max 200 woorden). Kernbeslissing + GO/PIVOT/KILL op:
   systeemdiagram op de home, dubbele meetlaag op het diagram, loop-indicator,
   SLE-proxy. Eén zin onderbouwing per verdict.

B. DOMEINMAPPING studie → PSF. Definitieve tabel met per rij: studie-concept,
   PSF-equivalent, rol in UI, bron. Plus een expliciete "WAT WE NIET TONEN"-lijst
   (biomarkers, mortaliteit, SLE-als-leeftijd, totaalscore).

C. INTEGRATIEF DIAGRAM. ASCII/wireframe voor 375px (mobiel, leidend) én desktop.
   Toon topologie, welke pijlen wederzijds zijn, waar adherence/beleving/evidence
   visueel landen, en hoe de readouts (energie/herstel) als synthese verschijnen.
   Geef minstens twee toestanden: virtuous en vicious.

D. MEETCONTRACT per pijl/knoop. Tabel: element | signaal (adherence/beleving/
   evidence) | bron | weergave | voorbeeld-copy. Maak per gegeven expliciet: bron,
   scope (account of sessie), en wie ervan leest. Markeer welke velden NIEUW zijn.

E. LOOP-INDICATOR LOGICA. Virtuous/neutraal/vicious als formules IN WOORDEN.
   Drempels, edge cases (nieuwe gebruiker zonder historie · maar 1 domein actief ·
   geen enkele check-in nog). Waarom dit read-only is en geen score.

F. COPY-HIËRARCHIE. Welke zinnen op de App-home (primair/secundair/tertiair),
   welke in de inspector, welke pas in Voortgang. Concrete NL-labels, feit-eerst,
   geen coach-cliché, geen diagnose-taal. Inclusief de loop-copy (goed vs
   afgekeurd) en de Future-You-regel.

G. SLE-PROXY: wel/niet, en zo ja: exacte formulering (5-punts), plaatsing
   (uitsluitend hermeting), consent-overweging, en hoe je de trend naast Future
   You toont zonder leeftijdsgetal. Als NIET: wat lost het onderliggende
   toekomstbeeld-verlangen anders op?

H. MEETPLAN. Per nieuwe surface het event, de payload-velden, hergebruik-of-nieuw
   (reuse-first!), en bij nieuw de drievoudige registratie (event-definitie +
   client-helper + server-allowlist). Geen PII. Weeg de voorgestelde events
   (integrative_loop.view / edge_tap / cta) tegen bestaande surface-events.
   Sluit af met: "Meetpunt: <event(s)> — hier lees je het effect af."

I. FASERING. MVP (afgeleide read-laag: loop-status + diagram, geen nieuwe input)
   vs fase 2 (SLE-vraag bij hermeting, wearables-placeholder later). Per fase:
   user-visible, backend/datalaag, acceptatiecriterium.

J. RISICO'S. KOAG (verkapte totaalscore via het diagram), AVG art. 9,
   "medisch worden", gamification-valkuilen (loop-badge die als streak voelt),
   en overload op 375px. Per risico één mitigatie. Daarna: open vragen voor
   Dennis (genummerd, elk mét jouw aanbevolen antwoord — geen open vraag zonder
   voorkeur).

Sluit af met een SELF-SCORECARD (1–10 + één regel motivatie) op vijf dimensies:
niet-medisch/compliance · mobiel 375px · leesbaarheid-in-3-seconden ·
dev-realisme · trouw-aan-het-integratiemodel. En een lijst ANTI-PATTERNS die je
ontwerp expliciet vermijdt (minimaal: tweede check-off, verkapte totaalscore,
biomarker-als-metric, mortaliteitstaal, streak-achtige loop-badge, diagram als
zesde takenlijst).

═══════════════════════════════════════════════════════════════════════════════
VERBODEN / CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- GEEN code, GEEN diffs, GEEN bestandsnamen met regelnummers als "voorstel-patch".
  Je mag bestaande artefacten noemen om naar te verwijzen; je wijzigt niets.
- GEEN biomarkers als user-facing metric.
- GEEN mortaliteits-/levensverwachting-taal, geen leeftijdsgetal.
- GEEN streaks, badges, tweede scores, verkapte totaalscore.
- GEEN nieuw dagelijks invoerscherm — alles afleiden uit bestaande logs. De enige
  toegestane nieuwe input is één SLE-proxy-vraag bij de hermeting.
- GEEN affiliate of koop-CTA in het dashboard.
- Alle voorgestelde events blijven VOORSTELLEN — je registreert niets.
- Als iets onduidelijk is: kies de sterkste optie, documenteer de aanname als
  "AANNAME: ...", en ga door. Verzamel open vragen in sectie J, elk met voorkeur.
- Denk diep. De domeinmapping en het diagram in deze prompt zijn RUWE HINTS, geen
  antwoord — beoordeel ze kritisch en herteken vrij waar dat beter is.

BEGIN.
```

---

## Verwachte output (checklist)

- [ ] **A** — Executive summary + GO/PIVOT/KILL per idee (diagram, dubbele meetlaag, loop-indicator, SLE-proxy)
- [ ] **B** — Definitieve domeinmapping + expliciete "wat we NIET tonen"-lijst
- [ ] **C** — Integratief diagram: 375px + desktop wireframe, virtuous én vicious toestand
- [ ] **D** — Meetcontract per pijl/knoop (adherence · beleving · evidence, bron/scope/nieuw)
- [ ] **E** — Loop-indicator logica in woorden + edge cases
- [ ] **F** — Copy-hiërarchie per oppervlak, loop-copy goed vs afgekeurd
- [ ] **G** — SLE-proxy: wel/niet, formulering, plaatsing bij hermeting, consent
- [ ] **H** — Meetplan met reuse-first + drievoudige registratie
- [ ] **I** — Fasering: MVP read-laag vs fase 2 (SLE-vraag, wearables)
- [ ] **J** — Risico's (KOAG/art.9/medisch/gamification/overload) + open vragen mét voorkeur
- [ ] Self-scorecard (5 dimensies) + anti-patterns-lijst

Geen code. Geen implementatie. Wel een blauwdruk die direct om te zetten is in bouwslices.

---

## Verificatie-log (23 juli 2026, tegen `main`)

Alle harde context in de prompt is geverifieerd. Twee premissen uit de opdracht bleken preciezer of anders te liggen en zijn in de prompt gecorrigeerd.

| Bewering in de prompt | Werkelijke staat | Bron |
|---|---|---|
| 5 interventie + 2 readout; readout-drivers energie=slaap/voeding/beweging, herstel=slaap/beweging/stress | **Bevestigd.** `DOMAIN_ROLE` + `READOUT_DRIVERS` exact zo | [domain-role.ts:9-23](../../src/lib/domain-role.ts#L9-L23) |
| Vier banden Sterk/Voldoende/Aandacht/Prioriteit; KOAG = geen numerieke totaalscore | **Bevestigd.** Drempels 80/60/40; commentaar noemt de KOAG-keuze expliciet | [score-display.ts:1-3,22-36](../../src/lib/score-display.ts#L1-L36) |
| Leefstijllijn importeert géén gedragsbron; beweegt alleen op beleving/voedingslog | **Bevestigd.** Importeert alleen `PILLARS`, `domain-role`, types | [leefstijllijn.ts:1-9](../../src/lib/leefstijllijn.ts#L1-L9) |
| Adherence vs beleving = twee gescheiden meetlatten, niet mengen | **Bevestigd.** §3 "Twee meetlatten — niet mengen" | [PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md](../plan/PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md) |
| "buildWeeklyLifestyleLog bestaat al" | **Gecorrigeerd → VOORGESTELD, nog niet gebouwd.** Fase A-voorstel, geen code in main | [PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md §7](../plan/PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md) |
| `buildWeekRhythm()` bestaat (weekritme) | **Bevestigd.** Neemt `loggedStepIds`, geeft `WeekRhythmChip[]` | [movement-week-rhythm.ts:32](../../src/lib/movement-week-rhythm.ts#L32) |
| `movementAnchor` = Future-You-bron (4 ankers) | **Bevestigd.** `ANSWER_KEY_MOVEMENT_ANCHOR`; vier ankers in ONTWERP §5.2 | [movement-prefs.ts:25](../../src/lib/movement-prefs.ts#L25) |
| Future You = copy/richting, géén percentage; geen "62→78"-cijfer | **Bevestigd.** Expliciet gelockt besluit | [ONTWERP_BEWEEGDASHBOARD…md:201,252](../plan/ONTWERP_BEWEEGDASHBOARD_BESTURINGSSYSTEEM.md) |
| Eén check-off (Vandaag-hero), geen streaks/badges | **Bevestigd.** Kern-invariant + "geen rode badges, geen streaks" | [ONTWERP_BEWEEGDASHBOARD…md:55,362](../plan/ONTWERP_BEWEEGDASHBOARD_BESTURINGSSYSTEEM.md) |
| Wearables (HRV/rustpols/slaapduur) = placeholder "binnenkort", lege data | **Bevestigd.** `SIGNALS` met `status:"binnenkort"`, `data:[]`, `source:"wearable"` | [data/dashboard/index.ts:170-198](../../src/data/dashboard/index.ts#L170-L198) |
| Tabellen bestaan: dagelijks actie-log, bewegingssessie-log, domein-check-in, voedingslog | **Bevestigd.** Migraties aanwezig | `daily_action_log` · `movement_session_log` · `intake_domain_checkin` · `intake_intake_log` (supabase/migrations/) |
| App-home: Vandaag-hero dominant, diagram secundair, nav Vandaag·Agenda·Voortgang·Hermeting, geen koop/affiliate | **Bevestigd.** §3 "Besloten (23 jul)" | [ANALYSE_DASHBOARD_HOME_EN_COCKPIT_IA.md §3](../plan/ANALYSE_DASHBOARD_HOME_EN_COCKPIT_IA.md) |

**Correctie t.o.v. de opdracht:** de link naar de wekelijkse-leefstijllog stond in de opdracht op één plek verkeerd gespeld (`…LEEFSTIJKLOG.md`). Correct pad is [`PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md`](../plan/PLAN_WEEKLIJKSE_LEEFSTIJLLOG.md).

---

## Volgende stap na Opus-output

1. Dennis reviewt sectie **A** (verdicts) en **J** (risico's + open vragen).
2. Als GO: **Fase A** in een aparte sessie — pure read-model `buildIntegrativeLoopStatus()` in `src/lib/` (geen UI, geen nieuwe tabel), leunend op de nog te bouwen `buildWeeklyLifestyleLog()` als datalaag.
3. **Fase B**: `IntegrativeLoopDiagram`-component op de Kompas App-home (compact, 375px-first, secundair aan de Vandaag-hero).
4. **Fase C**: SLE-proxy-vraag bij de hermeting, achter een aparte consent-check.

Meetpunt: geen — dit document activeert niets. Het meetplan wordt in sectie H van de Opus-output gespecificeerd en pas bij implementatie geregistreerd (drievoudige client-event-registratie waar van toepassing).
