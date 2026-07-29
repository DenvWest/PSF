> # ⛔ VERVALLEN (29 juli 2026)
>
> Dit document is vervangen door [`../plan/PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md`](../plan/PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md).
> De segmented band bar had verkeerde segmentbreedtes en een fout over `VoortgangHub` (regel 75).
> **Niet gebruiken als implementatieprompt.**
>
> Wat er wél uit overleeft: de CTA-herroutering naar Statistieken — die is verplaatst naar
> K8 in [`premium-axis-wederprompt-productas-2026-07.md`](./premium-axis-wederprompt-productas-2026-07.md) §6.1.

---

# Cursor-prompt: VoortgangRichtingBeat redesign — professionele doelbalk + CTA naar Statistieken

## Rol

Je bent een Next.js/TypeScript/Tailwind developer voor PerfectSupplement (perfectsupplement.nl).

## Context

Lees voor je begint:

- `src/components/dashboard/voortgang/VoortgangRichtingBeat.tsx` — het huidige component (volledig vervangen)
- `src/lib/vitality-gauge.ts` — `VITALITY_BANDS`, `getVitalityBand`, `getNextVitalityBand` (5 bands: uit_balans/op_gang/goed/sterk/optimaal met `min` en `color`)
- `src/lib/kompas-home.ts` — `buildKompasDomainRows` retourneert rijen met `{ id, label, score, delta, isPriority }`
- `src/components/dashboard/voortgang/VoortgangHubScroll.tsx` — parent, geeft `onOpenInzichten` door
- `src/components/dashboard/VoortgangHub.tsx` — routeert screens; `onOpenInzichten` -> screen `"inzichten"`
- `src/lib/ga4.ts` — `trackEvent(name, params)`
- `src/lib/clarity.ts` — `clarityTag(key, value)`

Bestaande data die beschikbaar is via de `model: DashboardModel` prop:

- `model.priority.id` — de actieve focus-pillar (bijv. `"slaap"`)
- Via `buildKompasDomainRows(model)` → `priorityRow.score` (0-100), `priorityRow.delta` (number | null), `priorityRow.label` (NL)
- `getVitalityBand(score)` → `{ id, label, min, color }`
- `getNextVitalityBand(score)` → volgende band of `null`
- `baseline = score - delta` als delta != null

## Taak

### 1. Redesign de doelbalk-visualisatie

Vervang de huidige dunne lijn + absolute-positioned getallen door een **professionele segmented progress bar** die de 5 vitaliteitsbanden visueel toont:

**Bar-ontwerp:**

- Horizontale balk, **h-3 rounded-full**, opgedeeld in 5 segmenten — elk segment representeert een `VitalityBand`
- Segmenten krijgen de `band.color` als achtergrond, maar met lage opacity (`opacity-20`) als de score die band nog niet bereikt heeft
- Het gevulde gedeelte (van 0 tot `score`) krijgt volle kleur per band
- Tussen segmenten: **1px gap** (via `gap-px` op een flex container, of 1px margin)
- Boven elk segment-begin: de band-naam als label (`text-[9px] uppercase tracking-widest text-[var(--text-subtle)]`)

**Markers op de balk:**

- **Start-marker** (als `hasStart`): verticale lijn (`w-0.5 h-5`) op de baseline-positie, kleur `var(--text-subtle)`, met label "Start" eronder
- **Huidige positie**: een **filled dot** (`w-4 h-4 rounded-full`) met `band.color` als achtergrond + witte border (2px), gepositioneerd op de score. Gebruik `position: absolute` met `left: {percentage}%`
- **Doel-marker** (als `nextBand`): een **ring** (`w-3.5 h-3.5 rounded-full border-2 border-dashed`) op `nextBand.min`

**Onder de balk — drie kolommen (flex, justify-between):**

