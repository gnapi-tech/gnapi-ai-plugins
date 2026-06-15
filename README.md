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

| Plugin | Description | Skills |
| :----- | :---------- | :----- |
| `gnapi-scaffolding` | Bakes Gnapi house rules (gts/Google lint + prettier, husky pre-commit, zod env validation, structured logging, error catalog, i18n, CI coverage gate) into new services from day one. | `scaffold-nestjs-service` |

### gnapi-scaffolding

After installing, invoke a skill directly or let Claude pick it up by task:

```shell
/gnapi-scaffolding:scaffold-nestjs-service
```

`scaffold-nestjs-service` — params `service_name` (kebab-case), `github_org`.
Scaffolds a production-grade NestJS service compliant with every house rule.

## Repository layout

```
.
├── .claude-plugin/
│   └── marketplace.json          # marketplace catalog (lists all plugins)
├── plugins/
│   └── gnapi-scaffolding/
│       ├── .claude-plugin/
│       │   └── plugin.json        # plugin manifest
│       └── skills/
│           └── scaffold-nestjs-service/
│               └── SKILL.md        # the skill
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
