# PLAN — Funnel- & datapriority (fundament eerst)

> **Layer 3 — Plan.** Brede analyse + vervolgplan voor de funnel- en datalaag, in **prioriteitsvolgorde**. Kern = het fundament: nurture die vanaf **dag 0** vertrekt vanuit het leefstijlcheck-resultaat (sterk neergezet), en de supplement-datastroom eronder. Toekomst (HRV/wearables, home scan, agency) staat **alleen als horizon**, streng gescheiden van "nu". **Alleen planning — geen code, geen `src/`-wijziging.** Pseudostructuur/condities ter illustratie.
>
> Kruisverwijzingen: [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) · [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) · [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) · [`COMPLIANCE.md`](../core/COMPLIANCE.md) · [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) · [`WRITING_VOICE.md`](../core/WRITING_VOICE.md) · [`EMAIL_SYSTEM.md`](../core/EMAIL_SYSTEM.md)

---

## Samenvatting

De funnel staat technisch: intake → `IntakeResults` → `scheduleNurtureSequence` (dag 0 direct verzonden, dag 3/7/14/21/30 als `pending` ingepland) → `runPendingNurtureEmails` (cron). De recente commits van 5–6 juni hebben de **harde compliance- en infrastructuur-gaten** gedicht: `is_efsa_authorized` afgedwongen in plan-gating (`15009fc`), stress-nurture losgekoppeld van ashwagandha (`066c9ba`), de intervention-highlight gekoppeld aan `plan_progress` + `getVisibleTiers` tier-filter op dag 3/14/21 (`2495c2b`), en `buildNurtureEmail` ontdubbeld + het dode send-reminders-pad opgeruimd (`59333de`).

Wat nu het verschil maakt zit niet meer in de *plumbing* maar in het **narratief en de gating van de copy**. Drie zwaktes staan nog open:

1. **Geen centrale CTA-resolver met leefstijl-guard.** Elke `NurtureBlock` in [`src/data/nurture-content.ts`](../../src/data/nurture-content.ts) draagt zijn eigen hardcoded `cta`. Dag 3 voor "Lage Batterij" stuurt al direct naar `/beste/omega-3-supplement` — een supplement-CTA op dag 3, vóór de leefstijl-hefboom is neergezet. Niets dwingt af dat de primaire CTA leefstijl-eerst is.
2. **Per-profiel sequence-zwaartepunt is half af.** Dag 0 vertakt rijk per profiel (Stressdrager / recovery-lead / slaap-/energie-gids). Vanaf dag 3 valt alles terug op vier `NurtureBlock`-profielen, en Overtrainer/Stilzitter/Stille Slijter worden naar "Lage Batterij" genormaliseerd. Er is geen bewust verschil in zwaartepunt (welk profiel leefstijl-dominant, waar een EFSA-conforme supplement-tip secundair mag).
3. **De cross-domein-balansregel uit [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) §2 geldt nog niet in de mail-output.** Dag 0 toont een leefstijl-overzichtsblok, maar de dag 3–30-blokken garanderen niet dat naast elke supplement-vermelding ≥1 quick-win uit een *ander* domein staat.

De supplement-datastroom is consistent maar **niet genormaliseerd**: merk/stof/dosering/getest staan als vrije tekst in `specs[]` van `SupplementProduct`, niet als getypeerde velden met EFSA-claim-id. Dat blokkeert geen funnel-werk, maar het is de volgende fundament-laag voordat semi-automatische verrijking (de "n8n-achtige" gedachte) of LLM-voeding zinvol wordt — en die hoort expliciet ná schone events (DEEL 3), niet nu.

**Rode draad van dit plan:** eerst het dag-0-scharnier en de CTA-/balans-guard (DEEL 1), dan de productdata genormaliseerd neerzetten (DEEL 2), dan de event-emissie schoonmaken (DEEL 3) — en pas dáárna, als expliciete horizon met drempels, de meet-/wearable-toekomst (DEEL 4). Dit bouwt voort op wat 5–6 juni al is gefixt; opgelost werk wordt niet herhaald.

---

## Status van de eerdere nurture-zwaktes (5–6 juni)

