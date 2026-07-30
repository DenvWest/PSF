# Voortgang-prebuild — notitie (juli 2026)

> **Opvolger.** Statistieken is herbouwd als [`voortgang-statistieken-prebuild-v2.html`](voortgang-statistieken-prebuild-v2.html):
> één object, drie facetten, drie niveaus (Jij → Voeding → Magnesium), met een kruimelpad in
> plaats van het spoor en een accordeon in plaats van vier treden naast elkaar. De inhoud van
> "Het nutriëntspoor", "Twee klokken" en "Meetbron-ladder" hieronder blijft geldig — alleen de
> vorm is gewijzigd. Wat er uit de UI verdween en wat er moet bestaan voordat het terug mag,
> staat per item in [`voortgang-plan-later.md`](voortgang-plan-later.md); daar staat ook de
> 375px- en sticky-meting van v2 (89px van de 96px). Deze prebuild blijft ongewijzigd als
> referentie staan.
>
> **Voorkeur (30 jul 2026).** Dennis is over déze prebuild — de conversiekaart — tevredener dan
> over de niveau-herbouw van Statistieken in v2. Zie de toelichting bovenaan
> [`voortgang-plan-later.md`](voortgang-plan-later.md).

> Bij [`voortgang-conversiekaart-prebuild-2026-07.html`](voortgang-conversiekaart-prebuild-2026-07.html) (geland `a7bc778`). Statisch geverifieerd op 375px en ≥1280px + 4 kleine fixes (zie onderaan). Geen React aangeraakt.
>
> **Let op:** die 375px-verificatie is met een onbetrouwbare methode gedaan — zie "Correctie op de meetmethode" onder het nutriëntspoor-blok. Het spoorblok is opnieuw en wél op echte 375px gemeten; de oudere onderdelen zijn dat niet.

## Wat de prebuild bewijst

**Compositie — Signaal → Routekaart → Actie.** De hero splitst in een linkerkolom (eyebrow + H1 + lede: het signaal) en een rechterkolom die de routekaart (cyclusliniaal + 5 stages + focuschip) direct koppelt aan de actie eronder (leefstijlstap-kaart + primaire CTA + tekstlink). Op mobiel stapelt dit één kolom, vanaf 1080px staan signaal en instrument naast elkaar.

**Stage-model.** Vijf stages — Test → Check → Advies → Favorieten → Beste — als één horizontale rail met een doorlopende lijn. De laatste 28% van die lijn is zichtbaar anders (paars gestippeld) om stage 5 als ghost te markeren vóór je er ook maar op klikt. Elke stage is een eigen knop die naar het bijbehorende paneel springt en de stage-beschrijving onder de rail vervangt — dat maakt de rail zelf een navigatiemiddel, niet alleen een statusbalk.

**Rail-inventaris.** Twee groepen, elk met een vaste 4 items: "Bekijken" (Overzicht, Statistieken, Jouw inzichten, Favorieten) is wat vandaag al bestaat; "Nog in aanbouw" (Lichaamssamenstelling, Wearable, Begeleiding, Wat je gebruikt) toont vooruitblik-items met een badge en een expliciete "je klik telt als stem, geen datum"-notitie. Dezelfde 8 items voeden zowel de desktop-rail als de mobiele sheet.

**Mobiele vorm.** Onder 900px vervalt de rail volledig voor een sticky disclosure-nav ("Bekijken · Overzicht ▾") die een sheet met backdrop opent — geen aparte onderaan-de-scroll mirror meer. De sheet hergebruikt dezelfde navlist-items als de rail, alleen met zichtbare subtekst per item.

**Meetlat-samenvoeging.** Vijf domeinrijen zijn samengevoegd in één tegel in plaats van vijf losse kaarten: één doel-kop (ijkpunt of "nog geen ijkpunt"-uitnodiging), één gedeelde focusschaal die herschildert op rij-klik, en de rijen zelf met sparkline + delta + meta + ijkpunt-chip. Dat dwingt één interactiepatroon af (klik een rij, lees de schaal) in plaats van vijf keer dezelfde structuur.

