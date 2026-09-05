# AGENTS.md — Cursor

Projectregels: [`CLAUDE.md`](./CLAUDE.md). Die gelden hier ook.

## Git — na klaar-check direct committen, nooit pushen

Gelijk aan CLAUDE.md. **Wacht niet tot Dennis “commit” zegt.** Na elke afgeronde taak:

1. Klaar-check (als `src/` is geraakt)
2. Groen → **direct in dezelfde beurt** `git add` + `git commit`
3. Geen tussenstop, geen “wil je dat ik commit?”, geen alleen een voorgestelde commitregel

Eén commit per taak, geen tussentijdse deelcommits.

Klaar-check (alles groen vóór commit):

```bash
grep -rn "console.log" src/
npx tsc --noEmit
vitest
eslint --max-warnings 0
```

Faalt een check: niet committen, eerst fixen of de output melden.

Stage alleen de bestanden van **deze** taak. Nooit `git add -A` als er ander ongecommit werk in de tree staat. `.env.local` nooit stagen. Geen `--no-verify`. **Nooit `git push`.**
