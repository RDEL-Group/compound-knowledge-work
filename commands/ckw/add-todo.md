---
description: Capture an idea or task for later execution. Appends to the project backlog with optional priority and phase tags.
---

# /ckw:add-todo — Capture Ideas for Later

## Purpose
Quick-capture ideas, tasks, and notes to a project backlog without breaking your flow. Items surface automatically in `/ckw:progress` output. This is the lightest command in CKW — no agent, no interview, just append and confirm.

## Usage
```
/ckw:add-todo [description]
/ckw:add-todo [description] [--priority P0|P1|P2] [--phase N]
```

**Examples:**
```
/ckw:add-todo "Add case study appendix to Phase 3"
/ckw:add-todo "Check if Baldev has updated Jira fields" --priority P1
/ckw:add-todo "Consider bilingual version" --priority P2 --phase 4
```

If no description is provided inline, prompt the user: "What do you want to capture?"

## What This Command Does

Append a timestamped entry to `todos/BACKLOG.md`. No agent spawn — this is a direct file operation.

### Step 1: Validate Project

Check that STATE.md exists in the current directory.

If not found: "No CKW project found in this directory. Run `/ckw:new-project` or `/ckw:adopt-project` first, or navigate to your project folder."

### Step 2: Parse Input

- **Description:** From inline argument, or prompt if not provided
- **Priority:** From `--priority` flag (P0, P1, or P2). Optional — omit if not specified.
- **Phase:** From `--phase` flag (number). Optional — omit if not specified.

### Step 3: Create Backlog File (if needed)

If `todos/BACKLOG.md` doesn't exist, create it:

```bash
mkdir -p todos
```

Then write the header:

```markdown
# Backlog

Ideas and tasks captured for later execution. Run `/ckw:progress` to see these alongside project status.

## Items
```

### Step 4: Append Entry

Add a new line to the `## Items` section of `todos/BACKLOG.md`:

```markdown
- [ ] [description] — added [YYYY-MM-DD]
```

With optional tags:

```markdown
- [ ] [description] — added [YYYY-MM-DD] | priority: P1 | phase: 2
```

### Step 5: Confirm

Count total items in the backlog (lines starting with `- [ ]` or `- [x]`) and report:

```
Added to backlog:
  "[description]"

Backlog now has [N] items ([M] open, [K] completed).
```

## Design Notes

- Does NOT update STATE.md — too lightweight. Keeps YAML frontmatter clean for machine parsing.
- No git commit per todo — individual todos are too granular. They get committed alongside the next meaningful command's commit.
- `/ckw:progress` already reads the `todos/` directory, so backlog items surface automatically in project status.
- Items can be manually checked off by editing `- [ ]` to `- [x]` in BACKLOG.md.
- For tasks that need full planning, use `/ckw:plan-phase` instead.

## Pipeline Mode

**`--headless` behavior:** Requires inline description. If no description is provided inline, return error: "Headless mode requires an inline description. Usage: `/ckw:add-todo \"description\" --headless`". All other behavior is unchanged — this command is already non-interactive when a description is provided.

## Error Handling

- No STATE.md found: Suggest `/ckw:new-project` or `/ckw:adopt-project`
- Empty description (user provides nothing when prompted): "Nothing to capture. Run `/ckw:add-todo` again with a description."
- Invalid priority value: "Priority should be P0, P1, or P2. Adding without priority tag."
- Invalid phase number: "Phase should be a number. Adding without phase tag."
