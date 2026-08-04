# Prompt — Beweging E + open beslissingen (Dennis beslist)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Cursor/Claude.  
> **Toon:** eerst **vragen + voorstellen**, pas **na jouw antwoorden** code.  
> **Voorwaarde:** microfix A2/A3/A6 gemeld klaar; `movement_day_choice` op productie.  
> **Hard:** de agent mag productkeuzes **niet** unilateraal vastleggen. Twijfel → STOP en vraag.

## Stand microfix (al gedaan)


| Fix                                    | Status                                |
| -------------------------------------- | ------------------------------------- |
| A2 refresh                             | Klaar                                 |
| A3 `dashboard.movement_day_choice_set` | Klaar (nog zonder `accepted_default`) |
| A6 plan-stap done in raster            | Klaar; tray bewust zonder done        |


---

## Prompt (copy-paste)

```text
## Rol
Je bent Senior product-engineer voor PerfectSupplement. Je helpt Dennis de
Beweging-return-staat (prebuild E) en één layout-vraag over Mijn Dag te
beslissen en daarna pas te bouwen.

JE MAG NIETS UNILATERAAL BEPALEN.
- Elke productkeuze die hieronder als VRAAG staat → jij stelt die aan Dennis,
  met jouw aanbeveling + 1 zin waarom + wat kapotgaat bij het alternatief.
- Pas als Dennis antwoordt (of expliciet "volg je aanbeveling") mag je die
  keuze in code zetten.
- Bij twijfel tussen twee implementaties: STOP, vraag, bouw niet door.
- Geen B-ladder, geen review 1–5, geen agenda-writes, geen week/maand-herbouw
  tenzij Dennis dat apart goedkeurt.

## Output-contract — twee fases

### FASE 0 (verplicht eerst — GEEN code)
Lever alleen:
1. Antwoorden op de OPEN VRAGEN hieronder (per vraag: aanbeveling JA/NEE/optie +
   waarom + risico van het alternatief). Max 3 zinnen per vraag.
2. Een korte "bouwlijst NA jouw OK" (bullets) die alleen goedgekeurde items bevat.
3. Expliciete STOP-regel: "Wacht op Dennis' antwoorden vóór FASE 1."

### FASE 1 (pas ná Dennis' antwoorden)
Implementeer uitsluitend wat hij heeft goedgekeurd. Alles wat hij open laat
of afwijst → parklijst, niet sneaky meebouwen.

## Context (lees, verzin geen schermstaat)
- docs/design/beweging-keuze-consumentenbond-prebuild-v3-2026-08.html #s-e
- docs/cursors/claude-opus-beweging-mijn-dag-verdict-2026-08.md (KILL 2,6,7,8)
- docs/design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md
- Live:
  - MovementTodayHero.tsx (zonder keuze = 3-tier lijst; mét = Gedaan/korte)
  - resolveRecommendedTodayChoiceKind in movement-today-choices.ts
  - Dashboard.tsx desiredRailMode: tab !== "vandaag" → "profile"
    (agenda toont dus linker rail "Wie ben ik" via CockpitContextRail)
  - CockpitContextRail.tsx mode "profile" ≈ Wie ben ik + vandaag-status
  - CockpitHeader / CockpitProfileMenu = naam/account al in de header
  - AgendaScreen + AgendaContextSidebar = week/maand context rechts/midden

## Harde out-of-scope (tenzij Dennis ze EXPLICIET opent)
- B keuzeladder / Favorieten-opties / postcode / oordeel
- C premium "Sterk na 40"
- Review 1–5 + nieuwe opslag + verwerkingsregister
- Auto agenda_blocks / scheduled_time buiten Verplaats
- Week/maand layout-herbouw
- F1b nudge / push / coach / import

────────────────────────────────────────────────────────
OPEN VRAGEN — beantwoord in FASE 0; bouw niet vóór antwoord
────────────────────────────────────────────────────────

### Q1 · First viewport op Beweging
Prebuild E: één stap in beeld (Gedaan + korte), tiers achter "Wijzig keuze".
Live nu: eerst 3-tier keuze.

Aanbeveling (mag jij doen, Dennis beslist): voorselectie van de aanbevolen tier.
Vraag aan Dennis:
- (a) Voorselectie aan — first viewport = één stap?
- (b) Tier-lijst houden als first viewport (alleen klaar-staat wijzigen)?
- (c) Iets anders (beschrijf)?

### Q2 · Als resolveRecommendedTodayChoiceKind null is
Opties: default "matig" · default "herstel" · dan wél de 3-lijst tonen · iets anders.
Vraag: welke fallback?

### Q3 · Wanneer persisteert de dagkeuze + accepted_default?
Audit zei: alleen bekijken = geen event; Gedaan/korte op voorstel =
accepted_default true; expliciete tier = false.
Vraag: akkoord, of wil je persist al bij tonen van het voorstel / bij eerste
interactie anders?

### Q4 · Klaar-staat copy
Nu: "Morgen kies je opnieuw wat past."
Prebuild-richting: afsluitregel zonder streak/schuld.
Vraag: welke zin wil je (of: "stel 2 opties voor, ik kies")?
Geen streak, geen dagscore — dat blijft hard.

### Q5 · "Verder vandaag"-strip op Beweging
Read-only andere domeinen onder de hero?
Vraag: (a) ja, max 2 regels · (b) nee, skip in deze slice · (c) later.

### Q6 · Deur naar B in klaar-staat
Prebuild zet quiet deur; audit + BESLUIT §G.1 zeggen: nog geen B.
Vraag: (a) geen deur (aanbevolen tot B bestaat) · (b) stub-link naar Voortgang ·
(c) toch copy-only teaser zonder navigatie.

### Q7 · "Wie ben ik" op Mijn Dag / agenda-tab — RUIMTE
Feit: op tab agenda is desiredRailMode = "profile". Linker kolom = volledige
"Wie ben ik" (naam, anker, vandaag-status, check-in). Naam zit al in de header
(CockpitProfileMenu). Agenda wil midden + rechter context/balk (week-sidebar,
inspector) maximaliseren.

Vraag aan Dennis (dit is GEEN onderdeel van E tenzij jij het zo koppelt):
- (a) Op agenda: "Wie ben ik"-blok WEG of inklappen — linker rail leeg/minimal
      of andere nuttige agenda-context; meer ruimte voor agenda + contextbalk?
- (b) Op agenda: alleen de "Vandaag gedaan?"-status houden, naam/avatar weg
      (die zit in de header)?
- (c) "Wie ben ik" laten staan op agenda (geen layout-wijziging nu)?
- (d) Apart onderzoeken (eigen mini-prompt), niet in dezelfde PR als E?

Aanbeveling om te geven in FASE 0 (Dennis beslist):
→ (a) of (b) op agenda-tab, en (d) liever als kleine aparte PR naast of ná E
  zodat E meetbaar blijft. Motief: op een doe-agenda is profiel-identiteit
  header-werk; de linker kolom concurreert met tray/raster zonder extra antwoord
  te geven dat Mijn Dag zelf niet al geeft. Risico van (a) in dezelfde PR als E:
  twee UI-effecten, attributie vertroebeld.

### Q8 · Tray done-readout (AgendaPlanStepStrip)
Microfix-observatie: tray toont geen gedaan-staat. E's klaar-staat maakt dat
schever zichtbaar.
Vraag: (a) park tot F1a · (b) minimale done-readout op de strip in deze slice ·
(c) alleen als Q1=(a) landt.

────────────────────────────────────────────────────────
Als Dennis "volg aanbevelingen" zegt — voorgesteld pakket
(alleen ter referentie; niet uitvoeren zonder dat signaal)
────────────────────────────────────────────────────────
- Q1(a) voorselectie · Q2 default matig · Q3 audit-regels + accepted_default
- Q4 2 copy-opties voorleggen, één zin kiezen · Q5(b) of (a) licht
- Q6(a) geen B-deur · Q7(d) of (b) aparte kleine PR · Q8(a) park F1a

## FASE 1 constraints (na OK)
- Imports `@/`; NL UI; geen console.log; geen commit
- Niet aanraken: intake/, affiliate-links.ts, scoring.ts, globals.css, deploy.sh, .env.local
- Geen nieuwe art.9-stroom zonder register
- Meetpunt alleen voor goedgekeurde CTA's; server-event payload uitbreiden alleen
  als Q3 dat vraagt (accepted_default)
- Klaar-check: tsc + relevante vitest; grep console.log

## Acceptatie FASE 0
- [ ] Alle Q1–Q8 beantwoord met aanbeveling + waarom + alternatief-risico
- [ ] STOP zichtbaar: wacht op Dennis
- [ ] Geen diffs in FASE 0

## Acceptatie FASE 1 (ná antwoorden)
- [ ] Alleen goedgekeurde items gebouwd
- [ ] Afgewezen/open items expliciet in parklijst in het eindbericht
- [ ] tsc groen; geen nieuwe console.log
```

---

## Mijn korte mening (niet in de agent-prompt als bevel)

**Wie ben ik op Mijn Dag weg?** Ja, dat is slim — op z’n minst naam/avatar (zit al in de header), liefst het hele profielblok op de agenda-tab. Dan krijgen agenda + context/balk de linker kolom terug of die kolom verdwijnt op smalle layouts ten gunste van het midden.

**Koppel het niet blind aan E:** aparte mini-PR (of Q7 = “apart”), anders meet je voorselectie en layout in één hap.