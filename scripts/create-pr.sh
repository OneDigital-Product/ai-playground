#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/create-pr.sh [base-branch]
# Opens a GitHub compare URL for the current branch against base (default: main).
# Requires that the remote is GitHub and named 'origin'.

BASE_BRANCH=${1:-main}
REPO_URL=$(git remote get-url --push origin)

if [[ "$REPO_URL" =~ ^git@github\.com:(.*)\.git$ ]]; then
  SLUG="${BASH_REMATCH[1]}"
  HTTPS_URL="https://github.com/${SLUG}"
elif [[ "$REPO_URL" =~ ^https://github\.com/(.*)\.git$ ]]; then
  SLUG="${BASH_REMATCH[1]}"
  HTTPS_URL="https://github.com/${SLUG}"
else
  echo "Unsupported remote URL: $REPO_URL" >&2
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
URL="${HTTPS_URL}/compare/${BASE_BRANCH}...${BRANCH}?expand=1"

echo "Open PR URL:"
echo "$URL"

# On macOS, open in default browser
if command -v open >/dev/null 2>&1; then
  open "$URL"
fi

