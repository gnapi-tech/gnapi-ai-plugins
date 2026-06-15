#!/usr/bin/env node
// Reads a PreToolUse(Bash) payload on stdin. If the command is a `git push`,
// injects a non-blocking reminder that the Gnapi pre-push review gate
// (code-reviewer agent + QA/e2e agent) must have run and passed first. Stays
// silent and always exits 0 otherwise, so it never blocks a tool call.
'use strict';

// True when any command segment is a `git ... push` invocation. Splits on shell
// separators, then treats a segment as a git-push only when its first token is
// `git` and `push` appears as a later bare token (so it survives global flags
// like `-C <path>` / `-c <cfg>` and ignores `push` inside an echo or a quoted
// commit message).
function isGitPush(command) {
  return String(command)
    .split(/[\n;&|]+/)
    .map((seg) => seg.trim().split(/\s+/).filter(Boolean))
    .some((tokens) => tokens[0] === 'git' && tokens.slice(1).includes('push'));
}

const REMINDER = [
  'Gnapi pre-push review gate — before this `git push` to a feature branch,',
  'both must have run and passed on the exact diff being pushed:',
  '  1. code-reviewer agent — code quality, every ask followed strictly,',
  '     maintainability prioritized. Resolve CRITICAL/HIGH findings first.',
  '  2. QA / e2e agent — exercises the service end-to-end; critical flows pass.',
  'If you have not run both, do that first, then push. (Pushing to develop/main',
  'is via PR, not direct.)',
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
    process.exit(0);
  }

  const command = (payload.tool_input && payload.tool_input.command) || '';
  if (!isGitPush(command)) process.exit(0);

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: REMINDER,
      },
    }),
  );
  process.exit(0);
}

main();
