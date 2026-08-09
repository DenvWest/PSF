# Prompt — Voeding B1: piramide v1 (Voortgang + check-in readout)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (nieuw gesprek, Artifacts aan).
> **Output:** design/IA-spec **A t/m M** + **één standalone HTML-prebuild** met drie frames (VQ vraag · VR resultaat · VL Voortgang-piramide). Geen React, geen repo-patch.
> **Doelbestand na review:** `docs/cursors/claude-opus-voeding-piramide-v1-verdict-2026-08.md`
> **HTML na review:** `docs/design/voeding-piramide-prebuild-v1-2026-08.html`
> **Opgesteld:** 9 augustus 2026.

---

## Plaats in de reeks


| Doc                                                                                                              | Relatie                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `[claude-opus-beweging-v3.4-prompt.md](claude-opus-beweging-v3.4-prompt.md)`                                     | **Surface-contract** — scherm C op Voortgang: ladder-rail + max 3 acties; locks L4/L6/L7/L11; **inhoud niet kopiëren** |
| `[claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md](claude-opus-beweging-v3.4-react-l2-verdict-2026-08.md)` | **Erfenis-lock** — beweging rungs ≠ voeding rungs; voeding erft C.1-shell, niet `programProfile`                       |
| `[BESLUIT_BEWEGING_PRODUCT_EN_IA.md](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md)`                               | §A.2 L1–L3 · §A.4 verboden · §C.2 woorden · **§G.1** supplement-poort (voedingscheck = poort 1)                        |
| `[BRAND_POSITIONING.md](../core/BRAND_POSITIONING.md)`                                                           | Consumentenbond van supplementen · leefstijl eerst · inname-inschatting geen diagnose                                  |
| `[STEPPED_CARE_MODEL.md](../core/STEPPED_CARE_MODEL.md)`                                                         | Tier 1–3 trap · supplement pas tier 3 · geen bloed/statusclaim                                                         |
| `[claude-analyse-voeding-aanpak-matrix-prompt.md](claude-analyse-voeding-aanpak-matrix-prompt.md)`               | Live voedingscheck + gaps; puntenstelsel NO-GO                                                                         |
| Dit document                                                                                                     | **Voeding B1 lock** — zeslagen-piramide als L2-analyse + intake-readout; geen coach-encyclopedie                       |


---

## Wat B1 oplost

Voeding is **primair in strategie** maar **secundair in dashboard-IA**:

- **Live:** Lifesum-stijl voedingscheck (`NutritionCapture`, sliders in `lifescore-questions.ts`), resultaat met gaps + supplement-advies (`NutritionResultView`), 5 nutriënten met vuistregels (`intake-reference.ts`).
- **Ontbreekt:** de **zeslagen-piramide** op Voortgang › Voeding — de hiërarchie *fundament → kwaliteit → verhoudingen → individualiseren → tracking → aanvullen* die Dennis als canon heeft.
- **Risico zonder B1:** beweging rung 6 en advies-deur blijven op "voedingscheck doen" steken zonder dat voeding zelf een evenwichtig L2-meetscherm krijgt.

**B1 lockt:** één voedings-piramide (eigen laagnamen), drie surfaces (VQ/VR/VL), gedeeld readout-contract (C.1), en laag 6 als **gegate vergelijk-deur** — geen productschap op intake.

---

## Gebruiksinstructie

1. Open Claude Opus, nieuw gesprek, Artifacts aan.
2. Voeg bijlagen toe (checklist hieronder).
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Verwachte output: **A t/m M**, met **K** als klikbaar HTML-bestand (drie frames + state-switcher).
5. Review **B**, **D**, **E**, **I**, **K** op **375px** primair.
6. Sla verdict op als `docs/cursors/claude-opus-voeding-piramide-v1-verdict-2026-08.md`.
7. Sla HTML op als `docs/design/voeding-piramide-prebuild-v1-2026-08.html`.

### Bijlagen-checklist

