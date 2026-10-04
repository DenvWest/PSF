# Juridische vraag: mogen we deze supermarktdata gebruiken, en hoe vermelden we de bron?

**Datum:** 3 oktober 2026
**Status:** voorgelegd aan een jurist (Dennis, 3 okt). Bijgewerkt 3 okt (avond): nieuwe feiten over de herkomst, een nieuw voorstel en vragen 11–14 staan in §7. Tot het antwoord gaat de supermarktcatalogus niet live (`VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md` §6.1).
**Voor:** een jurist met kennis van IE- en databankenrecht (NL/EU)
**Van:** PerfectSupplement (perfectsupplement.nl), Dennis van Westbroek

---

## 1. Wat we willen doen

PerfectSupplement is een Nederlands vergelijkingsplatform voor supplementen. Ingelogde gebruikers houden een voedingsdagboek bij. We willen dat ze daarin een **concreet supermarktproduct** kunnen kiezen (bijv. "Activia Yoghurt naturel") en de **voedingswaarden van het etiket** zien: calorieën, vet, verzadigd vet, koolhydraten, suikers, vezels, eiwit, zout, en waar het etiket die noemt calcium, ijzer en de vitamines C en D.

- **Puur informatief.** Geen gezondheidsclaim, geen prijzen, geen affiliate-link bij deze producten.
- **Omvang:** ongeveer 36.000 producten van AH, Jumbo, Lidl en Plus.
- **Weergave:** per product, na een zoekopdracht. We publiceren geen lijst of download van de hele set.
- **Opslag:** in onze eigen database (Supabase, EU), alleen server-side bereikbaar. De gebruiker ziet steeds één product tegelijk.
- **Later mogelijk:** dezelfde kennis aan zakelijke partners aanbieden (B2B). Daarom willen we de licentie nu goed regelen en niet pas achteraf.

## 2. De bron die we nu hebben, en waarom we twijfelen

We hebben een dataset gedownload van GitHub: `github.com/pljwissink/supermarkets`, een snapshot van 14 maart 2026 in vier CSV-bestanden (één per keten).

- De repository **bestaat niet meer** (HTTP 404 op 3 okt 2026). We hebben alleen onze lokale kopie.
- Er zit **geen licentiebestand** bij.
- De README zegt letterlijk: *"Data sourced from checkjebon.nl, boodschaapje.nl, openfoodfacts.org, ah.nl, jumbo.nl, plus.nl and lidl.nl."*
- Per product staan er een naam, een categorie, een verpakkingseenheid, de prijshistorie (die gebruiken we niet) en een vrij tekstveld met de voedingswaarden. Dat tekstveld lijkt rechtstreeks van de productpagina's van de supermarkten te komen. Bij welk product welke bron is gebruikt, valt niet na te gaan.

Wij hebben uit dat tekstveld alleen de getallen per 100 g/ml gehaald, met een eigen script.

## 3. Het alternatief: Open Food Facts

Open Food Facts is een open database met ongeveer 111.000 producten voor Nederland. Gebruikers voeren daar zelf etiketgegevens in, met barcode. De licenties:
- de database: **Open Database License (ODbL) 1.0**;
- de inhoud: Database Contents License;
- de foto's: CC BY-SA (die willen we niet gebruiken).

Twee mogelijke manieren van gebruik:
- **A.** Open Food Facts als **enige bron** van etiketwaarden, in een eigen, aparte tabel.
- **B.** Open Food Facts alleen gebruiken om **onze bestaande waarden te controleren** (komen de twee bronnen overeen?), zonder waarden over te nemen.

## 4. Vragen

**Over de huidige dataset (§2)**
1. Mogen we de voedingswaarden uit deze dataset commercieel gebruiken zoals in §1 beschreven? Wat is het risico, gegeven: geen licentie, een verdwenen bron, en deels van supermarktsites gehaalde data?
2. Rust er waarschijnlijk een **databankenrecht** (sui generis, Databankenwet / Richtlijn 96/9/EG) van AH, Jumbo, Plus of Lidl op hun productgegevens? Is ~10.000 producten per keten een "substantieel deel"? Speelt het gegeven dat de voedingswaarden wettelijk verplicht op het etiket staan (Vo. 1169/2011) daarbij een rol?
3. Wat betekenen de gebruiksvoorwaarden van die sites voor ons? Het gaat om *HvJ EU C-30/14 Ryanair/PR Aviation*: contractuele verboden blijven gelden als er geen databankenrecht is. Wij hebben die sites zelf niet bezocht of gescraped; een derde heeft dat gedaan.
4. Als een deel uit Open Food Facts komt: geldt dan de ODbL-share-alike voor onze afgeleide set, ook al weten we niet welke rijen dat zijn?

**Over Open Food Facts (§3)**

