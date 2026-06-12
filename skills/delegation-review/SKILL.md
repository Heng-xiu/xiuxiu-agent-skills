---
name: delegation-review
description: "Review a project, module, or issue set against autonomous delegation readiness principles: observable done definitions, packaged context, stub-driven unblocking, workaround logging, decision boundaries, and reproducible completion evidence. Use when the user asks whether work is ready for unsupervised agent handoff, overnight delegation, issue readiness review, or evidence-based completion review before code changes."
---

# Delegation Review

Review the current project against autonomous delegation principles and produce a structured, decision-oriented assessment. This skill produces an assessment, not code changes.

For source background and attribution, read [overnight-delegation.md](references/overnight-delegation.md) when the user asks about the origin of the principles or wants to adapt the source prompt.

## Scope

If the user names a module, issue range, PR, or focus area, limit the review to that scope. If no scope is given, review the whole project.

## The Six Principles

Apply all six criteria:

1. **Done is defined upfront and observable**: The task states what a reviewer can see when it is finished, not only what will be implemented.
2. **Context is explicitly packaged**: Required files, environment variables, services, credentials, constraints, and references are listed in the task or handoff.
3. **Blockers do not stop progress**: The task defines when mocks, stubs, assumptions, or partial progress are acceptable, and how replacement conditions are recorded.
4. **Workarounds are first-class artifacts**: Non-obvious implementation decisions, temporary approaches, and deviations are logged somewhere findable.
5. **Decision boundaries are explicit**: The task separates what the agent can decide from what requires human confirmation before work begins.
6. **Completion requires reproducible evidence**: Closure requires test results, command output, curl responses, screenshots, logs, or smoke-test steps.

## Review Workflow

Work through these steps in order.

### 1. Read Project Context

Inspect available project guidance and task records. Prefer `rg` for searching and fall back to `grep` only when `rg` is unavailable.

Read whichever files exist:

- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `CONTEXT.md`
- issue tracker files, local planning docs, GitHub issues, or equivalent task source

Scan likely evidence sources:

- Ready-to-work, in-progress, and recently completed issues
- `docs/` for contracts, decisions, known issues, or planning docs
- Source files for `TODO`, `FIXME`, `stub`, `mock`, `hack`, and `workaround` markers
- CI, test, or release notes when completion evidence is relevant

Useful local search:

```bash
rg -n "TODO|FIXME|stub|STUB|mock|MOCK|hack|HACK|workaround|WORKAROUND|ready-to-work|ready-to-ship|evidence|Done means|Definition of Done" .
```

### 2. Score Each Principle

For each principle, produce a one-line verdict with evidence:

```text
P1 ✅/⚠️/❌  [one-line finding]  [file, issue, section, or missing evidence]
```

Use:

- `✅` consistently met
- `⚠️` partially met or inconsistent
- `❌` missing or structurally absent

### 3. Identify Gaps And Risks

List specific issues, files, or workflows where a gap creates real risk. Focus on gaps that could cause an agent to:

- Build in the wrong direction
- Stall silently
- Lose implementation context across sessions
- Ship unverified work
- Ask for human input too late

Do not invent gaps. Report only what the inspected evidence supports.

### 4. Propose Modification Directions

For each gap, propose one concrete improvement:

```text
### D[N] - [Short title] (P[principles addressed])
Rationale:
Expected impact:
Implementation complexity: low / medium / high
Potential risk:
Affected files / modules:
```

Do not implement the proposals unless the user explicitly asks in a separate instruction.

### 5. Separate Human Decisions From Agent Work

Produce two explicit lists:

```text
Agent can proceed without confirmation:
- ...

Requires human confirmation before proceeding:
- ...
```

Use these defaults:

- Low-risk documentation updates, status corrections on clearly completed issues, and adding structure to empty sections can usually proceed without confirmation.
- Product direction, infrastructure provisioning, unsettled architecture, external-service choices, and contract changes require human confirmation.

### 6. Output The Full Report

Use this exact structure:

```markdown
## Principles
[Restate the six principles as applied to this project]

## Current-State Assessment
[P1-P6 verdicts with evidence]

## Gaps and Risks
[Specific issues and files with risk description]

## Recommended Modification Directions
[D1-DN proposals]

## Discussion Questions
[Numbered list of open decisions requiring human input]

## Suggested Next Steps
[Immediate / after-human-confirmation / after-infra-ready]
```

## Key Rules

- Analyze before acting.
- Quote or cite evidence for every verdict.
- Name the file and line, issue section, command output, or missing evidence behind each finding.
- Scope the review to the user's requested area.
- Keep the report decision-oriented.
- Do not write code, edit files, update issues, or change labels unless the user explicitly asks after the review.
