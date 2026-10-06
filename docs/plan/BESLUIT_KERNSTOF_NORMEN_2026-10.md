# Besluit: kernstoffen rekenen met de Nederlandse norm per persoon, niet met de etiket-RI

**Datum:** 4 oktober 2026
**Status:** besloten (Dennis, 4 okt: "Akkoord" na voorlegging van het onderzoek)
**Raakt:** het tekortsysteem (`nutrition-tekortsysteem.ts`), weekoverzicht en trend in Patroon, agenda-voorstellen, de krans in het dagboek
**Bouwt voort op:** `BESLUIT_DOELEN_VERBONDEN_2026-10.md` (plak 2: één bron voor doelen)

## Aanleiding

Dennis vroeg waar de percentages in de krans op gebaseerd zijn (omega-3 378%, zink 9%, vitamine D 60%). Antwoord: op de RI uit EU 1169/2011 bijlage XIII, en voor omega-3 op de EFSA-claimvoorwaarde. De RI is een etiketwaarde om producten te vergelijken, geen persoonlijke norm. Voor vitamine D is hij 5 µg, de helft van wat de Gezondheidsraad iedere volwassene aanbeveelt.

## Onderzoek

| Stof | Was (noemer) | Nederlandse norm | Bron |
|---|---|---|---|
| Magnesium | 375 mg (RI) | 350 mg man · 300 mg vrouw (AI) | Gezondheidsraad 2018, *Voedingsnormen vitamines en mineralen voor volwassenen* |
| Zink | 10 mg (RI) | 9 mg man · 7 mg vrouw | Gezondheidsraad 2018 (via Voedingscentrum) |
| Vitamine D | 5 µg (RI) | 10 µg; 20 µg vanaf 70 | Gezondheidsraad 2012 / Voedingscentrum |
| Omega-3 (EPA+DHA) | 250 mg (EFSA AI, claimvoorwaarde) | 200 mg (≈ 1× per week vette vis) | Gezondheidsraad 2001, *Voedingsnormen: energie, eiwitten, vetten en verteerbare koolhydraten* |

## Besluit

1. **Het dekkingsoordeel rekent met de Nederlandse norm voor deze persoon.** Bron: `src/data/nutrition/voedingsnormen.ts`, uitgelezen via `src/lib/nutrition-normen.ts`. Elk scherm met een dekkings-% of ✓ gebruikt die ene bron.
2. **Geslacht uit de check bepaalt magnesium en zink.** De server leidt de norm af (`laadVoedingsdoelenWeergave`); het geslacht zelf gaat niet naar de client. Geen geslacht of "anders" → de hogere waarde. Een hogere norm geeft minder vinkjes, en het vinkje is het enige wat het tekortsysteem mag bewijzen (asymmetrie-regel).
3. **Leeftijd telt (nog) niet mee.** De check vraagt leeftijd tot "55+", dus 70+ (vitamine D 20 µg) is niet te herkennen. Iedereen rekent met 10 µg.
4. **De etiketvermelding blijft %RI.** Productdetail en de voedingswaardetabel tonen %RI, want daar is het een samenstellingsvermelding en is de RI wettelijk voorgeschreven (art. 32 1169/2011). `reference-intake.ts` blijft daarvoor bestaan.
5. **De norm van de kernstoffen is niet zelf bij te stellen.** *Herzien 5 okt: profielchips + een eigen streefwaarde als tweede lijn; het ✓ blijft tegen de norm. Zie `BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`, plak 2.* Een zelf verlaagd doel zou een ✓ geven die het systeem niet kan onderbouwen, en dat ✓ voedt de route naar `/beste/*`. Eiwit blijft de uitzondering (eigen doel naast de PROT-AGE-richtlijn). Het Doelen-scherm toont per kernstof de norm en de bron, zonder invoerveld.
6. **De EFSA-claimdrempel voor omega-3 (250 mg) blijft voor claims.** Wat een product op `/beste/*` mag claimen, rekent tegen de claimvoorwaarde in `approved-claims.ts`, niet tegen deze norm.

## Afgewezen

- **De RI als persoonlijke norm houden.** Wettelijk juist op een etiket, inhoudelijk onjuist voor een persoon; bij vitamine D een factor 2 te laag.
- **Kernstof-normen vrij instelbaar op Je doelen.** Zie punt 5.
- **Bij onbekend geslacht de vrouwennorm of een gemiddelde.** Geeft vinkjes die voor een deel van de groep niet kloppen.

## Gevolgen

- Dekkingspercentages verschuiven: vitamine D halveert, magnesium en zink stijgen licht, omega-3 stijgt met 25%.
- `gender` in `intake_sessions` was "content-personalisatie, geen scoring-input" (migratie 20260905090000). Het wordt nu ook gebruikt voor de norm van het dekkingsoordeel. Dat is geen scoring: de domeinscores van de check veranderen niet.

