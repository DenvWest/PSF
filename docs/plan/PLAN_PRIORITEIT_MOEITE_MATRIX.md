# IA — Prioriteit × Moeite-matrix (Inzichten / Aanpak)

> **Layer 3 — Plan/IA.** Informatie-architectuur voor de Aanpak-ervaring op `/inzichten`: een persoonlijk positioneringsgrid op **prioriteit × moeite** met evidence als korte credibility-tag (geen as). Legt vast welke categorie in welk kwadrant valt, de kaart-volgorde, de twee gescheiden klikdoelen en het verdienmodel (gratis Q1 = vertrouwen, betaald Q2 = persoonlijk programma). **Alleen IA/plan — geen code, geen `src/`-wijziging.**
>
> Kruisverwijzingen: [`../core/BRAND_POSITIONING.md`](../core/BRAND_POSITIONING.md) · [`../core/COMPLIANCE.md`](../core/COMPLIANCE.md) · [`../core/DPIA.md`](../core/DPIA.md) · [`../core/ACCOUNT_DASHBOARD_SYSTEM.md`](../core/ACCOUNT_DASHBOARD_SYSTEM.md) · [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) · taxonomie-substraat: [`../../src/data/approach/category-taxonomy.ts`](../../src/data/approach/category-taxonomy.ts)

---

## Samenvatting

De Aanpak-kaarten worden een **positioneringsgrid, geen takenlijst**. Twee assen — prioriteit (persoonlijk, uit de check) × moeite (intrinsiek aan de categorie) — plus een korte evidence-tag als Consumentenbond-handtekening. De winst zit niet in het grid zelf maar in de **kwadrant-logica van het verdienmodel**:

1. **Hoog prioriteit · lage moeite (Q1) = gratis.** Hier geef je persoonlijke aandacht weg en bouw je vertrouwen. Lichte affiliate alléén waar een product de moeite écht verlaagt (eiwit, omega-3), als laatste regel ín de kaart — nooit als kop.
2. **Hoog prioriteit · hoge moeite (Q2) = betaald.** Dit is waar mensen alléén falen; een persoonlijk programma (coach → later LLM) is hier het eerlijke antwoord, geen verkooptruc. **Krachttraining is de poster child** — niet een gratis generieke kaart.
3. **Twee gescheiden klikdoelen:** evidence-tag → de bron/het inzicht-artikel (gratis bewijs, SEO). Kaart-CTA → de actie of de upsell. Evidence-klik mag nooit rechtstreeks verkopen (bait-and-switch = gif voor de positionering).

Kernverschuiving t.o.v. de eerdere "3-staps-kracht-kaart": die gaf het betaalde product gratis en generiek weg. De gepersonaliseerde opbouw ís de programma-inhoud (Q2-betaald), niet gratis content.

---

## 1. Het model — twee assen + evidence-tag

- **Prioriteit (Y)** — persoonlijk. Afgeleid uit de leefstijlcheck: hoe groot is het gat in deze categorie (laagste antwoord/score per categorie, niet alleen per pijler). Varieert per gebruiker.
- **Moeite (X)** — intrinsiek aan de categorie, vast. Hoe zwaar is de gedragsverandering. `laag | gemiddeld | hoog`.
- **Evidence** — intrinsiek, vast. **Geen as.** Korte tag ("Sterk onderbouwd" / "Redelijk onderbouwd") + één klikbare bron. Doet backstage het sorteer-/gate-werk (zoals nu in [`category-taxonomy.ts`](../../src/data/approach/category-taxonomy.ts) `evidenceNiveau`), maar wordt in deze module kort zichtbaar als vertrouwenssignaal.

**Kaart-volgorde (sorteersleutel):** prioriteit ↓ → moeite ↑ → evidence ↓. De eerste kaart is dus altijd hoogste prioriteit / laagste moeite / sterkste bewijs = de hero.

---

## 2. De vier kwadranten

