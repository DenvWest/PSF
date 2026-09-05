# AGENTS.md — Cursor

Projectregels: [`CLAUDE.md`](./CLAUDE.md). Die gelden hier ook.

## Git — automatisch committen, nooit pushen

Gelijk aan CLAUDE.md. **Wacht niet tot Dennis “commit” zegt.** Na elke afgeronde taak: klaar-check (als `src/` is geraakt), daarna zelf `git add` + `git commit`. Eén commit per taak, geen tussentijdse deelcommits.

Klaar-check (alles groen vóór commit):

```bash
grep -rn "console.log" src/
npx tsc --noEmit
vitest
eslint --max-warnings 0
```

Faalt een check: niet committen, eerst fixen of de output melden.

Stage alleen de bestanden van **deze** taak. Nooit `git add -A` als er ander ongecommit werk in de tree staat. `.env.local` nooit stagen. Geen `--no-verify`. **Nooit `git push`.**
