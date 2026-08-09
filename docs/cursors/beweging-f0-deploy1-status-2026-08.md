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
| F1a planbaarheid (duur, bloklengte, raster) | **Deploy 2 klaar** — lokaal, wacht op deploy |
| Chip-tijdkiezer Mijn Dag | Meegenomen in Deploy 2 |
| B keuzeladder + rijke Meer hulp | A8 open — geen catalogus in src |
| Review 1–5 | Register/art. 9 |

## Bekende F0-frictie (verwacht, geen bug)

- **Verplaatsen** plan-stap: alleen tijd zetten; geen planner/duur (F1a)
- **Meer hulp**: opent moment-formulier, geen keuzelijst B

## Hotfix na deploy (zelfde week)

- Onderbouwing beweging op Mijn Dag → `#MOV_STR` / `#MOV_CARD` / `#MOV_SED` i.p.v. generieke vitaliteit-pagina
- Copy Verplaatsen + Meer hulp: verwachting expliciet

## Deploy 2 klaar (5 aug 2026, lokaal)

- F1a: duur op tray/week, tier-bloklengte, done-readout in raster
- Chip-tijdkiezer (`AgendaTimePicker`) — geen native `type=time` meer op Mijn Dag
- **Actie:** commit picker-wijzigingen + `bash deploy.sh` → PostHog annotatie Deploy 2
- **Meetpunt:** `dashboard.time_bucket_set`

## Deploy 3 (9 aug 2026, 08:39 UTC+2)

Live op `8361013`. Vorige prod-staat was `7d6205b` (6 aug 06:38).

**Beweging:**
- **F1a-nazorg sync (slice 2)** — `a1bcd9f`: de volledige beweegcheck schrijft `MOV2_CARD/VIG/SIT/STR`
  nu ook naar `intake_sessions.answers`. `deriveMovementCurrent()` levert daardoor
  `source: "beweegcheck"` i.p.v. "basischeck"; programma-sheet toont echte band-labels,
  check-nudge dooft. Non-blocking: een fout op de merge laat de check-in staan.
- **Advies-treden Voortgang** — `00c35ee`: drie-tredenladder, op Voortgang, niet in de hero.
- **Dunne Meer-hulp-brug Agenda** — `5717d54` + `69e0579`: brug-sheet i.p.v. moment-formulier,
  beperkt tot domein beweging.

**Meegereden, niet-beweging:**
- `12840f4` **fix(security)**: `client-ip.ts` vertrouwt alleen Nginx `x-real-ip`, niet
  `cf-connecting-ip` (domein is DNS-only, geen CF-proxy). Raakt de IP-resolutie onder de
  rate limiter — houd 429-gedrag in de gaten.
- `ad3a4a2` docs(compliance): DPIA §0/§6-fix, restore-test-draaiboek, beveiligingsadvies.
- `44a83b0` docs(privacy): ervaringsvraag vooruit geregistreerd bij verwerking 18. **Poort open** —
  de keuze-schap-code mag nu pas schrijven, niet eerder.

**GA4-annotatie** (één, op 09-08-2026):
> Deploy 3 — beweging: F1a-nazorg sync (MOV2→answers) + advies-treden (Voortgang) + dunne
> Meer-hulp-brug (Agenda). Meegereden: client-ip security-fix (rate-limiter IP-resolutie).
> F1a-meetvenster gate 6: PROVISIONAL (3/14 dagen op deploy-moment). Regressiewacht blijft
> `dashboard_vandaag_action_toggled{surface:kompas_beweging}`.

**Gate 6:** PROVISIONAL — venster liep op 3 van 14 dagen. Zie
[`beweging-f1a-gate6-verdict-2026-08.md`](beweging-f1a-gate6-verdict-2026-08.md). Drie dingen
daaruit die het aflezen op 20 augustus sturen:
- De Δ ≥ +10pp-regel vervalt (`accepted_default` bestaat pas sinds `7d6205b`, geen P0-baseline).
  Vervangen door **absolute drempel ≥ 60%**, gelockt op 09-08 vóór enig cijfer zichtbaar was.
- `choice: "kort"` bestaat niet in code (is `geen_tijd`); `action_toggled` heeft `done: boolean`,
  geen `state`. Queries in §3 zijn gecorrigeerd.
- De check-nudge stond op de bevriezingslijst en dooft door slice 2 — lichte gunstige bias op de
  regressiewacht, correctie in §2.3.

**Openstaande actie met deadline:** controleer dat `accepted_default` als aangepaste dimensie in
GA4-admin geregistreerd staat. Werkt niet met terugwerkende kracht.

**Volgende meet-gate:** `choice.shelf_opened{from_state}` — 2 weken, eigen venster.
