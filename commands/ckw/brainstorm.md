---
description: Open-ended co-thinking before planning a phase. Explore assumptions, test approaches, and capture decisions into CONTEXT.md that the planner and executor will honor.
---

# /ckw:brainstorm — Explore Before You Plan

## Purpose
Open-ended co-thinking before planning a phase. You and Claude explore the problem space together — surfacing assumptions, testing approaches, and capturing decisions. The output is a CONTEXT.md that the planner and executor will honor as locked preferences.

## Usage
```
/ckw:brainstorm [phase-number]
```

- `phase-number`: Which phase to brainstorm (from ROADMAP.md). If omitted, brainstorm the next unplanned phase.

## What This Command Does

This is a **conversational command** — no agent spawn. Claude stays in the current session and explores with you interactively. At the end, Claude captures the brainstorm into CONTEXT.md.

### Step 1: Load Context

Read the following files to understand the project and phase:

**Always load:**
- PROJECT.md — What the project is about
- STATE.md — Current status, decisions, open questions
- ROADMAP.md — Phase breakdown and goals
- REQUIREMENTS.md — Deliverable requirements (filter to this phase's requirement IDs)
- ~/.ckw/SYSTEM.md — User preferences

**If it exists:**
- `.planning/phases/{NN}-{phase-name}/CONTEXT.md` — Prior brainstorm session (continuing)

### Step 2: Set the Tone

Tell the user:

```
Let's think through Phase [N] ([phase name]) together.

I'll ask questions, push back on assumptions, and help you explore
angles you might not have considered. This isn't planning yet — it's
thinking. When we're done, I'll capture our decisions into CONTEXT.md
so the planner knows exactly what you want.

Ready? Let's start with the big picture.
```

### Step 3: Explore

Ask open-ended probing questions, one or two at a time. Don't rush — let the conversation breathe. Key areas to explore (adapt to the phase):

**Goal clarity:**
- What's the real goal here? Not the stated goal — the outcome you actually care about.
- What would success look like? What would failure look like?

**Approach:**
- What approaches could work? What are the tradeoffs?
- What's been tried before? What worked / didn't?
- Is there prior work we should build on or deliberately depart from?

**Audience:**
- Who's the audience? What do they need to see?
- What do they already know? What assumptions can we make?
- What tone and format fits them best?

**Uncertainty:**
- What are you most uncertain about?
- What assumptions are we making that could be wrong?
- What would change your approach if you knew the answer?

**Stakes:**
- What's at stake if this phase doesn't land? Who sees the output, and what decisions depend on it?
- How bad is it if this is wrong vs. late vs. mediocre?

**Constraints:**
- What's explicitly out of scope?
- Are there political, budget, or timeline constraints that shape the approach?
- What dependencies does this phase have on external inputs?

**Guidelines:**
- Ask one or two questions at a time, not a list
- Build on the user's answers — don't follow a rigid script
- Push back constructively: "Have you considered..." or "What if instead..."
- Surface connections to other phases or project-wide decisions
- If the user mentions something that should be a STATE.md decision, note it
- If a P0 or P1 open question comes up, address it

### Step 4: Capture

<HARD-GATE>
STOP before capturing decisions to CONTEXT.md. Ask yourself:
- Have you explored at least 2 different approaches or angles?
- Has the user explicitly approved the direction? (Not just stopped talking — actively confirmed.)
- Can you state WHY this approach was chosen over alternatives?
If any answer is no, continue the conversation. Do NOT proceed to capture.
</HARD-GATE>

When the user indicates they're done (says something like "I think that covers it," "let's move on," "wrap it up"), synthesize the brainstorm into CONTEXT.md.

**Save to:** `.planning/phases/{NN}-{phase-name}/CONTEXT.md`

**Create the `.planning/phases/{NN}-{phase-name}/` directory if it doesn't exist.**

**Template:**

```markdown
# Phase [N] Context — [Phase Name]

## What We Explored
[2-3 sentence summary of the brainstorm conversation — what questions we asked, what angles we considered]

## Key Decisions
<!-- These are locked — the planner and executor must honor them exactly -->
<!-- Include stakes context: who sees this, what depends on it, consequence of failure -->
- [Decision 1 — e.g., "Lead with ROI narrative, not capability narrative"]
- [Decision 2 — e.g., "Use progressive disclosure for the training module"]
- [Decision 3]

## Approach
[The chosen approach and why — 2-4 sentences describing the strategy]

## Preferences
- **Tone:** [e.g., "Direct, no jargon, executive-level"]
- **Format:** [e.g., "Bullet-heavy, not prose-heavy"]
- **Audience:** [e.g., "CFO and Finance team — assume financial literacy"]
- **Length:** [e.g., "Keep each section under 500 words"]
- [Other locked preferences that emerged]

## Assumptions to Validate
<!-- The planner or executor should flag these if they find evidence they're wrong -->
- [Assumption 1 — e.g., "Client has access to BigQuery"]
- [Assumption 2]

## Out of Scope
<!-- Explicitly excluded during brainstorm — prevents scope creep -->
- [Exclusion 1 — e.g., "No custom dashboard — use existing Google Sheets"]
- [Exclusion 2]
```

**After saving, tell the user:**

```
Captured! CONTEXT.md saved to .planning/phases/{NN}-{phase-name}/

[N] key decisions locked
[N] preferences set
[N] assumptions to validate

The planner will honor these when breaking this phase into tasks.

Next:
  /ckw:plan-phase [N]     Break this phase into executable tasks
  /ckw:brainstorm [N]     Continue brainstorming (adds to CONTEXT.md)
```

### Step 5: Update STATE.md

If any decisions were made during brainstorming that affect the project level (not just this phase):
- Add them to STATE.md's "Decisions Made" section
- If any P0/P1 open questions were resolved, remove them from STATE.md and note the resolution

## Context Loading Summary

| File | When | Purpose |
|------|------|---------|
| PROJECT.md | Always | Project scope and vision |
| STATE.md | Always | Decisions, open questions, blockers |
| ROADMAP.md | Always | Phase goals and structure |
| REQUIREMENTS.md | Always | Phase-specific requirements |
| ~/.ckw/SYSTEM.md | Always | User preferences |
| CONTEXT.md | If exists | Prior brainstorm to continue |

## Pipeline Mode

**`--headless` behavior:** Brainstorm is inherently interactive — it's a conversational exploration that requires human input. Running it headless would produce a superficial CONTEXT.md that misses the user's actual preferences and assumptions.

**If `--headless` is passed:** Return an error with alternatives:
```
Brainstorm requires interactive exploration and cannot run headless.

Alternatives:
  /ckw:plan-phase [N] --headless    Plans with defaults from existing CONTEXT.md
  /ckw:plan-phase [N] --auto        Plans with minimal interaction
```

## Error Handling

- **No project found** (no PROJECT.md or STATE.md) → "No CKW project found in this folder. Run /ckw:new-project or /ckw:adopt-project first."
- **Phase doesn't exist in ROADMAP.md** → "Phase [N] isn't in the roadmap. Available phases: [list]. Want to brainstorm one of these?"
- **CONTEXT.md already exists** → "There's already a CONTEXT.md for Phase [N] from a previous brainstorm. Continue adding to it, or start fresh?"
  - Continue: Load existing CONTEXT.md, append new decisions
  - Fresh: Overwrite with new brainstorm
- **All phases already planned** → "All phases have been planned. Want to brainstorm a specific aspect of an existing phase? This would update its CONTEXT.md."

## Design Notes

- This is the only CKW command that doesn't spawn an agent — it's conversational by nature
- Don't try to be comprehensive — better to explore 3 things deeply than 10 things shallowly
- The brainstorm should feel like talking to a smart colleague, not filling out a form
- CONTEXT.md items marked as "Key Decisions" are treated as non-negotiable by the planner and executor
- If the user comes back to brainstorm again, append to (don't overwrite) existing decisions unless they say otherwise
