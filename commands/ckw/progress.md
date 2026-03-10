---
description: Show a clear overview of where the project stands — what's done, in progress, next, and any blockers or action items.
---

# /ckw:progress — Show Project Status

## Purpose
Give a clear, human-readable overview of where the project stands. Shows what's done, what's in progress, what's next, and any blockers or action items. Designed to be useful for both the person doing the work and teammates checking in.

## Usage
```
/ckw:progress [--detailed]
```

- Default: Concise status overview
- `--detailed`: Full breakdown including task-level status and action items

## What This Command Does

Read project state files and produce a status report. This is a lightweight command — no agent spawn needed.

### Files to Read
- STATE.md — Machine-readable status (YAML frontmatter)
- ROADMAP.md — Phase breakdown
- `.planning/phases/*/PHASE-PLAN.md` — Task-level status
- `.planning/phases/*/REVIEW_REPORT.md` — Review results (if reviewed)
- `docs/solutions/solutions-index.md` — Captured solutions (if any)
- `RETROSPECTIVE.md` — Project retrospective (if complete)
- `todos/` — Captured ideas and tasks

### Output Format (Default)

```
╔══════════════════════════════════════════════════╗
║  [Project Name] — Progress                       ║
╚══════════════════════════════════════════════════╝

📊 Overall: Phase [N] of [total] — [phase name]

Phase 1: [Name]                    ✅ Complete (3/3 tasks)
Phase 2: [Name]                    🔍 Reviewing (5/5 tasks, 2 P1 issues)
Phase 3: [Name]                    🔄 In Progress (2/5 tasks drafted)
Phase 4: [Name]                    📋 Planned (0/4 tasks)
Phase 5: [Name]                    ⏳ Not started

⚡ Current focus: Phase 2, Task 3 — [task name]

🚩 Action items (2):
  • Verify client revenue figure (from Phase 2, Task 1)
  • Confirm primary PM assignment (from Phase 2, Task 2)

🧊 Blockers: None

📅 Deadline: [date] ([N] days remaining)

Next steps:
  /ckw:brainstorm 3        Explore Phase 3 before planning
  /ckw:execute-phase 2     Continue drafting Phase 2
  /ckw:review-phase 1      Review completed Phase 1
  /ckw:compound            Capture what worked so far
```

### Output Format (--detailed)

Adds task-level breakdown for each phase:

```
Phase 2: Strategy Section          🔄 In Progress

  Wave 1:
    ✅ Task 1: Market analysis         → drafts/market-analysis.md
    ✅ Task 2: Competitor overview      → drafts/competitor-overview.md

  Wave 2:
    🔄 Task 3: Positioning narrative   → [not started]
    ⏳ Task 4: Proof points            → [depends on Task 3]

  Wave 3:
    ⏳ Task 5: Section assembly        → [depends on Tasks 3, 4]

  📝 Context loaded this phase: ~45% average per task
  📊 Solutions applied: "CASINO framework" from CPG RFP (2025-11)
```

### Review Status (if any phases reviewed)

If any phase has been reviewed:

```
🔍 Review status:
  Phase 1: Strong (0 P1, 3 P2, 5 P3)
  Phase 2: Needs revision (2 P1 issues — run /ckw:execute-phase 2 --revisions)
```

### Compound Progress (if solutions exist)

If the project has captured any learnings via /ckw:compound:

```
🧠 Knowledge captured:
  • 2 solutions filed (1 project-specific, 1 shared)
  • 3 SYSTEM.md updates proposed (2 accepted)
  • 1 template created
```

### Project Completion (if complete)

If STATE.md status is `complete`:

```
✅ Project complete!
  📄 RETROSPECTIVE.md — What worked, what didn't
  📋 PROJECT-SUMMARY.md — One-page overview
  📝 Solutions captured: [N]
  Completed: [date] ([N] days from start)
```

### Todos

If there are files in the `todos/` directory:

```
📌 Captured ideas (3):
  • Look into AI-generated infographics for training module
  • Ask client about bilingual requirements
  • Consider adding case study appendix
```

## Error Handling

- If STATE.md doesn't exist, suggest: "No CKW project found. Run /ckw:new-project or /ckw:adopt-project"
- If ROADMAP.md is out of sync with STATE.md, note the discrepancy
- If a phase plan exists but STATE.md doesn't reflect it, auto-reconcile

## Design Notes

- This command should be FAST — no agent spawn, just file reading
- Keep default output to ~20 lines — scannable in 5 seconds
- Use emoji sparingly but consistently for visual scanning
- Always end with actionable "next steps" — the user should never have to figure out what to do next
- Non-technical users should understand every word — no jargon