**Ghost-plaatsing.** De ghost (stage 5 "Beste" én het rail-item "Wat je gebruikt") is met opzet zichtbaar, klikbaar en eerlijk: paarse stippellijn, `gh`-badge, een paneel dat expliciet zegt wat het niet is (geen koop-CTA, geen bestelgegevens, geen abonnement). De ghost wordt nergens verborgen — hij wordt gebruikt om richting te tonen zonder een belofte te doen.

**Meetpunt-inventaris.** Elke interactie in de prebuild vuurt een eventnaam naar de pb-ev-strip én de console, zodat de events zelf ook visueel geverifieerd zijn vóór implementatie:

| Event | Payload | Trigger |
|---|---|---|
| `dashboard_voortgang_hub_click` | `{destination, surface}` | stage-knop (`hero_routekaart_<id>`), nav-item (`rail`/`mobiel_sheet`), hero-CTA's (`hero_primair`/`hero_secundair`/`hero_stap`), koppelstrip- en meetlat-links |
| `dashboard_voortgang_terug` | `{from}` | elke `←`-knop op een subpaneel |
| `dashboard_voortgang_doel_click` | `{domain, entry:"set"\|"rescore"}` | goalcta-knop in de meetlat |
| `dashboard_voortgang_band_scrub` | `{zone, day}` | pointerdown op de cyclusliniaal |
| `dashboard_voortgang_domein_click` | `{domain}` | klik op een meetlat-rij |
| `dashboard_voortgang_bewijs_state` | `{state, cycle_day, active_days}` | bij elke render — paneel-load én demo-stateswitch |
| `dashboard_statistieken_blik_switch` | `{to}` | blik-tabs op Statistieken (stand/advies/tijd) |
| `dashboard_agenda_voortgang_link_click` | `{surface}` | "Zie wat dit optelt →" op de Mijn Dag-stub |
| `agenda.block_toggled` | `{surface:"agenda"}` | "Markeer als gedaan" (stub) |
| `premium.waitlist_joined` | `{surface:"statistieken"\|"begeleiding"}` | beide wachtlijst-knoppen |
| `wearable.interest_clicked` | `{surface, feature}` | "Ik wil dit"-knop |

## Verificatie 375px / ≥1280px — wat is gefixt

Structuur (HTML-tags, CSS-braces, JS-syntax) klopt; geen orphaned `data-bind`/`data-ev`/`data-goto`. Vier concrete fixes toegepast in de HTML zelf:

1. **`.backbtn`** (terug-knop op elk subpaneel) was 38×38px — opgehoogd naar 44×44px.
2. **`.bliknav button`** (Stand/Advies/Over tijd op Statistieken) had `min-height:40px` — opgehoogd naar 44px.
3. **Stage-label "Favorieten"** op 375px valt in een kolom van ~63px; bij DM Sans 10.5px lag de tekstbreedte net op de grens van wrappen. `hyphens:auto` toegevoegd (breekt op een lettergreep i.p.v. `overflow-wrap:anywhere` overal-breken) plus een `max-width:399px`-regel die het label naar 9.5px verkleint zodat het woord op de smalste telefoons op één regel past.
4. **`--stickyh`** wordt bij load gemeten en bij `resize` herrekend, maar DM Sans laadt async (`font-display:swap`). Een font-swap ná de eerste meting kan `.stickytop` een paar px laten verspringen zonder dat er een resize-event vuurt. `document.fonts.ready.then(syncStickyHeight)` toegevoegd als extra herrekenmoment.

Geen overlap gevonden in de scale-legend (de `max-width:439px`-kolomlayout was al aanwezig) en de meetlat in de `wachtend`-state rendert correct zonder start-dot en zonder ijkpunt-tekst (`hasStart` is `false` zolang `row.start` `null` is).

## Voedingsbasis + Mijn Dag-koppeling (toegevoegd juli 2026)

### De grens die het ontwerp bepaalt

