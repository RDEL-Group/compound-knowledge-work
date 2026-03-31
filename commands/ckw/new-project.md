---
description: Scope a new knowledge work project with a structured interview or PRD extraction. Produces CLAUDE.md, PROJECT.md, REQUIREMENTS.md, ROADMAP.md, and STATE.md.
---

# /ckw:new-project — Scope a New Knowledge Work Project

## Purpose
Replace ad-hoc PRD creation with a structured scoping interview that produces a complete project foundation. This command generates all the files needed to start planning and executing work.

## Usage
```
/ckw:new-project [--from-prd <path>] [--auto]
```

- Default: Interactive interview with the user
- `--from-prd <path>`: Extract project scope from an existing PRD/brief/spec document. Generates project files first, then asks "What did I get wrong?" instead of running the full interview. Supports .md, .txt, .docx, .pdf (uses import-summarizer for conversion).
- `--auto`: Minimal questions, AI fills gaps with reasonable defaults (user reviews after)

## What This Command Does

Spawn the **ckw-scoper** agent with a fresh context to conduct the scoping process.

### Step 0: PRD-First Flow (when `--from-prd` is provided)

If the user provides a PRD or spec document:

1. **Convert if needed** — Use the `import-summarizer` skill to convert .docx/.pdf to readable text
2. **Read the full document** — Load and parse the entire PRD
3. **Extract all scoping answers** — Map PRD content to the interview questions below. Extract:
   - Project identity (deliverable type, audience, goal)
   - Constraints (deadline, format, tone, hard limits)
   - Requirements (break into deliverables with acceptance criteria)
   - Phases/timeline (map to CKW phase structure)
   - Success criteria and approval process
   - Referenced materials and dependencies
4. **Generate project files** — Create all files using the extracted answers (same templates as Step 3)
5. **Present for validation** — Instead of asking interview questions, present "5 things I'm most likely wrong about" and ask the user to correct anything. Cover: requirement grouping, phase boundaries, timeline interpretation, success criteria extraction, scope assumptions (same criteria as Step 3b below).
6. **Iterate** — Apply corrections and regenerate affected files

After the PRD-first flow, skip Steps 1-3b and continue from Step 4 (directory structure).

### Step 1: Structured Interview (when no PRD provided)

Ask the user these questions in order. Group related questions together. Skip questions the user has already answered in the conversation.

**Project Identity:**
1. What are we producing? (RFP response, training module, SOP, strategy doc, client report, other)
2. Who is this for? (Client name, audience, decision-makers)
3. What's the one-sentence goal? ("Win the XYZ RFP", "Train 50 marketers on AI tools", etc.)

**Constraints & Requirements:**
4. What's the deadline? (Hard deadline vs. target date)
5. Are there format requirements? (Page limits, templates, submission rules, file formats)
6. What tone/voice should we use? (Formal, conversational, brand-specific — check shared repo playbooks)
7. Any hard constraints? (Budget, scope limitations, things we must NOT include)

**Reference Materials:**
8. What existing materials should inform this work? (Past proposals, client briefs, competitor research, internal docs)
9. Are there templates to follow? (Check shared repo templates/ directory)
10. What does "excellent" look like? (Reference examples, past wins, gold standards)

**Success Criteria:**
11. What does "done well" look like for THIS project?
12. Who reviews/approves the final output?
13. How will we know if it succeeded? (Win rate, adoption, feedback score, etc.)

### Step 2: Solutions Library Search

Before generating project files, search the shared knowledge repo for relevant prior work:

1. Read `~/.ckw/config.json` to get knowledge repo path(s)
2. Search `solutions/` directories for entries matching:
   - Deliverable type (e.g., `deliverable: rfp`)
   - Industry/client type (from interview answers)
   - Similar scope or audience
3. Present any relevant solutions to the user: "I found 3 past projects that might be relevant. Want me to incorporate their learnings?"
4. If matches found, extract relevant patterns, templates, and lessons into the research phase

### Step 3: Generate Project Files

Create the following files in the current working directory:

**CLAUDE.md** — Lightweight project index (NOT a content mirror — scope/audience/timeline details live in PROJECT.md only)
```markdown
# [Project Name]

## Project Type
[deliverable type — e.g., "internal-tool-development", "rfp-response", "training-curriculum"]

## Key Context
- **Owner:** [from interview]
- **Timeline:** [start] – [end]
- **What this is:** [one sentence — what Satellite is, what the RFP is for, etc.]
- **Tech stack / tools:** [if applicable]

## Current Focus
[Brief description of active phase(s) — what's being worked on NOW]

## File Map
- PROJECT.md — Full scope and vision
- REQUIREMENTS.md — All deliverables with acceptance criteria
- ROADMAP.md — Phases and progress
- STATE.md — Current status and decisions
- reference/ — Input materials
- drafts/ — Working content files
- deliverables/ — Final approved outputs

## Stakeholders
[Names and roles — who reviews, who approves, who uses the output]

## Workflow
Run `/ckw:progress` to see current status and next steps.
```

**PROJECT.md** — Vision and scope (the PRD)
```markdown
# [Project Name]

## Overview
[One paragraph synthesizing the interview answers — what, for whom, why]

## Goal
[One-sentence goal from interview]

## Audience
[Who reads/uses the final deliverable, what they care about]

## Constraints
- **Deadline:** [date]
- **Format:** [requirements]
- **Tone/Voice:** [description, with reference to playbook if applicable]
- **Hard constraints:** [list]

## Success Criteria
[From interview, specific and measurable]

## Approval Process
[Who reviews, who approves, how feedback flows]

## Reference Materials
[List of materials identified in interview, with paths once imported]

## Prior Art
[Relevant solutions surfaced from knowledge base, if any]
```

**REQUIREMENTS.md** — Scoped deliverables
```markdown
# Requirements — [Project Name]

## Deliverables
[List each deliverable with ID, description, and acceptance criteria]

| ID | Deliverable | Description | Acceptance Criteria | Phase |
|----|------------|-------------|--------------------|----- |
| D-001 | [name] | [description] | [criteria] | [phase #] |

## Format Requirements
[Page limits, templates, file formats, submission rules]

## Quality Standards
[Minimum review scores, compliance requirements, mandatory sections]
```

**ROADMAP.md** — Phases and progress (supports overlapping phases)
```markdown
# Roadmap — [Project Name]

## Phases

### Phase 1: [Name]
- **Goal:** [what this phase produces]
- **Owner:** [who builds this]
- **Timeline:** [start month] – [end month]
- **Status:** Not started
- **Requirements:** [requirement IDs, e.g., D-001 through D-005]
- **Tasks:** To be planned via /ckw:plan-phase 1
- **Key deliverables:**
  - [deliverable 1]
  - [deliverable 2]

### Phase 2: [Name]
- **Goal:** [what this phase produces]
- **Owner:** [who builds this]
- **Timeline:** [start month] – [end month]
- **Parallel with:** [phase number, if overlapping — e.g., "Phase 1 (overlap in March)"]
- **Status:** Not started
- **Requirements:** [requirement IDs]
- **Tasks:** To be planned via /ckw:plan-phase 2

[...additional phases as needed]

## Timeline
[ASCII timeline showing phase overlaps, e.g.:]
[Feb ├── Phase 1 ──┤              ]
[Mar         ├── Phase 2 ──────┤  ]

- **Start:** [date]
- **Target completion:** [date]
- **Hard deadline:** [date, if different]
```

**STATE.md** — Machine-readable state + human-readable status
```yaml
---
project: [name]
type: [deliverable type]
status: scoped
current_phase: 0
phases_total: [N]
created: [ISO date]
last_updated: [ISO date]
decisions: []
blockers: []
---
```
```markdown
# Project State

## Current Status
Project scoped. Ready for /ckw:plan-phase 1.

## Decisions Made
[None yet — will be populated by /ckw:discuss-phase]

## Open Questions
[Categorize each question by blocking priority:]
- **[P0 — blocks planning]** [question] (Must answer before /ckw:plan-phase can run)
- **[P1 — blocks execution]** [question] (Must answer before specific tasks execute)
- **[P2 — nice to know]** [question] (Can be resolved as they come up)

## Blockers
[None]

## Next Steps
[Actionable steps with specific /ckw: commands]
```

### Step 3b: Structured Validation

Before finalizing, present the user with a validation check — especially important for `--from-prd` mode where the scoper is interpreting rather than being told directly.

