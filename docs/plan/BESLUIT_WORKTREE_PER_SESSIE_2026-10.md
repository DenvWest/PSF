# Besluit: één worktree per sessie, hoofdmap alleen voor `next dev`

- **Datum:** 1 oktober 2026
- **Status:** BESLOTEN (Dennis akkoord, 1 okt 2026)
- **Vervangt:** de impliciete werkwijze waarin sessies in de hoofdmap (`~/psf`) van branch wisselden en committen

## Aanleiding

Op 1 oktober 2026 stonden er in één keer:

- een commit (`feat(dagboek): echte productfoto's…`) direct op lokale `main`, niet gepusht. Die is via PR #92 rechtgezet;
- 8 worktrees, waarvan 6 voor al gemergede PR's, en 3 `next dev`-processen tegelijk;
- ~55 lokale branches van gemergede PR's;
- tijdens het opruimen wisselde een andere sessie de hoofdmap naar een docs-branch, terwijl localhost daar draait.

De oorzaak: de hoofdmap was tegelijk localhost (main) en werkplek voor elke sessie. Afspraken ("branch vanaf origin/main") stonden alleen in sessiegeheugen, niet in een mechanisme.

## Besluit

1. **De hoofdmap `~/psf` staat altijd op `main`.** Hij draait `next dev` (localhost) en krijgt alleen `git pull --ff-only` na een merge. Er wordt niet gecommit en niet van branch gewisseld.
2. **Elke sessie werkt in een eigen worktree** vanaf `origin/main`:
   `git fetch origin && git worktree add .claude/worktrees/<taak> -b feat/<taak> origin/main`
3. **Na de merge ruimt de sessie haar eigen worktree en lokale branch op** (`pr-klaarmelden`, stap 3).
4. **Afgedwongen in `.githooks/`** (die gelden voor alle worktrees, want `core.hooksPath` wijst naar de hoofdmap):
   - `branch-guard.sh` (via `pre-commit`): blokkeert commits op `main` en elke commit in de hoofdmap;
   - `pre-push`: blokkeert pushen naar `refs/heads/main`;
   - `post-checkout`: waarschuwt als de hoofdmap van `main` af gaat (blokkeren kan git hier niet).
   - Bewuste uitzondering: `PSF_ALLOW_MAIN_CHECKOUT=1`.

## Afgewezen

- **Alleen een afspraak in CLAUDE.md/geheugen.** Dat werkte al niet: een sessie zonder die context committe toch op main.
- **Sessies laten wisselen in de hoofdmap, met "eerst `git status` checken".** Twee sessies in één working tree blijven elkaars bestanden, dev-server en HEAD verschuiven, hoe voorzichtig ook.
- **Een losse kloon per sessie.** Dat is zwaarder dan een worktree (eigen objecten, eigen remote-sync) zonder extra isolatie.

## Gevolgen

- Een worktree heeft eigen `node_modules` nodig (of een symlink naar die van de hoofdmap) en een eigen dev-poort (`-p 3001`, …).
- `deploy.sh` blijft ongewijzigd: het draait in de hoofdmap op `main` en commit/pusht niet.
- Stashes zijn gedeeld tussen alle worktrees: gebruik geen kale `git stash pop`, maar liever een WIP-commit op je eigen branch.
