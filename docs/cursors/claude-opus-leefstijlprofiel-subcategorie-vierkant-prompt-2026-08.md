# Prompt — Leefstijlprofiel-domein: weg van de Kompas-kloon (Opus)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus in een **nieuw** gesprek, met repo-toegang als die er is. Screenshots van Kompas-domein én Leefstijlprofiel-domein naast elkaar zijn hier verplicht — het probleem is verwarring tussen twee surfaces.
>
> **Output:** verdict + IA-contract + **één standalone HTML-prebuild**. Geen React, geen JSX, geen patches. Sectie **M** is een Cursor-bouwpakket. Live patchen is verboden: de IA-vraag is groter dan een restyle.
>
> **Opgesteld:** 23 augustus 2026. Harde context geverifieerd tegen `main` (`fa1406c3`).
>
> **Familie:** verdict-vorm van [`claude-opus-kompas-domein-keuzehart-prompt.md`](claude-opus-kompas-domein-keuzehart-prompt.md) + prebuild-eis van de Voortgang-graphics-reeks. Plaats in de keten: ná het zijbalk-keuzehart (Kompas houdt de ladder) en ná leefstijlprofiel-prebuild v3 (locks 1–6 en 8–9 blijven; **lock 7 — “de ladder is ongewijzigd” — mag jij heropenen**, dat is de aanleiding).

---

## Probleem dat deze prompt oplost

Dennis, letterlijk:

> Kijk naar leefstijlprofiel: elk domein is echt niet mooi, ook geen duidelijk roadmap in de domein, het ziet er goedkoop uit en lijkt op kompas, ik wil die ladder anders hebben, of gewoon weg, het zou veel mooier zijn als er net als bij kompas bij wat je koos, zulke vierkanten per subcategorie aanwezig is? Maar ook een duidelijk link met de vorige metingen in de subcategorie per domein. Hoe zou dit mooi kunnen?

Vier beweringen. Behandel ze apart — ze kunnen los waar of onwaar zijn:

| # | Stelling | As-built-hint |
|---|---|---|
| **S1** | Elk leefstijlprofiel-domein oogt **goedkoop** en **als Kompas**. | [`LeefstijlprofielDomeinScherm.tsx`](../../src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx) opent met `KompasDomainGauge` + dezelfde `DomainLifestyleLadder` als [`DomainKompasScreen.tsx`](../../src/components/dashboard/domain/DomainKompasScreen.tsx). |
| **S2** | Er is **geen roadmap** in het domein. | Geen cyclus-anker per domein. `DomainRouteStrip` is een menu (check → Voortgang → Kompas → Mijn Dag), geen pad door de lagen over tijd. |
| **S3** | De P1–P6-**ladder** hoort anders of weg. Accordion mag niet de first view blijven. | [`PrioriteitenLadder.tsx`](../../src/components/dashboard/voortgang/PrioriteitenLadder.tsx) + nog eens de ladder in de kop. Twee ladders, één goedkope taal (mono `P{n}`, 1px-balk, CockpitTile). |
| **S4** | **Vierkanten per subcategorie** (de zes lagen), in de geest van “wat je koos” op Kompas, plus een **link met vorige metingen van díe subcategorie**. | Keuze zit verstopt in de accordion + `MijnKeuzeSectie`-dump. `evidenceByLayer` bestaat in [`domain-ladder-readout.ts`](../../src/lib/domain-ladder-readout.ts) maar wordt hier niet als grid gelezen. Geen laag-tijdreeks — domein-sparkline is het enige verleden. |

Default-hint (niet als waar aannemen): **REPLACE** de accordion door een subcategorie-grid. Opus mag S3/S4 weerspreken, maar alleen met pad:regel én een beter object dat S1–S2 ook sluit.

---

## Vastgezette keuzes

