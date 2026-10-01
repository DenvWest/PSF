#!/usr/bin/env bash
# Toont werk dat buiten een PR dreigt te verdwijnen: ongepushte commits,
# gepushte branches zonder PR en worktrees met niet-gecommit werk.
# Bedoeld als SessionStart-hook; faalt nooit (exit 0), ook zonder netwerk/gh.
# Zie docs/plan/BESLUIT_VERWEESD_WERK_VANGNET_2026-10.md.

set -u
MAX_LEEFTIJD_DAGEN=${PSF_VERWEESD_DAGEN:-30}

common_dir=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || exit 0
HOOFD=$(dirname "$common_dir")
cd "$HOOFD" || exit 0

timeout 15 git fetch -q --prune origin 2>/dev/null

heeft_gh=0
open_prs=""
if command -v gh >/dev/null 2>&1; then
  if open_prs=$(timeout 15 gh pr list --state open --limit 200 --json headRefName -q '.[].headRefName' 2>/dev/null); then
    heeft_gh=1
  fi
fi

grens=$(( $(date +%s) - MAX_LEEFTIJD_DAGEN * 86400 ))
regels=()

hoofd_branch=$(git symbolic-ref --short -q HEAD || echo detached)
[ "$hoofd_branch" != "main" ] && regels+=("hoofdmap staat op '$hoofd_branch' i.p.v. main")

while IFS=' ' read -r b ts; do
  [ "$b" = "main" ] && continue
  [ "$ts" -lt "$grens" ] && continue

  if git rev-parse -q --verify "origin/$b" >/dev/null; then
    n=$(git rev-list --count "origin/$b..$b")
    [ "$n" -gt 0 ] && regels+=("$b: $n commit(s) niet gepusht")
    if [ "$heeft_gh" = 1 ] && ! printf '%s\n' "$open_prs" | grep -qx "$b"; then
      uniek=$(git cherry origin/main "origin/$b" 2>/dev/null | grep -c '^+')
      if [ "$uniek" -gt 0 ]; then
        gemerged=$(timeout 10 gh pr list --state merged --head "$b" --json number -q '.[0].number' 2>/dev/null)
        [ -z "$gemerged" ] && regels+=("$b: gepusht, maar geen open of gemergede PR")
      fi
    fi
  else
    n=$(git cherry origin/main "$b" 2>/dev/null | grep -c '^+')
    [ "$n" -gt 0 ] && regels+=("$b: $n commit(s) alleen lokaal, nooit gepusht")
  fi
done < <(git for-each-ref --format='%(refname:short) %(committerdate:unix)' refs/heads)

while IFS= read -r w; do
  [ "$w" = "$HOOFD" ] && continue
  c=$(git -C "$w" status --porcelain 2>/dev/null | grep -vc 'node_modules')
  [ "$c" -gt 0 ] && regels+=("worktree ${w#"$HOOFD"/}: $c niet-gecommitte wijziging(en)")
done < <(git worktree list --porcelain | awk '/^worktree /{print $2}')

if [ "${#regels[@]}" -gt 0 ]; then
  echo "Verweesd werk (laatste $MAX_LEEFTIJD_DAGEN dagen) — eerst afmaken tot een PR of bewust weggooien:"
  printf '  - %s\n' "${regels[@]}"
  echo "Zie docs/plan/BESLUIT_VERWEESD_WERK_VANGNET_2026-10.md"
fi
exit 0
