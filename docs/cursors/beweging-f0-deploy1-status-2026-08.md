# Beweging F0 — Deploy 1 status (4 aug 2026)

> **Live op prod** sinds 16:21 UTC. Meetvenster loopt op `dashboard.movement_day_choice_set`.

## Wat live is (F0)

- Pariteit dagkeuze + gedaan: Beweging ↔ Mijn Dag zonder reload (A2/A3/A6)
- Wis-guard op dagkeuze (geen spurious `choice: null`)
- Bundel UI-infra: week-grid, context-drawer, rail — geen choice-attributie

## Bewust geparkeerd (niet in Deploy 1)

| Item | Wanneer |
|------|---------|
| E-open (voorselectie + `accepted_default`) | Deploy 2, ná F0-meetvenster |
| Streak "{n} dagen op rij" vs klaar-copy | Besluit vóór/met Deploy 2 |
| Prebuild `#d` Mijn Dag-herbouw | Ná E-open → F1a → B |
| F1a planbaarheid (duur, bloklengte, raster) | Ná E-open of vroege pivot |
| B keuzeladder + rijke Meer hulp | A8 open — geen catalogus in src |
| Review 1–5 | Register/art. 9 |

## Bekende F0-frictie (verwacht, geen bug)

- **Verplaatsen** plan-stap: alleen tijd zetten; geen planner/duur (F1a)
- **Meer hulp**: opent moment-formulier, geen keuzelijst B

## Hotfix na deploy (zelfde week)

- Onderbouwing beweging op Mijn Dag → `#MOV_STR` / `#MOV_CARD` / `#MOV_SED` i.p.v. generieke vitaliteit-pagina
- Copy Verplaatsen + Meer hulp: verwachting expliciet
