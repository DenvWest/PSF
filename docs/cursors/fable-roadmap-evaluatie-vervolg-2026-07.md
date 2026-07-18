# Fable-prompt — roadmap-evaluatie + vervolgstrategie (juli 2026)

Eén zelfstandige copy-paste prompt voor Claude Fable. Draai hem als **aparte sessie**;
er is geen voorbereidende sessie nodig.

**Achtergrond.** Er liggen drie documenten die elk een eigen "vervolg" claimen:

1. **90-dagen architectuur** — `docs/cursors/fable-architectuur-synthese-rapport-2026-07.md` (geverifieerd tegen code op 4 jul)
2. **Geïntegreerd 4-weken vervolg** — `docs/cursors/fable-vervolg-geintegreerd-2026-07.md` (geverifieerd 5 jul)
3. **Actuele sprint-waarheid** — `docs/core/CURRENT_SPRINT.md` (16 jul): pre-traffic / meet-lus, *niet bouwen vóór verkeer*

Sinds 4–5 juli is er veel geshipt: de sprint en `docs/cursors/pre-traffic-gates-2026-07.md`
(16 jul) claimen o.a. waitlist-migratie op prod, entitlements-SSOT, account-events,
funnel-events, engine 1.4.0 + item-baseline én Sentry — items die de Fable-docs van
4–5 juli nog als OPEN/ONBEVESTIGD voeren. De prompt dwingt af dat Fable elke claim
tegen de code herbevestigt in plaats van doc-labels over te nemen, en synthetiseert
de drie bronnen tot één roadmap-waarheid + één vervolg-sequentie (30d pre-traffic /
90d ná verkeer).

**Scope-besluit (vastgelegd):** alle drie synthetiseren, niet één silo.
Geen code, geen commits — output is een rapport.

---

## Prompt — roadmap-evaluatie + vervolg

