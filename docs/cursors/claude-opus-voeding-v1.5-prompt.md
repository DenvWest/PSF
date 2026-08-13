# Prompt — Voeding v1.5: slaap-v2 `.pl-row`-shell op v1-inhoud

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (nieuw gesprek, Artifacts aan).
> **Verplichte bijlagen:**
>
> - `[voeding-piramide-prebuild-v1-2026-08.html](../design/voeding-piramide-prebuild-v1-2026-08.html)` — inhoud, frames VQ·VR·VL, states F1–F6, readout, clusterrijen, poort
> - `[slaap-piramide-v2-prebuild-2026-08.html](../design/slaap-piramide-v2-prebuild-2026-08.html)` — **visueel skelet**: `.pl-row`, `.pl-bar`, sticky rail-patroon
> - `[BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md](../design/BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md)` — leidend; §C help · §D readout · §E rail · §F states · §G meetplan · §L slices
>
> **Output:** één self-contained HTML-prebuild + kort verdict A–M.
> **Doelbestanden na review:**
>
> - `docs/design/voeding-piramide-prebuild-v1.5-2026-08.html`
> - `docs/cursors/claude-opus-voeding-v1.5-verdict-2026-08.md`
> **Opgesteld:** 12 augustus 2026.

---

## Plaats in de reeks


| Doc                                                                                                                                | Relatie                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `[voeding-piramide-prebuild-v1-2026-08.html](../design/voeding-piramide-prebuild-v1-2026-08.html)`                                 | **Inhoudsbasis** — VQ/VR/VL, F1–F6, `.checkin-readout`, cluster-factrijen, laag-6-poort, zelf-calibratie |
| `[slaap-piramide-v2-prebuild-2026-08.html](../design/slaap-piramide-v2-prebuild-2026-08.html)`                                     | **Visueel skelet** — `.pl-row` + 4px statusbalk links, geen piramide-geometrie                           |
| `[BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md](../design/BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md)`                                       | Canon — copy-lock laagnaam zonder nummer (§0), delta N1–N7 (§D6), poort-voorwaarden (§E)                 |
| `[beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html)` | **Procedurele referentie** — comment-header, implementatie-tags, inline fonts, @container rail           |
| V1a+V1b in repo (aug 2026)                                                                                                         | Instrument: 13 kernvragen, `help` per vraag, `lifestyle-pyramid.ts` — prebuild moet hiermee syncen       |
| Dit document                                                                                                                       | **v1.5 lock** — transplant slaap-v2 UI-shell op v1-inhoud                                                |


---

## Wat v1.5 toevoegt t.o.v. v1 (samenvatting voor reviewer)

1. **Eetbasis-rail = slaap v2 `.pl-row`** — vervang `.layer`-cards; 4px statusbalk links; één open rij op VL.
2. **Self-contained HTML** — inline base64 fonts (DM Sans + DM Serif Display), geen Google Fonts CDN.
3. **Copy-lock voeding** — gerenderde tekst toont **alleen de laagnaam** ("Je eetbasis"), **nooit** "Laag N", "Prioriteit N" of ordinaal. Intern mag `layer: 1..6` blijven.
4. **O.3-sync** — "Vraag n van **13**"; geen `breadth_skipped`-pad; help-disclosure één keer per VQ (reviewer-toggle open/dicht OK, geen dubbele statische kopie).
5. **Implementatie-tags** — commentblok koppelt prebuild aan Cursor-slices V1c–V1h (§L).
6. **Rail-states visueel compleet** — v1 had `wacht`/`info` in JS zonder CSS; v1.5 mapt alle zes toestanden naar `.pl-bar`-kleuren.

---

## Gebruiksinstructie

1. Open Claude Opus, nieuw gesprek, Artifacts aan.
2. Upload **drie** bijlagen (v1 voeding + slaap v2 + optioneel beweging v3.5 als procedure-ref).
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Review in browser op **375px** (primair) en **≥1280px** (sticky rail op VL indien gebouwd).
5. Sla HTML op als `docs/design/voeding-piramide-prebuild-v1.5-2026-08.html`.
6. Sla verdict op als `docs/cursors/claude-opus-voeding-v1.5-verdict-2026-08.md`.

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
DRIe BIJLAGEN — transplant shell, behoud inhoud
═══════════════════════════════════════════════════════════════════════════════

