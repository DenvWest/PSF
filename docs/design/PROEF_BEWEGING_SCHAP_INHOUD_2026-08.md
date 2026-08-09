# Inhoudsproef — kan het beweging-schap eerlijk gevuld worden?

> **Status: proef, geen implementatie.** Geen code, geen schema, geen surface-werk zolang deze proef loopt.
> Opgesteld 6 augustus 2026, na het Claude-verdict A–H, het wederwoord A′–H′, en een revisieronde op correcties 1–5 plus het auteur-toetser-risico.
> **Wat dit beslist:** of de keuze-ladder (`#b`) als hart van het kompas-domein kan bestaan. Zo niet, dan is die vraag beantwoord zonder dat er iets gebouwd is.
> **Verwante docs:** `[BESLUIT_BEWEGING_PRODUCT_EN_IA.md](BESLUIT_BEWEGING_PRODUCT_EN_IA.md)` · `[BESLUIT_FIT_PREFS.md](BESLUIT_FIT_PREFS.md)` · `[beweging-keuze-consumentenbond-prebuild-v3-2026-08.html](beweging-keuze-consumentenbond-prebuild-v3-2026-08.html)`

---

## 1. Waarom deze proef vóór de bouw komt

De bindende beperking van het hele B-spoor is redactioneel, niet technisch. Een schap bouwen is een paar weken werk; acht oordelen schrijven die de onafhankelijkheidsclaim dragen is de eigenlijke opgave, en niemand heeft het ooit één keer gedaan.

Twee besluiten hangen er rechtstreeks aan, en beide zijn goedkoper ná de proef dan ervoor:

- **Het tabelschema.** Een schema dat vastligt vóór het eerste schap codeert de gok van vandaag over wat een optie is. Twee dingen veranderen vermoedelijk zodra er echte opties op papier staan: de rol-waarden worden breder dan drie, en er komt een optie waar het "Wat pleit tegen"-slot leeg is. Beide zijn hier zichtbaar en nergens anders.
- **De vorm van de ingang naar het schap.** Je ontwerpt geen deur naar een ruimte die nog niet bestaat.

## 2. De regel die de proef eerlijk houdt

De slaagcriteria in §3 staan vast **voordat** de eerste optie geschreven wordt en worden tijdens het invullen niet aangepast. Blijkt een criterium onhaalbaar, dan is dat de uitkomst van de proef — geen aanleiding om de lat te verzetten.

Tijdsbudget: **één week.** Loopt het uit, dan is dat óók een uitkomst: het zegt wat één eerlijk oordeel kost, en dat getal is de prijs van elk volgend domein.

### Schrijfvolgorde — vastgelegd vóór de eerste kaart

Dennis schrijft alle acht oordelen zelf en is daarmee tegelijk auteur en toetser van de onafhankelijkheidsclaim. Onderstaande volgorde is de lichtste tegenmaatregel die daadwerkelijk werkt, zonder een zwaarder proces (peer review, blind panel) vóór slice A nodig te maken.

1. **Creatine eerst.** Hoogste risico op zelfverzachting: er loopt commissie op (`is_monetised: ja`), de bestaande plan-stap `mov-creatine-vergelijk` verwijst er vandaag al actief naartoe, en de claim past deels bij de doelgroep. Schrijf as 1 als feit (zie §5, "feiten vóór oordeel") vóórdat `editorial_verdict` wordt ingevuld.
2. **Eiwitpoeder direct daarna.** Lager risico — er is geen goedgekeurde claim, dus as 1 dwingt vanzelf tot terughoudendheid.
3. **S5a voor beide, onmiddellijk** — ongeacht het oordeel (zie §3): schrijf de consequentie voor de bestaande surface uit vóórdat kaart 3 geopend wordt.
4. **Dateren en bevriezen.** Zodra creatine en eiwitpoeder S5a doorlopen hebben, ligt `editorial_verdict` op die twee vast voor de rest van de proef. Aanpassen om S2 sluitend te krijgen is geen stille revisie maar een bevinding — noteer die in §7.
5. **Kaarten 3 t/m 8 (of meer, zie S1).** Dienst, sociaal en resterende basis-kaarten, in willekeurige volgorde.

