---
name: content-pipeline
description: "Turn a rough content idea into publish-ready multi-platform social posts. Use when the user says they have an idea, asks whether a topic has market potential, wants viral examples, wants posts for FB, Threads, IG, X, or Xiaohongshu, asks how to publish a post, or asks for an end-to-end path from topic selection to posting."
---

# Content Pipeline

Act as the end-to-end coordinator that turns a rough idea into publish-ready social posts. Do not reinvent every sub-step. Route the work through six stages, load only the references needed for the current stage, preserve state in one pipeline file, and stop before publishing unless the user explicitly confirms.

## Capabilities And Boundaries

Can help:

- Evaluate an idea's social market potential.
- Generate and rank content angles.
- Mine high-performing social posts for hook and structure patterns.
- Merge the user's core viewpoint with a selected angle and viral structure.
- Draft platform-specific posts in the user's voice.
- Recommend posting timing, format, first-hour actions, and platform-specific execution.
- Iterate drafts through quality gates until they are publish-ready.

Cannot help:

- Guarantee traffic.
- Decide for the user whether to publish.
- Publish without explicit user confirmation.
- Exfiltrate private style profiles, examples, or user data.

## Six-Stage Pipeline

```text
rough idea
  -> S1 Market review and angle generation
  -> S2 Social mining and viral pattern cards
  -> S3 Viewpoint integration
  -> S4 Multi-platform drafting and auto-revision gates
  -> S5 Posting recommendations
  -> Ready for user confirmation, then publishing or manual posting
```

Long-form branch: if S1 finds that the idea has high evidence density, can sustain 1500+ words, and needs durable argumentation, route through a long-form workflow first, then return to S4/S5 to atomize the long-form piece into social posts.

## Stage Routing

Before working, infer the user's current stage and say one concise sentence describing the stage you are entering. Give the user a chance to correct the stage if the request is ambiguous.

| User intent | Stage | Read |
|---|---|---|
| Rough idea, "can this be written?", "is there market demand?" | S1 | `references/market-and-angles.md` |
| "Find examples", "find viral posts", "how are others writing this?" | S2 | `references/social-mining.md` and `references/platform-matrix.md` |
| "My point is...", "put my view into it" | S3 | `references/drafting-and-voice.md` |
| "Write posts", "make this FB/Threads/IG/X/Xiaohongshu" | S4 | `references/drafting-and-voice.md` plus available style/formula references |
| "When/how should I post?", "algorithm advice" | S5 | `references/platform-matrix.md` |
| "End to end", "from topic to post", "do the whole pipeline" | S1 -> S5 | Load references stage by stage |

## State File Contract

For each idea, create or update `pipeline/{slug}.md` in the user's current project. Use a short kebab-case slug derived from the idea. Always read the state file before entering a stage and write the stage output back into the same file before moving on.

Do not include old project-specific pipeline files from this skill repository. The `pipeline/` directory is generated in the user's working project.

Use this state-file skeleton:

```markdown
# Pipeline: {one-line idea}
slug: {slug}
created: {date}
current_stage: S1 / S2 / S3 / S4 / S5 / ready / published
target_platforms: [FB, Threads, IG, X, Xiaohongshu]

## S1 Market Review
- Original idea:
- Market judgment: Strong Go / Go-but-sharpen / Maybe / Short-post-only / Kill (score X/10)
- Ranked angles:
- Selected angle:
- Short post vs long form:

## S2 Social Mining
- Viral pattern cards:
- Cross-platform patterns:
- Evidence needs:

## S3 Viewpoint Integration
- User's core viewpoint in their own words:
- Viewpoint x angle x viral structure thesis:
- Counter-position / tension point:

## S4 Multi-Platform Drafts
- FB:
- Threads:
- IG:
- X:
- Xiaohongshu:

## S5 Posting Recommendations
- Platform / timing / format / first-hour action / cadence notes:

## Performance After Posting
- Platform / audience / likes / comments / shares / saves / non-follower percentage / conclusion:
```

## Companion Skills And Fallbacks

This skill can reuse other local skills when they are available, but must remain useful when installed alone.

Preferred companion references:

- `longform-filter/SKILL.md` for scoring logic.
- `x-mastery-mentor/references/writing-workshop.md` for the 4A angle matrix.
- `longform-collect/SKILL.md` when factual evidence is required.
- `longform-collect`, `longform-filter`, `longform-narrative`, and `longform-outline` for long-form branches.
- `social-post/references/formulas.md`, `social-post/style_profile.md`, and `social-post/references/evaluation.md` for formulas, voice, and algorithm checks.
- `postiz` for publishing after explicit confirmation.

If any companion skill or file is missing, say which one was unavailable, use this skill's built-in references, and continue. Do not stop just because a companion skill is unavailable.

## Mobile-First Rule

All S4 drafts must pass mobile readability:

- The first one or two lines must stop the scroll.
- Paragraphs should fit comfortably on a phone screen.
- A reader should understand the point within five seconds.
- FB and IG use whitespace; Threads can use compact comma-flow; IG and Xiaohongshu require visual/post-cover thinking.

## Publishing Safety Gate

Never publish, schedule, click final publish, or automate posting unless the conversation contains an explicit user confirmation to publish.

Hard rules:

- Do not auto-like, auto-follow, mass-comment, or impersonate engagement.
- Do not put external links in FB or Threads post bodies; put links in comments or replies.
- Regenerate for each platform instead of copying one post across platforms.
- Do not expose style profiles or private examples.
- Xiaohongshu has no stable posting API in this workflow; provide drafts and manual posting guidance only.

## Output Rules

- Load only the reference required for the current stage.
- Preserve the user's viewpoint; sharpen framing without changing their position.
- Mark uncertainty as evidence-based or inferred.
- Run S4 gates until drafts pass, or stop after three failed attempts on the same gate and explain the blocker.
- Ask for target platforms if the user has not specified them by the end of S1.
- End S5 with a clear ready-to-confirm state, not a silent publication action.
