# Architectuur — De Voedingsgids (het tweede deel van de Future You-serie)

_Ontwerp, geen content. Status: architectuurvoorstel voor review. 2026-07-21. Geparkeerd — bouw uitgesteld, dashboard-cockpit heeft nu focus._

**Herkomst van dit document:** twee cloud-agent-runs (gepland voor 20-21 juli, ter automatische afronding terwijl Dennis offline was) zijn beide gecrasht op een kapot setup-script in de cloud-omgeving (`npm error ENOENT` — `package.json` niet gevonden, vóórdat Claude Code zelfs startte). Er is niets geland op de `voeding-blauwdruk`-branch. Dit document is daarom **direct in de lokale sessie geschreven**, op basis van dezelfde brief die aan de cloud-agent was meegegeven, tegen de daadwerkelijke codebase gecheckt.

Dit document spiegelt [`claude-architectuur-beweeggids-2026-07.md`](claude-architectuur-beweeggids-2026-07.md) in diepte en opzet — de Voedingsgids is het zusje van de Beweeggids, niet een nieuw ontwerp-idioom. Waar de twee van elkaar verschillen is precies opgeschreven (§3, §6).

---

## 0. De kern in drie zinnen

1. Waar standaard voedingsgidsen beginnen bij _wat mag je wel/niet eten_, begint deze gids bij _je lichaam is een gebouw dat continu onderhoud nodig heeft_ — pas als iemand voeding als bouwmateriaal ziet (niet als beloning of straf), verdwijnt de schaamte die "dieet" oproept.
2. De gids is opgebouwd rond één beeld dat blijft groeien: **je lichaam als huis in onderhoud**, gevoed door **de bankrekening-metafoor** (elke maaltijd een storting of opname) — geen documentaire-reis zoals bewegen, maar een net zo dwingende rode draad.
3. De voeding-zelf-evaluatie-lus (`/intake/voeding`, al live) is **geen bijlage maar de ontknoping**: het moment waarop "onderhoud in het algemeen" verandert in "dit is jouw onderhoudsstaat, met een concreet leefstijl-eerst-dan-supplement-pad."

---

## 1. De rode draad — de bankrekening

**Eén zin die de hele gids draagt:**

> **"Je lichaam houdt geen dagboek bij van wat je eet — het houdt een rekening bij."**

Elke maaltijd is een storting of een opname. Elke training is een investering die om bouwmateriaal vraagt. Elke nacht slaap is de rente die op je stortingen wordt bijgeschreven. Stress is een onverwachte uitgave die je reserve aanspreekt.

Deze metafoor doet drie dingen tegelijk:

- **Ze vervangt schuld door boekhouding.** Een "slechte maaltijd" is geen zonde — het is één opname op een rekening met duizenden transacties. Dat neutraliseert schaamte zonder het belang te ontkennen (WRITING_VOICE.md §2: empathisch eerst).
- **Ze maakt tijd zichtbaar.** Een rekening bewijst zich pas na maanden, niet na één maaltijd — exact de reden dat losse "goede/foute voeding"-lijstjes niet werken en frequentie-over-tijd (de bestaande voeding-lus, §8) wel.
- **Ze verbindt de vier pijlers van de Future You-serie zonder ze te vermengen** (§3): investering (bewegen), rente (slaap), onverwachte uitgave (stress) — elke gids kleurt zijn eigen regel van dezelfde rekening in, zonder elkaars territorium te betreden.

De drieslag die de emotionele boog draagt: `schaamte (dieet/verboden)` → `boekhouding (neutraal, feitelijk)` → `eigenaarschap (ik beheer mijn rekening)`.

---

## 2. Ontwerpprincipes — de wetten waar alles aan gehoorzaamt

Zes principes, evenwijdig aan de Beweeggids (§2 aldaar) maar voeding-specifiek waar het telt:

1. **Bouwmateriaal vóór verbod.** Geen enkel "vermijd dit" verschijnt vóór de lezer heeft gevoeld wat voeding wél doet — bouwen, niet straffen. Verbodslijsten zijn de reden dat vorige diëten strandden.
2. **Nooit één maaltijd, altijd de rekening.** Elke keer dat de gids een concreet voorbeeld geeft ("een groot avondeten, weinig ontbijt"), volgt binnen dezelfde ademtocht: _dit is een patroon over duizenden maaltijden, geen oordeel over deze ene_. Nooit schaamte zonder de tijdslens.
3. **Frequentie boven precisie.** Net zoals de bestaande voeding-lus bewust géén grammen-dagboek is (`PLAN_NUTRITION_SELFEVAL_LOOP.md` §"Wat bewust NIET nu"), praat de gids in frequentie ("hoe vaak komt eiwit op je bord") — nooit in calorieën of grammen. Schijnprecisie is hier net zo goed de vijand als in de meetlaag.
4. **Huis, geen encyclopedie.** Nutriënten worden nooit los opgesomd maar landen als onderdelen van één bouwwerk (§6) — de lezer bouwt mee, in plaats van een tabel te lezen.
5. **Zelfdeterminatie als motor (SDT) — gedeeld met bewegen.** Autonomie ("jij kiest welke maaltijd je aanpast"), competentie ("je voelt het verschil"), verbondenheid ("het platform herrekent met je mee"). Zelfde motor als de Beweeggids, andere vulling.
6. **Personalisatie is de ontknoping, niet de onderbreking.** De voedingscheck verschijnt niet als banner, maar op het punt waar de lezer denkt _"maar wat betekent dit voor mijn bord"_ — precies het patroon van Beweeggids §2 principe 6.

