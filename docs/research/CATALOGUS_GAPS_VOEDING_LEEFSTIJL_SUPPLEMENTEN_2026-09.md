# Catalogus-gaps — voeding, leefstijl, supplementen (sep 2026)

## 0. Besluit in 8 regels

1. **Bouw geen achtste `/beste/*` deze kwartaal.** Het grootste gat is niet een ontbrekend supplement maar de zwakte van de check die je al hebt: vitamine D en magnesium staan op `confidence: 1` in `intake-reference.ts` — dat ondermijnt elke aanbeveling die eruit rolt.
2. **Doe wél nu: een `/beste/vitamine-d3-k2`-uitbreiding binnen de bestaande vitamine-D-pagina, geen nieuwe URL.** K2 heeft een geautoriseerde EFSA-botclaim, Vitaminstore voert D3+K2 (Daisycon-dekking bevestigd), en de query is commercieel — maar het is een variantkeuze op een stof die je al hebt, geen nieuw schap.
3. **B12 wordt een gids + kennisbank-term, nooit een `/beste/`.** NL-praktijk stuurt een vermoed tekort naar de huisarts; een vergelijkingspagina daarop is de statusclaim die je nergens anders maakt.
4. **Ashwagandha: begin nu met sunset-planning, niet met groei.** VWS wil verbieden, TRIS-notificatie loopt, mogelijke ingang 1 jan 2027 met uitverkoop tot 1 jul 2027. Zet een beslismoment op de kalender, geen contentinvestering.
5. **Cafeïne-timing is de sterkste leefstijl-gap — maar als content, niet als ladderitem:** de slaap-ladder heeft de actie al, de uitleg eromheen ontbreekt volledig. Hoge doelgroepfit, geen schap nodig, raakt slaap én energie zonder een claim te maken.
6. **De hele longevity-plank valt af**: NMN, resveratrol, Q10, berberine, tongkat ali, fadogia, testoboosters, pre-workout, GABA, 5-HTP, apigenine. Geen EFSA-grond, en het is precies waar je positionering tegen is gebouwd.
7. **Multivitamine: nee als product, ja als opiniestuk.** De SERP is verzadigd met affiliate-top-10's; jouw winst zit in "waarom wij geen multivitamine aanbevelen" — dat is Tier-4-content uit `SEO_RULES.md` en het scherpste Consumentenbond-signaal dat je goedkoop kunt afgeven.
8. **Geen food-affiliate, geen slaapomgeving-affiliate, geen wearable-affiliate** tenzij je die knop bewust omzet — vraag 1 in §9.

---

## 1. Staat van de catalogus

Geverifieerd tegen de bestanden, niet tegen geheugen.

**Vergelijkingen (7).** `src/lib/comparison-paths.ts`: magnesium, omega-3-supplement, zink, creatine, vitamine-d, eiwitpoeder, ashwagandha. Elk met exact 3 affiliate-producten in `affiliate-links.ts` (21 links totaal), behalve omega-3 met 6.

**Gidsen (8).** `src/data/supplement-guides/`: bovenstaande 7 + melatonine (informatief, `comparisonPath: null`).

**Engine-catalogus (6).** `SUPPLEMENT_CATALOG`: omega-3 (prio 1), magnesium-glycinaat (2), zink (4), eiwitpoeder (15), creatine (20), vitamine-d3 (50, `fallbackOnly`). **Ashwagandha ontbreekt hier bewust** — de route bestaat, de engine beveelt hem niet aan.

**EFSA-status** (`approved-claims.ts`): 5× `approved` (magnesium, omega3, vitamineD, zink, creatine), eiwitpoeder approved-zonder-claims, ashwagandha `on_hold`, melatonine `forbidden`.

**Voedingscheck.** 5 `NutrientId`: protein, omega3, magnesium, vitamin_d, zinc. Confidence-scores: protein 4, omega3 3, zinc 2, **magnesium 1, vitamin_d 1**. Drie lifestyle-extras buiten de vijf: `fiber_low_wholegrain`, `b12_vegan`, `sugar_high_signal`.

**Food-sources: 79 rijen**, allemaal `verified: false`. Bevat al — en dit sneuvelt de halve wishlist — havermout, eieren, sardines, ansjovis, sprot, pure chocolade, tahin, volkorenbrood, verrijkte plantaardige drank, verrijkte eieren, UV-paddenstoelen, quinoa, tempé, tofu, seitan, skyr, huttenkäse, zonlicht.

**Curated productgroepen (5):** vette vis, olijfolie EV, peulvruchten, noten, kwark & skyr.

**Ladders:** slaap, stress, beweging, verbinding — elk 6 lagen. Slaap L3 dekt al "daglicht, cafeïne, alcohol, beweging, avond"; slaap L4 dekt slaapomgeving; beweging L1 dekt zitgedrag.

**Kennisbank: 25 termen.** **Blogs: 27.** **Pillars: 7 live**, `/supplementen-mannen-40` gepland.

**Locks die dit memo respecteert.** Stress = `lifestyle_first` (`domain-product-stance.ts`). Verbinding = nooit schap (`COMPLIANCE.md`, kill-lijst). Melatonine = `forbidden`. Omega-3 = geen energie-claim. Inname mag, status niet. Tier 4-5 klinisch = referral-only, niets opslaan, niets duiden.

---

## 2. Methode

**Evidence-bar.** A = geautoriseerde EFSA-claim die op onze domeinen past én NL-verankering (Gezondheidsraad/Voedingscentrum). B = Cochrane/grote RCT-meta bij 40+ op slaap, herstel, energie, spiermassa of cardiometabool, zonder verboden claimtaal. C = mechanisme + zwakke of gemengde trials. D = hype, influencer-stack, on-hold botanical, of medisch terrein.

Alleen A en sterke B mogen "nu". C = content-only. D = niet-lijst.

**Bronnen die ik heb gebruikt.** `docs/research/DEEPRESEARCH_micro_marco_nutriëntstatus_bij_mannen_>40jaar.md` (intern, met PMID/DOI-referentielijst) als evidence-ruggengraat; EU Register on nutrition and health claims; RIVM/VWS-berichtgeving via NPN en Nutri-Sana; Voedingscentrum; de bestaande `supportingEvidence`-rijen in `approved-claims.ts`.

**SEO-proxies — eerlijk over wat dit is.** Ik heb geen Keyword Planner-toegang. Wat ik wél heb gedaan: NL-SERP's opgehaald voor elke overlevende kandidaat en gekeken wie er staat. **Volumes noem ik daarom niet in getallen** — een verzonnen "2.400/mnd" is erger dan geen getal. In plaats daarvan beoordeel ik per query op **SERP-type** (wie bezet de top 10) en **winbaarheid** (kun jij daar iets bieden dat zij niet bieden).

Wat de SERP-scan opleverde en wat het betekent: elke commerciële supplementquery in NL (B12, collageen, multivitamine, elektrolyten, algenolie, D3+K2) is bezet door dezelfde laag affiliate-vergelijkers — nutribites.nl, leefpuurnatuur.nl, puurfiguur.nl, volgensconsument.nl, besteconsumenten.nl — plus bol.com. Dat is geen zwakke concurrentie, dat is een *verzadigde* categorie waar iedereen hetzelfde doet. **De implicatie voor strategie is groter dan voor keuze per kandidaat: je wint daar niet met nóg een top-10, alleen met iets wat zij structureel niet kunnen — een oordeel dat aan een persoonlijk profiel hangt, en het lef om "nee" te zeggen.** Precies wat `BRAND_POSITIONING.md` §5 al als publiek onderscheid aanwijst.

