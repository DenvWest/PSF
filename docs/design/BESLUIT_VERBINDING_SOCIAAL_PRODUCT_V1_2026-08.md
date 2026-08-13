# BESLUIT — Sociale Verbinding als product: gelegenheden, geen gebruikers

> **Status:** productanalyse + besluitvoorstel. Dit document beantwoordt de vraag *"hoe geven we Sociale Verbinding meer vulling en productwaarde?"* — en komt tot een andere conclusie dan de vraag suggereert.

> **Datum:** 13 augustus 2026

> **Reeks:** `BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md` (de check, de ladder, het compliance-kader) · `verbinding-piramide-prebuild-v1-2026-08.html` (zes staten × zeven surfaces) · `BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md` (het aanbieder-precedent) · dit document (het sociale product)

> **Noordster:** *Wij hosten geen mensen. Wij weten waar ze al samenkomen.*

---

## 0 · Vooraf — waar dit document van de opdracht afwijkt, en waarom

De opdracht vraagt om matching, communities, uitnodigingen tussen gebruikers, moderatie, blokkeren, rapporteren, een safety-architectuur en een sociaal datamodel. Dat is een **sociaal platform**. PerfectSupplement is vandaag een single-player adviesproduct: er is geen enkele gebruiker-tot-gebruiker-functie, geen profiel, geen bericht, geen user-generated content, geen moderatiecapaciteit.

Ik heb de volledige analyse gemaakt die gevraagd is — alle zestien secties, inclusief de drie matchingmodellen, de safety-laag en het datamodel. **De uitkomst van die analyse is dat we het platform niet moeten bouwen.** Niet uit voorzichtigheid, maar omdat drie onafhankelijke rekensommen alle drie dezelfde kant op wijzen: de dichtheid is er niet, de compliance-last is onevenredig, en het is het enige onderdeel van dit product waar we géén onderscheidend vermogen hebben.

Wat er wél moet komen is substantieel, en het is méér dan de prebuild nu doet. Het staat vanaf §3.

Eén sequentie-opmerking vooraf: **W1–W8 van de prebuild is niet af.** Alles in dit document is additief aan W9/W10, niet een vervanging ervan. De verbinding-check zelf moet eerst staan.

---

## 1 · Executive summary

**De productkans is niet "mensen aan elkaar koppelen". Het is "de drempel wegnemen om ergens binnen te lopen waar mensen al zijn."**

Dat verschil is de hele analyse.

De prebuild kent de ladder al: P1 een vast moment, P2 zelf het initiatief, P3 samen iets doen, P4 één gesprek, P5 iets betekenen. Wat de prebuild níét kan beantwoorden is de vraag die op P3 onvermijdelijk komt: *waar dan?* Voor de man die op `CON_BLOCK = 1` antwoordt — *"ik weet niet goed waar ik zou beginnen"* — eindigt de ladder in een aansporing zonder adres. Dat is het gat.

Er zijn twee manieren om dat gat te vullen:

1. **Wij worden de plek** — profielen, matching, groepen, chat. Dat vraagt een sociaal netwerk, een trust-&-safety-functie en lokale dichtheid die we geen van drieën hebben.
2. **Wij worden de gids naar de plekken die er al zijn** — een onafhankelijk beoordeelde gelegenheden-gids, met precies de informatie die de drempel verlaagt, en een uitnodigingshulp die de bestaande contacten van de gebruiker activeert zonder dat wij die contacten ooit zien.

Route 2 is niet de voorzichtige variant. Het is de variant die past bij wat dit product al is: **een vergelijker.** De hele competentie van PerfectSupplement is het onafhankelijk beoordelen van opties en de lezer naar de beste verwijzen. Toegepast op supplementen levert dat een schap. Toegepast op verbinding levert dat een adressenlijst met een oordeel — en dat is precies wat er in Nederland niet bestaat.

Het onderscheidend vermogen zit in één veld dat geen enkele bestaande partij invult: **de drempelkaart.** Meetup vertelt je dát er een wandelgroep is. Niemand vertelt je of je daar alleen kunt binnenlopen, of je lid moet worden, wat er gebeurt in de eerste vijf minuten, en of er meer mensen van boven de veertig komen. Dat is de informatie waar het bij deze doelgroep op vastloopt, het is redactiewerk in plaats van platformwerk, en het is exact de vorm van werk die dit bedrijf al doet.

**Aanbeveling in één zin:** bouw de gelegenheden-gids met drempelkaart (Expand) en de uitnodiging-opsteller die niets bewaart (Strengthen), en bouw geen enkele gebruiker-tot-gebruiker-functie.

---

## 2 · Productdiagnose

### 2A · Wat is er aantrekkelijk aan sociale verbinding binnen een wellness-app?

Drie dingen, waarvan er twee vaak door elkaar worden gehaald.

**Het bewijs is hard.** De WHO-commissie positioneert sociale verbinding als derde pijler van gezondheid naast fysiek en mentaal. Dat geeft dit domein dezelfde evidence-autoriteit als slaap of beweging — geen "zachte" pijler die je erbij doet.

**Het is de enige pijler die de andere vier draagt.** Slaap, voeding, beweging en stress zijn alle vier solo-gedrag. Verbinding is de enige die volhouden van de andere vier voorspelt. Dat is een echte productreden om er niet omheen te lopen.

**En — dit is de val — het is de pijler waar retentie het makkelijkst lijkt.** Sociale features houden mensen in een app. Dat is precies waarom ze zo vaak worden gebouwd, en precies waarom ze hier gevaarlijk zijn: de retentie komt dan van het *praten over* samen iets doen in plaats van het samen iets doen. Zie §14 (metrics) — een groot deel van de metric-keuze bestaat eruit dit te voorkomen.

### 2B · Waarom kan dit een onderscheidende feature worden?

Niet omdat sociale functionaliteit zeldzaam is — die is overal. Wel om drie specifieke redenen:

| | Waarom onderscheidend |
|---|---|
| **Doelgroep** | Mannen 40–65 zijn de slechtst bediende groep in bestaand sociaal aanbod. Meetup skewt jong en stedelijk, Facebook Groups skewt vrouw en ouder, verenigingen skewen jeugd of 65+. |
| **Register** | Alle bestaande aanbieders vragen een sociale intentie ("word lid", "maak een profiel", "stel jezelf voor"). De literatuur zegt dat mannen verbinden *naast* elkaar via een activiteit, niet *tegenover* elkaar via een gesprek. Er is geen product dat dat register aanhoudt. |
| **Positionering** | Onafhankelijk oordelen is onze bestaande competentie en het bestaande vertrouwenskapitaal. Een beoordeelde adressenlijst is geen nieuw product — het is hetzelfde product op een nieuw onderwerp. |

### 2C · Waar wordt het snel creepy, betuttelend of privacygevoelig?

Dit is de belangrijkste subsectie van dit document, want elk voorstel hierna is eraan getoetst.

**Het kantelpunt is niet "we verzamelen te veel". Het is: we tonen iets over jou aan iemand anders.**

Zolang alles wat we weten binnen het account blijft, is verbinding een normaal leefstijldomein met een bekend consent-pad. Zodra er een tweede gebruiker in beeld komt, verandert vier dingen tegelijk:

1. **De inferentie wordt zichtbaar.** In het huidige ontwerp is *"jouw grootste winst is P1"* een privé-conclusie. In een matchingcontext wordt het een eigenschap die anderen kunnen afleiden. Iemand die zichtbaar is in de "wil zaterdag wandelen"-pool van een gezondheidsapp voor mannen 40+ heeft daarmee iets over zichzelf onthuld dat hij nergens expliciet heeft gedeeld.
2. **De context collapse.** Vrijwillig opgegeven interesses zijn op zichzelf laag-risico. Diezelfde interesses, getoond op een platform dat als gezondheidsproduct is gepositioneerd, dragen een lading die ze op Meetup niet hebben. Dat is geen theoretisch punt: het is de reden dat "ik hou van wandelen" hier iets anders betekent dan daar.
3. **Het compliance-regime verandert van vorm.** Zie §7C — user-generated content maakt van ons een hostingdienst met de bijbehorende verplichtingen. Dat is een organisatorische last, geen technische.
4. **Wij worden aansprakelijk voor de ontmoeting.** Zodra we twee mensen bij elkaar brengen die elkaar niet kenden, ontstaat een zorgplicht-exposure die een adviesproduct niet heeft.

Betuttelend wordt het op een ander punt: **elk bericht dat de afwezigheid van contact benoemt.** *"Je hebt deze week nog niemand gesproken"* is de meest voor de hand liggende engagement-nudge en tegelijk de meest schadelijke zin die dit domein kan produceren. Zie de kill list.

### 2D · Welke sociale problemen lossen we eigenlijk op?

Niet "eenzaamheid". Dat is een toestand, we mogen hem niet meten (§C2 van het besluitdoc), en er is geen productinterventie voor.

Wel: **vier concrete frictiepunten**, elk met een ander antwoord.

| Frictie | Wat er werkelijk vastzit | Wat het oplost |
|---|---|---|
| **Intentie zonder moment** | "We moeten weer eens" — er is geen datum | Een agenda-moment (P1) |
| **Moment zonder initiatief** | Wachten tot de ander belt | Een verstuurde uitnodiging (P2) |
| **Initiatief zonder adres** | "Ik weet niet waar ik moet beginnen" | **Een gelegenheden-gids (P3) ← het gat** |
| **Adres zonder drempelinformatie** | "Ik weet wel waar, maar niet of ik daar alleen kan binnenlopen" | **Een drempelkaart ← het onderscheid** |

De derde en vierde rij bestaan vandaag nergens in het product. Dat is de hele opdracht.

---

## 3 · Social Connection framework

Vijf pijlers. Ze zijn géén nieuwe laag: ze zijn de bestaande zes ladderprioriteiten, gegroepeerd naar het soort werk dat het product moet doen.

