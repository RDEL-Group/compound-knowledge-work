---
description: Import an existing project folder into the CKW framework. Scans existing structure, identifies materials, and generates CKW files around existing work.
---

# /ckw:adopt-project — Import an Existing Project into CKW

## Purpose
Bring an existing project folder into the CKW framework. Scans the existing structure, identifies materials, conducts a lighter scoping interview to fill gaps, and generates CKW files around the existing work — without starting from scratch.

## Usage
```
/ckw:adopt-project [path]
```

- `path`: Optional. Path to the existing project folder. Defaults to current directory.

## What This Command Does

Spawn the **ckw-scoper** agent in **adopt mode** with a fresh context.

### Step 1: Scan Existing Structure

Analyze the target folder to identify what's already there:

1. **Map all files and folders** — Create a complete inventory
2. **Classify files by role:**
   - **Reference materials:** PDFs, .docx, spreadsheets, client briefs, RFPs, research docs
   - **Drafts/Work-in-progress:** Markdown files, working documents, partial deliverables
   - **Templates:** Document templates, slide decks, format examples
   - **Configuration:** YAML/JSON config files, CLAUDE.md files, settings
   - **Corpus content:** Team bios, reference banks, reusable content blocks
   - **Deliverables:** Final or near-final outputs
   - **Planning artifacts:** Project plans, task lists, timelines, requirements docs
   - **Other:** Scripts, images, supporting files

3. **Check for existing CKW-compatible files:**
   - CLAUDE.md → Preserve and augment
   - Any .md files that resemble PROJECT.md, REQUIREMENTS.md, ROADMAP.md
   - Any PRD or project spec documents

4. **Present the scan results to the user:**
```
I found the following in [folder]:

📁 Reference materials (5 files):
   - client-brief.pdf (142 KB)
   - competitor-analysis.docx (89 KB)
   - past-rfp-acme.md (34 KB)
   - market-research.pdf (2.1 MB)
   - requirements-addendum.pdf (45 KB)

📝 Drafts (3 files):
   - exec-summary-v2.md
   - competitive-positioning.md
   - team-overview.md

📋 Planning (1 file):
   - project-plan.md

🔧 Config (1 file):
   - CLAUDE.md

Does this look right? Should I reorganize these into CKW structure?
```

### Step 2: Lighter Scoping Interview

Only ask questions that can't be inferred from existing materials:

1. **Read any existing CLAUDE.md, PRD, or project spec** — extract what's already documented
2. **Ask only what's missing:**
   - "What's the one-sentence goal for this project?" (if not in existing docs)
   - "Who's the audience/client?" (if not obvious from materials)
   - "What's the deadline?" (if not documented)
   - "What phase are you in? How far along is the work?"
   - "Anything the existing docs don't capture that I should know?"

3. **Search solutions library** for relevant prior work (same as new-project)

### Step 3: Reorganize Files

Based on scan results and user approval, reorganize into CKW structure:

```
project-root/
├── CLAUDE.md              ← Augmented with CKW project context
├── SYSTEM.md              ← Generated (or linked from ~/.ckw/)
├── STATE.md               ← Generated with current progress
├── PROJECT.md             ← Generated from existing docs + interview
├── REQUIREMENTS.md        ← Extracted from existing planning docs
├── ROADMAP.md             ← Generated with current phase status
│
├── .planning/
│   ├── research/          ← Any existing research docs moved here
│   └── phases/            ← Phase structure created
│
├── drafts/                ← Existing drafts moved here
├── reference/             ← Reference materials moved here
│   └── .index/            ← Auto-generated summaries
├── deliverables/          ← Any final outputs moved here
│
├── config/                ← Existing config files
├── playbooks/             ← Existing playbooks
├── corpus/                ← Existing corpus files
│
├── docs/
│   ├── solutions/
│   ├── templates/
│   └── review-criteria/
│
└── todos/                 ← Generated from any existing task lists
```

**Rules for reorganization:**
- NEVER delete existing files — only move them
- ALWAYS ask before moving files that don't have an obvious destination
- Create a `_original_structure.md` file documenting what was where before reorganization
- If a file could belong in multiple places, ask the user
- Preserve any existing git history

### Step 4: Import Reference Materials

For each file moved to `reference/`:
1. Generate a summary (using import-summarizer pattern)
2. Create index entry in `reference/.index/`
3. Note estimated token cost for context loading

### Step 5: Generate CKW Files

Create the same files as `/ckw:new-project` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, CLAUDE.md) but:
- **Pre-populate** from existing documents rather than starting blank
- **Mark current phase** accurately based on what work is already done
- **STATE.md** should reflect actual progress: "Phase 1: 3 of 5 tasks drafted"
- **CLAUDE.md** must be a lightweight index only — no content duplication with PROJECT.md
- **STATE.md** open questions must be tagged P0/P1/P2 by blocking priority
- **ROADMAP.md** should use `Parallel with:` field if phases overlap

### Step 5b: Structured Validation

Present **"5 things I'm most likely wrong about"** — same as `/ckw:new-project` Step 3b. Especially important for adopt-project since you're interpreting existing materials. Cover:
1. How you classified existing files (reference vs. draft vs. deliverable)
2. Which phase the project is currently in
3. What you extracted as requirements vs. what might be notes/discussion
4. Phase boundaries and timeline
5. What you assumed is complete vs. in-progress

### Step 6: Initialize Versioning

**Detect the project location** (same logic as `/ckw:new-project` Step 5):
- **Google Drive / cloud storage:** Skip git; rely on Drive version history + STATE.md timestamps
- **Local filesystem:** Git init (if not already a repo), add all CKW files, commit

### Step 7: Register Project

Add the project to `~/.ckw/config.json` projects registry for path aliases (same as `/ckw:new-project` Step 6).

### Step 8: Next Steps

```
Project adopted! Here's the current state:

📊 Phase 1 (Executive Summary): 2 of 3 tasks drafted
📊 Phase 2 (Competitive Analysis): Not started

Next steps:
  /ckw:progress         See full project status
  /ckw:plan-phase 2     Plan the next phase
  /ckw:review-phase 1   Review existing drafts
```

## Context Loading

**Load:** ~/.ckw/SYSTEM.md, ~/.ckw/config.json, existing CLAUDE.md (if present)
**Scan:** All files in target directory (read headers/metadata, not full content)
**Search:** Shared knowledge repo solutions/ (if configured)

## Error Handling

- If folder doesn't exist, error with clear message
- If folder is empty, suggest using `/ckw:new-project` instead
- If folder already has CKW files (STATE.md, ROADMAP.md), ask: "This already looks like a CKW project. Resume with /ckw:progress?"
- If reorganization would break existing paths (e.g., relative links in docs), warn the user
