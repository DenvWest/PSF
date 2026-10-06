# Review: norm én peer-reviewed onderzoek per stof — van één getal naar een bandbreedte

**Datum:** 6 oktober 2026
**Status:** besloten (Dennis, 6 okt: "akkoord met alles"). Gebouwd in PR #144; de geldende waarden staan in `BESLUIT_KERNSTOF_NORMEN_2026-10.md`.
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

> **Achterhaald door §6 en §6.6.** Deze paragraaf is de eerste versie, van vóór Dennis' beslissingen van 6 okt. Wat geldt, staat in §6 en in `BESLUIT_KERNSTOF_NORMEN_2026-10.md`. Belangrijkste verschillen: omega-3 is níét 450 mg (GR 2026 bevestigt 200 mg; in de code staat 250 mg, EFSA), magnesium heeft geen zone (alleen onderzoek bij gezonde mensen telt), en vitamine D is 15 µg.

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

---

## 6. Herziening na review (Dennis, 6 okt)

Dennis: geen medische termen en risicofactoren; alleen het sterkste bewijs bij gezonde mensen; vitamine D 15 µg als dat goed onderbouwd is bij gezonde mensen; zink afhankelijk van de voedingswijze; ijzer met cyclus en (peri)menopauze; nieuwe waarden in beide ringen én in Doelen, check en Patroon.

### 6.1 De poort wordt strenger: alleen gezonde mensen

- **De onderzochte zone komt alleen uit onderzoek bij gezonde volwassenen.** Studies bij patiënten of risicogroepen (hoge bloeddruk, lage magnesiumspiegel, cognitieve achteruitgang, diabetes) tellen niet mee, ook niet "met de doelgroep erbij". Dat vervangt niveau 2 uit §1.
- **Een zone vraagt GRADE matig of hoger bij gezonde mensen.** Lager: alleen in de bronnenlijst.
- **Geen medische termen in de app.** Uitkomsten in gewone taal ("verwerkingssnelheid", "vitamine D-spiegel in het bloed"), geen ziektenamen, geen risicoreductie-percentages.
- **Normen zelf** (GR/EFSA/NNR) gaan over gezonde mensen en blijven de ondergrens.

### 6.2 Per stof, opnieuw door de strengere poort

