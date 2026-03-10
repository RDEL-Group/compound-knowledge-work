# CKW Shared Knowledge Repo

This folder stores cross-project learnings for the team. When you run `/ckw:compound` after completing a project phase, CKW will offer to promote your best patterns here so everyone benefits.

## How It Works

- **solutions/** — Reusable patterns, frameworks, and approaches captured via `/ckw:compound`. Each solution is a markdown file with structured metadata. The `solutions-index.md` file is the master index.
- **templates/** — Document templates for common deliverables (proposals, reports, SOPs, etc.). Drop templates here and reference them via the export skill's `--template` flag.
- **playbooks/** — Step-by-step workflow guides for recurring processes. Created manually or promoted from project retrospectives.

## Adding Solutions

Run `/ckw:compound` after any project phase. CKW interviews you about what worked, then offers to promote patterns to this shared folder. Solutions include:
- What the pattern is and when to use it
- Confidence level (how well-tested it is)
- Tags for searchability
- Source project and date

## Searching Solutions

Run `/ckw:search-solutions [query]` from any CKW project to find relevant patterns. You can filter by type, tags, industry, or confidence level.

## Folder Setup

Make sure each teammate's CKW config points to this folder. During installation, provide this path when asked for the shared knowledge repo. Or edit `~/.ckw/config.json`:

```json
{
  "knowledge_repos": ["/path/to/this/folder"]
}
```
