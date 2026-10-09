# Openstaande Supabase-migraties

Eén lijst met alle SQL die nog **niet** in productie is uitgevoerd. Migraties gaan bij PerfectSupplement altijd handmatig via **Supabase Dashboard → SQL Editor** (nooit `supabase db push`), en dat lukt niet vanaf mobiel. Daarom houdt Claude deze lijst bij: wat hier staat, moet jij thuis nog draaien.

**Regel voor Claude:** elke nieuwe `supabase/migrations/*.sql` krijgt in **dezelfde commit** een blok onder "Nog uit te voeren". `npm run check:migraties` en CI blokkeren als dat niet gebeurt. Een additieve migratie gaat bovendien **meteen als eigen PR naar `main`** (alleen `.sql` + dit blok), zodat hij hier in de hoofdmap staat; de code die hem nodig heeft wacht op de feature-branch.

## Status

- **Baseline toegepast t/m:** `20261007150000_voedingsrichting.sql`
- **Openstaand:** 1
- **Laatst bijgewerkt:** 9 oktober 2026

> De baseline is een aanname: alles wat vóór 8 sep 2026 op `main` stond, is destijds door Dennis in de SQL Editor gedraaid. Klopt dat niet, verplaats dan de baseline naar de laatste migratie die je zeker wél hebt uitgevoerd en zet de rest hieronder terug in "Nog uit te voeren".

## Nog uit te voeren

### [ ] 20261009120000_doel_evaluatie.sql
- **Wat:** drie kolommen op `account_voedingsdoelen` voor de doel-evaluatie: `voedingsrichting_gekozen_op` (timestamptz), `doel_startstand` (jsonb) en `doel_bevestigd_op` (timestamptz). Alle drie nullable, geen backfill.
- **Blokkeert deploy:** ja (branch `feat/doel-evaluatie`, nog te maken): de code die de kolommen schrijft en leest komt pas nadat jij dit hebt gedraaid.
- **Hoort bij:** `docs/plan/BESLUIT_DOEL_ZONE_RICHTING_EVALUATIE_2026-10.md` §3 en §4 (stap 2 van de volgorde).
- **Terugdraaien:** niet nodig, alleen additief. Eventueel `alter table public.account_voedingsdoelen drop column voedingsrichting_gekozen_op, drop column doel_startstand, drop column doel_bevestigd_op;`

**Nog te doen (geen migratie, geen blocker):** een nieuwe cron-job.org job aanmaken voor `GET`/`POST` `/api/cron/account-retention` (dagelijks, zelfde `CRON_SECRET`-auth als de bestaande crons) — zonder die externe trigger loopt de inactiviteitscron nooit, alleen de kolom + leesfunctie staan al klaar.

## Runbook bij thuiskomst

1. **Migraties draaien.** Per blok hierboven, in volgorde: open het `.sql`-bestand, plak de inhoud in Supabase Dashboard → SQL Editor → Run. Stopt er één met een foutmelding, ga dan niet verder — de volgende bouwt er meestal op voort.
2. **Controleren.** `npm run check:db-schema` (vereist `supabase link`).
3. **Verplaatsen.** Zet elke gedraaide migratie in de tabel "Toegepast na baseline", schuif de baseline op en zet "Openstaand" op het nieuwe aantal.
4. **Pushen.** `git add -A && git commit && git push -u origin main`.
5. **Deployen.** `bash deploy.sh` — of laat de GitHub Action het doen: een push naar `main` draait CI en daarna automatisch de deploy naar Hetzner.

## Werken terwijl er iets openstaat

Zolang een migratie hier openstaat, mag code die die tabel of kolom **hard nodig heeft** niet naar `main`: een push naar `main` deployt zichzelf via de Deploy-workflow, en dan draait de site tegen een schema dat nog niet bestaat.

Twee veilige routes, per blok vastgelegd in het veld **Blokkeert deploy**:

- **nee** — de code vangt het ontbrekende schema af (feature blijft uit, geen crash). Mag gewoon mee naar `main`.
- **ja** — de code blijft op de feature-branch tot jij de migratie hebt gedraaid. De branchnaam staat in het blok; na stap 1 van het runbook merge je die alsnog.

## Formaat van een blok

```md
### [ ] 20260910120000_bestandsnaam.sql
- **Wat:** in één zin wat het schema doet.
- **Blokkeert deploy:** ja (branch `claude/...`) | nee (code vangt het af)
- **Hoort bij:** commit-hash + korte omschrijving
- **Terugdraaien:** het `drop`-statement, of "niet nodig — alleen additief".
```

## Toegepast na baseline

