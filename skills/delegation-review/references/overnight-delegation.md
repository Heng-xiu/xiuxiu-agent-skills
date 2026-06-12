# Overnight Delegation Background

The `delegation-review` skill is inspired by the "Overnight Delegation" prompt attributed to Mike Krieger, Head of Anthropic Labs, in Every's Claude Fable 5 Prompt Library:

https://every.to/p/claude-fable-5-prompt-library#prompt-section-overnight-delegation

## Core Idea

The original pattern frames a task as unsupervised work that should continue overnight. It gives the agent:

- A concrete task
- An explicit definition of done
- The context and constraints needed to work
- Permission to use mocks, stubs, and documented assumptions when blocked
- A required morning handoff covering completed work, workarounds, open decisions, and evidence

The operational lesson is that autonomous work needs clear completion criteria, bounded autonomy, and a structured handoff. Without those, agents drift, stop too early, or leave reviewers without enough evidence to decide what happened.

## Adaptation In This Skill

This skill turns that delegation pattern into a review rubric. It does not run the delegated work. It checks whether the current project, issue, or module is ready to be handed to an agent that may work without supervision.

The six review principles are:

1. Done is defined upfront and observable.
2. Context is explicitly packaged.
3. Blockers do not stop progress.
4. Workarounds are first-class artifacts.
5. Decision boundaries are explicit.
6. Completion requires reproducible evidence.

Use this reference only for background. The actionable workflow lives in `SKILL.md`.