**Scoreformule.** `(evidence × 3) + (doelgroepfit × 2) + (SEO × 2) + monetisatie + stepped-care + effort`, elk 1–5, effort 5 = licht. Max 65.

---

## 3. Ranked: NU (max 8)

### 1. Vitamine D-check herijken op seizoen (score 56)

**Laag:** voeding (check-integriteit).

**Waarom essentieel.** Dit is geen contentgat maar een geloofwaardigheidsgat, en het is het enige item op deze lijst dat de kwaliteit van *alle andere* adviezen bepaalt. De check schat vitamine D op "hoe vaak kom je buiten per week" en scoort zichzelf op `confidence: 1` met de eerlijke toelichting: *"Aanmaak hangt af van duur, tijdstip en seizoen — hoe vaak je buiten komt zegt daar weinig over."* In Nederland is dat verschil niet marginaal: tussen oktober en maart staat de zon te laag voor relevante aanmaak, dus dezelfde vier keer buiten levert in januari vrijwel niets en in juli genoeg. De check geeft nu in beide gevallen dezelfde band. `portion-dictionary.ts` splitst de *copy* al op seizoen (`buildLifestyleAction("vitamin_d", { season: "summer" })`) — de *drempel* niet. Die inconsistentie zit al in de code en is precies wat de TODO in `intake-reference.ts` vraagt.

**Evidence: A.** Gezondheidsraad, *Evaluatie voedingsnormen vitamine D* (2012) — suppletie-advies voor risicogroepen, waaronder "weinig buiten"; Voedingscentrum-advies 10 µg/dag voor mannen 70+ en risicogroepen; Orwoll et al., *JCEM* 2009;94(4):1214-22 (PMID 19174492) — deficiëntie 26% / insufficiëntie 72% bij oudere mannen, met winter/voorjaar als expliciete risicofactor; Harju et al., *Eur J Nutr* 2022 (PMC9596536) — 30% insufficiëntie zelfs bij elite-atleten, hoger bij hoge breedtegraad en winter/voorjaar. De EFSA-claims zelf staan al letterlijk in `approved-claims.ts`.

**SEO NL.** Geen. Dit is bewust geen SEO-item — het is productkwaliteit. Wél indirect: `/onderbouwing` en `/methodologie` worden er sterker van, en die dragen je Consumentenbond-claim.

**Monetisatie.** Geen directe. Indirect het tegenovergestelde van een risico: een vitamine-D-suggestie in juli op basis van een winterproxy is precies de fout waar je concurrenten op aanspreekt.

**Insertiepunt.** Primair: `thresholds` + `confidenceWhy` van `vitamin_d` in `src/data/nutrition/intake-reference.ts`, op de seizoens-as die de copy al kent. Secundair: één regel in `/onderbouwing/voeding` die uitlegt dát je op seizoen corrigeert.

**Effort: M.** Geen nieuw `NutrientId`, geen scoring-wijziging, geen migratie. Wel een bewuste keuze over de winter-drempel en een test.

**Wat het niet is.** Geen bloedwaarde, geen statusclaim, geen "je hebt een tekort". Het blijft een inname-/blootstellingsinschatting — alleen een die het seizoen niet meer negeert.

---

### 2. Cafeïne-timing als blog onder de slaap-pillar (score 51)

**Laag:** leefstijl.

**Waarom essentieel.** Let op: de ladder dekt dit al beter dan ik aanvankelijk aannam. `src/data/sleep/lifestyle-priorities.ts` laag 3 heeft de actie *"Verschuif je laatste cafeïne twee uur naar voren en kijk wat er gebeurt"* en de summary noemt de nawerking van ongeveer acht uur. **Het ladderitem is dus niet het gat — de content eromheen wel.** Er is geen enkele pagina die cafeïne-timing uitlegt, terwijl het de goedkoopste, best onderbouwde slaapinterventie is die bestaat en je twee grootste domeinen tegelijk raakt: slechte slaap en de middagdip die je al beschrijft in `/blog/middagdip-bloedsuiker-na-40`. Voor de doelgroep is het pijnlijk herkenbaar — de derde koffie vóór 14:00 staat letterlijk al als profiel-copy voor Lage Batterij in `BRAND_POSITIONING.md`. Je hebt de herkenning geschreven en de ladderactie gebouwd, maar nergens uitgelegd *waarom* twee uur eerder iets doet. Dat is stepped-care in zuivere vorm: een gratis gedragsverandering die een supplementvraag *wegneemt* in plaats van opwekt, en de blog is wat die actie geloofwaardig maakt.

**Evidence: B (sterk).** Drake et al., *J Clin Sleep Med* 2013;9(11):1195-1200 (PMID 24235903) — 400 mg cafeïne 0, 3 en 6 uur vóór bed verstoorde slaap meetbaar, óók bij 6 uur van tevoren, en deelnemers merkten die verstoring zelf niet op. Dat laatste is precies het mechanisme dat je copy nodig heeft. Clark & Landolt, *Sleep Med Rev* 2017;31:70-78 (PMID 27612937) — systematische review cafeïne en slaap. Gardiner et al., *Sleep Med Rev* 2023;69:101764 — meta-analyse dosis/timing-effecten. Halveringstijd 5–6 uur is standaard-farmacokinetiek, geen claim.

**SEO NL.** Primary: *"koffie en slaap"* / *"tot hoe laat koffie drinken"* — informational, en dat is hier een voordeel: geen affiliate-vergelijkers om tegenop te boksen, de SERP is redactioneel. Gerelateerd: "cafeïne halveringstijd", "hoe lang blijft cafeïne in je lichaam", "koffie slecht voor slaap", "laatste koffie van de dag", "cafeïne en slaapkwaliteit". **Kannibalisatie:** raakt `/blog/alcohol-slaap-energie-na-40` en `/blog/middagdip-bloedsuiker-na-40` — die twee worden versterkt, niet verdrongen: alcohol en cafeïne zijn de twee helften van hetzelfde avond-/dag-verhaal en linken naar elkaar. Geen `/beste/` — er valt niets te vergelijken.

**Monetisatie.** Geen affiliate, en dat hoort zo (`AFFILIATE_SYSTEM.md`: geen affiliate in blogs). Funnel: naar `/intake` en `/slaap-verbeteren-na-40`.

**Insertiepunt.** Primair: `/blog/cafeine-en-slaap-na-40` onder de slaap-pillar. Secundair: de bestaande ladderactie in laag 3 naar die blog laten linken — de actie staat er al, de onderbouwing ontbreekt.

**Effort: S.** Eén blog + een link. Geen nieuwe ladderrij, geen route-infrastructuur.

**Wat het niet is.** Geen "stop met koffie" — dat is de kleinerende toon die `WRITING_VOICE.md` verbiedt. Het is een timing-advies met een tijdstip, en cafeïne is verder gewoon prima.

---

### 3. Opiniestuk: waarom wij geen multivitamine aanbevelen (score 49)

**Laag:** supplement (als weigering).

