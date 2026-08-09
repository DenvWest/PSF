# Prompt — Beweging V3.1: leefstijl-piramide + onderbouwing + Mijn Dag-koppeling

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (Artifacts / nieuw gesprek).  
> **Optioneel:** voeg als bijlage het bestaande v3-prebuild toe (`docs/design/beweging-keuze-consumentenbond-prebuild-v3-2026-08.html`) — Opus moet **uitbreiden**, niet opnieuw uitvinden.  
> **Output:** één self-contained HTML-prebuild. Geen React, geen repo-patches.  
> **Doelbestand na review:** `docs/design/beweging-leefstijl-piramide-prebuild-v3.1-2026-08.html`  
> **Opgesteld:** 8 augustus 2026

---

## Plaats in de reeks

| Doc | Relatie |
| --- | --- |
| [`beweging-keuze-consumentenbond-prebuild-v3-2026-08.html`](../design/beweging-keuze-consumentenbond-prebuild-v3-2026-08.html) | **Basis** — alle locks, tokens, schermen A–E, brug, B geparkeerd |
| [`BESLUIT_BEWEGING_PRODUCT_EN_IA.md`](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md) | Product-IA: A/E = één surface, Mijn Dag-sync, geen fase-ladder |
| [`BESLUIT_FIT_PREFS.md`](../design/BESLUIT_FIT_PREFS.md) | Dual readout Bond/fit; L6 ladder-split; L7 moeite ná voorstel |
| [`voortgang-conversiekaart-prebuild-2026-07.html`](../design/voortgang-conversiekaart-prebuild-2026-07.html) | Visueel precedent `.rung` (open/wacht/ghost) — **niet** als accordeon-schap kopiëren |
| [`claude-opus-beweging-vandaag-programma-mijn-dag-prompt.md`](claude-opus-beweging-vandaag-programma-mijn-dag-prompt.md) | Mijn Dag SSOT, e-mail-nudge, geen dubbele completion |
| Dit document | **Nieuwe lock v3.1** — leefstijl-piramide als kompas + evidence + mobile/agenda-readout |

---

## Wat v3.1 toevoegt t.o.v. v3 (samenvatting voor reviewer)

1. **Leefstijl-piramide** — zes lagen van onder (dagelijks bewegen) naar boven (supplementen/wearables), geschaald op **prioriteit × evidence × moeite**. Kompas, geen gamification.
2. **Noordster-regel** — basis + kracht + dagelijks bewegen wint van perfect geoptimaliseerd schema dat niemand volhoudt.
3. **Drie plekken, één betekenis** — mini-piramide in brug (A/E), volledige piramide in Voortgang (C), week-readout + alert op Mijn Dag (D).
4. **Onderbouwing per laag** — elke rung heeft evidence, wanneer wel/niet, link-stijl naar onderbouwing.
5. **Mobile/agenda-koppeling** — mock herinnering + ladder-voortgang op D; geen native-app claim.

---

## Gebruiksinstructie

1. Open Claude Opus (nieuw gesprek).
2. Kopieer het volledige blok onder **Prompt (copy-paste)**.
3. **Aanbevolen:** plak v3-HTML als bijlage of plak de sectie "Functie–betekenis v3" uit deze prompt.
4. Review in browser: **375px** (eerste) en **≥1280px** (aside-rail met piramide).
5. Opslaan onder `docs/design/` als je tevreden bent.

---

## Prompt (copy-paste)