**Twee klokken (S8), apart bijgehouden:** zoektijd en oordeeltijd. Verwacht bij creatine en eiwitpoeder een lage zoektijd (de claims staan al in de repo) tegenover een hoge oordeeltijd (de S5a-druk zit op deze twee kaarten); bij dienst-kaarten is de verhouding vermoedelijk omgekeerd.

## 3. Slaagcriteria — hard en telbaar


| #   | Criterium                                                                                                                                                                                                                                                                                   | Waarom                                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | **Minimaal 8 opties**, exclusief het eigen basisadvies (kracht thuis 2×/week). Opties van het type `basis` tellen wél mee. Er is geen bovengrens — landen er meer geldige kaarten (zie S8-begroting), dan gaan ze allemaal op het schap                                                     | Onder 8 is er geen spreiding om een oordeel geloofwaardig in te tonen. Zonder bovengrens is S2 een ondergrens en geen exacte partitie die het oordeel van de laatste kaarten forceert                             |
| S2  | **≥ 3 sterk · ≥ 3 zwak · ≥ 2 niet**, geteld over alle types heen                                                                                                                                                                                                                            | Per type tellen zou dwingen tot een verzonnen zwak product in een domein waar producten juist irrelevant zijn                                                                                                     |
| S3  | **≥ 2 optietypes** vertegenwoordigd                                                                                                                                                                                                                                                         | Zonder deze regel wordt het schap acht diensten, en dan is het een lead-genpagina                                                                                                                                 |
| S4  | **Registratieplicht, geen poort.** `is_monetised` is op elke kaart verplicht ingevuld; de telling "≥ 3 niet-gemonetiseerd" wordt genoteerd maar niet getoetst                                                                                                                               | Diensten en sociale opties hebben geen aanbieder en dus geen commissie; het domein is structureel ≥ 6 niet-gemonetiseerd, dus de telling kan niet falen en meet dus niets. Vanaf domein 2 wordt hij weer toetsend |
| S5a | Voor **elke** optie met `is_monetised: ja` wordt de consistentie met de bestaande surface uitgeschreven — **ongeacht het oordeel.** Bij `zwak`/`niet`: welke plek botst (pad + stap-id) + vervangende copy. Bij `sterk`: expliciete verantwoording waarom de bestaande doorverwijzing klopt | Onvoorwaardelijk, anders schakelt een gunstig oordeel de eigen controle uit — dat zou de toets circulair maken                                                                                                    |
| S5b | Die consequentie is **doorgevoerd** vóór het schap deployt                                                                                                                                                                                                                                  | Poort op slice A, niet op de proef — de proef mag geen code raken (§9)                                                                                                                                            |
| S6  | **Alle vier assen ingevuld** per optie. Een leeg slot is geen oordeel; de optie valt dan af en telt niet mee voor S1                                                                                                                                                                        | Reproduceerbaarheid: de redactie moet dit over 32 oordelen kunnen volhouden                                                                                                                                       |
| S7  | **Nul** dienst-kaarten waarvan as 1 of as 2 alleen een mening is zonder aanwijsbaar document dat de lezer zelf kan opvragen. Een aantoonbaar ontbrekend register is een geldig antwoord op die as                                                                                           | Eén uitzondering maakt de hele kaartenset onfalsifieerbaar; "geen register bestaat" is sterker dan een verzonnen check                                                                                            |
| S8  | Doorlooptijd **≤ 1 week**, over **10 tot 12 pogingen** (S6 laat kaarten afvallen), met per poging **twee** apart geregistreerde tijden: zoektijd en oordeeltijd                                                                                                                             | Levert de prijs per oordeel, en daarmee de haalbaarheid van S2 voor de andere domeinen — de twee klokken omdat latere domeinen de zoektijd niet cadeau krijgen die dit overzicht nu al wegneemt                   |
| S9  | **≥ 3 kaarten** met een eerste stap die vandaag uitvoerbaar is zonder aankoop en zonder afspraak                                                                                                                                                                                            | Zonder dit criterium kan het schap slagen met acht nette disclaimers en nul gedrag — S9 bewaakt dat het schap ook iets oplevert, niet alleen iets beoordeelt                                                      |


## 4. Monetisatie-regel — twee velden, twee verplichte kaarten