**Waarom essentieel.** Dit is de goedkoopste manier om je hele positionering uit te dragen, en het is de enige plek in dit memo waar een verzadigde SERP jóuw voordeel is. "Beste multivitamine" is in NL volledig bezet door affiliate-top-10's die allemaal hetzelfde doen: 12 tot 41 producten "getest", altijd een winnaar. Niemand zegt dat de categorie zelf zwak is. `SEO_RULES.md` heeft hier al een contenttier voor (Tier 4 — Opiniestukken, met exact dit voorbeeld: *"Waarom de meeste multivitamines geldverspilling zijn"*), en `BRAND_POSITIONING.md` §5 wijst uitsluitingen aan als publiek onderscheid. Het stuk schrijft zichzelf uit materiaal dat je al hebt: je engine beveelt gerichte stoffen aan op basis van een profiel — dat ís het argument tegen de shotgun-aanpak.

**Evidence: B.** Guallar et al., *Ann Intern Med* 2013;159(12):850-1 (PMID 24490268), "Enough Is Enough: Stop Wasting Money on Vitamin and Mineral Supplements" — het redactionele standpunt bij drie trials. Fortmann et al., *Ann Intern Med* 2013;159(12):824-34 (PMID 24217421) — USPSTF-review: geen duidelijk voordeel van multivitamines op CVD of kanker bij niet-deficiënte volwassenen. USPSTF 2022 statement, *JAMA* 2022;327(23):2326-2333 — onvoldoende bewijs, en een expliciete aanbeveling *tegen* bèta-caroteen en vitamine E. Gezondheidsraad/Voedingscentrum: gerichte suppletie voor risicogroepen (vitamine D, B12), geen algemeen multivitamine-advies.

**SEO NL.** Primary: *"heb je een multivitamine nodig"* / *"is een multivitamine zinvol"* — informational, en bewust *niet* "beste multivitamine man": die query wil een koopbeslissing en jij hebt geen product. Gerelateerd: "multivitamine zin of onzin", "multivitamine of losse vitamines", "wat zit er in een multivitamine", "multivitamine mannen 40". **Kannibalisatie:** geen — dit terrein is leeg in je eigen catalogus. Het wordt wél een natuurlijke inbound-link voor `/supplementen`, `/methodologie` en straks `/supplementen-mannen-40`. **Geen `/beste/`, ooit.**

**Monetisatie.** Nul, expliciet. Dat is het punt. Funnel naar `/intake`: "in plaats van alles een beetje, kijk wat jóuw profiel vraagt."

**Insertiepunt.** Primair: `/blog/multivitamine-zinvol-na-40` (Tier-4 opiniestuk). Secundair: kennisbank-term `multivitamine` als neutrale definitie waar het stuk naar linkt.

**Effort: S.**

**Wat het niet is.** Geen "supplementen zijn onzin" — dat ondergraaft je eigen 7 vergelijkingen. Het argument is precies afgebakend: *gericht op basis van een profiel* verslaat *alles tegelijk op de gok*.

---

### 4. Vitamine K2 als variantkeuze bínnen /beste/vitamine-d (score 47)

**Laag:** supplement.

**Waarom essentieel.** Dit is de enige kandidaat op de hele lijst met een échte geautoriseerde EFSA-claim die je nog niet gebruikt, en de enige met bevestigde merchant-dekking op een stof die je al voert. In de praktijk kóópt de doelgroep D3+K2 als één product — Vitaminstore voert het als eigen merk, in druppels en softgels, en VitalNutrition publiceert er zelf een vergelijking over. Je vitamine-D-pagina negeert die realiteit nu. Belangrijk: dit is bewust géén nieuwe URL. K2 alleen is een nichestof zonder eigen zoekintentie bij jouw doelgroep; K2 *als variant van de vitamine D die hij al overweegt* is een echte keuzevraag.

**Evidence: A.** EU Register on nutrition and health claims: *"Vitamine K draagt bij tot de instandhouding van normale botten"* en *"draagt bij tot de normale bloedstolling"* — beide geautoriseerd (EFSA Journal 2009;7(9):1228, ID 123/127/128/2879 voor bot, ID 124/126 voor stolling). **Let op de grens:** de hart- en bloedvaten-claim voor K2 is door EFSA expliciet *afgewezen* (EFSA Journal 2012;10(3):2714, ID 125) — die mag dus nergens in de copy staan, en dat verschil hardop benoemen is exact het soort claim-check dat je onderscheidt. Bestaande vitamine-D-claims staan al letterlijk in `approved-claims.ts`. Combineert met de bestaande `vitamineD.calcium-phosphorus`-claim.

**SEO NL.** Primary: *"vitamine D3 K2 kopen"* / *"beste vitamine D3 K2"* — commercial investigation. Gerelateerd: "vitamine D met of zonder K2", "K2 MK-7 dosering", "waarom D3 met K2", "vitamine K2 wanneer innemen", "D3 K2 druppels of capsules". SERP-type: nutribites, leefpuurnatuur, volgensconsument, plus VitalNutrition zelf — verzadigd met top-10's, maar je concurreert hier vanaf een pagina die al autoriteit heeft in plaats van vanaf nul. **Kannibalisatie: reëel en de reden voor de vorm.** Een losse `/beste/vitamine-k2` zou `/beste/vitamine-d` én `/supplementen/vitamine-d` aanvallen. Als sectie + FAQ binnen de bestaande pagina versterkt het beide.

**Monetisatie: ja.** Vitaminstore D3+K2 (eigen merk, softgels én druppels), Vitortho-combinaties, NOW-varianten — Daisycon-dekking, ≥3 producten, meerdere merken. Arctic Blue blijft waar het hoort: omega-3. Nieuwe slugs erbij in `affiliate-links.ts` volgens de drie-plekken-regel uit `AFFILIATE_SYSTEM.md`.

**Insertiepunt.** Primair: variantsectie + FAQ-rijen in `src/data/supplements/vitamine-d.ts`, geen nieuw pad. Secundair: kennisbank-term `vitamine-k2` — inclusief de afgewezen hartclaim, dat is de scherpste alinea.

**Effort: M.** Productselectie, affiliate-slugs op drie plekken (mismatch = build failure), claim-copy letterlijk.

**Wat het niet is.** Geen nieuwe `/beste/`-route, geen hartclaim, geen "D3 werkt niet zonder K2" — dat is de overclaim die de hele niche maakt en die EFSA juist heeft afgewezen.

---

### 5. Ashwagandha-sunset: beslismoment vastleggen (score 45)

**Laag:** supplement (afbouw).

**Waarom essentieel.** Dit staat op de "nu"-lijst als risicobeheersing, niet als groei — en het is het enige item met een externe deadline die niet van jou is. De stand per september 2026, zo precies als de bronnen toelaten: VWS heeft het voornemen ashwagandha te verbieden in de nieuwe Warenwetregeling voedingssupplementen en kruidenpreparaten; de TRIS-notificatie bij de Europese Commissie is **vertraagd** omdat RIVM nieuwe veiligheidsdata van NPN beoordeelt; ná notificatie volgt een standstill van zes maanden; bij ongewijzigde doorgang is de genoemde ingangsdatum **1 januari 2027** met uitverkoop tot **1 juli 2027**. Dat is een voornemen in procedure, geen kracht van wet — de secundaire bronnen die "definitief besluit" schrijven, lopen vooruit. Maar de planningsconsequentie is er ongeacht de afloop: je hebt een vergelijkingspagina met 3 affiliate-producten die binnen ~16 maanden onverkoopbaar kan zijn.