| Zwakte (eerdere nurture-analyse) | Status | Waar |
|---|---|---|
| Intervention-highlight dag 21 (+ dag 3/14) | ✅ **Opgelost** | `resolveNurtureInterventionHighlight` in [`nurture-interventions.ts`](../../src/lib/content/nurture-interventions.ts); dag-21 zet affiliate-disclaimer aan bij `comparePath` |
| Tier-gating van de highlight op plan-voortgang | ✅ **Opgelost** (`2495c2b`) | `loadNurturePlanGate` (plan_progress + `getVisibleTiers`) → `resolveNurtureTierAction` |
| EFSA-afdwinging in plan-gating | ✅ **Opgelost** (`15009fc`) | `is_efsa_authorized` nu vereist, niet alleen `status='published'` |
| Stress-nurture verwees naar ashwagandha (on-hold) | ✅ **Opgelost** (`066c9ba`) | stress-blokken → leefstijlstappen / `/stress-verminderen-man` |
| Dubbele e-mailopbouw / dood send-reminders-pad | ✅ **Opgelost** (`59333de`) | `buildNurtureEmail` ontdubbeld |
| **Centrale CTA-resolver met leefstijl-guard** | ❌ **Open** | CTA's hardcoded per `NurtureBlock`; dag 3 kan direct supplement-CTA zijn |
| **Per-profiel sequence-zwaartepunt (dag 3–30)** | ❌ **Open** (deels) | dag 0 vertakt; dag 3–30 = 4 profielen, recovery/overtrainer → "Lage Batterij" |
| **Cross-domein-balansregel in mail-output** | ❌ **Open** | alleen dag 0 toont leefstijl-overzicht; geen invariant per mail |

> **Te verifiëren (geen src-werk nu):** `runPendingNurtureEmails` selecteert `status='pending'` en zet per rij *ná* verzending op `sent`/`failed` — er is geen atomaire claim-stap vóór verzenden. Als de recente hardening dit nog niet dekt, blijft er een dubbelzend-risico bij overlappende cron-runs. Bevestig dit vóór de cron-frequentie omhoog gaat; geen aanname dat het al dicht is.

---

# DEEL 1 — Funnel-fundament (hoogste prioriteit, "nu")

## 1A. Het scharnierpunt: leefstijlcheck-resultaat → dag 0

### Waarneming (Fase 0)

- `scheduleNurtureSequence` ([`nurture.ts`](../../src/lib/nurture.ts)) verstuurt dag 0 **synchroon** bij intake-completion met een snapshot (`profile_label`, `primary_domain`, `domain_scores`, `urgency_level`, `first_name`) en plant 3/7/14/21/30 als `pending`. Goed: het advies-snapshot reist mee, dus geen dataverlies tussen scherm en mail.
- Dag 0 ([`day-0.ts`](../../src/lib/email-templates/nurture/day-0.ts)) is verreweg de rijkste mail: profiel-specifieke openingsrijen (Stressdrager, recovery-lead/Overtrainer), één concrete leefstijl-quick-win in een tip-blok, een `renderLifestyleOverviewBlock` (dezelfde statuspillen als het scherm) en een gids-blok (slaap/stress/energie/herstel-PDF).
- **De breuk zit in herhaling, niet in dataverlies.** De gebruiker zag net op `IntakeResults` zijn scores, profiel en leefstijl-overzicht. Dag 0 herhaalt datzelfde leefstijl-overzicht en stuurt met "Bekijk je leefstijl-overzicht" via de recovery-URL terug naar exact dezelfde pagina. Dag 0 *bevestigt* dus sterk, maar *verplaatst* nauwelijks: er is geen duidelijke "dit is je éérste stap, doe hem vandaag"-vooruitgang los van de recap.

### Aanbeveling

Maak dag 0 de **sterkste mail van de reeks** door hem te herpositioneren van *recap* naar *eerste actie*. Concreet:

**Wat erin moet:**
1. **Profielbevestiging in één zin** — herken-en-valideer, geen herhaling van het hele scoreoverzicht. (`WRITING_VOICE`: begrip → urgentie → actie.)
2. **De belangrijkste leefstijl-quick-win uit het zwakste domein, als de held van de mail** — niet als bijzin in een tip-blok. Dit is de "doe dit vandaag"-actie. Eén ding.
3. **Eén heldere vervolgactie (één CTA).** Bij voorkeur een leefstijl-actie of het persoonlijke leefstijl-overzicht — niet een supplement-vergelijkpagina. Eén conversiedoel per mail (harde randvoorwaarde).
4. De gids-PDF als secundaire, niet-concurrerende haak (mag blijven, onder de primaire actie).

**Wat eruit/ingedikt moet:**
- Het volledige `renderLifestyleOverviewBlock` op dag 0 is **redundant** met het scherm dat de gebruiker net verliet. Overweeg het in te dikken tot alleen het zwakste domein + de quick-win, en het volledige overzicht te bewaren voor de recovery-link. (Beslispunt — zie open punten.)
- Vermijd twee CTA-richtingen in één mail (leefstijl-overzicht *én* gids-download *én* profielpagina als gelijkwaardige knoppen).

**Onderbouwing:** het snapshot-mechanisme is al correct; de winst zit puur in copy/altitude. Dag 0 is de enige mail die *direct na de piek van betrokkenheid* (net resultaat gezien) landt — dat momentum verzilver je met één scherpe vervolgactie, niet met een tweede weergave van wat ze net zagen. Dit raakt geen engine, geen schema; het is een herinrichting van `day-0.ts` + de dag-0 `NurtureBlock`-copy.

