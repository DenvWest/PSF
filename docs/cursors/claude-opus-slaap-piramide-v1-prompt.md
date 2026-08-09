# Prompt — Slaap S1: prioriteitenladder v1 (Voortgang + check-in readout)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (nieuw gesprek, Artifacts aan).
> **Output:** design/IA-spec **A t/m M** + **één standalone HTML-prebuild** met drie frames (VQ vraag · VR resultaat · VL Voortgang-piramide). Geen React, geen repo-patch.
> **Doelbestand na review:** `docs/cursors/claude-opus-slaap-piramide-v1-verdict-2026-08.md`
> **HTML na review:** `docs/design/slaap-piramide-prebuild-v1-2026-08.html`
> **Opgesteld:** 9 augustus 2026.

---

## Plaats in de reeks


| Doc                                                                                                                        | Relatie                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `[claude-opus-beweging-r0-resultaat-prompt.md](claude-opus-beweging-r0-resultaat-prompt.md)`                               | **R0-bridge** — feit → delta → implicatie → routing; SSOT readout VR/VL                                           |
| `[claude-opus-beweging-v3.4-prompt.md](claude-opus-beweging-v3.4-prompt.md)`                                               | **Surface-contract** — scherm C op Voortgang: ladder-rail + max 3 acties; laag 6 gegate; **inhoud niet kopiëren** |
| `[claude-opus-voeding-piramide-v1-prompt.md](claude-opus-voeding-piramide-v1-prompt.md)`                                   | **Drie-frame-sjabloon** — VQ/VR/VL + state-switcher + gedeeld readout                                             |
| `[claude-opus-kompas-laag-commissie-prompt.md](claude-opus-kompas-laag-commissie-prompt.md)`                               | **Governance** — productlagen L1–L3 ≠ rung 1–6; commissie-sectie H                                                |
| `[fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md](fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md)` | **C.1 analyse-shell** — uniform domeincontract                                                                    |
| `[BESLUIT_BEWEGING_PRODUCT_EN_IA.md](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md)`                                         | §A.2 L1–L3 · §A.4 verboden · §C.2 woorden · §G.1 supplement-poort                                                 |
| `[STEPPED_CARE_MODEL.md](../core/STEPPED_CARE_MODEL.md)`                                                                   | Tier 1–3 trap · supplement pas tier 3 · geen statusclaim                                                          |
| Dit document                                                                                                               | **Slaap S1 lock** — zeslagen prioriteitenladder + intake-readout; geen coaching-encyclopedie                      |


---

## Wat S1 oplost

Slaap is **primair in Kompas** (eerste pijler) maar **secundair in L2-IA**:

- **Live:** volledige slaapcheck (`SleepCheckin.tsx`, 9 vragen + consent), assessment (`sleep-assessment.ts`), delta (`sleep-delta.ts`), dashboard-cockpit (`SleepScreen.tsx`), gids-analyse (`SleepAnalysisFlow.tsx`).
- **Ontbreekt:** de **zeslagen prioriteitenladder** op Voortgang › Slaap — de hiërarchie *gelegenheid → ritme → gedrag → omgeving → gerichte interventies → meten/aanvullen* die Dennis als canon heeft.
- **Risico zonder S1:** resultaat blijft supplement-first (magnesium op intake), generieke "3 acties", keuzeknoppen op C.1 — terwijl beweging en voeding naar piramide-first gaan.

**S1 lockt:** één slaap-prioriteitenladder (eigen laagnamen), drie surfaces (VQ/VR/VL), gedeeld readout-contract (C.1), en laag 6 als **gegate vergelijk-deur** — geen productschap op intake.

**Cruciale nuance (prominent in ontwerp):**

- Dit is een **beslis- en prioriteringsmodel**, geen ranglijst om "omhoog te klimmen".
- **Laag 6 = gespecialiseerd/experimenteel**, niet waardevoller dan laag 2.
- **Laag 5 is niet simpelweg "hoger" dan laag 4** — bij chronische insomnia wint CBT-I boven een duur matras.

---

## Gebruiksinstructie

1. Open Claude Opus, nieuw gesprek, Artifacts aan.
2. Voeg bijlagen toe (checklist hieronder).
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Verwachte output: **A t/m M**, met **K** als klikbaar HTML-bestand (drie frames + state-switcher).
5. Review **B**, **D**, **E**, **I**, **K** op **375px** primair.
6. Sla verdict op als `docs/cursors/claude-opus-slaap-piramide-v1-verdict-2026-08.md`.
7. Sla HTML op als `docs/design/slaap-piramide-prebuild-v1-2026-08.html`.

