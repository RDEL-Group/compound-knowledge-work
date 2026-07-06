# Contributing to CKW

Thanks for your interest in Compound Knowledge Work. Here's how to get involved.

## Ways to Contribute

- **Bug reports** — found a command that errors or produces wrong output? Open an issue.
- **Feature requests** — have an idea for a new command, agent behavior, or workflow? Open an issue.
- **Documentation** — improvements to the README, USER-GUIDE, or inline help are always welcome.
- **Solution templates** — battle-tested patterns for specific work types (RFPs, SOPs, training) that could live in `knowledge-repo-template/`.
- **Code** — fixes and enhancements via pull request.

## Development Setup

CKW is designed for live editing via symlinks. No build step, no bundler.

1. Clone the repo:
   ```bash
   git clone https://github.com/RDEL-Group/compound-knowledge-work.git
   cd compound-knowledge-work
   ```

2. Run the installer in global mode:
   ```bash
   node bin/install.js
   ```
   Choose **Global** when prompted. This copies files to `~/.claude/`.

3. For live development, symlink instead of copying:
   ```bash
   ln -sf "$(pwd)/commands/ckw" ~/.claude/commands/ckw
   ln -sf "$(pwd)/agents"/*.md ~/.claude/agents/
   # Repeat for skills/ and hooks/ as needed
   ```
   Now edits to source files are immediately available via `/ckw:` commands.

4. Test by opening Claude Code in any project folder and running `/ckw:help`.

## Architecture

CKW is a zero-dependency Claude Code plugin. Everything is markdown and vanilla Node.js.

| Component | Location | Format |
|-----------|----------|--------|
| 19 slash commands | `commands/ckw/` | Markdown (`.md`) |
| 7 agents | `agents/` | Markdown agent definitions |
| 5 skills | `skills/*/SKILL.md` | SKILL.md + optional scripts |
| 1 hook | `hooks/` | JavaScript (`.js`) + `hooks.json` manifest |
| Installer | `bin/install.js` | Node.js (stdlib only) |

**Key design principle:** zero npm dependencies. The installer, hooks, and skill scripts use only Node.js built-ins and system tools (bash, python3, pandoc, curl). This keeps installation instant and avoids supply-chain risk.

## Pull Request Process

1. Fork the repo and create a branch from `main`.
2. Make your changes.
3. Test with a real CKW project — create one with `/ckw:new-project` and run through the workflow.
4. Submit a PR with a clear description of what changed and how you tested it.

Keep PRs focused. One feature or fix per PR is easier to review than a bundle.

## What Not to Submit

- **npm dependencies** — CKW is deliberately zero-dependency. If your change requires a package, discuss it in an issue first.
- **Hardcoded paths** — all paths should be relative to the project root or read from `~/.ckw/config.json`.
- **Plugin metadata changes** — modifications to `.claude-plugin/` should be discussed in an issue.

## Code Style

- Markdown for commands, agents, and skills — follow existing patterns.
- JavaScript for hooks and the installer — vanilla Node.js, no transpilation.
- Python scripts in skills use stdlib only (no pip dependencies).
- Keep things readable. Comments where the logic isn't obvious, not everywhere.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
