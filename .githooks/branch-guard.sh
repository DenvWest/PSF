#!/bin/sh
# Gedeelde check voor pre-commit: de hoofdmap is alleen voor `next dev` op main,
# elke sessie werkt in een eigen worktree (zie CLAUDE.md "Git & deploy").
# Bewust overrulen: PSF_ALLOW_MAIN_CHECKOUT=1 git commit ...

[ "$PSF_ALLOW_MAIN_CHECKOUT" = "1" ] && exit 0

branch=$(git symbolic-ref --short -q HEAD)
git_dir=$(cd "$(git rev-parse --git-dir)" && pwd)
common_dir=$(cd "$(git rev-parse --git-common-dir)" && pwd)

if [ "$branch" = "main" ]; then
  echo "[branch-guard] Commit op 'main' geblokkeerd — werk gaat via een feature-branch + PR." >&2
  echo "  Start een eigen worktree: git worktree add .claude/worktrees/<taak> -b feat/<taak> origin/main" >&2
  exit 1
fi

if [ "$git_dir" = "$common_dir" ]; then
  echo "[branch-guard] Commit in de hoofdmap geblokkeerd (branch '$branch')." >&2
  echo "  De hoofdmap draait alleen 'next dev' op main; meerdere sessies delen hem." >&2
  echo "  Werk in een eigen worktree: git worktree add .claude/worktrees/<taak> -b feat/<taak> origin/main" >&2
  exit 1
fi

exit 0
