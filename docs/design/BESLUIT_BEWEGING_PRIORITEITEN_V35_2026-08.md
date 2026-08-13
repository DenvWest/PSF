# Besluit — Beweging v3.5 · prioriteitenblokken en een brug die kiest

**Artefact:** `docs/design/beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html` (self-contained, 234 KB, fonts inline, geen CDN)
**Vervangt:** v3.4 als leidend beeld. v3.4 blijft staan als referentie voor de piramide-geometrie.
**Datum:** 12 augustus 2026

---

## A · Diagnose — waarom v3.4 → v3.5

Drie dingen liepen in v3.4 vast, en ze hingen aan elkaar.

**De piramide was een silhouet geworden dat je niet kon lezen.** Zes trapezia met een taper van 7% per laag: op 375px paste het label van laag 6 net binnen zijn eigen vorm, het open paneel moest ónder de piramide staan om het silhouet niet te breken, en de rail-variant moest wanneer-wel/wanneer-niet verbergen omdat het niet paste. De vorm kostte meer dan hij opleverde. Slaap v2 had dat al opgelost: blokken met een 4px statusbalk links, van boven naar beneden, en de status in tekst náást de kleur.

**De brug droeg vier concepten tegelijk.** Mini-ladder, keten (Check → Advies → Favorieten → Beste), sheet met acties per laag, en een knop. Vier dingen die om beurten het antwoord waren op "wat moet ik nu doen". Het voorzittersbesluit wilde de keten er nog bij; v3.5 gaat de andere kant op.

**Scherm B was geparkeerd terwijl de brug zijn werk deed.** Er liep geen pad meer naar het schap, dus stond de rijkste surface van het hele prototype buiten de flow — bereikbaar via een tabbalk die in het product niet bestaat.

De ingreep: het schap is de bestemming van de eerste keer, Mijn Dag is de bestemming daarna, en de brug kiest tussen die twee. Eén knop, twee labels, twee routes.

---

## B · Surface-model

| Surface | Rol | Wat het NIET doet |
|---|---|---|
| **A** eerste keer | Het voorstel verkopen en één moment vastzetten | Niet afvinken (je hebt nog niets gedaan) |
| **E** elke dag daarna | Eén ding vragen: is het gebeurd | Geen tweede vinklijst, geen schap |
| **B** maak een keuze | Het oordeel per optie, met de basis-strip als anker | Geen rangnummers, geen prijs vóór het oordeel |
| **C** Voortgang › Gekozen | Meten en verklaren | Niet doen — geen dag-knop op prioriteit 4–6 |
| **D** Mijn Dag | Doen | Niet uitleggen — het waarom staat achter de koppelstrip |

A en E zijn één component met twee staten, precies als in v3.2–v3.4. De vijf tabs bovenin zijn prebuild-chrome.

**De brug**, op A, E en onderaan D:

```
bridgeFirst() = !extraChosen && !hasVisitedShelf
  true  → "Voeg iets toe aan je basis"  → scherm B
  false → "Zet er iets naast"           → scherm D
```

Eén predikaat voor label én bestemming, zodat ze niet uit elkaar kunnen lopen. Geen derde label, geen paneel dat opengaat, geen sheet-tussenstap.

---

## C · Visueel — de PriorityLadder

Zes `.pl-row`-blokken, prioriteit 1 bovenaan. Zonder taper móét 1 → 6 van boven naar beneden lezen: anders scant een lezer eerst prioriteit 6, en dat is precies de laag die we niet willen verkopen.

Vier staten, vier kleuren, en de status altijd óók in tekst:

| Staat | Kleur | Woord |
|---|---|---|
| grootste winst | terra (`--move`) | Grootste winst |
| op orde | sage | Op orde |
| houd in de gaten | amber | Houd in de gaten |
| nog niet nu | muted, geen accent | Nog niet nu |

Terra en amber zijn op 4px niet betrouwbaar te onderscheiden, en kleurenblindheid maakt dat erger — het statuswoord is dus niet decoratief.

Twee varianten: `full` op C (één open, gesloten toont één "waarom wachten"-regel) en `rail` op C-desktop (sticky navigatie, synchroon met full). **Geen mini-variant** — de brug toont geen ladder meer.

---

## D · Inhoud — twee bronnen, één conclusie op C

De volgorde op C is de hele these:

1. **Gemeten** — de check-readout, byte-identiek met je check-in resultaat, met de SSOT-vlag "Zelfde blok als op je check-in resultaat" erboven.
2. **Feitrijen** — je eigen antwoordlabels, vier zichtbaar, de rest achter "Toon alle antwoorden".
3. **Gekozen** — je basis, en de extra alleen als je die echt koos.
4. **Prioriteiten** — de ladder verklaart waaróm de conclusie is wat hij is.

De ladder mag de readout nooit tegenspreken en nooit vervangen. Prioriteit 2 (`winst`) en de readout ("je grootste beweegwinst ligt nu bij kracht") komen uit dezelfde bron; als die twee ooit uiteenlopen is dat een bug, geen nuance.

