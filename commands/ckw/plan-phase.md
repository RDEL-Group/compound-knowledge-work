---
description: Break a project phase into atomic, executable tasks. Surfaces relevant solutions from past projects, estimates context budgets, and creates structured task plans.
---

# /ckw:plan-phase — Research and Plan a Phase

## Purpose
Break a project phase into atomic, executable tasks. Each task should be completable in a single focused context window. The planner surfaces relevant solutions from past projects, estimates context budgets, and creates structured task plans.

## Usage
```
/ckw:plan-phase [N] [--auto]
```

- `N`: Phase number (from ROADMAP.md). If omitted, plans the next unplanned phase.
- `--auto`: Minimal interaction — AI plans based on available context, user reviews after.

## What This Command Does

Spawn the **ckw-planner** agent with a fresh context.

### Step 1: Load Context

**Always load (T1):**
- PROJECT.md — Project scope and vision
- STATE.md — Current decisions and progress
- ~/.ckw/SYSTEM.md — User preferences

**Phase-level (T2):**
- REQUIREMENTS.md — What needs to be delivered
- ROADMAP.md — Phase breakdown and dependencies
- Phase CONTEXT.md — Locked preferences from /ckw:brainstorm (if exists)

**Search (T3):**
- Shared knowledge repo `solutions/` — for patterns matching this deliverable type
- `reference/.index/` — to understand available reference materials and their sizes
- Phase RESEARCH.md — Reference recommendations from the researcher agent (if Step 1c was run)

### Step 1b: Check for P0-Blocking Open Questions

Read STATE.md open questions tagged `[P0 — blocks planning]`. If any exist:

1. **Surface them to the user:**
   ```
   ⚠️ Before planning Phase [N], these open questions need answers:
   - [P0 question 1]
   - [P0 question 2]

   These are tagged as P0 (blocks planning). Can you answer them now,
   or should I plan around them with assumptions?
   ```

2. If the user provides answers, update STATE.md decisions and remove the questions.
3. If the user says "plan around them," proceed but flag assumptions in the task plans as [ACTION REQUIRED].

<HARD-GATE>
STOP before breaking this phase into tasks. Ask yourself:
- Are all P0 blockers resolved? If not, surface them and stop — do not plan around unresolved blockers without explicit user permission.
- If CONTEXT.md exists, do the locked decisions still make sense for this phase?
- Is this phase the right scope? Should it be split (too much work) or merged (too little)?
If anything is unclear, ask the user before proceeding.
</HARD-GATE>

### Step 1c: Research Phase (optional)

Check if this phase has significant reference material:
- Count files in `reference/.index/` relevant to this phase
- Estimate total tokens from reference summaries

**If >3 reference files or >10K tokens of reference material:**
```
This phase has [N] reference files (~[N] tokens) available.
I can spawn the researcher agent to analyze references and surface relevant
solutions before planning. This produces RESEARCH.md with token budgets
and load recommendations.

Run researcher first, or go straight to planning?
```

If the user chooses researcher:
1. Spawn the **ckw-researcher** agent with T1, T2, and T3 context
2. The researcher produces `.planning/phases/{NN}-{phase-name}/RESEARCH.md`
3. See `agents/ckw-researcher.md` for the full process
4. After RESEARCH.md is saved, continue to Step 2 with it included in the planner's context

If the user skips researcher, proceed directly to Step 2.

### Step 2: Research

1. **Surface relevant solutions:**
   - Search shared repo by deliverable type, industry, keywords
   - Present matches: "I found 2 relevant past projects:"
     - "CPG RFP used CASINO framework for competitive analysis (confidence: high)"
     - "Training module used progressive disclosure for beginner audience (confidence: medium)"
   - Ask: "Should I incorporate any of these into the plan?"

2. **Review reference materials:**
   - Read `reference/.index/` for available material summaries
   - Identify which references are relevant to this phase
   - Note their sizes for context budget planning

3. **Check CONTEXT.md (if exists):**
   - Load locked decisions from /ckw:brainstorm
   - These are non-negotiable — plan must honor them exactly

4. **Preference capture fallback (if no CONTEXT.md):**
   - If no CONTEXT.md exists for this phase, ask the user a few quick preference questions before task breakdown:
     - What's the tone/voice for this phase? (e.g., formal, conversational, technical)
     - Who's the primary audience?
     - Any specific approaches or frameworks you want to use?
     - Anything explicitly out of scope?
   - Save responses to `.planning/phases/{NN}-{phase-name}/CONTEXT.md` using the standard template
   - This is a lightweight fallback — for deeper exploration, suggest /ckw:brainstorm beforehand