5. Is onze opzet bij variant A een **"Derivative Database"** (share-alike: we moeten de afgeleide database onder ODbL aanbieden) of alleen een **"Produced Work"** (alleen een bronvermelding nodig)? En geldt dat ook als we de Open Food Facts-gegevens in een eigen tabel houden, gescheiden van onze eigen data (supplementscores, gebruikersdata)?
6. Raakt share-alike onze eigen databases (supplementbeoordelingen, gebruikersdagboeken) als die naast de Open Food Facts-tabel bestaan en in dezelfde app samen worden getoond? Is dat een "Collective Database" (ODbL §4.5)?
7. Is variant B (alleen controleren, niets overnemen) een gebruik waarvoor de ODbL een verplichting oplegt?
8. Wat betekent een latere B2B-aanbieding (bijv. via een API) voor de antwoorden op 5–7?

**Over bronvermelding**

9. Is een vermelding **alleen in de footer** (een link naar een pagina "Bronnen en licenties") genoeg? Of moet de bron zichtbaar zijn **bij de getoonde gegevens**? Het gaat om ODbL §4.3 (*"a notice associated with the Produced Work reasonably calculated to make any Person … exposed to the Produced Work aware that Content was obtained from the Database"*), en per bron (Open Food Facts, en eventueel de huidige dataset).
10. NEVO (RIVM): de dataset staat op data.overheid.nl als CC BY 4.0, maar RIVM's eigen voorwaarden zeggen "alleen ongewijzigd en met bron en versienummer". Wij houden nu de strengste lezing aan (bronvermelding bij elke weergave). Is dat nodig, of volstaat CC BY 4.0?

## 5. Onze eigen voorlopige inschatting (geen juridisch advies)

Deze inschatting is bedoeld om het gesprek te versnellen, niet als antwoord.

- **Huidige dataset:** we schatten het risico te hoog in om er een B2B-product op te bouwen. Er is geen licentie, de herkomst is onbekend, de ketens hebben waarschijnlijk databankenrecht, en hun gebruiksvoorwaarden verbieden waarschijnlijk scrapen. Onze neiging is deze set **niet** live te gebruiken, tenzij de jurist dat anders ziet.
- **Open Food Facts variant A:** onze verwachting is dat dit een afgeleide database is. We zouden de Open Food Facts-tabel dan zelf onder ODbL beschikbaar stellen, met een downloadbare dump van alleen die tabel. Onze eigen data houden we bewust in aparte tabellen. Dat vinden we acceptabel, mits share-alike niet verder reikt dan die tabel (vraag 6).
- **Bronvermelding:** onze voorkeur is twee lagen: (1) een korte bronregel bij elk getoond product ("Voedingswaarden: Open Food Facts, ODbL"), en (2) een centrale pagina "Bronnen en licenties", gelinkt vanuit de footer. Een footer-link alleen lijkt ons voor ODbL §4.3 en voor NEVO te zwak.

## 6. Wat we van de jurist vragen

- Een antwoord op vragen 1–14, met per vraag: mag het, onder welke voorwaarden, en hoe groot is het risico.
- Een advies: de huidige dataset gebruiken of niet (en zo ja, welk deel en in welke vorm: voorstel D, E of F uit §7); Open Food Facts variant A, B of geen van beide.
- Waar nodig: de exacte tekst van de bronvermelding en de plaats waar die moet staan.

## 7. Bijgewerkt 3 oktober (avond): nieuwe feiten, nieuwe voorstellen, extra vragen

Na het opstellen van §1–§6 is de herkomst van de dataset verder uitgezocht. Dat verandert een deel van de beschrijving in §2.

### 7.1 Wat we nu over de herkomst weten

- **De bronrepo is weg en niet te herstellen.** Het GitHub-account `pljwissink` is aangemaakt op 25 maart 2026 en heeft 0 publieke repo's. Een licentie of README is niet meer te raadplegen; de Wayback Machine konden we niet bereiken.
- **De voedingswaarden komen van de websites van de supermarkten zelf, niet uit Open Food Facts.** Dat is af te lezen uit de ruwe tekst per keten: bij AH staat AH's eigen veldnaam `product.info.nutrion.sort.daily` (met AH's typfout) in de data, bij Jumbo en Plus staat platgeslagen paginatekst ("Per 100 ml, %ADH…", "Deze waarden gelden voor het niet bereide product…"), en bij Lidl staan Duitse labels met kapotte tekencodering en een vergelijkingskolom ("Verglichen mit…"). De README noemt openfoodfacts.org wel als bron; waarschijnlijk is dat voor iets anders gebruikt, bijvoorbeeld de Lidl-barcodes `[AANNAME]`.
- **Gevolg voor §2 en vraag 4:** de zorg dat de set per rij vermengd is met Open Food Facts-data (ODbL) is waarschijnlijk niet aan de orde. Het probleem zit bij de websites van de supermarkten.
- **Alleen Lidl heeft barcodes** (circa 4.000 van de 36.000 producten). AH, Jumbo en Plus hebben ze niet.
- **Gebruiksvoorwaarden per keten** (uit de eerdere analyse): Jumbo verbiedt scrapen expliciet (art. 9.3) en noemt databankrecht in de definitie van intellectuele eigendom, wat wij zelf hebben gecontroleerd. AH (art. 14) en Plus (art. 19.1) hebben een algemeen verbod op verveelvoudiging buiten persoonlijk gebruik, zonder scrape-clausule. Voor Lidl vonden we geen bepaling `[NIET GEVONDEN]`; dat moet nog geverifieerd worden.

