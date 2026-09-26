# Besluit — ijzer en calcium als gemeten stoffen?

**Datum:** 23 september 2026, §7 aangevuld 26 september 2026
**Status:** §7 beslist (optie B) — volgorde uit §8 blijft leidend voor de uitvoering
**Aanleiding:** doelgroepverbreding van "mannen 40+" naar "mannen en vrouwen 30+" (23 sep).
De vraag die daaruit volgt: de helft van de nieuwe doelgroep heeft een tekortprofiel dat
dit product niet meet.
**Vervolg op:** [`BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md`](./BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md)
(het tekortsysteem dat hier uitgebreid zou worden)

**Update 26 sep 2026:** naar aanleiding van een extern voorstel ("27-stoffen-dagboek")
dat de volgorde uit §8 omdraaide (architectuur/data vóór pagina/claim), is expliciet
bevestigd: **§8 blijft leidend, niet omgedraaid.** Tegelijk is de vraag uit §7 beslist:
**optie B, geslachtsafhankelijke RI.** Zie §7 hieronder voor de aanvulling. Er is geen
apart besluit genomen over een lijst van "6 prioriteitsstoffen" of "22/27 nieuwe
stoffen" — dat voorstel had geen eigen besluitdocument en wordt hier niet als
vaststaand behandeld. Elke volgende stof volgt hetzelfde traject als ijzer/calcium:
eigen `/beste/*`-pagina + claim + (indien nodig) normbesluit, vóór architectuur/data.

---

## 0. Samenvatting

**Verdict: NIET NU — maar niet omdat het een slecht idee is.**

IJzer en calcium zijn inhoudelijk de juiste kandidaten. Ze hebben een echte RI in bijlage XIII, de asymmetrie-regel werkt erop, en ze bedienen precies de doelgroep die net is toegevoegd. Dat is een wezenlijk sterker voorstel dan calorieën tellen.

Het blokkeert op drie dingen die niet met code op te lossen zijn:

1. **Er is geen vergelijkingspagina** voor ijzer of calcium. Elke gemeten stof heeft er nu één; dat is de hele monetisatieketen. Zonder die pagina meet je een tekort en heb je geen antwoord.
2. **De voedseldata bestaat niet.** Alle 90 voedingsmiddelen zouden opnieuw langs USDA moeten voor twee nieuwe gehaltes, op hetzelfde bronniveau als de rest.
3. **IJzer dwingt een normbesluit af** dat het product nog nooit genomen heeft: een geslachtsafhankelijke referentiewaarde. Dat is jouw besluit, niet een implementatiedetail.

Aanbeveling: doe eerst de vergelijkingspagina (die verdient zichzelf terug), dan pas de meting. Zie §8.

---

## 1. Waarom de vraag nu opkomt

De doelgroep is 23 sep verbreed naar man/vrouw 30+. Het tekortsysteem meet vijf stoffen:

| Stof | RI | Bron |
|---|---|---|
| Eiwit | 50 g (etiket) / persoonlijk | bijlage XIII + `protein-target.ts` |
| Magnesium | 375 mg | bijlage XIII |
| Zink | 10 mg | bijlage XIII |
| Vitamine D | 5 µg | bijlage XIII |
| Omega-3 | 250 mg | EFSA-claimdrempel, géén RI |

Die vijf zijn gekozen voor slaap, stress, energie en herstel bij mannen 40+. Voor vrouwen 30+ ontbreken de twee stoffen waar de tekorten in die groep feitelijk zitten: **ijzer** (menstruatie, premenopauzaal) en **calcium** (botbehoud rond en na de overgang).

Er is al vrouw-specifieke *content* (`/overgang`, vitamine D en botgezondheid, eiwit in de overgang) en `content-audience.ts` labelt al "Vrouwen 30+". De **meting** is niet meeverbreed. Dat is de scheefheid die dit document adresseert.

---

## 2. Waarom dit een beter voorstel is dan calorieën

Het eerdere voorstel in dezelfde richting — MyFitnessPal-achtige calorie- en macrodoelen — is afgewezen omdat het een *bovengrens*-vraag stelt ("heb ik te veel gegeten?") aan data die alleen een *ondergrens* kan bewijzen. Dat is de asymmetrie-regel uit `nutrition-tekortsysteem.ts`, omgekeerd.

IJzer en calcium hebben dat probleem niet:

