# Voedingsbronnen v2 — gebronde tabel met variatie- en opname-oordeel

> **Status:** spec + eerste invulling. Opgesteld 1 september 2026.
> **Vervangt niet:** `portion-dictionary.ts` (portiegroep → gram) en `intake-reference.ts` (drempels per nutriënt). Dit doc gaat alleen over `food-sources.ts`.
> **Harde grens:** deze tabel telt **nooit** op tot een dagtotaal. Zie §0.

---

## 0 · Wat deze tabel wel en niet is

De leesregel uit `food-sources.ts:12-16` blijft ongewijzigd gelden en wordt hier aangescherpt, niet versoepeld:

> Deze waarden tellen **NIET** op tot een dagtotaal. De band per nutriënt komt uit frequentievragen (`estimateNutritionIntake`), niet uit grammen. De lijst staat er om te kunnen **kíezen** tussen bronnen — niet om inname te berekenen.

**Wat v2 toevoegt is onderbouwing, geen precisie.** De reden staat in §2: bij drie van de vijf nutriënten is de spreiding rond een tabelwaarde zo groot dat een preciezer getal de schatting niet verbetert. Wat v2 wél doet is het verschil tussen "amandelen leveren magnesium" en "amandelen leveren magnesium, en die opname wordt niet geremd zoals bij volkoren" expliciet en controleerbaar maken.

**Niet-doelen.** Geen dagtotaal, geen percentage-van-ADH per gebruiker, geen FFQ, geen recall, geen macro-tracker. Die staan in laag 5 van de eetbasis-piramide (`lifestyle-pyramid.ts`) en die is bewust dicht.

---

## 1 · Bronstrategie

| Bron | Rol | Licentie | Beperking |
| --- | --- | --- | --- |
| **NEVO (RIVM)** | primair voor NL-voedingsmiddelen | licentieovereenkomst met RIVM vereist | geen open API; commercieel gebruik apart aanvragen |
| **USDA FoodData Central** | aanvulling waar NEVO een veld mist | public domain | Amerikaanse producten, andere verrijkingsniveaus |
| **Voedingscentrum** | portiematen, verrijkingsregels NL | publiek raadpleegbaar | geen ruwe dataset |
| **Peer-reviewed literatuur** | variatie- en opname-oordelen (§2) | — | per uitspraak citeren |

**Regels.**

1. Eén bron per waarde. **Nooit middelen tussen bronnen** — dan is het getal van niemand meer en niet meer terug te voeren.
2. `sourceRef` legt vast wélke bron het was. Een waarde zonder `sourceRef` is per definitie `verified: false`.
3. NEVO wint van USDA bij NL-voedingsmiddelen. USDA vult aan waar NEVO het veld niet apart geeft — in de praktijk vooral EPA/DHA (zie §3).
4. Verrijkte producten (halvarine, plantaardige dranken) volgen **altijd** de NL-regelgeving, nooit USDA — de verrijkingsniveaus verschillen wettelijk.

**Licentiepoort.** Publicatie van NEVO-afgeleide waarden op perfectsupplement.nl vereist een licentie-aanvraag bij RIVM. Tot die er is blijft elke NEVO-waarde in deze tabel `verified: false` met `sourceRef: null`. De getallen die er nu staan zijn indicatief en blijven dat expliciet — dat is geen tijdelijke slordigheid maar de eerlijke stand.

---

## 2 · Waarom één getal niet genoeg is

Drie onafhankelijke redenen waarom een tabelwaarde afwijkt van wat iemand binnenkrijgt. Ze werken verschillend en horen daarom in aparte velden.

### 2.1 Variatie in het product zelf (`variability`)

De spreiding rond een tabelwaarde verschilt sterk per nutriënt:

