# Voortgang · Statistieken · Premium-grens — grens- en productdefinitie

> **Opus-analyse, 29 juli 2026.** Antwoord op [`claude-opus-voortgang-statistieken-premium-grens-prompt.md`](claude-opus-voortgang-statistieken-premium-grens-prompt.md).
> Geverifieerd tegen `main` / HEAD `2fd4f75`. Geen code, geen diffs — een grensdefinitie die om te zetten is in Cursor-prompts.

---

## Kernbesluit vooraf

**Premium is begeleiding. Statistieken zijn gratis substraat. De tijdas-grens uit juli vervalt.**

Drie observaties dwingen dit af, en alle drie zijn in de code te lezen:

1. **De premiumbelofte is al gratis geleverd — drie keer.** "Trends per domein" en "vergelijk je metingen" staan letterlijk op de hub (`VoortgangDomeinRing`: sparkline + `DeltaBadge` per domein), op de hub-beat (`VoortgangRichtingBeat`: start → nu → volgend niveau, mét getallen) en op Statistieken zelf (`LeefstijllijnSection`: "begin en laatste meting op één curve"). De `PremiumWaitlistCard` verkoopt daarna hetzelfde. Dat is geen grenslek — dat is een **dood aanbod**.

2. **De as-built premium-bundel is geen product.** Achter de gate zitten vier blokken: `StatistiekenPriorityOverTime` (echt nieuw), `SignalsSection` (**alle `SIGNALS` staan op `status: "binnenkort"` met lege data** — vijf gestippelde lege kaarten met "—"), `NutritionIntakeSection` (hoort bij het gratis stepped-care-verhaal) en `HistorySection` (duplicaat van de gratis bundel). Netto: één nieuw blok, één leeg blok, één blok dat gratis hoort, één duplicaat. Als je die gate morgen zou openzetten, zou de betalende gebruiker zich bekocht voelen.

3. **De backend zegt al "begeleiding" — de UI is de afwijking.** Drie van de vijf plekken die "premium" definiëren noemen coaching, niet statistieken:
   - `/api/account/waitlist` → `STORED_FEATURE = "premium-coaching"`
   - `PREMIUM_LAUNCH_EMAIL_CONSENT_TEXT.premium_launch_email` → *"…zodra **premium begeleiding** live is."* — dit is de **vastgelegde toestemmingstekst**, de juridisch zwaarste string in het hele pad
   - `KompasBegeleidingLink` → *"Premium: wekelijks iemand die met je meekijkt."*

   Alleen `PremiumWaitlistCard` (eyebrow "Premium · Statistieken") en `premium-value-props.ts` zeggen statistieken. De consent-tekst wint dit argument alleen al: je legt toestemming vast voor *begeleiding* en verkoopt op hetzelfde scherm *statistieken*.

**De nieuwe as is niet tijd en niet diepte. Het is: zelf lezen versus met je meekijken.**
Alles wat de gebruiker over zichzelf kan aflezen — nu én over tijd — is gratis, want het is zijn data en zijn antwoorden. Premium is het enige wat hij niet zelf kan doen: iemand die er wekelijks naar kijkt en er iets van vindt. Die dienst bestaat nog niet, en dat mag — een wachtlijst hoort te gaan over iets dat er nog niet is. Wat níet mag, is een wachtlijst voor iets dat er al is en gratis op hetzelfde scherm staat.

**Consequentie voor de app:** er blijft geen enkele vergrendelde pixel over. Geen blur, geen slotjes, geen "Einde gratis advies". Eén uitnodiging, op de plek waar het bewijs geland is.

---

## A. As-built inventarisatie per surface

### A.1 Voortgang-hub (`VoortgangHubScroll.tsx`) — geen enkele gate in de hele keten

| Blok | Wat het toont | Data | Copy-anker | Gate |
|---|---|---|---|---|
| `VoortgangHero` | H1 per bewijsstaat, bewijsregel, 1–2 CTA's, geruststelling | `data.cycleEvidence` (activeDays, cycleDay, daysUntilRemeasure), `model.priority`, `model.deltaOf` | `H1_BY_STATE` (4 staten: beantwoord/opbouwend/dun/wachtend), `REASSURANCE_BY_STATE`, `buildVoortgangBewijsRegel` | geen |
| `VoortgangBewijsband` | bewijsband in de hero-rechterkolom | `cycleEvidence`, `remeasure`, `domainCheckDaysAgo` | — | geen |
| `VoortgangDomeinRing` | 7 domeinen, gesplitst in interventie + "Volgt uit de rest"; per rij: kleurstip, label, **`Sparkline w=72 h=24`**, bandlabel via `getScoreBandShortLabel`, **`DeltaBadge`**, metaregel "N metingen · X dagen geleden" | `model.trend`, `model.scores`, `model.deltaOf`, `data.domainCheckDaysAgo` | "Wat je van jezelf weet" · "Je hebt N van de 7 domeinen apart gemeten." | geen |
| `VoortgangRichtingBeat` | prioriteitsdomein op een as: **baseline-getal, nu-getal, "vanaf {target}"**, bandlabels, toekomstige-ik-quote | `buildKompasDomainRows`, `getVitalityBand`, `getNextVitalityBand` | "Van waar je begon, naar waar dit heen kan." | geen |
| `VoortgangRouteList` | 3 routerijen; BINNENKORT-blok met Lichaamssamenstelling ("Binnenkort in te vullen") en wearable ("Binnenkort"); onderaan `PremiumWaitlistCard surface="voortgang"` | statisch | "Verder kijken" · "Waar je dit verder uitzoekt" | geen |

> De hub geeft dus **band + sparkline + delta per domein én de numerieke start-nu-doel-as van het prioriteitsdomein** weg, vóór de gebruiker één betaalde route heeft aangeraakt.

### A.2 Statistieken — locked (= wat 100% van de gebruikers ziet)

| # | Blok | Wat het toont | Copy-anker |
|---|---|---|---|
| 1a | `WaarStaJeCard` | per-domein **balk + getal + "zwak"**-markering, freshness-nudges | eyebrow "Op basis van je check van {datum}" |
| 1b | `EvidenceLadderCard` | bewijsladder per domein | — |
| 1c | `EerstJeBordCard` | voedingsladder: wat van tafel kan, claim-regels naar vergelijkingspagina's | eyebrow **"Stap 1 van 3 · Uit voeding"** |
| 1d | `OnsOordeelCard` | verdicts, of de voedingscheck-poort | eyebrow **"Stap 2 van 3 · Ons oordeel"** / "· Nog niet te zeggen" |
| 2 | scheidslijn | gecentreerde caps | **"Einde gratis advies"** |
| 3 | `LeefstijllijnSection` | per interventiedomein: sparkline, "Begin {n}" + bronlabel, huidig getal, `DeltaBadge` of "meetmethode bijgewerkt"; beweging-rij toont minuten/sessies deze week bij actieve movement-log | eyebrow "Analyse" · "Jouw lijn" · "Score per domein over je checks — begin en laatste meting op één curve." |
| 4 | `HistorySection` (= `freeStatistics`) | inklapbare checkhistorie | "Je historie" |
| 5 | `StatistiekenSoftUpsell` | 2 value-props + tekstlink | "Eén meting is een foto. Meerdere is een film." |
| 6 | `HubCard` Lichaamssamenstelling | tegel met **slotje + "Premium"**-badge | "Gewicht, lengte en persoonlijk doel" |

Layout van blok 1: `grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5`.

### A.3 Statistieken — unlocked zoals bedoeld · **ONBEREIKBAAR, nooit gerenderd**

`isMember` wordt in `/dashboard/page.tsx` niet aan `<Dashboard>` doorgegeven (alleen `empty`, `data`, `hasTrendsFeature`, `sleepFocus` en de vier `initial*`-props). De prop defaultet op `false` (`Dashboard.tsx:3641`), `DARK_LAUNCH = true`, dus `resolveTrendsAccess` retourneert altijd `false`.

| Blok | Wat het zou tonen | Oordeel |
|---|---|---|
| `StatistiekenPriorityOverTime` → `PriorityOverTimePanel` | "Prioriteit over tijd" — hoe je vertrekpunt verschuift over checks, engine vs. jouw pin | **Enige echt nieuwe blok.** Wordt nergens anders in `src/` gebruikt → dit paneel is in productie nooit vertoond |
| `SignalsSection` | HRV, rustpols, slaapduur, … | **Leeg.** Alle `SIGNALS` in `src/data/dashboard/index.ts` staan op `status: "binnenkort"` met `data: []` → gestippelde kaarten, lege sparkline, waarde "—" |
| `NutritionIntakeSection` | "Voeding-inname · Wat je binnenkrijgt" | Hoort bij het gratis stepped-care-verhaal ("Eerst je bord"), niet achter een gate |
| `HistorySection` | identiek aan de gratis versie | **Duplicaat** |
| `PremiumValuePropsList variant="comingSoonOnly"` | alleen "Activiteiten logboek — binnenkort" | Een premiumtak die afsluit met "binnenkort" |

### A.4 Jouw inzichten (`VitaalscoreInzichtenView`)

| Blok | Staat | Opmerking |
|---|---|---|
| `VitalityGauge` (300px, hero) | altijd zichtbaar | — |
| heading + body | altijd | `getVitalityScoreCardCopy` |
| `BlurredInsightTips` | **altijd geblurd** (`filter: blur(5px)`, `aria-hidden`) | Blurt `explainer[1]` en `explainer[2]` — **echte, voor hem gegenereerde uitleg over zijn eigen scores** |
| upsell-blok | altijd | "Meer dan één moment zien?" / "Premium vergelijkt je vitaalscore over tijd…" |
| `MetingenCard` | altijd zichtbaar, ná de gate | Facets op peil + check-ritme — opnieuw "over tijd", gratis |
| `RecommendedInsights` | onbereikbaar | de unlocked-tak |