Wat dit *niet* moet worden: paniek of stille verwijdering. Je engine beveelt ashwagandha al niet aan, je hebt het al uitgesloten van de Foundation Stack, en `COMPLIANCE.md` documenteert het risico. Je bent hier verder dan wie dan ook in de markt. De actie is klein: de datums vastleggen, en de disclaimer bijwerken naar de feitelijke stand.

**Evidence: D voor het product (on-hold botanical, geen EFSA-claim), A voor het regulatoire feit.** RIVM-advies tegen gebruik van producten met Withania somnifera (leverschade, hormoonspiegels; Lareb-meldingen); VWS-standpunt dat beschikbare studies onvoldoende inzicht geven in toxicologische levereffecten; NPN-berichtgeving over de vertraagde notificatie en de nieuwe veiligheidsdata; Denemarken verbiedt sinds april 2023.

**SEO NL.** Geen nieuwe query. Wél: de bestaande pagina's krijgen een feitelijke statusupdate, en dát is content die niemand anders levert — "wat betekent het aangekondigde verbod voor jou" is een vraag die de hele NL-markt gaat krijgen en waar de webshops zullen zwijgen.

**Monetisatie.** Bestaande links intact tot er een besluit is; geen uitbreiding, geen nieuwe producten, geen contentinvestering die je bij een verbod weggooit.

**Insertiepunt.** Primair: `note` in `approved-claims.ts` + `ON_HOLD_DISCLAIMER` bijwerken naar de feitelijke procedurele stand (nu staat er nog "besluit verwacht medio 2026" — dat is achterhaald). Secundair: één regel in `COMPLIANCE.md` met de drie datums en een herbeoordelingsmoment.

**Effort: S.**

**Wat het niet is.** Geen groeikans, geen "laatste kans om ashwagandha te kopen"-copy, en geen preventieve verwijdering van een pagina die vandaag legaal is.

---

### 6. Kalium-en-zout als voedingsextra (score 44)

**Laag:** voeding.

**Waarom essentieel.** Van alle voedingskandidaten is dit degene met de sterkste NL-verankering en het kleinste bouwwerk. Nederlandse mannen zitten structureel boven de 6 g zout per dag — méér dan vrouwen, blijkens RIVM-onderzoek — en de kaliuminname zit onder de aanbeveling. Het is bovendien één interventie voor twee kanten: minder natrium en meer kalium werken op dezelfde bloeddrukas. Je voedingscheck meet het niet en gaat het ook niet meten, maar de bronnen staan al in je food-sources (peulvruchten, groenten, banaan, avocado, aardappel via volkoren-cluster). Het past exact in de vorm die je al hebt: een `LifestyleExtraId` naast `fiber_low_wholegrain` en `sugar_high_signal` — geen nieuw nutriënt, geen supplement-gate.

**Evidence: A.** Voedingscentrum: maximaal 6 g zout/dag, haalbaar binnen de Schijf van Vijf; RIVM, *Natrium-, kalium- en jodiumonderzoek in Nederland* (rapport 2023-0373) — inname-stand per geslacht; Gezondheidsraad-richtlijn kalium; EFSA DRV kalium (AI 3500 mg/dag volwassenen). Ondersteunend: Filippini et al., *Circulation* 2021;143(16):1542-1567 — dosis-respons kalium en bloeddruk; Neal et al., *NEJM* 2021;385(12):1067-1077 (SSaSS) — natrium-kalium-zoutvervanger, harde uitkomsten.

**SEO NL.** Primary: *"minder zout eten tips"* / *"hoeveel zout per dag"* — informational, SERP is Voedingscentrum en Hartstichting, dus je wint hier geen positie 1 en dat hoeft ook niet. Dit item verdient zijn plek op productwaarde, niet op SEO. **Kannibalisatie:** geen; raakt `/voeding-na-40` als versterking.

**Monetisatie: nee, en bewust niet.** Elektrolytenpoeders zijn de commerciële vertaling hiervan en die staan op de niet-lijst (§5) — een zoutadvies dat in een poeder eindigt, is precies de omkering die je positionering breekt.

**Insertiepunt.** Primair: nieuwe `LifestyleExtraId` in `src/data/nutrition/nutrition-lifestyle-extras.ts`. Secundair: laag 2 van `NUTRITION_PRIORITY_LAYERS` noemt zout al in de samenvatting maar heeft er geen actie voor — daar één actie toevoegen.

**Effort: S.** Zelfde patroon als de drie bestaande extras.

**Wat het niet is.** Geen bloeddrukmeting, geen hypertensie-advies (dat is medisch → huisarts), geen elektrolytenproduct.

---

### 7. Vitamine B12 — gids zonder vergelijking (score 42)

**Laag:** supplement (informatief).

**Waarom essentieel.** B12 is de meest gezochte "tekort"-stof van Nederland en de enige waar je bestaande extra (`b12_vegan`) een halve behandeling geeft: het dekt veganisten en noemt bloedonderzoek, maar mist de groep die voor mannen 40+ juist relevanter is — langdurige metformine- en PPI-gebruikers. Dat is een substantiële groep in deze leeftijdscategorie, en de combinatie metformine+PPI is in de literatuur een expliciete red flag. `nutrition-lifestyle-extras.ts` heeft daar al een TODO voor staan: *"B12-trigger uitbreiden met health_flags (PPI/metformine) zodra intake-vraag bestaat."* De juiste vorm hier is de **melatonine-vorm**: een goede gids die uitlegt hoe het zit en waar de grens ligt, zonder koop-CTA — omdat de Nederlandse praktijk een vermoed B12-tekort naar de huisarts stuurt, met bloedonderzoek en eventueel injecties of hoge dosering op recept. Een `/beste/b12` zou impliceren dat jij die afweging voor hem maakt. Dat is de statusclaim die je nergens anders maakt.

**Evidence: A/B.** Voedingscentrum: opname van B12 uit voeding neemt af met de leeftijd; diagnose en behandeling via de huisarts. Gezondheidsraad: gerichte suppletie-adviezen voor specifieke groepen, geen algemeen advies. Niklewicz et al., *Nutrition Bulletin* 2024;49:463-479 (DOI 10.1111/nbu.12712) — meta-analyse functionele B12-status bij volwassen veganisten. Metformine-associatie: dosis- en duurafhankelijke verhoging van deficiëntierisico, versterkt door PPI-comedicatie. Van Wijngaarden et al., *J Nutr Metab* 2013;2013:486186 — B12/folaat/homocysteïne en botgezondheid. EFSA-claim bestaat wél ("draagt bij tot de vermindering van vermoeidheid en moeheid") — maar een claim hebben is geen reden een schap te openen als het pad naar de huisarts loopt.