---

## 3. Positionering binnen de Future You-serie + relatie tot bewegen

**De serie (vastgesteld, systeembeslissing beweeggids §14):** één canonieke web-gids per thema, gefaseerd vanaf bewegen als sjabloon, personalisatie als moat. Voeding is het **tweede** deel:

| # | Gids | Vraag die hij beantwoordt | Metafoor-wereld | Status |
|---|---|---|---|---|
| 1 | **Beweging** | Hoe sterk blijft jouw lichaam? | het orkest / het beweeg-geactiveerde lichaam | **live** (`/beweging-na-40`, interactieve levenslijn-documentaire) |
| 2 | **Voeding** | Hoe goed onderhoud jij je lichaam? | het huis in onderhoud | **dit document — geparkeerd** |
| 3 | Slaap & Herstel | Wanneer krijgt je lichaam de kans zich aan te passen? | — | live als interactieve gids (`/gids/slaap`), architectuur niet apart gedocumenteerd |
| 4 | Stress & Balans | Wat kost je ongemerkt energie? | — | nog niet ontworpen |
| 5 | Leefstijlcheck | Hoe ziet jouw persoonlijke levenslijn eruit? | — | live, de personalisatie-motor onder alle vier |

**De expliciete brug naar bewegen** (serie-lijm, verplicht op te nemen — niet optioneel):

> _"Training zonder eiwit is een huis laten bouwen zonder stenen. Bewegen zet de bouwvakkers aan het werk — voeding levert het materiaal."_

Deze zin landt in Deel 3 (waar de gids het mechanisme van eiwit uitlegt) én terugkerend in Deel 6 (de platform-brug), als één expliciete bridge-link naar `/beweging-na-40` — dezelfde constructie als de Beweeggids' bridge-link naar de herstelgids (beweeggids §2 principe 5, §11).

**Wat voeding NIET overneemt van bewegen:** bewegen bezit prikkel/belasting/adaptatie/gedrag/starten. Voeding bezit bouwmateriaal/onderhoud/rekening/ritme. Waar bewegen "wat je doet" behandelt, behandelt voeding "waarmee je het opbouwt" — complementair, geen overlap.

---

## 4. De volledige structuur — proloog, 7 delen, epiloog

Boog, evenwijdig aan bewegen: **Proloog** (frame breken) → **Deel 1–3** (WAAROM, oplopend inzicht) → **Deel 4** (de kanteling: geen verboden eten) → **Deel 5** (de gedragsmotor) → **Deel 6** (personalisatie = platform) → **Deel 7** (starten) → **Epiloog** (identiteit/rekeninghouder).

---

### PROLOOG — "Dit is geen dieetgids"

- **Kernvraag:** _Wat als voeding niet over gewicht gaat, maar over onderhoud?_
- **Wat de lezer denkt:** "Oké — geen calorieën, geen verbodslijst. Dit is anders."
- **Emotie:** opluchting + nieuwsgierigheid.
- **Gedragsdoel:** het "voeding = afvallen = verbod = falen"-frame in 60 seconden openbreken.
- **Inhoud** _(illustratief)_: introduceert de bankrekening-metafoor; één ontnuchterend feit — de meeste mannen 40+ eten niet "slecht", ze eten **onregelmatig gestort**: te weinig, te laat, te geconcentreerd op één moment van de dag.
- **Visual:** twee rekeningoverzichten naast elkaar — "veel kleine consistente stortingen" vs. "onregelmatige stortingen, plotselinge opnames" — geen cijfers, alleen het ritme.
- **CTA:** geen. Alleen doorlezen (zelfde regel als beweeggids-proloog).

---

### DEEL 1 — "Je lichaam is een gebouw, nooit af"

- **Kernvraag:** _Waarom heeft mijn lichaam continu bouwmateriaal nodig?_
- **Wat de lezer denkt:** "Ik dacht dat eten alleen over energie ging."
- **Emotie:** verwondering.
- **Gedragsdoel:** reframe — voeding is **onderhoud**, geen brandstoftank die je vult en negeert.
- **Cluster** _(illustratief)_: cellen vernieuwen zich continu · spieren, botten en immuunsysteem hebben doorlopend bouwstenen nodig · "je bent over 7 jaar grotendeels nieuw materiaal" als openingsfeit.
- **Introductie van het huis** (§6/§7): elke categorie voeding krijgt hier voor het eerst zijn bouw-rol — eiwit=bakstenen, vitamines=gereedschap, mineralen=monteurs, vezels=schoonmaakploeg, water=transport, gezonde vetten=isolatie. Dit huis is **de terugkerende mentale kaart**, net zoals het silhouet bij bewegen.
- **Cliffhanger:** "En wat gebeurt er als het onderhoud jarenlang net iets te weinig is?"