Geverifieerd, en dit corrigeert de eerdere versie van dit document: beweging start **niet** schoon. `[src/data/affiliate-links.ts](../../src/data/affiliate-links.ts)` bevat wél twee beweging-producten met vandaag lopende commissie — **creatine** (drie links, r33-39) en **eiwitpoeder** (drie links, r57-63) — en `[DOMAIN_PRODUCT_STANCE.movement](../../src/data/domain-product-stance.ts#L21-L24)` wijst het domein exact deze twee toe als kandidaten. De relatie bestaat dus al, en ze is niet handmatig gekozen.

**Twee velden, twee betekenissen, allebei verplicht op elke kaart:**


| Veld              | Betekenis                                                                           | Verifieerbaar aan             |
| ----------------- | ----------------------------------------------------------------------------------- | ----------------------------- |
| `is_monetised`    | **Feit.** Loopt er vandaag commissie op deze optie                                  | `affiliate-links.ts`          |
| `zou_monetiseren` | **Voornemen.** Zou deze optie bij een positief oordeel een commissierelatie krijgen | Redactioneel, vooraf ingevuld |


**Creatine en eiwitpoeder staan verplicht op het schap** en tellen mee voor S1. Ze weglaten zou de proef laten slagen precies op de plek waar hij niets bewijst — het zijn de enige twee opties met `is_monetised: ja`.

**Wat er overblijft van "oordeel eerst, commissie volgt":** het principe gold nooit voor het hele schap. De prebuild wist dat zelf al — de magnesium-kaart draagt de chip "Nu niet" mét de commissieregel eronder (v3, r919-945), een negatief oordeel op een gemonetiseerd product (magnesium heeft drie affiliate-links, r49-55). De herformulering, in twee clausules:

> **Waar commissie al loopt, moet het oordeel haar kunnen intrekken. Waar ze nog niet loopt, komt ze pas ná het oordeel.**

Clausule 1 geldt voor product en is de reden dat S5a bestaat. Clausule 2 geldt voor dienst en sociaal, en is afdwingbaar zolang die kaarten geen aanbieder noemen (zie §5).

**Twee feiten liggen al vast in de repo en beperken het oordeel op de twee verplichte kaarten vooraf — dit is geen invulling, dit is wat er staat:**

- Eiwitpoeder heeft **geen** goedgekeurde claim: `[approved-claims.ts:368-376](../../src/data/approved-claims.ts#L368-L376)` — `claims: []`, `supportingEvidence: []`, met de note *"Geen EU-gezondheidsclaims op eiwit als zodanig. Vergelijking is inname/praktijk, geen statusclaim."*
- Creatine heeft voor de doelgroep 40-55 alleen `creatine.performance` (korte, zeer intensieve inspanning, `[approved-claims.ts:330-336](../../src/data/approved-claims.ts#L330-L336)`); `creatine.strength-55plus` — de claim over weerstandstraining en spierkracht — geldt blijkens de conditie en de note uitsluitend voor 55+, `[approved-claims.ts:337-344](../../src/data/approved-claims.ts#L337-L344)`.

Deze twee feiten horen op as 1 vóór er een oordeel geschreven wordt — zie de schrijfvolgorde in §2, regel "feiten vóór oordeel" in §5.

## 5. De vier assen per optietype

Vaste toetslat. De uitklap heeft altijd dezelfde vier sloten:

**Gecheckt · Wat pleit vóór · Wat pleit tegen · Oordeel**

(Niet langer Sterk/Zwak — die namen botsten met de bond-as `sterk`/`zwak`/`niet`: bij een `zwak`-oordeel zou het Sterk-slot alsnog iets positiefs moeten zeggen. De middelste twee sloten zijn nu argumenten, het laatste is de conclusie.)

**Dienst-kaarten noemen voorlopig geen aanbieder** — generieke diensttypen (personal training, groepsles, online begeleiding, fysiotherapie), geen bedrijfsnamen. Reden: as 1 en as 2 vereisen anders actuele, geverifieerde feiten over bestaande bedrijven, en die zonder bron invullen zou fabricatie zijn onder eigen naam.

**Basis** (ons eigen gratis advies) — ongewijzigd

1. Bewijskracht van het mechanisme, met bron
2. Haalbaarheid 40+ zonder uitrusting of lidmaatschap
3. Belastbaarheid: past het náást de dagstap of vervangt het die
4. Wat er misgaat bij verkeerde uitvoering