**SEO NL.** Primary: *"vitamine B12 tekort symptomen"* — informational, en het is de query met de hoogste intentie van dit hele memo. Gerelateerd: "b12 tekort oorzaken", "metformine en b12", "b12 tekort test huisarts", "welke vorm b12 methylcobalamine", "b12 vegetarisch". SERP-type: **hier zit het onderscheid.** De top 10 op "beste vitamine B12" is bezet door affiliate-top-10's (nutribites, volgensconsument, leefpuurnatuur, deonlinedrogist, bol). De top 10 op *"b12 tekort symptomen"* is medisch/redactioneel — daar hoor je thuis, en daar kan een eerlijke gids die zegt "ga naar de huisarts" winnen op vertrouwen. **Kannibalisatie:** raakt `b12_vegan` in de extras (die wordt de trigger, de gids de landingsplek) en `/voeding-na-40`. Geen conflict met bestaande gidsen.

**Monetisatie: nee.** Geen affiliate, geen `/beste/`. Exact het melatonine-patroon: `comparisonPath: null`.

**Insertiepunt.** Primair: `/supplementen/b12` als 9e gids in `src/data/supplement-guides/`, zonder `productVergelijkingCta`. Secundair: `b12_vegan`-copy in de extras verbreden naar medicatiegebruik, en een kennisbank-term `vitamine-b12`.

**Effort: M.** Gids op de kwaliteitsdrempel uit `CONTENT_GAPS.md` (1200–2000 woorden + FAQ + ProfileFits). Een `health_flags`-intakevraag is **géén** onderdeel hiervan — dat is later (§4).

**Wat het niet is.** Geen `/beste/b12`, geen affiliate, geen "je hebt waarschijnlijk een tekort", en geen medicatie-advies — wie metformine of een PPI slikt, hoort dat met zijn arts te bespreken, niet met jou.

---

### 8. Ochtendlicht als sectie in de bestaande slaapritme-blog (score 41)

**Laag:** leefstijl.

**Waarom essentieel.** Zelfde patroon als cafeïne, inclusief dezelfde correctie: de ladderactie *bestaat al* — *"Ga binnen een uur na opstaan even naar buiten — bewolkt telt mee"* staat in laag 3. Wat ontbreekt is de uitleg. Je hebt `/kennisbank/circadiaan-ritme` staan om het mechanisme te dragen en je verbindt het nergens aan die actie. Voor een doelgroep die 's ochtends in het donker naar kantoor rijdt en 's avonds achter een scherm zit, is de lichtcurve omgekeerd, en in Nederland is dat een halfjaar per jaar structureel zo. Gratis, geen aankoop, en een van de weinige interventies die zowel inslapen als de ochtenddip raakt. Ik zet hem onder cafeïne omdat de zoekintentie zwakker is en de gedragsdrempel hoger — buiten gaan in november is een grotere vraag dan je laatste koffie verzetten.

**Evidence: B.** Blume et al., *Somnologie* 2019;23(3):147-156 (PMID 31534436) — licht, circadiane ritmes en stemming. Wright et al., *Curr Biol* 2013;23(16):1554-1558 (PMID 23910656) — natuurlijk licht verschuift de circadiane fase meetbaar. Duffy & Czeisler, *Sleep Med Clin* 2009;4(2):165-177 (PMID 20161220) — licht en circadiane regulatie bij veroudering, met de leeftijdsspecifieke component die deze doelgroep raakt.

**SEO NL.** Primary: *"ochtendlicht slaapritme"* / *"daglicht en slapen"* — informational, redactionele SERP, geen affiliate-concurrentie. Gerelateerd: "biologische klok resetten", "lichttherapie winter", "waarom word ik moe wakker", "slaapritme herstellen winter". **Kannibalisatie: let op.** Je hebt `/blog/slaapritme-herstellen` en `/blog/slaaphygiene-mannen-40-plus` al. Daarom: **geen nieuwe blog.** Ladderitem + een sectie in het bestaande `slaapritme-herstellen`-artikel, met een inline link naar `/kennisbank/circadiaan-ritme`.

**Monetisatie.** Geen — en let op de valkuil: dit is de plek waar de markt daglichtlampen verkoopt. Niet doen (§5).

**Insertiepunt.** Primair: uitbreiding van `/blog/slaapritme-herstellen` met een ochtendlicht-sectie + inline link naar `/kennisbank/circadiaan-ritme`. Secundair: de bestaande ladderactie daarheen laten linken. Geen nieuwe URL, geen nieuwe ladderrij.

**Effort: S.**

**Wat het niet is.** Geen lichttherapie-apparaat, geen winterdepressie-advies (medisch → huisarts), geen nieuwe URL.

---

## 4. Ranked: LATER (max 10)

| # | Kandidaat | Laag | Bar | Wat eerst waar moet zijn |
|---|---|---|---|---|
| 1 | **Magnesiumvormen als eigen verdiepingscluster** (citraat/bisglycinaat/tauraat) | supplement | A | Niets blokkeert dit inhoudelijk — het staat op "later" omdat `/kennisbank/magnesiumvormen` + `/blog/magnesium-en-slaapkwaliteit` (16 min, "complete vormengids") het gat al grotendeels dichten. **Eerst** Search Console: als die twee elkaar kannibaliseren, is consolideren de winst, geen derde URL. Nooit een eigen `/beste/`. |
| 2 | **Eiwitrijk ontbijt als contentcluster** | voeding | B | Sterke evidence (PROT-AGE 25–40 g/maaltijd) en je check meet eetmomenten al met `confidence: 4` — het best onderbouwde signaal dat je hebt. Later omdat `/blog/eiwit-na-40` + `/blog/eiwitinname-timing-mannen-40` + `/kennisbank/eiwitbehoefte-na-40` er al staan. **Eerst** vaststellen of er nog vraag onbeantwoord is of dat dit een vierde URL op hetzelfde onderwerp wordt. |
| 3 | **`health_flags`-intakevraag (metformine/PPI)** | check | A | De TODO staat al in `nutrition-lifestyle-extras.ts`. **Eerst** kandidaat 7 uit §3 (de B12-gids) live, zodat de trigger ergens naartoe kán wijzen. En een privacy-afweging: medicatiegebruik is art.9-gezondheidsdata — dat vraagt een DPIA-toets, geen sprintbeslissing. |
| 4 | **Zone 2 / conditie-opbouw als beweeg-ladderitem** | leefstijl | B | Beweging-ladder laag 5 noemt zone 2 al. **Eerst** het openstaande beweegprogramma-besluit (zie geheugen: beweegprogramma staat uit, focus = supplementen). Niet openen zolang die knop uit staat. |
| 5 | **Fermented foods (zuurkool, kefir, kimchi)** | voeding | C | Microbioom-evidence is mechanistisch sterk en klinisch zwak voor deze doelgroep en domeinen. **Eerst** een RCT-basis die verder komt dan Wastyk et al. (2021), of een expliciet besluit dat darmgezondheid een domein wordt — vandaag is het dat niet. |
| 6 | **Collageen** | supplement | C | Commercieel de sterkste van de niet-gebouwde stoffen (verzadigde maar levendige SERP, Daisycon-dekking waarschijnlijk). **Maar:** geen EFSA-claim, en de gewrichts-/huid-evidence is gemengd. Bovendien botst het frontaal met je doelgroep — collageen-SERP's zijn beauty-gedreven. **Eerst** een expliciet besluit of je gewrichtsklachten als domein wilt. Zonder dat: niet bouwen. |
| 7 | **Sauna** | leefstijl | C | De Finse cohorten (Laukkanen) zijn indrukwekkend maar observationeel, en de vertaling naar NL-gedrag is dun. **Eerst** RCT-bewijs, of behandel het als herstel-content zonder claim. |
| 8 | **Algenolie als eigen vergelijking** | supplement | B | **Bewust op later, en dat is de conclusie, niet uitstel.** Arctic Blue algenolie zit al ín `/beste/omega-3-supplement`. Een aparte pagina zou je best converterende pagina kannibaliseren voor een deelpubliek (vegan) dat niet je primaire doelgroep is. **Eerst** aantoonbare vegan-zoekvraag in Search Console op de bestaande pagina. |
| 9 | **Wearables (Oura/Whoop/Garmin) als tier-2 meting** | leefstijl/meten | C | Past structureel in tier 2 en de naad is al gereserveerd (0 schrijvers). **Eerst** de §15-poort uit het beweeg-dossier én een DPA per provider. Geen affiliate — een provisie op een tracker maakt je meetadvies verdacht. |
| 10 | **Bloedonderzoek vitamine D als tier-4 referral** | meetdienst | A | `intake-reference.ts` zegt al dat 25(OH)D de enige van de vijf is waar een prik echt iets toevoegt (`bloodMarker: "improves"`) — de inhoudelijke rechtvaardiging is er dus al. **Eerst** een partnerkeuze en de referral-only-vorm uit `STEPPED_CARE_MODEL.md`: extern verwijzen, niets opslaan, niets duiden. Nooit eigen diagnostiek. |

