# Context Contract: Which Writing Rules Win

This page says which writing guidance CKW loads for a task, and which rule wins when two rules disagree. The planner, executor, and reviewer all follow it.

## 1. Authority order

Highest first:

1. Explicit user instruction in the session
2. Phase CONTEXT.md locked decisions
3. Project files (PROJECT.md, REQUIREMENTS.md)
4. AUDIENCE-*.md
5. STYLE-*.md
6. VOICE.md
7. `~/.ckw/SYSTEM.md` personal preferences
8. Solutions library
9. Plugin defaults

Higher authority wins. Never merge incompatible rules into a vague compromise.

For example, if you tell CKW in the session to keep one draft more casual, that instruction beats what VOICE.md says for that task. Only that task; VOICE.md itself is unchanged.

A tone word in a higher file is not a rule. If CONTEXT.md or PROJECT.md says "formal" or "conversational", that does not cancel a VOICE.md rule; it only decides what VOICE.md leaves open. To override a voice or style rule for a project, name the behavior (for example, "no sentence fragments in this proposal") or put the rule in the project's own `voice/` folder. The task plan passes these sources on and adds no authority of its own. An instruction the user gave in this session, passed on in the task plan or spawn message, keeps its rank even when it is a tone word.

## 2. SYSTEM.md vs VOICE.md

SYSTEM.md is one person's preferences. VOICE.md is the organization's voice. This is the one place the order above changes (confirmed 2026-10-25):

- **Client-facing deliverables** (anything a client or prospect will read): VOICE.md outranks SYSTEM.md, as listed above.
- **Internal or personal work:** SYSTEM.md outranks VOICE.md.

The two only compete where they conflict. Where they don't, both apply. For example, a personal habit of casual phrasing belongs in your own working notes, but it does not carry into a client report.

## 3. The classification test

Use this to decide which file a rule belongs in, and to route any new lesson:

a rule that changes wording, sentence construction, or tone goes in VOICE; a rule that changes the claim, support, organization, or readiness standard goes in STYLE; reader knowledge goes in AUDIENCE. Split mixed guidance without duplicating it.

## 4. Where files live

- **Org-level files** (VOICE.md, STYLE-*.md, AUDIENCE-*.md) live in the shared knowledge repo's `voice/` folder.
- **A project may carry overrides** in its own `voice/` folder.
- **Project overrides win** over org files at the same level. A project's STYLE-rfp.md beats the org's STYLE-rfp.md wherever the two disagree; rules the project file does not mention still come from the org file.

## 5. Loading budget

Voice, style (one document type), and audience (one segment) together stay within about 4K tokens (roughly 3,000 words) per task. Load only the one STYLE file and one AUDIENCE file the task needs. The planner lists each file in the task plan's Context to Load, with its token cost. This keeps room for the task's own references and working space.

## 6. Examples are evidence

Voice and style files include short, sourced excerpts to justify their rules. Treat an excerpt as proof the rule exists, never as a reusable phrase. Do not copy examples into drafts. Follow the pattern an excerpt shows, in new words.

---

*This model is adapted from Every's compound-writing plugin by Katie Parrott (MIT license).*