### A.5 Lichaamssamenstelling (`LichaamssamenstellingView`)

| Blok | Staat | Opmerking |
|---|---|---|
| `IDENTITY_FIELDS`-lijst | slotje vanaf index 1 | eerste veld toont waarde, rest een slot-icoon |
| `ChartCard "Gewicht"` / `"Lengte"` | **altijd geblurd** | Blurt **`MOCK_TREND = [42, 48, 45, 52, 49, 55]`** — verzonnen data, gepresenteerd als vergrendelde preview van zíjn gewicht en lengte |
| CTA | **geen** | Het scherm heeft geen wachtlijstkaart en geen uitweg. Doodlopend slot |
| Meting | `dashboard_lichaamssamenstelling_getoond` | vuurt wel |

---

## B. Gratis vs. premium — de matrix

Kolom "ideaal" volgt de nieuwe as: **zelf lezen = gratis; met je meekijken = premium.**

| Blok | Nu | Ideaal | Reden voor de verschuiving |
|---|---|---|---|
| `VoortgangHero` + `VoortgangBewijsband` | gratis | **gratis** | Bewijs dat zich opstapelt is de reden om terug te komen. Dit is retentie, geen koopwaar |
| `VoortgangDomeinRing` (sparkline + delta) | gratis | **gratis — expliciet** | Zijn antwoorden, zijn lijn. Bandlabel i.p.v. getal is bovendien de KOAG-veilige variant. Weghalen zou een werkend gratis product ruilen voor een hypothetisch betaald product |
| `VoortgangRichtingBeat` | gratis | **gratis** | Zelfde reden. Wel de zwaarste getal-exposure van de hele hub (baseline, nu, target) — bewust houden, niet per ongeluk |
| `VoortgangRouteList` routerijen | gratis | **gratis** | Navigatie |
| `PremiumWaitlistCard` op de hub | volle kaart, onderaan | **verplaatsen naar Statistieken; op de hub één stille regel** | De hub is de eerste indruk; een volle verkoopkaart vóór er bewijs geleverd is, vraagt commitment zonder waarde. Zie F |
| `WaarStaJeCard` (balken + getallen) | gratis | **gratis, maar samengevoegd met Jouw lijn** | Drie renderings van dezelfde domeinscores in twee schermen is één te veel. Zie D |
| `EvidenceLadderCard` | gratis | **gratis** | Bewijskracht is het onderscheidende van PSF; dat is positionering, geen feature |
| `EerstJeBordCard` | gratis | **gratis — hard** | Stepped care. "Eerst je bord" achter een gate zetten breekt invariant 4 en de hele Consumentenbond-positionering |
| `OnsOordeelCard` | gratis | **gratis — hard** | Het oordeel is het product. Als het oordeel betaald wordt, verkoop je advies en niet langer onafhankelijkheid |
| Scheidslijn "Einde gratis advies" | label | **verwijderen, vervangen door een acthoofd** | Er komt niets betaalds na. Het label liegt op positie 2 van 6. Zie C.4 en H.2 |
| `LeefstijllijnSection` | gratis (na het label) | **gratis, en naar boven** | Dit is de kern van de gratis analyse, geen restpost |
| `HistorySection` | gratis **én** premium | **gratis, één plek** | Een blok dat in beide bundels zit, maakt "upgraden" tot herhaling |
| `StatistiekenSoftUpsell` | gratis blok dat statistieken verkoopt | **vervangen door de begeleidings-uitnodiging** | "Eén meting is een foto. Meerdere is een film." — de film staat er al, drie blokken hoger. De zin verkoopt wat de gebruiker net gratis kreeg |
| `StatistiekenPriorityOverTime` | premium (onbereikbaar) | **gratis** | Het is zijn eigen prioriteitsverschuiving over zijn eigen checks. Onder de nieuwe as: zelf lezen. Het is bovendien het enige premium-blok met echte inhoud — als gratis blok maakt het het gratis product meetbaar sterker |
| `SignalsSection` | premium (onbereikbaar) | **uit de premium-bundel; blijft waar wearables landen** | Vijf lege "binnenkort"-kaarten zijn geen premium-waarde. Wearable-interesse wordt al gemeten op de hub (`wearable.interest_clicked`) |
| `NutritionIntakeSection` | premium (onbereikbaar) | **gratis** | Het is de readout van de voedingscheck die we gratis afdwingen. Achter een gate is dat een tegenstrijdigheid |
| `PremiumValuePropsList variant="comingSoonOnly"` | premium (onbereikbaar) | **schrappen** | Een betaalde tak die eindigt in "binnenkort" |
| `HubCard` Lichaamssamenstelling met Premium-badge | premium-badge | **"Binnenkort"-rij, geen slotje** | Het is niet premium, het is onbestaand. Zie C.5 |
| `IDENTITY_FIELDS` met slotjes | gedeeltelijk vergrendeld | **geen slotjes; één eerlijke lege staat** | Er is niets om te ontgrendelen |
| `ChartCard` met geblurde `MOCK_TREND` | vergrendelde preview | **verwijderen** | Verzonnen data als preview van zijn eigen lichaam. Zie C.6 en L.1 |
| `VitalityGauge` op Inzichten | gratis | **gratis** | — |
| `BlurredInsightTips` | vergrendeld | **gratis, zonder blur** | Het is zijn eigen uitleg over zijn eigen score. Zie C.7 |
| `MetingenCard` | gratis | **gratis** | — |
| `RecommendedInsights` | premium (onbereikbaar) | **gratis** | Kennisbank-inzichten bij zijn prioriteitsdomein; geen dienst, wel content die de hub-belofte "Je vitaliteit in één beeld" waarmaakt |
| Wekelijkse meekijk-dienst | bestaat niet | **premium — nog te bouwen** | Het enige dat hij niet zelf kan. Vandaag: wachtlijst |
| Hermeting-begeleiding | bestaat niet | **premium — nog te bouwen** | Idem; sluit aan op de bestaande Kompas-copy ("Gratis: na 30 dagen je hermeting … Premium: wekelijks iemand die met je meekijkt") |

**Netto:** het gratis product wordt rijker (PriorityOverTime, Nutrition, RecommendedInsights, ontblurde tips erbij), en premium wordt eerlijk leeg met één duidelijke belofte. Dat is een betere ruil dan het omgekeerde, omdat het gratis product vandaag de enige bestaande ervaring is.

---

## C. Grens-audit

Ernst-schaal: **kritiek** (schaadt vertrouwen of compliance) · **hoog** (kost conversie of duidelijkheid) · **midden** (onderhoudsschuld).

### C.1 De premiumbelofte is al gratis geleverd — **kritiek**
- **Waar:** `PremiumWaitlistCard` body ("Premium vergelijkt je metingen automatisch en laat trends per domein zien") vs. `VoortgangDomeinRing`, `VoortgangRichtingBeat`, `LeefstijllijnSection`.
- **Wie merkt het:** iedereen die de hub doorscrollt en dan de kaart leest. Precies de tweede-bezoek-gebruiker die je wilt binden.
- **Fix-principe:** verkoop nooit wat op hetzelfde scrollpad gratis staat. De belofte wijkt, de gratis inhoud blijft.

### C.2 Leefstijllijn "staat aan de verkeerde kant" — **herclassificatie, niet hoog**
De juli-regel zegt: beweging over tijd = premium. Het blok staat gratis. De prompt noemt dit een breuk. **Ik draai dit om: niet het blok staat verkeerd, de regel is verlopen.** De hero heet inmiddels "Er zit beweging in", de hub draait op bewijsopbouw, en de hele juli-golf (Bewijsband, DomeinRing, RichtingBeat) is bewust op beweging gebouwd. Terugvorderen betekent het gratis product uitkleden ten gunste van een tier die niemand ooit gezien heeft.
**Fix-principe:** verplaats de as, niet het blok.

### C.3 `HistorySection` in beide bundels — **midden**
- Upgraden voegt drie blokken toe (waarvan één leeg) en herhaalt er één.
- Niemand merkt het vandaag — de tak is onbereikbaar. Het is een tweede waarheid die bij het openzetten van de gate meteen zichtbaar wordt.
- **Fix-principe:** één blok, één plek. Premium mag nooit "hetzelfde, maar nog een keer" zijn.

### C.4 De scheidslijn is een label, geen poort — **hoog**
- "Einde gratis advies" staat op positie 2 van 6; daarna volgen Jouw lijn, Je historie, de soft-upsell en een tegel — allemaal gratis.
- **Wie merkt het:** de nauwkeurige lezer, en dat is precies de doelgroep. Hij leest "einde gratis" en krijgt daarna nog drie gratis blokken. Dat leest als slordigheid of als truc.
- **Fix-principe:** een grenslabel mag alleen bestaan als er een grens is. Er is er geen → vervang door een inhoudelijke acthoofd (advies → analyse).

### C.5 Lichaamssamenstelling belooft twee dingen — **hoog**
- Hub: BINNENKORT-rij, badge "Binnenkort in te vullen".
- Statistieken: `HubCard` met slotje en badge "Premium".
- Het scherm zelf: geblurde grafieken, **geen CTA**, geen uitweg.
- **Fix-principe:** één belofte per scherm. Dit is "nog te bouwen", niet "betaald". Slotje weg, badge overal "Binnenkort", en het scherm krijgt een eerlijke lege staat plus de wearable-/interesse-haak die er al is.

### C.6 De blur op Lichaamssamenstelling toont verzonnen data — **kritiek**
- `ChartCard` rendert `<Sparkline data={MOCK_TREND} .../>` met `MOCK_TREND = [42, 48, 45, 52, 49, 55]` en legt daar een blur van 5px overheen.
- De gebruiker ziet een vage curve op een kaart met de titel "Gewicht" en "Lengte". De impliciete boodschap is: *wij hebben hier iets van jou dat je niet mag zien.* Er is niets. In een gezondheidscontext is dat de zwaarste vorm van misleiding in deze hele audit.
- **Fix-principe:** blur nooit iets dat niet bestaat. Een lege staat mag leeg zijn.

