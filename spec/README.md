# Repository Conventions

This repository follows the same high-level shape as `anthropics/skills`:

- Put each skill in `skills/<skill-name>/`.
- Require each skill to include a `SKILL.md` file with `name` and `description` frontmatter.
- Keep skill instructions concise and move background material into `references/`.
- Put Claude Code plugin collections in `.claude-plugin/marketplace.json`.
- Put skills.sh display grouping in `skills.sh.json`.
- Keep `template/README.md` as the starting point for new skills. Do not put a `SKILL.md` file under `template/`, because generic skills CLI scanners may treat it as an installable public skill.

## Skill Requirements

Each public skill should include:

- `SKILL.md`
- `agents/openai.yaml` when the skill should appear cleanly in Codex/OpenAI skill lists
- `references/` only when supporting context is useful but not always needed
- `scripts/` only for deterministic repeated operations

Avoid putting secrets, private URLs, or environment-specific credentials in skills.
