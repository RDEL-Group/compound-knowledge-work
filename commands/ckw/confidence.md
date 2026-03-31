---
description: Check what you know vs. what you're guessing. Plain-language epistemic honesty at any point in the workflow.
---

# /ckw:confidence — What Do We Actually Know?

## Purpose
Pause at any point and honestly assess what you're confident about vs. what you're guessing. Produces a plain-language assessment — no scores, no percentages, no letter grades. Designed as a non-destructive interrupt: it doesn't change state, write files (unless you ask), or break your current workflow.

## Usage
```
/ckw:confidence [--save] [--phase N]
```

- `--save`: Write the assessment to `.planning/phases/{NN}-{phase-name}/CONFIDENCE.md`
- `--phase N`: Focus assessment on a specific phase (default: current phase from STATE.md)

## What This Command Does

This is a **conversational command** — no agent spawn. Claude stays in the current session and produces an assessment you can act on or ignore.

### Step 1: Gather Available Context

**If STATE.md exists (project mode):**

Read the following to build a picture of what's known vs. assumed:

- STATE.md — Decisions made, open questions, blockers
- ROADMAP.md — Phase goals and progress
- REQUIREMENTS.md — What needs to be delivered (filter to `--phase N` if specified)
- Phase CONTEXT.md — Locked preferences, assumptions to validate
- Phase PHASE-PLAN.md — Task breakdown (if planned)
- Task SUMMARY files — What was produced, what was flagged
- Draft files — Current state of outputs
- REVIEW_REPORT.md — Issues found (if reviewed)
- RESEARCH.md — What was researched, what gaps remain

Load whatever exists — this command works at any stage. Don't load reference materials (this is about epistemic state, not content).

**If no STATE.md (standalone mode):**

Assess confidence based on the current conversation context only. What has the user told you? What are you inferring? What's missing?

### Step 2: Produce Confidence Assessment

Present three sections in plain prose. Be direct and specific — name the actual things, not abstract categories.

```
Here's where I see our confidence levels for [scope]:

**Confident about:**
[Things grounded in evidence, confirmed by the user, established in
requirements, or validated through review. Be specific — name the
decision, the data point, the requirement.]

- [Specific thing and WHY you're confident — e.g., "The executive
  audience preference is locked in CONTEXT.md and confirmed during
  brainstorm"]
- [Another specific thing]

**Less confident about:**
[Assumptions not yet validated, estimates without supporting data,
inferences from limited information, open questions still unresolved,
areas where the requirements are ambiguous.]

- [Specific thing and WHY confidence is lower — e.g., "The revenue
  figure in Task 1 came from a 2024 report — may be outdated"]
- [Another specific thing]

**My recommendation:**
[What to do about the gaps. Be actionable — name specific people to
ask, data to find, assumptions to test, or decisions to defer.]

- [Action 1 — e.g., "Verify Q3 revenue with finance before finalizing
  the executive summary"]
- [Action 2]
```

**Rules for this assessment:**
- Never use numerical confidence (no "85% confident", no "7/10", no "high/medium/low")
- Never use letter grades or ratings
- Be honest about what you don't know — false confidence is worse than admitted uncertainty
- Ground every claim in something observable (a file, a decision, a conversation)
- If you're confident about everything, say so — but check your assumptions first
- If you're uncertain about everything, that's fine — the value is making it explicit

### Step 3: Offer Gap Closure

After the assessment, suggest 1-3 specific actions that would most improve confidence. Rank them by impact.

```
To close the biggest gaps:

1. [Highest-impact action — e.g., "Ask the client about bilingual
   requirements — this affects 3 of 5 tasks in Phase 2"]
2. [Second action]
3. [Third action, if applicable]
```

If CKW commands would help, suggest them:
- Unvalidated assumptions → `/ckw:brainstorm [N]` to explore
- Missing reference data → `/ckw:import-reference` or `/ckw:drive import`
- No review yet → `/ckw:review-phase [N]` to surface issues
- Stale knowledge → `/ckw:search-solutions` to find patterns

### Step 4: Save (Optional)

**If `--save` flag is set:**

Determine the save path:
- If `--phase N` specified: `.planning/phases/{NN}-{phase-name}/CONFIDENCE.md`
- If no phase specified but in a project: `.planning/phases/{current-phase}/CONFIDENCE.md`
- If standalone: `./CONFIDENCE.md` in current directory

Write the assessment:

```markdown
# Confidence Assessment — [Phase Name or "Standalone"]

**Date:** [ISO date]
**Scope:** [Phase N: Name, or "Current conversation"]

## Confident About
- [Item 1]
- [Item 2]

## Less Confident About
- [Item 1]
- [Item 2]

## Recommendations
1. [Action 1]
2. [Action 2]
```

Confirm: "Assessment saved to [path]."

**If `--save` flag is NOT set:**

Do nothing. Display only. No file changes, no STATE.md updates. The conversation continues exactly where it was.

## Context Loading Summary

| File | When | Purpose |
|------|------|---------|
| STATE.md | If exists | Decisions, open questions, blockers |
| ROADMAP.md | If exists | Phase goals and progress |
| REQUIREMENTS.md | If exists | What needs to be delivered |
| Phase CONTEXT.md | If exists | Locked preferences, assumptions |
| Phase PHASE-PLAN.md | If exists | Task breakdown |
| Task SUMMARY files | If exist | What was produced, flagged |
| Draft files | If exist | Current output state |
| REVIEW_REPORT.md | If exists | Issues found |
| RESEARCH.md | If exists | Research gaps |

## Pipeline Mode

**`--headless` behavior:** Produce the assessment as plain text output. If `--save` is also passed, auto-save without confirmation. If `--save` is not passed, display only (same as interactive). No prompts needed — confidence is inherently non-interactive.

## Error Handling

- **No project found AND no conversation context** → "Nothing to assess yet. Start a conversation, open a CKW project, or describe what you're working on."
- **Phase doesn't exist** → "Phase [N] isn't in the roadmap. Available phases: [list]."
- **CONFIDENCE.md already exists** → Overwrite with fresh assessment (confidence snapshots are point-in-time, not cumulative).

## Design Notes

- This is a **non-destructive interrupt** — it never changes project state. You can call it mid-brainstorm, mid-execution, or mid-review and pick up exactly where you were.
- The assessment should feel like a smart colleague saying "here's what I think we know and don't know" — not a risk register or audit.
- Keeping it prose-only (no scores) prevents false precision. "I'm less confident about the revenue figure" is more useful than "confidence: 65%."
- The `--save` flag exists for teams who want to track how confidence evolved across a project. Most users won't need it.
- Inspired by Every.to's `/kw:confidence` command — adapted for CKW's project structure and standalone mode.
