# Verdict — Beweging vandaag × programma × Mijn Dag

> **Bron:** [`claude-opus-beweging-vandaag-programma-mijn-dag-prompt.md`](claude-opus-beweging-vandaag-programma-mijn-dag-prompt.md)
> **Opgesteld:** 2 augustus 2026 · branch `s0-s1-stappenplan-ontdichten`, inclusief de uncommitted `movement_day_choice`-laag
> **Status:** besluitdocument. Geen code, geen diffs. Sectie A en C zijn het besluit; sectie H is de werklijst; sectie J is de opdracht.

---

## A. Executive verdict

**De koppeling gaat tot en met "dezelfde stap, dezelfde zwaarte, dezelfde duur, dezelfde afvink-staat, op beide schermen zichtbaar" — en stopt precies daar waar een tweede oppervlak iets over de dag zou kúnnen beweren zonder de eerste bron te raadplegen.**

### A1 · Verdict-tabel

| # | Koppeling | Verdict | Reden | Wat kapotgaat als je het tóch doet | n-domeinen |
| --- | --- | --- | --- | --- | --- |
| 1 | Dagkeuze zichtbaar op Mijn Dag (titel + afvink-staat) | **GO** | Eén mentaal model; de uncommitted laag doet dit al en leest af, niet af-en-toe-raden | — (dit is de fix, niet het risico) | houdbaar |
| 2 | Dagkeuze wijzigbaar op Mijn Dag (tier-picker daar ook) | **KILL** | De zwaarte-keuze hangt aan de trainingspoort en de tier-uitleg; die reizen niet mee | Een picker zonder poort maakt de poort optioneel — dan kan iemand "trainen" kiezen op de dag dat de poort hem juist had omgeleid | houdbaar (regel: keuze woont op de domein-surface) |
| 3 | Duur van de gekozen tier zichtbaar op Mijn Dag | **GO** | Zuivere readout: de duur is een eigenschap van de tier die de gebruiker al koos | Niets — mits nergens bewerkbaar | houdbaar |
| 4 | Duur bepaalt de bloklengte i.p.v. de vaste 45 min | **GO** | 45 is een magische constante die liegt over herstel; afgeleid uit de tier is hij eerlijk | Alleen fout als de lengte opslaanbaar wordt; dan is geometrie een claim over de werkelijkheid | houdbaar |
| 5 | Plan-stap-blok in het uurraster op zijn starttijd | **PIVOT** | Alleen bij een **expliciet gezette** tijd; bucket-only en tijdloos blijven boven het raster | Onvoorwaardelijk plaatsen laat de app een tijd claimen die de gebruiker nooit zei — elke dag om 07:31 een gemiste afspraak | houdbaar (tray/raster ís het n-slotmodel) |
| 6 | Eindtijd van dat blok handmatig bewerkbaar | **KILL** | Een instelbare eindtijd is een uitspraak over hoe lang het duurde | De volgende vraag is "heb je die 45 gehaald?" en dat is een tweede log | n.v.t. |
| 7 | Programma-dosis → automatisch `agenda_blocks` | **KILL** | Maakt een vinklijst die het plan bezit maar de gebruiker moet onderhouden | Tweede completion-bron; `daily_action_log` verliest zijn monopolie | valt om — bij 3 domeinen is het een agenda vol app-afval |
| 8 | `agenda_block` "beweging" telt als dagstap gedaan | **KILL** | Een moment is een intentie, geen bewijs | Twee manieren om dezelfde dag af te ronden; de liniaal op Voortgang telt vanaf dan intenties mee | valt om |
| 9 | Dagstap → **automatisch** een tijd op de dagtijdlijn | **KILL** | Een tijd die niemand koos is geen plan | Zie 5; bovendien wordt de nudge-timing gebaseerd op een verzonnen moment | houdbaar |
| 10 | Weekritme "Deze week" ook op Mijn Dag | **DEFER** | Mijn Dag heeft al een weekstrip; twee weekbeelden op één scherm is doublure, en "Deze week" is evidence — dat neigt naar oordeel (lock 4) | Mijn Dag wordt een meetscherm | valt om — bij n domeinen: wiens week? |
| 11 | De dagkeuze persisteren (en waar) | **GO** — in `account_priority_pref`, met uitzonderingsgrond (zie A2b) | Zonder persistentie ziet wie kiest maar niet afvinkt zijn keuze nergens terug | — | houdbaar tot het tweede domein een dagkeuze wil; dán verhuizen |
| 12 | E-mailnudge op basis van `time_bucket` | **GO, maar F1b** — eigen deploy, eigen venster | Enige kanaal dat bestaat; timing-bron ligt er al | Samen deployen met een surface-wijziging maakt beide effecten onmeetbaar | houdbaar (max 1 mail/dag/account, over het prioriteitsdomein) |
| 13 | Web-push | **DEFER** — exacte voorwaarde in sectie D | Geen service worker, geen DPIA-dekking, geen afmeldweg buiten de browser | Nieuwe categorie persoonsgegevens (device-token) zonder registergrond | n.v.t. |
| 14 | Coach leest `daily_action_log` | **DEFER** — naad nu, bouw later | Read-only is architectonisch onschuldig, juridisch niet | Een derde die art. 9-data inziet zonder toestemmingsobject en audit-spoor | houdbaar |
| 15 | Coach schrijft in het programma | **KILL voor F1** | Drie voorwaarden ontbreken (sectie E) | Wie de zwaarte van jouw dag zet, neemt de autonomie weg waar het hele SDT-fundament op rust | n.v.t. |
| 16 | *(toegevoegd)* Linkerkolom leest `activeHabit.state` | **KILL die bron** | Derde readout op eigen bron voor een vraag die één antwoord heeft | Staat er nú al: "nog niet afgevinkt" naast een afgevinkte stap | valt om — bij n domeinen liegt hij n keer |

### A2a · De grensregel — **de wegval-toets**

> **Neem de bron weg. Kan het tweede oppervlak dan nog steeds antwoord geven op dezelfde vraag? Ja → het is een tweede waarheid (fout). Nee → het is dezelfde stap op twee plekken (goed).**

Toepassing, ook op koppelingen die niet in de tabel staan:

| Geval | Kan het zonder de bron antwoorden? | Oordeel |
| --- | --- | --- |
| Tweede Gedaan-knop op Mijn Dag | Nee — hij leest `daily_action_log` | Goed |
| Duur-readout op de strip | Nee — zonder de tier is er geen duur | Goed |
| Bloklengte uit de tier | Nee — puur afgeleid, nergens opgeslagen | Goed |
| `activeHabit.state` in de linkerkolom | **Ja** — hij heeft een eigen veld | Fout |
| `agenda_blocks.status` als gedaan-bewijs | **Ja** — eigen statuskolom | Fout |
| Bewerkbare eindtijd | **Ja** — opgeslagen getal dat niemand controleert | Fout |
| `stepId` op een `agenda_block` | **Ja** — vanaf dan kan een blok beweren welke stap het was | Fout (achterdeur naar 7 en 8) |

