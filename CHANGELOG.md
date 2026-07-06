# Changelog

All notable changes to Compound Knowledge Work (CKW) will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-04-01

### Added
- Public open-source release under MIT license
- CONTRIBUTING.md with development setup and architecture overview
- CHANGELOG.md (this file)
- GitHub issue templates for bug reports and feature requests

### Changed
- Version bumped from 0.3.0 to 1.0.0
- Repository moved to RDEL-Group organization
- README rewritten for public audience with credits and install instructions
- Contact email updated across plugin metadata

## [0.3.0] - 2026-03-31

### Added
- `/ckw:confidence` command for epistemic honesty checks
- Pipeline/headless mode (`--headless` flag) across all 19 commands
- Stale knowledge detection in compounder agent
- Plugin marketplace support (`.claude-plugin/` metadata)

## [0.2.0] - 2026-03-12

### Added
- Google Workspace integration: `/ckw:drive` command, gws-reader and gws-writer skills
- 3 Python conversion scripts for Google Docs, Sheets, and Slides
- `--from-drive` flag for `/ckw:import-reference`
- `--to-drive` flag for export-document skill
- Proof integration: `/ckw:publish-proof` command, proof-publisher skill
- Stress-test reviewer agent (`ckw-reviewer-stress`)
- Stakes awareness in `/ckw:brainstorm`

### Changed
- Planner and executor agents updated for reference document context loading
- `/ckw:review-phase` updated to optionally invoke stress-test reviewer

### Fixed
- SessionStart hook failing on Windows (unexpanded `~` in the hook path)

## [0.1.0] - 2026-02-26

### Added
- 16 slash commands for full project lifecycle
- 6 specialized agents (scoper, planner, executor, reviewer, compounder, researcher)
- 2 skills (import-summarizer, export-document)
- 3 hooks (context-monitor, statusline, session-init)
- Interactive installer with hook auto-registration
- Anti-rationalization blocks and self-review gates in agent prompts
- Hard gates in brainstorm and plan-phase to prevent design shortcuts
- SessionStart hook for automatic CKW project detection
- Session management: pause-work, resume-work, quick, add-todo
- Shared knowledge repo with solution compounding and promotion
- Knowledge repo template (`knowledge-repo-template/`)
- USER-GUIDE.md with scenario-based guidance
- .gitignore, README, package.json for internal distribution
