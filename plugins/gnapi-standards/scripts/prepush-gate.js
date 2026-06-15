#!/usr/bin/env node
// PreToolUse(Bash) gate. BLOCKS a `git push` unless the current HEAD commit has
// been explicitly approved (code-reviewer + QA/e2e agents). Approval is a marker
// file inside the repo's git dir holding the approved commit SHA; any new commit
// changes the SHA and re-arms the gate.
//
// Fail-open: on malformed input or any git error it exits 0 (normal flow) so it
// never bricks unrelated work — the only thing it deliberately stops is a push
// of an un-approved commit.
'use strict';

const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const MARKER_NAME = 'gnapi-review-approved';

// A segment is a git-push when its first token is `git` and `push` appears as a
// later bare token (survives global flags like `-C <path>` / `-c <cfg>`; ignores
// `push` inside an echo or a quoted commit message).
function isGitPush(command) {
  return String(command)
    .split(/[\n;&|]+/)
    .map((seg) => seg.trim().split(/\s+/).filter(Boolean))
    .some((tokens) => tokens[0] === 'git' && tokens.slice(1).includes('push'));
}

function git(cwd, args) {
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'], // silence git's stderr on failure
  }).trim();
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

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

  const cwd = payload.cwd || process.cwd();

  let gitDir;
  let head;
  try {
    gitDir = git(cwd, ['rev-parse', '--absolute-git-dir']);
    head = git(cwd, ['rev-parse', 'HEAD']);
  } catch (_) {
    process.exit(0); // not a repo / no commits — nothing to gate, fail open
  }

  const marker = path.join(gitDir, MARKER_NAME);
  let approved = '';
  try {
    approved = fs.readFileSync(marker, 'utf8').trim();
  } catch (_) {
    approved = '';
  }

  if (approved === head) process.exit(0); // this exact commit is approved → allow

  const approveCmd =
    'git rev-parse HEAD > "$(git rev-parse --absolute-git-dir)/' + MARKER_NAME + '"';

  deny(
    [
      'Gnapi pre-push review gate: this commit (' +
        head.slice(0, 12) +
        ') is NOT approved, so the push is blocked.',
      '',
      'Before pushing this feature branch you MUST:',
      '  1. Run the code-reviewer agent — review code quality, confirm every ask',
      '     is followed strictly, maintainability prioritized; resolve all',
      '     CRITICAL/HIGH findings.',
      '  2. Run the QA / e2e agent — exercise the service end-to-end; critical',
      '     flows must pass.',
      '',
      'Only once BOTH are green, record approval for this exact commit:',
      '  ' + approveCmd,
      'then retry the push. (Any new commit re-arms the gate.)',
    ].join('\n'),
  );
}

main();
