# Juridische analyse: supermarktdata, databankenrecht, ODbL en bronvermelding

**Datum:** 3 oktober 2026
**Betreft:** `JURIDISCHE_VRAAG_SUPERMARKTDATA_2026-10.md`, vragen 1–10
**Status:** **analyse door een AI-model, geen juridisch advies — niet aansprakelijk, bedoeld om een menselijk consult te verkorten.**
Alle wetsteksten, licentieteksten en arresten in dit stuk zijn opgehaald en letterlijk geciteerd (zie §Bronnen). Waar een feit niet hard te vinden was, staat `[NIET GEVONDEN]` of `[AANNAME]`.

---

## Samenvatting (kernconclusie)

1. **De huidige dataset: niet gebruiken.** Niet primair om databankenrecht, maar om een hardere reden: er is geen enkele licentieketen, en de MIT-bron die de README noemt (checkjebon) bevat **geen voedingswaarden** — gecontroleerd, zie §1. De voedingskolom moet dus uit de retailersites of uit Open Food Facts komen, en in beide gevallen ontbreekt de naleving.
2. **Databankenrecht van de ketens is zwakker dan §5 aanneemt**, door de spin-off-rechtspraak (C-46/02, C-203/02): hun investering zit in het *creëren* van hun assortiment, niet in het *verzamelen* van bestaande gegevens. Dat is echter **geen vrijbrief** — zie punt 3.
3. **Contract, niet databankenrecht, is hier het echte risico** (C-30/14 Ryanair). Jumbo verbiedt scrapen expliciet en noemt `databankrecht`; AH/PLUS verbieden verveelvoudiging buiten persoonlijk gebruik. Dat jullie zelf niet scrapeden helpt, maar neemt niet alles weg.
4. **Open Food Facts variant A is de juiste weg**, en is in jullie opzet **wél een Derivative Database** — §5 schat dat goed in.
5. **Share-alike reikt niet tot jullie eigen tabellen** (ODbL §4.5.a Collective Database). Dat deel van §5 is correct.
6. **Variant B (alleen controleren) is vrij** zolang er niets wordt overgenomen én de vergelijkings-uitkomst niet gepubliceerd wordt.
7. **B2B via een API verandert de uitkomst wezenlijk** en is het enige punt waar ik echt een jurist nodig acht (ODbL §4.6 + §4.7).
8. **Footer alleen is te zwak** — §5 heeft hier gelijk; ODbL §4.3 eist een notice *associated with the Produced Work*.
9. **NEVO: de strengste lezing is terecht**, en wel om een reden die §5/BESLUIT niet noemt: data.overheid.nl zegt zélf dat je bij download RIVM's voorwaarden moet accepteren.
10. **Netto-afwijking van §5:** de conclusie over de huidige dataset is dezelfde, maar om een andere en hardere reden; het databankenrecht-argument is zwakker en het contractuele argument sterker dan §5 denkt.

---

## Vooraf: drie lagen die niet verward mogen worden

De vraagstelling mengt op sommige punten drie zelfstandige grondslagen. De analyse hieronder houdt ze gescheiden, omdat ze los van elkaar kunnen slagen of falen:

| Laag | Rechthebbende | Kan jullie gebruik verbieden? |
|---|---|---|
| **A. Auteursrecht** op de getallen zelf | niemand | Nee — zie §2 (feitelijke gegevens) |
| **B. Databankenrecht** (sui generis) | producent van de databank | Mogelijk, maar zwak bij de ketens — §2 |
| **C. Contract** (gebruiksvoorwaarden) | de site-exploitant | **Ja, ook zonder A en B** — §3 |

Laag C is in deze zaak het zwaarste, en dat is precies het omgekeerde van wat §5 aanneemt.

---

## Vraag 1 — Mogen we de voedingswaarden uit de huidige dataset commercieel gebruiken?

### Antwoord

**Nee, niet in de huidige staat, en het advies is om deze set niet live te gebruiken.** Dat is dezelfde conclusie als §5, maar ik kom er op een andere en naar mijn oordeel hardere grond uit.

De gebruikelijke analyse zou zijn: "geen licentie, dus alle rechten voorbehouden, dus risico". Dat is te globaal, want op losse feitelijke getallen rust geen auteursrecht (zie §2). Het echte probleem is de **licentieketen**, en die is bij nazoeken sléchter dan het vragendocument aanneemt.

### Onderbouwing: de MIT-bron bevat geen voedingswaarden

De README noemde zeven bronnen, waaronder `checkjebon.nl`. Dat is een bestaande, nog actieve bron met een **gunstige** licentie:

- Repository `github.com/supermarkt/checkjebon` is op 3 oktober 2026 bereikbaar (HTTP 200) en staat onder de **MIT License** (`LICENSE`: *"MIT License / Copyright (c) 2022 supermarkt / Permission is hereby granted, free of charge, to any person obtaining a copy"*).
- De README stelt: *"Product price data is updated frequently and may be reused in other projects."*

Dat lijkt de oplossing — maar ik heb het databestand zelf opgehaald en geïnspecteerd (`data/supermarkets.json`, 10,1 MB, 12 ketens, 16.173 producten in de eerste keten). De productvelden zijn:

```json
{"n": "100% Coconut grove", "l": "wi415202/100-coconut-grove", "p": 2.49, "s": "1 l"}
```

Dus: naam (`n`), link (`l`), prijs (`p`), eenheid (`s`). **Er zit geen enkel voedingswaardeveld in.** De MIT-licentie van checkjebon dekt dus precies dát deel van de dataset dat jullie *niet* gebruiken (de prijshistorie), en dekt níet het vrije tekstveld met voedingswaarden dat jullie als enige wél gebruiken.

### Wat daaruit volgt

De voedingskolom moet, volgens de bronopsomming van de README zelf, uit de resterende bronnen komen: `openfoodfacts.org` (ODbL/DbCL, met verplichtingen) en/of `ah.nl`, `jumbo.nl`, `plus.nl`, `lidl.nl` (gebruiksvoorwaarden, zie §3). Beide routes dragen verplichtingen die nu niet worden nageleefd:

- Komt een rij uit Open Food Facts, dan had bij publicatie minstens de ODbL §4.3-notice moeten staan, en mogelijk §4.4-share-alike (zie §4).
- Komt een rij van een retailersite, dan is die onttrokken in strijd met voorwaarden die verveelvoudiging buiten persoonlijk gebruik verbieden (AH, PLUS) of scrapen expliciet verbieden (Jumbo).

En de kern van het probleem: **per rij is niet vast te stellen welke van de twee het is.** Het vragendocument zegt dat zelf ("Bij welk product welke bron is gebruikt, valt niet na te gaan"). Daarmee is per rij óók niet vast te stellen welke verplichting je moet naleven. Een dataset waarvan je de verplichtingen niet kúnt kennen, kun je niet compliant publiceren — niet omdat elk gebruik verboden is, maar omdat je niet kunt aantonen dat het toegestaan is.

Daar komt bij dat de repository is verdwenen (HTTP 404 op `github.com/pljwissink/supermarkets` en op de GitHub API, bevestigd 3 okt 2026). Dat betekent: geen licentie achteraf vast te stellen, geen rechthebbende te benaderen, geen herkomst per rij te reconstrueren, en geen verversing. Dit is een **verweesde dataset**. Jullie hebben voor verweesd werk al een vangnet-besluit (`BESLUIT_VERWEESD_WERK_VANGNET_2026-10.md`); dit is er een schoolvoorbeeld van.

### Nuance die vóór jullie pleit (en die een jurist zal meewegen)

Het risico is niet catastrofaal, en het is eerlijk om dat te benoemen:

- De **schade** is laag: jullie gebruiken de prijzen niet (dat is het commercieel gevoelige deel), publiceren geen dump, en tonen één product per zoekopdracht.
- De **getallen zelf** zijn wettelijk verplichte etiketinformatie (Vo. 1169/2011 art. 30(1)), wat de kans op auteursrecht nihil maakt en het "oneerlijk voordeel"-verhaal verzwakt.
- Jullie hebben zelf **niet gescraped**; dat is relevant voor laag C (zie §3).

Maar: dat verlaagt de kans op een *procedure*, niet de onmogelijkheid om *naleving aan te tonen*. En voor een B2B-product (§1 van de vraag: "later mogelijk dezelfde kennis aan zakelijke partners aanbieden") is "waarschijnlijk komt niemand klagen" geen fundament. Een zakelijke afnemer zal vragen waar de data vandaan komt, en het antwoord zou nu zijn: "dat weten we niet".

### Risico-inschatting

**Gemiddeld voor de huidige, besloten weergave; hoog zodra het B2B of gepubliceerd wordt.** Omdat de kans op handhaving bij één-product-weergave zonder prijzen laag is, maar de licentieketen per rij onbewijsbaar is en dat bij elke zakelijke doorlevering een onoplosbaar probleem wordt.