### Bijlagen-checklist

- **Verplicht** — screenshot slaapcheck-resultaat (375px): `/intake/slaap` na volledige check
- **Verplicht** — screenshot dashboard Slaap-cockpit (375px): `/dashboard?kompas=slaap`
- **Aanbevolen** — `[beweging-checkin-readout-prebuild-r0-2026-08.html](../design/beweging-checkin-readout-prebuild-r0-2026-08.html)` — `.checkin-readout` patroon
- **Aanbevolen** — `[beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html)` scherm C — **alleen surface-contract**
- **Aanbevolen** — `[WRITING_VOICE.md](../core/WRITING_VOICE.md)`
- **Aanbevolen** — Dennis' slaapladder-canonical (6 lagen + tweede-as model) — staat ingebed in prompt CANON

---

## Prompt (copy-paste)

```text
═══════════════════════════════════════════════════════════════════════════════
ROL
═══════════════════════════════════════════════════════════════════════════════

Je bent Senior product designer + evidence editor voor PerfectSupplement
(perfectsupplement.nl) — de Consumentenbond van leefstijl voor mannen 40+.

Positionering (niet onderhandelbaar):
  • Screening + rangschikking + gated productvergelijking — GEEN coaching-app,
    GEEN slaaptracker-clone, GEEN CBT-I-therapieplatform, GEEN Oura-clone.
  • Leefstijl eerst; supplement/gadget pas laag 6, achter poorten.
  • Adviezen, geen diagnoses; zelfrapportage, geen slaapstoornis-label.

Je levert GEEN React, GEEN repo-patch, GEEN SQL. Je levert:
  1. Een design/IA-spec secties A t/m M (markdown in je antwoord)
  2. Één self-contained HTML-prebuild (vanilla JS, inline CSS, Google Fonts OK,
     geen CDN-assets behalve fonts, geen emoji) — sectie K

═══════════════════════════════════════════════════════════════════════════════
NOORDSTER — slaap v1
═══════════════════════════════════════════════════════════════════════════════

> Eerst voldoende slaap mogelijk maken. Daarna reguleren. Vervolgens verstorende
> factoren aanpakken. Pas daarna optimaliseren — en bij echte klachten gericht
> behandelen.

De hoogste vorm van slaapoptimalisatie is niet een Oura Ring of het perfecte
supplement — het is dat je jezelf structureel genoeg tijd, ritme en rust geeft
om te herstellen.

Pas wanneer dát staat, worden omgeving-finetuning, tracking, supplementen en
biohacks interessant.

Sorteervolgorde (BACKSTAGE — nooit als UI-assen of gamification):
  impact × wetenschappelijke onderbouwing × breedte van effect × eenvoud ×
  kosten × volhoudbaarheid

Tweede as (BACKSTAGE — wel in spec sectie E, optioneel mini-diagram in HTML
footnote, GEEN dubbele UI-assen):

  As 1 — Hoe fundamenteel?     basis → optimalisatie
  As 2 — Hoe sterk het bewijs? sterk → onzeker

Voorbeeld backstage-positionering (niet als scorekaart tonen):
  slaapduur/regelmaat/daglicht = hoog fundament + sterk bewijs
  CBT-I = hoog fundament bij chronische insomnia + zeer sterk bewijs
  omgeving = conditioneel fundament + sterk maar persoonafhankelijk
  trackers/supplementen/biohacks = laag fundament + wisselend/onbekend bewijs

Populatierichtlijn (max 1 regel footnote, NHLBI-anker):
  gezonde volwassenen: regelmatig minstens 7 uur slaap als gangbare ondergrens;
  individuele behoefte verschilt.

═══════════════════════════════════════════════════════════════════════════════
PROBLEEM — waarom slaap nu een prebuild nodig heeft
═══════════════════════════════════════════════════════════════════════════════

Live in repo (aug 2026):
  • src/components/intake/SleepCheckin.tsx — 9 vragen, consent, result
  • src/data/sleep-checkin/index.ts — SLEEP_QUESTIONS, duur, regie, context
  • src/lib/sleep-assessment.ts — assessSleep, buildSleepConclusion, magnesium gate
  • src/lib/sleep-delta.ts — sleepDirection, sleepStartStatement
  • src/components/dashboard/SleepScreen.tsx — cockpit + tools, geen L2-piramide
  • src/components/sleep/SleepAnalysisFlow.tsx — gids-flow (los van dashboard)

Wat faalt op het huidige resultaat (SleepCheckin.tsx):
  • "Jouw volgende 3 acties" — generieke MAINTENANCE_ACTIONS of focus-acties
  • "Kies zelf je eerste stap" — interactieve knoppen op C.1 (hoort op L1/L2)
  • Magnesium-vergelijk-link op resultaat — supplement vóór piramide
  • "Sinds je start" — alleen totaalscore, geen per-dimension delta
  • Geen koppeling Voortgang — twee waarheden

Wat ontbreekt:
  • Geen Voortgang › Slaap-prioriteitenladder (L2 analyse-shell)
  • Geen brug: check-in → Voortgang-piramide → (later) vergelijk-deur laag 6
  • Geen persoonlijk prioriteitenprofiel ("grootste winst / goed op orde / niet nu")

Dit is geen styling-probleem. Het is een ontbrekend C.1-model + L2-piramide.

═══════════════════════════════════════════════════════════════════════════════
HARDE LOCKS — schending = afgekeurd
═══════════════════════════════════════════════════════════════════════════════

L1  GEEN beweging/voeding-ladder kopiëren. Slaap heeft ZES EIGEN lagen (namen
    hieronder). Zelfde surface-contract als v3.4 scherm C, andere inhoud.

L2  GEEN ordinaal in UI: nooit "laag 4 van 6", nooit voortgangsbalk over piramide,
    nooit "stijg omhoog", nooit evidence-emoji's als labels — evidence backstage.
    De piramide-visual mag breedte=fundament tonen, maar copy moet zeggen
    "prioriteitenladder" / "waar eerst aandacht naartoe" — niet "level up".

L3  LAAG 5 ≠ HOGER DAN LAAG 4 — verplichte callout in VL en in piramide-chrome:
    "Bij echte slaapklachten kan een gerichte behandeling belangrijker zijn dan
    een beter matras." Geen verticale rangorde tussen 4 en 5 suggereren.

L4  VERBODEN UI-WOORDEN (BESLUIT §C.2 + slaap-specifiek), ook aria-labels:
    stappenplan · route · fase · spoor · level · trede X van Y · cockpit · kompas ·
    journey · biohack · sleep score · deep sleep minuten · perfecte slaap

L5  INTake RESULTAAT (VR): GEEN genummerde actielijst, GEEN keuzeknoppen,
    GEEN supplement-kaart boven fold, GEEN melatonine/magnesium-promotie.
    Analyse + routing only (R0-parity).

L6  LAAG 6 ALTIJD GEGATE (STEPPED_CARE tier 3 + BESLUIT §G.1):
    slaapcheck gedaan ÉN minstens één aandacht-signaal op laag 1–3.
    Zonder gate: toon WAAROM niet ("eerst gelegenheid, dan potje") — geen productlink.
    Met gate: max label-only "Vergelijk op prijs en kwaliteit →" — geen prijs/foto.

L7  SSOT: frame VR (check-in) en frame VL (Voortgang) tonen hetzelfde
    conclusie-blok (.checkin-readout) — alleen omringende chrome verschilt.

L8  VR primaire CTA → Voortgang › Slaap (niet supplement, niet /intake/plan/sleep
    als hero). Secundair: gids/onderbouwing footnote.

L9  MEDISCH / COMPLIANCE:
    • Geen diagnose ("jij hebt insomnia") — wel: "signalen om verder te kijken"
    • CBT-I = evidence-based behandeling — platform levert GEEN therapie;
      copy = professionele route / bespreek met huisarts of slaaptherapeut
    • 7+ uur = populatierichtlijn, geen persoonlijke norm of schuld-meter
    • Alcohol: mythe vs werkelijkheid ("sneller inslapen ≠ betere slaap")
    • Wearables: trends/experimenten; geen deep-sleep-minuten als diagnose;
      drie stappen: meten → interpreteren → handelen
    • Supplementen: evidence matrix (niet "deze verbeteren slaap"); alleen
      EFSA-goedgekeurde claims; geen melatonine als default-advies

L10 GEEN slaapdagboek-app, wearable-sync, CBT-I-module, of bloed/slaaplab in v1 HTML.
     Laag 5 klinische route = uitleg + doorverwijzing, geen behandelprogramma.

L11 GEEN puntenstelsel of gamification. Self-calibratie max laag 5; laag 6 niet
     zelf instelbaar.

L12 Delta-copy: antwoordlabels uit check-in, GEEN woord "band" in user-facing copy.
     Status backstage: aandacht | redelijk | sterk.

═══════════════════════════════════════════════════════════════════════════════
CANON — ZES LAGEN SLAAP (inhoud lock — comprimeer voor UI)
═══════════════════════════════════════════════════════════════════════════════

Gebruik deze laagnamen in UI (NL):

  LAAG 1 · Slaapgelegenheid
  LAAG 2 · Ritme & slaapgewoonten
  LAAG 3 · Gedrag & timing
  LAAG 4 · Slaapomgeving
  LAAG 5 · Gerichte interventies
  LAAG 6 · Meten, gadgets & aanvullen

ASCII-referentie (mag visueel mooier; betekenis identiek):

                         ▲
                        / 6 \     Technologie · tracking · experimenten
                       /-----\    Supplementen · biohacks
                      /     \
                     /  5   \     Gerichte behandeling / specifieke interventies
                    /-------\    CBT-I · slaapstoornissen · professionele hulp
                   /       \
                  /   4     \     Slaapomgeving
                 /-----------\    Licht · geluid · temperatuur · bed · prikkels
                /           \
               /     3       \     Gedrag & timing
              /---------------\    Daglicht · beweging · cafeïne · alcohol · avond
             /               \
            /       2         \     Ritme & slaapgewoonten
           /-------------------\    Vaste tijden · routine · voldoende ontspanning
          /                   \
         /         1           \   Slaapgelegenheid
        /_______________________\  Tijd · prioriteit · 7+ uur als uitgangspunt

── Laag 1 · Slaapgelegenheid — FUNDAMENT ──

  Kernvraag: Geef je jezelf daadwerkelijk genoeg tijd en gelegenheid om te slapen?

  Wat eronder valt (UI: max 4 chips + collapse):
    • voldoende tijd in bed reserveren
    • slaap niet structureel opofferen voor werk, series, gamen, sociale media
    • realistische bedtijd
    • rekening houden met persoonlijke slaapbehoefte
    • voldoende hersteltijd bij slaaptekort

  Backstage: bewijs zeer sterk · impact zeer hoog · kosten nul · iedereen

  Bezoekerstakeaway (copy-lock):
    Niet: "Ik moet 8 uur slapen."
    Wel: "Hoeveel slaap heb ik daadwerkelijk nodig, en geef ik mezelf daar
    structureel de kans toe?"

  Interactieve mock (HTML K, laag 1 expanded):
    "Waar verdwijnt jouw slaaptijd?" — chip-select: werk · reistijd · telefoon ·
    Netflix/gamen · kinderen · sociale activiteiten · piekeren · te laat naar bed.
    Reflectie: slaap als tijdmanagement, niet alleen gezondheidsadvies.

  Check-in mapping: duur (SLEEP_DUUR_QUESTION) · grip laag (regie)

── Laag 2 · Ritme & slaapgewoonten — STERKE BASIS ──

  Principes:
    • redelijk vaste bedtijd — niet te absoluut ("22:30 dus ik móét slapen" = fout)
    • vooral redelijk vaste opsta-tijd (praktischer anker)
    • niet iedere dag compleet ander ritme
    • herkenbare avondroutine · voldoende afbouwtijd

  Nuance (copy-lock): Consistentie > perfectie. Vaste opsta-tijd wint vaak van
  obsessief exacte bedtijd.

  Backstage: NHLBI — consistent slaap-waakritme, ook weekend; grote verschuivingen
  verstoren ritme. Footnote, geen wet.

  Interactieve mock: 7-daags opsta-experiment — één verandering, daarna evalueren:
  slaapduur · energie · slaperigheid · stemming · concentratie.

  Check-in mapping: SLP_CONS · grip

── Laag 3 · Gedrag & timing — STERKE PRAKTISCHE LAAG ──

  Clusters (UI max 4, niet encyclopedie):

  C1 Licht — "Veel licht overdag, minder stimulerend licht richting de nacht."
           Niet: angst voor elk scherm.

  C2 Cafeïne — timing + individuele gevoeligheid; NHLBI: effect tot ~8 uur.
              Experiment: "Wat gebeurt er als je cafeïne eerder stopt?"
              Niet: "Na 14:00 nooit meer koffie."

  C3 Alcohol — mythe-element: sneller inslapen ≠ betere slaap; lichtere slaap,
               meer nachtelijk wakker worden (NHLBI footnote).

  C4 Beweging + avond — "Beweeg overdag. Maak de overgang naar slaap makkelijker."
                        Niet: "Vanaf 20:00 geen schermen" als harde regel.

  Check-in mapping: winddown · nightload · morninglight · SLEEP_CONTEXT_QUESTIONS

── Laag 4 · Slaapomgeving — NUTTIG, CONDITIONEEL ──

  Basis: donker · stil · comfortabel · geschikte temperatuur · prettig bed ·
  notificaties beperken · telefoon buiten bereik als die verstoort.

  Copy-lock: "Verwijder de dingen die jouw slaap verstoren." — niet:
  "Maak je slaapkamer perfect."

  Nuance: goed matras compenseert geen structureel slaaptekort; perfect donker
  compenseert geen chronische insomnia.

  Interactieve mock — Slaapomgeving-scan (6 rijen):
    Licht · Geluid · Temperatuur · Bedcomfort · Telefoon/notificaties · Partner/huisgenoten
    Per rij: Geen probleem | Mogelijke verstoring → "Pak eerst je grootste verstoring aan."

  Check-in mapping: geen dedicated veld live — mock in HTML; spec noteert v2-veld.

── Laag 5 · Gerichte interventies — KLINISCHE ROUTE (≠ upgrade boven laag 4) ──

  Wanneer: niet "wat slechter slapen" optimaliseren, maar echte klachten.

  CBT-I — cognitieve gedragstherapie voor insomnia:
    evidence-based behandeling; AASM sterke aanbeveling chronische insomnia.
    Platform: uitleg + doorverwijzing, GEEN digitale CBT-I in v1.

  Signalen om verder te kijken (checklist, geen diagnose):
    langdurig moeite inslapen · vaak wakker · vroeg wakker · ondanks gelegenheid
    uitgeput · ernstige slaperigheid overdag · luid snurken/ademstops · onrustige
    benen · terugkerende klachten

  Copy-lock: doel verschuift van optimaliseren → onderzoeken → behandelen.

  Check-in mapping: SLP_ONSET · SLP_WAKE · SLP_QUAL (zwak + duur OK = laag 5 route)

── Laag 6 · Meten, gadgets & aanvullen — EXPERIMENTEEL (niet waardevoller) ──

  Sleep trackers — nuttig voor: trends · gedrag bewust maken · slaapduur grof ·
  experimenten. Niet: deep sleep minuten = probleem.

  Supplementen — evidence matrix (backstage tabel, samengevat in UI):

  Interventie          Bewijs        Waarde           Wanneer
  slaapduur            sterk         zeer hoog        iedereen
  regelmaat            sterk         hoog             iedereen
  daglicht/beweging    sterk         hoog             iedereen
  omgeving             sterk         wisselend        specifieke verstoring
  CBT-I                sterk         zeer hoog        chronische insomnia
  wearable             matig         wisselend        tracking/experiment
  supplement           matig/laag    afhankelijk      selectief
  biohack              laag          onbekend         experiment

  Gated vergelijk-deur: magnesium/melatonine alleen label-only link, approved claims.

── Persoonlijk prioriteitenprofiel (VR footer + VL tile) ──

  Max 3 banden, geen genummerde actielijst:

  Grootste winst:     (laag + concreet signaal uit check-in)
  Goed op orde:       (max 2 items)
  Niet nu optimaliseren: (trackers/supplementen als laag 1–3 nog open)

  Eerste experiment: één verandering, 14 dagen, meet energie/slaperigheid/functioneren —
  niet twintig dingen tegelijk.

═══════════════════════════════════════════════════════════════════════════════
BRONNEN — geverifieerd in repo (aug 2026)
═══════════════════════════════════════════════════════════════════════════════

Check-in:
  src/data/sleep-checkin/index.ts — SLEEP_QUESTIONS, duur, regie, context
  src/lib/sleep-assessment.ts — assessSleep, buildSleepConclusion, magnesiumGate
  src/lib/sleep-delta.ts — sleepDirection, sleepStartStatement
  src/app/api/intake/sleep-checkin/route.ts — POST/PATCH, checkin_completed event

Resultaat (te vervangen):
  src/components/intake/SleepCheckin.tsx — result-tak: acties, keuzes, magnesium
  src/components/sleep/SleepDashboardCta.tsx — dashboard routing

Dashboard:
  src/components/dashboard/SleepScreen.tsx — cockpit, geen piramide
  src/lib/account-dashboard.ts — sleepCheckinFocus, parseSleepCheckinFocus
  src/types/dashboard.ts — SleepCheckinFocus

Parity (niet blind kopiëren):
  docs/design/beweging-checkin-readout-prebuild-r0-2026-08.html — .checkin-readout
  docs/design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html — scherm C
  docs/cursors/claude-opus-voeding-piramide-v1-prompt.md — drie-frame structuur

IA:
  docs/design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md §A.2, §G.1
  docs/core/BRAND_POSITIONING.md · STEPPED_CARE_MODEL.md · WRITING_VOICE.md

Tokens: dashboard sage/cockpit (#132414 / #5A8F6A / #C8956C) op Voortgang;
        intake licht op VQ/VR — onderbouw keuze in sectie J.

Mapping check-in veld → laag (voor sectie C/D):

  duur                    → laag 1
  grip                    → laag 2
  SLP_CONS                → laag 2
  winddown, nightload     → laag 3
  morninglight            → laag 3
  SLP_ONSET, SLP_WAKE     → laag 5 OF laag 3 (engine: klacht vs gedrag)
  SLP_QUAL                → laag 5 (uitkomst) + readout
  sleepconfidence         → readout only, geen laag
  supplement/magnesium    → laag 6 ONLY, gated

═══════════════════════════════════════════════════════════════════════════════
OUTPUT — secties A t/m M
═══════════════════════════════════════════════════════════════════════════════

Schrijf elke sectie concreet. Geen vage aanbevelingen. Copy in het Nederlands.

── A · Diagnose huidige slaap-UX ──
Vergelijk SleepCheckin result met gewenst C.1-model + beweging R0. Tabel: kop,
conclusie, acties, focus, keuzeknoppen, supplement, delta, vervolg-CTA.
Waarom het nu supplement/hack-first voelt i.p.v. prioriteitenladder-first.

── B · Informatie-hierarchie per surface ──
Drie kolommen: VQ (vraag) · VR (resultaat) · VL (Voortgang).
Per blok: naam, prioriteit (1=must see), max regels, weg/behoud.
Expliciet: wat verdwijnt op VR (actielijst, keuzeknoppen, magnesium boven fold).

── C · Vraag-uitleg contract ──
Map bestaande velden naar help + laag-anker:

  duur, SLP_ONSET, SLP_WAKE, SLP_CONS, SLP_QUAL, grip,
  winddown, nightload, morninglight, sleepconfidence

Per veld: helpTitle, helpBody (2–3 zin), helpAnchor (laag 1–5),
benchmarkLabel? (alleen duur: "populatierichtlijn 7+ uur", met disclaimer)

UI: expandable "Waarom vragen we dit?" — default dicht.

── D · Feitelijke meting-readout (VR + VL) ──
Data-contract SleepFactRow:
  { fieldId, label, answerSummary, benchmarkLabel?, status: below|near|meets|na,
    layer: 1..6, priority: 'winst'|'ok'|'watch'|null }

Data-contract SleepCheckinSnapshot (spec):
  checkinId, measuredAt, focusDimension, focusLabel, focusBand (backstage),
  answerLabel, focusStatement, implicationLine, priorityProfile { winst, ok[], skip[] },
  firstExperiment { layer, action, durationDays },
  dimensionDeltas[], aggregateDirection, routingHint, statusChips[],
  clinicalSignals: boolean (laag 5 route?), layer6GateOpen: boolean

Delta-copy: spiegel beweging R0 — antwoordlabels, GEEN "band".
  Templates minimaal 6 met {placeholders}.

── E · Prioriteitenladder op Voortgang (VL) ──
Rail met 6 lagen — spiegel v3.4 scherm C:
  • Intro-callout: "Geen ranglijst — begin waar de winst het grootst is."
  • Laag 4–5 crossover callout (L3 lock) — visueel horizontaal of side-note, niet hoger/lager
  • Laag 1–3: "Wat kun je hier doen?" max 3 acties per laag
  • Laag 4: omgeving-scan mock-link (prebuild interactief)
  • Laag 5: signalen-checklist + professionele route copy (geen therapie-UI)
  • Laag 6: gated deur (L6 lock) + evidence matrix collapsed

Self-calibratie: "Waar denk je dat je nu zit?" — max laag 5.

Tweede-as diagram: ASCII in spec; optioneel footnote in HTML — geen score-assen UI.

── F · States ──
Minimaal 6 states:
  F1 eerste slaapcheck (geen delta) — laag 1 winst (duur)
  F2 hercheck verbetering (ritme/duur)
  F3 hercheck verslechtering (empathie, kleinere stap)
  F4 laag 1–2 focus, laag 3+ wacht
  F5 laag 5-signalen (insomnia-route, CBT-I copy)
  F6 laag 6 open vs dicht (gate)

Per state: frames, CTA, prioriteitenprofiel copy.

── G · Meetplan ──
Herbruik:
  checkin_completed { domain: 'slaap' } (server route bestaat)
  sleep_plan_link_click { surface }
  dashboard_slaap_premium_upsell { surface } — niet versterken op VR

Nieuw alleen indien gemotiveerd:
  sleep_checkin_routing_click { target: 'voortgang_slaap'|'onderbouwing' }
  sleep_question_help_opened { field_id }
  sleep_layer_action_click { layer, action_id }
  sleep_environment_scan_completed { top_disruption }

Geen PII in GA4/Clarity. Consent-bias noteren. Geen nieuwe domain_events zonder
drieplek-registratie (events.ts + client + allowlist).

── H · Commissie (verplicht — slash-prompts) ──
  /KRAAK AF [slaap S1 plan] — 5 redenen om nee te zeggen
  /WELKE AANNAMES zitten onuitgesproken in [jouw ontwerp]
  /PRE-MORTEM: slaap S1 mislukte over 6 weken — schrijf waarom
  /WAT ZIE IK OVER HET HOOFD in [jouw ontwerp]

Daarna: jouw tegenargument per punt + wat je in het ontwerp aanpast.
Compliance Officer moet expliciet spreken over CBT-I, 7u-richtlijn, supplement-gate.

── I · Copy-voorbeelden — 3 persona's ──
Volledige copy voor VR (niet bullets):

  I1 Duur-tekort: duur=5.5u, regelmaat redelijk, eerste check — laag 1 winst,
      laag 6 dicht, experiment +45 min gelegenheid
  I2 Weekend-ritme: SLP_CONS=1, duur OK, opsta-tijd wisselt — laag 2 winst,
      7-daags opsta-experiment
  I3 Insomnia-signalen: SLP_ONSET=1, SLP_WAKE=1, duur OK — laag 5 route,
      geen supplement-promotie; professionele hulp copy; laag 4 matras niet hero

── J · Layout 375px ──
ASCII stack per frame. Eén h1 per frame.
VR: readout → feitelijke rijen (max 4 + toon alles) → prioriteitenprofiel →
     eerste experiment → één CTA Voortgang → footnote
VL: stand-tegel placeholder → readout (identiek) → piramide-rail → laag 6 gate

── K · HTML-prebuild ──
Self-contained bestand. Vereisten:

  • Prebuild-chrome: switcher VQ | VR | VL + state-switcher F1–F6
  • Piramide-chrome bovenaan VL: "Prioriteitenladder — niet omhoog klimmen"
  • Frame VQ: één vraag (duur OF SLP_CONS) + help open/dicht
  • Frame VR: .checkin-readout + SleepFactRows + prioriteitenprofiel +
    vervolg-CTA "Bekijk je slaapbeeld →"
  • Frame VL: Voortgang chrome + piramide-rail + interactieve mocks:
      - laag 1: slaaptijd-chips
      - laag 2: 7-daags experiment mock
      - laag 4: omgeving-scan tabel
      - laag 5: signalen-checklist (geen diagnose-label)
      - laag 6: evidence matrix + gate F5/F6
  • Laag 4–5 crossover callout zichtbaar in VL
  • Gedeeld: .checkin-readout identiek VR/VL (L7)
  • DM Sans + DM Serif Display; offline na fonts-load
  • Geen emoji; geen verboden woorden L4
  • Geen magnesium/supplement in VR fold

── L · Cursor-implementatie-hints (na review) ──
Slices S1a–S1e (geen code, wel bestanden):

  S1a Data: src/data/sleep/lifestyle-pyramid.ts — zes lagen + acties + signalen
  S1b Engine: buildSleepConclusion refactor, SleepFactRows, priorityProfile,
      clinicalSignals detector, delta zonder "band" in UI
  S1c Component: SleepCheckinReadout.tsx (shared VR/VL)
  S1c UI: SleepCheckin result refactor; nieuw VoortgangDomeinSlaapScreen
  S1d Piramide-rail op Voortgang (eigen inhoud, spiegel movement-ladder.ts patroon)
  S1e Gate laag 6: magnesium verplaatsen off VR; resolveGatedComparisonPath;
      events + tests (sleep-assessment.test.ts patroon)

── M · Brug-contract ──
  • VR primary CTA → /dashboard?tab=voortgang&screen=slaap (pad verifiëren)
  • VL laag 6 → /beste/magnesium label-only (bestaande gate, geen nieuwe affiliate)
  • SleepScreen cockpit: blijft L1-adjacent; VL is L2 — geen merge in v1
  • Toekomst: omgeving-scan velden in check-in v2; Mijn Dag slaap-snack — spec only
  • Toekomst pipeline: profiel → zelfmeting → prioriteren → experimenteren →
    evalueren → opschalen (1 alinea, niet bouwen)
  • Differentiatie vs sleep-apps: prioriteren vóór tracken (1 alinea)

═══════════════════════════════════════════════════════════════════════════════
WAT NIET IN SCOPE VALT
═══════════════════════════════════════════════════════════════════════════════

• Beweging R0/R0b implementatie (parallel track)
• Voeding B1 implementatie (parallel track)
• Volledige CBT-I digitale delivery · slaaplab · wearable-integratie
• Slaapdagboek als dagelijkse plicht · puntenstelsel / gamification
• SleepScreen cockpit-refactor (alleen VL-frame in prebuild)
• Stress/verbinding piramides (eigen slices later)
• DB-migratie — alles in bestaande check-in jsonb
• Privacy/register-wijziging (geen nieuwe verwerker in v1)

═══════════════════════════════════════════════════════════════════════════════
KWALITEITSCHECK vóór je oplevert
═══════════════════════════════════════════════════════════════════════════════

[ ] Sectie H bevat alle vier slash-prompts met echte tegenspraak incl. compliance
[ ] Sectie I heeft volledige zinnen voor 3 persona's, geen lorem
[ ] HTML K: drie frames + F1–F6 + identiek readout VR/VL
[ ] Geen verboden woorden L4; geen "hoger = beter" copy
[ ] Laag 4–5 crossover callout aanwezig in VL
[ ] Geen supplement/actielijst/keuzeknoppen in VR fold
[ ] Laag 6 toont F5 én F6 gate-states
[ ] Zes eigen slaaplaagnamen; geen beweging/voeding-copy
[ ] 7+ uur als populatierichtlijn-footnote, geen schuld-meter
[ ] CBT-I = doorverwijzing, geen therapie-UI
```