- **Hoog.** Vitamine D en omega-3 in vis: wild versus gekweekt scheelt een veelvoud. Bij gekweekte zalm is het EPA/DHA-gehalte over de afgelopen twee decennia meetbaar gedaald doordat het voer verschoof van vismeel naar plantaardige olie — dezelfde soort, ander gehalte. Selenium is het extreemste geval (bodemgehalte varieert per regio met een factor 10+), maar valt buiten onze vijf nutriënten.
- **Matig.** Magnesium en zink in plantaardige bronnen: bodem, ras en groeiomstandigheden werken door, maar zonder de ordegrootte van selenium.
- **Laag.** Eiwit in vlees, vis, ei en zuivel. Dat is structureel weefsel, geen opnameafhankelijk sporenelement — de spreiding is klein genoeg om te negeren.

### 2.2 Opname (`bioavailability`)

Dit is bij magnesium en zink **een grotere factor dan de bodemvariatie**, en het is precies wat een tabel onzichtbaar maakt.

**Fytaat** (in volkoren, peulvruchten, noten en zaden) bindt magnesium en zink in het darmlumen. Bij zink is de fytaat:zink-molratio de bepalende factor, en bij een hoge ratio kan de absorptie meer dan halveren. Dat betekent dat 1,4 mg zink uit volkorenbrood iets anders is dan 1,4 mg zink uit rundvlees — hetzelfde getal, een andere uitkomst.

**Heem versus non-heem** speelt dezelfde rol bij ijzer (buiten onze vijf), en de zink-analogie is dat dierlijke bronnen geen fytaatrem hebben.

**Weken, kiemen, zuurdesem-fermentatie** verlagen het fytaatgehalte. Dat is relevante keuze-informatie: het is de reden waarom zuurdesem-volkoren anders scoort dan gewoon volkoren.

**ALA → EPA/DHA-conversie** is het derde geval en het scherpste: de omzetting van plantaardig ALA naar EPA en vooral DHA is bij mensen laag — enkele procenten voor EPA, nog minder voor DHA. Daarom staat walnoot/lijnzaad in de huidige tabel al terecht op `amount: null` met een `noteNl`. v2 maakt dat een getypeerd veld in plaats van een opmerking.

### 2.3 Bereiding en bewaring (`preparationNote`)

Koken laat magnesium uitlogen in het kookwater; de waarde voor "spinazie, gekookt" is een andere dan voor rauw. De huidige tabel doet dit al goed door de bereiding in `labelNl` te zetten ("Spinazie, gekookt"). v2 houdt die praktijk aan en voegt alleen een veld toe waar het gedrag verandert.

---

## 3 · Het omega-3-gat

Dit is het enige echte databronprobleem van de vijf, en het zit op het nutriënt met een affiliate-pad.

**NEVO geeft vetzuren niet altijd uitgesplitst per EPA en DHA** — vaak alleen totaal n-3, of een beperkte set. Voor onze use case is dat onvoldoende: het verschil tussen ALA en EPA/DHA is nu juist de hele boodschap (zie §2.2). USDA FoodData Central heeft de losse vetzuren wél als aparte nutriëntvelden (o.a. 20:5 n-3 EPA en 22:6 n-3 DHA).

**Besluit.** Voor omega-3 wordt USDA de primaire bron voor de EPA/DHA-splitsing, ook bij NL-voedingsmiddelen, tenzij het NEVO-bestand onder de verkregen licentie de losse vetzuren blijkt te bevatten. In dat geval wint NEVO alsnog. Dit is de enige stof waar USDA voorrang krijgt, en de reden staat hier vast zodat hij niet stilzwijgend naar andere stoffen uitbreidt.

**Gevolg voor het datamodel:** omega-3 krijgt `omega3Kind: "epa_dha" | "ala"`. Een ALA-bron krijgt nooit een `amount` in dezelfde eenheid als een EPA/DHA-bron, want dat zou suggereren dat ze uitwisselbaar zijn.

---

## 4 · Scope — welke voedingsmiddelen

