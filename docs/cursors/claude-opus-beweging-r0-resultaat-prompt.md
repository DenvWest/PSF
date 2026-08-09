# Prompt — Beweging R0-bridge: check-in resultaat + Voortgang-leesback als één SSOT-keten

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (nieuw gesprek, Artifacts aan).
> **Output:** design/IA-spec **A t/m M** + **één standalone HTML-prebuild** met twee frames (check-in resultaat + Voortgang › Beweging). Geen React, geen repo-patch.
> **Doelbestand na review:** `docs/cursors/claude-opus-beweging-r0-resultaat-verdict-2026-08.md`
> **HTML na review:** `docs/design/beweging-checkin-resultaat-prebuild-r0-2026-08.html`
> **Opgesteld:** 9 augustus 2026.

---

## Plaats in de reeks


| Doc                                                                                                                                | Relatie                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `[claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md](claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md)`                   | **Implementatiepad** — R0/R0-bridge/R3/R1 volgorde; F1a-freeze                         |
| `[beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html)` | **Copy-ton + scherm C** — basis-strip, geen volledige ladder kopiëren                  |
| `[BESLUIT_BEWEGING_PRODUCT_EN_IA.md](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md)`                                                 | §A.1–A.4 lagen · §C.2 verbodslijst · §G.1 advies-poort                                 |
| `[fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md](fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md)`         | **C.1 analyse-shell** — uniform domeincontract                                         |
| `[beweging-f1a-gate6-verdict-2026-08.md](beweging-f1a-gate6-verdict-2026-08.md)`                                                   | L1-hero bevroren tot 20 aug — deeplink OK, hero-copy niet                              |
| Dit document                                                                                                                       | **R0-bridge lock** — feit → delta → implicatie → routing; geen actielijst op resultaat |


---

## Wat R0-bridge oplost (samenvatting voor reviewer)

Het huidige beweeg-check-in resultaat (`[MovementCapture.tsx](../../src/components/intake/MovementCapture.tsx)`) kopieert slaap-layout maar niet slaap-personalisatie:

- "Jouw volgende 3 acties" = statische `MOVEMENT_CHOICES.slice(0,3)` — zelfde tekst ongeacht antwoord (1 vs 5)
- "Kies zelf je eerste stap" = overlappende knoppen, lokale state, niet opgeslagen
- "Sinds je start" = alleen totaalscore-delta, geen per-dimension delta sinds vorige meting
- Voortgang toont andere/incomplete conclusie — geen SSOT

**R0-bridge lockt:**

1. **Eén object** (`MovementCheckinSnapshot`) voedt check-in resultaat én Voortgang › Beweging
2. **Feit + delta + implicatie** op resultaat — geen actielijst, geen keuzeknoppen
3. **Routing** naar L1 programma/agenda via deeplink — geen plek-chips op resultaat
4. **Programma-preview** read-only (max 1 regel) als `programProfile` al ingevuld
5. **Vier plek-waarden** (thuis/gym/groep/coach) alleen in spec §M als R1-contract — niet in HTML-frame 1

---

## Gebruiksinstructie

1. Open Claude Opus, nieuw gesprek, Artifacts aan.
2. Voeg bijlagen toe (checklist hieronder).
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Verwachte output: **A t/m M**, met **K** als klikbaar HTML-bestand (twee frames + state-switcher).
5. Review **B**, **C**, **I**, **K** op **375px** primair.
6. Sla verdict op als `docs/cursors/claude-opus-beweging-r0-resultaat-verdict-2026-08.md`.
7. Sla HTML op als `docs/design/beweging-checkin-resultaat-prebuild-r0-2026-08.html`.
8. Na review: Cursor-implementatie via sectie **L** (aparte prompt).

### Bijlagen-checklist