5. **Conduct additional research (if needed):**
   - Web search for current best practices, competitive info, etc.
   - Save research to `.planning/phases/{NN}-{phase-name}/RESEARCH.md`

### Step 3: Create Task Plans

Break the phase into atomic tasks. Each task must be:
- **Completable in one focused context** (~100K tokens of working space)
- **Independently verifiable** — you can tell if it's done
- **Specific** — not "write the strategy section" but "draft 500-word competitive positioning narrative using SWOT data from reference/competitor-analysis.pdf"

**Task plan format** (saved as `.planning/phases/{NN}-{phase-name}/{N}-PLAN.md`):

```markdown
# Task [N]: [Short Name]

## Objective
[One sentence: what this task produces]

## Output
- **File:** drafts/[filename].md
- **Format:** [markdown / structured template / free-form]
- **Length target:** [word count or page count]

## Context to Load
<!-- These are the ONLY files the executor agent should load for this task -->
- PROJECT.md (T1 — always)
- STATE.md (T1 — always)
- Phase CONTEXT.md (T2 — preferences)
- This task plan (T3)
- reference/.index/[specific-summary].md (T3 — ~X tokens)
- [specific section of reference doc if needed] (T4 — ~X tokens)

## Estimated Context Budget
- T1 + T2: ~15% (~30K tokens)
- Task plan + references: ~25% (~50K tokens)
- Working space: ~60% (~120K tokens)

## Instructions for Executor
[Specific, actionable instructions. What to write, how to structure it,
what tone to use, what sources to reference, what claims to support.]

## Quality Criteria
[How to know this task is done well]
- [ ] Addresses requirements: [list specific requirement IDs from REQUIREMENTS.md]
- [ ] Follows tone from CONTEXT.md
- [ ] Supports claims with [specific evidence sources]
- [ ] Stays within length target
- [ ] No placeholder text except [ACTION REQUIRED] for items needing human input

## Dependencies
- **Requires:** [list task numbers that must complete first, or "None"]
- **Feeds into:** [list task numbers that depend on this, or "None"]
```

### Step 4: Create Phase Summary

Save `.planning/phases/{NN}-{phase-name}/PHASE-PLAN.md`:

```markdown
# Phase [N]: [Name] — Plan

## Tasks
| # | Task | Dependencies | Est. Context | Status |
|---|------|-------------|-------------- |--------|
| 1 | [name] | None | 45% | Planned |
| 2 | [name] | Task 1 | 50% | Planned |
| 3 | [name] | None | 35% | Planned |

## Execution Order
<!-- Wave-based: independent tasks can run in parallel -->
- **Wave 1:** Tasks 1, 3 (independent — can execute in parallel)
- **Wave 2:** Task 2 (depends on Task 1)

## Reference Materials Used
| Reference | Tasks | Load Strategy |
|-----------|-------|--------------|
| client-brief.pdf | 1, 2 | Summary only |
| past-rfp-acme.md | 2 | Full document |
| competitor-analysis.pdf | 3 | Sections 2, 4 |

## Solutions Applied
[List any patterns from the knowledge base that informed this plan]

## Total Estimated Effort
- Tasks: [N]
- Waves: [N]
- Estimated time: [rough estimate based on task complexity]
```

### Step 5: Update State

Update STATE.md:
```yaml
current_phase: [N]
phase_[N]_status: planned
phase_[N]_tasks: [count]
last_updated: [ISO date]
```

Update ROADMAP.md phase status to "Planned".

### Step 6: Save Progress

**If local/git repo:**
```bash
git add .planning/phases/{NN}-{phase-name}/
git add STATE.md ROADMAP.md
git commit -m "CKW: Phase [N] planned — [task count] tasks in [wave count] waves"
```

**If Google Drive / cloud storage:** Skip git. STATE.md timestamps + Drive version history provide the audit trail.

### Step 7: Next Steps

```
Phase [N] planned! [task_count] tasks in [wave_count] waves.

Wave 1 (can run in parallel):
  • Task 1: [name]
  • Task 3: [name]

Wave 2 (depends on Wave 1):
  • Task 2: [name]

Next:
  /ckw:search-solutions [query]   Find additional patterns from past projects
  /ckw:brainstorm [N]             Explore the problem space before drafting (optional)
  /ckw:execute-phase [N]          Start drafting
```

## Error Handling

- If phase doesn't exist in ROADMAP.md, ask user to update or suggest phases
- If CONTEXT.md doesn't exist for this phase, run the preference capture fallback (Step 2.4) — or suggest /ckw:brainstorm for deeper exploration
- If reference materials haven't been imported, warn about missing summaries
- If estimated context exceeds budget for any task, auto-split into sub-tasks
