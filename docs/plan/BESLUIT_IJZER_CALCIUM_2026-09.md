# Besluit — ijzer en calcium als gemeten stoffen?

**Datum:** 23 september 2026
**Status:** verdict geschreven, besluit ligt bij Dennis — §7 is de openstaande vraag
**Aanleiding:** doelgroepverbreding van "mannen 40+" naar "mannen en vrouwen 30+" (23 sep).
De vraag die daaruit volgt: de helft van de nieuwe doelgroep heeft een tekortprofiel dat
dit product niet meet.
**Vervolg op:** [`BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md`](./BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md)
(het tekortsysteem dat hier uitgebreid zou worden)

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

## 7. De openstaande vraag

> **Welke ijzernorm hanteert PerfectSupplement — A, B of C uit §5?**

Daar hangt alles achter. Zolang die niet beantwoord is, is bouwen aan de meting het verkeerde werk: elke implementatie legt impliciet een antwoord vast.

Bijvraag, los te beantwoorden: **mag calcium vooruit zonder ijzer?** Calcium heeft geen normprobleem, dus technisch kan het. Inhoudelijk is het de helft van het verhaal — botbehoud zonder het tekort dat vrouwen 30+ het vaakst hebben.

---

## 8. Aanbevolen volgorde

1. **`/beste/ijzer` + `/beste/calcium`** — verdient zichzelf terug, onafhankelijk van al het andere, en maakt de keten compleet vóórdat de meting hem nodig heeft
2. **EFSA-claims** voor beide stoffen in `approved-claims.ts` (voorwaarde voor 1)
3. **Normbesluit ijzer** (§7) — een gesprek, geen bouwslice
4. **Dan pas** de voedseldata en de uitbreiding van `NutrientId`

Stap 1 en 2 kunnen nu beginnen. Stap 4 is pas verdedigbaar als 1 t/m 3 er zijn — anders meet je een gat waar geen uitgang bij hoort.

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