De regel is bewust *negatief* geformuleerd: hij verbiedt zelfstandigheid, niet duplicatie. Duplicatie van *weergave* is goedkoop en goed; duplicatie van *vermogen om te antwoorden* is de bug.

### A2b · De roadmap-spanning — keuze **(i), met correctie op de bestemming**

**Ik accepteer de uitzondering, en pivot licht op de regel zelf.**

1. De freeze-regel bestaat om te voorkomen dat *duurzame* per-domein-state zich ophoopt in een `unique(account_id)`-rij waar hij niet weg te krijgen is zonder backfill. `movement_day_choice` is geen duurzame state: **hij verloopt om middernacht.** State die vanzelf waardeloos wordt, heeft per definitie migratiekosten nul — je stopt met schrijven op plek A, begint op plek B, en er is niets om mee te nemen. De regel raakt hem dus niet in zijn bedoeling, alleen in zijn letter.
2. De kolom staat op de rij die het dashboard-model tóch al ophaalt. Nu verhuizen kost een extra query per dashboard-build voor nul zichtbaar verschil.
3. **Correctie op de bestemming:** de freeze wijst per-domein-state naar `agenda_preferences`. Dat is verkeerd voor dít object. Een *preference* is duurzaam ("ik doe dit 's ochtends"); een *dagintentie* is dat niet. De uiteindelijke plek is geen preferences-tabel maar een dag-object met de vorm `(account_id, date, domain, choice)` — dat is meteen ook n-domein-proof en de plek waar het latere slotmodel landt.

**De harde grens.** Deze twee kolommen mogen erbij:

- **niets** met een levensduur langer dan één dag;
- **niets** waarvan een tweede domein een eigen variant wil.

**Het verhuis-signaal, toetsbaar:** zodra iemand een derde `movement_*`-kolom voorstelt, óf zodra een tweede domein een dagkeuze krijgt, óf zodra er meer dan één plan-stap per dag bestaat — dán verhuist de hele dagintentie in één keer naar het dag-object, en worden deze twee kolommen in dezelfde wijziging gedropt. Niet eerder, niet gedeeltelijk.

De derde optie (niet persisteren, afleiden uit log + sessiestate) valt af op precies één scenario: wie 's ochtends "Trainen" kiest en pas 's avonds afvinkt, zou de hele dag op Mijn Dag de default zien. Dat is exact de bug die deze ronde oplost.

### A2c · Verdict op het duur- en planbaarheidsgat

| Deelvraag | Verdict |
| --- | --- |
| **Zichtbaarheid** | **Ja.** Tier-label + `durationLabel` komen op de strip én in het detail: "Trainen · 30–45 min". Readout, nergens bewerkbaar. |
| **Bloklengte** | **Ja, afgeleid.** Planningsduur = de bovengrens van de tier-range (herstel 20, matig 45, trainen 45 min). Bovengrens omdat een planner de slechtste-geval-ruimte moet reserveren: de vraag is "past het", niet "hoe lang deed ik erover". Het getal wordt nooit opgeslagen en verschijnt nooit als getal in de UI — de UI toont het bereik dat de gebruiker koos, de geometrie gebruikt de bovengrens. |
| **Positie** | **Voorwaardelijk in het raster.** Is er een expliciet gezette tijd (`scheduled_time` via "Verplaats") → het blok staat ín het raster op die tijd, met die lengte, en de vastgepinde strip verdwijnt (één object, één plek). Is er alleen een bucket of niets → het blijft boven het raster, in wat vanaf nu de **tray** heet, met de duur en zonder tijd. |

De motivering achter "voorwaardelijk": een blok in een uurraster is een claim. Een bucket is geen claim over een tijdstip maar over een dagdeel — dat 07:30 achter "ochtend" is een implementatiedetail, geen afspraak. Het in het raster zetten zou de app iets laten zeggen wat de gebruiker niet zei, en geeft hem elke dag een afspraak die hij mist. Zodra hij "Verplaats" gebruikt is de claim van hém, en dan is het raster eerlijk — en krijgt "Verplaats" eindelijk een zichtbare beloning.

**Eén AANNAME.** Ik neem aan dat `dashboard.time_bucket_set` alleen vuurt op een expliciete gebruikershandeling en niet op een default-invulling bij accountaanmaak. Zo niet, dan is "bucket = gebruikersuitspraak" onjuist en moet de tray óók gelden voor buckets die de gebruiker nooit heeft aangeraakt — de tray/raster-regel zelf blijft dan staan.

---

## B. Huidige frictie

| # | Probleem | Wat de gebruiker merkt | Oorzaak | Raakt |
| --- | --- | --- | --- | --- |
| 1 | Derde readout op de gedaan-vraag | Links staat "je dagstap staat klaar — nog niet afgevinkt" naast een groen "✓ Gedaan" | `statusDone` komt uit `model.activeHabit.state`; elke knop leest `daily_action_log`. De correcte helper `isTodayActionDone` bestaat en heeft **nul callers** | Linkerkolom · contextkolom (alle schermen) |
| 2 | De duur bereikt de dag nooit | Hij kiest "Trainen · 30–45 min" en ziet op Mijn Dag alleen een titel — hij moet zelf uitrekenen of het past | `durationLabel` bestaat alleen in `MovementTodayHero`; het blok is hard 45 min; de strip staat buiten het raster | Mijn Dag |
| 3 | Model-refresh-gat | Kiest een zwaarte, gaat naar Mijn Dag, ziet daar nog het oude voorstel tot hij herlaadt | `postMovementDayChoice` is fire-and-forget; `onPrefUpdated` loopt niet naar de beweeg-hero | Beweging → Mijn Dag |
| 4 | Het raster is leeg | Vijftien uur wit met één nu-lijn; Mijn Dag voelt als een lege agenda, niet als zijn dag | Zijn echte afspraken staan er niet in (geen import), en het enige app-object staat er juist buiten | Mijn Dag |
| 5 | Twee balk-soorten op één dag | Leert impliciet: "in de tijd staan = het is echt, erboven hangen = het is een suggestie" | Het onderscheid voorstel/afspraak wordt uitgedrukt in geometrie in plaats van in herkomst | Mijn Dag |
| 6 | Programma-sheet heeft eigen lokale state | Past de dosis aan, sluit de sheet, en de ankerregel elders zegt nog het oude ("doel 2× 30 min") | Sheet-state wordt niet teruggekoppeld naar het model | Beweging |
| 7 | `dagelijks_ritme` en het woord "Trainen" | Kiest "dagelijks ritme" als patroon, maar de tier "Trainen" toont een geforceerde zware stap die niet uit dat patroon volgt | `resolveTrainingStepId` forceert `intensityTier: "high"` los van het patroon | Beweging |
| 8 | Tier-inferentie na afvinken op Mijn Dag | Vinkt af op Mijn Dag zonder te kiezen; ziet op Beweging een zwaarte die hij nooit koos | `inferCompletedChoice` raadt de tier uit de log-keys — meestal goed, maar het is een gok die als keuze oogt | Beweging ↔ Mijn Dag |