### 7.2 Onderzocht en afgewezen: de producten alsnog in Open Food Facts zetten

Het idee was de producten in Open Food Facts te plaatsen, zodat Open Food Facts de bron wordt. Dat is niet toegestaan. De voorwaarden van Open Food Facts zeggen letterlijk: *"Contributors agree not to add on Open Food Facts information, data and photos from other websites (including other products databases, e-commerce websites, producers sites etc.)"* en *"Information and data added by contributors must come directly from the label and packaging of the product."* Het zou de herkomst bovendien niet wegnemen. We leggen dit alleen voor ter informatie; het is geen vraag.

### 7.3 Nieuwe voorstellen

- **Voorstel D: een "typische waarde" per generiek productgroep, zonder merk, zonder keten en zonder één afzonderlijke rij.** Bijvoorbeeld "Halfvolle melk: 47 kcal per 100 ml, bandbreedte 44–49, gebaseerd op 90 etiketten". We meten dit zo: van de 371 generieke regels die het dagboek heeft, hebben er 175 minstens vijf producten waarvan de naam de regel bevat, en bij 65 daarvan is de waarde stabiel (de middelste 80% van de waarden ligt binnen 35% van de mediaan). Dat is een ruwe meting op naam; een nauwkeuriger indeling geeft waarschijnlijk meer. De gebruiker en een eventuele afnemer zien alleen die gebundelde waarde.
- **Voorstel E: alleen het Lidl-deel gebruiken** (circa 4.000 producten, met barcodes), omdat daar geen scrape-verbod is gevonden, mits dat is geverifieerd.
- **Voorstel F: de set alleen intern houden** als meetlat voor Open Food Facts en als lijst van producten die daar ontbreken, zonder waarden over te nemen. Bij een meting van 100 willekeurige Lidl-producten staat 42% in Open Food Facts, en waar beide een calorie-waarde hebben klopt die in 37 van de 39 gevallen.

### 7.4 Extra vragen

11. **Gebundelde waarden (voorstel D).** Is een mediaan met bandbreedte per generiek productgroep, berekend uit de set maar zonder dat één afzonderlijke rij wordt getoond of aangeboden, een "hergebruik van een substantieel deel van de inhoud" (re-utilisation) in de zin van de Databankenwet? Of speelt alleen de eerdere extractie en kopie, die wij als ontvanger in bezit hebben? Ons argument (niet getoetst): de uitvoer maakt niets van de inhoud openbaar, en de schade voor de supermarkten is niet aan te wijzen, omdat een mediaan geen concurrerende database is.
12. **Onze wetenschap.** Speelt onze kennis van de herkomst (art. 6:162 BW, "bijkomende omstandigheden") ook als we uitsluitend gebundelde waarden gebruiken? Zou een Nederlandse rechter dat anders wegen dan bij het gebruik van afzonderlijke producten? Een Nederlandse rechtbank wees in een zaak over overgenomen webshopgegevens (Tracpartz) een databankclaim af omdat de investering niet was aangetoond; die uitspraak hebben wij alleen uit een zoekresultaat en niet zelf gelezen `[AANNAME]`.
13. **Het Lidl-deel (voorstel E).** Kan dat, en wat moeten we dan eerst controleren (met name de Lidl-voorwaarden)?
14. **Bronvermelding bij gebundelde waarden.** Welke vermelding is hier nodig? Wij denken aan "Typische waarde, gebaseerd op N etiketten van producten uit Nederlandse supermarkten (2026)", zonder een keten te noemen. Is dat voldoende, of zegt het recht dat de bron genoemd moet worden?

Aanvullende verwijzingen: HvJ EU 9 november 2004, C-444/02 (Fixtures Marketing: investering in het *creëren* van gegevens telt niet voor het databankenrecht). Voorwaarden Open Food Facts: <https://world.openfoodfacts.org/terms-of-use>.

## Bijlagen en verwijzingen

- ODbL 1.0: <https://opendatacommons.org/licenses/odbl/1-0/>
- Open Food Facts, licentie en hergebruik: <https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/>
- NEVO, copyright en disclaimer: <https://www.rivm.nl/nederlands-voedingsstoffenbestand/gebruik-nevo-online/copyright-en-disclaimer>
- NEVO op data.overheid.nl (CC BY 4.0): <https://data.overheid.nl/dataset/nederlands-voedingsstoffenbestand3>
- HvJ EU 15 januari 2015, C-30/14 (Ryanair/PR Aviation)
- HvJ EU 3 juni 2021, C-762/19 (CV-Online Latvia/Melons): opvragen en hergebruik bij zoekmachines
- Interne context: `docs/plan/VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md` §5–§6, `docs/plan/BESLUIT_NEVO_BRONVERMELDING.md`, `docs/plan/AUDIT_ARCHITECTUUR_SCHAAL_B2B_2026-09.md` (licentietabel)