```text
═══════════════════════════════════════════════════════════════════════════════
ROL
═══════════════════════════════════════════════════════════════════════════════

Je bent Senior product designer + UX-architect + evidence editor voor
PerfectSupplement (perfectsupplement.nl) — de Consumentenbond van leefstijl
voor mannen 40+.

Je levert GEEN analyse-essay en GEEN React. Je levert één self-contained
HTML-prebuild (Artifacts of downloadbaar .html) die v3 UITBREIDT met de
leefstijl-piramide, sterkere onderbouwing, en Mijn Dag/mobile-readout.

Werk op basis van het bestaande prebuild
"beweging-keuze-consumentenbond-prebuild-v3-2026-08.html" (augustus 2026).
Behoud alle schermen, tokens, copy-stem en gelockte besluiten. Voeg toe,
vervang gericht waar hieronder staat — slopen niet.

═══════════════════════════════════════════════════════════════════════════════
NOORDSTER — lees dit als kompas voor elke ontwerpkeuze
═══════════════════════════════════════════════════════════════════════════════

> Een goede basisconditie + krachttraining + dagelijks bewegen wint vrijwel
> altijd van een perfect geoptimaliseerd trainingsschema dat iemand niet
> volhoudt.

De piramide is het **kompas van de leefstijl-ladder**: ze laat zien waar
interventies horen qua prioriteit, evidence en moeite. Ze is GEEN ranglijst
om te "winnen" en GEEN shop-etage die omhoog duwt.

═══════════════════════════════════════════════════════════════════════════════
DE BEWEGINGSPIRAMIDE — inhoud (verplicht, letterlijk overnemen)
═══════════════════════════════════════════════════════════════════════════════

ASCII-referentie (mag visueel mooier, betekenis identiek):

                 ▲
                / 6 \   Supplementen / wearables / biohacks
               /-----\
              /   5   \  Geavanceerde training
             /---------\
            /     4     \  Specifiek sporten
           /-------------\
          /       3       \  Progressief trainen
         /-----------------\
        /         2         \  Kracht + basisconditie
       /---------------------\
      /           1           \  DAGELIJKS BEWEGEN
     /_________________________\  Zitten onderbreken · wandelen · fietsen

Van onder naar boven. Laag 1 = hoogste prioriteit.

┌─────┬──────────────────────────┬────────────┬─────────────────────────────────────────────────────────┬────────┬──────────────────────────────┐
│ Laag│ Label                    │ Prioriteit │ Evidence (1 zin, NL)                                    │ Moeite │ Wanneer wel / wanneer niet │
├─────┼──────────────────────────┼────────────┼─────────────────────────────────────────────────────────┼────────┼──────────────────────────────┤
│  1  │ Dagelijks bewegen        │ Hoog       │ Minder lang zitten en NEAT verhogen leveren voor de     │ Laag   │ WEL: sedentair werk, stijf-│
│     │                          │            │ meeste mensen meer gezondheidswinst dan een extra       │        │ heid, lage dagscore.       │
│     │                          │            │ trainingssessie per week.                               │        │ NIET: als vervanging van   │
│     │                          │            │                                                         │        │ kracht (laag 2).           │
├─────┼──────────────────────────┼────────────┼─────────────────────────────────────────────────────────┼────────┼──────────────────────────────┤
│  2  │ Kracht + basisconditie   │ Hoog       │ Twee keer per week kracht plus regelmatig matig         │ Medium │ WEL: spierbehoud 40+,      │
│     │                          │            │ intensief bewegen is de standaard voor volwassenen      │        │ matige score, basisplan.   │
│     │                          │            │ — sterker dan alleen cardio.                            │        │ NIET: als laag 1 ontbreekt │
│     │                          │            │                                                         │        │ én iemand al overbelast is.│
├─────┼──────────────────────────┼────────────┼─────────────────────────────────────────────────────────┼────────┼──────────────────────────────┤
│  3  │ Progressief opbouwen     │ Medium     │ Kracht en conditie bouw je op via geleidelijke         │ Medium │ WEL: basis 4+ weken vol.   │
│     │                          │            │ toename van volume/intensiteit — niet via één           │        │ NIET: als laag 2 niet      │
│     │                          │            │ perfect schema vanaf week 1.                            │        │ volhoudbaar is.            │
├─────┼──────────────────────────┼────────────┼─────────────────────────────────────────────────────────┼────────┼──────────────────────────────┤
│  4  │ Specifiek sporten        │ Medium-laag│ Doelgericht trainen (hardlopen, zwemmen, teamsport)     │ Hoog   │ WEL: laag 1–2 staan,       │
│     │                          │            │ loont pas als de basis staat.                           │        │ duidelijk doel.            │
│     │                          │            │                                                         │        │ NIET: als vervanging van   │
│     │                          │            │                                                         │        │ kracht zonder plan.        │
├─────┼──────────────────────────┼────────────┼─────────────────────────────────────────────────────────┼────────┼──────────────────────────────┤
│  5  │ Geavanceerde training    │ Laag       │ Periodisering, zone 2 vs intervallen, herstel —         │ Hoog   │ WEL: laag 3 minstens       │
│     │                          │            │ marginale winst boven solide basis.                     │        │ 8 weken stabiel.           │
│     │                          │            │                                                         │        │ NIET: als motivatie-       │
│     │                          │            │                                                         │        │ truc vóór basis.           │
├─────┼──────────────────────────┼────────────┼─────────────────────────────────────────────────────────┼────────┼──────────────────────────────┤
│  6  │ Supplementen / wearables │ Laagst     │ Creatine, cafeïne, wearables — optimalisatie ná         │ Laag–  │ WEL: stepped care, na      │
│     │                          │            │ lifestyle; geen vervanging van laag 1–2.                │ medium │ hertest / eiwit-gap.       │
│     │                          │            │                                                         │        │ NIET: vóór laag 2 staat.   │
└─────┴──────────────────────────┴────────────┴─────────────────────────────────────────────────────────┴────────┴──────────────────────────────┘

Per laag in de UI (expanded state), toon exact deze velden:
  · Label · Prioriteit-chip (Hoog/Medium/Laag) · Moeite-chip (Laag/Medium/Hoog)
  · Evidence (1 zin) · Wanneer wel · Wanneer niet
  · Link-stijl: "Bekijk onderbouwing →" (mock href ok, geen echte URL nodig)
  · Optioneel: 0–2 gekoppelde opties uit scherm B (readonly preview, geen shop)

Koppeling B-kaarten → lagen (mock-ids uit v3):
  · Laag 1: data-opt="ritme", data-opt="wandelen"
  · Laag 2: basis-strip (primair pad), wandelen als conditie-aanvulling
  · Laag 3: duur-chips in A (15–20 / 25–40 / 45–60)
  · Laag 4: data-opt="pt-intake", "baantjes", "keten", "krachtgroep"
  · Laag 5: geen kaart verplicht — conceptcopy
  · Laag 6: data-opt="magnesium" (verdict Nu niet), creatine als toekomstige ghost

═══════════════════════════════════════════════════════════════════════════════
FUNCTIE–BETEKENIS v3 — wat elk onderdeel DOET (niet hernoemen, niet breken)
═══════════════════════════════════════════════════════════════════════════════

Gebruik deze tabel als SSOT. v3.1 voegt alleen kolom "v3.1 toevoeging" toe.

┌──────────────────┬────────────────────────────────────────────┬─────────────────────────────────────────────┐
│ Onderdeel        │ Functie (betekenis)                        │ v3.1 toevoeging                             │
├──────────────────┼────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ A · first-run    │ Verkoopt en plant het basisplan, eenmalig. │ Brug toont mini-piramide + "waar je staat". │
│   #s-a           │ Vier sub-staten A1–A4 op één surface.      │ Piramide in brug ingeklapt op A1–A2.        │
├──────────────────┼────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ E · elke dag     │ Plan staat vast; vraagt: deed je het?      │ Brug prominenter; week-laag readout.        │
│   #s-e           │ Geen keuzelijst in first viewport.         │ "Zet er iets naast" = kompas, geen schap.   │
├──────────────────┼────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ A = E            │ Één component, state first-run | vandaag.  │ Piramide-readout sync tussen A3/A4 en E.    │
├──────────────────┼────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ basis-strip      │ Onverkoopbaar primair pad — anker.         │ Visueel gekoppeld aan laag 2 piramide.      │
├──────────────────┼────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ #a-help /        │ Dunne brug: waar traject naartoe gaat.     │ + mini-piramide + volgende logische stap.   │
│ #e-help          │ Niet de B-catalogus.                     │ + chain Check→Advies→Favorieten→Beste.      │
├──────────────────┼────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ B · geparkeerd   │ Referentie kaartmodel; niet in-flow.       │ Kaarten mappen op piramide-lagen (readonly).│
│   #s-b           │ Alleen via tabbalk.                        │ Geen nieuwe paden vanaf A/E naar volle B.   │
├──────────────────┼────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ C · Voortgang    │ Meetpad + gekozen samenvatting.            │ Volledige klikbare piramide + meet-track.   │
│   #s-c           │ Premium ná meetpad.                        │ Open rung toont evidence + kaart-previews.  │
├──────────────────┼────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ D · Mijn Dag     │ Executie: Markeer als gedaan = SSOT.       │ Ladder-weekstrip + mock alert/herinnering.  │
│   #s-d           │ Twee blokken: sessie vs afspraak.          │ Koppeling perfectsupplement.nl (web, geen    │
│                  │                                            │ "download app"-hype).                       │
├──────────────────┼────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ aside .rail      │ Context Peter + "Zo werkt het hier".       │ Desktop: interactieve piramide in rail.     │
│                  │ Desktop only (≥1280px).                    │ Vervangt 3-staps lijst door kompas.         │
├──────────────────┼────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ verdict chips    │ Aanrader / Alleen als / Nu niet — Bond.    │ Onveranderd. Piramide sorteert TYPE, niet   │
│                  │                                            │ partner-rang. Geen rangnummer op kaarten.   │
├──────────────────┼────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ stepped care     │ Nu niet → "Zet klaar voor <datum>".        │ Laag 6 altijd gated; magnesium = voorbeeld. │
└──────────────────┴────────────────────────────────────────────┴─────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
HARDE LOCKS — schenden = mislukt ontwerp
═══════════════════════════════════════════════════════════════════════════════

1. A en E blijven ÉÉN surface met twee staten — geen terugkeer naar aparte apps.
2. In-flow deur = dunne brug (#a-help / #e-help), NOOIT scherm B als etalage in A/E.
3. GEEN ordinaal "trede 4 van 6" of "Fase 1 van 3" als motivatie.
   WEL: "Je basis staat op laag 1–2" · "Laag 4–6 is pas zinnig als…"
4. Bond-oordeel blijft op kaarten; fit/piramide sorteert interventietype, geen commercie-rang.
5. Supplementen/wearables = laag 6, altijd gated (hertestdatum / nu niet).
6. Moeite = bijstelling ná voorstel ("Ik doe de korte") — geen intake-slider over piramide.
7. Voortgang meet, Mijn Dag doet — piramide op E is readout, geen tweede afvink-lijst.
8. Geen rangnummer per kaart in B (al weg in v3 — blijft weg).
9. "Sterk na 40" = eigen begeleiding op C, niet partner-merk in B.
10. Dark forest dashboard — geen light-variant, geen wellness-spa cliché.

═══════════════════════════════════════════════════════════════════════════════
TAAK — bouw v3.1 HTML-prebuild
═══════════════════════════════════════════════════════════════════════════════

Mobile-first 375px, bruikbaar ≥1280px. Dark forest. DM Serif Display + DM Sans
(embedded of Google Fonts — match v3).

Behoud tab-switcher A / E / B / C / D en alle bestaande content. Voeg onderstaande
NIEUWE of VERSTERKTE onderdelen toe.

───────────────────────────────────────────────────────────────────────────────
A. COMPONENT: .pyramid (herbruikbaar, CSS-only + minimaal JS)
───────────────────────────────────────────────────────────────────────────────

Drie varianten van hetzelfde component:

  .pyramid--mini     brug A/E — 6 segmenten horizontaal, 1 regel uitleg
  .pyramid--rail     aside desktop — gestapelde trapezia, klikbaar
  .pyramid--full     scherm C — volledige hoogte, alle lagen expandeerbaar

Visueel (sterk, craft):
  · Gestapelde trapezia of SVG-path piramide — GEEN emoji, GEEN stock icons
  · Breedte laag N = smaller naarmate N hoger (echte piramide-vorm)
  · Huidige laag(en): border --move (#C26E4B), zachte glow rgba(194,110,75,.15)
  · Locked lagen (5–6 voor mock-profiel): --mut, gestippeld, niet klikbaar
  · Open rung: panel eronder met evidence-grid (3 kolommen desktop, stack mobile):
      [Prioriteit-chip] [Evidence-chip] [Moeite-chip]
  · Noordster-regel boven eerste expand:
      "Basis + kracht + dagelijks bewegen wint van perfect geoptimaliseerd
       dat je niet volhoudt."

Interactie:
  · Max 1 open rung tegelijk (accordeon binnen piramide)
  · prefers-reduced-motion: geen animatie
  · aria: rung = button, expanded = aria-expanded
  · Prototype-schakelaar: huidige laag 1–6 (voor demo)

Mock-profiel (consistent met v3):
  · Peter, 47, matige beweegscore, doel spierbehoud
  · Basis: kracht thuis 2×/week (laag 2 actief)
  · Laag 1 deels: werkritme / staan (4/7 dagen mock)
  · Volgende suggestie copy: "Versterk laag 1 (zittend onderbreken) vóór laag 4"
  · Lagen 5–6 locked met "Eerst laag 1–2 volhouden"

───────────────────────────────────────────────────────────────────────────────
B. VERSTERK #a-bridge en #e-bridge (bridgeHtml vervangen/uitbreiden)
───────────────────────────────────────────────────────────────────────────────

Huidige brug = alleen Check→Advies→Favorieten→Beste. Nieuwe structuur:

  ┌─ Zet er iets naast ─────────────────────────────────────┐
  │ Je basis blijft je basis — dit komt er hooguit naast.   │
  │                                                         │
  │ [pyramid--mini]  ← "Waar je nu staat: laag 1–2"         │
  │                                                         │
  │ Volgende logische stap (max 1 regel):                   │
  │ "Elk werkuur 2 min staan — laag 1, geen extra training."│
  │                                                         │
  │ Check → Advies → Favorieten → Beste                     │
  │                                                         │
  │ [Open Voortgang →]  (naar #s-c)                        │
  └─────────────────────────────────────────────────────────┘

Op E: zelfde brug, copy iets assertiever ("Je hield laag 2 deze week 2/2 vol").

───────────────────────────────────────────────────────────────────────────────
C. SCHERM C (#s-c) — volledige piramide + meetpad
───────────────────────────────────────────────────────────────────────────────

Boven bestaande "gekozen"-panel:
  · Eyebrow: "Beweging · je kompas"
  · .pyramid--full met alle 6 lagen
  · Open laag 2 toont: basis-strip preview + wandelen-kaart (readonly, verdict zichtbaar)

Onder piramide: bestaande meet-track (review / 14d / 30d) ONVERANDERD.

Bridge-sectie op C: chain blijft, voeg toe: "Afvinken op Beweging telt mee voor laag 1–2."

───────────────────────────────────────────────────────────────────────────────
D. SCHERM D (#s-d) — Mijn Dag + mobile/agenda-koppeling
───────────────────────────────────────────────────────────────────────────────

Voeg toe (boven of onder vaste plan-strip):

  1. LEEFSTIJL-LADDER DEZE WEEK (readout, geen actie)
     "Basis 2/2 · Dagelijks 4/7 · Laag 3 nog niet open"
     Dunne voortgangsbalk per laag 1–2 (niet 6 — te veel in 375px)

  2. MOCK ALERT-KAART (concept, eerlijk gelabeld in prototype-chrome)
     Titel: "Herinnering · donderdag 18:00"
     Body: "Kracht thuis staat op je dag. Je hield laag 1–2 deze week 5 van 7 dagen vol."
     Footer: "Via e-mail · Instellingen" (stub knop)
     GEEN claim "push-notificatie" of "download de app".
     WEL: "perfectsupplement.nl op je telefoon" als bookmark/PWA-toon.

  3. AGENDA-KOPPELING (copy, 1 zin)
     "Een afspraak bij een partner telt apart: afvinken = afspraak gehad, niet training."

Behoud: "Markeer als gedaan" = enige completion-knop. Geen tweede vinklijst.

───────────────────────────────────────────────────────────────────────────────
E. ASIDE .rail (≥1280px) — piramide permanent zichtbaar
───────────────────────────────────────────────────────────────────────────────

Vervang nav.ladder "Zo werkt het hier" (3 stappen) door:
  · Kop: "Leefstijl-kompas · beweging"
  · .pyramid--rail (compact, ~280px breed)
  · Onder piramide: 1 zin "Dit is waar je opties horen — niet wat je vandaag moet."

Op mobile: .pyramid--rail hidden; mini alleen in brug.

───────────────────────────────────────────────────────────────────────────────
F. PLACEHOLDER andere domeinen (collapsed, onder C of in chrome-details)
───────────────────────────────────────────────────────────────────────────────

<details> "Hetzelfde kompas voor andere domeinen"
  · 5 lege piramide-silhouetten: Slaap · Voeding · Stress · Herstel · Verbinding
  · Copy: "Beweging eerst — schema volgt per domein."
  · Geen inhoud, geen scores.

═══════════════════════════════════════════════════════════════════════════════
VISUEEL · tokens (hard — match v3)
═══════════════════════════════════════════════════════════════════════════════

--bg #1a2e1a · --bg-hi #21381f
--sage #5A8F6A · CTA-tekst #0f1c10
--terra #C8956C (warmte, geen primary CTA-fill)
--move #C26E4B (beweging + huidige piramide-laag)
--ink #F1EFE8 · --soft #CDD7D0 · --mut #9FB0A6
panels rgba(255,255,255,.05) · border rgba(255,255,255,.12)

Piramide-specifiek:
--pyr-active: var(--move)
--pyr-locked: rgba(255,255,255,.08)
--pyr-evidence: rgba(90,143,106,.12) border rgba(90,143,106,.35)
--pyr-priority-high: rgba(194,110,75,.2)
--pyr-priority-low: rgba(159,176,166,.15)

Typografie: DM Serif voor laag-labels; DM Sans voor evidence.
Één compositie per viewport — geen card-soup.
CSS-only motion + prefers-reduced-motion.

═══════════════════════════════════════════════════════════════════════════════
COPY · stem
═══════════════════════════════════════════════════════════════════════════════

Nederlands. Jij/jou. Mannen 40+. Kort, concreet, peer-to-peer.
Woorden: "laag" niet "level"; "kompas" niet "ladder om te winnen".
Geen diagnose, geen "boost", geen hype, geen "koop nu".
Evidence-toon: richtlijnen en onderbouwing, geen medische claims.
Disclosure commercie: onveranderd uit v3.

═══════════════════════════════════════════════════════════════════════════════
PROTOTYPE-CHROME (bovenaan, mock)
═══════════════════════════════════════════════════════════════════════════════

Tabs A / E / B / C / D (bestaand).
Extra schakelaars:
  · Huidige laag: 1 | 2 | 3 | 4 | 5 | 6
  · Brug: open | dicht
  · Alert mock: aan | uit

═══════════════════════════════════════════════════════════════════════════════
VERBODEN
═══════════════════════════════════════════════════════════════════════════════

- GEEN React/Next/Tailwind-build
- GEEN ordinaal "fase X van Y" of "level up"
- GEEN productgrid met prijzen als hero
- GEEN supplement-CTA op E first viewport (quiet-door eiwit mag blijven)
- GEEN native app download-CTA
- GEEN rangnummers op partnerkaarten
- GEEN B-catalogus heropenen vanuit A/E first viewport
- GEEN emoji als iconografie
- GEEN Engelse UI-strings
- GEEN Lorem ipsum

═══════════════════════════════════════════════════════════════════════════════
ACCEPTatiecriterium
═══════════════════════════════════════════════════════════════════════════════

- [ ] Op 375px snapt een nieuwkomer: mijn basis staat op laag 2; laag 6 is niet voor nu
- [ ] Piramide voelt als kompas (evidence + prioriteit), niet als game/ladder om te winnen
- [ ] Brug "Zet er iets naast" toont mini-piramide + max 1 volgende stap + Voortgang-CTA
- [ ] C toont volledige piramide met evidence per laag + bestaand meetpad
- [ ] D toont week-readout + mock alert zonder dubbele completion
- [ ] Desktop rail toont interactieve piramide; mobile niet overload in first viewport
- [ ] Alle v3 locks intact (A=E, B geparkeerd, verdict chips, stepped care)
- [ ] Self-contained één HTML-bestand, offline in browser
- [ ] HTML-comment bovenaan: WAT v3.1 LOCKT (6–8 bullets)

═══════════════════════════════════════════════════════════════════════════════
OUTPUT-FORMAAT
═══════════════════════════════════════════════════════════════════════════════

1. HTML-comment (max 12 regels): v3.1 locks + relatie tot v3
2. Werkende prebuild met functionele piramide (klik, schakelaars)
3. Geen essay buiten de HTML
```

