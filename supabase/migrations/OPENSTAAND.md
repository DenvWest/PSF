# Openstaande Supabase-migraties

Eén lijst met alle SQL die nog **niet** in productie is uitgevoerd. Migraties gaan bij PerfectSupplement altijd handmatig via **Supabase Dashboard → SQL Editor** (nooit `supabase db push`), en dat lukt niet vanaf mobiel. Daarom houdt Claude deze lijst bij: wat hier staat, moet jij thuis nog draaien.

**Regel voor Claude:** elke nieuwe `supabase/migrations/*.sql` krijgt in **dezelfde commit** een blok onder "Nog uit te voeren". `npm run check:migraties` en CI blokkeren als dat niet gebeurt.

## Status

- **Baseline toegepast t/m:** `20260926071307_sup_products_legacy_fields.sql`
- **Openstaand:** 1 migratie (zie hieronder)
- **Laatst bijgewerkt:** 26 september 2026

> De baseline is een aanname: alles wat vóór 8 sep 2026 op `main` stond, is destijds door Dennis in de SQL Editor gedraaid. Klopt dat niet, verplaats dan de baseline naar de laatste migratie die je zeker wél hebt uitgevoerd en zet de rest hieronder terug in "Nog uit te voeren".

## Nog uit te voeren

### [ ] 20260926082953_sup_products_display_order.sql
- **Wat:** voegt `display_order int not null default 0` toe aan `sup_products` + index op `(category_id, display_order)`. Ontdekt bij het omschakelen van `/beste/magnesium`: zonder deze kolom had de DB-loader geen manier om de redactionele productvolgorde (topkeuze eerst) te bewaren, waardoor Viridian per ongeluk vóór Vitaminstore kwam te staan.
- **Blokkeert deploy:** nee — additieve kolom met default `0`, bestaande producten (backfilld vóór deze migratie) krijgen pas de juiste waarde na een hernieuwde `POST /api/admin/data/sup-backfill`-aanroep. Tot die tijd sorteert de DB-loader ze allemaal op `0` (stabiele volgorde, geen crash) — alleen categorieën in `DB_BACKED_CATEGORIES` (nu: `zink`) zijn hierdoor geraakt, en die had toevallig al maar 3 producten met een acceptabele volgorde.
- **Hoort bij:** plak 1, `docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md`.
- **Terugdraaien:** `alter table public.sup_products drop column display_order; drop index if exists public.sup_products_category_display_order_idx;`

**Na het draaien van deze migratie: roep opnieuw `POST /api/admin/data/sup-backfill` aan** (zelfde fetch-commando als eerder) zodat alle 25 producten hun `display_order` krijgen — de migratie zelf vult geen bestaande rijen met de juiste waarde, alleen nieuwe/herbackfillde rijen.

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
| 26 september 2026 | `20260926071307_sup_products_legacy_fields.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: `sup_products,25` kolommen (24 uit sup_catalog.sql + `raw_legacy_fields`). |
| 26 september 2026 | `20260926065021_sup_retail.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: `sup_retailers`, `sup_offers`, `sup_offer_price_history`, `sup_clicks` alle aanwezig. |
| 26 september 2026 | `20260926065020_sup_scoring.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: `sup_score_models`, `sup_scores`, `sup_badges` alle aanwezig. |
| 26 september 2026 | `20260926065019_sup_catalog.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: alle 9 tabellen (`sup_brands`, `sup_categories`, `sup_products`, `sup_product_actives`, `sup_product_ingredients`, `sup_product_certifications`, `sup_product_claims`, `sup_sources`, `sup_product_images`) aanwezig met het verwachte aantal kolommen. PR #46/#47 daarna gemerged. |
| 25 september 2026 | `20260925120000_intake_sessions_session_kind_nutrition.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npx supabase db query --linked`: `intake_sessions_session_kind_check` = `session_kind IN ('initial','remeasure','nutrition')`, geen tweede constraint. |
| 23 september 2026 | `20260919120000_account_dagboek_favorieten.sql` | Bevestigd via `npm run check:db-schema`: tabel aanwezig met 6 kolommen. |
| 23 september 2026 | `20260923100000_account_nutrient_zichtbaarheid.sql` | Bevestigd via `npm run check:db-schema`: tabel aanwezig met 6 kolommen. |
| 23 september 2026 | `20260923150000_account_voedingsdoelen.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: tabel aanwezig met 7 kolommen. PR #24 daarna gemerged. |
| 18 september 2026 | `20260917210000_daybook_items.sql` | Bevestigd via Supabase-logs (Postgres-foutmeldingen `column ... items does not exist` stoppen na 12:59) + `npm run check:db-schema` groen. |