---

## C. Doel-IA

### C1 · Drie toestanden, twee schermen

#### (a) Niets gekozen, niets gedaan

**Beweging** — ongewijzigd t.o.v. vandaag.
- Kop: de titel van de voorgestelde stap · eyebrow "Vandaag · kracht"
- Duur: "30–45 min" · Primary: **"Gedaan"** · Secondary: **"Ik doe de korte"** · onder: **"Wijzig keuze"**
- NIET: een tijd, en geen enkele zin over wat er nog niet gebeurd is.

**Mijn Dag** — de tray, boven het raster.
- Label: **"UIT JE PLAN"** · titel van de voorgestelde stap
- Derde regel: **"30–45 min · nog geen moment gekozen"** met tekstknop **"Kies een moment ›"**
- Raster: leeg, geen spookblok.
- NIET: tier-picker, score, weekoordeel, en geen "0 van je 2"-taal.

*Tijd en duur:* duur staat er (eigenschap van het voorstel), tijd niet (die bestaat nog niet). Geen tweede waarheid, want beide zijn afgeleid uit hetzelfde model dat Beweging voedt.

#### (b) Tier gekozen, niet afgevinkt

**Beweging.**
- Kop: de titel van de gekozen tier · duur van die tier · Primary **"Gedaan"** · onder **"Wijzig keuze"**
- Doel-IA (niet in de eerste slice): één regel **"Staat op 18:00 · verplaatsen ›"** zodra er een tijd is — readout, de knop leidt naar Mijn Dag.

**Mijn Dag — zonder gezette tijd (tray):**
- **"UIT JE PLAN"** · titel · **"Trainen · 30–45 min · nog geen moment gekozen"** · **"Kies een moment ›"**

**Mijn Dag — mét gezette tijd (in het raster):**
- Blok op 18:00, hoogte = 45 min, met de domeinkleur en het herkomst-label.
- Kaart: **"18:00 · Trainen"** + kleine regel **"uit je plan"**
- Detail: eyebrow **"Beweging · uit je plan"** · kop = tier-titel · regel **"Trainen · 30–45 min · gepland 18:00"** · primary **"Markeer als gedaan"** · tekstknoppen **"Verplaats"** en **"Andere zwaarte? → Beweging"**
- NIET: een eindtijd-veld, een tier-picker, een te-laat-staat. Na 18:45 blijft het blok neutraal en blijft de copy "staat klaar" — nooit rood, nooit "gemist".

*Waarom dit geen tweede waarheid is:* het blok slaat niets op. Zijn positie komt uit `scheduled_time` (laag 4, waar de gebruiker hem zette), zijn hoogte uit de tier (laag 2), zijn titel uit de resolver (laag 1+2), zijn vinkje uit `daily_action_log` (laag 3). Haal één van die lagen weg en het blok kan niets meer beweren. Wegval-toets gehaald.

#### (c) Afgevinkt

**Beweging:** "✓ Gedaan" · **"Morgen staat hier je volgende stap."** · geen confetti, geen telling.
**Mijn Dag:** hetzelfde object krijgt zijn vinkje op de plek waar het al stond (tray óf raster) — het springt niet. Detail toont "✓ Gedaan" + dezelfde afsluitregel.
**Linkerkolom:** "Gedaan — je stap van vandaag is afgevinkt", uit dezelfde bron als de knop.
NIET: een dagscore, een weekpercentage, een vergelijking met gisteren.

### C2 · Wie mag wat veranderen

| Veld | Waar je het zet | Waar je het alleen ziet | Waarom niet op de andere plek |
| --- | --- | --- | --- |
| Zwaarte (dagkeuze) | Beweging — achter "Wijzig keuze", inclusief trainingspoort | Mijn Dag (tray/blok/detail) | De poort hoort bij de keuze; een tweede picker maakt de poort optioneel |
| Gedaan | Beweging-hero **én** Mijn Dag-detail — beide schrijven naar `daily_action_log` | Linkerkolom, "Deze week" | Twee knoppen op één bron is toegestaan; twee statussen niet |
| Tijd (`scheduled_time` / `time_bucket`) | Mijn Dag — "Verplaats" | Beweging (als readout-regel) | Tijd is een dag-eigenschap, niet een domein-eigenschap; Mijn Dag is het enige scherm dat de hele dag ziet |
| Duur | **Nergens** — afgeleid uit de tier | Beweging + Mijn Dag | Een instelbare duur wordt een uitspraak over de werkelijkheid en daarmee een tweede log |
| Programma-dosis / patroon | De sheet "Jouw programma" op Beweging | Positieregel, ankerregel op de leefstijllijn | Het programma is input voor de dagstap; het mag nergens een tweede doe-lijst worden |
| Moment (`agenda_block`) | Mijn Dag — knop "Moment" | Nergens anders | Een moment is van de gebruiker; het plan hoort er niets in te schrijven en er niets uit te lezen |

### C3 · TOETS 3 — de conversiekaart als afnemer

| Eis uit de kaart | Stand vandaag | Besluit | Raakt de fasering? |
| --- | --- | --- | --- |
| (a) "Elke dag met een moment vult één streepje op de liniaal" | `agenda_blocks` voeden niets; "Deze week" leest alleen `daily_action_log` | **De kaart heeft ongelijk, niet de code.** De liniaal wordt gevoed door `daily_action_log` en door niets anders. Copy wordt: *"Elke dag dat je je stap afvinkt vult één streepje."* Een zelf gezet moment telt niet mee — het is een intentie | Nee — het is een copy-fix in een prebuild die nog niet live is |
| (b) "Je stap stond op een uur. Je kunt 'm op Mijn Dag korter zetten" | Duur onzichtbaar, blok vast 45 min | **Half waar maken.** De duur wordt zichtbaar en bepaalt de bloklengte; *korter zetten* vervalt. Copy wordt: *"Je stap staat op je dag met de tijd die je koos. Andere zwaarte kies je op Beweging."* | Ja — dit is F1a |
| (c) "Je momenten met een stof erachter — waar dit vandaan komt" | `agenda_block` draagt geen herkomst | **DEFER naar F2, en dan als afleiding.** Herkomst wordt afgeleid uit `source` + categorie, nooit uit een `step_id`-veld: dat veld is de achterdeur naar auto-materialisatie en naar "dit telt" | Nee — buiten F1 |
| (d) "Wat je op Mijn Dag afvinkt telt hier mee als context — niet als score" | Klopt | **BEWAKEN.** Alle verdicts hierboven laten deze regel intact: geometrie is geen bewijs, een tijd is geen completie, en de tray telt niets | Nee — bewakingsregel |

