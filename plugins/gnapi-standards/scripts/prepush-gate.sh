#!/usr/bin/env bash
# Gnapi pre-push review-gate hook (PreToolUse on Bash). Reminds Claude to run
# the code-reviewer + QA agents before a `git push`. Non-blocking: on any
# problem it exits 0 so the tool call proceeds.
set -euo pipefail

ROOT="${1:-${CLAUDE_PLUGIN_ROOT:-}}"

command -v node >/dev/null 2>&1 || exit 0

exec node "${ROOT}/scripts/prepush-gate.js"
