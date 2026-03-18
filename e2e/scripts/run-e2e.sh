#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
E2E_DIR="$(dirname "$SCRIPT_DIR")"
RESULTS_DIR="$E2E_DIR/results"

APP_ID="com.anonymous.wdkstarterreactnative"

# ── Colours ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $*"; }

# ── Load .env (secrets kept out of source control) ───────
ENV_FILE="$E2E_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  info "Loading secrets from e2e/.env"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  warn "e2e/.env not found — copy e2e/.env.example and fill in values."
fi

# ── Pre-flight checks ───────────────────────────────────
if ! command -v maestro &>/dev/null; then
  fail "Maestro CLI not found."
  echo "  Install it with:  curl -Ls 'https://get.maestro.mobile.dev' | bash"
  exit 1
fi

if [ -z "${E2E_SEED_PHRASE:-}" ]; then
  fail "E2E_SEED_PHRASE is not set. Add it to e2e/.env"
  exit 1
fi

# ── Prepare results directory ────────────────────────────
rm -rf "$RESULTS_DIR"
mkdir -p "$RESULTS_DIR"

# ── Detect platform ─────────────────────────────────────
PLATFORM="${E2E_PLATFORM:-auto}"
if [ "$PLATFORM" = "auto" ]; then
  if xcrun simctl list devices booted 2>/dev/null | grep -q "Booted"; then
    PLATFORM="ios"
  elif command -v adb &>/dev/null && adb devices 2>/dev/null | grep -q "device$"; then
    PLATFORM="android"
  else
    warn "No booted simulator/emulator detected. Maestro will use whatever is available."
    PLATFORM="any"
  fi
fi
info "Platform: $PLATFORM"

# ── Locate pre-built app binary ──────────────────────────
APP_PATH=""
if [ "$PLATFORM" = "ios" ]; then
  APP_PATH=$(find "$HOME/Library/Developer/Xcode/DerivedData" \
    -name "wdkstarterreactnative.app" \
    -path "*/Debug-iphonesimulator/*" \
    -not -path "*/Index.noindex/*" \
    2>/dev/null | head -1)
  if [ -z "$APP_PATH" ]; then
    fail "Could not find pre-built .app binary in DerivedData."
    echo "  Build first with:  npx expo run:ios"
    exit 1
  fi
  info "App binary: $APP_PATH"
fi

# ── Seed phrase ──────────────────────────────────────────
LAST_SEED_WORD="${E2E_SEED_PHRASE##* }"
export LAST_SEED_WORD

# ── Expo app name (for dev-client launcher selector) ─────
# Derive from app.json so selector stays in sync if project is renamed
E2E_EXPO_APP_NAME="${E2E_EXPO_APP_NAME:-}"
if [ -z "$E2E_EXPO_APP_NAME" ]; then
  E2E_EXPO_APP_NAME=$(node -e "try{console.log(require('$E2E_DIR/../app.json').expo.name)}catch(e){console.log('wdk-starter-react-native')}" 2>/dev/null || echo "wdk-starter-react-native")
fi
export E2E_EXPO_APP_NAME

# ── Helper: fresh-install the app ────────────────────────
fresh_install() {
  if [ "$PLATFORM" = "ios" ]; then
    xcrun simctl terminate booted "$APP_ID" 2>/dev/null || true
    xcrun simctl uninstall booted "$APP_ID" 2>/dev/null || true
    xcrun simctl install booted "$APP_PATH"
    echo -n "$E2E_SEED_PHRASE" | xcrun simctl pbcopy booted
  elif [ "$PLATFORM" = "android" ]; then
    adb shell am force-stop "$APP_ID" 2>/dev/null || true
    adb shell pm clear "$APP_ID" 2>/dev/null || true
    # Use temp file + read to avoid shell injection (phrase may contain ', ", $, `, etc.)
    TMP_PHRASE=$(mktemp)
    printf '%s' "$E2E_SEED_PHRASE" > "$TMP_PHRASE"
    PHRASE_ESCAPED=$(sed 's/\\/\\\\/g; s/"/\\"/g; s/`/\\`/g; s/\$/\\$/g' "$TMP_PHRASE" | tr -d '\n\r')
    adb shell "am broadcast -a clipper.set -e text \"$PHRASE_ESCAPED\"" 2>/dev/null || true
    rm -f "$TMP_PHRASE"
  fi
}

# ── Run Maestro flows one-by-one with fresh installs ────
FLOWS_DIR="$E2E_DIR/flows"
EXIT_CODE=0
TOTAL=0
PASSED=0
FAILED=0

info "Running Maestro E2E tests..."
info "Flows directory: $FLOWS_DIR"
echo ""