### C4 · TOETS 2 — de balk-taal

De huidige as ("de één zit in de tijd, de ander niet") is **de verkeerde as**. Hij koppelt *betekenis* aan *geometrie*, en leert de gebruiker precies het verkeerde: dat wat in het raster staat echt is en wat erboven hangt vrijblijvend.

**De juiste opsplitsing is er één in twee onafhankelijke assen:**

- **Geometrie-as: geplaatst vs. niet geplaatst.** Alles met een expliciete tijd staat in het raster — een moment én een dagstap. Alles zonder tijd staat in de tray. Dit is puur ruimtelijk en zegt niets over herkomst.
- **Betekenis-as: herkomst, als zichtbaar label dat op beide posities meereist.** "uit je plan" versus "van jou".

**De ene regel:**

> **Het is een voorstel zolang het bestaat omdat het plan het aandraagt — het verdwijnt vanzelf als het plan of de dag verandert. Het is een afspraak zodra het bestaat omdat de gebruiker het heeft gemaakt — het blijft staan, ook als het plan iets anders zou zeggen.**

Een geplaatste dagstap blijft dus een voorstel: hij verloopt om middernacht en verandert mee met de zwaarte. Plaatsing promoveert niets.

**De borging tegen "een moment telt mee als bewijs":** de completion-affordance is exclusief aan herkomst gekoppeld. Alleen een object met herkomst "uit je plan" toont **"Markeer als gedaan"** — die knop schrijft naar `daily_action_log`. Een moment houdt zijn eigen, anders benoemde afvinkje dat nergens door een readout op Voortgang wordt gelezen. Twee grootboeken, twee woorden, één liniaal.

### C5 · TOETS 1 — het slotmodel voor n domeinen

| Vraag | Ontwerp |
| --- | --- |
| Hoeveel voorstellen per dag? | Maximaal **één per domein**, en maximaal **één geplaatst per domein per dag**. Zichtbaar: het prioriteitsdomein altijd uitgeklapt in de tray; de rest opgevouwen achter één regel ("Nog 2 stappen uit je plan"). Nooit meer dan drie voorstellen in totaal — daarboven alleen het prioriteitsdomein |
| Twee voorstellen, dezelfde starttijd? | Kan alleen ontstaan als de gebruiker ze allebei zélf plaatst (bucket-only blijft in de tray, dus botsingen bereiken het raster nooit vanzelf). Bij een echte overlap: **beide tonen, elk op halve breedte**, oudste plaatsing links. De app verschuift nooit stilzwijgend wat iemand zelf zette |
| Blijft "één afvink-oppervlak per dagstap"? | Het wordt **"één afvink-oppervlak per domein per dag"** — en dat past exact op `daily_action_log`, dat al één rij per domein per dag met een keys-array is. De regel schaalt zonder herontwerp |

Er wordt voor één domein gebouwd; het model is voor n ontworpen. Geen enkel GO in A1 klapt om bij drie domeinen — de twee die dat wel zouden doen (7, 8, 10) staan op KILL of DEFER.

---

## D. Reminder-architectuur (F1b)

| As | Besluit |
| --- | --- |
| **Trigger** | Kwartier-tick vanuit de app zelf, aangeroepen door een systemd-timer op de VPS die een beveiligde interne route aanroept |
| **Kanaal** | E-mail via Resend. Eén kanaal, geen in-app tegenhanger |
| **Timing-bron** | `scheduled_time` wint → verzenden op **T − 30 min**, nooit vóór 07:00. Anders `time_bucket` → het vaste tijdstip (07:30 / 12:30 / 18:00). Geen van beide → **niet sturen** |
| **Suppressie** | Zeven regels, alle gecontroleerd op het verzendmoment (zie hieronder) |
| **Landing** | De VANDAAG-kaart, met `?src=nudge&d=<yyyymmdd>` — geen identificator in de URL |
| **Privacy** | Onderwerp/preheader domeinvrij, scorevrij, getalvrij. Body mag domein en staptitel noemen. Klik meten, opens niet |
| **Opt-in** | Expliciet aan, apart van de nurture-sequence, aangezet op de plek waar de tijd wordt gezet |

**Waarom een app-cron en niet n8n of Resend scheduling.** De suppressie moet op het verzendmoment tegen `daily_action_log` worden gecontroleerd — dat is precies het grootboek dat achter de service-role zit. n8n zou daar een tweede datapad naartoe nodig hebben, en dan bestaat de vraag "is het al gedaan?" op twee plekken met eigen logica: de wegval-toets faalt in de ops-laag. Resend scheduling valt af omdat die de payload vastzet vóórdat de suppressie-feiten bestaan — je zou mails plannen voor mensen die 's ochtends al klaar waren. Een systemd-timer bestaat al als patroon op deze server, kost geen nieuwe leverancier en houdt de beslissing in de app.

**De verzendketen.** De tick draait elk kwartier, rondt "nu" af op het kwartier, en zoekt accounts waarvan de doeltijd in dat kwartier valt. Per kandidaat wordt in dezelfde transactie gecontroleerd: (1) opt-in aan, (2) er is een tijdbron, (3) de dagstap van vandaag staat nog niet in `daily_action_log`, (4) de stap is niet weggeklikt voor vandaag en niet permanent verborgen, (5) er is vandaag nog geen nudge gestuurd, (6) het adres is niet gebounced of afgemeld, (7) er staan niet ≥ 10 opeenvolgende ongeopende nudges open — dan pauzeert het kanaal automatisch. Overleeft de kandidaat alles, dan gaat de mail eruit en wordt `movement.nudge_sent` durable weggeschreven. De landingsklik levert `movement.nudge_clicked`, met het account uit de cookie en niets uit de URL. Er is geen aparte verzendtabel: `domain_events` ís het verzendlog, want het is al durable, al de outbox, en het houdt de bewaartermijn op één plek.

**Privacy-motivering.** Het art. 9-risico zit niet in de mail maar in het **vergrendelscherm**: onderwerp en preheader zijn zichtbaar voor iedereen die naast de ontvanger staat. Vandaar de scheiding — de body vereist een handeling van de ontvanger en mag daarom domein en staptitel bevatten. Het verzendspoor zelf is óók bijzonder: "deze persoon werkt aan zijn beweging" is een gezondheidsgegeven. Daarom: geen inhoudskopie in het log, alleen tijdstip en uitkomst, met een expliciete bewaartermijn.