---

## Na Opus-review — Cursor-volgorde


| Slice | Wat                                       | Bestanden                                      |
| ----- | ----------------------------------------- | ---------------------------------------------- |
| S1a   | Piramide-canonical data                   | `src/data/sleep/lifestyle-pyramid.ts`          |
| S1b   | Conclusie + fact rows + prioriteit-engine | `sleep-assessment.ts`, `sleep-delta.ts`, tests |
| S1c   | Gedeeld readout + result refactor         | `SleepCheckinReadout.tsx`, `SleepCheckin.tsx`  |
| S1d   | Voortgang › Slaap rail                    | nieuw screen onder `voortgang/`                |
| S1e   | Laag 6 gate + magnesium off VR + events   | `supplement-gate.ts`, events allowlist         |


**Meetpunt:** `checkin_completed{domain:slaap}` + `sleep_checkin_routing_click` + Voortgang slaap → laag-6-deur — funnel check-in → prioriteitenprofiel → gated vergelijk.

---

## Gerelateerde docs

- Readout-parity: `[beweging-checkin-readout-prebuild-r0-2026-08.html](../design/beweging-checkin-readout-prebuild-r0-2026-08.html)`
- Ladder surface-contract: `[beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html)`
- Live slaapcheck: `[/intake/slaap](../../src/app/intake/slaap/page.tsx)`
- Gids-analyse (los pad): `[SleepAnalysisFlow.tsx](../../src/components/sleep/SleepAnalysisFlow.tsx)`

