# Besluit: een taak is pas klaar met een PR, plus een vangnet bij sessiestart

- **Datum:** 1 oktober 2026
- **Status:** BESLOTEN (Dennis akkoord, 1 okt 2026)
- **Vult aan:** `BESLUIT_WORKTREE_PER_SESSIE_2026-10.md` (zelfde dag)
- **Vervangt:** de regel "nooit `git push`" in de lokale `klaar-check`-skill, die sinds 17 sep al botste met CLAUDE.md

## Aanleiding

Op 1 oktober 2026 bleek bij een scan dat afgerond, gecommit werk alleen lokaal stond — nooit gepusht, geen PR, onzichtbaar voor Dennis en voor elke volgende sessie:

| Branch | Wat | Sinds |
|---|---|---|
| `fix/intake-session-s3-leespad` | S3 van de sessie-architectuur (9 bestanden + tests) | 1 okt |
| `fix/gidsen-legacy-leefstijlcheck-links` | legacy `/intake/voeding`-link op `/voeding-na-40` | 1 okt |
| `fix/footer-mobiel-2x2` | mobiele footer als 2x2-raster | 25 sep |
| `over-ons-voeding-eerst` | herschreven Over ons-pagina | 29 sep |
| `kennisbank-beelden-context` | 12 ongepushte commits bovenop open PR #60, incl. een nieuw blogartikel | 30 sep |
| `docs/plak2-plakg-overdracht` | retry/resume-fix van het USDA-script dat op dat moment draaide — de broncode bestond alleen nog lokaal en in procesgeheugen | 29 sep |

Daarnaast stond het complete macro/calorie-traject (Laag 0–C) al vier dagen in PR #57 onder een docs-titel die er niets over zei. Rechtgezet via PR #95–#99.

## Oorzaak

1. **De lokale `klaar-check`-skill zei "Nooit `git push` — dat blijft bij Dennis".** Dat was de regel van vóór 17 sep. CLAUDE.md staat sindsdien automatisch pushen naar een feature-branch toe. Een sessie die de skill netjes volgde, stopte na de commit; eindigde de sessie daar, dan bleef het werk lokaal.
2. **Niets keek terug.** Het worktree-besluit van dezelfde dag voorkomt commits op `main` en in de hoofdmap, maar niet een gecommitte feature-branch die nooit de remote bereikt. Een worktree maakt dat zelfs minder zichtbaar.

## Besluit

1. **Een taak is pas klaar als er een PR is.** De keten na een groene klaar-check is: commit → `git push -u origin <feature-branch>` → `gh pr create` → `pr-klaarmelden` (CI bewaken, mergen bij volledig groen). De `klaar-check`-skill wordt hierop aangepast. `bash deploy.sh` blijft bij Dennis; pushen naar `main` blijft geblokkeerd door `.githooks/pre-push`.
2. **Vangnet bij elke sessiestart:** `scripts/check-verweesd-werk.sh`, aangeroepen als `SessionStart`-hook in `.claude/settings.json`. Het meldt van de laatste 30 dagen (`PSF_VERWEESD_DAGEN`):
   - lokale branches met ongepushte commits, of die nooit gepusht zijn;
   - gepushte branches zonder open of gemergede PR;
   - worktrees met niet-gecommit werk;
   - een hoofdmap die niet op `main` staat.
   Het script is alleen-lezen (op `git fetch` na), faalt nooit en duurt ~3 s.
3. **Een sessie die verweesd werk ziet, meldt het aan Dennis vóór ze aan haar eigen taak begint.** Niet zelf mergen, weggooien of overzetten zonder akkoord: het kan werk van een andere, nog lopende sessie zijn.
4. **Een PR-titel dekt de inhoud.** Komt er werk bij dat niet bij de titel past, dan een eigen branch en PR (lesson van #57).

## Afgewezen

- **Automatisch pushen via een `post-commit`-hook.** Dan bereikt ook een halve WIP-commit de remote zonder dat er bewust een PR van komt, en draait de pre-push-gate (tsc + vitest, ~1 min) bij elke commit.
- **Alleen een afspraak in geheugen/CLAUDE.md.** De regel stond al in CLAUDE.md; de skill zei het tegenovergestelde en won.
- **Het vangnet laten blokkeren (exit ≠ 0).** Dan start een sessie niet als er een oude branch van iemand anders ligt; melden is genoeg.

## Bekende beperking

Na een squash-merge ziet git de originele lokale branch niet als "op main". Zulke branches blijven gemeld tot ze lokaal verwijderd zijn — dat is gewenst: `pr-klaarmelden` ruimt na de merge de eigen branch op.

## Handmatig door Dennis (`.claude/` staat in `.gitignore`)

`.claude/settings.json` — hook toevoegen:

```json
"hooks": {
  "SessionStart": [
    { "hooks": [ { "type": "command", "command": "bash \"$CLAUDE_PROJECT_DIR/scripts/check-verweesd-werk.sh\"" } ] }
  ]
}
```

`.claude/skills/klaar-check/SKILL.md` — de regel "**Nooit `git push`** — dat blijft bij Dennis." vervangen door push → PR → `pr-klaarmelden`, zoals in besluit 1.