**De exacte voorwaarde waaronder push terug op tafel mag:**

> Push mag pas opnieuw worden overwogen als de e-mailnudge **minstens vier aaneengesloten weken** live is gewéést en de gemeten klik→afvink-conversie van de nudge **onder de dagelijkse terugkeer zonder nudge** ligt — dus pas als is aangetoond dat e-mail dit werk niet doet, niet omdat push sneller lijkt. Plus twee randvoorwaarden die geen van beide onderhandelbaar zijn: een DPIA-uitbreiding voor device-tokens als nieuwe categorie persoonsgegevens, en een afmeldweg binnen het product die niet via browserinstellingen loopt.

---

## E. Coach-naad

### Read/write-matrix

| Object | Coach leest | Coach schrijft |
| --- | --- | --- |
| `daily_action_log` | Later, met expliciete toestemming | **Nooit** — completie is een uitspraak van de gebruiker over zichzelf |
| `scheduled_time` / `time_bucket` | Later, met toestemming | Nooit in F1; hooguit later als *voorstel* dat de gebruiker accepteert |
| Programma-config (patroon, dosis, sporten) | Later, met toestemming | Pas na de drie voorwaarden, en alleen als voorstel-met-bevestiging |
| `movement_day_choice` | Later | **Nooit** — wie de zwaarte van jouw dag zet, neemt de keuze weg die het hele mechanisme draagt |
| Check-scores / domeinen | Niet in F1 | Nooit |
| `agenda_blocks` (momenten) | Niet in F1 | Nooit — dat is iemands privéagenda |

### Drie voorwaarden vóór enige schrijfactie

1. **Een principal-model.** Een coach is een eigen identiteit met een expliciete, per-account intrekbare koppeling — geen gedeelde login, geen impersonatie van de gebruiker.
2. **Een toestemmingsobject met scope, einddatum en audit.** Zichtbaar en intrekbaar voor de gebruiker, met een spoor van elke lees- en schrijfactie van de coach.
3. **Juridische dekking.** DPIA-uitbreiding en verwerkerslijn voor art. 9-data die een derde inziet, inclusief bewaartermijn en datalekpad.

### Vijf regels naad-hygiëne voor nu (zonder multi-tenant te bouwen)

1. Houd "wie doet dit" op één plek — één functie die de handelende identiteit oplost, niet twintig plekken die zelf de cookie lezen.
2. Geen enkel leesoppervlak leidt gedaan-staat af uit iets anders dan `daily_action_log` (dat is de wegval-toets; nu al geschonden door de linkerkolom).
3. De geldende tier wordt **één keer** server-side geresolved in het model; componenten lezen alleen. Twee componenten die elk hun eigen tier afleiden zijn de derde readout van morgen.
4. Blijf `organization_id` vullen op domain events, ook al is er maar één waarde. Dat is de goedkoopste tenant-naad die bestaat.
5. Geen coach-woorden in de UI en geen entitlement-checks op `"coach"` in doe-paden. Het entitlement blijft een wachtlijstvlag tot 1–3 bestaan.

---

## F. Wat niet bouwen

1. **Auto-materialisatie van `agenda_blocks` uit de weekdosis.** Aantrekkelijk omdat "2× kracht per week" schreeuwt om twee blokken. Breekt: elk blok krijgt een status, en vanaf dat moment bestaat "gedaan" op twee plekken — plus een agenda die de app vult en de gebruiker moet opruimen.
2. **Een tweede vinklijst, in welke vorm dan ook.** Aantrekkelijk als "handig overzichtje". Breekt: de liniaal op Voortgang moet kiezen welke bron hij gelooft, en die keuze is niet uit te leggen.
3. **Web-push in F1.** Aantrekkelijk omdat het de vraag "hoe bereik ik zijn telefoon" letterlijk beantwoordt. Breekt: nieuwe categorie persoonsgegevens zonder registergrond, een afmeldweg die buiten je product ligt, en een kanaal dat je niet kunt pauzeren als het misgaat.
4. **Een tier-picker op twee plekken.** Aantrekkelijk omdat het symmetrisch oogt. Breekt: de trainingspoort reist niet mee, dus de veiligheidslogica wordt optioneel — en de tweede picker is de plek waar de dag alsnog onbeslist blijft.
5. **Een coach-writepad.** Aantrekkelijk omdat het entitlement er al staat. Breekt: een derde die art. 9-data schrijft zonder toestemmingsobject, plus de autonomie waar het gedragsmodel op leunt.
6. **De dagkeuze als score.** Aantrekkelijk als "je koos trainen — hoe ging het?". Breekt: een keuze die je niet haalt wordt een schuldbewijs. Het verlopen om middernacht is geen tekortkoming van het ontwerp maar de kern ervan: er wordt nooit teruggekeken op een niet-gehaalde keuze.
7. **Een `step_id` op een `agenda_block`.** Aantrekkelijk als "dan weten we waar het vandaan komt". Breekt: vanaf dat veld kan een blok beweren wélke stap het was, en dan zijn 1 en 2 er alsnog — via de achterdeur.
8. **Een bewerkbare eindtijd op het plan-blok.** Aantrekkelijk omdat de conversiekaart het belooft. Breekt: een opgeslagen duur is een claim over de werkelijkheid die niemand controleert; de volgende feature is "je haalde maar 20 van je 45".

---

## G. Fasering + meetplan

| Fase | User-visible | Leidend event | Venster | Wat bevroren blijft |
| --- | --- | --- | --- | --- |
| **F0 — pariteit af** (de slice, sectie J) | Eén antwoord op "is het gedaan"; de gekozen zwaarte komt zonder herladen aan op Mijn Dag | Nieuw durable `dashboard.movement_day_choice_set` (+ bestaande `dashboard_vandaag_step_alternative` als GA4-tegenlezing) | 2 weken | Alle copy op de hero; geen duur, geen plaatsing, geen mail |
| **F1a — planbaarheid** | Duur + tier zichtbaar op Mijn Dag; blok in het raster zodra er een tijd is; tray voor de rest | Bestaand `dashboard.time_bucket_set` — stijgt het aantal accounts dat een tijd zet? Secundair: `dashboard_vandaag_action_toggled` uitgesplitst naar surface | 3 weken | Geen nudge, geen tier-picker op Mijn Dag, geen herkomst op momenten |
| **F1b — de nudge** | Eén e-mail per dag, alleen voor wie hem aanzette en een tijd heeft | Nieuw durable `movement.nudge_sent` + `movement.nudge_clicked` | 4 weken, **eigen deploy**, minstens 2 weken ná stabilisatie van F1a | De hele surface. Geen enkele UI-wijziging in dit venster |
| **F2 — herkomst + n-domein-tray** | Momenten krijgen een herkomst-regel; meerdere domeinen in de tray | Nog te bepalen | — | — |

