#!/usr/bin/env bash
# session-start.sh — wird von Lokal-Claude bei jedem Session-Start ausgeführt.
# Zeigt den aktuellen Stand kompakt, sodass die neue Instanz sofort weiß wo sie ist.
# Web-Claude liest SESSION-CONTEXT.md über die CLAUDE.md-Pflicht-Referenz.

set -e
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)"

echo "═══════════════════════════════════════════════════════════════════"
echo "  SESSION-START — CSC Studio Pro"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "📌 SESSION-CONTEXT.md — aktueller Stand:"
echo ""
if [ -f SESSION-CONTEXT.md ]; then
  sed -n '1,/^## Wo wir heute/p' SESSION-CONTEXT.md | head -60
else
  echo "  ⚠ SESSION-CONTEXT.md nicht gefunden — erstmaliger Start?"
fi
echo ""
echo "─── Git-Stand ──────────────────────────────────────────────────────"
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'unbekannt')"
echo ""
echo "Letzte 3 Commits auf main:"
git log --oneline origin/main -3 2>/dev/null || git log --oneline -3
echo ""
echo "Working-Tree:"
git status --short 2>/dev/null | head -10
if [ -z "$(git status --short 2>/dev/null)" ]; then
  echo "  (clean)"
fi
echo ""
echo "─── SESSION-LOG (letzte 5 Einträge) ────────────────────────────────"
if [ -f SESSION-LOG.md ]; then
  grep -E "^- [0-9]{2}:" SESSION-LOG.md | tail -5
fi
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  Pflicht: Lies SESSION-CONTEXT.md komplett, bevor du auf den"
echo "  ersten User-Prompt antwortest. Aktualisiere sie BEVOR du eine"
echo "  Antwort beendest, wenn sich der Stand geändert hat."
echo "═══════════════════════════════════════════════════════════════════"
