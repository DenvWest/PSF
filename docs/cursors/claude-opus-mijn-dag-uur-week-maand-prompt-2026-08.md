# Prompt — Mijn Dag v2 HTML-prebuild (uur + week/maand, dark full-bleed)

> **STATUS 2 aug 2026 — ACHTERHAALD voor uur/week/maand.**  
> Live Mijn Dag (`/dashboard?tab=agenda`) heeft die planner-laag al in React  
> (`AgendaViewSwitcher`, halfuur-timeline, week/maand, tap-create, dark shell).  
> **Voer deze prompt niet uit** als je die features wilt — dat is dubbel werk.  
> Zinvolle prebuild = alleen product-UX die live nog mist (vrij / hulp / basis-aanvulling).  
> Zie plan/advies in het gesprek van 2 aug.

> **Gebruik (historisch):** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus.  
> **Output (historisch):** self-contained HTML. **Geen React.**  
> **Basis:** `[docs/design/mijn-dag-fullbleed-prebuild-2026-08.html](../design/mijn-dag-fullbleed-prebuild-2026-08.html)`  
> **Doelbestand (niet meer aanbevolen als volle planner-v2):** `docs/design/mijn-dag-fullbleed-prebuild-v2-2026-08.html`

## Plaats in de reeks


| Doc                                                       | Relatie                                                                                                                                   |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `mijn-dag-fullbleed-prebuild-2026-08.html`                | **v1** — dark full-bleed, ladder, vrij, verplaatsen/planner                                                                               |
| Dit document                                              | **v2-prompt** — voegt toe wat v1 mist t.o.v. een echte dagplanner: Dag/Week/Maand + uurraster met halfuurlijnen + zelf momenten inplannen |
| `beweging-keuze-consumentenbond-prebuild-v2-2026-08.html` | Token/craft-lat dark wereld (zelfde familie)                                                                                              |
| Live `/dashboard?tab=agenda`                              | Alleen als **gap-referentie** (wat gebruikers missen); NIET als build-target                                                              |


## Wat v1 al bewijst (behouden)

Dark full-bleed · Beweging-v2 tokens · weekstrip · cross-domein dag · basis vs aanvulling · “Vandaag nog vrij” · Verplaatsen/Kies een moment-planner · één completie-waarheid · container queries.

## Wat v2 moet toevoegen (de missende punten)


| Gap                                | v2-eis                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| Alleen ladder, geen klok-raster    | **Dag-view** met uurraster 07–22 + **halfuurlijnen**                                 |
| Geen Week/Maand-overzicht          | Switcher **Dag | Week | Maand** (mobile-first)                                       |
| Geen maandkiezer                   | Maandgrid (sheet of view) om elke dag te kiezen                                      |
| Momenten beperkt tot planner-chips | Zelf **leefstijlmoment** toevoegen (titel + tijd + duur) via tap op uur / “+ Moment” |
| —                                  | Alles blijft **mock/local state** in één HTML — geen API                             |


## Gebruiksinstructie

1. Open Claude Opus (of Cursor met expliciet: “alleen HTML, geen React”).
2. Kopieer het blok onder **Prompt (copy-paste)**.
3. Optioneel: open v1-fullbleed in de browser als “dit is de basis — breid uit, sleutel niet terug naar cream”.
4. Review op **375px** eerst, daarna desktop.
5. Sla op als `docs/design/mijn-dag-fullbleed-prebuild-v2-2026-08.html`.

---

## Prompt (copy-paste)