---

## Vraag 2 — Rust er databankenrecht op de productgegevens van AH, Jumbo, Plus, Lidl? Is 10.000 producten een "substantieel deel"? Speelt Vo. 1169/2011 een rol?

### Antwoord

**Hier wijk ik af van §5.** Het vragendocument stelt: "de ketens hebben waarschijnlijk databankenrecht". Dat is naar mijn oordeel **te stellig en vermoedelijk onjuist** voor de voedingswaarden specifiek. Er is een serieus argument dat op dit deel van hun gegevens géén sui generis-recht rust.

Let op: dit maakt het gebruik **niet** veilig — het verschuift het risico naar het contract (§3). Maar het is belangrijk dat het om de juiste reden gaat, want het bepaalt wat de oplossing is.

### Onderbouwing: de drempel

De Databankenwet (BWBR0010591) art. 1 definieert een databank als een verzameling

> "een verzameling van werken, gegevens of andere zelfstandige elementen die systematisch of methodisch geordend en afzonderlijk met elektronische middelen of anderszins toegankelijk zijn"

waarvan de verkrijging, de controle of de presentatie van de inhoud getuigt van een **substantiële investering** in kwalitatief of kwantitatief opzicht. Art. 2 lid 1 geeft de producent — *"degene die het risico draagt van de voor de databank te maken investering"* — het uitsluitend recht toestemming te verlenen voor:

> a. het opvragen of hergebruiken van het geheel of van een in kwalitatief of kwantitatief opzicht substantieel deel van de inhoud van de databank;
> b. het herhaald en systematisch opvragen of hergebruiken van in kwalitatief of kwantitatief opzicht niet-substantiële delen van de inhoud van een databank, voor zover dit in strijd is met de normale exploitatie van die databank of ongerechtvaardigde schade toebrengt aan de rechtmatige belangen van de producent van de databank.

Art. 1 definieert verder *opvragen* als *"het permanent of tijdelijk overbrengen van de inhoud van een databank of een deel daarvan op een andere drager, ongeacht op welke wijze en in welke vorm"* en *hergebruiken* als *"elke vorm van het aan het publiek ter beschikking stellen van de inhoud van een databank of een deel daarvan door verspreiding van exemplaren, verhuur, on line transmissie of transmissie in een andere vorm"*.

### Onderbouwing: de spin-off-doctrine — dit is de kern

De beslissende vraag is niet *of* de ketens investeren, maar *waarin*. Het HvJ EU heeft de "substantiële investering" beperkt tot investering in het **verkrijgen** van bestaand materiaal, en uitdrukkelijk níet tot het **creëren** ervan.

In **C-46/02 (Fixtures Marketing/Oy Veikkaus)** legt het Hof "investering in de verkrijging van de inhoud" uit als

> "resources used to seek out existing independent materials and collect them in the database"

en níet als middelen die zijn aangewend om de gegevens zélf tot stand te brengen. Voor voetbalprogramma's betekende dat dat de middelen voor *"resources used to establish the dates, times and the team pairings for the various matches"* niet meetellen.

**C-203/02 (British Horseracing Board/William Hill)** bevestigt dat "obtaining" ziet op *"resources used to seek out existing independent materials and collect them"* en *"does not cover the resources used for the creation of materials which make up the contents"*.

Toegepast op een supermarkt:

- Het **assortiment** van AH is door AH zelf gecreëerd — het is het resultaat van inkoop, niet van het verzamelen van elders bestaande gegevens. Dat is paradigmatisch spin-off-materiaal: de "databank" is een bijproduct van de hoofdactiviteit (winkelen verkopen).
- De **voedingswaarden** zijn nog zwakker: die worden niet door AH gecreëerd en niet door AH opgezocht. Ze worden door de **fabrikant** op het etiket gezet, krachtens een **wettelijke plicht**. AH neemt ze over uit de leveranciersfeed (in Nederland in de praktijk via GS1 Data Source `[AANNAME]` — ik heb niet geverifieerd dat alle vier ketens die feed gebruiken, maar het is de standaard in de Nederlandse levensmiddelenhandel).

Daarmee is de investering van de keten in juist dít gegevensveld minimaal: het is doorgeefluik-data. Een keten die betoogt dat haar sui generis-recht de voedingswaardetabel beschermt, moet uitleggen welke substantiële investering in *verkrijging, controle of presentatie* van die specifieke getallen zij heeft gedaan. Dat is een lastig betoog.

### De rol van Vo. 1169/2011 — ja, maar anders dan verwacht

Het vragendocument vermoedt terecht dat de wettelijke plicht meespeelt. Art. 30(1) van Vo. (EU) nr. 1169/2011 maakt de voedingswaardevermelding verplicht en schrijft de inhoud voor:

> "energy value; and the amounts of fat, saturates, carbohydrate, sugars, protein and salt."

Dat zijn exact de velden die jullie overnemen (plus de micronutriënten die art. 30(2) optioneel toestaat). De juridische betekenis is tweeledig:

