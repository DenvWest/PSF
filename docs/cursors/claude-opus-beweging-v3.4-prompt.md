# Prompt — Beweging v3.4: het programma wordt instelbaar, de ladder wordt bewoonbaar

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (nieuw gesprek, Artifacts aan).
> **Verplichte bijlage:** [`beweging-keuze-consumentenbond-prebuild-v3.3-2026-08.html`](../design/beweging-keuze-consumentenbond-prebuild-v3.3-2026-08.html) — Opus moet **uitbreiden**, niet opnieuw uitvinden.
> **Output:** één self-contained HTML-prebuild.
> **Doelbestand na review:** `docs/design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html`
> **Opgesteld:** 8 augustus 2026.

---

## Plaats in de reeks

| Doc | Relatie |
| --- | --- |
| [`beweging-keuze-consumentenbond-prebuild-v3.3-2026-08.html`](../design/beweging-keuze-consumentenbond-prebuild-v3.3-2026-08.html) | **Basis** — alle schermen, tokens, copy-stem, locks v3→v3.3 |
| [`claude-opus-beweging-v3.3-wederprompt.md`](claude-opus-beweging-v3.3-wederprompt.md) | Wat v3.3 lockte, en de twee bewuste afwijkingen |
| [`BESLUIT_BEWEGING_PRODUCT_EN_IA.md`](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md) | §A.4 verboden · §C.2 naamgeving + verbodslijst · §E.1 programma-sheet · §G.1 advies-poort |
| [`BESLUIT_FIT_PREFS.md`](../design/BESLUIT_FIT_PREFS.md) | L1 dual readout · L3 fit-prefs ≤5 dimensies · L4 niet in dag-0 · L6 ladder-split · L7 moeite ná voorstel |
| [`BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md`](../plan/BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md) | §2.2 vijf beweegvormen · §2.4–2.6 sport = dekkingsprofiel · **§2.7 harde grens: welk veld stuurt wat** |
| Dit document | **Nieuwe lock v3.4** — programma echt instelbaar, laag 2 rijk, laag 3–6 bewoonbaar op Voortgang |

---

## Wat v3.4 toevoegt t.o.v. v3.3 (samenvatting voor reviewer)

1. **Je programma krijgt echte besturingen**: plek + begeleiding (vierde chip *met coach of PT*), frequentie (**1× is instelbaar**), duur met **eigen minuten**.
2. **Laag 2 wordt rijk** — kracht (frequentie · niveau · plek) én basisconditie (gecureerd raster van bewegingsvormen), allebei instelbaar in *Je programma*.
3. **Eén `programProfile`-object** stuurt kop, sublead, dagbeeld én de laag-panelen op Voortgang. Wat je instelt, lees je terug op je ladder.
4. **Zelf-calibratie tot laag 5** — "Ik zit al verder op mijn ladder" met laag + ervaringsniveau. Laag 6 blijft ongrijpbaar voor een vinkje.
5. **Laag 3–6 krijgen acties op Voortgang** — "Wat kun je hier doen?", max 3 per laag. De brug blijft laag 1–3.
6. **Laag 5 krijgt een Bond-kader**: bodytec/EMS, cryo, HRV — marginale winst, ghost-kaarten, nooit een dag-actie.
7. **Laag 6 krijgt twee blokken**: eerst voedingscheck, daarna pas wat de meting zegt — leeftijd-illustratief, alleen op Voortgang, altijd gated.

---

## Twee gerichte afwijkingen van het reviewplan — met reden

**A. Het conditie-raster is één raster met twéé groepen, niet één vlakke lijst van twaalf.**
[`BLAUWDRUK §2.7`](../plan/BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md) lockt dat `sports[]` **de copy stuurt en nooit het programma**, terwijl locatie en beweegvorm dat wél doen. Wandelen/fietsen/zwemmen/roeien/hardlopen zijn conditie-**vormen** (die programmeren je conditie-regel); tennis/voetbal/padel/yoga zijn **sporten** (die duiden je gat). Ze in één vlakke lijst zetten herintroduceert precies de veldvermenging die v3.3 bij *plek* al opruimde. Eén raster, twee koppen, twee velden — visueel wat gevraagd is, structureel wat gelockt is.

**B. Laag 6 is niet zelf te verklaren.**
Het plan biedt in de zelf-calibratie laag 3·4·5·6 aan. Laag 6 is gegate op **meting** ([`BESLUIT §G.1`](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md)), niet op ervaring — een vinkje dat supplementen ontgrendelt is precies de deur die dat besluit dichtdeed. De optie staat er wél, met een eerlijk antwoord: *"Laag 6 zet je niet zelf — die gaat open op je voedingscheck en je hertest. Wat je nu doet, zetten we op laag 5."*

---

## Gebruiksinstructie

1. Open Claude Opus, nieuw gesprek.
2. Plak de v3.3-HTML als bijlage (of upload het bestand).
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Review in browser op **375px** (primair) en ≥1280px (rail).
5. Opslaan als `docs/design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html`.

---

## Prompt (copy-paste)

