---
description: Resume work on a project. Loads context, surfaces handoff notes, and proposes the next action to take.
---

# /ckw:resume-work — Resume with Full Context

## Purpose
Pick up a project with full context restoration. Goes beyond the SessionStart hook by loading comprehensive project state, surfacing handoff notes from `/ckw:pause-work`, and proposing a specific next action — not just a status display, but an active "here's where you left off, here's what to do next."

Works for both resuming your own paused work and picking up a teammate's project.

## Usage
```
/ckw:resume-work [alias]
```

**Examples:**
```
/ckw:resume-work               # Resume project in current directory
/ckw:resume-work satellite     # Resume by project alias (from config.json)
```

- `alias`: Project alias from `~/.ckw/config.json` → `projects` map (optional)

## What This Command Does

Resolve which project to resume, load its full context, display status with handoff notes, and propose the next action. No agent spawn — this is a context-loading and display command.

### Step 1: Resolve Project

Three resolution modes, in priority order:

**Mode A — Alias provided:**
1. Read `~/.ckw/config.json`
2. Look up `projects.[alias]` for the project path
3. If found, use that path
4. If not found: "No project registered as '[alias]'. Available projects: [list from config]. Register new projects with `/ckw:new-project` or `/ckw:adopt-project`."

**Mode B — No alias, current directory is a CKW project:**
1. Check if STATE.md exists in the current working directory
2. If found, use the current directory

**Mode C — No alias, not in a CKW project:**
1. Read `~/.ckw/config.json` → `projects` map
2. If projects exist, list them:
   ```
   Not in a CKW project directory. Your registered projects:

     satellite    /path/to/Satellite-CKW
     rfp-acme     /path/to/acme-rfp

   Run /ckw:resume-work [alias] to resume one, or navigate to the project folder.
   ```
3. If no projects registered: "No CKW projects registered. Run `/ckw:new-project` to start one."

### Step 2: Load Context

Read the following files from the resolved project path:

- **STATE.md** — YAML frontmatter (status, phase, tasks) + markdown body (decisions, blockers, action items)
- **PROJECT.md** — Project name, scope, vision
- **ROADMAP.md** — Phase names and timeline
- **HANDOFF.md** — Handoff notes from `/ckw:pause-work` (if exists)
- Current phase **CONTEXT.md** — Tone, audience, preferences (if exists, from `.planning/phases/{NN}-{phase-name}/CONTEXT.md`)
- Current phase **PHASE-PLAN.md** — Task list and dependencies (if exists)

### Step 3: Display Status

Build a comprehensive status display:

**If HANDOFF.md exists — show it first and prominently:**

```
Resuming: [Project Name]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Handoff from [paused_by] ([paused_at]):

  What was in flight:
    [content from HANDOFF.md "What's In Flight" section]

  Key context:
    [content from HANDOFF.md "Key Context" section]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Project status (always shown):**

```
📊 Status: Phase [current_phase] of [phases_total] — [phase name]
   Tasks: [X/Y] complete in current phase
   Overall: [completed phases] of [total phases] phases done

[If action items exist:]
⚡ Outstanding action items:
  - [item 1]
  - [item 2]

[If blockers exist:]
🚩 Blockers:
  - [blocker 1]
```

**If no HANDOFF.md — simpler header:**

```
Resuming: [Project Name]

📊 Status: Phase [current_phase] of [phases_total] — [phase name]
   ...