```text
## Rol
Je bent Senior product designer + UX-architect + front-end craft lead voor
PerfectSupplement (perfectsupplement.nl) — Consumentenbond van leefstijldomeinen
voor mannen 40+.

Je levert GEEN analyse-essay, GEEN React, GEEN Next.js, GEEN localhost:3000,
GEEN bestanden onder src/. Je levert ÉÉN self-contained HTML-prebuild (Artifact
of downloadbaar .html).

## Context — basis die je UITBREIDT (niet vervangt)

Lees/ken de v1-prebuild die al bestaat:
  docs/design/mijn-dag-fullbleed-prebuild-2026-08.html

Die bewijst al:
1. Eigen dag-surface (week + dag + vrij), geen tabje in Beweging
2. Cream inset WEG — full-bleed dark, tokens = Beweging-v2
3. Cross-domein chronologische ladder
4. Basis vs aanvulling (kleur + chip)
5. Klaar-semantiek: Gedaan ≠ Afspraak gehad ≠ Ingenomen
6. “Meer hulp hierbij” als tekstlink → gefilterde sheet
7. “Vandaag nog vrij” — zonder moment verdwijnt een blok niet
8. Verplaatsen / Kies een moment — planner (dag-chips + tijd + optioneel duur)
9. Completie los van tijdstip
10. Container queries op de dag-kolom

Token-lat (exact hergebruiken, geen paars/cream light-theme):
  --bg:#1a2e1a; --bg-hi:#21381f; --sage:#5A8F6A; --sage-lt:#9CC5A9;
  --terra:#C8956C; --move:#C26E4B; --ink:#F1EFE8; --soft:#CDD7D0; --mut:#9FB0A6;
  --panel / --line zoals in v1; fonts DM Serif Display + DM Sans (mag embedded
  zoals v1, of system fallback als embedding te zwaar is — maar look moet dark
  forest blijven).

Craft-referentie naast v1: docs/design/beweging-keuze-consumentenbond-prebuild-v2-2026-08.html

Live app http://localhost:3000/dashboard?tab=agenda is ALLEEN gap-inspiratie
(uurgrid, zelf momenten plannen). Kopieer NIET de cream UI van die live tab.
Bouw NIETS tegen die server.

## Product — wat v2 IS (gelockt)

Mijn Dag v2 = dezelfde dark full-bleed dag-surface als v1, plus een echte
mobile dagplanner-laag:

- View-switcher: Dag | Week | Maand
- Dag: uurraster met halfuurlijnen + bestaande ladder/tray-logica geïntegreerd
- Week: compact overzicht (chips), geen 7 parallelle uurgrids
- Maand: maandgrid met density-dots + navigatie
- Zelf een moment inplannen (tap op uur of “+ Moment”)
- Bestaande “Vandaag nog vrij” + Verplaatsen-planner blijven werken

Dit is een leefstijlplanner-prebuild, GEEN HCI One / praktijksoftware-kloon:
geen vaste rechterbalk, geen declaratiestatus-legenda, geen multi-column
werkweek-grid zoals desktop-EPD.

## Taak
Bouw één self-contained HTML-bestand:
  “Mijn Dag — full-bleed agenda prebuild v2 (augustus 2026)”

Bestandsnaam bij opslaan: mijn-dag-fullbleed-prebuild-v2-2026-08.html

Mobile-first 375px (primair), ook bruikbaar ≥820px / desktop. Viewport-switcher
in prototype-chrome mag (zoals v1: m/t/d), maar product-UI moet zonder chrome
kloppen.

### A) Chrome (prototype-only, niet product)
- Label: “Mijn Dag · prebuild v2”
- Switches: viewport m/t/d (optioneel)
- View-state tabs of note: wat v2 bewijst (korte lijst)
- GEEN React-dev tools, GEEN “open localhost”

### B) Product-shell — full-bleed dark (MUST)
- Geen cream/white page-kaart
- Sticky daybar + weekstrip (uit v1) behouden/verfijnen
- Segmented control **Dag | Week | Maand** (touch ≥44px, NL)
- Default view = Dag

### C) View DAG
Combineer v1-inhoud met een klok-raster:

1. Bovenaan: dagkop (bijv. “Woensdag 29 juli”) + control “Maand ›”
   die de maand-picker opent (sheet op mobiel).
2. Weekstrip: 7 dagen; selectie wisselt de dag (mock data per dag).
3. Plan / basis-blokken:
   - Zonder gekozen moment → zichtbaar in tray / “Vandaag nog vrij” of
     “nog geen moment” + knop “Kies een moment” (bestaande planner uit v1).
   - Mét moment → verschijnen OP het juiste uur in het raster (niet doubleren
     als vage suggestie én als afspraak). Completie-vink blijft los van tijd.
4. Uurraster 07:00–22:00:
   - Volle uren: solid lijn + label HH:00
   - Halfuren (:30): lichtere dashed lijn, geen label
   - Tap leeg slot → sheet/inline “Nieuw leefstijlmoment”
     (titel, optionele categorie-chip, starttijd vooringevuld, duur 15/30/45/60
     of eindtijd). Moment landt als blok op de tijdlijn.
   - Bestaande verplaats-planner blijft beschikbaar op blokken.
5. “Vandaag nog vrij” sectie uit v1 blijft onderaan of als tray — blokken zonder
   tijd verdwijnen niet.
6. Now-line optioneel als “vandaag” geselecteerd is.

### D) View WEEK
- Calendar-week van de geselecteerde dag (ma–zo).
- 7 compacte kolommen OF gestapelde dagrijen met chips (tijd + korte titel).
- GEEN zeven volle uurgrids naast elkaar.
- Tap op een dag → spring naar view Dag voor die datum.
- Toon density / “geen momenten” lege staat.

### E) View MAAND
- Maandgrid van de maand van de geselecteerde dag; prev/next.
- Density-dot op dagen met ≥1 moment (mock).
- Vandaag + selectie duidelijk.
- Tap dag → view Dag.
- Zelfde grid hergebruiken in de “Maand ›”-sheet vanaf Dag.

### F) Mock-data & state
- Alles in-page JS (geen network).
- Minimaal 2–3 dagen met gemengde blokken (beweging/voeding/slaap + custom moment).
- Minimaal één blok in “nog vrij” / zonder tijd.
- Verplaatsen, toevoegen, overslaan/terugzetten voelbaar (zoals v1, plus nieuwe
  uur-tap create).
- Geen backend, geen localStorage-plicht (session memory in JS mag).

### G) Mobile proof (acceptatie)
- 375px: geen horizontale page-scroll; switcher bruikbaar; raster verticaal
  scrollbaar; sheets max ~85vh met grip.
- Touch targets ≥44px.
- Week-view op 375px: liever gestapelde dagen of horizontale scroll BINNEN de
  week-sectie dan geplette 7 uurkolommen.

### H) Wat je NIET doet
- Geen React/Vue/Svelte, geen JSX, geen src/-patches
- Geen aansluiting op localhost:3000 of Supabase
- Geen cream/light restyle
- Geen HCI One rechterbalk / statuslegenda facturatie
- Geen Google-calendar sync UI als echte integratie (mock “binnenkort” mag niet
  de hoofdactie zijn)
- Geen medische claims / diagnose-taal

## Acceptatiecriterium
- [ ] Één self-contained .html, opent via file:// of Artifact
- [ ] Dark full-bleed, herkenbaar als vervolg op v1 (niet cream live-agenda)
- [ ] Switcher Dag / Week / Maand werkt
- [ ] Dag: halfuurlijnen + tap-to-create moment + v1 planner/vrij blijven
- [ ] Week: compact overzicht, tap → Dag
- [ ] Maand: grid + dots, tap → Dag; ook via “Maand ›” sheet
- [ ] Voelt goed op 375px
- [ ] Geen React, geen localhost-afhankelijkheid

## Verificatie (voor jou als maker)
1. Open op 375px breedte — switch alle views.
2. Tik een leeg halfuur → moment verschijnt op de tijdlijn.
3. Zet een “vrij”-blok via planner op een tijd → verdwijnt uit vrij, staat in raster.
4. Maand → andere dag → terug Dag met die datum.
5. Side-by-side met v1-fullbleed: zelfde wereld, v2 = meer planner-macht.

Lever eerst de werkende HTML. Geen lange toelichting ervoor.
```

## Na review

Sla het Artifact op als:

`docs/design/mijn-dag-fullbleed-prebuild-v2-2026-08.html`

React/`localhost:3000` komt **pas later** — aparte Cursor-prompt ná akkoord op deze v2-prebuild.