```text
═══════════════════════════════════════════════════════════════════════════════
ROL
═══════════════════════════════════════════════════════════════════════════════

Je bent Senior product designer + evidence editor voor PerfectSupplement
(perfectsupplement.nl) — de Consumentenbond van leefstijl voor mannen 40+.

Je levert GEEN analyse-essay, GEEN React, GEEN repo-patch. Je levert één
self-contained HTML-bestand (vanilla JS, inline CSS, geen externe assets,
geen CDN, geen emoji) dat werkt door dubbelklikken.

═══════════════════════════════════════════════════════════════════════════════
BASIS — uitbreiden, niet opnieuw uitvinden
═══════════════════════════════════════════════════════════════════════════════

Werk op de bijgevoegde prebuild:
"beweging-keuze-consumentenbond-prebuild-v3.3-2026-08.html" (augustus 2026).

Behoud: alle schermen (A · E · B · C · D), alle tokens, de copy-stem, de
reviewer-chrome, en alle gelockte besluiten uit v3 t/m v3.3 (die staan als
HTML-comment bovenaan het bestand — lees ze eerst).

Vervang gericht waar hieronder staat. Slopen niet. Scherm B blijft
GEPARKEERD en ongewijzigd, inclusief zijn copy — een scherm zonder pad
ernaartoe herschrijven suggereert dat het terugkomt.

═══════════════════════════════════════════════════════════════════════════════
NOORDSTER — richtsnoer voor elke keuze (ongewijzigd sinds v3.1)
═══════════════════════════════════════════════════════════════════════════════

> Een goede basisconditie + krachttraining + dagelijks bewegen wint vrijwel
> altijd van een perfect geoptimaliseerd trainingsschema dat iemand niet
> volhoudt.

De ladder sorteert het TYPE interventie op prioriteit × onderbouwing × moeite.
Ze is geen ranglijst om te winnen en geen schap dat omhoog duwt.

═══════════════════════════════════════════════════════════════════════════════
HARDE LOCKS — schending = afgekeurd, ook als het beter oogt
═══════════════════════════════════════════════════════════════════════════════

L1  GEEN scherm dat een keuze eist vóór het een antwoord geeft. Het voorstel
    staat er als je opent; besturing staat eronder, altijd. Elke picker die
    tussen openen en voorstel gaat staan is verboden (BESLUIT §A.4 verbod 1).

L2  ÉÉN afvinkbare eenheid per dag, één bron. Geen tweede vinklijst, geen
    tweede "Gedaan"-knop, nergens (BESLUIT §A.4 verbod 2).

L3  GEEN readout die telt wat je niet deed. Nooit "1 van 2", nooit een lege
    balk naast een volle (BESLUIT §A.4 verbod 4).

L4  VERBODEN UI-WOORDEN, ook in aria-labels, eyebrows en tooltips:
    stappenplan · route · fase · spoor · startpatroon · categorie · cockpit ·
    kompas · journey · deep view · programma-catalogus ·
    oefeningenbibliotheek · coming soon · level · trede X van Y.
    Wat de gebruiker instelt heet "Jouw programma". De zes lagen heten
    samen "je ladder" (BESLUIT §C.2).

L5  GEEN ordinaal. Nooit "laag 4 van 6", nooit "level up", nooit een
    voortgangsbalk over de ladder.

L6  DE BRUG BLIJFT LAAG 1–3, met maximaal 3 acties, elk maximaal 1 knop.
    Laag 2 blijft read-only in de brug ("dit is je basis"). Laag 4, 5 en 6
    komen NOOIT in de brug. Alles wat v3.4 toevoegt aan laag 3–6 landt op
    Voortgang (scherm C).

L7  LAAG 6 IS ALTIJD GEGATE: stepped care, na de hertest, en pas als de
    voedingscheck gedaan is én er een gemeten signaal is (BESLUIT §G.1).
    Geen supplement-CTA, geen productkaart met prijs, geen affiliate-link
    op A, E of D. Op C mag één label-only link "Vergelijk op prijs en
    kwaliteit →" staan, met daarvóór één regel wat het middel wél en niet doet.

L8  TWEE DUUR-BEGRIPPEN, NOOIT ÉÉN VELD:
      dose   = je doel per sessie. Instelbaar, alleen in Je programma.
      dayDur = de zwaarte van vandaag. Readout, nergens instelbaar.
    Zodra één control beide zet, is de duur op Mijn Dag bewerkbaar geworden.
    Dat is verboden. De nieuwe eigen-minuten-invoer zet ALLEEN dose.

L9  VELDSCHEIDING (BLAUWDRUK §2.7):
      plek/begeleiding  → stuurt het programma én de copy
      frequentie        → stuurt het programma én de copy
      conditie-vorm     → stuurt de conditie-regel in je programma
      sport             → stuurt UITSLUITEND copy. Nooit je plan, nooit je
                          dosis, nooit je dagstap.
    Een sport heeft geen schema. Dat is geen tekortkoming, dat is het punt.

L10 GEEN FIT-PANEEL OP DE DOE-SURFACE (BESLUIT_FIT_PREFS L4 + lagenkaart).
    Begeleiding is in v3.4 een programma-veld op A/E, geen prefs-scherm,
    geen sliders, geen "wat vind jij belangrijk"-vragenlijst.

L11 GEEN SCHULDTAAL. Een lagere frequentie, een korte sessie of een
    overgeslagen dag krijgt nooit een correctie-zin. Feit eerst, dan de
    richtlijn, nooit het verwijt.

═══════════════════════════════════════════════════════════════════════════════
WIJZIGINGEN v3.4 — dertien, genummerd, allemaal verplicht
═══════════════════════════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────────────────────────
1. PLEK WORDT PLEK + BEGELEIDING (vierde chip)
───────────────────────────────────────────────────────────────────────────────

In "Je programma" (#a-dose), rij "Waar ga je dit doen?" wordt:

  Label:  "Waar en met wie ga je dit doen?"
  Chips:  thuis · sportschool · groep in de buurt · met coach of PT
  Ids:    thuis · gym · groep · coach

De vierde waarde krijgt volledige copy-doorwerking, net als de andere drie:

  coach.chip     "met coach of PT"
  coach.inTitle  "met begeleiding"
  coach.lead     "Met iemand die bij je sessies meekijkt."
  coach.spec     "Met begeleiding. De eerste weken samen, daarna zelf"
  coach.form     "Vijf basisoefeningen — iemand corrigeert je techniek"

Deze rij blijft in de programma-uitklap. Hij komt NIET in de wizard
("Waar wil je beginnen?"): dat is een andere as en zou van een wizard van
30 seconden een wizard van drie stappen maken (v3.3 §3.1, blijft staan).

Zet in de HTML-comment één reviewer-note: in het product splitst dit veld in
twee — `trainingLocation` (thuis | sportschool) en een begeleidingsveld
(zelf | groep | coach). In de UI is het één control, want de gebruiker denkt
één ding: waar en met wie.

───────────────────────────────────────────────────────────────────────────────
2. DUUR KRIJGT EIGEN MINUTEN
───────────────────────────────────────────────────────────────────────────────

Rij "Hoe lang wil je per keer?" behoudt de drie chips:
  kort · 15–20 min   |   standaard · 25–40 min   |   langer · 45–60 min

Daarnaast een vierde chip: "anders — ik vul zelf in".
Tik → open een klein invoerblok in dezelfde uitklap:

  Label   "Minuten per keer"
  Input   number, min 10, max 90, step 5, inputmode="numeric"
  Knop    "Klaar"
  Meta    "Je doel, niet je dag — vandaag mag altijd korter."

Gedrag:
  · Bevestigen zet dose = "<n> min" en zet de vierde chip op aria-pressed.
  · dayDur blijft ONGEWIJZIGD (L8). De dagstap op D/E verandert niet mee.
  · Waarde buiten 10–90 of leeg → geen wijziging, geen foutmelding met rood:
    één rustige regel "Vul een getal tussen 10 en 90 in."
  · De programma-samenvatting leest: "Doel: 2× per week · 35 min".

De DOSE_LEAD-map krijgt een fallback voor eigen waarden:
  < 20 min  → "Een kort blok per keer."
  20–44 min → "Een halfuur per keer."
  ≥ 45 min  → "Bijna een uur per keer."

───────────────────────────────────────────────────────────────────────────────
3. FREQUENTIE WORDT INSTELBAAR — 1× MAG
───────────────────────────────────────────────────────────────────────────────

Nieuwe rij in "Je programma", bóven de duur-rij:

  Label   "Hoe vaak per week?"
  Chips   1 keer · 2 keer · 3 keer
  Default 2 keer bij kracht (richtlijn), 3 keer bij conditie,
          5 keer bij dagelijks ritme — dus: de default komt uit het
          gekozen programma, niet uit een vaste 2.

Gedrag — dit is de bug die v3.3 achterliet, repareer hem hier volledig:
  · Frequentie zet basis.need, hersamenstelt basis.days (neem de eerste
    n dagen uit het patroon-rooster) en bouwt de planner opnieuw op.
  · programHead() leest need: "Dit stellen we voor: 1 keer kracht".
  · De weekregel op E leest need: bij need=1 en weekDone=1 →
    "Deze week alles gedaan" (nooit een noemer, L3).
  · De planner op A/E/D vraagt om precies zoveel dagen als need.

Copy bij 1 keer — één extra regel, alléén zichtbaar op Voortgang, achter
"Bekijk waarom" van laag 2. Nooit op de doe-surface, nooit als waarschuwing:

  "Eén keer is een start. Twee keer is de richtlijn — zodra dat
   volhoudbaar is."

Copy bij 3 keer kracht:
  "Drie keer mag. De winst tussen twee en drie is kleiner dan de winst
   tussen nul en twee."

───────────────────────────────────────────────────────────────────────────────
4. ÉÉN programProfile-OBJECT — instellen en teruglezen zijn hetzelfde ding
───────────────────────────────────────────────────────────────────────────────

Introduceer naast het bestaande PROFILE (bron/leeftijd/anker/plek) één
mock-object dat alles draagt wat de gebruiker zélf zet:

  var programProfile = {
    frequency: 2,           // 1 | 2 | 3
    place: "thuis",         // thuis | gym | groep | coach  (spiegelt PROFILE.place)
    strengthLevel: "beginner", // beginner | ervaren
    conditionForm: null,    // wandelen | fietsen | zwemmen | roeien | hardlopen | null
    sport: null,            // slug uit de sportgroep, of "anders"
    sportOwn: "",           // vrije tekst bij "anders" — data, nooit advies
    experience: null,       // beginner | ervaren | jaren  (uit zelf-calibratie)
    nutritionCheck: false   // poort 1 van laag 6, reviewer-schakelaar
  };

Comment erbij: dit is één mock-object omdat het in het product één
prefs-record wordt; vandaag bestaan `startPattern`, `trainingLocation` en
`movementAnchor` los van elkaar en is er nog geen frequentie-, niveau- of
sportveld.

HARDE EIS — de correlatie moet zichtbaar zijn:
  · Elke wijziging in programProfile is binnen ÉÉN klik terug te zien in het
    laag-2-paneel op Voortgang.
  · setLayer() en de zelf-calibratie updaten currentLayer én de teruglezing.
  · De teruglezing is een feitelijke samenvatting, nooit een ordinaal:
      "Kracht · thuis · 2× per week · beginner"
      "Conditie · fietsen"
    en bij een gezette sport één extra regel:
      "Je speelt ook tennis. Dat duidt je plan, het verandert het niet."

───────────────────────────────────────────────────────────────────────────────
5. LAAG 2 WORDT RIJK — twee subblokken in Je programma
───────────────────────────────────────────────────────────────────────────────

De programma-uitklap (#a-dose) krijgt onder de bestaande spec-lijst twee
duidelijk gescheiden subblokken, elk met een eigen kop:

  KRACHT — dit staat in je week
    · Hoe vaak per week?      (wijziging 3)
    · Waar en met wie?        (wijziging 1)
    · Hoe ervaren ben je?     beginner | ervaren   → programProfile.strengthLevel

  BASISCONDITIE — dit mag erbij
    · Het raster uit wijziging 6.
    · Default: niets gekozen. Dan blijft de bestaande read-only conditie-
      regel op E staan zoals in v3.3 (alleen bij een gemeten gap).

Niveau × plek stuurt de vorm-copy. Vier combinaties, letterlijk:

  beginner + thuis  "Vijf oefeningen met weerstandsbanden — duwen, trekken,
                     benen, romp, heup"
  beginner + gym    "Vijf machines — vaste baan, je techniek kan weinig
                     kanten op"
  beginner + groep  "Vijf basisoefeningen, met iemand die meekijkt"
  beginner + coach  "Vijf basisoefeningen — iemand corrigeert je techniek"
  ervaren  + thuis  "Losse gewichten en eigen lichaam, samengestelde
                     oefeningen"
  ervaren  + gym    "Vrije gewichten: squat, deadlift, druk- en trekwerk"
  ervaren  + groep  "Samengestelde oefeningen, tempo van de groep"
  ervaren  + coach  "Samengestelde oefeningen, iemand stuurt je opbouw"

Bij beginner + gym/groep/coach één rustige regel eronder:
  "Begeleiding is hier het snelst — techniek leer je niet uit tekst."
Bij beginner + thuis:
  "Thuis begin je met banden. Machines hoeven niet om te starten."

───────────────────────────────────────────────────────────────────────────────
6. HET CONDITIE-RASTER — één raster, twee groepen, twee velden
───────────────────────────────────────────────────────────────────────────────

Eén visueel raster (3 kolommen op 375px), met twee koppen erin. De splitsing
is niet cosmetisch: groep A programmeert, groep B duidt (L9).

  GROEP A — "Wat doe je voor je conditie?"  → programProfile.conditionForm
    wandelen · fietsen · zwemmen · roeien · hardlopen

  GROEP B — "Wat doe je verder al?"          → programProfile.sport
    tennis · voetbal · padel · yoga of pilates · vechtsport · klimmen ·
    schaatsen of skeeleren · anders

  Onder groep B, altijd zichtbaar, klein:
    "Dit verandert je plan niet. Het legt uit waarom je plan is wat het is."

  Bij "anders": één tekstveld, maxlength 40, placeholder
  "Bijvoorbeeld: kitesurfen". Opslaan in programProfile.sportOwn. Levert
  GEEN gap-uitspraak en GEEN advies — alleen een teruglezing:
    "Genoteerd. Hier hangen we geen oordeel aan — we kennen deze sport nog
     niet goed genoeg."

PICTOGRAMMEN — verplicht, en met beperkingen:
  · Inline SVG in één <symbol>-sprite bovenin het document, hergebruikt via
    <use>. Geen externe assets, geen base64-plaatjes, geen emoji.
  · Stijl: 1.6px stroke, currentColor, 28×28 viewBox, ronde uiteinden.
    Silhouet-niveau: herkenbaar in één oogopslag op 375px, geen detail.
  · Elke tegel: pictogram boven, label eronder, hele tegel is de knop,
    minimaal 44×44px raakvlak, aria-pressed op de gekozen tegel.

GAP-UITSPRAAK per sport — copy-skelet uit BLAUWDRUK §2.6:
  "{Sport} {wat het dekt}. Wat het niet raakt is {gap} — {waarom dat telt}."

Letterlijk, één per sport, te tonen op Voortgang laag 4 (nooit op A/E/D):

  tennis     "Tennis is intensief en met veel stops. Wat er meestal onder
              blijft is rustige duurinspanning waarin je nog kunt praten —
              daar draait je herstel op."
  voetbal    "Voetbal traint je sprint en je wendbaarheid. Wat het niet doet
              is je spieren zwaar belasten — daarom begint je plan bij kracht."
  padel      "Padel is kort en fel. Wat eronder blijft is kracht: het
              belast je spieren niet zwaar genoeg om ze te behouden."
  yoga       "Yoga en pilates houden je bewegingsbereik op peil. Wat ze niet
              geven is zware belasting of duuropbouw."
  vechtsport "Vechtsport traint je conditie en je coördinatie. Wat er meestal
              onder blijft is zware krachtbelasting."
  klimmen    "Klimmen is kracht in een specifiek patroon. Wat het niet
              opbouwt is je duurbasis — de motor onder je dag."
  schaatsen  "Schaatsen en skeeleren bouwen je duurbasis. Wat een glijdende
              beweging niet doet is je botten belasten — dat doet kracht."

VERBODEN in deze copy: "jouw sport is niet genoeg", "als tennisser loop je
risico op", elke uitspraak over deze persoon in plaats van over de sport.
Dit is een typisch profiel van een sport, geen meting van deze gebruiker.

───────────────────────────────────────────────────────────────────────────────
7. ZELF-CALIBRATIE — "Ik zit al verder op mijn ladder"
───────────────────────────────────────────────────────────────────────────────

De stille link onder de ghost-knop op A (#a-self) verandert van tekst:
  was:  "Ik doe al structureel kracht"
  wordt:"Ik zit al verder op mijn ladder"

Zelfde UX-patroon (stille link → sheet, geen chip naast het voorstel).
De sheet krijgt twee stappen:

  STAP 1 — "Waar zit je ongeveer?"
    Vier keuzes, met hun laag-label, zonder ordinaal:
      "Ik bouw op"            → laag 3
      "Ik train voor een sport" → laag 4
      "Ik train geavanceerd"  → laag 5
      "Ik gebruik al supplementen" → laag 6-poging (zie hieronder)
    Laag 1 en 2 staan er niet: dat is het default-pad.

  STAP 2 — "Hoe weet je dat?"
    beginner · ervaren · al jaren bezig   → programProfile.experience
    Eén regel eronder: "Dit is jouw inschatting. Je hertest meet het."

  BEVESTIGING — het verschil moet er in gewone taal staan:
    Zonder beweegcheck (PROFILE.src === "lc"):
      "Genoteerd. Je ladder staat nu op laag {n}.
       Je plan verandert hier niet van — dat meet je hertest."
    Met beweegcheck (PROFILE.src === "bc"):
      "Je beweegcheck ondersteunt dat. We tillen je doel per keer mee naar
       {nieuwe dose}; je dagen blijven staan."
    Regel: met beweegcheck mag ALLEEN dose omhoog (één stap), NOOIT
    frequentie, NOOIT een sprong naar laag 6.

  LAAG 6 — eerlijk geweigerd:
      "Laag 6 zet je niet zelf. Die gaat open op je voedingscheck en je
       hertest — een vinkje meet geen tekort. Wat je nu doet, zetten we
       op laag 5."
    Gedrag: currentLayer wordt 5, niet 6.

  TERUGLEZING in de sheet, zodra laag ≥ 3 gekozen is: de samenvatting uit
  programProfile (frequentie · plek · niveau · conditie-vorm · sport) plus
  één link "Pas je programma aan" die de programma-uitklap opent.

  "Toch niet" blijft bestaan en zet alles terug naar laag 2 + dose 15–20 min.

GEDEELDE STAAT: op Voortgang staat onder de piramide-cap dezelfde ingang:
  "Klopt je ladder niet? Zet hem goed"
Dezelfde sheet, dezelfde staat, één bron. Verzetten op C is meteen zichtbaar
op A en omgekeerd.

───────────────────────────────────────────────────────────────────────────────
8. "WAT KUN JE HIER DOEN?" — acties per laag, alleen op Voortgang
───────────────────────────────────────────────────────────────────────────────

Elk laag-paneel op C (scherm Voortgang) krijgt een tweede disclosure, naast
de bestaande "Bekijk waarom":

  ▸ Wat kun je hier doen?

Regels, hard:
  · Maximaal 3 acties per laag, elk maximaal 1 knop (zelfde regel als de brug).
  · Laag 1 en 2 krijgen deze disclosure NIET — die acties staan in de brug
    en in je programma. Anders krijg je twee plekken voor hetzelfde.
  · Laag 4, 5 en 6 krijgen NOOIT een "Zet op Mijn Dag"-knop. Dat zijn keuzes
    en oordelen, geen dagstappen (L2, L6).
  · Panelen openen dicht. Voortgang opent nog steeds zonder open paneel.

───────────────────────────────────────────────────────────────────────────────
9. LAAG 3 · PROGRESSIEF OPBOUWEN — tijdsgate of opschalen
───────────────────────────────────────────────────────────────────────────────

Het paneel is voorwaardelijk. Twee standen:

  STAND A — beginner (programProfile.experience === "beginner" of null,
            of currentLayer < 3):
    Kop van de disclosure-inhoud: "Nog even niet — en dat is de winst"
    Copy: "Eerst vier tot acht weken je basis volhouden. Daarna volume.
           Opbouwen vóór dat punt is de snelste manier om te stoppen."
    Eén actie: knop "Herinner me over 8 weken" (mock, label-only).
      Bevestiging: "Genoteerd voor 4 oktober. Tot die tijd verandert er
      niets aan je plan."

  STAND B — ervaren (experience === "ervaren" | "jaren", of currentLayer ≥ 3):
    Eerst één regel teruglezing uit laag 2:
      "Je doet nu: kracht · thuis · 2× per week · beginner."
    Dan maximaal drie acties:
      1. "Kracht opschalen"  — "Van machines naar losse gewichten, of van
         banden naar samengestelde oefeningen."  Knop: "Pas je programma aan"
         (opent de programma-uitklap op A).
      2. "Iemand die meekijkt" — "Techniek bij zwaardere oefeningen leer je
         sneller met begeleiding dan uit tekst."  Knop: "Bekijk begeleiding"
         (scrollt naar het bestaande eigen-begeleiding-blok op C).
      3. "Hoe bouw je verder op?" — eerlijk, zonder belofte:
         "Oefeningen met uitleg staan er nog niet. Tot die tijd: begeleiding,
          of een proefperiode bij een sportschool."  GEEN knop.

Het woord "coming soon" is verboden (L4). Zeg wat er niet is, in gewone taal.

───────────────────────────────────────────────────────────────────────────────
10. LAAG 4 · SPECIFIEK SPORTEN — leest uit programProfile
───────────────────────────────────────────────────────────────────────────────

  Als programProfile.sport gezet is:
    · Toon de sport met zijn pictogram en de gap-uitspraak uit wijziging 6.
    · Eén regel eronder, altijd: "Je basis blijft staan: {frequentie} keer
      kracht per week."
    · Link "Andere sport kiezen" → opent het raster compact in het paneel
      (groep B alleen).

  Als er geen sport gezet is:
    · Eén regel: "Je hebt nog geen sport gezet. Dat hoeft niet — je plan
      werkt zonder."
    · Link "Zeg wat je verder doet" → opent groep B compact.

  Acties (max 3, geen dag-knoppen):
    1. "Een keuze maken"       — "Lokale opties en proefperiodes staan in
       Maak een keuze."  Knop: "Open Maak een keuze" (data-goto="b").
    2. "Onze eigen begeleiding" — bestaande wachtlijst-copy, link naar het
       bestaande blok op C.
    3. (alleen bij "anders" ingevuld) "We kennen deze sport nog niet goed
       genoeg om er een oordeel aan te hangen." GEEN knop.

───────────────────────────────────────────────────────────────────────────────
11. LAAG 5 · GEAVANCEERD EN NICHE — het Bond-kader
───────────────────────────────────────────────────────────────────────────────

Laag 5 houdt zijn bestaande "waarom hier geen plan staat"-regel, en krijgt
daaronder een kader met de kop:

  "Marginale winst — alleen bovenop een basis die staat"

Drie ghost-kaarten in de bestaande .pyr-item ghost-stijl, met een
verdict-chip in de bestaande vchip-stijl. GEEN prijs, GEEN foto, GEEN
"Zet op Mijn Dag", GEEN externe link.

  Bodytec / EMS            chip: "Alleen als…"
    "Kan een krachtprikkel korter maken als tijd je probleem is. Vervangt
     laag 1 en 2 niet, en het verschil met zelf twee keer per week trainen
     is klein."

  Cryo / ijsbad            chip: "Nog geen oordeel"
    "Voelt goed na inspanning. Vlak na krachttraining kan koude je aanpassing
     juist afremmen — daar is de literatuur niet eenduidig over."

  HRV meten met wearable   chip: "Alleen als…"
    "Een getal per ochtend. Nuttig als je er een beslissing aan hangt;
     anders is het een extra ding om je zorgen over te maken."

OORDEEL-SJABLOON — gebruik deze structuur voor elke kaart, in deze volgorde:
  1. wat het kan doen, feitelijk
  2. wat het niet vervangt
  3. de maatstaf: het verschil met consistent trainen is groter

Onder het kader één link, label-only (href="#"):
  "Lees ons volledige oordeel"
Met eronder: "Nog niet geschreven — we beoordelen pas wat we ook kunnen
uitleggen."

───────────────────────────────────────────────────────────────────────────────
12. LAAG 6 · SUPPLEMENTEN EN VOEDING — twee blokken, altijd gegate
───────────────────────────────────────────────────────────────────────────────

Alleen op Voortgang. Niets hiervan verschijnt op A, E of D (L7).

  BLOK 1 — altijd zichtbaar, dit is de enige actie
    Kop:  "Eerst je voeding"
    Copy: "Een supplement dicht een gat dat je eten laat vallen. Zonder te
           weten waar dat gat zit, is aanvullen gokken."
    Knop: "Doe de voedingscheck" (mock, label-only)

  BLOK 2 — alleen als programProfile.nutritionCheck true is
    Kop:  "Daarna: wat de meting zegt"
    Toon maximaal TWEE voorbeelden, leeftijd-afhankelijk (PROFILE.age),
    als illustratie van hoe het werkt — nooit als aanbeveling:

      40 (40–49) "Eet je bijna geen vis, dan komt omega-3 in beeld. Eerst
                  meten, dan pas aanvullen."
      50 (50–59) "Kom je onder de 1,2 gram eiwit per kilo, dan is eiwit het
                  eerste gesprek — en dat gesprek begint bij je bord."
      60 (60+)   "Boven de zestig met weinig eiwit is een eiwitpoeder een
                  bespreekbare aanvulling. Eerst meten, dan aanvullen."

    Onder elk voorbeeld, verplicht:
      "Dit is geen diagnose."
    En onder dit blok één label-only link:
      "Vergelijk op prijs en kwaliteit →"

  Als nutritionCheck false is, staat op de plek van blok 2:
    "Wat hier komt te staan hangt af van je voedingscheck en je hertest op
     16 augustus. Tot die tijd is er niets te adviseren."

REVIEWER-SCHAKELAAR: voeg in de chrome een schakelaar
"Voedingscheck: gedaan | niet gedaan" toe die programProfile.nutritionCheck
zet, zodat beide standen te zien zijn.

Reviewer-note in de HTML-comment: `age_range` bestaat al in de intake. v3.4
gebruikt het uitsluitend voor illustratieve copy op Voortgang. De intake
wordt in deze prebuild NIET uitgebreid.

───────────────────────────────────────────────────────────────────────────────
13. SCHERM E EN D VOLGEN — één bron, meerdere uitlezingen
───────────────────────────────────────────────────────────────────────────────

  E · programma-uitklap krijgt dezelfde rijen als A: plek+begeleiding,
      frequentie, duur (incl. eigen minuten), niveau, conditie-raster.
      Wijzigen op E werkt door naar de kop op A, de ladder-teruglezing op C
      en de dagstap op D — één staat, geen tweede kopie.

  E · de conditie-regel onder de kop wordt actief zodra
      programProfile.conditionForm gezet is, ook zonder beweegcheck:
        "Conditie · {vorm}. Staat in je programma — hier hoef je niets af
         te vinken."
      Zonder gezette vorm blijft het v3.3-gedrag: alleen bij een gemeten
      gap (PROFILE.src === "bc"), read-only.
      NOOIT een tweede Gedaan-knop (L2).

  D · minimale wijziging: de titel van de dagstap volgt het programma
      (frequentie + plek), en de tray/raster-schakelaar blijft precies zoals
      v3.3 hem heeft. De week-readout blijft UIT (verdict DEFER).
      Geen ladder, geen laag-acties, geen sport op Mijn Dag.

═══════════════════════════════════════════════════════════════════════════════
DATA-MODEL — mock, maar consistent
═══════════════════════════════════════════════════════════════════════════════

  PROFILE          bron (lc|bc) · leeftijd (40|50|60) · anker · plek
                   → wat de check weet. Reviewer-schakelaars, blijft.
  programProfile   wijziging 4 → wat de gebruiker zelf zet.
  basis            patternId · need · days · time · dose · dayDur · title
                   → het plan. need komt uit programProfile.frequency.
  currentLayer     1–6, gezet door setLayer() en de zelf-calibratie.
  selfCalibration  { layer, experience, confirmed }  → gedeeld tussen A en C.

Regel: geen enkel scherm mag een waarde hardcoderen die uit een van deze
objecten kan komen. Als je een string ziet die "2 keer kracht thuis" zegt,
is dat een bug — v3.3 heeft daar precies om gefaald.

═══════════════════════════════════════════════════════════════════════════════
PROTOTYPE-CHROME — uitbreiden, niet vervangen
═══════════════════════════════════════════════════════════════════════════════

Behoud alle bestaande schakelaars (weergave, sub-staat A1/A2/A3, check-
profiel, huidige laag, brug open/dicht, alert, tray/raster, week-readout).

Voeg toe:
  · Kracht-niveau:   beginner | ervaren
  · Ervaring:        — | beginner | ervaren | jaren
  · Voedingscheck:   gedaan | niet gedaan
  · Eén readout-regel: "programProfile: 2× · thuis · beginner · fietsen ·
    tennis · laag 2" — zodat een reviewer in één blik ziet wat er staat.

Alle chrome staat in reviewermodus. Gebruikersmodus is de default en toont
er niets van.

═══════════════════════════════════════════════════════════════════════════════
VISUEEL — tokens hard overnemen uit v3.3
═══════════════════════════════════════════════════════════════════════════════

Geen nieuw kleurenpalet, geen nieuwe typografie, geen nieuwe componenttaal.
Nieuwe onderdelen hergebruiken bestaande klassen: .chip, .chips, .plan-row,
.specs, .sheet, .sheet-act, .pyr-item, .vchip, .btn-soft, .linkish.

Nieuw en alleen wat echt nieuw is:
  · .formgrid  — het conditie-raster (3 kolommen op 375px, 4 vanaf 480px)
  · .formtile  — één tegel: pictogram + label, aria-pressed
  · .minutes   — het eigen-minuten-invoerblok

375px is de primaire viewport. Geen horizontale overflow, geen element
breder dan de viewport, raakvlakken minimaal 44×44px.
CSS-only motion, prefers-reduced-motion gerespecteerd.

═══════════════════════════════════════════════════════════════════════════════
COPY-STEM
═══════════════════════════════════════════════════════════════════════════════

Nederlands, jij/jou, mannen 40+. Feit eerst, dan de korte actie.
Kort: op de doe-surface geen zin boven de vijftien woorden.
Geen diagnose, geen "boost", geen hype, geen uitroeptekens, geen emoji.
Onderbouwing = richtlijn of mechanisme, met bron als het een claim is.
Geen schuldtaal (L11). Geen generaliserende coach-copy ("iedereen weet dat…").

═══════════════════════════════════════════════════════════════════════════════
VERBODEN — expliciet, ook als het beter oogt
═══════════════════════════════════════════════════════════════════════════════

- GEEN React, Next, Tailwind-build of externe CDN
- GEEN volledig sportenraster ("de Olympische Spelen"); precies de acht uit
  groep B plus "anders"
- GEEN laag 4, 5 of 6 in de brug
- GEEN supplement-, voedingscheck- of koop-CTA op A, E of D
- GEEN tweede afvink-knop, waar dan ook
- GEEN "x van y", geen lege balken, geen streak
- GEEN ordinaal en geen "level"
- GEEN online-oefeningencatalogus bouwen of beloven
- GEEN wijziging aan scherm B
- GEEN wijziging aan de Leefstijlcheck-intake
- GEEN Engelse UI-strings, geen Lorem ipsum

═══════════════════════════════════════════════════════════════════════════════
ACCEPTATIE — toets dit zelf vóór je oplevert, met een klikscript
═══════════════════════════════════════════════════════════════════════════════

Toets in een iframe van exact 375px breed (een browservenster klemt onder
500px) met een geïnjecteerd klikscript, niet met het oog alleen. Rapporteer
de uitkomst in maximaal tien regels ná de HTML.

  A1  Plek-chips zijn vier: thuis · sportschool · groep · met coach of PT;
      titel, sublead, vorm-spec en plek-spec wisselen alle vier mee
  A2  Duur: drie chips + eigen minuten; dose verandert, dayDur niet
  A3  Frequentie 1× instelbaar; kop leest "1 keer kracht"; planner vraagt
      om één dag; weekregel zonder noemer
  A4  Conditie-raster: 5 vormen + 8 sporten + anders; keuze zichtbaar in
      laag 2 én laag 4 op Voortgang én in de conditie-regel op E
  A5  Zelf-calibratie: laag 3/4/5 zetbaar, laag 6 eerlijk geweigerd;
      lc-stand verzet alleen de ladder, bc-stand tilt alleen dose
  C1  Laag 3–6 hebben "Wat kun je hier doen?" met maximaal 3 acties;
      laag 1 en 2 hebben die disclosure niet
  C2  Laag 5 toont drie ghost-kaarten zonder dag-knop en zonder prijs
  C3  Laag 6 zonder voedingscheck toont alleen blok 1; mét voedingscheck
      maximaal twee leeftijd-voorbeelden, elk met "Dit is geen diagnose"
  X1  Brug toont laag 1–3, maximaal 3 acties, laag 2 read-only
  X2  375px: maximaal één primaire knop boven de vouw op A1; scrollWidth
      ≤ 375px; nul elementen breder dan de viewport
  X3  Een wijziging in programProfile is binnen één klik zichtbaar in het
      laag-2-paneel op Voortgang
  X4  Nul verboden woorden in gebruikersmodus (scherm B uitgezonderd)
  X5  Klikdoorloop over alle nieuwe controls: nul JS-fouten, schone console

═══════════════════════════════════════════════════════════════════════════════
OPEN PUNTEN — benoem ze, bouw ze niet
═══════════════════════════════════════════════════════════════════════════════

- De voedingscheck-flow bestaat niet. De knop is label-only.
- Er is geen oefeningencatalogus. Laag 3 zegt dat in gewone taal.
- Scherm B blijft geparkeerd; laag 4 linkt ernaartoe, meer niet.
- De dekkingsprofielen van de acht sporten zijn een redactioneel voorstel,
  geen meting. De copy draagt dat.
- Meetpunten zitten niet in deze prebuild — het is een ontwerpartefact.

═══════════════════════════════════════════════════════════════════════════════
OUTPUT-FORMAAT
═══════════════════════════════════════════════════════════════════════════════

1. HTML-comment bovenaan het bestand: "v3.4 — WAT DIT LOCKT T.O.V. v3.3",
   8 tot 10 bullets, in dezelfde stijl als de bestaande v3.3/v3.2/v3.1-
   blokken. Die oudere blokken blijven staan, eronder.
2. Het volledige werkende bestand. Eén bestand, geen bijlagen.
3. Ná de HTML: maximaal tien regels met de uitkomst van je acceptatietoets
   en elke plek waar je bewust bent afgeweken. Geen essay.
```

