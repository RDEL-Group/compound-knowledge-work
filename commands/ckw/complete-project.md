---
description: Close out a project with a full retrospective. Captures what worked, produces a project summary, prompts for compounding, and marks the project complete.
---

# /ckw:complete-project — Retrospective and Close-Out

## Purpose
Close out a project with a full retrospective. Captures what worked, what didn't, produces a project summary, prompts for compounding if not done yet, and marks the project complete. This is the final step in a CKW project — it turns experience into future advantage.

## Usage
```
/ckw:complete-project
```

No arguments — operates on the current project.

## What This Command Does

Spawn the **ckw-compounder** agent in **retrospective mode**.

### Step 1: Validate Readiness

Check the project state:

1. Read STATE.md for overall status and phase statuses
2. Read ROADMAP.md for total phase count

**If all phases complete:**
Proceed directly.

**If active phases remain:**
```
Not all phases are complete:
  ✅ Phase 1: [name] — complete
  🔄 Phase 2: [name] — executing (3/5 tasks)
  ⏳ Phase 3: [name] — not started
  ⏳ Phase 4: [name] — not started

Close the project anyway? Incomplete phases will be marked as
skipped in the retrospective.
  [yes — close now]
  [no — continue working]
```

**If project already complete:**
```
This project is already marked complete (completed [date]).

View the retrospective, or reopen the project?
  [view RETROSPECTIVE.md]
  [reopen — sets status back to executing]
```

### Step 2: Check for Compound

Check if solutions have been captured:

1. Look for `docs/solutions/` directory
2. Check if `solutions-index.md` exists and has entries

**If no solutions captured:**
```
No solutions have been captured from this project yet.

Capturing learnings before closing makes the next similar project
faster. Want to run /ckw:compound first? (Recommended)
  [yes — compound first, then close]
  [no — close without capturing]
```

If yes, run the compound flow first (spawn compounder in solution extraction mode), then return to complete-project.

### Step 3: Load Context

**Always load (T1):**
- PROJECT.md — Original goal and scope
- STATE.md — All decisions and status
- ROADMAP.md — What was planned

**For retrospective (T2):**
- All CONTEXT.md files — Preferences and approaches chosen
- All REVIEW_REPORT.md files — Quality issues found and resolved

**Decision trail (T3):**
- All task summaries — What was produced, decisions made during drafting

**For reference (T4):**
- Existing solutions (if any) — To reference in retro

### Step 4: Spawn Compounder (Retrospective Mode)

Spawn the **ckw-compounder** agent in retrospective mode. The agent:

1. Reads the full project trail to build a timeline
2. Conducts a structured retrospective interview:
   - Goal achievement
   - What worked
   - What didn't work
   - Surprises
   - Hindsight decisions
   - Process reflections
3. Produces RETROSPECTIVE.md and PROJECT-SUMMARY.md
4. Updates STATE.md to complete

See `agents/ckw-compounder.md` (Mode 2) for the full process.

### Step 5: Save Outputs

The compounder produces:

1. **RETROSPECTIVE.md** → project root
   - Goal vs. outcome assessment
   - What worked / what didn't
   - Key decisions in hindsight
   - Recommendations for next time

2. **PROJECT-SUMMARY.md** → project root
   - One-page project overview
   - Key deliverables and decisions
   - Solutions captured
   - Top lessons learned

3. **STATE.md update** → `status: complete`, all phase statuses finalized, `completed_at` date added

### Step 6: Save Progress

**If local/git repo:**
```bash
git add RETROSPECTIVE.md PROJECT-SUMMARY.md STATE.md
git commit -m "CKW: Project complete — retrospective captured"
```

**If Google Drive / cloud storage:** Skip git.

### Step 7: Final Report

```
Project "[Project Name]" is complete!

📄 RETROSPECTIVE.md — What worked, what didn't, recommendations
📋 PROJECT-SUMMARY.md — One-page project overview
📝 Solutions captured: [N]

Duration: [start] → [today] ([N] days)
Phases completed: [N] of [total]

This project's learnings are available to future projects via
the solutions library.

You can always run /ckw:compound later to capture additional learnings.
```

## Error Handling

- **No project found** → "No CKW project found. Run /ckw:new-project or /ckw:adopt-project."
- **Project already complete** → "Already complete. View retrospective or reopen?"
- **No phases executed** → "No work has been done yet. Nothing to retrospect."
- **STATE.md missing or malformed** → "STATE.md is missing or has issues. Check the project setup."
