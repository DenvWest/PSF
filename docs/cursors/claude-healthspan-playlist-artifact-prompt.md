# Prompt — Healthspan-afspeellijst + documentaire-regie Beweeggids

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude (Opus) in een nieuw gesprek. Voeg de **screenshot van de huidige Architectuurproef-artifact** toe. Voeg ook `docs/cursors/claude-architectuur-beweeggids-2026-07.md` toe (huidige documentaire-regie).
>
> **Output:** (A) één nieuw interactief Artifact + (B) regie-delta voor de hele gids. Geen Next.js-code, geen diffs, geen commits.

---

## Waarom deze prompt

De huidige Beweeggids-architectuurproef (“De wandeling. Eén wandeling…”) is sterk op acute biologie (24 uur na wandelen), maar:

- **Healthspan / longevity** zit vooral in de epiloog, niet als plot van de documentaire.
- Alleen **wandeling** is speelbaar; kracht en zone 2 (conditie) ontbreken als optionele signalen.
- Het **einde** (Deel 6–7–epiloog) converteert, maar de epiloog-CTA is te zacht — te weinig “ik weet hoe verder, met vertrouwen”.

Deze prompt dwingt Claude om:
1. een **premium healthspan-afspeellijst** te bouwen (playhead + 3 tracks);
2. de **hele documentaire-regie** te herijken op gewonnen healthspan via beweging;
3. het **slot** sterker conversiegericht te maken mét vertrouwen hoe verder (platformketen).

---

## Gebruiksinstructie

1. Open Claude Opus (nieuw gesprek, Artifact/React aan).
2. Bijlagen:
   - **Verplicht:** screenshot huidige “De Beweeggids — Architectuurproef”
   - **Verplicht:** `docs/cursors/claude-architectuur-beweeggids-2026-07.md`
3. Plak het blok onder **Prompt (copy-paste)**.
4. Verwacht: eerst **Artifact (Taak A)**, daarna **regie-delta (Taak B)** in vaste secties.
5. Review A visueel; review B tegen het 2026-07-doc — merge naar architectuur alleen na jouw OK.

---

## Prompt (copy-paste)