---

## Bijlage — mapping voor latere implementatie

| Prebuild-veld | Bestaat al? | Waar het heen gaat |
| --- | --- | --- |
| `programProfile.frequency` | ❌ | Nieuw prefs-veld; `weeklyFrequency` in [`BLAUWDRUK §2.7`](../plan/BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md) |
| `programProfile.place` (4 waarden) | deels | Splitst in `trainingLocation` (thuis/sportschool) + begeleidingsveld (zelf/groep/coach) |
| `programProfile.strengthLevel` | ❌ | Nieuw; stuurt sessie-variant binnen `kracht` |
| `programProfile.conditionForm` | deels | Sessie-variant binnen `duurbasis` ([`BLAUWDRUK §2.3`](../plan/BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md)) |
| `programProfile.sport` | ❌ | `sports[]` — dekkingsprofiel, **stuurt alleen copy** ([§2.7](../plan/BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md)) |
| `selfCalibration` | ❌ | Nieuw; zelfverklaring naast de gemeten `currentLayer` |
| `nutritionCheck` | deels | Poort 1 uit [`BESLUIT §G.1`](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md) |
| `PROFILE.age` | ✅ | `age_range` uit de intake — alleen illustratieve copy op Voortgang |
| `basis.dose` / `dayDur` | ✅ | Blijft gescheiden (L8) |

