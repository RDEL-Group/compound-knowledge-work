---
description: Show all CKW commands grouped by workflow stage with examples. Plain language for all experience levels.
---

# /ckw:help — Command Reference

## Purpose
Show every CKW command, grouped by workflow stage, with a one-line description and example for each. Designed to teach the workflow implicitly through the grouping — Start → Plan → Execute → Review → Complete → Navigate. If you're in a project, the most relevant commands are highlighted based on your current status.

## Usage
```
/ckw:help
```

No flags needed.

## What This Command Does

Detect project context, then display every command in `commands/ckw/` (enumerate at runtime — don't hardcode the count), organized by workflow stage. No agent spawn — pure display.

### Step 1: Detect Project Context

Check if STATE.md exists in the current working directory.

**If found:** Read STATE.md YAML frontmatter to get `project`, `current_phase`, `phases_total`, `status`. This is used to highlight the most relevant command group.

**If not found:** Show all commands without context highlighting.

### Step 2: Display Commands

**Output format (with project context):**

```
CKW Commands — Compound Knowledge Work

📍 Active project: [project name] (Phase [N]/[total] — [status])

━━ Start ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /ckw:new-project           Scope a new project
                             Example: /ckw:new-project --from-prd brief.pdf

  /ckw:adopt-project         Import an existing project folder
                             Example: /ckw:adopt-project ./my-rfp-folder

  /ckw:import-reference      Add reference documents (PDF, Word, etc.)
                             Example: /ckw:import-reference reference/*.pdf

  /ckw:calibrate-voice       Teach CKW your team's writing voice from real samples
                             Example: /ckw:calibrate-voice

━━ Plan ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /ckw:brainstorm            Explore ideas before planning a phase
                             Example: /ckw:brainstorm 2

  /ckw:confidence            Check what you know vs. what you're guessing
                             Example: /ckw:confidence --save

  /ckw:plan-phase            Break a phase into executable tasks
                             Example: /ckw:plan-phase 1

  /ckw:search-solutions      Find patterns from past projects
                             Example: /ckw:search-solutions competitive analysis

━━ Execute ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /ckw:execute-phase         Draft content for planned tasks
                             Example: /ckw:execute-phase 1

  /ckw:quick                 Quick ad-hoc task (no full planning)
                             Example: /ckw:quick "Draft email to client about timeline"

  /ckw:add-todo              Capture an idea for later
                             Example: /ckw:add-todo "Add appendix" --priority P1

━━ Review ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /ckw:review-phase          Quality review on drafted content
                             Example: /ckw:review-phase 1

━━ Share & Export ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /ckw:drive                 Search, read, import, or upload via Google Drive
                             Example: /ckw:drive import "client brief"

  /ckw:publish-proof         Publish drafts to Proof for collaborative review
                             Example: /ckw:publish-proof --phase 1 --with-review

━━ Complete ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /ckw:compound              Capture what worked for future projects
                             Example: /ckw:compound

  /ckw:complete-project      Close out with a full retrospective
                             Example: /ckw:complete-project

━━ Navigate ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /ckw:progress              See where the project stands
                             Example: /ckw:progress --detailed

  /ckw:pause-work            Pause and capture handoff context
                             Example: /ckw:pause-work

  /ckw:resume-work           Resume with full context restoration
                             Example: /ckw:resume-work northwind

  /ckw:help                  This command

Optional integrations (install the CLI and the features light up):
  Google Drive (gws CLI)     /ckw:drive, --from-drive, --to-drive
  Jira/Confluence (twg CLI)  --from-jira imports, internal research

Run any command to see detailed usage and options.
```

### Step 3: Contextual Highlight

If in a project, add a marker next to the most relevant command group based on STATE.md status:

| Status | Highlighted Group | Note |
|--------|------------------|------|
| `scoped` | Plan | "Your project is scoped — next step is planning." |
| `planned` | Execute | "Phase [N] is planned — ready to execute." |
| `in-progress` or `executing` | Execute | "Phase [N] execution in progress." |
| `drafted` | Review / Share | "Drafts are ready for review. Publish to Proof for team feedback." |
| `reviewing` | Execute | "Review complete — fix P1 issues with --revisions." |
| `reviewed` | Complete | "Review done — capture learnings or start next phase." |
| `paused` | Navigate | "Project is paused — run resume-work to pick up." |
| `complete` | Complete | "Project complete!" |

Add the note after the group header, e.g.:
```
━━ Execute ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ← You are here
```

### Step 4: Footer

**If in a project:**
```
Most commands support --headless for pipeline/orchestration use.
Run any command to see detailed usage and options.
Full user guide: docs/USER-GUIDE.md
```

**If not in a project:**
```
Not in a CKW project. Start with:
  /ckw:new-project           Scope a new project
  /ckw:adopt-project         Import an existing folder

Most commands support --headless for pipeline/orchestration use.
Run any command to see detailed usage and options.
Full user guide: docs/USER-GUIDE.md
```

## Design Notes

- Commands are grouped by workflow stage, not alphabetically — this teaches the CKW workflow implicitly
- Each command gets exactly one line of description + one line of example — scannable in 10 seconds
- The contextual highlight tells the user what's relevant NOW without them having to figure it out
- The command list is enumerated from `commands/ckw/` at runtime — never hardcode the count, so adding or removing a command can't drift this reference
- This command is the reference companion to `docs/USER-GUIDE.md` (which is scenario-based, not command-based)

## Pipeline Mode

**`--headless` behavior:** No change. This command is already non-interactive — it displays command reference without prompting.

## Error Handling

- **No STATE.md:** Show all commands without project context. Add the "Not in a CKW project" footer.
- **STATE.md malformed:** Show commands without context highlight. Note: "Couldn't read project status — run `/ckw:progress` to diagnose."