- Het zijn **ondergrens-vragen**: "haal je genoeg binnen?"
- Ze hebben een **RI in bijlage XIII**, dus `aandeelVanRi` werkt er ongewijzigd op
- De **%-weergave is juridisch dezelfde** als bij magnesium: artikel 32 van 1169/2011 schrijft een percentage van de RI voor bij vitaminen en mineralen
- De rekenkern hoeft **niet te veranderen** — alleen de datasets

Inhoudelijk past dit dus wél in het systeem. Daarom is dit geen afwijzing maar een volgorde-kwestie.

---

## 3. Blokkade 1 — er is geen vergelijkingspagina

Dit is het zwaarste bezwaar, en het is strategisch, niet technisch.

Elke gemeten stof heeft vandaag een `comparisonPath`:

| Stof | Vergelijkingspagina |
|---|---|
| Eiwit | `/beste/eiwitpoeder` |
| Omega-3 | `/beste/omega-3-supplement` |
| Magnesium | `/beste/magnesium` |
| Vitamine D | `/beste/vitamine-d` |
| Zink | `/beste/zink` |

Dat is geen toeval maar de keten: **meet een gat → toon de route → vergelijk producten → affiliate**. Het tekortsysteem is de bovenkant van een trechter die op `/beste/*` uitkomt.

IJzer en calcium hebben geen pagina. Een tekort meten zonder route betekent: je vertelt iemand dat er een gat is en biedt geen enkele uitgang. Dat is slechter dan niet meten — het maakt het dashboard opnieuw een doodlopend scherm, precies waar het 17-sep-besluit vanaf wilde.

**Toetsing aan het focusfilter** (uit het 15-aug-verdict, twee eliminerende vragen):

- *Verandert dit wat er op een `/beste/`-pagina staat of hoeveel mensen die vinden?* → **nee**, er is geen pagina
- *Is het effect binnen 30 dagen af te lezen in organische sessies of affiliate-omzet?* → **nee**

Twee keer nee. Meting-eerst valt af op het eigen filter van het project.

Omgekeerd — **pagina-eerst** — scoort twee keer ja: een `/beste/ijzer` trekt zelfstandig organisch verkeer en kan binnen 30 dagen omzet tonen, zonder dat er ook maar één regel aan het tekortsysteem verandert.

---

## 4. Blokkade 2 — de voedseldata bestaat niet

`food-sources.ts` draagt per voedingsmiddel een `nutrientValue` met USDA `fdcId`, `sourceNameNl`, spreiding (`min`/`max`/`median`/`dataPoints`) en een `verified`-vlag. Dat niveau is niet optioneel: `BESLUIT_NEVO_BRONVERMELDING.md` en de consistency-test dwingen het af.

De tabel telt 90 unieke voedingsmiddelen. IJzer en calcium komen daarin alleen voor als *woord* in twee productnamen ("prepared with calcium sulfate", "verrijkt m calcium"). Er is geen enkel gehalte.

Wat het kost:

- 90 voedingsmiddelen × 2 stoffen = **tot 180 nieuwe gehaltes**, elk met fdcId en verificatie (minder waar een bron een stof niet noemenswaard draagt, maar dat moet je per rij vaststellen — "niet gevonden" is hier een uitspraak, geen leeg veld)
- De `NUTRIENT_ORDER`-volgorde herzien (welke stof staat waar in elke rij)
- **17 exhaustieve `Record<NutrientId, …>`-plekken** die TypeScript afdwingt — dat is goed nieuws (niets kan stilletjes ontbreken) maar wel werk
- Nieuwe `FOOD_SOURCES`-lijsten, want de huidige bronnenlijsten zijn per stof samengesteld: de beste magnesiumbronnen zijn niet de beste ijzerbronnen

Dit is datawerk, geen codewerk. Het is te doen, maar het is niet een middag.

---

## 5. Blokkade 3 — ijzer dwingt een normbesluit af

Dit is de reden dat dit document bestaat in plaats van een PR.

`reference-intake.ts` rust bewust op één principe: **de wettelijke RI uit bijlage XIII, voor een gemiddelde volwassene**. Daar is precies één uitzondering op, en die is expliciet gemarkeerd:

```ts
protein: { nutrient: "protein", value: 50, unit: "g", personalTarget: true }
```

Eiwit mag afwijken omdat er een gepubliceerde, gebronde formule onder ligt (PROT-AGE/ESPEN, `protein-target.ts`), en `personalTarget: true` maakt zichtbaar dát het afwijkt.

IJzer past daar niet netjes in:

- De **etiket-RI is 14 mg** voor iedereen (bijlage XIII)
- De **werkelijke behoefte verschilt sterk**: EFSA hanteert een gemiddelde behoefte die voor premenopauzale vrouwen duidelijk hoger ligt dan voor mannen, door menstrueel bloedverlies
- Na de overgang zakt die behoefte weer richting het mannenniveau

Drie opties, elk met een prijs:

| Optie | Wat het doet | Prijs |
|---|---|---|
| **A. Eén RI (14 mg)** | Wettelijk zuiver, geen nieuw principe | Meet het tekort dat er juist toe doet systematisch te laag voor de groep die het heeft |
| **B. Geslachtsafhankelijk** | Inhoudelijk het meest correct | Doorbreekt het bijlage-XIII-principe; vraagt een `personalTarget`-achtige markering én een gepubliceerde onderbouwing zoals eiwit die heeft |
| **C. Niet meten** | Houdt het systeem zuiver | De scheefheid blijft: je zegt "vrouwen 30+" en meet mannenstoffen |

Calcium heeft dit probleem **niet**: 800 mg in bijlage XIII, geen geslachtsonderscheid in de wettelijke waarde. Calcium zou dus los van ijzer kunnen — dat is een reële tussenweg.

**Dit is jouw besluit.** Ik kan optie B bouwen, maar dan neemt code een normbeslissing die het product nooit expliciet genomen heeft. Zoals eiwit destijds een `personalTarget`-vlag en een moduledoc kreeg, verdient ijzer dat ook — vóór de implementatie, niet erna.

Let op: geslacht wordt al uitgevraagd (`INTAKE_GENDER_OPTIONS`) en opgeslagen, maar nergens in de voedingslogica gebruikt. Optie B zou de eerste plek zijn waar geslacht een *getal* stuurt in plaats van alleen contentvolgorde. Dat is een grens die bewust gepasseerd moet worden.

---

## 6. Wat er wél al kan zonder besluit

Drie dingen die geen normbesluit en geen nieuwe data vragen:

1. **`/beste/ijzer` en `/beste/calcium` bouwen.** Losstaande vergelijkingspagina's op de bestaande `ComparisonPageData`-structuur. Scoort twee keer ja op het focusfilter.
2. **Contentdekking voor vrouwen 30+ uitbreiden.** De `content-audience.ts`-lens bestaat al; er is alleen nog weinig om te sorteren.
3. **De EFSA-claims voor ijzer en calcium in `approved-claims.ts` zetten.** Beide hebben geautoriseerde claims (ijzer: vermoeidheid, normale rodebloedcelvorming; calcium: botten). Dat is nodig vóór elke productpagina, en het is afgebakend werk.

---

## 7. De openstaande vraag — BESLIST (26 sep 2026): optie B

> **Welke ijzernorm hanteert PerfectSupplement — A, B of C uit §5?**

**Besluit: optie B, geslachtsafhankelijke RI.** Ijzer krijgt daarmee dezelfde
status als eiwit: een afwijking van de bijlage-XIII-waarde, expliciet gemarkeerd
in `reference-intake.ts`, met een gepubliceerde bron erachter — niet een getal
dat code zelf verzint.

**Wat dit besluit concreet vraagt vóór implementatie** (zie ook §9, dat al
waarschuwde dat de EFSA-onderbouwing hier nog exact gesourced moet worden):

1. Een `ReferenceIntake`-vorm die een geslachtsafhankelijke waarde kan dragen,
   analoog aan hoe `protein-target.ts` los van `reference-intake.ts` een
   persoonlijk doel berekent (`personalTarget: true` + externe module). Voor
   ijzer betekent dat waarschijnlijk: `personalTarget: true` in de RI-tabel
   (voor het etiketpercentage blijft 14 mg gelden, zoals bij eiwit) plus een
   nieuwe `iron-target.ts`-achtige module die op basis van geslacht (en evt.
   leeftijdsband voor postmenopauzaal) de dekkingswaarde bepaalt — niet de RI
   zelf.
2. **Een exacte bron**, net zo specifiek als PROT-AGE 2013 / ESPEN 2014 voor
   eiwit. §5/§9 citeren EFSA's premenopauzale ijzerbehoefte richtinggevend,
   niet uit een specifieke opinie. Vóór code: de exacte EFSA-opinie (met
   publicatiejaar en de premenopauzale/postmenopauzale getallen) opzoeken en
   hier vastleggen, zoals dit document dat voor calcium/ijzer-RI's uit bijlage
   XIII al deed in §9.