---

### DEEL 2 — "De rekening die niemand ziet"

- **Kernvraag:** _Wat gebeurt er als ik structureel net iets te weinig stort?_
- **Wat de lezer denkt:** "Ik eet niet slecht — ik eet gewoon nooit genoeg van het juiste, op het juiste moment."
- **Emotie:** constructieve urgentie (nooit kaal alarm — zelfde regel als beweeggids §2 principe 2).
- **Gedragsdoel:** verlies-aversie zonder verlamming: een tekort dat je niet voelt, is toch een tekort.
- **Cluster** _(illustratief)_: onderhoud dat achterblijft is niet meteen zichtbaar (het huis stort niet in) — maar het stapelt: trager herstel na training, energie die eerder wegzakt, concentratie die vroeger in de middag verdwijnt. **Direct gevolgd door:** dit is omkeerbaar, en niet met een crash-dieet — met regelmaat.
- **Platform:** eerste, zachte touch — _"Weet jij hoe vaak jouw bord de basis dekt?"_ → link naar de voedingscheck, bewust licht.
- **Visual:** de "stille drift"-grafiek — geen harde vervalcurve zoals bewegen (dat zou een verboden statusclaim zijn, zie §9), maar een schematische weergave van "kleine tekorten, opgeteld over jaren" naast "kleine overschotten, opgeteld over jaren."
- **Guardrail:** geen diagnose-taal; "je basis wordt dunner", nooit "je hebt een tekort" (zie §9).
- **Cliffhanger:** "Wat doet één maaltijd dan eigenlijk, als het zo lang duurt voor je iets merkt?"

---

### DEEL 3 — "Eén dag op je bord, elk systeem" _(de climax)_

De kern van de gids — parallel aan bewegen's Deel 3, maar in plaats van één wandeling volgen we **één dag aan maaltijden** door het lichaam. Vijf clusters, elk een kamer die het huis-beeld uit Deel 1 verder inricht — en elk cluster komt **direct overeen met de vijf nutriënten die de bestaande voeding-lus al meet** (`PLAN_NUTRITION_SELFEVAL_LOOP.md` §Laag 1: eiwit, omega-3/vette vis, magnesiumbronnen, vitamine D/zon, zink). Dit is bewust geen encyclopedische aftelling van alle voedingsstoffen — alleen de vijf met een bestaand interventiepad.

- **Kernvraag:** _Hoeveel doet één goed gevulde dag werkelijk?_
- **Wat de lezer denkt:** "Ik wist niet dat dit allemaal uit hetzelfde bord komt."
- **Emotie:** oplopend inzicht.
- **Gedragsdoel:** overtuiging opbouwen vóór enige "hoe" — zelfde volgorde-principe als bewegen.

| Cluster | Bouw-rol | Orgaan → functie → leven _(illustratief, niet definitief)_ |
|---|---|---|
| **A — Eiwit** | de bakstenen | spier- en herstelbouwstof → makkelijker opstaan, sneller herstellen na training → langer zelfstandig actief blijven. **Bridge-zin naar bewegen landt hier** (§3). |
| **B — Omega-3 / vette vis** | de isolatie | celmembranen, ontstekingsbalans → helderder denken, soepelere gewrichten → scherp en beweeglijk blijven |
| **C — Magnesiumbronnen** | de monteurs | spier- en zenuwfunctie, energieoverdracht → minder nachtelijke onrust, stabielere energie → rustiger dagen, betere nachten |
| **D — Vitamine D / zon** | het gereedschap | botopbouw, immuunfunctie → sterker fundament, minder vaak ziek → grip houden op je eigen mobiliteit |
| **E — Zink** | de schoonmaakploeg | immuunfunctie, herstel → sneller weer op de been → minder uitval, meer continuïteit |

- **STEP-equivalent:** nog niet expliciet — maar (zoals bij bewegen §10 expert-verbetering) na elk cluster één micro-vraag: _"komt dit vandaag al op je bord voor?"_ — ontzag krijgt meteen een anker.
- **Platform:** subtiel — _"Benieuwd welke van deze vijf bij jou het dunst is?"_ (nog geen harde CTA).
- **Visual (flagship, zie §6):** de huis/bouwstoffen-animatie — één dag aan maaltijden die het huis vullen, kamer voor kamer.
- **Cliffhanger:** "Dit klinkt als vijf dingen om op te letten. Het is er maar één gewoonte."

---

### DEEL 4 — "Het gaat nooit om dit ene bord" _(de kanteling)_