- Links: "Start · {baseline}" + bandlabel (alleen als `hasStart`)
- Midden: "Nu · **{score}**" + bandlabel, in `font-serif` en groter (`text-lg`)
- Rechts: "Volgend niveau · vanaf {target}" + bandlabel (of "Hoogste niveau" als geen nextBand)

### 2. Verander de copy

**Eyebrow:** `Je focus · {priorityRow.label}` (niet meer "Waar dit heen loopt")

**Titel (h2):**

- Met delta > 0: `"{priorityRow.label} beweegt — van {band(baseline).label} naar {band.label}."`
- Met delta === 0 of null: `"Je {priorityRow.label.toLowerCase()} in beeld — dit is waar je nu staat."`
- Met delta < 0: `"{priorityRow.label} vraagt aandacht — je hermeting laat zien wat je kunt bijsturen."`

**Lede:** Schrap de huidige copy. Eén zin:

- `"Geen doel dat je moet halen. Een schaal om af te lezen waar je staat, en wat het volgende leesniveau is."`

### 3. CTA-button verander

Verander de button:

- Tekst: `"Bekijk je statistieken →"` (niet meer "Je vitaliteit in één beeld")
- De `onClick` stuurt naar Statistieken in plaats van Inzichten. Pas hiervoor aan:
  - In `VoortgangRichtingBeat`: rename prop `onOpenInzichten` → `onOpenStatistieken`
  - In `VoortgangHubScroll.tsx`: geef `onOpenStatistieken` door (die prop bestaat al)
  - In `VoortgangHub.tsx`: de aanroep `onOpenInzichten={() => openHub("inzichten")}` in VoortgangHubScroll wordt `onOpenStatistieken={() => openHub("statistieken")}` — maar BEHOUD ook `onOpenInzichten` want die wordt elders in VoortgangHubScroll nog gebruikt (in VoortgangRouteList)
- Tracking event: `dashboard_voortgang_hub_click` met `{ destination: "statistieken", surface: "richting_beat" }`

### 4. Verwijder het "berichtje van je toekomstige ik" blok

De `<figure>` met de blockquote rechts ("een berichtje van je toekomstige ik") vervalt. De doelbalk wordt full-width binnen de sectie. Het 2-koloms grid (`lg:grid-cols-[...]`) wordt een single-column layout.

### 5. Behoud de disclaimer

De `<p>` onderaan ("Deze niveaus zijn om af te lezen...") blijft staan, ongewijzigd.

## Constraints

- Imports via `@/` (niet relatief)
- Nederlandse UI strings, Engelse variabelen/functies
- `"use client"` bovenaan (component heeft event handlers)
- Tailwind classes in JSX, geen inline styles behalve dynamische `left`/`width` percentages via `style={{ }}`
- De `pct()` helper mag blijven of worden aangepast — zolang de positionering klopt op de 0-100 schaal
- Itereer over `VITALITY_BANDS` voor de segmenten — hardcode geen bandnamen
- Verander NIETS aan: `src/app/intake/`, `src/data/affiliate-links.ts`, `src/lib/scoring.ts`, `globals.css`, `deploy.sh`, `.env.local`
- Geen git commands, geen commit

## Acceptatiecriterium

- De doelbalk toont 5 gekleurde segmenten met bandlabels erboven
- De huidige score is een filled dot op de juiste positie
- Delta-verandering is visueel zichtbaar (start-marker + gevulde lijn)
- De CTA-button leidt naar Statistieken (screen `"statistieken"`)
- Het "toekomstige ik" blockquote-blok is verwijderd
- Copy past bij de drie delta-staten (positief, nul/null, negatief)
- Geen nieuwe `console.log` in src/
- `tsc --noEmit` groen

## Verificatie

Draai voor je stopt:

1. `grep -rn "console.log" src/`
2. `npx tsc --noEmit`

Niet automatisch committen. Stop na de aanpassingen zodat ik kan reviewen.

# Voorgestelde commit: git add -A && git commit -m "feat(voortgang): redesign doelbalk met segmented band bar + CTA naar statistieken"