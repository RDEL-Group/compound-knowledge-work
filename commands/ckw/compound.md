---
description: Extract reusable solutions from completed work. Interviews you about what worked, examines artifacts for patterns, and files solutions for future projects to build on.
---

# /ckw:compound — Capture What Worked

## Purpose
Extract reusable solutions from completed work. The compounder interviews you about what worked, examines project artifacts for patterns, and files solutions that future projects can build on. Solutions start in the project folder and can be promoted to a shared knowledge repo. Writing lessons (voice, style, audience) are sorted into the team's voice files, so the next draft starts closer to right.

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
- If a `voice/` folder exists: the destination `voice/` file for each writing lesson (see Lesson Routing below)

### Step 3: Spawn Compounder

Spawn the **ckw-compounder** agent in solution extraction mode. The agent:

1. Scans artifacts for patterns before interviewing
2. Interviews you about what worked and what's reusable
3. Drafts solution files with YAML frontmatter
4. Presents solutions for your review before saving
5. Updates the solutions index
6. Offers to promote each solution to the shared repo

Before drafting, the compounder also sorts each lesson to its right home and checks it before anything durable is saved (see Lesson Routing below).

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

4. **Voice, style, and audience lessons** (only if a `voice/` folder exists) → appended under `## Confirmed lessons` in the destination file
   - One dated line per lesson, with its source project (audience findings add scope)
   - Only lessons you stated or confirmed (a headless run holds the rest as pending)

### Step 5: Update STATE.md

Add to Current Status section:
```
[N] solutions captured from [scope]. [N] promoted to shared repo.
```

If a `voice/` folder is in use, add: `[N] voice/style/audience lessons filed. [N] held for confirmation.`

### Step 6: Save Progress

**If local/git repo:**
```bash
git add docs/solutions/
git add voice/    # only if project voice/ files changed
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

(Only if a voice/ folder is in use:)
Voice, style, and audience lessons filed: [N]
  • [Lesson in a few words] → voice/[file].md
Held for your confirmation: [N]

These solutions will be surfaced by the planner when starting
similar phases in future projects.

Next:
  /ckw:compound --phase [other]    Compound another phase
  /ckw:complete-project            Close out the project with a retrospective
  /ckw:progress                    Full project status
```

## Lesson Routing

The compounder sorts every lesson to one home before saving. Full process: `agents/ckw-compounder.md`, Step 2b.

| The lesson is... | It goes to |
|------------------|------------|
| A voice tic (how sentences sound) | `voice/VOICE.md` |
| An evidence, structure, or readiness standard | the applicable `voice/STYLE-{doc-type}.md` (`reporting-runbook`, `strategy-doc`, or `rfp`) |
| An audience finding (what a type of reader knows) | `voice/AUDIENCE-{segment}.md` (`current-client` or `prospect`), recorded with source, date, and scope |
| A reusable technique or pattern | `solutions/` as today |
| A one-off choice for this piece | stays with the piece, never promoted |

`voice/` is the shared knowledge repo's `voice/` folder. A project can carry its own `voice/` overrides, and project files win where they disagree (the plugin's `docs/context-contract.md`, section 4). A preference that is one person's own habit, not the organization's, stays in `~/.ckw/SYSTEM.md` (same contract, section 2). If no file fits the lesson's document type or segment, don't create one — raise it with the user.

**Route with the classification test** (the plugin's `docs/context-contract.md`, section 3, "The classification test"):

> a rule that changes wording, sentence construction, or tone goes in VOICE; a rule that changes the claim, support, organization, or readiness standard goes in STYLE; reader knowledge goes in AUDIENCE. Split mixed guidance without duplicating it.

**Classify each lesson before anything durable is written:**
- **Explicit preference** — the user stated an enduring preference outright (in the session, a phase CONTEXT.md, or a STATE.md decision). An agent's own writing, such as a task summary's Key Decisions or a review finding, never counts as one.
- **Repeated pattern** — supported by several examples you can name (the same correction across drafts, the same rule cited in several review findings).
- **One-off** — a choice made for this piece only.
- **Unconfirmed inference** — your reading of what the user would want; nobody has confirmed it.

**Confirm before durable:**
- Show every inference to the user for confirmation first. Save it only after a clear yes; it then counts as an explicit preference.
- Never save a one-off as a rule. It stays with the piece. If the user says it is a standing rule after all, it becomes an explicit preference.
- Solutions keep their own review flow. Voice, style, and audience lessons follow the rules here.

**Iterate the rule, not the draft.** When a correction keeps coming back, the fix is a rule change in the right file, not another hand-edit of the draft.

**If there is no `voice/` folder** — neither in the project nor in a configured knowledge repo — routing works exactly as it does today (solutions library and `~/.ckw/SYSTEM.md`). Nothing is written to or created under `voice/`.

*Routing model adapted from Every's compound-writing plugin (cw-save) by Katie Parrott (MIT license).*

## Pipeline Mode

**`--headless` behavior:** Extract solutions from artifacts only, without interviewing the user.

- **Interview (compounder Step 2):** Skip. The compounder scans artifacts (Step 1) and drafts solutions from patterns found in task summaries, CONTEXT.md, REVIEW_REPORT.md, and drafts.
- **User review (compounder Step 4):** Skip. Auto-save all drafted solutions.
- **Staleness check (compounder Step 5):** Still runs. If conflicts are found, log them but auto-keep both (conservative default). Do not prompt.
- **Promotion (compounder Step 7):** Skip. Solutions stay project-local. Promotion requires explicit user decision.
- **Lesson routing (compounder Step 2b):** Classify lessons from the artifacts alone.
  - **Auto-file only explicit preferences the user recorded:** a decision in STATE.md, or a preference the user stated outright. Task summaries and review reports are written by agents, so nothing in them counts as an explicit preference. Skip one-offs.
  - A preference recorded only in a phase CONTEXT.md is never auto-filed as a project-wide or org voice rule; hold it as pending unless the same preference is also a STATE.md decision or the user stated it.
  - **Hold everything else as pending**, repeated patterns and inferences alike. Add each to STATE.md → Open Questions as `**[P2 — nice to know]** Unconfirmed voice/style lesson (proposed home: [file]; [repeated pattern: its examples / inference]): [lesson]`, and list it in the report. The next interactive `/ckw:compound` shows pending lessons first.
  - A lesson that contradicts a rule already in the file is held as pending too.
  - **Write to the project's own `voice/` folder only** (create the file with just a `## Confirmed lessons` heading if it's missing). Never write to the shared repo's `voice/` files; moving a lesson there is the user's decision, like promoting a solution.
- **All file writes and git commits:** Proceed without confirmation.
- **Report (compounder Step 8):** Still generated.

## Error Handling

- **No completed work** → "No drafts or summaries found. Run /ckw:execute-phase first."
- **Shared repo not configured** (and user wants to promote) → "No shared knowledge repo configured. Want to set one up? I'll need a path." Save to `~/.ckw/config.json` → `knowledge_repos`.
- **Solutions already exist** → "Solutions already captured for [scope]. Add more or view existing?"
- **Phase doesn't exist** → "Phase [N] isn't in the roadmap. Available phases: [list]."
- **Voice file has no `## Confirmed lessons` heading** → Add the heading at the end of the file, then append the lesson under it.
- **No voice, style, or audience file fits the lesson** → Don't create one. Tell the user and keep the lesson with the piece (headless: hold it as pending).
- **Config.json missing or malformed** → "CKW config not found at ~/.ckw/config.json. Run the installer or create it manually."