| Stof | Norm (nieuw) | Sterkste bewijs bij gezonde mensen | Zone |
|---|---|---|---|
| **Vitamine D** | **15 µg** (EFSA 2016); 70+: 20 µg (GR 2012) | EFSA 2016, meta-regressie bij gezonde volwassenen: bij 15 µg haalt de meerderheid een bloedspiegel van ≥ 50 nmol/L. Cashman e.a. 2008, Ierse winter (breedte vergelijkbaar met NL): 10 µg → 50%, 20 µg → 90–95% boven 50 nmol/L. Dit bewijs gaat over de **spiegel**, niet over ziekte-uitkomsten. Voldoet aan Dennis' voorwaarde | Geen zone erboven: VITAL (gezonde 50+, 50 µg/d) liet op de hoofduitkomsten geen effect zien |
| **Omega-3** | **450 mg** (GR 2006) | Shahinfar 2025, subgroep van 32 RCT's bij cognitief gezonden: verwerkingssnelheid SMD 0,49 (**GRADE matig**), plateau rond 1500 mg; algemene cognitie niet significant. Suh e.a. 2024, *BMC Med*: 24 RCT's, n = 9.660, 40+ zonder dementie: alleen executieve functie, vanaf > 500 mg/d; ongunstige curve boven 420 mg EPA of na 12 maanden. VITAL (1 g/d, gezond): geen effect op de hoofduitkomsten | **500–1500 mg**, zekerheid matig voor één uitkomst (verwerkingssnelheid). Met de kanttekening uit Suh 2024 erbij |
| **Magnesium** | 350 / 300 mg (ongewijzigd) | Hypertension 2025: bij mensen met normale bloeddruk geen significant effect. Slaap: review 2026, zekerheid laag tot zeer laag | **Geen zone** (vervalt t.o.v. §3) |
| **Zink** | Alles: **13 / 10 mg** (NNR2023). Vegetarisch/veganistisch: EFSA bij hoog fytaat ⚠ waarde aflezen | Foster e.a. 2013, *J Sci Food Agric*: 34 studies; vegetariërs eten 0,9 mg/d minder zink en hebben een lagere serumzinkspiegel. Het effect is groter bij veganisten en bij vrouwen. Dit gaat over de **behoefte**, precies waar een norm over gaat | Geen zone |
| **IJzer** | Menstrueert: **16 mg** (GR 2018; NNR2023: 15). Niet meer: **11 mg** (GR 2018; NNR2023: 9). Hoogste genomen | NNR2023: kies op **status, niet leeftijd**. Op 51 jaar menstrueert de helft nog, op 70 niemand meer. Perimenopauze: geen enkele bron heeft een aparte norm, dus "onregelmatig" = 16 mg (asymmetrie-regel). Haider e.a. 2018: vegetariërs hebben lagere ferritine (−29,7 µg/L; premenopauzaal −17,7) | Geen zone. Meer is niet beter. Voor vegetariërs geen aparte norm: de 1,8×-factor komt uit IOM 2001 en niet uit GR/EFSA/NNR ⚠. Wel een informatieregel |
| **Eiwit** | Ongewijzigd (`protein-target.ts`); 65+: ondergrens 1,2 g/kg (NNR2023) | Morton 2018: gezonde volwassenen met krachttraining, plateau rond 1,6 g/kg | 1,2–1,6 g/kg bij krachttraining (doel dekt dit al) |
| **Vitamine B12** | **4 µg** (EFSA 2015 / NNR2023) | — | — |
| **Vitamine C** | **110 / 95 mg** (EFSA 2013 / NNR2023) | — | — |
| **Kalium** | **3500 mg** (GR 2018 / EFSA 2016) | Filippini 2020 gaat over bloeddruk en valt dus af | Geen zone |
| **Calcium** | GR 2018 per leeftijd en geslacht (950–1200 mg) | — | Geen zone |
| **Vezels** | 30–40 g ⚠ (GR) | Reynolds 2019: cohorten en trials in de algemene bevolking; de uitkomsten zijn ziekte-uitkomsten en vallen dus af | Geen zone |

### 6.3 Waar iemand dit invult