# ── Flow filter (optional) ─────────────────────────────────
# E2E_FLOWS="onboarding-navigation,import-wallet" runs only those flows
# E2E_TAGS="smoke" runs only flows with that tag (comma-separated)
# Values are sanitized to prevent command injection (alphanumeric, hyphen, underscore, comma, space only)
E2E_FLOWS="${E2E_FLOWS:-}"
E2E_TAGS="${E2E_TAGS:-}"
if [ -n "$E2E_FLOWS" ] && ! [[ "$E2E_FLOWS" =~ ^[a-zA-Z0-9_, -]+$ ]]; then
  fail "E2E_FLOWS contains invalid characters (use only alphanumeric, hyphen, underscore, comma, space)"
  exit 1
fi
if [ -n "$E2E_TAGS" ] && ! [[ "$E2E_TAGS" =~ ^[a-zA-Z0-9_, -]+$ ]]; then
  fail "E2E_TAGS contains invalid characters (use only alphanumeric, hyphen, underscore, comma, space)"
  exit 1
fi

# ── Flake retry ───────────────────────────────────────────
E2E_RETRY_FAILED="${E2E_RETRY_FAILED:-1}"   # retry failed flows once (0=disabled)

for flow in "$FLOWS_DIR"/*.yaml; do
  [ -f "$flow" ] || continue
  FLOW_NAME=$(basename "$flow" .yaml)

  # Filter by E2E_FLOWS (comma-separated list)
  if [ -n "$E2E_FLOWS" ]; then
    if ! echo ",$E2E_FLOWS," | grep -qF ",$FLOW_NAME,"; then
      continue
    fi
  fi

  # Filter by E2E_TAGS (flow must have at least one matching tag)
  if [ -n "$E2E_TAGS" ]; then
    MATCH=0
    IFS=',' read -ra TAGS <<< "$E2E_TAGS"
    for tag in "${TAGS[@]}"; do
      tag=$(echo "$tag" | tr -d ' ')
      [ -z "$tag" ] && continue
      if grep -qE "^\s+-\s+${tag}\s*$" "$flow" 2>/dev/null; then
        MATCH=1
        break
      fi
    done
    [ $MATCH -eq 1 ] || continue
  fi

  TOTAL=$((TOTAL + 1))
  info "[$TOTAL] Fresh install before: $FLOW_NAME"
  fresh_install

  info "[$TOTAL] Running: $FLOW_NAME"
  FLOW_EXIT=0
  maestro test \
    --format junit \
    --output "$RESULTS_DIR/${FLOW_NAME}.xml" \
    --env "LAST_SEED_WORD=$LAST_SEED_WORD" \
    --env "E2E_EXPO_APP_NAME=$E2E_EXPO_APP_NAME" \
    "$flow" || FLOW_EXIT=$?

  # Retry once on failure
  if [ $FLOW_EXIT -ne 0 ] && [ "${E2E_RETRY_FAILED:-0}" -eq 1 ]; then
    warn "[$TOTAL] Retrying $FLOW_NAME after failure..."
    fresh_install
    maestro test \
      --format junit \
      --output "$RESULTS_DIR/${FLOW_NAME}.xml" \
      --env "LAST_SEED_WORD=$LAST_SEED_WORD" \
      --env "E2E_EXPO_APP_NAME=$E2E_EXPO_APP_NAME" \
      "$flow" && FLOW_EXIT=0
  fi

  if [ $FLOW_EXIT -eq 0 ]; then
    ok "[$TOTAL] PASSED: $FLOW_NAME"
    PASSED=$((PASSED + 1))
  else
    fail "[$TOTAL] FAILED: $FLOW_NAME"
    FAILED=$((FAILED + 1))
    EXIT_CODE=1
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $TOTAL -eq 0 ]; then
  warn "No flows matched. Check E2E_FLOWS / E2E_TAGS if using filters."
  exit 0
fi
info "Results: $PASSED/$TOTAL passed, $FAILED failed"
if [ $EXIT_CODE -eq 0 ]; then
  ok "All E2E tests passed."
else
  fail "Some E2E tests failed."
fi
echo ""

# ── Report to Qase (if configured) ──────────────────────
if [ -n "${QASE_API_TOKEN:-}" ] && [ -n "${QASE_PROJECT:-}" ]; then
  info "Reporting results to Qase..."
  node "$SCRIPT_DIR/report-to-qase.js" || warn "Qase reporting failed (non-blocking)."
else
  warn "Qase reporting skipped: set QASE_API_TOKEN and QASE_PROJECT to enable."
fi

exit $EXIT_CODE