**Dienst** — as 1 en as 2 herschreven van bedrijfsfeiten naar type-vragen

1. Welk bewijs van bekwaamheid hoort bij dit diensttype, bestaat daar een onafhankelijk register voor, en waar vraag je het op
2. Welke contractvorm is gebruikelijk bij dit type, welk document legt dat vast, en welke bepaling zoek je daarin op
3. Wat er ná de looptijd overblijft
4. Wat je zelf moet blijven doen

**Product** — ongewijzigd

1. Goedgekeurde claim of niet (`[approved-claims.ts](../../src/data/approved-claims.ts)`)
2. Dosering versus onderzochte dosering
3. Meet onze check dit signaal überhaupt
4. Doet leefstijl hetzelfde, goedkoper

**Sociaal** — ongewijzigd

1. Toegankelijkheid: kosten, drempel, hoe je begint
2. Continuïteit: bestaat het over drie maanden nog
3. Verplichting naar anderen — de werkzame factor
4. Wat het níét is (geen behandeling, geen therapie)

**Dienst versus sociaal — het onderscheid blijft staan, op precies één kenmerk.** Zonder aanbieder vervallen de eerdere onderscheidende kenmerken (aanbieder, contract, commissie). Wat overblijft: **dienst = de werkzame factor is een betaalde professional; sociaal = de werkzame factor zijn de andere deelnemers.** Een groepsles met een docent is dienst; een hardloopgroepje in de buurt is sociaal, ook mét contributie.

**Feiten vóór oordeel — voor alle vier de types.** Leg eerst de assen vast als feit (claim-status en leeftijdsgrens bij product; documentnaam en vindplaats bij dienst) en schrijf pas dáárna het Oordeel-slot. Dit beperkt hoeveel het `editorial_verdict` kan afwijken van de eigen feiten.

**Oordeelwoorden en veldnaam.** Bond-as: `sterk` · `zwak` · `niet`, opgeslagen als `**editorial_verdict`** — niet `verdict`. Dat woord is al bezet door het bestaande, per-account `VerdictValue` (`kopen | niet_nodig | eerst_leefstijl | nooit`, `[types/verdict.ts:6](../../src/types/verdict.ts#L6)`) met zijn eigen `VerdictEvidence`-snapshot (`[types/verdict.ts:17-23](../../src/types/verdict.ts#L17-L23)` — scores, signals, profileLabel, triggeredBy, nutritionLogCompleted). Dat is een per-account-oordeel; het bond-oordeel is redactioneel en account-onafhankelijk. Twee verschillende objecten horen niet in dezelfde kolom en niet in dezelfde tabel: `editorial_verdict` krijgt een **eigen store**, naast `supplement_verdicts`, nooit erin samengevoegd — wat generaliseert is het patroon (`rules_version` + `next_review_at`, zie `[supplement-verdict-store.ts:13-14](../../src/lib/supplement-verdict-store.ts#L13-L14)`), niet de tabel zelf.

De publieksformulering op de chip (de prebuild toont "Aanrader" / "Alleen als…" / "Nu niet") is een aparte copy-beslissing en hoort hier niet thuis — "Aanrader" is een uitspraak over de lezer en dus fit, niet bond.

## 6. Invulformat per optie

Neem dit blok over voor elke optie (minimaal 8, zie S1/S8). Verzin geen velden bij; ontbreekt er een veld, dan is dat een bevinding voor §7.

```
OPTIE <n>
option_key        : <stabiel, handmatig, namespaced per domein, nooit uit de titel>
titel             : 
option_type       : basis | dienst | product | sociaal
rol               : aanvulling | vervanging | eenmalig
editorial_verdict : sterk | zwak | niet
is_monetised      : ja | nee        <- feit: loopt er vandaag commissie
zou_monetiseren   : ja | nee        <- voornemen bij een positief oordeel
aanbieder         : <leeg — dienst-kaarten noemen voorlopig geen aanbieder>

Gecheckt          : <de vier assen van dit type, elk expliciet beantwoord als feit>
Wat pleit vóór    : 
Wat pleit tegen   : 
Oordeel           : <één alinea; de chip is hiervan de samenvatting>

Commissieregel    : <bij is_monetised: ja de commissiezin; bij nee: "Hier verdienen we niets aan.">
S5a-consequentie  : <verplicht bij is_monetised: ja, ongeacht het oordeel — welke bestaande
                      plek dit raakt (pad + stap-id), en waarom de bestaande copy klopt of niet>
Zoektijd          : <minuten>
Oordeeltijd       : <minuten>
```

