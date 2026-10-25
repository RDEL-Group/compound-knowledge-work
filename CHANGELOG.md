# Changelog

All notable changes to Compound Knowledge Work (CKW) will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `--from-jira` on `/ckw:import-reference`: pull Jira workitems and Confluence pages in as indexed references via the Atlassian TWG CLI's own skills (optional integration — nothing changes if the CLI isn't installed). Headless mode requires a specific key or URL.
- Researcher agent checks internal sources before the web when the TWG CLI is installed (Jira/Confluence prior decisions and related work, read-only), and recommends `--from-jira` imports for substantial sources.
- Optional-integrations section in `/ckw:help`; README and USER-GUIDE coverage for the Jira/Confluence integration.

### Changed
- Agents declare `model:` in frontmatter: executor runs on `sonnet`; scoper, planner, researcher, reviewer, stress reviewer, and compounder on `opus`.

## [1.0.1] - 2026-07-06

Outside-adopter hardening sprint — fixes the install, import, review, and Proof
paths a new user hits first, adds CI, and sweeps doc integrity. No breaking changes.

### Added
- Plugin-native `hooks/hooks.json` so marketplace installs deliver the SessionStart hook with no extra step; `displayName` in plugin.json.
- `--defaults` non-interactive flag for `bin/install.js` (CI and scripted installs).
- CI smoke workflow (`.github/workflows/smoke.yml`): version consistency, manifest/hook/command-coverage checks, cross-platform installer test, and document-conversion tests.
- `scripts/bump-version.js` (single version source), `scripts/ci-checks.js`, `scripts/ci-install-test.js`, and `tests/fixtures/`.
- Reviewer grounding vocabulary (Grounded / Assertable / Unsupported-critical) plus Quote + Severity columns and count frontmatter in review reports.
- `--confirm-publish` flag and owner-secret persistence (`.proof-secrets.md`) for Proof publishing.

### Changed
- Single cross-platform `ckw-session-init.js` hook, with the status vocabulary the commands actually write.
- Import pipeline is Read-tool-first: PDFs use Claude's native Read tool; `.docx/.pptx/.html/.rtf` go through a hardened `convert_document.sh`.
- Skill scripts use skill-relative paths (work under marketplace installs); Google Drive uploads always set `supportsAllDrives`; proof-publisher uses one safe temp-file JSON payload pattern.
- Reviewer now loads `reference/.index/` summaries so its evidence check is possible; review-report format aligned with what publish-proof parses.
- README Option B is a genuine one-step marketplace install; `--headless` documented as a first-class feature; OS-support statement added; install references use the `github:` form.
- Regenerated USER-GUIDE against the full 19-command surface; help.md command count is enumerated at runtime.

### Fixed
- Default project-local install registered a SessionStart hook at a path it never populated — the hook command now derives from the chosen install directory.
- `convert_document.sh`: PDFs/PPTX no longer routed through `textutil` (which returned silent garbage / empty output); output is verified non-empty; stderr is surfaced; extensions match case-insensitively; the python-docx fallback is no longer vulnerable to code injection via an apostrophe in the filename.
- Installer config handling: `try/catch` around the config parse, guarded `knowledge_repos`, and `user` is merged instead of clobbered.
- Reviewer Check 4 contradiction (verify-from-references vs. don't-load-references) and its P1/P2 severity conflict.
- Ghost `/ckw:discuss-phase` references; RFPbot vestiges in the executor; GSD and CoworkPowers credit links; CHANGELOG command math; `drive.md` duplicate step numbers and missing file IDs; and assorted verified inconsistencies.

### Removed
- Two dead hooks (`ckw-context-monitor.js`, `ckw-statusline.js`) that nothing registered and that used an invalid schema.
- The internal "Satellite" codename from all shipped examples (replaced with a neutral "Northwind" example).

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