Present **"5 things I'm most likely wrong about"** covering:
1. **Requirement grouping** — "I grouped these into N phases. Did I split or combine things incorrectly?"
2. **Phase boundaries** — "Phase 1 ends at X and Phase 2 starts at Y. Is that the right cut?"
3. **Timeline interpretation** — "I read the deadline as [date]. Is that the hard deadline or a target?"
4. **Success criteria extraction** — "I identified these as the key metrics: [list]. Missing anything?"
5. **Scope assumptions** — "I assumed [X] is in scope and [Y] is out. Correct?"

Wait for user corrections. Regenerate any affected files before proceeding.

### Step 4: Create Directory Structure

```
mkdir -p .planning/research
mkdir -p .planning/phases
mkdir -p drafts
mkdir -p reference
mkdir -p reference/.index
mkdir -p deliverables
mkdir -p config
mkdir -p playbooks
mkdir -p corpus
mkdir -p docs/solutions
mkdir -p docs/templates
mkdir -p docs/review-criteria
mkdir -p todos
```

### Step 5: Initialize Versioning

**Detect the project location** to choose the right versioning strategy:

```
# Check if project is on Google Drive or similar cloud sync
if [[ "$PWD" == *"GoogleDrive"* ]] || [[ "$PWD" == *"Google Drive"* ]] || \
   [[ "$PWD" == *"CloudStorage"* ]] || [[ "$PWD" == *"Dropbox"* ]] || \
   [[ "$PWD" == *"OneDrive"* ]]; then
  # Cloud-synced folder — git causes sync conflicts
  echo "Project is on cloud storage. Skipping git — using Drive version history + STATE.md timestamps."
else
  # Local filesystem — full git versioning
  if [ ! -d .git ]; then
    git init
    git add CLAUDE.md PROJECT.md REQUIREMENTS.md ROADMAP.md STATE.md
    git commit -m "CKW: Project scoped — [project name]"
  fi
fi
```

- **Local/git repo:** Full git versioning with atomic commits
- **Google Drive / cloud storage:** Skip git; rely on Drive version history + STATE.md timestamps. The shared knowledge repo (on GitHub) still uses git — this only affects per-project working files.

### Step 6: Register Project

Add the project to `~/.ckw/config.json` for easy access via path aliases:

```javascript
// Read existing config
const config = JSON.parse(fs.readFileSync('~/.ckw/config.json'));

// Add project entry (use folder name as default alias)
if (!config.projects) config.projects = {};
config.projects["[folder-name]"] = "[full-project-path]";

// Save
fs.writeFileSync('~/.ckw/config.json', JSON.stringify(config, null, 2));
```

This enables: `/ckw:resume-work satellite` instead of typing the full path.

### Step 7: Next Steps

Tell the user:
```
Project scoped! Here's what to do next:

1. Add reference materials to the reference/ folder
   Run /ckw:import-reference for each file to index it

2. Start planning the first phase:
   /ckw:discuss-phase 1    (capture your preferences before we plan)
   /ckw:plan-phase 1       (break it into tasks)

3. Check status anytime:
   /ckw:progress
```

## Context Loading (for ckw-scoper agent)

**Load:** ~/.ckw/SYSTEM.md, ~/.ckw/config.json
**Search:** Shared knowledge repo solutions/ (if configured)
**Do NOT load:** Any project files (this is a new project)

## Pipeline Mode

**`--headless` behavior:** Project scoping requires human input to define what the project is, who it's for, and what success looks like. Running headless would produce a project skeleton with no real substance.

**If `--headless` is passed without `--from-prd`:** Return an error with alternatives:
```
Project scoping requires interactive interview and cannot run headless.

Alternative:
  /ckw:new-project --from-prd <path> --headless    Extract scope from a PRD automatically
```

**If `--headless` is passed WITH `--from-prd`:** Proceed. The PRD provides the substance that the interview would otherwise capture. Skip the validation step ("5 things I'm most likely wrong about") — save files directly. Flag all assumptions as `[ACTION REQUIRED]` in STATE.md open questions. Skip the "already has CKW files" check — overwrite if present.

## Error Handling

- If `~/.ckw/config.json` doesn't exist, run setup inline (ask name, create config)
- If shared repo path doesn't exist, warn but continue
- If current directory already has CKW files, ask: "This folder already has a CKW project. Start fresh (overwrites) or use /ckw:adopt-project instead?"
