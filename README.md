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
| `gnapi-standards` | Pre-code hook: injects Gnapi coding standards before Claude writes source files. | `PreToolUse` hook |

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

It also adds a **pre-push review gate**: on a `git push` a second hook reminds
you to first run the **code-reviewer agent** (quality, asks-followed,
maintainability) and a **QA / e2e agent** before pushing a feature branch.

Both hooks are **non-blocking** (they only inject guidance). The standards hook
fires **once per session**; the push reminder fires per `git push`. They need
`node` on `PATH`; if absent they no-op. The machine-checkable subset (naming
format, `no-console`, `no-magic-numbers`, `no-floating-promises`, coverage) is
additionally enforced at commit/CI by `gnapi-scaffolding`'s lint overlay and
pre-commit hook.

## Repository layout

```
.
├── .claude-plugin/
│   └── marketplace.json              # marketplace catalog (lists all plugins)
├── plugins/
│   ├── gnapi-scaffolding/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json            # plugin manifest
│   │   └── skills/
│   │       └── scaffold-nestjs-service/
│   │           └── SKILL.md           # the skill
│   └── gnapi-standards/
│       ├── .claude-plugin/
│       │   └── plugin.json            # plugin manifest
│       ├── hooks/
│       │   └── hooks.json             # PreToolUse matchers → scripts
│       └── scripts/
│           ├── precode-standards.sh   # node guard / launcher (Write/Edit)
│           ├── precode-standards.js   # injects standards as additionalContext
│           ├── prepush-gate.sh        # node guard / launcher (Bash)
│           └── prepush-gate.js        # reminds of review gate on git push
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