---

## 5. NIET (minstens 8)

| Kandidaat | De verleiding | Waarom nee |
|---|---|---|
| **NMN / NR** | Longevity-hype op zijn hoogtepunt; "healthspan" staat zelfs in je kennisbank | Geen EFSA-claim, geen humane uitkomstdata bij 40+, en in de EU zit NMN in een novel-food-discussie. Dit is bar D. Je hele merk is gebouwd op níet dit doen. |
| **Resveratrol** | Rode-wijnverhaal, veel zoekvolume | Humane trials consistent teleurstellend, biobeschikbaarheid slecht. Bar D. |
| **Q10 / CoQ10** | Grote NL-markt, "energie"-associatie, statinegebruikers | Geen EFSA-claim (energie-claim is afgewezen). Bij statine-gerelateerde klachten is het een medisch gesprek, geen schap. Bar C-D. |
| **Testoboosters (tribulus, D-asparaginezuur, tongkat ali, fadogia)** | `/testosteron-na-40` is een sterke pillar en dit is de commercieel meest voor de hand liggende uitbreiding | Geen EFSA-claim, geen betrouwbare humane data, en fadogia heeft nauwelijks veiligheidsonderzoek. Dit is het schap waar je concurrenten hun geld verdienen en precies waar `BRAND_POSITIONING.md` zegt dat je níet staat. Voor testosteron heb je al een eerlijk antwoord: zink (EFSA-claim), slaap, kracht, gewicht. |
| **Pre-workout & cafeïnepillen** | Scoort, marges, makkelijk te vergelijken | Botst frontaal met kandidaat 2 uit §3: je kunt niet in hetzelfde kwartaal cafeïne-timing adviseren én cafeïnepillen verkopen. Bar D voor deze doelgroep. |
| **GABA, 5-HTP, apigenine, valeriaan, passiebloem** | Slaapdomein is je sterkste domein en de vraag is er | GABA passeert de bloed-hersenbarrière nauwelijks; 5-HTP raakt serotonerge medicatie (interactierisico); apigenine is influencer-content zonder trials; valeriaan en passiebloem zijn on-hold botanicals — dezelfde categorie waar ashwagandha nu op stukloopt. Bar C-D. |
| **Berberine** | "Natuurlijke Ozempic" — enorme social-hype | Farmacologisch actief op glucosemetabolisme: dat is medisch terrein, geen leefstijl. Metformine-achtige interacties. Bar D en een compliance-risico dat lijkt op ashwagandha. |
| **Multivitamine als product** | Grootste zoekvolume van alle supplementcategorieën | Zwakke case tegenover gerichte stoffen (§3.3). Ja als opiniestuk, nee als schap — en dat onderscheid moet hard zijn. |
| **IJzer** | Staat op de force-evaluate-lijst, "energie"-associatie | Actief gevaarlijk voor deze doelgroep: mannen 40+ hebben geen fysiologisch ijzerverlies, en suppletie zonder aangetoond tekort geeft stapeling. IJzergebrek bij een man 40+ is een reden om GI-bloedverlies uit te sluiten — dat is huisarts, geen supplement. De enige denkbare uitzondering (duursporters met lage ferritine) is te klein en te medisch. **Nooit een schap, nooit een engine-route.** |
| **Slaapomgeving-producten (masker, oordoppen, matras)** | Slaap-ladder laag 4 gaat er letterlijk over; grote affiliate-markt | Geen EFSA-kader, geen onafhankelijke testcapaciteit, en je zou een productoordeel geven dat je niet kunt onderbouwen — `/supplementen` zegt zelf al expliciet "geen eigen labtests". Het ladderitem blijft gedragsadvies. |
| **Elektrolytenpoeders** | Levendige SERP, en §3.6 gaat over zout en kalium | De commerciële vertaling van een advies dat juist over voeding gaat. Voor niet-extreem-sportende mannen 40+ is de behoefte er niet; het is de omkering van leefstijl-eerst. |
| **Glucosamine/chondroïtine** | Grote 40+-markt | Cochrane-evidence gemengd tot negatief, geen EFSA-claim, en gewrichtsklachten zijn geen domein van jou. Bar C. |
| **Curcuma/kurkuma** | Populair, veel "ontsteking"-content | On-hold botanical, slechte biobeschikbaarheid, en "ontstekingsremming" is claimtaal die dicht tegen een medische claim aanschuurt. Bar C-D. |
| **Probiotica** | Enorme markt | EFSA heeft élke probiotica-gezondheidsclaim afgewezen; het woord "probiotica" geldt zélf als ongeoorloofde claim in de EU. Juridisch de slechtste van allemaal. |

Ook nee, korter: **calcium** (Schijf van Vijf dekt het via zuivel; suppletie zonder indicatie is cardiovasculair omstreden), **selenium/jodium** (NL-inname adequaat via gejodeerd zout en brood; geen gat), **foliumzuur** (relevant bij zwangerschap, niet bij mannen 40+), **NAC** (in NL in een geneesmiddel-grijsgebied), **beta-alanine/taurine/glycine/L-theanine/rhodiola** (C-bar, sport- of biohack-niche, geen EFSA-claim — glycine en L-theanine mogen hooguit een kennisbank-alinea binnen het slaapcluster).

---

## 6. Force-evaluate tabel

**Supplementen / stoffen**

