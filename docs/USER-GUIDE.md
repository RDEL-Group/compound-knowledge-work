# CKW User Guide

CKW (Compound Knowledge Work) helps you plan, draft, review, and deliver knowledge work projects — RFPs, strategy docs, training materials, SOPs, client reports — using Claude Code. It breaks big projects into manageable tasks, tracks what you've done, and remembers what worked so your next project is faster and better.

## Starting a Project

Have a new project to work on? Two ways to start:

- **From a PRD or brief:** `/ckw:new-project --from-prd path/to/brief.pdf` — CKW reads your document and sets up the project structure automatically.
- **From scratch:** `/ckw:new-project` — CKW interviews you about the project, then creates the structure.
- **Existing folder:** `/ckw:adopt-project` — Already have files? CKW wraps them into its framework.

After setup, import any reference materials: `/ckw:import-reference reference/*.pdf`

## Planning and Executing

For each phase of your project:

1. **Explore first (optional):** `/ckw:brainstorm 1` — Talk through your approach before committing. Captures decisions that the planner will honor.
2. **Plan:** `/ckw:plan-phase 1` — Breaks the phase into specific, executable tasks with context budgets.
3. **Execute:** `/ckw:execute-phase 1` — Drafts content task by task, each with fresh context so quality stays high.

## Reviewing Your Work

After drafting, run a quality check: `/ckw:review-phase 1`

The reviewer checks against your requirements and flags issues by severity (P1 = must fix, P2 = should fix, P3 = nice to fix). P1 issues get automatic revision plans — fix them with `/ckw:execute-phase 1 --revisions`.

## Picking Up Someone's Project

If a teammate paused their work with `/ckw:pause-work`, you can pick up where they left off:

`/ckw:resume-work` — Shows you what was in flight, any blockers, and recommends exactly where to start. You can also use an alias: `/ckw:resume-work satellite`.

## Quick Tasks

Need to draft an email or do a quick analysis without setting up a full project?

`/ckw:quick "Draft a status update email for the client"` — Runs the executor on a single task with minimal setup. Works even outside a CKW project.

Capture ideas for later with `/ckw:add-todo "Look into bilingual version"`.

## Exporting to Share

Your drafts are in markdown. To share with clients or stakeholders:

- **Word doc:** "Export drafts/report.md to docx"
- **Slide deck:** "Export drafts/deck.md to pptx"
- **With branding:** "Export drafts/report.md to docx --template reference/templates/brand.docx"

## Capturing What You Learned

After completing a phase, capture what worked: `/ckw:compound` — CKW interviews you about the approach, files reusable solutions, and makes them searchable for future projects.

When the whole project is done: `/ckw:complete-project` — Full retrospective, project summary, and knowledge capture.

Search past learnings anytime: `/ckw:search-solutions competitive analysis`

## Getting Help

Run `/ckw:help` for a full command reference with examples, grouped by workflow stage.

Run `/ckw:progress` anytime to see where your project stands and what to do next.