### C.7 De blur op Inzichten gijzelt zijn eigen uitleg — **hoog**
- `BlurredInsightTips` blurt `explainer[1]` en `explainer[2]` uit `getVitalityExplainer` — echte, voor hem gegenereerde regels over zijn eigen scores.
- Anders dan C.6 is dit geen verzinsel maar het omgekeerde probleem: je houdt zijn eigen interpretatie achter.
- **Fix-principe:** je kunt iemand zijn eigen data niet terugverkopen. Ontbluren.

### C.8 De soft-upsell-klik teleporteert naar de hub — **hoog**
- `openPremiumWaitlist` doet `setScreen("hub")` en scrollt daarna naar `#premium-begeleiding`.
- De gebruiker klikt op een uitnodiging middenin Statistieken en staat ineens op een ander scherm. De context waarin hij overtuigd werd (zijn eigen lijn) is weg.
- **Fix-principe:** de conversiekaart staat waar de overtuiging plaatsvindt. Geen navigatie tussen intentie en actie.

### C.9 Drie oppervlakken, drie locked-patronen — **hoog**
Statistieken: alleen tekst, geen preview. Inzichten: blur. Lichaam: blur + slotjes + geen CTA. Dat is geen systeem, dat is sediment.
**Fix-principe:** harmoniseer naar **nul** locked-patronen (zie E en H) — het enige patroon dat je consistent kunt volhouden zolang premium niet bestaat.

### C.10 Dode `StatisticsSection` = tweede gate én tweede meting — **midden**
- Staat in `DASHBOARD_SECTIONS` (`data/dashboard/index.ts:313`) maar in geen `TAB_SECTIONS`-lijst (`voortgang: ["voortgangHub"]`) → rendert nooit.
- Gebruikt `props.isMember` **rechtstreeks** in plaats van `resolveTrendsAccess`, en vuurt een eigen `dashboard_statistieken_upsell` met dezelfde payload als de echte impressie.
- **Fix-principe:** verwijderen. Twee gates die niet dezelfde regel volgen is per definitie een bug die wacht op een release.

### C.11 "Stap 1 van 3" en "Stap 2 van 3" — stap 3 bestaat niet — **midden**
Geverifieerd: `grep "Stap 3 van 3"` levert niets op in `src/`. De ladder telt tot 3 en stopt bij 2.
**Fix-principe:** of stap 3 benoemen (de doorstap naar Favorieten, "welk potje"), of de telling laten vallen.

### C.12 Het 2-koloms grid breekt de genummerde leesvolgorde — **hoog**
Bij ≥1024px viewport leest het oog kolomsgewijs: Waar sta je → Eerst je bord → Evidence-ladder → Ons oordeel. De eyebrows zeggen echter "Stap 1 van 3" en "Stap 2 van 3", met een niet-genummerde bewijsladder ertussen.
Bovendien vuurt `lg:` op 1024px viewport terwijl de cockpit-midden-zone dan ~744px is (open contextkolom) → twee kolommen van ~350px met per-domein-rijen van `label(72px) + balk + getal + "zwak"`. Die rijen persen.
**Fix-principe:** zie D.3 — het grid verdwijnt.

---

## D. Design / IA

### D.1 Nieuwe blokvolgorde op Statistieken

Vraag 1 uit de prompt: is de volgorde logisch voor gratis én premium? Onder de nieuwe as bestaat er maar één volgorde, want er is maar één staat. Die volgorde is:

```
1  WAAR JE STAAT, EN WAAR JE VANDAAN KOMT      ← samenvoeging van WaarStaJe + Jouw lijn
2  BEWIJSLADDER                                 ← EvidenceLadderCard, context voor het oordeel
3  STAP 1 · EERST JE BORD                       ← EerstJeBordCard
4  STAP 2 · ONS OORDEEL                         ← OnsOordeelCard
5  STAP 3 · WELK POTJE  →  Favorieten           ← doorstap, lost C.11 op
6  JE HISTORIE                                  ← HistorySection, ingeklapt
7  PRIORITEIT OVER TIJD                         ← PriorityOverTimePanel, uit premium gehaald
8  DE UITNODIGING                               ← PremiumWaitlistCard, in-place
9  BINNENKORT · Lichaamssamenstelling           ← rij zonder slotje
```

De redenering achter blok 1: vandaag rendert Statistieken **twee keer dezelfde domeinscores in twee visuele talen**, gescheiden door drie blokken — `WaarStaJeCard` als balken met getallen, `LeefstijllijnSection` als sparklines met begin/delta. Tel de `VoortgangDomeinRing` op de hub erbij en de gebruiker ziet zijn vijf tot zeven domeinen drie keer in twee schermen. Eén rendering per scherm:

- **hub** = bandniveau, geen getallen (`getScoreBandShortLabel`) — herkenning
- **Statistieken** = de lijn, mét begin, delta en de "zwak"-markering — analyse

De "zwak"-markering uit `WaarStaJeCard` verhuist naar de samengevoegde rij; de verbale kop, de body en de freshness-nudges blijven als tekst boven de rijen staan.

Advies vóór analyse of andersom? **Advies blijft eerst.** De routerij belooft "Wat je metingen zeggen over supplementen" en `dashboard.advies_gate_passed` meet dat mensen het oordeel bereiken. Maar met de samenvoeging staat de lijn nu ín het eerste blok, dus de gebruiker ziet zijn beweging meteen — zonder dat het advies naar beneden zakt.

### D.2 Het lot van de scheidslijn

**Verdwijnt als grenslabel, keert terug als acthoofd.** De echte overgang op dit scherm is niet gratis→betaald maar *analyse → advies*. Onder de nieuwe volgorde staat de overgang tussen blok 1–2 (wat je lijn laat zien) en blok 3–5 (wat wij ervan vinden). Exacte copy in H.2.

### D.3 Het 2-koloms grid bij 375 / 744 / 1280px

**Het grid verdwijnt.** Argumenten, in volgorde van gewicht:

1. De inhoud is een **genummerde reeks** ("Stap 1", "Stap 2", straks "Stap 3"). Twee kolommen breken een reeks per definitie (C.12).
2. `lg:` is de verkeerde meetlat: de midden-zone is ~744px bij open contextkolom terwijl `lg:` op 1024px viewport vuurt. Dat is de bekende breedte-val.
3. De per-domein-rijen hebben een harde minimumbreedte (`label 72px` + balk + getal + markering). Onder ~420px inner width worden ze onleesbaar.

Dus: **één kolom, met een leesbreedte-cap**, en de extra ruimte gaat naar bredere sparklines in plaats van naar een tweede kolom.

| Breedte | Gedrag |
|---|---|
| 375px viewport | 1 kolom, volle breedte binnen de tegel-padding |
| ~744px midden-zone (contextkolom open) | 1 kolom; sparklines krijgen de extra breedte |
| ≥1280px viewport, contextkolom dicht (~1100px midden-zone) | 1 kolom met `max-width` rond 720–760px, gecentreerd; nog steeds geen tweede kolom |

Als er tóch ergens twee kolommen moeten komen (bijvoorbeeld Je historie naast Prioriteit over tijd — twee niet-genummerde blokken), dan **uitsluitend via container-queries op de tegelwrapper**, drempel rond `@[680px]`, nooit via `lg:`. Dat is invariant 10 en het is hier voor het eerst van toepassing op dit bestand.

### D.4 Waar de gate visueel landt

Nergens. Dat is het punt. Onder de nieuwe as is er geen visuele gate op Statistieken, Inzichten of Lichaamssamenstelling. De enige "grens" die de gebruiker ziet is een uitnodiging — een kaart met een andere achtergrondkleur, onderaan, na alle inhoud. Geen slotje in de CTA-knop (het `Icons.Lock`-icoon in de wachtlijstknop suggereert ontgrendelen; dat klopt niet meer), geen blur, geen premium-badges.

**Wat blijft van de gate-machinerie:** `resolveTrendsAccess`, `DARK_LAUNCH` en de `hasFeature(accountId, "trends")`-read blijven bestaan als infrastructuur voor het moment dat begeleiding wél live gaat. Alleen de **call-sites in `VoortgangHub.tsx` verdwijnen**, omdat er niets meer te gaten valt. Dat is bewust: je haalt de nep-gates weg, niet de entitlement-laag.

---

## E. Premium-productdefinitie

### E.1 Het verhaal

> **Premium = begeleiding. Wekelijks iemand die met je meekijkt, tussen je check en je hermeting in.**

Niet statistieken (die zijn gratis en al geleverd). Niet een bundel (een bundel is wat je maakt als je niet durft te kiezen, en hij zou hier bestaan uit "gratis dingen + één dienst"). Coaching, punt.

Waarom dit standhoudt terwijl de dienst nog niet bestaat:
- Een wachtlijst hoort te gaan over iets dat er nog niet is. Dat is de enige eerlijke toepassing.
- Het is niet zelf te doen — anders dan elke statistiek in de app.
- Het is al vastgelegd in de plekken die het zwaarst wegen: de opgeslagen feature, de consent-tekst en de Kompas-copy.
- Het botst niet met invariant 4 (stepped care) of invariant 2 (geen medische claims), mits de dienst als *leefstijlbegeleiding* wordt beschreven en niet als beoordeling van klachten.

### E.2 Complete consequentielijst