3. **Postmenopauzale grens.** §5 noemt dat de behoefte na de overgang weer
   richting het mannenniveau zakt. Dat vraagt een leeftijds- of overgangs-brug
   die vandaag nergens in de intake zit voor voedingsdoeleinden (alleen
   `INTAKE_GENDER_OPTIONS` bestaat al, zie §5-slot). Dit wordt onderdeel van
   de iron-target-module, niet van `reference-intake.ts`.
4. Dit is een **aparte implementatiestap**, niet iets dat meelift in de
   `/beste/ijzer`-pagina van §8 stap 1. De pagina en de EFSA-claim hebben geen
   geslachtsafhankelijke norm nodig (een vergelijkingspagina toont producten,
   geen persoonlijke dekking) — de norm is pas nodig zodra het tekortsysteem
   zelf ijzer gaat meten (§8 stap 4).

**Calcium blijft ongewijzigd**: 800 mg, geen geslachtsonderscheid, `personalTarget: false` — dat lag al vast en verandert niet door dit besluit.

Bijvraag uit de vorige versie van dit document (**beantwoord**): **mag calcium
vooruit zonder ijzer?** Ja — calcium heeft geen normprobleem en kan zijn eigen
`/beste/calcium` + claim + meting-traject onafhankelijk doorlopen. Ze hoeven
niet gelijk op te lopen in tempo, al doorlopen beide dezelfde volgorde uit §8.

---

## 8. Aanbevolen volgorde

1. **`/beste/ijzer` + `/beste/calcium`** — verdient zichzelf terug, onafhankelijk van al het andere, en maakt de keten compleet vóórdat de meting hem nodig heeft
2. **EFSA-claims** voor beide stoffen in `approved-claims.ts` (voorwaarde voor 1)
3. ~~Normbesluit ijzer (§7)~~ — **beslist 26 sep: optie B.** De uitwerking (bron opzoeken, `iron-target.ts`-module) is werk, geen open gesprek meer, maar blijft losstaand van stap 1-2: de pagina heeft de norm niet nodig.
4. **Dan pas** de voedseldata en de uitbreiding van `NutrientId` — inclusief de iron-target-module uit §7

Stap 1 en 2 kunnen nu beginnen, onafhankelijk van stap 3. Stap 4 is pas verdedigbaar als 1 t/m 3 er zijn (voor ijzer: inclusief de gesourcte bron uit §7.2) — anders meet je een gat waar geen uitgang bij hoort, of leg je een norm vast zonder de onderbouwing die eiwit wél heeft.

**Reikwijdte-opmerking (26 sep):** dit besluit gaat over ijzer en calcium. Een
bredere uitbreiding naar meer bijlage-XIII-stoffen (vitamine K, foliumzuur,
B12, vitamine C, of de volledige catalogus) volgt — als en wanneer dat gebeurt
— hetzelfde patroon: eerst pagina + claim per stof, dan pas architectuur/data,
en elk normprobleem krijgt zijn eigen besluit zoals ijzer dat hier kreeg. Dat
is nu geen goedgekeurd vervolgplan, alleen het toe te passen patroon.

---

## 9. Te verifiëren vóór implementatie

Twee getallen in dit document komen uit bijlage XIII van EU 1169/2011 en staan
**nog nergens in de codebase** — er is dus geen bestaande waarde om ze tegen te
toetsen:

- **IJzer: 14 mg** RI
- **Calcium: 800 mg** RI

Beide horen bij het opnemen in `reference-intake.ts` tegen de verordeningstekst
zelf gecontroleerd te worden, net zoals de vijf huidige waarden dat destijds
zijn. De EFSA-uitspraak in §5 over de hogere ijzerbehoefte bij premenopauzale
vrouwen is richtinggevend geciteerd, niet uit een specifieke opinie
overgenomen: wie optie B kiest, heeft daar een exacte bron bij nodig — dat is
precies het niveau van onderbouwing dat `protein-target.ts` voor eiwit wél
heeft (PROT-AGE 2013, ESPEN 2014) en dat een afwijking van de wettelijke RI
rechtvaardigt.

---

## 10. Wat dit document níét zegt

Niet: "ijzer en calcium horen er niet bij." Ze horen er wél bij, en de doelgroepverbreding maakt dat alleen maar waarder.

Niet: "dit is te duur." Het is te doen — het is alleen groter dan het lijkt, en de volgorde bepaalt of het geld oplevert of alleen geld kost.

Wel: bouwen aan de meting vóórdat de route en de norm er zijn, herhaalt precies de fout die het 17-sep-besluit repareerde — een dashboard dat meet en nergens heen wijst.