- **Kernvraag:** _Betekent dit dat ik nooit meer normaal mag eten?_
- **Wat de lezer denkt:** "Dus één keer pizza is niet het einde van de wereld."
- **Emotie:** opluchting.
- **Gedragsdoel:** de _alles-of-niets_-overtuiging slopen ("als ik vanavond friet eet, heb ik het toch al verpest") — de dieet-killer bij mannen 40+.
- **Cluster** _(illustratief)_: je rekening rekent in duizenden transacties, niet in één; één opname verandert niets aan een gezonde rekening; wél: wat je **meestal** eet, telt. Toon-guardrail hard toepassen: nooit "suiker/pizza/snacks zijn slecht" — wel _"het gaat niet om één maaltijd, het gaat om de duizenden maaltijden die samen je toekomst bouwen."_
- **Platform:** geen — dit deel is puur reframe, geen CTA.
- **Visual:** een rekeningoverzicht met één rode transactie tussen honderden groene — visueel bewijs dat één opname het patroon niet breekt.
- **Cliffhanger:** "Als het niet om perfectie gaat — waarom lukt het dan toch zo vaak niet om het vol te houden?"

---

### DEEL 5 — "Waarom diëten stranden (en dit geen dieet is)"

- **Kernvraag:** _Waarom hield ik het de vorige keer niet vol?_
- **Wat de lezer denkt:** "Het lag niet aan mijn wilskracht — diëten zijn gebouwd om te stranden."
- **Emotie:** begrepen worden → agency.
- **Gedragsdoel:** afhankelijkheid van wilskracht vervangen door een systeem — exact het patroon van bewegen §Deel 5.
- **Cluster** _(illustratief)_: waarom strikte diëten falen (te veel tegelijk, geen ruimte voor uitzonderingen, all-or-nothing) · de mechanismen die wél werken: **habit stacking op bestaande maaltijden** (niet een nieuw eetschema, maar één bouwsteen toevoegen aan een maaltijd die je toch al eet), vaste eetmomenten in plaats van "minder eten", omgevingsontwerp (wat er in huis is, is wat je eet).
- **Platform:** nog niet — eerst het model.
- **Visual:** "motivatie is een slechte voorraadkast" (motivatie-golf vs. een systeem dat vanzelf vult) — parallel aan bewegen's motivatie-vs-systeem-visual.
- **Cliffhanger:** "Dit geldt voor 'de gemiddelde man'. Maar jouw bord is geen gemiddelde."

---

### DEEL 6 — "Jouw bord is geen gemiddelde" _(de brug naar het platform)_

- **Kernvraag:** _Wat betekent dit voor wat ík eet?_
- **Wat de lezer denkt:** "Ik wil weten welke van die vijf bouwstenen bij mij het dunst is."
- **Emotie:** herkenning + anticipatie.
- **Gedragsdoel:** lezer → gebruiker van de bestaande voedingscheck.
- **Cluster** _(illustratief)_: alles hiervoor gold "voor de mens" — jouw ritme, jouw gewoontes, jouw dunste bouwsteen is persoonlijk; personalisatie is de brug.
- **Platform: primaire integratie.** Dit is waar de gids de **al bestaande, al live voeding-zelf-evaluatie-lus** activeert (§8) — geen nieuwe bouw, alleen de instap. Toon concreet: een 3-minuten check zonder grammen-dagboek → een inname-inschatting per bouwsteen → leefstijl-eerst-dan-(EFSA-gated)-supplement-advies → bij herhaling: "je inname bewoog."
- **Herhaal hier de bridge-zin naar bewegen** (§3): _"training zonder eiwit is een huis bouwen zonder stenen."_
- **CTA: sterkste van de gids** → `/intake/voeding` (bestaande route, geen nieuwe).
- **Visual:** de platform-lijn als reis (check → inname-inschatting → advies → herhaling); een geanonimiseerd voorbeeld-resultaat.
- **Cliffhanger:** "En je eerste stap? Die ligt al bij je volgende maaltijd."

---

### DEEL 7 — "Morgen, bij je eerste maaltijd"

- **Kernvraag:** _Wat doe ik concreet, vanaf de eerstvolgende hap?_
- **Wat de lezer denkt:** "Ik hoef niet mijn hele dieet om te gooien. Eén ding erbij."
- **Emotie:** bereidheid.
- **Gedragsdoel:** implementatie-intentie (welke maaltijd, welke bouwsteen, deze week) + commitment zonder schema.
- **Inhoud** _(illustratief)_: één concrete toevoeging aan de eerstvolgende maaltijd (bijv. "begin met een eiwitbron") + het idee: week 1 = één bouwsteen toevoegen → week 2–4 = ritme → daarna = de voedingscheck als ijkpunt. Spiegelt de bestaande `nutritionPlanTemplate.phases` (`PLAN_VOEDING_EERST_YOUTUBE_FUNNEL.md` C1) die al in code leven.
- **Platform:** "je eerste stap staat al klaar" → voedingscheck-resultaat; herhaal-log-belofte (~2 weken later, sluit de lus net als bij hermeting).
- **Visual:** een korte oprit-tijdlijn (week 1 → 4) — geen sportschema, een bord dat geleidelijk voller wordt.
- **CTA:** start + herhaal-log-opt-in.

