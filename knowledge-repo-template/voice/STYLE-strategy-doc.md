# Style: Strategy Document

<!-- Classification test: a rule that changes wording, sentence construction, or tone goes in VOICE; a rule that changes the claim, support, organization, or readiness standard goes in STYLE; reader knowledge goes in AUDIENCE. Split mixed guidance without duplicating it. -->
<!-- HOW TO USE: Style is what this kind of document must prove, how it is organized, and when it is ready to send. This file covers strategy work for clients and prospects (see AUDIENCE-current-client.md and AUDIENCE-prospect.md). Each gap is marked SLOT in square brackets. -->

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

## Strategy document rules

1. **Every claim carries its evidence type.** Say in the sentence, or a footnote, what kind of support backs it. Starting types (edit to fit your team):
   - **Measured:** our own data, or a result we can show.
   - **Reported:** a platform, vendor, or client report.
   - **Published:** a named outside source.
   - **Assumed:** our judgment, said as judgment.

   Flag "studies show", bare authority, and floating assertions. A claim with no named source or example is not ready.
2. **Keep the original certainty.** A hypothesis stays a hypothesis. Do not turn a suspicion into a diagnosis, or an observation into an intention. A specific unfinished truth beats an elegant false one.
3. **Decisions are recommendations, with the open decision stated.** Write "Our recommendation: X", give the reasoning, then name the decision the reader still has to make. Never write as if the reader has already agreed.
4. **Standard order:** [SLOT: the sections every strategy document contains, in order]

**Ready to send when:** the base checks pass, every claim names its evidence type, no hypothesis reads as a finding, and every recommendation ends with its open decision.

## Confirmed lessons

*Do not turn one-off choices into permanent rules.*

<!-- Add a lesson only after the writer confirms it. Record the mechanism or consequence, with date and source. -->