BIJLAGE A — "voeding-piramide-prebuild-v1-2026-08.html"
  · BEHOUD: frames VQ · VR · VL; states F1–F6; STATES{}-inhoud (readout, facts,
    hidden, gate, reconcile); renderReadout(); renderFactRow(); renderVQ/VR/VL-logica;
    LAYER_ACTIONS; zelf-calibratie; beweging-koppelregel (F6); sticky reviewer-chrome
  · VERWIJDER/VERVANG: CSS .layer*; renderVL-rail die .layer gebruikt; Google Fonts
    CDN-links; dubbele statische help-disclosure (behoud reviewer-variant, zie §6);
    elke verwijzing naar breadth_skipped als normale toestand

BIJLAGE B — "slaap-piramide-v2-prebuild-2026-08.html"
  · KOPIEER (adapt voor voeding): CSS .pl-row · .pl-bar · .pl-tab · .pl-txt ·
    .pl-head · .pl-body · .pl-chev · .pl-state; renderLadder()-structuur
    (variant 'full' | 'rail'); @container sticky rail op brede VL
  · NIET KOPIËREN: slaap LAYERS-inhoud, zone S/B/V-switcher, sleep gate, MD-timeline

BIJLAGE C — "BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md" (tekstueel)
  · Copy-lock §0: laagnaam zonder cijfer in UI
  · §C help-contract per slider-id
  · §D delta N1–N7 + KILL-lijst
  · §E rail-toestanden + poort (drie voorwaarden)
  · §F state-matrix F1–F6
  · §G meetplan (documenteer in verdict §H, niet in HTML)

De opdracht is één HTML met ÉÉN state-object. Geen iframe, geen externe imports.

═══════════════════════════════════════════════════════════════════════════════
NOORDSTER — ongewijzigd sinds v1
═══════════════════════════════════════════════════════════════════════════════

> Eerst structureel goed eten, daarna pas perfect eten.

De eetbasis-rail sorteert waar je eerst wint — geen ranglijst om te winnen,
geen schap dat omhoog duwt. Laag 6 opent alleen als je bord het niet meer oplost.

═══════════════════════════════════════════════════════════════════════════════
PRODUCTBESLUIT v1.5 — sync met repo aug 2026 (V1a+V1b)
═══════════════════════════════════════════════════════════════════════════════

  · 13 verplichte kernvragen — "Vraag n van 13". Geen optionele breedte-fase.
  · breadth_skipped: VERWIJDERD uit normale flows. Geen F-state die "vier extra
    vragen overgeslagen" toont tenzij als expliciete reviewer-only legacy-note
    in <details> ontwerpnotities.
  · Help-disclosure: trigger altijd "Waarom vragen we dit?", onder slider, boven nav.
  · VR: geen score-h1, geen supplement-<details>, geen Vergelijk-links (L6/L7).
  · VL: readout identiek aan VR (variant voortgang); rail = hoofdinhoud.
  · Poort laag 6: drie voorwaarden (§E) — check gedaan + signaal + geen below in laag 1.

═══════════════════════════════════════════════════════════════════════════════
HARDE LOCKS — schending = afgekeurd
═══════════════════════════════════════════════════════════════════════════════

VL1  COPY LAAGNAAM, NOOIT NUMMER. Gerenderde tekst, aria-labels, eyebrows:
     WEL: "Je eetbasis" · "Voedingskwaliteit" · "Aanvullen & vergelijken"
     VERBODEN: "Laag 1" · "Prioriteit 3" · "3 van 6" · voortgangsbalk over de rail.
     Intern: layer/id 1–6 mag blijven in JS/data.

VL2  GEEN PIRAMIDE-GEOMETRIE. Geen clip-path, trapezium, taper, gevulde segmenten.
     Zes rijen = slaap v2 .pl-row met 4px statusbalk links.

VL3  READOUT SSOT. `.checkin-readout` identiek op VR en VL (L10). Op VR is conclusie
     de h1; op VL is pagina-h1 "Je voedingsbeeld" en readout-hoofd = h2.
     SSOT-vlag op VL: "Zelfde blok als op je check-in resultaat" (optioneel, 1 regel).

