# Agent Instructions

This repository follows the `anthropics/skills` layout.

## Structure

- Put public skills under `skills/<skill-name>/`.
- Keep each skill self-contained.
- Require each skill to have `SKILL.md` with only `name` and `description` frontmatter unless a target platform requires extra metadata in a separate file.
- Put Claude Code plugin sets in `.claude-plugin/marketplace.json`.
- Put skills.sh grouping in `skills.sh.json`.
- Keep templates under `template/`.
- Keep repo maintenance conventions under `spec/`.

## Skill Quality

- Keep `SKILL.md` concise and operational.
- Move background, long examples, or source notes into `references/`.
- Add `agents/openai.yaml` for skills intended to install cleanly into Codex/OpenAI skill lists.
- Prefer `rg` in instructions where file search is required.
- Do not include secrets, private credentials, or environment-specific tokens.

## Release Checklist

Before publishing changes:

- Validate JSON files.
- Confirm every skill listed in `.claude-plugin/marketplace.json` exists and contains `SKILL.md`.
- Confirm every public skill has valid `name` and `description` frontmatter.
- Test discovery with `npx skills add . --list` when possible.