- **Verplicht** — screenshot voedingscheck-resultaat (375px): `/intake/voeding` na volledige check
- **Verplicht** — screenshot Voortgang › statistieken/advies waar voedingscheck ontbreekt (375px)
- **Aanbevolen** — `[beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html)` scherm C (:1833+) — **alleen surface-contract**, niet inhoud
- **Aanbevolen** — `[WRITING_VOICE.md](../core/WRITING_VOICE.md)`
- **Aanbevolen** — Dennis' voedingspiramide-canonical (14 laag-1 punten + 6 lagen) als tekstbijlage of in prompt ingebed

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
    GEEN calorie-tracker, GEEN Apple-Health-clone.
  • Leefstijl eerst; supplement/dienst pas laag 6, achter twee poorten.
  • Adviezen, geen diagnoses; inname-inschatting, geen statusclaim.

Je levert GEEN React, GEEN repo-patch, GEEN SQL. Je levert:
  1. Een design/IA-spec secties A t/m M (markdown in je antwoord)
  2. Één self-contained HTML-prebuild (vanilla JS, inline CSS, Google Fonts OK,
     geen CDN-assets behalve fonts, geen emoji) — sectie K

═══════════════════════════════════════════════════════════════════════════════
NOORDSTER — voeding v1
═══════════════════════════════════════════════════════════════════════════════

> Eerst structureel goed eten. Daarna pas perfect eten.

De hoogste vorm van voedingsoptimalisatie is niet weten welke supplementen je
moet nemen — het is een patroon dat bijna automatisch voldoende, gevarieerd,
voedzaam, verzadigend, gematigd, veilig en jarenlang vol te houden is.

Pas wanneer dát staat, worden calorieën, macro's, fasting, timing en
supplementen interessant.

Sorteervolgorde (BACKSTAGE — nooit als UI-assen):
  impact × wetenschappelijke onderbouwing × breedte van effect × eenvoud ×
  kosten × volhoudbaarheid

Vier WHO-kernprincipes (onderbouwing, max 1 regel in UI footnote):
  adequaat · balans · gematigd · divers (+ voedselveiligheid)

═══════════════════════════════════════════════════════════════════════════════
PROBLEEM — waarom voeding nu een prebuild nodig heeft
═══════════════════════════════════════════════════════════════════════════════

Live in repo (aug 2026):
  • src/components/intake/NutritionCapture.tsx — slider-flow, consent, result
  • src/data/nutrition/lifescore-questions.ts — kern + optionele breedte-sliders
  • src/components/intake/NutritionResultView.tsx — gaps, eiwit, supplement-advies
  • src/data/nutrition/intake-reference.ts — 5 nutriënten, VUISTREGEL (niet "richtlijn")
  • src/lib/statistieken-advies-model.ts — nutritionLadder / nutritionLadderPending
  • Voortgang toont advies-treden; beweging rung 6 wacht op voedingscheck (G.1)

Wat ontbreekt:
  • Geen Voortgang › Voeding-piramide (L2 analyse-shell voor voeding)
  • Resultaat voelt als nutriënt-gaps + supplement — niet als "waar sta je in
    de eet-hiërarchie"
  • Geen brug: check-in → Voortgang-piramide → (later) vergelijk-deur

Dit is geen styling-probleem. Het is een ontbrekend C.1-model + L2-piramide.

═══════════════════════════════════════════════════════════════════════════════
HARDE LOCKS — schending = afgekeurd
═══════════════════════════════════════════════════════════════════════════════

L1  GEEN beweging-ladder kopiëren. Voeding heeft ZES EIGEN lagen (namen hieronder).
    Zelfde surface-contract als v3.4 scherm C, andere inhoud.

L2  GEEN ordinaal in UI: nooit "laag 4 van 6", nooit voortgangsbalk over piramide,
    nooit evidence-emoji's (🔴🟢) als labels — evidence is backstage.

L3  GEEN encyclopedie in laag 1. De canon heeft 14 fundamentele punten — UI toont
    max 5 clusters + "meer uitleg" collapse. Geen 23-punten checklist als primary.