VL4  TWEE BRONNEN OP VL, ÉÉN CONCLUSIE. Readout (gemeten) boven rail (structuur).
     Clusterrijen op VR secundair; op VL alle laag 1–2 rijen open (geen max-4 cap).

VL5  POORT LAAG 6. VR: NOOIT supplement, prijs, productkaart, vergelijk-link.
     VL: label-only links alleen bij gateOpen === true. Gate-copy per F-state verschilt
     (F1/F2/F3/F4/F6 = dicht om andere reden — test §F).

VL6  DELTA N1–N7. Letterlijke antwoordlabels. KILL-lijst §D6: geen "band",
     "bewoog de goede kant op", "tekort", "4 van 7", pijltjes als richting.

VL7  VERBODEN UI-WOORDEN (BESLUIT canon): stappenplan · route · fase · spoor ·
     categorie · cockpit · score op VR · biohack · ordinaal over de ladder.

VL8  F3 ACTIELIJST: max 1 actie op laag "nu" (railSingleAction). Geen tweede stap,
     geen supplement, geen "pak het weer op".

VL9  ZELF-CALIBRATIE display-only t/m laag 3. Reconcile-copy uit STATES per F-state.

VL10 MEETPUNTEN ALLEEN IN VERDICT §H — niet in HTML mock-tracking.

── v1 locks, herhaal ──

L6/L7  Vergelijken alleen achter poort op VL laag 6.
L7     Geen genummerde actielijst op VR-resultaat.
L11    Beweging-koppelregel: max 1 regel, alleen F6 (geen check).

═══════════════════════════════════════════════════════════════════════════════
WIJZIGINGEN v1.5 — acht genummerde, alle verplicht
═══════════════════════════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────────────────────────
1. VISUEEL SYSTEEM: SLAAP v2 .pl-row OP VOEDING-RAIL
───────────────────────────────────────────────────────────────────────────────

Importeer uit slaap v2 (Bijlage B):

  CSS: .pl-row · .pl-bar · .pl-tab · .pl-txt · .pl-head · .pl-body · .pl-chev
       .pl-state · .pl--rail · .cols--railright (optioneel desktop VL)

Vervang v1 .layer CSS volledig.

renderEetbasisRail(state, variant):
  variant = 'full' | 'rail'
  · full op VL: zes .pl-row, één open (ui.openLayer), gesloten = één "waarom wacht"-regel
  · rail op VL desktop (≥860px @container): sticky navigatie sync met full

Map LAYERS[] (v1) → RAIL_ROWS[]:
  · key 1–6 intern behouden
  · name uit v1 LAYERS (geen nummer in render)
  · note uit v1 waar aanwezig

Status mapping (voeding → pl-bar kleur):
  · nu      → terra bar + border (hier ligt je winst)
  · staat   → sage bar
  · wacht   → muted bar, dashed border optioneel
  · dicht   → muted bar + lock-icoon op laag 6
  · ghost   → geen accent-bar, dashed, opacity .72 (laag 5)
  · info    → subtiele bar, read-only (laag 4 "Op jouw situatie")

State-labels in UI (kort, NL):
  nu → "hier ligt je winst" · staat → "staat" · wacht → "straks"
  dicht → "dicht" · ghost → "nog niet" · info → "ter info" · open poort → "open"

Laag 1 staat BOVEN. 1 → 6 leest van boven naar beneden.

───────────────────────────────────────────────────────────────────────────────
2. VL HERORDENEN — PARITEIT MET §J LAYOUT
───────────────────────────────────────────────────────────────────────────────

Volgorde op VL (top → bottom):

  1. backlink "‹ Voortgang"
  2. h1 "Je voedingsbeeld" + datum/sub
  3. CHECK-READOUT (variant voortgang) — of CTA "Doe de voedingscheck" bij F6
  4. sectionhead "Je eetbasis, van onder naar boven"
  5. EETBASIS-RAIL (full + optioneel sticky rail desktop)
  6. clusterrijen ALLE laag 1–2 (open, geen "toon alles" cap) — alleen if !noResult
  7. zelf-calibratie
  8. beweging-koppelregel (F6 only)
  9. onderbouwing-footnote

