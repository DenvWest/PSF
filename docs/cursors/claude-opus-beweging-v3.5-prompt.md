# Prompt — Beweging v3.5: slaap-v2-skelet, keuze terug in flow, dual-label routing

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (nieuw gesprek, Artifacts aan).
> **Verplichte bijlagen:**
>
> - `[beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html)` — inhoud, state, schap B, programma
> - `[slaap-piramide-v2-prebuild-2026-08.html](../design/slaap-piramide-v2-prebuild-2026-08.html)` — **visueel skelet**: PriorityLadder, MD-timeline, koppelstrip, VL-split
> **Output:** één self-contained HTML-prebuild + kort verdict A–M.
> **Doelbestanden na review:**
> - `docs/design/beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html`
> - `docs/cursors/claude-opus-beweging-v3.5-verdict-2026-08.md`
> **Opgesteld:** 12 augustus 2026.

---

## Plaats in de reeks


| Doc                                                                                                                                | Relatie                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `[beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html)` | **Inhoudsbasis** — programma, schap, gekozen, meetpad, locks L1–L11       |
| `[slaap-piramide-v2-prebuild-2026-08.html](../design/slaap-piramide-v2-prebuild-2026-08.html)`                                     | **Visueel skelet** — `.pl-row`, `renderMD()`, koppelstrip, geen trapezoid |
| `[BESLUIT_SLAAP_PIRAMIDE_V2_2026-08.md](../design/BESLUIT_SLAAP_PIRAMIDE_V2_2026-08.md)`                                           | §C.1 PriorityLadder · §E.2 koppelstrip · §D.1 score+ladder naast elkaar   |
| `[opus-beweging-status-verdict-slices-1-16-2026-08.md](opus-beweging-status-verdict-slices-1-16-2026-08.md)`                       | §M.2 voorzittersbesluit — **v3.5 overrulet** brug/label-routing           |
| `[PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md](../design/PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md)`                                       | §5 vier assen per optietype · schap-inhoud                                |
| Dit document                                                                                                                       | **v3.5 lock** — transplant slaap-v2 UI op v3.4-inhoud                     |


---

## Wat v3.5 toevoegt t.o.v. v3.4 (samenvatting voor reviewer)

1. **Geen piramide-geometrie meer** — zes **prioriteitsblokken** (slaap v2 `.pl-row`), geen `clip-path`, geen trapezium.
2. **Copy:** gerenderde tekst zegt **"Prioriteit 1–6"**, nooit "Laag N" op beweging-surfaces.
3. **Dual-label brug** met **gesplitste routing:**
  - Eerste keer → **"Voeg iets toe aan je basis"** → scherm **B** (Maak een keuze)
  - Daarna → **"Zet er iets naast"** → scherm **D** (Mijn Dag)
4. **Scherm B deparkeren** — terug in flow vanaf A, E en D; geen "Geparkeerd Pad A"-barrier meer.
5. **Mijn Dag = slaap v2 MD** — timeline + koppelstrip; geen tray/raster-dualmode, geen mock-alert standaard aan.
6. **Voortgang C = twee bronnen** — check-readout (SSOT) + gekozen-blok + prioriteitsblokken + meetpad.
7. **Gekozen extra persistent** op E/D — afvinkbaar, dismissable, expiry bij verlopen dienst/product.

---

## Gebruiksinstructie

1. Open Claude Opus, nieuw gesprek, Artifacts aan.
2. Upload **beide** HTML-bijlagen (v3.4 + slaap v2).
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Review in browser op **375px** (primair) en **≥1280px** (rail op C).
5. Sla HTML op als `docs/design/beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html`.
6. Sla verdict op als `docs/cursors/claude-opus-beweging-v3.5-verdict-2026-08.md`.

---

## Prompt (copy-paste)