1. **Auteursrecht is uitgesloten.** De inhoud is door de wetgever bepaald, niet door een maker. Er is geen ruimte voor eigen intellectuele schepping — zonder die ruimte geen werk, dus geen auteursrecht op de getallen. (Dat betreft de *getallen*. De *vormgeving* van een productpagina, foto's en beschrijvende teksten kunnen wel auteursrechtelijk beschermd zijn; die neemt u niet over, en dat moet zo blijven — zie het eindadvies.)
2. **Het verzwakt het databankenrecht op dit veld.** Gegevens die een derde wettelijk verplicht aanlevert, zijn "existing independent materials" die de keten niet heeft gecreëerd — maar het louter doorgeven ervan is ook geen substantiële investering in verkrijging. Het valt juridisch tussen wal en schip, in jullie voordeel.

Dit is tegelijk een argument dat jullie **niet** moeten overdrijven: het feit dat informatie verplicht op een etiket staat, betekent niet dat een verzameling van 36.000 van die etiketten vrij is. De verzameling kan beschermd zijn ook als elk element vrij is. Alleen: die bescherming moet dan voortkomen uit investering in het verzamelen, en daar wringt het bij een supermarkt.

### Is 10.000 producten per keten een "substantieel deel"?

**Ja, zonder twijfel — maar die vraag is pas relevant als er een recht bestaat.** De vraag is in zekere zin verkeerd om gesteld: substantialiteit is de tweede toets, niet de eerste.

Als er wél een databankenrecht op rust, dan is ~10.000 van ~10.000 producten kwantitatief 100% van het relevante deel van de databank, en dat is per definitie substantieel. C-203/02 geeft de maatstaf: kwantitatief wordt het opgevraagde volume afgezet tegen de totale inhoud; kwalitatief gaat het om *"the scale of the investment in the obtaining, verification or presentation of the contents"* van het opgevraagde deel, ook als dat kwantitatief verwaarloosbaar is. Een volledige assortimentsafdruk doorstaat beide toetsen niet.

Bovendien zou art. 2 lid 1 sub b hier zelfstandig bijten als het om herhaalde onttrekking ging — de ODbL-definitie vat dat trefzeker samen: *"The repeated and systematic Extraction or Re-utilisation of insubstantial parts of the Contents may amount to the Extraction or Re-utilisation of a Substantial part of the Contents."*

### Nuance: C-762/19 verlegt de toets naar schade

**C-762/19 (CV-Online Latvia/Melons)** is voor jullie gunstiger dan het vragendocument suggereert. Het Hof oordeelde:

> "Article 7(1) and (2) of Directive 96/9/EC must be interpreted as meaning that an internet search engine specialising in searching the contents of databases, which copies and indexes the whole or a substantial part of a database freely accessible on the internet and then allows its users to search that database on its own website according to criteria relevant to its content, is 'extracting' and 're-utilising' that content within the meaning of that provision, which may be prohibited by the maker of such a database where those acts adversely affect its investment in the obtaining, verification or presentation of that content, namely that they constitute a risk to the possibility of redeeming that investment through the normal operation of the database in question."

Twee dingen staan hier, en ze gaan beide op voor jullie geval:

- **Wat het wél beslist:** kopiëren en indexeren van een vrij toegankelijke databank, om daarna op je eigen site doorzoekbaar te maken, **is** opvragen en hergebruiken. Dat is precies de technische handeling die aan jullie dataset ten grondslag ligt. Dit deel is ongunstig.
- **Wat het óók beslist, en wat jullie helpt:** het mag alleen verboden worden *"where those acts adversely affect its investment"*, dat wil zeggen als het *"a risk to the possibility of redeeming that investment through the normal operation of the database"* oplevert. Jullie gebruiken geen prijzen, verwijzen niet door, concurreren niet met de boodschappenfunctie, en onttrekken geen verkeer aan de bestelsite. De schade aan de terugverdienmogelijkheid van AH's investering is moeilijk aan te wijzen.

**Wat C-762/19 níet beslist** — en dat is belangrijk tegen overinterpretatie: het zegt niet dat zoekmachines vrij zijn, en het geeft geen vrijstelling voor hergebruik dat de databankproducent niet schaadt wanneer er een *contract* in de weg staat. Het arrest gaat uitsluitend over art. 7 van de richtlijn. Over gebruiksvoorwaarden zegt het niets. Dat is C-30/14 — zie §3.

### Risico-inschatting

**Laag tot gemiddeld, en vooral: onzeker.** Omdat de spin-off-rechtspraak sterk tegen een databankenrecht op juist de voedingswaardevelden pleit, maar dit per keten feitelijk afhangt van hun investering in verkrijging/controle, wat ik niet kan vaststellen.

---

## Vraag 3 — Wat betekenen de gebruiksvoorwaarden? Wij hebben niet zelf gescraped.

### Antwoord

**Dit is het zwaarste punt van het dossier, en §5 onderschat het — niet in conclusie, maar in gewicht.** Precies omdat het databankenrecht zwak is (§2), wordt het contract beslissend. Dat is de eigenlijke les van C-30/14.

Voor jullie positie is er wél goed nieuws: **het contract bindt degene die het heeft geaccepteerd, en dat is de scraper, niet jullie.** Maar dat argument heeft grenzen.

### Onderbouwing: wat C-30/14 precies beslist

In **C-30/14 (Ryanair/PR Aviation)** oordeelde het Hof:

> "Directive 96/9/EC … must be interpreted as meaning that it is not applicable to a database which is not protected either by copyright or by the sui generis right under that directive, so that Articles 6(1), 8 and 15 of that directive do not preclude the author of such a database from laying down contractual limitations on its use by third parties, without prejudice to the applicable national law."

De logica is contra-intuïtief en voor jullie ongunstig: de dwingende gebruikersrechten van de richtlijn (art. 6(1), 8, en de nietigheidssanctie van art. 15) gelden **alleen** voor beschermde databanken. Een databank die *géén* bescherming geniet, valt buiten de richtlijn — en daarmee valt ook de bescherming van de rechtmatige gebruiker weg. De exploitant mag dan contractueel verbieden wat het databankenrecht hem niet zou toestaan.

Het gevolg voor dit dossier: **de zwakte van het databankenrecht uit §2 werkt niet in jullie voordeel maar in hun voordeel.** Hoe minder sui generis-recht AH heeft, hoe vrijer AH is om via de gebruiksvoorwaarden meer te verbieden dan dat recht zou dragen, zonder dat art. 15 die clausule nietig maakt. Dat is het mechanisme waar het vragendocument naar wijst, en het is correct geïdentificeerd.

### Wat de voorwaarden feitelijk zeggen — opgehaald op 3 oktober 2026

Dit is het punt waar ik het dossier feitelijk heb aangevuld. De vier ketens verschillen sterk, en dat verschil is juridisch relevant.

**Jumbo — expliciet verbod, en noemt het databankrecht.** `https://www.jumbo.com/service/algemene-voorwaarden/`, artikel 9. De definitie van Intellectuele Eigendomsrechten noemt uitdrukkelijk *"databankrecht"*:

> "alle rechten van intellectuele eigendom en daarmee verwante rechten, zoals auteursrecht, merkrecht, octrooirecht, modelrecht, handelsnaamrecht, databankrecht en naburige rechten, alsmede rechten op knowhow en eenlijnsprestaties"

En het verbod is zo specifiek dat het niet voor tweeërlei uitleg vatbaar is. Het is verboden

> "enige soft- en/of hardware matige tools en/of oplossingen (in eigen beheer of beschikbaar gesteld door derden) te gebruiken, voor zover deze gericht zijn op het overnemen van enige via de Website en/of Applicaties toegankelijke gemaakte informatie, dan wel om de Website en/of Applicaties via robots of op enigerlei andere wijze te spideren, scrapen, doorzoeken of op andere oneigenlijke wijze te gebruiken."

Dit is een tekstboek-C-30/14-clausule: hij verbiedt scrapen ongeacht of er een databankenrecht bestaat. Voor de Jumbo-rijen (~11.400 van jullie 36.037, het grootste blok) is het contractuele verbod dus hard.

**Albert Heijn — algemeen verbod op verveelvoudiging, geen scrape-clausule.** `https://www.ah.nl/algemene-voorwaarden`, artikel 14:

> "Alle intellectuele eigendomsrechten met betrekking tot deze website, waaronder in elke geval maar niet uitsluitend logo's, de programmatuur, teksten, beelden en geluiden berusten bij Albert Heijn B.V., of bij aan haar gelieerde vennootschappen en/of bij diegene van wie zij een licentie verkregen heeft. Dit betekent onder meer dat het niet is toegestaan om zonder voorafgaande uitdrukkelijke toestemming de op de websites vermelde informatie openbaar te maken, te verveelvoudigen en/of te bewerken, behalve voor persoonlijk gebruik."

De woorden "scrapen", "spider", "robot", "geautomatiseerd", "databank" en "crawl" komen in de AH-voorwaarden **niet** voor (geverifieerd: 0 treffers). Er staat wel een ruim verbod op openbaar maken, verveelvoudigen en bewerken buiten persoonlijk gebruik — dat dekt jullie gebruik in beginsel, maar het is een IE-clausule die zich naar haar aard richt op beschermd materiaal, en "de op de websites vermelde informatie" omvat een onbeschermd feitelijk getal maar twijfelachtig als "intellectueel eigendom". Zwakker dan Jumbo, maar niet afwezig.

Terzijde, en relevant tegen een "de techniek verbood het"-verwijt: de `robots.txt` van ah.nl (laatste update 05-12-2025) **blokkeert de productpagina's niet** en bevat geen uitsluiting van AI- of scrape-agents (geen `GPTBot`, `CCBot`, `Google-Extended`-regels; `Disallow`-regels betreffen `/mijn/`, `/login`, `/bestellen/...`, `/recepten/` e.d.). Dat is geen toestemming, maar het ontbreken van een technisch verbod maakt het verwijt van omzeiling kleiner.

**PLUS — verbod op verveelvoudiging, geen scrape-clausule.** `https://www.plus.nl/voorwaarden/algemene-voorwaarden`, artikel 19.1:

> "Alle intellectuele eigendomsrechten met betrekking tot de Website en de App, waaronder de teksten, beelden, geluiden en programmatuur, berusten bij de Ondernemer en/of bij diegene van wie de Ondernemer een licentie heeft verkregen en / of PLUS Retail BV."

met daarbij, bevestigd op de live pagina:

> "Het is niet toegestaan om zonder toestemming van de Ondernemer de op de Websites of de App vermelde informatie te verveelvoudigen"

(uitzondering: persoonlijk huishoudelijk gebruik). Scrapen, robots, spiders en databankenrecht worden **niet** genoemd. Materieel gelijk aan AH.

**Lidl — `[NIET GEVONDEN]`.** Ik heb de live site doorzocht via de footer-links en de twee juridische pagina's opgehaald die lidl.nl zelf aanbiedt: `https://www.lidl.nl/c/algemene-voorwaarden/s10004350` en `https://www.lidl.nl/c/impressum/s10004349`. De Algemene Voorwaarden betreffen de online shop (verkoop op afstand) en bevatten **geen** bepaling over scrapen, geautomatiseerd opvragen, databankenrecht of hergebruik van website-inhoud; de woorden komen er niet in voor. Een afzonderlijke pagina met website-gebruiksvoorwaarden of disclaimer heb ik op lidl.nl **niet gevonden**. Ik gok daar niet over: het is mogelijk dat zo'n pagina bestaat op een plek die ik niet heb gevonden, of dat Lidl NL simpelweg geen website-gebruiksvoorwaarden publiceert. **Een jurist moet dit verifiëren voordat hierop wordt gevaren.**

### Dan de eigenlijke vraag: wij hebben niet gescraped

Dit is juridisch jullie sterkste punt, en het klopt in de kern.

**Contractuele gebondenheid vereist aanvaarding.** De voorwaarden van Jumbo binden wie de site gebruikt. Jullie hebben de site niet geautomatiseerd bevraagd; een derde (pljwissink, of een bron daarvan) deed dat. Jullie zijn geen partij bij dat contract. Een contractueel verbod werkt in beginsel **niet tegen derden** — er is geen derdenwerking van een scrape-verbod. Jumbo kan jullie dus niet op grond van artikel 9 van haar voorwaarden aanspreken.

**Maar er zijn drie restrisico's, en die zijn reëel:**

1. **Onrechtmatige daad / profiteren van wanprestatie (art. 6:162 BW).** Het is naar Nederlands recht onder omstandigheden onrechtmatig om bewust te profiteren van de wanprestatie of het onrechtmatig handelen van een ander. De drempel is hoog — enkel profiteren is niet genoeg, er moeten bijkomende omstandigheden zijn — maar jullie positie verslechtert op het moment dat jullie *weten* dat de data vermoedelijk in strijd met voorwaarden is verkregen. **Dat weten jullie nu.** Het vragendocument stelt het zelf vast. Bewust doorbouwen op data waarvan je hebt vastgesteld dat hij vermoedelijk onrechtmatig is onttrokken, is een ander feitencomplex dan er onwetend op bouwen. `[AANNAME]` dat een rechter dit zo zou wegen — ik ken geen Nederlandse uitspraak die precies dit geval beslist.
2. **Het databankenrecht werkt wél tegen derden.** Een sui generis-recht is een absoluut recht: "hergebruiken" door jullie kan inbreuk zijn ook al heeft de scraper het opgevraagd. Dat is precies waarom §2 belangrijk blijft, ook al is het antwoord daar gunstig. Als een keten tóch een databankenrecht heeft, is het "wij hebben niet gescraped"-verweer waardeloos.
3. **De ODbL werkt óók tegen jullie.** Voor zover rijen uit Open Food Facts komen, is er geen contract maar een licentie — en een licentie bindt iedere gebruiker van het materiaal, ongeacht via wie het is verkregen. Zie §4.

### Risico-inschatting

**Gemiddeld.** Omdat het contractuele verbod van Jumbo jullie als niet-partij niet rechtstreeks bindt, maar het nu bewezen wetenschap over de herkomst is, wat de route via 6:162 BW opent en elke latere doorlevering lastig verdedigbaar maakt.

---

## Vraag 4 — Als een deel uit Open Food Facts komt: geldt de ODbL-share-alike dan voor onze afgeleide set, ook al weten we niet welke rijen dat zijn?

### Antwoord

**Ja — en het onwetend zijn over welke rijen het betreft maakt het probleem erger, niet kleiner.** Dit is de meest onderschatte vraag in het hele dossier.

### Onderbouwing

De ODbL kent geen uitzondering voor "ik weet niet welk deel van mijn databank onder je licentie viel". De verplichting hangt aan de handeling, niet aan de wetenschap. Twee bepalingen zijn fataal:

> "4.4 b. For the avoidance of doubt, Extraction or Re-utilisation of the whole or a Substantial part of the Contents into a new database is a Derivative Database and must comply with Section 4.4."

> "4.4 d. Share Alike and additional Contents. For the avoidance of doubt, You must not add Contents to Derivative Databases under Section 4.4 a that are incompatible with the rights granted under this License."

Als er een substantieel aantal rijen uit Open Food Facts in de samengevoegde set zit, is die set een Derivative Database. En §4.4.d verbiedt dan juist wat hier is gebeurd: het toevoegen van Contents die **incompatibel** zijn met de ODbL — namelijk rijen van retailersites waarvan niemand het recht had ze onder ODbL door te geven.

Dat is de kern: de samengevoegde dataset is een **onherstelbare vermenging**. Hij kan niet onder ODbL worden aangeboden (want hij bevat materiaal dat jullie niet onder ODbL mogen licentiëren, §4.4.d), en hij kan niet buiten ODbL worden aangeboden (want hij bevat ODbL-materiaal, §4.4.a). Er is geen licentie waaronder deze set legaal gepubliceerd kan worden. Het enige wat dat zou kunnen oplossen is de herkomst per rij — en die is verloren.

Praktische afgrenzingen die het risico beperken, en die eerlijk vermeld moeten worden:

- ODbL §4.5.c: *"Use of a Derivative Database internally within an organisation is not to the public and therefore does not fall under the requirements of Section 4.4."* Lokaal bouwen en testen, zoals nu gebeurt, raakt share-alike dus niet. Het besluit in `VOORBEREIDING_LAAG_A` §6.1 om lokaal door te bouwen maar niet live te gaan, is daarmee precies de juiste lijn.
- Of 36.037 rijen een *Substantial* deel van Open Food Facts (~111.000 NL-producten, ~4 miljoen wereldwijd) zijn, is op zichzelf discutabel. Maar "Substantial" is in de ODbL uitdrukkelijk *"substantial in terms of quantity or quality or a combination of both"*, en onbekend is hoeveel van de 36.037 rijen OFF-herkomst hebben. Niet-weten pleit hier niet vrij.

### Risico-inschatting

**Hoog.** Omdat de set niet onder ODbL én niet buiten ODbL gepubliceerd kan worden, en de enige reparatie — herkomst per rij — definitief verloren is.

---

## Vraag 5 — Is variant A een Derivative Database of alleen een Produced Work? Verandert een eigen, gescheiden tabel dat?

### Antwoord

**Een Derivative Database.** §5 schat dit correct in. De gescheiden tabel verandert dat niet — maar die scheiding is om een andere reden wel essentieel (zie vraag 6).

### Onderbouwing

De ODbL definieert beide begrippen, en het verschil zit in wat je *hebt*, niet in wat je *toont*:

> "Derivative Database" – Means a database based upon the Database, and includes any translation, adaptation, arrangement, modification, or any other alteration of the Database or of a Substantial part of the Contents. This includes, but is not limited to, Extracting or Re-utilising the whole or a Substantial part of the Contents in a new Database."

> "Produced Work" – a work (such as an image, audiovisual material, text, or sounds) resulting from using the whole or a Substantial part of the Contents (via a search or other query) from this Database, a Derivative Database, or this Database as part of a Collective Database."

Jullie opzet bij variant A is: de NL-dump van Open Food Facts filteren, velden selecteren, normaliseren naar per 100 g/ml, en opslaan in een eigen Supabase-tabel. Dat is letterlijk *"Extracting … a Substantial part of the Contents in a new Database"* plus *"arrangement, modification"*. Een Derivative Database, en niet twijfelachtig.

De productpagina die de gebruiker ziet — één product, met de waarden in jullie opmaak — is daarnaast een **Produced Work**. Beide bestaan tegelijk, en §4.4.c sluit de ontsnappingsroute expliciet:

> "4.4 c. Derivative Databases and Produced Works. A Derivative Database is Publicly Used and so must comply with Section 4.4. if a Produced Work created from the Derivative Database is Publicly Used."

Dus: zodra jullie de productpagina publiek tonen, wordt de onderliggende afgeleide tabel geacht publiek te worden gebruikt, en geldt share-alike. Het argument "wij publiceren de database niet, alleen pagina's" werkt daarom **niet**. Dat is het punt dat het makkelijkst verkeerd wordt gelezen in dit soort opzetten.

Wat "Publicly" betekent, staat er ook, en het is ruim: *"means to Persons other than You or under Your control by either more than 50% ownership or by the power to direct their activities."* Ingelogde eindgebruikers zijn zulke personen.

Let wel op wat §4.5.b zégt, want dat beperkt de gevolgen:

> "4.5 b. Using this Database, a Derivative Database, or this Database as part of a Collective Database to create a Produced Work does not create a Derivative Database for purposes of Section 4.4."

Het maken van de pagina creëert dus zelf geen nieuwe afgeleide databank. Maar de tabel die eronder ligt, was dat al.

### Wat dit concreet verplicht

1. **De OFF-tabel onder ODbL aanbieden** (§4.4.a). Jullie voorgenomen aanpak — een downloadbare dump van alleen die tabel — is correct.
2. **Een machine-leesbare kopie aanbieden** (§4.6, zie vraag 8). Op internet: *"free of charge if distributed over the internet"*.
3. **Een notice bij het Produced Work** (§4.3, zie vraag 9).
4. **Geen incompatibele Contents in die tabel mengen** (§4.4.d) — dus geen rijen uit de huidige dataset, en geen NEVO-waarden, in dezelfde tabel.

Punt 4 is de reden dat de huidige dataset en Open Food Facts niet in één tabel mogen belanden; dat is dezelfde fout die vraag 4 onherstelbaar maakte.

### Risico-inschatting

**Laag** — mits variant A als Derivative Database wordt behandeld en §4.3/§4.4/§4.6 worden nageleefd. Omdat de verplichting duidelijk is en volledig uitvoerbaar in jullie voorgenomen architectuur.

---

## Vraag 6 — Raakt share-alike onze eigen databases (supplementbeoordelingen, gebruikersdagboeken)? Is dat een Collective Database?

### Antwoord

**Nee, share-alike raakt jullie eigen tabellen niet.** §5 heeft hier gelijk, en de ODbL zegt het expliciet. Dit is het belangrijkste goede nieuws in het dossier.

### Onderbouwing

> "4.5 a. For the avoidance of doubt, You are not required to license Collective Databases under this License if You incorporate this Database or a Derivative Database in the collection, but this License still applies to this Database or a Derivative Database as a part of the Collective Database"

En de definitie:

> "Collective Database" – Means this Database in unmodified form as part of a collection of independent databases in themselves that together are assembled into a collective whole. A work that constitutes a Collective Database will not be considered a Derivative Database."

De constructie is dus: jullie Supabase-instantie bevat (a) een ODbL-tabel met Open Food Facts-gegevens, en (b) onafhankelijke eigen databanken — supplementbeoordelingen, `sup_*`, gebruikersdagboeken, `pd_*`, `af_*`. Die eigen tabellen zijn *"independent databases in themselves"*: ze bestaan en functioneren zonder de OFF-tabel, ze zijn uit andere bronnen opgebouwd, en ze zijn niet van OFF afgeleid. De OFF-tabel blijft ODbL; de rest blijft volledig jullie eigendom. Samen in één app tonen maakt daar niets anders van.

Twee waarschuwingen waar het alsnog fout kan gaan, en die in de architectuur geborgd moeten worden:

1. **"in unmodified form" geldt voor de Collective-route, niet voor de tabel zelf.** Jullie tabel is al een Derivative Database (vraag 5), dus de redenering is: afgeleide databank (ODbL) + onafhankelijke eigen databanken = collectie. §4.5.a dekt dat uitdrukkelijk ("this Database **or a Derivative Database**"). Dat is dus in orde.
2. **De grens is de join die data vermengt.** Zodra een eigen tabel OFF-waarden gaat *bevatten* — bijvoorbeeld een dagboekregel die de kcal-waarde uit OFF kopieert in plaats van naar de OFF-rij te verwijzen — is die eigen tabel niet langer onafhankelijk, maar een afgeleide databank die ODbL-Contents bevat. Dan trekt share-alike wél door.

**Praktische architectuurregel, en dit is de belangrijkste technische consequentie van dit hele memo:** sla in gebruikersdagboeken een **verwijzing** op (bron + bron-id + snapshot), nooit de gekopieerde voedingswaarden. Bereken de dagtotalen bij uitlezing uit de OFF-tabel. Dan blijft de dagboektabel een eigen, onafhankelijke databank en kan geen enkele gebruikersdata door share-alike besmet raken. Dat is ook los van de licentie beter (één bron van waarheid, verversbaar), en het sluit aan bij het model dat `VOORBEREIDING_LAAG_A` §6.3 punt 2 al voorstelt ("Bronnen als lagen, niet als mengsel").

Omgekeerd: zou je de kcal-waarde wél in de dagboekrij kopiëren, dan is het argument dat de dagboektabel onder ODbL moet worden vrijgegeven niet absurd — en dat is een tabel met persoonsgegevens. Die zou je *nooit* onder ODbL kunnen aanbieden (AVG), wat betekent dat je in een onoplosbaar conflict komt. Vandaar dat deze regel hard moet zijn, niet een voorkeur.

### Risico-inschatting

**Laag**, mits de dagboektabellen verwijzen in plaats van kopiëren. Omdat §4.5.a de collectie uitdrukkelijk vrijstelt, maar een kopie van OFF-waarden in een persoonsgegevenstabel een conflict tussen ODbL en AVG zou scheppen dat niet op te lossen is.

---

## Vraag 7 — Is variant B (alleen controleren, niets overnemen) een gebruik waarvoor de ODbL een verplichting oplegt?

### Antwoord

**Nee, mits je het strikt uitvoert — en "strikt" betekent iets preciezer dan het vragendocument formuleert.** Er zijn twee valkuilen.

### Onderbouwing

De ODbL-verplichtingen hangen alle aan publieke handelingen. §4.2 geldt bij *Publicly Convey*; §4.3 bij *Publicly Use* van een Produced Work; §4.4 bij *Publicly Use* van een Derivative Database. En §4.5.c stelt intern gebruik buiten share-alike:

> "4.5 c. Use of a Derivative Database internally within an organisation is not to the public and therefore does not fall under the requirements of Section 4.4."

Bovendien definieert de ODbL *Convey* zo dat jullie gebruik er niet onder valt:

> "Conveying does not include interaction with a user through a computer network, or creating and Using a Produced Work, where no transfer of a copy of the Database or a Derivative Database occurs."

Een eenmalige, interne kruisvergelijking — download de OFF-dump, vergelijk kcal/vet/koolhydraten tegen jullie eigen rijen, bewaar alleen een uitkomst, gooi de OFF-waarden weg — is intern gebruik en publiceert niets. Daarvoor legt de ODbL niets op.

**Valkuil 1: de uitkomst van de vergelijking kan zelf OFF-Content zijn.** Het veld dat `VOORBEREIDING_LAAG_A` §6.2 voorstelt (`verificatie: "1-bron" | "2-bronnen-eens" | "bronnen-oneens"`) is veilig: dat is een oordeel van jullie, geen OFF-gegeven. Maar zodra je bij "bronnen-oneens" de OFF-waarde bewaart, of de OFF-waarde overneemt omdat die betrouwbaarder lijkt, ben je in variant A beland — ongeacht hoe je het noemt. De grens is scherp en moet in code worden geborgd: in de productietabel mag géén veld staan dat een OFF-waarde kan bevatten.

**Valkuil 2: variant B lost het probleem van vraag 1 niet op.** Dit lijkt me het punt dat het makkelijkst verkeerd gaat in de besluitvorming. Variant B is een manier om de *huidige* dataset te valideren — maar de huidige dataset mag om de redenen in §1 en §4 hoe dan ook niet live. Een beter gevalideerde set waarvan je de licentie niet kent, is nog steeds een set waarvan je de licentie niet kent. **Variant B verbetert de datakwaliteit en niet de rechtspositie.**

Daarom is variant B als *route naar livegang* zinloos, en alleen nuttig als meetinstrument: hij kan jullie vertellen hóe goed de OFF-data is voordat jullie op variant A overstappen. Dat is reële waarde, maar een andere dan §3 van het vragendocument lijkt te veronderstellen.

### Risico-inschatting

**Laag** voor de ODbL zelf. Omdat intern vergelijken geen publieke handeling is, maar variant B de onderliggende licentievraag over de huidige dataset onaangeroerd laat.

---

## Vraag 8 — Wat betekent een latere B2B-aanbieding (bijv. via een API) voor 5–7?

### Antwoord

**Dit verandert de uitkomst wezenlijk, en dit is de vraag waarvoor ik een menselijke jurist het hardst nodig acht.** Een B2B-API is juridisch een andere handeling dan een consumentenpagina, en §5 van het vragendocument raakt dit punt niet.

### Onderbouwing: §4.6 wordt scherp

Bij een publieke productpagina kun je volstaan met een notice (§4.3) plus de dump van de OFF-tabel (§4.4). Bij doorlevering aan zakelijke afnemers komt §4.6 in volle omvang op:

> "4.6 Access to Derivative Databases. If You Publicly Use a Derivative Database or a Produced Work from a Derivative Database, You must also offer to recipients of the Derivative Database or Produced Work a copy in a machine readable form of:
> a. The entire Derivative Database; or
> b. A file containing all of the alterations made to the Database or the method of making the alterations to the Database (such as an algorithm), including any additional Contents, that make up all the differences between the Database and the Derivative Database.
> The Derivative Database (under a.) or alteration file (under b.) must be available at no more than a reasonable production cost for physical distributions and free of charge if distributed over the internet."

Drie gevolgen die het businessmodel raken:

1. **Jullie B2B-afnemers hebben recht op de volledige afgeleide databank, gratis.** Niet op een API-call, maar op een machine-leesbare kopie van het geheel (of het alteration file van (b)). Je kunt dus niet per record factureren voor OFF-afgeleide gegevens: de afnemer mag de hele set opvragen en hoeft daarna niet terug te komen. Verkopen kan alleen op wat jullie eromheen bouwen (koppeling, actualiteit, zoekkwaliteit, supportniveau, jullie eigen scores), niet op exclusiviteit van de data.
2. **Elke afnemer erft ODbL-plichten**, en jullie moeten dat doorgeven. Jullie licentie aan hen kan niet strenger zijn dan ODbL voor dit deel.
3. **§4.7 verbiedt beperkende voorwaarden boven de licentie.** *"This License does not allow You to impose … any terms or any technological measures on the Database, a Derivative Database, or the whole or a Substantial part of the Contents that alter or restrict the terms of this License"*. Een API-key achter een paywall mag wél — §4.7.c staat *"an authenticated environment, behind a password, or within a similar access control scheme"* uitdrukkelijk toe — maar alleen zolang je daarmee de ODbL-rechten niet beperkt. In de praktijk betekent dat: paywall voor de dienst is toegestaan, paywall als enige toegang tot de ODbL-data is het niet (vgl. §4.7.b, parallel distribution).

Voor **variant B** verandert B2B minder, maar niet niets: als de *uitkomst* van de vergelijking (het verificatieveld) aan partners wordt geleverd en dat veld een OFF-waarde reflecteert, kan het een Produced Work uit een Derivative Database zijn, met §4.3 en §4.6 in het kielzog. Het verificatie-oordeel zelf is dat niet.

Voor de **huidige dataset** maakt B2B de zaak eenvoudig: dat kan niet. Zie het eindadvies.

### Waarom hier een jurist nodig is

De ODbL-tekst is duidelijk, maar de toepassing op een SaaS/API-model is dat niet. De vragen die een mens moet beantwoorden zijn commercieel-juridisch, niet tekstueel: hoe je de ODbL-verplichting om de afgeleide databank gratis te verstrekken verenigt met een betaald B2B-product; of je de OFF-afgeleide laag contractueel kunt scheiden van de verkochte dienst; en of een afnemer die de gratis dump neemt en daarmee vertrekt, een reëel risico is voor het verdienmodel dat `AUDIT_ARCHITECTUUR_SCHAAL_B2B` voorziet. Dat is een licentie-ontwerpvraag, en de uitkomst bepaalt mogelijk of Open Food Facts überhaupt de juiste bron is voor een B2B-propositie. Mogelijk is voor B2B een betaalde feed (GS1 Data Source) de enige werkbare route — wat `VOORBEREIDING_LAAG_A` §6.2 al als "pas bij B2B" aanmerkt.

### Risico-inschatting

**Onzeker, met hoge impact.** Omdat de ODbL-tekst de verplichtingen helder maakt, maar de verenigbaarheid met een betaald B2B-aanbod een ontwerpkeuze is waarvan de commerciële gevolgen een menselijk oordeel vragen.

---

## Vraag 9 — Is een vermelding alleen in de footer genoeg, of moet de bron bij de gegevens staan?

### Antwoord

**Een footer-link alleen is niet genoeg. §5 heeft hier gelijk, en de licentietekst is er duidelijk over.** De voorgestelde twee lagen zijn precies goed.

### Onderbouwing

§4.3 is de bepaling die bij het tonen van losse producten geldt, en de kern is het woord *associated*:

> "4.3 Notice for using output (Contents). Creating and Using a Produced Work does not require the notice in Section 4.2. However, if you Publicly Use a Produced Work, You must include a notice associated with the Produced Work reasonably calculated to make any Person that uses, views, accesses, interacts with, or is otherwise exposed to the Produced Work aware that Content was obtained from the Database, Derivative Database, or the Database as part of a Collective Database, and that it is available under this License."

Twee eisen zitten hierin, en een footer-link haalt er geen van beide:

- *"associated with the Produced Work"* — de notice hoort bij het werk, niet bij de site. Bij jullie is het Produced Work de **productweergave**, niet de pagina als geheel: §1 zegt "per product, na een zoekopdracht", en de gebruiker ziet één product tegelijk. De notice moet dus meereizen met dat product.
- *"reasonably calculated to make any Person that … is otherwise exposed to the Produced Work aware"* — de maatstaf is of de gemiddelde gebruiker die de waarden ziet, de herkomst daadwerkelijk meekrijgt. Iemand die een zoekresultaat aanklikt en een voedingstabel leest, scrollt niet naar de footer en klikt niet door naar "Bronnen en licenties". De test is feitelijk, en een footer-link haalt hem niet.

Daar komt bij dat de ODbL en Open Food Facts beide **twee** elementen eisen, niet één: de **bron** én dat het **onder deze licentie beschikbaar** is. Een regel die alleen "Open Food Facts" zegt, is onvolledig.

De licentie geeft zelf de modeltekst, en die is bindend genoeg om te volgen:

> "a. Example notice. The following text will satisfy notice under Section 4.3:
> Contains information from DATABASE NAME, which is made available here under the Open Database License (ODbL).
> DATABASE NAME should be replaced with the name of the Database and a hyperlink to the URI of the Database. "Open Database License" should contain a hyperlink to the URI of the text of this License. If hyperlinks are not possible, You should include the plain text of the required URI's with the above notice."

Open Food Facts bevestigt dat, en voegt er een eis aan toe die bij jullie opzet precies past. De eigen voorwaarden (`world.openfoodfacts.org/terms-of-use`) verlangen dat hergebruikers

> "mention the licence and to attribute the authorship to Open Food Facts with a link to https://openfoodfacts.org, the appropriate local version (e.g. https://en.openfoodfacts.org) or the product page, when the information and data reproduced or re-used pertain to a specific product."

Dat laatste is beslissend voor vraag 9: bij **productspecifieke** gegevens wil Open Food Facts een link naar de productpagina (of de lokale versie). Dat kán niet in een footer; dat moet per product. Hun datapagina formuleert de attributieplicht als: *"You must attribute any public use of the database, or works produced from the database, in the manner specified in the ODbL (e.g. 'Contains data from Open Food Facts, available under the Open Database License')."*

### Wat dit concreet betekent

Zie het eindadvies voor de exacte teksten. In het kort: de bronregel staat **bij het product**, met een link naar de OFF-productpagina (die hebben jullie, want OFF levert de barcode mee), en de centrale pagina draagt de volledige licentie-informatie en de dump. Beide zijn nodig: §4.3 wordt gehaald door de regel bij het product, §4.2/§4.4/§4.6 door de centrale pagina.

Terzijde, voor de huidige dataset: daar is het probleem niet de *plaats* van de vermelding maar de *inhoud* — je kunt niet vermelden wat je niet weet. "bron: [supermarkt].nl / checkjebon.nl-dataset", zoals `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §5 voorstelde, is bovendien feitelijk onjuist voor de voedingswaarden: checkjebon bevat ze niet (§1). Die bronregel moet worden ingetrokken.

### Risico-inschatting

**Laag bij twee lagen; gemiddeld bij footer-alleen.** Omdat de licentietekst "associated with the Produced Work" eist en dat tekstueel niet te verenigen is met een vermelding die alleen op site-niveau bestaat.

---

## Vraag 10 — NEVO: is de strengste lezing nodig, of volstaat CC BY 4.0?

### Antwoord

**De strengste lezing is terecht — en er is een concreter argument voor dan het bestaande besluit noemt.** Ik kom tot dezelfde uitkomst als `BESLUIT_NEVO_BRONVERMELDING.md`, maar de onderbouwing kan sterker.

### Onderbouwing: de twee bronnen, letterlijk

RIVM's eigen voorwaardenpagina stelt:

> "Gebruik van de informatie van NEVO-online is alleen toegestaan in ongewijzigde vorm en met vermelding van bron en versienummer."

met als voorgeschreven vermelding:

> "NEVO-online versie 2025/9.0, RIVM, Bilthoven."

data.overheid.nl noemt als licentie "CC-BY (4.0)". Dat is de spanning die het besluit identificeert — CC BY 4.0 staat afgeleide werken uitdrukkelijk toe, "ongewijzigde vorm" niet.

### Het argument dat ontbreekt in het besluit

Bij het nazoeken van de data.overheid.nl-pagina vond ik een vermelding die de kwestie grotendeels beslecht. De pagina zegt bij de licentie zelf:

> "Voor het downloaden van de dataset moet de gebruiker voorwaarden accepteren (deze staan op de website genoemd)."

Dat is belangrijk, omdat het de twee bronnen van tegenstrijdig naar **gelaagd** maakt. Het is niet "data.overheid.nl zegt A en RIVM zegt B, kies maar". De catalogus verwijst zélf naar de voorwaarden van RIVM als onderdeel van de verkrijging. De CC BY 4.0-aanduiding beschrijft de licentie op het materiaal; de RIVM-voorwaarden zijn een contractuele laag die bij de download wordt aanvaard. Dat is dezelfde structuur als in §3: een contract kan verder gaan dan de licentie.

En die structuur is in Nederland precies de C-30/14-situatie. Het bestaande besluit noteerde al: "Bij het downloaden ga je bovendien expliciet akkoord met RIVM's voorwaarden, en dat akkoord staat contractueel naast de licentie." Dat is juist, en de vermelding op data.overheid.nl bevestigt het van de andere kant. Jullie zijn hier wél partij bij het contract — anders dan bij de supermarkten in §3 — want jullie downloaden zelf en accepteren zelf. Het "wij hebben niet geaccepteerd"-verweer bestaat hier niet.

Daarmee is het antwoord: **CC BY 4.0 volstaat niet**, niet omdat de licentie niet geldt, maar omdat er daarnaast een aanvaarde voorwaarde geldt die strenger is.

### Wat "ongewijzigd" praktisch eist

De oplossing in `BESLUIT_NEVO_BRONVERMELDING.md` is juridisch de juiste, en ik zou er niets aan veranderen. De scheiding tussen `nutrientValue` (het geciteerde gehalte per 100 g, ongewijzigd, met NEVO-code en editie) en `amount` (jullie omrekening naar portie, herkenbaar als eigen bewerking) is exact wat "alleen ongewijzigd" vergt: het brongegeven wordt ongewijzigd gepresenteerd, de bewerking wordt niet als brongegeven gepresenteerd. Dat `verified: true` alleen op `nutrientValue` slaat, past daarbij.

Twee kleine aanvullingen:

1. **De vermelding moet bij de weergave staan, net als bij ODbL.** "met vermelding van bron en versienummer" heeft geen plaatsbepaling, maar een vermelding die de gebruiker niet ziet is geen vermelding. Dezelfde twee-lagen-oplossing als bij Open Food Facts dekt dit.
2. **Het versienummer is onderdeel van de verplichte tekst**, niet optioneel. `NEVO_CITATION` moet dus meeveranderen bij elke editie-upgrade, en de bestaande test die versie en plaats bewaakt is precies de juiste borging.

Het openstaande punt uit het besluit — één e-mail naar `nevo@rivm.nl` — blijft zinvol, maar is niet blokkerend: zoals het besluit zelf constateert verandert een ruimer antwoord niets aan een structuur die al op de strengste lezing is gebouwd.

**Belangrijk, en los van vraag 10:** NEVO-waarden mogen **niet** in de Open Food Facts-tabel terechtkomen. NEVO is niet onder ODbL te licentiëren (RIVM staat dat niet toe), en ODbL §4.4.d verbiedt het toevoegen van incompatibele Contents aan een Derivative Database. Een gemengde tabel zou hetzelfde onoplosbare conflict scheppen als bij de huidige dataset (§4). NEVO is dus een derde, zelfstandige laag — wat aansluit bij het gebruik dat `VOORBEREIDING_LAAG_A` §6.2 ervoor voorziet (plausibiliteitscheck voor generieke producten, geen overname naar merkproducten).

### Risico-inschatting

**Laag.** Omdat jullie de strengste van twee lezingen volgen, de verplichte citatie letterlijk overnemen en de scheiding tussen brondwaarde en bewerking al in code en tests is geborgd.

---

## Overzicht: risico en status per vraag

| # | Onderwerp | Risico | Status |
|---|---|---|---|
| 1 | Huidige dataset commercieel gebruiken | **Gemiddeld** (besloten weergave) → **hoog** (B2B/publicatie) | Beantwoord — advies: niet gebruiken |
| 2 | Databankenrecht ketens; substantieel deel; Vo. 1169/2011 | **Laag–gemiddeld, onzeker** | **Echt een jurist nodig** — spin-off-toets is feitelijk per keten |
| 3 | Gebruiksvoorwaarden; wij scrapeden niet zelf | **Gemiddeld** | **Echt een jurist nodig** — 6:162-route + Lidl `[NIET GEVONDEN]` |
| 4 | ODbL-share-alike bij onbekende herkomst per rij | **Hoog** | Beantwoord — onherstelbare vermenging |
| 5 | Variant A: Derivative Database of Produced Work | **Laag** (mits nageleefd) | Beantwoord — Derivative Database |
| 6 | Raakt share-alike eigen databases? Collective Database? | **Laag** (mits verwijzen, niet kopiëren) | Beantwoord — §4.5.a stelt vrij |
| 7 | Variant B: alleen controleren | **Laag** | Beantwoord — geen ODbL-plicht, maar lost §1 niet op |
| 8 | B2B-aanbieding via API | **Onzeker, hoge impact** | **Echt een jurist nodig** — ODbL §4.6/§4.7 vs. verdienmodel |
| 9 | Footer-vermelding of bij de gegevens | **Laag** (twee lagen) / **gemiddeld** (footer-alleen) | Beantwoord — bij het product |
| 10 | NEVO: CC BY 4.0 of strengste lezing | **Laag** | Beantwoord — strengste lezing, contractuele laag |

**Samengevat voor het consult:** vragen 4, 5, 6, 7, 9 en 10 zijn met de licentie- en wetsteksten te beantwoorden en behoeven geen menselijk oordeel meer. Vragen 2, 3 en 8 wel. Vraag 1 is beantwoord, maar rust op 2 en 3 en zou in hetzelfde gesprek bevestigd moeten worden.

---

## Eindadvies

### 1. De huidige dataset: niet gebruiken, en de bronregel intrekken

**Niet live gebruiken, en niet bewaren als fundament voor iets anders.** Dit bevestigt de neiging in §5, maar om een andere reden: niet "de ketens hebben waarschijnlijk databankenrecht" (dat is zwak, §2), maar "de licentieketen is per rij onbewijsbaar en onherstelbaar vermengd" (§1 en §4). De beslissende vondst is dat de MIT-bron die de README noemt geen voedingswaarden bevat — de kolom die jullie gebruiken kan dus alleen uit de retailersites of uit Open Food Facts komen, en bij beide ontbreekt de naleving.

Concreet:

- Gebruik de set niet in productie, en lever hem niet door — ook niet "ongeverifieerd gelabeld".
- Lokaal doorbouwen aan de parser, het datamodel en de zoekroute mag; ODbL §4.5.c stelt intern gebruik buiten share-alike en er is geen publieke handeling. Dit is al de lijn van `VOORBEREIDING_LAAG_A` §6.1 en die lijn is juist.
- Behandel de set als **referentiemateriaal**: hij is nuttig om variant A tegen te meten (hoe goed is OFF voor NL?), en om de parser te testen. Niet als bron van waarheid.
- **Trek de bronregel uit `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §5 in.** "bron: [supermarkt].nl / checkjebon.nl-dataset volstaat" is feitelijk onjuist: checkjebon levert naam, link, prijs en eenheid, geen voedingswaarden. Een onjuiste bronvermelding is slechter dan geen.
- Overweeg de set uit de werkomgeving te verwijderen zodra variant A draait. Zolang hij er staat, is "wij wisten het niet" geen beschikbaar verweer meer.

### 2. Open Food Facts: variant A, niet B — en B alleen als meetinstrument

**Variant A, als enige bron van etiketwaarden, in een eigen ODbL-tabel.** Dat is de enige route die tot een publiceerbare, verdedigbare en versbare dataset leidt.

Variant B is geen alternatief: hij verbetert de datakwaliteit maar niet de rechtspositie (§7), en laat jullie zitten met een set die om andere redenen niet live kan. Gebruik B wel éénmalig, intern, als meting: vergelijk de OFF-NL-dump met de huidige set om vast te stellen hoeveel van de 36.037 producten OFF dekt voordat je op A overgaat. Dat is waardevolle informatie en kost niets juridisch.

Voorwaarden waaronder A veilig is:

1. **Eigen tabel, uitsluitend OFF-rijen.** Geen rijen uit de huidige dataset, geen NEVO-waarden, geen USDA-waarden in die tabel (ODbL §4.4.d). Dit is dezelfde "bronnen als lagen"-regel die `VOORBEREIDING_LAAG_A` §6.3 punt 2 al voorstelt, nu met een licentiegrond.
2. **De tabel wordt onder ODbL aangeboden**, met een machine-leesbare dump die gratis te downloaden is (§4.4.a, §4.6).
3. **Gebruikersdagboeken verwijzen, kopiëren niet.** Sla bron + bron-id (barcode) + snapshotdatum op; bereken dagtotalen bij uitlezing. Dit houdt de dagboektabel een onafhankelijke databank (§4.5.a) en voorkomt een onoplosbaar conflict tussen ODbL-share-alike en de AVG (§6). **Dit is de harde technische eis uit dit memo.**
4. **Geen OFF-foto's.** Die zijn CC BY-SA en dragen bovendien rechten van derden; OFF waarschuwt daar zelf voor ("copyright for the product design and graphical elements it contains, image rights of people … trademark rights"). Dat was al jullie keuze; houd hem.
5. **Draag bij terug** waar dat kan. Geen juridische verplichting bij alleen lezen, maar OFF vraagt het expliciet en houdt een publieke "non-compliance shamelist" bij — reputationeel relevant voor een platform dat zich als "de Consumentenbond van supplementen" positioneert.
6. **Voor B2B: eerst het gesprek uit vraag 8.** Bouw de B2B-propositie niet op exclusiviteit van OFF-afgeleide data; die kan er niet zijn (§4.6).

### 3. Bronvermelding: exacte teksten en plaatsen

**Twee lagen, zoals §5 voorstelt.** De plaatsing is niet vrij: §4.3 eist een notice *associated with the Produced Work*, en OFF eist bij productspecifieke gegevens een link naar de productpagina.

**Laag 1 — bij elk getoond product, zichtbaar zonder uitklappen of scrollen naar de footer:**

> Voedingswaarden: [Open Food Facts](https://nl.openfoodfacts.org/product/<barcode>), beschikbaar onder de [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/).

Eisen aan deze regel, elk met een grond:
- "Open Food Facts" linkt naar de **OFF-productpagina** van dat product (via de barcode die jullie al importeren) — OFF's voorwaarden vragen dit uitdrukkelijk bij productspecifieke data; de lokale versie `nl.openfoodfacts.org` of `openfoodfacts.org` is het alternatief.
- "Open Database License (ODbL)" linkt naar de licentietekst — ODbL §4.3.a schrijft die hyperlink voor.
- De regel noemt **zowel de bron als de licentie** — §4.3 eist beide ("aware that Content was obtained from the Database … and that it is available under this License").
- De regel staat **bij de waarden**, niet onderaan de pagina, en reist mee als het product in een modal, zoekresultaat of dagboekregel verschijnt.

Toont een weergave NEVO-gegevens, dan staat daar in plaats daarvan (of ernaast, als beide zichtbaar zijn) de voorgeschreven NEVO-tekst, letterlijk:

> NEVO-online versie 2025/9.0, RIVM, Bilthoven

**Laag 2 — pagina "Bronnen en licenties", gelinkt vanuit de footer**, met per bron: naam, uitgever, licentie met link, editie/snapshotdatum, waarvoor hij gebruikt wordt, en voor Open Food Facts bovendien de ODbL §4.2-elementen (kopie of URI van de licentie) plus de **downloadlink naar de ODbL-dump van de OFF-tabel** (§4.6). Deze pagina is niet de nalevingsplek voor §4.3 — dat is laag 1 — maar wel voor §4.2, §4.4 en §4.6.

**De footer-link alleen is onvoldoende.** Dat is geen voorzichtigheid: "reasonably calculated to make any Person that … is otherwise exposed to the Produced Work aware" is een feitelijke maatstaf, en een gebruiker die een voedingstabel leest komt niet in de footer.

### 4. Waar dit memo afwijkt van §5 van het vragendocument

| §5 stelt | Dit memo | Waarom het uitmaakt |
|---|---|---|
| "de ketens hebben waarschijnlijk databankenrecht" | **Afwijking.** Vermoedelijk niet, of zwak, op juist de voedingswaardevelden — spin-off-doctrine (C-46/02, C-203/02): hun investering zit in het creëren van het assortiment, niet in het verzamelen van bestaande gegevens; de etiketwaarden komen van de fabrikant krachtens Vo. 1169/2011 | Verandert welke oplossing werkt: een databankenrechtprobleem los je op met een licentie, een contractprobleem met het niet-aanraken van de bron |
| "hun gebruiksvoorwaarden verbieden waarschijnlijk scrapen" | **Gedeeltelijke afwijking, en preciezer.** Alleen Jumbo verbiedt het expliciet (en noemt `databankrecht`); AH en PLUS hebben een algemeen verbod op verveelvoudiging buiten persoonlijk gebruik; voor Lidl `[NIET GEVONDEN]` | Het risico is per keten verschillend, niet uniform; Jumbo is het grootste blok én het hardste verbod |
| Het databankenrecht is het hoofdrisico | **Afwijking in weging.** Het contract is het hoofdrisico (C-30/14), en juist de zwakte van het databankenrecht vergroot de contractuele ruimte van de ketens | Dit is de contra-intuïtieve kern van C-30/14 en bepaalt de hele risico-analyse |
| Hoofdreden om de set niet te gebruiken: geen licentie + onbekende herkomst + databankenrecht | **Afwijking in grond, niet in conclusie.** De harde reden is dat de MIT-bron (checkjebon) géén voedingswaarden bevat — geverifieerd in het databestand — waardoor de kolom alleen uit de retailersites of OFF kan komen, en de set per rij onbewijsbaar en onherstelbaar vermengd is (ODbL §4.4.d) | Een sterkere en feitelijk verifieerbare grond; ook de reden dat de bestaande bronregel ("checkjebon.nl-dataset") moet worden ingetrokken |
| Variant A is vermoedelijk een afgeleide database | **Bevestigd**, en explicieter: ook een Produced Work, en §4.4.c sluit de route "wij publiceren de database niet, alleen pagina's" uit | De meest gemaakte fout bij dit soort opzetten |
| Share-alike mag niet verder reiken dan die tabel (vraag 6) | **Bevestigd** door ODbL §4.5.a — met één harde voorwaarde die §5 niet noemt: dagboeken moeten **verwijzen, niet kopiëren**, anders ontstaat een onoplosbaar ODbL/AVG-conflict | Dit is een concrete bouweis, niet een nuance |
| Footer-link alleen lijkt te zwak | **Bevestigd** door de letterlijke tekst van §4.3 ("associated with the Produced Work") plus OFF's eigen eis van een link naar de productpagina bij productspecifieke data | §5's voorkeur is niet alleen voorzichtig maar juridisch de juiste lezing |
| NEVO: strengste lezing aanhouden | **Bevestigd, met een sterker argument.** data.overheid.nl vermeldt zélf dat de gebruiker bij download voorwaarden moet accepteren — de twee bronnen zijn gelaagd (licentie + contract), niet tegenstrijdig; en jullie zijn hier wél partij bij dat contract | Maakt het besluit robuuster en de openstaande RIVM-mail minder urgent |

---

## Bronnen

Alle onderstaande bronnen zijn op 3 oktober 2026 opgehaald; citaten zijn letterlijk overgenomen.

**Licenties**
- ODbL 1.0, volledige tekst — <https://opendatacommons.org/licenses/odbl/1-0/> (definities §1.0; §4.2 t/m §4.7 integraal opgehaald en geciteerd)
- Open Food Facts, Terms of use — <https://world.openfoodfacts.org/terms-of-use>
- Open Food Facts, data/hergebruik — <https://world.openfoodfacts.org/data>
- Open Food Facts, licentie-tutorial — <https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/>
- `github.com/supermarkt/checkjebon` — MIT License; databestand `data/supermarkets.json` opgehaald en geïnspecteerd (12 ketens; productvelden `n`, `l`, `p`, `s`; **geen voedingswaardevelden**)

**Wet- en regelgeving**
- Databankenwet, BWBR0010591 — <https://wetten.overheid.nl/BWBR0010591/> (art. 1 definities; art. 2 lid 1)
- Richtlijn 96/9/EG betreffende de rechtsbescherming van databanken
- Vo. (EU) nr. 1169/2011, art. 30(1) — <https://www.legislation.gov.uk/eur/2011/1169/article/30>

**Rechtspraak HvJ EU** (operatieve delen opgehaald via <https://ipcuria.eu>)
- C-30/14, Ryanair/PR Aviation, 15 januari 2015
- C-762/19, CV-Online Latvia/Melons, 3 juni 2021
- C-46/02, Fixtures Marketing/Oy Veikkaus, 9 november 2004
- C-203/02, British Horseracing Board/William Hill, 9 november 2004

**Gebruiksvoorwaarden retailers** (live opgehaald 3 oktober 2026)
- Albert Heijn — <https://www.ah.nl/algemene-voorwaarden> (art. 14); `robots.txt` (laatste update 05-12-2025): geen uitsluiting van productpagina's of scrape-/AI-agents
- Jumbo — <https://www.jumbo.com/service/algemene-voorwaarden/> (art. 9; definitie Intellectuele Eigendomsrechten noemt `databankrecht`; expliciet scrape-/spider-/robotverbod)
- PLUS — <https://www.plus.nl/voorwaarden/algemene-voorwaarden> (art. 19.1; verbod op verveelvoudigen buiten persoonlijk huishoudelijk gebruik; geen scrape-clausule)
- Lidl — <https://www.lidl.nl/c/algemene-voorwaarden/s10004350> en <https://www.lidl.nl/c/impressum/s10004349>: **`[NIET GEVONDEN]`** — geen bepaling over scrapen, geautomatiseerd opvragen, databankenrecht of hergebruik van website-inhoud; een afzonderlijke pagina met website-gebruiksvoorwaarden is op lidl.nl niet aangetroffen

**NEVO**
- RIVM, copyright en disclaimer — <https://www.rivm.nl/nederlands-voedingsstoffenbestand/gebruik-nevo-online/copyright-en-disclaimer>
- data.overheid.nl, NEVO-dataset — <https://data.overheid.nl/dataset/nederlands-voedingsstoffenbestand3> (licentie "CC-BY (4.0)"; vermelding dat bij download voorwaarden moeten worden geaccepteerd)

**Niet verifieerbaar gebleken**
- `github.com/pljwissink/supermarkets` — HTTP 404 op de repository en op de GitHub API (3 okt 2026); licentie en herkomst per rij niet meer vast te stellen
- Of AH, Jumbo, PLUS en Lidl hun voedingswaarden via GS1 Data Source van fabrikanten ontvangen — `[AANNAME]`, niet geverifieerd per keten
- Nederlandse rechtspraak die specifiek beslist of het gebruiken van een door een derde in strijd met gebruiksvoorwaarden onttrokken dataset onrechtmatig is jegens de site-exploitant — `[NIET GEVONDEN]`
