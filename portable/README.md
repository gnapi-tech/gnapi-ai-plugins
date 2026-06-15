# Portable shims

The `scaffold-nestjs-service` skill and the `gnapi-standards` hook are written
for Claude Code (plugin marketplace, `Skill` tool, PreToolUse hook). This folder
ports the **content** to every harness ECC supports, generated from one source
of truth so the trees never drift.

## Sources of truth (edit these)

| File | Role |
|------|------|
| `../plugins/gnapi-scaffolding/skills/scaffold-nestjs-service/SKILL.md` | The scaffold playbook. |
| `STANDARDS.md` | Canonical house coding standards (mirror of the `gnapi-standards` hook text). |
| `build-shims.mjs` | Generator. Reads the two sources, fans out per-harness files. No dependencies. |

## Generated (do NOT hand-edit)

```sh
node portable/build-shims.mjs
```

| Output | Harness | Format |
|--------|---------|--------|
| `../AGENTS.md` | Universal (Codex, opencode, Cursor, Amp, Zed, Jules, …) | flattened playbook + inlined standards |
| `../CLAUDE.md` | Claude Code | pointer to the native plugin |
| `../GEMINI.md` | Gemini CLI | pointer to `AGENTS.md` |
| `../.codex/AGENTS.md` + `config.toml` | OpenAI Codex | project-local instructions + reference config |
| `../.cursor/rules/gnapi.mdc` | Cursor | always-apply project rule (MDC) |
| `../.opencode/opencode.json` | opencode | `instructions` → `AGENTS.md` |
| `../.agent/AGENTS.md` | Google Antigravity | instructions under `.agent/` |
| `../.agents/skills/<name>/SKILL.md` | Generic SKILL.md loaders | canonical skill, verbatim (frontmatter kept) |

CI (`.github/workflows/shims.yml`) regenerates and fails on any diff, so a source
edit without a regenerate can't merge.

## Install per harness

| Harness | How |
|---------|-----|
| **Claude Code** | Native plugin (auto-trigger + hook). `/plugin install gnapi-scaffolding@gnapi-claude`. Shims not needed. |
| **OpenAI Codex** | Reads `AGENTS.md` / `.codex/AGENTS.md` automatically. Copy into the target repo (or use this repo). |
| **Cursor** | `.cursor/rules/gnapi.mdc` applies automatically when present in the project. |
| **opencode** | `.opencode/opencode.json` points `instructions` at `AGENTS.md`. |
| **Google Antigravity** | Reads configs under `.agent/`. |
| **Gemini CLI** | Reference `AGENTS.md` from `GEMINI.md`, or install the skill via Gemini's mechanism. |
| **Other SKILL.md loaders** | Point them at `.agents/skills/<name>/SKILL.md`. |

## What does NOT port

- **Auto-trigger** — off-Claude you invoke the playbook manually when the user
  asks to scaffold a service. (The skill `description` is embedded so the agent
  can still recognise the intent.)
- **The PreToolUse hook** — its once-per-session injection is Claude-specific;
  the standards are inlined into every shim instead.
- **`Skill` / marketplace plumbing** — no-ops elsewhere.

This is the **ECC strategy** (per-harness native trees), but generated from one
source instead of hand-maintained.