Op VR volgorde ONVERWIJzigD t.o.v. v1: readout → clusterrijen (max 4 + toon alles) →
buiten je bord → ijkpunt → footlinks.

───────────────────────────────────────────────────────────────────────────────
3. VQ — O.3 SYNC + ÉÉN HELP-PATROON
───────────────────────────────────────────────────────────────────────────────

  · count: "Vraag 4 van 13" (niet 11)
  · VRAAG.prompt: gebruik herformulering groente uit §C (porties planten)
  · helpBody/helpAnchor: exact uit BESLUIT §C tabel `vegetables`
  · Één <details class="qhelp">; reviewer-chrome toggle "help open/dicht" OK
  · VERWIJDER de v1 hack "Hieronder staat dezelfde disclosure open…" + dubbele #qhelpOpen

───────────────────────────────────────────────────────────────────────────────
4. STATES F1–F6 — INHOUD ONVERWIJzigD, RAIL-RENDER NIEUW
───────────────────────────────────────────────────────────────────────────────

Behoud alle STATES{}-copy uit v1. Pas alleen render-logica aan:

  F1: railFocus 1, gate dicht, 3 acties laag 1
  F2: idem patroon v1
  F3: railSingleAction true → 1 actie
  F4: railFocus 3, laag 1–2 staat, laag 3 nu
  F5: gateOpen true, max 2 label-only links
  F6: noResult, geen VR, VL wachtstand + beweging-koppel

Gate-reasons moeten per state verschillen (§F test).

───────────────────────────────────────────────────────────────────────────────
5. TOKENS + SELF-CONTAINED
───────────────────────────────────────────────────────────────────────────────

  · Inline @font-face base64 voor DM Sans + DM Serif Display (kopieer patroon
    beweging v3.5 — geen fonts.googleapis.com)
  · Tokens uit v1 (--shell, --bg, --terra, --sage, --move, etc.)
  · Responsiviteit via @container phone (min-width:860px) voor VL rail
  · 375px primair; touch targets ≥44px; één h1 per frame

───────────────────────────────────────────────────────────────────────────────
6. COMMENT-HEADER + IMPLEMENTATIE-TAGS
───────────────────────────────────────────────────────────────────────────────

HTML-comment bovenaan, twee blokken:

A) "v1.5 — WAT DIT LOCKT" (12–15 regels): pl-row shell, copy-lock laagnaam,
   13 vragen, readout SSOT, poort L6, geen CDN, F1–F6.

B) "IMPLEMENTATIE-TAGS" — koppel prebuild aan Cursor-slices §L:

  · V1a — DONE in repo: 13 kernvragen + help velden → NutritionCapture V1e
  · V1b — DONE in repo: NUTRITION_LAYERS/CLUSTERS → lifestyle-pyramid.ts
  · V1c — buildNutritionConclusion + fact-rows + delta N1–N7 → nutrition-conclusion.ts
  · V1d — NutritionCheckinReadout.tsx + NutritionResultView refactor
  · V1e — help <details> in NutritionCapture (patroon uit VQ frame)
  · V1f — VoedingEetbasisRail.tsx op VoortgangDomeinScreen (pl-row vertaling)
  · V1g — poort laag 6: nutritionLogCompleted + below-signaal
  · V1h — meetpunten §G (nutrition_checkin_routing_click, layer_action_click, …)

───────────────────────────────────────────────────────────────────────────────
7. REVIEWER-CHROME
───────────────────────────────────────────────────────────────────────────────

Behoud sticky switchers: Frame VQ · VR · VL + State F1–F6 + statenote.
Voeg optioneel: viewport-breedte 375 | 1280 toggle (niet verplicht).

───────────────────────────────────────────────────────────────────────────────
8. ONTWERPNOTITIES (<details> onderaan)
───────────────────────────────────────────────────────────────────────────────

Max 10 bullets: verschil v1→v1.5; O.3 sync; waarom geen "Prioriteit" copy;
migratie-naad delta (logs vóór V1c); deeplink contract
`/dashboard?tab=voortgang&screen=domein&domein=voeding`.