**Eventregistratie.** `dashboard.movement_day_choice_set`, `movement.nudge_sent` en `movement.nudge_clicked` zijn **server-emitted** durable events — die vragen alleen registratie in `src/lib/events.ts`. De drie-plekken-regel (events.ts + intake-events-client.ts + allowlist in `api/intake/events/route.ts`) geldt voor client-events; in dit hele plan komt er geen enkel nieuw client-event bij. Alles wat de client moet meten bestaat al.

**Scheiding van de twee effecten.** Het pariteitseffect lees je af aan `dashboard.time_bucket_set` (zetten meer mensen een tijd?) en aan de surface-uitsplitsing van `dashboard_vandaag_action_toggled` (verschuiven completies naar Mijn Dag?). Het remindereffect lees je af aan `movement.nudge_clicked` → afvinken binnen twee uur. Die twee delen geen event en geen venster. De regressiewacht `dashboard_vandaag_action_toggled` verandert in geen enkele fase van vorm — F1a verschuift hooguit de *samenstelling* per surface, wat precies de reden is dat F1b niet in hetzelfde venster mag draaien.

**Let op bij het lezen van F1b:** de nudge staat standaard uit en vereist opt-in. Het effect is dus alleen *binnen de opt-in-groep* te meten, nooit als site-brede lift. Plan de meting zo, anders lijkt een werkende nudge een mislukking.

> **Meetpunt: `dashboard.movement_day_choice_set` + `dashboard.time_bucket_set` + `dashboard_vandaag_action_toggled{surface}` — hier lees je het pariteits- en planbaarheidseffect af. `movement.nudge_sent` / `movement.nudge_clicked` — hier lees je het reminder-effect af, in een eigen venster.**

---

## H. Open gaten in de uncommitted laag

**1 · Model-refresh-gat** — *hinderlijk.*
Kiest iemand een zwaarte zonder af te vinken en gaat hij naar Mijn Dag, dan staat daar het oude voorstel tot hij herlaadt. Merkbaar bij de eerste keer dat iemand de twee schermen achter elkaar gebruikt — precies het gedrag dat deze laag wil belonen.
*Oplossing:* koppel de bestaande `onPrefUpdated`-terugkoppeling door naar de beweeg-hero en patch het geladen model in memory met de respons die de pref-route al teruggeeft — geen refetch van het hele dashboard.

**2 · Geen domain event op `set_movement_day_choice`** — *hinderlijk nu, blokkerend zodra F1b live gaat.*
Alle andere acties op die route emitten wél. Het GA4-event `dashboard_vandaag_step_alternative` volstaat **niet**: het mist accountkoppeling, het vuurt ook bij "Wijzig keuze" (dus keuze en wis-actie zijn niet te scheiden) en het overleeft ad-blockers niet. De dagkeuze stuurt straks zowel de bloklengte als de inhoud van de mail; zonder durable spoor kun je achteraf niet reconstrueren waarover je iemand hebt aangeschreven.
*Oplossing:* voeg `dashboard.movement_day_choice_set` toe met payload `{choice, date, surface}`, waarbij `choice: null` de wis-actie is.

**3 · Duur- en planbaarheidsgat** — gesplitst:

- **3a · Zichtbaarheid — *blokkerend voor de belofte van Mijn Dag.*** Hij ziet een titel en moet zelf weten hoeveel het kost. *Oplossing:* tier-label + `durationLabel` op de tray-regel en in het detail.
- **3b · Bloklengte — *hinderlijk.*** Het model liegt over de ruimte die herstel inneemt; nu onzichtbaar, maar zodra 3c gebeurt is het meteen zichtbaar. *Oplossing:* planningsduur = bovengrens van de tier-range, afgeleid en nooit opgeslagen.
- **3c · Positie in het raster — *hinderlijk, en het is een ontwerpkeuze, geen bug.*** *Oplossing:* in het raster zodra er een expliciete tijd is; anders in de tray, met duur en zonder tijd.

**4 · BESTOND AL — de derde readout in de linkerkolom** — *blokkerend.*
`CockpitProfileRail` en `CockpitContextRail` krijgen `statusDone` uit `model.activeHabit.state`; elke Gedaan-knop leest `daily_action_log`. Twee schermen kunnen het eens zijn terwijl de kolom ernaast het tegenspreekt — dat ondermijnt élke vinkactie, niet alleen die van beweging.
**Extra vondst:** de correcte helper bestaat al. `isTodayActionDone` in `day-model.ts` draagt letterlijk de comment *"SSOT voor rail/inspector"* en heeft **nul callers**. De fix is geen nieuwe machinerie maar het aansluiten van iets wat er al ligt.
*Oordeel:* eigen fix, maar hij hoort **in dezelfde wijziging** als de pariteitsslice. Pariteit maakt de tegenspraak juist scherper: zodra Beweging en Mijn Dag het eens zijn, is de kolom de enige die nog liegt.

**5 · NIEUW GAT, niet in de prompt — `done: false` hard in `buildAnalysisBlock`** — *blokkerend binnen F1a.*
Het plan-stap-blok krijgt `done: false` met een comment dat geen UI-pad dat veld leest. Dat klopt vandaag omdat de strip een eigen component is die het veld negeert. Zodra het blok in F1a in het raster belandt, rendert het door `AgendaBlockCard` — hetzelfde pad als momenten, die hun vinkje wél uit `done` halen. Een afgevinkte dagstap zou dan als niet-gedaan in het raster staan: readout nummer vier.
*Oplossing:* laat `done` voor plan-stap-blokken uit dezelfde geresolveerde bron komen als de knoppen, of geef het blok in het raster geen done-affordance en laat het detail de enige plek zijn — kies één van beide vóór F1a, niet erna.

**6 · Meetvervuiling bij de trainingspoort** — *cosmetisch, en alleen in de meting.*
Wie de poort opent en wegklikt laat de dag onbeslist, maar er is wel een gate-event. In de data lijkt dat op een keuze. *Oplossing:* onderscheid "poort getoond" van "poort doorlopen" in de payload — te verifiëren of dat er al in zit.

**7 · Spanning met lock 7 — "X dagen op rij"** — *eigen besluit, buiten deze naad.*
De bestaande streak-regel bij ≥ 2 dagen is een streak, en lock 7 verbiedt streaks en schuldmechaniek. Het is de enige plek op de doe-surface met een haakje aan gisteren. Geen onderdeel van deze slice, maar noteer het — het valt op zodra de rest van het scherm consequent zonder terugblik werkt.

---

## I. Privacy- en register-checklist

**Moet gebeuren vóór de nudge live mag:**

