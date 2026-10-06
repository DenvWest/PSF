# Review: norm én peer-reviewed onderzoek per stof — van één getal naar een bandbreedte

**Datum:** 6 oktober 2026
**Status:** concept, wacht op review van Dennis. Er verandert niets in `src/` voordat dit is goedgekeurd.
**Raakt:** `src/data/nutrition/voedingsnormen.ts`, `src/lib/protein-target.ts`, `VOEDINGSWAARDE_VELDEN` (RI van de buitenring), het stof-detail in dagboek en Patroon, het midden van de krans (PR #139)
**Bouwt voort op:** `BESLUIT_KERNSTOF_NORMEN_2026-10.md`, PR #141 (eigen streefwaarde), `BESLUIT_DAGBOEK_RINGEN_IN_LAGEN_2026-10.md`
**Aanleiding:** Dennis, 5 okt: "kijk naar peer review voor elke voedingsstof". Hij gaf als voorbeeld Shahinfar e.a., *Sci Rep* 2025 (omega-3 en cognitie).

---

## 1. Wat weegt het zwaarst?

Officiële normen en peer-reviewed onderzoek staan niet tegenover elkaar. Een norm van de Gezondheidsraad, EFSA of NNR *is* een systematische review van peer-reviewed literatuur door een expertpanel. Ze beantwoorden wel een andere vraag:

| Vraag | Beste bron | Wat het oplevert |
|---|---|---|
| Hoeveel heeft vrijwel iedere gezonde volwassene minimaal nodig? | Officiële norm (GR / EFSA / NNR) | **Ondergrens.** Daar staat de ✓. |
| Wat gebeurt er in onderzoek bij méér, voor welke uitkomst, bij wie? | Meta-analyse van RCT's, met GRADE | **Onderzochte zone.** Context, geen doel. |
| Vanaf wanneer wordt het onveilig? | EFSA UL / safe level | **Bovengrens** (vaak alleen voor supplementen). |

**Bewijshiërarchie voor de onderzochte zone** (van zwaar naar licht):

1. Meta-analyse van RCT's, GRADE matig of hoog, bij overwegend gezonde volwassenen, liefst met een dosis-respons.
2. Meta-analyse van RCT's met GRADE laag, of bij een specifieke groep (hoge bloeddruk, 75+, sporters).
3. Dosis-respons-meta-analyse van cohortstudies. Die laat samenhang zien, geen oorzaak.
4. Losse RCT's, mechanistisch onderzoek, dierstudies.

**Voorstel voor de poort:** alleen niveau 1 vormt een zone die we als bandbreedte tekenen. Niveau 2 tonen we met de doelgroep erbij ("in onderzoek bij mensen met hoge bloeddruk"). Niveau 3–4 komen alleen in de bronnenlijst. Een zone komt nooit boven de UL uit.

## 2. Ja: een bandbreedte, met drie strepen

```
0 ─────────[ norm ]━━━━━━━━[ onderzochte zone ]━━━━━━━━[ bovengrens ]──
            ✓ vanaf hier      lichte band, met uitkomst      stippellijn
            ring vol          + zekerheid erbij              "uit supplementen"
```

- **De ring en de ✓ blijven de norm.** De telling, het tekortsysteem, "nog X tot je norm vandaag" en de asymmetrie-regel veranderen niet.
- **De zone staat alleen in het stof-detail** (dagboek en Patroon). Als lichte band op de balk, met één zin: uitkomst, doelgroep, zekerheid, bron. Hij vult geen ring, geeft geen ✓ en is geen streefwaarde.
- **De bovengrens** is een stippellijn met een bron. Bij stoffen waar de UL alleen voor supplementen geldt (magnesium) staat dat erbij.
- **Je eigen streefwaarde (PR #141)** mag in de zone vallen. Zo krijgt iemand die bewust 1000 mg omega-3 kiest een onderbouwde plek op de balk, zonder ✓ (de regel uit #141 blijft gelden).
- **Compliance:** de zone beschrijft onderzoek en geeft geen advies. Geen "goed voor je hersenen". Formulering: "In N studies naar [uitkomst] bij [groep] werden doses van X–Y onderzocht. Zekerheid: [GRADE]." Gezondheidsclaims blijven beperkt tot `approved-claims.ts`.

## 3. Per stof

Legenda: **Norm nu** = wat de code gebruikt. **Voorstel** = de hoogste recente officiële waarde (asymmetrie-regel). ⚠ = nog naast de primaire bron leggen voordat het in `src/` komt.

### Kernstoffen

#### Omega-3 (EPA+DHA)
- **Norm nu:** 200 mg (GR 2001). **Officieel:** GR 2006 450 mg (2× vis per week, waarvan 1× vet); EFSA 2010 250 mg.
- **Voorstel norm:** **450 mg** (GR 2006).
- **Onderzoek:**
  - Cochrane, Abdelhamid e.a. 2020: 86 RCT's, n = 162.796. *Hoge* zekerheid voor weinig of geen effect op sterfte en hart- en vaatziekten in het algemeen. Matige/lage zekerheid voor een klein effect op coronaire sterfte en triglyceriden.
  - Bernasconi e.a. 2021, *Mayo Clin Proc*: 40 RCT's, n = 135.267, doses 400–5500 mg. Per extra 1 g/d ongeveer 9% minder hartinfarct.
  - Shahinfar e.a. 2025, *Sci Rep*: 58 RCT's, doses 230–4950 mg. Gunstigste bereik voor cognitie 1000–2500 mg/d; GRADE laag–matig, I² > 95%, meeste studies van lage kwaliteit. Een derde van de studies ging over mensen met cognitieve achteruitgang.
- **Zone:** 1000–2000 mg, **niveau 2** (gemengd, zekerheid laag–matig). Tonen met uitkomst en zekerheid.
- **Bovengrens:** EFSA 2012: tot 5 g/d EPA+DHA uit supplementen geen veiligheidszorg. EFSA 2026: DHA alleen tot 1 g/d (veilig niveau, bloedingsrisico).

#### Magnesium
- **Norm nu:** 350 / 300 mg (GR 2018). Gelijk aan EFSA 2015 en NNR2023. **Geen wijziging.**
- **Onderzoek:**
  - Zhang e.a. 2016, *Hypertension*: 34 RCT's, n = 2.028. Mediaan 368 mg/d extra gaf −2,0 / −1,8 mmHg; 300 mg/d volstond.
  - Hypertension 2025 (PubMed 41000008): 38 RCT's, n = 2.709, mediaan 365 mg/d. −2,81 / −2,05 mmHg; vooral bij hoge bloeddruk met medicatie (−7,7) en bij een lage magnesiumspiegel. **Geen** dosis-respons, hoge heterogeniteit.
- **Zone:** "+300–400 mg uit een supplement", **niveau 2** (effect vooral bij hoge bloeddruk).
- **Bovengrens:** EFSA 250 mg/d **uit supplementen en toegevoegde zouten**, niet uit gewone voeding. Dat staat in spanning met de 365 mg in de trials. Die spanning tonen we eerlijk en lossen we niet op.

#### Zink
- **Norm nu:** 9 / 7 mg (GR 2018; GR nam de hogere EFSA-waarden bewust niet over).
- **Officieel hoger:** NNR2023 13 / 10 mg (bij 600 mg fytaat/d); EFSA 2014 9,4–16,3 / 7,5–12,7 mg, afhankelijk van fytaat (300–1200 mg/d).
- **Voorstel norm:** afhankelijk van fytaat, met de voedingswijze uit PR #141 als signaal. Alles: NNR 13 / 10. Vegetarisch of veganistisch: EFSA bij hoog fytaat, ⚠ exacte waarde nog aflezen (± 14 / 11 bij 900 mg fytaat). Dit herziet het #141-punt "voedingswijze verandert geen norm" (voor zink).
- **Onderzoek:** bij gezonde volwassenen geen niveau 1-bewijs voor een hogere inname. Er zijn meta-analyses bij diabetes type 2 (lipiden) en naar lichaamsgewicht. **Geen zone.**
- **Bovengrens:** EFSA 25 mg/d (UL).

#### Vitamine D
- **Norm nu:** 10 µg; 70+ 20 µg (GR 2012). **Officieel:** NNR2023 10 µg, 75+ 20 µg (bevestigt GR); EFSA 2016 15 µg (AI, uitgaand van minimale aanmaak via de huid).
- **Voorstel norm:** dit is een echte keuze, zie §5 vraag 2. Strikt volgens de asymmetrie-regel wordt het 15 µg (EFSA). NNR2023 is recenter en blijft op 10.
- **Onderzoek:**
  - Jolliffe e.a. 2024, *Lancet Diabetes Endocrinol*: 40 RCT's, n = 61.589. Overall OR 0,94 (0,88–1,00), net niet significant. In de subgroep **dagelijks 400–1000 IE (10–25 µg)** het meeste effect; bolusdoses niet.
  - Endocrine Society 2024: géén suppletie boven de DRI voor gezonde volwassenen onder 75; wél voor 75+ (vanwege sterfte).
- **Zone:** 10–25 µg dagelijks, **niveau 2** (subgroep). Bij 75+: richtlijn-ondersteund.
- **Bovengrens:** EFSA 2023 100 µg/d (UL, alle bronnen).

#### Eiwit
- **Norm nu:** eigen doel, `protein-target.ts` v1.1.0: 1,0–1,2 g/kg, bij training 1,2–1,6 g/kg. Daarmee zit het al boven de GR-norm (0,83 g/kg).
- **Officieel:** GR/EFSA 0,83 g/kg; NNR2023 65+ **1,2–1,5 g/kg**.
- **Onderzoek:** Morton e.a. 2018, *BJSM*: 49 RCT's, n ≈ 1.800. Bij krachttraining geen extra spierwinst boven ongeveer **1,6 g/kg/d**.
- **Zone:** 1,2–1,6 g/kg, **niveau 1 bij krachttraining**. Het doel dekt dit al. Voorstel: de 65+-ondergrens op 1,2 (NNR2023) zetten zodra de leeftijd bekend is.

### Gevolgde stoffen (buitenring)

**Belangrijke bevinding:** de buitenring vult nu tot de **EU-etiket-RI** (`VOEDINGSWAARDE_VELDEN`). Die ligt bij meerdere stoffen ver onder de norm: kalium RI 2000 tegen norm 3500 mg, calcium 800 tegen 950–1200, B12 2,5 tegen 2,8–4. De ring loopt dus vol bij een inname die onder de norm blijft. Voorstel: vullen tot de norm, met de RI als etiketwaarde alleen in de tabel.

| Stof | RI (etiket, nu) | Officiële norm | Voorstel | Onderzoek (zone) | Bovengrens |
|---|---|---|---|---|---|
| **Vezels** | — | GR 2006 / RGV 2015: 30–40 g ⚠ | 30–40 g | Reynolds e.a. 2019, *Lancet*: 185 cohorten + 58 trials; grootste risicodaling bij 25–29 g, mogelijk meer bij hogere inname (niveau 3, deels 1) | — |
| **Kalium** | 2000 mg | GR 2018 / EFSA 2016: 3500 mg | **3500 mg** | Filippini e.a. 2020, *JAHA*: 32 RCT's, U-vorm, laagste bloeddruk bij 3500–5100 mg/d. Let op bij bloeddrukmedicatie (niveau 2) | — (waarschuwing bij nierziekte/medicatie) |
| **Calcium** | 800 mg | GR 2018: 950 (25–69), 1000 (18–24), 1100 (vrouw 51–69), 1200 (70+) | GR 2018 per leeftijd | Bolland e.a. 2015, *BMJ*: geen verband tussen calcium uit voeding en fracturen; suppletie-bewijs zwak. **Geen zone.** | EFSA 2500 mg ⚠ |
| **IJzer** | 14 mg | GR 2018: man 11, vrouw tot menopauze 16, daarna 11 | GR 2018 | Meer is niet beter (stapeling). **Geen zone.** | ⚠ |
| **Vitamine B12** | 2,5 µg | GR 2018: 2,8 µg; EFSA 2015 / NNR2023: **4 µg** | **4 µg** | — | geen UL |
| **Vitamine C** | 80 mg | GR 2018: 75 mg ⚠; EFSA 2013 / NNR2023: **110 / 95 mg** | **110 / 95 mg** | — | — |
| **Natrium** | — | WHO < 2000 mg; GR: max 6 g zout (2400 mg) ⚠ | bovengrens, geen vulling | — | is zelf een bovengrens |
| **Verzadigd vet, suikers** | — | GR / WHO < 10 en% | bovengrens, geen vulling | — | — |

## 4. Wat dit in de app verandert (pas na akkoord)

1. **Normen** (`voedingsnormen.ts`): omega-3 → 450 mg; zink afhankelijk van fytaat; B12 → 4 µg; vitamine C → 110 / 95 mg; kalium en calcium tegen de norm in plaats van de RI. Elke norm krijgt `bron`, `jaar` en `getoetst: "2026-10"`, plus een test die faalt bij meer dan 12 maanden zonder toetsing.
2. **Nieuw databestand** `src/data/nutrition/onderzoek-per-stof.ts`: per stof de studies (DOI, design, n, dosis, uitkomst, doelgroep, GRADE, I², financiering) en de afgeleide zone met niveau. Eén bron voor stof-detail, Patroon en later de supplementgidsen.
3. **Stof-detail:** balk met norm, zone, bovengrens en eigen streefwaarde, plus de bronnenlijst.
4. **Krans (#139):** het midden rekent tegen de nieuwe normen; de zone komt niet in de krans.
5. **Besluit:** `BESLUIT_KERNSTOF_NORMEN_2026-10.md` herzien (omega-3, zink/voedingswijze, buitenring tegen norm).

## 5. Open vragen voor Dennis

1. Akkoord met de poort (alleen niveau 1 tekent een zone; niveau 2 met doelgroep erbij)?
2. **Vitamine D:** 10 µg (GR 2012 en NNR2023, de recentste) of 15 µg (EFSA, de hoogste)? Advies: **10 µg als norm, 15 µg als begin van de zone**. De recentste officiële review (NNR2023) bleef op 10, en EFSA's 15 gaat uit van geen zon.
3. **Zink:** NNR2023 (13 / 10) voor iedereen, of afhankelijk van de voedingswijze?
4. **Buitenring tegen de norm in plaats van de etiket-RI?** Dat herziet een deel van het besluit van 4 okt ("ring vult tot de RI").

## Bronnen

- Gezondheidsraad 2018, Voedingsnormen vitamines en mineralen volwassenen — [kernadvies (pdf)](https://www.gezondheidsraad.nl/site/binaries/site-content/collections/documents/2018/09/18/voedingsnormen-voor-vitamines-en-mineralen-voor-volwassenen/kernadvies+Voedingsnormen+voor+vitamines+en+mineralen+voor+volwassenen.pdf), [nieuws](https://www.gezondheidsraad.nl/actueel/nieuws/2018/09/18/gezondheidsraad-herziet-voedingsnormen-voor-volwassenen)
- Gezondheidsraad 2006, [Richtlijnen goede voeding (pdf)](https://www.gezondheidsraad.nl/site/binaries/site-content/collections/documents/2006/12/18/richtlijnen-goede-voeding-2006/Advies+Richtlijnen+goede+voeding+2006.pdf); [Richtlijn vezelconsumptie 2006 (pdf)](https://www.gezondheidsraad.nl/site/binaries/site-content/collections/documents/2006/03/21/richtlijn-voor-de-vezelconsumptie/Advies+Richtlijn+voor+de+vezelconsumptie.pdf); [RGV 2015 vezel (pdf)](https://www.gezondheidsraad.nl/site/binaries/site-content/collections/documents/2015/11/04/voedingsvezel-achtergronddocument-bij-richtlijnen-goede-voeding-2015/A1530_Achtergronddocument_RGV2015-Voedingsvezel.pdf)
- NNR2023 — [vitamine D](https://pub.norden.org/nord2023-003/vitamin-d-.html), [magnesium](https://pub.norden.org/nord2023-003/magnesium.html), [zink](https://pub.norden.org/nord2023-003/zinc.html), [eiwit](https://pub.norden.org/nord2023-003/protein-.html), [vitamine C](https://pub.norden.org/nord2023-003/vitamin-c.html)
- EFSA — [UL vitamine D 2023](https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2023.8145), [DRV B12 2015](https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2015.4150), [DRV vitamine C 2013](https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2013.3418), [UL EPA/DHA/DPA 2012](https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2012.2815), [safe level DHA 2026](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12802091/)
- Abdelhamid e.a. 2020, [Cochrane CD003177.pub5](https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD003177.pub5/full)
- Bernasconi e.a. 2021, [Mayo Clin Proc](https://www.mayoclinicproceedings.org/article/S0025-6196(20)30985-X/fulltext)
- Shahinfar e.a. 2025, [Sci Rep (PMC12368174)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12368174/)
- Zhang e.a. 2016, [Hypertension](https://www.ahajournals.org/doi/10.1161/hypertensionaha.116.07664); Magnesium & bloeddruk 2025, [Hypertension (PMC12529988)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12529988/)
- Jolliffe e.a. 2024, [Lancet Diabetes Endocrinol](https://www.thelancet.com/journals/landia/article/PIIS2213-8587(24)00348-6/fulltext)
- Endocrine Society 2024, [JCEM](https://academic.oup.com/jcem/article/109/8/1907/7685305)
- Morton e.a. 2018, [BJSM (pdf)](https://elementssystem.com/wp-content/uploads/2018/03/Morton-protein-review.pdf)
- Reynolds e.a. 2019, [Lancet](https://www.thelancet.com/article/S0140-6736(18)32468-1/abstract)
- Filippini e.a. 2020, [JAHA (PMC7429027)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7429027/)
- Bolland e.a. 2015, [BMJ (PubMed 26420387)](https://pubmed.ncbi.nlm.nih.gov/26420387/)
- WHO, [Sodium reduction](https://www.who.int/news-room/fact-sheets/detail/sodium-reduction)
