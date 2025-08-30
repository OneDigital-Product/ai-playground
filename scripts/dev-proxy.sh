#!/usr/bin/env bash
set -euo pipefail

# Simple helper to run local proxy development:
# - web on http://localhost:3001
# - admin on http://localhost:3002
# - host gateway on http://localhost:3000 (proxies /app, /admin, /reporting)

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is required (see packageManager in package.json)." >&2
  exit 1
fi

if [ ! -f "apps/host/.env" ]; then
  cat <<'EOF'
Warning: apps/host/.env not found.
Create one with:

WEB_ORIGIN=http://localhost:3001
ADMIN_ORIGIN=http://localhost:3002
REPORTING_ORIGIN=http://localhost:4000

Or copy apps/host/.env.local.example to apps/host/.env.local
EOF
fi

cleanup() {
  echo
  echo "Shutting down dev processes..."
  # Kill any started child processes (portable, no GNU xargs)
  local pids=()
  [[ -n "${WEB_PID-}" ]] && pids+=("$WEB_PID")
  [[ -n "${ADMIN_PID-}" ]] && pids+=("$ADMIN_PID")
  [[ -n "${HOST_PID-}" ]] && pids+=("$HOST_PID")
  if [ "${#pids[@]}" -gt 0 ]; then
    kill "${pids[@]}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Start apps in background
echo "Starting web on :3001"
PNPM_FILTER="--filter"
pnpm $PNPM_FILTER web dev &
WEB_PID=$!

# Pass explicit port to admin to avoid clashing with host (3000)
echo "Starting admin on :3002"
pnpm $PNPM_FILTER admin dev -- --port 3002 &
ADMIN_PID=$!

# Start host gateway (Next defaults to :3000)
echo "Starting host gateway on :3000"
pnpm $PNPM_FILTER @product/host dev &
HOST_PID=$!

# Wait until any process exits (portable alternative to 'wait -n')
while :; do
  for pid in "$WEB_PID" "$ADMIN_PID" "$HOST_PID"; do
    if ! kill -0 "$pid" 2>/dev/null; then
      break 2
    fi
  done
  sleep 1
done

echo "One process exited; terminating others..."
exit 0