**Meetpunten bij implementatie** — hergebruik bestaat vóór je nieuw verzint. In [`src/lib/events.ts`](../../src/lib/events.ts) staan al: `movement.location_selected`, `movement.sport_selected`, `movement.gap_shown`, `movement.target_set`, `dashboard.beweging_programma_open`, `plan.week_category_selected`. Alleen de zelf-calibratie heeft nog geen type. Nieuw client-event = registratie op drie plekken (`events.ts` + `intake-events-client.ts` + allowlist in de API-route).

---

## Checklist na Opus-run

1. [ ] 375px in de browser: A1 heeft één primaire knop boven de vouw, geen horizontale scroll
2. [ ] Frequentie op 1 zetten → kop, planner, weekregel en ladder-teruglezing kloppen alle vier
3. [ ] Conditie-raster: een vorm kiezen verandert E; een sport kiezen verandert alleen laag 4
4. [ ] Zelf-calibratie op laag 6 → weigering, currentLayer wordt 5
5. [ ] Laag 5 en 6: geen dag-knop, geen prijs, geen affiliate
6. [ ] Verbodslijst L4 gegrepd in de HTML (gebruikersmodus, scherm B uitgezonderd)
7. [ ] Opslaan als `docs/design/beweging-keuze-consumentenbond-prebuild-v3.4-2026-08.html`
8. [ ] Daarna optioneel `claude-opus-beweging-v3.4-wederprompt.md`, zelfde patroon als v3.3