Gevraagd was: "op deze dag is te kort gezien, welke supplementen passen daarbij". Dat kan niet waar zijn en is niet gebouwd. `estimateNutritionIntake` leest een **gewone week** (`proteinMealsPerDay`, `oilyFishPerWeek`) — een gewoonte-instrument. Dagvariatie binnen dezelfde persoon is voor de meeste micronutriënten 30–60%; ADH/RI zijn gedefinieerd als gemiddelde inname over dagen tot weken. Eén dag onder de norm is betekenisloos, ook mét een volledig voedingsdagboek. En "vandaag tekort → dit potje" is structureel de dagelijkse suppletie-prompt waar `nutrition-advice.ts:4` ("Eerst de basis, dan de pil — in die volgorde, altijd") tegen ingaat.

**Wat wél waar is en hetzelfde oplevert:** je gekozen actie stond X van de laatste 14 dagen aan, en zolang dat patroon zo blijft, blijft de schatting staan waar hij staat. Dat is een telling van eigen gedrag naast een onveranderde schatting — geen causale claim, wel een directe lever. De supplement-conclusie blijft op cyclusniveau in Advies/Favorieten, achter de bestaande 4-staps gate.

### Wat er in de prebuild staat

- **Statistieken → Advies** is van placeholder naar het echte 3-stappenblok gegaan. Stap 1 toont alle 5 nutriënten met band-chip (onder/rond/haalt), referentieregel, en per gap: de gekoppelde Mijn Dag-actie met een **14-dagenstrip** (het patroon, nooit welke kalenderdag — de dag zelf zegt niets), of expliciet "hier hangt nog geen moment aan". Omega-3 staat bewust zónder gekoppelde actie om die tweede staat te tonen.
- **Zekerheid per nutriënt** als 4 dots + reden. De waarden komen rechtstreeks uit de code-comments in `intake-reference.ts` (eiwit HOOG, omega-3 REDELIJK, zink MATIG, magnesium en vitamine D LAAG).
- **"Wat we niet van je weten"** — lengte, werkelijke porties, bloedwaarden, medicatie. Expliciet als lijst.
- **Hero-meetlat** krijgt één conditionele regel, alleen als voeding het focusdomein is, zonder aantallen-scorebord en zonder supplement. Doorverwijzing naar Statistieken → Advies via inline link.
- **5e demo-state `voedingsgat`** (focus voeding, dag 16, magnesium+omega-3 onder de vuistregel) om de hele keten in één klik te zien.

### Favorieten als eindpunt van de keten

De keten loopt nu helemaal door: gap in de check → actie op Mijn Dag → dagenstrip → gegate supplement → oordeel in Favorieten. Dat laatste scherm is van twee generieke tegels naar het echte oordeelmodel gegaan, gespiegeld op `src/types/verdict.ts` en `supplement-verdict-copy.ts`:

- **Alle vier de `VerdictValue`s** met hun eigen toon: `kopen` (Aanvullen, sage), `niet_nodig` (Niet nodig, grijs), `eerst_leefstijl` (Eerst leefstijl, terra), `nooit` (Raden we niet aan, grijs).
- **Alleen `kopen` krijgt een uitgang.** De andere drie zijn eindpunten zonder CTA. Dat is de discipline die het scherm geloofwaardig maakt.
- **Het spoor terug** per oordeel: uit welke gap dit komt en of er een actie loopt ("je actie 'Een handvol noten bij de lunch' staat 9 van de laatste 14 dagen aan"). Dit is de Mijn Dag-koppeling op de plek waar hij een beslissing beïnvloedt.
- **De samenvatting bovenaan** is de positionering in één zin: "Van de 5 die we bekeken voegt er 1 iets toe. Bij 4 is ons antwoord: niet kopen. Wij verdienen daar niets aan — dat is precies het punt."
- **Zonder voedingscheck** vallen alle vijf terug op `eerst_leefstijl` met de gate-reden, niet op "niet nodig". Dat spiegelt `resolveAdviesState()`: geen check betekent geen oordeel, niet een negatief oordeel.

### Besluit: koppeling actie ↔ nutriënt wordt afgeleid, niet opgeslagen

`daily_action_log` heeft al `domain` + `action_key` ([migratie](../../supabase/migrations/20260627130000_daily_action_log.sql)) — de sleutel bestaat, er is **geen migratie nodig**. Een registry `action_key → nutrient` naast `portion-dictionary.ts` volstaat.

Waarom afleiden en niet een `nutrient`-kolom:

