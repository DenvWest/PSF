# Besluit: "Grootste winst" in de contextkolom krijgt een dagboekregel

**Datum:** 8 oktober 2026
**Status:** Besloten (Dennis, 8 okt: "akkoord") en gebouwd, stap 1 en 2. Stap 3 (teaser) hoort bij de premium-plak.
**Bouwt voort op:** `BESLUIT_PATROON_PREMIUM_EN_WEEKMAIL_2026-10.md` §2 (wat gratis en premium is), `BESLUIT_GRATIS_NU_PREMIUM_AANBOD_2026-10.md`, `ROADMAP_LEEFSTIJLCHECK_NAAR_DASHBOARD_VOEDING.md` §4/§10.3 (invariant: nooit "Grootste winst" op een laag die dat niet zei)
**Raakt:** `src/lib/kompas-winst-dagboek.ts`, `src/components/dashboard/kompas/KompasDagboekRegel.tsx`, `KompasContextSpine.tsx`

## Aanleiding

De winst-laag in "Context bij vandaag" komt uit de check (hoe vaak je iets eet) en wist niets van wat iemand daarna in het dagboek invulde. Naast "je voedinglog is 53 dagen oud" leest een winst op die oude basis als stilstand.

## Besloten

1. **"Grootste winst" blijft de uitkomst van de check.** De winst-laag wijzigt niet door het dagboek.
2. **Een tweede regel met een eigen label: "Uit je dagboek · 7 dagen"**, binnen de winstkaart van voeding. Per stof: "minstens N% van je norm (norm)". De norm is de persoonlijke norm uit Je doelen (`useKernstofNormen`).
3. **Drempel: 5 van de laatste 7 dagen** met iets ingevuld. Daaronder geen stofuitspraak, alleen "N van 7 dagen ingevuld" met een link naar het dagboek.
4. **Hoogstens twee stoffen**, laagste eerst, alleen stoffen die een dagboek kan aantonen (`NIET_BEWIJSBAAR`: geen zink, geen vitamine D) en alleen stoffen met minstens één bron (onbekend is geen nul). Een dagboek meet een ondergrens, dus "minstens"; een benadering krijgt ≈.
5. **"Op of boven je norm"** alleen als elke meetbare stof `gedekt` is (zonder benaderingen).
6. **Gratis.** Eigen getallen over 7 dagen zijn nooit gegated.

## Afgewezen

- **De winst-laag laten meebewegen met het dagboek:** de kolom zou het middenscherm (check-uitslag) tegenspreken en breekt de invariant uit de roadmap. Eén bron per label.
- **Een weekscore of totaalpercentage:** een tweede score is verboden.
- **Het verband per maaltijd ("je ontbijt draagt je magnesium niet") in de kolom:** dat is premium (§2 van het patroon-besluit). Stap 3: een teaser bij de premium-plak.

## Meetpunt

- GA4 `dashboard_kompas_context_view` {zone: dagboek, staat: te_weinig|stoffen|op_norm}: hoe vaak de regel in beeld komt en in welke staat.
- GA4 + Clarity `dashboard_kompas_context_click` {zone: dagboek, staat}: doorklik naar Je patroon (bij genoeg dagen) of het dagboek (te weinig dagen).
- Effect: aandeel `te_weinig` dat daarna het dagboek aanvult (`dagboek`-klik, dan meer dagen ingevuld).

## Herziening 9 okt: een dag telt pas als hij volledig is

Dennis had vier halve dagen (alleen ontbijt) en de regel zou bij een vijfde halve dag "minstens 20% van je magnesiumnorm" zijn gaan zeggen: een onvolledige dag leest als een lage dag, terwijl wat je niet registreerde onbekend is, geen nul.

- **Drempel: 5 volle dagen van de laatste 7.** Een dag is vol als al je gewone maaltijden erop staan (`verwachteMaaltijden`, uit Je doelen; leeg = ontbijt, lunch en avondeten) of als een maaltijd als niet gegeten is gemarkeerd (`overgeslagen`). Het overzicht rekent alleen over volle dagen.
- **Onder de drempel** staat wat er wél is: "N van 7 dagen compleet", de maaltijd die ontbreekt ("Vul ook je lunch in") en, vanaf 3 dagen met dezelfde maaltijd, een feit over die maaltijd ("Je ontbijt levert gemiddeld minstens 12% van je magnesiumnorm"). Dat is een feit over wat er stond, geen oordeel over je dag. Omega-3 valt af (weeknorm).
- **Beperking:** het dagboek dat de zijbalk ophaalt kent alleen catalogusproducten. Een dag met alleen etiketproducten telt hier niet als volledig. Patroon rekent die wel mee.

## Herbouw winstkaart voeding (9 okt)

Dennis: het overzicht in de kolom is veel, onduidelijk en zegt weinig; "Plantbasis" is vaag. Besloten (Dennis: "akkoord"), gebouwd:

- **Eén kop, één stap, één knop.** Op de winst-laag van voeding staat de ene stap voor vandaag als kop ("Groente of fruit erbij bij je volgende maaltijd", per feitenrij: `nutrition-winst-stap.ts`) en de knop "Log je maaltijd van vandaag" naar het dagboek. De laagnaam ("Voedingsbasis") staat klein eronder. Op een laag die de check niet als winst aanwees blijft de kaart zoals hij was.
- **De trap vult het dagboek mee:** direct na de check de stap; met halve dagen een feit over de maaltijd en wat er mist; met 5 volle dagen de stand per stof (zie hierboven). Geen muur van "vanaf 5 dagen".
- **De rest ingeklapt** onder "Waarom en wat daarna" (de feitenrij uit de check en de volgende richtingen).
- **Supplement-route:** "Alleen een supplement vergelijken? Bekijk de vergelijking" naar `/supplementen`, als algemene informatie. Geen uitspraak dat je het nodig hebt; de uitgang op basis van je eigen gegevens blijft aan 30 dagen gebonden.
- **Naam:** de rij "Plantbasis" heet nu **"Groente en fruit"** (key `plantbasis` blijft), de prioriteit "Meer groente en fruit". Het antwoord is gelabeld: "Groente 1× per dag · fruit 2× per week · bessen 1× per week". Uitlegzin: "Eén bron voor je vezels, kalium en magnesium." Dit was het voorstel; een andere variant is één kleine wijziging in `nutrition-ladder.ts`.
- **Meetpunt:** GA4 + Clarity `dashboard_kompas_context_click` met `zone: winst_stap` (de knop) en `zone: winst_supplement` (de vergelijkingslink), beide `domain: voeding`.
