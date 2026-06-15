# gnapi-claude

Gnapi team's [Claude Code](https://code.claude.com) plugin marketplace — shared
skills, commands, and agents. Add it once and every team member gets the same
house-rule tooling inside Claude Code.

## Install

In any Claude Code session:

```shell
/plugin marketplace add gnapi-tech/gnapi-claude
/plugin install gnapi-scaffolding@gnapi-claude
```

Pull future updates with:

```shell
/plugin marketplace update gnapi-claude
/plugin update gnapi-scaffolding
```

## Plugins

| Plugin | Description | Provides |
| :----- | :---------- | :------- |
| `gnapi-scaffolding` | Bakes Gnapi house rules (TDD, gts/Google lint + prettier, husky pre-commit, zod env validation, structured logging + tracing, error catalog, i18n, CI coverage gate) into new services from day one. | skill `scaffold-nestjs-service` |
| `gnapi-standards` | Injects Gnapi coding standards into context before Claude writes source files. | `PreToolUse` hook |

### gnapi-scaffolding

After installing, invoke a skill directly or let Claude pick it up by task:

```shell
/gnapi-scaffolding:scaffold-nestjs-service
```

`scaffold-nestjs-service` — params `service_name` (kebab-case), `github_org`.
Scaffolds a production-grade NestJS service compliant with every house rule.

### gnapi-standards

No command to run — once installed it works automatically. On the **first
source-file write of a session** (`Write`/`Edit`/`MultiEdit`/`NotebookEdit` on a
`.ts/.js/.py/.go/...` file) a `PreToolUse` hook injects the Gnapi coding
standards into Claude's context:

- **TDD** — test-first (RED → GREEN → refactor), no production code without a
  test; keep coverage **> 85%**.
- **SOLID & DRY** — single-responsibility, depend on abstractions, no copy-paste.
- **Naming** — meaningful, intent-revealing; no cryptic abbreviations.
- **Comments** — capture the hidden *why* and *how*, not the obvious *what*.
- **No hard-coded literals** — extract to named constants in their own files.
- **Structured logging & tracing** — project logger only, with trace correlation.
- **Error management** — error-numbered errors, no unhandled exceptions, and
  catch blocks that take a real action + fallback (never log-and-swallow).

The hook is **non-blocking** (it only injects guidance) and fires **once per
session** to stay quiet. It needs `node` on `PATH`; if absent it no-ops.

The machine-checkable subset (naming format, `no-console`, `no-magic-numbers`,
`no-floating-promises`, coverage) is additionally enforced at commit/CI by
`gnapi-scaffolding`'s lint overlay and pre-commit hook. The **review gate**
(code-reviewer + QA agents before merge) is enforced server-side by branch
protection + required CI status checks, not by a local hook.

## Using on other agents (Codex, opencode, Cursor, Gemini)

The plugin format (marketplace, `Skill` tool, PreToolUse hook) is Claude-specific,
but the **playbook content is portable**. `portable/build-shims.mjs` generates a
self-contained `AGENTS.md` (skill steps + inlined standards) from the same
sources, so non-Claude agents run the identical playbook — they just trigger it
manually and have the standards inlined instead of hook-injected.

```shell
node portable/build-shims.mjs   # regenerate AGENTS.md from SKILL.md + portable/STANDARDS.md
```

Per-platform install and what does/doesn't carry over: see [`portable/README.md`](portable/README.md).
`AGENTS.md` is generated — edit the sources, not the output; CI fails on drift.

## Repository layout

```
.
├── .claude-plugin/
│   └── marketplace.json              # marketplace catalog (lists all plugins)
├── .github/workflows/
│   └── shims.yml                     # fails if AGENTS.md is out of date
├── plugins/
│   ├── gnapi-scaffolding/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json            # plugin manifest
│   │   └── skills/
│   │       └── scaffold-nestjs-service/
│   │           └── SKILL.md           # the skill (source of truth)
│   └── gnapi-standards/
│       ├── .claude-plugin/
│       │   └── plugin.json            # plugin manifest
│       ├── hooks/
│       │   └── hooks.json             # PreToolUse matchers → scripts
│       └── scripts/
│           ├── precode-standards.sh   # node guard / launcher (Write/Edit)
│           └── precode-standards.js   # injects standards as additionalContext
├── portable/
│   ├── STANDARDS.md                   # canonical standards (mirror of the hook text)
│   ├── build-shims.mjs                # generator: sources → AGENTS.md
│   └── README.md                      # per-platform install + porting notes
├── AGENTS.md                          # GENERATED portable shim (Codex/opencode/Cursor/Gemini)
└── README.md
```

## Adding a new skill

1. Drop it under an existing plugin: `plugins/<plugin>/skills/<skill-name>/SKILL.md`.
   The `SKILL.md` needs YAML frontmatter with `name` and `description`.
2. Or add a whole new plugin: create `plugins/<new-plugin>/.claude-plugin/plugin.json`
   plus its `skills/`, then append an entry to `.claude-plugin/marketplace.json`.
3. Bump the `version` in the affected `plugin.json` and the marketplace entry so
   `/plugin update` actually ships it to the team.
4. Open a PR to `develop`.

## Contributing

Work on a branch off `develop`; open a PR back to `develop`. `main` is the
released marketplace state that team sessions install from.
