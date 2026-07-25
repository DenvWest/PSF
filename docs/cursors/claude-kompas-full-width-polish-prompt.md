# Prompt — Kompas Home maximaal breed + cockpit-polish (referentie: Beweging Vandaag)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus in een **nieuw gesprek**.
> Voeg screenshots toe: huidige Kompas Home vs Beweging Vandaag (desktop 1440px + mobiel 375px).
>
> **Waarom Claude, niet Cursor:** Beweging Vandaag (`MovementCockpit`) is eerder door Claude op hetzelfde niveau gebracht — volle main-breedte, strakke grid, premium density. Cursor's iteratie-2 grid staat technisch, maar Kompas blijft visueel smal en los.

---

## Bekende root cause (startpunt voor F1, geen eindoplossing)

In `[Dashboard.tsx](../src/components/dashboard/Dashboard.tsx)` (~3974) klemt een wrapper Kompas home op `max-w-[720px]`, terwijl open Beweging `min-w-0` krijgt. Mijn Dag zit op `max-w-[760px]`. **Dat is symptoom, geen complete diagnose** — trace de hele breedte-keten (wrapper → sectionsNode → CockpitShell → grid → tiles) en elimineer elke kunstmatige klem op Kompas home.

Beweging-referentie: `[MovementCockpit.tsx](../src/components/dashboard/beweging/MovementCockpit.tsx)` — `min-w-0`, `lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]`, full-width `lg:col-span-2` rijen, compacte ring+glow.

---

## Prompt (copy-paste)

