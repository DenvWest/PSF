#!/usr/bin/env bash
#
# check-supabase-schema.sh — remote Supabase schema + migratie-sync check
#
# Vereist eenmalig:
#   npx supabase login
#   npx supabase link --project-ref JOUW_REF   # Dashboard → Project Settings → General
#
# Gebruik:
#   npm run check:db-schema
#   bash scripts/check-supabase-schema.sh
#
# Leest geen DATABASE_URL / wachtwoord uit .env.local — alleen supabase link + CLI.

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SQL_FILE="scripts/check-supabase-schema.sql"
MIGRATIONS_DIR="supabase/migrations"

GREEN=$'\033[32m'
RED=$'\033[31m'
YELLOW=$'\033[33m'
DIM=$'\033[2m'
RESET=$'\033[0m'

fail_count=0
warn_count=0

CRITICAL_MIGRATIONS=(
  "20260610140000_intake_intake_log.sql"
  "20260627120000_intake_intake_log_nutrition_score.sql"
  "20260710120000_intake_sessions_recommendations_referral.sql"
  "20260706120000_funnel_views.sql"
)

section() {
  echo ""
  echo "${DIM}━━ $1 ━━${RESET}"
}

pass() {
  echo "  ${GREEN}✓${RESET} $1"
}

fail() {
  echo "  ${RED}✗${RESET} $1"
  fail_count=$((fail_count + 1))
}

warn() {
  echo "  ${YELLOW}!${RESET} $1"
  warn_count=$((warn_count + 1))
}

ensure_linked() {
  if [[ ! -f "$SQL_FILE" ]]; then
    echo "${RED}Ontbrekend: $SQL_FILE${RESET}"
    exit 1
  fi

  local probe
  probe="$(npx supabase db query --linked -o csv "select 1 as linked_ok" 2>&1)" || true
  if ! grep -q "linked_ok" <<<"$probe"; then
    echo "${RED}Geen werkende supabase link.${RESET}"
    echo ""
    echo "Setup:"
    echo "  npx supabase login"
    echo "  npx supabase link --project-ref JOUW_REF"
    echo ""
    echo "${DIM}CLI-output:${RESET}"
    echo "$probe" | sed 's/^/  /'
    exit 1
  fi
}

run_manifest_checks() {
  section "2. Schema-manifest (remote)"
  local raw line status kind name
  raw="$(npx supabase db query --linked -f "$SQL_FILE" -o csv 2>/dev/null || true)"
  if [[ -z "$raw" ]]; then
    fail "Kon schema-manifest niet ophalen (db query --linked)"
    return
  fi

  while IFS= read -r line; do
    [[ "$line" == "status,kind,name" ]] && continue
    [[ "$line" =~ ^(OK|MISSING), ]] || continue
    IFS=',' read -r status kind name <<<"$line"
    if [[ "$status" == "OK" ]]; then
      pass "$kind $name"
    else
      fail "$kind $name — ontbreekt op remote"
    fi
  done <<<"$raw"
}

run_migration_sync() {
  section "1. Migraties (lokaal vs remote)"
  local raw line local_ver remote_ver filename local_only remote_only synced
  local_only=0
  remote_only=0
  synced=0

  raw="$(npx supabase migration list --linked 2>/dev/null || true)"
  if [[ -z "$raw" ]]; then
    fail "Kon migratielijst niet ophalen (migration list --linked)"
    return
  fi

  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*([0-9]{14})[[:space:]]*\|[[:space:]]*([^|]*)\| ]] || continue
    remote_ver="$(echo "${BASH_REMATCH[2]}" | tr -d '[:space:]')"
    if [[ -z "$remote_ver" ]]; then
      local_only=$((local_only + 1))
    else
      synced=$((synced + 1))
    fi
  done <<<"$raw"

  if (( local_only > 0 && synced == 0 )); then
    warn "Remote migration history leeg — ${local_only} migraties alleen in repo (handmatig via SQL Editor is gebruikelijk hier)"
  else
    while IFS= read -r line; do
      [[ "$line" =~ ^[[:space:]]*([0-9]{14})[[:space:]]*\|[[:space:]]*([^|]*)\| ]] || continue
      local_ver="${BASH_REMATCH[1]}"
      remote_ver="$(echo "${BASH_REMATCH[2]}" | tr -d '[:space:]')"
      filename="$(ls "$MIGRATIONS_DIR"/"${local_ver}"_*.sql 2>/dev/null | head -1)"
      filename="${filename##*/}"

      if [[ -z "$remote_ver" ]]; then
        warn "Alleen lokaal: ${filename:-$local_ver} (remote leeg — draai SQL in Dashboard?)"
      elif [[ "$local_ver" == "$remote_ver" ]]; then
        pass "Gesynchroniseerd: ${filename:-$local_ver}"
      else
        warn "Verschil local/remote: ${filename:-$local_ver} (local=$local_ver remote=$remote_ver)"
      fi
    done <<<"$raw"
  fi

  echo ""
  echo "  ${DIM}Samenvatting: ${synced} gesync, ${local_only} alleen lokaal, ${remote_only} alleen remote${RESET}"

  section "1b. Kritieke migraties"
  local crit crit_id status_line
  for crit in "${CRITICAL_MIGRATIONS[@]}"; do
    crit_id="${crit:0:14}"
    if [[ ! -f "$MIGRATIONS_DIR/$crit" ]]; then
      fail "Bestand ontbreekt in repo: $crit"
      continue
    fi
    status_line="$(grep -E "[[:space:]]${crit_id}[[:space:]]*\|" <<<"$raw" | head -1 || true)"
    if [[ -z "$status_line" ]]; then
      fail "Niet in migratielijst: $crit"
      continue
    fi
    if [[ "$status_line" =~ \|[[:space:]]*([0-9]{14})[[:space:]]*\| ]]; then
      pass "$crit — remote migration history"
    else
      warn "$crit — nog niet in remote migration history (kolommen kunnen wel handmatig bestaan)"
    fi
  done
}

