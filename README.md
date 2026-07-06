# Compound Knowledge Work (CKW)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](./CHANGELOG.md)

A Claude Code plugin for knowledge work. CKW breaks complex projects — RFPs, proposals, SOPs, training materials, strategy docs, client reports — into executable phases, drafts them with consistent quality, and remembers what worked so your next project is faster and better than the last.

## What CKW Does

**Breaks big projects into executable tasks.** Start from a brief, PRD, or blank slate. CKW interviews you about the project, organizes it into phases, and breaks each phase into atomic tasks with context budgets — so nothing gets lost as the work scales.

**Maintains quality at scale.** Every draft goes through a reviewer agent that classifies issues by severity (P1/P2/P3). High-stakes work gets a stress-test reviewer that attacks from hostile perspectives. A confidence check tells you what's solid vs. what's a guess.

**Compounds what works.** After each project, CKW captures reusable patterns — what structure worked, what reviewers caught, what the client actually valued. These solutions surface automatically in future projects, so your next one starts ahead of the last.

**Handles the logistics.** Pause and resume with full handoff context. Import reference documents with token budgets. Export to Word, PowerPoint, or PDF. Search and read from Google Drive. Publish to Proof for collaborative review with AI provenance tracking.

## Quick Demo

```
/ckw:new-project --from-prd brief.pdf    # Scope from a brief or PRD
/ckw:brainstorm                           # Explore approach before committing
/ckw:plan-phase 1                         # Break Phase 1 into tasks
/ckw:execute-phase 1                      # Draft content
/ckw:review-phase 1                       # Quality review
/ckw:compound                             # Capture what worked
```

## Install

### Prerequisites