1. Het nutriënt is een eigenschap van de **actie-definitie**, niet van elke dagregel. Per rij opslaan denormaliseert en gaat driften zodra een actie van betekenis verandert.
2. De semantiek bestaat al impliciet — `nutrition-curated.ts` heeft `vette-vis`, `noten`, `peulvruchten`, `kwark-skyr` als ids, die één-op-één op nutriënten mappen.
3. Omkeerbaar: een kolom later toevoegen kan altijd; een verkeerd gevulde kolom terugdraaien niet.

Acties zonder nutriënt (beweging, slaap, zelf aangemaakt) horen géén nutriënt te hebben — die vallen simpelweg buiten de registry en tonen "hier hangt nog geen actie aan".

### De architectuur die dit voorstelt

De les uit dit blok voor de echte engine: `estimateNutritionIntake` fuseert nu drie dingen die apart horen te staan — welk signaal bij welk nutriënt hoort, de drempel, en de band. De uitbreidbare vorm is:

1. **Behoefte** — vast RI voor 4, gepersonaliseerd voor eiwit. Het patroon bestaat al (`nutrient-personalization.ts`), het is alleen dun.
2. **Signaal** — wat is waargenomen, mét herkomst. Nu 7 frequentievragen; later meer vragen, een log, een wearable.
3. **Adequaatheid** — de vergelijking, met een expliciete `confidence` en een `missing[]`.

De goedkoopste hoogwaardige stap is punt 3: **promoveer de zekerheids-annotaties van code-comment naar getypeerd veld.** Dat onderzoek is al gedaan (het staat per nutriënt in `intake-reference.ts`), het kost bijna niets, het maakt de UI eerlijk, en het is precies de haak waar elke latere nutriënt of personalizer in klikt. Voegt hij later bloedwaarden of FFM toe, dan stijgt de confidence voor dat nutriënt en krimpt de missing-lijst — de UI verbetert mee zonder herschrijving.

### Nieuwe meetpunten uit dit blok

| Event | Payload | Trigger |
|---|---|---|
| `dashboard_voedingscheck_cta_click` | `{surface:"advies"}` | CTA in de pending-staat van Stap 1 |
| `dashboard_voortgang_hub_click` | `{destination:"favorieten", surface:"advies_<nutrient>"}` | de gegate supplement-kaart per nutriënt |
| `dashboard_voortgang_hub_click` | `{destination:"statistieken", surface:"meetlat_voeding"}` | inline link in de hero-regel |
| `dashboard_ladder_step_click` | `{step:"supplement", nutrient}` | "Vergelijk … →" op een `kopen`-oordeel in Favorieten |

## Het nutriëntspoor — Stand · Advies · Over tijd laten samenwerken (toegevoegd juli 2026)

### De diagnose: drie blikken op vijf domeinen, in plaats van drie blikken op één stof

Stand, Advies en Over tijd waren drie losse panelen die niets van elkaar wisten. Je kon lezen dát magnesium onder de vuistregel stond (Stand), lezen wat een gap betekent (Advies) en een cyclusband scrubben (Over tijd) — maar nergens liep dezelfde stof door de drie blikken heen. Dat is de reden dat het niet samenwerkte: de blikken deelden geen subject.

**De ingreep is één gedeelde selectie.** Boven de blik-tabs staat nu een *spoor*: zes pillen (Alle vijf + de vijf stoffen), elk met een bandkleur-stip. Kies je magnesium, dan blijft die keuze staan als je van blik wisselt — spoor en blik zijn samen één sticky blok, want het spoor is de stof en de blik is de vraag die je erover stelt. De drie blikken worden daarmee drie vragen over hetzelfde:

| Blik | De vraag | Wat er nu staat |
|---|---|---|
| **Stand** | Waar komt dit getal uit? | band + vuistregel + RI + de meetbron-ladder |
| **Advies** | Wat kan ik eraan doen? | de vier treden, met voedingsbronnen op trede 1 |
| **Over tijd** | Beweegt het? | twee klokken: gedrag per week naast de checkpunten |

Zonder voedingscheck zijn de pillen `disabled` met een expliciete regel erbij — geen check betekent geen stof om te volgen. Het spoor zit ook in de eventpayload: `dashboard_statistieken_blik_switch` vuurt nu `{to, nutrient}`, zodat in de meting terug te lezen is dat de blikken één subject delen.