Huidige tabel: **35 bronnen** over 5 nutriënten. Voorstel v2: **~75**, met een reden per uitbreiding. Geen volledigheid nagestreefd — de tabel dient om te kunnen kiezen, en een lijst van 300 items maakt kiezen moeilijker, niet makkelijker.

### 4.1 Selectiecriteria

Een voedingsmiddel hoort in de tabel als het aan **minstens twee** van deze voldoet:

1. Levert een relevante hoeveelheid van het nutriënt per realistische portie.
2. Is in NL gangbaar verkrijgbaar en herkenbaar voor de doelgroep (mannen 40+).
3. Dekt een route die anders ontbreekt (plantaardig, zuivelvrij, visvrij, budget).
4. Illustreert een opname- of variatiepunt dat de gebruiker moet weten (volkoren/fytaat, gekweekt/wild).

Expliciet **niet** opnemen: exotische superfoods zonder NL-distributie, merkproducten (die horen achter `productKey`), supplementen (die horen in het schap), en items die alleen "hoog scoren per 100 g" bij een portie die niemand eet (bijv. tarwezemelen).

### 4.2 Eiwit — van 6 naar ~16

Huidige 6 dekken alleen de top. Gaten: geen vis, geen kaas, geen granen, geen enkele zuivelvrije plantaardige route naast tofu.

| Toevoegen | Reden |
| --- | --- |
| Tonijn uit blik, kabeljauw | vis ontbreekt volledig als eiwitbron |
| Griekse yoghurt, hüttenkäse, belegen kaas | zuivelbreedte; kaas staat nu alleen bij zink |
| Rundvlees (mager), varkenshaas | staat nu alleen bij zink |
| Kikkererwten, kidneybonen | staan nu alleen bij zink/magnesium |
| Tempé, seitan | plantaardig naast tofu; tempé is gefermenteerd (lager fytaat) |
| Havermout, volkoren pasta | granen als stille eiwitbijdrage over de dag |
| Erwten (diepvries) | budget + diepvries-route |
| Sojadrink (verrijkt) | zuivelvrije route, NL-verrijkingsregels |

**Aandachtspunt:** eiwit is het enige nutriënt waar de *kwaliteit* (aminozuurprofiel, verteerbaarheid) meetelt naast de hoeveelheid. Plantaardige bronnen scoren daar systematisch lager. v2 lost dat niet met een DIAAS-getal op — dat is precisie die we niet kunnen dragen — maar met een `qualityNote` op plantaardige eiwitbronnen die het combinatieprincipe noemt.

### 4.3 Magnesium — van 10 naar ~18

Al de best gevulde lijst. Gaten: geen noten naast amandelen, geen volkoren granen naast brood, geen peulvruchtenbreedte.

| Toevoegen | Reden |
| --- | --- |
| Cashewnoten, zonnebloempitten, tahin | notenbreedte naast amandelen |
| Havermout, quinoa, zilvervliesrijst | granen naast brood |
| Zwarte bonen, witte bonen | peulvruchtenbreedte |
| Boerenkool | seizoensgroente, NL-winter |

Alle plantaardige items in deze lijst krijgen `bioavailability: "reduced"` met fytaat als reden — dat is het punt uit §2.2 dat nu alleen bij volkorenbrood staat en dat structureel hoort.

### 4.4 Omega-3 — van 7 naar ~14

Splitsing EPA/DHA versus ALA wordt getypeerd (§3).

| Toevoegen | Reden |
| --- | --- |
| Ansjovis, sprot | kleine vis, laag in de voedselketen (minder kwik) |
| Wilde versus gekweekte zalm apart | maakt het variatiepunt uit §2.1 zichtbaar in plaats van weggemiddeld |
| Tonijn uit blik | veelgegeten, maar **laag** in EPA/DHA — juist daarom opnemen, het corrigeert een misvatting |
| Chiazaad | ALA naast walnoot/lijnzaad |
| Verrijkte eieren | NL-verkrijgbaar, kleine maar echte bijdrage |
| Algenolie (voeding, niet supplement) | de enige plantaardige DHA-route |

