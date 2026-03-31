---
description: Extract reusable solutions from completed work. Interviews you about what worked, examines artifacts for patterns, and files solutions for future projects to build on.
---

# /ckw:compound — Capture What Worked

## Purpose
Extract reusable solutions from completed work. The compounder interviews you about what worked, examines project artifacts for patterns, and files solutions that future projects can build on. Solutions start in the project folder and can be promoted to a shared knowledge repo.

## Usage
```
/ckw:compound [--phase N] [--headless]
```

- Default: compound from the entire project (all phases)
- `--phase N`: compound from a specific phase only

## What This Command Does

Spawn the **ckw-compounder** agent in **solution extraction mode**.

### Step 1: Validate Readiness

Check that there's completed work to compound from:

1. Read STATE.md for project status
2. Check for task summaries in `.planning/phases/`
3. Check for drafts in `drafts/`

If `--phase N` specified, validate that phase has completed tasks.

**If no completed work:**
```
No completed work found to compound from.
Run /ckw:execute-phase to draft content first.
```

**If solutions already exist for the specified scope:**
```
Solutions already exist for [scope]:
  • [solution 1 name]
  • [solution 2 name]

Add more solutions, or view existing?
```

### Step 2: Load Context

**Always load (T1):**
- PROJECT.md — Project scope and vision
- STATE.md — Decisions and progress
- ~/.ckw/SYSTEM.md — User preferences

**Phase-level (T2):**
- All CONTEXT.md files (or specific phase if `--phase N`)
- All task summaries
- REVIEW_REPORT.md files (if any)

**For pattern extraction (T3):**
- Draft files — to identify reusable structures and frameworks

**To avoid duplicates (T4):**
- Existing `docs/solutions/solutions-index.md`

### Step 3: Spawn Compounder

Spawn the **ckw-compounder** agent in solution extraction mode. The agent:

1. Scans artifacts for patterns before interviewing
2. Interviews you about what worked and what's reusable
3. Drafts solution files with YAML frontmatter
4. Presents solutions for your review before saving
5. Updates the solutions index
6. Offers to promote each solution to the shared repo

See `agents/ckw-compounder.md` (Mode 1) for the full process.

### Step 4: Save Outputs

The compounder creates:

1. **Solution files** → `docs/solutions/[kebab-case-name].md`
   - One file per identified learning
   - YAML frontmatter with type, tags, confidence, reuse context
   - Structured content: what it is, the pattern, when to use/not use, example

2. **Solutions index** → `docs/solutions/solutions-index.md`
   - Table of all solutions with tags and one-liners
   - Created on first compound, appended on subsequent runs

3. **Promoted copies** (if user approves) → `[shared-repo-path]/solutions/`
   - Same file, copied to shared knowledge repo
   - Shared index updated too

### Step 5: Update STATE.md

Add to Current Status section:
```
[N] solutions captured from [scope]. [N] promoted to shared repo.
```

### Step 6: Save Progress

**If local/git repo:**
```bash
git add docs/solutions/
git add STATE.md
git commit -m "CKW: [N] solutions captured from Phase [N]"
```

**If Google Drive / cloud storage:** Skip git.

### Step 7: Report

```
Compounding complete!

📝 Solutions captured: [count]
  • [Name] (type) → docs/solutions/[file].md
  • [Name] (type) → docs/solutions/[file].md

🔗 Promoted to shared repo: [N] of [total]

These solutions will be surfaced by the planner when starting
similar phases in future projects.

Next:
  /ckw:compound --phase [other]    Compound another phase
  /ckw:complete-project            Close out the project with a retrospective
  /ckw:progress                    Full project status
```

## Pipeline Mode

**`--headless` behavior:** Extract solutions from artifacts only, without interviewing the user.

- **Interview (compounder Step 2):** Skip. The compounder scans artifacts (Step 1) and drafts solutions from patterns found in task summaries, CONTEXT.md, REVIEW_REPORT.md, and drafts.
- **User review (compounder Step 4):** Skip. Auto-save all drafted solutions.
- **Staleness check (compounder Step 5):** Still runs. If conflicts are found, log them but auto-keep both (conservative default). Do not prompt.
- **Promotion (compounder Step 7):** Skip. Solutions stay project-local. Promotion requires explicit user decision.
- **All file writes and git commits:** Proceed without confirmation.
- **Report (compounder Step 8):** Still generated.

## Error Handling

- **No completed work** → "No drafts or summaries found. Run /ckw:execute-phase first."
- **Shared repo not configured** (and user wants to promote) → "No shared knowledge repo configured. Want to set one up? I'll need a path." Save to `~/.ckw/config.json` → `knowledge_repos`.
- **Solutions already exist** → "Solutions already captured for [scope]. Add more or view existing?"
- **Phase doesn't exist** → "Phase [N] isn't in the roadmap. Available phases: [list]."
- **Config.json missing or malformed** → "CKW config not found at ~/.ckw/config.json. Run the installer or create it manually."