### De sterkste les zit in Over tijd: twee klokken, verschillend tempo

Het paneel toont voor de gekozen stof twee dingen boven elkaar, en dat is bewust:

- **Je gedrag** — dagen per week uit Mijn Dag, vier weekbalken. Loopt continu.
- **Je stand** — de checkpunten op een rail. Verspringt alleen bij een check.

In de `beantwoord`-state staan er twee checks met **dezelfde band**, terwijl het gedrag 12 van de laatste 14 dagen aanstond. De copy noemt dat expliciet een echte uitkomst en geen fout: de vraag achter die band meet hoe vaak je zo'n bron in een gewone week eet, en twee weken noten verandert dat gemiddelde maar beperkt. Dat is precies het misverstand dat een dashboard normaal produceert ("ik doe alles goed en er beweegt niets") en hier vóóraf wordt weggenomen.

De rail eindigt op een ghost-punt "Bloedwaarde · bestaat hier niet". Het lijnsegment naar dat punt is paars in plaats van wit (`--ghostat` wordt in JS gezet omdat het aantal checkpunten per state verschilt), zodat een bloedwaarde niet stilzwijgend op dezelfde tijdlijn lijkt te staan.

### Meetbron-ladder: "later bloedonderzoek" is geen algemeen antwoord

Op Stand staat per stof een ladder van drie meetbronnen, en de derde is de interessante: **of een bloedwaarde deze stand écht harder maakt, verschilt per stof.** Dat is nieuw onderzoek in dit blok, per nutriënt vastgelegd in het `bloed`-veld:

| Stof | Bloedwaarde | Waarom |
|---|---|---|
| Vitamine D | **wél beter** | 25(OH)D is de standaardbepaling en zegt echt iets over je voorraad — de enige van de vijf waar een prik een concrete verbetering is |
| Magnesium | beperkt | serum-magnesium wordt constant gehouden ten koste van bot en spier; normale uitslag bij een krappe voorraad is gewoon |
| Omega-3 | beperkt | de omega-3-index is een goede maat maar geen standaardbepaling bij een NL huisartsenlab |
| Zink | geen route | plasma-zink daalt bij elke ontsteking en na een maaltijd, los van je voorraad |
| Eiwit | geen route | er bestaat geen bloedmarker voor inname |

Trede 2 van die ladder — een paar dagen porties bijhouden in plaats van frequenties — is voor **alle vijf** de goedkoopste stap omhoog. Dat is de eerlijke conclusie: het antwoord op "hoe wordt dit harder" is meestal niet bloed, maar beter bijhouden. Alleen bij vitamine D krijgt de trede een interesse-knop ("Ik heb een recente uitslag"), die als stem telt en verder niets doet.

### Vier treden: leefstijl eerst, supplement erbij

Advies is van drie losse tegels naar één ladder gegaan met een expliciete staat per trede:

1. **Uit voeding** — `nu`. De bronnen, de actie op Mijn Dag, de dagenstrip, de zekerheid.
2. **Meet opnieuw** — `over N dagen`. Met de regel erbij dat dit géén slot voor trede 3 is: het is hoe je merkt of trede 1 gewerkt heeft. Linkt naar Over tijd en naar Hermeting.
3. **Supplement erbij** — `open` of `dicht`, afgeleid uit het bestaande verdict. Bij `kopen` staat de EFSA-claim erbij met de bron-disclaimer; bij `eerst_leefstijl` / `niet_nodig` staat er de reden en geen uitgang. Dit blijft de enige plek in Voortgang met aanbod.
4. **Waar je het haalt** — `ghost`. Biologische en lokale bronnen in de omgeving, met wat dat kost aan grondslag: een nieuw verwerkingsdoel, aparte toestemming, register-uitbreiding, privacytekst. Geen partners, geen prijzen, geen voorraad. Klik telt als stem.

Dezelfde vier treden staan als compacte strip in de koppelstrip op de hub ("In welke orde — leefstijl eerst"), zodat de orde leesbaar is zonder Statistieken te openen. Bewust in de lichte band en niet in de hero: de hero houdt signaal → routekaart → actie.

