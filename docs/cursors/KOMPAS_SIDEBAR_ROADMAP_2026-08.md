# Roadmap — Kompas-zijbalk als keuzehart

> **Status:** contract, geen analyse. Dit doc legt de surface-rollen vast zodat de Opus-ronde
> daarna alleen nog de *uitvoering* toetst, niet opnieuw of afvinken op Kompas mag.
> **Datum:** 22 augustus 2026
> **Leest voort op:** [`opus-ecosysteem-aanbevelingsmotor-verdict-2026-08.md`](opus-ecosysteem-aanbevelingsmotor-verdict-2026-08.md) §C/§D/§F/§I ·
> [`claude-opus-beweging-mijn-dag-verdict-2026-08.md`](claude-opus-beweging-mijn-dag-verdict-2026-08.md) (afvink-KILL's)
> **Voor de Opus-prompt geldt dit doc als VAST.** Heropenen mag alleen onder een kop `PIVOT` mét schade-analyse.
>
> **26 augustus 2026 — lees §8 en §9 vóór §7.** Die PIVOT overschrijft W4b/W4c, nuanceert lock N1,
> en vervangt de slice-volgorde door een domein-volgorde (D1–D5). §7.3 blijft gelden.

---

## 1. Vaste surface-rollen

| Surface | De ene vraag | Wel | Niet |
|---|---|---|---|
| **Kompas home** | Waar sta ik vandaag? | Prioriteitsdomein, ringen, weekpreview, één regel per ander domein | Afvinken · kaarten met prijs/oordeel · Mijn keuze als eigen tegel |
| **Kompas domein** | Wat past op déze laag? | Ladder P1–P6 in de kop + aanbevelingskaarten op de aangeklikte laag | Afvinken · `MijnKeuzeTile` · een tweede deur naar het schap |
| **Rechter zijbalk** | Waarom deze laag, wat koos ik, wat raden we aan? | Aanbevolen laag + *vanwege* · compacte laag-nav · save op acties · inline help | Een volledige tweede ladder (lock N6) · afvinken |
| **Mijn Dag** | Wat doe ik vandaag, en is het gelukt? | `daily_action_log` + geplande momenten | Oordeel · merk · prijs · vergelijkingslink |
| **Voortgang profiel** | Waar sta ik op dit domein? | Readout, ladder als verklaring, dekking | Kaarten · aanbod |
| **Favorieten / schap** | Wat koos ik, en wat is het volledige oordeel? | Archief + kaartdetail (W4) | Eigen commerciële bestemming náást de laag-kaarten |

Dit is §F van het ecosysteem-verdict, met één rij toegevoegd (de zijbalk) — die stond er niet in.

---

## 2. Pivots t.o.v. de as-built (22 aug)

**P1 · `MijnKeuzeTile` verdwijnt van héél Kompas.** Vandaag staat hij twee keer:
[`DomainKompasScreen.tsx:172`](../../src/components/dashboard/domain/DomainKompasScreen.tsx) (domein-gescoped) en
[`KompasHomeCard.tsx:819`](../../src/components/dashboard/kompas/KompasHomeCard.tsx) (embedded, cross-domein).
Ecosysteem-verdict §C4 liet de home-variant staan; **dit doc trekt door: allebei eruit.** Reden: de zijbalk draagt
"wat koos ik op deze laag" al ([`cockpit-inspector.ts:124-138`](../../src/lib/cockpit-inspector.ts), kaart `keuze`),
en de CTA "Open Mijn Dag →" zet een afvink-routing op een aanbevel-surface.

**P2 · Save wordt primair een zijbalk-handeling.** De middenkolom houdt ladder + kaarten en mag de knop spiegelen,
maar het persistente keuze-anker beweegt mee met de laagselectie in de zijbalk. Het patroon bestaat al:
[`LadderActionRow.tsx:40-52`](../../src/components/dashboard/domain/LadderActionRow.tsx) → `FavoriteSaveButton` →
`account_favorites`, sleutel `laag-<domein>-p<n>-<slug>`.

**P3 · Het schap blijft tijdens de transitie.** W2 laat laag-kaarten en schap náást elkaar draaien; W4 haalt het schap
weg als bestemming. Opus mag die volgorde niet omdraaien.

**P4 · Afvinken = Mijn Dag, punt.** Geen afvink-affordance op Kompas, niet in het midden en niet in de zijbalk.
Eén secundaire link naar Mijn Dag blijft toegestaan in de CTA-stapel onderaan het domeinscherm
([`DomainKompasScreen.tsx:190-199`](../../src/components/dashboard/domain/DomainKompasScreen.tsx), bestaand
`dashboard_<domein>_mijn_dag_click`) — niet in de zijbalk.

---

## 3. Twee correcties op de bronnen — lees dit vóór je de verdicts citeert

**C-a · Het schap is geen iframe meer.** Ecosysteem-verdict §B#9/§C5/§I noemt het schap een `PrebuildFrame` over één
domein. Sinds P3 is het `SchapView` in React over drie domeinen
([`schap-availability.ts:22`](../../src/lib/schap-availability.ts): beweging · slaap · voeding; stress en verbinding
hebben er bewust géén). Alleen **verbinding** draait op Kompas nog als prebuild-iframe
([`Dashboard.tsx:2492-2499`](../../src/components/dashboard/Dashboard.tsx)). Gevolg: de W4-gate *"schap-iframe uit"*
is zwaarder dan het verdict aannam — het is het uitzetten van een gebouwde React-surface met domeinschakelaar en
favorieten-tab, niet het verwijderen van een iframe. **Beantwoord op 22 augustus 2026: nee — W4 valt uiteen in drie
gates, zie §7.1.**

**C-b · De zijbalk bestaat pas vanaf 1280px.** `COCKPIT_CONTEXT_SIDEBAR_MQ = "(min-width: 1280px)"`
([`cockpit-context-layout.ts:2-3`](../../src/lib/cockpit-context-layout.ts)); daaronder is het een drawer, onder 640px
een bottom sheet. Op 375px — waar de doelgroep zit — is de zijbalk dus dicht tenzij iemand hem opent.
**Lock hieruit: "primair in de zijbalk" geldt vanaf `xl`. Onder 1280px moet de middenkolom de keuze volledig kunnen
dragen; de spiegel-knop is daar geen luxe maar de enige weg.**

---

## 4. Wat níét meer open is

- Afvinken woont op Mijn Dag (`daily_action_log` als enige completion-bron) — Mijn Dag-verdict KILL #7/#8.
- Het Bond-oordeel is redactioneel en gratis; commissie alleen op P4 (ecosysteem-verdict §C6 · §J1).
- Beweging is het pilot-domein; slaap/voeding/stress volgen ná de pilot.
- `account_favorites` blijft de opslag; `laag-<domein>-p<n>-<slug>` blijft de enige sleutel.
- Lock N6: geen tweede volledige ladder in de contextkolom
  ([`cockpit-inspector.ts:108`](../../src/lib/cockpit-inspector.ts) · [`DomainKompasHead.tsx:20`](../../src/components/dashboard/domain/DomainKompasHead.tsx)).
  Operationeel: de laag-navigator draagt **alleen `id` + staat** — geen naam, geen summary, geen actie (§7.2).
- W4 is geen enkele gate meer maar drie (W4a/W4b/W4c), getekend 22 augustus 2026 — §7.1.
- De laagkeuze heeft één bron: `domain-ladder-focus-context`, niet de `useState` van het middenscherm (§7.2).

## 5. Wat Opus wél uitwerkt

1. De N6-oplossing: welke vorm draagt "wissel van laag" in de zijbalk zonder tweede ladder te worden.
2. Het *vanwege*-contract per domein — welk readout-veld de zin levert, en wat voeding/verbinding missen
   ([`domain-ladder-readout.ts:54-67`](../../src/lib/domain-ladder-readout.ts): voeding en verbinding leveren `null`).
3. Waar de inhoud van `MijnKeuzeTile` landt na verwijdering (zijbalk voor de huidige laag, Voortgang/Favorieten cross-domein).
4. Inline dashboard-help vs `/hoe-werkt-dashboard` (vandaag: [`Dashboard.tsx:3531-3563`](../../src/components/dashboard/Dashboard.tsx)).
5. Meetplan + slice-volgorde (max 5 slices, beweging eerst).

## 6. Wat Dennis tekent vóór de Opus-ronde — **getekend 22 augustus 2026**

| # | Besluit | Status |
|---|---|---|
| R1 | `MijnKeuzeTile` van héél Kompas af (ook home) | **GETEKEND** — de keuze staat vanaf nu op één plek per vraag |
| R2 | Save primair in de zijbalk, spiegel in het midden, volledig functioneel < 1280px | **GETEKEND** — de spiegel is geen luxe maar de enige weg op 375px |
| R3 | Schap blijft tot W4; W4-gate herbevestigen ná correctie C-a | **GETEKEND 22 augustus 2026, ná de Opus-ronde** — W4 valt uiteen in drie gates, zie §7 |
| R4 | Geen afvinken op Kompas; één secundaire link naar Mijn Dag blijft | **GETEKEND** |

Vanaf deze handtekening zijn R1, R2 en R4 **VAST** voor de Opus-ronde: te implementeren, niet te heroverwegen.
R3 was het enige punt waar het verdict nog een besluit mocht voorstellen; dat voorstel is getekend in §7.

---

## 7. Getekend ná de Opus-ronde — 22 augustus 2026

Bron: [`claude-opus-kompas-sidebar-keuzehart-verdict-2026-08.md`](claude-opus-kompas-sidebar-keuzehart-verdict-2026-08.md).
Vanaf hier is dit doc + dat verdict samen het uitvoeringscontract. **Geen van beide heropenen zonder kop `PIVOT`.**

### 7.1 · R3 — W4 wordt drie gates

De formulering *"schap-iframe uit"* vervalt. Het schap is React over drie domeinen
([`schap-availability.ts:22`](../../src/lib/schap-availability.ts)) en één gate zou tegelijk het enige
aanbod-oppervlak van slaap en voeding weghalen terwijl hun lagen nog niets dragen.

| Gate | Wat eruit gaat | Conditie |
|---|---|---|
| **W4a** | De **Leefstijl-tab** uit `resolveSchapTabs` ([`schap-tabs.ts:20-24`](../../src/lib/schap-tabs.ts)) — dat is de enige echte doublure: dezelfde ladder, dezelfde knop, dezelfde sleutel als Kompas-domein en Voortgang. Schap = aanbod + favorieten | Zodra de zijbalk save draagt op dat domein (plak 1–3). **Geen W1 nodig** |
| **W4b** | Het schap houdt op een bestemming te zijn, **per domein** | Per domein: W1 klaar én kaarten mét oordeel op de laag (W2) |
| **W4c** | `choice.shelf_opened` retiret **per emitter**, in volgorde: `KompasOndersteuningTile.tsx:89` → `MeerHulpBridgeSheet.tsx:53` → `LeefstijlprofielDomeinScherm.tsx:307` → als laatste `SchapView.tsx:97` | De laatste emitter valt met de laatste W4b-gate; GA4-annotatie op die dag |

Volgorde-lock: **W4a komt ná plak 1–3**, nooit ervoor. Wie de Leefstijl-tab weghaalt vóórdat de zijbalk save draagt,
haalt een werkende werkplek weg zonder vervanging.

### 7.2 · Vier bouwvoorwaarden die met de handtekening meekomen

Uit §A/§C/§E/§I van het verdict; ze zijn geen advies meer maar conditie op plak 1.

1. **Eén bron voor de laagkeuze.** De selectie verhuist van `useState` op het middenscherm
   ([`DomainKompasScreen.tsx:59`](../../src/components/dashboard/domain/DomainKompasScreen.tsx)) naar
   `domain-ladder-focus-context`, controlled-when-provided zoals `PrioriteitenLadder.tsx:72-73`. Zonder dit lopen
   midden en zijbalk stil uiteen — twee open lagen tegelijk, zonder foutmelding.
2. **LayerStrip, in alle drie de presentaties.** Zes chips, alleen `id` + staat. Geen laagnaam, geen summary, geen
   acties, geen bewijsrijen — dát is de operationele definitie van N6. Prev/next is afgewezen: "P3 van 6" is de
   ordinale lezing die `BESLUIT_BEWEGING §A.3 #12` heeft gekilld.
3. **Geen "Aanbevolen"-label zonder reden.** Machinaal te toetsen: geen kicker waar `evidenceByLayer[laag]` leeg is
   én `whyWait` `null` geeft. Vandaag draagt 7 van de 30 (domein × laag)-paren een echte feitzin.
4. **`surface` gaat mee in dezelfde commit als de save-knop** (`dashboard_favorieten_save`,
   [`voortgang-favorites-context.tsx:110-115`](../../src/lib/voortgang-favorites-context.tsx)). Nooit als waarde in
   `source` — dat is een databasekolom die betekent *wie het voorstelde*. Zonder deze parameter is R2 onmeetbaar.

Plus twee reparaties in plak 1, omdat een primaire handeling geen onafgemaakte surface mag dragen: de drawer-scrim en
de sheet-greep ([`CockpitFrame.tsx:320,347`](../../src/components/dashboard/cockpit/CockpitFrame.tsx)) dragen
`max-xl:hidden` terwijl ze alléén onder `xl` renderen.

### 7.3 · Twee drempels die vóór de bouw vastliggen

Een getekend besluit sluit een argument niet uit — het verplaatst het naar zijn drempel (verdict §J).

- **R2 keert terug** als het aandeel saves-uit-de-zijbalk na twee weken onder een derde blijft. Dan was "primair"
  een ontwerpvoorkeur en verhuist het zwaartepunt terug naar het midden.
- **De zijbalk-als-hart keert terug** als `dashboard_context_opened` onder 1280px op minder dan 1 op de 5
  domeinscherm-sessies vuurt. Dan is het hart daar een lade, en is het midden het product.

**Meetpunt van dit document:** geen product-events — besluitstuk. Af te lezen aan het aantal OPEN items in §6 (nu: nul)
en aan de tijd tot plak 1 start.

---

## 8. PIVOT — 26 augustus 2026: de kolom is per domein, en het schap blijft

> **Dit is de kop die §7 vereist.** §8 overschrijft §7.1 (W4b/W4c) en nuanceert lock N1.
> W4a, R1, R4 en lock N6 blijven onaangetast. Getekend door Dennis, 26 augustus 2026.

### 8.1 · Wat er veranderde in de vraag

§1 gaf de rechter zijbalk één vraag: *"Waarom deze laag, wat koos ik, wat raden we aan?"* — een
vraag die alleen bestaat wanneer er een laag open staat, dus alleen op een domeinscherm. Op de
Kompas-home stond daar iets anders: drie losse kaarten uit `cockpit-inspector.ts` (gewoonte,
hermeting, Future You), geschreven vóórdat de ladder er was.

De kolom draagt nu één vraag op beide surfaces: **waar zit mijn winst, waar koers ik op, wat is
hier het aanbod, en houd ik het vol?** Dat is een bredere rol dan §1 toekende. Vier zones, vaste
volgorde, één domein — `kompas-context-spine.ts`.

Daarmee vervalt de aanname onder W4b dat het schap een *overgangs*bestemming was die de laag zou
overnemen. Aanbod en laag beantwoorden niet dezelfde vraag: de laag draagt wat je **gratis** kunt
doen, het schap draagt **aanbod met een oordeel**. Twee vragen, twee plekken.

### 8.2 · Schade-analyse

| Wat vervalt | Wat het bewaakte | Waar dat nu geborgd is |
|---|---|---|
| **W4b** — "het schap houdt op een bestemming te zijn, per domein" | Eén plek per vraag: voorkomen dat schap én laag-kaarten allebei aanbod dragen | Rolverdeling i.p.v. verwijdering: **laag = gratis acties** (`DomainFreeActionsTile`), **schap = aanbod met oordeel**. Zodra W2 kaarten mét oordeel op de laag zet, is dát de doublure die moet wijken — niet het schap |
| **W4c** — `choice.shelf_opened` retiret per emitter | Het meetspoor netjes afbouwen | Het spoor groeit i.p.v. krimpt. `surface` blijft de scheider; `kompas_context` is de vierde waarde naast `kompas_home`, `agenda`, `voortgang` |
| **N1 als "één deur op het hele Kompas"** | Twee knoppen naast elkaar naar dezelfde bestemming | **Eén deur per surface**, bestemming volgt het domein van die surface. Home → `KompasOndersteuningTile` → schap van je *prioriteitsdomein*. Domeinscherm → contextkolom → schap van *dat* domein. Ze staan nooit tegelijk in beeld: `domainScreenOpen` gatet de zone |

Restrisico dat blijft staan: **twee ingangen met verschillende bestemmingen kunnen verwarren** als
iemand snel wisselt tussen home en domeinscherm. Drempel: als `choice.shelf_opened` met
`surface: kompas_context` na twee weken naar een schap-domein leidt dat afwijkt van
`model.priority.id` in minder dan 1 op de 5 gevallen, dan voegde de domein-deur niets toe en gaat
hij eruit.

### 8.3 · Wat §7 zei en de code al deed

Drie regels in §7 waren op 26 augustus al achterhaald. Ze staan hier zodat een verse sessie het
doc niet als as-built leest.

- **W4a is uitgevoerd**, niet ná plak 1–3 maar ervoor. `resolveSchapTabs` kent geen Leefstijl-tab
  meer ([`schap-tabs.ts:49-53`](../../src/lib/schap-tabs.ts)). De volgorde-lock is dus geschonden,
  zonder schade: de tab was een echte doublure (dezelfde ladder, dezelfde knop, dezelfde sleutel).
- **R2 is vervallen op 23 augustus.** "Save primair in de zijbalk" is geen ontwerprichting meer —
  het midden is de werkplek op elke breedte, de kolom legt uit waaróm. Reden: de spiegel was
  bedoeld als vervanging onder 1280px (C-b) en werd een toevoeging erbovenop. `account_favorites`
  met sleutel `laag-<domein>-p<n>-<slug>` blijft de enige bron, dus wat je in het midden bewaart
  verschijnt meteen in de kolom.
- **Beweging is niet meer het enige pilot-domein.** Vier van de vijf domeinen draaien op
  `DomainKompasScreen` (§9).

### 8.4 · Eén logica-correctie die hierbij hoort

De contextkolom startte dicht op prebuild-domeinen (`defaultContextCollapsed`), omdat de iframe de
volle breedte nodig heeft. Dat is omgedraaid en de prop is weg. Verbinding is juist het domein
waar de kolom het meeste draagt: de iframe weet niets van je ijkpunt, je ritme, of waaróm
verbinding geen schap heeft. Een dichtgeklapte kolom verborg precies de uitleg die dat scherm mist.

---

## 9. De vijf domeinen — as-built, en de volgorde die eruit volgt

De roadmap sprak over "de zijbalk" in het enkelvoud en over beweging als pilot. Dat klopt niet meer
met de code: de kolom is één vorm met vijf verschillende invullingen, en wat een domein kan hangt
af van wat zijn check oplevert. Bron: `domain-context-bar.ts`.

### 9.1 · Wat elk domein draagt

| Domein | Kompas-scherm | Ladder-readout | Eigen check | Schap | Ijkpunt |
|---|---|---|---|---|---|
| **slaap** | React | staten **+ feitrijen** | slaapcheck | magnesium | ✅ |
| **beweging** | React | staten **+ feitrijen** | beweegcheck | creatine · eiwit · diensten | ✅ |
| **stress** | React | staten, **geen** feitrijen | stress-check | **geen** — `lifestyle_first` | ✅ |
| **voeding** | React | **geen** | voedingscheck | vijf nutriënten | ✅ |
| **verbinding** | prebuild-iframe | **geen** | **geen** — meet mee in de hermeting | **geen** — `geen_schap` | ✅ |

Twee kolommen daarin zijn geen gaten maar besluiten, en de kolom zegt ze met dezelfde woorden als
het besluit: stress valt af op `STRESS_LIFESTYLE_FIRST_REASON`
([`domain-product-stance.ts:17`](../../src/data/domain-product-stance.ts)), verbinding structureel
(BESLUIT_DASHBOARD_SUPPLEMENTROUTE_V1 §E2). Een leeg vak zou als "nog niet af" lezen.

### 9.2 · Wat daaruit volgt voor de volgorde

De oude slice-volgorde ("beweging eerst, dan de rest") is vervangen door een volgorde die de
**dunste plek** eerst dicht. Elke stap is af te lezen aan één ding.

| # | Stap | Waarom deze eerst | Af als |
|---|---|---|---|
| **D1** | **Stress-feitrijen** (`stressReadout.evidenceByLayer`, T1d) | Stress heeft staten maar geen enkele feitzin: de urgentie-zone toont er een laag zonder reden. Dat is de grootste afstand tussen "wat de kolom belooft" en "wat hij levert" | `evidenceByLayer` gevuld voor de lagen die STR_FREQ/STR_RCV beoordelen |
| **D2** | **Voeding-readout** — innamebanden → staat per laag | Voeding is het enige domein met een schap maar zonder winst-laag: de kolom stuurt je naar aanbod zonder te kunnen zeggen waaróm | `resolveDomainLadderReadout("voeding")` geeft niet-null |
| **D3** | **Verbinding van iframe naar `DomainKompasScreen`** | Het laatste domein waar midden en kolom uit twee werelden komen; de iframe kan geen laag publiceren, dus de kolom valt daar altijd terug op de geen-winst-laag-stand | `isDomainKompasDomain("verbinding")` is waar, `DOMAIN_PREBUILD` is leeg |
| **D4** | **W2** — aanbodkaarten mét oordeel op de laag | Pas zinvol als D1/D2 een laag kunnen aanwijzen. Hier valt het W4b-oordeel opnieuw: draagt de laag aanbod, dan wijkt de *laag-kaart* of het *schap* — niet allebei blijven | Per domein één plek met oordeel |
| **D5** | **W1** — `LayerRecommendation` / `bond_verdict` / `is_monetised` | Nooit begonnen, en de kolom hangt er niet aan. Blijft achteraan tot D4 vraagt om een oordeel-model | De drie velden bestaan in `src/` |

W4b en W4c zijn hiermee geen gates meer maar een besluit binnen **D4**. W4a is gedaan.

### 9.3 · Drempels die meelopen

Naast de twee uit §7.3, die blijven staan:

- **De domein-schapdeur keert terug** onder de drempel in §8.2 (bestemming wijkt af van het
  prioriteitsdomein in minder dan 1 op 5).
- **De geen-winst-laag-zone keert terug** als hij op voeding en verbinding na twee weken geen
  enkele `dashboard_kompas_context_click` met `zone: "check"` oplevert. Dan legt hij iets uit dat
  niemand wil oplossen, en volstaat een stille lege kolom.

**Meetpunt van §8–§9:** `dashboard_kompas_context_click` (`zone` = `check` · `schap` · `ritme`,
plus `domain`) en `choice.shelf_opened` met `surface: kompas_context` — hieraan lees je af of de
kolom per domein iets doet, of alleen iets zegt.