| # | Pijler | Ladderlaag | Wat het product doet | Wat het product níét doet |
|---|---|---|---|---|
| **1** | **Zetten** | P1 | Een moment vastleggen dat niet van de dag afhangt | Bepalen met wie |
| **2** | **Beginnen** | P2 | De uitnodiging opstellen en de drempel verlagen | De uitnodiging versturen of de ontvanger kennen |
| **3** | **Aanhaken** | P3 | Tonen waar mensen al samenkomen, met een oordeel en een drempelkaart | Mensen aan elkaar koppelen |
| **4** | **Verdiepen** | P4 | Het moment en de vorm aanreiken (naast elkaar, niet tegenover) | Het gesprek faciliteren of registreren |
| **5** | **Teruggeven** | P5 | De wederkerigheid-ingang openen | Bijhouden voor wie je iets doet |

De rechterkolom is de belangrijkste. Elke pijler heeft een expliciete grens, en die grenzen zijn samen het antwoord op §27 van de opdracht: het product hoeft nergens te weten wie eenzaam is, omdat het nergens een persoon als object heeft — alleen een moment, een uitnodiging of een adres.

**Wat er per pijler nodig is:**

| Pijler | Data | Privacy | Bestaat al? |
|---|---|---|---|
| Zetten | ritme, vorm, ankerpunt | 🟢 eigen account | ✅ prebuild VI |
| Beginnen | niets — de tekst wordt gegenereerd en niet bewaard | 🟢 | ❌ |
| Aanhaken | postcodegebied (PC2/PC3), gekozen categorie | 🟢 | ❌ **← hoofdmoot** |
| Verdiepen | niets nieuws | 🟢 | ✅ prebuild P4 |
| Teruggeven | niets nieuws | 🟢 | ✅ prebuild P5 |

---

## 4 · Jobs-to-be-Done