check_duplicate_migrations() {
  section "3. Dubbel in repo (migraties)"
  local -A col_files=()
  local -A table_files=()
  local f line table col key

  for f in "$MIGRATIONS_DIR"/*.sql; do
    [[ -f "$f" ]] || continue
    table=""
    while IFS= read -r line || [[ -n "$line" ]]; do
      line="$(echo "$line" | tr '[:upper:]' '[:lower:]')"
      if [[ "$line" =~ alter[[:space:]]+table[[:space:]]+public\.([a-z_0-9]+) ]]; then
        table="${BASH_REMATCH[1]}"
      fi
      if [[ "$line" =~ create[[:space:]]+table[[:space:]]+(if[[:space:]]+not[[:space:]]+exists[[:space:]]+)?public\.([a-z_0-9]+) ]]; then
        key="table:${BASH_REMATCH[2]}"
        if [[ -n "${table_files[$key]:-}" && "${table_files[$key]}" != "$f" ]]; then
          warn "DUBBEL create table ${BASH_REMATCH[2]} in $(basename "$f") en $(basename "${table_files[$key]}")"
        else
          table_files[$key]="$f"
        fi
      fi
      if [[ "$line" =~ add[[:space:]]+column[[:space:]]+(if[[:space:]]+not[[:space:]]+exists[[:space:]]+)?([a-z_0-9]+) ]]; then
        col="${BASH_REMATCH[2]}"
        if [[ -n "$table" ]]; then
          key="${table}.${col}"
          if [[ -n "${col_files[$key]:-}" && "${col_files[$key]}" != "$f" ]]; then
            warn "DUBBEL kolom $key in $(basename "$f") en $(basename "${col_files[$key]}")"
          else
            col_files[$key]="$f"
          fi
        fi
      fi
    done <"$f"
  done

  local ts dup_ts
  dup_ts="$(for f in "$MIGRATIONS_DIR"/*.sql; do basename "$f"; done | cut -c1-14 | sort | uniq -d)"
  if [[ -n "$dup_ts" ]]; then
    while IFS= read -r ts; do
      [[ -z "$ts" ]] && continue
      warn "DUBBEL migratie-timestamp prefix: $ts"
    done <<<"$dup_ts"
  else
    pass "Geen dubbele migratie-timestamps in bestandsnamen"
  fi
}

run_column_overview() {
  section "4. Kolommen per tabel (overzicht)"
  local raw
  raw="$(npx supabase db query --linked -o csv "
    select table_name, count(*)::int as column_count
    from information_schema.columns
    where table_schema = 'public'
    group by table_name
    order by table_name
  " 2>/dev/null || true)"

  if [[ -z "$raw" ]]; then
    warn "Kolommen-overzicht niet beschikbaar"
    return
  fi

  while IFS= read -r line; do
    [[ "$line" == "table_name,column_count" ]] && continue
    [[ "$line" =~ ^[a-z_0-9]+,[0-9]+$ ]] || continue
    echo "  ${DIM}$line${RESET}"
  done <<<"$raw"
}

main() {
  echo "${DIM}Supabase schema check — $(date '+%Y-%m-%d %H:%M')${RESET}"
  ensure_linked
  run_migration_sync
  run_manifest_checks
  check_duplicate_migrations
  run_column_overview

  echo ""
  if (( fail_count > 0 )); then
    echo "${RED}${fail_count} ontbrekende item(s) — zie MISSING hierboven.${RESET}"
    exit 1
  fi
  if (( warn_count > 0 )); then
    echo "${YELLOW}${warn_count} waarschuwing(en) — geen blocker.${RESET}"
  else
    echo "${GREEN}Schema-manifest OK.${RESET}"
  fi
}

main "$@"