| Plek | Nu | Wordt | Waarom |
|---|---|---|---|
| `PremiumWaitlistCard` eyebrow | "Premium · Statistieken" + `Icons.BarChart` | **"Premium · Begeleiding"** + een niet-grafiek-icoon | De grafiek-metafoor is de bron van de verwarring |
| `PremiumWaitlistCard` headline | "Zie precies waar je vooruitgang boekt — niet alleen een score." | zie H.1 | Verkoopt vandaag de gratis inhoud |
| `PremiumWaitlistCard` body | "…Premium vergelijkt je metingen automatisch en laat trends per domein zien." | zie H.1 | Idem |
| `PremiumWaitlistCard` prijszin | "Rond de prijs van een abonnement — we laten het weten bij launch." | zie H.1 | "Rond de prijs van een abonnement" zegt niets: elk abonnement is een abonnement |
| `PremiumWaitlistCard` CTA + slot-icoon | "Zet me op de wachtlijst voor Premium", `Icons.Lock` | zie H.1, **zonder slot-icoon** | Een slot impliceert dat er iets vergrendeld is |
| `PremiumWaitlistCard` plaatsing | in `VoortgangRouteList`, onderaan de hub | **onderaan Statistieken**, plus één stille regel op de hub | Zie F.2 |
| `premium-value-props.ts` — 4 props | alle vier statistiek-taal | **vier begeleidings-props**, waarvan expliciet gemarkeerd wat nog te bouwen is; zie H.3 | De props zijn de feitelijke productdefinitie in de UI |
| `PREMIUM_STATISTIEKEN_SOFT_UPSELL` | "Eén meting is een foto. Meerdere is een film." | **schrappen**; het blok wordt de uitnodiging zelf | De film is gratis. De zin is niet meer waar |
| `PremiumValuePropsList variant="comingSoonOnly"` | in de onbereikbare tak | **schrappen** | Zie B |
| `VITALITY_INSIGHTS_UPSELL_*` (3 constanten) | "Premium vergelijkt je vitaalscore over tijd…" | **schrappen**; Inzichten krijgt geen upsell meer | Inzichten wordt volledig gratis; één uitnodiging in de hele tab |
| `KompasBegeleidingLink` | correcte copy, stille link | **blijft, wordt de canonieke formulering** | Dit is de enige plek die het al goed zei |
| `/api/account/waitlist` `STORED_FEATURE` | `"premium-coaching"` | **ongewijzigd** | De backend had gelijk; de UI beweegt naar de backend |
| `PREMIUM_LAUNCH_EMAIL_CONSENT_TEXT` | "…zodra premium begeleiding live is." | **ongewijzigd** | Idem — en na deze wijziging klopt de consent-tekst voor het eerst bij wat eromheen staat |
| `resolveTrendsAccess` call-sites in `VoortgangHub.tsx` | 3 stuks | **verdwijnen** | Niets meer te gaten |
| `resolveTrendsAccess` / `DARK_LAUNCH` / `hasFeature` | live | **blijven** | Infrastructuur voor de begeleidingsdienst straks |
| `isMember`-prop | nooit doorgegeven | **blijft ongebruikt tot de dienst bestaat; dan doorgeven via `dashboardProps`** | Invariant 9 blijft gelden: `isMember` is de schakelaar. Nu doorgeven zonder dienst zou niets ontgrendelen |

### E.3 Wat premium expliciet **niet** wordt

Geen "trends per domein", geen "vergelijk je metingen", geen "sterke en zwakke punten", geen lichaamssamenstelling, geen wearables. Die vier zijn respectievelijk gratis, gratis, gratis en niet-gebouwd. Ze mogen niet in de bundel om hem te vullen (constraint uit de prompt, en terecht).

---

## F. Upgrade journey

### F.1 De momenten waarop hij vandaag de grens raakt

| Moment | Wat hij ziet | Wat hij verwacht | Wat ontbreekt |
|---|---|---|---|
| Hub, onderaan na drie gratis beweegblokken | Volle premiumkaart die trends per domein belooft | "Dat zag ik net toch al?" | Een reden waarom dit iets anders is dan wat hij net las |
| Statistieken, na Jouw lijn | "Eén meting is een foto. Meerdere is een film." | Dat de film achter de knop zit | De film staat drie blokken hoger. Klikken **gooit hem terug naar de hub** (C.8) |
| Jouw inzichten | Twee vage regels onder zijn eigen gauge | Dat daar een inzicht staat dat hij kan verdienen | Het is zijn eigen uitleg. Er is niets te verdienen, alleen te ontblurren |
| Lichaamssamenstelling | Twee vage grafieken, slotjes, **geen knop** | Een manier om verder te komen | Alles. Dit is een doodlopend scherm met verzonnen data |

Vier grensmomenten, twee productverhalen, drie vergrendelpatronen, één doodlopende weg.

### F.2 De nieuwe journey — één moment

```
Hub          →  bewijs, ring, richting, routes            geen aanbod
                 └ één stille regel in het BINNENKORT-blok: "Meer over begeleiding →"
Statistieken →  lijn → bewijsladder → bord → oordeel → potje → historie → prioriteit over tijd
                 └ DAARNA pas: de uitnodiging, in-place, met de wachtlijstkaart
Inzichten    →  volledig gratis, geen aanbod
Lichaam      →  eerlijke lege staat + "Binnenkort", geen aanbod
Kompas       →  KompasBegeleidingLink blijft de stille tweede ingang
```

Waarom onderaan Statistieken en niet op de hub: dat is het enige punt in de hele tab waar de gebruiker **zijn eigen bewijs net heeft gezien** — inclusief de domeinen waar niets beweegt. Precies daar is "wil je dat iemand hier wekelijks met je naar kijkt?" een logisch vervolg in plaats van een onderbreking. Op de hub, vóór het bewijs, is dezelfde vraag een verkooppraatje.

Risico dat ik erken: `premium_waitlist_shown surface="voortgang"` is vandaag de live impressie op de hub, en de hub heeft meer verkeer dan Statistieken. Verplaatsen kost impressies. Dat is bewust — de impressies die je verliest zijn precies de impressies vóór waardelevering, en die converteren het slechtst. J beschrijft hoe je dat naast elkaar afleest.

### F.3 De prijsvraag — **stellen, maar ná de join**

Het veld ligt volledig klaar: `/api/account/waitlist` accepteert `priceIndication` (`lt_10` | `10_20` | `20_35` | `gt_35` | `unknown`), schrijft het naar `price_indication` en vuurt `premium.price_indicated` met `price_band`. Geen enkele UI stuurt het. Tegelijk staat er een prijszin in de kaart die niets zegt.

**Besluit: stel de vraag, maar pas in de succesvolle staat van de kaart.**

Vandaag toont de `joined`-staat alleen "Je staat op de wachtlijst — we laten het weten zodra het er is." Dat is een dood eindpunt. Vervang het door dezelfde bevestiging plus één optionele vraag met vier banden en een "weet ik nog niet". Zie H.4.

Waarom ná en niet vóór:
- Vóór de join is een prijsvraag een commitment-signaal op het moment dat je nog nul waarde geleverd hebt — dat drukt de conversie en dat is precies de kritiek uit de groeihoek.
- Ná de join is de drempel nul: hij is al binnen. Het antwoord is puur winst.
- Mechanisch werkt het zonder API-wijziging: een tweede POST met `feature` + `priceIndication` doet een upsert op `(account_id, feature)` en zet `price_indication`. **Wel meesturen: `launchEmailOptIn: false` op die tweede call**, anders schrijf je een dubbele consent-rij weg voor toestemming die hij niet opnieuw gaf.

Dit is de goedkoopste echte informatie die het hele plan oplevert: je leert de prijsband vóór je één regel abonnementscode schrijft.

---

## G. Prioriteiten

### P0 — eerlijkheid herstellen (deze week)

| # | Actie | Onderbouwing |
|---|---|---|
| P0.1 | **`MOCK_TREND`-blur weg op Lichaamssamenstelling** | Verzonnen data als vergrendelde preview van zijn lichaam. Enige punt in deze audit met een echt compliance- en reputatiegewicht (L.1) |
| P0.2 | **Scheidslijn "Einde gratis advies" weg** | Een grenslabel zonder grens, gevolgd door drie gratis blokken. Eén regel werk, direct vertrouwenseffect |
| P0.3 | **Premium-copy van statistieken naar begeleiding** | Zolang de kaart trends verkoopt, verkoop je wat er gratis boven staat. Dit is de kern (C.1) |
| P0.4 | **Blur weg op Jouw inzichten** | Zijn eigen uitleg, achtergehouden (C.7) |
| P0.5 | **Soft-upsell-teleport naar de hub fixen** | Klik → ander scherm is een harde UX-bug op het conversiemoment (C.8) |

### P1 — het product opnieuw laten kloppen

| # | Actie | Onderbouwing |
|---|---|---|
| P1.1 | Premium-bundel legen: `HistorySection`, `NutritionIntakeSection`, `StatistiekenPriorityOverTime`, `RecommendedInsights` naar gratis; `SignalsSection` en `comingSoonOnly` eruit | Het gratis product wordt hiermee meetbaar rijker, en de tweede waarheid verdwijnt vóór hij ooit zichtbaar wordt |
| P1.2 | Statistieken-IA: samenvoeging Waar sta je + Jouw lijn, 2-koloms grid weg, stap 3 benoemen | D.1 en D.3; lost C.11 en C.12 op |
| P1.3 | Uitnodiging verplaatsen naar onderaan Statistieken; stille regel op de hub | F.2 |
| P1.4 | Lichaamssamenstelling: één belofte ("Binnenkort"), slotjes weg, eerlijke lege staat | C.5 |
| P1.5 | Meetsplitsing (J) — **in dezelfde PR als P1.3**, nooit los | Anders kun je het effect van de verplaatsing niet aflezen |
| P1.6 | Prijsvraag in de post-join-staat | F.3 |

### P2 — schuld afbetalen

| # | Actie | Onderbouwing |
|---|---|---|
| P2.1 | Dode `StatisticsSection` + `statistics`-sectietype + de bijbehorende `SECTION_RENDERERS`-regel verwijderen | Tweede gate met andere regel, plus een derde `dashboard_statistieken_upsell`-callsite (C.10) |
| P2.2 | `premium-value-props.ts` herschrijven naar begeleidings-props | E.2 |
| P2.3 | `isMember`-naad documenteren als bewuste dode prop tot de dienst bestaat | Invariant 9 |