L4  VERBODEN UI-WOORDEN (BESLUIT §C.2 + voeding-specifiek), ook aria-labels:
    stappenplan · route · fase · spoor · level · trede X van Y · cockpit · kompas ·
    journey · biohack · superfood-stack · detox · perfect dieet

L5  GEEN calorie-tracker, barcode, macro-dashboard, of dagelijkse grammenplicht
    in v1 HTML. Laag 5 = ghost/wacht-state.

L6  LAAG 6 ALTIJD GEGATE (BESLUIT §G.1 poort 1):
    voedingscheck gedaan ÉN minstens één gemeten tekort/signaal.
    Zonder gate: toon WAAROM niet ("eerst tafel, dan potje") — geen productlink.
    Met gate: max label-only "Vergelijk op prijs en kwaliteit →" — geen prijs/foto.

L7  INTake RESULTAAT: één primaire CTA naar Voortgang › Voeding (niet supplement).
    Geen genummerde actielijst op resultaat. Geen supplement-kaart boven de fold.

L8  VUISTREGEL vs RICHTLIJN: bestaande code lockt op "vuistregel" voor 5 nutriënten
    (intake-reference.ts TODO). WHO-populatierichtlijnen (400g, 25g vezel) mag je
    tonen als "populatierichtlijn" met bronvermelding — niet als persoonlijke norm
    of schuld-meter.

L9  DISCLAIMERS VERPLICHT in copy waar canon dat vraagt:
    • "3 maaltijden" = praktische default, geen biologische wet
    • "±80% vol" = gedragsheuristiek, geen medische norm
    • Intermittent fasting / meal timing = gereedschap (laag 5), geen basis

L10 SSOT: frame VR (check-in) en frame VL (Voortgang) tonen hetzelfde
     conclusie-blok — alleen omringende chrome verschilt (L7 uit beweging R0).

L11 KOPPEL BEWEGING ALLEEN VIA LINK: max één regel op VL als beweging-advies
     wacht op voedingscheck — geen beweeg-dials in voedings-UI.

L12 GEEN puntenstelsel ("0/94 voeding", "23 pt") — Spoor B is NO-GO in repo.

═══════════════════════════════════════════════════════════════════════════════
CANON — ZES LAGEN VOEDING (inhoud lock — comprimeer voor UI)
═══════════════════════════════════════════════════════════════════════════════

Gebruik deze laagnamen in UI (NL):

  LAAG 1 · Je eetbasis
  LAAG 2 · Voedingskwaliteit
  LAAG 3 · Verhoudingen
  LAAG 4 · Op jouw situatie
  LAAG 5 · Meten & timing
  LAAG 6 · Aanvullen & vergelijken

── Laag 1 — UI: 5 clusters (niet 14 kaarten) ──

  C1  Passende energie — structureel zoveel als je lichaam nodig heeft voor je
      doel (stabiel / gecontroleerd afvallen / aankomen / sport+herstel)
  C2  Regelmatig patroon — voorspelbaar ritme; 3 hoofdmaaltijden = default,
      geen universele wet; minder gedachteloos snacken
  C3  Volwaardige basis — patroon uit planten, eiwitbronnen, vetten,
      koolhydraten; geen verzameling losse superfoods
  C4  Planten + eiwit + vezels — dagelijks structureel; WHO-ankers: ≥400 g
      groente+fruit; ≥25 g vezels (populatierichtlijn, niet persoonlijke norm)
  C5  Water + tempo + omgeving — water standaarddrank; rustig genoeg eten om
      verzadiging te voelen; gezonde keuze de standaard; volhoudbaar > perfect

  Backstage in laag 1 (niet prominent): voedselveiligheid (1 regel footnote)

── Laag 2 — Voedingskwaliteit ──
  Meer groente/fruit/peulvruchten/volkoren/noten/vis/onverzadigd vet.
  Minder suikerhoudende dranken, vrije suikers, zout, verzadigd/transvet,
  sterk bewerkte producten, veel alcohol.
  WHO-ankers backstage: vrije suikers <10% energie; verzadigd vet <10%;
  transvet <1%; zout <5 g/dag.

