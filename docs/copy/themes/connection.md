# Thema: Verbinding

**Label:** Verbinding  
**Sublabel:** Sociaal · doel  
**Gemeten in intake:** ja (`CON_SOC`, sinds rules_version 1.3.0)

## Herkenningszinnen (mapping)

| body_text | match | priority | placeholder |
|-----------|-------|----------|-------------|
| Je mist soms echt contact of staat er vaak alleen voor. | `CON_SOC <= 2` | 1 | ja |

Bron: `STATIC_RECOGNITION_LINES.connection` in `src/lib/content/themes.ts`.

## Generieke fallback (0 matches)

> Op basis van je antwoorden lijkt verbinding nu een aandachtspunt — sociaal contact en steun dragen je veerkracht, juist na 40.

## Hefboom (fase 3)

Verbinding en steun bepalen hoeveel je aankunt. Het gaat niet om veel contacten — **een paar mensen bij wie je tot rust komt** doen vaak meer dan nog een product of protocol.

> Placeholder in DB (`themes.hefboom_text`) — vervang door definitieve copy.

## Status & open punten

Verbinding is het 5e interventiedomein (naast slaap, stress, voeding, beweging) en wordt sinds rules_version 1.3.0 gescoord via `CON_SOC`. Het kan via `TIEBREAK_ORDER` (`src/lib/primary-theme.ts`) het primaire thema worden — net als de andere vier.

Openstaand (zie `docs/plan/PLAN_LEEFSTIJLCHECK_UITVOERING.md`):
- **Eigen profiellabel** — verbinding-primair valt nu terug op "In Balans" i.p.v. een eigen label (stap S5).
- **Leefstijlplan** — er bestaat nog geen `connection.ts` in `src/data/lifestyle-plans/` (stap S5).
- **Check-in** — geen verdiepende `/intake/verbinding`-flow, in tegenstelling tot slaap/stress/voeding/beweging (stap S6).
