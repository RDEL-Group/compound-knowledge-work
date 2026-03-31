---
description: Pause work and capture handoff context for resuming later. Saves what's in flight, blockers, and next steps.
---

# /ckw:pause-work — Pause and Capture Handoff

## Purpose
Create a structured pause point so you or a teammate can pick up this project later without losing context. Captures what's in flight, blockers, and institutional knowledge that isn't stored anywhere else. Works for both team handoffs ("someone else is taking over") and personal bookmarking ("I'm coming back to this next week").

## Usage
```
/ckw:pause-work
```

No flags — this is a quick conversational checkpoint.

## What This Command Does

Read current project state, ask 3 quick questions, write a HANDOFF.md file, and mark the project as paused.

### Step 1: Load Context

Read the following to understand where the project stands:

- **STATE.md** — Current phase, task statuses, action items, blockers
- **PROJECT.md** — Project name
- **`~/.ckw/config.json`** — User name (default for "paused by")
- **ROADMAP.md** — Phase names for display

If STATE.md doesn't exist: "No CKW project found in this directory. Nothing to pause."

If HANDOFF.md already exists at project root:
```
This project was already paused by [name] on [date].
Overwrite the existing handoff notes with new ones?
```
Wait for confirmation before proceeding.

### Step 2: Quick Interview (3 questions)

Ask exactly these 3 questions — keep it fast, not an interview:

1. **"What are you in the middle of right now?"**
   - What task or activity is in flight
   - Where you left off
   - Any partial work that exists

2. **"Any blockers or things the next person should know?"**
   - Decisions that are pending
   - Gotchas or surprises discovered
   - Context not captured in the project files

3. **"Who's this handoff for?"**
   - Default: the user's name from `~/.ckw/config.json` → `user.name` (with note: "yourself later")
   - If they name someone else, use that name

### Step 3: Generate HANDOFF.md

Write `HANDOFF.md` at the project root:

```markdown
# Handoff Notes

**Paused by:** [name from question 3 or config default]
**Paused at:** [ISO date — YYYY-MM-DD HH:MM]
**Project:** [project name from PROJECT.md]
**Phase:** [current_phase from STATE.md] — [phase name from ROADMAP.md]

## What's In Flight
[User's answer to question 1 — preserved as-is]

## Key Context
[User's answer to question 2 — preserved as-is]

## Current State Summary
<!-- Auto-generated from STATE.md -->
- **Phase [N] status:** [status]
- **Tasks completed:** [X of Y]
- **Action items outstanding:** [count]
[List any ACTION REQUIRED items from STATE.md]

## Recommended Next Steps
- `/ckw:resume-work` — Start here to pick up with full context
- [Context-specific suggestions based on state — same logic as progress.md next steps]
```

### Step 4: Update STATE.md

Update the YAML frontmatter:
```yaml
status: paused
paused_at: [ISO date]
paused_by: [name]
```

Preserve all other YAML fields. Add a note to the Current Status markdown section:
```
**Paused** by [name] on [date]. See HANDOFF.md for context.
```

### Step 5: Save Progress

**If local/git repo:**
```bash
git add HANDOFF.md STATE.md
git commit -m "CKW: Work paused — [brief from question 1, first 50 chars]"
```

**If Google Drive / cloud storage:** Skip git. Files are auto-saved. STATE.md timestamps provide the audit trail.

### Step 6: Confirm

```
Work paused! Handoff saved to HANDOFF.md.

  Paused by: [name]
  Phase: [N] — [phase name]
  Tasks: [X/Y] complete

When ready to resume:
  /ckw:resume-work          Pick up where you left off
  /ckw:progress             Check status without resuming
```

## Pipeline Mode

**`--headless` behavior:** Auto-generate handoff without the 3-question interview.

- **Interview (Step 2):** Skip. Auto-generate HANDOFF.md from STATE.md context:
  - "What's In Flight" → derived from current phase status, in-progress tasks, and recent task summaries
  - "Key Context" → derived from STATE.md blockers, action items, and open questions
  - "Who's this handoff for" → use `~/.ckw/config.json` → `user.name` (default: "unknown")
- **Existing HANDOFF.md:** Overwrite without asking.
- **All file writes and git commits:** Proceed without confirmation.
- **Confirmation (Step 6):** Still generated.

## Error Handling

- **No STATE.md found:** "No CKW project found in this directory. Nothing to pause."
- **HANDOFF.md already exists:** Ask to overwrite (see Step 1). If user declines, stop without changes.
- **User gives empty answers:** Use sensible defaults — "No details provided" for questions 1-2, config user name for question 3. Don't block on empty answers.
- **Config.json missing or no user.name:** Default paused_by to "unknown" and suggest: "Set your name in `~/.ckw/config.json` → `user.name`."