- [Claude Code](https://claude.ai/code) (CLI, desktop app, or IDE extension)
- Node.js 18+
- **OS:** macOS or Linux fully supported. Windows works for the core markdown workflow; the optional document-conversion and Google Drive scripts assume a Unix-like shell (WSL recommended).

### Option A: npx Installer (Recommended)

```bash
npx --yes github:RDEL-Group/compound-knowledge-work
```

The installer sets up everything: commands, agents, skills, hooks, and config. It asks your name, where to install (choose **Global** for all projects), and optionally connects a shared knowledge repo.

**If npx doesn't work**, use the fallback:

```bash
git clone https://github.com/RDEL-Group/compound-knowledge-work.git /tmp/ckw-install && node /tmp/ckw-install/bin/install.js && rm -rf /tmp/ckw-install
```

### Option B: Plugin Marketplace

```
/plugin marketplace add RDEL-Group/compound-knowledge-work
/plugin install compound-knowledge-work
```

One step — this installs commands, agents, skills, and the SessionStart hook (project auto-detection), which ships in the plugin's bundled `hooks/hooks.json`.

To connect a shared team knowledge repo (optional), add its path to `~/.ckw/config.json` under `knowledge_repos` (see [Shared Knowledge Repo](#shared-knowledge-repo)), or run the npx installer once to set it up interactively.

### Update

Run the same install command again. Your config and project registry are preserved — only the plugin files get updated.

## All Commands

| Stage | Command | What it does |
|-------|---------|--------------|
| **Start** | `/ckw:new-project` | Scope a new project (from scratch or from a PRD) |
| | `/ckw:adopt-project` | Import an existing project folder into CKW |
| | `/ckw:import-reference` | Add reference documents (PDF, Word, etc.) |
| **Plan** | `/ckw:brainstorm` | Explore ideas before planning a phase |
| | `/ckw:confidence` | Check what you know vs. what you're guessing |
| | `/ckw:plan-phase` | Break a phase into executable tasks |
| | `/ckw:search-solutions` | Find patterns from past projects |
| **Execute** | `/ckw:execute-phase` | Draft content for planned tasks |
| | `/ckw:quick` | Quick ad-hoc task without full planning |
| **Review** | `/ckw:review-phase` | Quality review on drafted content |
| **Share** | `/ckw:publish-proof` | Publish to [Proof](https://proofeditor.ai) for collaborative review with AI provenance |
| | `/ckw:drive` | Search, read, import, or upload via Google Drive |
| **Learn** | `/ckw:compound` | Capture what worked for future projects |
| | `/ckw:complete-project` | Close out with a full retrospective |
| **Track** | `/ckw:progress` | See where the project stands |
| | `/ckw:add-todo` | Capture an idea for later |
| | `/ckw:pause-work` | Pause and capture handoff context |
| | `/ckw:resume-work` | Resume with full context restoration |
| | `/ckw:help` | Show all commands with examples |

## Headless / Pipeline Mode

Every command accepts `--headless`: it runs start to finish without interactive prompts, using sensible defaults. This makes CKW scriptable — chain commands, run them in CI, or schedule overnight jobs. Side-effecting steps fail closed (e.g., `/ckw:publish-proof --headless` refuses to publish without `--confirm-publish`, since publication is public and irreversible). Leave the flag off for normal interactive work.

## Architecture

CKW is a zero-dependency Claude Code plugin. Everything is markdown and vanilla Node.js:

- **19 slash commands** (`commands/ckw/`) — markdown files that define the command interface
- **7 specialized agents** (`agents/`) — scoper, planner, executor, reviewer, stress-test reviewer, compounder, researcher
- **5 skills** (`skills/`) — import/export, Google Workspace, Proof integration
- **1 hook** (`hooks/`) — SessionStart project auto-detection (bundled via `hooks/hooks.json`)

No npm dependencies. No build step. Installation is instant.

## Optional Integrations

These are not required. CKW works fully without them.

**Google Workspace** — Requires the [`gws` CLI](https://www.npmjs.com/package/@googleworkspace/cli) and `python3`. Enables `/ckw:drive` for searching, reading, and uploading Google Docs, Sheets, and Slides. Also enables `--from-drive` on `/ckw:import-reference` and `--to-drive` on the export skill.

**Proof** — No setup needed. Works with [proofeditor.ai](https://proofeditor.ai) out of the box. Enables `/ckw:publish-proof` for collaborative review with character-level AI provenance tracking.

**Export** — Requires [pandoc](https://pandoc.org/installing.html). Enables markdown-to-Word, PowerPoint, and PDF export with optional branded templates.

## Shared Knowledge Repo

CKW compounds what works across projects through a shared knowledge repo — a folder (typically on Google Drive for team access) that stores reusable patterns, templates, and playbooks.

A starter template is included at `knowledge-repo-template/`. Copy it to your shared location and point CKW to it during install, or add the path later in `~/.ckw/config.json`:

```json
{
  "knowledge_repos": ["/path/to/shared/knowledge/repo"]
}
```

When you run `/ckw:compound`, CKW offers to promote reusable patterns to this shared repo.

## Documentation

- `/ckw:help` inside Claude Code for a grouped command reference with examples
- [`docs/USER-GUIDE.md`](./docs/USER-GUIDE.md) for scenario-based guidance
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) for development setup

## Troubleshooting

**Commands don't show in the `/` autocomplete dropdown:**
This is a known Claude Code UI caching issue. The commands still work — type them directly (e.g., type `/ckw:help` and press Enter).

**"No CKW project found" error:**
Make sure you're in a project directory that has a STATE.md file. Start with `/ckw:new-project` or `/ckw:adopt-project` to set one up.

**Installer fails with permission error:**
Make sure you have write access to `~/.claude/`. The installer creates the directory if it doesn't exist.

**Something else?** [Open an issue](https://github.com/RDEL-Group/compound-knowledge-work/issues).

## Credits

CKW stands on the shoulders of several open-source projects:

| Project | What CKW adopted |
|---------|-----------------|
| [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) (Every, Inc.) | Core knowledge compounding concept |
| [Compound Knowledge Plugin](https://github.com/EveryInc/compound-knowledge-plugin) (Every, Inc.) | Confidence check, pipeline mode, stale knowledge patterns |
| [Superpowers](https://github.com/obra/superpowers) (obra) | Anti-rationalization, self-review gates, hard gates |
| [CoworkPowers](https://github.com/nabeelhyatt/coworkpowers) (nabeelhyatt) | Stakes-based scaling, stress-test review |
| [GSD](https://github.com/gsd-build/get-shit-done) (archived Jun 2026; successor [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core)) | Phased execution, fresh context per task |
| [Proof](https://proofeditor.ai) (Every, Inc.) | AI provenance tracking |

## License

MIT — see [LICENSE](./LICENSE).

## Author

Richard Marginson / [RDEL Group](https://github.com/RDEL-Group)