### Gevulde voorbeeld-optie (de lat)

Dezelfde kaart als in de vorige versie van dit document, nu zonder aanbieder en met de nieuwe sloten. Dit is de enige kaart die niet door Dennis geschreven wordt.

```
OPTIE 0 (voorbeeld, telt niet mee)
option_key        : beweging.online-begeleidingstraject-8-weken
titel             : Een online begeleidingstraject van acht weken
option_type       : dienst
rol               : aanvulling
editorial_verdict : zwak
is_monetised      : nee
zou_monetiseren   : ja
aanbieder         : —

Gecheckt        : 1) Bekwaamheid — voor online beweegbegeleiding bestaat in Nederland
                     geen onafhankelijk register. Wat je kunt opvragen is de certificering
                     die de begeleider zelf noemt, en wie die heeft afgegeven. Vraag door
                     op wie de sessies daadwerkelijk doet: dat is niet altijd degene die
                     je op de website ziet.
                  2) Contractvorm — vastgelegd in de algemene voorwaarden. Zoek twee
                     bepalingen op: de opzegtermijn, en of het traject stilzwijgend
                     verlengt. Vraag ze op vóór je betaalt, niet erna.
                  3) Ná de looptijd — bij een traject met een vaste eindweek is dit de
                     zwakke plek van het hele type. Vraag expliciet wat er in week 9
                     gebeurt.
                  4) Eigen inzet — je traint zelfstandig tussen de contactmomenten door.
                     De begeleiding vervangt het werk niet, hij richt het.

Wat pleit vóór  : Een vast schema en een terugkerend contactmoment. Voor wie eerder
                  gestopt is, is dat contactmoment vaak het verschil — niet het schema.
Wat pleit tegen : Het type kent een harde einddatum zonder afbouw. Precies op het
                  moment dat de gewoonte nog het minst vaststaat, valt de structuur weg.
Oordeel         : Bruikbaar om te beginnen, niet om op te bouwen. Kies dit type alleen
                  als je vooraf antwoord krijgt op wat er ná week 8 gebeurt; blijft dat
                  antwoord uit, dan koop je acht weken structuur en daarna niets.

Commissieregel    : Hier verdienen we niets aan.
S5a-consequentie  : n.v.t. (is_monetised: nee)
Zoektijd          : —
Oordeeltijd       : —
```

## 7. Wat je registreert tijdens het invullen

Dit is de eigenlijke opbrengst van de proef. Noteer elk voorval, ook als het klein lijkt — hier komt het schema uit, en hier sneuvelt of overleeft het raamwerk.


| Signaal                                                                                                | Wat het betekent                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Het **"Wat pleit tegen"-slot** dreigt leeg te blijven en je merkt dat je iets verzint om het te vullen | De vier vaste sloten kloppen niet voor elk type; het schema heeft een nullable-slot nodig of het raamwerk moet per type verschillen |
| Een optie past **niet in** `aanvulling` / `vervanging` / `eenmalig`                                    | De rol-enum is te smal. Noteer welke rol ontbrak                                                                                    |
| Een **as is n.v.t.** voor deze optie                                                                   | Voorspelde breuk bij sociaal (geen aanbieder, geen contract). Twee of meer n.v.t. op vier assen betekent dat het een eigen type is  |
| Je kunt een bewering **niet verifiëren zonder de aanbieder te geloven**                                | Het kernbezwaar tegen dienst-first. Tel deze apart — dit getal bepaalt of het schap een oordeel is of een doorgeefluik              |
| Een dienst-as valt terug op **"geen register/document bestaat"** (de S7-uitweg)                        | Geldig antwoord, maar telt apart — te vaak gebruikt betekent dat het diensttype zelf niet toetsbaar is                              |
| Je hebt een **bron** nodig die je niet hebt                                                            | Redactiekosten die in geen enkele planning stonden                                                                                  |
| Je past `editorial_verdict` op creatine of eiwitpoeder aan **ná** het dateren/bevriezen (§2)           | Geen stille revisie toegestaan — dit is zelf een bevinding over het auteur-toetser-risico, geen correctie                           |
| **Zoektijd en oordeeltijd per optie**                                                                  | Vermenigvuldigd met 32 (4 domeinen × 8) is dit het jaarbudget van de redactie, inclusief het herzieningsritme                       |


