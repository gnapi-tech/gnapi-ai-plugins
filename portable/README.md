# Portable shims

The `scaffold-nestjs-service` skill and the `gnapi-standards` hook are written
for Claude Code (plugin marketplace, `Skill` tool, PreToolUse hook). This folder
ports the **content** to agents that don't read that format.

## What's here

| File | Role |
|------|------|
| `STANDARDS.md` | Canonical house coding standards. Mirror of the text the `gnapi-standards` hook injects. |
| `build-shims.mjs` | Generator. Reads the skill's `SKILL.md` + `STANDARDS.md`, emits root `AGENTS.md`. No dependencies. |
| `../AGENTS.md` | **Generated** — self-contained playbook + inlined standards. Do not hand-edit. |

## Regenerate

```sh
node portable/build-shims.mjs
```

Run after editing `SKILL.md` or `STANDARDS.md`. CI (`.github/workflows/shims.yml`)
fails if `AGENTS.md` is out of date.

## Install per platform

| Platform | How |
|----------|-----|
| **Claude Code** | Use the native plugin (auto-trigger + hook). `AGENTS.md` not needed. |
| **OpenAI Codex** | Reads `AGENTS.md` at repo root automatically. Drop it in the target repo (or this repo for contributors). |
| **opencode** | Point `instructions` / agent rules at `AGENTS.md`, or symlink its rules file to it. |
| **Cursor** | `ln -s ../AGENTS.md .cursor/rules/gnapi-scaffold.md`, or paste into Project Rules. |
| **Gemini CLI** | Reference `AGENTS.md` from `GEMINI.md`, or install the skill via Gemini's skill mechanism if available. |

## What does NOT port

- **Auto-trigger** — on non-Claude agents you invoke the playbook manually when
  the user asks to scaffold a service.
- **The PreToolUse hook** — its once-per-session injection is Claude-specific;
  the standards are inlined into `AGENTS.md` instead.
- **`Skill` / marketplace plumbing** — no-ops elsewhere.
