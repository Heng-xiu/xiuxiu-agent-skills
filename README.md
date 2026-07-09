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
- `verify-ai-server-with-device-env`: Verify that a Dockerized AI inference server can run on a target GPU device. Covers host CUDA/driver compatibility, Docker NVIDIA runtime, compose GPU config, model loading, and API health.
- `know-your-unknowns`: Surface the unknowns in a coding task before, during, and after implementation — blindspot scan, blast-radius interview, decision log, and a pre-merge comprehension quiz, each emitting a self-contained HTML artifact.
- `portfolio-forge`: Forge personal information into a beautiful, production-ready personal website — content doc as single source of truth, per-section reference images, adversarial design review, high-fidelity replication, headless per-section QA, and reversible deployment. Also published standalone with a promo page at [heng-xiu.github.io/portfolio-forge](https://heng-xiu.github.io/portfolio-forge/).
- `site-teardown`: Tear down any website (single site or a series) into a five-layer structured record — visual design, layout, features, tech stack, and service integrations. Full-page Playwright screenshots (desktop + mobile, scroll-triggered animations handled), source-code verification over author claims, per-site markdown records, a cross-site DESIGN-SYSTEM.md, and an annotated "red-ink teardown notes" HTML artifact for discussion. Landing page: [heng-xiu.github.io/xiuxiu-agent-skills/site-teardown](https://heng-xiu.github.io/xiuxiu-agent-skills/site-teardown/).
- `waitlist-launch`: Build and launch a waitlist site for any product from scratch — signup form backed by a durable store, best-effort email-list sync, three-layer abuse defense that avoids unnecessary writes, a social share card, a post-signup referral loop, privacy-safe analytics, and a pre-launch gate checklist. Includes copywriting formulas and a channel playbook distilled from a real launch. Landing page: [heng-xiu.github.io/xiuxiu-agent-skills/waitlist-launch](https://heng-xiu.github.io/xiuxiu-agent-skills/waitlist-launch/).

## Skill Landing Pages

Each skill gets an introduction page for non-technical visitors, hosted on this repository's GitHub Pages under [`docs/`](./docs): [heng-xiu.github.io/xiuxiu-agent-skills](https://heng-xiu.github.io/xiuxiu-agent-skills/).

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
3. Select `engineering-skills`, `content-skills`, or `growth-skills`.
4. Select `Install now`.

Alternatively, directly install the plugin via:

```text
/plugin install engineering-skills@xiuxiu-agent-skills
```

```text
/plugin install content-skills@xiuxiu-agent-skills
```

```text
/plugin install growth-skills@xiuxiu-agent-skills
```

After installing the plugin, you can use the skill by mentioning it. For instance: "Use the delegation-review skill to review all open issues for autonomous handoff readiness." Or: "Use content-pipeline to turn this rough idea into FB, Threads, IG, X, and Xiaohongshu drafts." Or: "Use verify-ai-server-with-device-env to check if my Docker inference server will run on this GPU machine." Or: "Use know-your-unknowns to find my blindspots before I start this change." Or: "Use portfolio-forge to turn my profile into a personal website." Or: "Use waitlist-launch to build and ship a waitlist page for my new product."

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

```bash
npx skills add https://github.com/Heng-xiu/xiuxiu-agent-skills/tree/main/skills/verify-ai-server-with-device-env
```

```bash
npx skills add https://github.com/Heng-xiu/xiuxiu-agent-skills/tree/main/skills/know-your-unknowns
```

```bash
npx skills add https://github.com/Heng-xiu/xiuxiu-agent-skills/tree/main/skills/waitlist-launch
```

Install globally for Codex:

```bash
npx skills add Heng-xiu/xiuxiu-agent-skills --skill delegation-review --global --agent codex
```

```bash
npx skills add Heng-xiu/xiuxiu-agent-skills --skill content-pipeline --global --agent codex
```

```bash
npx skills add Heng-xiu/xiuxiu-agent-skills --skill verify-ai-server-with-device-env --global --agent codex
```

```bash
npx skills add Heng-xiu/xiuxiu-agent-skills --skill know-your-unknowns --global --agent codex
```

```bash
npx skills add Heng-xiu/xiuxiu-agent-skills --skill waitlist-launch --global --agent codex
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
