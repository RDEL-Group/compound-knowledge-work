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

2. Create your CKW config (non-interactive):
   ```bash
   node bin/install.js --defaults
   ```
   This creates `~/.ckw/config.json` and `~/.ckw/SYSTEM.md`.

3. For live development, symlink the source into `~/.claude/` so edits are instant.
   Remove any previously copied targets first — otherwise `ln -s` nests a link
   *inside* the copied directory:
   ```bash
   mkdir -p ~/.claude/commands ~/.claude/agents ~/.claude/skills ~/.claude/hooks

   # commands are namespaced under ckw/ — safe to replace wholesale
   rm -rf ~/.claude/commands/ckw
   ln -sfn "$(pwd)/commands/ckw" ~/.claude/commands/ckw

   # agents: CKW files are ckw-*.md
   rm -f ~/.claude/agents/ckw-*.md
   ln -sf "$(pwd)/agents/ckw-"*.md ~/.claude/agents/

   # skills: one directory each (globbed, so new skills are picked up)
   for d in "$(pwd)"/skills/*/; do n=$(basename "$d"); rm -rf ~/.claude/skills/"$n"; ln -sfn "$d" ~/.claude/skills/"$n"; done

   # hooks
   rm -f ~/.claude/hooks/ckw-session-init.js ~/.claude/hooks/hooks.json
   ln -sf "$(pwd)/hooks/ckw-session-init.js" "$(pwd)/hooks/hooks.json" ~/.claude/hooks/
   ```
   Now edits to source files are immediately live via `/ckw:` commands.

4. Test by opening Claude Code in any project folder and running `/ckw:help`.

## Architecture

CKW is a zero-dependency Claude Code plugin. Everything is markdown and vanilla Node.js.

| Component | Location | Format |
|-----------|----------|--------|
| 20 slash commands | `commands/ckw/` | Markdown (`.md`) |
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
- Python scripts in skills use the standard library. The one exception is import-summarizer's optional python-docx fallback for `.docx`, used only if both pandoc and textutil are unavailable — never required.
- Keep things readable. Comments where the logic isn't obvious, not everywhere.

## Releasing

`package.json` is the canonical version. Bump every version site at once with the version tool (stdlib only, no deps):

```bash
node scripts/bump-version.js 1.0.1     # sets package.json, plugin.json,
                                       # marketplace.json, install.js, and the README badge
node scripts/bump-version.js --check   # CI gate — fails if any site disagrees
```

Then update `CHANGELOG.md`, commit, and (maintainers) tag + push.

CI (`.github/workflows/smoke.yml`) runs on every push and PR: version consistency, manifest + hook-wiring + command-coverage checks, the installer smoke test on Linux/macOS/Windows, and the document-conversion fixtures on macOS. Run the static checks locally with `node scripts/ci-checks.js` and `node scripts/ci-install-test.js`.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
