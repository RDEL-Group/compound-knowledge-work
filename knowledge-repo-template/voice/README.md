# Voice, Style, and Audience

This folder is how your team writes in one voice. It holds three kinds of file. Each answers a different question.

| File | Answers | How many |
|------|---------|----------|
| `VOICE.md` | How do our sentences sound? | One per organization |
| `STYLE-*.md` | What must this kind of document prove, and how is it built? | One per document type. Starts with three: reporting-runbook, strategy-doc, rfp |
| `AUDIENCE-*.md` | Who reads it, and what do they already know? | One per reader type. Starts with two: current-client, prospect |

## Which file does a rule belong in?

> **Classification test:** a rule that changes wording, sentence construction, or tone goes in VOICE; a rule that changes the claim, support, organization, or readiness standard goes in STYLE; reader knowledge goes in AUDIENCE. Split mixed guidance without duplicating it.

Examples:
- "Open with the number, then explain it" changes sentence construction. It goes in VOICE.
- "Label every metric with its attribution source" changes the support a claim carries. It goes in STYLE.
- "This reader compares numbers across reports" is reader knowledge. It goes in AUDIENCE.

One exception to read twice: MPL's de-AI rules (no em-dashes and the rest) sit in the STYLE files even though some of them change wording. They are pass/fail release checks that a command can verify, not matters of taste.

## Setup

1. If you started from this template, the `voice/` folder is already in your shared knowledge repo. If your repo already exists, copy this folder into its root.
2. Run `/ckw:calibrate-voice`. Give it 3–5 real past deliverables that your team delivered and was happy with. It proposes voice rules with excerpts as evidence. You confirm each one before it is saved.
3. Fill in the STYLE and AUDIENCE files by hand. To list every gap that is left:

```bash
grep -rn "SLOT:" voice/ --exclude=README.md
```

4. For one project only, add a `voice/` folder inside that project and put in it only the rules that differ.

## Rules of the road

- **Slots.** Anything written `[SLOT: ...]` is a gap to fill. An unfilled slot means "unknown". It is never a rule. The `<!-- ... -->` notes are instructions for whoever fills the file: delete each once its section is done.
- **Project overrides win.** If a project has its own `voice/` folder, its rules win over the org files wherever they disagree. Rules the project file does not mention still come from the org file.
- **Authority.** For client-facing deliverables, VOICE outranks your personal `~/.ckw/SYSTEM.md`. For internal work, SYSTEM.md wins. The full order is in the plugin's `docs/context-contract.md`.
- **Examples are evidence, not a phrase bank.** Every voice rule carries a short sourced excerpt. Never copy one into a draft.
- **Confirmed lessons.** Every file ends with `## Confirmed lessons`. `/ckw:compound` adds to it only after you confirm. Do not turn one-off choices into permanent rules.

## Credit

The three-file model, the classification test, and the Confirmed-lessons habit are adapted from compound-writing by Katie Parrott and Every (MIT license). The STYLE base rules come from MPL's de-AI style pass (solution: `de-ai-style-pass-client-docs.md`).