```

### Step 4: Propose Next Action

Based on the STATE.md status field, propose a specific next action — not a menu of options, but a clear recommendation:

| Status | Recommendation |
|--------|---------------|
| `scoped` | "Phase [N] is scoped but not planned. **Recommended:** `/ckw:brainstorm [N]` to explore the approach, or `/ckw:plan-phase [N]` to jump straight to planning." |
| `planned` | "Phase [N] is planned and ready to execute. **Recommended:** `/ckw:execute-phase [N]` to start drafting." |
| `in-progress` or `executing` | "Phase [N] execution is in progress ([X/Y] tasks done). **Recommended:** `/ckw:execute-phase [N]` to continue with [next task name]." |
| `drafted` | "Phase [N] drafts are complete. **Recommended:** `/ckw:review-phase [N]` to run a quality check." |
| `reviewing` | "Phase [N] is under review. Check REVIEW_REPORT.md for findings, then `/ckw:execute-phase [N] --revisions` for any P1 fixes." |
| `reviewed` | "Phase [N] review is complete. **Recommended:** `/ckw:compound` to capture what worked, or move to Phase [N+1]." |
| `paused` | Use the underlying phase status (from `phase_[N]_status`) to determine the recommendation. Show it alongside the handoff context. |
| `complete` | "Project is complete! Run `/ckw:compound` to capture additional learnings, or `/ckw:search-solutions` to find patterns from this project." |

Format the recommendation:

```
🎯 Recommended next action:
   /ckw:[command] [args]     [reason]

Other options:
  /ckw:progress              Full project status
  /ckw:quick "[task]"        Quick ad-hoc task
  /ckw:help                  All commands
```

### Step 5: Handle Handoff Resolution

If HANDOFF.md exists, after displaying the status and recommendation:

```
Mark handoff as resolved? This archives the handoff notes to .planning/handoff-archive/.
```

**If user confirms:**
1. Create `.planning/handoff-archive/` directory if it doesn't exist
2. Move HANDOFF.md to `.planning/handoff-archive/[YYYY-MM-DD]-HANDOFF.md`
3. Confirm: "Handoff archived."

**If user declines or skips:** Leave HANDOFF.md in place. It will show again on next resume.

### Step 6: Update STATE.md

If the project was paused (status is `paused`):
1. Remove `paused` from the status — restore the previous status based on phase statuses:
   - If any phase has `phase_[N]_status: in-progress` → set status to `in-progress`
   - If all phases are `planned` → set status to `planned`
   - If all tasks in current phase are complete → set status to `drafted`
   - Otherwise → set status to `in-progress` (safe default)
2. Remove `paused_at` and `paused_by` fields from YAML frontmatter
3. Update `last_updated: [ISO date]`

If the project was NOT paused, just update `last_updated`.

**If local/git repo:**
```bash
git add STATE.md
git add .planning/handoff-archive/ 2>/dev/null
git commit -m "CKW: Work resumed — [phase name]"
```

**If Google Drive / cloud storage:** Skip git.

## Relationship to SessionStart Hook

The `ckw-session-init.sh` hook runs automatically on every new Claude Code session and shows a brief 2-3 line status. `/ckw:resume-work` is the manual, comprehensive version:

| Aspect | SessionStart Hook | /ckw:resume-work |
|--------|------------------|------------------|
| Trigger | Automatic on session start | Manual invocation |
| Output | 2-3 lines (project, phase, status) | Full context with handoff notes |
| Handoff | Does not show HANDOFF.md content | Shows full handoff prominently |
| Action | Generic suggestion based on status | Specific recommendation with reasoning |
| State change | None (read-only) | Clears paused status, archives handoff |
| Project resolution | Current directory only | Alias lookup + project listing |

Both remain useful — the hook is passive awareness, the command is active context restoration.

## Error Handling

- **Alias not found in config.json:** "No project registered as '[alias]'. Available: [list]. Register with `/ckw:new-project` or `/ckw:adopt-project`."
- **No CWD project and no alias:** List registered projects or suggest starting one (see Step 1, Mode C)
- **Config.json missing:** "CKW config not found at `~/.ckw/config.json`. Run the installer or create it manually."
- **STATE.md exists but is malformed:** "STATE.md has issues — couldn't parse status. Run `/ckw:progress` to diagnose, or check the file manually."
- **Project path from config doesn't exist:** "Project path for '[alias]' doesn't exist: [path]. The folder may have been moved. Update `~/.ckw/config.json` with the new path."