| Kwadrant | Naam | Rol | Verdienmodel |
|---|---|---|---|
| **Q1 — hoog prioriteit · lage moeite** | "Grootste winst, kleinste stap" | Vertrouwen winnen | **Gratis.** Persoonlijke aandacht (geproductiseerd, later LLM). Lichte affiliate alléén waar product de moeite verlaagt, als laatste regel in de kaart |
| **Q2 — hoog prioriteit · hoge moeite** | "De moeite waard, maar zwaar" | Hier faalt iedereen alleen | **Betaald.** Persoonlijk programma (coach → later LLM). De eerlijke upsell |
| **Q3 — lage prioriteit · lage moeite** | "Mooi meegenomen" | Onderhoud | Niets pushen |
| **Q4 — lage prioriteit · hoge moeite** | "Niet nu" | Bewust ontraden | Niets — vertellen wat je *niet* moet doen = geloofwaardigheid |

---

## 3. Categorie-placering

Moeite + evidence zijn intrinsiek (vast); prioriteit is persoonlijk en bepaalt of de kaart bij déze gebruiker bovenkomt. Default-kwadrant geldt bij hoge prioriteit.

| Categorie | Intake-bron | Moeite | Evidence | Default-kwadrant (bij hoge prioriteit) |
|---|---|---|---|---|
| Eiwit | `NUT_PROT` | Laag | Sterk | **Q1 gratis** + affiliate (eiwitpoeder, bestaat al in [`build-recommendations.ts`](../../src/lib/build-recommendations.ts)) |
| Vetzuren / omega-3 | `NUT_O3` | Laag | Sterk | **Q1 gratis** + affiliate (omega-3) |
| Herstelmomenten (stress) | `STR_RCV` | Laag | Sterk | Q1 gratis |
| Ademhaling (stress) | — (`source: none`) | Laag | Redelijk | Q1 / Q3 |
| Dagelijkse activiteit / stappen | — (wearable) | Laag | Sterk | Q1 — meten/nudgen vraagt wearable → **later** |
| Cardio / conditie | `MOV_CARD` | Gemiddeld | Sterk | Q1 ↔ Q2-grens |
| Slaapritme (biologische klok) | `SLP_CONS` | Gemiddeld | Sterk | Q2 betaald |
| Inslapen / doorslapen | `SLP_ONSET` / `SLP_WAKE` | Gemiddeld–hoog | Redelijk | Q2 betaald |
| Eetritme | — (`source: none`) | Gemiddeld | Redelijk | Q2 / Q3 |
| **Krachttraining** | `MOV_STR` | **Hoog** | **Sterk** | **Q2 betaald — poster child** |
| Mentale belasting | `STR_FREQ` | Hoog | Redelijk | Q2 betaald |

Energie en herstel zijn **readout-pijlers** (zie [`category-taxonomy.ts`](../../src/data/approach/category-taxonomy.ts) `getDomainTaxonomy` → `role: "readout"`) — geen eigen kaarten; ze reflecteren de drivers.

---

## 4. Kaart-anatomie & twee gescheiden klikdoelen

Elke kaart:
- **Categorie-naam** + één regel "waarom nu" (persoonlijk, uit de check — geen score/urgentie-getal tonen; dat raakt DPIA-R4 functie-creep).
- **Twee chips:** prioriteit (hoog/middel) + moeite (laag/middel/hoog).
- **Evidence-regel:** "Sterk/Redelijk onderbouwd" → **klikbaar naar bron/inzicht-artikel** (gratis bewijs, goed voor SEO en vertrouwen).
- **Kaart-CTA** (apart van de evidence-klik):
  - Q1 → gratis actie / persoonlijke duiding. Eventuele affiliate als laatste regel binnen de kaart (`rel="nofollow sponsored"`, derde partij, klein).
  - Q2 → upsell naar het persoonlijke programma (eigen funnel, eigen CTA — géén affiliate-stijl).

**Harde scheiding:** affiliate (derde partij, nofollow sponsored, minimaal, als laatste regel) ≠ eigen programma (eigen funnel-CTA op Q2). Visueel en juridisch uit elkaar houden. Geen commercie in de kop van een prioriteits-kaart.

---

## 5. Verdienmodel — gratis Q1 vs betaald Q2

