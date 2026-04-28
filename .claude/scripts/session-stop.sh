#!/usr/bin/env bash
# session-stop.sh — wird von Lokal-Claude bei jedem Stop ausgeführt.
# Hängt eine Zeile an SESSION-LOG.md an: Zeitstempel, Branch, kurzer Working-Tree-Status.
# Idempotent: wenn nichts auffällig ist, ist die Zeile minimal.
# Wenn unpushed Commits existieren, gibt es eine extra Warnung.

set -e
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)"

if [ ! -f SESSION-LOG.md ]; then
  exit 0
fi

TS=$(date -u +"%H:%M UTC")
DATE_TODAY=$(date -u +"%Y-%m-%d")
BRANCH=$(git branch --show-current 2>/dev/null || echo "?")
DIRTY=""
UNPUSHED=""

if [ -n "$(git status --short 2>/dev/null)" ]; then
  DIRTY=" · uncommitted changes"
fi

UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || echo "")
if [ -n "$UPSTREAM" ]; then
  AHEAD=$(git rev-list --count "$UPSTREAM..HEAD" 2>/dev/null || echo 0)
  if [ "$AHEAD" -gt 0 ] 2>/dev/null; then
    UNPUSHED=" · ⚠ $AHEAD unpushed commit(s)"
  fi
fi

if ! grep -q "^## $DATE_TODAY$" SESSION-LOG.md; then
  echo "" >> SESSION-LOG.md
  echo "## $DATE_TODAY" >> SESSION-LOG.md
  echo "" >> SESSION-LOG.md
fi

echo "- $TS · lokal · branch \`$BRANCH\`$DIRTY$UNPUSHED" >> SESSION-LOG.md
