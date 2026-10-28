---
description: Build or refresh your team's voice file (VOICE.md) from real writing samples. Conversational. You show Claude finished work, Claude works out the patterns, and you react to a short paragraph written in that voice.
---

# /ckw:calibrate-voice — Teach CKW How Your Team Writes

## Purpose
Build or refresh the org-level VOICE.md from 3–5 real past deliverables. You don't describe your style. You show finished work, Claude works out the repeatable sentence-level habits, then writes a short paragraph in that voice for you to react to. Nothing is saved until you've seen the whole file and said yes.

## Usage
```
/ckw:calibrate-voice [--refresh] [--for <writer-or-org>]
```

- `--refresh`: Update an existing VOICE.md from newer samples. Claude starts from the current file and proposes changes (additions, edits, removals) instead of starting over.
- `--for <writer-or-org>`: Whose writing the samples come from, such as a team name or one writer. Defaults to the whole organization. It labels the calibration log. It does not create a separate file (personal voice files are not supported yet). Samples from one writer still build the shared org file, so Step 5 asks whether that writer's habits should become everyone's.

## What This Command Does

This is a **conversational command**: no agent spawn. Claude stays in the session, reads your samples, and works with you. The output is VOICE.md in exactly the structure of the template (`knowledge-repo-template/voice/VOICE.md`).

### Setup: Find the Files

1. **Voice folder:** `~/.ckw/config.json` → `knowledge_repos[0]` + `/voice/`. If the project has its own `voice/` folder with a VOICE.md, ask whether to calibrate the org file (the default) or this project's override (`docs/context-contract.md`, section 4. Where files live).
2. **Mode:** Read the VOICE.md there.
   - No Sentence behavior, Signature Moves, or Punctuation rows filled in: **first run**.
   - Some rows filled in: **refresh**. If `--refresh` wasn't passed, ask: "There's already a voice file at [path], last calibrated [date from the calibration log]. Refresh it from new samples, or leave it alone?"
   - `--refresh` passed but nothing filled in: say there's nothing to refresh yet and run a first calibration.
3. **Project (optional):** If you're inside a CKW project, skim PROJECT.md to see what kinds of documents the team ships, so you ask for the right samples. No project is required.

### Step 1: Ask for Samples, Not Rules

Tell the user:

```
Let's build your voice file from real writing. I won't ask you to describe
your style. Most people can't, and what they say rarely matches what they
actually write.

Instead, send me 3 to 5 finished deliverables of the kind your team really
ships: a report that went to a client, an RFP response, a strategy doc.
Paste the text, give me file paths, or share Google Doc links.

If one of them is the one you're proudest of, or the one you edited
yourself until it read right, tell me which. I'll use it as the reference.
```

- Ask for the actual artifact, not adjacent material. Slack messages, emails, and "writing that sounds like us" teach the wrong habits.
- Ask whether a person edited each one. An unedited AI draft teaches CKW the AI's habits, not yours.
- Ask who wrote or edited each one. For the org file, samples from two or more writers are better. A pattern that shows up across writers is the team's voice; a pattern only one writer shows is that writer's habit until the team agrees otherwise.
- Fewer than 3 samples: follow the warning under Error Handling before going on.
- Read Google Docs through `/ckw:drive`. Convert .docx and .pdf with the import-summarizer skill. If a sample can't be read, say which one and ask for pasted text.

Once samples are in, ask these **negative-space probes**, one at a time:
- "Is there one of these, or an older one, that turned out bad or that you had to rewrite? What was wrong with it?"
- "Think of something you cut out of one of these. What was it, and why did it go?"
- "Is anything in these samples not how you'd want the team to write?" (This separates personal or one-client habits from portable voice.)

**Never ask** "what's your tone?" or "how would you describe your voice?" If the writer offers adjectives ("friendly but professional"), note them as hints to look for in the samples. They are not rules.

**Refresh:** ask for samples written since the last calibration, and ask: "Has a recent CKW draft sounded off? What did it do?"

