---
description: Execute a quick ad-hoc task without full planning. Spawns the executor with minimal context for one-off drafts, analyses, or research.
---

# /ckw:quick — Quick Ad-Hoc Task

## Purpose
Run a one-off task without the full plan-then-execute workflow. For email drafts, quick analyses, meeting agendas, short research requests — anything that doesn't need a formal task plan. Spawns the executor agent with minimal context so you get quality output with tracking, but without ceremony.

This is also the most accessible entry point for new users — it works even outside a CKW project.

## Usage
```
/ckw:quick "[task description]"
/ckw:quick "[task description]" --reference <path>
```

**Examples:**
```
/ckw:quick "Draft email to Baldev about P0 deployment readiness"
/ckw:quick "Summarize Q1 campaign performance" --reference reference/q1-report.pdf
/ckw:quick "Write a meeting agenda for the Phase 2 kickoff"
/ckw:quick "Compare three pricing models for the SaaS tier"
```

If no description is provided inline, prompt: "What do you need? Describe the task."

- `--reference <path>`: Load a specific reference file alongside the task (optional)

## What This Command Does

Construct a minimal inline plan from the user's description, then spawn **ckw-executor** with fresh context to draft the output. No formal task plan, no wave structure — the description IS the plan.

### Step 1: Parse Input

- **Description:** From inline argument (in quotes) or prompt if not provided
- **Reference:** From `--reference` flag (validate file exists if provided)

### Step 2: Determine Context Mode

Check if the current directory is a CKW project:

**If STATE.md exists (project mode):**
- Load: PROJECT.md, STATE.md, `~/.ckw/SYSTEM.md`
- Load current phase CONTEXT.md if it exists (for tone/audience preferences)
- Load `--reference` file if provided

**If no STATE.md (standalone mode):**
- Load only: `~/.ckw/SYSTEM.md` (user preferences)
- Load `--reference` file if provided
- Note to user: "No CKW project found. Running in standalone mode — output saved to drafts/quick/"

### Step 3: Generate Output Path

Create the output file path:

1. **Timestamp:** `YYYYMMDD-HHMMSS` format (e.g., `20260306-143022`)
2. **Slug:** Lowercase the description, replace spaces and special characters with hyphens, strip non-alphanumeric characters (except hyphens), collapse multiple hyphens, max 50 characters
3. **Path:** `drafts/quick/{timestamp}-{slug}.md`

```bash
mkdir -p drafts/quick
```

### Step 4: Construct Inline Plan

Build a minimal task plan that the executor agent can process. This follows the same format as formal task plans but with less ceremony:

```markdown
# Quick Task: [slug]

## Objective
[User's task description — verbatim]

## Output
- **File:** drafts/quick/[timestamp]-[slug].md
- **Format:** markdown
- **Length target:** Appropriate to the task (use judgment)

## Context to Load
<!-- Minimal context — only what's needed -->
- PROJECT.md (T1 — if in project mode)
- STATE.md (T1 — if in project mode)
- ~/.ckw/SYSTEM.md (T1 — always, for user preferences)
- Phase CONTEXT.md (T2 — if exists, for tone/audience)
- [--reference file path] (T3 — if provided)

## Instructions for Executor
[User's task description]

Draft this as a complete, standalone piece of work. Use the project context
(if available) to match tone and style. Flag anything that needs human input
as [ACTION REQUIRED].

## Quality Criteria
- [ ] Addresses the stated task fully and completely
- [ ] Follows tone/voice from CONTEXT.md or SYSTEM.md (if available)
- [ ] Professional quality — ready to use as-is or with minor edits
- [ ] No placeholder text except [ACTION REQUIRED] for items needing human input
```

### Step 5: Spawn Executor

Spawn the **ckw-executor** agent with:
- The inline plan from Step 4
- The context files determined in Step 2
- Fresh context — no conversation history

The executor runs its standard process:
1. Reads the inline plan
2. Loads specified context files
3. Drafts the content
4. Runs its quality self-check
5. Flags [ACTION REQUIRED] items
6. Saves output to the specified file path

### Step 6: Report Results

After the executor completes:

```
Quick task complete!

  [task description]
  drafts/quick/[timestamp]-[slug].md ([word count] words)

[If ACTION REQUIRED items exist:]
  [ACTION REQUIRED] items:
    - [item 1]
    - [item 2]

Next:
  Open the file to review and edit
  /ckw:quick "[another task]"    Run another quick task
  /ckw:add-todo "[idea]"         Capture something for later
```

### Step 7: Track (if in project mode)

If STATE.md exists, append to the Quick Tasks section in the markdown body. Create the section if it doesn't exist:

```markdown
## Quick Tasks
- [YYYY-MM-DD] [task description, first 60 chars] -> drafts/quick/[filename]
```

Do NOT update STATE.md YAML frontmatter — quick tasks are lightweight and shouldn't change project-level status.

## Design Notes

- **Why spawn an executor?** Fresh context + quality self-check + tracked output. The executor's self-review gate catches low-quality drafts before the user sees them.
- **Why standalone mode?** Makes `/ckw:quick` useful for anyone, even before setting up a project. Lowest barrier to entry in CKW.
- **No SUMMARY.md:** Quick tasks don't generate executor summaries — the output file itself is sufficient. Quick tasks don't feed into the review pipeline.
- **No git commit:** Individual quick tasks are too granular for their own commits. They get picked up alongside the next meaningful command.
- **Executor compatibility:** The `ckw-executor` agent already handles generic task plans. The inline plan format follows the same structure — no changes to the agent needed.

## Error Handling

- **Empty description (nothing provided when prompted):** "No task described. Run `/ckw:quick` again with a description of what you need."
- **Reference file not found:** "Reference file not found at [path]. Proceeding without it — or check the path and try again."
- **Executor fails:** Save any partial output. Report the error and suggest: "The executor ran into an issue. You can try rephrasing the task or running `/ckw:quick` again."
- **drafts/quick/ can't be created:** "Can't create output directory. Check file permissions."