═══════════════════════════════════════════════════════════════════════════════
USER JOURNEYS — max 5 stappen, verplicht in verdict §E
═══════════════════════════════════════════════════════════════════════════════

J1 EERSTE CHECK (F1)
  1. VQ vraag 4/13 + help disclosure
  2. VR readout + CTA "Bekijk je voedingsbeeld"
  3. VL: zelfde readout + rail laag 1 nu + poort dicht
  4. Geen supplement op VR
  5. Gate-copy noemt below in eetbasis

J2 VOORUITGANG (F2)
  1. VR delta N3 met antwoordlabels
  2. VL rail laag 1 nu of staat
  3. Poort blijft dicht (andere reden dan F1 indien van toepassing)

J3 TERUGVAL (F3)
  1. VR empathie-opening + delta N4
  2. VL precies 1 actie op laag nu
  3. Geen extra actie, geen supplement

J4 ONDERHOUD (F4)
  1. VR conclusie "volhouden"
  2. VL focus verschuift naar laag 3 (verhoudingen)
  3. Poort dicht — geen signaal

J5 POORT OPEN (F5)
  1. VR ongewijzigd — nog steeds geen vergelijk op VR
  2. VL laag 6 open, max 2 label-only links
  3. Gate-copy: bord dekt het niet meer

J6 GEEN CHECK (F6) — bonus
  1. VR bestaat niet
  2. VL CTA check + rail wacht + beweging-koppelregel

═══════════════════════════════════════════════════════════════════════════════
ACCEPTATIE — reviewer checklist
═══════════════════════════════════════════════════════════════════════════════

[ ] 375px: VL rail = .pl-row met 4px bar, geen .layer in DOM
[ ] Geen "Laag N" / "Prioriteit N" / ordinaal in gerenderde tekst
[ ] "Vraag n van 13" op VQ
[ ] Readout identiek VR/VL (tekst), variant CTA verschilt
[ ] F5: poort open op VL only; F1–F4/F6: dicht met verschillende copy
[ ] F3: max 1 rail-actie
[ ] Geen Google Fonts CDN; dubbelklik werkt offline
[ ] 0 JS console errors · 0 verboden woorden (VL7) · touch ≥44px
[ ] Implementatie-tag commentblok aanwezig
[ ] F1–F6 reviewer-switchers werken

═══════════════════════════════════════════════════════════════════════════════
OUTPUT
═══════════════════════════════════════════════════════════════════════════════

1. Eén HTML-bestand: voeding-piramide-prebuild-v1.5-2026-08.html
2. Verdict A–M:
   A diagnose (waarom v1→v1.5)
   B surface-model (VQ/VR/VL)
   C visueel (.pl-row rail)
   D inhoud (readout + clusters + poort)
   E journeys (J1–J6)
   F Consumentenbond-keten (zes lagen)
   G implementatie-hints voor src/ (V1c–V1h mapping)
   H meetpunten (§G)
   I governance (laagnaam vs data-contract)
   J copy-lock
   K acceptatiematrix (F1–F6)
   L HTML-prebuild notities
   M open vragen (max 3)

Begin met het HTML-artifact. Lever daarna het verdict.
```

---

## Na review — implementatie-volgorde (niet Opus-taak)


| Prebuild v1.5 lock         | Cursor-slice | React / lib                    |
| -------------------------- | ------------ | ------------------------------ |
| `.checkin-readout`         | V1d          | `NutritionCheckinReadout.tsx`  |
| clusterrijen + delta N1–N7 | V1c          | `nutrition-conclusion.ts`      |
| VQ help disclosure         | V1e          | `NutritionCapture.tsx`         |
| `.pl-row` eetbasis-rail    | V1f          | `VoedingEetbasisRail.tsx`      |
| laag-6 poort               | V1g          | `statistieken-advies-model.ts` |
| events §G                  | V1h          | readout + capture + rail       |


**V1a+V1b** staan al in de repo (aug 2026) — commit apart van v1.5 docs.

**Meetpunt (na V1h):** `nutrition_checkin_routing_click{target}` + `nutrition_layer_action_click` — hier lees je af of VR→VL converteert en of de rail werkscherm is i.p.v. leesscherm.