### NIET-NU — expliciet buiten scope

- **Checkout, Stripe, prijspagina.** De wachtlijst is het mechanisme. Punt.
- **Entitlements echt aanzetten / `isMember` doorgeven.** Er is niets om te ontgrendelen; doorgeven zou een lege ervaring openzetten.
- **De begeleidingsdienst zelf bouwen** (threads, wekelijkse review, coach-inbox). Eerst de wachtlijst + prijsband, dan pas het ontwerp van de dienst.
- **Wearables / `SignalsSection` activeren.** De interesse-haak op de hub is genoeg (`wearable.interest_clicked`).
- **Lichaamssamenstelling-invoer bouwen.** Blijft "Binnenkort".
- **Nieuwe premium-features verzinnen om de bundel te vullen.** Dat is precies hoe de huidige situatie ontstond.
- **`DARK_LAUNCH` uitzetten.** Blijft `true` tot er een dienst achter zit.

---

## H. Copy-hiërarchie — exacte Nederlandse tekst

Woordenschat gerespecteerd: "Eerst je bord.", "naast je leefstijl", "Op basis van je laatste check", "Wij verkopen zelf niets."

### H.1 De uitnodiging (`PremiumWaitlistCard`, onderaan Statistieken)

> **Eyebrow:** `PREMIUM · BEGELEIDING`
>
> **Headline:** Je lijn lezen kun je zelf. Er wekelijks iemand naast hebben niet.
>
> **Body:** Alles hierboven blijft gratis — je scores, je lijn en ons oordeel. Waar we aan werken is het stuk daarna: iemand die elke week met je meekijkt, ziet waar het stokt, en je hermeting met je doorneemt. Dat bestaat nog niet. Wil je erbij zijn als het er is?
>
> **Prijszin:** We weten nog niet wat het gaat kosten. Wat we wel weten: je zit nergens aan vast en we vragen nu niets.
>
> **CTA:** Zet me op de wachtlijst voor begeleiding
>
> *(geen slot-icoon)*

### H.2 De vervanger van "Einde gratis advies"

De scheidslijn verdwijnt als grenslabel. Op de plek waar de analyse overgaat in het advies komt een acthoofd:

> **Eyebrow:** `WAT WE ERVAN VINDEN`
>
> **Headline:** Eerst je bord. Daarna pas een potje.
>
> **Body:** Op basis van je laatste check — en van wat je hierboven ziet bewegen.

### H.3 De vier value-props (`premium-value-props.ts`)

| id | title | body | status |
|---|---|---|---|
| `wekelijkse-meekijk` | Wekelijks iemand die meekijkt | Niet één keer per hermeting, maar elke week even langs je lijn — en een bericht als er iets opvalt. | nog te bouwen |
| `hermeting-samen` | Je hermeting samen doorlopen | Na 30 dagen kijk je niet alleen naar het verschil, maar hoor je ook waar het vandaan komt. | nog te bouwen |
| `vragen-tussendoor` | Vragen tussendoor | Loopt het vast, of twijfel je over een keuze naast je leefstijl? Je hoeft niet te wachten op je volgende check. | nog te bouwen |
| `bijsturen-in-je-plan` | Bijsturen in je plan | Je plan verandert mee met wat er werkt — niet pas als je er zelf iets van vindt. | nog te bouwen |

> Alle vier expliciet gelabeld als nog te bouwen. Dat is geen zwakte in een wachtlijst — het is de hele reden dat er een wachtlijst is. Wat je níet mag doen is één ervan als "beschikbaar" tonen om de lijst geloofwaardiger te maken.

### H.4 De post-join prijsvraag

Vervangt de kale bevestiging in de `joined`-staat:

> **Bevestiging:** Je staat op de lijst. We laten het weten zodra het er is — en niet vaker dan dat.
>
> **Vraag:** Nog één ding, als je wil: wat zou dit je per maand waard zijn?
>
> **Opties:** `Minder dan € 10` · `€ 10 – € 20` · `€ 20 – € 35` · `Meer dan € 35` · `Weet ik nog niet`
>
> **Voetregel:** Geen toezegging. We gebruiken het alleen om te bepalen of dit haalbaar is.

### H.5 De stille regel op de hub (in het BINNENKORT-blok)

> **Rij-titel:** Begeleiding naast je leefstijl
> **Rij-ondertitel:** Wekelijks iemand die met je meekijkt
> **Badge:** `In ontwikkeling`

Klik → naar Statistieken, gescrold naar de uitnodiging. Eén rij in plaats van een volle kaart, in hetzelfde blok waar Lichaamssamenstelling en wearable al staan — want het is exact hetzelfde soort belofte: nog niet gebouwd, wel op de rol.

### H.6 Lichaamssamenstelling — de eerlijke lege staat

> **Headline:** Hier komt je lichaamssamenstelling.
>
> **Body:** Vet, spier en vocht als aparte meetlat, naast je leefstijl. We bouwen dit nog — er staat nu niets van jou in.
>
> **Badge:** `Binnenkort`

Geen slotjes, geen geblurde grafieken, geen premium-badge. De `IDENTITY_FIELDS`-lijst toont wat bekend is en "—" voor de rest.

### H.7 De drie copy-wijzigingen met het grootste effect (analysevraag 11)

1. **De headline van de wachtlijstkaart** (H.1). Dit is het enige punt waar het product zichzelf definieert. Zolang daar "Zie precies waar je vooruitgang boekt" staat, verkoop je de gratis inhoud drie blokken hoger.
2. **"Einde gratis advies" → H.2.** Eén regel, en de gebruiker stopt met zoeken naar een muur die er niet is.
3. **De prijszin** (H.1). "Rond de prijs van een abonnement" is een niet-antwoord dat achterdocht wekt. "We weten nog niet wat het gaat kosten" is eerlijker en zwakker klinkend — en dus geloofwaardiger, precies in de toon van "Wij verkopen zelf niets."

---

## I. Wireframe 375px

### I.1 Statistieken, nieuwe grens

```
┌───────────────────────────────────────┐
│ ←   STATISTIEKEN                      │
├───────────────────────────────────────┤
│                                       │
│  OP BASIS VAN JE CHECK VAN 12 JULI    │
│  Waar je staat, en waar je            │
│  vandaan komt.                        │
│  Twee domeinen bewegen, drie staan    │
│  stil sinds je eerste check.          │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ 🌙 Slaap          Begin 48      │  │
│  │    ╭─╮   ╭──╮                   │  │
│  │ ───╯ ╰───╯  ╰──         61  +13 │  │
│  │    op basis van je check-ins     │  │
│  ├─────────────────────────────────┤  │
│  │ 🧠 Stress         Begin 55      │  │
│  │ ──╮   ╭────╮                    │  │
│  │   ╰───╯    ╰──          52  −3  │  │
│  ├─────────────────────────────────┤  │
│  │ 🏃 Beweging       Begin 41      │  │
│  │ ─────────────────       41   ·  │  │
│  │    120 min · 3 sessies deze week │  │
│  │                            zwak  │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ✦ Voeding is 34 dagen niet ververst. │
│    Een hermeting kan dit beeld — en   │
│    het advies hieronder — veranderen. │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ BEWIJSLADDER                    │  │
│  │ waar de onderbouwing sterk is   │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ─────────────────────────────────    │
│  WAT WE ERVAN VINDEN                  │
│  Eerst je bord. Daarna pas een potje. │
│  Op basis van je laatste check — en   │
│  van wat je hierboven ziet bewegen.   │
│  ─────────────────────────────────    │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ STAP 1 VAN 3 · UIT VOEDING      │  │
│  │ Dit haal je van tafel           │  │
│  │ · Magnesium — onder referentie  │  │
│  │ · Vitamine D — onder referentie │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ STAP 2 VAN 3 · ONS OORDEEL      │  │
│  │ Twee van de vier vallen af      │  │
│  │ [ verdicts ]                    │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ STAP 3 VAN 3 · WELK POTJE       │  │
│  │ Je keuzes en onze aanraders  →  │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ 🕐 Je historie               ▾  │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ Prioriteit over tijd            │  │
│  │ ● Check 1  Slaap                │  │
│  │ │                               │  │
│  │ ● Check 2  Beweging             │  │
│  └─────────────────────────────────┘  │
│                                       │
└───────────────────────────────────────┘
```

### I.2 Het upgrade-moment — direct daaronder, zelfde scroll

