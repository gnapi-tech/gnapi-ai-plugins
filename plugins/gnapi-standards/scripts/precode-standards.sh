#!/usr/bin/env bash
# Gnapi pre-code standards hook (PreToolUse on Write/Edit).
# Injects the house coding standards once per session on the first source-file
# write. Non-blocking: on any problem it exits 0 so the tool call proceeds.
set -euo pipefail

ROOT="${1:-${CLAUDE_PLUGIN_ROOT:-}}"
DATA="${2:-${CLAUDE_PLUGIN_DATA:-}}"

# node is the team runtime; if it is missing, do not interfere with the tool.
command -v node >/dev/null 2>&1 || exit 0

exec node "${ROOT}/scripts/precode-standards.js" "${DATA}"