── Laag 3 — Verhoudingen ──
  Eiwit per maaltijd, totale eiwit, vezel, kool/vet-kwaliteit, micronutriënten,
  energieverdeling — pas relevant als laag 1–2 staan.

── Laag 4 — Op jouw situatie ──
  Gewicht, leeftijd, activiteit, sport, doel, voorkeuren, slaap/werkritme,
  intoleranties — geen medische diagnose; verwijs bij twijfel.

── Laag 5 — Meten & timing (GHOST in v1) ──
  Calorieën, macro's, apps, wegen, IF, meal timing, pre/post-workout —
  gereedschap, geen fundament. Toon als wacht/ghost met eerlijke copy.

── Laag 6 — Aanvullen & vergelijken (GATED) ──
  Supplement bij aantoonbare behoefte; sportsupplement met evidence;
  vergelijk-deur naar bestaande /beste/* pagina's — label-only link.

═══════════════════════════════════════════════════════════════════════════════
BRONNEN — geverifieerd in repo (aug 2026)
═══════════════════════════════════════════════════════════════════════════════

Check-in:
  src/data/nutrition/lifescore-questions.ts — sliders + meta (allergie, dieet, voorkeur)
  src/lib/nutrition-intake-estimate.ts — bands below/around/meets
  src/lib/nutrition-delta.ts — delta sinds vorige log
  src/lib/nutrition-advice.ts — lifestyle + supplement items

Resultaat:
  src/components/intake/NutritionResultView.tsx — huidige layout (gaps, eiwit, advies)
  src/data/nutrition/intake-reference.ts — protein, omega3, magnesium, vitamin_d, zinc

Voortgang:
  src/lib/statistieken-advies-model.ts — nutritionLadderPending
  src/components/dashboard/voortgang/BewegingAdviesTreden.tsx — G.1 poort copy
  src/components/dashboard/voortgang/StatistiekenBlikPanels.tsx — voedingscheck CTA

Parity (niet blind kopiëren):
  docs/design/beweging-checkin-readout-prebuild-r0-2026-08.html — .checkin-readout patroon
  docs/design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html — scherm C rails

IA:
  docs/design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md §A.2, §G.1
  docs/core/BRAND_POSITIONING.md
  docs/core/STEPPED_CARE_MODEL.md

Tokens: dashboard sage/cockpit (#132414 / #5A8F6A / #C8956C) op Voortgang;
        intake licht op VQ/VR — onderbouw keuze in sectie J.

═══════════════════════════════════════════════════════════════════════════════
OUTPUT — secties A t/m M
═══════════════════════════════════════════════════════════════════════════════

Schrijf elke sectie concreet. Geen vage aanbevelingen. Copy in het Nederlands.

── A · Diagnose huidige voeding-UX ──
Vergelijk NutritionResultView met gewenst C.1-model. Tabel: kop, conclusie,
gaps, supplement, focus, delta, vervolg-CTA. Waarom het nu supplement-first
voelt i.p.v. piramide-first.

── B · Informatie-hierarchie per surface ──
Drie kolommen: VQ (vraag) · VR (resultaat) · VL (Voortgang).
Per blok: naam, prioriteit (1=must see), max regels, weg/behoud.
Expliciet: wat verdwijnt op VR (supplement boven fold, lange advieslijst).

── C · Vraag-uitleg contract ──
Map bestaande slider-ids naar help-velden:
  vegetables, nutsSeedsLegumes, oilyFish, proteinMeals, meatLegumes, dairy,
  daylight, fruit, berries, wholegrain, sugaryDrinks + meta (allergy, diet, pref)

Per id:
  helpTitle, helpBody (2–3 zin), helpAnchor (optioneel: laag 1 cluster C1–C5),
  benchmarkLabel (optioneel: WHO/regel, met disclaimer)

UI: expandable "Waarom vragen we dit?" — default dicht; geen band/score tijdens intake.

── D · Feitelijke meting-readout (VR + VL) ──
Data-contract NutritionFactRow:
  { clusterId, label, answerSummary, benchmarkLabel?, status: below|near|meets|na,
    layer: 1..6 }

Mapping-tabel: welke sliders → welke cluster → welke benchmark.
  Wel benchmark: groente/fruit (400g), vezels (25g), suiker dranken, volkoren
  Geen benchmark: voorkeur, allergie — alleen antwoord + waarom het telt

Delta-copy: spiegel beweging R0 — antwoordlabels, GEEN woord "band".
  Templates minimaal 6 met {placeholders}.

── E · Piramide op Voortgang (VL) ──
Rail met 6 lagen — spiegel v3.4 scherm C structuur:
  • Laag 1–3: "Wat kun je hier doen?" max 3 acties per laag, max 1 knop per actie
  • Laag 4: read-only uitleg + link "Pas aan in je profiel" (ghost — geen form bouwen)
  • Laag 5: ghost/wacht
  • Laag 6: gated deur (L6 lock)

Self-calibratie: "Waar denk je dat je nu zit?" — max laag 5 zelf; laag 6 niet
zelf instelbaar (zelfde lock als beweging v3.4).

── F · States ──
Minimaal 6 states met verschillende copy/layout:
  F1 eerste voedingscheck (geen delta)
  F2 hercheck met verbetering focus-nutrient
  F3 hercheck met verslechtering (empathie, kleinere stap)
  F4 laag 1–2 staan, laag 3+ wacht
  F5 laag 6 open (voedingscheck + gap + poort OK)
  F6 laag 6 dicht (voedingscheck ontbreekt OF geen gap)

Per state: welke frames zichtbaar, welke CTA.

── G · Meetplan ──
Herbruik waar mogelijk:
  nutrition_log_completed { has_delta, focus_nutrient }
  dashboard_voedingscheck_cta_click { surface }
  nutrition_checkin_routing_click { target: 'voortgang_voeding'|'onderbouwing' }
Nieuw alleen als strikt nodig — motiveer:
  nutrition_question_help_opened { slider_id }
  nutrition_layer_action_click { layer, action_id }

Geen PII in GA4. Geen nieuwe domain_events tenzij gemotiveerd.

── H · Commissie (verplicht — slash-prompts) ──
  /KRAAK AF [voeding B1 plan] — 5 redenen om nee te zeggen
  /WELKE AANNAMES zitten onuitgesproken in [jouw ontwerp]
  /PRE-MORTEM: voeding B1 mislukte over 6 weken — schrijf waarom
  /WAT ZIE IK OVER HET HOOFD in [jouw ontwerp]

Daarna: jouw tegenargument per punt + wat je in het ontwerp aanpast.

── I · Copy-voorbeelden — 3 persona's ──
Volledige copy voor VR (niet bullets):

  I1 Eiwit-gap + laag 1 inconsistent: protein below, sugaryDrinks hoog,
      eerste check
  I2 Herstel-pad: groente/fruit verbeterd sinds vorige log, laag 2 focus
  I3 Alles around/meets: maintenance — geen supplement-promotie; laag 6 dicht

── J · Layout 375px ──
ASCII stack per frame. Eén h1 per frame.
VR: readout → feitelijke clusters (max 4 + toon alles) → secundaire gaps →
     één CTA Voortgang → footnote gids/onderbouwing

── K · HTML-prebuild ──
Self-contained bestand. Vereisten:

  • Prebuild-chrome: switcher VQ | VR | VL + state-switcher F1–F6
  • Frame VQ: één slider-vraag (groente) + help open/dicht toggle
  • Frame VR: .checkin-readout (identiek patroon R0) + NutritionFactRows +
    vervolg-CTA "Bekijk je voedingsbeeld →"
  • Frame VL: Voortgang chrome + piramide-rail + laag 1–3 acties + laag 6 gate
    (F5 open / F6 dicht switcher)
  • Gedeeld visueel: .checkin-readout tussen VR en VL (L10)
  • DM Sans + DM Serif Display; werkt offline na fonts-load
  • Geen emoji; geen verboden woorden L4

── L · Cursor-implementatie-hints (na review) ──
Genummerde slices V1a–V1e (geen code, wel bestanden):

  V1a Data: src/data/nutrition/lifestyle-pyramid.ts — zes lagen + clusters
  V1b Engine: buildNutritionConclusion(), buildNutritionFactRows(), delta zonder band
  V1c Component: NutritionCheckinReadout.tsx (shared VR/VL)
  V1c UI: NutritionResultView refactor, nieuw VoortgangDomeinVoedingScreen
  V1d Piramide-rail op Voortgang (spiegel movement-ladder.ts patroon, eigen inhoud)
  V1e Gate laag 6: hergebruik statistieken-advies-model + G.1 poort

Tests: nutrition-advice.test.ts, statistieken-advies-model.test.ts patroon.

── M · Brug-contract ──
  • VR primary CTA → /dashboard?tab=voortgang&screen=voeding (exact pad verifiëren)
  • VL laag 6 → /beste/* label-only links (geen nieuwe affiliate)
  • Beweging G.1: één regel deeplink als voedingscheck ontbreekt
  • Toekomst R5: Mijn Dag voedings-snack — spec only, niet in K bouwen
  • Differentiatie-note: waarom dit acquihireable is vs Apple/coaching (1 alinea)

═══════════════════════════════════════════════════════════════════════════════
WAT NIET IN SCOPE VALT
═══════════════════════════════════════════════════════════════════════════════

• Beweging R0/R0b (afgerond door product owner)
• Volledige 14-punten laag 1 als scroll-encyclopedie
• 23-punten checklist UI · 24-stappen waterfall zichtbaar
• Puntenstelsel / gamification
• Calorie-tracker · barcode · macro-dashboard
• Bloedwaarden-tier · medische diagnose-flow
• Slaap/stress piramide (eigen slices later)
• DB-migratie — alles in bestaande answers/jsonb

═══════════════════════════════════════════════════════════════════════════════
KWALITEITSCHECK vóór je oplevert
═══════════════════════════════════════════════════════════════════════════════

[ ] Sectie H bevat alle vier slash-prompts met echte tegenspraak
[ ] Sectie I heeft volledige zinnen, geen placeholder-lorem
[ ] HTML K heeft drie frames + state-switcher + identiek readout-blok VR/VL
[ ] Geen verboden woorden uit L4
[ ] Geen supplement-kaart boven fold in VR
[ ] Laag 6 toont F5 én F6 gate-states
[ ] Geen beweging-ladder-copy; wel zes eigen voedingslaagnamen
[ ] Disclaimers 3 maaltijden + 80% vol aanwezig waar relevant
```

---

## Na Opus-review — Cursor-volgorde


| Slice | Wat                               | Bestanden                                                       |
| ----- | --------------------------------- | --------------------------------------------------------------- |
| V1a   | Piramide-canonical data           | `src/data/nutrition/lifestyle-pyramid.ts`                       |
| V1b   | Conclusie + fact rows + delta     | `nutrition-advice.ts`, `nutrition-delta.ts`, tests              |
| V1c   | Gedeeld readout + result refactor | `NutritionCheckinReadout.tsx`, `NutritionResultView.tsx`        |
| V1d   | Voortgang › Voeding rail          | nieuw screen onder `voortgang/`, `statistieken-advies-model.ts` |
| V1e   | Laag 6 gate + meetpunten          | `BewegingAdviesTreden.tsx`, events                              |


**Meetpunt:** `nutrition_log_completed` + `nutrition_checkin_routing_click` + `dashboard_voedingscheck_cta_click` — funnel check-in → Voortgang voeding → laag-6-deur.

---

## Gerelateerde docs

- Beweging surface-contract: `[beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html)`
- Live onderbouwing: `[/onderbouwing/voeding](../../src/app/onderbouwing/voeding/page.tsx)`
- Voeding-eerst analyse: `[claude-analyse-voeding-aanpak-matrix-prompt.md](claude-analyse-voeding-aanpak-matrix-prompt.md)`