- **Verplicht** — screenshot huidige resultaat (375px): `/intake/beweging?from=dashboard&kompas=beweging` na volledige check
- **Verplicht** — screenshot Voortgang › Beweging (375px): `/dashboard?tab=voortgang&screen=beweging` (of equivalent)
- **Aanbevolen** — `[beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html)` scherm C (:1833+)
- **Aanbevolen** — `[WRITING_VOICE.md](../core/WRITING_VOICE.md)`

---

## Prompt (copy-paste)

```text
═══════════════════════════════════════════════════════════════════════════════
ROL
═══════════════════════════════════════════════════════════════════════════════

Je bent Senior product designer + evidence editor voor PerfectSupplement
(perfectsupplement.nl) — de Consumentenbond van leefstijl voor mannen 40+.

Je levert GEEN React, GEEN repo-patch, GEEN SQL. Je levert:
  1. Een design/IA-spec secties A t/m M (markdown in je antwoord)
  2. Eén self-contained HTML-prebuild (vanilla JS, inline CSS, Google Fonts OK,
     geen CDN-assets behalve fonts, geen emoji) — sectie K

═══════════════════════════════════════════════════════════════════════════════
PROBLEEM — waarom dit scherm nu faalt
═══════════════════════════════════════════════════════════════════════════════

Na een volledige beweegcheck ziet de gebruiker "Jouw beweeg-overzicht" met:
  • een conclusie-headline (terra-kaart)
  • "Jouw volgende 3 acties" — generieke lijst uit MOVEMENT_CHOICES
  • "Sinds je start" — alleen op totaalscore
  • "Je grootste winst zit nu in …" + "Kies zelf je eerste stap" — overlappende knoppen
  • 11 status-chips
  • creatine-link + gids-CTA

Klachten (door product owner geverifieerd):
  1. "Sinds je start" voelt sterk — maar te grof (geen per-dimension delta)
  2. "Volgende 3 acties" is generiek en mist het niveau van de gebruiker
  3. "Kies zelf je eerste stap" is conceptueel goed maar verkeerde plek/vorm
  4. Geen koppeling met Voortgang — twee waarheden

Dit is geen styling-probleem. Het is een ontbrekend C.1-analyse-model + SSOT-brug.

═══════════════════════════════════════════════════════════════════════════════
NOORDSTER — R0-bridge
═══════════════════════════════════════════════════════════════════════════════

> Na de check-in weet iemand drie dingen in simpele taal:
> (1) wat de meting zegt, (2) wat er veranderde sinds de vorige keer,
> (3) waar hij dat terugvindt en vervolgt — niet wat hij precies moet doen.

Analyse op het resultaat. Configuratie op L1 (Je programma). Advies op Voortgang (gegate).

Keten:
  Feit (band + antwoordlabel)
    → Delta (sinds vorige meting, fallback baseline)
      → Implicatie (één zin: waar zit winst)
        → Routing (deeplink naar beweegplan/programma)
          → [L1] stel waar/hoe vaak — landt op Mijn Dag
          → [L2] zelfde blok teruglezen op Voortgang

═══════════════════════════════════════════════════════════════════════════════
HARDE LOCKS — schending = afgekeurd
═══════════════════════════════════════════════════════════════════════════════

L1  GEEN "Jouw volgende 3 acties" op het check-in resultaat. Geen genummerde
    actielijst, geen micro-stappen op intake.

L2  GEEN interactieve keuzeknoppen op het check-in resultaat. Keuze hoort op
    L1 (programma/dagstap) of later R3 — niet op C.1.

L3  GEEN plek-chips (thuis/gym/groep/coach) op het resultaat. Routing deeplinkt
    naar Je programma-sheet. Vier waarden zijn R1 (na Gate 6) — wel in §M
    specificeren, niet in HTML frame 1 bouwen.

L4  GEEN creatine/supplement/deepen op het resultaat. Advies-deur alleen op
    Voortgang, gegate (voedingscheck + beweegcheck).

L5  VERBODEN UI-WOORDEN (BESLUIT §C.2), ook in aria-labels:
    stappenplan · route · fase · spoor · level · trede X van Y · cockpit ·
    kompas · journey · coming soon

L6  ÉÉN primaire CTA op resultaat: "Naar je beweegplan →" (terra-knop).
    Secundair: gids e-mail + Leefstijlcheck-link.

L7  SSOT: frame 1 (check-in) en frame 2 (Voortgang) tonen hetzelfde
    conclusie-blok — alleen omringende chrome verschilt.

L8  Delta primair = sinds VORIGE beweegcheck. "Sinds je start" secundair
    (kleiner, onder delta of in footnote-stijl).

L9  Copy: adviezen, geen diagnoses. Geen medische claims. Stem: WRITING_VOICE
    (begrip → urgentie → actie; korte zinnen; jij-vorm).

L10 F1a: ontwerp GEEN wijzigingen aan L1-hero/voorselectie. Deeplink-contract
    (`focus`, `open=programma`) is toegestaan — hero-copy niet.

═══════════════════════════════════════════════════════════════════════════════
BRONNEN — geverifieerd in repo (aug 2026)
═══════════════════════════════════════════════════════════════════════════════

Huidige UI:
  src/components/intake/MovementCapture.tsx — result-tak (regel ~200+)
  src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx — beweging-domein

Engine/data:
  src/lib/movement-assessment.ts — assessMovement, buildMovementConclusion
  src/lib/movement-delta.ts — movementDirection, movementStartStatement
  src/data/movement-checkin/index.ts — MOVEMENT_QUESTIONS, STATEMENTS, CHOICES,
    MOVEMENT_FOCUS_ORDER

Parity (niet blind kopiëren):
  src/components/intake/SleepCheckin.tsx — conclusie-model + PATCH chosen_actions
  src/lib/sleep-assessment.ts — buildSleepConclusion patroon

Programma (read-only preview):
  src/lib/movement-plan-profile.ts — trainingLocation: thuis|sportschool alleen
  src/components/dashboard/beweging/MovementProgramSheet.tsx — configuratie-L1

IA:
  docs/design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md §A.1–A.4, §C.2, §G.1
  docs/cursors/fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md — C.1

Visuele referentie:
  docs/design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html — scherm C
  Tokens: dashboard sage/cockpit (#132414 / #5A8F6A / #C8956C) óók op intake-resultaat

═══════════════════════════════════════════════════════════════════════════════
OUTPUT — secties A t/m M
═══════════════════════════════════════════════════════════════════════════════

Schrijf elke sectie concreet. Geen vage aanbevelingen. Copy in het Nederlands.

── A · Diagnose huidige scherm ──
Vergelijk MovementCapture result met SleepCheckin result. Tabel: kop, conclusie,
acties, focus, delta, persistentie, vervolg-CTA. Benoem waarom het generiek voelt
(CHOICES.slice, geen antwoordlabel, dubbele focus-sectie).

── B · Informatie-hierarchie (375px, boven de fold) ──
Geordende blokken voor check-in resultaat. Geef per blok: naam, prioriteit
(1=must see), max regels, weg/behoud. Expliciet: wat verdwijnt (actielijst,
keuzeknoppen, creatine, deepen).

── C · Delta-copy regels ──
Templates voor focus-dimension delta:
  • bandChange: aandacht→redelijk, redelijk→aandacht, sterk, unchanged, first_check
  • answerLabel: haal uit MOVEMENT_QUESTIONS.options[value-1].label
  • focusDeltaLine: "Sinds je vorige meting: …"
  • startDeltaLine (secundair): bestaande movementStartStatement

Minimaal 6 template-regels. Geen vrije prose — invulbare strings met {placeholders}.

── D · Data-contract MovementCheckinSnapshot ──
TypeScript-achtig object (spec, geen repo-code verplicht):

  MovementCheckinSnapshot {
    checkinId: string
    measuredAt: ISO8601
    focusDimension: MovementFocusKey | null
    focusLabel: string | null
    focusBand: 'aandacht' | 'redelijk' | 'sterk'
    answerLabel: string          // gekozen optie-label voor focus-dimension
    answerValue: 1..5
    focusStatement: string       // MOVEMENT_STATEMENTS[dimension][band]
    implicationLine: string      // één zin winst
    dimensionDeltas: Array<{
      dimension, label, band, previousBand?, direction: 'up'|'down'|'same'|'new'
    }>
    aggregateDirection: 'improved'|'stable'|'worsened'|null  // totaalscore
    programPreview: string | null  // "2× kracht · thuis" read-only
    routingHint: string            // "Stel waar en hoe vaak in je programma"
    statusChips: Array<{ dimension, label, band }>  // alle 11
    moderatorHints: string[]       // herstel/klachten
  }

Leg uit wat deprecated wordt: conclusion.actions op resultaat-UI.

── E · IA — drie surfaces ──
Tabel: element × intake result × Voortgang L2 × L1 Beweging × L3 advies.
Bevestig BESLUIT-regel: Voortgang meet, Mijn Dag doet.

── F · States ──
Minimaal 5 states met verschillende copy/layout:
  F1 eerste check (geen vorige raw_inputs)
  F2 hercheck met focus-delta omlaag
  F3 hercheck met focus-delta omhoog
  F4 alles sterk (maintenance — geen focus-dimension)
  F5 stalled override (consistentie+motivatie ≤2 → focus consistentie)

Per state: welke regels zichtbaar, welke CTA.

── G · Meetplan ──
Herbruik bestaande events waar mogelijk:
  movement_checkin_completed { focus_dimension, has_dimension_delta, is_recheck }
  movement_checkin_routing_click { target: 'beweging_programma' }
  domain_tool.snapshot_viewed { domain: 'beweging', has_conclusion: true }

Geen PII in GA4. Geen nieuwe domain_events tenzij strikt nodig — motiveer.

── H · Commissie (verplicht — gebruik slash-prompts) ──
  /KRAAK AF [R0-bridge plan] — geef 5 redenen om nee te zeggen
  /WELKE AANNAMES zitten onuitgesproken in [jouw ontwerp]
  /PRE-MORTEM: R0-bridge mislukte over 6 weken — schrijf waarom
  /WAT ZIE IK OVER HET HOOFD in [jouw ontwerp]

Daarna: jouw tegenargument per punt + wat je in het ontwerp aanpast.

── I · Copy-voorbeelden — 3 persona's ──
Volledige copy voor check-in resultaat (niet bullets):

  I1 Kracht-laag: MOV2_STR=2 ("Minder dan 1× per week"), vorige meting STR=2,
     programProfile leeg
  I2 Consistentie-stalled: MOV2_CONSIST=1, MOV2_MOTIV=1, override actief
  I3 Alles-redelijk: focus geen aandacht-dimension, maintenance-modus

── J · Layout 375px ──
ASCII of beschrijving van verticale stack met geschatte hoogtes. Eén h1.
Status-chips: wrap, max 2 regels zichtbaar + "toon alles" optioneel.

── K · HTML-prebuild ──
Self-contained bestand. Vereisten:

  • Prebuild-chrome bovenaan: switcher tussen Frame 1 (Check-in resultaat)
    en Frame 2 (Voortgang › Beweging) + state-switcher (F1–F5)
  • Frame 1: intake-stijl (licht) OF dashboard-dark — kies één en onderbouw
  • Frame 2: Voortgang-domein — stand-tegel placeholder + IDENTIEK conclusie-blok
  • Gedeeld component visueel: .checkin-readout met feit/delta/implicatie/routing
  • Programma-preview regel (state waar ingevuld)
  • Geen actielijst, geen keuzeknoppen, geen creatine
  • Primaire CTA styled als terra-knop
  • DM Sans + DM Serif Display
  • Werkt offline na fonts-load

── L · Cursor-implementatie-hints ──
Genummerde slices R0a–R0c (geen code, wel bestanden):

  R0a Engine: buildMovementDimensionDeltas(), uitbreiden buildMovementConclusion
  R0a API: vorige raw_inputs lezen, snapshot in response + raw_inputs persist
  R0b Component: MovementCheckinReadout.tsx (shared)
  R0b UI: MovementCapture result-tak, VoortgangDomeinScreen
  R0c Deeplink: ?tab=vandaag&kompas=beweging&focus=kracht&open=programma
  R0c BewegingScreen: programma-sheet opent op query param — ZONDER hero-copy wijziging

Tests: movement-assessment.test.ts patroon.

── M · Brug-contract (R1-voorbereiding) ──
Specificatie voor latere slices — niet bouwen in K:

  • Deeplink-params: focus (MovementFocusKey), open=programma
  • programPreview format: "{frequency} · {locationLabel}" — mapping thuis/sportschool
  • R1 uitbreiding: trainingGuidance zelf|groep|coach + 4 plek-chips in programma-sheet
  • Wanneer advies-deur op Voortgang: movementCurrent.source=beweegcheck AND voedingscheck OK
  • R3: PATCH chosen_actions — alleen als L1 keuze-flow bestaat; niet op resultaat

═══════════════════════════════════════════════════════════════════════════════
WAT NIET IN SCOPE VALT
═══════════════════════════════════════════════════════════════════════════════

• Volledige v3.4-ladder (rung 1–6) op Voortgang
• Conversiekaart-hub redesign (voortgang-conversiekaart-prebuild-2026-07.html)
• L1-hero / MovementTodayHero copy of voorselectie (F1a-freeze)
• Pulse-mode resultaat (RCV_FEEL only) — alleen vermelden dat het buiten scope blijft
• Stress/slaap domeinen — alleen noemen als R4-erfgenaam, niet ontwerpen

═══════════════════════════════════════════════════════════════════════════════
KWALITEITSCHECK vóór je oplevert
═══════════════════════════════════════════════════════════════════════════════

[ ] Sectie H bevat alle vier slash-prompts met echte tegenspraak
[ ] Sectie I heeft volledige zinnen, geen placeholder-lorem
[ ] HTML K heeft twee frames + state-switcher + identiek readout-blok
[ ] Geen verboden woorden uit L5
[ ] Geen actielijst/keuzeknoppen in HTML frame 1
[ ] M specificeert R1 vier plek-waarden zonder ze in frame 1 te bouwen
```

---

## Na Opus-review — Cursor-volgorde


| Slice | Wat                         | Bestanden                                                                              |
| ----- | --------------------------- | -------------------------------------------------------------------------------------- |
| R0a   | Delta-engine + snapshot API | `movement-assessment.ts`, `movement-checkin/route.ts`                                  |
| R0b   | Gedeeld readout-component   | nieuw `MovementCheckinReadout.tsx`, `MovementCapture.tsx`, `VoortgangDomeinScreen.tsx` |
| R0c   | Deeplink programma-sheet    | `BewegingScreen.tsx`, `MovementProgramSheet.tsx`, `dashboard-url.ts`                   |
| R1    | Vier plek-waarden           | na Gate 6 — `movement-plan-profile.ts`, programma-sheet                                |
| R3    | chosen_actions PATCH        | na R0c — slaap-patroon                                                                 |


**Meetpunt:** `movement_checkin_completed` + `movement_checkin_routing_click` + `domain_tool.snapshot_viewed{has_conclusion:true}` — funnel intake → programma open → dashboard return.

---

## Gerelateerde docs

- Plan + discussie: `.cursor/plans/beweging_r0_opus-prompt_358cf493.plan.md`
- Implementatie-verdict bron: `[claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md](claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md)` §B–§E

