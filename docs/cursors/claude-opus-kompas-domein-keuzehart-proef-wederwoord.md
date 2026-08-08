# Wederwoord 2 — inhoudsproef: §4 corrigeren en het herbruikbare deel vastleggen

> **Gebruik:** plak het blok onder **Prompt (copy-paste)** als **antwoord in hetzelfde Claude-gesprek** waarin verdict A–H en A′–H′ zijn geleverd. Niet in een nieuw gesprek.
> **Output:** herziene §3, §4, §5, §6 van de inhoudsproef, plus twee nieuwe secties §10 en §11. Geen code.
> **Opgesteld:** 6 augustus 2026.
> **Vorige stap:** `[claude-opus-kompas-domein-keuzehart-wederprompt.md](claude-opus-kompas-domein-keuzehart-wederprompt.md)`
> **Onderwerp:** `[PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md](../design/PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md)`

## Waarom dit wederwoord nodig is

De inhoudsproef staat, op één na alles klopt. Maar §4 rust op een feitelijk onjuiste vaststelling, en dat criterium draagt S5 en S7 — de twee criteria waar de onafhankelijkheidsclaim aan hangt.

**§4 zegt dat beweging schoon start.** Letterlijk: `affiliate-links.ts` bevat "geen enkele beweging-, sport- of trainingsingang", dus er is "geen commerciële relatie met welke kaart uit de prebuild dan ook". Drie dingen weerleggen dat, en het derde komt uit de prebuild zelf.

**Het eigenlijke doel van dit wederwoord is echter §10 en §11.** De proef beslist of één schap gevuld kan worden. Wat nergens vastligt is welk deel daarvan één keer gebouwd wordt en welk deel per domein een datavulling is. Zonder dat contract krijgt elk volgend kompas-domein opnieuw een prebuild, opnieuw een surface en opnieuw een raamwerkdiscussie — en dan is de proef een eenmalige oefening in plaats van een startpunt.

## Besluiten die Dennis vooraf nam

- **Dennis schrijft de oordelen zelf.** Claude levert raamwerk, vindplaatsen en correcties — geen ingevulde kaarten. S8 meet Dennis' uren.
- **Dienst-kaarten noemen voorlopig geen aanbieders.** Generieke diensttypen, geen bedrijfsnamen. Dat is een besluit met gevolgen voor §5 en S7, en die moeten expliciet worden.
- **De regel uit §2 blijft staan:** slaagcriteria worden niet tijdens het invullen versoepeld. Deze correctie komt vóór de eerste optie, niet erna.

---

## Prompt (copy-paste)

