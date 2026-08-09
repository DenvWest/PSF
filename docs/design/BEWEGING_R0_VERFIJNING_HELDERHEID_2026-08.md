# R0-verfijning — helderheid op het beweegcheck-resultaat

**Datum** 9 augustus 2026 · **Status** spec, niet gebouwd · **Scope** taal, meetlat, routing
**Prebuild** [beweging-checkin-verfijning-r0-prebuild-2026-08.html](beweging-checkin-verfijning-r0-prebuild-2026-08.html)
**Voorganger** [beweging-checkin-readout-prebuild-r0-2026-08.html](beweging-checkin-readout-prebuild-r0-2026-08.html) · [claude-opus-beweging-r0-verfijning-helderheid-prompt.md](../cursors/claude-opus-beweging-r0-verfijning-helderheid-prompt.md)

Noordster: *iemand die de beweegcheck afrondt leest zijn eigen antwoord terug, ziet waar dat antwoord staat ten opzichte van een norm die we durven noemen, en weet welke drie dingen het platform hierna voor hem doet.*

---

## A · Diagnose testfeedback

| # | Bevinding | Huidige copy/gedrag, letterlijk | Waarom het faalt (gebruikersgevolg) | Gewenst gedrag |
| - | --------- | ------------------------------- | ----------------------------------- | -------------- |
| 1 | "Band" lekt naar buiten | `Consistentie ging van "2 weken" naar "1 week" — een band lager.` · `Cardio ging een band omlaag.` ([movement-assessment.ts:305](../../src/lib/movement-assessment.ts#L305), [:373](../../src/lib/movement-assessment.ts#L373)) | Hij kan de zin niet navertellen. Hij weet niet hoe breed een band is, hoeveel er zijn, of "een band lager" erg is — dus hij weegt de verandering niet en onthoudt er niets van | De verandering staat in zijn eigen antwoordlabels plus één richting in mensentaal |
| 2 | Geen vraag-uitleg | 11× alleen een vraag met vijf knoppen; het enige `subtitle`-veld (cardio, zone 2) wordt nergens gerenderd ([index.ts:55](../../src/data/movement-checkin/index.ts#L55) vs [MovementCapture.tsx:487-501](../../src/components/intake/MovementCapture.tsx#L487-L501)) | Hij gokt wat "matig intensief" betekent en wat het antwoord met hem doet. Gokken maakt zijn eigen antwoord onbetrouwbaar, en daarmee alles wat wij erop bouwen | Per vraag één dichte disclosure: waarom we het vragen en wat hij ermee terugkrijgt |
| 3 | Oordeel zonder meetlat | Chips `Kracht · Aandacht`, `Cardio · Redelijk` — zonder zijn antwoord, zonder norm ([MovementCapture.tsx:283-294](../../src/components/intake/MovementCapture.tsx#L283-L294)) | Hij krijgt een cijferloos rapportcijfer dat hij niet kan controleren of betwisten. Precies het omgekeerde van "de Consumentenbond van leefstijl" — en niets om aan een ander te laten zien | Eerst zijn antwoord, dan de richtlijn, dan pas een kwalificatie |
| 4 | Onduidelijk vervolg | Eén terra-knop naar het programma; daaronder ijkpunt-prompt, terug-knop, gids-CTA en Leefstijlcheck-link zonder onderlinge rangorde ([MovementCapture.tsx:311-343](../../src/components/intake/MovementCapture.tsx#L311-L343)) | Vier gelijkwaardige uitgangen lezen als een voettekst, niet als "wat nu". Hij scrolt eroverheen en het scherm eindigt zonder richting | Maximaal drie routes, één primair, met een kop die zegt dat dit het vervolg is |
| 5 | Twee terra-knoppen op één scherm | `Naar je beweegplan →` in de readout én `Terug naar beweging →` bij `from=dashboard` ([MovementCapture.tsx:313-321](../../src/components/intake/MovementCapture.tsx#L313-L321)) | Twee identiek gewogen knoppen = geen primaire actie. Wie van het dashboard komt krijgt de zwaarste affordance voor de minst waardevolle route (teruggaan) | Terug-naar-Mijn-Dag is een tekstlink in de vervolg-strip; L6 wordt weer waar |
| 6 | Bestaande engine-woorden in vaste copy | `"…houdt dat je beweegscore het hardst omlaag…"` ([index.ts:410](../../src/data/movement-checkin/index.ts#L410)) · `"…dit niveau valt sneller terug…"` ([index.ts:441](../../src/data/movement-checkin/index.ts#L441)) · `"Op de dimensies die we meten…"` ([movement-assessment.ts:170](../../src/lib/movement-assessment.ts#L170)) | Een score die daalt en een niveau dat terugvalt zijn dezelfde onzichtbare meetlat als "band". Ze staan in de implicatie-regel: de zin die hij het langst leest | Alle drie herschrijven in R0d; anders is de band-fix cosmetisch |

**Duurste als je er maar één fixt: bevinding 3.** De meetlat is de enige die de andere vijf goedkoper maakt. Zodra het eigen antwoord plus de richtlijn de dragende informatie is, heeft de delta-regel geen bandtaal meer nodig (1), heeft de kwalificatie-chip geen bestaansrecht meer (5 wordt makkelijker), en krijgt de vervolg-strip een aanleiding die niemand hoeft te verzinnen: *dit is waar je staat, dit doen we ermee* (4). Fix je alleen bandtaal, dan heb je een vriendelijker geformuleerd oordeel zonder onderbouwing — en dat is de klacht die het platform niet kan hebben.

---

## B · Delta-copy zonder "band"

Alle strings hieronder zijn eindcopy. `{}` = invulbaar. Placeholders: `{label}` (dimensie-UI-label), `{answerLabel}`, `{previousAnswerLabel}`, `{benchmarkShort}`, `{previousFocusLabel}`, `{alsoLabel}`.

### B1 · De zeven templates

| Id | Wanneer | `label` (kop) | `line` |
| -- | ------- | ------------- | ------ |
| **T1a** | eerste check, dimensie zonder richtlijn | Je nulpunt | `Dit is je eerste beweegcheck. {label} staat op "{answerLabel}" — dat is vanaf nu je vergelijkpunt.` |
| **T1b** | eerste check, dimensie mét richtlijn | Je nulpunt | `Dit is je eerste beweegcheck. {label} staat op "{answerLabel}". De richtlijn is {benchmarkShort} — daar meet je vanaf nu tegenaf.` |
| **T2** | focus vooruit, andere uitkomst dan vorige keer | Sinds je vorige meting | `{label}: je koos vorige keer "{previousAnswerLabel}", nu "{answerLabel}". Dat is een stap vooruit.` |
| **T2-tail** | idem, en hij haalt nu de richtlijn | — | ` Daarmee zit je op de richtlijn van {benchmarkShort}.` |
| **T3** | focus terug, andere uitkomst dan vorige keer | Sinds je vorige meting | `{label}: je koos vorige keer "{previousAnswerLabel}", nu "{answerLabel}". Dat is minder dan vorige keer.` |
| **T3-vervolg** | bij elke richting omlaag (zie B2) | — | `Dat is het moment om je week kleiner te maken, niet zwaarder — één moment dat je zeker haalt telt hier het zwaarst.` |
| **T4** | focus bewoog, zelfde uitkomst-groep | Sinds je vorige meting | `{label}: van "{previousAnswerLabel}" naar "{answerLabel}". Een stap {directionWord}, en de richtlijn van {benchmarkShort} is nog niet in beeld — dat hoeft nu ook niet.` |
| **T4-own** | idem, dimensie zonder richtlijn | Sinds je vorige meting | `{label}: van "{previousAnswerLabel}" naar "{answerLabel}". Een stap {directionWord} ten opzichte van jezelf.` |
| **T5** | antwoord ongewijzigd | Sinds je vorige meting | `{label} staat op hetzelfde antwoord als vorige keer — "{answerLabel}".` |
| **T6** | geen focus, niets veranderd | Sinds je vorige meting | `Je antwoorden zijn gelijk aan je vorige beweegcheck. Er springt geen deel uit dat nu aandacht vraagt.` |
| **T7** | geen focus, vorige focus opgelost | Sinds je vorige meting | `{previousFocusLabel} was vorige keer je grootste winst. Dat deel staat nu op "{answerLabel}" en er springt niets meer uit.` |

`{directionWord}` = `vooruit` \| `terug`. `{benchmarkShort}` = `twee keer per week` (kracht) \| `150 tot 300 minuten matig per week` (aeroob). Bestaat er geen richtlijn, dan wordt de `-own`-variant gebruikt en komt `{benchmarkShort}` nooit in de string.

### B2 · Twee regels die niet aan een template hangen

**De verkleinzin hangt aan de richting, niet aan T3.** In de huidige engine krijgt een daling *binnen* dezelfde groep template T4 (voorbeeld: consistentie `1 week` → `Geen`, beide ≤2). Dat is de zwaarste daling die er is en die kreeg tot nu toe de vriendelijkste regel. Regel: `direction === "down"` ⇒ T3-vervolg wordt toegevoegd, ongeacht T3 of T4.

**`winLine` — de grootste stap vooruit verdwijnt nu in de bijzin.** Wie kracht van `1x per week` naar `2x per week` brengt, is die dimensie kwijt als focus (hij is niet langer de zwakste). Zijn belangrijkste winst belandt dan in de `alsoLine`, in kleine grijze letters, terwijl de kop over iets anders gaat. Nieuwe regel, boven `line` in hetzelfde blok:

```
winLine = `Je grootste stap: {label} van "{previousAnswerLabel}" naar "{answerLabel}"{ — daarmee zit je op de richtlijn van {benchmarkShort}}.`
```

Voorwaarde: er is een niet-focus-dimensie met `direction === "up"` die van "onder de richtlijn" naar "haalt de richtlijn" gaat, óf de grootste vooruitgang in antwoordstappen. Maximaal één. De dimensie die in de `winLine` staat, wordt uit de `alsoLine` gefilterd.

### B3 · alsoLine

Maximaal twee dimensies, puur feitelijk, letterlijke antwoordlabels, gescheiden door `·`:

```
A1  `Ook veranderd — {alsoLabel}: "{previousAnswerLabel}" → "{answerLabel}".`
A2  `Ook veranderd — {alsoLabel1}: "{prev1}" → "{now1}" · {alsoLabel2}: "{prev2}" → "{now2}".`
```

Voorbeeld: `Ook veranderd — Cardio: "150-299 minuten" → "90-149 minuten".` Veranderde er niets, dan valt de regel weg; "er veranderde niets" schrijven we niet.

### B4 · "Sinds je start" wordt een voetnoot

L8: de losse sage-kaart *Sinds je start* verdwijnt als apart blok en wordt de laatste, lichtste regel ín het delta-blok, met een gestippelde scheiding erboven (`.ro-delta .start` bestaat al in de prebuild-CSS):

```
`Sinds je start: {startStatement}`
```

Eén blok minder, en de primaire vergelijking (vorige meting) staat gegarandeerd boven de secundaire.

### B5 · KILL-lijst

| Verboden | Waarom | Gebruik in plaats daarvan |
| -------- | ------ | ------------------------- |
| band, een band hoger/lager/omhoog/omlaag | onzichtbare meetlat, engine-vocabulaire | `een stap vooruit` · `minder dan vorige keer` · `hetzelfde antwoord als vorige keer` |
| niveau | idem; staat nu in de onderhouds-implicatie | de zin herformuleren zonder subject: `dit valt in een drukke week sneller terug` |
| trede, schijf, categorie, klasse | idem | het antwoordlabel zelf |
| score / punten (als iets dat stijgt of daalt) | suggereert een cijfer dat we niet tonen | `dit deel laat het meeste liggen` |
| dimensie(s) | engine-woord in gebruikerscopy | `deel` · `alles wat we meten` |
| ↑ ↓ ▲ ▼ +1 −1 | richting zonder taal; screenreader leest niets | het woord `vooruit` / `terug` |
| je scoort, je presteert | oordeel over de persoon | `je koos` · `je gaf aan` |
| verbeterd, verslechterd, achteruitgegaan | waardeoordeel op één meting | `een stap vooruit` · `minder dan vorige keer` |
| helaas, jammer, let op | verwijt in verpakking | weglaten; het feit staat er al |
| je komt X minuten tekort, je mist X | saldo-taal, verboden per BESLUIT §A.4 | `de richtlijn is X; jij zit daar nu onder` |
| gezond, ongezond, verhoogd, normaal, tekort | medische claim (staan al in de `FORBIDDEN`-test) | feitelijk antwoord + richtlijn |

---

## C · Vraag-uitleg contract

**Trigger (één vaste string voor alle 11):** `Waarom vragen we dit?`
**helpTitle-patroon:** `Wat {dimensie} hier betekent`

| Veld | helpTitle | helpBody | helpAnchor |
| ---- | --------- | -------- | ---------- |
| `MOV2_STR` | Wat kracht hier betekent | Spiermassa loopt na je veertigste terug zodra de prikkel wegvalt. Hoe váák je traint zegt daar meer over dan hoe zwaar. Op je resultaat zie je je eigen antwoord naast de richtlijn. | WHO 2020: 2× per week spierversterkend |
| `MOV2_CARD` | Wat cardio hier betekent | Dit tempo — zone 2 — traint je conditie: de basis onder je energie en herstel. We vragen minuten per week omdat de richtlijn daarin is uitgedrukt. Op je resultaat zie je jouw minuten naast die richtlijn. | Beweegrichtlijnen: 150–300 minuten matig per week |
| `MOV2_VIG` | Wat intensieve inspanning betekent | In de richtlijn telt één minuut intensief als twee minuten matig. Daarom vragen we die minuten apart. Op je resultaat tellen we ze samen met je matige minuten tot één uitkomst. | Beweegrichtlijnen: 75–150 minuten intensief per week |
| `MOV2_SIT` | Wat zitten hier betekent | Lang zitten weegt mee los van wat je verder traint. Een getalsnorm is er niet: de richtlijn zegt alleen "voorkom veel stilzitten". Op je resultaat zie je je eigen uren terug, met wat het onderzoek erover zegt. | Richtlijn: voorkom veel stilzitten — geen getalsnorm |
| `MOV2_COND` | Wat ervaren conditie hier betekent | Hoe je je conditie ervaart, bepaalt wat je durft op te bouwen. Op je resultaat zie je of dat gevoel meebeweegt met je minuten. | *null* — geen norm; dit is jouw eigen ijkpunt |
| `RCV_FEEL` | Wat herstel hier betekent | Deze vraag gaat over vandaag, niet over je maand. Hij bepaalt of we vandaag een lichtere of zwaardere sessie voorstellen. Op je resultaat staat hij apart, los van je beweegbeeld. | *null* — geen norm; dit is jouw eigen ijkpunt |
| `MOV2_PAIN` | Wat klachten hier betekent | We vragen dit om je plan aan te passen, niet om iets vast te stellen. Klachten sturen de zwaarte van wat we voorstellen. Op je resultaat lees je hem terug als aandachtspunt, nooit als oordeel. | *null* — geen norm; dit is jouw eigen ijkpunt |
| `MOV2_MOB` | Wat mobiliteit hier betekent | Bukken, reiken en draaien bepalen hoeveel je van de rest kunt doen. Voor soepelheid bestaat geen norm — je eigen antwoord is het vergelijkpunt. Op je resultaat zie je hem terug tussen je andere metingen. | *null* — geen norm; dit is jouw eigen ijkpunt |
| `MOV2_FUNC` | Wat belastbaarheid hier betekent | Traplopen is een alledaagse test die je dagelijks functioneren vaak beter voorspelt dan één sportgetal. Op je resultaat zie je of dit meebeweegt met je conditie. | *null* — geen norm; dit is jouw eigen ijkpunt |
| `MOV2_CONSIST` | Wat consistentie hier betekent | Herhaling voorspelt resultaat sterker dan de zwaarte van één sessie. We vragen weken, niet uren, omdat volhouden hier de variabele is. Op je resultaat bepaalt dit of we je week verkleinen of uitbreiden. | *null* — geen norm; dit is jouw eigen ijkpunt |
| `MOV2_MOTIV` | Wat motivatie hier betekent | Motivatie bepaalt de grootte van de stap die we voorstellen, niet of je iets fout doet. Een eerlijk laag antwoord levert een kleiner en haalbaarder plan op. Op je resultaat staat hij nooit als oordeel. | *null* — geen norm; dit is jouw eigen ijkpunt |

**UI-patroon.** De disclosure staat **onder de vijf antwoordknoppen**, niet ertussen of erboven. Reden op 375px: de knoppenkolom begint op ~340px en loopt tot ~640px — precies het duimbereik. Een disclosure die opent bóven de knoppen verschuift die kolom onder de duim terwijl hij al beweegt: misklikken op de verkeerde antwoordoptie, en dat vervuilt de meting die we juist willen verbeteren. Onder de knoppen verschuift openen niets wat aangeraakt gaat worden, en de trigger zelf ligt in de makkelijkste duimzone. Prijs: wie meteen antwoordt, ziet hem niet. Dat is akkoord — L13 maakt de uitleg opt-in, niet verplicht.

**Element.** Geen `<details>/<summary>` maar `<button aria-expanded aria-controls>` + een `<div role="region">`. Reden: `<details>` publiceert geen `aria-expanded` (K vereist dat expliciet), en de summary-marker is in Safari niet betrouwbaar weg te stylen. Trigger-rij minimaal 44px hoog, volle breedte, tekstgewicht — geen knop-vlak, zodat hij nooit met een antwoord wordt verward.

**Wat er niet in mag.** Geen groepsgrenzen ("1 en 2 tellen als aandacht"), geen "hiermee scoor je hoger", geen voorbeeld dat het gewenste antwoord verklapt ("de meeste mannen zitten hier op 2x per week"), geen tussenstand, geen voorspelling van het resultaat.

**Hergebruik cardio-subtitle.** De bestaande `subtitle` ("Dit tempo (zone 2) traint je conditie…") **wordt helpBody** en het `subtitle`-veld verdwijnt uit `MovementQuestion`. Reden: de definitie van "matig intensief" staat al in de vraag zelf ("praten lukt, zingen niet"); de zone 2-zin is geen definitie maar een antwoord op *waarom vragen we dit*. En één permanent zichtbare toelichting bij één van elf vragen suggereert dat de andere tien geen uitleg nodig hebben.

**Meetpunt.** `movement_checkin_question_help_opened { field }` — zie G.

---

## D · Feitelijke meting-readout

### D1 · Data-contract

```ts
type MovementFactRowKey = MovementDimensionKey | "aeroob";

type MovementFactRow = {
  dimension: MovementFactRowKey;
  answerLabel: string;            // letterlijk het gekozen label, samengesteld bij 'aeroob'
  benchmarkLabel: string | null;  // "Richtlijn: 150–300 minuten matig per week"
  benchmarkSource: string | null; // "WHO 2020 · Beweegrichtlijnen 2017"
  status: "below" | "near" | "meets" | "own";
  whyLine: string;                // max 12 woorden, status-afhankelijk
  footnote: string | null;        // alleen waar bron ≠ richtlijn (zitten) of een rekenregel geldt (aeroob)
};
```

Twee afwijkingen van het contract in de opdracht, allebei bewust:

1. **`MovementFactRowKey` in plaats van `MovementDimensionKey`.** De aerobe rij vat cardio en intensief samen (D3) en heeft dus geen bestaande dimensiesleutel. De alternatieven — de rij op `conditie` plakken, of D3 laten vallen — leveren een sleutel op die liegt of twee gaten waar er één is.
2. **`footnote` toegevoegd.** Zonder dat veld kan de zitten-rij niet eerlijk zijn: het onderscheid tussen "richtlijn" en "cohortonderzoek" past niet in twaalf woorden `whyLine`, en dat onderscheid is precies wat een vergelijkingsplatform moet maken.

**Statuslabels in de UI:** `below` → *Onder de richtlijn* · `near` → *Bijna op de richtlijn* · `meets` → *Haalt de richtlijn* · `own` → *Jouw ijkpunt*.
**Volgorde:** focus-rij eerst, daarna de richtlijn-rijen (aeroob, kracht), daarna zitten, daarna de eigen-ijkpunt-rijen in vragenvolgorde. **Standaard zichtbaar: vier rijen.** De rest achter één toggle.

### D2 · Mapping per dimensie

| Dimensie | Richtlijn? | benchmarkLabel | Bron | Status bij 5 / 4 / 3 / 2 / 1 |
| -------- | ---------- | -------------- | ---- | ---------------------------- |
| **kracht** | ja | Richtlijn: 2× per week krachttraining | WHO 2020 | meets · meets · near · below · below |
| **conditie** (cardio) | ja, maar samengevoegd | *gaat op in de aerobe rij* | Beweegrichtlijnen 2017 / WHO 2020 | geen eigen status — zie D3 |
| **intensiteit** | ja, maar samengevoegd | *gaat op in de aerobe rij* | idem | geen eigen status — zie D3 |
| **aeroob** (samengesteld) | ja | Richtlijn: 150–300 minuten matig per week, of 75–150 minuten intensief | WHO 2020 · Beweegrichtlijnen 2017 | volgens de tabel in D3 |
| **zitten** | nee — kwalitatief | Richtlijn: voorkom veel stilzitten — geen getalsnorm | WHO 2020; de 8-uursgrens komt uit cohortonderzoek | own · own · own · own · own |
| **conditie_ervaren** | nee | null | null | own ×5 |
| **herstel** | nee | null | null | **niet in de tabel** — moderator-blok |
| **klachten** | nee | null | null | **niet in de tabel** — moderator-blok; nooit `below` |
| **mobiliteit** | nee | null | null | own ×5 |
| **belastbaarheid** | nee | null | null | own ×5 |
| **consistentie** | nee | null | null | own ×5 |
| **motivatie** | nee | null | null | own ×5, en nooit bij de standaard vier |

**Zitten, eerlijk opgelost.** De rij toont nooit een status-oordeel, want er is geen norm om aan te toetsen. `benchmarkLabel` = `Richtlijn: voorkom veel stilzitten — geen getalsnorm`; `footnote` = `De grens van ongeveer 8 uur per dag komt uit cohortonderzoek naar zitgedrag, niet uit een richtlijn.` Zo staat het feit er (en het weegt), maar we verkopen cohortonderzoek niet als norm. Dat onderscheid maken is exact wat het platform belooft.

**Herstel en klachten horen niet in deze tabel.** Drie argumenten. (1) Meetvenster: alle andere rijen gaan over een week of maand, deze twee over vandaag — naast elkaar zetten nodigt uit tot een vergelijking die niet bestaat. (2) Rol: het zijn moderatoren, ze sturen de zwaarte van vandaag, niet waar je winst zit. (3) Bij klachten zou elke status een medische claim zijn — `below` op "Heb je klachten?" is een diagnose, en die geven we niet. Ze blijven in het bestaande blok *Herstel & klachten*, dat in de nieuwe stack direct ná de meting komt en vóór de vervolg-strip (zie J).

### D3 · Aerobe equivalentie — één gecombineerde rij

**Besluit: één rij, "Cardio en intensief samen".** WHO kent één aerobe norm met twee valuta's; twee losse rijen zouden iemand met 150–299 matige minuten en géén intensieve minuten twee keer `below` tonen terwijl hij de norm haalt. Dat is niet streng, dat is fout.

**Rekenregel — ondergrenzen, nooit middens.** Elk antwoordbereik telt met zijn ondergrens, zodat de uitkomst nooit ruimer is dan wat hij aanklikte:

| Antwoord | matig (`MOV2_CARD`) | intensief (`MOV2_VIG`) |
| -------- | ------------------- | ---------------------- |
| 5 | 300 | 150 |
| 4 | 150 | 75 |
| 3 | 90 | 30 |
| 2 | 30 | 0 |
| 1 | 0 | 0 |

`equivalent = matigMin + 2 × intensiefMin` → `meets` bij ≥ 150 · `near` bij 90–149 · `below` bij < 150 en < 90.

Steekproef: 150–299 matig + "niet" intensief = 150 → *meets* (het geval uit de opdracht). 90–149 matig + 30–74 intensief = 150 → *meets*. 30–89 + <30 = 30 → *below*. 90–149 + niets = 90 → *near*.

**Het getal wordt nooit getoond.** De rij toont beide antwoordlabels letterlijk (`90-149 minuten matig · 30-74 minuten intensief`) en één status. `footnote` = `In de richtlijn telt één minuut intensief als twee minuten matig — daarom staan ze hier samen.` Zo is de rekenregel controleerbaar zonder schijnprecisie.

Prijs van dit besluit: wie veel wandelt en nooit iets pittigs doet, ziet niet dat intensiteit apart ontbreekt. Dat is akkoord — de richtlijn vraagt het ook niet, en het programma (L1) is de plek waar intensiteit als keuze terugkomt.

### D4 · Copy bij `below`

Regel: feit + kans in één regel. Nooit een saldo ("je komt X tekort"), nooit een verwijt, nooit een gevolg voor de gezondheid.

Goed:
1. `Richtlijn is 2× per week; jij zit daar nu onder. Eén vast moment brengt dit binnen bereik.`
2. `Onder de richtlijn — hier levert hetzelfde kwartier meer op dan bij de andere delen.`
3. `Nog niet op de richtlijn. Dit is het deel waar je nu het meeste laat liggen.`

Afgekeurd:
1. ~~`Je komt 90 minuten per week tekort op de richtlijn.`~~ — saldo-taal, en "tekort" staat al op de `FORBIDDEN`-lijst in de tests.
2. ~~`Je haalt de beweegrichtlijn niet — dat verhoogt je risico op hart- en vaatziekten.`~~ — verwijt plus medische claim; L9.

### D5 · De elf chips verdwijnen

**Besluit: de chip-rij *Hoe je nu beweegt* wordt geschrapt en niet vervangen.** De feitenrijen nemen de functie over: dezelfde dimensies, maar met het antwoord vóór de kwalificatie (L12). Waar een richtlijn bestaat zegt de statustag het preciezer dan *Aandacht/Redelijk/Sterk*; waar er geen richtlijn is, is het antwoord zelf de informatie en is een kwalificatie een verzonnen oordeel — precies bevinding 3.

Wat we opgeven: het "compleet beeld"-gevoel van elf chips in één blik. Dat komt terug via *Toon alle metingen* (acht rijen: aeroob, kracht, zitten, ervaren conditie, mobiliteit, belastbaarheid, consistentie, motivatie — herstel en klachten staan in het moderator-blok) en via Voortgang.

Boven de vouw op 375px (~640px): de kop, het complete readout-blok inclusief de terra-knop, de kop van het meetblok en de eerste feitenrij — dus zijn belangrijkste antwoord mét richtlijn. De overige rijen en de vervolg-strip komen bij de eerste scrollbeweging.

---

## E · Vervolg-routing

### E0 · Voor/na van alle uitgangen

| Uitgang | Nu | Na deze ronde | Reden |
| ------- | -- | ------------- | ----- |
| Primaire CTA programma (terra) | in de readout | **blijft** | L6/L7 — de enige knop, identiek op beide surfaces |
| Ijkpunt-prompt (`DomeinIjkpuntCheckPrompt`) | los blok onder de chips | **verhuist** naar Voortgang › Beweging | Een ijkpunt kiezen is een terugkeer-handeling, geen eerste-resultaat-handeling; op intake concurreert hij met de enige route die er nu toe doet |
| Terug naar dashboard (terra-knop, `from=dashboard`) | tweede terra-knop onderaan | **verhuist** naar de strip als tertiaire tekstlink | Twee terra-knoppen = geen primaire actie (bevinding 5) |
| Gids-CTA `/gids/beweging` | knop in het footer-blok | **blijft** als de enige footer-link | Het e-maillus-kanaal; blijft binnen het budget als 1 footer-link |
| Leefstijlcheck-link `/intake` | fine-print in de footer | **valt weg** | Wie hier komt heeft per definitie al een intake-sessie — de API geeft anders 401 ([route.ts](../../src/app/api/intake/movement-checkin/route.ts)). Een link naar iets wat je al hebt gedaan is ruis |
| Voortgang-route | bestaat niet | **nieuw**, secundair | Het antwoord op "en verder?" zonder een product te noemen (L4) |

**Totaal na deze ronde:** 1 terra-CTA + 3 vervolg-links (programma-herhaling, Voortgang, Mijn Dag) + 1 footer-link = **5, waarvan 4 unieke bestemmingen**. Was: 5 uitgangen zonder rangorde. ✅ L15.

### E1 · De drie routes

| Route | Copy | Hint (≤12 woorden) | Wanneer zichtbaar |
| ----- | ---- | ------------------ | ----------------- |
| **Programma** — primair | terra-knop `Naar je beweegplan →` in de readout; herhaald als eerste tekstlink in de strip `Naar je beweegplan ›` | `Daar staat wat je deze week doet.` | Altijd. `/dashboard?tab=vandaag&kompas=beweging&open=programma&focus={dim}` ([buildMovementRoutingHref](../../src/lib/dashboard-url.ts#L124)) |
| **Voortgang** — secundair | `Bekijk je volledige beeld ›` | `Al je metingen bij elkaar, met wat erna komt.` | Altijd, behalve in strip-variant S2 |
| **Mijn Dag** — tertiair | `Terug naar Mijn Dag ›` | `Je meting is opgeslagen; je dag staat er nog.` | Alleen bij `from=dashboard` |

De herhaling van de programma-route in de strip is één bestemming met twee affordances, niet twee uitgangen. Ze zijn los meetbaar via `slot` (G).

### E2 · Drie strip-varianten

Beslisregel, in deze volgorde:
1. `direction === "down"` op de focus, óf stalled-override actief → **S2**
2. eerste check (T1), óf de focus valt in de laagste antwoordgroep → **S1**
3. anders → **S3**

**S1 · "Wat er hierna gebeurt"**
> We beginnen met een week die je haalt — kleiner dan je zelf zou plannen.
> Blijft die staan, dan bouwen we hem uit. Verdieping komt pas als het ritme er is.

Routes: Programma · Voortgang (+ Mijn Dag). Geen laagnummers, geen ordinaal, geen actielijst.

**S2 · "Wat we nu doen"**
> Een mindere maand is informatie, geen oordeel.
> Je plan gaat daarom kleiner, niet zwaarder — één moment dat je zeker haalt.

Routes: Programma (+ Mijn Dag). **Geen Voortgang-link.** Dit botst met "secundair, altijd" uit E1 en dat is opzettelijk: iemand die net terugviel, sturen we niet naar een vollediger overzicht van diezelfde terugval. Eén deur, en die deur maakt zijn week kleiner.

**S3 · "Wat er hierna gebeurt"**
> Je hoeft nu niets nieuws te doen. Dit vasthouden is het werk.
> We houden je metingen bij en zeggen het als er iets verschuift.

Routes: Voortgang · Programma (+ Mijn Dag). Geen nieuwe taak, geen upsell, geen supplement.

### E3 · Wat de strip niet is

De strip zegt waar PerfectSupplement je naartoe brengt en in welke volgorde het platform zijn werk doet — het is een routekaart van het product. Wat jíj deze week doet staat op de doe-surface achter de eerste link, want daar kun je het ook veranderen; hier zou het een lijstje zijn dat niets onthoudt. Dus: geen genummerde acties (L1), geen keuzeknoppen (L2), geen productkaart of prijs (L4), geen laagnummers of piramide (L14).

---

## F · Zes states

| State | Antwoorden (nu → vorige) | Delta-template | Zichtbare feitenrijen | Strip | Routes | Deze regel staat er níét |
| ----- | ------------------------ | -------------- | --------------------- | ----- | ------ | ------------------------ |
| **F1** eerste check, focus kracht | STR 2, CARD 3, VIG 3, SIT 3, CONSIST 3, MOTIV 4 — geen vorige | **T1b** (kracht heeft een richtlijn) | Kracht `below` · Aeroob `near` · Zitten `own` · Consistentie `own` | S1 | Programma · Voortgang | geen "sinds je vorige meting", geen alsoLine, geen winLine |
| **F2** achteruitgang consistentie *(screenshot-case)* | CONSIST 2 ← 3, CARD 3 ← 4, STR 3, SIT 3, MOTIV 3 | **T3** + T3-vervolg + alsoLine (Cardio) | Consistentie `own` · Aeroob `near` · Kracht `near` · Zitten `own` | S2 | Programma · Mijn Dag | geen Voortgang-link, geen richtlijn bij consistentie, geen "je haalde je doel niet" |
| **F3** kracht 1×→2×, haalt de norm | STR 4 ← 3, CARD 3, VIG 3, SIT 3, CONSIST 4 → focus wordt **zitten** | **T5** (zitten ongewijzigd) + **winLine** (kracht) | Kracht `meets` · Aeroob `near` · Zitten `own` · Consistentie `own` | S3 | Voortgang · Programma | geen alsoLine over kracht (die staat in de winLine), geen nieuwe taak |
| **F4** alles sterk, geen focus | STR 5, CARD 5, VIG 4, SIT 4, CONSIST 5 — vorige focus was kracht | **T7** | Kracht `meets` · Aeroob `meets` · Zitten `own` · Consistentie `own` | S3 | Voortgang · Programma | geen antwoord-pil (er is geen focus), geen winst-implicatie — de onderhoudsregel staat er |
| **F5** stap binnen dezelfde groep + moe | STR 2 ← 1, CARD 4, RCV_FEEL 2, PAIN 3 | **T4** (`vooruit`) | Kracht `below` · Aeroob `meets` · Zitten `own` · Ervaren conditie `own` | S1 | Programma · Voortgang | geen verkleinzin (richting is vooruit), geen klachten-oordeel — alleen de herstel-hint |
| **F6** stalled-override | CONSIST 1 ← 2, MOTIV 2, STR 1, CARD 2, VIG 1, SIT 2 | **T4** + T3-vervolg (richting omlaag) | Consistentie `own` · Kracht `below` · Aeroob `below` · Zitten `own` | S2 | Programma · Mijn Dag | geen Voortgang-link, geen tweede taak, geen "je motivatie is laag" als oordeel |

F3 en F6 zijn de twee states die de huidige engine verkeerd zou dienen: in F3 verdwijnt de grootste winst in de bijzin, in F6 krijgt de zwaarste daling de zachtste template. B2 lost beide op.

---

## G · Meetplan

| Event | Nieuw of hergebruik | Payload | Hier lees je aan af |
| ----- | ------------------- | ------- | ------------------- |
| `movement_checkin_question_help_opened` | **nieuw** (GA4, vrije string) | `{ field }` — één keer per veld per sessie | Of de uitleg gelezen wordt, en bij welke vraag de twijfel zit. Kan niet als parameter op `movement_checkin_completed`: die vuurt alleen bij afronding en verliest dus precies de mensen die afhaakten bij een vraag die ze niet begrepen |
| `movement_checkin_fact_readout_expanded` | **nieuw** (GA4) | `{ focus_dimension }` — één keer per resultaat | Of vier rijen te weinig zijn. Blijft dit onder ~10%, dan is de standaardweergave goed en hoeft het meetblok niet te groeien |
| vervolg-kliks | **hergebruik** `movement_checkin_routing_click` | `{ target: beweging_programma \| voortgang_beweging \| mijn_dag, surface, slot: readout \| strip }` | Welke uitgang wint, in één funnel met één noemer. Een apart `followup_click`-event zou dezelfde beslissing over twee events splitsen: je kunt dan niet meer in één breakdown zien of de terra-knop of de strip de klik levert, en de vergelijking met Voortgang (dat hetzelfde event al vuurt) wordt een join in plaats van een dimensie. Huisregel gevolgd |
| `movement_checkin_completed` | **hergebruik**, één parameter erbij | `{ surface, focus_dimension, has_dimension_delta, is_recheck, strip_variant }` | Of de S2-variant een andere routekeuze oplevert dan S1/S3 — de hele hypothese achter E2 in één breakdown |
| `domain_tool.snapshot_viewed` | ongewijzigd | `{ domain, has_conclusion }` | Of de Voortgang-route daadwerkelijk tot terugkeer leidt |
| `clarityTag("movement_flow", …)` | ongewijzigd | — | Sessieopnames van afhakers per fase |

Geen PII, geen vrije tekst in payloads, geen nieuw durable `domain_event` — die lock staat.

**Meetpunt:** `movement_checkin_question_help_opened{field}` · `movement_checkin_routing_click{target,slot}` · `movement_checkin_completed{strip_variant}` · `movement_checkin_fact_readout_expanded` — hier lees je het effect af.

---

## H · Commissie

### /KRAAK AF — vijf redenen om nee te zeggen

1. **Je maakt een resultaat dat meer confronteert dan het vorige.** Drie `below`-tags met een richtlijn erbij is harder dan drie vage chips. Bij een doelgroep die zich toch al schuldig voelt over bewegen, kan dit de afhaak op het resultaatscherm verhogen — en het resultaatscherm is de laatste stap vóór de enige conversie die telt.
2. **Elf disclosures maken een check van elf vragen langer.** Elke trigger is een extra beslissing per scherm. Als 8% afhaakt op vraag 5, is elke seconde extra een risico op een check die niemand afmaakt — en een niet-afgemaakte check levert nul.
3. **Je schrapt de ijkpunt-prompt van de plek waar hij nu wordt gezien.** Op Voortgang komt hij pas in beeld als iemand terugkomt. Als de ijkpunt-conversie voor de helft van intake kwam, koop je helderheid met een feature die je zelf net hebt gebouwd.
4. **De aerobe samenvoeging verbergt een echt gat.** Wie 150 matige minuten haalt en nooit iets pittigs doet, krijgt `meets` en ziet niet dat intensiteit — de sterkste voorspeller voor VO2max na 40 — volledig ontbreekt.
5. **Vier nieuwe copy-lagen (help, feiten, winLine, strip) op één scherm is veel oppervlak voor R0.** Elke laag is een plek waar een string kan verouderen ten opzichte van de engine, en de migratie-naad in `raw_inputs` maakt dat pas zichtbaar als er al oude rijen in productie staan.

### /WELKE AANNAMES zitten er onuitgesproken in

- Dat mannen 40+ een richtlijn als houvast lezen en niet als afkeuring.
- Dat het antwoordlabel begrijpelijker is dan de kwalificatie — terwijl "30-89 minuten" ook een bucket is, alleen een zichtbare.
- Dat wie op het resultaat komt de check heeft afgemaakt; alles hier verbetert niets aan de afhaak *tijdens* de vragen.
- Dat WHO/Beweegrichtlijnen de juiste meetlat zijn voor 40+, terwijl die norm voor de hele volwassen bevolking geldt.
- Dat het samenvoegen van cardio en intensief geen bestaande verwachting breekt — terwijl `MOVEMENT_STATEMENTS.conditie` en `.intensiteit` ze al los benoemen.
- Dat de strip als vervolg gelezen wordt puur omdat hij een kop heeft.

### /PRE-MORTEM — het is zes weken later en de verfijning is mislukt

De afronding van de check is gelijk gebleven, maar de doorklik van resultaat naar programma is met een vijfde gezakt. Wat er gebeurde: het resultaatscherm werd een leesscherm. Onder de readout kwamen vier feitenrijen met richtlijnen, een blok herstel & klachten en een strip met drie routes — samen ruim twee schermlengtes tekst. De terra-knop stond nog steeds boven de vouw, maar mensen scrolden er langs om "de rest" te lezen en klikten daarna weg. In de data zag je het aan `fact_readout_expanded` (hoog, 34%) tegenover `routing_click` (laag). We hadden helderheid gebouwd en aandacht opgegeten. Bijkomend: `question_help_opened` bleef onder 4% — de elf helpteksten waren werk voor niemand, want de trigger stond onder de knoppen waar hij pas in beeld komt als je al geantwoord hebt.

### /WAT ZIE IK OVER HET HOOFD

- **De grootste winst valt buiten de kop.** Wie kracht van 1× naar 2× brengt, verliest kracht als focus; de kop gaat dan over zitten en zijn winst staat in kleine letters (F3).
- **Een daling binnen dezelfde antwoordgroep is de zwaarste daling die er is** (`1 week` → `Geen`) en krijgt in de huidige engine template T4 — de zachtste regel.
- **Drie bestaande strings schenden de nieuwe lock al**: `beweegscore … omlaag`, `dit niveau valt sneller terug`, `de dimensies die we meten` (A6). Een band-fix zonder deze drie is halve helderheid.
- **Voortgang leest bevroren strings terug** uit `raw_inputs.delta_line` — nieuwe copy geldt alleen voor nieuwe metingen (L/R0g).

### Wat er verandert — vier echte wijzigingen

| # | Aanleiding | Wijziging in het ontwerp |
| - | ---------- | ------------------------ |
| 1 | /WAT ZIE IK OVER HET HOOFD | **`winLine` toegevoegd** (B2): de grootste stap vooruit staat bovenaan in het delta-blok, ook als die dimensie geen focus meer is. En de dimensie wordt uit de alsoLine gefilterd zodat hij niet dubbel staat |
| 2 | /WAT ZIE IK OVER HET HOOFD | **De verkleinzin hangt aan `direction === "down"`, niet aan template T3** (B2), zodat F6 hem óók krijgt |
| 3 | /KRAAK AF 1 + /PRE-MORTEM | **Harde cap op het meetblok: vier rijen standaard, nooit meer.** Plus: de `below`-rijen dragen altijd de kans-variant van `whyLine` (D4), nooit alleen het oordeel. En het meetblok komt ná de volledige readout inclusief knop, zodat de primaire actie boven de vouw blijft (J) |
| 4 | /KRAAK AF 2 + /PRE-MORTEM | **Rollback-drempel voor de help vastgelegd**: zakt de afrondingsratio van de beweegcheck meer dan 5 procentpunt ten opzichte van de vier weken ervoor, dan blijft de disclosure alleen op de vier vragen met een echte richtlijn (`MOV2_STR`, `MOV2_CARD`, `MOV2_VIG`, `MOV2_SIT`) en verdwijnt hij op de zeven eigen-ijkpunt-vragen. Dat is een besluit vooraf, geen discussie achteraf |

**Weerwoord op de twee verplichte punten.**
(a) *Een richtlijn confronteert harder dan een chip.* Klopt, en dat is de bedoeling van een vergelijkingsplatform — maar confrontatie zonder uitweg is wat afhaak veroorzaakt, niet de confrontatie zelf. Daarom staat naast elke `below` een kans in dezelfde regel (D4), is er nooit een saldo, en volgt binnen één scherm de strip die zegt dat het plan kleiner wordt en niet zwaarder. Meetbaar via `routing_click`-ratio per `strip_variant`.
(b) *Uitleg verlengt de check.* Klopt qua oppervlak, niet qua handelingen: de disclosure is dicht, kost nul kliks voor wie hem niet opent, en verschuift de antwoordknoppen niet (C). De echte kost is aandacht, en die meten we — met een vooraf vastgelegde rollback (wijziging 4).

**Wat er níét verandert, en waarom.** De ijkpunt-prompt verhuist wél (E0), ondanks kraakpunt 3: op het eerste resultaat concurreert hij met de enige route die telt. Wel met een vangnet — daalt het aantal gestarte ijkpunten meer dan 30% over drie weken, dan komt hij terug als één regel ín de Voortgang-route van de strip, niet als eigen blok.

---

## I · Drie volledige resultaatschermen

### I1 · Consistentie achteruit (screenshot-case) — CONSIST 3→2, MOTIV 3, CARD 4→3, STR 3

> **Jouw beweegcheck**
> Wat je antwoorden laten zien · gemeten vandaag
>
> ---
> WAT JE BEWEEGCHECK ZEGT
>
> **Op basis van jouw antwoorden ligt jouw grootste beweegwinst bij consistentie.**
>
> `Consistentie · 1 week`
>
> Minder dan de helft van de weken gehaald — één goede week is minder waardevol dan een haalbaar, herhaalbaar ritme.
>
> SINDS JE VORIGE METING
> Consistentie: je koos vorige keer "2 weken", nu "1 week". Dat is minder dan vorige keer. Dat is het moment om je week kleiner te maken, niet zwaarder — één moment dat je zeker haalt telt hier het zwaarst.
> Ook veranderd — Cardio: "150-299 minuten" → "90-149 minuten".
> *Sinds je start: je beweegbeeld ligt iets onder je startmeting.*
>
> Zolang de weken niet gehaald worden, verandert een zwaarder programma niets — de winst zit in een kleinere week die je wél haalt.
>
> **[ Naar je beweegplan → ]**
> Daar maak je je week kleiner: hoe vaak, en waar. Wat je vandaag doet, staat er al klaar.
>
> ---
> **WAT JE ANTWOORDDE, EN WAAR DAT STAAT**
> Waar een richtlijn bestaat, staat hij erbij. De rest meet je tegen jezelf.
>
> **Consistentie** — 1 week van de afgelopen maand · *Jouw ijkpunt*
> Herhaling voorspelt resultaat sterker dan de zwaarte van één sessie.
>
> **Cardio en intensief samen** — 90-149 minuten matig · 30-74 minuten intensief · *Haalt de richtlijn*
> Richtlijn: 150–300 minuten matig per week, of 75–150 minuten intensief · WHO 2020
> In de richtlijn telt één minuut intensief als twee minuten matig — daarom staan ze hier samen.
>
> **Kracht** — 1x per week · *Bijna op de richtlijn*
> Richtlijn: 2× per week krachttraining · WHO 2020
> Eén extra vast moment per week brengt de richtlijn binnen bereik.
>
> **Zitten** — 6-8 uur per dag · *Jouw ijkpunt*
> Richtlijn: voorkom veel stilzitten — geen getalsnorm · WHO 2020
> De grens van ongeveer 8 uur per dag komt uit cohortonderzoek naar zitgedrag, niet uit een richtlijn.
>
> *Toon alle metingen*
>
> ---
> **WAT WE NU DOEN**
> Een mindere maand is informatie, geen oordeel.
> Je plan gaat daarom kleiner, niet zwaarder — één moment dat je zeker haalt.
>
> Naar je beweegplan ›
> Daar staat wat je deze week doet.
>
> Terug naar Mijn Dag ›
> Je meting is opgeslagen; je dag staat er nog.
>
> ---
> Wil je week voor week begeleid worden? Ontvang de beweeggids per e-mail.
> **[ Ontvang de beweeggids → ]**

### I2 · Eerste check, cardio laag — CARD 2, VIG 2, STR 3, SIT 3, CONSIST 3, MOB 4

> **Jouw beweegcheck**
> Wat je antwoorden laten zien · gemeten vandaag
>
> ---
> WAT JE BEWEEGCHECK ZEGT
>
> **Op basis van jouw antwoorden ligt jouw grootste beweegwinst bij cardio.**
>
> `Cardio · 30-89 minuten`
>
> Onder de 90 minuten matig intensief per week — de beweegrichtlijn ligt op 150 tot 300, en daar zit voor jou nog winst.
>
> JE NULPUNT
> Dit is je eerste beweegcheck. Cardio staat op "30-89 minuten". De richtlijn is 150 tot 300 minuten matig per week — daar meet je vanaf nu tegenaf.
>
> Cardio ligt nu het verst onder de richtlijn van 150 tot 300 minuten; daar levert hetzelfde kwartier meer op dan bij de andere delen.
>
> **[ Naar je beweegplan → ]**
> Daar stel je in waar je beweegt en hoe vaak. Wat je vandaag doet, staat er al klaar.
>
> ---
> **WAT JE ANTWOORDDE, EN WAAR DAT STAAT**
> Waar een richtlijn bestaat, staat hij erbij. De rest meet je tegen jezelf.
>
> **Cardio en intensief samen** — 30-89 minuten matig · minder dan 30 minuten intensief · *Onder de richtlijn*
> Richtlijn: 150–300 minuten matig per week, of 75–150 minuten intensief · WHO 2020
> Onder de richtlijn — hier levert hetzelfde kwartier meer op dan bij de andere delen.
> In de richtlijn telt één minuut intensief als twee minuten matig — daarom staan ze hier samen.
>
> **Kracht** — 1x per week · *Bijna op de richtlijn*
> Richtlijn: 2× per week krachttraining · WHO 2020
> Eén extra vast moment per week brengt de richtlijn binnen bereik.
>
> **Zitten** — 6-8 uur per dag · *Jouw ijkpunt*
> Richtlijn: voorkom veel stilzitten — geen getalsnorm · WHO 2020
> De grens van ongeveer 8 uur per dag komt uit cohortonderzoek naar zitgedrag, niet uit een richtlijn.
>
> **Consistentie** — 2 weken van de afgelopen maand · *Jouw ijkpunt*
> Herhaling voorspelt resultaat sterker dan de zwaarte van één sessie.
>
> *Toon alle metingen*
>
> ---
> **WAT ER HIERNA GEBEURT**
> We beginnen met een week die je haalt — kleiner dan je zelf zou plannen.
> Blijft die staan, dan bouwen we hem uit. Verdieping komt pas als het ritme er is.
>
> Naar je beweegplan ›
> Daar staat wat je deze week doet.
>
> Bekijk je volledige beeld ›
> Al je metingen bij elkaar, met wat erna komt.
>
> ---
> Wil je week voor week begeleid worden? Ontvang de beweeggids per e-mail.
> **[ Ontvang de beweeggids → ]**

### I3 · Herstel-moderator actief, focus kracht — RCV_FEEL 2, PAIN 3, STR 2 (was 1), CARD 4

> **Jouw beweegcheck**
> Wat je antwoorden laten zien · gemeten vandaag
>
> ---
> WAT JE BEWEEGCHECK ZEGT
>
> **Op basis van jouw antwoorden ligt jouw grootste beweegwinst bij kracht.**
>
> `Kracht · Minder dan 1x per week`
>
> Krachttraining schiet er nu bij in — en juist daar valt na 40 het meest te winnen.
>
> SINDS JE VORIGE METING
> Kracht: van "Nooit" naar "Minder dan 1x per week". Een stap vooruit, en de richtlijn van twee keer per week is nog niet in beeld — dat hoeft nu ook niet.
>
> Zolang kracht onder één keer per week blijft, is dit het deel dat het meeste laat liggen — meer wandelen vult het niet op.
>
> **[ Naar je beweegplan → ]**
> Daar stel je in waar je beweegt en hoe vaak. Wat je vandaag doet, staat er al klaar.
>
> ---
> **WAT JE ANTWOORDDE, EN WAAR DAT STAAT**
> Waar een richtlijn bestaat, staat hij erbij. De rest meet je tegen jezelf.
>
> **Kracht** — Minder dan 1x per week · *Onder de richtlijn*
> Richtlijn: 2× per week krachttraining · WHO 2020
> Richtlijn is 2× per week; jij zit daar nu onder. Eén vast moment brengt dit binnen bereik.
>
> **Cardio en intensief samen** — 150-299 minuten matig · minder dan 30 minuten intensief · *Haalt de richtlijn*
> Richtlijn: 150–300 minuten matig per week, of 75–150 minuten intensief · WHO 2020
> In de richtlijn telt één minuut intensief als twee minuten matig — daarom staan ze hier samen.
>
> **Zitten** — 6-8 uur per dag · *Jouw ijkpunt*
> Richtlijn: voorkom veel stilzitten — geen getalsnorm · WHO 2020
> De grens van ongeveer 8 uur per dag komt uit cohortonderzoek naar zitgedrag, niet uit een richtlijn.
>
> **Ervaren conditie** — Matig · *Jouw ijkpunt*
> Je gevoel over je conditie stuurt wat je durft op te bouwen.
>
> *Toon alle metingen*
>
> ---
> HERSTEL & KLACHTEN
> Je voelt je vandaag niet hersteld. Een rustige dag of een korte wandeling past nu beter dan een zware sessie.
>
> ---
> **WAT ER HIERNA GEBEURT**
> We beginnen met een week die je haalt — kleiner dan je zelf zou plannen.
> Blijft die staan, dan bouwen we hem uit. Verdieping komt pas als het ritme er is.
>
> Naar je beweegplan ›
> Daar staat wat je deze week doet.
>
> Bekijk je volledige beeld ›
> Al je metingen bij elkaar, met wat erna komt.
>
> ---
> Wil je week voor week begeleid worden? Ontvang de beweeggids per e-mail.
> **[ Ontvang de beweeggids → ]**

---

## J · Layout 375px

| # | Blok | Hoogte | Cumulatief |
| - | ---- | ------ | ---------- |
| 1 | `<h1>` Jouw beweegcheck + subkop | 84px | 84 |
| 2 | Readout: eyebrow + headline (2 regels) | 94px | 178 |
| 3 | Readout: antwoord-pil | 40px | 218 |
| 4 | Readout: statement (3 regels) | 74px | 292 |
| 5 | Readout: delta-blok (winLine? + line + follow + also + start) | 118px | 410 |
| 6 | Readout: implicatie (2 regels) | 52px | 462 |
| 7 | Readout: **terra-knop 46px** + hint | 92px | 554 |
| 8 | Meetblok: kop + introregel | 54px | 608 |
| 9 | Feitenrij 1 (focus) | 76px | 684 |
| — | **▬▬ vouw ~640px ▬▬** | | |
| 10 | Feitenrijen 2–4 | 3 × 76px | 912 |
| 11 | *Toon alle metingen* (44px tap) | 52px | 964 |
| 12 | Moderator-blok *Herstel & klachten* (alleen actief) | 96px | 1060 |
| 13 | Vervolg-strip: kop + 2 regels + 2–3 linkrijen à 56px | 210px | 1270 |
| 14 | Footer: gids-CTA | 150px | 1420 |

**Boven de vouw staat het volledige readout-blok inclusief de terra-knop, plus de kop van het meetblok en de eerste feitenrij.** Dat is de volgorde uit de noordster in één beeld: zijn antwoord, wat er veranderde, waar de winst zit, en de knop die daar iets aan doet. De eerste feitenrij die half zichtbaar begint, is de scroll-uitnodiging — hij ziet dat er een meetlat volgt zonder dat die de knop wegduwt.

**Afwijking van de voorgestelde stack:** het moderator-blok staat vóór de vervolg-strip, niet erna. Wie vandaag moe is of klachten heeft, moet dat lezen vóór hij op een route klikt — het verandert hoe hij het plan aan de andere kant leest. Achter de strip zou het een naschrift zijn.

Eén `<h1>` (*Jouw beweegcheck*); het readout-blok houdt zijn `<h2>` met `aria-labelledby`, meetblok en strip krijgen elk een eigen `<h2>`. Alle tap-targets ≥44px: de disclosure-trigger, *Toon alle metingen*, elke linkrij in de strip en de terra-knop (46px).

---

## K · HTML-prebuild

Bestand: **[beweging-checkin-verfijning-r0-prebuild-2026-08.html](beweging-checkin-verfijning-r0-prebuild-2026-08.html)** — self-contained, vanilla JS, inline CSS, alleen Google Fonts extern, geen emoji.

- Sticky chrome met twee switchers: **frame** (Q · R · V) en **staat** (F1–F6), `aria-pressed` op de actieve knop, plus een `statenote` die per combinatie uitlegt wat je ziet.
- **Frame Q** — beweegcheck-vraag: progress-strip, vraagnummer, vraag, vijf antwoordknoppen, en de disclosure *Waarom vragen we dit?* onder de knoppen, met correcte `aria-expanded` en een `role="region"`-paneel. Per staat een andere vraag (kracht · consistentie · cardio · zitten · herstel · motivatie), zodat alle vier de helpAnchor-varianten te lezen zijn.
- **Frame R** — resultaat: het bestaande `.checkin-readout` ongewijzigd van vorm, met de *Sinds je start*-voetnoot nu ín het delta-blok; daaronder het meetblok met vier rijen plus *Toon alle metingen*; geen chips (D5); daarna het moderator-blok waar actief, de vervolg-strip en de footer met één link.
- **Frame V** — de drie strip-varianten S1/S2/S3 onder elkaar, zodat de copy naast elkaar te lezen is.
- 375px telefoonframe, geen actielijst, geen keuzeknoppen, geen supplement, geen laagnummers, geen ordinaal.

---

## L · Cursor-slices

| Slice | Wat | Bestanden | Acceptatiecriterium | Afhankelijk van |
| ----- | --- | --------- | ------------------- | --------------- |
| **R0d** | Delta-copy zonder engine-taal | [movement-assessment.ts](../../src/lib/movement-assessment.ts) (`buildAlsoLine`, `buildMovementFocusDelta`, nieuw `winLine` + richting-gekoppelde verkleinzin) · [movement-checkin/index.ts](../../src/data/movement-checkin/index.ts) (`MOVEMENT_IMPLICATIONS.kracht.aandacht`, `MOVEMENT_MAINTENANCE_IMPLICATION`) · [movement-assessment.test.ts](../../src/lib/__tests__/movement-assessment.test.ts) | `FORBIDDEN` in de test uitgebreid met `band`, `niveau`, `trede`, `schijf`, `categorie`, `punten`, `beweegscore`; alle acht compliance-scenario's slagen; T3-vervolg vuurt ook bij `direction === "down"` binnen dezelfde groep (F6); `winLine` verschijnt in F3 en de dimensie staat niet dubbel in de `alsoLine` | — |
| **R0e** | Vraag-help data + UI | [movement-checkin/index.ts](../../src/data/movement-checkin/index.ts) (11× `helpTitle`/`helpBody`/`helpAnchor`, `subtitle` verwijderd) · [MovementCapture.tsx](../../src/components/intake/MovementCapture.tsx) (vraag-tak) | Alle 11 vragen hebben de drie velden, `helpAnchor: null` op de zeven zonder norm; disclosure default dicht, `aria-expanded` correct, trigger ≥44px, staat ónder de knoppen; het event vuurt één keer per veld per sessie; `subtitle` bestaat nergens meer | — |
| **R0f** | Feitelijke meting + vervolg-strip | [movement-assessment.ts](../../src/lib/movement-assessment.ts) (`buildMovementFactRows`, aerobe equivalentie, strip-variant) · nieuw `MovementFactReadout.tsx` + `MovementFollowupStrip.tsx` · [MovementCheckinReadout.tsx](../../src/components/intake/MovementCheckinReadout.tsx) (winLine + start-voetnoot in het delta-blok) · [MovementCapture.tsx](../../src/components/intake/MovementCapture.tsx) (resultaat-tak: chips weg, ijkpunt-prompt weg, Leefstijlcheck-link weg, terug-knop wordt striplink) | Vier rijen standaard, nooit meer; klachten en herstel komen nooit in de rijen voor; de aerobe rij toont beide antwoordlabels en nooit een berekend getal; het resultaat heeft precies vijf uitgangen en één terra-knop; `strip_variant` zit in `movement_checkin_completed` | R0d |
| **R0g** | Voortgang-parity + migratie-naad | [VoortgangDomeinScreen.tsx](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx) · evt. [route.ts](../../src/app/api/intake/movement-checkin/route.ts) (`raw_inputs`) | Readout identiek (L7); feitenrijen óók op Voortgang, hérberekend uit de opgeslagen antwoorden in `raw_inputs` — géén nieuw opgeslagen veld nodig; vervolg-strip is intake-only; moderator-blok op beide | R0f |

**De bestaande tests asserten de band-strings letterlijk** en moeten mee veranderen, niet omzeild worden: [`:285`](../../src/lib/__tests__/movement-assessment.test.ts#L285) `toContain("een band omhoog")`, [`:326-327`](../../src/lib/__tests__/movement-assessment.test.ts#L326-L327) `not.toContain("een band omhoog"/"een band lager")`, en [`:338`](../../src/lib/__tests__/movement-assessment.test.ts#L338) telt de max-2-regel via `alsoLine.split("ging een band")`. Die laatste wordt geteld op het nieuwe scheidingsteken ` · ` binnen de `Ook veranderd —`-regel.

**Migratie-naad (R0g).** Voortgang leest het readout-blok terug uit `intake_domain_checkin.raw_inputs` (`delta_line`, `delta_also_line`, `answer_label`, `implication_line` — [route.ts:232-247](../../src/app/api/intake/movement-checkin/route.ts#L232-L247)). Nieuwe copy geldt dus **alleen voor metingen ná de deploy**; bestaande rijen blijven "een band lager" tonen tot iemand hermeet. Besluit: **accepteren**, niet backfillen. De feitenrijen hebben er geen last van, want die worden herberekend uit de antwoorden die in dezelfde `raw_inputs` staan. Wie wil weten hoeveel rijen nog oude copy dragen, telt ze op `delta_line ILIKE '%band%'`; is dat aantal na acht weken nog relevant, dan is een eenmalige update-query van tien regels genoeg.

**Buiten deze ronde, wel een naad om te bewaken:** [beweging-advies-treden.ts:78-80](../../src/lib/beweging-advies-treden.ts#L78-L80) toont "Je beweegscore staat op 58, begonnen op 51" op Voortgang. Dat is een zichtbaar getal met een expliciete startwaarde, geen onzichtbare meetlat — het valt niet onder L11, maar het is wel het enige punt waar het woord score nog stijgt of daalt.

---

## M · Brug-contract v3.4 (spec-only)

**Van resultaat naar Voortgang.** `/dashboard?tab=voortgang&screen=beweging&from=beweegcheck`. Landingspositie: bovenaan het beweging-scherm, geen anchor-sprong. Wat hij als eerste ziet: hetzelfde readout-blok dat hij net las (L7, `variant="voortgang"` — stille link in plaats van terra-knop), daaronder de feitenrijen. `from=beweegcheck` is puur voor `domain_tool.snapshot_viewed`; het verandert niets aan de render. Geen laddercomponent, geen laagnummer, geen "stap x van y" — R2 bouwt de ladder daar, en die staat dan ónder de readout, niet ervoor.

**Wat R2 blijft:** laag 1–6, "Wat kun je hier doen?" op laag 3–6, zelf-calibratie. Op het intake-resultaat komt nooit een laagnummer — niet nu, niet later. De strip mag de ladder alleen in mensentaal benoemen ("kleiner maken · volhouden · later verdiepen") en ernaartoe linken.

**Wat R5 blijft:** inplannen via Mijn Dag. Deeplink-contract: `/dashboard?tab=vandaag&kompas=beweging&open=programma&focus={MovementFocusKey}` — de `focus`-parameter selecteert de dimensie in de programma-sheet, `open=programma` opent de sheet, en beide worden na lezing uit de URL gestript ([stripMovementRoutingParams](../../src/lib/dashboard-url.ts#L137)). Geen UI in deze ronde.

| Element | Intake-resultaat | Voortgang › Beweging | Programma-sheet |
| ------- | ---------------- | -------------------- | --------------- |
| Readout-blok (feit/delta/implicatie) | primair | primair | verboden — dubbeling |
| Terra-knop naar het programma | primair (één) | secundair (stille link) | n.v.t. |
| Feitenrijen met richtlijn | primair, vier rijen | primair, alle rijen open | verboden |
| Kwalificatie-chips | verboden | verboden | verboden |
| Moderator *Herstel & klachten* | secundair | secundair | primair (stuurt de zwaarte van vandaag) |
| Vervolg-strip | primair | verboden — dit ís de bestemming | verboden |
| Ladder laag 1–6 | verboden | primair (R2) | verboden |
| "Wat kun je hier doen?"-acties | verboden (L1) | primair op laag 3–6 (R2) | primair |
| Plek-keuze (thuis/gym/groep/coach) | verboden (L3) | verboden | primair (R1) |
| Ijkpunt-prompt | verboden vanaf deze ronde | primair | verboden |
| Supplement / vergelijk-CTA | verboden (L4) | achter twee poorten (G.1) | verboden |
| Inplannen in de agenda | verboden | verboden | primair (R5) |

---

## Buiten scope

De v3.4-ladder bouwen (R2) · de programma-sheet met vier plek-waarden (R1) · supplement- of vergelijk-CTA's op het resultaat (G.1-poorten) · `chosen_actions` persistentie (R3) · L1-hero en voorselectie (F1a-freeze) · **pulse-modus** — de losse herstelvraag krijgt geen feitenrijen, geen strip en geen help-disclosure; die flow blijft precies zoals hij is · slaap, stress en energie erven dit patroon pas nadat beweging het bewezen heeft.