| Datum | Migratie | Opmerking |
|-------|----------|-----------|
| 7 oktober 2026 | `20261007150000_voedingsrichting.sql` | Door Dennis gedraaid in de SQL Editor. |
| 7 oktober 2026 | `20261007120000_eetpatroon_overgeslagen.sql` | Door Dennis gedraaid in de SQL Editor en opgeslagen. |
| 6 oktober 2026 | `20261006150000_kernstof_profiel_leeftijd_activiteit.sql` | Door Dennis gedraaid in de SQL Editor. |
| 6 oktober 2026 | `20261006120000_kernstof_profiel_menstruatie.sql` | Door Dennis gedraaid in de SQL Editor (na de tabel hieronder). |
| 6 oktober 2026 | `20261005120000_account_kernstof_profiel.sql` | Door Dennis gedraaid in de SQL Editor. |
| 5 oktober 2026 | `20261004150000_account_gevolgde_stoffen.sql` | Door Dennis gedraaid in de SQL Editor en opgeslagen. |
| 4 oktober 2026 | `20261001090000_schema_drift_baseline.sql` | Door Dennis gedraaid in de SQL Editor, zonder fout. |
| 3 oktober 2026 | `20261003120000_nevo_foods.sql` | Door Dennis gedraaid; `node scripts/nevo-laden.mjs --schrijf` meldde "Geschreven: 2328 rijen in nevo_foods". |
| 3 oktober 2026 | `20261003090000_sm_products.sql` | Door Dennis gedraaid. Tabel is leeg tot het licentiebesluit. |
| 1 oktober 2026 | `20261001044530_accounts_last_seen_at.sql` | Door Dennis gedraaid; bevestigd via `npm run check:db-schema`: `accounts,6` (was 5 kolommen). |
| 1 oktober 2026 | `20261001044500_cleanup_intake_session_domain_events.sql` | Door Dennis gedraaid. |
| 1 oktober 2026 | `20261001044423_domain_events_drop_email.sql` | Door Dennis gedraaid; bevestigd via `npm run check:db-schema`: `domain_events,7` (was 8 kolommen). |
| 30 september 2026 | `20260930143532_sup_products_score_inputs.sql` | Door Dennis gedraaid; bevestigd via `POST /api/admin/data/sup-score-inputs-backfill` en een testproduct dat via de admin op 6/6 van de publiceerpoort kwam (score 93,7). |
| 30 september 2026 | `20260926114550_pd_conversions.sql` | Door Dennis gedraaid; bevestigd via handmatig ingevoerde en goedgekeurde testconversies in het partnerdossier (Omzet-sectie, afwijkingssignaal). |
| 30 september 2026 | `20260926112517_pd_daisycon_en_retailer_partners.sql` | Bevestigd doordat Vitaminstore, VitalNutrition en Arctic Blue als partners in PartnerDesk staan en `sup-offers-backfill` de aanbiedingen vulde (VitalNutrition-aanbieding zichtbaar in het productdossier). |
| 27 september 2026 | `20260927171910_account_macro_doelen.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: tabel aanwezig met 8 kolommen. |
| 27 september 2026 | `20260927162517_account_supermarkt_portie_logs.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: tabel aanwezig met 8 kolommen. |
| 26 september 2026 | `20260926082953_sup_products_display_order.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema` + herbackfill (`POST /api/admin/data/sup-backfill`, 25 producten/0 errors) + tekstvergelijking `/beste/magnesium` (336 regels, 0 diff met de statische versie). |
| 26 september 2026 | `20260926071307_sup_products_legacy_fields.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: `sup_products,25` kolommen (24 uit sup_catalog.sql + `raw_legacy_fields`). |
| 26 september 2026 | `20260926065021_sup_retail.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: `sup_retailers`, `sup_offers`, `sup_offer_price_history`, `sup_clicks` alle aanwezig. |
| 26 september 2026 | `20260926065020_sup_scoring.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: `sup_score_models`, `sup_scores`, `sup_badges` alle aanwezig. |
| 26 september 2026 | `20260926065019_sup_catalog.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: alle 9 tabellen (`sup_brands`, `sup_categories`, `sup_products`, `sup_product_actives`, `sup_product_ingredients`, `sup_product_certifications`, `sup_product_claims`, `sup_sources`, `sup_product_images`) aanwezig met het verwachte aantal kolommen. PR #46/#47 daarna gemerged. |
| 25 september 2026 | `20260925120000_intake_sessions_session_kind_nutrition.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npx supabase db query --linked`: `intake_sessions_session_kind_check` = `session_kind IN ('initial','remeasure','nutrition')`, geen tweede constraint. |
| 23 september 2026 | `20260919120000_account_dagboek_favorieten.sql` | Bevestigd via `npm run check:db-schema`: tabel aanwezig met 6 kolommen. |
| 23 september 2026 | `20260923100000_account_nutrient_zichtbaarheid.sql` | Bevestigd via `npm run check:db-schema`: tabel aanwezig met 6 kolommen. |
| 23 september 2026 | `20260923150000_account_voedingsdoelen.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: tabel aanwezig met 7 kolommen. PR #24 daarna gemerged. |
| 18 september 2026 | `20260917210000_daybook_items.sql` | Bevestigd via Supabase-logs (Postgres-foutmeldingen `column ... items does not exist` stoppen na 12:59) + `npm run check:db-schema` groen. |