---

### EPILOOG — "Het huis dat je onderhoudt"

- **Kernvraag:** _Waarom blijf ik hierop letten, ook op drukke dagen?_
- **Wat de lezer denkt:** "Dit gaat niet over diëten. Dit gaat over wat ik in stand houd."
- **Emotie:** stille vastberadenheid.
- **Gedragsdoel:** identiteit cementeren — "ik ben iemand die zijn huis onderhoudt", niet "ik ben op dieet."
- **Cluster** _(illustratief)_: levenslange zelfstandigheid, energie om er te zijn voor wie je dierbaar is — geframed als **identiteit en toekomstig zelf**, niet als voedingsstatistiek.
- **Visual:** het huis, jaren later — niet vervallen, niet verbouwd tot iets nieuws, gewoon: onderhouden. Geen levenslijn-slider (§6 — bewust bewaard voor bewegen).
- **CTA:** zacht terug naar het dashboard / de eerstvolgende herhaal-log.

---

## 5. Waarom deze volgorde psychologisch werkt

Dezelfde motivatie-architectuur als bewegen (beweeggids §5), voeding-specifiek:

1. **Bouwmateriaal vóór verbod.** Delen 1–3 bouwen het "voeding = onderhoud"-begrip tot een piek vóór er één "vermijd dit" valt. Wie eerst een verbodslijst krijgt, voelt meteen het dieet-frame; wie eerst het _waarom_ begrijpt, kiest zelf zijn bouwstenen.
2. **Inzicht piekt in Deel 3, vlak vóór de kanteling.** De opluchting van Deel 4 ("het gaat niet om dit ene bord") landt harder omdat de lezer net vijf bouwstenen heeft gezien die er wél toe doen — groot contrast, grote opluchting.
3. **Urgentie (Deel 2) vroeg, maar nooit zonder omkeerbaarheid** en nooit met een statusclaim (§9) — de "stille drift" is zacht geframed, niet als vervalcurve.
4. **Gedragswetenschap (Deel 5) ná de feasibility (Deel 4).** Pas als de lezer gelooft dat het niet perfectie vereist, is hij ontvankelijk voor _hoe je het volhoudt_.
5. **Personalisatie (Deel 6) op het punt van maximale relevantievraag** — exact waar de bestaande voedingscheck als antwoord landt, niet als onderbreking.
6. **Identiteit als slot, niet als dieetschema.** Duurzame verandering hangt aan "ik onderhoud mijn huis", niet aan een streefgewicht.

De emotionele boog in één lijn: **opgelucht → verwonderd → alert-maar-hoopvol → opgelucht (weer, dieper) → begrepen → eigenaar → klaar → betekenisvol.**

---

## 6. De visuele handtekening — de huis/bouwstoffen-animatie

**Kritieke ontwerpbeslissing (expliciet, met onderbouwing):**

> **De Voedingsgids krijgt NIET de levenslijn-slider (leeftijd 30→85, scenario A/B) van de Beweeggids.**

De Levenslijn is de vastgestelde visuele handtekening van de Beweeggids (beweeggids §16, "leidende vorm v0.4"). Beweeggids §9 stelt expliciet dat elke gids in de serie een **eigen** visuele identiteit moet krijgen — geen twee gidsen delen hun centrale interactie. Krijgt voeding óók een leeftijd-slider met A/B-scenario's, dan worden de twee gidsen inwisselbaar: de lezer ervaart "weer die schuifbalk" in plaats van een nieuw perspectief, en de serie verwatert tot één herhaald sjabloon in plaats van vijf eigen stemmen.

**Wat de serie wél deelt** (het samenbindende element, niet het onderscheidende): het **Future You Score-dashboard** aan het eind van elke gids/check — dezelfde noemer, andere invulling per domein. Dat dashboard bestaat al in code (`MovementDashboardPreview.tsx` — "Future You Score", 0–100, een voorbeeld) en is de plek waar de gidsen elkaar ontmoeten, niet de plek waar ze zich onderscheiden.

**Voedings eigen handtekening: de huis/bouwstoffen-animatie.** _(illustratief — geen definitief ontwerp, wel de bedoeling)_

