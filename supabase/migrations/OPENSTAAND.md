# Openstaande Supabase-migraties

Eén lijst met alle SQL die nog **niet** in productie is uitgevoerd. Migraties gaan bij PerfectSupplement altijd handmatig via **Supabase Dashboard → SQL Editor** (nooit `supabase db push`), en dat lukt niet vanaf mobiel. Daarom houdt Claude deze lijst bij: wat hier staat, moet jij thuis nog draaien.

**Regel voor Claude:** elke nieuwe `supabase/migrations/*.sql` krijgt in **dezelfde commit** een blok onder "Nog uit te voeren". `npm run check:migraties` en CI blokkeren als dat niet gebeurt.

## Status

- **Baseline toegepast t/m:** `20260917210000_daybook_items.sql`
- **Openstaand:** 3 migraties
- **Laatst bijgewerkt:** 23 september 2026

> De baseline is een aanname: alles wat vóór 8 sep 2026 op `main` stond, is destijds door Dennis in de SQL Editor gedraaid. Klopt dat niet, verplaats dan de baseline naar de laatste migratie die je zeker wél hebt uitgevoerd en zet de rest hieronder terug in "Nog uit te voeren".

## Nog uit te voeren

### [ ] 20260919120000_account_dagboek_favorieten.sql
- **Wat:** nieuwe tabel `account_dagboek_favorieten` — handmatig bewaarde dagboek-favorieten (voeding/supplement, ster-knop op het zoekscherm), RLS deny-all.
- **Blokkeert deploy:** ja (branch `claude/dagboek-hero-balken`)
- **Hoort bij:** plak E van de Dagboek-zoekflow-iteratie (favorieten-backend)
- **Terugdraaien:** `drop table if exists public.account_dagboek_favorieten;`

### [ ] 20260923100000_account_nutrient_zichtbaarheid.sql
- **Wat:** nieuwe tabel `account_nutrient_zichtbaarheid` — aan/uit-voorkeur per voedingsstof voor de premium nutriëntentabel op Je patroon (Samenvatting), RLS deny-all.
- **Blokkeert deploy:** ja (branch `claude/dagboek-hero-balken`)
- **Hoort bij:** premium nutriëntentabel met aan/uit-toggle op Je patroon
- **Terugdraaien:** `drop table if exists public.account_nutrient_zichtbaarheid;`

### [ ] 20260923150000_account_voedingsdoelen.sql
- **Wat:** nieuwe tabel `account_voedingsdoelen` — eigen voedingsdoelen per account (gewicht, trainingsbelasting, handmatig eiwitdoel), één rij per account, RLS deny-all.
- **Blokkeert deploy:** ja (branch `feat/voedingsdoelen-instellingen`)
- **Hoort bij:** instellingen-scherm voor voedingsdoelen (stap 2 van de doelgroepverbreding naar 30+)
- **Terugdraaien:** `drop table if exists public.account_voedingsdoelen;`

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
| 18 september 2026 | `20260917210000_daybook_items.sql` | Bevestigd via Supabase-logs (Postgres-foutmeldingen `column ... items does not exist` stoppen na 12:59) + `npm run check:db-schema` groen. |