## 8. Uitkomst en beslisregel

**Alle criteria gehaald (S1 t/m S9).** De keuze-ladder kan bestaan. Dan pas, in deze volgorde: schema afleiden uit de ingevulde blokken (beschrijving, geen voorspelling), S5b doorvoeren op de bestaande surface, vorm van de permanente ingang bepalen, en daarna het schap bouwen als lees-staat.

**S1, S2, S3, S6, S9 gehaald, S5a of S7 niet.** Het schap kan bestaan maar de onafhankelijkheidsclaim nog niet. Bouw het dan zonder de kaarten die S5a of S7 niet doorstaan, of stel uit tot je een oordeel kunt schrijven dat niet op de aanbieder leunt en dat de bestaande verwijzing niet tegenspreekt.

**S1 of S2 niet gehaald op beweging.** Dan is de vraag beantwoord: als het rijkste domein geen acht eerlijke opties draagt, dragen slaap, stress en verbinding dat zeker niet. De keuze-ladder wordt dan geen hart maar een dunne, expliciet begrensde deur, en het preselect-spoor krijgt voorrang.

**S9 niet gehaald, de rest wel.** Het schap kan bestaan als beoordelingsinstrument maar niet als gedragslus — acht nette disclaimers, nul dagen die je vandaag kunt beginnen. Bouw het dan mét een zichtbare markering welke kaarten vandaag uitvoerbaar zijn, en behandel het tekort als een redactionele achterstand, niet als een architectuurfout.

**S8 niet gehaald.** Het schap kan bestaan maar niet schalen. Dan is beweging het enige domein met een schap, en de generalisatie naar alle domeinen vervalt tot de redactiecapaciteit anders is.

**S4 is geen faalvoorwaarde** — hij is een verplichte registratie (zie §3) die voor beweging structureel niet kan falen en daarom niet in deze beslisboom voorkomt.

## 9. Wat dit document niet is

Geen UI-copy, geen prebuild-revisie, geen schema. De ingevulde blokken zijn redactionele brontekst; de publieksformulering komt later en apart.

## 10. Herbruikbaarheidscontract


| Onderdeel                       | Eén keer gebouwd (gedeeld component/lib)                                                                      | Per domein (data)                      | Wie levert de data  | Wat er breekt als dit tóch per domein gebouwd wordt                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| **Schap-surface (lees-staat)**  | Volledig: lijst, filters op `option_type`, disclosure-blok, basis-strip                                       | Welke opties, welke basis bovenaan     | Redactie            | Vijf lijstschermen die uiteenlopen in gedrag; elke bugfix vijf keer                             |
| **Oordeelkaart, vier sloten**   | Volledig: kaartmodel, uitklap, chip, rol-regel                                                                | De vier sloten per optie               | Redactie            | Het bewijs raakt per domein anders opgebouwd, en de vergelijkbaarheid tussen domeinen verdwijnt |
| **Assenraamwerk per optietype** | Volledig: vier types × vier assen als config, niet als tekst in een component                                 | Geen — domein-onafhankelijk            | Eenmalig vastgelegd | De redactie verzint per domein nieuwe assen en de reproduceerbaarheid van S6 valt weg           |
| **Bond-oordeel + chip-copy**    | Volledig: `editorial_verdict`-enum + chip-mapping                                                             | Geen                                   | Eenmalig            | Drie ladders naast elkaar — de fout die dit document al één keer heeft moeten repareren         |
| **Fit-lens Voor jou / Bij jou** | De sorteermechaniek en een **optionele** tweede tab (0 of 1)                                                  | Of het domein een tweede as heeft      | Per domein besloten | Bij slaap staat er een lege tab "Bij jou"                                                       |
| **Disclosure + commissieregel** | Volledig: schap-brede regel + de per-kaart-zin in beide richtingen                                            | `is_monetised` per optie               | Redactie            | De belofte gaat per domein anders luiden en is dan geen belofte meer                            |
| **Permanente ingang**           | De actie-soort en het label                                                                                   | Waar hij hangt binnen de domein-chrome | Bouw                | Vijf verschillende plekken; de gebruiker leert het patroon nooit                                |
| **Favorieten**                  | Volledig: opslag, statussen, `eenmalig`-afhandeling                                                           | Geen                                   | —                   | Tweede opslag met een andere completie-semantiek                                                |
| **Koppeling Mijn Dag**          | De expliciete koppelhandeling                                                                                 | Agenda-categorie per domein            | Bouw                | Auto-koppeling sluipt terug bij het domein waar het "logisch voelt"                             |
| **Hertest 14/30d**              | Volledig — het ritme staat al gedeeld (`[kompas-domain-check.ts:9](../../src/lib/kompas-domain-check.ts#L9)`) | Welke check, welke items               | Bestaat al          | Twee hermeetkalenders die uiteenlopen                                                           |
| **Meetpad**                     | Volledig: `choice.`*-events met `domain` in de payload vanaf de eerste emit                                   | Geen                                   | —                   | Per domein een eigen eventnaam; geen cross-domein-vergelijking meer mogelijk                    |