### Step 2: Derive Privately

Read the samples closely. Do not show a rule list yet. Work through them in private:

- **Look for line-level behavior.** How sentences open and gather their parts, how they pivot, how they state a limit or a doubt, how they end, what they never do, and punctuation habits. These map to the template's Sentence behavior, Signature Moves, and Punctuation sections.
- **Keep a pattern only if** it recurs in at least two different samples, or the writer explicitly confirmed it. Everything else is out. If a pattern shows up in one sample only, either drop it or ask once: "In [document] you open every section with the number. Is that always how you do it?"
- **Every rule is an observable behavior with a sourced excerpt:** a short quote plus the document and section. No excerpt, no rule. Adjective-only guidance ("warm", "professional") gets translated into something a reader could check on the page, or cut.
- **Separate portable voice from specific habits.** Route each finding with the classification test (`docs/context-contract.md`, section 3. The classification test): "a rule that changes wording, sentence construction, or tone goes in VOICE; a rule that changes the claim, support, organization, or readiness standard goes in STYLE; reader knowledge goes in AUDIENCE. Split mixed guidance without duplicating it." STYLE rules go in the file for that document type (STYLE-reporting-runbook.md, STYLE-strategy-doc.md, STYLE-rfp.md). AUDIENCE findings go in AUDIENCE-current-client.md or AUDIENCE-prospect.md. A habit that belongs to one client or one publication stays out. For anything that looks like one person's quirk, ask: "Would you want everyone on the team to write this way?"
- **Aim for a usable first set,** about 15–30 rules in all, counting rules routed to STYLE and AUDIENCE. Stop there. A short, accurate file beats a long one that guesses.
- **Leave a gap rather than guess.** If the samples don't support a row, leave its gap marked with SLOT. Gaps can be filled in a later refresh.
- **Refresh:** compare against the current file. Mark which rules the new samples still show, which they contradict (ask whether the voice changed or the old rule was wrong), and what's new. Never drop a rule silently.

### Step 3: Offer the Seed (First Run)

On a first run, if `AI-WRITING-RULES.md` exists in the project root (or the user points at one), offer it:

```
I found AI-WRITING-RULES.md, your existing writing rules. Want me to fold
it in? I'll treat it as a starting point, not as law. I'll check each piece
against your samples, and you decide what stays.
```

If yes, absorb it like this:

- **Voice patterns** (the section of personal voice patterns; section 9 in the original file) become candidate rows for VOICE.md. If a pattern appears in the samples, keep it with an excerpt from the samples. If it appears nowhere, show it to the writer: "This is in your rules file but I can't find it in these samples. Keep it for the team voice, or was it just for that one piece?" Keep it only on an explicit yes, citing the rules file as the source. Patterns written for one channel (a LinkedIn post, a launch post) or for one person stay out of the org voice unless the writer confirms they fit client documents.
- **Everything else in the file** (banned words, punctuation limits, structure advice, concrete-language rules) goes through the classification test:
  - Sentence-level habits (varying sentence length, fragments, "And" or "But" openers, semicolon and exclamation limits) go to VOICE, only with sample support or the writer's yes.
  - Structure advice (open with the friction, end by extending the idea, one big idea per piece) changes organization, so it goes to the matching STYLE file. Say it was written for posts and may not fit a report.
  - Word and phrase lists (buzzwords, filler transitions, hedges, cliché openers) are release checks, so they go to the STYLE files, the way the template treats the dash ban.
  - Mixed guidance is split, not copied into two places.
- A seeded rule with no excerpt in either the samples or the rules file stays out. The template's ground rule applies: no excerpt, no rule.
- **Word lists run last.** In any checking sequence you write, claims and support come first, then structure, then sentence behavior, and the word blacklist comes last. Lists catch the symptom. A sentence pattern or an over-tidy ending is usually the cause.
- Leave AI-WRITING-RULES.md itself untouched.

Skip this step on a refresh unless the user asks for it.

### Step 4: Validate by Output