```text
ROL
Je bent Senior UX-architect + Next.js/TypeScript developer voor PerfectSupplement
(perfectsupplement.nl).

Jij hebt eerder Beweging Vandaag (MovementCockpit) goed gekregen: volle cockpit-breedte,
strak grid, premium dark UI. Cursor's Kompas Home iteratie-2 faalt visueel — smal,
losse kaarten, niet hetzelfde niveau.

JOUW #1 PRIORITEIT: Kompas Home (tab "Kompas"/vandaag, géén open domein) moet
MAXIMAAL BREED worden — 100% van de beschikbare main-kolom in CockpitFrame
(tussen context-rail links en inspector rechts). Geen max-w-[720px], geen max-w-[760px],
geen impliciete content-klem die Beweging wél ontloopt. Jij bedenkt de layout —
niet ik. Kopieer het Beweging-patroon waar het past; verbeter waar Kompas anders is.

Lees vóór je begint:
- CLAUDE.md
- docs/core/WRITING_VOICE.md
- src/components/dashboard/beweging/MovementCockpit.tsx (GOLD STANDARD)
- docs/cursors/fable-kompas-converterende-first-screen-2026-07.md

WERKWIJZE (verplicht, in volgorde — kort opschrijven vóór code)
F0  North star — 1 zin
F1  Verificatie — open bestanden; trace VOLLEDIGE breedte-keten
F2  Diagnose — gap t.o.v. MovementCockpit (desktop + mobiel)
F3  IA-audit — Kompas ↔ Mijn Dag ↔ Hermeting
F4  Ontwerp — jij tekent desktop + mobiel (ASCII wireframes); géén vaste px-breedtes van mij
F5  Implementatie
F6  Verificatie + meetpunt

═══════════════════════════════════════════════════════════════════════════════
F0 — NORTH STAR (hard)
═══════════════════════════════════════════════════════════════════════════════

Op desktop (contextpaneel open, rail zichtbaar): Kompas Home vult visueel dezelfde
horizontale ruimte als MovementCockpit — de gebruiker merkt geen "smalle kolom in
het midden". Op mobiel: scanbare first screen, geen eindeloze scroll vóór actie.

═══════════════════════════════════════════════════════════════════════════════
F1 — VERIFICATIE + BREEDTE-KETEN (verplicht)
═══════════════════════════════════════════════════════════════════════════════

Open en documenteer ELKE laag die breedte kan beperken:

| Laag | Bestand | Wat zoeken |
|---|---|---|
| Frame | src/components/dashboard/cockpit/CockpitFrame.tsx | main min-w-0, max-w op outer shell |
| Dashboard wrapper | src/components/dashboard/Dashboard.tsx ~3974 | max-w-[720px] / max-w-[760px] / min-w-0 per tab+domein |
| sectionsNode | Dashboard.tsx ~3819 | inline gap/style op vandaag-tab |
| KompasHome | Dashboard.tsx ~3357 | grid cols, gap, nested wrappers |
| CockpitShell | embedded prop op Kompas home |
| Componenten | KompasStatusCard, KompasVoortgangCard, LeefstijlKompas | interne max-w, padding die kolom smaller maakt |

Referentie: hoe Beweging dezelfde keten doorloopt (viewedDomain === "beweging" → min-w-0).

Lever een tabel: laag | huidige constraint | Beweging | jouw fix voor Kompas.

═══════════════════════════════════════════════════════════════════════════════
F2 — DIAGNOSE (verplicht)
═══════════════════════════════════════════════════════════════════════════════

1. Waarom voelt Kompas smal terwijl het grid "2 kolommen" heet?
2. Minimaal 5 density/visuele verschillen vs MovementCockpit (gap, padding, ring,
   typografie, full-width rijen).
3. Kolombalans: Status+Voortgang links vs Overzicht rechts — past het op 1280px
   en 1440px zónder lege ruimte rechts?
4. AgendaTodayHero is van Kompas home af; FocusStrip is navigatie-only. UX-gat?

═══════════════════════════════════════════════════════════════════════════════
F3 — IA-AUDIT Kompas · Mijn Dag · Hermeting
═══════════════════════════════════════════════════════════════════════════════

Per tab: primaire job, check-off ja/nee, hermeting ja/nee.

Controleer:
- buildInspectorCards activeHabit op Kompas home zonder hero
- Hermeting op inspector + VoortgangCard + tab Hermeting — redundantie
- FocusStrip vs Mijn Dag — vindbare dagactie?
- CockpitContextRail onCheckin → selectTab("vandaag") — nog logisch?

Lever AANBEVELING per gap (fix / accepteer / verplaats) met voorkeur.

═══════════════════════════════════════════════════════════════════════════════
F4 — ONTWERP (jij bedenkt — géén px-voorschriften van Dennis)
═══════════════════════════════════════════════════════════════════════════════

Ontwerp zelf de optimale layout voor:

DESKTOP: maximaal gebruik van main-kolom; 2-koloms of hybrid grid zoals jij
MovementCockpit zou doen voor een home-overzicht (status links, ring+scan rechts,
evt. full-width rijen waar dat de breedte benut).

MOBIEL 375px: DOM-volgorde, compacte ring/scan, focus zichtbaar, ~1,5 schermhoogte
voor de kern. Geen AgendaTodayHero terug als brede kaart tenzij je het onderbouwt.

Lever ASCII wireframes desktop + mobiel met kolom-spans.

═══════════════════════════════════════════════════════════════════════════════
F5 — IMPLEMENTATIE
═══════════════════════════════════════════════════════════════════════════════

Implementeer jouw F4-ontwerp. Harde regels:

BREEDTE (niet onderhandelbaar):
- Kompas home: elimineer alle max-width klemmen in de keten; eindresultaat =
  min-w-0 + w-full over de main-kolom, identiek aan Beweging-principe.
- Als je max-w op andere tabs aanpast: onderbouw in besluitlog (Mijn Dag mag
  smal blijven als leesbaarheid — Kompas mag dat NOOIT).

POLISH: align visuele taal op MovementCockpit (density, gaps, ring-glow, tiles).

COMPONENTEN (huidige staat — pas aan naar jouw ontwerp):
- src/components/dashboard/Dashboard.tsx — wrapper + KompasHome
- src/components/dashboard/kompas/KompasStatusCard.tsx
- src/components/dashboard/kompas/KompasVoortgangCard.tsx
- src/components/dashboard/kompas/LeefstijlKompas.tsx

Copy: feit-eerst (explainer[1], geen nextBestHabit op home). Geen coach-cliché
in heading tenzij onderbouwd.

IA-fixes alleen als F3 bevestigt — klein houden.

MEETING (reuse-first):
- dashboard_kompas_domain_open, dashboard_beweging_plan_click (surface: kompas_home),
  dashboard_kompas_voortgang_link_click, Clarity dashboard_kompas_home/*

═══════════════════════════════════════════════════════════════════════════════
CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- @/ imports; Tailwind in JSX; day-model.ts = enige vandaag-bron
- Geen medische claims; geen streak-gamification
- Niet aanraken: src/app/intake/, src/lib/scoring.ts, globals.css, deploy.sh,
  .env.local, affiliate-links
- Dashboard.tsx geen big-bang — alleen Kompas-home-gerelateerd
- Geen git commit

═══════════════════════════════════════════════════════════════════════════════
ACCEPTATIECRITERIA
═══════════════════════════════════════════════════════════════════════════════

BREEDTE (hard — visueel testen op 1440px met inspector open):
- [ ] Geen zichtbare "smalle middenkolom"; content strekt rail → inspector
- [ ] Naast Beweging Vandaag screenshot: vergelijkbare horizontale benutting
- [ ] Geen max-w-[720px] of vergelijkbare klem actief op Kompas home

DESKTOP: grid/polish op MovementCockpit-niveau; kolommen evenwichtig in hoogte.

MOBIEL: focus + score + scan binnen ~1,5 scherm; pad naar dagactie duidelijk.

LOGICA: besluitlog Kompas/Mijn Dag/Hermeting zonder tegenstrijdige CTA's.

TECHNISCH: console.log grep leeg · tsc · vitest indien lib geraakt · eslint --max-warnings 0

OUTPUT
1. Besluitlog F0–F4 (incl. breedte-keten tabel)
2. Code
3. Meetpunt-regel
4. Voorgestelde commit (niet uitvoeren):
   feat(kompas): max-width home — full cockpit main column

BEGIN met F1 — open de bestanden, trace de breedte-keten, gok niet.
```

---

## Gebruik

1. Commit huidige iteratie-2 wijzigingen (indien nog open).
2. Nieuw Claude Opus-gesprek → plak prompt → voeg 2 screenshots.
3. Review **F1 breedte-keten tabel** en **F4 wireframes** vóór je F5 accepteert.