**Vuistregel voor wat in slice A al generiek moet:** generiek maken wat een kolom of een payload-sleutel is; specifiek laten wat een tekst of een plaatsing is.


| Nu al generiek                                                              | Bewust beweging-specifiek                                           |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `option_key` namespaced per domein                                          | De inhoud van de acht opties                                        |
| De kaart neemt `domain` als parameter en leest de assen uit een type-config | De copy in de sloten                                                |
| `choice.`*-events dragen `domain` vanaf de eerste emit                      | De plaats van de ingang binnen de beweging-chrome                   |
| Favorieten-opslag is niet domein-gescopeerd                                 | De koppeling naar de dagstap — alleen beweging heeft een tier-model |
| De lens-schakelaar is optioneel, niet vast tweetabs                         | De tweede lens-as (die bestaat nu niet)                             |


**Bestaande haakjes, per stuk:**


| Haakje                                                                | Oordeel                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[domain-role.ts](../../src/lib/domain-role.ts)`                      | **Draagt het ongewijzigd.** `isInterventionDomain` is exact de poort: energie en herstel zijn readout en krijgen nooit een schap                                                                                                                                                                                                                                                                                        |
| `[domain-product-stance.ts](../../src/data/domain-product-stance.ts)` | **Draagt het, belangrijkste haakje.** Kent al `lifestyle_first` als expliciet oordeel mét reden. **Uitbreiden:** moet ook dienst- en sociaal-stance gaan dragen; let op de consumer op `[build-recommendations.ts:114-115](../../src/lib/build-recommendations.ts#L114-L115)` die de slugs direct leest                                                                                                                 |
| `[kompas-domain-actions.ts](../../src/lib/kompas-domain-actions.ts)`  | **Draagt het met kleine uitbreiding.** Levert nu `checkin                                                                                                                                                                                                                                                                                                                                                               |
| `[context-rail.ts](../../src/lib/context-rail.ts)`                    | **Draagt het deels.** `ContextRailTool` heeft de goede vorm, maar `buildBewegingRailTools()` (`[context-rail.ts:71-86](../../src/lib/context-rail.ts#L71-L86)`) is hardgecodeerd per domein — generieke variant nodig. De rail bestaat bovendien niet onder 768px (`[CockpitContextRail.tsx:242](../../src/components/dashboard/cockpit/CockpitContextRail.tsx#L242)`, `md:flex`), dus kan de ingang niet alléén dragen |
| `src/components/dashboard/kompas/`*                                   | **Past niet als drager.** Negen componenten voor home, status, readout en voortgang — geen ervan is een lijst met oordelen. Bouw het schap als nieuw component, niet als uitbreiding van `KompasOndersteuningTile` (hangt aan `supplement_verdicts` en emit `dashboard.verdict_clicked`)                                                                                                                                |


**Waar het gedeelde deel een keurslijf wordt:**

- **Verbinding, op "koppeling naar Mijn Dag".** Bij beweging is een gekozen optie iets dat je op een dag zet. Bij verbinding is de werkzame factor herhaald contact met anderen; een ingeplande *"bel iemand om 19:00"* is niet een zwakkere vorm van de interventie maar de verkeerde vorm. Een verplichte gedeelde koppeling dwingt verbinding in een agenda-vorm die het effect ondermijnt.
- **Voeding, op de oordeelkaart.** Veel voedingsopties zijn gedragingen waar het "Wat pleit tegen"-slot leeg blijft — de S6-vraag komt daar harder terug dan bij beweging. Slaagt het slot bij beweging altijd, dan is dat nog geen bewijs voor voeding.

## 11. Prebuild-generalisatie


| Scherm                          | Categorie             | Wat er per domein verandert                                                                                                                                                           |
| ------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#s-a** eerste keer (r660)     | **B**                 | Kop, lead, de drie spec-labels (*Vorm · Duur · Plek* zijn beweeg-woorden) en de duur-chips (een dosis-dial die alleen beweging heeft)                                                 |
| **#s-e** elke dag daarna (r704) | **B**, met voorbehoud | Het *"ik doe de korte"*-alternatief is een dosisverkleining; bestaat bij slaap, niet bij verbinding. Voor verbinding is dit scherm niet van toepassing, niet "anders" — zie hieronder |
| **#s-b** maak een keuze (r760)  | **A**                 | Alles is data: basis-strip, filterchips op `option_type`, disclosure, kaartenlijst. `sociaal` komt erbij als vierde filterchip — een waarde, geen structuur                           |
| **#s-c** gekozen (r1089)        | **B**                 | De *"eenmalige afspraak"*-microcopy, wat er precies gemeten wordt in het 14/30-blok, en het eigen-begeleiding-blok                                                                    |
| **#s-d** Mijn Dag (r1198)       | **A**                 | Niets — al domein-overstijgend van opzet                                                                                                                                              |


**Nul nieuwe prebuilds voor domein 2 tot en met 5** — met één voorbehoud dat over een domein gaat, niet over een scherm (zie verbinding hieronder).

**Fit-lens bij slaap en stress.** *"Bij jou"* is beweging-specifiek omdat beweging het enige domein is waar een optie een plaats heeft; bij slaap of stress is er niets equivalents. Gevolg is niet dat de lens vervalt maar dat hij **optioneel** wordt: 0 of 1 extra tab, geen vaste tweetabs. *Voor jou* is universeel en ship in slice A zonder tabbalk; de tabbalk verschijnt pas als er een tweede as bestaat, en die bestaat niet tot `pd_partners` locaties draagt (geen locatiekolom vandaag, `[pd_partners](../../supabase/migrations/20260712120000_partnerdesk_fase1.sql#L37-L55)`).

**Verbinding en #s-a.** Kan bestaan — de score komt uit de algemene Leefstijlcheck, niet uit een eigen check. Maar de inhoud van #s-a is *"dit is je plan, zet het op je dag"*, en verbinding heeft geen plan en geen dagstap (`[kompas-domain-actions.ts:108-116](../../src/lib/kompas-domain-actions.ts#L108-L116)`). Wat overblijft is #s-b. **Verbinding begint dus noodgedwongen bij #s-b — een uitzondering die de regel bevestigt, geen bewijs dat #s-b het hart is.** Verbinding is het enige domein zonder dagstap en dus zonder gedragsbewijs; de vier domeinen mét dagstap openen met een voorstel. Verbinding staat bovendien niet in `DOMAIN_CHECK_PILLAR_IDS` (`[kompas-domain-check.ts:14-19](../../src/lib/kompas-domain-check.ts#L14-L19)`) en hermeet alleen op 30 dagen — een schap zonder eigen hermeting is een gids, geen Consumentenbond. Blijft geblokkeerd voor het meetpad tot er een lichte eigen check bestaat.

**Minimum data per domein.** De ondergrens van 8 blijft staan, met S9 als toevoeging: aanbiederloze dienst-kaarten zijn goedkoper te schrijven dan bedrijfskaarten, dus 8 halen wordt makkelijker terwijl de informatiewaarde kan dalen. S9 (≥ 3 vandaag-uitvoerbare eerste stappen) is de correctie daarop en geldt voor elk domein, niet alleen beweging.

---

**Loopt parallel, zonder attributiekosten:** deploy van F1a los met PostHog-annotatie, de registeruitbreiding van §18 (`VERWERKINGSREGISTER.md`) voor de ervaringsvraag, en het vastleggen van de `choice.`*-eventnamen in `src/lib/events.ts` zonder emitters. Geen van deze raakt een surface of deelt een meetvenster met deze proef.