- Eén silhouet van een huis, geïntroduceerd in Deel 1, dat in Deel 3 kamer voor kamer wordt ingericht naarmate de vijf bouwstoffen-clusters passeren (eiwit=fundament/bakstenen, omega-3=isolatie, magnesium=bedrading/monteurs, vitamine D=dakconstructie/gereedschap, zink=onderhoudsploeg).
- Interactie-idee: een dag aan maaltijden "vult" het huis live — elke gekozen maaltijd in de gids-uitleg laat een kamer oplichten. Geen leeftijd-as, geen scenario A/B — een **dag**-as, niet een **decennia**-as. Dat is het onderscheidende mechanisme t.o.v. bewegen se eigen levenslijn.
- Op mobiel (375px, verplicht getest — CLAUDE.md): degradeert naar een verticale, per-kamer uitklapbare kaart, zelfde patroon als de Beweeggids-flagship op mobiel (beweeggids §10, UX-designer-kritiek).
- Aan het eind van de gids (Deel 6) versmalt het huis-beeld naar een klein pictogram naast de voedingscheck-CTA — het brugmoment waarop het algemene huis "jouw huis" wordt.

---

## 7. Schrijfstem & metafoor-wereld — het huis

Aanvulling op `WRITING_VOICE.md`, bindend voor de schrijffase, parallel aan beweeggids §15:

**1. De hoofdpersoon is de lezer, niet het bord.** Tweede persoon ("jij"). Voeding is een bondgenoot die iets levert — het _stort_, het _vult aan_, het _houdt de rekening bij_. Nooit een onderwerp waarover college wordt gegeven.

**2. Er is een tegenstander.** Niet "voeding is goed", maar "iets maakt regelmatig eten lastig". De moderne tegenstander: bezorgapps, korte lunchpauzes, avondeten als enige rustmoment — plus twee mentale tegenstanders: het idee dat _voeding = dieet = verbod_, en het alles-of-niets-denken na "één slechte dag." Introduceren in Deel 2, terugkerend t/m Deel 5.

**3. Eén metafoor-wereld: je lichaam als een huis in onderhoud.** Vervangt losse voedingsstof-opsommingen. Het huis wacht niet passief — het _vraagt_ om onderhoud, het _slijt_ zonder materiaal, het _blijft overeind_ met regelmaat. De vijf kamers/bouwrollen (§4, Deel 3) zijn de vaste kapstok.

**4. Bouwrol → functie → leven — altijd de hele route.** Nooit de nutriënt als kop.

| Niet (nutriënt) | Wel (functie → leven) |
|---|---|
| voldoende eiwitinname | sneller herstellen na training → morgen weer fit de dag in |
| omega-3-inname op peil | soepelere gewrichten → makkelijker op de grond spelen met een kleinkind |
| magnesiumrijke voeding | rustigere spieren en zenuwen → minder onrustige avonden |
| vitamine D via zon/voeding | sterker fundament → langer zelfstandig, minder kwetsbaar |
| voldoende zink | sneller weer op de been na een griepje | continuïteit in je week |

**5. Eén refrein dat meegroeit** _(illustratief)_:
> _"Je huis wacht op onderhoud."_ → _"De bakstenen kwamen deze week binnen."_ → _"De monteurs hadden hun materiaal."_ → _"Het dak hield stand."_ → _"De schoonmaakploeg deed zijn werk."_ → _"Het huis staat er, jaar na jaar."_ → **_"Dat onderhoud heet: eten wat je lichaam nodig heeft — niet meer, niet minder."_**

**6. Eén mini-openbaring per pagina.** Deel 2 bijvoorbeeld niet "structurele tekorten" (informatief), maar: _"ik dacht dat ik gewoon moe wàs — niet dat mijn bord daar al maanden aan meewerkte."_

**7. Verwondering boven bewijs, net als bewegen.** Bewijs is de ondertoon; verwondering de melodie:
> _"Terwijl jij alweer aan je vergadering denkt, is je lichaam nog uren bezig met wat je at. Het haalt eruit wat het nodig heeft. Het stuurt bouwstenen naar waar ze horen. En morgenochtend sta je op met een lichaam dat weer een stukje verder is onderhouden — of een stukje verder achterop, afhankelijk van wat er gisteren binnenkwam."_

**8. Geen ontwerpwoorden in lezerstekst.** Verboden in lezerstekst: _flagship, cluster, bridge, CTA, moat, funnel, gate, eligibility, rekening-as, meetpunt._ De lezer ziet alleen de menselijke vertaling — dezelfde regel als beweeggids §15.8.

---

## 8. Platformkoppeling — wat AL bestaat (niet herbouwen)

De gids is de **overtuigings- en instaplaag**. De meetlaag bestaat al, volledig, en is niet het onderwerp van dit document:

| Bouwsteen | Status | Bron |
|---|---|---|
| Voeding-zelf-evaluatie-lus (capture → estimate → delta → advies) | ✅ live, F0–F3 gecommit | `PLAN_NUTRITION_SELFEVAL_LOOP.md` |
| Capture-flow + route | ✅ live | `NutritionCapture`, `/api/intake/nutrition-log`, `/intake/voeding` |
| Inname-inschatting (5 nutriënten: eiwit, omega-3/vette vis, magnesium, vit D/zon, zink) | ✅ live | `nutrition-intake-estimate.ts`, `src/data/nutrition/intake-reference.ts` |
| Leefstijl-eerst-dan-EFSA-gated-supplement-advies | ✅ live | `nutrition-advice.ts` + `approved-claims.ts` + `isComparisonAllowed` |
| Delta bij herhaal-log | ✅ live | `nutrition-delta.ts` + `measurement.gap_detected` |
| YouTube-acquisitie-funnel naar `/intake/voeding` | 📐 ontworpen, nog niet gebouwd | `PLAN_VOEDING_EERST_YOUTUBE_FUNNEL.md` (Fase A–D) |
| Supplement-eligibility-gate (verberg supplement-strip zonder log) | 📐 ontworpen, nog niet gebouwd | idem, Fase B |
| Cohort-vergelijking "mannen zoals jij" | ⬜ later, volume-gated (500+) | idem F4 |

**Wat de gids toevoegt aan dit fundament:** niets in de meetlaag. De gids is de **voordeur** — hij zorgt dat een lezer die "gewoon een artikel over voeding" zocht, warm en overtuigd bij `/intake/voeding` binnenkomt, in plaats van dat de check koud als eerste contactpunt dient. Dat is exact het gat dat `PLAN_VOEDING_EERST_YOUTUBE_FUNNEL.md` beschrijft voor YouTube-verkeer — de gids is het **organische/SEO-equivalent** van diezelfde voordeur.

**Belangrijk grensbesluit:** het Healthspan-dashboard (eiwit-/groente-/vezel-/hydratatiescores) uit de oorspronkelijke pitch is een **aantrekkelijke richting, geen nieuwe scoringswaarheid.** De bestaande architectuur kent één scoringswaarheid per domein (dashboard-cockpit-SSOT, `docs/core/ROADMAP_DASHBOARD_COCKPIT.md` §8.4: "geen tweede score"). Een los "Healthspan-dashboard" met eigen deelscores zou die regel breken. In plaats daarvan: de vijf bouwstoffen-banden (`below`/`around`/`meets`, al live als `NutritionIntakeBand`) zijn de **enige** voedingsweergave — geen nieuw dashboard, wel eventueel een rijkere presentatie van wat er al is.

---

## 9. Compliance & guardrails (dwars door alle delen)

- **Inname, niet status** — de harde grens uit `PLAN_NUTRITION_SELFEVAL_LOOP.md`: _"je eiwit-inname lijkt laag t.o.v. een richtlijn"_ ✓, _"je hebt een tekort"_ ✗. Geldt voor de gids-tekst net zo hard als voor de meetlaag-templates.
- **Geen medische claims** — "adviezen, geen diagnoses" (CLAUDE.md). De "stille drift" in Deel 2 is een gedragspatroon, geen diagnose.
- **Geen grammen-dagboek / calorie-tracker** — de gids praat in frequentie en bouwstenen, nooit in cijfers die de indruk van precisie-tracking wekken.
- **Supplement-advies uitsluitend via de bestaande EFSA/`approved-claims`-poort** — de gids introduceert geen nieuw supplement-advies-mechanisme; hij verwijst naar wat `nutrition-advice.ts` al gegateerd oplevert.
- **Eén scoringswaarheid** — voeding-inname is evidence náást de domeinscore, nooit een tweede score (zie §8, grensbesluit).
- **Geen ontwerpwoorden in lezerstekst** (§7.8).
- **Mobiel-first** — getest op 375px, huis-animatie degradeert (§6).

---

## 10. Meetpunten

Volgt CLAUDE.md's meet-mandaat: elke CTA krijgt zijn event in dezelfde bouwslice, geregistreerd op de drie verplichte plekken (`src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist `src/app/api/intake/events/route.ts`). **Hergebruik eerst** — de meetlaag bestaat al grotendeels:

| Moment | Event | Status |
|---|---|---|
| Deel 2 zachte check-touch | `guide_nutrition_check_soft` (nieuw, spiegelt `guide_movement_check_soft`) | ➕ te registreren |
| Deel 3 micro-vraag per cluster | `guide_nutrition_micro_action` (nieuw, spiegelt `guide_movement_micro_action`) | ➕ te registreren |
| Deel 6 primaire CTA → voedingscheck | **hergebruik** bestaand instap-event `intake.cta_to_nutrition_log` | ✅ bestaat al |
| Voedingscheck voltooid | **hergebruik** `nutrition_log_completed` | ✅ bestaat al (YouTube-funnelplan) |
| Gap gedetecteerd | **hergebruik** `measurement.gap_detected` (anoniem payload) | ✅ bestaat al |
| Deel 7 start + herhaal-log-opt-in | `guide_nutrition_start` (nieuw) + bestaand herhaal-log-mechanisme | ➕ te registreren |

**Primaire funnel-KPI:** Deel 6 CTA → voedingscheck-start → `nutrition_log_completed`. **Meetpunt: `guide_nutrition_check_soft`, `guide_nutrition_micro_action`, `guide_nutrition_start` — hier lees je af of de gids lezers daadwerkelijk in de bestaande voeding-lus brengt, zonder dat er iets nieuws in die lus zelf gebouwd hoeft te worden.**

