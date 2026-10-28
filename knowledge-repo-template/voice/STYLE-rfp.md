# Style: RFP Response

<!-- Classification test: a rule that changes wording, sentence construction, or tone goes in VOICE; a rule that changes the claim, support, organization, or readiness standard goes in STYLE; reader knowledge goes in AUDIENCE. Split mixed guidance without duplicating it. -->
<!-- HOW TO USE: Style is what this kind of document must prove, how it is organized, and when it is ready to send. This file covers RFP responses written for a prospect (see AUDIENCE-prospect.md). Each gap is marked SLOT in square brackets. -->

## Base rules

<!-- Seeded from MPL's de-AI style pass (solution: de-ai-style-pass-client-docs.md). Identical in all three STYLE files: change all three, or use a project override. These sit in STYLE because each is a pass/fail release check, not a matter of taste. -->

Apply these at draft time, not as a cleanup pass. Retrofitting costs a full revision cycle. Check order: structure and support first, the mechanical checks below second, any banned-word list last.

1. **No em-dashes, anywhere.** The most recognizable AI-writing tell, even when used correctly. Use colons, commas, periods, or parentheses. En-dashes in numeric or date ranges (Oct 12–18) are fine, and empty table cells use an en-dash.
2. **No superfluous or flowery language.** Cut rhetorical flourishes, vivid metaphors, punchline sentences, and self-referential scaffolding ("the reasoning follows", "detail in the sections below").
3. **No provenance narration.** Never write "based on our research into..." or "from our conversation on...". State the content directly.
4. **No named individuals.** Documents are addressed to the organization, not a person. Name organizations only (client, agency, vendors). Creator or talent names in ad or file names count as individuals.
5. **Calibrate register against a human-edited sample, not abstract style rules.** Use the Register reference in VOICE.md. Match its structure too: [SLOT: the reference's structural habits, for example bold lead-in paragraphs, numbered sections, a summary table up top].

### Mechanical verification (run before delivering)

```bash
grep -c '—' document.md                    # must be 0
grep -inE 'NAME1|NAME2|NAME3' document.md  # edit: names of everyone in this project; an unedited line proves nothing
```

Docs, Slides, or HTML: extract the text to a file first. A language pass must never move a number, so compare dollar figures before and after:

```bash
grep -oE '\$[0-9][0-9,.]*' original.md | tr -d ',' | sort | uniq -c > /tmp/o.txt
grep -oE '\$[0-9][0-9,.]*' revised.md  | tr -d ',' | sort | uniq -c > /tmp/r.txt
diff /tmp/o.txt /tmp/r.txt   # only intentionally added or removed figures should appear
```

## RFP rules

1. **Requirement IDs are traceable.** Every response section carries the RFP's own requirement ID, in the buyer's numbering. Every ID in the RFP gets an answer, and no ID is invented. Check it against the full RFP text, not a summary:

   ```bash
   grep -oE 'REQ-[0-9]+' rfp-source.md | sort -u > /tmp/rfp-ids.txt   # edit: use the buyer's ID format
   grep -oE 'REQ-[0-9]+' response.md   | sort -u > /tmp/resp-ids.txt
   [ -s /tmp/rfp-ids.txt ] || echo "NOT RUN: no IDs found in the RFP. Fix the pattern to match the buyer's numbering."
   diff /tmp/rfp-ids.txt /tmp/resp-ids.txt   # "<" = requirement with no answer, ">" = ID the RFP never used
   ```

   The check proves an ID appears, not that it is answered: read the section under each ID. If you don't have the full RFP text (a reviewer working from summaries doesn't), or the pattern found no IDs, the check has not run. Say "ID check not run" and why. Never report it as passed.
2. **Compliance first.** Answer each requirement as asked, in the buyer's order, before adding anything of ours. Win themes support a direct answer. They never replace one.
3. **Win themes carry proof.** Each theme names the evidence behind it and the requirement IDs where it shows up. Themes that hold across all our RFPs go here. Themes for one RFP go in that project's own `voice/STYLE-rfp.md`.

   | Win theme | Proof (evidence type + source) | Where it is answered (requirement IDs) |
   |-----------|--------------------------------|----------------------------------------|
   | [SLOT: theme, one sentence] | [SLOT: proof] | [SLOT: IDs] |
   | [SLOT: theme, one sentence] | [SLOT: proof] | [SLOT: IDs] |
   | [SLOT: theme, one sentence] | [SLOT: proof] | [SLOT: IDs] |

**Ready to send when:** the base checks pass, the ID check ran on the full RFP text, found the buyer's IDs, and shows no unanswered requirement, each requirement is answered directly before any differentiator, and every win theme names its proof.

## Confirmed lessons

*Do not turn one-off choices into permanent rules.*

<!-- Add a lesson only after the writer confirms it. Record the mechanism or consequence, with date and source. -->
