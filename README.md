> Note: This repository contains Xiuxiu's implementation of reusable agent skills. For information about the Agent Skills standard, see https://agentskills.io.

[![skills.sh](https://skills.sh/b/Heng-xiu/xiuxiu-agent-skills)](https://skills.sh/Heng-xiu/xiuxiu-agent-skills)

# Skills

Skills are folders of instructions, scripts, and resources that agents load dynamically to improve performance on specialized tasks. Skills teach agents how to complete specific tasks in a repeatable way, whether that is reviewing delegation readiness, packaging context for autonomous work, producing evidence-based engineering assessments, or turning rough ideas into publish-ready social content.

For more information, check out:

- [What are skills?](https://support.claude.com/en/articles/skills)
- [Using skills in Claude](https://support.claude.com/en/articles/skills)
- [How to create custom skills](https://support.claude.com/en/articles/skills)
- [The Agent Skills Directory](https://www.skills.sh/)

# About This Repository

This repository contains skills that demonstrate Xiuxiu's agent workflow patterns. Each skill is self-contained in its own folder with a `SKILL.md` file containing the instructions and metadata that agents use.

This repository currently includes:

- `delegation-review`: Review whether a project or issue set is ready for unsupervised agent delegation.
- `content-pipeline`: Turn a rough content idea into platform-specific social drafts and posting recommendations.

## Disclaimer

These skills are provided for personal workflow, demonstration, and educational purposes. Always test skills thoroughly in your own environment before relying on them for critical tasks.

# Skill Sets

- [`./skills`](./skills): Reusable agent skills.
- [`./spec`](./spec): Repository conventions for maintaining skills.
- [`./template`](./template): Minimal skill template notes.

# Try in Claude Code, Codex, and skills.sh

## Claude Code

You can register this repository as a Claude Code Plugin marketplace by running the following command in Claude Code:

```text
/plugin marketplace add Heng-xiu/xiuxiu-agent-skills
```

Then, to install a specific set of skills:

1. Select `Browse and install plugins`.
2. Select `xiuxiu-agent-skills`.
3. Select `engineering-skills` or `content-skills`.
4. Select `Install now`.

Alternatively, directly install the plugin via:

```text
/plugin install engineering-skills@xiuxiu-agent-skills
```

```text
/plugin install content-skills@xiuxiu-agent-skills
```

After installing the plugin, you can use the skill by mentioning it. For instance: "Use the delegation-review skill to review all open issues for autonomous handoff readiness." Or: "Use content-pipeline to turn this rough idea into FB, Threads, IG, X, and Xiaohongshu drafts."

## Codex and other agents

Install the full repository with the `skills` CLI:

```bash
npx skills add Heng-xiu/xiuxiu-agent-skills
```

Install only one skill:

```bash
npx skills add https://github.com/Heng-xiu/xiuxiu-agent-skills/tree/main/skills/delegation-review
```

```bash
npx skills add https://github.com/Heng-xiu/xiuxiu-agent-skills/tree/main/skills/content-pipeline
```

Install globally for Codex:

```bash
npx skills add Heng-xiu/xiuxiu-agent-skills --skill delegation-review --global --agent codex
```

```bash
npx skills add Heng-xiu/xiuxiu-agent-skills --skill content-pipeline --global --agent codex
```

# Creating a Basic Skill

Skills are simple to create: just a folder with a `SKILL.md` file containing YAML frontmatter and instructions. You can use the template notes in this repository as a starting point:

```yaml
---
name: my-skill-name
description: A clear description of what this skill does and when to use it.
---
```

```markdown
# My Skill Name

[Add your instructions here that the agent will follow when this skill is active.]

## Examples

- Example usage 1
- Example usage 2

## Guidelines

- Guideline 1
- Guideline 2
```

The frontmatter requires two fields:

- `name`: A unique identifier for your skill, using lowercase letters and hyphens.
- `description`: A complete description of what the skill does and when to use it.

The markdown content below contains the instructions, examples, and guidelines that the agent will follow.

## Partner Skills

Skills are a useful way to teach agents how to get better at specific workflows, tools, and review processes. This repository may link to compatible partner or community skills over time.