---

## Bijlage — mapping voor latere implementatie

| Piramide-laag | B `data-opt` | Product-surface |
| --- | --- | --- |
| 1 | `ritme`, `wandelen` | A/E dagritme, D agenda-blok |
| 2 | basis-strip | A programma, E kop |
| 3 | A duur-chips | Programma-sheet |
| 4 | `pt-intake`, `baantjes`, `keten`, `krachtgroep` | B geparkeerd, Favorieten |
| 5 | — | Copy only |
| 6 | `magnesium` | Voortgang trede 3, quiet-door eiwit |

**Code-aansluiting:** [`beweging-help-bridge.ts`](../src/lib/beweging-help-bridge.ts) → uitbreiden met `currentLayers: number[]`, `nextSuggestion: string`, `weekProgress: { layer: number; done: number; target: number }[]`.

---

## Checklist na Opus-run

1. [ ] 375px: first viewport E = Gedaan + basis, piramide niet dominant
2. [ ] 1280px: rail-piramide klikbaar, sync met brug
3. [ ] Geen schending BESLUIT_FIT_PREFS L6/L7
4. [ ] Opslaan als `beweging-leefstijl-piramide-prebuild-v3.1-2026-08.html`
5. [ ] Optioneel: korte verdict in `docs/cursors/claude-opus-beweging-leefstijl-piramide-v3.1-verdict.md`