| Item | Oordeel | Eén zin |
|---|---|---|
| B12 | **Later → nu als gids** | Gids zonder vergelijking (melatonine-patroon); NL-pad loopt via de huisarts, dus geen `/beste/`. |
| K2 (alleen of met D3) | **Ja** | Geautoriseerde botclaim + merchant-dekking, maar als variant bínnen `/beste/vitamine-d`, niet als eigen URL. |
| Calcium | **Nee** | Schijf van Vijf dekt het; suppletie zonder indicatie cardiovasculair omstreden. |
| Kalium | **Ja, als voedingsextra** | Sterke NL-verankering (RIVM/Voedingscentrum), maar via zout-en-voeding, nooit als pil. |
| Selenium | **Nee** | Nederlandse inname adequaat; geen gat om te dichten. |
| Jodium | **Nee** | Gedekt via gejodeerd bakkerszout; alleen relevant bij zoutvervanging — te niche. |
| Foliumzuur | **Nee** | Relevantie zit bij zwangerschap; homocysteïneverlaging vertaalt zich niet naar events. |
| IJzer | **Nee, hard** | Geen fysiologisch verlies bij mannen 40+; stapelingsrisico, en een tekort is een huisartsvraag. |
| Magnesiumvormen-uitbreiding | **Later, content-only** | Kennisbank + blog dekken het al; eerst kannibalisatie-check, nooit een tweede schap. |
| Algenolie als aparte vergelijking | **Later, waarschijnlijk nooit** | Arctic Blue algenolie staat al op `/beste/omega-3-supplement`; splitsen kannibaliseert. |
| Collageen | **Later** | Commercieel sterk, evidence C, en gewrichten/huid zijn geen domein van jou. |
| Glucosamine/chondroïtine | **Nee** | Evidence gemengd-negatief, geen claim, geen domein. |
| Curcuma | **Nee** | On-hold botanical met claimtaal die naar medisch neigt. |
| Q10 | **Nee** | Energie-claim door EFSA afgewezen; statinecontext is medisch. |
| Probiotica | **Nee** | Alle EU-claims afgewezen; de term zelf is al een claim. |
| Multivitamine man 40+ | **Nee als product, ja als opiniestuk** | De zwakke case ís de content — Tier-4 stuk, geen schap. |
| Glycine | **Nee (kennisbank-alinea mag)** | Kleine slaap-RCT's, geen claim, geen schap. |
| Taurine | **Nee** | Longevity-hype op muisdata. |
| L-theanine | **Nee (kennisbank-alinea mag)** | C-bar; en de stress-lock sluit een schap hier sowieso uit. |
| Rhodiola | **Nee** | On-hold botanical, zelfde categorie als ashwagandha. |
| Beta-alanine | **Nee** | Sportniche, buiten doelgroep. |
| NAC | **Nee** | Geneesmiddel-grijsgebied in NL. |
| Berberine | **Nee** | Farmacologisch op glucose = medisch terrein. |
| Resveratrol | **Nee** | Humane trials teleurstellend. |
| NMN/NR | **Nee** | Longevity-hype, novel-food-onzekerheid, bar D. |
| Testoboosters | **Nee** | Geen data, en precies het schap waar je je tegen positioneert. |
| Pre-workout | **Nee** | Botst met je eigen cafeïne-advies. |
| Cafeïnepillen | **Nee** | Idem, en geen doelgroepfit. |
| GABA | **Nee** | Passeert de bloed-hersenbarrière nauwelijks. |
| 5-HTP | **Nee** | Serotonerge interacties = medisch. |
| Valeriaan | **Nee** | On-hold botanical. |
| Passiebloem | **Nee** | Idem, en zwakker onderbouwd. |
| Apigenine | **Nee** | Influencer-stof zonder humane trials. |
| Ashwagandha-status | **Sunset plannen** | VWS-voornemen, TRIS loopt, mogelijk 1-1-2027 met uitverkoop tot 1-7-2027 — beslismoment vastleggen, niet investeren. |
| Melatonine-status | **Ongewijzigd forbidden** | Blijft informatief zonder koop-CTA; geen enkele beweging. |

**Voeding / productgroepen**

| Item | Oordeel | Eén zin |
|---|---|---|
| Fermented foods | **Later** | Mechanisme sterk, klinische evidence voor deze domeinen zwak. |
| Havermout als productgroep | **Nee** | Staat al in food-sources bij magnesium én zink; curated toevoegen dupliceert. |
| Eieren als curated | **Nee** | Staan al bij protein en zink; geen nieuw insertiepunt. |
| Blikvis/sardines als productgroep | **Nee** | Sardines, ansjovis, sprot en makreel staan al bij omega3; "vette vis" is al curated. |
| Plantaardige drinks verrijkt | **Nee** | Al in food-sources (sojadrink-verrijkt, plantaardige-drank-verrijkt) én in de b12_vegan-extra. |
| Volkorenbrood | **Nee** | Al in food-sources bij magnesium en zink; ook al een actie in ladderlaag 1. |
| Olijfolie EV | **Nee, niet verdiepen** | Al curated; een SEO-cluster erop is buiten je domeinen. |
| Dark chocolate | **Nee** | Staat al als pure-chocolade bij magnesium; als curated groep geeft het een verkeerd signaal. |
| Koffie/thee als leefstijl | **Ja — als cafeïne-timing** | Nu-kandidaat 2, maar als timing-gedrag, nooit als productgroep. |
| Zout/elektrolyten | **Zout ja, elektrolyten nee** | Kalium-en-zout wordt een extra; poeders staan op de niet-lijst. |
| Peulvruchten-producten | **Nee** | Al curated én in food-sources op drie nutriënten. |
| Skyr/kwark | **Nee** | Al curated. |
| Eiwitrijk ontbijt als cluster | **Later** | Drie bestaande pagina's dekken het; eerst kannibalisatie-check. |
| Vezels | **Nee, extra bestaat** | `fiber_low_wholegrain` dekt het inclusief de 30–40 g-vuistregel. |
| B12-verrijkte producten vs supplement | **Ja, in de B12-gids** | Precies de afweging die de gids moet maken; geen apart item. |

**Leefstijl / meten / omgeving**

| Item | Oordeel | Eén zin |
|---|---|---|
| Cafeïne-timing | **Ja, als content** | Nu-kandidaat 2: ladderactie bestaat al, de blog die hem onderbouwt niet. |
| Alcohol | **Nee, gedekt** | `/blog/alcohol-slaap-energie-na-40` bestaat en de slaap-ladder noemt het. |
| Ochtendlicht/buitenlicht | **Ja, als content** | Nu-kandidaat 8: ladderactie bestaat al; sectie in de bestaande slaapritme-blog. |
| Avondlicht/blauw licht | **Nee** | Evidence voor blauw-licht-filters is zwak; het zit al in slaaphygiëne-content. |
| Slaapomgeving-producten | **Nee** | Geen claimkader, geen testcapaciteit; ladderitem blijft gedrag. |
| Krachttraining | **Nee, gedekt** | Blog + beweeg-ladder laag 2 + creatine-pagina dekken het. |
| NEAT/stappen | **Nee, gedekt** | Beweeg-ladder laag 1 is precies dit. |
| Zone 2 | **Later** | Ladder laag 5 noemt het; wacht op het beweegprogramma-besluit. |
| Mobiliteit | **Nee** | Buiten je vier domeinen. |
| Sauna | **Later** | Observationeel bewijs, geen NL-vertaling. |
| Koud (ijsbaden) | **Nee** | Hype; bewijs voor herstel is zelfs deels negatief (blunt trainingsadaptatie). |
| Intermittent fasting | **Nee** | Piramidelaag 5 zegt letterlijk "we openen dit niet eerder" — respecteer dat. |
| Ademhaling | **Nee, gedekt** | Blog + stress-ladder laag 2. |
| Vagus | **Nee, gedekt** | Kennisbank-term bestaat. |
| Wearables | **Later** | Tier 2 mogelijk; eerst DPA-poort, en nooit met affiliate. |
| Bloedonderzoek vitamine D | **Later, referral-only** | De enige van de vijf waar een prik iets toevoegt; extern verwijzen, niets opslaan. |
| CPAP/slaapapneu | **Nee, doorverwijzen** | Medisch; hooguit één awareness-alinea met huisartsverwijzing in slaapcontent. |

