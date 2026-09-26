# Openstaande Supabase-migraties

Eén lijst met alle SQL die nog **niet** in productie is uitgevoerd. Migraties gaan bij PerfectSupplement altijd handmatig via **Supabase Dashboard → SQL Editor** (nooit `supabase db push`), en dat lukt niet vanaf mobiel. Daarom houdt Claude deze lijst bij: wat hier staat, moet jij thuis nog draaien.

**Regel voor Claude:** elke nieuwe `supabase/migrations/*.sql` krijgt in **dezelfde commit** een blok onder "Nog uit te voeren". `npm run check:migraties` en CI blokkeren als dat niet gebeurt.

## Status

- **Baseline toegepast t/m:** `20260925120000_intake_sessions_session_kind_nutrition.sql`
- **Openstaand:** 4 migraties (productplatform plak 1, zie hieronder)
- **Laatst bijgewerkt:** 26 september 2026

> De baseline is een aanname: alles wat vóór 8 sep 2026 op `main` stond, is destijds door Dennis in de SQL Editor gedraaid. Klopt dat niet, verplaats dan de baseline naar de laatste migratie die je zeker wél hebt uitgevoerd en zet de rest hieronder terug in "Nog uit te voeren".

## Nog uit te voeren

### [ ] 20260926065019_sup_catalog.sql
- **Wat:** productcatalogus-laag (`sup_brands`, `sup_categories`, `sup_products`, `sup_product_actives`, `sup_product_ingredients`, `sup_product_certifications`, `sup_product_claims`, `sup_sources`, `sup_product_images`). RLS deny-all, service-role-only.
- **Blokkeert deploy:** nee — puur additief, geen bestaande code leest of schrijft deze tabellen. `/beste/*` blijft op de statische `ComparisonPageData`-bestanden draaien tot de DB-loader (latere plak) expliciet overschakelt.
- **Hoort bij:** PartnerDesk-productplatform plak 1, zie `docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` §C2 en de §808-beslissingen (26 sep 2026).
- **Terugdraaien:** `drop table` in omgekeerde afhankelijkheidsvolgorde (eerst `sup_product_images`/`sup_sources`/`sup_product_claims`/`sup_product_certifications`/`sup_product_ingredients`/`sup_product_actives`, dan `sup_products`, dan `sup_categories`/`sup_brands`).

### [ ] 20260926065020_sup_scoring.sql
- **Wat:** scorelaag (`sup_score_models`, `sup_scores`, `sup_badges`). Sluit aan op de al bestaande PS-Score (`computeTrustScore()`, versie 1.2.0) — geseed met die gewichten, niet met de oorspronkelijke 15-aug-§C3-tabel (die is vervangen, zie de §C3-correctie in het analysedoc). Vereist `sup_catalog.sql` (foreign keys naar `sup_products`/`sup_categories`).
- **Blokkeert deploy:** nee — additief, ongebruikt totdat de DB-loader bestaat.
- **Hoort bij:** zelfde plak als hierboven.
- **Terugdraaien:** `drop table public.sup_badges, public.sup_scores, public.sup_score_models;`

### [ ] 20260926065021_sup_retail.sql
- **Wat:** retail- en prijslaag (`sup_retailers`, `sup_offers`, `sup_offer_price_history`, `sup_clicks`). Vereist `sup_catalog.sql`. `relationship` ondersteunt zowel `direct` als `network` naast elkaar (§808: wederpartij per categorie, geen N=1-aanname).
- **Blokkeert deploy:** nee — additief, `affiliate_clicks` blijft ongewijzigd in gebruik tot de overgang (zie §C4-slot van het analysedoc).
- **Hoort bij:** zelfde plak als hierboven.
- **Terugdraaien:** `drop table public.sup_clicks, public.sup_offer_price_history, public.sup_offers, public.sup_retailers;`

### [ ] 20260926071307_sup_products_legacy_fields.sql
- **Wat:** voegt `raw_legacy_fields jsonb` toe aan `sup_products` — bewaart `specs[]`/`pros[]`/`cons[]`/`breakdown[]` uit het oude `SupplementProduct`-type 1-op-1 bij de backfill (zie plak 1-scope-verduidelijking in het analysedoc).
- **Blokkeert deploy:** nee — additieve kolom, `null` totdat de backfill draait.
- **Hoort bij:** zelfde plak als hierboven.
- **Terugdraaien:** `alter table public.sup_products drop column raw_legacy_fields;`

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
| 25 september 2026 | `20260925120000_intake_sessions_session_kind_nutrition.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npx supabase db query --linked`: `intake_sessions_session_kind_check` = `session_kind IN ('initial','remeasure','nutrition')`, geen tweede constraint. |
| 23 september 2026 | `20260919120000_account_dagboek_favorieten.sql` | Bevestigd via `npm run check:db-schema`: tabel aanwezig met 6 kolommen. |
| 23 september 2026 | `20260923100000_account_nutrient_zichtbaarheid.sql` | Bevestigd via `npm run check:db-schema`: tabel aanwezig met 6 kolommen. |
| 23 september 2026 | `20260923150000_account_voedingsdoelen.sql` | Door Dennis gedraaid in de SQL Editor; bevestigd via `npm run check:db-schema`: tabel aanwezig met 7 kolommen. PR #24 daarna gemerged. |
| 18 september 2026 | `20260917210000_daybook_items.sql` | Bevestigd via Supabase-logs (Postgres-foutmeldingen `column ... items does not exist` stoppen na 12:59) + `npm run check:db-schema` groen. |