1. Nieuwe verwerking opnemen in het register: *"functionele herinnering per e-mail aan de dagstap"*, met doel, ontvanger (Resend), bewaartermijn en betrokkenen.
2. Grondslag vastleggen als **toestemming** (art. 9 lid 2 sub a), niet als gerechtvaardigd belang: de inhoud verraadt dat iemand aan een gezondheidsdoel werkt.
3. Controleren — niet aannemen — dat de bestaande verwerkersovereenkomst met Resend deze stroom qua doeleinden dekt. Zo ja: geen nieuwe DPA nodig, alleen een registerregel erbij.
4. Bewaartermijn vastleggen voor `movement.nudge_sent` / `movement.nudge_clicked` in `domain_events` (voorstel: 12 maanden, daarna alleen geaggregeerd). Als die tabel vandaag geen expliciete termijn heeft, is dít het moment.
5. Afmeldweg: één klik in elke nudge, direct werkend, **los** van de nurture-afmelding, en de afmelding mag de dienst niet beperken.
6. Vastleggen dat er geen open-tracking pixel wordt gebruikt; klikmeting loopt via een URL-parameter zonder identificator.
7. Onderwerp- en preheader-regel schriftelijk vastleggen als verwerkingsafspraak, niet alleen als designafspraak: geen domein, geen score, geen getal dat een toestand verraadt.

**Hoeft níet:**

8. Geen DPIA-uitbreiding, zolang alle vier gelden: e-mail naar een adres dat we al hebben, geen nieuwe categorie persoonsgegevens, geen gezondheidscontext in onderwerp/preheader, en geen profilering met rechtsgevolg.
9. Geen wijziging aan de cookiebanner — er komt geen cookie bij.
10. Geen nieuwe grondslag voor het dashboard zelf, de dagkeuze of de agenda-tijd: dat is uitvoering van de dienst die de gebruiker al aanging.
11. **Wél DPIA-uitbreiding nodig** zodra: push (device-token = nieuwe categorie), SMS (telefoonnummer = nieuwe categorie), coach-inzage (derde ontvanger van art. 9-data), of agenda-OAuth/ICS (agenda-inhoud van derden binnenhalen).

---

## J. De ene volgende slice + parklijst

### J1 · De slice — **"Eén antwoord op: is het gedaan?"**

*De uncommitted laag moet eerst áf. Er komt niets nieuws bij tot dit klopt — de pariteitswinst van die laag is nu onzichtbaar omdat de kolom ernaast hem tegenspreekt en de keuze niet aankomt zonder herladen.*

**Wat de gebruiker merkt.** De app spreekt zichzelf niet meer tegen. Vinkt hij af, dan zegt élk oppervlak dat het gedaan is. Kiest hij een zwaarte op Beweging en gaat hij naar Mijn Dag, dan staat diezelfde zwaarte er — zonder herladen.

**Acceptatiecriteria (toetsbaar, geen implementatietaken):**

1. Op een dag waarop de stap is afgevinkt, zegt **geen enkel** oppervlak "nog niet afgevinkt": niet de linkerkolom, niet de contextkolom, niet Mijn Dag, niet Beweging.
2. Kies je op Beweging een zwaarte zonder af te vinken en ga je zonder herladen naar Mijn Dag, dan staat daar de titel van díe zwaarte.
3. Wis je de keuze via "Wijzig keuze", dan valt Mijn Dag zonder herladen terug op het voorstel.
4. Vink je af op Mijn Dag en open je daarna Beweging, dan is de staat gelijk — en omgekeerd.
5. Elke vastgelegde of gewiste dagkeuze levert precies één durable event op met zwaarte, datum en surface. Een voorstel dat alleen wordt bekeken levert er geen.
6. `dashboard_vandaag_action_toggled` verandert niet van vorm; de regressiewacht blijft over het venster heen vergelijkbaar.
7. Op 375px is er geen zichtbare verandering in layout — dit is een waarheidsfix, geen herontwerp.

**Wat er NIET in zit:** duur op Mijn Dag, bloklengte uit de tier, het blok in het uurraster, de tray-herbenoeming, een tier-picker op Mijn Dag, de e-mailnudge, herkomst op momenten, het `done: false`-gat (dat wordt pas relevant in F1a — wel besluiten, niet bouwen).

**Meetpunt:** `dashboard.movement_day_choice_set` — hier lees je af hoeveel mensen daadwerkelijk een zwaarte vastleggen in plaats van het voorstel te accepteren, en dat is het cijfer waarop F1a wordt verantwoord.

### J2 · De slice erna, alvast uitgeschreven — **"Je stap in je dag" (F1a)**

Duur en tier zichtbaar op de tray-regel en in het detail; bloklengte afgeleid uit de tier; het blok in het uurraster zodra er een expliciete tijd is, anders in de tray. Acceptatie: (1) de duur die op Beweging staat, staat woordelijk gelijk op Mijn Dag; (2) een blok met een gezette tijd staat in het raster op die tijd en beslaat de bovengrens van de gekozen tier; (3) zonder gezette tijd staat er niets in het raster; (4) er is nergens een veld waarin een duur of eindtijd kan worden ingevoerd; (5) het blok toont na zijn eindtijd geen te-laat-staat. Meetpunt: `dashboard.time_bucket_set`. Voorwaarde vooraf: gat 5 uit sectie H is beslist.

### J3 · Parklijst

**E-mailnudge (F1b).** Volledig ontworpen in sectie D, maar hij mag niet in hetzelfde venster als een surface-wijziging. Eerst moet bestaan: de opt-in-opslag (een eigen kleine voorkeurstabel — níet een kolom op `account_priority_pref`, dat zou mijn eigen grens schenden), de systemd-timer, en de registerregels 1–7. Vroegste terugkeer: minstens twee weken na stabilisatie van F1a.

**Herkomst op momenten.** De conversiekaart vraagt erom, maar herkomst moet een *afleiding* zijn uit `source` + categorie, nooit een `step_id`-veld. Eerst moet bestaan: een besluit over wat herkomst betekent zonder "dit telt" te betekenen. Vroegste terugkeer: F2.

**Tray voor meerdere domeinen.** Het slotmodel staat in C5, maar er is één plan-stap per dag en dus niets om op te vouwen. Eerst moet bestaan: een tweede domein met een dagstap. Vroegste terugkeer: F2, en dan meteen inclusief de verhuizing van de dagkeuze naar het dag-object.

**"Deze week" op Mijn Dag.** Doublure met de weekstrip en het neigt naar oordeel op een doe-surface. Eerst moet bestaan: bewijs dat mensen op Mijn Dag naar hun week zoeken en niet vinden. Vroegste terugkeer: na F2, of nooit.

**Coach-inzage.** Volledig ontworpen in sectie E, nul regels bouwen nu. Eerst moet bestaan: principal-model, toestemmingsobject met audit, en juridische dekking. Vroegste terugkeer: buiten deze roadmap.