### 4.5 Vitamine D — van 5 naar ~10

De kleinste lijst, en terecht: voeding dekt dit gat in NL structureel niet. De uitbreiding dient vooral om dát duidelijk te maken.

| Toevoegen | Reden |
| --- | --- |
| Makreel, sardines uit blik | staan bij omega-3, horen hier ook |
| Verrijkte plantaardige dranken | zuivelvrije route, NL-verrijking |
| Paddenstoelen (UV-behandeld) | enige plantaardige bron van betekenis, en alleen UV-behandeld |
| Lever(pastei) | traditioneel, hoog gehalte |

**De boodschap blijft dat zonlicht de hoofdroute is.** Die staat al correct in de tabel met `amount: null` en de note dat de aanmaak okt–mrt vrijwel stilstaat. Elke uitbreiding hier moet die boodschap versterken, niet verdunnen — een langere lijst mag niet suggereren dat voeding het alsnog dichtrijdt.

### 4.6 Zink — van 7 naar ~15

| Toevoegen | Reden |
| --- | --- |
| Oesters | veruit de sterkste bron; hoort erin ook al eet bijna niemand ze dagelijks |
| Kalfsvlees, lamsvlees | vleesbreedte |
| Hennepzaad, cashewnoten | plantaardig naast pompoenzaad |
| Havermout, quinoa | granen |
| Linzen, kikkererwten | peulvruchten |
| Eieren, belegen kaas | staan bij eiwit/vitamine D, horen hier ook |

Zink is de stof waar de fytaatrem het zwaarst weegt (§2.2). Elke plantaardige zinkbron krijgt daarom niet alleen `bioavailability: "reduced"` maar ook een `bioavailabilityWhy` die de molratio noemt in gebruikerstaal.

---

## 5 · Datamodel v2

Uitbreiding van `FoodSource`. Alle nieuwe velden optioneel, zodat de bestaande 35 rijen geldig blijven tijdens de migratie.

```
export type SourceOrigin = "nevo" | "usda" | "voedingscentrum" | "literatuur";

export interface SourceRef {
  origin: SourceOrigin;
  /** NEVO-code, USDA fdcId, of paginaverwijzing. Null = nog niet geverifieerd. */
  ref: string | null;
  /** Jaar/versie van de dataset. */
  edition: string | null;
}

export type Variability = "low" | "moderate" | "high";
export type Bioavailability = "normal" | "reduced" | "enhanced";
export type Omega3Kind = "epa_dha" | "ala";

// Toegevoegd aan FoodSource:
  source: SourceRef;
  /** Of de waarde tegen de bron is nagelopen. False = indicatief. */
  verified: boolean;
  variability: Variability;
  /** Waarom die spreiding — alleen bij moderate/high. Gebruikerstaal. */
  variabilityWhy?: string;
  bioavailability: Bioavailability;
  /** Waarom de opname afwijkt — alleen bij reduced/enhanced. Gebruikerstaal. */
  bioavailabilityWhy?: string;
  /** Alleen op omega3-bronnen. Verplicht daar. */
  omega3Kind?: Omega3Kind;
  /** Eiwitkwaliteit — alleen op plantaardige eiwitbronnen. */
  qualityNote?: string;
  /** Wat bereiding met het gehalte doet, waar dat het gedrag verandert. */
  preparationNote?: string;
```

**Invarianten** (afgedwongen in `step-sourcing.test.ts`):

1. `verified: true` vereist `source.ref !== null` (en `edition !== null`).
2. `variability !== "low"` vereist `variabilityWhy`.
3. `bioavailability !== "normal"` vereist `bioavailabilityWhy`.
4. Elke bron in `FOOD_SOURCES.omega3` heeft `omega3Kind`.
5. Een `ala`-bron heeft nooit een `amount` — blijft `null` tot er een aparte ALA-eenheid is.
6. Plantaardige magnesium- en zinkbronnen (portionGroup `wholegrain`/`legumes`/`nuts`) staan verplicht op `bioavailability: "reduced"`.
7. Bestaande invarianten blijven: aflopend op `amount` met nulls achteraan, unieke keys per nutriënt, `portionGroup` bestaat, `productKey` overal leeg.

