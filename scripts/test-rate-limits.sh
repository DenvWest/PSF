#!/usr/bin/env bash
#
# test-rate-limits.sh — controleert of de rate limiting werkt op de 4 endpoints
# die per-key/per-sessie beperkt zijn.
#
# Gebruik:
#   1. Zet lage limieten in .env.local en herstart de dev-server:
#        PARTNER_INTAKE_RATE_LIMIT=3
#        PARTNER_ANALYTICS_RATE_LIMIT=5
#        INTAKE_CONSENT_DELETE_RATE_LIMIT=3
#        ADMIN_DATA_RATE_LIMIT=5
#        PARTNER_API_KEYS=test-key:00000000-0000-0000-0000-000000000001
#   2. Draai:  bash scripts/test-rate-limits.sh
#
# Secrets (PARTNER_API_KEYS, COOKIE_SECRET, ADMIN_SECRET) en de limieten worden
# uit .env.local gelezen. Overrides kunnen via de omgeving:
#   BASE_URL=http://localhost:3000 bash scripts/test-rate-limits.sh

set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
ENV_FILE="${ENV_FILE:-.env.local}"

# --- .env.local inlezen (alleen voor secrets + limietwaarden) -----------------
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "Waarschuwing: $ENV_FILE niet gevonden — gebruik omgevingsvariabelen."
fi

GREEN=$'\033[32m'; RED=$'\033[31m'; YELLOW=$'\033[33m'; DIM=$'\033[2m'; RESET=$'\033[0m'
fail_count=0

# Eerste geldige partner-key uit PARTNER_API_KEYS halen ("key:orgId,key2:orgId2")
first_segment="${PARTNER_API_KEYS%%,*}"
API_KEY="${first_segment%%:*}"

# Limietwaarden (val terug op de testdefaults uit dit script als ze niet gezet zijn)
PI_LIMIT="${PARTNER_INTAKE_RATE_LIMIT:-3}"
PA_LIMIT="${PARTNER_ANALYTICS_RATE_LIMIT:-5}"
CD_LIMIT="${INTAKE_CONSENT_DELETE_RATE_LIMIT:-3}"
AD_LIMIT="${ADMIN_DATA_RATE_LIMIT:-5}"

warn_high() {
  local name="$1" val="$2"
  if (( val > 50 )); then
    echo "${YELLOW}! $name=$val is hoog — zet 'm laag in .env.local en herstart de dev-server.${RESET}"
  fi
}

# run_test <naam> <limiet> <curl-args...>
# Vuurt <limiet>+1 requests af; verwacht de eerste <limiet> als niet-429 en de
# laatste als 429. 500/503 telt als "doorgelaten" (DB niet geconfigureerd lokaal).
run_test() {
  local name="$1" limit="$2"; shift 2
  echo
  echo "── $name (limiet=$limit) ───────────────────────────"
  local total=$(( limit + 1 ))
  local first_429=0 retry=""
  for (( i = 1; i <= total; i++ )); do
    local out code
    out=$(curl -s -o /dev/null -w "%{http_code} %header{retry-after}" "$@" 2>/dev/null)
    code="${out%% *}"
    [[ "$code" == "429" && $first_429 -eq 0 ]] && { first_429=$i; retry="${out#* }"; }
    printf "  ${DIM}request %-2d → %s${RESET}\n" "$i" "$out"
  done

  if (( first_429 == total )); then
    echo "  ${GREEN}✓ PASS${RESET} — eerste $limit doorgelaten, request $total → 429 (Retry-After: ${retry:-?})"
  elif (( first_429 == 0 )); then
    echo "  ${RED}✗ FAIL${RESET} — geen enkele 429. Limiet te hoog of server niet herstart?"
    (( fail_count++ ))
  else
    echo "  ${RED}✗ FAIL${RESET} — 429 al bij request $first_429 (verwacht: $total). Reset het venster (herstart server) en draai opnieuw."
    (( fail_count++ ))
  fi
}

echo "Doel: $BASE_URL"

# Bereikbaarheidscheck
if ! curl -s -o /dev/null --max-time 3 "$BASE_URL"; then
  echo "${RED}Kan $BASE_URL niet bereiken — draait 'npm run dev'?${RESET}"
  exit 1
fi

# --- 1. Partner intake --------------------------------------------------------
if [[ -z "$API_KEY" ]]; then
  echo "${YELLOW}Overslaan: partner-tests — geen PARTNER_API_KEYS gezet.${RESET}"
else
  warn_high PARTNER_INTAKE_RATE_LIMIT "$PI_LIMIT"
  run_test "1. Partner intake" "$PI_LIMIT" \
    -X POST "$BASE_URL/api/partner/intake" \
    -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
    -d '{"answers":{"q1":"a"}}'

  warn_high PARTNER_ANALYTICS_RATE_LIMIT "$PA_LIMIT"
  run_test "2. Partner analytics" "$PA_LIMIT" \
    -H "x-api-key: $API_KEY" "$BASE_URL/api/partner/analytics"
fi

# --- 3. Consent DELETE --------------------------------------------------------
if [[ -z "${COOKIE_SECRET:-}" ]]; then
  echo "${YELLOW}Overslaan: consent-test — geen COOKIE_SECRET gezet.${RESET}"
else
  SESSION_ID="11111111-1111-4111-8111-111111111111"
  SIGNED=$(COOKIE_SECRET="$COOKIE_SECRET" SESSION_ID="$SESSION_ID" node -e '
    const { createHmac } = require("crypto");
    const id = process.env.SESSION_ID;
    const sig = createHmac("sha256", process.env.COOKIE_SECRET).update(id).digest("hex");
    process.stdout.write(id + "." + sig);
  ')
  warn_high INTAKE_CONSENT_DELETE_RATE_LIMIT "$CD_LIMIT"
  run_test "3. Consent DELETE" "$CD_LIMIT" \
    -X DELETE "$BASE_URL/api/intake/consent" \
    -b "psf_intake_sid=$SIGNED"
fi

# --- 4. Admin data ------------------------------------------------------------
if [[ -z "${ADMIN_SECRET:-}" ]]; then
  echo "${YELLOW}Overslaan: admin-test — geen ADMIN_SECRET gezet.${RESET}"
else
  warn_high ADMIN_DATA_RATE_LIMIT "$AD_LIMIT"
  run_test "4. Admin data" "$AD_LIMIT" \
    -b "admin_token=$ADMIN_SECRET" "$BASE_URL/api/admin/data"
fi

echo
if (( fail_count == 0 )); then
  echo "${GREEN}Alle tests geslaagd.${RESET}"
  echo "${DIM}Tip: reset tussen runs door de dev-server te herstarten (in-memory store).${RESET}"
else
  echo "${RED}$fail_count test(s) gefaald.${RESET}"
  exit 1
fi