```text
ROL
Je bent Senior Product Designer + Learning Experience Designer + Behavioral Scientist
voor PerfectSupplement (perfectsupplement.nl). Doelgroep: mannen 40+.

Voor TAAK A ben je ook front-end craftsperson: je bouwt één premium interactief
React-Artifact (Claude Artifact). Voor TAAK B lever je uitsluitend ARCHITECTUUR-
REGIE (delta), geen uitgewerkte hoofdstukteksten, geen code voor de website.

Geen medische diagnoses. Adviezen, geen claims. Geen PII/scores op publieke visuals.
Antwoord in het Nederlands (UI-copy NL; code/variabelen Engels).

═══════════════════════════════════════════════════════════════════════════════
BIJLAGEN (door Dennis)
═══════════════════════════════════════════════════════════════════════════════

1. VERPLICHT: Screenshot “De Beweeggids — Architectuurproef” (huidige Artifact:
   silhouet “stad in jou”, 5 regio-cards, alleen wandeling, dark teal).
2. VERPLICHT: Architectuurdoc Beweeggids 2026-07 (proloog, 7 delen, epiloog, STEP,
   CTA-matrix, healthspan pas echt in epiloog).

Gebruik 1 als startpunt om te VERHEFFEN (niet scrapen voor generieke AI-UI).
Gebruik 2 als “huidige regie” om een DELTA op te leveren — behoud wat werkt,
herijk wat healthspan/conversie mist.

═══════════════════════════════════════════════════════════════════════════════
PRODUCTCONTEXT (neem als waar aan)
═══════════════════════════════════════════════════════════════════════════════

- PerfectSupplement = leefstijlcoach + supplementvergelijking; stepped care:
  leefstijl eerst, supplementen laat.
- Beweeggids = vijfde gids in serie (slaap/stress/energie/herstel/bewegen).
- Productketen: gids → trust → Leefstijlcheck (/intake) → Dashboard Beweging →
  Beweegplan (/intake/plan/movement) → hermeting.
- Drie productsporen: Kracht · Conditie · Dagelijks ritme.
- STEP-beweegstijl (vastgelegd in architectuur — NIET herdefiniëren):
  S = Starten klein | T = Terugkerend ritme | E = Elke week iets meer |
  P = Persoonlijk & permanent. STEP is géén lesblok; cumulatief onthuld.
- Herstel: alleen bridge-link naar herstelgids (Nachtploeg), niet uitwerken.
- Rode draad-huidig (mag je aanscherpen richting healthspan):
  “Beweging is geen taak die je aan je lijf oplegt — het is het signaal waarmee
  elk orgaan tegelijk hoort dat het nog jong mag blijven.”

═══════════════════════════════════════════════════════════════════════════════
NARRATIEVE WETTEN (gelden voor A én B)
═══════════════════════════════════════════════════════════════════════════════

1. HEALTHSPAN / LONGEVITY VIA BEWEGING is de plot — niet fitness, niet algemene
   longevity-tips, geen supplementen. Healthspan ≠ lifespan: “meer gezonde jaren”,
   “de curve vierkant maken”, zelfstandig blijven, trap/kleinkinderen-taal mag.
2. VERWONDERING richt zich op UREN én JAREN: wat één beweegsignaal vandaag doet,
   én wat jaren wél vs weinig/niets doen / hebben gedaan (na-effect).
3. JE HOEFT MINDER TE DOEN DAN JE DENKT: grootste winst = niets → iets (niet
   iets → sportschool-perfectionisme).
4. BEWEGING is het medicijn: wandeling, kracht, zone 2 (praatbaar tempo, geen HIIT).
5. STEP zichtbaar als markers/chips gekoppeld aan actie — geen theoriewandje.
6. Ontzag altijd + handelingsruimte. Nooit scare zonder uitweg.
7. Conversie-einde mét VERTROUWEN: lezer weet wat hij krijgt, waarom het veilig/
   laagdrempelig is, en wat de eerstvolgende stap is. Identiteit mag, maar geen
   sfeer-only dead-end CTA.

Emotionele boog (richting):
stilstand herkennen → ontzag (uren + jaren) → opluchting (minder dan je denkt) →
agency (STEP) → “wat betekent dit voor mij?” → starten → healthspan-identiteit
+ ik weet hoe verder.

═══════════════════════════════════════════════════════════════════════════════
TAAK A — INTERACTIEF ARTIFACT: HEALTHSPAN-AFSPEELLIJST
═══════════════════════════════════════════════════════════════════════════════

Bouw één nieuw React-Artifact dat de huidige proef vervangt.

CONCEPT
“Healthspan-afspeellijst” — speel af wat er in je lichaam gebeurt als je een
beweegsignaal aanzet. Niet alleen wandeling: optionele tracks die je kunt
aan/uitzetten. Shared playhead. Metafoor: playlist/player (transport, scrub,
markers), geen dashboard-grid.

TRACKS (toggles, 0–3 tegelijk; standaard allemaal UIT)
1. Wandeling — Dagelijks ritme (laagdrempelig intro-signaal; “minder dan je denkt”)
2. Kracht — Krachttraining (spieren/botten/zelfstandigheid; healthspan-jaren)
3. Zone 2 — Conditie, hartslag verhogend, praatbaar tempo (hart/vaten/VO2/metabool)

Lege staat (0 tracks): playhead stil; soft nudge in healthspan-taal; optioneel
gedimd “jaren weinig”-contrast. Geen autoplay zonder keuze.

≥1 track aan: playhead speelt ~24u gecomprimeerd in ~20–30s; pause + scrub.
Meerdere tracks: ÉÉN timeline; cards/chips tonen welke track(s) het effect voeden.

TIJDLIJN-MARKERS (acute laag)
tijdens → direct → +3 uur → die avond → die nacht–morgen

JAREN-LAAG (verplicht, subtiel maar voelbaar)
Na of naast de acute play: kort moment “als je dit blijft herhalen” vs
“als er weinig/niets bij komt” — copy + lichte silhouet/curve-shift.
Geen diagnoses, geen persoonlijke scores.

LICHAAM / STAD IN JOU
Behoud 5 regio’s (metafoornamen mogen blijven of licht aangescherpt):
- De Werkplaatsen (spieren/gewrichten)
- De Aanvoerwegen (hart/vaten)
- De Energiecentrale (metabolisme/bloedsuiker)
- De Nachtploeg (slaap/herstel — bridge “ook in de herstelgids”)
- Het Controlecentrum (brein/stemming/focus)

Nodes op silhouet lichten op in sync met playhead. Cards syncen mee (fade/slide).
Kracht en zone 2 mogen ANDERE benefit-hoeken tonen dan wandeling — niet 3× dezelfde
5 cards. Evidence-tags: Sterk bewijs / Sterk–veelbelovend / bridge-label.

STEP IN UI
Subtiele markers die meegroeien:
S bij eerste track aan | T bij jaren-laag/herhaling | E bij 2e/3e track |
P als zachte hint “jouw startpunt” (geen scores).

HERO / COPY
Kop en intro moeten HEALTHSPAN + BEWEGING expliciet maken (niet alleen
“één wandeling”). Dosis-boodschap ergens in intro of na eerste play.
Toon: jij-vorm, begrip → urgentie → actie, mannen 40+, geen hype.

VISUELE EISEN
- Verhef de dark teal-proef: serif headline + clean sans, sterke hiërarchie,
  één compositie (geen card-stapeling als hoofdlayout).
- Playhead = echte player (voortgang, markers, play/pause).
- 2–3 intentionele motions (glow nodes, card reveal, scrub).
- VERBODEN: purple-glow AI-cliché, emoji-rijen, floating promo-badges op het
  silhouet, medische claims, affiliate, scores.

ACCEPTATIE TAAK A
- [ ] 3 optionele tracks werken als toggles
- [ ] Playhead speelt alleen met ≥1 track
- [ ] Acute 24u-markers + jaren-laag beide voelbaar
- [ ] Healthspan + STEP + “minder dan je denkt” in UI/copy zichtbaar
- [ ] Mooier en rustiger dan de bijlage-screenshot
- [ ] Mobiel bruikbaar (~375px)

═══════════════════════════════════════════════════════════════════════════════
TAAK B — DOCUMENTAIRE-REGIE DELTA (HELE GIDS)
═══════════════════════════════════════════════════════════════════════════════

Lever een REGIE-DELTA t.o.v. architectuur 2026-07. Geen full body-copy.
Behoud: WHY-first, documentaire-vorm, STEP-letters, productketen, herstel-bridge,
geen parallelle check-namen, scores niet op publieke pillar.

DOEL VAN DE DELTA
1. Gewonnen healthspan/longevity VIA BEWEGING wordt de plot van proloog t/m einde
   (niet alleen epiloog-nabrander).
2. Verwondering = uren én jaren (wél vs weinig/niets).
3. Deel 3 flagship-visual = de Healthspan-afspeellijst uit Taak A (3 tracks =
   Dagelijks ritme / Kracht / Conditie).
4. Slot (Deel 6 + 7 + Epiloog) = één afbouw: sterke conversie + VERTROUWEN hoe verder.
   Epiloog mag NIET eindigen als pure sfeer; minstens één concrete CTA naast
   healthspan-curve (Beweegplan / Dashboard / hermeting), terwijl primaire
   conversie in Deel 6 blijft (/intake of opt-in→check).
5. Return-states: geen dead-end “opt-in opnieuw”; belofte hermeting ~30 dagen;
   platform loopt mee; adviezen geen diagnoses.

VERPLICHTE OUTPUTSECTIES TAAK B (in deze volgorde)

B1. Nieuwe rode-draad-zin (één zin) + plot in max 3 zinnen (healthspan via beweging).
B2. Emotionele boog in één regel (met healthspan als climax-as).
B3. Tabel: Deel (Proloog, 1–7, Epiloog) × healthspan-functie (1 zin) ×
    wijziging t.o.v. 2026-07 (of “ongewijzigd”).
B4. Deel 3 regie-notitie: hoe de afspeellijst (A) in de documentaire landt
    (ontzag uren+jaren; tracks=sporen).
B5. CTA-matrix ALLEEN Deel 6 / 7 / Epiloog:
    moment | emotie | CTA (concreet) | vertrouwensanker | meetpunt-hint
    (hergebruik waar mogelijk: guide_movement_cta_primary, guide_movement_start,
    movement_remeasure_optin, guide_movement_dashboard_return).
B6. Wat je bewust NIET verandert (korte bullets) — zodat de delta scherp blijft.

ACCEPTATIE TAAK B
- [ ] Healthspan/longevity via beweging loopt door hele gids-regie
- [ ] Jaren-contrast + dosis-boodschap verankerd in regie (niet alleen A)
- [ ] Einde conversiegericht mét vertrouwen hoe verder
- [ ] Primaire CTA blijft Deel 6; epiloog heeft concrete next step
- [ ] Geen body-copy, geen website-code

═══════════════════════════════════════════════════════════════════════════════
WERKVOLGORDE
═══════════════════════════════════════════════════════════════════════════════

1. Render/bouw eerst TAAK A (Artifact).
2. Lever daarna TAAK B in secties B1–B6.
3. Stop. Geen git, geen Next.js-bestanden, geen “ik ga nu implementeren”.

ARTIFACT-TITEL (voorstel)
“Healthspan-afspeellijst — wat beweging vandaag én over jaren doet”
```

---

## Na Claude’s output

- **A:** screenshot/export bewaren als referentie voor later Cursor-implementatie van de flagship-visual.
- **B:** naast `claude-architectuur-beweeggids-2026-07.md` leggen; alleen mergen na jouw review (eventueel als `…-2026-07-healthspan-delta.md`).