| Keuze | Default |
|---|---|
| **Output** | Spec A–N + één HTML-prebuild + Cursor-bouwpakket (M). Geen React. |
| **Scope** | Leefstijlprofiel-**domeinscherm** (`?tab=voortgang&screen=leefstijlprofiel&fav={domein}`). Hub krijgt een IA-slot, geen pixel-redesign, tenzij de domeinvorm een andere ingang eist. |
| **Blauwdruk-domein** | Beweging (readout + laag-staten + acties + schap). Prebuild toont óók slaap (readout, andere feitenrijen) en voeding (ladder zonder laag-staten). |
| **Kompas blijft** | Keuzehart/zijbalk, 2-koloms `DomainLifestyleLadder`, `DomainFreeActionsTile`. Leefstijlprofiel mag die componenten **niet 1:1** als first view hergebruiken. |
| **v3-locks** | 1–6 en 8–9 blijven: geen productkaart/prijs/vergelijking; schap is de deur; afvinken alleen Mijn Dag; aanbeveling = afgeleid; mijn keuze = activiteiten. **Lock 7 (ladder ongewijzigd) is de PIVOT-kandidaat.** |
| **Data-eerlijkheid** | Geen nep-laagscore-tijdreeks. Vorige metingen = check-feitenrijen + laag-staat + echte domein-hermeting/datum. Zeg waar de data ophoudt. |
| **Live patchen** | Verboden. |

---

## Gebruiksinstructie

1. Open Claude Opus (nieuw gesprek — niet de chat waarin het keuzehart of de ladder is verdedigd).
2. Bijlagen (checklist). Als je repo-toegang hebt: citeer `pad:regel`.
3. Kopieer **Prompt (copy-paste)**.
4. Lees eerst **A** (verdict) en **N** (tegenspraak). Als A en N elkaar tegenspreken, is het model niet af.
5. Review **D/E/K** op 375px. Daarna sectie **M** als Cursor-prompt.

### Bijlagen-checklist

- [ ] **Verplicht** — 375px screenshots: Leefstijlprofiel · Beweging (hele scroll: gauge, boven-ladder, readout, accordion, mijn keuze).
- [ ] **Verplicht** — 375px: Kompas · Beweging (ladder 2-koloms + gratis acties + zijbalk als die open is). Zet ze naast elkaar.
- [ ] **Verplicht** — close-up van “Mijn keuze op deze laag” in de open accordion vs de dump `MijnKeuzeSectie` onderaan.
- [ ] **Sterk aanbevolen** — Leefstijlprofiel · Slaap en · Voeding (dunne staat).
- [ ] **Aanbevolen** — [`leefstijlprofiel-domein-keuze-prebuild-v3-2026-08.html`](../design/leefstijlprofiel-domein-keuze-prebuild-v3-2026-08.html) (locks), [`claude-opus-kompas-sidebar-keuzehart-verdict-2026-08.md`](claude-opus-kompas-sidebar-keuzehart-verdict-2026-08.md), [`WRITING_VOICE.md`](../core/WRITING_VOICE.md).

---

## Prompt (copy-paste)