## 1B. De reeks daarna (dag 3–30) als coherent verhaal

### Waarneming (Fase 0)

- Dag 3/7/14/21/30 draaien op `buildNurtureEmail` met vier `NurtureBlock`-profielen (Lage Batterij, Onrustige Slaper, Stressdrager, In Balans). `normalizedLabel` mapt **Overtrainer/Stilzitter/Stille Slijter → "Lage Batterij"** — dus na dag 0 verliest de recovery-/overtrainer-lezer zijn eigen stem.
- De blokken hebben **geen bewust leefstijl-eerst-zwaartepunt per profiel**. Dag 3 "Lage Batterij" opent met leefstijl-quick-wins maar zet de CTA recht op `/beste/omega-3-supplement`. Dag 3 "Stressdrager" houdt het wél leefstijl (`/stress-verminderen-man`). Dat verschil is toeval van de copy, geen ontwerpregel.
- Dag 3/14/21 kunnen de tip vervangen door de **intervention-highlight** (tier-gated). Dat is goed en compliance-veilig. Maar de losse `block.cta` staat dáárnaast en is níet door dezelfde gate beschermd — een supplement-compare-CTA kan vroeg in de reeks verschijnen ongeacht plan-voortgang.

### Aanbeveling

**(i) Centrale CTA-resolver met harde leefstijl-guard.** Verplaats de keuze van de primaire CTA uit de losse `NurtureBlock.cta` naar één resolver-functie (conceptueel, geen code nu):

```
resolveNurtureCta(profile, sequenceDay, domainScores, planGate):
  - dag 0 en 3      → altijd leefstijl-doel (overzicht / pillar-pagina / quick-win-actie)
  - dag 7           → educatief (blog/pillar), nog steeds leefstijl-frame
  - dag 14/21       → supplement-compare TOEGESTAAN, maar alleen als:
        approved-claims[stof].status == 'approved'  &&  comparisonPath != null
        && intervention-highlight voor die dag is vrijgegeven door de tier-gate
  - guard: een supplement-compare-CTA mag NOOIT de enige actie zijn vóór dag 14
```

Dit hergebruikt exact de bestaande poorten (`approved-claims.ts`, `supplementAdviceAllowed`/`isComparisonAllowed`, en de `resolveNurtureTierAction`-gate die er al is) — het bundelt ze alleen op één plek i.p.v. impliciet verspreid over copy. Eén testset borgt: geen enkele profiel/dag-combinatie levert vóór dag 14 een kale supplement-CTA.

**(ii) Per-profiel sequence-zwaartepunt — expliciet maken.** Leg per profiel vast wáár de reeks leefstijl-dominant blijft en wáár een EFSA-conforme supplement-tip secundair mag opkomen:

| Profiel | Zwaartepunt reeks | Supplement secundair vanaf | Waarom |
|---|---|---|---|
| Stressdrager | Leefstijl-dominant (ritme, ademhaling, herstelmomenten) | dag 21, alleen magnesium-context | stress-hefboom is gedrag; supplement is randvoorwaardelijk ([`COMPLIANCE.md`](../core/COMPLIANCE.md)) |
| Onrustige Slaper | Leefstijl-eerst (licht, bedtijd, schermen) | dag 14, magnesium | slaap snelste leefstijl-winst; magnesium heeft EFSA-claims |
| Lage Batterij | Leefstijl-eerst (eiwit, daglicht, cafeïne) | dag 14, omega-3 mét claimgrens (géén energie-claim) | omega-3 heeft **geen** energie-claim — let op afglijden |
| Overtrainer/recovery | **Leefstijl-dominant** (volume terug, slaap) — eigen stem behouden ná dag 0 | dag 21, magnesium | onderherstel los je niet met supplement op; eigen sequence i.p.v. → "Lage Batterij" |
| In Balans | Optimalisatie/behoud, supplement neutraal | dag 21 | geen urgentie; vermijd overselling |

Concreet: geef Overtrainer/recovery een eigen `NurtureBlock`-set i.p.v. de "Lage Batterij"-fallback, zodat de dag-0-stem niet wegvalt.

**(iii) Cross-domein-balansregel in de mail-output.** Til de invariant uit [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) §2 naar de render-laag van de nurture-mail:

```
als (mail bevat supplement-tip of supplement-CTA)
   dan (mail bevat ≥1 leefstijl-quick-win uit een ANDER domein dan dat supplement)
```

Dag 0 voldoet hier al impliciet (overzicht + quick-win + gids). Borg het structureel voor dag 14/21, waar de supplement-highlight verschijnt — zodat een nurture-mail nooit een kale supplementaanbeveling wordt. Dit is dezelfde regel als in de engine-output; één principe, twee plekken.