- **Je doelen (sectie Kernstoffen, PR #141)** krijgt er één keuze bij: **"Menstrueer je?" — ja / onregelmatig / nee**. Alleen zichtbaar bij Vrouw. Daarnaast blijven geslacht, 70+ en voedingswijze. Zink volgt de voedingswijze die er al is.
- **Privacy:** menstruatie is een gezondheidsgegeven (AVG art. 9). Dat vraagt uitdrukkelijke toestemming, een uitleg waarom we het vragen, en een aanvulling op de DPIA (die wacht al op de jurist, zie compliance-status). Daarom **eerst opt-in in Je doelen** en **nog niet in de voedingscheck**. Zonder antwoord geldt 16 mg (hoogste, asymmetrie-regel).
- **Later in de voedingscheck**, zodat het resultaat-dashboard vanaf het begin klopt: pas na akkoord van de jurist op de DPIA-aanvulling. Dan schrijft de check hetzelfde profielveld (`account_kernstof_profiel`) en is er geen tweede opslag.

### 6.4 Eén bron voor alle schermen

- `nutrition-normen.ts` wordt de enige bron voor **beide** ringen. Nieuw: `normVoorVeld(veld, profiel)` voor de gevolgde stoffen (B12, C, kalium, calcium, ijzer, zink, vezels) naast de bestaande kernstofnormen.
- Consumenten die nu de etiket-RI (`.ri`) gebruiken, gaan over op die norm: krans (buitenring), `nutrition-voedingswaarde`, `nutrition-gevolgde-weken`, `nutrition-maaltijd-patroon`, `PatroonGevolgdWeek`, `PatroonTrend`. Kernstof-consumenten (krans binnen, Doelen, Patroon-tabel/-detail/-maaltijden, Agenda, tekortsysteem) lopen al via `nutrition-normen` en krijgen de nieuwe waarden vanzelf.
- **De etiket-RI blijft alleen in de voedingswaardetabel**, als "% RI (etiket)". Dat is de wettelijke context.
- **Gevolgde stoffen blijven zonder oordeel**: geen ✓, geen telling. Alleen de noemer verandert van RI naar norm.

### 6.5 Volgorde van bouwen (na akkoord)

1. **Normen + één bron** (`voedingsnormen.ts`, `nutrition-normen.ts`, `getoetst`-test); alle schermen rekenen mee. Besluit `BESLUIT_KERNSTOF_NORMEN_2026-10.md` herzien.
2. **Je doelen:** menstruatie-keuze + uitleg + toestemming; migratie op `account_kernstof_profiel` (in `OPENSTAAND.md`, blokkeert de deploy niet: zonder antwoord 16 mg).
3. **Krans (#139):** midden "nog X tot je norm vandaag" en de buitenring tegen de norm.
4. **Stof-detail:** balk met norm · zone · bovengrens · eigen streefwaarde + `onderzoek-per-stof.ts`.
5. **Voedingscheck:** pas na de DPIA-aanvulling.

### Extra bronnen bij §6

- EFSA 2016, [DRV vitamine D](https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2016.4547)
- Suh e.a. 2024, [BMC Med (PMC10929146)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10929146/)
- Manson e.a. 2019, VITAL — [Circ Res-overzicht](https://www.ahajournals.org/doi/10.1161/CIRCRESAHA.119.314541)
- Foster e.a. 2013, [Effect of vegetarian diets on zinc status](https://www.researchgate.net/publication/236225258_Effect_of_vegetarian_diets_on_zinc_status_A_systematic_review_and_meta-analysis_of_studies_in_humans)
- Haider e.a. 2018, [Vegetarian diets and iron status](https://www.semanticscholar.org/paper/The-effect-of-vegetarian-diets-on-iron-status-in-A-Haider-Schwingshackl/8376ebf7fb44f6f5ee2f08596b08fc324f43ffba)
- NNR2023, [ijzer](https://pub.norden.org/nord2023-003/iron.html)
- Magnesium en slaap, [systematische review 2026 (PubMed 42661485)](https://pubmed.ncbi.nlm.nih.gov/42661485/)

### 6.6 Correctie (6 okt): omega-3 en vezels — GR-advies juli 2026

- In §3 en §6.2 staat omega-3 "verouderd, naar 450 mg (GR 2006)". **Dat klopt niet.** De 450 mg uit 2006 was een richtlijn voor visconsumptie (2× per week vis), geen voedingsnorm. Het advies *Voedingsnormen voor vetten, vetzuren, verteerbare koolhydraten en voedingsvezels* (Gezondheidsraad, 7 juli 2026) **bevestigt 200 mg EPA+DHA** als adequate inname voor volwassenen. EFSA (2010) zegt 250 mg. Volgens de regel "hoogste" staat in PR #144 nu 250 mg. Open voor Dennis: 250 (regel) of 200 (recentste Nederlandse norm).
- Vezels: hetzelfde advies zet de norm op **3,0–3,5 g per MJ**. Zonder de energiebehoefte is dat niet om te rekenen naar gram per dag, dus voorlopig geen norm voor vezels.
- Bronnen: [GR-advies 7 juli 2026](https://www.gezondheidsraad.nl/documenten/2026/07/07/advies-voedingsnormen-voor-vetten-vetzuren-verteerbare-koolhydraten-en-voedingsvezels), [Nieuws voor diëtisten](https://www.nieuwsvoordietisten.nl/herziene-voedingsnormen-voor-vetten-koolhydraten-en-vezels/), [Voedingscentrum](https://www.voedingscentrum.nl/nl/nieuws/nieuwe-aanbevelingen-vetten-koolhydraten-vezels.aspx).