- **Q1 weggeven = de trust-engine.** Eiwit, omega-3, herstelmomenten: laag-drempelig, sterk onderbouwd, doet de gebruiker zelf. Dít is "de Consumentenbond geeft eerlijk gratis advies". Affiliate alleen waar een product de moeite verlaagt (eiwitpoeder om je dagdoel te halen) — inname-framing, nooit statusclaim (zie [`COMPLIANCE.md`](../core/COMPLIANCE.md) "Inname vs status").
- **Q2 verkopen = het eerlijke programma.** Hoge moeite + hoge prioriteit is precies waar zelf-doen mislukt. Een programma op maat (coach/LLM) is hier het juiste gereedschap, niet een bolt-on. Krachttraining: hoge prioriteit voor 40+, hoge moeite, sterk bewijs → "we maken een opbouw op maat voor je".

---

## 6. Tier-opbouw: coach-first → playbook → LLM

- **Gratis tier:** de matrix + een persoonlijk-voelende "uit jouw check"-duiding (getemplate, later LLM-nudge). Voelt als aandacht, schaalt automatisch. **Geen mens hier** — anders geef je het dure weg.
- **Betaalde tier:** een **echte coach** maakt het Q2-programma op maat. Nu mens, om drie redenen: geloofwaardig, rechtvaardigt een echte prijs, en je leert exact het draaiboek dat de LLM later overneemt.
- **Volgorde:** coach → playbook codificeren → LLM-agency. Niet LLM-first.

---

## 7. Compliance-randvoorwaarden

- **Coach = nieuwe ontvanger van art. 9-data.** Huidige consent dekt "supplementadvies", niet "coach leest mijn check". → aparte, specifieke toestemming + verwerkersovereenkomst; opnemen in [`DPIA.md`](../core/DPIA.md) (ontvangers + grondslag betaald advies).
- **Leefstijl, geen behandeling.** Label "coach", nooit "therapeut/behandelaar" — anders raak je de medisch-hulpmiddel-grens.
- **Geen score/urgentie user-facing** in de kaarten (DPIA-R4 functie-creep). Prioriteit blijft kwalitatief ("hoog"), niet als getal.
- **Affiliate-scheiding** conform [`COMPLIANCE.md`](../core/COMPLIANCE.md): nooit affiliate in de kop van het prioriteits-overzicht; alleen als laatste regel binnen een Q1-kaart.

---

## 8. Fasering & meetpunten

| Fase | Inhoud | Data nodig |
|---|---|---|
| **F0** | IA vaststellen (dit doc): assen, kwadranten, placering, klikdoelen | — |
| **F1** | Q1-hero gratis: **eiwit** als eerste kaart (laag · sterk), met bestaande affiliate-naad ([`build-recommendations.ts`](../../src/lib/build-recommendations.ts) `eiwitpoeder` / `protein_gap_signal`) | `NUT_PROT` uit de check (al aanwezig) |
| **F2** | Matrix uitbreiden: meerdere Q1/Q3-categorieën + evidence-klik naar bronnen | taxonomie + insight-koppeling |
| **F3** | Q2-programma-upsell: krachttraining als eerste betaalde programma (coach) | consent-uitbreiding + coach-rol |
| **F4** | LLM-agency op het gecodificeerde coach-playbook | volume + governance |

**Meetpunten:** hergebruik `focus_area_click` met onderscheidende `destination`-waarden (`approach_q1_<categorie>`, `approach_q2_upsell`) — geen nieuw event nodig. Affiliate-klik via de bestaande affiliate-meting. Per fase: "Meetpunt: \<event(s)\> — hier lees je het effect af."

---

## Aanbeveling

Bouw **F1 als enige eerste stap**: de eiwit-kaart (Q1, gratis, hero), persoonlijk uit `NUT_PROT`, met de affiliate-naad die er al ligt als laatste regel — niet als kop. Dat zet de toon (eerlijk gratis advies), bewijst de kaart-anatomie end-to-end zonder nieuwe datalaag, en houdt het betaalde programma (Q2, krachttraining) bewust apart voor F3.

---

*Opgesteld: 26 juni 2026. Status: concept ter vaststelling.*
