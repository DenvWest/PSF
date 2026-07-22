# Slice 1 — Cockpit-shell (domein-agnostisch, achter flag) — implementatieplan

> **Status (22 jul 2026): implementatieplan. Nog geen code.** Eerste bouw-slice van de cockpit-herontwerp uit [`ONTWERP_BEWEEGCOCKPIT_COMMANDOCENTRUM.md`](ONTWERP_BEWEEGCOCKPIT_COMMANDOCENTRUM.md), meteen domein-agnostisch opgezet zodat slaap/stress/voeding de shell later gratis erven (zie [`BLAUWDRUK_DOMEIN_STAPPENPLANNEN.md`](BLAUWDRUK_DOMEIN_STAPPENPLANNEN.md)).
> **Achter een feature-flag, default UIT.** Live gedrag verandert niet tot de flag aangaat. Geen commit zonder expliciet "GA DOOR".

## 0. De drie gelockte besluiten (akkoord Dennis)

1. **Kompas = één rol** (richting + domeinkeuze). De reis-waypoints zijn géén header-nav maar "Jouw route" binnen een domein (latere slice). Header-rij 1 = de echte tabs; rij 2 = Kompas-domeinkeuze.
2. **Container-uitzondering**: de cockpit-shell mag breder dan `max-w-7xl` (app-surface). Voorstel: `max-w-[1600px]` met een max-leesbreedte op de midden-kolom.
3. **Freeze-scope**: de shell mag nú, mits **achter een flag** en **zonder de bestaande cockpit te herschikken**. Slice 1 voegt alleen *chrome* toe rond wat er al staat.

## 1. Wat slice 1 wél en niet doet

**Wel (scope):**
- Een nieuwe **flag** `isCockpitShellEnabled()` (default off).
- Een **`CockpitHeader`** (twee rijen): rij 1 = hoofdnav `Kompas · Mijn Dag · Voortgang · Hermeting` (mapt op bestaande `DASHBOARD_TABS`); rij 2 = domeinkeuze (herkadert `DomainTopNav`).
- Een **`CockpitShellLayout`** dat, mét flag aan, de bestaande domein-screen (`BewegingScreen`, `SleepScreen`, …) **ongewijzigd** in de midden-zone rendert, met een dunne **`ProfileRail`** (links) en een **`ContextInspector`-placeholder** (rechts) eromheen + de responsive drawer.
- **Domein-agnostische naad**: alles geparametriseerd op `domain: PillarId`, leunend op de bestaande `domain-role.ts` en `getPlanTemplate`.
- **Meetpunten** voor tab- en domein-wissel (meet-standaard).

**Niet (latere slices):**
- ContextInspector-intelligentie (prioriteitsregels, coach-tips) → slice 2.
- "Jouw route" waypoint-component → slice 3.
- betekenis-motor + "laatst gemeten"-label → slice 4.
- Tegels van `MovementCockpit` herverdelen over de zones → **niet** in slice 1 (dat is de herschik-stap; nu blijft de center intact).
- Plan-reader-harmonisatie (F1) → slice 5.

## 2. De feature-flag

`src/lib/feature-flags.ts` (bestaande conventie: `NEXT_PUBLIC_*` + helper, default off):

```ts
export function isCockpitShellEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COCKPIT_SHELL_ENABLED === "true";
}
```

- Env-actie voor Dennis: `NEXT_PUBLIC_COCKPIT_SHELL_ENABLED=true` in `.env.local` (dev) om te previewen; server pas na akkoord.
- Flag OFF ⇒ `Dashboard.tsx` rendert exact de huidige `DashHeader` + scroll-layout. Flag ON ⇒ `CockpitShellLayout`.

## 3. Domein-agnostische naad (het hart van deze slice)

Alles wat we bouwen leest `domain: PillarId` en de bestaande helpers — niets hardcoded op beweging:

| Concern | Bron (bestaat) | Domein-agnostisch gebruik |
|---|---|---|
| Rol interventie/readout | `domain-role.ts` `isInterventionDomain` / `isReadoutDomain` | ContextInspector + doorway alleen bij interventiedomeinen; readouts (energie/herstel) krijgen een andere center |
| Heeft een stappenplan? | `getPlanTemplate(domain)` (movement/sleep/stress/nutrition) | Doorway "Open je stappenplan" alleen als template bestaat (verbinding heeft er geen) |
| Deep-view (stappenplan) | `supportsKompasDeepView` (nú beweging-only) | **Generaliseren** naar alle plan-domeinen — óf in slice 5 bij de plan-reader; slice 1 laat 'm zoals-is |
| Domein-meta (kleur/label/icoon) | `PILLAR[domain]` | Accent + labels in header/rails |
| Readout-drivers | `READOUT_DRIVERS` | Voor energie/herstel-center: "aangedreven door [drivers]" |