**Agenda-import (echte afspraken op Mijn Dag).** Dit is de eerlijke beperking van dit hele ontwerp: "past het in mijn dag?" kan de app pas beantwoorden als zijn echte dag erin staat. `external_provider` / `external_ref` staan gereserveerd, en dat is genoeg. Eerst moet bestaan: registerdekking voor agenda-inhoud van derden. Vroegste terugkeer: niet in deze reeks.

### J4 · Open vragen voor Dennis, met mijn antwoord

1. **Is de migratie al in de Dashboard SQL Editor uitgevoerd?** De code heeft een `isMissingPrefColumn`-terugval, dus hij overleeft een database zonder de kolommen. *Mijn advies:* voer hem uit vóór de slice gemerged wordt, en laat de terugval staan tot je hebt gezien dat de server hem ook heeft.
2. **`isTodayActionDone` heeft nul callers — is dat een restant of stond er iets anders in de weg?** *Mijn advies:* behandel het als restant en sluit hem aan; als er een reden was, is die reden nu de bug.
3. **Bewaartermijn `domain_events`.** *Mijn advies:* 12 maanden, daarna geaggregeerd — kort genoeg om verdedigbaar te zijn, lang genoeg voor een jaar-op-jaar-vergelijking.
4. **Waar zet iemand de nudge aan?** *Mijn advies:* bij het zetten van de tijd ("Verplaats"), niet in een accountmenu. Toestemming hoort bij het moment waarop de handeling betekenis krijgt.
5. **Blijft een bucket-only dagstap echt uit het raster?** *Mijn advies:* ja. Een gekleurde band voor het dagdeel is verleidelijk maar is een nieuw visueel primitief voor een half antwoord.
6. **Hoe heet de zone boven het raster in de UI?** *Mijn advies:* geen nieuw label — de bestaande regel "Stap uit je plan" volstaat en vermijdt de verboden woorden. "Tray" is intern jargon voor dit document, geen UI-woord.
7. **De streak-regel "X dagen op rij" versus lock 7.** *Mijn advies:* weghalen. Het is de enige plek op deze surface die iets over gisteren beweert, en het ondermijnt het argument dat de dagkeuze om middernacht verloopt.

---

## Kritiekronde — verwerkt

**1 · 45-jarige man, drukke week.**
*(a)* "Trainen · 30–45 min" in de tray zonder tijd laat hem alsnog zelf rekenen. → **Gewijzigd:** de tray-regel eindigt op een handeling ("Kies een moment ›"), zodat één tik het probleem oplost in plaats van het te beschrijven.
*(b)* Harder: zijn échte afspraken staan niet in Mijn Dag, dus "past het?" kan de app niet beantwoorden — hoe mooi het blok ook staat. → **Gewijzigd:** de belofte van de slice is teruggeschroefd van *"hij ziet of het past"* naar *"hij ziet wat het kost en waar hij het zette"*; de beperking staat nu expliciet in B1 rij 4 en op de parklijst.
*Verbetering:* de duur staat op de tray-regel zelf, niet pas in het detail — anders moet hij tikken om te weten of tikken zin heeft.

**2 · Gedragswetenschapper.**
*(a)* Een vastgelegde keuze die niet wordt gehaald, wordt een schuldbewijs zodra de app er ooit op terugkomt. → **Gewijzigd:** anti-pattern 6 is aangescherpt van "geen score" naar "nooit terugkijken op een niet-gehaalde keuze", en het verlopen om middernacht is expliciet als *feature* benoemd, niet als implementatiedetail.
*(b)* Een blok in een uurraster creëert een impliciete afspraak; om 18:45 is de leegte zichtbaar. → **Gewijzigd:** C1 staat (b) verbiedt nu een te-laat-staat: het blok blijft na zijn eindtijd neutraal en de copy blijft "staat klaar".
*Verbetering:* de tier-keuze blijft omkeerbaar tot middernacht zonder enige melding over de vorige keuze.

**3 · Front-end realist.**
*(a)* Pariteit via een volledige model-refetch bij elke tier-tik = refresh-storm. → **Gewijzigd:** H1 schrijft nu één optimistische in-memory patch voor, met de respons die de pref-route al teruggeeft — geen refetch.
*(b)* Twee componenten leiden elk hun eigen tier af uit het model; dat is de derde readout die nog moet gebeuren. → **Gewijzigd:** naad-hygiëneregel 3 toegevoegd: de geldende tier wordt één keer server-side geresolved, componenten lezen alleen.
*Verbetering:* geen enkel nieuw client-event in het hele plan — alle nieuwe events zijn server-emitted, wat de synchronisatielast en de registratielast bij nul houdt.

**4 · Product-eigenaar / DPO.**
*(a)* Zonder scheiding van vensters is geen van beide effecten toe te schrijven. → **Gewijzigd:** G eist nu minstens twee weken tussen stabilisatie van F1a en de deploy van F1b, en noemt per fase wat bevroren blijft.
*(b)* Toestemming als grondslag betekent standaard-uit, dus het effect is alleen binnen de opt-in-groep meetbaar. → **Gewijzigd:** die waarschuwing staat nu expliciet onder de faseringstabel, zodat een werkende nudge niet als mislukking wordt gelezen.
*Verbetering:* geen open-tracking, alleen klikmeting — dat scheelt een verwerking en maakt registerregel 6 triviaal verdedigbaar.

---

## SELF-SCORECARD

| As | Score | Toelichting |
| --- | --- | --- |
| Helderheid van de koppel-grens | **9** | De wegval-toets is één zin, valideert alle vijftien koppelingen én verklaart de bestaande bug in de linkerkolom. |
| Trouw aan de bestaande locks | **8** | Alle twaalf gerespecteerd; één expliciete correctie op een roadmap-*regel* (bestemming van per-domein-state), plus twee gesignaleerde spanningen die er al waren (streak-regel, kolom-freeze). |
| Realisme van de bouwlast | **8** | De slice is klein en grotendeels het aansluiten van bestaande onderdelen; F1a is één component-laag plus een afgeleide constante. De onzekerheid zit in het `done: false`-gat, dat daarom vóór F1a beslist moet worden. |
| Privacy-discipline van het reminder-ontwerp | **9** | Toestemming als grondslag, geen nieuwe tabel, geen open-tracking, art. 9-motivering op het vergrendelscherm in plaats van op gevoel, en een push-voorwaarde die niet weg te onderhandelen is. |
| Meetbaarheid van pariteit vs. reminder | **8** | Verschillende events, verschillende vensters, regressiewacht ongemoeid. Aftrek voor de opt-in-groepsbias bij F1b, die je kunt corrigeren maar niet kunt wegontwerpen. |