---

## 11. Hoe dit verschilt van standaard voedingsgidsen

| Standaard voedingsgids | Deze gids |
|---|---|
| Begint bij wat je wel/niet mag eten | Begint bij _je lichaam is een gebouw dat onderhoud nodig heeft_ |
| Calorieën, grammen, macro-tabellen | Bouwstenen, frequentie, één rekening-metafoor |
| Motivatie via schuld ("dat was fout") | Motivatie via boekhouding → eigenaarschap |
| Verbodslijst als kern | Vijf bouwstenen die je bord versterken |
| Alles-of-niets ("op dieet" vs. "gefaald") | Eén opname breekt de rekening niet |
| Generiek voedingsschema | Personalisatie via de bestaande voedingscheck |
| Eindigt bij een streefgewicht | Eindigt bij identiteit: iemand die zijn huis onderhoudt |
| Losse encyclopedie-pagina | Levende koppeling: gids → voedingscheck → advies → herhaal-log |

---

## 12. Open besluiten

1. **Doelgroep: 35–65 gender-neutraal vs. "mannen 40+".** Exact dezelfde open knoop als beweeggids §16 — en die zou voor de hele serie in één keer genomen moeten worden, niet per gids apart (zo eerder geadviseerd). Twee opties, geen dwingende keuze hier:
   - **Optie A — mannen 40+ (huidige CLAUDE.md-positionering).** Consistent met de rest van het platform; scherpere copy mogelijk ("jouw kleinkind", "je krachttraining").
   - **Optie B — 35–65 gender-neutraal.** Groter bereik, sluit aan bij de bewegingsgids-v0.4-richting; vraagt een herziening van de CLAUDE.md-positionering die verder reikt dan deze ene gids.
   - **Aanbeveling (niet-bindend):** wacht met deze knoop tot de Beweeggids-v0.4 doelgroep-keuze gemaakt is — dat precedent zou hier automatisch moeten doorwerken, om te voorkomen dat de vijf gidsen elk hun eigen doelgroep-taal krijgen.
2. **Healthspan-dashboard als aparte visualisatie (eiwit-/groente-/vezelscores) — bewust NIET aanbevolen als nieuw scoringsmechanisme** (zie §8). Als Dennis toch een rijkere voedingsweergave wil, moet die op de bestaande `NutritionIntakeBand`-structuur worden gebouwd, niet als nieuwe parallelle score.
3. **Timing van de huis-animatie als interactief artefact vs. statische illustratie.** De Beweeggids kreeg een interactief Claude-artefact ter verkenning (v0.3 + v0.4) vóórdat er werd gebouwd. Wil Dennis hetzelfde voor het huis-beeld, of volstaat een ontwerp-doc zoals dit totdat de bouwvolgorde (§13) daadwerkelijk aan de beurt is?

---

## 13. Bouwvolgorde (ná akkoord, achter de huidige dashboard-FREEZE)

**Deze gids wordt NIET gebouwd vóór:**
1. De Beweeggids zijn eigen bewijs heeft geleverd (leest men door tot Deel 4? converteert Deel 6? — beweeggids §14, voorwaarde 3, nog niet gemeten omdat de gids net live is).
2. De huidige dashboard-cockpit-prioriteiten (`docs/core/ROADMAP_DASHBOARD_COCKPIT.md`) hun P0/P1-brokken hebben afgerond — dit document is expliciet geparkeerd totdat die focus verschuift.

**Zodra akkoord + juiste timing, voorgestelde plakken** (zelfde leverpatroon als de rest van het platform):

1. **Skelet + Deel 1–3** — het huis-beeld introduceren, de vijf bouwstoffen-clusters, de huis/bouwstoffen-animatie (flagship).
2. **Deel 4–5** — de kanteling (geen verboden eten) + de gedragsmotor (habit stacking op bestaande maaltijden).
3. **Deel 6–7 + Epiloog** — de platform-brug (activeert de bestaande `/intake/voeding`-lus, géén nieuwe bouw) + het startplan + identiteit. Hier landen de nieuwe events (§10).
4. **Content-hergebruik, geen herbouw:** `nutritionPlanTemplate.phases`, de vijf `NutrientId`'s uit `intake-reference.ts`, de bestaande `NutritionIntakeItem`/`NutritionIntakeBand`-weergave, en — indien Fase A/B van `PLAN_VOEDING_EERST_YOUTUBE_FUNNEL.md` al gebouwd is — dezelfde landingsroute en UTM-structuur voor gids-verkeer.

---

*Opgesteld: 21 juli 2026, lokaal geschreven na twee mislukte cloud-agent-pogingen (infra-fout, geen inhoudelijk probleem met de brief). Spiegelt de Beweeggids-architectuur (`claude-architectuur-beweeggids-2026-07.md`) in diepte en methode. Geparkeerd tot dashboard-cockpit-focus verschuift.*