De zes situatie-enums in [`domain-goal.ts:87`](../../src/lib/domain-goal.ts#L87) zijn al de JTBD-kaart, en ze zijn goed. Dit is hun uitwerking naar intensiteit, volume en oplosbaarheid — de drie assen die bepalen wat je eerst bouwt.

| JTBD | Enum | Volume | Intensiteit | Oplosbaar met | Prio |
|---|---|---|---|---|---|
| "Mijn vrienden bestaan, we spreken alleen nooit af" | `contact_onderhouden` | **hoog** | midden | Uitnodiging-opsteller | **1** |
| "Ik weet niet waar ik zou beginnen" | — (`CON_BLOCK=1`) | midden | **hoog** | Gelegenheden-gids | **2** |
| "Alleen ergens binnenlopen is de drempel, niet het ding zelf" | — | **hoog** | **hoog** | **Drempelkaart** | **3** |
| "Ik wil sporten met leeftijdsgenoten, niet met 25-jarigen" | — | midden | midden | Gids-filter | 4 |
| "Ik ben verhuisd of gescheiden en ken hier niemand" | `opnieuw_opbouwen` | **laag** | **zeer hoog** | Gids + drempelkaart | 5 |
| "Er is iemand, maar we praten nooit ergens over" | `echt_gesprek` | midden | hoog | Vorm-hulp (P4) | 6 |
| "Tijd met mijn partner die niet over logistiek gaat" | `partner_tijd` | hoog | midden | Moment zetten (P1) | 7 |
| "Aanwezig zijn bij mijn kinderen zonder telefoon" | `aanwezig_zijn` | hoog | midden | Grenzen — hoort bij **stress**, niet hier | — |
| "Alleen kunnen zijn zonder me eenzaam te voelen" | `alleen_zijn` | midden | hoog | **Geen productinterventie** — dit is de `CON_FIT`-erkenning | — |

Drie observaties die het bouwplan sturen:

**De hoogste JTBD is Strengthen, niet Expand.** "Mijn vrienden bestaan, we spreken alleen nooit af" heeft het grootste volume en is verreweg het goedkoopst op te lossen. Dat is de omgekeerde volgorde van wat een sociale-app-instinct zegt.

**De rij met de hoogste gecombineerde score is de drempelkaart** — hoog volume én hoge intensiteit — en die staat vandaag nergens in het product of in enige concurrent.

**Twee rijen horen hier expliciet niet.** `aanwezig_zijn` is een grenzenprobleem en hoort bij stress. `alleen_zijn` heeft geen interventie en is precies waar `CON_FIT = 4` voor bestaat. Ze in de verbindingsfunnel trekken zou van een voorkeur een tekort maken.

---

## 5 · Feature universe

Zestien features, plus twee die geanalyseerd en verworpen zijn. Privacy-risico volgens de gevraagde schaal: 🟢 laag · 🟡 midden · 🟠 verhoogd · 🔴 hoog.

---

### F1 · Uitnodiging-opsteller 🟢 — **MVP**

**Probleem.** "We moeten weer eens" is de meest voorkomende manier om niets af te spreken. De drempel is niet de wil, het is het formuleren van een concreet voorstel.

**Flow.** Gebruiker kiest een vorm (koffie, wandelen, klussen, eten) → kiest een dagdeel uit zijn eigen gezette moment → krijgt drie kant-en-klare zinnen → **kopieert of opent zijn eigen WhatsApp/SMS via de share-sheet** → verstuurt zelf.

**UX.**
> **Eén bericht, met een datum erin**
> Kies wat je voorstelt. Wij maken de zin; jij kiest aan wie en verstuurt hem zelf.
>
> `Zin ▾` *"Zin om zaterdagochtend te wandelen? Ik loop meestal rond 10 uur, kun je aanhaken."*
>
> [ Kopieer ] [ Open in je berichten-app ]
>
> *Wij zien niet naar wie je dit stuurt en bewaren de tekst niet.*

**Data nodig.** De gekozen vorm en het dagdeel — die staan al in het moment. **Data níét nodig:** contactenlijst, naam, telefoonnummer, of het bericht verstuurd is, of er is geantwoord.

**Waarom het werkt.** Het lost de exacte frictie op (formuleren) zonder de duurste component te bouwen (het adresboek). En het is de enige "sociale" feature die op dag één werkt bij één gebruiker — geen cold start.

**Misbruik.** Vrijwel nul: wij zijn geen verzendkanaal. Enige risico is dat de gegenereerde zin ongelukkig valt; mitigatie is drie varianten aanbieden en de gebruiker laten redigeren.

---

### F2 · Het moment 🟢 — **bestaat al (prebuild VI)**

Ritme, vorm en ankerpunt in één sheet. Zonder naamveld, met de uitleg waarom. Ongewijzigd overnemen uit de prebuild.

---

### F3 · Gelegenheden-gids 🟢 — **MVP**

**Probleem.** `CON_BLOCK = 1` — "ik weet niet goed waar ik zou beginnen." De ladder eindigt vandaag in een aansporing zonder adres.

**Flow.** Gebruiker geeft een postcodegebied (twee of drie cijfers, niet zijn adres) → kiest een of meer categorieën → krijgt een lijst van bestaande, echte gelegenheden in de omgeving, elk met een oordeel en een drempelkaart.

**UX.**
> **Waar je terecht kunt · omgeving 35xx**
> Zestien plekken binnen ± 15 km waar mensen wekelijks samenkomen. Wij hebben ze beoordeeld op één ding: kun je hier de eerste keer alleen binnenlopen?
>
> [ Wandelen ] [ Klussen & repareren ] [ Sport ] [ Koken & eten ] [ Muziek ] [ Vrijwilligerswerk ]

**Data nodig.** Postcodegebied op PC2/PC3-niveau en de gekozen categorie. **Data níét nodig:** exact adres, GPS, leeftijd, geslacht, naam, of hij ergens heen is gegaan.

**Waarom het werkt.** Het is het enige antwoord op de vraag die de ladder oproept en niet beantwoordt. En het cold-start-probleem bestaat niet: deze gelegenheden zijn er al, met of zonder ons.

**Architectuur.** Zie §7D — statische data in `src/data/`, exact het patroon van het aanbieder-besluit bij beweging.

---

### F4 · Drempelkaart 🟢 — **MVP · dit is de feature die het verschil maakt**

**Probleem.** Weten dát er een wandelgroep is, is niet het probleem. Niet weten wat er gebeurt als je daar in je eentje komt aanlopen, is het probleem.

**Flow.** Onderdeel van elke gids-kaart, altijd zichtbaar, altijd dezelfde zes velden.

**UX.**
> **Wandelgroep — dinsdagochtend 09:30**
> Vertrek bij de parkeerplaats. ± 8 km, twee uur, tempo gemiddeld.
>
> | | |
> |---|---|
> | Alleen komen | **Ja — de meesten komen alleen** |
> | Aanmelden vooraf | Niet nodig |
> | Lid worden | Niet verplicht |
> | Kosten | Geen |
> | Eerste vijf minuten | Je meldt je bij de persoon met het klembord. Er is geen voorstelrondje. |
> | Leeftijd | Gemengd, zwaartepunt 50+ |
>
> *Gecheckt in juli 2026. Klopt dit niet meer? Laat het ons weten.*

**Waarom dit de kern is.** Het is (a) exact de informatie waar de drempel op vastloopt, (b) niet-persoonsgebonden — het gaat over de gelegenheid, niet over de gebruiker, (c) redactiewerk in plaats van platformwerk, (d) precies wat een vergelijker hoort te doen, en (e) door geen enkele bestaande partij ingevuld. Meetup en Facebook tonen wát er is; niemand toont hoe het voelt om er alleen binnen te lopen.

**De rij "Eerste vijf minuten" is de belangrijkste.** Het is het antwoord op de enige vraag die iemand daadwerkelijk tegenhoudt.

**Kosten, eerlijk.** Dit is handwerk. Elke vermelding kost een telefoontje of een bezoek. Dat is de investering, en het is tegelijk het verdedigingswerk: het is niet te scrapen en niet te automatiseren.

---

### F5 · Gelegenheid-vergelijker 🟢 — **V1.5**

**Probleem.** Drie wandelgroepen in de buurt, en geen manier om te kiezen.

**UX.** Naast elkaar op de drempelvelden — precies het patroon van de bestaande vergelijkingspagina's. Dit is de Consumentenbond-move op een nieuw onderwerp en het maakt de gids een bestemming in plaats van een lijst.

---

### F6 · Ben je geweest? 🟢 — **MVP**

**Probleem.** Zonder terugkoppeling weet noch de gebruiker noch het product of er iets is gebeurd.

**Flow.** Zeven dagen na het gezette moment: één vraag, drie antwoorden, geen vrije tekst.

**UX.**
> **Je moment stond op zaterdag. Ben je gegaan?**
> [ Ja ] [ Nee, het kwam er niet van ] [ Nee, ik heb het verzet ]
>
> *Geen goed antwoord. "Nee" verandert alleen wat we je hierna voorstellen.*

**Waarom.** Dit is de enige uitkomstmeting die niet uit een schaal komt, en het is de basis van de North Star (§14). Vrije tekst is hier verboden — zie §7B.

---

### F7 · Terugkomvraag 🟢 — **V1**

Bij "ja": één vervolgvraag na een week — *"Ga je nog een keer?"* Herhaald bezoek is de dichtstbijzijnde observeerbare voorbode van een relatie die ontstaat, en het is het enige signaal dat het verschil tussen "een keer geweest" en "aangehaakt" meet.

---

### F8 · Aanhaken bij wat je al doet 🟢 — **V1**

**Probleem.** De duurste vorm van sociale actie is een nieuw uur in de week vinden. De goedkoopste is iemand vragen bij iets dat er al staat.

**Flow.** Het product kijkt naar bestaande `agenda_blocks` (wandelen, sporten, klussen) en biedt bij één ervan aan er een uitnodiging bij te maken via F1.

**UX.**
> Je loopt dinsdagochtend al. Dat is het goedkoopste moment om iemand bij te vragen — je hoeft er geen uur voor vrij te maken.
> [ Maak er een uitnodiging bij ]

**Waarom.** Het benut bestaande data zonder nieuwe te verzamelen, en het is inhoudelijk de sterkste zet: aanhaken bij een bestaand ritme heeft een veel hogere slagingskans dan een nieuw ritme beginnen.

---

### F9 · Eerste-keer-voorbereiding 🟢 — **V1**

Praktische informatie vlak vóór een eerste bezoek: waar parkeren, wat meenemen, hoe laat er echt begonnen wordt, bij wie je je meldt. Verlaagt de drempel op het moment dat hij het hoogst is.

---

### F10 · Openingszin-hulp 🟢 — **V1.5**

Drie zinnen voor de eerste vijf minuten ter plaatse ("Ik kom voor het eerst, waar kan ik het beste aansluiten?"). Statische templates, geen AI-gesprek, geen personalisatie.

---

### F11 · Drempelvrije introductie via een derde 🟢 — **V1.5**

**Probleem.** De sterkste route naar een nieuwe groep loopt via iemand die er al komt.

**UX.** *"Ken je iemand die hier al komt? Meegaan met iemand die de weg weet is de kortste route naar binnen."* → F1 met een aangepaste zin.

Combineert Strengthen en Expand zonder ook maar één nieuw datapunt.

---

### F12 · Gelegenheid melden 🟡 — **V2**

Gebruikers dragen ontbrekende lokale opties aan. **Dit is user-generated content en verandert het compliance-regime** (§7C). Mitigatie die dat regime intact houdt: het is een *tip aan de redactie*, niet een publicatie. Niets verschijnt zonder redactionele verificatie, er is geen auteursnaam, en de indiener is nergens zichtbaar. Daarmee blijft het inkomende post in plaats van hosting.

---

### F13 · Dekkingskaart 🟢 — **V1.5**

Hoeveel gelegenheden er in een gebied zijn, per categorie. Zet ook de eerlijkheid neer waar de dekking dun is — zie de lege staat in §10.

---

### F14 · Seizoensagenda 🟢 — **V2**

Terugkerende lokale evenementen met een lage drempel (avondvierdaagse, buurtmarkt, NLdoet). Eenmalige gelegenheden hebben een lagere instapdrempel dan een wekelijkse groep en zijn daarmee een goede eerste stap.

---

### F15 · Wederkerigheid-prompt 🟢 — **V1**

P5 als concrete zet: *"Wie zou jij kunnen vragen hoe het met hém gaat?"* — de enige stap op de ladder die geen hulpvraag is, en voor deze doelgroep vaak de makkelijkste ingang.

---

### F16 · Verzet in plaats van geschrapt 🟢 — **V1**

Als het moment niet doorging, is de standaardactie verzetten en niet schrappen. Eén tik. Geen schuldcopy — zie de kill list.

---

### Twee features die zijn onderzocht en verworpen

**F-X · Activiteiten-matching ("3 mensen willen zaterdag wandelen") 🔴 — NIET BOUWEN**

Dit stond in de opdracht als voorbeeld van een micro-interventie. Drie problemen, elk afzonderlijk voldoende:

1. **Het lekt intentie.** Zichtbaar zijn in een pool is een disclosure die de gebruiker nooit expliciet heeft gedaan.
2. **De belofte is niet waar te maken bij lage dichtheid.** Zegt het scherm "3 mensen" en verschijnt er niemand, dan is het vertrouwen weg — en niet alleen in deze feature.
3. **Het maakt ons verantwoordelijk voor de ontmoeting** tussen mensen die elkaar niet kenden, inclusief de volledige safety-laag uit §8.

**F-Y · Groepschat 🔴 — NIET BOUWEN**

Vraagt moderatie, notice-and-action, en een permanent bemenste rapportage-afhandeling. Levert bovendien het verkeerde gedrag op: praten *over* samen iets doen is de bekendste manier waarop sociale features hun eigen doel ondermijnen.

---

## 5B · De bewijslaag — van speculatie naar telbaar

**De kritiek is terecht: Voortgang en het moment zijn vandaag zelfrapportage die naar zelfrapportage wijst.** Je vult acht vragen in, wij leiden er een volgorde uit af, jij zet een moment, en niets verifieert ooit dat er iets is gebeurd. Dat is geen meting maar een interpretatie met een datum erop. Beweging heeft dit al opgelost — `movement_session_log` met de lock *minuten = evidence, nooit een tweede score*. Verbinding heeft het equivalent nodig.

### 5B.1 · Het probleem precies

| Wat het scherm toont | Wat het werkelijk is | Waarom dat schuurt |
|---|---|---|
| "Je ziet mensen weer wekelijks" | jouw antwoord van vandaag | ✅ feit — maar leest als vaststelling |
| "Je grootste winst zit bij P2" | onze regel toegepast op 8 antwoorden | ⚠️ **redenering**, gepresenteerd als bevinding |
| "Initiatief nemen heeft een moment nodig" | een claim uit de literatuur | ⚠️ **algemene kennis**, gepresenteerd als over jou |
| "Je moment: afspreken · vrijdagmiddag · 1× per week" | een voornemen | 🔴 **nul bewijs** dat het ooit gebeurde |

De vierde rij is de ernstigste. Een moment dat je in maart zette en sindsdien nooit hebt gehaald, ziet er op het scherm identiek uit als een moment dat twaalf weken achter elkaar doorging. Dat is precies het punt waarop een leefstijlproduct ongeloofwaardig wordt.

### 5B.2 · Herkomstlabels — vier niveaus, altijd zichtbaar

Elke regel op Voortgang draagt zichtbaar waar hij vandaan komt. Dit is het `own`-patroon uit beweging (`MOVEMENT_FACT_STATUS_LABELS`), uitgebreid naar vier tiers.

| Tier | Label | Voorbeeld | Bron |
|---|---|---|---|
| **1** | `Jouw antwoord` | "Ongeveer één keer per week" | de check, letterlijk overgenomen |
| **2** | `Door jou gelogd` | "4 van de 6 momenten gingen door" | de momentlog, geteld |
| **3** | `Onze redenering` | "Daarom staat initiatief nu boven activiteit" | de ladderregel, met de bron erbij |
| **4** | `Populatiecijfer` | "10% van de 15-plussers, CBS 2024" | externe bron, jaartal verplicht |

**Regel: tier 3 en tier 1 mogen nooit in dezelfde zin staan zonder markering.** Dat is de enige manier waarop "wat je zei" en "wat wij denken" uit elkaar te houden blijven. Vandaag lopen ze door elkaar, en dat is wat het speculatief laat voelen.

### 5B.3 · De momentlog — het telbare deel

Eén tabel, `connection_moment_log`, met het minimum dat een feit oplevert:

| Kolom | Waarde | Waarom |
|---|---|---|
| `moment_id` | ref naar het gezette moment | koppeling |
| `occurred_on` | datum | telbaarheid |
| `status` | `doorgegaan` \| `verzet` \| `niet_doorgegaan` \| `geen_antwoord` | drie uitkomsten plus de eerlijke vierde |
| — | **geen vrije tekst, geen met wie, geen locatie, geen duur** | §7A |

`geen_antwoord` is geen restcategorie maar een verplicht onderdeel: het is de enige manier om de noemer eerlijk te houden.

**Lock, overgenomen van beweging: doorgegaan = bewijs, nooit een tweede score.** De log telt en toont; hij wordt nooit omgerekend naar een cijfer, een percentage-met-oordeel of een streak.

### 5B.4 · Wat Voortgang dan toont

In plaats van een interpretatie:

> **Je moment** · `Door jou gelogd`
> Staat sinds 9 juli — zes weken.
> **4 doorgegaan · 1 verzet · 1 niet doorgegaan**
> Van 2 momenten weten we het niet; die tellen niet mee.
>
> **Je antwoorden** · `Jouw antwoord`
> Contactritme ging van "Een paar keer in die twee weken" naar "Ongeveer één keer per week". Gemeten 13 augustus, daarvoor 30 juli.
>
> **Waarom initiatief nu boven activiteit staat** · `Onze redenering`
> Meta-analytische review over 280 studies (2025): de grootste effecten zitten op wie het initiatief neemt, niet op het aantal contacten. Daarom staat P2 boven P3 zolang je ritme staat.

Drie blokken, drie herkomsten, niets door elkaar. **Dat is het verschil tussen professioneel en speculatief** — niet meer data verzamelen, maar zichtbaar maken wat waarvandaan komt en wat we níét weten.

### 5B.5 · De eerlijkheidsregel

De sterkste zet is het tonen van de ontbrekende noemer. *"Van 2 momenten weten we het niet"* doet meer voor de geloofwaardigheid dan welke visualisatie ook, en het is dezelfde beweging als de lege staat van de gids (§10): eerlijk zijn over wat er niet is, is de reden dat het oordeel over de rest iets waard is.

**Consequentie voor de bouwvolgorde:** de momentlog (F6/F7) schuift van prioriteit 3 naar **prioriteit 1 van de MVP**. Zonder bewijslaag is elke andere feature een voornemen met een mooi scherm.

---

## 6 · Matchingstrategie

De opdracht vraagt om drie modellen. Er zijn er zes zinvol; hier alle zes, op de gevraagde assen.

| | **A** Interesse | **B** Activiteit | **C** Doel | **D** Community-first | **E** Gids (extern) | **F** Eigen netwerk |
|---|---|---|---|---|---|---|
| Wat wordt gekoppeld | persoon ↔ persoon | persoon ↔ tijdslot | persoon ↔ persoon | persoon ↔ groep (van ons) | persoon ↔ **bestaande** groep | persoon ↔ **eigen** contact |
| Gebruikerswaarde | midden | hoog *mits dichtheid* | laag | hoog *mits dichtheid* | **hoog** | **hoog** |
| Privacy | 🟠 | 🟠 | 🔴 | 🟡 | 🟢 | 🟢 |
| Veiligheidslast | hoog | hoog | hoog | hoog | **inherent aan de host** | **geen** |
| Complexiteit | hoog | hoog | hoog | zeer hoog | midden (redactie) | **laag** |
| Cold start | **fataal** | **fataal** | **fataal** | **fataal** | **opgelost** | **bestaat niet** |
| Schaalbaarheid | netwerkeffect | netwerkeffect | netwerkeffect | netwerkeffect | lineair redactiewerk | **oneindig** |
| Creepy-risico | hoog | midden | **zeer hoog** | midden | laag | laag |
| Kans op echte verbinding | laag | midden | laag | midden | **hoog** | **hoog** |

### De cold-start-rekensom, expliciet

Dit is het argument dat de modellen A–D beslist, en het verdient een getal in plaats van een gevoel.

Voor activiteitsmatching heb je **lokale gelijktijdige dichtheid** nodig: genoeg mensen in dezelfde regio, met dezelfde interesse, op hetzelfde moment beschikbaar, tegelijk bereid zichtbaar te zijn. Neem een optimistisch scenario van 10.000 actieve gebruikers verspreid over Nederland. Verdeeld over ~340 gemeenten is dat ~29 per gemeente. Daarvan is misschien een derde geïnteresseerd in een sociale functie (~10), een deel daarvan bereid zichtbaar te zijn (~5), met overlappende categoriekeuze (~2) en overlappende beschikbaarheid op een concreet dagdeel (**~0–1**).

**Bij tienduizend gebruikers levert activiteitsmatching in de gemiddelde gemeente nul matches op.** Het model werkt pas bij grootstedelijke dichtheid van een andere orde, en tot dat punt is elke matching-UI een belofte die niet wordt ingelost.

De precieze aantallen zijn onbekend en zouden geverifieerd moeten worden, maar de conclusie is robuust tegen een factor tien: ook bij 100.000 gebruikers is het resultaat in de gemiddelde gemeente enkele personen per categorie per dagdeel.

Model **E** heeft dit probleem niet, omdat de dichtheid al bestaat: die wandelgroep loopt al, met of zonder ons. **Dat is het beslissende argument** — niet privacy, hoewel privacy dezelfde kant op wijst.

### Model G · Online, consent-based, gefirewalled — herziening van 13 augustus

**Twee correcties op de analyse hierboven. Beide gaan over model G en beide gaan mijn kant uit ongelijk.**

**Correctie 1 — de cold-start-rekensom geldt alleen voor fysieke, lokale matching.** Dat is een aanname die ik niet expliciet had gemaakt en die het hele argument draagt. Zodra een match ook *online* mag beginnen — een gesprek, een videocall, een correspondentie — verdwijnt de gemeentelijke deler uit de som. Dan is de noemer landelijk: 10.000 gebruikers met overlappende interesses leveren tientallen werkbare koppelingen op, niet 0–1. **Het dichtheidsargument houdt geen stand tegen een online-eerst model.** Dat was de sterkste pijler onder "niet bouwen", en hij valt weg.

**Correctie 2 — AVG is niet de blokkade, en ik heb dat te stellig gebracht.** De precieze stand van zaken:

| Vraag | Antwoord |
|---|---|
| Mag je matchen op vrijwillig opgegeven interesses? | **Ja.** Gewone persoonsgegevens, art. 6 lid 1 sub a of b. |
| Mag je bijzondere gegevens gebruiken met toestemming? | **Ja** — art. 9 lid 2 sub a lift het verbod. Datingapps verwerken op die grond seksuele gerichtheid; interesses en woonafstand zijn een lichtere categorie dan dat. |
| Waar zit het risico dan wél? | **In afleiding, niet in de velden zelf.** Het HvJ oordeelde in C-184/20 (*OT*, 1 aug. 2022) dat publicatie van gegevens waaruit indirect een bijzondere categorie is af te leiden, zélf verwerking van die categorie is. Zichtbaar zijn in een matchingpool ván een gezondheidsproduct kan zo'n indirecte afleiding opleveren. |
| Is dat onvermijdelijk? | **Nee — het is een ontwerpkeuze.** Zie de firewall hieronder. |
| Waar sluipt art. 9 alsnog binnen? | **Bij "kernwaarden".** Raken de vragen levensbeschouwing, religie of politiek, dan is dat art. 9 *rechtstreeks*, niet bij afleiding. Dat is te vermijden door waarden te formuleren als voorkeuren in samenwerking en activiteit, niet als overtuigingen. |

*Dit is privacy-analyse, geen juridisch advies; de precieze conclusie hangt af van de implementatie en hoort bij dezelfde jurist die de DPIA nog moet bevestigen.*

**De firewall — het ontwerp dat het verdedigbaar maakt.** De inferentie-exposure ontstaat door de kóppeling tussen matchingprofiel en gezondheidsdossier, niet door het matchen zelf. Verbreek die en het risico zakt naar gewoon:

| Regel | Concreet |
|---|---|
| Aparte tabelfamilie | `soc_*` — vierde prefix naast `affiliate_clicks`, `pd_*`, `af_*` |
| Geen leespad | `soc_*` mag `intake_sessions`, `CON_*` of `domain_scores` **nooit** lezen. Afdwingbaar in code review en met een test. |
| Aparte toestemming | Eigen consent-tekst, eigen `consent_records`-rij, los intrekbaar zonder de leefstijlcheck te raken |
| Aparte opt-in | Deelname is een expliciete handeling, nooit een gevolg van een check-antwoord |
| Geen gedeelde identiteit | Matchingprofiel draagt geen naam of foto uit het account |
| Eén richting | De check mag nooit *"we zien dat je weinig contact hebt — wil je matchen?"* tonen. Dat is exact de inferentie die de firewall moet voorkomen. |

Met die zes regels is het matchingprofiel: vrijwillig opgegeven interesses, samenwerkingsvoorkeuren en een geschatte afstand. Dat is een gewoon sociaal product en geen gezondheidsverwerking.

### Model G.1 · Pseudonieme identiteit — de avatar als privacyfunctie

**Dit lost het dating-drift-probleem op dat hierboven als onopgelost stond.** Een avatar is hier geen versiering maar het zevende firewall-onderdeel, en het is het onderdeel dat het meeste doet.

| Ontwerpkeuze | Wat het uitschakelt |
|---|---|
| **Illustratie in plaats van foto** | Selectie op uiterlijk. Zonder foto's is het datingpatroon mechanisch onmogelijk, niet alleen ongewenst. |
| **Handle in plaats van naam** | Vindbaarheid door mensen die je offline kennen; koppeling naar je account; koppeling naar je gezondheidsdossier |
| **Avatar is de matching-identiteit** | Elke lekroute van accountidentiteit naar sociale identiteit — ze zijn niet hetzelfde object |
| **Interesses zijn zichtbaar, de persoon niet** | De eenheid van ontdekking wordt een activiteit of een onderwerp, nooit een persoon. Dat is dezelfde regel die model E veilig maakt. |

**De eerlijke keerzijde: pseudonimiteit is een privacywinst én een veiligheidskost.** Je kunt niet verifiëren met wie je te maken hebt. De mitigatie is een tweetrapsmodel: online begint alles pseudoniem, en de-pseudonimisering is een expliciete, wederzijdse en herroepbare handeling die pas speelt als beide partijen dat willen. Fysiek afspreken hoort dan in groepscontext of op een publieke plek — dezelfde regel die elk serieus platform hanteert.

**Consequentie voor het datamodel:** `soc_*` heeft geen `account_id`-kolom die naar `accounts` wijst als vreemde sleutel-met-leesrecht, maar een aparte pseudonieme identiteit met een koppeling die alleen bij authenticatie wordt gelegd. Dat is meer werk en het is precies het werk dat de firewall waar maakt.

**Wat er ná de firewall overblijft — en dat is het echte bezwaar:**

| Bezwaar | Weegt het? |
|---|---|
| **DSA / moderatie** | **Ja, zwaar.** Gebruiker-tot-gebruiker-contact vraagt notice-and-action, blokkeren, rapporteren en een bemenste afhandeling — een permanente functie met een looptijd, geen feature met een opleverdatum. Dit is het duurste onderdeel en het is organisatorisch, niet technisch. |
| **Dating-drift** | **Ja, maar beheersbaar.** 1:1 matching op persoonlijkheid en woonafstand ís het datingpatroon, ongeacht intentie. Mitigatie in §11 hieronder. |
| **Ander product** | **Ja.** Andere doelgroep-logica, andere retentie, andere kostenstructuur. Het is geen uitbreiding van de vergelijker maar een tweede bedrijf. |
| **Cold start** | **Nee, niet online.** Correctie 1. |
| **AVG** | **Nee, mits gefirewalld.** Correctie 2. |

### Model G.2 · Waar de conversie vandaan mag komen

Verbinding heeft geen schap (§C6) en dus geen omzet. De verleiding is daarom groot om de check zelf de funnel te laten zijn: acht vragen, een uitkomst, en dan *"wil je mensen ontmoeten?"* **Dat is de ene constructie die niet kan**, en het is geen compliance-detail:

- Het is **commercieel gebruik van het gevoeligste signaal dat we hebben** — precies de functie-creep die §C5 voor nurture al verbiedt, nu met een betaald product erachter.
- Het maakt van de check een **acquisitie-instrument**, en daarmee vervalt de reden waarom iemand hem eerlijk invult.
- Het haalt de inferentie binnen die de firewall buiten moet houden: wie na een laag antwoord de community-uitnodiging krijgt, is door ons geclassificeerd.

**Het schone conversiepunt is de gids, niet de check.**

| | Check als funnel | Gids als funnel |
|---|---|---|
| Signaal | *afgeleid* uit gezondheidsantwoorden | **zelf-geselecteerd** — je zocht plekken om mensen te ontmoeten |
| Art. 9-exposure | hoog: de uitnodiging ís de classificatie | geen: browsen op een openbare gids is geen gezondheidsgegeven |
| Hoe het voelt | "wij vinden jou eenzaam" | "je was hier toch al naar op zoek" |
| Firewall | doorbroken | intact |

Iemand die in de gelegenheden-gids aan het bladeren is, heeft **zelf** de intentie uitgesproken om onder de mensen te komen. Dat is een legitiem conversiemoment, het raakt `CON_*` nergens, en het is bovendien het punt waarop de behoefte het scherpst is — namelijk als hij in zijn regio te weinig vindt. Precies daar hoort de opt-in te staan:

> **In jouw omgeving staan er vier.**
> Weinig, en dat ligt niet aan jou — in deze regio is het aanbod dun.
> Er is ook een online plek waar mensen met dezelfde interesses elkaar vinden, onder een zelfgekozen naam. Los account, los van je leefstijlcheck.
> [ Lees hoe dat werkt ]

Dat is dezelfde beweging als de rest van dit document: **niet de persoon beoordelen, maar de gelegenheid tonen** — en de opt-in laten hangen aan wat iemand zelf deed, niet aan wat wij over hem denken te weten.

### Aanbeveling — herzien

**MVP blijft E + F. Model G is een apart product, geen fase van dit product.**

Dat is een andere conclusie dan "niet bouwen", en het verschil is belangrijk. Model G is lawful, technisch haalbaar en het dichtheidsargument houdt er geen stand tegen. Wat ertegen pleit is niet meer compliance maar **volgorde en organisatie**: het vraagt een permanent bemenste moderatiefunctie, het is een tweede propositie met een eigen doelgroep, en het mag W1–W8 van de leefstijlcheck niet vertragen.

De verstandige vorm is een **poort in plaats van een besluit**: bouw E + F, en beschouw model G als een zelfstandig traject dat opengaat zodra drie voorwaarden tegelijk gelden — (1) de leefstijlcheck staat live inclusief bewijslaag, (2) er is capaciteit voor moderatie als doorlopende taak, (3) de firewall-regels liggen vast en zijn door de jurist bevestigd. Zolang één van die drie ontbreekt, is het niet te vroeg maar te duur.

De opdracht merkt op dat een eenvoudiger model beter kan zijn dan een intelligenter model. Dat klopt hier nog steeds — maar niet omdat G niet mag, wel omdat E en F op dag één werken en G een organisatie vraagt die er nog niet is.

---

## 7 · Privacy-by-design

### 7A · Datamodel

| Data | Nodig? | Waarom | Zichtbaar voor anderen | Art. 9? | Bewaartermijn |
|---|---|---|---|---|---|
| `CON_*`-antwoorden (8) | ✅ | check-in, ladderfocus | **nooit** | **ja** — gezondheidsgegevens | 24 mnd, volgt intake |
| Moment: ritme, vorm, anker | ✅ | het plan | **nooit** | nee, maar contextueel gevoelig | tot wijziging |
| Postcodegebied PC2/PC3 | ✅ | gids filteren | **nooit** | nee | tot wijziging |
| Gekozen gids-categorieën | ✅ | gids filteren | **nooit** | nee | tot wijziging |
| "Ben je geweest?" ja/nee/verzet | ✅ | uitkomstmeting | **nooit** | nee | 24 mnd |
| `domain_goal` + `domain_goal_score` | ✅ | eigen ijkpunt | **nooit** | nee | 24 mnd |
| Gelegenheden-data | ✅ | de gids | **publiek** | n.v.t. — geen persoonsgegeven | n.v.t. |
| — | | | | | |
| Exacte locatie / GPS | ❌ | PC2 volstaat | — | — | **niet verzamelen** |
| Contactenlijst | ❌ | user verstuurt zelf | — | — | **niet verzamelen** |
| Naam van een derde | ❌ | zie L6 | — | **ja, van een ander** | **niet verzamelen** |
| Inhoud van uitnodigingen | ❌ | wij zijn geen kanaal | — | — | **niet verzamelen** |
| Profielfoto | ❌ | geen profielen | — | — | **niet verzamelen** |
| Leeftijd / geslacht voor matching | ❌ | geen matching | — | — | **niet verzamelen** |
| Aanwezigheid / online-status | ❌ | geen realtime | — | — | **niet verzamelen** |
| Sociale grafiek | ❌ | bestaat niet | — | — | **niet verzamelen** |

**De onderste helft is het belangrijkste deel van dit document.** Wat we niet verzamelen is de architectuur, niet de restpost.

Rechtsgrond, consent-tekst, vastlegging, retentie en intrekken: ongewijzigd t.o.v. §C3 van het besluitdoc. De gids voegt geen nieuwe rechtsgrond toe — postcodegebied en categoriekeuze zijn gewone persoonsgegevens onder art. 6 lid 1 sub b/a.

### 7B · Inferenties die we bewust niet maken

| Inferentie | Waarom verleidelijk | Waarom problematisch | Alternatief |
|---|---|---|---|
| **Eenzaamheid** | We hebben de items er bijna voor | Toestandslabel, klinisch terrein, MDR-grens (§C2) | `CON_FIT` — de gebruiker zegt het zelf of het schuurt |
| **Sociale isolatie** | Volgt uit `CON_FREQ` + `CON_SOC` | Idem, plus stigmatiserend | De feitrij: zijn eigen antwoordlabel |
| **Kwetsbaarheid** | Zou "extra zorg" kunnen sturen | Classificatie van personen; ook intern schadelijk | Actiebudget — gedrag van het product verandert, het label bestaat niet |
| **Depressie / stemming** | Ligt naast dit domein | Klinische verwerking, verandert het beoogde doel van het platform | Vangnetregel, niet-conditioneel |
| **Netwerkkwaliteit** | Meetbaar uit V2–V6 | Een oordeel over iemands relaties dat wij niet kunnen onderbouwen | Ladderfocus — een volgorde van acties, geen oordeel over mensen |
| **Sociale behoefte uit gedrag** | App-gebruik lijkt te correleren | Afleiden uit gedrag is precies de functie-creep uit DPIA R4 | Alleen expliciet gestelde vragen |
| **Wie bij elkaar past** | De hele matching-verleiding | Vereist een psychologisch profiel per persoon | Geen matching |

Eén regel vat het samen: **wij leiden niets af over de persoon; wij leiden alleen af welke actie er als eerste op het scherm staat.** Het verschil tussen die twee is dit hele domein.

### 7C · Het DSA-punt — de verborgen kostenpost

Zodra gebruikers content plaatsen die andere gebruikers kunnen zien, wordt het product een hostingdienst en komen verplichtingen uit de Digital Services Act in beeld: notice-and-action, klachtenafhandeling, transparantie, informatieplichten. Voor kleine ondernemingen gelden vrijstellingen op een deel van de zwaardere verplichtingen, maar de kern van de hostingverplichtingen blijft — en die vragen een permanent bemenste functie, geen eenmalige bouwinspanning.

**Dit is productadvies, geen juridische zekerheid; de precieze verplichtingen hangen af van de implementatie en horen bij de jurist die de DPIA nog moet bevestigen.** Maar de strategische conclusie staat los van de details: een user-generated-content-functie is een organisatorische verplichting met een looptijd, geen feature met een opleverdatum. Voor een operatie van deze omvang is dat de duurste regel in het hele document.

F12 (gelegenheid melden) is bewust zo ontworpen dat het hier niet in valt: inkomende tip, redactionele verificatie, geen publicatie van gebruikerscontent, geen auteur zichtbaar.

### 7D · Architectuur van de gids

Het aanbieder-besluit bij beweging heeft dit al beslecht en is één-op-één herbruikbaar:

- **Statische data in `src/data/`**, geen tabel. Git wordt de redactie-audit (wie wijzigde welk oordeel wanneer), `tsc` de validatie op verplichte velden.
- **Kosten:** een deploy per redactionele wijziging. Acceptabel bij tientallen vermeldingen.
- **Drempel naar een `dir_*`-tabel** (drie, elk afzonderlijk voldoende): meer dan ± 50 vermeldingen, een gelegenheid die zijn eigen gegevens moet kunnen corrigeren zonder deploy, of openingstijden die vaker dan per kwartaal wijzigen.
- **Bewust niet `pd_*` of `af_*`** — de vier betekenissen van "partner" blijven gescheiden.

**Vermelding ≠ commissie.** Het beweging-besluit scheidt die twee schakelaars zodat een oordeel op de lagen zonder geld aantoonbaar niet door geld gekleurd kan zijn. Voor verbinding is het antwoord scherper: **op verbinding loopt nergens commissie, op geen enkele laag.** De reden is niet dat het niet mag, maar dat de gelegenheden die ertoe doen — buurthuizen, wandelgroepen, verenigingen, vrijwilligersinitiatieven — geen commissiemodel hebben en het ook niet moeten krijgen. Zodra er geld aan hangt, verschuift de lijst naar wie kan betalen, en dat is precies de lijst die deze doelgroep niet nodig heeft.

Dat is dezelfde weigering als §C6 (geen schap), één laag dieper doorgetrokken, en het is opnieuw het scherpste Consumentenbond-signaal dat op dit domein af te geven is.

---

## 8 · Safety-architectuur

De gevraagde safety-laag — blokkeren, rapporteren, moderatie, anti-spam, ongewenst contact — is een antwoord op gebruiker-tot-gebruiker-risico. **In het aanbevolen model bestaat dat risico niet, omdat gebruikers elkaar binnen het product nooit tegenkomen.**

Dat is geen omissie maar de belangrijkste opbrengst van de modelkeuze. Ter vergelijking, wat model B/D wél zou vragen: profielbeheer, blokkeren, rapporteren, moderatiewachtrij met SLA, anti-spam, leeftijdsverificatie, locatie-afscherming, meldpunt-afhandeling en een permanent bereikbare escalatieroute.

Wat er in model E + F wél nodig is, is kleiner en van een andere soort:

| Laag | Risico | Maatregel |
|---|---|---|
| **Product** | Gebruiker gaat af op verouderde informatie en staat voor een dichte deur | Zichtbare `gecheckt`-datum per vermelding + correctiemelding |
| **Product** | Locatie te fijnmazig | PC2/PC3, nooit adres, nooit GPS |
| **Redactie** | Een vermelde gelegenheid blijkt onveilig of onbetrouwbaar | Verwijderingsroute + verplichte herzieningsdatum per vermelding |
| **Redactie** | F12-tips als sluiproute voor reclame | Verificatie vóór publicatie; geen automatische opname |
| **Privacy** | Naam van een derde in `agenda_blocks.title` | Zie besluit L6 — bloktitel komt van ons |
| **Copy** | Vangnetregel ontbreekt op een nieuwe surface | Eén const, byte-identiek, ook op de gids |

**De gids draagt geen zorgplicht voor wat er in een groep gebeurt** — wij zijn er de gids naartoe, niet de organisator. Die grens moet in de disclosure staan en mag nergens vervagen. Wordt hij vaag, dan komt de hele safety-tabel van model B/D alsnog binnen.

---

## 9 · User journeys

### Journey 1 · Strengthen — "mijn vrienden bestaan, we spreken nooit af"

Check-in → readout: *"Je ziet mensen weer wekelijks. Het komt alleen bijna nooit van jou."* (staat C2) → winst = P2 → **F1 uitnodiging-opsteller** → gebruiker kiest een zin, opent zijn eigen WhatsApp, verstuurt → moment in de agenda → **F6 ben je geweest?** → bij ja: **F7 nog een keer?**

*Waar het product terugtreedt:* bij het versturen. Wij zien de ontvanger niet, het bericht niet en het antwoord niet.

### Journey 2 · Expand — "ik weet niet waar ik zou beginnen"

Check-in met `CON_BLOCK = 1` → readout opent met erkenning, **precies één actie** (actiebudget 1 bij `CON_SOC = 1`) → die ene actie is de activiteit-route → **F3 gids** met postcodegebied → **F4 drempelkaart**: kun je alleen komen, hoef je je niet aan te melden → **F9 eerste-keer-voorbereiding** → bezoek → **F6** → bij ja: **F7 terugkomvraag** → bij twee bezoeken: het product zegt niets meer en treedt terug.

*Waar het product terugtreedt:* na het tweede bezoek. Vanaf daar is het een relatie tussen mensen en heeft een app er geen rol meer in. Dat expliciet maken is een productkeuze, geen tekortkoming.

### Journey 3 · De kalibratie — "dit past me"

Check-in met `CON_FIT = 4` → **geen winst-laag, nul acties, geen gids, geen uitnodiging** → readout: *"Je hebt weinig contact, en het past je."* → ladder leesbaar, duwt nergens → hercheck over veertien dagen.

Dit is de journey die het product verdedigt. Zonder deze route maakt het systeem van een voorkeur een tekort — en de gids maakt dat risico gróter dan de prebuild alleen, want een lijst met zestien plekken is een veel luidere impliciete aansporing dan een ladder. **De gids moet daarom aan hetzelfde actiebudget hangen als alle andere acties.**

---

## 10 · UX-copy

### Onboarding — de sociale intentie uitvragen zonder stigma

De vraag *"wil je meer sociale verbinding?"* is niet te stellen zonder iemand in een categorie te duwen. De oplossing is hem niet te stellen: vraag naar een **wens**, niet naar een **tekort**.

> **Wat zou je willen dat er in je week gebeurt?**
> Kies wat past. Je kunt dit later wijzigen, en je hoeft niets te kiezen.
>
> ☐ Vaker afspreken met mensen die ik al ken
> ☐ Iets doen waar ook anderen zijn
> ☐ Nieuwe mensen leren kennen
> ☐ Vaker samen bewegen of sporten
> ☐ Iets doen met mijn handen, met anderen erbij
> ☐ Iets betekenen voor iemand
> ☐ Ontdekken wat er in mijn buurt te doen is
> ☐ Weer aanhaken na een verhuizing of een periode waarin het stil werd
> ☐ Vaker iets met mijn partner dat niet over logistiek gaat
> ☐ Ik zoek hier eigenlijk niets — het gaat goed zo

De laatste optie is niet beleefdheid. Hij is de UI-vorm van `CON_FIT = 4`, hij hoort er zichtbaar bij te staan, en hij moet er hetzelfde uitzien als de rest.

**Wat er niet staat:** het woord eenzaam, elke verwijzing naar wat er mist, en elk cijfer.

### Discovery

> **Waar je terecht kunt**
> Plekken in de buurt waar mensen wekelijks samenkomen. We hebben ze beoordeeld op één vraag: kun je hier de eerste keer alleen binnenlopen?

### Uitnodiging — zonder sociale druk

> **Eén bericht, met een datum erin**
> "We moeten weer eens" is de meest voorkomende manier om niets af te spreken. Een dag en een tijd werken wel.
> [ Kopieer de zin ] [ Open in je berichten-app ]
> *Wij zien niet naar wie je dit stuurt.*

### Lege staat — wanneer er weinig is

Dit is de eerlijkheidstest van de gids, en de meeste producten falen hem.

> **In jouw omgeving staan er vier.**
> Dat is weinig, en dat ligt niet aan jou — in deze regio is het aanbod dun. Twee ervan zijn wel de moeite: bij allebei kun je zonder aanmelden binnenlopen.
> Weet je iets dat hier hoort te staan? [ Laat het ons weten ]

Vier eerlijk tonen is beter dan zestien opvullen met wat toevallig een website heeft. De geloofwaardigheid van het oordeel is het enige dat de gids waard maakt.

### Consent

Geen nieuwe consent-tekst nodig: `domain_checkin_logging` dekt de check-in, en de gids voegt geen bijzondere categorie toe. Wel één zichtbare regel bij de eerste postcode-invoer:

> **Waarom we naar je omgeving vragen**
> Alleen de eerste cijfers van je postcode, om te weten wat er in de buurt is. Geen adres, geen locatievoorziening, en we delen het met niemand.

### De vangnetregel

Ongewijzigd, byte-identiek, ook op de gids en de uitnodiging-opsteller.

---

## 11 · MVP

Vijf features. Alles hieronder is additief aan W1–W8 van het bestaande bouwplan, niet in plaats daarvan.

| # | Feature | Waarom | Gebruikerswaarde | Data | Privacy | Complexiteit | Prio |
|---|---|---|---|---|---|---|---|
| 1 | **F1 Uitnodiging-opsteller** | Hoogste JTBD-volume, werkt bij één gebruiker | hoog | geen nieuwe | 🟢 | **laag** | **1** |
| 2 | **F3 Gelegenheden-gids** | Vult het gat dat de ladder oproept | hoog | PC2 + categorie | 🟢 | midden (redactie) | **2** |
| 3 | **F4 Drempelkaart** | Het eigenlijke onderscheid; zonder dit is de gids een linkdump | **zeer hoog** | geen | 🟢 | midden (redactie) | **2** |
| 4 | **F6 Ben je geweest?** | Enige uitkomstmeting; basis van de North Star | midden | 1 enum | 🟢 | **laag** | **3** |
| 5 | **F2 Het moment** | Bestaat al in de prebuild | hoog | bestaand | 🟢 | **laag** | **4** |

F3 en F4 delen prioriteit 2 omdat ze niet los kunnen: een gids zonder drempelkaart is een lijst die je overal vindt.

**De echte kostenpost van deze MVP is geen code.** Het is de redactie van de eerste gelegenheden. Dat is een bewuste keuze: het is niet te scrapen, niet te kopiëren en het is het enige deel dat verdedigbaar is.

**Praktisch startpunt:** één regio volledig, in plaats van heel Nederland dun. Een gebruiker die vier goed beoordeelde plekken in zijn eigen omgeving ziet, heeft een product; een gebruiker die veertig plekken door heel Nederland ziet, heeft een lijst. Begin waar de meeste gebruikers zitten en zeg eerlijk waar de dekking nog niet is.

---

## 12 · Roadmap

### V1 — moet in de eerste release

F1 uitnodiging-opsteller · F3 gids (één regio) · F4 drempelkaart · F6 ben je geweest · F2 het moment · F8 aanhaken bij wat je al doet · F15 wederkerigheid-prompt · F16 verzetten in plaats van schrappen

*Voorwaarde:* W1–W8 van het prebuild-bouwplan is geland. De check moet er zijn voordat de gids ergens aan hangt.

### V1.5 — als de eerste regio staat

F5 gelegenheid-vergelijker · F7 terugkomvraag · F9 eerste-keer-voorbereiding · F10 openingszin-hulp · F11 introductie via een derde · F13 dekkingskaart · uitbreiding naar 3–5 regio's

### V2 — als er redactiecapaciteit en volume is

F12 gelegenheid melden (met redactionele poort) · F14 seizoensagenda · landelijke dekking · overweging van `dir_*`-tabel zodra een van de drie drempels uit §7D wordt geraakt

### Wat er expliciet níét op de roadmap staat

Matching, profielen, chat, groepen, aanwezigheid. Niet als "later" — als besluit. Zie §13.

---

## 13 · Kill list

| Niet bouwen | Waarom |
|---|---|
| **Automatische eenzaamheidsdetectie** | Toestandslabel, klinisch terrein, MDR-grens. En overbodig: `CON_FIT` vraagt het gewoon. |
| **Sociale-welzijnsscore** | Een cijfer over de kwaliteit van iemands relaties dat we niet kunnen onderbouwen en niet mogen tonen. |
| **Gezondheidsgebaseerde matching** | Art. 9-gegevens gebruiken om mensen te koppelen. Onverdedigbaar, ongeacht consent-constructie. |
| **Persoon-tot-persoon matching bínnen de leefstijlcheck (A/B/C)** | Cold start fataal bij lokaal-fysiek, en de koppeling aan `CON_*` is de inferentie die art. 9 binnenhaalt. **Niet te verwarren met model G**, dat gefirewalld en apart wél kan — zie §6. |
| **Elke brug van de check naar matching** | *"We zien dat je weinig contact hebt — wil je matchen?"* is de ene zin die de hele firewall ongedaan maakt. Model G mag alleen via eigen opt-in binnenkomen, nooit via een check-antwoord. |
| **Een matchingprofiel afleiden uit `CON_*`-antwoorden** | Verleidelijk omdat de data er al ligt en het onboarding scheelt. Maar het maakt van gezondheidsantwoorden een sociaal profiel — de firewall bestaat exact om dit te voorkomen. Het profiel wordt handmatig ingevuld of het bestaat niet. |
| **De check als conversiefunnel naar een betaald sociaal product** | Commercieel gebruik van het gevoeligste signaal in het product; ondermijnt de reden waarom iemand de check eerlijk invult. §G.2 — de gids is het schone conversiepunt. |
| **Profielfoto's in de community** | Zet het datingpatroon aan dat de rest van het ontwerp uitschakelt. Illustratie-avatar, altijd. §G.1 |
| **Eigen groepen en groepschat** | Moderatie- en DSA-last als permanente functie; lokt praten in plaats van doen. |
| **Profielen en profielfoto's** | Maakt van gelegenheden mensen, en van het product een dating-app. |
| **Aanwezigheids- of online-status** | Realtime zichtbaarheid van een gezondheidsapp-gebruiker is een disclosure op zichzelf. |
| **Exacte locatie of GPS** | PC2 volstaat voor elk gebruik dat we hebben. |
| **"Perfect match"-claims** | Belofte die we niet kunnen waarmaken en die het verkeerde model suggereert. |
| **Publieke rankings of leaderboards** | Van verbinding een prestatie maken is de snelste route naar schade. |
| **"Je hebt deze week nog niemand gesproken"** | De meest voor de hand liggende engagement-nudge in dit domein en de schadelijkste zin die het kan produceren. |
| **Streaks op sociaal contact** | Maakt van contact een verplichting en van een gemiste week een falen. |
| **Nurture-mail getriggerd door een laag verbinding-antwoord** | Bestaande lock §C5. Geautomatiseerde e-mail over contact naar iemand die net invulde weinig mensen te hebben, is functie-creep. |
| **Elk supplement, elke prijs, elke commissie op dit domein** | Bestaande lock §C6, in §7D doorgetrokken naar de gelegenheden zelf. |

---

## 14 · Metrics

### Wat we niet meten

Berichten, sessies, schermtijd, DAU, tijd-in-app. Elk daarvan beloont het tegenovergestelde van wat dit domein moet doen: een geslaagd verbindingsproduct ziet de gebruiker mínder.

Ook niet: **aantal verstuurde uitnodigingen.** Dat beloont volume en dus spam. Het is de klassieke fout in dit soort features.

### Kandidaten

| Metric | Meet het het goede? | Meetbaar? | Manipuleerbaar? |
|---|---|---|---|
| Gezette momenten die 14 dagen later nog stonden | proxy voor intentie, niet voor contact | ✅ in-product | matig |
| Eerste bezoeken aan een gelegenheid | echte uitkomst, maar eenmalig | zelfrapportage | laag |
| **Herhaald bezoek — 2+ keer dezelfde gelegenheid** | **dichtstbijzijnde proxy voor een relatie die ontstaat** | zelfrapportage, traag | **laag** |
| Delta op `CON_INIT` | evidence-aligned (agency is de sterkste hefboom) | ✅ bij hercheck | laag |
| Aantal gids-weergaven | pure engagement | ✅ | hoog |

### North Star

> **Het aantal gebruikers dat twee of meer keer naar dezelfde gelegenheid terugging.**

Herhaald bezoek is het enige signaal dat "er is iets ontstaan" van "ik ben een keer geweest" onderscheidt. Het is niet op te blazen met app-gebruik, het beloont geen volume, en het gaat omhoog als het product zichzelf overbodig maakt — precies de goede prikkel.

**Nadeel, eerlijk:** zelfrapportage en een trage cyclus (minimaal vijf weken tot een signaal). Daarom een tweede metric ernaast die wél snel meet.

**Primaire ondersteunende metric:** *delta op `CON_INIT` tussen twee checks* — de verschuiving van "bijna altijd van de ander" naar "van mij of om en om". Dat is de as waar het onderzoek het grootste effect vindt, hij is in-product meetbaar, en hij correleert met de North Star zonder ervan af te hangen.

**Gezondheidswacht (mag niet dalen):** het aandeel `CON_FIT = 4`-sessies dat nul acties te zien krijgt moet 100% blijven. Zakt dat, dan lekt er ergens een aansporing naar mensen die er niet om gevraagd hebben — en dat is de enige manier waarop dit domein echt kapot kan.

---

## 15 · Positionering

| Naam | Belofte | Gevoel | Nadeel | Risico op misverstand |
|---|---|---|---|---|
| **Aanhaken** | "Er loopt al iets. Je kunt erbij." | actief, geen tekort, Nederlands | minder direct herkenbaar als domein | laag |
| **Waar je terecht kunt** | "Wij weten waar mensen samenkomen." | gids, Consumentenbond-register | lang, klinkt als hulpverlening | **midden** — kan als loket lezen |
| **Samen iets doen** | "Niet praten over, maar doen." | concreet, matcht P3 | dekt Strengthen niet | laag |
| **Onder de mensen** | "Er weer tussen zijn." | warm, Nederlands idioom | impliceert dat je er nu buiten staat | **hoog** — dat is een toestandslabel |
| **Verbinding** *(huidig)* | — | neutraal, engine-consistent | abstract, doet niets voor de gebruiker | laag |

### Aanbeveling

**Houd het domein "Verbinding" en noem de feature "Aanhaken".**

Twee redenen om het domein niet te hernoemen: `connection_score` en de pijler `verbinding` zitten in de engine, in `RULES_VERSION` en in de vijf-domeinenstructuur — een naamswijziging daar is een migratie voor een cosmetisch voordeel. En "Verbinding" is als *domeinnaam* prima; het is als *actielabel* dat het niets doet.

"Aanhaken" is de juiste naam voor de feature omdat het precies het model beschrijft: er loopt al iets, jij sluit aan. Geen lidmaatschap, geen sociale intentie vooraf, geen tekort geïmpliceerd. Voor mannen 40+ is het bovendien een woord uit het register van sport en werk in plaats van uit dat van welzijn — en dat register-verschil is de hele §B6-bevinding uit het besluitdoc, in één woord.

"Onder de mensen" is afgeraden ondanks de warmte: het impliceert dat je er nu buiten staat, en dat is precies het toestandslabel dat §C2 verbiedt.

---

## 16 · Eindaanbeveling

**Als ik product owner was, zou ik dit bouwen — in deze volgorde.**

**Eerst afmaken wat er ligt.** W1–W8 van het prebuild-bouwplan. De check, de ladder, de readout, de meetpunten en de DPIA-rij. Zonder de check hangt de gids nergens aan en is er geen reden om hem op het juiste moment te tonen.

**Dan de uitnodiging-opsteller (F1).** Klein, geen nieuwe data, geen cold start, en het bedient de grootste JTBD. Het is de goedkoopste echte sociale waarde die dit product kan leveren, en het levert meteen signaal op over of er animo is.

**Dan de gids met drempelkaart (F3 + F4), in één regio.** Dit is de investering en het is redactiewerk. Het is ook het enige deel van dit hele document dat niet te kopiëren is en dat past bij wat dit bedrijf al kan: onafhankelijk beoordelen en eerlijk zeggen wat er niet deugt.

**En dan niets meer, een tijd lang.** Meet herhaald bezoek. Als mensen twee keer teruggaan, is het product klaar — vanaf dat punt gebeurt het echte werk tussen mensen en moet de app terugtreden.

**Wat ik níét in dit product zou bouwen:** een matchinglaag die aan de leefstijlcheck hangt. Lokaal-fysieke matching verandert niet door succes — bij tien keer zoveel gebruikers levert die in de gemiddelde Nederlandse gemeente nog steeds enkele mensen per categorie per dagdeel op. En elke koppeling tussen check-antwoorden en een matchingprofiel haalt de inferentie binnen die de rest van dit document juist buiten houdt.

**Wat ik wél als apart traject zou openhouden:** model G — online-eerst, eigen opt-in, `soc_*`-firewall. Dat is een reëel product met een reële markt, en de bezwaren ertegen zijn organisatorisch (moderatie als doorlopende functie) in plaats van juridisch. Het verdient een eigen besluitdocument en een eigen businesscase, niet een regel in de roadmap van de leefstijlcheck. **De volgorde is het punt, niet het verbod.**

---

### De kernvraag, beantwoord

> *Hoe helpen we mensen meer betekenisvolle sociale verbinding te ervaren, zonder te weten wie "eenzaam", "kwetsbaar" of "sociaal ongezond" is?*

**Door de vraag om te draaien.** Niet: wie heeft dit nodig? Maar: waar is het al, en wat houdt iemand tegen om er binnen te lopen?

Het eerste vraagt een oordeel over personen — en dat oordeel is precies wat we niet mogen, niet kunnen en niet moeten maken. Het tweede vraagt een oordeel over plaatsen, en dat is wat dit bedrijf al doet.

De hele oplossing zit in dat ene verschil: **wij beoordelen gelegenheden, geen mensen.** Daarom hoeft het product nergens te weten wie eenzaam is — het heeft nergens een persoon als object. Alleen een moment, een uitnodiging die wij niet lezen, en een adres met een eerlijk oordeel erbij.

---

## Open besluiten

**S1 · Bouwen we de gids überhaupt?** Dit is de hoofdvraag van dit document. De alternatieven zijn: de ladder laten eindigen in een aansporing zonder adres (goedkoop, maar het gat blijft), of het platform bouwen (§6 raadt dat af). **Advies: ja, in één regio, na W8.**

**S2 · Welke regio eerst?** Vraagt data die ik niet heb: waar zitten de bestaande gebruikers. Te beantwoorden met een query op bestaande sessies vóór de redactie begint.

**S3 · Nooit commissie op verbinding — bevestigen?** §7D trekt §C6 door naar de gelegenheden. Dat sluit een omzetmodel uit dat bij beweging op P4 wél mag. **Advies: bevestigen** — het verschil is dat sportaanbieders een commissiemodel hebben en buurthuizen niet, en een lijst die verschuift naar wie kan betalen is voor deze doelgroep waardeloos.

**S4 · Hangt de gids aan het actiebudget?** §9 journey 3 zegt ja: bij `CON_FIT = 4` geen gids. Dat betekent dat de belangrijkste nieuwe feature onzichtbaar is voor een deel van de gebruikers. **Advies: ja** — anders is de gids een luidere aansporing dan de ladder ooit was, precies bij de mensen die er niet om vroegen.

**S5 · Wie doet de redactie?** De gids valt of staat met de kwaliteit van de drempelkaart, en die vraagt telefoontjes en bezoeken. Zonder een antwoord op deze vraag is S1 niet uitvoerbaar.

**S6 · Bewijslaag vóór of ná de gids?** §5B verplaatst de momentlog naar prioriteit 1. Dat kost een tabel en een migratie die er in het oorspronkelijke plan niet was. **Advies: ervóór** — zonder bewijslaag toont de gids straks bezoeken die niemand telt, en dan is hij net zo speculatief als het moment nu is.

**S8 · De echte vraag: bouwen we verbinding v1 überhaupt nu? — nieuw, 13 augustus, en het belangrijkste besluit in dit document.**

Aanleiding: het vermoeden dat verbinding meer hoofdpijn geeft dan waarde. **Dat klopt, maar de hoofdpijn zit niet in de bouwkosten — hij staat al live.** Inventarisatie van [`VerbindingScreen.tsx`](../../src/components/dashboard/VerbindingScreen.tsx):

| Wat er nu staat | Aantal | Probleem |
|---|---|---|
| `binnenkort`-beloftes in gerenderde copy | **4** (r. 46, 111, 130, 147) | vier onvervulde toezeggingen op één scherm |
| `DomainSoonPill`-badges | 2 (r. 91, 151) | |
| Knoppen die alleen een tracking-event afvuren | **2** (r. 95–113, 114–133) | een knop die niets doet is een belofte die breekt bij de klik |
| Generieke coach-tegels ("60-seconden check-in", "Korte belafspraak") | 3 | botst met de vastgelegde copy-stijl: feit-eerst, geen generaliserend coach-register |
| Premium-impressie bij elke weergave | 1 | `dashboard_verbinding_premium_upsell` vuurt op mount, op het enige domein dat structureel geen product heeft |

Ter vergelijking: `StressScreen` en `SleepScreen` hebben elk **1** `binnenkort`, `BewegingScreen` heeft er **0** — het patroon is dat beloftes afnemen naarmate een domein gebouwd wordt. Verbinding heeft er vier, en is het minst gebouwd.

De premium-impressie is géén §C5-overtreding (die verbiedt een upsell getriggerd door een *laag antwoord*; deze vuurt op mount). Wel is het het domein zonder product dat de vaakste premium-impressie draait.

**Daarmee zijn er drie opties, niet twee:**

| | Wat | Kosten | Effect |
|---|---|---|---|
| **A** | W1–W10 bouwen zoals gepland | 10 slices + bewijslaag + migratie + DPIA-rij; hoogste compliancelast van vijf domeinen; nul omzet per §C6 | volledig domein |
| **B** | Niets doen | nul | **slechtste optie** — de vier beloftes en de dode knoppen blijven staan en blijven geloofwaardigheid kosten |
| **C** | **Beloftes strippen, ladder als leescontent** | ± 1 slice, grotendeels verwijderwerk | scherm belooft niets meer en krijgt inhoud die wél klopt |

**Advies: C.** Concreet: de twee dode knoppen weg, drie van de vier `binnenkort`-strings weg, de drie generieke tegels vervangen door de zes ladderlagen als leesbare inhoud, en de vangnetregel erbij. De prebuild heeft dit al ontworpen: **de C6-staat ("geen check") rendert de volledige ladder zonder dat er iets gemeten is.** Die staat is als edge case gebouwd en blijkt de verzendbare versie.

Wat daarmee vervalt tot nader order: W3 (route), W4 (readout), W7 (meetpunten voor de check), W9 (artikel), W10 (premium plan), de gids (S1) en model G (S7). De prebuild blijft de specificatie voor als het alsnog gebouwd wordt.

**S9 · Correctie op mijn eigen advies: het profiel is niet het risico, de herkomst is dat — 13 augustus.**

Terechte tegenwerping: een datingapp verzamelt naam, leeftijd, foto's, werk, hobby's en locatie, legaal en op schaal. Dat klopt, en het maakt duidelijk dat ik twee dingen door elkaar heb geschoven. Ze horen gescheiden:

| | Mag het? | Waarom |
|---|---|---|
| **Wat je verzamelt** — naam, leeftijd, interesses, werk, behoeften, gebied | **Ja, ruim** | Met uitdrukkelijke toestemming. Datingapps verwerken zwaardere categorieën dan dit. |
| **Waar het vandaan komt** — afgeleid uit `CON_*` / `connection_score` | **Nee** | Dít is de enige echte grens. Een gezondheidsantwoord dat een sociaal profiel wordt, is de inferentie die art. 9 binnenhaalt. |

**De conclusie draait daarmee om.** Niet "verzamel zo min mogelijk", maar: **vraag het gewoon, en vraag het apart.** Een zelf ingevuld profiel met interesses, werkveld, dagdelen en gebied is gewone data onder art. 6, is direct bruikbaar, en is precies het bezit dat matching later mogelijk maakt. De firewall (§G) blijft staan — hij verbiedt de *koppeling*, niet de *vraag*.

**En daarmee verandert de bouwvolgorde.** Ik adviseerde eerder de gezondheidscheck (W1–W4) eerst. Dat is de verkeerde volgorde:

| | Gevoeligheid | Waarde op dag één | Bouwt naar matching |
|---|---|---|---|
| **CON_\*-check** (health) | art. 9 | een volgorde van prioriteiten | nee — mag er juist niet in |
| **Voorkeurprofiel** (interesses, werk, dagdelen, gebied) | gewone data | gepersonaliseerde suggesties meteen | **ja, het ís het profiel** |

Het voorkeurprofiel is minder gevoelig, sneller waardevol én het enige dat compoundt. **Advies: dat eerst.** De gezondheidscheck kan daarna, of niet.

**S7 · Model G als apart traject openen?** Niet als roadmap-item van de leefstijlcheck maar als eigen besluitdocument met eigen businesscase. De poort gaat open bij drie voorwaarden tegelijk: leefstijlcheck live inclusief bewijslaag, moderatiecapaciteit als doorlopende taak belegd, firewall-regels juridisch bevestigd. **Advies: openhouden, nu niet starten** — en de drie voorwaarden expliciet opschrijven zodat "nu niet" later toetsbaar is in plaats van een gevoel.

---

## Bronnen en verwijzingen

- Intern: `BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md` (§B evidence, §C compliance-locks, §D vragen, §E ladder) · `verbinding-piramide-prebuild-v1-2026-08.html` (staten, actiebudget, copy-lock) · `BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md` (vermelding ≠ commissie, `dir_*`-drempel, verdict-kaartvorm) · `docs/core/DPIA.md` · `docs/core/COMPLIANCE.md` · `docs/core/WRITING_VOICE.md`
- Evidence voor de ladder en het doelgroepmechanisme: zie §B en §M van het besluitdoc (WHO 2025, meta-analytische review 280 studies, Masi et al. 2011, De Jong Gierveld & Van Tilburg 2006, Men's Sheds-literatuur, Movisie).
- **Nog te verifiëren vóór bouw:** de dekking en samenstelling van het Nederlandse aanbod per regio (welke categorieën bestaan waar), en het aantal bestaande gebruikers per regio voor S2. Beide zijn aannames in dit document, geen vastgestelde feiten.
