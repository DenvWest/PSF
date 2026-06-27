# Handoff — Voortgang & Vitaalscore (27 jun → 28 jun + 1–3 weken)

> **Gebruik:** kopieer **Deel A** naar Claude in VS Code (analyse, geen code). Na goedkeuring: **Deel B** naar Cursor Agent (implementatie). **Deel C** = Dennis checklist vóór deploy.

---

## Wat vandaag is bereikt (Claude vs Cursor)

De afgelopen sessies vormen een **samenhangende Voortgang-tab-sprint**:

| Commit | Wat |
|---|---|
| `a1045bd` | Fix: domeintelling 5 facetten, drempel 55+ — sluit aan op gauge |
| `6d4e16f` | VitalityScoreCard + `getVitalityScoreCardCopy` (band + habit-kernel) |
| `334a309` / `fb85514` | Voortgang supplementen-flow + favorieten-view |
| `a46e674` | Licht surface op detail-schermen |

**Kernbestanden:** `Dashboard.tsx` (VoortgangScoreSection), `MetingenCard.tsx`, `vitality-gauge.ts`, `vitality-score-copy.ts`, `VoortgangHub.tsx`, `voortgang-return-link.ts`, `daily_action_log` migratie + API.

**Score-model (bewust):**
- Vitaalscore = 5 facetten (geen energie) — `vitaliteit.ts`
- Pijlerbadges = 4-staps `getDisplayStatus` (≥60 Voldoende) — intake/compliance
- Gauge = 5-band (Goed vanaf 55) — `vitality-gauge.ts`
- MetingenCard = 5 facetten op peil (≥55)

---

## Advies vervolg 1–3 weken

### Week 1 (28 jun – 3 jul) — Stabiliseren + meten
- Deploy + smoke mobiel (375px): hub → inzichten → supplementen → return-link
- Clarity/GA4 baseline op voortgang-events
- **Niet:** punten-ledger, `/vitaliteit`, wearable OAuth

### Week 2 (4 – 10 jul) — Aanpak personalisatie
- `computeProteinTarget` + `movement-pal` in /inzichten Aanpak (sport/kracht)

### Week 3 (11 – 17 jul) — Transparantie + sport/kracht af
- Publieke `/vitaliteit`-pagina (modelbeslissing energie eerst documenteren)
- Kracht-Q2 wachtlijst-CTA

---

## Deel A — Claude VS Code analyse (copy-paste)

```text
ROL: Senior product engineer + UX-strateeg voor PerfectSupplement.
Lees CLAUDE.md, docs/core/BRAND_POSITIONING.md, docs/plan/PLAN_AANPAK_MAAND_ROADMAP.md.
Baseline: main @ commit a1045bd (fix domeintelling vitaalscore).

CONTEXT — WAT GISTEREN (27 JUN) IS GEBOUWD:
De Voortgang-tab kreeg een premium hub met drill-down (inzichten, favorieten,
statistieken, lichaamssamenstelling). De vitaalscore-kaart is gesplitst:
- VitalityScoreCard: gepersonaliseerde copy via getVitalityScoreCardCopy
- MetingenCard: X/5 domeinen op peil (countVitalityFacetsOnPeil, drempel 55)
Supplementen-flow: voortgang-return-link vanuit /supplementen en /beste/*.
Backend: daily_action_log migratie + /api/account/daily-log (nog geen UI).

BEKENDE SCHULD:
1. daily_action_log API zonder Kompas-UI
2. Dubbele vitaalscore-weergave (hub vs inzichten drill-down)
3. Meetreeks in MetingenCard = intake-sessie-streak, niet dagelijkse actie
4. Roadmap week 1: F2 Aanpak sport/kracht nog niet gedeployed/reviewed

OPDRACHT — ANALYSE (geen code, max 2 pagina's)

A1. Consistentie-audit Voortgang-paden (Dashboard vs VoortgangHub)
A2. Score-model gebruikersbegrip (badges vs gauge vs MetingenCard bij 55–59)
A3. Meetreeks-semantiek — hernoemen vs daily_action_log vs apart scherm
A4. daily_action_log integratie-pad (minimale MVP + meetpunten)
A5. Week-1 roadmap-fit — ENIGE hoogste-ROI stap bij 4–6 uur
A6. Risico's vóór deploy (migratie, mobiel, copy/compliance)

Sluit af met: "Aanbeveling morgen: <1 zin>"
Lever alleen markdown.
```

---

## Deel B — Cursor implementatie (na analyse)

**Prioriteit 1:** ESLint Dashboard, MetingenCard op beide Voortgang-paden, tooltips  
**Prioriteit 2:** Meetreeks-copy verduidelijken, return-link tests  
**Prioriteit 3:** Kompas daily toggle → `/api/account/daily-log`

Verificatie: `grep -rn "console.log" src/` · `npx tsc --noEmit` · `npm test` · `npm run lint`

---

## Deel C — Deploy & smoke checklist (Dennis)

### Vóór deploy
- [ ] `supabase db push` of migratie `20260627130000_daily_action_log.sql` op productie
- [ ] `npm run build` lokaal groen (geen actieve `next dev` tijdens build, of deploy via `deploy.sh` op server)
- [ ] `npm test` + `npm run lint` groen

### Deploy (server)
```bash
ssh root@178.104.75.207
cd /root/perfectsupplement && bash deploy.sh
# Na env-wijziging: pm2 restart perfectsupplement --update-env
```

### Smoke (mobiel 375px, ~3 min)
- [ ] `/dashboard?tab=voortgang` — hub laadt, vitaalscore + MetingenCard (X/5)
- [ ] Inzichten drill-down —zelfde MetingenCard zichtbaar
- [ ] Favorieten → link naar `/beste/*?from=voortgang` → banner "Terug naar voortgang"
- [ ] `/supplementen?from=voortgang` → zelfde return-banner
- [ ] GA4 DebugView: `dashboard_inzichten_cta_click`, `dashboard_voortgang_supplementen_click`
- [ ] Clarity: 3 recordings Voortgang-hub op mobiel vastleggen

### Week 1 meet-baseline
- [ ] Ratio `dashboard_inzichten_cta_click` vs `dashboard_voortgang_supplementen_click`
- [ ] Besluit: energie als readout labelen op Voortgang (copy only)
- [ ] Start F2 Aanpak sport/kracht review (`PLAN_AANPAK_MAAND_ROADMAP.md` week 1)

**De ene zin:** stabiliseer Voortgang + vitaalscore-telling, deploy, meet — week-2 Aanpak wacht op een werkende basis.