Do not ask "do these rules look right?" People say yes to anything that sounds reasonable. Show output instead.

1. Pick one real excerpt (4–6 sentences) from the reference sample.
2. Write a short paragraph that says what that excerpt says, in the derived voice (including any seeded rules). Use only facts already in the excerpt. Don't invent numbers, names, or claims.
3. Show the real excerpt first, then yours:

```
Here's your real paragraph from [document, section]. Below it is what I
wrote using the rules I found. Which one sounds more like you, and what's
off in mine?
```

4. **Iterate the rules, not the draft.** When the writer flags something, find the rule that should have caught it and edit it, or add the rule that was missing. Then rewrite the paragraph from the rules. Never fix the paragraph by hand and move on: a hand-fixed draft helps once, a fixed rule helps every time.
5. When they say "this sounds AI" or "this isn't us", ask what makes it feel that way before adding a banned word. Look for the sentence pattern first. The word is usually only the symptom.
6. Expect two or three rounds. If it still isn't landing after three, the samples probably aren't enough. Say so and go back to Step 1 for more, rather than guessing.

When the writer's reaction contradicts what the samples show, the reaction wins. Record it in the rule, for example "writer changed this from the samples".

### Step 5: Confirm Before Saving

<HARD-GATE>
STOP before writing any file. Ask yourself:
- Has the writer seen the full proposed VOICE.md (not a summary) and explicitly approved it?
- Does every rule carry an excerpt with its document and section?
- Is every unsupported row still a gap, with nothing filled by guess?
- On a refresh, has the writer seen exactly what was added, changed, and removed?
- Have you checked every excerpt and sample name for client-confidential details (client names, budgets, figures that aren't public)? The file goes to a folder the whole team can read. Offer neutral labels, such as "Client A", and keep the sentence's shape intact.
- Calibrating the org file: does the writer know this file will shape every teammate's client-facing drafts? If every sample came from one writer, have they confirmed these habits should be the team's, not only theirs?
If any answer is no, continue the conversation. Do NOT save.
</HARD-GATE>

Show the full proposed file, then ask:

```
Here's the full VOICE.md I'd save to [path]:

[the whole file]

[N] rules come from patterns in your samples, and you confirmed [N] of them
directly. [N] rows are left as gaps because the samples didn't show enough.

I'd also add these to your STYLE and AUDIENCE files: [list, with the file
name and the rule for each].

Save VOICE.md? Once that's done, we'll go through the STYLE and AUDIENCE
additions separately.
```

**Match the template exactly.** Same sections, same order, same table columns. Keep the Ground rules text and the first comment (the classification test) word for word. Delete each other comment once its section is filled. Add rows where the template invites it.
- **Register reference:** the template ships this field as a SLOT. Ask which sample should be the register reference (one the team delivered and edited by hand until it read right), unless the writer already picked one. If the reference isn't among the samples, ask for a short excerpt for its sourced example, or leave that gap open.
- **Confirmed lessons:** leave this section exactly as it is. It holds lessons the writer already confirmed through other work.
- **Calibration log:** append one line as an HTML comment at the very end of the file, so the section structure stays identical. On a refresh, add a new line and keep the old ones:
  `<!-- Calibration log: [today's date], [first run or refresh], for: [writer-or-org], writers: [how many people wrote the samples], samples: [document names and types, no content], seeded from AI-WRITING-RULES.md: [yes/no] -->`
- **Where it goes:** `voice/VOICE.md` in the knowledge repo (or the project's own `voice/` folder if that's what was chosen). Never write silently, never overwrite without showing the changes first.
- **STYLE and AUDIENCE additions:** after VOICE.md is saved, show each routed rule, get a yes, then add it once, to the file for the document type it came from. Put it under that file's `## Confirmed lessons` heading, with the date and source. If a file has no such heading, add one at the end.
- Don't commit or push. Tell the writer which files changed so they can commit them the way they do other knowledge repo changes.

**After saving, tell the user:**

```
Saved! VOICE.md written to [path]

[N] rules from your samples ([N] confirmed by you)
[N] rules routed to STYLE and AUDIENCE files
[N] gaps still open

To list the gaps, run this in your knowledge repo:
  grep -rn "SLOT:" voice/ --exclude=README.md

From your next /ckw:plan-phase, CKW loads this file for everyone who uses
this knowledge repo, on every client-facing draft. Let the team know it
changed. On client-facing documents it outranks each person's own SYSTEM.md
(docs/context-contract.md, section 2).

Next:
  /ckw:calibrate-voice --refresh   Add newer samples later
  /ckw:help                        See every command
```

## Context Loading Summary

| File | When | Purpose |
|------|------|---------|
| ~/.ckw/config.json | Always | Find the knowledge repo and its `voice/` folder |
| voice/VOICE.md | Always | Current state: first run or refresh |
| Your samples | Step 1 | The only source for rules |
| AI-WRITING-RULES.md | First run, if it exists | Seed material (Step 3) |
| PROJECT.md | If in a project | What the team ships |

## Pipeline Mode

**`--headless` behavior:** Calibration is inherently interactive. It depends on the writer reacting to real drafts. Running it headless would produce a voice file guessed from samples nobody confirmed, and that file would then shape every client-facing draft the team writes.

**If `--headless` is passed:** Return an error with alternatives:
```
Voice calibration requires interactive review and cannot run headless.

Alternatives:
  /ckw:calibrate-voice          Run it in a normal, interactive session
  Edit voice/VOICE.md by hand   Every gap is marked SLOT in square brackets;
                                the file explains each section
```

## Error Handling

- **No knowledge repo configured** → "No shared knowledge repo is set up, so I can't save a team voice file. I can keep it in this project's own voice/ folder instead, where it applies to this project only. Want that? To share it with the team later, add the repo path to ~/.ckw/config.json → knowledge_repos and run this again." Not in a project either: ask where to save.
- **Shared repo path doesn't exist** → "Shared repo path [path] not found. Check ~/.ckw/config.json → knowledge_repos."
- **No VOICE.md in the voice folder** → "There's no voice file to build on yet. Copy the plugin's knowledge-repo-template/voice/ folder into your knowledge repo (its README.md explains how), then run this again." Don't invent a structure.
- **Fewer than 3 samples** → "With [N] sample(s), any pattern I find could be that one document's habit, and rules built from it will over-generalize into everything the team writes. Can you find more? If not, I can go ahead, but I'll keep only patterns you confirm one by one, and the file will say it came from [N] samples. Proceed, or find more?" With zero samples, ask for at least one. Don't fall back to asking about tone.
- **Samples are the wrong kind** (Slack, email, notes) → "These are a different kind of writing from what the team ships, and they'd teach the wrong habits. Do you have an actual delivered report, RFP response, or strategy doc?"
- **Nothing written yet for this document type** → "There's nothing to learn from yet. Write the first one with CKW, edit it until it reads right, then calibrate on the edited version. Your edits are the signal."
- **Session ends before Step 5** → Nothing is saved and no file changes.

## Design Notes

- This command is conversational because the writer's reactions are the data. An agent working alone would produce rules the writer never saw.
- The method follows the team's solution `derive-rules-from-real-samples-not-specs` (samples, derive privately, validate by output, iterate the rules) and the calibration rules in Every's compound-writing plugin (Katie Parrott / Every, MIT license).
- The 15–30 rule target is lower than the 30–50 in the source solution on purpose. That solution's own agent reached a good result with 18 rules, and a first file should be accurate before it is full.
- `~/.ckw/SYSTEM.md` is not loaded on purpose. It holds one person's preferences, and this command builds the organization's voice from samples (`docs/context-contract.md`, section 2).
- Excerpts are evidence, not a phrase bank (`docs/context-contract.md`, section 6). The paragraph in Step 4 is a test, not a draft that ships.
- Per-writer voice files are out of scope for now. `--for` labels the log only.