Prioriteit 2 leest je programma terug als feitelijke regel — `Kracht · thuis · 2× per week · beginner` — met één link terug naar waar je het instelt. Instellen en teruglezen zijn hetzelfde ding, op twee plekken uitgelezen.

---

## E · Journeys

**J1 eerste keer** · A toont het voorstel + "Voeg iets toe aan je basis" → B → kiest PT-intake → C toont readout + basis + extra + prioriteiten → E toont "Vandaag ook", knop heet nu "Zet er iets naast" → D toont de extra-rij in de timeline.

**J2 dag daarna** · E → "Zet er iets naast" → D direct, geen schap → afvinken op D zet E mee → koppelstrip "Bekijk bewijs" → C.

**J3 dismiss** · D → "Niet vandaag" → rij weg op D én E, keuze blijft bestaan, label blijft "Zet er iets naast".

**J4 expiry** · reviewer zet `extra_verlopen` → `normalize()` rolt de keuze terug → label terug op "Voeg iets toe aan je basis" → C toont alleen je basis.

**J5 bewijs** · C: gemeten boven gekozen · prioriteit 3 open met maximaal drie acties en geen dag-knop · prioriteit 6 dicht met poort-copy.

Alle vijf zijn in de browser doorlopen; de staat-schakelaar bovenin zet elke beginsituatie in één tik.

---

## F · De Consumentenbond-keten

De ladder sorteert het **type** interventie op prioriteit × onderbouwing × moeite. Het oordeel over een aanbieder blijft op de kaart, in scherm B, met de commissie-microcopy ná het oordeel.

| Prioriteit | Onderbouwing | Wat er hoort |
|---|---|---|
| 1 Dagelijks bewegen | Beweegrichtlijnen 2017 | gratis, geen kaart nodig |
| 2 Kracht + basisconditie | WHO 2020 | je basis. Lokale begeleiding mag hier staan, mét oordeel en **zonder commissie** |
| 3 Progressief opbouwen | ACSM position stand | je programma. Begeleiding op opbouw mag hier staan, mét oordeel en **zonder commissie** |
| 4 Specifiek sporten | geen aparte richtlijn | lokale partners, mét oordeel — **en de enige laag waar commissie mag lopen** |
| 5 Geavanceerde training | reviews periodisering | ghost-kaarten, geen prijs, geen link |
| 6 Supplementen · wearables | EFSA-claims | **gegate**: voedingscheck én hertest |

> **Amendement 13 augustus 2026.** De rijen 2, 3 en 4 zijn herschreven. De oorspronkelijke formuleringen waren *"je basis — hier oordelen we niet over"* (2), *"je programma, geen product"* (3) en *"lokale partners, mét oordeel"* (4). Aanleiding: aanbieders staan voortaan bij de prioriteit waar hun inhoud thuishoort, en de commissiegrens loopt niet langs de kaart maar langs de prioriteit. Grond en uitwerking: [`BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md`](./BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md).
>
> In dezelfde ronde is de **cafeïne-claim uit `PRIORITIES[6]` verwijderd**: er bestaat geen toegestane EU-gezondheidsclaim voor cafeïne (Parlementaire blokkade juli 2016), en `approved-claims.ts` kende hem terecht niet. Zie `BESLUIT_BEWEGING_KOPPELNAAD_V1` §E2.

Prioriteit 6 is nooit een CTA op A, E of D. Op C is hij label-only achter een dichte deur, met de reden in gewone taal. Een supplement dicht een gat dat je eten laat vallen — zonder te weten waar dat gat zit, is aanvullen gokken.

---

## G · Implementatie-hints voor `src/`

- **Eén component, drie varianten.** `PriorityLadder({ variant: 'full' | 'rail' })` met een `PRIORITIES`-constante naast de bestaande beweeg-data. De statusafleiding hoort in `src/lib/`, niet in de component: de check bepaalt de staat, de UI leest hem uit.
- **Twee vlaggen, geen drie.** `hasVisitedShelf` en `extraChosen` horen in het bestaande prefs-record, niet in aparte kolommen. Verval schrijft ze allebei terug.
- **`dose ≠ dayDur` blijft twee velden.** Zodra één control allebei zet, is de duur op Mijn Dag bewerkbaar geworden — precies wat het Mijn-Dag-verdict verbiedt.
- **De extra is één record, twee uitlezingen.** Afvinken op Beweging en op Mijn Dag schrijven naar dezelfde bron (`daily_action_log`-patroon). Nooit twee tellers.
- **Mijn Dag rendert virtueel.** De dagstap wordt niet als agenda-blok weggeschreven; de timeline sorteert op tijd en de basis-rij staat er altijd.

---

## H · Meetpunten

