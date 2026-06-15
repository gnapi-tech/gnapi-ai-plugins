# Gnapi coding standards

> Canonical source of the standards the `gnapi-standards` PreToolUse hook injects
> on Claude. On platforms without that hook (Codex, opencode, Cursor, Gemini),
> these are inlined into the generated `AGENTS.md` so they still apply.
> Keep this file in sync with `plugins/gnapi-standards/scripts/precode-standards.js`.

Apply to ALL code you write in a session:

- **TDD (mandatory):** write the failing test FIRST (RED), then the minimal code
  to pass (GREEN), then refactor (IMPROVE). No production code without a test
  driving it. Keep coverage above 85%.
- **SOLID:** single-responsibility units, depend on abstractions not
  concretions, keep interfaces small and substitutable. Prefer composition.
- **DRY:** no copy-paste logic. Extract shared behaviour into one well-named
  home; one source of truth per rule/constant.
- **Naming:** meaningful, intent-revealing names. No cryptic abbreviations or
  single letters (except trivial loop indices).
- **Comments:** capture the hidden WHY and HOW (decisions, trade-offs, gotchas),
  not the obvious WHAT. Document non-obvious behaviour as useful docs.
- **No hard-coded literals** in sources. Extract to named constants and organize
  them in their own files (grouped by domain), not scattered inline.
- **Structured logging & tracing:** use the project logger (e.g. Pino), never
  `console.*`. Carry request-id / trace-correlation context through logs.
- **Error management:**
  - Define errors with stable error-numbers; no anonymous throws.
  - No unhandled exceptions and no floating promises.
  - Catch blocks MUST take a real action + fallback (retry, compensate, degrade,
    or surface a typed error). Never log-and-swallow.
