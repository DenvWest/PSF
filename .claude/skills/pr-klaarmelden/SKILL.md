---
name: pr-klaarmelden
description: Merge-routine voor een PSF-PR — CI bewaken, wanneer wel/niet zelfstandig mergen naar main, en hoe je dat aan Dennis meldt. Gebruik dit na het pushen van een feature-branch, of wanneer gevraagd wordt een PR "klaar te melden" of te mergen.
---

# PR klaarmelden

Volledige routine voor het brengen van een feature-branch-PR naar `main`, zoals
vastgelegd in `CLAUDE.md` onder "Git & deploy". Deze regels gelden voor elke
sessie die aan dit project werkt, lokaal en remote.

## 1. CI bewaken

Wacht de CI-run op de PR af voor je iets over mergen beslist.

- **Lokale/CLI-sessie met `gh` beschikbaar**: `gh pr checks <nummer>`.
- **Remote/cloud-sessie zonder `gh`**: gebruik de GitHub MCP-tools —
  `mcp__github__pull_request_read` (method `get`, voor `mergeable` en
  `mergeStateStatus`) en `mcp__github__actions_list` /
  `mcp__github__actions_get` (voor de status van de CI-workflow-run op de
  head-commit van de PR).

Nooit op basis van "waarschijnlijk wel oké" verder gaan — altijd de actuele
status ophalen, ook als een eerdere run groen was en er sindsdien is gepusht.

## 2. Wanneer wél zelfstandig mergen

Alleen als **alles** klopt:

- Alle CI-checks staan op `pass`/`success` — geen enkele op `pending` of `fail`.
- `mergeable: MERGEABLE`.
- `mergeStateStatus: CLEAN` (geen merge-conflicten, geen open vereisten).

## 3. Wanneer NIET mergen

- Eén of meer checks `pending` of `fail` → niet mergen. Faalt een check door
  een echte bug: fix op de feature-branch, opnieuw laten draaien, pas daarna
  opnieuw beoordelen. Nooit de oorzaak omzeilen (geen skip/disable van tests,
  geen `--no-verify`).
- Merge-conflict met `main` → conflict oplossen op de feature-branch (mergen,
  niet de historie van een gedeelde branch herschrijven), opnieuw pushen,
  opnieuw CI afwachten.
- Twijfel over scope, architectuur of een besluit in `docs/plan/` → melden aan
  Dennis, niet zelf doorzetten.

## 4. Hoe mergen

- `gh pr merge <nummer> --squash` (of `--merge` als dat de conventie is voor
  die PR) — remote/cloud-sessie: `mcp__github__merge_pull_request` met
  `merge_method: squash`.
- **Nooit** `--admin`, **nooit** `--force`, **nooit** checks overslaan. Als een
  merge alleen lukt met een van die opties, is de PR niet klaar om te mergen —
  meld dat in plaats van door te drukken.
- Nooit rechtstreeks naar `main` pushen; werk gaat altijd via de PR.

## 5. Na de merge — geen automatische deploy

Een merge naar `main` betekent **niet** dat er iets live komt te staan.
`bash deploy.sh` draait Dennis altijd zelf, als bewuste, aparte stap.

- Voeg nooit een GitHub Actions workflow toe (of laat er nooit een staan) die
  na een merge/push naar `main` automatisch naar de server deployt (SSH,
  `workflow_run`-trigger die deploy-stappen uitvoert, etc.). Dat druist in
  tegen dit beleid, ook als de workflow er "per ongeluk" of via een
  ongerelateerde commit is bijgekomen. Zie zo'n workflow → niet zelf
  verwijderen of repareren, eerst melden (zelfde regel als bij een conflict
  met een besluit in `docs/plan/`).
- `.github/workflows/` bevat uitsluitend CI-stappen (lint, tests, build-check,
  `check:migraties`) — geen deploy-stap.

## 6. Melden aan Dennis

Kort en concreet, na afloop van elke poging:

- Welke PR (nummer + titel), welke commit is gemerged.
- Of alle CI-checks slaagden vóór de merge.
- Dat `deploy.sh` nog een bewuste, losse stap van Dennis is — de merge zet
  niets live.
- Bij een migratie in de PR: verwijs naar het bijbehorende blok in
  `supabase/migrations/OPENSTAAND.md` en of die de deploy blokkeert.