## Open

- **Weekweergave voor omega-3 en vitamine D in de krans** (plak 2b van `BESLUIT_DOELEN_VERBONDEN_2026-10.md`): één visdag geeft een dag-% van honderden procenten.
- **Leeftijd 70+** herkennen vraagt een fijnere leeftijdsband in de check.

## Herziening 6 oktober 2026 — hoogste officiële norm, één bron voor beide ringen

**Status:** besloten (Dennis, 6 okt: "Akkoord" op §6 van `REVIEW_NORM_EN_ONDERZOEK_PER_STOF_2026-10.md`). Omega-3 staat als open punt hieronder.

**Regel:** per stof de normen van Gezondheidsraad, EFSA en NNR2023 naast elkaar, bij verschil de hoogste (asymmetrie-regel). Peer-reviewed onderzoek bij gezonde mensen komt als aparte "onderzochte zone" in het stof-detail en verandert de norm niet.

| Stof | Was | Nu | Bron |
|---|---|---|---|
| Vitamine D | 10 µg | **15 µg**; 70+ 20 µg | EFSA 2016 (meerderheid gezonde volwassenen ≥ 50 nmol/L); GR 2012 voor 70+ |
| Omega-3 | 200 mg | **250 mg** ⚠ open | EFSA 2010 (GR 2026 bevestigde 200 mg, zie hieronder) |
| Zink | 9 / 7 mg | **13 / 10**; vegetarisch 14 / 11; veganistisch 16,3 / 12,7 | NNR2023; EFSA 2014 per fytaat (900 / 1200 mg) |
| Magnesium | 350 / 300 | ongewijzigd | GR 2018 = EFSA = NNR |
| IJzer (nieuw, buitenring) | RI 14 | **16 mg** zolang er menstruaties zijn of onbekend; 11 mg (man, of "nee") | GR 2018; NNR2023: kies op status, niet leeftijd |
| Calcium (buitenring) | RI 800 | **950–1200 mg** per leeftijd en geslacht | GR 2018 |
| Kalium (buitenring) | RI 2000 | **3500 mg** | GR 2018 / EFSA 2016 |
| Vitamine B12 (buitenring) | RI 2,5 | **4 µg** | EFSA 2015 / NNR2023 |
| Vitamine C (buitenring) | RI 80 | **110 / 95 mg** | EFSA 2013 / NNR2023 |

- **Punt 3 (leeftijd) herzien:** calcium gebruikt de leeftijdsband uit de check (onbekend → de hogere waarde); 70+ blijft de keuze in Je doelen.
- **Voedingswijze verandert nu wél een norm** (zink). Dat herziet de uitleg bij plak 2 van `BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`.
- **Menstruatie** wordt alleen gevraagd als het geslacht voor de norm "vrouw" of "anders" is (Dennis, 6 okt). Zonder antwoord, of zonder geslacht: 16 mg. Opt-in in Je doelen, niet in de check: gezondheidsgegeven (AVG art. 9), DPIA-aanvulling volgt vóór het in de check komt. Migratie `20261006120000_kernstof_profiel_menstruatie.sql`.
- **Eén bron:** `voedingsnormen.ts` → `nutrition-normen.ts` (`STANDAARD_GEVOLGDE_NORMEN`, `normVoorVeld`) → server (`gevolgdeNormen`, `vraagtMenstruatie` in de weergave) → `useGevolgdeNormen()`. Binnenring, buitenring, Je doelen, Patroon (tabel, maaltijden, week, trend) en Agenda rekenen hiermee. De voedingswaardetabel toont de RI als etiketvermelding (`aandeelRi`).
- **Toetsing:** `NORMEN_GETOETST = "2026-10"`; een test faalt na twaalf maanden zonder herziening.

### Open: omega-3 (200 of 250 mg)

De Gezondheidsraad bevestigde in het advies *Voedingsnormen voor vetten, vetzuren, verteerbare koolhydraten en voedingsvezels* (7 juli 2026) een adequate inname van **200 mg** EPA+DHA voor volwassenen. EFSA (2010) zegt 250 mg. De regel "hoogste" geeft 250 mg en zo staat het nu in de code. Eerder in deze sessie werd 450 mg (GR 2006) genoemd. Dat was een richtlijn voor visconsumptie, geen voedingsnorm, en vervalt. Dennis beslist: 250 (regel) of 200 (recentste Nederlandse norm).

### Open: vezels

Het GR-advies van juli 2026 zet vezels op 3,0–3,5 g per MJ. Omrekenen naar gram per dag vraagt de energiebehoefte, en die kennen we niet. Daarom tot nader besluit geen norm voor vezels: het getal staat er, zonder vulling.
