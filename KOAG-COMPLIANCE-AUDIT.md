# KOAG Compliance Audit — PerfectSupplement

**Datum:** 5 mei 2026  
**Status:** Audit en tekstuele fixes doorgevoerd (vergelijkingsdata, hub, intake-aanbevelingen, buying guide)

## Samenvatting

- **Supplements geaudit (vergelijkingsdata `src/data/supplements/`):** 7 (magnesium, omega-3, ashwagandha, zink, creatine, vitamine-d, eiwitpoeder)
- **Problematische consumentclaims (niet‑EFSA of te stellig):** tientallen fragmenten vervangen of genuanceerd
- **Fixes toegepast:** datafiles, `BuyingGuide.tsx`, `supplement-routes.ts`, hub `catalog.ts`, `intake-engine.ts`, `build-recommendations.ts`, content op diverse `/beste-*` pagina’s
- **Ashwagandha-disclaimer:** uitgebreid op `/beste-ashwagandha` met link naar officiële internetconsultatie (Warenwet / voedingssupplementen en kruidenpreparaten)
- **Bron in repo:** `legal-compliance-checklist.md` ontbrak in de werkmap; EFSA‑teksten zijn afgestemd op EU Claimsverordening (1924/2006) en gangbare claimformuleringen (NL)

## Per supplement

### Magnesium

**Problematische claims (voorbeelden):**

- "slaap", "stress", "ontspanning", "kalmerend", "beste voor slaap" als impliciete gezondheidseffecten → vervangen door geformuleerde EU‑claims (o.a. psychologische functie, zenuwstelsel, vermoeidheid, spierfunctie)
- FAQ en productteksten die slaap/stress als uitkomst claimden

**Status:** Aangepast in `src/data/supplements/magnesium.ts`, `BuyingGuide.tsx`, o.a. `beste-magnesium/page.tsx`, `catalog.ts`, intake/hub‑redenen

---

### Omega-3 (EPA/DHA)

**Problematische claims (voorbeelden):**

- "ontstekingsbalans", brede "hart/gewrichten/hersenen" zonder claimdrempels
- impliciete energie-/vermoeidheidsclaims

**Status:** Aangepast in `src/data/supplements/omega-3.ts`, `BuyingGuide.tsx`, `supplement-routes.ts`, `intake-engine.ts`, `beste-omega-3-supplement/page.tsx`

---

### Ashwagandha

**Status:** **On-hold (EU)**

- Disclaimer: geen definitieve EU‑goedkeuring voor gezondheidsclaims; pendende claims; aparte **VWS**‑procedure (veiligheid/regelgeving)
- **Consultatie-URL:** https://www.internetconsultatie.nl/voedingssupplementen_en_kruidenpreparaten
- Product‑ en FAQ‑teksten: stellige effectclaims (cortisol, stress, slaap) afgezwakt tot product-/etiketfocus en procedure‑context

**Bestanden:** `src/data/supplements/ashwagandha.ts`, `beste-ashwagandha/page.tsx`, `BuyingGuide.tsx`, `supplement-routes.ts`, `catalog.ts`, intake/hub

---

### Zink

**Problematische claims (voorbeelden):**

- "testosteron boost" / impliciet prestatieclaim zonder EU‑context
- marketingclaims ("breed spectrum") zonder koppeling aan toegestane claimteksten

**Status:** Aangepast in `src/data/supplements/zink.ts`, `beste-zink/page.tsx`, `catalog.ts`

---

### Melatonine

**Status:** **Geen vergelijkingspagina (compliance)**

- Commerciële footprint verwijderd in `b1f3f76`: geen `src/data/supplements/melatonine.ts`, geen `/beste/melatonine`, geen affiliate-slugs
- `approved-claims.ts`: status `forbidden`, `comparisonPath: null`
- Alleen informatieve content toegestaan: `src/data/supplement-guides/melatonine.ts` (`/supplementen/melatonine`), kennisbank-termen en blogs zonder koop-CTA
- Governance-test `forbidden-no-live-footprint` groen sinds `b1f3f76`

---

### Creatine

**Problematische claims (voorbeelden):**

- cognitieve ondersteuning als consumentbelofte (geen EU‑gezondheidsclaim voor cognitie)
- magnesiumcombinatie met "ontspanning" als claim

**Status:** Aangepast in `src/data/supplements/creatine.ts`, `supplement-routes.ts`, `catalog.ts`, `beste-creatine/page.tsx`

---

### Vitamine D

**Problematische claims (voorbeelden):**

- testosteron impliciet als supplementdoel zonder claimafbakening
- "energie/stemming" in hub‑intro (niet als kern‑EFSA‑claim)

**Status:** Aangepast in `src/data/supplements/vitamine-d.ts`, `catalog.ts`, `beste-vitamine-d/page.tsx`

---

### Eiwitpoeder

**Status:** EU‑regel in `beste-eiwitpoeder` was al conform; geen aanvullende claimrisico’s aangepast in deze ronde

---

## Gouden bron (code)

`src/data/approved-claims.ts` — centrale opslag van toegestane EU‑claimteksten (NL), drempels en verboden/inaccurate begrippen per supplement, plus `isApprovedClaim` / `getAlternativePhrasing`.

## Wat buiten deze scope bleef

- **Blogposts, nurture‑e‑mail, thema‑content en profielpagina’s:** niet systematisch herschreven; die kunnen nog eigen KOAG/claimreview gebruiken
- **`src/data/supplementen/*` (lange hubs):** niet volledig geherzien; vergelijkingspagina’s en hub‑catalogus wel

## Volgende stappen

- [ ] Deploy naar productie na review
- [ ] Optioneel: juridische review (KOAG/KAG‑context)
- [ ] Blog en e‑mailsequences langs dezelfde EFSA‑lat
- [ ] VWS/EFSA ontwikkelingen m.b.t. ashwagandha blijven volgen (consultatie + toekomstige publicaties)