| Event | Payload | Laag |
|---|---|---|
| `choice.shelf_opened` | `{ domain:'beweging', from_state, label_variant:'basis'\|'ernaast', target:'b'\|'d' }` | `domain_events` |
| `choice.extra_selected` | `{ option_id, type }` | `domain_events` |
| `choice.extra_dismissed` | `{ option_id, until }` | `domain_events` |
| `dashboard_vandaag_extra_toggled` | `{ done: true\|false }` | account-events |
| `dashboard.agenda_domain_link_click` | `{ domain:'beweging', to:'beweging'\|'voortgang'\|'keuze' }` | account-events |

Registratiepad bij bouw: `src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts` (of het account-equivalent). Hergebruik eerst bestaande types.

**Meetpunt:** `choice.shelf_opened` met `label_variant` — hier lees je af of de gesplitste routing werkt: als "ernaast" bijna nooit gevolgd wordt door `dashboard_vandaag_extra_toggled`, stuurt de brug mensen naar een dag waar niets staat.

---

## I · Governance — "Prioriteit" versus de product-locks

Twee nummeringen die niet door elkaar mogen lopen:

- **Prioriteit 1–6** = de leefstijl-ladder. Gebruikerstaal, staat op het scherm.
- **L1, L2, L3…** = de productbesluiten (geen scherm dat een keuze eist vóór een antwoord · één afvinkbare eenheid per dag · geen readout die telt wat je niet deed). Interne taal, staat nooit in de UI.

In v3.4 heette de ladder "laag 1–6" en dat botste met beide. De rename naar "Prioriteit" haalt die botsing weg en zegt bovendien wat de ladder ís: een volgorde van belang, geen niveaus die je haalt.

---

## J · Copy-lock

Verboden in gerenderde tekst, aria-labels en eyebrows: `stappenplan · route · fase · spoor · startpatroon · categorie · cockpit · kompas · journey · deep view · programma-catalogus · oefeningenbibliotheek · coming soon · level · trede X van Y · biohack` — en sinds v3.5 ook **`Laag N`**.

Toegestaan: "ladder" · "je programma" (voor instellingen) · "Prioriteit N".

Geverifieerd over alle 25 combinaties van vijf schermen × vijf reviewer-staten met elke disclosure open: nul treffers, geen `Laag N`, geen ordinaal, geen noemer.

---

## K · Acceptatiematrix

| Reviewer-staat | Label | Bestemming | Extra op D/E | Gekozen-blok op C |
|---|---|---|---|---|
| `eerste_keer` | Voeg iets toe aan je basis | B | — | alleen basis |
| `dag_daarna` | Zet er iets naast | D | — | alleen basis |
| `extra_gekozen` | Zet er iets naast | D | zichtbaar, afvinkbaar | basis + extra |
| `extra_verlopen` | Voeg iets toe aan je basis | B | weg | alleen basis |
| `extra_gedisst` | Zet er iets naast | D | weg tot morgen | basis + extra, met notitie |

Verder afgevinkt: 375px = timeline op D (geen tray/raster) · 1280px = sticky rail op C · geen clip-path-geometrie in de DOM · `extraChosen` nooit true zonder B-actie · E ↔ D sync werkt · nul console-fouten · alle raakvlakken ≥ 44px (0 uitzonderingen over vijf schermen) · één `h1` per scherm · geen horizontale overflow op beide breedtes.

---

## L · Prebuild-notities

- **Iconen worden inline uitgeschreven, niet via `<use href="#id">`.** Chrome resolveert die href tegen de document-URL, en op `file://` is dat een aparte origin — dan blokkeert de browser het icoon en zet een fout in de console. De sprite blijft de bron; JS leest de symbolen één keer uit.
- **Verval reset óók `hasVisitedShelf`.** Anders blijft het label op "Zet er iets naast" staan en wijst de knop naar Mijn Dag waar niets meer staat. De keuze is verlopen, en daarmee het bezoek dat eraan hing.
- **Twee brug-leads, geen derde.** "Wat je koos staat op Mijn Dag" verschijnt alleen als er ook echt iets staat; in `dag_daarna` en `extra_gedisst` valt hij terug op de eerste lead, die altijd waar is.
- **Postcode hertekent alleen op de grens van vier cijfers** — bij elke toetsaanslag hertekenen kost de focus midden in het typen.
- De rode "Geparkeerd (Pad A)"-statebar staat nu in de ontwerpnotities onderaan het bestand, niet meer in de flow.

---

## M · Open vragen

1. **Prioriteit 1 heeft geen actielijst op C.** De acties staan op Mijn Dag en in het schap; C verwijst er alleen naar. Is die verwijzing genoeg, of wil je op prioriteit 1 tóch de drie gratis dingen zien zoals slaap v2 dat doet op zijn open lagen?
2. **De extra-rij op Mijn Dag heeft vier knoppen** (afvinken · verplaatsen · niet vandaag · pas aan). Op 375px wrapt dat naar twee regels. Mag "Pas aan" naar de koppelstrip, of moeten alle vier op de rij blijven?
3. **`Week 1 van 8`** staat nog in de traject-optie, overgenomen uit v3.4. Dat is een feit over het product, geen readout over de gebruiker — maar het is wel een noemer op een doe-surface. Laten staan of herschrijven?
