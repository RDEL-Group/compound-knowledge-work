# CKW User Guide

CKW (Compound Knowledge Work) helps you plan, draft, review, and deliver knowledge work — RFPs, proposals, strategy docs, training materials, SOPs, client reports — inside Claude Code. It breaks big projects into small tasks, tracks where you are, and remembers what worked so each project goes faster and lands better than the last.

**Before you start:** You need Claude Code. Three things are optional: **pandoc** (only if you want to export drafts to Word, PowerPoint, or PDF), the **`gws` CLI** (only if you want the Google Drive features), and the **Atlassian TWG CLI** (only if you want to pull reference material from Jira or Confluence).

## Starting a Project

Say you've just landed the Northwind Q3 proposal. Three ways to begin:

- **From a brief:** `/ckw:new-project --from-prd path/to/brief.pdf` — CKW reads your document and sets up the project for you.
- **From scratch:** `/ckw:new-project` — CKW interviews you, then builds the structure.
- **Existing folder:** `/ckw:adopt-project` — Already have files scattered around? CKW wraps them into its framework.

Pull in supporting material next: `/ckw:import-reference reference/*.pdf`. If a document lives on Google Drive, use `/ckw:drive import "Northwind brief"` to search, grab, and index it in one step. If your project documents live in Jira or Confluence and you have the Atlassian TWG CLI installed, `/ckw:import-reference --from-jira "Northwind"` (or a specific key like `--from-jira PROJ-42`) pulls them in the same way — and during planning, the researcher will also check Jira and Confluence for prior decisions and related work automatically.

## Planning and Executing

Work happens one phase at a time:

1. **Explore (optional):** `/ckw:brainstorm 1` — Talk through your approach before committing. CKW asks about your audience, your assumptions, and the **stakes** — who sees this and what depends on it. High-stakes phases automatically get a tougher, more skeptical review later. Decisions get saved so the planner honors them.
2. **Check your footing (optional):** `/ckw:confidence` — A plain-language honesty check: what do you actually know versus what are you guessing? Useful before you plan something risky.
3. **Plan:** `/ckw:plan-phase 1` — Breaks the phase into small, doable tasks. It also surfaces relevant patterns from past projects; search those directly anytime with `/ckw:search-solutions competitive analysis`.
4. **Execute:** `/ckw:execute-phase 1` — Drafts content task by task, each with a fresh start so quality stays sharp.

## Reviewing Your Work

Run a quality check once drafts exist: `/ckw:review-phase 1`.

The reviewer checks against your requirements and flags issues by severity — P1 (must fix), P2 (should fix), P3 (nice to fix). P1 issues get automatic revision plans; clear them with `/ckw:execute-phase 1 --revisions`.

## Keeping a Consistent Voice

When several people write for the same clients, drafts can start to sound like different companies. CKW can keep them in one voice.

Your team's writing standards live in a `voice/` folder in the shared knowledge repo. Each teammate's CKW setup must point at that folder's home on their own computer (`~/.ckw/config.json` → `knowledge_repos`; the installer asks for it). To build the standards, run `/ckw:calibrate-voice` and hand over three to five finished documents you're proud of, such as the last Northwind report. You don't describe your style. CKW spots the habits in your writing, then writes a short paragraph in that voice. Tell it what's off and it fixes the rules, not just the paragraph. Nothing is saved until you've seen the whole file and said yes.

After that it runs on its own. Planning picks the right files for each task, drafts follow them without comment, and the reviewer names the exact rule behind anything it flags. `/ckw:compound` shows you each writing lesson before saving it. No `voice/` folder? Nothing changes.

## Sharing for Feedback

To get teammates involved: `/ckw:publish-proof --phase 1` publishes your drafts to Proof, a review space where colleagues can comment. Proof shows what AI wrote versus what a human edited, so everyone sees the provenance. To share the finished files instead, upload straight to Drive with `/ckw:drive upload drafts/proposal.md`.

## Quick Tasks

Need a one-off — a status email, a fast analysis — without setting up a whole project?

`/ckw:quick "Draft a status update email for Northwind"` runs a single task with minimal setup. It works even outside a CKW project. Capture stray ideas for later with `/ckw:add-todo "Add a bilingual version"`.

## Exporting to Share

Drafts are plain markdown. To turn them into polished files (needs pandoc):

- **Word doc:** "Export drafts/proposal.md to docx"
- **Slide deck:** "Export drafts/deck.md to pptx"
- **With branding:** "Export drafts/proposal.md to docx --template reference/templates/brand.docx"

## Handing Off and Picking Up

Stepping away? `/ckw:pause-work` saves what's in flight, any blockers, and the next steps. When you or a teammate return, `/ckw:resume-work` reloads the context and recommends exactly where to start (you can also pass a project alias: `/ckw:resume-work northwind`).

## Capturing What You Learned

This is where CKW compounds. After a phase, run `/ckw:compound` — it interviews you about what worked, files reusable solutions, and promotes the best patterns to your shared knowledge repo. When the whole project wraps, `/ckw:complete-project` runs a full retrospective and close-out.

## How Files Are Organized

Every project keeps a few predictable folders. **`STATE.md`** is the project's status and settings (its frontmatter tracks the current phase). **`.planning/`** holds the phase plans, the per-task plans (`{N}-PLAN.md`), summaries, and review reports. **`drafts/`** is where your actual deliverable content lives. **`reference/.index/`** stores the short summaries of everything you've imported, so plans stay lightweight.

## The Shared Knowledge Repo

Separate from any single project is a shared knowledge repo — a folder (often on Google Drive) holding reusable **solutions, templates, and playbooks**. It's the memory that lets each project stand on the last: when `/ckw:compound` finds a pattern worth keeping, it promotes it here so your next proposal starts ahead of where the last one did.

## Automation and Scripting

Every command accepts **`--headless`**. In this mode it runs start to finish without stopping to ask questions, using sensible defaults — ideal for scripts, scheduled runs, or chaining commands into a pipeline. Side-effecting steps fail closed (for example, `/ckw:publish-proof --headless` won't publish without `--confirm-publish`). For day-to-day interactive work, just leave it off.

## Getting Help

Run `/ckw:help` for the full command list, grouped by workflow stage, with an example for each. Run `/ckw:progress` anytime to see where a project stands and what to do next.