### Voedingsbronnen: portie + mg, nooit opgeteld

Per stof staat een lijst bronnen met portie, orde-van-grootte per portie en een balkje genormaliseerd op de sterkste bron in de lijst. Zes zichtbaar, de rest achter "Toon N bronnen meer". De harde regel staat eronder: **deze getallen tellen niet op tot een dagtotaal** — je band komt uit frequentievragen, niet uit grammen. Ze staan er om te kunnen *kiezen*; de factor tussen de sterkste en de zwakste bron wordt berekend, niet beweerd.

Bronnen die aan een Mijn Dag-actie te koppelen zijn, zijn aantikbaar. Dan gebeurt precies dit, en dat staat er ook zo:

- **Wat dit verandert** — er komt een moment bij, de dagenstrip begint te vullen. Een telling van je gedrag.
- **Wat dit niet verandert** — je band blijft staan tot je volgende check. Eén portie is geen nieuwe stand; daar is trede 2 voor.

Een net gekozen bron staat op "vanaf vandaag", niet op de teller van de bestaande actie — anders zou een klik gedrag suggereren dat er niet was.

**Correctie op de vorige ronde.** De prebuild schreef bij magnesium "de vraag is magnesium-specifiek, maar volkoren telt nog niet mee". Dat is het omgekeerde van wat [`intake-reference.ts:106`](../../src/data/nutrition/intake-reference.ts#L106) documenteert: de vraag is een **proxy** op porties groente/fruit, fruit is juist een zwakke magnesiumbron, en de comment adviseert de *vraag* te herzien in plaats van de grenswaarden. Rechtgezet, en de spanning staat nu als terra-caveat boven de bronnenlijst: *je band komt uit een groente-en-fruit-telling, maar fruit levert per portie het minst van deze lijst — meer fruit eten beweegt je band eerder dan je magnesium.* Vitamine D krijgt een eigen caveat: zonlicht is de enige route die telt, en dit is de stof waar voeding het gat niet dicht krijgt.

### Mijn Dag koppelt nu twee kanten op

De Mijn Dag-stub heeft een tweede tegel: "Je momenten met een stof erachter". Elk gekoppeld moment toont de stof, de dagenteller en de gap waar het uit komt, plus een terugknop "waarom dit er staat →" die naar Statistieken → Advies springt **met dat spoor al gezet**. Dat is de lus dicht: gap → bron kiezen → moment → dagenstrip → terug naar de gap.

De registry uit de vorige ronde is nu ook echt in gebruik in de prebuild. Zelf gekozen bronnen krijgen de sleutel `voeding:<nutrient>:<slug>`, zodat het nutriënt **uit de sleutel zelf** af te leiden blijft en er nog steeds geen kolom en geen migratie nodig is.

### Nieuwe meetpunten uit dit blok

| Event | Payload | Trigger |
|---|---|---|
| `dashboard_statistieken_spoor_select` | `{nutrient, blik}` | spoor-pil op Statistieken (`"alle"` voor Alle vijf) |
| `dashboard_statistieken_blik_switch` | `{to, nutrient}` | **uitgebreid** — `nutrient` erbij zodat de gedeelde selectie meetbaar is |
| `dashboard_voeding_actie_toegevoegd` | `{nutrient, bron, action_key, surface}` | een koppelbare bron aantikken |
| `dashboard_voeding_actie_verwijderd` | `{nutrient, action_key, surface}` | dezelfde bron opnieuw aantikken |
| `dashboard_voeding_bron_click` | `{nutrient, bron, koppelbaar:false}` | een bron zonder Mijn Dag-actie (haring, pure chocolade) |
| `dashboard_voeding_bronnen_uitklap` | `{nutrient, open}` | "Toon N bronnen meer" |
| `dashboard_meetbron_interest_clicked` | `{nutrient, bron:"bloed"}` | "Ik heb een recente uitslag" — alleen bij vitamine D |
| `dashboard_omgeving_interest_clicked` | `{nutrient, surface:"advies_trede4"}` | stem op de omgeving-ghost |
| `dashboard_voortgang_hub_click` | `{destination:"statistieken", surface:"trap_<1-4>"}` | de laddertrap in de koppelstrip |
| `dashboard_voortgang_hub_click` | `{destination:"statistieken", surface:"agenda_moment"}` | "waarom dit er staat →" op een Mijn Dag-moment |

### Sticky-hoogte: het spoor pint alleen op desktop

Spoor en blik naast elkaar pinnen kostte op mobiel 204px van een 667px-scherm — bijna een derde. Daarom pint onder 900px **alleen de blik** (98px header + 58px bliknav = 156px, gelijk aan vóór dit blok) en scrollt het spoor mee. Wélke stof je volgt raak je niet kwijt: dat staat in de hint eronder én in elke paneelkop ("Stand van één stof · Magnesium", "Magnesium: onder de vuistregel", "Magnesium over tijd"). Vanaf 900px pinnen ze beide, met de blik op `calc(var(--stickyh) + var(--spoorh))`.

Let op de constructie: spoor en blik zijn **siblings zonder wrapper**. Een `position:sticky`-kind kan niet buiten zijn ouder blijven staan, dus een korte wrapper om beide had de blik meegesleurd zodra je voorbij die wrapper scrollde. `--spoorh` wordt in `syncStickyHeight()` gemeten in plaats van gehardcodeerd, omdat de pilhoogte aan het font hangt — en `showPanel()` roept die functie aan bij het openen van Statistieken, want in een `hidden` paneel is er niets te meten.

### Verificatie

Statisch: tags gebalanceerd, 383/383 CSS-braces, geen orphaned `data-bind`/`data-goto`/`data-blikto`, elk `#id` in het script bestaat in de HTML. Dynamisch met jsdom: alle 5 states × 6 spoorkeuzes × 3 blikken doorlopen, plus bron aan/uit, uitklappen, beide interesse-knoppen, de terugkoppeling vanuit Mijn Dag en de trap — **geen enkele runtime-fout**, en de juiste panelen zichtbaar per combinatie (in `wachtend` blijft alles dicht en staat alleen de voedingscheck-CTA).

**Correctie op de meetmethode.** `chrome --headless=new --window-size=375,…` rendert niet op 375px: Chrome dwingt een minimumbreedte van ~500 CSS-px af en schaalt de screenshot dán naar 375. Elke "geverifieerd op 375px" die zo tot stand kwam — inclusief de claim bovenaan deze notitie — is in werkelijkheid een 500px-render. Deze ronde is gemeten door de pagina in een `<iframe width="375">` te zetten; dan is `window.innerWidth` echt 375. Uitkomst: `scrollWidth === 375`, geen enkel element breder dan de viewport behalve de domeintabel (440px, en die zit in `.tablewrap` met `overflow-x:auto` — bestaand en bedoeld). Alle nieuwe tikdoelen op 44px: `.npill`, `.trapstep`, `.food` (52px), `.morebtn`.

## Wat expliciet Cursor-implementatiewerk blijft

- **`ContextRailMode` uitbreiden met `"voortgang"`.** Nu een gesloten union `"profile" | "kompasHome" | "domainTools"` in [`src/lib/context-rail.ts:13`](../../src/lib/context-rail.ts#L13). De rail-inventaris hierboven (Bekijken + Nog in aanbouw) heeft geen eigen mode — die moet er komen vóór de rail in productie hetzelfde 8-items-patroon kan tonen.
- **`desiredRailMode`-fallback in [`src/components/dashboard/Dashboard.tsx:4091`](../../src/components/dashboard/Dashboard.tsx#L4091).** Valt nu op elk niet-`"vandaag"`-tabblad terug op `"profile"` — dat moet naar `"voortgang"` op het Voortgang-tabblad zodra die mode bestaat.
- **`VoortgangBewijsband` verplaatsen** naar `StatistiekenBlikPanels` → `overTijd`. In de prebuild staat de volledige bewijsband (met scrub-liniaal) al in het Statistieken/Over-tijd-paneel (`#lin2`) in plaats van in de hero — de hero houdt alleen de leesbare cyclusliniaal.
- **Surface-waarde `"verder_kijken"` → `"rail"`/`"mobiel_sheet"`** in `dashboard_voortgang_hub_click`. De prebuild vuurt al de nieuwe waarden (zie `navButton()` in het script) — dit breekt de bestaande eventreeks in productie, dus zet een GA4-annotatie op het moment van implementeren.

Voor het voedingsblok komt daar bij:

- **`NutrientReference` uitbreiden** met `confidence: 1|2|3|4` + `confidenceWhy: string`, gevuld uit de bestaande comments in `intake-reference.ts`. Dit is de enige nieuwe datastructuur die het blok nodig heeft.
- **De registry `action_key → nutrient` bouwen** naast `portion-dictionary.ts` (besluit hierboven: afleiden, geen migratie). Dit is het echte werk achter de 14-dagenstrip.
- **Favorieten leest nu `buildVerdictCards()` niet.** De prebuild toont alle vier de verdict-waarden; `StatistiekenBlikPanels` gebruikt `SupplementVerdictPanel` met `variant="summary"`. Bij implementatie moet Favorieten dezelfde bron gebruiken, niet een tweede lijst.
- **De 5 drempels zijn nog steeds indicatief.** `intake-reference.ts:6` markeert ze als vuistregels met een open TODO; magnesium en vitamine D staan op LAAG en bij magnesium suggereert de comment dat de onderliggende *vraag* herzien moet worden, niet alleen de grens. De prebuild toont die onzekerheid nu eerlijk, maar dat vervangt het bronwerk niet.

Voor het spoorblok komt daar bij:

- **Een bronnentabel bestaat nog niet.** [`portion-dictionary.ts`](../../src/data/nutrition/portion-dictionary.ts) mapt `PortionGroup → gram-equivalent`; wat de bronnenlijst nodig heeft is `voedingsmiddel → (nutriënt, hoeveelheid per portie, portiegroep, seizoen)`. Dat is een nieuwe tabel naast de bestaande, niet een uitbreiding ervan. Elk getal vraagt een NEVO/Voedingscentrum-verificatie vóór livegang — de prebuild-waarden zijn orde-van-grootte en dragen hetzelfde `VERIFY`-voorbehoud als de rest van dat bestand.
- **`PortionGroup` mist twee groepen die de bronnenlijst nodig heeft.** De union is `vegetables | fruit | oilyFish | leanMeat | legumes | nuts | dairy | egg` — er is geen **volkoren** en geen **overig**. Dat is dezelfde blinde vlek die de magnesium-comment al benoemt: volkoren is een sterke magnesiumbron die nergens in het model past. Volkoren toevoegen is de kleinste wijziging met de grootste winst voor de magnesium-schatting.
- **`bloed: { ok, why }` per nutriënt** hoort naast `confidence`/`confidenceWhy` in `NutrientReference` te landen. Het is dezelfde soort promotie van onderzoek naar getypeerd veld, en het maakt de meetbron-ladder datagedreven in plaats van copy in de component.
- **Seizoen generaliseren.** [`nutrition-season.ts`](../../src/lib/nutrition-season.ts) kent alleen `isVitaminDLowSunSeason()` / `seasonFromDate()`. De "nu in seizoen"-chip op groente vraagt een maandbereik per bron; dat hoort in dezelfde module te leven, niet in een nieuwe datumhelper. Dit is ook het aanknopingspunt voor de omgeving-ghost: lokaal en seizoen zijn hetzelfde onderwerp.
- **De ladderstaat moet uit één bron komen.** Trede 3 leest in de prebuild het verdict; in productie moet dat `buildVerdictCards()` / `resolveAdviesState()` zijn, niet een tweede afleiding. Zie ook het punt hierboven over Favorieten.

## Openstaande copy-bug

[`src/lib/voortgang-bewijs-copy.ts:45`](../../src/lib/voortgang-bewijs-copy.ts#L45) bouwt voor de `wachtend`-state:

```ts
`Je hermeting staat over ${daysUntilRemeasure} dagen. Dan zie je of er beweging in je ${focusLabel.toLowerCase()} zit.`
```

Als het focusdomein **beweging** is, wordt dit letterlijk "Dan zie je of er beweging in je beweging zit." Niet gefixt in deze ronde — alleen de prebuild-HTML en deze notitie zijn aangeraakt, geen `src/`-wijzigingen.