**Onderbouwing:** dit zijn de drie open punten uit de eerdere analyse, en alle drie zijn *copy-/resolver-werk bovenop bestaande poorten* — geen nieuwe data, geen schema, geen engine-wijziging. Ze maken de reeks van "losse mails met toevallig goede toon" tot "één leefstijl-eerst-verhaal met bewust getimede supplement-secundariteit".

## 1C. Mail/scherm-coherentie

### Waarneming

- Toon is consistent: zowel `IntakeResults` als de mails dragen "leefstijl is het fundament — supplementen vullen aan" (letterlijk in `renderLifestyleOverviewBlock`). Profiel-labels en domeinscores komen uit dezelfde snapshot, dus geen tegenstrijdige cijfers.
- Inconsistentie 1: **dag-0-recap dupliceert het scherm** (zie 1A) — coherent qua inhoud, maar redundant qua functie.
- Inconsistentie 2: **profielpagina-koppeling is ongelijk.** Dag 0 linkt naar `/profiel/stressdrager`, `/profiel/lage-batterij`, `/profiel/overtrainer` waar relevant; latere mails (dag 3–30) verwijzen zelden terug naar de profielpagina, terwijl dat juist de "verdiep je herkenning"-haak is. De profielpagina's bestaan (`onrustige-slaper`, `stressdrager`, `lage-batterij`, `overtrainer`) — onderbenut in de reeks.
- Inconsistentie 3: **`In Balans` heeft geen profielpagina** ([`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md)) maar wel mail-copy die naar "je profiel" verwijst — dode/zwakke verwijzing voor dat segment.

### Aanbeveling

Stem de reeks af op de profielpagina als terugkerend ankerpunt (verdieping van herkenning), en los de `In Balans`-verwijzing op (geen profielpagina → verwijs naar het leefstijl-overzicht i.p.v. een niet-bestaande profielpagina). Houd dag 0 bewust *vooruit* i.p.v. *terug* (1A). Dit is puur copy-/link-afstemming, consistent met de SEO-regel "elke pagina/mail linkt naar ≥2 gerelateerde bestemmingen".

---

# DEEL 2 — Supplement-data goed neerzetten (raakt fundament)

## 2A. Datamodel stof/merk/dosering/getest

### Waarneming (Fase 0)

- Productdata leeft in [`src/data/supplements/*.ts`](../../src/data/supplements/) als `ComparisonPageData` → `SupplementProduct[]`. Velden: `slug`, `name`, `brand`, `affiliateSlug`, `score`, `specs: {label,value}[]`, `pros/cons`, `breakdown`. **Stof, vorm, dosering en third-party-getest zitten als vrije tekst in `specs[]`/`pros[]`** — niet getypeerd, niet machine-leesbaar, niet gekoppeld aan een EFSA-claim-id.
- Claim-control loopt apart via [`approved-claims.ts`](../../src/data/approved-claims.ts) (per ingrediënt: claims, `comparisonPath`, status, evidence). TypeScript dwingt de affiliate-slug-consistentie af (`AffiliateSlug` ↔ `SupplementProduct.affiliateSlug` ↔ `affiliate-links.ts`) — dat is de bestaande sterkte.
- Er bestaat een **ongebruikte** Supabase-basis (`db/migrations/001_supplement_product_database.sql`, service_role-only) — zoals al beschreven in [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) §C.

### Aanbeveling

Normaliseer de productkennis tot een getypeerd schema (uitbreiding op `SupplementProduct`, géén migratie nu), consistent met "productkennis = niet-persoonlijk, vrij structureerbaar, LLM-voedbaar":

```
SupplementProductNormalized
  merk, naam, slug, affiliateSlug
  werkzameStof            (FK-achtig → approved-claims key)
  vorm                    (bv. bisglycinaat / citraat / triglyceride)
  doseringPerDagdosis     { hoeveelheid: number, eenheid: 'mg'|'ug'|'g' }
  elementair              boolean        // bv. elementair magnesium
  efsaClaimIds            string[]       // verwijst naar approved-claims claims
  voldoetAanClaimConditie boolean        // dosering ≥ EFSA-drempel?
  biobeschikbaarheidKlasse 'hoog'|'middel'|'laag'
  thirdPartyTested        boolean
  keurmerk                string | null
  prijsPerMaand           number
```

**Waar het hoort — ongewijzigd t.o.v. het bestaande plan:** *nu getypeerde datafiles als source of truth* (TypeScript-consistentiegarantie weegt zwaarder dan DB-flexibiliteit bij ~8 supplementen), *Supabase als latere spiegel* zodra CRUD-beheer of white-label-producten dit vereisen. Dit plan voegt alleen toe: de getypeerde velden hierboven zijn de **brug** die straks 1-op-1 naar de productdatabase en naar RAG mapt. Begin met `dosering`, `vorm`, `efsaClaimIds`, `voldoetAanClaimConditie` en `thirdPartyTested` als getypeerde velden — die zijn nu vrije tekst en blokkeren elke automatisering.

**Onderbouwing:** zolang dosering vrije tekst is, kan geen enkele poort programmatisch checken of een product de EFSA-claimconditie haalt (bv. magnesium ≥ 56,25 mg). Dat is precies de check die de claimgrens van *toevallig correct* naar *afdwingbaar* tilt — en de voorwaarde voor zowel betrouwbare advies-gating (2C) als latere LLM-voeding zonder claim-risico.

## 2B. Betrouwbare bron + korting/kwaliteit-selectie

### Aanbeveling — semi-automatische verrijking = Fase 2 plumbing, niet nu

De "n8n-achtige" gedachte (geautomatiseerd productdata ophalen/verrijken) past **structureel**, maar hoort expliciet **ná** schone event-emissie (DEEL 3) en ná het genormaliseerde schema (2A). Volgorde-argument: een verrijkingspijplijn die in een ongetypeerd `specs[]`-veld schrijft, produceert rommel die je niet kunt gaten. Eerst de vorm (2A), dan de events (3), dan pas de pijplijn.

**Wat eerst handmatig/gecureerd blijft:**
- De **selectie** van producten per vergelijkingspagina (`ChoiceRoute`, "beste keuze"-badges) — redactioneel, blijft mensenwerk; dat is de merkbelofte "objectief, Consumentenbond-stijl".
- De **EFSA-claimkoppeling** (`efsaClaimIds`, `voldoetAanClaimConditie`) — claim-control blijft deterministisch en hand-geverifieerd, nooit door een scraper bepaald.
- **Prijs/beschikbaarheid** mogen later semi-automatisch ververst worden (verandert vaak), mits het in getypeerde velden landt en de selectie-/claimlaag onaangeraakt laat.

### Korting/kwaliteit-haak via nurture — kan het?

De "alleen via een aparte route verkrijgbare korting/kwaliteit" (bv. Arctic Blue direct, `sld=dennisvanwestbroek`) als exclusieve haak in nurture: **kan, onder strikte voorwaarden, en niet als overhaaste mechaniek.**

- **Juridisch/merk:** een exclusieve korting-haak in een mail is reclame → valt onder de Claimsverordening en de affiliate-disclosure-regels. Dus: zichtbare affiliate-disclosure in de mail (dag-21 zet die al aan bij `comparePath`), `rel="nofollow sponsored"`, EFSA-conforme bewoording, en **geen** korting-haak die de leefstijl-eerst-volgorde doorbreekt.
- **Voorwaarden:** (1) alleen ná dag 14, binnen de tier-gate en de CTA-leefstijl-guard (1B); (2) alleen voor een product dat de claimconditie haalt (2A); (3) de korting mag de objectiviteit niet ondergraven — een exclusieve deal mag de redactionele "beste keuze" niet *bepalen*, hooguit *volgen*. Anders botst het met "Consumentenbond van supplementen".
- **Aanbeveling:** ja, mits bovenstaande. Positioneer het als "deze door ons al aanbevolen optie heeft via deze route een betere prijs/kwaliteit" — niet als "koop nu met korting". De haak volgt de aanbeveling, niet andersom.

## 2C. Koppeling data → advies → nurture

### Aanbeveling

Borg dat elke supplement-suggestie (site én mail) door **dezelfde twee poorten** gaat, plus de balansregel:

```
supplement-suggestie zichtbaar  ⇔
   approved-claims[stof].status == 'approved'
   && comparisonPath != null
   && (engine) supplementAdviceAllowed / isComparisonAllowed == true
   && (nurture) intervention-highlight vrijgegeven door tier-gate
   && cross-domein-balansregel voldaan (≥1 ander-domein quick-win aanwezig)
```

Dit is geen nieuwe machinerie: de eerste drie regels bestaan al in de engine en in de nurture-intervention-resolver; de vierde (tier-gate) is per `2495c2b` live; de vijfde (balansregel) is het open punt uit 1B(iii). De aanbeveling is ze als **één expliciete invariant** te documenteren en te testen, zodat melatonine (`forbidden`) en ashwagandha (`on_hold`) automatisch uitgesloten blijven en geen dode/niet-conforme CTA kan ontstaan — op het scherm én in elke mail.

---

# DEEL 3 — Data doorontwikkelen (fundament voor alles later)

## 3A. Event-emissie

### Waarneming (Fase 0)

`DOMAIN_EVENT_TYPES` ([`events.ts`](../../src/lib/events.ts)) dekt de journey-events ruim: `intake.completed`, `plan.*` (incl. `plan.checkin_completed`, `plan.tier_action_clicked`), `email.opted_in`, `consent.revoked`. Maar voor de **funnel-/datastroom** ontbreken sleutelmomenten:

| Moment | Event nu? | Probleem |
|---|---|---|
| Intake voltooid | ✅ `intake.completed` | — |
| E-mail opt-in | ✅ `email.opted_in` | — |
| **Dag-0 verstuurd** | ⚠️ deels | `nurture.ts` emit `intake.completed` mét nurture-payloads, maar er is **geen apart `nurture.email_sent`-event**; de cron (`runPendingNurtureEmails`) emit **niets** bij verzending van dag 3–30 |
| **Dag-N (3/7/14/21/30) verstuurd** | ❌ | onzichtbaar in de event-stream — geen funnel-meting per stap |
| **30-dagen-hermeting due/gestart** | ⚠️ | `plan.checkin_completed` = voltooid, maar "hermeting due/uitgenodigd" niet als event |
| **Affiliate-click** | ❌ in `domain_events` | gaat naar de aparte `affiliate_clicks`-tabel, niet de event-stream; de funnel-conversie staat los van de rest |

### Aanbeveling

Voeg de ontbrekende funnel-events toe vóór n8n/LLM zinvol wordt (volgt het bestaande `DOMAIN_EVENT_TYPES`-patroon; geen werk nu, wel de lijst):

```
nurture.email_sent        payload: { sequence_day, profile_label, primary_domain, status }
                          → geëmit door runPendingNurtureEmails én door scheduleNurtureSequence (dag 0)
nurture.email_failed      payload: { sequence_day, error_class }      // class, geen ruwe message
remeasure.invited         payload: { days_since_intake }              // 30-dagen-haak verstuurd
affiliate.click           payload: { categorie, comparison_slug }     // spiegel van affiliate_clicks in de stream
```

Twee ontwerpregels: (1) **`nurture.email_sent` is de ontbrekende schakel** — zonder hem kun je de funnel "dag 0 → dag 30 → hermeting → click" niet end-to-end meten, wat de hele Fase-2-belofte (n8n/patroonherkenning) ondermijnt. (2) Payloads bevatten **geen** identifiers of ruwe foutmeldingen — alleen gebande/geclassificeerde signalen, conform het anonimiseringspad (3B). De `affiliate_clicks`-tabel zelf blijft ongemoeid (harde regel); `affiliate.click` is een *spiegel* in de event-stream, geen vervanging.

**Volgorde-bewaking:** n8n = Fase 2, pas ná deze schone emissie. Niet vooruitlopen — eerst de events, dan de pijplijn (consistent met [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) §F).

## 3B. Anonimiseringspad

Ongewijzigd t.o.v. [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) §D — hier alleen de koppeling aan DEEL 3A:

```
Stap 0 (nu)   Gepseudonimiseerd: session_id + e-mail bestaan → blijft art. 9, NIET voor aggregatie/LLM
Stap 1        Anon-view (append-only): strip e-mail, first_name, session_id, recovery_tokens, ip/ua-hash;
              behoud domain_scores, answer-codes, age_range (band), urgency, event-type
Stap 2        k-anonimiteit op antwoord-/event-combinaties (k ≥ drempel, bv. 20); banden i.p.v. exacte waarden
Stap 3 (gate) aggregatie/patroonherkenning/training UITSLUITEND op de k-anon-set; ruwe tabel verlaat
              de service_role-grens nooit
```

Concrete eis voor de nieuwe events (3A): de payloads zijn al zo ontworpen dat ze **na strip van `session_id`/`email` direct k-anon-geschikt** zijn (alleen categorie/dag/status/band). De productkennis-RAG (DEEL 2 / [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) §C) valt hier **buiten** — geen persoonsdata, doorloopt dit pad niet.

---

# DEEL 4 — Toekomsthorizon (expliciet NÁ het fundament, met drempels)

> **Niets hiervan komt nu op PerfectSupplement.** Dit is horizon, geen scope. Beslissingen hierover liggen bij Dennis (zie open beslispunten) — dit plan beslist ze **niet**.

## Harde toegangsdrempels (fundament-staat die eerst bereikt moet zijn)

Geen enkel horizon-item start vóór deze leading indicators groen zijn:

1. **DEEL 1 live** — dag-0-scharnier, centrale CTA-resolver + leefstijl-guard, cross-domein-balansregel in mail. (Het funnel-narratief moet staan vóór er een nieuwe databron op geplugd wordt.)
2. **DEEL 2A live** — genormaliseerd productschema met afdwingbare claimconditie.
3. **DEEL 3A live** — schone event-emissie incl. `nurture.email_sent` en `remeasure.invited`, en **gemeten** funnel-conversie.
4. **Volume + anonimiseringspad** — de 500+/2000+-drempels én het k-anon-pad (3B) uit het bestaande plan.

## De horizon-items, gepositioneerd

| Item | Past bij later product? | Op PerfectSupplement of apart? | Drempel |
|---|---|---|---|
| **HRV/wearables** (slaap, HRV, rusthartslag) | Ja — zou de zachte niet-voedingspijlers kwantificeren en de scheefheid uit [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) §2 rechttrekken | **Open** — kan op PerfectSupplement als leefstijl-tracking, maar verschuift het product richting device-integratie | **Open strategisch beslispunt voor Dennis** (zie hieronder); + drempels 1–4 |
| **Home scan** (zelf-meting thuis) | Mogelijk, maar grenst aan klinische meting | Waarschijnlijk **apart product/entiteit** — een meet-/diagnostiek-propositie botst met "leefstijlcoach, geen status" | Niet vóór een expliciet besluit dat dit géén statusduiding wordt; nu uitgesloten |
| **Agency-aanbeveling** (advies namens/aan coaches) | Ja — de `organization_id`/white-label-fundering ligt er al | **Apart kanaal/entiteit** (B2B), niet de B2C-funnel | Pas als B2C-funnel bewezen converteert (drempels 1–4) |

## Wat ooit op PerfectSupplement zou landen vs. apart wordt

- **Op PerfectSupplement (mits besluit + drempels):** wearable-*leefstijl*-tracking als verrijking van de bestaande Voortgangscheck/nurture-haak — strikt als zelf-/gedragsdata tegen eigen baseline, nooit tegen een klinische norm ([`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md): tier 4-5 met klinische meting = referral-only).
- **Apart product/aparte entiteit:** home scan (meet-/diagnostiek-propositie) en de agency/B2B-laag (white-label via `organization_id`). Deze verschuiven het merk weg van "onafhankelijke supplement-vergelijker met leefstijl-eerst" en horen daarom buiten de PerfectSupplement-funnel.

**Koppeling aan bestaand beslispunt:** de wearable-ja/nee-vraag staat al als eerste open beslispunt in [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md). Dit plan herhaalt het, beslist het niet, en voegt alleen de drempel-eis toe: zelfs een "ja" start pas ná DEEL 1–3 + volume + anonimisering.

---

## Gefaseerde implementatie-volgorde (afhankelijkheden, geen kalenderdata)

> Niets hiervan is hier geïmplementeerd. Volgorde = wat blokkeert wat.

1. **Dag-0-herinrichting (1A)** — recap → eerste actie, één CTA. Geen afhankelijkheid. *Kan direct.* Hoogste hefboom (landt op de betrokkenheidspiek).
2. **Centrale CTA-resolver + leefstijl-guard (1B-i)** — bundelt bestaande poorten. Afhankelijk van niets nieuws; blokkeert een schone reeks.
3. **Per-profiel sequence-zwaartepunt + eigen recovery/overtrainer-blokken (1B-ii)** — afhankelijk van 2 (resolver bepaalt waar supplement secundair mag).
4. **Cross-domein-balansregel in mail-output (1B-iii)** — naast 2/3; deelt het principe met de engine-invariant uit [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) §2.
5. **Mail/scherm-coherentie + profielpagina-anker (1C)** — naast 1–4, copy-werk.
6. **Productschema normaliseren (2A)** — getypeerde dosering/vorm/EFSA-claim-id/getest. Blokkeert 7 en alle latere automatisering/RAG.
7. **Advies→nurture-invariant expliciteren + testen (2C)** — afhankelijk van 4 + 6.
8. **Ontbrekende funnel-events (3A)** — `nurture.email_sent`, `remeasure.invited`, `affiliate.click`. Afhankelijk van niets in DEEL 1/2 maar logisch ná dat de reeks staat (anders meet je een bewegend doel). **Blokkeert n8n/Fase 2.**
9. **Korting/kwaliteit-haak in nurture (2B)** — alleen ná 2, 3, 6 (gate + claimconditie + disclosure).
10. **Semi-automatische productverrijking / n8n (2B, Fase 2)** — ná 6 + 8. Niet vooruitlopen.
11. **Anonimiserings-pipeline (3B)** — bij nadering volume-drempel; blokkeert aggregatie/LLM en de wearable-horizon.
12. **Horizon (DEEL 4)** — alleen ná 1–11 + volume + expliciet Dennis-besluit.

**Kritiek pad voor de eerste waarde:** **1 → 2 → 3 → 4** (het funnel-narratief), met **6 → 7** (data-gating) en **8** (meetbaarheid) er parallel naast. De horizon (12) hangt aan alles.

---

## Wat bewust NIET nu

- **Geen n8n/automatische verrijkingspijplijn vóór schone events (3A) + genormaliseerd schema (2A).** Anders schrijf je rommel in ongetypeerde velden. Fase 2, niet nu.
- **Geen tweede primaire CTA per mail/pagina.** Eén conversiedoel; de CTA-resolver (1B-i) borgt één leefstijl-eerst-pad.
- **Geen supplement-CTA als enige actie vóór dag 14.** Harde guard in de resolver.
- **Geen wearable/HRV, home scan of agency op PerfectSupplement nu.** Horizon met drempels (DEEL 4); wearable-ja/nee blijft Dennis' beslispunt.
- **Geen bloed-/HRV-/wearable-tier, geen statusclaim.** Inname-inschatting mag, status/diagnose niet ([`COMPLIANCE.md`](../core/COMPLIANCE.md)). Ongewijzigd.
- **Geen migratie van productkennis naar Supabase nu.** Getypeerde datafiles + `approved-claims.ts` blijven source of truth; het genormaliseerde schema (2A) is een datafile-uitbreiding, geen DB-migratie.
- **Geen gedeelde tabel voor productkennis en intake-data.** Twee strikt gescheiden stromen ([`ARCHITECTURE.md`](../core/ARCHITECTURE.md)).
- **Geen aanraking van `affiliate_clicks` of de basis-15-vragen-intake/domein-maxima.** `affiliate.click` is een spiegel-event, geen wijziging aan de tabel.
- **Geen herbouw van opgelost werk (5–6 juni).** Tier-gating, EFSA-afdwinging, ashwagandha-fix, buildNurtureEmail-dedup blijven zoals ze zijn.

---

## Open beslispunten voor Dennis

1. **Dag-0-overzichtsblok:** volledig leefstijl-overzicht in de mail laten staan (recap, vertrouwd) of indikken tot zwakste domein + quick-win (vooruit, minder redundant met het scherm)? Aanbeveling neigt naar indikken (1A), maar het is een copy-/merkkeuze.
2. **Hardheid van de cross-domein-balansregel in de mail:** harde invariant (mail mét supplement faalt zonder ander-domein quick-win) of zachte voorkeur? Aanbeveling: hard, gelijk aan de engine-invariant — maar de strengheid is een productkeuze.
3. **Korting/kwaliteit-haak in nurture:** wil je een exclusieve route-haak (bv. Arctic Blue direct) toelaten ná dag 14, onder disclosure + claimconditie + leefstijl-guard (2B)? Ja/nee bepaalt stap 9.
4. **Affiliate-click in de event-stream:** `affiliate.click` als spiegel in `domain_events` opnemen (uniforme funnel-meting) of bewust gescheiden houden in `affiliate_clicks`? (Tabel zelf blijft hoe dan ook ongemoeid.)
5. **Wearable/HRV — ja of nee?** Onveranderd t.o.v. [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md): strategische keuze, geen aanbeveling. Bepaalt of de horizon (DEEL 4) ooit op PerfectSupplement of als apart product landt. Zelfs "ja" start pas ná DEEL 1–3 + volume + anonimisering.

---

## Kruisverwijzingen

| Document | Relevantie |
|---|---|
| [`PLAN_MEASUREMENT_PERSONALIZATION.md`](PLAN_MEASUREMENT_PERSONALIZATION.md) | Meetlaag, productkennis-RAG, anonimiseringspad (§C/§D), LLM-roadmap (§F) — DEEL 2/3 bouwen hierop voort |
| [`ANALYSIS_PILLAR_COVERAGE.md`](ANALYSIS_PILLAR_COVERAGE.md) | Cross-domein-balansregel (§2), scheefheid-risico, wearable-beslispunt (§4) — bron voor 1B-iii en DEEL 4 |
| [`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md) | Tier-model, `is_paid`/`tier`-poort, tier 4-5 klinische meting = referral-only |
| [`COMPLIANCE.md`](../core/COMPLIANCE.md) | EFSA-claimgrens, inname-vs-status, affiliate-disclosure, melatonine/ashwagandha-uitsluiting |
| [`ENTITY_MODEL.md`](../core/ENTITY_MODEL.md) | `nurture_emails`, `domain_events`, `plan_progress`, productdatabase, `is_efsa_authorized` |
| [`WRITING_VOICE.md`](../core/WRITING_VOICE.md) | Toon dag-0 en reeks: begrip → urgentie → actie, geen diagnose-taal |
| [`EMAIL_SYSTEM.md`](../core/EMAIL_SYSTEM.md) | Nurture-sequence, Resend, cron, PDF-gidsen |
| [`ARCHITECTURE.md`](../core/ARCHITECTURE.md) | Twee gescheiden datastromen; waardentrap = diepere personalisatie, geen diagnostiek-tier |

---

*Opgesteld: 6 juni 2026. Planning-document — geen code, geen `src/`-wijziging. Pseudostructuur ter illustratie.*