```
│  ┌─────────────────────────────────┐  │
│  │▓ PREMIUM · BEGELEIDING          │  │
│  │▓                                │  │
│  │▓ Je lijn lezen kun je zelf.     │  │
│  │▓ Er wekelijks iemand naast      │  │
│  │▓ hebben niet.                   │  │
│  │▓                                │  │
│  │▓ Alles hierboven blijft gratis  │  │
│  │▓ — je scores, je lijn en ons    │  │
│  │▓ oordeel. Waar we aan werken is │  │
│  │▓ het stuk daarna: iemand die    │  │
│  │▓ elke week met je meekijkt,     │  │
│  │▓ ziet waar het stokt, en je     │  │
│  │▓ hermeting met je doorneemt.    │  │
│  │▓ Dat bestaat nog niet. Wil je   │  │
│  │▓ erbij zijn als het er is?      │  │
│  │▓                                │  │
│  │▓ ○ Wekelijks iemand die meekijkt│  │
│  │▓   NOG TE BOUWEN                │  │
│  │▓ ○ Je hermeting samen doorlopen │  │
│  │▓   NOG TE BOUWEN                │  │
│  │▓ ○ Vragen tussendoor            │  │
│  │▓   NOG TE BOUWEN                │  │
│  │▓ ○ Bijsturen in je plan         │  │
│  │▓   NOG TE BOUWEN                │  │
│  │▓                                │  │
│  │▓ We weten nog niet wat het gaat │  │
│  │▓ kosten. Wat we wel weten: je   │  │
│  │▓ zit nergens aan vast en we     │  │
│  │▓ vragen nu niets.               │  │
│  │▓                                │  │
│  │▓ ☐ Ik wil per e-mail bericht    │  │
│  │▓   ontvangen zodra premium      │  │
│  │▓   begeleiding live is. …       │  │
│  │▓                                │  │
│  │▓ ┌───────────────────────────┐  │  │
│  │▓ │ Zet me op de wachtlijst   │  │  │
│  │▓ │ voor begeleiding          │  │  │
│  │▓ └───────────────────────────┘  │  │
│  └─────────────────────────────────┘  │
│                                       │
│  BINNENKORT                           │
│  ─────────────────────────────────    │
│  Lichaamssamenstelling   [Binnenkort] │
│  Vet, spier en vocht als meetlat   →  │
│                                       │
└───────────────────────────────────────┘

  na de join, dezelfde kaart:
│  ┌─────────────────────────────────┐  │
│  │ ✓ Je staat op de lijst. We      │  │
│  │   laten het weten zodra het er  │  │
│  │   is — en niet vaker dan dat.   │  │
│  │                                 │  │
│  │ Nog één ding, als je wil: wat   │  │
│  │ zou dit je per maand waard zijn?│  │
│  │ ┌──────────┐ ┌────────────────┐ │  │
│  │ │ < € 10   │ │ € 10 – € 20    │ │  │
│  │ └──────────┘ └────────────────┘ │  │
│  │ ┌──────────────┐ ┌────────────┐ │  │
│  │ │ € 20 – € 35  │ │ > € 35     │ │  │
│  │ └──────────────┘ └────────────┘ │  │
│  │ ┌─────────────────────────────┐ │  │
│  │ │ Weet ik nog niet            │ │  │
│  │ └─────────────────────────────┘ │  │
│  │ Geen toezegging. We gebruiken   │  │
│  │ het alleen om te bepalen of dit │  │
│  │ haalbaar is.                    │  │
│  └─────────────────────────────────┘  │
```

---

## J. Meetplan

### J.1 De gemengde eventnaam — oplossen door te schrappen, niet door toe te voegen

Vandaag vuurt `dashboard_statistieken_upsell` vanaf drie call-sites:

| Call-site | Betekenis | Payload |
|---|---|---|
| `VoortgangHub.tsx:589` (`StatistiekenView`) | **impressie** | `{ state:"locked", surface:"voortgang" }` |
| `VoortgangHub.tsx:923` (`openPremiumWaitlist`) | **klik** | `{ state:"locked", surface, cta:"soft_upsell" }` |
| `Dashboard.tsx:2183` (dode `StatisticsSection`) | impressie, onbereikbaar | zelfde payload als de eerste |

Plus de asymmetrie: de klik vanaf Inzichten vuurt óók `dashboard_statistieken_upsell` (`surface:"inzichten"`), terwijl de impressie daar `dashboard_inzichten_upsell` heet.

**Ik voeg geen splitsings-event toe. Ik schrap het probleem.** Onder de nieuwe architectuur is er geen "soft-upsell-klik die naar een andere kaart navigeert" meer — de kaart staat in-place. Wat overblijft is de kaart zelf, en die had al de juiste twee events:

| Fase | Event | Status | Payload na wijziging |
|---|---|---|---|
| Impressie | `premium_waitlist_shown` | **bestaat** | `{ surface }` — `surface` wordt `"statistieken"` i.p.v. `"voortgang"` |
| Conversie | `premium_waitlist_join` | **bestaat** | `{ feature:"premium-coaching", surface, launch_email_opt_in }` |
| Prijsband | `premium.price_indicated` (domain-event) | **bestaat, server-side** | `{ feature, surface, price_band }` |
| Wachtlijst-domain-event | `premium.waitlist_joined` | **bestaat** | ongewijzigd |

Te schrappen: `dashboard_statistieken_upsell` (alle drie de call-sites) en `dashboard_inzichten_upsell`. Beide meten een vergrendelde staat die niet meer bestaat. Een impressie-klik-ratio wordt daarmee voor het eerst betrouwbaar, want hij loopt over twee events die elk precies één ding betekenen.

Te behouden zonder wijziging: `dashboard_voortgang_hub_click`, `dashboard_voortgang_bewijs_state`, `dashboard_voortgang_terug`, `dashboard_voortgang_domein_click`, `dashboard_advies_blok_getoond`, `dashboard_evidence_open`, `dashboard_ladder_step_click`, `dashboard_kompas_begeleiding_link_click`, `wearable_interest`, `dashboard_lichaamssamenstelling_getoond`, en de domain-events `dashboard.advies_gate_passed` en `wearable.interest_clicked`.

**Eén nieuwe parameter, geen nieuw event:** voeg `offer: "begeleiding"` toe aan `premium_waitlist_shown` en `premium_waitlist_join`. Dan blijft de historische reeks leesbaar over de omslag heen: alles vóór de wijziging heeft geen `offer`, alles erna wel. Geen drievoudige registratie nodig — `trackEvent` is de generieke GA4-helper.

Clarity-tags: `dashboard_statistieken` (`locked` | `soft_upsell_click`) vervalt; `premium_value_props` (`statistieken_locked`) vervalt. `premium_waitlist` (`shown`) blijft en krijgt er `price_answered` bij voor de post-join-vraag.

### J.2 Cohorten — gratis vs. premium is vandaag niet leesbaar; iets beters wel

Er is geen premium-cohort en dat komt er voorlopig ook niet. De relevante splitsing is niet *gratis vs. betaald* maar **hoeveel bewijs de gebruiker had toen hij de uitnodiging zag**. Die dimensie bestaat al en is gratis:

| Cohort | Bron | Waarom dit de vraag beantwoordt |
|---|---|---|
| `bewijs_state` = `wachtend` / `dun` / `opbouwend` / `beantwoord` | `dashboard_voortgang_bewijs_state { state }` op de hero | Kruis dit met `premium_waitlist_join`: converteert de uitnodiging beter naarmate er meer bewijs ligt? Dat is de hele hypothese achter F.2 |
| `surface` = `statistieken` vs. `voortgang` | `premium_waitlist_shown { surface }` | Leest het effect van de verplaatsing af. Historische `voortgang`-rijen blijven de baseline |
| `advies_state` | `dashboard_advies_blok_getoond { state }` + `dashboard.advies_gate_passed` | Onderscheidt wie het oordeel al bereikte (voedingscheck gedaan) van wie erin vastliep |
| `launch_email_opt_in` true/false | `premium_waitlist_join` | Meet consent-kwaliteit; een opt-in-ratio die richting 100% loopt is een signaal van consent-bias, niet van enthousiasme (L.2) |
| `price_band` | `premium.price_indicated` (PostHog, server-side) | De enige harde input voor de prijsbeslissing |

Wanneer begeleiding wél live gaat, komt de gratis/premium-splitsing erbij via een `is_member`-parameter (entitlement-afgeleide boolean, geen PII). Nu niet bouwen — er is niets om tegen af te zetten.

### J.3 Invarianten die dit meetplan respecteert