```text
De inhoudsproef staat en ik ga hem invullen. Vier correcties eerst, en daarna het
deel dat er nog niet in staat en waar het me eigenlijk om gaat.

Zelfde regels: geen code, geen diffs, geen JSX, geen SQL-DDL, geen HTML-prebuild.
Nederlands, identifiers Engels. Een schema mag als prozatabel (kolom | type | waarom).

Lever ALLEEN de gewijzigde en nieuwe delen. Wat ik niet noem is ongewijzigd; zeg dat
in één regel en herhaal het niet.

═══════════════════════════════════════════════════════════════════
VASTGESTELD — niet heropenen
═══════════════════════════════════════════════════════════════════

- Het proefdocument is docs/design/PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md. Alle
  §-verwijzingen hieronder slaan daarop.
- Ik schrijf de acht oordelen zelf. Jij levert het raamwerk, de vindplaatsen en de
  correcties — geen ingevulde kaarten, geen voorbeeldoordelen boven de ene die er in
  §6 al staat. S8 meet mijn uren.
- Dienst-kaarten noemen voorlopig GEEN aanbieders. Generieke diensttypen
  (personal training, groepsles, online begeleiding, fysiotherapie), geen
  bedrijfsnamen. Dat besluit staat; jij moet zeggen wat het met §5 en S7 doet.
- §2 blijft staan: de criteria worden tijdens het invullen niet versoepeld. Daarom
  komt deze correctie nu.
- Tijdsbudget één week blijft staan.

═══════════════════════════════════════════════════════════════════
CORRECTIE 1 — §4 klopt niet: beweging start niet schoon
═══════════════════════════════════════════════════════════════════

§4 stelt dat src/data/affiliate-links.ts geen beweging-ingang bevat en dat er
daarom "geen commerciële relatie met welke kaart uit de prebuild dan ook" bestaat.
Drie dingen weerleggen dat.

1) Er staan wel degelijk beweging-producten in, met live commissie:
   - creatine — drie links (affiliate-links.ts:33-39)
   - eiwitpoeder — drie links (affiliate-links.ts:57-63)
   Beide hebben een vergelijkingspagina (src/data/supplements/creatine.ts,
   eiwitpoeder.ts) en een gids (src/data/supplement-guides/).

2) Ze zijn niet handmatig uitgezocht. DOMAIN_PRODUCT_STANCE.movement wijst het
   beweging-domein exact deze twee toe als kandidaten
   (src/data/domain-product-stance.ts:21-24). Er is geen ruimte om de makkelijke
   te kiezen.

3) De prebuild weerlegt §4 zelf. Scherm #s-b bevat een magnesium-kaart met chip
   "Nu niet" (v3, r924-945) en dáár staat de commissie-microcopy onder:
   "We ontvangen commissie als je via ons koopt" (r945). Magnesium heeft drie
   affiliate-links (affiliate-links.ts:49-55). De prebuild ging dus al uit van
   een gemonetiseerde kaart met een negatief oordeel — precies wat §4 onmogelijk
   verklaart.

En het is scherper dan alleen een commissierelatie. Er staat al een
gepersonaliseerde doorverwijzing naar de betaalde pagina in het bewegingsplan:
stap mov-creatine-vergelijk, "Vergelijk creatine als aanvulling", met
link.kind "comparison" naar COMPARISON_PATHS.creatine
(src/data/lifestyle-plans/movement.ts:211-226). De showWhen is
{ answerAtMost, question: "MOV_STR", value: 2 } — de stap vuurt juist bij een LAGE
krachtscore. Het product wordt vandaag aangeraden aan wie er het minst voor traint.

Dat is winst, geen tegenslag. S5 hoeft niet verzwakt te worden naar een
hypothetisch zou_monetiseren; de scherpere vorm is nú vervulbaar.

Wat jij moet leveren in §4′:
- is_monetised terug als apart feitveld NAAST zou_monetiseren. Het eerste is feit
  (er loopt vandaag commissie), het tweede is voornemen. Ze meten niet hetzelfde en
  ze horen allebei in het schema.
- Creatine en eiwitpoeder verplicht op het schap. Weglaten zou de proef precies op
  het gemakkelijke punt laten slagen.
- Herzie de alinea "oordeel eerst, commissie volgt": die geldt nog voor dienst en
  sociaal, niet voor product. Zeg wat er dan overblijft van dat principe.

═══════════════════════════════════════════════════════════════════
CORRECTIE 2 — twee vindplaatsen uit je overzicht kloppen niet
═══════════════════════════════════════════════════════════════════

Ik heb ze nagelopen voordat ik ging schrijven. Beide gaan over een gemonetiseerd
product, dus ze mogen niet in een oordeel terechtkomen.

1) Eiwitpoeder heeft GEEN goedgekeurde claim. In approved-claims.ts:368-376 staat
   claims: [], supportingEvidence: [], met de note "Geen EU-gezondheidsclaims op
   eiwit als zodanig. Vergelijking is inname/praktijk, geen statusclaim." De claim
   over spiermassa-behoud die je noemde bestaat nergens in src/. As 1 valt dus op
   "geen claim", niet op "een andere claim".

2) creatine.strength-55plus geldt uitsluitend voor 55-plus
   (approved-claims.ts:338-344, herhaald in de note op r366). Mijn doelgroep is 40+.
   Voor 40 tot 55 draagt alleen creatine.performance — korte, zeer intensieve
   inspanning — en dus niet spierkrachtbehoud.

Gevolg voor S5, en dit is het punt: met die twee feiten ligt de uitkomst van S5 al
vast vóór ik één kaart schrijf. Eiwitpoeder kan op as 1 niet hoger dan zwak,
creatine niet voor het grootste deel van de doelgroep. S5 wordt daarmee een
consistentiecheck, geen proef.

Wat jij moet leveren in §3′:
- Herformuleer S5 met een consequentie-clausule. Voorstel om op te toetsen of te
  verbeteren: een "niet"- of "zwak"-oordeel op een optie met is_monetised: ja moet
  binnen dezelfde slice doorwerken in de BESTAANDE surface — de plan-stap
  mov-creatine-vergelijk en de copy op de vergelijkingspagina. Zonder die clausule
  geldt de onafhankelijkheid alleen op het nieuwe schap en niet op de plek waar de
  klik vandaan komt.
- Zeg of dat S5 te zwaar maakt voor een proef die geen code mag raken, en zo ja:
  wat de lichtste variant is die het nog bewijst.

═══════════════════════════════════════════════════════════════════
CORRECTIE 3 — drie defecten in §3, §5 en §6
═══════════════════════════════════════════════════════════════════

1) De oordeelwoorden botsen met de slotnamen. §5 legt de sloten vast als
   Gecheckt · Sterk · Zwak · Oordeel, terwijl de bond-as óók sterk/zwak/niet heet.
   In de voorbeeldkaart in §6 staat verdict: zwak terwijl het Sterk-slot iets
   positiefs zegt. Over 32 oordelen levert dat verwarring op bij wie invult én wie
   leest. De ladder ligt vast, dus verplaats de botsing naar de sloten:
   Gecheckt · Wat pleit vóór · Wat pleit tegen · Oordeel. Dat is bovendien
   accurater — de middelste sloten zijn argumenten, het laatste is de conclusie.
   Let op: dit raakt niet alleen de kaartcopy maar ook het doel-tabelschema en de
   prebuild (v3 r836-839 en r876-879). Zeg waar het besluit landt.

2) S6 vreet aan S1 en dat zit niet in het budget. Een optie met een leeg slot valt
   af en telt niet mee voor S1, dus ik moet er meer dan acht proberen om er acht te
   landen. Begroot 10 tot 12 pogingen, anders faalt S8 om een rekenkundige reden in
   plaats van een echte. Verwerk dat in S1 of S8, jouw keuze — maar zichtbaar.

3) S7 heeft geen drempel. §2 zegt dat criteria vooraf vaststaan, maar S7 is in §7
   een telling en in §8 een ja/nee. Zet het getal nu — zie correctie 4 hieronder,
   want mijn besluit over aanbiederloze dienst-kaarten verandert waar S7 over gaat.

═══════════════════════════════════════════════════════════════════
CORRECTIE 4 — generieke dienst-kaarten slopen twee van de vier assen
═══════════════════════════════════════════════════════════════════

Mijn besluit: dienst-kaarten noemen voorlopig geen aanbieder. Reden: as 1 en as 2
vereisen actuele, geverifieerde feiten over bestaande bedrijven, en die invullen
zonder bron is fabricatie — zeker als het als ONS oordeel gepubliceerd wordt.

Maar §5 geeft dienst deze vier assen:
  1) wie de begeleiding feitelijk doet, en met welke kwalificatie
  2) opzegtermijn en contractvorm
  3) wat er ná de looptijd overblijft
  4) wat je zelf moet blijven doen

Zonder aanbieder verliezen as 1 en as 2 hun object. En daarmee verliest de dienst
precies de drie kenmerken — aanbieder, contract, commissie — waarop jij sociaal als
mogelijk vierde type voorstelde. Dat moet je nu beslissen, niet omzeilen.

Beantwoord in §5′:
- Vallen dienst en sociaal samen zodra de aanbieder wegvalt, of blijft het
  onderscheid staan? Als het blijft staan: op welk kenmerk precies.
- Wat wordt as 1 en as 2 voor een aanbiederloze dienst-kaart? Mijn voorstel om te
  toetsen: de kaart benoemt per as welk controleerbaar document de lezer zélf moet
  opvragen (algemene voorwaarden, offerte, kwalificatieregister) en waar hij het
  vindt. Het oordeel gaat dan over het diensttype plus de vragen die je moet stellen,
  niet over een bedrijf.
- Herzie S7 daarop. Voorstel: nul dienst-kaarten waarvan as 1 of as 2 alleen een
  oordeel is zonder aanwijsbaar document dat de lezer kan opvragen. Geef een getal
  of verwerp het voorstel met reden — geen telling zonder drempel.
- Draagt S3 (≥ 2 optietypes) en S4 (≥ 3 opties waar wij niets aan verdienen) dit
  nog? Bij aanbiederloze diensten is er nooit commissie, dus S4 wordt triviaal
  gehaald door elke niet-product-kaart. Zeg of S4 daarmee betekenisloos wordt en
  wat ervoor in de plaats komt.

═══════════════════════════════════════════════════════════════════
CORRECTIE 5 — "verdict" betekent in deze repo al iets anders
═══════════════════════════════════════════════════════════════════

Het invulformat in §6 heeft een veld verdict: sterk | zwak | niet. Maar
src/types/verdict.ts:6 definieert al VerdictValue = "kopen" | "niet_nodig" |
"eerst_leefstijl" | "nooit", opgeslagen per account en per ingredient_key, met een
reproduceerbaarheids-snapshot VerdictEvidence (scores, signals, profileLabel) en
rules_version + next_review_at in de store (supplement-verdict-store.ts:13-14).

Dat zijn twee verschillende dingen met één woord:
  - het bestaande verdict is persoonlijk — wat wij van dit ingrediënt vinden voor
    DIT account, nu
  - het bond-oordeel is redactioneel — wat wij van deze optie vinden, voor iedereen,
    tot de herziening

Beslis de naamgeving nu, vóór ik 32 blokken invul met een veld dat later moet
worden hernoemd. Zeg ook wat dat betekent voor de vraag uit A′–H′ of dit één store
wordt of twee naast elkaar: een account-gescopeerd oordeel en een
account-onafhankelijk oordeel kunnen niet in dezelfde rij wonen.

═══════════════════════════════════════════════════════════════════
WAT ER NOG NIET STAAT — en waar het me om gaat
═══════════════════════════════════════════════════════════════════

De proef beslist of ÉÉN schap eerlijk gevuld kan worden. Wat nergens vastligt is
welk deel daarvan één keer gebouwd wordt en welk deel per domein alleen een
datavulling is. Zonder dat contract krijgt slaap opnieuw een prebuild, stress
opnieuw een surfacediscussie en verbinding opnieuw een raamwerkgesprek — en dan is
deze proef een eenmalige oefening in plaats van een startpunt.

Ik wil dit één keer bouwen en daarna per domein alleen nog inhoud toevoegen.

──────────────────────────────────────────────
§10 (NIEUW) — Herbruikbaarheidscontract
──────────────────────────────────────────────

Lever een tabel. Kolommen:
  Onderdeel | Eén keer gebouwd (gedeeld component/lib) | Per domein (data) |
  Wie levert de data | Wat er breekt als dit tóch per domein gebouwd wordt

Rijen minimaal: schap-surface (de lees-staat) · oordeelkaart met de vier sloten ·
assenraamwerk per optietype · bond-oordeel en chip-copy · fit-lens Voor jou / Bij
jou · disclosure- en commissieregel · permanente ingang naar het schap · Favorieten ·
koppeling naar Mijn Dag · hertest 14/30d · meetpad.

Beantwoord daarna hard:
- Wat moet in slice 1 al generiek zijn om herbouw bij domein 2 te voorkomen, en wat
  mag bewust beweging-specifiek blijven? Ik wil geen voortijdige abstractie, maar
  ook geen herschrijving bij het tweede domein.
- Bestaande haakjes die dit kunnen dragen: src/lib/kompas-domain-actions.ts,
  src/lib/context-rail.ts, src/lib/domain-role.ts (interventie vs readout),
  src/data/domain-product-stance.ts (stance per domein, inclusief
  lifestyle_first als expliciet oordeel), en de componenten in
  src/components/dashboard/kompas/. Zeg per haakje of hij het draagt, uitgebreid
  moet worden, of niet past.
- Waar zit het punt waarop het gedeelde deel een keurslijf wordt in plaats van een
  besparing? Noem het concreet: welk domein, welk onderdeel.

──────────────────────────────────────────────
§11 (NIEUW) — Prebuild-generalisatie
──────────────────────────────────────────────

De v3-prebuild heeft vijf schermen: #s-a eerste keer (r660), #s-e elke dag daarna
(r704), #s-b maak een keuze (r760), #s-c gekozen (r1089), #s-d Mijn Dag (r1198).

Zeg per scherm of het domein-onafhankelijk is, en wat er per domein wél verandert.
Drie categorieën, geen vierde:
  A. Ongewijzigd bruikbaar voor slaap/stress/voeding/verbinding — alleen andere data
  B. Zelfde structuur, andere copy — noem welke strings per domein moeten
  C. Echt een nieuwe prebuild nodig — noem het domein en zeg waarom precies

Doel: nul nieuwe prebuilds voor domein 2 tot en met 5. Als categorie C onvermijdelijk
is voor een domein, wil ik dat nu weten en niet als het aan de beurt is.

Beantwoord daarbij:
- De fit-lens Voor jou / Bij jou (r783-784) is beweging-specifiek ingevuld met
  locatie. Wat is "Bij jou" bij slaap of stress, en als het antwoord "niets" is:
  vervalt de lens dan per domein, of vervalt hij helemaal tot pd_partners gevuld is?
- Verbinding heeft geen eigen check (kompas-domain-actions.ts:109-110). Kan #s-a
  ("eerste keer", direct na de check) daar überhaupt bestaan, of begint verbinding
  noodgedwongen bij #s-b? Als dat laatste: is dat een uitzondering of bewijst het
  dat #s-b het hart is?
- Wat is het minimum aan data per domein om het schap te openen? De ondergrens van
  8 stond er al; zeg of die overeind blijft nu diensten aanbiederloos zijn.

═══════════════════════════════════════════════════════════════════
WAT IK VAN JE WIL — output
═══════════════════════════════════════════════════════════════════

§3′   Slaagcriteria herzien. S5 met consequentie-clausule, S6/S1 met de
      10-tot-12-begroting, S7 met een drempel. Markeer ongewijzigde criteria als
      ongewijzigd, herhaal ze niet.
§4′   Monetisatie-regel herzien: is_monetised naast zou_monetiseren, creatine en
      eiwitpoeder verplicht, en wat er overblijft van "oordeel eerst, commissie
      volgt".
§5′   Assen per optietype onder aanbiederloze dienst-kaarten. Beslis of dienst en
      sociaal samenvallen. Nieuwe slotnamen doorgevoerd.
§6′   Invulformat aangepast: nieuwe sloten, is_monetised erbij, veldnaam voor het
      bond-oordeel besloten. Werk de bestaande voorbeeld-optie bij zodat de lat
      klopt — dat is de enige kaart die jij schrijft.
§10   Herbruikbaarheidscontract (nieuw, tabel).
§11   Prebuild-generalisatie (nieuw, per scherm A/B/C).

Sluit af met één alinea: wat is het grootste risico dat ik met dit hele plan neem,
gegeven dat ik de acht oordelen alleen schrijf.

Constraints ongewijzigd: geen code, geen SQL-DDL, geen JSX, geen HTML-prebuild.
Geen samengevoegd fit×bond-cijfer. Geen medische claims of diagnose-taal. Geen
aanbiedersnamen. Geen ingevulde kaarten behalve de voorbeeld-optie in §6′.

Acceptatiecriterium:
- [ ] §4′ noemt is_monetised en zou_monetiseren als twee velden met verschillende
      betekenis, en zet creatine en eiwitpoeder verplicht op het schap
- [ ] §3′ S5 raakt de bestaande surface, niet alleen het nieuwe schap
- [ ] §3′ S7 is een toetsbare drempel met een getal, geen telling
- [ ] §5′ beslist expliciet of dienst zonder aanbieder een eigen type blijft
- [ ] Correctie 5 beantwoord: de naam van het bond-oordeel staat vast, en één store
      of twee is besloten
- [ ] §10 is een tabel met een kolom "één keer gebouwd" en een kolom "per domein"
- [ ] §11 deelt alle vijf prebuild-schermen in A, B of C
- [ ] Elk bestandspad, regelnummer en tabelnaam dat je noemt bestaat echt
- [ ] Geen enkele regel code
```

---

## Na dit wederwoord

Als §3′–§11 landt zonder nieuwe openingen, is de proef klaar om ingevuld te worden. Volgorde daarna:

1. Dennis vult de acht blokken in `[PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md](../design/PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md)` §6, met tijdregistratie per optie (zoeken en oordelen apart geteld)
2. Uitkomst tegen §8 leggen — de beslisregel is al vastgelegd en wordt niet herzien
3. Pas bij "alle acht gehaald": schema afleiden uit de ingevulde blokken, daarna de permanente ingang, daarna slice 1
4. §10 en §11 zijn vanaf dat moment het contract waar domein 2 tot en met 5 op landen

**Loopt parallel, zonder attributiekosten:** F1a-deploy met PostHog-annotatie en de registeruitbreiding van §18 voor de ervaringsvraag. Beide raken geen surface en delen geen meetvenster met deze proef.

**Meetpunt van dit document:** geen — besluitstuk, geen codewijziging. Het meetplan hoort bij de slices die uit de proef volgen.