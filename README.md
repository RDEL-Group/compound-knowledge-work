# Compound Knowledge Work (CKW)

A Claude Code plugin that helps you plan, draft, review, and deliver knowledge work projects — RFPs, strategy docs, SOPs, training materials, client reports. It breaks big projects into manageable tasks, tracks progress, and remembers what worked so your next project is faster and better.

## Prerequisites

- **Claude Code** (Claude Desktop with CLI access)
- **Node.js 18+** (usually comes with Claude Code)
- **GitHub access** to this repo (you've been invited as a collaborator)

## Install

### Option A: npm Installer (Recommended)

Run this in your terminal:

```bash
npx --yes github:RDEL-Group/compound-knowledge-work
```

The installer sets up everything: commands, agents, skills, hooks, config, and personal preferences. It asks your name, where to install (choose **Global** for all projects), and optionally connects a shared knowledge repo.

**If npx doesn't work**, use the fallback:

```bash
git clone git@github.com:RDEL-Group/compound-knowledge-work.git /tmp/ckw-install && node /tmp/ckw-install/bin/install.js && rm -rf /tmp/ckw-install
```

### Option B: Plugin Marketplace

If you prefer Claude Code's built-in plugin system:

```
/plugin marketplace add RDEL-Group/compound-knowledge-work
/plugin install compound-knowledge-work
```

This installs commands, agents, and skills automatically. **However**, CKW's hooks (auto-detection of project directories on session start) need one extra step:

```bash
npx --yes github:RDEL-Group/compound-knowledge-work
```

The installer detects that the plugin is already present and only registers the SessionStart hook in `settings.json` + creates your `~/.ckw/config.json`.

## Update

Run the same install command again. Your config and project registry are preserved — only the plugin files get updated.

## Quick Start

**Start a new project:**
Open Claude Code in a project folder and run `/ckw:new-project`. CKW interviews you about the project and sets up the structure. If you have a brief or PRD, use `/ckw:new-project --from-prd path/to/brief.pdf`.

**Do something quick:**
Don't need a full project? Run `/ckw:quick "Draft an email to the client about the Q2 timeline"` — CKW drafts it with quality checks and saves the output.

**Pick up where someone left off:**
Run `/ckw:resume-work` to see what was in progress, any blockers, and exactly where to start.

## Connecting the Shared Knowledge Repo

Your team has a shared folder on Google Drive for cross-project learnings. During install, when asked for the knowledge repo path, enter the full path to the shared folder:

```
/Users/yourname/Library/CloudStorage/GoogleDrive-you@company.com/Shared drives/Team/CKW Knowledge Repo
```

You can also add it later by editing `~/.ckw/config.json`:

```json
{
  "knowledge_repos": ["/path/to/shared/knowledge/repo"]
}
```

When you run `/ckw:compound` after completing work, CKW will offer to promote reusable patterns to this shared folder so everyone benefits.

## All Commands

| Command | What it does |
|---------|-------------|
| `/ckw:new-project` | Scope a new project (from scratch or from a PRD) |
| `/ckw:adopt-project` | Import an existing project folder into CKW |
| `/ckw:import-reference` | Add reference documents (PDF, Word, etc.) |
| `/ckw:brainstorm` | Explore ideas before planning a phase |
| `/ckw:plan-phase` | Break a phase into executable tasks |
| `/ckw:confidence` | Check what you know vs. what you're guessing |
| `/ckw:search-solutions` | Find patterns from past projects |
| `/ckw:execute-phase` | Draft content for planned tasks |
| `/ckw:quick` | Quick ad-hoc task without full planning |
| `/ckw:add-todo` | Capture an idea for later |
| `/ckw:review-phase` | Quality review on drafted content |
| `/ckw:publish-proof` | Publish drafts to [Proof](https://proofeditor.ai) for collaborative review with AI provenance |
| `/ckw:drive` | Search, read, import, or upload via Google Drive |
| `/ckw:compound` | Capture what worked for future projects |
| `/ckw:complete-project` | Close out with a full retrospective |
| `/ckw:progress` | See where the project stands |
| `/ckw:pause-work` | Pause and capture handoff context |
| `/ckw:resume-work` | Resume with full context restoration |
| `/ckw:help` | Show all commands with examples |

## Full Documentation

- Run `/ckw:help` inside Claude Code for a grouped command reference with examples
- See `docs/USER-GUIDE.md` for scenario-based guidance

## Troubleshooting

**Commands don't show in the `/` autocomplete dropdown:**
This is a known Claude Code UI caching issue. The commands still work — type them directly (e.g., type `/ckw:help` and press Enter). They'll execute correctly even if they don't appear in the dropdown.

**"No CKW project found" error:**
Make sure you're in a project directory that has a STATE.md file. Start with `/ckw:new-project` or `/ckw:adopt-project` to set one up.

**Installer fails with permission error:**
Make sure you have write access to `~/.claude/`. If you've never used Claude Code custom commands before, the directory might not exist yet — the installer will create it.

**Need help?**
Ask Richard — or run `/ckw:help` for a full command reference.
