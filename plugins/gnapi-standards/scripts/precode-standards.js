#!/usr/bin/env node
// Reads a PreToolUse payload on stdin; if the tool is writing a source file and
// the standards have not yet been injected this session, prints a
// hookSpecificOutput.additionalContext block carrying the Gnapi coding
// standards. Stays silent (and always exits 0) otherwise, so it never blocks a
// tool call.
'use strict';

const fs = require('fs');
const path = require('path');

// File types we consider "source code" worth gating.
// A non-letter lookahead rather than an end anchor, so the same pattern also
// matches a path embedded in a Bash command string, not just a bare file_path.
const SOURCE_RE = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|java|rb|rs|kt|kts|cs|php|swift|scala)(?![A-Za-z])/i;

const STANDARDS = [
  'Gnapi coding standards — apply to ALL code you write in this session:',
  '',
  '- TDD (mandatory): write the failing test FIRST (RED), then the minimal code',
  '  to pass (GREEN), then refactor (IMPROVE). No production code without a test',
  '  driving it. Keep coverage above 85%.',
  '- SOLID: single-responsibility units, depend on abstractions not concretions,',
  '  keep interfaces small and substitutable. Prefer composition.',
  '- DRY: no copy-paste logic. Extract shared behaviour into one well-named home;',
  '  one source of truth per rule/constant.',
  '- Naming: meaningful, intent-revealing names. No cryptic abbreviations or',
  '  single letters (except trivial loop indices).',
  '- Comments: capture the hidden WHY and HOW (decisions, trade-offs, gotchas),',
  '  not the obvious WHAT. Document non-obvious behaviour as useful docs.',
  '- No hard-coded literals in sources. Extract to named constants and organize',
  '  them in their own files (grouped by domain), not scattered inline.',
  '- Structured logging & tracing: use the project logger (e.g. Pino), never',
  '  console.*. Carry request-id / trace-correlation context through logs.',
  '- Error management:',
  '  - Define errors with stable error-numbers; no anonymous throws.',
  '  - No unhandled exceptions and no floating promises.',
  '  - Catch blocks MUST take a real action + fallback (retry, compensate,',
  '    degrade, or surface a typed error). Never log-and-swallow.',
].join('\n');

function readStdin() {
  return new Promise((resolve) => {
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (raw += c));
    process.stdin.on('end', () => resolve(raw));
    process.stdin.on('error', () => resolve(''));
  });
}

async function main() {
  const raw = await readStdin();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (_) {
    process.exit(0); // malformed input: do not interfere
  }

  const toolInput = payload.tool_input || {};
  // Bash edits (sed -i, heredoc redirects) carry no file_path, so fall back to
  // scanning the raw command text. Deliberately loose: a false positive only
  // injects the standards slightly early, which is harmless, whereas a false
  // negative loses them for the entire session.
  const file =
    toolInput.file_path ||
    toolInput.notebook_path ||
    (typeof toolInput.command === 'string' ? toolInput.command : '') ||
    '';
  if (!SOURCE_RE.test(file)) process.exit(0); // no source file in play

  // Inject at most once per session, tracked by a marker in the plugin data dir.
  const dataDir = process.env.CLAUDE_PLUGIN_DATA || process.argv[2] || '';
  const session = payload.session_id || 'nosession';
  if (dataDir) {
    try {
      fs.mkdirSync(dataDir, {recursive: true});
      const marker = path.join(dataDir, `precode-${session}`);
      if (fs.existsSync(marker)) process.exit(0); // already injected this session
      fs.writeFileSync(marker, '1');
    } catch (_) {
      // If the marker cannot be written, fall through and still inject once.
    }
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: STANDARDS,
      },
    }),
  );
  process.exit(0);
}

main();