---

## 6 · Verificatiestatus

Elke waarde krijgt bij invulling een eerlijk label. De startstand — en de stand ná deze slice — is:

| Categorie | Aantal | `verified` | Waarom |
| --- | --- | --- | --- |
| Bestaande 35 waarden | 35 | `false` | indicatief sinds N0, `VERIFY`-comment stond er al |
| Nieuwe waarden v2 | ~43 | `false` | uit literatuurkennis, niet uit het NEVO-bestand |
| Variatie-/opname-oordelen | alle | n.v.t. | kwalitatief, gebaseerd op gepubliceerd mechanisme — geen tabelwaarde |

**Er staat na deze slice geen enkele `verified: true` in de tabel.** Dat is de eerlijke stand tot de NEVO-licentie er is en iemand de getallen daadwerkelijk naast het bestand heeft gelegd. Het veld bestaat juist om dat verschil zichtbaar te houden in plaats van het te vergeten. Dit wordt in `step-sourcing.test.ts` afgedwongen: één test faalt zodra een rij `verified: true` claimt zonder `source.ref`.

De variatie- en opname-oordelen (§2) zijn een ander soort uitspraak dan de gehaltes: ze beschrijven een mechanisme (fytaat remt zinkopname; ALA-conversie is laag; gekweekte zalm verschilt van wilde), niet een getal. Die zijn gebaseerd op gevestigde voedingsleer en veranderen niet als de tabelwaarde met 10% opschuift.

---

## 7 · Wat dit niet oplost

Expliciet, zodat de volgende ronde niet denkt dat dit af is:

- **De meetketen wordt hier niet sterker van.** Het instrument blijft 13 frequentie-sliders. De fout zit in "hoeveel porties noten per week", niet in het magnesiumgehalte van amandelen. Deze tabel verbetert de *keuzehulp*, niet de *schatting*.
- **`FOOD_SOURCES` blijft dormant.** Geen enkele UI leest het vandaag; alleen `step-sourcing.test.ts` raakt het. Deze slice verandert daar niets aan — een surface bouwen is een apart besluit.
- **De voeding-readout blijft ontbreken.** `resolveDomainLadderReadout("voeding")` geeft nog steeds `null`. Dat is V1c (`nutrition-conclusion.ts`) en die is onafhankelijk van deze tabel.
- **Geen dagtotaal.** Zie §0. Dat blijft dicht.

---

## 8 · Volgorde

| Stap | Wat | Status |
| --- | --- | --- |
| **1** | Datamodel v2 + invarianten in de test | **Gedaan** — deze slice |
| **2** | Bestaande 35 rijen voorzien van `source`/`variability`/`bioavailability` | **Gedaan** — deze slice |
| **3** | Uitbreiding naar 78 volgens §4 | **Gedaan** — deze slice |
| **4** | NEVO-licentie aanvragen bij RIVM | Actie voor Dennis, buiten de repo |
| **5** | Verificatieslag: waarden naast de bron, `verified: true` waar het klopt | Wacht op stap 4 |

Stap 1–3 zijn opgeleverd in `src/data/nutrition/food-sources.ts` (78 bronnen: eiwit 21, magnesium 18, omega-3 14, vitamine D 10, zink 15) en `src/lib/__tests__/step-sourcing.test.ts` (7 nieuwe invarianten, alle groen). Stap 4 is Dennis' actie buiten de code. Stap 5 kan pas daarna en is bewust niet ingepland.

---

*Opgesteld 1 september 2026. Alle gehaltes in de bijbehorende code zijn indicatief (`verified: false`) tot de NEVO-licentie er is.*