```text
═══════════════════════════════════════════════════════════════════════════════
ROL
═══════════════════════════════════════════════════════════════════════════════

Je bent Senior product designer + evidence editor voor PerfectSupplement
(perfectsupplement.nl) — de Consumentenbond van leefstijl voor mannen 40+.

Je levert GEEN analyse-essay, GEEN React, GEEN repo-patch. Je levert:
  1. één self-contained HTML-prebuild (vanilla JS, inline CSS, geen CDN, geen emoji)
  2. een kort verdict-document (secties A–M, max ~2000 woorden)

Het HTML-bestand moet werken door dubbelklikken.

═══════════════════════════════════════════════════════════════════════════════
TWEe BIJLAGEN — transplant, niet merge
═══════════════════════════════════════════════════════════════════════════════

BIJLAGE A — "beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html"
  · BEHOUD: alle schermen A · E · B · C · D, programProfile, OPTS, schap-kaarten,
    gekozen-blok, meetpad, duur-lock (dose ≠ dayDur), zelf-calibratie, locks L1–L11
  · VERWIJDER/VERVANG: piramide-geometrie, bridgeHtml() trapezoid, tray/raster op D,
    "Geparkeerd Pad A"-barrier op B, vierpunts-keten in brug-paneel

BIJLAGE B — "slaap-piramide-v2-prebuild-2026-08.html"
  · KOPIEER (adapt voor beweging): CSS .pl-row · .pl-bar · .tl · .tlrow · .strip ·
    .cols--railright · renderMD() · renderMDStrip() · renderLadder/renderPriorityLadder
  · NIET KOPIËREN: slaap-specifieke LAYERS-inhoud, VQ/VR/K frames, sleep gate-logica

De opdracht is één HTML met ÉÉN state-object. Geen iframe, geen externe imports.

═══════════════════════════════════════════════════════════════════════════════
NOORDSTER — ongewijzigd sinds v3.1
═══════════════════════════════════════════════════════════════════════════════

> Een goede basisconditie + krachttraining + dagelijks bewegen wint vrijwel
> altijd van een perfect geoptimaliseerd trainingsschema dat iemand niet
> volhoudt.

De prioriteitenladder sorteert het TYPE interventie op prioriteit × onderbouwing
× moeite. Ze is geen ranglijst om te winnen en geen schap dat omhoog duwt.

═══════════════════════════════════════════════════════════════════════════════
PRODUCTBESLUIT v3.5 — overschrijft slice-9-voorstel (augustus 2026)
═══════════════════════════════════════════════════════════════════════════════

Het voorzittersbesluit zei: slice 9 = vierpunts-keten + altijd "Zet er iets naast".
v3.5 lockt iets anders — dit is de norm voor deze prebuild:

  · Geen vierpunts-keten in de brug (Check→Advies→Favorieten→Beste). Die keten staat
    ALLEEN op Voortgang › Gekozen (scherm C), één regel, zoals v3.4 r.1883–1896.
  · Geen piramide-preview in de brug. De brug IS de dual-label knop.
  · Dual-label met GESPLITSTE routing (niet beide naar hetzelfde scherm):

      bridgeLabel() + bridgeTarget():
        IF !extraChosen && !hasVisitedShelf:
          label = "Voeg iets toe aan je basis"
          target = "b"    → scherm B · Maak een keuze
        ELSE:
          label = "Zet er iets naast"
          target = "d"    → scherm D · Mijn Dag

  · Scherm B is TERUG IN FLOW. Verwijder de "Geparkeerd (Pad A)"-statebar als
    flow-barrier. Vervang door reviewer-notitie in ontwerpnotities-sectie.
  · Visueel: prioriteitsBLOKKEN (slaap v2), geen trapezoid-piramide.
  · Copy: "Prioriteit N" in UI, nooit "Laag N" op beweging-surfaces.

═══════════════════════════════════════════════════════════════════════════════
HARDE LOCKS — schending = afgekeurd
═══════════════════════════════════════════════════════════════════════════════

NL1  DUAL-LABEL + ROUTING (zie productbesluit hierboven). De knop op A, E en
     onderaan D roept bridgeNavigate() aan: show(target). Geen derde label.
     Geen sheet-tussenstap in de brug.

NL2  GEEN PIRAMIDE-GEOMETRIE in v3.5. Geen clip-path, geen trapezium, geen SVG-
     silhouet. Prioriteiten = slaap v2 .pl-row met 4px statusbalk links.

NL3  COPY "PRIORITEIT", NOOIT "LAAG" op beweging-surfaces. Intern mag layer/id
     blijven. Verboden in gerenderde tekst, aria-labels, eyebrows:
       "Laag 1" · "laag 3 is nog niet open" · "op je ladder" mag WEL ("ladder"
       is toegestaan sinds v3.3). Wel: "Prioriteit 1 · Dagelijks bewegen".

NL4  MIJN DAG = SLAAP v2 MD-STRUCTUUR. Scherm D volgt renderMD() uit slaap v2:
     appbar · mdhead (h1 + datum + views + domein-badge) · timeline (.tl/.tlrow) ·
     koppelstrip (.strip). GEEN tray boven raster. GEEN mock-alert standaard aan
     (reviewer-toggle OK, default hidden).

NL5  VOORTGANG C = TWEE BRONNEN, ÉÉN CONCLUSIE:
       (1) Gemeten — check-readout SSOT + feitrijen (ingeklapt)
       (2) Gekozen — basis + optionele extra uit schap B
       (3) Prioriteitsblokken — verklaart waarom, vervangt readout niet
     SSOT-vlag zoals slaap VL: "Zelfde blok als op je check-in resultaat".

NL6  extraChosen === true ALLEEN na expliciete keuze in B (v3.4 patroon r.2468–2472).
     Geen fabricatie bij load.

NL7  DISMISS + EXPIRY op extra:
       · "Niet vandaag" → extraDismissedUntil = morgen; rij verborgen op D/E
       · "Pas aan" → show('b')
       · expiresAt verstreken → extraChosen = false; label terug naar "Voeg iets toe"

NL8  GEDEELDE STAAT E ↔ D. Afvinken op E zet D mee en omgekeerd. Eén eenheid,
     twee uitlezingen — v3.2 lock blijft.

── v3.4 locks L1–L11, herhaal en handhaaf ──

L1   GEEN scherm dat een keuze eist vóór het een antwoord geeft (BESLUIT §A.4).
L2   ÉÉN afvinkbare eenheid per dag, één bron. Geen tweede vinklijst.
L3   GEEN readout die telt wat je niet deed. Nooit "4 van 7".
L4   VERBODEN UI-WOORDEN: stappenplan · route · fase · spoor · startpatroon ·
     categorie · cockpit · kompas · journey · deep view · programma-catalogus ·
     oefeningenbibliotheek · coming soon · level · trede X van Y · biohack.
     "Je programma" voor instellingen. "Je ladder" voor de zes prioriteiten.
L5   GEEN ordinaal. Nooit "prioriteit 4 van 6", nooit voortgangsbalk over de ladder.
L6   Prioriteiten 4–6 komen NOOIT in de brug (brug = alleen knop). Op C: max 3
     acties per open prioriteit, nooit dag-knop op prioriteit 4–6.
L7   Prioriteit 6 ALTIJD GEGATE: stepped care, na hertest, na voedingscheck.
     Geen supplement-CTA op A, E, D. Op C: label-only link achter poort.
L8   dose ≠ dayDur. Twee velden, nooit één control.
L9   VELDSCHEIDING: sport stuurt copy, nooit plan/dosis/dagstap.
L10  GEEN fit-paneel op doe-surfaces.
L11  GEEN schuldtaal.

═══════════════════════════════════════════════════════════════════════════════
WIJZIGINGEN v3.5 — tien genummerde, alle verplicht
═══════════════════════════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────────────────────────
1. VISUEEL SYSTEEM: SLAAP v2 PriorityLadder OP BEWEGING
───────────────────────────────────────────────────────────────────────────────

Importeer uit slaap v2 prebuild (Bijlage B):

  CSS: .pl-row · .pl-bar · .pl-tab · .pl-txt · .pl-head · .pl-body · .pl-chev
       .tl · .tlrow · .tltime · .tlcard · .tn · .ts · .tg
       .strip · .links · .mdhead · .mdbadge · .cols--railright

Vervang v3.4 pyramid CSS (--k, .rung, .bridge-pyr, clip-path) volledig.

renderPriorityLadder(state, variant):
  variant = 'full' | 'rail' | 'mini'
  · full op C: zes .pl-row, één open (ui.open), gesloten = één "waarom wachten"-regel
  · rail op C desktop (≥860px @container): sticky navigatie, sync met full
  · mini: NIET op A/E — brug toont geen mini-ladder meer (NL1)

Map v3.4 LAYERS[] naar PRIORITIES[]:
  · id 1–6 behouden intern
  · idx renderen als "Prioriteit 1" … "Prioriteit 6"
  · name, kern, doing, ev, src uit v3.4 LAYERS overnemen
  · v3.4 laag 2 read-only gedrag → prioriteit 2 toont teruglezing programProfile

Statuskleuren (slaap v2 patroon):
  winst/open → terra · op orde → sage · houd in de gaten → amber · nog niet → muted

───────────────────────────────────────────────────────────────────────────────
2. BRUG = ALLEEN DUAL-LABEL KNOP
───────────────────────────────────────────────────────────────────────────────

Verwijder bridgeHtml(), bridgeRungs(), sheetHtml() uit de brug-context op A/E/D.

Op A (first-run), E (elke dag) en onderaan D:

  <section class="bridge-cta">
    <p class="bridge-lead">[contextafhankelijk — zie below]</p>
    <button class="btn btn-ghost" id="a-bridge|e-bridge|d-bridge">
      [bridgeLabel()] <arrow>
    </button>
  </section>

bridge-lead:
  · eerste keer: "Je basis blijft staan. Kies iets kleins dat daarnaast past."
  · daarna: "Wat je koos staat op Mijn Dag. Tik om het te doen of aan te passen."

bridgeNavigate(fromSurface):
  hasVisitedShelf = true (bij target 'b')
  show(bridgeTarget())
  scroll top
  track mock: { label: bridgeLabel(), target: bridgeTarget(), from: fromSurface }

GEEN paneel dat opent onder de knop. GEEN piramide. GEEN keten.

───────────────────────────────────────────────────────────────────────────────
3. SCHERM B DEPARKEREN
───────────────────────────────────────────────────────────────────────────────

Verwijder de rode "Geparkeerd (Pad A)"-statebar uit de flow (mag in <details>
ontwerpnotities blijven).

Herstel op A/E/D: brug-knop → B wanneer bridgeTarget() === 'b'.

Scherm B inhoud ONVERWIJzigD t.o.v. v3.4:
  · helpbar · basis-strip · lenses · filters · kaarten · verdict · fav/dag-knoppen
  · CTA "Bekijk je keuze →" naar C na selectie

Na keuze in B (data-act="fav" of bevestiging):
  · extraChosen = true
  · extraId = gekozen optie
  · show('c') OF terug naar E — reviewer-schakelaar; default → C

───────────────────────────────────────────────────────────────────────────────
4. SCHERM D = SLAAP v2 MIJN DAG (BEWEGING-INHOUD)
───────────────────────────────────────────────────────────────────────────────

Vervang v3.4 scherm D markup/JS door adaptatie van slaap v2 renderMD().

Structuur (letterlijk slaap v2 patroon):

  appbar (tabs: Vandaag · Agenda active · Voortgang · Hermeting)
  mdhead:
    h1 "Mijn Dag"
    datum "dinsdag 11 augustus"
    views: Dag | Week | Maand
    mdbadge "Beweging · Prioriteit [N]"  — N = currentLayer of focus prioriteit

  timeline (.tl):
    · Contextrijen (behouden uit v3.4): voeding 07:10, slaap 22:30
    · Extra-rij (IF extraChosen && !dismissed && !expired):
        time uit extra.time · domein "Beweging · aanvulling"
        titel/sub uit OPTS[extraId]
        knoppen: "Afspraak gehad" / "Markeer als gedaan" (type-afhankelijk)
                "Verplaatsen" · "Niet vandaag" · "Pas aan"
    · Basis-rij (ALTIJD, data-focus="true"):
        time uit basis.time
        domein "Beweging · uit je plan"
        titel/sub/dur uit programProfile
        knoppen: "Markeer als gedaan" · "Verplaatsen"
        inline planner (v3.4 plan-div, compact)

  Sorteer rijen op tijd.

  koppelstrip (renderMDBewegingStrip):
    h2 "Waar dit vandaan komt"
    stripLink('Waarom dit?', 'Je prioriteit en je programma op Beweging.')
      → show('a') of show('e') afhankelijk van context
    stripLink('Bekijk bewijs', 'Je gekozen opties, meetpad en prioriteiten.')
      → show('c')
    stripLink('Pas je keuze aan', 'Andere aanbeveling of extra weg.')
      → show('b')

  cols--railright op desktop: koppelstrip sticky rechts (slaap v2 patroon).

WEG laten:
  · #d-tray (tray-modus)
  · #mockalert standaard (hidden, reviewer-toggle OK)
  · #d-week week-readout (DEFER blijft DEFER)

BEHOUDEN uit v3.4:
  · Markeer als gedaan / Afspraak gehad — één completion-knop per rij
  · Verplaatsen → inline plan-div
  · Gedeelde staat met E (#also-* bindings)

───────────────────────────────────────────────────────────────────────────────
5. SCHERM E — "VANDAAG OOK" + BRUG-KNOP
───────────────────────────────────────────────────────────────────────────────

E blijft bestaan (Beweging/Vandaag surface).

Onder de basis-sectie, IF extraChosen:
  · panel "Vandaag ook" met extra-titel, sub, afvink-knop
  · also-cap: "Dit staat ook op Mijn Dag. Vink het hier af of daar."
  · sync met D via shared state object

Onderaan E: zelfde bridge-cta als op A (NL1).

───────────────────────────────────────────────────────────────────────────────
6. SCHERM C HERORDENEN — SLAAP-PARITEIT
───────────────────────────────────────────────────────────────────────────────

Volgorde op C (top → bottom):

  1. eyebrow "Beweging · gekozen"
  2. titel + lead (dynamisch: extraChosen ? "Je basis, en één ding ernaast" : "Je basis…")
  3. CHECK-READOUT (NIEUW — uit v3.4 movement check-in copy):
       · terra eyebrow · serif feit · delta-regel · chip met antwoordlabel
       · SSOT-vlag: "Zelfde blok als op je check-in resultaat"
  4. FEITRIJEN (details, default dicht): max 4 + "toon alles"
  5. GEKOZEN-BLOK (v3.4 .chosen-row): basis + extra (hidden if !extraChosen)
  6. PRIORITEITEN-LADDER (full + rail desktop)
  7. KETEN (één regel): Check → Advies → Favorieten → Beste
  8. MEETPAD (details, default dicht — v3.4)
  9. eigen-begeleiding fold (v3.4)

Geen tweede conclusie. Readout en gekozen mogen elkaar niet tegenspreken.

───────────────────────────────────────────────────────────────────────────────
7. PRIORITEIT 2 TERUGLEZING — PROGRAMMA = BLOK
───────────────────────────────────────────────────────────────────────────────

In open prioriteit 2 op C, toon programProfile-teruglezing als feitelijke regel:
  "Kracht · thuis · 2× per week · beginner"
Niet instelbaar op C — link "Wijzig in je programma →" naar A/E.

Prioriteit 1 en 2 in brug-sheet context VERVALLEN (brug bestaat niet meer).
Acties prioriteit 1–2: op E/D (basis) en schap B (extra).

───────────────────────────────────────────────────────────────────────────────
8. STATE + REVIEWER-CHROME
───────────────────────────────────────────────────────────────────────────────

Nieuwe state-velden:

  hasVisitedShelf: false
  extraDismissedUntil: null   // ISO date
  extraExpiresAt: null        // per OPTS[].ttlDays of eenmalig

Reviewer-schakelaar (bovenin, bestaande chrome):
  · eerste_keer — !extraChosen && !hasVisitedShelf
  · dag_daarna — hasVisitedShelf && !extraChosen
  · extra_gekozen — extraChosen && !expired
  · extra_verlopen — extraExpiresAt in verleden
  · extra_gedisst — dismissed vandaag

Comment-header bovenaan HTML (v3.5 locks, 15 regels, zoals v3.4 r.1–35).

───────────────────────────────────────────────────────────────────────────────
9. TOKENS + RESPONSIVE
───────────────────────────────────────────────────────────────────────────────

Behoud v3.4 tokens (--move, --ink, --serif, etc.).

Responsiviteit via @container app (min-width:860px) — slaap v2 patroon, geen @media
voor surface-layout.

375px primair. 1280px: rail op C.

───────────────────────────────────────────────────────────────────────────────
10. MEETPUNTEN — DOCUMENTEER IN VERDICT §H, NIET IN HTML
───────────────────────────────────────────────────────────────────────────────

| Event | Payload |
| choice.shelf_opened | { domain:'beweging', from_state, label_variant:'basis'\|'ernaast', target:'b'\|'d' } |
| choice.extra_selected | { option_id, type } |
| choice.extra_dismissed | { option_id, until } |
| dashboard_vandaag_extra_toggled | { done: true\|false } |
| dashboard.agenda_domain_link_click | { domain:'beweging', to:'beweging'\|'voortgang'\|'keuze' } |

═══════════════════════════════════════════════════════════════════════════════
USER JOURNEYS — max 5 stappen, verplicht in verdict §E
═══════════════════════════════════════════════════════════════════════════════

J1 EERSTE KEER
  1. Opent A → ziet basis-voorstel + knop "Voeg iets toe aan je basis"
  2. Tik → B (Maak een keuze) → kiest PT-intake → Favorieten
  3. C toont readout + gekozen (basis + extra) + prioriteitsblokken
  4. E toont "Vandaag ook" + knop heet nu "Zet er iets naast"
  5. Tik "Zet er iets naast" → D → extra-rij in timeline

J2 DAG DAARNA
  1. Opent E → knop "Zet er iets naast"
  2. Tik → D direct (geen schap)
  3. Afvinken extra op D → E sync
  4. Koppelstrip "Bekijk bewijs" → C

J3 DISMISS
  1. Op D → "Niet vandaag" op extra
  2. Extra verdwijnt op D en E
  3. Knop blijft "Zet er iets naast" (hasVisitedShelf true)

J4 EXPIRY
  1. Reviewer zet extra_verlopen
  2. Extra verdwijnt; label terug "Voeg iets toe aan je basis"
  3. C toont alleen basis in gekozen-blok

J5 VOORTGANG BEWIJS
  1. C → readout (gemeten) boven gekozen (gekozen)
  2. Prioriteit 3 open → max 3 acties, geen dag-knop
  3. Prioriteit 6 dicht · gate-copy

═══════════════════════════════════════════════════════════════════════════════
ACCEPTATIE — reviewer checklist
═══════════════════════════════════════════════════════════════════════════════

[ ] 375px: D = timeline (slaap MD), niet v3.4 raster/tray
[ ] 1280px: C heeft sticky rail prioriteiten
[ ] Geen trapezoid/clip-path in DOM
[ ] Gerenderde tekst: "Prioriteit N", geen "Laag N"
[ ] "Voeg iets toe" → B; "Zet er iets naast" → D (4 reviewer-staten)
[ ] extraChosen nooit true zonder B-actie
[ ] E ↔ D afvink-sync werkt
[ ] 0 JS console errors · 0 verboden woorden (L4) · touch targets ≥44px
[ ] Eén h1 per scherm
[ ] Scherm B bereikbaar vanuit flow (niet alleen tab)

═══════════════════════════════════════════════════════════════════════════════
OUTPUT
═══════════════════════════════════════════════════════════════════════════════

1. Eén HTML-bestand: beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html
2. Verdict A–M:
   A diagnose (waarom v3.4→v3.5)
   B surface-model (A/E/B/C/D)
   C visueel (PriorityLadder)
   D inhoud (twee bronnen op C)
   E journeys (J1–J5)
   F Consumentenbond-keten (prioriteit 1–6)
   G implementatie-hints voor later src/ (geen code)
   H meetpunten
   I governance (Prioriteit vs product-L1/L2/L3)
   J copy-lock
   K acceptatiematrix (4 reviewer-staten)
   L HTML-prebuild notities
   M open vragen (max 3)

Begin met het HTML-artifact. Lever daarna het verdict.
```

---

## Na review — implementatie-hints (niet Opus-taak)

Wanneer v3.5 design-lock akkoord is, vertaalt slice 9+ in `src/` naar:


| Prebuild             | React                                                     |
| -------------------- | --------------------------------------------------------- |
| dual-label knop      | `BewegingScreen.tsx` + `MovementCockpit.tsx`              |
| B schap              | nieuwe route of sheet — `ChoiceShelfSheet`                |
| D timeline           | `AgendaDayTimeline.tsx` refactor naar slaap MD-patroon    |
| C prioriteitsblokken | `BewegingAdviesTreden.tsx` → `MovementPriorityLadder.tsx` |
| `extraChosen` state  | Supabase veld op `account_priority_pref` of jsonb         |


**Meetpunt (na implementatie):** `choice.shelf_opened{label_variant,target}` — hier lees je af of "Voeg iets toe" vs "Zet er iets naast" converteert, en of routing B vs D klopt.