Geen ruwe domeinscores, geen antwoorden, geen profiellabel, geen sessionId/accountId in GA4 of Clarity. Numerieke waarden (scores, delta's) blijven in `domain_events`, server-side. Geen nieuw domain-event → geen drievoudige registratie nodig. Elke geactiveerde of verplaatste CTA krijgt zijn meetpunt in dezelfde wijziging (invariant 11).

**Meetpunt: `premium_waitlist_shown { surface, offer }` → `premium_waitlist_join { feature, surface, offer, launch_email_opt_in }` → `premium.price_indicated { price_band }`, gekruist met `dashboard_voortgang_bewijs_state { state }` — hier lees je het effect af.**

---

## K. Implementatie-slices (Cursor-ready)

### Slice 1 — Eerlijke grens (P0)

**Doel.** Geen vergrendelde pixel meer die niets vergrendelt, en geen verzonnen data achter blur.

**Raakvlak.** `VoortgangHub.tsx` (`LichaamssamenstellingView`, `ChartCard`, `VitaalscoreInzichtenView`, `BlurredInsightTips`, `StatistiekenView`-scheidslijn), `MOCK_TREND`-constante.

**Acceptatiecriteria.**
1. `MOCK_TREND` en `ChartCard` zijn verwijderd; Lichaamssamenstelling toont de lege staat uit H.6 zonder blur, zonder slotjes in `IDENTITY_FIELDS`, met badge "Binnenkort".
2. `BlurredInsightTips` rendert zonder `filter: blur(...)` en zonder `aria-hidden`; de twee explainer-regels zijn gewoon leesbaar.
3. De scheidslijn met de tekst "Einde gratis advies" bestaat niet meer in `src/`.
4. `grep -rn "blur(" src/components/dashboard/` levert geen treffers meer op in het Voortgang-pad.
5. `dashboard_lichaamssamenstelling_getoond` blijft vuren met ongewijzigde payload; geen nieuw event in deze slice.

**Niet aanraken.** `resolveTrendsAccess`, `DARK_LAUNCH`, `hasFeature`, `/api/account/waitlist`, `PREMIUM_LAUNCH_EMAIL_CONSENT_TEXT`, de hub-componenten.

---

### Slice 2 — Premium is begeleiding (P0)

**Doel.** Eén productverhaal in de UI, gelijk aan wat de API en de consent-tekst al zeggen.

**Raakvlak.** `PremiumWaitlistCard.tsx`, `premium-value-props.ts`, `PremiumValuePropsList`, `vitality-score-copy.ts` (de drie `VITALITY_INSIGHTS_UPSELL_*`-constanten), `VoortgangHub.tsx` (`StatistiekenSoftUpsell`, `VitaalscoreInzichtenView`-upsellblok).

**Acceptatiecriteria.**
1. Eyebrow, headline, body, prijszin en CTA van `PremiumWaitlistCard` zijn exact de teksten uit H.1; het `Icons.Lock`-icoon in de CTA is weg en `Icons.BarChart` in de eyebrow is vervangen.
2. `PREMIUM_STATISTIEKEN_VALUE_PROPS` bevat de vier props uit H.3; elke prop is zichtbaar gemarkeerd als nog te bouwen; `PREMIUM_STATISTIEKEN_SOFT_UPSELL` en de `comingSoonOnly`-variant bestaan niet meer.
3. De upsell op Jouw inzichten is volledig verwijderd (blok + de drie `VITALITY_INSIGHTS_UPSELL_*`-constanten); Inzichten heeft geen premium-verwijzing meer.
4. `feature: "premium-coaching"` in de POST is ongewijzigd; `PREMIUM_LAUNCH_EMAIL_CONSENT_TEXT` is ongewijzigd.
5. `grep -rn "Premium · Statistieken\|foto. Meerdere is een film" src/` levert niets op.

**Niet aanraken.** `KompasBegeleidingLink` (copy is al goed), de waitlist-route, de consent-tabel, `affiliate`-paden.

---

### Slice 3 — Eén uitnodiging op de juiste plek (P1, inclusief meting)

**Doel.** De conversiekaart staat waar de overtuiging plaatsvindt; de teleport-bug is weg; het effect is af te lezen.

**Raakvlak.** `VoortgangRouteList.tsx`, `VoortgangHub.tsx` (`StatistiekenView`, `openPremiumWaitlist`), `PremiumWaitlistCard.tsx` (surface-prop), `Dashboard.tsx:2183` en de dode `StatisticsSection`-callsite.

**Acceptatiecriteria.**
1. `PremiumWaitlistCard` rendert onderaan `StatistiekenView` met `surface="statistieken"`, ná Je historie en Prioriteit over tijd; hij staat niet meer in `VoortgangRouteList`.
2. Op de hub staat in het BINNENKORT-blok één rij volgens H.5 die naar Statistieken navigeert en daar naar `#premium-begeleiding` scrollt — zonder tussenliggende schermwissel bij een klik ín Statistieken.
3. `openPremiumWaitlist` doet geen `setScreen("hub")` meer.
4. `dashboard_statistieken_upsell` en `dashboard_inzichten_upsell` bestaan niet meer in `src/`; `premium_waitlist_shown` en `premium_waitlist_join` krijgen beide de parameter `offer: "begeleiding"`.
5. Clarity: `dashboard_statistieken` en `premium_value_props` tags zijn verwijderd; `premium_waitlist` (`shown`) blijft.

**Niet aanraken.** `dashboard_voortgang_hub_click`, `dashboard_voortgang_bewijs_state`, `wearable_interest`, `wearable.interest_clicked`, de advies-events.

---

### Slice 4 — Statistieken-IA (P1)

**Doel.** Eén per-domein-rendering per scherm, één leesvolgorde, geen viewport-breakpoint.

**Raakvlak.** `StatistiekenAdviesSection.tsx`, `LeefstijllijnSection.tsx`, `VoortgangHub.tsx` (`StatistiekenView`), `SupplementVerdictPanel.tsx` (stap-eyebrow).

**Acceptatiecriteria.**
1. `WaarStaJeCard` toont geen balken met getallen meer; de per-domein-rijen komen uit de Leefstijllijn-rendering, aangevuld met de `isWeak`-markering; de verbale kop, body en freshness-nudges blijven.
2. De klasse `lg:grid-cols-2` bestaat niet meer in `StatistiekenAdviesSection.tsx`; de sectie is één kolom met een leesbreedte-cap. Waar tóch twee kolommen nodig zijn, gebeurt dat via `@container` / `@[Npx]:`, nooit via `lg:`.
3. Op 375px, op een midden-zone van ~744px én op ≥1280px met gesloten contextkolom is de leesvolgorde identiek en breken de domeinrijen niet.
4. De acthoofd-copy uit H.2 staat tussen de analyse en het advies; blokvolgorde volgt D.1.
5. Er bestaat een blok met eyebrow "Stap 3 van 3 · Welk potje" dat naar Favorieten leidt, of de "van 3"-telling is uit alle eyebrows verwijderd — niet iets ertussenin.

**Niet aanraken.** `getUsableClaims`/`REASON_TEXT`-paden, `buildStatistiekenAdviesModel`, de scoring-engine, `buildLeefstijllijnRows`-signatuur.

---

### Slice 5 — Premium-bundel legen (P1)

**Doel.** Eén waarheid over wat er op Statistieken staat; geen onbereikbare tak meer.

**Raakvlak.** `Dashboard.tsx` (`freeStatistics` / `unlockedStatistics` rond 3522–3533), `VoortgangHub.tsx` (de drie `resolveTrendsAccess`-call-sites), `VitaalscoreInzichtenView` (`RecommendedInsights`).

**Acceptatiecriteria.**
1. `StatistiekenPriorityOverTime`, `NutritionIntakeSection` en `HistorySection` renderen onvoorwaardelijk op Statistieken; elk exact één keer.
2. `SignalsSection` rendert niet meer op Statistieken; `RecommendedInsights` rendert onvoorwaardelijk op Jouw inzichten.
3. De props `freeStatistics` en `unlockedStatistics` bestaan niet meer op `VoortgangHub`; de drie `resolveTrendsAccess`-aanroepen in dat bestand zijn weg.
4. `resolveTrendsAccess`, `DARK_LAUNCH` en `hasFeature(accountId, "trends")` bestaan nog, ongewijzigd; `isMember` blijft een ongebruikte prop met een comment dat verwijst naar de begeleidingsdienst.
5. `npx tsc --noEmit` en `vitest` slagen; `eslint --max-warnings 0` meldt geen ongebruikte imports in `Dashboard.tsx`.

**Niet aanraken.** `src/lib/entitlement-access.ts`, `src/lib/db/entitlements.ts`, `account_entitlements`, `/dashboard/page.tsx` (de `hasFeature`-read blijft).

---

### Slice 6 — Prijsvraag na de join (P1)

**Doel.** De prijsband leren zonder de conversie te belasten.

**Raakvlak.** `PremiumWaitlistCard.tsx` (`joined`-staat), `/api/account/waitlist` (alleen als consument, geen wijziging).

**Acceptatiecriteria.**
1. De `joined`-staat toont de bevestiging plus de vraag en vijf opties uit H.4.
2. Een keuze doet één POST naar `/api/account/waitlist` met `{ feature: "premium-coaching", surface, priceIndication, launchEmailOptIn: false }`; er wordt geen tweede consent-rij weggeschreven.
3. Na antwoorden verdwijnt de vraag en blijft alleen de bevestiging staan; de vraag komt niet terug bij een volgende bezoek in dezelfde sessie.
4. `premium.price_indicated` verschijnt in PostHog met de gekozen `price_band`; `clarityTag("premium_waitlist", "price_answered")` vuurt.
5. Overslaan is mogelijk zonder enige negatieve staat — geen herinnering, geen badge, geen tweede vraag.

**Niet aanraken.** De route-validatie van `PRICE_INDICATIONS`, de `premium_waitlist`-upsertsleutel, `consent_records`, de rate limiter.

---

### Slice 7 — Dode `StatisticsSection` opruimen (P2)

**Doel.** Eén gate-regel in de codebase.

**Raakvlak.** `Dashboard.tsx` (`StatisticsSection`, `SECTION_RENDERERS.statistics`), `src/data/dashboard/index.ts` (`DASHBOARD_SECTIONS`-regel, sectietype), `src/types/dashboard.ts` (`DashboardSectionType`).

**Acceptatiecriteria.**
1. `StatisticsSection` en het sectietype `statistics` bestaan niet meer.
2. `grep -rn "resolveTrendsAccess" src/` levert alleen nog treffers in `entitlement-access.ts` (en eventuele tests) op.
3. `TAB_SECTIONS` is ongewijzigd; geen enkele tab verliest een sectie.
4. `npx tsc --noEmit`, `vitest` en `eslint --max-warnings 0` slagen.
5. `grep -rn "console.log" src/` levert niets op.

**Niet aanraken.** `voortgangHub`-renderer, `kompasHome`, `retest`, `future`, alle overige sectietypes.

---

## L. Risico's en anti-patterns

### L.1 Misleidende blur — het zwaarste punt

`ChartCard` blurt `MOCK_TREND` onder de titels "Gewicht" en "Lengte". De gebruiker ziet een vage curve op een scherm dat over zijn lichaam gaat. De impliciete boodschap — *wij hebben hier data van jou* — is onwaar. In een gezondheidscontext, bij een publiek dat het platform juist kiest vanwege onafhankelijkheid, is dit het snelste pad naar reputatieschade dat in de codebase te vinden is. Eén screenshot met een bijschrift is genoeg.

Nuance die ik expliciet maak omdat het anders overdreven wordt: dit is **geen AVG art. 9-overtreding** — er wordt geen gezondheidsgegeven onrechtmatig verwerkt, er wordt er juist geen enkele verwerkt. Het is een misleidende handelspraktijk-risico en een vertrouwensrisico, geen datalek. Dat maakt het niet minder P0.

Het tweede blur-geval (Inzichten) is juridisch nog lichter maar product-inhoudelijk pijnlijker: daar houd je zijn **eigen** uitleg achter. Ook geen art. 15-schending — het inzagerecht gaat over een verzoek, niet over een UI — maar het is precies de houding die "de Consumentenbond van supplementen" niet kan hebben.

### L.2 Consent-bias in de launch-e-mailcheckbox

De checkbox staat standaard uit en de tekst is volledig (inclusief "geen medisch advies en geen diagnose" en het intrekkingsrecht). Dat is goed. Het risico zit in de **positie**: de checkbox staat direct boven de primaire knop, waardoor hij als onderdeel van de handeling leest in plaats van als losse keuze. Meetbaar maken via de `launch_email_opt_in`-ratio in `premium_waitlist_join`: als die richting 100% kruipt terwijl hij pre-ticked nooit is geweest, is de plaatsing het probleem. Mitigatie zonder herontwerp: visueel meer scheiding tussen de checkbox en de knop, en de knoptekst mag nooit naar de e-mail verwijzen.

### L.3 Premium beloven zonder bereikbare premium-ervaring

Dat is de status quo en het blijft de status quo — met één cruciaal verschil: nu belooft de UI iets dat gratis op hetzelfde scherm staat; straks belooft hij expliciet iets dat nog niet bestaat, gelabeld als nog te bouwen. Het eerste is misleidend, het tweede is een wachtlijst. Het risico dat overblijft is **tijd**: een wachtlijst die twaalf maanden stil is, wordt zelf een geloofwaardigheidsprobleem. Mitigatie: de `launch_email_opt_in`-lijst is een verplichting, geen bezit. Als begeleiding niet binnen redelijke termijn komt, is één eerlijke mail ("we bouwen dit voorlopig niet") beter dan stilte.

### L.4 KOAG en medische claims

De nieuwe copy bevat geen claim, geen numerieke totaalscore en geen diagnose-taal. Twee aandachtspunten bij uitvoering:
- De begeleidings-props mogen geen resultaat suggereren ("je slaapt beter"), alleen handeling ("iemand kijkt mee"). H.3 is zo geformuleerd.
- `VoortgangRichtingBeat` toont numerieke domeinscores en bandlabels naast elkaar. Dat is domeinscore, geen totaalscore, dus binnen invariant 3 — maar het is de zwaarste getal-exposure in de tab en verdient bewustzijn bij elke volgende copy-ronde.

### L.5 Conversierisico van de verplaatsing

De hub heeft meer verkeer dan Statistieken; de uitnodiging verplaatsen kost impressies. Dat is een bewuste ruil (F.2) en J.2 beschrijft hoe je hem afleest. Als `premium_waitlist_join` per bezoeker daalt en niet alleen per impressie, is de stille hub-regel te zwak en verdient hij meer gewicht — niet de terugkeer van de volle kaart.

### L.6 Anti-patterns die ik expliciet vermijd

| Anti-pattern | Waarom niet |
|---|---|
| **Sparklines terugvorderen naar premium** om de juli-regel te redden | Ruilt een werkend gratis product voor een hypothetisch betaald product. De regel verliest, niet het product |
| **Bundelen** ("statistieken + coaching") | Een bundel waarvan de helft al gratis is, is geen bundel maar verwarring met een prijskaartje |
| **Blur harmoniseren door hem overal toe te passen** | Consistentie in een fout patroon is nog steeds fout. Harmoniseren naar nul is het antwoord |
| **Een preview-blok op Statistieken bouwen** zodat de drie oppervlakken matchen | Er is niets om te previewen; je zou het moeten verzinnen — en dan zit je in L.1 |
| **`isMember` doorgeven om de tak te "activeren"** | Zou vijf lege wearable-kaarten en een duplicaat-historie ontsluiten. Actief schade toebrengen aan de eerste betalende gebruiker |
| **De prijsvraag vóór de join stellen** | Commitment vragen vóór waardelevering; drukt de conversie op het enige conversiepunt dat er is |
| **Streaks, badges of een tweede score toevoegen** om het gratis product "compleet" te laten voelen | Invariant 5, en het gratis product is na deze wijzigingen rijker dan het was |
| **Een nieuw meet-event verzinnen voor de splitsing impressie/klik** | Het probleem verdwijnt met de soft-upsell zelf; twee bestaande events dekken de funnel al |

---

## Kritiekronde

Verplichte zelfkritiek vanuit vier perspectieven. **Wat hieruit kwam is al verwerkt in A–L**; per punt markeer ik wat er t.o.v. mijn eerste versie veranderde.

### 1. De 46-jarige gebruiker, tweede bezoek, nog niets betaald

- *"Ik scroll drie schermen met grafieken over mezelf en onderaan vraagt iemand of ik wil betalen voor grafieken. Denken ze dat ik niet kijk?"* — De scherpste kritiek van allemaal, en de reden dat E.1 het hele verhaal omgooit in plaats van de grens te verschuiven.
- *"Waarom moet ik mijn eigen uitleg vrijkopen?"* — De blur op Inzichten voelt kleinzielig op een manier die niet past bij "wij verkopen zelf niets".
- *"Vier keer een aanbod in één tabblad."* — Herhaling leest als drukte, niet als aanbod.
- **Verbetering:** één uitnodiging, ná het bewijs, en niets vergrendeld.
- **Δ t.o.v. versie 1:** in versie 1 hield ik de wachtlijstkaart op de hub *én* onderaan Statistieken ("meer contactmomenten"). Geschrapt na dit perspectief — twee volle kaarten voor een dienst die niet bestaat, is dezelfde fout in het klein.

### 2. Compliance (KOAG / AVG)

- **Geblurde `MOCK_TREND` is het echte probleem**, niet de grens. Misleidend in een gezondheidscontext.
- *"Premium" suggereren bij een feature die niet bestaat* is riskanter dan een wachtlijst voor iets dat expliciet nog gebouwd wordt. Het woord "Premium" op een slotje impliceert koopbaarheid; die bestaat niet.
- De consent-checkbox is inhoudelijk correct maar staat te dicht op de primaire knop.
- **Verbetering:** blur weg, "Premium"-badges vervangen door "Binnenkort" waar niets koopbaar is, opt-in-ratio meten als bias-signaal.
- **Δ t.o.v. versie 1:** ik schreef aanvankelijk dat de blur op Inzichten "op gespannen voet staat met het inzagerecht (art. 15)". Dat is te ver: art. 15 gaat over een verzoek, niet over een UI. Herschreven naar een product- en vertrouwensargument. Ook art. 9 expliciet afgezwakt in L.1 — overclaimen op compliance maakt de rest van de analyse minder geloofwaardig.

### 3. Groei en conversie

- *Is de wachtlijst nog het juiste instrument?* Ja — maar alleen voor iets dat nog niet bestaat. Voor iets dat al gratis is, is het geen wachtlijst maar een vergissing.
- *Je vraagt commitment zonder ooit waarde geleverd te hebben.* Klopt vandaag, want de kaart staat op de hub vóór het bewijs. Onderaan Statistieken is er wél waarde geleverd: hij heeft net zijn eigen lijn gezien.
- *Je verliest impressies door de verplaatsing.* Erkend en gemeten (L.5).
- **Verbetering:** het conversiepunt verhuist naar het punt van maximale bewijskracht, en de prijsvraag komt ná de join — nul frictie, maximale informatie.
- **Δ t.o.v. versie 1:** versie 1 stelde de prijsvraag vóór de join als "kwalificerende stap". Omgedraaid na dit perspectief: kwalificeren op het enige conversiepunt dat je hebt, is conversie weggooien.

### 4. Frontend-ontwikkelaar

- `VoortgangHub.tsx` is 1014 regels met vijf views, drie gate-aanroepen en inline styles door elkaar met Tailwind. Elke wijziging raakt alles.
- `Dashboard.tsx` is 4088 regels en bevat secties die nergens gerenderd worden. `StatisticsSection` gebruikt een ándere gate dan de rest.
- Staatsexplosie: `freeStatistics` en `unlockedStatistics` worden als `ReactNode`-props van `Dashboard` naar `VoortgangHub` gesluisd — een pattern dat alleen bestaat omdat de gate op de verkeerde plek zit.
- 375px is de maat, maar `lg:` is de gebruikte breakpoint; container-queries zijn nog nergens toegepast in dit pad.
- **Verbetering:** slice 5 laat de `ReactNode`-props volledig verdwijnen (de blokken renderen gewoon in `StatistiekenView`), slice 7 haalt de tweede gate weg, slice 4 vervangt `lg:` door één kolom.
- **Δ t.o.v. versie 1:** versie 1 hield `freeStatistics`/`unlockedStatistics` in stand "voor als premium live gaat". Geschrapt: props bewaren voor een tak die je net leeggehaald hebt, is precies het soort dode structuur dat deze audit moest opruimen. De entitlement-*laag* blijft; de doorgeef-props gaan.

---

## Aannames

- **AANNAME:** de begeleidingsdienst wordt daadwerkelijk overwogen. Als dat niet zo is, vervalt de hele premium-laag en is de conclusie eenvoudiger: haal de wachtlijst weg en lever een volledig gratis product tot er wél iets te verkopen is. De analyse hierboven blijft dan geldig behalve sectie E en slice 6.
- **AANNAME:** `RecommendedInsights` bevat geen kennisbank-inhoud die elders bewust achter een tier zit. Zo niet, dan blijft dat blok buiten slice 5 en wordt het apart gewogen tegen de moat-/gating-notitie.
- **AANNAME:** de `premium_waitlist`-tabel heeft een unieke sleutel op `(account_id, feature)` — de route gebruikt die als `onConflict`, dus de tweede POST in slice 6 werkt als upsert.
- **AANNAME:** verplaatsen van de wachtlijstkaart van hub naar Statistieken is acceptabel als conversierisico. Zo niet, dan is de hub-variant een compacte kaart (geen volle) en blijft de volle kaart op Statistieken.

---

**Volgende stap.** Review B (matrix), E (productdefinitie) en G (prioriteiten). Daarna per slice uit K een Cursor-prompt via de `cursor-prompt`-skill, in de volgorde 1 → 2 → 3 → 4 → 5 → 6 → 7. Slice 3 bevat verplicht de meetwijziging uit J; die gaat nooit in een aparte PR.