> **Regel:** geen `if (domain === "beweging")` in de shell. Waar beweging-specifiek gedrag nodig is, gaat dat via de bestaande domein-screens (`BewegingScreen` etc.), niet via de shell.

## 4. Nieuwe bestanden (geïsoleerd — niet in de 4093-regel `Dashboard.tsx`)

```
src/lib/feature-flags.ts                          (+ isCockpitShellEnabled)
src/components/dashboard/cockpit/
  ├── CockpitHeader.tsx        [n] rij 1 tabs + rij 2 domeinkeuze + breadcrumb + rechter cluster
  ├── CockpitDomainNav.tsx     [n] Kompas-domeinkeuze (of DomainTopNav uitbreiden → hergebruik)
  ├── CockpitShellLayout.tsx   [n] drie-zone grid + responsive drawer; center = children (domein-screen)
  ├── CockpitProfileRail.tsx   [n] links: profiel-mini + vandaag-status (leest model)
  └── CockpitInspector.tsx     [n] rechts: placeholder-kaart (default "Waarom deze stap"), drawer <1200
```

`Dashboard.tsx` krijgt **één** vertakking: bij `isCockpitShellEnabled()` wordt de bestaande tab/kompas-render omhuld door `CockpitShellLayout` i.p.v. de losse `DashHeader`. Alle bestaande props/handlers blijven; de screens veranderen niet.

## 5. Layout & responsive (uit §5/§10 van het ontwerpdoc)

- Grid `minmax(230px,250px) minmax(0,1fr) minmax(300px,330px)`; `container-type: inline-size` op de shell.
- `@container (max-width:1199px)` → rechter zone wordt een **drawer** (knop "Context" in de header), grid → `240px 1fr`.
- `@container (max-width:820px)` → één kolom, linkerrail stapelt.
- **Geen interne verticale scrollbar** op de midden-zone; de pagina scrolt.
- Cockpit blijft **donker** (bestaande tokens: sage `#5A8F6A`, `bg-black/20`, `white/10`, DM Serif). Tailwind in JSX (projectconventie), geen aparte CSS.

## 6. Meetpunten (meet-standaard — in dezelfde wijziging)

- Hergebruik `trackDashboardTabSelected` (bestaat) voor rij-1 tabs.
- Domein-wissel: hergebruik het bestaande domein-switch-event van `DomainTopNav` (checken in `Dashboard.tsx`); alleen een nieuw event verzinnen als er geen is.
- Als nieuw event nodig (bv. `dashboard_cockpit_shell_shown`): registreren op **drie plekken** — `src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`. Geen PII in GA4/Clarity.
- **Meld bij afronding:** "Meetpunt: `<event(s)>` — hier lees je af of de shell wordt gebruikt."

## 7. Verificatie & guardrails

- `npx tsc --noEmit` + `vitest` + `eslint --max-warnings 0` (pre-push draait tsc+vitest).
- `grep -rn "console.log" src/` schoon.
- **Flag OFF = live byte-identiek** — expliciet testen (visuele diff nul met flag uit).
- Geen `next build`/`rm -rf .next` terwijl `next dev` draait.
- **Niet zelf committen.** Na de slice: staat tonen, jij reviewt, dan pas "GA DOOR".

## 8. Verwachte diff-omvang

Klein en contained: ~5 nieuwe bestanden (samen indicatief 400–600 regels JSX/Tailwind), +1 flag-helper, +1 vertakking in `Dashboard.tsx`. Nul wijziging aan `MovementCockpit`, `day-model`, `daily_action_log`, de plan-templates of de scoring-engine. Volledig terugdraaibaar door de flag uit te zetten.

## 9. Volgorde na slice 1

Slice 2 (inspector-intelligentie) → 3 ("Jouw route") → 4 (betekenis-motor + "laatst gemeten") → 5 (plan-reader/F1 + `supportsKompasDeepView` generaliseren) → daarna **content-slices per domein** (anker-set, Future-You-copy, route-labels) volgens de domein-blauwdruk. Elk apart, geverifieerd, gereviewd.
