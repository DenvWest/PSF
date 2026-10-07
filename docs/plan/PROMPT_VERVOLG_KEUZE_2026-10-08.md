# Prompt — vervolg Keuze (8 oktober 2026)

**Voor:** een nieuwe Claude-sessie in `~/psf`. Werk in een eigen worktree vanaf `origin/main` (CLAUDE.md, "Eén worktree per sessie"). Lees eerst `docs/plan/BESLUIT_KEUZE_VERGELIJKEN_2026-10.md` (rondes 1–10, 6–7 okt): daar staat waarom Keuze zo is gebouwd.

## Waar we staan (7 okt, eind van de dag)

- Gemerged: #167 (één kaart per stof, check als context, producten uit de database), #170 (Kies-knoppen, productpagina, terugknop `TerugNaarKeuze`).
- **Open: PR #176** (`feat/mijn-keuzes`, worktree `.claude/worktrees/mijn-keuzes`, dev op :3004): Favorieten → "Mijn keuzes", eten en supplement naast elkaar, moment per kant, één "Kies" per voedingsmiddel, zoeken per kolom, keuze per stof (`voeding-eten-<stof>-<key>`), zoeken op meer woorden in `searchCatalog`.
- Alle keuzes staan in `account_favorites` met gecodeerde ids (`voeding-route-…`, `voeding-product-…`, `voeding-moment-…`, `voeding-eetmoment-…`, `voeding-eten-…`); helpers in `src/lib/keuze-product-keuze.ts`. Geen migraties.

## Volgorde (Dennis akkoord, 7 okt)

### 1. PR #176 afronden
Vraag Dennis of hij #176 op :3004 heeft gezien. Alleen bij zijn akkoord en volledig groene CI: `gh pr merge 176 --squash`, daarna `git pull --ff-only` in `~/psf` en de worktree opruimen (skill `pr-klaarmelden`).

### 2. Supermarktgegevens kloppend maken (OFF-laag)
Bron: `docs/plan/REVIEW_OFF_IMPORT_2026-10.md` (Dennis akkoord 4 okt, fixes nooit gebouwd). Minimaal:
- **#1** Micro-waarden die Open Food Facts uit de ingrediëntenlijst *schat* (± driekwart van calcium/ijzer/vitamine C/vitamine D in `sm_products`) markeren of weglaten. Ze staan nu zonder vlag tussen de etiketwaarden.
- **#2** Eenheidsfout in `scripts/off-extract.py` (r. 139–147): het `100g`-veld staat bij OFF altijd in gram. Nu worden ±440 waarden 1.000–1.000.000× te klein, waarvan 185 een verzonnen 0. Fix en test staan in de review (§2).
- Opnieuw extraheren en laden doet Dennis zelf. Lever de exacte commando's. Een migratie hoort bij `OPENSTAAND.md` (CLAUDE.md, Migraties).
- Lees de rest van de review en vraag welke van #3 en verder mee moeten.

### 3. Gekozen supplement loggen in het dagboek
- Het dagboek kent nu alleen 9 algemene supplementen (`src/data/nutrition/supplement-catalog.ts`), zonder merkproducten en zonder vitamine D.
- Doel: het in Keuze gekozen product (met etiketdosis per dag, uit `KeuzeProduct.dosisPerDag` en `eenheid`) staat in Dagboek → Mijn supplementen. Mijn keuzes krijgt dan "＋ Dagboek" bij het supplement, op het gekozen moment (`voeding-moment-<stof>-<moment>`). Het telt mee in de blauwe ring "uit een supplement".
- Ontwerpvraag vóór het bouwen: hoe een dagboekregel naar een hubproduct verwijst (de producten komen uit de database, `leesDagboekVoeg` valideert nu tegen de statische catalogus). Leg de keuze voor met een aanbeveling.
- Vervang daarna in `MijnKeuzes.tsx` de zin "Loggen in je dagboek volgt…".

### 4. Prijstabel voor eten (indicatief, per portie)
- Dennis akkoord met het voorstel. Dit herziet het besluit van 3 okt ("prijzen later") **alleen** voor dit onderdeel. Leg dat vast in het besluitdocument.
- ± 30 regels: de rijkste bronnen van de vijf kernstoffen uit de eigen catalogus (`rijksteBronnen`, per portie).
- Prijzen **met de hand opzoeken met een bronlink per regel**. Niet scrapen: Jumbo verbiedt het, en het databankrecht beschermt tegen stelselmatig overnemen. Ook geen supermarktsnapshot (die is "niet voor prijzen").
- In de UI: "indicatief", de prijsdatum, de bron, en "prijzen verschillen per winkel en aanbieding". Altijd per portie, nooit per mg.
- Toon de prijs in Mijn keuzes naast de prijs per dag van het supplement. Dennis controleert de prijzen op de dev-poort vóór de merge.

## Regels die steeds terugkwamen

- Lokaal laten zien op een vrije poort (3001+) en de **cwd van de pid op die poort controleren**. Merge alleen na Dennis' akkoord en groene CI.
- Klaar-check vóór elke commit: `grep -rn "console.log" src/`, `npx tsc --noEmit`, `npm test`, `npm run lint -- --max-warnings 0`. Geen `next build` naast een draaiende dev-server.
- Elke nieuwe knop krijgt een meetpunt in dezelfde wijziging. Meld steeds "Meetpunt: …".
- Geen "tekort"-taal (asymmetrie-regel). Geen affiliate-link in het dashboard; de koopknop staat op `/product/<slug>`.
- Mobiel op 375 px: binnen tegels `@container`, geen `lg:`.
- Elk besluit leg je vast in `docs/plan/BESLUIT_KEUZE_VERGELIJKEN_2026-10.md` (nieuwe ronde), en bij stap 2 in de OFF-review.

## Gecontroleerd en goed bevonden (niet opnieuw doen)

"Jouw bronnen, 7 dagen" toont bij elke stof kipdij, zalm en biefstuk. Dat **klopt**: het dagboek bevatte op 7 okt maar 7 regels (kipdij 2×, gerookte zalm 2×, biefstuk, pinda's, spinazie, allemaal bij ontbijt). Per stof is de rangorde anders, en omega-3 toont alleen zalm. Geen fout in `bronnenVanStof`.