```text
ROL: Je bent senior product-architect + UX-lead + frontend-craft-architect
voor PerfectSupplement (perfectsupplement.nl), de Consumentenbond van
leefstijldomeinen voor mannen 40+.

Je herontwerpt het Leefstijlprofiel-DOMEINSCHERM tot een dossier + roadmap
per subcategorie — visueel onderscheiden van Kompas. Je levert een verdict,
een IA-contract, en één klikbare HTML-prebuild. Je wijzigt geen app-bestanden.

WAAROM DIT GEEN LIVE-PATCH IS
Het scherm deelt componenten met Kompas (KompasDomainGauge,
DomainLifestyleLadder, dezelfde readout-blokken). Tailwind op de accordion
maakt hem niet tot een ander oppervlak. Jij beslist de vorm. Cursor bouwt
via sectie M. GEEN React, GEEN JSX, GEEN diffs.

OUTPUT-CONTRACT
- Secties A t/m N, exact in de volgorde onderaan.
- Sectie K is een HARDE EIS: één standalone .html (artifact).
- Taal: Nederlands. Identifiers Engels, gelijk aan de repo.
- Je bent hier niet om mee te bewegen. Dennis heeft een stelling; jij toetst
  die aan de repo en de gelockte besluiten, en je zegt het als hij ongelijk
  heeft.

Lees CLAUDE.md en WRITING_VOICE.md mee als je ze hebt.

═══════════════════════════════════════════════════════════════════════════════
DE STELLING DIE JE TOETST
═══════════════════════════════════════════════════════════════════════════════

Dennis zegt, letterlijk:

  "Kijk naar leefstijlprofiel: elk domein is echt niet mooi, ook geen
  duidelijk roadmap in de domein, het ziet er goedkoop uit en lijkt op
  kompas, ik wil die ladder anders hebben, of gewoon weg, het zou veel
  mooier zijn als er net als bij kompas bij wat je koos, zulke vierkanten
  per subcategorie aanwezig is? Maar ook een duidelijk link met de vorige
  metingen in de subcategorie per domein. Hoe zou dit mooi kunnen?"

Vier beweringen. Behandel ze apart in A — WAAR / DEELS / ONWAAR + pad:regel:

  S1  Het domeinscherm oogt goedkoop en als Kompas.
  S2  Er is geen duidelijke roadmap in het domein.
  S3  De P1–P6-ladder hoort anders of weg (accordion ≠ first view).
  S4  Vierkanten per subcategorie (wat je koos) + link met vorige metingen
      van díe subcategorie is de betere vorm.

Default-hint, niet als waar aannemen: REPLACE PrioriteitenLadder op dit
scherm door een subcategorie-grid. Accordion mag niet de first view blijven.
Als je S3/S4 afwijst, lever je een ANDER object dat S1 en S2 wél sluit —
niet "de ladder mag blijven want de data hangt eraan".

═══════════════════════════════════════════════════════════════════════════════
BIJLAGEN (door Dennis)
═══════════════════════════════════════════════════════════════════════════════

1. VERPLICHT: 375px Leefstijlprofiel · Beweging (hele scroll).
2. VERPLICHT: 375px Kompas · Beweging, naast 1.
3. VERPLICHT: close-up keuze-in-laag vs MijnKeuzeSectie.
4. STERK AANBEVOLEN: Slaap + Voeding op leefstijlprofiel.
5. AANBEVOLEN: leefstijlprofiel-domein-keuze-prebuild-v3 (locks);
   claude-opus-kompas-sidebar-keuzehart-verdict-2026-08.md.

═══════════════════════════════════════════════════════════════════════════════
PRODUCTCONTEXT
═══════════════════════════════════════════════════════════════════════════════

PerfectSupplement: mannen 40+, slaap/stress/energie/herstel/beweging/
voeding/verbinding. Adviezen, geen diagnoses. Stepped care: leefstijl
eerst, supplementen laat.

Vier tabs, één cyclus: Kompas (oriënteren / kiezen vandaag) → Mijn Dag
(uitvoeren / afvinken) → Voortgang (bewijs) → Hermeting (cyclus sluiten).

Leefstijlprofiel is een Voortgang-subscherm:
  /dashboard?tab=voortgang&screen=leefstijlprofiel
  &fav={slaap|beweging|voeding|stress|verbinding} opent het domein.
  Zonder fav: de keuzehub (vijf rijen + MetingenCard).

De drie betekenissen van "keuze" niet verwarren:
  Kompas        = kies vandaag je aanpak (gratis actie, zijbalk-keuzehart).
  Leefstijlprofiel = dossier: wat de check afleidt, wat JIJ per laag koos,
                    wat eerdere metingen over die laag zeiden.
  Schap/Favorieten = product, dienst, begeleiding — niet hier.

═══════════════════════════════════════════════════════════════════════════════
ARCHITECTUUR DIE JE ERFT
═══════════════════════════════════════════════════════════════════════════════

1. KOMPAS HOUDT DE LADDER ALS KEUZE-INSTRUMENT
   DomainKompasScreen: DomainKompasHead + DomainLifestyleLadder (columns=2)
   + DomainFreeActionsTile (max 2 acties) + CTA naar Mijn Dag / Voortgang.
   Zijbalk-keuzehart (hasLadderKeuzehart: nu alleen beweging): aanbevolen
   laag + vanwege, LadderLayerStrip (P1–P6 chips, lock N6: alleen id+staat),
   save, gekozen-op-deze-laag. Afvinken blijft Mijn Dag.
   JIJ mag die Kompas-vorm niet 1:1 naar leefstijlprofiel kopiëren als
   first view — dat IS het probleem.

2. LEEFSTIJLPROFIEL v3 PREBUILD (19 aug)
   Locks 1–6, 8–9 BINDEND:
     geen productkaart/prijs/vergelijking; mijn keuze = activiteiten;
     poort naar schap is label-only; inname nooit status.
   Lock 7 ("de ladder is bestaand en ongewijzigd") MAG je heropenen. Zet
   een kop PIVOT + wat er kapotgaat (o.a. twee ladders die nu één
   openLayer delen, favorite-ids laag-<domein>-p<n>-<slug>,
   LadderMomentButton, kompasHref "Kies dit op Kompas").

3. ÉÉN BRON, MEERDERE PLEKKEN
   ladderActionFavoriteId(domain, layerId, action) → account_favorites.
   parseLadderFavoriteLayer leest de laag terug. Zelfde id op schap,
   Mijn Dag-moment, zijbalk. Een grid mag die bron NIET verdubbelen in
   een tweede tabel.

4. READOUT PER LAAG (domain-ladder-readout.ts)
   resolveDomainLadderReadout(domain, data):
     beweging → movementCheckinSnapshot (headline, focus, states,
                evidenceByLayer 1–3 via factRows zitten/mobiliteit,
                kracht/aeroob, consistentie; 4–6 leeg)
     slaap    → sleepCheckinSnapshot (factRows dragen hun laag zelf)
     stress   → stressCheckinReport (states wél, evidenceByLayer {})
     voeding, verbinding, energie, herstel → null
   layerStates: winst | ok | watch | wacht. Zonder readout: zes lagen
   zonder oordeel — dat is eerlijk, geen bug.

5. ENERGIE / HERSTEL
   Readout-domeinen, geen leefstijlladder (getLeefstijlLadder → null).
   Niet in deze prebuild forceren.

MEEDENK-CONTRACT
A begint met (a) overname (b) afwijking + PIVOT op lock 7 indien van
toepassing. Daarna S1–S4. Open spanningen benoemen, niet gladstrijken.

═══════════════════════════════════════════════════════════════════════════════
HARDE CONTEXT — main 23 AUGUSTUS 2026
Citeer pad:regel. Verzin geen staat.
═══════════════════════════════════════════════════════════════════════════════

ROUTE
  VoortgangHub.tsx: als screen leefstijlprofiel|domein én fav gezet →
  LeefstijlprofielDomeinScherm; anders LeefstijlprofielKeuzeHub.
  Deeplink: buildDashboardVoortgangHref("leefstijlprofiel", …, domain).

DOMEINSCHERM LIVE (LeefstijlprofielDomeinScherm.tsx) — huidige stapeling
1. Terugknop + "Leefstijlprofiel · {label}" (r.318-330).
2. CockpitTile "Je stand": KompasDomainGauge + ofwel readout-drivers of
   scoreband + DeltaBadge + Sparkline + "Laatst gemeten N dagen geleden"
   (r.333-368). Op beweging DAARONDER nog eens DomainLifestyleLadder +
   LadderCoverageMeter (r.370-407). Zelfde component als Kompas, columns=1.
3. positionLine (beweging-programma) indien aanwezig.
4. MovementCheckinReadout + MovementFactReadout  óf  SleepCheckinReadout
   + SleepFactReadout — "Zelfde blok als op je check-in resultaat" (r.414).
   DomeinIjkpuntCheckPrompt. Beweging: weektotalen-tegel.
5. PrioriteitenLadder — de grote accordion, alle zes lagen, per open laag:
   summary, aanbevolen-acties + FavoriteSaveButton, "Mijn keuze op deze
   laag", LadderMomentButton, link "Kies dit op Kompas" (PrioriteitenLadder
   r.142-339). Twee ladders delen openLayer (pickedLayer / focus).
6. DomainRouteStrip: Leefstijlcheck · Voortgang (current) · Kompas ·
   Mijn Dag (r.288-304, 512).
7. MijnKeuzeSectie — dump van alle activiteit-favorites op het domein
   (r.100-160, 514-518).
8. Beweging: DomainSupplementStance poortOnly + "Open je schap ›".

KEUZEHUB (LeefstijlprofielKeuzeHub.tsx)
  Vijf CockpitTiles (score-cirkel + label + "blauwdruk live" / "volgt").
  Daaronder MetingenCard. IA-slot in J, geen pixel-redesign tenzij de
  domeinvorm het eist.

LADDERDATA (src/lib/leefstijl-ladder.ts)
  slaap, beweging, voeding, stress, verbinding: elk 6 lagen
  {id, name, subtitle?, summary, actions[]}.
  Surface-namen: leefstijlprofiel_{domein}.
  Favorite-id: laag-{domein}-p{n}-{slug} (≤128 tekens). Legacy actie-{n}-
  blijft leesbaar.

WAT KOMPAS DOET MET DEZELFDE DATA (niet stelen, wel afbakenen)
  DomainKompasScreen.tsx: ladder 2-koloms in de kop, summary van de
  actieve laag, DomainFreeActionsTile, géén accordion, géén
  PrioriteitenLadder, géén MijnKeuzeTile (sinds 22 aug van Kompas af).
  DomainFreeActionsTile = lijst van LadderActionRow (zin + save/moment),
  geen "vierkanten-grid". Als Dennis "vierkanten zoals bij wat je koos
  op Kompas" zegt, TOETS wat hij bedoelt: (i) de 2-koloms P-tegels van
  DomainLifestyleLadder, (ii) de P-chips van LadderLayerStrip, of (iii)
  de actie-rijen. Kies in D een vorm en zeg welke van de drie je
  honoreert. Verzin geen Kompas-grid dat er niet is.

METINGEN — WAT ER ECHT IS PER SUBCATEGORIE
  WEL: layerStates + evidenceByLayer (laatste check). Datum van die check:
  domainCheckDaysAgo[domain] (domein, niet per laag).
  WEL: model.trend[domain] / history — reeks op DOMEIN-score, niet op
  laag. Sparkline in de kop is dat.
  WEL: account_favorites per laag (gekozen handelingen, geen meting).
  NIET: tijdreeks van P3 over drie checks. Een tweede slaapcheck
  overschrijft de snapshot; de vorige laag-feiten staan niet als serie
  in de client.
  NIET: voeding/verbinding laag-staten.
  Gevolg voor S4: "link met vorige metingen" = (a) laatste feitenrij van
  die laag + datum van de check, (b) staat winst/ok/watch/wacht, (c) de
  echte hermeting/domein-delta ernaast als DOMEIN-anker — niet als nep
  P3-sparkline. Als je een laag-geschiedenis wilt: VEREIST NIEUW + golf,
  niet tekenen in default-mock.

EVENTS (hergebruik-first)
  GA4: domain_tool.snapshot_viewed {domain, surface, has_conclusion}
       {domain}_ladder_layer_open {layer, surface}
       voortgang_ladder_kompas_click {domain, layer, surface}
       dashboard_voortgang_hub_click {destination, surface}
       voortgang_route_click {domain, target, surface}
       dashboard_beweging_checkin_click {mode, surface}
  Durable (al in allowlist): domain_tool.snapshot_viewed,
       choice.shelf_opened {domain, from_state, surface}
  Clarity: dashboard_leefstijlprofiel_domein, _schap, ladder tags.
  Nieuw GA4 voor tik op een subcategorie-vierkant mag (bijv.
  leefstijlprofiel_laag_open {domain, layer, surface} is al gedekt door
  {domain}_ladder_layer_open — HERGEBRUIK die, andere surface-waarde,
  geen nieuwe betekenis op een oude parameter).
  Geen nieuw durable event (freeze). Geen PII.

DESIGN-TOKENS
  Cockpit #132414 / #1a2e1a, sage #5A8F6A, terra #C8956C (winst-laag /
  premium — niet als hele-pagina-accent), amber #C99A3C (watch).
  Serif DM Serif Display, sans DM Sans. 375px-first, tikdoelen ≥44px.
  Kleur nooit het enige staat-signaal (woord ernaast).

v3 PREBUILD LOCKS DIE BLIJVEN (ook als de ladder weggaat)
  Geen productnaam/prijs/commissie op dit scherm.
  Schap-deur label-only ("Open je schap").
  Afvinken alleen Mijn Dag (LadderMomentButton mag blijven als PLAN-deur,
  niet als check-off).
  Aanbeveling altijd met bron (check / geen check).

═══════════════════════════════════════════════════════════════════════════════
GELOCKTE INVARIANTEN
═══════════════════════════════════════════════════════════════════════════════

1.  Nooit een tweede score. Geen aggregaat over zes lagen. Geen
    "3/6 lagen op peil" als cirkel-index (LadderCoverageMeter op dit
    scherm: KEEP alleen als hij geen totaalscore wordt; anders KILL of
    vervang door woorden).
2.  Geen nep-laagscore-tijdreeks.
3.  Kompas blijft de plek waar je VANDAAG kiest. Leefstijlprofiel kiest
    niet de dagtaak en wordt geen tweede Kompas.
4.  Afvinken alleen Mijn Dag.
5.  Geen productkaart / affiliate / prijs hier.
6.  Favorite-sleutel blijft ladderActionFavoriteId — geen tweede ledger.
7.  Verzin geen data. Voeding zonder laag-staten blijft zonder oordeel.
8.  Dashboard.tsx bevroren. Wijzigingen via LeefstijlprofielDomeinScherm
    + eventueel nieuwe presentational component (sectie M, later).
9.  WRITING_VOICE: begrip → urgentie → actie, geen diagnose.
10. Hermeting/check-datum mag als anker; de Voortgang-hero-bewijsband
    niet dupliceren (één regel + datum, geen tweede scrub-instrument).

═══════════════════════════════════════════════════════════════════════════════
WAAR JE MAG MEEDENKEN — EN WAAR NIET
═══════════════════════════════════════════════════════════════════════════════

MAG:
- PrioriteitenLadder op DIT scherm KILL / REPLACE. (Op Kompas blijft de
  compacte ladder.)
- DomainLifestyleLadder uit de kop van leefstijlprofiel halen (nu een
  Kompas-kloon).
- KompasDomainGauge vervangen door een stillere stand-regel als de gauge
  de kloon veroorzaakt.
- Grid 2×3 of 3×2 op 375px; per cel: naam, staat of "nog niet beoordeeld",
  gekozen handelingen (0–n), laatste meetfeit + datum.
- Eén cyclus-ankerregel (check → nu → hermeting van DIT domein) zonder
  tweede bewijsband.
- Checkin-readout degraderen (niet 1:1 het resultaatscherm herhalen) als
  de feiten in de cellen gaan wonen. Landingsplek verplicht.
- Hub alleen aanpassen in IA (J) als de ingang het nieuwe object moet
  previewen.

MAG NIET zonder PIVOT + schade:
- Kompas-domein meenemen in pixel-redesign.
- Product/schap-inhoud naar dit scherm halen.
- Afvinkcirkels terug (KILL #8).
- Laag-geschiedenis faken.
- Terracotta als pagina-accent.
- Live React vanuit deze ronde.

═══════════════════════════════════════════════════════════════════════════════
KERNOPDRACHT PER SECTIE
═══════════════════════════════════════════════════════════════════════════════

A. VERDICT S1–S4 + overname/afwijking. PIVOT lock 7 ja/nee + schade.
   Wat de twee ladders op één scherm nu doen (kop stuurt accordion) —
   wat daarvan overleeft.

B. JOB-SCHEIDING.
   Tabel: Kompas-domein vs Leefstijlprofiel-domein vs Schap vs Mijn Dag.
   Per kolom: de ene zin, first-view object, wat er níét staat.
   Als jouw vorm de scheiding niet scherper maakt dan live, is B onvoldoende.

C. LADDER: KILL / REFINE / REPLACE.
   PrioriteitenLadder op leefstijlprofiel. DomainLifestyleLadder op
   leefstijlprofiel. Wat Kompas houdt. Wat er gebeurt met openLayer-
   coupling, FavoriteSaveButton, LadderMomentButton, "Kies dit op Kompas",
   MijnKeuzeSectie (waarschijnlijk overbodig als cellen de keuze dragen —
   zeg waar het archief landt: cellen + Favorieten, niet een derde dump).

D. VORM VAN DE VIERKANTEN.
   375px-layout (2×3 of anders — verdedig). Per cel, element voor element:
   naam (geen verplicht P{n} als dat goedkoop leest; id mag in aria),
   staat in woord + vorm, gekozen items als mini-tegels (niet alleen een
   teller), laatste meetfeit of eerlijke leegte, tik → detail (in-cel
   uitklap vs sheet — kies één, 44px). Wat "net als Kompas" honoreert
   (i/ii/iii uit de harde context). Lege cel vs winst-cel vs gekozen-cel.

E. MEETLINK PER SUBCATEGORIE.
   Mapping evidenceByLayer + layerStates + domainCheckDaysAgo +
   (optioneel) domein-delta. Wat je toont bij beweging P1 vs P5 (P5 heeft
   geen factRows). Slaap vs stress vs voeding. Verbod: sparkline per laag
   tenzij VEREIST NIEUW. Hoe "vorige meting" leest als er maar ÉÉN check
   is (normale staat).

F. ROADMAP IN HET DOMEIN.
   Eén anker: waar dit domein staat in de 30-dagen-cyclus (laatste check,
   nu, hermeting) ZONDER VoortgangBewijsband te kopiëren. Geen scrubber.
   Relatie tot DomainRouteStrip: KEEP als menu onderaan, of vervang door
   jouw anker + bestaande deuren (check opnieuw, Kompas, Mijn Dag, schap).

G. DATA-EERLIJKHEIDSMATRIX.
   Per domein (beweging, slaap, stress, voeding, verbinding): wat de cel
   kan vullen (staat / bewijs / keuze / niks). VEREIST NIEUW apart.
   CoverageMeter: KEEP/KILL.

H. CONVERSIE + MEETPUNTEN.
   CTA-hiërarchie op het domein (Kompas / Mijn Dag / check opnieuw /
   schap). Hergebruik events. Nieuw GA4 apart. Sluit af met:
   "Meetpunt: <event(s)> — hier lees je het effect af."

I. COPY-RICHTING.
   Kop van het scherm (niet "Leefstijlprofiel · Beweging" als dat als
   admin oogt), cel-leegte, cel-winst, bronregel ("uit je beweegcheck van
   …"). WRITING_VOICE. Geen diagnose.

J. HUB-SLOT + DUNNE STATEN.
   Keuzehub: wat er per rij mag staan ná de domeinvorm (preview van
   gekozen cellen? alleen score? laat het). Slaap-prebuildstaat. Voeding
   zonder laag-staten. Wachtend zonder check.

K. HTML-PREBUILD. HARDE EIS.

L. BOUWGOLVEN 0–2.
   Golf 0: beweging-blauwdruk op bestaande data, bestaande events.
   Golf 1: slaap/stress in dezelfde component. Voeding eerlijke leegte.
   Geen schema. Verdedig t.o.v. cohort.

M. CURSOR-BOUWPAKKET.
   Bestanden in volgorde. Waarschijnlijk:
     LeefstijlprofielDomeinScherm.tsx
     nieuw presentational (niet DomainLifestyleLadder hergebruiken als
     first view)
     PrioriteitenLadder.tsx — verwijderen van dit scherm of in detail
     houden, jouw C
     tests die openLayer / favorites per laag raken
   Vijf acceptatiecriteria. Niet-aanraken: DomainKompasScreen,
   DomainFreeActionsTile, keuzehart-zijbalk, voortgang-bewijs-copy,
   Dashboard.tsx, schap-locks.

N. TEGENSPRAAK.
   Minstens drie argumenten TEGEN Dennis (ladder weg; vierkanten; meetlink
   per laag). Drempel waarop hij gelijk heeft. Sluit met jouw aanbeveling
   in één alinea.

═══════════════════════════════════════════════════════════════════════════════
SECTIE K — HTML-PREBUILD CONTRACT
═══════════════════════════════════════════════════════════════════════════════

Eén standalone .html.

VERPLICHT:
1. Self-contained CSS+JS. Fonts DM Serif + DM Sans + system-fallback.
2. JS: state-schakelaar + openen van een cel. Geen framework.
3. Dashboard-tokens als CSS custom properties. Sage accent.
4. 375px-first + ≥1024px. Niets horizontaal scrollen op 375px.
5. Drie reviewer-staten, schakelbaar:
     (α) Beweging, check gedaan, focus P2, 2 gekozen acties op P1/P2,
         evidence op P1–P3, P6 poort dicht — BLAAUWDRUK.
     (β) Slaap, check gedaan, andere evidenceByLayer, 0 gekozen.
     (γ) Voeding, GEEN laag-staten, wel 6 namen + 1 gekozen actie —
         eerlijke "nog niet beoordeeld".
6. Mockdata: echte veldnamen (movementCheckinSnapshot.ladder.states,
   evidenceByLayer, domainCheckDaysAgo, account_favorites als lijst
   {id, title, domain} met id-vorm laag-beweging-p2-…). Man op dag 12,
   geen showcase.
7. First view = grid (of jouw vervanger uit D), niet een accordion van
   zes rijen. Detail ná tik, in beeld op 375px.
8. Cyclus-anker één regel + datum, geen tweede bewijsband.
9. Geen productkaart, geen prijs. Schap-deur label-only, klik toont
   choice.shelf_opened.
10. Tikdoelen ≥44px. Staat in woord, niet alleen kleur. aria op cellen.
11. Optioneel: een "Kompas-referentie"-toggle die een STILSTAANDE schets
    van het Kompas-domein toont (niet klikbaar) zodat de reviewer de
    scheiding voelt — duidelijk gemarkeerd als referentie, niet als dit
    scherm.

VERBODEN:
- Tweede score, 3/6-cirkel als index, nep-P3-sparkline.
- Accordion als default-first-view.
- Terracotta als pagina-accent.
- React/JSX/Tailwind-CDN/chart-lib.
- Afvinkcirkels.

Sectie K in tekst: bestandsnaam, staten, mockvelden, drie afwijkingen
t.o.v. live.

═══════════════════════════════════════════════════════════════════════════════
KRITIEKRONDE (verplicht vóór definitief)
═══════════════════════════════════════════════════════════════════════════════

1. IA-architect — is dit nog Voortgang (bewijs) of een derde Kompas?
2. Man 45 op beweging-P2, twee keuzes, één check. Drie seconden.
3. Compliance — verkapte score, causaliteit, PII in events.
4. Frontend — hergebruik favorite-ids, geen tweede ledger, 375px grid,
   mapping naar M, wat er kapotgaat als PrioriteitenLadder weg is
   (tests PrioriteitenLadderEchteData, DomainLifestyleLadder tests op
   leefstijlprofiel_beweging surface).

Markeer wat je wijzigde t.o.v. je eerste versie.

═══════════════════════════════════════════════════════════════════════════════
OUTPUTFORMAAT
═══════════════════════════════════════════════════════════════════════════════

A. VERDICT S1–S4 — overname / afwijking / PIVOT lock 7 / spanningen
B. JOB-SCHEIDING — Kompas vs leefstijlprofiel vs schap vs Mijn Dag
C. LADDER — KILL / REFINE / REPLACE + wat overleeft
D. VORM VAN DE VIERKANTEN — 375px, per cel, Kompas-referentie i/ii/iii
E. MEETLINK PER SUBCATEGORIE — mapping + eerlijke leegte
F. ROADMAP — ankerregel, geen tweede band; RouteStrip
G. DATA-EERLIJKHEIDSMATRIX — per domein
H. CONVERSIE + MEETPUNTEN — afgesloten met meetpunt-regel
I. COPY-RICHTING
J. HUB-SLOT + DUNNE STATEN
K. HTML-PREBUILD
L. BOUWGOLVEN 0-2
M. CURSOR-BOUWPAKKET
N. TEGENSPRAAK + aanbeveling

═══════════════════════════════════════════════════════════════════════════════
CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- Nederlands. Identifiers Engels.
- Geen medische claims.
- 375px is de lat.
- Affiliate-links horen niet op dit scherm.
- Geen localStorage, geen Firebase.
```

---

## Wat deze ronde níét bouwt

Alleen dit prompt-document. Geen React, geen HTML van ons. Dennis plakt hem in Opus naast Kompas- en leefstijlprofiel-screenshots. Review A/N eerst (model), dan D/E/K op 375px, dan M naar Cursor.

**Meetpunt (deze docs-ronde):** geen UI-event — het effect lees je af als Opus’ prebuild S1–S4 visueel scheidt van Kompas én geen nep-laagreeks tekent.