---

## 7. Kannibalisatie & IA

**De regel die dit memo volgt:** versterk een bestaande URL tenzij de zoekintentie aantoonbaar anders is. Dat is waarom van de acht nu-kandidaten er slechts **twee** een nieuwe URL krijgen.

| Nieuwe kandidaat | Bestaande URL die het raakt | Besluit |
|---|---|---|
| Vitamine K2 | `/beste/vitamine-d` + `/supplementen/vitamine-d` | **Uitbreiden.** Losse `/beste/vitamine-k2` zou beide aanvallen voor een variantvraag. |
| Cafeïne-timing | `/blog/alcohol-slaap-energie-na-40`, `/blog/middagdip-bloedsuiker-na-40` | **Nieuwe blog.** Andere stof, andere query, wederzijdse links — geen overlap. Ladderactie bestaat al en gaat linken. |
| Ochtendlicht | `/blog/slaapritme-herstellen`, `/blog/slaaphygiene-mannen-40-plus` | **Geen nieuwe URL.** Sectie in `slaapritme-herstellen`; ladderactie bestaat al. |
| Multivitamine-opinie | Geen | **Nieuwe blog.** Leeg terrein, en bewust een informational query in plaats van "beste multivitamine". |
| B12-gids | `b12_vegan`-extra, `/voeding-na-40` | **Nieuwe gids.** De extra wordt trigger, de gids landingsplek. |
| Kalium/zout | `/voeding-na-40`, ladderlaag 2 | **Geen nieuwe URL.** Extra + ladderactie. |
| Magnesiumvormen (later) | `/kennisbank/magnesiumvormen`, `/blog/magnesium-en-slaapkwaliteit` | **Eerst GSC-check.** Mogelijk consolideren i.p.v. uitbreiden. |
| Algenolie (later) | `/beste/omega-3-supplement` | **Niet splitsen.** |

**Wat `/supplementen-mannen-40` wél moet vangen.** De commerciële hub-query ("welke supplementen als man van 40+"), als **routeringspagina** naar de 7 bestaande vergelijkingen en naar `/intake` — plus, en dit is het onderscheidende deel, een expliciete "wat wij níet aanbevelen"-sectie die linkt naar het multivitamine-opiniestuk, de melatonine-gids en de ashwagandha-status.

**Wat het níet moet vangen.** Geen eigen productvergelijking (dupliceert `/beste/*`), geen stof-diepte (dat zijn de gidsen), geen leefstijlcontent (dat zijn de pillars). En let op de overlap met `/supplementen` (de bestaande catalogus met PS-Score): die is *productgericht en filterbaar*, de nieuwe pillar is *SEO en routerend*. Wordt dat verschil niet scherp bewaakt, dan kannibaliseren ze elkaar — dat is het grootste IA-risico in dit memo.

**Stel de pillar uit tot na kandidaat 3.** Het multivitamine-opiniestuk is de inhoudelijke ruggengraat van de "wat wij niet aanbevelen"-sectie; die eerst schrijven maakt de pillar sterker en goedkoper.

---

## 8. Gevolgen voor de voedingscheck

**Default en advies: niet uitbreiden.** Geen zesde `NutrientId`. Van alle onderzochte kandidaten haalt er geen enkele de lat uit de opdracht — "alleen als de check anders liegt".

Concreet getoetst: **B12** zou de sterkste kandidaat zijn (hoge prevalentie, duidelijke risicogroepen), maar de check zou dan moeten vragen naar medicatiegebruik, en dat is art.9-gezondheidsdata met een DPIA-consequentie — plus het antwoord is hoe dan ook "huisarts", niet een band in een ladder. **Kalium** en **choline** hebben geen `/beste/`-pad, wat `NutrientReference` (`comparisonPath: string`, niet nullable) structureel vereist. **Calcium** en **selenium** hebben geen gat.

Wél twee wijzigingen bínnen de bestaande vijf, en die zijn belangrijker dan een zesde:

1. **`vitamin_d.thresholds` op de seizoens-as** (§3.1). `confidence: 1` met de eigen toelichting dat frequentie weinig zegt is vandaag de zwakste schakel in de hele keten, en `portion-dictionary.ts` kent het seizoen al.
2. **`magnesium` — herzie de vraag, niet de grens.** De comment in `intake-reference.ts` zegt het zelf al scherp: de band komt uit een groente-en-fruittelling terwijl noten, volkoren en peulvruchten de sterkere bronnen zijn, en fruit is een zwakke magnesiumbron. Grenzen verschuiven repareert dat niet; alleen een magnesium-specifieke bronvraag doet dat. **Dat is een intakevraag-wijziging en valt buiten de scope van dit memo** — het hoort op de roadmap, niet in deze sprint.

Eén uitbreiding van de **extras** (geen nutriënt): `kalium_zout` naast de drie bestaande. Dat is het lichte pad dat precies bestaat voor dit soort gevallen.

---

## 9. Open vragen voor Dennis

1. **Food-affiliate: ja of nee?** Vandaag is `nutrition-curated.ts` bewust merkloos en dat draagt je onafhankelijkheid. Zeg je nee, dan is de voedingslaag definitief content-en-oordeel en kan ik daar zonder voorbehoud op door bouwen. Mijn advies: **nee**, expliciet en op papier.

2. **Ashwagandha — wat is je trigger?** Ik stel voor: bij TRIS-notificatie stoppen met contentinvestering, bij ingang van het verbod de affiliate-links verwijderen en de pagina omzetten naar het melatonine-patroon (informatief, geen koop-CTA). Akkoord, of wil je eerder al afbouwen?

3. **Bloed-referral (tier 4-5): wil je die knop dit jaar om?** Vitamine D is inhoudelijk de enige die het rechtvaardigt en je eigen data zegt dat al. Zonder besluit blijft `SERVICE_REFERRAL_OFFERS` met zijn `example.org`-placeholder staan — dat is nu dood gewicht in de catalogus.

4. **`/supplementen-mannen-40` versus `/supplementen`:** wat is de taakverdeling? Zonder een scherpe grens (SEO-routering vs. filterbare catalogus) bouw je twee pagina's die om dezelfde query vechten. Mijn advies: pillar = routering + "wat wij niet aanbevelen"; `/supplementen` = catalogus met PS-Score.

5. **Gewrichtsklachten: domein of niet?** Dit bepaalt collageen én glucosamine in één klap. Vandaag zijn ze allebei "later/nee" *omdat het domein niet bestaat*. Zeg je nee, dan gaan beide definitief naar de niet-lijst en is die vraag voorgoed beantwoord.

---

*Onderzocht en geschreven september 2026. Catalogus-inventaris geverifieerd tegen de bestanden, niet tegen documentatie — waar `CONTENT_MAP.md` en de code uiteenliepen, is de code aangehouden. Geen codewijzigingen buiten dit memo.*