```text
MODEL-CONTEXT: Claude Fable — roadmap-evaluatie + vervolgstrategie, geen code wijzigen.
PROJECT: PerfectSupplement (perfectsupplement.nl) — Next.js 16 App Router, TypeScript strict, Supabase (RLS), systemd-deploy op Hetzner.
TAAL: Nederlands in output; bestandspaden en code in Engels.
CONSTRAINTS: geen code-edits, geen commits, geen migraties, geen `next build`; alleen lezen + rapporteren.

## Waarom deze sessie

Drie documenten claimen elk een eigen "vervolg" en zijn onderling gedrift:

1. 90-dagen architectuur-roadmap: docs/cursors/fable-architectuur-synthese-rapport-2026-07.md (code-verificatie 4 jul)
2. Geïntegreerd 4-weken vervolg: docs/cursors/fable-vervolg-geintegreerd-2026-07.md (code-verificatie 5 jul)
3. Actuele sprint-waarheid: docs/core/CURRENT_SPRINT.md (16 jul) — strategische prioriteit is "pre-traffic / meet-lus": meten vóór schaal, niet bouwen vóór verkeer

Sinds 4–5 juli is veel van wat die docs als OPEN voerden geshipt. Jouw taak: synthetiseer
de drie tot één roadmap-waarheid en één vervolg-sequentie. Herbevestig ELKE status-claim
("OPEN", "LIVE", "ONBEVESTIGD") tegen de code — neem geen enkel label blind over, ook niet
uit CURRENT_SPRINT.md zelf.

## Harde sprint-regel (verankerd — niet heronderhandelen)

Uit CURRENT_SPRINT.md (16 jul): geen S4/S6, geen Stripe, geen drempel-tuning op N<100
— vóór de week-0 aflezing van echt verkeer. S4 = vraagset-herverdeling 16→17 (bump 1.5.0),
S6 = verbinding-check-in + premium plan-gate; beide uit docs/plan/PLAN_LEEFSTIJLCHECK_UITVOERING.md.
Elke aanbeveling die hiermee botst label je expliciet als "ná verkeer", met de concrete
trigger (metric + drempel) die hem ontgrendelt.

WERKWIJZE (verplicht, in volgorde — alleen analyse; F5 = sequentie, geen implementatie):
F0 North star herijken — pre-traffic meet-lus vs Premium/Stripe-pad: wat is nú het bindende doel, en wat verschuift er zodra verkeer komt?
F1 WEL/NIET-matrix — alle geclaimde roadmap-items uit de bronnen tegen code herbevestigen, met pad:regel als bewijs
F2 Diagnose — wat is af maar niet afleesbaar; waar spreken de docs elkaar tegen
F3 Max 5 beslissingspoorten — o.a. "bouwen vs wachten op verkeer"; kies per poort expliciet, max 5 regels onderbouwing
F4 Geen feature-ontwerp — wél meet-/afleesontwerp voor week-0: welke query, view of dashboard beantwoordt welke beslisvraag
F5 Geprioriteerde sequentie — 30 dagen (pre-traffic) + 90 dagen (ná verkeer) als één doorlopende lijst, met expliciet WAT NIET
F6 Dennis-checklist (handmatige acties buiten de repo) + max 3 Fable/Cursor-handoff-prompts (alleen titel + 1 zin elk, geen uitwerking)

## Verplichte bronnen

Sprint/waarheid (leidend bij conflict, maar óók toetsen):
- docs/core/CURRENT_SPRINT.md
- docs/core/PAGE_ROADMAP.md
- docs/cursors/pre-traffic-gates-2026-07.md

Fable-besluitlog (claims herbevestigen, niet overnemen):
- docs/cursors/fable-architectuur-synthese-rapport-2026-07.md
- docs/cursors/fable-vervolg-geintegreerd-2026-07.md
- docs/cursors/fable-conversie-datastrategie-2026-07.md
- docs/cursors/fable-cursor-prompts-moat-2026-07.md
- docs/cursors/fable-prompts-retentie-backlog-2026-07.md
- docs/cursors/moat-kpi-review-2026-07.md

Plan (alleen status-check, geen scope-uitbreiding):
- docs/plan/PLAN_AANPAK_MAAND_ROADMAP.md
- docs/plan/PLAN_DOMAIN_DEEP_TOOL.md

Code-spotchecks (minimaal deze; breid uit waar een claim erom vraagt):
- src/lib/db/entitlements.ts — entitlements-SSOT, hasFeature, fail-open
- src/app/api/account/events/route.ts + src/lib/account-events-client.ts — account-scoped durable events, allowlist
- src/app/api/account/waitlist/route.ts + supabase/migrations/20260704120000_premium_waitlist_consolidation.sql — waitlist-consolidatie; of de migratie op de PRODUCTIE-database staat is vanuit de repo niet verifieerbaar → pre-traffic-gates claimt ✅, noteer als "extern bevestigd 16 jul" en neem hem op in de Dennis-checklist als her-check, niet als aanname
- src/components/dashboard/DomainDeepTool.tsx — preview→waitlist-pad (A5), meetpunten
- src/lib/events.ts + src/app/api/intake/events/route.ts — domain_events, allowlists, intake funnel-events
- src/lib/resolve-nurture-cta.ts + src/lib/nurture.ts — nurture CTA-resolver; dag-0-herinrichting (B7) status

## Bekende feiten om te verifiëren (niet blind overnemen)

- CURRENT_SPRINT.md + pre-traffic-gates (16 jul) claimen voltooid: engine 1.4.0 +
  item-baseline, delta-gating hermeting, intake funnel-events per fase, account-events-route
  + entitlements-SSOT, waitlist-consolidatie op prod (migratie 20260704120000), cookie/GA4-
  checklists, Sentry prod-activering
- Vervolg-geïntegreerd (5 jul) voerde nog als OPEN: T1-preview → waitlist-pad (A5),
  SQL-views / composiet-KPI-afleesbaarheid (B3), 4 event-stubs zonder emit-site (B5),
  dag-0-herinrichting (B7), verbinding-content — check welke daarvan inmiddels dicht zijn
- Architectuur-synthese (4 jul) voerde: waitlist-500 live, billing = 0, observability = 0,
  Dashboard.tsx-monoliet — een deel is aantoonbaar achterhaald (Sentry, waitlist); toets de rest
- Composiet-KPI (leidend, behouden): intake.completed → binnen 30 dagen geattribueerde
  affiliate.click OF premium.waitlist_joined, per intake-weekcohort
- 30-dagen moat-KPI-review staat gepland op 4 augustus 2026 (moat-kpi-review-2026-07.md)

## Outputstructuur (verplicht)

1. **Executive summary** — max 10 regels
2. **Roadmap-scorecard** — tabel: Item | Bron-doc + claim | Code-status (pad:regel) | Waarde nu (pre-traffic) | Advies keep/kill/defer (defer altijd mét trigger)
3. **Doc-drift** — waar CURRENT_SPRINT.md, pre-traffic-gates en de Fable-docs elkaar tegenspreken; per conflict: welk document moet bijgewerkt worden en met welke regel
4. **Vervolg-sequentie** — 30 dagen (pre-traffic) en 90 dagen (ná verkeer) als één doorlopende lijst; plus expliciete NIET-lijst met reden
5. **Meetpunten per stap** — welk event / welke view / welke query leest het effect af; composiet-KPI blijft de leidende lens
6. **Dennis-checklist** + max 3 handoff-prompts (titel + 1 zin)

## Regels

- Geen code, geen commits, geen migraties — alleen rapport
- Elke status-claim met bewijs (pad:regel of grep-resultaat); "niet verifieerbaar vanuit de repo" is een geldig antwoord en gaat naar de Dennis-checklist
- Geen vage "overweeg"-taal — kies, met onderbouwing
- Alles wat je adviseert te doen vóór de week-0-aflezing moet meet-/afleeswerk zijn, geen features
- Hergebruik bestaande event-types en views vóór je nieuwe verzint (meet-standaard CLAUDE.md)
```

---

## Na uitvoering

1. Scorecard en doc-drift-sectie reviewen; her-check prod-migratie `20260704120000`
   in de Supabase Dashboard (staat ook in de Dennis-checklist die Fable oplevert)
2. Doc-drift verwerken: verouderde claims in de 4–5-juli-docs markeren als achterhaald
   (of het doc archiveren), CURRENT_SPRINT.md waar nodig aanvullen
3. De max 3 handoff-prompts pas laten uitwerken in aparte sessies, ná akkoord op de
   30/90-dagen-sequentie
